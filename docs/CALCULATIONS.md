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


## Bell curve / z-score normalization

The Bell Curve Grade Calculator uses a z-score normalization based on the full set of entered class scores.

For class scores `x₁ ... xₙ`:

1. Compute the class mean:

`μ = (x₁ + ... + xₙ) / n`

2. Compute the **population** standard deviation for the entered class:

`σ = √(Σ(xᵢ − μ)² / n)`

3. For each score `x`, compute its z-score:

`z = (x − μ) / σ`

4. Map that z-score to an instructor-selected target distribution:

`adjusted = targetMean + z × targetSD`

This preserves each student's relative distance from the class mean before optional clipping.

### Bell curve constraints

- Require at least two valid scores.
- Require variation in the class scores; if `σ = 0`, normalization is undefined and must be refused.
- Target mean must be between 0 and 100.
- Target standard deviation must be greater than 0.
- Keep full floating-point precision internally and round only for display.
- If the user enables capping, clamp adjusted percentages to `0–100` only after the z-score transformation.
- When capping occurs, the realized adjusted mean and standard deviation may differ from the requested target values; never claim otherwise.
- Do not infer letter grades from z-scores unless an explicit grading policy is supplied.

### Bell curve test cases

For class scores `60, 70, 80`:

- mean = `70`
- population SD ≈ `8.1649658093`
- z-scores ≈ `-1.2247448714, 0, 1.2247448714`

With target mean `75` and target SD `10`, uncapped adjusted scores are approximately:

- `60 → 62.752551286`
- `70 → 75`
- `80 → 87.247448714`

Also verify:

- identical scores such as `70, 70, 70` are rejected because standard deviation is zero;
- capping keeps final adjusted percentages within `0–100`;
- with capping disabled, the transformed distribution has the requested target mean and target population standard deviation within floating-point tolerance.
