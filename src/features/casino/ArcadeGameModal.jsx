// Local simulated arcade game player (Dice / Plinko / Crash).
import React, { useState } from "react";
import { Play } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { formatMoney } from "../../lib/storage";
import { betOptions } from "../../lib/gameEngine";

const PLINKO_MULTIPLIERS = [0, 0.4, 0.8, 1.5, 9, 1.5, 0.8, 0.4, 0];
const PLINKO_LANES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function ArcadeGameModal({ game, balance, setBalance, onClose }) {
  const [bet, setBet] = useState(0.5);
  const [cashOutTarget, setCashOutTarget] = useState(2);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState({
    title: "Ready",
    detail: game?.rule || "",
    win: 0,
    multiplier: 0,
    visual: game?.id === "plinko-drop" ? [4] : [],
  });

  if (!game) return null;

  function finishRound(nextRound) {
    const win = Number((bet * nextRound.multiplier).toFixed(2));
    setRound({ ...nextRound, win });
    setBalance((current) => Number((current + win).toFixed(2)));
    setBusy(false);
  }

  function playDice() {
    const player = [1, 2].map(() => Math.ceil(Math.random() * 6));
    const house = [1, 2].map(() => Math.ceil(Math.random() * 6));
    const playerTotal = player[0] + player[1];
    const houseTotal = house[0] + house[1];
    const multiplier = playerTotal > houseTotal ? 2 : playerTotal === houseTotal ? 1 : 0;
    finishRound({
      title: multiplier === 2 ? "Player wins" : multiplier === 1 ? "Push" : "House wins",
      detail: `You rolled ${player.join(" + ")} = ${playerTotal}. House rolled ${house.join(" + ")} = ${houseTotal}.`,
      multiplier,
      visual: [...player, ...house],
    });
  }

  function playPlinko() {
    const path = [4];
    for (let step = 0; step < 7; step += 1) {
      const drift = Math.random() > 0.5 ? 1 : -1;
      path.push(Math.max(0, Math.min(8, path[path.length - 1] + drift)));
    }
    const lane = path[path.length - 1];
    const multiplier = PLINKO_MULTIPLIERS[lane];
    finishRound({
      title: multiplier >= 1 ? "Chip landed hot" : "Chip missed",
      detail: `Lane ${lane + 1} paid ${multiplier}x.`,
      multiplier,
      visual: path,
    });
  }

  function playCrash() {
    const crashPoint = Number((1 + Math.random() * Math.random() * 8).toFixed(2));
    const target = Number(cashOutTarget);
    const multiplier = crashPoint >= target ? target : 0;
    finishRound({
      title: multiplier > 0 ? "Cashed out" : "Rocket crashed",
      detail:
        multiplier > 0
          ? `You cashed at ${target.toFixed(2)}x before ${crashPoint.toFixed(2)}x.`
          : `Crash hit at ${crashPoint.toFixed(2)}x before your ${target.toFixed(2)}x target.`,
      multiplier,
      visual: [crashPoint, target],
    });
  }

  function playRound() {
    if (busy || balance < bet) return;
    setBusy(true);
    setBalance((current) => Number((current - bet).toFixed(2)));
    setRound((current) => ({
      ...current,
      title: "Running",
      detail: "Neon math is moving...",
      win: 0,
    }));
    window.setTimeout(() => {
      if (game.id === "dice-duel") playDice();
      if (game.id === "plinko-drop") playPlinko();
      if (game.id === "neon-crash") playCrash();
    }, 550);
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-5xl">
      <div className={`h-2 bg-gradient-to-r ${game.gradient}`} />
      <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] md:p-7">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                {game.type}
              </div>
              <h2 className="mt-2 text-3xl font-black">{game.title}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {game.rule} Balance is simulated in this browser.
              </p>
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
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <div className="mb-3 text-sm font-black text-slate-300">{label}</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1].map((offset) => (
                        <div
                          key={offset}
                          className="grid aspect-square place-items-center rounded-3xl bg-white/10 text-5xl font-black"
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
                <div className="mt-4 grid grid-cols-9 gap-2 text-center text-xs font-black">
                  {["0x", ".4x", ".8x", "1.5x", "9x", "1.5x", ".8x", ".4x", "0x"].map(
                    (label, index) => (
                      <div
                        key={`${label}-${index}`}
                        className="rounded-xl bg-white/10 py-2 text-cyan-200"
                      >
                        {label}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {game.id === "neon-crash" && (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 to-indigo-950 p-6">
                <div className="absolute inset-x-0 bottom-0 h-px bg-cyan-300/60" />
                <div className="flex min-h-52 items-end justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-400">Cash-out target</div>
                    <div className="mt-2 text-5xl font-black text-cyan-300">
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

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                {round.title}
              </div>
              <div
                className={
                  round.win > 0
                    ? "mt-1 text-3xl font-black text-cyan-300"
                    : "mt-1 text-3xl font-black text-slate-300"
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
              Balance
            </div>
            <div className="mt-1 text-4xl font-black text-white">{formatMoney(balance)}</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {betOptions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setBet(amount)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-neon transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={18} />
              {busy ? "Playing..." : `Play ${formatMoney(bet)}`}
            </button>
            {balance < bet && (
              <p className="mt-3 text-sm text-amber-200">Balance is too low for this bet.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <h3 className="font-black">Game Rules</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {game.id === "dice-duel" && (
                <>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">
                    Beat the house total to win 2x.
                  </p>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">Tie returns 1x.</p>
                </>
              )}
              {game.id === "plinko-drop" && (
                <>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">The center lane pays 9x.</p>
                  <p className="rounded-2xl bg-black/20 px-3 py-2">
                    Outer lanes are riskier and may miss.
                  </p>
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
            <p className="mt-4 text-xs leading-5 text-slate-500">
              This is simulated browser gameplay only. It is not connected to deposits, withdrawals,
              or real-money wagering.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
