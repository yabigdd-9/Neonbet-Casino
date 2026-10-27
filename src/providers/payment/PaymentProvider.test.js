import { it, expect } from "vitest";
import { MockPaymentProvider } from "./PaymentProvider";
const request = { amountCents: 100, currency: "USD", idempotencyKey: "test-deposit" };
it("creates asynchronous simulated transactions idempotently", async () => {
  const provider = new MockPaymentProvider();
  const first = await provider.createDeposit(request);
  expect(await provider.createDeposit(request)).toEqual(first);
  expect(await provider.getTransaction(first.id)).toEqual(first);
  expect(await provider.getTransaction("missing")).toBeNull();
  expect(first.status).toBe("simulated");
  await expect(provider.createDeposit({ ...request, amountCents: 101 })).rejects.toMatchObject({
    code: "CONFLICT",
  });
  await expect(provider.createDeposit({ ...request, amountCents: 1.5 })).rejects.toMatchObject({
    code: "INVALID_REQUEST",
  });
  await expect(provider.verifyWebhook()).rejects.toMatchObject({ code: "UNAVAILABLE" });
  const withdrawal = await provider.createWithdrawal({ ...request, idempotencyKey: "test-withdrawal" });
  expect(withdrawal.kind).toBe("withdrawal");
});
