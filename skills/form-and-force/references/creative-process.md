# Creative process: the Context-to-Concept Engine

How to turn a vague request into a precise creative problem, explore genuinely different answers, choose one by critique, and turn it into a system you can build.

## Contents
1. Phase A: Project DNA
2. Phase B: The creative tension
3. Subject mining: where distinctive decisions come from
4. Phase C: Three divergent territories
5. Divergence check
6. Scoring and selection
7. Phase D: Design hypothesis
8. Phase E: Project-specific design language
9. Phase F: Anti-reference list
10. Originality mechanism (repeatable)
11. Using references without copying
12. Worked reasoning examples
13. Scaling down for M-scope work

---

## 1. Phase A: Project DNA

Gather facts from the repository, existing site, docs, assets and the user's words before inventing anything. Fill what you can. Mark the rest as **assumed** (with the assumption) or **unknown** (ask only if it blocks the work).

| Field | Questions |
|---|---|
| Purpose & model | What does the organisation sell or do? How does it make money or create value? |
| Audiences & tasks | Who arrives, from where, knowing what, needing to do what? Primary vs secondary audiences. |
| Journeys | What are the 2–4 paths that matter (evaluate → buy, onboard → first value, read → share, find → act)? |
| Goals | Conversion, activation, comprehension, trust, retention, delight. Which matters most here? |
| Category conventions | What does every competitor do? Which conventions help users and which are just habit? |
| Brand character | Existing identity, voice, history, rituals, artefacts, equity (colours, marks, signatures, sounds). |
| Content | What actually exists (copy, data, imagery, video, 3D, docs)? What is missing? |
| Truth inventory | Real proof: customers who agreed to be named, numbers with sources, quotes with permission, real screenshots. |
| Technical | Stack, hosting, CMS, performance constraints, existing components and tokens. |
| Constraints | Legal, regulatory, localisation, accessibility target, timeline, budget, maintenance capacity. |

**Output:** a short DNA brief (assets/creative-brief.md §1). A vague request such as "premium", "modern" or "clean" becomes a statement like: *"Independent bookkeepers (audience) need to trust a tool with their clients' money (task, emotion) within one visit (constraint). The current site says nothing a competitor couldn't (problem)."*

## 2. Phase B: The creative tension

Find the most interesting tension *inside this project*: two true things that pull against each other. Good concepts resolve, dramatise or exploit a tension.

Ways to find one:
- **Product vs. perception:** what it really is vs. what people assume (a ledger tool that is actually about calm).
- **Material vs. medium:** a physical craft shown on a weightless screen (ceramics, furniture, food).
- **Scale vs. intimacy:** a global network experienced by one person; a tiny object with a huge story.
- **Precision vs. warmth:** engineering rigour vs. human care.
- **Order vs. play:** compliance vs. delight; system vs. improvisation.
- **Time:** heritage vs. now; slow craft vs. instant software.
- **Visibility:** hidden infrastructure made visible (logistics, security, data pipelines).

These are directions for reasoning, not aesthetics. Write: *"The tension is X vs. Y, because [project fact]."* If you can't cite a project fact, it's a generic tension. Find another.

## 3. Subject mining: where distinctive decisions come from

Before designing, list concrete raw material from the subject. Every major decision in the final design should trace back to an item on this list.

| Source | Examples of what to extract |
|---|---|
| **Mechanism** | How the product actually works: its data flow, transformation, sequence or physics (a digital twin, a ledger reconciling, a kiln firing curve). |
| **Artefacts** | Objects people in the domain handle: forms, receipts, tickets, tools, packaging, maps, instruments, specimens. |
| **Vernacular** | Words, marks, notation and formats the domain already uses: shipping codes, sheet-music marks, film slates, lab labels, chart conventions. |
| **Materials** | Physical materials and finishes: cork, enamel, paper stock, steel, wool weave, glass, concrete. |
| **Rituals** | Moments users already perform: signing, unboxing, opening night, the morning check, the release day. |
| **Data shapes** | The real structure of the content: hierarchical, temporal, geographic, comparative, networked. |
| **Place & history** | Location, origin story, archives, architecture. |
| **Equity** | Things the brand already owns: colours, marks, sounds, signature gestures, people. |
| **Constraints** | Limits that can become form: a small catalogue (a gallery), dense data (an instrument panel), one product (a single object on a stage). |

