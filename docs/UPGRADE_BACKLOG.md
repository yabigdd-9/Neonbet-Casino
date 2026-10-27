# Current upgrade backlog

Updated 22 October 2026. This replaces the stale Commercial V2 checklist; historical implementation notes remain in UPGRADE_LOG.md. Local evidence is recorded in FULL_UPGRADE_REPORT.md.

## Implemented in this upgrade

- [x] Auth return-shape correction, synchronous subscription cleanup and event-aware recovery form.
- [x] Account loading extraction, stale-response rejection, visible errors and admin-only paginated queries. Follow-up checks preserve page consistency and distinguish the admin's own records from review-queue records.
- [x] Shared runtime mode resolver, conditional single client, missing-config error and restored environment template.
- [x] User-scoped demo record migration, validated saved identities and catalogue-resolved recent IDs.
- [x] Refined NeonBet lobby, responsive card catalogue, sidebar overlap fix and state-aware navigation.
- [x] Safe-area mobile controls, named dialogs, focus management, reduced-motion scrolling and local panel fallbacks.
- [x] App-owned exactly-once rounds, integer cents, shared arcade engines and reachable Plinko payout tiers.
- [x] Network-aware transaction references, decimal/length/method checks and terminal withdrawal transition enforcement.
- [x] Lazy feature modules, precomputed catalogue search, pagination and enforced initial-JS budget.
- [x] Typed account/services/provider boundaries, lint/format tooling, regression/browser tests and deployment validation dependency.
- [x] Async provider contracts and local synthetic signature/idempotency/retry harness.
- [x] Updated setup, architecture, verification and activation documentation.

## Remaining gates and separate work

- [ ] Run the updated workflow against a pushed review branch; local checks are not remote CI evidence.
- [ ] Review and accept the code and screenshots before merging; main pushes deploy automatically.
- [x] Recheck dependencies: on 27 October 2026, the full and production-only npm audits both report zero known advisories. The previously reported braces advisory was withdrawn and the installed selector parser is patched; repeat the audit when preparing a release.
- [ ] Verify live Supabase configuration, email recovery/confirmation delivery, Data API access and RLS against the intended project; no live database was accessed here.
- [ ] Select launch markets, operator and providers, then implement their actual server integrations using INTEGRATION_ACTIVATION.md.
- [ ] Real-device Safari/Android and assistive-technology acceptance; desktop WebKit/Chromium viewport tests do not replace these.
- [ ] Remaining JSX-to-TypeScript migration, optional buyer setup wizard, multi-tenancy, durable payment ledger and provider-specific reconciliation are separate enhancements.
