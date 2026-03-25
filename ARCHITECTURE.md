# Medinova — Architecture

**Type:** Multi-tenant SaaS EHR platform
**Stack:** NestJS 11 + Next.js 15 + Drizzle ORM + PostgreSQL 16

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  Next.js Web App    Patient Mobile App    WP Connector       │
│  (staff portal)     (React Native, P4)   (optional, P5)     │
└──────────────┬─────────────┬──────────────┬─────────────────┘
               │             │              │
               ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS CloudFront (CDN)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS Application Load Balancer              │
└──────────────────────────┬──────────────────────────────────┘
                           │
               ┌───────────┴───────────┐
               ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│   NestJS API          │  │   Next.js Frontend    │
│   (ECS Fargate)       │  │   (Vercel or ECS)     │
│                       │  │                       │
│   • Auth + RBAC       │  │   • App Router        │
│   • Business logic    │  │   • Server Components │
│   • Encryption        │  │   • shadcn/ui + Tremor│
│   • Audit logging     │  │   • next-intl (i18n)  │
│   • ts-rest server    │  │   • ts-rest client    │
└───────┬───────────────┘  └───────────────────────┘
        │
        ├──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ PostgreSQL   │ │  Redis   │ │ BullMQ   │ │ AWS S3       │
│ (RDS)        │ │ (Elasti- │ │ (queues) │ │ (files)      │
│              │ │  Cache)  │ │          │ │              │
│ Schema-per-  │ │ • Cache  │ │ • SMS    │ │ • Documents  │
│ tenant       │ │ • Session│ │ • Email  │ │ • Photos     │
│ isolation    │ │ • Rate   │ │ • Reports│ │ • Exports    │
│              │ │   limit  │ │ • Imports│ │              │
└──────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

---

## 2. Technology Choices

| Layer | Technology | Why |
|---|---|---|
| **Backend framework** | NestJS 11 | Enterprise-grade, modular, TypeScript-native, dependency injection, Guards/Interceptors for auth/audit |
| **Frontend framework** | Next.js 15 | App Router, Server Components, SSR for SEO, PWA support |
| **API contract** | ts-rest | Type-safe contracts shared between frontend and backend. Single source of truth for API types |
| **ORM** | Drizzle | TypeScript-first, SQL-like query builder, excellent migration support, lighter than TypeORM/Prisma |
| **Database** | PostgreSQL 16 | Schema-per-tenant multi-tenancy, JSONB, full-text search, row-level security, proven in healthcare |
| **Cache** | Redis (ElastiCache) | Session storage, rate limiting, query caching, pub/sub for real-time |
| **Queue** | BullMQ | Async job processing (SMS, email, report generation, data import). Redis-backed |
| **UI components** | shadcn/ui + Tremor | shadcn/ui for forms/navigation (accessible, customisable). Tremor for dashboard charts/analytics |
| **Auth** | Custom JWT + WebAuthn | JWT access (15 min) + refresh (7 day) + WebAuthn passkeys. No third-party auth provider dependency |
| **AI** | Claude via AWS Bedrock | BAA available for HIPAA alignment. Used for Shifa Bot (admin-assist only) |
| **i18n** | next-intl + NestJS i18n | 10+ languages from launch. Each language = 1 JSON file (~1 hour to add) |
| **Hosting** | AWS (ECS Fargate + RDS) | Enterprise credibility, BAA available, NHS-grade infrastructure |
| **CI/CD** | GitHub Actions | Lint → type-check → test → deploy. Automated on PR merge |
| **Monitoring** | Sentry + PostHog | Sentry for errors (no PHI in reports). PostHog self-hosted for analytics |

---

## 3. Multi-Tenancy — Schema-per-Tenant

### Design

Each clinic (tenant) gets its own PostgreSQL schema. A shared `public` schema holds cross-tenant data.

```
PostgreSQL Database: medinova
├── public (shared)
│   ├── tenants        — clinic registrations
│   ├── users          — all user accounts
│   ├── roles          — 27 medical role definitions
│   ├── permissions    — permission catalogue
│   └── user_tenants   — user ↔ tenant assignments
│
├── tenant_abc123 (Clinic A)
│   ├── patients
│   ├── appointments
│   ├── encounters
│   └── ... (16 tables)
│
├── tenant_def456 (Clinic B)
│   ├── patients
│   ├── appointments
│   ├── encounters
│   └── ... (16 tables)
│
└── tenant_ghi789 (Clinic C)
    └── ...
```

