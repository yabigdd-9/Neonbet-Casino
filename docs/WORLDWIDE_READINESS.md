# Worldwide real-money readiness

Status: preparation only. No real-money markets are approved or enabled. The browser games and credits are simulated; no real-money account, ledger, settlement, payment, identity verification or geolocation service is implemented by this document or the accompanying readiness module.

`server/iso3166.json` is a snapshot of the 249 ISO 3166-1 regions from the system tz database `iso3166.tab` (2024-02-29 ISO snapshot). It is an inventory, not a statement that a region is a permitted gambling market. `server/marketReadiness.ts` assigns every region an unreviewed status for legal review, licensing, game and payment providers, age and identity, advertising, responsible play, transaction monitoring and support. Refresh the region list and obtain current, qualified advice before using it for decisions. Entries cannot be approved in this implementation.

The readiness module's `authorizeRealMoney` always denies registration, play, deposit and withdrawal for every input. It is not wired to a deployed endpoint, so it must not be represented as production geolocation or an access-control system. Before launch, enforce independent, server-side deny-by-default checks at every money-bearing endpoint, using trusted location evidence, account identity, licence coverage, provider availability and reviewed market records. Treat absent, conflicting or stale evidence as denial. Do not rely on a browser-provided country or this static inventory alone.

`server/syntheticReconciliation.ts` is a local, in-memory exercise for synthetic records. It reports duplicate, missing, unexpected, mismatched, unconfirmed and malformed entries. It does not fetch chain or provider data, establish ownership or confirmations, persist results, reconcile a ledger, or authorize a credit or payout.

## Operator verification

The operator name, Curaçao licence number, approved domain, player markets and provider identities have not been supplied or verified. Obtain these from the operator and check the [Curaçao Gaming Authority licence information](https://portal.gamingcontrolcuracao.org/page/online-gaming-info) and [licence register](https://cert.cga.cw/) directly. Record the licence, operator, domain, scope, verification date, reviewer and evidence in a restricted operational system; investigate expiry or discrepancies. Do not create or display a seal without regulator authorization.

## Required implementation before real-money activation

- Confirm legal and advertising requirements for each specific player market, including territorial restrictions and any additional local licences; have qualified local reviewers approve and date each decision.
- Select approved game and payment/custody providers and verify their contracts, supported assets, network, market and sandbox capabilities. Verify every deposit destination independently and generate QR payloads from verified data.
- Implement server-owned accounts, authenticated access, immutable auditable financial events, transactional idempotent postings, available/reserved balances, concurrency handling, provider reconciliation and independently tested recovery. No browser balance is a money ledger.
- Add identity and age verification, exclusions, limits, monitoring, support and dispute procedures appropriate to each approved market. Store sensitive evidence with retention and access controls, not in browser storage or source control.
- Test isolation, access denial, spoofed or uncertain location, replay, duplicate references, reversals, concurrency, service failure and reconciliation differences against a non-production environment. Obtain independent game and security testing, regulator and provider approvals, operational acceptance and explicit production authorization before activation.

## Sharing wording

Until all of the above is complete, public and chat promotional text should identify NeonBet as a simulated demo with no cash value and tell recipients not to send cryptocurrency. Do not claim a real-money bonus, payment approval, licence or certification. Messages to third parties require separate explicit authorization and an identified audience.
