# HelpingDoctors EHR Pro - File Directory Reference

**Last Updated**: December 2025
**Purpose**: Quick reference for Claude AI sessions to navigate the codebase

---

## Summary Statistics

| Location | Files | Purpose |
|----------|-------|---------|
| `helpingdoctors-ehr-pro/` | 195 PHP, 38 JS, 22 CSS | Main plugin |
| `mu-plugins/` | 6 PHP | Must-use plugins |
| `wp-config-snippets/` | 2 PHP | Configuration templates |

---

## 1. Main Plugin: `public_html/wp-content/plugins/helpingdoctors-ehr-pro/`

### Root Files

| File | Purpose |
|------|---------|
| `Helping-Doctors-EHR-Pro.php` | Main plugin entry point |
| `composer.json` | PHP dependencies |
| `.eslintrc.json` | JavaScript linting config |

---

### includes/ - Core PHP Classes (195 files)

#### Root Classes (16 files)
| File | Purpose | Key Functions |
|------|---------|---------------|
| `class-hd-accessibility.php` | WCAG 2.2 AA accessibility features | |
| `class-hd-appointment-booking.php` | Appointment scheduling logic | |
| `class-hd-audit.php` | GDPR audit trail logging | |
| `class-hd-dashboard.php` | Dashboard rendering | |
| `class-hd-database.php` | Database query methods | Core CRUD operations |
| `class-hd-database-setup.php` | Table creation on activation | |
| `class-hd-database-upgrade.php` | Database migration scripts | |
| `class-hd-encryption.php` | AES-256-CBC encryption | PHI data protection |
| `class-hd-feature-requests.php` | Feature request system | |
| `class-hd-medical-encounter.php` | Clinical encounter management | |
| `class-hd-page-creator.php` | Automated page creation | |
| `class-hd-patient-portal.php` | Patient portal logic | |
| `class-hd-permissions.php` | GDPR data access control | Role-based permissions |
| `class-hd-roles.php` | Legacy roles (use comprehensive-roles instead) | |
| `class-hd-security.php` | Core security functions | |
| `class-hd-template-loader.php` | Template hierarchy loader | |

---

#### includes/accessibility/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-low-literacy-mode.php` | Simplified UI for low-literacy users |

---

#### includes/acf-fields/ (3 files)
| File | Purpose |
|------|---------|
| `class-acf-field-body-diagram.php` | Interactive body diagram field |
| `class-acf-field-medical-signature.php` | Digital signature capture field |
| `class-acf-field-vitals-calculator.php` | Auto-calculate BMI, BSA, etc. |

---

#### includes/admin/ (22 files)
| File | Purpose |
|------|---------|
| `class-hd-admin.php` | Main admin controller |
| `class-hd-admin-menus.php` | Admin menu registration |
| `class-hd-admin-settings.php` | Settings page handler |
| `class-hd-backup-admin.php` | Backup management UI |
| `class-hd-clinical-alerts-admin.php` | Clinical alerts configuration |
| `class-hd-clinic-setup.php` | Clinic onboarding wizard |
| `class-hd-dashboard-manager.php` | Dashboard widget management |
| `class-hd-database-repair.php` | Database repair utilities |
| `class-hd-laboratory-admin.php` | Lab test catalog management |
| `class-hd-multi-language-switcher.php` | Language switching UI |
| `class-hd-page-setup-admin.php` | Frontend page creation UI |
| `class-hd-payment-settings.php` | Mollie payment configuration |
| `class-hd-refill-admin.php` | Prescription refill management |
| `class-hd-reminder-admin.php` | Appointment reminder settings |
| `class-hd-role-cleanup-admin.php` | Role cleanup utilities |
| `class-hd-setup-wizard.php` | Initial setup wizard |
| `class-hd-staff-registration.php` | Staff user registration |
| `class-hd-user-profile-language.php` | User language preferences |
| `views/dashboard.php` | Admin dashboard template |
| `views/reports-page.php` | Reports page template |

---

#### includes/ai/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-chatbot-ui.php` | Shafi chatbot UI components |
| `class-hd-shafi-chatbot.php` | Shafi AI chatbot (4,766 lines) |

---

#### includes/ai-safety/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-ai-safety-admin.php` | AI safety configuration UI |
| `class-hd-ai-safety-controller.php` | AI output safety filtering |

