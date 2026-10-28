import { games } from "../data/games";
import { arcadeGames } from "../data/arcadeGames";
import { slotProviders } from "../data/slotProviders";
import { promos, terms, policyPages } from "../data/promotions";

describe("data integrity", () => {
  it("has at least 72 featured games", () => {
    expect(games.length).toBeGreaterThanOrEqual(72);
  });

  it("has searchable, uniquely identified and playable slot themes", () => {
    expect(new Set(games.map((game) => game.title)).size).toBe(games.length);
    games.forEach((game) => {
      expect(game.symbols.length).toBeGreaterThanOrEqual(5);
      expect(game.tags.length).toBeGreaterThan(0);
    });
  });

  it("has uniquely identified arcade games", () => {
    expect(new Set(arcadeGames.map((game) => game.id)).size).toBe(arcadeGames.length);
    arcadeGames.forEach((game) => {
      expect(game.id).toBeTruthy();
      expect(game.rule).toBeTruthy();
    });
  });

  it("has 24 slot providers each with at least one game", () => {
    expect(slotProviders.length).toBe(24);
    slotProviders.forEach((provider) => {
      expect(Array.isArray(provider.games)).toBe(true);
      expect(provider.games.length).toBeGreaterThan(0);
    });
  });

  it("has 3 promotions", () => {
    expect(promos.length).toBe(3);
  });

  it("exposes terms and policy pages", () => {
    expect(Array.isArray(terms)).toBe(true);
    expect(policyPages.terms).toBeTruthy();
    expect(policyPages.privacy).toBeTruthy();
    expect(policyPages.responsible).toBeTruthy();
  });
});
