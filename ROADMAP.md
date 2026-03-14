# HelpingDoctors EHR Pro — Development Roadmap
**Last Updated:** 2026-03-14
**Supersedes:** All prior audit docs, gap analyses, and ad-hoc task lists.
**Cross-referenced against:** BUSINESS-MODEL.md, Dec 2025 codebase audit, Mar 2026 key decisions.

---

## Current State

- **207 PHP files**, 103K+ lines of code
- **70+ database tables** (schema classes complete)
- **53 dashboard widgets** (all functional)
- **27 medical roles** (defined, not wired)
- **Plugin cannot activate** on current live site (missing ACF Pro, Ultimate Member, wp-config constants)
- **Live site shows Indus Foods branding** (template parts not customised)
- **SGS theme style variation exists** (`helping-doctors.json`, committed `f18889a`)
- **No deployments** (commercial or humanitarian). Zero users.

---

## Phase 0 — Foundation Cleanup (before any new features)

**Goal:** Remove all external plugin dependencies, fix security issues, make the plugin self-contained and activatable.

### 0.1 Remove ACF Pro dependency (108 references, 8 files)
- [ ] Replace `get_field()` / `update_field()` with `get_post_meta()` / `update_post_meta()`
- [ ] Replace `acf_add_local_field_group()` with WP native meta boxes or Gutenberg blocks
- [ ] Replace `have_rows()` with direct meta queries
- [ ] Rebuild 3 custom ACF field types as standalone:
  - `class-acf-field-body-diagram.php` — rebuild as JS-powered meta box
  - `class-acf-field-vitals-calculator.php` — rebuild as standalone widget
  - `class-acf-field-medical-signature.php` — rebuild as canvas-based meta box
- [ ] Delete `class-hd-acf-integration.php` and `class-hd-acf-helper.php`
- [ ] Delete `class-hd-acf-medical-forms.php`
- [ ] Test all forms still work

### 0.2 Remove Ultimate Member dependency (304 references, 15 files)
- [ ] Replace `um_*` functions with WP native user API (`wp_insert_user`, `wp_update_user`, `get_userdata`)
- [ ] Rewrite `class-hd-comprehensive-roles.php` (146 UM refs) to use `add_role()` / `add_cap()` directly
- [ ] Build custom registration forms (replace UM registration)
- [ ] Build custom login form (replace UM login)
- [ ] Build custom profile pages (replace UM profiles)
- [ ] Rewrite `class-hd-um-security.php` as native WP security
- [ ] Delete `class-hd-um-roles-safety.php`
- [ ] Delete `class-hd-role-cleanup-admin.php` (UM-specific cleanup)
- [ ] Rewrite role-based redirects without UM hooks
- [ ] Test all 27 roles work with native WP

### 0.3 Remove Astra/Spectra dependencies
- [ ] Delete `class-hd-astra-integration.php` (5 refs)
- [ ] Delete `class-hd-spectra-integration.php` (22 refs)
- [ ] Ensure all frontend rendering uses SGS theme blocks only
- [ ] Remove any Astra-specific CSS classes from templates

### 0.4 Fix security vulnerabilities
- [ ] Fix 15+ unprepared `$wpdb` queries — all must use `$wpdb->prepare()`
  - `class-hd-database.php` (lines 25, 115, 145, 175, 205, 507)
  - `class-hd-clinic-setup.php` (line 58)
  - `class-hd-refill-admin.php` (lines 683, 717)
  - `class-hd-staff-registration.php` (line 63)
  - `reports-page.php` (lines 72, 177)
  - `class-hd-ai-safety-admin.php` (lines 595-636)
  - `class-hd-widget-appointment-stats.php` (lines 496, 499)
- [ ] Fix 15+ unescaped echo statements — all admin output via `esc_html()` / `esc_attr()`
  - `class-hd-clinical-alerts-admin.php` (lines 147-162)
  - `class-hd-clinic-setup.php` (lines 101, 115, 123)
  - `class-acf-field-vitals-calculator.php` (lines 164, 172, 265)
  - `class-hd-audit.php` (line 593 — CSV export)
