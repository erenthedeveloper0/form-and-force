# Motion craft: values, recipes and lifecycles

How to build the motion decided in [motion-direction.md](motion-direction.md). Every recipe uses the project's tokens from `motion_tokens.mjs`, ships with its reduced-motion version, and cleans up after itself. Check API details against the installed library versions.

## Contents
1. Values by job
2. Choosing the tool
3. Foundations: opt-in motion and the reduced path
4. Feedback: press, hover, focus, toggle
5. Arriving and leaving: popovers, dialogs, disclosure
6. Text reveals
7. Image reveals
8. Groups and stagger
9. Layout continuity: View Transitions and FLIP
10. Scroll: native, sticky and ScrollTrigger
11. Gestures and springs
12. Library lifecycles: GSAP, Motion, Lenis
13. Performance and cleanup
14. Testing motion

---

## 1. Values by job

Durations come from the project's tokens. These ranges are the limits the tokens work within; a value outside them needs a reason.

| Job | Range | Token |
|---|---|---|
| Press, toggle, immediate feedback | 80–160 ms | `--dur-press` |
| Hover, tooltip, small state change | 120–240 ms | `--dur-quick` |
| Menu, popover, panel, disclosure | 150–350 ms | `--dur-move` |
| Dialog, drawer, large surface | 200–500 ms | `--dur-move` to `--dur-scene` |
| Scene or route change | 300–1100 ms | `--dur-scene` |
| Narrative and explanation | As long as the content needs, and skippable | — |
| Exit of any of the above | About 70% of its entrance | `--dur-move-out` |

Interface motion a person triggers stays under about 300 ms unless the element is large or the action is rare.

Easing by situation:

| Situation | Curve | Token |
|---|---|---|
| Something arrives, or answers an action | Ease-out: fast start, soft landing | `--ease-enter` |
| Something already on screen travels or changes size | Ease-in-out | `--ease-move` |
| Something leaves but stays in the world | Ease-out, shorter | `--ease-exit` |
| Something leaves the frame for good | Accelerating | `--ease-leave` |
| Colour or opacity alone | The enter curve, or linear when very short | — |
| Constant motion: a marquee, a progress bar, a scrub | Linear | — |
| Anything thrown, dragged, or that should feel alive | A spring | `--spring` with `--spring-dur` |

- **No slow starts on things a person triggers.** An accelerating curve delays the first frames, which are the ones being watched.
- **The browser's keyword curves are weak.** `ease` and `ease-in-out` are placeholders. Use the tokens.
- **Overshoot belongs to springs,** and to free-flow characters. A bound character never passes its mark.

## 2. Choosing the tool

Take the first row that does the job.

| Need | Tool |
|---|---|
| A state change driven by a class, attribute or pseudo-class | CSS transition |
| An arrival on mount, a dialog or popover opening | CSS transition with `@starting-style` |
| A fixed sequence that must stay smooth while the page is busy | CSS animation |
| The same, controlled from script (play, cancel, await) | Web Animations API (`element.animate`) |
| Progress tied to scroll, simple | CSS scroll-driven animation inside `@supports` |
| Height to and from `auto` | `grid-template-rows: 0fr → 1fr`, or `interpolate-size` as an enhancement |
| A change of view or layout with continuity | View Transitions API, with a fallback that simply changes |
| Pinning, scrubbed multi-step timelines, precise sequencing | GSAP with ScrollTrigger |
| Springs, layout animation and exit animation in React; gestures | Motion, if the project already has it |
| A field, a material, a scene | Canvas or WebGL ([creative-coding.md](creative-coding.md)) |

- **Transitions retarget; keyframes restart.** Anything a person can trigger twice quickly (toggles, hovers, toasts, tabs) uses transitions or springs, so an interruption continues from the current value.
- **One owner per property per element.** If GSAP animates an element's transform, CSS does not transition it. Write the ownership down.
- **Do not add a library for a fade.** Inspect what the project already has.

## 3. Foundations: opt-in motion and the reduced path

