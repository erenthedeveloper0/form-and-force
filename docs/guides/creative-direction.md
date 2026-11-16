# Creative direction

A direction is decided before anything is designed. This guide explains how Form & Force finds one, and where you can steer it. The agent follows [direction.md](../../skills/form-and-force/references/direction.md), which this summarises.

## What a direction is

A direction has three parts. All three are required.

| Part | What it is | Form |
|---|---|---|
| **Position** | An opinion about the subject a competitor would not hold | One sentence that excludes something |
| **Device** | The formal idea that carries the position | A rule someone could see in a screenshot |
| **Proof** | A rendered frame in which the device visibly works | An image, chosen against alternatives |

"Calm, premium, modern" is none of these. Neither is a metaphor on its own.

## 1. Facts before ideas

The agent reads the subject before having ideas, and every later decision must cite what it found. It looks for fifteen or more concrete facts from at least six kinds of source: how the thing works, its true measures, the artefacts its practitioners handle, its vernacular, its material, its rituals, the shape of its content, what the organisation already owns, the tensions in it, and what its category avoids showing.

"They value quality" is not a fact. "Each batch rests eleven days" is.

Two lists are built at the same time:

- **The truth inventory:** which proof really exists. Named customers, sourced numbers, quotes with permission, real screenshots, real photography. Anything missing becomes a designed, labelled slot. It is never invented.
- **The material in hand:** photography, product interface, data, objects or models, film. A direction that depends on assets nobody has is not a direction.

**How you can help:** give the agent facts it cannot find (numbers, processes, history, what customers actually do) and say which proof exists and may be used.

## 2. The register

The register sets how far the project should go, and so what counts as bold.

| Register | Motto | Typical projects |
|---|---|---|
| **Quiet** | The task is the experience | Services, health and money flows, dashboards, admin, documentation |
| **Composed** | Clear, with a point of view | SaaS and B2B marketing, professional services, corporate |
| **Expressive** | Authored | Brand, luxury, culture, hospitality, editorial, portfolios, launches |
| **Radical** | A world with its own rules | Studios, campaigns, experiments, art, music, fashion |

It is set from evidence: what a mistake costs the visitor, how often they return, whether a capability or a sensibility is being sold, and what you asked for. Every register has two failures, **timid** and **overwrought**, and both count. A Quiet page that looks like a component library's demo has failed as surely as a brochure site that hijacks the scroll.

**How you can help:** if you know the register, say so. The agent uses yours.

## 3. The twin

Before any idea, the agent writes five lines describing the page any competent agent would produce from your brief: its structure, type, palette, imagery and motion. This is the **twin**. It is usually good, and that is the problem. It is not banned; it is the benchmark the work has to beat, and the jury checks it at the end.

## 4. The hand

The choices that decide distinctiveness are dealt by a script, because a model asked to choose picks the most typical option.

```bash
node scripts/deal.mjs hand --register composed --has photo,data
```

Each key frame gets three cards:

- a **lens**: a question that forces a position out of the subject ("What is the true size of the thing, unrounded?");
- a **structure**: a compositional principle for the frame (*spine*, *specimen*, *index*, *stage*…);
- a **lead medium**: what carries the frame, limited to material the project has or that can be made in code.

No two frames in a hand share a lens family or a structure family, so the sketches differ in structure by construction. The dealer keeps a history in `~/.form-and-force/history.json` and steers away from recent hands, and it prints what your recent projects committed to so the next one does not repeat them. The full deck is listed in [the deck reference](../reference/deck.md).

A card that truly cannot apply may be swapped once per frame, with a reason: "the project has no measurable quantity" is a reason; "it is hard" is not.

## 5. From an answer to a device

Each lens is answered from a fact, then pushed past its first-order answer. The first answer to any lens is usually the subject's most obvious artefact worn as a skin: a ledger for accounting, a blueprint for architecture. The agent climbs from *skin* (it looks like the artefact) to *structure* (it is organised like it) or *behaviour* (it follows its rules), and stops there.

The answer is written as a device: *a fact, therefore a rule you could see in a screenshot.* For example (illustrations of the form, not ideas to reuse):

> *A tide table governs when the club can row,* therefore the day's high-water height is the largest thing on every page and all other type is set at the size of a footnote.

A device must pass at least three of four tests before it is sketched: it is recognisable as a thumbnail, it shapes more than the hero, it forbids something tempting, and it suits the register.

## 6. Sketch, board, commit

Each device is drawn as a rough key frame and compared with the others on one board. That stage has its own guide: [visual exploration](visual-exploration.md).

Once a frame is chosen, the agent records it so future hands avoid it, and writes a one-screen direction brief ([template](../reference/templates.md#direction-brief)):

```bash
node scripts/deal.mjs record --frame 2 --device "<the device in one line>" --type "<families>" --palette "<strategy>" --motion "<character>"
```

## When you already have a direction or a brand

- **You bring a direction:** the agent does not deal against it. It tests your direction, sketches it, and boards it beside one dealt alternative, so you can see both.
- **You have a brand:** owned marks, colours and typefaces are binding. The hand works on structure, scale, order and behaviour instead.
- **A small job:** a fix (scope S) gets no hand. A component (scope M) uses two frames, and the device stays the project's.

## When the jury sends it back

The jury can return **rework** (the device is right, the system built from it is not: back to the chosen frame) or **redirect** (the idea is not strong enough: back to the hand, runner-up first). One redirect per engagement is normal on large work; a second means the facts are thin or the register is wrong, and the agent stops and says so. See [quality](quality.md).

## For the agent

[direction.md](../../skills/form-and-force/references/direction.md) (the method) · [project-modes.md](../../skills/form-and-force/references/project-modes.md) (usual register, key frame and twin by mode) · [direction-brief.md](../../skills/form-and-force/assets/direction-brief.md) (template)
