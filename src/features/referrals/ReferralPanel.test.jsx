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
it("does not offer a browser-only code while the account code is loading and supports retry", async () => {
  let finish;
  getStatus.mockReturnValueOnce(
    new Promise((_, reject) => {
      finish = reject;
    }),
  );
  render(<ReferralPanel user={{ id: "alice" }} />);
  expect(screen.getByLabelText("Your invitation link").value).toBe("");
  expect(screen.getByRole("button", { name: "Copy invitation link" }).disabled).toBe(true);
  await act(async () => {
    finish(new Error("Shared referral rewards are unavailable."));
  });
  const status = { code: `LO-${"b".repeat(32)}`, credits: 0, count: 0, claimed: false };
  getStatus.mockResolvedValueOnce(status);
  fireEvent.click(screen.getByRole("button", { name: "Refresh referral status" }));
  await waitFor(() => expect(screen.getByLabelText("Your invitation link").value).toContain(status.code));
});
it("ignores a pending claim when the account changes", async () => {
  let finish;
  const first = { code: `LO-${"b".repeat(32)}`, credits: 0, count: 0, claimed: false };
  const second = { ...first, code: `LO-${"c".repeat(32)}`, credits: 15, count: 3 };
  getStatus.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  claim.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const { rerender } = render(<ReferralPanel user={{ id: "alice" }} />);
  fireEvent.click(await screen.findByRole("button", { name: "Apply received invitation" }));
  rerender(<ReferralPanel user={{ id: "bob" }} />);
  await waitFor(() => expect(screen.getByLabelText("Your invitation link").value).toContain(second.code));
  await act(async () => {
    finish();
  });
  expect(getStatus).toHaveBeenCalledTimes(2);
  expect(screen.getByText(/15 non-cash practice credits earned/)).toBeTruthy();
  expect(screen.queryByText(/Invitation applied/)).toBeNull();
});
it("keeps a confirmed claim applied even when the status refresh fails", async () => {
  getStatus
    .mockResolvedValueOnce({ code: `LO-${"b".repeat(32)}`, credits: 0, count: 0, claimed: false })
    .mockRejectedValueOnce(new Error("Status unavailable"));
  claim.mockResolvedValueOnce(undefined);
  render(<ReferralPanel user={{ id: "alice" }} />);
  fireEvent.click(await screen.findByRole("button", { name: "Apply received invitation" }));
  await screen.findByText(/Invitation applied/);
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Apply received invitation" })).toBeNull();
});
