import React, { useEffect, useState } from "react";
import { getReferralStatus, claimReferral } from "../../services/referrals.service";
import { hasSupabaseConfig } from "../../services/supabaseClient";
import { invitationCode, invitationLink, receivedInvitation } from "./invitations";
export default function ReferralPanel({ user }) {
  const [code] = useState(invitationCode);
  const [received] = useState(() => receivedInvitation(code));
  const [status, setStatus] = useState("");
  const [shared, setShared] = useState(null);
  const [sharedError, setSharedError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const sharedEnabled = hasSupabaseConfig && import.meta.env.VITE_ENABLE_SHARED_REFERRALS === "true";
  useEffect(() => {
    let active = true;
    setShared(null);
    setSharedError("");
    if (!sharedEnabled || !user?.id) return;
    async function load() {
      try {
        const details = await getReferralStatus();
        if (active) setShared(details);
      } catch (error) {
        if (active) setSharedError(error.message);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [sharedEnabled, user?.id, received]);
  const link = invitationLink(shared?.code || code);
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
          onFocus={(event) => event.target.select()}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 p-3 text-sm"
        />
      </label>
      <button
        type="button"
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
        {status}
      </p>
      {received && (
        <p className="mt-3 text-sm text-cyan-200">
          Invitation received on this browser. It does not confirm a signup or award credits.
        </p>
      )}
      {shared && (
        <p className="mt-4 text-sm text-cyan-200">
          {shared.credits} non-cash practice credits earned from {shared.count} verified referrals. These are
          not cash or withdrawable funds.
        </p>
      )}
      {shared && received && received !== shared.code && !shared.claimed && (
        <button
          type="button"
          disabled={claiming}
          className="secondary-button mt-3"
          onClick={async () => {
            setClaiming(true);
            setSharedError("");
            try {
              await claimReferral(received);
              setShared(await getReferralStatus());
            } catch (error) {
              setSharedError(error.message);
            } finally {
              setClaiming(false);
            }
          }}
        >
          {claiming ? "Verifying invitation…" : "Apply received invitation"}
        </button>
      )}
      {sharedError && (
        <p role="alert" className="mt-3 text-sm text-amber-200">
          {sharedError}
        </p>
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
    </section>
  );
}
