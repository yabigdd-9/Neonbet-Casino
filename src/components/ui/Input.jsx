// Input primitive with label + error association.
import React from "react";

export default function Input({ label, error, id, className = "", ...props }) {
  const inputId = id || props.name || label;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="text-sm font-bold text-slate-300">{label}</span>}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300/60 ${className}`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 rounded-xl border border-rose-300/20 bg-rose-400/10 p-2 text-sm text-rose-100">
          {error}
        </p>
      )}
    </label>
  );
}
