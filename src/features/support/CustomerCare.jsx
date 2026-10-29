import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { contact } from "../../config/contact";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
const SupportRequests = lazy(() => import("./SupportRequests"));

function reply(message) {
  const text = message.toLowerCase();
  if (/referr|invit/.test(text))
    return "An eligible new confirmed-email account can apply one invitation within 7 days. The inviter earns 5 non-cash credits, up to 20 referrals per account. No deposit is needed. Public rewards may be inactive; check the referral panel.";
  if (/game|load|freez|stuck|crash/.test(text))
    return "If a game will not load, try its loading retry, then reload if needed. For a round that cannot start, choose a bet within your practice balance. Use Ask a person below to report the game title and what happened.";
  if (/gambl|addict|self.exclu|responsible|spending limit/.test(text))
    return "If gambling is causing concern, please take a break and seek support from a trusted person or a local gambling support service. Use the contact options below to ask about your account.";

  if (/practice|cash value|bonus credit/.test(text))
    return "Practice credits are for free-play games only. They have no cash value, cannot be withdrawn, and require no deposit.";
  if (/withdraw|cash out|payout/.test(text))
    return "Withdrawals are not available. Practice credits have no cash value and cannot be withdrawn. I can't check account status here.";
  if (/deposit|payment|crypto|bitcoin|usdt|wallet/.test(text))
    return "Real-money deposits are not available. Please do not send cryptocurrency. I cannot confirm transactions or credit a balance.";
  if (/password|sign in|log in|login/.test(text))
    return "Having trouble signing in? Use the password reset option on the sign-in screen. Please don't share your password or recovery codes here.";
  if (/verif/.test(text))
    return "The verification page demonstrates a review process; it does not verify real payments or grant real-money access. Please do not send cryptocurrency.";
  if (/human|agent|person|contact/.test(text))
    return "I can't transfer this chat to a person. Please use the contact options below if they are available.";
  return "Thanks for getting in touch. I can help with common questions about sign-in, verification, deposits and withdrawals. For an account-specific issue, please use the contact options below if available.";
}

export default function CustomerCare({ user }) {
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "support", text: "Hi! I'm Lucky Orbit's automated assistant. How can I help today?" },
  ]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => {
    const show = () => {
      setOpen(true);
      setRequestsOpen(true);
    };
    window.addEventListener("luckyOrbit:open-support", show);
    return () => window.removeEventListener("luckyOrbit:open-support", show);
  }, []);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, open]);
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }
  function send(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    respond(text);
    setInput("");
  }
  function respond(text) {
    setMessages((previous) => [
      ...previous.slice(-38),
      { role: "user", text },
      { role: "support", text: reply(text) },
    ]);
  }
  return (
    <div
      className="fixed bottom-20 right-4 z-40 lg:bottom-5"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          close();
        }
      }}
    >
      {open && (
        <section
          aria-label="Lucky Orbit Customer Care"
          className="customer-care-panel mb-3 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-950 text-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-slate-900 p-4">
            <div>
              <h2 className="font-bold">Lucky Orbit Customer Care</h2>
              <p className="text-xs text-slate-400">Automated assistant</p>
            </div>
            <button type="button" onClick={close} aria-label="Close customer care" className="icon-button">
              <X size={20} />
            </button>
          </header>
          <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto">
            <div role="log" aria-live="polite" className={`${requestsOpen ? "hidden" : "space-y-3 p-4"}`}>
              {messages.map((message, index) => (
                <p
                  key={index}
                  className={`w-fit max-w-[90%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${message.role === "user" ? "ml-auto bg-cyan-700" : "bg-slate-800"}`}
                >
                  {message.text}
                </p>
              ))}
            </div>
            <div className="px-4 pb-2 text-xs text-slate-400">
              Don't share passwords, recovery phrases or private keys.{" "}
              {contact.telegramUrl && (
                <a className="text-cyan-300" href={contact.telegramUrl} target="_blank" rel="noreferrer">
                  Telegram{" "}
                </a>
              )}
              {contact.whatsappUrl && (
                <a className="text-cyan-300" href={contact.whatsappUrl} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              )}
            </div>
            <button
              type="button"
              className="secondary-button mx-4 mb-2 min-h-11"
              aria-expanded={requestsOpen}
              onClick={() => setRequestsOpen((value) => !value)}
            >
              Ask a person / support requests
            </button>
            {requestsOpen && (
              <ErrorBoundary
                fallback={
                  <div role="alert" className="overflow-y-auto p-4 text-sm">
                    <p>The request form could not load. You can email the support team directly.</p>
                    <a className="secondary-button mt-3" href={`mailto:${contact.supportEmail}`}>
                      Email support
                    </a>
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <p role="status" className="p-4 text-sm">
                      Loading support requests…
                    </p>
                  }
                >
                  <SupportRequests key={user?.id || "guest"} user={user} />
                </Suspense>
              </ErrorBoundary>
            )}
            {!requestsOpen && (
              <>
                <div className="flex flex-wrap gap-2 px-4 pb-3" aria-label="Common support questions">
                  {["Signing in", "Practice credits", "Responsible play", "Referrals", "Game help"].map(
                    (topic) => (
                      <button
                        key={topic}
                        type="button"
                        className="min-h-11 rounded-full border border-white/15 px-3 py-2 text-xs text-cyan-200"
                        onClick={() =>
                          respond(
                            topic === "Signing in"
                              ? "How do I sign in?"
                              : topic === "Responsible play"
                                ? "I need help with gambling limits"
                                : topic === "Referrals"
                                  ? "How do referrals work?"
                                  : topic === "Game help"
                                    ? "My game will not load"
                                    : "Do practice credits have cash value?",
                          )
                        }
                      >
                        {topic}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="min-h-11 rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300"
                    onClick={() => {
                      setMessages([
                        {
                          role: "support",
                          text: "Hi! I'm Lucky Orbit's automated assistant. How can I help today?",
                        },
                      ]);
                      setInput("");
                      inputRef.current?.focus();
                    }}
                  >
                    Clear conversation
                  </button>
                </div>
                <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
                  <input
                    ref={inputRef}
                    aria-label="Your message"
                    maxLength={1000}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type your message..."
                    className="min-w-0 flex-1 rounded-xl bg-slate-800 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    className="rounded-xl bg-cyan-500 p-2 text-slate-950"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label="Customer Care"
        onClick={() => (open ? close() : setOpen(true))}
        className="ml-auto flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-cyan-400 p-3 font-bold text-slate-950 shadow-lg sm:px-5"
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline">Customer Care</span>
      </button>
    </div>
  );
}
