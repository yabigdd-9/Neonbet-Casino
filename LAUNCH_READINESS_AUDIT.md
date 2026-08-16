# NeonBet Launch Readiness Audit

Date: 2026-07-05

## Public links

- Primary target: `https://yabigdd-9.github.io/Neonbet-Casino/`
- Secondary target: `https://53a89e45c57e5a61.vercel-dns-017.com`

## Readiness gates

- Local production build passed with `npm run build`.
- Clean dependency install passed with `npm ci`.
- GitHub Pages workflow deploys `dist` from `main`.
- The primary public URL returned `200` before this commit, but it was still serving the previous commit.
- Local production preview returned `200` for HTML, `social-preview.png`, the built JS bundle, and the built CSS bundle.
- Open Graph and Twitter image tags use an absolute GitHub Pages image URL.
- Supabase deployment secrets could not be confirmed locally because GitHub CLI auth is invalid.
- Live Supabase schema has not been applied from this workspace.

## Known blockers before public sharing

- The Vercel DNS URL has returned `DEPLOYMENT_NOT_FOUND` and must be relinked or redeployed before use.
- Vercel CLI is authenticated as `<owner-vercel-account>`, but no NeonBet project is listed in the account project list.
- GitHub CLI auth is invalid for `yabigdd-9`, so Actions/secrets cannot be inspected with `gh` from this machine.
- Local `.env.local` does not contain a Supabase anon key, so live auth/account smoke tests require the deployed secret or a local key.
- The Supabase schema file is ready in the repo, but applying it to the live project requires confirmed project credentials.

## Smoke test checklist

- Home page loads.
- Main JS, CSS, favicon, and share image load.
- Login/register modal opens.
- Verification and withdrawal forms reject invalid input.
- Slot and arcade modals open and close without runtime errors.
- Mobile and desktop viewport reloads produce no console errors.
- Public share metadata is visible in fetched HTML.
