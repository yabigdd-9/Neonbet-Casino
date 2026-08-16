// Transaction / withdrawal request service (manual withdrawal flow).
import { dataStore } from "./dataStore";

export function validateWithdrawal({ amount_usd, payout_address }) {
  const amount = Number(amount_usd);
  return Number.isFinite(amount) && amount > 0 && String(payout_address || "").trim().length >= 10;
}

export async function getWithdrawals({ userId, isAdmin, limit = 20 }) {
  return dataStore.getWithdrawals({ userId, isAdmin, limit });
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
  return dataStore.insertWithdrawal({ userId, request: cleanRequest });
}

export async function reviewWithdrawal(withdrawalId, status, adminNotes = "") {
  return dataStore.reviewWithdrawal(withdrawalId, status, adminNotes);
}

export default { validateWithdrawal, getWithdrawals, submitWithdrawal, reviewWithdrawal };
