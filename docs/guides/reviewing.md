# Reviewing existing work

Asked to "audit this" or "critique this", Form & Force reviews what exists and redesigns nothing uninvited. The review uses the same instruments and the same jury as a build, so its findings are evidence, not opinion. The agent follows the review path in [SKILL.md](../../skills/form-and-force/SKILL.md#1-size-the-job) and [project-modes.md §13](../../skills/form-and-force/references/project-modes.md#13-redesign-or-audit-of-an-existing-product).

## What it does

1. **Reads** the repository, if there is one: `inspect_repo.mjs` for the stack and git state, `slop_scan.mjs` for failures and default patterns, with its coverage stated.
2. **Gathers rendered evidence** with `audit_page.mjs` on the routes that matter, at narrow and wide widths, and filmstrips of the entrance and the main interactions with `motion_strip.mjs`.
3. **Runs the floor** on what exists: each of the ten gates passes or fails, with evidence.
4. **Sits the jury**: cold read, twin test, ten dimensions with evidence, findings with a location and a change, and a verdict.
5. **Reports** the findings in order of level (concept, system, execution) and severity. It does not change code unless you ask.

## Asking for a review

```text
Audit https://example.com/pricing and /checkout. Report only; do not change anything.
```

```text
Critique the landing page in this repo against its brief in docs/brief.md.
Tell me whether the idea is strong enough before we polish anything.
```

Say whether you want **a report only** or **fixes for the failures** (C findings and failed gates). Redesign is a separate decision: if the finding is that the idea itself is weak (a *redirect* verdict), the review says so and stops there.

## What a review can reach

A review can conclude that a clean, well-built page has no idea of its own. That is the purpose of the twin test: a page whose only differences from the twin are of finish fails the concept dimension however well it is executed. The eval case `jury-rejects-the-twin` exists to test exactly this behaviour.

## What it cannot see

- Field performance: LCP and CLS are measured once, in a lab.
- Behaviour that needs a person: how motion feels at speed, under a thumb, on the fiftieth use; screen-reader experience beyond what automated checks and a focus walk show.
- Heavy WebGL in a headless browser, which can stall at the loader. The report says so and asks for a check in a headed browser or on a device.

## For the agent

[floor.md](../../skills/form-and-force/references/floor.md) · [jury.md](../../skills/form-and-force/references/jury.md) · [project-modes.md §13](../../skills/form-and-force/references/project-modes.md#13-redesign-or-audit-of-an-existing-product) · [report-template.md](../../skills/form-and-force/assets/report-template.md)
