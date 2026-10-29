// @vitest-environment node
import { expect, it } from "vitest";
import { games } from "../../data/games";
import { getGameId } from "../../lib/gameEngine";
import { buildFeaturedCollections } from "./featuredCollections";

it("brings twelve distinct new worlds into the first page without losing familiar games", () => {
  const original = games.map(getGameId);
  const { featuredPicks } = buildFeaturedCollections(games);
  expect(featuredPicks.slice(0, 12)).toEqual(games.slice(0, 12));
  const discovery = featuredPicks.slice(12, 24);
  expect(new Set(discovery.map((game) => game.collection)).size).toBe(12);
  expect(new Set(discovery.map((game) => game.artwork)).size).toBe(12);
  expect(new Set(featuredPicks.map(getGameId))).toEqual(new Set(original));
  expect(featuredPicks).toHaveLength(games.length);
  expect(games.map(getGameId)).toEqual(original);
});

it("opens every new world before repeating one, while keeping every chapter reachable", () => {
  const { newWorlds, worldCount } = buildFeaturedCollections(games);
  expect(worldCount).toBe(24);
  expect(newWorlds).toHaveLength(264);
  expect(new Set(newWorlds.slice(0, 24).map((game) => game.collection)).size).toBe(24);
  expect(new Set(newWorlds.map(getGameId)).size).toBe(newWorlds.length);
  for (const collection of new Set(newWorlds.map((game) => game.collection))) {
    expect(newWorlds.filter((game) => game.collection === collection)).toEqual(
      games.filter((game) => game.collection === collection),
    );
  }
});

it("handles collections with different chapter counts without dropping the longer worlds", () => {
  const fixture = [
    { title: "Known", type: "Slots" },
    { title: "A1", type: "Slots", collection: "A", artwork: "space" },
    { title: "A2", type: "Slots", collection: "A", artwork: "space" },
    { title: "B1", type: "Slots", collection: "B", artwork: "ocean" },
  ];
  const result = buildFeaturedCollections(fixture);
  expect(result.newWorlds.map((game) => game.title)).toEqual(["A1", "B1", "A2"]);
  expect(result.featuredPicks.map((game) => game.title)).toEqual(["Known", "A1", "B1", "A2"]);
});
