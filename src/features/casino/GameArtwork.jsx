import React from "react";
import { gameArtwork } from "../../lib/gameArtwork";

export default function GameArtwork({ game }) {
  const art = gameArtwork(game);
  return (
    <img
      src={art.src}
      width="480"
      height="360"
      alt=""
      loading="lazy"
      decoding="async"
      className="game-cover"
      style={{ filter: `hue-rotate(${art.hue}deg)` }}
    />
  );
}
