# Design language

Once a key frame is chosen, it is the source of truth. The grid, the type, the colour, the imagery and the motion are extracted from it, not written beside it, and nothing is carried over from another project. This guide explains how each part is derived, and which reference the agent reads for it. The agent loads only what the chosen direction uses ([SKILL.md §4](../../skills/form-and-force/SKILL.md#4-derive-the-language)).

## Composition

[composition.md](../../skills/form-and-force/references/composition.md)

- **Seven forces.** A frame is a field of forces: scale, weight, position, direction, interval, edge and depth. Every strong layout pushes at least two far from neutral. A layout that leaves all seven neutral is a template, whatever fills it. The forces are also the vocabulary for critique: "scale and position are both neutral" is usable; "the hero feels weak" is not.
- **Three reads.** The glance (one shape that survives a blur), the scan (two to four anchors, in a decided order), the read. Most weak frames have a strong third read, a vague second and no first.
- **The structures.** Each dealt structure (*spine*, *monolith*, *index*, *strata*, *overlap*, *perimeter*…) comes with what makes it work and how to build it in CSS. Its decisions are written down as numbers (the ratio, the line, the crop) before building, because unstated decisions default to neutral.
- **The flatplan.** The page is a sequence of scenes with a peak, planned like a magazine's flatplan, not a stack of interchangeable sections.
- **The narrow screen is a second composition**, not the wide one shrunk.

## Typography

[typography.md](../../skills/form-and-force/references/typography.md)

- **A voice before a typeface.** The voice is decided from the subject; the typeface is chosen to speak it.
- **A system small enough to recite.** Roles before sizes (display, title, heading, body, note, label, data), each with one size and weight per range. Five or six sizes far apart beat ten that blur.
- **Scale contrast is decided.** The ratio between the largest type on the first screen and the body size is the most telling number on a page. Under about three, type is labelling, not composing.
- **One loud axis** of hierarchy (size, weight, colour or position), not all four at every level.
- **Craft:** display tracking and leading, measure and rag for text, variable axes as material, type as image and as interaction, loading, fallbacks and licences.

## Colour, material and imagery

[colour-and-imagery.md](../../skills/form-and-force/references/colour-and-imagery.md)

- **A strategy before a palette.** Monochrome, ground-led, signal, two inks, coded, sampled, scene by scene, one light or full chroma, each with its traps. The strategy is written with its proportions ("93 % ground, 6 % ink, 1 % red, and red only marks live data"), because the proportion is the strategy.
- **Where colour comes from**, in order: owned equity, the subject's material (sampled and recorded), function, process, light and place. Never from the category ("finance is blue") or from what looks expensive this year.
- **Material and light:** radius, elevation and line weight are material decisions, not defaults.
- **Choosing the medium**, art-directing photographs, image treatments as a system, and what to do **when there are no assets**, which is the usual case.

## Visuals made in code

[creative-coding.md](../../skills/form-and-force/references/creative-coding.md), only when the direction dealt or chose a coded medium.

The lowest tool that carries the idea: SVG drawings and patterns, Canvas 2D, fragment shaders without a library, three.js or React Three Fiber, product scenes, scroll-linked scenes and pointer systems. Each comes with its rule from the subject, its lifecycle and cleanup, its budget, its fallback and its accessible equivalent.

## The design system

[component-architecture.md](../../skills/form-and-force/references/component-architecture.md) · [component-spec.md](../../skills/form-and-force/assets/component-spec.md)

- **Tokens in three tiers:** primitives measured from the key frame, roles that components reference, and component tokens only where one component needs a dial. Every value records what it was derived from. The reference deliberately carries no example values: a token block copied from documentation is a house style.
- **Tokens encode the device.** Projects do not share a roundness, a shadow, a spacing scale or a palette structure.
- **Component contracts:** a state inventory and a typed contract per component, written with the spec template before building.
- **For a design system project**, the key frame is a specimen page that uses the system to document itself.

## Motion

Motion is derived the same way, from one decision about character. It has its own guide: [motion](motion.md).

## The flow of the experience

[experience-flow.md](../../skills/form-and-force/references/experience-flow.md)

The journey, what each section answers, how sections hand over to each other, functional interaction design and state inventories (loading, empty, error, success, disabled, long text) for every view.

## Checking the language against the frame

Two questions keep a design language honest while it is being built:

1. **Does each decision cite the frame or a fact?** A value nobody can trace is a default.
2. **Does the device survive past the first screen?** A device that shapes only the hero is a hero treatment. The jury checks this from the flatplan.
