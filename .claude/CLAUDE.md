# HelpingDoctors EHR Pro - Project Instructions

**Last Updated**: December 2025
**Project Status**: ~60% Complete (Phase 1 features done, integration ongoing)

## Project Overview

**Name**: HelpingDoctors EHR Pro
**Type**: WordPress Plugin (Healthcare Electronic Health Records System)
**Primary Market**: Gaza healthcare facilities and other disaster/crisis zones (humanitarian deployment)
**Secondary Market**: UK healthcare providers (GDPR-compliant) - This should be focused on asthe only way we'll pay for the primary market is by getting the commercial customers on board.

### Mission
Enable healthcare workers to deliver quality care in challenging environments (war zones, resource-constrained settings, low connectivity) through reliable, accessible, and secure digital health records.

### Critical Design Principles
1. **Offline-First**: Must work without internet, sync when connected
2. **Mobile-First**: Optimized for smartphones and tablets (Gaza field deployment)
3. **Low-Bandwidth**: Designed for 2G/3G networks, intermittent connectivity
4. **Gaza-Hardened**: Power outages, emergency evacuations, device loss scenarios
5. **GDPR Compliant**: UK healthcare requirements (privacy by design)
6. **HIPAA-Aligned**: Medical-grade security and encryption
7. **Accessibility**: WCAG 2.2 AA standards, 44px touch targets
8. **Production-Ready**: No placeholders - beautiful, professional UX from day one

---

## ✅ VERIFIED COUNTS (December 2025)

> ⚠️ **CRITICAL**: Previous documentation had incorrect counts. Use these verified values:

| Component | ❌ OLD (Wrong) | ✅ VERIFIED |
|-----------|----------------|-------------|
| Medical Roles | 5 | **27** (via Ultimate Member) |
| Frontend Pages | 6 | **30** (20 Staff + 6 Patient + 4 Public) |
| Dashboard Widgets | 8 blocks | **53 widgets** + 8 Spectra blocks |
| Custom DB Tables | 50+ | **15+ custom** (`hd_*` prefix) |
| PHP Files | unclear | **175** (24 folders) |
| JS/CSS Assets | unclear | **42** |
| Template Groups | - | **13** (mapping to 27 roles) |

---

## Current Status

### ✅ Completed (Phase 1)
- **Dashboard Widgets:** 53/53 complete (100% audit pass rate Nov 2025)
- **GridStack Customizer:** Drag-drop dashboard (1,565 lines)
- **Role Templates:** 13 groups → 27 roles mapping
- **Video Consultation:** Jitsi optimized for Gaza (360p, 100% field success)
- **Pharmacy Workflow:** FEFO inventory (50-60% waste reduction)
- **Staff Messaging:** AES-256-CBC encrypted
- **Drug Interactions:** FDA API integration
- **Inventory System:** Auto-deduct on dispense
- **Security System:** A+ SSL grade, audit logging
- **Payment Integration:** Mollie gateway (38% lower fees than Stripe)

### ⚠️ Remaining Work
- Frontend page deployment to WordPress
- Ultimate Member role configuration verification
- Cookie consent implementation
- Final accessibility testing
- Production deployment

---

## 📐 ARCHITECTURAL DECISIONS (ADRs)

> **These decisions are FINAL. Do not suggest alternatives.**

### ADR-001: Database-First Architecture
**Decision:** Custom database tables (`hd_*`) for all medical data - NOT WordPress CPT.

**Why:**
- 5-10x faster than post meta queries
- Field-level encryption for HIPAA/GDPR
- Database transactions for atomic operations
- Foreign key constraints for data integrity

**Performance Benchmarks:**
- Patient search (10,000 records): 0.05s vs 0.5s post meta (10x faster)
- Appointment report (1 year): 0.2s vs 2.5s post meta (12x faster)
- Complex 4-table join: 0.1s vs 5+ seconds (50x faster)

### ADR-002: Mollie Payment Gateway
**Decision:** Use Mollie, NOT Stripe.

