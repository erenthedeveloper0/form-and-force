# Colour, material and imagery

What the surfaces are, what is shown on them, and where both come from. Covers colour strategy, material and light, choosing a visual medium, working when there are no assets, art-directing photographs, and delivery.

## Contents
1. Colour is a strategy before it is a palette
2. Where colour comes from
3. Building the colour system
4. Material and light
5. Choosing the medium
6. When there are no assets
7. Art-directing photographs
8. Image treatments as a system
9. Icons and small graphics
10. Delivery
11. Faults

---

## 1. Colour is a strategy before it is a palette

Choosing five swatches is not a colour decision. Decide the strategy first: how colour is structured and what it is for. The same hues give opposite results under different strategies.

| Strategy | Structure | Suits | Trap |
|---|---|---|---|
| **Monochrome** | One hue, or none; value and scale do all the work | Type-led and Quiet work; a subject with one strong material | Grey timidity: push the value range to its ends |
| **Ground-led** | The ground itself is the identity: saturated, dark or unusual; ink stays minimal | Brands with one owned colour; short, bold pages | Text contrast on the ground; fatigue on long reading |
| **Signal** | A neutral field, and one colour reserved for exactly one meaning | Tools, services, anything with a primary action or a live state | The signal leaking onto decoration until it means nothing |
| **Two inks** | Two colours used like print inks, including where they overlap | Editorial, cultural, anything with a print heritage | Choosing two inks that have no reason to meet |
| **Coded** | Colour carries data: categories, states, ranges | Dashboards, maps, catalogues, documentation | Too many categories; no redundant encoding |
| **Sampled** | The palette is measured from the subject: its materials, its photographs, its place | Craft, food, architecture, hospitality, product | Averaging everything into beige; sample extremes too |
| **Scene by scene** | Each scene or issue has its own ground, inside a fixed frame | Series, collections, editorial, long narratives | Rainbow without a rule: tie each ground to its content |
| **One light** | Colour follows a light source that has a position and changes over time | Places, products, atmospheres, immersive work | A glow with no source |
| **Full chroma** | Many saturated colours, organised by a strict rule | Play, culture, systems with many parts | No rule: it reads as noise |

Write the strategy as one sentence in the direction brief, with its proportions: for example "Signal: 93% bone ground, 6% ink, 1% red, and red only ever marks live data." The proportion is the strategy. A page that is 60% ground, 30% second colour and 10% accent by habit has not chosen one.

## 2. Where colour comes from

Derive it, in this order of preference:

1. **Owned equity.** A colour the organisation already uses and is known by. Use it with more conviction than they do.
2. **The subject's material.** Measure real things: the product, the raw material, the place, the packaging, the tool. Sample from photographs of them. Record what each colour was sampled from.
3. **Function.** What must be distinguished: states, categories, the one action. Colour that does a job is rarely generic.
4. **Process.** The colours of how the thing is made or reproduced: print inks, thermal paper, blueprint, enamel, anodising, a particular screen.
5. **Light and place.** The colour temperature of where and when the subject lives.

Do not derive colour from the category ("finance is blue, wellness is green") or from what looks expensive this year. Both lead straight to the twin. Run `deal.mjs recent` and avoid the palette structures your last projects used.

## 3. Building the colour system

- **Work in OKLCH.** Lightness steps are perceptually even and chroma can be held constant across hues. Mix tints with `color-mix(in oklch, ...)`.
- **Roles, not swatches.** Ground, ink, quiet ink, line, signal, focus, and states (success, warning, danger, information). Components use roles only.
- **Tint the neutrals** toward the ground or the main hue. Untinted greys beside a coloured ground look dead.
- **Black and white are choices.** Pure black on pure white is a strong, harsh statement and sometimes the right one. A tinted near-black by habit is as much a default as pure black.
- **Contrast is checked, not assumed:** 4.5:1 for text, 3:1 for large text, control boundaries and focus indicators. Check every text-over-image case at its worst crop.
- **Dark mode is a second composition.** Do not invert. Lower chroma on large areas, raise it on small ones, and rebuild elevation: in the dark, nearer surfaces are lighter.
- **States never rely on colour alone.** Pair with shape, text or position. Support `forced-colors: active`.
- **Data colours** are a separate, tested set: distinguishable under colour-vision deficiency, ordered when the data is ordered.

