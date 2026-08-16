# NeonBet Deployment (Commercial V2)

NeonBet is a static Vite frontend. No server is required for **demo mode**;
Supabase mode needs a Supabase project for the optional backend.

## Prerequisites

- Node.js 18+ and a package manager (`npm` shown).
- For Supabase mode: a Supabase project + the anon key (service-role key is
  **never** used client-side).

## Build

```bash
npm install
npm run build          # outputs dist/
npm run preview        # serve the built bundle locally
```

## Demo mode (no backend)

```bash
VITE_APP_MODE=demo npm run dev
```

Runs entirely in the browser via `localStorage`. No accounts server, no
network calls. Safe default for previews and buyer demos.

## Supabase mode

1. Copy `.env.example` → `.env` and set:
   - `VITE_APP_MODE=supabase`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Apply `supabase/schema.sql` to your Supabase project (SQL editor or CLI).
3. Promote the first admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
4. `npm run dev` (or `npm run build && npm run preview`).

> RLS and the `private` schema in `supabase/schema.sql` must be applied and
> verified live. Admin is promoted by SQL only — there is no self-serve path.

## Hosting

### GitHub Pages

- The repo ships `.github/workflows/deploy.yml` which builds and publishes
  `dist/` to GitHub Pages on push to `main`.
- Set repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  for Supabase-mode builds (left blank for demo-mode pages).
- `base` in `vite.config.js` is set to the repo path
  (`/Neonbet-Casino/`) — change it if you rename the repo.

### Vercel

- Import the repo; framework = Vite. Build command `npm run build`, output
  `dist`.
- Set `VITE_*` env vars in project settings.

### Any static host / self-host

- `npm run build`, then serve the `dist/` folder over any static file host
  (Netlify, Cloudflare Pages, S3 + CloudFront, nginx, etc.).

## Security checklist before going live

- [ ] No secrets committed (run `npm run secret-scan`; see CI gate).
- [ ] `VITE_SUPABASE_ANON_KEY` is the anon key only.
- [ ] Supabase RLS applied and verified on the live project.
- [ ] Buyer replaced wallet addresses in `src/config/verification.js`.
- [ ] Buyer set support links (`VITE_TELEGRAM_URL` / `VITE_WHATSAPP_URL`).
- [ ] README / listing states this is **not** a turnkey regulated gambling
  platform.
