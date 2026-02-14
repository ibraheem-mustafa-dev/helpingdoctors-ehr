# GUIDE: Health Icons Implementation

**Source:** HEALTH-ICONS-IMPLEMENTATION-REFERENCE.md
**Status:** ✅ Complete
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR uses a custom health icon system with **40+ medical icons** that are 100% free for charity/humanitarian use.

### File Locations

| File | Purpose |
|------|---------|
| `/assets/icons/health-icons-sprite.svg` | SVG sprite containing all icons |
| `/assets/css/health-icons.css` | Icon styling and animations |
| `/assets/icons/HEALTH-ICONS-USAGE-GUIDE.md` | Full documentation |

---

## Quick Usage

### Basic Icon
```html
<svg class="health-icon">
    <use xlink:href="#hi-heart-pulse"/>
</svg>
```

### Icon with Size
```html
<svg class="health-icon health-icon-lg">
    <use xlink:href="#hi-stethoscope"/>
</svg>
```

### Icon with Colour
```html
<svg class="health-icon health-icon-danger">
    <use xlink:href="#hi-emergency"/>
</svg>
```

### Icon with Animation
```html
<svg class="health-icon health-icon-heartbeat">
    <use xlink:href="#hi-heart-pulse"/>
</svg>
```

---

## Icon Sizes

| Class | Size | Use Case |
|-------|------|----------|
| `health-icon-xs` | 16px | Inline with small text |
| `health-icon-sm` | 20px | Compact UI elements |
| (default) | 24px | Standard usage |
| `health-icon-lg` | 32px | Buttons, cards |
| `health-icon-xl` | 40px | Feature cards |
| `health-icon-2xl` | 48px | Dashboard widgets |
| `health-icon-3xl` | 64px | Hero sections |
| `health-icon-4xl` | 80px | Splash screens |

---

## Colour Classes

### Status Colours

| Class | Use For |
|-------|---------|
| `health-icon-normal` | Normal/healthy values |
| `health-icon-elevated` | Warning/elevated values |
| `health-icon-critical` | Critical/danger values |
| `health-icon-inactive` | Disabled/inactive elements |

### Category Colours

| Class | Category |
|-------|----------|
| `health-icon-primary` | Primary actions |
| `health-icon-secondary` | Secondary actions |
| `health-icon-success` | Success/complete |
| `health-icon-warning` | Warnings |
| `health-icon-danger` | Danger/critical |
| `health-icon-info` | Information |
| `health-icon-cardiology` | Heart/cardiovascular |
| `health-icon-pulmonary` | Lungs/respiratory |
| `health-icon-lab` | Laboratory |
| `health-icon-pharmacy` | Medications |
| `health-icon-emergency` | Emergency |

---

## Animation Classes

| Class | Animation | Use For |
|-------|-----------|---------|
| `health-icon-spin` | Continuous rotation | Loading/processing |
| `health-icon-pulse` | Pulsing opacity | Alerts, attention |
| `health-icon-heartbeat` | Scale heartbeat | Vital signs, heart rate |

### Example: Loading State
```html
<svg class="health-icon health-icon-lab health-icon-spin">
    <use xlink:href="#hi-lab-test"/>
</svg>
<span>Processing lab results...</span>
```

### Example: Critical Alert
```html
<svg class="health-icon health-icon-danger health-icon-pulse">
    <use xlink:href="#hi-emergency"/>
</svg>
```

---

## Complete Icon List (40+ Icons)

### Patient Management
| Icon ID | Description |
|---------|-------------|
| `hi-user` | Generic patient/user |
| `hi-patient-chart` | Patient chart |
| `hi-medical-records` | Medical records stack |
| `hi-group` | Family/group |
| `hi-doctor` | Medical professional |

### Clinical/Vital Signs
| Icon ID | Description |
|---------|-------------|
| `hi-heart-pulse` | Heart with pulse line |
| `hi-blood-pressure` | BP monitor |
| `hi-thermometer` | Temperature |
| `hi-weight` | Weight scale |
| `hi-oxygen` | Oxygen saturation |
| `hi-stethoscope` | Physical exam |
| `hi-clipboard` | Documentation/SOAP notes |

### Appointments
| Icon ID | Description |
|---------|-------------|
| `hi-calendar` | Calendar view |
| `hi-appointment` | Appointment (calendar+clock) |
| `hi-clock` | Time/schedule |

### Laboratory
| Icon ID | Description |
|---------|-------------|
| `hi-lab-test` | Test tube/flask |
| `hi-blood-drop` | Blood tests |
| `hi-xray` | Radiology/imaging |
| `hi-dna` | Genetic testing |

### Medications
| Icon ID | Description |
|---------|-------------|
| `hi-pills` | Medication pills |
| `hi-prescription` | Prescription pad |
| `hi-syringe` | Injections/vaccines |
| `hi-iv-drip` | IV therapy |

### Emergency
| Icon ID | Description |
|---------|-------------|
| `hi-ambulance` | Transport/transfer |
| `hi-emergency` | Critical/lightning |
| `hi-first-aid` | Emergency care |

