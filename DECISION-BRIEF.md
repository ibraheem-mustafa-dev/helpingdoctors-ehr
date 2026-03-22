# HelpingDoctors EHR Pro — Decision Brief

**Date:** 21 March 2026
**For:** Bean (Ibraheem), Small Giants Studio
**Based on:** 93 sources reviewed, 30 read in depth, cross-discussion synthesis complete

---

## 1. The Real Question

The original question was "how do I finish and launch this EHR plugin?"

The real question is: **How does Bean, a solo non-coder working evenings and weekends, get from a broken prototype to paying customers within 6 months — while every competitor either ignores small UK clinics or has critical security vulnerabilities?**

The answer is not "finish everything." It is "ship the minimum that proves the security story, because the security story IS the product."

---

## 2. The Insight

**KiviCare's security disasters are your launch event.**

KiviCare — the only real WordPress EHR competitor — has had 3 critical CVEs in 15 months. The March 2026 vulnerability (CVSS 9.8) is an authentication bypass that exposes patient data. Their users are actively looking for alternatives right now.

But here is the uncomfortable truth: **HelpingDoctors currently has the same class of vulnerability.** 28 `nopriv` AJAX handlers, 3 of which expose PHI. 15+ unprepared database queries. The plugin cannot even activate.

This means:

1. The market opportunity is real and time-sensitive (KiviCare users are scared)
2. You cannot credibly sell security until you fix your own security issues
3. The 3-4 days of security fixes are not pre-work — they ARE the first revenue milestone
4. Once fixed, you have the only WordPress EHR that can truthfully claim "security-first"

**One sentence:** Fix 22 security issues, ship 8 pages, and you own a market gap that no competitor is even trying to fill.

---

## 3. The Proven Edge — Security-First WordPress EHR

The established approach: fix the existing codebase, remove plugin dependencies, ship a focused MVP to 3-5 beta clinics.

| Factor | Score (1-10) | Why |
|--------|-------------|-----|
| **Competitive Advantage** | 8 | Only WP EHR with AES-256-GCM encryption, audit logging, and no critical CVEs |
| **Innovation** | 4 | Standard EHR features, done properly |
| **Feasibility** | 9 | 60% of the code exists. Fix security, remove dependencies, ship |
| **Time-to-Value** | 8 | Beta-ready in 8-10 weeks with Claude doing the development |

**What this looks like:**
1. Phase 0 security fixes (week 1-2)
2. Remove ACF/UM dependencies (week 3-5)
3. 8-page MVP: login, dashboard, patients, encounters, prescriptions, appointments, profile, help (week 6-8)
4. DTAC self-assessment submitted (week 8-10, runs in parallel)
5. First beta clinic onboarded (week 10-12)

**The pitch to clinics:** "KiviCare just had its third data breach. We built HelpingDoctors specifically because patient data security in WordPress EHRs is broken. Here's our encryption architecture. Here's our audit log. Here's our DTAC submission."

---

## 4. The Innovation Play — Offline-First with SQLite WASM + CRDT Sync

The bleeding-edge approach: replace IndexedDB with SQLite WASM running in the browser via OPFS (Origin Private File System), with Yjs CRDTs for real-time collaborative editing of encounter notes.

| Factor | Score (1-10) | Why |
|--------|-------------|-----|
| **Competitive Advantage** | 10 | No EHR on earth does this. Not Epic. Not OpenMRS. Nobody |
| **Innovation** | 10 | SQLite WASM + OPFS only became production-viable in late 2025 |
| **Feasibility** | 5 | Requires significant JS architecture. PowerSync MySQL support still in beta |
| **Time-to-Value** | 3 | 6+ months to production-grade offline. Delays revenue |

**What this looks like:**
- Full SQL database running in the browser (not key-value IndexedDB)
- Complex medical queries work offline (patient search, encounter history, drug interactions)
- Two doctors editing the same encounter note simultaneously with conflict-free merging
- Sync resumes automatically when connectivity returns, no data loss

**Why it matters for Gaza:** IndexedDB stores ~50MB reliably. SQLite WASM via OPFS handles 350MB+. That is the difference between caching 200 patients and caching 5,000 patients — the entire clinic population.