Corpus evidence: Son Daven derived both its typeface and illustrations from Hutsul weaving. Terminal Industries used the product's own mechanism (photo → wireframe digital twin). Lando Norris used his real livery and signature. Teenage Engineering staged its product's own shadow.

## 4. Phase C: Three divergent territories

For L/XL work, generate three territories. Each must differ in **structure**, **interaction model** and **visual reasoning**. Palette and light/dark alone don't make a territory different.

Template per territory (also in assets/creative-brief.md §3):

```
Name:
Thesis (one sentence):
Emotional response:
Core metaphor / mechanism (traced to subject-mining items):
Composition & layout principles:
Typography direction (roles, character, why):
Colour & material direction (where it comes from):
Imagery / graphics strategy (real assets? procedural? diagrammatic?):
Motion philosophy (character + what motion explains):
Signature interaction (what it reveals or makes easier):
Page / workflow structure (section order or app shell, derived from journeys):
Representative custom component (name, job, behaviour):
Risks & usability implications:
Relation to business/product goals:
```

Divergence levers. Pull different ones per territory:
- **Structural model:** linear narrative · index/catalogue · spatial map · instrument/dashboard · document/editorial · conversation · tool-first (product above the fold) · comparison table · timeline · single object on stage.
- **Interaction model:** read · scrub · manipulate · compare · configure · explore · search · play · build.
- **Visual reasoning:** diagrammatic · photographic · typographic · material/tactile · cinematic · archival · generative · data-native · illustrative.
- **Density:** sparse stage · balanced editorial · dense instrument.
- **Pace:** contemplative · brisk · utilitarian.

## 5. Divergence check

Compare territories pairwise across: structural model, interaction model, visual reasoning, density, pace, signature mechanism, type strategy. **If two territories share four or more, regenerate one.** Also check each territory against the registries in anti-slop-constitution.md §4. A territory built mostly from registry items is a default in costume.

## 6. Scoring and selection

Score each territory from 1 to 5. Use the anchors. Don't average blindly: a 1 in usability or feasibility is disqualifying unless it can be fixed.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **Originality** | Could be any brand; registry-heavy | Specific in parts | Every major decision traces to subject mining; passes substitution |
| **Context fit** | Fights the audience's task | Neutral | Makes the main journey easier or more convincing |
| **Usability** | Gates or hides essentials; high learning cost | Conventional where needed | Unconventional only where it pays; fully operable |
| **Feasibility** | Needs assets or skills we don't have; perf risk unmanaged | Possible with effort | Buildable in the stack within budget, with fallbacks |
| **Coherence potential** | Ideas don't form a system | Partly systematic | One idea generates type, layout, motion and components |

Write two or three sentences of critique per territory: strongest point, biggest risk, what would make it a 5. Choose the best total *after* fixing disqualifiers. Say why the runner-up lost. **Don't choose the flashiest by reflex.** If the most restrained territory scores best, choose it.

## 7. Phase D: Design hypothesis

```
We believe that [concept] will [measurable or observable outcome]
for [audience] because [mechanism tied to their task].
We'll know it works when [evaluation: test, metric, critique result].
Parts that should benefit: [pages / components / journeys].
```

Example: *"We believe staging every feature as a before/after reconciliation of a real messy ledger will make independent bookkeepers trust the tool in one visit, because they see their own pain resolved, not described. We'll know it works when a 5-second test recalls 'it reconciles my clients' bank feeds', and the substitution test fails for competitor names."*

## 8. Phase E: Project-specific design language

Define before building sections. Express it as tokens and rules (component-architecture.md §3 for token architecture).

- **Composition & grid:** the rule that makes layouts recognisable (for example "content hangs from a baseline shelf like ledger lines", "everything aligns to the product's 5° tilt"). Columns, gutters, margins, breakpoints.
- **Spacing & density:** a scale and *where* density changes (dense data vs. breathing narrative).
- **Typography roles:** display / heading / body / caption / data / label, with family, weight, size scale, leading, tracking, measure and responsive behaviour. One or two families. Define why each was chosen.
- **Colour roles:** ground, ink, muted, accent(s), semantic (success/warn/error/info), data series, focus. Dark mode if needed. Contrast pairs checked.
- **Surfaces & materials:** what surfaces are made of and how they layer. Borders, separators, radii (varied by semantics), elevation logic.
- **Imagery:** sources, treatment, crop rules, art direction for placeholders when real assets are missing.
- **Iconography:** style, stroke, grid, and where icons are *not* used.
- **Motion identity:** see motion-intelligence.md §1.
- **Interaction feedback:** hover, focus, press, selection and error language.
- **Component rules:** the 3–6 signature components and their behaviour.
- **Responsive transformations:** what changes structurally at each range.
- **Accessibility behaviours:** focus style, reduced-motion substitutions, contrast strategy.

