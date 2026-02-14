# Accessibility Testing Guide

**Standard:** WCAG 2.2 Level AA
**Tools:** axe DevTools, NVDA, pa11y, WAVE

---

## Quick Testing (2 minutes)

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Lighthouse tab → Accessibility audit
3. Check for critical issues

### axe DevTools Extension
1. Install from Chrome Web Store
2. Open DevTools → axe DevTools tab
3. Click "Scan ALL of my page"
4. Fix Critical and Serious issues

---

## Automated Testing

### axe-core CLI
```bash
# Install
npm install -g @axe-core/cli

# Basic scan
axe https://helpingdoctors.org/staff-dashboard/

# With specific rules
axe https://helpingdoctors.org/staff-dashboard/ --rules wcag2aa

# JSON output
axe https://helpingdoctors.org/staff-dashboard/ --save results.json
```

### pa11y
```bash
# Install
npm install -g pa11y

# Basic scan
pa11y https://helpingdoctors.org/staff-dashboard/

# WCAG 2.2 AA standard
pa11y --standard WCAG2AA https://helpingdoctors.org/staff-dashboard/

# Multiple pages
pa11y-ci --sitemap https://helpingdoctors.org/sitemap.xml
```

---

## Manual Testing Checklist

### Keyboard Navigation
- [ ] Tab through entire page
- [ ] Logical focus order
- [ ] No keyboard traps
- [ ] Skip link works
- [ ] All controls accessible

### Screen Reader (NVDA)
- [ ] Page title announced
- [ ] Headings in logical order
- [ ] Images have alt text
- [ ] Form fields labelled
- [ ] Links make sense out of context

### Visual
- [ ] Contrast meets 4.5:1
- [ ] Focus indicators visible
- [ ] No colour-only information
- [ ] Text resizable to 200%
- [ ] Works at 320px width

---

## NVDA Testing

### Key Commands

| Action | Keys |
|--------|------|
| Start/Stop NVDA | Ctrl+Alt+N |
| Read current | Insert+↑ |
| Next element | ↓ |
| Previous element | ↑ |
| Next heading | H |
| Next link | K |
| Next form field | F |
| List headings | Insert+F7 |

### Testing Flow
1. Start NVDA
2. Navigate to page
3. Press Insert+F7 to check heading structure
4. Tab through all interactive elements
5. Verify form labels are read
6. Check dynamic content updates

---

## Common Issues & Fixes

### Missing Form Labels
```html
<!-- Bad -->
<input type="text" name="patient_name">

<!-- Good -->
<label for="patient-name">Patient Name</label>
<input type="text" id="patient-name" name="patient_name">
```

### Low Contrast
```css
/* Bad: 2.8:1 contrast */
.text-muted { color: #9ca3af; }

/* Good: 5.0:1 contrast */
.text-muted { color: #6b7280; }
```

### Missing Alt Text
```html
<!-- Bad -->
<img src="patient.jpg">

<!-- Good (informative) -->
<img src="patient.jpg" alt="Patient John Smith, ID photo">

<!-- Good (decorative) -->
<img src="decoration.svg" alt="" role="presentation">
```

### No Focus Visible
```css
/* Bad */
:focus { outline: none; }

/* Good */
:focus {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
}
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Accessibility
on: [push, pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run pa11y
        run: |
          npm install -g pa11y
          pa11y --standard WCAG2AA ${{ env.SITE_URL }}
```

---

## Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [NVDA Download](https://www.nvaccess.org/download/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
