# HelpingDoctors EHR Pro - Project Instructions

**Last Updated**: 2025-11-15
**Project Status**: Pre-Launch (95% backend complete, fixing blockers before deployment)

## Project Overview

**Name**: HelpingDoctors EHR Pro
**Type**: WordPress Plugin (Healthcare Electronic Health Records System)
**Primary Market**: Gaza healthcare facilities (humanitarian deployment)
**Secondary Market**: UK healthcare providers (GDPR-compliant)

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

## Current Status

### ✅ Backend: 100% Complete
- 50+ custom database tables with encryption
- Security layers (authentication, authorization, audit logging)
- Offline functionality (service worker, IndexedDB with 350MB storage, sync queue)
- REST API endpoints for all medical modules
- GDPR compliance infrastructure
- **5 Ultimate Member roles** (status: verify configuration)
- **11 ACF medical field groups** (programmatically registered in code)
- **8 Spectra dashboard blocks** with render callbacks
- Encryption system for PHI data
- Performance optimization framework

### ⚠️ Critical Blockers (Phase 0)
1. **LiteSpeed .htaccess Issue**: Lines 144-151 contain rules that triggered file deletion bug
2. **Performance Optimizer**: Disabled due to CSS media attribute corruption (3 bugs + 10 missing methods)
3. **Broken Plugins**: ACF Pro, SureCart, Better WP Security, Astra Pro Sites need

 reinstalling
4. **Pages Not Deployed**: All 6 pages built in code but not created in WordPress yet

### 🔄 Frontend Pages: Built but Not Deployed
All 6 pages designed with 2025 healthcare UX research, awaiting deployment:
1. **Staff Login** - MFA-ready, comprehensive accessibility
2. **Medical Dashboard** - Role-based, offline-first PWA, AI chatbot capability
3. **Patient Portal** - Self-service booking, secure messaging, offline access
4. **Patient Registration** - Step-by-step flow, GDPR consent
5. **Book Appointment** - Visual 3-step process, emergency indicators
6. **Medical Encounter** - SOAP note format, offline-capable, digital signature

**Plus:** Privacy Policy page for GDPR compliance

## Technical Architecture

### Core Dependencies
- **WordPress**: 6.0+ (Local WP for development, Hostinger for production)
- **Advanced Custom Fields Pro**: Medical data structure (11 field groups, code-registered)
- **Ultimate Member**: User roles and authentication (5 roles)
- **Spectra Pro**: Dashboard UI blocks (8 medical blocks)
- **WP Fastest Cache**: Page caching (replacing LiteSpeed Cache)
- **Complianz or WP Cookie Consent**: GDPR cookie management

### ❌ Plugins NOT to Use (Critical Decision)
- **WP Amelia**: Performance penalty (+1000ms), no HIPAA docs, no offline capability
- **Fluent Forms Pro**: 40-60hr migration, breaks existing ACF forms, no HIPAA BAA
- **LiteSpeed Cache**: File deletion bug, unsafe for medical systems

**Why**: Custom system is superior - offline-capable, HIPAA-aligned, Gaza-optimized

### Plugin Structure
```
helpingdoctors-ehr-pro/
├── includes/
│   ├── admin/              # Backend admin interfaces
│   ├── api/                # REST API endpoints
│   ├── security/           # Security, encryption, audit headers
│   ├── modules/            # Core medical modules (patients, appointments, encounters)
│   ├── database/           # 50+ table management
│   ├── integrations/       # ACF, UM, Spectra integrations
│   ├── frontend/           # Templates, AJAX handlers
│   ├── gdpr/               # GDPR compliance automation
│   ├── offline/            # Service worker, IndexedDB, sync
│   └── class-hd-performance-optimizer.php  # Currently disabled
├── templates/              # 6 page templates + privacy policy
├── assets/
│   ├── js/                 # Service worker, offline storage, accessibility
│   └── css/                # Mobile-first, Gaza-optimized styles
└── setup-frontend-pages-production.php  # Page creation script
```

### Database Architecture (50+ Tables)
- **Core**: hd_patients, hd_appointments, hd_encounters, hd_clinics
- **Medical**: hd_vitals, hd_prescriptions, hd_laboratory_results, hd_alerts
- **Communication**: hd_secure_messages, hd_reminder_queue, hd_refill_requests
- **GDPR**: hd_gdpr_requests, hd_consent_log, hd_access_log, hd_data_exports
- **Security**: hd_audit_logs, hd_signature_logs, hd_encryption_keys
- **Offline**: hd_sync_queue, hd_offline_changes

