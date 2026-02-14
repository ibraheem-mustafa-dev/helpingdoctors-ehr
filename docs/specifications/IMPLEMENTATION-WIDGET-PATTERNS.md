# IMPLEMENTATION: Dashboard Widget Patterns

**Source:** ADR-003-dashboard-widget-architecture.md, DASHBOARD-WIDGET-CAPABILITY-MATRIX.md
**Status:** ✅ Complete (100% audit pass rate - Nov 2025)
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR uses **GridStack.js** for a drag-drop customisable dashboard with **53 medical widgets** organised into 7 categories. All widgets are production-ready with real-time data, mobile responsiveness, and role-based visibility.

**Key Stats:**
- 53 widgets (338% of 16-widget spec)
- 13 role-based template groups → 27 roles
- Load time: 0.8-1.8s (target <2s) ✅
- AJAX response: 200-400ms (target <500ms) ✅
- 3G load time: 1.5-2.5s (target <3s) ✅

---

## File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `includes/blocks/class-hd-widget-registry.php` | Central widget registry | ~400 |
| `includes/dashboard/class-hd-dashboard-customizer.php` | GridStack integration | 1,565 |
| `includes/admin/class-hd-dashboard-manager.php` | Dashboard admin | ~600 |
| `includes/blocks/class-hd-widget-permissions.php` | Role-based visibility | ~200 |
| `includes/blocks/widgets/` | All 53 widget implementations | ~5,000 |
| `templates/page-gridstack-dashboard.php` | Main dashboard template | ~300 |
| `assets/js/gridstack.min.js` | GridStack library (self-hosted) | ~50KB |
| `assets/css/gridstack.min.css` | GridStack styles | ~10KB |

---

## Complete Widget Matrix (53 Widgets)

### Clinical Widgets (16)

| # | Widget ID | Name | Refresh | Export | Mobile |
|---|-----------|------|---------|--------|--------|
| 1 | `patient_stats` | Patient Statistics | 5min | CSV | ✅ |
| 2 | `patient_queue` | Patient Queue | 30s | ❌ | ✅ |
| 3 | `recent_patients` | Recent Patients | 2min | ❌ | ✅ |
| 4 | `vital_signs_entry` | Vital Signs Entry | Instant | ❌ | ✅ |
| 5 | `emergency_queue` | Emergency Queue | 30s | ❌ | ✅ |
| 6 | `triage_board` | Triage Board | 30s | ❌ | ✅ |
| 7 | `bed_availability` | Bed Availability | 1min | ❌ | ✅ |
| 8 | `critical_alerts` | Critical Alerts | 15s | ❌ | ✅ |
| 9 | `medication_admin` | Medication Admin | 2min | CSV | ✅ |
| 10 | `treatment_outcomes` | Treatment Outcomes | 5min | CSV | ✅ |
| 11 | `fall_risk_indicator` | Fall Risk | 5min | ❌ | ✅ |
| 12 | `code_status_alerts` | Code Status | 5min | ❌ | ✅ |
| 13 | `work_in_progress_notes` | WIP Notes | 2min | ❌ | ✅ |
| 14 | `unanswered_messages` | Messages | 1min | ❌ | ✅ |
| 15 | `telehealth_queue` | Telehealth Queue | 1min | ❌ | ✅ |
| 16 | `referral_tracking` | Referral Tracking | 5min | CSV | ✅ |

### Scheduling Widgets (7)

| # | Widget ID | Name | Refresh | Export | Mobile |
|---|-----------|------|---------|--------|--------|
| 17 | `appointment_calendar` | Appointment Calendar | 2min | CSV | ✅ |
| 18 | `appointment_stats` | Appointment Stats | 5min | CSV | ✅ |
| 19 | `todays_schedule` | Today's Schedule | 2min | PDF | ✅ |
| 20 | `daily_schedule` | Daily Schedule | 5min | PDF | ✅ |
| 21 | `therapy_schedule` | Therapy Schedule | 5min | PDF | ✅ |
| 22 | `surgery_schedule` | Surgery Schedule | 2min | PDF | ✅ |
| 23 | `counseling_schedule` | Counseling Schedule | 5min | PDF | ✅ |

### Management Widgets (11)