### Facilities
| Icon ID | Description |
|---------|-------------|
| `hi-hospital` | Hospital |
| `hi-clinic` | Clinic |

### Gaza/PPE
| Icon ID | Description |
|---------|-------------|
| `hi-wheelchair` | Accessibility |
| `hi-mask` | PPE/masks |
| `hi-sanitizer` | Hygiene |

### Other
| Icon ID | Description |
|---------|-------------|
| `hi-medical-bag` | Equipment/supplies |

---

## Component Patterns

### Icon Button
```html
<button class="health-icon-btn-text">
    <svg class="health-icon">
        <use xlink:href="#hi-patient-chart"/>
    </svg>
    <span>View Chart</span>
</button>
```

### Health Card
```html
<div class="health-card health-card-primary">
    <div class="health-card-icon">
        <svg class="health-icon">
            <use xlink:href="#hi-clinic"/>
        </svg>
    </div>
    <div class="health-card-content">
        <h3 class="health-card-title">Gaza Central Clinic</h3>
        <p class="health-card-text">Open Monday-Saturday, 8am-6pm</p>
    </div>
</div>
```

### Icon List
```html
<ul class="health-icon-list">
    <li class="health-icon-list-item">
        <svg class="health-icon health-icon-pharmacy health-icon-lg">
            <use xlink:href="#hi-pills"/>
        </svg>
        <div>
            <strong>Aspirin 81mg</strong>
            <span>Daily - Morning</span>
        </div>
    </li>
</ul>
```

### Vital Signs Grid
```html
<div class="vitals-grid">
    <!-- Heart Rate -->
    <div class="health-card health-card-cardiology">
        <div class="health-card-icon">
            <svg class="health-icon health-icon-heartbeat">
                <use xlink:href="#hi-heart-pulse"/>
            </svg>
        </div>
        <div class="health-card-content">
            <h4 class="health-card-title">Heart Rate</h4>
            <p class="health-card-text">72 bpm</p>
        </div>
    </div>

    <!-- Blood Pressure -->
    <div class="health-card health-card-success">
        <div class="health-card-icon">
            <svg class="health-icon">
                <use xlink:href="#hi-blood-pressure"/>
            </svg>
        </div>
        <div class="health-card-content">
            <h4 class="health-card-title">Blood Pressure</h4>
            <p class="health-card-text">120/80 mmHg</p>
        </div>
    </div>

    <!-- Temperature -->
    <div class="health-card health-card-normal">
        <div class="health-card-icon">
            <svg class="health-icon">
                <use xlink:href="#hi-thermometer"/>
            </svg>
        </div>
        <div class="health-card-content">
            <h4 class="health-card-title">Temperature</h4>
            <p class="health-card-text">36.8°C</p>
        </div>
    </div>

    <!-- Oxygen -->
    <div class="health-card health-card-info">
        <div class="health-card-icon">
            <svg class="health-icon">
                <use xlink:href="#hi-oxygen"/>
            </svg>
        </div>
        <div class="health-card-content">
            <h4 class="health-card-title">Oxygen</h4>
            <p class="health-card-text">98% SpO2</p>
        </div>
    </div>
</div>
```

### Quick Actions Grid
```html
<div class="quick-actions-grid">
    <button class="quick-action-btn">
        <svg class="health-icon health-icon-2xl health-icon-primary">
            <use xlink:href="#hi-user"/>
        </svg>
        <span>New Patient</span>
    </button>

    <button class="quick-action-btn">
        <svg class="health-icon health-icon-2xl health-icon-primary">
            <use xlink:href="#hi-calendar"/>
        </svg>
        <span>Book Appointment</span>
    </button>

    <button class="quick-action-btn">
        <svg class="health-icon health-icon-2xl health-icon-cardiology">
            <use xlink:href="#hi-heart-pulse"/>
        </svg>
        <span>Record Vitals</span>
    </button>

    <button class="quick-action-btn">
        <svg class="health-icon health-icon-2xl health-icon-emergency">
            <use xlink:href="#hi-ambulance"/>
        </svg>
        <span>Emergency Transfer</span>
    </button>

    <button class="quick-action-btn">
        <svg class="health-icon health-icon-2xl health-icon-pharmacy">
            <use xlink:href="#hi-pills"/>
        </svg>
        <span>Prescribe</span>
    </button>

    <button class="quick-action-btn">
        <svg class="health-icon health-icon-2xl health-icon-lab">
            <use xlink:href="#hi-lab-test"/>
        </svg>
        <span>Order Labs</span>
    </button>
</div>
```

---

## Notification Icons

| Notification Type | Icon ID | Colour Class |
|-------------------|---------|--------------|
| Clinical Alert | `hi-emergency` | `health-icon-danger` |
| Lab Result Ready | `hi-lab-test` | `health-icon-lab` |
| Appointment Reminder | `hi-calendar` | `health-icon-info` |
| Prescription Refill | `hi-pills` | `health-icon-pharmacy` |
| Patient Message | `hi-user` | `health-icon-primary` |
| Emergency Transfer | `hi-ambulance` | `health-icon-emergency` |

