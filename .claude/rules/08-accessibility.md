# Accessibility Requirements

**Project:** Medinova
**Standard:** WCAG 2.2 Level AA
**Stack:** Next.js 15 + shadcn/ui + React
**Testing:** @axe-core/react (dev) + Playwright axe (CI)

---

## Quick Reference

| Requirement | Target |
|---|---|
| Colour contrast (normal text) | 4.5:1 |
| Colour contrast (large text) | 3:1 |
| Touch target size | 44x44px minimum |
| Focus indicator | Visible, 3:1 contrast |
| Animation | Respect `prefers-reduced-motion` |

---

## shadcn/ui — What It Handles

shadcn/ui components (built on Radix) provide ARIA roles, keyboard navigation, and focus management out of the box for: Dialog, DropdownMenu, Select, Tabs, Tooltip, Popover, Sheet, AlertDialog.

**You still must provide:** labels, descriptions, aria-live regions, skip links, colour contrast, and touch target sizing.

---

## Mandatory Patterns — React/JSX

### Skip Link (Root Layout)
```tsx
// apps/web/src/app/layout.tsx
<body>
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4">
    Skip to main content
  </a>
  {children}
</body>
```

### Semantic Structure
```tsx
<header>
  <nav aria-label="Main navigation">{/* sidebar/topbar */}</nav>
</header>
<main id="main-content" tabIndex={-1}>
  <h1>{t('patients.title')}</h1>
  <section aria-labelledby="results-heading">
    <h2 id="results-heading">{t('patients.results')}</h2>
    {/* content */}
  </section>
</main>
```

### Form Labels — Always Explicit
```tsx
// shadcn/ui Form components handle this via FormLabel
<FormField
  control={form.control}
  name="firstName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>{t('patients.firstName')}</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Live Regions for Dynamic Content
```tsx
<div role="status" aria-live="polite">
  {isLoading ? t('common.loading') : t('patients.resultsCount', { count })}
</div>
```

### Touch Targets
```tsx
// All interactive elements: minimum 44x44px
<Button className="min-h-[44px] min-w-[44px]">{t('common.save')}</Button>

// Icon buttons need aria-label
<Button variant="ghost" size="icon" aria-label={t('common.close')} className="min-h-[44px] min-w-[44px]">
  <X className="h-4 w-4" />
</Button>
```

---

## Dev-Time Checks — @axe-core/react

```tsx
// apps/web/src/app/layout.tsx (development only)
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
    // Logs violations to browser console automatically
  });
}
```

---

## CI Checks — Playwright + axe

```typescript
// apps/web/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('dashboard has no critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  expect(results.violations.filter(v => v.impact === 'serious')).toHaveLength(0);
});
```

Run on every PR: `pnpm --filter web exec playwright test e2e/accessibility.spec.ts`

---

## RTL / i18n

Arabic and other RTL languages must work correctly:
```tsx
// Root layout sets dir based on locale
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

Test every page in both LTR and RTL. shadcn/ui supports RTL out of the box.

---

## Checklist

- [ ] Skip link present in root layout?
- [ ] All form fields use shadcn FormLabel (not placeholder-only)?
- [ ] Icon buttons have aria-label?
- [ ] Touch targets minimum 44x44px?
- [ ] Colour contrast meets 4.5:1?
- [ ] aria-live regions for dynamic content?
- [ ] @axe-core/react enabled in development?
- [ ] Playwright axe tests in CI pipeline?
- [ ] RTL layout tested for Arabic?
