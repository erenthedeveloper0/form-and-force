# Security policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue.

Use GitHub's private vulnerability reporting: [report a vulnerability](https://github.com/erenthedeveloper0/form-and-force/security/advisories/new), or choose **Report a vulnerability** on the repository's **Security** tab. Only the maintainers can see the report.

Please include:
- the affected file or component, and the version or commit;
- steps to reproduce, and what an attacker could achieve;
- any suggested fix.

## What is in scope

- The bundled scripts in `skills/form-and-force/scripts/`. They run on users' machines against their projects. The design rules: no network calls beyond the URL you pass to `audit_page.mjs`, never read secret files, and never print a matched secret's value.
- The repository tooling in `scripts/`, and the GitHub Actions workflows.
- Skill instructions that could lead Claude into unsafe actions, such as installing packages globally, exposing secrets or fabricating claims.

Third-party websites cited in `research/` are out of scope. Report problems with those sites to their owners.

## Handling secrets

- Never include API keys, tokens, credentials, `.env` files or private project files in an issue, a pull request, a log or a commit.
- CI runs with read-only permissions and uses no secrets. The optional paid evaluations run only on your own machine, with your own credentials.
- If you commit a credential by accident, revoke and rotate it at the provider right away. Deleting the file afterwards is not enough, because it stays in git history and in any clone.

## Limits of the automated checks

`scripts/validate_repository.py` and `scripts/release_check.py` scan for common credential patterns. A pattern scan cannot prove that a repository contains no secrets. It reduces risk; it does not replace review.

## Supported versions

Security fixes are made on the latest release only.
