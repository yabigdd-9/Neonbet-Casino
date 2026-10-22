import React, { createContext, useContext, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const openPanels = [];
const panelDepths = new WeakMap();
const ModalDepth = createContext(0);
let previousOverflow;
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, eyebrow, onClose, children, maxWidth = "max-w-4xl", footer }) {
  const depth = useContext(ModalDepth) + 1;
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    const panel = panelRef.current;
    const previousFocus = document.activeElement;
    if (!openPanels.length) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    panelDepths.set(panel, depth);
    openPanels.push(panel);
    openPanels.sort((a, b) => panelDepths.get(a) - panelDepths.get(b));
    const isTopPanel = () => openPanels.at(-1) === panel;
    const focusable = () => [...panel.querySelectorAll(focusableSelector)].filter(
      (element) => element.tabIndex >= 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(element).display !== "none" && getComputedStyle(element).visibility !== "hidden"
    );
    function onKey(event) {
      if (!isTopPanel()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current?.();
      }
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          panel.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    function onFocus(event) {
      if (isTopPanel() && !panel.contains(event.target)) panel.focus();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    if (isTopPanel()) panel.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      const wasTop = isTopPanel();
      openPanels.splice(openPanels.indexOf(panel), 1);
      if (!openPanels.length) document.body.style.overflow = previousOverflow;
      if (wasTop) {
        const remainingPanel = openPanels.at(-1);
        if (remainingPanel && !remainingPanel.contains(previousFocus)) remainingPanel.focus();
        else if (previousFocus?.isConnected) previousFocus.focus();
      }
    };
  }, []);

  return createPortal(
    <ModalDepth.Provider value={depth}>
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && openPanels.at(-1) === panelRef.current) closeRef.current?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title || eyebrow ? titleId : undefined}
        aria-label={!title && !eyebrow ? "Dialog" : undefined}
        tabIndex={-1}
        className={`flex max-h-[calc(100dvh-2rem)] w-full min-w-0 flex-col ${maxWidth} overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 text-white shadow-neon outline-none`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 p-5">
          <div className="min-w-0 break-words">
            {eyebrow && <div id={!title ? titleId : undefined} className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</div>}
            {title && <h2 id={titleId} className="mt-1 text-2xl font-black">{title}</h2>}
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-2xl bg-white/10 p-3 text-white hover:bg-white/15" aria-label="Close dialog">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-white/10 p-5">{footer}</div>}
      </div>
    </div>
    </ModalDepth.Provider>,
    document.body
  );
}
