// Input primitive with label + error association.
import React, { useId } from "react";

export default function Input({ label, error, id, className = "", ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const description = [props["aria-describedby"], error ? `${inputId}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="text-sm font-bold text-slate-300">{label}</span>}
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={description}
        className={`mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300/60 ${className}`}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 rounded-xl border border-rose-300/20 bg-rose-400/10 p-2 text-sm text-rose-100">
          {error}
        </p>
      )}
    </label>
  );
}
