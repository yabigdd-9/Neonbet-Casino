// Arcade tables section.
import React from "react";
import { arcadeGames } from "../../data/arcadeGames";
import GameCard from "./GameCard";

export default function ArcadeGamesSection({ onPlay }) {
  return (
    <section
      id="arcade-games"
      className="scroll-mt-24 rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/60 p-5 md:p-7"
    >
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">New arcade tables</div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">More Ways to Play</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            {arcadeGames.length} browser games sit beside the slot lobby, all sharing the same simulated
            balance and bet controls.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-slate-300">
          All arcade games are simulated and played locally.
        </div>
      </div>
      <div className="lobby-game-grid">
        {arcadeGames.map((game) => (
          <GameCard key={game.id} game={game} onPlay={onPlay} arcade />
        ))}
      </div>
    </section>
  );
}
