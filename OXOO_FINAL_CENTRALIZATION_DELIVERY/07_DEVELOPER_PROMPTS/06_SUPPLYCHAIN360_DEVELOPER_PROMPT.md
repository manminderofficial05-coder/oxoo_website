# Developer prompt — SupplyChain360 (`supplychain360.in`)

Use `08_ORIGINAL_SCHEMA_SNAPSHOTS/Supply_Chain.prisma` (62 models) and `06_SUPPLYCHAIN360/supplychain360_oxoo_mapping.sql`. Preserve newer repository changes.

1. Audit all 62 models and every relation, raw query, API, job, import/export, file, workflow and integration.
2. Map each Organization/User to Oxoo canonical UUIDs; retain existing product-local UUIDs.
3. Trace tenant ownership through warehouses, locations, inventory, purchase orders, goods receipts, deliveries, transfers, manufacturing, quality, returns, shipping, fleet, customs, forecasts, workflow executions and audit records.
4. Ensure every child row's parent, supplier/customer, warehouse, stock movement and actor are in the same organization. Add composite tenant constraints where practical; don't assume an organization relation on the parent is sufficient unless every query validates it.
5. Implement Oxoo OIDC SSO, product-specific roles and authoritative entitlement checks. Do not trust browser-supplied tenant IDs.
6. Suspension prevents new writes/workflows according to policy but preserves inventory, transaction and audit history. Never delete operational data due to unpaid subscription.
7. Test cross-tenant IDs, warehouse transfer, shipment, purchase order, inventory adjustment, background workflow and export boundaries.
8. Deliver migrations, mapping report, tests, staging rollout and rollback plan.
