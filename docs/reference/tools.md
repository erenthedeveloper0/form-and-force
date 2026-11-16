# Tools

The skill ships eight command-line tools and two shared modules in [`skills/form-and-force/scripts/`](../../skills/form-and-force/scripts/). They are Node ES modules with no dependencies beyond Node's built-ins, plus Playwright for the four rendered tools, which is resolved at run time and never installed by the tools themselves.

Inside an agent session the skill calls them as `node "${CLAUDE_SKILL_DIR}/scripts/<tool>.mjs"`. From a clone of this repository, use `node skills/form-and-force/scripts/<tool>.mjs`. The examples below use `scripts/` for short.

## Shared behaviour

| | |
|---|---|
| **Runtime** | Node 18 or newer |
| **Help** | Every tool prints its usage with `--help` or `-h` and exits 0, without opening a browser or writing anything |
| **Exit codes** | 0 success; 1 a failure the tool exists to report (a C finding under `--strict`, a trigger that could not be reached); 2 a usage error, a missing input, a missing browser, or incomplete coverage under `--strict` |
| **Network** | None of their own. The rendered tools load only the URLs and files you pass |
| **Secrets** | No tool opens `.env` or credential files. `inspect_repo` lists that they exist; `slop_scan` reports a secret by file and line, never its value |
| **Output** | Text for people by default; `--json` for machines where noted. Rendered output goes to the system's temporary directory unless `--out` is given |
| **Playwright** | Resolved from the current project first, then from `FF_PLAYWRIGHT_DIR`. `FF_CHROMIUM_PATH` can point at an existing browser. See [configuration](configuration.md) |

