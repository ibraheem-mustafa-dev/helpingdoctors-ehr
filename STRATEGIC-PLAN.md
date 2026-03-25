# Medinova — Strategic Plan

**Date:** 24 March 2026
**Owner:** Bean (Ibraheem), Small Giants Studio Ltd
**Product:** Medinova (standalone SaaS EHR platform)
**AI Assistant:** Shifa Bot
**Charity Brand:** HelpingDoctors.org

---

## 1. Goal

Ship a production-grade EHR SaaS that UK independent clinics pay for within 90 days. Use that revenue (plus grant funding) to deploy free instances for humanitarian clinics.

**Done means:** One UK clinic on a paid plan. DTAC self-assessment submitted. SBRI grant application in progress. Architecture supports 100+ tenants without rework.

---

## 2. Product Identity

| | Name | Purpose |
|---|---|---|
| **Product** | Medinova | Standalone SaaS EHR platform |
| **AI** | Shifa Bot | Admin-assist chatbot (FAQ, booking, reminders). No clinical decisions |
| **Charity** | HelpingDoctors.org | Humanitarian deployments funded by commercial revenue |

**Tagline:** Epic-quality EHR at SME prices. Built for clinics that matter.

---

## 3. Architecture Decision

**FINAL: Standalone SaaS on AWS.** WordPress is an optional frontend connector only. Patient data never lives on a WordPress server.

| Layer | Technology |
|---|---|
| Backend | NestJS 11 + TypeScript |
| Frontend | Next.js 15 + shadcn/ui + Tremor |
| Database | PostgreSQL 16 (schema-per-tenant) |
| Cache | Redis |
| Queue | BullMQ |
| ORM | Drizzle |
| API contract | ts-rest |
| Auth | JWT + refresh tokens + WebAuthn passkeys |
| AI | Claude via AWS Bedrock (BAA available) |
| Hosting | AWS ECS Fargate + RDS + ElastiCache + S3 + CloudFront |
| CI/CD | GitHub Actions |
| i18n | next-intl (frontend) + NestJS i18n (backend) |
| Monitoring | Sentry (errors) + PostHog (analytics, self-hosted) |

**Why not WordPress backend?**
1. "SaaS platform" sells to NHS/commercial buyers. "WP plugin" does not
2. Data on AWS, not WP. If WP gets hacked, patient data is not there
3. Schema-per-tenant PostgreSQL is production-grade multi-tenancy. WP multisite is not
4. Quality > speed. OpenClaw builds 24/7. The constraint is quality of result, not time-to-market
5. A proper SaaS is more maintainable, scalable, and sellable than a WP plugin

---

## 4. MVP — 8 Modules (8 Weeks)

OpenClaw builds 24/7. Bean reviews, tests, and steers.

### Module Dependency Graph

```
[Auth+Tenant] ──blocks──▶ [Patient] ──blocks──▶ [Encounter+Rx]
                          [Patient] ──blocks──▶ [Appointment]
[Auth+Tenant] ──blocks──▶ [Audit+Security]
[Auth+Tenant] ──blocks──▶ [GDPR]
[Auth+Tenant] ──blocks──▶ [Communications]
[Patient] ──informs──▶ [Data Import]

PARALLEL OPPORTUNITIES:
- [Audit+Security] and [GDPR] and [Communications] can run simultaneously after Auth+Tenant
- [Appointment] and [Encounter+Rx] can run simultaneously after Patient
- [Data Import] can start after Patient (soft dependency)

CRITICAL PATH:
Auth+Tenant → Patient → Encounter+Rx → Integration Testing → Ship
```

### Week-by-Week Plan

