# Verification and release gates

## Changes

- Deployment now runs unit/database tests and browser tests before building and uploading the production artifact. The deploy job depends on that build job, so a failed test prevents publication. Deployment secrets are scoped to the production build step.
- Account subscription cleanup is synchronous, cancels pending callbacks, and defers account requests until the auth callback releases its session lock.
- Session restoration uses one subscription and ignores stale initial sessions after a newer auth event. Account data requests cannot restore old results after a newer request or sign-out.
- Login and registration return the response shape expected by the handlers. Session and logout failures are propagated; failed logout no longer displays a success state.
- Recovery links open a dedicated password-update dialog. Password reset responses avoid confirming whether an email is registered. Provider exception details are not shown by these account handlers.
- The keyboard skip link comes first; the closed mobile sidebar cannot receive focus.
- Local error monitoring records only fixed error codes and timestamps in a bounded, tab-local sessionStorage buffer. It never stores exception messages, stack traces, URLs, credentials, or user identifiers, and sends no telemetry externally.

## Running checks

```sh
npm ci --ignore-scripts
npm test
npx playwright install --with-deps chromium webkit
npm run test:browser
npm run build
npm run secret-scan
```

The browser suite tests desktop Chromium, Pixel 7 Chromium emulation, and iPhone 13 WebKit emulation. It covers layout bounds, dialog focus, login/logout, restored sessions, password-reset requests, recovery-link password updates, rejected login, and failed logout. Auth and database HTTP requests are intercepted at a reserved `.invalid` test host. These tests do not send email or use a live account backend. Tracing and screenshots are off to avoid collecting auth details.

## Local verification results

- 95 unit/database tests passed.
- 18 browser tests passed against the production build across all three emulated profiles.
- Locked dependency installation, production build, secret scan, YAML parsing, and whitespace validation passed.
- Browser engine launch paths were supplied locally to accommodate this execution environment. CI uses the standard Playwright browser installation and still needs its own successful run.

## Live database blocker

On 22 October 2026, the connected project named `neonbet-casino` reported `INACTIVE`. A table-inspection request timed out. The security-advisor endpoint returned an empty lint list, but that does not prove the inactive database was checked. No live SQL changes were made.

The read-only checks in `supabase/verify-security.sql` are prepared for the intended project when it is active. Live schema hardening, real email delivery/recovery, and live RLS verification remain unverified. Other connected projects were not queried or modified.

## Remaining limits

Browser emulation does not replace physical-device or screen-reader testing. Diagnostics are local only: centralized error collection and alerts are not configured. The production build emits a bundle-size warning near 500 kB; this is not a validation failure. This work does not enable cryptocurrency payment processing or establish regulatory or production readiness.
