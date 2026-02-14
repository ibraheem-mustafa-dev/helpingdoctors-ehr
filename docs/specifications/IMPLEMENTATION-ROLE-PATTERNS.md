# IMPLEMENTATION: Role & Permission Patterns

**Source:** CURRENT-ARCHITECTURE-MAP.md, ADR-003-dashboard-widget-architecture.md
**Status:** ✅ Complete (27 roles, 13 templates)
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR uses **27 medical roles** organised into **13 template groups** for dashboard customisation. Roles are managed via Ultimate Member with custom capabilities.

**Key Stats:**
- 27 medical roles (not 5 as previously documented)
- 13 dashboard template groups
- Role-based widget visibility
- GDPR clinic filtering on all data access

---

## File Locations

| File | Purpose |
|------|---------|
| `includes/integrations/class-hd-comprehensive-roles.php` | Role definitions |
| `includes/class-hd-permissions.php` | Permission checks |
| `includes/blocks/class-hd-widget-permissions.php` | Widget visibility |
| `includes/dashboard/class-hd-dashboard-customizer.php` | Role templates |

---

## 27 Medical Roles

### Role Definition (Lines 34-78)

```php
<?php
/**
 * File: includes/integrations/class-hd-comprehensive-roles.php
 */

class HD_Comprehensive_Roles {
    
    /**
     * All medical role keys
     * Referenced in UM role sync
     */
    const ROLE_KEYS = [
        // Executive (3)
        'hd_org_owner',
        'hd_system_admin',
        'hd_medical_director',
        
        // Clinic Management (1)
        'hd_clinic_admin',
        
        // Physician Core (4)
        'hd_physician',
        'hd_surgeon',
        'hd_nurse_practitioner',
        'hd_physician_assistant',
        
        // Emergency (2)
        'hd_emergency_physician',
        'hd_emergency_responder',
        
        // Nursing (3)
        'hd_registered_nurse',
        'hd_lpn',
        'hd_medical_assistant',
        
        // Pharmacy (2)
        'hd_pharmacist',
        'hd_pharmacy_tech',
        
        // Laboratory (2)
        'hd_lab_director',
        'hd_lab_technician',
        
        // Imaging (1)
        'hd_radiologic_tech',
        
        // Therapy (3)
        'hd_physical_therapist',
        'hd_mental_health',
        'hd_social_worker',
        
        // Administrative (2)
        'hd_billing_specialist',
        'hd_medical_records',
        
        // Front Desk (1)
        'hd_receptionist',
        
        // Patient (1)
        'hd_patient',
        
        // Humanitarian (1)
        'hd_volunteer',
    ];
}
```

---

## 13 Template Groups → 27 Roles

### Template Mapping

| # | Template Group | Roles | Default Widgets |
|---|----------------|-------|-----------------|
| 1 | **Executive** | org_owner, system_admin, medical_director | 12 widgets (overview) |
| 2 | **Clinic Management** | clinic_admin | 10 widgets (operations) |
| 3 | **Physician Core** | physician, surgeon, nurse_practitioner, physician_assistant | 8 widgets (patient care) |
| 4 | **Emergency** | emergency_physician, emergency_responder | 8 widgets (ER focus) |
| 5 | **Nursing** | registered_nurse, lpn, medical_assistant | 8 widgets (bedside) |
| 6 | **Pharmacy** | pharmacist, pharmacy_tech | 6 widgets (dispensing) |
| 7 | **Laboratory** | lab_director, lab_technician | 6 widgets (lab workflow) |
| 8 | **Imaging** | radiologic_tech | 5 widgets (imaging) |
| 9 | **Therapy** | physical_therapist, mental_health, social_worker | 6 widgets (therapy) |
| 10 | **Administrative** | billing_specialist, medical_records | 6 widgets (admin) |
| 11 | **Front Desk** | receptionist | 5 widgets (check-in) |
| 12 | **Patient Portal** | patient | 4 widgets (self-service) |
| 13 | **Humanitarian** | volunteer | 5 widgets (field work) |

### Template Implementation

```php
<?php
/**
 * File: includes/dashboard/class-hd-dashboard-customizer.php
 */

public function get_role_template_group(string $role): string {
    $template_groups = [
        // Executive
        'hd_org_owner' => 'executive',
        'hd_system_admin' => 'executive',
        'hd_medical_director' => 'executive',
        
        // Clinic Management
        'hd_clinic_admin' => 'clinic_management',
        
        // Physician Core
        'hd_physician' => 'physician_core',
        'hd_surgeon' => 'physician_core',
        'hd_nurse_practitioner' => 'physician_core',
        'hd_physician_assistant' => 'physician_core',
        
        // Emergency
        'hd_emergency_physician' => 'emergency',
        'hd_emergency_responder' => 'emergency',
        
        // Nursing
        'hd_registered_nurse' => 'nursing',
        'hd_lpn' => 'nursing',
        'hd_medical_assistant' => 'nursing',
        
        // Pharmacy
        'hd_pharmacist' => 'pharmacy',
        'hd_pharmacy_tech' => 'pharmacy',
        
        // Laboratory
        'hd_lab_director' => 'laboratory',
        'hd_lab_technician' => 'laboratory',
        
        // Imaging
        'hd_radiologic_tech' => 'imaging',
        
        // Therapy
        'hd_physical_therapist' => 'therapy',
        'hd_mental_health' => 'therapy',
        'hd_social_worker' => 'therapy',
        
        // Administrative
        'hd_billing_specialist' => 'administrative',
        'hd_medical_records' => 'administrative',
        
        // Front Desk
        'hd_receptionist' => 'front_desk',
        
        // Patient
        'hd_patient' => 'patient_portal',
        
        // Humanitarian
        'hd_volunteer' => 'humanitarian',
    ];
    
    return $template_groups[$role] ?? 'physician_core';
}
```

---

## Core Methods

### Check User Role

```php
<?php
/**
 * Check if user has specific medical role
 */
public static function user_has_role(int $user_id, string $role): bool {
    $user = get_userdata($user_id);
    
    if (!$user) {
        return false;
    }
    
    // Check primary role
    if (in_array($role, $user->roles, true)) {
        return true;
    }
    
    // Check secondary roles (Phase 2)
    $secondary = get_user_meta($user_id, 'hd_secondary_roles', true);
    if (is_array($secondary) && in_array($role, $secondary, true)) {
        return true;
    }
    
    return false;
}

/**
 * Get user's primary medical role
 */
public static function get_user_medical_role(int $user_id): string {
    $user = get_userdata($user_id);
    
    if (!$user) {
        return '';
    }
    
    foreach ($user->roles as $role) {
        if (str_starts_with($role, 'hd_')) {
            return $role;
        }
    }
    
    return '';
}

/**
 * Check if user can access specific clinic (GDPR)
 */
public static function user_can_access_clinic(int $user_id, int $clinic_id): bool {
    global $wpdb;
    
    // Org owners can access all clinics
    if (self::user_has_role($user_id, 'hd_org_owner')) {
        return true;
    }
    
    // Check clinic assignment
    $assigned = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->prefix}hd_user_clinics 
         WHERE user_id = %d AND clinic_id = %d AND status = 'active'",
        $user_id,
        $clinic_id
    ));
    
    return $assigned > 0;
}
```

---

## Permission Checking Patterns

### Standard Permission Check

```php
<?php
/**
 * Check capability before action
 */
public function handle_patient_view(int $patient_id): array|WP_Error {
    // 1. Check capability
    if (!current_user_can('hd_access_patients')) {
        return new WP_Error('forbidden', 'You do not have permission to view patients');
    }
    
    // 2. Check clinic access (GDPR)
    $patient_clinic = $this->get_patient_clinic($patient_id);
    if (!HD_Comprehensive_Roles::user_can_access_clinic(get_current_user_id(), $patient_clinic)) {
        return new WP_Error('forbidden', 'You cannot access patients from this clinic');
    }
    
    // 3. Proceed with data retrieval
    return $this->get_patient_data($patient_id);
}
```

### GDPR Clinic Filter Pattern

```php
<?php
/**
 * Always filter data by user's assigned clinics
 */
public function get_patients_for_user(): array {
    global $wpdb;
    
    $user_id = get_current_user_id();
    
    // Get user's assigned clinics
    $clinic_ids = HD_User_Clinics::get_user_clinic_ids($user_id);
    
    if (empty($clinic_ids)) {
        return []; // No clinic access = no patients
    }
    
    $placeholders = implode(',', array_fill(0, count($clinic_ids), '%d'));
    
    return $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}hd_patients 
         WHERE clinic_id IN ($placeholders) 
         AND status = 'active'
         ORDER BY last_name ASC",
        ...$clinic_ids
    ), ARRAY_A);
}
```

### Widget Permission Check

