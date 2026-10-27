// Synthetic reconciliation exercise only. No persistence, external provider or money movement.
export type SyntheticRecord = {
  network: string;
  reference: string;
  asset: string;
  amountMinor: number;
  status: "confirmed" | "pending" | "failed";
};
export type ReconciliationFinding = {
  key: string;
  issue: "invalid" | "duplicate" | "missing" | "unexpected" | "mismatch" | "unconfirmed";
};

function valid(row: SyntheticRecord): boolean {
  return (
    !!row &&
    typeof row.network === "string" &&
    /^[A-Z0-9-]{2,32}$/.test(row.network) &&
    typeof row.reference === "string" &&
    /^[A-Za-z0-9]{8,128}$/.test(row.reference) &&
    typeof row.asset === "string" &&
    /^[A-Z0-9]{2,16}$/.test(row.asset) &&
    Number.isSafeInteger(row.amountMinor) &&
    row.amountMinor > 0 &&
    ["confirmed", "pending", "failed"].includes(row.status)
  );
}

export function reconcileSynthetic(
  expected: readonly SyntheticRecord[],
  observed: readonly SyntheticRecord[],
): ReconciliationFinding[] {
  const findings: ReconciliationFinding[] = [];
  function index(rows: readonly SyntheticRecord[], side: string) {
    const result = new Map<string, SyntheticRecord>();
    const duplicates = new Set<string>();
    rows.forEach((row, position) => {
      if (!valid(row)) {
        findings.push({ key: `${side}:${position}`, issue: "invalid" });
        return;
      }
      const key = `${row.network}:${row.reference}`;
      if (result.has(key)) {
        duplicates.add(key);
        findings.push({ key, issue: "duplicate" });
      } else result.set(key, row);
    });
    return { result, duplicates };
  }
  const left = index(expected, "expected");
  const right = index(observed, "observed");
  for (const [key, entry] of left.result) {
    if (left.duplicates.has(key) || right.duplicates.has(key)) continue;
    const other = right.result.get(key);
    if (!other) findings.push({ key, issue: "missing" });
    else if (entry.asset !== other.asset || entry.amountMinor !== other.amountMinor)
      findings.push({ key, issue: "mismatch" });
    else if (entry.status !== "confirmed" || other.status !== "confirmed")
      findings.push({ key, issue: "unconfirmed" });
  }
  for (const key of right.result.keys())
    if (!left.result.has(key) && !right.duplicates.has(key)) findings.push({ key, issue: "unexpected" });
  return findings;
}
