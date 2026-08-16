// Card primitive.
import React from "react";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.06] ${className}`} {...props}>
      {children}
    </div>
  );
}
