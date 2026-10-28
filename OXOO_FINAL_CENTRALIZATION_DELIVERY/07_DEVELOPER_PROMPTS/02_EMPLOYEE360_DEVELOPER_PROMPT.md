# Developer prompt — Employee360 HRMS (`employee360.in`)

Source of truth: `08_ORIGINAL_SCHEMA_SNAPSHOTS/employee360.sql` (43-table PostgreSQL schema) and `02_EMPLOYEE360/employee360_oxoo_mapping.sql`.

1. Audit the full 43-table schema, RLS policies, functions, triggers, roles, storage paths and app queries. Confirm live schema/migration history before editing.
2. Map each existing `companies.id` to an Oxoo `oxoo_organization_uuid`; do not replace local company UUIDs. Map users by reviewed identity records, not email alone.
3. Preserve existing company_id-based composite foreign keys and RLS. Add mapping tables only as a bridge; do not change the HRMS company's internal tenant key without a planned dual-key migration.
4. Verify every table with company_id and every indirect child relationship, RPC/security-definer function, trigger, background task and storage object enforces company scope.
5. Implement OIDC login against Oxoo Central; local role is still HRMS-scoped and must not be overwritten by global Oxoo roles. Require verified email and phone and active HRMS entitlement.
6. On suspension, block new HRMS operations according to policy but retain employee, payroll, attendance, audit and document data. Define permitted read-only/export behavior explicitly.
7. Review sensitive Aadhaar/PAN/bank data, biometric consent, encryption key handling and access logging. Do not expose these fields through SSO claims.
8. Test cross-company reads/writes, RLS under the actual app DB role, SECURITY DEFINER functions, payroll, attendance, documents, and subscription suspension.
9. Deliver schema/migrations, deterministic mapping/backfill report, RLS tests, staging evidence and rollback steps. No production migration before staging and backup.
