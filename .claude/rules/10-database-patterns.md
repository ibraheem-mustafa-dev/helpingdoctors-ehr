# Database Patterns

**Project:** Medinova
**Stack:** Drizzle ORM + PostgreSQL 16
**Multi-tenancy:** Schema-per-tenant

---

## Schema Definition

```typescript
// packages/db/src/schema/tenant/patients.ts
import { pgTable, uuid, varchar, date, timestamp, bytea, index } from 'drizzle-orm/pg-core';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(), // UUIDv7 via custom default
  mrn: varchar('mrn', { length: 50 }).notNull().unique(),
  firstNameEnc: bytea('first_name_enc').notNull(),   // AES-256-GCM encrypted
  lastNameEnc: bytea('last_name_enc').notNull(),      // AES-256-GCM encrypted
  nameBlindIndex: varchar('name_blind_index', { length: 64 }), // HMAC-SHA256
  dateOfBirth: date('date_of_birth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by'),
}, (table) => ({
  blindIndexIdx: index('patients_name_blind_idx').on(table.nameBlindIndex),
  deletedAtIdx: index('patients_deleted_at_idx').on(table.deletedAt),
}));
```

---

## Tenant Schema Switching

```typescript
// Every request sets the tenant schema via middleware
async setTenantSchema(db: PostgresJsDatabase, tenantSchema: string): Promise<void> {
  await db.execute(sql`SET search_path TO ${sql.identifier(tenantSchema)}, public`);
}
```

Never hardcode a schema name. Always derive from the authenticated tenant context.

---

## Soft Delete — ALWAYS Filter

```typescript
// CORRECT — excludes soft-deleted records
const activePatients = await db
  .select()
  .from(patients)
  .where(isNull(patients.deletedAt));

// CORRECT — soft delete
await db
  .update(patients)
  .set({ deletedAt: new Date(), deletedBy: userId })
  .where(eq(patients.id, patientId));

// WRONG — returns deleted records
const allPatients = await db.select().from(patients);
```

Every SELECT query on patient data MUST include `where(isNull(table.deletedAt))` unless explicitly retrieving deleted records for audit.

---

## Encrypted Field Pattern

```typescript
// Encrypt before insert
const encFirstName = encryptionService.encrypt(dto.firstName);  // returns Buffer
const blindIndex = encryptionService.blindIndex(dto.firstName); // HMAC-SHA256 hex

await db.insert(patients).values({
  firstNameEnc: encFirstName,
  nameBlindIndex: blindIndex,
});

// Search via blind index (never decrypt to search)
const index = encryptionService.blindIndex(searchTerm);
const results = await db
  .select()
  .from(patients)
  .where(and(eq(patients.nameBlindIndex, index), isNull(patients.deletedAt)));
```

---

## Migrations

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit migrate
```

Never modify existing columns without a migration. Never drop columns — add new ones and deprecate.

---

## Checklist

- [ ] UUIDv7 primary keys on all tables?
- [ ] `deletedAt` column on all patient/clinical tables?
- [ ] `isNull(deletedAt)` in every SELECT?
- [ ] PHI fields stored as encrypted `bytea`?
- [ ] Blind indexes for searchable encrypted fields?
- [ ] Tenant schema set via middleware, never hardcoded?
- [ ] Drizzle for all queries — no raw SQL interpolation?
