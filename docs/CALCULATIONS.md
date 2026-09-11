# Calculations

This file is the authoritative mathematical contract for implementation.

## Percentage formula

For raw percentage `p`, where `0 <= p <= 100`:

`c = 10 × √p`

Equivalently: `c = 100 × √(p / 100)`.

Example: for `p = 64`, `c = 10 × √64 = 80`.

## Points formula

For earned points `e` and possible points `t`, require `t > 0` and `0 <= e <= t`:

1. `p = (e / t) × 100`
2. `c = 10 × √p`

Equivalently: `c = 100 × √(e / t)`.

Example: `32 / 50 = 0.64`, so `100 × √0.64 = 80`.

Always normalize to a percentage. Do not apply `10 × √earnedPoints` unless the assessment is out of 100.

## Reverse calculation

For desired curved percentage `c`:

`p = (c / 10)² = c² / 100`

Example: a desired curved grade of `80` requires raw grade `64`.

For a test worth `t` points, required raw points are `t × (c / 100)²`.

## Boost and numerical behavior

`boost = curvedPercentage - rawPercentage`

Display boost as percentage points, not percent growth: `64 → 80` is `+16 percentage points`.

- Keep full floating-point precision internally and round only for presentation.
- Default display may use up to one decimal when needed; omit unnecessary `.0`.
- Never silently modify entered scores.
- Handle invalid and empty states gracefully; do not treat `0` as missing.

## Properties

Within the valid raw range, `0 → 0`, `100 → 100`, intermediate values increase or remain equal, and ranking is preserved because the function is monotonic. Lower scores receive larger absolute boosts than scores near 100.

Do not infer educational fairness or statistical validity from these mathematical properties.

## Required tests

At minimum verify:

```text
0 → 0
1 → 10
4 → 20
9 → 30
16 → 40
25 → 50
36 → 60
49 → 70
64 → 80
81 → 90
100 → 100
50 → 70.710678... (may display 70.7)
32 / 50 → 80
80 curved → 64 raw
70 curved → 49 raw
```

Also verify raw → curved → reverse returns the original raw score within floating-point tolerance.

## Letter grades

Letter grades are policy-dependent; never treat one US scale as universal. If added later, identify the default scale, allow customization where appropriate, and keep grading policy separate from the core formula.
