# Motion spec: <project>

## Identity
- **Sentence:** <how things move here, and why it fits the subject>
- **Tokens:** durations (instant / quick / move / scene), easings (enter / exit / move), stagger step, distances.
- **Ownership:** <which system owns which elements: CSS / WAAPI / GSAP / Motion / WebGL>
- **Budget:** Level 1–2 sequences on the page: <n>; signature moments: <1–2>.
- **Reduced-motion strategy:** <replace with dissolves / static key frames / instant; user toggle?>

## Sequences
Copy one block per Level 1–2 sequence (and complex Level 3 ones).

```
Sequence:                         Level:
Purpose:
Trigger:
Initial state:
Intermediate states / keyframes:
Final state:
Duration / range:
Easing:
Stagger (order, step, cap):
Dependencies (fonts, images, data):
Scroll relationship (none / once / scrub / pin + length):
Input relationship (pointer / touch / keyboard):
Interruption & cancel:
Exit / reversal:
Reduced-motion alternative:
Mobile adaptation:
Performance constraints (properties, layers, element count):
Test method:
```

## Signature moment
- Why it belongs (subject-mining items):
- Discovery:
- What it communicates:
- Aftermath (hand-off to the journey):
- Fallbacks (reduced motion / no WebGL / touch / keyboard / slow device):

## Checklist
- [ ] One loud thing at a time.
- [ ] No fade-up on everything.
- [ ] Interruptible; never blocks input.
- [ ] Reduced path reviewed in the contact sheet.
- [ ] Cleanup verified (mount/unmount twice).
- [ ] Mobile variant reviewed; frame rate acceptable at 4× CPU throttle.
