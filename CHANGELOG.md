# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [0.2.2] - 2026-11-16

The skill's tools keep one command-line contract and no longer pass a mistyped path in silence, and the component atlas is numbered and indexed. Around the skill, the repository is reorganised, gains an identity built from the maintainer's storyboard, a documentation site and complete project documents. The creative method is unchanged.

### Fixed
- **Source files named like a repository's documents are scanned.** `slop_scan.mjs` left out `pages/security.tsx`, `components/Agents.jsx`, `Changelog.vue` and any other source file whose name starts with README, CHANGELOG, CONTRIBUTING, LICENSE, SECURITY, CODE_OF_CONDUCT, CLAUDE, AGENTS or SKILL, as if it were the repository's own `README.md`, and said nothing about it. Only Markdown files are left out for those names now. A project with such pages can report findings in them that it did not report before.
- **A path that is not a directory is an error, not an empty pass.** `slop_scan.mjs` given a mistyped path reported "0 files" and exited 0, even with `--strict`, so a CI gate could pass on a typo; `inspect_repo.mjs` crashed. Both, and `contact_sheet.mjs`, now say the path is not a directory and exit 2.
- **Every tool prints its usage with `--help`, as `SKILL.md` says.** `inspect_repo.mjs` and `slop_scan.mjs` ignored the flag and scanned the current directory; `contact_sheet.mjs` printed usage only without arguments; `deal.mjs` treated `-h` as an unknown command; `motion_tokens.mjs` printed a summary instead of its header; `audit_page.mjs` printed its header with comment markers.
- **`audit_page.mjs` refuses an unknown option** instead of auditing it as a URL. `--viewport 390x844` (for `--viewports`) used to start an audit of a page called `--viewport`.
- **`deal.mjs deck <part>`** with an unknown part is an error instead of printing nothing.
- **`slop_scan.mjs`'s combined-sameness finding** pointed readers to `references/anti-slop-constitution.md`, a file retired in 0.2.0. It now points to `floor.md` §5 and §10, and a test keeps retired names out of the scripts as well as the references.

### Changed
- **Structures are called structures on the command line.** `deal.mjs swap --part structure` and `deal.mjs deck structures`, matching the documents and the printed hand. `archetype` is still accepted, and `deck.json`, history files and `--json` output keep the key `archetype`, so nothing stored changes.
- **The component atlas** numbers its sections 1 to 12 (they were 8.1 to 8.12, left over from an older document), opens with an index of all 180 components by section, documents one-line cross-reference entries, and gives "Mobile-specific content hierarchy" the accessibility line it was missing. `floor.md` §11 documents the scan's exit on a missing path.
- **Repository tooling moved from `scripts/` to `tooling/`**, so the repository no longer has two `scripts/` folders in two languages. Commands change accordingly: `python3 tooling/validate_repository.py`, `python3 tooling/package_skill.py`, `python3 tooling/release_check.py`, `python3 tooling/evals.py`.
- **A new identity**, built from the maintainer's branding storyboard: an F made of two strokes, satin on dark grounds, with folds lit along their edges. `brand/` holds the sources (the storyboard, the traced mark, colour and type tokens, the outlined wordmark), the guidelines, and every generated file: marks, four lockups, app-icon tiles, favicons, README banners for light and dark, the social preview, backgrounds, a brand board and a sheet of the variations explored. `.claude-plugin/icon.png` is re-rendered. The 0.1–0.2 identity (`assets/`, the sheared disc rendered by `assets/brand/render.py`) is retired.
- **The README** is rewritten around the new documentation and brand.
- **Testing and releasing guides** moved to `docs/development/`. Testing now describes four kinds of verification: deterministic checks, browser checks, paid model evaluations and human judgement.
- **The validator** accepts a rendered brand file only when `brand/manifest.json` records its exact hash, allows the storyboard past the size limit so it is kept byte for byte, and allows write permissions in one place only: the manual Pages workflow, while it stays manual.
- **CI** also checks the generated documentation tables and builds the documentation site, failing on any broken link or anchor.

### Added
- **Documentation:** an introduction, a quick start, how it works, seven guides (creative direction, visual exploration, design language, motion, building, the floor and the jury, reviewing existing work), reference pages (tools, the reference library, the component atlas, the deck, templates, configuration, compatibility), troubleshooting, and development guides for extending the project and for the brand and site.
- **A documentation site** built from the Markdown by `site/build.py` (Python standard library), with the brand's tokens and fonts, light and dark themes, search across every page and every atlas entry, and a link check that fails the build. A manual workflow deploys it to GitHub Pages.
- **Project documents:** `ARCHITECTURE.md`, `ROADMAP.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTORS.md`, `THIRD_PARTY_NOTICES.md`, and issue templates for bugs, suggestions and design outcomes.
- **`tooling/sync_docs.py`** regenerates documentation tables from `deck.json` and the atlas, with `--check` for CI.
- **Tests:** `test_brand.py` (contrast of the documentation's colours, brand provenance, current SVGs, and that the skill carries no brand), `test_library.py` (the atlas's format and index, references' contents), `test_site.py` (the Markdown renderer and a full site build), and a command-line contract test for every tool.

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
