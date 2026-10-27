export function scrollToSection(id, focus = false) {
  const target = document.getElementById(id);
  target?.scrollIntoView({
    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
  if (focus) target?.querySelector("input")?.focus({ preventScroll: true });
}
