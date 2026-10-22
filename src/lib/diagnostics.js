// Tab-local diagnostics: fixed codes only, never exception text, URLs or user data.
const STORAGE_KEY = "neonbet-diagnostics";
const CODES = new Set(["runtime_error", "unhandled_rejection", "render_error", "session_error", "logout_error"]);
const MAX_EVENTS = 20;

export function getDiagnostics() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((event) => event && CODES.has(event.code) && Number.isFinite(event.time))
      .slice(-MAX_EVENTS).map(({ code, time }) => ({ code, time }));
  } catch { return []; }
}

export function reportClientError(code) {
  if (!CODES.has(code)) return;
  try {
    const events = [...getDiagnostics(), { code, time: Date.now() }].slice(-MAX_EVENTS);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch { /* Diagnostics must never break the application. */ }
}

export function installErrorMonitoring() {
  const onError = () => reportClientError("runtime_error");
  const onRejection = () => reportClientError("unhandled_rejection");
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
