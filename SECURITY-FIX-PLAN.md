# Security Fix Plan - HelpingDoctors EHR Pro

**Priority:** CRITICAL
**Target:** Production-ready medical records system
**Timeline:** 24-36 hours for critical fixes

---

## CRITICAL FIXES (Do These First!)

### Fix #1: SQL Injection in Database Backup 🚨

**File:** `includes/class-hd-database.php`
**Line:** 520
**Severity:** CRITICAL
**Time:** 1 hour

**Current Code (VULNERABLE):**
```php
$backup_content .= "INSERT INTO $table_name VALUES (" . implode( ', ', $values ) . ");\n";
```

**Fixed Code:**
```php
// Use proper escaping for SQL values
$escaped_values = array_map( function( $value ) use ( $wpdb ) {
    if ( is_null( $value ) ) {
        return 'NULL';
    }
    return "'" . $wpdb->_real_escape( $value ) . "'";
}, array_values( $row ) );

$backup_content .= "INSERT INTO $table_name VALUES (" . implode( ', ', $escaped_values ) . ");\n";
```

**Testing:**
1. Create backup with patient data containing quotes/special chars
2. Restore backup
3. Verify data integrity

---

### Fix #2: Missing Capability Checks in AJAX 🚨

**File:** `includes/frontend/class-hd-ajax.php`
**Lines:** 162-175, 312-325, and more
**Severity:** CRITICAL (HIPAA violation)
**Time:** 2-3 hours

**Current Code (VULNERABLE):**
```php
public function get_patient_appointments() {
    check_ajax_referer( 'hd_ehr_nonce', 'nonce' );
    // NO capability check - any logged-in user can access!
    if ( ! is_user_logged_in() ) {
        wp_send_json_error( 'Not logged in' );
    }
    $patient_id = intval( $_POST['patient_id'] );
    // ... fetches patient data
}
```

**Fixed Code:**
```php
public function get_patient_appointments() {
    check_ajax_referer( 'hd_ehr_nonce', 'nonce' );

    // Check if user is logged in
    if ( ! is_user_logged_in() ) {
        wp_send_json_error( array( 'message' => __( 'Authentication required', 'helpingdoctors-ehr' ) ) );
    }

    // Check capability
    if ( ! current_user_can( 'hd_view_appointments' ) ) {
        HD_Audit::log_action( 'unauthorized_access_attempt', 'appointments', null, array(
            'user_id' => get_current_user_id(),
            'attempted_action' => 'get_patient_appointments'
        ) );
        wp_send_json_error( array( 'message' => __( 'Insufficient permissions', 'helpingdoctors-ehr' ) ) );
    }

    $patient_id = intval( $_POST['patient_id'] ?? 0 );

    // Verify user has access to THIS patient
    if ( ! HD_Patients::can_user_access_patient( get_current_user_id(), $patient_id ) ) {
        HD_Audit::log_action( 'unauthorized_patient_access_attempt', 'patients', $patient_id, array(
            'user_id' => get_current_user_id()
        ) );
        wp_send_json_error( array( 'message' => __( 'Access denied to this patient record', 'helpingdoctors-ehr' ) ) );
    }

    // ... fetch appointments
}
```

**AJAX Handlers Requiring Fixes:**
1. `get_patient_appointments` - Line 162
2. `get_available_slots` - Line 312 (wp_ajax_nopriv - REMOVE THIS!)
3. `quick_patient_search` - Line 510
4. `export_patient_data` - Line 639
5. `upload_medical_document` - Line 697
6. `save_patient_profile` - Line 748
7. `get_patient_medical_history` - Line 813

**Capability Mapping:**
```php
// Add to each AJAX handler:
$capability_map = array(
    'get_patient_appointments' => 'hd_view_appointments',
    'quick_patient_search' => 'hd_view_patients',
    'export_patient_data' => 'hd_export_data',
    'upload_medical_document' => 'hd_upload_documents',
    'save_patient_profile' => 'hd_edit_patients',
    'get_patient_medical_history' => 'hd_view_medical_history',
);
```

