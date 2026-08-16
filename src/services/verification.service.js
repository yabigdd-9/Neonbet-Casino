// Verification submission service (manual crypto verification).
import { dataStore } from "./dataStore";
import verificationConfig from "../config/verification";

export function validateTxHash(txHash) {
  return Boolean(txHash && txHash.trim().length >= 8);
}

export async function getSubmissions({ userId, isAdmin, limit = 20 }) {
  return dataStore.getSubmissions({ userId, isAdmin, limit });
}

export async function submitSubmission({ userId, method, txHash }) {
  const cleanTxHash = (txHash || "").trim();
  return dataStore.insertSubmission({
    userId,
    asset: method.name,
    network: method.network,
    txHash: cleanTxHash,
    amountUsd: verificationConfig.feeUsd,
  });
}

// Admin review (server-checked via RPC).
export async function reviewSubmission(submissionId, status, adminNotes = "") {
  return dataStore.reviewSubmission(submissionId, status, adminNotes);
}

export default { validateTxHash, getSubmissions, submitSubmission, reviewSubmission };
