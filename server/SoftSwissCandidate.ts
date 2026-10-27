// Server-side placeholder, not a SOFTSWISS integration. No credentials or network calls.
import { ProviderError, type CasinoAdapter, type ProviderGame } from "../src/providers/contracts";

export class SoftSwissCandidate implements CasinoAdapter {
  readonly capabilities = { demo: false, real: false } as const;

  async getGames(): Promise<ProviderGame[]> {
    throw new ProviderError("UNAVAILABLE", "SOFTSWISS is not configured or activated.");
  }

  async getGame(_id: string): Promise<ProviderGame | null> {
    throw new ProviderError("UNAVAILABLE", "SOFTSWISS is not configured or activated.");
  }

  async launchDemo(_game: ProviderGame): Promise<never> {
    throw new ProviderError("UNAVAILABLE", "SOFTSWISS is not configured or activated.");
  }
}
