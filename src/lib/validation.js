export const PAYOUT_METHODS = ["USDT / BSC", "BTC / BTC", "ETH / ETH", "BNB / BSC"];
export function validAmount(value) {
  const text = String(value ?? "").trim();
  return /^\d{1,10}(?:\.\d{1,2})?$/.test(text) && Number(text) > 0 && Number(text) < 10000000000;
}
export function validTxHash(value, method) {
  if (typeof value !== "string") return false;
  const hash = value.trim();
  if (!method) return /^(?:0x)?[a-fA-F0-9]{64}$/.test(hash);
  if (method.network === "BTC" && method.name === "BTC") return /^[a-fA-F0-9]{64}$/.test(hash);
  return (
    ["USDT", "ETH", "BNB"].includes(method.name) &&
    ["BSC", "ETH"].includes(method.network) &&
    /^0x[a-fA-F0-9]{64}$/.test(hash)
  );
}
export function validWithdrawal(request = {}) {
  return (
    validAmount(request.amount_usd) &&
    PAYOUT_METHODS.includes(request.payout_method) &&
    typeof request.payout_address === "string" &&
    request.payout_address.trim().length >= 10 &&
    request.payout_address.trim().length <= 256
  );
}
