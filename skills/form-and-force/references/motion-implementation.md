# Motion implementation

Code patterns for the motion decided in motion-intelligence.md. Use the project's existing tools first. Every pattern here includes cleanup and a reduced-motion path. Verify API details against current docs when the project's library versions differ.

## Contents
1. CSS foundations and reduced-motion structure
2. Enter/exit with `@starting-style`, dialogs and popovers
3. Expand/collapse without measuring
4. Web Animations API (controllable, cancellable)
5. CSS scroll-driven animations
6. View Transitions (SPA, MPA, React)
7. GSAP in React with `useGSAP`
8. ScrollTrigger recipes (pin, scrub, responsive, reduced motion)
9. Text splitting without breaking accessibility
10. Lenis smooth scroll (only with a reason)
11. Motion (framer-motion) patterns
12. three.js / React Three Fiber lifecycle
13. rAF loops, visibility and device tiers
14. FLIP for layout changes
15. Testing motion

---

## 1. CSS foundations and reduced-motion structure

Prefer **opt-in motion**: write the static, final layout first, then add motion only for users without a reduce preference. That way the reduced path is the default, not an afterthought.

```css
.card { opacity: 1; transform: none; }               /* final state is the base */

@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform var(--dur-move) var(--ease-enter),
                      opacity var(--dur-move) var(--ease-enter); }
}

@media (prefers-reduced-motion: reduce) {
  /* replace, don't delete: keep a gentle opacity change where it aids comprehension */
  .card { transition: opacity var(--dur-quick) linear; }
}
```

The blanket `* { animation-duration: .01ms !important }` kill switch is a last-resort safety net. It doesn't replace motion thoughtfully, and it can break JS that waits for `animationend`. If you add it, also design the replacements.

User-facing toggle (persisted) that overrides the OS setting:
```js
const root = document.documentElement;
const stored = localStorage.getItem('motion');              // 'reduce' | 'full' | null
const osReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
root.dataset.motion = stored ?? (osReduce ? 'reduce' : 'full');
// CSS: :root[data-motion="reduce"] .card { transition: opacity var(--dur-quick) linear; }
// JS libraries read root.dataset.motion instead of the media query directly.
```

## 2. Enter/exit with `@starting-style`, dialogs and popovers

```css
dialog[open] { opacity: 1; translate: 0 0; }
dialog { opacity: 0; translate: 0 12px;
  transition: opacity var(--dur-move) var(--ease-enter), translate var(--dur-move) var(--ease-enter),
              overlay var(--dur-move) allow-discrete, display var(--dur-move) allow-discrete; }
@starting-style { dialog[open] { opacity: 0; translate: 0 12px; } }
dialog::backdrop { background: rgb(0 0 0 / .4); }
@media (prefers-reduced-motion: reduce) { dialog { translate: none; } }
```
Use native `<dialog>` with `showModal()` for modals (focus containment, inert background, Escape). Use `popover` for menus and tooltips. Both work with `@starting-style`. Feature support is in the research snapshot: treat as enhancement; content still appears without the transition.

## 3. Expand/collapse without measuring

```css
.disclosure-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-move) var(--ease-move); }
.disclosure[open] .disclosure-panel, .disclosure-panel[data-open="true"] { grid-template-rows: 1fr; }
.disclosure-panel > .inner { overflow: hidden; }
@media (prefers-reduced-motion: reduce) { .disclosure-panel { transition: none; } }
```
`interpolate-size: allow-keywords` (Chromium only) enables `height: auto` transitions. Add it as an enhancement, never as the only path.

## 4. Web Animations API (controllable, cancellable)

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let anim;
function reveal(el) {
  anim?.cancel();                                   // interruption: cancel before re-running
  const frames = reduce.matches
    ? [{ opacity: 0 }, { opacity: 1 }]
    : [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }];
  anim = el.animate(frames, { duration: reduce.matches ? 120 : 320, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'both' });
  return anim.finished;                             // await for sequencing; catch AbortError on cancel
}
```
`fill: 'both'` keeps the final state but leaves the animation alive. For long-lived pages, commit styles (`anim.commitStyles(); anim.cancel()`) or set the final inline style instead.

## 5. CSS scroll-driven animations

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .step-figure {
      animation: figure-in linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 40%;
    }
  }
}
@keyframes figure-in { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }

/* Reading progress bar */
@supports (animation-timeline: scroll()) {
  .progress { transform-origin: 0 50%; animation: grow linear both; animation-timeline: scroll(root); }
}
@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```
These run off the main thread where the browser can manage it. Use them for simple scroll-linked effects. Escalate to ScrollTrigger for pinning, multi-step timelines, callbacks or snapping. Without support, elements simply show their final state (the base style).

## 6. View Transitions

