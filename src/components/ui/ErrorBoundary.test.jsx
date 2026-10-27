import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, host;
beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
it("preserves healthy content", () => {
  act(() =>
    root.render(
      <ErrorBoundary>
        <p>Content</p>
      </ErrorBoundary>,
    ),
  );
  expect(host.textContent).toBe("Content");
});
it("shows an accessible recovery screen without exception details", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function Broken() {
    throw new Error("private internal details");
  }
  act(() =>
    root.render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    ),
  );
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
  expect(host.querySelector("h1").textContent).toBe("This page couldn’t load");
  expect(host.querySelector("button").textContent).toBe("Reload page");
  expect(host.textContent).not.toContain("private internal details");
});
