# Visual implementation

Creative intent is unfinished until it's in code. This file covers turning art direction into composition, typography, colour, imagery and materials that hold up in a browser.

## Contents
1. Composition before decoration
2. Grids and layout systems in CSS
3. Typography
4. Colour in code
5. Images and visual assets
6. Distinctive materials
7. Iconography
8. Real implementation, not mock functionality
9. Visual QA

---

## 1. Composition before decoration

Order of work:
1. Structural hierarchy: what's first, second, third on each view.
2. Proportions and grid.
3. Typography.
4. Image placement and crop.
5. Rhythm (repetition and variation down the page).
6. Only then materials, effects and motion.

Turn decoration off (no shadows, gradients, blur or motion). If the page falls apart into a flat sequence of similar blocks, the composition is weak. Fix hierarchy, alignment, grouping and density. Don't add effects.

Composition tools that create distinction without decoration:
- **Asymmetry with a rule:** for example, content hangs from a left column of 5/12, and images bleed off the right edge.
- **Scale contrast:** a single dominant element per view; everything else clearly subordinate.
- **Density shifts:** dense data blocks next to generous narrative space, deliberately placed.
- **Alignment systems:** baseline-aligned text across columns, shared optical edges, hanging punctuation.
- **Overlap and layering:** only when it expresses a relationship (caption on image, annotation on object).
- **Full-bleed moments:** reserved for content that deserves the full frame.
- **Negative space as material:** empty space that frames, not space left over.

## 2. Grids and layout systems in CSS

```css
.page {
  --cols: 12; --gutter: clamp(16px, 2vw, 32px); --margin: clamp(16px, 5vw, 96px);
  display: grid;
  grid-template-columns: [full-start] var(--margin) [content-start] repeat(var(--cols), minmax(0, 1fr)) [content-end] var(--margin) [full-end];
  column-gap: var(--gutter);
}
.page > * { grid-column: content; }
.page > .bleed { grid-column: full; }
.page > .narrative { grid-column: content-start / span 7; }
```
- Use `minmax(0, 1fr)` to prevent overflow from long words or code.
- Use container queries (`container-type: inline-size`) for components that move between contexts.
- Use `subgrid` (where supported) to align card internals across a row.
- Use logical properties (`margin-inline`, `padding-block`) for RTL readiness.
- Use `dvh`/`svh` rather than `100vh` for full-height mobile sections, or the address bar causes jumps.

## 3. Typography

Typography is part of the architecture. Specify it as roles.

| Role | Decide |
|---|---|
| Display | Family, weight or axis values, size range (`clamp`), leading (0.9–1.1 for large display), tracking (tighten large sizes slightly; never track lowercase body), `text-wrap: balance` |
| Headings | A scale with a ratio that fits the density; consistent spacing above vs. below (more above) |
| Body | 16–20 px base; leading 1.4–1.7; measure 45–75 characters (`max-inline-size: 65ch`); `text-wrap: pretty` as enhancement |
| Caption / metadata | ≥ 12–13 px with real contrast (no 40%-opacity grey micro-text) |
| Labels / UI | Consistent case; sentence case by default; no tracked caps on every label |
| Numbers / data | Tabular figures (`font-variant-numeric: tabular-nums`) in tables and counters; units styled consistently |
| Code / technical | Monospace only where content is code or technical notation |

Rules:
- One or two families. A second family must be clearly different in function or voice.
- Choose type for the concept's voice: a hatched cut for a weaving heritage, credit-roll lettering for a film house, an engineering grotesk for an instrument. Check licence and web availability.
- Variable fonts: set axes deliberately (`font-variation-settings` or `font-weight`/`font-stretch`); use optical sizing (`font-optical-sizing: auto`) where supported.
- Kinetic typography only where words are the content of the moment, and readable in every frame.
- No arbitrary giant headlines. Size follows hierarchy and composition.
- Handle missing copy, long words (`overflow-wrap: anywhere` for URLs and IDs), and localisation expansion.

**Loading (avoid layout shift):**
```css
@font-face { font-family: "Brand Display"; src: url(/fonts/brand-display.woff2) format("woff2");
  font-display: swap; font-weight: 300 900; unicode-range: U+0000-00FF, U+0131, U+0152-0153; }
@font-face { font-family: "Brand Display Fallback"; src: local("Arial");
  size-adjust: 104%; ascent-override: 92%; descent-override: 24%; line-gap-override: 0%; }
h1 { font-family: "Brand Display", "Brand Display Fallback", sans-serif; }
```
Use `font-display: optional` for body text when layout stability matters more than the exact face. Preload only the one or two most critical files. With Next.js, prefer `next/font`, which handles self-hosting and fallback metrics.

