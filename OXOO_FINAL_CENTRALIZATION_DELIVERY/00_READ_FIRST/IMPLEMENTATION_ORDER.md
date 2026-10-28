# Implementation order

1. Oxoo Central developer: verify live DB, implement canonical IDs, verified identity, product registry, authoritative entitlement API and audit.
2. AI Sales Agent developer: continue from current repo changes; remediate fail-open webhook/entitlement and job/tenant mismatches identified in review.
3. Employee360 developer: verify RLS and company_id isolation.
4. SalesWorks360 CRM developer: prove tenant ownership through all 28 models and APIs.
5. Invoice360 developer: confirm Accounting.sql is complete/current; then map existing company/user identities.
6. SupplyChain360 developer: prove tenant ownership through all 62 models and workflows.
7. Integration lead: run end-to-end SSO, subscription lifecycle, tenant isolation, PrimePro staff scope and cross-product tests.

Do not allow product teams to independently invent their own OIDC claims or entitlement states. Publish one versioned Oxoo integration contract first.
