// Pure game-logic helpers (no React). Shared by slot + arcade modals.

export function pickWeightedOutcome() {
  const roll = Math.random();
  if (roll < 0.12) return "five";
  if (roll < 0.28) return "four";
  if (roll < 0.55) return "three";
  if (roll < 0.8) return "two";
  if (roll < 0.9) return "bonus";
  return "miss";
}

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Build a single spin result for a local simulated slot.
export function evaluateReels(reels, jackpot = "7", premium = "💎", star = "⭐") {
  const counts = new Map();
  reels.forEach((symbol) => counts.set(symbol, (counts.get(symbol) || 0) + 1));
  const largest = Math.max(...counts.values());
  if (largest === 5)
    return {
      reels,
      multiplier: reels[0] === jackpot ? 50 : 20,
      label: reels[0] === jackpot ? "Jackpot hit" : "Five matching",
    };
  if (largest === 4) return { reels, multiplier: 8, label: "Four of a kind" };
  if (largest === 3) return { reels, multiplier: 3, label: "Three match" };
  if (
    new Set([jackpot, premium, star]).size === 3 &&
    [jackpot, premium, star].every((symbol) => counts.has(symbol))
  )
    return { reels, multiplier: 2, label: "Bonus mix" };
  if (largest === 2) return { reels, multiplier: 1.5, label: "Small win" };
  return { reels, multiplier: 0, label: "Try again" };
}

// Browser-only demonstration math. Payout is derived from the displayed reels.
export function buildSpin(game) {
  const symbols = game.symbols?.length ? game.symbols : ["🍒", "🍋", "💎", "⭐", "7"];
  const seven = symbols.includes("7") ? "7" : symbols[0];
  const premium = symbols.includes("💎") ? "💎" : symbols[1] || symbols[0];
  const star = symbols.includes("⭐") ? "⭐" : symbols[2] || symbols[0];
  const matchSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const filler = () => symbols[Math.floor(Math.random() * symbols.length)];
  const finish = (reels) => evaluateReels(reels, seven, premium, star);
  const outcome = pickWeightedOutcome();
  if (outcome === "five") return finish(Array(5).fill(seven));
  if (outcome === "four")
    return finish(shuffle([matchSymbol, matchSymbol, matchSymbol, matchSymbol, filler()]));
  if (outcome === "three")
    return finish(shuffle([matchSymbol, matchSymbol, matchSymbol, filler(), filler()]));
  if (outcome === "two") return finish(shuffle([matchSymbol, matchSymbol, filler(), filler(), filler()]));
  if (outcome === "bonus") return finish(shuffle([premium, star, seven, filler(), filler()]));
  return finish(shuffle([filler(), filler(), filler(), filler(), filler()]));
}

