# IMPLEMENTATION: Payment Patterns

**Source:** ADR-002-mollie-payment-gateway.md
**Status:** ✅ Complete
**Last Updated:** December 2025

---

## Overview

HelpingDoctors EHR uses **Mollie** as the primary payment gateway. This decision is documented in ADR-002 and is FINAL. Do NOT suggest Stripe or other alternatives.

**Key Points:**
- 38% lower fees than Stripe (1.8% vs 2.9%)
- EU-based with strong GDPR compliance
- Ethical alignment with humanitarian mission
- No card data stored on server (PCI compliant)

---

## File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `includes/integrations/class-hd-mollie-integration.php` | Main integration class | 570 |
| `includes/admin/class-hd-payment-settings.php` | Admin settings | ~200 |
| `templates/book-appointment.php` | Booking with payment | ~300 |

---

## HD_Mollie_Integration Class

### Class Structure

```php
<?php
/**
 * Mollie Payment Gateway Integration
 * 
 * @package HelpingDoctors_EHR_Pro
 * @since 1.0.0
 */

class HD_Mollie_Integration {
    
    /**
     * Mollie API client instance
     * @var \Mollie\Api\MollieApiClient
     */
    private $mollie;
    
    /**
     * Singleton instance
     * @var self
     */
    private static $instance = null;
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->mollie = new \Mollie\Api\MollieApiClient();
        $this->mollie->setApiKey($this->get_api_key());
        $this->init_hooks();
    }
    
    /**
     * Get singleton instance
     * @return self
     */
    public static function get_instance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Initialise WordPress hooks
     */
    private function init_hooks(): void {
        add_action('wp_ajax_hd_mollie_webhook', [$this, 'handle_webhook']);
        add_action('wp_ajax_nopriv_hd_mollie_webhook', [$this, 'handle_webhook']);
        add_action('wp_ajax_hd_create_payment', [$this, 'create_payment']);
    }
    
    /**
     * Get API key based on mode
     * @return string
     */
    private function get_api_key(): string {
        $mode = get_option('hd_mollie_mode', 'test');
        
        if ($mode === 'live') {
            return defined('HD_MOLLIE_LIVE_KEY') 
                ? HD_MOLLIE_LIVE_KEY 
                : get_option('hd_mollie_live_key', '');
        }
        
        return defined('HD_MOLLIE_TEST_KEY') 
            ? HD_MOLLIE_TEST_KEY 
            : get_option('hd_mollie_test_key', '');
    }
}
```

### Creating Payments

```php
/**
 * Create a new payment
 * 
 * @param array $args {
 *     Payment arguments.
 *     @type float  $amount         Payment amount.
 *     @type string $currency       Currency code (USD, EUR, GBP).
 *     @type string $description    Payment description.
 *     @type int    $appointment_id Associated appointment ID.
 *     @type int    $patient_id     Patient ID.
 * }
 * @return array|WP_Error Payment details or error.
 */
public function create_payment(array $args) {
    $defaults = [
        'amount' => 0,
        'currency' => 'USD',
        'description' => 'Medical consultation fee',
        'appointment_id' => 0,
        'patient_id' => 0,
    ];
    
    $args = wp_parse_args($args, $defaults);
    
    // Validate amount
    if ($args['amount'] <= 0) {
        return new WP_Error('invalid_amount', 'Payment amount must be greater than zero');
    }
    
    // Validate currency
    $allowed_currencies = ['USD', 'EUR', 'GBP', 'ILS'];
    if (!in_array($args['currency'], $allowed_currencies, true)) {
        return new WP_Error('invalid_currency', 'Unsupported currency');
    }
    
    try {
        $payment = $this->mollie->payments->create([
            'amount' => [
                'currency' => $args['currency'],
                'value' => number_format($args['amount'], 2, '.', ''),
            ],
            'description' => sanitize_text_field($args['description']),
            'redirectUrl' => add_query_arg([
                'hd_payment_return' => 1,
                'appointment_id' => $args['appointment_id'],
            ], home_url('/payment-complete/')),
            'webhookUrl' => admin_url('admin-ajax.php?action=hd_mollie_webhook'),
            'metadata' => [
                'appointment_id' => $args['appointment_id'],
                'patient_id' => $args['patient_id'],
                'site_id' => get_current_blog_id(),
            ],
        ]);
        
        // Log the payment creation
        HD_Audit_Logger::log('payment_created', [
            'payment_id' => $payment->id,
            'amount' => $args['amount'],
            'currency' => $args['currency'],
            'appointment_id' => $args['appointment_id'],
        ]);
        
        // Store payment reference
        $this->store_payment_reference($payment->id, $args);
        
        return [
            'success' => true,
            'payment_id' => $payment->id,
            'checkout_url' => $payment->getCheckoutUrl(),
            'status' => $payment->status,
        ];
        
    } catch (\Mollie\Api\Exceptions\ApiException $e) {
        HD_Audit_Logger::log('payment_error', [
            'error' => $e->getMessage(),
            'args' => $args,
        ]);
        
        return new WP_Error('mollie_error', $e->getMessage());
    }
}
```

