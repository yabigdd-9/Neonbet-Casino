import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useDemoWallet } from "./useDemoWallet";

it("keeps simulated balances and wagering progress separate by account within a session", () => {
  vi.useFakeTimers();
  try {
    const { result, rerender } = renderHook(({ id }) => useDemoWallet(id), { initialProps: { id: "alice" } });
    expect(result.current.balance).toBe(50);
    act(() => {
      result.current.start({ id: "coin-flip" }, 0.5);
    });
    expect(result.current.wageredCents).toBe(50);
    rerender({ id: "bob" });
    expect(result.current.balance).toBe(50);
    expect(result.current.wageredCents).toBe(0);
    act(() => vi.runAllTimers());
    expect(result.current.balance).toBe(50);
    rerender({ id: "alice" });
    expect(result.current.wageredCents).toBe(50);
  } finally {
    vi.useRealTimers();
  }
});