Write the settled state as the base style. Add motion only for people who have not asked for less. The reduced version is then the default, not an afterthought.

```css
.panel { opacity: 1; translate: 0 0; }                         /* the settled state is the base */

@media (prefers-reduced-motion: no-preference) {
  .panel { transition: opacity var(--dur-move) var(--ease-enter), translate var(--dur-move) var(--ease-enter); }
  .panel[hidden-state] { opacity: 0; translate: 0 var(--travel); }
}
@media (prefers-reduced-motion: reduce) {
  .panel { transition: opacity var(--dur-quick) linear; }      /* replace travel with a short fade */
  .panel[hidden-state] { opacity: 0; }
}
```

The reduced-motion block printed by `motion_tokens.mjs` zeroes travel, turn, blur and stagger, so recipes written with the tokens reduce themselves. Still look at the result.

A blanket `* { animation-duration: 0.01ms !important }` is a last resort. It breaks script that waits for `animationend` and designs nothing.

A visitor-facing toggle that overrides the system setting:

```js
const root = document.documentElement;
const stored = localStorage.getItem('motion');                  // 'reduce' | 'full' | null
root.dataset.motion = stored ?? (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'full');
// CSS keys off :root[data-motion="reduce"]; scripts read root.dataset.motion.
```

## 4. Feedback: press, hover, focus, toggle

```css
.button { transition: scale var(--dur-press) var(--ease-enter), background-color var(--dur-quick) var(--ease-enter); }
.button:active { scale: var(--press-scale); }                   /* responds on the press, not the release */

@media (hover: hover) and (pointer: fine) {                     /* touch fires false hovers on tap */
  .button:hover { background-color: var(--button-hover); }
}
.button:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }   /* appears at once: no transition */
```

- **Press** is the one animation nearly every control should have. Keep it small and immediate.
- **Hover** changes one property. It never moves a neighbour, and it is never the only way to learn or do something.
- **Focus** rings appear instantly. Animating them makes keyboard use feel slow.
- **Toggles and switches** use transitions, so a second press mid-flight reverses from where it is.
- **Tooltips** wait before the first one opens; once one is open, neighbours open with no delay and no animation.
- **Async actions:** respond within 100 ms, show the pending state, then the real outcome. A success mark plays when the request succeeded, never on a timer.
- **Hold to confirm:** slow and linear while held, fast on release.

```css
.confirm .fill { clip-path: inset(0 100% 0 0); transition: clip-path var(--dur-quick) var(--ease-enter); }   /* release: fast */
.confirm:active .fill { clip-path: inset(0 0 0 0); transition: clip-path 1.6s linear; }                      /* hold: deliberate */
```

## 5. Arriving and leaving: popovers, dialogs, disclosure

Things come from somewhere. A surface anchored to a trigger grows from that trigger. A dialog belongs to the viewport and stays centred.

```css
.menu {
  transform-origin: var(--origin, top left);                    /* set to the trigger's corner; many headless libraries expose it */
  opacity: 1; scale: 1;
  transition: opacity var(--dur-move) var(--ease-enter), scale var(--dur-move) var(--ease-enter),
              overlay var(--dur-move) allow-discrete, display var(--dur-move) allow-discrete;
}
@starting-style { .menu:popover-open { opacity: 0; scale: var(--scale-from); } }   /* never from zero */
.menu:not(:popover-open) { opacity: 0; scale: var(--scale-from); transition-duration: var(--dur-move-out); }

dialog { opacity: 0; translate: 0 var(--travel); transition: opacity var(--dur-move) var(--ease-enter), translate var(--dur-move) var(--ease-enter), overlay var(--dur-move) allow-discrete, display var(--dur-move) allow-discrete; }
dialog[open] { opacity: 1; translate: 0 0; }
@starting-style { dialog[open] { opacity: 0; translate: 0 var(--travel); } }
dialog::backdrop { background: rgb(0 0 0 / 0.4); }
```

