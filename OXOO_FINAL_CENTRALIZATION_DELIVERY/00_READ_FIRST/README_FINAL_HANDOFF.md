# OXOO CENTRALIZATION DELIVERY — READ FIRST

## Included current source snapshots
- `08_ORIGINAL_SCHEMA_SNAPSHOTS/Oxoo.sql`: 26-table Oxoo Central SQL export (Neon PostgreSQL, 2026-10-27).
- `employee360.sql`: 43-table Employee360 PostgreSQL schema with company_id tenancy/RLS design.
- `AI_Sales.prisma`: 31 Prisma models.
- `Sales360.prisma`: 28 Prisma models.
- `Accounting.sql`: 6-table accounting schema.
- `Supply_Chain.prisma`: 62 Prisma models.

These are the exact uploaded snapshots, copied for reference. Do not execute these source snapshots against existing databases as migrations.

## Architecture
Oxoo Central is the identity and control plane. Product operational data stays in each product database. Cross-database identity uses canonical Oxoo UUIDs plus explicit local-ID mapping tables; no cross-database foreign keys are assumed.

Canonical central UUIDs are additive columns because the current Oxoo export uses SERIAL primary keys. Existing primary keys must remain unchanged.

## Main files
- `01_OXOO_CENTRAL/001_oxoo_central_additive_integration.sql`
- `01_OXOO_CENTRAL/002_post_backfill_validation.sql`
- Each product folder contains a product-specific mapping migration and instructions.
- `AI_Sales.prisma`, `Sales360.prisma`, and `Supply_Chain.prisma` have proposed Prisma mapping models appended as copies; original snapshots remain untouched.
- `07_DEVELOPER_PROMPTS/` has the implementation prompt for each developer.

## Critical limitation / honest status
This package is an additive integration baseline and developer handoff, not a claim that every product is fully tenant-isolated or production-certified. The uploaded schemas alone do not include the full live application code, migration history, data distribution, OIDC issuer contract, provider secrets, or live database metadata. Therefore it is unsafe to generate deterministic backfills or claim complete production-ready tenant migrations for every table without inspecting each repository/live staging database.

In particular:
- Oxoo.sql has legacy tables with duplicated concepts (`applications`/`platform_applications`, `customers`/`organizations`, `products`/`platform_applications`) and text status/billing fields. Reconcile application semantics before deprecating anything.
- `platform_applications.service_key` has a hardcoded-looking default. Check live data, remove secret defaults and rotate any real exposed credential.
- `audit_logs` includes personal-name/IP/user-agent defaults; replace misleading defaults with actual actor/request context.
- `customers.email_verified` and `phone_verified` default to true. Do not treat those defaults as verification evidence.
- Employee360 schema already uses `company_id` tenancy and composite foreign keys/RLS design. Verify RLS policies, role grants and SECURITY DEFINER functions in the actual live DB.
- Accounting.sql is a small 6-table schema with JSONB `finance_records`; verify it is the actual full Invoice360 schema before migration.
- Product schemas and code can drift. The AI Sales Agent repository already has recent code changes; do not overwrite them with the uploaded baseline.

## Safe execution order
1. Freeze schema edits and capture exact repository commit IDs.
2. Take verified database backups and test restore.
3. Run read-only live schema inventory and compare with snapshots/migration history.
4. Apply only additive migrations on staging clone.
5. Generate a data reconciliation report. Never auto-map by company name or email alone where duplicates/ownership ambiguity exist.
6. Implement server-side OIDC and authoritative entitlement API. Mapping tables are not an authorization system by themselves.
7. Backfill mappings; unresolved records stay pending/quarantined.
8. Run two-tenant adversarial tests across APIs, jobs, webhooks, file storage, reports and exports.
9. Test suspension/reactivation and confirm data retention.
10. Review deployment/rollback plan; release only after sign-off.

## Required shared rules
- Same canonical identity across products; email and mobile must both be verified before the required customer access is granted.
- Product roles remain product-scoped; department heads cannot access other products' customer data.
- PrimePro internal organization remains distinct from external customers.
- Subscription lapse suspends access under approved grace rules, but does not delete customer data.
- Never trust client-provided organization IDs, roles, or entitlements.
- Prefer OIDC Authorization Code + PKCE. Do not place credentials or long-lived tokens in URLs.
- Central service failure must not grant new restricted actions. Define controlled outage behavior and use short-lived signed entitlement snapshots only if architecture explicitly approves them.
- Do not run destructive SQL or migrations directly on production without backup, staging verification, approved change window, and tested recovery.
