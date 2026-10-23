# Research

The evidence behind the Form & Force skill. Nothing in this folder ships in the plugin's skill package. It documents why the skill says what it says.

| File | Contents |
|---|---|
| [RESEARCH_LEDGER.md](RESEARCH_LEDGER.md) | Every source read or measured: question, finding, verification status, and the skill file it shaped. |
| [REFERENCE_CORPUS.md](REFERENCE_CORPUS.md) | 21 rendered reference sites analysed on 12 fields, plus the three seed references that no longer run. |
| [ANTI_SLOP_TAXONOMY.md](ANTI_SLOP_TAXONOMY.md) | Classification of generic-design failure patterns. |
| [TECHNICAL_FOUNDATIONS.md](TECHNICAL_FOUNDATIONS.md) | Motion, accessibility and performance foundations. |
| [RESEARCH_GAPS.md](RESEARCH_GAPS.md) | What the research could not establish. |
| [SOURCE_STATUS.md](SOURCE_STATUS.md) | Verification status of inaccessible or partly accessible sources, with dates and what was inspected. |
| `captures/<site>/report.json` | Measured output of `skills/form-and-force/scripts/audit_page.mjs` for each corpus site. |

## How claims are labelled

The ledger uses **Verified**, **Inferred** and **Disputed**. [SOURCE_STATUS.md](SOURCE_STATUS.md) adds labels for sources that are archived, partly accessible or inaccessible. An observation from a screenshot is never reported as observed behaviour.

## Updating the research

1. Record each new source in the ledger with its date, type and verification status.
2. Run `python3 scripts/check_external_links.py --report link-audit.md` to audit external links. A failed check is a prompt for manual review. Before removing provenance, look for an official successor page or an archived copy, and record the outcome in [SOURCE_STATUS.md](SOURCE_STATUS.md).
3. Run `python3 scripts/validate_repository.py` to confirm internal links still resolve.

## Third-party material

Names, scores, quotations and descriptions of other people's work are cited for research and commentary, with links to their sources. They are not covered by this repository's MIT license, and trademarks belong to their owners.

Screenshots and contact sheets of third-party websites (`captures/*/sheet.jpg`) are excluded by `.gitignore` and are not redistributed. Regenerate them locally with `audit_page.mjs` if you need them. The validator rejects image, video and font files that lack recorded license provenance.
