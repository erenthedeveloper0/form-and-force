# Direction: from a brief to a committed creative direction

How to find a direction for one particular project, prove it in a rendered frame, and commit to it. This replaces deciding a concept in prose.

## Contents
1. Why direction is decided this way
2. Read the subject
3. Set the register
4. Write down the twin
5. Deal the hand and answer it
6. Turn an answer into a device
7. Test the device before sketching
8. Sketch key frames and choose by looking
9. Commit
10. When the jury sends you back
11. Scaling down, and special cases
12. References without fixation
13. Without a browser

---

## 1. Why direction is decided this way

Three things make an agent's design work competent and predictable. Each stage below answers one of them.

- **The mode.** Asked to choose, a model chooses what is most typical, including the most typical "original" idea. Telling it to be original moves it to the next most typical thing. So the choices that decide distinctiveness are not left to preference: a script deals them at random, away from what recent projects used (§5).
- **Words.** Three directions described in prose can sound different and render as the same page. So a direction is not chosen until it has been drawn: rough frames, rendered, side by side (§8).
- **Self-defence.** The agent that wrote the rationale will find the result convincing. So the work is judged cold, from pictures, against the page anyone would have made (§4, and [jury.md](jury.md)).

A direction has three parts, and all three are required:

| Part | What it is | Form |
|---|---|---|
| **Position** | An opinion about the subject that a competitor would not hold | One sentence that excludes something |
| **Device** | The formal idea that carries the position | A rule someone could see in a screenshot |
| **Proof** | A rendered frame in which the device visibly works | An image, chosen against alternatives |

A mood ("calm, premium, modern") is none of these. Neither is a metaphor on its own.

## 2. Read the subject

Collect facts before ideas. Every later answer must cite one.

| Source | Look for |
|---|---|
| **Mechanism** | How the thing actually works: its sequence, transformation, physics, data flow |
| **Measures** | True numbers with units: sizes, durations, counts, prices, tolerances, dates |
| **Artefacts** | Objects practitioners handle: forms, tickets, tools, packaging, drawings, logs |
| **Vernacular** | The trade's own words, marks, notation and formats |
| **Material** | What it is made of, and how that material behaves |
| **Ritual** | What people already do around it: the handover, the check, the opening, the closing |
| **Shape of the content** | Hierarchical, sequential, comparative, geographic, networked, a single object |
| **Equity** | What the organisation already owns: marks, colours, phrases, people, places, history |
| **Tension** | Two true things that pull against each other |
| **The unsaid** | What the category avoids showing |

Aim for fifteen or more concrete items from at least six rows. "They value quality" is not an item. "Each batch rests eleven days" is.

Build the **truth inventory** at the same time: which proof really exists (named customers, sourced numbers, quotes with permission, real screenshots, real photography) and which does not. Missing proof becomes a designed, labelled slot. It is never invented.

List the **material in hand** as well: photography, product interface, data, objects or models, film. This list is passed to the dealer as `--has`. Most projects have less than the first idea assumes, and an idea that depends on assets nobody has is not a direction.

## 3. Set the register

The register says how far this project should go. It decides what counts as bold, and it is how the jury later tells restraint from timidity.

| Register | Motto | Typical projects | Bold here means |
|---|---|---|---|
| **Quiet** | The task is the experience | Services, health and money flows, dashboards, admin, docs | One conviction held without exception; language and feedback finer than expected |
| **Composed** | Clear, with a point of view | SaaS and B2B marketing, professional services, corporate | One device from the first screen onward; real evidence at commanding scale; one signature moment |
| **Expressive** | Authored | Brand, luxury, culture, hospitality, editorial, portfolios, launches | Art direction leads structure; scenes differ; type, image and motion carry identity |
| **Radical** | A world with its own rules | Studios, campaigns, experiments, art, music, fashion | Conventions become material, with an escape hatch and a parallel accessible layer |

Set it from evidence in the brief:
- **What a mistake costs the visitor.** High stakes or time pressure pull toward Quiet.
- **How often they return.** Daily use pulls down. A single memorable visit pulls up.
- **What is being sold.** A capability pulls toward Composed. A sensibility pulls toward Expressive or Radical.
- **What the client asked for.** "Premium", "award-winning", "unlike anything" are requests for Expressive or above. "Clear", "trustworthy", "simple" are not requests for blandness: they name the Quiet or Composed register, each of which has its own way of being bold.

One project can hold two registers on different routes: a storefront's story pages may be Expressive while its checkout is Quiet. Record the register and the reason in one line. If the user states one, use theirs.

Every register has a floor and two failures, printed with every hand: **timid** (under-reaching for the register) and **overwrought** (over-reaching). Both are failures. A Quiet page that looks like a component demo has failed as surely as a brochure site that scroll-jacks.

## 4. Write down the twin

