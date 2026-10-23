---
type: regex
pattern: 'pravatar|Jane Doe|Acme Inc'
match: not_contains
target: { source: file, path: src/components/Testimonials.tsx }
---
