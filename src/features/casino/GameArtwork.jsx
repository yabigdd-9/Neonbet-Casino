import React, { useState } from "react";
import { gameArtwork } from "../../lib/gameArtwork";

export default function GameArtwork({ game }) {
  const art = gameArtwork(game);
  const [fallback, setFallback] = useState(false);
  return (
    <div className="game-cover" aria-hidden="true">
      <img
        src={fallback ? art.fallback : art.src}
        width="1774"
        height="887"
        alt=""
        loading="lazy"
        decoding="async"
        className={fallback ? "game-cover-fallback" : "game-cover-atlas"}
        onError={fallback ? undefined : () => setFallback(true)}
        style={fallback ? undefined : { left: `${-art.column * 100}%`, top: `${-art.row * 100}%` }}
      />
    </div>
  );
}
