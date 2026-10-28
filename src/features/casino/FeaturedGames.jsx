// Featured lobby game grid.
import React, { useState } from "react";
import GameCard from "./GameCard";
import { scrollToSection } from "../../lib/navigation";
import { games } from "../../data/games";

export default function FeaturedGames({ onPlay, isFavorite, onToggleFavorite }) {
  const [visible, setVisible] = useState(12);
  return (
    <section id="featured-games" className="scroll-mt-24">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">Featured Games</h2>
          <p className="text-slate-400">{games.length} local slot themes to explore.</p>
        </div>
        <button
          type="button"
          onClick={() => scrollToSection("providers")}
          className="hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-bold sm:block"
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 md:gap-5">
        {games.slice(0, visible).map((game) => (
          <GameCard
            key={game.title}
            game={game}
            onPlay={onPlay}
            isFavorite={isFavorite?.(game)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {visible < games.length && (
        <button
          type="button"
          className="mt-5 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
          onClick={() => setVisible((count) => count + 12)}
        >
          Load more games ({games.length - visible} remaining)
        </button>
      )}
    </section>
  );
}
