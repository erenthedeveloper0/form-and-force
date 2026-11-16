# Extending Form & Force

How to add to each part of the project without breaking what depends on it. Read [ARCHITECTURE.md](../../ARCHITECTURE.md) first for where things live and why. Everything under `skills/form-and-force/` ships to users; keep development notes out of it.

## A reference

References are the skill's knowledge. The agent loads one only when `SKILL.md` routes a stage or a task to it.

1. **Decide whether it is new.** Most new guidance belongs in an existing reference. A new file is justified when a topic has its own stage or its own kind of task, and would otherwise make another reference serve two purposes.
2. **Write it** in `skills/form-and-force/references/<name>.md`, lower-case with hyphens:
   - a one-paragraph opening that says what it is for and when to read it;
   - numbered sections (`## 1. Title`), so other files can point at them;
   - a `## Contents` list that matches the sections, if it runs over 100 lines;
   - questions and principles, not answers: no example palettes, typeface pairings or token values;
   - claims that trace to the [research ledger](../../research/RESEARCH_LEDGER.md), or that say they are reasoned.
3. **Route to it from `SKILL.md`**: link it in the stage that needs it, and add it to the "Load only what the task needs" table if a task should load or skip it. The validator fails a reference that `SKILL.md` does not link. Keep `SKILL.md` under its token budget (a test fails past about 4,500 tokens); move detail into the reference, not the manual.
4. **Point at sections** from other files as `name.md §N`. A test resolves every pointer.
5. **Add it to the site and the map**: an entry in `site/nav.json` under "The skill", and a row in [docs/reference/library.md](../reference/library.md).
6. **Check:** `python3 tooling/validate_repository.py`, `python3 -m unittest discover -s tests`, `python3 site/build.py --check`, `python3 tooling/package_skill.py`.

## An atlas entry

1. Find the section in `component-atlas.md` (§1–§12) where the component's job belongs, and check the name is not taken: `grep -n "^### " skills/form-and-force/references/component-atlas.md`.
2. Copy the field order of a neighbouring entry exactly: Job; Generic and Why it fails; Stronger; Keep convention when; Decide; Content, Motion, Responsive, A11y; States; Build; Test, Severity, Evidence; Example. Use `—` for a field that genuinely does not apply, never omit it.
3. If another entry or reference already covers the component, write a one-line cross-reference instead: `- See "Entry name" (§N). … **Severity:** A. **Evidence:** ….`
4. Severity starts with **A** (a review trigger) or **C** (a failure if violated). Evidence cites ledger IDs, corpus sections or references.
5. "Stronger" lines are ways out to be re-derived from the project, never designs to copy. Do not name colours, typefaces or sizes.
6. Add the name to the section's line in the atlas's Contents, in order, and update the counts. `tests/test_library.py` checks the index against the entries.
7. Run `python3 tooling/sync_docs.py` to regenerate the atlas index in the documentation.

## A deck card

The deck (`skills/form-and-force/scripts/deck.json`) is the dealer's source.

- **Lenses** are questions. Give a lens an `id`, `family`, `name`, `ask` (the question), `answer` (the form the answer takes), `restraint` (how it applies in a restrained register) and `trap`. Optional `variants` fill the `{variant}` slot in the question.
- **Structures** (stored under `archetypes`) are compositional principles: `id`, `family`, `name`, `registers` (the levels 1–4 that may be dealt it), `principle`, `decide` and `risk`.
- **Never** name a colour, a typeface or a size on a card: a test fails the deck if one appears.
- **Never rename an id.** Ids are stored in people's history files.
- Keep every register able to deal four structures from different families; a test checks it.
- Run `python3 tooling/sync_docs.py` to regenerate [the deck reference](../reference/deck.md).

## A tool

1. Write `skills/form-and-force/scripts/<name>.mjs`: a `#!/usr/bin/env node` line, the SPDX line, and a header comment that is the usage (it is what `--help` prints).
2. Node built-ins only. If it needs a browser, import `browser.mjs` and let it resolve Playwright; never import Playwright statically, never install anything, and make no network calls beyond the URLs the user passes. Never read secret files.
3. Keep the command-line contract: `--help` and `-h` print usage and exit 0 without side effects; usage errors and missing inputs exit 2 with a message that names the problem; a finding the tool exists to report may exit 1.
4. Route it from `SKILL.md`'s scripts table and the stage that uses it. A test fails if a tool is missing from the table.
5. Any question the tool can raise must be explained in `jury.md` or `motion-craft.md`; a test checks it.
6. Add tests in `tests/test_skill_scripts.py` (or `test_rendered_tools.py` for browser behaviour), and document it in [the tools reference](../reference/tools.md).

## A template

Templates live in `skills/form-and-force/assets/`. Keep them to one screen where possible, link them from the stage in `SKILL.md` that uses them, add them to `site/nav.json`, and describe them in [templates](../reference/templates.md).

## An eval case

1. Create `evals/<case-name>/prompt.md` with frontmatter that has a `description` (and optionally `runs`, `max_turns`, `allowed_tools`).
2. Add graders in `evals/<case-name>/graders/*.md`, each with a `type` of `regex`, `tool_used`, `tool_order`, `file_exists`, `llm` or `baseline`. Prefer free grader types; every `llm` or `baseline` grader is a billed call per run.
3. If the case needs files, add a `case.yaml` naming the directory and a `scaffold_script`, and a fixture under `evals/fixtures/`. A test checks that the scaffold reproduces the fixture exactly.
4. Run `python3 tooling/evals.py` (free) to see what a run would cost. Do not run the paid suite in CI, and report a case as **not run** until it has been.

## A documentation page

Write it in `docs/`, add it to `site/nav.json` in the right section, and link it from [docs/README.md](../README.md). The site build fails if a page under `docs/` is not in the navigation, or if any link or anchor does not resolve. If the page repeats data that lives elsewhere, generate that part: add a block to `tooling/sync_docs.py` and mark it with `<!-- generated:name -->` … `<!-- /generated -->`.

## A brand asset

Add the composition to `brand/build.mjs`, using only tokens from `brand/source/tokens.json`, and rebuild. The manifest records the new file's hash, which is what the validator accepts as provenance. See [brand and site](brand-and-site.md).
