// Input primitive with label + error association.
import React from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
}

export default function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id || props.name || label;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="text-sm font-bold text-slate-300">{label}</span>}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300/60 ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-rose-300">{error}</span>}
    </label>
  );
}