**Recommendation:** Build this as Phase 2 (months 4-8), not Phase 1. The basic service worker + IndexedDB offline mode already in the codebase is good enough for beta. SQLite WASM is the upgrade that turns "good enough" into "genuinely unprecedented."

---

## 5. The Moonshot — AI-Powered Humanitarian EHR Platform

What nobody has built: an AI clinical assistant (Shifa Bot) that works offline, runs inference on-device via WebLLM, supports Arabic/English, and auto-generates structured clinical notes from voice input — specifically designed for crisis zones.

| Factor | Score (1-10) | Why |
|--------|-------------|-----|
| **Competitive Advantage** | 10 | Nothing remotely like this exists |
| **Innovation** | 10 | On-device medical LLM inference is barely possible in 2026 |
| **Feasibility** | 2 | WebLLM is experimental. Medical accuracy on-device is unproven |
| **Time-to-Value** | 1 | 12-18 months minimum. Requires MHRA regulatory work |

**Why it is worth noting:** This is the vision that gets grant funding. SBRI Healthcare, Wellcome Trust, UKRI — they fund "impossible" things. You do not need to build it now. You need to describe it now and build towards it.

**The grant pitch:** "We are building the first AI-powered EHR that works without internet in conflict zones. Phase 1 (funded by commercial revenue) delivers security-first EHR for UK clinics. Phase 2 (this grant application) funds offline AI clinical support for humanitarian deployments."

---

## 6. What We Ruled Out

| Option | Why It Is Dead | Do Not Revisit |
|--------|---------------|----------------|
| **Building on OpenMRS/Bahmni** | Java server, no Arabic/RTL, requires IT team on-site. Fundamentally wrong architecture for Gaza | Never |
| **Using WP Amelia for booking** | +1000ms performance penalty, no HIPAA documentation, no offline capability. Your custom booking is better | Never |
| **Stripe for payments** | 38% more expensive than Mollie. Ethical concerns for humanitarian context | Never (ADR-002) |
| **WordPress Custom Post Types for patient data** | 10-50x slower than custom tables. Cannot do field-level encryption. Cannot do foreign keys | Never (ADR-001) |
| **LiteSpeed Cache** | Known file deletion bug. Unsafe for medical data | Never |
| **Per-provider pricing** | Undercuts your competitive advantage. Flat per-clinic pricing is simpler, cheaper for clients, and more predictable for you | Never |
| **Targeting NHS trusts first** | 18-24 month procurement cycles. DSPT v8 independent audit required. Wrong first customer | Not until year 2 |
| **React Native mobile app** | Adds a second codebase. PWA gives 90% of the benefit with one codebase. Consider only after product-market fit | Not until year 2 |
| **CHT (Community Health Toolkit)** | Best humanitarian EHR, but Node.js/CouchDB stack, no UK regulatory alignment, no commercial tier. Wrong foundation | Never |

---

## 7. What Competitors Are Missing

| Gap | Who Misses It | Your Advantage |
|-----|--------------|----------------|
| **WordPress EHR security** | KiviCare (3 CVEs in 15 months) | AES-256-GCM encryption, prepared statements, audit logging, no `nopriv` PHI exposure |
| **Offline-first for UK clinics** | Everyone (Carepatron, KiviCare, DrChrono — all cloud-only) | Service worker + IndexedDB now, SQLite WASM later |
| **Small independent clinic pricing** | Epic (£1M+), Oracle Cerner (£85M/10yr), EMIS (enterprise contracts) | £79-399/month, no per-provider surcharge |
| **Arabic/RTL medical interface** | OpenMRS, Bahmni, all US-built EHRs | Built-in from day one, not bolted on |
| **BOGO humanitarian model** | Nobody in digital health | One paying clinic funds 4-5 free humanitarian deployments |
| **UK DTAC compliance for WordPress EHR** | KiviCare (no DTAC, no DSPT) | First WP EHR to submit DTAC self-assessment |
| **ICD-11 (not ICD-10)** | Most UK systems still on ICD-10 | NHS mandating ICD-11 from April 2026. You are already building for it |
| **Dual architecture (WP + standalone)** | KiviCare (WP only), Carepatron (SaaS only) | Same backend serves both markets |

---

## 8. Risk of Inaction

**If Bean does nothing for 3 months:**

