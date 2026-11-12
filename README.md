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

Form & Force gives a coding agent a method for web work: marketing sites, portfolios, e-commerce, SaaS apps, dashboards, editorial pieces, immersive WebGL and design systems. It is a way of deciding, building and judging. It has no look of its own, and three projects made with it should not resemble one another.

An agent's design work is usually competent and predictable, for three reasons. Each has a mechanism here.

| Cause | Mechanism |
|---|---|
| Asked to choose, a model chooses the most typical thing, including the most typical "original" thing | The choices that decide distinctiveness are **dealt** by a script, at random, away from what recent projects used |
| Directions described in prose sound different and render the same | A direction is **drawn** before it is chosen: rough frames, rendered, side by side |
| Whoever wrote the rationale finds the result convincing | The work is **judged cold**, from pictures, against the page anyone would have made |

The loop, scaled to the job (a one-component fix gets a short pass, a flagship page gets all of it):

1. **Read** the repository and the subject: facts, real proof, the material in hand.
2. **Set the register** (Quiet, Composed, Expressive or Radical) and write down **the twin**: the page any competent agent would make.
3. **Deal a hand**: a lens, a compositional structure and a lead medium for each key frame.
4. **Sketch** each frame, put them on one board, and **choose by looking**.
5. **Derive** composition, type, colour, imagery and motion from the chosen frame, and **build** in the project's stack.
6. **Clear the floor**: ten hard gates for accessibility, function, responsiveness, performance and honesty.
7. **Sit the jury** on the rendered page: a cold read, a test against the twin, ten dimensions marked with evidence, and a verdict that can send the work back to the idea.

## How it differs from generic AI website generators

- **Derived, never decorated.** Every decision cites a fact about the subject. Lists of "AI defaults" are checks run on finished work. They are never where ideas come from, and the registry includes this skill's own habits.
- **The register sets the ambition.** A restrained service site is not marked down for having no WebGL, and an experimental one gets no credit for having it. Timid and overwrought are both failures.
- **Decisions are made by looking.** Sketches before prose, the rendered page before the rationale. Measurements raise questions and are never verdicts ([how the instrument was calibrated](research/INSTRUMENT_CALIBRATION.md)).
- **No fabrication.** It never invents testimonials, logos, metrics or screenshots. Missing proof becomes a labelled slot.
- **Your stack, your code.** It inspects first, keeps working architecture and uncommitted work, and adds dependencies only for a stated need.
- **The floor is not traded.** WCAG 2.2 AA, a designed reduced-motion version, real controls and performance budgets are gates, separate from the judgement of whether the work is good.
- **Honest reporting.** The report says what ran, what passed and what was not verified.

## Core capabilities

- **Direction:** a deck of 26 lenses and 17 compositional structures that holds questions and principles and no colours, typefaces or sizes; a dealer with a history, so consecutive projects stop resembling each other; a sketch board that measures whether frames really differ.
- **Design knowledge** in focused references: composition (seven forces, the flatplan, the narrow screen as its own composition), typography (voice, system, display and text craft, type as image and as interaction), colour, material and imagery (strategy with proportions, choosing a medium, working with no assets) and creative coding (SVG, canvas, shaders, three.js, with lifecycles and fallbacks).
- **Motion:** a gate that can say no, a character that generates every duration, curve and stagger, choreography by casting and relating, and a filmstrip tool that shows an interaction in slow motion with its interruption, its way back and its reduced version.
- **Judgement:** a jury protocol on rendered evidence with four verdicts, kept separate from ten hard gates.
- **Engineering references** for accessibility, responsive design, performance and security, and an atlas of 180 components for states, behaviour and tests.
- **Eight Node tools**: `inspect_repo`, `slop_scan`, `deal`, `sketch_board`, `motion_tokens`, `audit_page`, `motion_strip`, `contact_sheet`, with `design_facts` and `browser` as shared modules. No dependencies beyond an optional local Playwright.

## Compatibility

| Environment | Status |
|---|---|
| Claude Code plugin, from a local clone of this repository | 0.2.1: `claude plugin validate --strict .` passes with Claude Code 2.1.322 (2026-11-11). Installing from a local marketplace was verified for 0.1.0 (2026-10-23) and not repeated. Loading in a live session was not tested. |
| Claude Code plugin, from GitHub | Verified with Claude Code 2.1.322 in a clean configuration (2026-11-11): `claude plugin marketplace add erenthedeveloper0/form-and-force` and `claude plugin install form-and-force@form-and-force` succeed, and the plugin is enabled at 0.2.0 with its 18 references and its scripts in place. Not repeated for 0.2.1. Loading in a live session was not tested. |
| Personal or project skill (copy `skills/form-and-force`) | Structure validated; loading in a session not tested. |
| claude.ai upload or Skills API (ZIP) | The 0.2.1 ZIP is built and checked by this repository's validator. The reference `agentskills validate` (skills-ref 0.1.1) was run on 0.1.0 and has not been repeated. Upload not tested. |

