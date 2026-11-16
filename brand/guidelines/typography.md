# Typography

## Typefaces

| Role | Typeface | Weights | Why |
|---|---|---|---|
| Display, headings, text, interface | **Plus Jakarta Sans** (Tokotype) | variable, 200–800 | The closest open-licence match to the storyboard's wordmark: a wide, round geometric sans with a two-storey *a* and short, flat terminals. One family keeps the system small enough to recite |
| Code, commands, values | **JetBrains Mono** (JetBrains) | variable, 100–800 | Built for reading code; clear distinctions between `0O`, `1lI` and `{[(` |

Both are under the SIL Open Font License 1.1 and are kept in [`fonts/`](../fonts/) as Latin subsets in WOFF2, with their licences. [`source/type.py`](../source/type.py) fetches them from google/fonts at a pinned commit and checks every file's SHA-256, so the subsets can be rebuilt exactly.

## Hierarchy

| Style | Typeface | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | Plus Jakarta Sans | 300 | −0.01 em | Banners, the documentation home's opening line |
| Heading 1 | Plus Jakarta Sans | 400 | −0.015 em | Page titles |
| Heading 2–3 | Plus Jakarta Sans | 500 | −0.005 em | Sections |
| Body | Plus Jakarta Sans | 400 | 0 | Running text, at a measure of 60–75 characters |
| Caption | Plus Jakarta Sans | 500 | +0.32 em, capitals | Labels, eyebrows, the tagline. Short phrases only |
| Code | JetBrains Mono | 400 | 0 | Commands, paths, values, at 0.9 em of the surrounding text |

Display is light because the storyboard is: its type is thin and large, and the light falls on the image, not on the words. Body text is regular, because light text is hard to read at reading sizes. Tracked capitals follow the storyboard's taglines. Use them for a few words, never a sentence.

On screens the documentation sets body text at 16–17 px with a line height of 1.65, headings at a ratio of about 1.25 between levels, and scales display type with the viewport between fixed limits, so nothing becomes unreadably small on a phone or shouts on a wide monitor.

## The wordmark

The wordmark is *Form and Force* in Plus Jakarta Sans, outlined to paths by `type.py` with the font's own kerning and +10/1000 em of tracking. It has two optical sizes:

| Cut | Weight | Used in |
|---|---|---|
| Display | 300 | The horizontal, stacked and vertical lockups and the wordmark files |
| Small | 420 | The compact lockup, which is used below about 32 px. Light strokes thin out on screen at that size |

Always use the outlined files. A wordmark typed in a live font changes with the browser's rendering and the font version.

## The name

- In running text, the name is **Form & Force**, with an ampersand, as it has been written since 0.1.0. The plugin's display name is the same.
- The wordmark spells it out, *Form and Force*, as the storyboard does and as the repository and plugin identifier do (`form-and-force`).
- Do not write *F&F*, *FnF* or *Form+Force*.

## Taglines

- **Decide. Build. Judge.** The method in three verbs. Tracked capitals, in mist on dark or ink on silver.
- **Creative direction · Interface design · Motion engineering.** What it covers, for light compositions.
- **Creative direction, interface design and motion engineering for coding agents.** The one-line description, set in sentence case.

Claims stay inside what the project can show. "A new era of web development", from the storyboard, is not used.