### Webhook Handling

```php
/**
 * Handle Mollie webhook callbacks
 * 
 * Mollie sends webhook notifications for payment status changes.
 * This method verifies the webhook and updates the local payment record.
 */
public function handle_webhook(): void {
    // Verify request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        wp_die('Invalid request method', 'Error', ['response' => 405]);
    }
    
    // Get payment ID from webhook
    $payment_id = isset($_POST['id']) ? sanitize_text_field($_POST['id']) : '';
    
    if (empty($payment_id)) {
        wp_die('Missing payment ID', 'Error', ['response' => 400]);
    }
    
    try {
        // Fetch payment from Mollie to verify status
        $payment = $this->mollie->payments->get($payment_id);
        
        // Get associated appointment from metadata
        $appointment_id = $payment->metadata->appointment_id ?? 0;
        $patient_id = $payment->metadata->patient_id ?? 0;
        
        // Update payment status in database
        $this->update_payment_status($payment_id, $payment->status, [
            'appointment_id' => $appointment_id,
            'patient_id' => $patient_id,
            'amount_value' => $payment->amount->value,
            'amount_currency' => $payment->amount->currency,
            'paid_at' => $payment->paidAt ?? null,
        ]);
        
        // Handle specific statuses
        switch ($payment->status) {
            case 'paid':
                $this->handle_successful_payment($payment, $appointment_id);
                break;
                
            case 'failed':
            case 'expired':
            case 'canceled':
                $this->handle_failed_payment($payment, $appointment_id);
                break;
        }
        
        // Log webhook processing
        HD_Audit_Logger::log('webhook_processed', [
            'payment_id' => $payment_id,
            'status' => $payment->status,
            'appointment_id' => $appointment_id,
        ]);
        
        // Return 200 OK to Mollie
        wp_die('OK', 'Success', ['response' => 200]);
        
    } catch (\Mollie\Api\Exceptions\ApiException $e) {
        HD_Audit_Logger::log('webhook_error', [
            'payment_id' => $payment_id,
            'error' => $e->getMessage(),
        ]);
        
        wp_die('Webhook processing failed', 'Error', ['response' => 500]);
    }
}

/**
 * Handle successful payment
 */
private function handle_successful_payment($payment, int $appointment_id): void {
    if ($appointment_id > 0) {
        // Update appointment payment status
        global $wpdb;
        $table = $wpdb->prefix . 'hd_appointments';
        
        $wpdb->update(
            $table,
            [
                'payment_status' => 'paid',
                'payment_id' => $payment->id,
                'paid_amount' => $payment->amount->value,
                'paid_at' => current_time('mysql'),
            ],
            ['id' => $appointment_id],
            ['%s', '%s', '%s', '%s'],
            ['%d']
        );
        
        // Send confirmation email
        $this->send_payment_confirmation($appointment_id, $payment);
    }
}
```

