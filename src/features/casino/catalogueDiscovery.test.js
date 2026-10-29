// @vitest-environment node
import { expect, it } from "vitest";
import { getGameId } from "../../lib/gameEngine";
import {
  catalogueEmptyState,
  discoverGames,
  indexCatalogue,
  normalizeGameSearch,
} from "./catalogueDiscovery";

const games = [
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
];
const index = indexCatalogue(games);

it("searches words across titles, collections, tags and real style names regardless of accent or word order", () => {
  expect(normalizeGameSearch("  ÉTOILE d’Or  ")).toBe("etoile dor");
  expect(discoverGames(index, { searchTerm: "quest PRAGMATIC" })).toEqual([games[1]]);
  expect(discoverGames(index, { searchTerm: "ETOILE DOR" })).toEqual([games[2]]);
  expect(discoverGames(index, { searchTerm: "moonlight left-to-right" })).toEqual([games[2]]);
  expect(discoverGames(index, { searchTerm: "astral scatter new" })).toEqual([games[0]]);
  expect(discoverGames(index, { searchTerm: "astral classic" })).toEqual([]);
});

it("intersects saved/recent membership with collection, style and search filters", () => {
  const favorites = [getGameId(games[1]), getGameId(games[2])];
  expect(
    discoverGames(index, {
      activeFilter: "Favorites",
      favorites,
      provider: "NetEnt",
      category: "line",
      searchTerm: "dor",
    }),
  ).toEqual([games[2]]);
  expect(discoverGames(index, { activeFilter: "Favorites", favorites, category: "scatter" })).toEqual([]);
  const recentGames = [games[3], games[0]];
  expect(discoverGames(index, { activeFilter: "Recent", recentGames })).toEqual(recentGames);
  expect(discoverGames(index, { activeFilter: "Recent", recentGames, sort: "az" })).toEqual([
    games[0],
    games[3],
  ]);
  expect(discoverGames(index, { activeFilter: "Recent", recentGames, searchTerm: "astral" })).toEqual([
    games[0],
  ]);
  expect(discoverGames(index, { category: "originals" })).toEqual([games[0], games[3]]);
  expect(index.map(({ game }) => game)).toEqual(games);
});

it("explains an empty saved or recent list separately from conflicting filters", () => {
  expect(catalogueEmptyState("Favorites", [], []).title).toBe("No favorites yet");
  expect(catalogueEmptyState("Recent", [], []).title).toBe("Your next game starts here");
  expect(catalogueEmptyState("Favorites", ["saved-id"], []).title).toBe("No matching favorites");
  expect(catalogueEmptyState("All", [], []).title).toBe("No matching games");
});
