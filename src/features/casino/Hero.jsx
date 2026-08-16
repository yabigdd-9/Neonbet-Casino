// Premium hero for the casino lobby.
import React from "react";
import { Play, Sparkles } from "lucide-react";
import { arcadeGames } from "../../data/arcadeGames";

export default function Hero({ onClaim, onOpenGame }) {
  return (
    <section
      id="lobby"
      className="relative scroll-mt-24 overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 shadow-neon md:p-10"
    >
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-24 bottom-0 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 border border-cyan-300/30 px-4 py-2 text-sm text-cyan-200">
            <Sparkles size={16} /> Premium crypto casino style
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Play the <span className="text-cyan-300">neon lobby</span>.
          </h1>
          <p className="mt-5 max-w-xl text-slate-300">
            Claim a free $100 sign-up bonus, unlock a 300% welcome match and clear a 10x rollover
            requirement.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClaim}
              className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 shadow-neon"
            >
              <Play size={18} /> Claim $100
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("promotions")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="rounded-2xl bg-white/10 px-6 py-4 font-bold hover:bg-white/15"
            >
              View Promotions
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("arcade-games")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-400/15 px-6 py-4 font-bold text-fuchsia-100 hover:scale-[1.02]"
            >
              New Arcade Games
            </button>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["$100", "Sign-up bonus"],
              ["10x", "Bonus rollover"],
              ["24+", "Slot providers"],
              ["$75", "Verification"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-xl font-black text-white">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              {["7", "🍒", "💎", "BAR", "⭐", "777", "🍋", "🔥", "X"].map((item) => (
                <div
                  key={item}
                  className="grid aspect-square place-items-center rounded-3xl border border-white/10 bg-white/10 text-3xl font-black"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-3/4 bg-cyan-400" />
            </div>
            <div className="mt-4 grid gap-3 text-sm font-black sm:grid-cols-3">
              {arcadeGames.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => onOpenGame(game)}
                  className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-left transition hover:bg-cyan-400 hover:text-slate-950"
                >
                  <span className="mr-2">{game.emoji}</span>
                  {game.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
