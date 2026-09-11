# Product

**SquareRootCurve.com is a focused academic grading utility designed to become the fastest and clearest reference for the square-root grading curve.**

## Audience and jobs

Primary audiences are teachers or instructors curving assessments and students checking how a square-root curve changes a grade.

Primary job-to-be-done:

> Enter a raw grade and immediately know the square-root curved grade.

Secondary jobs:

- Look up a score in a complete curve chart.
- Convert points earned and points possible.
- Reverse-calculate the raw grade required for a desired curved grade.
- Print or download the curve chart.
- Understand the formula and visualize the curve.
- Process multiple student grades.

## Product principle

The site is a **tool first**, not an article with a calculator buried inside it. Show the useful result immediately. Require no login, onboarding, pre-calculation modal, or unnecessary steps.

## Homepage

The homepage is the flagship product and targets broad “square root curve” intent. Its planned structure is:

1. Compact site header
2. H1 and one-sentence definition
3. Primary calculator
4. Calculation explanation/result
5. Complete curve chart
6. Print/download controls
7. Interactive curve visualization
8. Reverse calculator
9. Points-based calculator
10. Concise formula explanation
11. Worked examples
12. Batch/class calculator
13. FAQ/reference information
14. Restrained footer

Implement incrementally; not every section belongs in the first coding task.

## Core interaction

The calculator is the visual hero and should calculate live when reliable. For a raw score of `64`, make this relationship immediately clear:

```text
RAW SCORE 64% → CURVED SCORE 80%
BOOST +16 percentage points
```

Core calculation and chart information must remain understandable and accessible without elaborate animation.

## Priorities

### P0

- Raw percentage calculator and curved result
- Points gained and formula breakdown
- Responsive/mobile behavior
- Accurate validation

### P1

- 0–100 lookup chart
- Points-earned / points-possible mode
- Reverse calculator
- Print-friendly and downloadable PDF chart
- Graph

### P2

- Batch/class calculation and CSV input/export
- Customizable grade cutoffs
- Shareable calculation state

Do not prematurely implement P2 features.
