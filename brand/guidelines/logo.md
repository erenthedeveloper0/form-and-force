# Logo

## The mark

Two strokes travel the same way. The upper one, **form**, is broad and ends in a fine tip that lifts. The lower one, **force**, is shorter and drives down to a point at the baseline. Together they make an F in motion, leaning in its direction of travel.

The geometry is in [`source/mark.json`](../source/mark.json): two closed paths of cubic Béziers in a 161 × 132 box. It was traced from the storyboard's hero lockup, checked against its stacked lockup, and redrawn with smooth joins. These features define it, and none may change:

- Both strokes lean the same way, at the same angle, and never touch.
- The gap between them is narrow: about a tenth of the mark's height.
- The form stroke's tip is the mark's highest and rightmost point. The force stroke's foot is its lowest and leftmost.
- The form stroke's left end sits directly above the force stroke's rising edge, so the eye reads one stem.
- The force stroke ends on the right in a cut, not a point.

## Finishes

| File | Finish | Use |
|---|---|---|
| `form-and-force-mark-satin.svg` | Satin: a cool metallic gradient, darker at the foot, brightest toward the tip | On dark grounds. The primary mark |
| `form-and-force-mark-graphite.svg` | Graphite: near-black with a faint sheen at both ends | On light and silver grounds |
| `form-and-force-mark-paper.svg` | Flat paper (`#e8e7f2`) | On dark photographs, busy or mid-tone grounds, one-colour print |
| `form-and-force-mark-ink.svg` | Flat ink (`#07060a`) | The same, on light |
| `form-and-force-mark-currentcolor.svg` | The text colour of its container | Inline SVG in interfaces |

The satin and graphite gradients run across the whole mark, from the foot of the force stroke to the tip of the form stroke, so both strokes share one light. Their stops are in [`tokens.json`](../source/tokens.json) under `finish`.

## Lockups

Every lockup is measured in **c**, the cap height of the wordmark.

| Lockup | Arrangement | Use |
|---|---|---|
| **Horizontal** (primary) | Mark 2.7 c tall · gap 1.7 c · rule as tall as the mark · gap 1.7 c · wordmark on one line. The wordmark's capitals are centred on the mark | Headers, banners, documents, anywhere wide |
| **Stacked** | Mark 3.25 c · gap 1.35 c · rule · gap 1.35 c · wordmark on two lines, *Form and* / *Force*, centred on the mark | Squarer spaces: cards, a slide's corner, a sticker |
| **Compact** | Mark 1.75 c · gap 0.75 c · wordmark in its small cut, no rule | Navigation bars and anything below about 32 px tall |
| **Vertical** | Mark 3 c, centred · gap 1.1 c · wordmark | Square formats only: avatars, title slides |

The horizontal and stacked lockups come from the storyboard. The compact and vertical ones were added for sizes and formats the storyboard does not cover; they use no new elements.

Each lockup exists `on-dark` (satin mark, ash rule, paper wordmark) and `on-light` (graphite mark, silver rule, ink wordmark). The horizontal, stacked and vertical lockups also exist in flat `paper` and `ink`, and the horizontal and compact ones in `currentcolor`. The rule in a one-colour lockup is the same colour at 35–40 % opacity.

## Clear space

Keep at least **half the mark's height** clear on every side of any lockup or of the mark alone. Nothing, including the edge of the frame, comes closer.

## Minimum sizes

Measured as the rendered height of the whole lockup:

| Asset | Minimum |
|---|---|
| Mark alone | 16 px (use the favicon tile below 24 px) |
| Compact lockup | 20 px |
| Horizontal lockup | 32 px |
| Stacked lockup | 48 px |
| Vertical lockup | 64 px |

These were checked on screen on light and dark grounds at 1× and 2× pixel density. The wordmark is set in Plus Jakarta Sans Light, which thins out when small; the compact lockup uses a heavier cut (weight 420) for that reason (see [typography](typography.md#the-wordmark)).

## App icons and favicons

| File | Use |
|---|---|
| `form-and-force-tile-night.svg` / `.png` | The primary app icon: the satin mark on a night tile with a faint lavender edge |
| `form-and-force-tile-silver.svg` / `.png` | On light surfaces: the graphite mark on frosted silver |
| `form-and-force-tile-violet.svg` / `.png` | Rarely, where colour must carry the identity: the satin mark in violet light |
| `favicon.svg`, `favicon.ico` | The night tile with a larger mark, its own optical size: at 16 px the app-icon proportion leaves the mark a few pixels tall |
| `apple-touch-icon.png` | 180 px, opaque, for iOS, which applies its own mask |
| `.claude-plugin/icon.png` | The plugin listing icon: 1024 px, opaque and full bleed, because listings apply their own mask |

The tiles are 1024 units with a 228-unit corner. The mark sits slightly right of centre, where its weight balances.

## Do not

- Rotate, mirror, skew or re-angle the mark. The lean is its direction of travel.
- Change the strokes' proportions or the gap, join the strokes, or outline them.
- Light the mark from another direction or give the two strokes different finishes.
- Put the satin mark on a light ground, or the graphite mark on a dark one.
- Add a glow, shadow, bevel or glint to the mark itself. Light belongs to the compositions around it.
- Set the wordmark in a live font as a stand-in for the logo; use the outlined files.
- Recolour the wordmark in violet or any colour other than paper, ink or the text colour.
- Place a lockup over a crest or a glint. Lockups go on the dark (or silver) ground between folds.
- Put the mark in a container other than the supplied tiles.
