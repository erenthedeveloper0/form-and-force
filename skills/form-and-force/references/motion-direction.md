# Motion direction: deciding what moves, how, and why

Motion is a language with a small vocabulary and strict grammar. This file is the decision method: whether something moves at all, what character the project's motion has, how one interaction is designed across its whole life, how several elements are choreographed, and how scroll is directed. Values and code are in [motion-craft.md](motion-craft.md).

## Contents
1. Five kinds of motion
2. The gate: should this move at all
3. Motion layers and the register
4. Character: one decision that sets every value
5. The life of one interaction
6. Choreography: cast, relate, score
7. Directing scroll
8. The signature moment
9. Transitions between views
10. Knowing when to stop
11. Reduced motion is a designed version
12. See it before you trust it

---

## 1. Five kinds of motion

Every animation is one of these. Name which, or do not build it.

| Kind | It exists to | Typical |
|---|---|---|
| **Feedback** | Confirm that the interface heard the person | Press, toggle, drag, validation |
| **Continuity** | Show where something came from, went to, or how two states are the same thing | Panels from their trigger, shared elements, reordering |
| **Explanation** | Demonstrate how something works | A mechanism playing out, a diagram building |
| **Identity** | Make the project's character felt | The way things arrive, the signature moment |
| **Narrative** | Carry a story through time or scroll | Scenes, reveals in an order that argues |

And a sixth that is not a kind: **unnecessary**. Motion with none of the five jobs is cut, however good it looks in isolation. Most pages improve when a third of their animation is removed.

## 2. The gate: should this move at all

Run every candidate through four questions, in order. The gate is meant to say no. "It should not animate" is a design decision and a correct result.

**1. How often is it seen?**

