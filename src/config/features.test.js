import { describe, it, expect } from 'vitest';
import { features } from './features.js';

describe('feature flags', () => {
  it('is a non-empty object of boolean-ish flags', () => {
    expect(typeof features).toBe('object');
    expect(Object.keys(features).length).toBeGreaterThan(0);
  });

  it('keeps real-money features disabled by default', () => {
    expect(features.liveWallet).toBe(false);
    expect(features.payments).toBe(false);
    expect(features.casinoProviders).toBe(false);
  });

  it('enables the local simulation surfaces by default', () => {
    expect(features.demoGames).toBe(true);
    expect(features.withdrawals).toBe(true);
    expect(features.account).toBe(true);
  });
});
