// Reusable game card for the lobby grid.
import React from "react";
import { Play, Star } from "lucide-react";
import type { SlotGame } from "../../types";
import Card from "../../components/ui/Card";
import GameArt from "../../components/GameArt";

interface GameCardProps {
  game: SlotGame;
  onPlay: (game: SlotGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (game: SlotGame) => void;
}

export default function GameCard({ game, onPlay, isFavorite, onToggleFavorite }: GameCardProps) {
  return (
    <Card className="group overflow-hidden card-lift">
      <div className="relative">
        <GameArt
          title={game.title}
          symbols={game.symbols}
          gradient={game.gradient}
          className="h-36 w-full shimmer"
        />
        <div className="absolute right-3 top-3 rounded-full bg-black/45 px-3 py-1 text-xs font-black text-white backdrop-blur">
          {game.tag}
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(game);
            }}
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            aria-pressed={Boolean(isFavorite)}
            className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
          >
            <Star size={16} className={isFavorite ? "fill-amber-300 text-amber-300" : ""} />
          </button>
        )}
      </div>
      <div className="p-4">
        {game.provider && (
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300/80">
            {game.provider}
          </div>
        )}
        <div className="font-black text-lg leading-tight">{game.title}</div>
        <button
          type="button"
          onClick={() => onPlay(game)}
          className="mt-4 w-full rounded-2xl bg-white/10 py-3 font-black text-white transition hover:bg-cyan-400 hover:text-slate-950"
        >
          <Play size={14} className="mr-2 inline" /> Play
        </button>
      </div>
    </Card>
  );
}
