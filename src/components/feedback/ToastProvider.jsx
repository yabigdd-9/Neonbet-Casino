// Lightweight toast/notification context.
import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, ttl = 3200) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => dismiss(id), ttl);
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
        className="fixed bottom-4 right-4 z-[60] flex w-72 flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm font-black shadow-lg ${
              toast.type === "success"
                ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100"
                : toast.type === "error"
                  ? "border-rose-300/30 bg-rose-400/15 text-rose-100"
                  : toast.type === "warning"
                    ? "border-amber-300/30 bg-amber-400/15 text-amber-100"
                    : "border-cyan-300/30 bg-cyan-400/15 text-cyan-100"
            }`}
          >
            {toast.message}
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
