<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/applications/github/form-and-force-banner-dark.webp">
  <img alt="Form &amp; Force. Decide. Build. Judge." src="brand/applications/github/form-and-force-banner-light.webp" width="100%">
</picture>

<p align="center">
  <strong>Creative direction, interface design and motion engineering for coding agents.</strong>
  <br><br>
  <a href="#install">Install</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="docs/quick-start.md">Quick start</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="docs/README.md">Documentation</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="docs/how-it-works.md">How it works</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="CHANGELOG.md">Changelog</a>
  <br><br>
  <a href="https://github.com/erenthedeveloper0/form-and-force/actions/workflows/ci.yml"><img src="https://github.com/erenthedeveloper0/form-and-force/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status"></a>
</p>

Form & Force is an Agent Skill and Claude Code plugin that takes web work from creative concept to verified code. It gives a coding agent a method for marketing sites, portfolios, e-commerce, SaaS products, dashboards, editorial pieces, immersive WebGL and design systems: a way of deciding, building and judging. It has no look of its own, and three projects made with it should not resemble one another. It is free and open source under the [MIT License](LICENSE).

## Why it exists

An agent's design work is usually competent and predictable: the centred hero, three cards, a violet gradient, a fade-up on every section. Telling it to be original moves it to the most typical original thing. The [research](research/CREATIVE_METHOD.md) traces this to three causes, and Form & Force answers each with a mechanism instead of an instruction:

| Cause | Mechanism |
|---|---|
| Asked to choose, a model chooses the most typical thing, including the most typical "original" thing | The choices that decide distinctiveness are **dealt** by a script, at random, away from what recent projects used |
| Directions described in prose sound different and render the same | A direction is **drawn** before it is chosen: rough frames, rendered side by side, chosen by looking |
| Whoever wrote the rationale finds the result convincing | The work is **judged cold**, from screenshots, against the page anyone would have made |

## How it works

```text
read → register → twin → hand → sketches on a board → commit
     → derive the language from the chosen frame → build
     → floor (hard gates) → jury (rendered evidence) → ship | refine | rework | redirect
```

1. **Read** the repository and the subject: the stack, real proof, the material in hand, fifteen or more concrete facts.
2. **Set the register** (Quiet, Composed, Expressive or Radical) and write down **the twin**: the page any competent agent would make.
3. **Deal a hand**: a lens, a compositional structure and a lead medium for each key frame.
4. **Sketch** each frame, put them on one board, and **choose by looking**.
5. **Derive** composition, type, colour, imagery and motion from the chosen frame, and **build** in the project's stack.
6. **Clear the floor**: ten hard gates for accessibility, function, responsiveness, performance and honesty.
7. **Sit the jury** on the rendered page: a cold read, a test against the twin, ten dimensions marked with evidence, and a verdict that can send the work back to the idea.

The loop scales to the job: a one-component fix gets a short pass, a flagship site gets all of it. [How it works](docs/how-it-works.md) explains each step and the words it uses.

## What is inside

- **Creative direction.** A deck of 26 lenses and 17 compositional structures that holds questions and principles, never colours, typefaces or sizes; a dealer with a history, so consecutive projects stop resembling each other; devices written as *a fact, therefore a rule you could see in a screenshot*. [Guide](docs/guides/creative-direction.md)
- **Visual exploration.** Key frames sketched as standalone pages and compared on a sketch board, wide and narrow and blurred, with a measure of whether they really differ. [Guide](docs/guides/visual-exploration.md)
- **A design language derived from the frame.** Focused references for composition, typography, colour, material and imagery, creative coding, experience flow and design-system tokens, loaded only when the direction needs them. [Guide](docs/guides/design-language.md)
- **Motion engineering.** A gate that can say no, one character from which every duration, curve, spring and stagger is generated, choreography by casting and relating, a designed reduced-motion version, and a filmstrip tool that shows an interaction in slow motion with its interruption and its way back. [Guide](docs/guides/motion.md)
- **A component atlas** of 180 components, searched one at a time for their job, states, behaviour and tests, never for designs. [Reference](docs/reference/component-atlas.md)
- **Judgement kept apart from the gates.** Ten hard gates for accessibility (WCAG 2.2 AA), responsiveness, performance, real controls and honesty, and a jury on rendered evidence with four verdicts. [Guide](docs/guides/quality.md)
- **Eight Node tools**, free and offline: `inspect_repo`, `slop_scan`, `deal`, `motion_tokens`, `sketch_board`, `audit_page`, `motion_strip` and `contact_sheet`. No dependencies beyond an optional local Playwright. [Reference](docs/reference/tools.md)

