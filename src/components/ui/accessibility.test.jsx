import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Textarea from "./Textarea";
import { ToastProvider, useToast } from "../feedback/ToastProvider";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let host, root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.style.overflow = "";
  vi.useRealTimers();
});
const render = (element) => act(() => root.render(element));
const key = (value, shiftKey = false) => act(() => document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true })));

it("traps focus, blocks background focus, and restores the opener and scrolling", () => {
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  document.body.style.overflow = "auto";
  render(<Modal title="Details"><button>First</button><button>Last</button></Modal>);
  const panel = document.querySelector('[role="dialog"]');
  const buttons = panel.querySelectorAll("button");
  expect(document.activeElement).toBe(panel);
  expect(document.body.style.overflow).toBe("hidden");
  key("Tab", true);
  expect(document.activeElement).toBe(buttons[2]);
  key("Tab");
  expect(document.activeElement).toBe(buttons[0]);
  opener.focus();
  expect(document.activeElement).toBe(panel);
  render(null);
  expect(document.activeElement).toBe(opener);
  expect(document.body.style.overflow).toBe("auto");
  opener.remove();
});

it("keeps focus on rerender and calls the current close callback", () => {
  const firstClose = vi.fn(), nextClose = vi.fn();
  render(<Modal title="Details" onClose={firstClose}><input /></Modal>);
  const input = document.querySelector("input");
  input.focus();
  render(<Modal title="Updated" onClose={nextClose}><input /></Modal>);
  expect(document.activeElement).toBe(input);
  key("Escape");
  expect(firstClose).not.toHaveBeenCalled();
  expect(nextClose).toHaveBeenCalledOnce();
});

it("only dismisses the top dialog and retains scroll lock until all dialogs close", () => {
  const outerClose = vi.fn(), innerClose = vi.fn();
  const view = (inner) => <Modal title="Outer" onClose={outerClose}>{inner && <Modal title="Inner" onClose={innerClose} />}</Modal>;
  render(view(true));
  key("Escape");
  expect(innerClose).toHaveBeenCalledOnce();
  expect(outerClose).not.toHaveBeenCalled();
  render(view(false));
  expect(document.body.style.overflow).toBe("hidden");
  expect(document.activeElement).toBe(document.querySelector('[role="dialog"]'));
});

it("labels a dialog and provides a close button even without a heading", () => {
  render(<Modal />);
  expect(document.querySelector('[role="dialog"]').getAttribute("aria-label")).toBe("Dialog");
  expect(document.querySelector('[aria-label="Close dialog"]')).not.toBeNull();
});

describe.each([[Input, "input"], [Select, "select"], [Textarea, "textarea"]])("accessible fields", (Component, tag) => {
  it(`${tag} has unique IDs, associated errors, and preserves control props`, () => {
    const change = vi.fn();
    render(<><p id="hint">Hint</p><Component label="Name" name="name" error="Required" aria-describedby="hint" onChange={change} disabled /><Component label="Name" name="name" /></>);
    const [first, second] = host.querySelectorAll(tag);
    expect(first.id).not.toBe(second.id);
    expect(first.disabled).toBe(true);
    expect(first.getAttribute("name")).toBe("name");
    expect(first.getAttribute("aria-invalid")).toBe("true");
    expect(host.querySelector("label").htmlFor).toBe(first.id);
    const descriptions = first.getAttribute("aria-describedby").split(" ");
    expect(descriptions).toContain("hint");
    expect(document.getElementById(descriptions[1]).textContent).toBe("Required");
  });
});

it("keeps errors visible until dismissed and clears notification timers on unmount", () => {
  vi.useFakeTimers();
  function Controls() {
    const toast = useToast();
    return <button onClick={() => { toast.error("Error details"); toast.info("Information"); }}>Notify</button>;
  }
  render(<ToastProvider><Controls /></ToastProvider>);
  act(() => host.querySelector("button").click());
  act(() => vi.advanceTimersByTime(8001));
  expect(host.textContent).toContain("Error details");
  expect(host.textContent).not.toContain("Information");
  act(() => host.querySelector('[aria-label="Dismiss notification"]').click());
  expect(host.textContent).not.toContain("Error details");
  act(() => host.querySelector("button").click());
  render(null);
  expect(vi.getTimerCount()).toBe(0);
});
