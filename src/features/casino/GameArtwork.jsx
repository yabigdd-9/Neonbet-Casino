import React from "react";
import { gameArtwork } from "../../lib/gameArtwork";

export default function GameArtwork({ game }) {
  const art = gameArtwork(game);
  return (
    <div className="game-cover" aria-hidden="true">
      <img
        src={art.src}
        width="1774"
        height="887"
        alt=""
        loading="lazy"
        decoding="async"
        className="game-cover-atlas"
        style={{ left: `${-art.column * 100}%`, top: `${-art.row * 100}%` }}
      />
    </div>
  );
}
