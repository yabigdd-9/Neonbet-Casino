// Arcade / instant games (local simulated, share the simulated balance).
export const arcadeGames = [
  {
    id: "dice-duel",
    title: "Dice Duel",
    type: "Arcade Table",
    tag: "New",
    emoji: "🎲",
    gradient: "from-cyan-400 via-blue-600 to-indigo-800",
    rule: "Roll higher than the house to win 2x.",
  },
  {
    id: "plinko-drop",
    title: "Plinko Drop",
    type: "Instant",
    tag: "Fresh",
    emoji: "🟣",
    gradient: "from-fuchsia-500 via-purple-600 to-slate-900",
    rule: "Drop a neon chip through 7 lanes for up to 9x.",
  },
  {
    id: "neon-crash",
    title: "Neon Crash",
    type: "Multiplier",
    tag: "Fast",
    emoji: "🚀",
    gradient: "from-amber-300 via-orange-500 to-rose-700",
    rule: "Cash out before the rocket crashes.",
  },
];

export default arcadeGames;