What makes it different: every decision cites a fact about the subject; ambition is set per project, so restraint is not marked as timidity; decisions are made by looking; nothing is fabricated, and missing proof becomes a labelled slot; it works in your stack and keeps your uncommitted work; and the report says what ran, what passed and what was not verified.

## Install

**Claude Code plugin (recommended).**

```bash
claude plugin marketplace add erenthedeveloper0/form-and-force
claude plugin install form-and-force@form-and-force
```

From a local clone, add the path instead: `claude plugin marketplace add ./form-and-force`. To try it for one session without installing, run `claude --plugin-dir ./form-and-force`.

**Standalone skill.** Download `form-and-force-<version>.zip` from the [latest release](https://github.com/erenthedeveloper0/form-and-force/releases/latest) and upload it in claude.ai or through the Skills API, or build the same ZIP with `python3 tooling/package_skill.py`. To use it as a personal skill, copy `skills/form-and-force` into `~/.claude/skills/`.

The optional rendered tools need Playwright with Chromium, installed locally or in a scratch directory, never globally. Everything is in [installation](docs/installation.md).

## Quick start

With the plugin installed, describe the work. Claude loads the skill when the request matches, or you can invoke it as `/form-and-force:form-and-force`.

```text
Our pricing page looks like every SaaS template. Redesign it around how
accountants actually compare plans. Keep the existing Next.js stack.
```

Claude inventories the repository, records a baseline, sets a register, deals and sketches directions, and shows you the board before building. After the build it clears the floor, judges the rendered page, and reports every command it ran with its actual result.

The tools also run on their own:

```bash
node skills/form-and-force/scripts/inspect_repo.mjs path/to/project
node skills/form-and-force/scripts/slop_scan.mjs path/to/project --strict
node skills/form-and-force/scripts/deal.mjs hand --register composed --has ui,data --no-history
node skills/form-and-force/scripts/motion_tokens.mjs --action glide --flow bound
```

More in the [quick start](docs/quick-start.md).

## Compatibility

| Surface | Status |
|---|---|
| Claude Code plugin, from GitHub | Install verified with Claude Code 2.1.322 at 0.2.1 (2026-11-12). Loading in a live session not tested |
| Claude Code plugin, from a local clone | `claude plugin validate --strict .` passes, and install verified at 0.2.2 with Claude Code 2.1.325 (2026-11-16). Loading in a live session not tested |
| Personal or project skill | Structure validated; loading not tested |
| claude.ai upload or Skills API | The ZIP is built, verified and reproducible; upload not tested |

The skill's frontmatter uses only portable Agent Skills fields. Its tools need Node 18 or newer. Details, runtimes and known limits are in [compatibility](docs/reference/compatibility.md).

## Repository

```text
skills/form-and-force/   the skill: everything that ships to users
  SKILL.md               the operating manual
  references/            18 references: method, craft, motion, components, engineering
  scripts/               8 tools, 2 shared modules and the deck (Node, no dependencies)
  assets/                5 templates the agent fills in
.claude-plugin/          plugin manifest, one-plugin marketplace, listing icon
docs/                    documentation, readable here and built into the site
site/                    the documentation site's builder and theme
brand/                   the identity: sources, guidelines and generated assets
research/                sources, measurements and reasoning behind the method
tests/  evals/           free tests and fixtures; optional paid model evaluations
tooling/                 validation, packaging, release gate, docs sync (Python, standard library)
```

Why it is organised this way, and how the parts depend on each other: [ARCHITECTURE.md](ARCHITECTURE.md).

## Validate (free)

Python 3.11 or newer is the only requirement: no packages, API keys or accounts. With Node 18 or newer installed, the JavaScript checks and tool tests also run; without it they are reported as not run.

```bash
python3 tooling/validate_repository.py     # structure, manifests, licence, links, hygiene, workflows, provenance
python3 -m unittest discover -s tests -v   # validators, packaging, the tools, the method, the library, the brand, the site
python3 tooling/package_skill.py           # builds and verifies the standalone ZIP
python3 site/build.py --check              # builds the documentation site and checks every link
```

CI runs these on every pull request. `python3 tooling/release_check.py` runs everything and prints the release checklist. The four ways the project is checked, from free tests to human judgement, are in [testing](docs/development/testing.md).

## Optional model evaluations (paid)

The suite in `evals/` runs real Claude sessions with and without the plugin and grades them. Every session and every judge-graded check is a billed model call, so it never runs in CI or from any other command. Its status is **not run**.

```bash
python3 tooling/evals.py                                                          # free: lists cases and what would be billed
python3 tooling/evals.py run --confirm-paid --max-cost-usd 5 --runs 1 --scaffold  # paid
```

## Limitations

- **No measured efficacy yet.** The model evaluations have not been run on any release. There is no evidence yet that the skill improves outcomes over no skill, or that the 0.2 method beats 0.1. The case for it is argued in the [research](research/CREATIVE_METHOD.md).
- **No process produces taste.** The method makes divergence, looking and rejection unavoidable. It cannot guarantee a good idea, and it does not promise awards.
- **The rendered tools need a browser.** The sketch board, the audit and the motion strip need Playwright and Chromium. Heavy WebGL can stall headless, and a filmstrip cannot show how motion feels at speed or under a thumb.
- **Checks are heuristics.** The scan and the audit raise candidates and questions; they do not certify accessibility conformance or field performance ([instrument calibration](research/INSTRUMENT_CALIBRATION.md)).
- **The dealer keeps a local history** in `~/.form-and-force/history.json`: card ids, typeface names and a one-line device per project, keyed by a hash of the path. Nothing is sent anywhere; `--no-history` turns it off.
- **Research limits.** Reference sites were captured once, in a lab, without exercising hover, drag, audio or forms ([source status](research/SOURCE_STATUS.md)).
- **Untested surfaces.** The claude.ai upload, the Skills API, live-session loading and Windows have not been tested. The plugin has not been submitted to any directory.
- **Web only.** Native iOS and Android guidance is out of scope.

## Documentation

[Introduction](docs/introduction.md) · [Installation](docs/installation.md) · [Quick start](docs/quick-start.md) · [How it works](docs/how-it-works.md) · [Guides](docs/README.md#guides) · [Tools](docs/reference/tools.md) · [Reference library](docs/reference/library.md) · [Troubleshooting](docs/troubleshooting.md) · [Roadmap](ROADMAP.md) · [Brand](brand/README.md)

The same pages build into a documentation site with navigation and search (`python3 site/build.py --serve`).

## Contributing

Contributions are welcome, and ordinary changes need no paid services. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks and pull requests, and [extending](docs/development/extending.md) for adding references, components, cards and tools. Reports of design outcomes, where the method produced poor work, are especially useful. Report bugs in [GitHub Issues](https://github.com/erenthedeveloper0/form-and-force/issues), security problems as described in [SECURITY.md](SECURITY.md), and see [SUPPORT.md](SUPPORT.md) for everything else. Participation is governed by the [code of conduct](CODE_OF_CONDUCT.md).

## License

Form & Force is released under the [MIT License](LICENSE), Copyright (c) 2026 Eren Sümer. You may use, copy, modify, merge, publish, distribute, sublicense and sell it, in commercial or non-commercial projects, provided the copyright notice and permission notice are included in all copies or substantial portions. It is provided "as is", without warranty of any kind.

The licence covers this repository's original code, documentation and artwork. It grants no rights in third-party works the research cites, such as websites, names, scores and trademarks, and screenshots of third-party sites are not distributed. The typefaces used by the brand are under the SIL Open Font License; see [third-party notices](THIRD_PARTY_NOTICES.md).
