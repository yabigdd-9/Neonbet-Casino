import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SlotGameModal from "./SlotGameModal";
import GameLaunchModal from "./GameLaunchModal";
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

it("makes launch presets selectable and passes the opening bet to the player", () => {
  const launch = vi.fn();
  const view = render(
    <GameLaunchModal
      game={{ title: "Fixture slot", symbols: ["7"] }}
      onLaunch={launch}
      onClose={() => {}}
      onToggleFavorite={() => {}}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Opening bet $0.25", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Launch Game", exact: true }));
  expect(launch).toHaveBeenCalledWith(0.25);
  view.unmount();
  const start = vi.fn(() => true);
  render(
    <SlotGameModal
      game={{ title: "Fixture slot", symbols: ["7"] }}
      initialBet={0.25}
      wallet={{ balance: 50, start, history: [] }}
      onClose={() => {}}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Spin $0.25", exact: true }));
  expect(start).toHaveBeenCalledWith(expect.objectContaining({ title: "Fixture slot" }), 0.25);
});
