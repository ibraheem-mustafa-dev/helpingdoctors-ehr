# Medinova — Database Schema (MVP)

**Engine:** PostgreSQL 16
**ORM:** Drizzle
**Multi-tenancy:** Schema-per-tenant
**Source:** Mined from 78+ PHP table definitions in HelpingDoctors EHR Pro codebase

---

## Multi-Tenancy Design

```
public schema (shared):
  - tenants          # Clinic/organisation records
  - users            # All users across all tenants
  - roles            # 27 medical role definitions
  - permissions      # Role-permission mappings
  - user_tenants     # User↔Tenant assignments

tenant_{id} schema (per-tenant):
  - patients         # Patient records (encrypted PHI)
  - appointments     # Scheduling
  - encounters       # Clinical visits
  - prescriptions    # Medications
  - medications      # Drug catalogue entries per prescription
  - vital_signs      # Vitals recorded during encounters
  - diagnoses        # ICD-11 codes per encounter
  - messages         # Encrypted staff messaging
  - message_threads  # Conversation grouping
  - notifications    # SMS/email delivery log
  - staff_schedules  # Provider availability
  - audit_logs       # GDPR/HIPAA audit trail
  - gdpr_consents    # Patient consent records
  - gdpr_requests    # Data access/deletion requests
  - documents        # Medical document metadata
  - import_logs      # Data import tracking
```

**Total: 6 shared tables + 16 per-tenant tables = 22 MVP tables**

---

## Shared Schema (public)

### tenants

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | varchar(255) | NOT NULL | Clinic/organisation name |
| slug | varchar(100) | NOT NULL, UNIQUE | URL-safe identifier |
| schema_name | varchar(63) | NOT NULL, UNIQUE | PostgreSQL schema name |
| address | jsonb | | {line1, line2, city, postcode, country} |
| phone | varchar(20) | | |
| email | varchar(255) | | |
| logo_url | text | | S3 path |
| settings | jsonb | DEFAULT '{}' | Clinic-specific config |
| subscription_tier | varchar(20) | DEFAULT 'starter' | starter/professional/enterprise |
| subscription_status | varchar(20) | DEFAULT 'trial' | trial/active/cancelled/suspended |
| trial_ends_at | timestamptz | | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |
| deleted_at | timestamptz | | Soft delete |

### users

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| email | varchar(255) | NOT NULL, UNIQUE | Login identifier |
| password_hash | varchar(255) | NOT NULL | bcrypt |
| first_name | varchar(100) | NOT NULL | |
| last_name | varchar(100) | NOT NULL | |
| phone | varchar(20) | | |
| avatar_url | text | | S3 path |
| locale | varchar(10) | DEFAULT 'en' | Preferred language |
| is_active | boolean | DEFAULT true | |
| email_verified_at | timestamptz | | |
| last_login_at | timestamptz | | |
| failed_login_count | integer | DEFAULT 0 | Lockout after 5 |
| locked_until | timestamptz | | |
| webauthn_credentials | jsonb | DEFAULT '[]' | Passkey data |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### roles

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| slug | varchar(50) | NOT NULL, UNIQUE | e.g., 'physician', 'nurse', 'receptionist' |
| name | varchar(100) | NOT NULL | Display name |
| template_group | varchar(50) | NOT NULL | 1 of 13 groups |
| permissions | jsonb | NOT NULL | Array of permission strings |
| is_clinical | boolean | DEFAULT false | Can access patient records |
| is_prescriber | boolean | DEFAULT false | Can prescribe medications |
| sort_order | integer | DEFAULT 0 | |

### permissions

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| slug | varchar(100) | NOT NULL, UNIQUE | e.g., 'patient:read', 'encounter:write' |
| name | varchar(255) | NOT NULL | |
| module | varchar(50) | NOT NULL | Which module this belongs to |

### user_tenants

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → users.id, NOT NULL | |
| tenant_id | uuid | FK → tenants.id, NOT NULL | |
| role_id | integer | FK → roles.id, NOT NULL | |
| licence_number | varchar(50) | | Professional licence |
| specialisation | varchar(100) | | |
| is_primary | boolean | DEFAULT false | User's primary clinic |
| joined_at | timestamptz | DEFAULT now() | |
| left_at | timestamptz | | Soft removal |