- Use native `<dialog>` with `showModal()` (focus containment, inert background, Escape) and `popover` for menus and tips.
- `@starting-style` and discrete transitions are enhancements. Without them the surface simply appears, which is acceptable.
- An exit goes back the way it came, faster. In a tool, a keyboard-opened menu opens with no animation at all.

Disclosure without measuring height:

```css
.reveal { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-move) var(--ease-move); }
.reveal[data-open="true"] { grid-template-rows: 1fr; }
.reveal > .inner { overflow: hidden; }
```

Set `inert` on the closed content so it cannot be focused. `interpolate-size: allow-keywords` enables `height: auto` transitions in some browsers; add it only as an enhancement.

## 6. Text reveals

**By line, masked.** The dependable display reveal: each line sits in a clipped box and rises into it.

```html
<h1 class="lines" aria-label="Every tide, to the minute">
  <span class="line" aria-hidden="true"><span>Every tide,</span></span>
  <span class="line" aria-hidden="true"><span>to the minute</span></span>
</h1>
```
```css
.line { display: block; overflow: clip; }
.line > span { display: block; }
@media (prefers-reduced-motion: no-preference) {
  .lines:not(.is-in) .line > span { translate: 0 105%; }
  .line > span { transition: translate var(--dur-scene) var(--ease-enter); }
  .line:nth-child(2) > span { transition-delay: calc(var(--stagger-step) * 1); }
  .line:nth-child(3) > span { transition-delay: calc(var(--stagger-step) * 1.85); }   /* shrinking gaps, not a metronome */
}
```

- Break lines by hand where the words are known. Where they are not, split by measured lines after `document.fonts.ready`, re-split on resize, and restore the original text on cleanup.
- Split text is read letter by letter by some screen readers. Put the full sentence in `aria-label` on the parent and `aria-hidden="true"` on the pieces, or use a splitting library's accessibility option.
- Split by word or letter only when words or letters are the idea. Per-letter effects on long text are slow and tiring.
- The heading must be visible if the script never runs: add the hidden state from script, or scope it under a class that script sets on `<html>`.

**Reading progress.** Words change tone as the visitor reads, tied to scroll. The text is fully legible throughout.

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .read span { color: var(--ink-quiet); animation: lit linear both; animation-timeline: view(); animation-range: entry 60% cover 45%; }
  }
}
@keyframes lit { to { color: var(--ink); } }
```

**Numbers that change.** Use `font-variant-numeric: tabular-nums` so nothing shifts. Roll or count only to a real value, once, and never for a number the visitor is trying to read while it moves.

## 7. Image reveals

**Wipe with a counter-move.** The frame opens while the image inside settles. The opposing movement is what makes it feel physical.

```css
.shot { overflow: clip; }
@media (prefers-reduced-motion: no-preference) {
  .shot { clip-path: inset(0 0 100% 0); transition: clip-path var(--dur-scene) var(--ease-enter); }
  .shot img { scale: 1.12; transition: scale calc(var(--dur-scene) * 1.4) var(--ease-enter); }
  .shot.is-in { clip-path: inset(0); }
  .shot.is-in img { scale: 1; }
}
```

- Choose the wipe's direction from the composition: toward the text it belongs to, or along the reading direction.
- `clip-path` and `scale` do not affect layout. Never animate the image's width or height.
- **Zoom on hover** happens inside a clipped frame (`scale: 1.03` on the image); the frame itself never grows.
- **Before and after:** two images stacked, the top one clipped with `clip-path: inset(0 calc(100% - var(--split)) 0 0)`, the split driven by a real `<input type="range">` so it works by keyboard and touch.
- **Shader transitions** between images are in [creative-coding.md](creative-coding.md). They need the same fallback: a plain image.
- Reveal an image once. Do not re-hide it when it leaves the viewport.

Trigger arrivals with one `IntersectionObserver` that adds a class and then stops observing, or with a view timeline. Do not attach scroll listeners.

## 8. Groups and stagger

```css
.group > * { transition: opacity var(--dur-move) var(--ease-enter), translate var(--dur-move) var(--ease-enter);
  transition-delay: calc(var(--stagger-step) * (1 - pow(var(--stagger-decay), var(--i))) / (1 - var(--stagger-decay))); }
