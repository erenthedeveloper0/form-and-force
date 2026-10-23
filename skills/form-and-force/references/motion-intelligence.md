# Motion intelligence

Motion is a language, a spatial system and a way of explaining things. This file is the method. Code patterns and library lifecycles are in motion-implementation.md.

## Contents
1. Motion identity
2. Motion hierarchy (four levels)
3. Choreography specification
4. The signature moment
5. Scroll as a narrative medium
6. Navigation, page transitions and preloaders
7. Interactive widget states
8. Choosing the technology
9. Performance and cleanup requirements
10. Accessible motion
11. Motion critique checklist

---

## 1. Motion identity

Define a motion personality per project and write it into the design language. Choose a position on each dimension and give the reason. Not every project needs springs, smooth scroll, parallax or cinematic transitions.

| Dimension | Range | Ask |
|---|---|---|
| Character | mechanical ↔ organic | Does the subject behave like a machine, a liquid, paper, light, a living thing? |
| Acceleration | linear ↔ strongly eased | Precise instruments start crisply; heavy objects ease in slowly. |
| Deceleration / settling | abrupt stop ↔ long settle | Confident, final actions stop short; contemplative reveals settle. |
| Rhythm | steady pulse ↔ syncopated | Does the content have a beat (lists, data, music) or a flow (story)? |
| Spatial model | flat layers ↔ deep space | Do things slide on a plane, stack like paper, or recede in depth? |
| Physicality | weightless ↔ massive | Inertia, overshoot and follow-through only when mass is part of the idea. |
| Elasticity / overshoot | none ↔ playful | Overshoot reads as play. Wrong for compliance, finance or grief. |
| Anticipation | none ↔ pronounced | Wind-up before big moves signals intent; skip it for frequent actions. |
| Continuity | cuts ↔ continuous morphs | Do objects persist across states (shared elements) or are scenes separate? |
| Interruption | finish-then-respond ↔ instantly redirectable | User-driven motion must always be interruptible. |
| Reveal behaviour | fade / wipe / mask / build / unfold / type-on | Choose one family that matches the material (paper unfolds, light fades, ink draws). |
| Reversal | mirror ↔ distinct exit | Exits are usually faster and simpler than entries. |

Write it as a sentence and tokens. For example: *"Ledger motion: crisp mechanical entries (no overshoot); rows settle with a 40 ms stagger like stamped lines; panels slide on one plane; exits are 30% faster than entries."*

**Motion tokens** (name them for meaning, not speed):
```css
:root {
  --dur-instant: 90ms;    /* feedback: press, toggle */
  --dur-quick: 160ms;     /* hover, small state change */
  --dur-move: 280ms;      /* component open/close, panel */
  --dur-scene: 600ms;     /* route/section transition */
  --ease-enter: cubic-bezier(.2, .7, .1, 1);   /* decisive arrival */
  --ease-exit: cubic-bezier(.4, 0, 1, 1);      /* quick departure */
  --ease-move: cubic-bezier(.65, 0, .35, 1);   /* in-place transform */
  --stagger-step: 40ms;
}
```
These values are an example scaffold. Derive the real values from the identity sentence.

## 2. Motion hierarchy

Rank all motion so it doesn't compete. Only one level should be "loud" at any moment.

| Level | Includes | Typical duration | Rule |
|---|---|---|---|
| **1. Experience transitions** | Page entry, route changes, scene changes, major state transformations | 400–1200 ms (never blocks input longer than needed) | Rare, meaningful, skippable; carries continuity between stages |
| **2. Section / narrative** | Scroll-driven reveals, pinned scenes, progressive diagrams, section-to-section changes | Scroll-linked, or 300–800 ms | Serves the story; content must exist without it |
| **3. Component** | Expand/collapse, tabs, menus, sliders, drag, charts, product widgets | 150–400 ms | Shows where things came from and went |
| **4. Micro-interactions** | Press, focus, toggles, small confirmations, loading feedback | 60–200 ms | Immediate, consistent, never decorative loops |

Budgets per mode are in project-modes.md §14. On any screen, there should be **at most one Level 1–2 motion in progress** while the user is reading.

## 3. Choreography specification

Every major animated sequence gets a spec (template: assets/motion-spec.md). Phrases like "smooth reveal", "cinematic" or "add parallax" are not specs.

```
Sequence: <name>                     Level: 1|2|3|4
Purpose: what it explains or enables
Trigger: load | route | scroll range (start/end) | click | hover/focus | drag | state change | data arrival
Initial state: (per element: opacity, transform, clip, etc.)
Intermediate states / keyframes:
Final state:
Duration / range: ms, or scroll distance (px / vh / % of section)
Easing: token or curve; scrubbed sequences: linear mapping + eased properties
Stagger: order (DOM / reading / distance from origin), step, cap on total
Dependencies: what must load or finish first (fonts, images, data)
Scroll relationship: none | triggered once | scrubbed | pinned (pin length, pinSpacing)
Input relationship: pointer / touch / keyboard equivalents
Interruption & cancel: what happens if the user acts mid-sequence (redirect, finish fast, jump to end)
Exit / reversal: reverse on scroll-up? distinct exit? on unmount?
Reduced-motion alternative: replacement (dissolve, instant, static frame) — content and controls unchanged
Mobile adaptation: shorter range, no pin, simpler path, lower particle count
Performance constraints: properties used, layers, max elements animated, GPU cost
Test method: how to verify (audit_page scroll shots, manual, perf trace, unit test on state)
```

