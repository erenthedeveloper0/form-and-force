# Quick start

This page assumes Form & Force is [installed](installation.md) as a Claude Code plugin. It takes you from a first request to reading the report.

## 1. Describe the work

Open Claude Code in your project and describe what you want, in your own words. Claude loads the skill when the request is about designing, building, animating or reviewing web interfaces. To load it explicitly, start with `/form-and-force:form-and-force` (as a personal skill: `/form-and-force`).

Say what matters and what must not change. Examples, from small to large:

```text
The menu on our docs site jumps when it opens and does not close with Escape. Fix it.
```

```text
Our pricing page looks like every SaaS template. Redesign it around how
accountants actually compare plans. Keep the existing Next.js stack.
```

```text
Design and build the launch site for our ceramics studio. We have product
photography of twelve pieces and our kiln logs. Nothing else is decided.
```

```text
Audit the marketing site at https://example.com. Do not change anything yet.
```

The skill scales the method to the job. A fix gets a short pass. A full site gets every stage, and Claude shows you the directions before building.

## 2. What you will see

| Stage | What Claude does | What you might be asked |
|---|---|---|
| **Read** | Inventories the repository (stack, tokens, routes, motion code, uncommitted work), runs a baseline scan, and collects facts about the subject | Only for facts it cannot discover: real proof assets, legal constraints, brand rules |
| **Direct** | Sets a register and says why, writes down "the twin" (the page any competent agent would make), deals a hand of cards and sketches each frame | For large work: which frame on the sketch board to build. Claude recommends one |
| **Derive and build** | Extracts composition, type, colour and motion from the chosen frame, then builds in your stack | Nothing, usually |
| **Floor** | Runs your build, typecheck, lint and tests, the static scan and the rendered audit, and checks the ten gates | Nothing |
| **Jury** | Judges the rendered page from screenshots and filmstrips: a cold read, a test against the twin, ten dimensions with evidence, and a verdict | Nothing; a "rework" or "redirect" verdict sends it back to work |
| **Report** | Hands over the direction, what changed, every command with its actual result, the jury's marks, open findings and anything unverified | Decisions only you can make |

Sketches go in `.ff/frames/` in your project by convention. Add `.ff/` to your ignore file. Rendered evidence (boards, audits, filmstrips) goes to your system's temporary directory unless you ask for another place.

## 3. Optional: the rendered tools

The sketch board, page audit and motion strip need Playwright with Chromium. Without them Claude compares written frames and runs static checks, and says so in the report. To enable them without adding anything to your project:

```bash
mkdir -p ~/.cache/ffpw && cd ~/.cache/ffpw && npm i playwright && npx playwright install chromium
export FF_PLAYWRIGHT_DIR=~/.cache/ffpw
```

Details are in [installation](installation.md#optional-rendered-tools).

## 4. Use the tools yourself

The tools also run without Claude. They are free, offline and print their usage with `--help`. In a clone of this repository:

```bash
node skills/form-and-force/scripts/inspect_repo.mjs path/to/project            # what the project is made of
node skills/form-and-force/scripts/slop_scan.mjs path/to/project --strict      # failures and default patterns
node skills/form-and-force/scripts/deal.mjs hand --register composed --has ui --no-history
node skills/form-and-force/scripts/motion_tokens.mjs --action glide --flow bound
```

With Playwright available:

```bash
node skills/form-and-force/scripts/audit_page.mjs https://example.com      # first screen, flatplan, facts, focus walk, LCP and CLS
node skills/form-and-force/scripts/sketch_board.mjs a.html b.html c.html   # compare sketches side by side
node skills/form-and-force/scripts/motion_strip.mjs https://example.com --trigger "click:#menu" --interrupt 120 --exit undo
```

Every tool is described in the [tools reference](reference/tools.md).

## 5. Read the report

The report follows [a fixed template](reference/templates.md#handoff-report). Read it in this order:

1. **The direction and the twin.** Is the idea specific to your project, and does the page do something the twin would not?
2. **The floor.** Every gate with its evidence. A gate that did not pass is named, with the reason.
3. **The jury.** Marks with one line of evidence each, the verdict, and the findings still open.
4. **Not verified.** Anything that was not run or could not be checked. Nothing is reported as passing unless it ran.

## Next

- [How it works](how-it-works.md): the method end to end.
- [Creative direction](guides/creative-direction.md): how directions are found, and how to steer them.
