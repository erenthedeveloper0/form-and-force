# Third-party notices

Form & Force is released under the [MIT License](LICENSE). This file lists the third-party material the repository contains or relies on, and the terms under which it is used.

## Included in the repository

### Plus Jakarta Sans

- Files: `brand/fonts/PlusJakartaSans.woff2` (a Latin subset of the variable font, made by `brand/source/type.py`); outlines of the wordmark in `brand/source/wordmark.json` and every logo made from it.
- Copyright 2020 The Plus Jakarta Sans Project Authors (<https://github.com/tokotype/PlusJakartaSans>).
- Licence: SIL Open Font License 1.1. Full text: [`brand/fonts/PlusJakartaSans-OFL.txt`](brand/fonts/PlusJakartaSans-OFL.txt).
- Obtained from google/fonts at commit `0b58fb370093f9a9f4ff785d94405710b79de67c`.

### JetBrains Mono

- Files: `brand/fonts/JetBrainsMono.woff2` (a Latin subset of the variable font, made by `brand/source/type.py`).
- Copyright 2020 The JetBrains Mono Project Authors (<https://github.com/JetBrains/JetBrainsMono>).
- Licence: SIL Open Font License 1.1. Full text: [`brand/fonts/JetBrainsMono-OFL.txt`](brand/fonts/JetBrainsMono-OFL.txt).
- Obtained from google/fonts at the same commit.

The OFL allows the fonts to be used, embedded in documents such as the documentation site, and rendered into images. The subsets are modified versions and remain under the OFL. Neither font declares a Reserved Font Name, so the subsets keep their original names. They are not sold on their own.

### The GitHub mark

The documentation site's header links to the repository with the GitHub mark, as GitHub's logo guidelines allow for linking to GitHub. It is GitHub's trademark and is not covered by this repository's licence.

### The brand storyboard

`brand/source/storyboard.png` was supplied by the maintainer as the source of the Form & Force identity.

## Used but not distributed

| Software | Licence | How it is used |
|---|---|---|
| Node.js | MIT | Runs the skill's tools. Installed by the user |
| Playwright and Chromium | Apache-2.0 (Playwright); Chromium's own licences | Optional, for the rendered tools and the brand renderer. Installed by the user; never bundled or installed by this repository |
| Python | PSF License | Runs the repository's checks. Installed by the user |
| fontTools, brotli, uharfbuzz | MIT; MIT; Apache-2.0 | Optional, for `brand/source/type.py` only, in a virtual environment |
| GitHub Actions (`actions/checkout`, `actions/setup-python`, `actions/upload-artifact`, `actions/upload-pages-artifact`, `actions/deploy-pages`) | MIT | CI and the manual site deployment, pinned to commit SHAs |
| Claude Code | Anthropic's terms | Hosts the plugin; runs the optional model evaluations |

## Cited, not licensed

The research cites websites, studios, products, scores, quotations and papers for research and commentary, with links to their sources. They belong to their owners and are not covered by this repository's licence. Screenshots of third-party websites are never committed; the validator rejects media files without recorded provenance ([research](research/README.md#third-party-material)).
