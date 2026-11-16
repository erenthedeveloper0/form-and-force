# Contributing to Form & Force

Thank you for helping. You do not need any paid service, API key or account to contribute. The required checks are free and run offline.

## Tools

- **Python 3.11 or newer.** The only requirement. The repository's tooling, tests and site builder use the standard library, so there is nothing to `pip install`.
- **Node 18 or newer.** Recommended. It enables the JavaScript checks, the tool tests and the brand's vector check.
- **git**
- **Playwright with Chromium.** Optional, for the browser tests and for re-rendering the brand's raster files. Never installed by the repository ([testing](docs/development/testing.md#2-browser-checks-free-optional)).
- **Claude Code.** Optional, for `claude plugin validate` and for trying the plugin.

## Set up

```bash
git clone https://github.com/erenthedeveloper0/form-and-force.git
cd form-and-force
python3 tooling/validate_repository.py
python3 -m unittest discover -s tests -v
```

On Windows, use `py` in place of `python3`.

## Where things live

[ARCHITECTURE.md](ARCHITECTURE.md) explains the layout and why. In short:

| You want to change | Edit | Notes |
|---|---|---|
| What Claude does | `skills/form-and-force/SKILL.md` | An operating manual, not an encyclopedia: a test fails if its body passes about 4,500 tokens. Move detail into a reference. Its frontmatter may use only portable keys (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`) |
| Deep guidance | `skills/form-and-force/references/*.md` | Link every reference from `SKILL.md`. Number its sections; over 100 lines it needs a `## Contents` list that matches them. No example palettes, typeface pairings or token values: examples become a house style |
| The component atlas | `skills/form-and-force/references/component-atlas.md` | Every entry has the same fields in the same order, and the index at the top lists it. `tests/test_library.py` checks both |
| The tools | `skills/form-and-force/scripts/*.mjs` | Node built-ins only (Playwright is resolved at run time, never imported statically). `--help` prints the header comment; usage errors exit 2. No network calls of their own; never read secret files. Keep the SPDX line |
| The deck | `skills/form-and-force/scripts/deck.json` | Lenses are questions and structures are principles. A card never names a colour, typeface or size. Ids are stored in people's history files: never rename them |
| Templates | `skills/form-and-force/assets/` | |
| Documentation | `docs/`, listed in `site/nav.json` | Every page reads on GitHub and builds into the site. Generated tables sit between `<!-- generated:… -->` markers; run `python3 tooling/sync_docs.py` instead of editing them |
| The site's look and behaviour | `site/theme/`, `site/build.py`, `site/markdown.py` | Colours and fonts come from `brand/`, not from the theme |
| The brand | `brand/source/`, `brand/build.mjs`, `brand/guidelines/` | Never edit a generated file by hand; rebuild it ([brand and site](docs/development/brand-and-site.md)) |
| Research | `research/` | See below |
| Repository tooling | `tooling/*.py` | Standard library only, Python 3.11 syntax |

Everything under `skills/form-and-force/` ships to users. Keep development notes out of it. Step-by-step guides for adding a reference, an atlas entry, a card, a tool, a template, an eval case or a page are in [extending](docs/development/extending.md).

## Adding or updating research

1. Record each source in [research/RESEARCH_LEDGER.md](research/RESEARCH_LEDGER.md): the question, a link, the source type, the date, the finding, its status (Verified, Inferred or Disputed), and the skill file it informs.
2. Describe only what you observed. If you inspected loading and scrolling but not hover or drag, say so, and mark the rest *(inferred)*.
3. When a source is dead or blocked, follow the procedure in [research/SOURCE_STATUS.md](research/SOURCE_STATUS.md): check the original, look for an official successor and for an archive, and record what you found and when. Never invent a URL or an archive.
4. Do not commit third-party screenshots, images, fonts or copied articles. The validator rejects media files that lack recorded licence provenance. Link to the source instead.

## Checks before you push

```bash
python3 tooling/validate_repository.py
python3 -m unittest discover -s tests -v
python3 tooling/package_skill.py
python3 tooling/sync_docs.py --check
python3 site/build.py --check
```

If you have Claude Code, also run `claude plugin validate --strict .`. The skill's scanner can be tried on the fixture:

```bash
node skills/form-and-force/scripts/slop_scan.mjs evals/fixtures/generic-saas-landing
```

### Pre-push checklist

- [ ] The five commands above pass.
- [ ] No secrets, `.env` files, personal paths or generated files are staged (`git status`).
- [ ] New behaviour has a test that fails without the change.
- [ ] If a rendered tool or the brand's rasters changed: the browser tests were run with `FF_PLAYWRIGHT_DIR` set, or the pull request says they were not.
- [ ] Documentation and `CHANGELOG.md` (under `[Unreleased]`) describe user-visible changes.
- [ ] Claims in documentation and research match what was actually checked.

## Optional paid evaluations

To measure the skill's effect on Claude's output, use the eval suite. It is billed per model call. `python3 tooling/evals.py` lists what would run, for free, and [testing](docs/development/testing.md#3-model-evaluations-paid-opt-in) explains costs and credentials. Pull requests never require it.

## Pull requests

- Keep each pull request to one purpose, and explain why the change is needed.
- CI must pass. It runs the free checks only.
- When you change the skill's behaviour, describe the scenario you tested and how you tested it.

## Reporting incomplete or unverified work

Say plainly what you did not finish or could not verify. That is far more useful than an optimistic summary. In the pull-request template, mark each check as Passed, Failed, Partially completed, Blocked (and why) or Not run. Never mark a check as passed unless you ran it.

## Reporting bugs, outcomes and security issues

Report bugs and design outcomes in GitHub Issues using the templates ([support](SUPPORT.md)). Report security problems privately, as described in [SECURITY.md](SECURITY.md). Never paste API keys, tokens or private project files into an issue, a pull request or a log. Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE), the same as the project.
