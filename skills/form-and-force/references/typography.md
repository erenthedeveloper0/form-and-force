# Typography: voice, system, image and behaviour

Type does four jobs at once. It carries the voice, it builds the structure, it can be the image, and it can be the interaction. A project that only asks type to label things has wasted its most available material.

## Contents
1. Choose a voice before a typeface
2. A map of voices
3. Pairing
4. The type system
5. Display craft
6. Text craft
7. Variable fonts as material
8. Type as image
9. Type as interaction
10. Responsive type composition
11. Loading, fallbacks and licences
12. Faults

---

## 1. Choose a voice before a typeface

A typeface is a tone of voice with a history. Decide the voice in words first, from the position in the direction brief, then find the face that speaks that way.

Answer five questions:

1. **Who is speaking, and how?** A clerk, a craftsperson, an engineer, a host, a critic, an institution. Plainly, warmly, exactly, loudly, drily.
2. **What should the letters be made of?** Pen, chisel, brush, compass and ruler, a pixel grid, a typewriter's strike, a stencil. Construction is where character comes from.
3. **What does the subject already use?** The trade's own lettering (signage, labels, instruments, documents, packaging) is the strongest lead. Use its structure. A pastiche of its surface is the trap.
4. **What job dominates?** Long reading, dense data, a few enormous words, an interface used all day. This narrows the field faster than taste does.
5. **What have recent projects used?** Run `deal.mjs recent`. Those faces are taken unless this client owns them.

Then test the candidates in the key frame with the project's real words, at the real sizes. Judge the actual headline, the actual numerals, the actual longest word. A face chosen from a specimen of "Hamburgefonstiv" has not been chosen.

If the client owns a typeface, use it. An owned face used with conviction beats any better-drawn substitute.

## 2. A map of voices

These are entry points into territories. They are not a shortlist: each territory holds many more faces than are named here, and the best match is often outside any list. All named families were open-licensed or free for commercial use when this was written; check the licence and availability before use (§11).

| Voice | Letters built from | Says | Entry points |
|---|---|---|---|
| **Old-style serif** | A broad pen: diagonal stress, bracketed serifs | Bookish, humane, long memory | EB Garamond, Cormorant, Crimson Pro, Sorts Mill Goudy, Cardo, Gambetta, Erode |
| **Transitional and screen serif** | The pen, regularised | Reasoned, editorial, trustworthy | Source Serif 4, Newsreader, Literata, Spectral, Libre Caslon, Zodiak, Sentient |
| **Modern (didone)** | A pointed pen and an engraver: vertical stress, hairlines | Fashion, ceremony, sharp contrast | Bodoni Moda, Gloock, Libre Bodoni, Boska |
| **Characterful serif** | Soft or eccentric forms on a serif skeleton | Warm, a little odd, memorable | Fraunces, Young Serif, Bespoke Serif, Brygada 1918 |
| **Slab** | Equal-weight strokes with blunt serifs | Sturdy, mechanical, declarative | Zilla Slab, Bitter, Roboto Slab, Besley, Hepta Slab |
| **Humanist sans** | The pen, with the serifs removed | Friendly, clear, human | Source Sans 3, Fira Sans, Atkinson Hyperlegible, Albert Sans, Figtree |
| **Grotesque and neo-grotesque** | Nineteenth-century jobbing type, later neutralised | Matter-of-fact, industrial, corporate when over-neutral | Archivo, Schibsted Grotesk, Hanken Grotesk, Instrument Sans, Familjen Grotesk, Switzer |
| **Geometric sans** | Compass and ruler | Modernist, optimistic, cool | Jost, Outfit, Urbanist, Sora, Satoshi, General Sans |
| **Expressive grotesque** | A grotesque with exaggerated proportions or ink traps | Contemporary, opinionated | Bricolage Grotesque, Syne, Cabinet Grotesk, Clash Display, Darker Grotesque |
| **Condensed and compressed** | Poster and headline wood type | Urgent, loud, economical | Big Shoulders Display, Barlow Condensed, Sofia Sans Extra Condensed, Antonio, League Gothic, Anton |
| **Wide and extended** | Stretched forms, often with heavy weight | Engineered, spacious, emphatic | Unbounded, Panchang, Anybody (width axis), Archivo (width axis) |
| **Monospace** | Typewriters and terminals: every glyph one width | Technical, tabular, unvarnished | JetBrains Mono, IBM Plex Mono, DM Mono, Martian Mono, Azeret Mono, Fragment Mono |
| **Typewriter and utility** | Struck or stencilled letters | Documentary, bureaucratic, provisional | Courier Prime, Special Elite, Cutive Mono, Bespoke Stencil |
| **Inscriptional** | Capitals cut in stone | Monumental, civic, timeless | Cinzel, Marcellus, Forum, Italiana |
| **Blackletter** | A broad pen held steep | Tradition, weight, counterculture | UnifrakturCook, Pirata One, Grenze Gotisch |
| **Script and hand** | Handwriting, formal or quick | A person was here | Caveat, Kalam, Homemade Apple, Pinyon Script, Mrs Saint Delafield |
| **Pixel and matrix** | A grid of dots or squares | Machine output, early screens, signage | Silkscreen, Pixelify Sans, DotGothic16, Doto, VT323 |