---

### Fix #3: Insecure File Upload Paths 🚨

**File:** `includes/frontend/class-hd-ajax.php`
**Lines:** 706-715
**Severity:** CRITICAL
**Time:** 1-2 hours

**Current Code (VULNERABLE):**
```php
$medical_dir = $upload_dir['basedir'] . '/medical-documents/' . $patient_id;
$filename = 'doc_' . time() . '_' . wp_generate_password( 8, false ) . '.' . $file_ext;
$filepath = $medical_dir . '/' . $filename;
```

**Fixed Code:**
```php
// Validate patient_id is numeric
$patient_id = absint( $patient_id );
if ( $patient_id <= 0 ) {
    wp_send_json_error( array( 'message' => 'Invalid patient ID' ) );
}

// Verify patient exists
if ( ! HD_Patients::patient_exists( $patient_id ) ) {
    wp_send_json_error( array( 'message' => 'Patient not found' ) );
}

// Validate file extension against whitelist
$allowed_extensions = array( 'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx' );
if ( ! in_array( strtolower( $file_ext ), $allowed_extensions, true ) ) {
    wp_send_json_error( array( 'message' => 'File type not allowed' ) );
}

// Create secure directory structure
$medical_dir = $upload_dir['basedir'] . '/medical-documents/' . absint( $patient_id );

// Create directory with restrictive permissions
if ( ! file_exists( $medical_dir ) ) {
    wp_mkdir_p( $medical_dir );
    chmod( $medical_dir, 0750 ); // Owner: rwx, Group: r-x, Other: none

    // Add .htaccess to prevent direct access
    $htaccess_content = "# Deny all direct access\n";
    $htaccess_content .= "Order deny,allow\n";
    $htaccess_content .= "Deny from all\n";
    $htaccess_content .= "<FilesMatch \"\\.(jpg|jpeg|png|pdf)$\">\n";
    $htaccess_content .= "    Deny from all\n";
    $htaccess_content .= "</FilesMatch>\n";
    file_put_contents( $medical_dir . '/.htaccess', $htaccess_content );
}

// Generate cryptographically secure filename
$filename = 'doc_' . time() . '_' . bin2hex( random_bytes( 16 ) ) . '.' . $file_ext;
$filepath = $medical_dir . '/' . $filename;

// Validate final path doesn't contain directory traversal
$real_medical_dir = realpath( $upload_dir['basedir'] . '/medical-documents' );
$real_filepath = realpath( dirname( $filepath ) );
if ( strpos( $real_filepath, $real_medical_dir ) !== 0 ) {
    wp_send_json_error( array( 'message' => 'Invalid file path' ) );
}
```

**Additional Security:**
```php
// Add to document download handler:
public function download_medical_document() {
    check_ajax_referer( 'hd_ehr_nonce', 'nonce' );

    // Verify permission
    if ( ! current_user_can( 'hd_view_documents' ) ) {
        wp_die( 'Access denied', 403 );
    }

    $document_id = absint( $_GET['document_id'] ?? 0 );
    $document = HD_Documents::get_document( $document_id );

    if ( ! $document ) {
        wp_die( 'Document not found', 404 );
    }

    // Verify user has access to this patient's documents
    if ( ! HD_Patients::can_user_access_patient( get_current_user_id(), $document->patient_id ) ) {
        HD_Audit::log_action( 'unauthorized_document_access_attempt', 'documents', $document_id );
        wp_die( 'Access denied', 403 );
    }

    // Log access
    HD_Audit::log_action( 'document_downloaded', 'documents', $document_id, array(
        'patient_id' => $document->patient_id
    ) );

    // Serve file with proper headers
    $filepath = $document->file_path;
    if ( ! file_exists( $filepath ) ) {
        wp_die( 'File not found', 404 );
    }

    header( 'Content-Type: application/octet-stream' );
    header( 'Content-Disposition: attachment; filename="' . basename( $filepath ) . '"' );
    header( 'Content-Length: ' . filesize( $filepath ) );
    header( 'Cache-Control: no-cache, must-revalidate' );
    header( 'Pragma: no-cache' );
    readfile( $filepath );
    exit;
}
```