Before dealing, describe in five lines the page any competent agent would produce from this brief: its structure, its type, its palette, its imagery, its motion. This is the **twin**. Be honest and specific. It is usually good, and that is the problem.

The twin is not banned. It is the benchmark. Later the jury asks what the built page does that the twin does not, and an answer of "better spacing" means the direction failed.

## 5. Deal the hand and answer it

```bash
node "${CLAUDE_SKILL_DIR}/scripts/deal.mjs" hand --register <register> --has <photo,ui,data,object,video|none> [--frames 3]
```

Each frame in the hand holds:
- a **lens**: a question that forces a position out of the subject, from one of eight families (truth, inversion, transposition, scale and time, viewpoint, material, constraint, system);
- a **structure**: a compositional principle for the key frame, from one of six families (axis, mass, field, sequence, layer, edge);
- a **lead medium**: what carries the frame, limited to material the project has or that can be made in code.

Frames in one hand never share a lens family or a structure family, so the sketches differ in structure by construction. The dealer remembers recent hands and commitments in `~/.form-and-force/history.json` and steers away from them, and it prints what your recent projects committed to (typefaces, palettes, structures). Treat those as taken unless this client owns them. That file is how consecutive projects stop resembling each other.

Rules for playing a hand:

1. **Answer every lens before preferring any.** The uncomfortable card is usually the useful one.
2. **Each answer cites a fact from §2** and takes the form the card asks for. No fact, no answer.
3. **Reject the first-order answer.** The first answer to any lens is usually the subject's most obvious artefact worn as a skin: a ledger for accounting, a blueprint for architecture, a terminal for developer tools. Write it down, then climb:
   - *Skin*: it looks like the artefact.
   - *Structure*: it is organised the way the artefact is organised.
   - *Behaviour*: it behaves by the artefact's rules, including what those rules forbid.

   Stop at structure or behaviour. A skin is decoration with a story attached.
4. **A card that truly cannot apply may be swapped once per frame**, with the reason: `deal.mjs swap --frame <n> --part lens|archetype|medium --reason "..."`. "It is hard" is not a reason. "The project has no measurable quantity" is.
5. **The structure and the medium are obligations for the sketch.** They are not suggestions. If the lens answer and the structure fight, that friction is where unfamiliar compositions come from. Resolve it; do not drop a card.

To read the full deck: `deal.mjs deck`. Do not browse it to pick favourites. That defeats the purpose.

## 6. Turn an answer into a device

Write each answer as:

> **Position:** *what we hold to be true that a rival would not say.*
> **Device:** *fact, therefore a rule you could see in a screenshot.*

A device is a rule, so it generates decisions. The grammar, shown on three unrelated subjects (these illustrate the form and are not to be reused):

- *A tide table governs when the club can row,* therefore the day's high-water height is the largest thing on every page and all other type is set at the size of a footnote.
- *The firm bills in six-minute units,* therefore every layout dimension is a multiple of six and durations are shown wherever a competitor would show an adjective.
- *The archive holds 40,000 objects and shows 200,* therefore the page shows all 40,000 as a field and the visitor's own search is the only spotlight.

Weak devices describe a feeling or a style ("an editorial feel", "bold typography", "a dark, cinematic look"). Strong devices name a relation between a fact and a form, and they forbid something.

## 7. Test the device before sketching

Four quick tests. A device that fails two is not worth a sketch; answer the lens again.

| Test | Question | Fails when |
|---|---|---|
| **Thumbnail** | At 200 px wide, what would make this frame recognisable among ten competitors? | The answer is a colour or a font |
| **Extension** | How does the device shape at least four of: grid, type, colour, image, motion, interaction, navigation, copy? | It only shapes the hero |
| **Exclusion** | What tempting things does it forbid? | It forbids nothing |
| **Register** | Does it meet the register's floor without becoming its "overwrought"? | It is timid for the register, or it costs the visitor their task |

Truth still applies: a device may not depend on proof, people or numbers that do not exist.

## 8. Sketch key frames and choose by looking

A key frame is the single screen that has to prove the device. It is usually the first screen. Sometimes it is the moment the product is first used, or an index.

**Sketching rules**
- One standalone HTML file per frame, in a scratch folder outside the project's source (for example `.ff/frames/a.html`; add it to the ignore file if the project has one). No framework, no build, no libraries. The project's stack comes later.
- Real words from the project. Real typefaces, loaded the way the page would load them. The actual numbers.
- Obey the dealt structure and lead medium. Decide every item on the structure card's "Decide" line and write the decisions as a comment at the top of the file.
- Rough is correct. Spend the effort on proportion, scale, position and the one idea. No hover states, no polish, no second section unless the device only shows across two screens.
- Design the narrow screen as its own composition in the same file. A device that dies at 390 px is not a device.
- Time-box: a frame is a sketch, not a build. If one is taking long, it is being polished.

