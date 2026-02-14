# SFTP Workflow Guide

**Server:** Hostinger
**Host:** 141.136.39.73
**Port:** 65002
**Protocol:** SFTP (SSH File Transfer Protocol)

---

## VS Code Setup

### 1. Install Extension
Search for "SFTP" by Natizyskunk in VS Code extensions.

### 2. Create Configuration
Create `.vscode/sftp.json`:

```json
{
    "name": "HelpingDoctors Production",
    "host": "141.136.39.73",
    "protocol": "sftp",
    "port": 65002,
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD",
    "remotePath": "/home/u123456789/domains/helpingdoctors.org/public_html",
    "uploadOnSave": false,
    "syncOption": {
        "delete": false
    },
    "ignore": [
        ".vscode",
        ".git",
        ".gitignore",
        "node_modules",
        ".DS_Store",
        "*.log"
    ]
}
```

**Note:** Replace username/password with actual credentials. Keep `uploadOnSave: false` for manual control.

---

## Upload Workflow

### Single File
1. Right-click file in VS Code Explorer
2. Select "Upload File"
3. Verify in SFTP output panel
4. Confirm to Claude: "uploaded"

### Multiple Files
1. Right-click folder
2. Select "Upload Folder"
3. Wait for completion
4. Confirm to Claude: "all uploaded"

### Sync (Careful!)
1. Right-click folder
2. Select "Sync Remote → Local" (download changes)
3. Or "Sync Local → Remote" (upload changes)

---

## FileZilla Alternative

### Connection Settings
```
Host: sftp://141.136.39.73
Port: 65002
Protocol: SFTP - SSH File Transfer Protocol
Logon Type: Normal
User: YOUR_USERNAME
Password: YOUR_PASSWORD
```

### Quick Connect
1. Open FileZilla
2. Enter connection details in quick connect bar
3. Click "Quickconnect"

---

## Directory Structure on Server

```
/home/u123456789/domains/helpingdoctors.org/
├── public_html/              ← Web root
│   ├── wp-admin/
│   ├── wp-content/
│   │   ├── themes/
│   │   ├── plugins/
│   │   └── uploads/
│   ├── wp-includes/
│   └── wp-config.php
├── logs/                     ← Error logs
└── ssl/                      ← SSL certificates
```

---

## Common Paths

| Purpose | Remote Path |
|---------|-------------|
| Theme | `/public_html/wp-content/themes/theme/` |
| Plugin | `/public_html/wp-content/plugins/helping-doctors-ehr/` |
| Uploads | `/public_html/wp-content/uploads/sites/3/` |
| MU Plugins | `/public_html/wp-content/mu-plugins/` |
| wp-config | `/public_html/wp-config.php` |

---

## ADHD-Friendly Workflow

### After EVERY File Modification

1. **Claude states:**
   ```
   Modified: public_html/wp-content/themes/theme/functions.php
   Changed: Added patient search handler (lines 245-289)
   
   Ready for SFTP upload.
   ```

2. **You upload via VS Code:**
   - Right-click → Upload File

3. **You confirm:**
   ```
   uploaded
   ```

4. **Claude continues** to next task

### Key Points
- One file at a time
- Full path provided for easy navigation
- Wait for confirmation before continuing
- No batching multiple files

---

## Troubleshooting

### Connection Failed
- Check Hostinger is not blocking your IP
- Verify port 65002 (not standard 22)
- Check username/password

### Permission Denied
- Check file permissions on server
- Verify user has write access
- Some directories may be restricted

### File Not Appearing
- Clear server cache (LiteSpeed)
- Check correct remote path
- Verify file actually uploaded (check SFTP log)

---

## Security Notes

- Never commit `sftp.json` with credentials
- Add to `.gitignore`
- Use SSH keys instead of password if possible
- Change password if compromised
