# Medinova — API Reference (MVP)

**Base URL:** `https://api.medinova.health/api/v1` (production TBC)
**Auth:** JWT Bearer token (15 min expiry)
**Contract:** ts-rest (type-safe, shared between frontend and backend)
**Format:** JSON request/response, `application/json` content type

---

## Authentication

All endpoints except `/auth/login` and `/auth/register` require a valid JWT in the `Authorization: Bearer {token}` header. The JWT contains `userId`, `tenantId`, and `roleSlug`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/login` | Email/password login | Public |
| POST | `/auth/register` | New user registration (creates tenant) | Public |
| POST | `/auth/refresh` | Exchange refresh token for new access token | Refresh token |
| POST | `/auth/logout` | Revoke refresh token | Bearer |
| GET | `/auth/me` | Get current user profile + tenant | Bearer |
| POST | `/auth/webauthn/register/begin` | Start WebAuthn passkey registration | Bearer |
| POST | `/auth/webauthn/register/complete` | Complete passkey registration | Bearer |
| POST | `/auth/webauthn/authenticate/begin` | Start passkey authentication | Public |
| POST | `/auth/webauthn/authenticate/complete` | Complete passkey authentication | Public |

### POST /auth/login

```typescript
// Request
{
  email: string;        // Required
  password: string;     // Required
}

// Response 200
{
  accessToken: string;  // JWT, 15 min expiry
  refreshToken: string; // Single-use, 7 day expiry
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    role: string;       // Role slug
  };
}

// Response 401
{ message: "Invalid credentials" }
```

---

## Tenants

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/tenants/current` | Get current tenant details | Any authenticated |
| PUT | `/tenants/current` | Update clinic settings | org_owner, system_admin |
| POST | `/tenants/setup` | Initial clinic setup wizard | org_owner |

---

## Patients

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/patients` | List patients (paginated, searchable) | Clinical + admin roles |
| GET | `/patients/:id` | Get patient detail (decrypted) | Clinical roles |
| POST | `/patients` | Create patient | Clinical + receptionist |
| PUT | `/patients/:id` | Update patient | Clinical roles |
| DELETE | `/patients/:id` | Soft delete patient | physician, medical_director |
| GET | `/patients/:id/encounters` | Patient's encounter history | Clinical roles |
| GET | `/patients/:id/prescriptions` | Patient's prescriptions | Clinical + pharmacy |
| GET | `/patients/:id/appointments` | Patient's appointments | Any authenticated |

### GET /patients

```typescript
// Query params
{
  search?: string;      // Searches first_name_idx, last_name_idx, mrn
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, max: 100
  sortBy?: string;      // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc';
}

