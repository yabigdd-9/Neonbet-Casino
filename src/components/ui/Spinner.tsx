// Inline spinner.
import React from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 18, className = "" }: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-white/30 border-t-cyan-300 ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
