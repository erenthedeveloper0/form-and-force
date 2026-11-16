# Introduction

Form & Force gives a coding agent a method for web work: marketing sites, portfolios, e-commerce, SaaS products, dashboards, editorial pieces, immersive WebGL and design systems. It covers creative direction, interface design and motion engineering, and it ends with the agent judging what it actually built.

It is an [Agent Skill](https://agentskills.io/specification): a folder of instructions, references and tools that an agent loads when a request matches. It is packaged as a Claude Code plugin, and as a standalone skill for claude.ai and the Skills API. It is free and open source under the MIT License.

## The problem

Ask a capable agent for a website and you get competent, predictable work: a centred hero, three feature cards, a violet gradient, a tasteful serif, a fade-up on every section. Ask it to be original and you get the most typical original thing. The research behind this project ([creative method](../research/CREATIVE_METHOD.md)) traces this to three causes:

| Cause | What happens |
|---|---|
| **The mode** | Asked to choose, a model chooses the most typical option, including the most typical "unusual" one |
| **Words** | Directions described in prose sound different and render as the same page |
| **Self-defence** | Whoever wrote the rationale finds the result convincing |

Instructions alone do not fix these. "Be bold" and lists of things to avoid move the output to the nearest thing not on the list.

## What Form & Force does about it

Each cause gets a mechanism, not an instruction.

| Cause | Mechanism |
|---|---|
| The mode | The choices that decide distinctiveness are **dealt** by a script, at random, away from what recent projects used |
| Words | A direction is **drawn** before it is chosen: rough key frames, rendered side by side, chosen by looking |
| Self-defence | The built page is **judged cold**, from screenshots, against the page any competent agent would have made |

Around those mechanisms sits a full method: reading the repository and the subject, setting how ambitious the project should be, deriving composition, type, colour and motion from the chosen frame, building in the project's own stack, and clearing ten hard gates for accessibility, function, responsiveness, performance and honesty. [How it works](how-it-works.md) walks through it.

## What makes it different

- **It has no look of its own.** A public-service form, a trading dashboard and an immersive launch each get their own answer. Three projects made with it should not resemble one another, and the skill's own habits are on its list of defaults to check for.
- **Ambition is set per project.** A register (Quiet, Composed, Expressive or Radical) decides what bold means. A restrained service site is not marked down for having no WebGL.
- **Decisions are made by looking.** Sketches before prose, the rendered page before the rationale.
- **Nothing is invented.** No made-up testimonials, logos, metrics or screenshots. Missing proof becomes a labelled slot.
- **Your stack, your code.** It inspects first, keeps working architecture and uncommitted work, and adds dependencies only for a stated need.
- **The floor is not traded for beauty.** WCAG 2.2 AA, a designed reduced-motion version, real controls and performance budgets are gates, separate from the judgement of whether the work is good.
- **It reports honestly.** The report says what ran, what passed and what was not verified.

## What it is not

- **Not a component library or a template.** It produces no house style. The [component atlas](reference/component-atlas.md) describes jobs, states and tests, never designs.
- **Not a website generator.** It works inside a coding agent, on your repository, in your stack.
- **Not a guarantee of taste or awards.** It makes divergence, looking and rejection unavoidable. It cannot promise a good idea.
- **Not for native apps.** iOS and Android guidance is out of scope.

## Who it is for

- People who use Claude Code (or another agent that reads Agent Skills) to design and build for the web, and want work that belongs to the project rather than to the model.
- Designers and engineers who want an agent to show its directions before building, and to judge its own output against evidence.
- Teams who need accessibility, performance and honesty treated as gates, not as polish.

## Limits

- **Efficacy is unmeasured.** The model evaluations have not been run on any release. There is no measured evidence yet that the skill improves outcomes over no skill. The case for it is argued in the [research](../research/CREATIVE_METHOD.md).
- **The rendered tools need a browser.** The sketch board, the page audit and the motion strip need Playwright with Chromium. Without them the method runs on written frames and static checks, and the report says so.
- **Checks are heuristics.** The scanners and the audit raise candidates and questions. They do not certify accessibility or field performance.

The full list is in the [README](../README.md#limitations) and [compatibility](reference/compatibility.md).

## Next

[Install it](installation.md), then follow the [quick start](quick-start.md).
