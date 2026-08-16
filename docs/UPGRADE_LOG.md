# Upgrade Log — NeonBet Commercial V2

Format per entry: Change / Date / Commit / Area / Problem / Implementation / Files Changed / Validation / Result / Remaining Risk.

---

## Baseline establishment (commercial V2 start)
- **Date:** 2026-08-17
- **Commit:** pending (docs only; not committed)
- **Area:** Project foundation
- **Problem:** No documented, tagged starting point existed for the Commercial V2 refactor (modular, white-label, buyer-friendly product). The app was a single 2,973-line `src/main.jsx` monolith with owner-specific secrets hard-coded and no tests/types/a11y.
- **Implementation:** Captured baseline state; verified stack from `package.json`; confirmed clean working tree, `pre-commercial-v2` tag, and `upgrade/neonbet-commercial-v2` branch; produced the P0 documentation set (BASELINE_BUILD_REPORT, AUDIT_REPORT, FEATURE_MATRIX, UPGRADE_LOG, UPGRADE_BACKLOG). Did not modify any source, `package.json`, or commit.
- **Files Changed:** created `docs/BASELINE_BUILD_REPORT.md`, `docs/AUDIT_REPORT.md`, `docs/FEATURE_MATRIX.md`, `docs/UPGRADE_LOG.md`, `docs/UPGRADE_BACKLOG.md` (no source changes).
- **Validation:** `git status --short` clean; `git rev-parse HEAD` = `5ded8ea98d404bfb5d4bda774d9bc8a4a325ed45`; `git tag -l` includes `pre-commercial-v2`; `git branch --show-current` = `upgrade/neonbet-commercial-v2`; stack versions read directly from `package.json`.
- **Result:** Reproducible baseline established. Monolith risk, hard-coded owner wallet/contact secrets, zero a11y, no tests/TS, and demo/Supabase divergence are recorded as the top blockers; 70+ backlog items mapped to phases P0–P6.
- **Remaining Risk:** Source still a monolith; owner wallet/Telegram/WhatsApp strings still live in `src/main.jsx`; RLS not confirmed applied to the live project; no admin self-onboarding path; full `git log -p` secret sweep not yet run as a release gate.

## Modularization + white-label externalization (Commercial V2, in-progress commit)
- **Date:** 2026-08-17
- **Commit:** pending (staged + untracked source, not yet committed to `upgrade/neonbet-commercial-v2`)
- **Area:** Architecture, config, tests
- **Problem:** `src/main.jsx` was a 2,973-line monolith holding UI, game simulation, auth, verification, admin, and hard-coded owner wallet/Telegram/WhatsApp strings — not sale-grade.
- **Implementation:** Strangler extraction to the target structure: `src/app/App.jsx` orchestration shell, `src/components/{ui,layout,feedback}`, `src/features/{auth,account,verification,transactions,admin,casino,promotions}`, `src/services/*`, `src/hooks/useGameHistory.js`, `src/lib/{gameEngine,storage,status}`, `src/providers/{casino,payment}`, `src/config/{appMode,brand,contact,features,tokens,verification}`, `src/data/*`. `main.jsx` reduced to 10-line bootstrap. Owner secrets externalized: wallet addresses empty in `config/verification.js`, contact links driven by `VITE_TELEGRAM_URL`/`VITE_WHATSAPP_URL` in `config/contact.js`. Game engines unit-tested; Vitest + jsdom added; 58 tests passing.
- **Files Changed:** ~70 new files (src tree) + docs/* + README rewrite + package.json (added test script + vitest/jsdom) + vitest.config.js + styles/index.css rename.
- **Validation:** `npm run build` ✅ (492 KB JS / 138 KB gzip); `npm run test` ✅ 58/58 pass across 9 files; `npm run dev` ✅ serves on :5173, all modules transform; current-file secret sweep (src/public/supabase) ✅ clean — no live wallet/contact strings present.
- **Result:** Monolith decomposed; secrets removed from source; baseline tests established. Product is now modular, buyer-rebrandable, and verified building/running.
- **Remaining Risk:** **Git history still leaks owner secrets.** `git log -p --all` shows the personal wallet `0x3f8b…a7d29`, `t.me/&lt;owner-handle&gt;`, and `wa.me/&lt;owner-number&gt;` committed in the baseline (line refs ~187–190, ~268–269, ~2642–2645, ~2902–2937) on `main` and inherited by this branch. Current working tree is clean, so committing the refactor is safe, but any push to a public/remote target must first purge history (rebase/ filter-repo) or the personal data ships. This is an open P0 gate requiring owner decision. RLS still not confirmed applied to the live project.
