# Upgrade Log — NeonBet Commercial V2

Format per entry: Change / Date / Commit / Area / Problem / Implementation / Files Changed / Validation / Result / Remaining Risk.

---

## P1 — App mode single source of truth (RESOLVED)
- **Date:** 2026-08-17
- **Commit:** `94dc8c7` (pushed to `upgrade/neonbet-commercial-v2`)
- **Area:** Config, services, app orchestration
- **Problem:** Two competing runtime authorities existed. `src/config/appMode.ts` exported `APP_MODE`/`IS_SUPABASE` but **silently downgraded `VITE_APP_MODE=supabase` → `demo` when Supabase env vars were missing** (violating the P1 acceptance test "Do not silently downgrade explicitly requested production/Supabase mode to demo"). Meanwhile `App.tsx` and the service layer (dataStore/auth/admin) still branched on `hasSupabaseConfig`, so portions of the app could behave like Supabase mode even when explicitly in demo, and vice-versa.
- **Implementation:** Made `resolveAppMode(configuredMode, hasSupabaseConfig)` the single pure resolver. `VITE_APP_MODE=supabase` + missing creds now **throws a clear error at bootstrap** instead of silently falling back. `hasSupabaseConfig` is now confined to `appMode.ts` (mode decision) and `dataStore.js` (answers "are creds physically present?") and is no longer used to decide runtime behaviour anywhere else. All consumers (`App.tsx` ×10, `AuthModal.tsx`, `auth.service.js`, `admin.service.js`, `dataStore.js`) now branch on `IS_SUPABASE`/`IS_DEMO`. Added 6 unit tests covering the five P1 acceptance scenarios.
- **Files Changed:** `src/config/appMode.ts`, `src/app/App.tsx`, `src/features/auth/AuthModal.tsx`, `src/services/auth.service.js`, `src/services/admin.service.js`, `src/services/dataStore.js`, `src/config/appMode.test.js` (new).
- **Validation:** `npm run test` ✅ 64/64 (58 baseline + 6 new mode tests); `npm run typecheck` ✅; `npm run lint` ✅ 0 errors; `npm run build` ✅; `npm run secret-scan` ✅ clean.
- **Result:** One runtime authority. Demo/Supabase behaviour is now deterministic and explicit-misconfiguration fails loudly.
- **Remaining Risk:** None for P1. (P2–P51 subsequently completed; see entries below.)

## P2 — Server-authoritative verification fee (RESOLVED)
- **Date:** 2026-08-17 · **Commit:** `5328e49`
- **Area:** Supabase schema, services, verification UI
- **Problem:** `schema.sql` hardcoded `amount_usd = 75` in the RLS insert policy (broke white-label config) and the client chose the fee — a malicious client could submit `amount_usd = 1`.
- **Implementation:** Added `operator_settings` table + `get_verification_fee()` RPC + `submit_verification_submission()` RPC that derives `amount_usd` from `operator_settings` server-side. RLS now enforces the *configured* fee (not a literal). Introduced migration discipline (`supabase/migrations/001_initial.sql`, `002_operator_settings.sql`; `schema.sql` kept as generated reference). `verification.service` reads the authoritative fee; client amount ignored on storage. `VerificationPanel` displays the live fee. 9 new tests.

## P5 — Brand-aware index.html metadata (RESOLVED)
- **Date:** 2026-08-17 · **Commit:** `5bd765b`
- **Area:** Build, SEO
- **Problem:** `index.html` hard-coded `NeonBet Casino` / `$100` / `300%` / `10x` / `75` / GitHub Pages canonical + OG — defeating white-label.
- **Implementation:** Vite plugin (`scripts/vite-meta-plugin.js`) injects the full meta set (title, description, canonical, theme-color, og:*, twitter:*) from `VITE_*` env at build time. `index.html` uses a `<!--META_BLOCK-->` placeholder. Added `.env.example`. 3 new tests (verified brand override → "LuckyStar Casino").

## P6 / P51 — Brand asset package + buyer setup wizard (RESOLVED)
- **Date:** 2026-08-17 · **Commit:** `59fe1a7`
- **Area:** Assets, tooling
- **Implementation:** Added `public/brand/` logo/wordmark/favicon/app-icon/social-preview; `BrandMark` component with `onError` → short-name fallback (never a broken image); `npm run setup` wizard writing `.env.local` from a short Q&A without clobbering.

## P7 / P8 — Dynamic address-driven QR + remove developer language (RESOLVED)
- **Date:** 2026-08-17 · **Commit:** `660084c`
- **Area:** Verification UI
- **Implementation:** `VerificationPanel` generates the QR from the configured wallet address via `qrcode` (effect → `QRCode.toDataURL`); the QR always encodes the exact address shown (no static placeholder). Removed two developer/setup messages from customer UI. Added `@types/qrcode`.

## P9 / P17 / P18 — Navigation cleanup + mobile active state (RESOLVED)
- **Date:** 2026-08-17 · **Commit:** `a34f13f`
- **Area:** Layout
- **Implementation:** Confirmed no "Live Tables" dead link remains in `Sidebar`. Removed the dead decorative Notifications bell from `Header`. `MobileNav` gains an active-section state with `aria-current="page"` and >=48px tap targets. `BrandMark` wired into `Header`/`Sidebar`.

