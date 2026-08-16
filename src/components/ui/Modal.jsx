// Accessible modal with focus handling + Esc close.
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ title, eyebrow, onClose, children, maxWidth = "max-w-4xl", footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    // Move focus into the dialog.
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title || eyebrow || "Dialog"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`w-full ${maxWidth} overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 shadow-neon outline-none`}
      >
        {(title || eyebrow) && (
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              {eyebrow && <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</div>}
              {title && <h2 className="mt-1 text-2xl font-black">{title}</h2>}
            </div>
            <button type="button" onClick={onClose} className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/15" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[80vh]">{children}</div>
        {footer && <div className="border-t border-white/10 p-5">{footer}</div>}
      </div>
    </div>
  );
}
