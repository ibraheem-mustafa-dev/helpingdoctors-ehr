# Create All Missing Database Tables

## Current Status
- Plugin is activated on Blog ID 3 (Rivers of Mercy)
- Only 4 core tables were created manually:
  - wp_3_hd_clinics
  - wp_3_hd_patients
  - wp_3_hd_appointments
  - wp_3_hd_encounters

## Missing Tables (will be created automatically)
The plugin's activation hook should create approximately 50+ additional tables:

### Core Tables (from HD_Database_Setup)
- wp_3_hd_prescriptions
- wp_3_hd_payments
- wp_3_hd_user_clinics
- wp_3_hd_audit_logs
- wp_3_hd_emergency_transfers
- wp_3_hd_analytics_events
- wp_3_hd_security_events
- wp_3_hd_security_sessions
- wp_3_hd_threat_patterns

### Messaging Tables (from HD_Messaging_Tables)
- wp_3_hd_secure_messages
- wp_3_hd_message_threads
- wp_3_hd_message_attachments
- wp_3_hd_message_receipts

### Documents Tables (from HD_Documents_Tables)
- wp_3_hd_documents
- wp_3_hd_document_access_log
- wp_3_hd_document_versions
- wp_3_hd_document_sharing
- wp_3_hd_document_categories

### Signature Tables (from HD_Signature_Tables)
- wp_3_hd_digital_signatures
- wp_3_hd_public_keys
- wp_3_hd_signature_verification_log
- wp_3_hd_certificate_authority
- wp_3_hd_certificate_revocation_list

### GDPR Tables (from HD_GDPR_Tables)
- wp_3_hd_gdpr_requests
- wp_3_hd_gdpr_exports
- wp_3_hd_gdpr_deletions
- wp_3_hd_gdpr_consents
- wp_3_hd_data_retention_policies
- wp_3_hd_data_processing_activities
- wp_3_hd_data_breach_incidents

### Reminder Tables (from HD_Reminder_Tables)
- wp_3_hd_appointment_reminders
- wp_3_hd_notification_templates
- wp_3_hd_notification_preferences
- wp_3_hd_notification_delivery_log
- wp_3_hd_notification_providers

### Refill Tables (from HD_Refill_Tables)
- wp_3_hd_prescription_refills
- wp_3_hd_prescription_refill_reminders
- wp_3_hd_pharmacies
- wp_3_hd_patient_pharmacy_preferences
- wp_3_hd_refill_workflow_rules
- wp_3_hd_refill_audit_log

### Clinical Alerts Tables (from HD_Alerts_Tables)
- wp_3_hd_clinical_alerts
- wp_3_hd_clinical_rules
- wp_3_hd_drug_interactions_db
- wp_3_hd_clinical_guidelines
- wp_3_hd_lab_reference_ranges
- wp_3_hd_alert_suppressions

### Laboratory Tables (from HD_Laboratory_Tables)
- wp_3_hd_lab_orders
- wp_3_hd_lab_test_items
- wp_3_hd_lab_results
- wp_3_hd_lab_test_catalog
- wp_3_hd_lab_test_panels
- wp_3_hd_lab_panel_tests
- wp_3_hd_lab_quality_control
- wp_3_hd_lab_order_templates

## How to Create All Tables

### Option 1: Deactivate & Reactivate (RECOMMENDED)

1. Switch to Rivers of Mercy subsite:
   ```
   URL: https://helpingdoctors.org/riversofmercy/wp-admin/
   ```

2. Go to **Plugins** → Find "HelpingDoctors EHR Pro"

3. Click **Deactivate** (this won't delete your existing 4 tables)

4. Click **Activate** again

5. The plugin will detect that tables are missing/incomplete and create all of them

### Option 2: Use WP-CLI (if available)

```bash
# Switch to Rivers of Mercy site
wp --url=https://helpingdoctors.org/riversofmercy plugin deactivate helpingdoctors-ehr-pro

# Reactivate (triggers table creation)
wp --url=https://helpingdoctors.org/riversofmercy plugin activate helpingdoctors-ehr-pro

# Verify tables were created
wp db query "SHOW TABLES LIKE 'wp_3_hd_%'"
```

### Option 3: Network Activate (NOT RECOMMENDED)

Don't network-activate - this would activate the plugin on ALL subsites including the main site, which you've explicitly said you don't want.

## Important Note About wp_3_hd_user_permission_overrides

This table is currently missing from the plugin's database setup code. I found the table being referenced in:
- `includes/security/class-hd-user-permission-overrides.php` (line 614)

But there's NO `create_user_permission_overrides_table()` method in `class-hd-database-setup.php`.

After reactivation, if you still see the error about this table, I'll need to add the table creation method to the plugin code.

## Verify All Tables Were Created

After reactivation, run this in phpMyAdmin:

```sql
-- Check how many hd_ tables exist
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'u945238940_oFkSr'
AND table_name LIKE 'wp_3_hd_%';

-- List all hd_ tables
SHOW TABLES LIKE 'wp_3_hd_%';
```

You should see **50+ tables** instead of just 4.

## Next Steps

1. Try Option 1 (deactivate/reactivate)
2. Check the debug.log for any errors
3. Let me know if any tables are still missing
4. I'll add the missing `wp_3_hd_user_permission_overrides` table if needed
