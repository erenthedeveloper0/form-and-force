# Performance engineering

Performance is part of the experience. Ambitious motion and 3D are welcome when they're budgeted, measured and given fallbacks.

## Contents
1. Targets and budgets
2. Loading the first view (LCP)
3. Interaction responsiveness (INP)
4. Visual stability (CLS)
5. JavaScript and bundles
6. Fonts and images
7. Motion and rendering cost
8. WebGL and heavy media
9. Memory and lifecycle
10. Third-party scripts
11. Measuring (lab vs field) and reporting

---

## 1. Targets and budgets

**Core Web Vitals (good, p75, mobile and desktop separately):** LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1.

Set per-route budgets by mode (project-modes.md §14) and write them into the design language. Starting points:
- Initial-route JS (compressed): 170–250 KB for most sites; WebGL and 3D are loaded lazily after the poster.
- Requests on first view: as few as practical. GOV.UK loads with 16 requests; corpus sites reached 250.
- DOM size: keep moderate. Large DOMs slow every interaction.
- Long tasks: none over 200 ms during load on a mid-range phone profile.

## 2. Loading the first view (LCP)

LCP has four parts: TTFB (~40% of a good LCP), resource load delay (<10%), resource load duration (~40%) and render delay (<10%).
- Make the LCP element discoverable in the HTML (an SSR/SSG `<img>` or text), not injected by JS.
- **Never lazy-load the LCP image.** Use `fetchpriority="high"` on it, and on at most one or two images. 11 of 21 corpus sites lazy-loaded above-the-fold images.
- Serve it from the same origin where possible, at the right size and in a modern format.
- Don't hide the hero behind a preloader, a gate or JS-driven reveal animations. Render it visible, then enhance.
- Inline critical CSS for the first view where the framework supports it. Avoid render-blocking third-party CSS.
- Prefer server rendering or static generation for content routes.

## 3. Interaction responsiveness (INP)

An interaction has three phases: input delay, processing and presentation.
- Keep event handlers light. Update the UI for the next frame first, then defer the rest (`requestAnimationFrame` → `setTimeout`, or `scheduler.yield()` where available).
- Break long tasks. Avoid large synchronous re-renders (memoise, virtualise long lists, split state).
- Avoid layout thrashing: no reading layout right after writing styles in the same task.
- Hydration cost: island or partial hydration where the framework supports it; defer non-critical components.
- Test with realistic data volumes and a 4× CPU slowdown.

## 4. Visual stability (CLS)

- Reserve space: `width`/`height` or `aspect-ratio` on media; fixed-geometry skeletons that match the final layout; reserved panel sizes in dashboards (lab CLS near 1.0 was seen while panels hydrated).
- Fonts: fallback metric overrides (`size-adjust`, `ascent-override`), `font-display: optional` for body, or `next/font`.
- Never insert content above existing content after load (banners, consent bars) without reserving space or overlaying.
- Animate with transforms. Layout-shifting animations count toward CLS when not triggered by input.

## 5. JavaScript and bundles

- Route-level code splitting by default. Dynamic-import heavy, below-the-fold components (3D, charts, editors, maps).
- Import only what you use (`gsap` core plus the needed plugins; individual icons, not whole packs).
- Analyse the bundle when adding dependencies (`next build` output, `vite-bundle-visualizer`, `source-map-explorer`).
- Don't ship two animation libraries for the same job, or two smooth-scroll systems.
- Remove dead code and unused dependencies you introduced.

## 6. Fonts and images

- Fonts: WOFF2; subset (licence permitting); one or two families; preload only critical files; preconnect with `crossorigin` for third-party origins; `font-display` per role.
- Images: AVIF/WebP with fallback; responsive `srcset`/`sizes`; explicit dimensions; lazy below the fold; `decoding="async"`; no 4K images on phones.
- SVG: optimise (SVGO); inline small UI icons; avoid giant inline SVG illustrations duplicated across pages.
- Video: compressed and short; poster; `preload="metadata"` or `none` below the fold.

## 7. Motion and rendering cost

- Animate `transform` and `opacity`. Name transitioned properties. Avoid animating layout and paint properties (width, height, top, left, box-shadow, filter on large areas).
- `will-change` only shortly before a change, removed afterwards. Hundreds of `will-change` elements waste memory, and corpus sites had 273–1,877.
- Large `backdrop-filter`, blur and full-screen SVG filters are expensive. Profile them on mobile.
- Scroll handlers are passive and rAF-throttled. Prefer IntersectionObserver, CSS scroll-driven animations or ScrollTrigger.
- Pause off-screen and hidden-tab animations.
- `content-visibility: auto` saves rendering on long pages, but breaks ScrollTrigger measurement on those elements.

## 8. WebGL and heavy media

- Poster first, scene later: the poster is the LCP element, and the scene mounts near the viewport or after first interaction.
- Clamp DPR (≤ 2; lower on mobile); scale quality by device tier and measured frame time.
- Compress assets: glTF with Draco or Meshopt; KTX2/Basis textures; texture sizes as powers of two; texture atlases.
- `frameloop="demand"` (React Three Fiber) or render on change for mostly static scenes.
- Show real loading progress (bytes or assets), never invented percentages. Give a fallback when WebGL is unavailable or the context is lost (`webglcontextlost`).

## 9. Memory and lifecycle

- Dispose three.js geometries, materials, textures, render targets, controls and passes. Close ImageBitmaps.
- Kill or revert GSAP timelines and ScrollTriggers (`useGSAP` / `context.revert()`), destroy Lenis, disconnect observers, remove listeners, cancel rAF loops and timers.
- Verify with navigation round-trips: `renderer.info.memory` stable; ScrollTrigger count stable; heap snapshot doesn't grow per visit.

## 10. Third-party scripts

- Every third-party script (analytics, chat, consent, embeds, A/B testing) costs performance and is a security surface. Load them `async` or `defer`, after interaction where possible; use facades for heavy embeds (video, maps, chat).
- Consent tools affect first impressions and focus. Corpus sites showed consent modals covering every viewport. Choose and style them as part of the system.

## 11. Measuring and reporting

- **Lab:** Lighthouse, or Chrome DevTools Performance with throttling; `audit_page.mjs` reports single-run LCP, CLS and long tasks (unthrottled, headless). Treat these as indicators.
- **Field:** CrUX, PageSpeed Insights, or the `web-vitals` library with the project's analytics. Only field data supports claims about real users.
- Report numbers with their source and conditions, for example: "Lab, headless, unthrottled, single run: LCP 1.2 s, CLS 0.01 on /. No field data available."
