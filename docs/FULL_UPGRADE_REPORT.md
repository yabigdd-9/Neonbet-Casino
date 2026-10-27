# NeonBet full upgrade: local verification

Date: 27 October 2026. Reviewed baseline: `9717a96b8353993d1c30046247aff7cad0536659`. Remote `main` was confirmed at the same commit during this run. The implementation is in an isolated local checkout on `codex/neonbet-full-upgrade`.

## Changes

The upgrade corrects Supabase auth return values and subscription cleanup, separates account state from the app shell, invalidates stale account responses and enforces explicit demo-mode isolation. Demo submissions and withdrawals are scoped to the local identity. Configuration failures and action errors are visible, and password recovery has a completion form.

The lobby has a revised navy/cyan visual design, responsive navigation and game cards, catalogue search and pagination, demo labeling, accessible modal names, focus handling and reduced-motion scrolling. Lazy panels include a failure fallback. Assets resolve under a subdirectory deployment.

The simulated balance uses integer cents and an app-owned round controller. A started round settles once after a modal closes. Arcade play uses shared pure engines; Plinko's published tiers are reachable, and slot payouts are computed from the displayed reels. These games do not provide certified gambling mathematics or a money ledger.

Withdrawal review uses server-side row locking and enforces pending → approved/rejected and approved → paid transitions. Existing RLS and privileged-function checks remain. Typed asynchronous provider contracts and a server-only, in-memory fake adapter demonstrate signatures, duplicate handling and retry behavior using synthetic records only. Provider-specific live integration is not implemented.

## Evidence

- Fresh locked install: `npm ci --ignore-scripts` passed on the upgrade checkout.
- `npm run check`: lint, strict TypeScript, **107 unit/component/database tests**, secret scan, production build and bundle budget passed.
- `npm run format:check` and `git diff --check` passed.
- `npm run build:e2e` followed by `npm run test:e2e`: **16 browser tests passed** in Chromium and WebKit. They cover 360, 390, 768 and 1440px layouts, search, game dialogs, settlement, keyboard behavior, reduced motion, accessibility, demo account flow, corrupt local storage, offline-only demo requests and a failed lazy-panel download.
- The WebKit binary is frozen for macOS 14. Browser-engine viewport tests do not replace current physical-device Safari/Android and assistive-technology testing. On macOS, the test uses Option-Tab for WebKit link navigation.
- The production build's initial static JavaScript graph was **90,829 bytes gzip**, compared with **137,999 bytes gzip** for the reviewed baseline, using Node's `gzipSync` for both: **34.18% less**. The SDK remains dynamically loaded only for Supabase mode. This exceeds the planned 25% size reduction.
- A local Chromium mobile-viewport diagnostic and its limitations are in `docs/evidence/mobile-performance.json`; the candidate sample preceded the final slot-scoring correction. It was unthrottled on a desktop host and is not a real-device speed measurement. The timing samples do not establish a reliable improvement in perceived load time.
- On 27 October 2026, full `npm audit` and `npm audit --omit=dev` against the public npm registry both reported **zero known advisories** for the lockfile. The earlier braces advisory was [withdrawn](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), and the installed 6.1.5 selector parser is [listed as patched](https://github.com/advisories/GHSA-rj75-hqrm-r3gf). Repeat audits before release.

## What remains separate

The database tests use isolated PGlite with minimal synthetic auth fixtures. They do not prove the intended Supabase project's installed schema, Data API grants, email delivery, auth settings, RLS or migration history. No live database was accessed or changed.

The revised GitHub workflows have not run remotely for these local changes. Provider selection, target market, operator arrangement, durable payment ledger, reconciliation, production configuration and operational acceptance remain open; see `INTEGRATION_ACTIVATION.md`. No provider was activated, payment made, change pushed or merged, or site deployed.

## Follow-up review

A later local review corrected the admin account panel to read the signed-in admin's own latest submission and withdrawal independently of the review queues. Pagination now retains the selected page on refresh, resets when admin access is removed, and changes the displayed page only when the requested rows have arrived. Review controls are disabled during account loading. Personal-record queries fail closed when no user ID is supplied. Synthetic unit tests exercise ownership filters, admin pagination, role changes and delayed responses; these do not verify a live Supabase project.
