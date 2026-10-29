import { describe, it, expect } from "vitest";
import {
  evaluateSlot,
  buildSpin,
  buildProviderGame,
  getGameId,
  pickWeightedOutcome,
  shuffle,
  betOptions,
  payoutRows,
  gameFilters,
} from "./gameEngine.js";

describe("pickWeightedOutcome", () => {
  it("always returns one of the known outcome labels", () => {
    const labels = ["five", "four", "three", "two", "bonus", "miss"];
    for (let i = 0; i < 500; i++) {
      const out = pickWeightedOutcome();
      expect(labels).toContain(out);
    }
  });
});

describe("shuffle", () => {
  it("returns the same elements without mutating the input", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    const result = shuffle(input);
    expect(input).toEqual(original); // not mutated
    expect([...result].sort((a, b) => a - b)).toEqual(original); // same multiset
    expect(result).toHaveLength(original.length);
  });

  it("returns a new array reference", () => {
    const input = ["a", "b", "c"];
    expect(shuffle(input)).not.toBe(input);
  });
});

describe("buildSpin", () => {
  const game = {
    title: "Neon Fruits",
    type: "Slots",
    symbols: ["🍒", "🍋", "💎", "⭐", "7"],
  };

  it("returns a spin result with 5 reels, a numeric multiplier and a label", () => {
    const spin = buildSpin(game);
    expect(spin.reels).toHaveLength(5);
    expect(typeof spin.multiplier).toBe("number");
    expect(typeof spin.label).toBe("string");
  });

  it("maps every outcome label to its documented multiplier", () => {
    const expectations = {
      five: 50,
      fiveOther: 20,
      four: 8,
      three: 3,
      two: 1.5,
      bonus: 2,
      miss: 0,
    };
    for (let i = 0; i < 2000; i++) {
      const spin = buildSpin(game);
      // Find which expectation bucket the spin fell into by label.
      const expected = Object.entries(expectations).find(([, mult]) => mult === spin.multiplier);
      expect(expected).toBeTruthy();
      // Label must correspond to the multiplier for consistency.
      const expectedLabel = {
        50: "Jackpot hit",
        20: "Five matching",
        8: "Four of a kind",
        3: "Three match",
        1.5: "Small win",
        2: "Bonus mix",
        0: "Try again",
      }[spin.multiplier];
      expect(spin.label).toBe(expectedLabel);
    }
  });

  it("uses the provided symbols for the reels", () => {
    const custom = { symbols: ["X", "Y", "Z"] };
    const spin = buildSpin(custom);
    expect(spin.reels.every((s) => ["X", "Y", "Z"].includes(s))).toBe(true);
  });

  it("falls back to default symbols when none are provided", () => {
    const spin = buildSpin({});
    expect(spin.reels).toHaveLength(5);
    expect(spin.reels.every((s) => typeof s === "string")).toBe(true);
  });
});

describe("buildProviderGame", () => {
  const provider = { name: "Pragmatic Play", highlight: "High-volatility slots" };

  it("returns a playable provider game with the documented shape", () => {
    const game = buildProviderGame(provider, "Gates of Olympus", 0);
    expect(game).toMatchObject({
      title: "Gates of Olympus",
      type: "Pragmatic Play",
      tag: "Playable",
      provider: "Pragmatic Play",
      providerHighlight: "High-volatility slots",
      libraryIndex: 0,
    });
    expect(Array.isArray(game.symbols)).toBe(true);
    expect(typeof game.emoji).toBe("string");
    expect(typeof game.gradient).toBe("string");
  });

  it("derives tags from the title and index", () => {
    const mega = buildProviderGame(provider, "Book of Mega", 5);
    expect(mega.tags).toContain("Megaways");

    const jackpot = buildProviderGame(provider, "Rich Jackpot", 9);
    expect(jackpot.tags).toContain("Jackpot");

    const bonusBuy = buildProviderGame(provider, "Bonus Buy Blast", 4);
    expect(bonusBuy.tags).toContain("Bonus Buy");

    const hot = buildProviderGame(provider, "Some Game", 0);
    expect(hot.tags).toContain("Hot");

    const fresh = buildProviderGame(provider, "Some Game", 2);
    expect(fresh.tags).toContain("New");
  });

  it('defaults tags to ["Hot"] when no other tag applies', () => {
    const game = buildProviderGame(provider, "Plain Title", 10);
    // index 10 -> not Hot/New, title plain -> no derived tags
    expect(game.tags).toEqual(["Hot"]);
  });
});

