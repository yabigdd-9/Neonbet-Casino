import { expect, it } from "vitest";
import { reconcileSynthetic, type SyntheticRecord } from "./syntheticReconciliation";
const row: SyntheticRecord = {
  network: "BTC",
  reference: "synthetic001",
  asset: "BTC",
  amountMinor: 50,
  status: "confirmed",
};
it("matches only confirmed identical records and flags discrepancies", () => {
  expect(reconcileSynthetic([row], [row])).toEqual([]);
  expect(reconcileSynthetic([row], [])).toContainEqual({ key: "BTC:synthetic001", issue: "missing" });
  expect(reconcileSynthetic([], [row])).toContainEqual({ key: "BTC:synthetic001", issue: "unexpected" });
  expect(reconcileSynthetic([row], [{ ...row, amountMinor: 51 }])).toContainEqual({
    key: "BTC:synthetic001",
    issue: "mismatch",
  });
  expect(reconcileSynthetic([row], [{ ...row, status: "pending" }])).toContainEqual({
    key: "BTC:synthetic001",
    issue: "unconfirmed",
  });
  expect(reconcileSynthetic([row], [row, row])).toContainEqual({
    key: "BTC:synthetic001",
    issue: "duplicate",
  });
  expect(reconcileSynthetic([row], [{ ...row, amountMinor: 0.5 }])).toContainEqual({
    key: "observed:0",
    issue: "invalid",
  });
});
