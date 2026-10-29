// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { catalogue, gamesById } from "./catalogue";
import { arcadeGames } from "./arcadeGames";
import { gameArtwork } from "../lib/gameArtwork";
import { buildSpin, playArcade } from "../lib/gameEngine";

it("doubles the playable catalogue without duplicate identities or missing covers", () => {
  expect(catalogue).toHaveLength(528);
  expect(gamesById.size).toBe(528);
  expect(arcadeGames).toHaveLength(14);
  expect(new Set(arcadeGames.map((game) => game.id)).size).toBe(14);
  const checkedAssets = new Set();
  for (const game of [...catalogue, ...arcadeGames]) {
    const art = gameArtwork(game);
    const path = `public/${art.src.replace(/^\//, "")}`;
    expect(existsSync(path), game.title).toBe(true);
    if (!checkedAssets.has(path)) {
      expect(readFileSync(path).subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      checkedAssets.add(path);
    }
    expect(art.column).toBeGreaterThanOrEqual(0);
    expect(art.column).toBeLessThan(6);
    expect(art.row).toBeGreaterThanOrEqual(0);
    expect(art.row).toBeLessThan(4);
    const result = game.id ? playArcade(game.id, 2, () => 0.3) : buildSpin(game, () => 0.3);
    expect(Number.isFinite(result.multiplier), game.title).toBe(true);
    expect(result.multiplier).toBeGreaterThanOrEqual(0);
  }
});
