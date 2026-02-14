# Security Checklist - HelpingDoctors EHR Pro
## Pre-Deployment Security Validation

**Use this checklist before every deployment to production**

---

## 🔒 CRITICAL SECURITY CHECKS

### Authentication & Authorization
- [ ] All AJAX handlers have `check_ajax_referer()` or `wp_verify_nonce()`
- [ ] All AJAX handlers check `current_user_can()` for appropriate capability
- [ ] All sensitive operations verify user has access to specific patient
- [ ] No `wp_ajax_nopriv` handlers expose sensitive data
- [ ] Password requirements enforced (8+ chars, mixed case, numbers)
- [ ] Failed login attempts are rate-limited
- [ ] Session timeout configured appropriately (30 minutes)

### Input Validation & Sanitization
- [ ] All `$_POST` access uses `?? default` pattern or `isset()` check
- [ ] All user input is sanitized with appropriate function:
  - Text: `sanitize_text_field()`
  - Email: `sanitize_email()`
  - URLs: `esc_url_raw()`
  - HTML: `wp_kses_post()`
- [ ] File uploads validate:
  - File extension against whitelist
  - MIME type verification
  - File size limits enforced
  - Filename sanitization
- [ ] Numeric IDs use `absint()` or `intval()`
- [ ] Date inputs validated with `DateTime` class
- [ ] JSON inputs validated with `json_decode()` + error checking

### Output Escaping
- [ ] All database output uses appropriate escaping:
  - HTML: `esc_html()`
  - Attributes: `esc_attr()`
  - URLs: `esc_url()`
  - JavaScript: `esc_js()`
- [ ] No raw `echo` of database values
- [ ] Admin templates escape ALL variables
- [ ] JSON responses use `wp_send_json()` (auto-escaping)

### SQL Injection Prevention
- [ ] ALL database queries use `$wpdb->prepare()`
- [ ] No string concatenation in SQL queries
- [ ] Table/column names validated against whitelist if dynamic
- [ ] `IN` clauses use proper array handling
- [ ] Backup/restore functions use proper escaping

### File Security
- [ ] Uploaded files stored outside webroot OR with .htaccess protection
- [ ] Medical documents require authentication to access
- [ ] File paths validated against directory traversal
- [ ] Temporary files cleaned up after use
- [ ] File permissions: 644 for files, 755 for directories
- [ ] Sensitive files have `ABSPATH` check at top

### Encryption & Data Protection
- [ ] PHI data encrypted at rest (email, phone, address, medical notes)
- [ ] Encryption keys >= 32 characters
- [ ] Encryption keys stored in wp-config.php, NOT database
- [ ] SSL/TLS enforced for all admin pages
- [ ] Passwords hashed with `wp_hash_password()`
- [ ] API keys never committed to version control

---

## 🏥 HIPAA COMPLIANCE CHECKS

### Audit Logging
- [ ] ALL PHI access is logged (view, create, update, delete)
- [ ] Audit logs include: user ID, action, timestamp, IP address, patient ID
- [ ] Failed access attempts logged
- [ ] Audit logs retained for 7 years minimum
- [ ] Audit logs cannot be modified by users
- [ ] Regular audit log review process in place

### Access Controls
- [ ] Users can only access patients assigned to their clinic(s)
- [ ] Role-based permissions enforced throughout
- [ ] "Break glass" emergency access logged
- [ ] Inactive user accounts disabled after 90 days
- [ ] User permission changes logged

### Data Integrity
- [ ] Database transactions used for multi-step operations
- [ ] Foreign key constraints validate data relationships
- [ ] Soft deletes used for all medical records
- [ ] Backup and restore tested monthly
- [ ] Data validation prevents corruption

---

## 🇪🇺 GDPR COMPLIANCE CHECKS

### Data Rights
- [ ] Patients can request data export
- [ ] Export includes ALL patient data in machine-readable format
- [ ] Patients can request data deletion
- [ ] Deletion anonymizes data, doesn't hard-delete (medical record retention)
- [ ] Consent tracking implemented
- [ ] Consent can be withdrawn

### Data Minimization
- [ ] Only necessary PHI collected
- [ ] Retention policies configured (7 years for medical records)
- [ ] Old audit logs anonymized (remove IP, user details after 90 days)
- [ ] Unnecessary data regularly purged

### Data Breach
- [ ] Breach detection mechanisms in place
- [ ] Breach notification process documented
- [ ] Data breach incident log table exists
- [ ] Backup recovery tested

---

## ⚡ PERFORMANCE & RELIABILITY

### Database Performance
- [ ] Indexes on all foreign keys
- [ ] Indexes on frequently queried columns (created_at, patient_id, status)
- [ ] No `SELECT *` in production code
- [ ] Large result sets use pagination
- [ ] No queries inside loops (N+1 problem)
- [ ] Query caching implemented where appropriate

