# Integration activation checklist

The delivered scope is disabled adapter contracts and a local synthetic harness. No provider, launch country or licensed operator has been selected. These decisions must be made before implementing a live adapter.

## Product and provider decisions

- [ ] Identify the operator, target countries, permitted users and approval owner.
- [ ] Select the game aggregator and payment/custody provider; obtain their sandbox access and official API/version documentation.
- [ ] Confirm supported assets/networks/currencies, region restrictions, game catalogues, player identifiers and launch-session expiry.
- [ ] Establish provider acceptance, age/identity checks, exclusions, limits and support/dispute procedures for the intended operation.

## Backend requirements for the next phase

- [ ] Deploy a separate authenticated server endpoint. Keep provider signing credentials in a server secret store; never in Vite variables.
- [ ] Implement an auditable, durable ledger and separate simulated credits from monetary balances. Require server-authoritative wagers and settlement.
- [ ] Define deposit, withdrawal, cancellation, refund, chargeback and reversal transitions using the chosen provider's actual semantics.
- [ ] Persist idempotency keys and webhook receipts transactionally; authenticate raw request bodies and validate account, currency, amount and transaction ownership.
- [ ] Configure callback URLs, replay windows, rate limits, bounded retry/backoff, delivery queues and reconciliation against provider statements.
- [ ] Implement an explicit payout approval workflow and reconciliation checks before any actual transfer.

## Acceptance and rollout

- [ ] Test sandbox signatures, duplicates, out-of-order callbacks, timeouts, retries, insufficient funds, concurrency, reversals and reconciliation differences.
- [ ] Apply and verify required migrations in the intended non-production Supabase project; check actual Auth, Data API privileges, RLS and advisors.
- [ ] Record exact frontend/backend revisions, provider versions, environment ownership and test evidence.
- [ ] Obtain an explicit operational acceptance decision before enabling live capabilities, moving funds or deploying production schema changes.

The fake harness uses in-memory maps, a test signing secret and immediate bounded retries. It does not provide durable delivery, reconciliation, live credentials, compliance acceptance or payment processing. Passing its tests demonstrates the interface behavior only.
