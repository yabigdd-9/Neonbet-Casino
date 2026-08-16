// Casino provider abstraction.
// Current local simulation is the LocalDemoProvider. A buyer can add real
// provider integrations later by implementing the same interface.

export class CasinoProvider {
  getGames() {
    throw new Error("getGames() not implemented");
  }
  getGame(_id) {
    throw new Error("getGame() not implemented");
  }
  getCategories() {
    throw new Error("getCategories() not implemented");
  }
  launchDemo(_game) {
    throw new Error("launchDemo() not implemented");
  }
  launchReal(_game) {
    throw new Error("launchReal() not implemented");
  }
}

// Local browser-simulation provider. Reads from the static data catalogue.
export class LocalDemoProvider extends CasinoProvider {
  constructor({ games = [], arcadeGames = [], slotProviders = [] } = {}) {
    super();
    this.games = games;
    this.arcadeGames = arcadeGames;
    this.slotProviders = slotProviders;
  }

  getGames() {
    return [...this.games, ...this.arcadeGames];
  }

  getGame(id) {
    return this.getGames().find((game) => game.id === id || game.title === id) || null;
  }

  getCategories() {
    const set = new Set(this.getGames().map((game) => game.type));
    return [...set];
  }

  launchDemo(game) {
    // Demo launch is handled by the UI; provider only declares capability.
    return { mode: "demo", game };
  }

  launchReal() {
    // Not implemented: this product does not connect to real-money providers.
    throw new Error("Real provider gameplay is not available in this build.");
  }
}

export default LocalDemoProvider;
