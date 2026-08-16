// Local simulated slot player. Balance + session state are passed in.
import React, { useState } from "react";
import { Play } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { buildSpin, betOptions, payoutRows } from "../../lib/gameEngine";
import { formatMoney } from "../../lib/storage";

export default function SlotGameModal({ game, balance, setBalance, onClose }) {
  const [bet, setBet] = useState(0.5);
  const [reels, setReels] = useState(game?.symbols?.slice(0, 5) || ["🍒", "⭐", "💎", "7", "🍋"]);
  const [displayReels, setDisplayReels] = useState(null);
  const [result, setResult] = useState({ label: "Ready", win: 0, multiplier: 0 });
  const [spinning, setSpinning] = useState(false);

  if (!game) return null;

  function randomSymbols(count) {
    const symbols = game.symbols || ["🍒", "⭐", "💎", "7", "🍋"];
    return Array.from({ length: count }, () => symbols[Math.floor(Math.random() * symbols.length)]);
  }

  function spin() {
    if (spinning || balance < bet) return;
    setSpinning(true);
    // Pre-compute the animated shuffle once (not during render) to keep the component pure.
    setDisplayReels(randomSymbols(5));
    setBalance((current) => Number((current - bet).toFixed(2)));

    window.setTimeout(() => {
      const spinResult = buildSpin(game);
      const win = Number((bet * spinResult.multiplier).toFixed(2));
      setReels(spinResult.reels);
      setDisplayReels(null);
      setResult({ label: spinResult.label, win, multiplier: spinResult.multiplier });
      setBalance((current) => Number((current + win).toFixed(2)));
      setSpinning(false);
    }, 650);
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-4xl">
      <div className={`h-2 bg-gradient-to-r ${game.gradient}`} />
      <div className="grid gap-6 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-7">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                {game.type}
              </div>
              <h2 className="mt-2 text-3xl font-black">{game.title}</h2>
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
                  className={`grid aspect-square place-items-center rounded-3xl border border-white/10 bg-white/10 text-4xl font-black transition ${
                    spinning ? "scale-95 animate-pulse text-cyan-200" : "text-white"
                  }`}
                >
                  {spinning ? displayReels[index] : symbol}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                {result.label}
              </div>
              <div
                className={
                  result.win > 0
                    ? "mt-1 text-3xl font-black text-cyan-300"
                    : "mt-1 text-3xl font-black text-slate-300"
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
              onClick={spin}
              disabled={spinning || balance < bet}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-neon transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={18} />
              {spinning ? "Spinning..." : `Spin ${formatMoney(bet)}`}
            </button>
            {balance < bet && (
              <p className="mt-3 text-sm text-amber-200">Balance is too low for this bet.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <h3 className="font-black">Payout Table</h3>
            <div className="mt-3 space-y-2">
              {payoutRows.map(([label, payout]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="text-slate-300">{label}</span>
                  <span className="font-black text-cyan-300">{payout}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              This is a simulated browser game with tuned frequent wins. It is not connected to
              deposits, withdrawals, or provider game servers.
              {game.provider ? ` ${game.provider} is shown as a lobby theme only.` : ""}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
