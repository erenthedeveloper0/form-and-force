---
name: form-and-force
description: Award-caliber creative direction, interface design and motion engineering for web experiences, carried from concept to verified code. Use when designing, building, redesigning, animating or critiquing websites, landing pages, portfolios, e-commerce, SaaS apps, dashboards, editorial or immersive WebGL experiences, design systems or custom React components, especially when the user wants work that is distinctive, premium, award-worthy or less generic/AI-looking, or asks for motion, scroll storytelling, page transitions, GSAP, Lenis, Three.js, View Transitions or micro-interactions, or for a UI/UX, accessibility, responsive or performance review of a frontend. Inspects the codebase first, generates and scores divergent concepts, defines a project-specific design and motion language, implements it in the existing stack, and verifies with bundled scripts (anti-slop source scan, rendered browser audit, contact sheets).
license: MIT
compatibility: Built for Claude Code (filesystem, shell, optional browser). Scripts need Node 18+; rendered audits need Playwright with Chromium installed locally in the project or a scratch directory.
metadata:
  version: "0.1.0"
---

# Form & Force

Make every project feel intentionally conceived by an exceptional creative team, then make it work like a thoroughly engineered product.

This skill is a working method, not a style. It must produce a restrained government-service flow, a dense analytics tool and an immersive WebGL launch with equal conviction. It must never make them look alike.

## Stance

- **Specific beats spectacular.** Originality means defensible, contextual decisions. Visual strangeness alone doesn't count. A quiet design can be the most original answer.
- **Derive, don't decorate.** Decisions come from the subject: its mechanism, artefacts, vernacular, audience tasks and real equity. Lists of things to avoid are checks applied *after* deriving, never the source of ideas. Every anti-default list breeds the next default.
- **Match the award winners on craft, beat them on access.** Across 15 Awwwards Site-of-the-Day winners with published developer scores, Animations/Transitions was the highest (or tied-highest) developer sub-score on 13, and Accessibility the lowest (or tied-lowest) on 14. Ship both.
- **Truth is non-negotiable.** No invented testimonials, logos, metrics, people or screenshots. No controls that do nothing. Claim nothing you did not verify.
- **Respect the existing project.** Inspect before acting. Keep working architecture and the user's uncommitted work. Add dependencies only for a stated need.

## Calibrate the engagement

Before starting, decide the **scope** and the **project mode**, then scale the workflow to fit. Never run the full ceremony on a button fix. Never skip concept work on a flagship page.

| Scope | Examples | Workflow depth |
|---|---|---|
| **S: Targeted fix** | Fix a jittery animation, restyle one component, a11y fix | Steps 0, 6, 7, 10. Concept work only if the change alters the design language |
| **M: Component / section** | New pricing table, custom slider, nav redesign | 0, 1 (light), 3 (extend the existing language), 5, 6, 7, 8, 10 |
| **L: Page / flow** | Landing page, checkout flow, onboarding | All steps; 3 territories for net-new art direction |
| **XL: Product / experience** | Full site, redesign, design system, immersive launch | All steps, full concept exploration, multiple critique rounds |

Project modes (marketing, studio/portfolio, e-commerce, SaaS app, dashboard/data, editorial, immersive/WebGL, design system, redesign of existing, prototype, campaign) change priorities, motion budget, density and what "excellent" means. **Read [references/project-modes.md](references/project-modes.md) for the matching mode before concept work on any L/XL task.**

When the brief is vague ("make it premium"), first convert it into a precise creative problem (Step 1). Ask the user only about facts that block the work and cannot be discovered. These are things like real proof assets, legal constraints and brand rules. For everything else, state a reasonable assumption and proceed.

## Workflow

Copy this checklist into your working notes for L/XL tasks and keep it updated:

```
Form & Force progress
- [ ] 0 Inspect: repo inventory, constraints, protected files
- [ ] 1 Understand: project DNA, users, journeys, truth inventory
- [ ] 2 Concept: tension → 3 territories → scored → chosen → hypothesis
- [ ] 3 Language: tokens, type, color, material, composition, motion identity, anti-references
- [ ] 4 Flow: journey map, section logic, state inventories
- [ ] 5 Motion spec: hierarchy, choreography, signature moment, reduced-motion path
- [ ] 6 Build: components, real states, real content, responsive
- [ ] 7 Verify: build/typecheck/tests, slop_scan, audit_page, contact sheet
- [ ] 8 Critique: 8 originality tests + scorecard + a11y/perf gates
- [ ] 9 Refine: fix findings, re-verify (loop until gates pass)
- [ ] 10 Report: changes, evidence, limits, open questions
```

### Step 0: Inspect before deciding

Run the inventory. It is read-only, never opens secret files, and lists uncommitted work:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/inspect_repo.mjs" .
node "${CLAUDE_SKILL_DIR}/scripts/slop_scan.mjs" .        # baseline triggers before you change anything
```

(`${CLAUDE_SKILL_DIR}` is this skill's directory. Outside Claude Code, substitute the path where this SKILL.md lives.)

Then read the files that define the design: tokens and global CSS, layout, two or three representative components, and any existing animation code. Note what must be preserved. Details: [references/repository-workflow.md](references/repository-workflow.md).

### Step 1: Understand the project's DNA

Extract purpose, business model, audiences and their tasks, key journeys, conversion or product goals, brand character, available assets, content, constraints and accessibility needs. Build a **truth inventory** of what proof actually exists (customers, numbers, quotes, screenshots, imagery) and what is missing. Missing proof becomes a designed, labelled slot. It is never invented.

### Step 2: Concept with the Context-to-Concept Engine

For L/XL work, follow [references/creative-process.md](references/creative-process.md) in full. In short:
1. **Find the creative tension** inside this project (for example precision vs. warmth, scale vs. intimacy) and explain why it is *this* project's tension.
2. **Log first instincts** for layout, palette, type, motion and signature moment. Check each against the known-defaults lists in [references/anti-slop-constitution.md](references/anti-slop-constitution.md). Keep one only with a written project reason.
3. **Generate three territories** that differ in *structure, interaction and visual reasoning*, not just palette or light/dark. Each gets a thesis, metaphor, composition, type, colour and material, motion philosophy, signature interaction, flow and a representative custom component.
4. **Score** each one on originality, context fit, usability, feasibility and coherence potential. Choose by critique, not by flash.
5. **State a testable design hypothesis** and how you will evaluate it.

### Step 3: Write the design language

Define it before building sections: grid and composition logic, density, type roles and scale, semantic colour, surfaces and materials, borders and elevation, imagery direction, iconography, motion identity, interaction feedback, responsive transformations and accessibility behaviours. Express it as **tokens that encode the concept**. Do not rename framework defaults. Add an **anti-reference list**: the tempting generic moves this concept must resist. See [references/visual-implementation.md](references/visual-implementation.md) and [references/component-architecture.md](references/component-architecture.md).

### Step 4: Design the flow

Map the journey before polishing screens. For each route or step, record intent, needed information, primary and secondary actions, next state, failure points and orientation cues. Every section must answer a question the previous one raised. Every visible control has a state model and a real result. Build state inventories for complex components. See [references/experience-flow.md](references/experience-flow.md).

### Step 5: Specify motion

Define the motion identity (character, rhythm, physicality) and the four-level hierarchy:
1. Experience transitions
2. Section and narrative motion
3. Component motion
4. Micro-interactions

Specify each major sequence: trigger, states, timing, easing, stagger, interruption, reversal, reduced-motion alternative, mobile adaptation and test method. Identify at most one or two **signature moments** that only this project could have. Read [references/motion-intelligence.md](references/motion-intelligence.md) for the method and [references/motion-implementation.md](references/motion-implementation.md) for code patterns and library lifecycles.

### Step 6: Build

- Use the project's stack and conventions. Choose the smallest reliable technique that expresses the concept: CSS → WAAPI and native scroll/view transitions → GSAP/Motion → canvas/WebGL.
- Composition first, decoration last. Real content, real states (loading, empty, error, success, disabled, long text), real routing.
- Semantic HTML and native elements first (`button`, `a`, `dialog`, `details`, form controls). Use ARIA patterns only where native elements can't do the job.
- One owner per animated property. Every effect, listener, observer, rAF loop, timeline and WebGL resource has cleanup.
- Mobile is re-sequenced, not shrunk. Hover is never the only way to discover or operate something.

Component-specific guidance (what's generic, what's stronger, and when convention is right) lives in [references/anti-slop-component-atlas.md](references/anti-slop-component-atlas.md). Search it by component name instead of reading it whole:

```bash
grep -n "^### " "${CLAUDE_SKILL_DIR}/references/anti-slop-component-atlas.md" | grep -i "pricing"
```

### Step 7: Verify with evidence

Run what the project has (build, typecheck, lint, tests), then the bundled checks:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/slop_scan.mjs" . --strict      # C findings must be zero
node "${CLAUDE_SKILL_DIR}/scripts/audit_page.mjs" http://localhost:3000 [more routes] \
     --viewports 390x844,768x1024,1440x900
```