The skill's frontmatter uses only portable fields. Its scripts need Node 18 or newer. The rendered tools (sketch board, page audit, motion strip) also need Playwright with Chromium, installed locally (see [docs/installation.md](docs/installation.md#optional-rendered-tools)). Where those are unavailable, the method still runs on written frames and static checks, and the report says which judgements were made without rendered evidence.

## Install

**Claude Code plugin (recommended).**

```bash
claude plugin marketplace add erenthedeveloper0/form-and-force
claude plugin install form-and-force@form-and-force
```

From a local clone, use the path instead: `claude plugin marketplace add ./form-and-force`. To try it for one session without installing, run `claude --plugin-dir ./form-and-force`.

**Standalone skill.** Download `form-and-force-<version>.zip` from the [latest release](https://github.com/erenthedeveloper0/form-and-force/releases/latest) and upload it in claude.ai or through the Skills API. To build the same ZIP yourself:

```bash
python3 scripts/package_skill.py    # writes dist/form-and-force-<version>.zip
```

Copying the folder as a personal skill, Windows commands, updating and uninstalling are covered in [docs/installation.md](docs/installation.md).

## Quick start

With the plugin installed, describe the work. Claude loads the skill when the request matches, or you can invoke it as `/form-and-force:form-and-force` (as a personal skill: `/form-and-force`).

```text
Our pricing page looks like every SaaS template. Redesign it around how
accountants actually compare plans. Keep the existing Next.js stack.
```

Claude inventories the repository, records a baseline, sets a register, deals and sketches directions, and shows you the board before building. After the build it clears the floor, judges the rendered page, and reports the commands it ran with their actual results.

The tools also run without Claude. They are free and offline. These need only Node:

```bash
node skills/form-and-force/scripts/inspect_repo.mjs path/to/project
node skills/form-and-force/scripts/slop_scan.mjs path/to/project --strict   # exits 1 on category C failures, 2 when templates were left unread
node skills/form-and-force/scripts/deal.mjs hand --register composed --has ui,data --no-history
node skills/form-and-force/scripts/motion_tokens.mjs --action glide --flow bound
```

## Repository layout

```text
.claude-plugin/
  plugin.json             plugin manifest (name, version, license)
  marketplace.json        lets this repository act as its own plugin marketplace
skills/form-and-force/    the skill: everything that ships to users
  SKILL.md                the operating manual: stages, what to load when, scripts
  references/             18 references, each linked from SKILL.md
  scripts/                the dealer and its deck, sketch board, motion tokens, motion strip,
                          page audit, static scan, repository inventory (Node)
  assets/                 direction brief, jury brief, motion score, component spec, report
evals/                    optional model-evaluation suite (12 cases) and fixtures
research/                 sources, method rationale, instrument calibration, corpus, gaps
scripts/                  repository tooling (Python standard library only)
tests/                    free unit and regression tests, with fixture pages for the rendered tools
docs/                     installation, testing and release guides
assets/                   banner, social preview and the brand renderer (assets/brand/)
```

## Validate (free)

Python 3.11 or newer is the only requirement: no packages, API keys or accounts. With Node 18 or newer installed, the JavaScript syntax checks and scanner tests also run; without it they are reported as not run.

```bash
python3 scripts/validate_repository.py       # structure, manifests, license, links, hygiene, workflow and publication safety
python3 -m unittest discover -s tests -v     # validators, packaging, the dealer, motion tokens, thresholds, documents
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

- **No measured efficacy yet.** The behavioural evals have not been run on any release. There is no evidence yet that the skill improves outcomes over a no-skill baseline, or that the 0.2.0 method beats 0.1.0. The case for it is argued in [research/CREATIVE_METHOD.md](research/CREATIVE_METHOD.md).
- **No process produces taste.** The method makes divergence, looking and rejection unavoidable. It cannot guarantee a good idea, and it does not promise awards.
- **The rendered tools need a browser.** The sketch board, the audit and the motion strip need Playwright and Chromium. Heavy WebGL can stall in headless Chromium, so check those builds in a headed browser or on a device too. A filmstrip cannot show how motion feels at speed or under a thumb.
- **Checks are heuristics.** The scanners and the audit flag candidates. They do not certify accessibility conformance or performance in the field. The design facts are blind to a great deal: a stock template with a photograph in it raised no question at all ([calibration](research/INSTRUMENT_CALIBRATION.md)).
- **The dealer keeps a local history** in `~/.form-and-force/history.json` (ids, typeface names and a one-line device per project, keyed by a hash of the path). Nothing is sent anywhere; `--no-history` turns it off.
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
