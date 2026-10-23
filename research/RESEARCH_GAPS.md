# Research gaps and limitations

This file records what the research could not establish, so that nobody mistakes it for evidence.

## Access and tooling limits
1. **Dead seed references.** `takingshape.adobe.com` and `vogue-talents-sept2021.monogrid.io` no longer resolve (DNS, 2026-10-22, re-checked 2026-10-23), and their Wayback Machine copies hold only the app shell. They are now documented from the Dogstudio case study, the Awwwards entries and the studios' published stills. Those show composition, not behaviour (see `research/SOURCE_STATUS.md`). Lesson for the skill: campaign microsites decay, so `project-modes.md` asks for an archiving and sunset plan on campaign work.
2. **Deep Beauty live URL not found.** The AQuest case page returned 403 to automated clients on 2026-10-22 and 2026-10-23 and has no archived copy. The Ogilvy work page confirms the online experience existed but does not link it. The project is described only from secondary sources and needs a manual browser check.
3. **Headless GPU.** Igloo Inc (desktop) and Bruno Simon (mobile) stalled at their WebGL loaders in headless Chromium. Their in-world behaviour was not observed. `audit_page.mjs` documents this, and the skill tells agents to test WebGL work in a headed browser or on a real device as well.
4. **Interaction depth.** Captures exercised load, wheel or scroll, Tab, and reduced motion only. **Hover, drag, gesture, audio, multi-page navigation and form submission were not exercised.** Corpus statements about those are marked *(inferred)* and rely on Awwwards element labels.
5. **Single lab run, unthrottled.** LCP, CLS and long-task numbers come from one run per viewport on a fast machine, not from field data. The CLS readings of about 1.0 (Terminal, Grafana) happened during automated wheel scrolling and may overstate real-user CLS.
6. **Contrast heuristic.** The audit computes contrast against the nearest solid ancestor background. Text over video, canvas or images yields false readings such as 1.00:1, and text on transparent overlays can be missed. Treat these as candidates for manual checking.
7. **Library detection** relies on globals and DOM markers. Bundled libraries that don't expose globals (GSAP inside a module, for example) are under-counted.

## Knowledge gaps
1. **Official Awwwards criterion definitions.** The evaluation page lists criteria and weights but does not define them. Third-party glosses were not used as authority.
2. **Developer Award guidelines text.** The sub-criteria names are verified from SOTD pages; the full official guideline text was not located.
3. **Screen-reader behaviour.** No assistive-technology testing (VoiceOver, NVDA, JAWS) was done on the corpus. The skill's accessibility checklist therefore requires manual AT checks for its own outputs instead of claiming them from automation.
4. **Field performance of award sites.** No CrUX or field data was gathered.
5. **Native/mobile apps.** The skill targets the web. Native iOS and Android motion guidelines were not researched beyond responsive and touch web behaviour.
6. **Long-term skill efficacy.** Status: **not run**. The eval suite (`evals/`) is written and passes offline structure checks, but it has not been run against a model, because each `claude plugin eval` run is billed. `python3 scripts/evals.py` lists what a run would execute without calling a model. The first run and its baseline delta are the next step.

## Disputed or taste-dependent areas
- Whether gradients, serif display type or single-word accents are "slop" depends on context. The skill handles them as review triggers with a decision procedure, never as bans.
- Smooth scrolling: some practitioners consider it a usability regression in general. Others use it for scroll-synced WebGL. The skill requires a narrative or sync reason, reduced-motion respect, and nested-scroll prevention.
