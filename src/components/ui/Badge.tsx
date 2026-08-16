// Badge primitive.
import React from "react";
import type { ReactNode } from "react";

interface BadgeProps {
  children?: ReactNode;
  className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200 ${className}`}
    >
      {children}
    </span>
  );
}
