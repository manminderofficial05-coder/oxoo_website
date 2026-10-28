# Developer prompt — AI Sales Agent (`aisales360.in`)

Use the latest `AI_Sales.prisma` snapshot plus the existing Oxoo-centralization edits already in the repository. Do not overwrite newer code with the uploaded baseline. `03_AI_SALES_AGENT/ai_sales_agent_oxoo_centralized.prisma` is a proposed mapping-model reference; reconcile it against the live repo before use.

1. Audit all 31 Prisma models and all other persistence/execution surfaces: PostgreSQL, MySQL WhatsApp automation DB, Redis/BullMQ, scheduled jobs, raw SQL, file/object storage, exports, telephony, webhooks and callbacks.
2. Confirm live schema and migration drift. Keep the existing local Organization/User IDs and map them to canonical Oxoo UUIDs.
3. Review `oxoo_tenant_mapping`, `oxoo_user_mapping` and entitlement cache migration. Align Prisma mappings, table naming and field types with the actual repository code; do not apply duplicate mapping migrations.
4. Fail closed for missing/unknown/pending mappings and missing entitlement responses. Verify authoritative entitlement server-side before campaign/call actions and again in workers immediately before execution.
5. Validate every lead-agent-conversation-call relationship against the same organization. Add explicit tenant ownership to ScheduledJob and all durable queue payloads; backfill deterministically.
6. Verify every provider webhook with the provider's signature rules and exact configured URL. Missing production secrets must reject requests. Audit Twilio, Exotel, WhatsApp, call status, media stream and callback routes separately; add replay/idempotency protection.
7. SSO must use real Oxoo issuer/signing keys, correct issuer/audience/expiry/state/PKCE checks, verified identity and active product membership. Disable mock auth in production.
8. Suspension must prevent new restricted actions while retaining recordings, transcripts, leads, campaigns and logs. Check all workers, retries, schedulers and inbound paths.
9. Add adversarial two-tenant tests, missing-secret tests, invalid-token tests, queue/scheduler tenant mismatch tests, entitlement outage tests, and export access tests.
10. Deliver actual executed test output, schema drift report, all migrations, env requirements, staging/rollback plan and GO/NO-GO. Do not claim readiness based only on `tsc`.
