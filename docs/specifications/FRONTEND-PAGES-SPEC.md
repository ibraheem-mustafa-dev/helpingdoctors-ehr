# SPECIFICATION: Frontend Pages (30 Pages)

**Source:** FRONTEND-APP-SPECIFICATION.md
**Status:** ✅ Complete (page structure defined)
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR Pro has **30 front-end pages** divided into three categories:
- **Staff Portal:** 20 pages
- **Patient Portal:** 6 pages
- **Public Pages:** 4 pages

**Primary Goal:** Medical staff NEVER touch WordPress backend.

---

## Page Architecture

### Technology Stack
- **Frontend:** Spectra Pro blocks + custom components
- **Backend API:** WordPress REST API + custom endpoints
- **Forms:** Spectra `quantum-medical-form-2025` block
- **Auth:** Ultimate Member integration
- **Offline:** Service Worker + IndexedDB
- **Security:** Nonce validation, capability checks

### URL Structure
```
/staff-dashboard/           → Staff main dashboard
/staff/{feature}/           → Staff feature pages
/patient-portal/            → Patient main dashboard
/patient/{feature}/         → Patient feature pages
/{public-page}/             → Public pages
```

---

## Staff Portal (20 Pages)

### 1. Staff Dashboard (`/staff-dashboard/`)

**Purpose:** Central hub for medical staff

**Features:**
- Role-based KPI cards (patient count, appointments today, pending tasks)
- Today's schedule timeline
- Recent patients widget
- Notifications panel
- Quick actions grid (New Patient, Book Appointment, Emergency Transfer, etc.)
- Offline sync status indicator

**Permissions:** All staff roles

**Spectra Blocks:**
- `patient-analytics-ai-2025` for KPI cards
- `daily-schedule` for timeline
- `quick-actions` for action grid

**Current Files:**
- `templates/medical-dashboard.php`
- `includes/dashboard/class-hd-dashboard-customizer.php`

---

### 2. Clinic Setup (`/staff/clinic-setup/`)

**Purpose:** Create/edit/manage clinics

**Features:**
- List all clinics in organisation
- Create new clinic form (name, code, address, phone, email, timezone, hours, services, status)
- Edit existing clinic
- Soft delete clinic
- Assign staff to clinics

**Permissions:** `hd_org_owner`, `hd_medical_director`

**Current Files:**
- `includes/admin/class-hd-clinic-setup.php`

---

### 3. Patient Management (`/staff/patients/`)

**Purpose:** Search, view, register patients

**Features:**
- Patient search (name, ID, phone, email)
- Advanced filters (age range, conditions, clinic)
- Patient list table (sortable, paginated)
- Quick patient registration
- Access to patient dashboard

**Permissions:** All clinical staff (filtered by assigned clinics)

**Spectra Blocks:**
- `ai-patient-search-2025`
- `quantum-medical-form-2025` for registration

**GDPR:** Staff only see patients from their assigned clinics

---

### 4. Appointments (`/staff/appointments/`)

**Purpose:** Calendar, create/edit/cancel appointments

**Features:**
- Calendar view (day/week/month)
- Filter by clinic, provider, status
- Create appointment modal
- Edit/cancel appointments
- Check-in patients
- Print/email appointment details

**Permissions:** All staff roles

**Spectra Blocks:**
- `smart-appointment-calendar-2025`
- `appointment-booking`

---

### 5. Clinical Documentation (`/staff/encounter/`)

**Purpose:** SOAP notes, vital signs, treatment plans

**Features:**
- SOAP notes editor
- Vital signs recording (BP, HR, temp, SpO2, etc.)
- Diagnosis with ICD coding
- Treatment plan
- E-prescribing integration
- Lab order integration
- Clinical alerts
- Offline autosave
- Templates for common conditions

**Permissions:** Clinical roles only (`hd_physician`, `hd_nurse`, etc.)

**Current Files:**
- `templates/medical-encounter.php`
- `templates/medical-encounter-two-column.php`

---

### 6. Laboratory (`/staff/laboratory/`)

**Purpose:** Order labs, view results, manage alerts

**Features:**
- Order lab tests form (test catalog, common panels, custom orders, fasting requirements, priority)
- Lab results viewer (filter by patient/date/test, critical value alerts, trend charts, PDF export)
- Lab templates (diabetes follow-up, pre-op, annual physical)

