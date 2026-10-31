import React, { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useDemoWallet } from "../../hooks/useDemoWallet";
import SlotGameModal from "./SlotGameModal";
import ArcadeGameModal from "./ArcadeGameModal";

const slot = { title: "Status scatter", mechanic: "scatter", symbols: ["⭐", "X"] };
const arcade = { id: "coin-flip", title: "Status coin flip", rule: "Heads returns 2x; tails returns 0x." };

function PlayerSession({ game, Player }) {
  const wallet = useDemoWallet("round-status-fixture");
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Reopen player
      </button>
      {open && <Player game={game} wallet={wallet} onClose={() => setOpen(false)} />}
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("replaces a previous slot bonus result while pending and settles after the player closes", () => {
  vi.useFakeTimers();
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  render(<PlayerSession game={slot} Player={SlotGameModal} />);
  expect(screen.getByRole("status").textContent).toContain("No round played yet");
  fireEvent.click(screen.getByRole("button", { name: "Spin $0.50", exact: true }));
  act(() => vi.advanceTimersByTime(650));
  expect(screen.getByRole("status").textContent).toContain("3 bonus spins");
  expect(screen.getByRole("status").textContent).toContain("Returned$60.00");
  expect(screen.getByRole("status").textContent).toContain("Net change +$59.50");

  random.mockReturnValue(0.99);
  fireEvent.click(screen.getByRole("button", { name: "Spin $0.50", exact: true }));
  const pending = screen.getByRole("status").textContent;
  expect(pending).toContain("Spinning…");
  expect(pending).toContain("Result pending");
  expect(pending).not.toContain("bonus");
  expect(pending).not.toContain("$60.00");
  expect(pending).not.toContain("Returned");
  expect(pending).not.toContain("Net change");
  fireEvent.click(screen.getByRole("button", { name: "Back to lobby" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  act(() => vi.advanceTimersByTime(650));
  fireEvent.click(screen.getByRole("button", { name: "Reopen player" }));
  expect(screen.getByRole("status").textContent).toContain("Not enough stars");
  expect(screen.getByRole("status").textContent).toContain("Returned$0.00");
  expect(screen.getByRole("status").textContent).toContain("Net change −$0.50");
});

it("replaces a previous arcade return with pending feedback until the next result settles", () => {
  vi.useFakeTimers();
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  render(<PlayerSession game={arcade} Player={ArcadeGameModal} />);
  fireEvent.click(screen.getByRole("button", { name: "Play $0.50", exact: true }));
  act(() => vi.advanceTimersByTime(650));
  expect(screen.getByRole("status").textContent).toContain("Heads");
  expect(screen.getByRole("status").textContent).toContain("Returned$1.00");
  random.mockReturnValue(0.99);
  fireEvent.click(screen.getByRole("button", { name: "Play $0.50", exact: true }));
  const pending = screen.getByRole("status").textContent;
  expect(pending).toContain("Playing…");
  expect(pending).toContain("Result pending");
  expect(pending).not.toContain("Heads");
  expect(pending).not.toContain("$1.00");
  expect(pending).not.toContain("Returned");
  expect(pending).not.toContain("Net change");
  act(() => vi.advanceTimersByTime(650));
  expect(screen.getByRole("status").textContent).toContain("Tails");
  expect(screen.getByRole("status").textContent).toContain("Returned$0.00");
  expect(screen.getByRole("status").textContent).toContain("Net change −$0.50");
});

it.each(
  [
    { kind: "slot", Player: SlotGameModal, game: slot },
    { kind: "arcade", Player: ArcadeGameModal, game: arcade },
  ].flatMap((player) =>
    [
      { winCents: 25, net: "−$0.25" },
      { winCents: 50, net: "$0.00" },
      { winCents: 100, net: "+$0.50" },
    ].map((outcome) => ({ ...player, ...outcome })),
  ),
)(
  "$kind distinguishes returned stake from net change with $winCents returned cents",
  ({ Player, game, winCents, net }) => {
    render(
      <Player
        game={game}
        wallet={{
          balance: 50,
          history: [],
          start: vi.fn(),
          round: {
            gameId: game.id || game.title,
            label: "Settled slot",
            title: "Settled arcade",
            reels: ["X", "X", "X", "X", "X"],
            visual: [1],
            win: winCents / 100,
            winCents,
            stakeCents: 50,
          },
        }}
        onClose={() => {}}
      />,
    );
    const status = screen.getByRole("status").textContent;
    expect(status).toContain(`Returned$${(winCents / 100).toFixed(2)}`);
    expect(status).toContain(`Net change ${net}`);
    expect(status).not.toContain(`+$${(winCents / 100).toFixed(2)}`);
  },
);
