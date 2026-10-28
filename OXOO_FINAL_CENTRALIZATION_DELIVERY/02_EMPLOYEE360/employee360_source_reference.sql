-- ============================================================================
-- EMPLOYEE 360 PRODUCT - COMPLETE DATABASE SCHEMA (POSTGRESQL)
-- ============================================================================
-- Description: Single consolidated schema file for the entire multi-tenant
--              Employee360 application database.
-- Dialect:     PostgreSQL (v14+)
-- Includes:    Extensions, Custom Functions, 43 Tables, Primary/Foreign Keys,
--              Composite Multi-Tenant Constraints, Performance & Partial Indexes,
--              Immutability Triggers, and Row-Level Security (RLS) Policies.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ----------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS & ROLES
-- ----------------------------------------------------------------------------

-- Create app_user role if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user;
  END IF;
END $$;

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

-- Subdomain login resolver: finds an active company by slug
CREATE OR REPLACE FUNCTION public.resolve_company(p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  status text,
  logo_path text,
  primary_color text,
  timezone text,
  country_code text,
  currency_code text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT c.id, c.name, c.slug, c.status, c.logo_path, c.primary_color,
         c.timezone, c.country_code, c.currency_code
  FROM public.companies c
  WHERE c.slug = lower(p_slug) AND c.status = 'active'
$$;

REVOKE ALL ON FUNCTION public.resolve_company(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_company(text) TO app_user;

-- ----------------------------------------------------------------------------
-- 2. CORE PLATFORM & MULTI-TENANCY TABLES
-- ----------------------------------------------------------------------------

-- Table: companies (Platform root table; no company_id)
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  legal_name text,
  status text NOT NULL DEFAULT 'active',
  country_code text NOT NULL,
  currency_code text NOT NULL,
  timezone text NOT NULL,
  logo_path text,
  primary_color text,
  employee_id_format text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT companies_slug_uq UNIQUE (slug),
  CONSTRAINT companies_slug_chk CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'),
  CONSTRAINT companies_status_chk CHECK (status IN ('active','suspended','closed')),
  CONSTRAINT companies_country_chk CHECK (char_length(country_code) = 2),
  CONSTRAINT companies_currency_chk CHECK (char_length(currency_code) = 3)
);

-- Table: company_keys (Per-company encryption keys wrapped by master key)
CREATE TABLE IF NOT EXISTS public.company_keys (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  version integer NOT NULL,
  master_key_id text NOT NULL,
  wrapped_data_key bytea NOT NULL,
  wrapped_hmac_key bytea NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,
  CONSTRAINT company_keys_pk PRIMARY KEY (company_id, version),
  CONSTRAINT company_keys_status_chk CHECK (status IN ('active','retired'))
);

CREATE UNIQUE INDEX IF NOT EXISTS company_keys_one_active_uq
  ON public.company_keys (company_id)
  WHERE status = 'active';

-- Table: company_counters (Atomic sequence generators per tenant)
CREATE TABLE IF NOT EXISTS public.company_counters (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  key text NOT NULL,
  value bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_counters_pk PRIMARY KEY (company_id, key)
);

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'employee',
  status text NOT NULL DEFAULT 'active',
  password_changed_at timestamptz,
  reset_token_hash text,
  reset_token_expires timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT users_company_legacy_uq UNIQUE (company_id, legacy_mongo_id),
  CONSTRAINT users_role_chk CHECK (role IN ('admin','manager','employee')),
  CONSTRAINT users_status_chk CHECK (status IN ('active','inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS users_company_email_uq
  ON public.users (company_id, lower(email));

-- Table: departments
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT departments_company_legacy_uq UNIQUE (company_id, legacy_mongo_id),
  CONSTRAINT departments_status_chk CHECK (status IN ('active','inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS departments_company_name_uq
  ON public.departments (company_id, lower(name));

-- Table: designations
CREATE TABLE IF NOT EXISTS public.designations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT designations_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT designations_company_legacy_uq UNIQUE (company_id, legacy_mongo_id),
  CONSTRAINT designations_status_chk CHECK (status IN ('active','inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS designations_company_name_uq
  ON public.designations (company_id, lower(name));

-- Table: employees
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  employee_code text NOT NULL,
  name text NOT NULL,
  phone text,
  department_id uuid,
  designation_id uuid,
  joining_date date NOT NULL,
  manager_id uuid,
  status text NOT NULL DEFAULT 'active',
  employment_type text NOT NULL DEFAULT 'permanent',
  internship_end_date date,
  converted_on timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employees_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT employees_company_code_uq UNIQUE (company_id, employee_code),
  CONSTRAINT employees_company_user_uq UNIQUE (company_id, user_id),
  CONSTRAINT employees_company_legacy_uq UNIQUE (company_id, legacy_mongo_id),
  CONSTRAINT employees_user_fk FOREIGN KEY (company_id, user_id)
    REFERENCES public.users(company_id, id),
  CONSTRAINT employees_department_fk FOREIGN KEY (company_id, department_id)
    REFERENCES public.departments(company_id, id),
  CONSTRAINT employees_designation_fk FOREIGN KEY (company_id, designation_id)
    REFERENCES public.designations(company_id, id),
  CONSTRAINT employees_manager_fk FOREIGN KEY (company_id, manager_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT employees_code_upper_chk CHECK (employee_code = upper(employee_code)),
  CONSTRAINT employees_status_chk CHECK (status IN ('active','inactive')),
  CONSTRAINT employees_type_chk CHECK (employment_type IN ('intern','permanent'))
);

CREATE INDEX IF NOT EXISTS employees_company_department_idx ON public.employees (company_id, department_id);
CREATE INDEX IF NOT EXISTS employees_company_manager_idx ON public.employees (company_id, manager_id);
CREATE INDEX IF NOT EXISTS employees_company_type_idx ON public.employees (company_id, employment_type);
CREATE INDEX IF NOT EXISTS employees_company_created_idx ON public.employees (company_id, created_at);

-- Table: company_settings
CREATE TABLE IF NOT EXISTS public.company_settings (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_settings_pk PRIMARY KEY (company_id, key),
  CONSTRAINT company_settings_updated_by_fk FOREIGN KEY (company_id, updated_by)
    REFERENCES public.users(company_id, id)
);

-- ----------------------------------------------------------------------------
-- 3. EMPLOYEE DETAILS, NOMINEES, CONTACTS, BIOMETRICS
-- ----------------------------------------------------------------------------

-- Table: employee_hr_details (Encrypted Aadhaar, PAN, Bank details)
CREATE TABLE IF NOT EXISTS public.employee_hr_details (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  aadhaar_enc bytea,
  aadhaar_hash bytea,
  aadhaar_last4 text,
  pan_enc bytea,
  pan_hash bytea,
  pan_last4 text,
  bank_account_enc bytea,
  bank_account_last4 text,
  lookup_key_version integer,
  ifsc_code text,
  bank_name text,
  date_of_birth date,
  guardian_name text,
  current_address text,
  permanent_address text,
  previous_uan text,
  previous_pf_member_id text,
  locked boolean NOT NULL DEFAULT false,
  locked_at timestamptz,
  locked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_hr_details_pk PRIMARY KEY (company_id, employee_id),
  CONSTRAINT employee_hr_details_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT employee_hr_details_locked_by_fk FOREIGN KEY (company_id, locked_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT employee_hr_aadhaar_last4_chk CHECK (aadhaar_last4 IS NULL OR char_length(aadhaar_last4) = 4),
  CONSTRAINT employee_hr_pan_last4_chk CHECK (pan_last4 IS NULL OR char_length(pan_last4) = 4),
  CONSTRAINT employee_hr_bank_last4_chk CHECK (bank_account_last4 IS NULL OR char_length(bank_account_last4) = 4)
);

CREATE INDEX IF NOT EXISTS employee_hr_aadhaar_hash_idx ON public.employee_hr_details (company_id, aadhaar_hash);
CREATE INDEX IF NOT EXISTS employee_hr_pan_hash_idx ON public.employee_hr_details (company_id, pan_hash);
CREATE UNIQUE INDEX IF NOT EXISTS employee_hr_aadhaar_hash_uq
  ON public.employee_hr_details (company_id, aadhaar_hash)
  WHERE aadhaar_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS employee_hr_pan_hash_uq
  ON public.employee_hr_details (company_id, pan_hash)
  WHERE pan_hash IS NOT NULL;

-- Table: employee_nominees
CREATE TABLE IF NOT EXISTS public.employee_nominees (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  name text,
  relationship text,
  date_of_birth date,
  address text,
  aadhaar_enc bytea,
  aadhaar_last4 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_nominees_pk PRIMARY KEY (company_id, employee_id),
  CONSTRAINT employee_nominees_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT employee_nominee_aadhaar_last4_chk CHECK (aadhaar_last4 IS NULL OR char_length(aadhaar_last4) = 4)
);

-- Table: employee_emergency_contacts
CREATE TABLE IF NOT EXISTS public.employee_emergency_contacts (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  position smallint NOT NULL,
  name text,
  phone text,
  relation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_emergency_contacts_pk PRIMARY KEY (company_id, employee_id, position),
  CONSTRAINT employee_emergency_contacts_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT employee_emergency_position_chk CHECK (position IN (1, 2))
);

-- Table: employee_documents
CREATE TABLE IF NOT EXISTS public.employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  kind text NOT NULL,
  storage_path text NOT NULL,
  original_name text,
  content_type text,
  size_bytes integer,
  uploaded_at timestamptz,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_documents_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT employee_documents_uploaded_by_fk FOREIGN KEY (company_id, uploaded_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT employee_documents_kind_chk CHECK (kind IN ('photo','aadhaar','pan','bank','other'))
);

CREATE UNIQUE INDEX IF NOT EXISTS employee_documents_slot_uq
  ON public.employee_documents (company_id, employee_id, kind);

-- Table: employee_face_profiles (Biometric face recognition descriptors & consent)
CREATE TABLE IF NOT EXISTS public.employee_face_profiles (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'none',
  samples integer NOT NULL DEFAULT 0,
  descriptors_enc bytea,
  photo_path text,
  photo_uploaded_at timestamptz,
  consent_at timestamptz,
  enrolled_at timestamptz,
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_face_profiles_pk PRIMARY KEY (company_id, employee_id),
  CONSTRAINT employee_face_profiles_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT employee_face_profiles_reviewed_by_fk FOREIGN KEY (company_id, reviewed_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT employee_face_status_chk CHECK (status IN ('none','pending','approved','rejected'))
);

-- ----------------------------------------------------------------------------
-- 4. AUDIT LOGS, OFFER LETTERS, VERIFICATIONS
-- ----------------------------------------------------------------------------

-- Table: audit_logs (Append-only audit trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  details jsonb,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_user_fk FOREIGN KEY (company_id, user_id)
    REFERENCES public.users(company_id, id)
);

-- Table: offer_letters
CREATE TABLE IF NOT EXISTS public.offer_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  path text NOT NULL,
  original_name text,
  size integer,
  sha256 text,
  uploaded_by uuid,
  status text NOT NULL DEFAULT 'active',
  email jsonb,
  first_viewed_at timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offer_letters_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT offer_letters_uploaded_by_fk FOREIGN KEY (company_id, uploaded_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT offer_letters_status_chk CHECK (status IN ('active','superseded'))
);

-- Table: details_verifications
CREATE TABLE IF NOT EXISTS public.details_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  snapshot_hmac text NOT NULL,
  signed_at timestamptz NOT NULL,
  signed_by uuid,
  signature_path text,
  ip text,
  user_agent text,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT details_verifications_employee_uq UNIQUE (company_id, employee_id),
  CONSTRAINT details_verifications_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT details_verifications_signed_by_fk FOREIGN KEY (company_id, signed_by)
    REFERENCES public.users(company_id, id)
);

-- ----------------------------------------------------------------------------
-- 5. LEAVES, HOLIDAYS, TASKS
-- ----------------------------------------------------------------------------

-- Table: leave_types
CREATE TABLE IF NOT EXISTS public.leave_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  annual_limit integer NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leave_types_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT leave_types_company_legacy_uq UNIQUE (company_id, legacy_mongo_id),
  CONSTRAINT leave_types_status_chk CHECK (status IN ('active','inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS leave_types_company_name_uq
  ON public.leave_types (company_id, lower(name));

-- Table: leave_requests
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  attachment text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_comment text,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leave_requests_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT leave_requests_type_fk FOREIGN KEY (company_id, leave_type_id)
    REFERENCES public.leave_types(company_id, id),
  CONSTRAINT leave_requests_reviewed_by_fk FOREIGN KEY (company_id, reviewed_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT leave_requests_status_chk CHECK (status IN ('pending','approved','rejected'))
);

-- Table: holidays
CREATE TABLE IF NOT EXISTS public.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date date NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'holiday',
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT holidays_company_date_uq UNIQUE (company_id, date),
  CONSTRAINT holidays_type_chk CHECK (type IN ('holiday','working'))
);

-- Table: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  assigned_to uuid NOT NULL,
  assigned_by uuid NOT NULL,
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'todo',
  completed_at timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tasks_assigned_to_fk FOREIGN KEY (company_id, assigned_to)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT tasks_assigned_by_fk FOREIGN KEY (company_id, assigned_by)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT tasks_priority_chk CHECK (priority IN ('low','medium','high')),
  CONSTRAINT tasks_status_chk CHECK (status IN ('todo','in-progress','done','cancelled'))
);

-- ----------------------------------------------------------------------------
-- 6. OFFICES, ATTENDANCE, WORK MODE
-- ----------------------------------------------------------------------------

-- Table: offices (Geofencing locations)
CREATE TABLE IF NOT EXISTS public.offices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  radius_meters integer NOT NULL DEFAULT 90,
  status text NOT NULL DEFAULT 'active',
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offices_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT offices_status_chk CHECK (status IN ('active','inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS offices_company_name_uq
  ON public.offices (company_id, lower(name));

-- Table: attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  date date NOT NULL,
  check_in timestamptz NOT NULL,
  check_out timestamptz,
  status text NOT NULL DEFAULT 'present',
  worked_minutes integer NOT NULL DEFAULT 0,
  late_minutes integer NOT NULL DEFAULT 0,
  early_minutes integer NOT NULL DEFAULT 0,
  early_leave_minutes integer NOT NULL DEFAULT 0,
  overtime_minutes integer NOT NULL DEFAULT 0,
  work_mode text NOT NULL DEFAULT 'office',
  check_in_location jsonb,
  check_out_location jsonb,
  face_score_in real,
  face_score_out real,
  location_review jsonb,
  checkout_status text,
  correction jsonb,
  overtime jsonb,
  check_in_photo_path text,
  check_in_photo_uploaded_at timestamptz,
  check_out_photo_path text,
  check_out_photo_uploaded_at timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_company_employee_date_uq UNIQUE (company_id, employee_id, date),
  CONSTRAINT attendance_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT attendance_status_chk CHECK (status IN ('present','half-day','absent')),
  CONSTRAINT attendance_work_mode_chk CHECK (work_mode IN ('office','wfh'))
);

-- Table: work_mode_requests (WFH requests)
CREATE TABLE IF NOT EXISTS public.work_mode_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_comment text,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT work_mode_requests_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT work_mode_requests_reviewed_by_fk FOREIGN KEY (company_id, reviewed_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT work_mode_requests_status_chk CHECK (status IN ('pending','approved','rejected'))
);

-- ----------------------------------------------------------------------------
-- 7. WORKHUB (CONVERSATIONS, MEMBERS, MESSAGES, NOTIFICATIONS)
-- ----------------------------------------------------------------------------

-- Table: conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text,
  description text,
  department_id uuid,
  manager_id uuid,
  is_private boolean NOT NULL DEFAULT false,
  post_policy text NOT NULL DEFAULT 'all',
  posters jsonb NOT NULL DEFAULT '[]'::jsonb,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  dm_key text,
  archived boolean NOT NULL DEFAULT false,
  created_by uuid,
  last_message_at timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT conversations_department_fk FOREIGN KEY (company_id, department_id)
    REFERENCES public.departments(company_id, id),
  CONSTRAINT conversations_manager_fk FOREIGN KEY (company_id, manager_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT conversations_created_by_fk FOREIGN KEY (company_id, created_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT conversations_type_chk CHECK (type IN ('announcement','department','team','channel','dm','group')),
  CONSTRAINT conversations_post_policy_chk CHECK (post_policy IN ('all','admins','selected'))
);

-- Table: conversation_members
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  muted boolean NOT NULL DEFAULT false,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversation_members_user_uq UNIQUE (company_id, conversation_id, user_id),
  CONSTRAINT conversation_members_conv_fk FOREIGN KEY (company_id, conversation_id)
    REFERENCES public.conversations(company_id, id),
  CONSTRAINT conversation_members_user_fk FOREIGN KEY (company_id, user_id)
    REFERENCES public.users(company_id, id)
);

-- Table: messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  text text NOT NULL,
  reply_to uuid,
  mentions jsonb NOT NULL DEFAULT '[]'::jsonb,
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT messages_conv_fk FOREIGN KEY (company_id, conversation_id)
    REFERENCES public.conversations(company_id, id),
  CONSTRAINT messages_sender_fk FOREIGN KEY (company_id, sender_id)
    REFERENCES public.users(company_id, id),
  CONSTRAINT messages_deleted_by_fk FOREIGN KEY (company_id, deleted_by)
    REFERENCES public.users(company_id, id)
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  actor_id uuid,
  conversation_id uuid,
  message_id uuid,
  read_at timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_user_fk FOREIGN KEY (company_id, user_id)
    REFERENCES public.users(company_id, id),
  CONSTRAINT notifications_actor_fk FOREIGN KEY (company_id, actor_id)
    REFERENCES public.users(company_id, id),
  CONSTRAINT notifications_conv_fk FOREIGN KEY (company_id, conversation_id)
    REFERENCES public.conversations(company_id, id),
  CONSTRAINT notifications_message_fk FOREIGN KEY (company_id, message_id)
    REFERENCES public.messages(company_id, id),
  CONSTRAINT notifications_type_chk CHECK (type IN ('announcement','dm','mention','group','system'))
);

-- ----------------------------------------------------------------------------
-- 8. PAYROLL V1 & USER ACTIVITIES
-- ----------------------------------------------------------------------------

-- Table: salary_structures
CREATE TABLE IF NOT EXISTS public.salary_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  monthly_salary bigint NOT NULL DEFAULT 0,
  effective_from date NOT NULL,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT salary_structures_company_employee_uq UNIQUE (company_id, employee_id),
  CONSTRAINT salary_structures_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id)
);

-- Forward declaration / created here; payroll_periods will be linked subsequently
CREATE TABLE IF NOT EXISTS public.payrolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  month text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  attendance jsonb NOT NULL DEFAULT '{}'::jsonb,
  policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  monthly_salary bigint NOT NULL DEFAULT 0,
  per_day bigint NOT NULL DEFAULT 0,
  absent_deduction bigint NOT NULL DEFAULT 0,
  late_deduction bigint NOT NULL DEFAULT 0,
  total_deductions bigint NOT NULL DEFAULT 0,
  overtime_pay bigint NOT NULL DEFAULT 0,
  net_pay bigint NOT NULL DEFAULT 0,
  flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_by uuid,
  generated_at timestamptz,
  finalized_by uuid,
  finalized_at timestamptz,
  payroll_period_id uuid,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payrolls_company_id_uq UNIQUE (company_id, id),
  CONSTRAINT payrolls_company_employee_month_uq UNIQUE (company_id, employee_id, month),
  CONSTRAINT payrolls_employee_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT payrolls_generated_by_fk FOREIGN KEY (company_id, generated_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT payrolls_finalized_by_fk FOREIGN KEY (company_id, finalized_by)
    REFERENCES public.users(company_id, id),
  CONSTRAINT payrolls_status_chk CHECK (status IN ('draft','finalized')),
  CONSTRAINT payrolls_month_chk CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$')
);

-- Table: user_activities
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_active_at timestamptz,
  last_login_at timestamptz,
  last_logout_at timestamptz,
  legacy_mongo_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_activities_company_user_uq UNIQUE (company_id, user_id),
  CONSTRAINT user_activities_user_fk FOREIGN KEY (company_id, user_id)
    REFERENCES public.users(company_id, id)
);

-- ----------------------------------------------------------------------------
-- 9. USER PERMISSIONS & EXPENSE MANAGEMENT
-- ----------------------------------------------------------------------------

-- Table: user_permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  permission text NOT NULL,
  granted_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_permissions_pk PRIMARY KEY (company_id, user_id, permission),
  CONSTRAINT user_permissions_user_composite_fk FOREIGN KEY (company_id, user_id)
    REFERENCES public.users(company_id, id) ON DELETE CASCADE,
  CONSTRAINT user_permissions_permission_chk CHECK (permission IN ('finance', 'hr', 'recruiter', 'fleet', 'appraisal'))
);

-- Table: expense_categories
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  max_limit_paise bigint,
  receipt_required_above_paise bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT expense_categories_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT expense_categories_code_uq UNIQUE (company_id, code)
);

-- Forward declaration of payroll_periods before expense_claims FK link
-- Table: payroll_periods (Payroll V2 batch)
CREATE TABLE IF NOT EXISTS public.payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  month text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review_pending', 'approved', 'disbursed', 'locked')),
  total_gross_paise bigint NOT NULL DEFAULT 0,
  total_deductions_paise bigint NOT NULL DEFAULT 0,
  total_net_paise bigint NOT NULL DEFAULT 0,
  employee_count integer NOT NULL DEFAULT 0,
  prepared_by uuid NOT NULL REFERENCES public.users(id),
  prepared_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES public.users(id),
  approved_at timestamptz,
  disbursed_by uuid REFERENCES public.users(id),
  disbursed_at timestamptz,
  locked_by uuid REFERENCES public.users(id),
  locked_at timestamptz,
  single_admin_override boolean NOT NULL DEFAULT false,
  override_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payroll_periods_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT payroll_periods_month_uq UNIQUE (company_id, month),
  CONSTRAINT preparer_approver_separate_chk CHECK (
    approved_by IS NULL OR
    prepared_by <> approved_by OR
    (single_admin_override = true AND override_reason IS NOT NULL AND length(trim(override_reason)) > 0)
  )
);

-- Add deferred FK on payrolls table now that payroll_periods exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payrolls_payroll_period_fk') THEN
    ALTER TABLE public.payrolls
      ADD CONSTRAINT payrolls_payroll_period_fk
      FOREIGN KEY (payroll_period_id) REFERENCES public.payroll_periods(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Table: expense_claims
CREATE TABLE IF NOT EXISTS public.expense_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  claim_number text NOT NULL,
  employee_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'manager_approved', 'finance_approved', 'rejected', 'reimbursed')),
  total_amount_paise bigint NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  manager_id uuid,
  manager_reviewed_at timestamptz,
  manager_note text,
  finance_reviewer_id uuid,
  finance_reviewed_at timestamptz,
  finance_note text,
  payroll_id uuid,
  payroll_period_id uuid,
  paid_at timestamptz,
  paid_by uuid REFERENCES public.users(id),
  payment_reference text,
  payout_method text DEFAULT 'separate' CHECK (payout_method IS NULL OR payout_method IN ('separate', 'payroll')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT expense_claims_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT expense_claims_number_uq UNIQUE (company_id, claim_number),
  CONSTRAINT expense_claims_employee_composite_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id) ON DELETE CASCADE,
  CONSTRAINT expense_claims_manager_composite_fk FOREIGN KEY (company_id, manager_id)
    REFERENCES public.employees(company_id, id),
  CONSTRAINT expense_claims_finance_composite_fk FOREIGN KEY (company_id, finance_reviewer_id)
    REFERENCES public.users(company_id, id),
  CONSTRAINT expense_claims_payroll_fk FOREIGN KEY (company_id, payroll_id)
    REFERENCES public.payrolls(company_id, id),
  CONSTRAINT expense_claims_payroll_period_composite_fk FOREIGN KEY (company_id, payroll_period_id)
    REFERENCES public.payroll_periods(company_id, id),
  CONSTRAINT expense_claims_no_self_manager_chk CHECK (manager_id IS NULL OR manager_id <> employee_id)
);