| # | Widget ID | Name | Refresh | Export | Mobile |
|---|-----------|------|---------|--------|--------|
| 24 | `department_heatmap` | Department Heatmap | 1min | CSV | ✅ |
| 25 | `revenue_tracker` | Revenue Tracker | 5min | CSV | ✅ |
| 26 | `visit_trends` | Visit Trends | 1hr | CSV | ✅ |
| 27 | `patient_demographics` | Patient Demographics | 1hr | CSV | ✅ |
| 28 | `diagnosis_trends` | Diagnosis Trends | 1hr | CSV | ✅ |
| 29 | `copay_tracker` | Copay Tracker | 5min | CSV | ✅ |
| 30 | `claims_denial_rate` | Claims Denial Rate | 1hr | CSV | ✅ |
| 31 | `insurance_eligibility` | Insurance Eligibility | 5min | ❌ | ✅ |
| 32 | `donor_dashboard` | Donor Dashboard | 1hr | CSV | ✅ |
| 33 | `supply_shortages` | Supply Shortages | 5min | CSV | ✅ |
| 34 | `system_status` | System Status | 1min | ❌ | ✅ |

### Administrative Widgets (7)

| # | Widget ID | Name | Refresh | Export | Mobile |
|---|-----------|------|---------|--------|--------|
| 35 | `security_alerts` | Security Alerts ⚠️ | 30s | CSV | ✅ |
| 36 | `audit_summary` | Audit Summary ⚠️ | 5min | CSV | ✅ |
| 37 | `social_work_caseload` | Social Work | 5min | CSV | ✅ |
| 38 | `inventory_alerts` | Inventory Alerts | 5min | CSV | ✅ |
| 39 | `equipment_status` | Equipment Status | 5min | CSV | ✅ |
| 40 | `quality_control` | Quality Control | 1hr | CSV | ✅ |
| 41 | `operating_room_status` | OR Status | 1min | ❌ | ✅ |

**⚠️ = MANDATORY widget (required on admin dashboards)**

### Laboratory Widgets (6)

| # | Widget ID | Name | Refresh | Export | Mobile |
|---|-----------|------|---------|--------|--------|
| 42 | `lab_queue` | Lab Queue | 1min | CSV | ✅ |
| 43 | `pending_results` | Pending Results | 1min | CSV | ✅ |
| 44 | `critical_values` | Critical Values | 15s | CSV | ✅ |
| 45 | `lab_quality_control` | Lab QC | 1hr | CSV | ✅ |
| 46 | `lab_stats` | Lab Statistics | 1hr | CSV | ✅ |
| 47 | `specimen_tracking` | Specimen Tracking | 2min | CSV | ✅ |

### Pharmacy Widgets (3)

| # | Widget ID | Name | Refresh | Export | Mobile |
|---|-----------|------|---------|--------|--------|
| 48 | `prescription_queue` | Prescription Queue | 2min | CSV | ✅ |
| 49 | `drug_interactions` | Drug Interactions | Instant | CSV | ✅ |
| 50 | `refill_requests` | Refill Requests | 5min | CSV | ✅ |

### Specialty Widgets (3)

| # | Widget ID | Name | Refresh | Export | Mobile |
|---|-----------|------|---------|--------|--------|
| 51 | `imaging_queue` | Imaging Queue | 2min | CSV | ✅ |
| 52 | `equipment_status_imaging` | Imaging Equipment | 5min | CSV | ✅ |
| 53 | `pending_studies` | Pending Studies | 2min | CSV | ✅ |

---

## GridStack Configuration (Gaza-Optimised)

```javascript
// assets/js/hd-dashboard.js
GridStack.init({
    cellHeight: '70px',
    verticalMargin: 10,
    animate: false, // Disabled for Gaza bandwidth
    disableOneColumnMode: false, // Auto-stack on mobile
    float: true, // Allow widgets to float up
    minRow: 1,
    acceptWidgets: true, // Allow adding widgets
    removable: false, // Prevent accidental removal
    
    // Desktop: 12 columns
    column: 12,
    
    // Responsive breakpoints
    columnOpts: {
        breakpoints: [
            {w: 768, c: 6},  // Tablet: 6 columns
            {w: 425, c: 1}   // Mobile: 1 column (stacked)
        ]
    }
});

// Save layout to user_meta
grid.on('change', function(event, items) {
    saveLayout(items);
});

function saveLayout(items) {
    jQuery.ajax({
        url: hdDashboard.ajaxUrl,
        method: 'POST',
        data: {
            action: 'hd_save_dashboard_layout',
            nonce: hdDashboard.nonce,
            layout: JSON.stringify(items)
        }
    });
}
```

---

## Widget Class Structure

### Base Widget Pattern

