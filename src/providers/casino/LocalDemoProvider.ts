import { ProviderError } from "../contracts";
import type { CasinoAdapter, ProviderGame, LaunchSession } from "../contracts";
import { getGameId } from "../../lib/gameEngine";
export abstract class CasinoProvider implements CasinoAdapter {
  readonly capabilities = { demo: true, real: false };
  abstract getGames(): Promise<ProviderGame[]>;
  abstract getGame(id: string): Promise<ProviderGame | null>;
  abstract getCategories(): Promise<string[]>;
  abstract launchDemo(game: ProviderGame): Promise<LaunchSession>;
  async launchReal(): Promise<never> {
    throw new ProviderError("UNAVAILABLE", "Real provider gameplay is not configured.");
  }
}
export class LocalDemoProvider extends CasinoProvider {
  private games: ProviderGame[];
  constructor({
    games = [],
    arcadeGames = [],
  }: { games?: ProviderGame[]; arcadeGames?: ProviderGame[]; slotProviders?: unknown[] } = {}) {
    super();
    this.games = [...games, ...arcadeGames];
  }
  async getGames() {
    return [...this.games];
  }
  async getGame(id: string) {
    return this.games.find((game) => game.id === id || getGameId(game) === id || game.title === id) || null;
  }
  async getCategories() {
    return [...new Set(this.games.map((game) => game.type))];
  }
  async launchDemo(game: ProviderGame): Promise<LaunchSession> {
    if (!(await this.getGame(game.id || game.title)))
      throw new ProviderError("INVALID_REQUEST", "Unknown game");
    return {
      id: crypto.randomUUID(),
      gameId: game.id || getGameId(game),
      mode: "demo",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }
}
export default LocalDemoProvider;
