---
type: regex
pattern: 'maximum-scale\s*=\s*1|user-scalable\s*=\s*no'
match: not_contains
target: { source: file, path: src/app/layout.tsx }
---
