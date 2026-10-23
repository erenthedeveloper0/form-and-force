<p align="center">
  <img src="assets/banner.webp" alt="Form & Force: Creative Engineering Intelligence" width="100%">
</p>

<p align="center">
  <a href="#install">Install</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#quick-start">Quick start</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="docs/installation.md">Docs</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="research/README.md">Research</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="CHANGELOG.md">Changelog</a>
  <br><br>
  <a href="https://github.com/erenthedeveloper0/form-and-force/actions/workflows/ci.yml"><img src="https://github.com/erenthedeveloper0/form-and-force/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status"></a>
</p>

Form & Force is an Agent Skill and Claude Code plugin that takes web work from creative concept to verified code: creative direction, interface design and motion engineering. It is free and open source under the [MIT License](LICENSE).

## What it does

Form & Force gives Claude a working method for frontend work: marketing sites, portfolios, e-commerce, SaaS apps, dashboards, editorial pieces, immersive WebGL and design systems. Claude scales the method to the job: a one-component fix gets a short pass, a flagship page gets the full process.

1. **Inspect** the existing repository before deciding anything.
2. **Understand** the project: audiences, journeys, and what proof actually exists.
3. **Concept**: generate three divergent territories from the subject itself, score them and choose one.
4. **Define** a project-specific design and motion language, expressed as tokens.
5. **Build** in the project's existing stack, with real states and real content.
6. **Verify** with bundled scripts: a static anti-slop scan and a rendered browser audit with contact sheets, a keyboard walk and a reduced-motion pass.
7. **Critique, refine and report** only what actually ran.

## How it differs from generic AI website generators

- **Derived, not decorated.** Decisions come from the subject's mechanism, materials, vocabulary and real brand equity. Lists of "AI defaults" are used as checks after the work, never as the source of ideas.
- **No fabrication.** It never invents testimonials, logos, metrics or screenshots. Missing proof becomes a labelled slot.
- **Your stack, your code.** It inspects first, keeps working architecture and uncommitted work, and adds dependencies only for a stated need.
- **Accessibility as a floor.** In the bundled research, across 15 Awwwards Site of the Day winners with published developer scores, Accessibility was the lowest or tied-lowest developer sub-score on 14 ([research ledger](research/RESEARCH_LEDGER.md)). The skill targets WCAG 2.2 AA and a full reduced-motion path.
- **Honest reporting.** Checks find candidates; the report says what ran, what passed and what was not verified.

## Core capabilities

- Concept engine with divergent territories, scoring and a testable design hypothesis.
- Anti-slop policy: A/B/C categories for default patterns, plus an atlas of 180 components in 12 families covering what is generic, what is stronger, and when convention is right.
- Motion method (identity, hierarchy, choreography, signature moments) and implementation patterns for CSS, WAAPI, View Transitions, scroll-driven animation, GSAP with `useGSAP`, Lenis, Motion and three.js.
- Engineering references for accessibility, responsive design, performance (Core Web Vitals) and security.
- Bundled Node scripts: `inspect_repo.mjs` (read-only inventory), `slop_scan.mjs` (static scan), `audit_page.mjs` (rendered audit with Playwright) and `contact_sheet.mjs`.

## Compatibility

| Environment | Status (checked 2026-10-23) |
|---|---|
| Claude Code plugin, from a local clone of this repository | Verified with Claude Code 2.1.308: `claude plugin validate --strict .` passes. The plugin installs from a local marketplace, is enabled, and is detected as one skill. Loading in a live session was not tested. |
| Claude Code plugin, from GitHub | Verified with Claude Code 2.1.308 in a clean configuration: `claude plugin marketplace add erenthedeveloper0/form-and-force` and `claude plugin install form-and-force@form-and-force` succeed, and the plugin is enabled at 0.1.0. Loading in a live session was not tested. |
| Personal or project skill (copy `skills/form-and-force`) | Structure validated; loading in a session not tested. |
| claude.ai upload or Skills API (ZIP) | ZIP built and checked by this repository's validator and by the reference `agentskills validate` (skills-ref 0.1.1). Upload not tested. |

The skill's frontmatter uses only portable fields. Its scripts need Node 18 or newer. Rendered audits also need Playwright with Chromium, installed locally (see [docs/installation.md](docs/installation.md#optional-rendered-audits)). Where those are unavailable, the skill falls back to static checks and says so.

## Install

**Claude Code plugin (recommended).**

```bash
claude plugin marketplace add erenthedeveloper0/form-and-force
claude plugin install form-and-force@form-and-force
```

From a local clone, use the path instead: `claude plugin marketplace add ./form-and-force`. To try it for one session without installing, run `claude --plugin-dir ./form-and-force`.

