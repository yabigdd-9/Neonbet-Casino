import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
const { update } = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("../../services/auth.service", () => ({ updatePassword: update }));
vi.mock("../../services/supabaseClient", () => ({ hasSupabaseConfig: true }));
import AuthModal from "./AuthModal";
beforeEach(() => update.mockReset());
it("starts recovery with empty fields and requires matching passwords", () => {
  const { rerender } = render(<AuthModal mode="login" />);
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "old-password" } });
  rerender(<AuthModal mode="recovery" />);
  expect(screen.getByLabelText("New password").value).toBe("");
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), {
    target: { value: "different-password" },
  });
  expect(screen.getByRole("button", { name: "Update password" }).disabled).toBe(true);
  expect(screen.getByRole("alert").textContent).toContain("do not match");
  expect(update).not.toHaveBeenCalled();
});
it("ignores a late password update after closing the recovery form", async () => {
  let finish;
  const updated = vi.fn();
  update.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const { unmount } = render(<AuthModal mode="recovery" onPasswordUpdated={updated} />);
  for (const label of ["New password", "Confirm new password"])
    fireEvent.change(screen.getByLabelText(label), { target: { value: "new-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));
  unmount();
  await act(async () => {
    finish();
  });
  expect(updated).not.toHaveBeenCalled();
});