**SPA helper with feature detection and reduced motion:**
```js
export function withTransition(update, { types = [] } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) { update(); return; }
  try { return document.startViewTransition({ update, types }); }       // object form with types
  catch { return document.startViewTransition(update); }                // older signature
}
```
```css
.product-card img { view-transition-name: var(--vt-name); }   /* set a unique name per item inline */
::view-transition-group(*) { animation-duration: var(--dur-scene); animation-timing-function: var(--ease-move); }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none; }
}
```
- Names must be unique among elements rendered at the same time. Duplicates abort the transition.
- **React:** the DOM must update synchronously inside the callback. Wrap the state update in `flushSync` (from `react-dom`) inside `startViewTransition`. Check whether the project's React or router version ships its own view-transition integration and use that instead.
- **MPA:** add `@view-transition { navigation: auto; }` to both pages. Firefox currently swaps instantly, which is acceptable as progressive enhancement.
- Avoid capturing huge areas with many named elements; each one is a snapshot.

## 7. GSAP in React with `useGSAP`

```tsx
"use client";                                   // App Router
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP, ScrollTrigger);    // once per module; prevents tree-shaking the plugin

export function Ledger({ rows }: { rows: Row[] }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ full: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { full } = ctx.conditions!;
      gsap.from(".row", full
        ? { y: 8, opacity: 0, stagger: 0.04, duration: 0.28, ease: "power2.out" }
        : { opacity: 0, duration: 0.12 });
    });
    // mm is reverted automatically by useGSAP's context
  }, { scope, dependencies: [rows.length] });

  const { contextSafe } = useGSAP({ scope });
  const pulse = contextSafe((el: HTMLElement) => gsap.fromTo(el, { scale: 0.98 }, { scale: 1, duration: 0.16, overwrite: "auto" }));

  return <div ref={scope}>{rows.map(r => <div className="row" key={r.id} onClick={e => pulse(e.currentTarget)}>{r.label}</div>)}</div>;
}
```
- Selector strings are scoped to `scope`. Animations created later (event handlers, timeouts) must go through `contextSafe`, or they leak.
- `gsap.from()` under Strict Mode is safe inside `useGSAP` because the context reverts between the double invocations.
- Don't let GSAP and CSS transitions fight over the same property. Remove the CSS transition on properties GSAP owns.
- `overwrite: "auto"` kills conflicting tweens on interruption.

## 8. ScrollTrigger recipes

**Pinned, scrubbed explanation with a mobile variant and a reduced-motion path:**
```tsx
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add({
    desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
    mobile: "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
  }, (ctx) => {
    const { desktop } = ctx.conditions!;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".mechanism",
        start: "top top",
        end: desktop ? "+=200%" : "+=120%",    // shorter pin on phones
        pin: true,                            // pins .mechanism; animate its CHILDREN only
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to(".mechanism .layer-a", { xPercent: -20 })
      .to(".mechanism .layer-b", { opacity: 1 }, "<")
      .to(".mechanism .caption-2", { opacity: 1 });
  });
  // reduce: no pin; the base CSS shows all layers and captions in reading order
}, { scope });
```
Rules (from the ScrollTrigger docs):
- Create triggers in page order, or set `refreshPriority`.
- Never animate the pinned element itself.
- Put one ScrollTrigger on the timeline, not on child tweens.
- `pinSpacing` defaults to false inside flex parents.
- Elements with `content-visibility: auto` can't be measured.
- Call `ScrollTrigger.refresh()` after late layout changes (fonts, images, async content). `document.fonts.ready.then(() => ScrollTrigger.refresh())` is a good default.
- Debug with `markers: true`, and never ship it.

**Batch reveals for lists** (instead of one trigger per item):
```js
ScrollTrigger.batch(".grid-item", { onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.04, overwrite: true }), start: "top 85%" });
```

## 9. Text splitting without breaking accessibility

