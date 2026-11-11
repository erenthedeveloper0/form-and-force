# Instrument calibration

How the design-facts instrument (`skills/form-and-force/scripts/design_facts.mjs`, run by `audit_page.mjs` and `sketch_board.mjs`) was checked against real pages, what it got wrong, and what was changed. The instrument raises questions for a critique. It does not score pages, and this record is the reason it is not allowed to.

Status of every statement here: **measured** on 2026-11-10 and 2026-11-11 with headless Chromium 158 through Playwright 1.65, one run per site at 1440×900 and 390×844, ten screens sampled per width. Sites change, so the counts are a snapshot.

## Method

Two groups of pages were audited with the same command:

```bash
node skills/form-and-force/scripts/audit_page.mjs <url> --viewports 1440x900,390x844 --plan-tiles 10 --wait 3500 --no-reduced --focus-steps 3 --scroll-shots 1
```

- **Reference work (19 sites):** pages chosen for range, most of them already in [REFERENCE_CORPUS.md](REFERENCE_CORPUS.md). They include restrained public and tool interfaces (GOV.UK, Are.na, Klim), product marketing (Linear, Stripe, Vercel, Apple Mac), editorial and cultural sites (The Pudding, It's Nice That, NTS, Pentagram, Dropbox Brand) and expressive or immersive work (Lando Norris, Terminal Industries, Son Daven, Floema, anime.js, Teenage Engineering, rauno.me).
- **Stock templates (11 pages):** Bootstrap 5.3 examples (product, pricing, album, carousel), Start Bootstrap (landing page, agency, creative), HTML5 UP (Stellar, Landed) and two Tailwind UI templates (Salient, Pocket).

The grouping is a judgement, and a coarse one. "Reference" means work a competent jury would not call default. "Template" means a page built to be reused by anyone. A question that fires on the first group as often as on the second cannot separate decisions from defaults, whatever it measures.

Two local fixtures anchor the ends: `tests/fixtures/pages/generic.html` (every default on purpose) and `tests/fixtures/pages/directed.html` (a page with decisions in it).

## Three rounds

| Round | State of the instrument | Result |
|---|---|---|
| 1 (previous session, 15 sites) | First version | `moulds` fired on 9 of 12 measured sites, including GOV.UK, Pentagram, Linear and Stripe. `scale-contrast` and `type-economy` fired on image-led first screens. Display detection missed headlines split into single letters. |
| 2 (30 sites) | After the first fixes: text-only card groups, working sizes, first-screen media share | `moulds` still fired on 12 of 16 reference sites. `transition-all`, `type-economy` and `same-screens` fired only or mostly on reference work. Three WebGL-heavy sites produced no facts at all. A template with a photograph raised nothing. |
| 3 (30 sites, five re-measured) | After the changes below | The table in the next section |

## Result after round 3

| Question | Reference work | Templates | Reading |
|---|---|---|---|
| `default-easing` | 2 of 19 | 8 of 11 | Separates well |
| `centred` | 1 of 19 | 4 of 11 | Separates well |
| `nothing-to-look-at` | 0 of 19 | 3 of 11 | Separates well |
| `symmetric-fold` | 0 of 19 | 2 of 11 | Separates well, low base rate |
| `one-duration` | 0 of 19 | 1 of 11 | Low base rate |
| `scale-contrast` | 4 of 19 | 7 of 11 | Separates, but fires on strong restrained tools (Are.na, GOV.UK, Linear, Dropbox Brand) |
| `moulds` | 1 of 19 | 3 of 11 | Separates after narrowing |
| `layout-run` | 2 of 19 | 2 of 11 | Weak |
| `even-pacing` | 1 of 19 | 1 of 11 | Weak |
| `measure` | 3 of 19 | 1 of 11 | Fires on small print and legal text on strong sites |
| `caps-labels` | 2 of 19 | 0 of 11 | Does not separate these groups; fires on the generic fixture |
| `text-collision` | 2 of 19 | 0 of 11 | Linear's layered product composition, and one narrow-width overlap on Vercel |
| `no-feedback` | 2 of 19 | 1 of 11 | GOV.UK and Klim declare no transitions, deliberately |
| `thin-fold` | 1 of 19 | 0 of 11 | Does not separate |
| `flat-sequence` | 1 of 19 | 0 of 11 | Does not separate |
| `one-surface` | 1 of 19 | 0 of 11 | Does not separate these groups; fires on the generic fixture |
| `layout-animation` | 2 of 19 | 0 of 11 | An engineering observation |
| `slow-controls` | 7 of 19 | 2 of 11 | **Inverted.** Slow hover transitions are common on expressive reference sites |
| `transition-all` | 8 of 19 | 0 of 11 | **Inverted.** Reference sites ship it; Bootstrap names its properties |

Median questions per page: 2 on reference work, 2 on templates. The instrument does not rank the groups, and it was never meant to.

On the fixtures: 12 questions on the generic page, none on the directed page.

## What was changed, and why

| Finding | Change |
|---|---|
| `moulds` counted full-width list rows as cards: the link lists on GOV.UK, the issue rows on Linear, the navigation columns on Vercel, even the lines of a heading on rauno.me. Those are indexes, which is a structure the method deals on purpose. | A text card is now a box (width to height between 0.45 and 3.2, at least 90 px tall), three or more to a row, holding 40 to 700 characters, outside navigation, header and footer. Table rows are excluded. 12 of 16 became 1 of 19. |
| `type-economy` fired on Stripe, Terminal Industries, Floema and Lando Norris and on no template. Many sizes is a property of large pages. | The question was removed. The count of working sizes is still reported as a fact. |
| `same-screens` fired on three reference sites, all at the phone width where any stacked column resembles itself, and missed the generic fixture, whose sections really are identical. It failed in both directions. | The question was removed. Self-similarity is still reported. `flat-sequence` is now asked at the wide width only. |
| `transition-all` and `slow-controls` are inverted. | Kept as questions because they are sound engineering advice for code being written now, and marked in `jury.md` as engineering observations that say nothing about direction. |
| `no-feedback` fired on GOV.UK and Klim, which change state instantly by decision. | The question now says that instant state changes are legitimate and asks whether the states exist. |
| One long paragraph could define the "body" size (a 60-character caption set at 34 px did, on a fixture). | Running text sets the body size only when there is enough of it (200 characters or a tenth of the text). Otherwise all text does. |
| The instrument asked nothing about a fixture whose caption sat on top of its headline at 390 px. Collisions at narrow widths are the commonest visible defect in pages only looked at wide. | A collision probe was added: lines of text reduced to the middle half of their height, clipped to their ancestors' clipping, ignoring fixed and sticky chrome and identical stacked text. It runs at every sampled screen and in the sketch board. |
| On anime.js, Lando Norris and Son Daven the contact sheet could not be drawn, and because the sheet, the pixel facts, the first-screen board and the flatplan shared one error handler, all four were lost. | Each piece of evidence is now composed independently, with one retry in a fresh browser. All 30 sites then produced facts. |

## What the instrument cannot see

These are limits, not bugs, and they are why the cold read and the twin test judge the work.

1. **The twin with a picture in it.** The Start Bootstrap agency template raised no question, and the album and carousel examples raised only motion questions. A stock photograph measures as an image, and a familiar structure measures as structure. The instrument cannot tell that a picture is generic or that an arrangement is the expected one.
2. **Anything not in the DOM as text.** Type set in images, canvases, SVG or WebGL is invisible to the type facts. On canvas-led sites the facts describe the chrome.
3. **Meaning.** It cannot tell a designed index from a lazy list, composed emptiness from unfilled space, or a deliberate layered composition from a collision. It can only ask.
4. **Whether a concept exists.** No measure here bears on that.
5. **Sampling.** Pixel facts and collisions see ten to fourteen screens per width. One lab run, unthrottled.
6. **The groups themselves.** Thirty pages, sorted by judgement, measured once. The counts support "this question is noisy" or "this question separates". They do not support thresholds finer than the ones in use.

## Reproducing it

Run the command above for each URL into its own `--out` directory, then count the question ids in each `report.json` (`viewports[].design.read.questions`). Screenshots of third-party sites are not kept in this repository (see [README.md](README.md#third-party-material)). The fixture pages and their recorded facts are in `tests/fixtures/`, and `tests/test_rendered_tools.py` re-measures them when a browser is available.
