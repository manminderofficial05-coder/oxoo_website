# SupplyChain360 migration notes

Product domain: `supplychain360.in`

Source snapshot: `../08_ORIGINAL_SCHEMA_SNAPSHOTS/Supply_Chain.prisma`

Apply `supplychain360_oxoo_mapping.sql` to this product's database only. It creates mapping/cache tables; it does not automatically tenant-scope all business tables or wire up SSO.

Required before production:
- Audit every model/table, raw SQL query, API, queue, scheduler, webhook, file/object path, export and report.
- Establish ownership for each row and enforce that all referenced rows belong to the same tenant.
- Add missing tenant columns only with deterministic backfills; unresolved ownership must be quarantined for manual review, not guessed.
- Implement server-side OIDC validation and call Oxoo Central's entitlement endpoint; never trust tenant IDs or roles from the browser.
- Keep local product IDs stable and map them to Oxoo UUIDs.
- Verify the migration on a staging clone and prepare rollback that preserves mapping data.