Splitting text into spans can make screen readers read letter by letter. Either:
- use GSAP SplitText with its accessibility handling enabled (check the installed version's `aria` option), or
- put `aria-label="full sentence"` on the parent and `aria-hidden="true"` on the split wrapper.

Re-split on resize only when line breaks matter, revert on cleanup, and wait for `document.fonts.ready` before splitting.

## 10. Lenis smooth scroll (only with a reason)

Valid reasons: syncing WebGL with scroll, precise scrubbing feel, a narrative experience where inertia is part of the concept. Never use it just because award sites do.

```tsx
"use client";
import { ReactLenis } from "lenis/react";       // package: lenis
import "lenis/dist/lenis.css";
// root-level provider; respectReducedMotion is true by default
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <ReactLenis root options={{ lerp: 0.1, anchors: true }}>{children}</ReactLenis>;
}
```
GSAP sync (vanilla), per the Lenis README:
```js
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
// cleanup: gsap.ticker.remove(fn); lenis.destroy();
```
- Add `data-lenis-prevent` to nested scrollers: modals, menus, maps, code blocks, chat panes.
- Keep `syncTouch` off unless tested on real iOS.
- Lenis doesn't support CSS scroll-snap (use `lenis/snap`) and can't smooth over iframes.
- Verify that keyboard scrolling and anchor links still work.

## 11. Motion (framer-motion) patterns

```tsx
import { MotionConfig, AnimatePresence, motion } from "motion/react";   // older projects: "framer-motion"
<MotionConfig reducedMotion="user">          {/* disables transform/layout animations for reduce users */}
  <AnimatePresence mode="wait" initial={false}>
    {open && (
      <motion.aside key="panel" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8, transition: { duration: 0.16 } }} transition={{ duration: 0.28, ease: [0.2, 0.7, 0.1, 1] }} />
    )}
  </AnimatePresence>
</MotionConfig>
```
- `layout` and `layoutId` give shared-element and layout continuity. Keep layout animations to the elements that move.
- Avoid `whileInView` fade-ups on every section (an A trigger). Use them for hierarchy or narrative only.
- `useReducedMotion()` lets you swap a variant entirely, for example a cross-fade instead of a slide.

## 12. three.js / React Three Fiber lifecycle

**Vanilla three.js inside a React effect:**
```tsx
useEffect(() => {
  const canvas = ref.current!;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const geo = new THREE.TorusKnotGeometry(1, 0.3, 128, 16); const mat = new THREE.MeshStandardMaterial();
  scene.add(new THREE.Mesh(geo, mat));

  const ro = new ResizeObserver(([e]) => { const { width, height } = e.contentRect;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); });
  ro.observe(canvas);

  let raf = 0; let running = !document.hidden;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick = (t: number) => { if (!reduce) scene.rotation.y = t * 0.0002; renderer.render(scene, camera); if (running) raf = requestAnimationFrame(tick); };
  const onVis = () => { running = !document.hidden; cancelAnimationFrame(raf); if (running) raf = requestAnimationFrame(tick); };
  document.addEventListener("visibilitychange", onVis);
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onVis); ro.disconnect();
    scene.traverse((o: any) => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((mm: any) => {
      Object.values(mm).forEach((v: any) => v?.isTexture && v.dispose()); mm.dispose(); }); });
    renderer.dispose();                         // the renderer can't be reused after dispose
  };
}, []);
```
- three.js never frees GPU memory automatically. `scene.remove()` frees nothing. Dispose geometries, materials, textures, render targets, post-processing passes and controls. Call `ImageBitmap.close()` yourself.
- Check `renderer.info.memory` and `renderer.info.programs` across mount/unmount. They should not grow.

**React Three Fiber:**
- `<Canvas dpr={[1, 2]} frameloop="demand">` for mostly static scenes. Call `invalidate()` on change.
- Objects declared in JSX are disposed on unmount. Resources you create manually (render targets, textures in refs) must be disposed in cleanup.
- Use `useFrame` for per-frame work. Keep allocations out of the loop.
- Provide a poster image as the LCP element, then mount the Canvas lazily (dynamic import, near viewport).
- Fallback: detect WebGL availability and show the poster plus HTML content if it's missing.

## 13. rAF loops, visibility and device tiers

```js
function loop(step) {
  let id = 0, last = performance.now(), on = true;
  const frame = (t) => { step(Math.min(t - last, 50)); last = t; if (on) id = requestAnimationFrame(frame); };
  const vis = () => { on = !document.hidden; cancelAnimationFrame(id); if (on) { last = performance.now(); id = requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', vis); id = requestAnimationFrame(frame);
  return () => { on = false; cancelAnimationFrame(id); document.removeEventListener('visibilitychange', vis); };
}
```
Clamp the delta to avoid jumps after tab switches. Device tier heuristics: `navigator.hardwareConcurrency`, `navigator.deviceMemory` (Chromium), `matchMedia('(pointer: coarse)')`, Save-Data, and a measured frame time over the first second. Scale particle counts, DPR and post-processing by tier.

## 14. FLIP for layout changes

```js
function flip(el, mutate) {
  const first = el.getBoundingClientRect();
  mutate();                                       // change DOM/layout
  const last = el.getBoundingClientRect();
  const dx = first.left - last.left, dy = first.top - last.top, sx = first.width / last.width, sy = first.height / last.height;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transform: 'none' }],
             { duration: 280, easing: 'cubic-bezier(.65,0,.35,1)' });
}
```
Prefer the View Transitions API or GSAP Flip for complex multi-element cases.

## 15. Testing motion

- **Reduced motion:** run `audit_page.mjs`, which captures a `reduced-motion` frame and compares running animation counts. In Playwright tests, use `browser.newContext({ reducedMotion: 'reduce' })`.
- **State, not frames:** unit-test that a component reaches the correct final state and ARIA attributes after interaction. Don't snapshot mid-animation.
- **Cleanup:** mount and unmount twice (or navigate away and back) and check for duplicate triggers. `ScrollTrigger.getAll().length` stays stable, `renderer.info` doesn't grow, and the console shows no listener leak warnings.
- **Performance:** Chrome DevTools Performance panel with 4× CPU throttle; look for long tasks and layout or paint in animation frames; turn on paint flashing.
- **Visual review:** view `sheet.jpg` for scroll-sequence continuity across viewports.
