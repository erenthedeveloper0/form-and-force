# Responsive engineering

Don't shrink desktop layouts. Decide how information architecture, composition, interaction and motion transform across viewport ranges and input modes.

## Contents
1. Ranges to design and test
2. Transform, don't shrink
3. Layout techniques
4. Input modes (hover, pointer, touch, keyboard)
5. Mobile-specific patterns
6. Motion across devices
7. Media and art direction
8. Testing protocol

---

## 1. Ranges to design and test

| Range | Representative test widths | Notes |
|---|---|---|
| Small phone | 360 × 740 | Tightest layout; long words; sticky UI collisions |
| Phone | 390–430 × 844–932 | Primary mobile target |
| Landscape phone | 844 × 390 | Short viewport: pinned scenes, full-height heroes, modals |
| Tablet / small laptop | 768–1024 | Touch *and* pointer; split views |
| Desktop | 1280–1440 | Primary desktop composition |
| Wide | 1920+ | Max widths, line length, image resolution, empty space |

Content also scales by **container**, not only viewport. Test components in their narrowest and widest containers.

## 2. Transform, don't shrink

For each major view, write what changes per range:
- **IA:** what is hidden behind disclosure, moved later, or removed on small screens, and whether it's still reachable.
- **Order:** re-sequence for the narrow reading path. The corpus examples (Son Daven, Shopify Editions) re-order rather than scale.
- **Composition:** asymmetric desktop grids become a deliberate single column with its own rhythm, not stacked leftovers.
- **Interaction:** hover reveals become visible affordances or tap; drags get buttons; tables become cards or scroll with sticky first columns.
- **Motion:** shorter pins, fewer layers, simpler paths, lower particle counts. Some scenes become static frames.
- **Typography:** fluid scale with `clamp()`, measure limits, and wrapping behaviour for long headlines.

## 3. Layout techniques

```css
/* Fluid type and space with sane bounds */
:root { --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem); --step-5: clamp(2.5rem, 1.6rem + 4.5vw, 6rem); }

/* Component-level responsiveness */
.product-panel { container-type: inline-size; }
@container (min-width: 36rem) { .product-panel .body { grid-template-columns: 1fr 1fr; } }

/* Full-height sections that don't jump with mobile browser chrome */
.scene { min-block-size: 100svh; }

/* Hover only where hover exists */
@media (hover: hover) and (pointer: fine) { .tile:hover .reveal { opacity: 1; } }
```
- Prefer intrinsic layouts (`minmax`, `auto-fit`, flex-wrap) before adding breakpoints. Use breakpoints where the *content* breaks.
- Avoid fixed heights on text containers. Use `aspect-ratio` for media boxes.
- Prevent horizontal overflow with `minmax(0, 1fr)`, `overflow-wrap: anywhere` for long tokens, and `max-inline-size: 100%` for media. The audit reports offenders.
- Respect safe areas: `padding-inline: max(var(--margin), env(safe-area-inset-left))` with `viewport-fit=cover` when full-bleed.

## 4. Input modes

- Treat touch, mouse, pen and keyboard as separate inputs; a laptop may have touch and a tablet a keyboard.
- Hover: never the only path to content or actions.
- Pointer precision: `(pointer: coarse)` gets larger targets and spacing.
- Keyboard: every interaction has a key path; visible focus at every size.
- Gestures: swipe, pinch and drag have button alternatives. Don't hijack native horizontal swipe (back navigation) at screen edges.

## 5. Mobile-specific patterns

- **Navigation:** a menu button with `aria-expanded`; a full-screen or sheet menu that is modal; current page indicated. Consider a bottom bar for app-like products with 3–5 top-level destinations.
- **Sticky actions:** a sticky add-to-cart or primary CTA must not cover content or focus, and should hide when the keyboard is open.
- **Filters:** a bottom sheet or full-screen panel with apply and reset, result count, and preserved state.
- **Data:** priority columns, row-to-card transformation, or horizontal scroll with a sticky first column and a visible scroll cue.
- **Forms:** single column; correct `inputmode`; labels above fields; error summary at the top on submit.
- **Content hierarchy:** the one thing this page must deliver appears within the first screen.

## 6. Motion across devices

- Set mobile budgets: fewer simultaneous animations, smaller WebGL resolution (clamped DPR), no heavy blur.
- Pins shorter or replaced. Scrubbed sequences can become step-triggered.
- Use `gsap.matchMedia()` or CSS media queries for separate desktop and mobile timelines. Don't just scale desktop values.
- Loaders and gates must never outlast the content's real readiness. In the corpus, one loader covered 10+ s of mobile capture.

## 7. Media and art direction

- `<picture>` with crops per range when the subject would be lost.
- Responsive `srcset`/`sizes`; don't ship 2400 px images to phones.
- Video: smaller encodes for mobile; a poster; consider static on Save-Data or reduced motion.
- 3D: lower polygon or texture tiers on mobile; fall back to a poster on weak devices.

## 8. Testing protocol

```bash
node "${CLAUDE_SKILL_DIR}/scripts/audit_page.mjs" http://localhost:3000 /pricing /product/1 \
  --viewports 360x740,390x844,844x390,768x1024,1440x900,1920x1080
```
- Review `sheet.jpg` for every route: order, crops, overflow, sticky collisions, text wrapping.
- Check the audit's `horizontalOverflowPx`, `smallTargets` and focus findings per viewport.
- Rotate orientation; test with the software keyboard open on forms; zoom to 200%.
- Test at least one real phone for touch feel and performance when the work is motion- or WebGL-heavy.
