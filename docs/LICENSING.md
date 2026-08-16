# NeonBet Licensing (Commercial V2)

NeonBet is sold as **commercial source code**, not as a toy project. It is not
open-source. The repository ships with a `LICENSE` file describing the
proprietary terms.

## Licence tiers

| Tier | Name | What the buyer may do | May not |
|------|------|----------------------|---------|
| 1 | Source Code | Use, study, and modify the code for their own projects | Redistribute or resell the source |
| 2 | Commercial / Extended | Use in unlimited end products they operate or deliver | Resell, sublicense, or redistribute the source |
| 3 | White Label + Setup | Tier 2 rights + rebrand assistance + deployment support | — (per contract) |

## What "not open-source" means for a buyer

- There is no public copyleft or permissive grant.
- The buyer receives a private licence key / agreement, not a public repo right.
- Redistribution of the source (including on GitHub publicly) is prohibited
  unless explicitly contracted.

## Before you sell

- Confirm the buyer's jurisdiction and intended use.
- Ensure the deployment target configures `VITE_*` env vars (no secrets in
  source) — see `.env.example` and docs/SECURITY.md.
- Point them at `docs/WHITE_LABEL.md` for rebranding and `docs/DEPLOYMENT.md`
  for hosting.
- State prominently (README + listing) that this is not a turnkey regulated
  gambling platform.

## Transferring the repository

When handing the repo to a buyer, share the **local clone only after the
secret-history purge** (see docs/UPGRADE_LOG.md P0). Never transfer a clone
that still contains the baseline owner wallet / contact strings.
