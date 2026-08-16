// Shared domain types for NeonBet Commercial V2.

export type GameOutcome = "five" | "four" | "three" | "two" | "bonus" | "miss";

export interface SlotGame {
  title: string;
  type?: string;
  provider?: string;
  symbols?: string[];
  emoji?: string;
  gradient?: string;
  tag?: string;
  tags?: string[];
  providerHighlight?: string;
  libraryIndex?: number;
}

export interface SpinResult {
  reels: string[];
  multiplier: number;
  label: string;
}

export interface CasinoProvider {
  name: string;
  highlight?: string;
}

export type VerificationStatus = "not_submitted" | "pending" | "verified" | "rejected";
export type SubmissionStatus = "pending" | "verified" | "rejected";
export type WithdrawalStatus = "pending" | "approved" | "paid" | "rejected";
export type AccountStatus = "active" | "restricted" | "suspended";
export type StatusLike = VerificationStatus | SubmissionStatus | WithdrawalStatus | AccountStatus;

export interface Profile {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  verification_status?: string;
  balance?: number;
  bonus_balance?: number;
  rollover_required?: number;
  rollover_progress?: number;
  verified?: boolean;
  [key: string]: unknown;
}

export interface VerificationSubmission {
  id?: string;
  user_id?: string;
  asset?: string;
  network?: string;
  tx_hash?: string;
  amount_usd?: number;
  status?: string;
  admin_notes?: string;
  profiles?: Profile;
  created_at?: string;
  [key: string]: unknown;
}

export interface WithdrawalRequest {
  id?: string;
  user_id?: string;
  amount?: number;
  amount_usd?: number;
  payout_method?: string;
  payout_address?: string;
  status?: string;
  admin_notes?: string;
  profiles?: Profile;
  created_at?: string;
  [key: string]: unknown;
}

export type AppMode = "demo" | "supabase";
export type FeatureKey =
  | "demoGames"
  | "promotions"
  | "verification"
  | "favourites"
  | "recentlyPlayed"
  | "admin"
  | "casinoProviders"
  | "payments"
  | "liveWallet"
  | "withdrawals"
  | "account";