| Week | Modules | Gate |
|---|---|---|
| 1-2 | **Auth+Tenant** — JWT auth, tenant provisioning, schema-per-tenant, 27 RBAC roles, WebAuthn passkeys | GATE 1: Auth works, tenant isolation verified |
| 2-3 | **Patient** — CRUD, search, MRN generation, demographics, encrypted PHI, soft delete | GATE 2: Patient records encrypt/decrypt correctly |
| 3-4 | **Appointment** + **Communications** (parallel) — Calendar, availability, booking, SMS/email reminders via Twilio | — |
| 4-5 | **Encounter+Prescription** — Clinical documentation, SOAP notes, ICD-11 diagnosis, drug interactions, e-prescribing | GATE 3: Full clinical workflow end-to-end |
| 5-6 | **Audit+Security** + **GDPR** (parallel) — Audit trail, AES-256-GCM encryption at rest, consent management, data export/deletion | — |
| 6-7 | **Data Import Tool** — CSV import, FHIR import, paper record migration wizard | GATE 4: MVP feature-complete |
| 7-8 | Integration testing, performance, accessibility audit, deployment to AWS | GATE 5: Production-ready. Ship |

### Module Detail

#### M1: Auth + Tenant
- Schema-per-tenant PostgreSQL (shared `public` schema for tenants, per-tenant schema for medical data)
- 27 medical roles via RBAC (same roles as existing WP system, implemented as NestJS Guards)
- JWT access tokens (15 min) + refresh tokens (7 days) + WebAuthn passkeys
- Tenant provisioning: create schema, seed roles, configure settings
- Clinic setup wizard (name, address, specialties, branding)

#### M2: Patient Management
- Patient CRUD with AES-256-GCM field-level encryption for PHI
- MRN (Medical Record Number) auto-generation per tenant
- Search by name, MRN, DOB (encrypted search via blind index)
- Demographics: name, DOB, gender, contact, emergency contacts, insurance
- Soft delete (never hard delete medical records)
- Patient photo upload (S3)

#### M3: Appointment Scheduling
- Calendar view (day/week/month)
- Provider availability management (recurring schedules + exceptions)
- 3-step booking wizard: select provider → select slot → confirm
- Status workflow: scheduled → checked-in → in-progress → completed / no-show / cancelled
- SMS/email reminders (24h and 1h before, via Twilio)
- Waitlist for full slots

#### M4: Encounter + Prescription
- Clinical encounter documentation (SOAP format)
- ICD-11 diagnosis coding (WHO API with offline cache)
- ICD-10 crossmap search (convenience layer for transitioning clinics)
- Vital signs recording (BP, HR, temp, SpO2, weight, height, BMI auto-calc)
- Drug interaction checking (FDA API)
- E-prescribing with controlled substance tracking
- Encounter templates per specialty

#### M5: Communications
- Secure staff messaging (AES-256-GCM encrypted at rest)
- Message threads with read receipts
- SMS appointment reminders (Twilio)
- Email notifications (transactional via SES)
- Notification preferences per user

#### M6: Audit + Security
- Comprehensive audit trail (who accessed what, when, from where)
- All PHI access logged with user, timestamp, action, IP
- AES-256-GCM encryption for data at rest
- TLS 1.3 for data in transit
- Rate limiting on all API endpoints
- Failed login tracking + account lockout
- Session management with forced logout capability

#### M7: GDPR Compliance
- Granular consent management (treatment, data sharing, research, communications)
- Self-service data export (JSON, PDF, CSV)
- Data deletion requests (with medical retention exceptions)
- Consent history timeline
- Data Processing Activity register
- Breach incident tracking and notification workflow
- Cookie consent (for marketing site)

#### M8: Data Import Tool
- CSV import wizard (map columns to fields, preview, validate, import)
- FHIR R4 bundle import (UK Core profiles)
- Duplicate detection during import
- Import audit log (what was imported, by whom, any errors)
- Paper record digitisation guidance (future: OCR integration)

---

## 5. Full Product Vision — 27 Modules (5 Phases)

### Phase 1: MVP (Weeks 1-8) — 8 modules
Auth+Tenant, Patient, Appointment, Encounter+Prescription, Communications, Audit+Security, GDPR, Data Import

