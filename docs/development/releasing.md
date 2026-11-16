# Releasing

For maintainers. A release is ready only when the release gate shows no FAIL and no BLOCKED items. Nothing in this repository publishes anything by itself: tags, releases, the GitHub Pages site and any directory submission are all deliberate steps taken by a maintainer.

## Repository settings

The canonical repository is <https://github.com/erenthedeveloper0/form-and-force>, with `main` as the primary branch. `.claude-plugin/plugin.json` records it as `homepage` and `repository`. CI's `branches: [main]` must name the primary branch, and the release gate checks that they agree.

These settings live on GitHub, not in the repository:

- **Private vulnerability reporting** (Settings → Code security), which [SECURITY.md](../../SECURITY.md) relies on.
- **Social preview** (Settings → General → Social preview): upload `brand/applications/github/form-and-force-social-preview.jpg`. GitHub has no API for this.
- **Pages** (Settings → Pages → Source: GitHub Actions), if the documentation site is published ([brand and site](brand-and-site.md#publishing)).
- Optionally, a branch rule that requires the **CI** check to pass before merging.

## Release gate

```bash
python3 tooling/release_check.py --online --output release-check.md
```

It runs every free check and prints a checklist in five parts: licensing, packaging, GitHub readiness, CI and verification, and owner actions. Each item is PASS, FAIL, NOT RUN or BLOCKED.

- **NOT RUN** items are manual, or need a tool that is missing. Do them by hand, or confirm they do not apply. Example: comparing the install commands with the current Claude Code documentation.
- **BLOCKED** items need the owner.
- `claude plugin validate --strict .` runs automatically when Claude Code is installed; otherwise it is listed as NOT RUN with the command to run.
- "Working tree committed" fails while there are uncommitted changes. Run the gate on a clean checkout of what you will tag.

## Deciding the version

Form & Force follows [Semantic Versioning](https://semver.org/). Before 1.0, a minor version (0.x.0) marks a change to the method or to how the skill behaves; a patch (0.x.y) fixes behaviour without changing the method. A change that only reorganises the repository, its documentation or its brand, and leaves what users install unchanged, does not need a release on its own; it goes out with the next one.

## Releasing a new version

1. Update `CHANGELOG.md`: move the entries under `[Unreleased]` into a new version section, with the date. Remove the empty `[Unreleased]` heading until the next entry.
2. Set the same version in `.claude-plugin/plugin.json`, in the `metadata.version` field of `skills/form-and-force/SKILL.md`, and in `pyproject.toml`. The validator fails if they differ. The documentation site reads the version from `plugin.json`.
3. Run the release gate and fix everything it reports.
4. Commit, then tag. `claude plugin tag` creates a `form-and-force--v<version>` tag after checking that `plugin.json` and the marketplace entry agree. A plain `git tag v<version>` also works.
5. Push the commit and the tag. Users get the new version with `claude plugin update form-and-force@form-and-force`.
6. Attach `dist/form-and-force-<version>.zip` to a GitHub release for people who upload the skill to claude.ai. The ZIP is byte-for-byte reproducible: anyone can rebuild it from the tag with `python3 tooling/package_skill.py` and compare the SHA-256 printed by the gate.
7. Optionally, run the **Documentation site** workflow so the published documentation matches the release.

Never rename the plugin (`form-and-force`): existing installs are recorded under that name. Change `displayName` if the label needs to change.

## What a release contains

| Surface | Built from | Contents |
|---|---|---|
| Claude Code plugin | The repository at the tag | `.claude-plugin/` and `skills/form-and-force/`; Claude Code reads the rest of the repository but uses only these |
| Standalone ZIP | `tooling/package_skill.py` | One folder, `form-and-force/`: `SKILL.md`, `references/`, `scripts/`, `assets/` and `LICENSE`. No research, evals, tests, tooling, documentation or brand |
| Documentation site | `site/build.py` | The pages in `site/nav.json`, built into `dist/site/` |

## Anthropic's plugin directory (optional)

Submission and acceptance are separate from everything above. Passing local validation does not mean the directory will accept the plugin.

- `claude plugin validate --strict --profile directory .` runs the subset of directory checks available locally. On 2026-10-23 it found nothing to report.
- The listing icon is `.claude-plugin/icon.png`, a 1024 px square rendered by `brand/build.mjs` ([applications](../../brand/guidelines/applications.md#the-claude-code-plugin)). It becomes the listing icon on first submission, so change it before submitting, not after.
- Submitting needs a paid claude.ai plan and goes through the developer portal described in the Claude Code publishing documentation. The directory also runs a safety scan and a policy review.

## Optional CI for the official plugin validator

Default CI deliberately avoids installing Claude Code: the CLI is proprietary and updates almost daily. If you want CI to run `claude plugin validate --strict .`, add a separate job that installs a pinned CLI version, and expect to update that pin.
