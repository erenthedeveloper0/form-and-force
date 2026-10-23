# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - Unreleased

The first public release. It has not been tagged or published yet.

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
