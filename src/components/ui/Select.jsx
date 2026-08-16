// Select primitive.
import React from "react";

export default function Select({ label, id, className = "", children, ...props }) {
  const inputId = id || props.name || label;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="text-sm font-bold text-slate-300">{label}</span>}
      <select
        id={inputId}
        className={`mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300/60 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
