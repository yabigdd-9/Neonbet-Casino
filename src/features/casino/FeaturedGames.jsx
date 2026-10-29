// Featured lobby game grid.
import React, { useState } from "react";
import GameCard from "./GameCard";
import { scrollToSection } from "../../lib/navigation";
import { games } from "../../data/games";
import { buildFeaturedCollections } from "./featuredCollections";

const { featuredPicks, newWorlds, worldCount } = buildFeaturedCollections(games);

export default function FeaturedGames({ onPlay, isFavorite, onToggleFavorite }) {
  const [visible, setVisible] = useState(24);
  const [view, setView] = useState("picks");
  const selection = view === "worlds" ? newWorlds : featuredPicks;
  function selectView(nextView) {
    if (view === nextView) return;
    setView(nextView);
    setVisible(24);
  }
  return (
    <section id="featured-games" className="scroll-mt-24">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Made for your next orbit</p>
          <h2 className="text-2xl font-semibold md:text-3xl">Featured Games</h2>
          <p className="mt-2 text-sm text-slate-400">{games.length} original themes · Three slot styles</p>
        </div>
        <button type="button" onClick={() => scrollToSection("providers")} className="secondary-button">
          Browse catalogue
        </button>
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Featured views">
        <button
          type="button"
          className={`filter-chip ${view === "picks" ? "filter-active" : ""}`}
          aria-pressed={view === "picks"}
          onClick={() => selectView("picks")}
        >
          Featured picks
        </button>
        <button
          type="button"
          className={`filter-chip ${view === "worlds" ? "filter-active" : ""}`}
          aria-pressed={view === "worlds"}
          onClick={() => selectView("worlds")}
        >
          New worlds
        </button>
        <p className="basis-full pt-1 text-xs leading-5 text-slate-400" role="status">
          {view === "worlds"
            ? `${newWorlds.length} themes across ${worldCount} original worlds. One first look at every world.`
            : "Familiar favorites and a fresh mix of original worlds."}
        </p>
      </div>
      <div className="lobby-game-grid">
        {selection.slice(0, visible).map((game) => (
          <GameCard
            key={game.title}
            game={game}
            onPlay={onPlay}
            isFavorite={isFavorite?.(game)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {visible < selection.length && (
        <button
          type="button"
          className="mt-5 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
          onClick={() => setVisible((count) => count + 24)}
        >
          Load more games ({selection.length - visible} remaining)
        </button>
      )}
    </section>
  );
}