.group:not(.is-in) > * { opacity: 0; translate: 0 var(--travel); }
```
Set `--i` per item (`style="--i: 0"`), from the lead outward. Where `pow()` is unsupported, write the delays printed by `motion_tokens.mjs`.

- Cast first ([motion-direction.md](motion-direction.md) §6). Only leads and supports travel. Decoration fades in place.
- The whole group settles within roughly 300 to 400 ms in an interface; an Expressive arrival seen once may take longer.
- Stagger the first handful of a long list and bring the rest in with the last.
- Never stagger a container and its children, and never stagger anything opened often.
- Every item is clickable the moment it is visible.

## 9. Layout continuity: View Transitions and FLIP

```js
export function withTransition(update) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) { update(); return; }
  return document.startViewTransition(update);
}
```
```css
.card img { view-transition-name: var(--vt); }                  /* a unique name per element, set inline */
::view-transition-group(*) { animation-duration: var(--dur-scene); animation-timing-function: var(--ease-move); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none; } }
```

- Names must be unique among elements rendered at the same time, or the transition is skipped.
- In React, the DOM must change synchronously inside the callback: wrap the state update in `flushSync`, or use the router's own view-transition support if it has one.
- Between documents: `@view-transition { navigation: auto; }` on both pages. Browsers without support change instantly, which is fine.
- Name only the elements that carry continuity. Each named element is a snapshot.

FLIP, for older paths or single elements:

```js
function flip(el, mutate) {
  const first = el.getBoundingClientRect();
  mutate();
  const last = el.getBoundingClientRect();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dx = first.left - last.left, dy = first.top - last.top, sx = first.width / last.width, sy = first.height / last.height;
  el.animate([{ transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: 'top left', transform: 'none' }],
    { duration: 300, easing: getComputedStyle(el).getPropertyValue('--ease-move') || 'ease-in-out' });
}
```

When an element leaves a list, take it out of the flow at once (`position: absolute` at its current place) so its neighbours close the gap while it fades. Otherwise the gap closes only after the exit and the whole thing feels slow.

## 10. Scroll: native, sticky and ScrollTrigger

Native, off the main thread, for simple links between scroll and a property:

```css
@supports (animation-timeline: scroll()) {
  .progress { transform-origin: 0 50%; animation: grow linear both; animation-timeline: scroll(root); }
}
@keyframes grow { from { scale: 0 1; } to { scale: 1 1; } }
```
Without support, elements show their settled state.

A held scene (the Stage structure) needs no library for the hold itself:

```css
.stage-wrap { height: 300svh; }                                  /* the scroll length of the scene */
.stage { position: sticky; top: 0; height: 100svh; overflow: clip; }
@media (prefers-reduced-motion: reduce) { .stage-wrap { height: auto; } .stage { position: static; height: auto; } }
```

GSAP with ScrollTrigger, when a scene needs a scrubbed multi-step timeline:

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP, ScrollTrigger);                     // once per module; unregistered plugins are tree-shaken away

export function Mechanism() {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 900px) and (prefers-reduced-motion: no-preference)", narrow: "(max-width: 899px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { wide } = ctx.conditions!;
      gsap.timeline({ scrollTrigger: { trigger: ".mechanism", start: "top top", end: wide ? "+=200%" : "+=110%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } })
        .to(".mechanism .layer-a", { xPercent: -20 })
        .to(".mechanism .layer-b", { opacity: 1 }, "<")
        .to(".mechanism .caption-2", { opacity: 1 });
    });
    // no condition matches under reduced motion: the base CSS shows every layer and caption in reading order
  }, { scope });
  return <div ref={scope}>{/* .mechanism with its layers and captions, all present in the markup */}</div>;
}
```

