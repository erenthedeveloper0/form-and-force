---
type: llm
focus: { source: file, path: src/components/HowItWorks.tsx }
weight: 2
---

PASS if all of these hold:
- The component is a client component with GSAP cleanup handled (useGSAP or gsap.context with revert).
- ScrollTrigger is registered.
- The pinned element itself is not what gets transformed; children are animated.
- A reduced-motion condition removes the pin and scrub while all three steps remain readable in the DOM.
- Mobile gets a shorter or unpinned variant (for example gsap.matchMedia).
- Only transform and opacity (or similarly cheap properties) are animated.
FAIL if animations are created in a plain useEffect without cleanup, if the steps only exist inside JS animation (not in markup), if there is no reduced-motion path, or if width, height, top or left are animated.
