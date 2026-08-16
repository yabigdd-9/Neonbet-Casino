// Pure game-logic helpers (no React). Shared by slot + arcade modals.
import type { GameOutcome, SlotGame, SpinResult, CasinoProvider } from "../types";

export function pickWeightedOutcome(): GameOutcome {
  const roll = Math.random();
  if (roll < 0.12) return "five";
  if (roll < 0.28) return "four";
  if (roll < 0.55) return "three";
  if (roll < 0.8) return "two";
  if (roll < 0.9) return "bonus";
  return "miss";
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

// Build a single spin result for a local simulated slot.
export function buildSpin(game: SlotGame): SpinResult {
  const symbols = game.symbols || ["🍒", "🍋", "💎", "⭐", "7"];
  const seven = symbols.includes("7") ? "7" : symbols[0];
  const premium = symbols.includes("💎") ? "💎" : symbols[1] || symbols[0];
  const star = symbols.includes("⭐") ? "⭐" : symbols[2] || symbols[0];
  const matchSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const filler = (): string => symbols[Math.floor(Math.random() * symbols.length)];
  const outcome = pickWeightedOutcome();

  if (outcome === "five")
    return { reels: Array(5).fill(seven), multiplier: 50, label: "Jackpot hit" };
  if (outcome === "four")
    return {
      reels: shuffle([matchSymbol, matchSymbol, matchSymbol, matchSymbol, filler()]),
      multiplier: 8,
      label: "Four of a kind",
    };
  if (outcome === "three")
    return {
      reels: shuffle([matchSymbol, matchSymbol, matchSymbol, filler(), filler()]),
      multiplier: 3,
      label: "Three match",
    };
  if (outcome === "two")
    return {
      reels: shuffle([matchSymbol, matchSymbol, filler(), filler(), filler()]),
      multiplier: 1.5,
      label: "Small win",
    };
  if (outcome === "bonus")
    return {
      reels: shuffle([premium, star, seven, filler(), filler()]),
      multiplier: 2,
      label: "Bonus mix",
    };

  return {
    reels: shuffle([filler(), filler(), filler(), filler(), filler()]),
    multiplier: 0,
    label: "Try again",
  };
}

// Deterministic-ish skin picker for provider themed games (stable per provider/title).
function hashText(text: string): number {
  return [...text].reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

interface ProviderGameSkin {
  emoji: string;
  gradient: string;
  symbols: string[];
}

const providerGameSkins: ProviderGameSkin[] = [
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

export function buildProviderGame(
  provider: CasinoProvider,
  title: string,
  index: number,
): SlotGame {
  const titleLower = title.toLowerCase();
  const skin = providerGameSkins[hashText(`${provider.name}-${title}`) % providerGameSkins.length];
  const tags: string[] = [
    titleLower.includes("mega") ? "Megaways" : "",
    titleLower.includes("bonus") || titleLower.includes("buy") ? "Bonus Buy" : "",
    titleLower.includes("jackpot") ||
    titleLower.includes("millionaire") ||
    titleLower.includes("rich")
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

export function getGameId(game: SlotGame): string {
  return `${game.provider || game.type}-${game.title}`;
}

export const betOptions: number[] = [0.25, 0.4, 0.5, 0.75, 0.8, 1.2];
export const payoutRows: [string, string][] = [
  ["Five 7s", "50x"],
  ["Five matching", "20x"],
  ["Four matching", "8x"],
  ["Three matching", "3x"],
  ["Two matching", "1.5x"],
  ["Bonus mix", "2x"],
];
export const gameFilters: string[] = [
  "All",
  "Hot",
  "New",
  "Megaways",
  "Bonus Buy",
  "Jackpot",
  "Favorites",
];

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
