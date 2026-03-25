# Medinova — Monorepo File Map

**Stack:** NestJS 11 + Next.js 15 + Drizzle ORM + PostgreSQL 16
**Package manager:** pnpm workspaces
**Repository:** github.com/SmallGiantsStudio/medinova (TBC)

---

## Root Structure

```
medinova/
├── apps/
│   ├── api/                    # NestJS backend
│   └── web/                    # Next.js frontend
├── packages/
│   ├── contracts/              # ts-rest API contracts (shared types)
│   ├── db/                     # Drizzle schema + migrations
│   ├── ui/                     # Shared React components (shadcn/ui)
│   └── config/                 # Shared ESLint, TypeScript, Prettier configs
├── tools/
│   └── scripts/                # DB seed, tenant provisioning, migration helpers
├── docs/                       # Architecture, compliance, API reference
├── .github/
│   └── workflows/              # CI/CD pipelines
├── pnpm-workspace.yaml
├── turbo.json                  # Turborepo build orchestration
├── tsconfig.base.json          # Shared TypeScript config
├── .env.example
└── docker-compose.yml          # Local dev (PostgreSQL + Redis)
```

---

## apps/api/ — NestJS Backend

```
apps/api/
├── src/
│   ├── main.ts                         # Bootstrap, Fastify adapter
│   ├── app.module.ts                   # Root module
│   │
│   ├── core/                           # Cross-cutting concerns
│   │   ├── core.module.ts
│   │   ├── config/
│   │   │   ├── config.module.ts
│   │   │   ├── app.config.ts           # Zod-validated env vars
│   │   │   └── database.config.ts
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   ├── database.service.ts     # Drizzle connection + tenant schema switching
│   │   │   └── tenant.middleware.ts    # Extract tenant from JWT, set search_path
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts      # Login, logout, refresh, WebAuthn
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts      # RBAC based on 27 medical roles
│   │   │   │   └── tenant.guard.ts     # Verify user belongs to tenant
│   │   │   └── decorators/
│   │   │       ├── roles.decorator.ts
│   │   │       ├── current-user.decorator.ts
│   │   │       └── current-tenant.decorator.ts
│   │   ├── encryption/
│   │   │   ├── encryption.module.ts
│   │   │   └── encryption.service.ts   # AES-256-GCM for PHI
│   │   ├── audit/
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.interceptor.ts    # Auto-log all data access
│   │   │   └── audit.service.ts
│   │   └── common/
│   │       ├── filters/
│   │       │   └── http-exception.filter.ts
│   │       ├── interceptors/
│   │       │   ├── logging.interceptor.ts
│   │       │   └── transform.interceptor.ts
│   │       ├── pipes/
│   │       │   └── validation.pipe.ts
│   │       └── dto/
│   │           ├── pagination.dto.ts
│   │           └── api-response.dto.ts
│   │
│   ├── modules/                        # Business domain modules
│   │   ├── tenant/
│   │   │   ├── tenant.module.ts
│   │   │   ├── tenant.controller.ts    # Clinic setup, tenant provisioning
│   │   │   ├── tenant.service.ts
│   │   │   └── tenant.repository.ts
│   │   │
│   │   ├── patient/
│   │   │   ├── patient.module.ts
│   │   │   ├── patient.controller.ts   # CRUD, search, demographics
│   │   │   ├── patient.service.ts
│   │   │   ├── patient.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-patient.dto.ts
│   │   │       ├── update-patient.dto.ts
│   │   │       └── search-patient.dto.ts
│   │   │
│   │   ├── appointment/
│   │   │   ├── appointment.module.ts
│   │   │   ├── appointment.controller.ts
│   │   │   ├── appointment.service.ts
│   │   │   ├── appointment.repository.ts
│   │   │   ├── availability.service.ts  # Provider schedule + slot calculation
│   │   │   └── dto/
│   │   │       ├── create-appointment.dto.ts
│   │   │       └── booking.dto.ts
│   │   │
│   │   ├── encounter/
│   │   │   ├── encounter.module.ts
│   │   │   ├── encounter.controller.ts  # Clinical documentation
│   │   │   ├── encounter.service.ts
│   │   │   ├── encounter.repository.ts
│   │   │   ├── vitals.service.ts
│   │   │   └── dto/
│   │   │       └── create-encounter.dto.ts
│   │   │
│   │   ├── prescription/
│   │   │   ├── prescription.module.ts
│   │   │   ├── prescription.controller.ts
│   │   │   ├── prescription.service.ts
│   │   │   ├── prescription.repository.ts
│   │   │   ├── drug-interaction.service.ts  # FDA API
│   │   │   └── icd11.service.ts            # WHO ICD-11 API
│   │   │
│   │   ├── communication/
│   │   │   ├── communication.module.ts
│   │   │   ├── message.controller.ts    # Secure messaging
│   │   │   ├── message.service.ts
│   │   │   ├── notification.service.ts  # SMS/email dispatch
│   │   │   ├── twilio.provider.ts       # SMS via Twilio
│   │   │   └── ses.provider.ts          # Email via AWS SES
│   │   │
│   │   ├── gdpr/
│   │   │   ├── gdpr.module.ts
│   │   │   ├── gdpr.controller.ts       # Consent, export, deletion
│   │   │   ├── consent.service.ts
│   │   │   ├── data-export.service.ts
│   │   │   └── data-deletion.service.ts
│   │   │
│   │   └── import/
│   │       ├── import.module.ts
│   │       ├── import.controller.ts     # CSV/FHIR import endpoints
│   │       ├── csv-import.service.ts
│   │       ├── fhir-import.service.ts
│   │       └── duplicate-detector.service.ts
│   │
│   └── jobs/                           # BullMQ async processors
│       ├── jobs.module.ts
│       ├── reminder.processor.ts       # SMS/email appointment reminders
│       ├── export.processor.ts         # GDPR data export (async)
│       └── audit-cleanup.processor.ts  # Old audit log archival
│
├── test/
│   ├── jest.config.ts
│   ├── setup.ts                        # Test database, tenant provisioning
│   ├── factories/                      # Test data factories
│   │   ├── patient.factory.ts
│   │   ├── appointment.factory.ts
│   │   └── user.factory.ts
│   └── e2e/
│       ├── auth.e2e-spec.ts
│       ├── patient.e2e-spec.ts
│       └── appointment.e2e-spec.ts
│
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## apps/web/ — Next.js Frontend

```
apps/web/
├── src/
│   ├── app/                            # App Router
│   │   ├── layout.tsx                  # Root layout (providers, i18n)
│   │   ├── page.tsx                    # Marketing landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx              # Auth layout (no sidebar)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Dashboard shell (sidebar, header, role nav)
│   │   │   ├── page.tsx                # Role-based dashboard
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx            # Patient list
│   │   │   │   ├── [id]/page.tsx       # Patient detail
│   │   │   │   └── new/page.tsx        # Create patient
│   │   │   ├── appointments/
│   │   │   │   ├── page.tsx            # Calendar view
│   │   │   │   └── new/page.tsx        # Book appointment
│   │   │   ├── encounters/
│   │   │   │   ├── page.tsx            # Encounter list
│   │   │   │   └── [id]/page.tsx       # Encounter detail (SOAP)
│   │   │   ├── prescriptions/
│   │   │   │   ├── page.tsx            # Prescription list
│   │   │   │   └── new/page.tsx        # Create prescription
│   │   │   ├── messages/
│   │   │   │   └── page.tsx            # Secure messaging
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx            # Clinic settings
│   │   │   │   ├── profile/page.tsx    # User profile
│   │   │   │   └── gdpr/page.tsx       # Privacy controls
│   │   │   ├── import/
│   │   │   │   └── page.tsx            # Data import wizard
│   │   │   └── audit/
│   │   │       └── page.tsx            # Audit log viewer
│   │   └── api/                        # Next.js API routes (auth callbacks only)
│   │       └── auth/[...nextauth]/route.ts
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── role-nav.tsx
│   │   ├── patients/
│   │   │   ├── patient-table.tsx
│   │   │   ├── patient-form.tsx
│   │   │   └── patient-search.tsx
│   │   ├── appointments/
│   │   │   ├── calendar.tsx
│   │   │   ├── booking-wizard.tsx
│   │   │   └── slot-picker.tsx
│   │   ├── encounters/
│   │   │   ├── soap-form.tsx
│   │   │   ├── vitals-input.tsx
│   │   │   └── icd11-search.tsx
│   │   ├── prescriptions/
│   │   │   ├── prescription-form.tsx
│   │   │   └── drug-interaction-alert.tsx
│   │   └── dashboard/
│   │       ├── widget-grid.tsx         # GridStack or similar
│   │       └── widgets/               # 53 widget components
│   │
│   ├── lib/
│   │   ├── api-client.ts              # ts-rest client initialisation
│   │   ├── auth.ts                    # NextAuth config
│   │   └── utils.ts                   # Shared utilities
│   │
│   ├── hooks/
│   │   ├── use-patient.ts
│   │   ├── use-appointments.ts
│   │   └── use-auth.ts
│   │
│   ├── i18n/
│   │   ├── request.ts                 # next-intl server config
│   │   └── messages/
│   │       ├── en.json
│   │       ├── ar.json
│   │       ├── fr.json
│   │       └── ur.json
│   │
│   └── styles/
│       └── globals.css                # Tailwind + custom tokens
│
├── public/
│   ├── sw.js                          # Service worker (offline)
│   └── manifest.json                  # PWA manifest
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## packages/contracts/ — ts-rest API Contracts

