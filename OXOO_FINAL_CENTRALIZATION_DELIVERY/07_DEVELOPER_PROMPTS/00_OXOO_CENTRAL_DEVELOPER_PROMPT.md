# Developer prompt — Oxoo Central (`oxoo.ai`)

Use the latest `Oxoo.sql` snapshot and `01_OXOO_CENTRAL/001_oxoo_central_additive_integration.sql`. Do not use superseded schema versions.

## Objective
Make Oxoo the authoritative identity, organization, subscription, billing and entitlement control plane while product operational databases remain separate.

## Work
1. Read the complete existing schema and current repository migrations. Confirm live DB matches this baseline; produce a drift report before changing anything.
2. Review the additive SQL for compatibility with actual current constraints/data. Run on a restored staging clone first.
3. Preserve existing serial IDs. Add/use canonical `oxoo_user_uuid` and `oxoo_organization_uuid`; don't replace IDs or infer links from company name.
4. Implement controlled email and phone OTP verification. Never infer verification from legacy booleans/defaults. Normalize email and E.164 phone before uniqueness checks; handle duplicate/invalid legacy data through a review report.
5. Backfill identity profiles only from verified evidence; unresolved identities remain pending.
6. Populate product registry with approved OIDC client IDs/redirect URIs. Keep client secrets in a secret manager, not DB/plaintext.
7. Backfill product entitlements from authoritative subscriptions and approved plans. Don't infer active access only from JSON `selected_apps`.
8. Implement server-side APIs for authorization code + PKCE/OIDC, tenant/user mapping, membership validation and product entitlement checks. Validate issuer, audience, expiry, state/nonce as applicable, signing keys, redirect URI and replay protection.
9. Implement auditable suspension/reactivation. On non-payment suspend access after approved policy/grace rules; retain all business data. Do not delete customer records.
10. Separate PrimePro internal organization and staff from customers. Product department heads must be limited to their own product; global superadmin actions require explicit role and audit logs.
11. Normalize and validate legacy billing cycles before validating the added CHECK constraint. Include quarterly/six-monthly only if product policy supports them.
12. Remove hardcoded demo secrets/default personal identities from production configuration; rotate any credential that was ever exposed.
13. Test with at least two organizations and two users, including cross-tenant denial, duplicate email/phone, unverified contacts, suspended subscriptions, product-specific staff permissions, webhook replay/idempotency and rollback.
14. Deliver migrations, backfill scripts, API contract, env var list, tests/logs, rollback plan and go/no-go report.

Never run a destructive migration on production without backup, staging evidence, an approved window and a tested recovery plan.
