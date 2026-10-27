import { beforeEach, it, expect, vi } from "vitest";
import { cleanup, render, fireEvent } from "@testing-library/react";
import React from "react";
vi.mock("../../config/features", () => ({
  features: { promotions: false, verification: false, withdrawals: false, account: true },
}));
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
});
it("omits navigation for disabled features", () => {
  const view = render(<Sidebar open={false} setOpen={() => {}} user={{ id: "one" }} />);
  expect(view.queryByRole("button", { name: "Promotions" })).toBeNull();
  expect(view.queryByRole("button", { name: "Verification" })).toBeNull();
  expect(view.queryByRole("button", { name: "Withdrawals" })).toBeNull();
});
it("opens the account section for a signed-in user", () => {
  const section = document.createElement("section");
  section.id = "account";
  section.scrollIntoView = vi.fn();
  document.body.append(section);
  const openAuth = vi.fn();
  const view = render(<MobileNav user={{ id: "one" }} onOpenAuth={openAuth} />);
  fireEvent.click(view.getByRole("button", { name: "Account", exact: true }));
  expect(section.scrollIntoView).toHaveBeenCalled();
  expect(openAuth).not.toHaveBeenCalled();
});
it("focuses catalogue search and opens login for signed-out account navigation", () => {
  const section = document.createElement("section");
  section.id = "providers";
  section.scrollIntoView = vi.fn();
  const input = document.createElement("input");
  section.append(input);
  document.body.append(section);
  const openAuth = vi.fn();
  const view = render(<MobileNav user={null} onOpenAuth={openAuth} />);
  fireEvent.click(view.getByRole("button", { name: "Search", exact: true }));
  expect(document.activeElement).toBe(input);
  fireEvent.click(view.getByRole("button", { name: "Account", exact: true }));
  expect(openAuth).toHaveBeenCalledWith("login");
});
