import type { Profile, Submission, Withdrawal } from "../types/account";
// Admin service (server-validated actions only).
import { requireSupabase, hasSupabaseConfig } from "./supabaseClient";

export async function getAdminSummary({
  profiles = [],
  submissions = [],
  withdrawals = [],
}: {
  profiles?: Profile[];
  submissions?: Submission[];
  withdrawals?: Withdrawal[];
}) {
  return {
    users: profiles.length,
    pendingVerifications: submissions.filter((s) => s.status === "pending").length,
    verifiedUsers: profiles.filter((p) => p.verification_status === "verified").length,
    pendingWithdrawals: withdrawals.filter((w) => w.status === "pending").length,
  };
}

export async function updateProfileAdmin(
  profileId: string,
  updates: Pick<Profile, "bonus_balance" | "rollover_progress" | "rollover_required" | "admin_notes">,
) {
  if (!hasSupabaseConfig) throw new Error("Admin actions require Supabase mode.");
  for (const value of [updates.bonus_balance, updates.rollover_progress, updates.rollover_required]) {
    if (
      !Number.isFinite(Number(value)) ||
      Number(value) < 0 ||
      Number(value) >= 10000000000 ||
      Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) > 1e-6
    )
      throw new Error("Use non-negative amounts with at most two decimals.");
  }
  if (String(updates.admin_notes || "").length > 2000)
    throw new Error("Admin notes must be at most 2000 characters.");
  const { error } = await requireSupabase().rpc("update_profile_admin", {
    p_profile_id: profileId,
    p_bonus_balance: Number(updates.bonus_balance),
    p_rollover_progress: Number(updates.rollover_progress),
    p_rollover_required: Number(updates.rollover_required),
    p_admin_notes: String(updates.admin_notes || "").trim(),
  });
  if (error) throw error;
}

export default { getAdminSummary, updateProfileAdmin };
