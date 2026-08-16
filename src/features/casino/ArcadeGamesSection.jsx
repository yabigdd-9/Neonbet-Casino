// Arcade tables section.
import React from "react";
import { Play } from "lucide-react";
import { arcadeGames } from "../../data/arcadeGames";

export default function ArcadeGamesSection({ onPlay }) {
  return (
    <section id="arcade-games" className="scroll-mt-24 rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/60 p-5 md:p-7">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">New arcade tables</div>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">More Ways to Play</h2>
          <p className="mt-2 max-w-3xl text-slate-400">Three fast browser games now sit beside the slot lobby, all sharing the same simulated balance and bet controls.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-slate-300">Dice, Plinko and Crash are local demo games only.</div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {arcadeGames.map((game) => (
          <article key={game.id} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-neon">
            <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${game.gradient} opacity-90`} />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-3xl border border-white/20 bg-black/30 text-4xl shadow-neon transition group-hover:scale-105">{game.emoji}</div>
                <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black text-white">{game.tag}</span>
              </div>
              <div className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{game.type}</div>
              <h3 className="mt-2 text-2xl font-black">{game.title}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{game.rule}</p>
              <button
                type="button"
                onClick={() => onPlay(game)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-neon transition hover:scale-[1.02]"
              >
                <Play size={18} /> Play {game.title}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
