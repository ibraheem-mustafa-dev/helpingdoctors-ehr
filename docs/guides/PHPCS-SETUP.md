# PHPCS Setup Guide

**Standard:** WordPress Coding Standards
**PHP Version:** 8.2
**WordPress Version:** 6.8.2

---

## Installation

### 1. Install Composer (if not installed)
```bash
# Windows (run in PowerShell as Admin)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
choco install composer
```

### 2. Install PHPCS and WordPress Standards
```bash
# In project root
composer require --dev squizlabs/php_codesniffer
composer require --dev wp-coding-standards/wpcs
composer require --dev phpcompatibility/phpcompatibility-wp

# Configure PHPCS to use WordPress standards
./vendor/bin/phpcs --config-set installed_paths vendor/wp-coding-standards/wpcs,vendor/phpcompatibility/phpcompatibility-wp
```

---

## VS Code Configuration

### Install Extension
Search for "PHP Sniffer" or "phpcs" in VS Code extensions.

### settings.json
```json
{
    "phpcs.enable": true,
    "phpcs.executablePath": "./vendor/bin/phpcs",
    "phpcs.standard": "WordPress",
    "phpcs.showWarnings": true,
    "phpcbf.enable": true,
    "phpcbf.executablePath": "./vendor/bin/phpcbf"
}
```

---

## phpcs.xml Configuration

Create `phpcs.xml` in project root:

```xml
<?xml version="1.0"?>
<ruleset name="HelpingDoctors EHR">
    <description>WordPress Coding Standards for HelpingDoctors EHR</description>
    
    <!-- Scan these files -->
    <file>./wp-content/plugins/helping-doctors-ehr/</file>
    <file>./wp-content/themes/theme/</file>
    
    <!-- Exclude -->
    <exclude-pattern>*/vendor/*</exclude-pattern>
    <exclude-pattern>*/node_modules/*</exclude-pattern>
    <exclude-pattern>*.min.js</exclude-pattern>
    <exclude-pattern>*.min.css</exclude-pattern>
    
    <!-- WordPress Standards -->
    <rule ref="WordPress">
        <!-- Exclude some rules if needed -->
        <exclude name="WordPress.Files.FileName.InvalidClassFileName"/>
    </rule>
    
    <!-- PHP Compatibility -->
    <rule ref="PHPCompatibilityWP"/>
    <config name="testVersion" value="8.2-"/>
    <config name="minimum_supported_wp_version" value="6.4"/>
    
    <!-- Text domain -->
    <rule ref="WordPress.WP.I18n">
        <properties>
            <property name="text_domain" type="array">
                <element value="helping-doctors-ehr"/>
            </property>
        </properties>
    </rule>
</ruleset>
```

---

## Running PHPCS

### Check Files
```bash
# Check single file
./vendor/bin/phpcs path/to/file.php

# Check directory
./vendor/bin/phpcs wp-content/plugins/helping-doctors-ehr/

# Check with specific standard
./vendor/bin/phpcs --standard=WordPress path/to/file.php
```

### Auto-Fix
```bash
# Fix single file
./vendor/bin/phpcbf path/to/file.php

# Fix directory
./vendor/bin/phpcbf wp-content/plugins/helping-doctors-ehr/
```

---

## VS Code Tasks

Add to `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "PHPCS: Check Current File",
            "type": "shell",
            "command": "./vendor/bin/phpcs",
            "args": ["${file}"],
            "problemMatcher": "$phpcs"
        },
        {
            "label": "PHPCBF: Fix Current File",
            "type": "shell",
            "command": "./vendor/bin/phpcbf",
            "args": ["${file}"]
        }
    ]
}
```

---

## Common Fixes

| Error | Fix |
|-------|-----|
| Missing file comment | Add `/** * File description */` at top |
| Yoda conditions | `if ( true === $var )` not `if ( $var === true )` |
| Space after opening bracket | `if ( $x )` not `if ($x)` |
| Missing text domain | Use `__( 'text', 'helping-doctors-ehr' )` |
