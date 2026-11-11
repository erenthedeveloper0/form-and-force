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
| `python3 -m unittest discover -s tests -v` | Every validator rule against a deliberately broken copy of the repository; packaging and archive verification; the link-audit logic against a fake network; that paid evals stay opt-in; the skill's scanners on the bundled fixture; and the creative method's mechanisms (next section) |
| `python3 scripts/package_skill.py` | Builds `dist/form-and-force-<version>.zip`, then reopens it and verifies its structure, links, scripts and file list |
| `git diff --check "$(git hash-object -t tree /dev/null)" HEAD` | Whitespace errors in every committed file (needs a git repository with at least one commit) |
| `claude plugin validate --strict .` | The official Claude Code manifest validator (needs Claude Code; free, no sign-in needed) |
| `python3 scripts/release_check.py [--online]` | All of the above, printed as the release checklist; `--online` also confirms pinned action SHAs against their upstream tags |

### How the checks decide what is published

The validator checks the **publication set**: the files `git add -A` would publish. In a git repository that is the tracked files plus the untracked files `.gitignore` does not exclude. Before `git init`, the same `.gitignore` rules are applied with a temporary index. Either way, a local run matches what a fresh CI checkout sees. A link to a file that exists locally but is ignored is reported as broken, because it would be broken on GitHub.

### When a tool is missing

A check that cannot run is reported as **NOT RUN**. It is never reported as passed. Without Node, the JavaScript syntax checks and scanner tests are skipped and say so. CI sets `FF_REQUIRE_NODE=1`, so in CI those tests fail instead of skipping.

### What the method tests check

`tests/test_creative_method.py` needs only Python and Node. It checks the mechanisms the method relies on, not the quality of any design:

- **The deck** holds questions and structural principles and no colour, typeface or size; every card is complete; every register can be dealt four structures from different families.
- **The dealer** never puts two lenses or two structures of one family in a hand, deals only media the project has, steers away from recent hands, refuses a swap without a reason or a second swap on one frame, and stores no project path.
- **The motion tokens** stay inside the bands printed in the skill for all sixteen characters and at the extremes; bound characters never overshoot; no two characters are identical; every token a recipe uses is one the generator emits.
- **The design-facts thresholds**, replayed on facts recorded from the fixture pages: the default page is questioned, the directed page is not, and every question reads as a question.
- **The documents**: every `file §N` pointer resolves, every script named exists and every tool is routed from `SKILL.md`, every question a tool can raise is explained in a reference, the retired method's files and terms do not return, and the jury stays separate from the floor.

### Rendered-tool tests (optional, free)

`tests/test_rendered_tools.py` opens a real browser on the pages in `tests/fixtures/pages/`: a deliberately default page, a directed one, one that collides at 390 px, and two motion pages (habitual and engineered). It runs the audit, the sketch board and the motion strip on them and checks which questions are raised.

These tests need Playwright with Chromium. The repository never installs it. Point `FF_PLAYWRIGHT_DIR` at a directory that has it and they run; without it they are reported as **skipped**:

```bash
mkdir -p ~/.cache/ffpw && cd ~/.cache/ffpw && npm i playwright && npx playwright install chromium
FF_PLAYWRIGHT_DIR=~/.cache/ffpw python3 -m unittest discover -s tests -v
```

CI does not set it, so CI never runs them. After changing what `design_facts.mjs` collects, refresh the recorded facts with `FF_UPDATE_FACTS=1` in the same command.

### What the tests do not cover

- Without `FF_PLAYWRIGHT_DIR`, no browser runs: the rendered tools are syntax-checked, their refusals are tested, and their behaviour on a page is not.
- They do not measure whether the skill makes Claude's output better. That is Tier B.
- No test can say whether a design is good. The fixtures check that the tools notice what they claim to notice.

## External link audit (on demand)

Links between files in this repository are checked on every run. Links to other websites are not. Third-party sites go down for a while, block automated clients and rate-limit, and none of that should fail a build.

Run the external audit when maintaining the research, or from GitHub with the manual **External link audit** workflow:

```bash
python3 scripts/check_external_links.py --report link-audit.md
```

