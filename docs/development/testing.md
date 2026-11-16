# Testing and evaluation

Form & Force is checked in four ways, and they are never confused with one another. A technically valid result is not a visually successful one, and a passing test is not evidence that the skill improves anyone's work.

| | What it shows | Cost | Where it runs |
|---|---|---|---|
| **1. Deterministic checks** | The repository, the skill, the package, the documentation and the brand are well-formed, and the tools behave as documented | Free, offline | Locally and in CI on every pull request |
| **2. Browser checks** | The rendered tools notice what they claim to notice on real pages | Free, needs Playwright | Locally, on purpose |
| **3. Model evaluations** | Whether Claude, with the skill, behaves as the method asks, compared with Claude without it | Billed per model call | Locally, only when a person asks |
| **4. Human judgement** | Whether the work is good | A person's time | Never automated |

A pull request needs only the first. Report each check's status with the labels at the end of this page.

## 1. Deterministic checks (free)

Requirements: Python 3.11 or newer. Node 18 or newer is strongly recommended. No packages, API keys or accounts. On Windows, use `py` in place of `python3`.

| Command | What it checks |
|---|---|
| `python3 tooling/validate_repository.py` | Required files; the MIT licence; plugin and marketplace manifests; that versions agree; skill metadata; internal links, anchors and path references; whitespace, line endings and conflict markers; Python, JavaScript and shell syntax; workflow security; eval-suite structure; publication safety (secret patterns, forbidden files, media provenance against `ALLOWED_MEDIA` and `brand/manifest.json`, machine-specific paths, file size) |
| `python3 -m unittest discover -s tests -v` | The suites listed below |
| `python3 tooling/package_skill.py` | Builds `dist/form-and-force-<version>.zip`, then reopens it and verifies its structure, links, imports and file list |
| `python3 tooling/sync_docs.py --check` | The generated tables in the documentation (the deck, the atlas index) match their sources |
| `python3 site/build.py --check` | The documentation site builds, every page in `site/nav.json` exists, every `docs/` page is listed, and every link and anchor in the output resolves |
| `node brand/build.mjs --check` | Every committed brand SVG matches what its sources produce |
| `git diff --check "$(git hash-object -t tree /dev/null)" HEAD` | Whitespace errors in every committed file |
| `claude plugin validate --strict .` | The official Claude Code manifest validator (needs Claude Code; free, no sign-in) |
| `python3 tooling/release_check.py [--online]` | All of the above, as the release checklist; `--online` also confirms pinned action SHAs against their upstream tags |

### The test suites

| File | Covers |
|---|---|
| `test_validate_repository.py` | Every validator rule, against a deliberately broken copy of the repository |
| `test_validate_skill.py` | The Agent Skills rules: name, description, portable keys, links, references one level deep, script syntax |
| `test_package_skill.py` | Packaging and archive verification: contents, reproducibility, unsafe paths, unwanted files, static imports |
| `test_skill_scripts.py` | The static scan on the bundled fixture and on generated projects (links built by string concatenation, every template format, coverage and exit codes), the repository inventory, the eval scaffolds, and the command-line contract every tool keeps (`--help`, missing directories, unknown options) |
| `test_creative_method.py` | The method's mechanisms, below |
| `test_library.py` | The component atlas's entry format, index and cross-references; every reference's Contents against its sections |
| `test_brand.py` | Interface colour contrast from `tokens.json`; that the colour guide states every value; that every rendered brand file matches its recorded hash; that the SVGs are current and self-contained; that the skill carries no brand colours or typefaces |
| `test_site.py` | The Markdown renderer, and a full site build with its link checks |
| `test_check_external_links.py` | The external link audit, against a fake network |
| `test_evals_and_release.py` | That paid evaluations stay opt-in; the eval listing; the release gate's ignore probes |
| `test_rendered_tools.py` | The browser checks (section 2); skipped without Playwright |

### What the method tests check

`test_creative_method.py` checks the mechanisms the method relies on, not the quality of any design:

- **The deck** holds questions and structural principles and no colour, typeface or size; every card is complete; every register can be dealt four structures from different families.
- **The dealer** never puts two lenses or two structures of one family in a hand, deals only media the project has, steers away from recent hands, refuses a swap without a reason or a second swap on one frame, accepts `structure` and the older `archetype`, and stores no project path.
- **The motion tokens** stay inside the bands printed in the skill for all sixteen characters and at the extremes; bound characters never overshoot; no two characters are identical; every token a recipe uses is one the generator emits.
- **The design-facts thresholds**, replayed on facts recorded from the fixture pages: the default page is questioned, the directed page is not, and every question reads as a question.
- **The documents:** every `file §N` pointer resolves, every script named exists and is routed from `SKILL.md`, every question a tool can raise is explained in a reference, the retired method's files and terms do not return, and the jury stays separate from the floor.

### How the checks decide what is published

The validator checks the **publication set**: the files `git add -A` would publish. In a git repository that is the tracked files plus the untracked files `.gitignore` does not exclude. Before `git init`, the same rules are applied with a temporary index. Either way a local run matches what a fresh CI checkout sees, and a link to a file that exists locally but is ignored is reported as broken, because it would be broken on GitHub.

### When a tool is missing

A check that cannot run is reported as **NOT RUN**, never as passed. Without Node, the JavaScript syntax checks and the Node tests are skipped and say so. CI sets `FF_REQUIRE_NODE=1`, so there those tests fail instead of skipping.

## 2. Browser checks (free, optional)

`tests/test_rendered_tools.py` opens a real browser on the pages in `tests/fixtures/pages/`: a deliberately default page, a directed one, one that collides at 390 px, and two motion pages (habitual and engineered). It runs the audit, the sketch board and the motion strip on them and checks which questions are raised, that evidence files are written, that failures are reported plainly, and that a missing Playwright is an instruction, not a crash.

