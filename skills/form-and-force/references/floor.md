# The floor: hard gates and known defaults

What must be true of any work before it is judged, and the registry of defaults to check finished work against. The floor is a set of obligations. It is not where ideas come from, and clearing it says nothing about whether the work is good: that is the jury's question ([jury.md](jury.md)).

## Contents
1. What the floor is for
2. Hard gates
3. Failures: fix without exception
4. Five ways work fails
5. Review triggers and combined sameness
6. The registry of defaults
7. This skill's own attractor
8. Deciding a trigger
9. What is not a default
10. Justifications that count
11. Running the scan

---

## 1. What the floor is for

- **Before the jury:** the hard gates (§2) are settled first. Beauty is never traded against them, and they are never traded against beauty.
- **After the build:** the registry (§6) is a checklist run over finished work, to catch defaults that slipped in unexamined.
- **Never before the idea:** do not design by avoiding this list. A list of things to avoid produces the nearest thing not on the list, which becomes the next default. Direction comes from the subject and the hand ([direction.md](direction.md)).

A page can pass every item here and be forgettable. That is the most common outcome of designing to a checklist.

## 2. Hard gates

Binary. All must pass, or the report says exactly which did not and why.

| # | Gate | Evidence |
|---|---|---|
| G1 | No failures from §3 | `slop_scan.mjs --strict` exits 0, plus a manual read of §3 |
| G2 | Build, typecheck and lint pass, or existing failures are documented as not introduced | Command output |
| G3 | No console errors or uncaught exceptions from project code on audited routes | `audit_page.mjs` |
| G4 | No horizontal overflow at 360 to 430 px; zoom is not blocked | `audit_page.mjs` |
| G5 | Every primary task completes by keyboard; focus is visible, never obscured, never on something invisible | Audit focus walk and a manual pass |
| G6 | One `h1` and landmarks per page; every control has a name; images have alt text | Audit and a manual pass |
| G7 | The reduced-motion version keeps all content and controls, and large motion is replaced | Reduced frame in `sheet.jpg`, `motion_strip.mjs --reduced`, and a manual pass |
| G8 | Every visible control does something real, or is a labelled, bounded demo | A walk through the flows |
| G9 | No fabricated proof and no unsupported claims | Content checked against the truth inventory |
| G10 | The performance budget for the mode is met in the lab, or the overage is explained with a plan | Audit LCP and CLS; a trace where available |

Engineering detail: [accessibility.md](accessibility.md), [responsive-engineering.md](responsive-engineering.md), [performance-engineering.md](performance-engineering.md), [security-and-integrity.md](security-and-integrity.md).

## 3. Failures: fix without exception

- Broken controls: `href="#"`, handlers that do nothing, decorative toggles, fake search, filters, sign-in or progress.
- Deceptive interaction: disguised advertising, pre-checked consent, confirm-shaming, invented scarcity.
- False or unsupported claims; fabricated testimonials, logos, metrics, people or screenshots shown as real.
- Layouts that cannot be used on a phone; horizontal overflow; blocked zoom.
- Essential actions that cannot be reached by keyboard, screen reader or touch; hidden or covered focus.
- Critical flows left incomplete: checkout, sign-up, saving settings, confirming something destructive.
- Console errors from your own code.
- Features described as complete that were not tested.
- Large motion with no reduced-motion version; content that moves for more than five seconds with no way to pause it.
- Placeholder text or media in a deliverable that is not labelled as a prototype.
- Secrets in client-side code.

## 4. Five ways work fails

| Class | What it is | Ask |
|---|---|---|
| **Generic** | Its choices would transfer to an unrelated organisation unchanged | Which decisions could only belong to this project? |
| **Timid** | Nothing was ventured for the register: it is the twin, well made | What does it do that the obvious version would not? |
| **Unresolved** | A polished surface over missing states, widths, content or behaviour | What happens when it is empty, loading, failing, long, narrow, touched, reduced? |
| **Incoherent** | Type, colour, layout, copy and motion follow different rules | Is this one system with deliberate variation? |
| **Unverified** | Claims about function, performance, accessibility or completeness that were not checked | What evidence is there, and where did it come from? |

Generic and timid are judged by the jury's cold read and twin test. The floor's scan can only catch their symptoms.

## 5. Review triggers and combined sameness

**A: review triggers.** A high-frequency default is present. Keep it only with a reason that is about this project (§10). Otherwise replace it or remove it.

**B: combined sameness.** Three or more A patterns together. Each may be defensible alone; together they are the generic look. Justify each, or redesign the cluster. `slop_scan.mjs` raises this as `combined-sameness`.

**C: failures.** §3. Fix.

## 6. The registry of defaults

Each of these is right for some brief. None is right by default.

