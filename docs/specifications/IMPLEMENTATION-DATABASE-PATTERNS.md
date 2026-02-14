# IMPLEMENTATION: Database Patterns

**Source:** ADR-001-database-first-architecture.md
**Status:** ✅ Complete
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR uses a **database-first architecture** with custom tables (`hd_*` prefix) instead of WordPress Custom Post Types. This decision is documented in ADR-001 and is FINAL.

**Key Benefits:**
- 5-10x faster than post meta queries
- Field-level encryption for HIPAA/GDPR
- Database transactions for atomic operations
- Foreign key constraints for data integrity

---

## Performance Benchmarks

| Operation | Database-First | Post Meta | Improvement |
|-----------|----------------|-----------|-------------|
| Patient search (10,000 records) | 0.05s | 0.5s | **10x faster** |
| Appointment report (1 year) | 0.2s | 2.5s | **12x faster** |
| Complex 4-table join | 0.1s | 5+ seconds | **50x faster** |

---

## Core Tables

### Naming Convention
- Prefix: `wp_{site_id}_hd_` (e.g., `wp_3_hd_patients`)
- All lowercase with underscores
- Singular noun (patient, not patients)

### Medical Data Tables

```sql
-- Clinic Records
hd_clinics

-- Patient Records
hd_patients

-- Appointments
hd_appointments

-- Clinical Encounters (SOAP notes)
hd_encounters / hd_medical_encounters

-- Prescriptions
hd_prescriptions

-- User-Clinic Assignments
hd_user_clinics

-- Staff Schedules
hd_staff_schedules

-- GDPR Audit Trail
hd_audit_logs
```

### Laboratory Tables

```sql
hd_lab_orders        -- Lab test orders
hd_lab_test_items    -- Individual tests in an order
hd_lab_results       -- Test results (has critical_value column)
hd_lab_test_catalog  -- Available tests
hd_lab_test_panels   -- Test panels (CBC, BMP, etc.)
```

### Additional Tables

```sql
hd_pharmacy_inventory   -- Medication stock (FEFO)
hd_payments            -- Payment records
hd_messages            -- Secure messaging (encrypted)
hd_emergency_transfers -- Emergency transfers
hd_security_events     -- Security audit
```

---

## HD_Database Class

### File Location
`includes/class-hd-database.php`

### Core Methods

```php
<?php
class HD_Database {
    
    private static $instance = null;
    
    public static function get_instance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Secure insert with optional encryption
     * 
     * @param string $table Table name (without prefix)
     * @param array $data Data to insert
     * @param array $encrypted_fields Fields to encrypt before insert
     * @return int|false Insert ID or false on failure
     */
    public function secure_insert(string $table, array $data, array $encrypted_fields = []) {
        global $wpdb;
        
        // Encrypt specified fields
        foreach ($encrypted_fields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $data[$field] = HD_Encryption::encrypt($data[$field]);
            }
        }
        
        $table_name = $wpdb->prefix . 'hd_' . $table;
        $result = $wpdb->insert($table_name, $data);
        
        if ($result === false) {
            HD_Audit_Logger::log('db_insert_error', [
                'table' => $table,
                'error' => $wpdb->last_error,
            ]);
            return false;
        }
        
        return $wpdb->insert_id;
    }
    
    /**
     * Get patients with GDPR clinic filtering
     * 
     * @param array $args Query arguments
     * @return array Patient records
     */
    public function get_patients(array $args = []): array {
        global $wpdb;
        
        $defaults = [
            'clinic_id' => null,
            'status' => 'active',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'last_name',
            'order' => 'ASC',
        ];
        
        $args = wp_parse_args($args, $defaults);
        $table = $wpdb->prefix . 'hd_patients';
        
        // GDPR: Filter by user's assigned clinics
        if ($args['clinic_id'] === null) {
            $clinic_ids = HD_User_Clinics::get_user_clinic_ids(get_current_user_id());
            if (empty($clinic_ids)) {
                return [];
            }
            $clinic_filter = sprintf(
                "clinic_id IN (%s)",
                implode(',', array_map('intval', $clinic_ids))
            );
        } else {
            $clinic_filter = $wpdb->prepare("clinic_id = %d", $args['clinic_id']);
        }
        
        $sql = $wpdb->prepare(
            "SELECT * FROM {$table}
             WHERE {$clinic_filter}
             AND status = %s
             ORDER BY {$args['orderby']} {$args['order']}
             LIMIT %d OFFSET %d",
            $args['status'],
            $args['limit'],
            $args['offset']
        );
        
        return $wpdb->get_results($sql, ARRAY_A);
    }
}
```

