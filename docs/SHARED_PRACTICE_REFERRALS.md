# Shared practice-credit referrals — local preparation

`supabase/referrals.sql` prepares shared invitation codes and one five-credit referral award per verified signup. Rewards are non-cash records, separate from profiles, wagering balances and all payment code. They cannot be withdrawn. Email confirmation is a signup prerequisite, not identity or age verification.

The new private tables have RLS and no direct anonymous/authenticated grants. Public RPC wrappers run as the caller, while narrowly scoped private helpers validate the authenticated identity and confirmation using Supabase Auth records. Claiming an invitation requires a new account created after the invitation code, within seven days. The caller cannot choose a reward amount or credit another caller's identity. A unique referred-account key prevents multiple awards; conflicting attribution and self-referrals fail. Counts and credits are derived from awards, without revealing referred account identities.

`referrals.service.ts` validates responses. The panel loads shared status only when Supabase account mode and `VITE_ENABLE_SHARED_REFERRALS=true` are both configured. The invitee explicitly applies a received invitation. Otherwise the existing browser-local links remain available with an inactive-reward notice.

This preparation has not been applied to the live database, pushed or deployed. Before activation, review and apply the SQL to the intended test project, verify actual Auth and Data API grants, test confirmed signups across separate browsers, and verify account-switch/recovery behavior. Review anti-abuse and privacy/retention rules for the planned programme. A verified email is not evidence that multiple accounts belong to different people.

The SQL tests use isolated PGlite with minimal Auth fixtures; they do not emulate live Supabase Auth or HTTP APIs. Earned credits are displayed separately; they are not yet added to the game session balance. No real-money capability is enabled.
