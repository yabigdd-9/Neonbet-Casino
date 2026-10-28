import React from "react";
import { Menu, Search } from "lucide-react";
import Button from "../ui/Button";
import { brand } from "../../config/brand";
import { scrollToSection } from "../../lib/navigation";
export default function Header({ setOpen, balance, user, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080f1e]/95 backdrop-blur-md lg:ml-64">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 py-3 md:gap-4 md:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="icon-button lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <a href="#lobby" className="text-lg font-bold lg:hidden">
          {brand.name}
        </a>
        <span className="hidden text-sm text-slate-400 lg:block">Your daily dose of discovery</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="icon-button hidden sm:flex"
            aria-label="Search catalogue"
            onClick={() => scrollToSection("providers", true)}
          >
            <Search size={18} />
          </button>
          <span className="hidden rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 sm:block">
            Practice credits <span className="ml-2 tabular-nums font-semibold text-white">{balance.toFixed(2)}</span>
          </span>
          {user ? (
            <>
              <span className="hidden max-w-32 truncate text-sm md:block">{user.username}</span>
              <Button variant="secondary" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => onOpenAuth("login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => onOpenAuth("register")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
      <div
        className="border-t border-white/5 px-4 py-1.5 text-center text-[11px] text-slate-400 sm:hidden"
        role="status"
      >
        Simulated USD <span className="tabular-nums text-cyan-200">${balance.toFixed(2)}</span> · No cash
        value credits only
      </div>
    </header>
  );
}
