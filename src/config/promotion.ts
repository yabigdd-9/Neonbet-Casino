// Central promotion copy configuration.
// Changing the sign-up bonus, match %, rollover, or verification fee here
// updates every surface that consumes this config (sidebar, footer, auth
// modal, promotions data, and contact deep link). Safe demo defaults ship;
// override per-deployment with VITE_ env vars.
//
// NOTE: the verification fee is server-authoritative (decided by
// operator_settings.fee_usd) — this value is only client-side display copy.

interface PromotionConfig {
  signupBonus: string;
  matchPercent: string;
  rollover: string;
  verificationFee: string;
}

export const promotionConfig: PromotionConfig = {
  signupBonus: import.meta.env.VITE_SIGNUP_BONUS || "$100",
  matchPercent: import.meta.env.VITE_MATCH_PERCENT || "300%",
  rollover: import.meta.env.VITE_ROLLOVER || "10x",
  verificationFee: import.meta.env.VITE_VERIFICATION_FEE || "$75",
};

export default promotionConfig;
