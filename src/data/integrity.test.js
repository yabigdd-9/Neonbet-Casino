import { games } from "../data/games";
import { arcadeGames } from "../data/arcadeGames";
import { slotProviders } from "../data/slotProviders";
import { promos, terms, policyPages } from "../data/promotions";

describe("data integrity", () => {
  it("has 8 featured games", () => {
    expect(games.length).toBe(8);
  });

  it("has 3 arcade games with ids", () => {
    expect(arcadeGames.length).toBe(3);
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
