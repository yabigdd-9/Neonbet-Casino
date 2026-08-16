// Lightweight toast/notification context.
import React, { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => number;
  error: (message: string) => number;
  warning: (message: string) => number;
  info: (message: string) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let nextId = 1;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string, ttl = 3200) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => dismiss(id), ttl);
      return id;
    },
    [dismiss],
  );

  const api: ToastApi = {
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

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx)
    return { success: () => 0, error: () => 0, warning: () => 0, info: () => 0, dismiss: () => {} };
  return ctx;
}

export default ToastProvider;
