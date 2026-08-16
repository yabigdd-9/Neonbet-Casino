import { describe, it, expect } from 'vitest';
import {
  buildSpin,
  buildProviderGame,
  getGameId,
  pickWeightedOutcome,
  shuffle,
  betOptions,
  payoutRows,
  gameFilters,
} from './gameEngine.js';

describe('pickWeightedOutcome', () => {
  it('always returns one of the known outcome labels', () => {
    const labels = ['five', 'four', 'three', 'two', 'bonus', 'miss'];
    for (let i = 0; i < 500; i++) {
      const out = pickWeightedOutcome();
      expect(labels).toContain(out);
    }
  });
});

describe('shuffle', () => {
  it('returns the same elements without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    const result = shuffle(input);
    expect(input).toEqual(original); // not mutated
    expect([...result].sort((a, b) => a - b)).toEqual(original); // same multiset
    expect(result).toHaveLength(original.length);
  });

  it('returns a new array reference', () => {
    const input = ['a', 'b', 'c'];
    expect(shuffle(input)).not.toBe(input);
  });
});

describe('buildSpin', () => {
  const game = {
    title: 'Neon Fruits',
    type: 'Slots',
    symbols: ['🍒', '🍋', '💎', '⭐', '7'],
  };

  it('returns a spin result with 5 reels, a numeric multiplier and a label', () => {
    const spin = buildSpin(game);
    expect(spin.reels).toHaveLength(5);
    expect(typeof spin.multiplier).toBe('number');
    expect(typeof spin.label).toBe('string');
  });

  it('maps every outcome label to its documented multiplier', () => {
    const expectations = {
      five: 50,
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
        50: 'Jackpot hit',
        8: 'Four of a kind',
        3: 'Three match',
        1.5: 'Small win',
        2: 'Bonus mix',
        0: 'Try again',
      }[spin.multiplier];
      expect(spin.label).toBe(expectedLabel);
    }
  });

  it('uses the provided symbols for the reels', () => {
    const custom = { symbols: ['X', 'Y', 'Z'] };
    const spin = buildSpin(custom);
    expect(spin.reels.every((s) => ['X', 'Y', 'Z'].includes(s))).toBe(true);
  });

  it('falls back to default symbols when none are provided', () => {
    const spin = buildSpin({});
    expect(spin.reels).toHaveLength(5);
    expect(spin.reels.every((s) => typeof s === 'string')).toBe(true);
  });
});

describe('buildProviderGame', () => {
  const provider = { name: 'Pragmatic Play', highlight: 'High-volatility slots' };

  it('returns a playable provider game with the documented shape', () => {
    const game = buildProviderGame(provider, 'Gates of Olympus', 0);
    expect(game).toMatchObject({
      title: 'Gates of Olympus',
      type: 'Pragmatic Play',
      tag: 'Playable',
      provider: 'Pragmatic Play',
      providerHighlight: 'High-volatility slots',
      libraryIndex: 0,
    });
    expect(Array.isArray(game.symbols)).toBe(true);
    expect(typeof game.emoji).toBe('string');
    expect(typeof game.gradient).toBe('string');
  });

  it('derives tags from the title and index', () => {
    const mega = buildProviderGame(provider, 'Book of Mega', 5);
    expect(mega.tags).toContain('Megaways');

    const jackpot = buildProviderGame(provider, 'Rich Jackpot', 9);
    expect(jackpot.tags).toContain('Jackpot');

    const bonusBuy = buildProviderGame(provider, 'Bonus Buy Blast', 4);
    expect(bonusBuy.tags).toContain('Bonus Buy');

    const hot = buildProviderGame(provider, 'Some Game', 0);
    expect(hot.tags).toContain('Hot');

    const fresh = buildProviderGame(provider, 'Some Game', 2);
    expect(fresh.tags).toContain('New');
  });

  it('defaults tags to ["Hot"] when no other tag applies', () => {
    const game = buildProviderGame(provider, 'Plain Title', 10);
    // index 10 -> not Hot/New, title plain -> no derived tags
    expect(game.tags).toEqual(['Hot']);
  });
});

describe('getGameId', () => {
  it('prefers provider then type, joined with the title', () => {
    expect(getGameId({ provider: 'NetEnt', title: 'Starburst' })).toBe('NetEnt-Starburst');
    expect(getGameId({ type: 'Slots', title: 'Gold Rush' })).toBe('Slots-Gold Rush');
  });
});

describe('static exports', () => {
  it('exposes betOptions, payoutRows and gameFilters', () => {
    expect(betOptions).toEqual([0.25, 0.4, 0.5, 0.75, 0.8, 1.2]);
    expect(payoutRows).toHaveLength(6);
    expect(payoutRows.every((row) => Array.isArray(row) && row.length === 2)).toBe(true);
    expect(gameFilters).toEqual(['All', 'Hot', 'New', 'Megaways', 'Bonus Buy', 'Jackpot', 'Favorites']);
  });
});
