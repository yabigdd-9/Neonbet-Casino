import { it, expect } from "vitest";
import { validateTxHash } from "./verification.service";
it("validates transaction hashes for the selected network", () => {
  expect(validateTxHash("a".repeat(64), { name: "BTC", network: "BTC" })).toBe(true);
  expect(validateTxHash("0x" + "a".repeat(64), { name: "ETH", network: "ETH" })).toBe(true);
  for (const value of [null, undefined, 123, "abcdefgh", " ", "0x" + "g".repeat(64)])
    expect(validateTxHash(value)).toBe(false);
  expect(validateTxHash("a".repeat(64), { name: "ETH", network: "ETH" })).toBe(false);
});