// Deterministic-ish skin picker for provider themed games (stable per provider/title).
function hashText(text) {
  return [...text].reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

const providerGameSkins = [
  {
    emoji: "⚡",
    gradient: "from-cyan-400 to-blue-700",
    symbols: ["⚡", "💎", "⭐", "🪙", "🔥", "7", "BONUS"],
  },
  {
    emoji: "🍬",
    gradient: "from-pink-400 to-fuchsia-700",
    symbols: ["🍬", "🍭", "🍒", "⭐", "💎", "7", "WILD"],
  },
  {
    emoji: "🏛️",
    gradient: "from-amber-300 to-orange-700",
    symbols: ["🏛️", "⚡", "👑", "⭐", "💎", "7", "SCAT"],
  },
  {
    emoji: "🐺",
    gradient: "from-slate-300 to-slate-800",
    symbols: ["🐺", "🌙", "💰", "⭐", "💎", "7", "WILD"],
  },
  {
    emoji: "🐟",
    gradient: "from-sky-300 to-teal-700",
    symbols: ["🐟", "🎣", "💰", "⭐", "💎", "7", "BONUS"],
  },
  {
    emoji: "🚂",
    gradient: "from-red-400 to-stone-900",
    symbols: ["🚂", "💰", "🔥", "⭐", "💎", "7", "WILD"],
  },
  {
    emoji: "🗿",
    gradient: "from-violet-400 to-indigo-900",
    symbols: ["🗿", "🔮", "👑", "⭐", "💎", "7", "SCAT"],
  },
  {
    emoji: "💰",
    gradient: "from-yellow-300 to-amber-700",
    symbols: ["💰", "🪙", "🏆", "⭐", "💎", "7", "BONUS"],
  },
];

export function buildProviderGame(provider, title, index) {
  const titleLower = title.toLowerCase();
  const skin = providerGameSkins[hashText(`${provider.name}-${title}`) % providerGameSkins.length];
  const tags = [
    titleLower.includes("mega") ? "Megaways" : "",
    titleLower.includes("bonus") || titleLower.includes("buy") ? "Bonus Buy" : "",
    titleLower.includes("jackpot") || titleLower.includes("millionaire") || titleLower.includes("rich")
      ? "Jackpot"
      : "",
    index < 2 ? "Hot" : "",
    index === 2 || index === 3 ? "New" : "",
  ].filter(Boolean);

  return {
    title,
    type: provider.name,
    tag: "Playable",
    emoji: skin.emoji,
    gradient: skin.gradient,
    symbols: skin.symbols,
    provider: provider.name,
    providerHighlight: provider.highlight,
    libraryIndex: index,
    tags: tags.length ? tags : ["Hot"],
  };
}

export function getGameId(game) {
  return `${game.provider || game.type}-${game.title}`;
}

export const betOptions = [0.25, 0.4, 0.5, 0.75, 0.8, 1.2];
export const payoutRows = [
  ["Five 7s", "50x"],
  ["Five matching", "20x"],
  ["Four matching", "8x"],
  ["Three matching", "3x"],
  ["Two matching", "1.5x"],
  ["Bonus mix", "2x"],
];
export const gameFilters = ["All", "Hot", "New", "Megaways", "Bonus Buy", "Jackpot", "Favorites"];

export default {
  buildSpin,
  buildProviderGame,
  getGameId,
  pickWeightedOutcome,
  shuffle,
  betOptions,
  payoutRows,
  gameFilters,
};

export const PLINKO_MULTIPLIERS = [0, 0.4, 0.8, 1.5, 9, 1.5, 0.8, 0.4, 0];
export function playArcade(id, target = 2, random = Math.random) {
  if (id === "coin-flip") {
    const heads = random() < 0.5;
    return {
      title: heads ? "Heads" : "Tails",
      detail: heads ? "Heads pays 2x." : "Tails pays 0x.",
      multiplier: heads ? 2 : 0,
      visual: [heads ? 1 : 0],
    };
  }
  if (id === "lucky-wheel") {
    const payouts = [0, 0.5, 1, 2, 3, 5];
    const segment = Math.floor(random() * payouts.length);
    const multiplier = payouts[segment];
    return {
      title: "Wheel landed",
      detail: `Segment ${segment + 1} pays ${multiplier}x.`,
      multiplier,
      visual: [segment],
    };
  }
  if (id === "dice-duel") {
    const visual = Array.from({ length: 4 }, () => 1 + Math.floor(random() * 6));
    const player = visual[0] + visual[1],
      house = visual[2] + visual[3];
    const multiplier = player > house ? 2 : player === house ? 1 : 0;
    return {
      title: multiplier === 2 ? "Player wins" : multiplier === 1 ? "Push" : "House wins",
      detail: `You rolled ${player}. House rolled ${house}.`,
      multiplier,
      visual,
    };
  }
  if (id === "plinko-drop") {
    const path = [4];
    for (let step = 0; step < 8; step++)
      path.push(Math.max(0, Math.min(8, path.at(-1) + (random() >= 0.5 ? 1 : -1))));
    const lane = path.at(-1),
      multiplier = PLINKO_MULTIPLIERS[lane];
    return {
      title: multiplier >= 1 ? "Chip landed hot" : "Chip missed",
      detail: `Lane ${lane + 1} paid ${multiplier}x.`,
      multiplier,
      visual: path,
    };
  }
  if (id === "neon-crash") {
    if (!Number.isFinite(target) || target < 1.25 || target > 6) throw new Error("Invalid cash-out target");
    const crash = Number((1 + random() * random() * 8).toFixed(2));
    const multiplier = crash >= target ? target : 0;
    return {
      title: multiplier ? "Cashed out" : "Rocket crashed",
      detail: `Crash ${crash.toFixed(2)}x / target ${target.toFixed(2)}x.`,
      multiplier,
      visual: [crash, target],
    };
  }
  throw new Error("Unsupported arcade game");
}
