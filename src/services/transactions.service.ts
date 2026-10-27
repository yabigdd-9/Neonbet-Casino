import type { AccountQuery, Withdrawal, WithdrawalInput } from "../types/account";
// Transaction / withdrawal request service (manual withdrawal flow).
import { requireSupabase, hasSupabaseConfig } from "./supabaseClient";
import { WITHDRAWAL_COLUMNS, ADMIN_WITHDRAWAL_COLUMNS } from "./auth.service";
import { readUserRecords, writeUserRecords } from "../lib/storage";

const DEMO_WITHDRAWALS_KEY = "neonbetWithdrawalRequests";

export { validWithdrawal as validateWithdrawal } from "../lib/validation";
import { validWithdrawal as validateWithdrawal } from "../lib/validation";

export async function getWithdrawals({
  userId,
  isAdmin,
  limit = 20,
  page = 0,
}: AccountQuery): Promise<Withdrawal[]> {
  if (!isAdmin && !userId) throw new Error("User ID required for personal withdrawals.");
  if (!hasSupabaseConfig) {
    return readUserRecords(DEMO_WITHDRAWALS_KEY, userId);
  }
  let query = requireSupabase()
    .from("withdrawal_requests")
    .select(isAdmin ? ADMIN_WITHDRAWAL_COLUMNS : WITHDRAWAL_COLUMNS)
    .order("created_at", { ascending: false })
    .range(Math.max(0, page) * limit, Math.max(0, page) * limit + limit - 1);
  if (!isAdmin && userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as Withdrawal[];
}

export async function submitWithdrawal({ userId, request }: { userId: string; request: WithdrawalInput }) {
  if (!userId || !validateWithdrawal(request))
    throw new Error(
      "Enter a supported method, a positive amount with at most two decimals, and an address of 10–256 characters.",
    );
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
      id: `local-withdrawal-${crypto.randomUUID()}`,
      user_id: userId,
      ...cleanRequest,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    const next = [local, ...readUserRecords(DEMO_WITHDRAWALS_KEY, userId)];
    writeUserRecords(DEMO_WITHDRAWALS_KEY, userId, next);
    return { local };
  }

  const { error } = await requireSupabase()
    .from("withdrawal_requests")
    .insert({ user_id: userId, ...cleanRequest });
  if (error) throw error;
  return { error: null };
}

export async function reviewWithdrawal(withdrawalId: string, status: string, adminNotes = "") {
  const { error } = await requireSupabase().rpc("review_withdrawal_request", {
    p_withdrawal_id: withdrawalId,
    p_status: status,
    p_admin_notes: adminNotes.trim(),
  });
  if (error) throw error;
}

export default { validateWithdrawal, getWithdrawals, submitWithdrawal, reviewWithdrawal };
