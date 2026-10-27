import { beforeEach, it, expect, vi } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import React from "react";
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  callback: null,
  unsubscribe: vi.fn(),
  getProfile: vi.fn(),
  getAdminProfiles: vi.fn(),
  getSubmissions: vi.fn(),
  getWithdrawals: vi.fn(),
}));
vi.mock("../services/auth.service", () => ({
  hasSupabaseConfig: true,
  getSession: mocks.getSession,
  onAuthChange: (callback) => {
    mocks.callback = callback;
    return mocks.unsubscribe;
  },
}));
vi.mock("../services/profiles.service", () => ({
  getProfile: mocks.getProfile,
  getAdminProfiles: mocks.getAdminProfiles,
  buildDemoProfile: vi.fn(),
}));
vi.mock("../services/verification.service", () => ({ getSubmissions: mocks.getSubmissions }));
vi.mock("../services/transactions.service", () => ({ getWithdrawals: mocks.getWithdrawals }));
import { useAccount } from "./useAccount";
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue(null);
  mocks.getProfile.mockImplementation(async (id) => ({ id, role: "user", username: id }));
  mocks.getAdminProfiles.mockResolvedValue([]);
  mocks.getSubmissions.mockResolvedValue([]);
  mocks.getWithdrawals.mockResolvedValue([]);
});
const event = (id, name = "SIGNED_IN") =>
  mocks.callback({ event: name, session: id ? { user: { id } } : null });
it("loads the restored session and never queries admin data for a regular user", async () => {
  mocks.getSession.mockResolvedValue({ user: { id: "alice" } });
  const { result } = renderHook(() => useAccount());
  await waitFor(() => expect(result.current.profile?.id).toBe("alice"));
  expect(mocks.getAdminProfiles).not.toHaveBeenCalled();
});
it("ignores a late account result after logout", async () => {
  let finish;
  mocks.getProfile.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const { result } = renderHook(() => useAccount());
  await act(async () => event("alice"));
  await act(async () => event(null, "SIGNED_OUT"));
  await act(async () => finish({ id: "alice", role: "admin" }));
  expect(result.current.user).toBeNull();
  expect(result.current.profile).toBeNull();
});
it("ignores an older user response after switching users", async () => {
  let finish;
  mocks.getProfile.mockImplementation((id) =>
    id === "alice"
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : Promise.resolve({ id, role: "user" }),
  );
  const { result } = renderHook(() => useAccount());
  await act(async () => event("alice"));
  await act(async () => event("bob"));
  await waitFor(() => expect(result.current.profile?.id).toBe("bob"));
  await act(async () => finish({ id: "alice", role: "admin" }));
  expect(result.current.profile.id).toBe("bob");
});
it("keeps recovery events and avoids reloading on token refresh", async () => {
  const { result } = renderHook(() => useAccount());
  await act(async () => event("alice"));
  await waitFor(() => expect(result.current.profile?.id).toBe("alice"));
  mocks.getProfile.mockClear();
  await act(async () => event("alice", "TOKEN_REFRESHED"));
  expect(mocks.getProfile).not.toHaveBeenCalled();
  await act(async () => event("alice", "PASSWORD_RECOVERY"));
  expect(result.current.recovery).toBe(true);
});
it("surfaces session and account failures with retry", async () => {
  mocks.getSession.mockRejectedValue(new Error("Session unavailable"));
  const { result } = renderHook(() => useAccount());
  await waitFor(() => expect(result.current.accountError).toBe("Session unavailable"));
  mocks.getProfile.mockRejectedValueOnce(new Error("Offline"));
  await act(async () => event("alice"));
  await waitFor(() => expect(result.current.accountError).toBe("Offline"));
  await act(async () => result.current.loadAccount());
  expect(result.current.profile.id).toBe("alice");
});
it("cleans up synchronous subscriptions during Strict Mode remount and unmount", async () => {
  const { unmount } = renderHook(() => useAccount(), {
    wrapper: ({ children }) => <React.StrictMode>{children}</React.StrictMode>,
  });
  await act(async () => {});
  unmount();
  const mountedAgain = renderHook(() => useAccount());
  await act(async () => {});
  mountedAgain.unmount();
  expect(mocks.unsubscribe.mock.calls.length).toBeGreaterThanOrEqual(2);
});
it("fetches paginated admin records only after the profile confirms its role", async () => {
  mocks.getProfile.mockResolvedValue({ id: "admin", role: "admin" });
  const { result } = renderHook(() => useAccount());
  await act(async () => event("admin"));
  await waitFor(() => expect(result.current.profile?.role).toBe("admin"));
  await act(async () => result.current.loadAccount(undefined, 2));
  expect(mocks.getAdminProfiles).toHaveBeenLastCalledWith(20, 2);
});

