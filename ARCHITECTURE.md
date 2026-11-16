# Architecture

How the Form & Force repository is organised, why, and how its parts depend on each other. For how the *method* works, see [how it works](docs/how-it-works.md).

## The product in one paragraph

Form & Force is a skill: a folder an agent loads, holding an operating manual, a library of references, a set of templates and a set of command-line instruments. Everything else in this repository exists to justify that folder (research), to prove it works (tests and evaluations), to deliver it (plugin manifests and packaging), to explain it (documentation and the site), or to present it (the brand). The repository is organised around that fact: one product at the centre, and around it the things that serve it, each in its own place.

## Conceptual architecture

```text
                    ┌──────────────────────────── the skill (ships) ────────────────────────────┐
                    │  skills/form-and-force/                                                   │
                    │    SKILL.md ............ method: the stages, what to load, when to stop    │
                    │    references/ ......... knowledge: method, craft, motion, components,     │
                    │                          engineering (18 files, flat, linked from SKILL.md) │
                    │    assets/ ............. templates the agent fills in (5)                  │
                    │    scripts/ ............ instruments: 8 Node tools, 2 modules, the deck     │
                    └────────────────────────────────────────────────────────────────────────────┘
        evidence ▲              ▲ verification            ▲ delivery              ▲ explanation & identity
   research/     │   tests/  evals/                .claude-plugin/          docs/  site/  brand/
   why it says   │   free checks · browser         plugin + marketplace;    Markdown pages, the
   what it says  │   checks · paid model evals     tooling/package_skill    site built from them,
                 │   (human judgement: protocols)  builds the ZIP           the identity
                 └──────────────── tooling/ : the maintainer's workshop (Python, standard library) ─────┘
```

| Domain | Directory | Responsibility | Ships to users |
|---|---|---|---|
| **The skill** | `skills/form-and-force/` | The method, the knowledge, the templates and the tools an agent uses | Yes: in the plugin and the ZIP |
| **Delivery** | `.claude-plugin/` | The plugin manifest, the one-plugin marketplace, the listing icon | Yes: in the plugin |
| **Evidence** | `research/` | Sources, measurements and reasoning behind every rule; what could not be established | No |
| **Verification** | `tests/`, `evals/` | Free deterministic and browser tests; paid, opt-in model evaluations with their fixtures | No |
| **Documentation** | `docs/`, root `*.md` | Guides, references, development and project documents, readable on GitHub | No |
| **Site** | `site/` | Builds the documentation website from the Markdown | No (published separately, by hand) |
| **Identity** | `brand/` | The brand system: sources, guidelines, generated assets | No (used by the README, site and plugin listing) |
| **Workshop** | `tooling/` | Validation, packaging, the release gate, eval wrappers, link audit, documentation sync | No |

### Inside the skill

The skill's layout follows the [Agent Skills specification](https://agentskills.io/specification) (`SKILL.md`, `references/`, `scripts/`, `assets/`), so it works unchanged as a plugin skill, a personal skill and an upload. Its four parts have distinct jobs:

- **The method** is `SKILL.md`: an operating manual, not an encyclopedia (a test keeps it under about 4,500 tokens). It sizes the job, orders the stages, and routes each stage and task to the references it needs.
- **The knowledge** is `references/`. It is flat on purpose: every file is one link from `SKILL.md`, files point at each other by section number (`jury.md §8`), and the agent's search commands assume one directory. The grouping (method, craft, motion, components, engineering) is documented in the [reference library](docs/reference/library.md) rather than imposed as folders. The component atlas is one file because it is searched with `grep`, one entry at a time.
- **The instruments** are `scripts/`. Each does one job at one stage and keeps the same command-line contract. `browser.mjs` (Playwright resolution and rendering) and `design_facts.mjs` (page measurement) are shared modules; `deck.json` is the dealer's data.
- **The templates** are `assets/`, the specification's name for files an agent fills in.

## Dependencies

Dependencies run one way: toward the skill, never out of it.

```text
skills/form-and-force  ◄── tooling/ (validates and packages it)
        ▲  ▲  ▲        ◄── tests/  (runs its tools; checks its documents)
        │  │  │        ◄── evals/  (`claude plugin eval` loads it as a plugin)
        │  │  └──────────── site/   (renders its Markdown as pages)
        │  └─────────────── brand/build.mjs (reuses scripts/browser.mjs to render rasters)
        └────────────────── docs/   (explain it; generated tables read deck.json and the atlas)
brand/ ◄── site/ (tokens, fonts, logo, icons, backgrounds)     brand/ ◄── README, .claude-plugin/icon.png
```

- **The skill depends on nothing in the repository.** It must run from a copied folder. A test (`test_brand.py`) also checks that it contains no brand colours or typefaces: the product's identity must never become a style it imposes on users' projects.
- **The brand depends on the skill only for `browser.mjs`**, so the project has one way of finding a browser, not two.
- **The site depends on the brand**, not the other way round, so a colour changes in one place.

### Languages and runtime dependencies

| Part | Language | Dependencies | Why |
|---|---|---|---|
| The skill's tools | JavaScript (Node 18+, ES modules) | Node built-ins; Playwright for four tools, resolved at run time and never installed | Users install a folder, not a package. Agents already have Node |
| Repository tooling, tests, site builder | Python 3.11+ | Standard library only | A contributor needs only Python to run every required check |
| Brand renderer | JavaScript (Node) | Playwright, through `browser.mjs` | Rasters are rendered by a real browser, from SVG and HTML sources |
| Brand type preparation | Python | fontTools, brotli, uharfbuzz in a virtual environment | Run rarely, by a maintainer; its outputs are committed |

