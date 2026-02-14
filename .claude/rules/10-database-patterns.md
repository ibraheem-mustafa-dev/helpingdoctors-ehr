# Database Patterns

**Project:** HelpingDoctors EHR Pro
**Engine:** MySQL (WordPress)
**Tables:** 70+ custom tables with wp_X_hd_ prefix

---

## Table Naming

```php
// Always use $wpdb->prefix for multisite support
$table = $wpdb->prefix . 'hd_patients';
// Results in: wp_3_hd_patients (for blog ID 3)

// NEVER hardcode
$table = 'wp_hd_patients';  // WRONG - missing blog ID
```

---

## Prepared Statements

**ALWAYS use prepared statements. No exceptions.**

```php
// ✅ Correct - Prepared statement
$patient = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}hd_patients WHERE id = %d",
        $patient_id
    )
);

// ✅ Correct - Multiple parameters
$appointments = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}hd_appointments 
         WHERE patient_id = %d AND date >= %s",
        $patient_id,
        $start_date
    )
);

// ❌ Wrong - Direct variable insertion
$patient = $wpdb->get_row(
    "SELECT * FROM {$wpdb->prefix}hd_patients WHERE id = {$patient_id}"
);
```

---

## Soft Delete Pattern

```php
// All queries must exclude deleted records
$patients = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}hd_patients 
     WHERE deleted_at IS NULL"
);

// Soft delete implementation
$wpdb->update(
    $wpdb->prefix . 'hd_patients',
    [
        'deleted_at' => current_time('mysql'),
        'deleted_by' => get_current_user_id()
    ],
    ['id' => $patient_id],
    ['%s', '%d'],
    ['%d']
);
```

---

## Table Creation (Activation Hook)

```php
// Create tables on plugin activation
register_activation_hook(__FILE__, 'hd_create_tables');

function hd_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}hd_patients (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        mrn varchar(50) NOT NULL,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        date_of_birth date NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at datetime DEFAULT NULL,
        deleted_by bigint(20) UNSIGNED DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY mrn (mrn),
        KEY deleted_at (deleted_at)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
```

---

## Checklist

- [ ] Using $wpdb->prefix for all tables?
- [ ] Using prepared statements for all queries?
- [ ] Including WHERE deleted_at IS NULL?
- [ ] Using activation hook for table creation?
