// Feature flags. Navigation and capabilities reflect these.
// Toggle with VITE_ENABLE_* env vars or edit directly.

function envBool(name, fallback) {
  const value = import.meta.env[name];
  if (value === undefined || value === null || value === "") return fallback;
  return value === "true" || value === "1";
}

export const features = {
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

export default features;