1. **KiviCare patches their CVEs** and the window of competitor weakness closes
2. **DTAC v2 goes live 6 April 2026** — early submitters get visibility; latecomers join a queue
3. **NHS ICD-11 mandate hits April 2026** — systems not supporting it lose NHS pathway eligibility
4. **Another developer spots the gap** — WordPress EHR with proper security is an obvious market hole
5. **Grant cycles pass** — SBRI Healthcare Phase 1 has fixed windows. Missing one means waiting 6-12 months
6. **60% of existing code rots** — dependencies change, WordPress updates break things, technical debt compounds

**If Bean picks the "safe" option (keep polishing, don't ship):**

The product never launches. 207 PHP files and 103K lines of code sit unused while real clinics in Gaza and the UK continue using paper records or insecure software. The humanitarian mission fails not because the code was not good enough, but because it was never deployed.

**Bottom line:** The biggest risk is not shipping a product with a bug. It is never shipping at all.

---

## 9. Recommended Action Plan

### Weeks 1-2: Make It Activatable

1. Fix all 15 unprepared `$wpdb` queries (list is in ROADMAP.md Phase 0.4)
2. Fix all 15 unescaped echo statements
3. Remove or guard the 28 `nopriv` AJAX handlers — 3 expose PHI, fix those first
4. Rewrite `check_dependencies()` to remove ACF/UM hard requirements
5. Make Turnstile keys optional (graceful degradation)
6. Fix Composer autoloader path
7. **Test:** Plugin activates without fatal errors

### Weeks 3-4: Remove External Dependencies

8. Replace 108 ACF references with `get_post_meta()`/`update_post_meta()` (8 files)
9. Replace 304 Ultimate Member references with native WP user API (15 files)
10. Rewrite `class-hd-comprehensive-roles.php` to use `add_role()`/`add_cap()`
11. Delete Astra/Spectra integration files
12. Build custom login form (replaces UM login)
13. Build custom registration form (replaces UM registration)
14. **Test:** All 27 roles work with native WordPress

### Weeks 5-6: Wire the MVP Pages

15. Build 8 frontend pages using SGS theme blocks:
    - Staff Login (`/staff-login/`)
    - Staff Dashboard (`/staff-dashboard/`)
    - Patient Management (`/staff/patients/`)
    - Clinical Encounter (`/staff/encounter/`)
    - Prescriptions (`/staff/prescriptions/`)
    - Appointments (`/staff/appointments/`)
    - User Profile (`/staff/profile/`)
    - Help Centre (`/staff/help/`)
16. Wire the 53 dashboard widgets to real data
17. Activate HelpingDoctors style variation in Site Editor
18. Remove all Indus Foods branding from template parts

### Weeks 7-8: Compliance Paperwork (In Parallel with Testing)

19. Start DTAC v2 self-assessment (goes live 6 April 2026)
20. Draft privacy policy (plain language, GDPR-compliant)
21. Implement cookie consent
22. Document encryption architecture for compliance evidence
23. **Test:** Full workflow — register, login, create patient, record encounter, prescribe, book appointment

### Weeks 9-10: Beta Preparation

24. Provision AWS infrastructure (t3.medium + RDS + CloudFront)
25. Migrate from Hostinger to AWS
26. Set up automated backups (RDS + S3)
27. Create onboarding guide for beta clinics (plain language, screenshots)
28. Record 3-minute demo video showing core workflow

### Weeks 11-12: First Beta Clinic

29. Identify 1-2 beta clinics (Muslim-owned independent UK clinics, Bean's network)
30. Onboard first beta clinic with hands-on support
31. Collect feedback daily for first week
32. Fix critical bugs same-day
33. Submit DTAC self-assessment
34. **Milestone:** First real patients in the system

### After Week 12 (Ongoing)

35. Onboard 3-5 more beta clinics (months 4-5)
36. Start SBRI Healthcare Phase 1 grant application
37. Begin SQLite WASM offline upgrade (Phase 2 innovation play)
38. Build Shifa Bot MVP (Claude API + RAG, months 5-8)
39. First paying customer at month 4-5

---

## 10. Key Decisions Bean Must Make

### Decision 1: Beta Pricing Strategy

**Option A — Free beta, charge later**
- Lower barrier to entry, faster clinic adoption
- Risk: clinics expect it to stay free, difficult conversion
- Standard for healthcare SaaS

**Option B — Discounted beta (£29/month)**
- Proves willingness to pay from day one
- Filters out clinics that are not serious
- Smaller beta pool

**Option C — Free for 3 months, then Starter tier**
- Best of both: low barrier, clear expectation of future payment
- Most SaaS companies use this model

**Context:** Healthcare SaaS has 7.5% monthly churn. Free-to-paid conversion rates average 2-5%. Starting paid (even discounted) gets better signal on product-market fit.

---

### Decision 2: First Beta Clinic Source

**Option A — Bean's personal network (Muslim-owned UK clinics)**
- Fastest path. Trust already exists
- May not give harsh enough feedback
- Aligns with grassroots go-to-market strategy

**Option B — Cold outreach to clinics frustrated with KiviCare**
- Highly motivated users (they have a security problem right now)
- Takes more time and effort to find
- Stronger validation signal

**Option C — Charity clinic (humanitarian deployment)**
- Directly serves the mission
- Harder to support remotely in crisis zone
- Not ideal for first beta (too many variables)

**Context:** First beta clinic should be low-risk, high-feedback. A UK clinic Bean knows personally is the safest choice. Save humanitarian deployment for beta 2 or 3.

---

### Decision 3: DTAC Timing

**Option A — Submit self-assessment immediately (April 2026)**
- First WP EHR in the DTAC pipeline
- Some questions may need "planned" answers (not yet implemented)
- Visibility with NHS procurement early

**Option B — Submit after beta feedback (July 2026)**
- Stronger submission with real usage data
- Misses early-mover advantage
- NHS procurement cycle means delay compounds

**Context:** DTAC v2 is lighter than v1. Self-assessment is not a pass/fail gate — it is a transparency exercise. Submitting early with honest "planned for Q3 2026" answers is better than waiting. NHS buyers check who is in the pipeline, not who scored perfectly.

---

### Decision 4: AWS Timing

**Option A — Move to AWS before beta (week 9-10)**
- Production-grade infrastructure from day one
- ~£90/month cost starts immediately
- Professional impression for beta clinics

**Option B — Beta on Hostinger, move to AWS after**
- Saves 2-3 months of AWS costs
- Risk: Hostinger shared hosting is not GDPR-compliant for real patient data
- Unprofessional if clinic notices performance issues

**Context:** Real patient data on Hostinger shared hosting is a compliance risk. If beta clinics enter real patient data (even test patients), you need proper infrastructure. AWS before beta is the right call unless the beta is purely synthetic data.

---

### Decision 5: Shifa Bot Priority

**Option A — Build Shifa Bot in parallel with beta (months 4-8)**
- Differentiator from day one
- DUA Act (5 Feb 2026) means AI cannot make clinical decisions — must be admin-assist only
- High development effort alongside beta support

**Option B — Build Shifa Bot after 5 paying customers**
- Revenue validates the core product first
- Less distraction during critical beta period
- Paying customers tell you what AI features they actually want

**Option C — Build minimal Shifa Bot (FAQ + appointment booking only)**
- Low effort, high perceived value
- Avoids clinical AI regulatory concerns entirely
- Can expand later based on demand

**Context:** Claude for Healthcare via AWS Bedrock with BAA is available now. MHRA classifies clinical AI as Class IIa medical device (requires full regulatory pathway). Admin-assist AI (booking, FAQ, reminders) does not require MHRA approval. Option C avoids the regulatory minefield while still delivering a marketable feature.

---

### Decision 6: Grant Application Timing

**Option A — Apply to SBRI Healthcare Phase 1 now (£50-100K)**
- Funds the humanitarian development work
- Application takes 2-3 weeks to write properly
- Competes with development time

**Option B — Apply after first paying customer (month 5-6)**
- Stronger application with traction evidence
- May miss current funding round
- Revenue proves viability

**Context:** SBRI Healthcare values innovation and NHS relevance over traction. A compelling application with a working MVP demo and DTAC submission could win Phase 1 without paying customers. But writing the application is 15-20 hours Bean could spend on development. If Claude writes the first draft, Bean reviews and personalises, total time drops to 5-8 hours.

---

### Decision 7: ICD-11 vs ICD-10

**Option A — ICD-11 only (as currently planned)**
- Forward-looking. NHS mandating from April 2026
- WHO API available with your existing token
- Fewer UK clinics familiar with ICD-11 codes yet

**Option B — ICD-11 with ICD-10 crossmap**
- Supports clinics transitioning from ICD-10
- More complex to build
- Better for NHS pathway (they use both during transition)

**Context:** The NHS ICD-11 mandate is real but the transition period means many clinicians still think in ICD-10. A crossmap (type ICD-10, system stores ICD-11 equivalent) is the gold standard approach. The WHO provides official crosswalk tables. Build ICD-11 primary with ICD-10 search as a convenience layer.

---

## 11. Sources

The 20 most important sources from this research, ranked by impact on decisions:

| # | Source | Why It Matters |
|---|--------|---------------|
| 1 | **KiviCare CVE-2026-XXXXX (CVSS 9.8)** — WPScan/NVD, March 2026 | Authentication bypass. Proves the security gap is real and current |
| 2 | **DTAC v2 Framework** — NHS England, April 2026 | Mandatory for NHS procurement. Lighter form = lower barrier to entry |
| 3 | **DSPT v8 2025/26** — NHS England | Independent audit requirement for software suppliers. Plan for year 2 |
| 4 | **Data Use and Access Act 2025** — UK Parliament, in force 5 Feb 2026 | AI cannot make autonomous clinical decisions. Shapes Shifa Bot design |
| 5 | **MHRA SaMD Regulatory Framework** — MHRA 2025-2026 | Clinical AI = Class IIa by 2028. Admin-assist AI avoids this entirely |
| 6 | **NICE Evidence Standards Framework** — NICE 2025 | Core EHR = Tier A (low bar). Clinical AI = Tier B (higher bar) |
| 7 | **SQLite WASM via OPFS** — Official SQLite documentation, 2025 | Production-viable offline database in the browser. Replaces IndexedDB |
| 8 | **PowerSync** — powersync.com, 2025-2026 | MySQL sync backend (beta). Enables SQLite WASM sync with WP database |
| 9 | **Yjs CRDTs** — yjs.dev | Conflict-free collaborative editing. No EHR uses this for encounter notes |
| 10 | **Claude for Healthcare** — Anthropic/AWS, 2025-2026 | BAA-covered AI via AWS Bedrock. Compliant path for Shifa Bot |
| 11 | **UK Digital Health Market Report** — Grand View Research 2025 | £15.46B market, 18.9% CAGR. Validates market size |
| 12 | **Healthcare SaaS Churn Benchmarks** — SaaS Capital 2025 | 7.5% monthly churn. Retention is the real business challenge |
| 13 | **SBRI Healthcare Programme** — Innovate UK | £50-100K Phase 1 grants for NHS-relevant health tech |
| 14 | **BOGO Model in Social Enterprise** — Stanford Social Innovation Review | Buy-one-give-one validated when "give" = "buy" product. Exact model |
| 15 | **FHIR UK Core R4** — HL7 UK / NHS Digital | Interoperability standard. Required for NHS data exchange |
| 16 | **SNOMED CT + ICD-11 Crossmap** — WHO 2024-2025 | Official mapping tables. Supports clinics transitioning from ICD-10 |
| 17 | **Carepatron Competitor Analysis** — carepatron.com | $19-49/mo, solo mental health focus. Not a real competitor for multi-role clinics |
| 18 | **OpenMRS/Bahmni Architecture Review** — openmrs.org | Java server, no Arabic/RTL, requires IT team. Wrong architecture for Gaza |
| 19 | **Community Health Toolkit (CHT)** — medic.org | 85M+ caring activities. True offline-first but not UK/NHS-ready |
| 20 | **WordPress Plugin Security Best Practices** — developer.wordpress.org 2025 | Baseline for fixing the 22 identified security issues |

---

## Summary — What To Do Monday

1. **Open the ROADMAP.md** — Phase 0.4 has the exact file names and line numbers for every security fix
2. **Start with the 3 AJAX handlers that expose PHI** — they are the KiviCare-class vulnerability in your own code
3. **Work through the 15 unprepared queries** — each one is a single-line fix (`$wpdb->prepare()`)
4. **Test plugin activation** — when it activates without fatal errors, Phase 0 is done

Everything else follows from that.
