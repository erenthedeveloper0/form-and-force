# Quality gates

A severe, evidence-based quality framework. It borrows the Awwwards jury's structure to raise the bar. **No process can guarantee an award.** The goal is to measure what can be measured and to never declare work finished while meaningful problems remain.

## Contents
1. Gate structure
2. Hard gates (must pass)
3. The scorecard
4. Scoring anchors
5. Critique protocol (six lenses)
6. Severity scale
7. Iteration loop and stop conditions
8. Definition of done
9. Honesty rules for self-critique
10. Score report format

---

## 1. Gate structure

```
Hard gates (binary)  →  Scorecard (1–10, weighted, evidence-backed)  →  Findings triage (severity)  →  Iterate
```
Work is not done until all hard gates pass and the scorecard meets the mode's threshold, or you have reported exactly why a gate can't pass.

## 2. Hard gates

| # | Gate | Evidence |
|---|---|---|
| G1 | **Zero Category C findings** (constitution §3) | `slop_scan.mjs --strict` exit 0, plus manual review of the C list |
| G2 | Build, typecheck and lint pass (or pre-existing failures documented as not introduced) | command output |
| G3 | No console errors or uncaught exceptions from project code on audited routes | `audit_page.mjs` |
| G4 | No horizontal overflow at 360–430 px; no blocked zoom | `audit_page.mjs` |
| G5 | Keyboard: every primary task completes; focus visible, not obscured, never on invisible elements | audit focus walk + manual pass |
| G6 | One `h1` and landmarks per page; all controls named; images have alt | audit + manual |
| G7 | Reduced-motion path reviewed: content and controls intact; large motion replaced | reduced-motion frame in `sheet.jpg` + manual |
| G8 | Every visible control does something real (or is a labelled, bounded demo) | flow walk |
| G9 | No fabricated proof or unsupported claims | content review against the truth inventory |
| G10 | Performance budget met in lab, or the overage explained with a plan | audit LCP/CLS + Lighthouse/trace if available |

## 3. The scorecard

Two parts that mirror the Awwwards structure: a **site score** (four weighted criteria) and an **engineering score** (six developer axes). Score each from 1 to 10 with **one line of evidence per score**. A score without evidence doesn't count.

**Site score** (weights as published by Awwwards):

| Criterion | Weight | What you are judging |
|---|---|---|
| Design | 40% | Composition, hierarchy, typography, colour, imagery, coherence, detail, consistency across screens and states |
| Usability | 30% | Task clarity, navigation and orientation, responsiveness, feedback, accessibility as experienced, speed as experienced |
| Creativity | 20% | Concept originality, a signature moment derived from the subject, distance from references and defaults |
| Content | 10% | Truthful, specific, well-written copy; real proof; media quality; voice consistency |

**Engineering score** (the six Awwwards developer sub-criteria):

| Axis | What you are judging |
|---|---|
| Semantics / SEO | Headings, landmarks, meaningful HTML, titles and meta descriptions, crawlable content (even for WebGL) |
| Animations / Transitions | Purposeful, smooth, interruptible, cleaned up, reduced-motion path, no jank |
| Accessibility | Keyboard, focus, names, contrast, forms, motion, touch: measured *and* manually checked |
| WPO (performance) | LCP, INP, CLS, bundle size, asset optimisation, memory stability |
| Responsive design | Transformed (not shrunk) layouts, input modes, art direction, no overflow |
| Markup / Meta-data | Valid structure, OG/social meta, favicon/manifest, lang, structured data where relevant |

**Thresholds** (adjust per mode and record the choice):
- L/XL creative work: site score ≥ 8.0 weighted; no criterion below 7.
- App or dashboard work: Usability ≥ 8.5; Design ≥ 7.5; Creativity is judged on clarity of the interaction model.
- **Accessibility must be ≥ 8 and must not be the lowest engineering axis.** On 14 of 15 award winners sampled it was the lowest or tied-lowest; here it never is.
- Any axis below 6 is a blocker regardless of the weighted total.

## 4. Scoring anchors

| Score | Design | Usability | Creativity | Content |
|---|---|---|---|---|
| **4** | Template look; weak hierarchy; inconsistent | Users get lost; broken on mobile | Generic; registry defaults throughout | Placeholder or clichéd; fake proof |
| **6** | Clean but forgettable; some drift | Works on the happy path; gaps in states or keyboard | One idea, unevenly applied | Accurate but generic voice |
| **8** | Distinct, coherent, detailed; one memorable composition | Clear, fast, complete states; strong keyboard and touch | Concept visible in structure, type and motion; signature moment earned | Specific, credible, well-edited; real proof |
| **10** | Exceptional craft at every scale and state | Effortless; inclusive by design; zero friction on the core task | Defines its own territory; impossible to transplant | Exemplary writing and media; content *is* the experience |

