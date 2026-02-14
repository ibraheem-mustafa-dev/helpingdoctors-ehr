# IMPLEMENTATION: Security Patterns

**Source:** ADR-004-encrypted-messaging.md, security_implementation_summary.md
**Status:** ✅ Complete (A+ SSL Grade)
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR implements **AES-256-CBC encryption** for all sensitive data at rest. This meets HIPAA and GDPR requirements with zero external dependencies - critical for Gaza's intermittent connectivity.

**Key Features:**
- AES-256-CBC encryption (government-approved standard)
- Works offline (no external service dependency)
- Field-level encryption for messages, notes, PHI
- Complete audit trail for compliance

---

## Compliance Status

| Standard | Requirement | Implementation | Status |
|----------|-------------|----------------|--------|
| **HIPAA** | §164.312 Encryption at rest | AES-256-CBC | ✅ |
| **GDPR** | Article 32 Security of processing | Encrypted messages | ✅ |
| **SSL** | TLS 1.3 transport security | A+ grade | ✅ |

---

## HD_Encryption Class

### File Location
`includes/security/class-hd-encryption.php`

### Full Implementation

```php
<?php
/**
 * HD_Encryption Class
 * AES-256-CBC encryption for HIPAA/GDPR compliance
 * 
 * @package HelpingDoctors_EHR
 */

class HD_Encryption {
    
    /**
     * Cipher method - AES-256-CBC is HIPAA compliant
     */
    const CIPHER_METHOD = 'AES-256-CBC';
    
    /**
     * Encryption key from wp-config.php
     * Must be 32 bytes (256 bits) for AES-256
     */
    private static function get_key(): string {
        if (!defined('HD_ENCRYPTION_KEY')) {
            throw new Exception('HD_ENCRYPTION_KEY not defined in wp-config.php');
        }
        return HD_ENCRYPTION_KEY;
    }
    
    /**
     * Encrypt data using AES-256-CBC
     *
     * @param string $plaintext Data to encrypt
     * @return string Base64-encoded encrypted data with IV prepended
     * @throws Exception If encryption fails
     */
    public static function encrypt(string $plaintext): string {
        if (empty($plaintext)) {
            return '';
        }
        
        // Generate random Initialisation Vector (IV)
        $iv_length = openssl_cipher_iv_length(self::CIPHER_METHOD);
        $iv = openssl_random_pseudo_bytes($iv_length);
        
        // Encrypt the data
        $encrypted = openssl_encrypt(
            $plaintext,
            self::CIPHER_METHOD,
            self::get_key(),
            OPENSSL_RAW_DATA,
            $iv
        );
        
        if ($encrypted === false) {
            throw new Exception('Encryption failed: ' . openssl_error_string());
        }
        
        // Prepend IV to encrypted data (needed for decryption)
        $encrypted_with_iv = $iv . $encrypted;
        
        // Return base64-encoded for safe database storage
        return base64_encode($encrypted_with_iv);
    }
    
    /**
     * Decrypt data using AES-256-CBC
     *
     * @param string $encrypted_data Base64-encoded encrypted data with IV
     * @return string Decrypted plaintext
     * @throws Exception If decryption fails
     */
    public static function decrypt(string $encrypted_data): string {
        if (empty($encrypted_data)) {
            return '';
        }
        
        // Decode base64
        $encrypted_with_iv = base64_decode($encrypted_data);
        
        if ($encrypted_with_iv === false) {
            throw new Exception('Invalid base64 encoding');
        }
        
        // Extract IV (first 16 bytes for AES-256-CBC)
        $iv_length = openssl_cipher_iv_length(self::CIPHER_METHOD);
        $iv = substr($encrypted_with_iv, 0, $iv_length);
        
        // Extract encrypted data
        $encrypted = substr($encrypted_with_iv, $iv_length);
        
        // Decrypt
        $decrypted = openssl_decrypt(
            $encrypted,
            self::CIPHER_METHOD,
            self::get_key(),
            OPENSSL_RAW_DATA,
            $iv
        );
        
        if ($decrypted === false) {
            throw new Exception('Decryption failed: ' . openssl_error_string());
        }
        
        return $decrypted;
    }
    
    /**
     * Test if encryption is working correctly
     *
     * @return bool True if encryption works
     */
    public static function test(): bool {
        try {
            $test_string = 'HIPAA Compliance Test: PHI Data ' . time();
            $encrypted = self::encrypt($test_string);
            $decrypted = self::decrypt($encrypted);
            return ($test_string === $decrypted);
        } catch (Exception $e) {
            error_log('HD_Encryption test failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Generate a new encryption key
     * Run once during initial setup
     *
     * @return string 64-character hex string (256-bit key)
     */
    public static function generate_key(): string {
        return bin2hex(openssl_random_pseudo_bytes(32));
    }
}
```

---

## Key Management

### Configuration

