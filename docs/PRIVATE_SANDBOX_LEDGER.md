# Local sandbox ledger

This is a development test harness, not a deployed server, exchange connection, or production money ledger. It is not imported by the browser and does not enable deposits or cash payouts. All events come from trusted synthetic fixtures. Do not feed browser-submitted payment claims into it.

`server/SandboxLedger.ts` uses the existing development PGlite dependency. The constructor takes a database instance. A filesystem-backed instance can persist test balances and event IDs across restarts. `initialize()` creates dedicated `sandbox_` tables. The harness supports integer-cent synthetic deposits, wagers, and winnings; a payout here means a credit of simulated winnings, not an external withdrawal.

Each event has a unique ID. Repeating identical details returns a duplicate result without changing the balance. Reusing an ID with different details fails. Balance changes and event insertion occur in one transaction. Wagers require enough credits, balances must stay within the safe-integer range, and reconciliation compares the stored balance to the sum of recorded events.

Run the isolated tests:

```sh
npx vitest run server/SandboxLedger.test.ts
```

The tests use temporary databases, synthetic player IDs, and no external network requests. They cover persistence, duplicate/conflicting credits, concurrent wagers, fractional amounts, overflow, and reconciliation. PGlite provides a local database for development; this does not validate production Postgres concurrency or operational recovery.

Before any live implementation, the operator needs a lawful operating model and approved markets, provider sandbox specifications, server-authenticated account ownership, signed payment verification, durable provider reconciliation, a real financial ledger with reservations and currency/asset precision, payout approvals, and an authenticated private deployment. No licence, provider approval, user identity check, private hosted site, or production integration is created by this harness.

## Synthetic referral rewards

`awardReferral(referrerId, referredId, rewardCents = 500)` credits the referrer with five practice credits by default. Both test accounts must already exist. Attribution, the reward event and the balance update happen in one transaction. A referred account can generate one reward; identical retries do not credit again, self-referrals fail, and conflicting attribution fails. The reward uses its own event kind and is included in reconciliation.

This is backend-only fixture logic. No invitation URL, cross-browser signup attribution, real identity check, anti-abuse service or customer-facing reward offer is enabled. Eligibility must come from trusted server verification in any future implementation. These credits have no cash value and require no deposit.
