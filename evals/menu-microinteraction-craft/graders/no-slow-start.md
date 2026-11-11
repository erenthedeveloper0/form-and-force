---
type: regex
pattern: 'ease-in(?!-)\b'
match: not_contains
target: { source: file, path: menu.html }
---
