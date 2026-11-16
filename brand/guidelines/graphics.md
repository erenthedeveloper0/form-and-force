# Graphic language

The storyboard's images are folds: dark sheets bent by a force you cannot see, with light running along their edges. They are the brand's only illustration. They are drawn in code, in [`build.mjs`](../build.mjs), so they can be changed, re-rendered at any size and kept consistent.

## Folds

A fold is a **crest** (a curve) and a **sheet** (the region on one side of it). Light is drawn along the crest in three layers, wide and faint, narrower and brighter, and a fine edge, and the first two are clipped to the sheet. The light falls off into the fold the way it does on silk, instead of glowing in the air.

Each scene is a short list of folds in fractions of the canvas, so the same scene renders correctly at any size:

| Scene | From the storyboard | Used in |
|---|---|---|
| **Hero** | The top banner: a long swell from the left that falls away before the centre, a veil dropping from the top right to a peak, a low fold running out to the right | The dark README banner |
| **Veil** | The hero without its swell, leaving the left side for text | The social preview, the documentation's dark background |
| **Ridge** | The release card: one crest crossing the frame | An alternative dark background, for compositions with little text |
| **Drift** | The closing card: one fold rising from the foot of the frame | An alternative dark background |
| **Silver** | The light panel: a silver ground with a dark fold at the right and violet folds rising in front | The light README banner, the documentation's light background |

When a new scene is needed, take it from the storyboard or from these, and keep the composition's centre, or the side that carries text, clear.

## Crests carry the light

- Light appears only along crests. A region that is not near a crest is ground.
- All crests in a scene are lit from one side, consistent with the mark's direction of travel.
- Colour (violet, ultramarine) appears in the light of a crest and fades with it.
- A crest never passes under a lockup or through text. Move the fold, not the words.

## The glint

The four-point glint ([`graphics/form-and-force-glint.svg`](../graphics/form-and-force-glint.svg)) is the specular point where a crest peaks: long on the axis of the crest, short across it. It appears at most once in a composition, always on a crest, at a size that reads as a point of light rather than an icon. It is never used as a bullet, a "magic" or "AI" symbol, a button icon, or a decoration floating in space.

## Grain

Every rendered composition carries fine monochrome grain at 6–7 % opacity, blended softly. It stops the long dark gradients from banding into visible steps on 8-bit screens. It is not a texture to be seen; if you notice it at 100 %, it is too strong.

## Lines

The lockup's rule is the only straight line in the system. Interfaces use hairlines (`line` in the themes) to separate content; they are structure, not decoration, and are never lit. The one exception is the README's section divider ([`graphics/form-and-force-divider.svg`](../graphics/form-and-force-divider.svg)): a crest seen side on, violet at its ends and brightest in the middle, fading out at both edges. It is used between the README's major sections and nowhere else.

## What is not part of the language

Glass panels, frosted cards, blurred orbs, gradient text, neon outlines, 3D renders, photography, stock illustration, emoji and icon sets for decoration. Form & Force's own floor ([`floor.md`](../../skills/form-and-force/references/floor.md) §6) lists most of these as common defaults, and this brand has no job for them.
