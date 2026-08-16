// Favourites + recently played persistence hook (localStorage; Supabase-ready).
import { useCallback, useEffect, useState } from "react";
import { getGameId } from "../lib/gameEngine";
import { readStoredArray, writeStoredArray } from "../lib/storage";

const FAV_KEY = "neonbetFavorites";
const RECENT_KEY = "neonbetRecentGames";
const RECENT_LIMIT = 8;

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => readStoredArray(FAV_KEY));

  const toggleFavorite = useCallback((game) => {
    const gameId = getGameId(game);
    setFavorites((current) => {
      const next = current.includes(gameId)
        ? current.filter((id) => id !== gameId)
        : [...current, gameId];
      writeStoredArray(FAV_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((game) => favorites.includes(getGameId(game)), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}

export function useRecentGames() {
  const [recentGames, setRecentGames] = useState(() => readStoredArray(RECENT_KEY));

  const recordGame = useCallback((game) => {
    setRecentGames((current) => {
      const next = [game, ...current.filter((g) => getGameId(g) !== getGameId(game))].slice(0, RECENT_LIMIT);
      writeStoredArray(RECENT_KEY, next);
      return next;
    });
  }, []);

  return { recentGames, recordGame };
}

export default { useFavorites, useRecentGames };
