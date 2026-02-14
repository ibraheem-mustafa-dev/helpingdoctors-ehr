# Dashboard Widgets

**Project:** HelpingDoctors EHR Pro
**Count:** 53 widgets (NOT 16)
**Customiser:** REQUIRED (not optional)

---

## Core Facts

- **53 widgets** across 8 categories
- **GridStack.js** for drag-and-drop
- **Role-based** visibility
- **Customiser is REQUIRED** functionality

---

## Widget Categories (8)

### 1. Clinical (12 widgets)
- Today's Appointments
- Recent Patients
- Pending Lab Results
- Active Prescriptions
- Vital Signs Alerts
- Unread Messages
- Task List
- Patient Queue
- Emergency Alerts
- Drug Interaction Warnings
- Referral Status
- Clinical Reminders

### 2. Administrative (8 widgets)
- Staff Schedule Overview
- Room Availability
- Appointment Statistics
- Check-in Queue
- Billing Summary
- Insurance Verifications
- Document Queue
- Inventory Alerts

### 3. Analytics (7 widgets)
- Patient Flow Chart
- Revenue Trends
- Appointment Heatmap
- No-Show Rate
- Average Wait Time
- Satisfaction Scores
- Staff Productivity

### 4. Patient Care (6 widgets)
- Care Plan Status
- Medication Adherence
- Follow-up Due
- Chronic Disease Tracking
- Immunisation Schedule
- Health Goals Progress

### 5. Communication (5 widgets)
- Message Centre
- Team Chat
- Announcements
- Patient Messages
- Referral Communications

### 6. Humanitarian (5 widgets)
- Mass Casualty Status
- Outbreak Tracker
- Resource Availability
- Field Clinic Status
- Vaccination Campaign

### 7. System (5 widgets)
- System Health
- Sync Status
- Audit Activity
- User Sessions
- Storage Usage

### 8. Quick Actions (5 widgets)
- New Patient
- New Appointment
- Quick Prescription
- Quick Lab Order
- Emergency Protocol

---

## GridStack Implementation

### Required Features
```javascript
// GridStack configuration
const grid = GridStack.init({
    column: 12,
    cellHeight: 80,
    animate: true,
    draggable: {
        handle: '.widget-header'
    },
    resizable: {
        handles: 'e, se, s, sw, w'
    }
});

// Save layout per user
grid.on('change', function(event, items) {
    saveUserLayout(items);
});
```

### Layout Persistence
```php
// Save user's widget layout
function hd_save_dashboard_layout($user_id, $layout) {
    update_user_meta($user_id, 'hd_dashboard_layout', $layout);
}

// Get user's widget layout
function hd_get_dashboard_layout($user_id) {
    return get_user_meta($user_id, 'hd_dashboard_layout', true);
}
```

---

## Role Templates

Default layouts per role:

| Role | Default Widgets |
|------|-----------------|
| Doctor | Clinical (all), Patient Care, Analytics |
| Nurse | Clinical (selected), Patient Care, Tasks |
| Receptionist | Administrative, Check-in Queue, Schedule |
| Practice Manager | Analytics, Administrative, System |

---

## Widget Structure

```php
class HD_Widget_Base {
    public $id;
    public $title;
    public $category;
    public $min_width = 2;
    public $min_height = 2;
    public $default_width = 4;
    public $default_height = 3;
    public $roles = []; // Which roles can see this
    public $refresh_interval = 60; // Seconds
    
    public function render() {
        // Override in child class
    }
    
    public function get_data() {
        // Override in child class
    }
}
```

---

## CRITICAL REMINDER

The GridStack customiser is **REQUIRED**, not optional:
- Users MUST be able to drag widgets
- Users MUST be able to resize widgets
- Users MUST be able to show/hide widgets
- Layout MUST persist per user

---

## Checklist

- [ ] All 53 widgets implemented?
- [ ] GridStack drag-drop working?
- [ ] Layout saves per user?
- [ ] Role-based visibility working?
- [ ] Customiser panel functional?
