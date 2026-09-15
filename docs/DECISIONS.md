# Decision Log

## D001 — Exact-match specialist brand

`SquareRootCurve.com` focuses tightly on the square-root grading curve and closely related grading utilities. Do not turn it into a generic unrelated calculator portal.

## D002 — Tool-first homepage

The homepage is the flagship “square root curve” utility. Do not make users navigate from an informational homepage to the calculator.

## D003 — One definitive page before expansion

Build the flagship page to a high standard before producing supporting SEO pages.

## D004 — Academic Instrument visual direction

The approved direction is defined in `docs/DESIGN.md`; generic SaaS and calculator-template aesthetics are rejected.

## D005 — Incremental implementation

Build and review section by section. Do not generate the entire finished site in one pass unless explicitly instructed.

## D006 — Token-conscious Codex workflow

Use small delta prompts that reference persistent project docs instead of repeating the full specification.

## D007 — Calculation authority

`docs/CALCULATIONS.md` is the source of truth. If implementation or an external source disagrees, flag the discrepancy before changing the formula.

## D008 — No speculative SEO implementation

Schema, page expansion, and SEO features must be evidence-based and validated, not added merely because similar sites commonly use them.

## D009 — First supporting authority page

`/grade-curve-calculator/` owns multi-method grade-curving comparison intent, while `/` remains the canonical owner of Square Root Curve intent. “Highest score to 100” methods must explicitly distinguish proportional scaling from adding the top-score gap.