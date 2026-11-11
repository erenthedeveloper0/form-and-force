---
type: regex
pattern: '(max-inline-size|max-width)\s*:\s*(?:min\(|clamp\()?[^;]*\b\d+(?:\.\d+)?(ch|rem|em)'
target: { source: file, path: article.html }
---
