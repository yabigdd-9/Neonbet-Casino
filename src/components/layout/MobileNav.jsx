// Mobile bottom navigation.
import React from "react";
import { Gamepad2, Dice5, Gift, Search, CircleUser } from "lucide-react";

export default function MobileNav({ onOpenAuth }) {
  const items = [
    [
      "Home",
      Gamepad2,
      () => document.getElementById("lobby")?.scrollIntoView({ behavior: "smooth" }),
    ],
    [
      "Casino",
      Dice5,
      () => document.getElementById("featured-games")?.scrollIntoView({ behavior: "smooth" }),
    ],
    [
      "Promos",
      Gift,
      () => document.getElementById("promotions")?.scrollIntoView({ behavior: "smooth" }),
    ],
    [
      "Search",
      Search,
      () => document.getElementById("providers")?.scrollIntoView({ behavior: "smooth" }),
    ],
    ["Account", CircleUser, () => onOpenAuth("login")],
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {items.map(([label, Icon, action]) => (
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
