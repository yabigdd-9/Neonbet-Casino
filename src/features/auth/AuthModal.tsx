// Authentication modal (login / register / reset). Uses the auth service.
import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Send, MessageCircle, ExternalLink } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { hasSupabaseConfig } from "../../services/supabaseClient";
import { buildContactUrl } from "../../config/contact";

interface AuthModalProps {
  mode: "login" | "register" | "reset";
  setMode: (mode: "login" | "register" | "reset") => void;
  onClose: () => void;
  onSubmit: (payload: {
    mode: "login" | "register" | "reset";
    email: string;
    password: string;
    username: string;
    phone: string;
    contactMethod: string;
  }) => void;
  onResetPassword: (email: string) => void;
  authLoading: boolean;
  authError: string | null;
}

export default function AuthModal({
  mode,
  setMode,
  onClose,
  onSubmit,
  onResetPassword,
  authLoading,
  authError,
}: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactMethod, setContactMethod] = useState("telegram");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isRegister = mode === "register";
  const canSubmit = hasSupabaseConfig
    ? email.trim().includes("@") &&
      password.length >= 6 &&
      (!isRegister || (username.trim().length >= 3 && acceptedTerms))
    : username.trim().length >= 3 && (!isRegister || acceptedTerms);
  const selectedContactUrl = buildContactUrl(contactMethod, username, phone);

  function handleAuth(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      mode,
      email: email.trim(),
      password,
      username: username.trim(),
      phone: phone.trim(),
      contactMethod,
    });
  }

  return (
    <Modal
      title={isRegister ? "Create account" : "Login"}
      eyebrow="NeonBet account"
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <div className="grid gap-6 p-5 md:grid-cols-[0.9fr_1.1fr] md:p-7">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="grid grid-cols-2 gap-2">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab as "login" | "register")}
                className={`rounded-2xl px-4 py-3 text-sm font-black capitalize transition ${
                  mode === tab
                    ? "bg-cyan-400 text-slate-950 shadow-neon"
                    : "bg-black/25 text-slate-300 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-black/25 p-5">
            <div className="font-black text-4xl text-cyan-300">$100</div>
            <div className="mt-1 font-bold">Sign-up bonus</div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Register through Telegram or WhatsApp, complete account verification, and clear the
              10x rollover requirement.
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {hasSupabaseConfig && (
            <>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </>
          )}

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={
              hasSupabaseConfig && !isRegister ? "Optional after login" : "Choose a username"
            }
          />

          <Input
            label="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+64..."
          />

          {isRegister && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
              <div className="text-sm font-bold text-slate-300">Sign up from</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    ["telegram", "Telegram", Send],
                    ["whatsapp", "WhatsApp", MessageCircle],
                  ] as [string, string, LucideIcon][]
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setContactMethod(value)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-black transition ${
                      contactMethod === value
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-black/25 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={17} /> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isRegister && (
            <label className="flex gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-cyan-400"
              />
              I understand the $100 bonus and 300% match require account verification and 10x
              rollover.
            </label>
          )}

          <Button type="submit" disabled={!canSubmit || authLoading} className="w-full">
            {authLoading ? "Please wait..." : isRegister ? "Create account" : "Login"}
          </Button>

          {hasSupabaseConfig && !isRegister && (
            <Button
              type="button"
              variant="secondary"
              disabled={!email.trim().includes("@") || authLoading}
              onClick={() => onResetPassword(email.trim())}
              className="w-full"
            >
              Send password reset email
            </Button>
          )}

          {authError && (
            <p
              className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100"
              role="alert"
            >
              {authError}
            </p>
          )}

          {isRegister && selectedContactUrl && (
            <a
              href={selectedContactUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition ${
                canSubmit
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "pointer-events-none bg-white/5 text-slate-500"
              }`}
            >
              <ExternalLink size={18} /> Continue in{" "}
              {contactMethod === "telegram" ? "Telegram" : "WhatsApp"}
            </a>
          )}
        </form>
      </div>
    </Modal>
  );
}
