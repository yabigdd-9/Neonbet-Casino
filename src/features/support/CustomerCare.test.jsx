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
