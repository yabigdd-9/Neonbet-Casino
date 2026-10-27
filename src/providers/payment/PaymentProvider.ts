import { ProviderError } from "../contracts";
import type { PaymentAdapter, PaymentRecord, PaymentRequest } from "../contracts";
export abstract class PaymentProvider implements PaymentAdapter {
  readonly capabilities = { simulated: true, live: false };
  abstract createDeposit(request: PaymentRequest): Promise<PaymentRecord>;
  abstract createWithdrawal(request: PaymentRequest): Promise<PaymentRecord>;
  abstract getTransaction(id: string): Promise<PaymentRecord | null>;
  async verifyWebhook(): Promise<never> {
    throw new ProviderError("UNAVAILABLE", "Webhook verification requires a server-side adapter.");
  }
}
export class MockPaymentProvider extends PaymentProvider {
  private records = new Map<string, PaymentRecord>();
  private keys = new Map<string, PaymentRecord>();
  private create(kind: PaymentRecord["kind"], request: PaymentRequest): PaymentRecord {
    if (
      !Number.isSafeInteger(request.amountCents) ||
      request.amountCents <= 0 ||
      !/^[A-Z]{3}$/.test(request.currency) ||
      !request.idempotencyKey?.trim()
    )
      throw new ProviderError(
        "INVALID_REQUEST",
        "Use positive integer cents, a currency, and an idempotency key.",
      );
    const previous = this.keys.get(request.idempotencyKey);
    if (previous) {
      if (
        previous.amountCents !== request.amountCents ||
        previous.currency !== request.currency ||
        previous.kind !== kind
      )
        throw new ProviderError("CONFLICT", "Idempotency key already used with different input.");
      return { ...previous };
    }
    const record: PaymentRecord = {
      amountCents: request.amountCents,
      currency: request.currency,
      idempotencyKey: request.idempotencyKey,
      id: `mock-${kind}-${crypto.randomUUID()}`,
      kind,
      status: "simulated",
    };
    this.records.set(record.id, record);
    this.keys.set(request.idempotencyKey, record);
    return { ...record };
  }
  async createDeposit(request: PaymentRequest) {
    return this.create("deposit", request);
  }
  async createWithdrawal(request: PaymentRequest) {
    return this.create("withdrawal", request);
  }
  async getTransaction(id: string) {
    const record = this.records.get(id);
    return record ? { ...record } : null;
  }
}
export default MockPaymentProvider;
