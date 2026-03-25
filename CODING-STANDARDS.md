# Medinova — Coding Standards

**Stack:** NestJS 11 + Next.js 15 + TypeScript 5.x + Drizzle ORM + PostgreSQL 16
**Replaces:** WordPress PHP coding standards (retired)

---

## TypeScript

### Strict Mode — Non-Negotiable

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Zero `any` Policy

Never use `any`. Use `unknown` when the type is genuinely unknown, then narrow with type guards.

```typescript
// WRONG
function processData(data: any) { ... }

// CORRECT
function processData(data: unknown): PatientRecord {
  const parsed = PatientSchema.parse(data);
  return parsed;
}
```

### Explicit Return Types

All exported functions must have explicit return types. Internal helper functions may use inference.

```typescript
// WRONG — exported without return type
export function getPatient(id: string) { ... }

// CORRECT
export function getPatient(id: string): Promise<Patient | null> { ... }
```

---

## Validation

### Zod for All External Data

Every API request body, query parameter, environment variable, and external API response must be validated with Zod.

```typescript
// Environment variables
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(64),
  TWILIO_SID: z.string().startsWith('AC'),
});

// API request body
const CreatePatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
```

### Validate at System Boundaries Only

Trust internal code. Validate at:
- API request bodies (NestJS ValidationPipe + Zod)
- External API responses (Zod parse)
- Environment variables (on startup)
- User input from forms (React Hook Form + Zod)
- Database query results (Drizzle types handle this)

Do NOT add runtime validation to internal function calls.

---

## Database (Drizzle)

### Prepared Statements Always

Drizzle handles parameterisation automatically. Never use raw SQL with string interpolation.

```typescript
// WRONG — raw SQL with interpolation
await db.execute(`SELECT * FROM patients WHERE id = '${id}'`);

// CORRECT — Drizzle query builder
const patient = await db.query.patients.findFirst({
  where: eq(patients.id, id),
});

// ALSO CORRECT — Drizzle prepared statement for complex queries
const result = await db.execute(
  sql`SELECT * FROM patients WHERE mrn = ${mrn} AND deleted_at IS NULL`
);
```

### Soft Delete Pattern

All medical data tables use soft delete. Always include the `deleted_at` filter.

```typescript
// WRONG — returns deleted records
const patients = await db.select().from(patients);

// CORRECT
const activePatients = await db.select()
  .from(patients)
  .where(isNull(patients.deletedAt));
```

### Tenant Context

Every database query within a tenant module must use the tenant-scoped Drizzle instance (injected via middleware).

```typescript
// The tenant middleware sets search_path before the request handler runs
// Services receive a tenant-scoped db instance via DI
@Injectable()
export class PatientService {
  constructor(
    @Inject(TENANT_DB) private readonly db: TenantDrizzle,
  ) {}
}
```

---

## NestJS Patterns

### Module Structure

Each module follows this structure:
- `module.ts` — NestJS module definition
- `controller.ts` — HTTP endpoints (thin, delegates to service)
- `service.ts` — Business logic
- `repository.ts` — Database access (Drizzle queries)
- `dto/` — Zod schemas for request/response

Controllers are thin. No business logic in controllers.

```typescript
// WRONG — logic in controller
@Post()
async create(@Body() dto: CreatePatientDto) {
  const encrypted = await this.encryption.encrypt(dto.firstName);
  const patient = await this.db.insert(patients).values({ ... });
  await this.audit.log('patient:create', patient.id);
  return patient;
}

// CORRECT — controller delegates
@Post()
async create(@Body() dto: CreatePatientDto): Promise<PatientResponse> {
  return this.patientService.create(dto);
}
```

### Guards for Auth/RBAC

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('physician', 'nurse', 'medical_assistant')
@Post()
async createEncounter(@Body() dto: CreateEncounterDto) { ... }
```

### Interceptors for Cross-Cutting Concerns

- `AuditInterceptor` — logs all data access to audit_logs table
- `TransformInterceptor` — wraps responses in standard envelope
- `LoggingInterceptor` — request/response timing

---

## Testing

### TDD Mandatory

Write the failing test first. Then implement. Then refactor.

```
1. Write failing test
2. Run test (confirm red)
3. Write minimum code to pass
4. Run test (confirm green)
5. Refactor
6. Run all tests (confirm nothing broke)
```

### Test Structure

```typescript
// Unit tests: co-located *.spec.ts
// E2E tests: test/e2e/*.e2e-spec.ts