-- Table: expense_items
CREATE TABLE IF NOT EXISTS public.expense_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  claim_id uuid NOT NULL,
  category_id uuid NOT NULL,
  spent_on date NOT NULL,
  merchant text NOT NULL,
  amount_paise bigint NOT NULL,
  is_mileage boolean NOT NULL DEFAULT false,
  distance_km numeric(8,2),
  vehicle_type text CHECK (vehicle_type IS NULL OR vehicle_type IN ('two_wheeler', 'four_wheeler')),
  receipt_storage_path text,
  receipt_mime_type text,
  receipt_size_bytes integer,
  receipt_sha256 text,
  receipt_original_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT expense_items_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT expense_items_claim_composite_fk FOREIGN KEY (company_id, claim_id)
    REFERENCES public.expense_claims(company_id, id) ON DELETE CASCADE,
  CONSTRAINT expense_items_category_composite_fk FOREIGN KEY (company_id, category_id)
    REFERENCES public.expense_categories(company_id, id)
);

-- ----------------------------------------------------------------------------
-- 10. PAYROLL V2 (SALARY COMPONENTS & LINE ITEMS)
-- ----------------------------------------------------------------------------

-- Table: salary_components
CREATE TABLE IF NOT EXISTS public.salary_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('earning', 'deduction')),
  calculation_type text NOT NULL CHECK (calculation_type IN ('flat', 'percentage', 'formula')),
  formula_expression text,
  is_taxable boolean NOT NULL DEFAULT true,
  is_statutory boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT salary_components_code_uq UNIQUE (company_id, code)
);

