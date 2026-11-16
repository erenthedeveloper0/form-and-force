# Configuration

Form & Force has no configuration file. Its behaviour is set by the request you make, by command-line options, and by a few environment variables.

## Environment variables

### For the skill's tools

| Variable | Used by | Effect |
|---|---|---|
| `FF_PLAYWRIGHT_DIR` | The rendered tools, the brand renderer, the browser tests | A directory where Playwright is installed. Checked after the current project. Lets you keep Playwright out of the project you are working on |
| `FF_CHROMIUM_PATH` | The rendered tools | A Chromium or Chrome for Testing executable to use instead of Playwright's own. `audit_page.mjs --chromium` does the same for one run |
| `FF_HISTORY` | `deal.mjs` | Where the dealer's history is kept, instead of `~/.form-and-force/history.json`. `--history <file>` does the same for one run |

### For this repository's checks

| Variable | Used by | Effect |
|---|---|---|
| `FF_REQUIRE_NODE=1` | The test suite | Fail, instead of skipping, the tests that need Node. CI sets it |
| `FF_UPDATE_FACTS=1` | `tests/test_rendered_tools.py` | Rewrite the recorded design facts in `tests/fixtures/facts/` after a deliberate change to what `design_facts.mjs` measures |

## What the skill writes on your machine

| What | Where | Notes |
|---|---|---|
| The dealer's history | `~/.form-and-force/history.json` | See below |
| Sketches | Where the agent puts them; by convention `.ff/frames/` in your project | Add `.ff/` to your ignore file |
| Sketch boards | `<tmp>/ff-board/<time>/` unless `--out` | `board.jpg`, `board.json` |
| Page audits | `<tmp>/ff-audit/<slug>-<time>/` unless `--out` | `first.jpg`, `flatplan.jpg`, `sheet.jpg`, `report.json` |
| Filmstrips | `<tmp>/ff-motion/<slug>-<time>/` unless `--out` | `strip.jpg`, `motion.json` |

`<tmp>` is your system's temporary directory. Nothing is sent anywhere: the tools make no network requests of their own, and the rendered tools load only the pages you name.

### The dealer's history

The history is how consecutive projects stop resembling each other. For each hand it stores the card ids dealt; for each direction you record, the one-line device, the typeface names, palette words and motion character. Entries are keyed by a hash of the project path, never the path itself.

- Turn it off for one command with `--no-history`.
- Move it with `FF_HISTORY` or `--history <file>`.
- See what it holds with `node scripts/deal.mjs recent`.
- Delete the file to forget everything. The next hand is dealt as if no project came before.

## The skill's own settings

`SKILL.md`'s frontmatter uses only the portable Agent Skills fields (`name`, `description`, `license`, `compatibility`, `metadata`), so the same folder works as a Claude Code plugin skill, a personal or project skill, and an upload to claude.ai or the Skills API. It sets no `allowed-tools`: the agent asks for permission to run commands as your Claude Code settings require.
