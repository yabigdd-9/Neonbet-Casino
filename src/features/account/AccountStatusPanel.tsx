// Account status panel: shows profile + rollover progress.
import React from "react";
import type { Profile } from "../../types";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatMoney } from "../../lib/storage";
import { IS_SUPABASE } from "../../config/appMode";

interface AccountStatusPanelProps {
  user: { username?: string; email?: string } | null;
  profile: Profile | null;
  latestSubmission: { asset?: string; tx_hash?: string } | null;
}

export default function AccountStatusPanel({
  user,
  profile,
  latestSubmission,
}: AccountStatusPanelProps) {
  if (!user) return null;
  const status = profile?.verification_status || "not_submitted";
  const progress = Number(profile?.rollover_progress || 0);
  const required = Number(profile?.rollover_required || 1000);
  const percent = Math.min(100, Math.round((progress / required) * 100));

  return (
    <section
      id="account-status"
      className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-8"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            Account status
          </div>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">
            {profile?.username || user.username || user.email}
          </h2>
          <p className="mt-2 text-slate-400">
            {IS_SUPABASE
              ? "Synced with Supabase accounts and verification records."
              : "Local browser account. Add Supabase env vars for real backend accounts."}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm text-slate-400">Bonus balance</div>
          <div className="mt-1 text-3xl font-black">
            {formatMoney(profile?.bonus_balance ?? 100)}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm text-slate-400">Rollover progress</div>
          <div className="mt-1 text-3xl font-black">{percent}%</div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-cyan-400" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {formatMoney(progress)} / {formatMoney(required)}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm text-slate-400">Latest submission</div>
          <div className="mt-1 text-xl font-black">{latestSubmission?.asset || "None"}</div>
          <p className="mt-2 break-all text-xs text-slate-500">
            {latestSubmission?.tx_hash || "Submit a transaction hash in verification."}
          </p>
        </div>
      </div>
    </section>
  );
}
