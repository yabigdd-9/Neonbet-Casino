// Status state-machine values + display styles/labels.
// Avoid free-form status strings scattered through UI.

export const VERIFICATION_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
};

export const SUBMISSION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
};

export const WITHDRAWAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  PAID: "paid",
  REJECTED: "rejected",
};

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  RESTRICTED: "restricted",
  SUSPENDED: "suspended",
};

export const statusStyles = {
  not_submitted: "border-slate-300/20 bg-slate-400/10 text-slate-200",
  pending: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  verified: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  approved: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  paid: "border-cyan-300/20 bg-cyan-400/10 text-cyan-200",
  rejected: "border-rose-300/20 bg-rose-400/10 text-rose-200",
};

export const statusLabels = {
  not_submitted: "Not submitted",
  pending: "Pending review",
  verified: "Verified",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

export function statusStyle(status) {
  return statusStyles[status] || statusStyles.not_submitted;
}

export function statusLabel(status) {
  return statusLabels[status] || status || "Unknown";
}

export default { VERIFICATION_STATUS, SUBMISSION_STATUS, WITHDRAWAL_STATUS, ACCOUNT_STATUS, statusStyles, statusLabels, statusStyle, statusLabel };
