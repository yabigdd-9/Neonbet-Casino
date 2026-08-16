// Reusable game card for the lobby grid.
import React from "react";
import { Play, Star } from "lucide-react";
import type { SlotGame } from "../../types";
import Card from "../../components/ui/Card";

interface GameCardProps {
  game: SlotGame;
  onPlay: (game: SlotGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (game: SlotGame) => void;
}

export default function GameCard({ game, onPlay, isFavorite, onToggleFavorite }: GameCardProps) {
  return (
    <Card className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-neon">
      <div className={`relative grid h-36 place-items-center bg-gradient-to-br ${game.gradient}`}>
        <div className="absolute right-3 top-3 rounded-full bg-black/35 px-3 py-1 text-xs font-black">
          {game.tag}
        </div>
        <div className="text-6xl transition group-hover:scale-110">{game.emoji}</div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(game);
            }}
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            className="absolute left-3 top-3 rounded-full bg-black/35 p-2 text-white hover:bg-black/55"
          >
            <Star size={16} className={isFavorite ? "fill-amber-300 text-amber-300" : ""} />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-cyan-300">{game.type}</div>
        <div className="font-black text-lg">{game.title}</div>
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
