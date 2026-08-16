// Loading skeleton block.
import React from "react";

export default function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-white/10 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}