### Phase 2: Clinical Depth (Weeks 9-16) — 5 modules
9. **Laboratory** — test ordering, results entry, critical value alerts, reference ranges
10. **Pharmacy/FEFO** — medication inventory, First-Expiry-First-Out dispensing, stock alerts
11. **Imaging** — radiology orders, results, DICOM viewer integration
12. **Clinical Decision Support** — evidence-based alerts, drug interactions, age-specific screening
13. **Referrals** — inter-clinic referrals, status tracking, FHIR messaging

### Phase 3: Engagement (Weeks 17-24) — 5 modules
14. **Patient Portal** — patient-facing dashboard, appointment booking, records view, messaging
15. **Shifa Bot AI** — FAQ, appointment booking, reminders, admin-assist (no clinical decisions)
16. **Video Consultation** — Jitsi-based, optimised for low bandwidth (360p/15fps)
17. **Offline/PWA** — Service worker + IndexedDB for staff, SQLite WASM upgrade later
18. **Forms Builder** — custom medical forms, conditional logic, template library

### Phase 4: Enterprise (Weeks 25-36) — 5 modules
19. **FHIR Interoperability** — UK Core R4 read/write, GP Connect integration
20. **Billing/Insurance** — invoice generation, Mollie payments, insurance claims (CMS-1500)
21. **Reporting/Analytics** — clinical reports, financial dashboards, population health
22. **Mobile App** — React Native (patient-facing, App Store/Play Store)
23. **Multi-clinic Admin** — organisation-level dashboard, cross-clinic reporting

### Phase 5: Scale (Weeks 37+) — 4 modules
24. **Multi-language** — 10+ languages from i18n framework (each language ~1 hour to add)
25. **Outbreak/Surveillance** — disease tracking, contact tracing, WHO reporting
26. **Mass Casualty** — rapid triage, bulk registration, resource tracking
27. **WHO Integration** — growth charts, vaccination campaigns, humanitarian reporting

---

## 6. Competitive Landscape (March 2026)

### Enterprise (not direct competitors, but set market expectations)

| Competitor | 2026 Status | Pricing | Gap Medinova Fills |
|---|---|---|---|
| **Epic** | Ambient AI scribe (85% adoption), Agent Factory, Cosmos AI platform | £1M+ implementation | SME pricing (£79-1800/mo) |
| **Oracle Health** | Voice-first EHR rebuilt from scratch | Enterprise contracts | Accessible to independents |
| **EMIS/SystmOne** | NHS incumbent, slow innovation | Enterprise contracts | Modern UX, offline-capable |

### SME/Independent (direct competitors)

| Competitor | Strengths | Weaknesses | Medinova Advantage |
|---|---|---|---|
| **KiviCare** | WP-based, affordable | 3 CVEs in 15 months (CVSS 9.8), no encryption, no DTAC, no offline, Flutter app | Security-first, DTAC-ready, offline-capable, multi-language |
| **Carepatron** | AI Copilot, $19-49/mo | Solo mental health focus, no multi-role, no UK compliance | 27 roles, multi-specialty, UK GDPR/DTAC |
| **DrChrono** | US market leader for SMEs | US-only, no UK compliance, cloud-only | UK-first, offline-capable |
| **Cliniko** | Clean UX, popular in AU/UK | No clinical documentation, no prescribing, no lab | Full EHR, not just practice management |

### What competitors are NOT doing

| Gap | Who Misses It | Medinova's Play |
|---|---|---|
| Offline-first for UK clinics | Everyone (all cloud-only) | PWA now, SQLite WASM later |
| Schema-per-tenant multi-tenancy | KiviCare (WP multisite) | PostgreSQL schema isolation |
| ICD-11 primary coding | Most UK systems still ICD-10 | ICD-11 with ICD-10 crossmap |
| DTAC compliance for indie EHR | KiviCare (no DTAC) | First indie EHR to submit DTAC |
| Arabic/RTL medical interface | All US/EU-built EHRs | Built-in from day 1 via i18n |
| Humanitarian deployment model | Nobody in digital health | BOGO: 1 paying clinic funds 4-5 free |

### Ambient AI Reality Check