The repository never installs Playwright. Point `FF_PLAYWRIGHT_DIR` at a directory that has it:

```bash
mkdir -p ~/.cache/ffpw && cd ~/.cache/ffpw && npm i playwright && npx playwright install chromium
FF_PLAYWRIGHT_DIR=~/.cache/ffpw python3 -m unittest discover -s tests -v
```

Without it these tests are reported as **skipped**. CI does not set it, so CI never runs them; a pull request that changes a rendered tool says whether they were run. After a deliberate change to what `design_facts.mjs` measures, refresh the recorded facts with `FF_UPDATE_FACTS=1` in the same command.

Rebuilding the brand's raster files (`node brand/build.mjs`) also needs a browser; see [brand and site](brand-and-site.md).

## 3. Model evaluations (paid, opt-in)

`evals/` holds twelve cases in the `claude plugin eval` format. Each has a prompt and graders, and four have a scaffold script that writes a fixture. Claude Code runs each case with the plugin and without it, as a baseline, and scores both.

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

Not covered: a developer portfolio, an architecture studio, a large e-commerce catalogue, an immersive campaign with 3D, and a design system. The graders check behaviours that can be read from files and messages. The sandbox has no browser, so no case exercises the rendered tools; the cases check instead that the report says so.

**What it costs.** Every agent session and every `llm` or `baseline` grader is a model call made with your Claude Code login or `ANTHROPIC_API_KEY`, counted against your plan's limits or your API bill. With each case's defaults the suite starts 48 sessions and up to 60 judge calls. Use `--case` to run one case at a time.

**See what would run, for free:**

```bash
python3 tooling/evals.py
```

It reads the case files and prints each case, which graders are free or paid, how many sessions would start, and the exact command. It makes no network or model calls.

**Run it:**

```bash
python3 tooling/evals.py run --confirm-paid --max-cost-usd 5 --runs 1 --scaffold
```

- `--confirm-paid` and `--max-cost-usd` are both required; without them the command refuses to start.
- `--max-cost-usd` stops new runs once the estimate passes the ceiling; runs in progress finish.
- `--runs 1` overrides each case's run count, and `--ablation none` drops the baseline arm. Both reduce cost.
- `--scaffold` lets the four scaffolded cases write their fixture files. Read `evals/*/scaffold.sh` first.
- The report stays local (`--no-publish`) unless you add `--publish`.
- Results go to `evals/results/`, which git ignores. They can contain generated code and transcripts; review them before sharing.

No workflow runs the evaluations, and the validator fails any workflow that tries. Never put credentials in the repository, an issue or a pull request.

### What a run can and cannot show

- **With and without the plugin** is the comparison `claude plugin eval` makes: whether the skill changes behaviour against no skill.
- **One version against another** is not something the tool compares. To do it by hand, check out the older commit (0.1.0 is `5bcd2bb`) into a second worktree, run the same cases from each with `--ablation none --runs 1`, and compare pass rates per grader.
- **Limits.** Two runs per case is a small sample. The `llm` graders are the same model family as the agent and share its preferences ([research ledger](../../research/RESEARCH_LEDGER.md), H4). Graders reward behaviours that can be described in advance, which is exactly what an original result is not. A high pass rate would show the method is being followed. It would not show the work is good.

## 4. Human judgement

Whether a design is good is decided by people looking at it. The project uses three protocols.

**Blind comparison of versions.** To compare what two versions of the skill produce for the same brief, put the pages side by side on one board and have someone who does not know which is which choose:

```bash
node skills/form-and-force/scripts/sketch_board.mjs old/index.html new/index.html --labels P,Q
```

Record which label is which in a separate note before showing the board, and record the choice and the reason before revealing it. This is the only check in the project that bears on taste.

**The jury in a fresh context.** On large work the skill's jury sits in a context that has not seen the rationale (a subagent, a second session, or you), working from the evidence and the [jury brief](../../skills/form-and-force/assets/jury-brief.md) alone until its cold read is written.

**Brand review.** Changes to the brand are reviewed against the storyboard on the [brand board](../../brand/previews/form-and-force-brand-board.jpg) and the [variations sheet](../../brand/previews/form-and-force-variations.jpg), at full size and at the smallest size each asset is used.

None of these is run in CI, and none of their results is ever reported as a test result.

## External link audit (on demand)

Links between files in this repository are checked on every run. Links to other websites are not: third-party sites go down for a while, block automated clients and rate-limit, and none of that should fail a build. Run the external audit when maintaining the research, or from GitHub with the manual **External link audit** workflow:

```bash
python3 tooling/check_external_links.py --report link-audit.md
```

It sends one request at a time, waits between requests to the same host, and classifies every URL as OK, REDIRECTED, BLOCKED (401/403/429), NOT_FOUND (404/410), SERVER_ERROR, DNS_FAILURE, TIMEOUT or ERROR. A failure is a prompt to check the page in a browser. Do not remove provenance because of one failed check: look for an official successor or an archive first, and record the outcome in [SOURCE_STATUS.md](../../research/SOURCE_STATUS.md). `--fail-on-broken` exits 1 on NOT_FOUND or DNS_FAILURE.

## Reporting results

| Label | Use when |
|---|---|
| **Passed** | It ran and met its criteria |
| **Failed** | It ran and did not. Include the output |
| **Partially completed** | It started but did not finish (for example, the cost ceiling was reached). Say what ran |
| **Blocked** | It could not start: missing credentials, tools or access. Name what was missing |
| **Not run** | It was not attempted |

Never describe a check as passed unless it ran and passed. Current model-evaluation status: **not run** on any release.
