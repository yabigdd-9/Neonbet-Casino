import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SlotProviderLibrary from "./SlotProviderLibrary";

const { games } = vi.hoisted(() => ({
  games: [
    {
      title: "Golden Star",
      provider: "Lucky Orbit Originals",
      collection: "Astral Harbor",
      mechanic: "scatter",
      tags: ["New"],
    },
    { title: "Gonzo’s Quest", provider: "Pragmatic Play", tags: ["Hot"] },
    { title: "Étoile d’Or", provider: "NetEnt", collection: "Moonlight", mechanic: "line", tags: ["New"] },
    { title: "Zulu Clover", provider: "Lucky Orbit Originals", tags: ["Hot"] },
  ],
}));
vi.mock("../../data/catalogue", () => ({ searchIndex: games.map((game) => ({ game, text: game.title })) }));
vi.mock("./GameCard", () => ({
  default: ({ game }) => <article data-testid="game-card">{game.title}</article>,
}));
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const advance = () => act(() => vi.advanceTimersByTime(250));
const renderLibrary = (props = {}) =>
  render(<SlotProviderLibrary onPlay={vi.fn()} favorites={[]} recentGames={[]} {...props} />);

it("reset clears the actual search field and every filter without discarding page-size preference", () => {
  renderLibrary();
  fireEvent.change(screen.getByLabelText("Theme collection"), { target: { value: "Pragmatic Play" } });
  fireEvent.change(screen.getByLabelText("Game style"), { target: { value: "classic" } });
  fireEvent.change(screen.getByLabelText("Sort games"), { target: { value: "za" } });
  fireEvent.change(screen.getByLabelText("Games per page"), { target: { value: "24" } });
  const input = screen.getByRole("textbox", { name: "Search games" });
  fireEvent.change(input, { target: { value: "not-a-title" } });
  advance();
  expect(screen.getByText("No matching games")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show all games" }));
  expect(input.value).toBe("");
  expect(screen.getByLabelText("Theme collection").value).toBe("all");
  expect(screen.getByLabelText("Game style").value).toBe("all");
  expect(screen.getByLabelText("Sort games").value).toBe("default");
  expect(screen.getByLabelText("Games per page").value).toBe("24");
  advance();
  expect(screen.getAllByTestId("game-card")).toHaveLength(4);
  expect(screen.getByRole("status").textContent).toBe("Showing 1–4 of 4 games");
  expect(screen.queryByRole("button", { name: "Reset filters" })).toBeNull();
});

it("offers a clear return from empty favorites and preserves recent-play order", () => {
  renderLibrary({ recentGames: [games[3], games[0]] });
  fireEvent.click(screen.getByRole("button", { name: "Favorites", exact: true }));
  expect(screen.getByText("No favorites yet")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show all games" }));
  fireEvent.click(screen.getByRole("button", { name: "Recent", exact: true }));
  expect(screen.getAllByTestId("game-card").map((el) => el.textContent)).toEqual([
    "Zulu Clover",
    "Golden Star",
  ]);
  fireEvent.change(screen.getByRole("textbox", { name: "Search games" }), {
    target: { value: "scatter astral" },
  });
  advance();
  expect(screen.getAllByTestId("game-card").map((el) => el.textContent)).toEqual(["Golden Star"]);
  fireEvent.click(screen.getByRole("button", { name: "Clear search", exact: true }));
  advance();
  expect(screen.getAllByTestId("game-card").map((el) => el.textContent)).toEqual([
    "Zulu Clover",
    "Golden Star",
  ]);
});

it("reset cancels a search that has not finished debouncing", () => {
  renderLibrary();
  const input = screen.getByRole("textbox", { name: "Search games" });
  fireEvent.change(input, { target: { value: "pending unmatched query" } });
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
  advance();
  expect(input.value).toBe("");
  expect(screen.getAllByTestId("game-card")).toHaveLength(4);
  expect(screen.queryByText("No matching games")).toBeNull();
});
