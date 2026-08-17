// Admin service (server-validated actions only).
import { supabase } from "./dataStore";
import { IS_SUPABASE } from "../config/appMode";

export async function getAdminSummary({ profiles = [], submissions = [], withdrawals = [] }) {
  return {
    users: profiles.length,
    pendingVerifications: submissions.filter((s) => s.status === "pending").length,
    verifiedUsers: profiles.filter((p) => p.verification_status === "verified").length,
    pendingWithdrawals: withdrawals.filter((w) => w.status === "pending").length,
  };
}

export async function updateProfileAdmin(profileId, updates) {
  if (!IS_SUPABASE) throw new Error("Admin actions require Supabase mode.");
  const { error } = await supabase.rpc("update_profile_admin", {
    p_profile_id: profileId,
    p_bonus_balance: Number(updates.bonus_balance),
    p_rollover_progress: Number(updates.rollover_progress),
    p_rollover_required: Number(updates.rollover_required),
    p_admin_notes: String(updates.admin_notes || "").trim(),
  });
  if (error) throw error;
}

export default { getAdminSummary, updateProfileAdmin };
