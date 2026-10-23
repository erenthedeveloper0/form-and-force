---
type: regex
pattern: '(?:from|via|to)-(?:purple|violet|indigo|fuchsia)-\d|#7c3aed|#8b5cf6|#6366f1|#a855f7|#4f46e5'
flags: i
match: not_contains
target: { source: file, path: index.html }
---
