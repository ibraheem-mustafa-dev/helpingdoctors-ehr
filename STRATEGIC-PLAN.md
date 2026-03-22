# HelpingDoctors EHR Pro -- 16-Week Strategic Plan

**Date:** 22 March 2026
**Owner:** Bean (Small Giants Studio Ltd)
**Developer:** Claude Code
**Constraint:** 15 hrs/week, evenings and weekends

---

## Section 1: Architecture Overview

```
                         SHARED BACKEND
                    (PHP Plugin + MySQL DB)
                   /                        \
                  /                          \
    GAZA TRACK (WP)              COMMERCIAL TRACK (Next.js)
    WordPress frontend           Next.js 15 + Tailwind
    Feature-frozen after         SaaS presentation
    Week 5 launch                No WP fingerprint
    Hostinger shared             AWS (ECS/RDS)
                  \                          /
                   \                        /
                    REST API (wp-json/hd/v1)
                    28 endpoints (existing)
                    JWT auth for Next.js
                           |
                    FHIR Facade Layer
                    (Week 11, read-only)
                    UK Core STU3 profiles
                           |
                    Shifa Bot (Minimal)
                    FAQ + booking only
                    Cloudflare Worker
                           |
                    MOBILE APP (Phase 2)
                    Expo/React Native
                    Shares REST API + FHIR
```

**What stays:** 207 PHP files, custom `hd_*` DB tables, AES-256-GCM encryption, audit logging, 28 REST endpoints, 53 dashboard widgets, GridStack customiser, offline service worker.

**What changes:** WP frontend frozen for Gaza. Next.js becomes the commercial face. ACF Pro removed (50 refs across 5 files). UM removed (139 refs across 29 files). Spectra/Astra deleted entirely.

**How they share:** Both tracks call the same REST API at `/wp-json/hd/v1/`. Gaza uses WP AJAX handlers (existing). Commercial uses JWT-authenticated REST. Same PHP classes serve both.

---

## Section 2: Week-by-Week Plan

### Weeks 1-2: Security Hardening (Both Tracks)

**Goal:** Fix all 9 critical and 13 high security issues. Nothing ships until these are closed.

**Critical fixes (unauthenticated data exposure via nopriv handlers):**

1. **Remove `wp_ajax_nopriv_hd_search_patient`** in `includes/class-hd-appointment-booking.php` line 51 -- exposes patient search to unauthenticated users
2. **Remove `wp_ajax_nopriv_hd_check_drug_interactions`** in `includes/safety/class-hd-drug-interactions.php` line 42 -- exposes drug/prescription data
3. **Remove `wp_ajax_nopriv_hd_load_acf_form` and `hd_submit_acf_form`** in `includes/integrations/class-hd-acf-integration.php` lines 67-68 -- allows unauthenticated form submission
4. **Remove `wp_ajax_nopriv_hd_join_consultation`** in `includes/integrations/class-hd-jitsi-integration.php` line 22 -- unauthenticated video access
5. **Remove `wp_ajax_nopriv_hd_get_dashboard_data`** in `includes/integrations/class-hd-spectra-integration.php` line 66 -- exposes clinical dashboard data
6. **Remove `wp_ajax_nopriv_hd_process_medical_payment`** in `includes/integrations/class-hd-surecart-integration.php` line 93 -- unauthenticated payment processing
7. **Remove `wp_ajax_nopriv_hd_report_ai_concern`** in `includes/ai-safety/class-hd-ai-safety-controller.php` line 107 -- unauthenticated writes
8. **Remove `wp_ajax_nopriv_hd_shafi_test`** in `includes/ai/class-hd-shafi-chatbot.php` line 333 -- test endpoint in production
9. **Audit all 35 nopriv handlers** -- keep only: cookie consent, Turnstile validation, public booking (with Turnstile), language toggle, WebAuthn auth, Mollie webhook

**High-priority fixes:**

10. Add nonce verification to every AJAX handler missing `check_ajax_referer()`
11. Add capability checks (`hd_user_can_*`) to all authenticated AJAX handlers
12. Add rate limiting to `class-hd-api-security.php` REST endpoints
13. Add input sanitisation audit across all `$_POST`/`$_GET` usage
14. Remove `var_dump`/`print_r` from any committed files
15. Add `defined('ABSPATH') || exit;` check to any PHP file missing it
16. Verify `$wpdb->prepare()` on every database query (spot-check found raw interpolation in 3 widget files)