## 9. Phase F: Anti-reference list

List the 5–10 most tempting generic solutions *for this concept* and what you'll do instead. It must come from the chosen direction, not from a universal ban list.

```
Tempting: a floating 3D coin rotating in the hero → Instead: the real invoice PDF folding into the ledger row it becomes
Tempting: three feature cards with icons → Instead: one continuous reconciliation sequence with three checkpoints
Tempting: fade-up on each section → Instead: entries settle line by line only inside the ledger component
```

## 10. Originality mechanism (repeatable)

A procedure you can run on any project to escape the first plausible idea:

1. **Mine** the subject (§3). Collect at least 12 concrete items across 5+ sources.
2. **Log** first instincts (constitution §6).
3. **Collide** two unrelated items from the list into a design rule. For example "kiln firing curve × navigation", which gives a progress rail shaped like the temperature curve. Generate 10 collisions quickly and keep the 2–3 with a real job.
4. **Borrow a discipline.** Import a method from a neighbouring craft that fits the subject: cartography, typesetting, exhibition design, film titles, instrument panels, packaging, signage systems, scientific figures, theatre lighting. Use its method, not its look.
5. **Invent the content's own structure.** Let the data shape set the layout: timeline, tree, network, matrix, map, specimen grid.
6. **Pick one material behaviour.** How does the surface move, reflect, fold, stack or wear? Make motion obey it.
7. **Design one signature component** that only this project would have (motion-intelligence.md §4).
8. **Constrain deliberately.** One family, two colours, no rounded corners, everything on a 9-column grid. A constraint is a decision engine.
9. **Critique and refine.** Run the eight tests and remove what fails removal.
10. **Write the reasons down.** Undocumented decisions drift back to defaults in later sessions.

Novelty, defined: **the presence of defensible, contextual decisions a competitor could not copy without becoming this brand.**

## 11. Using references without copying

For each reference you consult, record three things:
- **Observation:** what it does (for example "the navigation is a mosaic of the brand system's own tiles").
- **Principle:** why it works ("documentation demonstrates its subject").
- **Transformation:** how the principle becomes something new here ("our API docs index is a live request/response specimen per endpoint").

Never transfer the surface: the palette, layout, signature interaction or typeface pairing. If a viewer would name the reference, you transferred too much (test 8).

## 12. Worked reasoning examples

These illustrate reasoning, not outputs to reuse.

**Bookkeeping SaaS for independent accountants**
- Tension: chaos (clients' messy feeds) vs. calm (closed books).
- Subject items: bank feed rows, reconciliation ticks, month-end close, receipts, double-entry columns, audit trail.
- Territory 1, "The Close": a linear narrative that walks one real client's month-end from chaos to a closed ledger; the ledger table itself is the signature component.
- Territory 2, "Two Columns": a typographic, editorial treatment where every claim is laid out as debit/credit pairs (problem/resolution); the structure is double-entry.
- Territory 3, "The Instrument": tool-first; an interactive demo ledger above the fold with real (sample, labelled) data; the narrative lives in tooltips and states.
- Likely choice: whichever best fits evidence of the buyer's decision path. Often 1 or 3. Territory 2 risks style over task.

**Independent ceramics studio shop**
- Tension: tactile, slow, unique pieces vs. a flat, fast, repeatable grid.
- Subject items: glaze tests, firing logs, kiln shelves, maker's marks, wrapping paper, seconds.
- Territories: "Kiln Shelf" (catalogue as shelves loaded by firing; pieces sold out stay as ghosts); "Glaze Test" (filter by glaze chips that behave like test tiles); "Firing Log" (editorial journal where each firing releases a drop).
- The custom component in every territory is the product card. It must show uniqueness ("one of one", the piece's own photos), not a template.

## 13. Scaling down for M-scope work

For a component or section inside an existing design language:
1. Read the existing language: tokens, components, motion.
2. Mine the subject for that one component's content.
3. Generate two quick variants (structure or interaction difference) and pick one in a sentence.
4. Run tests 3, 4, 5, 6 and 7.
5. Extend tokens only if the system lacks something. Don't fork it.
