# Technical foundations

These are the verified technical facts the skill's engineering guidance rests on. Support data comes from MDN browser-compat-data **8.1.7 (2026-10-22)**. It will go stale, which is why the skill tells the agent to feature-detect and re-check support rather than copying the version numbers here.

## Contents
1. Rendering and animation performance
2. Animation technology support snapshot
3. Library lifecycles (GSAP, Lenis, three.js, React)
4. Accessibility baselines (WCAG 2.2, APG, reduced motion)
5. Core Web Vitals and loading
6. Fonts and images
7. Security and integrity
8. Implications adopted by the skill

---

## 1. Rendering and animation performance
- Animate `transform` and `opacity`, which stay on the compositor. Layout and paint properties (`top/left/width/height/margin`, blur, shadows) cost far more. web.dev's guide showed the `top/left` version of an animation dropping about 50% of frames against about 1% for `transform`. [web.dev animations guide]
- `will-change` is a last resort. Set it shortly before a known change and remove it afterwards. Each extra layer costs memory. [web.dev]
- Avoid layout thrashing, meaning reads of layout values right after style writes in the same task. Batch reads before writes. [web.dev INP]
- Main-thread budget: INP ≤ 200 ms (p75). Keep event handlers light, yield long work (`setTimeout`, or `scheduler.yield` where supported), and keep DOM size moderate. [web.dev INP, upd 2025-09-02]

## 2. Animation technology support snapshot (BCD 8.1.7)

| Feature | Chrome | Firefox | Safari | Use as |
|---|---|---|---|---|
| Same-document View Transitions (`startViewTransition`, `view-transition-name`) | 111 | 144 | 18 | Progressive enhancement; Baseline 2025 |
| Cross-document `@view-transition` | 126 | — | 18.2 | Enhancement for MPAs; Firefox gets an instant swap |
| Scroll-driven animations (`animation-timeline`, `scroll()`, `view()`, `animation-range`) | 115 | 159 | 26 | Native-first for simple scroll-linked effects, inside `@supports` |
| `animation-trigger` | 146 | — | — | Experimental; don't depend on it |
| `@starting-style` | 117 | 129 | 17.5 | Entry transitions for popovers, dialogs and inserted nodes |
| Popover API | 114 | 125 | 17 | Menus, tooltips, light-dismiss layers |
| `<dialog>.showModal()` | 37 | 98 | 15.4 | Modals (native focus trapping and inert background) |
| `inert` | 102 | 112 | 15.5 | Disable off-screen panels and background content |
| Anchor positioning | 125 | 147 | 26 | Popovers and tooltips; keep a fallback |
| `interpolate-size` | 129 | — | — | Chromium-only height:auto transitions; needs a fallback |
| `text-wrap: balance` / `pretty` | 114 / 117 | 121 / — | 17.5 / 26 | Headline balance; `pretty` as enhancement |
| `prefers-reduced-motion` | baseline since 2020 | | | Required |
| `prefers-reduced-transparency` | 118 | 113 | — | Optional glass and blur fallback |
| `hover` / `pointer` media | 38/41 | 64 | 9 | Gate hover-only affordances |
| `forced-colors` | 89 | 89 | 16 | High-contrast mode support |
| `content-visibility` | 85 | 125 | 18 | Off-screen rendering savings (breaks ScrollTrigger measurement) |
| `fetchpriority` on img | 101 | 132 | 17.2 | LCP image only |
| Implicit `noopener` on `target=_blank` | 88 | 79 | 12.1 | No need to add `rel="noopener"` for modern targets |

## 3. Library lifecycles

**GSAP (free including plugins, per gsap.com/pricing).**
- In React, use `useGSAP()` from `@gsap/react`. It reverts tweens, timelines, ScrollTriggers, Draggables and SplitText through `gsap.context()`. Pass `scope` for selector scoping. Wrap animations created later in `contextSafe()`. Use `dependencies` and `revertOnUpdate` for re-runs. It is Strict-Mode safe. In the App Router, mark the file `"use client"`.
- ScrollTrigger:
  - Register the plugin, or tree-shaking drops it.
  - Create triggers in page order or use `refreshPriority`.
  - Don't animate the pinned element; animate its children.
  - Put one ScrollTrigger on a timeline, never on its child tweens.
  - `content-visibility: auto` breaks measurement.
  - Use `gsap.matchMedia()` for breakpoints and reduced motion (`ScrollTrigger.matchMedia` is deprecated).
  - `invalidateOnRefresh` handles responsive values; `anticipatePin: 1` handles big pins.
  - `pinSpacing` defaults to false inside flex parents.

