import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ enabled: true, listener: null, auth: {
  getSession: vi.fn(), onAuthStateChange: vi.fn(), signInWithPassword: vi.fn(),
  signUp: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn(), updateUser: vi.fn(),
}, unsubscribe: vi.fn() }));
vi.mock("./supabaseClient", () => ({ supabase: { auth: state.auth }, get hasSupabaseConfig() { return state.enabled; } }));
import { getSession, onAuthChange, signIn, signUp, signOut, resetPassword, updatePassword } from "./auth.service";

beforeEach(() => {
  vi.resetAllMocks();
  state.enabled = true;
  state.auth.onAuthStateChange.mockImplementation((cb) => { state.listener = cb; return { data: { subscription: { unsubscribe: state.unsubscribe } } }; });
});
afterEach(() => vi.useRealTimers());
it("returns the response envelope expected by login and registration handlers", async () => {
  const data = { user: { id: "test-user" }, session: {} };
  state.auth.signInWithPassword.mockResolvedValue({ data, error: null });
  state.auth.signUp.mockResolvedValue({ data, error: null });
  expect(await signIn({ email: "a@example.test", password: "example-password" })).toEqual({ data });
  expect(await signUp({ email: "a@example.test", password: "example-password" })).toEqual({ data });
});
it("surfaces session and sign-out failures instead of reporting success", async () => {
  const error = new Error("provider failure");
  state.auth.getSession.mockResolvedValue({ data: {}, error });
  state.auth.signOut.mockResolvedValue({ error });
  await expect(getSession()).rejects.toBe(error);
  await expect(signOut()).rejects.toBe(error);
});
it("returns synchronous cleanup and defers callbacks outside the auth lock", () => {
  vi.useFakeTimers();
  const callback = vi.fn();
  const cleanup = onAuthChange(callback);
  expect(typeof cleanup).toBe("function");
  state.listener("PASSWORD_RECOVERY", { user: { id: "user" } });
  expect(callback).not.toHaveBeenCalled();
  vi.runAllTimers();
  expect(callback).toHaveBeenCalledWith({ id: "user" }, "PASSWORD_RECOVERY");
  state.listener("SIGNED_OUT", null);
  cleanup();
  vi.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.unsubscribe).toHaveBeenCalledOnce();
});
it("handles an unconfigured account backend without making requests", async () => {
  state.enabled = false;
  expect(await getSession()).toBeNull();
  onAuthChange(vi.fn())();
  await signOut();
  await expect(signIn({})).rejects.toThrow("unavailable");
  await expect(resetPassword("a@example.test", "https://example.test")).rejects.toThrow("unavailable");
  expect(state.auth.signInWithPassword).not.toHaveBeenCalled();
});
it("propagates recovery and password-update failures", async () => {
  const error = new Error("expired recovery");
  state.auth.resetPasswordForEmail.mockResolvedValue({ error });
  state.auth.updateUser.mockResolvedValue({ error });
  await expect(resetPassword("a@example.test", "https://example.test")).rejects.toBe(error);
  await expect(updatePassword("new-test-password")).rejects.toBe(error);
});
