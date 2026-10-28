import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("../../services/supabaseClient", () => ({ hasSupabaseConfig: false }));
import SupportRequests from "./SupportRequests";
beforeEach(() => localStorage.clear());
it("saves a bounded device request and offers an encoded email handoff without claiming delivery", async () => {
  render(<SupportRequests />);
  fireEvent.change(screen.getByLabelText("Describe the issue"), {
    target: { value: "Game stuck <example> & issue" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save support request" }));
  expect(await screen.findByText(/Request saved on this device only/)).toBeTruthy();
  const link = screen.getByRole("link", { name: "Email this request" });
  const url = new URL(link.href);
  expect(url.protocol).toBe("mailto:");
  expect(url.searchParams.get("body")).toContain("Game stuck <example> & issue");
  fireEvent.click(screen.getByRole("button", { name: "Clear saved requests" }));
  expect(screen.queryByText("Recent requests")).toBeNull();
  expect(localStorage.getItem("luckyOrbit:supportRequests")).toBeNull();
});