`audit_page.mjs` writes viewport screenshots, scroll sequences, a reduced-motion capture, a keyboard focus walk, overflow, target size, contrast candidates, landmarks, LCP/CLS and console errors. It also writes a **`sheet.jpg` contact sheet: view it** to critique the whole responsive and scroll sequence at once. If Playwright isn't installed, install it locally (`npm i -D playwright && npx playwright install chromium`) or in a scratch directory and set `FF_PLAYWRIGHT_DIR`. Never install packages globally.

Automated checks find candidates. They don't certify conformance. Also do the manual checks in [references/accessibility.md](references/accessibility.md): keyboard-only pass, screen-reader spot check, 200% zoom, reduced motion, and touch.

### Step 8: Critique like a jury, and like an auditor

Apply the **eight originality tests** to the proposal and to the built result:

1. **Substitution:** swap the name, logo and primary colour. Does it still fit an unrelated company?
2. **Concept:** can you state the idea in one sentence *and* point to the elements that express it?
3. **Interaction:** does the main interaction communicate, orient or make a task easier?
4. **Removal:** remove an effect, card or animation. Does anything important get worse?
5. **Coherence:** is it one system with meaningful variation?
6. **Completion:** are routes, controls and states all real?
7. **Mobile reality:** does it work narrow, by touch, without hover, with reduced motion, on a slow device?
8. **Reference distance:** can you describe it without naming the reference it resembles?

Then score with the scorecard in [references/quality-gates.md](references/quality-gates.md). It mirrors the Awwwards weighting (Design 40, Usability 30, Creativity 20, Content 10) and the six developer axes, plus hard gates. Be severe: a reviewer who "finds nothing" has not looked.

### Step 9: Refine

Fix every C finding. Resolve or justify every B and A finding. Re-run the checks. Iterate until the gates in quality-gates.md pass, or report precisely why one cannot pass.

### Step 10: Report

Use the template in [assets/report-template.md](assets/report-template.md). It covers the concept and hypothesis, meaningful files changed, commands run with their **actual** results, what was verified and how, what was not verified, known limitations, and decisions that need the user. Never say a check passed unless it ran and passed.

## Default-pattern policy (summary)

| Category | Meaning | Action |
|---|---|---|
| **A: Review trigger** | A high-frequency default appears: centred hero with two CTAs, the hero/features/testimonials/pricing/FAQ/CTA stack, violet gradients, glass, glows, orbs, identical rounded cards, stock icons, eyebrow chrome, fade-up on everything, cursor gimmicks, smooth scroll by habit, generic copy | Keep only with a written project reason. Otherwise replace |
| **B: Combined sameness** | Three or more A-patterns together | Justify each one, or redesign the cluster |
| **C: Failure** | Broken or dead controls, fake proof, false claims, unusable mobile, inaccessible essential actions, hidden focus, blocked zoom, incomplete critical flows, unresolved console errors, untested features described as done | Fix. No exceptions |

