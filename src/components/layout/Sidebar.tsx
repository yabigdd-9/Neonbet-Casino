// Desktop sidebar navigation.
import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Gamepad2,
  Dice5,
  Sparkles,
  CircleDollarSign,
  Gift,
  ShieldCheck,
  Wallet,
  Trophy,
  ShieldCheck as Shield,
} from "lucide-react";
import { brand } from "../../config/brand";

interface SidebarLink {
  label: string;
  Icon: LucideIcon;
  sectionId: string;
}

const LINKS: SidebarLink[] = [
  { label: "Lobby", Icon: Gamepad2, sectionId: "lobby" },
  { label: "Slots", Icon: Dice5, sectionId: "featured-games" },
  { label: "Arcade Tables", Icon: Sparkles, sectionId: "arcade-games" },
  { label: "Live Tables", Icon: CircleDollarSign, sectionId: "featured-games" },
  { label: "Promotions", Icon: Gift, sectionId: "promotions" },
  { label: "Verification", Icon: ShieldCheck, sectionId: "verification" },
  { label: "Withdrawals", Icon: Wallet, sectionId: "withdrawals" },
  { label: "VIP Club", Icon: Trophy, sectionId: "vip" },
  { label: "Responsible Play", Icon: Shield, sectionId: "terms" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/95 p-5 backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400 font-black text-slate-950 shadow-neon">
              {brand.shortName}
            </div>
            <div>
              <div className="font-black text-xl tracking-tight">{brand.name}</div>
              <div className="text-xs text-cyan-300">casino lobby</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="mb-5 rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/15 to-purple-500/15 p-4">
          <p className="text-sm text-slate-300">Sign-Up Bonus</p>
          <p className="mt-1 text-3xl font-black text-white">$100</p>
          <p className="text-xs text-slate-400">Plus 300% match, 10x rollover</p>
        </div>

        <nav className="space-y-2">
          {LINKS.map(({ label, Icon, sectionId }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                scrollToSection(sectionId);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={19} /> <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Shield size={18} /> Account Notice
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Bonuses and verification are subject to approval, local rules, and account terms.
          </p>
        </div>
      </aside>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
