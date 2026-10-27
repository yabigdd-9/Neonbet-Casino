import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    eq: vi.fn(),
    then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
      Promise.resolve({ data: [], error: null }).then(resolve, reject),
  };
  for (const method of [query.select, query.order, query.range, query.eq]) method.mockReturnValue(query);
  return { query, from: vi.fn(() => query) };
});
vi.mock("./supabaseClient", () => ({
  hasSupabaseConfig: true,
  requireSupabase: () => ({ from: mocks.from }),
}));
import { getSubmissions } from "./verification.service";
import { getWithdrawals } from "./transactions.service";
beforeEach(() => vi.clearAllMocks());
it("filters an admin's personal record requests by the explicit user ID", async () => {
  for (const getRecords of [getSubmissions, getWithdrawals]) {
    await getRecords({ userId: "admin-user", isAdmin: false, limit: 1 });
    expect(mocks.query.eq).toHaveBeenLastCalledWith("user_id", "admin-user");
    expect(mocks.query.range).toHaveBeenLastCalledWith(0, 0);
  }
});
it("rejects a personal record request when the user ID is missing", async () => {
  for (const getRecords of [getSubmissions, getWithdrawals]) {
    await expect(getRecords({ userId: "", isAdmin: false })).rejects.toThrow("User ID required");
  }
  expect(mocks.from).not.toHaveBeenCalled();
});
