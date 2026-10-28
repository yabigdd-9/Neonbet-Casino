import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { getStatus, claim } = vi.hoisted(() => ({ getStatus: vi.fn(), claim: vi.fn() }));
vi.mock("../../services/referrals.service", () => ({ getReferralStatus: getStatus, claimReferral: claim }));
vi.mock("../../services/supabaseClient", () => ({ hasSupabaseConfig: true }));
import ReferralPanel from "./ReferralPanel";
beforeEach(() => {
  getStatus.mockReset();
  claim.mockReset();
  localStorage.clear();
  history.replaceState(null, "", `/?ref=LO-${"a".repeat(32)}`);
  vi.stubEnv("VITE_ENABLE_SHARED_REFERRALS", "true");
});
afterEach(() => vi.unstubAllEnvs());
it("waits for the user's explicit action before attributing an invitation", async () => {
  const status = { code: `LO-${"b".repeat(32)}`, credits: 0, count: 0, claimed: false };
  getStatus.mockResolvedValueOnce(status).mockResolvedValueOnce({ ...status, claimed: true });
  claim.mockResolvedValue(undefined);
  render(<ReferralPanel user={{ id: "alice" }} />);
  const apply = await screen.findByRole("button", { name: "Apply received invitation" });
  expect(claim).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Your invitation link").value).toContain(status.code);
  fireEvent.click(apply);
  await waitFor(() => expect(claim).toHaveBeenCalledWith(`LO-${"a".repeat(32)}`));
  await waitFor(() => expect(screen.queryByRole("button", { name: "Apply received invitation" })).toBeNull());
});
it("leaves rewards inactive when the feature is disabled", () => {
  vi.stubEnv("VITE_ENABLE_SHARED_REFERRALS", "false");
  render(<ReferralPanel user={{ id: "alice" }} />);
  expect(getStatus).not.toHaveBeenCalled();
  expect(screen.getByText(/Referral rewards are not active yet/)).toBeTruthy();
});

it("ignores a delayed status response after the account changes", async () => {
  let finishFirst;
  const first = { code: `LO-${"c".repeat(32)}`, credits: 10, count: 2, claimed: false };
  const second = { code: `LO-${"d".repeat(32)}`, credits: 0, count: 0, claimed: false };
  getStatus
    .mockReturnValueOnce(
      new Promise((resolve) => {
        finishFirst = resolve;
      }),
    )
    .mockResolvedValueOnce(second);
  const { rerender } = render(<ReferralPanel user={{ id: "alice" }} />);
  rerender(<ReferralPanel user={{ id: "bob" }} />);
  await waitFor(() => expect(screen.getByLabelText("Your invitation link").value).toContain(second.code));
  await act(async () => {
    finishFirst(first);
  });
  expect(screen.getByLabelText("Your invitation link").value).toContain(second.code);
});