-- Table: employee_salary_components (Encrypted amounts)
CREATE TABLE IF NOT EXISTS public.employee_salary_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  component_id uuid NOT NULL REFERENCES public.salary_components(id) ON DELETE RESTRICT,
  amount_paise_enc bytea NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT emp_salary_components_emp_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id) ON DELETE CASCADE
);

-- Table: payroll_line_items (Encrypted line item amounts)
CREATE TABLE IF NOT EXISTS public.payroll_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  payroll_period_id uuid NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payroll_id uuid REFERENCES public.payrolls(id) ON DELETE CASCADE,
  component_id uuid REFERENCES public.salary_components(id) ON DELETE RESTRICT,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('earning', 'deduction', 'arrear', 'bonus', 'reimbursement')),
  amount_paise_enc bytea NOT NULL,
  is_statutory boolean NOT NULL DEFAULT false,
  remarks text,
  expense_claim_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payroll_line_items_expense_claim_composite_fk FOREIGN KEY (company_id, expense_claim_id)
    REFERENCES public.expense_claims(company_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS payroll_line_items_expense_claim_uq
  ON public.payroll_line_items (company_id, expense_claim_id)
  WHERE expense_claim_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 11. FLEET MANAGEMENT MODULE
-- ----------------------------------------------------------------------------

-- Table: vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plate_number text NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  model_year integer NOT NULL CHECK (model_year >= 1900 AND model_year <= 2100),
  vin text,
  fuel_type text NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'cng', 'ev', 'hybrid')),
  transmission text NOT NULL DEFAULT 'manual' CHECK (transmission IN ('manual', 'automatic')),
  seats integer NOT NULL DEFAULT 5 CHECK (seats > 0),
  color text,
  purchase_value_paise bigint NOT NULL DEFAULT 0 CHECK (purchase_value_paise >= 0),
  purchase_date date,
  odometer_km integer NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
  office_id uuid,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'in_service', 'retired')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT vehicles_company_plate_uq UNIQUE (company_id, plate_number),
  CONSTRAINT vehicles_plate_number_format_chk CHECK (
    length(plate_number) >= 2 AND plate_number = upper(plate_number) AND plate_number !~ '\s'
  ),
  CONSTRAINT vehicles_vin_format_chk CHECK (
    vin IS NULL OR (length(vin) >= 5 AND vin = upper(vin) AND vin !~ '\s')
  ),
  CONSTRAINT vehicles_office_composite_fk FOREIGN KEY (company_id, office_id)
    REFERENCES public.offices(company_id, id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS vehicles_company_vin_uq
  ON public.vehicles (company_id, vin)
  WHERE vin IS NOT NULL;

-- Table: vehicle_assignments (Supports GiST exclusion against overlapping assignment ranges)
CREATE TABLE IF NOT EXISTS public.vehicle_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  from_date date NOT NULL,
  to_date date,
  assigned_by uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_assignments_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT vehicle_assignments_date_order_chk CHECK (to_date IS NULL OR to_date >= from_date),
  CONSTRAINT vehicle_assignments_vehicle_composite_fk FOREIGN KEY (company_id, vehicle_id)
    REFERENCES public.vehicles(company_id, id) ON DELETE CASCADE,
  CONSTRAINT vehicle_assignments_employee_composite_fk FOREIGN KEY (company_id, employee_id)
    REFERENCES public.employees(company_id, id) ON DELETE RESTRICT,
  CONSTRAINT vehicle_assignments_assigned_by_composite_fk FOREIGN KEY (company_id, assigned_by)
    REFERENCES public.users(company_id, id) ON DELETE RESTRICT,
  CONSTRAINT vehicle_assignments_no_overlap EXCLUDE USING gist (
    company_id WITH =,
    vehicle_id WITH =,
    daterange(from_date, COALESCE(to_date, 'infinity'::date), '[]') WITH &&
  )
);

