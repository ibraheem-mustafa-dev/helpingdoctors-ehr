# HelpingDoctors EHR Pro — Business Model
**Last Updated:** 2026-03-12
**Status:** Confirmed strategic decisions. Working document.

---

## The Model

Buy-one-give-one for healthcare software.

Paying UK/Western clinics get a world-class EHR at a fraction of competitor prices. Their subscription funds free deployments for clinics in conflict zones and refugee camps. One NHS pilot client funds approximately 4–5 humanitarian deployments.

This is not charity bolted onto a product. It is the product.

---

## Dual Architecture

| Path | Target | Stack |
|------|--------|-------|
| WordPress plugin | NGOs with existing WP sites, grassroots clinics | WP Multisite + SGS theme + custom blocks |
| Standalone app | Premium commercial clients, hospitals | React/Next.js frontend, headless WP REST API backend |

Both share the same backend. The standalone app is Phase 2 after the WP plugin reaches production-ready state.

---

## Tiers

### Starter — £79/month

**Target:** Solo practitioners, small clinics (1–5 staff), first-time EHR adopters.

**Includes:**
- Full core EHR (patients, encounters, prescriptions, history)
- Booking calendar (3-step wizard)
- Staff profiles and schedules
- All 53 drag-drop dashboard widgets (role-based templates)
- Drug interactions checker (FDA API)
- 200 SMS/WhatsApp reminders per month
- OCR document scanning
- 10-language support (EN, AR, FR, UR, SO, PS, TR, SW, ES + more)
- AES-256-GCM encryption and full audit logs
- Basic offline mode (PWA)
- GDPR compliance tools
- 27 role-based access levels
- 1 clinic location
- 5 staff accounts
- Email support, 72-hour response

**Does not include:** Video consultations, FEFO pharmacy, lab workflow, full offline-first, encrypted messaging, Mollie payments, multi-location, Shifa Bot.

**Your cost to deliver:** ~£90/month per client (infra + APIs + ~1.5hrs support)
**Margin:** Loss leader at low volume. Break-even around 30+ clients. Purpose is pipeline building.

---

### Practice — £399/month

**Target:** Multi-doctor private clinics, physiotherapy groups, dental groups, specialist practices.

**Includes everything in Starter, plus:**
- 25 staff accounts
- 5 clinic locations with per-location dashboards and staff assignment
- 2,000 SMS/WhatsApp reminders per month (via Twilio)
- Full offline-first (350MB IndexedDB, sync queue with conflict resolution)
- Video consultations (Jitsi Meet, low-bandwidth optimised)
- FEFO pharmacy management (automated inventory, expiry alerts, waste reduction)
- Lab workflow (order → results → notification)
- Encrypted staff messaging
- OCR document scanning (full)
- Mollie payment integration
- Arabic RTL + all 10 languages full support
- 99.5% uptime SLA
- Email support, 24-hour response

**Does not include:** Multi-site network management, mass casualty mode, outbreak tracking, FHIR R4 export, dedicated AWS infrastructure, Shifa Bot (available as add-on).

**Your cost to deliver:** ~£290/month per client
**Margin:** ~£109/month (27%). At 10 Practice clients = +£1,090/month.

---

### Hospital — £1,800/month

**Target:** Small private hospitals, NHS pilot sites, multi-site clinic groups.

**Includes everything in Practice, plus:**
- Unlimited staff accounts
- Unlimited clinic locations
- Cross-site network analytics and centralised admin dashboard
- Inter-clinic patient transfers
- Bulk reporting across all locations
- Mass casualty and triage mode
- Outbreak tracking and contact tracing
- FHIR R4 export (NHS interoperability)
- Dedicated AWS infrastructure (t3.medium + RDS + CloudFront)
- Shifa Bot included (up to 10,000 queries/month)
- Unlimited SMS/WhatsApp reminders
- 99.9% uptime SLA
- Phone + email support, 12-hour response

**Your cost to deliver:** ~£900/month per client
**Margin:** ~£900/month (50%). At 3 Hospital clients = +£2,700/month. Sustains the operation.

---

### Enterprise — Custom pricing (indicative: £5,000–£20,000+/month)

**Target:** NHS trusts, large private hospital groups, international humanitarian organisations managing multiple deployments.

**Includes everything in Hospital, plus:**
- White-label and custom branding
- On-premise deployment option
- Custom development hours (agreed monthly allocation)
- Dedicated account manager
- Unlimited Shifa Bot queries
- 99.99% uptime SLA
- Full compliance documentation (DSPT, MHRA SaMD roadmap)
- Staff training programme
- Custom FHIR integrations

**Market context:** Epic costs £1M+ for small hospitals. Oracle Cerner cost Sheffield NHS Trust £85M over 10 years. Enterprise pricing at £5,000–£20,000/month is still dramatically cheaper for comparable functionality.

---

### Humanitarian — Free

**Target:** Clinics in conflict zones, refugee camps, disaster response settings.

**Includes:** Full system equivalent to Hospital tier, adapted for offline-first environments.
**Constraints:** Reviewed and approved by HelpingDoctors. Subject to deployment capacity.
**Funding:** Covered by revenue from commercial tiers. One Hospital client funds ~4–5 humanitarian deployments.

---

## Add-Ons

### Shifa Bot (شفاء — AI analytics and clinical support)

Available as add-on for Starter and Practice tiers. Included in Hospital and above.

| Plan | Queries/month | Price | Your cost | Margin |
|------|--------------|-------|-----------|--------|
| Basic | 500 | £49/month | £3 | 94% |
| Growth | 2,500 | £119/month | £15 | 87% |
| Unlimited | Unlimited | £249/month | £60 | 76% |

