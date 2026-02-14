# Frontend-First Architecture

**Project:** HelpingDoctors EHR Pro
**Principle:** Medical staff should NEVER need wp-admin

---

## Core Principle

This is a **frontend-first application**. All medical workflows happen on frontend pages. The WordPress admin (wp-admin) is for site administrators only, not clinical staff.

---

## Architecture

```
Public Website
    └── Staff Login Page (/staff-login/)
        └── Staff Dashboard (/staff-dashboard/)
            ├── Patient Search
            ├── Appointments
            ├── Medical Records
            ├── Prescriptions
            ├── Lab Results
            ├── Messaging
            └── Reports

wp-admin (Site Admins Only)
    ├── User Management
    ├── Plugin Settings
    ├── System Configuration
    └── Audit Logs
```

---

## Page Structure

### 30 Frontend Pages
All medical functionality exists as WordPress pages with custom templates:

| Page | Template | Purpose |
|------|----------|---------|
| /staff-login/ | template-staff-login.php | UM login form |
| /staff-dashboard/ | template-dashboard.php | Role-based dashboard |
| /patients/ | template-patients.php | Patient management |
| /appointments/ | template-appointments.php | Scheduling |
| /prescriptions/ | template-prescriptions.php | E-prescribing |
| /lab-results/ | template-lab.php | Laboratory |
| /medical-records/ | template-records.php | Patient records |
| /messaging/ | template-messaging.php | Secure messaging |
| /video-consult/ | template-video.php | Telemedicine |

---

## URL Structure

```
helpingdoctors.org/
    ├── staff-login/           # Authentication
    ├── staff-dashboard/       # Main entry point
    ├── patients/              # Patient list
    ├── patients/view/{id}/    # Patient detail
    ├── patients/new/          # New patient
    ├── appointments/          # Calendar
    ├── appointments/new/      # Book appointment
    └── ...
```

---

## Implementation Pattern

### Template Files
```php
<?php
/**
 * Template Name: Staff Dashboard
 */

// Check authentication
if (!is_user_logged_in()) {
    wp_redirect(home_url('/staff-login/'));
    exit;
}

// Check role
$um_role = um_get_user_role(get_current_user_id());
if (!hd_can_access_dashboard($um_role)) {
    wp_die('Access denied');
}

get_header('staff');
?>

<main class="hd-dashboard">
    <?php 
    // Load role-specific dashboard
    hd_render_dashboard($um_role);
    ?>
</main>

<?php get_footer('staff'); ?>
```

---

## AJAX Handlers

All data operations via AJAX:

```php
// Register AJAX handler
add_action('wp_ajax_hd_search_patients', 'hd_search_patients_handler');

function hd_search_patients_handler() {
    // Verify nonce
    check_ajax_referer('hd_nonce', 'nonce');
    
    // Check permission
    if (!hd_user_can_search_patients()) {
        wp_send_json_error('Permission denied');
    }
    
    // Process request
    $results = hd_search_patients($_POST['query']);
    wp_send_json_success($results);
}
```

---

## Why Frontend-First?

1. **Simpler for clinical staff** - No wp-admin training needed
2. **Better security** - Reduced attack surface
3. **Custom UI** - Medical-optimised interface
4. **Mobile-friendly** - Responsive design
5. **Offline capability** - Service worker support

---

## Checklist

- [ ] Feature implemented on frontend page?
- [ ] No wp-admin dependency for medical workflows?
- [ ] AJAX handlers for data operations?
- [ ] Role-appropriate access control?
- [ ] Mobile-responsive implementation?