There is no package manager, lock file or build step in the repository. That is deliberate and is the main reason it has no `package.json`, `apps/` or `packages/`: nothing here is a library that other code imports.

## Sources of truth

Every fact that appears in more than one place has one owner, and a check that catches drift.

| Fact | Owner | Consumers | Drift is caught by |
|---|---|---|---|
| Version | `.claude-plugin/plugin.json` | `SKILL.md` metadata, `pyproject.toml`, `CHANGELOG.md`, the site header | `validate_repository.py` (versions must agree) |
| The deck | `skills/form-and-force/scripts/deck.json` | `deal.mjs`, [the deck reference](docs/reference/deck.md) | `tooling/sync_docs.py --check` |
| The component atlas | `references/component-atlas.md` | Its own index, the [atlas reference](docs/reference/component-atlas.md), site search | `test_library.py`, `sync_docs.py --check` |
| The tools' interfaces | Each tool's header comment (its `--help`) | `SKILL.md`, [the tools reference](docs/reference/tools.md) | `test_skill_scripts.py` (contract), `test_creative_method.py` (routing) |
| Colours and typefaces | `brand/source/tokens.json` | Brand files, the site's CSS, [the colour guide](brand/guidelines/colour.md) | `test_brand.py` |
| The mark and wordmark | `brand/source/mark.json`, `wordmark.json` | Every logo, icon and composition | `node brand/build.mjs --check` |
| Media provenance | `brand/manifest.json`, `ALLOWED_MEDIA` | The validator | `validate_repository.py` |
| Site navigation | `site/nav.json` | The site's sidebar, URLs, pager | `site/build.py` (every `docs/` page listed, every link resolves) |

## How things flow

**At work, in an agent session.** The agent reads `SKILL.md`, loads the references a stage needs, runs the tools from `${CLAUDE_SKILL_DIR}/scripts/`, writes sketches to `.ff/frames/` in the user's project and rendered evidence to the system's temporary directory, and records committed directions in `~/.form-and-force/history.json`. Nothing leaves the machine.

**Delivery.** The repository root is both a plugin and a one-plugin marketplace (`.claude-plugin/marketplace.json` points at `./`), so `claude plugin marketplace add erenthedeveloper0/form-and-force` and a local clone work the same way, and Claude Code discovers the skill at `skills/form-and-force/`. `tooling/package_skill.py` builds the standalone ZIP from the same folder, verifies it, and produces the same bytes every time.

**Verification.** Four kinds, kept apart ([testing](docs/development/testing.md)): deterministic checks run in CI on every pull request; browser checks run locally when Playwright is available; model evaluations run only when a person pays for them; human judgement is never automated and never reported as a test result.

**Presentation.** `brand/build.mjs` renders the identity from its sources; `site/build.py` renders the documentation, with the brand's tokens and fonts, into `dist/site/`, which a manual workflow can deploy.

## Where to add things

| To add | Put it in | Guide |
|---|---|---|
| Method or knowledge the agent uses | `skills/form-and-force/references/`, routed from `SKILL.md` | [Extending](docs/development/extending.md#a-reference) |
| A component | The atlas, in its section | [Extending](docs/development/extending.md#an-atlas-entry) |
| A card | `deck.json` | [Extending](docs/development/extending.md#a-deck-card) |
| A tool | `skills/form-and-force/scripts/` | [Extending](docs/development/extending.md#a-tool) |
| A check on the repository | `tooling/validate_repository.py`, with a test that breaks a copy | [Contributing](CONTRIBUTING.md) |
| An eval case | `evals/<case>/` | [Extending](docs/development/extending.md#an-eval-case) |
| A documentation page | `docs/`, listed in `site/nav.json` | [Extending](docs/development/extending.md#a-documentation-page) |
| A source or a measurement | `research/`, recorded in the ledger | [Contributing](CONTRIBUTING.md#adding-or-updating-research) |
| A brand asset | `brand/build.mjs` | [Brand and site](docs/development/brand-and-site.md) |

## Decisions

Short records of choices that shape the repository, so they are not re-litigated by accident.

- **One product, not a monorepo.** The skill is the only thing users install, and nothing here is imported by other code. A workspace of packages would add a package manager, a lock file and build steps without solving a problem.
- **Repository tooling in `tooling/`, not `scripts/`.** The skill has a `scripts/` folder by specification. A second `scripts/` at the root, in another language and for another audience, made every path ambiguous. Renamed in the release after 0.2.1.
- **Brand in `brand/`, not `assets/`.** `assets/` is the specification's name for the skill's templates. The brand is a domain of its own, with sources, guidelines and generated files.
- **Flat references, one atlas file.** Both are read by an agent with `grep` and section pointers. Folders would lengthen every pointer and split searches, for a grouping that documentation can show instead.
- **Documentation in Markdown, the site generated.** Every page reads on GitHub; the site adds navigation and search without becoming a second copy.
- **A small Markdown renderer instead of a site generator.** Keeps the "Python standard library only" rule for everything a contributor runs. It renders the Markdown this repository writes and fails loudly on anything it cannot resolve.
- **Provenance by hash for generated media.** The validator must reject third-party images without blocking original artwork; recording each rendered file's hash makes "this came from `build.mjs`" checkable.
- **Paid evaluations never in CI.** Every run is billed; the workflow validator rejects any workflow that would start one.
