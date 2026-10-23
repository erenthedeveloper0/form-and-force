---
description: Existing Next.js page full of AI-default patterns and real defects; checks inspect-first behaviour, targeted fixes and honest reporting.
tags: [audit, repo]
runs: 2
max_turns: 60
timeout_seconds: 1500
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

This folder is the marketing site for TidyLedger, our bookkeeping software for independent accountants. It looks like every other AI-made SaaS page. Audit it and fix the most serious problems. Don't rewrite the whole thing, and tell me exactly what you checked. You can't install packages or run the dev server here.
