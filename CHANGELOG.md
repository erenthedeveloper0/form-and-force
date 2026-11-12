# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).


## [0.2.1] - 2026-11-12

Two fixes to the static scan, `slop_scan.mjs`, both from issue reports.

### Fixed
- **`dead-link` no longer fails links built by string concatenation.** `'<a href="' + url + '">'`, `"<a href='" + url + "'>"` and Vue bindings such as `:href="'/posts/' + slug"` were reported as a category C failure, because the two different quotes on either side of the concatenation were read as an empty href. The quotes around an empty or `#` value must now be the same character. `href="#"`, `href=""`, `href=''`, `href={"#"}`, a bound `:href="'#'"` and `javascript:` links are caught as before, and `href={""}` is now caught too. ([#2](https://github.com/erenthedeveloper0/form-and-force/issues/2))
- **Server-rendered templates are no longer skipped in silence.** A Laravel, Rails or Shopify project could come back as "0 files, no triggers found" and pass `--strict` without one view being read. Blade (`.blade.php`), ERB, EJS, Twig, Nunjucks (`.njk`), Jinja (`.j2`), Handlebars (`.hbs`), Mustache and Liquid files are now read, in their own syntax: template comments are ignored, a `=>` or `%>` inside a tag does not end it, and a tag whose attributes are printed at render time is not reported as missing one. A template is read whatever it is called: the scan leaves out a repository's `README.md`, `SECURITY.md` and similar documents, but `security.blade.php` is a page. ([#3](https://github.com/erenthedeveloper0/form-and-force/issues/3))

### Changed
- **Every scan states its coverage:** `complete`, `partial` (templates were read as markup, or a source file was skipped for being over 800 kB or impossible to open), `incomplete` (template files were not read) or `empty`. Template formats the scan has no rules for (Pug, Haml, Slim, Razor, JSP, PHTML, HEEx, Go HTML) are counted and listed by extension. The JSON output gains a `coverage` object and `summary.coverage`, and `filesScanned` counts only files that were opened.
- **`slop_scan.mjs --strict` exits 2** when there is no C finding but template files were not read. It still exits 1 on any C finding and 0 otherwise, and without `--strict` it exits 0 as before. A project with templates can now report failures, or exit 2, where it exited 0: those files were never checked before.
- `floor.md` §11 documents coverage and the exit codes, and gate G1 asks for a manual read of every file the scan did not read.
- A template is read as markup. What a helper, a component or an include prints at render time (`link_to`, `image_tag`, an attribute bag) is not seen. Plain `.php` files are treated as code and are neither read nor listed.

## [0.2.0] - 2026-11-11

The creative method is replaced. 0.1.0 produced coherent, careful and predictable work; this release changes how a direction is found, proved and judged. The diagnosis and the reasoning are in `research/CREATIVE_METHOD.md`. No model evaluation has been run on this version yet, so the improvement is argued and not measured.

### Changed
- **`SKILL.md` is rewritten around a new loop:** read, set a register, write down the twin, deal a hand, sketch frames on a board, commit, derive the language from the chosen frame, build, clear the floor, sit the jury. It routes each kind of task to the references it needs and names what to skip.
- **Direction is dealt, drawn and then chosen.** `deal.mjs` deals a lens, a compositional structure and a lead medium for each key frame, never two from one family, away from recent hands, and limited to material the project really has. Frames are sketched as standalone pages and compared on one board before any is preferred.
- **Ambition is set by a register** (Quiet, Composed, Expressive, Radical) decided from the brief. Timid and overwrought are both failures, and restraint is no longer confused with either.
- **Critique is a jury on rendered evidence.** A cold read from the first screen, a test against the twin, ten dimensions marked in words with evidence, findings with a location and a change, and four verdicts, two of which send the work back to the idea. The Awwwards-weighted scorecard is gone.
- **Hard gates are separate from judgement.** Ten pass-or-fail gates and the registry of defaults live in `floor.md`, which now also lists this skill's own attractor.
- **Motion values are generated from a character** and stay inside documented bands. There are no example curves to copy.
- `audit_page.mjs` also writes `first.jpg` (the first screen at every width, with a blurred copy), `flatplan.jpg` (every screen in order) and design facts phrased as questions. Its evidence is composed piece by piece, so one failed image no longer discards the rest.
- `project-modes.md` gives each mode its usual register, key frame and twin. `component-atlas.md` (renamed from `anti-slop-component-atlas.md`) is positioned as a build-time reference, not a source of designs.
- The report template follows the new method: direction and twin, the floor with actual results, the jury's marks and verdict, what is open.

### Added
- References: `direction.md`, `composition.md`, `typography.md`, `colour-and-imagery.md`, `creative-coding.md`, `motion-direction.md`, `motion-craft.md`, `jury.md`, `floor.md`.
- Scripts: `deal.mjs` with `deck.json` (26 lenses in 8 families, 17 structures in 6 families, 8 lead media; no colours, typefaces or sizes), `sketch_board.mjs`, `motion_tokens.mjs`, `motion_strip.mjs`, `design_facts.mjs` and the shared `browser.mjs`.
- `motion_strip.mjs` plays one moment in slow motion as a filmstrip and reports what animated, an interruption, the way back, layout shift, declared delays and a reduced-motion run.
- Templates: `direction-brief.md`, `jury-brief.md` (for a juror in a fresh context), `motion-score.md`.
- Seven eval cases for the new method (direction before build, luxury that is not a palette, a radical site with a way out, a quiet site that is not bland, long-form editorial, a jury that rejects a competent twin, one engineered micro-interaction), with two fixtures. Written and structure-checked; not run.
- Regression tests for the deck, the dealer, the motion tokens, the design-facts thresholds and the agreement between documents and tools; browser tests for the rendered tools that run when `FF_PLAYWRIGHT_DIR` is set and are skipped otherwise.
- Research: `CREATIVE_METHOD.md`, `INSTRUMENT_CALIBRATION.md`, and ledger section H.

### Removed
- `creative-process.md`, `quality-gates.md`, `anti-slop-constitution.md`, `motion-intelligence.md`, `motion-implementation.md`, `visual-implementation.md`, and the `creative-brief.md` and `motion-spec.md` templates. Their useful content moved into the references above.

### Fixed
- The design-facts instrument was calibrated on 19 reference sites and 11 stock templates. The repetition measure no longer counts list rows, table rows or navigation as cards; two questions that flagged strong work and missed weak work were removed; a text-collision probe was added. Details and limits are in `research/INSTRUMENT_CALIBRATION.md`.

## [0.1.0] - 2026-10-23

The first public release.

### Added
- The `form-and-force` Agent Skill: a workflow from inspection to report, 15 references, 4 templates, and 4 Node scripts (`inspect_repo`, `slop_scan`, `audit_page`, `contact_sheet`).
- Claude Code plugin packaging at the repository root, with a one-plugin marketplace (`.claude-plugin/`).
- A standalone skill ZIP builder with archive verification and byte-for-byte reproducible output (`scripts/package_skill.py`).
- Free, offline repository checks (`scripts/validate_repository.py`, `scripts/validate_skill.py`) and a unit and regression test suite (`tests/`).
- A release-readiness gate (`scripts/release_check.py`), an on-demand external link audit (`scripts/check_external_links.py`), and opt-in wrappers for the paid evaluations (`scripts/evals.py`).
- GitHub Actions CI with read-only permissions and SHA-pinned actions, a manual link-audit workflow, and Dependabot for actions.
- An optional model-evaluation suite (5 cases), not yet run.
- Research ledger, reference corpus, anti-slop taxonomy, technical foundations, research gaps and a source-status register.
- MIT License, contribution guide, security policy, installation, testing and release guides.
- Brand identity rendered from code (`assets/brand/render.py`): the README banner, the GitHub social preview, the plugin listing icon and an SVG mark.

### Fixed (since the unpublished draft)
- `audit_page.mjs --help` prints exactly its header comment. It previously printed the first `import` line too.

### Research
- Re-verified the three inaccessible seed references on 2026-10-23. Adobe Taking Shape and Vogue Talents 21 are now documented as historical, from studio and Awwwards stills. Deep Beauty remains inferred from secondary evidence. Details are in `research/SOURCE_STATUS.md`.
- Third-party website screenshots are no longer part of the distributed repository.
