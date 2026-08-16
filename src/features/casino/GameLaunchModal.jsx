// Game launch modal: preview + favorite + launch into the simulated player.
import React from "react";
import { Play, Star } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { betOptions } from "../../lib/gameEngine";
import { formatMoney } from "../../lib/storage";

export default function GameLaunchModal({ game, isFavorite, onToggleFavorite, onClose, onLaunch }) {
  if (!game) return null;
  const tags = game.tags || [game.tag].filter(Boolean);

  return (
    <Modal onClose={onClose} maxWidth="max-w-4xl">
      <div className={`relative grid h-44 place-items-center bg-gradient-to-br ${game.gradient}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-2xl bg-black/30 p-3 text-white hover:bg-black/45"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="text-7xl drop-shadow-2xl">{game.emoji}</div>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            {game.provider || game.type}
          </div>
          <h2 className="mt-2 text-3xl font-black md:text-5xl">{game.title}</h2>
          <p className="mt-4 text-slate-400">
            Launch a fast simulated session with NeonBet balance controls, frequent local wins, and
            quick bet presets.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="text-sm text-slate-400">Bet presets</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {betOptions.map((amount) => (
              <div
                key={amount}
                className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center text-sm font-black"
              >
                {formatMoney(amount)}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onLaunch}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-neon transition hover:scale-[1.02]"
          >
            <Play size={18} /> Launch Game
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(game)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-4 font-black text-white transition hover:bg-white/15"
          >
            <Star size={18} className={isFavorite ? "fill-amber-300 text-amber-300" : ""} />{" "}
            {isFavorite ? "Remove favorite" : "Add favorite"}
          </button>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Simulated browser game only. Not connected to deposits, withdrawals, or provider
            servers.
          </p>
        </div>
      </div>
    </Modal>
  );
}