Ambient AI (voice-to-notes) is now table stakes, not a differentiator. Epic has 85% adoption. Oracle rebuilt their EHR voice-first. Medinova's differentiators are **workflow UX**, **affordability**, **offline capability**, and **security-first design** — not AI features.

Shifa Bot is admin-assist only (FAQ, booking, reminders). No clinical AI = no MHRA classification = no regulatory burden. Expand to clinical assist only after revenue proves the core product.

---

## 7. Market Entry — Hybrid Strategy

### Track 1: First Paying Customer

```
Week 1-8:   Build MVP (OpenClaw, 24/7)
Week 8-10:  Working demo ready. Begin outreach via Muslim business network groups
Week 10-12: Demo to 5-10 UK clinic owners (working product, not mockups)
Week 12:    Beta onboard first clinic (free 3 months, then Starter)
Week 14-16: Onboard 2-3 more clinics
Week 18+:   First paid conversion
```

**Validation with demo, not mockups.** Bean's bandwidth is limited until Indus ships (SGS theme builder dependency). Outreach starts month 2-3 with a working demo — this converts better than mockups anyway. Clinics found through Muslim business network groups, not cold outreach.

**Missing persona:** The receptionist/practice manager uses the system 8 hours/day. If they hate the UX, the clinic churns. Design for them, not just for doctors. Every screen should be tested against the question: "Would a receptionist with 15 open tabs find this easy?"

**Kill date:** Month 5 (4 months from outreach start, not from project start). If zero paying customers and no concrete pipeline, conduct fundamental reassessment of product-market fit.

### Track 2: Grant Funding (parallel)

| Grant | Amount | Timeline | Status |
|---|---|---|---|
| **SBRI Healthcare Phase 1** | Up to £100k | Next round TBD (apply when open) | Research application requirements |
| **Biomedical Catalyst** | Up to £500k | Summer 2026 round | Prepare evidence pack |
| **NIHR i4i Connect** | £50-150k | Rolling submissions | Apply after first beta clinic |
| **MSDUK Membership** | £300 (access to corporate buyers) | Immediate | Join now |

**Grant pitch:** "We built the first security-first, offline-capable EHR for independent UK clinics. One paying clinic funds 4-5 free humanitarian deployments. Phase 2 funding enables offline AI clinical support for conflict zones."

**Evidence pack needed:** Working MVP demo, DTAC submission, one beta clinic testimonial, security architecture documentation.

### Track 3: Growth (month 4+)

1. **Grassroots:** Muslim-owned UK independent clinics via Bean's personal network
2. **MSDUK:** Corporate buyer introductions via BAME business network
3. **Referrals:** Beta clinic referrals (incentivise with free months)
4. **Content:** SEO-optimised comparison pages (Medinova vs KiviCare, Medinova vs Carepatron)
5. **NHS pathway:** DTAC compliance → GP Connect integration → NHS procurement catalogue
6. **Humanitarian:** Charity deployments as case studies for grant applications and press

---

## 8. Pricing

| Tier | Price | Staff | Clinics | Key Features |
|---|---|---|---|---|
| **Starter** | £79/month | 1-5 | 1 | Core EHR, 200 SMS/month, basic offline, email support (72h) |
| **Professional** | £399/month | 6-25 | 3 | + Lab, pharmacy, video consult, 1000 SMS/month, priority support (24h) |
| **Enterprise** | £1,800/month | Unlimited | Unlimited | + FHIR, analytics, SSO, dedicated support, SLA |
| **Custom** | Contact | NHS trusts | — | DSPT compliance, on-premise option, BAA |

**Shifa Bot:** Separate add-on. Credit-based for Starter/Professional. Included in Enterprise. Enterprise licence for high-usage clinics.

**Beta offer:** Free for 3 months, then convert to Starter. Filters serious clinics from tyre-kickers while reducing adoption friction.

**Why not free tier:** Free users don't give feedback worth acting on. Free-to-paid conversion averages 2-5% in healthcare SaaS. Better to start with 3 months free + clear paid expectation.

---

## 9. Financing — Halal Only

All financing must comply with Islamic principles. Interest-bearing debt (riba) is haram and will never be used.