Shifa Bot stack: Claude API (Haiku for analytics, Sonnet for complex clinical queries) + RAG over clinic's own patient data + tool calls to WP REST API for real-time data. Streaming React UI.

### Consultation Transcript + AI Clinical Notes

Video consultation ends → transcript generated (Whisper) → Claude Haiku converts to structured SOAP note → pre-fills encounter record → clinician reviews and saves.

Integrated from Bean's booking system recording pipeline.

| Plan | Price | Your cost | Margin |
|------|-------|-----------|--------|
| Pay-per-consultation | £0.50 | £0.08 | 84% |
| 50 consultations/month bundle | £15/month | £4 | 73% |
| Unlimited | £99/month | £30 | 70% |

### Website Add-On (SGS Framework — separate service line)

| Package | What | Price |
|---------|------|-------|
| Launch site | 5-page clinic website, HelpingDoctors style, SEO-ready | £1,200 one-off |
| Full site | 10+ pages, booking integration, staff profiles, services pages | £2,500 one-off |
| Monthly retainer | Hosting, WP updates, minor edits | £75/month |
| Practice bundle | Practice subscription + Launch site | £399/mo + £900 setup (25% discount) |

---

## Revenue Projections

### Conservative (12-month target)

| Tier | Clients | Monthly revenue |
|------|---------|----------------|
| Starter | 20 | £1,580 |
| Practice | 8 | £3,192 |
| Hospital | 2 | £3,600 |
| Shifa Bot add-ons (10) | — | £990 |
| Transcript bundles (8) | — | £120 |
| Websites (1.5/month avg) | — | £1,800 |
| **Total** | | **~£11,282/month** |

~£135k/year from a modest client base.

### Break-even (covering Bean's time)

| Mix | Monthly net |
|-----|------------|
| 1 Hospital + 5 Practice + 10 Starter | ~£2,500 |
| 2 Hospital + 6 Practice | ~£4,500 |
| 1 Enterprise + 3 Practice | ~£7,000+ |

---

## Go-to-Market

### Phase 1 — Grassroots (now → 12 months)

**Target:** Solo GPs, physiotherapists, private clinics, specialist practices. Muslim-owned UK clinics first.

**Methods:**
- Personal networking (Bean's existing network, AME, Muslim business communities)
- Grant provider introductions (King's Trust, SBRI Healthcare, Innovate UK)
- Charity deployments as case studies (Rivers of Mercy first)
- Direct outreach at healthcare and Muslim business events

**Goal:** 5 Practice clients, 10 Starter clients, 1 working humanitarian deployment with documented outcomes.

### Phase 2 — NHS + Scale (12–24 months)

**Target:** NHS pilot via AHSN (Academic Health Science Network) introductions, private hospital groups.

**Trigger:** Rivers of Mercy deployment documented with real patient outcomes + at least 3 UK commercial clients.

**Methods:**
- Grant-funded NHS pilot (SBRI Healthcare is the most direct path)
- DSPT submission + MHRA SaMD registration for Class I (required for NHS clinical use)
- Case study marketing built on charity deployments

### Phase 3 — Enterprise + International (24+ months)

**Target:** NHS trusts, international NGOs, multi-country humanitarian networks.

---

## Regulatory Roadmap

| Requirement | When needed | Complexity |
|-------------|------------|------------|
| UK GDPR compliance | Now | ✅ Largely addressed (AES-256-GCM, audit logs, data minimisation) |
| MHRA SaMD Class I registration | Before NHS clinical use | Moderate — 3–6 months |
| DSPT (Data Security Protection Toolkit) | Before NHS data sharing | Moderate — needs annual submission |
| HIPAA BAA with AWS | Before US/international commercial | Easy — AWS offers BAAs on Business/Enterprise |
| FHIR R4 NHS interoperability | Before NHS procurement | In progress — assess current state |
| ISO 27001 | Enterprise clients | Long-term — £15–50k, 12–18 months |

---

## Competitor Reference

| System | Price | Humanitarian | Arabic | Offline | AI |
|--------|-------|-------------|--------|---------|-----|
| **HelpingDoctors EHR Pro** | £79–£1,800/mo | ✅ Free tier | ✅ Full RTL | ✅ Full | ✅ Shifa Bot |
| KiviCare (WP) | $59–$599 one-time | ❌ | Basic | ❌ | ❌ |
| OpenMRS/Bahmni | Free | ✅ | Partial | Limited | ❌ |
| Carepatron | $49–$99/mo | ❌ | ❌ | ❌ | Basic |
| Epic | $1M+ hospital | ❌ | ❌ | ❌ | Basic |
| Oracle Cerner | £85M/10yr (NHS) | ❌ | ❌ | ❌ | Basic |

---

## Technical Stack Decisions

- **Backend:** WordPress Multisite (PHP 8.x, 70+ custom DB tables, WP REST API)
- **Frontend (WP path):** SGS theme + custom blocks (replacing all Spectra/UAG dependencies)
- **Frontend (standalone path):** React/Next.js consuming WP REST API (Phase 2)
- **AI:** Claude API (Anthropic) — Haiku for analytics queries, Sonnet for complex clinical
- **Hosting:** AWS (production), Hostinger shared (dev only)
- **Offline:** IndexedDB + Service Worker + 350MB local storage + sync queue
- **Video:** Jitsi Meet (self-hosted, low-bandwidth optimised)
- **SMS:** Twilio
- **Payments:** Mollie
- **Pharmacy:** FEFO algorithm (custom implementation)
- **Security:** AES-256-GCM PHI encryption, nonces, prepared statements, capability checks

---

*This document supersedes any pricing discussed in chat prior to 2026-03-12.*
*Next review: when first paying client signs, or when NHS pilot begins.*
