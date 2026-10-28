-- Oxoo Central additive integration migration
-- Source baseline: Oxoo.sql uploaded 2026-10-27.
-- IMPORTANT: Apply only to a restored/staging copy first. This is additive and
-- assumes the existing Oxoo tables from Oxoo.sql are already present.
-- It does NOT replace the existing schema or make product databases one DB.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stable canonical UUIDs can be added without changing existing serial IDs.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS oxoo_user_uuid uuid;
UPDATE public.users SET oxoo_user_uuid = gen_random_uuid() WHERE oxoo_user_uuid IS NULL;
ALTER TABLE public.users ALTER COLUMN oxoo_user_uuid SET DEFAULT gen_random_uuid();
ALTER TABLE public.users ALTER COLUMN oxoo_user_uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_oxoo_user_uuid_uq ON public.users(oxoo_user_uuid);

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS oxoo_organization_uuid uuid;
UPDATE public.organizations SET oxoo_organization_uuid = gen_random_uuid()
WHERE oxoo_organization_uuid IS NULL;
ALTER TABLE public.organizations ALTER COLUMN oxoo_organization_uuid SET DEFAULT gen_random_uuid();
ALTER TABLE public.organizations ALTER COLUMN oxoo_organization_uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizations_oxoo_org_uuid_uq
  ON public.organizations(oxoo_organization_uuid);

-- Keep phone verification explicit. Existing "verified=true" booleans on customers
-- are not treated as evidence that a current OTP verification happened.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone varchar(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_status varchar(20) NOT NULL DEFAULT 'pending';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.oxoo_identity_profiles (
  oxoo_user_uuid uuid PRIMARY KEY REFERENCES public.users(oxoo_user_uuid) ON DELETE RESTRICT,
  normalized_email text NOT NULL,
  normalized_phone text,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  identity_status text NOT NULL DEFAULT 'pending'
    CHECK (identity_status IN ('pending','active','locked','disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oxoo_identity_email_format_chk CHECK (position('@' in normalized_email) > 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS oxoo_identity_email_uq
  ON public.oxoo_identity_profiles (lower(normalized_email));
CREATE UNIQUE INDEX IF NOT EXISTS oxoo_identity_phone_uq
  ON public.oxoo_identity_profiles (normalized_phone)
  WHERE normalized_phone IS NOT NULL;

-- Do not auto-populate profiles as verified from legacy flags. A controlled backfill
-- should populate normalized identities and set verified timestamps only from proof.

CREATE TABLE IF NOT EXISTS public.oxoo_product_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oxoo_organization_uuid uuid NOT NULL
    REFERENCES public.organizations(oxoo_organization_uuid) ON DELETE RESTRICT,
  product_code text NOT NULL,
  subscription_id integer REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','trialing','active','grace','suspended','expired','cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oxoo_product_entitlement_org_product_uq UNIQUE (oxoo_organization_uuid, product_code)
);
CREATE INDEX IF NOT EXISTS oxoo_product_entitlements_status_idx
  ON public.oxoo_product_entitlements(status, ends_at);
CREATE INDEX IF NOT EXISTS oxoo_product_entitlements_subscription_idx
  ON public.oxoo_product_entitlements(subscription_id);

-- Product routing registry. Client secrets must never be stored in plaintext here.
CREATE TABLE IF NOT EXISTS public.oxoo_product_registry (
  product_code text PRIMARY KEY,
  display_name text NOT NULL,
  base_url text NOT NULL,
  oidc_client_id text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auditable, idempotent cross-system identity/tenant link records.
CREATE TABLE IF NOT EXISTS public.oxoo_identity_link_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code text NOT NULL,
  event_type text NOT NULL,
  oxoo_user_uuid uuid REFERENCES public.users(oxoo_user_uuid) ON DELETE SET NULL,
  oxoo_organization_uuid uuid REFERENCES public.organizations(oxoo_organization_uuid) ON DELETE SET NULL,
  product_user_id text,
  product_tenant_id text,
  correlation_id text,
  outcome text NOT NULL CHECK (outcome IN ('success','denied','error')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS oxoo_identity_link_events_created_idx
  ON public.oxoo_identity_link_events(created_at DESC);
CREATE INDEX IF NOT EXISTS oxoo_identity_link_events_tenant_idx
  ON public.oxoo_identity_link_events(oxoo_organization_uuid, product_code, created_at DESC);

-- Billing-cycle normalization is intentionally not enforced in this migration.
-- The existing app may contain legacy values/casing. Inventory and normalize
-- those values in a separate reviewed migration before adding a CHECK constraint.

COMMIT;

-- Post-migration review:
-- 1) reconcile legacy billing_cycle values before VALIDATE CONSTRAINT.
-- 2) populate oxoo_identity_profiles only from controlled verified-identity flow.
-- 3) populate oxoo_product_entitlements from approved subscriptions/plans.
-- 4) never infer product entitlement solely from selected_apps JSON.
-- 5) configure RLS / DB grants and application authorization separately.
