# NeonBet Security Notes (Commercial V2)

## Client key rules

- The browser uses the Supabase **anon** key only (`VITE_SUPABASE_ANON_KEY`). It is safe to
  expose because every read/write is gated by Row Level Security.
- **Never** place a Supabase **service-role** key in any `VITE_*` variable or client bundle.
  Service-role operations (admin RPCs) run in the Supabase backend, not the browser.
- Add `service_role` usage only inside Supabase Edge Functions / server code, never in
  `src/`.

## Row Level Security

- RLS is enabled on `profiles`, `verification_submissions`, `withdrawal_requests`.
- Users may read/update only their own rows; admins (via `private.is_admin()`) may read all.
- Clients may **insert** verifications/withdrawals only with `status = pending`, no admin
  notes, and (`verification`) `amount_usd = 75`.

## Admin permission model

- Admin actions go through server-checked RPCs (`review_verification_submission`,
  `review_withdrawal_request`, `update_profile_admin`) that raise `42501` unless
  `private.is_admin()` returns true.
- Frontend admin UI is gated on `profile.role === 'admin'`, but that is a UX concern only —
  the database is the authority. Never rely on hidden controls for admin security.

## Secret management

- All secrets live in `.env` / environment variables (see `.env.example`), which are
  gitignored. The repo ships a `.env.example` with no real values.
- Wallet addresses and personal Telegram/WhatsApp links were externalised to
  `src/config/verification.js` and `src/config/contact.js` with safe empty placeholders so
  they are not buried in components.
- Before distribution, search history + working tree for leaked keys/wallets and rotate any
  that were ever committed.

## XSS / error handling

- Supabase error objects are not rendered to the UI. Auth/verification/withdrawal flows map
  known error codes (e.g. duplicate pending submission `23505`) to friendly messages via
  `setAuthError`.
- Wallet addresses and tx hashes are rendered as text; they are not injected as HTML.

## External URL validation

- Telegram/WhatsApp links in `src/config/contact.js` are opened with `target="_blank"
  rel="noreferrer"`. Buyers should validate/whitelist these values at configuration time.

## Transaction reference handling

- Tx hashes are validated for minimum length (`validateTxHash`) and stored as opaque strings.
  There is no on-chain verification in this build — review is manual.

## Rate limiting (recommendations)

- Add edge-function level rate limiting on `review_*` and auth endpoints before production.
- Supabase Auth has built-in abuse protection; configure per-project limits.

## Future webhook security

- `PaymentProvider.verifyWebhook()` is a stub. A real implementation must verify provider
  signatures (HMAC) server-side and never trust client-supplied webhook payloads.
