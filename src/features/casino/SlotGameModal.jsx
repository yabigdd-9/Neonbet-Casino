// Local simulated slot player. Balance + session state are passed in.
import React, { useState } from "react";
import { Play } from "lucide-react";
import { useGameSound } from "../../hooks/useGameSound";
import GameSoundButton from "../../components/ui/GameSoundButton";
import RoundHistory from "../../components/ui/RoundHistory";
import Modal from "../../components/ui/Modal";
import { betOptions, slotRules } from "../../lib/gameEngine";
import { formatMoney } from "../../lib/storage";

export default function SlotGameModal({ game, wallet, onClose, initialBet = 0.5 }) {
  const sound = useGameSound();
  const [bet, setBet] = useState(() => (betOptions.includes(initialBet) ? initialBet : 0.5));
  const [playError, setPlayError] = useState("");
  const { balance, busy: spinning, start } = wallet;
  const settled = wallet.round?.gameId === game?.title ? wallet.round : null;
  const reels = settled?.reels || game?.symbols?.slice(0, 5) || ["7", "7", "7", "7", "7"];
  const result = settled || { label: "Ready", win: 0 };
  if (!game) return null;
  function spin() {
    setPlayError("");
    if (start(game, bet)) sound.play();
    else
      setPlayError("The round could not start. No credits were used. Choose an affordable bet or try again.");
  }

  return (
    <Modal title={game.title} eyebrow="Simulated slot" onClose={onClose} maxWidth="max-w-4xl">
      <div className={`h-2 bg-gradient-to-r ${game.gradient}`} />
      <div className="grid gap-6 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-7">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                {slotRules(game).name}
              </div>
              <h2 className="mt-2 text-3xl font-semibold">{game.title}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {game.provider
                  ? `${game.provider} themed local slot session. Balance is simulated in this browser.`
                  : "High-frequency local slot session. Balance is simulated in this browser."}
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

          <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/30 p-4">
            <div className="grid grid-cols-5 gap-2">
              {reels.map((symbol, index) => (
                <div
                  key={`${symbol}-${index}`}
                  className={`grid aspect-square place-items-center rounded-3xl border border-white/10 bg-white/10 text-4xl font-semibold transition ${
                    spinning ? "scale-95 animate-pulse text-cyan-200" : "text-white"
                  }`}
                >
                  {spinning ? "·" : symbol}
                </div>
              ))}
            </div>
            <div
              role="status"
              className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center"
            >
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                {result.label}
              </div>
              {result.bonusRounds && (
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p>Base spin: {result.baseMultiplier}x · 3 bonus spins included at no extra cost</p>
                  {result.bonusRounds.map((bonus, index) => (
                    <p key={index}>
                      Bonus {index + 1}: {bonus.reels.join(" ")} — {bonus.multiplier}x
                    </p>
                  ))}
                  <p>Total payout includes the base spin and all bonus spins.</p>
                </div>
              )}
              <div
                className={
                  result.win > 0
                    ? "mt-1 text-3xl font-semibold text-cyan-300"
                    : "mt-1 text-3xl font-semibold text-slate-300"
                }
              >
                {result.win > 0 ? `+${formatMoney(result.win)}` : "$0.00"}
              </div>
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
                  disabled={spinning}
                  aria-pressed={bet === amount}
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
              onClick={spin}
              disabled={spinning || balance < bet}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-semibold text-slate-950 shadow-neon transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={18} />
              {spinning ? "Spinning..." : `Spin ${formatMoney(bet)}`}
            </button>
            {playError && (
              <p role="alert" className="mt-3 text-sm text-amber-200">
                {playError}
              </p>
            )}
            <GameSoundButton sound={sound} />
            <RoundHistory rounds={wallet.history} />
            {balance < bet && (
              <p className="mt-3 text-sm text-amber-200">
                Balance is too low for this bet. Choose a lower bet or return to your session balance.
              </p>
            )}
            <button type="button" className="secondary-button mt-3 min-h-11" onClick={onClose}>
              Back to lobby
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <h3 className="font-semibold">Payout Table</h3>
            <div className="mt-3 space-y-2">
              {slotRules(game).payouts.map(([label, payout]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="text-slate-300">{label}</span>
                  <span className="font-semibold text-cyan-300">{payout}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              {slotRules(game).detail} This is a simulated browser game with no cash value.
              {game.provider ? ` ${game.provider} is shown as a lobby theme only.` : ""}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
