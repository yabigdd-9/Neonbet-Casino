# NeonBet Architecture (Commercial V2)

This document explains how the refactored NeonBet codebase is wired together. The original
single-file `src/main.jsx` (~2973 lines) has been decomposed into a layered, feature-oriented
structure so a buyer can understand, rebrand, and extend the product without touching one
oversized file.

## Bootstrap

```
index.html ──▶ src/main.jsx ──▶ ReactDOM.createRoot
                            └──▶ imports ./app/App + ./styles/index.css
                                     └──▶ src/app/App.jsx
```

`src/main.jsx` is now a thin bootstrap: it mounts `<App />` inside `<React.StrictMode>`.

`src/app/App.jsx` exports a default `App` that wraps `AppContent` in `<ToastProvider>`.
`AppContent` owns all top-level state and wires the feature modules together.

## App shell (layout)

`src/components/layout/`:

- `Header.jsx` — sticky top bar: brand, optional global search, balance pill, notifications,
  login/register/logout, mobile drawer trigger.
- `Sidebar.jsx` — desktop left navigation rail with smooth scroll-to-section links.
- `MobileNav.jsx` — fixed bottom navigation for small screens (Home / Casino / Promos /
  Search / Account). Admin is intentionally excluded from the public bottom nav.
- `Footer.jsx` — licensing, responsible-play, payments notices and policy links.

`src/components/feedback/ToastProvider.jsx` — lightweight context-based toasts (success /
error / warning / info) with no external dependency.

## Feature modules

`src/features/*` holds self-contained UI per domain:

- `casino/` — `Hero`, `FeaturedGames`, `ArcadeGamesSection`, `SlotProviderLibrary`, `GameSearch`,
  `GameCard`, `GameLaunchModal`, `SlotGameModal`, `ArcadeGameModal`.
- `auth/` — `AuthModal` (login / register / reset password).
- `account/` — `AccountStatusPanel` (profile + rollover progress).
- `verification/` — `VerificationPanel` (manual crypto submission UI).
- `transactions/` — `WithdrawalRequestPanel` (manual withdrawal request UI).
- `admin/` — `AdminDashboard`, `AdminReviewModal`, `AdminProfileModal`.
- `promotions/` — `PromotionsSection`, `TermsSection`, `PolicyModalContent`.

## Service layer

All Supabase access lives in `src/services/*` — no React component performs raw database
operations:

- `supabaseClient.js` — creates the client from `VITE_SUPABASE_*` env vars (or `null` in demo
  mode) and exports `hasSupabaseConfig`.
- `auth.service.js` — session, auth-state subscription, sign in/up/out, password reset.
- `profiles.service.js` — profile read, admin profile list, demo-profile factory.
- `verification.service.js` — tx-hash validation, submission create/read, admin review RPC.
- `transactions.service.js` — withdrawal validation, create/read, admin review RPC.
- `admin.service.js` — admin summary + server-checked profile update RPC.

## Supabase backend

The schema (`supabase/schema.sql`) defines `profiles`, `verification_submissions`, and
`withdrawal_requests` with Row Level Security enabled. Admin actions are performed through
secured RPC functions (`review_verification_submission`, `review_withdrawal_request`,
`update_profile_admin`) that raise `42501` unless `private.is_admin()` passes. See
`docs/DATABASE.md`.

## Demo vs Supabase mode

`src/config/appMode.js` resolves the runtime mode:

- `demo` — no Supabase; local `localStorage` accounts, simulated balance, local submissions.
- `supabase` — real auth + Postgres; fails clearly if `VITE_SUPABASE_*` is missing while
  `VITE_APP_MODE=supabase` is set (falls back to demo rather than silently degrading to an
  unsafe state).

## Game provider abstraction

`src/providers/casino/LocalDemoProvider.js` implements the `CasinoProvider` interface
(`getGames`, `getGame`, `getCategories`, `launchDemo`, `launchReal`). The shipped provider
reads the static catalogue and runs browser-simulated play. A buyer adds a backend by
subclassing `CasinoProvider`. `launchReal` is intentionally unimplemented in this build.

## Payment provider abstraction

`src/providers/payment/PaymentProvider.js` defines the interface (`createDeposit`,
`createWithdrawal`, `getTransaction`, `verifyWebhook`) with a `MockPaymentProvider` that
records simulated requests and throws on `verifyWebhook`. No real money is moved.

## Configuration

`src/config/*` externalises everything a buyer changes:

- `brand.js` — name, short name, tagline, logos, support email, colours, currency, social.
- `contact.js` — Telegram / WhatsApp / support links (env-overridable; safe empty by default).
- `verification.js` — fee, accepted crypto methods (addresses blank by default for sale).
- `features.js` — feature flags toggled by `VITE_ENABLE_*` env vars.
- `tokens.js` — design tokens surfaced to Tailwind.
- `appMode.js` — runtime mode resolution.

## State

Top-level state (user, profile, balances, submissions, withdrawals, modals, auth) is held in
`AppContent` via `useState`/`useEffect`. Favourites and recently-played use the
`useFavorites` / `useRecentGames` hooks backed by `localStorage`. Supabase sessions are
subscribed through `auth.service.js` so refresh/restore works.

## Deployment

Static build to `dist/`. `base` is `./` for GitHub Pages. Supabase mode requires the anon key
exposed as `VITE_SUPABASE_*` build variables. See `README.md › Deployment`.