---

#### includes/analytics/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-analytics-chatbot.php` | Analytics chatbot interface |
| `class-hd-predictive-analytics.php` | Predictive health analytics |

---

#### includes/api/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-rest-api.php` | REST API endpoints |

---

#### includes/authentication/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-webauthn.php` | Passwordless WebAuthn login |

---

#### includes/blocks/ (5 core + 53 widgets)

##### Core Block Files
| File | Purpose |
|------|---------|
| `class-hd-layout-editor.php` | GridStack layout editor |
| `class-hd-layout-templates.php` | Role-based layout templates |
| `class-hd-new-widgets-registration.php` | Widget registration |
| `class-hd-widget-permissions.php` | Widget visibility by role |
| `class-hd-widget-registry.php` | Central widget registry |

##### Dashboard Widgets (53 files in widgets/)
**Clinical (16)**
- `class-hd-widget-code-status-alerts.php`
- `class-hd-widget-critical-alerts.php`
- `class-hd-widget-critical-values.php`
- `class-hd-widget-diagnosis-trends.php`
- `class-hd-widget-drug-interactions.php`
- `class-hd-widget-fall-risk-indicator.php`
- `class-hd-widget-medication-admin.php`
- `class-hd-widget-patient-demographics.php`
- `class-hd-widget-patient-queue.php`
- `class-hd-widget-patient-search.php`
- `class-hd-widget-patient-stats.php`
- `class-hd-widget-recent-patients.php`
- `class-hd-widget-treatment-outcomes.php`
- `class-hd-widget-triage-board.php`
- `class-hd-widget-vital-signs.php`
- `class-hd-widget-work-in-progress-notes.php`

**Scheduling (7)**
- `class-hd-widget-appointment-calendar.php`
- `class-hd-widget-appointment-stats.php`
- `class-hd-widget-daily-schedule.php`
- `class-hd-widget-todays-schedule.php`
- `class-hd-widget-counseling-schedule.php`
- `class-hd-widget-surgery_schedule.php`
- `class-hd-widget-therapy_schedule.php`

**Management (11)**
- `class-hd-widget-audit-summary.php`
- `class-hd-widget-bed-availability.php`
- `class-hd-widget-department-heatmap.php`
- `class-hd-widget-donor-dashboard.php`
- `class-hd-widget-equipment-status.php`
- `class-hd-widget-new-patient.php`
- `class-hd-widget-referral-tracking.php`
- `class-hd-widget-security-alerts.php`
- `class-hd-widget-supply-shortages.php`
- `class-hd-widget-system-status.php`
- `class-hd-widget-visit-trends.php`

**Administrative (7)**
- `class-hd-widget-claims-denial-rate.php`
- `class-hd-widget-copay-tracker.php`
- `class-hd-widget-insurance-eligibility.php`
- `class-hd-widget-pending-tasks.php`
- `class-hd-widget-revenue-tracker.php`
- `class-hd-widget-search.php`
- `class-hd-widget-unanswered-messages.php`

**Laboratory (6)**
- `class-hd-widget-lab-queue.php`
- `class-hd-widget-pending-results.php`
- `class-hd-widget-quality-control.php`
- `class-hd-widget-imaging_queue.php`

**Pharmacy (3)**
- `class-hd-widget-inventory-alerts.php`
- `class-hd-widget-prescription-queue.php`
- `class-hd-widget-refill-requests.php`

**Specialty (3)**
- `class-hd-widget-emergency-queue.php`
- `class-hd-widget-operating-room-status.php`
- `class-hd-widget-telehealth-queue.php`
- `class-hd-widget-social-work-caseload.php`

**Utility**
- `class-hd-widget-custom-html.php`
- `class-hd-widget-quick-actions.php`

---

#### includes/cache/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-cache-manager.php` | Cache management |
| `class-hd-redis-cache.php` | Redis cache integration |

---

#### includes/certificates/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-death-certificate.php` | Death certificate generation |

---

#### includes/clinical/ (5 files)
| File | Purpose |
|------|---------|
| `class-hd-clinical-decision-support.php` | CDS alerts and recommendations |
| `class-hd-icd11-integration.php` | ICD-11 diagnosis codes |
| `class-hd-loinc-integration.php` | LOINC lab test codes |
| `class-hd-smart-triage.php` | AI-assisted triage |
| `class-hd-snomed-integration.php` | SNOMED CT terminology |

