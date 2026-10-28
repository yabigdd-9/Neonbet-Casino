import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useGameSound } from "./useGameSound";
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});
it("never starts audio by default and tolerates audio failure after opt-in", () => {
  const create = vi.fn(function () {
    throw new Error("audio blocked");
  });
  vi.stubGlobal("AudioContext", create);
  const { result, unmount } = renderHook(() => useGameSound());
  act(() => result.current.play());
  expect(create).not.toHaveBeenCalled();
  act(() => result.current.toggle());
  expect(result.current.enabled).toBe(true);
  expect(localStorage.getItem("neonbet:sound")).toBe("on");
  expect(create).toHaveBeenCalledTimes(1);
  act(() => result.current.toggle());
  expect(result.current.enabled).toBe(false);
  expect(localStorage.getItem("neonbet:sound")).toBe("off");
  unmount();
});
