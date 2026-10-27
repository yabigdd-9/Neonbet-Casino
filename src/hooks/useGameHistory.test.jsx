import { it, expect, beforeEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useFavorites, useRecentGames } from "./useGameHistory";
import { games } from "../data/games";
import { getGameId } from "../lib/gameEngine";
beforeEach(() => {
  cleanup();
  localStorage.clear();
});
it("resolves old recent objects through the catalogue and drops unknown values", () => {
  localStorage.setItem(
    "neonbetRecentGames",
    JSON.stringify([null, {}, { title: "Unknown", type: "Other" }, games[0]]),
  );
  const { result } = renderHook(() => useRecentGames());
  expect(result.current.recentGames).toEqual([games[0]]);
  act(() => result.current.recordGame(games[1]));
  expect(JSON.parse(localStorage.getItem("neonbetRecentGames"))).toEqual([
    getGameId(games[1]),
    getGameId(games[0]),
  ]);
});
it("deduplicates favorites and ignores invalid stored IDs", () => {
  localStorage.setItem("neonbetFavorites", JSON.stringify([{}, null, "unknown"]));
  const { result } = renderHook(() => useFavorites());
  expect(result.current.favorites).toEqual([]);
  act(() => result.current.toggleFavorite(games[0]));
  expect(result.current.isFavorite(games[0])).toBe(true);
  act(() => result.current.toggleFavorite(games[0]));
  expect(result.current.isFavorite(games[0])).toBe(false);
});
