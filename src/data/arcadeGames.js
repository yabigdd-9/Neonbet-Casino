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
  {
    id: "coin-flip",
    title: "Neon Coin Flip",
    type: "Coin game",
    tag: "New",
    emoji: "🪙",
    gradient: "from-yellow-300 via-amber-500 to-orange-800",
    rule: "Heads pays 2x; tails pays zero.",
  },
  {
    id: "lucky-wheel",
    title: "Lucky Wheel",
    type: "Wheel game",
    tag: "New",
    emoji: "🎡",
    gradient: "from-emerald-400 via-teal-600 to-indigo-800",
    rule: "Spin one of six equal segments for up to 5x.",
  },
  {
    id: "lucky-seven",
    title: "Lucky Seven",
    type: "Dice game",
    tag: "New",
    emoji: "🎲",
    gradient: "from-rose-400 via-red-600 to-purple-900",
    rule: "Roll two dice: a total of seven pays 5x, other totals pay zero.",
  },
  {
    id: "neon-draw",
    title: "Neon Draw",
    type: "Card draw",
    tag: "New",
    emoji: "🃏",
    gradient: "from-sky-400 via-indigo-600 to-slate-900",
    rule: "Draw one of 13 ranks: an ace pays 5x, a face card pays 2x, other ranks pay zero.",
  },
];

arcadeGames.push(
  {
    id: "high-card",
    title: "High Card Orbit",
    type: "Card duel",
    emoji: "🃏",
    artwork: "cards",
    rule: "Your rank beats the house: 1.8x. Equal ranks return 1x; lower ranks pay zero.",
  },
  {
    id: "meteor-six",
    title: "Meteor Six",
    type: "Single die",
    emoji: "🎲",
    artwork: "dice",
    rule: "Roll one six-sided die. A six pays 5x; other faces pay zero.",
  },
  {
    id: "color-pair",
    title: "Prism Pairs",
    type: "Color match",
    emoji: "💠",
    artwork: "gem",
    rule: "Draw two colors from four equally likely colors. A matching pair pays 3x; others pay zero.",
  },
  {
    id: "orbit-race",
    title: "Orbit Sprint",
    type: "Space race",
    emoji: "🚀",
    artwork: "racing",
    rule: "Four racers have equal chances. You back racer 1: a win pays 3x; others pay zero.",
  },
  {
    id: "treasure-chests",
    title: "Treasure Chests",
    type: "Treasure reveal",
    emoji: "🪙",
    artwork: "treasure",
    rule: "Open the middle chest. Its equally likely prizes are 0x, 0.5x, 1x and 2x.",
  },
  {
    id: "odd-orbit",
    title: "Odd Orbit",
    type: "Dice total",
    emoji: "🎲",
    artwork: "space",
    rule: "Roll two dice. An odd total pays 1.8x; an even total pays zero.",
  },
  {
    id: "orbit-keno",
    title: "Orbit Keno",
    type: "Number draw",
    emoji: "🔢",
    artwork: "plinko",
    rule: "Your numbers are 1, 2 and 3. Draw three distinct numbers from 1–12. Match 1 / 2 / 3 for 0.5x / 2x / 8x; no matches pay zero.",
  },
);
arcadeGames.forEach((game) => {
  game.tag ||= "New";
  game.gradient ||= "from-indigo-400 via-violet-600 to-slate-900";
});

export default arcadeGames;
