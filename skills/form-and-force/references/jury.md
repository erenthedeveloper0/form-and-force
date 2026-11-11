# The jury: judging the rendered work

A critique system that looks at what was actually built, measures it against the register it was aiming for, and is able to reject the idea as well as the execution. Passing every check is not the bar. The bar is whether the work is good.

## Contents
1. Rules of the jury
2. The evidence pack
3. Who judges
4. The cold read
5. The twin test
6. Ten dimensions
7. What each register demands
8. Reading the design facts
9. Writing a finding
10. Verdicts and the loop
11. Timid and overwrought
12. The jury report
13. Honesty

---

## 1. Rules of the jury

1. **Pictures before words.** The jury sees the rendered page before it sees the rationale. A real jury never reads your rationale.
2. **Evidence or it did not happen.** Every judgement points at something in the evidence pack: a place on an image, a measured fact, a frame in a strip.
3. **Judged against the register.** The same page can be excellent as Quiet and timid as Expressive. The register was set before design began ([direction.md](direction.md) §3) and it is the yardstick.
4. **Ideas can fail.** The jury can send the work back to the device or to the hand. A well-made weak idea is still a weak idea.
5. **The floor is separate.** Hard gates ([floor.md](floor.md)) are pass or fail and are settled before the jury sits. The jury does not trade accessibility for beauty or the reverse.
6. **It ends.** Rounds are limited. What remains open is reported, never hidden.

## 2. The evidence pack

Gather it before judging. Do not judge from memory of the code.

```bash
node "${CLAUDE_SKILL_DIR}/scripts/audit_page.mjs" <url> [more routes] --viewports 390x844,768x1024,1440x900
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger load --reduced
node "${CLAUDE_SKILL_DIR}/scripts/motion_strip.mjs" <url> --trigger "<the signature interaction>" --interrupt 120
```

| Evidence | From | Shows |
|---|---|---|
| `first.jpg` | audit | The first screen at every width, and a blurred copy for the squint |
| `flatplan.jpg` | audit | Every screen of the page in order: the pacing |
| `sheet.jpg` | audit | Scroll detail per width and the reduced-motion frame |
| Design facts and questions | audit summary, `report.json` | Scale, type economy, alignment, pacing, repetition, balance, colour, layering, media, declared motion |
| `strip.jpg` and its inventory | motion strip | What moves, in what order, on what curve, and what happens when interrupted |
| Floor results | `slop_scan`, audit flags, build and tests | Gates passed or not |
| The direction brief | written at commitment | Register, position, device, what it forbids, the twin. Read last. |

For an existing site, the same pack captured before the work is the baseline.

## 3. Who judges

The agent that built the page will find it convincing. Reduce that as far as the environment allows.

- **A fresh context, when one is available** (a subagent, a second session, or the user). Give it only the evidence pack and the jury brief ([assets/jury-brief.md](../assets/jury-brief.md)). Do not give it the rationale until its cold read is written. Use this for XL work, and for L work when the direction is new.
- **Otherwise, a cold read by you**, with the discipline in §4: write the first impression from the images before re-opening the brief, and do not edit it afterwards.
- **The user** is the best juror. When they are available, show `first.jpg` and `flatplan.jpg` with your own verdict, and ask what they see first.

Whoever judges, the builder does not argue with a finding. A finding is answered by changing the work or by evidence that the finding misread it.

## 4. The cold read

Open `first.jpg`. Look for about five seconds. Then, without opening the brief, write short answers:

1. **What is this?** Sector, kind of organisation, what it offers.
2. **What is its attitude?** Three words you would stake something on.
3. **What is the one thing you will remember?** If the answer is "nothing in particular", write that.
4. **In the blurred copy, what shape is left?**
5. **What would you guess the next screen is?**

Then open `flatplan.jpg` and add:

6. **Where is the peak?** Which screen is the most intense.
7. **Which screens could be swapped without anyone noticing?**
8. **Does the phone column look composed, or stacked?**

