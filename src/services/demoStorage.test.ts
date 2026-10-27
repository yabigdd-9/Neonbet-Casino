import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { submitSubmission, getSubmissions } from "./verification.service";
import { submitWithdrawal, getWithdrawals } from "./transactions.service";

vi.mock("./supabaseClient", () => ({ hasSupabaseConfig: false, requireSupabase: vi.fn() }));
const userId = "local-storage-test";
const method = { name: "BTC", network: "BTC" };
const request = { amount_usd: "12.50", payout_method: "BTC / BTC", payout_address: "synthetic-address" };
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
it("reports storage failures instead of claiming a verification was saved", async () => {
  const failure = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage unavailable", "QuotaExceededError");
  });
  await expect(submitSubmission({ userId, method, txHash: "a".repeat(64) })).rejects.toThrow(
    "Unable to save",
  );
  failure.mockRestore();
  expect(await getSubmissions({ userId, isAdmin: false })).toEqual([]);
  await submitSubmission({ userId, method, txHash: "a".repeat(64) });
  expect(await getSubmissions({ userId, isAdmin: false })).toHaveLength(1);
});
it("reports storage failures instead of claiming a withdrawal was saved", async () => {
  const failure = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Storage unavailable", "SecurityError");
  });
  await expect(submitWithdrawal({ userId, request })).rejects.toThrow("Unable to save");
  failure.mockRestore();
  expect(await getWithdrawals({ userId, isAdmin: false })).toEqual([]);
  await submitWithdrawal({ userId, request });
  expect(await getWithdrawals({ userId, isAdmin: false })).toHaveLength(1);
});
it("preserves existing withdrawals when reading account storage fails", async () => {
  await submitWithdrawal({ userId, request });
  const existing = await getWithdrawals({ userId, isAdmin: false });
  const failure = vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
    throw new DOMException("Storage unavailable", "SecurityError");
  });
  await expect(submitWithdrawal({ userId, request })).rejects.toThrow("Unable to read");
  failure.mockRestore();
  expect(await getWithdrawals({ userId, isAdmin: false })).toEqual(existing);
});
it("does not overwrite corrupt scoped history with legacy records", async () => {
  const scopedKey = `neonbetWithdrawalRequests:${userId}`;
  localStorage.setItem(scopedKey, "{broken");
  await expect(submitWithdrawal({ userId, request })).rejects.toThrow("Unable to read");
  expect(localStorage.getItem(scopedKey)).toBe("{broken");
});