**Stagger discipline:** cap a stagger's total at about 300–400 ms for UI. Animate groups rather than every item when there are more than about 12. Order by reading direction or by spatial origin of the trigger.

**Timing heuristics:** exits are shorter than entries. Larger travel distance means slightly longer duration. Frequently repeated interactions should be fastest. Never make users wait for decorative motion before they can act.

## 4. The signature moment

A signature moment is an interaction or transition that is memorable, conceptually relevant and inseparable from this project. It need not be 3D or full-screen.

Forms it can take: an interactive product demonstration, a transformation between related scenes, a spatial reveal, a data transformation, a navigation mechanic, an unexpected but understandable interaction with content.

Corpus examples (principles, not templates):
- A signature drawn over a portrait: personal equity becomes motion.
- A photoreal freight yard overlaid with its digital twin: the product mechanism becomes the reveal.
- Scrolling down a product's absurdly long shadow while the copy jokes: one camera move plus voice.
- Brand-guideline tiles that are also the navigation: the specimen becomes the index.

Spec it with these questions:
- **Why it belongs:** trace it to subject-mining items (creative-process.md §3).
- **Discovery:** how users find it without instructions (placement, affordance, first-frame hint).
- **Communication:** what users understand afterwards that they didn't before.
- **Aftermath:** what happens next. It must hand off to the journey, not dead-end.
- **Fallbacks:** reduced motion, no WebGL, touch, keyboard, slow device.

Limit: **one or two per experience.** Many unrelated effects simulate creativity and destroy hierarchy.

## 5. Scroll as a narrative medium

Patterns:
- **Continuous scrub:** progress maps to scroll (diagram builds, object rotations). Good for explaining mechanisms.
- **Discrete steps:** scrollytelling with text steps that trigger graphic states. Good for arguments with evidence.
- **Pin and release:** hold a scene while its contents change, then release. Keep pins short; long pins feel like a trap.
- **Section transitions:** shared colour or shape bridges between sections; masks; wipes that follow the content's material.
- **Horizontal travel:** only when content is truly sequential and horizontal (timelines, film strips), with vertical-scroll mapping and visible progress.
- **Scroll-linked typography:** highlight or brighten words in reading order. Readable at every frame.
- **Progress indicators:** for long narratives and pinned sequences.
- **Depth and parallax:** only when depth expresses hierarchy or physical space. Disable under reduced motion.
- **Text–visual sync:** the text leads; the graphic state always matches the visible paragraph.

Safeguards. These are non-negotiable:
- Never make navigation depend on an animation finishing. Never hijack scroll velocity just to show off a technique.
- Content is reachable and readable with animation disabled, failed or unsupported.
- Anchors and deep links land on the right state. Back and forward restore position.
- Keyboard scrolling (Space, PageDown, arrows) and touch work the same way.
- Long pinned sequences need a clear narrative benefit, visible progress and a short mobile variant.
- Avoid blocking the scroll container (`overflow: hidden` on body) except for modal states.
- Smooth-scroll libraries need a reason (WebGL sync, scrub precision), must respect reduced motion, and must be prevented on nested scrollers.

## 6. Navigation, page transitions and preloaders

- **Route transitions** carry continuity: shared elements (a card becomes a detail header), directional movement for hierarchy (deeper = forward), and fast cross-fades for peers.
- **Overlays and menus** enter from their trigger's origin. Focus moves in. Escape closes. Exit is faster than entry.
- **Shared-element transformations:** View Transitions for DOM, or FLIP for older paths. Keep names unique per snapshot.
- **Returning:** restore scroll position and previous state. Back must not replay intros.
- **Deep links** render the destination's final state directly, with no intro replay.
- **Preloaders:** only for a real loading requirement (3D assets, audio, video) or an intentional transition that justifies it. Show real progress (bytes, asset count) or an indeterminate indicator. **Never invent percentages.** Offer a skip once content is usable. Show the poster or meaningful content as early as possible. The corpus showed a loader filling 10+ s on mobile.
- **Entry gates** ("Enter", "Click to start") need a reason (audio consent, asset streaming, ritual central to the concept), a keyboard path and a skip.

## 7. Interactive widget states

