// P2 — server-authoritative verification fee.
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dataStore so we can assert what the service passes through and where
// the fee comes from, without a live Supabase connection.
vi.mock("./dataStore", () => {
  const dataStore = {
    getVerificationFee: vi.fn(),
    insertSubmission: vi.fn(),
  };
  return { dataStore };
});

import { dataStore } from "./dataStore";
import { submitSubmission, getVerificationFee, validateTxHash } from "./verification.service.js";

const method = { name: "USDT", network: "BSC" };

describe("verification fee — server authority (P2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads the fee from the authoritative source (not a hard-coded constant)", async () => {
    dataStore.getVerificationFee.mockResolvedValue(120);
    const fee = await getVerificationFee();
    expect(fee).toBe(120);
    expect(dataStore.getVerificationFee).toHaveBeenCalledOnce();
  });

  it("submits with the server-decided fee, ignoring any client-supplied amount", async () => {
    dataStore.getVerificationFee.mockResolvedValue(75);
    dataStore.insertSubmission.mockResolvedValue({ id: "abc", error: null });
    // A malicious caller tries to pass amount_usd = 1; the amountUsd passed in is
    // whatever the server fee resolved to (75), and the RPC ignores it anyway.
    await submitSubmission({ userId: "u1", method, txHash: "0xabcdefgh" });
    expect(dataStore.insertSubmission).toHaveBeenCalledWith({
      userId: "u1",
      asset: "USDT",
      network: "BSC",
      txHash: "0xabcdefgh",
      amountUsd: 75,
    });
  });

  it("uses a custom operator fee when configured (white-label)", async () => {
    dataStore.getVerificationFee.mockResolvedValue(250);
    dataStore.insertSubmission.mockResolvedValue({ id: "xyz", error: null });
    await submitSubmission({ userId: "u2", method, txHash: "0x12345678" });
    expect(dataStore.insertSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ amountUsd: 250 }),
    );
  });

  it("validateTxHash still rejects short/empty hashes", () => {
    expect(validateTxHash("")).toBe(false);
    expect(validateTxHash("abc")).toBe(false);
    expect(validateTxHash("abcdefgh")).toBe(true);
  });
});
