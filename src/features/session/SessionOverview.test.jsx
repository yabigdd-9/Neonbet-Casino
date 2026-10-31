import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import SessionOverview from "./SessionOverview";

function metric(label) {
  return screen.getByText(label, { selector: "dt" }).nextElementSibling.textContent;
}

it("shows an honest empty session with a path back to games", () => {
  render(<SessionOverview wallet={{ history: [], busy: false }} />);
  expect(metric("Rounds shown")).toBe("0");
  expect(metric("Net credits")).toBe("$0.00");
  expect(screen.getByText("No completed rounds yet")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Explore games" }).getAttribute("href")).toBe("#featured-games");
  expect(screen.getByText(/This history resets when you reload/)).toBeTruthy();
});

it("summarizes settled rounds without including a pending stake or reward credits", () => {
  const view = render(
    <SessionOverview
      wallet={{
        history: [
          { id: "one", gameTitle: "Neon Fruits", stakeCents: 50, winCents: 0 },
          { id: "two", gameTitle: "Dice Duel", stakeCents: 100, winCents: 200 },
        ],
        busy: true,
        wageredCents: 650,
        referralCents: 1000,
        balance: 150,
      }}
    />,
  );
  expect(metric("Rounds shown")).toBe("2");
  expect(metric("Staked credits")).toBe("$1.50");
  expect(metric("Returned credits")).toBe("$2.00");
  expect(metric("Net credits")).toBe("+$0.50");
  expect(screen.getByRole("status").textContent).toContain("A round is settling");
  expect(
    within(screen.getByRole("list", { name: "Completed session rounds" })).getAllByRole("listitem"),
  ).toHaveLength(2);
  view.rerender(
    <SessionOverview
      wallet={{
        history: [{ id: "one", gameTitle: "Neon Fruits", stakeCents: 50, winCents: 0 }],
        busy: false,
      }}
    />,
  );
  expect(metric("Net credits")).toBe("−$0.50");
  expect(screen.queryByRole("status")).toBeNull();
});

it("keeps every retained round accessible while stating the ten-round summary window", () => {
  const history = Array.from({ length: 10 }, (_, i) => ({
    id: `round-${i}`,
    gameTitle: `Game ${10 - i}`,
    stakeCents: 25,
    winCents: i === 0 ? 500 : 0,
  }));
  render(<SessionOverview wallet={{ history }} />);
  expect(metric("Rounds shown")).toBe("10");
  expect(metric("Staked credits")).toBe("$2.50");
  expect(metric("Returned credits")).toBe("$5.00");
  expect(metric("Net credits")).toBe("+$2.50");
  expect(screen.getByText(/latest 10 completed rounds/)).toBeTruthy();
  fireEvent.click(screen.getByText("Show 5 earlier rounds"));
  expect(screen.getByText("Game 1").closest("details").open).toBe(true);
  expect(
    within(screen.getByRole("list", { name: "Earlier session rounds" })).getAllByRole("listitem"),
  ).toHaveLength(5);
});
