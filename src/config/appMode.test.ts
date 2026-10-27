import { it, expect } from "vitest";
import { resolveMode } from "./appMode";
it("enforces explicit demo mode even with credentials", () =>
  expect(
    resolveMode({
      VITE_APP_MODE: "demo",
      VITE_SUPABASE_URL: "https://example.test",
      VITE_SUPABASE_ANON_KEY: "synthetic",
    }).mode,
  ).toBe("demo"));
it("fails closed when Supabase configuration is incomplete", () => {
  expect(resolveMode({ VITE_APP_MODE: "supabase" }).mode).toBe("error");
  expect(resolveMode({ VITE_APP_MODE: "typo" }).mode).toBe("error");
});
it("retains automatic selection for existing deployments", () => {
  expect(resolveMode({}).mode).toBe("demo");
  expect(
    resolveMode({ VITE_SUPABASE_URL: "https://example.test", VITE_SUPABASE_ANON_KEY: "synthetic" }).mode,
  ).toBe("supabase");
});

it("rejects malformed service URLs before client initialization", () =>
  expect(
    resolveMode({
      VITE_APP_MODE: "supabase",
      VITE_SUPABASE_URL: "invalid",
      VITE_SUPABASE_ANON_KEY: "synthetic",
    }).mode,
  ).toBe("error"));
