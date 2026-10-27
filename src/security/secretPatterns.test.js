import { it, expect } from "vitest";
import { detectSecret } from "../../scripts/secret-patterns.mjs";
it("detects synthetic secrets without exposing their values", () => {
  expect(detectSecret("0x" + "a".repeat(40))).toBe("EVM address");
  expect(detectSecret("1" + "A".repeat(30))).toBe("Bitcoin address");
  expect(detectSecret("sk-" + "a".repeat(30))).toBe("API key");
});
it("does not mistake commit hashes or transaction references for wallet addresses", () => {
  expect(detectSecret("9717a96b8353993d1c30046247aff7cad0536659")).toBeNull();
  expect(detectSecret("0x" + "a".repeat(64))).toBeNull();
});
