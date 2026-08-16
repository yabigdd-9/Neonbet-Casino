// Promotions + terms/policy sections.
import React from "react";
import { Gift, Flame, Trophy, MessageCircle } from "lucide-react";
import { promos, terms, policyPages } from "../../data/promotions";
import { contact } from "../../config/contact";

const ICONS = { Gift, Flame, Trophy };

export function PromotionsSection() {
  return (
    <section id="promotions" className="grid scroll-mt-24 gap-5 lg:grid-cols-3">
      {promos.map(({ title, detail, icon }) => {
        const Icon = ICONS[icon] || Gift;
        return (
          <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-amber-300 text-slate-950 shadow-gold">
              <Icon />
            </div>
            <h3 className="text-xl font-black">{title}</h3>
            <p className="mt-2 text-slate-400">{detail}</p>
          </div>
        );
      })}
    </section>
  );
}

export function TermsSection({ onOpenPolicy }) {
  return (
    <section id="terms" className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Account terms</div>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">Bonus & Verification Rules</h2>
          <p className="mt-2 max-w-3xl text-slate-400">These rules explain the offer shown on this site. They are a practical summary for players and should be replaced with final legal terms before operating with real users.</p>
        </div>
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">$100 bonus + 300% match + 10x rollover</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {terms.map((term) => (
          <article key={term.title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-black text-white">{term.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{term.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-5">
        <div className="flex items-center gap-2 font-black text-cyan-100"><MessageCircle size={18} /> Questions or verification proof</div>
        <p className="mt-2 text-sm leading-6 text-slate-300">Use Telegram or WhatsApp to send your username, selected asset/network, and transaction hash. Keep screenshots and hashes until verification is complete.</p>
        {contact.telegramUrl && (
          <a href={contact.telegramUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950">
            <MessageCircle size={18} /> Telegram
          </a>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(policyPages).map(([key, page]) => (
          <button key={key} type="button" onClick={() => onOpenPolicy(page)} className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
            {page.title}
          </button>
        ))}
      </div>
    </section>
  );
}

export function PolicyModalContent({ page }) {
  if (!page) return null;
  return (
    <div className="p-5">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{page.eyebrow}</div>
      <h2 className="mt-1 text-3xl font-black">{page.title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {page.sections.map(([title, detail]) => (
          <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <h3 className="font-black text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
