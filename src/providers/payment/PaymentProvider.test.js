import { describe, it, expect } from 'vitest';
import { MockPaymentProvider, PaymentProvider } from './PaymentProvider.js';

describe('MockPaymentProvider', () => {
  it('creates a simulated deposit and stores it', () => {
    const provider = new MockPaymentProvider();
    const record = provider.createDeposit({ amount: 100, asset: 'USDT' });
    expect(record.status).toBe('simulated');
    expect(record.id).toMatch(/^mock-deposit-/);
    expect(record.amount).toBe(100);
  });

  it('creates a simulated withdrawal and stores it', () => {
    const provider = new MockPaymentProvider();
    const record = provider.createWithdrawal({ amount: 50, address: '0xabc' });
    expect(record.status).toBe('simulated');
    expect(record.id).toMatch(/^mock-withdrawal-/);
    expect(record.address).toBe('0xabc');
  });

  it('retrieves a created transaction by id', () => {
    const provider = new MockPaymentProvider();
    const record = provider.createDeposit({ amount: 25 });
    expect(provider.getTransaction(record.id)).toBe(record);
  });

  it('returns null for an unknown transaction id', () => {
    const provider = new MockPaymentProvider();
    expect(provider.getTransaction('does-not-exist')).toBeNull();
  });

  it('throws on webhook verification', () => {
    const provider = new MockPaymentProvider();
    expect(() => provider.verifyWebhook()).toThrow();
  });
});

describe('PaymentProvider base class', () => {
  it('throws on unimplemented methods', () => {
    const base = new PaymentProvider();
    expect(() => base.createDeposit({})).toThrow();
    expect(() => base.createWithdrawal({})).toThrow();
    expect(() => base.getTransaction('x')).toThrow();
    expect(() => base.verifyWebhook()).toThrow();
  });
});
