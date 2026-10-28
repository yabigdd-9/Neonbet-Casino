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
  rpc.mockResolvedValueOnce({ data: { claimed: true, rewardCredits: 5 }, error: null });
  await claimReferral(`LO-${"a".repeat(32)}`);
  expect(rpc).toHaveBeenCalledWith("claim_practice_referral", { invite_code: `LO-${"a".repeat(32)}` });
});
it("does not report success for an invalid claim response or expose provider details", async () => {
  rpc.mockResolvedValueOnce({ data: { claimed: false, rewardCredits: 50 }, error: null });
  await expect(claimReferral(`LO-${"a".repeat(32)}`)).rejects.toThrow("response could not be verified");
  rpc.mockResolvedValueOnce({ data: null, error: { message: "private provider detail" } });
  await expect(claimReferral(`LO-${"a".repeat(32)}`)).rejects.toThrow("Refresh referral status");
});
