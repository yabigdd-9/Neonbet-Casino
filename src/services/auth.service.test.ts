import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
  },
}));
vi.mock("./supabaseClient", () => ({ hasSupabaseConfig: true, requireSupabase: () => mocks }));
import { signIn, signUp, signOut, onAuthChange, getSession } from "./auth.service";
beforeEach(() => vi.clearAllMocks());
it("returns user and session directly for login and registration", async () => {
  const data = { user: { id: "one" }, session: null };
  mocks.auth.signInWithPassword.mockResolvedValue({ data, error: null });
  mocks.auth.signUp.mockResolvedValue({ data, error: null });
  expect(await signIn({ email: "synthetic@example.test", password: "fixture-only" })).toEqual(data);
  expect(
    await signUp({
      email: "synthetic@example.test",
      password: "fixture-only",
      username: "Test",
      phone: "",
      contactMethod: "",
    }),
  ).toEqual(data);
});
it("throws logout and session errors", async () => {
  mocks.auth.signOut.mockResolvedValue({ error: new Error("Logout unavailable") });
  mocks.auth.getSession.mockResolvedValue({ error: new Error("Session unavailable") });
  await expect(signOut()).rejects.toThrow("Logout unavailable");
  await expect(getSession()).rejects.toThrow("Session unavailable");
});
it("returns a synchronous unsubscribe function and preserves events", () => {
  const unsubscribe = vi.fn();
  const callback = vi.fn();
  mocks.auth.onAuthStateChange.mockImplementation((listener) => {
    listener("PASSWORD_RECOVERY", { user: { id: "one" } });
    return { data: { subscription: { unsubscribe } } };
  });
  const stop = onAuthChange(callback);
  expect(typeof stop).toBe("function");
  stop();
  expect(unsubscribe).toHaveBeenCalledOnce();
  expect(callback).toHaveBeenCalledWith({ event: "PASSWORD_RECOVERY", session: { user: { id: "one" } } });
});