---

#### includes/communication/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-internal-messaging.php` | Staff messaging system |
| `class-hd-secure-messaging.php` | Encrypted patient messaging |

---

#### includes/compat/ (1 file)
| File | Purpose |
|------|---------|
| `theme-compat.php` | Theme compatibility fixes |

---

#### includes/cultural/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-islamic-calendar.php` | Hijri calendar support |

---

#### includes/dashboard/ (1 file)
| File | Purpose | Lines |
|------|---------|-------|
| `class-hd-dashboard-customizer.php` | GridStack drag-drop dashboard | 1,565 |

---

#### includes/data/ (1 file)
| File | Purpose | Status |
|------|---------|--------|
| `production-pages-content.php` | Page content definitions | DEPRECATED |

---

#### includes/database/ (15 files)
| File | Purpose |
|------|---------|
| `class-hd-alerts-tables.php` | Clinical alerts tables |
| `class-hd-death-certificate-tables.php` | Death certificate tables |
| `class-hd-documents-tables.php` | Document storage tables |
| `class-hd-gdpr-tables.php` | GDPR consent tables |
| `class-hd-growth-charts-tables.php` | Paediatric growth tables |
| `class-hd-laboratory-tables.php` | Lab system tables |
| `class-hd-mass-casualty-tables.php` | Mass casualty tables |
| `class-hd-messaging-tables.php` | Messaging tables |
| `class-hd-mobile-clinic-tables.php` | Mobile clinic tables |
| `class-hd-ocr-tables.php` | OCR document tables |
| `class-hd-outbreak-tables.php` | Outbreak tracking tables |
| `class-hd-refill-tables.php` | Prescription refill tables |
| `class-hd-reminder-tables.php` | Reminder system tables |
| `class-hd-signature-tables.php` | Digital signature tables |
| `class-hd-vaccination-tables.php` | Vaccination record tables |

---

#### includes/documents/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-document-manager.php` | Document upload/storage |

---

#### includes/emergency/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-mass-casualty.php` | Mass casualty incident management |
| `class-hd-patient-photo-match.php` | Photo-based patient identification |

---

#### includes/frontend/ (5 files)
| File | Purpose |
|------|---------|
| `class-hd-ajax.php` | AJAX handlers |
| `class-hd-frontend.php` | Frontend controller |
| `class-hd-shortcodes.php` | 27 shortcode definitions |
| `class-hd-specialty-pages-ajax.php` | Specialty page AJAX |
| `class-hd-utility-strip.php` | Accessibility toolbar |

---

#### includes/gdpr/ (3 files)
| File | Purpose |
|------|---------|
| `class-hd-cookie-consent.php` | Cookie consent management |
| `class-hd-gdpr-automation.php` | Automated GDPR compliance |
| `class-hd-gdpr-compliance.php` | GDPR compliance controller |

---

#### includes/helpers/ (3 files)
| File | Purpose |
|------|---------|
| `class-hd-acf-helper.php` | ACF field helpers |
| `class-hd-i18n-helpers.php` | Internationalisation helpers |
| `class-hd-i18n-helpers-extended.php` | Extended i18n support |

---

#### includes/insurance/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-claims-manager.php` | Insurance claims management |
| `class-hd-cms1500-generator.php` | CMS-1500 form generation |

---

#### includes/integrations/ (12 files)
| File | Purpose | Key Info |
|------|---------|----------|
| `class-hd-acf-integration.php` | ACF Pro integration | 11 field groups |
| `class-hd-acf-medical-forms.php` | ACF medical form builder | |
| `class-hd-ai-chatbot-integration.php` | AI chatbot integration | |
| `class-hd-astra-integration.php` | Astra theme integration | |
| `class-hd-comprehensive-roles.php` | **27 medical roles** | Lines 34-78 |
| `class-hd-fda-api.php` | FDA drug database API | |
| `class-hd-jitsi-integration.php` | Jitsi video (360p Gaza) | |
| `class-hd-mollie-integration.php` | Mollie payments | |
| `class-hd-spectra-blocks.php` | Spectra block registration | |
| `class-hd-spectra-integration.php` | Spectra Pro integration | |
| `class-hd-surecart-integration.php` | SureCart integration | |
| `class-hd-twilio-integration.php` | Twilio SMS/voice | |
| `class-hd-um-roles-safety.php` | Ultimate Member role safety | |

