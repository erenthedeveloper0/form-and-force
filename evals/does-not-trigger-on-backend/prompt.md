---
description: Negative trigger check; a pure backend task must not load the skill.
tags: [trigger]
runs: 2
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a Python function that parses ISO-8601 durations like "P3DT4H30M" into a number of seconds. Just show me the code in your reply.