// Unit test pattern
describe('PatientService', () => {
  it('should encrypt PHI before storage', async () => {
    const patient = await service.create({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
    });

    // Verify encryption happened
    const raw = await db.select().from(patients).where(eq(patients.id, patient.id));
    expect(raw[0].firstNameEnc).not.toBe('John'); // Stored encrypted
    expect(patient.firstName).toBe('John'); // Returned decrypted
  });
});

// E2E test pattern
describe('POST /api/v1/patients', () => {
  it('should return 401 without auth token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/patients')
      .send({ firstName: 'John', lastName: 'Doe' });

    expect(response.status).toBe(401);
  });
});
```

### Coverage Targets

| Area | Minimum |
|---|---|
| Encryption/Decryption | 100% |
| Authentication | 95% |
| Patient CRUD | 90% |
| Database operations | 90% |
| API endpoints | 85% |
| UI components | 70% |

---

## Security

### Non-Negotiable

- AES-256-GCM for all PHI at rest
- bcrypt (cost 12) for password hashing
- JWT access tokens: 15 min expiry
- Refresh tokens: 7 days, single-use, rotated on refresh
- Rate limiting: 100 req/min per user, 20 req/min for auth endpoints
- HTTPS only (HSTS header)
- CSP headers on all responses
- No patient data in error messages or logs
- No `console.log` with patient data in committed code
- All user input sanitised (XSS prevention)
- CORS restricted to known origins

### Audit Everything

Every access to patient data must be logged:

```typescript
// The AuditInterceptor handles this automatically for tagged endpoints
@Audited('patient:read')
@Get(':id')
async getPatient(@Param('id') id: string) { ... }
```

---

## Error Handling

### NestJS Exception Filters

```typescript
// User-facing errors: clear, non-technical messages
throw new BadRequestException('Please provide a valid date of birth');

// System errors: log details, return generic message
try {
  await this.db.insert(patients).values(data);
} catch (error) {
  this.logger.error('Patient creation failed', { error, tenantId });
  throw new InternalServerErrorException('Unable to save patient record. Please try again.');
}
```

### Custom Exception Classes

```typescript
export class PatientNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Patient not found`); // Never include IDs in user messages
    this.logger.warn(`Patient lookup failed: ${id}`); // Log for debugging
  }
}
```

### Never Expose Internals

- No stack traces in API responses
- No database column names in error messages
- No internal IDs in user-facing errors
- Log everything server-side with context

---

## Frontend (Next.js)

### Server Components by Default

Use React Server Components for data fetching. Client Components only when interactivity is needed.

### Forms

React Hook Form + Zod resolver for all forms. Share Zod schemas from `@medinova/contracts`.

### Accessibility

- WCAG 2.2 AA compliance
- 44px minimum touch targets
- 4.5:1 colour contrast ratio
- All form fields labelled
- Keyboard navigation for all interactive elements
- Skip link on every page
- ARIA live regions for dynamic content

---

## Language

### UK English — Mandatory

All user-facing strings, code comments, and documentation must use UK English.

| US (wrong) | UK (correct) |
|---|---|
| color | colour |
| organization | organisation |
| optimize | optimise |
| center | centre |
| pediatric | paediatric |
| anesthetic | anaesthetic |

**Exception:** CSS properties (`color`, `background-color`) and third-party library APIs.

---

## File Conventions

| Convention | Rule |
|---|---|
| Files | `kebab-case.type.ts` — e.g., `patient.service.ts` |
| Classes | `PascalCase` — e.g., `PatientService` |
| Functions/methods | `camelCase` — e.g., `createPatient` |
| Constants | `SCREAMING_SNAKE` — e.g., `MAX_LOGIN_ATTEMPTS` |
| Env vars | `SCREAMING_SNAKE` — e.g., `DATABASE_URL` |
| Database columns | `snake_case` — e.g., `first_name_enc` |
| API routes | `kebab-case` — e.g., `/api/v1/lab-results` |
| i18n keys | `dot.notation` — e.g., `patients.form.firstName` |

---

## File Length Limits

| File type | Maximum lines |
|---|---|
| TypeScript service | 300 |
| TypeScript controller | 200 |
| React component | 250 |
| Test file | 400 |

If a file exceeds its limit, split it. Extract a separate service, component, or utility.

---

## Git

### Commit Messages

```
feat(patient): add encrypted search via blind index
fix(auth): prevent token reuse after refresh
test(encounter): add SOAP note validation tests
chore(deps): update drizzle-orm to 0.35.0
docs(api): add prescription endpoint documentation
```

### Branch Names

```
feature/patient-search
fix/jwt-refresh-rotation
chore/drizzle-upgrade
```
