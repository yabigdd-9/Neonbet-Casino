import { requireSupabase } from "./supabaseClient";
export type ReferralStatus = { code: string; credits: number; count: number; claimed: boolean };
export async function getReferralStatus(): Promise<ReferralStatus> {
  const { data, error } = await requireSupabase().rpc("get_practice_referral_status");
  if (error) throw new Error("Shared referral rewards are unavailable. Try again later.");
  if (
    !data ||
    !/^LO-[a-f0-9]{32}$/.test(data.code) ||
    !Number.isSafeInteger(data.credits) ||
    data.credits < 0 ||
    !Number.isSafeInteger(data.count) ||
    data.count < 0 ||
    typeof data.claimed !== "boolean"
  )
    throw new Error("Shared referral status could not be verified.");
  return data;
}
export async function claimReferral(code: string) {
  if (!/^LO-[a-f0-9]{32}$/.test(code)) throw new Error("Invalid invitation code.");
  const { error } = await requireSupabase().rpc("claim_practice_referral", { invite_code: code });
  if (error)
    throw new Error("This invitation could not be verified for your account. No reward was awarded.");
}
