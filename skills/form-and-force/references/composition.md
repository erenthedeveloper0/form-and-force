# Composition: the frame, the page and the narrow screen

Composition is art direction, and it is decided before components exist. This file covers how a frame is organised, how a page is paced, and how both are carried into CSS and onto a narrow screen.

## Contents
1. Seven forces
2. Hierarchy in three reads
3. The structures and how to build them
4. The grid is a decision
5. From one frame to a page: the flatplan
6. Image and text
7. Navigation is part of the composition
8. Density
9. The narrow screen is a second composition
10. Faults, and how to see them
11. Layout mechanics in CSS

---

## 1. Seven forces

A frame is a field of forces. Components are only where the forces come to rest. Every strong layout pushes at least two of these far from their neutral position. A layout that leaves all seven at neutral is a template, whatever it is filled with.

| Force | Neutral | Pushed |
|---|---|---|
| **Scale** | Sizes step gently (16, 20, 32, 48) | One thing is many times larger than the next (a ratio of 8 or more), or everything is deliberately one size |
| **Weight** | Even grey of text and boxes | Mass gathered in one place, with the rest nearly empty |
| **Position** | Centred, or flush left in a centred container | Placed on a line that is not the centre: a third, a fifth, an edge |
| **Direction** | Top to bottom | A second reading direction is present: across, diagonal, or around the perimeter |
| **Interval** | Equal gaps | Gaps in a ratio: tight clusters separated by a wide silence |
| **Edge** | A safe margin all round | Something touches, crosses or is cut by the frame; or nothing comes near it |
| **Depth** | One flat plane | Things cover other things, and the order means something |

Use the forces to say what a frame is doing. "The hero feels weak" is not usable. "Scale and position are both neutral" is.

## 2. Hierarchy in three reads

A viewer takes a frame in three reads. Design each one.