All PHI data encrypted at rest using HD_Encryption class.

### User Roles (Ultimate Member - 5 Roles)
**Status**: Need to verify configuration in WordPress

1. **Clinic Administrator**
   - Full access to all medical functions
   - User management, clinic settings
   - Redirect: `/medical-dashboard/`

2. **Doctor/Provider**
   - Patient management, encounters, prescriptions
   - Clinical decision support access
   - Redirect: `/medical-dashboard/`

3. **Nurse/Healthcare Assistant**
   - Vitals recording, patient viewing, scheduling
   - Limited prescription access
   - Redirect: `/medical-dashboard/`

4. **Receptionist**
   - Appointments, check-in, payments
   - No clinical data access
   - Redirect: `/staff-login/`

5. **Patient**
   - Own records, appointments, secure messaging
   - Portal access only
   - Redirect: `/patient-portal/`

### ACF Medical Field Groups (11 Total - Code-Registered)
**Storage**: Programmatically registered via `class-hd-acf-integration.php` using `acf_add_local_field_group()`
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

### Spectra Dashboard Blocks (8 Total - Functional)
All with render callbacks in respective module classes:

1. Upcoming Appointments
2. Recent Patients
3. Today's Schedule
4. Pending Refills
5. Laboratory Results
6. Clinical Alerts
7. Quick Actions
8. Patient Statistics

## Development Workflow

### CRITICAL: File Changes & SFTP Upload
**AFTER ANY FILE CHANGES, ALWAYS:**
1. List modified files with full relative paths
2. Provide explicit SFTP upload instructions
3. Wait for user confirmation before proceeding

**Format**:
```
📤 FILES TO UPLOAD VIA SFTP:
public_html/wp-content/plugins/helpingdoctors-ehr-pro/includes/class-hd-performance-optimizer.php (modified)
public_html/.htaccess (modified)

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

#### Security Requirements (Medical-Grade)
- **Nonce verification**: All forms, AJAX requests
- **Capability checks**: Role-based permissions on all admin functions
- **SQL Security**: Prepared statements only, never direct queries
- **Input sanitization**: `sanitize_text_field()`, `wp_kses_post()`, `esc_sql()`
- **Output escaping**: `esc_html()`, `esc_attr()`, `esc_url()`, `esc_js()`
- **Encryption**: All PHI data via `HD_Enhanced_Encryption` class (AES-256-GCM)
- **Audit logging**: All medical data access logged to `hd_audit_logs`

#### Accessibility Standards (WCAG 2.2 AA)
- **Minimum 16px font** (18px preferred for medical content)
- **44px touch targets** (exceeds 24px minimum)
- **Color contrast**: 4.5:1 for text, 3:1 for UI components
- **Keyboard navigation**: All interactive elements accessible
- **ARIA labels**: Screen reader support for all forms, buttons
- **Focus indicators**: Visible and clear (2px outline minimum)
- **Form validation**: Clear, immediate error messages
- **Consistent help**: Help icon in same location on all pages (WCAG 2.2 new)
- **No redundant entry**: Don't ask same info twice (WCAG 2.2 new)

#### Mobile-First CSS (Gaza Optimization)
- **Design for 320px** width first
- **Progressive enhancement** for tablet (768px), desktop (1024px+)
- **Touch-friendly**: 44px minimum tap targets, spacing between interactive elements
- **Bandwidth-conscious**: Optimize images, lazy loading, minimal external resources
- **Offline assets**: Critical CSS inlined, resources cached via service worker

## LiteSpeed Cache Issue & Resolution

### What Happened
1. HelpingDoctors plugin wrote optimization rules to `.htaccess` (lines 144-151)
2. LiteSpeed Cache plugin processed these rules
3. User clicked "Clear Cache" in WordPress admin
4. **LiteSpeed bug triggered**: Instead of deleting cache files, deleted ACTUAL plugin files
5. **Result**: ACF Pro, SureCart, Better WP Security, Astra Pro Sites lost core files

### Root Cause
LiteSpeed Cache has known bug: `.htaccess` modifications + aggressive cache clearing = file deletion

### Resolution
1. **Remove** `.htaccess` lines 144-151 (LiteSpeed optimization rules)
2. **Replace** LiteSpeed Cache with **WP Fastest Cache** (safe, no file management bugs)
3. **Reinstall** broken plugins (no custom modifications exist - safe to delete/reinstall)

## Performance Optimizer Status

**Location**: `includes/class-hd-performance-optimizer.php`
**Current Status**: Disabled in code (line 347: `// new HD_Performance_Optimizer(); // TEMP DISABLED`)
**Reason**: CSS media attribute corruption bug

