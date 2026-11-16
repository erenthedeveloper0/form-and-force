# Reference library

The skill's knowledge lives in eighteen references and five templates in [`skills/form-and-force/`](../../skills/form-and-force/). `SKILL.md` is the operating manual; it routes each stage and each kind of task to the references it needs, so the agent never reads the library whole. This page maps the library for people.

## How it is organised

The folder is flat on purpose. Every reference is linked directly from `SKILL.md`, references point at each other by section number (`jury.md §8`), and the agent's search commands assume one directory. The grouping below is how to think about it, not a folder structure.

### Method

How the work is decided, gated and judged. These shape every engagement.

| Reference | What it is for | Loaded |
|---|---|---|
| [project-modes.md](../../skills/form-and-force/references/project-modes.md) | Fourteen modes, each with its usual register, key frame, budgets and the page a competent agent would make by default | At the start: one section, for the project's mode |
| [repository-workflow.md](../../skills/form-and-force/references/repository-workflow.md) | Inspecting a project, protecting existing work, the dependency policy, running checks, greenfield setup | At the start of any build |
| [direction.md](../../skills/form-and-force/references/direction.md) | The creative method: facts, register, twin, hand, devices, sketches, the board, committing, being sent back | Required for M, L and XL work |
| [floor.md](../../skills/form-and-force/references/floor.md) | The ten hard gates, failures fixed without exception, the registry of defaults including the skill's own, running the scan | Before hand-over, and for audits |
| [jury.md](../../skills/form-and-force/references/jury.md) | Judging the rendered work: evidence, cold read, twin test, ten dimensions, reading the design facts, findings, verdicts | After the floor, and for critiques |

### Design craft

How the language is derived from the chosen frame. Only what the direction uses is loaded.

| Reference | What it is for |
|---|---|
| [composition.md](../../skills/form-and-force/references/composition.md) | Seven forces, three reads, building each structure, the grid as a decision, the flatplan, image and text, density, the narrow screen as a second composition, CSS layout mechanics |
| [typography.md](../../skills/form-and-force/references/typography.md) | Voice before typeface, a map of voices, pairing, the type system, display and text craft, variable fonts, type as image and interaction, responsive type, loading and licences |
| [colour-and-imagery.md](../../skills/form-and-force/references/colour-and-imagery.md) | Colour strategies with proportions, where colour comes from, building the system, material and light, choosing a medium, working with no assets, art-directing photographs, delivery |
| [creative-coding.md](../../skills/form-and-force/references/creative-coding.md) | SVG, Canvas 2D, fragment shaders, three.js and React Three Fiber, product scenes, scroll-linked scenes, pointer systems, budgets, fallbacks and testing. Only when a coded medium is dealt or chosen |
| [experience-flow.md](../../skills/form-and-force/references/experience-flow.md) | Journeys, the experience map, continuity between sections, functional interaction, state inventories, content truth and placeholders |

### Motion

| Reference | What it is for |
|---|---|
| [motion-direction.md](../../skills/form-and-force/references/motion-direction.md) | Five kinds of motion, the gate, layers by register, character and generated tokens, the life of one interaction, choreography, scroll, the signature moment, transitions, reduced motion, seeing it slowly |
| [motion-craft.md](../../skills/form-and-force/references/motion-craft.md) | Values by job, choosing the tool, the reduced path, recipes for feedback, overlays, text and image reveals, groups, View Transitions and FLIP, scroll, gestures and springs, GSAP, Motion and Lenis lifecycles, cleanup, testing |

### Components

| Reference | What it is for |
|---|---|
| [component-architecture.md](../../skills/form-and-force/references/component-architecture.md) | Principles, custom component specifications, tokens in three tiers, variation, building on libraries, state machines, TypeScript contracts, file organisation, documentation and tests |
| [component-atlas.md](../../skills/form-and-force/references/component-atlas.md) | 180 components: job, common default, ways out, states, build notes, tests and severity. Searched for one component at a time ([atlas reference](component-atlas.md)) |

### Engineering

The detail behind the floor's gates.

| Reference | What it is for |
|---|---|
| [accessibility.md](../../skills/form-and-force/references/accessibility.md) | WCAG 2.2 AA plus 2.3.3: semantics, names, keyboard and focus, overlays, forms, contrast, motion, touch, media, WebGL, the testing protocol, honest reporting |
| [responsive-engineering.md](../../skills/form-and-force/references/responsive-engineering.md) | Ranges to design and test, transforming instead of shrinking, layout techniques, input modes, mobile patterns, motion across devices, art direction |
| [performance-engineering.md](../../skills/form-and-force/references/performance-engineering.md) | Budgets, LCP, INP, CLS, bundles, fonts and images, rendering cost, WebGL, memory, third parties, measuring |
| [security-and-integrity.md](../../skills/form-and-force/references/security-and-integrity.md) | Secrets, client-side exposure, untrusted HTML, forms, embeds, redirects, dependencies, content integrity, dark patterns, reporting |

### Templates

The documents the agent fills in, in [`assets/`](../../skills/form-and-force/assets/). See [templates](templates.md).

## What loads for which task

From `SKILL.md`'s routing table:

| Task | Read | Skip |
|---|---|---|
| Fix or add one interaction or animation | motion-direction §2, §5 · motion-craft · `motion_strip` before and after | Direction, composition, colour |
| A scroll scene, shader, canvas or 3D piece | motion-direction §7 · creative-coding · performance-engineering | The atlas |
| A dashboard, application screen or admin tool | project-modes §8–9 · direction §11 · typography §4–6 · composition §8 · experience-flow | creative-coding, arrival and narrative motion |
| A brand, luxury, studio or campaign page | Every stage: composition, typography, colour-and-imagery, motion-direction | creative-coding unless a coded medium is used |
| An editorial or long-form piece | typography §6 · composition §5–6 · motion-direction §7 | |
| A restrained business or service site | project-modes §14 · direction §3 · typography | creative-coding, the signature moment |
| A design system | project-modes §12 · component-architecture · typography §4 · colour-and-imagery §3 | |
| An audit or critique | floor · jury · project-modes §13 | Direction, unless a redirect is the finding |

## How references are written

These rules keep the library usable by an agent. Tests and the validator enforce most of them.

- **Linked from `SKILL.md`**, directly. A reference nothing links to is never loaded.
- **Numbered sections**, so other files can point at them (`jury.md §8`). A test resolves every pointer. A reference over 100 lines opens with a `## Contents` list that matches its sections.
- **Questions and principles, not answers.** No example palettes, typeface pairings or token values: examples become a house style. Illustrations show the form of an answer and say they are not to be reused.
- **Claims match the research.** Guidance traces to a source in the [research ledger](../../research/RESEARCH_LEDGER.md) or is marked as reasoned.
- **One place for each idea.** A topic lives in one reference; others point to it.
- **Tools and documents agree.** Every question a tool can raise is explained in `jury.md` or `motion-craft.md`, and every tool named exists.

Adding or changing a reference: [extending](../development/extending.md#a-reference).
