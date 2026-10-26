# htx-football

Static site (HTML/CSS/JS ES modules, no build). Data in `js/data/`, pure animation helpers in `js/anim.js`, tests `npm test`.

## Workflow (dcnet-workflow)
- Startup: read `feature_list.json` → `progress.md` → `session-handoff.md`; run `./init.sh`; `git log --oneline -5`.
- One feature at a time (only one `in-progress` in `feature_list.json`). Stay in scope of the active feature's spec/plan.
- Specs → `docs/specs/`, plans → `docs/plans/`.
- Definition of Done: behavior implemented + verification run this session (`npm test` + browser check at 390px) + evidence recorded in `feature_list.json`/`progress.md` + `./init.sh` still passes.
- Before ending: update `progress.md`, `feature_list.json` status/evidence, `session-handoff.md` for larger work; commit at a safe state.

## Conventions
- Coordinates `[x, y]` 0–100, `y = 0` = opponent goal. 8 slots: GK LB CB RB LM CM RM ST.
- UI text Vietnamese; jokes target tactics/roles, never people.
- Repo is public with real member photos (owner-approved 2026-10-26).