**Index:** UNIQUE (user_id, tenant_id)

---

## Tenant Schema (tenant_{id})

### patients

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| mrn | varchar(20) | NOT NULL, UNIQUE | Auto-generated Medical Record Number |
| first_name_enc | bytea | NOT NULL | AES-256-GCM encrypted |
| last_name_enc | bytea | NOT NULL | Encrypted |
| first_name_idx | varchar(64) | NOT NULL | Blind index for search (HMAC) |
| last_name_idx | varchar(64) | NOT NULL | Blind index for search |
| date_of_birth | date | NOT NULL | |
| gender | varchar(20) | | |
| email_enc | bytea | | Encrypted |
| phone_enc | bytea | | Encrypted |
| address | jsonb | | Encrypted at field level |
| emergency_contacts | jsonb | DEFAULT '[]' | |
| insurance | jsonb | | |
| allergies | jsonb | DEFAULT '[]' | |
| blood_type | varchar(5) | | |
| photo_url | text | | S3 path |
| notes | text | | |
| consent_status | jsonb | DEFAULT '{}' | GDPR consent flags |
| created_by | uuid | FK → public.users.id | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |
| deleted_at | timestamptz | | Soft delete |
| deleted_by | uuid | | |

**Indexes:** mrn, first_name_idx, last_name_idx, date_of_birth, deleted_at

### appointments

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| patient_id | uuid | FK → patients.id, NOT NULL | |
| provider_id | uuid | FK → public.users.id, NOT NULL | Assigned doctor/nurse |
| start_time | timestamptz | NOT NULL | |
| end_time | timestamptz | NOT NULL | |
| status | varchar(20) | DEFAULT 'scheduled' | scheduled/checked_in/in_progress/completed/no_show/cancelled |
| type | varchar(50) | DEFAULT 'consultation' | consultation/follow_up/emergency/procedure |
| reason | text | | Chief complaint |
| notes | text | | Internal notes |
| reminder_sent | boolean | DEFAULT false | |
| reminder_sent_at | timestamptz | | |
| cancelled_at | timestamptz | | |
| cancelled_by | uuid | | |
| cancellation_reason | text | | |
| created_by | uuid | NOT NULL | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** patient_id, provider_id, start_time, status, (provider_id, start_time) for availability

### encounters

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| patient_id | uuid | FK → patients.id, NOT NULL | |
| provider_id | uuid | FK → public.users.id, NOT NULL | |
| appointment_id | uuid | FK → appointments.id | Optional link |
| status | varchar(20) | DEFAULT 'in_progress' | in_progress/completed/amended/locked |
| encounter_date | timestamptz | DEFAULT now() | |
| chief_complaint | text | | |
| subjective | text | | SOAP: S |
| objective | text | | SOAP: O |
| assessment | text | | SOAP: A |
| plan | text | | SOAP: P |
| follow_up_date | date | | |
| follow_up_notes | text | | |
| signed_by | uuid | | Provider who finalised |
| signed_at | timestamptz | | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:** patient_id, provider_id, encounter_date, status

### vital_signs

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| encounter_id | uuid | FK → encounters.id, NOT NULL | |
| patient_id | uuid | FK → patients.id, NOT NULL | |
| systolic_bp | integer | | mmHg |
| diastolic_bp | integer | | mmHg |
| heart_rate | integer | | bpm |
| temperature | decimal(4,1) | | Celsius |
| respiratory_rate | integer | | breaths/min |
| spo2 | integer | | Percentage |
| weight_kg | decimal(5,1) | | |
| height_cm | decimal(5,1) | | |
| bmi | decimal(4,1) | | GENERATED ALWAYS AS (weight_kg / (height_cm/100)^2) |
| pain_score | integer | | 0-10 |
| notes | text | | |
| recorded_by | uuid | NOT NULL | |
| recorded_at | timestamptz | DEFAULT now() | |

