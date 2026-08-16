# NeonBet White-Label Guide (Commercial V2)

A buyer can rebrand most of NeonBet by editing a small number of files. No feature logic
needs to change.

## Change the brand name

- `src/config/brand.js` → `name`, `shortName`, `tagline`, `supportEmail`, `primaryColor`,
  `secondaryColor`, `currency`, `social`.
- Or override per-deployment with `VITE_BRAND_NAME` / `VITE_SUPPORT_EMAIL`.

## Change the logo / favicon

- Replace `/public/brand/logo.svg` and `/public/brand/favicon.svg`.
- Point `brand.logo` / `brand.favicon` at your asset paths.
- Update `<link rel="icon">` and the page `<title>` in `index.html`.

## Change the colours

- `src/config/tokens.js` — central design tokens (background, surface, brand, success,
  warning, danger, info, radius).
- `tailwind.config.js` — `boxShadow.neon` / `boxShadow.gold` accents.
- The primary neon accent is `cyan-400` (`#22d3ee`); change it in both places for a coherent
  re-theme.

## Change promotions

- `src/data/promotions.js` → `promos` (cards), `terms` (account-terms grid), `policyPages`
  (Terms / Privacy / Responsible Play modals).

## Change support contact

- `src/config/contact.js` → `telegramUrl`, `whatsappUrl`, `supportEmail`.
- Prefer env overrides: `VITE_TELEGRAM_URL`, `VITE_WHATSAPP_URL`, `VITE_SUPPORT_EMAIL`.
- Empty by default — the UI shows a "not configured" notice instead of dead links.

## Change game data

- `src/data/games.js` — featured lobby slots.
- `src/data/arcadeGames.js` — Dice / Plinko / Crash definitions.
- `src/data/slotProviders.js` — the deep provider catalogue (24 providers). These are lobby
  themes only; toggle provider availability copy as needed.

## Change verification methods

- `src/config/verification.js` → `feeUsd`, `acceptedCrypto` (name, network, label, **address**,
  `qrCodeSrc`, notice, note), `contactLinks`.
- Ship with **blank** wallet addresses; operators paste their own before distribution.

## Enable / disable features

- `src/config/features.js` → `demoGames`, `promotions`, `verification`, `favourites`,
  `recentlyPlayed`, `admin`, `withdrawals`, `casinoProviders`, `payments`, `liveWallet`.
- Toggle with `VITE_ENABLE_PROMOTIONS` / `VITE_ENABLE_VERIFICATION` / `VITE_ENABLE_ADMIN`.
- Navigation and sections reflect these flags.

## Configure Supabase

- Copy `.env.example` → `.env`, fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`,
  set `VITE_APP_MODE=supabase`.
- Apply `supabase/schema.sql` to the project. Promote the first admin by SQL (see
  `docs/DATABASE.md`).

## Replace the demo game provider

- `src/providers/casino/LocalDemoProvider.js` implements `CasinoProvider`.
- Subclass `CasinoProvider` and implement real `getGames` / `launchReal` (return real launch
  URLs). Swap the instance in `App.jsx`. `launchReal` throws in this build by design.
