# Testing and validation

Checks come in two tiers.

- **Tier A** is free, offline and deterministic. It runs locally and in CI on every pull request.
- **Tier B** runs real Claude sessions and is billed. It runs only when a person asks for it.

A pull request never needs Tier B.

## Tier A: free checks

Requirements: Python 3.11 or newer. Node 18 or newer is recommended, and git is recommended. No packages, API keys or accounts are needed. On Windows, use `py` in place of `python3`.

| Command | What it checks |
|---|---|
| `python3 scripts/validate_repository.py` | Required files; the MIT license text; plugin and marketplace manifests; that versions agree; skill metadata; internal links, anchors and path references; whitespace, line endings and conflict markers; Python, JavaScript and shell syntax; workflow security; eval-suite structure; publication safety (secret patterns, forbidden files, media without provenance, machine-specific paths, file size) |
| `python3 -m unittest discover -s tests -v` | Every validator rule against a deliberately broken copy of the repository; packaging and archive verification; the link-audit logic against a fake network; that paid evals stay opt-in; and regression tests that run the skill's own scanners on the bundled fixture |
| `python3 scripts/package_skill.py` | Builds `dist/form-and-force-<version>.zip`, then reopens it and verifies its structure, links, scripts and file list |
| `git diff --check "$(git hash-object -t tree /dev/null)" HEAD` | Whitespace errors in every committed file (needs a git repository with at least one commit) |
| `claude plugin validate --strict .` | The official Claude Code manifest validator (needs Claude Code; free, no sign-in needed) |
| `python3 scripts/release_check.py [--online]` | All of the above, printed as the release checklist; `--online` also confirms pinned action SHAs against their upstream tags |

### How the checks decide what is published

The validator checks the **publication set**: the files `git add -A` would publish. In a git repository that is the tracked files plus the untracked files `.gitignore` does not exclude. Before `git init`, the same `.gitignore` rules are applied with a temporary index. Either way, a local run matches what a fresh CI checkout sees. A link to a file that exists locally but is ignored is reported as broken, because it would be broken on GitHub.

### When a tool is missing

A check that cannot run is reported as **NOT RUN**. It is never reported as passed. Without Node, the JavaScript syntax checks and scanner tests are skipped and say so. CI sets `FF_REQUIRE_NODE=1`, so in CI those tests fail instead of skipping.

### What the tests do not cover

- They do not run a browser, so `audit_page.mjs` is only syntax-checked and its `--help` output tested.
- They do not measure whether the skill makes Claude's output better. That is Tier B.

## External link audit (on demand)

Links between files in this repository are checked on every run. Links to other websites are not. Third-party sites go down for a while, block automated clients and rate-limit, and none of that should fail a build.

Run the external audit when maintaining the research, or from GitHub with the manual **External link audit** workflow:

```bash
python3 scripts/check_external_links.py --report link-audit.md
```

It sends one request at a time, waits between requests to the same host, and times out each request. It classifies every URL as OK, REDIRECTED, BLOCKED (401/403/429), NOT_FOUND (404/410), SERVER_ERROR, DNS_FAILURE, TIMEOUT or ERROR. A failure is a prompt to check the page in a browser. Do not remove provenance because of one failed check: look for an official successor page or an archive first, and record the outcome in [research/SOURCE_STATUS.md](../research/SOURCE_STATUS.md). `--fail-on-broken` exits 1 on NOT_FOUND or DNS_FAILURE, for use during a research review.

## Tier B: optional paid model evaluations

`evals/` holds five cases in the `claude plugin eval` format. Each has a prompt, graders, and for two cases a scaffold script that writes the fixture project. Claude Code runs each case with the plugin and without it, as a baseline, and scores both.

**What it costs.** Every agent session and every `llm` or `baseline` grader is a model call made with your Claude Code login or `ANTHROPIC_API_KEY`. It counts against your plan's usage limits or your API bill. With each case's default settings the suite starts 20 sessions and up to 16 judge calls. The dollar cost depends on the model and on session length; `claude plugin eval` prints a list-price estimate when it finishes.

**See what would run, for free:**

```bash
python3 scripts/evals.py
```

This reads the case files and prints each case, which graders are free or paid, how many sessions would start, and the exact command. It makes no network or model calls.

**Run it:**

```bash
python3 scripts/evals.py run --confirm-paid --max-cost-usd 5 --runs 1 --scaffold
```

- `--confirm-paid` and `--max-cost-usd` are both required. Without them the command refuses to start.
- `--max-cost-usd` stops new runs once the estimate passes the ceiling; runs already in progress finish.
- `--runs 1` overrides each case's run count, and `--ablation none` drops the baseline arm. Both reduce cost.
- `--scaffold` lets the two scaffolded cases write their fixture files. The scripts are in `evals/*/scaffold.sh`; read them first.
- The report stays local (`--no-publish`) unless you add `--publish`. When you are signed in with a claude.ai subscription that has artifacts, the CLI would otherwise publish the report as a private artifact.
- Results go to `evals/results/`, which git ignores. They can contain generated code and transcripts, so review them before sharing.

You can also call the CLI directly: `claude plugin eval . --allow-tools Write Edit Bash --max-cost-usd 5 --no-publish`.

Never put credentials in the repository, an issue or a pull request. CI does not run Tier B and holds no secrets for it.

## Reporting results

State each check's status exactly, using one of these labels:

| Label | Use when |
|---|---|
| **Passed** | It ran and met its criteria. |
| **Failed** | It ran and did not. Include the output. |
| **Partially completed** | It started but did not finish (for example, the cost ceiling was reached). Say what ran. |
| **Blocked** | It could not start: missing credentials, tools or access. Name what was missing. |
| **Not run** | It was not attempted. |

Never describe a check as passed unless it ran and passed. Current Tier B status: **not run**.