Engineering anchors: **6** = works with notable gaps; **8** = solid, measured, minor issues; **10** = exemplary and verified across devices and assistive tech.

## 5. Critique protocol (six lenses)

Run all six on the rendered result (contact sheets plus a live walk), not on the code alone. Each lens must produce findings or explicitly say "no findings, after checking X, Y, Z".

1. **Jury lens (first 10 seconds and the signature moment).** Is the concept recognisable without explanation? Is there one memorable moment? Does anything feel borrowed? Run substitution and reference-distance tests.
2. **User lens (task).** Pick the primary journey; complete it on a phone-sized viewport with touch emulation, then with keyboard only. Note every hesitation.
3. **Slop lens.** Check the registries (constitution §4), the removal test and the coherence test. Review `slop_scan` A/B triggers and decide each one (keep with reason / replace / remove).
4. **Auditor lens (a11y and performance).** Hard gates G3–G7 and G10; the reduced-motion frame; contrast candidates over media checked by eye; long tasks.
5. **Engineer lens.** Cleanup on unmount, one owner per animated property, no `transition: all`, no layout-property animation, typed contracts, no dead code, no secret exposure.
6. **Content lens.** Truth inventory reconciled; copy specific (user, task, object, result); voice consistent; error and empty-state copy helpful.

## 6. Severity scale

| Severity | Definition | Action |
|---|---|---|
| **Blocker** | Any Category C failure; any hard-gate failure; any axis < 6 | Fix before handoff |
| **Major** | Hurts the core task, coherence or concept (generic hero, missing key state, motion that blocks reading, focus obscured on mobile) | Fix in this iteration |
| **Minor** | Noticeable craft issue (spacing drift, a weak empty state, a stagger too long) | Fix if time permits; otherwise list |
| **Polish** | Refinement that elevates (optical alignment, easing nuance, micro-copy) | List or do opportunistically |

## 7. Iteration loop and stop conditions

```
loop:
  run hard gates → fix blockers
  render → contact sheets → six-lens critique → triage
  fix blockers + majors → re-run affected checks
  re-score (evidence required)
until: all hard gates pass AND thresholds met
   or: remaining issues need user input (assets, decisions, access) → report them precisely
   or: three iterations without improvement on the same issue → change approach (not effort)
```

## 8. Definition of done

- [ ] All hard gates pass (or documented exceptions the user must decide on).
- [ ] Scorecard meets thresholds with evidence lines.
- [ ] Concept, hypothesis and design language documented (in the repo if the project keeps design docs, otherwise in the report).
- [ ] Motion specs exist for Level 1–2 sequences; reduced-motion path reviewed.
- [ ] State inventories built for complex components.
- [ ] Contact sheets reviewed for every changed route at 3+ widths.
- [ ] No placeholder content or media remains unless explicitly labelled and reported.
- [ ] Report written with actual command results and known limitations.

## 9. Honesty rules for self-critique

- Look at the rendered result (`sheet.jpg`, live page) **before** scoring. Never score from code alone.
- Find at least three concrete issues per lens on a first pass of L/XL work. If you find fewer, you probably haven't looked hard enough.
- Score what is there, not what you intended. Intent goes in the hypothesis; evidence goes in the score.
- Don't inflate. An 8 requires the anchor's description to be true. "Pretty good" is a 6 or 7.
- Lab numbers are lab numbers. Don't present them as user experience.
- If something wasn't tested, say so in the score line ("Accessibility 7: keyboard and automated checks pass; no screen-reader testing").

## 10. Score report format

```
Site score (weighted): 8.1   Design 8.3 · Usability 8.0 · Creativity 8.4 · Content 7.6
  Design 8.3: ledger-line grid holds across 4 routes; type scale consistent; minor drift in footer spacing (sheet.jpg row 390)
  Usability 8.0: checkout completes by keyboard and touch; empty cart state helpful; filter sheet lacks result count
  ...
Engineering: Semantics 8 · Animations 8.5 · Accessibility 8.5 · WPO 7.5 · Responsive 8 · Markup 8
  WPO 7.5: lab LCP 2.1 s mobile (headless, unthrottled); 3D chunk 410 KB lazy after poster; no field data
Hard gates: G1–G9 pass · G10 pass (lab)
Open: real customer quotes pending (slot labelled); screen-reader pass not performed
```
