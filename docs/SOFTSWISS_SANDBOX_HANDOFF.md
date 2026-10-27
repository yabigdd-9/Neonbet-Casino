# SOFTSWISS sandbox handoff

Status: waiting for provider onboarding. This document is a readiness template, not SOFTSWISS API documentation or proof of a working integration. Do not infer endpoint paths, request formats, authentication algorithms or supported countries from the local placeholder.

## Information to obtain

- Product and contract: Casino Platform, Game Aggregator or both; supported operator, licence, domains and player markets; who owns the player account, wallet and bonus calculations.
- Official versioned API and change-notification documentation; sandbox endpoint and access provisioning procedure; approved contacts and escalation path.
- Signed callback verification, source authentication, timestamp and replay requirements; idempotency keys, transaction identifiers, expiry, retry rules and error classifications.
- Game catalogue and launch-session rules, supported currencies and games, permitted URL hosts, session termination and provider-specific authorization requirements.
- Settlement, cancellation, rollback, bonus and balance semantics, including whether the proposed $50/30× offer is allowed in each intended market.
- Separate crypto payment and custody provider identity, asset/network support, deposit confirmations, payout authorization, transaction status and reconciliation statements. Do not assume the game aggregator is a payment processor.

## Local integration design checkpoints

- Keep the existing demo provider and real-money provider capabilities separate. Implement a server-enforced default-deny market boundary that fails closed if licence, market, provider or identity evidence is missing; no such production boundary currently exists.
- Implement provider communication only on an authenticated server. Put secrets in an approved secret manager; do not commit credentials, place them in browser configuration, or include them in logs, screenshots or test artifacts.
- Map provider responses and errors into internal types only after reading the contracted specification. Validate launch URLs against an explicit provider-approved allowlist and never trust a browser-supplied callback or balance.
- Use a durable, transactional ledger and audit trail, with per-operation idempotency, before connecting monetary traffic. Provider callbacks must be authenticated, deduplicated and reconciled against trusted records.
- Run only synthetic local fixtures until sandbox access is explicitly granted. Keep sandbox data, credentials and endpoints separate from production.

## Evidence to record without secrets

| Item                | Evidence to capture                                                            | Status       |
| ------------------- | ------------------------------------------------------------------------------ | ------------ |
| Operator and market | Verified operator, licence scope, approved domains and market decisions        | Not supplied |
| Contract and API    | Product, documentation version, test environment and acceptance contact        | Not supplied |
| Security            | Authentication method, secret storage, callback verification and replay policy | Not supplied |
| Money flow          | Wallet owner, ledger mapping, transaction and reversal semantics               | Not supplied |
| Test run            | Revision, date, synthetic test cases, outcomes and unresolved failures         | Not run      |
| Acceptance          | Provider validation, independent review and authorized launch decision         | Not obtained |

## Minimum sandbox scenarios

Test a successful and expired game launch, disallowed game or market, missing identity, provider timeout, malformed response, callback signature failure and replay. Exercise duplicate and out-of-order transactions, insufficient funds, simultaneous operations, settlement and reversals, reconciliation discrepancies and service recovery. Confirm that all tests use non-production accounts and no funds move.

The current `SoftSwissCandidate` rejects all catalogue and launch operations. The unrelated `FakeProvider` is a generic synthetic harness and must not be described as a SOFTSWISS sandbox or used to claim provider approval.
