import { describe, expect, it } from "vitest";
import { prepareDepositDirectory, type DepositDestination } from "./depositDirectory";

const example: DepositDestination = {
  asset: "USDT",
  network: "BSC",
  address: `0x${"a".repeat(40)}`,
  verifiedBy: "synthetic operator",
  verifiedAt: "2026-01-01T00:00:00Z",
};

describe("operator deposit directory", () => {
  it("accepts an explicitly verified synthetic destination", () => {
    expect(prepareDepositDirectory([example])).toEqual([example]);
    expect(prepareDepositDirectory([])).toEqual([]);
  });
  it("rejects mismatched networks, malformed addresses, missing verification and duplicate pairs", () => {
    for (const candidate of [
      { ...example, network: "BTC" as const },
      { ...example, address: "not-an-address" },
      { ...example, verifiedBy: " " },
      { ...example, verifiedAt: "invalid" },
    ])
      expect(() => prepareDepositDirectory([candidate])).toThrow();
    expect(() => prepareDepositDirectory([example, example])).toThrow("Duplicate");
  });
});
