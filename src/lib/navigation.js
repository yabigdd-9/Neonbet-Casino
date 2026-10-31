let pendingNavigation = null;

export function cancelPendingNavigation() {
  pendingNavigation?.();
}

export function scrollToSection(id, focus = false) {
  // A second destination must replace a request still waiting for a lazy panel.
  cancelPendingNavigation();
  if (typeof window === "undefined" || typeof document === "undefined") return;

  function navigate(target) {
    target.scrollIntoView({
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    if (focus) target.querySelector("input")?.focus({ preventScroll: true });
  }

  const target = document.getElementById(id);
  if (target) {
    navigate(target);
    return;
  }

  const root = document.querySelector("main") || document.body;
  if (!root || !window.MutationObserver) return;
  let cancelled = false;
  const observer = new window.MutationObserver(() => {
    if (cancelled) return;
    const mountedTarget = document.getElementById(id);
    if (mountedTarget) {
      cancel();
      navigate(mountedTarget);
    }
  });
  const timeout = window.setTimeout(cancel, 10000);
  function cancel() {
    cancelled = true;
    observer.disconnect();
    window.clearTimeout(timeout);
    if (pendingNavigation === cancel) pendingNavigation = null;
  }
  pendingNavigation = cancel;
  observer.observe(root, { childList: true, subtree: true });
}
