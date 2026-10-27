// Local simulated arcade game player (Dice / Plinko / Crash).
import React, { useState } from "react";
import { Play } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { formatMoney } from "../../lib/storage";
import { betOptions } from "../../lib/gameEngine";

const PLINKO_LANES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function ArcadeGameModal({ game, wallet, onClose }) {
  const [bet, setBet] = useState(0.5);
  const [cashOutTarget, setCashOutTarget] = useState(2);
  const { balance, busy, start } = wallet;
  const round =
    wallet.round?.gameId === game?.id
      ? wallet.round
      : { title: "Ready", detail: game?.rule || "", win: 0, visual: [4] };
  if (!game) return null;
  function playRound() {
    start(game, bet, Number(cashOutTarget));
  }

  return (
    <Modal title={game.title} eyebrow="Simulated arcade" onClose={onClose} maxWidth="max-w-5xl">
      <div className={`h-2 bg-gradient-to-r ${game.gradient}`} />
      <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] md:p-7">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{game.type}</div>
              <h2 className="mt-2 text-3xl font-semibold">{game.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{game.rule} Balance is simulated in this browser.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/15"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/30 p-5">
            {game.id === "dice-duel" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {["Your dice", "House dice"].map((label, groupIndex) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="mb-3 text-sm font-semibold text-slate-300">{label}</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1].map((offset) => (
                        <div
                          key={offset}
                          className="grid aspect-square place-items-center rounded-3xl bg-white/10 text-5xl font-semibold"
                        >
                          {busy ? "?" : round.visual[groupIndex * 2 + offset] || "•"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {game.id === "plinko-drop" && (
              <div>
                <div className="grid grid-cols-9 gap-2">
                  {PLINKO_LANES.map((lane) => (
                    <div
                      key={lane}
                      className={`h-40 rounded-full border border-white/10 bg-white/[0.06] transition ${
                        round.visual.includes(lane) ? "shadow-neon ring-2 ring-cyan-300/70" : ""
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-9 gap-2 text-center text-xs font-semibold">
                  {["0x", ".4x", ".8x", "1.5x", "9x", "1.5x", ".8x", ".4x", "0x"].map((label, index) => (
                    <div key={`${label}-${index}`} className="rounded-xl bg-white/10 py-2 text-cyan-200">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {game.id === "neon-crash" && (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 to-indigo-950 p-6">
                <div className="absolute inset-x-0 bottom-0 h-px bg-cyan-300/60" />
                <div className="flex min-h-52 items-end justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-400">Cash-out target</div>
                    <div className="mt-2 text-5xl font-semibold text-cyan-300">
                      {Number(cashOutTarget).toFixed(2)}x
                    </div>
                  </div>
                  <div
                    className={`text-7xl transition ${busy ? "translate-x-3 -translate-y-8 rotate-12" : ""}`}
                  >
                    🚀
                  </div>
                </div>
                <label className="mt-6 block">
                  <span className="text-sm font-bold text-slate-300">Target multiplier</span>
                  <input
                    disabled={busy}
                    type="range"
                    min="1.25"
                    max="6"
                    step="0.25"
                    value={cashOutTarget}
                    onChange={(event) => setCashOutTarget(Number(event.target.value))}
                    className="mt-3 w-full accent-cyan-400"
                  />
                </label>
              </div>
            )}

            <div
              role="status"
              className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center"
            >
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                {round.title}
              </div>
              <div
                className={
                  round.win > 0
                    ? "mt-1 text-3xl font-semibold text-cyan-300"
                    : "mt-1 text-3xl font-semibold text-slate-300"
                }
              >
                {round.win > 0 ? `+${formatMoney(round.win)}` : formatMoney(0)}
              </div>
              <p className="mt-2 text-sm text-slate-400">{round.detail}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Simulated balance
            </div>
            <div className="mt-1 text-4xl font-semibold text-white">{formatMoney(balance)}</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {betOptions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  disabled={busy}
                  onClick={() => setBet(amount)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                    bet === amount
                      ? "border-cyan-300/40 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {formatMoney(amount)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={playRound}
              disabled={busy || balance < bet}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-semibold text-slate-950 shadow-neon transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={18} />
              {busy ? "Playing..." : `Play ${formatMoney(bet)}`}
            </button>
            {balance < bet && <p className="mt-3 text-sm text-amber-200">Balance is too low for this bet.</p>}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <h3 className="font-semibold">Game Rules</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {game.id === "dice-duel" && (
                <>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">Beat the house total to win 2x.</p>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">Tie returns 1x.</p>
                </>
              )}
              {game.id === "plinko-drop" && (
                <>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">The center lane pays 9x.</p>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">Outer lanes are riskier and may miss.</p>
                </>
              )}
              {game.id === "neon-crash" && (
                <>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">Lower targets hit more often.</p>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">
                    If the crash point is below target, the round loses.
                  </p>
                </>
              )}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              This is simulated browser gameplay only. It is not connected to deposits, withdrawals, or
              real-money wagering.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
