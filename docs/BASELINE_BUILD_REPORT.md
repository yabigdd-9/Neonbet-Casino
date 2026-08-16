# Baseline Build Report — NeonBet Commercial V2

**Date established:** 2026-08-17
**Owner:** Dion · **Executor:** Hermes
**Purpose:** Record the frozen pre-upgrade state before commercial refactoring.

## Git State
- **HEAD SHA:** `5ded8ea98d404bfb5d4bda774d9bc8a4a325ed45`
- **Branch:** `upgrade/neonbet-commercial-v2` (checked out)
- **Backup tag:** `pre-commercial-v2` (exists)
- **Working tree:** clean — `git status --short` returned no output.
- **History:** single commit (`5ded8ea Audit and harden launch readiness`) on this branch.

## Verified Stack (from `package.json`)
| Package | Version | Role |
|---|---|---|
| react | 19.2.6 | UI runtime |
| react-dom | 19.2.6 | DOM renderer |
| vite | 8.0.13 | Build/dev server |
| @vitejs/plugin-react | 6.0.2 | JSX/React plugin |
| @supabase/supabase-js | 2.105.4 | Optional backend client |
| lucide-react | 1.16.0 | Icon set |
| tailwindcss | 3.4.19 | Utility CSS (dev) |
| postcss | 8.5.14 | CSS pipeline (dev) |
| autoprefixer | 10.5.0 | CSS prefixing (dev) |

Project type: Geo-only static frontend (`"type": "module"`, no SSR). Provided scripts: `dev` (vite), `build` (vite build), `preview` (vite preview).

## How to Run
```bash
npm install            # install dependencies
npm run dev            # start Vite dev server (prints local URL)
npm run build          # produce production bundle in dist/
npm run preview        # preview the built bundle
```
Supabase is optional. Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, the app runs in browser-only local mode (see AUDIT_REPORT §f).

## Deploy
GitHub Actions workflow at `.github/workflows/deploy.yml` builds `dist/` and deploys to GitHub Pages on every push to `main`. Supabase values are injected from GitHub repository secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Node 24 runtime.

## Architecture Risk (Highest-Priority Finding)
The entire application lives in a **single file**: `src/main.jsx` — **2,973 lines, 130,557 bytes (~130 KB)**. `src/styles.css` (355 B) and `src/supabaseClient.js` (513 B) are the only other source files.

Consequences:
- No modular structure (no components/, hooks/, lib/, pages/).
- No separation of concerns: data access, UI, game logic, and config are interleaved.
- No test suite, no TypeScript — plain `.jsx`, no type safety.
- High change-risk: any edit touches a monolith; very hard to white-label, review, or hand off to a buyer.

This monolith is the central target of the Commercial V2 refactor.

## Baseline Statement
Working tree was **clean** at capture. A `pre-commercial-v2` backup tag and the `upgrade/neonbet-commercial-v2` branch both exist, so the baseline can be restored at any point. No source files were modified to produce this report.