- [ ] Remove or guard 20+ `error_log()` calls behind `WP_DEBUG`
- [ ] Remove 7 TODO comments (implement or delete stubs):
  - `class-hd-smart-triage.php:443`
  - `class-hd-gdpr-compliance.php:83`
  - `class-hd-hostinger-optimization.php:732,736`
  - `class-hd-security-monitor.php:401,410,457`
  - `class-hd-um-security.php:87`
  - `medical-encounter.php:736`

### 0.5 Fix plugin bootstrap
- [ ] Rewrite `check_dependencies()` — remove ACF/UM requirements
- [ ] Make HD_TURNSTILE keys optional (graceful degradation, not hard exit)
- [ ] HD_ENCRYPTION_KEY: keep as required but provide clear setup instructions
- [ ] Fix Composer autoloader path (`__DIR__ . '/../../vendor/autoload.php'` is wrong)
- [ ] Align PHP version: header says 8.2, code checks 7.4 — align to 7.4 minimum
- [ ] Debug and re-enable HD_API_Security (currently commented out, "causing REST API fatal errors")
- [ ] Debug and re-enable HD_Security_Monitor (currently disabled, "filling DB with millions of rows")
- [ ] Delete `hello.php` from themes/plugins

### 0.6 Clean dead code
- [ ] Delete `class-hd-shafi-chatbot.php` (Shafi AI to be rebuilt as Shifa Bot from scratch)
- [ ] Delete `class-hd-hostinger-optimization.php` (Hostinger-specific, irrelevant on AWS)
- [ ] Review `class-hd-backup-encryption.php` UpdraftPlus integration (8 refs) — decide: keep for Hostinger dev or remove
- [ ] Delete any Astra theme files from `wp-content/themes/` on production

---

## Phase 1 — Core Workflows (charity pilot MVP)

**Goal:** The 3 core clinical workflows work end-to-end. A real user can register, see patients, and prescribe.

### 1.1 Patient registration and management
- [ ] Custom registration form (replaces UM)
- [ ] Patient search and lookup
- [ ] Patient profile page with medical history
- [ ] Role-based access (clinician sees all, receptionist sees demographics only)

### 1.2 Medical encounters
- [ ] Encounter creation form (replaces ACF encounter fields)
- [ ] SOAP note structure
- [ ] Vitals recording
- [ ] Diagnosis entry (ICD-10 search)
- [ ] Encounter history per patient

### 1.3 Prescriptions
- [ ] Prescription creation linked to encounter
- [ ] Drug interactions checker (FDA API — already built)
- [ ] Prescription history per patient
- [ ] Print-friendly prescription view

### 1.4 Appointment booking
- [ ] 3-step booking wizard
- [ ] Staff schedule integration
- [ ] Basic SMS/email confirmation (Twilio)

### 1.5 Dashboard
- [ ] 53 widgets already built — wire to real data
- [ ] Role-based dashboard templates
- [ ] Per-clinic dashboard (multi-location ready)

### 1.6 Frontend pages (12 missing from Dec audit)
- [ ] Audit which 12 are missing — list explicitly
- [ ] Build using SGS theme blocks (NOT Spectra/Astra)
- [ ] Each page must be accessible, RTL-compatible

### 1.7 Site presentation
- [ ] Activate HelpingDoctors style variation in Site Editor
- [ ] Customise SGS theme template parts (header, footer) for HelpingDoctors branding
- [ ] Set static front page
- [ ] Upload favicon
- [ ] Remove all Indus Foods references from template parts

---

## Phase 2 — Production Infrastructure

**Goal:** Move from Hostinger dev to AWS production. GDPR and encryption fully operational.

### 2.1 AWS deployment
- [ ] Provision AWS (t3.medium + RDS + CloudFront)
- [ ] SSL/TLS with AWS Certificate Manager
- [ ] Database migration from Hostinger
- [ ] wp-config.php with all required constants (HD_ENCRYPTION_KEY, Turnstile keys)
- [ ] Backup strategy (RDS automated + S3)