### Notification Example
```html
<div class="notification-item unread">
    <div class="notification-icon">
        <svg class="health-icon health-icon-danger health-icon-lg">
            <use xlink:href="#hi-emergency"/>
        </svg>
    </div>
    <div class="notification-content">
        <strong>Critical Lab Value</strong>
        <p>Haemoglobin critically low for Patient #1234</p>
        <span class="notification-time">5 minutes ago</span>
    </div>
</div>
```

---

## Feature-to-Icon Mapping

### Patient Management
| Feature | Icon | Colour |
|---------|------|--------|
| Patient List | `hi-user` | primary |
| View Patient Chart | `hi-patient-chart` | primary |
| Medical Records | `hi-medical-records` | primary |
| Family History | `hi-group` | info |

### Appointments
| Feature | Icon | Colour |
|---------|------|--------|
| Calendar View | `hi-calendar` | primary |
| Appointment Details | `hi-appointment` | primary |
| Time Slots | `hi-clock` | info |

### Clinical
| Feature | Icon | Colour |
|---------|------|--------|
| Heart Rate | `hi-heart-pulse` | cardiology |
| Blood Pressure | `hi-blood-pressure` | cardiology |
| Temperature | `hi-thermometer` | warning |
| Weight | `hi-weight` | info |
| Oxygen Saturation | `hi-oxygen` | pulmonary |
| Physical Exam | `hi-stethoscope` | primary |
| SOAP Notes | `hi-clipboard` | primary |

### Laboratory
| Feature | Icon | Colour |
|---------|------|--------|
| Order Labs | `hi-lab-test` | lab |
| Blood Tests | `hi-blood-drop` | danger |
| Imaging | `hi-xray` | secondary |
| Genetics | `hi-dna` | info |

### Medications
| Feature | Icon | Colour |
|---------|------|--------|
| Medication List | `hi-pills` | pharmacy |
| New Prescription | `hi-prescription` | primary |
| Vaccinations | `hi-syringe` | warning |
| IV Therapy | `hi-iv-drip` | info |

### Emergency
| Feature | Icon | Colour |
|---------|------|--------|
| Emergency Transfer | `hi-ambulance` | emergency |
| Critical Alert | `hi-emergency` | danger |
| First Aid | `hi-first-aid` | danger |

---

## CSS Reference

### health-icons.css Structure

```css
/* Base icon styles */
.health-icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
    vertical-align: middle;
}

/* Size modifiers */
.health-icon-xs { width: 16px; height: 16px; }
.health-icon-sm { width: 20px; height: 20px; }
.health-icon-lg { width: 32px; height: 32px; }
.health-icon-xl { width: 40px; height: 40px; }
.health-icon-2xl { width: 48px; height: 48px; }
.health-icon-3xl { width: 64px; height: 64px; }
.health-icon-4xl { width: 80px; height: 80px; }

/* Colour modifiers */
.health-icon-primary { fill: var(--hd-color-primary); }
.health-icon-danger { fill: var(--hd-color-danger); }
.health-icon-warning { fill: var(--hd-color-warning); }
.health-icon-success { fill: var(--hd-color-success); }
.health-icon-info { fill: var(--hd-color-info); }

/* Status colours */
.health-icon-normal { fill: var(--hd-color-success); }
.health-icon-elevated { fill: var(--hd-color-warning); }
.health-icon-critical { fill: var(--hd-color-danger); }
.health-icon-inactive { fill: var(--hd-color-muted); opacity: 0.5; }

/* Specialty colours */
.health-icon-cardiology { fill: #e74c3c; }
.health-icon-pulmonary { fill: #3498db; }
.health-icon-lab { fill: #9b59b6; }
.health-icon-pharmacy { fill: #27ae60; }
.health-icon-emergency { fill: #e67e22; }

/* Animations */
@keyframes health-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes health-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes health-heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.1); }
    50% { transform: scale(1); }
    75% { transform: scale(1.1); }
}

.health-icon-spin { animation: health-spin 1s linear infinite; }
.health-icon-pulse { animation: health-pulse 1.5s ease-in-out infinite; }
.health-icon-heartbeat { animation: health-heartbeat 1s ease-in-out infinite; }
```

---

## Accessibility Notes

- Icons should always have accompanying text for screen readers
- Use `aria-hidden="true"` on decorative icons
- Use `aria-label` for icon-only buttons
- Ensure sufficient colour contrast

### Accessible Icon Button
```html
<button aria-label="View patient chart">
    <svg class="health-icon" aria-hidden="true">
        <use xlink:href="#hi-patient-chart"/>
    </svg>
</button>
```

### Icon with Visible Text
```html
<button>
    <svg class="health-icon" aria-hidden="true">
        <use xlink:href="#hi-calendar"/>
    </svg>
    <span>Book Appointment</span>
</button>
```

---

## Related Documentation

- [FRONTEND-PAGES-SPEC.md](../frontend-pages/FRONTEND-PAGES-SPEC.md)
- [IMPLEMENTATION-WIDGET-PATTERNS.md](../dashboard-widgets/IMPLEMENTATION-WIDGET-PATTERNS.md)