---

### Fix #4: Race Condition in Appointment Booking 🔴

**File:** `includes/modules/class-hd-appointments.php`
**Severity:** HIGH
**Time:** 2 hours

**Current Code (VULNERABLE):**
```php
public static function create_appointment( $data ) {
    // Check if slot is available
    $is_available = self::is_slot_available( $doctor_id, $appointment_date, $start_time );

    if ( ! $is_available ) {
        return new WP_Error( 'slot_unavailable', 'This time slot is not available' );
    }

    // Create appointment (another user could book same slot here!)
    $appointment_id = HD_Database::secure_insert( 'appointments', $data );
    return $appointment_id;
}
```

**Fixed Code (Using Database Locking):**
```php
public static function create_appointment( $data ) {
    global $wpdb;

    $doctor_id = absint( $data['doctor_id'] );
    $appointment_date = sanitize_text_field( $data['appointment_date'] );
    $start_time = sanitize_text_field( $data['start_time'] );

    // Start transaction
    $wpdb->query( 'START TRANSACTION' );

    try {
        // Lock the row for this doctor/date/time combination
        $table_name = $wpdb->prefix . 'hd_appointments';
        $wpdb->query( $wpdb->prepare(
            "SELECT * FROM {$table_name}
            WHERE doctor_id = %d
            AND appointment_date = %s
            AND start_time = %s
            AND status NOT IN ('cancelled', 'no_show')
            FOR UPDATE",
            $doctor_id,
            $appointment_date,
            $start_time
        ) );

        // Check if slot is available (within locked transaction)
        $existing = $wpdb->get_var( $wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name}
            WHERE doctor_id = %d
            AND appointment_date = %s
            AND start_time = %s
            AND status NOT IN ('cancelled', 'no_show')",
            $doctor_id,
            $appointment_date,
            $start_time
        ) );

        if ( $existing > 0 ) {
            $wpdb->query( 'ROLLBACK' );
            return new WP_Error( 'slot_unavailable', 'This time slot is no longer available' );
        }

        // Create appointment
        $appointment_id = HD_Database::secure_insert( 'appointments', $data );

        if ( ! $appointment_id ) {
            $wpdb->query( 'ROLLBACK' );
            return new WP_Error( 'insert_failed', 'Failed to create appointment' );
        }

        // Log in audit trail
        HD_Audit::log_action( 'appointment_created', 'appointments', $appointment_id, array(
            'patient_id' => $data['patient_id'],
            'doctor_id' => $doctor_id,
            'appointment_date' => $appointment_date,
            'start_time' => $start_time
        ) );

        // Commit transaction
        $wpdb->query( 'COMMIT' );

        return $appointment_id;

    } catch ( Exception $e ) {
        $wpdb->query( 'ROLLBACK' );
        HD_Audit::log_action( 'appointment_creation_failed', 'appointments', null, array(
            'error' => $e->getMessage()
        ) );
        return new WP_Error( 'exception', $e->getMessage() );
    }
}
```

---

### Fix #5: No Transaction Support for Prescriptions 🔴

**File:** `includes/modules/class-hd-prescriptions.php`
**Lines:** 94-116
**Severity:** HIGH (HIPAA violation if audit logging fails)
**Time:** 1-2 hours

**Current Code (VULNERABLE):**
```php
public static function create_prescription( $data ) {
    // Create prescription
    $prescription_id = HD_Database::secure_insert( 'prescriptions', $data );

    // Update patient medications
    self::update_patient_current_medications( $data['patient_id'], $data['medication_name'] );

    // Log audit
    HD_Audit::log_action( 'prescription_created', 'prescriptions', $prescription_id );

    return $prescription_id;
}
```

