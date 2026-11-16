# The deck

`deal.mjs` deals from [`deck.json`](../../skills/form-and-force/scripts/deck.json): four registers, 26 lenses in 8 families, 17 structures in 6 families and 8 lead media. The deck holds questions and structural principles only. A card never names a colour, a typeface or a size, and a test enforces it.

This page lists the deck so people can understand a hand. **Agents should not browse it to pick favourites**: the point of dealing is that the choice is not made by preference ([direction.md §5](../../skills/form-and-force/references/direction.md#5-deal-the-hand-and-answer-it)). The tables are generated from `deck.json` by `tooling/sync_docs.py`; edit the deck, not these tables. `node scripts/deal.mjs deck` prints the same content, with every card's full text.

## Registers

The register sets how far a project goes. Every hand prints what bold means in it, the least it must do, and its two failures.

<!-- generated:deck-registers -->
| Register | Motto | For | Timid looks like | Overwrought looks like |
|---|---|---|---|---|
| **Quiet** (`quiet`) | The task is the experience. | Public services, health and finance flows, dashboards, admin, documentation, tools used daily or under pressure. | Indistinguishable from the component library's demo page. | Any effect, flourish or wait that stands between a person and the task. |
| **Composed** (`composed`) | Clear, with a point of view. | SaaS and B2B marketing, professional services, product companies, corporate and institutional brands. | A clean page whose sections could be reordered or lent to a competitor without anyone noticing. | Effects competing with the product; a concept that needs explaining before the offer is understood. |
| **Expressive** (`expressive`) | Authored. | Brand, luxury, culture, hospitality, editorial, portfolios, e-commerce storytelling, launches. | Tasteful and interchangeable: restraint with nothing being restrained. | Many effects with no hierarchy among them; reading, buying or finding made harder for the sake of a mood. |
| **Radical** (`radical`) | A world with its own rules. | Creative studios, campaigns, experiments, art, music, fashion collections, immersive launches. | A conventional site wearing experimental styling. | Strangeness that communicates nothing about the subject; an experience that only works in a recording. |
<!-- /generated -->

## Lenses

A lens is a question that forces a position out of the subject. Each card also says what form the answer takes, how it applies in a restrained register, and its trap. Some lenses have variants (for example, which discipline's method to borrow); one is dealt with the card.

<!-- generated:deck-lens-families -->
| Family | What its lenses do |
|---|---|
| `truth` | Start from a fact the category rounds off, hides or illustrates instead of showing. |
| `inversion` | Turn a fixed convention over and keep the version that serves the visitor better. |
| `transposition` | Import the working method of another discipline or form. Take the logic, leave the look. |
| `scale-time` | Change how near, how large or how long. The subject's real dimensions and tempo become form. |
| `viewpoint` | Change who is speaking, in what tone, and what they are arguing. |
| `material` | Let one physical truth of the subject govern how surfaces look and behave. |
| `constraint` | Remove means until composition has to do the work. |
| `system` | Invent the rule that generates every screen, then decide where it breaks. |
<!-- /generated -->

<!-- generated:deck-lenses -->
| Lens | Family | The question |
|---|---|---|
| **Actual size** (`actual-size`) | `truth` | What is the true size, count, weight, duration or price of the thing, unrounded? Show it at 1:1 or in full, and let the page be organised by the fact that it does not fit, or fits exactly. |
| **The unsaid** (`the-unsaid`) | `truth` | What does every organisation in this category avoid showing or saying: the price, the limits, the mess before, the queue, the failure rate, the back room? Lead with it. |
| **One exhibit** (`one-exhibit`) | `truth` | If the page could present a single piece of evidence (one object, one screen, one number, one sentence, one photograph), which is it? Give it the whole stage and make everything else a caption to it. |
| **Invert the convention** (`invert-convention`) | `inversion` | Name the category's most fixed convention in structure, tone, colour or order. Invert it, then find the version of the inversion that serves the visitor better than the original. |
| **Last thing first** (`last-first`) | `inversion` | Start where pages of this kind end: the price, the form, the proof, the contact, the answer. What does the rest of the page become once the ending has already happened? |
| **Swap figure and ground** (`figure-ground`) | `inversion` | What is always background in this category: the grid, the metadata, the legal line, the packaging, the caption, the empty space? Make it the figure and let the usual hero become incidental. |
| **Borrow a discipline's method** (`borrowed-method`), 30 variants | `transposition` | How does {variant} organise, label, sequence and annotate its material? Apply that method to this content. Take the method and its logic. Leave its look. |
| **The trade's own grammar** (`native-grammar`) | `transposition` | What is the working grammar of the client's own medium or trade: its units, its sequence, its hand-offs, its closing ritual? Structure the experience by that grammar instead of by web sections. |
| **It is not a website** (`not-a-website`), 23 variants | `transposition` | Treat the experience as {variant}. What does that form make easy that a page of sections makes hard, and what does it refuse to contain? |
| **Too big for the frame** (`monumental`) | `scale-time` | Take one true element (a word, a number, a detail of the product, a mark) and make it larger than the viewport can hold. What does the crop keep, and what does that say? |
| **Ten times closer** (`ten-times-closer`) | `scale-time` | Move ten times closer to the subject than anyone in the category does. Which detail (a seam, a decimal, a keystroke, a grain, one clause) becomes the whole composition? |
| **Keep its time** (`real-tempo`) | `scale-time` | What is the subject's real tempo: how long does its defining process take, and what is its rhythm? Make the page keep that time in its pacing, its loading, its motion or its structure. |
| **The decisive moment** (`decisive-moment`) | `scale-time` | Which single moment in the subject's life contains the whole story: the pour, the handover, the first run, the signature, the reveal? Build the experience around the instant before it and the instant after. |
| **Whose eyes** (`whose-eyes`) | `viewpoint` | Tell it from a position the category never uses: the object's, the maker's bench, the back office, the person receiving it, the inspector, someone finding this page in fifty years. |
| **Change the tone of voice** (`tone-shift`), 12 variants | `viewpoint` | Play the whole experience {variant}, a tone this category never uses. What do type, spacing, motion and copy do when all of them hold that tone without winking? |
| **The argument** (`the-argument`) | `viewpoint` | What does this organisation believe that a respected rival would dispute? Design the page as that argument: claim, evidence, objection, answer. |
| **One material, its laws** (`material-law`) | `material` | Choose one physical material that is truly part of the subject. How does it fold, stack, tear, reflect, flow, set or wear? Every surface and movement obeys those laws and nothing behaves otherwise. |
| **Tool marks** (`tool-marks`) | `material` | What marks do the subject's tools and processes leave behind: registration marks, guide lines, seams, stamps, tolerances, margins of error? Let those marks build the layout system. |
| **One light** (`one-light`) | `material` | Decide where the light is, what it is (a north window, a sodium lamp, a screen's glow, noon) and how it changes. Colour, depth, shadow and motion all follow from that single source. |
| **One of each** (`one-of-each`) | `constraint` | Allow one typeface in one weight, and one colour besides ink and ground. What must scale, position, spacing and rhythm now do to carry every level of hierarchy? |
| **Remove the fixture** (`subtraction`) | `constraint` | Which fixture does this kind of page always have: the hero image, the navigation bar, the card grid, the section headings, the buttons? Remove it completely. What does its job now, and is the page better? |
| **One continuous surface** (`single-surface`) | `constraint` | No sections, no cards, no page breaks: everything lives on one continuous surface (a sheet, a table, a wall, a strip, a field). What organises it, and how does a visitor keep their place? |
| **Nothing but the content** (`content-only`) | `constraint` | No illustration, no decoration, no stock imagery: the content itself (the words, the numbers, the product, the interface) is the only visual material. How far can it be pushed as image? |
| **Driven by a real variable** (`driven-by-data`) | `system` | Pick one real variable from the subject: a date, a weight, a price, a coordinate, a count, the time of day. Let it visibly drive one design parameter: size, position, colour, density or speed. |
| **Three rules, one break** (`three-rules`) | `system` | Write a three-rule visual grammar that could generate every screen of this project. Then decide the single place where exactly one rule is broken, and why there. |
| **A series, not a page** (`the-series`) | `system` | Treat each page or section as an issue in a series. What stays fixed like a masthead, and what must change completely each time, like a cover? |
<!-- /generated -->

## Structures

A structure is a compositional principle for the key frame. Each card also lists the decisions it requires and its trap. Not every structure can be dealt in every register.

<!-- generated:deck-structure-families -->
| Family | What its structures do |
|---|---|
| `axis` | A line of force organises the frame. |
| `mass` | One thing dominates by size or by isolation. |
| `field` | Many parts form one even surface. |
| `sequence` | The frame is a step in an ordered progression. |
| `layer` | Depth comes from what covers what. |
| `edge` | The frame's own boundary does the composing. |
<!-- /generated -->

<!-- generated:deck-structures -->
| Structure | Family | Registers | Principle |
|---|---|---|---|
| **Spine** (`spine`) | `axis` | Quiet, Composed, Expressive, Radical | One line, vertical or horizontal and placed off-centre, carries the page. Everything hangs from it or butts against it. Nothing floats free. |
| **Counterweight** (`counterweight`) | `axis` | Quiet, Composed, Expressive, Radical | Two unequal fields held in tension: one heavy and still, one light and active. The ratio is far from half and half, and each field behaves differently. |
| **Oblique** (`oblique`) | `axis` | Composed, Expressive, Radical | A dominant diagonal organises the frame: a staircase of stepped blocks, a rotated plane, or a reading path that travels corner to corner. |
| **Monolith** (`monolith`) | `mass` | Composed, Expressive, Radical | One element at overwhelming scale, usually cropped by the frame. Everything else is caption-size and positioned in relation to it. |
| **Specimen** (`specimen`) | `mass` | Quiet, Composed, Expressive, Radical | A single small thing isolated in a large, deliberate emptiness. The empty field is the material: its proportions are composed, never left over. |
| **Index** (`index`) | `field` | Quiet, Composed, Expressive, Radical | An even field of many equal units (rows, entries, names, thumbnails) with no hero. Hierarchy comes from order, density and one anomaly. |
| **Matrix** (`matrix`) | `field` | Quiet, Composed, Expressive, Radical | Content laid out on two meaningful axes and read both across and down. The structure is the argument: a comparison, a schedule, a range. |
| **Document** (`document`) | `field` | Quiet, Composed, Expressive | The page as a typeset document: a text column with a true measure, and margins that work, holding the notes, figures, dates and references that belong beside the text. |
| **Console** (`console`) | `field` | Quiet, Composed, Expressive, Radical | The working thing fills the frame: a live tool, a real interface, a control surface. The composition is the instrument's own layout and persuasion happens through use. |
| **Text as texture** (`texture`) | `field` | Composed, Expressive, Radical | Running text or data set so dense, so large or so repeated that it reads as a surface first and as words second, with a clear way in for actually reading it. |
| **Strata** (`strata`) | `sequence` | Quiet, Composed, Expressive, Radical | Horizontal bands of sharply different height and density stacked into a rhythm: a sliver, a slab, a sliver. The proportions between the bands are the composition. |
| **Strip** (`strip`) | `sequence` | Composed, Expressive, Radical | A lateral sequence of frames read sideways: a progression, a comparison, a procession. The viewport is a window onto a longer horizontal object. |
| **Stage** (`stage`) | `sequence` | Expressive, Radical | One persistent scene holds still while its state changes. Scrolling or input moves a camera or a clock. The page itself does not travel. |
| **Overlap** (`overlap`) | `layer` | Composed, Expressive, Radical | Planes overlap on purpose: image over type, type over image, sheet over sheet. Occlusion makes depth and shows which thing belongs to which. |
| **Aperture** (`aperture`) | `layer` | Composed, Expressive, Radical | A framed opening inside a quiet page looks onto something richer: a scene, a film, a live view, a deep image. The opening's shape and position are the composition. |
| **Perimeter** (`perimeter`) | `edge` | Composed, Expressive, Radical | Content lives at the edges and corners of the frame. The centre is kept empty or given to one thing. The frame itself becomes the layout. |
| **Off-frame** (`off-frame`) | `edge` | Composed, Expressive, Radical | The composition is larger than the viewport and says so. Elements enter and leave across the edges, and what is cut off implies the rest. |
<!-- /generated -->

## Lead media

What carries the frame. The dealer deals only media the project has (`--has`) or that can be made in code.

<!-- generated:deck-media -->
| Lead medium | Needs | From register | What carries the frame |
|---|---|---|---|
| **Type alone** (`type`) | nothing | Quiet | Letterforms, numerals and spacing carry the frame. No image. |
| **Drawn in code** (`drawing`) | nothing | Quiet | An SVG line drawing, diagram, plan, pattern or figure made for this subject. |
| **Generated surface** (`generative`) | nothing | Composed | A procedural surface (canvas, shader or CSS) whose rule comes from the subject. |
| **The working thing** (`interface`) | `ui` | Quiet | A real component or product surface the visitor can operate. |
| **Real data** (`data`) | `data` | Quiet | Actual numbers, tables or charts as the visual. |
| **Photograph** (`photo`) | `photo` | Quiet | The project's own photography, art-directed by crop and scale. |
| **The object** (`object`) | `object` | Quiet | The product itself as a cut-out, a render or a model. |
| **Moving image** (`footage`) | `video` | Composed | The project's own film, with a poster and a pause control. |
<!-- /generated -->

## Changing the deck

Card ids are stored in people's history files, so they are never renamed. New cards follow the same fields and the same rule: questions and principles, never a look. See [extending](../development/extending.md#a-deck-card).
