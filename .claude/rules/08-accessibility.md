# Accessibility Requirements

**Project:** HelpingDoctors EHR Pro
**Standard:** WCAG 2.2 Level AA
**Testing:** axe DevTools, NVDA

---

## Quick Reference

| Requirement | Target |
|-------------|--------|
| Colour contrast (normal text) | 4.5:1 |
| Colour contrast (large text) | 3:1 |
| Touch target size | 44×44px |
| Focus indicator | Visible, 3:1 contrast |
| Animation | Respect prefers-reduced-motion |

---

## Mandatory Elements

### Skip Link (First in Body)
```html
<a href="#main-content" class="skip-link">
    Skip to main content
</a>
```

### Semantic HTML
```html
<header>
    <nav aria-label="Main navigation">...</nav>
</header>
<main id="main-content" tabindex="-1">
    <article>
        <h1>Page Title</h1>
        <section aria-labelledby="section-heading">
            <h2 id="section-heading">Section</h2>
        </section>
    </article>
</main>
<footer>...</footer>
```

### Form Labels
```html
<!-- Every input needs a label -->
<label for="patient-name">Patient Name</label>
<input type="text" id="patient-name" name="patient_name">
```

### ARIA for Dynamic Content
```html
<div role="status" aria-live="polite" id="search-results">
    15 patients found
</div>
```

---

## Testing Commands

```bash
# Install testing tools
npm install -g @axe-core/cli pa11y

# Run axe scan
axe https://helpingdoctors.org/staff-dashboard/

# Run pa11y scan
pa11y --standard WCAG2AA https://helpingdoctors.org/staff-dashboard/
```

---

## Verification Before Deployment

- [ ] axe DevTools reports 0 Critical/Serious issues
- [ ] All form fields have labels
- [ ] Focus visible on ALL interactive elements
- [ ] Contrast ratios meet 4.5:1
- [ ] Touch targets minimum 44×44px
- [ ] Skip link present and working
