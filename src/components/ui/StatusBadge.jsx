// Status badge bound to the centralised status styles/labels.
import React from "react";
import { statusStyle, statusLabel } from "../../lib/status";

export default function StatusBadge({ status, label }) {
  const text = label || statusLabel(status);
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusStyle(status)}`}>
      {text}
    </span>
  );
}