**Why:**
- 38% lower fees (1.8% + €0.25 vs 2.9% + €0.30)
- Ethical choice for Gaza humanitarian context
- PCI DSS Level 1 (no card data on server)

### ADR-003: Dashboard Widget Architecture
**Decision:** 53 widgets with GridStack.js + role-based templates.
**Status:** ✅ COMPLETE (100% audit pass rate)

**Categories:**
- Clinical (16), Scheduling (7), Management (11)
- Administrative (7), Laboratory (6), Pharmacy (3), Specialty (3)

### ADR-004: Encrypted Messaging
**Decision:** AES-256-CBC encryption at rest.
**Compliance:** HIPAA §164.312, GDPR Article 32.

### ADR-005: FEFO Inventory Management
**Decision:** First-Expiry-First-Out for pharmaceuticals.
**Impact:** 50-60% waste reduction, $6K-$15K/year savings.

### ADR-006: Gaza Video Optimisation
**Decision:** Self-hosted Jitsi, 360p default, 15fps.
**Result:** 100% field test success at 480 Kbps average.
**Cost:** $90/month vs Zoom $200+.

---

## 👥 27 Medical Roles (13 Template Groups)

| # | Template Group | Roles |
|---|----------------|-------|
| 1 | **Executive** | org_owner, system_admin, medical_director |
| 2 | **Clinic Management** | clinic_admin |
| 3 | **Physician Core** | physician, surgeon, nurse_practitioner, physician_assistant |
| 4 | **Emergency** | emergency_physician, emergency_responder |
| 5 | **Nursing** | registered_nurse, lpn, medical_assistant |
| 6 | **Pharmacy** | pharmacist, pharmacy_tech |
| 7 | **Laboratory** | lab_director, lab_technician |
| 8 | **Imaging** | radiologic_tech |
| 9 | **Therapy** | physical_therapist, mental_health, social_worker |
| 10 | **Administrative** | billing_specialist, medical_records |
| 11 | **Front Desk** | receptionist |
| 12 | **Patient Portal** | patient |
| 13 | **Humanitarian** | volunteer |

---

## 📄 30 Frontend Pages

### Staff Portal (20 Pages)
1. Staff Dashboard (`/staff-dashboard/`)
2. Clinic Setup (`/staff/clinic-setup/`)
3. Patient Management (`/staff/patients/`)
4. Appointments (`/staff/appointments/`)
5. Clinical Documentation (`/staff/encounter/`)
6. Laboratory (`/staff/laboratory/`)
7. Prescriptions (`/staff/prescriptions/`)
8. Staff Scheduling (`/staff/scheduling/`)
9. Notifications (`/staff/notifications/`)
10. Payments (`/staff/payments/`)
11. Reports (`/staff/reports/`)
12. Medical Forms (`/staff/forms/`)
13. Emergency Transfers (`/staff/emergency-transfer/`)
14. Audit Logs (`/staff/audit/`)
15. User Profile (`/staff/profile/`)
16. Help Centre (`/staff/help/`)
17. Feature Requests (`/staff/features/`)
18. Staff Directory (`/staff/directory/`)
19. Analytics Dashboard (`/staff/analytics/`)
20. Settings (`/staff/settings/`)

### Patient Portal (6 Pages)
21. Patient Dashboard (`/patient-portal/`)
22. Book Appointment (`/book-appointment/`)
23. Medical Records (`/patient/records/`)
24. Messages (`/patient/messages/`)
25. Prescriptions (`/patient/prescriptions/`)
26. Profile & Settings (`/patient/settings/`)

### Public Pages (4 Pages)
27. Clinics Directory (`/clinics/`)
28. Individual Clinic (`/clinic/{slug}/`)
29. Staff Login (`/staff-login/`)
30. Patient Registration (`/patient-registration/`)

---

## Technical Architecture