```
packages/contracts/
├── src/
│   ├── index.ts                       # Re-exports all contracts
│   ├── auth.contract.ts               # Auth endpoints
│   ├── patient.contract.ts            # Patient CRUD
│   ├── appointment.contract.ts        # Appointment endpoints
│   ├── encounter.contract.ts          # Encounter endpoints
│   ├── prescription.contract.ts       # Prescription endpoints
│   ├── communication.contract.ts      # Messaging endpoints
│   ├── gdpr.contract.ts              # GDPR endpoints
│   ├── import.contract.ts            # Data import endpoints
│   ├── audit.contract.ts             # Audit log endpoints
│   └── tenant.contract.ts            # Tenant/clinic management
├── tsconfig.json
└── package.json
```

---

## packages/db/ — Drizzle Schema + Migrations

```
packages/db/
├── src/
│   ├── index.ts                       # Re-exports
│   ├── client.ts                      # Drizzle client factory
│   ├── schema/
│   │   ├── public/                    # Shared schema (all tenants)
│   │   │   ├── tenants.ts
│   │   │   ├── users.ts
│   │   │   └── roles.ts
│   │   └── tenant/                    # Per-tenant schema
│   │       ├── patients.ts
│   │       ├── appointments.ts
│   │       ├── encounters.ts
│   │       ├── prescriptions.ts
│   │       ├── messages.ts
│   │       ├── audit-logs.ts
│   │       ├── gdpr-consents.ts
│   │       ├── gdpr-requests.ts
│   │       ├── notifications.ts
│   │       ├── staff-schedules.ts
│   │       ├── vital-signs.ts
│   │       ├── diagnoses.ts
│   │       ├── medications.ts
│   │       ├── documents.ts
│   │       └── import-logs.ts
│   └── seed/
│       ├── roles.seed.ts              # 27 medical roles
│       ├── icd11-cache.seed.ts        # Common ICD-11 codes for offline
│       └── demo-tenant.seed.ts        # Demo data for development
├── drizzle.config.ts
├── migrations/                        # Auto-generated by Drizzle Kit
├── tsconfig.json
└── package.json
```