### diagnoses

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| encounter_id | uuid | FK → encounters.id, NOT NULL | |
| patient_id | uuid | FK → patients.id, NOT NULL | |
| icd11_code | varchar(20) | NOT NULL | Primary: ICD-11 |
| icd10_code | varchar(20) | | Crossmap for transitioning clinics |
| description | text | NOT NULL | |
| type | varchar(20) | DEFAULT 'primary' | primary/secondary/differential |
| status | varchar(20) | DEFAULT 'active' | active/resolved/chronic |
| onset_date | date | | |
| resolved_date | date | | |
| notes | text | | |
| created_at | timestamptz | DEFAULT now() | |

### prescriptions

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| encounter_id | uuid | FK → encounters.id | |
| patient_id | uuid | FK → patients.id, NOT NULL | |
| prescriber_id | uuid | FK → public.users.id, NOT NULL | |
| status | varchar(20) | DEFAULT 'active' | active/completed/cancelled/expired |
| notes | text | | |
| is_controlled | boolean | DEFAULT false | Controlled substance |
| pharmacy_notes | text | | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

### medications

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| prescription_id | uuid | FK → prescriptions.id, NOT NULL | |
| drug_name | varchar(255) | NOT NULL | |
| dosage | varchar(100) | NOT NULL | e.g., '500mg' |
| frequency | varchar(100) | NOT NULL | e.g., 'twice daily' |
| route | varchar(50) | DEFAULT 'oral' | oral/iv/im/topical/inhaled |
| duration | varchar(100) | | e.g., '7 days' |
| quantity | integer | | |
| refills_allowed | integer | DEFAULT 0 | |
| refills_used | integer | DEFAULT 0 | |
| instructions | text | | Patient instructions |
| contraindications | text | | |
| interaction_checked | boolean | DEFAULT false | FDA API check done |
| interaction_result | jsonb | | API response |
| start_date | date | NOT NULL | |
| end_date | date | | |
| created_at | timestamptz | DEFAULT now() | |

### messages

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| thread_id | uuid | FK → message_threads.id, NOT NULL | |
| sender_id | uuid | FK → public.users.id, NOT NULL | |
| body_enc | bytea | NOT NULL | AES-256-GCM encrypted |
| attachments | jsonb | DEFAULT '[]' | [{filename, url, size}] |
| read_by | jsonb | DEFAULT '[]' | [{user_id, read_at}] |
| created_at | timestamptz | DEFAULT now() | |
| deleted_at | timestamptz | | Soft delete |

### message_threads

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| subject | varchar(255) | | |
| participants | uuid[] | NOT NULL | Array of user IDs |
| is_archived | boolean | DEFAULT false | |
| last_message_at | timestamptz | | |
| created_at | timestamptz | DEFAULT now() | |

### notifications

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | | Null for patient notifications |
| patient_id | uuid | FK → patients.id | |
| type | varchar(50) | NOT NULL | sms/email/in_app |
| channel | varchar(50) | NOT NULL | twilio/ses/internal |
| subject | varchar(255) | | |
| body | text | NOT NULL | |
| status | varchar(20) | DEFAULT 'pending' | pending/sent/delivered/failed |
| external_id | varchar(255) | | Twilio message SID / SES message ID |
| error_message | text | | |
| sent_at | timestamptz | | |
| delivered_at | timestamptz | | |
| created_at | timestamptz | DEFAULT now() | |

### staff_schedules

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → public.users.id, NOT NULL | |
| day_of_week | integer | NOT NULL | 0=Sunday, 6=Saturday |
| start_time | time | NOT NULL | |
| end_time | time | NOT NULL | |
| break_start | time | | |
| break_end | time | | |
| slot_duration_min | integer | DEFAULT 15 | |
| is_active | boolean | DEFAULT true | |
| effective_from | date | DEFAULT CURRENT_DATE | |
| effective_until | date | | |
| created_at | timestamptz | DEFAULT now() | |

### audit_logs

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | NOT NULL | Who performed the action |
| action | varchar(50) | NOT NULL | create/read/update/delete/export/login |
| resource_type | varchar(50) | NOT NULL | patient/encounter/prescription/message |
| resource_id | uuid | | |
| details | jsonb | | {before, after, fields_changed} |
| ip_address | inet | NOT NULL | |
| user_agent | text | | |
| risk_score | integer | DEFAULT 0 | 0-100, higher = more suspicious |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** user_id, resource_type + resource_id, created_at, action
**Partition:** By month on created_at (for performance at scale)