### Request Lifecycle

```
1. Request arrives with JWT Bearer token
2. JwtAuthGuard validates token, extracts userId + tenantId
3. TenantMiddleware runs: SET search_path TO tenant_{tenantId}, public
4. TenantGuard verifies user belongs to this tenant (user_tenants table)
5. Controller + Service execute (Drizzle queries hit tenant schema)
6. AuditInterceptor logs the access to tenant's audit_logs table
7. Response returned
```

### Tenant Provisioning

When a new clinic registers:
1. Create record in `public.tenants`
2. Create PostgreSQL schema: `CREATE SCHEMA tenant_{id}`
3. Run Drizzle migrations against new schema (creates all 16 tables)
4. Seed default data (27 roles, default settings)
5. Create admin user in `public.users` + `public.user_tenants`

### Why Schema-per-Tenant (not Row-Level Security)

| Factor | Schema-per-Tenant | Row-Level Security |
|---|---|---|
| **Data isolation** | Physical separation. Impossible to query wrong tenant | Logical separation. Policy misconfiguration = data leak |
| **Compliance** | Easy to demonstrate isolation for auditors | Harder to prove isolation |
| **Backup/restore** | Per-tenant backup possible | Whole database only |
| **Performance** | Smaller indexes per tenant | Larger shared indexes |
| **Complexity** | Schema management overhead | Simpler setup, harder debugging |

For healthcare data, the physical isolation guarantee is worth the schema management overhead.

---

## 4. Module Architecture (NestJS)

### Core Modules (cross-cutting)

```
CoreModule
├── ConfigModule        — Zod-validated environment variables
├── DatabaseModule      — Drizzle client, tenant schema switching
├── AuthModule          — JWT strategy, Guards (JwtAuth, Roles, Tenant)
├── EncryptionModule    — AES-256-GCM for PHI fields
├── AuditModule         — Interceptor that logs all data access
└── CommonModule        — Exception filters, validation pipes, response transform
```

### Business Modules (MVP)

```
TenantModule           — Clinic setup, settings, subscription management
PatientModule          — CRUD, encrypted search, demographics
AppointmentModule      — Scheduling, availability, status workflow
EncounterModule        — Clinical documentation, SOAP, vitals
PrescriptionModule     — E-prescribing, drug interactions, ICD-11
CommunicationModule    — Secure messaging, SMS/email notifications
GdprModule             — Consent management, data export/deletion
ImportModule           — CSV/FHIR import wizard
```

### Job Modules (async)

```
JobsModule
├── ReminderProcessor   — SMS/email appointment reminders (BullMQ)
├── ExportProcessor     — GDPR data export (async, large datasets)
└── ImportProcessor     — CSV/FHIR import (async, progress tracking)
```

### Module Dependencies

```
                    CoreModule
                   /    |     \
                  /     |      \
    TenantModule  AuthModule  EncryptionModule
         |              |            |
         ├── PatientModule ──────────┘
         │        |
         │   EncounterModule ── PrescriptionModule
         │        |
         │   AppointmentModule
         │
         ├── CommunicationModule
         ├── GdprModule
         └── ImportModule
```

---

## 5. Authentication Flow

```
Login (email/password):
  Client → POST /auth/login → AuthService.validateUser()
    → bcrypt.compare(password, hash)
    → Generate JWT (15 min) + Refresh Token (7 days, stored in Redis)
    → Return both tokens

Token Refresh:
  Client → POST /auth/refresh (with refresh token)
    → Validate refresh token exists in Redis
    → Delete old refresh token (single-use)
    → Generate new JWT + new Refresh Token
    → Return both

WebAuthn (passkey):
  Registration:
    Client → POST /auth/webauthn/register/begin → Generate challenge
    Client authenticates with device → POST /auth/webauthn/register/complete
    → Store credential in users.webauthn_credentials

  Authentication:
    Client → POST /auth/webauthn/authenticate/begin → Generate challenge
    Client authenticates with device → POST /auth/webauthn/authenticate/complete
    → Verify credential → Generate JWT + Refresh Token
```

---

## 6. Encryption Architecture

### PHI Fields (AES-256-GCM)

