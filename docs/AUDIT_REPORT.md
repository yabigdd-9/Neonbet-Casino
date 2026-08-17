# Audit Report — NeonBet Commercial V2

**Date:** 2026-08-17 · **Baseline SHA:** `5ded8ea98d404bfb5d4bda774d9bc8a4a325ed45`
**Current SHA (working tree):** `a1407e3` + P1 working changes · **Branch:** `upgrade/neonbet-commercial-v2`
Scope: code architecture, security, Supabase schema, accessibility, mobile/responsive, demo-vs-Supabase mode, and secret scan. Findings are grounded in the actual repo files at the baseline commit.

> **Current-state note (2026-08-17, P1 complete):** The baseline below was written against the original `5ded8ea` monolith. The repo has since been modularized (branch `upgrade/neonbet-commercial-v2`, 36 `.tsx`/11 `.ts` files, tests + ESLint/Prettier + TypeScript + secret-scan guard). **P1 (app-mode single source of truth) is now RESOLVED:** `VITE_APP_MODE=supabase` + missing credentials throws a clear bootstrap error instead of silently downgrading to demo; all runtime branching uses `IS_SUPABASE`/`IS_DEMO`. Still open: **P2** (verification-fee server authority — `schema.sql:333` still hardcodes `amount_usd = 75`), **P5** (brand-aware `index.html` metadata — hard-coded NeonBet copy remains), and the broader frontend/mobile/a11y/QA phases.

## a) Code Architecture
- **Monolith risk — CRITICAL.** All UI, state, data access, routing, game logic, and config live in `src/main.jsx` (2,973 lines / ~130 KB). Only `src/styles.css` and `src/supabaseClient.js` sit outside it.
- **No modular structure.** No `components/`, `hooks/`, `lib/`, `pages/`, `config/`, or `routes/`. Nothing is importable or reusable in isolation.
- **No tests.** Zero test files; no vitest/jest config. No CI test gate beyond `npm ci` + `npm run build`.
- **No TypeScript.** Plain `.jsx`. No type safety on the Supabase schema, props, or config objects.
- **Config buried in code.** Wallet addresses, contact links, provider names, and bonus/rollover copy are hard-coded as inline JS literals (see §b, §g).
- **State management.** Single large component with many `useState` hooks; local-account fallback reads/writes `window.localStorage` keys (`neonbetUser`, `neonbetRolloverProgress`, `neonbetVerificationSubmissions`, `neonbetWithdrawalRequests`, `neonbetFavorites`, `neonbetRecentGames`).

## b) Security
- **Client key handling — GOOD.** `src/supabaseClient.js` builds the client only from `import.meta.env.VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` and exports a `hasSupabaseConfig` flag. **No service-role key is present client-side.** Only the anon key (safe to expose) is used, and it is gated behind env vars.
- **RLS — PRESENT and well-formed (in `supabase/schema.sql`).** `enable row level security` is set on all three tables. Policies restrict row reads/inserts to the owning user or `private.is_admin()`. Insert policies enforce `status = 'pending'` and block `admin_notes`. This is a sound, defensible design — **provided the schema is actually applied to the live project** (LAUNCH_READINESS_AUDIT notes the live schema was not confirmed applied from this workspace).
- **Admin authorization — SERVER-CHECKED.** `private.is_admin()` is a `SECURITY DEFINER` SQL function; admin RPCs (`review_verification_submission`, `review_withdrawal_request`, `update_profile_admin`) call `private.is_admin()` and raise `42501` if not admin. The `private` schema is revoked from `public`/`anon`; `private.is_admin()` is granted only to `authenticated`/`service_role`. Admin checks are therefore enforced server-side, not trusted from the client.
- **Hard-coded personal/secrets that MUST be externalized before sale — HIGH (commercial blocker).**
  - Live crypto wallet addresses embedded in `src/main.jsx`:
    - `0x3f8b…a7d29` (USDT/BSC, ETH/ETH, BNB/BSC)
    - `1Pjt…AU3Sx` (BTC/BTC)
  - Personal contact links embedded in `src/main.jsx`:
    - Telegram: `https://t.me/&lt;owner-handle&gt;`
    - WhatsApp: `https://wa.me/&lt;owner-number&gt;`
  - These belong to the current owner and are wired into the `contactLinks` object and the deposit-options list. For a white-label/buyer product they must move to environment/config or admin settings; leaving them ships the owner's live wallet and personal messaging accounts to every buyer.