### gdpr_consents

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| patient_id | uuid | FK → patients.id, NOT NULL | |
| consent_type | varchar(50) | NOT NULL | treatment/data_sharing/research/communications |
| granted | boolean | NOT NULL | |
| granted_at | timestamptz | NOT NULL | |
| revoked_at | timestamptz | | |
| version | varchar(20) | NOT NULL | Policy version consented to |
| ip_address | inet | | |
| method | varchar(20) | DEFAULT 'web' | web/paper/verbal |
| created_at | timestamptz | DEFAULT now() | |

### gdpr_requests

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| patient_id | uuid | FK → patients.id, NOT NULL | |
| type | varchar(20) | NOT NULL | access/export/deletion/rectification |
| status | varchar(20) | DEFAULT 'pending' | pending/processing/completed/rejected |
| requested_at | timestamptz | DEFAULT now() | |
| completed_at | timestamptz | | |
| completed_by | uuid | | |
| response_file_url | text | | S3 path for exported data |
| rejection_reason | text | | |
| notes | text | | |

### documents

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| patient_id | uuid | FK → patients.id | |
| encounter_id | uuid | FK → encounters.id | |
| name | varchar(255) | NOT NULL | |
| type | varchar(50) | NOT NULL | lab_result/imaging/referral/consent/other |
| file_url | text | NOT NULL | S3 path |
| file_size | integer | | Bytes |
| mime_type | varchar(100) | | |
| is_encrypted | boolean | DEFAULT true | |
| uploaded_by | uuid | NOT NULL | |
| created_at | timestamptz | DEFAULT now() | |
| deleted_at | timestamptz | | Soft delete |

### import_logs

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| source_type | varchar(20) | NOT NULL | csv/fhir/manual |
| file_name | varchar(255) | | |
| total_records | integer | DEFAULT 0 | |
| imported_count | integer | DEFAULT 0 | |
| skipped_count | integer | DEFAULT 0 | |
| error_count | integer | DEFAULT 0 | |
| errors | jsonb | DEFAULT '[]' | [{row, field, error}] |
| status | varchar(20) | DEFAULT 'pending' | pending/processing/completed/failed |
| imported_by | uuid | NOT NULL | |
| started_at | timestamptz | | |
| completed_at | timestamptz | | |
| created_at | timestamptz | DEFAULT now() | |

---

## Design Patterns

| Pattern | Implementation |
|---|---|
| **Soft delete** | `deleted_at` timestamptz on patients, messages, documents. Never hard delete medical records |
| **Audit trail** | `created_at`, `updated_at` on all tables. `audit_logs` captures who/what/when/where |
| **Encryption** | PHI stored as `bytea` (AES-256-GCM). Blind indexes (HMAC) for searchable encrypted fields |
| **Schema isolation** | `SET search_path TO tenant_{id}` per request via NestJS middleware |
| **UUID PKs** | All primary keys are UUIDv7 (time-sortable) for distributed systems readiness |
| **JSONB for flexibility** | Settings, addresses, allergies, consent flags — structured but schema-flexible |
| **Generated columns** | BMI auto-calculated from height/weight |
| **Partitioning** | `audit_logs` partitioned by month for query performance |
| **Foreign keys** | Referential integrity within tenant schema. Cross-schema FKs to public.users via uuid |

---

## Phase 2 Tables (added after MVP)

These tables will be added when their respective modules are built:

| Module | Tables |
|---|---|
| Laboratory | lab_orders, lab_test_catalog, lab_test_items, lab_results, lab_panels, lab_quality_control |
| Pharmacy | pharmacy_inventory, prescription_refills, drug_interactions_db |
| Patient Portal | patient_preferences, patient_messages |
| Billing | invoices, payments, insurance_claims, claim_line_items |
| Disease Surveillance | disease_reports, outbreak_alerts, vaccination_records |
| Mass Casualty | triage_events, temp_patients, triage_log |