```php
// wp-config.php (outside web root for security)

/**
 * HelpingDoctors Encryption Key
 * 64-character hex string (256-bit)
 * Generate with: HD_Encryption::generate_key()
 * NEVER commit to version control
 */
define('HD_ENCRYPTION_KEY', 'your-64-character-hex-key-here');
```

### Key Generation (One-Time Setup)

```php
// Run in WP-CLI or temporary admin page
$new_key = HD_Encryption::generate_key();
echo "Add to wp-config.php:\n";
echo "define('HD_ENCRYPTION_KEY', '{$new_key}');\n";
```

### Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Key length | 256-bit (32 bytes, 64 hex chars) |
| Storage location | wp-config.php (outside web root) |
| File permissions | 0600 (owner read/write only) |
| Version control | NEVER commit (use .gitignore) |
| Backup | Encrypted backup separate from database |

---

## Encrypted Messaging Implementation

### Database Schema

```sql
CREATE TABLE hd_messages (
    message_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_user_id BIGINT UNSIGNED NOT NULL,
    to_user_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(255) NOT NULL,      -- NOT encrypted (for list view)
    body_encrypted TEXT NOT NULL,        -- ENCRYPTED message body
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_read TINYINT(1) DEFAULT 0,
    read_at DATETIME NULL,
    sent_at DATETIME NOT NULL,
    deleted TINYINT(1) DEFAULT 0,
    
    INDEX idx_recipient (to_user_id, is_read),
    INDEX idx_sender (from_user_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Send Message (Encrypt)

```php
<?php
/**
 * File: includes/communication/class-hd-internal-messaging.php
 * Lines: 82-131
 */

public function send_message(
    int $from_user_id,
    int $to_user_id,
    string $subject,
    string $message_body,
    string $priority = 'normal'
): int|WP_Error {
    global $wpdb;
    
    // Validate users
    if (!get_userdata($from_user_id) || !get_userdata($to_user_id)) {
        return new WP_Error('invalid_user', 'Invalid sender or recipient');
    }
    
    // ENCRYPT message body (Line 88)
    $encrypted_body = HD_Encryption::encrypt($message_body);
    
    // Insert into database
    $result = $wpdb->insert(
        $wpdb->prefix . 'hd_messages',
        [
            'from_user_id' => $from_user_id,
            'to_user_id' => $to_user_id,
            'subject' => sanitize_text_field($subject),
            'body_encrypted' => $encrypted_body,
            'priority' => $priority,
            'sent_at' => current_time('mysql'),
        ],
        ['%d', '%d', '%s', '%s', '%s', '%s']
    );
    
    if ($result === false) {
        return new WP_Error('db_error', 'Failed to send message');
    }
    
    // Audit log
    HD_Audit_Logger::log('message_sent', [
        'to_user_id' => $to_user_id,
        'subject' => $subject,
        'priority' => $priority,
    ]);
    
    return $wpdb->insert_id;
}
```

### Read Message (Decrypt)

```php
<?php
/**
 * Get message with decryption
 */
public function get_message(int $message_id, int $user_id): object|WP_Error {
    global $wpdb;
    
    // Get message (only if user is sender or recipient)
    $message = $wpdb->get_row($wpdb->prepare("
        SELECT * FROM {$wpdb->prefix}hd_messages
        WHERE message_id = %d
        AND (from_user_id = %d OR to_user_id = %d)
    ", $message_id, $user_id, $user_id));
    
    if (!$message) {
        return new WP_Error('not_found', 'Message not found');
    }
    
    // DECRYPT body
    $message->body = HD_Encryption::decrypt($message->body_encrypted);
    unset($message->body_encrypted); // Remove encrypted version
    
    // Mark as read if recipient
    if ($message->to_user_id === $user_id && !$message->is_read) {
        $this->mark_as_read($message_id);
    }
    
    // Audit log
    HD_Audit_Logger::log('message_read', [
        'message_id' => $message_id,
    ]);
    
    return $message;
}
```

---

## Performance Metrics

### Encryption Overhead

| Operation | Time | Impact |
|-----------|------|--------|
| AES-256 encrypt | ~0.5ms | Negligible |
| AES-256 decrypt | ~0.5ms | Negligible |
| Database query | ~5-20ms | Dominant factor |
| **Total overhead** | <5% | Acceptable |

### Optimisation Strategies

1. **Subject not encrypted** - Message list loads fast
2. **Lazy decryption** - Only decrypt when message opened
3. **Hardware acceleration** - Modern CPUs have AES-NI instructions

### Bandwidth Impact

| Metric | Plain | Encrypted | Difference |
|--------|-------|-----------|------------|
| Average message | 200 bytes | 266 bytes | +33% (base64) |
| Impact | - | Negligible | 66 bytes |

---

## Audit Logging

### HD_Audit_Logger Class

```php
<?php
/**
 * File: includes/security/class-hd-audit-logger.php
 */

class HD_Audit_Logger {
    
    /**
     * Log an action for GDPR compliance
     */
    public static function log(string $action, array $data = []): void {
        global $wpdb;
        
        $wpdb->insert(
            $wpdb->prefix . 'hd_audit_logs',
            [
                'user_id' => get_current_user_id(),
                'action' => $action,
                'data' => wp_json_encode($data),
                'ip_address' => self::get_client_ip(),
                'user_agent' => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? ''),
                'timestamp' => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%s', '%s', '%s']
        );
    }
    
    /**
     * Get client IP address (handles proxies)
     */
    private static function get_client_ip(): string {
        $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = explode(',', $_SERVER[$header])[0];
                return sanitize_text_field(trim($ip));
            }
        }
        
        return '';
    }
}
```

### Audit Events

| Event | Data Logged | GDPR Requirement |
|-------|-------------|------------------|
| `message_sent` | to_user_id, subject, priority | Article 30 |
| `message_read` | message_id | Article 30 |
| `patient_viewed` | patient_id | Article 30 |
| `prescription_created` | rx_id, patient_id, medication | Article 30 |
| `login_success` | - | Security |
| `login_failed` | attempted_username | Security |

---

## Key Rotation (Phase 2 Enhancement)

### Implementation

```php
<?php
/**
 * Key rotation for enhanced security
 * Planned for Phase 2
 */