| Tool | Needs a browser | Stage |
|---|---|---|
| [`inspect_repo`](#inspect_repo) | No | Read |
| [`slop_scan`](#slop_scan) | No | Read, floor |
| [`deal`](#deal) | No | Direct |
| [`motion_tokens`](#motion_tokens) | No | Derive |
| [`sketch_board`](#sketch_board) | Yes | Direct |
| [`audit_page`](#audit_page) | Yes | Read, floor, jury |
| [`motion_strip`](#motion_strip) | Yes | Jury |
| [`contact_sheet`](#contact_sheet) | Yes | Jury |

## inspect_repo

A read-only inventory of a frontend repository before any change: framework, package manager, TypeScript, styling, component, motion, 3D, data-visualisation, state and form libraries, routes, components, tokens (custom properties, reduced-motion references, dark mode), fonts, assets, scripts, test and lint tooling, configuration and git state, with notes on what to preserve.

```bash
node scripts/inspect_repo.mjs [dir] [--json]
```

| Argument | |
|---|---|
| `dir` | The project root. Default: the current directory |
| `--json` | Print the inventory as JSON |

Exit 0, or 2 when `dir` is not a directory.

## slop_scan

A static scan of source files and server-rendered templates for **C** failures (dead links, handlers that do nothing, fake progress, placeholder copy and media, images without alt text, clickable elements that are not controls, positive `tabindex`, blocked zoom, unmuted autoplay, GSAP without cleanup, secrets in client code), **B** combined sameness (many defaults at once), and **A** review triggers (default patterns that need a reason). Findings are prompts for judgement, not verdicts; an A trigger is fine when the direction justifies it.

```bash
node scripts/slop_scan.mjs [dir] [--json] [--max <n>] [--strict]
```

| Argument | |
|---|---|
| `dir` | The project root. Default: the current directory. `node_modules`, build output and caches are skipped |
| `--json` | Print the findings, the summary and the `coverage` object as JSON |
| `--max <n>` | Examples shown per rule (default 5) |
| `--strict` | For CI and hand-over: exit 1 on any C finding; exit 2 when there is none but template files were not read |

It reads JavaScript and TypeScript (including JSX and TSX), Vue, Svelte, Astro, HTML, CSS, Sass, Less and MDX, and, as markup, Blade, ERB, EJS, Twig, Nunjucks, Jinja, Handlebars, Mustache and Liquid. Templates it has no rules for (Pug, Haml, Slim, Razor, JSP, PHTML, HEEx, Go HTML) are counted and listed. Every run states its coverage: `complete`, `partial`, `incomplete` or `empty` ([floor.md §11](../../skills/form-and-force/references/floor.md#11-running-the-scan)). A repository's own `README.md`, `SECURITY.md` and similar Markdown documents are left out; a page named `security.tsx` is scanned.

Exit 0 (without `--strict`, always, unless `dir` is not a directory: 2).

## deal

Deals a creative hand from the deck: for each key frame, one lens, one structure and one lead medium, never two from one family in a hand, away from recent hands, and limited to the material the project has. It remembers what recent projects committed to.

```bash
node scripts/deal.mjs hand --register quiet|composed|expressive|radical [--frames 3] [--has photo,ui,data,object,video|none] [--seed <text>] [--json]
node scripts/deal.mjs swap --frame <n> --part lens|structure|medium --reason "<why it cannot apply>"
node scripts/deal.mjs record --device "<the device in one line>" [--frame <n>] [--type "Family A, Family B"] [--palette "<words or values>"] [--motion "<character>"]
node scripts/deal.mjs recent [--json]
node scripts/deal.mjs deck [registers|lenses|structures|media] [--json]
```

| Command | Does |
|---|---|
| `hand` | Deals the frames, prints the register's demands (bold, the least it must do, timid, overwrought) and what recent projects committed to. `--seed` makes a deal repeatable |
| `swap` | Replaces one card of one frame, once per frame, with a reason of at least 12 characters. "I prefer another" is refused |
| `record` | Records the committed direction so later hands steer away from it |
| `recent` | What recent projects committed to: devices, structures, typefaces, palettes, motion |
| `deck` | Prints the deck, or one part of it ([the deck](deck.md)) |

Every command accepts `--history <file>` and `--no-history`. The history is `~/.form-and-force/history.json` unless `FF_HISTORY` or `--history` says otherwise ([configuration](configuration.md#the-dealers-history)). In `deck.json`, the history and `--json` output a structure is stored under the key `archetype`; `--part archetype` and `deck archetypes` are accepted as older spellings.

Exit 0, or 2 on a usage error (a missing register, a weak reason, a second swap on one frame).

## motion_tokens

Derives a project's motion tokens from one decision about character, so that every duration, curve, spring, travel distance and stagger comes from the same source.

```bash
node scripts/motion_tokens.mjs --action dab|flick|glide|float|punch|slash|press|wring [--flow bound|free]
node scripts/motion_tokens.mjs --weight <0-1> --time <0-1> --space <0-1> --flow <0-1>
node scripts/motion_tokens.mjs list
```

| Argument | |
|---|---|
| `--action` | One of the eight effort actions ([motion](../guides/motion.md#character-and-generated-tokens)) |
| `--flow` | `bound` (contained, never overshoots; default) or `free` (released, with follow-through), or a number |
| `--weight --time --space --flow` | The four factors set directly, each 0 to 1 |
| `list` | The eight actions and what each feels like |
| `--json` | The tokens as JSON |
| `--prefix <name>` | A prefix for the CSS custom properties |

It prints CSS custom properties for durations by job, enter, move and exit curves, a spring as a CSS `linear()` curve and as library settings, travel distances, a stagger, a reduced-motion block, and what is out of character. Exit 0, or 2 on an unknown action or an out-of-range factor (and when run with no arguments).

## sketch_board

Renders key frames side by side, wide and narrow, with a blurred greyscale thumbnail of each, and measures whether they differ in structure or only in content.

```bash
node scripts/sketch_board.mjs <a.html> <b.html> [c.html …] [options]
```

| Option | |
|---|---|
| `--out <dir>` | Output directory. Default: `<tmp>/ff-board/<time>` |
| `--viewports <list>` | Comma-separated `WxH`. Default `1440x900,390x844` |
| `--labels <list>` | Column labels. Default `A,B,C,D` |
| `--wait <ms>` | Settle time after load. Default 900 |
| `--scroll` | Also shoot each frame's second screen |
| `--json` | Print the measurements as JSON |

Writes `board.jpg` and `board.json`. Takes one to six frames, as local files or URLs; pass the current page's URL first for a before-and-after board. Exit 0, or 2 on a usage error, a missing file or a missing browser.

## audit_page

A rendered audit with two kinds of evidence from one run: what a jury would see, and what an auditor checks.

```bash
node scripts/audit_page.mjs <url|file> [more urls or /routes] [options]
```

| Option | |
|---|---|
| `--out <dir>` | Output directory. Default: `<tmp>/ff-audit/<slug>-<time>`; one subdirectory per URL when several are given |
| `--viewports <list>` | Comma-separated `WxH`. Default `390x844,1440x900` |
| `--scroll-shots <n>` | Screenshots while wheel-scrolling, per viewport. Default 4 |
| `--plan-tiles <n>` | Screens sampled for the flatplan and pacing facts. Default 14; 0 skips the design facts |
| `--wait <ms>` | Settle time after load. Default 2500 |
| `--focus-steps <n>` | Tab presses inspected at the widest viewport. Default 30 |
| `--full-page` | Also capture a full-page screenshot per viewport |
| `--no-reduced` | Skip the `prefers-reduced-motion` comparison |
| `--chromium <path>` | Browser executable (or `FF_CHROMIUM_PATH`) |
| `--json` | Print the full report as JSON |

A path starting with `/` after an `http(s)` URL is a route on the same origin. Writes `first.jpg` (the first screen at each width, with a blurred copy), `flatplan.jpg` (every screen in order), `sheet.jpg` (the scroll and responsive contact sheet) and `report.json`: console errors, overflow, focus visibility, target size, landmarks, headings, the reduced-motion response, LCP and CLS from one lab run, libraries detected, design facts and the questions they raise. Exit 0, or 2 on a usage error (including an unknown option) or a missing browser.

## motion_strip

Plays one moment of a page in slow motion and lays the frames out as a filmstrip with timestamps, next to an inventory of what actually animated.

```bash
node scripts/motion_strip.mjs <url|file> --trigger <what> [options]
```

| Trigger | |
|---|---|
| `load` | The page's entrance |
| `hover:<selector>`, `click:<selector>`, `focus:<selector>` | Pointer, click or keyboard focus on an element |
| `key:<Key>` | A key press, such as `key:Escape` |
| `scroll:<from>-<to>` | Scroll positions in pixels, sampled evenly |

| Option | |
|---|---|
| `--before <trigger>` | One action first, at normal speed (open a menu, then capture its hover) |
| `--span <ms>` | Animation time covered. Default 900; 1800 for `load` |
| `--frames <n>` | Frames across the span. Default 10 |
| `--rate <n>` | Slow-motion factor. Default 0.1 (ten times slower) |
| `--interrupt <ms>` | Undo the trigger mid-flight, to show whether motion retargets or jumps |
| `--exit <trigger\|undo>` | Play the way back after the span, and capture it |
| `--clip <selector\|viewport>` | What each frame shows. Default: around the target |
| `--viewport <WxH>` | Default `1440x900`. Under 900 px wide the page is emulated as a touch device |
| `--reduced` | Add a second strip under `prefers-reduced-motion: reduce` |
| `--wait <ms>` | Settle time before the trigger. Default 1200 |
| `--out <dir>` | Default: `<tmp>/ff-motion/<slug>-<time>` |
| `--json` | Print the inventory as JSON |

Writes `strip.jpg` and `motion.json`, including layout shift during the moment and each animation's declared delay. CSS animations, transitions and the Web Animations API are slowed through the DevTools playback rate, and JavaScript clocks are scaled by the same factor; video and network time are not. Exit 0; 1 when the trigger's element cannot be reached within 8 seconds; 2 on a usage error or a missing browser.

## contact_sheet

Lays a folder of screenshots out as one labelled sheet, one row per leading viewport label (`390-01-scroll.jpg` goes in row `390`).

```bash
node scripts/contact_sheet.mjs <dir> [--out sheet.jpg] [--height 300]
```

Exit 0, or 2 when `dir` is not a directory or no browser is available.

## Shared modules

| Module | Used by | Does |
|---|---|---|
| `browser.mjs` | The rendered tools, and the brand renderer (`brand/build.mjs`) | Resolves Playwright, launches Chromium, parses viewports, renders boards and sheets |
| `design_facts.mjs` | `audit_page`, `sketch_board` | Measures the rendered page and phrases what it finds as questions. Calibrated on 19 reference sites and 11 templates ([instrument calibration](../../research/INSTRUMENT_CALIBRATION.md)) |
| `deck.json` | `deal` | The deck: registers, lenses, structures and media ([the deck](deck.md)) |
