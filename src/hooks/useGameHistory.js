// Favourites + recently played persistence hook (localStorage; Supabase-ready).
import { useCallback, useState } from "react";
import { getGameId } from "../lib/gameEngine";
import { readStoredArray, writeStoredArray } from "../lib/storage";

import { gamesById } from "../data/catalogue";

const FAV_KEY = "neonbetFavorites";
const RECENT_KEY = "neonbetRecentGames";
const RECENT_LIMIT = 8;

export function useFavorites() {
  const [favorites, setFavorites] = useState(() =>
    readStoredArray(FAV_KEY).filter((id) => typeof id === "string" && gamesById.has(id)),
  );

  const toggleFavorite = useCallback((game) => {
    const gameId = getGameId(game);
    setFavorites((current) => {
      const next = current.includes(gameId) ? current.filter((id) => id !== gameId) : [...current, gameId];
      writeStoredArray(FAV_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((game) => favorites.includes(getGameId(game)), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}

export function useRecentGames() {
  const [recentIds, setRecentIds] = useState(() =>
    readStoredArray(RECENT_KEY)
      .map((value) =>
        typeof value === "string" ? value : value && typeof value.title === "string" ? getGameId(value) : "",
      )
      .filter((id) => gamesById.has(id))
      .slice(0, RECENT_LIMIT),
  );
  const recentGames = recentIds.map((id) => gamesById.get(id));

  const recordGame = useCallback((game) => {
    setRecentIds((current) => {
      const id = getGameId(game);
      if (!gamesById.has(id)) return current;
      const next = [id, ...current.filter((value) => value !== id)].slice(0, RECENT_LIMIT);
      writeStoredArray(RECENT_KEY, next);
      return next;
    });
  }, []);

  return { recentGames, recordGame };
}

export default { useFavorites, useRecentGames };
