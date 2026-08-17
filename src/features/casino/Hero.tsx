// Premium hero for the casino lobby.
import React from "react";
import { Play, Sparkles, Gift, Trophy, ShieldCheck, Gamepad2 } from "lucide-react";
import { arcadeGames } from "../../data/arcadeGames";
import { games } from "../../data/games";
import { promotionConfig } from "../../config/promotion";
import GameArt from "../../components/GameArt";
import type { ArcadeGameDef } from "../../types";

interface HeroProps {
  onClaim: () => void;
  onOpenGame: (game: ArcadeGameDef) => void;
}

const featured = games[0];

export default function Hero({ onClaim, onOpenGame }: HeroProps) {
  const stats = [
    { value: promotionConfig.signupBonus, label: "Sign-up bonus", Icon: Gift },
    { value: promotionConfig.rollover, label: "Bonus rollover", Icon: Trophy },
    { value: "24+", label: "Slot providers", Icon: Gamepad2 },
    { value: promotionConfig.verificationFee, label: "Verification", Icon: ShieldCheck },
  ];

  return (
    <section
      id="lobby"
      className="relative scroll-mt-24 overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 shadow-neon md:p-10"
    >
      <div className="mesh pointer-events-none absolute inset-0 opacity-90" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <Sparkles size={16} /> Premium crypto casino style
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Play the <span className="text-cyan-300">neon lobby</span>.
          </h1>
          <p className="mt-5 max-w-xl text-slate-300">
            Claim a free {promotionConfig.signupBonus} sign-up bonus, unlock a{" "}
            {promotionConfig.matchPercent} welcome match and clear a {promotionConfig.rollover}{" "}
            rollover requirement.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClaim}
              className="shimmer inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 shadow-neon"
            >
              <Play size={18} /> Claim {promotionConfig.signupBonus}
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("promotions")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="rounded-2xl bg-white/10 px-6 py-4 font-bold transition hover:bg-white/15"
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
              className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-400/15 px-6 py-4 font-bold text-fuchsia-100 transition hover:scale-[1.02]"
            >
              New Arcade Games
            </button>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ value, label, Icon }) => (
              <div key={label} className="glass rounded-2xl px-4 py-3">
                <Icon size={16} className="mb-1 text-cyan-300" />
                <div className="text-xl font-black text-white">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <GameArt
                title={featured.title}
                symbols={featured.symbols}
                gradient={featured.gradient}
                className="h-44 w-full"
              />
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
