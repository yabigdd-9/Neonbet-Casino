// Reusable game card for the lobby grid.
import React from "react";
import { Play, Star } from "lucide-react";
import Card from "../../components/ui/Card";
import GameArtwork from "./GameArtwork";

export default function GameCard({ game, onPlay, isFavorite, onToggleFavorite, arcade = false }) {
  return (
    <Card className="game-card group overflow-hidden">
      <div className="game-art relative aspect-[4/3] overflow-hidden bg-slate-900">
        <GameArtwork game={game} />
        <div className="absolute right-2 top-2 rounded-full bg-slate-950/85 px-2 py-1 text-[10px] font-bold tracking-wider">
          {arcade ? "ARCADE" : game.provider === "Lucky Orbit Originals" ? "ORIGINAL" : "THEME"}
        </div>
        <div className="game-cover-caption" aria-hidden="true">
          {game.collection ||
            (arcade
              ? "ORBIT ARCADE"
              : game.provider === "Lucky Orbit Originals"
                ? "ORBIT ORIGINALS"
                : "LOCAL THEME")}
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
        <div className="mb-2 text-[11px] font-medium text-cyan-200">{game.type}</div>
        <h3 className="min-h-11 text-sm font-semibold leading-snug md:text-base">{game.title}</h3>
        {arcade && <p className="mb-4 mt-2 text-xs leading-5 text-slate-400">{game.rule}</p>}
        <button
          aria-label={arcade ? `Play ${game.title}` : `Play game: ${game.title}`}
          type="button"
          onClick={() => onPlay(game)}
          className="mt-auto w-full rounded-2xl bg-white/10 py-3 font-semibold text-white transition hover:bg-cyan-400 hover:text-slate-950"
        >
          <Play size={14} className="mr-2 inline" /> Play
        </button>
      </div>
    </Card>
  );
}
