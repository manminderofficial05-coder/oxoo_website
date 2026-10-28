-- Oxoo Central Rollback Script
-- Target: Safe reversal of 001_oxoo_central_additive_integration.sql and central objects
-- IMPORTANT: Run only in emergency rollback windows with approved data backup.
-- This script does not drop existing core business tables (users, organizations, subscriptions, etc.)
BEGIN;

-- 1. Remove Billing Constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_billing_cycle_chk;

-- 2. Drop Oxoo Central Tables (in reverse dependency order)
DROP TABLE IF EXISTS public.oxoo_identity_link_events CASCADE;
DROP TABLE IF EXISTS public.oxoo_product_entitlements CASCADE;
DROP TABLE IF EXISTS public.oxoo_identity_profiles CASCADE;
DROP TABLE IF EXISTS public.oxoo_product_registry CASCADE;

-- 3. Drop Canonical Indexes
DROP INDEX IF EXISTS public.users_oxoo_user_uuid_uq;
DROP INDEX IF EXISTS public.organizations_oxoo_org_uuid_uq;

-- 4. Drop Additive Columns from Core Tables
ALTER TABLE public.users DROP COLUMN IF EXISTS oxoo_user_uuid;
ALTER TABLE public.users DROP COLUMN IF EXISTS email_verified_at;
ALTER TABLE public.users DROP COLUMN IF EXISTS phone_verified_at;
ALTER TABLE public.users DROP COLUMN IF EXISTS identity_status;

ALTER TABLE public.organizations DROP COLUMN IF EXISTS oxoo_organization_uuid;

COMMIT;

-- Rollback Complete. Database returned to pre-centralization baseline.
