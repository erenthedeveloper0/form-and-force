# Anti-slop constitution

The quality framework for every proposal and every build. It evaluates **intent, context, execution and coherence**. Pattern detection is only the first step.

## Contents
1. The four failure classes
2. Root causes to watch for in your own process
3. Default-pattern policy (A / B / C)
4. Known-defaults registry (first-order, second-order, award-site)
5. Decision procedure for any trigger
6. The first-instinct log
7. The eight originality tests (full protocol)
8. What is not slop
9. Writing justifications that count

---

## 1. The four failure classes

| Class | Definition | Ask |
|---|---|---|
| **Generic** | Choices could move to an unrelated brand or product with little change. The most common layout wins even when the content suggests a stronger one. | "Which decisions here could only belong to this project?" |
| **Unresolved** | The surface looks polished while states, transitions, interactions, responsive behaviour or content requirements are missing. | "What happens when it's empty, loading, failing, long, narrow, touched, or reduced?" |
| **Incoherent** | Type, colour, spacing, components, copy and motion contradict each other without intent. | "Is this one system with deliberate variation, or several systems colliding?" |
| **Unverified** | Claims about function, performance, accessibility, compatibility or completeness are untested. Fabricated proof is the severe case. | "What evidence do I have, and where did it come from?" |

Novelty is not originality. Complexity is not quality. A good screenshot is not a finished product.

## 2. Root causes to watch for in your own process

- **Underspecification:** building before deciding who, what task and what truth. Fix: Step 1 and the truth inventory.
- **Distributional pull:** your first idea is probably the most common one. Fix: the first-instinct log.
- **Template inheritance:** starter or library defaults left unchanged. Fix: tokens derived from the concept.
- **Fragment iteration:** polishing one section at a time without a system. Fix: Step 3 before Step 6; second-screen review.
- **No reality check:** never rendering with real content, states, narrow viewports or the keyboard. Fix: Step 7.
- **Reference imitation:** copying a winner's surface. Fix: the reference-distance test.
- **Overcorrection:** dodging one default lands on the next (purple → cream serif → acid on black). Fix: derive from the subject, then check against *all* registries.
- **Effect substitution:** blur, glow or motion standing in for hierarchy. Fix: the removal test, plus composition before decoration.

## 3. Default-pattern policy

### Category A: review triggers (keep only with a project reason)
- A centred hero with a big headline, a supporting sentence and two buttons.
- Hero → logo strip → three feature cards → testimonials → pricing → FAQ → final CTA.
- Purple, violet, indigo or blue gradients without a brand reason.
- Glassmorphism, glowing borders, floating blurred orbs, heavy blur, neon accents as universal decoration.
- Identical rounded cards for every content type; one radius and one shadow everywhere.
- Component-library styling left at defaults across the whole project.
- Repeated icon + heading + two-line feature blocks; stock "magic" icons (sparkles, rockets, bolts).
- Pill badges that carry no information ("New", "AI-powered").
- Fake product dashboards built from decorative charts and meaningless numbers.
- Giant typography with no hierarchy or composition rationale.
- Grain, noise, scanlines or texture added "to look expensive".
- Scroll-triggered fade-ins on nearly every element.
- Random parallax, mouse-followers, magnetic buttons, cursor trails.
- Generic marketing language: "unlock your potential", "seamlessly transform", "all-in-one", "next-gen".
- Identical treatment across projects despite different user needs.
- Everything in the second-order and award-site registries (§4).

### Category B: replace or justify
A familiar pattern may stay when you can explain why it is the strongest solution here. **Three or more A-patterns together** escalate to B: write a justification for each one, or redesign the cluster. `slop_scan.mjs` raises this automatically as `combined-sameness`.

### Category C: unconditional failures
- Broken controls; `href="#"`; no-op handlers; decorative toggles; fake search, filters, auth or progress.
- Deceptive interactions (dark patterns, disguised ads, pre-checked consent, confirm-shaming).
- False or unsupported claims; fabricated testimonials, logos, metrics, people or screenshots presented as real.
- Unusable mobile layouts; horizontal overflow; blocked zoom.
- Essential actions that are inaccessible (keyboard, screen reader, touch); hidden or obscured focus.
- Incomplete critical flows (checkout, sign-up, settings save, destructive confirm).
- Console errors left unresolved in your own code.
- Untested features described as complete.
- Large motion without any reduced-motion path; auto-moving content over 5 s without pause.
- Lorem ipsum or placeholder media in a deliverable that is not explicitly labelled as a prototype.

## 4. Known-defaults registry

These are review triggers. Each one is legitimate *for some brief*. None is legitimate *by default*.

**First-order (statistical centre).** Inter, Roboto, Open Sans, Lato, Arial or Poppins chosen by habit. Purple or blue on white. A centred hero. The three-card grid. shadcn or other library defaults unchanged. `transition-all` everywhere. Rounded 2xl cards with soft shadow. Gradient text. Glass panels. Rocket, sparkle and bolt icons. "Trusted by 10,000+ teams".