**Fixed Code (With Transactions):**
```php
public static function create_prescription( $data ) {
    global $wpdb;

    // Validate required data
    $required = array( 'patient_id', 'medication_name', 'prescribing_doctor_id' );
    foreach ( $required as $field ) {
        if ( empty( $data[$field] ) ) {
            return new WP_Error( 'missing_field', "Required field missing: {$field}" );
        }
    }

    // Start transaction
    $wpdb->query( 'START TRANSACTION' );

    try {
        // Check for drug interactions BEFORE creating prescription
        if ( class_exists( 'HD_Drug_Interactions' ) ) {
            $interaction_check = HD_Drug_Interactions::check_prescription_interactions(
                $data['patient_id'],
                $data['medication_name']
            );

            if ( $interaction_check['has_interactions'] && $interaction_check['max_severity'] >= 4 ) {
                // Critical interaction - require override flag
                if ( empty( $data['override_interaction_warning'] ) ) {
                    $wpdb->query( 'ROLLBACK' );
                    return new WP_Error(
                        'critical_interaction',
                        'Critical drug interaction detected. Review required.',
                        array( 'interactions' => $interaction_check['interactions'] )
                    );
                }
            }
        }

        // Create prescription
        $prescription_id = HD_Database::secure_insert( 'prescriptions', $data );

        if ( ! $prescription_id ) {
            $wpdb->query( 'ROLLBACK' );
            return new WP_Error( 'insert_failed', 'Failed to create prescription: ' . $wpdb->last_error );
        }

        // Update patient current medications
        $medication_update = self::update_patient_current_medications(
            $data['patient_id'],
            $data['medication_name'],
            $prescription_id
        );

        if ( is_wp_error( $medication_update ) ) {
            $wpdb->query( 'ROLLBACK' );
            return $medication_update;
        }

        // CRITICAL: Log to audit trail (HIPAA requirement)
        $audit_logged = HD_Audit::log_action(
            'prescription_created',
            'prescriptions',
            $prescription_id,
            array(
                'patient_id' => $data['patient_id'],
                'medication_name' => $data['medication_name'],
                'prescribing_doctor_id' => $data['prescribing_doctor_id'],
                'interaction_override' => ! empty( $data['override_interaction_warning'] )
            )
        );

        if ( ! $audit_logged ) {
            // HIPAA violation if we can't log - rollback entire operation
            $wpdb->query( 'ROLLBACK' );
            return new WP_Error(
                'audit_log_failed',
                'Failed to log prescription creation (HIPAA requirement). Operation cancelled.'
            );
        }

        // Deduct from inventory if enabled
        if ( class_exists( 'HD_Inventory_Manager' ) && ! empty( $data['dispense_now'] ) ) {
            $inventory_result = HD_Inventory_Manager::deduct_inventory(
                $prescription_id,
                $data['quantity']
            );

            if ( is_wp_error( $inventory_result ) ) {
                // Log warning but don't rollback - prescription is valid even if inventory fails
                HD_Audit::log_action( 'inventory_deduction_failed', 'prescriptions', $prescription_id, array(
                    'error' => $inventory_result->get_error_message()
                ) );
            }
        }

        // Send notification to patient if enabled
        if ( ! empty( $data['notify_patient'] ) ) {
            do_action( 'hd_prescription_created', $prescription_id, $data['patient_id'] );
        }

        // Commit transaction
        $wpdb->query( 'COMMIT' );

        return $prescription_id;

    } catch ( Exception $e ) {
        $wpdb->query( 'ROLLBACK' );
        HD_Audit::log_action( 'prescription_creation_exception', 'prescriptions', null, array(
            'error' => $e->getMessage(),
            'patient_id' => $data['patient_id'] ?? null
        ) );
        return new WP_Error( 'exception', 'Prescription creation failed: ' . $e->getMessage() );
    }
}
```

---

## MEDIUM-PRIORITY FIXES

### Fix #6: Rate Limiting on AJAX Endpoints