it("shows an admin's own latest records instead of another user's queue entries", async () => {
  mocks.getProfile.mockResolvedValue({ id: "admin", role: "admin" });
  mocks.getSubmissions.mockImplementation(async ({ isAdmin }) =>
    isAdmin ? [{ id: "other-submission", user_id: "other" }] : [{ id: "own-submission", user_id: "admin" }],
  );
  mocks.getWithdrawals.mockImplementation(async ({ isAdmin }) =>
    isAdmin ? [{ id: "other-withdrawal", user_id: "other" }] : [{ id: "own-withdrawal", user_id: "admin" }],
  );
  const { result } = renderHook(() => useAccount());
  await act(async () => event("admin"));
  await waitFor(() => expect(result.current.profile?.role).toBe("admin"));
  expect(result.current.submissions[0].id).toBe("other-submission");
  expect(result.current.latestSubmission?.id).toBe("own-submission");
  expect(result.current.latestWithdrawal?.id).toBe("own-withdrawal");
});

it("refreshes the selected admin page and resets pagination when the user changes", async () => {
  mocks.getProfile.mockResolvedValue({ id: "admin", role: "admin" });
  const { result } = renderHook(() => useAccount());
  await act(async () => event("admin"));
  await waitFor(() => expect(result.current.profile?.role).toBe("admin"));
  await act(async () => result.current.loadAccount(undefined, 2));
  expect(result.current.adminPage).toBe(2);
  await act(async () => result.current.loadAccount());
  expect(mocks.getAdminProfiles).toHaveBeenLastCalledWith(20, 2);
  await act(async () => event(null, "SIGNED_OUT"));
  expect(result.current.adminPage).toBe(0);
});

it("returns to the first personal page if admin access is revoked", async () => {
  mocks.getProfile.mockResolvedValue({ id: "admin", role: "admin" });
  const { result } = renderHook(() => useAccount());
  await act(async () => event("admin"));
  await waitFor(() => expect(result.current.profile?.role).toBe("admin"));
  await act(async () => result.current.loadAccount(undefined, 2));
  mocks.getProfile.mockResolvedValue({ id: "admin", role: "user" });
  await act(async () => result.current.loadAccount());
  expect(result.current.adminPage).toBe(0);
  expect(mocks.getSubmissions).toHaveBeenLastCalledWith({ userId: "admin", isAdmin: false, page: 0 });
});

it("keeps the old page label until the new admin page has loaded", async () => {
  let finish;
  let pending;
  mocks.getProfile.mockResolvedValue({ id: "admin", role: "admin" });
  mocks.getSubmissions.mockImplementation(({ isAdmin, page }) =>
    isAdmin && page === 2
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : Promise.resolve([]),
  );
  const { result } = renderHook(() => useAccount());
  await act(async () => event("admin"));
  await waitFor(() => expect(result.current.profile?.role).toBe("admin"));
  await act(async () => {
    pending = result.current.loadAccount(undefined, 2);
    await Promise.resolve();
  });
  expect(result.current.accountLoading).toBe(true);
  expect(result.current.adminPage).toBe(0);
  await act(async () => {
    finish([]);
    await pending;
  });
  expect(result.current.adminPage).toBe(2);
});
