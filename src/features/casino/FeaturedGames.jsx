// Featured lobby game grid.
import React, { useState } from "react";
import GameCard from "./GameCard";
import { scrollToSection } from "../../lib/navigation";
import { games } from "../../data/games";

export default function FeaturedGames({ onPlay, isFavorite, onToggleFavorite }) {
  const [visible, setVisible] = useState(24);
  return (
    <section id="featured-games" className="scroll-mt-24">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Made for your next orbit</p>
          <h2 className="text-2xl font-semibold md:text-3xl">Featured Games</h2>
          <p className="mt-2 text-sm text-slate-400">
            {games.length} original practice themes · Three slot styles
          </p>
        </div>
        <button type="button" onClick={() => scrollToSection("providers")} className="secondary-button">
          Browse catalogue
        </button>
      </div>
      <div className="lobby-game-grid">
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
          onClick={() => setVisible((count) => count + 24)}
        >
          Load more games ({games.length - visible} remaining)
        </button>
      )}
    </section>
  );
}