| Source | Type | Amount | Timeline |
|---|---|---|---|
| **Bootstrapping** | Revenue | Variable | Ongoing |
| **Grants** | Non-dilutive | £50k-500k | Application-dependent |
| **Islamic finance** | Murabaha/Musharakah | TBD | If needed for scaling |
| **Equity** | Dilutive | TBD | Only for significant scaling |
| **Crowdfunding** | Non-dilutive | TBD | LaunchGood / Crowdfunder |

**Priority order:** Bootstrap from revenue → grants → Islamic finance → equity. Never debt.

---

## 10. Risk Register

| # | Risk | Likelihood | Impact | Mitigation | Fallback |
|---|---|---|---|---|---|
| 1 | **No paying customers by month 4** | Medium | Critical | Validate demand in weeks 1-2 with mockups. Interview 10 clinics. Kill date enforced | Pivot to niche (e.g., pharmacy-only SaaS) or park the product |
| 2 | **Solo developer bottleneck** (Bean cannot code, OpenClaw is sole builder) | Low | High | Detailed CLAUDE.md, session handoffs, episodic memory. Every session picks up where the last left off | Hire a human developer (funded by grant or revenue) |
| 3 | **MHRA classifies Shifa Bot as medical device** | Low | High | Keep Shifa to admin-assist ONLY. No symptom checking, no triage, no clinical recommendations. Document scope explicitly | Remove Shifa Bot entirely. Reintroduce after regulatory clearance |
| 4 | **KiviCare patches security and catches up** | Medium | Medium | Move fast on DTAC + FHIR. These are structural moats. Multi-language + humanitarian story is unique | Focus on UX and workflow superiority. Security is necessary but not sufficient |
| 5 | **AWS costs overrun before revenue** | Medium | Medium | Start minimal: ECS Fargate (0.25 vCPU), RDS t3.micro. Budget: £150/month max. Scale only when paying clinics justify it | Use Hetzner or Railway for cheaper hosting until revenue covers AWS |
| 6 | **Data breach during beta** | Low | Critical | Schema-per-tenant isolation, AES-256-GCM encryption, penetration test before beta, incident response plan documented | Immediate notification (GDPR 72h), forensic analysis, remediation, transparent communication |
| 7 | **Beta clinic churns** | Medium | Medium | Over-invest in onboarding. Daily check-ins week 1. Fix bugs same day. Free 3 months = low risk for them | Learn why, fix the cause, apply to next clinic |
| 8 | **Grant applications rejected** | Medium | Low | Grants are parallel track, not dependency. Revenue is the primary funding source. Grants accelerate, not enable | Continue bootstrapping. Apply to next round with stronger evidence |

---

## 11. Success Metrics

| Milestone | Week | "Done" Means |
|---|---|---|
| **MVP feature-complete** | 7 | All 8 modules pass integration tests. Zero critical bugs |
| **Production deployed** | 8 | Running on AWS. SSL, monitoring, backups configured. Load tested to 50 concurrent users |
| **Demand validated** | 8-10 | Demo to 5-10 clinic owners. 3+ expressed interest from working product |
| **DTAC submitted** | 10 | Self-assessment submitted to NHS. "Planned" answers acceptable for items in progress |
| **First beta clinic** | 12 | Real staff creating real (or realistic test) patient records daily |
| **First paid conversion** | 18 | One clinic converts from free beta to Starter (£79/month) |
| **SBRI application submitted** | 20 | Grant application complete with working demo, DTAC reference, beta testimonials |
| **Revenue covers hosting** | 20 | 2+ paying clinics (£158+/month) covers AWS costs |
| **Kill date assessment** | 22 | Month 5. If zero paying customers: fundamental reassessment. Product-market fit not proven |

---

## 12. What Stays, What Goes

### From the WP codebase (mine, don't build on)

