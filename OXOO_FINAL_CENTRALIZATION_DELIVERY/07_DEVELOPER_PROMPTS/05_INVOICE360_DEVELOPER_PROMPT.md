# Developer prompt — Invoice360 (`invoice360.in`)

Source: `08_ORIGINAL_SCHEMA_SNAPSHOTS/Accounting.sql` (6-table SQL schema). First compare this exact snapshot to the actual Invoice360 repository and live DB; do not assume it is the complete accounting schema.

1. Produce a read-only schema/table/constraint/index inventory and drift report. Do not execute the source SQL as a reset.
2. Preserve existing UUID user/company IDs, finance_records composite keys, invoice payments and audit history.
3. Create mappings from existing `companies.id` and users to Oxoo canonical UUIDs; do not equate local UUIDs with Oxoo UUIDs.
4. Review every `finance_records.collection` payload for company ownership and enforce company-scoped reads/writes. Validate invoice_id/customer_id references at application/service layer if IDs are polymorphic.
5. Integrate OIDC SSO and product entitlement checks on every accounting API. Enforce company membership and roles server-side.
6. Preserve accounting/audit records on suspension. Block new writes/invoicing as policy dictates, but retain historical invoices and payments.
7. Add idempotency and audit tests for payment create/update/delete; ensure audit rows cannot be altered by ordinary users.
8. Deliver actual migration files, data reconciliation report, tenant-isolation tests, staging evidence and rollback instructions. If the source schema is incomplete or differs from live Invoice360, stop and report the gap before migration.