- Animate the pinned element's children, never the pinned element.
- One ScrollTrigger on the timeline, none on its child tweens. Create triggers in page order.
- `pinSpacing` is off inside flex parents. `content-visibility: auto` breaks measurement.
- Refresh after late layout changes: `document.fonts.ready.then(() => ScrollTrigger.refresh())`.
- `ScrollTrigger.batch` for many arrivals, in place of one trigger per item.
- `markers: true` for debugging only.

## 11. Gestures and springs

A dragged thing stays under the finger, keeps its velocity when released, and yields softly at a limit.

```js
el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId);                             // keeps tracking outside the element
  const grab = e.clientY - el.getBoundingClientRect().top;       // respect where it was grabbed
  const history = [];                                            // recent positions, for release velocity
  const move = (ev) => {
    history.push([ev.clientY, performance.now()]); if (history.length > 5) history.shift();
    el.style.translate = `0 ${rubber(ev.clientY - grab - restTop, limit)}px`;   // set the element's own style, not a parent variable
  };
  const up = () => {
    el.removeEventListener('pointermove', move);
    const [[y0, t0], [y1, t1]] = [history[0], history[history.length - 1]];
    const velocity = t1 > t0 ? (y1 - y0) / (t1 - t0) : 0;        // px per ms
    settle(velocity);                                            // choose the target from where it is heading
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up, { once: true });
  el.addEventListener('pointercancel', up, { once: true });
});
const rubber = (over, size, k = 0.55) => (over <= 0 ? over : (over * size * k) / (size + k * over));   // resistance grows past the limit
```

- **Dismiss by velocity as well as distance.** A quick flick is enough (around 0.1 px per ms and above).
- **Project the landing point** from the release velocity and snap to the target nearest that point, not nearest the release position.
- **Hand the velocity to the spring** so there is no seam between dragging and settling.
- **Springs retarget from the current value and speed.** That is why they suit anything a person can catch mid-flight.
- Ignore extra touches once a drag has begun. Require a small movement (about 10 px) before committing to a direction.
- Every drag has an alternative without dragging (WCAG 2.5.7): buttons, keys, a menu.

A spring in CSS, for one-way motions that need no velocity handoff: `transition: translate var(--spring-dur) var(--spring)`. For interruptible, velocity-aware springs use the Web Animations API with your own integrator, or a library:

```js
// Motion: { type: "spring", duration: 0.45, bounce: 0.2 }   (settings printed by motion_tokens.mjs)
```

## 12. Library lifecycles: GSAP, Motion, Lenis

**GSAP in React**
- Create animations inside `useGSAP(() => { ... }, { scope })`. It reverts tweens, timelines and ScrollTriggers on unmount, and handles Strict Mode's double invocation.
- Animations created later (event handlers, timeouts) go through `contextSafe`, or they leak.
- `overwrite: "auto"` stops conflicting tweens on interruption.
- Never let CSS transitions and GSAP both own a property.

**Motion (formerly Framer Motion)**
```tsx
import { MotionConfig, AnimatePresence, motion } from "motion/react";   // older projects: "framer-motion"
<MotionConfig reducedMotion="user">
  <AnimatePresence mode="popLayout" initial={false}>
    {open && <motion.aside key="panel" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, transition: { duration: 0.16 } }} transition={{ type: "spring", duration: 0.4, bounce: 0 }} />}
  </AnimatePresence>
</MotionConfig>
```
- `mode="popLayout"` removes the leaving element from the flow so siblings move at once; `mode="wait"` is for two dense states that must not be seen together.
- `layout` and `layoutId` animate on the main thread: keep them to the elements that truly move, and avoid them during heavy page work.
- Pass direction through `custom` on both `AnimatePresence` and the child so an exit uses the current direction.
- `whileInView` on every section is the fade-up default in another syntax. Use it for arrivals that were cast.

**Lenis** (only with a stated reason: keeping a canvas in step, a narrative where inertia is the concept)
```js
const lenis = new Lenis();                                      // respects reduced motion by default
lenis.on('scroll', ScrollTrigger.update);
const tick = (t) => lenis.raf(t * 1000);
gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
// cleanup: gsap.ticker.remove(tick); lenis.destroy();
```
- `data-lenis-prevent` on nested scrollers: dialogs, menus, maps, code blocks.
- It does not support CSS scroll-snap and cannot smooth over iframes. Never combine two scroll libraries.
- Confirm keyboard scrolling and anchor links still work.

