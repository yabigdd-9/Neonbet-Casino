// Transaction / withdrawal request service (manual withdrawal flow).
import { supabase, hasSupabaseConfig } from "./supabaseClient";
import { WITHDRAWAL_COLUMNS, ADMIN_WITHDRAWAL_COLUMNS } from "./auth.service";
import { readStoredArray, writeStoredArray } from "../lib/storage";

const DEMO_WITHDRAWALS_KEY = "neonbetWithdrawalRequests";

export function validateWithdrawal({ amount_usd, payout_address }) {
  const amount = Number(amount_usd);
  return Number.isFinite(amount) && amount > 0 && String(payout_address || "").trim().length >= 10;
}

export async function getWithdrawals({ userId, isAdmin, limit = 20 }) {
  if (!hasSupabaseConfig) {
    return readStoredArray(DEMO_WITHDRAWALS_KEY);
  }
  let query = supabase
    .from("withdrawal_requests")
    .select(isAdmin ? ADMIN_WITHDRAWAL_COLUMNS : WITHDRAWAL_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(isAdmin ? 200 : limit);
  if (!isAdmin && userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function submitWithdrawal({ userId, request }) {
  const cleanRequest = {
    amount_usd: Number(request.amount_usd),
    payout_method: String(request.payout_method || "").trim(),
    payout_address: String(request.payout_address || "").trim(),
  };
  if (!validateWithdrawal(cleanRequest)) {
    throw new Error("Enter a valid withdrawal amount and payout address.");
  }

  if (!hasSupabaseConfig) {
    const local = {
      id: `local-withdrawal-${Date.now()}`,
      user_id: userId,
      ...cleanRequest,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    const next = [local, ...readStoredArray(DEMO_WITHDRAWALS_KEY)];
    writeStoredArray(DEMO_WITHDRAWALS_KEY, next);
    return { local };
  }

  const { error } = await supabase.from("withdrawal_requests").insert({ user_id: userId, ...cleanRequest });
  if (error) throw error;
  return { error: null };
}

export async function reviewWithdrawal(withdrawalId, status, adminNotes = "") {
  const { error } = await supabase.rpc("review_withdrawal_request", {
    p_withdrawal_id: withdrawalId,
    p_status: status,
    p_admin_notes: adminNotes.trim(),
  });
  if (error) throw error;
}

export default { validateWithdrawal, getWithdrawals, submitWithdrawal, reviewWithdrawal };
