# Feature Matrix — NeonBet Commercial V2

**Baseline:** `5ded8ea98d404bfb5d4bda774d9bc8a4a325ed45` · **Date:** 2026-08-17
Status legend: **mock** = simulated/UI-only, no real backend or money movement · **real** = functional against Supabase or genuine logic · **partial** = present but limited/incomplete.

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Casino lobby | real | Rendered lobby UI with game cards, hero, stats. Pure frontend, works with or without Supabase. |
| 2 | Simulated slots | mock | Browser-only slot engine (`Neon Fruits`, `Dragon Jackpot`, `Gold Rush`). Frequent small wins, updates browser-only balance. No ledger, no provider, no deposit linkage. |
| 3 | Arcade games | mock | Browser-simulated tables (Dice Duel, Plinko Drop, Neon Crash, etc.). Local logic only, no real-money or backend. |
| 4 | Supabase auth | real | Email/password sign-up/login/reset via `supabase.auth` when `VITE_SUPABASE_*` configured; falls back to `localStorage` otherwise. |
| 5 | Admin review | real | Admin dashboard + RPC review functions (`review_verification_submission`, `review_withdrawal_request`, `update_profile_admin`). Server-enforced via `private.is_admin()`. Gated on `profile.role = 'admin'`. |
| 6 | Verification submission | real | Users submit crypto tx hash to `verification_submissions` (status pending/verified/rejected); admins review manually. Manual process, no automated on-chain check. |
| 7 | Bonus / rollover tracking | partial | Fields exist in `profiles` (`bonus_balance`, `rollover_required`, `rollover_progress`) and are displayed; defaults hardcoded (100 / 1000 = 100 USD / 10x). In demo mode tracked only in `localStorage`. No real wagering/ledger engine. |
| 8 | Promotions | partial | Marketing copy only, now sourced from a single `promotionConfig` (`src/config/promotion.ts`, env-driven). 100 USD sign-up bonus, 300% welcome match, 10x rollover, rules page. No promo engine, no claim/fulfilment logic. |
| 9 | Real wallet | mock | No wallet connection. Wallet addresses are displayed as static deposit targets only. |
| 10 | Real payments | mock | No payment processor. Verification is a manual $75 crypto transfer + hash paste; no automated deposit/withdrawal/payout. |
| 11 | KYC | partial | "Verification" = manual crypto-fee submission + admin note. Not real KYC (no ID/doc/AML). Sufficient as a light gate, not compliant KYC. |
| 12 | Real game providers | mock | `slotProviders` array lists provider-style names (Pragmatic-style, etc.) as marketing/catalogue only. No aggregator/API integration, no real games served. |

## Cross-cutting notes
- The product is explicitly **not** a real-money gambling platform: simulated browser games, manual crypto verification, optional Supabase. README confirms no wallet connection, payment processor, automated verification, deposits, withdrawals, or real provider integrations.
- Every "real" backend feature requires Supabase + live schema application; in demo mode only items 1–3 and the localStorage half of 4/7 are functional.
- Items 9–12 are the primary gaps between the current lobby and a monetizable/white-label casino product, and represent the largest build effort in later phases.
- **White-label completeness (this session):** app-mode is a single runtime authority (P1); verification fee is server-authoritative via `operator_settings` (P2); `index.html` metadata is generated from `VITE_*` env (P5); promotion/contact copy is centralized (P10); brand assets live in `public/brand/` with graceful fallback (P6); QR encodes the configured address (P7); `npm run setup` bootstraps `.env.local` (P51). Remaining white-label surface: deeper theme tokens (P32) and full `brand.ts` schema expansion (P4) are partial.