---

## Transaction Examples

### Example 1: Prescribe + Deduct Inventory

```php
/**
 * Create prescription and deduct from inventory atomically
 * Both must succeed or both must fail
 */
public function prescribe_medication(int $patient_id, array $medication): bool {
    global $wpdb;
    
    try {
        $wpdb->query('START TRANSACTION');
        
        // 1. Create prescription record
        $prescription_id = $wpdb->insert($wpdb->prefix . 'hd_prescriptions', [
            'patient_id' => $patient_id,
            'medication_id' => $medication['id'],
            'dosage' => $medication['dosage'],
            'quantity' => $medication['quantity'],
            'prescribed_by' => get_current_user_id(),
            'prescribed_at' => current_time('mysql'),
        ]);
        
        if ($prescription_id === false) {
            throw new Exception('Failed to create prescription');
        }
        
        // 2. Deduct from inventory using FEFO
        $deducted = $this->deduct_inventory_fefo(
            $medication['id'],
            $medication['quantity']
        );
        
        if (!$deducted) {
            throw new Exception('Insufficient inventory');
        }
        
        // 3. Log the transaction
        HD_Audit_Logger::log('prescription_created', [
            'prescription_id' => $prescription_id,
            'patient_id' => $patient_id,
            'medication_id' => $medication['id'],
        ]);
        
        $wpdb->query('COMMIT');
        return true;
        
    } catch (Exception $e) {
        $wpdb->query('ROLLBACK');
        HD_Audit_Logger::log('prescription_failed', [
            'error' => $e->getMessage(),
            'patient_id' => $patient_id,
        ]);
        return false;
    }
}
```

### Example 2: Patient Transfer + Access Log

```php
/**
 * Transfer patient to another clinic with audit trail
 */
public function transfer_patient(int $patient_id, int $new_clinic_id, string $reason): bool {
    global $wpdb;
    
    try {
        $wpdb->query('START TRANSACTION');
        
        // 1. Get current clinic
        $current = $wpdb->get_var($wpdb->prepare(
            "SELECT clinic_id FROM {$wpdb->prefix}hd_patients WHERE id = %d",
            $patient_id
        ));
        
        // 2. Update patient clinic
        $wpdb->update(
            $wpdb->prefix . 'hd_patients',
            ['clinic_id' => $new_clinic_id],
            ['id' => $patient_id],
            ['%d'],
            ['%d']
        );
        
        // 3. Create transfer record
        $wpdb->insert($wpdb->prefix . 'hd_emergency_transfers', [
            'patient_id' => $patient_id,
            'from_clinic_id' => $current,
            'to_clinic_id' => $new_clinic_id,
            'reason' => $reason,
            'transferred_by' => get_current_user_id(),
            'transferred_at' => current_time('mysql'),
        ]);
        
        // 4. Audit log
        HD_Audit_Logger::log('patient_transferred', [
            'patient_id' => $patient_id,
            'from_clinic' => $current,
            'to_clinic' => $new_clinic_id,
            'reason' => $reason,
        ]);
        
        $wpdb->query('COMMIT');
        return true;
        
    } catch (Exception $e) {
        $wpdb->query('ROLLBACK');
        return false;
    }
}
```

### Example 3: Lab Order + Notify + Update

