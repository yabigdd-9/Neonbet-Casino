// Feature flags. Navigation and capabilities reflect these.
// Toggle with VITE_ENABLE_* env vars or edit directly.
import type { FeatureKey } from "../types";

function envBool(name: string, fallback: boolean): boolean {
  const value = import.meta.env[name];
  if (value === undefined || value === null || value === "") return fallback;
  return value === "true" || value === "1";
}

export interface FeatureFlags {
  demoGames: boolean;
  promotions: boolean;
  verification: boolean;
  favourites: boolean;
  recentlyPlayed: boolean;
  admin: boolean;
  casinoProviders: boolean;
  payments: boolean;
  liveWallet: boolean;
  withdrawals: boolean;
  account: boolean;
}

export const features: FeatureFlags = {
  demoGames: true,
  promotions: envBool("VITE_ENABLE_PROMOTIONS", true),
  verification: envBool("VITE_ENABLE_VERIFICATION", true),
  favourites: true,
  recentlyPlayed: true,
  admin: envBool("VITE_ENABLE_ADMIN", true),
  casinoProviders: false, // real provider aggregation, not yet implemented
  payments: false, // real payment processing, not yet implemented
  liveWallet: false, // real-money wallet, not yet implemented
  withdrawals: true, // manual withdrawal request flow
  account: true,
};

export type { FeatureKey };
export default features;
