import { describe, it, expect } from 'vitest';
import { LocalDemoProvider, CasinoProvider } from './LocalDemoProvider.js';

const games = [
  { title: 'Neon Fruits', type: 'Slots' },
  { title: 'Crypto Mines', type: 'Instant' },
];
const arcadeGames = [
  { id: 'dice-duel', title: 'Dice Duel', type: 'Arcade Table' },
  { id: 'plinko-drop', title: 'Plinko Drop', type: 'Instant' },
];

describe('LocalDemoProvider', () => {
  const provider = new LocalDemoProvider({ games, arcadeGames });

  it('combines games and arcade games in getGames()', () => {
    expect(provider.getGames()).toHaveLength(4);
  });

  it('returns unique categories derived from game types', () => {
    expect(provider.getCategories()).toEqual(['Slots', 'Instant', 'Arcade Table']);
  });

  it('looks up a game by id or title', () => {
    expect(provider.getGame('dice-duel').title).toBe('Dice Duel');
    expect(provider.getGame('Neon Fruits').type).toBe('Slots');
    expect(provider.getGame('nope')).toBeNull();
  });

  it('declares demo capability without throwing', () => {
    const game = { title: 'X' };
    expect(provider.launchDemo(game)).toEqual({ mode: 'demo', game });
  });

  it('throws when real gameplay is requested', () => {
    expect(() => provider.launchReal()).toThrow();
  });
});

describe('CasinoProvider base class', () => {
  it('throws on unimplemented methods', () => {
    const base = new CasinoProvider();
    expect(() => base.getGames()).toThrow();
    expect(() => base.getGame('x')).toThrow();
    expect(() => base.getCategories()).toThrow();
    expect(() => base.launchDemo({})).toThrow();
    expect(() => base.launchReal()).toThrow();
  });
});
