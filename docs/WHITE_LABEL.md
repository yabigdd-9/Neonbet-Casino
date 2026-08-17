# White-Label Guide — NeonBet Commercial V2

This document explains how to rebrand the product for a buyer without touching
component code. Everything brand-sensitive is driven by config or environment
variables.

## 1. Quick start (recommended)

```bash
cp .env.example .env.local
npm run setup        # interactive wizard writes .env.local
npm ci
npm run dev          # demo works immediately
```

## 2. Brand identity

| What | Where |
|------|-------|
| Brand name / short name / tagline / description | `src/config/brand.ts` |
| Logo / wordmark / favicon / app icon / social preview | `public/brand/*.svg`, `public/brand/social-preview.png` |
| Support email / Telegram / WhatsApp | `VITE_SUPPORT_EMAIL`, `VITE_TELEGRAM_URL`, `VITE_WHATSAPP_URL` |
| Currency, theme colors | `src/config/brand.ts` + `src/config/tokens.ts` |

If a buyer does not supply a logo, `BrandMark` falls back to the brand short-name
text badge — **no broken images**.

## 3. Promotion & fee copy (single source)

`src/config/promotion.ts` exports `promotionConfig`, sourced from env with
safe defaults:

- `VITE_SIGNUP_BONUS` (default `$100`)
- `VITE_MATCH_PERCENT` (default `300%`)
- `VITE_ROLLOVER` (default `10x`)
- `VITE_VERIFICATION_FEE` (default `$75`)

Changing these updates the hero, sidebar, promotions, terms, account, and
metadata automatically.

## 4. SEO / metadata

`index.html` is generated at build time by `scripts/vite-meta-plugin.js` from
env. Override without editing HTML:

- `VITE_BRAND_NAME`, `VITE_SITE_URL`, `VITE_META_TITLE`, `VITE_META_DESCRIPTION`
- `VITE_THEME_COLOR`, `VITE_SOCIAL_PREVIEW`

## 5. Verification fee (server-authoritative)

The displayed verification fee is decided by the database, **not** the client.
In Supabase mode the amount is read from `operator_settings.fee_usd` (RPC
`get_verification_fee()`) and stored via `submit_verification_submission()`.
A malicious client cannot submit an arbitrary amount. To change the fee for a
brand, update `operator_settings` in the database — do **not** hard-code it in
SQL policy.

Apply the schema with migrations:

```bash
# run supabase/migrations/001_initial.sql then 002_operator_settings.sql
# then set the fee:
update public.operator_settings set fee_usd = 75 where id = 1;
```

## 6. App mode

- `VITE_APP_MODE=demo` → local simulated balance + localStorage (no backend).
- `VITE_APP_MODE=supabase` → real auth + database. **Fails clearly at bootstrap
  if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing** (never silently
  downgrades to demo).

## 7. Feature toggles

`src/config/features.ts` + `VITE_ENABLE_PROMOTIONS` / `VITE_ENABLE_VERIFICATION`
/ `VITE_ENABLE_ADMIN` control which nav/sections render. Disabled features hide
their links — the UI never implies functionality that is turned off.
