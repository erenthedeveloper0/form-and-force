# The creative method: why it replaced the concept engine

Version 0.1.0 produced work that was coherent, stable and free of the obvious defaults, and still predictable. This note records the diagnosis, what the 0.2.0 method does about it, where each idea came from, and what remains unproven. It separates three kinds of statement: **verified** (read in a source or measured here), **observed** (seen in the old skill's own design or output), and **reasoned** (a design decision that follows from the first two and has not been tested).

## Diagnosis of 0.1.0

| # | Cause | Kind | Evidence |
|---|---|---|---|
| 1 | **The model chose its own divergence.** "Generate three territories that differ in structure" asks the system that produces the typical answer to produce three untypical ones. It returns the three most typical alternatives. | Reasoned from verified sources | Typicality bias and mode collapse ([ledger](RESEARCH_LEDGER.md) H1); narrower collective output with AI ideas (H2) |
| 2 | **Directions were chosen in prose.** Territories were written, scored and chosen before anything was drawn. Three paragraphs can differ while the three pages they produce do not. | Observed | The 0.1.0 workflow had no rendered artefact before the build |
| 3 | **Scoring rewarded defensibility.** Five criteria, one of them originality, added up. The safest idea scores well on four. | Observed | The 0.1.0 scoring table |
| 4 | **Avoidance lists were close to the source of ideas.** The first-instinct log checked ideas against lists of defaults. A list of things to avoid yields the nearest thing not on it, which the old research had already named as the second-order default. | Observed, and predicted by the old taxonomy | [ANTI_SLOP_TAXONOMY.md](ANTI_SLOP_TAXONOMY.md) R7 |
| 5 | **The skill's own examples were a house style.** Its references carried example tokens, palettes and component names. Examples get copied, including their incidental features. | Reasoned from a source read second-hand | Design fixation (H3) |
| 6 | **Composition, typography and imagery were one file about implementation.** There was no vocabulary for what a frame is doing, and nothing for the usual case of having no photographs. | Observed | `visual-implementation.md` in 0.1.0 |
| 7 | **Motion had a method and no character.** Every project drew on the same illustrative curves and durations. | Observed | The 0.1.0 token example |
| 8 | **The builder judged itself, with a weighted score.** The scorecard borrowed award weightings and produced a number. A model favours its own output, and a number invites being raised. | Reasoned from a verified source | Self-preference in evaluators (H4) |
| 9 | **One bar for every project.** The same originality tests applied to a public-service form and a campaign site, so restraint could not be told from timidity. | Observed | The eight tests in 0.1.0 |
| 10 | **Evidence was collected for auditing, not for looking.** The rendered audit measured the floor (focus, overflow, contrast candidates). Nothing showed the first screen as a jury would see it, or the page as a sequence. | Observed | `audit_page.mjs` in 0.1.0 |

## What 0.2.0 does about each

| Cause | Mechanism | Where |
|---|---|---|
| 1 | The lens, the structure and the lead medium of each frame are dealt at random from a deck, never two from one family in a hand, away from the last two hands, limited to material the project has. The agent answers the cards. It does not pick them. | `deal.mjs`, `deck.json`, `direction.md` §5 |
| 2 | Each direction is sketched as a rough standalone frame, wide and narrow, and the frames are put on one board with blurred thumbnails and a measure of whether they really differ. The choice is made from the image. | `sketch_board.mjs`, `direction.md` §8 |
| 3 | No score. A device passes or fails four tests, frames are chosen by looking, and the built work is compared with the twin. | `direction.md` §4, §7 |
| 4 | Decisions cite facts mined from the subject. Lists of defaults are run over finished work only, and the registry includes the skill's own attractor. | `direction.md` §2, `floor.md` §1, §6, §7 |
| 5 | The deck holds questions and structural principles and no colours, typefaces or sizes (a test enforces it). Token examples carry placeholders. The dealer prints what recent projects committed to, as taken. | `deck.json`, `component-architecture.md` §3, `tests/test_creative_method.py` |
| 6 | Separate references for composition (seven forces, the flatplan, the narrow screen as a second composition), typography (voice before typeface, type as image and as interaction), and colour and imagery (strategy with proportions, choosing a medium, working with no assets). | `composition.md`, `typography.md`, `colour-and-imagery.md`, `creative-coding.md` |
| 7 | Motion character is one decision in four factors. Durations, curves, a spring, travel and stagger are generated from it and stay inside bands. A filmstrip shows what actually happened. | `motion-direction.md` §4, `motion_tokens.mjs`, `motion_strip.mjs` |
| 8 | The jury looks at rendered evidence before the rationale, in a fresh context when one exists, marks ten dimensions in words with evidence, and can return the work to the system or to the hand. Hard gates are settled separately and are never traded. | `jury.md`, `floor.md` §2, `skills/form-and-force/assets/jury-brief.md` |
| 9 | A register (Quiet, Composed, Expressive, Radical) is set from the brief before design. It defines what bold means, which dimensions must be strong, and what timid and overwrought look like. | `direction.md` §3, `jury.md` §7, `project-modes.md` |
| 10 | The audit now also writes the first screen at every width with a blurred copy, a flatplan of every screen in order, and design facts phrased as questions. | `audit_page.mjs`, `design_facts.mjs` |

## What was learned from the two reference projects, and what was left

**Taste** (H6). Learned: variety has to be forced from outside the model's own preference, by a script that deals and remembers; and a finish gate should count rounds and end. Left behind: its deck deals finished heroes, and its palettes, type pairings and page plans are libraries keyed by kind of business. That gives varied output from a fixed vocabulary of looks. Form & Force deals questions and structural principles instead, so the look has to come from the subject. Nothing from its libraries, rules or wording was copied.

**Emil Kowalski's skills** (H7). Learned: the order of decisions for one animation (frequency before purpose, then tool, properties, curve, interruption, exit); the physical truths (respond on press, come from somewhere, never from nothing, keep velocity, exits shorter); casting movers and relating pairs; reporting what was rejected. Left behind: fixed house values. His curves and durations are his. Here they became bands, and each project's tokens are derived from its own character. Nothing was copied; the recipes in `motion-craft.md` are written against this project's tokens.

## What is not proven

1. **That the method improves outcomes.** No model evaluation has been run on 0.2.0. The eval suite's cases are written and structure-checked only ([docs/testing.md](../docs/testing.md)). Until it runs, every "does about" row above is a design argument.
2. **That dealing beats choosing for design.** H1 and H2 are about text. The transfer is reasoned.
3. **That a fresh context is a fair judge.** It removes the builder's rationale. It is still the same model family (H4).
4. **The motion mapping.** The route from four factors to milliseconds and curves is this project's invention. It is tested for consistency (bands, ordering, no duplicate characters), not for whether a "glide" feels like one.
5. **The instrument.** See [INSTRUMENT_CALIBRATION.md](INSTRUMENT_CALIBRATION.md): it is blind to a template with a photograph in it.
6. **The method's own attractor.** A deck is a vocabulary too. `floor.md` §7 lists the drift already expected (the subject's artefact as a skin, the giant number, editorial-utilitarian styling) so that it can be caught, and the history file exists to make repetition visible.
