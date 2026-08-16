// Reusable premium Button with consistent states.
import React from "react";

const VARIANTS = {
  primary: "bg-cyan-400 text-slate-950 shadow-neon hover:scale-[1.02]",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  outline: "border border-white/10 bg-transparent text-white hover:bg-white/10",
  danger: "bg-rose-400 text-white hover:scale-[1.02]",
  success: "bg-emerald-400 text-slate-950 hover:scale-[1.02]",
  ghost: "bg-transparent text-slate-300 hover:bg-white/10 hover:text-white",
};

const SIZES = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base font-black",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-black transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/60";
  return (
    <button
      className={`${base} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
