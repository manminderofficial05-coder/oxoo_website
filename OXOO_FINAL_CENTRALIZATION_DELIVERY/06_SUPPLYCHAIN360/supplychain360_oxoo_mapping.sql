-- SupplyChain360 additive Oxoo identity mapping migration
-- Product DB only. Does not merge operational records into Oxoo Central.
-- Run after backup, on staging first. No cross-database FK is possible.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.oxoo_tenant_mapping (
  product_tenant_id text PRIMARY KEY,
  oxoo_organization_uuid uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','suspended','disabled')),
  last_entitlement_check_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oxoo_tenant_mapping_org_uq UNIQUE (oxoo_organization_uuid)
);
CREATE INDEX IF NOT EXISTS oxoo_tenant_mapping_status_idx
  ON public.oxoo_tenant_mapping(status);

CREATE TABLE IF NOT EXISTS public.oxoo_user_mapping (
  product_user_id text PRIMARY KEY,
  oxoo_user_uuid uuid NOT NULL,
  product_tenant_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oxoo_user_mapping_user_tenant_uq UNIQUE (oxoo_user_uuid, product_tenant_id),
  CONSTRAINT oxoo_user_mapping_tenant_fk FOREIGN KEY (product_tenant_id)
    REFERENCES public.oxoo_tenant_mapping(product_tenant_id) ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS oxoo_user_mapping_canonical_user_idx
  ON public.oxoo_user_mapping(oxoo_user_uuid);
CREATE INDEX IF NOT EXISTS oxoo_user_mapping_tenant_status_idx
  ON public.oxoo_user_mapping(product_tenant_id, status);

CREATE TABLE IF NOT EXISTS public.oxoo_entitlement_cache (
  product_tenant_id text NOT NULL REFERENCES public.oxoo_tenant_mapping(product_tenant_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  product_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','trialing','active','grace','suspended','expired','cancelled')),
  checked_at timestamptz,
  valid_until timestamptz,
  source_version text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(product_tenant_id, product_code)
);
CREATE INDEX IF NOT EXISTS oxoo_entitlement_cache_valid_idx
  ON public.oxoo_entitlement_cache(status, valid_until);

COMMIT;

-- IMPORTANT:
-- * Do not backfill mappings by matching email alone without duplicate review.
-- * Do not mark mapping/entitlement active until central identity and subscription
--   are verified by trusted server-to-server integration.
-- * Product application must reject missing mappings and all unknown statuses.
-- * Keep this database's existing business data and IDs unchanged.
