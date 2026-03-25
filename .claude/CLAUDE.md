# Medinova — Project Instructions

**Last Updated:** 24 March 2026
**Product:** Medinova (standalone SaaS EHR platform)
**AI Assistant:** Shifa Bot
**Charity Brand:** HelpingDoctors.org

---

## Project Overview

**Type:** Multi-tenant SaaS (NestJS + Next.js + PostgreSQL)
**Primary Market:** UK independent clinics (commercial, revenue-generating)
**Secondary Market:** Humanitarian clinics (funded by commercial revenue + grants)
**Architecture:** Standalone on AWS. Patient data never lives on WordPress

### Mission

Deliver Epic-quality EHR at SME prices. Enable healthcare workers in UK clinics and crisis zones to manage patient records securely, affordably, and offline-capable.

### Design Principles

1. **Security-first** — AES-256-GCM encryption, schema-per-tenant isolation, comprehensive audit trail
2. **Offline-capable** — PWA for staff, native app for patients (Phase 4)
3. **Mobile-first** — 44px touch targets, responsive, low-bandwidth optimised
4. **Multi-language** — i18n from day 1, 10+ languages via JSON translation files
5. **Commercial-grade UX** — No WP fingerprint. Feels like a purpose-built SaaS
6. **GDPR + HIPAA aligned** — UK DPA 2018 compliance built into every module
7. **Accessibility** — WCAG 2.2 AA, skip links, ARIA, keyboard navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11 + TypeScript |
| Frontend | Next.js 15 + shadcn/ui + Tremor |
| Database | PostgreSQL 16 (schema-per-tenant) |
| ORM | Drizzle |
| API contract | ts-rest (shared types) |
| Cache | Redis (ElastiCache) |
| Queue | BullMQ |
| Auth | JWT + refresh tokens + WebAuthn passkeys |
| AI | Claude via AWS Bedrock (BAA available) |
| Hosting | AWS ECS Fargate + RDS + S3 + CloudFront |
| CI/CD | GitHub Actions |
| i18n | next-intl (frontend) + NestJS i18n (backend) |
| Monitoring | Sentry (errors) + PostHog (analytics, self-hosted) |
| Package manager | pnpm workspaces |

---

## 8-Module MVP

| # | Module | Purpose |
|---|---|---|
| 1 | **Auth + Tenant** | JWT, WebAuthn, schema-per-tenant, 27 RBAC roles |
| 2 | **Patient** | CRUD, encrypted PHI, MRN generation, blind index search |
| 3 | **Appointment** | Calendar, availability, booking, SMS reminders |
| 4 | **Encounter + Prescription** | SOAP notes, ICD-11, vitals, drug interactions, e-prescribing |
| 5 | **Communications** | Encrypted messaging, SMS/email via Twilio/SES |
| 6 | **Audit + Security** | Audit trail, encryption service, rate limiting |
| 7 | **GDPR** | Consent management, data export/deletion, breach tracking |
| 8 | **Data Import** | CSV/FHIR import wizard, duplicate detection |

---

## 27 Medical Roles (13 Template Groups)

| # | Template Group | Roles |
|---|---|---|
| 1 | Executive | org_owner, system_admin, medical_director |
| 2 | Clinic Management | clinic_admin |
| 3 | Physician Core | physician, surgeon, nurse_practitioner, physician_assistant |
| 4 | Emergency | emergency_physician, emergency_responder |
| 5 | Nursing | registered_nurse, lpn, medical_assistant |
| 6 | Pharmacy | pharmacist, pharmacy_tech |
| 7 | Laboratory | lab_director, lab_technician |
| 8 | Imaging | radiologic_tech |
| 9 | Therapy | physical_therapist, mental_health, social_worker |
| 10 | Administrative | billing_specialist, medical_records |
| 11 | Front Desk | receptionist |
| 12 | Patient Portal | patient |
| 13 | Humanitarian | volunteer |

Implemented via NestJS RBAC Guards, not a third-party plugin.

---

## Monorepo Structure

```
medinova/
├── apps/
│   ├── api/              # NestJS backend
│   └── web/              # Next.js frontend
├── packages/
│   ├── contracts/        # ts-rest API contracts (shared types)
│   ├── db/               # Drizzle schema + migrations
│   ├── ui/               # Shared React components
│   └── config/           # Shared ESLint, TS, Prettier configs
├── tools/scripts/        # DB seed, tenant provisioning
└── docs/                 # Architecture, compliance
```

Full details: [FILE-MAP.md](FILE-MAP.md)

---

## Database — Schema-per-Tenant

Each clinic gets its own PostgreSQL schema. Shared `public` schema for users/tenants/roles.

- **22 MVP tables** (6 shared + 16 per-tenant)
- **Soft delete** on all patient data (never hard delete medical records)
- **AES-256-GCM** encryption for PHI fields (stored as `bytea`)
- **Blind indexes** (HMAC-SHA256) for searchable encrypted fields
- **UUIDv7** primary keys (time-sortable)

Full schema: [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)

---

## API — 65 Endpoints

ts-rest contracts shared between frontend and backend. JWT Bearer auth on all endpoints except login/register.

Key patterns:
- **Pagination:** `{ data: T[], pagination: { page, limit, total, totalPages } }`
- **Errors:** `{ statusCode, message, error?, details? }`
- **Audit:** All PHI access auto-logged via NestJS AuditInterceptor