```css
:root {
  --ground: oklch(0.93 0.02 95);    /* each value recorded with what it was derived from */
  --ink: oklch(0.21 0.02 260);
  --ink-quiet: color-mix(in oklch, var(--ink) 62%, var(--ground));
  --line: color-mix(in oklch, var(--ink) 16%, var(--ground));
  --signal: oklch(0.63 0.21 28);
  --focus: var(--ink);
}
```
The values above only show the structure. Never start from them.

The audit reports the first screen's ground, the share of pixels carrying colour, and the hues present. Read those against the stated proportions. A "ground-led" page measuring 2% colour did not commit.

## 4. Material and light

Decide what the surfaces are made of and where the light is. Everything else about a surface follows.

- **One light.** Pick its position and softness. Shadows fall one way, at lengths that match elevation. If there is no light in the concept, there are no shadows: use lines, steps of tone, or overlap to separate planes.
- **Elevation means something.** A raised surface is temporary, movable or interactive. If everything is raised, nothing is.
- **Radius is a material property.** Machined things have small, exact radii; soft things have large ones; paper and screens have none. One radius on every surface says nothing about any of them. Vary by what the surface is, and keep the set small.
- **Lines** (hairlines, rules, frames) are structure. Use them where the content has structure. A rule above every block by habit is chrome.
- **Texture** (grain, paper, noise, weave) needs a source in the subject and a job in the composition: separating planes, softening banding, tying photographs together. Keep it off text.
- **Translucency and blur** show what is behind. Use them when what is behind matters while this surface is open. Provide solid fallbacks for `prefers-reduced-transparency` and `prefers-contrast`, and measure the paint cost on a phone.
- **Gradients** are light or material: a sky, a glaze, a sheet of metal, a fade into depth. A gradient with no source is decoration.

## 5. Choosing the medium

The question is which medium communicates the device, not which is most impressive.

| Medium | It is best at | It needs | It fails when |
|---|---|---|---|
| **Photograph** | Evidence, presence, people, places, texture | Real, specific pictures and a crop decision | It is stock, generic or decorative |
| **Film** | Process, time, atmosphere, a product in use | Real footage, a poster frame, a pause control | It autoplays as wallpaper |
| **Illustration** | Things that cannot be photographed; tone of voice; simplification | A consistent hand and a reason to draw | It is a library of someone else's characters |
| **Drawing and diagram** | Mechanism, structure, sequence, measurement | Accuracy: it must be true to how the thing works | It is decorative line art |
| **Data** | Scale, change, comparison, proof | Real numbers with units and sources | The numbers are invented or the chart is ornament |
| **The interface itself** | What the product does | A working component, or a faithful one with labelled sample data | It is a fake dashboard |
| **The object** | A physical product's form | A cut-out, a render or a model, lit with intent | It spins for no reason |
| **Generated surface** | Material, atmosphere, a system made visible, a rule that never repeats | A rule taken from the subject ([creative-coding.md](creative-coding.md)) | It is a shader because shaders look advanced |
| **Type alone** | Voice, argument, names, numbers | A real typographic idea ([typography.md](typography.md)) | It is a headline over nothing |

Decide with four questions:
1. **Evidence or atmosphere?** Evidence must be real. Atmosphere can be made.
2. **Does it exist?** List what the project really has (§2 of [direction.md](direction.md)). Design for that, not for what would be nice.
3. **Is it specific?** If the image could illustrate a competitor's page, it is not carrying the device.
4. **Who can make it?** You can make type, drawings, diagrams, data graphics, interfaces and generated surfaces in code. You cannot make photographs of real people, places or products.

One medium leads. A second supports. Three or more usually means no decision was made.

## 6. When there are no assets

This is the usual case, and it is where pages collapse into text in boxes. Work down this list. Every step is honest.

1. **Make the content the image.** The real number at huge scale. The real list as a field. The real interface, working. The real document, set properly.
2. **Draw it in code.** A plan, a section, a diagram of the mechanism, a pattern from the subject's geometry, a map, a timeline to scale. SVG drawn for this subject is specific in a way stock never is.
3. **Generate a surface from a rule.** A field, a material, a light, with its parameters taken from facts.
4. **Design the slot and write the shot.** Where a real photograph is essential, build the frame at its true size and crop, fill it with an honest placeholder (a flat field with a one-line description of the picture that belongs there), and give the user a shot list: subject, distance, angle, light, crop ratio, count.

Never: stock photographs standing in for the client's people, place or product; generated faces; invented screenshots; logos of customers who have not agreed. If image generation is available and the user wants it, generated images may serve as atmosphere or as clearly labelled concept art. They are never presented as the real product, place or people.

