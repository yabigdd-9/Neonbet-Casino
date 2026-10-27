# Architecture

The application remains a React/Vite/Tailwind static frontend. `src/main.jsx` installs the root error boundary and mounts the app. `src/app/App.jsx` composes sections and coordinates feature actions; it no longer owns session/account loading.

## Account and mode boundaries

`config/appMode.ts` is the sole mode resolver. Explicit demo bypasses the Supabase client entirely. Explicit Supabase mode requires complete configuration. Legacy deployments without an explicit mode retain automatic selection. Invalid configuration renders an operator-facing service-unavailable screen.

`services/supabaseClient.ts` conditionally loads the SDK and constructs one client. The legacy root module is a re-export. Typed services standardize auth results as `{ user, session }`, throw API errors, and use server-checked RPCs for admin writes. Auth subscriptions return synchronous cleanup and preserve event/session information.

`hooks/useAccount.ts` owns user, profile, page records, errors, loading and password-recovery state. An epoch invalidates old requests on account changes, logout and unmount. Supabase callbacks update state synchronously; account queries are queued outside the callback. Token refresh does not refetch unchanged account data. Only a confirmed admin profile enables admin list queries. The signed-in admin’s latest personal records are fetched separately with an explicit user filter; review pages retain their selection on refresh, and review actions are disabled while account data loads.

## Local state

Demo identities are validated before use. Legacy submission/withdrawal rows migrate into user-scoped keys only when their owner matches. Unowned rows are not assigned to another user. Local profiles never grant admin rights. Favorites remain device-level; recent games store stable IDs resolved against the current catalogue. Malformed and obsolete entries are ignored.

`RoundController` belongs to the app through `useDemoWallet`, independently of modal lifetimes. It snapshots stake and outcome, debits integer cents, rejects overlapping rounds and settles once. Results remain available when reopening the same game. Closing a modal does not cancel a settlement. This is deliberately simulated state, never a money ledger.

## Presentation and performance

The sidebar is a scrollable desktop column; small-screen navigation uses the shared accessible modal and a safe-area-aware bottom bar. Shared navigation respects reduced motion. Catalogue search uses a precomputed index and renders 12 cards per page. Game/auth/admin/policy modules load on demand with local failure and loading states.

Production bundle measurement recursively sums the gzip size of the entry's static import graph. The Supabase SDK is a conditional dynamic import and remains absent from initial demo requests. The static graph budget is 75% of the reviewed 137,999-byte baseline. Browser timings are local desktop-engine measurements at a mobile viewport, not a real-device performance certification.

## Database and integration boundaries

The schema retains RLS, owner-only rows, database-authorized roles, private authorization lookup, restricted function grants and empty privileged search paths. Withdrawal review locks the row before checking transitions, preventing concurrent reviews from reopening or skipping states.

Typed async casino/payment interfaces expose explicit capabilities and normalized provider errors. Production adapters must live behind a server boundary. Browser modules cannot import `server/` or Node APIs (lint gate). The local fake provider verifies raw-body signatures, deduplicates events and exercises retry behavior using synthetic records only. It is not an operational server or durable payment system.