The policy also covers **second-order defaults** (cream with serif and terracotta; near-black with an acid accent; hairline broadsheet; template chrome) and **award-site defaults** (lime on black, floating pill nav, Enter gates, preloaders, smooth scroll everywhere, rotating hero objects). They are treated the same way. Full policy, decision procedure and examples: [references/anti-slop-constitution.md](references/anti-slop-constitution.md).

## Engineering floor (always)

- **Accessibility:** target WCAG 2.2 AA, and also honour 2.3.3 for large motion. Visible focus, logical order, focus not obscured, targets ≥ 24×24 px, labelled controls, one `h1` plus landmarks, zoom never blocked, and a complete reduced-motion path that *replaces* motion without removing content or controls. [references/accessibility.md](references/accessibility.md)
- **Responsive:** design narrow first for content order. Use container queries for components and input-mode queries (`hover`, `pointer`). Test 360–430, ~768, ~1024 and ≥ 1440 px, plus landscape phone. [references/responsive-engineering.md](references/responsive-engineering.md)
- **Performance:** p75 targets are LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Never lazy-load the LCP element. Load heavy 3D and media lazily with a meaningful poster. Set budgets per mode. [references/performance-engineering.md](references/performance-engineering.md)
- **Security and integrity:** no secrets in client bundles, sanitised HTML sinks, vetted third-party scripts, and honest content and claims. [references/security-and-integrity.md](references/security-and-integrity.md)

## Bundled resources

| Need | File |
|---|---|
| Mode-specific priorities, budgets and pitfalls | [references/project-modes.md](references/project-modes.md) |
| Concept engine, territories, originality mechanism | [references/creative-process.md](references/creative-process.md) |
| Failure classes, A/B/C policy, defaults lists, originality tests | [references/anti-slop-constitution.md](references/anti-slop-constitution.md) |
| Per-component encyclopedia (180 components, 12 families) | [references/anti-slop-component-atlas.md](references/anti-slop-component-atlas.md) |
| Motion method: identity, hierarchy, choreography, signature, scroll, transitions | [references/motion-intelligence.md](references/motion-intelligence.md) |
| Motion code: CSS, WAAPI, View Transitions, scroll-driven, GSAP/useGSAP, Lenis, Motion, three.js lifecycle | [references/motion-implementation.md](references/motion-implementation.md) |
| Journeys, section logic, state inventories | [references/experience-flow.md](references/experience-flow.md) |
| Tokens, component specs, design-system architecture | [references/component-architecture.md](references/component-architecture.md) |
| Inspect-first repo workflow, dependency policy | [references/repository-workflow.md](references/repository-workflow.md) |
| Composition, typography, imagery, materials in code | [references/visual-implementation.md](references/visual-implementation.md) |
| Accessibility / responsive / performance / security | the four engineering references above |
| Scorecard, critique protocol, definition of done | [references/quality-gates.md](references/quality-gates.md) |
| Templates | [assets/creative-brief.md](assets/creative-brief.md) · [assets/motion-spec.md](assets/motion-spec.md) · [assets/component-spec.md](assets/component-spec.md) · [assets/report-template.md](assets/report-template.md) |

**Scripts** (run them; you don't need to read them):

| Script | Purpose |
|---|---|
| `scripts/inspect_repo.mjs [dir] [--json]` | Read-only stack, styling, motion, tokens, routes, scripts and git inventory |
| `scripts/slop_scan.mjs [dir] [--strict] [--json]` | Static A/B/C triggers: generic patterns, fake functionality, a11y and motion hazards |
| `scripts/audit_page.mjs <url…> [--viewports …]` | Rendered audit: screenshots, contact sheet, keyboard walk, reduced motion, overflow, targets, LCP/CLS, errors |
| `scripts/contact_sheet.mjs <dir>` | Compose any folder of screenshots into one labelled sheet |
