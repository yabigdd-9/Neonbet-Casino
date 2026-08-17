// Deterministic premium game artwork. Renders an SVG tile from the game's
// title/symbols/gradient — no emoji dependency, no broken images, and a stable
// color per game so the lobby looks intentional across reloads.
import React from "react";

interface GameArtProps {
  title: string;
  symbols?: string[];
  gradient?: string; // Tailwind from-* to-* string, used as a hint
  className?: string;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Map a Tailwind "from-x to-y" hint to two concrete colors with a sane fallback.
function gradientColors(gradient: string | undefined, seed: number): [string, string] {
  const known: Record<string, [string, string]> = {
    "from-pink-500 to-orange-400": ["#ec4899", "#fb923c"],
    "from-cyan-400 to-blue-600": ["#22d3ee", "#2563eb"],
    "from-emerald-400 to-green-700": ["#34d399", "#15803d"],
    "from-purple-500 to-indigo-700": ["#a855f7", "#4338ca"],
    "from-yellow-400 to-red-500": ["#facc15", "#ef4444"],
    "from-sky-400 to-violet-600": ["#38bdf8", "#7c3aed"],
    "from-neutral-300 to-neutral-700": ["#d4d4d8", "#404040"],
    "from-cyan-400 via-blue-600 to-indigo-800": ["#22d3ee", "#312e81"],
    "from-fuchsia-500 via-purple-600 to-slate-900": ["#d946ef", "#0f172a"],
    "from-amber-300 via-orange-500 to-rose-700": ["#fcd34d", "#be123c"],
  };
  if (gradient && known[gradient]) return known[gradient];
  const hue = seed % 360;
  return [`hsl(${hue} 90% 60%)`, `hsl(${(hue + 50) % 360} 85% 45%)`];
}

export default function GameArt({ title, symbols, gradient, className = "" }: GameArtProps) {
  const seed = hashString(title);
  const [c1, c2] = gradientColors(gradient, seed);
  const glyph = symbols && symbols.length ? symbols[0] : "★";
  const gid = `g-${seed}`;
  const pid = `p-${seed}`;

  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`${title} artwork`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <pattern id={pid} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <circle cx="3" cy="3" r="1.4" fill="#ffffff" opacity="0.18" />
          <circle cx="16" cy="16" r="1.4" fill="#ffffff" opacity="0.12" />
        </pattern>
        <radialGradient id={`r-${seed}`} cx="0.7" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${gid})`} />
      <rect width="320" height="200" fill={`url(#${pid})`} />
      <rect width="320" height="200" fill={`url(#r-${seed})`} />
      <circle cx="256" cy="44" r="54" fill="#000000" opacity="0.16" />
      <circle cx="64" cy="168" r="70" fill="#000000" opacity="0.12" />
      <text
        x="160"
        y="118"
        textAnchor="middle"
        fontSize="84"
        fill="#ffffff"
        opacity="0.92"
        style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))" }}
      >
        {glyph.length > 2 ? "★" : glyph}
      </text>
    </svg>
  );
}
