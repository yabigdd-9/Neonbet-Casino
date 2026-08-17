// P1 acceptance tests: APP_MODE must be the single runtime source of truth.
// Covers the five scenarios mandated by the execution plan.
import { describe, it, expect } from "vitest";
import { resolveAppMode } from "./appMode";

describe("resolveAppMode (P1 single source of truth)", () => {
  it("no Supabase env + no mode → DEMO", () => {
    expect(resolveAppMode(undefined, false)).toBe("demo");
  });

  it("VITE_APP_MODE=demo + no Supabase env → DEMO", () => {
    expect(resolveAppMode("demo", false)).toBe("demo");
  });

  it("VITE_APP_MODE=demo + Supabase env exists → DEMO (explicit demo wins)", () => {
    expect(resolveAppMode("demo", true)).toBe("demo");
  });

  it("VITE_APP_MODE=supabase + valid Supabase env → SUPABASE", () => {
    expect(resolveAppMode("supabase", true)).toBe("supabase");
  });

  it("VITE_APP_MODE=supabase + missing Supabase env → FAILS CLEARLY (no silent downgrade)", () => {
    expect(() => resolveAppMode("supabase", false)).toThrow(/supabase/i);
  });

  it("no explicit mode + Supabase env present → SUPABASE (inferred)", () => {
    expect(resolveAppMode(undefined, true)).toBe("supabase");
  });
});
