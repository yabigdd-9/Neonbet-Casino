import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SlotGameModal from "./SlotGameModal";
it("explains a rejected round and provides a working return path", () => {
  const start = vi.fn(() => false),
    close = vi.fn();
  render(
    <SlotGameModal
      game={{ title: "Fixture slot", symbols: ["7"], gradient: "" }}
      wallet={{ balance: 50, start, history: [] }}
      onClose={close}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Spin $0.50", exact: true }));
  expect(start).toHaveBeenCalledWith(expect.objectContaining({ title: "Fixture slot" }), 0.5);
  expect(screen.getByRole("alert").textContent).toContain("No credits were used");
  fireEvent.click(screen.getByRole("button", { name: "Back to lobby" }));
  expect(close).toHaveBeenCalledOnce();
});