### Critical Bugs (Must Fix Before Re-Enabling)
1. **CSS Media Bug**: Searches for single quotes `media='all'` but WordPress uses double `media="all"`
2. **10 Missing Methods**: Fatal errors waiting (generate_query_cache_key, compress_image, etc.)
3. **Cache Methods Missing**: delete_by_pattern(), cleanup_expired()

### Irreplaceable Features (Why We Can't Just Use WP Fastest Cache)
- Medical data caching with HIPAA-compliant invalidation
- Core Web Vitals monitoring by user type (doctor/nurse/patient)
- Performance budgets for medical workflows
- Medical query optimization for patient records
- Accessibility-aware lazy loading (WCAG compliance)
- Gaza-specific optimizations (low bandwidth, intermittent connectivity)

**No commercial plugin provides these medical-specific optimizations.**

### Fix Plan
**Phase 1** (Critical): Fix 3 bugs, add 10 missing methods (2 hours)
**Phase 2** (Later): Modernize to 2025 standards, add monitoring (8-10 hours)

## Gaza-Specific Features

### Offline Capability (Production-Ready)
- **Service Worker**: `assets/js/service-worker.js` (caches pages, assets, API responses)
- **IndexedDB Storage**: 350MB total
  - Patients: 50MB (~10,000 records)
  - Encounters: 100MB (~50,000 encounters)
  - Media: 200MB (~1,000 medical images)
- **Sync Queue**: Background sync when connection restored
- **Conflict Resolution**: Timestamp-based priority

### Emergency Features
- **One-click medical summary download** (evacuations)
- **QR code for emergency responders** (unconscious patient)
- **Offline-accessible critical info** (allergies, medications, blood type)
- **Anonymous mode** (for persecuted individuals - no PHI in local storage labels)

### Low-Bandwidth Optimization
- **2G/3G testing**: Simulate in Chrome DevTools
- **Progressive image loading**: Blur placeholder → full image
- **Aggressive caching**: 30-day cache for static assets
- **Minimal external dependencies**: Self-hosted fonts, no CDN reliance
- **Delta syncs**: Only send changed data, not full records

## GDPR Compliance (UK Healthcare)

### Critical Requirements (Pre-Launch)
1. **Cookie Consent**: Complianz or WP Cookie Consent plugin
   - Block non-essential cookies until consent
   - Equal prominence accept/reject buttons
   - Prior consent (no scripts before approval)

2. **Privacy Policy**: Plain-language, accessible
   - What data collected, why, retention periods
   - Patient rights (access, correct, delete, export)
   - Breach notification procedure
   - English version (Arabic after launch)

3. **Patient Portal Privacy Controls**:
   - Self-service data download (JSON, PDF, CSV)
   - View consent history
   - Request data deletion (with medical exception)
   - Access log (who viewed my records)

4. **Granular Consent**:
   - Medical treatment (required, non-optional)
   - Data sharing with other clinics (optional)
   - Research participation (optional)
   - Communications/reminders (optional)

### Data Subject Rights (Automated)
- **Right to Access**: One-click download via patient portal
- **Right to Rectification**: Self-service profile updates
- **Right to Erasure**: Request form (72-hour response)
- **Right to Data Portability**: JSON/PDF export formats
- **Right to Object**: Opt-out of non-essential processing

## Common Tasks

### Deploy Pages to Production
1. **Upload** `setup-frontend-pages.php` to plugin root via SFTP
2. **Navigate** to: `https://helpingdoctors.org/wp-content/plugins/helpingdoctors-ehr-pro/setup-frontend-pages.php`
3. **Click** "Create Enhanced Pages" button
4. **Verify** all 7 pages created (6 medical + privacy policy)
5. **Test** each page on mobile/tablet/desktop

### Fix .htaccess LiteSpeed Issue
1. **Edit** `.htaccess` in `public_html/`
2. **Remove** lines 144-151 (LiteSpeed optimization section)
3. **Save** file
4. **Upload** via SFTP to `/public_html/.htaccess`
5. **Test** site loads without errors

