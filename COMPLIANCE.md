# Medinova — Compliance Requirements

**Jurisdictions:** UK (primary), EU (secondary), US (alignment)
**Standards:** GDPR, HIPAA (aligned), DTAC, DCB0129, MHRA SaMD

---

## 1. GDPR / UK Data Protection Act 2018

### Lawful Basis for Processing

| Data | Lawful Basis | Retention |
|---|---|---|
| Patient medical records | Legitimate interest (healthcare provision) + explicit consent | 10 years after last contact (NHS standard) |
| Staff employment data | Contract performance | Duration of employment + 6 years |
| Audit logs | Legal obligation (GDPR Art. 30) | 7 years |
| Consent records | Legal obligation | Indefinite (proof of consent) |
| Payment records | Contract performance + legal obligation | 6 years (HMRC) |
| Analytics (anonymised) | Legitimate interest | 2 years |

### Data Subject Rights (built into MVP Module 7)

| Right | Implementation | Response Time |
|---|---|---|
| **Access** (Art. 15) | Self-service data export (JSON, PDF, CSV) | 1 month (automated) |
| **Rectification** (Art. 16) | Patient can request corrections via portal | 1 month |
| **Erasure** (Art. 17) | Soft delete + anonymisation. Medical retention exception applies | 1 month (with exceptions) |
| **Portability** (Art. 20) | FHIR R4 export format | 1 month |
| **Restriction** (Art. 18) | Flag record as restricted, limit access | 72 hours |
| **Objection** (Art. 21) | Opt-out of non-essential processing | 72 hours |

### Medical Retention Exception

GDPR right to erasure does NOT override medical record retention requirements. UK medical records must be retained for:
- Adults: 10 years after last contact
- Children: until 25th birthday (or 26th if entry made when child was 17)
- Mental health: 20 years after last contact

When a patient requests deletion:
1. Remove all non-medical data (marketing preferences, analytics)
2. Anonymise medical records (replace identifiers with pseudonyms)
3. Retain anonymised records for the mandated period
4. Log the request and response in `gdpr_requests` table

### Data Protection Impact Assessment (DPIA)

Required before processing. Document:
- What data is collected and why
- How it flows through the system
- Risk assessment for data subjects
- Mitigations (encryption, access controls, audit)
- Review date (annual)

### Breach Notification

| Timeline | Action |
|---|---|
| 0-24 hours | Internal assessment: scope, severity, affected data subjects |
| 0-72 hours | Notify ICO if risk to individuals (mandatory) |
| Without undue delay | Notify affected individuals if high risk |
| 72 hours+ | Full incident report, remediation plan |

Tracked in `gdpr_requests` table with type `breach`.

---

## 2. HIPAA Alignment

Medinova is not US-based but aligns with HIPAA for two reasons:
1. International credibility (investors, partners, grant assessors)
2. Future US market expansion possibility

### Technical Safeguards

| Requirement | HIPAA Reference | Medinova Implementation |
|---|---|---|
| Encryption at rest | §164.312(a)(2)(iv) | AES-256-GCM for all PHI fields |
| Encryption in transit | §164.312(e)(1) | TLS 1.3, HSTS headers |
| Access controls | §164.312(a)(1) | 27-role RBAC, tenant isolation |
| Audit controls | §164.312(b) | `audit_logs` table, all PHI access logged |
| Integrity controls | §164.312(c)(1) | Soft delete, immutable audit logs |
| Authentication | §164.312(d) | JWT + WebAuthn, MFA option |
| Automatic logoff | §164.312(a)(2)(iii) | 15-min JWT expiry, session timeout |

### Administrative Safeguards

| Requirement | Status |
|---|---|
| Security Officer designated | Bean (to be delegated) |
| Risk analysis conducted | Part of DPIA |
| Workforce training | Document in onboarding guide |
| Incident response plan | Documented in this file |
| Business Associate Agreements | Required for Twilio, AWS (both offer BAAs) |

---

## 3. DTAC v2 (Digital Technology Assessment Criteria)

**What:** NHS England's framework for assessing digital health technologies.
**When:** Submit self-assessment by week 10 (target).
**Why:** Required for NHS procurement catalogue. Early submission = visibility.

### Five Domains

| Domain | Key Requirements | Medinova Status |
|---|---|---|
| **Clinical Safety** | DCB0129 compliance, clinical risk management | Plan in place, document during beta |
| **Data Protection** | GDPR compliance, DPIA, breach procedures | Built into MVP (Module 7) |
| **Technical Security** | Penetration testing, vulnerability management | Pen test before beta launch |
| **Interoperability** | FHIR capability, open standards | Phase 4 (declare as "planned") |
| **Usability & Accessibility** | WCAG 2.2 AA, user testing evidence | Built into all frontend work |

### Self-Assessment Strategy

Submit with honest "planned" answers for items not yet complete. DTAC v2 is a transparency exercise, not a pass/fail gate. NHS procurement checks who is in the pipeline, not who scored perfectly.

Items to mark as "planned for Q3/Q4 2026":
- FHIR UK Core R4 read/write operations
- Independent penetration test results
- User testing with 5+ clinical staff
- ISO 27001 certification

