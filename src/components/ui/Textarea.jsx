// Textarea primitive.
import React from "react";

export default function Textarea({ label, error, id, rows = 4, className = "", ...props }) {
  const inputId = id || props.name || label;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="text-sm font-bold text-slate-300">{label}</span>}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={`mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300/60 ${className}`}
        {...props}
      />
    </label>
  );
}
