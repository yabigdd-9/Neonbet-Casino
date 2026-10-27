import { afterEach, it, expect, vi } from "vitest";
import { RoundController } from "./roundController";
import { playArcade, PLINKO_MULTIPLIERS } from "./gameEngine";
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it("debits and settles once while rejecting overlapping rounds and preserving a snapshotted stake", () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  const wallet = new RoundController();
  expect(wallet.start({ id: "neon-crash" }, 0.25)).toBe(true);
  expect(wallet.getSnapshot().cents).toBe(4975);
  expect(wallet.getSnapshot().wageredCents).toBe(25);
  expect(wallet.start({ id: "neon-crash" }, 0.25)).toBe(false);
  vi.runAllTimers();
  expect(wallet.getSnapshot().cents).toBe(4975);
  expect(wallet.getSnapshot().wageredCents).toBe(25);
  expect(wallet.getSnapshot().round.stakeCents).toBe(25);
  vi.runAllTimers();
  expect(wallet.getSnapshot().cents).toBe(4975);
});
it("settles after the modal subscriber disconnects", () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  const wallet = new RoundController();
  const listener = vi.fn();
  const closeModal = wallet.subscribe(listener);
  wallet.start({ title: "Test" }, 0.5);
  closeModal();
  vi.runAllTimers();
  expect(wallet.getSnapshot().cents).toBe(7450);
  expect(wallet.getSnapshot().busy).toBe(false);
});
it("rejects invalid, imprecise, and unaffordable stakes without changing the balance", () => {
  const wallet = new RoundController();
  for (const stake of [-1, 0, NaN, Infinity, 0.001, 101])
    expect(wallet.start({ title: "Test" }, stake)).toBe(false);
  expect(wallet.getSnapshot().cents).toBe(5000);
  expect(wallet.getSnapshot().wageredCents).toBe(0);
});
it("fails closed for malformed games and nonnumeric stakes without changing wallet state", () => {
  const wallet = new RoundController();
  const snapshot = wallet.getSnapshot();
  expect(wallet.start(null, 0.25)).toBe(false);
  expect(wallet.start({}, 0.25)).toBe(false);
  expect(wallet.start({ title: "Test" }, "0.25")).toBe(false);
  expect(wallet.start({ id: "unknown-arcade" }, 0.25)).toBe(false);
  expect(wallet.start({ title: "Broken symbols", symbols: { length: 1 } }, 0.25)).toBe(false);
  expect(wallet.getSnapshot()).toBe(snapshot);
});
it("can reach every advertised Plinko payout tier", () => {
  const lanes = new Set();
  for (let bits = 0; bits < 256; bits++) {
    let step = 0;
    const outcome = playArcade("plinko-drop", 2, () => ((bits >> step++) & 1 ? 0.9 : 0.1));
    lanes.add(outcome.visual.at(-1));
    expect(outcome.multiplier).toBe(PLINKO_MULTIPLIERS[outcome.visual.at(-1)]);
  }
  expect(lanes.size).toBe(9);
});
it("uses deterministic injectable arcade engines", () => {
  expect(playArcade("dice-duel", 2, () => 0).multiplier).toBe(1);
  expect(playArcade("neon-crash", 2, () => 0).multiplier).toBe(0);
  expect(() => playArcade("unknown")).toThrow();
  expect(() => playArcade("neon-crash", NaN)).toThrow();
});
it("awards the daily demo reward only once per UTC day and handles storage failure", () => {
  localStorage.removeItem("neonbet:daily-demo-reward");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T23:59:59Z"));
  const wallet = new RoundController();
  expect(wallet.claimDaily()).toBe("claimed");
  expect(wallet.claimDaily()).toBe("already-claimed");
  expect(wallet.getSnapshot().cents).toBe(5500);
  vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
  const fail = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("unavailable");
  });
  expect(wallet.claimDaily()).toBe("storage-error");
  expect(wallet.getSnapshot().cents).toBe(5500);
  fail.mockRestore();
  expect(wallet.claimDaily()).toBe("claimed");
  expect(wallet.getSnapshot().cents).toBe(6000);
  vi.setSystemTime(new Date("2026-01-03T00:00:00Z"));
  expect(wallet.claimDaily()).toBe("claimed-weekend");
  expect(wallet.getSnapshot().cents).toBe(7000);
  localStorage.removeItem("neonbet:daily-demo-reward");
});