```php
<?php
/**
 * Example Widget Implementation
 * File: includes/blocks/widgets/class-hd-widget-patient-stats.php
 */

class HD_Widget_Patient_Stats {
    
    /**
     * Widget configuration
     */
    public static function get_config(): array {
        return [
            'id' => 'patient_stats',
            'name' => __('Patient Statistics', 'helpingdoctors-ehr'),
            'description' => __('Overview of patient demographics', 'helpingdoctors-ehr'),
            'category' => 'clinical',
            'permissions' => ['hd_access_patients'],
            'refresh_interval' => 300, // 5 minutes
            'default_size' => ['w' => 4, 'h' => 3],
            'min_size' => ['w' => 2, 'h' => 2],
            'max_size' => ['w' => 6, 'h' => 4],
            'exportable' => true,
            'export_format' => 'csv',
        ];
    }
    
    /**
     * Get widget data (AJAX callback)
     * 
     * @param array $config Widget configuration
     * @return array Widget data
     */
    public static function get_data(array $config = []): array {
        global $wpdb;
        
        // Get user's assigned clinics (GDPR filtering)
        $clinic_ids = HD_User_Clinics::get_user_clinic_ids(get_current_user_id());
        
        if (empty($clinic_ids)) {
            return ['total' => 0, 'demographics' => []];
        }
        
        $placeholders = implode(',', array_fill(0, count($clinic_ids), '%d'));
        
        // Get patient count
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}hd_patients 
             WHERE clinic_id IN ($placeholders) AND status = 'active'",
            ...$clinic_ids
        ));
        
        // Get demographics breakdown
        $demographics = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'pediatric'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 65 THEN 'adult'
                    ELSE 'geriatric'
                END as age_group,
                gender,
                COUNT(*) as count
             FROM {$wpdb->prefix}hd_patients
             WHERE clinic_id IN ($placeholders) AND status = 'active'
             GROUP BY age_group, gender",
            ...$clinic_ids
        ), ARRAY_A);
        
        return [
            'total' => (int) $total,
            'demographics' => $demographics,
            'last_updated' => current_time('mysql'),
        ];
    }
    
    /**
     * Render widget HTML
     * 
     * @param array $config Widget configuration
     * @return string Widget HTML
     */
    public static function render(array $config = []): string {
        $data = self::get_data($config);
        
        ob_start();
        ?>
        <div class="hd-widget hd-widget-patient-stats" data-widget-id="patient_stats">
            <div class="widget-header">
                <h3 class="widget-title">
                    <svg class="health-icon health-icon-lg">
                        <use xlink:href="#hi-user"/>
                    </svg>
                    <?php esc_html_e('Patient Statistics', 'helpingdoctors-ehr'); ?>
                </h3>
                <div class="widget-actions">
                    <button class="widget-refresh" aria-label="Refresh">
                        <svg class="health-icon"><use xlink:href="#hi-refresh"/></svg>
                    </button>
                    <button class="widget-export" aria-label="Export CSV">
                        <svg class="health-icon"><use xlink:href="#hi-download"/></svg>
                    </button>
                </div>
            </div>
            
            <div class="widget-body">
                <div class="stat-large">
                    <span class="stat-value"><?php echo esc_html(number_format($data['total'])); ?></span>
                    <span class="stat-label"><?php esc_html_e('Total Patients', 'helpingdoctors-ehr'); ?></span>
                </div>
                
                <canvas id="patient-demographics-chart" height="150"></canvas>
            </div>
            
            <div class="widget-footer">
                <span class="last-updated">
                    <?php printf(
                        esc_html__('Updated: %s', 'helpingdoctors-ehr'),
                        wp_date('H:i', strtotime($data['last_updated']))
                    ); ?>
                </span>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Export widget data to CSV
     */
    public static function export(): void {
        $data = self::get_data();
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="patient-statistics-' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        fputcsv($output, ['Age Group', 'Gender', 'Count']);
        
        foreach ($data['demographics'] as $row) {
            fputcsv($output, $row);
        }
        
        fclose($output);
        exit;
    }
}
```

---

## Widget Registry Usage

### Register a Widget

```php
// In class-hd-widget-registry.php or plugin init
HD_Widget_Registry::get_instance()->register_widget('patient_stats', [
    'name' => 'Patient Statistics',
    'category' => 'clinical',
    'permissions' => ['hd_access_patients'],
    'class' => 'HD_Widget_Patient_Stats',
    'refresh_interval' => 300,
]);
```

### Get Widgets

