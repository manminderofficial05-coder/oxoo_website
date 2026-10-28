# Oxoo Central Schema Drift Report

**Generated:** 2026-10-28  
**Environment:** Live Neon PostgreSQL Database (`multiix`)  
**Target:** Authoritative Identity & Entitlement Control Plane  

---

## 1. Executive Summary

A comprehensive inventory and baseline comparison was performed against the live PostgreSQL database (`multiix`) and the reference snapshot `08_ORIGINAL_SCHEMA_SNAPSHOTS/Oxoo.sql` prior to applying additive central migration `001_oxoo_central_additive_integration.sql`.

The live database consists of **33 tables**, containing active operational entities across users, organizations, customers, subscriptions, and platform staff. The database is in an un-migrated state regarding canonical UUIDs and central identity tables (`oxoo_*`), providing a clean slate for non-destructive additive integration.

---

## 2. Inventory & Table Comparison

| Object Category | Baseline (`Oxoo.sql`) | Live Neon Database | Drift Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Core Tables Count** | 26 tables | 33 tables | 7 additional tables in live DB (`agent_conversations`, `agent_events`, `agent_messages`, `customer_notifications`, `subscription_followup_notes`, `subscription_reminders`, `ticket_attachments`) | None; extensions are backward-compatible operational tables |
| **Central Identity Tables** | Not present | Not present (`oxoo_*` count: 0) | Clean | Create `oxoo_identity_profiles`, `oxoo_product_entitlements`, `oxoo_product_registry`, `oxoo_identity_link_events` |
| **`users` Table Canonical UUID** | None (SERIAL `id` only) | None (SERIAL `id` only) | Clean | Add additive `oxoo_user_uuid` with `gen_random_uuid()` default and unique index |
| **`organizations` Canonical UUID** | None (SERIAL `id` only) | None (SERIAL `id` only) | Clean | Add additive `oxoo_organization_uuid` with `gen_random_uuid()` default and unique index |
| **`users` Contact & Status Columns** | `email`, `role`, `organization` | `phone`, `email_verified_at`, `phone_verified_at`, `identity_status` missing | Clean | Add additive columns to `users` with default `identity_status = 'pending'` |
| **`subscriptions.billing_cycle`** | Mixed text | 4 `monthly`, 1 `yearly` | Fully compliant | Reconcile and apply check constraint safely |
| **`customers.email_verified` / `phone_verified`** | Boolean defaults `true` | Boolean defaults `true` | **Critical Policy Note** | Never infer verification from legacy booleans; track strictly via `oxoo_identity_profiles` verified timestamps |

---

## 3. Data Integrity & Cardinality Baseline

- **Users:** 4 records (including Super Admin `manminder.singh@primepro.ai` and Admin `admin@oxoo.ai`).
- **Organizations:** 3 records (`Maan Corp`, `ABC Enterprises`, `Oxoo.ai Enterprise`).
- **Subscriptions:** 5 active records (all utilizing `monthly` or `yearly`).
- **Customers:** 4 records across real customer and tenant domains.
- **Products:** 9 products seeded in `products` catalog.

---

## 4. Key Decisions & Safeguards

1. **Additive Only:** Existing integer primary keys (`users.id`, `organizations.id`) remain preserved to avoid breaking legacy queries or foreign keys.
2. **Canonical Identity:** `oxoo_user_uuid` and `oxoo_organization_uuid` serve as the immutable cross-system identifiers.
3. **Verification Enforcement:** Identities will default to `identity_status = 'pending'` with `email_verified_at` and `phone_verified_at` set to `NULL` until authenticated via controlled OTP challenge.
4. **Separate Internal Staff:** PrimePro internal staff (`@primepro.ai`) are allocated dedicated organization context with audit logs separate from external customer tenants.
5. **Fail-Closed Entitlement:** Entitlement checks will deny access if identity is pending/locked, contacts unverified, or subscription expired/suspended.

---
*Report certified for migration execution.*
