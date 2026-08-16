// Deep slot-provider library preview with search + filters + recently played.
import React, { useMemo, useState } from "react";
import { Play, Star } from "lucide-react";
import type { SlotGame } from "../../types";
import { buildProviderGame, getGameId, gameFilters } from "../../lib/gameEngine";
import { slotProviders } from "../../data/slotProviders";
import GameSearch from "./GameSearch";
import EmptyState from "../../components/ui/EmptyState";

interface SlotProviderLibraryProps {
  onPlay: (game: SlotGame) => void;
  favorites: any[];
  isFavorite?: (game: SlotGame) => boolean;
  _onToggleFavorite?: (game: SlotGame) => void;
  recentGames: any[];
}

export default function SlotProviderLibrary({
  onPlay,
  favorites,
  isFavorite,
  _onToggleFavorite,
  recentGames,
}: SlotProviderLibraryProps) {
  const totalGames = slotProviders.reduce((sum, provider) => sum + provider.games.length, 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const providerSections = useMemo(() => {
    return slotProviders
      .map((provider) => {
        const playableGames = provider.games
          .map((game, index) => buildProviderGame(provider, game, index))
          .filter((game) => {
            const query = searchTerm.trim().toLowerCase();
            const matchesSearch =
              !query || `${game.title} ${game.provider}`.toLowerCase().includes(query);
            const matchesFilter =
              activeFilter === "All" ||
              (activeFilter === "Favorites" && favorites.includes(getGameId(game))) ||
              Boolean(game.tags?.includes(activeFilter));
            return matchesSearch && matchesFilter;
          });
        return { ...provider, playableGames };
      })
      .filter((provider) => provider.playableGames.length > 0);
  }, [searchTerm, activeFilter, favorites]);

  const visibleGameCount = providerSections.reduce(
    (sum, provider) => sum + provider.playableGames.length,
    0,
  );

  return (
    <section id="providers" className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-black md:text-3xl">Slot Providers & Games</h2>
          <p className="text-slate-400">
            {slotProviders.length} providers and {totalGames}+ slot titles listed for a deep lobby
            preview.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200">
          Provider availability depends on region, licensing and account status.
        </div>
      </div>

      <div className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.06] p-4">
        <GameSearch onResult={setSearchTerm} />
        <div className="mt-4 flex flex-wrap gap-2">
          {gameFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                activeFilter === filter
                  ? "border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-neon"
                  : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-400">{visibleGameCount} games showing</p>
      </div>

      {recentGames.length > 0 && (
        <div className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
            Recently played
          </div>
          <div className="flex flex-wrap gap-2">
            {recentGames.map((game) => (
              <button
                key={getGameId(game)}
                type="button"
                onClick={() => onPlay(game)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-cyan-400 hover:text-slate-950"
              >
                <Play size={12} /> {game.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {providerSections.map((provider) => (
          <article
            key={provider.name}
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">{provider.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{provider.highlight}</p>
              </div>
              <div className="rounded-2xl bg-black/25 px-3 py-2 text-sm font-black text-cyan-300">
                {provider.games.length}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {provider.playableGames.map((game) => (
                <button
                  key={game.title}
                  type="button"
                  onClick={() => onPlay(game)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-left text-xs font-bold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-400 hover:text-slate-950"
                >
                  <Play size={12} />
                  {isFavorite?.(game) && (
                    <Star size={12} className="fill-amber-300 text-amber-300" />
                  )}
                  {game.title}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      {providerSections.length === 0 && (
        <EmptyState
          title="No games match that search and filter."
          description="Try a different keyword or filter."
        />
      )}
    </section>
  );
}