three.js and React Three Fiber lifecycles are in [creative-coding.md](creative-coding.md).

## 13. Performance and cleanup

- Animate `transform` (or `translate`, `scale`, `rotate`), `opacity`, and sparingly `clip-path` and `filter`. Never `top`, `left`, `width`, `height`, `margin` or `padding`.
- Name the properties in every transition. `transition: all` animates things you did not intend.
- Do not drive a child's transform from a custom property set on a parent every frame: it recalculates style for every descendant. Set the property on the element.
- `will-change` just before a heavy animation and removed after. Never on hundreds of elements.
- CSS animations and transitions stay smooth while the main thread is busy; `requestAnimationFrame` animation does not. Prefer CSS for anything that plays during load.
- Keep blur radii small and animated blurs short. They are expensive, especially in Safari.
- No layout reads after writes in a frame. Observers instead of scroll handlers. Scroll and touch listeners passive.
- Clean up on unmount: timelines, triggers, observers, listeners, animation frames, timers, WebGL resources. Mount twice and check nothing doubles.
- Pause loops when off screen or when the tab is hidden.

## 14. Testing motion

- **See it:** `motion_strip.mjs` for the entrance, each designed interaction, an interruption (`--interrupt`), the way back (`--exit`), and the reduced version ([motion-direction.md](motion-direction.md) §12). Answer every question it raises, by changing the motion or by writing the reason it stays. When the note says the motion is shorter than the strip, re-run with the `--span` it suggests: easing cannot be read from two frames.
- **Final state, not frames:** unit-test that a component reaches the right state and ARIA attributes after an interaction.
- **Interruption:** trigger twice quickly, reverse midway, navigate away during a sequence.
- **Reduced motion:** `audit_page.mjs` captures that frame; in Playwright tests use `browser.newContext({ reducedMotion: 'reduce' })`.
- **Under load:** four-times CPU throttle in the browser's performance panel; look for long tasks and for layout or paint inside animation frames.
- **By hand:** on a real phone, with a thumb, more than once. Slow it down in the browser's animation inspector and step through frame by frame. Look again the next day.

**Reading the strip's questions.** A question means a habit is present. It does not mean the motion is wrong.

| Question | Usually means | When it is right as it is |
|---|---|---|
| `ease-in` | A slow start on something a person triggered | Something leaving the frame for good |
| `linear` | Movement at constant speed | A mechanism, a scrub, a marquee, a progress bar |
| `default-curves` | No character was chosen: the browser's keyword curves | Colour or opacity changes too short to read |
| `layout-props`, `layout-shift` | Something is resized or pushed while it moves | A disclosure that is meant to make room, at a speed the eye can follow |
| `from-nothing` | Growth from scale 0 | Never. Start near 0.9 to 0.97 with opacity |
| `transition-all` | Properties nobody named are animating | Never. Name them |
| `slow-response` | Over 300 ms on something a person triggered | A large surface, or an action taken rarely |
| `late-response` | A declared delay before anything answers | A support hooked to the lead's landing, when the lead itself answers at once |
| `keyframes-on-trigger` | A keyframe animation on something that can be triggered twice | A one-shot mark, such as a success tick, that cannot be re-triggered mid-flight |
| `slow-exit` | The way back is longer than the way in | Almost never |
| `long-entrance`, `long-sequence` | The interface performs while the person waits | A once-only arrival in the Expressive or Radical register |
| `uniform-stagger` | Equal delays: a metronome | A mechanical rhythm the device calls for |
| `too-many-movers` | Nothing was cast as still | A field whose marks are the content |
| `nothing-moved` | No CSS or Web Animations ran | The gate said no; the motion is driven from script; or it is a touch viewport and the motion was hover-only |
| `reduced-still-moves` | Large travel survives reduced motion | Never |
