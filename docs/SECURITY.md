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
- Users may read only their own rows; admins (via `private.is_admin()`) may read all.
- Direct profile updates are denied to browser roles; privileged changes require server-checked RPCs.
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

## Privileged function hardening

- All six `SECURITY DEFINER` functions in the schema use an empty `search_path` and schema-qualified relations and helper calls, following the [Supabase function security guidance](https://supabase.com/docs/guides/database/functions).
- `src/security/database.test.js` executes the schema twice against isolated PGlite Postgres, then checks owner-only profile reads, anonymous denial, denied profile self-promotion, ignored user-supplied admin metadata, authorized admin reads, missing-identity denial, function search paths, and function execution grants.
- This harness stubs `auth.users` and `auth.uid()`. It omits the unsupported pgcrypto extension; UUID defaults use Postgres core `gen_random_uuid()`. It does not verify Supabase Auth, HTTP API configuration, or the deployed database.
- Schema changes in this repository do not automatically update an existing Supabase project. Apply and verify separately on the intended project after a backup and staging check.

## Full upgrade additions

Explicit demo mode never constructs a Supabase client. Explicit incomplete Supabase configuration renders a configuration error. Admin data requests are made only after the role is confirmed, while authorization remains enforced in PostgreSQL. Withdrawal review locks and checks the current row state; terminal requests cannot reopen.

The secret scanner reports category and file only, redacting matching values. It excludes generated binary/browser output and distinguishes full transaction hashes and commit IDs from wallet addresses. This remains a heuristic source scan, not a certification or history scrub.

The server-only fake integration harness is synthetic and in-memory. Browser imports of server modules and Node APIs are blocked by lint. Provider credentials are not part of any public environment template. See FULL_UPGRADE_REPORT.md for dependency findings and INTEGRATION_ACTIVATION.md for the unimplemented operational backend requirements.