Only now read the direction brief and compare. Each gap between what was intended and what was seen is a finding. An attitude nobody could have guessed from the picture is not in the picture. An unmemorable first screen is a concept-level finding, however polished it is.

## 5. The twin test

The twin is the page any competent agent would have made from this brief, written down before design began ([direction.md](direction.md) §4).

List what the built page does that the twin does not. Count only differences that can be seen in the evidence and that come from the device.

| Outcome | Meaning |
|---|---|
| Structural differences across the page (what the page is organised as, how scale and medium are used, how it behaves) | The direction held |
| Differences on the first screen only | The device was a hero treatment. The system was not derived from it |
| Differences of finish only (spacing, palette, nicer type) | This is the twin, well made. In Composed and above that is a failure of direction |
| The twin would serve the visitor better | The device is costing more than it gives. Overwrought |

Swap in a competitor's name and logo as a second check. If the page still fits, the differences are not about this subject.

## 6. Ten dimensions

Mark each dimension **weak**, **competent**, **strong** or **exceptional**, with one line of evidence. "Competent" means nothing is wrong and nothing is notable. It is the mark the twin would get.

| # | Dimension | The question | Look at |
|---|---|---|---|
| 1 | **Creative identity** | Does it have a visual language of its own that a stranger could describe? | Cold read 2–4; the blurred first screen |
| 2 | **Concept** | Is there an idea, specific to this subject, that organises the work? | Twin test; the device visible beyond the first screen |
| 3 | **Composition** | Are the frames directed, with forces pushed on purpose, and is the page paced? | `first.jpg`, `flatplan.jpg`; facts on scale, alignment, pacing, repetition |
| 4 | **Typography** | Does type carry voice and structure, and is it set with care? | Type facts; display tracking and leading; line breaks; the system's size |
| 5 | **Coherence** | Do colour, type, image, layout and motion all follow from the one device? | Screens side by side in `flatplan.jpg`; one rule or several |
| 6 | **Interaction** | Are interactions clear, real, and right for this content? | A walk through the main journey by touch and by keyboard; every control does something |
| 7 | **Motion** | Does each movement have a job, a character and good manners under interruption? | `strip.jpg`, the inventory and its questions; the list of things that do not move |
| 8 | **Craft** | Are the details exact at every state and width? | `sheet.jpg`; alignment, edges, states, focus, empty and error states, the narrow screen |
| 9 | **Usability** | Can a first-time visitor do what they came to do, quickly, on a phone? | The journey walk; orientation; the reduced-motion frame |
| 10 | **Technical quality** | Is it accessible, responsive, fast and maintainable? | Floor results; audit flags; LCP and CLS; the code review |

Dimensions 1 to 5 are about direction. 6 to 8 are about execution. 9 and 10 are obligations.

## 7. What each register demands

The register decides which dimensions must reach **strong** for the work to pass, and what strength looks like there.

| Register | Must be strong | Strength looks like | Enough at competent |
|---|---|---|---|
| **Quiet** | Usability, Technical, Craft, Typography, Interaction | One rule held everywhere; a type system you could recite; states and feedback that are plainly considered; language that is exact | Identity and Concept need a single clear conviction, not spectacle. Motion: feedback only, and excellent |
| **Composed** | Concept, Composition, Typography, Craft, Usability, Technical | A device visible from the first screen to the last; real evidence at commanding scale; one peak; conventions kept only where they serve | Motion may be modest if what exists is exact |
| **Expressive** | Identity, Concept, Composition, Typography, Coherence, Motion, Craft | Scenes that differ; a memorable frame; type and image doing the work; motion with a recognisable character | Usability and Technical still must not be weak. Nothing is traded |
| **Radical** | Identity, Concept, Interaction, Motion, Coherence | A mechanic nobody else has, understood in seconds; a world that holds together | A conventional route to everything exists, and the floor still passes |

Two rules sit above the table:
- **Nothing may be weak.** A weak mark on any dimension blocks, in every register.
- **Exceptional is rare.** If more than two dimensions are marked exceptional, mark them again more slowly.

## 8. Reading the design facts

