import { describe, it, expect } from 'vitest';
import { validateWithdrawal } from './transactions.service.js';

describe('validateWithdrawal', () => {
  it('accepts a positive amount with an address of length >= 10', () => {
    expect(validateWithdrawal({ amount_usd: 50, payout_address: '1234567890' })).toBe(true);
    expect(validateWithdrawal({ amount_usd: 10.5, payout_address: '  abcdefghij  ' })).toBe(true);
  });

  it('rejects a zero or negative amount', () => {
    expect(validateWithdrawal({ amount_usd: 0, payout_address: '1234567890' })).toBe(false);
    expect(validateWithdrawal({ amount_usd: -5, payout_address: '1234567890' })).toBe(false);
  });

  it('rejects a non-finite amount', () => {
    expect(validateWithdrawal({ amount_usd: 'abc', payout_address: '1234567890' })).toBe(false);
    expect(validateWithdrawal({ amount_usd: NaN, payout_address: '1234567890' })).toBe(false);
  });

  it('rejects a short payout address', () => {
    expect(validateWithdrawal({ amount_usd: 50, payout_address: 'short' })).toBe(false);
  });

  it('rejects missing or empty payout address', () => {
    expect(validateWithdrawal({ amount_usd: 50 })).toBe(false);
    expect(validateWithdrawal({ amount_usd: 50, payout_address: '' })).toBe(false);
    expect(validateWithdrawal({ amount_usd: 50, payout_address: '   ' })).toBe(false);
  });

  it('rejects an empty request object', () => {
    expect(validateWithdrawal({})).toBe(false);
  });
});