**Deliverable:** Security audit report with before/after. Every fix has a PHPUnit test.

---

### Weeks 3-5: Dependency Removal + Gaza MVP

**Goal:** Remove ACF Pro, Ultimate Member, Spectra, Astra. Ship working WP plugin to Gaza clinic.

**Week 3: ACF Pro removal**

17. Replace 33 `acf_add_local_field_group` calls in `class-hd-acf-integration.php` with native WP meta boxes
18. Replace `get_field()`/`update_field()` calls across 5 files with `get_post_meta()`/`update_post_meta()`
19. Delete `includes/acf-fields/` directory (3 files: body-diagram, medical-signature, vitals-calculator) -- rebuild as custom meta boxes
20. Delete `includes/integrations/class-hd-acf-integration.php` and `class-hd-acf-medical-forms.php`
21. Delete `includes/helpers/class-hd-acf-helper.php`

**Week 4: UM removal + native roles**

22. Rewrite `includes/integrations/class-hd-comprehensive-roles.php` to use `add_role()`/`add_cap()` instead of UM API (28 UM references in this file)
23. Replace all `um_get_user_role()` calls with `wp_get_current_user()->roles` pattern
24. Build `class-hd-role-manager.php` with 27 custom WP roles + custom capabilities
25. Rewrite login flow: replace UM login forms with custom WP login + redirect logic
26. Delete `includes/security/class-hd-um-security.php`

**Week 5: Gaza ship**

27. Delete Spectra integration (`class-hd-spectra-integration.php`) -- widgets already render without it
28. Test all 53 widgets render correctly without Spectra blocks
29. Test all 30 frontend pages load correctly
30. Test offline mode (service worker + IndexedDB sync)
31. **Ship to Gaza clinic via SFTP** -- feature-freeze WP track after this

**Deliverable:** Working EHR at Gaza clinic. Zero third-party plugin dependencies except WordPress core.

---

### Weeks 6-8: REST API Audit + Next.js Foundation

**Goal:** Verify API surface, build Next.js app with auth + first 3 pages.

**Week 6: REST API hardening**

32. Audit all 28 routes in `includes/api/class-hd-rest-api.php` -- document request/response schemas
33. Audit 4 routes in `includes/security/class-hd-api-security.php`
34. Add JWT authentication layer (firebase/php-jwt) for headless access
35. Add OpenAPI/Swagger spec generation for all endpoints
36. Add response pagination to list endpoints (patients, appointments, encounters)

**Week 7: Next.js project setup**

37. Initialise Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
38. Configure NextAuth.js with JWT provider (calls WP REST for auth)
39. Build shared API client with Zod schema validation
40. Build `<DashboardShell>` layout component (sidebar, header, role-based nav)
41. Build internationalisation framework (next-intl, 10+ languages from launch)

**Week 8: First 3 commercial pages**

42. **Login page** -- email/password + WebAuthn passkey option
43. **Dashboard page** -- role-based widget grid (reuses widget data from existing REST endpoints)
44. **Patient list page** -- search, filter, pagination, encrypted data display

**Deliverable:** Next.js app running locally with working auth against WP backend.

---

### Weeks 9-11: Commercial MVP + AWS

**Goal:** Complete 8 core pages, deploy to AWS, prepare DTAC.

**Week 9: Remaining pages**

45. **Patient detail page** -- demographics, encounters, prescriptions, lab results
46. **Appointments page** -- calendar view, booking flow, status management
47. **Prescriptions page** -- create, review, drug interaction check
48. **Laboratory page** -- order tests, view results, critical value alerts
49. **Messaging page** -- encrypted staff messaging (existing AES-256-CBC backend)

**Week 10: AWS deployment**

50. Provision AWS infrastructure: ECS Fargate (WP), RDS MySQL, ElastiCache, S3, CloudFront
51. Configure VPC with private subnets for database
52. Set up CI/CD pipeline (GitHub Actions to ECR to ECS)
53. Migrate WP backend from Hostinger to AWS (database + files)
54. Deploy Next.js to Vercel or AWS Amplify (connects to AWS-hosted WP API)