The audit prints facts and raises questions. A question means a measure sits where unexamined defaults usually sit. It is never a failure by itself, and its absence proves nothing. Answer each question in one line: what the decision was, or that there was none.

The last column comes from running the instrument on 19 reference sites and 11 stock templates. It says how well the question separated the two, and so how much weight an answer deserves.

| Question | In Quiet and Composed | In Expressive and Radical | Trust |
|---|---|---|---|
| `centred` | Often a default. Is the axis the idea? | A finding unless symmetry is the device | High |
| `symmetric-fold` | Judge by eye: composed, or merely centred | The same | High |
| `nothing-to-look-at` | Acceptable if the content is the task | A finding: the asset problem was not faced | High |
| `default-easing`, `one-duration` | A finding: no motion character was chosen | The same | High |
| `scale-contrast` | Acceptable if hierarchy is decisive by another means (position, weight, space). Say which | Usually a finding: type is not composing | Medium: it also fires on strong tools |
| `moulds` | A finding when the cards hold only words | The same, more strongly | Medium |
| `text-collision` | A finding, almost always at the narrow width | A finding unless the layering is composed. Look at the frame | Medium: deliberate layered compositions raise it too |
| `caps-labels` | A finding if the labels carry no information | The same | Medium |
| `measure` | A finding for running text | Ignore for display and for small print | Medium |
| `even-pacing`, `layout-run` | Acceptable for a true series or a reference page | A finding: no peak and no rest | Medium |
| `one-surface` | A finding: no material logic | The same | Medium |
| `thin-fold` | Judge by eye: composed emptiness or unfilled space | The same | Low |
| `flat-sequence` | Right for an index or a feed | A finding only if the image agrees | Low |
| `layout-animation` | An execution finding | The same | Engineering, not direction |
| `transition-all` | An execution finding: name the properties | The same | Engineering only. It fired on 8 of 19 reference sites and on no template |
| `slow-controls` | A finding | Judge by how often the control is used. Common in expressive work | Low for direction |
| `no-feedback` | Instant state changes are a legitimate decision. A finding only if hover, focus, pressed or disabled states are missing | The same | Low |

What the instrument cannot see matters more than what it can:

- **It is blind to the twin when the twin has a picture in it.** A stock template with a photograph in its hero raised no question at all. A stock photograph measures as an image, and a familiar structure measures as structure.
- Type set in images, canvases or SVG is invisible to the type facts. Block detection can miss unusual page structures. Pixel facts and collisions see only the screens that were sampled.
- Two numbers are reported and no longer asked about, because they flagged strong work and missed weak work: the count of type sizes, and the similarity between screens.
- When a fact contradicts what the image plainly shows, trust the image and say so.

An empty list of questions is not a compliment, and a long one is not a verdict. The facts are an aid to looking. They do not rank pages. Only the reads in §4 and §5 judge the work.

## 9. Writing a finding

Every finding has five parts.

| Part | Content |
|---|---|
| **Where** | The image and place, the fact, or the strip frame |
| **Seen** | What is actually there, described plainly |
| **Why it weakens this work** | The effect on this direction, this register, this visitor |
| **Change** | A specific correction that could be carried out |
| **Level** | Concept, system or execution |

Not findings: "make it more premium", "improve the spacing", "add more animation", "feels generic", "needs polish". They name no place, no cause and no change.

The same observation written as a finding:

> **Where:** `flatplan.jpg`, wide row, screens 3 to 6. **Seen:** four consecutive screens are a heading over three equal text cards on the same ground; ink per screen is 0.11, 0.12, 0.11, 0.12. **Why:** the device is "one figure at overwhelming scale", and it disappears after screen 1, so the page reads as the twin with a different first screen. **Change:** carry the device through: give each of these four subjects its own true figure at display scale and reduce the supporting copy to a caption; cut one of the four. **Level:** system.

Rank findings by level first (concept, then system, then execution), and inside a level by how much of the page they affect. Ten execution findings do not outweigh one concept finding.

## 10. Verdicts and the loop

