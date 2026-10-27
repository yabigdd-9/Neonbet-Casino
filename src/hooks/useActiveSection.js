import { useEffect, useState } from "react";
export function useActiveSection() {
  const [active, setActive] = useState("lobby");
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.target);
          else visible.delete(entry.target.id);
        }
        const sections = [...visible.values()].sort(
          (a, b) =>
            Math.abs(a.getBoundingClientRect().top - 100) - Math.abs(b.getBoundingClientRect().top - 100),
        );
        if (sections[0]) setActive(sections[0].id);
      },
      { rootMargin: "-80px 0px -35% 0px" },
    );
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return active;
}
