import React from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { scrollToSection } from "../../lib/navigation";
import { arcadeGames } from "../../data/arcadeGames";
export default function Hero({ onClaim, onOpenGame }) {
  return (
    <section id="lobby" className="hero-panel scroll-mt-24">
      <div className="relative z-10 max-w-xl">
        <p className="eyebrow flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-300" /> LUCKY ORBIT
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          A little luck.
          <br />
          <span className="text-cyan-300">A new orbit.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-slate-300 md:text-base">
          Discover the arcade, explore new favorites, and enjoy a fresh spin. Every game here runs on
          simulated credits.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={onClaim} className="primary-button">
            <Play size={17} /> Explore games
          </button>
          <button type="button" className="secondary-button" onClick={() => scrollToSection("arcade-games")}>
            Visit the arcade <ArrowUpRight size={17} />
          </button>
        </div>
        <p className="mt-5 text-xs text-slate-400">
          $50 simulated to start · No cash value or real-money wagering
        </p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-orbit" />
        <div className="hero-seven">
          7<span>7</span>7
        </div>
        <span className="hero-art-label">LUCKY ORBIT / PRACTICE EDITION</span>
      </div>
      <div className="relative z-10 mt-8 flex flex-wrap gap-2 md:col-span-2">
        {arcadeGames.map((game) => (
          <button key={game.id} type="button" className="filter-chip" onClick={() => onOpenGame(game)}>
            {game.title}
            <ArrowUpRight size={13} />
          </button>
        ))}
      </div>
    </section>
  );
}