**Permissions:** `hd_physician`, `hd_nurse_practitioner`, `hd_lab_technician`, `hd_lab_director`

**Current Files:**
- `includes/database/class-hd-laboratory-tables.php`

---

### 7. Prescriptions (`/staff/prescriptions/`)

**Purpose:** E-prescribing system

**Features:**
- Create prescription form (medication search, dosage, frequency, duration, quantity, refills, instructions, warnings)
- Medication templates for common conditions
- Prescription history by patient
- Refill request management
- Print/email prescriptions

**Permissions:** Prescribers only (`hd_physician`, `hd_nurse_practitioner`)

---

### 8. Staff Scheduling (`/staff/scheduling/`)

**Purpose:** Manage staff schedules, availability, time off

**Features:**
- Weekly schedule grid (staff x days)
- Add/edit staff shifts (clinic, times, breaks, roles)
- Recurring shifts setup
- Time off requests (submit, approve/deny)
- Shift swap requests
- Export to calendar (iCal)

**Permissions:**
- View own: All staff
- Edit own: All staff
- Edit others: `hd_org_owner`, `hd_medical_director`, `hd_clinic_admin`

---

### 9. Notifications (`/staff/notifications/`)

**Purpose:** Notification centre and settings

**Features:**
- Notification list (unread/read, filter by type)
- Notification types (clinical alerts, appointment reminders, task assignments, system messages)
- Notification settings (email/SMS/push preferences, notification types)
- Communication templates

**Permissions:** All staff

---

### 10. Payments (`/staff/payments/`)

**Purpose:** Process payments, generate invoices

**Features:**
- Payment entry form (patient, service, amount, method, receipt)
- Invoice generator
- Payment history by patient
- Payment reports (daily/weekly/monthly)
- Refund processing
- Payment settings (methods, currencies)

**Permissions:**
- Process: `hd_receptionist`, `hd_billing_specialist`
- Reports: Add `hd_org_owner`, `hd_clinic_admin`

**Current Files:**
- `includes/admin/class-hd-payment-settings.php`
- `includes/integrations/class-hd-mollie-integration.php`

---

### 11. Reports (`/staff/reports/`)

**Purpose:** Generate clinical and administrative reports

**Features:**
- Report types (patient demographics, appointment statistics, clinical activity, financial, lab utilisation, staff productivity)
- Date range selection
- Export formats (PDF, CSV, Excel)
- Scheduled reports (email daily/weekly/monthly)

**Permissions:**
- Basic: All staff (limited to own data)
- Full: `hd_org_owner`, `hd_medical_director`, `hd_clinic_admin`

**Current Files:**
- `includes/reports/class-hd-reports-page.php`

---

### 12. Medical Forms (`/staff/forms/`)

**Purpose:** Access ACF-based medical forms

**Features:**
- Form library (intake forms, consent forms, assessment forms)
- Fill and submit forms
- Form history

**Permissions:** All clinical staff

---

### 13. Emergency Transfers (`/staff/emergency-transfer/`)

**Purpose:** Mass casualty/transfer system

**Features:**
- Emergency transfer initiation
- Receiving facility selection
- Patient transfer documentation
- Handoff checklists
- Mass casualty mode toggle

**Permissions:** `hd_emergency_physician`, `hd_emergency_responder`, `hd_medical_director`

---

### 14. Audit Logs (`/staff/audit/`)

**Purpose:** GDPR access logs (own actions)

**Features:**
- View own data access history
- Filter by date, action type
- Export for compliance

**Permissions:** All staff (own logs only)

---

### 15. User Profile (`/staff/profile/`)

**Purpose:** Edit own profile, change password

**Features:**
- Personal information (name, contact, photo)
- Professional details (specialisations, qualifications)
- Password change
- Two-factor authentication setup
- Notification preferences

**Permissions:** All staff

---

### 16. Help Centre (`/staff/help/`)

**Purpose:** Documentation, FAQs, video tutorials

**Features:**
- Searchable FAQ
- Video tutorials
- User guides
- Contact support

**Permissions:** All staff

---

### 17. Feature Requests (`/staff/features/`)

**Purpose:** Submit feature requests/bug reports

**Features:**
- Submit feature request form
- Report bug form
- View request status

**Permissions:** All staff

