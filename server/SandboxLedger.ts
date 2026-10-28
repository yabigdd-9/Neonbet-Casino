// Private development harness only. Never connects to wallets, exchanges or payment providers.
// PGlite is a development dependency; this is not a production money ledger.
import { PGlite } from "@electric-sql/pglite";

export class SandboxLedger {
  constructor(private readonly db: PGlite) {}

  async initialize() {
    await this.db.exec(`
      create table if not exists sandbox_accounts (
        id text primary key,
        balance_cents bigint not null default 0 check (balance_cents >= 0)
      );
      create table if not exists sandbox_events (
        id text primary key,
        account_id text not null references sandbox_accounts(id),
        kind text not null check (kind in ('deposit','wager','payout','referral')),
        amount_cents bigint not null check (amount_cents > 0),
        created_at timestamptz not null default now()
      );
      alter table sandbox_events drop constraint if exists sandbox_events_kind_check;
      alter table sandbox_events add constraint sandbox_events_kind_check check (kind in ('deposit','wager','payout','referral'));
      create table if not exists sandbox_referrals (
        referred_id text primary key references sandbox_accounts(id),
        referrer_id text not null references sandbox_accounts(id),
        reward_cents bigint not null,
        check (referred_id <> referrer_id)
      );
    `);
  }

  private validId(value: string) {
    return typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
  }

  async createAccount(id: string) {
    if (!this.validId(id)) throw new Error("Invalid sandbox account");
    await this.db.query("insert into sandbox_accounts(id) values ($1) on conflict do nothing", [id]);
  }

  async balance(id: string): Promise<number> {
    const result = await this.db.query<{ balance_cents: string }>(
      "select balance_cents::text from sandbox_accounts where id = $1",
      [id],
    );
    if (!result.rows.length) throw new Error("Unknown sandbox account");
    return Number(result.rows[0].balance_cents);
  }

  // Call only from trusted synthetic fixtures. These event IDs are NOT chain/payment proofs.
  async post(event: {
    id: string;
    accountId: string;
    kind: "deposit" | "wager" | "payout";
    amountCents: number;
  }) {
    if (
      !this.validId(event.id) ||
      !this.validId(event.accountId) ||
      !["deposit", "wager", "payout"].includes(event.kind) ||
      !Number.isSafeInteger(event.amountCents) ||
      event.amountCents <= 0
    )
      throw new Error("Invalid sandbox event");
    return this.db.transaction(async (tx) => {
      const previous = await tx.query<{ account_id: string; kind: string; amount_cents: string }>(
        "select account_id, kind, amount_cents::text from sandbox_events where id = $1",
        [event.id],
      );
      if (previous.rows.length) {
        const row = previous.rows[0];
        if (
          row.account_id !== event.accountId ||
          row.kind !== event.kind ||
          Number(row.amount_cents) !== event.amountCents
        )
          throw new Error("Sandbox event ID reused with different details");
        return { duplicate: true };
      }
      const change = event.kind === "wager" ? -event.amountCents : event.amountCents;
      const updated = await tx.query(
        "update sandbox_accounts set balance_cents = balance_cents + $2::bigint where id = $1 and balance_cents + $2::bigint between 0 and 9007199254740991 returning id",
        [event.accountId, change],
      );
      if (!updated.rows.length) throw new Error("Unknown account, insufficient credits or balance overflow");
      await tx.query("insert into sandbox_events(id, account_id, kind, amount_cents) values ($1,$2,$3,$4)", [
        event.id,
        event.accountId,
        event.kind,
        event.amountCents,
      ]);
      return { duplicate: false };
    });
  }

  // A trusted test fixture confirms eligibility; this is not public signup attribution.
  async awardReferral(referrerId: string, referredId: string, rewardCents = 500) {
    if (
      !this.validId(referrerId) ||
      !this.validId(referredId) ||
      referrerId === referredId ||
      !Number.isSafeInteger(rewardCents) ||
      rewardCents <= 0
    )
      throw new Error("Invalid sandbox referral");
    return this.db.transaction(async (tx) => {
      const previous = await tx.query<{ referrer_id: string; reward_cents: string }>(
        "select referrer_id, reward_cents::text from sandbox_referrals where referred_id = $1",
        [referredId],
      );
      if (previous.rows.length) {
        if (
          previous.rows[0].referrer_id !== referrerId ||
          Number(previous.rows[0].reward_cents) !== rewardCents
        )
          throw new Error("Referral already attributed with different details");
        return { duplicate: true };
      }
      // FK validation of both accounts and attribution happen in the same transaction as crediting.
      await tx.query(
        "insert into sandbox_referrals(referred_id, referrer_id, reward_cents) values ($1,$2,$3)",
        [referredId, referrerId, rewardCents],
      );
      const updated = await tx.query(
        "update sandbox_accounts set balance_cents = balance_cents + $2::bigint where id = $1 and balance_cents + $2::bigint <= 9007199254740991 returning id",
        [referrerId, rewardCents],
      );
      if (!updated.rows.length) throw new Error("Sandbox reward overflow");
      await tx.query(
        "insert into sandbox_events(id, account_id, kind, amount_cents) values ($1,$2,'referral',$3)",
        [`referral:${referredId}`, referrerId, rewardCents],
      );
      return { duplicate: false };
    });
  }

  async reconcile(id: string) {
    const result = await this.db.query<{ balance_cents: string; event_cents: string }>(
      `
      select a.balance_cents::text, coalesce(sum(case when e.kind = 'wager' then -e.amount_cents else e.amount_cents end),0)::text as event_cents
      from sandbox_accounts a left join sandbox_events e on e.account_id = a.id
      where a.id = $1 group by a.id`,
      [id],
    );
    if (!result.rows.length) throw new Error("Unknown sandbox account");
    const row = result.rows[0];
    return { balanced: row.balance_cents === row.event_cents, balanceCents: Number(row.balance_cents) };
  }
}