| Component | Action | Value to Extract |
|---|---|---|
| 78+ database table definitions | **Mine** | Column names, types, relationships → PostgreSQL schema |
| 500+ AJAX handlers | **Mine** | Business logic, validation rules → NestJS controllers |
| AES-256-GCM encryption patterns | **Mine** | Encryption approach → TypeScript implementation |
| 53 dashboard widget definitions | **Mine** | Widget types, data requirements → React components |
| ICD-11 integration | **Mine** | WHO API integration → TypeScript client |
| Drug interaction checker | **Mine** | FDA API integration → NestJS service |
| Audit logging patterns | **Mine** | Log structure, compliance requirements → NestJS interceptor |
| Offline service worker | **Mine** | Caching strategy → Next.js PWA |

### Do not carry forward

| Component | Why |
|---|---|
| WordPress/PHP codebase | New stack. Mine logic, don't port code |
| ACF Pro integration | Replaced by React forms |
| Ultimate Member roles | Replaced by NestJS RBAC |
| Spectra/Astra theme | Replaced by shadcn/ui + Tremor |
| Hostinger hosting | Replaced by AWS |
| SFTP deployment | Replaced by CI/CD |
| Shafi chatbot (4,766 lines) | Rebuild as Shifa Bot on AWS Bedrock |

---

## 13. Compliance Roadmap

| Requirement | When | Status |
|---|---|---|
| **GDPR/UK DPA 2018** | MVP (built-in) | Module 7 in MVP |
| **DTAC v2 self-assessment** | Week 10 | Submit with "planned" for incomplete items |
| **DCB0129** (clinical risk management) | Before NHS sales | Document during beta |
| **DSPT** (Data Security Protection Toolkit) | Year 2 | Required for NHS trust contracts |
| **ISO 27001** | Year 2 | Required for enterprise contracts |
| **MHRA SaMD** | Only if Shifa Bot does clinical assist | Not needed for admin-assist AI |
| **FHIR UK Core R4** | Phase 4 (weeks 25-36) | NHS interoperability requirement |
| **Cyber Essentials Plus** | Before first enterprise client | Straightforward certification |

---

## 14. Session Plan

| Session | Focus | Estimate | Gate |
|---|---|---|---|
| **This session** | Strategic plan, architecture docs, CLAUDE.md rewrite | 2-3 hours | Documentation foundation complete |
| **Next session** | Monorepo scaffold, CI/CD, database schema (Drizzle) | 2-3 hours | `pnpm dev` runs, DB migrations work |
| **Session 3** | Auth+Tenant module (M1) | 3-4 hours | JWT auth + tenant isolation verified |
| **Session 4** | Patient module (M2) | 2-3 hours | Encrypted patient CRUD works |
| **Session 5** | Appointment + Communications (M3+M5) | 3-4 hours | Booking flow + SMS reminders work |
| **Session 6** | Encounter + Prescription (M4) | 3-4 hours | Full clinical workflow end-to-end |
| **Session 7** | Audit + GDPR + Data Import (M6+M7+M8) | 3-4 hours | Compliance modules complete |
| **Session 8** | Integration testing, deployment, beta prep | 3-4 hours | Production on AWS, ready for beta |

---

## 15. Phase 2 Preview (Weeks 9-24)

After MVP ships and first beta clinic is onboarded:

1. **Laboratory system** — mine existing 8 lab tables from PHP codebase. Test ordering, results, critical value alerts
2. **Pharmacy/FEFO** — mine existing FEFO logic. First-Expiry-First-Out dispensing reduces 50-60% pharmaceutical waste
3. **Patient Portal** — patient-facing Next.js app. Appointment booking, records view, messaging. Native mobile app in Phase 4
4. **Shifa Bot** — Claude via AWS Bedrock. FAQ + booking + reminders. Admin-assist only. Credit-based billing
5. **Video Consultation** — Jitsi, optimised for low bandwidth (360p/15fps, tested at 480 Kbps in Gaza)
6. **Offline PWA** — Service worker + IndexedDB for staff portal. SQLite WASM upgrade when browser support matures

---

*Plan version 2.0 — 24 March 2026*
*Replaces: 16-week WP-era strategic plan (22 March 2026)*
*Next review: Week 4 (GATE: demand validated, MVP on track)*
