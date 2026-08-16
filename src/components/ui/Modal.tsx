// Accessible modal with focus handling + Esc close.
import React, { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title?: string;
  eyebrow?: string;
  onClose: () => void;
  children?: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  title,
  eyebrow,
  onClose,
  children,
  maxWidth = "max-w-3xl",
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={`w-full ${maxWidth} rounded-[2rem] border border-white/10 bg-slate-950 p-5 outline-none shadow-2xl md:p-7`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                {eyebrow}
              </div>
            )}
            {title && <h2 className="mt-1 text-2xl font-black md:text-3xl">{title}</h2>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/15"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