| Frequency | Decision |
|---|---|
| Hundreds of times a day (keyboard shortcuts, command palettes, core navigation in a tool) | No animation |
| Tens of times a day (hover, list navigation, frequent toggles) | None, or barely perceptible: fast and small |
| Occasionally (dialogs, drawers, toasts, a page's first screen) | Yes, within budget |
| Rarely or once (onboarding, success, a launch page, a story) | This is where generosity and delight are allowed |

Anything triggered from the keyboard in a tool is in the first row. People who use shortcuts are asking for speed.

**2. Which of the five kinds is it?** One word. If the honest answer is "it looks good", stop.

**3. Does motion help what the person is doing here?** Data being read, text being typed, a number being compared: these should not move for style. The same effect that suits a launch page harms a working screen.

**4. Can it stay inside the time the moment allows?** If it only works slow, it does not work.

Record what was rejected and why. The list of things that deliberately do not move is part of the motion design.

## 3. Motion layers and the register

Decide the structure of motion for the whole project before any single animation. There are five possible layers. The register says which exist.

| Layer | What it is | Quiet | Composed | Expressive | Radical |
|---|---|---|---|---|---|
| **Feedback** | Press, focus, toggle, validation, drag | Yes: the main craft | Yes | Yes | Yes |
| **Continuity** | State and view changes that keep their bearings | Yes, fast | Yes | Yes | Yes |
| **Arrival** | How a view or scene first appears | No, or one beat | One composed entrance | Per scene, varied | Part of the world |
| **Signature** | The one moment only this project has | None, or a micro-moment | One | One or two | The mechanic itself |
| **Narrative** | Scroll-directed or timed sequences | No | Rarely | Yes, where there is a story | Yes |

Rules that hold in every register:
- One loud thing at a time. Layers never compete.
- Nothing moves merely because the page scrolled. Scroll-triggered motion belongs to the Arrival or Narrative layer and is designed as such. A fade-up on every block is neither.
- Content is complete and readable with every layer switched off.
- Input is never blocked by decoration.

Write the layers in use, and what each contains, in the motion score ([assets/motion-score.md](../assets/motion-score.md)).

## 4. Character: one decision that sets every value

A project's motion should be recognisable with the content removed. That comes from character, and character is decided once.

Describe how things move here with four effort factors (a vocabulary borrowed from Laban's movement analysis):

| Factor | From | To | Ask of the subject |
|---|---|---|---|
| **Weight** | Light | Strong | Does it carry force and mass, or touch lightly? |
| **Time** | Sudden | Sustained | Does it happen at once, or take its time? |
| **Space** | Direct | Indirect | Does it go straight to its place, or travel a path? |
| **Flow** | Bound | Free | Is it contained and exact, or released with follow-through? |

Three of them combine into eight recognisable actions, each of which can be played bound or free:

| | Direct | Indirect |
|---|---|---|
| **Light, sudden** | Dab | Flick |
| **Light, sustained** | Glide | Float |
| **Strong, sudden** | Punch | Slash |
| **Strong, sustained** | Press | Wring |

Choose from the subject, with a reason: how its material behaves, how its work is done, the tone of the position. An exact, quick instrument and a slow, heavy door are both valid; "smooth" is not a character.

Then derive the tokens. Do not write them by hand and do not reuse a previous project's:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/motion_tokens.mjs" --action glide --flow bound
node "${CLAUDE_SKILL_DIR}/scripts/motion_tokens.mjs" --weight 0.7 --time 0.3 --space 0.2 --flow 0.6    # or set the factors directly
```

It prints durations, easing curves, a spring (as a CSS `linear()` curve and as library settings), travel distances, a stagger with shrinking gaps, a reduced-motion block, and what is out of character. Every animation in the project then uses those tokens. To change the feel, change the character and regenerate. Do not adjust single values until the whole thing is running and one value is demonstrably wrong.

Within the character, three things still vary by job: frequent actions take the shortest durations, larger travel takes a little longer, and exits are shorter than entrances.

## 5. The life of one interaction

An interaction is designed across its whole life. Most weak motion defines the middle and neglects the ends. For anything above a simple hover, decide all of these:

| Stage | Decide |
|---|---|
| **Rest** | What the element looks like before, and what in that state says it can be acted on |
| **Trigger** | Exactly which input starts it: pointer down (not up), focus, key, scroll position, data arriving |
| **Response** | What changes within the first 100 ms. Something must, even if the result takes longer |
| **Timing** | Duration from the tokens, by job |
| **Easing** | The enter curve for arrivals and responses, the move curve for travel on screen, the spring for anything the person throws or can catch |
| **Origin** | Where it grows or travels from: its trigger, its previous position, the pointer. Never the centre by default. Never from nothing. |
| **Continuity** | What stays constant so the eye can follow: a shared element, a direction, a surface |
| **Interruption** | What happens if the person acts again mid-flight. It must retarget from where it is now, without a jump and without waiting |
| **Reversal** | The way back. It retraces the path, usually faster |
| **Completion** | The resting state, where focus is, what is announced to assistive technology, and that nothing is left running |
| **Reduced motion** | The designed alternative (§11) |
| **Other inputs** | The same result by touch, keyboard and assistive technology |

Physical truths that make motion feel right:
- Respond on the press, not on the release.
- Things come from somewhere and return there.
- Nothing starts from zero size.
- Slow where the person is deciding, fast where the system is answering. A hold-to-confirm fills slowly and releases at once.
- What the person is dragging stays under their finger, keeps its velocity when released, and resists softly at a boundary instead of stopping dead.
- A moving thing that is grabbed changes course from its current position and speed.

## 6. Choreography: cast, relate, score

When two or more things move in answer to one event, they are one piece of motion. Design the relationships, not the parts. The usual error is addition: every child gets a delay, and the person waits for the interface to finish performing.

**Cast.** List every element that would move and give each a role.

| Role | What it is | Treatment |
|---|---|---|
| **Lead** | The one thing that must be noticed | Moves first, travels furthest, holds longest |
| **Support** | What follows the lead | Smaller, shorter, slightly later |
| **Decoration** | Marks, rules, badges, grounds | Fades in place, or does nothing |
| **Still** | Everything else, including containers whose content moves | Does not move |

If two elements both insist on being the lead, the layout has a hierarchy problem, and motion cannot fix it. Casting usually removes half the movers.

**Relate.** Each pair of movers has one of four relationships.

| Relationship | Use when | Looks like |
|---|---|---|
| **Together** | They are one object or one moment, or order would add no meaning | Same start, same timing family |
| **Overlap** | Order matters and they can be seen at once | The second starts while the first is still moving: a wave |
| **Sequence** | Showing both at once would be wrong: two dense states, one passing through another, cause then effect | The second starts as the first lands, with a slight overlap at the handoff |
| **Carry** | The parts cannot be controlled singly, or should read as a group | Move the parent; the children come along |

Rules:
- **One arrival per container.** If the panel arrives, its contents are already in it.
- **No stagger on things seen often.** Menus, lists and tabs in a tool appear at once.
- **No uniform stagger.** Equal delays and equal travel read as a metronome. Lead first and furthest; gaps that shrink (the tokens give the series); decoration in place.
- **Order by importance,** which is usually but not always reading order. Direction follows cause: outward from where the person acted.
- **Support hooks onto the lead's moments** (its start, its landing, its settle), not onto a delay that happens to look right.
- **Scale duration to distance.** A container that grows a little should not take as long as one that grows a lot.
- **Direction means something.** Forward and back are opposite directions. Deeper goes in; closing comes out the way it opened.
- **Exits are shorter, simpler and simultaneous.** The person has decided to leave.
- **Parts of one object share a timing family,** or it reads as two objects.

**Score.** Write the timeline before the code, in the motion score:

| Element | Role | Starts | Lasts | Motion | Relation |
|---|---|---|---|---|---|

Then list what was cast as still, and why. Then test interruption: trigger it twice quickly, reverse it halfway, leave and return.

## 7. Directing scroll

Scroll is the visitor's hand on the timeline. Direct it like a film whose viewer controls the speed.

Think in shots:

| Shot | What happens | Use for |
|---|---|---|
| **Cut** | The scene changes outright: a new ground, a new composition | A change of subject. The strongest transition, and it costs nothing |
| **Hold** | The frame stays while one thing changes | A point that needs a moment; the Stage structure |
| **Travel** | The page moves and nothing else does | Reading. Most of any page |
| **Reveal** | Something is uncovered by the scroll itself | An arrival that belongs to the narrative |
| **Scrub** | A state is tied continuously to scroll position | Explaining a mechanism or transformation the visitor should control |
| **Follow** | One element stays with the visitor across several scenes | A constant: the object, the index, the argument's thread |

Direction:
- **Write the beats first:** what the visitor should understand at each point, in order. Then choose a shot for each. Most beats are Travel or Cut.
- **Vary the rhythm.** Hold, then release. A page that is all holds is a trap; a page with none has no emphasis.
- **Text leads, picture follows.** The visual state always matches the text on screen.
- **Scrub only what benefits from the visitor's control.** If it is just an entrance, let it play once and get out of the way.
- **Keep holds short,** show progress during them, and give phones a shorter version.

Safeguards, without exception:
- The page scrolls natively. Smoothing libraries need a stated reason (keeping a canvas in step, a narrative where inertia is the concept), must respect reduced motion, and must leave nested scrollers alone.
- Never take control of scroll speed or position. Never make navigation wait for an animation.
- Keyboard scrolling, anchors, find-in-page, back and forward all behave normally. A deep link lands on the right state.
- All content exists in the document in order and is readable if the script never runs.

## 8. The signature moment

One moment that only this project could have. It is the device ([direction.md](direction.md)) made to move or respond.

Derive it from the device, never from a catalogue of effects. Ask what the device's rule does when it is touched, scrolled or given time. The answer is often small: a number that keeps real time, a line that draws itself to the true length, a structure that reorders by the visitor's own choice.

Specify:
- **Why it belongs:** the fact and the device it comes from.
- **Discovery:** how someone finds it without instructions.
- **What they understand afterwards** that they did not before.
- **Aftermath:** what it hands on to. It must not be a dead end.
- **Fallbacks:** touch, keyboard, reduced motion, no script, a slow device.

One per experience in most registers. A second only if it is a different kind of moment. Many unrelated effects simulate creativity and destroy hierarchy.

## 9. Transitions between views

A view change should say how the two views are related.

| Relation | Transition |
|---|---|
| The same thing, expanded | A shared element grows into its detail view |
| Deeper or shallower in a hierarchy | Directional: in for deeper, out for back |
| Siblings | A quick cross-fade or a lateral move in the direction of the order |
| Unrelated | A cut. Do not invent a relation |
| A change of world (Radical) | A designed scene change that belongs to the concept |

- Back does not replay an intro. A deep link shows the final state at once. Scroll position is restored.
- Loaders and gates need a real reason (assets that must stream, consent for sound, a ritual that is the concept), real progress or an honest indeterminate state, a skip, and a keyboard path. Never invent a percentage.
- Implementation with View Transitions and its fallbacks is in [motion-craft.md](motion-craft.md).

## 10. Knowing when to stop

Stop adding when any of these is true:
- Every remaining candidate fails the gate.
- Two things are loud at once.
- Removing an animation makes nothing worse. Then remove it.
- You would skip it the fiftieth time you saw it.
- The page takes longer to become usable than it would without motion.

When motion feels wrong, fix it in this order, and stop at the first step that works:

1. Delete it.
2. Reduce it: shorter, smaller, fewer properties.
3. Fix the curve.
4. Fix the origin and the starting state.
5. Make it interruptible.
6. Move it to transform, opacity or clip-path.
7. Make timing asymmetric where a person decides and the system answers.
8. Only then refine: a blur to bridge a cross-fade, a better stagger, a spring where something should feel alive.

A precisely engineered 150 ms response is worth more than a long sequence. In the Quiet register it is the whole of the motion design, and it can be exceptional.

## 11. Reduced motion is a designed version

`prefers-reduced-motion: reduce` asks for less movement. It does not ask for a broken page. Design this version; do not just switch things off.

| Full motion | Reduced version |
|---|---|
| Travel, scale, rotation, parallax | A short cross-fade or an instant change |
| A scrubbed or held scene | Its key states as stills, in order, with their text |
| A staggered arrival | Everything present at once |
| A spring or overshoot | The same change without overshoot |
| Autoplaying film or loop | A poster with a play control |
| Smooth scrolling | Native scrolling |
| Small feedback (colour, opacity, a tiny scale) | May stay |

- Offer a visible motion toggle on motion-heavy experiences, remembered for the visitor.
- Anything that moves for more than five seconds on its own can be paused. Nothing flashes more than three times a second.
- Content and controls are identical in both versions.

## 12. See it before you trust it

Motion written from imagination is usually wrong in ways that are obvious the moment it is seen slowly.

```bash
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger load                     # the entrance
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger "click:#menu" --interrupt 120 --reduced
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger "click:#menu" --exit key:Escape       # the way in, then the way back
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger scroll:0-2400               # a scroll scene as stills
```

The strip plays the moment ten times slower and lays the frames side by side, with an inventory of what really animated and questions about it. In the strip, check:
- **Spacing between frames** is the easing. Even spacing is linear. Big gaps first is a responsive start.
- **Order and overlap** are the choreography. A wave or a queue.
- **The first frame after the trigger** shows whether anything responded at once.
- **Frames after the interruption mark** show whether it retargeted or jumped.
- **Frames after "at rest"** are the way back. It should retrace the path and take less time than the way in.
- **The layout-shift figure** should be zero unless making room is the point.
- **The reduced strip** shows whether content survived.
- **At a narrow width** (`--viewport 390x844`) the page is treated as a touch device: anything that only happened on hover will not happen.

A strip cannot show how it feels at speed, under a thumb, or on the fiftieth use. Say in the report which of those were checked by a person on a device, and which were not.
