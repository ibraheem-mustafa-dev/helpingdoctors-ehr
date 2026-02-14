# IMPLEMENTATION: Shafi Chatbot Patterns

**Source:** SHAFI-CHATBOT-SPECIFICATION.md
**Status:** ✅ Complete
**Last Updated:** December 2025

---

## Overview

**Shafi** (شافي - "Healer" in Arabic) is the AI-powered chatbot for HelpingDoctors EHR. It provides medical analytics, navigation help, and support across three operating modes.

**Key Stats:**
- Total codebase: 4,766 lines (PHP: 2,752 | JS: 1,014 | CSS: 1,000)
- 18 analytics metrics across 6 categories
- 54 methods in 10 categories
- WCAG 2.2 AA accessible
- 10-language support including RTL Arabic

---

## File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `includes/ai/class-hd-shafi-chatbot.php` | Main PHP class | 2,752 |
| `assets/js/hd-shafi-chatbot.js` | Frontend logic | 1,014 |
| `assets/css/hd-shafi-chatbot.css` | Styling | 1,000 |

---

## Operating Modes

### Mode Detection Logic

```php
<?php
/**
 * Detect which mode Shafi should operate in
 */
private function detect_chatbot_mode(): string {
    // Not logged in = public support mode (client subsites only)
    if (!is_user_logged_in()) {
        if (is_multisite() && is_main_site()) {
            return 'none';  // Main site = no public chatbot
        }
        return 'public_support';
    }

    // Logged in - check for staff permissions
    $permissions = $this->get_user_analytics_permissions();
    $has_staff_access = $permissions['can_view_all_patients']
        || $permissions['can_view_financial_data']
        || $permissions['can_view_staff_performance'];

    if ($has_staff_access) {
        return 'staff_analytics';
    }

    // Future: patient_portal mode
    return 'none';
}
```

### Mode Comparison

| Feature | Staff Analytics | Patient Portal | Public Support |
|---------|----------------|----------------|----------------|
| **Login Required** | Yes | Yes | No |
| **Analytics Queries** | Yes | Own data only | No |
| **Chart Visualisations** | Yes | Limited | No |
| **Export Data** | Yes | Limited | No |
| **Navigation Help** | Yes | Yes | Limited |
| **Rate Limit** | 10/min | 10/min | 5/min, 30/hour |
| **Query History** | Saved | Saved | Not saved |
| **Emergency Detection** | Yes | Yes | Yes |

---

## Analytics Metrics (18 Total)

### Patient Metrics (4)

| Metric Key | Name | Chart Type |
|------------|------|------------|
| `total_patients` | Total Patients | Number |
| `new_patients_today` | New Patients Today | Number |
| `patients_by_age_group` | Patients by Age Group | Pie |
| `patients_by_gender` | Patients by Gender | Doughnut |

### Appointment Metrics (4)

| Metric Key | Name | Chart Type |
|------------|------|------------|
| `appointments_today` | Appointments Today | Number |
| `appointments_this_week` | Appointments This Week | Number |
| `appointment_status_distribution` | Status Distribution | Bar |
| `appointments_by_service_type` | By Service Type | Horizontal Bar |

### Medical Metrics (3)

| Metric Key | Name | Chart Type |
|------------|------|------------|
| `encounters_this_month` | Encounters This Month | Number |
| `common_diagnoses` | Most Common Diagnoses | Horizontal Bar |
| `encounters_by_type` | Encounters by Type | Pie |

### Financial Metrics (3)

| Metric Key | Name | Chart Type |
|------------|------|------------|
| `revenue_today` | Revenue Today | Currency |
| `revenue_this_month` | Revenue This Month | Currency |
| `revenue_trend` | Revenue Trend (12 Months) | Line |

### Performance Metrics (2)

| Metric Key | Name | Chart Type |
|------------|------|------------|
| `avg_wait_time` | Average Wait Time | Number (min) |
| `doctor_productivity` | Doctor Productivity | Bar |

### Trending Metrics (2)