**Week 11: FHIR + DTAC prep**

55. Build FHIR facade: read-only Patient, Encounter, Observation resources (UK Core STU3)
56. Complete DTAC v2 self-assessment form (clinical safety, interoperability, security sections)
57. Document DCB0129 compliance evidence (clinical risk management)

**Deliverable:** Commercial MVP on AWS. DTAC draft complete.

---

### Weeks 12-14: Beta Launch

**Goal:** Onboard first paying clinic, gather feedback, iterate.

**Week 12: Beta onboarding**

58. Identify first beta clinic from Bean's network (Muslim-owned UK clinic)
59. Create onboarding flow: clinic setup wizard, staff account creation, role assignment
60. Configure tenant isolation (WP multisite blog per clinic for now; PostgreSQL schema-per-tenant in Phase 2)
61. Deploy Shifa Bot: FAQ responses + appointment booking only (no clinical advice = no MHRA)

**Week 13: Feedback + fixes**

62. Daily check-ins with beta clinic (15 min)
63. Bug fix sprint based on real-world usage
64. Performance optimisation based on actual load patterns
65. Record 3-minute demo video showing key workflows

**Week 14: DTAC submission**

66. Submit DTAC v2 to NHS (use "planned" for items not yet complete)
67. Finalise pricing page: Free 3 months, then Starter at 79 GBP/month
68. Build marketing landing page (Next.js, separate from app)

**Deliverable:** One UK clinic live on commercial platform. DTAC submitted.

---

### Weeks 15-16: Second Wave + Grant Prep

**Goal:** Expand to 3-5 clinics, begin SBRI grant application.

**Week 15: Scale**

69. Onboard 3-5 additional clinics from networking
70. Implement multi-tenant dashboard (admin view of all clinics)
71. Add Mollie payment integration to Next.js (existing backend, new frontend)
72. Add usage analytics (PostHog or Plausible, self-hosted)

**Week 16: Grant + Phase 2 planning**

73. Draft SBRI Healthcare grant application (Claude writes, Bean reviews)
74. Compile evidence pack: Gaza deployment, beta clinic testimonials, DTAC reference
75. Create Phase 2 roadmap document
76. Plan PostgreSQL migration strategy (schema-per-tenant)

**Deliverable:** 3-5 paying UK clinics. SBRI application drafted. Phase 2 planned.

---

## Section 3: What to Keep, Rewrite, Delete

| Component | Action | Reasoning |
|---|---|---|
| 207 PHP backend files | **Keep** | Core business logic, tested, working |
| 53 dashboard widgets | **Keep** | 100% audit pass, role-based, GridStack |
| REST API (28 endpoints) | **Keep + harden** | Foundation for headless architecture |
| AES-256-GCM encryption | **Keep** | HIPAA/GDPR compliant, proven |
| Audit logging system | **Keep** | Compliance requirement |
| Service worker + IndexedDB | **Keep** | Gaza offline requirement |
| GridStack customiser | **Keep** | 1,565 lines, fully working |
| ICD-11 integration | **Keep** | Add ICD-10 convenience search layer |
| ACF Pro integration (5 files) | **Delete** | Replace with native WP meta boxes |
| UM integration (29 files ref) | **Rewrite** | Replace with native WP roles + caps |
| Spectra integration | **Delete** | Widgets render without it |
| Astra theme dependency | **Delete** | WP frontend frozen; Next.js for commercial |
| SureCart integration | **Delete** | Using Mollie (ADR-002) |
| Shafi chatbot (4,766 lines) | **Rewrite** | Rebuild as minimal Shifa Bot |
| `production-pages-content.php` | **Delete** | Deprecated, hardcoded URLs |
| `admin-toolbar-fix.php` | **Delete** | Breaks dropdown menus |

---

