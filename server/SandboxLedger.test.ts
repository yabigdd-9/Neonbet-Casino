import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SandboxLedger } from "./SandboxLedger";

it("persists balances across restart and rejects duplicate or conflicting credits", async () => {
  const directory = await mkdtemp(join(tmpdir(), "neonbet-sandbox-"));
  let db = new PGlite(directory);
  try {
    let ledger = new SandboxLedger(db);
    await ledger.initialize();
    await ledger.createAccount("test-player");
    const deposit = {
      id: "fixture-deposit",
      accountId: "test-player",
      kind: "deposit" as const,
      amountCents: 5000,
    };
    const results = await Promise.all([ledger.post(deposit), ledger.post(deposit)]);
    expect(results.filter((result) => !result.duplicate)).toHaveLength(1);
    await expect(ledger.post({ ...deposit, amountCents: 6000 })).rejects.toThrow("reused");
    await ledger.post({ id: "round-1-stake", accountId: "test-player", kind: "wager", amountCents: 50 });
    await ledger.post({ id: "round-1-win", accountId: "test-player", kind: "payout", amountCents: 100 });
    await db.close();
    db = new PGlite(directory);
    ledger = new SandboxLedger(db);
    await ledger.initialize();
    expect(await ledger.balance("test-player")).toBe(5050);
    expect(await ledger.post(deposit)).toEqual({ duplicate: true });
    expect(await ledger.reconcile("test-player")).toEqual({ balanced: true, balanceCents: 5050 });
  } finally {
    await db.close();
    await rm(directory, { recursive: true, force: true });
  }
}, 30000);

it("serializes competing wagers and rolls back rejected events", async () => {
  const db = new PGlite();
  try {
    const ledger = new SandboxLedger(db);
    await ledger.initialize();
    await ledger.createAccount("test-player");
    await ledger.post({ id: "fund", accountId: "test-player", kind: "deposit", amountCents: 100 });
    const results = await Promise.allSettled(
      [1, 2].map((n) =>
        ledger.post({ id: `stake-${n}`, accountId: "test-player", kind: "wager", amountCents: 75 }),
      ),
    );
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await ledger.balance("test-player")).toBe(25);
    expect((await ledger.reconcile("test-player")).balanced).toBe(true);
    await expect(
      ledger.post({ id: "bad", accountId: "test-player", kind: "deposit", amountCents: 0.5 }),
    ).rejects.toThrow("Invalid");
    await expect(
      ledger.post({
        id: "overflow",
        accountId: "test-player",
        kind: "deposit",
        amountCents: Number.MAX_SAFE_INTEGER,
      }),
    ).rejects.toThrow("overflow");
    expect(await ledger.balance("test-player")).toBe(25);
  } finally {
    await db.close();
  }
}, 30000);

it("awards a referral once, prevents self-referrals and preserves attribution", async () => {
  const db = new PGlite();
  try {
    const ledger = new SandboxLedger(db);
    await ledger.initialize();
    for (const id of ["referrer", "friend", "other"]) await ledger.createAccount(id);
    const results = await Promise.all([
      ledger.awardReferral("referrer", "friend"),
      ledger.awardReferral("referrer", "friend"),
    ]);
    expect(results.filter((result) => !result.duplicate)).toHaveLength(1);
    expect(await ledger.balance("referrer")).toBe(500);
    expect(await ledger.balance("friend")).toBe(0);
    await expect(ledger.awardReferral("referrer", "referrer")).rejects.toThrow("Invalid");
    await expect(ledger.awardReferral("other", "friend")).rejects.toThrow("attributed");
    await expect(ledger.awardReferral("referrer", "missing")).rejects.toThrow();
    expect(await ledger.reconcile("referrer")).toEqual({ balanced: true, balanceCents: 500 });
  } finally {
    await db.close();
  }
}, 30000);
