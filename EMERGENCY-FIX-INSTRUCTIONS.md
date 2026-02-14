# 🚨 EMERGENCY FIX - Site is Down

Your site is down due to database corruption. Follow these steps **in order**:

---

## STEP 1: Run SQL Fix (Database) ⚡ CRITICAL

### Option A: Using phpMyAdmin (Recommended)

1. **Log into your hosting control panel** (cPanel/Hostinger panel)
2. **Open phpMyAdmin**
3. **Select your WordPress database** (usually starts with your username)
4. **Click the "SQL" tab** at the top
5. **Copy the entire contents** of `FIX-DATABASE-DIRECTLY.sql`
6. **Paste into the SQL query box**
7. **Click "Go"** to execute
8. **Check the results** - should see "FIX COMPLETE"

### Option B: Using MySQL Command Line

```bash
mysql -u your_username -p your_database_name < FIX-DATABASE-DIRECTLY.sql
```

### What This SQL Script Does:
- ✅ Deletes corrupted `um_roles` option (causing Fatal Error #1)
- ✅ Adds missing `schedule` column (causing Database Error)
- ✅ Clears WordPress caches
- ✅ Verifies fixes were applied

---

## STEP 2: Upload Fixed PHP Files via SFTP

**Upload these 4 files (overwrite existing):**

```
wp-content/plugins/helpingdoctors-ehr-pro/includes/class-hd-permissions.php
wp-content/plugins/helpingdoctors-ehr-pro/includes/class-hd-comprehensive-roles.php
wp-content/plugins/helpingdoctors-ehr-pro/Helping-Doctors-EHR-Pro.php
wp-content/plugins/helpingdoctors-ehr-pro/includes/class-hd-roles.php
```

**Critical:** `class-hd-permissions.php` fixes the "scalar value as array" fatal error

---

## STEP 3: Try to Access Your Site

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Visit your site** - It should load now!
3. **If still errors**, check debug.log for new errors

---

## STEP 4: Run Verification (After Site Loads)

Once your site loads:

1. **Upload** `verify-all-fixes.php` to public_html
2. **Visit** `https://helpingdoctors.org/verify-all-fixes.php`
3. **Confirm** all tests pass
4. **Delete** the verification script

---

## STEP 5: Cleanup

Delete these files via SFTP:
- `fix-database-and-roles-complete.php` (can't use - site was down)
- `verify-all-fixes.php`
- All other `fix-*.php` scripts
- `FIX-DATABASE-DIRECTLY.sql`
- `EMERGENCY-FIX-INSTRUCTIONS.md`
- `wp-content/debug.log`

---

## 🔍 Why This Order?

1. **Database first** → Removes corruption preventing site from loading
2. **PHP files second** → Prevents future corruption
3. **Verification third** → Confirms everything works
4. **Cleanup last** → Removes temporary files

---

## ⚠️ If Site Still Won't Load

If after Step 1 & 2 the site still shows errors:

1. **Check new errors** in debug.log
2. **Try deactivating** EHR plugin via database:
   ```sql
   UPDATE wp_options
   SET option_value = ''
   WHERE option_name = 'active_plugins';
   ```
3. **Report back** with new error messages

---

## 📋 Quick Checklist

- [ ] Run SQL script in phpMyAdmin
- [ ] Verify SQL ran successfully (see "FIX COMPLETE")
- [ ] Upload 4 PHP files via SFTP
- [ ] Clear browser cache
- [ ] Try to access site
- [ ] If loads: Run verification script
- [ ] Delete all temporary files

---

**Start with the SQL script - this should get your site back online!**