### Core Dependencies
- **WordPress**: 6.0+ (Local WP for development, Hostinger for production)
- **Advanced Custom Fields Pro**: Medical data structure (11 field groups, code-registered)
- **Ultimate Member**: User roles and authentication (27 roles)
- **Spectra Pro**: Dashboard UI blocks (8 medical blocks)
- **Astra Theme**: Base theme (recommended)

### ❌ Plugins NOT to Use (Critical Decision)
- **WP Amelia**: Performance penalty (+1000ms), no HIPAA docs, no offline capability
- **Fluent Forms Pro**: 40-60hr migration, breaks existing ACF forms, no HIPAA BAA
- **LiteSpeed Cache**: File deletion bug, unsafe for medical systems
- **Stripe**: Use Mollie instead (ADR-002)

**Why**: Custom system is superior - offline-capable, HIPAA-aligned, Gaza-optimized

### Plugin Structure
```
helpingdoctors-ehr-pro/
├── includes/
│   ├── admin/              # Backend admin interfaces
│   ├── ai/                 # Shafi chatbot (4,766 lines)
│   ├── api/                # REST API endpoints
│   ├── blocks/             # 53 dashboard widgets
│   ├── dashboard/          # GridStack customizer
│   ├── database/           # Table management
│   ├── frontend/           # Templates, AJAX handlers
│   ├── gdpr/               # GDPR compliance automation
│   ├── integrations/       # ACF, UM, Spectra, Mollie
│   ├── inventory/          # FEFO pharmacy system
│   ├── modules/            # Core medical modules
│   ├── offline/            # Service worker, IndexedDB
│   └── security/           # Encryption, audit
├── templates/              # 30 page templates
└── assets/
    ├── js/                 # Service worker, offline storage
    └── css/                # Mobile-first styles
```

### Key File Locations

**Build On These (Core System):**
| File | Purpose |
|------|---------|
| `includes/integrations/class-hd-comprehensive-roles.php` | 27 roles (lines 34-78) |
| `includes/class-hd-permissions.php` | GDPR data access control |
| `includes/blocks/class-hd-widget-registry.php` | 53 widget registry |
| `includes/dashboard/class-hd-dashboard-customizer.php` | GridStack (1,565 lines) |
| `includes/class-hd-database.php` | Database methods |
| `includes/frontend/class-hd-shortcodes.php` | 27 shortcodes |

**⚠️ Avoid These (Deprecated):**
| File | Problem |
|------|---------|
| `includes/data/production-pages-content.php` | Incomplete, hardcoded URLs |
| `wp-content/mu-plugins/admin-toolbar-fix.php` | Breaks dropdown - DELETE |
| `setup-frontend-pages-enhanced.php` | Old version - delete if exists |

---

## Database Architecture

### Core Tables (`hd_*` prefix)
- `hd_clinics` - Clinic records
- `hd_patients` - Patient records (encrypted PHI)
- `hd_appointments` - Appointments
- `hd_encounters` - Clinical encounters
- `hd_prescriptions` - Prescriptions
- `hd_user_clinics` - Staff↔Clinic assignments
- `hd_staff_schedules` - Staff schedules
- `hd_audit_logs` - GDPR audit trail

### Lab Tables
- `hd_lab_orders` - Lab test orders
- `hd_lab_test_items` - Individual tests
- `hd_lab_results` - Test results (has `critical_value` column)
- `hd_lab_test_catalog` - Available tests
- `hd_lab_test_panels` - Test panels (CBC, BMP, etc.)

### Additional Tables
- `hd_pharmacy_inventory` - Medication inventory (FEFO)
- `hd_payments` - Payment records (Mollie)
- `hd_messages` - Secure messaging (encrypted)
- `hd_emergency_transfers` - Emergency records
- `hd_security_events` - Security audit

All PHI data encrypted at rest using `HD_Encryption` class.

---

## ACF Medical Field Groups (11 Total - Code-Registered)

**Storage**: Programmatically registered via `class-hd-acf-integration.php`
**This means**: Safe to reinstall ACF Pro - no database dependencies