---

### 18. Staff Directory (`/staff/directory/`)

**Purpose:** Find colleagues, contact info

**Features:**
- Staff search (name, role, clinic)
- Contact information
- Availability status

**Permissions:** All staff

---

### 19. Analytics Dashboard (`/staff/analytics/`)

**Purpose:** Org owners only - cross-clinic analytics

**Features:**
- Organisation-wide KPIs
- Clinic comparison charts
- Financial summaries
- Patient demographics
- Resource utilisation

**Permissions:** `hd_org_owner`, `hd_medical_director`

---

### 20. Settings (`/staff/settings/`)

**Purpose:** Personal preferences, interface customisation

**Features:**
- Dashboard layout preferences
- Theme settings (light/dark)
- Language preference
- Accessibility options
- Notification settings

**Permissions:** All staff

---

## Patient Portal (6 Pages)

### 21. Patient Dashboard (`/patient-portal/`)

**Purpose:** Patient home page

**Features:**
- Welcome header with health summary
- Upcoming appointments widget
- Recent prescriptions widget
- Lab results widget (new results highlighted)
- Secure messages widget
- Quick actions (Book Appointment, Message Doctor, View Records)

**Permissions:** `hd_patient` role

**Current Files:**
- `templates/patient-portal.php`

---

### 22. Book Appointment (`/book-appointment/`)

**Purpose:** Patient self-booking

**Features:**
- 3-step wizard:
  - Step 1: Select service/reason
  - Step 2: Choose date/time (show availability)
  - Step 3: Confirm booking
- Emergency notice banner (Gaza context)
- What to bring checklist
- Appointment confirmation (email/SMS)

**Current Files:**
- `templates/book-appointment.php`
- Mollie integration for payment

---

### 23. Medical Records (`/patient/records/`)

**Purpose:** View own medical history

**Features:**
- Encounters list (timeline view)
- Allergies, medications, conditions
- Vital signs history (charts)
- Lab results (sortable, filterable)
- Prescriptions
- Export to PDF (full medical history)

**Permissions:** `hd_patient` (own data only)

---

### 24. Messages (`/patient/messages/`)

**Purpose:** Secure messaging with care team

**Features:**
- Message inbox/sent
- Compose new message (select recipient)
- Message threads
- Attach files (images, documents)
- Read receipts
- Notification when new message arrives

**Permissions:** `hd_patient`

---

### 25. Prescriptions (`/patient/prescriptions/`)

**Purpose:** View prescriptions, request refills

**Features:**
- Active prescriptions list
- Prescription history
- Request refill button
- Medication information (purpose, side effects, instructions)
- Set medication reminders

**Permissions:** `hd_patient`

---

### 26. Profile & Settings (`/patient/settings/`)

**Purpose:** Manage account

**Features:**
- Personal information (address, phone, email)
- Emergency contacts
- Communication preferences
- Privacy settings
- Download my data (GDPR)
- Delete account (GDPR)

**Permissions:** `hd_patient`

---

## Public Pages (4 Pages)

### 27. Clinics Directory (`/clinics/`)

**Purpose:** Public list of clinics

**Features:**
- Grid of active clinics (Spectra card layout)
- Search by name, location, services
- Filter by services offered
- Map view (Google Maps when online)
- Each clinic card shows: name, address, phone, hours, services, staff count, "Book Appointment" button

**Permissions:** Public (no login required)

---

### 28. Individual Clinic Page (`/clinic/{slug}/`)

**Purpose:** Detailed clinic profile

**Features:**
- Clinic header (name, hero image, contact info)
- About section
- Services & departments list
- Staff roster (names, roles, photos, bios)
- Operating hours calendar
- Location map
- Contact form
- Book appointment CTA

**Permissions:** Public

---

### 29. Staff Login (`/staff-login/`)

**Purpose:** Staff authentication

**Features:**
- Ultimate Member login form
- Cloudflare Turnstile security
- Remember me checkbox
- Forgot password link
- Role-based redirect after login:
  - `hd_org_owner` → Analytics Dashboard
  - Clinical roles → Staff Dashboard
  - `hd_receptionist` → Appointments
  - `hd_patient` → Redirect to patient portal

**Current Files:**
- `templates/page-staff-login.php`

---

### 30. Patient Registration (`/patient-registration/`)

