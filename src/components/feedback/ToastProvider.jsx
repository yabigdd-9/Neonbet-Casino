// Lightweight toast/notification context.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const dismiss = useCallback((id) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, ttl = 8000) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message }]);
      if (type !== "error")
        timers.current.set(
          id,
          window.setTimeout(() => dismiss(id), ttl),
        );
      return id;
    },
    [dismiss],
  );

  const api = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
    warning: (message) => push("warning", message),
    info: (message) => push("info", message),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 sm:bottom-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 break-words rounded-2xl border bg-slate-950 px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === "success"
                ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100"
                : toast.type === "error"
                  ? "border-rose-300/30 bg-rose-400/15 text-rose-100"
                  : toast.type === "warning"
                    ? "border-amber-300/30 bg-amber-400/15 text-amber-100"
                    : "border-cyan-300/30 bg-cyan-400/15 text-cyan-100"
            }`}
          >
            <span className="min-w-0 flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg px-2 py-1 hover:bg-white/10"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { success() {}, error() {}, warning() {}, info() {}, dismiss() {} };
  return ctx;
}

export default ToastProvider;
