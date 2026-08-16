// Status badge bound to the centralised status styles/labels.
import React from "react";
import type { StatusLike } from "../../types";
import { statusStyle, statusLabel } from "../../lib/status";

interface StatusBadgeProps {
  status: StatusLike | string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const normalized = status as StatusLike;
  const text = label || statusLabel(normalized);
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusStyle(
        normalized,
      )} ${className}`}
    >
      {text}
    </span>
  );
}