Design motion for each real state: hover, focus, press, release, drag, drop, selected, expanded, collapsed, loading, success, error, disabled, interrupted, cancelled.
- Hover can enrich but never be required to understand or operate a control. Touch needs an equivalent (tap, long-press with alternative, visible affordance).
- Focus motion must keep the focus indicator visible.
- Animations must reflect actual application state. A success tick plays when the request succeeded, not on a timer.
- Pressing gives immediate feedback (≤ 100 ms) even when the result is async. Then show the pending state, then the outcome.
- Drag: motion follows the pointer with no lag. Drop targets announce themselves. Cancel returns items to their origin. There is a non-drag alternative (WCAG 2.5.7).
- Disabled controls don't animate on hover. Explain why they are disabled when it isn't obvious.

## 8. Choosing the technology

Use the smallest reliable tool that expresses the concept. Inspect the project's existing dependencies first.

| Need | First choice | Escalate to |
|---|---|---|
| State transitions, hover/focus, simple enter/exit | CSS transitions, `@starting-style` | WAAPI |
| Keyframed loops, small sequences | CSS keyframes | WAAPI (controllable) |
| Height:auto expand/collapse | `grid-template-rows: 0fr → 1fr` or `interpolate-size` (Chromium) with fallback | Motion / GSAP |
| Scroll-linked progress and reveals | CSS scroll-driven animations inside `@supports` | GSAP ScrollTrigger |
| Pinning, scrubbed multi-step timelines, precise sequencing | GSAP + ScrollTrigger | — |
| React layout animations, shared layout, gestures | Motion (framer-motion), if already present | GSAP Flip |
| Route and shared-element transitions | View Transitions API (with feature detection) | Motion `layoutId` / GSAP Flip |
| SVG path drawing and morphing | CSS `stroke-dashoffset`, WAAPI | GSAP (DrawSVG/MorphSVG) |
| Many particles, image effects, custom shading | Canvas 2D | WebGL (three.js / OGL) |
| 3D scenes and products | three.js / React Three Fiber | Custom shaders where justified |
| Smooth scroll | Native scrolling | Lenis, only with a sync or narrative reason |

**Ownership rules:** one system owns each element's animated properties. Document it, for example "GSAP owns transforms in `<Hero>`; CSS owns colours and hover". Never combine two scroll systems (Locomotive and Lenis, ScrollSmoother and Lenis).

## 9. Performance and cleanup requirements

- Animate `transform`, `opacity` and (sparingly) `clip-path` and `filter`. Avoid `top/left/width/height/margin` animations. Name transitioned properties (no `transition: all`).
- Use `will-change` sparingly and temporarily. Hundreds of `will-change` elements (seen on corpus sites) waste memory.
- No layout reads after writes in the same frame. Batch with rAF. Use IntersectionObserver or ScrollTrigger instead of raw scroll handlers. Scroll and touch listeners must be passive.
- Cleanup on unmount: timelines, ScrollTriggers, observers, listeners, rAF loops, timers, WebGL resources, Lenis instances. Strict Mode must not create duplicate animations.
- Lazy-initialise heavy motion (WebGL, big timelines) when near the viewport. Pause loops on hidden tabs or off-screen.
- Clamp device pixel ratio for WebGL (for example `min(devicePixelRatio, 2)`). Scale quality by device tier.
- On interruption, kill or redirect running tweens before starting new ones (`overwrite: 'auto'` in GSAP).
- Provide capability fallbacks: no WebGL, low memory, save-data, reduced motion.

## 10. Accessible motion

- Respect `prefers-reduced-motion: reduce` by **replacing** motion, not deleting function:
  - Parallax, zoom, large translations, spatial transitions → none, or a short opacity cross-fade.
  - Scrubbed scenes → static key frames shown in sequence, or the final state with a caption.
  - Auto-playing video or animation → poster plus a play button.
  - Smooth scroll → native.
  - Micro-feedback (colour, opacity, small scale ≤ 1.02) may remain.
- Offer a **user-facing motion toggle** for motion-heavy experiences (WCAG 2.3.3 technique), persisted per visitor.
- Auto-moving content longer than 5 s needs pause/stop (WCAG 2.2.2). No flashing more than 3 times per second.
- Reduced motion must never mean broken navigation, missing content or dead controls. Test the reduced path as a first-class experience (`audit_page.mjs` captures it).

## 11. Motion critique checklist

- [ ] Identity sentence written; tokens derive from it.
- [ ] Hierarchy respected: one loud thing at a time.
- [ ] Every Level 1–2 sequence has a full spec.
- [ ] Signature moment traced to the subject; discoverable; hands off to the journey.
- [ ] No fade-up-on-everything; entrances reserved for hierarchy and narrative.
- [ ] Interruptible; no input blocked by decoration.
- [ ] Reduced-motion path reviewed visually (reduced-motion capture in the contact sheet).
- [ ] Mobile variant reviewed (shorter pins, fewer particles, touch equivalents).
- [ ] No layout-property animations; listeners passive; cleanup verified (mount/unmount twice).
- [ ] Frame rate acceptable on a mid-range device or with 4× CPU throttle.
