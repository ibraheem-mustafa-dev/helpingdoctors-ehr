# WordPress Multisite Architecture

**Project:** HelpingDoctors EHR Pro
**Applies to:** All database queries, all file paths, all user operations

---

## Core Principle

This is a **WordPress Multisite** installation. Every database table, every user operation, every file path must account for the multisite context.

---

## Database Tables

### Table Prefix Pattern
```php
// WRONG - hardcoded prefix
$table = 'wp_hd_patients';

// CORRECT - uses blog-specific prefix
$table = $wpdb->prefix . 'hd_patients';
// Results in: wp_3_hd_patients (for blog ID 3)
```

### Blog ID Context
```php
// Get current blog ID
$blog_id = get_current_blog_id();

// Switch to specific blog context
switch_to_blog($blog_id);
// ... do work ...
restore_current_blog();
```

---

## Custom Tables (70+ exist)

Key tables with `wp_X_hd_` prefix:
- `wp_X_hd_patients`
- `wp_X_hd_appointments`
- `wp_X_hd_encounters`
- `wp_X_hd_clinics`
- `wp_X_hd_prescriptions`
- `wp_X_hd_lab_results`
- `wp_X_hd_staff_schedules`
- `wp_X_hd_audit_log`

---

## User Roles (UM-Only)

27 medical roles managed by Ultimate Member, NOT WordPress roles:
- Doctor, Nurse, Medical Assistant
- Receptionist, Practice Manager
- Pharmacist, Lab Technician
- And 20+ more specialty roles

```php
// WRONG - WordPress role check
if (current_user_can('editor')) {}

// CORRECT - UM role check
$um_role = um_get_user_role(get_current_user_id());
if ($um_role === 'doctor') {}
```

---

## File Paths

### Upload Directories
```php
// Site-specific uploads
$upload_dir = wp_upload_dir();
// Returns: /wp-content/uploads/sites/3/2025/12/

// NEVER hardcode paths
// WRONG
$path = '/wp-content/uploads/patients/';

// CORRECT
$path = $upload_dir['basedir'] . '/patients/';
```

---

## Checklist

- [ ] Using `$wpdb->prefix` for all table names?
- [ ] Using UM role checks, not WordPress roles?
- [ ] Using `wp_upload_dir()` for file paths?
- [ ] Handling `switch_to_blog()` / `restore_current_blog()` correctly?
