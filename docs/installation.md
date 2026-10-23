# Installation

Form & Force ships in two forms built from the same `skills/form-and-force` folder:

- **A Claude Code plugin.** This repository is both the plugin and a one-plugin marketplace.
- **A standalone skill ZIP** for claude.ai or the Skills API, or a folder you copy into your skills directory.

Commands below were checked against the Claude Code documentation and Claude Code 2.1.308 on 2026-10-23.

## Claude Code plugin

### From GitHub

```bash
claude plugin marketplace add erenthedeveloper0/form-and-force
claude plugin install form-and-force@form-and-force
```

Claude Code 2.1.292 and later can do both steps in one command: `claude plugin install form-and-force --marketplace erenthedeveloper0/form-and-force`. Inside a session, `/plugin` opens the same flows.

The skill then appears as `form-and-force:form-and-force`. Claude loads it when a request matches its description, or you can invoke it with `/form-and-force:form-and-force`.

### From a local clone

```bash
git clone https://github.com/erenthedeveloper0/form-and-force.git
claude plugin marketplace add ./form-and-force
claude plugin install form-and-force@form-and-force
```

A marketplace added from a local path is read in place rather than copied: `claude plugin list` shows the clone as the plugin's location.

### For one session only

```bash
claude --plugin-dir ./form-and-force
```

### Update and remove

```bash
claude plugin update form-and-force@form-and-force
claude plugin uninstall form-and-force@form-and-force
claude plugin marketplace remove form-and-force
```

`plugin.json` sets a `version`. A release reaches users only when that version increases (see [releasing.md](releasing.md)).

## Standalone skill

### ZIP for claude.ai or the Skills API

Each [GitHub release](https://github.com/erenthedeveloper0/form-and-force/releases) has the ZIP attached. To build it yourself:

```bash
python3 scripts/package_skill.py
```

This validates the skill, then writes `dist/form-and-force-<version>.zip`. The archive contains one folder, `form-and-force/`, holding `SKILL.md`, `references/`, `scripts/`, `assets/` and `LICENSE`, and nothing from the rest of the repository. The command then reopens the archive and verifies that every linked reference and script is inside it.

Upload the ZIP in claude.ai under the skills settings, or through the Skills API. The upload itself has not been tested by the maintainers yet.

### Copy as a personal or project skill

macOS and Linux:

```bash
cp -R skills/form-and-force ~/.claude/skills/            # every project
cp -R skills/form-and-force path/to/project/.claude/skills/   # one project
```

Windows (PowerShell):

```powershell
Copy-Item -Recurse skills\form-and-force "$env:USERPROFILE\.claude\skills\"
```

As a personal skill it is invoked as `/form-and-force`.

## Requirements

| Need | For | Install |
|---|---|---|
| Claude Code | the plugin | see the Claude Code documentation |
| Node 18 or newer | the bundled scripts (`inspect_repo`, `slop_scan`, `audit_page`, `contact_sheet`) | <https://nodejs.org> |
| Playwright with Chromium | rendered audits only | below |
| Python 3.11 or newer | building the ZIP and the repository checks | <https://www.python.org> |

## Optional: rendered audits

`audit_page.mjs` uses Playwright. Install it in the project you are auditing, or in a scratch directory. Never install it globally.

```bash
npm i -D playwright && npx playwright install chromium
```

To keep it out of the project:

```bash
mkdir -p ~/.cache/ffpw && cd ~/.cache/ffpw && npm i playwright && npx playwright install chromium
export FF_PLAYWRIGHT_DIR=~/.cache/ffpw
```

`FF_CHROMIUM_PATH` can point at an existing Chromium or Chrome for Testing binary.
