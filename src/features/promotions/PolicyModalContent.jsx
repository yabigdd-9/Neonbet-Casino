import React from "react";
export default function PolicyModalContent({ page }) {
  if (!page) return null;
  return (
    <div className="p-5">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{page.eyebrow}</div>
      <h2 className="mt-1 text-3xl font-semibold">{page.title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {page.sections.map(([title, detail]) => (
          <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
