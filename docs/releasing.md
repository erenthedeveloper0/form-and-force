# Releasing

For maintainers. A release is ready only when the release gate shows no FAIL and no BLOCKED items.

## Repository settings

The canonical repository is <https://github.com/erenthedeveloper0/form-and-force>, with `main` as the primary branch. `.claude-plugin/plugin.json` records it as `homepage` and `repository`. CI's `branches: [main]` must name the primary branch, and the release gate checks that they agree.

These settings live on GitHub, not in the repository:

- **Private vulnerability reporting** (Settings → Code security), which [SECURITY.md](../SECURITY.md) relies on.
- **Social preview** (Settings → General): upload `assets/social-preview.jpg`. GitHub has no API for this.
- Optionally, a branch rule that requires the **CI** check to pass before merging.

## Release gate

```bash
python3 scripts/release_check.py --online --output release-check.md
```

It runs every free check and prints a checklist in four parts: licensing, packaging, GitHub readiness, and CI and verification. Each item is PASS, FAIL, NOT RUN or BLOCKED.

- **NOT RUN** items are manual, or need a tool that is missing. Do them by hand, or confirm they don't apply. Example: comparing the install commands with the current Claude Code documentation.
- **BLOCKED** items need the owner, such as the repository URL before it exists.
- `claude plugin validate --strict .` runs automatically when Claude Code is installed. Otherwise it is listed as NOT RUN with the command to run.

## Releasing a new version

1. Update `CHANGELOG.md`: move the entries under `[Unreleased]` into a new version section, with the date.
2. Set the same version in `.claude-plugin/plugin.json`, in the `metadata.version` field of `skills/form-and-force/SKILL.md`, and in `pyproject.toml`. The validator fails if they differ.
3. Run the release gate and fix everything it reports.
4. Commit, then tag. `claude plugin tag` creates a `form-and-force--v<version>` tag after checking that `plugin.json` and the marketplace entry agree. A plain `git tag v<version>` also works.
5. Push the commit and the tag. Users get the new version with `claude plugin update form-and-force@form-and-force`.
6. Optionally attach `dist/form-and-force-<version>.zip` to a GitHub release, for people who upload the skill to claude.ai.

Never rename the plugin (`form-and-force`). Existing installs are recorded under that name. Change `displayName` if the label needs to change.

## Anthropic's plugin directory (optional)

Submission and acceptance are separate from everything above. Passing local validation does not mean the directory will accept the plugin.

- `claude plugin validate --strict --profile directory .` runs the subset of directory checks available locally. On 2026-10-23 it found nothing to report.
- The listing icon is `.claude-plugin/icon.png`, a 1024 px square rendered by `assets/brand/render.py` (see [assets/brand](../assets/brand/README.md)). It becomes the listing icon on first submission, so change it before submitting, not after. Any new media file needs an entry in `ALLOWED_MEDIA` in `scripts/validate_repository.py` that records its provenance.
- Submitting needs a paid claude.ai plan and goes through the developer portal described in the Claude Code publishing documentation. The directory also runs a safety scan and a policy review.

## Optional CI for the official plugin validator

Default CI deliberately avoids installing Claude Code: the CLI is proprietary and updates almost daily. If you want CI to run `claude plugin validate --strict .`, add a separate job that installs a pinned CLI version, and expect to update that pin.
