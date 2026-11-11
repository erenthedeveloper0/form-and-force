---
type: regex
pattern: 'gsap|data-aos|parallax|animation-timeline|<canvas|requestAnimationFrame|scroll-snap'
flags: i
match: not_contains
target: { source: file, path: index.html }
---
