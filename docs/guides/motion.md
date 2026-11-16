# Motion

Motion in Form & Force is engineered, not added. It starts with whether something should move at all, takes every value from one decision about character, and is checked frame by frame before anyone trusts it. The agent reads [motion-direction.md](../../skills/form-and-force/references/motion-direction.md) for the decisions and [motion-craft.md](../../skills/form-and-force/references/motion-craft.md) for the implementation.

## Every movement has a job

Every animation is one of five kinds. If it is none of them, it is cut.

| Kind | It exists to |
|---|---|
| **Feedback** | Confirm that the interface heard the person: press, toggle, drag, validation |
| **Continuity** | Show where something came from or went, or that two states are the same thing |
| **Explanation** | Demonstrate how something works |
| **Identity** | Make the project's character felt: arrivals, the signature moment |
| **Narrative** | Carry a story through time or scroll |

## The gate: should this move at all

Four questions, in order. The gate is meant to say no.

1. **How often is it seen?** Hundreds of times a day (shortcuts, command palettes, core navigation in a tool): no animation. Tens of times: none, or barely perceptible. Occasionally: yes, within budget. Rarely or once: this is where generosity is allowed.
2. **Which of the five kinds is it?** If the honest answer is "it looks good", stop.
3. **Does motion help what the person is doing here?** Data being read and text being typed should not move for style.
4. **Can it stay inside the time the moment allows?** If it only works slowly, it does not work.

What was rejected is recorded. The list of things that deliberately do not move is part of the design.

## Layers and the register

The register decides which motion layers exist at all.

| Layer | Quiet | Composed | Expressive | Radical |
|---|---|---|---|---|
| **Feedback** | Yes: the main craft | Yes | Yes | Yes |
| **Continuity** | Yes, fast | Yes | Yes | Yes |
| **Arrival** | No, or one beat | One composed entrance | Per scene, varied | Part of the world |
| **Signature** | None, or a micro-moment | One | One or two | The mechanic itself |
| **Narrative** | No | Rarely | Where there is a story | Yes |

One loud thing at a time. Nothing moves merely because the page scrolled. Content is complete with every layer switched off.

## Character, and generated tokens

A project's motion should be recognisable with the content removed. That comes from character, decided once, in four effort factors (a working vocabulary borrowed from Laban movement analysis): **weight** (light to strong), **time** (sudden to sustained), **space** (direct to indirect) and **flow** (bound to free). Three of them combine into eight actions:

| | Direct | Indirect |
|---|---|---|
| **Light, sudden** | Dab | Flick |
| **Light, sustained** | Glide | Float |
| **Strong, sudden** | Punch | Slash |
| **Strong, sustained** | Press | Wring |

The character is chosen from the subject, with a reason: how its material behaves, how its work is done. "Smooth" is not a character. The values are then generated, not written by hand and not reused:

```bash
node scripts/motion_tokens.mjs --action glide --flow bound
node scripts/motion_tokens.mjs --weight 0.7 --time 0.3 --space 0.2 --flow 0.6 --json
```

The output is durations by job, easing curves for entering, moving and exiting, a spring (as a CSS `linear()` curve and as library settings), travel distances, a stagger with shrinking gaps, a reduced-motion block, and what is out of character. Bound characters never overshoot. Every value stays inside bands the tests check. To change the feel, change the character and regenerate.

## The life of one interaction

Weak motion defines the middle and neglects the ends. For anything above a simple hover, the agent decides the whole life: rest, trigger, response within 100 ms, timing, easing, origin, continuity, **interruption** (it must retarget from where it is, without a jump or a wait), **reversal** (usually faster), completion, the reduced version, and the same result by touch, keyboard and assistive technology. Physical truths apply: respond on press, not release; nothing starts from zero size; things return where they came from.

Sequences of two or more movers are cast and timed in a **motion score** ([template](../reference/templates.md#motion-score)) before they are coded.

## Scroll, transitions and the signature moment

Scroll is directed, not decorated: scrubbed scenes explain a mechanism, pins are short, and every state is reachable and readable without script. View transitions keep their bearings. Each project has at most one or two signature moments, and the register decides whether it has any. The implementation recipes (CSS transitions, the Web Animations API, View Transitions and FLIP, ScrollTrigger, springs and gestures) and the lifecycles of GSAP, Motion and Lenis, with cleanup, are in [motion-craft.md](../../skills/form-and-force/references/motion-craft.md).

## Reduced motion is a designed version

`prefers-reduced-motion: reduce` asks for less movement, not a broken page. Travel and scale become a short cross-fade; a scrubbed scene becomes its key states as stills; a staggered arrival becomes everything present at once; autoplay becomes a poster with a play control. Content and controls are identical in both versions. Anything that moves for more than five seconds can be paused, and nothing flashes more than three times a second.

## See it before you trust it

Motion written from imagination is usually wrong in ways that are obvious when it is seen slowly. The motion strip plays a moment ten times slower and lays the frames out as a filmstrip, with an inventory of what really animated:

```bash
node scripts/motion_strip.mjs <url> --trigger load --reduced                         # the entrance, and its reduced version
node scripts/motion_strip.mjs <url> --trigger "click:#menu" --interrupt 120          # interrupted mid-flight
node scripts/motion_strip.mjs <url> --trigger "click:#menu" --exit key:Escape         # the way in and the way back
node scripts/motion_strip.mjs <url> --trigger scroll:0-2400                          # a scroll scene as stills
```

Spacing between frames is the easing. Order and overlap are the choreography. Frames after the interruption show whether it retargeted. The layout-shift figure should be zero. At `--viewport 390x844` the page is treated as a touch device, so anything that only happened on hover will not happen.

A strip cannot show how it feels at speed, under a thumb, or on the fiftieth use. The report says which of those a person checked on a device.

## For the agent

[motion-direction.md](../../skills/form-and-force/references/motion-direction.md) · [motion-craft.md](../../skills/form-and-force/references/motion-craft.md) · [motion-score.md](../../skills/form-and-force/assets/motion-score.md) · [performance-engineering.md §7](../../skills/form-and-force/references/performance-engineering.md#7-motion-and-rendering-cost)
