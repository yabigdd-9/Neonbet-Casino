import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import FeaturedGames from "./FeaturedGames";

afterEach(cleanup);

it("loads twenty-four more cards and starts each discovery view with a complete first page", () => {
  const onPlay = vi.fn();
  render(<FeaturedGames onPlay={onPlay} />);
  const cards = () => screen.getAllByRole("button", { name: /^Play game:/ });
  expect(cards()).toHaveLength(24);
  fireEvent.click(screen.getByRole("button", { name: /Load more games/ }));
  expect(cards()).toHaveLength(48);
  fireEvent.click(screen.getByRole("button", { name: "New worlds", exact: true }));
  expect(cards()).toHaveLength(24);
  expect(screen.getByRole("button", { name: "New worlds", exact: true }).getAttribute("aria-pressed")).toBe(
    "true",
  );
  expect(screen.queryByRole("button", { name: "Play game: Neon Fruits", exact: true })).toBeNull();
  expect(screen.getByRole("status").textContent).toContain("264 themes across 24 original worlds");
  fireEvent.click(cards()[0]);
  expect(onPlay).toHaveBeenCalledWith(expect.objectContaining({ title: "Astral Harbor: First Light" }));
  fireEvent.click(screen.getByRole("button", { name: /Load more games/ }));
  expect(cards()).toHaveLength(48);
  fireEvent.click(screen.getByRole("button", { name: "Featured picks", exact: true }));
  expect(cards()).toHaveLength(24);
  expect(screen.getByRole("button", { name: "Play game: Neon Fruits", exact: true })).toBeTruthy();
});