1. **The glance (under a second, at arm's length).** One shape. Check it in the blurred thumbnail on the board or in `first.jpg`: if no shape survives the blur, there is no first read.
2. **The scan (a few seconds).** Two to four anchors, in an order. The order is set by scale, then contrast, then position. Decide the order and then verify it; do not assume it.
3. **The read.** Everything else, at a size and measure made for reading.

Each read needs a clear step down from the one before. Most weak frames have a strong third read, a vague second and no first.

## 3. The structures and how to build them

`deal.mjs` deals one structure per key frame and prints its principle, the decisions it requires and its trap. This table adds what each family needs in the build. A structure is a principle to satisfy. None of them is a template.

| Family | Structures | What makes it work | Build notes |
|---|---|---|---|
| **Axis** | Spine, Counterweight, Oblique | One line of force that other elements obey or oppose | Name the line in the grid (`[spine]`) and align to it across sections with subgrid. For Counterweight give each field a different behaviour: one `position: sticky`, one scrolling. For Oblique, step blocks with `grid-column` offsets before rotating anything; rotated text needs a horizontal fallback at narrow widths. |
| **Mass** | Monolith, Specimen | A single dominant relationship between one thing and the field | Size the mass in `vw` or `cqw` so the crop holds at every width. Clip with `overflow: clip` on the frame. Place the small elements by measurement against the mass, never by auto flow. For Specimen, fix the object's size and position with intent and compose the empty field's proportions. |
| **Field** | Index, Matrix, Document, Console, Text as texture | Evenness that reads as one object, with one anomaly or one way in | Real content in every unit. For Index and Matrix prefer `<table>`, `<ol>` or `<dl>` semantics and a grid with subgrid so columns align across rows. For Document, set the measure first and give the margin a job. For Console, the thing must work. |
| **Sequence** | Strata, Strip, Stage | Proportion between steps, and a peak | Strata: band heights from a ratio series (for example 1 : 5 : 2 : 8), never one padding token. Strip: `overflow-x` with scroll-snap, keys and visible position, never a timed carousel. Stage: `position: sticky` inside a tall wrapper; every state reachable and readable without script. |
| **Layer** | Overlap, Aperture | Occlusion that states a relationship | Overlap by placing items in the same grid cells and ordering with `z-index`; avoid absolute offsets that break on resize. For Aperture, shape the opening with `clip-path` or `mask` and decide what the surrounding page may not do. |
| **Edge** | Perimeter, Off-frame | The viewport's boundary used as a compositional element | Perimeter: a full-viewport grid with content in the outer tracks; decide what the perimeter does on scroll. Off-frame: negative margins or oversize elements inside `overflow: clip`; list what may never be cut and test at every width. |

Whatever the structure, write its decisions down as numbers (the ratio, the line, the crop) before building. Unstated decisions default to neutral.

## 4. The grid is a decision

A twelve-column grid with a centred container is the absence of a decision. Choose a grid from the content and the device.

- **Count columns from the content.** A comparison of three things wants a multiple of three. A text with marginalia wants two unequal columns. A catalogue wants as many columns as make one unit the right size.
- **Make it unequal on purpose.** `grid-template-columns: 2fr 5fr 3fr` holds more tension than twelve equal tracks. Tracks in a ratio (2 : 3 : 5, 1 : 1.618, 1 : 2 : 4) give positions that feel related.
- **Compound grids** (two grids overlaid, such as 4 and 5 columns on the same width) give many alignment positions that still feel ordered. Use them for editorial and expressive work.
- **A baseline rhythm** matters most in Document, Index and Matrix structures. Set line-height as the unit and make vertical spacing a multiple of it.
- **Margins are tracks too.** Unequal outer margins (a wide left, a tight right) are one of the cheapest ways to leave neutral.
- **Break the grid once.** One element that leaves the system, at the moment that matters most, reads as emphasis. Several read as carelessness.

State the grid in one line in the direction brief: columns, ratios, margins, baseline, and the one permitted break.

## 5. From one frame to a page: the flatplan

A page is a sequence of scenes, and a sequence needs shape. Editors plan it on a flatplan: every spread small, in a row, before any is designed. Do the same before building.

| # | Scene's job | Structure | Largest element | Density | Ground | How it arrives |
|---|---|---|---|---|---|---|
| 1 | | | | sparse / medium / dense | | |

Rules for the sequence:

- **One peak.** Decide which scene is the most intense and let nothing else compete with it. It is rarely the first screen.
- **Rests.** After a dense or loud scene, a quiet one. Emptiness is a scene.
- **Change something structural between neighbours.** In the Expressive and Radical registers no two consecutive scenes share a layout. In Quiet and Composed, repetition is allowed where it is a true series, and the series is then designed as one object.
- **Heights in a ratio.** Scenes of equal height read as a stack of blocks. Let one be a sliver and another two screens.
- **Ground changes are cuts.** A change of background is the strongest transition available. Spend it where the subject changes, not every other section.
- **Every scene answers a question the last one raised** ([experience-flow.md](experience-flow.md)). Pacing serves the argument. It never replaces it.

After building, compare the plan with `flatplan.jpg` from `audit_page.mjs`, which shows every screen of the real page in order, and with the pacing facts: ink per screen, ground changes, self-similarity. A flat line of numbers is a flat page.

## 6. Image and text

The relation between image and text is a decision with few options. Choose one as the project's rule and one as the exception.

| Relation | Use | Watch |
|---|---|---|
| **Beside** | Each needs to be read in full | The dull default; make the proportions unequal |
| **Over** | The image is atmosphere or the text names it | Contrast at the worst crop; place type on the calm part of the image, not on a scrim by habit |
| **Inside** | Type as a window or mask for image or film | Works only at very large sizes; needs a fallback colour |
| **Interrupting** | An image set into a line or column of text | Line-height and vertical alignment need hand tuning |
| **Captioned** | The image is evidence | A real caption system: position, size, what it always states |
| **Cropped by type or frame** | The image is larger than its window | Choose the crop per breakpoint with `<picture>` or `object-position` |

The crop is composition. A wide, safe, centred crop wastes the image. Decide what the picture is of and crop until only that is left.

## 7. Navigation is part of the composition

Navigation occupies the frame, so it is designed with the frame. A bar across the top is one option among several: a masthead, a rail down one side, corners of a perimeter, an index that is the home page, links set inside the text, a single word that opens everything.

How far to go depends on the register. In Quiet and Composed, keep the model people know (what, where, how many taps) and design its form. In Expressive, the form may change as long as every destination is one obvious action away. In Radical, the model itself may be reinvented, with a conventional index always reachable. In every register it must work by keyboard, state the current location, and remain usable when the page is zoomed to 200%.

## 8. Density

Density is how much a screen holds. It is chosen, like scale.

- **Sparse** (one idea per screen) suits a single claim, an object, a moment. It needs exact placement, because every position is exposed.
- **Dense** (many items per screen) suits comparison, reference and tools. It needs strict alignment and a small type system, because anything loose becomes noise.
- The audit reports characters per screen. Read it against intent: a "premium" page that turns out to be medium density everywhere has made no decision.
- Dense is not cluttered. Clutter is density without alignment. A timetable is dense and calm.
- Contrast of density between neighbouring scenes is a pacing tool (§5).

## 9. The narrow screen is a second composition

A phone is a tall, narrow frame held close. A desktop composition shrunk into it loses every force it had. Compose it again.

- **Re-derive the device.** Ask what the device's rule produces in a frame 390 wide and 844 tall. A Monolith may grow relative to the screen. A Counterweight may turn from side-by-side into a short fixed band over a scrolling field. A Matrix may keep one axis fixed and let the other scroll.
- **Re-sequence.** The order that works across may be wrong down. Lead with what the visitor needs first.
- **Re-scale.** Keep the scale ratio or raise it. Display type set in `vw` often needs a larger share of a narrow frame than of a wide one.
- **Re-crop.** Choose the image's narrow crop by hand.
- **Never lose** the primary action, the current location, or any content. Hiding content on a phone is deleting it for most visitors.
- Sketch the narrow frame in the same file as the wide one (the board shows both), and judge it as its own image.

Engineering detail (ranges, input modes, safe areas) is in [responsive-engineering.md](responsive-engineering.md).

## 10. Faults, and how to see them

| Fault | How it shows | Where to look |
|---|---|---|
| Centred by default | High share of centred text; near-symmetric first screen | audit design facts: alignment, symmetry |
| One container width for everything | Every block starts on the same line; no full-bleed, nothing crossing the frame | text start lines; layering |
| Gentle scale | Largest type under about three times body | scale ratio |
| Equal intervals | Section heights and gaps nearly identical | height variation; `flatplan.jpg` |
| One mould | Runs of identical layouts; groups of identical siblings | layout run; repetition |
| No first read | Nothing survives the blur | squint row on the board or `first.jpg` |
| Trapped space | Empty areas enclosed by content, belonging to nothing | view the frame; emptiness should connect to an edge |
| Accidental lines | Many text start positions that almost align | text start lines: more than three or four needs a reason |
| Orphans | A small element far from anything it relates to | view the frame |
| Timid crop | The image shown whole, small and centred | view the frame |
| Collision at the narrow width | Text sitting on other text where an offset that held wide no longer does | layering: text over text; the narrow column in `sheet.jpg` |

The numbers are evidence for a judgement, never the judgement. A Quiet page may rightly be symmetric and gentle in scale, if that is the conviction and it is carried exactly ([jury.md](jury.md)).

Three checks cost nothing: blur it (is there a shape), shrink it to a thumbnail (is it recognisable), and remove one element at a time (does anything get worse).

## 11. Layout mechanics in CSS

```css
.frame {
  display: grid;
  /* named lines make intent readable; tracks in a ratio, margins as tracks */
  grid-template-columns:
    [bleed-start] minmax(1rem, 4vw)
    [main-start] 2fr [spine] 5fr [aside-start] 3fr [main-end]
    minmax(1rem, 2vw) [bleed-end];
  column-gap: clamp(0.75rem, 1.5vw, 1.5rem);
}
.frame > * { grid-column: main; }
.frame > .bleed { grid-column: bleed; }
.frame > .hangs { grid-column: spine / main-end; }
.scene { display: grid; grid-template-columns: subgrid; grid-column: bleed; }   /* children share the page's lines */
```

- `minmax(0, 1fr)` and `min-width: 0` stop long words and code from pushing tracks wider.
- Overlap by sharing cells: give two items the same `grid-area` and order them with `z-index`. It survives resizing where absolute offsets do not.
- Size display type against the frame (`font-size: clamp(3rem, 18vw, 22rem)`), or against its container with `cqw` when the component moves between contexts.
- Clip with `overflow: clip` (it does not create a scroll container, so sticky descendants keep working); use `contain: paint` for large clipped scenes.
- Sticky scenes: a tall wrapper sets the scroll length, the inner element is `position: sticky; top: 0; height: 100svh`.
- Use `svh` and `dvh` instead of `100vh` for full-height scenes on phones, and `scroll-margin-top` so anchors clear a fixed header.
- Container queries for components that live in more than one place; media queries for the page's structure.
- Logical properties (`margin-inline`, `inset-block`) keep a composition intact in right-to-left languages.
- `text-wrap: balance` for headings and `text-wrap: pretty` for body, as enhancements.
- Stress the frame before trusting it: the longest real headline, a translated string, zoom to 200%, and no images.
