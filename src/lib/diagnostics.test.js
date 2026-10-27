import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getDiagnostics, reportClientError, installErrorMonitoring } from "./diagnostics";

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.restoreAllMocks());

it("stores only whitelisted codes and timestamps, capped at twenty events", () => {
  reportClientError("private@example.test");
  for (let i = 0; i < 25; i++) reportClientError("session_error");
  expect(getDiagnostics()).toHaveLength(20);
  expect(Object.keys(getDiagnostics()[0]).sort()).toEqual(["code", "time"]);
  expect(sessionStorage.getItem("neonbet-diagnostics")).not.toContain("private@");
});

it("discards unrecognized fields when reading previous events", () => {
  sessionStorage.setItem(
    "neonbet-diagnostics",
    JSON.stringify([{ code: "render_error", time: 123, token: "private" }]),
  );
  expect(getDiagnostics()).toEqual([{ code: "render_error", time: 123 }]);
});

it("does not fail when session storage is unavailable", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(() => reportClientError("render_error")).not.toThrow();
});

it("records global error codes without storing exception text and removes listeners", () => {
  const stop = installErrorMonitoring();
  window.dispatchEvent(new ErrorEvent("error", { message: "private@example.test" }));
  window.dispatchEvent(new Event("unhandledrejection"));
  stop();
  window.dispatchEvent(new Event("unhandledrejection"));
  expect(getDiagnostics().map(({ code }) => code)).toEqual(["runtime_error", "unhandled_rejection"]);
  expect(JSON.stringify(getDiagnostics())).not.toContain("private");
});
