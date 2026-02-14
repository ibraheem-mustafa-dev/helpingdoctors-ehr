# SFTP Deployment Workflow

**Project:** HelpingDoctors EHR Pro
**Critical for:** ADHD-friendly workflow, preventing lost work

---

## Core Principle

User deploys via **SFTP to Hostinger production**. NOT Local WP. After EVERY file modification, list files and wait for upload confirmation.

---

## Server Details

```
Host: 141.136.39.73
Port: 65002
Protocol: SFTP
Root: /home/u123456789/domains/helpingdoctors.org/public_html/
```

---

## The Workflow

### After EVERY File Change:

1. **List the file** with full path:
   ```
   Modified: public_html/wp-content/themes/theme/functions.php
   ```

2. **State what changed**:
   ```
   Added: Patient search AJAX handler (lines 245-289)
   ```

3. **Wait for confirmation**:
   ```
   Ready for SFTP upload. Please confirm when uploaded.
   ```

4. **Do NOT proceed** until user says "uploaded" or equivalent

---

## ❌ Wrong Workflow

```
I've updated these files:
- functions.php
- patient-search.js
- style.css

Let me now move on to the next feature...
```

Problems:
- No full paths for SFTP navigation
- No description of changes
- Didn't wait for upload confirmation
- Batched multiple files (hard to track)

---

## ✅ Correct Workflow

```
Modified: public_html/wp-content/themes/theme/functions.php
Changed: Added patient_search_ajax() handler (lines 245-289)

Ready for SFTP upload.
```

[User: "uploaded"]

```
Modified: public_html/wp-content/themes/theme/assets/js/patient-search.js
Changed: Created new file for patient search functionality

Ready for SFTP upload.
```

[User: "done"]

```
Modified: public_html/wp-content/themes/theme/assets/css/patient-search.css
Changed: Created new file for patient search styling

Ready for SFTP upload.
```

---

## ADHD Considerations

This workflow exists because:
1. Batched file lists are overwhelming
2. Lost track of what's uploaded vs pending
3. Need clear checkpoints
4. One thing at a time reduces cognitive load

**ALWAYS:**
- One file at a time
- Full path for easy SFTP navigation
- Clear description of change
- Explicit pause for confirmation

---

## Common File Locations

| Type | Path |
|------|------|
| Theme | `public_html/wp-content/themes/theme/` |
| Plugin | `public_html/wp-content/plugins/helping-doctors-ehr/` |
| Uploads | `public_html/wp-content/uploads/sites/3/` |
| MU Plugins | `public_html/wp-content/mu-plugins/` |

---

## Checklist

- [ ] Listed file with FULL path?
- [ ] Described what changed?
- [ ] Waiting for upload confirmation?
- [ ] NOT batching multiple files?
- [ ] NOT proceeding without confirmation?