It sends one request at a time, waits between requests to the same host, and times out each request. It classifies every URL as OK, REDIRECTED, BLOCKED (401/403/429), NOT_FOUND (404/410), SERVER_ERROR, DNS_FAILURE, TIMEOUT or ERROR. A failure is a prompt to check the page in a browser. Do not remove provenance because of one failed check: look for an official successor page or an archive first, and record the outcome in [research/SOURCE_STATUS.md](../research/SOURCE_STATUS.md). `--fail-on-broken` exits 1 on NOT_FOUND or DNS_FAILURE, for use during a research review.

## Tier B: optional paid model evaluations

`evals/` holds twelve cases in the `claude plugin eval` format. Each has a prompt, graders, and for four cases a scaffold script that writes a fixture. Claude Code runs each case with the plugin and without it, as a baseline, and scores both.

| Case | What it asks of the skill |
|---|---|
| `direction-before-build` | A direction is dealt, sketched and committed before the build, and the page is not the twin |
| `luxury-house-not-a-palette` | Premium is derived from this house, against the cream-and-serif convention; missing photographs become directed slots |
| `studio-site-radical-with-a-way-out` | One authored mechanic from the subject, with a conventional accessible route to everything |
| `clinic-site-quiet-not-bland` | Restraint held as a conviction; no spectacle added; nothing invented |
| `longform-editorial-reading-first` | Reading typography, a graphic that carries supplied evidence, a quiet reading chrome |
| `jury-rejects-the-twin` | A review that reaches the idea itself on a clean, interchangeable page, and redesigns nothing uninvited |
| `menu-microinteraction-craft` | One interaction in a daily-use tool: the frequency gate, interruption, origin, a shorter exit |
| `ceramics-landing-from-vague-brief` | A vague "premium" brief turned into a subject-derived page |
| `ops-dashboard-not-marketing` | Application density and states instead of marketing aesthetics |
| `gsap-react-scroll-section` | Motion lifecycle, reduced motion and a mobile variant in React |
| `audit-generic-saas-landing` | Inspect first, fix real defects, report honestly |
| `does-not-trigger-on-backend` | The skill stays out of a backend task |

Not covered: a developer portfolio, an architecture studio, a large e-commerce catalogue, an immersive campaign with 3D, and a design system. The graders check behaviours that can be read from files and messages. The sandbox has no browser, so no case exercises the rendered tools, and the cases instead check that the report says so.

**What it costs.** Every agent session and every `llm` or `baseline` grader is a model call made with your Claude Code login or `ANTHROPIC_API_KEY`. It counts against your plan's usage limits or your API bill. With each case's default settings the suite starts 48 sessions and up to 60 judge calls. Use `--case` to run one case at a time. The dollar cost depends on the model and on session length; `claude plugin eval` prints a list-price estimate when it finishes.

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
- `--scaffold` lets the four scaffolded cases write their fixture files. The scripts are in `evals/*/scaffold.sh`; read them first.
- The report stays local (`--no-publish`) unless you add `--publish`. When you are signed in with a claude.ai subscription that has artifacts, the CLI would otherwise publish the report as a private artifact.
- Results go to `evals/results/`, which git ignores. They can contain generated code and transcripts, so review them before sharing.

You can also call the CLI directly: `claude plugin eval . --allow-tools Write Edit Bash --max-cost-usd 5 --no-publish`.

Never put credentials in the repository, an issue or a pull request. CI does not run Tier B and holds no secrets for it.

### What a run can and cannot show

- **With and without the plugin** is the comparison `claude plugin eval` makes. It shows whether the skill changes behaviour against no skill at all.
- **0.1.0 against 0.2.0** is not something the tool compares. To do it by hand, check out the 0.1.0 commit (`5bcd2bb`) into a second worktree, run the same cases from each with `--ablation none --runs 1`, and compare the pass rates per grader. Then put the pages each version produced for the same brief on one board (`sketch_board.mjs old/index.html new/index.html`) and have a person who does not know which is which choose. That last step is the only one that bears on taste.
- **Limits.** Two runs per case is a small sample. The `llm` graders are the same model family as the agent and share its preferences ([research ledger](../research/RESEARCH_LEDGER.md), H4). Graders reward behaviours that can be described in advance, which is exactly what an original result is not. A high pass rate would show the method is being followed. It would not show the work is good.

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
