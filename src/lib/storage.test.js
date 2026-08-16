import { describe, it, expect, beforeEach } from "vitest";
import {
  formatMoney,
  readStoredArray,
  writeStoredArray,
  readStoredValue,
  writeStoredValue,
} from "./storage.js";

describe("formatMoney", () => {
  it("formats finite numbers to 2-decimal dollar strings", () => {
    expect(formatMoney(100)).toBe("$100.00");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(1.5)).toBe("$1.50");
    expect(formatMoney(-3)).toBe("$-3.00");
  });

  it("coerces numeric strings", () => {
    expect(formatMoney("42.1")).toBe("$42.10");
  });

  it("returns $0.00 for non-finite values", () => {
    expect(formatMoney(NaN)).toBe("$0.00");
    expect(formatMoney(Infinity)).toBe("$0.00");
    expect(formatMoney("abc")).toBe("$0.00");
    expect(formatMoney(undefined)).toBe("$0.00");
  });
});

describe("stored arrays", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips an array through localStorage", () => {
    const value = [{ id: 1 }, { id: 2 }];
    writeStoredArray("key", value);
    expect(readStoredArray("key")).toEqual(value);
  });

  it("returns an empty array for a missing key", () => {
    expect(readStoredArray("missing")).toEqual([]);
  });

  it("returns an empty array when stored JSON is corrupt", () => {
    window.localStorage.setItem("bad", "{not valid json");
    expect(readStoredArray("bad")).toEqual([]);
  });
});

describe("stored values", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips a JSON-serialisable value", () => {
    writeStoredValue("name", { a: 1, b: [2, 3] });
    expect(readStoredValue("name")).toEqual({ a: 1, b: [2, 3] });
  });

  it("returns the fallback for a missing key", () => {
    expect(readStoredValue("absent")).toBeNull();
    expect(readStoredValue("absent", "default")).toBe("default");
  });

  it("returns the fallback when stored JSON is corrupt", () => {
    window.localStorage.setItem("bad", "not json");
    expect(readStoredValue("bad", "fb")).toBe("fb");
  });
});