## 4. Colour in code

- Define colour in OKLCH (perceptual lightness steps) or the project's existing space. Generate tints with `color-mix()`.
- Semantic roles: ground, ink, muted ink, accent, focus, states, data series. Components reference roles, never raw values.
- Check contrast: 4.5:1 for body text, 3:1 for large text and UI boundaries or focus indicators. Check every text-over-image case at its worst crop.
- Use a dominant colour with sharp accents rather than an evenly distributed palette, unless the concept is a system (like a brand-guidelines mosaic).
- Dark mode is a separate composition, not inverted values: reduce saturation and large bright areas, and re-check contrast.
- Support `forced-colors: active`. Don't convey state by colour alone.

## 5. Images and visual assets

- Use project-specific imagery: product screenshots, art-directed photography, original illustration, procedural graphics, diagrams. Inspect available assets first.
- **Never fabricate** client logos, people, testimonials or product screenshots that could mislead. When assets are missing, use an intentional strategy (diagrams, typographic compositions, procedural art, labelled placeholders) and tell the user what's needed.
- No unrelated stock photography as decoration.
- Delivery:
```html
<img src="/img/yard-1600.avif" srcset="/img/yard-800.avif 800w, /img/yard-1600.avif 1600w, /img/yard-2400.avif 2400w"
     sizes="(min-width: 1024px) 66vw, 100vw" width="2400" height="1350" alt="Container yard at dusk with trucks queued at gate 3"
     fetchpriority="high" decoding="async">   <!-- hero/LCP: no loading="lazy" -->
<img src="/img/detail.avif" loading="lazy" width="1200" height="800" alt="" />   <!-- decorative: empty alt -->
```
- Always set `width`/`height` or `aspect-ratio`. Lazy-load below the fold only. Never lazy-load the LCP image. Use `fetchpriority="high"` on at most one or two images.
- Alt text describes purpose and content in context; decorative images get `alt=""`.
- Art direction across breakpoints: use `<picture>` with different crops where the subject would otherwise be lost.
- Video: `muted playsinline` for autoplay; a poster; a pause control for anything longer than 5 s; captions for speech.

## 6. Distinctive materials

Possible materials: gradients, grain, procedural textures, SVG patterns, paper surfaces, dimensional type, fluid geometry, image treatments, shaders, spatial depth. Every material needs a **compositional role** that traces to the concept:
- Grain that simulates the client's actual print stock, on photography only, at a strength that keeps text crisp.
- Hatching derived from a craft tradition, used in type and illustration alike.
- A gradient that is the brand's owned asset and appears only where it means something.

Guardrails:
- Text legibility always wins. Put text on solid or scrimmed areas; test contrast at the worst point.
- Measure cost. Large `backdrop-filter`, big blur radii, full-screen SVG filters and animated gradients are paint-expensive, so profile on mobile.
- Provide `prefers-reduced-transparency` and `prefers-contrast` fallbacks for glass and low-contrast textures.

## 7. Iconography

- Icons only where they speed recognition: navigation, actions, status. Don't put an icon on every feature heading.
- One style (stroke weight, grid, corner treatment) that matches the type.
- Inline SVG with `currentColor`. Decorative icons get `aria-hidden="true"`; icon-only buttons need an accessible name.
- Avoid the stock "magic" set (sparkles, rockets, bolts, wands) unless the subject literally is that.

## 8. Real implementation, not mock functionality

- Build real components with working logic; connect state to what renders.
- Use real routing and links (deep-linkable, back-button-safe). Preserve browser expectations: middle-click, cmd-click, text selection, find-in-page.
- Implement loading, error, success and empty states where they apply.
- If a back end is missing, build a bounded local demo and label it (experience-flow.md §4).
- Don't let a beautiful static mock-up hide missing behaviour.

## 9. Visual QA

- View the contact sheet (`audit_page.mjs` → `sheet.jpg`) for every changed route at 390, 768 and 1440 px, plus the reduced-motion frame.
- Check alignment to the grid, optical alignment of icons and text, consistent spacing rhythm, widows and orphans in headlines, image crops at each breakpoint, focus rings on every interactive element, and dark mode if supported.
- Compare screens side by side for drift (coherence test).