---

#### includes/interoperability/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-fhir-export.php` | HL7 FHIR data export |

---

#### includes/inventory/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-inventory-manager.php` | FEFO inventory management |

---

#### includes/laboratory/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-lab-notifications.php` | Critical lab value alerts |
| `class-hd-laboratory-system.php` | Lab workflow management |

---

#### includes/mobile/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-mobile-clinics.php` | Mobile clinic tracking |

---

#### includes/modules/ (8 files)
| File | Purpose |
|------|---------|
| `class-hd-appointments.php` | Appointment CRUD |
| `class-hd-clinics.php` | Clinic CRUD |
| `class-hd-encounters.php` | Encounter CRUD |
| `class-hd-patients.php` | Patient CRUD |
| `class-hd-payments.php` | Payment CRUD |
| `class-hd-prescriptions.php` | Prescription CRUD |
| `class-hd-staff-schedules.php` | Staff schedule CRUD |
| `class-hd-user-clinics.php` | User-clinic assignments |

---

#### includes/notifications/ (2 files)
| File | Purpose |
|------|---------|
| `class-hd-appointment-reminders.php` | Appointment reminders |
| `class-hd-enhanced-reminders.php` | Multi-channel reminders |

---

#### includes/ocr/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-ocr-processor.php` | Document OCR processing |

---

#### includes/offline/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-crdt-sync.php` | CRDT offline sync |

---

#### includes/outbreak/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-outbreak-tracker.php` | Disease outbreak tracking |

---

#### includes/pages/ (1 file)
| File | Purpose |
|------|---------|
| `privacy-policy-content.php` | Privacy policy content |

---

#### includes/pediatric/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-growth-charts.php` | WHO growth charts |

---

#### includes/pharmacy/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-pharmacy-dispense.php` | Medication dispensing |

---

#### includes/prescriptions/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-prescription-refill.php` | Refill request handling |

---

#### includes/reports/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-reports-page.php` | Report generation |

---

#### includes/safety/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-drug-interactions.php` | Drug interaction checking |

---

#### includes/security/ (13 files)
| File | Purpose |
|------|---------|
| `class-hd-api-security.php` | API authentication |
| `class-hd-backup-encryption.php` | Backup encryption |
| `class-hd-dashboard-permissions.php` | Dashboard access control |
| `class-hd-emergency-wipe.php` | Emergency data wipe |
| `class-hd-enhanced-encryption.php` | Enhanced encryption |
| `class-hd-hostinger-optimization.php` | Hostinger-specific optimisations |
| `class-hd-security-headers.php` | Security headers |
| `class-hd-security-helpers.php` | Security utility functions |
| `class-hd-security-monitor.php` | Security event monitoring |
| `class-hd-sql-security.php` | SQL injection prevention |
| `class-hd-turnstile.php` | Cloudflare Turnstile |
| `class-hd-um-security.php` | Ultimate Member security |
| `class-hd-user-permission-overrides.php` | Permission overrides |
| `class-hd-vulnerability-scanner.php` | Security scanning |

---

#### includes/shortcodes/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-privacy-policy-shortcode.php` | Privacy policy shortcode |

---

#### includes/signature/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-digital-signature.php` | Digital signatures |

---

#### includes/staff/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-staff-profile-enhancement.php` | Staff profile fields |

---

#### includes/translations/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-auto-translate.php` | Auto-translation |

---

#### includes/vaccination/ (1 file)
| File | Purpose |
|------|---------|
| `class-hd-vaccination-campaigns.php` | Vaccination campaign management |

---

### templates/ - Page Templates (65 files)

#### Root Templates
| File | Purpose |
|------|---------|
| `book-appointment.php` | Appointment booking |
| `medical-dashboard.php` | Staff dashboard |
| `medical-encounter.php` | Clinical encounter |
| `medical-encounter-two-column.php` | Two-column encounter |
| `patient-portal.php` | Patient portal |
| `single-clinic.php` | Individual clinic page |

