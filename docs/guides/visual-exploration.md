# Visual exploration

Three directions written as paragraphs can sound different and render as the same page. So in Form & Force a direction is not chosen until it has been drawn: rough key frames, rendered side by side, chosen by looking. This guide covers that stage. The agent follows [direction.md §8](../../skills/form-and-force/references/direction.md#8-sketch-key-frames-and-choose-by-looking).

## Sketching a key frame

A key frame is the single screen that has to prove a device, usually the first screen. Sometimes it is the moment the product is first used, or an index.

- **One standalone HTML file per frame**, in a scratch folder outside the project's source: by convention `.ff/frames/a.html`, `b.html`, `c.html`. No framework, no build, no libraries. The project's stack comes later.
- **Real words, real typefaces, real numbers** from the project, loaded the way the page would load them.
- **The dealt cards are obligations.** The frame obeys its structure and lead medium, and the decisions on the structure card's "Decide" line are written as a comment at the top of the file.
- **Rough is correct.** Effort goes into proportion, scale, position and the one idea. No hover states, no polish.
- **The narrow screen is designed in the same file**, as its own composition. A device that dies at 390 px is not a device.

## The sketch board

```bash
node scripts/sketch_board.mjs .ff/frames/a.html .ff/frames/b.html .ff/frames/c.html
```

The board renders each frame at a wide and a narrow viewport (1440 × 900 and 390 × 844 by default), adds a blurred greyscale thumbnail of each (the squint test), and writes `board.jpg`. It also measures whether the frames differ in structure or only in content. If two frames measure as the same composition, one of them did not obey its cards, and it is sketched again.

Options worth knowing: `--scroll` adds the second screen of each frame, `--labels` names the columns, and passing the current page's URL first gives a before-and-after board. All options are in the [tools reference](../reference/tools.md#sketch_board).

## Choosing by looking

The choice is made from the image, before anyone re-reads a rationale. The agent answers six questions from the board:

1. In the blurred thumbnails, which frame still has a shape?
2. What does each frame do that the others, and the twin, do not?
3. Which frame would a stranger describe correctly after five seconds?
4. Which frame makes the content more itself, and which merely decorates it?
5. Which frame could carry ten more screens without repeating or collapsing?
6. Which frame is at the right height for the register?

It chooses what wins on what is seen, not what is easiest to justify or took longest. A hybrid is allowed only if it still states one device in one sentence. If no frame clears the register's floor, it deals again instead of picking the least bad.

**You see the board** on large work (L and XL scope) when you are available. The agent recommends one frame and says what each alternative would have given you. If you are not available, it proceeds with its choice and reports it.

## Keeping explorations genuinely different

Explorations fail when they are recolourings of one layout. Three things prevent that:

- **The deal.** Frames never share a lens family or a structure family.
- **The measurement.** The board flags frames that measure as the same composition.
- **The blur.** A frame whose only difference is colour or typeface has no distinct shape in the squint thumbnail.

## From the chosen frame to a system

The chosen frame becomes the source of truth. The grid, type, colour and motion are extracted from it, not written beside it. That is the next stage: [design language](design-language.md).

## Without a browser

`sketch_board.mjs` needs Playwright with Chromium. Without it, frames are compared as precise written descriptions (position, proportion, scale, what is cropped), and the report says the choice was made without rendered evidence ([direction.md §13](../../skills/form-and-force/references/direction.md#13-without-a-browser)).

## For the agent

[direction.md §8–9](../../skills/form-and-force/references/direction.md#8-sketch-key-frames-and-choose-by-looking) · [composition.md](../../skills/form-and-force/references/composition.md) (the structures and how to build them) · [jury.md §8](../../skills/form-and-force/references/jury.md#8-reading-the-design-facts) (what the measurements mean)