Full reference: [API-REFERENCE.md](API-REFERENCE.md)

---

## Security — Non-Negotiable

- AES-256-GCM for all PHI at rest (per-tenant keys via AWS KMS)
- bcrypt (cost 12) for password hashing
- JWT access tokens: 15 min expiry. Refresh tokens: 7 days, single-use
- Schema-per-tenant database isolation
- Rate limiting: 100 req/min user, 20 req/min auth
- HTTPS only (HSTS). CSP headers on all responses
- No patient data in error messages or logs
- All user input sanitised (XSS prevention)
- Prepared statements always (Drizzle handles this)

Full details: [COMPLIANCE.md](COMPLIANCE.md)

---

## Development Workflow

### Always Do First

1. Read the relevant reference doc before making changes:
   - [ARCHITECTURE.md](ARCHITECTURE.md) — system design, module structure
   - [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md) — table definitions
   - [API-REFERENCE.md](API-REFERENCE.md) — endpoint contracts
   - [CODING-STANDARDS.md](CODING-STANDARDS.md) — TypeScript/NestJS rules
   - [COMPLIANCE.md](COMPLIANCE.md) — GDPR, HIPAA, DTAC requirements
2. Check existing Drizzle schema before adding database logic
3. Never modify existing database columns without a migration

### TDD Mandatory

```
1. Write failing test
2. Run test (confirm red)
3. Write minimum code to pass
4. Run test (confirm green)
5. Refactor
6. Run all tests (confirm nothing broke)
```

### Code Quality

- Zero `any` policy — strict TypeScript
- Zod for all external data validation
- Drizzle for all database queries (no raw SQL interpolation)
- Controllers are thin — business logic in services
- NestJS Guards for auth, Interceptors for audit
- UK English in all user-facing strings
- File length limits: service 300 lines, controller 200, component 250

Full standards: [CODING-STANDARDS.md](CODING-STANDARDS.md)

### Deployment

GitHub Actions CI/CD → AWS ECS Fargate. No SFTP. No manual uploads.

```
PR: lint → type-check → test → build
Merge to main: all above → Docker build → push ECR → deploy staging
Release tag: deploy production (blue/green)
```

---

## ADHD Workflow Support (Critical)

**After ANY file changes:** List files with full paths, wait for confirmation, one at a time.

**Interrupt directly when you spot:**
- Minor details that won't affect outcome
- Edge cases before core works
- Perfectionism spirals or design tweaking

> "This won't make a real difference. Let's focus on [critical task] instead."

**Brain dumps:** Structure first, confirm understanding, then respond.

---

## Naming

| Entity | Name | Notes |
|---|---|---|
| Product | **Medinova** | Never "HelpingDoctors" for the SaaS |
| AI assistant | **Shifa Bot** | Never "Shafi" or "Shafa" |
| Charity | **HelpingDoctors.org** | Humanitarian deployments |

---

## Hard Rules

- **No placeholders, no TODOs** in committed code
- **Research first** — check best practices before non-trivial implementations
- **Fix comprehensively** — search entire codebase for same pattern, fix ALL instances
- **WCAG 2.2 AA** — 44px touch targets, 4.5:1 contrast, keyboard navigation
- **No assumptions** — if uncertain, ask
- **Large files** — grep for relevant sections, don't read files over 300 lines in full
- **Halal financing only** — never suggest interest-bearing loans (riba is haram)
- **Commercial first** — no charity without revenue or grant funding
- **Quality > speed** — OpenClaw builds 24/7, the constraint is quality not time

---

## Competitive Context

- **KiviCare:** 3 CVEs in 15 months (CVSS 9.8). No encryption, no DTAC. Our differentiator: security-first
- **Carepatron:** AI Copilot but solo mental health focus. We do 27 roles, multi-specialty
- **Epic/Oracle:** Enterprise (£1M+). We target SME (£79-1800/month)
- **Ambient AI is table stakes.** Our edge is workflow UX, affordability, offline, security

---

## Reference Documents

| Document | Purpose |
|---|---|
| [STRATEGIC-PLAN.md](STRATEGIC-PLAN.md) | Master strategy: MVP, phases, pricing, competition, risks |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, layer diagram, multi-tenancy, deployment |
| [FILE-MAP.md](FILE-MAP.md) | Complete monorepo directory structure |
| [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md) | 22 MVP tables with columns, types, constraints |
| [API-REFERENCE.md](API-REFERENCE.md) | 65 REST endpoints with request/response schemas |
| [CODING-STANDARDS.md](CODING-STANDARDS.md) | TypeScript, NestJS, testing, security rules |
| [COMPLIANCE.md](COMPLIANCE.md) | GDPR, HIPAA, DTAC, DCB0129, MHRA requirements |

---

## WP Codebase (Reference Only)

The existing WordPress plugin at `public_html/wp-content/plugins/helpingdoctors-ehr-pro/` contains:
- 78+ database table definitions (mined into DATABASE-SCHEMA.md)
- 500+ AJAX handlers (business logic to reference, not to port)
- Encryption patterns (AES-256-GCM approach carried forward)
- 53 dashboard widget definitions (UI requirements to reference)

**Do NOT build on the WP codebase.** Mine it for business logic and domain knowledge. All new code targets the NestJS + Next.js monorepo.
