# Integration activation checklist

The delivered scope is disabled adapter contracts and a local synthetic harness. No provider, launch country or licensed operator has been selected. These decisions must be made before implementing a live adapter.

## Manual crypto preparation

The screenshots supplied by the operator are reference material, not verified configuration. Do not copy their addresses into a build or accept funds until an authorized operator independently verifies the exact asset, network, destination, custody arrangements and acceptance criteria with the destination wallet or exchange. The server-only `depositDirectory` validator accepts synthetic records with an operator verification record, but it cannot prove that verification occurred or that an address belongs to the operator. It is not connected to the frontend or a database. Verification QR placeholders are not displayed; a future implementation must generate each QR from its exact verified address and test the decoded payload.

Remote main proposed BTC on Bitcoin, ETH on Ethereum, USDT on BSC, Tron, Ethereum and Solana, SOL on Solana, TRX on Tron, and BNB on BSC. These network combinations are candidates, not enabled deposit methods. The Pages address variables from remote main remain in workflow configuration but are not consumed by the current demo; each network needs correct address and transaction-reference validation, independently verified destinations, and matching server-side support before use.

The existing $75 account verification submission is not a deposit or account credit. Existing withdrawal requests do not transfer funds and are not backed by a money ledger. The demo account balance is simulated. No live payment flow is enabled by this preparation.

Before accepting live deposits or paying withdrawals, implement authenticated operator review, ownership policies, unique network-specific transaction references, durable immutable audit events, and withdrawal payout references. Build a transactional ledger with idempotent postings and separate available and reserved balances; reconcile each deposit and payout to independently verified chain or provider records and investigate unmatched, duplicate, reversed or under-confirmed transactions. Test concurrent operations and recovery before any production use. These components are not yet implemented.

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
