# Error Handling

**Project:** HelpingDoctors EHR Pro
**Principle:** Fail gracefully, log thoroughly, never expose internals

---

## Error Handling Pattern

```php
try {
    $result = hd_process_patient_data($data);
} catch (HD_Validation_Exception $e) {
    // User-correctable error
    hd_add_notice($e->getMessage(), 'error');
    return;
} catch (HD_Database_Exception $e) {
    // System error - log and show generic message
    hd_log_error($e);
    hd_add_notice('Unable to save. Please try again.', 'error');
    return;
} catch (Exception $e) {
    // Unexpected error
    hd_log_error($e, 'critical');
    hd_add_notice('An unexpected error occurred.', 'error');
    return;
}
```

---

## Custom Exception Classes

```php
class HD_Exception extends Exception {}
class HD_Validation_Exception extends HD_Exception {}
class HD_Database_Exception extends HD_Exception {}
class HD_Permission_Exception extends HD_Exception {}
class HD_Feature_Not_Implemented extends HD_Exception {}
```

---

## Logging

```php
function hd_log_error($exception, $level = 'error') {
    $log_entry = [
        'timestamp' => current_time('mysql'),
        'level'     => $level,
        'message'   => $exception->getMessage(),
        'file'      => $exception->getFile(),
        'line'      => $exception->getLine(),
        'trace'     => $exception->getTraceAsString(),
        'user_id'   => get_current_user_id(),
        'ip'        => hd_get_client_ip()
    ];
    
    // Log to database
    global $wpdb;
    $wpdb->insert($wpdb->prefix . 'hd_error_log', $log_entry);
    
    // Also log to file for critical errors
    if ($level === 'critical') {
        error_log(json_encode($log_entry));
    }
}
```

---

## User-Facing Messages

### ✅ Good Messages
- "Patient record saved successfully."
- "Unable to save. Please check the highlighted fields."
- "Session expired. Please log in again."

### ❌ Bad Messages
- "Error: SQLSTATE[23000]: Integrity constraint violation"
- "Fatal error in /var/www/includes/class-patient.php line 234"
- "undefined index: patient_id"

---

## AJAX Error Responses

```php
// Standardised AJAX error response
function hd_ajax_error($message, $code = 'error') {
    wp_send_json_error([
        'code'    => $code,
        'message' => $message
    ], 400);
}

// Usage
if (!hd_user_can_edit_patient($patient_id)) {
    hd_ajax_error('You do not have permission to edit this patient.', 'permission_denied');
}
```

---

## Checklist

- [ ] Using try-catch for risky operations?
- [ ] Logging errors with context?
- [ ] User messages are helpful, not technical?
- [ ] Never exposing stack traces to users?
- [ ] AJAX errors use standard format?
