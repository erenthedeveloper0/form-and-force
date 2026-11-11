---
description: A targeted motion fix on a menu opened dozens of times a day in a working tool; checks the frequency gate, restraint, interruption-safe transitions, origin, a shorter exit and keyboard behaviour.
tags: [motion, craft, restraint]
runs: 2
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

menu.html in this folder is the header of our staff rota tool. The account menu feels sluggish and cheap. People open it dozens of times a day, a lot of them from the keyboard. Fix the interaction and tell me what you changed and why. Keep it plain HTML, CSS and JavaScript in the same file. You can't install packages or open a browser here.