```php
// Get all registered widgets
$all_widgets = HD_Widget_Registry::get_instance()->get_registered_widgets();

// Get specific widget
$widget = HD_Widget_Registry::get_instance()->get_widget('patient_stats');

// Get widgets by category
$clinical_widgets = HD_Widget_Registry::get_instance()->get_widgets_by_category('clinical');

// Get widgets for current user's role
$user_widgets = HD_Widget_Registry::get_instance()->get_widgets_for_user(get_current_user_id());
```

---

## Role-Based Templates (13 Groups → 27 Roles)

### Template Mapping

| Template Group | Roles | Default Widgets |
|----------------|-------|-----------------|
| **Executive** | org_owner, system_admin, medical_director | 12 widgets (overview focus) |
| **Clinic Management** | clinic_admin | 10 widgets (operations) |
| **Physician Core** | physician, surgeon, nurse_practitioner, physician_assistant | 8 widgets (patient care) |
| **Emergency** | emergency_physician, emergency_responder | 8 widgets (ER focus) |
| **Nursing** | registered_nurse, lpn, medical_assistant | 8 widgets (bedside care) |
| **Pharmacy** | pharmacist, pharmacy_tech | 6 widgets (dispensing) |
| **Laboratory** | lab_director, lab_technician | 6 widgets (lab workflow) |
| **Imaging** | radiologic_tech | 5 widgets (imaging focus) |
| **Therapy** | physical_therapist, mental_health, social_worker | 6 widgets (therapy) |
| **Administrative** | billing_specialist, medical_records | 6 widgets (admin) |
| **Front Desk** | receptionist | 5 widgets (check-in) |
| **Patient Portal** | patient | 4 widgets (self-service) |
| **Humanitarian** | volunteer | 5 widgets (field work) |

### Template Code Example

```php
// includes/dashboard/class-hd-dashboard-customizer.php

public function get_default_layout_for_role(string $role): array {
    $templates = [
        'physician' => [
            ['id' => 'todays_schedule', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 3],
            ['id' => 'recent_patients', 'x' => 4, 'y' => 0, 'w' => 4, 'h' => 3],
            ['id' => 'pending_results', 'x' => 8, 'y' => 0, 'w' => 4, 'h' => 3],
            ['id' => 'critical_values', 'x' => 0, 'y' => 3, 'w' => 4, 'h' => 2],
            ['id' => 'prescription_queue', 'x' => 4, 'y' => 3, 'w' => 4, 'h' => 2],
            ['id' => 'work_in_progress_notes', 'x' => 8, 'y' => 3, 'w' => 4, 'h' => 2],
            ['id' => 'referral_tracking', 'x' => 0, 'y' => 5, 'w' => 6, 'h' => 2],
            ['id' => 'unanswered_messages', 'x' => 6, 'y' => 5, 'w' => 6, 'h' => 2],
        ],
        
        'registered_nurse' => [
            ['id' => 'daily_schedule', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 3],
            ['id' => 'patient_queue', 'x' => 4, 'y' => 0, 'w' => 4, 'h' => 3],
            ['id' => 'vital_signs_entry', 'x' => 8, 'y' => 0, 'w' => 4, 'h' => 3],
            ['id' => 'medication_admin', 'x' => 0, 'y' => 3, 'w' => 6, 'h' => 3],
            ['id' => 'bed_availability', 'x' => 6, 'y' => 3, 'w' => 3, 'h' => 2],
            ['id' => 'critical_alerts', 'x' => 9, 'y' => 3, 'w' => 3, 'h' => 2],
            ['id' => 'fall_risk_indicator', 'x' => 6, 'y' => 5, 'w' => 3, 'h' => 1],
            ['id' => 'code_status_alerts', 'x' => 9, 'y' => 5, 'w' => 3, 'h' => 1],
        ],
        
        // ... more templates for all 27 roles
    ];
    
    return $templates[$role] ?? $templates['physician'];
}
```

---

## Caching Strategy

### Widget Data Caching

```php
// Cache widget data for 5 minutes using transients
public static function get_data_cached(array $config = []): array {
    $user_id = get_current_user_id();
    $cache_key = 'hd_widget_patient_stats_' . $user_id;
    
    $cached = get_transient($cache_key);
    if ($cached !== false) {
        return $cached;
    }
    
    $data = self::get_data($config);
    set_transient($cache_key, $data, 5 * MINUTE_IN_SECONDS);
    
    return $data;
}
```

### Layout Caching