```
Encrypt (before storage):
  plaintext → AES-256-GCM(key, iv, aad) → ciphertext + authTag
  Store: iv + authTag + ciphertext as bytea

Decrypt (on read):
  bytea → extract iv + authTag + ciphertext
  → AES-256-GCM.decrypt(key, iv, ciphertext, authTag, aad)
  → plaintext
```

### Key Management

- **Per-tenant encryption keys** stored in AWS KMS
- Key rotation: annual (configurable per compliance requirement)
- Key hierarchy: Master Key (KMS) → Tenant Data Key (envelope encryption)
- Data keys cached in memory for performance, refreshed hourly

### Searchable Encryption (Blind Index)

For encrypted fields that need to be searchable (patient names):

```
plaintext → HMAC-SHA256(searchKey, lowercase(plaintext)) → blind_index
Store blind_index as varchar(64) alongside encrypted field
Search: HMAC(query) → match against blind_index column
```

---

## 7. Offline Strategy

### MVP (PWA)

- Service Worker caches static assets + recent API responses
- IndexedDB stores working data for offline access
- Sync queue: offline mutations queued and replayed when online
- Connectivity banner shows online/offline/syncing status

### Future (SQLite WASM via OPFS)

- Full SQL database in the browser (350MB+ capacity vs IndexedDB ~50MB)
- Complex medical queries work offline
- CRDTs for conflict-free sync when connectivity returns
- Replaces IndexedDB when browser support matures

---

## 8. Deployment Architecture

### Production (AWS)

```
Route 53 (DNS)
  └── CloudFront (CDN + WAF)
        ├── /api/* → ALB → ECS Fargate (NestJS)
        │                    ├── Task 1 (0.5 vCPU, 1GB)
        │                    └── Task 2 (auto-scale)
        └── /* → Vercel (Next.js)

ECS Fargate → RDS PostgreSQL (t3.micro, encrypted, Multi-AZ in production)
           → ElastiCache Redis (t3.micro)
           → S3 (documents, exports, backups)
           → SES (transactional email)
           → Secrets Manager (API keys, encryption keys)
```

### Local Development

```
docker-compose.yml:
  - PostgreSQL 16 (port 5432)
  - Redis 7 (port 6379)

pnpm dev:
  - apps/api on port 3001
  - apps/web on port 3000
```

### CI/CD Pipeline

```
PR opened:
  → Lint (ESLint + Prettier)
  → Type check (tsc --noEmit)
  → Unit tests (Jest)
  → E2E tests (Supertest against test DB)
  → Build check

Merge to main:
  → All above
  → Build Docker image
  → Push to ECR
  → Deploy to staging (ECS)
  → Run smoke tests

Release tag:
  → Deploy to production (ECS blue/green)
  → Run smoke tests
  → Monitor for 15 min
  → Promote or rollback
```

---

## 9. Cost Estimate (MVP)

| Service | Spec | Monthly Cost |
|---|---|---|
| ECS Fargate | 0.5 vCPU, 1GB, 2 tasks | ~£30 |
| RDS PostgreSQL | t3.micro, 20GB, encrypted | ~£15 |
| ElastiCache Redis | t3.micro | ~£12 |
| S3 | 10GB storage + transfers | ~£2 |
| CloudFront | 100GB transfer | ~£10 |
| SES | 1000 emails/month | ~£1 |
| Secrets Manager | 10 secrets | ~£4 |
| Route 53 | 1 hosted zone | ~£1 |
| **Total** | | **~£75/month** |

Scales to ~£150/month at 10 tenants. Budget cap: £150/month until revenue covers it.

---

## 10. ADR Summary (Carried Forward)

These architectural decisions from the WP era remain valid:

| ADR | Decision | Still Valid |
|---|---|---|
| ADR-001 | Custom tables, not ORM defaults | Yes — Drizzle with explicit schemas |
| ADR-002 | Mollie for payments, not Stripe | Yes — 38% lower fees, ethical choice |
| ADR-004 | AES-256 encrypted messaging | Yes — same encryption approach |
| ADR-005 | FEFO for pharmacy inventory | Yes — domain logic unchanged |
| ADR-006 | Jitsi for video, 360p/15fps | Yes — low-bandwidth optimisation unchanged |

**Retired ADRs:**
- ADR-003 (GridStack dashboard) — will evaluate React alternatives
