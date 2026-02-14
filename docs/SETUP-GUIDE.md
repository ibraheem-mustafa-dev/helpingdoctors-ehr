# HelpingDoctors EHR Pro - Setup Guide
## First-Time Installation for Rivers of Mercy

**IMPORTANT:** The plugin will NOT activate without these configuration steps completed first.

---

## STEP 1: Add Required Constants to wp-config.php

### Location
**File:** `C:\Users\Bean\Local Sites\helpingdoctors.org\public_html\wp-config.php`

Or if using snippets:
**File:** `C:\Users\Bean\Local Sites\helpingdoctors.org\public_html\wp-config-snippets\required-constants.php`

### Constants to Add

Add these lines **before** the line that says `/* That's all, stop editing! */`:

```php
// =====================================================
// HELPINGDOCTORS EHR PRO CONFIGURATION
// =====================================================

// 1. ENCRYPTION KEY (Generate this - see instructions below)
define('HD_ENCRYPTION_KEY', 'PASTE_YOUR_GENERATED_KEY_HERE');

// 2. CLOUDFLARE TURNSTILE (Get free keys at https://dash.cloudflare.com/)
define('HD_TURNSTILE_SITE_KEY', 'YOUR_CLOUDFLARE_SITE_KEY_HERE');
define('HD_TURNSTILE_SECRET_KEY', 'YOUR_CLOUDFLARE_SECRET_KEY_HERE');

// 3. OFFLINE MODE (Set to true for Gaza deployment)
define('HD_OFFLINE_MODE', true);

// 4. CLOUDFLARE AI (Optional - for analytics chatbot and premium OCR)
// Uncomment these lines once you have Cloudflare AI keys:
// define('HD_CLOUDFLARE_AI_ACCOUNT_ID', 'your_account_id');
// define('HD_CLOUDFLARE_AI_API_TOKEN', 'your_api_token');
```

---

## STEP 2: Generate Encryption Key

### Method 1: Using PHP CLI (Recommended)

Open Command Prompt / PowerShell and run:

```bash
cd "C:\Users\Bean\Local Sites\helpingdoctors.org\public_html"
php -r "echo bin2hex(random_bytes(16));"
```

This will output a 32-character hexadecimal string like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

Copy this string and paste it as the value for `HD_ENCRYPTION_KEY`.

### Method 2: Using Online Generator

Visit: https://www.random.org/strings/

Settings:
- Number of strings: 1
- Length: 32
- Characters: Hex (0-9, a-f)
- Click "Get Strings"

Copy the generated string and use it for `HD_ENCRYPTION_KEY`.

**⚠️ SECURITY WARNING:**
- Store this key securely - it encrypts all patient data!
- Never commit it to git
- Never share it publicly
- Losing this key means losing access to encrypted patient data

---

## STEP 3: Get Cloudflare Turnstile Keys (FREE)

### What is Turnstile?
Cloudflare Turnstile is a free CAPTCHA alternative that protects your forms from bots.

### Steps:

1. **Go to:** https://dash.cloudflare.com/
2. **Sign in** or create a free account
3. **Navigate to:** Turnstile (in the left sidebar)
4. **Click:** "Add Site"
5. **Fill in:**
   - Site name: `HelpingDoctors EHR - Rivers of Mercy`
   - Domain: `helpingdoctors.org`
   - Widget mode: `Managed`
6. **Click:** "Create"
7. **Copy the keys:**
   - Site Key → paste into `HD_TURNSTILE_SITE_KEY`
   - Secret Key → paste into `HD_TURNSTILE_SECRET_KEY`

---

## STEP 4: Get Cloudflare AI Keys (OPTIONAL)

**Skip this step** if you want to use only FREE features. You can add these later.

### What Cloudflare AI Enables:
- Analytics chatbot (ask questions like "How many patients today?")
- Premium OCR for document scanning (better accuracy than free Tesseract.js)

### Cost:
- $5-20/month for chatbot queries
- $0.01/page for OCR (or use FREE Tesseract.js)

### Steps:

1. **Go to:** https://dash.cloudflare.com/
2. **Navigate to:** Workers & Pages → AI
3. **Click:** "Get Started"
4. **Create API Token:**
   - Click your profile → API Tokens
   - Create Token → Use template "Edit Cloudflare Workers"
   - Copy the token
5. **Get Account ID:**
   - Go to any domain in Cloudflare
   - Scroll down on the overview page
   - Copy your Account ID
6. **Add to wp-config.php:**
   ```php
   define('HD_CLOUDFLARE_AI_ACCOUNT_ID', 'your_account_id_here');
   define('HD_CLOUDFLARE_AI_API_TOKEN', 'your_api_token_here');
   ```

---

## STEP 5: Install Required WordPress Plugins

### REQUIRED (Plugin won't work without these):

1. **Advanced Custom Fields Pro**
   - You need a license
   - Download from: https://www.advancedcustomfields.com/my-account/
   - Install & activate network-wide (if multisite) or on Rivers of Mercy subsite

### RECOMMENDED (Important for full functionality):

2. **Ultimate Member** (FREE)
   - Handles user registration, profiles, roles
   - Install from WordPress.org or wp-admin → Plugins → Add New

3. **Solid Security** (FREE)
   - Provides 2FA (two-factor authentication)
   - Install from WordPress.org

4. **LiteSpeed Cache** (FREE)
   - Performance optimization
   - Install from WordPress.org

5. **UpdraftPlus** (FREE)
   - Automated backups
   - Install from WordPress.org

---

## STEP 6: Activate the Plugin

### Steps:

1. **In WordPress Admin:**
   - Go to: Network Admin → Sites (if multisite)
   - Click "Dashboard" for Rivers of Mercy site (Blog ID 3)

2. **Alternatively, visit directly:**
   - URL: `http://helpingdoctors.org/wp-admin/network/site-info.php?id=3`
   - Click "Visit" to go to Rivers of Mercy admin dashboard

3. **Activate Plugin:**
   - Go to: Plugins → Installed Plugins
   - Find "HelpingDoctors EHR Pro"
   - Click "Activate"

4. **Watch for errors:**
   - If you see errors about missing constants → check wp-config.php
   - If you see errors about missing ACF Pro → install ACF Pro first
   - If activation succeeds → you'll see a success message

---

## STEP 7: Verify Database Tables Created

### Check in phpMyAdmin:

1. **Open phpMyAdmin:**
   - Local by Flywheel: Site → Database → Open phpMyAdmin

2. **Look for these tables** (should all start with `wp_3_hd_`):
   - `wp_3_hd_clinics`
   - `wp_3_hd_patients`
   - `wp_3_hd_appointments`
   - `wp_3_hd_encounters`
   - `wp_3_hd_prescriptions`
   - `wp_3_hd_payments`
   - `wp_3_hd_user_clinics`
   - `wp_3_hd_audit_logs`
   - `wp_3_hd_messages`
   - `wp_3_hd_documents`
   - `wp_3_hd_laboratory`
   - `wp_3_hd_reminders`
   - ... and more (approx. 20+ tables total)

3. **If tables are missing:**
   - Deactivate the plugin
   - Check wp-config.php constants are correct
   - Re-activate the plugin
   - Check PHP error log for details

---

## STEP 8: Create Required Pages

### In Rivers of Mercy Dashboard:

Go to: Pages → Add New

Create these 6 pages with the specified templates:

| Page Title | Template | Shortcode/Content |
|------------|----------|-------------------|
| Medical Dashboard | Medical Dashboard | (Template handles it) |
| Patient Portal | Patient Portal | (Template handles it) |
| Book Appointment | Book Appointment | `[hd_booking_widget]` |
| Medical Encounter | Medical Encounter | (Template handles it) |
| Patient Registration | Patient Registration | (ACF form) |
| Staff Login | Default | Add Ultimate Member login shortcode |

### Steps for each page:

1. Click "Add New"
2. Enter page title
3. On the right sidebar, under "Page Attributes" → "Template", select the template
4. If shortcode needed, add it in the content area
5. Click "Publish"

