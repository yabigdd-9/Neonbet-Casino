import React from "react";
import { Gamepad2, Dice5, Gift, Search, CircleUser } from "lucide-react";
import { features } from "../../config/features";
import { scrollToSection } from "../../lib/navigation";
export default function MobileNav({ onOpenAuth, user }) {
  const items = [
    ["Home", Gamepad2, () => scrollToSection("lobby")],
    ["Arcade", Dice5, () => scrollToSection("arcade-games")],
    ...(features.promotions ? [["Promos", Gift, () => scrollToSection("promotions")]] : []),
    ["Search", Search, () => scrollToSection("providers", true)],
    ...(features.account
      ? [["Account", CircleUser, () => (user ? scrollToSection("account") : onOpenAuth("login"))]]
      : []),
  ];
  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-nav fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#080f1e]/95 lg:hidden"
    >
      <div className="flex">
        {items.map(([label, Icon, action]) => (
          <button
            type="button"
            key={label}
            onClick={action}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] text-slate-300"
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