1. Patient Intake Fields
2. Medical History Fields
3. Vital Signs Fields
4. Symptom Assessment Fields
5. Mental Health Fields
6. Pediatric Assessment Fields
7. Pre-Procedure Fields
8. Follow-up Assessment Fields
9. Insurance Fields
10. Emergency Contact Fields
11. Patient Registration Fields

---

## Spectra Dashboard Blocks (8 Total)

All with render callbacks in respective module classes:

1. `patient-analytics-ai-2025`
2. `smart-appointment-calendar-2025`
3. `daily-schedule`
4. `ai-patient-search-2025`
5. `quick-actions`
6. `quantum-medical-form-2025` ⭐ Use for forms!
7. `appointment-booking`
8. `ai-medical-alerts-2025`

---

## Development Workflow

### CRITICAL: File Changes & SFTP Upload
**AFTER ANY FILE CHANGES, ALWAYS:**
1. List modified files with full relative paths
2. Provide explicit SFTP upload instructions
3. Wait for user confirmation before proceeding

**Format**:
```
📤 FILES TO UPLOAD VIA SFTP:
public_html/wp-content/plugins/helpingdoctors-ehr-pro/includes/class-example.php (modified)

Upload to: /public_html/wp-content/plugins/helpingdoctors-ehr-pro/
Then confirm when uploaded.
```

**Why**: User has ADHD - explicit instructions prevent missed steps and deployment errors.

### Code Quality Standards

#### PHP (WordPress Coding Standards)
```bash
composer install
vendor/bin/phpcs --standard=WordPress includes/ templates/
vendor/bin/phpcbf --standard=WordPress includes/ templates/
```

#### JavaScript (ESLint)
```bash
npm install
npm run lint:js
```

#### Accessibility
- All interactive elements: 44px minimum touch target
- ARIA labels on all controls
- Keyboard navigation support
- Color contrast: 4.5:1 minimum

### Gaza Performance Requirements

| Metric | Target | Why |
|--------|--------|-----|
| **Page Load** | <3s on 3G | Gaza network constraints |
| **First Contentful Paint** | <1.5s | Perceived performance |
| **Time to Interactive** | <5s | Usability threshold |
| **Offline Capability** | 100% core functions | Power outages |
| **Bundle Size** | <500KB critical | 2G compatibility |

**Strategies:**
- Aggressive caching: 30-day cache for static assets
- Minimal external dependencies: Self-hosted fonts, no CDN reliance
- Delta syncs: Only send changed data, not full records

---

## GDPR Compliance (UK Healthcare)

### Critical Requirements
1. **Cookie Consent**: Complianz or WP Cookie Consent plugin
   - Block non-essential cookies until consent
   - Equal prominence accept/reject buttons

2. **Privacy Policy**: Plain-language, accessible
   - What data collected, why, retention periods
   - Patient rights (access, correct, delete, export)

3. **Patient Portal Privacy Controls**:
   - Self-service data download (JSON, PDF, CSV)
   - View consent history
   - Request data deletion (with medical exception)
   - Access log (who viewed my records)

4. **Granular Consent**:
   - Medical treatment (required)
   - Data sharing with other clinics (optional)
   - Research participation (optional)
   - Communications/reminders (optional)

---

## Common Tasks

### Deploy Pages to Production
1. **Upload** `setup-frontend-pages.php` to plugin root via SFTP
2. **Navigate** to: `https://helpingdoctors.org/wp-content/plugins/helpingdoctors-ehr-pro/setup-frontend-pages.php`
3. **Click** "Create Enhanced Pages" button
4. **Verify** all pages created
5. **Test** each page on mobile/tablet/desktop

### Verify Ultimate Member Roles
1. **WordPress Admin** → Users → Roles
2. **Check** 27 roles exist (see list above)
3. **If missing**: Run role setup script or configure manually

### Reinstall Broken Plugins
**For each plugin:**
1. Download fresh copy from official source
2. WordPress Admin → Plugins → Add New → Upload
3. Activate plugin
4. Verify working (no fatal errors)

