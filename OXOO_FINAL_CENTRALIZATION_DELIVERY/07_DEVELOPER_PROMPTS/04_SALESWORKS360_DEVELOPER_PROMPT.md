# Developer prompt — SalesWorks360 CRM (`salesworks360.in`)

Use `08_ORIGINAL_SCHEMA_SNAPSHOTS/Sales360.prisma` and `04_SALESWORKS360_CRM/salesworks360_oxoo_mapping.sql` as references. Preserve newer repository changes.

1. Audit all 28 Prisma models, relation paths, API handlers, raw SQL, exports, jobs and storage.
2. Map every existing Organization and user to canonical Oxoo UUIDs without changing product IDs.
3. For every tenant-owned table/model, prove tenant ownership is enforced directly or through a verified relation. For child relations, enforce that parent, actor and organization match; prevent IDOR via guessed IDs.
4. Add/backfill missing organization ownership only with deterministic rules; quarantine ambiguous/orphaned rows for review.
5. Implement Oxoo OIDC SSO and server-side entitlement checks; CRM roles remain product-scoped. Department heads of other products must not access CRM customer data.
6. Review `ai_access_state`, inbound calls, activities, payments, documents, tasks, team membership and audit logs for tenant leakage.
7. Suspension blocks new paid CRM operations per policy without deleting customer data. Define and test read-only access.
8. Run two-tenant integration tests on all read/write/list/search/export endpoints and background jobs. Deliver migration/backfill report, tests, rollback and staging deployment instructions.
