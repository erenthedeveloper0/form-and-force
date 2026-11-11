---
name: form-and-force
description: Creative direction, interface design and motion engineering for the web, as a method that decides, builds and judges. Use when designing, building, redesigning, animating or critiquing websites, landing pages, portfolios, e-commerce, SaaS apps, dashboards, editorial or immersive WebGL experiences, design systems or custom components, especially when the work should be distinctive, premium, award-level or less generic and AI-looking, or involves art direction, typography, layout, motion, scroll storytelling, page transitions, micro-interactions, GSAP, Three.js or shaders, or a frontend UI/UX, accessibility, responsive or performance review. Inspects the codebase, sets a creative register, deals divergent directions from the subject's own facts, proves them as rendered sketches chosen by looking, derives composition, type, colour and motion from the chosen frame, builds in the existing stack, and judges the rendered result with a jury that can reject the idea, above hard accessibility and engineering gates.
license: MIT
compatibility: Built for Claude Code (filesystem, shell, optional browser). Scripts need Node 18+. The rendered tools (sketch board, page audit, motion strip) need Playwright with Chromium, installed locally in the project or a scratch directory. Without a browser the method still runs on written frames and static checks, and the report says so.
metadata:
  version: "0.2.0"
---

# Form & Force

A method for deciding what a digital experience should be, building it properly, and judging what was actually built. It is a way of working and has no look of its own: a public-service form, a dense trading screen and an immersive launch each get their own answer, and none of them resembles the others.

## Why it works this way

An agent's design work is usually competent and predictable, for three reasons. Each has a mechanism here.

| Cause | Mechanism |
|---|---|
| **The mode.** Asked to choose, a model chooses the most typical thing, including the most typical "original" thing | The choices that decide distinctiveness are **dealt** by a script, at random, away from what recent projects used |
| **Words.** Directions described in prose sound different and render the same | A direction is **drawn** before it is chosen: rough frames, rendered, side by side |
| **Self-defence.** Whoever wrote the rationale finds the result convincing | The work is **judged cold**, from pictures, against the page anyone would have made |

```
read → register → twin → hand → sketches on a board → commit
     → derive the language from the chosen frame → build
     → floor (hard gates) → jury (rendered evidence) → ship | refine | rework | redirect
```

## Stance

- **Derive, never decorate.** Every decision cites a fact about the subject: its mechanism, measures, artefacts, vernacular, material. Lists of defaults are checks run afterwards. They are never where ideas come from.
- **The register sets the ambition.** Quiet, Composed, Expressive or Radical is decided from the brief, and it defines what bold means. Timid and overwrought are both failures. Complexity, WebGL and quantity of animation are not quality, and neither is minimalism.
- **Decide by looking.** Sketch before arguing. Look at the rendered page before reading the rationale. Measurements are evidence and questions. They are never verdicts.
- **Truth and the floor are not traded.** No invented proof, people, numbers or screenshots. No controls that do nothing. Accessibility, reduced motion, performance and security are gates, never weighed against beauty.
- **Respect the project.** Inspect before acting. Keep working architecture and uncommitted work. Use the lowest tool that carries the idea.
- **Claim only what ran.** A check that did not run is reported as not run.

## 1. Size the job

