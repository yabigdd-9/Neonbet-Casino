// Site footer with licensing / responsible play / payments notices + policy links.
import React from "react";
import { policyPages } from "../../data/promotions";

export default function Footer({ onOpenPolicy }) {
  return (
    <footer id="footer" className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-xs leading-6 text-slate-500 md:p-8">
      <div className="grid gap-5 text-left md:grid-cols-3">
        <div>
          <div className="font-black uppercase tracking-[0.18em] text-slate-300">Licensing</div>
          <p className="mt-2">Licensing status: pending regulatory review. Operator reference: NB-2026-NZ. Real-money gambling services must not be offered until licensing, regional eligibility, and published terms are confirmed.</p>
        </div>
        <div>
          <div className="font-black uppercase tracking-[0.18em] text-slate-300">Responsible Play</div>
          <p className="mt-2">For adults only. Do not use this site where online gambling is prohibited. Play within limits, take breaks, and seek help if gambling stops being recreational.</p>
        </div>
        <div>
          <div className="font-black uppercase tracking-[0.18em] text-slate-300">Payments</div>
          <p className="mt-2">The $75 crypto verification fee is reviewed manually and is not an instant deposit, wagering balance, withdrawal approval, casino credit, or automated payment confirmation.</p>
        </div>
      </div>
      <div className="mt-5 border-t border-white/10 pt-5 text-center">NeonBet bonuses, provider availability, verification, account access, and game access are subject to account approval, local rules, and published terms.</div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Object.entries(policyPages).map(([key, page]) => (
          <button key={key} type="button" onClick={() => onOpenPolicy(page)} className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
            {page.title}
          </button>
        ))}
      </div>
    </footer>
  );
}
