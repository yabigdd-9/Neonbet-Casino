# Diagnostics and live-database verification follow-up

The React account, recovery and release validation paths in `main` supersede the older implementations in PR #3. These follow-ups preserve the parts that were not yet integrated, without replacing the current account or deployment code.

## Browser diagnostics

`src/lib/diagnostics.js` captures only fixed error codes and timestamps. It stores a maximum of 20 events in tab-local `sessionStorage` and never sends data to a remote service. Exception messages, stack traces, URLs, credentials and user identifiers are intentionally excluded. Diagnostics fail silently when browser storage is unavailable.

Global error and unhandled-promise-rejection listeners are removed on development hot-module replacement. The React error boundary records a generic render-failure code. This does not establish central monitoring or alerting.

## Database verification

`supabase/verify-security.sql` contains **read-only** inspection queries for public-table row-level-security settings, SECURITY DEFINER functions, configured search paths and anonymous execute privileges. Execute these only against the intended active project under appropriate read-only credentials; examine the actual output before making security claims. This change does not connect to, modify or verify any live database.

These changes do **not** enable real-money payments, external gaming providers or payouts.