**Second-order (tasteful overcorrection).**
- Warm cream or stone ground, high-contrast serif display, terracotta or clay accent.
- Near-black ground with one acid-green, lime or vermilion accent.
- Broadsheet: hairline rules, zero radius, dense newspaper columns.
- The SaaS card kit: identical cards, one radius, soft grey shadow, gradient washes.
- Template chrome: a tracked ALL-CAPS eyebrow above every heading, `A · B · C` meta strings, `WORD — fragment` labels, `→` appended to every link, mono micro-labels, tinted near-black `#0B0B0B` standing in for black, 01/02/03 numbering where there is no sequence.
- "Interesting" font picks by reflex: Space Grotesk, Instrument Serif, Playfair Display plus a neutral sans, Geist everywhere.
- A one-word italic or colour accent in every headline.

**Award-site defaults (imitation of winners).**
- Acid lime or neon on near-black; a floating pill nav with a bright CTA chip.
- "Enter" gates, monogram preloaders, percentage counters.
- Smooth scroll on every site; pinned "ISN'T JUST A ___" word-by-word reveals.
- A rotating or exploding hero object with callouts; particles assembling into a logo.
- Oversized all-caps grotesk headlines; marquee strips; bento mosaics.
- Custom cursors and magnetic buttons on every link.

## 5. Decision procedure for any trigger

```
1. Name the pattern and its category (A / B / C).
2. If C → fix it. Stop.
3. Ask: what job does it do for THIS user and THIS content?
     - none → remove it (removal test)
     - a job → is there a more specific way to do that job,
               derived from the subject (mechanism, artefact, vernacular, equity)?
         - yes, and it isn't harder to use → replace
         - no, or the specific version costs usability → keep, and write the reason
4. If 3+ triggers survive in one view → B: re-check them as a set.
   A set of individually defensible defaults can still read generic.
5. Record the decision in the design language doc (keep / replace / remove + reason).
```

Never replace a convention with something more complex unless it gives a clear benefit. A conventional checkout, data table, settings form or search results page is usually the right answer. Make it excellent instead of different.

## 6. The first-instinct log

Before generating territories (Step 2), write down your *first* idea for each axis:

| Axis | First instinct | In a registry? | Keep / replace | Reason |
|---|---|---|---|---|
| Layout / structure | | | | |
| Palette | | | | |
| Typefaces | | | | |
| Material / texture | | | | |
| Motion vocabulary | | | | |
| Signature moment | | | | |
| Copy voice | | | | |

The point is not to forbid first instincts. It is to make them conscious. A first instinct that survives with a project reason is a decision. One that survives because nobody looked is a default.

## 7. The eight originality tests (full protocol)

Run them on the chosen concept (as described) and again on the build (as rendered, using `sheet.jpg`).

| # | Test | Procedure | Fail signal | Remedy |
|---|---|---|---|---|
| 1 | **Substitution** | Mentally replace name, logo and primary colour with an unrelated company's. | It still "works" almost unchanged. | Make structure and semantics specific: section order from the decision path, components shaped by the content's real data, imagery from real artefacts. |
| 2 | **Concept** | Write the idea in one sentence. Point to three elements that express it. | Adjectives only ("bold, modern, premium"), or you can't point to elements. | Translate the idea into a mechanism: a grid rule, a transition, a component behaviour, a material. |
| 3 | **Interaction** | For the main interaction, state what it communicates or makes easier. | "It looks cool in a recording." | Tie it to content (reveal, compare, orient, manipulate) or demote it. |
| 4 | **Removal** | Remove one decorative element at a time. | Nothing gets worse. | Remove it. |
| 5 | **Coherence** | Put screens side by side (contact sheet). List type sizes, radii, colours and motion durations in use. | Unexplained variants; or one card style forced on all content. | Consolidate tokens; vary by semantics at the right abstraction level. |
| 6 | **Completion** | Walk every route and control; trigger empty, loading, error, success, long-content, permission and offline states. | Dead ends, missing states, ideal-only data. | Build the states (see experience-flow.md §5). |
| 7 | **Mobile reality** | 360–390 px, touch, no hover, reduced motion, 4× CPU slowdown. | Shrunk desktop, hover-only meaning, jank, endless loader. | Re-sequence; add touch equivalents; set budgets; give a motion fallback. |
| 8 | **Reference distance** | Describe the project without naming any reference. | "It's like the ___ site." | Return to the subject; keep the reference's *principle*, discard its surface. |

## 8. What is not slop

- A familiar pattern chosen because users need it (search-first public services, standard tables, conventional checkout).
- A high-frequency typeface chosen for function (Linear and Half of Eight use Inter, and nobody notices).
- Uniform containers holding singular content (The Pudding's story covers).
- Restraint as the concept.
- Brand-owned decoration that has been used consistently for years and is paired with substance (Stripe's gradient ribbon).

## 9. Writing justifications that count

A justification names the **user, the content and the mechanism**. It does not name an adjective.

- Weak: "Glass cards feel modern and premium."
- Strong: "The configurator floats option panels over the live 3D product. Translucency keeps the product visible while choosing, and blur radius drops to 0 under `prefers-reduced-transparency`."
- Weak: "Purple gradient for energy."
- Strong: "The client's existing identity uses a violet-to-magenta stage-light gradient across venues and tickets. We use it only on the ticket component, where it signals 'your seat'."
