# Contributing to Form & Force

Thank you for helping. You do not need any paid service, API key or account to contribute. The required checks are free and run offline.

## Tools

- **Python 3.11 or newer.** The only requirement. The repository scripts use the standard library, so there is nothing to `pip install`.
- **Node 18 or newer.** Recommended. It enables the JavaScript syntax checks and the scanner regression tests.
- **git**
- **Claude Code.** Optional. Needed for `claude plugin validate` and for trying the plugin.

## Set up

```bash
git clone https://github.com/erenthedeveloper0/form-and-force.git
cd form-and-force
python3 scripts/validate_repository.py
python3 -m unittest discover -s tests -v
```

On Windows, use `py` in place of `python3`.

## Where things live

| You want to change | Edit | Notes |
|---|---|---|
| What Claude does | `skills/form-and-force/SKILL.md` | Keep it under 500 lines. Its frontmatter may use only portable keys (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`). |
| Deep guidance | `skills/form-and-force/references/*.md` | Link every reference directly from `SKILL.md`. A reference over 100 lines needs a `## Contents` section. |
| Bundled tooling | `skills/form-and-force/scripts/*.mjs` | Node built-ins only. No network calls of their own, and never read secret files. Keep `// SPDX-License-Identifier: MIT` on line 2. |
| Templates | `skills/form-and-force/assets/` | |
| Research | `research/` | See below. |
| Repository tooling | `scripts/*.py` | Standard library only, Python 3.11 syntax. |

Everything under `skills/form-and-force/` ships to users. Keep development notes out of it.

## Adding or updating research

1. Record each source in [research/RESEARCH_LEDGER.md](research/RESEARCH_LEDGER.md): the question, a link, the source type, the date, the finding, its status (Verified, Inferred or Disputed), and the skill file it informs.
2. Describe only what you observed. If you inspected loading and scrolling but not hover or drag, say so, and mark the rest *(inferred)*.
3. When a source is dead or blocked, follow the procedure in [research/SOURCE_STATUS.md](research/SOURCE_STATUS.md): check the original, look for an official successor and for an archive, and record what you found and when. Never invent a URL or an archive.
4. Do not commit third-party screenshots, images, fonts or copied articles. The validator rejects media files that lack recorded license provenance. Link to the source instead.

## Checks before you push

```bash
python3 scripts/validate_repository.py
python3 -m unittest discover -s tests -v
python3 scripts/package_skill.py
```

If you have Claude Code, also run `claude plugin validate --strict .`. The skill's scanners can be tried on the fixture:

```bash
node skills/form-and-force/scripts/slop_scan.mjs evals/fixtures/generic-saas-landing
```

### Pre-push checklist

- [ ] The three commands above pass.
- [ ] No secrets, `.env` files, personal paths or generated files are staged (`git status`).
- [ ] New behaviour has a test that fails without the change.
- [ ] Docs and `CHANGELOG.md` (under `[Unreleased]`) describe user-visible changes.
- [ ] Claims in docs and research match what was actually checked.

## Optional paid evaluations

To measure the skill's effect on Claude's output, use the eval suite. It is billed per model call. `python3 scripts/evals.py` lists what would run for free, and [docs/testing.md](docs/testing.md#tier-b-optional-paid-model-evaluations) explains costs and credentials. Pull requests never require it.

## Pull requests

- Keep each pull request to one purpose, and explain why the change is needed.
- CI must pass. It runs the free checks only.
- When you change the skill's behaviour, describe the scenario you tested and how you tested it.

## Reporting incomplete or unverified work

Say plainly what you did not finish or could not verify. That is far more useful than an optimistic summary. In the pull-request template, mark each check as Passed, Failed, Partially completed, Blocked (and why) or Not run. Never mark a check as passed unless you ran it.

## Reporting bugs and security issues

Report bugs in GitHub Issues, with steps to reproduce. Report security problems privately, as described in [SECURITY.md](SECURITY.md). Never paste API keys, tokens or private project files into an issue, a pull request or a log.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE), the same as the project.
