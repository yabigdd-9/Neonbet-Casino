# NeonBet Commercial Readiness (Commercial V2)

NeonBet is sold as **source code / a starter platform**, not as a turnkey gambling operator.
Buyers are responsible for licensing, jurisdiction compliance, payment providers, wallet
custody, KYC, and live game-provider contracts.

## Included

- Premium responsive UI (dark neon theme, sidebar + mobile nav).
- Demo casino lobby (hero, featured, arcade, slot-provider catalogue).
- Local simulated slot + arcade games (shared simulated balance).
- Supabase auth option (email/password, reset password) behind `VITE_*` env.
- Manual verification submission flow (USDT/BSC, BTC, ETH, BNB) with tx-hash paste.
- Admin review console (server-checked via RPC).
- Bonus / rollover UI (display + progress bar).
- White-label configuration (brand, contact, verification, features, tokens).
- Demo game provider abstraction (`CasinoProvider`) + payment provider abstraction
  (`PaymentProvider` / `MockPaymentProvider`).
- Deployment configuration (GitHub Pages, Vercel, Supabase) with `.env.example`.
- Unit tests (`npm run test`) and build gate.

## Not automatically included

- Regulatory licence / gaming jurisdiction compliance.
- Payment gateway / real deposit processing.
- Real wallet custody.
- Automated KYC.
- Real-money wagering / ledger engine.
- External casino provider contract or live game servers.
- Real withdrawal processing (requests are manual-review only).
- Self-serve admin onboarding (first admin promoted by SQL).

## Licensing placeholder

Final legal terms are defined by the owner (Dion). Intended tiers:

- **Tier 1 — Source Code:** the repository as-is, with this documentation.
- **Tier 2 — Commercial / Extended:** source + unlimited end-product use, no resale of the
  source.
- **Tier 3 — White Label + Setup:** source + rebrand assistance + deployment support.

Do not market as a regulated sportsbook, licensed casino, real-money custody, payment
processor, certified RNG, automated KYC, or turnkey gambling operator unless those are
implemented and verified in a future engagement.
