export interface AccountUser {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  contactMethod?: string;
  verification_status?: string;
}
export interface Profile {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: "user" | "admin";
  verification_status: string;
  bonus_balance: number;
  rollover_required: number;
  rollover_progress: number;
  admin_notes?: string;
}
export interface Submission {
  id: string;
  user_id: string;
  asset: string;
  network: string;
  tx_hash: string;
  amount_usd: number;
  status: string;
  created_at: string;
  admin_notes?: string;
}
export interface Withdrawal {
  id: string;
  user_id: string;
  amount_usd: number;
  payout_method: string;
  payout_address: string;
  status: string;
  created_at: string;
  admin_notes?: string;
}
export interface AccountState {
  profile: Profile | null;
  profiles: Profile[];
  submissions: Submission[];
  withdrawals: Withdrawal[];
  latestSubmission: Submission | null;
  latestWithdrawal: Withdrawal | null;
}
export interface AccountQuery {
  userId: string;
  isAdmin: boolean;
  limit?: number;
  page?: number;
}
export interface CryptoMethod {
  name: string;
  network: string;
}
export interface WithdrawalInput {
  amount_usd: number | string;
  payout_method: string;
  payout_address: string;
}
