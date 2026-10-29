import { getGameId } from "../../lib/gameEngine";

const styleNames = {
  classic: "classic matches",
  line: "left to right",
  scatter: "star scatter",
};

export function normalizeGameSearch(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function indexCatalogue(games) {
  return games.map((game) => ({
    game,
    text: normalizeGameSearch(
      [
        game.title,
        game.provider,
        game.collection,
        game.type,
        ...(game.tags || []),
        styleNames[game.mechanic || "classic"],
      ].join(" "),
    ),
  }));
}

export function discoverGames(
  index,
  {
    searchTerm = "",
    provider = "all",
    category = "all",
    activeFilter = "All",
    favorites = [],
    recentGames = [],
    sort = "default",
  } = {},
) {
  const words = normalizeGameSearch(searchTerm).split(" ").filter(Boolean);
  const saved = new Set(favorites);
  const recentOrder = new Map(recentGames.map((game, rank) => [getGameId(game), rank]));
  return index
    .filter(
      ({ game, text }) =>
        words.every((word) => text.includes(word)) &&
        (provider === "all" || game.provider === provider) &&
        (category === "all" ||
          (category === "originals"
            ? game.provider === "Lucky Orbit Originals"
            : (game.mechanic || "classic") === category)) &&
        (activeFilter === "All" ||
          (activeFilter === "Favorites"
            ? saved.has(getGameId(game))
            : activeFilter === "Recent"
              ? recentOrder.has(getGameId(game))
              : game.tags?.includes(activeFilter))),
    )
    .map(({ game }) => game)
    .sort((a, b) =>
      sort === "az"
        ? a.title.localeCompare(b.title)
        : sort === "za"
          ? b.title.localeCompare(a.title)
          : activeFilter === "Recent"
            ? recentOrder.get(getGameId(a)) - recentOrder.get(getGameId(b))
            : 0,
    );
}

export function catalogueEmptyState(activeFilter, favorites, recentGames) {
  if (activeFilter === "Favorites" && !favorites.length)
    return {
      title: "No favorites yet",
      description: "Tap the star on a game to save it here. Your favorites stay on this device.",
    };
  if (activeFilter === "Recent" && !recentGames.length)
    return {
      title: "Your next game starts here",
      description: "Launch a slot to add it to your recently played games on this device.",
    };
  return {
    title:
      activeFilter === "Favorites"
        ? "No matching favorites"
        : activeFilter === "Recent"
          ? "No matching recent games"
          : "No matching games",
    description: "Try fewer search words or reset your filters to explore the full catalogue.",
  };
}
