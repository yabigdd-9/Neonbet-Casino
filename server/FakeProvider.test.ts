// @vitest-environment node
import { it, expect, vi } from "vitest";
import { FakeProvider, retryTransient } from "./FakeProvider";
import { ProviderError } from "../src/providers/contracts";
it("authenticates webhooks, deduplicates delivery and preserves terminal status", async () => {
  const provider = new FakeProvider("synthetic-fixture");
  const transaction = await provider.createDeposit({
    amountCents: 100,
    currency: "USD",
    idempotencyKey: "one",
  });
  const raw = JSON.stringify({ id: "event-1", transactionId: transaction.id, status: "completed" });
  await expect(provider.receive(raw, "invalid")).rejects.toMatchObject({ code: "INVALID_SIGNATURE" });
  await expect(provider.receive(raw, provider.sign(raw))).resolves.toEqual({ duplicate: false });
  await expect(provider.receive(raw, provider.sign(raw))).resolves.toEqual({ duplicate: true });
  expect((await provider.getTransaction(transaction.id))?.status).toBe("completed");
  const changed = JSON.stringify({ id: "event-2", transactionId: transaction.id, status: "failed" });
  await expect(provider.receive(changed, provider.sign(changed))).rejects.toMatchObject({ code: "CONFLICT" });
});
it("retries only transient failures and bounds attempts", async () => {
  const operation = vi
    .fn()
    .mockRejectedValueOnce(new ProviderError("RETRYABLE", "Later"))
    .mockResolvedValue("ok");
  expect(await retryTransient(operation)).toBe("ok");
  expect(operation).toHaveBeenCalledTimes(2);
  const permanent = vi.fn().mockRejectedValue(new ProviderError("INVALID_SIGNATURE", "Bad"));
  await expect(retryTransient(permanent)).rejects.toThrow("Bad");
  expect(permanent).toHaveBeenCalledTimes(1);
  const transient = vi.fn().mockRejectedValue(new ProviderError("RETRYABLE", "Later"));
  await expect(retryTransient(transient)).rejects.toThrow("Later");
  expect(transient).toHaveBeenCalledTimes(3);
});
