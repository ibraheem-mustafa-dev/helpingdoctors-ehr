# Medical Data Security

**Project:** HelpingDoctors EHR Pro
**Compliance:** HIPAA, GDPR, UK Data Protection Act

---

## Core Principles

1. **Encrypt at rest** - AES-256-GCM for sensitive data
2. **Audit everything** - All access logged
3. **Soft delete** - Never hard delete medical records
4. **Minimum privilege** - Role-based access control

---

## Encryption

### Using the Encryption Helper
```php
// Encrypt sensitive data before storage
$encrypted = hd_encrypt($patient_data, HD_ENCRYPTION_KEY);

// Decrypt when retrieving
$decrypted = hd_decrypt($encrypted_data, HD_ENCRYPTION_KEY);
```

### What MUST Be Encrypted
- Patient names
- Contact information
- Medical conditions
- Prescriptions
- Lab results
- Any PII (Personally Identifiable Information)

### What Can Be Plain Text
- Appointment times (without patient details)
- System configuration
- Non-identifying statistics

---

## Audit Logging

### Every Sensitive Action Must Be Logged
```php
hd_audit_log([
    'action'      => 'patient_record_viewed',
    'user_id'     => get_current_user_id(),
    'patient_id'  => $patient_id,
    'ip_address'  => hd_get_client_ip(),
    'timestamp'   => current_time('mysql'),
    'details'     => 'Viewed patient demographics'
]);
```

### Actions That MUST Be Logged
- Patient record access (view, edit, create)
- Prescription creation/modification
- User login/logout
- Permission changes
- Data exports
- Failed access attempts

---

## Soft Delete

### NEVER Hard Delete Medical Records
```php
// WRONG - Hard delete
$wpdb->delete($table, ['id' => $record_id]);

// CORRECT - Soft delete
$wpdb->update(
    $table,
    [
        'deleted_at' => current_time('mysql'),
        'deleted_by' => get_current_user_id()
    ],
    ['id' => $record_id]
);
```

### Include in All Queries
```php
// WRONG - Returns deleted records
$patients = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}hd_patients");

// CORRECT - Excludes deleted records
$patients = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}hd_patients WHERE deleted_at IS NULL"
);
```

---

## Role-Based Access

### Check Permissions Before Every Action
```php
// Before showing patient data
if (!hd_user_can_view_patient($user_id, $patient_id)) {
    wp_die('Access denied');
}

// Before editing prescriptions
if (!hd_user_can_prescribe()) {
    wp_die('You do not have permission to prescribe');
}
```

---

## Checklist

- [ ] Sensitive data encrypted with hd_encrypt()?
- [ ] Action logged to audit trail?
- [ ] Using soft delete, not hard delete?
- [ ] Permission checked before access?
- [ ] Deleted records excluded from queries?