describe("getGameId", () => {
  it("prefers provider then type, joined with the title", () => {
    expect(getGameId({ provider: "NetEnt", title: "Starburst" })).toBe("NetEnt-Starburst");
    expect(getGameId({ type: "Slots", title: "Gold Rush" })).toBe("Slots-Gold Rush");
  });
});

describe("static exports", () => {
  it("exposes betOptions, payoutRows and gameFilters", () => {
    expect(betOptions).toEqual([0.25, 0.4, 0.5, 0.75, 0.8, 1.2]);
    expect(payoutRows).toHaveLength(6);
    expect(payoutRows.every((row) => Array.isArray(row) && row.length === 2)).toBe(true);
    expect(gameFilters).toEqual(["All", "Hot", "New", "Megaways", "Bonus Buy", "Jackpot", "Favorites"]);
  });
});

import { evaluateReels } from "./gameEngine";
import { playArcade } from "./gameEngine";
it("scores coin outcomes and every wheel segment as displayed", () => {
  expect(playArcade("coin-flip", 2, () => 0.49)).toMatchObject({
    title: "Heads",
    multiplier: 2,
    visual: [1],
  });
  expect(playArcade("coin-flip", 2, () => 0.5)).toMatchObject({ title: "Tails", multiplier: 0, visual: [0] });
  [0, 0.5, 1, 2, 3, 5].forEach((multiplier, index) => {
    expect(playArcade("lucky-wheel", 2, () => (index + 0.5) / 6)).toMatchObject({
      multiplier,
      visual: [index],
    });
  });
});
it("scores the symbols actually shown, including incidental higher matches", () => {
  expect(evaluateReels(["7", "7", "7", "7", "7"]).multiplier).toBe(50);
  expect(evaluateReels(["🍒", "🍒", "🍒", "🍒", "🍒"]).multiplier).toBe(20);
  expect(evaluateReels(["🍒", "🍒", "🍒", "🍒", "🍋"]).multiplier).toBe(8);
  expect(evaluateReels(["🍒", "🍒", "🍒", "⭐", "🍋"]).multiplier).toBe(3);
  expect(evaluateReels(["🍒", "🍒", "🍋", "⭐", "X"]).multiplier).toBe(1.5);
  expect(evaluateReels(["💎", "⭐", "7", "🍒", "🍋"]).multiplier).toBe(2);
  expect(evaluateReels(["A", "B", "C", "D", "E"]).multiplier).toBe(0);
});

it("settles every Lucky Seven combination and all Neon Draw ranks", () => {
  let sevens = 0;
  for (let first = 1; first <= 6; first++) {
    for (let second = 1; second <= 6; second++) {
      const draws = [(first - 0.5) / 6, (second - 0.5) / 6];
      const round = playArcade("lucky-seven", 2, () => draws.shift());
      expect(round.visual).toEqual([first, second]);
      expect(round.multiplier).toBe(first + second === 7 ? 5 : 0);
      if (round.multiplier) sevens++;
    }
  }
  expect(sevens).toBe(6);
  for (let rank = 1; rank <= 13; rank++) {
    expect(playArcade("neon-draw", 2, () => (rank - 0.5) / 13)).toMatchObject({
      visual: [rank],
      multiplier: rank === 1 ? 5 : rank >= 11 ? 2 : 0,
    });
  }
});

