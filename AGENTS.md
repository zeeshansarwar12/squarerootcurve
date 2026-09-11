# Project Instructions

## Workflow

Before editing code:

1. Inspect the existing implementation.
2. Read only the documentation relevant to the task.
3. Reuse existing components, styles, and utilities where practical.
4. Make the smallest change that satisfies the task.
5. Do not redesign or refactor unrelated areas.
6. Do not install dependencies unless genuinely necessary.
7. Preserve existing functionality unless the task explicitly changes it.
8. Run the relevant existing checks and tests after changes.

## Documentation map

- `docs/PRODUCT.md` — product behavior and feature priorities
- `docs/DESIGN.md` — visual direction and UI rules
- `docs/SEO.md` — search strategy and page targeting
- `docs/CALCULATIONS.md` — authoritative math and test cases
- `docs/DECISIONS.md` — decisions that should not be reopened casually

Read only the files relevant to the current task.

## Design responsibility

Codex is primarily the implementer. Do not invent a new visual direction. Follow `docs/DESIGN.md`; when requirements are missing, preserve the established visual language rather than generating generic UI.

## Token efficiency

Do not reread unrelated documentation, rewrite unchanged files, explain obvious code, create unnecessary abstractions, duplicate components, or perform unrequested broad refactors. Keep completion summaries brief.

After each task report only:

1. Files changed
2. Tests/checks run
3. Blockers or failures
4. One-line result