## Section 4: Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Backend** | PHP 8.1+ / WordPress 6.5+ | Existing proven codebase, 207 files |
| **Database** | MySQL 8.0 (Phase 1), PostgreSQL 16 (Phase 2) | Schema-per-tenant for multi-tenancy |
| **Commercial frontend** | Next.js 15 + TypeScript + Tailwind | No WP fingerprint, SaaS presentation |
| **Component library** | shadcn/ui + Radix | Accessible, customisable, WCAG 2.2 AA |
| **Auth** | NextAuth.js + JWT + WebAuthn | Passwordless option, NHS-grade security |
| **Hosting (Phase 1)** | AWS ECS + RDS + CloudFront | Required for NHS/commercial credibility |
| **Gaza hosting** | Hostinger (existing) | Cost-effective, sufficient for single clinic |
| **Payments** | Mollie | 38% lower fees, ethical choice (ADR-002) |
| **AI chatbot** | Cloudflare Workers + Claude (Bedrock) | BAA available, HIPAA-aligned |
| **i18n** | next-intl + INTL PHP | 10+ languages from launch, Arabic RTL |
| **FHIR** | Custom facade, UK Core STU3 | NHS interoperability requirement |
| **CI/CD** | GitHub Actions | Automated testing, deployment |
| **Monitoring** | PostHog (self-hosted) + Sentry | Privacy-first analytics, error tracking |

---

## Section 5: Risk Mitigation

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | **Solo developer bottleneck** -- Bean cannot code, Claude is the only developer | Project stalls if Claude sessions are unproductive | Detailed CLAUDE.md rules, session handoffs, plans directory, episodic memory. Every session picks up where the last left off |
| 2 | **MHRA classification** -- Shifa Bot could be classified as medical device software | Regulatory block, fines | Keep Shifa to FAQ + booking ONLY. No symptom checking, no triage, no clinical recommendations. Document scope explicitly |
| 3 | **KiviCare catches up** -- competitor patches CVSS 9.8 and adds features | Competitive window closes | Move fast on DTAC + FHIR. These are structural moats KiviCare cannot add quickly. Our multi-language + Gaza story is unique |
| 4 | **AWS costs overrun** -- infrastructure more expensive than Hostinger | Cash burn before revenue | Start with smallest ECS tasks (0.25 vCPU), RDS t3.micro. Scale only when paying clinics justify it. Budget: 150 GBP/month max |
| 5 | **Beta clinic churns** -- first clinic finds too many bugs | Reputation damage, lost reference | Over-invest in weeks 12-13. Daily check-ins. Fix bugs same day. Free 3 months means low risk for them |
| 6 | **Data breach during transition** -- migration from Hostinger to AWS exposes PHI | GDPR violation, trust destroyed | Encrypt all data in transit (TLS 1.3). Use `mysqldump` with SSH tunnel. Verify encryption-at-rest on RDS. Test with synthetic data first |

---

## Section 6: Success Metrics

| Milestone | Week | "Working" means... |
|---|---|---|
| **Security cleared** | 4 | Zero critical/high findings. All nopriv handlers audited. PHPUnit tests for every fix |
| **Gaza live** | 8 | Gaza clinic using system daily. Zero ACF/UM/Spectra dependencies. Offline mode confirmed working |
| **Commercial MVP** | 12 | 8 Next.js pages functional. Auth working. One UK clinic onboarded. DTAC drafted |
| **Revenue started** | 16 | 3-5 UK clinics on paid plans. SBRI grant submitted. Phase 2 roadmap approved |

---

## Section 7: Phase 2 Preview (Weeks 17-32)

1. **PostgreSQL migration** (weeks 17-20) -- schema-per-tenant multi-tenancy, migrate from MySQL, zero-downtime cutover
2. **SQLite WASM + OPFS** (weeks 21-24) -- replace IndexedDB with SQLite in browser, full offline database, automatic sync engine
3. **Shifa Bot expansion** (weeks 21-24) -- symptom pre-screening (with DCB0129 clinical safety case), multi-language, Claude via AWS Bedrock with BAA
4. **FHIR write operations** (weeks 23-26) -- full CRUD on UK Core resources, GP Connect integration for NHS read codes
5. **Mobile app** (weeks 25-32) -- Expo/React Native, shares REST API, offline-first with SQLite, biometric auth
6. **SBRI grant delivery** (if awarded, weeks 20+) -- funded development of NHS-specific features
7. **ISO 27001 certification** (weeks 28-32) -- required for NHS enterprise contracts

---

*Plan version 1.0 -- 22 March 2026*
*Next review: Week 4 checkpoint*
