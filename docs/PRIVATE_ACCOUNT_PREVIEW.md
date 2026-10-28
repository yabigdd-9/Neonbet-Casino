# Private account preview

Vercel project `lucky-orbit-private` belongs to the connected `yabigdd-1427s-projects` team. Vercel authentication protects its `vercel.app` deployments (`all_except_custom_domains`), and no custom domain is attached. Keep this protection enabled; do not add a public custom domain. Source visibility is private and responses carry `X-Robots-Tag: noindex, nofollow`.

Private-project environment variables enable Supabase account mode and non-cash referrals. Deposit verification, withdrawal request screens and admin screens are disabled. No real payment capability is enabled. Vercel classifies the first deployment as production within this separate private project; its production and preview targets both retain authentication protection. The public GitHub Pages workflow stays in practice mode and does not inherit these variables.

For a live recovery test, open the protected preview and sign into Vercel first. Its exact origin and pathname must be allowed under Supabase **Authentication → URL Configuration → Redirect URLs**. The available Supabase connector can apply database changes but does not expose this Auth configuration setting. The preview callback must be added in the dashboard before sending a recovery email; otherwise Supabase may redirect to the configured Site URL instead. Do not replace the public Site URL just for this test.

Then use a controlled test inbox, confirm its signup, request a reset from the preview and complete the new-password form. Never paste recovery links, tokens or passwords into chat. Browser-fixture tests cover this form; a successful live inbox test should be recorded separately. Remove temporary test accounts and revoke their sessions afterward.
