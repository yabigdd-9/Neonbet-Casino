# Defensive frontend and backend upgrade

## Frontend

- A root error boundary replaces blank screens caused by rendering failures with a generic reload screen. Internal exception details are not included in that screen.
- A keyboard-visible skip link targets the main content region.
- Saved array reads reject valid JSON values of the wrong type, preventing objects or scalar values from reaching array operations.

## Backend

- All six privileged database functions use an empty search path. Existing relations and helper calls are schema-qualified; permissions and business behavior are preserved.
- Nine isolated PostgreSQL tests exercise profile privacy, role escalation denial, authorization lookup, and function execution permissions.
- The schema is loaded twice in the test harness to check that reapplication succeeds.

## Validation

82 tests pass, including 16 new tests in this upgrade. Production build, secret scan, and whitespace checks pass. A new least-privilege validation workflow runs tests, a secret scan, and a build on pull requests and main pushes without deployment secrets.

## Deployment and limitations

No live database was connected or changed. The repository's schema needs separate application and verification on the intended Supabase project. The isolated database supplies minimal auth fixtures and omits pgcrypto, so its tests do not prove production Supabase configuration. Browser/device layout and screen-reader verification remain outstanding. Error boundaries catch React rendering failures, not arbitrary asynchronous errors. This is defensive maintenance, not a complete security certification.