## c) Supabase Schema Review (`supabase/schema.sql`, 381 lines)
- **Tables:** `public.profiles`, `public.verification_submissions`, `public.withdrawal_requests`. All `on delete cascade` to `auth.users`.
- **Constraints:** column length/range checks, a partial unique index allowing only one `pending` verification submission per user, and non-negative balance/rollover guards. Well structured.
- **Triggers:** `set_updated_at()` on all tables; `handle_new_user()` auto-creates a `profiles` row on signup; `mark_profile_pending_verification()` flips status on new submission. All `SECURITY DEFINER` with `search_path` pinned.
- **Functions (admin):** `review_verification_submission`, `review_withdrawal_request`, `update_profile_admin` — all gated by `private.is_admin()`.
- **Grants:** tables/functions granted to `authenticated`/`service_role` only; `anon` has no direct table access. RPCs granted to `authenticated` (so a logged-in admin can call them) and `service_role`.
- **Gaps for white-label:** role promotion to `admin` is a manual SQL step (`update public.profiles set role='admin' where email=...`) — there is no self-serve/admin onboarding path. No seeded demo data, no multi-tenant/brand column for white-labeling. `bonus_balance` defaults to 100 and `rollover_required` to 1000 (the 100 USD / 10x copy) — hardcoded per-row, not per-brand config.

## d) Accessibility Gaps — HIGH
- **Zero ARIA attributes and zero `role=` attributes** in `src/main.jsx` (grep count = 0).
- Only **2 `alt=` attributes** exist across the whole UI.
- No semantic landmarks, no `aria-live` for balance/status updates, no focus management for the many modals (login, verification, withdrawal, game, review), no visible focus styles noted, no skip-link, no `lang`/heading-order audit.
- Color/contrast and keyboard-traversal of the simulated games are unverified.
- This is a hard blocker for a premium buyer-ready product and for any regulated/jurisdiction claims.

## e) Mobile / Responsive Status — PARTIAL
- Responsive Tailwind prefixes **are present**: `sm:` (8), `md:` (44), `lg:` (14), `xl:` (33) occurrences, so layouts adapt at breakpoints.
- However there is **no systematic mobile audit**: the responsive rules are scattered inline across a 2,973-line file with no component boundaries, no mobile test matrix, and a11y/keyboard behavior on small screens is unverified. README smoke test only asserts "no console errors" on mobile reload, not layout correctness or touch ergonomics.

## f) Demo vs Supabase Mode Handling
- A single `hasSupabaseConfig` boolean (from `src/supabaseClient.js`) drives the entire app.
- **Supabase mode (`hasSupabaseConfig === true`):** uses `supabase.auth.getSession()` + `onAuthStateChange`; sign-up/login/reset-password via `supabase.auth`; submissions/withdrawals via `supabase.from(...)`; admin gated on `profile?.role === 'admin'` and served through the secured RPCs.
- **Local/demo mode (`hasSupabaseConfig === false`):** falls back to `window.localStorage` accounts (`neonbetUser` etc.). Auth, submissions, withdrawals, favorites, and recent games are stored locally and never leave the browser. The admin dashboard is effectively unavailable in demo mode (no role source).
- Risk: the two modes are two code paths inside the same monolith with no shared abstraction; behavior diverges (e.g., demo mode has no real admin review). A buyer running without Supabase gets a non-functional "admin" experience.

## g) Secret Scan Results
Method: `grep -rInE` for `supabase.co`, JWT `eyJ…`, `PRIVATE_KEY`, `mnemonic`, `api_key`, and the known wallet/contact strings, across the repo excluding `node_modules/`, `dist/`, `.git/`.

- **No live Supabase anon/JWT key is committed.** The only `supabase.co` hits are placeholders in `README.md` (`VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co`, `VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`). `deploy.yml` references secrets via `${{ secrets.VITE_SUPABASE_URL }}` (GitHub Actions — correct, not leaked).
- **No private key, mnemonic, or `api_key` secret** found in source.
- **Confirmed hard-coded non-key secrets (owner-specific, must be externalized):** the two wallet addresses and the Telegram/WhatsApp links listed in §b. These are not API credentials but are owner-specific operational secrets that should never ship to a buyer.
- **Git history:** only one commit on the branch; no historical key leak detected in the scanned tree. (Full history scan is shallow here — recommend a `git log -p` sweep before public release as a final gate.)

## Summary of Blockers (priority order)
1. Monolith (`src/main.jsx`, 2,973 lines) — blocks modularity, review, and white-labeling.
2. Hard-coded wallet + personal contact links — must be externalized before any sale.
3. Zero accessibility (no ARIA/roles/alt) — premium-product blocker.
4. No tests / no TypeScript — quality and buyer-confidence gap.
5. Demo vs Supabase divergence — needs a unified, documented mode strategy.
6. Live schema application + admin self-onboarding — verify RLS is actually live and add a safe admin-promotion path.