### Processing Refunds

```php
/**
 * Process a refund for a payment
 * 
 * @param string $payment_id Original Mollie payment ID.
 * @param float  $amount     Refund amount (null for full refund).
 * @param string $reason     Reason for refund.
 * @return array|WP_Error Refund result.
 */
public function process_refund(string $payment_id, ?float $amount = null, string $reason = ''): array|WP_Error {
    try {
        $payment = $this->mollie->payments->get($payment_id);
        
        // Verify payment is refundable
        if (!$payment->canBeRefunded()) {
            return new WP_Error('not_refundable', 'This payment cannot be refunded');
        }
        
        $refund_data = [
            'description' => $reason ?: 'Refund requested',
        ];
        
        // Partial refund if amount specified
        if ($amount !== null) {
            $refund_data['amount'] = [
                'currency' => $payment->amount->currency,
                'value' => number_format($amount, 2, '.', ''),
            ];
        }
        
        $refund = $payment->refund($refund_data);
        
        // Log refund
        HD_Audit_Logger::log('refund_processed', [
            'payment_id' => $payment_id,
            'refund_id' => $refund->id,
            'amount' => $amount ?? $payment->amount->value,
            'reason' => $reason,
        ]);
        
        return [
            'success' => true,
            'refund_id' => $refund->id,
            'amount' => $refund->amount->value,
            'status' => $refund->status,
        ];
        
    } catch (\Mollie\Api\Exceptions\ApiException $e) {
        return new WP_Error('refund_error', $e->getMessage());
    }
}
```

---

## Configuration

### wp-config.php Constants

```php
// Mollie API Keys (REQUIRED)
define('HD_MOLLIE_TEST_KEY', 'test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
define('HD_MOLLIE_LIVE_KEY', 'live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// Optional: Force mode
define('HD_MOLLIE_MODE', 'test'); // or 'live'
```

### Admin Settings

Access via: **EHR Settings → Payments**

| Setting | Description | Default |
|---------|-------------|---------|
| Mode | Test or Live | Test |
| Test API Key | For sandbox testing | (required) |
| Live API Key | For production | (required) |
| Default Currency | Payment currency | USD |
| Payment Methods | Enabled methods | Cards, PayPal |

---

## Webhook Configuration

### Mollie Dashboard Setup

1. Log into Mollie Dashboard
2. Go to **Developers → Webhooks**
3. Add webhook URL:
   ```
   https://your-domain.com/wp-admin/admin-ajax.php?action=hd_mollie_webhook
   ```
4. Enable webhook signing
5. Copy signing secret to wp-config.php:
   ```php
   define('HD_MOLLIE_WEBHOOK_SECRET', 'your_signing_secret');
   ```

### Webhook Security

```php
/**
 * Verify webhook signature
 * 
 * @param string $payload Raw request body.
 * @param string $signature Header signature.
 * @return bool True if valid.
 */
private function verify_webhook_signature(string $payload, string $signature): bool {
    if (!defined('HD_MOLLIE_WEBHOOK_SECRET')) {
        return true; // Skip verification if not configured
    }
    
    $expected = hash_hmac('sha256', $payload, HD_MOLLIE_WEBHOOK_SECRET);
    return hash_equals($expected, $signature);
}
```

---

## Database Schema

### Payments Table

