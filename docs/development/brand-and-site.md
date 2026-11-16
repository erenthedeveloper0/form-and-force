# Brand and site

How the brand assets and the documentation site are built, and how to change them. What the brand is, and how to use it, is in [brand/README.md](../../brand/README.md).

## The brand pipeline

```text
brand/source/storyboard.png ── traced and sampled by hand ──┐
                                                            ▼
brand/source/mark.json        the mark's geometry       ┐
brand/source/tokens.json      colours, finishes, type   ├──► brand/build.mjs ──► brand/identity/   SVG logos, icons (+ PNG)
brand/source/wordmark.json    the outlined wordmark ◄─┐ │                       brand/graphics/   folds, glint
brand/fonts/*.woff2           the typefaces ◄─────────┤ ┘                       brand/applications/github/
                                                      │                         brand/previews/   board, variations
brand/source/type.py ── fetches the fonts at a ───────┘                         .claude-plugin/icon.png
                        pinned commit (maintainer only)                         brand/manifest.json (hashes)
```

### Rebuild

```bash
node brand/build.mjs --check                          # are the committed SVGs current? No browser needed
node brand/build.mjs --svg                            # rewrite the SVGs and their hashes
FF_PLAYWRIGHT_DIR=~/.cache/ffpw node brand/build.mjs  # everything: SVGs, rasters, previews, manifest
```

Vector files are written directly from the sources, so they are reproducible on any machine. Rasters are rendered in Chromium through the skill's `browser.mjs`, so they need Playwright ([installation](../installation.md#optional-rendered-tools)). Their bytes depend on the Chromium version: a rebuild elsewhere may change a file's hash without changing how it looks. Commit the manifest with the files.

### Changing the brand

| To change | Edit | Then |
|---|---|---|
| A colour | `brand/source/tokens.json` (and `brand/guidelines/colour.md`, which a test checks against it) | Rebuild; check contrast with `python3 -m unittest discover -s tests -p test_brand.py` |
| The mark | `brand/source/mark.json`, only by re-tracing the storyboard | Rebuild; review the board at every size |
| A lockup's proportions | `LOCKUPS` in `brand/build.mjs`, and `brand/guidelines/logo.md` | Rebuild |
| A composition or background | `COMPOSITIONS` or `SCENES` in `brand/build.mjs` | Rebuild; check the variations sheet |
| The typefaces or the wordmark's weight or spacing | `brand/source/type.py` | Run it (below), then rebuild |

`type.py` needs fontTools, brotli and uharfbuzz. Keep them out of the repository's own tooling, which is standard-library only:

```bash
python3 -m venv .venv
.venv/bin/pip install fonttools brotli uharfbuzz
.venv/bin/python brand/source/type.py
```

It downloads the fonts from google/fonts at a pinned commit, refuses any file whose SHA-256 differs, writes Latin WOFF2 subsets and their licences to `brand/fonts/`, and outlines the wordmark into `brand/source/wordmark.json`.

### Provenance

The validator accepts an image, video or font only with recorded provenance. A rendered brand file is accepted when `brand/manifest.json` records its exact hash; editing a rendered file by hand makes the validator fail with an instruction to re-render. The storyboard and the two typefaces have explicit entries in `ALLOWED_MEDIA` in `tooling/validate_repository.py`. The storyboard is the only file allowed past the 1 MiB limit, because it is kept byte for byte.

## The documentation site

```text
docs/**/*.md ─────────────┐
skills/form-and-force/*.md ┤
brand/**/*.md, research/*.md, root documents ──► site/build.py ──► dist/site/
site/nav.json (order) ────┤        │                                ├── *.html, 404.html
site/theme/ (template, CSS, JS)    ├── site/markdown.py             ├── assets/ (CSS with brand tokens, JS, fonts, icons, folds)
brand/ (tokens, fonts, logo) ──────┘                                └── assets/search-index.json
```

Every page is a Markdown file that is also read on GitHub. `site/nav.json` decides the order and the URL of each. Links between Markdown files become links between pages, links to other repository files go to GitHub, and images are copied into the site. The theme's colours come from `brand/source/tokens.json` and its fonts from `brand/fonts/`, so the site cannot drift from the brand.

```bash
python3 site/build.py --check         # build in a temporary directory and report problems only (CI)
python3 site/build.py                 # build into dist/site/
python3 site/build.py --serve         # build, then serve at http://localhost:8000/
```

The build fails on a missing source, a `docs/` page not in the navigation, a link or anchor that does not resolve, or a duplicate id. External links are not fetched; the [external link audit](testing.md#external-link-audit-on-demand) checks them on demand.

The site needs no JavaScript to read. Script adds the theme switch (system, light, dark), the mobile menu, copy buttons, the current section in the table of contents, and search over every page and section, including all 180 atlas entries. Search loads its index on first use, so the pages work offline from `file://` except for search; `--serve` gives the full site.

### Publishing

The site is not published automatically. The manual **Documentation site** workflow builds it and deploys it to GitHub Pages:

1. In the repository's **Settings → Pages**, set **Source** to **GitHub Actions** (once).
2. In **Actions → Documentation site**, choose **Run workflow** on `main`.

The site is then at `https://erenthedeveloper0.github.io/form-and-force/`. CI builds and checks the site on every pull request, but only this manual workflow deploys it.
