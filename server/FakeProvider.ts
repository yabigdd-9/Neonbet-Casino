// Local contract harness only. Never imported by the browser or deployed as a payment service.
import { createHmac, timingSafeEqual } from "node:crypto";
import { ProviderError } from "../src/providers/contracts";
import type { PaymentRecord } from "../src/providers/contracts";
import { MockPaymentProvider } from "../src/providers/payment/PaymentProvider";
export class FakeProvider extends MockPaymentProvider {
  private events = new Map<string, string>();
  private statuses = new Map<string, PaymentRecord["status"]>();
  constructor(private readonly secret: string) {
    super();
    if (!secret) throw new Error("A test-only signing secret is required.");
  }
  sign(raw: string) {
    return createHmac("sha256", this.secret).update(raw).digest("hex");
  }
  async receive(raw: string, signature: string) {
    const expected = Buffer.from(this.sign(raw), "hex");
    if (!/^[a-f0-9]{64}$/i.test(signature)) throw new ProviderError("INVALID_SIGNATURE", "Invalid signature");
    const actual = Buffer.from(signature, "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
      throw new ProviderError("INVALID_SIGNATURE", "Invalid signature");
    let event: { id?: string; transactionId?: string; status?: string };
    try {
      event = JSON.parse(raw);
    } catch {
      throw new ProviderError("INVALID_REQUEST", "Invalid JSON");
    }
    if (
      !event ||
      typeof event.id !== "string" ||
      typeof event.transactionId !== "string" ||
      !["completed", "failed"].includes(event.status || "")
    )
      throw new ProviderError("INVALID_REQUEST", "Invalid event");
    const previous = this.events.get(event.id);
    if (previous) {
      if (previous !== raw) throw new ProviderError("CONFLICT", "Event ID reused");
      return { duplicate: true };
    }
    if (!(await this.getTransaction(event.transactionId)))
      throw new ProviderError("RETRYABLE", "Transaction not yet available");
    const status = this.statuses.get(event.transactionId);
    if (status && status !== event.status)
      throw new ProviderError("CONFLICT", "Terminal status cannot change");
    this.statuses.set(event.transactionId, event.status as PaymentRecord["status"]);
    this.events.set(event.id, raw);
    return { duplicate: false };
  }
  override async getTransaction(id: string) {
    const row = await super.getTransaction(id);
    return row ? { ...row, status: this.statuses.get(id) || row.status } : null;
  }
}
export async function retryTransient<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof ProviderError) || error.code !== "RETRYABLE" || attempt >= attempts) throw error;
    }
  }
}
