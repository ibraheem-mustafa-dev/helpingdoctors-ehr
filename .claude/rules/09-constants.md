# Constants and Configuration

**Project:** HelpingDoctors EHR Pro
**Location:** wp-config.php
**Rule:** NEVER assume these are missing

---

## Constants That EXIST

All configured in wp-config.php. Do NOT create error handling for "missing" constants:

```php
// Security & Encryption
HD_ENCRYPTION_KEY          // AES-256-GCM encryption key

// Cloudflare Turnstile (CAPTCHA)
HD_TURNSTILE_SITE_KEY      // Public key
HD_TURNSTILE_SECRET_KEY    // Server key

// Twilio (SMS)
HD_TWILIO_SID              // Account SID
HD_TWILIO_TOKEN            // Auth token
HD_TWILIO_PHONE            // Sender phone number

// WHO ICD-11 API
HD_WHO_ICD11_TOKEN         // API authentication token

// Feature Flags
HD_FEATURE_VIDEO_ENABLED   // Video consultation
HD_FEATURE_SMS_ENABLED     // SMS reminders
HD_FEATURE_OCR_ENABLED     // OCR scanning
```

---

## Usage Pattern

### ✅ Correct - Use Directly
```php
// Constants exist - use them
$encrypted = openssl_encrypt(
    $data,
    'aes-256-gcm',
    HD_ENCRYPTION_KEY,
    0,
    $iv,
    $tag
);

// Send SMS
$twilio = new Twilio\Rest\Client(HD_TWILIO_SID, HD_TWILIO_TOKEN);
$twilio->messages->create($to, [
    'from' => HD_TWILIO_PHONE,
    'body' => $message
]);
```

### ❌ Wrong - Checking If Defined
```php
// WRONG - Creates unnecessary error handling
if (!defined('HD_ENCRYPTION_KEY')) {
    throw new Exception('Encryption key not configured');
}

// WRONG - Defaulting to empty
$key = defined('HD_ENCRYPTION_KEY') ? HD_ENCRYPTION_KEY : '';
```

---

## Environment-Specific Values

```php
// Development vs Production
if (WP_DEBUG) {
    // Development settings
} else {
    // Production settings (Hostinger)
}
```

---

## Adding New Constants

When new constants are needed:

1. Document in DETAILED-SPECIFICATIONS.md
2. User adds to wp-config.php
3. Use directly in code (don't check if defined)

---

## Checklist

- [ ] Using constants directly, not checking if defined?
- [ ] Not creating error handling for "missing" constants?
- [ ] New constants documented for user to add?
