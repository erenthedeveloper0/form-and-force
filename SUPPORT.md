# Support

Form & Force is maintained by one person in their own time. There is no paid support and no guaranteed response time, but reports are read.

## Before you ask

- [Troubleshooting](docs/troubleshooting.md) covers installation, the skill not loading, the rendered tools, the scan, the dealer and this repository's checks.
- [Installation](docs/installation.md) and [compatibility](docs/reference/compatibility.md) say what has been verified, and where.
- The [documentation home](docs/README.md) links everything else.

## Where to go

| You have | Go to |
|---|---|
| A bug: a tool fails, a check is wrong, the skill does something its documents say it should not | [Report a bug](https://github.com/erenthedeveloper0/form-and-force/issues/new?template=bug_report.yml) |
| A case where the method produced poor work | [Report a design outcome](https://github.com/erenthedeveloper0/form-and-force/issues/new?template=design_outcome.yml). These are the most useful reports the project receives |
| An idea or a request | [Suggest an improvement](https://github.com/erenthedeveloper0/form-and-force/issues/new?template=feature_request.yml) |
| A security problem | **Not an issue.** Report it privately, as described in [SECURITY.md](SECURITY.md) |
| A question about how something works | An issue is fine; say it is a question |

## What to include

- The version (`.claude-plugin/plugin.json`, or `claude plugin list`) and how it was installed.
- Your Claude Code version, Node version and operating system, and whether Playwright is installed.
- The exact command or request, and the output or behaviour you saw.
- For design outcomes: the brief, what the skill produced (screenshots are fine), and what you expected.

Never paste API keys, tokens, `.env` contents or private project files into an issue. Remove anything you would not publish.

## Supported versions

Fixes are made on the latest release only. Update with `claude plugin update form-and-force@form-and-force`.