```php
// Store user layout in user_meta
public function save_user_layout(int $user_id, array $layout): bool {
    return update_user_meta($user_id, 'hd_dashboard_layout', wp_json_encode($layout));
}

public function get_user_layout(int $user_id): array {
    $layout = get_user_meta($user_id, 'hd_dashboard_layout', true);
    
    if (empty($layout)) {
        $role = HD_Comprehensive_Roles::get_user_medical_role($user_id);
        return $this->get_default_layout_for_role($role);
    }
    
    return json_decode($layout, true);
}
```

---

## AJAX Endpoints

### Dashboard Customiser (6 endpoints)

| Action | Purpose |
|--------|---------|
| `hd_save_dashboard_layout` | Save user's custom layout |
| `hd_get_dashboard_layout` | Load user's layout |
| `hd_reset_dashboard_layout` | Reset to role default |
| `hd_add_widget` | Add widget to dashboard |
| `hd_remove_widget` | Remove widget from dashboard |
| `hd_get_available_widgets` | Get list of available widgets |

### Dashboard Manager (12 endpoints)

| Action | Purpose |
|--------|---------|
| `hd_get_widget_data` | Get data for specific widget |
| `hd_refresh_widget` | Force refresh widget data |
| `hd_export_widget_data` | Export widget to CSV/PDF |
| `hd_get_widget_config` | Get widget configuration |
| `hd_update_widget_config` | Update widget settings |
| Plus 7 more widget-specific endpoints... |

---

## Performance Metrics

### Load Time Standards

| Category | Target | Actual |
|----------|--------|--------|
| Clinical | <2s | 0.8-1.2s ✅ |
| Scheduling | <2s | 1.0-1.5s ✅ |
| Management | <2s | 1.2-1.8s ✅ |
| Administrative | <2s | 0.9-1.3s ✅ |
| Laboratory | <2s | 0.8-1.1s ✅ |
| Pharmacy | <2s | 0.9-1.2s ✅ |
| Specialty | <2s | 1.0-1.4s ✅ |

### AJAX Response Times

| Metric | Target | Actual |
|--------|--------|--------|
| Average | <500ms | 200-400ms ✅ |
| 95th percentile | <800ms | ~600ms ✅ |

### Mobile (3G) Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Initial load | <3s | 1.5-2.5s ✅ |
| Widget refresh | <2s | 0.8-1.5s ✅ |

---

## Troubleshooting

### Widget Not Loading

1. Check user has required permission:
   ```php
   if (!current_user_can('hd_access_patients')) {
       // Widget won't load
   }
   ```

2. Verify database table exists:
   ```sql
   SHOW TABLES LIKE 'wp_3_hd_patients';
   ```

3. Check AJAX endpoint is registered:
   ```php
   add_action('wp_ajax_hd_get_widget_data', ...);
   ```

4. Review browser console for JavaScript errors

### Slow Performance

1. Add database indexes:
   ```sql
   ALTER TABLE wp_3_hd_patients ADD INDEX idx_clinic_status (clinic_id, status);
   ```

2. Implement transient caching (5-60 min)

3. Optimise SQL with EXPLAIN:
   ```sql
   EXPLAIN SELECT * FROM wp_3_hd_patients WHERE ...;
   ```

4. Reduce refresh interval if real-time not critical

### Permission Issues

1. Verify user has correct role
2. Check clinic assignments in `hd_user_clinics`
3. Review capability checks in widget code
4. Test with permission checker:
   ```php
   HD_Widget_Permissions::check_access($widget_id, $user_id);
   ```

---

## Maintenance Schedule

### Weekly
- Review Security Alerts widget for threats
- Check Audit Summary for compliance
- Monitor System Status for errors

### Monthly
- Review widget usage analytics
- Optimise slow-loading widgets
- Update refresh intervals based on usage
- Archive old audit logs (>90 days)

### Quarterly
- Full security audit
- Performance optimisation review
- User feedback collection
- Feature enhancement planning

---

## Related Documentation

- [ADR-003: Dashboard Widget Architecture](../decisions/ADR-003-dashboard-widget-architecture.md)
- [DASHBOARD-WIDGET-CAPABILITY-MATRIX.md](../DASHBOARD-WIDGET-CAPABILITY-MATRIX.md)
- [WIDGET-AUDIT-REPORT.md](../WIDGET-AUDIT-REPORT.md)
- [IMPLEMENTATION-ROLE-PATTERNS.md](./roles-permissions/IMPLEMENTATION-ROLE-PATTERNS.md)
