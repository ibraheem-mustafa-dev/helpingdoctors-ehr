# Shifa Bot

**Project:** Medinova
**Name:** Shifa Bot (NOT "Shafi" or "Shafa")
**Phase:** Phase 3 (weeks 17-24) — NOT in MVP
**Technology:** Claude via AWS Bedrock (BAA available)

---

## What Shifa Bot Is

Admin-assist AI chatbot for clinic staff and patients:
- FAQ answers (clinic hours, directions, policies)
- Appointment booking assistance
- Appointment reminders and follow-up nudges
- Form pre-fill from natural language
- Multi-language support (English, Arabic, 10+ via i18n)

---

## What Shifa Bot Is NOT

Shifa Bot is NOT a clinical tool. It must never:
- Diagnose medical conditions
- Recommend medications or dosages
- Interpret lab results or imaging
- Provide treatment plans
- Triage symptoms (beyond "please call 999 for emergencies")

This keeps Medinova outside MHRA medical device classification (no SaMD burden).

---

## Emergency Handling

Any query mentioning emergency, chest pain, breathing difficulty, suicide, or self-harm:

```typescript
const EMERGENCY_RESPONSE = {
  en: 'This sounds like an emergency. Please call 999 (UK) or your local emergency number immediately. Do not wait.',
  ar: 'يبدو أن هذه حالة طوارئ. يرجى الاتصال بالرقم 999 فورا. لا تنتظر.',
};
```

No follow-up questions. Immediate redirect. Log the interaction for audit.

---

## Credit-Based Billing

| Tier | Monthly Credits | Overage |
|------|----------------|---------|
| Starter (£79/mo) | 500 | Not available |
| Professional (£149/mo) | 2,000 | £0.05/credit |
| Enterprise (£299+/mo) | 10,000 | £0.03/credit |

One credit = one conversational turn. Track via BullMQ job that decrements tenant credit balance.

---

## Architecture

```
Next.js Chat Widget
    -> REST API (POST /api/chat)
        -> ShifaBotService
            -> AWS Bedrock (Claude)
            -> Context: tenant config, appointment slots, FAQ entries
        -> AuditInterceptor (logs all interactions)
```

System prompt includes tenant name, clinic details, and available appointment slots. Never includes patient PHI.

---

## Safety Constraints in System Prompt

```typescript
const SYSTEM_PROMPT = `You are Shifa Bot, an administrative assistant for {{tenantName}}.
You help with scheduling, FAQs, and general clinic information.
You NEVER provide medical advice, diagnoses, or medication recommendations.
If asked about symptoms or medical concerns, say:
"I'm not able to provide medical advice. Please contact your doctor or call the clinic at {{clinicPhone}}."
For emergencies, immediately say: "Please call 999."`;
```

---

## Checklist

- [ ] Admin-assist only — no clinical functionality?
- [ ] Emergency queries redirect to 999 immediately?
- [ ] No PHI in system prompt or chat context?
- [ ] Credit usage tracked per tenant?
- [ ] All interactions logged to audit trail?
- [ ] Phase 3 — not building this in MVP?
