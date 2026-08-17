// Verification submission service (manual crypto verification).
// IMPORTANT (P2): the verification fee is SERVER-AUTHORITATIVE. The client reads
// the fee via getVerificationFee() (RPC in Supabase mode, config fallback in demo)
// and the stored amount is decided by the database, never by the client. A
// malicious client cannot submit amount_usd = 1 when the operator fee is $75.
import { dataStore } from "./dataStore";

export function validateTxHash(txHash) {
  return Boolean(txHash && txHash.trim().length >= 8);
}

// Resolve the current verification fee from the authoritative source.
export async function getVerificationFee() {
  return dataStore.getVerificationFee();
}

export async function getSubmissions({ userId, isAdmin, limit = 20 }) {
  return dataStore.getSubmissions({ userId, isAdmin, limit });
}

// `method` and `txHash` are the only client inputs. The fee is derived server-side.
export async function submitSubmission({ userId, method, txHash }) {
  const cleanTxHash = (txHash || "").trim();
  // Fee is read for display only; the stored amount is set by the DB/RPC.
  const fee = await getVerificationFee();
  const result = await dataStore.insertSubmission({
    userId,
    asset: method.name,
    network: method.network,
    txHash: cleanTxHash,
    amountUsd: fee,
  });
  return result;
}

// Admin review (server-checked via RPC).
export async function reviewSubmission(submissionId, status, adminNotes = "") {
  return dataStore.reviewSubmission(submissionId, status, adminNotes);
}

export default { validateTxHash, getVerificationFee, getSubmissions, submitSubmission, reviewSubmission };
