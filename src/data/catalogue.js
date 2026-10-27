import { games } from "./games";
import { slotProviders } from "./slotProviders";
import { buildProviderGame, getGameId } from "../lib/gameEngine";
export const providerGames = slotProviders.flatMap((provider) =>
  provider.games.map((title, index) => buildProviderGame(provider, title, index)),
);
export const catalogue = [...games, ...providerGames];
export const gamesById = new Map(catalogue.map((game) => [getGameId(game), game]));
export const searchIndex = providerGames.map((game) => ({
  game,
  text: `${game.title} ${game.provider}`.toLowerCase(),
}));
