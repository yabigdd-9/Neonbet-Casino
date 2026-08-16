// Empty state.
import React from "react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center text-slate-300">
      <p className="text-lg font-black text-white">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
