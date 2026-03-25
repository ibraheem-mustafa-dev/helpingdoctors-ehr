# Medical Data Security

**Project:** Medinova
**Compliance:** GDPR, HIPAA-aligned, UK DPA 2018
**Stack:** NestJS 11 + Drizzle ORM + PostgreSQL 16

---

## Core Principles

1. **Encrypt at rest** — AES-256-GCM for all PHI (per-tenant keys via AWS KMS)
2. **Audit everything** — All PHI access auto-logged via NestJS Interceptor
3. **Soft delete** — Never hard delete medical records
4. **Minimum privilege** — 27 RBAC roles enforced via NestJS Guards

---

## EncryptionService

```typescript
// apps/api/src/modules/security/encryption.service.ts
@Injectable()
export class EncryptionService {
  async encrypt(plaintext: string, tenantId: string): Promise<EncryptedField> {
    const key = await this.getKey(tenantId); // AWS KMS
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { encrypted, iv, tag }; // stored as bytea columns
  }

  async decrypt(field: EncryptedField, tenantId: string): Promise<string> {
    const key = await this.getKey(tenantId);
    const decipher = createDecipheriv('aes-256-gcm', key, field.iv);
    decipher.setAuthTag(field.tag);
    return decipher.update(field.encrypted) + decipher.final('utf8');
  }
}
```

### What MUST be encrypted (bytea columns)
- Patient names, contact info, addresses
- Medical conditions, diagnoses, prescriptions
- Lab results, clinical notes
- Any PII / PHI

### What stays plain text
- Appointment times (without patient details), system config, anonymised statistics

---

## Audit Logging — @Audited() Decorator

```typescript
// Usage on any controller method that accesses PHI
@Get(':id')
@Roles('physician', 'registered_nurse')
@Audited('patient_record_viewed')
async getPatient(@Param('id') id: string) {
  return this.patientService.findById(id);
}

// The AuditInterceptor auto-captures:
// - action, userId, tenantId, patientId, IP, timestamp, userAgent
// - Writes to audit_logs table in tenant schema
```

### Actions that MUST be audited
- Patient record access (view, edit, create)
- Prescription creation/modification
- Login/logout, failed auth attempts
- Permission changes, data exports
- GDPR subject access requests

---

## Soft Delete — Drizzle Pattern

```typescript
// Every patient-data query MUST filter soft deletes
const patients = await db
  .select()
  .from(schema.patients)
  .where(isNull(schema.patients.deletedAt)); // ALWAYS

// Soft delete — never use db.delete() on medical records
await db
  .update(schema.patients)
  .set({ deletedAt: new Date(), deletedBy: userId })
  .where(eq(schema.patients.id, patientId));
```

**Hard rule:** If you write a Drizzle query on any patient/clinical table without `.where(isNull(...deletedAt))`, it is a bug.

---

## RBAC — NestJS Guards

```typescript
// Controller-level role protection
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  @Get()
  @Roles('physician', 'registered_nurse', 'medical_assistant')
  findAll() { /* ... */ }

  @Post()
  @Roles('physician', 'receptionist')
  create(@Body() dto: CreatePatientDto) { /* ... */ }
}
```

Use the 27 roles from the RBAC system. Never bypass Guards with hardcoded checks.

---

## Blind Index Search

```typescript
// Searchable encrypted fields use HMAC-SHA256 blind indexes
const blindIndex = createHmac('sha256', tenantHmacKey)
  .update(searchTerm.toLowerCase().trim())
  .digest('hex');

const results = await db
  .select()
  .from(schema.patients)
  .where(and(
    eq(schema.patients.nameBlindIndex, blindIndex),
    isNull(schema.patients.deletedAt),
  ));
```

---

## Checklist

- [ ] PHI fields encrypted via EncryptionService?
- [ ] Controller method decorated with @Audited()?
- [ ] Soft delete only — no db.delete() on clinical tables?
- [ ] @Roles() guard on every endpoint?
- [ ] deletedAt IS NULL in every patient-data query?
- [ ] Blind indexes for searchable encrypted fields?
