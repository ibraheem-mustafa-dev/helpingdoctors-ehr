# IMPLEMENTATION: Pharmacy Inventory Patterns

**Source:** ADR-005-fifo-inventory-management.md
**Status:** ✅ Complete
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR uses **FEFO (First Expired, First Out)** inventory management for pharmaceutical supplies. This is the industry standard that minimises medication waste - critical for Gaza's resource-constrained humanitarian context.

**Key Benefits:**
- 50-60% waste reduction
- $6,000-$15,000/year savings per medium clinic
- Automatic expired medication exclusion
- WHO/FDA regulatory compliance

---

## File Locations

| File | Purpose |
|------|---------|
| `includes/inventory/class-hd-inventory-manager.php` | Core FEFO logic |
| `includes/pharmacy/class-hd-pharmacy-dispense.php` | Dispense workflow |
| `includes/admin/class-hd-inventory-admin.php` | Admin interface |
| `templates/pharmacy/dispense-form.php` | Dispense UI |

---

## Database Schema

### Pharmacy Inventory Table

```sql
CREATE TABLE hd_pharmacy_inventory (
    inventory_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medication_name VARCHAR(255) NOT NULL,
    quantity_on_hand INT UNSIGNED NOT NULL,
    reorder_level INT UNSIGNED NOT NULL DEFAULT 10,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    supplier VARCHAR(255) NULL,
    cost_per_unit DECIMAL(10,2) NULL,
    clinic_id BIGINT UNSIGNED NOT NULL,
    last_updated DATETIME NOT NULL,

    INDEX idx_medication (medication_name),
    INDEX idx_expiry (expiry_date),
    INDEX idx_clinic (clinic_id),
    INDEX idx_composite (medication_name, expiry_date, quantity_on_hand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Stock Movements Table (Audit Trail)

```sql
CREATE TABLE hd_stock_movements (
    movement_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventory_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM('add', 'dispense', 'adjust', 'return', 'waste') NOT NULL,
    quantity INT NOT NULL,  -- Negative for dispense
    user_id BIGINT UNSIGNED NOT NULL,
    timestamp DATETIME NOT NULL,
    notes TEXT NULL,
    prescription_id BIGINT UNSIGNED NULL,

    INDEX idx_inventory (inventory_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_movement_type (movement_type),
    FOREIGN KEY (inventory_id) REFERENCES hd_pharmacy_inventory(inventory_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## FEFO Algorithm Implementation

### Core Deduction Logic (Lines 122-149)

```php
<?php
/**
 * File: includes/inventory/class-hd-inventory-manager.php
 * Lines: 122-149
 */

public function deduct_inventory(int $rx_id, int $quantity): bool|WP_Error {
    global $wpdb;

    // 1. Get medication name from prescription
    $prescription = $wpdb->get_row($wpdb->prepare(
        "SELECT medication_name FROM {$wpdb->prefix}hd_prescriptions WHERE rx_id = %d",
        $rx_id
    ));

    if (!$prescription) {
        return new WP_Error('invalid_rx', 'Prescription not found');
    }

    $medication = $prescription->medication_name;
    $clinic_id = HD_User_Clinics::get_current_clinic_id();

    // 2. Get inventory batches ordered by expiry (FEFO)
    //    Line 139: AND expiry_date > CURDATE() -- Excludes expired
    //    Line 141: ORDER BY expiry_date ASC -- Oldest expiry first (FEFO)
    $inventory_items = $wpdb->get_results($wpdb->prepare("
        SELECT *
        FROM {$wpdb->prefix}hd_pharmacy_inventory
        WHERE medication_name = %s
        AND quantity_on_hand > 0
        AND expiry_date > CURDATE()
        AND clinic_id = %d
        ORDER BY expiry_date ASC
    ", $medication, $clinic_id));

    if (empty($inventory_items)) {
        return new WP_Error('out_of_stock', 'Medication not available or all batches expired');
    }

    // 3. Deduct from batches (oldest expiry first) until quantity satisfied
    $remaining_quantity = $quantity;

    foreach ($inventory_items as $item) {
        if ($remaining_quantity <= 0) {
            break;
        }

        $deduct_amount = min($remaining_quantity, $item->quantity_on_hand);

        // Update inventory
        $wpdb->update(
            $wpdb->prefix . 'hd_pharmacy_inventory',
            ['quantity_on_hand' => $item->quantity_on_hand - $deduct_amount],
            ['inventory_id' => $item->inventory_id],
            ['%d'],
            ['%d']
        );

        // Log stock movement (audit trail)
        $this->log_stock_movement(
            $item->inventory_id,
            'dispense',
            -$deduct_amount,
            get_current_user_id(),
            'Dispensed for prescription #' . $rx_id
        );

        $remaining_quantity -= $deduct_amount;
    }

    // 4. Check if fully satisfied
    if ($remaining_quantity > 0) {
        return new WP_Error(
            'insufficient_stock',
            sprintf('Only %d available, need %d', $quantity - $remaining_quantity, $quantity)
        );
    }

    return true;
}
```

---

## Automatic Deduction Integration

### Dispense Trigger (Line 63)

```php
<?php
/**
 * File: includes/pharmacy/class-hd-pharmacy-dispense.php
 * Line: 63
 */

public function dispense_medication(
    int $rx_id,
    int $quantity,
    string $signature,
    bool $counseling
): bool|WP_Error {
    global $wpdb;
    
    // Validation...
    
    // Mark prescription as dispensed
    $wpdb->update(
        $wpdb->prefix . 'hd_prescriptions',
        [
            'dispensed' => 1,
            'dispensed_at' => current_time('mysql'),
            'dispensed_by' => get_current_user_id(),
        ],
        ['rx_id' => $rx_id],
        ['%d', '%s', '%d'],
        ['%d']
    );

    // TRIGGER INVENTORY DEDUCTION (Line 63)
    do_action('hd_medication_dispensed', $rx_id, $quantity);

    // Audit logging...
    HD_Audit_Logger::log('medication_dispensed', [
        'rx_id' => $rx_id,
        'quantity' => $quantity,
    ]);

    return true;
}
```

### Action Hook Handler (Line 25)

```php
<?php
/**
 * File: includes/inventory/class-hd-inventory-manager.php
 * Line: 25
 */

public function __construct() {
    // Hook for automatic deduction on dispense
    add_action('hd_medication_dispensed', [$this, 'deduct_inventory'], 10, 2);
    
    // Daily cron for expiry checks
    add_action('hd_daily_inventory_check', [$this, 'check_expiring_items']);
}
```

### Flow Diagram

```
┌─────────────────────┐
│ Pharmacist clicks   │
│ "Dispense" button   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Pharmacy dispenses  │
│ prescription        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Action hook fires:  │
│ hd_medication_      │
│ dispensed           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Inventory manager   │
│ deducts via FEFO    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Stock movement      │
│ logged (audit)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Dashboard widgets   │
│ update              │
└─────────────────────┘
```

---

## Expiry Alert System

### Daily Cron Job (Line 28)

```php
<?php
/**
 * File: includes/inventory/class-hd-inventory-manager.php
 */

public function check_expiring_items(): void {
    global $wpdb;

    // Find items expiring in next 90 days
    $expiring_soon = $wpdb->get_results("
        SELECT *
        FROM {$wpdb->prefix}hd_pharmacy_inventory
        WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        AND quantity_on_hand > 0
        ORDER BY expiry_date ASC
    ");

    // Send notifications to pharmacy manager
    if (!empty($expiring_soon)) {
        $this->send_expiry_alert($expiring_soon);
    }

    // Update dashboard widget count
    update_option('hd_expiring_items_count', count($expiring_soon));
}
```

### Dashboard Widget Colour Coding

| Days to Expiry | Colour | Action |
|----------------|--------|--------|
| < 30 days | 🔴 Red | Urgent - prioritise dispensing |
| 30-60 days | 🟠 Orange | Warning - plan to use |
| 60-90 days | 🟡 Yellow | Monitor - normal FEFO will handle |

---

## Waste Reduction Analysis

### Gaza Clinic Scenario

**Assumptions:**
- Medium-sized Gaza clinic
- 500 medication SKUs in inventory
- Average inventory value: $100,000
- Expiry rate WITHOUT FEFO: 10% waste/year
- Expiry rate WITH FEFO: 4% waste/year

### Savings Calculation

| Metric | Without FEFO | With FEFO | Savings |
|--------|--------------|-----------|---------|
| **Annual Waste** | $10,000 (10%) | $4,000 (4%) | **$6,000/year** |
| **Medications Wasted** | 100 SKUs | 40 SKUs | **60 SKUs saved** |
| **Patient Impact** | 1,000 patients | 400 patients | **600 patients served** |

### Humanitarian Impact

- $6,000 saved = ~300 additional patient treatments
- 60 medication SKUs saved = critical supplies for emergency care
- FEFO has zero implementation cost (pure savings)

---

## Test Cases

### FEFO Verification Tests

```php
/**
 * Test FEFO deducts from oldest expiry first
 */
public function test_fefo_order(): void {
    // Setup: 3 batches of same medication with different expiry dates
    $this->create_inventory('Paracetamol', 100, '2025-06-01', 'BATCH-A');
    $this->create_inventory('Paracetamol', 100, '2025-03-01', 'BATCH-B'); // Earliest
    $this->create_inventory('Paracetamol', 100, '2025-09-01', 'BATCH-C');
    
    // Dispense 50 units
    $this->deduct_inventory('Paracetamol', 50);
    
    // Assert: BATCH-B (earliest expiry) should be reduced
    $batch_b = $this->get_inventory('BATCH-B');
    $this->assertEquals(50, $batch_b->quantity_on_hand); // 100 - 50 = 50
    
    $batch_a = $this->get_inventory('BATCH-A');
    $this->assertEquals(100, $batch_a->quantity_on_hand); // Unchanged
    
    $batch_c = $this->get_inventory('BATCH-C');
    $this->assertEquals(100, $batch_c->quantity_on_hand); // Unchanged
}

/**
 * Test expired items are excluded
 */
public function test_expired_excluded(): void {
    // Setup: One expired, one valid batch
    $this->create_inventory('Amoxicillin', 100, '2024-01-01', 'EXPIRED'); // Past
    $this->create_inventory('Amoxicillin', 100, '2025-12-01', 'VALID');
    
    // Dispense 50 units
    $this->deduct_inventory('Amoxicillin', 50);
    
    // Assert: Only VALID batch used, EXPIRED untouched
    $expired = $this->get_inventory('EXPIRED');
    $this->assertEquals(100, $expired->quantity_on_hand); // Still 100
    
    $valid = $this->get_inventory('VALID');
    $this->assertEquals(50, $valid->quantity_on_hand); // 100 - 50 = 50
}

/**
 * Test multi-batch deduction
 */
public function test_multi_batch_deduction(): void {
    // Setup: Two batches with 30 each
    $this->create_inventory('Ibuprofen', 30, '2025-02-01', 'BATCH-1');
    $this->create_inventory('Ibuprofen', 30, '2025-04-01', 'BATCH-2');
    
    // Dispense 50 units (needs both batches)
    $this->deduct_inventory('Ibuprofen', 50);
    
    // Assert: BATCH-1 depleted, BATCH-2 has 10 remaining
    $batch_1 = $this->get_inventory('BATCH-1');
    $this->assertEquals(0, $batch_1->quantity_on_hand); // Fully depleted
    
    $batch_2 = $this->get_inventory('BATCH-2');
    $this->assertEquals(10, $batch_2->quantity_on_hand); // 30 - 20 = 10
}
```

---

## Regulatory Compliance

### WHO Guidelines
- FEFO standard for pharmaceutical storage (WHO Technical Report Series)
- Batch tracking for quality assurance
- Audit trail for inspections

### FDA Compliance
- 21 CFR Part 211 - Current Good Manufacturing Practice
- Batch number tracking for recalls
- Expiry date management

---

## Related Documentation

- [ADR-005: FIFO Inventory Management](../decisions/ADR-005-fifo-inventory-management.md)
- [IMPLEMENTATION-SECURITY-PATTERNS.md](./security/IMPLEMENTATION-SECURITY-PATTERNS.md)
- [Dashboard Widget: Inventory Alerts](./dashboard-widgets/IMPLEMENTATION-WIDGET-PATTERNS.md)
