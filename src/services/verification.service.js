// Verification submission service (manual crypto verification).
import { supabase, hasSupabaseConfig } from "./supabaseClient";
import { SUBMISSION_COLUMNS, ADMIN_SUBMISSION_COLUMNS } from "./auth.service";
import { readStoredArray, writeStoredArray } from "../lib/storage";
import verificationConfig from "../config/verification";

const DEMO_SUBMISSIONS_KEY = "neonbetVerificationSubmissions";

export function validateTxHash(txHash) {
  return Boolean(txHash && txHash.trim().length >= 8);
}

export async function getSubmissions({ userId, isAdmin, limit = 20 }) {
  if (!hasSupabaseConfig) {
    return readStoredArray(DEMO_SUBMISSIONS_KEY);
  }
  let query = supabase
    .from("verification_submissions")
    .select(isAdmin ? ADMIN_SUBMISSION_COLUMNS : SUBMISSION_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(isAdmin ? 200 : limit);
  if (!isAdmin && userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function submitSubmission({ userId, method, txHash }) {
  const cleanTxHash = (txHash || "").trim();
  const asset = method.name;
  const network = method.network;
  const amountUsd = verificationConfig.feeUsd;

  if (!hasSupabaseConfig) {
    const localSubmission = {
      id: `local-submission-${Date.now()}`,
      user_id: userId,
      asset,
      network,
      tx_hash: cleanTxHash,
      amount_usd: amountUsd,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    const next = [localSubmission, ...readStoredArray(DEMO_SUBMISSIONS_KEY)];
    writeStoredArray(DEMO_SUBMISSIONS_KEY, next);
    return { localSubmission };
  }

  const { error } = await supabase.from("verification_submissions").insert({
    user_id: userId,
    asset,
    network,
    tx_hash: cleanTxHash,
    amount_usd: amountUsd,
  });
  if (error) throw error;
  return { error: null };
}

// Admin review (server-checked via RPC).
export async function reviewSubmission(submissionId, status, adminNotes = "") {
  const { error } = await supabase.rpc("review_verification_submission", {
    p_submission_id: submissionId,
    p_status: status,
    p_admin_notes: adminNotes.trim(),
  });
  if (error) throw error;
}

export default { validateTxHash, getSubmissions, submitSubmission, reviewSubmission };
