import React from "react";
import { formatMoney } from "../../lib/storage";
export default function RoundHistory({ rounds = [] }) {
  if (!rounds.length) return null;
  return (
    <details className="mt-4 rounded-2xl border border-white/10 p-4 text-sm">
      <summary className="cursor-pointer font-semibold text-slate-200">Recent rounds</summary>
      <ol className="mt-3 space-y-2" aria-label="Recent rounds">
        {rounds.slice(0, 5).map((round) => (
          <li
            key={round.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 p-3"
          >
            <span className="text-slate-300">{round.gameTitle || round.gameId}</span>
            <span className="text-slate-400">
              Stake {formatMoney(round.stakeCents / 100)} · Returned {formatMoney(round.winCents / 100)}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}
