import { beforeEach, expect, it, vi } from "vitest";
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("./supabaseClient", () => ({ requireSupabase: () => ({ rpc }) }));
import { getReferralStatus, claimReferral } from "./referrals.service";
beforeEach(() => rpc.mockReset());
it("accepts only valid shared status and hides provider errors", async () => {
  const status = { code: `LO-${"a".repeat(32)}`, credits: 5, count: 1, claimed: false };
  rpc.mockResolvedValueOnce({ data: status, error: null });
  expect(await getReferralStatus()).toEqual(status);
  rpc.mockResolvedValueOnce({ data: { ...status, credits: -1 }, error: null });
  await expect(getReferralStatus()).rejects.toThrow("could not be verified");
  rpc.mockResolvedValueOnce({ data: null, error: { message: "internal detail" } });
  await expect(getReferralStatus()).rejects.toThrow("unavailable");
});
it("rejects malformed invitations before calling the backend", async () => {
  await expect(claimReferral("invalid")).rejects.toThrow("Invalid invitation");
  expect(rpc).not.toHaveBeenCalled();
  rpc.mockResolvedValueOnce({ error: null });
  await claimReferral(`LO-${"a".repeat(32)}`);
  expect(rpc).toHaveBeenCalledWith("claim_practice_referral", { invite_code: `LO-${"a".repeat(32)}` });
});
