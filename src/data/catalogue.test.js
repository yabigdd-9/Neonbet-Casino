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
  for (const game of [...catalogue, ...arcadeGames]) {
    const art = gameArtwork(game);
    const path = `public/${art.src.replace(/^\//, "")}`;
    expect(existsSync(path), game.title).toBe(true);
    const svg = readFileSync(path, "utf8");
    expect(svg).toContain('viewBox="0 0 480 360"');
    expect(svg).not.toMatch(/<script|<image|https?:\/\/(?!www.w3.org)/);
    const result = game.id ? playArcade(game.id, 2, () => 0.3) : buildSpin(game, () => 0.3);
    expect(Number.isFinite(result.multiplier), game.title).toBe(true);
    expect(result.multiplier).toBeGreaterThanOrEqual(0);
  }
});