---

## 4. DCB0129 — Clinical Risk Management

**What:** NHS Digital standard for clinical risk management of health IT systems.
**Applies to:** Any system used in clinical settings.

### Requirements

1. **Clinical Safety Officer** — designated person responsible for clinical safety
2. **Clinical Risk Management Plan** — how risks are identified, assessed, mitigated
3. **Hazard Log** — register of all identified clinical hazards
4. **Clinical Safety Case Report** — evidence that risks are acceptable

### Hazard Categories

| Hazard | Severity | Likelihood | Risk | Mitigation |
|---|---|---|---|---|
| Wrong patient record displayed | Catastrophic | Remote | High | MRN + DOB dual verification on every record access |
| Drug interaction missed | Major | Unlikely | Medium | FDA API check mandatory before prescription creation |
| Prescription dosage error | Catastrophic | Unlikely | High | Dosage range validation, pharmacist review workflow |
| Appointment double-booking | Minor | Possible | Low | Database-level unique constraint on provider + timeslot |
| Audit log tampering | Major | Remote | Medium | Immutable append-only logs, separate write permissions |
| Data breach via tenant isolation failure | Catastrophic | Remote | High | Schema-per-tenant, middleware verification, integration tests |

### Timeline

- **Before beta:** Initial hazard log created
- **During beta:** Hazards refined based on real-world usage
- **Before NHS sales:** Full Clinical Safety Case Report

---

## 5. MHRA / SaMD Classification

### Shifa Bot — NOT a Medical Device

Shifa Bot is admin-assist only:
- FAQ responses
- Appointment booking
- Appointment reminders
- General navigation help

Shifa Bot does NOT:
- Diagnose conditions
- Recommend treatments
- Triage patients
- Make clinical decisions
- Interpret test results

**Classification:** Not a medical device. Not subject to MHRA regulation.

### If Shifa Bot Expands to Clinical Assist (Future)

If Shifa Bot ever performs symptom checking, triage, or clinical recommendations:
- **Classification:** Class IIa medical device (MHRA)
- **Requirements:** Full regulatory pathway, clinical evaluation, CE marking
- **Timeline:** 12-18 months regulatory process
- **Decision:** Only pursue after revenue validates the core product

### Data Use and Access Act 2025

In force 5 February 2026. Key requirement: AI cannot make autonomous clinical decisions. All AI outputs in clinical context must be reviewed by a qualified professional before acting on them.

Medinova compliance: Shifa Bot is admin-assist only. No clinical AI = no DUA Act concerns.

---

## 6. Technical Security Controls

### Encryption

| Data State | Method | Key Management |
|---|---|---|
| At rest (PHI) | AES-256-GCM | AWS KMS (per-tenant keys) |
| At rest (database) | RDS encryption | AWS managed |
| At rest (backups) | S3 SSE-KMS | AWS managed |
| In transit | TLS 1.3 | AWS Certificate Manager |
| Passwords | bcrypt (cost 12) | N/A (one-way hash) |

### Access Control

- Schema-per-tenant database isolation
- 27-role RBAC with granular permissions
- JWT access tokens (15 min, non-reusable after refresh)
- WebAuthn passkeys (phishing-resistant)
- Account lockout after 5 failed attempts
- Session timeout: 15 minutes inactive

### Monitoring

- Sentry for application errors (no PHI in error reports)
- CloudWatch for infrastructure metrics
- Audit log analysis for anomaly detection
- Rate limiting: 100 req/min user, 20 req/min auth, 5 req/min for GDPR exports

### Penetration Testing

- Before beta launch: automated scan (OWASP ZAP)
- Before first enterprise client: professional pen test
- Annual: professional pen test + vulnerability assessment

---

## 7. AWS Infrastructure Security

| Control | Implementation |
|---|---|
| Network isolation | VPC with private subnets for RDS and ElastiCache |
| Least privilege | IAM roles per service, no root access keys |
| Encryption | RDS encryption, S3 SSE-KMS, ECS at-rest encryption |
| Logging | CloudTrail for API calls, VPC Flow Logs |
| Backups | RDS automated backups (7 days), S3 cross-region replication |
| DDoS protection | AWS Shield Standard (free), WAF on CloudFront |
| Secrets | AWS Secrets Manager for all credentials |

---

## 8. Compliance Roadmap

| Milestone | Target | Prerequisite |
|---|---|---|
| GDPR built-in (Module 7) | Week 6 | MVP development |
| Initial hazard log (DCB0129) | Week 8 | Clinical workflows defined |
| DTAC v2 self-assessment | Week 10 | Working MVP, initial pen test |
| Automated pen test (OWASP ZAP) | Week 9 | Deployed to AWS |
| Professional pen test | Before first enterprise client | Revenue or grant funding |
| Cyber Essentials Plus | Before first enterprise client | ~£2,500 |
| ISO 27001 | Year 2 | £10-20k, 6-12 month process |
| DSPT (Data Security Protection Toolkit) | Year 2 | Required for NHS trust contracts |
| FHIR UK Core R4 certification | Phase 4 | FHIR module built |
