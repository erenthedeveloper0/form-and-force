# Anti-slop taxonomy

This is a taxonomy of underlying creative failures, not a list of banned styles. A purple gradient, a rounded card or Inter is evidence of nothing on its own. The research (ledger B1–B7, G11) shows the same surface can be a default on one site and a signature on another: Lando Norris's lime, Stripe's gradient and Half of Eight's Inter are all examples. What matters is why the choice exists and whether the rest of the work is resolved.

## Contents
1. Root causes (why slop happens)
2. The four failure classes (what it is)
3. Symptom families → root cause → detection → counter-move
4. Second-order and award-site defaults
5. What is *not* slop
6. Design consequences for the skill

---

## 1. Root causes

| ID | Root cause | Mechanism | Evidence |
|---|---|---|---|
| R1 | **Underspecification** | Building pages before product decisions exist (audience, task, key action, truth). The model fills each gap with the most familiar answer. | B2, B1 |
| R2 | **Distributional convergence** | Sampling the high-probability centre of training data: Inter, purple on white, centred hero, three cards. | B3, B6 |
| R3 | **Template inheritance** | Starter kits and component-library defaults ship unchanged: tokens, radius, shadows, section blocks. | B3, `slop_scan` default-theme rule |
| R4 | **Fragment iteration** | "Make it pop" loops with no shared system, so each screen solves itself and the screens drift apart. | B2, B1 (second-screen test) |
| R5 | **No review against reality** | No render, no real content, no states, no narrow viewport, no keyboard. The result looks finished in one screenshot. | B1, B2 |
| R6 | **Reference imitation** | Copying a winner's surface without its reason, as in "drive-around portfolio" or "exploded product render". | Corpus §11, §5, §23 |
| R7 | **Overcorrection** | Avoiding the first-order default lands on the next one: cream with serif, acid on black, Space Grotesk. Each anti-default list breeds a new default. | B4, B5, B6 |
| R8 | **Effect substitution** | Decoration (blur, glow, gradient, motion) stands in for decisions about hierarchy, content and interaction. | B1 (decoration-off test) |

## 2. The four failure classes

| Class | Definition | Typical evidence | Primary test |
|---|---|---|---|
| **Generic** | Decisions could be transplanted to an unrelated brand with little change. | Substitution test passes for a random competitor; stock structure and copy. | Substitution, Concept, Reference-distance |
| **Unresolved** | The surface looks polished, but states, transitions, flows, content or responsive behaviour are missing. | Only the ideal state; dead controls; no mobile layout; no error or empty states. | Completion, Mobile reality |
| **Incoherent** | Type, colour, spacing, component behaviour, motion and copy contradict each other without intent. | Five button styles; mixed radii; motion vocabularies that clash; tone shifts. | Coherence, second-screen |
| **Unverified** | Claims about function, performance, accessibility, compatibility or truth have not been tested. Fabricated proof is the extreme case. | "Accessible" with no keyboard pass; invented testimonials, logos or metrics; "fast" with no measurement. | Evidence log; `audit_page`; source check |

**Deceptive** outputs, meaning fabricated people, quotes, logos, numbers or screenshots presented as real, are the severe form of *Unverified*. They are always a Category C failure.

## 3. Symptom families

Detection key: **S** = static (`slop_scan.mjs`), **R** = rendered (`audit_page.mjs`), **M** = manual critique.