---

## STEP 9: Configure Email SMTP (For Reminders)

### System Email (for automated reminders):

You'll provide SMTP credentials for `system@helpingdoctors.org` during Phase 3 implementation.

**What you'll need:**
- SMTP host (e.g., `mail.yourdomain.com`)
- SMTP port (usually 587 or 465)
- SMTP username (`system@helpingdoctors.org`)
- SMTP password

### Rivers of Mercy Email (for staff correspondence):

They'll provide their own SMTP credentials for `info@rivers-of-mercy.org` in the EHR admin settings (after Phase 3 is built).

---

## STEP 10: Get Twilio Credentials (For SMS Reminders)

### What You Need:

You'll need these during Phase 3 implementation:

1. **Twilio Account SID**
2. **Twilio Auth Token**
3. **Twilio Phone Number** (for sending SMS)

### Steps:

1. **Sign up at:** https://www.twilio.com/try-twilio
2. **Get $15 free credit** (enough for ~1,875 SMS messages for testing)
3. **In Twilio Console:**
   - Account SID: Copy from dashboard
   - Auth Token: Click "Show" and copy
4. **Buy a phone number:**
   - Phone Numbers → Buy a Number
   - Select your country
   - Choose a number with SMS capability
   - Cost: ~$1.15/month

**Save these credentials** - I'll need them when implementing the SMS reminder system.

---

## TROUBLESHOOTING

### Plugin won't activate:

**Error: "Requires specific plugins to be activated"**
- Install ACF Pro first
- Activate ACF Pro before HelpingDoctors EHR Pro

**Error: "Requires configuration constants in wp-config.php"**
- Check you added all constants to wp-config.php
- Make sure constants are BEFORE the `/* That's all */` line
- Check for typos in constant names

**Error: "Fatal error..."**
- Check PHP error log: `C:\Users\Bean\Local Sites\helpingdoctors.org\logs\php\error.log`
- Common issues:
  - PHP version too old (need 7.4+)
  - Missing required PHP extensions
  - Syntax error in wp-config.php

### Database tables not created:

1. Deactivate plugin
2. Delete option `hd_ehr_db_version` from wp_options table
3. Re-activate plugin
4. Check phpMyAdmin again

### Can't find Rivers of Mercy subsite:

1. Go to: Network Admin → Sites
2. Look for site with Blog ID = 3
3. If it doesn't exist, create it:
   - Sites → Add New
   - Site Address: `riversofmercy`
   - Site Title: `Rivers of Mercy`
   - Admin Email: your email

---

## NEXT STEPS AFTER SETUP

Once all constants are added and plugin activates successfully:

1. ✅ **Verify tables exist** in phpMyAdmin
2. ✅ **Create the 6 pages** as listed above
3. ✅ **Test basic access**: Visit Medical Dashboard page
4. ⏸️ **Wait for Phase 2-3 features** (I'm building these)
5. ⏸️ **Provide Twilio credentials** when Phase 3 is ready
6. ⏸️ **Test end-to-end** patient registration and appointment booking

---

## SUPPORT

If you encounter issues:

1. **Check this guide first**
2. **Check PHP error log**: `C:\Users\Bean\Local Sites\helpingdoctors.org\logs\php\error.log`
3. **Check browser console** for JavaScript errors
4. **Share error messages** with me for troubleshooting

---

## SECURITY CHECKLIST

Before going live (after all development is complete):

- [ ] `HD_ENCRYPTION_KEY` is stored securely (not in git)
- [ ] Cloudflare Turnstile is configured (prevents spam)
- [ ] 2FA is enabled (via Solid Security plugin)
- [ ] HTTPS/SSL is active (required for HIPAA)
- [ ] Backups are configured (UpdraftPlus)
- [ ] Twilio account has spending limits set (prevent unexpected charges)
- [ ] Test disaster recovery (restore from backup)

---

**Ready to continue?** Let me know once you've completed Steps 1-8, and I'll proceed with building the new features!