**First order: the statistical centre**
- A centred hero: headline, sentence, two buttons.
- Hero, logo strip, three feature cards, testimonials, pricing, FAQ, final call to action.
- Purple, violet or indigo gradients; glass panels; glowing borders; blurred orbs.
- One large radius and one soft shadow on every surface; a component library left at its defaults.
- Icon, heading and two lines, repeated; sparkle, rocket and bolt icons.
- Pill badges that say nothing ("New", "AI-powered").
- Fake dashboards built from decorative charts.
- A fade-up on every element as it scrolls in; `transition: all`.
- Inter, Roboto, Open Sans, Poppins or the system font chosen by habit.
- "Unlock", "seamless", "all-in-one", "next-generation", "trusted by 10,000+ teams".

**Second order: the tasteful overcorrection**
- A cream or stone ground, a high-contrast serif display face and a terracotta or clay accent.
- Near-black with one acid-green, lime or vermilion accent.
- Broadsheet styling: hairline rules, zero radius, newspaper columns, for a subject that is not a publication.
- A tracked capitals label above every heading; middle-dot metadata strings; an arrow after every link; monospace labels for a technical flavour; 01, 02, 03 numbering where there is no sequence.
- A tinted near-black standing in for black, and an off-white standing in for white, by habit.
- This year's interesting typeface, chosen because it is this year's.
- One word in italic or in colour in every headline.

**Award-site defaults: imitation of winners**
- Acid lime or neon on near-black; a floating pill navigation with a bright chip.
- "Enter" gates, monogram preloaders, counting percentages.
- Smooth scrolling on every site; pinned word-by-word statements.
- A rotating or exploding hero object with callouts; particles assembling into a logo.
- Oversized all-capitals grotesque headlines; marquee strips; bento mosaics.
- Custom cursors and magnetic buttons on every link.
- A shader or WebGL background with no rule from the subject.

## 7. This skill's own attractor

Any method has a centre of gravity. Work made with this one drifts toward a recognisable result when the hand is played lazily. Check finished work against it as strictly as against §6.

- **The subject's artefact as a skin:** a ledger for accounts, a blueprint for architecture, a terminal for developer tools, a label or a ticket for anything shipped. This is the first-order answer to most lenses ([direction.md](direction.md) §5).
- **The giant number.** A true figure at display scale is a strong device once. As a reflex it is a new hero template.
- **Editorial-utilitarian styling:** an off-white ground, near-black ink, one warm signal colour, hairlines, small technical labels, a grotesque paired with a text serif. It is the path of least resistance through every list above.
- **The annotated diagram** as decoration: leader lines, measurements and marks that measure nothing.
- **The same motion character every time.** If the last three projects were all "glide, bound", the character is no longer being chosen.
- **Restraint by default.** Choosing Quiet or Composed because it is safer to defend, not because the brief is.

Two checks keep this honest. `deal.mjs recent` lists what your recent projects committed to: typefaces, palettes, structures, motion. If the new work matches two or more of them, it is your house style showing. And in the jury's twin test, ask whether the page resembles other work made with this skill more than it resembles its subject.

## 8. Deciding a trigger

```
1. Name the pattern and its category (A, B or C).
2. If C: fix it. Stop.
3. Ask what job it does for this visitor and this content.
     no job            → remove it
     a job             → is there a more specific way to do that job, taken from the subject?
        yes, and no harder to use  → replace it
        no, or it costs usability  → keep it, and write the reason
4. If three or more triggers survive in one view (B): judge them again as a set.
5. Record the decision: kept, replaced or removed, with the reason.
```

Never replace a convention with something more complicated unless the visitor gains by it. A conventional checkout, data table, settings form or results page is usually correct. Make it excellent.

## 9. What is not a default

- A familiar pattern chosen because people need it: search first on a public service, a standard table, a conventional checkout.
- A common typeface chosen for its function, in work whose identity is carried elsewhere.
- Identical containers that hold singular content: a grid of covers, each one different.
- Restraint that is the concept, with something visibly being restrained.
- Decoration the organisation has owned and used for years, paired with substance.
- Any item in §6 that the device genuinely calls for. The registry describes habits. It is not a ban list.

## 10. Justifications that count

A justification names the visitor, the content and the mechanism. It does not name an adjective.

- Weak: "Glass panels feel modern and premium."
- Strong: "Option panels float over the live product in the configurator. Translucency keeps the product visible while choosing; blur drops to zero under `prefers-reduced-transparency`."
- Weak: "A violet gradient for energy."
- Strong: "The client's tickets and venues have carried this violet stage-light gradient for years. It appears only on the ticket component, where it means 'your seat'."

## 11. Running the scan

```bash
node "${CLAUDE_SKILL_DIR}/scripts/slop_scan.mjs" .            # before changing anything: the baseline
node "${CLAUDE_SKILL_DIR}/scripts/slop_scan.mjs" . --strict   # before handing over: exits 1 on any C finding
```

The scan reads source files. It finds C failures reliably and A patterns roughly. It cannot see composition, and a clean scan is not a compliment. Record the counts before and after in the report.