**Lenis (package `lenis`).**
- `autoRaf: true`, or drive it from `gsap.ticker`: `lenis.on('scroll', ScrollTrigger.update)`, then `gsap.ticker.add(t => lenis.raf(t*1000))` and `gsap.ticker.lagSmoothing(0)`.
- `respectReducedMotion` defaults to true; `syncTouch` is off by default (unstable on iOS < 16).
- `data-lenis-prevent` stops smoothing on nested scrollers (modals, maps, code blocks).
- Limits: no CSS scroll-snap support (use `lenis/snap`), a 60 fps cap in Safari, and no smoothing over iframes.

**three.js.**
- Nothing is freed automatically. Dispose geometries, materials, textures, render targets and skeletons, and post-processing passes or controls that have `dispose()`.
- `scene.remove` frees nothing. Call `ImageBitmap.close()` yourself.
- The renderer and controls are unusable after `dispose()`.
- Watch `renderer.info.memory` and `.programs` for growth. Internal textures from `envMap` or `scene.environment` may persist by design.

**React effects.** Every effect that subscribes (listeners, observers, rAF loops, timelines, WebGL contexts) returns a cleanup. Strict Mode runs effects twice in development to surface missing cleanup.

## 4. Accessibility baselines
- **WCAG 2.2 AA** is the default conformance target. New criteria:
  - 2.4.11 Focus Not Obscured (AA)
  - 2.5.7 Dragging Movements (AA): a single-pointer alternative
  - 2.5.8 Target Size Minimum: 24×24 CSS px or sufficient spacing (AA)
  - 3.2.6 Consistent Help (A)
  - 3.3.7 Redundant Entry (A)
  - 3.3.8 Accessible Authentication (AA)
  - 4.1.1 Parsing was removed.
- **2.3.3 Animation from Interactions (AAA)**: interaction-triggered motion can be disabled unless it is essential. Parallax is the canonical case. Page scrolling itself is essential; added scroll animation is not. Techniques C39 and SCR40 cover this.
- **2.2.2 Pause, Stop, Hide (A)**: auto-moving content lasting more than 5 s needs a pause control.
- **prefers-reduced-motion: reduce** means "remove, reduce, or *replace*". MDN's own example swaps a scale pulse for an opacity dissolve.
- **APG**: 30 patterns, including dialog, combobox, tabs, menu button, disclosure, listbox, carousel, slider, grid and treegrid. Native elements come first.

## 5. Core Web Vitals and loading
- Good thresholds at p75, mobile and desktop separately: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1**. Lighthouse uses TBT as a lab proxy for INP.
- LCP has four sub-parts: TTFB (~40%), load delay (< 10%), load duration (~40%) and render delay (< 10%).
  - Make the LCP resource discoverable in HTML.
  - **Never lazy-load it.**
  - Use `fetchpriority="high"` on at most one or two images.
  - Avoid client-only rendering of the hero.
  - Long tasks delay image render.
- Corpus evidence: lazy images above the fold appeared on 11 of 21 sites; mobile lab LCP above 4 s on 8 of 21.

## 6. Fonts and images
- Fonts:
  - Inline `@font-face` and use WOFF2.
  - Subset with `unicode-range`, checking the licence permits it.
  - Preconnect with `crossorigin` for third-party font origins, and preload sparingly.
  - Use `font-display: optional` for body and `swap` for brand display.
  - Match fallback metrics with `size-adjust`, `ascent-override` and similar to limit CLS.
  - Use fewer families; use variable fonts when many weights are needed.
- Images:
  - Set explicit `width`/`height` or `aspect-ratio`.
  - Use responsive `srcset`/`sizes`, and AVIF or WebP with fallbacks.
  - Lazy-load below the fold only.
  - Write meaningful `alt`, or `alt=""` for decoration.

## 7. Security and integrity
- Anything in the client bundle is public. No secrets go in `NEXT_PUBLIC_*`, `VITE_*` or `PUBLIC_*` variables.
- Raw HTML sinks (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`) need trusted or sanitised input.
- `target=_blank` implies `noopener` in modern engines, so `rel="noopener"` is harmless but redundant.
- Third-party scripts (analytics, embeds, consent tools) are part of the security and performance surface. Prefer a CSP and subresource integrity where the stack allows it.
- Integrity is a product property: no fabricated testimonials, logos, metrics or people. This is a WCAG-independent but non-negotiable requirement in the skill.

## 8. Implications adopted by the skill
1. Native first for simple scroll-linked and enter/exit motion (CSS transitions, `@starting-style`, scroll-driven animations, View Transitions), with `@supports` and feature detection. Use GSAP or WAAPI when choreography, scrubbing, sequencing or interruption control is needed. Use WebGL only when the concept needs it.
2. One animation system owns each element. If GSAP and CSS transitions both target the same property, CSS transitions on that property are removed.
3. Every motion system ships with a reduced-motion path. It replaces motion with dissolves or cuts and never removes content or controls.
4. The LCP element is never behind JS-only rendering or a lazy loader. Gates and preloaders need a real loading reason and a skip.
5. Verification uses real-browser evidence (`audit_page.mjs`), and reports separate lab measurements from field claims.
