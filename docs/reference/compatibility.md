# Compatibility

What Form & Force runs on, and exactly what has been verified in each environment. "Not tested" means not tested; nothing on this page is inferred.

## Distribution surfaces

| Surface | Status |
|---|---|
| **Claude Code plugin, from GitHub** | Verified with Claude Code 2.1.322 in a clean configuration on 2026-11-12: `claude plugin marketplace add erenthedeveloper0/form-and-force` and `claude plugin install form-and-force@form-and-force` succeed, and the plugin is enabled at 0.2.1 with its references and scripts in place. Loading the skill in a live session was not tested |
| **Claude Code plugin, from a local clone** | Verified with Claude Code 2.1.325 in a clean configuration on 2026-11-16: `claude plugin validate --strict .` passes, and `claude plugin marketplace add <path to the clone>` and `claude plugin install form-and-force@form-and-force` succeed, with the plugin enabled at 0.2.2. Loading the skill in a live session was not tested |
| **Personal or project skill** (a copy of `skills/form-and-force`) | Structure validated by this repository's checks. Loading in a session not tested |
| **claude.ai upload or the Skills API** (the ZIP) | The ZIP is built and verified by this repository's tooling, and is byte-for-byte reproducible. The reference validator `agentskills validate` (skills-ref 0.1.1) was run on 0.1.0 and not repeated. Upload not tested |
| **Other agents that read Agent Skills** | Not tested. The frontmatter uses only portable fields, and the instructions assume a filesystem and a shell |

## Runtimes

| Need | Version | For |
|---|---|---|
| Node | 18 or newer | Every tool. CI runs the tests on the Node that ships with `ubuntu-24.04` |
| Playwright with Chromium | Any recent version; the browser tests last ran with Playwright 1.65.1 and Chrome Headless Shell 159 (2026-11-16) | The rendered tools: `sketch_board`, `audit_page`, `motion_strip`, `contact_sheet` |
| Python | 3.11 or newer | This repository's checks, packaging and documentation site. Not needed to use the skill |
| Claude Code | Recent versions | The plugin. `claude plugin install --marketplace` needs 2.1.292 or later |

## Operating systems

The tools use only Node's built-ins and resolve paths with Node's `path` module. They are developed on macOS, and CI runs the full free test suite on Ubuntu. Windows is not tested; the installation guide gives PowerShell commands, and Python commands use `py` on Windows.

## Known limits

- **Heavy WebGL in headless Chromium** can stall at its loader. Check such builds in a headed browser or on a device.
- **The motion strip** slows CSS, the Web Animations API and JavaScript clocks, but not video or network time.
- **LCP and CLS** come from one lab run, unthrottled. They are not field data.
- **Contrast checks** compare text with the nearest solid background; text over images, video or canvas can read falsely.
- **Native mobile apps** are out of scope.
