import React from "react";
import { Activity, ArrowRight } from "lucide-react";
import { formatMoney } from "../../lib/storage";

function netCredits(cents) {
  return `${cents > 0 ? "+" : cents < 0 ? "−" : ""}${formatMoney(Math.abs(cents) / 100)}`;
}

export default function SessionOverview({ wallet, onExplore }) {
  const rounds = wallet.history || [];
  const staked = rounds.reduce((total, round) => total + round.stakeCents, 0);
  const returned = rounds.reduce((total, round) => total + round.winCents, 0);
  const stats = [
    ["Rounds shown", String(rounds.length)],
    ["Staked credits", formatMoney(staked / 100)],
    ["Returned credits", formatMoney(returned / 100)],
    ["Net credits", netCredits(returned - staked)],
  ];

  function roundList(items) {
    return items.map((round) => (
      <li key={round.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="min-w-0 break-words font-semibold text-slate-100">
            {round.gameTitle || round.gameId}
          </span>
          <span className="text-sm tabular-nums text-slate-300">
            Net {netCredits(round.winCents - round.stakeCents)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Stake {formatMoney(round.stakeCents / 100)} · Returned {formatMoney(round.winCents / 100)}
        </p>
      </li>
    ));
  }

  return (
    <section id="vip" aria-labelledby="session-title" className="scroll-mt-24 grid gap-5 xl:grid-cols-2">
      <div className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 to-indigo-500/10 p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          <Activity size={16} aria-hidden="true" /> Browser activity
        </div>
        <h2 id="session-title" className="mt-3 text-2xl font-semibold">
          Your session
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Totals cover your latest 10 completed rounds, or all completed rounds if you have played fewer.
        </p>
        <dl aria-label="Recent-round totals" className="mt-5 grid grid-cols-2 gap-3">
          {stats.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <dt className="text-sm text-slate-400">{label}</dt>
              <dd className="mt-2 break-words text-2xl font-semibold tabular-nums text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-5 text-slate-400">
          Simulated credits have no cash value. Round totals exclude daily and referral credits. This history
          resets when you reload the page.
        </p>
        {wallet.busy && (
          <p
            role="status"
            className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm text-cyan-100"
          >
            A round is settling. It will appear here when complete.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 md:p-6">
        <h3 className="text-lg font-semibold">Completed rounds</h3>
        {rounds.length ? (
          <>
            <ol aria-label="Completed session rounds" className="mt-4 space-y-2">
              {roundList(rounds.slice(0, 5))}
            </ol>
            {rounds.length > 5 && (
              <details className="mt-3">
                <summary className="min-h-11 cursor-pointer rounded-xl px-3 py-3 text-sm font-semibold text-cyan-200 hover:bg-white/5">
                  Show {rounds.length - 5} earlier rounds
                </summary>
                <ol start={6} aria-label="Earlier session rounds" className="mt-2 space-y-2">
                  {roundList(rounds.slice(5))}
                </ol>
              </details>
            )}
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-5">
            <p className="font-semibold text-slate-200">No completed rounds yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Open a game and complete a round to see its stake, returned credits and net result here. Opening
              a game does not use any credits.
            </p>
            <a
              href="#featured-games"
              onClick={(event) => {
                if (onExplore) {
                  event.preventDefault();
                  onExplore();
                }
              }}
              className="secondary-button mt-4 inline-flex min-h-11 items-center gap-2"
            >
              Explore games <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
