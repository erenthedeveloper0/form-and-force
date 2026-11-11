# Motion score: <project>

The plan for motion, written before the code ([motion-direction.md](../references/motion-direction.md)). Fill only the parts the scope needs: a single fix needs the gate and one life cycle.

## Character
| | |
|---|---|
| **Action and flow** | <dab / flick / glide / float / punch / slash / press / wring> · <bound / free> |
| **Why, from the subject** | <how its material behaves, how its work is done, the tone of the position> |
| **Tokens** | `motion_tokens.mjs --action <action> --flow <flow>` → <where the output lives> |
| **Out of character** | <what the generator printed as never> |

## Layers in use
| Layer | In this project | What it contains |
|---|---|---|
| Feedback | yes | |
| Continuity | yes / no | |
| Arrival | yes / no | |
| Signature | yes / no | |
| Narrative | yes / no | |

## The gate
Every candidate, including the ones rejected. What does not move is part of the design.

| Candidate | How often seen | Kind (feedback, continuity, explanation, identity, narrative) | Decision |
|---|---|---|---|
| | | | animate / do not animate, because |

## Sequence: <name>
One table per event that moves two or more things.

**Trigger:** <exactly which input>

| Element | Role (lead, support, decoration, still) | Starts | Lasts | Motion | Relation (together, overlap, sequence, carry) |
|---|---|---|---|---|---|
| | | | | | |

Cast as still, and why:

## Life of one interaction: <name>
| Stage | Decision |
|---|---|
| Rest | <what it looks like, and what says it can be acted on> |
| Trigger | |
| Response within 100 ms | |
| Timing and easing | <tokens, by job> |
| Origin | <where it comes from. Never the centre by default> |
| Continuity | <what stays constant> |
| Interruption | <acted on again mid-flight: it retargets from where it is> |
| Reversal | <the way back, and its duration> |
| Completion | <resting state, focus, what is announced> |
| Reduced motion | <the designed alternative> |
| Touch, keyboard, assistive technology | |

## Signature moment
| | |
|---|---|
| Fact and device it comes from | |
| How it is discovered | |
| What the visitor understands afterwards | |
| What it hands on to | |
| Fallbacks: touch, keyboard, reduced motion, no script, a slow device | |

## Seen
| Moment | Command | Strip | Questions raised, and the answer |
|---|---|---|---|
| Entrance | `motion_strip.mjs <url> --trigger load --reduced` | | |
| | `motion_strip.mjs <url> --trigger "click:<selector>" --interrupt 120 --exit undo` | | |

Not checked by a person on a device:
