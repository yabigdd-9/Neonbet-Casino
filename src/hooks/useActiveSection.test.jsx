import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";

let intersection;
let main;
let lobby;
beforeEach(() => {
  main = document.createElement("main");
  lobby = document.createElement("section");
  lobby.id = "lobby";
  lobby.getBoundingClientRect = () => ({ top: 100 });
  main.append(lobby);
  document.body.append(main);
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback) {
        intersection = {
          callback,
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
        return intersection;
      }
    },
  );
});
afterEach(() => {
  cleanup();
  main.remove();
  vi.unstubAllGlobals();
});

it("tracks a lazy section, releases it when removed, and disconnects on unmount", async () => {
  const { result, unmount } = renderHook(() => useActiveSection());
  act(() => intersection.callback([{ target: lobby, isIntersecting: true }]));
  expect(result.current).toBe("lobby");
  expect(intersection.observe).toHaveBeenCalledWith(lobby);

  const container = document.createElement("div");
  const catalogue = document.createElement("section");
  catalogue.id = "providers";
  catalogue.getBoundingClientRect = () => ({ top: 110 });
  container.append(catalogue);
  await act(async () => main.append(container));
  await waitFor(() => expect(intersection.observe).toHaveBeenCalledWith(catalogue));

  lobby.getBoundingClientRect = () => ({ top: -1000 });
  act(() => intersection.callback([{ target: catalogue, isIntersecting: true }]));
  expect(result.current).toBe("providers");

  await act(async () => container.remove());
  await waitFor(() => expect(intersection.unobserve).toHaveBeenCalledWith(catalogue));
  expect(result.current).toBe("lobby");
  // A queued intersection for a removed node must not restore a dead target.
  act(() => intersection.callback([{ target: catalogue, isIntersecting: true }]));
  expect(result.current).toBe("lobby");

  const observations = intersection.observe.mock.calls.length;
  unmount();
  expect(intersection.disconnect).toHaveBeenCalledOnce();
  const late = document.createElement("section");
  late.id = "late-panel";
  await act(async () => main.append(late));
  expect(intersection.observe).toHaveBeenCalledTimes(observations);
});

it("does not rescan sections for game-card content updates", async () => {
  renderHook(() => useActiveSection());
  const scan = vi.spyOn(main, "querySelectorAll");
  const card = document.createElement("article");
  card.innerHTML = '<button type="button">Play</button>';
  await act(async () => lobby.append(card));
  await act(async () => card.querySelector("button").replaceChildren("Playing…"));
  await act(async () => card.remove());
  expect(scan).not.toHaveBeenCalled();
  scan.mockRestore();
});

it("keeps the default navigation state when IntersectionObserver is unavailable", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const { result } = renderHook(() => useActiveSection());
  expect(result.current).toBe("lobby");
});

it("still observes the initial page when MutationObserver is unavailable", () => {
  vi.stubGlobal("MutationObserver", undefined);
  const { result } = renderHook(() => useActiveSection());
  expect(intersection.observe).toHaveBeenCalledWith(lobby);
  lobby.id = "featured-games";
  act(() => intersection.callback([{ target: lobby, isIntersecting: true }]));
  expect(result.current).toBe("featured-games");
});
