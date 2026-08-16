// Status state-machine values + display styles/labels.
// Avoid free-form status strings scattered through UI.
import type { StatusLike, VerificationStatus } from "../types";

export const VERIFICATION_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export const SUBMISSION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export const WITHDRAWAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  PAID: "paid",
  REJECTED: "rejected",
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  RESTRICTED: "restricted",
  SUSPENDED: "suspended",
} as const;

export const statusStyles: Record<string, string> = {
  not_submitted: "border-slate-300/20 bg-slate-400/10 text-slate-200",
  pending: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  verified: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  approved: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  paid: "border-cyan-300/20 bg-cyan-400/10 text-cyan-200",
  rejected: "border-rose-300/20 bg-rose-400/10 text-rose-200",
};

export const statusLabels: Record<string, string> = {
  not_submitted: "Not submitted",
  pending: "Pending review",
  verified: "Verified",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

export function statusStyle(status: StatusLike | string): string {
  return statusStyles[status] || statusStyles.not_submitted;
}

export function statusLabel(status: StatusLike | string): string {
  return statusLabels[status] || (status as string) || "Unknown";
}

export default { VERIFICATION_STATUS, SUBMISSION_STATUS, WITHDRAWAL_STATUS, ACCOUNT_STATUS, statusStyles, statusLabels, statusStyle, statusLabel };
