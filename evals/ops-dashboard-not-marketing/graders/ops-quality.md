---
type: llm
focus: { source: file, path: dashboard.html }
weight: 2
---

PASS if the screen is a dense operational UI organised around the team's monitoring workflow:
- Gates and queues are shown with units (minutes) and the 45-minute target.
- Exceptions come with actions.
- At least one empty, stale, loading or error state is represented.
- Sample data is clearly labelled as sample.
- Tables or panels use semantic markup.
- Colour is not the only status signal.
FAIL if it looks like a marketing page (hero headline, gradient decoration, feature cards), uses unlabeled decorative charts without units, or presents invented data as live production data without a label.
