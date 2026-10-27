/** Operator-side preparation only. This module must not be imported into the browser. */
export type DepositAsset = "BTC" | "ETH" | "BNB" | "USDT";
export type DepositNetwork = "BTC" | "ETH" | "BSC";
export interface DepositDestination {
  asset: DepositAsset;
  network: DepositNetwork;
  address: string;
  verifiedBy: string;
  verifiedAt: string;
}

const allowed = new Set(["BTC/BTC", "ETH/ETH", "BNB/BSC", "USDT/BSC"]);

/** Reject incomplete and ambiguous records; address verification is an operator responsibility. */
export function prepareDepositDirectory(input: readonly DepositDestination[]): readonly DepositDestination[] {
  const pairs = new Set<string>();
  return input.map((destination) => {
    const pair = `${destination.asset}/${destination.network}`;
    const address = destination.address.trim();
    const verifier = destination.verifiedBy.trim();
    const validAddress =
      destination.network === "BTC"
        ? /^(?:bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(address)
        : /^0x[a-fA-F0-9]{40}$/.test(address);
    if (
      !allowed.has(pair) ||
      !validAddress ||
      !verifier ||
      !Number.isFinite(Date.parse(destination.verifiedAt))
    )
      throw new Error("Invalid or unverified deposit destination");
    if (pairs.has(pair)) throw new Error("Duplicate deposit asset and network");
    pairs.add(pair);
    return { ...destination, address, verifiedBy: verifier };
  });
}