```php
<?php
/**
 * File: includes/blocks/class-hd-widget-permissions.php
 */

public static function check_access(string $widget_id, int $user_id = 0): bool {
    if ($user_id === 0) {
        $user_id = get_current_user_id();
    }
    
    $widget = HD_Widget_Registry::get_instance()->get_widget($widget_id);
    
    if (!$widget) {
        return false;
    }
    
    // Check required capabilities
    foreach ($widget['permissions'] as $capability) {
        if (!user_can($user_id, $capability)) {
            return false;
        }
    }
    
    return true;
}
```

---

## User Meta Keys

### Current Implementation

| Meta Key | Purpose |
|----------|---------|
| `hd_assigned_clinics` | Array of clinic IDs user can access |
| `hd_dashboard_layout` | JSON of custom widget positions |
| `hd_primary_clinic` | User's default clinic |

### Phase 2 Additions

| Meta Key | Purpose |
|----------|---------|
| `hd_secondary_roles` | Array of additional roles |
| `hd_notification_settings` | Notification preferences |
| `hd_language_preference` | UI language (ar, en, etc.) |

---

## Capability Reference

### Patient Access

| Capability | Description | Roles |
|------------|-------------|-------|
| `hd_access_patients` | View patient list | All clinical |
| `hd_view_all_patients` | View any patient (not filtered) | Org owner, admin |
| `hd_edit_patients` | Modify patient records | Physicians, nurses |
| `hd_delete_patients` | Soft delete patients | Admin only |

### Financial Access

| Capability | Description | Roles |
|------------|-------------|-------|
| `hd_view_financial_reports` | View revenue data | Admin, billing |
| `hd_process_payments` | Take payments | Receptionist, billing |
| `hd_issue_refunds` | Process refunds | Admin, billing |

### Clinical Access

| Capability | Description | Roles |
|------------|-------------|-------|
| `hd_create_encounter` | Document visits | Physicians, NPs, PAs |
| `hd_prescribe_medications` | Write prescriptions | Physicians, NPs |
| `hd_order_labs` | Order lab tests | Physicians, NPs, PAs |
| `hd_view_lab_results` | View lab results | All clinical |

### Administrative Access

| Capability | Description | Roles |
|------------|-------------|-------|
| `hd_manage_staff` | Add/edit staff users | Admin, org owner |
| `hd_manage_clinics` | Create/edit clinics | Org owner only |
| `hd_view_audit_logs` | View security logs | Admin, org owner |
| `hd_export_medical_data` | Bulk data export | Admin only |

---

## Integration Examples

### Auth Check in AJAX Handler

```php
<?php
add_action('wp_ajax_hd_get_patient_data', function() {
    // Verify nonce
    check_ajax_referer('hd_patient_nonce', 'nonce');
    
    // Check capability
    if (!current_user_can('hd_access_patients')) {
        wp_send_json_error(['message' => 'Permission denied'], 403);
    }
    
    $patient_id = absint($_POST['patient_id']);
    
    // Check clinic access (GDPR)
    $patient = HD_Database::get_instance()->get_patient($patient_id);
    if (!HD_Comprehensive_Roles::user_can_access_clinic(
        get_current_user_id(), 
        $patient['clinic_id']
    )) {
        wp_send_json_error(['message' => 'Access to this patient denied'], 403);
    }
    
    wp_send_json_success($patient);
});
```

### Role-Based Menu Visibility

```php
<?php
add_filter('wp_nav_menu_items', function($items, $args) {
    if ($args->theme_location !== 'staff-menu') {
        return $items;
    }
    
    $user_id = get_current_user_id();
    
    // Hide financial menu from non-financial roles
    if (!current_user_can('hd_view_financial_reports')) {
        $items = preg_replace('/<li[^>]*menu-item-financial[^>]*>.*?<\/li>/s', '', $items);
    }
    
    // Hide admin menu from non-admins
    if (!HD_Comprehensive_Roles::user_has_role($user_id, 'hd_org_owner') 
        && !HD_Comprehensive_Roles::user_has_role($user_id, 'hd_clinic_admin')) {
        $items = preg_replace('/<li[^>]*menu-item-admin[^>]*>.*?<\/li>/s', '', $items);
    }
    
    return $items;
}, 10, 2);
```

---

## Related Documentation

- [ADR-003: Dashboard Widget Architecture](../decisions/ADR-003-dashboard-widget-architecture.md)
- [IMPLEMENTATION-WIDGET-PATTERNS.md](./dashboard-widgets/IMPLEMENTATION-WIDGET-PATTERNS.md)
- [Ultimate Member Integration](../integrations/UM-GUIDE.md)
