// Manual crypto verification panel. Uses verification service + config.
import React, { useState } from "react";
import {
  ShieldCheck,
  Clock3,
  MessageCircle,
  CheckCircle2 as Check,
  ExternalLink,
  Copy,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { verificationConfig } from "../../config/verification";
import { contact } from "../../config/contact";
import { statusLabel } from "../../lib/status";

function CopyButton({ value, label, onCopied }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      onCopied?.();
    } catch {
      /* ignore */
    }
  }
  return (
    <Button type="button" variant="primary" size="sm" onClick={handleCopy}>
      <Copy size={16} /> {label}
    </Button>
  );
}

export default function VerificationPanel({
  user,
  latestSubmission,
  onSubmitVerification,
  verificationSaving,
  onNeedAuth,
}) {
  const [copied, setCopied] = useState("");
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [txHash, setTxHash] = useState("");
  const selectedMethod = verificationConfig.acceptedCrypto[selectedMethodIndex];
  const referenceExample = "@yourname + 0x/txid...";

  function handleSubmit(event) {
    event.preventDefault();
    if (!user) {
      onNeedAuth();
      return;
    }
    if (!txHash.trim()) return;
    onSubmitVerification(selectedMethod, txHash.trim());
    setTxHash("");
  }

  const contactLinks = [contact.telegramUrl, contact.whatsappUrl].filter(Boolean);

  return (
    <section className="grid scroll-mt-24 gap-5 xl:grid-cols-[1.2fr_0.8fr]" id="verification">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/70 p-6 md:p-8">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3 text-cyan-200">
            <ShieldCheck />{" "}
            <span className="text-sm font-black uppercase tracking-[0.2em]">
              Manual account verification
            </span>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                Verify your account for{" "}
                <span className="text-cyan-300">${verificationConfig.feeUsd} USD</span>.
              </h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                Send crypto to the listed wallet, then message your Telegram or WhatsApp username
                with the transaction hash. A team member confirms the payment manually before
                marking the account verified.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-center">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Verification fee
              </div>
              <div className="mt-1 text-5xl font-black text-white">
                ${verificationConfig.feeUsd}
              </div>
              <div className="text-sm text-slate-400">USD equivalent</div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5">
              <div className="flex items-center gap-2 font-black text-amber-200">
                <Clock3 size={18} /> Manual review
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Verification is not instant. Confirmation depends on network settlement and manual
                admin review.
              </p>
            </div>
            <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5">
              <div className="flex items-center gap-2 font-black text-cyan-200">
                <MessageCircle size={18} /> Send proof
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Contact via {verificationConfig.contactMethods.join(" or ")} with your username and
                transaction hash.
              </p>
            </div>
            <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5">
              <div className="flex items-center gap-2 font-black text-emerald-200">
                <Check size={18} /> Account badge
              </div>
              <p className="mt-3 text-sm text-slate-400">
                The fee unlocks account verification only. Bonus eligibility is reviewed separately
                under account terms.
              </p>
            </div>
          </div>

          {contactLinks.length > 0 ? (
            <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="mb-4 flex items-center gap-2 font-black text-white">
                <ExternalLink size={18} /> Send verification proof
              </div>
              <div className="flex flex-wrap gap-3">
                {contact.telegramUrl && (
                  <a
                    href={contact.telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950 shadow-neon"
                  >
                    <MessageCircle size={18} /> Telegram
                  </a>
                )}
                {contact.whatsappUrl && (
                  <a
                    href={contact.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-400/15 px-4 py-3 font-black text-emerald-100"
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              Contact links are not configured. Set VITE_TELEGRAM_URL / VITE_WHATSAPP_URL or edit
              src/config/contact.js to enable proof submission.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-8">
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {verificationConfig.acceptedCrypto.map((method, index) => {
            const selected = selectedMethodIndex === index;
            return (
              <button
                key={`${method.name}-${method.network}`}
                type="button"
                onClick={() => {
                  setSelectedMethodIndex(index);
                  setCopied("");
                }}
                className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                  selected
                    ? "border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-neon"
                    : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                }`}
              >
                {method.name}
                <span className="block text-[11px] font-bold opacity-75">{method.network}</span>
              </button>
            );
          })}
        </div>

        {selectedMethod.address ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                  {selectedMethod.label}
                </div>
                <h3 className="mt-2 text-2xl font-black">Payment details</h3>
              </div>
              <img
                src={selectedMethod.qrCodeSrc}
                alt={`${selectedMethod.name} ${selectedMethod.network} verification QR code`}
                className="h-20 w-20 rounded-2xl border border-white/10 bg-white p-1"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Wallet address
                </div>
                <div className="mt-2 break-all font-mono text-sm text-slate-100">
                  {selectedMethod.address}
                </div>
                <div className="mt-3 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-200">
                  {selectedMethod.notice}
                </div>
                <div className="mt-4">
                  <CopyButton
                    value={selectedMethod.address}
                    label={copied === "wallet" ? "Copied" : "Copy wallet"}
                    onCopied={() => {
                      setCopied("wallet");
                      setTimeout(() => setCopied(""), 1800);
                    }}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Required reference
                </div>
                <div className="mt-2 text-sm font-bold text-white">
                  {verificationConfig.referenceFormat}
                </div>
                <div className="mt-2 font-mono text-xs text-slate-400">{referenceExample}</div>
                <div className="mt-4">
                  <CopyButton
                    value={referenceExample}
                    label={copied === "reference" ? "Copied" : "Copy example"}
                    onCopied={() => {
                      setCopied("reference");
                      setTimeout(() => setCopied(""), 1800);
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            No wallet address configured for {selectedMethod.name}. Add it in
            src/config/verification.js before distribution.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4"
        >
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            Submit transaction hash
          </div>
          <input
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm text-white outline-none focus:border-cyan-300/60"
            placeholder="Paste transaction hash"
            aria-label="Transaction hash"
          />
          <Button
            type="submit"
            disabled={verificationSaving || (user && !txHash.trim())}
            className="mt-3 w-full"
          >
            {!user
              ? "Login or register first"
              : verificationSaving
                ? "Submitting..."
                : "Submit for manual review"}
          </Button>
          {latestSubmission && (
            <p className="mt-3 text-xs leading-5 text-cyan-100">
              Latest submission: {latestSubmission.asset} / {latestSubmission.network} is{" "}
              {statusLabel(latestSubmission.status)}.
            </p>
          )}
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Manual crypto verification is separate from bonuses and gameplay. Do not send funds
          expecting instant deposits, withdrawals, wagering access, or automated confirmation.
        </p>
      </div>
    </section>
  );
}