#### Page Templates (page-*.php)
| File | Purpose |
|------|---------|
| `page-analytics-dashboard.php` | Analytics dashboard |
| `page-appointments.php` | Appointments management |
| `page-audit-logs.php` | Audit log viewer |
| `page-book-appointment.php` | Appointment booking |
| `page-clinics-directory.php` | Clinics directory |
| `page-clinic-setup.php` | Clinic setup wizard |
| `page-document-scanner.php` | Document scanner |
| `page-document-scanner-enhanced.php` | Enhanced scanner |
| `page-emergency-transfer.php` | Emergency transfers |
| `page-feature-requests.php` | Feature requests |
| `page-gridstack-dashboard.php` | GridStack dashboard |
| `page-help-centre.php` | Help centre |
| `page-insurance-claims.php` | Insurance claims |
| `page-inventory.php` | Inventory management |
| `page-laboratory.php` | Laboratory system |
| `page-lab-queue.php` | Lab queue |
| `page-lab-results-entry.php` | Lab results entry |
| `page-mass-casualty.php` | Mass casualty |
| `page-medical-dashboard.php` | Medical dashboard |
| `page-medical-encounter.php` | Medical encounter |
| `page-medical-forms.php` | Medical forms |
| `page-mental-health.php` | Mental health |
| `page-messages.php` | Staff messages |
| `page-notifications.php` | Notifications |
| `page-patient-lab-results.php` | Patient lab results |
| `page-patient-management.php` | Patient management |
| `page-patient-medical-records.php` | Medical records |
| `page-patient-messages.php` | Patient messages |
| `page-patient-portal.php` | Patient portal |
| `page-patient-prescriptions-view.php` | Prescription view |
| `page-patient-registration.php` | Patient registration |
| `page-patient-settings.php` | Patient settings |
| `page-payments.php` | Payment management |
| `page-pharmacy-queue.php` | Pharmacy queue |
| `page-physical-therapy.php` | Physical therapy |
| `page-prescriptions.php` | Prescriptions |
| `page-radiology.php` | Radiology |
| `page-referrals.php` | Referrals |
| `page-reports.php` | Reports |
| `page-settings.php` | Settings |
| `page-staff-directory.php` | Staff directory |
| `page-staff-login.php` | Staff login |
| `page-staff-scheduling.php` | Staff scheduling |
| `page-user-profile.php` | User profile |
| `page-video-consultation.php` | Video consultation |

#### Subdirectories
| Directory | Files |
|-----------|-------|
| `admin/` | `page-outbreak-tracking.php` |
| `gdpr/` | `cookie-consent-banner.php`, `cookie-settings-page.php` |
| `partials/` | `patient-photo-capture.php` |
| `shortcodes/` | 9 shortcode templates |

---

### assets/ - Frontend Assets

#### CSS (22 files)
| File | Purpose |
|------|---------|
| `accessibility.css` | WCAG styles |
| `admin.css` | Admin styles |
| `ai-safety-admin.css` | AI safety admin |
| `appointment-booking.css` | Booking UI |
| `blocks.css` | Block styles |
| `blocks-editor.css` | Editor styles |
| `chatbot-widget.css` | Chatbot UI |
| `cookie-consent.css` | Cookie banner |
| `dark-mode.css` | Dark mode |
| `dashboard-manager.css` | Dashboard manager |
| `drug-interaction-warnings.css` | Drug warnings |
| `frontend.css` | Frontend styles |
| `hd-analytics-chatbot.css` | Analytics chatbot |
| `hd-shafi-chatbot.css` | Shafi chatbot |
| `health-icons.css` | Medical icons |
| `internal-messaging.css` | Messaging UI |
| `layout-editor.css` | Layout editor |
| `low-literacy-mode.css` | Low literacy |
| `medical-encounter.css` | Encounter UI |
| `patient-portal.css` | Patient portal |
| `rtl.css` | RTL support |
| `utility-strip.css` | Utility strip |

