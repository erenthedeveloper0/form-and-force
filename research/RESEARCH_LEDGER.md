# Research ledger

Working document behind the `form-and-force` skill. Every row records what was read or observed, how it was verified, and which skill file it shaped. Research was conducted on 2026-10-22.

**Verification labels**
- **Verified**: read directly from the primary source, or measured with `audit_page.mjs` on the live site.
- **Inferred**: a reasonable reading of evidence that was not stated outright, or that rests on screenshots rather than interaction.
- **Disputed**: sources disagree, or the claim depends on the author's taste.

**Source types**: official spec · technical docs · award-gallery entry · studio case study · critical essay · independent analysis · opinion · measured (our own capture).

## Contents
- A. Awwwards and award-caliber work
- B. Anti-slop and generic AI design
- C. Agent Skills and packaging
- D. Interaction and motion engineering
- E. Accessibility and usability
- F. Performance and quality
- G. Measured corpus observations (own captures)

---

## A. Awwwards and award-caliber work

| # | Question | Source | Type | Date | Finding | Status | Informs | Caveats |
|---|---|---|---|---|---|---|---|---|
| A1 | How are sites scored? | [Awwwards evaluation](https://www.awwwards.com/about-evaluation/) | official | live 2026-10 | Design 40%, Usability 30%, Creativity 20%, Content 10%. At least 18 jurors; the 3 scores furthest from the mean are dropped. HM at jury score ≥ 6.5. SOTD goes to the highest scores, with no fixed cutoff. A Developer Award needs a dev-jury score > 7. SOTM is the top 8 of the month, re-judged. | Verified | `references/quality-gates.md` (scorecard weights) | The page names the criteria but does not define them. Definitions in third-party blogs (utsubo, hontran.dev) are unofficial. |
| A2 | What does the developer jury score? | SOTD pages, e.g. [Lando Norris](https://www.awwwards.com/sites/lando-norris) and [Igloo Inc](https://www.awwwards.com/sites/igloo-inc) | award-gallery | 2024–2026 | Six dev sub-scores: Semantics/SEO, Animations/Transitions, Accessibility, WPO, Responsive Design, Markup/Meta-data. | Verified | `quality-gates.md` (engineering axes) | — |
| A3 | Where do award winners score low? | 15 SOTD pages with dev scores (table below) | award-gallery | 2023–2026 | Accessibility is the lowest or tied-lowest dev sub-score on **14 of 15** (range 6.4–7.4). The exception is Igloo Inc, where Markup 6.4 is below Accessibility 6.6. Animations/Transitions is the highest or tied-highest on **13 of 15** (8.2–9.6). The exceptions are Dropbox Brand and Son Daven, where Responsive is highest. | Verified (counted from the table) | `SKILL.md` stance: match winners on motion, beat them on accessibility | Small sample; the jury applies the rubric unevenly. |
| A4 | Which sites are recent standouts? | [Sites of the Month list](https://www.awwwards.com/websites/sites_of_the_month/) | award-gallery | to Sep 2026 | SOTY 2025 is Lando Norris (OFF+BRAND), SOTY 2024 is Igloo Inc (abeto). SOTMs from 2024–2026 span B2B logistics, hospitality, brand guidelines, dev tools, furniture and film. | Verified | Corpus selection | The listing was missing some months. |
| A5 | Are award categories broader than "immersive"? | SOTD pages for Terminal Industries, Floema, Dropbox Brand, Anime.js | award-gallery | 2025–2026 | Business, corporate and e-commerce sites win when the concept fits the domain. Terminal Industries (yard logistics) and Floema (urban furniture) are both SOTM/SOTD. | Verified | `references/project-modes.md` | — |
| A6 | Do award sites persist? | DNS check on takingshape.adobe.com and vogue-talents-sept2021.monogrid.io; Wayback Machine snapshots | measured | 2026-10-22, re-checked 2026-10-23 | Both campaign sites from the seed list no longer resolve. Their archived copies hold only the JavaScript app shell, so the experiences cannot be replayed. Studio and Awwwards pages with stills remain (see [SOURCE_STATUS.md](SOURCE_STATUS.md)). | Verified | `research/RESEARCH_GAPS.md`; `project-modes.md` (campaign lifespan and archiving) | Archives do not preserve WebGL experiences. |
| A7 | What did the Deep Beauty experience do? | Awwwards element page; [MUDEC](https://www.mudec.it/en/?p=24123); [Ogilvy work page](https://www.ogilvy.com/it/work/deep-beauty); AQuest case page (HTTP 403) | gallery + institution + agency | 2025; re-checked 2026-10-23 | Element tags "scroll" and "tunnel". Ogilvy confirms that AQuest built an immersive online version of the exhibition. Per secondary summaries only: free 3D navigation through rooms, 60+ artworks, a brush-like cursor, and sound. | Inferred from secondary evidence (no experience URL found) | Corpus §22, marked "not analysed" | The AQuest page blocks automated access (403 on 2026-10-22 and 2026-10-23); MUDEC returned 403 to an automated client on 2026-10-23. Needs a manual browser check. |

**A3 source data: Awwwards developer sub-scores** (from each SOTD page, retrieved 2026-10-22)

| Site | Semantics/SEO | Animations | Accessibility | WPO | Responsive | Markup |
|---|---|---|---|---|---|---|
| Adobe Taking Shape | 7.40 | **9.00** | *6.80* | 7.20 | 7.80 | 7.80 |
| House of Dreamers | 7.00 | **8.20** | *6.40* | 8.00 | 7.20 | 7.00 |
| Half of Eight | 8.00 | **8.20** | *7.00* | 7.60 | 7.60 | 7.60 |
| Lando Norris | 7.40 | **8.60** | *7.00* | 7.60 | 7.40 | 7.40 |
| Igloo Inc | 6.60 | **9.60** | 6.60 | 8.00 | 8.40 | *6.40* |
| Shopify Editions Winter '26 | 7.80 | **9.40** | *7.00* | 8.40 | 7.80 | 7.60 |
| Dropbox Brand | *7.00* | 8.40 | *7.00* | 7.60 | **8.60** | 8.00 |
| Anime.js | *7.40* | **9.00** | *7.40* | 7.80 | 8.00 | *7.40* |
| Terminal Industries | 7.80 | **8.80** | *7.00* | 8.20 | 7.80 | 7.40 |
| Oryzo AI | 7.60 | **8.60** | *7.00* | **8.60** | 7.80 | 7.20 |
| Why Zero | *6.60* | **8.40** | *6.60* | 8.00 | 7.00 | 6.80 |
| Floema | 7.80 | **8.20** | *7.00* | 7.60 | 7.60 | 7.60 |
| Siena Film Foundation | 7.20 | **8.60** | *6.60* | 7.20 | 8.00 | 7.20 |
| Bruno Simon | 7.00 | **8.60** | *6.60* | 8.20 | 8.20 | 6.80 |
| Son Daven | 8.20 | 8.20 | *7.40* | 8.00 | **8.40** | 8.00 |

Bold marks the highest value per row and italics the lowest (ties included).

## B. Anti-slop and generic AI design

| # | Question | Source | Type | Date | Finding | Status | Informs | Caveats |
|---|---|---|---|---|---|---|---|---|
| B1 | What makes a site look AI-generated? | [InterfaceKit: What makes a website look AI-generated](https://blog.interfacekit.io/what-makes-a-website-look-ai-generated) | independent analysis | pub 2026-02-26, upd 2026-09-07 | Five tests: substitution, decoration-off, second-screen drift, uncomfortable states, and product language. The verdict should rest on three criteria together (generic, unresolved, unreviewed), never on single style choices. | Verified | `anti-slop-constitution.md` (failure classes, substitution and removal tests) | The publisher sells UI kits. |
| B2 | Why do AI sites converge? | [InterfaceKit: Why AI sites look the same](https://blog.interfacekit.io/why-ai-generated-websites-all-look-the-same) | independent analysis | pub 2026-02-12, upd 2026-08-17 | Main cause: underspecified briefs ("clean", "premium") that the model fills with familiar defaults. Contributing: template and framework defaults, iterative "make it pop" prompting, and no review against real content. | Verified (the source calls it an editorial model, not measured) | `creative-process.md` Phase A (brief before pixels) | — |
| B3 | Which surface tells recur? | [Snoddy: Why AI websites look the same](https://www.joshuasnoddy.com/blog/why-ai-websites-look-the-same/) | opinion | 2026-07-13 | Violet-to-indigo gradients, Inter, glass cards, centered hero plus three cards, stock shadcn blocks, rocket/bolt/check icons. Cause: models sample the high-probability centre. | Verified (opinion) | `slop_scan.mjs` rules | Author sells a scoring tool. |
| B4 | Does the "tasteful" alternative converge too? | [Morphic: Why AI websites look the same](https://www.getmorphic.com/resources/ai-creative-intelligence/why-ai-generated-websites-look-the-same) | independent analysis (promotional) | 2026 | 17 generated homepages fell into about 5 creative families: cream/sand/stone, serif display with sans body, hairline rules. Scores were 4/5 cosmetic variation, 2/5 strategic, 1.5/5 typographic. | Verified (editorial judgement, not statistics) | Second-order defaults in `anti-slop-constitution.md` | Promotional source with a small n. |
| B5 | What does Anthropic's own frontend guidance list? | [anthropics/skills `frontend-design`](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | official (vendor skill) | current main | A calibration list of defaults: warm cream with serif and terracotta; near-black with one acid accent; broadsheet hairlines; the SaaS card kit; template chrome (tracked caps eyebrows, middle-dot meta, spaced em-dash labels, `→` on links, mono labels). Also: "Spend your boldness in one place," and one orchestrated motion moment beats scattered fade-ups. | Verified | `anti-slop-constitution.md` (second-order list); `motion-intelligence.md` | Compatible with this skill; nothing here contradicts it. |
| B6 | How did earlier vendor guidance shape outputs? | [Claude cookbook: prompting for frontend aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics) | official | 2025-10-21 | Names "on distribution" convergence: Inter/Roboto/Arial, purple gradients on white. It recommended layered gradients and "atmosphere", and noted the model still converges on new defaults such as Space Grotesk. | Verified | Core insight: **every anti-default list breeds the next default**, so the skill derives decisions from the subject instead of from lists | The cookbook's "layer gradients" advice is what B5 now flags. |
| B7 | Award winners have their own convergence | Own captures (G-section) | measured | 2026-10-22 | Near-black with an acid-lime accent appears on Lando Norris (#D2FF00), Terminal Industries and Why Zero (#01C654). Floating pill nav, Lenis (6/21), preloaders and gates (House of Dreamers, Siena, Why Zero, Bruno Simon) are common. | Verified (palette from computed styles and screenshots) | "Award-site defaults" in `anti-slop-constitution.md` | Lando's lime is his real racing livery, so it is not a default there. |

## C. Agent Skills and packaging

| # | Question | Source | Type | Date | Finding | Status | Informs | Caveats |
|---|---|---|---|---|---|---|---|---|
| C1 | Metadata rules | [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) | official | live 2026-10 | `name`: ≤ 64 characters, lowercase letters, digits and hyphens; no XML; must not contain "anthropic" or "claude". `description`: non-empty, ≤ 1024 characters, no XML, says what the skill does and when to use it. Three-level progressive disclosure (~100 tokens / < 5k / on demand). | Verified | `SKILL.md` frontmatter; `scripts/validate_skill.py` | — |
| C2 | Authoring rules | [Best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | official | live 2026-10 | Body under 500 lines. References one level deep from SKILL.md. A table of contents in any reference over 100 lines. Third-person description. Checklists and feedback loops. Scripts handle errors themselves. No time-sensitive facts. Forward slashes. At least 3 evals. | Verified | Whole package structure; validator checks | — |
| C3 | Open spec constraints | [agentskills.io specification](https://agentskills.io/specification) | official spec | live 2026-10 | `name` must match the parent directory, with no leading, trailing or consecutive hyphens. Optional fields: `license`, `compatibility` (≤ 500 chars), `metadata` (string → string), `allowed-tools` (experimental). Conventional dirs: `scripts/`, `references/`, `assets/`. Validator: `skills-ref validate`. | Verified | Directory name = `form-and-force`; metadata values quoted as strings | — |
| C4 | Claude Code specifics | [Claude Code skills docs](https://code.claude.com/docs/en/skills) | official | live 2026-10 | Locations: `~/.claude/skills`, `.claude/skills`, plugin `skills/`. `${CLAUDE_SKILL_DIR}` substitution. Description plus `when_to_use` truncated at 1,536 chars. Outside Claude Code, only `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools` are allowed (others hard-fail on upload). | Verified | Frontmatter kept to portable fields | — |
| C5 | Plugin distribution | [Create a plugin](https://code.claude.com/docs/en/plugins/create) | official | live 2026-10 | `.claude-plugin/plugin.json` holds only the manifest; skills go in `skills/<name>/SKILL.md`. Test with `--plugin-dir`; validate with `claude plugin validate`. | Verified | Repo layout; README install steps | — |
| C6 | Behavioural evals | [Plugin evals](https://code.claude.com/docs/en/plugin-evals) | official | live 2026-10 | `evals/<case>/prompt.md` plus `graders/*.md` (regex, tool_used, tool_order, file_exists, llm, baseline). `claude plugin eval .` runs with- and without-plugin arms. Runs are sandboxed; scaffolds need `--scaffold`. | Verified | `evals/` suite | Every run is billed. |
| C7 | Skill security posture | [Anthropic: Agent Skills](https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills) | official | 2025-10-16 (upd 2025-12-18: open standard) | Audit bundled scripts; be wary of skills that fetch external content. | Verified | Scripts contact only the URLs you pass them, never read secret files (`inspect_repo` lists their names), and `slop_scan` reports secret matches by file and line without the value. Regression tests cover both | — |

## D. Interaction and motion engineering

| # | Question | Source | Type | Date | Finding | Status | Informs | Caveats |
|---|---|---|---|---|---|---|---|---|
| D1 | Which properties are cheap to animate? | [web.dev animations guide](https://web.dev/articles/animations-guide) | technical docs | upd 2020-10-06 | Animate `transform` and `opacity`. Avoid layout- and paint-triggering properties. Do not apply `will-change` early: set it from JS just before a change and remove it afterwards. Layers cost memory. | Verified | `motion-intelligence.md` §Performance; `slop_scan` layout-anim rule | Older page, but the rendering model is unchanged. |
| D2 | GSAP in React | [GSAP React guide](https://gsap.com/resources/React/) | vendor docs | live 2026-10 | `useGSAP()` from `@gsap/react` reverts animations, ScrollTriggers, Draggables and SplitText through `gsap.context()`. It takes `scope`, `dependencies` and `revertOnUpdate`; wrap event-time animations in `contextSafe()`; it handles Strict Mode double-invocation; add `"use client"` in the App Router. | Verified | `motion-implementation.md` | — |
| D3 | GSAP licence | [GSAP pricing](https://gsap.com/pricing/) | vendor | live 2026-10 | "100% free for all users", including the plugins, supported by Webflow. | Verified (page states it is free; licence text not reviewed) | Library choice table | Read the licence terms for unusual uses. |
| D4 | ScrollTrigger pitfalls | [ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | vendor docs | live 2026-10 | Create triggers in page order (or use `refreshPriority`). Never animate the pinned element itself. Do not put ScrollTriggers on child tweens of a timeline. `content-visibility: auto` breaks measurement. `gsap.matchMedia()` replaces `ScrollTrigger.matchMedia()`. Register the plugin or tree-shaking drops it. `anticipatePin: 1` for big pins. | Verified | `motion-implementation.md`; `slop_scan` rule | — |
| D5 | Lenis | [Lenis README](https://github.com/darkroomengineering/lenis) | vendor docs | live 2026-10 | The package is `lenis`. Options include `autoRaf`, `lerp` (default 0.1), `syncTouch` off by default, and `respectReducedMotion` on by default. `data-lenis-prevent` stops smoothing on nested scrollers. GSAP sync: `lenis.on('scroll', ScrollTrigger.update)` plus `gsap.ticker`. Limits: no CSS scroll-snap, 60 fps cap in Safari, no smoothing over iframes. | Verified | `motion-implementation.md` (smooth-scroll policy) | — |
| D6 | three.js disposal | [three.js manual: How to dispose of objects](https://github.com/mrdoob/three.js/blob/dev/manual/pages/how-to-dispose-of-objects.html) | vendor docs | repo dev branch | Resources are never freed automatically. Call `dispose()` on geometry, material, texture, render target and skeleton; call `ImageBitmap.close()` yourself; `scene.remove` does not free anything; controls and renderer cannot be reused after `dispose()`; check `renderer.info`. | Verified | `motion-implementation.md` (WebGL lifecycle); `slop_scan` rule | — |
| D7 | View Transitions | [MDN startViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) + BCD 8.1.7 | official docs + data | BCD 2026-10-22 | Same-document view transitions are Baseline 2025 (Chrome 111, Firefox 144, Safari 18). Cross-document `@view-transition` ships in Chrome 126 and Safari 18.2 but not Firefox. | Verified | `motion-implementation.md` (progressive enhancement) | Re-check support at use time. |
| D8 | Scroll-driven animations | MDN + BCD 8.1.7 | official data | 2026-10-22 | `animation-timeline`/`scroll()`/`view()`/`animation-range`: Chrome 115, Safari 26, Firefox 159. `animation-trigger` is Chrome 146 only and experimental. | Verified | `motion-implementation.md` (native-first option, `@supports` fallback) | Very recent cross-browser support; older Safari and Firefox remain in the wild. |
| D9 | Other modern primitives | BCD 8.1.7 | official data | 2026-10-22 | `@starting-style` (Chrome 117, Firefox 129, Safari 17.5); popover; `<dialog>`; `inert`; `text-wrap: balance` everywhere, `pretty` not in Firefox; `interpolate-size` Chromium only; anchor positioning now in Chrome, Firefox 147 and Safari 26. | Verified | `visual-implementation.md`, `component-architecture.md` | Volatile: the skill says "check support" instead of hard-coding versions. |

## E. Accessibility and usability

| # | Question | Source | Type | Date | Finding | Status | Informs | Caveats |
|---|---|---|---|---|---|---|---|---|
| E1 | Animation from interactions | [WCAG 2.2 Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions) | official | live | Level AAA. Motion triggered by interaction can be disabled unless it is essential. Parallax is the canonical example. Scrolling the page itself is essential; added scroll animation is not. Techniques C39 and SCR40 use prefers-reduced-motion. Auto-playing motion falls under 2.2.2. | Verified | `accessibility.md`; `motion-intelligence.md` reduced-motion layer | It is AAA, but the skill treats it as a default floor for large motion. |
| E2 | What does `reduce` mean? | [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) | official docs | live | It means "removes, reduces, or replaces" motion, not "removes everything". The MDN example replaces a scale pulse with an opacity dissolve. Baseline widely available since 2020. | Verified | "Replace, don't delete" rule | — |
| E3 | New in WCAG 2.2 | [W3C: What's new in 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) | official | live | 2.4.11 Focus Not Obscured (AA), 2.5.7 Dragging Movements (AA), 2.5.8 Target Size Minimum 24×24 (AA), 3.2.6 Consistent Help (A), 3.3.7 Redundant Entry (A), 3.3.8 Accessible Authentication (AA). 4.1.1 Parsing was removed. | Verified | `accessibility.md`; `audit_page` checks (target size, focus obscured) | — |
| E4 | Interaction patterns | [ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) | official | live | 30 patterns, including dialog, combobox, tabs, menu button, disclosure, listbox, carousel, slider, grid, treegrid and toolbar. | Verified | `component-architecture.md`, atlas accessibility rows | APG examples are not production-tested for every assistive technology. |

## F. Performance and quality

| # | Question | Source | Type | Date | Finding | Status | Informs | Caveats |
|---|---|---|---|---|---|---|---|---|
| F1 | Core Web Vitals | [web.dev vitals](https://web.dev/articles/vitals) | official | upd 2024-10-31 | Good thresholds at the 75th percentile, split by mobile and desktop: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Lighthouse cannot measure INP and uses TBT as a proxy. | Verified | `performance-engineering.md` budgets | Lab ≠ field. |
| F2 | Font loading | [web.dev font best practices](https://web.dev/articles/font-best-practices) | official | upd 2022-10-04 | Inline `@font-face`; preconnect with `crossorigin`; preload sparingly; WOFF2 only; subset with unicode-range (check the licence); `font-display` optional for body, swap for brand; `size-adjust` fallback to cut CLS. | Verified | `visual-implementation.md` (typography), `performance-engineering.md` | — |

## G. Measured corpus observations (own captures)

Method: `skills/form-and-force/scripts/audit_page.mjs` in headless Chromium (Chrome for Testing build 1243, Playwright 1.56). Viewports were 390×844 (touch) and 1440×900, with wheel- or scroll-driven sequences, a 25-stop keyboard probe, and a `prefers-reduced-motion: reduce` pass. Each site was run once on 2026-10-22, unthrottled, so these are **lab, single-run** figures. Raw data is in `research/captures/<site>/report.json`. The contact sheets (`sheet.jpg`) show third-party sites and are kept locally, not redistributed.

| # | Observation | n | Status | Informs |
|---|---|---|---|---|
| G1 | Pages without exactly one `<h1>` | 12/21 | Verified | `accessibility.md`: structure is still owed on immersive sites |
| G2 | Pages without a `<main>` landmark | 8/21 | Verified | same |
| G3 | Skip link present | 4/21 (Linear, Grafana, Pudding, Shopify Editions) | Verified | same |
| G4 | Viewport blocks zoom | 3/21 (Oryzo, Why Zero, Teenage Engineering) | Verified | `slop_scan` C rule |
| G5 | Reduced-motion code detected / behaviour measurably changed | 16/21 detected; 5 changed (Linear 82→76 running animations, Stripe 18→1, Shopify 7→1, Floema 3→1, Lando Norris swaps the loader for a static portrait) | Verified | "Detection ≠ handling": verify the visual result, not the media query |
| G6 | Consent UI dominates the first keyboard and visual experience | Floema (modal over every viewport), Dropbox Brand and House of Dreamers (Tab cycles inside the consent iframe), GOV.UK and Pentagram (consent first) | Verified | Atlas §Footer & secondary: consent is part of the design system |
| G7 | Entry gates and preloaders | House of Dreamers ("Enter"), Siena ("Enter"), Why Zero ("draw a zero"), Bruno Simon ("click to start"). Lando Norris's loader filled about 10 s of mobile capture. | Verified (headless; GPU may slow WebGL) | `motion-intelligence.md` §Preloaders: justify the gate, offer a skip, never fake progress |
| G8 | Heavy WebGL often stalls in headless desktop | Igloo desktop stuck at loader; Bruno Simon mobile stuck at portal ring | Verified (limitation of the tool) | `RESEARCH_GAPS.md`; `audit_page` docs mention GPU limits |
| G9 | Lab layout instability on data-heavy UI | Grafana Play CLS 0.85–1.06 while panels hydrated | Verified (lab, scroll-influenced) | Atlas §Dashboards: reserve panel geometry |
| G10 | Stacks in the wild | Lenis 6/21, three.js 9/21, WebGL contexts 11/21, Webflow 4/21, Vue/Nuxt 4/21 | Verified (detection heuristics) | Library choice is contextual; no single stack wins |
| G11 | "AI-default" typefaces on top sites | Linear (Inter Variable), Half of Eight (Inter Display), Grafana (Inter) | Verified | A typeface is not slop by itself; defaults are judged in context |

## Open disputes recorded

- **Gradient backgrounds.** Recommended in B6 (2025) and flagged in B5 (current). Resolution: neither "use" nor "avoid"; a gradient needs a material or brand reason (Stripe's ribbon is a brand asset).
- **One-word accent in headlines.** Flagged in B5 as a tell, but used to good effect on Lando Norris (serif/sans word swap) and as a two-tone continuation on Stripe and Linear. Resolution: allowed when the accent encodes meaning (a brand voice, a sentence hierarchy), not as default flair.
- **Award-score thresholds.** Third-party claims of "8.0 for SOTD" conflict with the official page, which sets no fixed cutoff. Resolution: use the official text.
