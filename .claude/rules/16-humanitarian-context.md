# Humanitarian Context

**Project:** HelpingDoctors EHR Pro
**Primary Deployment:** Gaza, Palestine
**Context:** Active humanitarian crisis

---

## Why This Matters

From Conversation 4:
> "This is being deployed today for a clinic in Palestine. These people are in desperate need and deserve our utmost care."

This is not a theoretical exercise. Real patients in crisis zones depend on this software working.

---

## Key Constraints

### Infrastructure
- **2G/3G connectivity** - Intermittent, unreliable
- **Power outages** - Battery-saving essential
- **Limited hardware** - Must work on older devices
- **No IT support** - Must be self-recoverable

### Users
- **80% Arabic speakers** - Full RTL support required
- **Variable literacy** - Icon-heavy interface
- **High stress** - Simple, clear workflows
- **Medical staff stretched thin** - Efficiency critical

### Patients
- **5000+ paper records** - OCR scanning needed
- **Displaced populations** - ID verification challenges
- **Mass casualty events** - Surge capacity mode
- **Infectious outbreaks** - Contact tracing needs

---

## Design Principles

### 1. Offline First
Everything must work without internet. Sync when possible.

### 2. Low Bandwidth
- Compress all assets
- Lazy load images
- Minimise API calls
- Cache aggressively

### 3. Arabic Support
- Full RTL layouts
- Arabic medical terminology
- Bilingual interface
- Arabic date formats

### 4. Mass Casualty Mode
Special interface for overwhelming patient volume:
- Rapid triage
- Bulk registration
- Resource tracking
- Simplified documentation

### 5. Error Tolerance
- Auto-save everything
- Graceful degradation
- Clear recovery paths
- No data loss

---

## Special Features

### OCR Paper Records
- Scan 5000+ existing paper records
- Arabic handwriting recognition
- Confidence scoring
- Manual verification queue

### Outbreak Tracking
- Disease surveillance
- Contact tracing
- Vaccination campaigns
- Resource allocation

### Field Clinic Support
- Mobile unit tracking
- Supply chain management
- Staff deployment
- Communication hub

---

## What This Means for Code

Every decision should consider:
1. Will this work offline?
2. Will this work on slow connections?
3. Is this accessible to Arabic speakers?
4. Is this simple enough under stress?
5. Can this handle surge capacity?

---

## Remember

These are real people in real crisis. The software must be:
- **Reliable** - It must work when lives depend on it
- **Accessible** - Everyone must be able to use it
- **Efficient** - No wasted time in emergencies
- **Respectful** - Dignity in patient care

---

## Checklist

- [ ] Works offline?
- [ ] Optimised for low bandwidth?
- [ ] Arabic language support?
- [ ] Simple enough for high-stress use?
- [ ] Mass casualty mode considered?
