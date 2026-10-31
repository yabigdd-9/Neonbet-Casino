import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cancelPendingNavigation, scrollToSection } from "./navigation";

let main;
let scroll;
beforeEach(() => {
  vi.useFakeTimers();
  main = document.createElement("main");
  document.body.append(main);
  scroll = vi.fn();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false })),
  );
});
afterEach(() => {
  cancelPendingNavigation();
  main.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function addSection(id, parent = main) {
  const section = document.createElement("section");
  section.id = id;
  section.scrollIntoView = scroll;
  const input = document.createElement("input");
  section.append(input);
  parent.append(section);
  return { section, input };
}

it("scrolls immediately to a mounted section without changing focus unless requested", () => {
  const { input } = addSection("providers");
  scrollToSection("providers");
  expect(scroll).toHaveBeenLastCalledWith({ behavior: "smooth", block: "start" });
  expect(document.activeElement).not.toBe(input);
  scrollToSection("providers", true);
  expect(document.activeElement).toBe(input);
});

it("honors a search request when the catalogue mounts later and then releases its observer", async () => {
  scrollToSection("providers", true);
  expect(vi.getTimerCount()).toBe(1);
  const wrapper = document.createElement("div");
  const { section, input } = addSection("providers", wrapper);
  main.append(wrapper);
  await Promise.resolve();
  expect(scroll).toHaveBeenCalledOnce();
  expect(document.activeElement).toBe(input);

  section.remove();
  addSection("providers");
  await Promise.resolve();
  expect(scroll).toHaveBeenCalledOnce();
});

it("uses the latest navigation request and never jumps back when an older section arrives", async () => {
  scrollToSection("providers", true);
  scrollToSection("arcade-games");
  expect(vi.getTimerCount()).toBe(1);
  const { input: oldInput } = addSection("providers");
  await Promise.resolve();
  expect(scroll).not.toHaveBeenCalled();
  const { input } = addSection("arcade-games");
  await Promise.resolve();
  expect(scroll).toHaveBeenCalledOnce();
  expect(document.activeElement).not.toBe(oldInput);
  expect(document.activeElement).not.toBe(input);
  expect(vi.getTimerCount()).toBe(0);
});

it("replaces a pending request with an immediately available destination", async () => {
  addSection("lobby");
  scrollToSection("providers", true);
  scrollToSection("lobby");
  addSection("providers");
  await Promise.resolve();
  expect(scroll).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it("expires a missing destination and supports explicit cleanup before an app unmount", async () => {
  scrollToSection("providers", true);
  vi.advanceTimersByTime(10000);
  addSection("providers");
  await Promise.resolve();
  expect(scroll).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);

  scrollToSection("account", true);
  cancelPendingNavigation();
  addSection("account");
  await Promise.resolve();
  expect(scroll).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it("respects reduced motion when a delayed destination arrives", async () => {
  window.matchMedia.mockReturnValue({ matches: true });
  scrollToSection("providers", true);
  addSection("providers");
  await Promise.resolve();
  expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
});

it("gracefully skips unavailable browser APIs or browser globals", () => {
  vi.stubGlobal("MutationObserver", undefined);
  expect(() => scrollToSection("providers")).not.toThrow();
  expect(vi.getTimerCount()).toBe(0);
  vi.stubGlobal("window", undefined);
  expect(() => scrollToSection("providers")).not.toThrow();
  vi.unstubAllGlobals();
  vi.stubGlobal("document", undefined);
  expect(() => scrollToSection("providers")).not.toThrow();
});
