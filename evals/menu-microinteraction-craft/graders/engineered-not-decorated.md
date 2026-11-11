---
type: llm
focus: { source: file, path: menu.html }
weight: 2
---

PASS if all of these hold:
- The menu answers at once and is quick: opening takes about 200 ms or less (or does not animate at all), on a curve that starts fast. The stagger on the items is gone: the items are simply in the menu when it appears. There is no overshoot or bounce.
- It can be interrupted: the open and closed states are driven by transitions (or an equivalent that continues from the current value), not by keyframe animations that restart, so a second press mid-flight reverses cleanly. Closing is shorter than opening, or instant.
- It grows from where it was opened: the transform origin is the corner nearest the button, and it never starts from nothing.
- Only transform and opacity (or similarly cheap properties) change. The button no longer animates its padding, and its hover changes one property, limited to devices that hover.
- Keyboard and assistive behaviour is complete: aria-expanded stays in step, Escape closes and returns focus to the button, clicking outside closes, the closed menu cannot be tabbed into, and focus is visible.
- prefers-reduced-motion removes the movement and keeps the menu working.
FAIL if the fix adds effects (a spring bounce, a blur, a stagger, a longer sequence), if anything a person triggers takes more than about 300 ms, if a library was added, or if the menu became harder to use from the keyboard.
