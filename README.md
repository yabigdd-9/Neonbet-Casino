# NeonBet — Commercial V2

> Premium React + Vite + Tailwind casino frontend and Supabase starter platform featuring a configurable casino lobby, browser-based demo games, account flows, verification/admin workflows, promotions, white-label configuration and extensible provider architecture.

**NeonBet is a frontend-only casino lobby starter. It is not a real-money gambling platform.** Games are browser-simulated, verification is a manual crypto step, and no payment processor, wallet custody, or live game provider is connected (unless a buyer integrates one). Do not represent it as regulated, sportsbook, payment, KYC, or turnkey infrastructure.

---

## What is NeonBet

NeonBet is a white-label-ready casino lobby UI built with React 19, Vite, and Tailwind CSS. It ships with a demo lobby, simulated slot and arcade games, account flows (local or Supabase auth), a manual crypto verification submission flow, an admin review console, and a promotions section. Everything is driven by centralised config and static data so a buyer can rebrand without touching feature logic.

Two runtime modes are supported:

- **Demo mode** — runs entirely in the browser using `localStorage`. No backend, no accounts server, no secrets.
- **Supabase mode** — optional email/password auth, server-side data, and admin review via secured RPC functions (Row Level Security enforced).

## Screenshots

> Placeholder note: screenshots are not included in this package. Add product images to `docs/screenshots/*.png` (e.g. `docs/screenshots/lobby.png`, `docs/screenshots/admin.png`, `docs/screenshots/verification.png`) and reference them here.

![Lobby](docs/screenshots/lobby.png)
![Admin review](docs/screenshots/admin.png)
![Verification flow](docs/screenshots/verification.png)

## Feature overview

- Configurable casino lobby (hero, featured games, arcade section, slot-provider catalogue).
- Browser-simulated slot and arcade games sharing a local balance.
- Account flows: local demo accounts or Supabase email/password auth, reset-password.
- Manual crypto verification submission (USDT/BSC, BTC, ETH, BNB) with tx-hash paste.
- Admin review console (server-checked) for verification and withdrawal requests.
- Bonus / rollover display (10 USD-style copy, 100 USD sign-up + 300% match, 10x rollover).
- Promotions and account-terms/policy content (configurable copy).
- Favourites and recently-played lists.
- White-label config: brand, colours, contact, features, game and promo data.
- Provider abstractions for casino (`CasinoProvider`) and payments (`PaymentProvider`).
- Responsive layout (sidebar + mobile nav) with a dark neon theme.

See `docs/FEATURE_MATRIX.md` for a status breakdown (real / mock / partial).

## Demo mode

With `VITE_APP_MODE=demo` (or no Supabase env vars), the app runs with:

- In-browser accounts stored in `localStorage` (`neonbetUser`, etc.).
- Simulated balance (`useState`, default 100) updated by local games only.
- Verification submissions and withdrawal requests stored in `localStorage`.
- The admin dashboard is effectively unavailable (no server role source).

No network calls are made. This is the zero-dependency, safe-by-default mode for previews and demos.

## Supabase mode

Set `VITE_APP_MODE=supabase` plus `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The app then uses `supabase.auth` for sessions, persists profiles/submissions/withdrawals to Postgres, and enforces access with Row Level Security. Admin actions are performed through server-checked RPC functions guarded by `private.is_admin()`. Apply `supabase/schema.sql` to your project first (see docs/DATABASE.md).

> The Supabase anon key is safe to expose; Row Level Security and admin RPCs enforce all access. Never ship a service-role key to the client.

## Architecture

See `docs/ARCHITECTURE.md` for the full breakdown. Source layout:

```
src/
  main.jsx                 React root
  app/App.jsx              App shell + state orchestration
  components/
    feedback/ToastProvider.jsx
    layout/{Header,Sidebar,MobileNav,Footer}.jsx
    ui/{Button,Card,Modal,Input,Textarea,Select,Badge,StatusBadge,Spinner,Skeleton,ErrorState,EmptyState}.jsx
  config/{appMode,brand,contact,features,tokens,verification}.js
  data/{arcadeGames,games,promotions,slotProviders}.js
  features/
    account/AccountStatusPanel.jsx
    admin/{AdminDashboard,AdminReviewModal,AdminProfileModal}.jsx
    auth/AuthModal.jsx
    casino/{Hero,FeaturedGames,ArcadeGamesSection,SlotProviderLibrary,GameSearch,GameLaunchModal,SlotGameModal,ArcadeGameModal,GameCard}.jsx
    promotions/index.jsx
    transactions/WithdrawalRequestPanel.jsx
    verification/VerificationPanel.jsx
  hooks/useGameHistory.js
  lib/{gameEngine,storage,status}.js
  providers/
    casino/LocalDemoProvider.js
    payment/PaymentProvider.js
  services/{supabaseClient,auth.service,profiles.service,verification.service,transactions.service,admin.service}.js
