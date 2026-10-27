import React from "react";
import { Gamepad2, Dice5, Gift, ShieldCheck, Wallet, ArrowUpRight } from "lucide-react";
import { brand } from "../../config/brand";
import { features } from "../../config/features";
import { scrollToSection } from "../../lib/navigation";
import { useActiveSection } from "../../hooks/useActiveSection";
import Modal from "../ui/Modal";
function Navigation({ user, close }) {
  const active = useActiveSection();
  const links = [
    ["Lobby", Gamepad2, "lobby"],
    ["Featured games", Dice5, "featured-games"],
    ["Arcade", Gamepad2, "arcade-games"],
    ["All games", ArrowUpRight, "providers"],
    ...(features.promotions ? [["Promotions", Gift, "promotions"]] : []),
    ...(features.verification ? [["Verification", ShieldCheck, "verification"]] : []),
    ...(features.withdrawals && user ? [["Withdrawals", Wallet, "withdrawals"]] : []),
    ["Responsible play", ShieldCheck, "terms"],
  ];
  return (
    <nav aria-label="Main navigation" className="space-y-1">
      {links.map(([label, Icon, id]) => (
        <button
          key={id}
          aria-current={active === id ? "location" : undefined}
          type="button"
          onClick={() => {
            close?.();
            requestAnimationFrame(() => scrollToSection(id));
          }}
          className="nav-item"
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
export default function Sidebar({ open, setOpen, user }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-white/10 bg-[#080f1e] p-5 lg:flex">
        <a href="#lobby" className="mb-10 flex items-center gap-3">
          <img src={brand.logo} alt="" width="40" height="40" />
          <div>
            <span className="text-xl font-bold tracking-tight">{brand.name}</span>
            <p className="text-[10px] uppercase tracking-[.2em] text-slate-400">The demo collection</p>
          </div>
        </a>
        <p className="eyebrow mb-3">Discover</p>
        <Navigation user={user} />
        <div className="surface mt-auto pt-5 p-4">
          <p className="text-sm font-semibold text-cyan-200">Made for a little play.</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            All games use simulated credits. No live game providers or payment processing are connected.
          </p>
        </div>
      </aside>
      {open && (
        <Modal title="Explore NeonBet" onClose={() => setOpen(false)} maxWidth="max-w-md">
          <div className="p-4">
            <Navigation user={user} close={() => setOpen(false)} />
          </div>
        </Modal>
      )}
    </>
  );
}
