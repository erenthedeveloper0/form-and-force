---
type: regex
pattern: 'transition\s*:\s*all\b'
match: not_contains
target: { source: file, path: menu.html }
---