```

## Technology

- React 19.2.6, React DOM 19.2.6
- Vite 8.0.13 (`@vitejs/plugin-react` 6.0.2)
- Tailwind CSS 3.4.19, PostCSS 8.5.14, Autoprefixer 10.5.0
- lucide-react 1.16.0 (icons)
- @supabase/supabase-js 2.105.4 (optional backend)

## Installation

Requires Node.js 18+ and a package manager (npm shown).

```bash
git clone <repo-url> neonbet
cd neonbet
npm install
```

## Quick start

```bash
# Demo mode (no backend) — starts immediately
npm run dev

# Supabase mode
cp .env.example .env        # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

Open the printed local URL. In Supabase mode, run `supabase/schema.sql` against your project and promote one account to `admin` with:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Environment variables

All client variables are documented in [`.env.example`](.env.example). Key flags:

- `VITE_APP_MODE` — `demo` | `supabase`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase project (anon key only)
- `VITE_BRAND_NAME`, `VITE_SUPPORT_EMAIL` — branding
- `VITE_TELEGRAM_URL`, `VITE_WHATSAPP_URL` — external support links
- `VITE_ENABLE_PROMOTIONS`, `VITE_ENABLE_VERIFICATION`, `VITE_ENABLE_ADMIN` — feature toggles

## White-labeling

Rebrand without code changes: edit `src/config/brand.js` + `/public/brand` assets, `src/config/tokens.js` + `tailwind.config.js` (colours), `src/config/contact.js` (support via env), `src/data/promotions.js` (offers), `src/data/*.js` (games), `src/config/verification.js` (crypto methods), and `src/config/features.js` (toggles). Replace the demo game provider by implementing `CasinoProvider` (see `docs/WHITE_LABEL.md`).

## Game provider abstraction

`src/providers/casino/LocalDemoProvider.js` implements the `CasinoProvider` interface (`getGames`, `getGame`, `getCategories`, `launchDemo`, `launchReal`). The shipped provider reads the static catalogue and runs browser-simulated play. A buyer adds a real provider by subclassing `CasinoProvider` and returning real game launch URLs — `launchReal` is intentionally unimplemented in this build.

## Verification workflow

1. User submits a crypto tx hash for a chosen asset/network (USDT/BSC, BTC, ETH, BNB) via `VerificationPanel`.
2. A `verification_submissions` row is created (`status = pending`); a trigger flips the profile to `pending`.
3. A unique partial index blocks a second pending submission per user.
4. An admin reviews via `review_verification_submission` RPC (server-checked), setting `verified`/`rejected`.

This is a **manual** review — there is no automated on-chain check. See docs/ARCHITECTURE.md and docs/DATABASE.md.

## Admin

The admin console (`features/admin`) lists users, pending verifications, and withdrawals. Review actions call secured RPCs (`review_verification_submission`, `review_withdrawal_request`, `update_profile_admin`) that raise `42501` unless `private.is_admin()` passes. Admin is gated on `profile.role = 'admin'` and requires Supabase mode. There is no self-serve admin-promotion path — promote the first admin by SQL (above).

## Testing

```bash
npm run test
```

This repository does not yet ship a test runner or test files; the CI gate is `npm ci && npm run build`. Add a runner such as Vitest and a `test` script to `package.json` to enable automated checks (this starter does not modify `package.json`).

## Build

```bash
npm run build      # production bundle to dist/
npm run preview    # serve the built bundle locally
```

## Deployment

- **GitHub Pages** — build with `base` set to the repo path; publish `dist/`. Supabase mode needs the anon key as a repository secret exposed as `VITE_SUPABASE_*`.
- **Vercel** — import the repo; set the `VITE_*` env vars in project settings; build `npm run build`, output `dist`.
- **Supabase** — use Supabase for the backend only; deploy the static frontend to any host. Apply `supabase/schema.sql` in the SQL editor or via Supabase CLI.
- **Custom domain** — point DNS at your static host; add the domain in the host's dashboard and set the respective `VITE_*` vars.
- **Production limitations** — RLS and the `private` schema must be applied and verified live; the admin role is promoted by manual SQL; demo mode has no real admin/review; no payment, wallet, or live provider is wired.

## Known limitations

- Not a real-money platform: games are simulated, balance is browser-only.
- No payment gateway, wallet connection, or automated KYC.
- No automated on-chain verification; review is manual.
- Bonus/rollover are display-only copy (no wagering/ledger engine).
- No tests, no TypeScript, no self-serve admin onboarding.
- Single-brand schema (no multi-tenant column); per-brand bonus defaults are row-level.
- Accessibility and a full mobile audit are not yet completed.

## Commercial integration notes

NeonBet is sold as source/starter code, not as a turnkey operator. Buyers are responsible for licensing, jurisdiction compliance, payment providers, wallet custody, KYC, and live game-provider contracts. See `docs/COMMERCIAL_READINESS.md` for what is and is not included, and `docs/WHITE_LABEL.md` for rebranding.

## Licence

Placeholder — licence terms to be defined by the owner (Dion). See `docs/COMMERCIAL_READINESS.md` for licensing tiers.