| Verdict | When | Next |
|---|---|---|
| **Ship** | The floor passes, nothing is weak, and every "must be strong" dimension for the register is strong | Report |
| **Refine** | Direction and system hold; execution findings remain | Fix them, regather the affected evidence, judge those dimensions again |
| **Rework** | The device is right, and the system built from it does not carry it (first-screen-only, incoherent, unpaced) | Return to the chosen frame and re-derive composition, type or motion ([direction.md](direction.md) §10) |
| **Redirect** | Cold read and twin test show no idea of its own, or the device costs the visitor more than it gives | Return to the hand: the runner-up frame, or a new deal |

```
floor  →  evidence pack  →  cold read  →  twin test  →  dimensions  →  findings  →  verdict
   ↑                                                                                  │
   └──────────── refine: fix, regather ───────────────────────────────────────────────┤
                 rework: back to the frame ───────────────────────────────────────────┤
                 redirect: back to the hand ──────────────────────────────────────────┘
```

Limits:
- **Rounds:** three for XL, two for L, one for M. A round is a verdict followed by changes.
- **One redirect** per engagement. A second means the facts or the register are wrong: stop and tell the user.
- **No improvement on the same finding after two attempts:** change the approach, or report it open. Do not try a third time with more effort.
- **When rounds run out,** stop. Report the verdict as it stands, the open findings, and what would be needed to close them.
- **If the user says ship,** ship, and report what was open.

Do not lower a mark to end the loop, and do not raise one.

## 11. Timid and overwrought

Both are failures, and most agent-built work fails toward timid. Check both directions, every round.

**Timid** (under the register's floor):
- The cold read finds nothing to remember.
- The twin test finds differences of finish only.
- Every force in the composition is at neutral ([composition.md](composition.md) §1).
- Motion is one fade used everywhere, or none where the register expects a character.
- The rationale is more interesting than the page.

**Overwrought** (past the register's limit):
- Two or more things compete for the first read.
- An effect delays or obscures the task, the price, the text.
- The device needs explaining before the offer is understood.
- Motion cannot be interrupted, or the page is slower to use than the twin would be.
- It is impressive in a recording and tiring in the hand.

Restraint is a strong choice when something is visibly being restrained: a single rule carried with precision, generous space that is composed, one moment allowed to be loud. Restraint with nothing behind it is timid. The difference shows in the cold read.

## 12. The jury report

```
Register: Composed                      Round: 2 of 2
Cold read: "A freight software company; exact, dry, confident. I remember the gate queue drawn to scale."
Twin test: structural (the page is organised as one yard seen from above; the twin is hero, features, proof, pricing)

 1 Identity     strong       first.jpg: the plan view reads at thumbnail size
 2 Concept      strong       the to-scale yard recurs on 5 of 7 screens
 3 Composition  strong       fold scale 9.4×; one peak at screen 4; no layout run above 2
 4 Typography   competent    two working sizes too close (18 and 20 px)
 5 Coherence    strong
 6 Interaction  competent    filter sheet has no result count
 7 Motion       strong       strip: 3 movers, lead first; interruption retargets
 8 Craft        competent    390: caption collides with the rule at screen 5
 9 Usability    strong       demo request completes by keyboard and touch
10 Technical    strong       floor passes; lab LCP 1.9 s; no screen-reader pass

Findings: 0 concept · 0 system · 3 execution (listed below)
Verdict: Refine → fixed in this round → Ship
Open: screen-reader pass not performed; real customer quote pending (slot labelled)
```

The report gives the marks with their evidence, the findings with all five parts, the verdict, and what is open. It never gives a mark without evidence.

## 13. Honesty

- Judge the picture, not the intention. Intention goes in the brief; evidence goes in the mark.
- Look at the images before marking. Never mark from the code.
- If the evidence could not be gathered (no browser, a scene that would not render headless), say which dimensions were judged without it.
- Lab numbers are lab numbers.
- "Not checked" is a valid entry. "Passed" without a check is not.
- A passing floor and a tidy set of facts are not evidence of good design. Only the reads in §4 and §5 are.
