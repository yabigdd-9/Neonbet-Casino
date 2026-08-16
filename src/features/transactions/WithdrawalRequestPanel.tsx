// Manual withdrawal request panel.
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import type { Profile, WithdrawalRequest } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/ui/StatusBadge";

interface WithdrawalRequestPanelProps {
  user: { id?: string } | null;
  profile: Profile | null;
  latestWithdrawal: WithdrawalRequest | null;
  withdrawalSaving: boolean;
  onSubmitWithdrawal: (payload: {
    amount_usd: number;
    payout_method: string;
    payout_address: string;
  }) => void;
}

export default function WithdrawalRequestPanel({
  user,
  profile,
  latestWithdrawal,
  withdrawalSaving,
  onSubmitWithdrawal,
}: WithdrawalRequestPanelProps) {
  const [amountUsd, setAmountUsd] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("USDT / BSC");
  const [payoutAddress, setPayoutAddress] = useState("");
  const verified = profile?.verification_status === "verified";
  const rolloverComplete =
    Number(profile?.rollover_progress || 0) >= Number(profile?.rollover_required || 1000);
  const canSubmit = user && amountUsd && Number(amountUsd) > 0 && payoutAddress.trim().length >= 10;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmitWithdrawal({
      amount_usd: Number(amountUsd),
      payout_method: payoutMethod,
      payout_address: payoutAddress.trim(),
    });
    setAmountUsd("");
    setPayoutAddress("");
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
          <h2 className="mt-2 text-2xl font-black md:text-3xl">Withdrawal Request</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            Submit a manual request after verification and rollover review. Admin approval is
            required before any payout.
          </p>
        </div>
        {latestWithdrawal && (
          <StatusBadge
            status={latestWithdrawal.status || "pending"}
            label={`Latest: ${latestWithdrawal.status}`}
          />
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 font-black text-white">
            <Wallet size={18} /> Eligibility
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
              <span className="text-slate-300">Account verification</span>
              <span
                className={verified ? "font-black text-emerald-200" : "font-black text-amber-200"}
              >
                {verified ? "Verified" : "Required"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
              <span className="text-slate-300">10x rollover</span>
              <span
                className={
                  rolloverComplete ? "font-black text-emerald-200" : "font-black text-amber-200"
                }
              >
                {rolloverComplete ? "Complete" : "Review needed"}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Requests can be submitted before final approval, but admin may reject requests that do
            not meet verification, rollover, or account review rules.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-black/20 p-5"
        >
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
