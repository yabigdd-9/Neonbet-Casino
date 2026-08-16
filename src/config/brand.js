// Central white-label brand configuration.
// A buyer can rebrand most of the product by editing THIS file (plus /public/brand assets).
// Safe demo placeholders are used by default. Override per-deployment with VITE_ env vars.

const envBrandName = import.meta.env.VITE_BRAND_NAME;
const envSupportEmail = import.meta.env.VITE_SUPPORT_EMAIL;

export const brand = {
  name: envBrandName || "NeonBet",
  shortName: "NB",
  tagline: "Play in the neon.",
  logo: "/brand/logo.svg",
  favicon: "/brand/favicon.svg",
  supportEmail: envSupportEmail || "support@example.com",
  primaryColor: "#22d3ee", // cyan-400
  secondaryColor: "#a855f7", // purple-500
  currency: "USD",
  social: {
    telegram: "",
    whatsapp: "",
  },
};

export default brand;
