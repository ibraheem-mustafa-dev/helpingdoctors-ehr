# PHPStan Setup Guide

**Level:** 4-5 (recommended)
**PHP Version:** 8.2
**WordPress Extension:** Yes

---

## Installation

```bash
# Install PHPStan
composer require --dev phpstan/phpstan

# Install WordPress extension
composer require --dev szepeviktor/phpstan-wordpress
```

---

## Configuration

Create `phpstan.neon` in project root:

```neon
includes:
    - vendor/szepeviktor/phpstan-wordpress/extension.neon

parameters:
    level: 5
    
    paths:
        - wp-content/plugins/helping-doctors-ehr/
        - wp-content/themes/theme/
    
    excludePaths:
        - */vendor/*
        - */node_modules/*
    
    bootstrapFiles:
        - phpstan-bootstrap.php
    
    ignoreErrors:
        # Add specific ignores if needed
        # - '#Function get_field not found#'
    
    checkMissingIterableValueType: false
```

---

## Bootstrap File

Create `phpstan-bootstrap.php`:

```php
<?php
/**
 * PHPStan bootstrap file.
 * Defines WordPress constants and functions for static analysis.
 */

// Define WordPress constants.
define( 'ABSPATH', __DIR__ . '/' );
define( 'WP_CONTENT_DIR', __DIR__ . '/wp-content' );
define( 'WP_PLUGIN_DIR', WP_CONTENT_DIR . '/plugins' );
define( 'WPINC', 'wp-includes' );

// Define project constants.
define( 'HD_PLUGIN_PATH', WP_PLUGIN_DIR . '/helping-doctors-ehr/' );
define( 'HD_PLUGIN_URL', 'https://example.com/wp-content/plugins/helping-doctors-ehr/' );
define( 'HD_VERSION', '1.0.0' );

// Define constants that exist in wp-config.php.
define( 'HD_ENCRYPTION_KEY', 'test-key-for-phpstan' );
define( 'HD_TURNSTILE_SITE_KEY', 'test-key' );
define( 'HD_TURNSTILE_SECRET_KEY', 'test-key' );
define( 'HD_TWILIO_SID', 'test-sid' );
define( 'HD_TWILIO_TOKEN', 'test-token' );
define( 'HD_TWILIO_PHONE', '+1234567890' );
define( 'HD_WHO_ICD11_TOKEN', 'test-token' );
```

---

## Running PHPStan

```bash
# Run at configured level
./vendor/bin/phpstan analyse

# Run at specific level
./vendor/bin/phpstan analyse -l 5

# Run on specific file
./vendor/bin/phpstan analyse wp-content/plugins/helping-doctors-ehr/includes/class-patient.php

# Generate baseline (for existing projects)
./vendor/bin/phpstan analyse --generate-baseline
```

---

## VS Code Task

Add to `.vscode/tasks.json`:

```json
{
    "label": "PHPStan: Analyse Current File",
    "type": "shell",
    "command": "./vendor/bin/phpstan",
    "args": ["analyse", "${file}", "-l", "5"],
    "problemMatcher": []
}
```

---

## Understanding Levels

| Level | Checks |
|-------|--------|
| 0 | Basic checks, unknown classes, functions |
| 1 | + Possibly undefined variables |
| 2 | + Unknown methods on objects |
| 3 | + Return types |
| 4 | + Dead code, unreachable branches |
| 5 | + Argument types |
| 6 | + Missing typehints |
| 7 | + Union types |
| 8 | + Nullable types |
| 9 | + Mixed type restrictions |

**Recommended for this project:** Level 4-5

---

## Common Issues

| Error | Fix |
|-------|-----|
| Unknown function `get_field` | Install ACF stubs or add to ignoreErrors |
| Parameter $x has no typehint | Add `@param` in docblock or PHP type |
| Return type missing | Add `@return` in docblock or PHP return type |
| Call to undefined method | Check class exists, add `@method` annotation |
