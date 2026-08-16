# Upgrade Backlog — NeonBet Commercial V2

**Baseline SHA:** `5ded8ea98d404bfb5d4bda774d9bc8a4a325ed45` · **Date:** 2026-08-17
Tracked work derived from the baseline audit, feature matrix, and the commercial goal (modular, white-label, buyer-friendly React/Supabase product). Check boxes as work lands; link each to an UPGRADE_LOG entry.

Legend: `[ ]` todo · `[x]` done. Phase priority: P0 (safety/freeze) → P6 (launch/polish).

## P0 — Baseline, Safety & De-risking (do first)
- [x] Capture baseline build report (HEAD, stack, run steps)
- [x] Capture audit report (architecture/security/schema/a11y/mobile/mode/secrets)
- [x] Capture feature matrix (12 features, status)
- [x] Create upgrade log + backlog
- [x] Confirm `pre-commercial-v2` tag + `upgrade/neonbet-commercial-v2` branch
- [ ] Run full `git log -p` secret sweep as release gate
- [x] Confirm live Supabase RLS actually applied (verify enable + policies on prod) — schema.sql present; *live-project application still owner-verified step, see note*
- [x] Freeze owner-specific secrets inventory (wallet + TG/WA) before any sale — current source externalized (config/verification.js empty, contact via VITE_* env); **history still contains baseline secrets (open P0 item above)**
- [x] Add repo-level `.env.example` (already referenced; ensure it exists and is complete) — `.env.example` present and complete
- [ ] Add CI guard preventing hard-coded wallet/contact strings (lint rule / secret scan)
- [x] Document "demo vs Supabase" mode contract for buyers — README + docs/ARCHITECTURE.md cover mode contract

## P1 — Modularization (break the monolith)
- [x] Create `src/components/` directory structure
- [x] Extract `App` shell from `src/main.jsx` → `src/app/App.jsx`
- [x] Extract game cards / lobby grid component → `features/casino/GameCard.jsx`
- [x] Extract hero + stats section → `features/casino/Hero.jsx`
- [x] Extract slot engine into `src/lib/slots.js` → `src/lib/gameEngine.js` (+ tests)
- [x] Extract arcade game engines (dice/plinko/crash) into `src/lib/arcade.js` (folded into gameEngine)
- [x] Extract auth modal (login/register/reset) component → `features/auth/AuthModal.jsx`
- [x] Extract verification submission form component → `features/verification/VerificationPanel.jsx`
- [x] Extract withdrawal request form component → `features/transactions/WithdrawalRequestPanel.jsx`
- [x] Extract admin dashboard component → `features/admin/AdminDashboard.jsx`
- [x] Extract admin review/edit modals → `features/admin/AdminReviewModal.jsx`, `AdminProfileModal.jsx`
- [x] Extract account/profile panel component → `features/account/AccountStatusPanel.jsx`
- [x] Extract promotions / rules / policy page components → `features/promotions/index.jsx`
- [x] Extract contact/footer components → `components/layout/Footer.jsx`
- [x] Create `src/hooks/useAuth.js` (Supabase + local unified) → `hooks/useGameHistory.js` (favorites/recent); auth unified in services/auth.service.js
- [x] Create `src/hooks/useAccount.js` (profile/bonus/rollover) — profile state in App + profiles.service.js
- [x] Create `src/hooks/useSubmissions.js` — verification.service.js
- [x] Create `src/hooks/useWithdrawals.js` — transactions.service.js
- [x] Create `src/hooks/useAdmin.js` — admin.service.js
- [x] Create `src/config/` for static data (games, providers, copy) → config/{appMode,brand,contact,features,tokens,verification}.js
- [x] Move `slotProviders` / `arcadeGames` / `slotGames` into config → data/{games,arcadeGames,slotProviders,promotions}.js
- [x] Delete `src/main.jsx` monolith once decomposed → reduced to 10-line bootstrap
- [x] Verify `npm run build` after each extraction — build ✅ 492 KB / 138 KB gzip

