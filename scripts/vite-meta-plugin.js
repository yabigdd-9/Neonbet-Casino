// Vite plugin: inject brand-aware SEO metadata into index.html at build time.
// One source of truth = the VITE_* env vars (with safe defaults). Buyers change
// VITE_BRAND_NAME / VITE_SITE_URL / VITE_META_TITLE etc. — never edit HTML.
//
// NOTE: this plugin runs in the Node config context, where `import.meta.env` is
// unavailable, so we read process.env directly (Vite exposes VITE_* to the
// build process via `loadEnv` / process.env). Env is read lazily inside
// metaPlugin() so values can be supplied at call time (and tests can override).

function envStr(name, fallback) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMetaBlock(meta) {
  const { brandName, siteUrl, title, description, themeColor, socialPreview } = meta;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="theme-color" content="${esc(themeColor)}" />`,
    `<link rel="canonical" href="${esc(siteUrl)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${esc(siteUrl)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(socialPreview)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="${esc(brandName)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(socialPreview)}" />`,
  ].join("\n    ");
}

export function metaPlugin() {
  // Resolve the brand metadata per build (lazy — reads process.env now).
  const siteMeta = {
    brandName: envStr("VITE_BRAND_NAME", "NeonBet"),
    siteUrl: envStr("VITE_SITE_URL", "https://yabigdd-9.github.io/Neonbet-Casino/"),
    title: envStr("VITE_META_TITLE", "NeonBet Casino"),
    description: envStr(
      "VITE_META_DESCRIPTION",
      "Mobile-first crypto casino lobby with a free $100 sign-up bonus, 300% welcome match, 10x rollover, and manual account verification.",
    ),
    themeColor: envStr("VITE_THEME_COLOR", "#020617"),
    socialPreview: envStr(
      "VITE_SOCIAL_PREVIEW",
      "https://yabigdd-9.github.io/Neonbet-Casino/social-preview.png",
    ),
  };

  return {
    name: "neonbet-meta-inject",
    transformIndexHtml(html) {
      const block = buildMetaBlock(siteMeta);
      return html
        .replace(/<!--META_BLOCK-->/g, block)
        .replace(/<!--BRAND_NAME-->/g, esc(siteMeta.brandName))
        .replace(/<!--SITE_URL-->/g, esc(siteMeta.siteUrl))
        .replace(/<!--SOCIAL_PREVIEW-->/g, esc(siteMeta.socialPreview));
    },
  };
}

export default metaPlugin;
