// Mobile bottom navigation.
import React from "react";
import type { LucideIcon } from "lucide-react";
import { Gamepad2, Dice5, Gift, Search, CircleUser } from "lucide-react";

interface MobileNavItem {
  label: string;
  Icon: LucideIcon;
  action: () => void;
}

interface MobileNavProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

export default function MobileNav({ onOpenAuth }: MobileNavProps) {
  const items: MobileNavItem[] = [
    {
      label: "Home",
      Icon: Gamepad2,
      action: () => document.getElementById("lobby")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Casino",
      Icon: Dice5,
      action: () =>
        document.getElementById("featured-games")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Promos",
      Icon: Gift,
      action: () => document.getElementById("promotions")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Search",
      Icon: Search,
      action: () => document.getElementById("providers")?.scrollIntoView({ behavior: "smooth" }),
    },
    { label: "Account", Icon: CircleUser, action: () => onOpenAuth("login") },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ label, Icon, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="flex flex-col items-center gap-1 py-3 text-[11px] font-bold text-slate-300"
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
