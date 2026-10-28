import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import CustomerCare from "./CustomerCare";

it("supports keyboard focus, safe deposit guidance, and returning focus on escape", () => {
  render(<CustomerCare />);
  const trigger = screen.getByRole("button", { name: "Customer Care" });
  fireEvent.click(trigger);
  const input = screen.getByRole("textbox", { name: "Your message" });
  expect(document.activeElement).toBe(input);
  fireEvent.change(input, { target: { value: "How do I deposit?" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(screen.getByText(/Real-money deposits are not available/)).toBeTruthy();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

it("does not imply that verification or withdrawals process real funds", () => {
  render(<CustomerCare />);
  fireEvent.click(screen.getByRole("button", { name: "Customer Care" }));
  const input = screen.getByRole("textbox", { name: "Your message" });
  for (const question of ["How do I withdraw?", "How do I verify?"]) {
    fireEvent.change(input, { target: { value: question } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  }
  expect(screen.getByText(/Practice credits have no cash value/)).toBeTruthy();
  expect(screen.getByText(/does not verify real payments/)).toBeTruthy();
});
