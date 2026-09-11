# Design: Academic Instrument

> A traditional teacher’s grading sheet and printed academic reference chart redesigned as a precise contemporary web tool.

The experience should feel credible, academic, highly functional, editorial, precise, calm, slightly tactile, and purpose-built. It must not feel like a startup/SaaS, fintech or AI product, template marketplace, or children’s education product.

Blend the qualities of a well-typeset academic handbook, teacher’s printed grade chart, editorial reference publication, and precision calculation instrument. Do not imitate a specific site.

## Tokens

Define colors as CSS custom properties rather than scattering values:

- Paper: `#F4F0E6`
- Primary surface: `#FFFDF7`
- Main ink: `#181816`
- Secondary ink: `#666159`
- Rules/borders: `#D5CFC2`
- Academic blue: `#244B6B`
- Red-pencil accent: `#A74736`

Use no gradients. Academic blue is the primary interactive and graph color. Reserve red for small annotations, emphasis, and warnings.

## Typography

- `Source Serif 4`: H1, major editorial headings, selected explanatory copy
- `IBM Plex Sans`: labels, navigation, controls, UI body, buttons
- `IBM Plex Mono`: formulas, steps, and selected numerical readouts

Use strong hierarchy and tabular numerals where alignment matters.

## Layout and opening

Use a disciplined, predominantly left-aligned grid with an approximately `1160–1200px` desktop content width. Organize with columns, typography, whitespace, and crisp `1px` rules—not card stacks or shadows.

Open with a compact masthead, left-aligned H1 and definition, then a wide calculation workbench integrated into the document. Never use the standard “marketing copy left, floating calculator card right” hero. Make `RAW SCORE → CURVED SCORE` unmistakable, with the numbers dominant, boost nearby, and a formula line such as `√64 × 10 = 80`.

Numbered editorial labels such as `01 — Calculate`, `02 — Chart`, `03 — Visualize`, and `04 — Formula` may be used sparingly.

## Surfaces and controls

- Keep radii generally within `0–8px`; large `16–32px` rounded cards are prohibited unless later approved.
- Avoid shadows; if depth is essential, make it extremely restrained.
- Make inputs feel like precision tools and allow large numerical inputs.
- Keep buttons straightforward and compact; avoid oversized CTAs.
- Use functional icons only when they improve recognition, such as Print, Download, or Copy. No decorative icon bubbles.

## Chart and graph

Treat the complete score chart as a first-class, printable academic reference. Provide strong numerical alignment, easy scanning, clear raw/curved columns, current-score highlighting, print friendliness, excellent mobile handling, and no clutter.

Graphs should resemble textbook/reference figures: thin grid rules, clear axes, one strong square-root curve, a raw-score reference when useful, and restrained annotation—not a dashboard analytics chart.

## Interaction, mobile, accessibility

Use only subtle, functional transitions for values, graph points, row highlights, and focus states. Respect `prefers-reduced-motion`.

On mobile, present the raw score first, preserve the directional relationship, show the curved score and boost without excessive scrolling, provide a tap-friendly numeric input, and prevent page overflow. Adapt tables without sacrificing readability.

Maintain WCAG-conscious contrast. Every interactive element needs keyboard access, visible focus, a proper label, and semantic HTML. Never rely on color alone.

## Prohibited patterns

Do not use generic SaaS/calculator-template styling, gradients, glassmorphism, neumorphism, ubiquitous cards or pills, huge rounded rectangles, excessive shadows, floating calculator cards, centered-everything layouts, vague giant marketing copy, fabricated testimonials/counts/badges, three-card feature or pricing layouts, decorative AI or stock imagery, emoji decoration, colored icon circles, blobs, page-wide meaningless grids, generic copy such as “Calculate smarter,” or ornamental animation.

When uncertain, simplify. The product itself provides the visual interest.
