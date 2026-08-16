import { describe, it, expect } from "vitest";
import { validateTxHash } from "./verification.service.js";

describe("validateTxHash", () => {
  it("accepts a transaction hash of length >= 8", () => {
    expect(validateTxHash("abcdefgh")).toBe(true);
    expect(validateTxHash("0123456789abcdef")).toBe(true);
  });

  it("accepts a hash with surrounding whitespace once trimmed", () => {
    expect(validateTxHash("  abcdefgh  ")).toBe(true);
  });

  it("rejects hashes shorter than 8 characters", () => {
    expect(validateTxHash("abc")).toBe(false);
  });

  it("rejects whitespace-only and empty strings", () => {
    expect(validateTxHash("")).toBe(false);
    expect(validateTxHash("   ")).toBe(false);
  });

  it("rejects nullish / non-string input", () => {
    expect(validateTxHash(null)).toBe(false);
    expect(validateTxHash(undefined)).toBe(false);
  });
});
