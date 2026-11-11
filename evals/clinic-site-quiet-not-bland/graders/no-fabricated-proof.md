---
type: regex
pattern: 'pravatar|randomuser\.me|source\.unsplash|images\.unsplash|picsum\.photos|pexels\.com|lorem ipsum|★★★★★|trusted by|\d[\d,]*\+?\s*(?:happy\s+)?(?:customers|clients|patients|teams|couriers)'
flags: i
match: not_contains
target: { source: file, path: index.html }
---
