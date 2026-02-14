# File Organisation

**Project:** HelpingDoctors EHR Pro
**Structure:** WordPress theme + plugin architecture

---

## Directory Structure

```
public_html/
├── wp-content/
│   ├── themes/
│   │   └── theme/                    # Custom theme
│   │       ├── assets/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   └── images/
│   │       ├── template-parts/
│   │       ├── page-templates/
│   │       ├── functions.php
│   │       └── style.css
│   │
│   ├── plugins/
│   │   └── helping-doctors-ehr/      # Main plugin
│   │       ├── includes/
│   │       │   ├── class-*.php
│   │       │   └── functions-*.php
│   │       ├── admin/
│   │       ├── api/
│   │       ├── templates/
│   │       └── helping-doctors-ehr.php
│   │
│   ├── mu-plugins/                   # Must-use plugins
│   │   └── hd-security.php
│   │
│   └── uploads/
│       └── sites/3/                  # Multisite uploads
│
└── docs/                             # Documentation (outside public)
    ├── session-management/
    ├── implementation-tasks/
    └── architecture-decisions/
```

---

## Key File Locations

| Purpose | Location |
|---------|----------|
| Theme functions | `themes/theme/functions.php` |
| Plugin main file | `plugins/helping-doctors-ehr/helping-doctors-ehr.php` |
| Database classes | `plugins/helping-doctors-ehr/includes/class-hd-database.php` |
| API endpoints | `plugins/helping-doctors-ehr/api/` |
| Page templates | `themes/theme/page-templates/` |
| JavaScript | `themes/theme/assets/js/` |
| CSS | `themes/theme/assets/css/` |
| Documentation | `docs/` (outside public_html) |

---

## Naming Conventions

### PHP Files
```
class-hd-patient.php        # Class file
functions-patient.php       # Function collection
template-dashboard.php      # Page template
widget-appointments.php     # Dashboard widget
```

### JavaScript Files
```
patient-search.js           # Feature-specific
dashboard-widgets.js        # Component
shafi-chatbot.js           # Feature name
```

### CSS Files
```
patient-forms.css           # Feature-specific
dashboard.css              # Page-specific
components.css             # Shared components
```

---

## Import Patterns

### PHP
```php
// Load from plugin
require_once HD_PLUGIN_PATH . 'includes/class-hd-patient.php';

// Load from theme
require_once get_template_directory() . '/includes/helpers.php';
```

### JavaScript
```php
// Enqueue with dependencies
wp_enqueue_script(
    'hd-patient-search',
    get_template_directory_uri() . '/assets/js/patient-search.js',
    ['jquery'],
    HD_VERSION,
    true
);
```

---

## Checklist

- [ ] Files in correct directories?
- [ ] Following naming conventions?
- [ ] Using proper WordPress loading functions?
- [ ] Assets enqueued, not hardcoded?
