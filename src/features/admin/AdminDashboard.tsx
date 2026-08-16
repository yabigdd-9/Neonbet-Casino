// Admin dashboard: users, verification queue, withdrawal queue.
import React, { useState } from "react";
import type { Profile } from "../../types";
import StatusBadge from "../../components/ui/StatusBadge";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { formatMoney } from "../../lib/storage";

interface AdminDashboardProps {
  profile: Profile | null;
  profiles: Profile[];
  submissions: any[];
  withdrawals: any[];
  onReview: (submission: any, status: string) => void;
  onReviewWithdrawal: (withdrawal: any, status: string) => void;
  onUpdateProfile: (profile: Profile) => void;
  adminSaving: boolean;
}

export default function AdminDashboard({
  profile,
  profiles,
  submissions,
  withdrawals,
  onReview,
  onReviewWithdrawal,
  onUpdateProfile,
  adminSaving,
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  if (profile?.role !== "admin") return null;

  const matchesFilters = (item: any, userText: string) => {
    const query = searchTerm.trim().toLowerCase();
    const haystack = `${userText} ${JSON.stringify(item)}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  };

  const filteredSubmissions = submissions.filter((s) =>
    matchesFilters(
      s,
      `${s.profiles?.username || ""} ${s.profiles?.email || ""} ${s.user_id || ""}`,
    ),
  );
  const filteredWithdrawals = withdrawals.filter((w) =>
    matchesFilters(
      w,
      `${w.profiles?.username || ""} ${w.profiles?.email || ""} ${w.user_id || ""}`,
    ),
  );
  const filteredProfiles = profiles.filter((p) =>
    matchesFilters(p, `${p.username} ${p.email} ${p.id}`),
  );

  const stats: [string, number][] = [
    ["Users", profiles.length],
    ["Pending verifications", submissions.filter((s) => s.status === "pending").length],
    ["Verified users", profiles.filter((p) => p.verification_status === "verified").length],
    ["Pending withdrawals", withdrawals.filter((w) => w.status === "pending").length],
  ];

  return (
    <section
      id="admin"
      className="scroll-mt-24 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 md:p-8"
    >
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
          Admin dashboard
        </div>
        <h2 className="mt-2 text-2xl font-black md:text-3xl">Admin Review</h2>
        <p className="mt-2 text-slate-300">
          Search users, review transaction hashes, and manage withdrawal requests.
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              {label}
            </div>
            <div className="mt-2 text-3xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search username, email, hash, wallet, or user id"
          className="py-4 pl-11"
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-white">Users</h3>
        {filteredProfiles.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-slate-300">
            No users match.
          </div>
        )}
        {filteredProfiles.map((userProfile) => (
          <div
            key={userProfile.id}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
          >
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={userProfile.verification_status || "not_submitted"} />
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200">
                    {userProfile.role}
                  </span>
                </div>
                <div className="mt-3 text-lg font-black text-white">
                  {userProfile.username || "Unnamed user"}
                </div>
                <p className="mt-1 break-all text-sm text-slate-400">
                  {userProfile.email || userProfile.id}
                </p>
                <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                  <div className="rounded-2xl bg-white/[0.06] px-3 py-2">
                    <span className="text-slate-400">Bonus</span>{" "}
                    <span className="ml-2 font-black text-white">
                      {formatMoney(userProfile.bonus_balance || 0)}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/[0.06] px-3 py-2">
                    <span className="text-slate-400">Rollover</span>{" "}
                    <span className="ml-2 font-black text-white">
                      {formatMoney(userProfile.rollover_progress || 0)}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/[0.06] px-3 py-2">
                    <span className="text-slate-400">Required</span>{" "}
                    <span className="ml-2 font-black text-white">
                      {formatMoney(userProfile.rollover_required || 0)}
                    </span>
                  </div>
                </div>
                {Boolean(userProfile.admin_notes) && (
                  <p className="mt-2 text-sm text-amber-100">
                    Note: {userProfile.admin_notes as string}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={adminSaving}
                  onClick={() => onUpdateProfile(userProfile)}
                >
                  Edit balance
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <h3 className="text-lg font-black text-white">Verification submissions</h3>
        </div>
        {filteredSubmissions.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-slate-300">
            No verification submissions match.
          </div>
        )}
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
          >
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={submission.status || "pending"} />
                  <span className="text-sm text-slate-400">
                    {submission.asset} / {submission.network}
                  </span>
                </div>
                <div className="mt-3 break-all font-mono text-sm text-white">
                  {submission.tx_hash}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  User:{" "}
                  {submission.profiles?.username ||
                    submission.profiles?.email ||
                    submission.user_id}
                </p>
                {submission.admin_notes && (
                  <p className="mt-2 text-sm text-amber-100">Note: {submission.admin_notes}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="success"
                  size="sm"
                  disabled={adminSaving}
                  onClick={() => onReview(submission, "verified")}
                >
                  Verify
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={adminSaving}
                  onClick={() => onReview(submission, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={adminSaving}
                  onClick={() => onReview(submission, "pending")}
                >
                  Pending
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-black text-white">Withdrawal requests</h3>
        {filteredWithdrawals.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-slate-300">
            No withdrawal requests match.
          </div>
        )}
        {filteredWithdrawals.map((withdrawal) => (
          <div
            key={withdrawal.id}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
          >
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={withdrawal.status || "pending"} />
                  <span className="text-sm text-slate-400">
                    {formatMoney(withdrawal.amount_usd)} / {withdrawal.payout_method}
                  </span>
                </div>
                <div className="mt-3 break-all font-mono text-sm text-white">
                  {withdrawal.payout_address}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  User:{" "}
                  {withdrawal.profiles?.username ||
                    withdrawal.profiles?.email ||
                    withdrawal.user_id}
                </p>
                {withdrawal.admin_notes && (
                  <p className="mt-2 text-sm text-amber-100">Note: {withdrawal.admin_notes}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {["approved", "paid", "rejected", "pending"].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={
                      status === "rejected"
                        ? "danger"
                        : status === "paid"
                          ? "primary"
                          : status === "approved"
                            ? "success"
                            : "ghost"
                    }
                    disabled={adminSaving}
                    onClick={() => onReviewWithdrawal(withdrawal, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
