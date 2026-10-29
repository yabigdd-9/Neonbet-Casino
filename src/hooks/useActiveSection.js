import { useEffect, useState } from "react";
export function useActiveSection() {
  const [active, setActive] = useState("lobby");
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    const root = document.querySelector("main");
    if (!root) return;
    let disposed = false;
    const observed = new Set();
    const visible = new Map();
    function updateActive() {
      const sections = [...visible.values()].sort(
        (a, b) =>
          Math.abs(a.getBoundingClientRect().top - 100) - Math.abs(b.getBoundingClientRect().top - 100),
      );
      setActive(sections[0]?.id || "lobby");
    }
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (disposed) return;
        for (const entry of entries) {
          if (!observed.has(entry.target)) continue;
          if (entry.isIntersecting) visible.set(entry.target.id, entry.target);
          else visible.delete(entry.target.id);
        }
        updateActive();
      },
      { rootMargin: "-80px 0px -35% 0px" },
    );
    function syncSections() {
      if (disposed) return;
      const current = new Set(root.querySelectorAll("section[id]"));
      for (const section of observed) {
        if (current.has(section)) continue;
        observer.unobserve(section);
        observed.delete(section);
        visible.delete(section.id);
      }
      for (const section of current) {
        if (observed.has(section)) continue;
        observed.add(section);
        observer.observe(section);
      }
      updateActive();
    }
    syncSections();
    // The catalogue and signed-in panels may mount after the first render.
    const containsSection = (node) =>
      node.nodeType === 1 && (node.matches("section[id]") || node.querySelector("section[id]"));
    const changes = window.MutationObserver
      ? new window.MutationObserver((records) => {
          if (records.some((record) => [...record.addedNodes, ...record.removedNodes].some(containsSection)))
            syncSections();
        })
      : null;
    changes?.observe(root, { childList: true, subtree: true });
    return () => {
      disposed = true;
      changes?.disconnect();
      observer.disconnect();
    };
  }, []);
  return active;
}