**Standalone skill.** Download `form-and-force-0.1.0.zip` from the [latest release](https://github.com/erenthedeveloper0/form-and-force/releases/latest) and upload it in claude.ai or through the Skills API. To build the same ZIP yourself:

```bash
python3 scripts/package_skill.py    # writes dist/form-and-force-0.1.0.zip
```

Copying the folder as a personal skill, Windows commands, updating and uninstalling are covered in [docs/installation.md](docs/installation.md).

## Quick start

With the plugin installed, describe the work. Claude loads the skill when the request matches, or you can invoke it as `/form-and-force:form-and-force` (as a personal skill: `/form-and-force`).

```text
Our pricing page looks like every SaaS template. Redesign it around how
accountants actually compare plans. Keep the existing Next.js stack.
```

Claude inventories the repository, records a baseline scan, proposes concepts and builds. It then reports the commands it ran and their actual results.

The scanners also run without Claude. They are free, offline and need only Node:

```bash
node skills/form-and-force/scripts/inspect_repo.mjs path/to/project
node skills/form-and-force/scripts/slop_scan.mjs path/to/project --strict   # exits 1 on category C failures
```

## Repository layout

```text
.claude-plugin/
  plugin.json             plugin manifest (name, version, license)
  marketplace.json        lets this repository act as its own plugin marketplace
skills/form-and-force/    the skill: everything that ships to users
  SKILL.md                workflow, stance, policy summary, resource map
  references/             15 deep references, each linked from SKILL.md
  scripts/                inspect_repo, slop_scan, audit_page, contact_sheet (Node)
  assets/                 brief, motion spec, component spec and report templates
evals/                    optional model-evaluation suite (5 cases) and fixture project
research/                 sources, reference corpus, gaps and source status
scripts/                  repository tooling (Python standard library only)
tests/                    free unit and regression tests
docs/                     installation, testing and release guides
assets/                   banner, social preview and the brand renderer (assets/brand/)
```

## Validate (free)

Python 3.11 or newer is the only requirement: no packages, API keys or accounts. With Node 18 or newer installed, the JavaScript syntax checks and scanner tests also run; without it they are reported as not run.

```bash
python3 scripts/validate_repository.py       # structure, manifests, license, links, hygiene, workflow and publication safety
python3 -m unittest discover -s tests -v     # validator, packaging, link-audit and scanner regression tests
python3 scripts/package_skill.py             # builds and verifies the standalone ZIP
```

On Windows, use `py` in place of `python3`. CI runs the same commands on every pull request. With Claude Code installed, `claude plugin validate --strict .` runs the official manifest check, and `python3 scripts/release_check.py` runs everything and prints the release checklist. Details are in [docs/testing.md](docs/testing.md).

## Optional model evaluations (paid)

The eval suite in `evals/` runs real Claude sessions with and without the plugin and grades the results. Every session and every judge-graded check is a billed model call, so the suite is never run by CI or by any other command. Its current status is **not run**.

```bash
python3 scripts/evals.py                                                      # free: lists cases and what would be billed
python3 scripts/evals.py run --confirm-paid --max-cost-usd 5 --runs 1 --scaffold  # paid
```

See [docs/testing.md](docs/testing.md#tier-b-optional-paid-model-evaluations) for what the run does, which credentials it uses, and how to read the results.

## Limitations

- **No measured efficacy yet.** The behavioural evals have not been run, so there is no evidence yet that the skill improves outcomes over a no-skill baseline.
- **Rendered audits need a browser.** `audit_page.mjs` needs Playwright and Chromium. Heavy WebGL can stall in headless Chromium, so test those builds in a headed browser or on a device too.
- **Checks are heuristics.** The scanners and the audit flag candidates. They do not certify accessibility conformance or performance in the field.
- **Research limits.** Reference sites were captured once, in a lab, without exercising hover, drag, audio or forms. Three seed references no longer run and are documented from stills ([research/SOURCE_STATUS.md](research/SOURCE_STATUS.md)).
- **Untested surfaces.** The claude.ai upload and the Skills API have not been tested. The plugin has not been submitted to any directory.
- **Web only.** Native iOS and Android guidance is out of scope.

## Contributing

Contributions are welcome, and ordinary changes need no paid services. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks and pull-request expectations. Report bugs through the repository's GitHub Issues, and security problems as described in [SECURITY.md](SECURITY.md).

## License

Form & Force is released under the [MIT License](LICENSE), Copyright (c) 2026 Eren Sümer. You may use, copy, modify, merge, publish, distribute, sublicense and sell it, in commercial or non-commercial projects, provided the copyright notice and permission notice are included in all copies or substantial portions. It is provided "as is", without warranty of any kind.

The license covers this repository's original code and documentation. It grants no rights in third-party works that the research cites, such as websites, names, scores and trademarks. Screenshots of third-party sites are not distributed (see [research/README.md](research/README.md#third-party-material)). The banner, social preview and icon are original artwork rendered from code in this repository; the typefaces used to set them are under the SIL Open Font License ([assets/brand](assets/brand/README.md#licensing)).

## Links

- Documentation: [docs/installation.md](docs/installation.md), [docs/testing.md](docs/testing.md), [docs/releasing.md](docs/releasing.md)
- Research: [research/README.md](research/README.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Claude Code plugins: <https://code.claude.com/docs/en/plugins/create>
- Agent Skills overview: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview>
- Agent Skills specification: <https://agentskills.io/specification>
