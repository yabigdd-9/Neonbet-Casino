// Reusable premium Button with consistent states.
import React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-neon",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  outline: "border border-white/20 text-white hover:bg-white/10",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
  success: "bg-emerald-500 text-white hover:bg-emerald-400",
  ghost: "bg-white/5 text-slate-300 hover:bg-white/10",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