**Purpose:** New patient signup

**Features:**
- 4-step wizard with progress indicator:
  - Step 1: Account (username, email, password)
  - Step 2: Personal Info (name, DOB, address, phone)
  - Step 3: Medical Info (allergies, medications, conditions, insurance)
  - Step 4: Confirmation
- Password strength meter
- HIPAA compliance notice
- Terms/Privacy/HIPAA acknowledgement checkboxes
- Cloudflare Turnstile

**Current Files:**
- `templates/page-patient-registration.php`

---

## Page Summary Table

| # | Page | URL | Permissions | Status |
|---|------|-----|-------------|--------|
| 1 | Staff Dashboard | /staff-dashboard/ | All staff | ✅ |
| 2 | Clinic Setup | /staff/clinic-setup/ | Org owner, Director | ✅ |
| 3 | Patient Management | /staff/patients/ | Clinical staff | ✅ |
| 4 | Appointments | /staff/appointments/ | All staff | ✅ |
| 5 | Clinical Documentation | /staff/encounter/ | Clinical only | ✅ |
| 6 | Laboratory | /staff/laboratory/ | Lab staff | ✅ |
| 7 | Prescriptions | /staff/prescriptions/ | Prescribers | ✅ |
| 8 | Staff Scheduling | /staff/scheduling/ | All staff | ✅ |
| 9 | Notifications | /staff/notifications/ | All staff | ✅ |
| 10 | Payments | /staff/payments/ | Billing staff | ✅ |
| 11 | Reports | /staff/reports/ | All staff | ✅ |
| 12 | Medical Forms | /staff/forms/ | Clinical staff | ✅ |
| 13 | Emergency Transfers | /staff/emergency-transfer/ | Emergency staff | ✅ |
| 14 | Audit Logs | /staff/audit/ | All staff | ✅ |
| 15 | User Profile | /staff/profile/ | All staff | ✅ |
| 16 | Help Centre | /staff/help/ | All staff | ✅ |
| 17 | Feature Requests | /staff/features/ | All staff | ✅ |
| 18 | Staff Directory | /staff/directory/ | All staff | ✅ |
| 19 | Analytics Dashboard | /staff/analytics/ | Org owner, Director | ✅ |
| 20 | Settings | /staff/settings/ | All staff | ✅ |
| 21 | Patient Dashboard | /patient-portal/ | Patient | ✅ |
| 22 | Book Appointment | /book-appointment/ | Public/Patient | ✅ |
| 23 | Medical Records | /patient/records/ | Patient | ✅ |
| 24 | Messages | /patient/messages/ | Patient | ✅ |
| 25 | Prescriptions | /patient/prescriptions/ | Patient | ✅ |
| 26 | Profile & Settings | /patient/settings/ | Patient | ✅ |
| 27 | Clinics Directory | /clinics/ | Public | ✅ |
| 28 | Clinic Page | /clinic/{slug}/ | Public | ✅ |
| 29 | Staff Login | /staff-login/ | Public | ✅ |
| 30 | Patient Registration | /patient-registration/ | Public | ✅ |

---

## Testing Requirements

### For Each Page:

**Functional Testing:**
- [ ] Page loads without errors
- [ ] All features work as specified
- [ ] Form validation works
- [ ] AJAX calls succeed
- [ ] Data saves correctly

**Mobile Testing:**
- [ ] Responsive at 375px (iPhone SE)
- [ ] Touch targets 44px minimum
- [ ] No horizontal scroll
- [ ] Readable without zoom

**Accessibility (WCAG 2.2 AA):**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Sufficient colour contrast
- [ ] Focus indicators visible

**Performance:**
- [ ] Page loads < 3 seconds
- [ ] No blocking scripts
- [ ] Images optimised

**Security:**
- [ ] Proper nonce validation
- [ ] Capability checks
- [ ] GDPR clinic filtering
- [ ] XSS prevention

---

## Related Documentation

- [CURRENT-ARCHITECTURE-MAP.md](../CURRENT-ARCHITECTURE-MAP.md)
- [USER-ROLES-AND-WORKFLOWS.md](../USER-ROLES-AND-WORKFLOWS.md)
- [IMPLEMENTATION-ROLE-PATTERNS.md](./roles-permissions/IMPLEMENTATION-ROLE-PATTERNS.md)
