import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ enabled: true, getSession: vi.fn(), subscribe: vi.fn(), cleanup: vi.fn(), listener: null }));
vi.mock("../services/auth.service", () => ({ get hasSupabaseConfig() { return state.enabled; }, getSession: state.getSession, onAuthChange: state.subscribe }));
import useAccountSession from "./useAccountSession";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, host;
function Session({ onSession, onError }) { useAccountSession(onSession, onError); return null; }
beforeEach(() => {
  vi.resetAllMocks();
  state.enabled = true;
  state.subscribe.mockImplementation((listener) => { state.listener = listener; return state.cleanup; });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
it("ignores a stale initial session after a newer sign-out event", async () => {
  let resolve;
  state.getSession.mockReturnValue(new Promise((r) => { resolve = r; }));
  const onSession = vi.fn();
  act(() => root.render(<Session onSession={onSession} onError={vi.fn()} />));
  act(() => state.listener(null, "SIGNED_OUT"));
  await act(async () => resolve({ user: { id: "stale" } }));
  expect(onSession).toHaveBeenCalledExactlyOnceWith(null, "SIGNED_OUT");
});
it("uses fresh callbacks without creating duplicate subscriptions", async () => {
  state.getSession.mockResolvedValue(null);
  const first = vi.fn(), next = vi.fn();
  await act(async () => root.render(<Session onSession={first} onError={vi.fn()} />));
  act(() => root.render(<Session onSession={next} onError={vi.fn()} />));
  act(() => state.listener({ id: "current" }, "SIGNED_IN"));
  expect(next).toHaveBeenCalledWith({ id: "current" }, "SIGNED_IN");
  expect(state.subscribe).toHaveBeenCalledOnce();
  act(() => root.render(null));
  expect(state.cleanup).toHaveBeenCalledOnce();
});
it("handles session rejection and does not report errors after unmount", async () => {
  state.getSession.mockRejectedValue(new Error("private error"));
  const onError = vi.fn();
  await act(async () => root.render(<Session onSession={vi.fn()} onError={onError} />));
  expect(onError).toHaveBeenCalledExactlyOnceWith();
  act(() => root.render(null));
  act(() => state.listener(null, "SIGNED_OUT"));
  expect(onError).toHaveBeenCalledOnce();
});
