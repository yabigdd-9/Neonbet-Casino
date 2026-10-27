import { afterEach, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ createClient: vi.fn(() => ({ auth: {} })) }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.clearAllMocks();
});
it("does not initialize a client in explicit demo mode with credentials present", async () => {
  vi.stubEnv("VITE_APP_MODE", "demo");
  vi.stubEnv("VITE_SUPABASE_URL", "https://synthetic.example.test");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "synthetic-fixture");
  const module = await import("./supabaseClient");
  expect(module.supabase).toBeNull();
  expect(mocks.createClient).not.toHaveBeenCalled();
});
it("fails closed rather than initializing a partially configured client", async () => {
  vi.stubEnv("VITE_APP_MODE", "supabase");
  vi.stubEnv("VITE_SUPABASE_URL", "");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
  const module = await import("./supabaseClient");
  const { CONFIG_ERROR } = await import("../config/appMode");
  expect(module.supabase).toBeNull();
  expect(CONFIG_ERROR).toContain("incomplete");
  expect(mocks.createClient).not.toHaveBeenCalled();
});
it("constructs one client only for the selected Supabase mode", async () => {
  vi.stubEnv("VITE_APP_MODE", "supabase");
  vi.stubEnv("VITE_SUPABASE_URL", "https://synthetic.example.test");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "synthetic-fixture");
  const first = await import("./supabaseClient");
  const second = await import("./supabaseClient");
  expect(first.requireSupabase()).toBe(second.supabase);
  expect(mocks.createClient).toHaveBeenCalledOnce();
});
