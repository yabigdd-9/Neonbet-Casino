# Account recovery

Account mode uses Supabase's implicit email-recovery flow. Reset requests point to the current site's origin and pathname, without invitation parameters or fragments. The destination must appear in the project's allowed redirect URLs. A successful request says that a link will arrive **if** the email belongs to an account; it does not confirm account existence or email delivery.

Before the SDK consumes a callback, `supabaseClient.ts` captures its recovery state. The account hook handles both the normal `PASSWORD_RECOVERY` event and an initial restored recovery session, so a fast SDK initialization cannot lose the recovery form. Changing accounts or signing out clears recovery state. Recovery forms are keyed to the account, start with empty fields and ignore late completion after closing.

Expired or rejected email links show a fixed, safe message and a button to request another reset email. Provider descriptions and stale Auth credentials are removed from the failed URL; unrelated invitation and section parameters are preserved. Valid callback tokens are left intact for the SDK, which consumes them. Provider error text is not displayed.

The form requires matching passwords of at least eight characters, prevents duplicate submissions, disables inputs while saving and clears a previous error on retry. The server still enforces its own password policy. Expired sessions, reused passwords, weak passwords, request throttling and unknown update failures receive safe messages. Users can return to the reset-email form after failure.

Automated coverage uses the real client with isolated local HTTP fixtures. Chromium and WebKit scenarios cover successful recovery callbacks, mismatched confirmation, failed update and retry, expired links, URL cleanup and account-neutral reset responses. Unit tests also cover missed initialization events, account changes and late responses after closing. These fixtures send no email and do not change live accounts.

Live recovery was checked on 2026-10-29 with a controlled Gmail alias and the protected account preview. The signup was confirmed through the inbox; the user completed the hosted new-password form, and a direct Auth request rejected the original generated password with `invalid_credentials`. The new password was never requested or read. A separate automated sign-in with the new password was not performed.

Vercel sign-in initially intercepted the email callback. A temporary share link on the exact stable alias established access in the same browser before opening a fresh recovery email. The share was revoked afterward. Verification confirmed zero remaining fixture Auth users, profiles, sessions, refresh tokens and referral codes, and the local credential fixture was removed. The project remains protected. Public Pages stays in practice mode and is not the live account-recovery destination; automated fixtures still send no live email.

Supabase reference: [password recovery](https://supabase.com/docs/guides/auth/passwords#resetting-a-password) and [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