**Note**: ACF field groups are code-registered - safe to reinstall

---

## 🔧 Troubleshooting

### "Cannot redeclare function" Error
**Solution:** Check wp-config.php for duplicate constant definitions.

### "Required plugins not found"
**Solution:** Install ACF PRO (not free) and Ultimate Member.

### Medical forms don't appear
**Solution:** Verify ACF PRO is active, go to EHR Settings → System → Sync Field Groups.

### Database tables not created
**Solution:** Check PHP error logs, verify MySQL 8.0+, ensure CREATE TABLE permissions.

### Turnstile security not working
**Solution:** Verify Site Key and Secret Key, check domain matches Cloudflare settings.

### User roles not working
**Solution:** Go to Ultimate Member → User Roles, verify 27 medical roles exist.

---

## Working Partnership

### User's Role (Business Owner & Strategist)
- Provide strategic direction and feature priorities
- Make architectural decisions when options presented
- **Upload files via SFTP** after Claude provides explicit instructions
- **Test functionality** on staging/production
- **Provide feedback** on UX, design, bugs

### Claude's Role (Programming Partner)
- Implement features and bug fixes
- Research best practices and 2025 healthcare standards
- Maintain code quality, security, accessibility standards
- **Provide explicit SFTP upload instructions** after every change
- Be direct, make recommendations, call out issues

### Communication Style
- **Be direct and honest** - call out unproductive paths
- **Make recommendations** based on research and best practices
- **No placeholders** - everything must be production-ready
- **Explicit instructions** for ADHD workflow support
- **UK English** - organisation, specialisation, colour, centre

---

## Project-Specific Rules

### ADHD Workflow Support (Critical)
1. **After every file change**: List files and provide SFTP upload instructions
2. **Be explicit**: Don't assume steps - spell out everything with paths
3. **One phase at a time**: Complete fully before moving to next
4. **Clear checkpoints**: Confirm completion before proceeding

### Quality Standards (Non-Negotiable)
- **No placeholder content**: Every page fully functional from day one
- **Research-backed UX**: Use 2025 healthcare best practices
- **Thorough testing**: Mobile, accessibility, offline, GDPR, security
- **Production-ready design**: Beautiful, professional aesthetic out of the box
- **Gaza-appropriate**: Works in war zones, low connectivity, power outages

### Healthcare-Specific Considerations
- **HIPAA-aligned security**: Even though UK-focused, use US healthcare standards
- **Medical terminology accuracy**: Verify all clinical terms
- **Comprehensive validation**: Medical data integrity critical
- **Offline sync conflicts**: Handle gracefully with timestamps
- **Audit everything**: All PHI access logged with user, timestamp, action

---

## ⚠️ CRITICAL REMINDERS

1. **Never suggest WordPress CPT** for medical data (ADR-001 is FINAL)
2. **Never suggest Stripe** - Mollie is the payment gateway (ADR-002)
3. **Use UK English** throughout - organisation, specialisation, colour
4. **Check counts are correct** - 27 roles, 30 pages, 53 widgets
5. **Verify ACF PRO, not free** - Medical forms require PRO features
6. **Check error logs first** - Most issues show specific error messages
7. **Test in stages** - Don't try to fix everything at once
8. **Backup before changes** - Always recommend backups

---

## Reference Documentation

### Project Files
- `CURRENT-ARCHITECTURE-MAP.md` - Complete file inventory
- `DASHBOARD-WIDGET-CAPABILITY-MATRIX.md` - All 53 widgets
- `FRONTEND-APP-SPECIFICATION.md` - All 30 pages
- `ADR-001` through `ADR-006` - Architectural decisions
- `DETAILED-SPECIFICATIONS.md` - Full implementation specs
- `SHAFI-CHATBOT-SPECIFICATION.md` - AI chatbot (4,766 lines)

### External Resources
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [UK GDPR Guide for Healthcare](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)