A missing photograph is a constraint, and constraints make devices. Several of the lenses (Nothing but the content, One of each, Actual size) are built for exactly this.

## 7. Art-directing photographs

When photographs exist, direct them. Do not just place them.

- **Crop to the subject of the picture.** Decide what the picture is of and cut away the rest. Tight crops and off-centre subjects have more force than safe wide ones.
- **Three distances.** A strong set mixes far (the place), middle (the thing in use) and near (a detail). A page of pictures all taken from the same distance is flat.
- **A ratio set.** Choose two or three aspect ratios and hold them. Mixed ratios without a system look like an upload folder.
- **Scale with intent.** One picture very large, others much smaller. Equal sizes say equal importance.
- **Sequence.** Order pictures so each adds something: wide then close, before then after, whole then part.
- **Consistency.** If the pictures come from different sources, unify them with one treatment (§8).
- **Faces look at something.** Place the picture so a gaze points into the page or at the thing it concerns.
- **Per breakpoint.** Choose the narrow crop by hand with `<picture>` or `object-position`. Never let the centre crop decide.

## 8. Image treatments as a system

A treatment is a rule applied to every image, derived from the subject's process or material. One treatment, everywhere, or none.

| Treatment | How | Source it needs |
|---|---|---|
| Duotone or tritone | SVG `feColorMatrix` / `feComponentTransfer`, or `mix-blend-mode` over a colour field | Two inks in the colour strategy |
| Halftone or dither | Canvas ([creative-coding.md](creative-coding.md)) or a pre-processed asset | A print or screen heritage |
| Monochrome | `filter: grayscale(1) contrast(1.1)` | A strategy where colour is reserved for something else |
| Grain | A small tiled noise texture with `mix-blend-mode`; avoid full-screen live `feTurbulence` | Film, paper or material in the subject |
| Mask and shape | `clip-path`, `mask-image` | A shape that belongs to the device |
| Blend with ground | `mix-blend-mode: multiply` on a light ground, `screen` on a dark one | Images that should sit in the page like ink |

Treat at build time when possible. Live filters on large images cost paint on every scroll.

## 9. Icons and small graphics

- Use an icon where it speeds recognition: navigation, actions, status. A feature list does not need an icon per item.
- One set, one stroke weight, one grid, matched to the type's weight and corner character. Inline SVG with `currentColor`.
- Decorative icons take `aria-hidden="true"`. Icon-only buttons need an accessible name.
- If the subject has its own marks (symbols from its trade, its notation, its instruments), those are better than any generic set. Draw them.

## 10. Delivery

```html
<img src="/img/yard-1600.avif" srcset="/img/yard-800.avif 800w, /img/yard-1600.avif 1600w, /img/yard-2400.avif 2400w"
     sizes="(min-width: 1024px) 66vw, 100vw" width="2400" height="1350"
     alt="Container yard at dusk with trucks queued at gate 3" fetchpriority="high" decoding="async">
<picture>   <!-- art direction: a different crop for the narrow screen -->
  <source media="(max-width: 600px)" srcset="/img/yard-portrait-800.avif" width="800" height="1000">
  <img src="/img/yard-1600.avif" width="1600" height="900" alt="...">
</picture>
```

- Always set `width` and `height`, or `aspect-ratio`. Lazy-load below the first screen only. Never lazy-load the LCP image; give it `fetchpriority="high"`.
- AVIF or WebP with sensible quality; SVG for drawings; video only where time is the point.
- Alt text says what the image shows and why it is there. Decorative images take `alt=""`.
- Video: `muted playsinline` for autoplay, a poster, a pause control for anything over five seconds, captions for speech.
- Budgets and measurement are in [performance-engineering.md](performance-engineering.md).

## 11. Faults

| Fault | Reads as |
|---|---|
| A palette with no proportions | Five swatches used evenly: no strategy |
| The accent on everything | A signal that means nothing |
| Colour from the category | The twin |
| Shadows with no light, on every surface | Kit styling |
| One radius everywhere | No material |
| Texture over text | Decoration costing legibility |
| A gradient or glow with no source | Atmosphere by default |
| Stock or generated people | A lie, and visitors can tell |
| Pictures all at one distance and one size | An upload folder |
| Centre crops at every breakpoint | Nobody looked at the phone |
| Three or more media competing | No lead medium was chosen |
| Text in boxes and nothing else | The asset problem was never faced (§6) |