### 2.2 Encryption and compliance
- [ ] HD_ENCRYPTION_KEY defined and secured
- [ ] Verify AES-256-GCM encryption works end-to-end for patient data
- [ ] GDPR compliance tools tested (data export, deletion, consent)
- [ ] Cookie consent popup (missing from Dec audit)
- [ ] Audit log rotation (prevent Security Monitor DB bloat)

### 2.3 Offline mode
- [ ] Service Worker registration
- [ ] IndexedDB schema for offline patient records
- [ ] Sync queue with conflict resolution
- [ ] Test on low-connectivity simulation

---

## Phase 3 — Shifa Bot + Advanced Features

**Goal:** AI clinical support and advanced tier features.

### 3.1 Shifa Bot MVP
- [ ] Claude API integration (Haiku for analytics, Sonnet for clinical)
- [ ] RAG over clinic's own patient data
- [ ] Streaming React UI
- [ ] Credit-based usage tracking
- [ ] Add-on pricing enforcement (£49/£119/£249 tiers)

### 3.2 Video consultations
- [ ] Jitsi Meet integration (self-hosted, low-bandwidth)
- [ ] Recording + Whisper transcription
- [ ] Auto-generated SOAP notes from transcript

### 3.3 Lab workflow
- [ ] Order → results → notification pipeline
- [ ] Lab director role permissions

### 3.4 Pharmacy (FEFO)
- [ ] Inventory management
- [ ] Expiry alerts
- [ ] Dispensing queue

### 3.5 FHIR R4
- [ ] Assess existing FHIR code (decision: was started, needs review)
- [ ] Patient resource sync
- [ ] Encounter resource export
- [ ] NHS interoperability testing

---

## Phase 4 — Humanitarian Features

**Goal:** Mass casualty, outbreak tracking, field-specific workflows.

- [ ] Mass casualty triage mode
- [ ] Outbreak tracking and contact tracing
- [ ] Inter-clinic patient transfers
- [ ] Field-optimised UI (large buttons, high-contrast, works in sunlight)
- [ ] Offline-first with zero-connectivity fallback

---

## Phase 5 — Standalone App

**Goal:** React/Next.js frontend consuming WP REST API for commercial tier.

- [ ] API layer extraction from WP plugin
- [ ] Next.js frontend
- [ ] Auth (JWT or session-based)
- [ ] Stripe/Mollie subscription management
- [ ] White-label support for Enterprise tier

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-12 | Replace ACF Pro | Can't distribute commercial plugin in free humanitarian deployments |
| 2026-03-12 | Replace Ultimate Member | 4 CVEs in 18 months, commercial extensions, same distribution problem |
| 2026-03-12 | SGS theme replaces Astra + Spectra | Eliminates 4 commercial plugin dependencies |
| 2026-03-12 | AWS for production | HIPAA-eligible BAA, Hostinger shared only for dev |
| 2026-03-12 | Dual architecture | WP plugin (humanitarian) + standalone app (commercial) |
| 2026-03-12 | Rebuild Shafi as Shifa Bot | Existing chatbot code not worth preserving |
| 2026-03-12 | Tiered subscriptions | Starter £79, Practice £399, Hospital £1,800, Enterprise custom |
| 2026-03-12 | Rivers of Mercy not current | They went with another solution. Possible to reconnect. Not counting on it. |
| 2026-03-12 | Sister is primary humanitarian gateway | Original inspiration. On board. Will demo when ready. Not before. |

---

## Timeline Estimate

| Phase | Scope | Estimate (focused evenings/weekends) |
|-------|-------|--------------------------------------|
| Phase 0 | Foundation cleanup | 3-4 weeks |
| Phase 1 | Core workflows | 4-5 weeks |
| Phase 2 | AWS + production | 2 weeks |
| Phase 3 | Shifa Bot + advanced | 4-6 weeks |
| Phase 4 | Humanitarian features | 3-4 weeks |
| Phase 5 | Standalone app | 8-12 weeks |

**Charity pilot ready (Phase 0 + 1 + 2): ~10 weeks**
**First commercial client ready (+ Phase 3 MVP): ~16 weeks**

---

*This document is the single source of truth for development sequencing.*
*Daily notes: `memory/YYYY-MM-DD.md` | Business model: `BUSINESS-MODEL.md`*