### Replace LiteSpeed Cache with WP Fastest Cache
1. **WordPress Admin** → Plugins
2. **Disable** LiteSpeed Cache plugin
3. **Install** WP Fastest Cache (free version)
4. **Activate** and configure:
   - ✅ Enable cache
   - ✅ Delete cache when post published
   - ✅ Mobile cache
   - ✅ Minify HTML
   - ✅ Combine CSS
   - ✅ GZip compression
   - ❌ Don't cache logged-in users
5. **Exclude pages**: `/patient-portal/`, `/staff-login/`, `/medical-encounter/`, `/patient-registration/`, `/book-appointment/`, `/medical-dashboard/`

### Reinstall Broken Plugins
**Plugins needing reinstall**: ACF Pro, SureCart, Better WP Security, Astra Pro Sites

**For each plugin:**
1. **Download** fresh copy from official source
2. **WordPress Admin** → Plugins → Add New → Upload
3. **Activate** plugin
4. **Verify** working (no fatal errors)

**Note**: No custom files exist in these plugins - safe to delete/reinstall

### Fix Performance Optimizer
**Status**: Requires code fixes (see PERFORMANCE-OPTIMIZER-ANALYSIS.md)
**After fixes provided:**
1. **Upload** fixed `class-hd-performance-optimizer.php` via SFTP
2. **Enable** in code (uncomment line 347)
3. **Test** pages load without CSS corruption
4. **Monitor** Core Web Vitals in Google Search Console

### Verify Ultimate Member Roles
1. **WordPress Admin** → Users → Roles
2. **Check** 5 roles exist:
   - Clinic Administrator
   - Doctor
   - Nurse
   - Receptionist
   - Patient
3. **If missing**: Run role setup script or configure manually

## Auto-Tracking Configuration

### Automatic Updates (Every 10 Messages)
Claude Code will automatically update:
- `LAUNCH-PLAN.md`: Progress log, task completion, phase updates
- `CONVERSATION-HANDOFF.md`: Current state, completed tasks, next priorities

**No manual tracking required from user** - focus on strategy and deployment.

### Message Counter
Updates occur every 10 message exchanges. Current session starts at message 1.

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
- **Track progress automatically** (LAUNCH-PLAN, CONVERSATION-HANDOFF)
- **Provide explicit SFTP upload instructions** after every change
- Be direct, make recommendations, call out issues

### Communication Style
- **Be direct and honest** - call out unproductive paths
- **Make recommendations** based on research and best practices
- **Clearly separate** "You do manually" vs "I implement in code"
- **No placeholders** - everything must be production-ready
- **Explicit instructions** for ADHD workflow support

## Project-Specific Rules

### ADHD Workflow Support (Critical)
1. **After every file change**: List files and provide SFTP upload instructions
2. **Every 10 messages**: Auto-update LAUNCH-PLAN.md and CONVERSATION-HANDOFF.md
3. **Be explicit**: Don't assume steps - spell out everything with paths
4. **One phase at a time**: Complete fully before moving to next
5. **Clear checkpoints**: Confirm completion before proceeding

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

## Current Focus & Next Steps

**Current Phase**: Phase 0 - Fix Critical Blockers
**Current Task**: Fix .htaccess LiteSpeed issue (remove lines 144-151)

**Next 3 Tasks**:
1. Fix .htaccess (remove LiteSpeed rules)
2. User manually replaces LiteSpeed Cache with WP Fastest Cache
3. Fix performance optimizer bugs (code implementation)

**After Phase 0**: Deploy pages, test visibility, add GDPR compliance, launch

## Reference Documentation

### Project Root Files
- `LAUNCH-PLAN.md`: Complete launch roadmap with auto-tracking
- `CONVERSATION-HANDOFF.md`: Current state checkpoint for session continuity
- `PERFORMANCE-OPTIMIZER-ANALYSIS.md`: Detailed bug analysis and fix plan
- `READY-TO-DEPLOY.md`: Deployment checklist
- `PRODUCTION-AUDIT-REPORT.md`: Quality audit results

### External Resources
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [ACF Documentation](https://www.advancedcustomfields.com/resources/)
- [Ultimate Member Docs](https://docs.ultimatemember.com/)
- [UK GDPR Guide for Healthcare](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)

## Notes

- **Backend**: 100% complete with all security, offline, database functionality
- **Frontend**: 100% designed with 2025 UX research, awaiting deployment
- **Blockers**: .htaccess, performance optimizer, plugin reinstalls
- **Launch Timeline**: 3-5 days (13-18 hours total work)
- **Post-Launch**: Phase 2 enhancements based on real user feedback from Gaza
