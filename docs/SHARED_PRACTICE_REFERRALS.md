# Shared practice-credit referrals — rollout status

`supabase/referrals.sql` prepares shared invitation codes and one five-credit referral award per verified signup. Rewards are non-cash records, separate from profiles, wagering balances and all payment code. They cannot be withdrawn. Email confirmation is a signup prerequisite, not identity or age verification.

The new private tables have RLS and no direct anonymous/authenticated grants. Public RPC wrappers run as the caller, while narrowly scoped private helpers validate the authenticated identity and confirmation using Supabase Auth records. Claiming an invitation requires a new account created after the invitation code, within seven days. The caller cannot choose a reward amount or credit another caller's identity. A unique referred-account key prevents multiple awards; conflicting attribution and self-referrals fail. Counts and credits are derived from awards, without revealing referred account identities.

`referrals.service.ts` validates responses. The panel loads shared status only when Supabase account mode and `VITE_ENABLE_SHARED_REFERRALS=true` are both configured. The invitee explicitly applies a received invitation. Otherwise the existing browser-local links remain available with an inactive-reward notice.

The frontend and backend preparation were merged in PR #26. On 2026-10-28, the additive `add_non_cash_practice_referrals` migration was applied to the connected `neonbet-casino` project. Public rewards remain disabled: Pages still builds in practice mode and `VITE_ENABLE_SHARED_REFERRALS` defaults to `false`.

Database verification used temporary Auth fixtures inside a transaction that was rolled back. With the actual `authenticated` role, an eligible confirmed account attributed one invitation; a repeated claim left the inviter at exactly five credits and one referral. Self-referrals and unconfirmed accounts were rejected. Direct access to the private award table and anonymous RPC execution were denied. A subsequent query confirmed that both referral tables contained zero records.

The deployed HTTP Data API was checked separately with an active publishable key and no user session. Both referral RPCs returned HTTP 401 with PostgreSQL permission code `42501`. This verifies anonymous denial through the API, not a completed browser signup.

Security advisors reported no new referral warnings. Their two informational RLS-without-policy notices are intentional: the private tables deny direct access, and only the guarded helpers can write awards. Existing project warnings remain for the authenticated `public.is_admin()` definer function and disabled leaked-password protection. Review them using the [function access guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) and [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); they were not changed by this rollout.

Before public activation, test actual confirmed signups across separate browsers through Supabase Auth and the HTTP Data API, including account-switch/recovery behavior. Review anti-abuse and privacy/retention rules for the planned programme. A confirmed email is not evidence that multiple accounts belong to different people. Do not enable shared referrals until these checks are complete.

The SQL tests use isolated PGlite with minimal Auth fixtures; they do not emulate live Supabase Auth or HTTP APIs. Earned credits are displayed separately; they are not yet added to the game session balance. No real-money capability is enabled.
