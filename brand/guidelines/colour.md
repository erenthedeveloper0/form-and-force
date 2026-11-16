# Colour

Every value here was sampled from the storyboard and lives in [`source/tokens.json`](../source/tokens.json). The brand files and the documentation site are generated from that file, so change a colour there and nowhere else.

## The palette

The palette is a ramp of light, not a set of brand colours to spread around. Most of any composition is ground; light is a small part, and colour a smaller one.

### Ground

| Name | Value | Role |
|---|---|---|
| Void | `#020204` | The ground of every dark composition. The darkest value; nothing sits below it |
| Night | `#07070c` | Surfaces on dark: cards, panels, the documentation page |
| Dusk | `#0d0c16` | Raised surfaces on dark: code blocks, the app-icon tile |
| Ash | `#52505a` | The lockup's rule and hairlines on dark. Never type |

### Light

The colours a fold passes through as it turns toward the light, darkest first.

| Name | Value | Role |
|---|---|---|
| Indigo | `#27263e` | The first light a fold catches, deep in shadow |
| Slate | `#3e3f60` | The body of a lit fold |
| Periwinkle | `#6b6e9f` | The shoulder, just before the crest |
| Lavender | `#bcbbe6` | The crest: light running along an edge |
| Glint | `#fefdfe` | The specular point where a crest peaks. One per composition, never a fill |

### Chroma

| Name | Value | Role |
|---|---|---|
| Violet | `#6f69dc` | Colour carried by light inside a fold |
| Ultramarine | `#4d53d9` | The cool end, at the foot of a fold |
| Amethyst | `#6844a3` | The warm end; only in the violet app icon |

### Silver

| Name | Value | Role |
|---|---|---|
| Pewter | `#757582` | The shadow side of the silver ground |
| Silver | `#b1b0c5` | The silver ground of light compositions |
| Frost | `#e8e7eb` | The lit side of silver; the silver app-icon tile |

### Type

| Name | Value | Role |
|---|---|---|
| Paper | `#e8e7f2` | Type and the flat mark on dark |
| Mist | `#979aaa` | Secondary type on dark |
| Ink | `#07060a` | Type and the flat mark on light |

## Rules

- **Proportion.** In a dark composition, ground is most of the frame, light a small part, and chroma a smaller one still. In the README banner, for example, violet appears only along the foot of one fold.
- **Chroma rides on light.** Violet and ultramarine appear where a fold is lit and fade to ground as the light falls off. They are never flat fills, panels, buttons or text.
- **Lavender and glint are for crests.** Interfaces use the accent tokens below, which are derived from them and checked for contrast.
- **No other colours.** A colour that is not in `tokens.json` is not part of the brand. Add it there, with a role, or do without it.

## Interface themes

The documentation site uses two themes, written into its CSS from `tokens.json` (`theme.dark` and `theme.light`). The dark theme sits on night; the light theme is the storyboard's silver, lightened for reading.

| Token | Dark | Light | Used for |
|---|---|---|---|
| `canvas` | `#07070c` | `#f3f2f7` | The page |
| `surface` | `#0d0c16` | `#fbfbfd` | Cards, the sidebar, the search panel |
| `sunken` | `#05050a` | `#e9e8f0` | Code blocks |
| `line` / `line-strong` | `#1f1e2e` / `#2e2d42` | `#d7d6e2` / `#bdbccd` | Hairlines, borders, table rules |
| `text` | `#e8e7f2` | `#0b0b12` | Body text and headings |
| `muted` | `#979aaa` | `#55556a` | Secondary text, captions |
| `faint` | `#787890` | `#5f5f74` | Metadata: dates, versions, breadcrumbs |
| `accent` | `#a9a6f0` | `#4a43c0` | Links, the current page, focus rings |
| `accent-quiet` | `#6f69dc` | `#b1b0c5` | Non-text indicators: the active-section bar, list markers |
| `selection` | `#2b2856` | `#d9d6f6` | Text selection |

### Contrast

Every text token meets WCAG 2.2 AA (4.5 : 1) on every surface it can sit on, and body text exceeds AAA (7 : 1). Measured with the WCAG relative-luminance formula:

| Pair | Dark: canvas · surface · sunken | Light: canvas · surface · sunken |
|---|---|---|
| `text` | 16.4 · 15.9 · 16.9 | 17.6 · 19.0 · 16.1 |
| `muted` | 7.2 · 7.0 · 7.4 | 6.5 · 7.0 · 6.0 |
| `faint` | 4.7 · 4.5 · 4.8 | 5.6 · 6.0 · 5.1 |
| `accent` | 9.0 · 8.7 · 9.3 | 6.6 · 7.1 · 6.1 |

[`tests/test_brand.py`](../../tests/test_brand.py) recomputes these from `tokens.json` and fails if any pair drops below 4.5 : 1, so a change to a token cannot quietly break the documentation's contrast.
