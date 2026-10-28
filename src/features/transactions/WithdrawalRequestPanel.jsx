// Manual withdrawal request panel.
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/ui/StatusBadge";
import { IS_SUPABASE } from "../../config/appMode";
import { DEMO_TARGET_CENTS, DEMO_WAGER_MULTIPLIER } from "../../config/demoBonus";

export default function WithdrawalRequestPanel({
  user,
  profile,
  latestWithdrawal,
  withdrawalSaving,
  onSubmitWithdrawal,
  error,
  demoWallet,
}) {
  const [amountUsd, setAmountUsd] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("USDT / BSC");
  const [payoutAddress, setPayoutAddress] = useState("");
  const verified = profile?.verification_status === "verified";
  const rolloverComplete = IS_SUPABASE
    ? Number(profile?.rollover_progress || 0) >= Number(profile?.rollover_required ?? 1000)
    : (demoWallet?.wageredCents || 0) >= DEMO_TARGET_CENTS;
  const canSubmit = user && amountUsd && Number(amountUsd) > 0 && payoutAddress.trim().length >= 10;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    const saved = await onSubmitWithdrawal({
      amount_usd: Number(amountUsd),
      payout_method: payoutMethod,
      payout_address: payoutAddress.trim(),
    });
    if (saved) {
      setAmountUsd("");
      setPayoutAddress("");
    }
  }

  return (
    <section
      id="withdrawals"
      className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-8"
    >
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            Manual withdrawals
          </div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Withdrawal Request</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            {IS_SUPABASE
              ? "Submit a manual request for account review."
              : "This form demonstrates a withdrawal request. Simulated credits cannot be withdrawn."}
          </p>
          {!IS_SUPABASE && (
            <p className="mt-2 text-sm text-cyan-200">Practice request only. No cryptocurrency is sent.</p>
          )}
        </div>
        {latestWithdrawal && (
          <StatusBadge status={latestWithdrawal.status} label={`Latest: ${latestWithdrawal.status}`} />
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Wallet size={18} /> Eligibility
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
              <span className="text-slate-300">Account verification</span>
              <span className={verified ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"}>
                {verified ? "Verified" : "Required"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
              <span className="text-slate-300">
                {IS_SUPABASE ? "Rollover" : `Simulated ${DEMO_WAGER_MULTIPLIER}× target`}
              </span>
              <span
                className={
                  rolloverComplete ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"
                }
              >
                {rolloverComplete ? "Complete" : "Review needed"}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            {IS_SUPABASE
              ? "Requests are subject to account review."
              : "Completing the simulated target does not unlock a cash payout."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Amount USD"
              type="number"
              min="1"
              step="0.01"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              placeholder="100.00"
            />
            <Select
              label="Payout method"
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
            >
              <option>USDT / BSC</option>
              <option>BTC / BTC</option>
              <option>ETH / ETH</option>
              <option>BNB / BSC</option>
            </Select>
          </div>
          <div className="mt-4">
            <Input
              label="Payout wallet/address"
              value={payoutAddress}
              onChange={(e) => setPayoutAddress(e.target.value)}
              placeholder="Paste payout address"
              className="font-mono text-sm"
            />
          </div>
          <Button type="submit" disabled={!canSubmit || withdrawalSaving} className="mt-4 w-full">
            {withdrawalSaving ? "Submitting..." : "Submit withdrawal request"}
          </Button>
          {error && (
            <p role="alert" className="mt-3 text-sm text-rose-200">
              {error}
            </p>
          )}
          {latestWithdrawal && (
            <p className="mt-3 break-all text-xs leading-5 text-slate-400">
              Latest request: ${Number(latestWithdrawal.amount_usd).toFixed(2)} to{" "}
              {latestWithdrawal.payout_method}.{" "}
              {latestWithdrawal.admin_notes && `Admin note: ${latestWithdrawal.admin_notes}`}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
