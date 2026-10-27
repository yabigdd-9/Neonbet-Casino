import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { contact } from "../../config/contact";

function reply(message) {
  const text = message.toLowerCase();
  if (/withdraw|cash out|payout/.test(text))
    return "I can help with withdrawals. Open Withdrawals to submit a request; requests are reviewed manually. I can't check its status here.";
  if (/deposit|payment|crypto|bitcoin|usdt|wallet/.test(text))
    return "Real-money deposits are not available. Please do not send cryptocurrency. I cannot confirm transactions or credit a balance.";
  if (/password|sign in|log in|login/.test(text))
    return "Having trouble signing in? Use the password reset option on the sign-in screen. Please don't share your password or recovery codes here.";
  if (/verif/.test(text))
    return "You can submit your transaction details on the Verification page for manual review. I can't see your account or confirm its status.";
  if (/human|agent|person|contact/.test(text))
    return "I can't transfer this chat to a person. Please use the contact options below if they are available.";
  if (/gambl|addict|limit|self.exclu/.test(text))
    return "If gambling is causing concern, please take a break and seek support from a trusted person or a local gambling support service. Use the contact options below to ask about your account.";
  return "Thanks for getting in touch. I can help with common questions about sign-in, verification, deposits and withdrawals. For an account-specific issue, please use the contact options below if available.";
}

export default function CustomerCare() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "support", text: "Hi! I'm NeonBet's automated assistant. How can I help today?" },
  ]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }
  function send(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((previous) => [...previous, { role: "user", text }, { role: "support", text: reply(text) }]);
    setInput("");
  }
  return (
    <div
      className="fixed bottom-20 right-4 z-40 sm:bottom-5"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          close();
        }
      }}
    >
      {open && (
        <section
          aria-label="NeonBet Customer Care"
          className="mb-3 flex h-[min(32rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-950 text-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-slate-900 p-4">
            <div>
              <h2 className="font-bold">NeonBet Customer Care</h2>
              <p className="text-xs text-slate-400">Automated assistant</p>
            </div>
            <button type="button" onClick={close} aria-label="Close customer care">
              <X size={20} />
            </button>
          </header>
          <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4">
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
        </section>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="ml-auto flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-bold text-slate-950 shadow-lg"
      >
        <MessageCircle size={20} /> Customer Care
      </button>
    </div>
  );
}
