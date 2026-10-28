// Site footer with licensing / responsible play / payments notices + policy links.
import React from "react";
import { ShieldAlert } from "lucide-react";
import { policyPages } from "../../data/promotions";

export default function Footer({ onOpenPolicy }) {
  return (
    <footer
      id="footer"
      className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-xs leading-6 text-slate-400 md:p-8"
    >
      <section
        aria-labelledby="licensing-status"
        className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-7 md:flex-row md:items-center md:gap-6"
      >
        <div className="flex w-full max-w-sm items-center gap-4 rounded-xl border border-amber-300/30 bg-[#171b2a] p-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-amber-200/20 bg-[#101725] text-amber-200">
            <ShieldAlert size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Operator licensing
            </p>
            <h2 id="licensing-status" className="text-sm font-semibold text-white">
              Verification pending
            </h2>
            <p className="text-xs font-medium text-amber-200">No licence verified</p>
          </div>
        </div>
        <p className="max-w-2xl text-xs leading-5 text-slate-400">
          NeonBet has not supplied a verified operator licence. Games and credits are simulated; real-money
          deposits and withdrawals are not available.
        </p>
      </section>
      <div className="grid gap-5 text-left md:grid-cols-3">
        <div>
          <div className="font-semibold uppercase tracking-[0.18em] text-slate-300">Licensing</div>
          <p className="mt-2">
            This is a demonstration product. No gambling license or operator approval is represented. Live
            services are not enabled.
          </p>
        </div>
        <div>
          <div className="font-semibold uppercase tracking-[0.18em] text-slate-300">Responsible Play</div>
          <p className="mt-2">
            For adults only. Do not use this site where online gambling is prohibited. Play within limits,
            take breaks, and seek help if gambling stops being recreational.
          </p>
        </div>
        <div>
          <div className="font-semibold uppercase tracking-[0.18em] text-slate-300">Payments</div>
          <p className="mt-2">
            No payment is required for simulated play. Do not send cryptocurrency to this site.
          </p>
        </div>
      </div>
      <div className="mt-5 border-t border-white/10 pt-5 text-center">
        NeonBet bonuses, provider availability, verification, account access, and game access are subject to
        account approval, local rules, and published terms.
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Object.entries(policyPages).map(([key, page]) => (
          <button
            key={key}
            type="button"
            onClick={() => onOpenPolicy(page)}
            className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {page.title}
          </button>
        ))}
      </div>
    </footer>
  );
}
