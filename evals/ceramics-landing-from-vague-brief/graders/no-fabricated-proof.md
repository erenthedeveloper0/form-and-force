---
type: regex
pattern: 'pravatar|randomuser\.me|source\.unsplash|picsum\.photos|lorem ipsum|★★★★★|trusted by|\d[\d,]*\+?\s*(?:happy\s+)?(?:customers|collectors|clients)'
flags: i
match: not_contains
target: { source: file, path: index.html }
---