```sql
CREATE TABLE {$wpdb->prefix}hd_payments (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    mollie_payment_id VARCHAR(50) NOT NULL,
    appointment_id BIGINT(20) UNSIGNED DEFAULT NULL,
    patient_id BIGINT(20) UNSIGNED DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at DATETIME DEFAULT NULL,
    refunded_at DATETIME DEFAULT NULL,
    refund_amount DECIMAL(10,2) DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY mollie_payment_id (mollie_payment_id),
    KEY appointment_id (appointment_id),
    KEY patient_id (patient_id),
    KEY status (status),
    FOREIGN KEY (appointment_id) REFERENCES {$wpdb->prefix}hd_appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES {$wpdb->prefix}hd_patients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Payment Flow

### Booking with Payment

```
[Patient Selects Appointment]
         ↓
[System Creates Payment via Mollie API]
         ↓
[Patient Redirected to Mollie Checkout]
         ↓
[Patient Completes Payment]
         ↓
[Mollie Sends Webhook]
         ↓
[System Verifies & Updates Status]
         ↓
[Confirmation Email Sent]
         ↓
[Patient Redirected to Confirmation Page]
```

### Frontend Integration

```php
// In book-appointment.php
<?php
$payment_required = $appointment_type['requires_payment'] ?? false;
$payment_amount = $appointment_type['fee'] ?? 0;

if ($payment_required && $payment_amount > 0):
?>
<div class="hd-payment-section">
    <h3><?php esc_html_e('Payment Required', 'helpingdoctors-ehr'); ?></h3>
    <p class="payment-amount">
        <?php printf(
            esc_html__('Consultation fee: %s', 'helpingdoctors-ehr'),
            hd_format_currency($payment_amount)
        ); ?>
    </p>
    <p class="payment-notice">
        <?php esc_html_e('You will be redirected to our secure payment provider (Mollie) to complete payment.', 'helpingdoctors-ehr'); ?>
    </p>
    <input type="hidden" name="payment_amount" value="<?php echo esc_attr($payment_amount); ?>">
</div>
<?php endif; ?>
```

---

## Security Considerations

### No Card Data on Server

Mollie handles all card data - our server never sees:
- Card numbers
- CVV codes
- Card expiry dates

This means:
- No PCI DSS certification required for our server
- Reduced liability and compliance burden
- Mollie is PCI DSS Level 1 certified

### Audit Logging

All payment events are logged:

```php
// Events logged:
// - payment_created
// - payment_status_changed
// - webhook_received
// - webhook_processed
// - refund_requested
// - refund_processed
// - payment_error
// - webhook_error
```

---

## Cost Analysis

### Mollie vs Stripe Comparison

| Metric | Mollie | Stripe | Savings |
|--------|--------|--------|---------|
| Card fee | 1.8% + €0.25 | 2.9% + €0.30 | 38% |
| PayPal | 2.5% | N/A | - |
| Monthly fee | €0 | €0 | - |
| Setup fee | €0 | €0 | - |

### Example Savings

For 1,000 transactions at €50 average:
- **Stripe:** €1,750 in fees
- **Mollie:** €1,100 in fees
- **Monthly Savings:** €650

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid API key" | Wrong key format | Check key starts with `test_` or `live_` |
| Webhook not received | Firewall blocking | Whitelist Mollie IP ranges |
| Payment stuck pending | Webhook failed | Check webhook URL, retry from Mollie dashboard |
| Currency mismatch | Wrong default | Update HD settings |

### Debug Mode

```php
// Enable in wp-config.php
define('HD_MOLLIE_DEBUG', true);

// Logs all API calls to debug.log
```

---

## Testing Checklist

- [ ] Test payment creation in sandbox
- [ ] Test successful payment flow
- [ ] Test failed payment handling
- [ ] Test webhook delivery
- [ ] Test refund processing
- [ ] Test currency conversion
- [ ] Test mobile payment flow
- [ ] Verify audit logs created
- [ ] Check email confirmations sent

---

## Related Documentation

- [ADR-002: Mollie Payment Gateway Selection](../decisions/ADR-002-mollie-payment-gateway.md)
- [Mollie API Documentation](https://docs.mollie.com/)
- [Mollie PHP SDK](https://github.com/mollie/mollie-api-php)