```php
/**
 * Complete lab result with notification and patient update
 */
public function complete_lab_result(int $order_id, array $results): bool {
    global $wpdb;
    
    try {
        $wpdb->query('START TRANSACTION');
        
        // 1. Update lab results
        foreach ($results as $test_id => $result) {
            $wpdb->update(
                $wpdb->prefix . 'hd_lab_results',
                [
                    'result_value' => $result['value'],
                    'result_unit' => $result['unit'],
                    'is_critical' => $result['is_critical'] ? 1 : 0,
                    'completed_at' => current_time('mysql'),
                ],
                ['id' => $test_id]
            );
        }
        
        // 2. Update order status
        $wpdb->update(
            $wpdb->prefix . 'hd_lab_orders',
            ['status' => 'completed', 'completed_at' => current_time('mysql')],
            ['id' => $order_id]
        );
        
        // 3. Create notification for ordering provider
        $order = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}hd_lab_orders WHERE id = %d",
            $order_id
        ));
        
        $has_critical = array_filter($results, fn($r) => $r['is_critical']);
        
        HD_Notifications::create([
            'user_id' => $order->ordered_by,
            'type' => $has_critical ? 'critical_lab' : 'lab_complete',
            'message' => $has_critical 
                ? 'CRITICAL: Lab results require immediate review'
                : 'Lab results ready for review',
            'reference_id' => $order_id,
        ]);
        
        // 4. Audit log
        HD_Audit_Logger::log('lab_completed', [
            'order_id' => $order_id,
            'has_critical' => !empty($has_critical),
        ]);
        
        $wpdb->query('COMMIT');
        return true;
        
    } catch (Exception $e) {
        $wpdb->query('ROLLBACK');
        return false;
    }
}
```

---

## Scalability

### Tested Limits

| Metric | Tested Value | Performance |
|--------|--------------|-------------|
| Patients | 10,000 | Query < 1s |
| Appointments | 50,000 | Query < 1s |
| Annual data | 200MB | Backup 30s |

### Indexing Strategy

```sql
-- Patient table indexes
ALTER TABLE wp_3_hd_patients 
    ADD INDEX idx_clinic_status (clinic_id, status),
    ADD INDEX idx_last_name (last_name),
    ADD INDEX idx_phone (phone_number);

-- Appointment indexes
ALTER TABLE wp_3_hd_appointments
    ADD INDEX idx_clinic_date (clinic_id, appointment_date),
    ADD INDEX idx_provider_date (provider_id, appointment_date),
    ADD INDEX idx_patient (patient_id);

-- Lab results indexes
ALTER TABLE wp_3_hd_lab_results
    ADD INDEX idx_order (order_id),
    ADD INDEX idx_critical (is_critical, completed_at);
```

---

## GDPR Clinic Filtering Pattern

**Always filter data by user's assigned clinics:**

```php
// Get clinics user can access
$clinic_ids = HD_User_Clinics::get_user_clinic_ids(get_current_user_id());

if (empty($clinic_ids)) {
    return []; // No access to any clinic
}

// Use in queries
$placeholders = implode(',', array_fill(0, count($clinic_ids), '%d'));
$sql = $wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}hd_patients 
     WHERE clinic_id IN ($placeholders)",
    ...$clinic_ids
);
```

---

## Anti-Patterns (DO NOT DO)

### ❌ Raw SQL Without Prepared Statements
```php
// WRONG - SQL injection risk
$wpdb->query("SELECT * FROM patients WHERE id = " . $_GET['id']);

// CORRECT
$wpdb->prepare("SELECT * FROM patients WHERE id = %d", intval($_GET['id']));
```

### ❌ Bypassing HD_Database Class
```php
// WRONG - No encryption, no audit
$wpdb->insert('hd_messages', ['body' => $message]);

// CORRECT - Uses encryption automatically
HD_Database::get_instance()->secure_insert('messages', [
    'body' => $message
], ['body']); // Encrypt body field
```

### ❌ Ignoring GDPR Clinic Filter
```php
// WRONG - Shows all patients regardless of user's clinic access
$wpdb->get_results("SELECT * FROM hd_patients");

// CORRECT - Filters by assigned clinics
HD_Database::get_instance()->get_patients();
```

---

## Related Documentation

- [ADR-001: Database-First Architecture](../decisions/ADR-001-database-first-architecture.md)
- [IMPLEMENTATION-SECURITY-PATTERNS.md](./security/IMPLEMENTATION-SECURITY-PATTERNS.md)