#### JavaScript (38 files)
| File | Purpose |
|------|---------|
| `accessibility.js` | Accessibility features |
| `admin.js` | Admin functionality |
| `ai-safety-admin.js` | AI safety admin |
| `appointment-booking.js` | Booking logic |
| `blocks-editor.js` | Block editor |
| `blocks-frontend.js` | Block frontend |
| `chatbot-widget.js` | Chatbot widget |
| `color-contrast.js` | Contrast checking |
| `comprehensive-lazy-loading.js` | Lazy loading |
| `cookie-consent.js` | Cookie consent |
| `core-web-vitals-optimization.js` | Performance |
| `crdt-sync.js` | CRDT sync |
| `critical-rendering-path.js` | CRP optimisation |
| `dashboard-manager.js` | Dashboard manager |
| `drug-interaction-checker.js` | Drug checks |
| `frontend.js` | Frontend core |
| `hd-analytics-chatbot.js` | Analytics chatbot |
| `hd-dashboard-customizer.js` | Dashboard customiser |
| `hd-shafi-chatbot.js` | Shafi chatbot |
| `image-font-optimization.js` | Asset optimisation |
| `internal-messaging.js` | Messaging |
| `keyboard-navigation.js` | Keyboard nav |
| `layout-editor.js` | Layout editor |
| `low-literacy-mode.js` | Low literacy |
| `medical-encounter.js` | Encounter logic |
| `mobile-performance.js` | Mobile performance |
| `ocr-multi-language.js` | Multi-language OCR |
| `ocr-scanner.js` | OCR scanning |
| `ocr-scanner-enhanced.js` | Enhanced OCR |
| `offline-storage.js` | IndexedDB storage |
| `patient-photo-capture.js` | Photo capture |
| `screen-reader.js` | Screen reader |
| `service-worker.js` | Service worker |
| `service-worker-register.js` | SW registration |
| `touch-gestures.js` | Touch gestures |
| `turnstile-handler.js` | Turnstile captcha |
| `utility-strip.js` | Utility strip |
| `voice-input.js` | Voice input |
| `webauthn.js` | WebAuthn |

#### Other Assets
| Directory | Contents |
|-----------|----------|
| `fonts/` | Plus Jakarta Sans, Roboto |
| `icons/` | Medical icons |
| `images/` | UI images |
| `tessdata/` | Tesseract OCR data |
| `js/vendor/tesseract/` | Tesseract.js library |

---

## 2. MU-Plugins: `public_html/wp-content/mu-plugins/`

| File | Purpose | Status |
|------|---------|--------|
| `hd-cron-intervals.php` | Adds 60-second cron schedule | Active |
| `hd-role-visibility.php` | Role-based block visibility for Spectra | Active |
| `hd-wp68-guard.php` | Suppresses WP 6.8 block theme notices | Active |
| `hostinger-auto-updates.php` | Hostinger auto-updates | Hostinger default |
| `hostinger-preview-domain.php` | Hostinger preview domain | Hostinger default |
| `restore-theme-capabilities.php` | Restores admin theme capabilities | Active |

---

## 3. wp-config-snippets: `public_html/wp-config-snippets/`

| File | Purpose |
|------|---------|
| `bootstrap.php` | Loads snippets and autoloader |
| `required-constants.php` | Required wp-config.php constants |

### Required Constants (from required-constants.php)
```php
// Cloudflare Turnstile
HD_TURNSTILE_SITE_KEY
HD_TURNSTILE_SECRET_KEY

// Data Encryption
HD_ENCRYPTION_KEY

// Cloudflare AI (optional)
HD_CLOUDFLARE_ACCOUNT_ID
HD_CLOUDFLARE_API_TOKEN

// Security
DISALLOW_FILE_EDIT
DISALLOW_FILE_MODS
FORCE_SSL_ADMIN
WP_CACHE
```

---

## Quick Navigation

### Key Files for Common Tasks

| Task | File |
|------|------|
| Add new role | `includes/integrations/class-hd-comprehensive-roles.php` |
| Add new widget | `includes/blocks/widgets/class-hd-widget-*.php` |
| Modify permissions | `includes/class-hd-permissions.php` |
| Database queries | `includes/class-hd-database.php` |
| Add shortcode | `includes/frontend/class-hd-shortcodes.php` |
| Add page template | `templates/page-*.php` |
| GridStack customiser | `includes/dashboard/class-hd-dashboard-customizer.php` |
| Encryption | `includes/class-hd-encryption.php` |
| GDPR compliance | `includes/gdpr/class-hd-gdpr-compliance.php` |
| REST API | `includes/api/class-hd-rest-api.php` |

### Files to Avoid (Deprecated)
| File | Reason |
|------|--------|
| `includes/data/production-pages-content.php` | Incomplete, hardcoded URLs |
| `includes/class-hd-roles.php` | Use comprehensive-roles instead |

---

## Version History

| Date | Changes |
|------|---------|
| December 2025 | Initial creation |
