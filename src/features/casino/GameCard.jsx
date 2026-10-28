// Reusable game card for the lobby grid.
import React from "react";
import { Play, Star } from "lucide-react";
import Card from "../../components/ui/Card";

export default function GameCard({ game, onPlay, isFavorite, onToggleFavorite }) {
  return (
    <Card className="game-card group overflow-hidden">
      <div
        className={`game-art relative grid h-32 md:h-40 place-items-center bg-gradient-to-br ${game.gradient}`}
      >
        <div className="absolute right-3 top-3 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold">
          PRACTICE
        </div>
        <img
          src={`${import.meta.env.BASE_URL}game-art.svg`}
          width="160"
          height="120"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div aria-hidden="true" className="relative text-5xl font-bold tracking-tighter text-white/90">
          {game.emoji || game.title.slice(0, 2).toUpperCase()}
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(game);
            }}
            aria-label={`${isFavorite ? "Remove favorite" : "Add favorite"}: ${game.title}`}
            aria-pressed={Boolean(isFavorite)}
            className="absolute left-3 top-3 min-h-11 min-w-11 rounded-full bg-black/35 p-2 text-white hover:bg-black/55"
          >
            <Star size={16} className={isFavorite ? "fill-amber-300 text-amber-300" : ""} />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <div className="text-xs text-cyan-300">{game.type}</div>
        <div className="font-semibold text-base leading-tight min-h-10">{game.title}</div>
        <button
          aria-label={`Play practice game: ${game.title}`}
          type="button"
          onClick={() => onPlay(game)}
          className="mt-auto w-full rounded-2xl bg-white/10 py-3 font-semibold text-white transition hover:bg-cyan-400 hover:text-slate-950"
        >
          <Play size={14} className="mr-2 inline" /> Play practice
        </button>
      </div>
    </Card>
  );
}