| Metric Key | Name | Chart Type |
|------------|------|------------|
| `patient_growth_trend` | Patient Registration Trend | Line |
| `appointment_volume_trend` | Appointment Volume Trend | Line |

---

## Intent Classification

### Pattern Matching

```php
<?php
private $intent_patterns = [
    'trend_analysis' => [
        '/\b(trend|pattern|over\s+time|this\s+month\s+vs|compare|increase|decrease)\b/i',
        '/\b(how\s+many|count|number\s+of)\s+.*\s+(this\s+month|last\s+month|this\s+year)\b/i',
    ],
    'department_analytics' => [
        '/\b(department|busiest|wait\s+time|utilization|efficiency)\b/i',
        '/\b(which\s+department|staff\s+performance|patient\s+flow)\b/i',
    ],
    'patient_specific_queries' => [
        '/\b(patient|show\s+.*\s+visits|find\s+patient)\b/i',
        '/\b(my\s+patients|patients\s+i\s+saw|last\s+appointment)\b/i',
    ],
    'report_request' => [
        '/\b(generate|create|export|report|summary)\b/i',
        '/\b(monthly\s+report|clinic\s+report|demographics)\b/i',
    ],
    'technical_support' => [
        '/\b(how\s+do\s+i|how\s+to|help\s+me|show\s+me\s+how)\b/i',
        '/\b(tutorial|guide|instructions|steps)\b/i',
    ],
    'navigation_help' => [
        '/\b(where\s+is|find\s+the|locate|navigate\s+to|go\s+to)\b/i',
        '/\b(page|screen|menu|button|link)\b/i',
    ],
];
```

### Example Queries by Intent

| Intent | Example Queries |
|--------|-----------------|
| `trend_analysis` | "Show patient trends", "Compare appointments over time" |
| `department_analytics` | "Which department is busiest?", "Show wait times" |
| `patient_specific_queries` | "How many patients did I see today?" |
| `report_request` | "Generate monthly report", "Export demographics" |
| `technical_support` | "How do I register a patient?" |
| `navigation_help` | "Where is the patient list?" |
| `data_query` (default) | "Total patients", "Revenue today" |

---

## Rate Limiting

### Configuration

```php
<?php
// Staff rate limits
private $rate_limits = [
    'queries_per_minute' => 10,
    'exports_per_hour' => 5,
];

// Public (unauthenticated) rate limits
private $public_rate_limits = [
    'queries_per_minute' => 5,
    'queries_per_hour' => 30,
];

private $session_timeout = 1800; // 30 minutes
```

### Implementation

```php
<?php
private function check_rate_limit(int $user_id): bool {
    $transient_key = 'shafi_rate_' . $user_id;
    $current = get_transient($transient_key);
    
    if ($current === false) {
        set_transient($transient_key, 1, MINUTE_IN_SECONDS);
        return true;
    }
    
    $limit = is_user_logged_in() 
        ? $this->rate_limits['queries_per_minute']
        : $this->public_rate_limits['queries_per_minute'];
    
    if ($current >= $limit) {
        return false; // Rate limited
    }
    
    set_transient($transient_key, $current + 1, MINUTE_IN_SECONDS);
    return true;
}
```

---

## Security Features

### Medical Advice Prevention

```php
<?php
private $prohibited_patterns = [
    '/\b(diagnose|diagnosis|what\s+disease)\b/i',
    '/\b(prescribe|medication\s+for|drug\s+for)\b/i',
    '/\b(should\s+i\s+take|treatment\s+for)\b/i',
    '/\b(cure\s+for|how\s+to\s+treat)\b/i',
    '/\b(what\s+condition|am\s+i\s+sick)\b/i',
    '/\b(dosage|dose\s+of|how\s+much\s+medicine)\b/i',
];
```

**Response when blocked:**
> "I cannot provide medical advice, diagnoses, or treatment recommendations. Please consult a qualified healthcare professional for medical guidance."

### Emergency Detection