**Board them**

```bash
node "${CLAUDE_SKILL_DIR}/scripts/sketch_board.mjs" .ff/frames/a.html .ff/frames/b.html .ff/frames/c.html
```

This writes `board.jpg` (each frame at wide and narrow widths, plus a blurred thumbnail) and reports measured differences between frames. If two frames measure as the same composition, one of them did not obey its cards. Resketch it.

**View the board and choose by looking.** Answer from the image, before re-reading any rationale:

1. In the blurred thumbnails, which frame still has a shape?
2. For each frame, what is the one thing it does that the others, and the twin, do not?
3. Which frame would a stranger describe correctly after five seconds, and what would they say?
4. Which frame makes the content more itself, and which merely decorates it?
5. Which frame could carry ten more screens without repeating or collapsing?
6. Which frame is at the right height for the register: not timid, not overwrought?

Choose the frame that wins on what is seen. Do not choose the one that is easiest to justify, or the one that took longest. A hybrid is allowed only if it still states one device in one sentence. Two half-devices are worse than either.

If no frame clears the register's floor, do not pick the least bad. Deal again, or return to §2: weak frames usually mean thin facts.

Show the board to the user when they are available and the scope is L or XL: a direction is a decision they may want to make. Recommend one, and say what each alternative would have given them. If they are not available, proceed with your choice and report it.

## 9. Commit

```bash
node "${CLAUDE_SKILL_DIR}/scripts/deal.mjs" record --frame <n> --device "<the device in one line>" \
     --type "<families>" --palette "<words or values>" --motion "<character>"
```

Then write the direction brief ([assets/direction-brief.md](../assets/direction-brief.md)): register, position, device, the frame, what the device forbids, and the twin it must beat. Keep it to one screen of text. It is the reference every later decision is checked against, and it is what you hand to the jury last, not first.

The chosen frame is now the source of truth. The design language is extracted from it, not written beside it: [composition.md](composition.md) for the grid and the page's pacing, [typography.md](typography.md), [colour-and-imagery.md](colour-and-imagery.md), and [motion-direction.md](motion-direction.md) for how the device moves.

## 10. When the jury sends you back

The jury ([jury.md](jury.md)) can return four verdicts. Two of them come back here.

- **Rework** (the device is right, the system built from it is not): return to the frame and re-derive the language. Do not re-deal.
- **Redirect** (the idea itself is not strong enough): the rejected frames are evidence. Reconsider the runner-up first. Otherwise deal a new hand; the history keeps the failed cards out. One redirect per engagement is normal on XL work. A second means the facts in §2 are thin or the register is wrong: stop and say so.

A well-executed weak idea is still a weak idea. Polishing it is the most expensive way to find that out.

## 11. Scaling down, and special cases

| Situation | What changes |
|---|---|
| **S: targeted fix** | No hand. Work inside the existing language. |
| **M: a component or section** | Deal with `--frames 2`. Sketch two variants of the component in place, or as standalone files using the project's tokens. Board them. The device is the project's existing one; the lens finds this component's version of it. |
| **L: a page or flow** | Two or three frames. |
| **XL: a site, product or launch** | Three frames, the user sees the board, and the jury runs in a fresh context when one is available. |
| **Existing brand or redesign** | Equity from §2 is binding: owned marks, colours and typefaces stay. The hand still applies; lenses work on structure, scale, order and behaviour, which a brand guide rarely fixes. Put the current page on the board as the first column for a true before and after. |
| **Applications and dashboards** | Quiet or Composed. The key frame is the main working screen with real or labelled sample data, at real density. The device usually lives in the interaction model, the data's own shape, and the typography of numbers. |
| **Design systems** | The key frame is a specimen page that uses the system to document itself. |
| **The user supplied a direction** | Do not deal against it. Extract its position and device, run §7, sketch one frame of it and one alternative from a single dealt card, and board both. |

## 12. References without fixation

People copy the incidental features of whatever example they have just seen. So:

- Look at references **before** the hand is dealt, and close them before sketching.
- From each reference take one sentence in this form: *"It does X, which works because Y."* Carry Y. Leave X.
- Never take a reference's palette, typeface pairing, layout or signature interaction. If a viewer could name the reference from your page, too much was taken.
- Prefer references from outside the category and outside the web: print, signage, film, exhibitions, instruments, packaging.
- Illustrations in these files show the form of an answer. They are never a starting point.

## 13. Without a browser

If Playwright cannot be installed, the method still runs with less evidence, and the report must say so.

- Write each frame as HTML anyway. Describe its first screen in a fixed form: the largest element and its share of the frame, the three positions where text starts, what touches which edges, the emptiest quadrant.
- Compare frames on those descriptions.
- Ask the user to open the frames and choose, when they are available.
- State in the report that the direction was chosen without rendered evidence.
