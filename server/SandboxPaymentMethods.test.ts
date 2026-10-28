import { expect, it } from "vitest";
import { sandboxPaymentMethods, selectSandboxPaymentMethod } from "./SandboxPaymentMethods";

it("keeps all nine coin/network choices synthetic with no receiving destinations", () => {
  expect(sandboxPaymentMethods).toHaveLength(9);
  expect(new Set(sandboxPaymentMethods.map((method) => method.id)).size).toBe(9);
  for (const method of sandboxPaymentMethods) {
    expect(method.liveEnabled).toBe(false);
    expect(method.mode).toBe("synthetic");
    expect(method).not.toHaveProperty("address");
    expect(method).not.toHaveProperty("qrCode");
    expect(Object.isFrozen(method)).toBe(true);
  }
});
it("distinguishes assets on the same chain and USDT on different chains", () => {
  expect(selectSandboxPaymentMethod("sol-solana").asset).toBe("SOL");
  expect(selectSandboxPaymentMethod("usdt-solana").asset).toBe("USDT");
  expect(selectSandboxPaymentMethod("usdt-tron").network).toBe("Tron (TRC20)");
  expect(() => selectSandboxPaymentMethod("usdt-bitcoin")).toThrow("Unsupported");
});