```php
<?php
private $emergency_patterns = [
    '/\b(emergency|urgent|dying|suicide|heart\s+attack)\b/i',
    '/\b(can\'t\s+breathe|chest\s+pain|stroke)\b/i',
    '/\b(overdose|poisoning|severe\s+bleeding)\b/i',
];
```

**Emergency response includes:**
- Warning message with emergency service numbers
- Contact administrator link
- Logged as "emergency" interaction type

### Role-Based Data Access

```php
<?php
private $data_access_levels = [
    'clinic_admin' => [
        'all_patients', 'all_appointments', 'financial_data', 
        'staff_metrics', 'all_departments'
    ],
    'doctor' => [
        'own_patients', 'own_appointments', 
        'department_statistics', 'anonymized_trends'
    ],
    'healthcare_assistant' => [
        'vital_signs', 'appointments', 
        'basic_demographics', 'department_schedules'
    ],
    'receptionist' => [
        'appointment_schedules', 'contact_information', 
        'payment_status', 'waiting_lists'
    ],
];
```

---

## Method Categories (54 Total)

| Category | Count | Description |
|----------|-------|-------------|
| Initialisation | 3 | Singleton, constructor, hooks |
| Configuration | 4 | Metrics, charts, help content |
| Mode Detection | 1 | Context-aware mode switching |
| Asset Loading | 2 | Staff and public asset enqueuing |
| UI Rendering | 3 | Main interface, shortcode, public |
| AJAX Handlers | 10 | Query processing, exports, history |
| Query Processing | 8 | Intent classification, analytics |
| Permissions | 5 | Role-based access control |
| Rate Limiting | 2 | Abuse prevention |
| Logging | 3 | Query history, audit trail |
| Export | 3 | CSV, Excel, PDF generation |
| Utilities | 10 | Charts, colours, suggestions |

---

## AJAX Endpoints

| Action | Purpose | Auth Required |
|--------|---------|---------------|
| `hd_shafi_query` | Process user query | Yes |
| `hd_shafi_public_query` | Process public query | No |
| `hd_shafi_export_csv` | Export data to CSV | Yes |
| `hd_shafi_export_excel` | Export data to Excel | Yes |
| `hd_shafi_export_pdf` | Export data to PDF | Yes |
| `hd_shafi_get_history` | Get query history | Yes |
| `hd_shafi_clear_history` | Clear query history | Yes |
| `hd_shafi_feedback` | Submit query feedback | Yes |
| `hd_shafi_get_suggestions` | Get query suggestions | Yes |

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| `rate_limited` | Too many requests | Exceeded rate limit |
| `permission_denied` | Access denied | Insufficient permissions |
| `invalid_metric` | Metric not found | Unknown metric requested |
| `medical_advice` | Cannot provide advice | Medical advice query detected |
| `export_failed` | Export error | Export generation failed |
| `invalid_nonce` | Security check failed | Nonce verification failed |

---

## Testing Checklist

### Functional Tests

- [ ] Query processing returns correct results
- [ ] Intent classification correctly categorises queries
- [ ] Rate limiting blocks excessive requests
- [ ] Medical advice queries are blocked
- [ ] Emergency patterns trigger crisis response
- [ ] Export functions generate valid files
- [ ] Role permissions correctly filter data

### Accessibility Tests

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces messages correctly
- [ ] Focus management works on open/close
- [ ] Touch targets are 44×44px minimum
- [ ] Colour contrast meets WCAG AA (4.5:1)

### Mode Tests

- [ ] Staff analytics mode shows all 18 metrics
- [ ] Public support mode only shows help content
- [ ] Mode detection correctly identifies context
- [ ] Rate limits differ between modes

---

## Related Documentation

- [SHAFI-CHATBOT-SPECIFICATION.md](../SHAFI-CHATBOT-SPECIFICATION.md)
- [IMPLEMENTATION-ROLE-PATTERNS.md](./roles-permissions/IMPLEMENTATION-ROLE-PATTERNS.md)
- [Dashboard Analytics Widget](./dashboard-widgets/IMPLEMENTATION-WIDGET-PATTERNS.md)
