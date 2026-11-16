# Quality: the floor and the jury

Form & Force checks work twice, in two different ways, and never mixes them. **The floor** asks whether anything is broken: ten pass-or-fail gates. **The jury** asks whether the work is good: a judgement of the rendered page, made from evidence. Clearing the floor says nothing about quality, and a beautiful page that fails a gate does not ship.

## The floor

[floor.md](../../skills/form-and-force/references/floor.md)

| # | Gate | Evidence |
|---|---|---|
| G1 | No failures (the list below) | `slop_scan.mjs --strict` exits 0, plus a manual read of anything the scan did not read |
| G2 | Build, typecheck and lint pass, or existing failures are documented as not introduced | Command output |
| G3 | No console errors or uncaught exceptions from project code on audited routes | `audit_page.mjs` |
| G4 | No horizontal overflow at 360 to 430 px; zoom is not blocked | `audit_page.mjs` |
| G5 | Every primary task completes by keyboard; focus is visible and never obscured | The audit's focus walk and a manual pass |
| G6 | One `h1` and landmarks per page; every control has a name; images have alt text | Audit and a manual pass |
| G7 | The reduced-motion version keeps all content and controls, and large motion is replaced | `motion_strip.mjs --reduced` and a manual pass |
| G8 | Every visible control does something real, or is a labelled, bounded demo | A walk through the flows |
| G9 | No fabricated proof and no unsupported claims | Content checked against the truth inventory |
| G10 | The mode's performance budget is met in the lab, or the overage is explained with a plan | Audit LCP and CLS |

**Failures fixed without exception:** controls that go nowhere; deceptive interaction; fabricated testimonials, logos, metrics or screenshots; layouts unusable on a phone; essential actions unreachable by keyboard, screen reader or touch; critical flows left incomplete; console errors from the project's own code; features described as complete that were not tested; large motion with no reduced version; placeholder content in a deliverable; secrets in client-side code.

### The static scan

```bash
node scripts/slop_scan.mjs .            # the baseline, before anything changes
node scripts/slop_scan.mjs . --strict   # before handing over
```

It reads source files and server-rendered templates (Blade, ERB, EJS, Twig, Nunjucks, Jinja, Handlebars, Mustache, Liquid) and reports three classes: **C** failures to fix, **B** combined sameness (many defaults at once), and **A** review triggers, which are fine when the direction justifies them. Every run states its **coverage** (`complete`, `partial`, `incomplete` or `empty`), because a zero means nothing about files that were not read. With `--strict` it exits 1 on any C finding and 2 when templates were left unread.

### The registry of defaults

Floor §6 lists the patterns that are common because they are easy: first-order defaults (the centred hero, three cards, a violet gradient), the tasteful overcorrection (cream and serif as the "premium" answer), award-site imitation, and **this skill's own attractor**, the habits Form & Force itself drifts toward. They are checks run on finished work, never a source of ideas: a list of things to avoid yields the nearest thing not on it.

## The rendered audit

```bash
node scripts/audit_page.mjs http://localhost:3000 /pricing /checkout --viewports 390x844,768x1024,1440x900
```

One run collects two kinds of evidence. **What a jury would see:** `first.jpg` (the first screen at every width, with a blurred copy), `flatplan.jpg` (every screen in order), `sheet.jpg` (scroll and responsive contact sheet), and design facts (scale contrast, type economy, alignment, pacing, repetition, balance, colour commitment, layering, media and motion inventory) phrased as questions. **What an auditor checks:** console errors, overflow, focus visibility, target size, landmarks, the reduced-motion response, LCP and CLS, and the libraries in use.

The checks are heuristics: they flag candidates and do not certify conformance or field performance. The design facts are questions, never verdicts; how they were calibrated, and what they cannot see, is in [instrument calibration](../../research/INSTRUMENT_CALIBRATION.md).

## The jury

[jury.md](../../skills/form-and-force/references/jury.md) · [jury-brief.md](../../skills/form-and-force/assets/jury-brief.md)

The jury judges the rendered work, never its memory of the code.

1. **Evidence:** `first.jpg`, `flatplan.jpg`, `sheet.jpg`, the design facts, and a filmstrip for the entrance and each designed interaction.
2. **Cold read:** from `first.jpg` alone, before reopening the brief: what this is, its attitude, the one thing you will remember, and what shape survives the blur.
3. **Twin test:** what the page does that the twin does not. Differences of finish only mean the direction failed.
4. **Ten dimensions,** each marked weak, competent, strong or exceptional with one line of evidence: creative identity, concept, composition, typography, coherence, interaction, motion, craft, usability, technical quality. The register decides which must be strong. Nothing may be weak.
5. **Findings,** each with five parts: where, what is seen, why it weakens this work, the change, and its level (concept, system or execution). "Make it more premium" is not a finding.
6. **Verdict:**

| Verdict | When | Next |
|---|---|---|
| **Ship** | The floor passes, nothing is weak, every dimension the register requires is strong | Report |
| **Refine** | Direction and system hold; execution findings remain | Fix, regather, judge again |
| **Rework** | The device is right; the system built from it does not carry it | Back to the chosen frame |
| **Redirect** | No idea of its own, or the device costs the visitor more than it gives | Back to the hand |

Rounds are limited (one for M, two for L, three for XL), with one redirect per engagement. For XL work, and L work with a new direction, the jury sits in a **fresh context** (a subagent, a second session or you) that sees only the evidence and the jury brief until its cold read is written, because whoever wrote the rationale finds the result convincing.

## The report

[report-template.md](../../skills/form-and-force/assets/report-template.md)

The direction and the twin it had to beat, what changed, every command with its actual result, the jury's marks and verdict, the open findings, what was not verified, and what needs your decision. A check that did not run is reported as not run. Nothing is called passed unless it ran and passed.