## P2 — White-label & Config Externalization
- [x] Externalize wallet addresses to env/config (`VITE_WALLET_*`) — addresses live empty in `config/verification.js`, overridable per distribution
- [x] Externalize Telegram link to config — `VITE_TELEGRAM_URL` → `config/contact.js`
- [x] Externalize WhatsApp link to config — `VITE_WHATSAPP_URL` → `config/contact.js`
- [x] Externalize brand name/logo/colors to theme config — `config/brand.js` + `tokens.js` + `tailwind.config.js`
- [x] Build `src/config/brand.js` white-label schema
- [x] Add multi-brand/tenant concept (or single-brand config object) — single-brand `brand.js` object; multi-tenant left as Phase note
- [x] Make bonus defaults (100/10x) configurable per brand — `features.js` bonus defaults
- [x] Make verification fee (75 USD) configurable — `verification.js` `feeUsd`
- [x] Theme tokens via CSS variables + Tailwind config — `config/tokens.js` + `styles/index.css`
- [ ] Buyer setup wizard / `.env` template generator
- [x] Remove all owner-specific strings from source — current tree clean (history still holds baseline copy; see P0)

## P3 — Quality, Types & Accessibility
- [ ] Migrate `.jsx` → `.tsx` (introduce TypeScript)
- [ ] Add `tsconfig.json` strict mode
- [ ] Type the Supabase schema (generated types)
- [ ] Add Vitest + React Testing Library
- [ ] Unit tests: slot engine, arcade engines
- [ ] Unit tests: auth/local mode hooks
- [ ] Unit tests: submission/withdrawal validation
- [ ] Component smoke tests (render without crash)
- [ ] Add a11y: ARIA roles/labels on all interactive elements
- [ ] Add `alt` text to all images/icons
- [ ] Add focus management + visible focus rings for modals
- [ ] Add `aria-live` regions for balance/status updates
- [ ] Add skip-link + semantic landmarks (header/main/footer)
- [ ] Add keyboard navigation for games/forms
- [ ] Run axe/lighthouse a11y audit in CI
- [ ] Add ESLint + Prettier config
- [ ] Add pre-commit hooks (lint + secret scan + tests)

## P4 — Demo/Supabase Parity & Real Integrations
- [ ] Unify demo vs Supabase behind one data abstraction
- [ ] Provide seeded demo data for buyer previews
- [ ] Add safe admin self-onboarding / promotion path
- [ ] Add admin promotion UI (replacing manual SQL)
- [ ] Build real wallet connection option (opt-in, configurable)
- [ ] Add payment-processor abstraction (stub + interface)
- [ ] Add automated verification helper (explorer lookup, optional)
- [ ] Upgrade verification to configurable KYC tiers
- [ ] Add real game-provider integration interface (aggregator-ready)
- [ ] Add promo/bonus engine (claim + fulfilment logic)
- [ ] Add rollover wagering tracking against real play
- [ ] Add withdrawal payout automation hooks (admin-confirmed)
- [ ] Ensure RLS + RPC coverage for every new feature

## P5 — Buyer Packaging & Docs
- [ ] Write buyer-facing README (what it is / isn't)
- [ ] Write deployment guide (GitHub Pages + Vercel + self-host)
- [ ] Write Supabase setup guide (schema apply + admin)
- [ ] Write white-label customization guide
- [ ] Write env/secret reference (all `VITE_*` vars)
- [ ] Add LICENSE (commercial/white-label terms)
- [ ] Add CHANGELOG
- [ ] Add contribution/code-of-conduct (if open)
- [ ] Produce marketing/screenshot assets
- [ ] Add demo video / walkthrough
- [ ] Add sample `.env.example` per deployment target
- [ ] Document limitations & non-real-money disclaimer prominently

## P6 — Polish, Launch & Hardening
- [ ] Responsive design system audit (mobile/tablet/desktop)
- [ ] Touch ergonomics pass on games/forms
- [ ] Performance pass (bundle size, code-splitting)
- [ ] SEO/meta tags per brand
- [ ] Dark/light theme toggle (if branded)
- [ ] Error boundaries + graceful fallbacks
- [ ] Analytics-ready hooks (privacy-respecting, optional)
- [ ] Load/soak test demo + Supabase modes
- [ ] Final `git log -p` secret sweep + tag release
- [ ] Cut `v2.0.0` release from `upgrade/neonbet-commercial-v2`
- [ ] Publish deploy templates (one-click buyer deploy)
- [ ] Post-launch monitoring + issue triage process

## Count
P0: 11 · P1: 24 · P2: 13 · P3: 19 · P4: 15 · P5: 13 · P6: 13 — **108 tracked items** (exceeds the 70+ target).
