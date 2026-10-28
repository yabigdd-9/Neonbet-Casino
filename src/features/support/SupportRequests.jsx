import React, { useEffect, useRef, useState } from "react";
import { contact } from "../../config/contact";
import { hasSupabaseConfig, requireSupabase } from "../../services/supabaseClient";

const key = "luckyOrbit:supportRequests";
function localRequests() {
  try {
    const rows = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(rows)
      ? rows
          .filter(
            (r) =>
              r &&
              typeof r.id === "string" &&
              typeof r.topic === "string" &&
              typeof r.details === "string" &&
              r.details.length <= 1000,
          )
          .slice(0, 10)
      : [];
  } catch {
    return [];
  }
}
export default function SupportRequests({ user }) {
  const [topic, setTopic] = useState("Account"),
    [details, setDetails] = useState("");
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0);
  const request = useRef(null),
    saving = useRef(false),
    mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!hasSupabaseConfig) {
      setRows(localRequests());
      return;
    }
    if (!user?.id) return;
    void requireSupabase()
      .rpc("my_support_requests")
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !Array.isArray(data)) {
          setError("Support requests could not load. Try refreshing.");
          return;
        }
        setRows(
          data
            .filter(
              (r) =>
                r &&
                typeof r.id === "string" &&
                typeof r.topic === "string" &&
                typeof r.details === "string" &&
                ["open", "resolved"].includes(r.status),
            )
            .slice(0, 10),
        );
      })
      .catch(() => {
        if (active) setError("Support requests could not load. Try refreshing.");
      });
    return () => {
      active = false;
    };
  }, [user?.id, reload]);
  async function submit(event) {
    event.preventDefault();
    if (saving.current || details.trim().length < 10) return;
    saving.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const fingerprint = topic + ":" + details.trim();
    if (request.current?.fingerprint !== fingerprint)
      request.current = { fingerprint, id: crypto.randomUUID() };
    const record = {
      id: request.current.id,
      topic,
      details: details.trim(),
      status: "open",
      created_at: new Date().toISOString(),
    };
    try {
      if (hasSupabaseConfig) {
        const { data, error } = await requireSupabase().rpc("create_support_request", {
          request_id: record.id,
          request_topic: topic,
          request_details: record.details,
        });
        if (error || data?.id !== record.id) throw new Error();
      } else {
        const next = [record, ...localRequests().filter((r) => r.id !== record.id)].slice(0, 10);
        localStorage.setItem(key, JSON.stringify(next));
      }
      if (!mounted.current) return;
      setRows((previous) => [record, ...previous.filter((r) => r.id !== record.id)].slice(0, 10));
      setNotice(
        hasSupabaseConfig
          ? "Request saved to your account. Email support below to notify a person."
          : "Request saved on this device only. Email support below to send it to a person.",
      );
      setDetails("");
      request.current = null;
    } catch {
      if (mounted.current)
        setError(
          "Request could not be saved. Confirmed accounts can save up to 3 requests per 24 hours. You can also email support directly.",
        );
    } finally {
      saving.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const email = `mailto:${contact.supportEmail}`;
  return (
    <section
      aria-label="Support requests"
      className="border-t border-white/10 p-4 text-sm flex-1 min-h-0 overflow-y-auto"
    >
      <h3 className="font-semibold">Ask a person</h3>
      <p className="my-2 text-xs text-slate-300">
        Do not include passwords, recovery links or wallet secrets. This chat does not automatically send
        email. No response time is guaranteed.
      </p>
      <a href={email} className="text-cyan-200 underline">
        Email {contact.supportEmail}
      </a>
      {!hasSupabaseConfig || user?.id ? (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <label className="block">
            Issue topic
            <select
              autoFocus
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={busy}
              className="block w-full rounded-lg bg-slate-800 p-2"
            >
              {["Account", "Games", "Referrals", "Other"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Describe the issue
            <textarea
              minLength={10}
              maxLength={1000}
              required
              value={details}
              disabled={busy}
              onChange={(e) => setDetails(e.target.value)}
              className="block w-full rounded-lg bg-slate-800 p-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy || details.trim().length < 10}
            className="primary-button min-h-11"
          >
            {busy ? "Saving…" : "Save support request"}
          </button>
        </form>
      ) : (
        <p className="mt-3">
          Sign in with a confirmed email to track requests in your account, or email support directly.
        </p>
      )}
      <p role="status" className="mt-2 text-cyan-200">
        {notice}
      </p>
      {error && (
        <div>
          <p role="alert" className="text-amber-200">
            {error}
          </p>
          <button
            type="button"
            onClick={() => {
              setError("");
              setReload((n) => n + 1);
            }}
            className="secondary-button min-h-11 mt-2"
          >
            Refresh support requests
          </button>
        </div>
      )}
      {rows.length > 0 && (
        <>
          <h4 className="mt-3 font-semibold">Recent requests</h4>
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg bg-slate-800 p-3">
                <p>
                  {r.topic} · {hasSupabaseConfig ? r.status : "Saved on this device"}
                </p>
                <p className="break-words text-xs">Reference: {r.id}</p>
                <p className="my-2 whitespace-pre-wrap break-words">{r.details}</p>
                <a
                  className="text-cyan-200 underline"
                  href={`${email}?subject=${encodeURIComponent(`Lucky Orbit support ${r.id}`)}&body=${encodeURIComponent(`Topic: ${r.topic}\nReference: ${r.id}\n\n${r.details}`)}`}
                >
                  Email this request
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="secondary-button min-h-11 mt-3"
            onClick={() => {
              if (!hasSupabaseConfig) {
                try {
                  localStorage.removeItem(key);
                  setRows([]);
                } catch {
                  setError("Saved requests could not be cleared.");
                }
              } else setReload((n) => n + 1);
            }}
          >
            {hasSupabaseConfig ? "Refresh requests" : "Clear saved requests"}
          </button>
        </>
      )}
    </section>
  );
}