---

## packages/ui/ — Shared React Components

```
packages/ui/
├── src/
│   ├── index.ts
│   ├── components/                    # Reusable across apps
│   │   ├── data-table.tsx
│   │   ├── form-builder.tsx
│   │   ├── date-picker.tsx
│   │   └── file-upload.tsx
│   └── themes/
│       └── medinova.ts                # Design tokens
├── tsconfig.json
└── package.json
```

---

## packages/config/ — Shared Configs

```
packages/config/
├── eslint/
│   └── base.js
├── typescript/
│   └── base.json
├── prettier/
│   └── index.js
└── package.json
```

---

## tools/scripts/

```
tools/scripts/
├── create-tenant.ts                   # Provision new tenant schema
├── seed-db.ts                         # Seed development data
├── migrate.ts                         # Run Drizzle migrations
└── generate-openapi.ts                # Generate OpenAPI spec from ts-rest
```

---

## .github/workflows/

```
.github/workflows/
├── ci.yml                             # Lint, type-check, test on PR
├── deploy-staging.yml                 # Deploy to staging on merge to develop
└── deploy-production.yml              # Deploy to production on release tag
```

---

## Key Conventions

| Convention | Rule |
|---|---|
| Module naming | `kebab-case` directories, `PascalCase` classes |
| File naming | `kebab-case.type.ts` (e.g., `patient.service.ts`) |
| Imports | Path aliases: `@medinova/contracts`, `@medinova/db`, `@medinova/ui` |
| Tests | Co-located `*.spec.ts` for unit tests, `test/e2e/` for integration |
| Env vars | Validated via Zod in `app.config.ts`. Never accessed directly |
| i18n keys | Dot-notation: `patients.form.firstName`, `appointments.status.confirmed` |
