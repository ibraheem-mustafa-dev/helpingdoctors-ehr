# Humanitarian Context

**Project:** Medinova
**Primary Deployment:** Gaza, Palestine (funded by commercial revenue + grants)
**Context:** Active humanitarian crisis

---

## Why This Matters

> "This is being deployed for a clinic in Palestine. These people are in desperate need and deserve our utmost care."

Real patients in crisis zones depend on this software working. Every technical decision must account for the humanitarian deployment.

---

## Key Constraints

### Infrastructure
- **2G/3G connectivity** — intermittent, unreliable
- **Power outages** — battery-saving essential
- **Limited hardware** — must work on older Android devices
- **No IT support on-site** — must be self-recoverable

### Users
- **80% Arabic speakers** — full RTL support, Arabic medical terminology
- **Variable digital literacy** — icon-heavy interface, minimal text
- **High stress environment** — simple, clear workflows
- **Medical staff stretched thin** — efficiency is life-saving

### Patients
- **5000+ paper records** — OCR scanning needed (Phase 3)
- **Displaced populations** — ID verification challenges
- **Mass casualty events** — surge capacity mode
- **Infectious outbreaks** — contact tracing needs

---

## Technical Design Principles

### 1. Offline-First (PWA)
Staff app is a Next.js PWA with service worker caching. All critical workflows must function without connectivity. Data syncs when connection restores via BullMQ queue.

### 2. Low Bandwidth
- Compress all assets (Brotli)
- Lazy load non-critical components
- Minimise API payload sizes
- Redis cache aggressively on the backend
- CDN via CloudFront for static assets

### 3. Multi-Language (i18n from Day 1)
- 10+ languages via next-intl (frontend) and NestJS i18n (backend)
- Arabic RTL layouts throughout
- Arabic date formats and number localisation
- Medical terminology translated by qualified medical translators

### 4. Mass Casualty Mode
Special interface for overwhelming patient volume:
- Rapid triage (one-screen registration)
- Bulk patient registration
- Resource tracking dashboard
- Simplified documentation (vitals + chief complaint only)

### 5. Error Tolerance
- Auto-save on every field blur
- Graceful degradation (read-only mode if sync fails)
- Clear recovery paths with user-visible sync status
- Zero data loss — offline queue persists in IndexedDB

---

## Patient App — React Native (Phase 4)

Native app for patients (App Store + Play Store). Not a PWA — patients need push notifications, biometric auth, and offline access to their own records. Staff app remains PWA.

---

## What This Means for Every PR

Every code change should pass these questions:
1. Will this work offline?
2. Will this work on a slow 2G connection?
3. Is this accessible to Arabic speakers with RTL layouts?
4. Is this simple enough to use under extreme stress?
5. Can this handle surge capacity (10x normal patient volume)?

---

## Remember

These are real people in real crisis. The software must be:
- **Reliable** — it must work when lives depend on it
- **Accessible** — everyone must be able to use it
- **Efficient** — no wasted time in emergencies
- **Respectful** — dignity in patient care

---

## Checklist

- [ ] Works offline via service worker + IndexedDB?
- [ ] Optimised for low bandwidth (compressed, lazy-loaded)?
- [ ] Arabic language and RTL support?
- [ ] Simple enough for high-stress use?
- [ ] Mass casualty mode considered?