it("evaluates line and scatter mechanics from the visible symbols", () => {
  const line = { mechanic: "line" };
  expect(evaluateSlot(line, ["A", "A", "A", "B", "B"]).multiplier).toBe(3);
  expect(evaluateSlot(line, ["B", "A", "A", "A", "A"]).multiplier).toBe(0);
  expect(evaluateSlot(line, ["A", "A", "A", "A", "A"]).multiplier).toBe(20);
  expect(evaluateSlot({ mechanic: "scatter" }, ["⭐", "A", "⭐", "B", "⭐"]).multiplier).toBe(3);
  expect(evaluateSlot({ mechanic: "scatter" }, ["⭐", "⭐", "⭐", "⭐", "⭐"]).multiplier).toBe(30);
  expect(evaluateSlot({ mechanic: "scatter" }, ["A", "A", "A", "A", "A"]).multiplier).toBe(0);
});

it("settles scatter bonus spins once with payouts derived from all visible reels", () => {
  const result = buildSpin({ mechanic: "scatter", symbols: ["A", "⭐"] }, () => 0.75);
  expect(result.reels).toEqual(Array(5).fill("⭐"));
  expect(result.baseMultiplier).toBe(30);
  expect(result.bonusRounds).toHaveLength(3);
  expect(result.multiplier).toBe(120);
  expect(result.bonusRounds.every((round) => !round.bonusRounds)).toBe(true);
  expect(buildSpin({ mechanic: "scatter", symbols: ["A", "⭐"] }, () => 0).bonusRounds).toBeUndefined();
});

it("preserves saved original-game identities through the Lucky Orbit rebrand", () => {
  expect(getGameId({ provider: "Lucky Orbit Originals", title: "Neon Fruits" })).toBe(
    getGameId({ provider: "NeonBet Originals", title: "Neon Fruits" }),
  );
});

it("settles new card, dice, color and race rounds from the displayed outcomes", () => {
  for (let player = 1; player <= 13; player++) {
    for (let house = 1; house <= 13; house++) {
      const draws = [(player - 0.5) / 13, (house - 0.5) / 13];
      const round = playArcade("high-card", 2, () => draws.shift());
      expect(round.visual).toEqual([player, house]);
      expect(round.multiplier).toBe(player > house ? 1.8 : player === house ? 1 : 0);
    }
  }
  for (let first = 1; first <= 6; first++) {
    expect(playArcade("meteor-six", 2, () => (first - 0.5) / 6).multiplier).toBe(first === 6 ? 5 : 0);
    for (let second = 1; second <= 6; second++) {
      const draws = [(first - 0.5) / 6, (second - 0.5) / 6];
      const round = playArcade("odd-orbit", 2, () => draws.shift());
      expect(round.visual).toEqual([first, second]);
      expect(round.multiplier).toBe((first + second) % 2 ? 1.8 : 0);
    }
  }
  for (let first = 0; first < 4; first++) {
    expect(playArcade("orbit-race", 2, () => (first + 0.5) / 4).multiplier).toBe(first === 0 ? 3 : 0);
    expect(playArcade("treasure-chests", 2, () => (first + 0.5) / 4).multiplier).toBe([0, 0.5, 1, 2][first]);
    for (let second = 0; second < 4; second++) {
      const draws = [(first + 0.5) / 4, (second + 0.5) / 4];
      expect(playArcade("color-pair", 2, () => draws.shift()).multiplier).toBe(first === second ? 3 : 0);
    }
  }
});

it("keno draws distinct numbers without replacement and pays the visible matches", () => {
  const payouts = new Set();
  // Every ordered three-number draw is possible, including every match count.
  for (let first = 0; first < 12; first++) {
    for (let second = 0; second < 11; second++) {
      for (let third = 0; third < 10; third++) {
        const draws = [(first + 0.5) / 12, (second + 0.5) / 11, (third + 0.5) / 10];
        const round = playArcade("orbit-keno", 2, () => draws.shift());
        expect(new Set(round.visual).size).toBe(3);
        expect(round.visual.every((number) => number >= 1 && number <= 12)).toBe(true);
        expect(round.multiplier).toBe([0, 0.5, 2, 8][round.visual.filter((number) => number <= 3).length]);
        payouts.add(round.multiplier);
      }
    }
  }
  expect([...payouts].sort((a, b) => a - b)).toEqual([0, 0.5, 2, 8]);
});