| Family | Symptoms | Root causes | Class | Detect | Counter-move (generative, not prohibitive) |
|---|---|---|---|---|---|
| F1 Structural sameness | Hero, logos, 3 features, testimonials, pricing, FAQ, CTA; centred hero with two buttons; bento grids | R1 R2 R3 | Generic | S (template-stack) M | Derive the section order from the user's decision path (`experience-flow.md`); let the content's shape set the layout |
| F2 Surface sameness | Violet/indigo gradients, glass, glow, blurred orbs, gradient text, grain "for luxury" | R2 R8 | Generic | S | Choose a material from the subject (Son Daven's weave, Oryzo's cork); one material, with a compositional job |
| F3 Template chrome | Tracked uppercase eyebrows on every heading; pill badges; "A · B · C" meta; `→` on every link; mono micro-labels; 01/02/03 with no sequence | R2 R3 R7 | Generic | S (eyebrow, pill, arrow) M | Every label must encode information; use numbering only for real sequences |
| F4 Typographic sameness | High-frequency families picked by habit; arbitrary giant headlines; one-word italic or colour accent as flair | R2 R7 | Generic/Incoherent | S (default-typefaces) M | Pick type for voice and function (Son Daven's hatched cut, Siena's credit lettering); size by hierarchy, not volume |
| F5 Motion sameness | Fade-up on every section; random parallax; magnetic buttons; cursor trails; preloader for show; Lenis everywhere | R2 R6 R8 | Generic/Incoherent | S (entrance-everywhere, pointer, parallax, smooth) R | One motion vocabulary per project, one signature moment; motion answers actions (`motion-intelligence.md`) |
| F6 Copy sameness | "Unlock your potential", "seamlessly transform", "all-in-one", "next-gen" | R1 R2 | Generic | S (copy-cliche) | Name the user, task, object, constraint and result; state real limits |
| F7 Proof fabrication | Fake testimonials, avatars, client logos, metrics, star ratings, product screenshots | R1 R5 | Unverified (Deceptive) | S (placeholder-media, unverified-claim) M | Use only client-supplied proof; label clearly as placeholder when absent; design the empty proof slot |
| F8 Fake functionality | `href="#"`, no-op handlers, decorative toggles, fake search, filters that filter nothing, timer-driven progress bars | R5 | Unresolved/Deceptive | S (dead-link, noop, fake-progress) R (deadLinks) | Every visible control has a state model and a real result, or a clearly bounded local demo |
| F9 Happy-path only | No loading, empty, error, partial, permission, long-content or localisation states | R5 | Unresolved | M (state inventory) | State inventories per component (`experience-flow.md` §5) |
| F10 Drift | Different button styles, radii, title sizes and spacing per screen; components rebuilt | R4 | Incoherent | M (second-screen) | Tokens and components from one system; review screens side by side (`contact_sheet.mjs`) |
| F11 False consistency | The same rounded card for products, quotes, stats and articles | R2 R3 | Generic/Incoherent | S (uniform-radius) M | Vary by semantics at the right abstraction level (`component-architecture.md`) |
| F12 Mobile neglect | Shrunk desktop; hover-only meaning; tiny targets; zoom blocked; loaders that never end on phones | R5 | Unresolved | R (overflow, small targets, zoom) | Re-sequence for mobile; give touch equivalents; set loading budgets |
| F13 Unverified quality claims | "Accessible", "fast", "responsive" with no evidence | R5 | Unverified | R + evidence log | Report only what ran; say what wasn't tested |

## 4. Second-order and award-site defaults

**Second-order ("tasteful") defaults.** These come from overcorrecting (R7). Sources: B4 (Morphic) and B5 (Anthropic `frontend-design`).
- Warm cream or stone ground, high-contrast serif display and a terracotta or clay accent.
- Near-black ground with a single acid-green or vermilion accent.
- Broadsheet layout: hairline rules, zero radius, dense newspaper columns.
- The SaaS card kit: identical rounded cards, one radius, a soft grey shadow, gradient washes.
- Template chrome (see F3).
- Space Grotesk, Instrument Serif, or Playfair plus a neutral sans as the "interesting" pick.

**Award-site defaults.** These come from imitating winners (R6). Source: G-section captures.
- Acid lime or neon on near-black (seen on 3 of 21 corpus sites).
- A floating pill navigation bar with a bright CTA chip.
- "Enter" gates, preloaders with counters, intro monogram animations.
- Smooth scroll on everything; pinned "ISN'T JUST A ___" text reveals; a rotating hero object.
- Oversized all-caps grotesk headlines; marquee strips.
- Exploded product renders with callouts; bento mosaics.

These get the same treatment as first-order defaults: **review triggers that require a project-specific reason.** Lando Norris passes because the lime is his livery. A random fintech in lime on black does not.

## 5. What is *not* slop

- A **familiar pattern used because it is the best answer** for the user's task. Examples: GOV.UK's search-first layout, a standard data table in a dashboard, a conventional checkout.
- A **high-frequency typeface** chosen for function, as with Inter on Linear and Half of Eight.
- **Uniform containers holding singular content**, like The Pudding's cover grid.
- **Restraint.** Few effects is not "lack of creativity" when the concept is clarity.
- **Brand-owned decoration**, such as Stripe's ribbon: owned for years and always paired with substance.

## 6. Design consequences for the skill

1. **Lists cannot be the mechanism** (R7). The skill must generate decisions *from the subject*: domain vernacular, real artefacts, the product's mechanism, the client's equity. It then checks those decisions against lists, never the other way round.
2. **A "first-instinct log"** records the first idea for each major axis (layout, palette, type, motion, signature moment) and asks whether it is a known default of either order. If it is, the skill keeps it only with a written reason, or replaces it.
3. **Every trigger has a decision procedure**: keep with a reason, replace, or remove. The procedure lives in `anti-slop-constitution.md` and, per component, in `anti-slop-component-atlas.md`.
4. **Static and rendered detection are paired**: `slop_scan.mjs` finds candidates; `audit_page.mjs` and the critique protocol decide.
5. **Unverified is a first-class failure**: completion reports must separate what was tested from what was assumed.