class HD_Key_Rotation {
    
    /**
     * Rotate encryption key
     * Re-encrypts all data with new key
     */
    public static function rotate_key(string $new_key): bool {
        global $wpdb;
        
        // Get current key
        $old_key = HD_ENCRYPTION_KEY;
        
        // Get all encrypted messages
        $messages = $wpdb->get_results("
            SELECT message_id, body_encrypted 
            FROM {$wpdb->prefix}hd_messages
        ");
        
        $wpdb->query('START TRANSACTION');
        
        try {
            foreach ($messages as $message) {
                // Decrypt with old key
                $plaintext = HD_Encryption::decrypt($message->body_encrypted);
                
                // Re-encrypt with new key (temporarily swap key)
                define('HD_NEW_KEY', $new_key);
                $new_encrypted = self::encrypt_with_key($plaintext, $new_key);
                
                // Update database
                $wpdb->update(
                    $wpdb->prefix . 'hd_messages',
                    ['body_encrypted' => $new_encrypted],
                    ['message_id' => $message->message_id]
                );
            }
            
            $wpdb->query('COMMIT');
            
            // Log rotation
            HD_Audit_Logger::log('key_rotation_complete', [
                'records_updated' => count($messages),
            ]);
            
            return true;
            
        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            error_log('Key rotation failed: ' . $e->getMessage());
            return false;
        }
    }
}
```

---

## Unit Tests

```php
<?php
/**
 * File: tests/test-encryption.php
 */

class Test_HD_Encryption extends WP_UnitTestCase {
    
    public function test_encrypt_decrypt_roundtrip(): void {
        $original = 'Patient has diabetes type 2. PHI data.';
        
        $encrypted = HD_Encryption::encrypt($original);
        $decrypted = HD_Encryption::decrypt($encrypted);
        
        $this->assertEquals($original, $decrypted);
    }
    
    public function test_encrypted_differs_from_original(): void {
        $original = 'Sensitive medical information';
        
        $encrypted = HD_Encryption::encrypt($original);
        
        $this->assertNotEquals($original, $encrypted);
        $this->assertNotEquals($original, base64_decode($encrypted));
    }
    
    public function test_empty_string_handling(): void {
        $encrypted = HD_Encryption::encrypt('');
        $decrypted = HD_Encryption::decrypt('');
        
        $this->assertEquals('', $encrypted);
        $this->assertEquals('', $decrypted);
    }
    
    public function test_unicode_support(): void {
        $original = 'مريض يعاني من ارتفاع ضغط الدم'; // Arabic PHI
        
        $encrypted = HD_Encryption::encrypt($original);
        $decrypted = HD_Encryption::decrypt($encrypted);
        
        $this->assertEquals($original, $decrypted);
    }
    
    public function test_self_test(): void {
        $result = HD_Encryption::test();
        
        $this->assertTrue($result);
    }
    
    public function test_key_generation(): void {
        $key = HD_Encryption::generate_key();
        
        $this->assertEquals(64, strlen($key)); // 32 bytes = 64 hex chars
        $this->assertMatchesRegularExpression('/^[0-9a-f]+$/', $key);
    }
}
```

---

## Related Documentation

- [ADR-004: Encrypted Messaging](../decisions/ADR-004-encrypted-messaging.md)
- [IMPLEMENTATION-DATABASE-PATTERNS.md](./database/IMPLEMENTATION-DATABASE-PATTERNS.md)
- [GDPR Compliance Guide](../compliance/GDPR-GUIDE.md)