### Error Handling
- [ ] All database operations check for errors
- [ ] `is_wp_error()` checked after WordPress functions
- [ ] Exceptions caught in try-catch blocks
- [ ] Errors logged to audit system, not shown to users
- [ ] User-friendly error messages (no stack traces)
- [ ] Critical errors trigger admin notifications

### Rate Limiting
- [ ] AJAX endpoints rate-limited (60 requests/minute default)
- [ ] Login attempts rate-limited (5 failures = 15 minute lockout)
- [ ] Patient search limited to prevent enumeration
- [ ] API endpoints (if any) rate-limited

---

## 🧪 TESTING REQUIREMENTS

### Security Testing
- [ ] SQL injection tests passed (try `' OR '1'='1`)
- [ ] XSS tests passed (try `<script>alert('xss')</script>`)
- [ ] CSRF tests passed (try forged requests without nonce)
- [ ] File upload tests passed (try PHP file upload)
- [ ] Directory traversal tests passed (try `../../../etc/passwd`)
- [ ] Capability bypass tests passed (try action as wrong user role)

### Functional Testing
- [ ] Patient registration flow works
- [ ] Appointment booking works (no double-booking)
- [ ] Prescription creation works (drug interaction check)
- [ ] Document upload/download works
- [ ] Search functionality works
- [ ] Audit log captures all actions

### Load Testing
- [ ] 100 concurrent users supported
- [ ] Page load time < 2 seconds
- [ ] Database query time < 100ms
- [ ] No memory leaks after 1000 requests
- [ ] File upload handles 10MB files

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Code Review
- [ ] All new code reviewed by 2+ developers
- [ ] Security-focused code review completed
- [ ] No debug code left in (var_dump, console.log, etc.)
- [ ] No TODO comments for critical functionality
- [ ] Code follows WordPress coding standards

### Configuration
- [ ] `WP_DEBUG` set to `false` in production
- [ ] `WP_DEBUG_LOG` set to `true` (log to file, not display)
- [ ] `WP_DEBUG_DISPLAY` set to `false`
- [ ] `DISALLOW_FILE_EDIT` set to `true`
- [ ] `FORCE_SSL_ADMIN` set to `true`
- [ ] Database backup automated (daily minimum)
- [ ] Error log monitoring configured

### Documentation
- [ ] Security policy updated
- [ ] Privacy policy updated
- [ ] User permissions documented
- [ ] Incident response plan documented
- [ ] Backup/restore procedures documented

### Compliance
- [ ] HIPAA compliance verified
- [ ] GDPR compliance verified
- [ ] Local regulations checked (Gaza, UK, etc.)
- [ ] Data processing agreement signed with hosting provider
- [ ] Business associate agreement in place (if using third-party services)

---

## 🚨 INCIDENT RESPONSE

### If Security Issue Found:
1. **DO NOT PANIC** - Document everything
2. **Assess severity** - Critical/High/Medium/Low
3. **Contain** - Disable affected functionality if needed
4. **Investigate** - Check audit logs, identify scope
5. **Fix** - Implement patch, test thoroughly
6. **Deploy** - Emergency deployment if critical
7. **Notify** - Alert affected users if data breach
8. **Document** - Incident report, lessons learned
9. **Review** - Update security procedures

### Emergency Contacts
- **Developer Team Lead:** [Contact info]
- **Security Officer:** [Contact info]
- **HIPAA Compliance Officer:** [Contact info]
- **Hosting Provider:** [Contact info]
- **Legal Counsel:** [Contact info]

---

## 📊 MONITORING

### Daily Checks
- [ ] Review audit log for suspicious activity
- [ ] Check error log for PHP errors
- [ ] Monitor failed login attempts
- [ ] Verify backups completed successfully

### Weekly Checks
- [ ] Review user access permissions
- [ ] Check for WordPress/plugin updates
- [ ] Verify SSL certificate valid
- [ ] Test backup restoration

### Monthly Checks
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Compliance review
- [ ] User access audit (remove inactive users)
- [ ] Update security documentation

---

## ✅ SIGN-OFF

Before deploying to production, the following must sign off:

- [ ] **Lead Developer:** _________________ Date: _________
- [ ] **Security Officer:** _________________ Date: _________
- [ ] **HIPAA Compliance:** _________________ Date: _________
- [ ] **QA Tester:** _________________ Date: _________

**Deployment Approved:** YES / NO

**Date Deployed:** _________________

**Version:** _________________

---

## 🔄 VERSION HISTORY

| Version | Date | Changes | Security Impact |
|---------|------|---------|----------------|
| 1.0.0 | 2025-12-09 | Initial release | Medium risk - known issues documented |
| 1.0.1 | TBD | Security fixes #1-5 | High impact - critical fixes |

---

**REMEMBER:** Security is not a one-time task. Regular reviews, updates, and monitoring are essential for protecting patient data.

**When in doubt, ask:** Is this action logging all PHI access? Would I want my medical data handled this way?
