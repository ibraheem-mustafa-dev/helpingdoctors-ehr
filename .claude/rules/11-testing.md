# Testing Requirements

**Project:** Medinova
**Methodology:** Test-Driven Development (TDD)
**Tools:** Jest + Supertest (backend), Vitest + Testing Library (frontend)

---

## TDD Workflow (Mandatory)

```
1. Write failing test
2. Run test — confirm red
3. Write minimum code to pass
4. Run test — confirm green
5. Refactor
6. Run full suite — confirm nothing broke
```

---

## Backend — NestJS Unit Test

```typescript
describe('PatientService', () => {
  let service: PatientService;
  let db: PostgresJsDatabase;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PatientService,
        EncryptionService,
        { provide: DRIZZLE_TOKEN, useValue: testDb },
      ],
    }).compile();
    service = module.get(PatientService);
  });

  it('should throw ValidationException when MRN is missing', async () => {
    await expect(service.create({ firstName: 'John' } as CreatePatientDto))
      .rejects.toThrow(ValidationException);
  });

  it('should soft-delete and exclude from queries', async () => {
    const patient = await service.create(validPatientDto);
    await service.softDelete(patient.id, adminUserId);
    const found = await service.findById(patient.id);
    expect(found).toBeNull();
  });
});
```

---

## Backend — E2E Test (Supertest)

```typescript
describe('POST /api/patients', () => {
  it('should return 401 without auth token', async () => {
    await request(app.getHttpServer())
      .post('/api/patients')
      .send(validPatientDto)
      .expect(401);
  });

  it('should create patient and return 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPatientDto)
      .expect(201);
    expect(res.body.data.mrn).toBeDefined();
  });
});
```

---

## Frontend — React Testing Library

```typescript
describe('PatientSearchBar', () => {
  it('should display results when user types', async () => {
    render(<PatientSearchBar />);
    await userEvent.type(screen.getByRole('searchbox'), 'Ahmed');
    expect(await screen.findByText('Ahmed Hassan')).toBeInTheDocument();
  });

  it('should show empty state when no results', async () => {
    render(<PatientSearchBar />);
    await userEvent.type(screen.getByRole('searchbox'), 'zzzzz');
    expect(await screen.findByText(/no patients found/i)).toBeInTheDocument();
  });
});
```

---

## Test Database — No Mocking

Use a real PostgreSQL test database with tenant schema. No mocking Drizzle queries.

```typescript
// test/setup.ts
beforeAll(async () => {
  await testDb.execute(sql`CREATE SCHEMA IF NOT EXISTS test_tenant`);
  await testDb.execute(sql`SET search_path TO test_tenant, public`);
  await migrate(testDb, { migrationsFolder: './drizzle' });
});

afterAll(async () => {
  await testDb.execute(sql`DROP SCHEMA test_tenant CASCADE`);
});
```

Mock only external services: Twilio, WHO ICD-11 API, AWS Bedrock, SES.

---

## Coverage Targets

| Area | Minimum |
|------|---------|
| Encryption service | 100% |
| Auth + RBAC | 95% |
| Patient CRUD | 90% |
| Database operations | 90% |
| API endpoints | 85% |
| React components | 80% |

---

## Commands

```bash
pnpm test              # Run all tests
pnpm test:api          # Backend unit + e2e
pnpm test:web          # Frontend unit
pnpm test:cov          # Coverage report
pnpm lint              # ESLint
pnpm typecheck         # tsc --noEmit
```

---

## Checklist

- [ ] New code has tests written FIRST (red-green-refactor)?
- [ ] External services mocked, database real?
- [ ] Coverage meets targets?
- [ ] `pnpm lint && pnpm typecheck && pnpm test` all pass?
