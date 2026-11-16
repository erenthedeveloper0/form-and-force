# How it works

Form & Force is a method with tools attached. This page follows one job from request to report, defines the words the method uses, and shows which tool serves which stage. The agent's own instructions are in [SKILL.md](../skills/form-and-force/SKILL.md).

## The loop

```text
read → register → twin → hand → sketches on a board → commit
     → derive the language from the chosen frame → build
     → floor (hard gates) → jury (rendered evidence) → ship | refine | rework | redirect
```

1. **Read** the repository and the subject: the stack and its conventions, the design-defining files, and fifteen or more concrete facts about what the project is for.
2. **Set the register** (Quiet, Composed, Expressive or Radical), and write down **the twin**: the page any competent agent would make from this brief.
3. **Deal a hand**: for each key frame, a lens, a compositional structure and a lead medium, dealt by a script.
4. **Sketch** each frame as a rough standalone page, put them on one **board**, and **choose by looking**.
5. **Derive** composition, typography, colour, imagery and motion from the chosen frame, and **build** in the project's stack.
6. **Clear the floor**: ten hard gates for accessibility, function, responsiveness, performance and honesty.
7. **Sit the jury** on the rendered page: a cold read, a test against the twin, ten dimensions marked with evidence, and a verdict that can send the work back to the idea.
8. **Report** what changed, what ran and what was not verified.

## Scaled to the job

| Scope | Examples | Path |
|---|---|---|
| **S: a fix** | A jittery animation, one state, an accessibility defect | Read, fix inside the existing language, floor checks for what changed, report. No hand |
| **M: a component or section** | A pricing table, a navigation, one hero | Two frames; the device stays the project's; one jury round |
| **L: a page or flow** | A landing page, a checkout, onboarding | Every stage; two or three frames; two jury rounds |
| **XL: a site, product or launch** | A full site, a redesign, a design system | Every stage; three frames; you see the board; the jury sits in a fresh context; three rounds |
| **Review only** | "Audit this", "critique this" | Evidence, floor and jury on what exists. Nothing is redesigned uninvited |

The project's **mode** (brand site, SaaS application, dashboard, editorial, luxury, campaign and so on) sets the usual register, key frame and performance budget. The fourteen modes are in [project-modes.md](../skills/form-and-force/references/project-modes.md).

## The words the method uses

| Term | Meaning |
|---|---|
| **Register** | How far this project should go. Quiet (the task is the experience), Composed (clear, with a point of view), Expressive (authored), Radical (a world with its own rules). It decides what counts as bold, and lets the jury tell restraint from timidity |
| **Twin** | Five lines describing the page any competent agent would produce from the brief. It is not banned; it is the benchmark |
| **Truth inventory** | Which proof really exists: named customers, sourced numbers, permitted quotes, real screenshots. Missing proof becomes a labelled slot |
| **Material in hand** | What the project actually has: photography, interface, data, objects, film. It limits what the dealer can deal |
| **Hand** | A set of key frames, each with three cards dealt by `deal.mjs`. No two frames share a lens family or a structure family |
| **Lens** | A question that forces a position out of the subject, such as "What is the true size of the thing, unrounded?" 26 lenses in 8 families |
| **Structure** | A compositional principle for the frame, such as *spine* or *specimen*. 17 structures in 6 families |
| **Lead medium** | What carries the frame: type, drawing, generative, interface, data, photo, object or footage |
| **Device** | The formal idea of a direction, written as *a fact, therefore a rule you could see in a screenshot*. A mood is not a device |
| **Key frame** | The single screen that has to prove the device, usually the first screen |
| **Board** | The frames rendered side by side, wide and narrow, with blurred thumbnails and a measure of whether they really differ |
| **Floor** | Ten pass-or-fail gates (accessibility, function, overflow, focus, reduced motion, real controls, honesty, performance), plus failures fixed without exception |
| **Registry of defaults** | Patterns that are common because they are easy (first-order, the tasteful overcorrection, award-site imitation, and the skill's own habits). Checked on finished work, never used as a source of ideas |
| **Jury** | A judgement of the rendered page from evidence, kept separate from the floor |
| **Design facts** | Measurements of the rendered page (scale contrast, alignment, pacing, repetition, colour commitment) phrased as questions. Never verdicts |
| **Motion character** | One decision, in four effort factors (weight, time, space, flow), from which every duration, curve and stagger is generated |
| **Verdict** | Ship, refine (fix execution), rework (the device is right, the system does not carry it) or redirect (the idea is not strong enough: back to the hand) |

## Which tool serves which stage

```text
            ┌─────────────────────── the skill: SKILL.md + 18 references + 5 templates ───────────────────────┐
 read       inspect_repo ── stack, tokens, routes, git state        slop_scan ── the baseline
            audit_page ──── the existing site as "before" evidence
 direct     deal ────────── hand │ swap │ record │ recent ── ~/.form-and-force/history.json
            sketch_board ── frames side by side, measured                          (needs a browser)
 derive     motion_tokens ─ durations, curves, spring, stagger from one character
 build      component atlas ── jobs, states and tests for one component at a time (searched, not read)
 floor      slop_scan --strict ── failures; coverage stated     audit_page ── focus, overflow, LCP, CLS
 jury       audit_page ──── first.jpg, flatplan.jpg, sheet.jpg, design facts      (needs a browser)
            motion_strip ── a moment in slow motion, interrupted and reversed      (needs a browser)
            contact_sheet ─ any folder of screenshots as one sheet                 (needs a browser)
 report     report template ── commands with their actual results
```

`design_facts.mjs` and `browser.mjs` are modules shared by the rendered tools. Every tool is described in the [tools reference](reference/tools.md).

## How the agent reads the skill

`SKILL.md` is an operating manual, kept under about 4,500 tokens by a test. It routes each stage and each kind of task to the references it needs, and names what to skip: a dashboard does not load creative coding; an animation fix does not load direction. References load only when a stage needs them, and the component atlas is searched for one component at a time. The [reference library](reference/library.md) lists what each reference covers and when it is loaded.

## Without a browser

The method still runs: frames are compared as written descriptions, the floor uses static checks, and the jury works from the code and whatever the user can show it. The report then says which judgements were made without rendered evidence ([direction.md §13](../skills/form-and-force/references/direction.md#13-without-a-browser)).

## Next

The [guides](README.md#guides) take each stage in turn, starting with [creative direction](guides/creative-direction.md).