CREATE INDEX IF NOT EXISTS vehicle_assignments_company_emp_active_idx
  ON public.vehicle_assignments (company_id, employee_id)
  WHERE to_date IS NULL;

-- Table: vehicle_contracts
CREATE TABLE IF NOT EXISTS public.vehicle_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('insurance', 'lease', 'registration', 'puc', 'permit', 'other')),
  vendor text,
  reference_no text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cost_paise bigint NOT NULL DEFAULT 0 CHECK (cost_paise >= 0),
  recurrence text NOT NULL DEFAULT 'one_time' CHECK (recurrence IN ('one_time', 'monthly', 'quarterly', 'yearly')),
  document_storage_path text,
  document_original_name text,
  document_mime_type text,
  document_size_bytes integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_contracts_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT vehicle_contracts_date_order_chk CHECK (end_date >= start_date),
  CONSTRAINT vehicle_contracts_vehicle_composite_fk FOREIGN KEY (company_id, vehicle_id)
    REFERENCES public.vehicles(company_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS vehicle_contracts_company_end_date_idx
  ON public.vehicle_contracts (company_id, end_date);

-- Table: vehicle_services
CREATE TABLE IF NOT EXISTS public.vehicle_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('routine', 'repair', 'tyres', 'inspection', 'other')),
  vendor text,
  service_date date NOT NULL,
  odometer_km integer NOT NULL CHECK (odometer_km >= 0),
  cost_paise bigint NOT NULL DEFAULT 0 CHECK (cost_paise >= 0),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'running', 'done')),
  notes text,
  invoice_storage_path text,
  invoice_original_name text,
  invoice_mime_type text,
  invoice_size_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_services_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT vehicle_services_vehicle_composite_fk FOREIGN KEY (company_id, vehicle_id)
    REFERENCES public.vehicles(company_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS vehicle_services_company_veh_status_idx
  ON public.vehicle_services (company_id, vehicle_id, status);

-- Table: vehicle_fuel_logs
CREATE TABLE IF NOT EXISTS public.vehicle_fuel_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL,
  log_date date NOT NULL,
  quantity numeric(10,2) NOT NULL CHECK (quantity > 0),
  quantity_unit text NOT NULL DEFAULT 'litre' CHECK (quantity_unit IN ('litre', 'kg', 'kwh')),
  amount_paise bigint NOT NULL DEFAULT 0 CHECK (amount_paise >= 0),
  odometer_km integer NOT NULL CHECK (odometer_km >= 0),
  full_tank boolean NOT NULL DEFAULT true,
  logged_by uuid NOT NULL,
  receipt_storage_path text,
  receipt_original_name text,
  receipt_mime_type text,
  receipt_size_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_fuel_logs_company_id_id_uq UNIQUE (company_id, id),
  CONSTRAINT vehicle_fuel_logs_vehicle_composite_fk FOREIGN KEY (company_id, vehicle_id)
    REFERENCES public.vehicles(company_id, id) ON DELETE CASCADE,
  CONSTRAINT vehicle_fuel_logs_logged_by_composite_fk FOREIGN KEY (company_id, logged_by)
    REFERENCES public.users(company_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS vehicle_fuel_logs_company_veh_date_odo_idx
  ON public.vehicle_fuel_logs (company_id, vehicle_id, log_date DESC, odometer_km DESC);

-- ----------------------------------------------------------------------------
-- 12. IMMUTABILITY & AUDIT TRIGGER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Payroll Period Lock Trigger Function
CREATE OR REPLACE FUNCTION public.check_payroll_period_locked()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'locked' THEN
      RAISE EXCEPTION 'Cannot insert a payroll period directly in locked state' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'locked' THEN
      RAISE EXCEPTION 'Cannot modify a locked payroll period' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'locked' THEN
      RAISE EXCEPTION 'Cannot delete a locked payroll period' USING ERRCODE = '42501';
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS enforce_payroll_period_lock ON public.payroll_periods;
CREATE TRIGGER enforce_payroll_period_lock
  BEFORE INSERT OR UPDATE OR DELETE ON public.payroll_periods
  FOR EACH ROW EXECUTE FUNCTION public.check_payroll_period_locked();

-- Payroll Line Item Lock Trigger Function
CREATE OR REPLACE FUNCTION public.check_payroll_line_item_locked()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_period_status text;
  v_period_id uuid;
BEGIN
  v_period_id := COALESCE(NEW.payroll_period_id, OLD.payroll_period_id);

  IF v_period_id IS NOT NULL THEN
    SELECT status INTO v_period_status FROM public.payroll_periods WHERE id = v_period_id;
  ELSIF COALESCE(NEW.payroll_id, OLD.payroll_id) IS NOT NULL THEN
    SELECT pp.status INTO v_period_status
    FROM public.payrolls p
    JOIN public.payroll_periods pp ON pp.id = p.payroll_period_id
    WHERE p.id = COALESCE(NEW.payroll_id, OLD.payroll_id);
  END IF;

  IF v_period_status = 'locked' THEN
    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'Cannot insert line items for a locked payroll period' USING ERRCODE = '42501';
    ELSIF TG_OP = 'UPDATE' THEN
      RAISE EXCEPTION 'Cannot modify line items for a locked payroll period' USING ERRCODE = '42501';
    ELSIF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'Cannot delete line items for a locked payroll period' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_payroll_line_item_lock ON public.payroll_line_items;
CREATE TRIGGER enforce_payroll_line_item_lock
  BEFORE INSERT OR UPDATE OR DELETE ON public.payroll_line_items
  FOR EACH ROW EXECUTE FUNCTION public.check_payroll_line_item_locked();

-- Expense Claims Immutability Trigger Function
CREATE OR REPLACE FUNCTION public.fn_enforce_expense_claim_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('finance_approved', 'reimbursed') THEN
      RAISE EXCEPTION 'Cannot delete an approved or reimbursed expense claim (%)', OLD.id USING ERRCODE = '42501';
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'reimbursed' THEN
      IF NEW.total_amount_paise <> OLD.total_amount_paise OR NEW.employee_id <> OLD.employee_id OR NEW.status <> OLD.status THEN
        RAISE EXCEPTION 'Cannot modify financial fields of a reimbursed expense claim (%)', OLD.id USING ERRCODE = '42501';
      END IF;
    ELSIF OLD.status = 'finance_approved' THEN
      IF NEW.total_amount_paise <> OLD.total_amount_paise OR NEW.employee_id <> OLD.employee_id THEN
        RAISE EXCEPTION 'Cannot modify total amount or employee on an approved expense claim (%)', OLD.id USING ERRCODE = '42501';
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_expense_claims_immutability ON public.expense_claims;
CREATE TRIGGER trg_expense_claims_immutability
  BEFORE UPDATE OR DELETE ON public.expense_claims
  FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_expense_claim_immutability();

-- Expense Items Immutability Trigger Function
CREATE OR REPLACE FUNCTION public.fn_enforce_expense_item_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_status text;
  v_claim_id uuid;
BEGIN
  v_claim_id := COALESCE(NEW.claim_id, OLD.claim_id);
  SELECT status INTO v_status FROM public.expense_claims WHERE id = v_claim_id;
  IF v_status IN ('finance_approved', 'reimbursed') THEN
    RAISE EXCEPTION 'Cannot insert, update, or delete items on an approved or reimbursed expense claim (%)', v_claim_id USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_expense_items_immutability ON public.expense_items;
CREATE TRIGGER trg_expense_items_immutability
  BEFORE INSERT OR UPDATE OR DELETE ON public.expense_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_expense_item_immutability();

-- Fleet Vehicle Assignment Retired Check Trigger Function
CREATE OR REPLACE FUNCTION public.fn_vehicle_assignment_check_retired()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status
    FROM public.vehicles
   WHERE company_id = NEW.company_id AND id = NEW.vehicle_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Referenced vehicle (%) does not exist.', NEW.vehicle_id USING ERRCODE = 'P0002';
  END IF;

  IF v_status = 'retired' THEN
    RAISE EXCEPTION 'Cannot assign retired vehicle (%).', NEW.vehicle_id USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_assignment_check_retired ON public.vehicle_assignments;
CREATE TRIGGER trg_vehicle_assignment_check_retired
  BEFORE INSERT ON public.vehicle_assignments
  FOR EACH ROW EXECUTE FUNCTION public.fn_vehicle_assignment_check_retired();

-- Fleet Vehicle Assignment Immutability Trigger Function
CREATE OR REPLACE FUNCTION public.fn_enforce_vehicle_assignment_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Cannot delete vehicle assignment records (%).', OLD.id USING ERRCODE = '42501';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Cannot change company_id on vehicle assignment.' USING ERRCODE = '42501';
    END IF;
    IF NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id THEN
      RAISE EXCEPTION 'Cannot change vehicle_id on vehicle assignment.' USING ERRCODE = '42501';
    END IF;
    IF NEW.employee_id IS DISTINCT FROM OLD.employee_id THEN
      RAISE EXCEPTION 'Cannot change employee_id on vehicle assignment.' USING ERRCODE = '42501';
    END IF;
    IF NEW.from_date IS DISTINCT FROM OLD.from_date THEN
      RAISE EXCEPTION 'Cannot change from_date on vehicle assignment.' USING ERRCODE = '42501';
    END IF;

    IF OLD.to_date IS NOT NULL THEN
      IF NEW.to_date IS DISTINCT FROM OLD.to_date THEN
        RAISE EXCEPTION 'Cannot modify or reopen a closed vehicle assignment (%).', OLD.id USING ERRCODE = '42501';
      END IF;
    END IF;

    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_assignment_immutability ON public.vehicle_assignments;
CREATE TRIGGER trg_vehicle_assignment_immutability
  BEFORE UPDATE OR DELETE ON public.vehicle_assignments
  FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_vehicle_assignment_immutability();

-- Fleet Vehicles Odometer Non-Decreasing & Immutability Trigger Function
CREATE OR REPLACE FUNCTION public.fn_enforce_vehicle_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Cannot change company_id on vehicle.' USING ERRCODE = '42501';
    END IF;
    IF NEW.odometer_km < OLD.odometer_km THEN
      RAISE EXCEPTION 'Vehicle odometer_km cannot decrease (current %, attempted %).',
        OLD.odometer_km, NEW.odometer_km USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'retired' THEN
      RAISE EXCEPTION 'Only retired vehicles can be deleted (vehicle status is %).', OLD.status USING ERRCODE = '42501';
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_immutability ON public.vehicles;
CREATE TRIGGER trg_vehicle_immutability
  BEFORE UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_vehicle_immutability();

-- Fleet Fuel Log Immutability Trigger Function
CREATE OR REPLACE FUNCTION public.fn_enforce_fuel_log_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Cannot change company_id on fuel log.' USING ERRCODE = '42501';
    END IF;
    IF NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id THEN
      RAISE EXCEPTION 'Cannot change vehicle_id on fuel log (%).', OLD.id USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_fuel_logs_immutability ON public.vehicle_fuel_logs;
CREATE TRIGGER trg_vehicle_fuel_logs_immutability
  BEFORE UPDATE ON public.vehicle_fuel_logs
  FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_fuel_log_immutability();

-- Fleet Services Immutability & Status Transition Trigger Function
CREATE OR REPLACE FUNCTION public.fn_enforce_vehicle_service_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'done' THEN
      RAISE EXCEPTION 'Cannot delete a finalized vehicle service record (%).', OLD.id USING ERRCODE = '42501';
    END IF;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Cannot change company_id on vehicle service.' USING ERRCODE = '42501';
    END IF;
    IF NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id THEN
      RAISE EXCEPTION 'Cannot change vehicle_id on vehicle service (%).', OLD.id USING ERRCODE = '42501';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (
        (OLD.status = 'new' AND NEW.status = 'running') OR
        (OLD.status = 'running' AND NEW.status = 'done')
      ) THEN
        RAISE EXCEPTION 'Invalid vehicle service status transition from % to % (allowed: new -> running -> done only).',
          OLD.status, NEW.status USING ERRCODE = '42501';
      END IF;
    END IF;

    IF OLD.status = 'done' THEN
      IF NEW.cost_paise IS DISTINCT FROM OLD.cost_paise OR
         NEW.service_date IS DISTINCT FROM OLD.service_date OR
         NEW.odometer_km IS DISTINCT FROM OLD.odometer_km OR
         NEW.type IS DISTINCT FROM OLD.type THEN
        RAISE EXCEPTION 'Cannot modify financial, service date, type, or odometer details of finalized service (%).', OLD.id USING ERRCODE = '42501';
      END IF;
    END IF;

    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_services_immutability ON public.vehicle_services;
CREATE TRIGGER trg_vehicle_services_immutability
  BEFORE UPDATE OR DELETE ON public.vehicle_services
  FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_vehicle_service_immutability();

-- ----------------------------------------------------------------------------
-- 13. ATTACH updated_at TRIGGERS TO ALL MUTABLE TABLES
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  updated_at_tables text[] := ARRAY[
    'companies', 'company_counters', 'users', 'departments', 'designations', 'employees',
    'company_settings', 'employee_hr_details', 'employee_nominees',
    'employee_emergency_contacts', 'employee_documents', 'employee_face_profiles',
    'offer_letters', 'details_verifications', 'leave_types', 'leave_requests',
    'holidays', 'tasks', 'offices', 'attendance', 'work_mode_requests',
    'conversations', 'conversation_members', 'messages', 'notifications',
    'salary_structures', 'payrolls', 'user_activities',
    'expense_categories', 'expense_claims', 'expense_items',
    'salary_components', 'employee_salary_components',
    'payroll_periods', 'payroll_line_items',
    'vehicles', 'vehicle_assignments', 'vehicle_contracts', 'vehicle_services', 'vehicle_fuel_logs'
  ];
BEGIN
  FOREACH t IN ARRAY updated_at_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 14. ROW-LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
-- ----------------------------------------------------------------------------

-- Companies table RLS: can only see/update own row
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS companies_self_select ON public.companies;
CREATE POLICY companies_self_select ON public.companies FOR SELECT
  USING (id = (SELECT nullif(current_setting('app.company_id', true), '')::uuid));

DROP POLICY IF EXISTS companies_self_update ON public.companies;
CREATE POLICY companies_self_update ON public.companies FOR UPDATE
  USING (id = (SELECT nullif(current_setting('app.company_id', true), '')::uuid))
  WITH CHECK (id = (SELECT nullif(current_setting('app.company_id', true), '')::uuid));

-- Enable and Force RLS for all tenant-scoped tables
DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'company_keys', 'company_counters', 'users', 'departments', 'designations', 'employees',
    'company_settings', 'employee_hr_details', 'employee_nominees',
    'employee_emergency_contacts', 'employee_documents', 'employee_face_profiles',
    'audit_logs', 'offer_letters', 'details_verifications', 'leave_types', 'leave_requests',
    'holidays', 'tasks', 'offices', 'attendance', 'work_mode_requests',
    'conversations', 'conversation_members', 'messages', 'notifications',
    'salary_structures', 'payrolls', 'user_activities',
    'user_permissions', 'expense_categories', 'expense_claims', 'expense_items',
    'salary_components', 'employee_salary_components',
    'payroll_periods', 'payroll_line_items',
    'vehicles', 'vehicle_assignments', 'vehicle_contracts', 'vehicle_services', 'vehicle_fuel_logs'
  ];
  tenant_expr text := '(SELECT nullif(coalesce(nullif(current_setting(''app.company_id'', true), ''''), current_setting(''app.current_company_id'', true)), ''' shelter'')::uuid)';
  clean_expr text := '(SELECT nullif(coalesce(nullif(current_setting(''app.company_id'', true), ''''), current_setting(''app.current_company_id'', true)), '''ic'')::uuid)';
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON public.%I FOR ALL USING (company_id = (SELECT nullif(current_setting(''app.company_id'', true), '''')::uuid)) WITH CHECK (company_id = (SELECT nullif(current_setting(''app.company_id'', true), '''')::uuid))',
      t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 15. ROLE PRIVILEGES & SECURITY HARDENING
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Companies creation/deletion is platform/admin only
REVOKE INSERT, UPDATE, DELETE ON public.companies FROM app_user;
GRANT UPDATE (name, legal_name, logo_path, primary_color, employee_id_format) ON public.companies TO app_user;
GRANT SELECT (features) ON public.companies TO app_user;

-- Encryption keys must never be deleted by application code
REVOKE DELETE ON public.company_keys FROM app_user;

-- Audit logs are append-only: no updates or deletes permitted
REVOKE UPDATE, DELETE ON public.audit_logs FROM app_user;

-- Revoke direct table access from Supabase / PostgREST public roles if they exist
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON FUNCTION public.resolve_company(text) FROM %I', r);
    END IF;
  END LOOP;
END $$;

COMMIT;
-- ============================================================================
-- END OF CONSOLIDATED DATABASE SCHEMA
-- ============================================================================
