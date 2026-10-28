# Customer care

The assistant gives instant, deterministic FAQ replies and identifies itself as automated. It cannot review account transactions or transfer a conversation to an agent. FAQs cover account recovery, practice credits, referrals, game failures and responsible play.

The owner selected `yabigdd@gmail.com` for human handoffs. Visitors can open an email directly or save a request and then choose **Email this request**. That action opens the visitor's email app with the topic, reference and description. Nothing is automatically emailed; a saved request does not imply delivery or a promised response time.

In public practice mode, requests stay on that device, with at most ten retained and a clear action to delete them. In account mode, confirmed accounts can create up to three requests per 24 hours. Request IDs make retrying an identical save idempotent. The private database table has RLS and no direct API grants. Narrow caller-checked RPCs save requests and list only the caller's ten most recent requests. Account changes reset the support panel.

Operators can review `private.support_requests` in the connected Supabase dashboard, using the emailed UUID reference. Only an operator with database access can mark a request `resolved`; refresh in the customer panel then shows that status. Do not expose the private schema through the Data API or grant customers direct update access. Respond through the email thread. Delete resolved request data when it is no longer needed; visitors are told not to include passwords, recovery links or wallet secrets.

The `practice_referral_caps_and_private_support` migration has been applied. Isolated database tests verify request ownership, repeat-save behavior, daily limits, direct-table denial, anonymous denial and referral caps. Live grants and missing-identity rejection were also checked. Security advisors report intentional RLS-without-policy notices for the private tables, plus the pre-existing `is_admin` definer and leaked-password-protection warnings documented in the referral rollout notes.
