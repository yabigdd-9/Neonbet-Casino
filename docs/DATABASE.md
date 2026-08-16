# NeonBet Database (Commercial V2)

Schema lives in `supabase/schema.sql`. It uses the `pgcrypto` extension and a `private`
schema for security-definer helpers. Apply it to a Supabase project before enabling
`VITE_APP_MODE=supabase`.

> Client uses the **anon** key only. All access is enforced by Row Level Security and the
> server-checked RPC functions below. Never ship a service-role key to the browser.

## Tables

### `public.profiles`
- **Primary key:** `id uuid` references `auth.users(id)` on delete cascade.
- **Columns:** `email`, `username`, `phone`, `role` (`user` | `admin`), `verification_status`
  (`not_submitted` | `pending` | `verified` | `rejected`), `bonus_balance numeric(12,2)`
  default 100 (>= 0), `rollover_required numeric(12,2)` default 1000, `rollover_progress
  numeric(12,2)` default 0, `admin_notes`, `created_at`, `updated_at`.
- **Constraints:** text-length checks, `bonus_balance/rollover_* >= 0`.
- **Indexes:** `role`, `verification_status`, `created_at desc`.
- **Trigger:** `set_updated_at` before update.
- **RLS:** select own or admin; update own contact fields (admin update via RPC).

### `public.verification_submissions`
- **Primary key:** `id uuid` default `gen_random_uuid()`.
- **Foreign key:** `user_id` → `profiles(id)` on delete cascade.
- **Columns:** `asset`, `network`, `tx_hash`, `amount_usd` default 75 (must be > 0), `status`
  (`pending` | `verified` | `rejected`), `admin_notes`, `created_at`, `updated_at`.
- **Unique partial index:** one **pending** submission per `user_id`.
- **Trigger:** inserting a submission flips the user's `verification_status` to `pending`
  (unless already `verified`) via `mark_profile_pending_verification()`.
- **RLS:** users create own (status forced `pending`, no admin notes, `amount_usd = 75`); read
  own or admin.

### `public.withdrawal_requests`
- **Primary key:** `id uuid` default `gen_random_uuid()`.
- **Foreign key:** `user_id` → `profiles(id)` on delete cascade.
- **Columns:** `amount_usd` (> 0), `payout_method`, `payout_address`, `status` (`pending` |
  `approved` | `paid` | `rejected`), `admin_notes`, `created_at`, `updated_at`.
- **RLS:** users create own (status forced `pending`); read own or admin.

## Security-definer functions (`private` schema)

- `private.is_admin()` — `true` if the calling `auth.uid()` has `role = 'admin'`.
- `public.review_verification_submission(p_submission_id, p_status, p_admin_notes)` — sets
  submission + profile status; raises `42501` unless admin; rejects invalid status.
- `public.review_withdrawal_request(p_withdrawal_id, p_status, p_admin_notes)` — same shape.
- `public.update_profile_admin(p_profile_id, p_bonus_balance, p_rollover_progress,
  p_rollover_required, p_admin_notes)` — validates non-negative numbers; raises `42501` unless
  admin.
- `public.handle_new_user()` — trigger on `auth.users` inserts a `profiles` row from sign-up
  metadata.
- `public.set_updated_at()` — trigger helper.

All admin RPCs are `revoke`d from `public, anon` and granted only to `authenticated,
service_role`. The `private` schema is revoked from `public, anon`.

## Lifecycle

1. User signs up → `profiles` row created (`not_submitted`, bonus 100, rollover 1000/0).
2. User submits a tx hash → `verification_submissions` row (`pending`); profile → `pending`.
3. Unique partial index blocks a second pending submission.
4. Admin reviews via RPC → `verified` / `rejected`; profile status mirrors it.
5. Withdrawals follow a parallel `pending → approved → paid` lifecycle, admin-gated.

## Promoting the first admin

There is no self-serve admin path. After the first account exists:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```
