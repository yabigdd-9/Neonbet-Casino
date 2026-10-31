import React from "react";
import { Menu, Search } from "lucide-react";
import Button from "../ui/Button";
import { brand } from "../../config/brand";
import { cancelPendingNavigation, scrollToSection } from "../../lib/navigation";
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
        <a href="#lobby" onClick={cancelPendingNavigation} className="text-lg font-bold lg:hidden">
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
          <button
            type="button"
            onClick={() => scrollToSection("vip")}
            aria-label={`Practice credits ${balance.toFixed(2)}, view session activity`}
            className="hidden min-h-11 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/10 sm:block"
          >
            Practice credits{" "}
            <span className="ml-2 tabular-nums font-semibold text-white">{balance.toFixed(2)}</span>
          </button>
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
        className="lobby-mode-notice border-t border-cyan-200/10 bg-cyan-200/[0.04] px-4 py-2 text-center text-[11px] text-cyan-100"
        role="status"
      >
        <span className="sm:hidden">
          Simulated USD <span className="tabular-nums">${balance.toFixed(2)}</span> ·{" "}
        </span>
        Simulated games · No cash value · Provider-inspired themes
      </div>
    </header>
  );
}
