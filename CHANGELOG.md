# Changelog

All notable changes to NeonBet are documented here. Format follows Keep a Changelog style.

## [Unreleased] — Commercial V2

### Added

- Strangler-style decomposition of the ~2973-line `src/main.jsx` into modular `app/`,
  `components/`, `config/`, `data/`, `features/`, `hooks/`, `lib/`, `providers/`, `services/`.
- Centralised white-label configuration (`src/config/brand.js`, `contact.js`, `verification.js`,
  `features.js`, `tokens.js`, `appMode.js`).
- Reusable UI primitives (`Button`, `Card`, `Modal`, `Input`, `Textarea`, `Select`, `Badge`,
  `StatusBadge`, `Spinner`, `Skeleton`, `ErrorState`, `EmptyState`) with consistent states.
- Toast/notification system (`components/feedback/ToastProvider.jsx`).
- `CasinoProvider` abstraction with `LocalDemoProvider`; `PaymentProvider` abstraction with
  `MockPaymentProvider`.
- Demo/Supabase mode resolution that does not silently degrade to an unsafe state.
- `docs/` suite: BASELINE_BUILD_REPORT, AUDIT_REPORT, FEATURE_MATRIX, UPGRADE_LOG,
  UPGRADE_BACKLOG, ARCHITECTURE, DATABASE, SECURITY, WHITE_LABEL, COMMERCIAL_READINESS.
- `.env.example` and expanded README.

### Changed

- Verification wallet addresses and personal Telegram/WhatsApp links externalised to config
  with safe empty placeholders (no longer buried in components).
- Supabase data access isolated into a service layer; admin actions route through
  server-checked RPC functions.
- Favourites / recently-played moved to a `useGameHistory` hook backed by `localStorage`.

### Improved

- Responsive shell: desktop sidebar + mobile bottom navigation.
- Account status, verification, withdrawal, and admin UIs separated into feature modules.
- Consistent status display via centralised `lib/status.js`.

### Fixed

- Build no longer depends on a single monolithic file; `npm run build` produces a clean bundle.

### Security

- Admin permission enforced server-side via `private.is_admin()`; anon key only on client.
- Secret scan guidance added to `docs/SECURITY.md`.

### Developer Experience

- Vitest unit tests for pure logic, services validators, providers, config, and data integrity.
- `npm run test` script; `vitest.config.js` with jsdom environment.