**Implementation:**
```php
// Add to class-hd-ajax.php

private function check_rate_limit( $action, $limit = 60, $window = 60 ) {
    $user_id = get_current_user_id();
    if ( ! $user_id ) {
        $user_id = $_SERVER['REMOTE_ADDR']; // Use IP for non-logged-in users
    }

    $rate_limit_key = 'hd_rate_limit_' . $action . '_' . md5( $user_id );
    $requests = get_transient( $rate_limit_key );

    if ( $requests === false ) {
        // First request in window
        set_transient( $rate_limit_key, 1, $window );
        return true;
    }

    if ( $requests >= $limit ) {
        // Rate limit exceeded
        HD_Audit::log_action( 'rate_limit_exceeded', 'security', $user_id, array(
            'action' => $action,
            'requests' => $requests,
            'ip' => $_SERVER['REMOTE_ADDR']
        ) );

        wp_send_json_error( array(
            'message' => __( 'Too many requests. Please try again later.', 'helpingdoctors-ehr' ),
            'retry_after' => $window
        ), 429 );
    }

    // Increment counter
    set_transient( $rate_limit_key, $requests + 1, $window );
    return true;
}

// Add to each AJAX handler:
public function quick_patient_search() {
    // Check rate limit: 60 searches per minute
    $this->check_rate_limit( 'patient_search', 60, MINUTE_IN_SECONDS );

    check_ajax_referer( 'hd_ehr_nonce', 'nonce' );
    // ... rest of handler
}
```

---

### Fix #7: Escape ALL Output in Admin Templates

**Search Pattern:** `<?php echo $variable;` (without esc_*)
**Replace With:** `<?php echo esc_html( $variable ); ?>`

**Example Fix:**
```php
// BEFORE:
<span class="patient-id">ID: <?php echo $result->patient_id; ?></span>

// AFTER:
<span class="patient-id">ID: <?php echo esc_html( $result->patient_id ); ?></span>
```

**Escaping Guide:**
- Text content: `esc_html()`
- HTML attributes: `esc_attr()`
- URLs: `esc_url()`
- JavaScript strings: `esc_js()`
- Textarea content: `esc_textarea()`

---

### Fix #8: Array Access Validation

**Pattern to Find:** Direct `$_POST['key']` access
**Replace With:** `$_POST['key'] ?? default_value`

**Example:**
```php
// BEFORE:
$date_from = sanitize_text_field( $_POST['date_from'] );

// AFTER:
$date_from = sanitize_text_field( $_POST['date_from'] ?? '' );
```

**Or use helper function:**
```php
private function get_post_value( $key, $default = '', $sanitize = 'sanitize_text_field' ) {
    return isset( $_POST[$key] ) ? $sanitize( $_POST[$key] ) : $default;
}

// Usage:
$date_from = $this->get_post_value( 'date_from', current_time( 'Y-m-d' ) );
$patient_id = $this->get_post_value( 'patient_id', 0, 'absint' );
```

---

## TESTING CHECKLIST

After each fix:

- [ ] Unit test the specific function
- [ ] Test with invalid/malicious input
- [ ] Verify audit logging works
- [ ] Check error handling
- [ ] Test transaction rollback
- [ ] Verify no PHP errors in debug.log
- [ ] Test with different user roles
- [ ] Verify HIPAA compliance (all PHI access logged)

---

## DEPLOYMENT ORDER

1. ✅ Fix #1 (SQL Injection) - Deploy immediately
2. ✅ Fix #3 (File Upload) - Deploy immediately
3. ✅ Fix #2 (Capability Checks) - Deploy as batch
4. ✅ Fix #4 (Race Conditions) - Deploy with testing
5. ✅ Fix #5 (Transactions) - Deploy with testing
6. ⏳ Fix #6-8 (Medium priority) - Deploy in next release

---

**Total Estimated Time:** 24-36 hours
**Files to Modify:** 5-7 files
**New Tests Required:** 15-20 test cases
**Documentation Updates:** Security policy, audit procedures

---

**NEXT STEP:** Implement fixes #1-5, test thoroughly, deploy to staging, then production.