How to use the map:
- Pick the **territory** from §1, then look through the whole territory at its source (Google Fonts, Fontshare, The League of Moveable Type, the foundry's own site), not just these names.
- Many of the best faces are commercial. If one is clearly right, name it to the user as a recommendation with its cost, and build with the nearest open face in the meantime. Never ship a face the project has no licence for.
- Check that the face covers the project's languages, and has the numerals, punctuation and weights the content needs.
- A face that appears in the defaults registry ([floor.md](floor.md)) is not forbidden. It needs a reason that is about this project.

## 3. Pairing

Most projects need one family. A second earns its place only by doing a job the first cannot.

- **Contrast in structure, kinship in proportion.** Pair across territories (a serif with a sans, a text face with a display face) and match their x-height and width so they sit together.
- **One voice and one utility.** A characterful face for the few words that carry identity, and a quiet workhorse for everything read at length. Two characterful faces compete.
- **Superfamilies** (a serif, sans and mono drawn together) give contrast without friction. They also risk blandness; push scale to compensate.
- **Never two similar sans.** If the difference needs explaining, there is none.
- **A monospace is content, not flavour.** Use one where the content is code, data or tabular figures, or where the device is about machine output. A mono used for labels to seem technical is a costume.

## 4. The type system

A system is a small set of sizes and weights that can be recited from memory. If it cannot be recited, it is drift.

- **Roles before sizes.** Decide which roles exist (display, title, heading, body, note, label, data) and give each exactly one size and weight per breakpoint range.
- **Fewer sizes, further apart.** Five or six sizes with clear steps beat ten that blur. The audit reports the count in use as a fact; large pages legitimately carry more, so read it against the roles you defined.
- **Decide the scale contrast.** The ratio between the largest type on the first screen and the body size is the most telling number on a page (the audit calls it the first-screen scale ratio). A ratio under about three means type is labelling, not composing. Expressive and Radical work usually wants it far higher. Quiet work may sit lower, and then the hierarchy must come from somewhere else that is just as decisive: weight, position or space.
- **One loud axis.** Build hierarchy from size, or weight, or colour, or position. Using all four at once at every level makes everything shout.
- **Weight strategy.** Either one weight everywhere with scale doing the work, or two weights far apart (regular with heavy, light with bold). Neighbouring weights (400 with 500) rarely read as a decision except in interface text.
- **Space is part of the system.** More space above a heading than below it. Related lines closer than unrelated ones.

Write the system as tokens named for the role (`--text-display`, `--text-note`), never for the size.

## 5. Display craft

Large type exposes everything. These adjustments are what separate set type from default type.

| Adjustment | Rule of thumb |
|---|---|
| **Tracking** | Tighten as size grows: near 0 at text sizes, about −0.01 to −0.02em around 32–48 px, −0.03 to −0.06em above 100 px. Each face differs; judge the tightest pair of letters. Never track lowercase text looser. |
| **Capitals** | Open them up: +0.04 to +0.12em, more at small sizes. |
| **Leading** | 0.85 to 1.05 for display. Lines of capitals or lines without descenders can go tighter. Check the worst collision of a descender with an ascender. |
| **Line breaks** | Break for sense, by hand. One idea per line. Use `text-wrap: balance` as a safety net, never as the decision. No single word alone on the last line. |
| **Optical alignment** | Round and pointed letters, and quotation marks, need to overhang the edge to look aligned. Pull large display type left by a few hundredths of an em so its stems align with the text below. `hanging-punctuation: first` where supported. |
| **Trim** | Half-leading puts invisible space above and below large type. Trim it with `text-box: trim-both cap alphabetic` where supported, or with a negative margin tuned to the face, so type sits exactly where the grid says. |
| **Optical size** | Use the display cut or the `opsz` axis for large sizes and the text cut for small. A text face blown up looks coarse; a display face shrunk looks fragile. |
| **Real punctuation** | Curly quotes, real apostrophes, en dashes in ranges, a true multiplication sign. Non-breaking spaces between a number and its unit. |
| **Figures** | Lining figures with capitals, old-style figures in running text when the face has them (`font-variant-numeric: oldstyle-nums`), tabular figures wherever numbers align or change. |
| **Alternates** | Look through the face's stylistic sets (`font-feature-settings: "ss01"`), its case-sensitive forms (`"case"`), and its true small caps. One well-chosen alternate can make a wordmark out of a font. |

## 6. Text craft

- **Measure** of 45 to 75 characters for long reading (`max-inline-size: 65ch`); shorter for narrow columns and captions.
- **Leading** between 1.4 and 1.6 for body, lower for short measures and large x-heights, higher for long measures.
- **Size** of 16 to 20 px for body on screens. Small text needs more contrast, not less.
- **Paragraphs** are separated by space or by an indent, never both.
- **Alignment** left for text of any length. Centred text is for a few short lines. Justified text needs hyphenation (`hyphens: auto` with a correct `lang`) and a generous measure.
- **Links** are recognisable without colour alone, and their hover and focus states belong to the type system.
- **Hierarchy by space first.** Before adding a size or a weight, try space and position.
- **Contrast** of at least 4.5:1 for text and 3:1 for large text ([accessibility.md](accessibility.md)). Light grey small text is a fault, however refined it looks.

## 7. Variable fonts as material

A variable font exposes its design as continuous axes. Treat them as creative material, not just as a way to load fewer files.

| Axis | Tag | Use |
|---|---|---|
| Weight | `wght` | Hierarchy; state (a link gaining weight on focus); a value driven by data |
| Width | `wdth` | Fit a line to a column exactly; condense on narrow screens instead of shrinking |
| Optical size | `opsz` | Correct detail at every size, automatically with `font-optical-sizing: auto` |
| Slant and italic | `slnt`, `ital` | Emphasis; a lean that responds to direction or speed |
| Grade | `GRAD` | Change apparent weight without changing width, so text does not reflow (good for hover and dark mode) |
| Custom axes | upper-case tags | Softness, flare, ink traps, playfulness: read the font's documentation |

```css
.title { font-variation-settings: "wght" 620, "wdth" 82, "opsz" 96; }
.title:hover { font-variation-settings: "wght" 780, "wdth" 82, "opsz" 96; }   /* restate every axis */
```

- Prefer the high-level properties (`font-weight`, `font-stretch`, `font-style: oblique 8deg`) where they exist; `font-variation-settings` does not cascade per axis.
- Animating an axis re-lays out the text. Keep it to a few words, never body copy, and prefer `GRAD` when the text must not move.
- Tie an axis to something real: scroll position, pointer distance, a data value, the time. An axis that wobbles for decoration is noise.
- One variable file with a wide range can replace several static files, but can also be larger than two static weights. Measure.

## 8. Type as image

When there are no photographs, and often when there are, the type can be what the frame is made of.

- **Scale and crop.** Letters large enough that the frame cuts them. Choose what the crop leaves legible.
- **Texture.** A paragraph, list or data set repeated or packed until it reads as a surface (the Text as texture structure). It must be real content, with a way to read it.
- **Counter and shape.** A single glyph at enormous size is a drawing: use its counters as windows or as the layout's geometry.
- **Outline and fill.** `-webkit-text-stroke` with a transparent fill for a second, quieter layer of the same words. Use `paint-order: stroke fill` to keep shapes clean.
- **Type as window.** `background-clip: text` with an image, gradient or video behind transparent letters. Needs a very heavy weight, a large size and a solid fallback colour.
- **Direction.** `writing-mode: vertical-rl` for true vertical setting; rotation for labels along an edge. Keep reading text horizontal.
- **Numerals as heroes.** Dates, prices, measurements and counts are often the most specific thing a subject has. Set the true number large.
- **Repetition with change.** The same word in a series of weights, widths or sizes shows a range, a process or a passage of time.

Every use still has to be real text in the DOM, selectable and readable by assistive technology. Text baked into images or canvases needs an equivalent in markup.

## 9. Type as interaction

- **Reveal by line.** Wrap each line in an `overflow: clip` box and move the line up from below. Split by lines, not letters, unless the letters are the idea. Recipes and the accessibility of split text are in [motion-craft.md](motion-craft.md).
- **Reading progress.** Words or lines change tone as they are read, driven by scroll. The text is readable at every frame.
- **Response to the pointer.** Weight, width or slant changing with distance or direction, on a few large words. Gate it behind `(hover: hover) and (pointer: fine)` and give touch and keyboard the settled state.
- **State in the letters.** A current navigation item that is heavier or wider rather than underlined; a number that rolls when its value changes (with tabular figures so nothing shifts).
- **Input as the hero.** For a search-first or tool-first page, the text field is the display type. Style the typed text at display size.
- **Type that carries data.** Size, weight or position set by a real value.

Each needs a purpose that passes the motion gate ([motion-direction.md](motion-direction.md)) and a reduced-motion state.

## 10. Responsive type composition

Type does not simply shrink. It is re-set.

```css
/* fluid between two anchors: 2.5rem at 360px wide, 9rem at 1440px wide */
.display { font-size: clamp(2.5rem, 0.33rem + 9.63vw, 9rem); }
```

- Derive the middle term from the two anchors (slope = size difference ÷ width difference), and keep a `rem` part so the text still responds to zoom and user font size.
- Use container units (`cqw`) when the component lives in columns of different widths.
- Change the **line breaks**, the **leading** and the **tracking** at narrow widths. Large type tracked for a wide screen is too tight when small.
- On a phone the scale ratio usually has to rise relative to the frame: a headline that fills a wide screen at 9vw may need 16vw to keep the same presence.
- With a width axis, condense before shrinking.
- Fitting a line exactly to its container is a legitimate composition. Do it with `cqw` and a measured ratio; avoid scripts that resize on every frame.
- Test with the longest real string, a translation 30 to 40% longer, 200% zoom and the user's font size raised.

## 11. Loading, fallbacks and licences

```css
@font-face {
  font-family: "Project Display"; src: url("/fonts/project-display.woff2") format("woff2");
  font-weight: 300 900; font-display: swap; unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+2000-206F;
}
@font-face {   /* a metric-matched fallback keeps layout still while the real face loads */
  font-family: "Project Display Fallback"; src: local("Arial");
  size-adjust: 104%; ascent-override: 92%; descent-override: 24%; line-gap-override: 0%;
}
h1 { font-family: "Project Display", "Project Display Fallback", sans-serif; }
```

- Self-host WOFF2 where the licence allows. Preload only the one or two files the first screen needs. With Next.js use `next/font`, which self-hosts and generates the fallback metrics.
- `font-display: swap` for faces that carry identity; `optional` for body text when stability matters more than the exact face.
- Subset to the languages in use. Check the licence permits subsetting.
- Display type that is the largest element on the first screen is usually the LCP element. Its font file is on the critical path ([performance-engineering.md](performance-engineering.md)).
- Record each family's source and licence in the report. Open licences differ: SIL OFL, Apache and foundry-specific free licences have different terms.

## 12. Faults

| Fault | Why it reads as default |
|---|---|
| A face chosen because it is "nice" | No voice was decided; any nice face would do |
| The current reflex pairing | Recognisable as this year's template ([floor.md](floor.md)) |
| Many sizes close together | Drift, not system |
| Display type at default tracking and leading | Set by the browser, not by a person |
| Tracked-out lowercase | Breaks word shapes |
| Faux bold, faux italic, faux small caps | The browser synthesised what the font lacks |
| A small tracked-caps label above every heading | Chrome that carries no information |
| An accent word in italic or colour in every headline | A device used as a tic |
| Centred paragraphs | Ragged on both sides and hard to read |
| Pale small text | Elegance paid for by the reader |
| Straight quotes, hyphens for dashes, `x` for × | Nobody proofread |
| Text in images | Not selectable, not translatable, not accessible |
