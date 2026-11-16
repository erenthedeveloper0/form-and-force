# Building

Form & Force builds in your project's stack, with your conventions, and leaves your work intact. This guide covers how the agent treats an existing repository, how it builds components, and the engineering references behind the floor.

## Respect the project

[repository-workflow.md](../../skills/form-and-force/references/repository-workflow.md)

- **Inspect before acting.** `inspect_repo.mjs` reads the stack, package manager, styling, component and motion libraries, routes, tokens, fonts, assets, scripts, test tooling and git state, read-only. It never opens `.env` or credential files; it only lists that they exist.
- **Read the design-defining files** (tokens and global styles, the layout, two or three components, existing motion code) and note what must be preserved.
- **Protect existing work.** Uncommitted changes are preserved; files are not reformatted wholesale.
- **Keep working architecture.** Use the lowest tool that carries the idea. A dependency is added only for a stated need, never installed globally.
- **Run what the project has**: its build, typecheck, lint and tests.

## Build rules

From [SKILL.md §5](../../skills/form-and-force/SKILL.md#5-build):

- Real content, real routes, every state: loading, empty, error, success, disabled, long text.
- Native elements first (`button`, `a`, `dialog`, `details`, form controls). ARIA patterns only where native elements cannot do the job.
- Carry the device past the first screen.
- Compose the narrow screen again. Hover is never the only way to learn or do anything.
- Motion uses the generated tokens, one owner per animated property, the settled state as the base style, and cleanup for every listener, observer, loop, timeline and GPU resource.
- No fabricated proof: missing testimonials, logos, metrics or screenshots become labelled slots.

## Components and the atlas

[component-atlas.md](../../skills/form-and-force/references/component-atlas.md) · [atlas reference](../reference/component-atlas.md)

The component atlas holds 180 components in 12 sections, from page templates and navigation to data grids, checkout and bottom sheets. Each entry says what the component is really for, the common default and why it fails, ways out (to re-derive, never to copy), when to keep the convention, how to decide, its content, motion, responsive and accessibility requirements, the states and edge cases to build, implementation notes, how to test it, and whether a failure is a review trigger (A) or a hard failure (C).

The agent searches it for the one component it is building, and never reads it whole or takes designs from it:

```bash
grep -n "^### " references/component-atlas.md | grep -i "pricing"
grep -n -A 16 "^### Pricing tables" references/component-atlas.md
```

For custom components it writes a spec first, with a state inventory and a typed contract ([template](../reference/templates.md#component-spec)).

## Engineering references

| Reference | Covers |
|---|---|
| [accessibility.md](../../skills/form-and-force/references/accessibility.md) | WCAG 2.2 AA (plus 2.3.3 for large motion): semantics, names, keyboard and focus, overlays, forms, contrast, motion, touch, media, WebGL experiences, the testing protocol, honest reporting |
| [responsive-engineering.md](../../skills/form-and-force/references/responsive-engineering.md) | Ranges to design and test, transforming instead of shrinking, layout techniques, input modes, mobile patterns, motion across devices, art direction |
| [performance-engineering.md](../../skills/form-and-force/references/performance-engineering.md) | Budgets by mode, LCP, INP, CLS, bundles, fonts and images, motion and rendering cost, WebGL, memory, third-party scripts, measuring honestly |
| [security-and-integrity.md](../../skills/form-and-force/references/security-and-integrity.md) | Secrets, client-side exposure, untrusted HTML, forms, third-party embeds, redirects, dependencies, content integrity, no dark patterns, honest reporting |

These are the detail behind the floor's gates ([quality](quality.md)). Automated checks find candidates; the manual passes (keyboard only, 200 % zoom, reduced motion, touch) are done too.

## Greenfield projects

With no project to inspect, the agent chooses the lightest stack that fits the mode and says why: a static page may be plain HTML, CSS and JavaScript or Astro; an application with routing and state may be React with Vite or Next.js. It sets up typecheck, lint, a build and Playwright from the start, creates tokens before components, and writes an `.env.example`, never secrets ([repository-workflow.md §8](../../skills/form-and-force/references/repository-workflow.md#8-greenfield-projects)).
