import React, { useEffect, useRef, useState } from "react";
import { getReferralStatus, claimReferral } from "../../services/referrals.service";
import { hasSupabaseConfig } from "../../services/supabaseClient";
import { invitationCode, invitationLink, receivedInvitation } from "./invitations";
export default function ReferralPanel({ user, onCreditsVerified }) {
  const sharedEnabled = hasSupabaseConfig && import.meta.env.VITE_ENABLE_SHARED_REFERRALS === "true";
  return (
    <ReferralAccountPanel
      key={`${sharedEnabled}:${user?.id || "guest"}`}
      user={user}
      sharedEnabled={sharedEnabled}
      onCreditsVerified={onCreditsVerified}
    />
  );
}
function ReferralAccountPanel({ user, sharedEnabled, onCreditsVerified }) {
  const [code] = useState(invitationCode);
  const [received] = useState(() => receivedInvitation(code));
  const [status, setStatus] = useState("");
  const [shared, setShared] = useState(null);
  const [sharedError, setSharedError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [loading, setLoading] = useState(sharedEnabled && Boolean(user?.id));
  const [retry, setRetry] = useState(0);
  const mounted = useRef(false);
  useEffect(() => {
    if (shared) onCreditsVerified?.(shared.credits);
  }, [shared, onCreditsVerified]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setShared(null);
    setSharedError("");
    if (!sharedEnabled || !user?.id) return;
    setLoading(true);
    async function load() {
      try {
        const details = await getReferralStatus();
        if (active) setShared(details);
      } catch (error) {
        if (active) setSharedError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [sharedEnabled, user?.id, received, retry]);
  const link = shared ? invitationLink(shared.code) : sharedEnabled ? "" : invitationLink(code);
  return (
    <section id="referrals" className="surface scroll-mt-24 p-5 md:p-7" aria-labelledby="referral-heading">
      <p className="eyebrow">Play together</p>
      <h2 id="referral-heading" className="mt-2 text-2xl font-semibold">
        Invite a friend to Lucky Orbit
      </h2>
      <p className="mt-3 text-sm text-slate-300">
        Share free-play games. No payment is required, and credits have no cash value.
      </p>
      <label className="mt-4 block text-sm text-slate-300">
        Your invitation link
        <input
          readOnly
          value={link}
          placeholder="Your account invitation will appear here"
          onFocus={(event) => event.target.select()}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 p-3 text-sm"
        />
      </label>
      <button
        type="button"
        disabled={!link || loading}
        className="primary-button mt-3"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setStatus("Invitation link copied.");
          } catch {
            setStatus("Copy was unavailable. Select the link above and copy it manually.");
          }
        }}
      >
        Copy invitation link
      </button>
      <p role="status" className="mt-3 text-sm text-cyan-200">
        {status || (loading ? "Loading your account invitation…" : "")}
      </p>
      {sharedEnabled && !user?.id && (
        <p className="mt-3 text-sm text-slate-300">
          Sign in with a confirmed email to get your account invitation link.
        </p>
      )}
      {received && (
        <p className="mt-3 text-sm text-cyan-200">
          Invitation received on this browser. It does not confirm a signup or award credits.
        </p>
      )}
      {shared && (
        <p className="mt-4 text-sm text-cyan-200">
          {shared.credits} non-cash practice credits earned from {shared.count} verified referrals. These are
          not cash or withdrawable funds. Earned credits are included once in this browser session's practice
          balance; refreshing status does not add them again.
        </p>
      )}
      {shared && received && received !== shared.code && !shared.claimed && (
        <button
          type="button"
          disabled={claiming || loading}
          className="secondary-button mt-3"
          onClick={async () => {
            setClaiming(true);
            setSharedError("");
            try {
              await claimReferral(received);
              if (!mounted.current) return;
              setShared((current) => ({ ...current, claimed: true }));
              setStatus("Invitation applied. Your inviter earns 5 non-cash practice credits.");
              const updated = await getReferralStatus();
              if (mounted.current) setShared(updated);
            } catch (error) {
              if (mounted.current) setSharedError(error.message);
            } finally {
              if (mounted.current) setClaiming(false);
            }
          }}
        >
          {claiming ? "Verifying invitation…" : "Apply received invitation"}
        </button>
      )}
      {sharedError && (
        <div className="mt-3 text-sm text-amber-200">
          <p role="alert">{sharedError}</p>
          <button
            type="button"
            className="secondary-button mt-3"
            disabled={loading || claiming}
            onClick={() => setRetry((value) => value + 1)}
          >
            Refresh referral status
          </button>
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-slate-400">
        {shared
          ? "Shared referral verification is connected. Confirmed new accounts can attribute one invitation within 7 days of signup."
          : "Referral rewards are not active yet."}{" "}
        {shared
          ? "The inviter earns 5 non-cash practice credits for each eligible verified signup."
          : "The planned reward is 5 non-cash practice credits, pending shared signup verification."}{" "}
        There is no deposit requirement or withdrawal value.
      </p>
      <details className="mt-4 text-sm text-slate-300">
        <summary className="cursor-pointer py-3">Practice referral terms and account limits</summary>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The inviter receives 5 non-cash credits per eligible new confirmed-email account, up to 20
            referrals (100 credits) per inviter account.
          </li>
          <li>
            One invitation per new account, applied within 7 days of signup. The invitation code must exist
            before signup.
          </li>
          <li>
            Self-referrals and changing an already applied invitation are not allowed. Repeating a claim does
            not earn another reward.
          </li>
          <li>
            Credits have no purchase, transfer, redemption or withdrawal value. No deposit or wagering payment
            is required.
          </li>
          <li>
            Each new browser session starts with a fresh practice balance that includes verified earned
            referral credits. Public rewards remain inactive unless shared account referrals are enabled.
          </li>
        </ul>
      </details>
    </section>
  );
}
