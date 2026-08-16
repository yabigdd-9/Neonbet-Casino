// App header. Supports brand, nav, balance, account/verification state, mobile drawer.
import React from "react";
import { Menu, Wallet, Bell } from "lucide-react";
import Button from "../../components/ui/Button";
import { brand } from "../../config/brand";
import { features } from "../../config/features";
import GameSearch from "../../features/casino/GameSearch";

interface HeaderUser {
  username?: string;
}

interface HeaderProps {
  setOpen: (open: boolean) => void;
  balance: number;
  user: HeaderUser | null;
  onOpenAuth: (mode: "login" | "register") => void;
  onLogout: () => void;
  onSearch?: (result: unknown) => void;
}

export default function Header({
  setOpen,
  balance,
  user,
  onOpenAuth,
  onLogout,
  onSearch,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-4 md:px-8 lg:ml-72">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-white/10 p-2 lg:hidden"
          aria-label="Open menu"
        >
          <Menu />
        </button>

        <button
          onClick={() =>
            document.getElementById("lobby")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="flex items-center gap-3"
          aria-label={`${brand.name} home`}
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400 font-black text-slate-950 shadow-neon">
            {brand.shortName}
          </div>
          <div className="hidden text-left sm:block">
            <div className="font-black leading-tight tracking-tight">{brand.name}</div>
            <div className="text-xs text-cyan-300">{brand.tagline}</div>
          </div>
        </button>

        {features.casinoProviders && (
          <div className="ml-2 hidden flex-1 md:flex">
            <GameSearch onResult={onSearch} className="max-w-xl" />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div aria-live="polite" aria-atomic="true" className="hidden sm:block">
            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:flex"
              aria-label={`Balance: $${Number(balance).toFixed(2)}`}
              onClick={() =>
                document.getElementById("featured-games")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Wallet size={18} /> {`$${Number(balance).toFixed(2)}`}
            </Button>
          </div>
          <button
            className="rounded-2xl bg-white/10 p-3 hover:bg-white/15"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          {user ? (
            <>
              <span className="hidden rounded-2xl bg-white/10 px-4 py-3 font-bold md:block">
                {user.username}
              </span>
              <Button variant="secondary" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => onOpenAuth("login")}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => onOpenAuth("register")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
