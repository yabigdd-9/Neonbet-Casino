import { it, expect } from "vitest";
import { validateWithdrawal } from "./transactions.service";
const good = { amount_usd: "10.25", payout_method: "USDT / BSC", payout_address: "1234567890" };
it("accepts supported manual requests", () => expect(validateWithdrawal(good)).toBe(true));
it("rejects malformed, oversized, unsupported and imprecise requests", () => {
  for (const amount_usd of [0, -1, NaN, Infinity, "", "1.001", "1e2", "10000000000"])
    expect(validateWithdrawal({ ...good, amount_usd })).toBe(false);
  for (const payout_method of ["", "unknown", undefined])
    expect(validateWithdrawal({ ...good, payout_method })).toBe(false);
  for (const payout_address of ["", "short", "a".repeat(257), {}])
    expect(validateWithdrawal({ ...good, payout_address })).toBe(false);
  expect(validateWithdrawal()).toBe(false);
});
