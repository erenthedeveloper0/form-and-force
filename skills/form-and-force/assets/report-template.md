# Handoff report

## Direction
- **Register:** <and the evidence for it>
- **Position:**
- **Device:**
- **The twin it had to beat:** <one line>
- **Chosen frame:** <path> · lens <name> · structure <name> · lead medium <name>
- **What the alternatives would have given:** <one line each>
- **Signature moment:** <or none, and why>

For a fix or a review with no new direction, replace this section with one line saying so.

## What changed
Group by purpose. List meaningful files only.
- Foundations (tokens, global styles, fonts):
- Components (new or changed):
- Pages and routes:
- Motion (character, tokens, sequences; what deliberately does not move):
- Dependencies added, each with its reason, and removed:

## The floor (actual results only)
| Gate or check | Command | Result |
|---|---|---|
| Typecheck | | pass / fail (n errors) / not run (why) |
| Lint | | |
| Tests | | |
| Build | | |
| Static scan, before → after | `slop_scan.mjs . --strict` | C: x→y · B: x→y · A: x→y · coverage: complete / partial / incomplete (files not read) |
| Rendered audit | `audit_page.mjs <urls> --viewports …` | flags raised and resolved; paths to first, flatplan and sheet |
| Motion strips | `motion_strip.mjs <url> --trigger …` | questions raised and the answer to each |
| Keyboard pass, by hand | | done on <routes> / not done |
| Screen reader, by hand | | done with <which> / **not done** |
| Reduced motion, reviewed | | |
| A real device | | |
| Performance budget | | lab LCP and CLS against the budget, with conditions |

Hard gates not passed, each with the reason:

## The jury
```
Register:                               Round:   of
Judged by: a fresh context / the builder, cold / the user
Cold read:
Twin test: structural / first screen only / finish only

 1 Identity
 2 Concept
 3 Composition
 4 Typography
 5 Coherence
 6 Interaction
 7 Motion
 8 Craft
 9 Usability
10 Technical

Findings:   concept ·   system ·   execution
Verdict:
```
Each mark carries one line of evidence. Each finding: where · seen · why it weakens this work · change · level.

Dimensions judged without rendered evidence, if any:

## Open
- Findings left open, and what closing each would take:
- Lab-only numbers (conditions):
- Demo or mocked behaviour:
- Labelled placeholders remaining:

## Needs your decision or input
- Real proof for these slots (quotes, logos, numbers, photographs):
- Typeface licences or recommendations with a cost:
- Legal or consent text to review:
- Other:
