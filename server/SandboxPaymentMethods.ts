// Private test-method catalogue. No addresses, QR codes, live transfers or settlement.
export const sandboxPaymentMethods = Object.freeze(
  [
    { id: "btc-bitcoin", asset: "BTC", network: "Bitcoin" },
    { id: "eth-ethereum", asset: "ETH", network: "Ethereum (ERC20)" },
    { id: "bnb-bsc", asset: "BNB", network: "BNB Smart Chain (BEP20)" },
    { id: "sol-solana", asset: "SOL", network: "Solana" },
    { id: "trx-tron", asset: "TRX", network: "Tron" },
    { id: "usdt-bsc", asset: "USDT", network: "BNB Smart Chain (BEP20)" },
    { id: "usdt-ethereum", asset: "USDT", network: "Ethereum (ERC20)" },
    { id: "usdt-tron", asset: "USDT", network: "Tron (TRC20)" },
    { id: "usdt-solana", asset: "USDT", network: "Solana" },
  ].map((method) => Object.freeze({ ...method, liveEnabled: false as const, mode: "synthetic" as const })),
);

export function selectSandboxPaymentMethod(id: string) {
  const method = sandboxPaymentMethods.find((entry) => entry.id === id);
  if (!method) throw new Error("Unsupported sandbox payment method");
  return method;
}
