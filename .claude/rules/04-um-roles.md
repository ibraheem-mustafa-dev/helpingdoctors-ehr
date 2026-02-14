# Ultimate Member Roles

**Project:** HelpingDoctors EHR Pro
**Critical:** Use UM roles ONLY, never WordPress roles

---

## Core Principle

This project uses **Ultimate Member for ALL role management**. There are 27 medical roles. NEVER use WordPress native roles (editor, author, subscriber).

---

## The 27 Medical Roles

### Clinical Staff
- `doctor` - Physicians
- `nurse` - Registered nurses
- `medical_assistant` - Clinical support
- `pharmacist` - Pharmacy staff
- `lab_technician` - Laboratory staff
- `radiologist` - Imaging specialists
- `therapist` - Physical/occupational therapists
- `dentist` - Dental practitioners
- `optometrist` - Eye care
- `paramedic` - Emergency medical

### Administrative
- `receptionist` - Front desk
- `practice_manager` - Clinic management
- `billing_staff` - Financial/billing
- `medical_records` - Records management
- `scheduler` - Appointment scheduling

### Specialty
- `surgeon` - Surgical specialists
- `anaesthetist` - Anaesthesia (UK spelling)
- `paediatrician` - Child specialists (UK spelling)
- `obstetrician` - Obstetrics/gynaecology
- `psychiatrist` - Mental health
- `cardiologist` - Heart specialists
- `neurologist` - Neurology
- `oncologist` - Cancer care
- `dermatologist` - Skin specialists

### Support
- `volunteer` - Volunteer staff
- `interpreter` - Language services
- `social_worker` - Patient support

---

## Role Checking

### ✅ Correct - UM Role Check
```php
// Get user's UM role
$um_role = um_get_user_role(get_current_user_id());

// Check specific role
if ($um_role === 'doctor') {
    // Doctor-specific functionality
}

// Check role group
$clinical_roles = ['doctor', 'nurse', 'medical_assistant', 'pharmacist'];
if (in_array($um_role, $clinical_roles)) {
    // Clinical staff functionality
}
```

### ❌ Wrong - WordPress Role Check
```php
// NEVER use these for medical access control
if (current_user_can('editor')) {}           // Wrong
if (is_user_logged_in() && is_admin()) {}   // Wrong
if (current_user_can('manage_options')) {}   // Wrong
```

---

## Permission Helpers

```php
// Use project-specific permission functions
if (hd_user_can_prescribe()) {}
if (hd_user_can_view_patient($patient_id)) {}
if (hd_user_can_access_lab_results()) {}
if (hd_user_can_edit_appointments()) {}
```

These functions internally check UM roles and return appropriate permissions.

---

## Role Hierarchy

```
Site Administrator (WordPress)
    └── Practice Manager (UM)
        ├── Doctor
        │   └── Can prescribe, diagnose, full patient access
        ├── Nurse
        │   └── Can view patients, administer medications
        ├── Receptionist
        │   └── Can schedule, view limited patient info
        └── Billing Staff
            └── Can view billing info only
```

---

## Checklist

- [ ] Using UM role checks, not WordPress roles?
- [ ] Using project permission helpers?
- [ ] Role-appropriate access control?
- [ ] No `current_user_can('editor')` patterns?