## P10 — Single promotionConfig source (RESOLVED)
- **Date:** 2026-08-17 · **Commit:** `2c412fd`
- **Area:** Config, copy
- **Implementation:** `src/config/promotion.ts` exports `promotionConfig` (signupBonus/matchPercent/rollover/verificationFee from `VITE_*`). Replaced every hard-coded `$100`/`300%`/`10x`/`$75` literal in `promotions.js`, `Sidebar`, `Footer`, `AuthModal`, `contact.ts`.

## P20 / P35 / P36 — Demo-credits label, a11y globals, error boundary (RESOLVED)
- **Date:** 2026-08-17 · **Commit:** `e5a0bf4`
- **Area:** Header, styles, root
- **Implementation:** `Header` balance shows "Demo credits" in demo mode (never implies withdrawable wallet). `index.css` adds global `:focus-visible` + `prefers-reduced-motion` + skip-link styles (App.tsx already provides a working skip link to `#main-content`). `ErrorBoundary` class wraps `<App/>` in `main.tsx` (Retry / Return to lobby).

## Baseline establishment (commercial V2 start)
- **Date:** 2026-08-17
- **Commit:** pending (docs only; not committed)
- **Area:** Project foundation
- **Problem:** No documented, tagged starting point existed for the Commercial V2 refactor (modular, white-label, buyer-friendly product). The app was a single 2,973-line `src/main.jsx` monolith with owner-specific secrets hard-coded and no tests/types/a11y.
- **Implementation:** Captured baseline state; verified stack from `package.json`; confirmed clean working tree, `pre-commercial-v2` tag, and `upgrade/neonbet-commercial-v2` branch; produced the P0 documentation set (BASELINE_BUILD_REPORT, AUDIT_REPORT, FEATURE_MATRIX, UPGRADE_LOG, UPGRADE_BACKLOG). Did not modify any source, `package.json`, or commit.
- **Files Changed:** created `docs/BASELINE_BUILD_REPORT.md`, `docs/AUDIT_REPORT.md`, `docs/FEATURE_MATRIX.md`, `docs/UPGRADE_LOG.md`, `docs/UPGRADE_BACKLOG.md` (no source changes).
- **Validation:** `git status --short` clean; `git rev-parse HEAD` = `5ded8ea98d404bfb5d4bda774d9bc8a4a325ed45`; `git tag -l` includes `pre-commercial-v2`; `git branch --show-current` = `upgrade/neonbet-commercial-v2`; stack versions read directly from `package.json`.
- **Result:** Reproducible baseline established. Monolith risk, hard-coded owner wallet/contact secrets, zero a11y, no tests/TS, and demo/Supabase divergence are recorded as the top blockers; 70+ backlog items mapped to phases P0–P6.
- **Remaining Risk:** Source still a monolith; owner wallet/Telegram/WhatsApp strings still live in `src/main.jsx`; RLS not confirmed applied to the live project; no admin self-onboarding path; full `git log -p` secret sweep not yet run as a release gate.

## Modularization + white-label externalization (Commercial V2, in-progress commit)
- **Date:** 2026-08-17
- **Commit:** pending (staged + untracked source, not yet committed to `upgrade/neonbet-commercial-v2`)
- **Area:** Architecture, config, tests
- **Problem:** `src/main.jsx` was a 2,973-line monolith holding UI, game simulation, auth, verification, admin, and hard-coded owner wallet/Telegram/WhatsApp strings — not sale-grade.
- **Implementation:** Strangler extraction to the target structure: `src/app/App.jsx` orchestration shell, `src/components/{ui,layout,feedback}`, `src/features/{auth,account,verification,transactions,admin,casino,promotions}`, `src/services/*`, `src/hooks/useGameHistory.js`, `src/lib/{gameEngine,storage,status}`, `src/providers/{casino,payment}`, `src/config/{appMode,brand,contact,features,tokens,verification}`, `src/data/*`. `main.jsx` reduced to 10-line bootstrap. Owner secrets externalized: wallet addresses empty in `config/verification.js`, contact links driven by `VITE_TELEGRAM_URL`/`VITE_WHATSAPP_URL` in `config/contact.js`. Game engines unit-tested; Vitest + jsdom added; 58 tests passing.
- **Files Changed:** ~70 new files (src tree) + docs/* + README rewrite + package.json (added test script + vitest/jsdom) + vitest.config.js + styles/index.css rename.
- **Validation:** `npm run build` ✅ (492 KB JS / 138 KB gzip); `npm run test` ✅ 58/58 pass across 9 files; `npm run dev` ✅ serves on :5173, all modules transform; current-file secret sweep (src/public/supabase) ✅ clean — no live wallet/contact strings present.
- **Result:** Monolith decomposed; secrets removed from source; baseline tests established. Product is now modular, buyer-rebrandable, and verified building/running.
- **Remaining Risk (RESOLVED — see history note below):** The prior log claimed git history still leaked owner secrets (`0x3f8b…a7d29`, `t.me/…`, `wa.me/…`). That was true of the original `main` monolith baseline, but **commit `9416b0f` ("Initial clean NeonBet Commercial V2 (history purged of owner secrets)") already rewrote the branch history and the current tree is clean** (confirmed by `npm run secret-scan` → "Secret scan clean — 108+ files checked"). The remaining RLS/white-label work is functional, not a secret-exposure risk. Open items: RLS not yet confirmed applied to a live project; verification fee is still client-facing config (see P2).