// Response 200
{
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### POST /patients

```typescript
// Request
{
  firstName: string;    // Required, encrypted before storage
  lastName: string;     // Required, encrypted before storage
  dateOfBirth: string;  // Required, ISO 8601 date
  gender?: string;
  email?: string;       // Encrypted
  phone?: string;       // Encrypted
  address?: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  allergies?: string[];
  bloodType?: string;
}

// Response 201
{ data: Patient }
```

---

## Appointments

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/appointments` | List appointments (filterable by date, provider, status) | Any authenticated |
| GET | `/appointments/:id` | Get appointment detail | Any authenticated |
| POST | `/appointments` | Create appointment | Receptionist + clinical |
| PUT | `/appointments/:id` | Update appointment | Receptionist + clinical |
| PUT | `/appointments/:id/status` | Update status (check-in, complete, cancel) | Receptionist + clinical |
| GET | `/appointments/available-slots` | Get available time slots | Any authenticated |
| DELETE | `/appointments/:id` | Cancel appointment | Receptionist + clinical |

### GET /appointments/available-slots

```typescript
// Query params
{
  providerId: string;   // Required
  date: string;         // Required, ISO 8601 date
  duration?: number;    // Minutes, default: 15
}

// Response 200
{
  data: Array<{
    startTime: string;  // ISO 8601
    endTime: string;
    available: boolean;
  }>;
}
```

---

## Encounters

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/encounters` | List encounters (filterable) | Clinical roles |
| GET | `/encounters/:id` | Get encounter detail | Clinical roles |
| POST | `/encounters` | Create encounter | Physicians, NPs, PAs |
| PUT | `/encounters/:id` | Update encounter (SOAP, vitals, diagnoses) | Clinical roles |
| POST | `/encounters/:id/sign` | Sign/finalise encounter | Prescribers only |
| POST | `/encounters/:id/vitals` | Record vital signs | Clinical roles |
| POST | `/encounters/:id/diagnoses` | Add diagnosis (ICD-11) | Physicians |

### POST /encounters

```typescript
// Request
{
  patientId: string;        // Required
  appointmentId?: string;   // Optional link to appointment
  chiefComplaint?: string;
  subjective?: string;      // SOAP: S
  objective?: string;       // SOAP: O
  assessment?: string;      // SOAP: A
  plan?: string;            // SOAP: P
  followUpDate?: string;
}

// Response 201
{ data: Encounter }
```

---

## Prescriptions

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/prescriptions` | List prescriptions | Clinical + pharmacy |
| GET | `/prescriptions/:id` | Get prescription detail | Clinical + pharmacy |
| POST | `/prescriptions` | Create prescription | Prescribers only |
| PUT | `/prescriptions/:id` | Update prescription | Prescribers only |
| PUT | `/prescriptions/:id/cancel` | Cancel prescription | Prescribers only |
| GET | `/prescriptions/drug-interactions` | Check drug interactions | Clinical + pharmacy |

### GET /prescriptions/drug-interactions

```typescript
// Query params
{
  drugs: string[];      // Array of drug names to check
  patientId?: string;   // Include patient's current medications
}

// Response 200
{
  data: {
    interactions: Array<{
      drug1: string;
      drug2: string;
      severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
      description: string;
      source: string;    // 'FDA' or 'local_db'
    }>;
    checked: boolean;
  };
}
```

---

## ICD-11 Codes

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/icd11/search` | Search ICD-11 codes | Clinical roles |
| GET | `/icd11/:code` | Get code details | Clinical roles |
| GET | `/icd11/:code/crossmap` | Get ICD-10 equivalent | Clinical roles |

### GET /icd11/search

```typescript
// Query params
{
  query: string;        // Search term
  language?: string;    // Default: 'en', supports 'ar'
  limit?: number;       // Default: 10
}

// Response 200
{
  data: Array<{
    code: string;       // ICD-11 code
    title: string;
    icd10Equivalent?: string;
  }>;
}
```

---

## Messages

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/messages/threads` | List message threads | Any authenticated |
| GET | `/messages/threads/:id` | Get thread with messages (decrypted) | Thread participants |
| POST | `/messages/threads` | Create new thread | Any authenticated |
| POST | `/messages/threads/:id/messages` | Send message in thread | Thread participants |
| PUT | `/messages/:id/read` | Mark message as read | Thread participants |
| GET | `/messages/unread-count` | Get unread message count | Any authenticated |

---

## GDPR

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/gdpr/consents/:patientId` | Get patient's consent history | Clinical + admin |
| POST | `/gdpr/consents` | Record consent | Clinical + receptionist |
| PUT | `/gdpr/consents/:id/revoke` | Revoke consent | Patient (via portal) or admin |
| POST | `/gdpr/requests` | Create data access/deletion request | Patient or admin |
| GET | `/gdpr/requests` | List GDPR requests | Admin roles |
| PUT | `/gdpr/requests/:id/process` | Process a GDPR request | system_admin, medical_records |
| GET | `/gdpr/export/:patientId` | Export patient data (JSON/PDF/CSV) | system_admin + patient consent |

---

## Audit

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/audit/logs` | List audit logs (filterable) | system_admin, medical_director |
| GET | `/audit/logs/:id` | Get audit log detail | system_admin |
| GET | `/audit/patient/:patientId` | Audit trail for specific patient | system_admin, medical_director |

### GET /audit/logs

```typescript
// Query params
{
  userId?: string;
  resourceType?: string;  // patient/encounter/prescription/message
  action?: string;        // create/read/update/delete
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
```

---

## Data Import

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/import/csv/upload` | Upload CSV file | system_admin, medical_records |
| POST | `/import/csv/preview` | Preview import mapping | system_admin |
| POST | `/import/csv/execute` | Execute import | system_admin |
| POST | `/import/fhir` | Import FHIR R4 bundle | system_admin |
| GET | `/import/logs` | List import history | system_admin |
| GET | `/import/logs/:id` | Get import detail with errors | system_admin |

---

## Common Response Patterns

### Success

```typescript
// Single item
{ data: T }

// List with pagination
{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error

```typescript
{
  statusCode: number;
  message: string;          // User-friendly message
  error?: string;           // Error code (e.g., 'PATIENT_NOT_FOUND')
  details?: object;         // Validation errors (field-level)
}
```

### Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1711234567
```

---

## Endpoint Summary

| Module | Endpoints | Notes |
|---|---|---|
| Auth | 9 | Includes WebAuthn passkeys |
| Tenants | 3 | Clinic setup and settings |
| Patients | 8 | Encrypted search via blind index |
| Appointments | 7 | Includes availability slots |
| Encounters | 7 | SOAP format, vitals, diagnoses |
| Prescriptions | 6 | Drug interaction checking |
| ICD-11 | 3 | WHO API + ICD-10 crossmap |
| Messages | 6 | AES-256-GCM encrypted |
| GDPR | 7 | Consent, export, deletion |
| Audit | 3 | Compliance trail |
| Data Import | 6 | CSV + FHIR R4 |
| **Total** | **65** | |
