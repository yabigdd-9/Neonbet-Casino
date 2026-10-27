import type { AccountQuery, Submission, CryptoMethod } from "../types/account";
// Verification submission service (manual crypto verification).
import { requireSupabase, hasSupabaseConfig } from "./supabaseClient";
import { SUBMISSION_COLUMNS, ADMIN_SUBMISSION_COLUMNS } from "./auth.service";
import { readUserRecords, writeUserRecords } from "../lib/storage";
import verificationConfig from "../config/verification";

const DEMO_SUBMISSIONS_KEY = "neonbetVerificationSubmissions";

export { validTxHash as validateTxHash } from "../lib/validation";
import { validTxHash } from "../lib/validation";

export async function getSubmissions({
  userId,
  isAdmin,
  limit = 20,
  page = 0,
}: AccountQuery): Promise<Submission[]> {
  if (!isAdmin && !userId) throw new Error("User ID required for personal submissions.");
  if (!hasSupabaseConfig) {
    return readUserRecords(DEMO_SUBMISSIONS_KEY, userId);
  }
  let query = requireSupabase()
    .from("verification_submissions")
    .select(isAdmin ? ADMIN_SUBMISSION_COLUMNS : SUBMISSION_COLUMNS)
    .order("created_at", { ascending: false })
    .range(Math.max(0, page) * limit, Math.max(0, page) * limit + limit - 1);
  if (!isAdmin && userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as Submission[];
}

export async function submitSubmission({
  userId,
  method,
  txHash,
}: {
  userId: string;
  method: CryptoMethod;
  txHash: string;
}) {
  if (
    !userId ||
    !method ||
    !verificationConfig.acceptedCrypto.some(
      (item) => item.name === method.name && item.network === method.network,
    ) ||
    !validTxHash(txHash, method)
  )
    throw new Error("Enter a valid transaction hash for the selected network.");
  const cleanTxHash = (txHash || "").trim();
  const asset = method.name;
  const network = method.network;
  const amountUsd = verificationConfig.feeUsd;

  if (!hasSupabaseConfig) {
    const localSubmission = {
      id: `local-submission-${crypto.randomUUID()}`,
      user_id: userId,
      asset,
      network,
      tx_hash: cleanTxHash,
      amount_usd: amountUsd,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    const existing = readUserRecords(DEMO_SUBMISSIONS_KEY, userId);
    if (existing.some((row) => row.status === "pending"))
      throw new Error("You already have a pending verification submission.");
    const next = [localSubmission, ...existing];
    writeUserRecords(DEMO_SUBMISSIONS_KEY, userId, next);
    return { localSubmission };
  }

  const { error } = await requireSupabase().from("verification_submissions").insert({
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
export async function reviewSubmission(submissionId: string, status: string, adminNotes = "") {
  const { error } = await requireSupabase().rpc("review_verification_submission", {
    p_submission_id: submissionId,
    p_status: status,
    p_admin_notes: adminNotes.trim(),
  });
  if (error) throw error;
}

export default { validateTxHash: validTxHash, getSubmissions, submitSubmission, reviewSubmission };