| Scope | Examples | Path |
|---|---|---|
| **S: a fix** | A jittery animation, one state, an accessibility defect | Read, fix inside the existing language, floor checks for what changed, report. No hand. |
| **M: a component or section** | A pricing table, a navigation, one hero | Read, direct with two frames (the device stays the project's), build, floor, one jury round |
| **L: a page or flow** | A landing page, a checkout, onboarding | Every stage. Two or three frames. Two jury rounds |
| **XL: a site, product or launch** | A full site, a redesign, a design system | Every stage. Three frames, the user sees the board, the jury sits in a fresh context, three rounds |
| **Review only** | "Audit this", "critique this" | Read, gather evidence, floor and jury on what exists, report findings. Redesign nothing uninvited |

Find the project's mode in [references/project-modes.md](references/project-modes.md) and read that one section: it gives the usual register, the key frame, the budgets and the page a competent agent would make by default.

Ask the user only for facts that block the work and cannot be discovered: real proof assets, legal constraints, brand rules. For everything else state the assumption and continue.

## 2. Read

```bash
node "${CLAUDE_SKILL_DIR}/scripts/inspect_repo.mjs" .       # stack, tokens, routes, motion code, uncommitted work; never opens secret files
node "${CLAUDE_SKILL_DIR}/scripts/slop_scan.mjs" .          # baseline counts, before anything changes
node "${CLAUDE_SKILL_DIR}/scripts/audit_page.mjs" <url>     # an existing site: the "before" evidence
```

`${CLAUDE_SKILL_DIR}` is this skill's directory. Outside Claude Code, use the path where this file lives.

Then read the files that define the design (tokens and global styles, the layout, two or three components, existing motion code) and note what must be preserved: [references/repository-workflow.md](references/repository-workflow.md).

Then read the subject, for M and above. Collect fifteen or more concrete facts from at least six kinds of source, the **truth inventory** (which proof really exists) and the **material in hand** (photography, interface, data, objects, film). Every later decision must cite one of these facts. Method: [references/direction.md](references/direction.md) §2.

## 3. Direct

Follow [references/direction.md](references/direction.md). It is the core of the method and is required reading for M, L and XL. In short:

1. **Set the register** from evidence in the brief, and record why.
2. **Write the twin:** five lines describing the page any competent agent would produce from this brief. It is the benchmark the work must beat.
3. **Deal the hand.** Each frame gets a lens (a question that forces a position out of the subject), a structure (a compositional principle) and a lead medium limited to material the project really has. Frames in one hand never share a lens family or a structure family.
   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/deal.mjs" hand --register <quiet|composed|expressive|radical> --has <photo,ui,data,object,video|none>
   ```
4. **Answer every lens** from a fact, past its first-order answer, and write each as a device: *fact, therefore a rule someone could see in a screenshot.* A mood is not a device.
5. **Sketch each frame** as one standalone HTML file with the project's real words and numbers, wide and narrow, obeying its cards. Rough is correct.
6. **Board them and choose by looking**, before re-reading any rationale.
   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/sketch_board.mjs" .ff/frames/a.html .ff/frames/b.html .ff/frames/c.html
   ```
   View `board.jpg`. If two frames measure as the same composition, one did not obey its cards. If none clears the register's floor, deal again.
7. **Commit:** record the choice, and write the brief on one screen with [assets/direction-brief.md](assets/direction-brief.md).
   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/deal.mjs" record --frame <n> --device "<one line>" --type "<families>" --palette "<strategy>" --motion "<character>"
   ```

If the user supplied a direction, do not deal against it: test it, sketch it, and board it beside one dealt alternative. If the project has a brand, its owned marks, colours and typefaces are binding, and the hand works on structure, scale, order and behaviour.

## 4. Derive the language

The chosen frame is the source of truth. The system is extracted from it. Load only what this direction uses.

| Deciding | Read |
|---|---|
| The grid, the forces pushed, the page as a sequence of scenes, the narrow screen as its own composition | [references/composition.md](references/composition.md) |
| The voice, the typeface, a type system small enough to recite, display and text craft | [references/typography.md](references/typography.md) |
| The colour strategy with its proportions, material and light, the medium, what to do with no assets | [references/colour-and-imagery.md](references/colour-and-imagery.md) |
| A drawing, generated surface, canvas, shader or 3D scene. Only when the direction needs one | [references/creative-coding.md](references/creative-coding.md) |
| What moves at all, the motion character, one interaction's whole life, choreography, scroll, the signature moment | [references/motion-direction.md](references/motion-direction.md) |
| The journey, what each section answers, state inventories | [references/experience-flow.md](references/experience-flow.md) |
| Tokens in three tiers, component contracts | [references/component-architecture.md](references/component-architecture.md), [assets/component-spec.md](assets/component-spec.md) |

Motion values are generated from one decision about character. They are not written by hand and not carried over from another project:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/motion_tokens.mjs" --action <dab|flick|glide|float|punch|slash|press|wring> --flow <bound|free>
```

Cast and time any sequence of two or more movers in [assets/motion-score.md](assets/motion-score.md) before coding it. The list of things that deliberately do not move is part of the design.

## 5. Build

- Use the project's stack and conventions. Real content, real routes, every state: loading, empty, error, success, disabled, long text.
- Native elements first (`button`, `a`, `dialog`, `details`, form controls). ARIA patterns only where native elements cannot do the job.
- Carry the device past the first screen. A device that shapes only the hero is a hero treatment.
- Compose the narrow screen again. It is not the wide one shrunk. Hover is never the only way to learn or do anything.
- Motion uses the generated tokens, one owner per animated property, the settled state as the base style, and cleanup for every listener, observer, loop, timeline and GPU resource. Recipes and library lifecycles: [references/motion-craft.md](references/motion-craft.md).
- For any single component, search the atlas for its job, states and tests. Do not read it whole, and do not take designs from it:
  ```bash
  grep -n "^### " "${CLAUDE_SKILL_DIR}/references/component-atlas.md" | grep -i "pricing"
  ```
  [references/component-atlas.md](references/component-atlas.md)

## 6. Clear the floor

Run what the project has (build, typecheck, lint, tests), then:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/slop_scan.mjs" . --strict                                        # exits 1 on any failure-class finding
node "${CLAUDE_SKILL_DIR}/scripts/audit_page.mjs" <url> [routes] --viewports 390x844,768x1024,1440x900
```

The ten hard gates, the failures that are fixed without exception, and the registry of defaults (first-order, the tasteful overcorrection, award-site imitation, and this skill's own attractor) are in [references/floor.md](references/floor.md). Every gate passes, or the report names the one that did not and why.

Engineering detail: [references/accessibility.md](references/accessibility.md) (WCAG 2.2 AA, plus 2.3.3 for large motion) · [references/responsive-engineering.md](references/responsive-engineering.md) · [references/performance-engineering.md](references/performance-engineering.md) · [references/security-and-integrity.md](references/security-and-integrity.md). Automated checks find candidates. Do the manual passes too: keyboard only, 200% zoom, reduced motion, touch.

Clearing the floor says nothing about whether the work is good. That is the next question.

## 7. Sit the jury

Follow [references/jury.md](references/jury.md). Judge the rendered work. Never judge from memory of the code.

```bash
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger load --reduced
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger "click:<selector>" --interrupt 120 --exit undo
```

1. **Evidence:** `first.jpg`, `flatplan.jpg` and `sheet.jpg` from the audit, its design facts and questions, and a `strip.jpg` for the entrance and for each designed interaction.
2. **Cold read:** from `first.jpg` alone, before reopening the brief, write what this is, its attitude, the one thing you will remember, and what shape survives the blur. Then read the flatplan for the peak and for screens that could be swapped.
3. **Twin test:** list what the page does that the twin does not. Differences of finish only mean the direction failed.
4. **Ten dimensions,** each marked weak, competent, strong or exceptional with one line of evidence. The register decides which must be strong. Nothing may be weak.
5. **Findings** with five parts: where, what is seen, why it weakens this work, the change, and its level (concept, system, execution). "Make it more premium" is not a finding.
6. **Verdict:** ship, refine (fix execution), rework (the device is right, the system does not carry it) or redirect (the idea is not strong enough: back to the hand). Rounds are limited, and what stays open is reported.

When a fresh context is available (a subagent, a second session, or the user), give it the evidence and [assets/jury-brief.md](assets/jury-brief.md) and nothing else until its cold read is written. Use it for XL work, and for L work with a new direction. Answer every question the tools raise, by changing the work or by writing the reason it stays.

## 8. Report

Use [assets/report-template.md](assets/report-template.md): the direction and the twin it had to beat, what changed, commands with their actual results, the jury's marks and verdict, open findings, what was not verified, and what needs the user. Never say a check passed unless it ran and passed.

## Load only what the task needs

| Task | Read | Skip |
|---|---|---|
| Fix or add one interaction or animation | motion-direction §2, §5 · motion-craft · `motion_strip.mjs` before and after | Direction, composition, colour |
| A scroll scene, shader, canvas or 3D piece | motion-direction §7 · creative-coding · performance-engineering | The atlas |
| A dashboard, application screen or admin tool | project-modes §8–9 · direction §11 · typography §4–6 · composition §8 · experience-flow | creative-coding, and the arrival and narrative motion layers |
| A brand, luxury, studio or campaign page | Every stage. composition, typography, colour-and-imagery, motion-direction | creative-coding unless a coded medium was dealt or chosen |
| An editorial or long-form piece | typography §6 · composition §5–6 · motion-direction §7 | |
| A restrained business or service site | project-modes §14 · direction §3 (the Quiet register) · typography | creative-coding, the signature moment |
| A design system | project-modes §12 · component-architecture · typography §4 · colour-and-imagery §3 | |
| An audit or critique | floor · jury · project-modes §13 | Direction, unless a redirect is the finding |

## Scripts

Run them. You do not need to read them. Each prints its usage with `--help`.

| Script | Purpose |
|---|---|
| `scripts/inspect_repo.mjs [dir]` | Read-only inventory: stack, styling, tokens, routes, motion code, git state |
| `scripts/slop_scan.mjs [dir] [--strict]` | Static scan of source for failures and default patterns |
| `scripts/deal.mjs hand\|swap\|record\|recent\|deck` | Deals lenses, structures and media; remembers what recent projects committed to |
| `scripts/sketch_board.mjs <frames…>` | Renders sketches side by side, wide, narrow and blurred, and measures whether they differ |
| `scripts/motion_tokens.mjs --action … --flow …` | Derives durations, curves, a spring, travel and stagger from a motion character |
| `scripts/audit_page.mjs <url…>` | Rendered audit: first screen, flatplan, contact sheet, design facts and questions, keyboard walk, reduced motion, overflow, targets, LCP and CLS |
| `scripts/motion_strip.mjs <url> --trigger …` | A moment in slow motion as a filmstrip, with what animated, interruption, the way back and layout shift |
| `scripts/contact_sheet.mjs <dir>` | Any folder of screenshots as one labelled sheet |

The rendered tools need Playwright. If it is missing, install it locally (`npm i -D playwright && npx playwright install chromium`) or in a scratch directory with `FF_PLAYWRIGHT_DIR` pointing at it. Never install packages globally. Without a browser, follow [references/direction.md](references/direction.md) §13 and state in the report which judgements were made without rendered evidence. Heavy WebGL can stall in a headless browser: check those in a headed one, or on a device.
