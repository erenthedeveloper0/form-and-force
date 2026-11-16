# Troubleshooting

Problems people are likely to meet, and what to do about each. If yours is not here, see [support](../SUPPORT.md).

## Installing the plugin

**`claude plugin marketplace add` fails, or the plugin is not found.**
Check the spelling: the marketplace is `erenthedeveloper0/form-and-force` and the plugin is `form-and-force@form-and-force`. From a local clone, pass the path to the clone's root (the folder that contains `.claude-plugin/`), not the `skills/` folder. `claude plugin validate --strict .` in the clone shows whether the manifests are readable.

**An update does not arrive.**
A release reaches users only when the `version` in `.claude-plugin/plugin.json` increases. Run `claude plugin update form-and-force@form-and-force`. A local-path marketplace is read in place, so a `git pull` in the clone is the update.

**`--marketplace` is not recognised.**
`claude plugin install form-and-force --marketplace …` needs Claude Code 2.1.292 or later. Use the two-step `marketplace add` and `install` instead, or update Claude Code.

## The skill does not load

**Claude answers without using the skill.**
It loads when a request is about designing, building, animating or reviewing web interfaces. Invoke it explicitly with `/form-and-force:form-and-force` (as a personal skill, `/form-and-force`). `/plugin` inside a session shows whether the plugin is enabled.

**A copied skill is not found.**
The folder must be named `form-and-force` and contain `SKILL.md` directly: `~/.claude/skills/form-and-force/SKILL.md`, not `~/.claude/skills/skills/form-and-force/`.

**A claude.ai upload is rejected.**
Upload the ZIP built by `tooling/package_skill.py` or attached to a release, not a ZIP of the whole repository. The archive must hold one folder, `form-and-force/`, with `SKILL.md` inside it. Uploads have not been tested by the maintainers; please [report](../SUPPORT.md) what you see.

## The rendered tools

**"Playwright not found."**
The rendered tools never install anything. Install Playwright in the project (`npm i -D playwright && npx playwright install chromium`) or in a scratch directory, and point `FF_PLAYWRIGHT_DIR` at it ([installation](installation.md#optional-rendered-tools)). Never install it globally.

**"Could not launch Chromium."**
Run `npx playwright install chromium` in the directory where Playwright is installed, or set `FF_CHROMIUM_PATH` to an existing Chromium or Chrome for Testing binary. On Linux, `npx playwright install --with-deps chromium` also installs the system libraries.

**The audit hangs or shows only a loader.**
Heavy WebGL can stall in headless Chromium. Raise `--wait`, audit a lighter route, and check the experience in a headed browser or on a device. Say in the report what was not observed.

**`motion_strip` says it could not reach the trigger's element.**
The selector did not match a visible element within 8 seconds. Check the selector, and use `--before` when something has to be opened first (a menu before its item).

**Hover effects are missing in a strip at a narrow width.**
That is correct: under 900 px wide the page is emulated as a touch device, where `(hover: hover)` styles do not apply. It is how the page behaves on a phone.

## The static scan

**`slop_scan --strict` exits 2.**
There was no C finding, but some template files were not read (their format has no rules, or they were too large). The files are listed. Read them by hand against the floor's failures and name them in the report, or exit 2 is the honest result. It also exits 2 when the path you gave is not a directory.

**The scan reports zero findings on a project you know has problems.**
Check the coverage line first: `empty` means nothing was read. Then remember what it cannot see: composition, rendered behaviour, and anything a template helper prints at render time. A clean scan is not a compliment.

## The dealer

**Every hand avoids the cards I want.**
That is the history at work: the dealer steers away from the last two hands and from what recent projects committed to. Pass `--no-history` for an unconnected deal, or delete `~/.form-and-force/history.json` to start over ([configuration](reference/configuration.md#the-dealers-history)).

**A swap is refused.**
A swap needs a reason of at least twelve characters that says why the card cannot apply to this project, and each frame may be swapped once.

## This repository's checks

**A test is skipped.**
Tests that need Node skip without it, unless `FF_REQUIRE_NODE=1` is set (CI sets it). Browser tests skip unless `FF_PLAYWRIGHT_DIR` points at a Playwright install. A skipped test is reported as not run, never as passed.

**The validator rejects an image.**
Every image, video or font needs recorded provenance. A rendered brand file must match the hash in `brand/manifest.json`: re-render it with `node brand/build.mjs` instead of editing it. A new third-party file needs an entry in `ALLOWED_MEDIA` in `tooling/validate_repository.py` with its licence basis, and third-party screenshots are never committed.

**`site/build.py` fails on a link.**
Every link in the documentation has to resolve, including anchors. The message names the page and the link. A Markdown file under `docs/` that `site/nav.json` does not list also fails the build, so that no page is published without navigation.

**`tooling/sync_docs.py --check` fails.**
A generated table in the documentation no longer matches its source (the deck or the atlas). Run `python3 tooling/sync_docs.py` and commit the result.
