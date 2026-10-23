# Anti-slop component atlas

A component-by-component encyclopedia. For each component it covers the real job, what the generic version does and why that fails, stronger moves, when convention is the right answer, and the content, motion, responsive, accessibility, state, build and test requirements.

**Use it by search, not by reading it all:**
```bash
grep -n "^### " references/anti-slop-component-atlas.md            # list every component
grep -n -A 16 "^### Pricing tables" references/anti-slop-component-atlas.md
```

**Rule format.** Each entry maps to the rule fields:

| Field | Meaning |
|---|---|
| **Job** | What the component is really for |
| **Generic** | The failure pattern: the common default |
| **Why it fails** | Underlying cause (generic / unresolved / incoherent / unverified) |
| **Stronger** | Better alternatives derived from content and concept |
| **Keep convention when** | Contexts where the familiar pattern is the right answer |
| **Decide** | How to choose |
| **Content · Motion · Responsive · A11y** | Requirements |
| **States** | States and edge cases to build |
| **Build** | Implementation considerations |
| **Test · Severity · Evidence** | How to verify; A = review trigger, C = failure if violated; research ledger IDs |
| **Example** | Generic → context-specific replacement |

Alternatives must never be more complex than the original unless they deliver a clear benefit. A conventional component that is the right answer should be made excellent, not different.

## Contents
- 8.1 Global layout and composition
- 8.2 Navigation
- 8.3 Heroes and opening experiences
- 8.4 Typography and content
- 8.5 Action and form controls
- 8.6 Repeated content structures
- 8.7 Complex data interfaces
- 8.8 Feedback and system states
- 8.9 Product-specific experiences
- 8.10 Experimental and custom interactions
- 8.11 Mobile-specific components
- 8.12 Footer and secondary details

---

## 8.1 Global layout and composition

### Page templates
- **Job:** Give each page type a predictable skeleton so users learn the site, while leaving room for content-specific composition.
- **Generic:** One template for every page: centred column, same hero, same card grid. **Why it fails:** Generic and incoherent. It ignores that an article, a product and a pricing page answer different questions.
- **Stronger:** Define 3–6 page *types* from the content model (story, index, object/detail, task/form, reference). Each gets a skeleton plus a signature region that varies.
- **Keep convention when:** Utility pages (legal, account, settings), where predictability matters most.
- **Decide:** List the questions each page type answers; if two types answer the same questions, merge them.
- **Content:** Each template documents required and optional slots and their content limits. **Motion:** Route transitions per type relationship (parent → child forward, peer → cross-fade). **Responsive:** Each template defines its narrow order. **A11y:** Consistent landmarks and heading pattern per type.
- **States:** Missing optional slots collapse cleanly; very long titles; no image.
- **Build:** Layout components per type; slot props, not boolean flags.
- **Test:** Contact sheet of one page per type; second-screen coherence test. **Severity:** A. **Evidence:** B1 (second-screen drift).
- **Example:** Every page has a gradient hero → Story pages open on the first paragraph with a pulled figure; object pages open on the object; index pages open on the filters.

### Header and footer composition
- **Job:** Brand presence, orientation and access to primary routes (header); completion, secondary routes, trust and legal (footer).
- **Generic:** Logo left, five links centred, a pill CTA right; a four-column link-dump footer with social icons. **Why it fails:** Generic. It says nothing about the brand and weights every link equally.
- **Stronger:** Header weight that matches the experience (an editorial masthead, an instrument bar, a wordmark-only stage). A footer that ends the narrative: next step, contact, index, a sign-off in the brand's voice.
- **Keep convention when:** Apps and e-commerce, where users expect search, account and cart in known places.
- **Decide:** What must be one tap away on every page? Only that goes in the header.
- **Content:** Real routes only; no placeholder social links. **Motion:** Condense on scroll only if it frees meaningful space. **Responsive:** Header items collapse by priority, not all at once. **A11y:** `header`/`nav`/`footer` landmarks, a skip link, labelled multiple navs.
- **States:** Logged in/out, cart count, current page, condensed, with consent bar present.
- **Build:** One header component with explicit variants; sticky via `position: sticky` and `scroll-padding-top`.
- **Test:** Focus never hidden under the sticky header (WCAG 2.4.11). **Severity:** A (C if focus is obscured). **Evidence:** E3, G6.
- **Example:** Pill CTA "Get started" in the header of a museum → the header shows today's opening hours and a "Plan your visit" link, because that's the visitor's first question.

### Section sequencing
- **Job:** Order sections so each answers the question the previous one raised.
- **Generic:** Hero → logos → 3 features → testimonials → pricing → FAQ → CTA. **Why it fails:** Generic. The template's order replaces the buyer's decision path.
- **Stronger:** Derive the sequence from the journey archetype (experience-flow.md §1): problem → mechanism → proof → cost → action, or object → detail → context → purchase.
- **Keep convention when:** The audience's questions really do follow that order (a simple SaaS page with known objections); then make each slot truthful.
- **Decide:** Write "Exists because / Follows from / Prepares" for each section (experience-flow.md §3).
- **Content:** One emphasis per section. **Motion:** Bridges between sections only where they show continuity. **Responsive:** Re-sequence for narrow screens if the first screen loses the key point. **A11y:** Heading levels reflect the sequence.
- **States:** Sections that depend on missing proof become labelled slots or are cut.
- **Build:** Sections as data-driven components so order can change without rewrites.
- **Test:** `slop_scan` template-stack trigger; removal test per section. **Severity:** A. **Evidence:** B2, F1 taxonomy.
- **Example:** Template stack for a logistics OS → photo of the yard, then the same yard as a digital twin, then the metric that changes, then the integration path, then the demo (Terminal Industries principle).

### Grids and asymmetric layouts
- **Job:** Create a recognisable spatial logic that organises content and gives the brand a structure.
- **Generic:** A 12-column grid with everything centred or in equal thirds. **Why it fails:** Generic. Equal weight for unequal content.
- **Stronger:** A grid rule derived from the concept (a shelf line, ledger columns, a film strip, a map graticule). Purposeful asymmetry (5/7, 3/9). Named grid lines for content, bleed and margin.
- **Keep convention when:** Dense app UIs and forms, where alignment and scanning matter more than expression.
- **Decide:** Can you state the grid rule in a sentence that relates to the subject?
- **Content:** Long text stays within its measure even on wide grids. **Motion:** Elements move along grid axes, not arbitrary diagonals. **Responsive:** Define how asymmetry resolves on narrow screens (stack order, which column dominates). **A11y:** DOM order equals visual reading order.
- **States:** Very long words, missing images, single-item rows.
- **Build:** CSS Grid with named lines, `minmax(0,1fr)`, subgrid where supported, container queries.
- **Test:** Overflow check at 360 px; decoration-off test. **Severity:** A. **Evidence:** B1 (decoration-off), corpus §23.
- **Example:** Centred 3-up cards → product notes hang from a left "index" column like a catalogue; images bleed to the right edge.

### Whitespace and information density
- **Job:** Control attention and scanning speed; fit density to the task.
- **Generic:** Generous padding everywhere (marketing spacing on work tools), or cramped everywhere. **Why it fails:** Incoherent. One density for different tasks.
- **Stronger:** Density as a decision per region: dense for data and comparison, airy for narrative and decisions. Use the density change itself as hierarchy.
- **Keep convention when:** Platform conventions (OS-native density in apps).
- **Decide:** How many items must the user compare at once? That sets density.
- **Content:** Real content volumes, not three tidy examples. **Motion:** None needed. **Responsive:** Density can increase on large screens for pro tools; never shrink text below legibility. **A11y:** Spacing survives text-spacing overrides (WCAG 1.4.12).
- **States:** Compact/comfortable toggles in pro tools.
- **Build:** A spacing scale plus density tokens (`--row-height`).
- **Test:** Task timing on the dense view; text-spacing bookmarklet. **Severity:** A. **Evidence:** B2 (generous spacing everywhere).
- **Example:** Admin table with 32 px row padding → 40 px rows with tabular figures, plus a density toggle.

### Editorial layouts
- **Job:** Make long reading pleasurable and let images and annotations argue alongside the text.
- **Generic:** A centred 700 px column with fade-in images and a giant drop cap. **Why it fails:** Generic. Images become decoration, not evidence.
- **Stronger:** Text column plus margin column for notes and figures; figures that break the grid when they carry the argument; pull quotes only when they advance the story.
- **Keep convention when:** Simple posts and documentation, where a clean column is the best reading experience.
- **Decide:** Does each figure have a caption that says why it's there?
- **Content:** Captions, credits, sources. **Motion:** Figures change with reading position only if they explain something (scrollytelling). **Responsive:** Margin notes become inline or collapsible. **A11y:** Figures with `figcaption`; charts with text alternatives.
- **States:** Missing image, very long caption, footnotes.
- **Build:** Named grid areas; `text-wrap: pretty`; `hanging-punctuation` where supported.
- **Test:** Measure 45–75 characters; reading on a 390 px phone. **Severity:** A. **Evidence:** Corpus §18 (The Pudding).
- **Example:** Stock photos between paragraphs → annotated archival documents in the margin, linked to the sentences they prove.

### Full-bleed content
- **Job:** Give the most important visual its full frame; create pacing breaks.
- **Generic:** Every section full-bleed with a background image and centred text. **Why it fails:** Generic. When everything is a climax, nothing is.
- **Stronger:** Ration full-bleed moments to content that deserves them. Mix contained and bleed to create rhythm.
- **Keep convention when:** Immersive or photographic brands where the image *is* the content.
- **Decide:** Would the content lose meaning at 66% width? If not, contain it.
- **Content:** Art-directed crops per breakpoint. **Motion:** Subtle scale or scrub only if the frame tells a story. **Responsive:** `<picture>` crops so the subject survives. **A11y:** Text on images meets contrast at the worst point.
- **States:** Image fails to load (background colour plus caption).
- **Build:** Grid `full` column; `object-fit`/`object-position` per crop.
- **Test:** Contact sheet at 360/768/1440. **Severity:** A. **Evidence:** Corpus §17, §23.
- **Example:** Five full-bleed photo sections → one full-bleed yard at dusk, then contained diagrams.

### Overlapping and layered compositions
- **Job:** Express relationships (annotation on object, caption on image, depth in a scene).
- **Generic:** Randomly overlapping cards and images "for depth". **Why it fails:** Incoherent. Overlap without a relationship reads as clutter.
- **Stronger:** Overlap where one thing comments on another; consistent layer logic (what sits above what, and why).
- **Keep convention when:** Simple stacking (no overlap) is clearer for task-focused pages.
- **Decide:** Name the relationship that each overlap expresses.
- **Content:** Annotations are real (labels, measurements, notes). **Motion:** Layers can separate on interaction to reveal structure. **Responsive:** Overlaps resolve to stacked order on narrow screens. **A11y:** Reading order in DOM; nothing essential hidden under another layer.
- **States:** Text length changes don't collide.
- **Build:** Grid areas overlapping (`grid-area` on the same cells) instead of absolute positioning where possible.
- **Test:** Long text plus 200% zoom. **Severity:** A. **Evidence:** —
- **Example:** Floating screenshot collage → the product UI with callouts pinned to the real controls they describe.

### Background graphics
- **Job:** Atmosphere and identity behind content, carrying the concept's material.
- **Generic:** Blurred gradient orbs, dot grids, noise overlays, animated mesh gradients. **Why it fails:** Generic. Stock "premium" signals with no meaning; costly paint.
- **Stronger:** A background drawn from the subject: contour lines from the track's topography, ledger rules, a fabric weave, a blueprint grid that aligns with the content grid.
- **Keep convention when:** Plain grounds are usually the right default; a background is an addition, not an obligation.
- **Decide:** Removal test: if nothing is lost, remove it.
- **Content:** None of it carries information unless designed to. **Motion:** Ambient motion only if slow, pausable and reduced-motion aware. **Responsive:** Simplify or remove on mobile. **A11y:** Contrast for text over it; `prefers-reduced-transparency`.
- **States:** —
- **Build:** SVG patterns or CSS; avoid huge animated filters; `pointer-events: none`.
- **Test:** Paint profiling on mobile; `slop_scan` orb/grain/glow triggers. **Severity:** A. **Evidence:** B3, B5, corpus §1 (contours).
- **Example:** Purple blur orbs → faint ledger rules that the content's baselines actually sit on.

### Responsive composition
- **Job:** Keep the composition's idea intact as space changes.
- **Generic:** Desktop layout stacked into one long column at 768 px. **Why it fails:** Unresolved. The idea and hierarchy dissolve.
- **Stronger:** Define the composition's essence (e.g. "object left, notes right") and its narrow translation (e.g. "object, then notes as a swipeable strip"). Re-sequence content for narrow reading.
- **Keep convention when:** Simple documents.
- **Decide:** Does the first narrow screen deliver the page's main point?
- **Content:** Narrow-specific copy lengths where needed. **Motion:** Separate mobile timelines. **Responsive:** Container queries for components; intrinsic layouts first. **A11y:** Reflow at 320 px without two-dimensional scrolling.
- **States:** Landscape phone; tablet with keyboard.
- **Build:** `clamp()` scales, container queries, `svh` units.
- **Test:** `audit_page` at 360, 390, 768, 1024, 1440 and landscape. **Severity:** C if broken (overflow, lost content); A otherwise. **Evidence:** G-section, corpus §12.
- **Example:** Two-column hero squeezed to 390 px → the object first at full width, a headline overlaid at the bottom, notes in a horizontal strip.

### Long-form page flow
- **Job:** Keep users oriented and moving through long pages.
- **Generic:** An endless scroll of same-weight sections with fade-ins. **Why it fails:** Generic and unresolved. No orientation, no pacing.
- **Stronger:** Chapters with a visible table of contents or progress rail (Shopify Editions' index); pacing changes (dense → open → full-bleed); deep links per chapter.
- **Keep convention when:** Short pages don't need extra orientation chrome.
- **Decide:** Over about four screens, add orientation.
- **Content:** Chapter titles that work as a summary. **Motion:** Progress indicator scroll-linked; restrained section transitions. **Responsive:** The TOC collapses to a menu or chip. **A11y:** Headings structure; TOC as `nav` with `aria-current`.
- **States:** Deep link into the middle; back-navigation restores position.
- **Build:** IntersectionObserver for the active chapter; anchors with `scroll-margin-top`.
- **Test:** Load a deep link; keyboard through the TOC. **Severity:** A. **Evidence:** Corpus §3.
- **Example:** A 50-screen feature page → five chapters with an index rail that doubles as progress.

---

## 8.2 Navigation

### Utility bars
- **Job:** Secondary, task-oriented links (locale, account, support, store finder) above the main nav.
- **Generic:** A promo banner bar ("Free shipping! 🎉") above everything. **Why it fails:** Generic. It costs vertical space for low-value noise.
- **Stronger:** Only persistent utilities users need; dismissible announcements with real, time-bound information.
- **Keep convention when:** E-commerce and multinational sites, where locale and account are needed.
- **Decide:** Is it used on more than 10% of visits? If not, move it into a menu.
- **Content:** Accurate, dated announcements. **Motion:** No marquees for essential info. **Responsive:** Collapses into the menu. **A11y:** `nav` with a label; marquee pausable (WCAG 2.2.2).
- **States:** Dismissed (persisted), locale switched.
- **Build:** Persist dismissal; don't cause CLS (reserve space or overlay).
- **Test:** CLS on load. **Severity:** A. **Evidence:** F1.
- **Example:** Scrolling promo marquee → a static line: "Orders placed after 2 pm ship Monday", with a link to the delivery page.

### Main navigation
- **Job:** Show what the site contains and where the user is; let them move between top-level areas.
- **Generic:** Five vague links (Product, Solutions, Resources, Company, Pricing) for every company. **Why it fails:** Generic. The labels don't reveal the content.
- **Stronger:** Labels in the user's words and the domain's nouns; a structure derived from content (by audience, by object, by task); a distinctive form when the concept supports it (an index, a specimen mosaic, a map).
- **Keep convention when:** Most of the time the *form* should be conventional. Distinctiveness comes from the labels and the composition.
- **Decide:** Card-sort the content mentally; can a new user predict what's behind each label?
- **Content:** 4–7 top-level items; no "Solutions" without content. **Motion:** Submenus enter from their trigger; fast exits. **Responsive:** Priority+ pattern or a menu button. **A11y:** `nav` landmark; `aria-current="page"`; disclosure-button pattern for submenus (not `role="menu"` for site nav).
- **States:** Current, hover, focus, expanded, with notification.
- **Build:** Real links (crawlable), prefetch on intent.
- **Test:** Keyboard: Tab through, Enter/Space opens submenus, Escape closes. **Severity:** C if not keyboard-operable. **Evidence:** E4.
- **Example:** "Solutions ▾" → "For bookkeepers · For accountants · For small firms", matching how buyers self-identify.

### Transparent and sticky headers
- **Job:** Keep navigation reachable without stealing content space; let hero imagery breathe.
- **Generic:** A transparent header over a hero, white text that becomes unreadable over light images, then a heavy sticky bar with blur. **Why it fails:** Unresolved. Contrast fails over images; it permanently eats space.
- **Stronger:** Contrast-safe treatment (scrim, solid on scroll, colour adapting per section); sticky only if users need nav mid-page; hide on scroll down, show on scroll up for long reads.
- **Keep convention when:** Apps and e-commerce: a persistent sticky header with search and cart.
- **Decide:** Measure how often mid-page navigation is needed.
- **Content:** —. **Motion:** Short (≤ 200 ms) show/hide; no bouncing. **Responsive:** Shorter sticky height on mobile; never more than about 15% of the viewport. **A11y:** Focus not obscured (`scroll-padding-top`); the header reappears when an element inside receives focus.
- **States:** Over hero, scrolled, hidden, focus-inside, menu open.
- **Build:** `position: sticky`; IntersectionObserver for the hero boundary; no scroll-event-heavy logic.
- **Test:** Tab to links under the header at 390 px; contrast over the worst hero frame. **Severity:** C for obscured focus. **Evidence:** E3, G6 (audit "obscured").
- **Example:** Blurred glass bar always visible → a 48 px bar that hides on downward reading and returns on upward scroll or focus.

### Minimal navigation
- **Job:** Reduce chrome for immersive or single-purpose experiences.
- **Generic:** A lone hamburger icon on desktop that hides five links. **Why it fails:** Unresolved. Navigation costs extra clicks and is less discoverable.
- **Stronger:** Visible minimal links (2–3), an index link, or a "contents" label instead of an icon; a fully hidden nav only when exploration *is* the experience, plus an escape hatch.
- **Keep convention when:** If there are more than three destinations, show them on desktop.
- **Decide:** Count destinations and their visit frequency.
- **Content:** A text label ("Menu", "Index") with the icon. **Motion:** Menu reveal in the brand's motion language. **Responsive:** —. **A11y:** A button with a name and `aria-expanded`.
- **States:** Open, closed, current page.
- **Build:** See "Full-screen menus".
- **Test:** First-time user finds "Contact" in under 5 s. **Severity:** A. **Evidence:** Corpus §11 (unlabeled buttons).
- **Example:** Hamburger-only desktop nav → "Work · Studio · Contact" set small in the corner, with the index as a full-screen overlay.

### Full-screen menus
- **Job:** Present navigation as an event: a large index, often with previews.
- **Generic:** A black overlay with giant links that fade up one by one, and a cursor-following image preview. **Why it fails:** Generic. An award-site default; slow to use.
- **Stronger:** Menus that reveal the site's structure (an index with counts, a map, a specimen grid); fast to scan; previews only if they help choose.
- **Keep convention when:** Mobile menus are full-screen by necessity. Make them fast and clear.
- **Decide:** Can a user pick a destination within 1 s of opening?
- **Content:** Real counts or descriptions if useful. **Motion:** ≤ 400 ms in; ≤ 200 ms out; stagger capped. **Responsive:** Same structure; previews dropped on touch. **A11y:** Modal dialog behaviour: focus in, trap, Escape, focus back to trigger, background inert.
- **States:** Open, closing, nested level, current page.
- **Build:** `<dialog>` or `inert` on the background; scroll lock without layout jump (`scrollbar-gutter: stable`).
- **Test:** Keyboard trap check; open, then Tab cycles inside. **Severity:** C if focus escapes or hides behind. **Evidence:** G6 (focus on invisible elements).
- **Example:** Giant fade-up words → a two-column index: project names with year and discipline, filterable by typing.

### Mega menus
- **Job:** Expose a large IA (dozens of destinations) in one view.
- **Generic:** Huge panels with icons, descriptions and a promo card for everything. **Why it fails:** Generic and incoherent. Hard to scan; looks like a template.
- **Stronger:** Grouped by user task or audience; scannable columns; one featured item only if it's genuinely new; keyboard-first.
- **Keep convention when:** Large catalogues and enterprise products.
- **Decide:** Tree-test the grouping (mentally, or with real users).
- **Content:** Short labels with one-line descriptions only where ambiguous. **Motion:** Instant or ≤ 150 ms; hover intent delay (~100 ms) to avoid flicker. **Responsive:** Becomes a drill-down list on mobile. **A11y:** Disclosure buttons; Escape closes; focus moves logically.
- **States:** Hover-intent, open, keyboard-open, nested.
- **Build:** Avoid hover-only open; support click and keyboard; close on outside click.
- **Test:** Diagonal mouse movement into the panel doesn't close it. **Severity:** A (C if hover-only). **Evidence:** E4.
- **Example:** Icon grid of 24 products → three columns by job ("Get paid", "Pay others", "Report") with product names under each.

### Sidebars
- **Job:** Persistent navigation for apps, docs and dashboards.
- **Generic:** A dark sidebar with icon plus label for 20 items, all the same weight. **Why it fails:** Generic. No hierarchy, no prioritisation.
- **Stronger:** Grouped sections, favourites or recents on top, collapsible groups, a clear current location, counts where useful.
- **Keep convention when:** App shells benefit from the familiar pattern.
- **Decide:** Which 5 items are used daily? Make them prominent.
- **Content:** Clear labels; avoid icon-only collapsed states without tooltips. **Motion:** Collapse animation ≤ 200 ms; content reflow without jank. **Responsive:** Becomes a drawer below about 1024 px. **A11y:** `nav` landmark; `aria-current`; collapsible groups as disclosures.
- **States:** Collapsed, expanded, active, badge, loading items, permission-hidden.
- **Build:** Persist collapse state; avoid layout shift on load.
- **Test:** Keyboard through groups; collapsed state with tooltips on focus. **Severity:** A. **Evidence:** Corpus §21.
- **Example:** 20 flat items → "Today" (3 items), "Ledgers" (by client), "Reports", "Settings", with unmatched-transaction counts.

### Breadcrumbs
- **Job:** Show location in a deep hierarchy and allow quick ascent.
- **Generic:** Breadcrumbs on flat sites, or crumbs that just repeat the page title. **Why it fails:** Unresolved. Noise without orientation value.
- **Stronger:** Only for hierarchies of three levels or more; the current page is not a link; truncate the middle on mobile.
- **Keep convention when:** Always conventional in form. Excellence is correctness.
- **Decide:** Is the hierarchy real and stable?
- **Content:** Short labels. **Motion:** None. **Responsive:** Collapse middle levels into a "…" disclosure. **A11y:** `nav aria-label="Breadcrumb"`, ordered list, `aria-current="page"`.
- **States:** Long labels, deep paths.
- **Build:** Structured data (`BreadcrumbList`) for SEO.
- **Test:** Screen reader announces "Breadcrumb navigation". **Severity:** A. **Evidence:** E4.
- **Example:** Home / Page on a 2-level site → removed; a back link to the parent instead.

### Navigation drawers
- **Job:** Off-canvas navigation on small screens or secondary panels.
- **Generic:** A slide-in drawer with a bouncy spring and a dimmed backdrop, but focus can still reach the page behind. **Why it fails:** Unresolved. Accessibility failure; motion doesn't match the brand.
- **Stronger:** A drawer whose edge, origin and motion match the trigger and the brand; content prioritised; easy dismissal.
- **Keep convention when:** Almost always conventional in behaviour.
- **Decide:** Is a drawer better than a full-screen menu or bottom sheet for this content length?
- **Content:** Primary destinations first. **Motion:** Slide from the trigger side; ≤ 300 ms; reduced motion = fade. **Responsive:** Width ≤ 85% so the backdrop is visible. **A11y:** Modal: focus trap, Escape, inert background, return focus.
- **States:** Open, closing, nested drill-down.
- **Build:** `<dialog>` or Radix/Base UI Dialog; scroll lock.
- **Test:** `audit_page` focus walk with the drawer closed (no focus on hidden links). **Severity:** C (focus on hidden links). **Evidence:** G6.
- **Example:** Springy drawer → a drawer that slides on the same axis as the page's chapter transitions.

### Tab bars
- **Job:** Primary destinations in app-like mobile experiences.
- **Generic:** Five icon tabs with ambiguous icons and no labels. **Why it fails:** Unresolved. Ambiguous icons hurt discoverability.
- **Stronger:** 3–5 destinations with labels; a clear active state; badges only for real counts.
- **Keep convention when:** Mobile web apps with frequent switching.
- **Decide:** Are destinations peers used often? If not, use a menu.
- **Content:** Labels of 1–2 words. **Motion:** Instant switch; subtle indicator movement. **Responsive:** Becomes a sidebar on larger screens. **A11y:** It's navigation, not ARIA tabs (unless it switches panels in place). `aria-current`.
- **States:** Active, badge, disabled (avoid).
- **Build:** `position: fixed` with `env(safe-area-inset-bottom)` padding.
- **Test:** Doesn't overlap content or the software keyboard. **Severity:** A. **Evidence:** —
- **Example:** Unlabelled icons → "Today · Clients · Inbox · Reports" with labels.

### Floating navigation
- **Job:** Keep navigation available as a compact, persistent element.
- **Generic:** A floating pill nav with blur and a bright CTA chip (an award-site default). **Why it fails:** Generic. Imitation of winners; often covers content.
- **Stronger:** Only if the content benefits from an unobstructed frame; position and form derived from the concept (e.g. a ruler, a timeline scrubber, a player control).
- **Keep convention when:** Rarely needed; standard headers work.
- **Decide:** Reference-distance test: would someone call it "that award-site nav"?
- **Content:** —. **Motion:** Minimal. **Responsive:** Must not cover thumbs' primary zone or content edges. **A11y:** Focus not obscured; `nav` landmark.
- **States:** Over light/dark content (contrast adapts), menu open.
- **Build:** Sticky with safe-area insets.
- **Test:** Contrast on every section background. **Severity:** A. **Evidence:** B7.
- **Example:** Generic floating pill → a scrubber-shaped chapter control that shows reading position (for a long-form story).

### Mobile navigation
- **Job:** Fast access to destinations on small, touch screens.
- **Generic:** A hamburger opening a list of desktop links in tiny type. **Why it fails:** Unresolved. Not designed for thumbs or for priority.
- **Stronger:** Prioritised destinations; big targets; search near the top when the catalogue is big; current location visible; a bottom tab bar for apps.
- **Keep convention when:** The hamburger is acceptable when labelled ("Menu").
- **Decide:** What are the top 3 mobile tasks? Make them reachable in one tap.
- **Content:** Shorter labels if needed. **Motion:** Fast, brand-consistent. **Responsive:** —. **A11y:** Button name, `aria-expanded`, modal focus management, targets ≥ 24 px (44 px preferred).
- **States:** Open, nested, current.
- **Build:** Avoid body scroll lock bugs on iOS (use `<dialog>` or proven libraries).
- **Test:** One-handed reachability; screen reader announcement. **Severity:** C if inaccessible. **Evidence:** E3.
- **Example:** Hamburger with 14 links → "Menu" button opening search plus 4 primary destinations plus "More".

### Scroll-aware navigation
- **Job:** Adapt navigation to reading context (condense, hide, show progress).
- **Generic:** Header shrinks, changes colour and adds a shadow on every scroll pixel. **Why it fails:** Incoherent. Constant motion distracts; scroll handlers jank.
- **Stronger:** One meaningful change at a threshold (enter article → show progress and title; leave hero → solid background).
- **Keep convention when:** Simple sticky headers are often enough.
- **Decide:** What does the user need once they've started reading?
- **Content:** The current section title in the condensed header for long docs. **Motion:** Threshold-based, not continuous. **Responsive:** Same logic. **A11y:** Changes don't move focus; hidden header returns on focus.
- **States:** Above threshold, below, hidden, reduced motion (instant swap).
- **Build:** IntersectionObserver sentinels, not scroll listeners.
- **Test:** Performance trace during scroll; no layout shift. **Severity:** A. **Evidence:** D1.
- **Example:** Shrinking-logo header → on an article, the header becomes a thin progress bar plus the chapter title.

### Active states and orientation cues
- **Job:** Tell users where they are and what's selected.
- **Generic:** Colour-only active state; a hover effect identical to the active state. **Why it fails:** Unresolved. Fails colour-blind users and confuses hover with location.
- **Stronger:** Active state with shape or weight (underline, marker, bold) plus `aria-current`; distinct hover; the page title matches the nav label.
- **Keep convention when:** Always required.
- **Decide:** Squint test: can you tell the current page in a greyscale screenshot?
- **Content:** —. **Motion:** The indicator can glide between items (shared element) to show change. **Responsive:** Visible in collapsed menus. **A11y:** `aria-current="page"`; 3:1 contrast for the indicator.
- **States:** Current, ancestor-of-current, hover, focus.
- **Build:** Derived from the router, not hardcoded.
- **Test:** Greyscale screenshot; screen reader announces "current page". **Severity:** C if location is invisible to assistive tech. **Evidence:** E4.
- **Example:** Blue text for the current link → a 2 px ink underline that slides between items.

---

## 8.3 Heroes and opening experiences

Not every project needs a spectacular hero. Often the strongest opening is the content itself: the product, the first paragraph, the search box.

### Standard heroes
- **Job:** State what this is and for whom, and offer the next step, within the first screen.
- **Generic:** Centred giant headline, a one-line subhead, two buttons (primary plus "Learn more"), a gradient or blob background. **Why it fails:** Generic. It is the most common opening on the web and passes the substitution test for any company.
- **Stronger:** Lead with the product's mechanism or the user's situation; a headline with a testable claim; one primary action that names its consequence; a visual that is evidence (real UI, real object, real place).
- **Keep convention when:** A clear headline plus action is right for many SaaS and service pages. Make it specific, not centred-by-default.
- **Decide:** Substitution test on the headline and visual.
- **Content:** The headline names the user, task or result; no "unlock", "seamless", "next-gen". **Motion:** One intro at most; content visible immediately (no JS-gated reveal of the LCP). **Responsive:** Narrow version leads with the key line; the visual is cropped intentionally. **A11y:** The `h1` is the headline; buttons are named.
- **States:** Logged-in variant; locale with longer copy.
- **Build:** LCP element server-rendered; `fetchpriority="high"` on the hero image.
- **Test:** 5-second test (recall); lab LCP. **Severity:** A. **Evidence:** B1, B3, B5, F2.
- **Example:** "Unlock your financial potential" over a violet gradient → "Reconcile 40 client bank feeds before lunch" beside a live ledger reconciling a sample month.

### Split-screen compositions
- **Job:** Pair two things that belong together (text and object, before and after, two audiences).
- **Generic:** 50/50 text left, stock image right. **Why it fails:** Generic. The split expresses no relationship.
- **Stronger:** A split that *means* something: before/after, problem/solution, two sides of a market, debit/credit; proportions that reflect importance.
- **Keep convention when:** Simple product pages where text plus image is enough. Use a real image.
- **Decide:** Name the relationship between the halves.
- **Content:** Both halves earn their space. **Motion:** Interaction between halves (a slider, a hover link) only if it clarifies the relationship. **Responsive:** Stack in the order that preserves meaning (problem before solution). **A11y:** Reading order matches the visual order.
- **States:** —
- **Build:** Grid; avoid `order` hacks that desync DOM and visual order.
- **Test:** Narrow reading order. **Severity:** A. **Evidence:** —
- **Example:** Text plus stock laptop photo → left: a client's messy bank feed; right: the same rows reconciled; a draggable divider between.

### Asymmetric heroes
- **Job:** Create tension and focus through imbalance.
- **Generic:** Arbitrary off-centre placement plus oversized type. **Why it fails:** Incoherent. Asymmetry without a rule.
- **Stronger:** Asymmetry that follows the grid rule (creative-process.md Phase E); a dominant element balanced by a precise small one.
- **Keep convention when:** —
- **Decide:** Can you explain where every element sits relative to the grid?
- **Content:** —. **Motion:** Elements can enter along the asymmetry's axis. **Responsive:** Define which element stays dominant. **A11y:** —
- **States:** Long headlines.
- **Build:** Named grid lines.
- **Test:** Overflow and wrapping at 360 px. **Severity:** A. **Evidence:** —
- **Example:** Random tilt → the headline hangs from the same left "index" column as every later section.

### Typography-led heroes
- **Job:** Let words carry identity when the message is the product (editorial, studios, manifestos).
- **Generic:** A 12 vw all-caps grotesk headline, one word in italic serif or accent colour. **Why it fails:** Generic. A second-order and award-site default.
- **Stronger:** A typeface with a concept reason (credit lettering for a film house, hatched type for a weaving heritage); typographic behaviour tied to meaning (words that are also links, a headline that sets like a ledger entry).
- **Keep convention when:** —
- **Decide:** Would the headline still work set in the brand's body face? If yes, the display face isn't doing a job.
- **Content:** Copy worth that size. **Motion:** Kinetic only if the words' meaning moves; readable every frame. **Responsive:** `clamp()` with sensible minimums; `text-wrap: balance`. **A11y:** Real text (not images or canvas); split text keeps an accessible label.
- **States:** Translation length; very narrow screens.
- **Build:** Font loading with fallback metrics; avoid CLS on swap.
- **Test:** CLS on font swap; 320 px reflow. **Severity:** A. **Evidence:** B5, corpus §12.
- **Example:** Giant caps with one italic word → the studio name set in its own credit-roll lettering, with the latest project listed beneath like a film credit.

### Image-led heroes
- **Job:** Let a real image establish place, product or mood immediately.
- **Generic:** A stock photo with a dark overlay and centred white text. **Why it fails:** Generic. Stock imagery and an overlay as a crutch.
- **Stronger:** Art-directed photography of the real thing; text placed where the image composition leaves room (not over the subject); a crop strategy per breakpoint.
- **Keep convention when:** Hospitality, real estate, fashion, where the image is the decision driver.
- **Decide:** Is the photo specific enough that a competitor couldn't use it?
- **Content:** Alt text describing the scene's relevance. **Motion:** A slow scrub only if the image hides a story; never Ken Burns by default. **Responsive:** `<picture>` crops. **A11y:** Contrast at the worst text position; no text baked into images.
- **States:** Image loading (colour placeholder from the image's dominant colour).
- **Build:** AVIF/WebP, `fetchpriority="high"`, dimensions, no lazy-load.
- **Test:** Lab LCP; contrast check. **Severity:** A (C if fabricated imagery is presented as real). **Evidence:** F2, corpus §12.
- **Example:** Stock mountain with overlay → the resort's own dusk render with the wordmark set in the sky area, cropped vertically on phones to keep the building.

### Product demonstrations
- **Job:** Show the product doing its job in seconds.
- **Generic:** A floating, tilted, glowing fake dashboard with meaningless charts. **Why it fails:** Unverified and generic. A fake product is a false claim.
- **Stronger:** The real UI (screenshot, video or live component) performing the core task with realistic, labelled sample data; a short loop showing cause → effect.
- **Keep convention when:** A plain, crisp screenshot is better than a fake animated one.
- **Decide:** Is everything shown actually in the product?
- **Content:** Sample data that looks like the user's world (labelled "sample"). **Motion:** Demonstrates causality; pausable; loops ≤ 10 s or user-driven. **Responsive:** Crop to the relevant part rather than shrinking a full UI. **A11y:** Text description of what the demo shows; a pause control; captions on video.
- **States:** Poster frame; reduced motion = a static annotated screenshot.
- **Build:** Live components share code with the real product when possible (prevents drift).
- **Test:** Product team verifies accuracy. **Severity:** C if fake. **Evidence:** Corpus §15, §16.
- **Example:** Glowing fake KPI cards → a 6-second loop of a real bank feed row being matched to an invoice, with a "sample data" label.

### Interactive canvases
- **Job:** Invite manipulation as the first act (configure, draw, explore).
- **Generic:** A particle field reacting to the cursor that does nothing else. **Why it fails:** Generic decoration.
- **Stronger:** The interaction expresses the product or concept (draw a route, mix a colour, assemble a product) and leads into content.
- **Keep convention when:** —
- **Decide:** Interaction test: what does manipulating it teach?
- **Content:** A first-frame instruction or a visible affordance. **Motion:** Responsive to input with no lag; idle state hints at interactivity. **Responsive:** Touch-equivalent gestures; simplified on mobile. **A11y:** Keyboard alternative; a "skip interaction" link; an HTML description of the result.
- **States:** Idle, interacting, completed, no WebGL, reduced motion.
- **Build:** Lazy init near the viewport; pause off-screen; dispose on unmount.
- **Test:** Headed browser and a real phone; memory stable. **Severity:** A (C if it gates content without an alternative). **Evidence:** G7, G8.
- **Example:** Cursor particles → a paint-chip canvas where dragging mixes the brand's actual pigment range and shows the product that uses it.

### Data-driven openings
- **Job:** Open with a real number or visualisation that frames the story.
- **Generic:** A huge number with a small label, a gradient accent and supporting "stats". **Why it fails:** Generic and often unverified. A default treatment; numbers without source.
- **Stronger:** One sourced figure in context (comparison, trend), with the visualisation type chosen by the data, and a link to methodology.
- **Keep convention when:** Reports and annual reviews, if sourced.
- **Decide:** Does the number change what the reader believes?
- **Content:** Source and date. **Motion:** Count-ups only if they convey magnitude (and are skipped under reduced motion). **Responsive:** Chart simplifies on mobile (fewer ticks, direct labels). **A11y:** The number is text; the chart has a text summary.
- **States:** Data unavailable (explain).
- **Build:** Number formatting per locale; tabular figures.
- **Test:** Source verified. **Severity:** C if unsourced or invented. **Evidence:** B5 (big-number default), security §8.
- **Example:** "99.9% uptime ✨" → "Median close time fell from 9 days to 3 for 212 firms in 2025 (method ↗)", with a small slope chart.

### Editorial introductions
- **Job:** Open a story with voice, context and an invitation to read.
- **Generic:** A full-screen photo with the title overlay and "Scroll ↓". **Why it fails:** Generic. Delays reading.
- **Stronger:** Title, deck (standfirst) and byline set with typographic care; the first paragraph visible on the first screen; the lead image as evidence with a caption.
- **Keep convention when:** Classic article openings are conventional for good reason.
- **Decide:** Can the reader start reading without scrolling?
- **Content:** Deck that states the argument. **Motion:** Minimal. **Responsive:** Title scales with `clamp()`; image below the deck on mobile. **A11y:** `h1`, byline and date as text; image alt or caption.
- **States:** No lead image.
- **Build:** Article schema metadata.
- **Test:** Reading-start time. **Severity:** A. **Evidence:** Corpus §18.
- **Example:** Full-bleed photo plus "scroll" hint → headline, a two-line deck, byline and the first paragraph, with an archival photo floated beside.

### Full-screen experiences
- **Job:** Immerse the visitor in a world from the first frame.
- **Generic:** A full-screen WebGL scene with an "Enter" button and no information. **Why it fails:** Unresolved. Gates content; fails on slow devices.
- **Stronger:** The first frame communicates (the title and the world's rule); the experience starts without a gate unless audio or a ritual justifies one; a skip to content is always available.
- **Keep convention when:** —
- **Decide:** What does a visitor understand in the first 5 seconds?
- **Content:** An HTML layer with the same information. **Motion:** Orientation first, spectacle second. **Responsive:** Quality tiers; poster fallback. **A11y:** Keyboard paths, skip link, reduced-motion version, `h1` and landmarks.
- **States:** Loading (real progress), ready, no WebGL, lost context, reduced motion.
- **Build:** Poster as LCP; lazy scene; dispose.
- **Test:** `audit_page` (h1, landmarks, focus) plus a headed browser. **Severity:** C if content is unreachable without the experience. **Evidence:** G1, G2, G7, corpus §2, §8, §13.
- **Example:** Black screen with "ENTER" → the exhibition's arch with the title, opening dates and a "Book" link visible while the scene streams in behind.

### Preloaders and entry transitions
- **Job:** Bridge real loading time, or mark a deliberate threshold.
- **Generic:** A monogram animation plus a 0–100% counter driven by a timer. **Why it fails:** Unverified (fake progress) and generic.
- **Stronger:** No preloader when content can render progressively. If assets must load: real progress (bytes or assets), a meaningful poster, a skip once usable, a short exit into content.
- **Keep convention when:** Heavy 3D or audio experiences.
- **Decide:** Measure: does content exist before the loader would end? Then remove the loader.
- **Content:** Useful information during the wait (title, date, instructions). **Motion:** The exit transition continues into the first scene. **Responsive:** The mobile budget is strict; never longer than the real load. **A11y:** `aria-busy`/status text; respects reduced motion.
- **States:** Slow network, error (retry), cached revisit (skip entirely).
- **Build:** `Promise.all` on real asset loads; LoadingManager for three.js.
- **Test:** `slop_scan` fake-progress rule; throttled load. **Severity:** C (fake percentages); A otherwise. **Evidence:** G7, motion-intelligence §6.
- **Example:** Timer-based 0–100% counter → the poster frame with the title and a thin bar tied to glTF bytes loaded; skipped on revisit.

---

## 8.4 Typography and content

### Display headings
- **Job:** Establish voice and hierarchy at the largest scale.
- **Generic:** Giant tracked-out caps or a big centred sans in the default family; one italic accent word. **Why it fails:** Generic. Volume replaces voice.
- **Stronger:** A display face chosen for concept and function; size from hierarchy; distinctive setting (ligatures, alternates, optical sizes, tight but readable leading).
- **Keep convention when:** App UIs: modest headings are better.
- **Decide:** Swap the display face for the body face. Does the identity collapse? It should a little, not completely.
- **Content:** Short, specific. **Motion:** Minimal, or meaningful kinetic. **Responsive:** `clamp()`; `text-wrap: balance`. **A11y:** Correct heading level; no text in images.
- **States:** Long translations; very narrow screens.
- **Build:** Variable font axes; fallback metrics.
- **Test:** Font-swap CLS. **Severity:** A. **Evidence:** B5, B6.
- **Example:** Space Grotesk 120 px caps → a condensed archival face (licence checked) at 72 px, set like the brand's historic shipping labels.

### Body text
- **Job:** Comfortable, sustained reading.
- **Generic:** 14–15 px light grey on white, 100% width lines. **Why it fails:** Unresolved. Hard to read; fails contrast.
- **Stronger:** 16–20 px, leading 1.4–1.7, measure 45–75 ch, ink-level contrast, a family chosen for reading.
- **Keep convention when:** Always conventional. Excellence is in the details.
- **Decide:** Read a full paragraph on a phone at arm's length.
- **Content:** Short paragraphs for screens. **Motion:** None. **Responsive:** Slightly larger on large screens; never below 16 px for body. **A11y:** 4.5:1 contrast; survives 200% zoom and spacing overrides.
- **States:** RTL, long words.
- **Build:** `max-inline-size: 65ch`; `text-wrap: pretty`; `hyphens: auto` with `lang`.
- **Test:** Contrast; reflow. **Severity:** C if contrast fails. **Evidence:** E-section.
- **Example:** 15 px #9CA3AF body → 18 px ink at 1.6 leading, 64 ch measure.

### Captions and metadata
- **Job:** Context (source, date, author, credit) without competing with content.
- **Generic:** Tiny, low-contrast grey; or `A · B · C` middle-dot strings with tracked caps everywhere. **Why it fails:** Generic and unresolved. Template chrome; illegible.
- **Stronger:** Legible small text (≥ 13 px), a structured order, only metadata users need; a distinct style from body.
- **Keep convention when:** —
- **Decide:** Remove each piece of metadata. Does anyone miss it?
- **Content:** Accurate dates and credits. **Motion:** None. **Responsive:** May wrap to two lines. **A11y:** 4.5:1; `<time datetime>`.
- **States:** Missing author or date.
- **Build:** Semantic elements (`time`, `figcaption`, `cite`).
- **Test:** Contrast. **Severity:** A (C if contrast fails). **Evidence:** B5.
- **Example:** "NEWS · 5 MIN READ · AI" in 10 px caps → "Published 3 March 2026 · 5-minute read", in 14 px muted ink.

### Labels
- **Job:** Name UI elements and categories precisely.
- **Generic:** Tracked uppercase eyebrows above every heading ("FEATURES", "WHY US"). **Why it fails:** Generic template chrome that encodes nothing.
- **Stronger:** Labels only where they classify (category, status, step); sentence case; consistent vocabulary.
- **Keep convention when:** Form labels, table headers, status labels: always needed and conventional.
- **Decide:** Does the label tell the user something the heading doesn't?
- **Content:** Domain nouns. **Motion:** —. **Responsive:** —. **A11y:** Programmatic association for form labels.
- **States:** —
- **Build:** —
- **Test:** `slop_scan` eyebrow trigger. **Severity:** A. **Evidence:** B5.
- **Example:** "WHY TIDYLEDGER" eyebrow → removed; the heading itself says "Why bookkeepers switch".

### Technical annotations
- **Job:** Explain parts, measurements or behaviour directly on a visual.
- **Generic:** Decorative callout lines with fake labels ("Precision", "Power") on a product render. **Why it fails:** Generic and unverified.
- **Stronger:** Real specs and part names; annotation style from the domain's drawing conventions; interactive callouts that reveal detail.
- **Keep convention when:** Technical products: annotations are expected; make them accurate.
- **Decide:** Could an engineer confirm every label?
- **Content:** Units and tolerances. **Motion:** Callouts draw in on demand, not all at once. **Responsive:** Become a numbered legend on small screens. **A11y:** Text equivalents in a list; focusable callouts if interactive.
- **States:** —
- **Build:** SVG overlays aligned to image coordinates; responsive via viewBox.
- **Test:** Accuracy review. **Severity:** C if specs are wrong. **Evidence:** Corpus §5.
- **Example:** "Precision engineered" callouts → "Cork density 220 kg/m³", "6 mm edge radius".

### Numeric displays
- **Job:** Present numbers so they can be read and compared.
- **Generic:** Proportional figures jittering in tables; count-up animations on every number. **Why it fails:** Unresolved. Hard to compare; motion distracts.
- **Stronger:** Tabular figures, aligned decimals, units styled consistently, locale formatting, deltas with direction and context.
- **Keep convention when:** Always.
- **Decide:** Can the reader compare two values at a glance?
- **Content:** Units, precision fit for purpose. **Motion:** Animate value changes only to show change (live data), never on load by default. **Responsive:** Abbreviate (12.4k) with full value on demand. **A11y:** Don't rely on colour for positive/negative; screen-reader friendly formats.
- **States:** Null vs zero, loading, stale.
- **Build:** `Intl.NumberFormat`; `font-variant-numeric: tabular-nums`.
- **Test:** Locale switch. **Severity:** A. **Evidence:** —
- **Example:** Counting-up "10,000+" → "12,418 reconciled transactions this week, +8% vs last week".

### Variable fonts
- **Job:** Fine typographic control and expressive behaviour from one file.
- **Generic:** Animating weight on hover for every link. **Why it fails:** Generic gimmick that can cause layout shift.
- **Stronger:** Axes used for hierarchy (weight, width, optical size) and for meaning-tied motion (width compressing as density rises).
- **Keep convention when:** —
- **Decide:** Does the axis change carry information?
- **Content:** —. **Motion:** Width or weight changes can shift layout; reserve space or use `font-variation-settings` on fixed-width containers. **Responsive:** Width axis to fit narrow screens. **A11y:** Keep minimum weights legible.
- **States:** Fallback when the variable font fails.
- **Build:** Subset the axes you use; `font-optical-sizing: auto`.
- **Test:** CLS during axis animation. **Severity:** A. **Evidence:** F2.
- **Example:** Bold-on-hover links → headline width tightens as the user scrolls into denser data chapters.

### Kinetic typography
- **Job:** Make words move when their movement *is* the message.
- **Generic:** Split-text letter-by-letter reveals on every heading. **Why it fails:** Generic and hurts accessibility (screen readers spell letters; reading is delayed).
- **Stronger:** One kinetic moment tied to meaning (a word that types like a terminal, a title that assembles like a stamp); readable at every frame.
- **Keep convention when:** —
- **Decide:** Removal test: is meaning lost without the motion?
- **Content:** Short phrases only. **Motion:** ≤ 1 s; interruptible; no re-play on every scroll. **Responsive:** Simplify on mobile. **A11y:** Accessible label on the parent and `aria-hidden` on the split pieces; reduced motion = static.
- **States:** Fonts not yet loaded (split after `document.fonts.ready`).
- **Build:** SplitText with accessibility handling or a manual `aria-label`; revert on cleanup.
- **Test:** Screen-reader reading of the heading. **Severity:** A (C if text becomes unreadable to assistive tech). **Evidence:** motion-implementation §9.
- **Example:** Every heading letter-staggered → only the closing line "Books closed." stamps in once, like the reconciliation stamp in the product.

### Text wrapping and measure
- **Job:** Keep lines readable and headlines well-shaped.
- **Generic:** Full-width lines; orphaned single words in headlines; overflowing long URLs. **Why it fails:** Unresolved.
- **Stronger:** `max-inline-size` measures; `text-wrap: balance` for headings; `pretty` for body where supported; `overflow-wrap: anywhere` for URLs and IDs.
- **Keep convention when:** Always.
- **Decide:** Inspect headlines at 360, 768 and 1440 px.
- **Content:** Write headlines that break well. **Motion:** —. **Responsive:** Check at every breakpoint. **A11y:** Reflow at 320 px.
- **States:** Translations.
- **Build:** —
- **Test:** `audit_page` overflow; contact sheet. **Severity:** C if overflow; A otherwise. **Evidence:** G-section.
- **Example:** A widowed "you." on a hero → balanced two-line headline.

### Editorial hierarchy
- **Job:** Guide readers through levels (kicker, title, deck, subheads, body, notes).
- **Generic:** Same-size headings everywhere, or too many levels. **Why it fails:** Incoherent.
- **Stronger:** 3–4 clear levels; consistent spacing (more above than below headings); a typographic contrast per level (size, weight, family, case).
- **Keep convention when:** Always required.
- **Decide:** Squint test: can you see the outline?
- **Content:** Subheads that summarise. **Motion:** —. **Responsive:** The scale compresses on mobile but keeps steps. **A11y:** Heading levels match visual levels.
- **States:** —
- **Build:** Type role tokens.
- **Test:** Heading outline in the audit report. **Severity:** A. **Evidence:** G1.
- **Example:** Five visually similar heading sizes → title / deck / subhead / body with clear contrast steps.

### Rich text
- **Job:** Render CMS or markdown content consistently and safely.
- **Generic:** Default browser styles for lists, quotes, tables and code inside articles; unsanitised HTML. **Why it fails:** Unresolved and a security risk.
- **Stronger:** A prose style system for every element (lists, quotes, tables, code, figures, footnotes) matching the design language; sanitised rendering.
- **Keep convention when:** —
- **Decide:** Render a kitchen-sink document with every element.
- **Content:** Editors' real content. **Motion:** None. **Responsive:** Tables scroll horizontally inside a labelled container; images responsive. **A11y:** Semantic elements preserved; headings not skipped.
- **States:** Very long tables, nested lists, embedded media.
- **Build:** Sanitiser (DOMPurify or the framework's safe renderer); scoped prose styles.
- **Test:** The kitchen-sink page in the contact sheet. **Severity:** C for unsanitised input. **Evidence:** security §3.
- **Example:** Unstyled blockquotes → pull quotes set in the display face with a citation line.

### Microcopy
- **Job:** Make actions, errors and states unambiguous.
- **Generic:** "Submit", "Continue", "Oops! Something went wrong", "Learn more". **Why it fails:** Generic. Vague labels hide consequences.
- **Stronger:** Labels that name the object or consequence ("Approve expense", "Send invoice to Dana"); errors that say what happened and how to fix it; consistent verbs through a flow.
- **Keep convention when:** Standard terms (Sign in, Cancel) are fine.
- **Decide:** Could a user predict the result of clicking?
- **Content:** Sentence case; active voice. **Motion:** —. **Responsive:** Shorter variants if needed. **A11y:** Visible label matches the accessible name.
- **States:** Every error and empty state has copy.
- **Build:** Centralised strings for localisation.
- **Test:** Read the flow's labels alone. Do they tell the story? **Severity:** A. **Evidence:** B1 (tacky buttons).
- **Example:** "Continue" → "Connect bank feed".

### Empty or missing copy
- **Job:** Handle content that doesn't exist yet without breaking the layout or lying.
- **Generic:** Lorem ipsum, or invented copy that sounds plausible. **Why it fails:** Unverified (C).
- **Stronger:** Specific draft copy from known facts, marked for review; a designed "content needed" slot in prototypes; collapsible optional fields.
- **Keep convention when:** —
- **Decide:** Is this fact known? If not, don't write it as fact.
- **Content:** Draft labels (`[Draft]`) in review builds only. **Motion:** —. **Responsive:** Layouts survive missing optional text. **A11y:** —
- **States:** Missing title, description or image.
- **Build:** Content schema with required and optional fields.
- **Test:** `slop_scan` placeholder rule. **Severity:** C. **Evidence:** B1.
- **Example:** Lorem ipsum FAQ → three draft FAQs written from real support topics, flagged "needs client review" in the report.

### Content placeholders
- **Job:** Stand in for real assets during design without misleading anyone.
- **Generic:** Random Unsplash faces as "customers", picsum images, fake logos. **Why it fails:** Unverified (deceptive).
- **Stronger:** Neutral, clearly labelled frames ("Product photo: 4:5"), diagrammatic stand-ins, or generated art that is obviously illustrative, never people posing as customers.
- **Keep convention when:** —
- **Decide:** Could a visitor mistake it for a real person, client or product?
- **Content:** Labels state what's needed. **Motion:** —. **Responsive:** Same aspect ratios as the planned assets. **A11y:** Alt text describes the placeholder honestly.
- **States:** —
- **Build:** A placeholder component that can't ship (lint or build check).
- **Test:** `slop_scan` placeholder-media rule. **Severity:** C. **Evidence:** security §8.
- **Example:** pravatar.cc faces → grey 1:1 frames labelled "Customer photo (pending permission)".

### Multilingual and localisation
- **Job:** Work in every supported language and script.
- **Generic:** Fixed-width buttons and headlines tuned for English; flags for languages. **Why it fails:** Unresolved.
- **Stronger:** Layouts that tolerate +30–40% length; logical properties for RTL; language names in their own language; locale-aware dates, numbers and currency.
- **Keep convention when:** —
- **Decide:** Test with pseudo-localisation (lengthened strings) and RTL.
- **Content:** Translators get context and length limits. **Motion:** Directional motion mirrors in RTL. **Responsive:** Wrapping tested per language. **A11y:** `lang` attributes; correct `dir`.
- **States:** Missing translations (fallback without breaking).
- **Build:** i18n library already in the project; `Intl` APIs; font coverage for scripts.
- **Test:** Pseudo-locale contact sheet. **Severity:** A (C if a supported locale breaks). **Evidence:** B1 (translation states).
- **Example:** Flag dropdown → a language list ("Deutsch", "Français", "العربية") with RTL layout verified.

---

## 8.5 Action and form controls

### Buttons
- **Job:** Trigger an action with a clear consequence.
- **Generic:** Oversized gradient pills with glow, a heavy shadow and an icon; vague labels ("Get started →"); every button styled as primary. **Why it fails:** Generic and unresolved. No role hierarchy.
- **Stronger:** Defined roles (primary, secondary, quiet, destructive, unavailable) with stable type, spacing, radius and colour; labels naming the object or consequence; shape and material from the design language.
- **Keep convention when:** Behaviour is always conventional (native `<button>`). Expression lives in shape, type and feedback.
- **Decide:** One primary per view. Can you name each button's consequence?
- **Content:** Verb plus object. **Motion:** Press ≤ 100 ms; pending state for async; no magnetic or jiggle by default. **Responsive:** ≥ 44 px height for primary touch actions. **A11y:** Native button; visible focus; `aria-busy` or status text while pending; disabled reason explained.
- **States:** Default, hover, focus-visible, active, pending, success, error, disabled.
- **Build:** A variant API (`variant`, `size`, `tone`); no `div` buttons.
- **Test:** Keyboard (Enter/Space); `slop_scan` noop/glow triggers. **Severity:** C if non-functional or not keyboard-operable. **Evidence:** B1 (tacky buttons).
- **Example:** Glowing "Get started →" pill → a solid ink "Connect your first bank feed" button with a 2 px focus ring and a pending spinner.

### Button groups
- **Job:** Offer related actions or exclusive options together.
- **Generic:** Three equal buttons side by side with no hierarchy. **Why it fails:** Unresolved. The user can't tell which action matters.
- **Stronger:** A clear primary plus secondary; segmented controls for mutually exclusive choices (with radio semantics); split buttons for primary plus variants.
- **Keep convention when:** Toolbars in apps.
- **Decide:** Are these actions or choices? Actions go in a button group; choices are a radio group or segmented control.
- **Content:** Short labels. **Motion:** The selection indicator glides between segments. **Responsive:** Stack or overflow into a menu. **A11y:** Segmented control as `radiogroup`; toolbar pattern for many actions (arrow keys).
- **States:** Selected, disabled item, overflow.
- **Build:** Use the APG toolbar or radio patterns.
- **Test:** Arrow-key behaviour. **Severity:** A. **Evidence:** E4.
- **Example:** [Daily][Weekly][Monthly] as buttons → a segmented radio group with a sliding indicator.

### Icon buttons
- **Job:** Compact, frequent actions (close, edit, more).
- **Generic:** Unlabelled icons in a row; tiny 16 px targets. **Why it fails:** Unresolved. Ambiguous meaning; fails target size.
- **Stronger:** Only for universal icons (close, search, menu); a tooltip plus accessible name; ≥ 24 px target (44 px on touch).
- **Keep convention when:** Toolbars and dense UIs.
- **Decide:** Would 90% of users know the icon? If not, add a text label.
- **Content:** —. **Motion:** Subtle press feedback. **Responsive:** Larger targets on touch. **A11y:** `aria-label`; icon `aria-hidden`; tooltip on focus and hover.
- **States:** Toggled (`aria-pressed`), disabled.
- **Build:** Padding to reach the target size without enlarging the icon.
- **Test:** `audit_page` small targets and unnamed controls. **Severity:** C if unnamed. **Evidence:** G-section (unnamed controls on 8 sites).
- **Example:** A 14 px "…" icon → a 40 px "More actions" button with a tooltip.

### Links
- **Job:** Navigate to a resource.
- **Generic:** Links without underlines distinguished only by colour; "Learn more →" everywhere; buttons that navigate and links that act. **Why it fails:** Unresolved and generic.
- **Stronger:** Recognisable link style in text (underline or equivalent); descriptive link text; arrows only where they mean "leaves this page" or "next".
- **Keep convention when:** Always.
- **Decide:** Does the link text make sense out of context (screen-reader links list)?
- **Content:** Describe the destination. **Motion:** Underline animation acceptable if fast. **Responsive:** Targets in lists ≥ 24 px tall. **A11y:** Not colour-only in body text (1.4.1); visible focus.
- **States:** Visited (where useful), hover, focus, current.
- **Build:** Real `<a href>`; no `href="#"`.
- **Test:** `slop_scan` dead-link and arrow-suffix. **Severity:** C for dead links. **Evidence:** G (Son Daven 38–44 dead links).
- **Example:** "Learn more →" ×6 → "Read how Harbor & Co. closed books in 3 days".

### Input fields
- **Job:** Capture text accurately and quickly.
- **Generic:** Placeholder-as-label inputs with light grey borders and no visible focus. **Why it fails:** Unresolved. Label vanishes; low contrast; inaccessible.
- **Stronger:** Persistent labels; helper text; correct `type`, `inputmode` and `autocomplete`; a field style from the design language (a ledger line, a stamped box).
- **Keep convention when:** Behaviour is always conventional.
- **Decide:** Can a user fill it via autofill and keyboard only?
- **Content:** Label, hint, error. **Motion:** Focus transition ≤ 150 ms; error shake is optional and never the only signal. **Responsive:** Full-width on mobile; `font-size ≥ 16px` to prevent iOS zoom. **A11y:** `<label for>`; `aria-describedby` for hint and error; 3:1 border contrast.
- **States:** Empty, focus, filled, invalid, valid, disabled, read-only, autofilled.
- **Build:** Native inputs; `field-sizing: content` as an enhancement for textareas.
- **Test:** Autofill; 200% zoom; screen reader announces label, hint and error. **Severity:** C if unlabelled. **Evidence:** E-section.
- **Example:** Placeholder "Email" → label "Work email", hint "We'll send the invoice copy here", `autocomplete="email"`.

### Search fields
- **Job:** Find content or items fast.
- **Generic:** A decorative search box that doesn't search, or one that searches only titles. **Why it fails:** C if fake; unresolved if poor.
- **Stronger:** Real search with suggestions, recent queries, typo tolerance, scoped filters, keyboard shortcut (`/` or ⌘K) and a results page that explains.
- **Keep convention when:** Search is one of the most conventional patterns. Excellence is speed and relevance.
- **Decide:** What do people search for (logs, support)? Design results for those.
- **Content:** Helpful no-results copy. **Motion:** Results appear without layout jumps. **Responsive:** Full-screen search on mobile. **A11y:** `role="search"` landmark; combobox pattern if suggesting; results count announced.
- **States:** See experience-flow.md §5 (async search inventory).
- **Build:** Debounce; abort stale requests; highlight matches.
- **Test:** Keyboard-only search to result. **Severity:** C if fake. **Evidence:** F8 taxonomy.
- **Example:** A decorative search icon → ⌘K search across clients, invoices and reports, with recent searches.

### Select menus
- **Job:** Choose one option from a list.
- **Generic:** A custom div dropdown that breaks keyboard and mobile pickers. **Why it fails:** Unresolved.
- **Stronger:** Native `<select>` (styleable more and more), or radio cards when there are ≤ 5 options that need explanation, or a combobox for long lists.
- **Keep convention when:** Native select for most forms.
- **Decide:** ≤ 5 options → radio; 6–15 → select; more, or searchable → combobox.
- **Content:** Clear option labels. **Motion:** Native. **Responsive:** Native pickers on mobile are a feature. **A11y:** Label; native semantics.
- **States:** Default value, required, disabled options.
- **Build:** Prefer native; custom only with the APG listbox/combobox pattern.
- **Test:** Keyboard (arrows, type-ahead). **Severity:** C if inaccessible. **Evidence:** E4.
- **Example:** A div-dropdown for "Plan" → three radio cards explaining each plan's limits.

### Comboboxes
- **Job:** Choose from a large or searchable set; allow free entry where appropriate.
- **Generic:** An input with a floating list that loses focus, ignores arrow keys and has no "no results". **Why it fails:** Unresolved.
- **Stronger:** The APG combobox pattern: list autocomplete, highlighted option, Enter selects, Escape closes, results count announced; the async states from the inventory.
- **Keep convention when:** Always follow the pattern; style is free.
- **Decide:** Is free text allowed? That determines the behaviour.
- **Content:** Highlight the matched substring. **Motion:** List appears ≤ 150 ms. **Responsive:** Full-screen on mobile for long lists. **A11y:** `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- **States:** Async inventory (experience-flow.md §5).
- **Build:** Use an accessible primitive (React Aria, Radix/Base UI, Headless UI, Downshift) if present.
- **Test:** Screen reader announces options and count. **Severity:** C if not operable. **Evidence:** E4.
- **Example:** Client picker that lists 2,000 names → a combobox with recent clients first and typo-tolerant matching.

### Checkboxes
- **Job:** Toggle independent options; agree to terms.
- **Generic:** A custom checkbox that's a styled div; tiny targets; pre-checked consent. **Why it fails:** Unresolved and deceptive (pre-checked consent is a C failure).
- **Stronger:** Native input styled via `accent-color` or appearance; the label clickable; the indeterminate state for parents; consent unchecked by default.
- **Keep convention when:** Always native behaviour.
- **Decide:** Independent options → checkboxes; exclusive → radio; an instant setting → switch.
- **Content:** Positive phrasing ("Email me…" not "Don't not…"). **Motion:** Check-mark draw ≤ 150 ms. **Responsive:** Label row as the target. **A11y:** Native semantics; group in a `fieldset`.
- **States:** Checked, unchecked, indeterminate, disabled, invalid (required consent).
- **Build:** `accent-color`, or appearance plus a pseudo-element; keep the input focusable.
- **Test:** Space toggles; label click works. **Severity:** C for pre-checked consent. **Evidence:** security §9.
- **Example:** A pre-checked "Subscribe to offers" → unchecked, with a plain description of frequency.

### Radio groups
- **Job:** Choose exactly one of a few options.
- **Generic:** Radios styled as buttons without radio semantics. **Why it fails:** Unresolved for assistive tech.
- **Stronger:** Radio cards with descriptions for consequential choices (plans, shipping); native radios underneath.
- **Keep convention when:** Simple forms.
- **Decide:** Do options need explanation? Then use cards.
- **Content:** Option consequences (price, time). **Motion:** The selection indicator moves. **Responsive:** Cards stack. **A11y:** `fieldset`/`legend`; arrow keys move selection.
- **States:** Selected, disabled with reason, error (none chosen).
- **Build:** Native inputs visually hidden but focusable, with the card as the label.
- **Test:** Arrow-key navigation. **Severity:** C if inaccessible. **Evidence:** E4.
- **Example:** Shipping buttons → radio cards: "Standard · Thu 14 May · Free", "Express · Tomorrow · €9".

### Switches
- **Job:** An immediate on/off setting.
- **Generic:** Switches used in forms that need a save button; switches with no visible state label. **Why it fails:** Incoherent (switch implies instant effect).
- **Stronger:** Switch only for instant-apply settings; a state visible by more than colour (position plus label or icon).
- **Keep convention when:** Settings pages.
- **Decide:** Does it apply immediately? If not, use a checkbox.
- **Content:** Label describes the "on" state. **Motion:** Thumb slides ≤ 150 ms. **Responsive:** ≥ 44 px wide on touch. **A11y:** `role="switch"` with `aria-checked`, or a native checkbox with switch styling.
- **States:** On, off, pending (saving), error (reverted with message), disabled.
- **Build:** Optimistic update with rollback.
- **Test:** Failure path reverts and announces. **Severity:** A (C if decorative). **Evidence:** F8.
- **Example:** A decorative "Dark mode" switch that does nothing → removed, or wired to a real theme preference with persistence.

### Sliders
- **Job:** Choose a value in a range where approximate selection is fine.
- **Generic:** A slider for precise numbers (price in cents); a tiny thumb. **Why it fails:** Unresolved.
- **Stronger:** A slider plus a numeric input; steps that match the domain; a visual feedback of the effect (live preview).
- **Keep convention when:** Ranges and filters.
- **Decide:** Is precision needed? Then pair it with an input.
- **Content:** Units and current value visible. **Motion:** Thumb follows the pointer instantly. **Responsive:** Large thumb on touch. **A11y:** Native `<input type=range>` or the APG slider; arrow keys; `aria-valuetext` with units.
- **States:** Min, max, disabled, two-thumb range.
- **Build:** Native range styled; or an accessible primitive.
- **Test:** Keyboard increments; screen reader reads the value with units. **Severity:** C if not operable. **Evidence:** E4.
- **Example:** A price slider alone → a slider with min/max inputs and a histogram of products per price band.

### File upload controls
- **Job:** Add files reliably.
- **Generic:** A dashed drop zone that only works with drag. **Why it fails:** Unresolved (WCAG 2.5.7).
- **Stronger:** Drop zone plus a "Choose files" button; constraints stated (types, size); per-file progress, error and retry; previews.
- **Keep convention when:** Always.
- **Decide:** Single vs multiple; immediate upload vs on submit.
- **Content:** Constraints before the user tries. **Motion:** Progress tied to real upload events. **Responsive:** Camera capture on mobile where useful (`capture`). **A11y:** Native `input type=file` focusable; status announced.
- **States:** Idle, drag-over, uploading (real %), success, error (type/size/network), retry, removed.
- **Build:** `XMLHttpRequest`/`fetch` with progress where supported; abort.
- **Test:** Keyboard-only upload; over-size file. **Severity:** C if drag-only. **Evidence:** E3 (2.5.7).
- **Example:** "Drag files here" only → a drop zone plus a button, "PDF or JPG, up to 10 MB", and per-receipt progress.

### Validation messages
- **Job:** Help users fix errors.
- **Generic:** Red borders only; "Invalid input"; errors on every keystroke. **Why it fails:** Unresolved.
- **Stronger:** Specific messages (what and how to fix), next to the field and in a summary on submit; validation on blur/submit, then live once the field is in error.
- **Keep convention when:** Always.
- **Decide:** Each rule has a human message.
- **Content:** "Enter a date after 1 Jan 2026" rather than "Invalid date". **Motion:** No shaking as the only signal. **Responsive:** Messages don't shift layout unpredictably (reserve space or animate height). **A11y:** `aria-invalid`, `aria-describedby`; a focusable summary with links.
- **States:** Field error, form error, server error mapped to a field.
- **Build:** Schema validation shared between client and server where possible.
- **Test:** Screen reader hears the error on focus. **Severity:** C if errors aren't perceivable. **Evidence:** E-section.
- **Example:** "Invalid IBAN" → "IBAN should start with 2 letters, e.g. DE89 3704…".

### Multi-step forms
- **Job:** Break long tasks into manageable steps.
- **Generic:** A step indicator with fake progress; data lost on back. **Why it fails:** Unresolved.
- **Stronger:** Steps by topic; progress shows steps truthfully; save drafts; back keeps data; a review step before commit; skip optional steps.
- **Keep convention when:** Always behaviourally conventional.
- **Decide:** Could it be one page? Only split when it reduces load.
- **Content:** Step titles as questions. **Motion:** Step transitions show direction; focus moves to the step heading. **Responsive:** Compact progress on mobile ("Step 2 of 4"). **A11y:** Focus management between steps; progress announced.
- **States:** Draft saved, resumed, error on earlier step, timeout.
- **Build:** URL per step (deep link, back button); state persisted.
- **Test:** Browser back between steps keeps data. **Severity:** C if data loss. **Evidence:** E3 (3.3.7 Redundant Entry).
- **Example:** A 5-dot wizard → "Business · Bank · Clients · Review" with drafts saved after each step.

### Submit states
- **Job:** Confirm that an action is in progress and then done.
- **Generic:** A button that does nothing visible until the page changes; double submissions. **Why it fails:** Unresolved.
- **Stronger:** Immediate pending state; double submit blocked; success with the next step; errors that preserve input.
- **Keep convention when:** Always.
- **Decide:** What does the user need to know after success?
- **Content:** "Sending invoice…" → "Invoice sent to dana@harbor.co". **Motion:** Pending → success morph if it fits the language. **Responsive:** —. **A11y:** Status via a live region.
- **States:** Pending, success, error, timeout, offline.
- **Build:** Disable on submit with the state shown (not just disabled grey).
- **Test:** Slow network throttle. **Severity:** C if double submission is possible on payments. **Evidence:** experience-flow §5.
- **Example:** A greyed-out "Submit" → a "Sending…" spinner, then "Sent ✓ View invoice".

### Confirmation flows
- **Job:** Prevent costly mistakes without nagging.
- **Generic:** "Are you sure?" dialogs on everything. **Why it fails:** Generic. Confirmation fatigue makes users click through.
- **Stronger:** Undo for reversible actions; confirmation only for irreversible or costly ones, naming the object and consequence.
- **Keep convention when:** Irreversible deletion, payments, publishing.
- **Decide:** Can it be undone? Then offer undo instead of confirm.
- **Content:** "Delete client Harbor & Co. and 214 transactions? This can't be undone." **Motion:** Dialog in from the trigger. **Responsive:** —. **A11y:** `alertdialog`; focus on the least destructive option.
- **States:** Pending, success with undo, failure.
- **Build:** Undo toasts with a timeout and a real reversal.
- **Test:** Undo actually restores the data. **Severity:** A. **Evidence:** E4.
- **Example:** "Are you sure?" on archive → archive immediately, with an "Undo" toast for 8 s.

### Destructive actions
- **Job:** Remove or irreversibly change data safely.
- **Generic:** A red delete button next to the primary save. **Why it fails:** Unresolved. Error-prone placement.
- **Stronger:** Separated from primary actions; a danger tone; typed confirmation for very high stakes; a clear scope of what's affected.
- **Keep convention when:** —
- **Decide:** Severity → friction level (undo < confirm < type-to-confirm).
- **Content:** Name the object and impact. **Motion:** No playful motion. **Responsive:** Not adjacent to the primary on mobile. **A11y:** Not colour-only; clear label.
- **States:** —
- **Build:** Server-side authorisation and soft-delete where appropriate.
- **Test:** Can't trigger by accident with keyboard Enter on a form. **Severity:** C if no safeguard on irreversible data. **Evidence:** —
- **Example:** Red "Delete" beside "Save" → a "Danger zone" section at the end of settings with "Delete workspace…" requiring the workspace name.

### Disabled states
- **Job:** Show that an action isn't available.
- **Generic:** Greyed buttons with no explanation; disabled submit until the form is valid. **Why it fails:** Unresolved. Users don't know why or what to do.
- **Stronger:** Keep actions enabled and explain on attempt (validation), or show the reason next to the disabled control; hide actions that are never available to this user.
- **Keep convention when:** Temporarily unavailable actions with an obvious reason.
- **Decide:** Will the user understand why? If not, explain.
- **Content:** "Add a bank account to send invoices". **Motion:** No hover effects. **Responsive:** —. **A11y:** Disabled controls aren't focusable by default; if the reason matters, use `aria-disabled` and a description.
- **States:** —
- **Build:** —
- **Test:** A user can discover why. **Severity:** A. **Evidence:** B1.
- **Example:** A disabled "Send" → an enabled "Send", with a validation message explaining the missing recipient on click.

---

## 8.6 Repeated content structures

### Feature grids
- **Job:** Communicate what the product does.
- **Generic:** Three or six identical cards: icon, bold title, two lines of generic copy. **Why it fails:** Generic. Equal weight; icons as decoration; untestable claims.
- **Stronger:** Show features in action (a sequence, a before/after, an interactive demo); order by user value; vary treatment by feature type; one flagship feature given real space.
- **Keep convention when:** A reference list of many features (a feature index) can be a list or table. Make it scannable and specific.
- **Decide:** Substitution and removal tests on each card.
- **Content:** Feature → benefit → proof. **Motion:** Demonstrations, not fade-ups. **Responsive:** Flagship first on mobile. **A11y:** Heading per feature; icons decorative.
- **States:** —
- **Build:** Data-driven, so features can be reordered.
- **Test:** `slop_scan` template-stack and stock-icon triggers. **Severity:** A. **Evidence:** B3, B5, F1.
- **Example:** "⚡ Lightning-fast sync / 🔒 Secure / 🚀 Scale" → one reconciliation sequence with three checkpoints: import, match, close.

### Cards
- **Job:** Package one item for scanning and selection.
- **Generic:** The same rounded card with a soft shadow for every content type. **Why it fails:** Generic and incoherent (false consistency).
- **Stronger:** Card anatomy per content type (product, case, person, article); material and radius by meaning; the whole card clickable via one primary link.
- **Keep convention when:** Uniform containers holding singular content (a gallery of distinct artworks).
- **Decide:** List the card's content fields. Does its anatomy reflect them?
- **Content:** Real fields, realistic lengths. **Motion:** Hover lifts are not the default; use focus/hover that reveal information. **Responsive:** Container queries switch layouts. **A11y:** One link per card (stretched); no nested interactive conflicts; heading inside.
- **States:** Missing image, long title, out of stock, new, selected.
- **Build:** Card variants by content type, sharing tokens.
- **Test:** `slop_scan` uniform-radius trigger. **Severity:** A. **Evidence:** B5 (SaaS card kit), corpus §18.
- **Example:** Identical cards for products and articles → products on a "shelf" with price and stock; articles as typographic list rows with date and reading time.

### List rows
- **Job:** Dense scanning of many items.
- **Generic:** Rows padded like cards; actions hidden until hover. **Why it fails:** Unresolved. Low density; hover-only on touch.
- **Stronger:** Aligned columns of key fields, tabular numbers, visible primary action or row click, secondary actions in a menu.
- **Keep convention when:** Inbox, files, transactions: lists are right.
- **Decide:** Which three fields decide selection? Make them prominent.
- **Content:** Truncation with full text available. **Motion:** Row insert/remove animated to show change. **Responsive:** Secondary fields wrap under the primary. **A11y:** Lists or tables semantically; row actions keyboard reachable.
- **States:** Selected, unread, error, loading more.
- **Build:** Virtualise long lists.
- **Test:** 1,000 rows performance. **Severity:** A. **Evidence:** —
- **Example:** Card-per-transaction → 40 px rows: date · payee · amount (tabular) · status chip.

### Accordions
- **Job:** Let users reveal details on demand.
- **Generic:** An FAQ accordion of invented questions; all content hidden, even essentials. **Why it fails:** Unverified and unresolved.
- **Stronger:** Accordions for optional detail; real questions from support; "expand all"; deep links to items.
- **Keep convention when:** FAQs and specs.
- **Decide:** Would most users need this content? Then don't hide it.
- **Content:** Questions in the user's words. **Motion:** Height via the grid technique; ≤ 250 ms; reduced = instant. **Responsive:** —. **A11y:** `<details>/<summary>` or the APG disclosure pattern; heading wrapping the button.
- **States:** Open, closed, deep-linked open.
- **Build:** Native `<details>` where styling allows; `name` attribute for exclusive groups where supported.
- **Test:** Keyboard toggle; find-in-page finds hidden text (`hidden="until-found"` where supported). **Severity:** A. **Evidence:** —
- **Example:** Invented FAQs → five questions taken from the client's support inbox, linked from relevant sections.

### Tabs
- **Job:** Switch between peer views of the same context.
- **Generic:** Tabs used for sequential steps or for content users need to compare. **Why it fails:** Unresolved.
- **Stronger:** Tabs for peers only; the selected tab clearly marked; content preserved when switching; URL state if shareable.
- **Keep convention when:** Always conventional behaviour.
- **Decide:** Will users compare panels? Then show them side by side.
- **Content:** Short tab labels. **Motion:** Indicator slides; panel cross-fades ≤ 200 ms. **Responsive:** Scrollable tab list or a select on small screens. **A11y:** APG tabs: `tablist`, `tab`, `tabpanel`, arrow keys, `aria-selected`.
- **States:** Selected, focus, overflow, disabled tab.
- **Build:** Accessible primitive if present.
- **Test:** Arrow-key navigation. **Severity:** C if inaccessible. **Evidence:** E4.
- **Example:** Monthly/Annual pricing as tabs → a segmented toggle (radio) controlling one pricing view.

### Carousels
- **Job:** Browse a set where only some items fit.
- **Generic:** An auto-advancing hero slider hiding key messages; dots as the only control. **Why it fails:** Unresolved. Users miss content; motion without control (WCAG 2.2.2).
- **Stronger:** Don't hide key content in carousels. Use scroll-snap rows with visible partial items, arrows plus swipe, and counts ("3 of 12").
- **Keep convention when:** Product image galleries; related items.
- **Decide:** Is the content sequential and secondary? Only then use a carousel.
- **Content:** Every slide stands alone. **Motion:** No auto-advance by default; if auto, pause on hover and focus, with a pause button. **Responsive:** Native swipe via scroll-snap. **A11y:** APG carousel: labelled region, slide labels, controls named.
- **States:** First, last, loading images.
- **Build:** CSS scroll-snap plus buttons; avoid heavy libraries if native suffices.
- **Test:** Keyboard; reduced motion. **Severity:** C if auto-moving without pause. **Evidence:** E1 (2.2.2).
- **Example:** Auto-rotating hero slides → one hero, and a scroll-snap row of "Recent firings" below.

### Galleries
- **Job:** Present visual work at quality.
- **Generic:** Masonry of thumbnails with hover-zoom; a lightbox without keyboard. **Why it fails:** Generic and unresolved.
- **Stronger:** Curated sequences with captions; a lightbox with keyboard, swipe and deep links; an index view plus a focus view; layout reflecting the work (filmstrip for film, specimen grid for objects).
- **Keep convention when:** Simple portfolios: a clean grid works if images are strong.
- **Decide:** Does the presentation format come from the medium?
- **Content:** Captions, credits, dates. **Motion:** Shared-element transition from thumbnail to view. **Responsive:** Swipe in the lightbox; pinch-zoom allowed. **A11y:** Alt text; dialog semantics for the lightbox; focus return.
- **States:** Loading high-res, error, video items.
- **Build:** Responsive images; preload the next image.
- **Test:** Keyboard through the lightbox. **Severity:** A (C if the lightbox traps or fails keyboard). **Evidence:** Corpus §10, §14.
- **Example:** Masonry with hover-zoom → a film-strip index for a production house, opening a full-frame viewer with credits.

### Content feeds
- **Job:** Continuous discovery of new items.
- **Generic:** Infinite scroll without position memory, footer unreachable. **Why it fails:** Unresolved.
- **Stronger:** "Load more" or paginated infinite scroll with URL state, position restored on back, a reachable footer, and filters.
- **Keep convention when:** Social-style feeds.
- **Decide:** Do users need to find things again? Then paginate or deep-link.
- **Content:** Timestamps, provenance. **Motion:** New items announced, not jumped in. **Responsive:** —. **A11y:** `role="feed"` pattern where suitable; new-items announcement.
- **States:** Loading more, end of feed, error, new items available.
- **Build:** Virtualisation for long feeds.
- **Test:** Back navigation restores position. **Severity:** A. **Evidence:** E4 (feed).
- **Example:** Endless scroll → "Show 20 more" with the page in the URL.

### Timeline layouts
- **Job:** Show events in temporal order and their relationships.
- **Generic:** Alternating left/right cards along a vertical line with dots. **Why it fails:** Generic. Hard to scan; time scale ignored.
- **Stronger:** Proportional time scales where intervals matter; grouping by era; a horizontal timeline when sequence and comparison matter; links between events.
- **Keep convention when:** Short company histories can be simple lists.
- **Decide:** Do the intervals carry meaning?
- **Content:** Dates precise. **Motion:** Scroll-linked progress through eras if narrative. **Responsive:** A vertical list on mobile. **A11y:** Ordered list semantics.
- **States:** —
- **Build:** —
- **Test:** Reading order. **Severity:** A. **Evidence:** —
- **Example:** Zigzag cards → a proportional timeline in which the 1970s gap is visibly long, with the reason annotated.

### Pricing tables
- **Job:** Help buyers choose a plan with confidence.
- **Generic:** Three cards, the middle one "Most popular" with a gradient border, checkmark lists of vague features. **Why it fails:** Generic. Hard to compare; the "popular" label is often fabricated.
- **Stronger:** Choose by job or size; a comparison table with real limits; a calculator if usage-based; honest "best for" labels; enterprise path; FAQs from real objections.
- **Keep convention when:** 2–4 plans in columns is fine if the comparison is honest and scannable.
- **Decide:** Can a buyer find their plan in 10 seconds?
- **Content:** Real prices, taxes, billing period, limits. **Motion:** Toggle monthly/annual with a price morph; no confetti. **Responsive:** Plan cards plus a collapsible comparison on mobile. **A11y:** A table for the comparison (`th`, `scope`); prices readable by screen readers.
- **States:** Currency, annual/monthly, current plan (logged in).
- **Build:** Prices from config or API (no hardcoded duplicates).
- **Test:** Totals correct; the "popular" claim sourced. **Severity:** C if the claim is fabricated. **Evidence:** B3, security §8.
- **Example:** Three gradient cards → "Solo · up to 15 clients", "Practice · up to 80", "Firm · unlimited" with a usage calculator.

### Testimonials
- **Job:** Borrow credibility from real customers.
- **Generic:** Smiling stock faces, five stars and generic praise. **Why it fails:** Unverified (C if fabricated).
- **Stronger:** Real, permissioned quotes with name, role and company; specific outcomes; context (what they used it for); video or case links.
- **Keep convention when:** Format can be conventional; truth is mandatory.
- **Decide:** Do you have permission and a source? If not, design a labelled slot.
- **Content:** Specific claims. **Motion:** No auto-rotating quote carousels. **Responsive:** One quote per view on mobile. **A11y:** `<blockquote>` with `<cite>`.
- **States:** Missing (slot labelled "awaiting approval").
- **Build:** From the CMS with a verification flag.
- **Test:** `slop_scan` placeholder-media and unverified-claim. **Severity:** C if invented. **Evidence:** security §8.
- **Example:** "Game changer! ★★★★★ — Jane D." → "We closed March in 3 days instead of 9." Priya Shah, Partner, Shah & Ortiz CPAs.

### Client logo displays
- **Job:** Signal adoption by recognisable organisations.
- **Generic:** Grey logo strips of famous brands that aren't clients; marquees. **Why it fails:** Unverified (C if not real).
- **Stronger:** Only permissioned logos; grouped by sector; linked to case studies; quantity proportional to evidence.
- **Keep convention when:** Real logos in a simple row are fine.
- **Decide:** Permission plus relevance.
- **Content:** —. **Motion:** Marquees need a pause; prefer static. **Responsive:** Wrap to a grid. **A11y:** Logos have alt text (company name), or the group is labelled.
- **States:** —
- **Build:** SVG logos, optimised.
- **Test:** Permission check. **Severity:** C if fabricated. **Evidence:** security §8.
- **Example:** Marquee of Fortune 500 logos → four real client logos linking to their case studies.

### Metrics and statistics
- **Job:** Quantify impact credibly.
- **Generic:** "10x faster · 99.9% uptime · 10,000+ users" in big numbers. **Why it fails:** Unverified and generic.
- **Stronger:** Sourced, specific numbers in context (baseline, period, sample); a methodology link; visual comparison.
- **Keep convention when:** If sourced, a stat row is fine.
- **Decide:** Source, date and denominator known?
- **Content:** "Median", "n=212", period. **Motion:** No count-up by default. **Responsive:** —. **A11y:** Numbers as text.
- **States:** —
- **Build:** —
- **Test:** `slop_scan` unverified-claim. **Severity:** C if unsourced. **Evidence:** security §8.
- **Example:** "10x faster" → "Month-end close: 9 → 3 days (median, 212 firms, 2025)".

### Case-study showcases
- **Job:** Demonstrate thinking and outcomes.
- **Generic:** A grid of hero images that open to an image dump with no outcomes. **Why it fails:** Unresolved.
- **Stronger:** Problem → approach → outcome structure; specific results; process artefacts; credits; navigation between cases.
- **Keep convention when:** —
- **Decide:** Does each case state an outcome?
- **Content:** Real outcomes, permissions. **Motion:** Transition from index to case keeps the hero image (shared element). **Responsive:** Index filters into a sheet. **A11y:** Headings structure; captions.
- **States:** —
- **Build:** CMS model with required outcome fields.
- **Test:** Find a relevant case in 2 taps on a phone. **Severity:** A. **Evidence:** project-modes §4.
- **Example:** Image grid → index rows with client, discipline, year and outcome line; each opens with the same image morphing into the case header.

### Product comparisons
- **Job:** Help choose between options.
- **Generic:** Feature checklists that make the own product win every row. **Why it fails:** Unverified (biased) and generic.
- **Stronger:** Honest attributes that matter for the decision; "best for" summaries; highlight differences only; let users pick which to compare.
- **Keep convention when:** A table is the right form.
- **Decide:** Which attributes drive the decision?
- **Content:** Accurate competitor data with dates. **Motion:** —. **Responsive:** Sticky first column; choose two to compare on mobile. **A11y:** Table semantics.
- **States:** Missing data ("—" with meaning).
- **Build:** —
- **Test:** Data verified. **Severity:** C if false claims. **Evidence:** security §8.
- **Example:** 30 checkmark rows → 6 decision rows with a "Show only differences" toggle.

### Related content
- **Job:** Continue the journey.
- **Generic:** "You might also like" with three random cards. **Why it fails:** Generic.
- **Stronger:** Relationships explained ("Next in this series", "Uses the same glaze", "Same client"); fewer, better links.
- **Keep convention when:** —
- **Decide:** Can you name the relationship?
- **Content:** Relationship labels. **Motion:** —. **Responsive:** Horizontal scroll row on mobile. **A11y:** A labelled section.
- **States:** None available (hide the section).
- **Build:** Derived from content relations, not random.
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** "More posts" → "Next in 'Closing the month' (part 3 of 5)".

---

## 8.7 Complex data interfaces

Every data component needs meaningful relationships, truthful example data (labelled as sample where needed), legible labels with units, and controls that actually work.

### Tables
- **Job:** Compare records across attributes.
- **Generic:** Zebra-striped, full-width tables with centred numbers and no units. **Why it fails:** Unresolved. Hard to compare; ambiguity.
- **Stronger:** Left-aligned text, right-aligned tabular numbers, units in headers, sticky header and first column, row hover or selection, density options.
- **Keep convention when:** Always. Tables are the right form for tabular data.
- **Decide:** Which column do users scan first? Put it first and make it the row's identity.
- **Content:** Realistic data volumes and lengths. **Motion:** Sort and reorder transitions preserve object constancy. **Responsive:** Priority columns, horizontal scroll with a sticky first column, or a row → card transform. **A11y:** `<table>`, `<th scope>`, `<caption>`; sortable headers as buttons with `aria-sort`.
- **States:** Loading (skeleton columns), empty, filtered-empty, error, partial.
- **Build:** Native table for ≤ a few hundred rows; virtualise beyond that.
- **Test:** 1k rows; keyboard sorting. **Severity:** A (C if inaccessible). **Evidence:** project-modes §8.
- **Example:** Centred "$1200" → right-aligned "1,200.00" with the currency in the header.

### Data grids
- **Job:** Edit and manipulate tabular data (spreadsheet-like).
- **Generic:** A table with inline inputs everywhere; no keyboard model. **Why it fails:** Unresolved.
- **Stronger:** The APG grid keyboard model (arrows, Enter to edit, Escape to cancel); clear edit affordances; validation per cell; undo.
- **Keep convention when:** Spreadsheet conventions are expected; follow them.
- **Decide:** Is it editing (grid) or reading (table)?
- **Content:** Cell formats per type. **Motion:** Minimal. **Responsive:** Usually a desktop-first task; provide a mobile view-only mode. **A11y:** `role="grid"` only if fully implemented; otherwise a table plus edit dialogs.
- **States:** Editing, invalid, saving, conflict, read-only cells.
- **Build:** Proven grid libraries if present; virtualised.
- **Test:** Keyboard-only edit cycle. **Severity:** C if broken keyboard. **Evidence:** E4.
- **Example:** Inputs in every cell → a navigable grid with Enter-to-edit and per-cell validation.

### Charts
- **Job:** Reveal patterns in data for a specific question.
- **Generic:** Decorative gradient area charts with no axes; neon lines on black; random sample data. **Why it fails:** Unverified and generic (fake dashboards).
- **Stronger:** Chart type chosen by task (compare → bars; trend → lines; distribution → histogram or box; part-to-whole → stacked bars, rarely pies; relationship → scatter); direct labels; meaningful scales; annotations for events.
- **Keep convention when:** Standard chart forms are best for reading.
- **Decide:** Write the question the chart answers in its title.
- **Content:** Units, source, period. **Motion:** Transitions between states keep marks consistent; no entrance animation on every load. **Responsive:** Fewer ticks, direct labels, simplified series on mobile. **A11y:** Text summary, a data table fallback, colour plus pattern or labels, sufficient contrast.
- **States:** Loading (reserved size), no data, partial, error.
- **Build:** The project's chart library; SVG for accessibility where feasible.
- **Test:** Greyscale readability; screen-reader summary. **Severity:** C if the data is fake and presented as real. **Evidence:** B2, project-modes §8.
- **Example:** Glowing area chart "Revenue ↑" → "Unmatched transactions by week: dropped from 340 to 42 after bank sync (labelled sample data)".

### KPIs
- **Job:** Surface the few numbers that indicate health, with context.
- **Generic:** Four big numbers with green arrows and percentages, no period or baseline. **Why it fails:** Unverified and generic.
- **Stronger:** Each KPI has a definition, period, comparison, target and drill-down; fewer, more meaningful KPIs.
- **Keep convention when:** A KPI row is conventional; make it truthful.
- **Decide:** What action follows from each KPI?
- **Content:** Tooltip definitions. **Motion:** Value change animation only on live updates. **Responsive:** 2-up on mobile. **A11y:** Delta direction in text, not colour only.
- **States:** Loading, stale, no data, target breached.
- **Build:** Tabular figures; locale formatting.
- **Test:** Definitions documented. **Severity:** A (C if fake). **Evidence:** B2.
- **Example:** "Revenue $1.2M ↑12%" → "Collected this month €84,210 · vs €76,900 last month · target €90k", which opens the invoice list.

### Filters
- **Job:** Narrow a set to relevant items.
- **Generic:** Filter UI that doesn't change results, or that resets on navigation. **Why it fails:** C if fake; unresolved otherwise.
- **Stronger:** Facets from the data; counts per option; applied-filter chips with clear; URL state; zero-result prevention (disable or show counts).
- **Keep convention when:** Standard faceted filters are expected in e-commerce and data.
- **Decide:** Which attributes do users filter by (logs, research)?
- **Content:** Facet labels in user language. **Motion:** Results update without jumping; loading indicated. **Responsive:** A bottom sheet with apply and reset on mobile. **A11y:** Grouped checkboxes; result count announced.
- **States:** Applied, no results, loading, error.
- **Build:** URL search params as source of truth.
- **Test:** Filters change results; back button restores them. **Severity:** C if they don't filter. **Evidence:** F8.
- **Example:** Decorative "Filter" button → facets for Status (12) · Client (34) · Period, with chips and "Clear all".

### Sort controls
- **Job:** Reorder results by a chosen attribute.
- **Generic:** An unlabeled sort icon; sorting not reflected anywhere. **Why it fails:** Unresolved.
- **Stronger:** Labelled sort select or sortable column headers with direction shown; a default that matches the dominant task.
- **Keep convention when:** Always conventional.
- **Decide:** What's the most useful default order?
- **Content:** "Newest first", "Amount: high to low". **Motion:** Reorder with FLIP. **Responsive:** Select on mobile. **A11y:** `aria-sort` on headers; announced change.
- **States:** —
- **Build:** URL state.
- **Test:** Keyboard. **Severity:** A. **Evidence:** —
- **Example:** A ↕ icon → "Sort: Oldest unmatched first".

### Search and query builders
- **Job:** Express complex queries.
- **Generic:** A raw text box expecting a query syntax nobody knows; or nested condition builders that are hard to read. **Why it fails:** Unresolved.
- **Stronger:** Token-based queries with autocomplete (field:value), a readable summary sentence, saved queries, examples.
- **Keep convention when:** Power users may prefer syntax; offer both.
- **Decide:** User expertise level.
- **Content:** Example queries. **Motion:** —. **Responsive:** Simplified builder on mobile. **A11y:** Combobox for tokens; the summary as live text.
- **States:** Invalid query (explain), no results, slow query (cancel).
- **Build:** Parser with errors that point to position.
- **Test:** Error messages. **Severity:** A. **Evidence:** —
- **Example:** "status=unmatched AND amount>500" → tokens [Status: Unmatched] [Amount > €500], with "Showing unmatched transactions over €500".

### Pagination
- **Job:** Navigate large result sets.
- **Generic:** Page numbers without context; infinite scroll that hides the footer. **Why it fails:** Unresolved.
- **Stronger:** Result count, page size options, URL state; "Load more" for browsing; cursor pagination for feeds.
- **Keep convention when:** Conventional.
- **Decide:** Do users need to return to a specific position?
- **Content:** "Showing 21–40 of 312". **Motion:** —. **Responsive:** Prev/next plus current on mobile. **A11y:** `nav aria-label="Pagination"`, `aria-current="page"`.
- **States:** First, last, loading.
- **Build:** —
- **Test:** Deep link to page 4. **Severity:** A. **Evidence:** —
- **Example:** "1 2 3 … 16" alone → plus "Showing 21–40 of 312 transactions".

### Activity feeds
- **Job:** Show what happened, by whom, when.
- **Generic:** Fake "Sarah just signed up!" notifications on marketing sites. **Why it fails:** C (deceptive social proof).
- **Stronger:** Real audit trails in apps: actor, action, object, time, grouped by day; filters; links to objects.
- **Keep convention when:** In apps, conventional.
- **Decide:** Real data only.
- **Content:** Precise verbs. **Motion:** New items slide in with an announcement. **Responsive:** —. **A11y:** Live region for new events (polite).
- **States:** Empty, loading older, error.
- **Build:** Relative times with absolute tooltips.
- **Test:** —. **Severity:** C if fake. **Evidence:** security §9.
- **Example:** Fake purchase popups → removed; in the app, "Dana matched 14 transactions in Harbor & Co. · 10:42".

### Command menus
- **Job:** Fast keyboard access to actions and navigation.
- **Generic:** A ⌘K palette that only searches pages, or exists only for show. **Why it fails:** Unresolved or decorative.
- **Stronger:** Actions plus navigation plus recent items; fuzzy search; shortcuts shown; grouped results; context-aware commands.
- **Keep convention when:** Pro tools.
- **Decide:** List the top 20 actions; make them reachable.
- **Content:** Verb-first labels. **Motion:** Instant open (≤ 100 ms). **Responsive:** A search sheet on mobile. **A11y:** Dialog plus combobox/listbox pattern.
- **States:** Empty query (recents), no results, executing.
- **Build:** cmdk or the project's existing primitives.
- **Test:** Keyboard-only flows. **Severity:** A. **Evidence:** —
- **Example:** Pages-only palette → "Match transaction…", "New invoice for…", "Go to client…".

### Dashboard panels
- **Job:** Group related metrics or views on one screen.
- **Generic:** A bento grid of glowing cards with random charts. **Why it fails:** Generic and unverified.
- **Stronger:** Layout follows the monitoring workflow (glance → detect → drill); consistent panel anatomy (title, period, value, context, link); reserved geometry.
- **Keep convention when:** Conventional panel grids are fine with truthful content.
- **Decide:** What decision does this dashboard support?
- **Content:** Real definitions. **Motion:** No entrance animations; updates highlight changes subtly. **Responsive:** Priority stacking. **A11y:** Landmarks and headings per panel; keyboard to drill-down.
- **States:** Loading with fixed size, error per panel, stale, partial.
- **Build:** Reserve dimensions (lab CLS ~1.0 seen when panels resize); lazy-load below the fold.
- **Test:** CLS in lab; error panel. **Severity:** A (C if fake data presented as real). **Evidence:** G9.
- **Example:** Bento of neon charts → a top row of "Needs attention" counts, then trend panels with drill-down links.

### Side-detail inspectors
- **Job:** View and edit an item's details without losing list context.
- **Generic:** A modal for every detail view. **Why it fails:** Unresolved. Loses context; blocks comparison.
- **Stronger:** A side panel synced with the selection; keyboard navigation between items; URL state; resizable.
- **Keep convention when:** Master-detail is conventional and right.
- **Decide:** Do users move item to item? Then use an inspector.
- **Content:** Most-used fields first. **Motion:** Slides from the side; content cross-fades between items. **Responsive:** Becomes a full-screen view on mobile. **A11y:** Focus moves to the panel heading; Escape returns focus to the row.
- **States:** Loading, editing, unsaved changes, error.
- **Build:** —
- **Test:** j/k or arrow navigation between items. **Severity:** A. **Evidence:** —
- **Example:** Modal per transaction → an inspector panel; ↑/↓ moves between transactions.

### Monitoring interfaces
- **Job:** Detect anomalies and respond.
- **Generic:** Pulsing "live" dots and constantly animating charts. **Why it fails:** Generic. Motion fatigue hides real alerts.
- **Stronger:** Calm baseline; motion and colour reserved for anomalies; thresholds visible; time range always visible; acknowledgement workflow.
- **Keep convention when:** —
- **Decide:** What must interrupt the user?
- **Content:** Alert text with cause and action. **Motion:** Only for state changes. **Responsive:** Alerts list first on mobile. **A11y:** Alerts in live regions (assertive only for critical); no flashing.
- **States:** Normal, warning, critical, acknowledged, data delayed.
- **Build:** Efficient streaming updates; throttle re-render.
- **Test:** Long-running memory. **Severity:** A. **Evidence:** E1.
- **Example:** Pulsing dots everywhere → a still screen until a threshold breaks, then one highlighted panel with "Acknowledge".

### Multi-step configuration
- **Job:** Set up complex objects (integrations, products, plans).
- **Generic:** One enormous form, or a wizard that hides dependencies. **Why it fails:** Unresolved.
- **Stronger:** A live summary or preview beside the steps; dependencies explained; validation per step; save as draft.
- **Keep convention when:** —
- **Decide:** Do choices interact? Then show a live preview.
- **Content:** Explanations for consequences. **Motion:** The preview updates smoothly. **Responsive:** The summary collapses into a sticky footer. **A11y:** Step headings; focus management.
- **States:** Draft, invalid combination, saving, applied.
- **Build:** State machine for steps.
- **Test:** Back and forth keeps state. **Severity:** A. **Evidence:** —
- **Example:** A 40-field form → three steps with a live "What will sync" summary.

### Bulk actions
- **Job:** Act on many items at once.
- **Generic:** Checkbox per row with no select-all-across-pages; destructive bulk without undo. **Why it fails:** Unresolved.
- **Stronger:** A selection bar showing the count and scope ("all 312 matching"); safe actions; progress for long jobs; undo.
- **Keep convention when:** Conventional.
- **Decide:** What scope do users mean: page, or all matching?
- **Content:** "14 selected · Select all 312". **Motion:** The selection bar slides in. **Responsive:** Long-press to select on mobile, plus a visible "Select" mode. **A11y:** Announce the selection count; keyboard select (Space, Shift+click equivalent).
- **States:** Partial failure ("12 of 14 archived").
- **Build:** Background jobs with progress.
- **Test:** Partial failure path. **Severity:** A. **Evidence:** —
- **Example:** Silent bulk delete → "Archive 14 transactions" with "Undo" and a partial failure report.

### Saved views
- **Job:** Return to a configured perspective quickly.
- **Generic:** None, or saved views that silently drift. **Why it fails:** Unresolved.
- **Stronger:** Named views storing filters, sort and columns; shareable URLs; an "unsaved changes" indicator.
- **Keep convention when:** —
- **Decide:** Do users repeat the same filter setups?
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** A view selector as a menu or listbox.
- **States:** Modified (unsaved), shared, default.
- **Build:** Persisted server-side.
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** "Unmatched > €500 this quarter" saved, with a dot when modified.

### Data export
- **Job:** Get data out in useful formats.
- **Generic:** An export button that downloads everything as unlabeled CSV, or does nothing. **Why it fails:** C if non-functional.
- **Stronger:** Export the current view (filters applied) in chosen formats; column selection; progress for large exports; emailed when ready.
- **Keep convention when:** Conventional.
- **Decide:** What do users do with exports (spreadsheets, accounting software)?
- **Content:** File names with date and view. **Motion:** —. **Responsive:** —. **A11y:** Status announced.
- **States:** Preparing, ready, failed.
- **Build:** Server-side generation for large sets.
- **Test:** Open the export in a spreadsheet. **Severity:** C if fake. **Evidence:** F8.
- **Example:** "Export" → "Export 312 transactions (current filters) · CSV · XLSX".

### Notification systems
- **Job:** Inform users about events that need attention.
- **Generic:** A bell with a red badge that counts everything; toasts for every action. **Why it fails:** Generic. Noise hides signal.
- **Stronger:** Priority tiers (blocking, action-needed, informational); grouping; preferences; inbox with read state; toasts only for transient confirmations.
- **Keep convention when:** The bell inbox is conventional.
- **Decide:** Should this event interrupt?
- **Content:** Actionable text. **Motion:** Subtle; no shaking bells. **Responsive:** —. **A11y:** Live region politeness by tier; focus not stolen.
- **States:** Unread, read, snoozed, muted.
- **Build:** Batching; de-duplication.
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** 87 badge count → "3 need action" plus a quiet activity log.

---

## 8.8 Feedback and system states

### Loading states
- **Job:** Communicate that work is happening and roughly how long it'll take.
- **Generic:** Full-page spinners; spinners on content that could render progressively. **Why it fails:** Unresolved. Blocks everything.
- **Stronger:** Progressive rendering; local loading indicators where data loads; optimistic UI where safe; real progress for long tasks.
- **Keep convention when:** Short waits (< 1 s): no indicator, or a delayed one.
- **Decide:** < 300 ms nothing; 300 ms–2 s an indicator; > 2 s progress or explanation.
- **Content:** Explain long waits. **Motion:** Calm indicators; no fast spinners for long waits. **Responsive:** —. **A11y:** `aria-busy` on regions; status text.
- **States:** Slow, timeout, error.
- **Build:** Delay showing spinners (~300 ms) to avoid flashes.
- **Test:** Throttled network. **Severity:** A. **Evidence:** —
- **Example:** Full-screen spinner → the page shell renders and the ledger table shows "Loading March transactions…" in place.

### Skeletons
- **Job:** Preview layout while content loads to reduce perceived wait and CLS.
- **Generic:** Shimmering grey blocks that don't match the final layout. **Why it fails:** Unresolved. Causes layout shift; misleads.
- **Stronger:** Skeletons that match final geometry exactly; used only for content-heavy regions; no shimmer under reduced motion.
- **Keep convention when:** Feeds, tables, cards.
- **Decide:** Is the final layout predictable? If not, use a simple indicator.
- **Content:** —. **Motion:** Subtle pulse or none. **Responsive:** Matches each breakpoint. **A11y:** `aria-hidden` skeletons plus a status message.
- **States:** —
- **Build:** Shared dimensions with the real component.
- **Test:** CLS when content arrives. **Severity:** A. **Evidence:** G9.
- **Example:** Generic grey bars → table rows with the exact column widths and row height.

### Progress indicators
- **Job:** Show completion of a known-length task.
- **Generic:** Fake progress bars that crawl to 99%. **Why it fails:** C (deceptive).
- **Stronger:** Determinate when measurable (bytes, steps); indeterminate otherwise; step counts for flows.
- **Keep convention when:** Conventional.
- **Decide:** Can you measure it? If not, don't fake a percentage.
- **Content:** "Uploading 3 of 8 receipts". **Motion:** Smooth but truthful. **Responsive:** —. **A11y:** `<progress>` or `role="progressbar"` with values.
- **States:** Paused, failed, completed.
- **Build:** Tied to real events.
- **Test:** `slop_scan` fake-progress. **Severity:** C if fake. **Evidence:** G7.
- **Example:** A timer-driven 0–100% → "Importing 1,240 of 3,018 transactions".

### Empty states
- **Job:** Explain why there's nothing and what to do.
- **Generic:** A cute illustration with "Nothing here yet!". **Why it fails:** Generic. No guidance.
- **Stronger:** Distinguish first-use (teach and offer the first action), filtered-empty (show filters and clear) and cleared (celebrate if meaningful, like inbox zero); a sample-data option where useful.
- **Keep convention when:** —
- **Decide:** Which empty case is this?
- **Content:** Specific next step. **Motion:** —. **Responsive:** Compact on mobile. **A11y:** Heading plus action.
- **States:** First-use, filtered, error-caused emptiness (distinct!).
- **Build:** —
- **Test:** Each empty case reachable. **Severity:** A. **Evidence:** B1.
- **Example:** "No data 🙁" → "No unmatched transactions in March. Next: review April (12 waiting) →".

### Errors
- **Job:** Explain failures and how to recover.
- **Generic:** "Oops! Something went wrong." **Why it fails:** Unresolved. No cause, no recovery.
- **Stronger:** What happened (in user terms), what's preserved, how to fix or retry, a support path with a reference ID.
- **Keep convention when:** —
- **Decide:** Is the error user-fixable, transient or systemic? The copy differs for each.
- **Content:** Specific. **Motion:** No playful motion on errors. **Responsive:** —. **A11y:** Announce (alert role for blocking errors); focus to the error summary.
- **States:** Inline, page-level, global outage.
- **Build:** Error boundaries per region (one failing panel doesn't kill the page).
- **Test:** Simulate API failures. **Severity:** C if errors are silent. **Evidence:** experience-flow §5.
- **Example:** "Something went wrong" → "The bank didn't respond. Your matches are saved. Retry now, or we'll try again in 5 minutes."

### Success messages
- **Job:** Confirm an outcome and point to what's next.
- **Generic:** Confetti for trivial actions; success without details. **Why it fails:** Generic.
- **Stronger:** Proportional celebration (milestones only); specific confirmation; next action; undo where relevant.
- **Keep convention when:** —
- **Decide:** Is it a milestone or routine?
- **Content:** Name the object and outcome. **Motion:** Brief; reduced motion = static. **Responsive:** —. **A11y:** Polite live region.
- **States:** —
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** Confetti on save → "March closed for Harbor & Co. Report ready ↓", with a small stamp animation matching the brand.

### Warnings
- **Job:** Alert users before a problem happens.
- **Generic:** Yellow banners that never go away. **Why it fails:** Generic. Banner blindness.
- **Stronger:** Contextual warnings near the risk, with an action; dismissible when informational; persistent only while true.
- **Keep convention when:** Conventional styling (amber plus icon) is fine.
- **Decide:** Is there an action the user can take?
- **Content:** Cause plus action. **Motion:** —. **Responsive:** —. **A11y:** Not colour-only; `role="status"` or alert as appropriate.
- **States:** Dismissed, resolved.
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** Global "Some features may not work" → "Bank feed for Harbor & Co. expires in 3 days · Reconnect".

### Toast notifications
- **Job:** Transient, non-blocking confirmation.
- **Generic:** Toasts for errors that need action; toasts that disappear before they can be read. **Why it fails:** Unresolved.
- **Stronger:** Toasts only for confirmations or undo; errors needing action go inline; duration based on length (≥ 5 s), pausing on hover and focus.
- **Keep convention when:** Conventional.
- **Decide:** Must the user act? Then not a toast.
- **Content:** Short plus an optional action. **Motion:** Enter from a consistent edge; reduced = fade. **Responsive:** Bottom on mobile, clear of navigation. **A11y:** Live region; actions reachable by keyboard; not auto-dismissed while focused.
- **States:** Stacked, with action, dismissed.
- **Build:** A single toast manager.
- **Test:** Screen reader announces. **Severity:** A. **Evidence:** —
- **Example:** A 2-second error toast → an inline field error; the toast is used only for "Archived · Undo".

### Dialogs
- **Job:** Focused tasks or information that require attention.
- **Generic:** Modals for everything; modals without focus management. **Why it fails:** Unresolved.
- **Stronger:** Modals for short, focused tasks; side panels or pages for longer ones; non-modal dialogs for tools.
- **Keep convention when:** Behaviour is always conventional.
- **Decide:** Does it need to block the page?
- **Content:** Title states the task. **Motion:** Emerges from the trigger; reduced = fade. **Responsive:** Full-screen sheet on mobile for longer content. **A11y:** `<dialog>`/APG: focus in, trap, Escape, return focus, `aria-labelledby`.
- **States:** Open, submitting, error, dirty (confirm close).
- **Build:** Native `<dialog>` or the project's primitive.
- **Test:** Keyboard trap check. **Severity:** C if focus escapes. **Evidence:** E4.
- **Example:** A modal holding a 20-field form → a dedicated page with breadcrumbs.

### Confirmation modals
- See "Confirmation flows" (8.5). Use `alertdialog`; name the object and consequence; the default focus is the safe action. **Severity:** A. **Evidence:** E4.

### Tooltips
- **Job:** Brief supplementary hints.
- **Generic:** Essential information hidden in hover-only tooltips; interactive content in tooltips. **Why it fails:** Unresolved (touch and keyboard users can't access it).
- **Stronger:** Visible text for essentials; tooltips for supplementary hints, available on hover and focus; popovers for interactive content.
- **Keep convention when:** Icon-button names, definitions.
- **Decide:** Would anyone be stuck without it? Then make it visible.
- **Content:** ≤ 1 sentence. **Motion:** ~100 ms delay in, instant out. **Responsive:** Tap to show for definitions. **A11y:** `aria-describedby`; dismissible with Escape; hoverable (1.4.13).
- **States:** —
- **Build:** Anchor positioning or a library.
- **Test:** Keyboard focus shows the tooltip. **Severity:** C if essential info is hover-only. **Evidence:** E-section.
- **Example:** Hover-only "Fees apply" → visible "€0.20 per transfer" text, with a tooltip for the fee definition.

### Popovers
- **Job:** Small interactive panels anchored to a trigger (menus, pickers).
- **Generic:** Custom popovers without light-dismiss or focus management. **Why it fails:** Unresolved.
- **Stronger:** The Popover API or a primitive; light dismiss; Escape; focus returns; positioned to stay on screen.
- **Keep convention when:** Conventional.
- **Decide:** Popover (non-modal) vs dialog (modal).
- **Content:** —. **Motion:** `@starting-style` entry. **Responsive:** Becomes a bottom sheet on small screens. **A11y:** `aria-expanded` on the trigger; menu pattern if it's a menu.
- **States:** Open, closed, overflow.
- **Build:** `popover` attribute plus anchor positioning with fallback.
- **Test:** Escape and outside click. **Severity:** A. **Evidence:** D9.
- **Example:** A div that never closes → a `popover` date picker that light-dismisses.

### Offline states
- **Job:** Keep users informed and productive without a network.
- **Generic:** A browser error page or a silent failure. **Why it fails:** Unresolved.
- **Stronger:** Detect offline; show a persistent but quiet indicator; queue actions; read cached content; sync on reconnect with results.
- **Keep convention when:** —
- **Decide:** What can work offline?
- **Content:** "You're offline. 3 changes will sync when you reconnect." **Motion:** —. **Responsive:** —. **A11y:** Status announced.
- **States:** Offline, reconnecting, sync conflict.
- **Build:** `navigator.onLine` plus fetch failure detection; service worker if the app needs it.
- **Test:** DevTools offline. **Severity:** A (C for data loss). **Evidence:** —
- **Example:** Silent failures → an offline banner and queued matches.

### Retry flows
- **Job:** Recover from transient failures.
- **Generic:** "Try again" that re-submits everything, or infinite auto-retries. **Why it fails:** Unresolved.
- **Stronger:** Idempotent retries; exponential backoff; manual retry with state preserved; failure reason shown.
- **Keep convention when:** —
- **Decide:** Is the operation idempotent?
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** Announce the retry outcome.
- **States:** Retrying (attempt n), gave up.
- **Build:** Request IDs for idempotency.
- **Test:** Simulated flaky API. **Severity:** A. **Evidence:** —
- **Example:** Double-charged retry → an idempotent payment retry with "Attempt 2 of 3".

### Permission failures
- **Job:** Explain why access is denied and how to get it.
- **Generic:** A blank page or a generic 403. **Why it fails:** Unresolved.
- **Stronger:** Explain what's restricted, who can grant access, and offer a request-access action; hide unusable actions proactively.
- **Keep convention when:** —
- **Decide:** Can the user request access?
- **Content:** Names the role needed. **Motion:** —. **Responsive:** —. **A11y:** Heading plus action.
- **States:** Requested, approved, denied.
- **Build:** Permission-aware UI.
- **Test:** Each role's view. **Severity:** A. **Evidence:** —
- **Example:** "403 Forbidden" → "Only workspace admins can export payroll. Ask Dana (admin) for access."

### Authentication expiry
- **Job:** Re-authenticate without losing work.
- **Generic:** Silent logout that discards form input. **Why it fails:** C (data loss).
- **Stronger:** Warn before expiry; re-auth in a dialog; preserve input and return to the same state.
- **Keep convention when:** —
- **Decide:** —
- **Content:** "Your session expired. Sign in to continue. Your draft is saved." **Motion:** —. **Responsive:** —. **A11y:** WCAG 2.2.1 timing adjustable where applicable; 3.3.8 accessible authentication.
- **States:** Expiring soon, expired, re-authenticated.
- **Build:** Token refresh; draft persistence.
- **Test:** Expire the session mid-form. **Severity:** C if work is lost. **Evidence:** E3.
- **Example:** A redirect to login that loses the invoice → an in-place re-auth dialog, then the invoice is still there.

### Unsaved changes
- **Job:** Prevent accidental loss of edits.
- **Generic:** `beforeunload` prompts on every page, or none at all. **Why it fails:** Unresolved.
- **Stronger:** Autosave where possible; a dirty indicator; prompt only on real unsaved changes; in-app navigation guard with save/discard.
- **Keep convention when:** —
- **Decide:** Can you autosave?
- **Content:** "You have unsaved changes to 'March report'." **Motion:** —. **Responsive:** —. **A11y:** Dialog semantics.
- **States:** Dirty, saving, saved, conflict.
- **Build:** Router guard plus `beforeunload` only when dirty.
- **Test:** Navigate away while dirty. **Severity:** A (C if silent data loss). **Evidence:** —
- **Example:** No warning → a "Saved 2 s ago" indicator with autosave.

### Partial failures
- **Job:** Report mixed results honestly.
- **Generic:** "Success!" when only some items succeeded. **Why it fails:** C (false claim).
- **Stronger:** "12 of 14 sent. 2 failed: invalid email (show) · Retry failed".
- **Keep convention when:** —
- **Decide:** —
- **Content:** Counts plus reasons. **Motion:** —. **Responsive:** —. **A11y:** Announce the summary.
- **States:** —
- **Build:** Per-item results from the API.
- **Test:** Simulate mixed outcomes. **Severity:** C if misreported. **Evidence:** security §10.
- **Example:** A generic success toast → a result panel listing the failures with a fix action.

---

## 8.9 Product-specific experiences

### Onboarding
- **Job:** Get new users to first value fast.
- **Generic:** A 5-slide carousel of features before the product; tooltip tours pointing at everything. **Why it fails:** Generic. Delays value; users skip it.
- **Stronger:** Value-first: a working setup in the fewest steps; learn-by-doing with real (or labelled sample) data; progressive tips triggered by context.
- **Keep convention when:** —
- **Decide:** What is "first value"? Measure the steps to reach it.
- **Content:** Explain why each step is needed. **Motion:** Step transitions show progress; a celebration only at first value. **Responsive:** Mobile-first flows if sign-ups come from phones. **A11y:** Focus management per step; skip option.
- **States:** Skipped, resumed later, partially complete.
- **Build:** A persisted onboarding state machine.
- **Test:** Time to first value. **Severity:** A. **Evidence:** project-modes §7.
- **Example:** A feature carousel → "Connect one bank account" → see 30 days of transactions already matched.

### Sign-up and sign-in
- **Job:** Create or access an account with minimum friction and maximum trust.
- **Generic:** A split screen with a stock image and a generic form; CAPTCHAs; password rules revealed after failure. **Why it fails:** Generic and unresolved.
- **Stronger:** Minimal fields; passkeys or SSO where supported; `autocomplete` tokens; password rules visible up front; clear errors; no cognitive puzzles (WCAG 3.3.8).
- **Keep convention when:** Always conventional in behaviour.
- **Decide:** Which fields are truly needed at sign-up?
- **Content:** Reassurance (what happens next, privacy). **Motion:** Minimal. **Responsive:** Single column. **A11y:** Labels, error summary, show-password toggle, no paste blocking.
- **States:** Wrong password, locked, unverified email, SSO error, magic link sent.
- **Build:** Never roll your own auth crypto; use the project's auth provider.
- **Test:** Password manager autofill. **Severity:** C if inaccessible authentication. **Evidence:** E3.
- **Example:** 8-field sign-up → email plus password (or Google), with the rest asked later in context.

### First-run guidance
- **Job:** Orient users in an empty product.
- **Generic:** Coachmark tours pointing at every button. **Why it fails:** Generic.
- **Stronger:** Empty states that teach; a checklist of 3–5 meaningful first tasks; contextual hints when a feature first becomes relevant.
- **Keep convention when:** —
- **Decide:** Which three actions lead to retention?
- **Content:** —. **Motion:** Subtle highlight for the next step. **Responsive:** —. **A11y:** Coachmarks are dialogs with focus management, or avoid them.
- **States:** Dismissed, completed.
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** A 9-step tour → a "Get set up" checklist: connect bank · invite client · close first month.

### Settings
- **Job:** Let users configure the product confidently.
- **Generic:** A long page of switches without explanation or save feedback. **Why it fails:** Unresolved.
- **Stronger:** Grouped by mental model; search in settings; descriptions of consequences; instant-save with confirmation or explicit save with a dirty state; dangerous settings separated.
- **Keep convention when:** Conventional layout (sidebar sections) is fine.
- **Decide:** Instant vs batch saving per section; be consistent.
- **Content:** Consequence descriptions. **Motion:** Saved-state feedback. **Responsive:** Sections become a list → detail. **A11y:** Fieldsets, labels.
- **States:** Saving, saved, error, permission-limited.
- **Build:** —
- **Test:** Every setting actually takes effect. **Severity:** C if settings do nothing. **Evidence:** F8.
- **Example:** 40 unexplained toggles → sections (Notifications · Bank connections · Invoicing · Danger zone) with descriptions.

### Preferences
- **Job:** Personalise the experience (theme, density, motion, language).
- **Generic:** A dark-mode toggle only. **Why it fails:** Generic.
- **Stronger:** Theme (system/light/dark), density, **motion (system/reduced/full)**, language and region, notification preferences, all persisted.
- **Keep convention when:** —
- **Decide:** —
- **Content:** —. **Motion:** The preference applies instantly. **Responsive:** —. **A11y:** The motion preference is a WCAG 2.3.3 technique; respects OS defaults.
- **States:** —
- **Build:** CSS custom properties and data attributes on `<html>`.
- **Test:** Reload persists. **Severity:** A. **Evidence:** E1.
- **Example:** Theme toggle only → theme plus density plus "Reduce motion" options.

### User profiles
- **Job:** Represent a person and let them manage their identity.
- **Generic:** A large avatar plus a bio form, with random avatar placeholders. **Why it fails:** Generic.
- **Stronger:** Initials or monogram fallback in the brand style; only the fields others need; privacy controls visible.
- **Keep convention when:** —
- **Decide:** Who sees this profile?
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** Alt text for the avatar is the name, or empty if redundant.
- **States:** No photo, pending verification.
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** A pravatar placeholder → a monogram tile using the brand's type.

### Permissions
- **Job:** Control who can do what.
- **Generic:** A matrix of 60 checkboxes. **Why it fails:** Unresolved. Error-prone.
- **Stronger:** Role presets with descriptions; a diff when customising; a preview ("Dana will be able to…"); audit trail.
- **Keep convention when:** —
- **Decide:** Can most needs be met by 3–4 roles?
- **Content:** Plain-language capabilities. **Motion:** —. **Responsive:** —. **A11y:** Table semantics for matrices.
- **States:** Pending invite, conflicting rules.
- **Build:** Server-enforced.
- **Test:** Each role's actual capabilities. **Severity:** C if the UI misrepresents real permissions. **Evidence:** —
- **Example:** A checkbox matrix → roles "Owner · Bookkeeper · Client (view only)" with "what they can do" lists.

### Billing
- **Job:** Make cost, usage and payment transparent.
- **Generic:** A hidden plan page; surprise charges; a cancel flow behind support. **Why it fails:** Deceptive (C for dark patterns).
- **Stronger:** Current plan, usage versus limits, next invoice estimate, invoices downloadable, upgrade or downgrade with proration shown, cancellation as easy as sign-up.
- **Keep convention when:** —
- **Decide:** —
- **Content:** Exact amounts and dates. **Motion:** —. **Responsive:** —. **A11y:** Tables for invoices.
- **States:** Payment failed, trial ending, over limit.
- **Build:** Billing provider portal or equivalent.
- **Test:** Cancellation path. **Severity:** C for roach-motel cancellation. **Evidence:** security §9.
- **Example:** "Contact us to cancel" → "Cancel plan" with the end date and what happens to data.

### Checkout
- **Job:** Complete a purchase quickly and safely.
- **Generic:** Expressive animation in checkout; surprise shipping costs at the last step; forced account creation. **Why it fails:** Unresolved and deceptive.
- **Stronger:** Conventional, fast, transparent: guest checkout, totals visible early, address autocomplete, wallet payments, clear errors, order summary always visible.
- **Keep convention when:** **Always conventional.** Distinction lives in clarity and trust signals.
- **Decide:** Remove every field not needed for fulfilment.
- **Content:** Delivery dates, return policy. **Motion:** Feedback only. **Responsive:** Mobile-first; summary collapsible. **A11y:** Forms rules; error summary; no time limits without extension.
- **States:** Experience-flow §5 checkout inventory.
- **Build:** Payment provider's hosted fields or elements; idempotent submit.
- **Test:** End to end with test payments; failure paths. **Severity:** C for broken or deceptive steps. **Evidence:** project-modes §5.
- **Example:** A parallax checkout → a two-step checkout with the summary pinned and Apple Pay on top.

### Shopping carts
- **Job:** Review and adjust before buying.
- **Generic:** A slide-out cart with fake urgency timers. **Why it fails:** Deceptive.
- **Stronger:** Editable quantities, stock status, delivery estimate, saved for later, a clear total, real promotions only.
- **Keep convention when:** Conventional.
- **Decide:** —
- **Content:** Real stock info. **Motion:** The item flies to the cart only if fast and meaningful (it shows where the item went). **Responsive:** Full-screen drawer on mobile. **A11y:** Quantity steppers labelled; updates announced.
- **States:** Empty, item unavailable, price changed.
- **Build:** Persist the cart.
- **Test:** Out-of-stock path. **Severity:** C for fake urgency. **Evidence:** security §9.
- **Example:** "Reserved for 09:59" timer → "Only 2 left in stock" (when true), from the inventory API.

### Product configuration
- **Job:** Let buyers build the right variant and see it.
- **Generic:** Swatches that don't update the image; a 3D viewer that spins but doesn't reflect choices. **Why it fails:** Unresolved.
- **Stronger:** Live preview of each choice (image or 3D), price impact shown, incompatible options explained, a shareable configuration URL, a summary before adding to cart.
- **Keep convention when:** —
- **Decide:** 2D image swap vs 3D: is the 3D worth the load for this product?
- **Content:** Option descriptions and availability. **Motion:** Preview transitions keep orientation; reduced = cross-fade. **Responsive:** Preview on top, options in a sheet. **A11y:** Options as radio groups; preview changes described in text.
- **States:** Loading a variant image, unavailable combination, out of stock.
- **Build:** Preload likely variants; lazy 3D after the poster.
- **Test:** Every option combination valid. **Severity:** A (C if the preview misrepresents the product). **Evidence:** —
- **Example:** Colour dots with a static photo → glaze chips that change the cup render and show "Ships in 3 weeks (hand-dipped)".

### Search and discovery
- **Job:** Help users find what they want, or discover what they didn't know.
- **Generic:** A search box plus "Trending" chips with fake trends. **Why it fails:** Unverified and generic.
- **Stronger:** Good search (8.5) plus browsing structures from the content (collections, facets, editorial curation) plus recently viewed.
- **Keep convention when:** —
- **Decide:** How do users describe what they want?
- **Content:** Real popular items (from data). **Motion:** —. **Responsive:** —. **A11y:** Search landmark; results count announced.
- **States:** See the search inventory.
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** "Trending: AI, Productivity" chips → "Browse by glaze · by firing · by maker".

### Filters and sorting
- See "Filters" and "Sort controls" (8.7) and "Mobile filters" (8.11). Commerce-specific: show counts, keep filters across pagination, never return zero results without a recovery suggestion. **Severity:** C if non-functional. **Evidence:** F8.

### Saved items
- **Job:** Let users bookmark for later.
- **Generic:** A heart icon that does nothing for logged-out users. **Why it fails:** Unresolved.
- **Stronger:** Works logged out (local), syncs on login, has a dedicated list, and notifies on price or stock change if opted in.
- **Keep convention when:** Conventional.
- **Decide:** —
- **Content:** —. **Motion:** Heart fill with a subtle scale ≤ 150 ms. **Responsive:** —. **A11y:** Toggle button with `aria-pressed` and a name ("Save Cup no. 14").
- **States:** Saved, unsaved, syncing.
- **Build:** —
- **Test:** Logged-out save persists. **Severity:** A. **Evidence:** —
- **Example:** A decorative heart → a working "Save" with "Saved items (3)".

### Account management
- **Job:** Manage email, password, sessions, data and deletion.
- **Generic:** A buried account page; deletion via support. **Why it fails:** Unresolved or deceptive.
- **Stronger:** Clear sections; session list with sign-out; data export; self-serve deletion with consequences explained.
- **Keep convention when:** Conventional.
- **Decide:** —
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** Forms rules.
- **States:** Email change verification, 2FA setup.
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** —

### AI-assisted interfaces
- **Job:** Help users accomplish tasks with AI while keeping them in control.
- **Generic:** Sparkle buttons everywhere; a chat bubble bolted onto every screen; "AI-powered" pills. **Why it fails:** Generic (top AI-slop tell) and often unresolved (no failure handling).
- **Stronger:** AI embedded where the task is (suggested matches in the ledger, drafted replies); clear provenance (what the AI did, with sources); easy accept/edit/reject; confidence or uncertainty shown; undo.
- **Keep convention when:** —
- **Decide:** What decision does the AI help with, and how does the user verify it?
- **Content:** Labels like "Suggested match (from invoice #4412)". **Motion:** Streaming text with a stop control; no magical shimmer by default. **Responsive:** —. **A11y:** Streaming updates announced politely and not character by character; controls keyboard accessible.
- **States:** Thinking, streaming, done, error, refused, low confidence, rate-limited.
- **Build:** Abortable requests; optimistic UI only for user actions.
- **Test:** Failure and refusal paths. **Severity:** A (C if outputs are presented as verified fact). **Evidence:** B3 (sparkle icons).
- **Example:** "✨ Ask AI" floating button → inline "3 suggested matches" in the ledger with sources and Accept/Reject.

### Conversational interfaces
- **Job:** Complete tasks through dialogue.
- **Generic:** A chat window with bubbly avatars and no structure in responses. **Why it fails:** Generic and unresolved.
- **Stronger:** Structured responses (tables, actions, citations); suggested next steps; editable inputs; conversation history; a clear scope of capability.
- **Keep convention when:** Message lists are conventional.
- **Decide:** Would a form be faster? Use chat only where language is the best interface.
- **Content:** —. **Motion:** Streaming; scroll anchoring that doesn't fight the user. **Responsive:** The input stays above the keyboard. **A11y:** `role="log"`; new messages announced; focus management.
- **States:** Typing, streaming, error, retry, long history.
- **Build:** Virtualised history.
- **Test:** Screen-reader reading of new messages. **Severity:** A. **Evidence:** —
- **Example:** A generic chat → an assistant whose answers render as reconciliations with "Apply" buttons.

### Code editors
- **Job:** Write and read code comfortably.
- **Generic:** A textarea with a monospace font; or a heavy editor where a code block would do. **Why it fails:** Unresolved or overbuilt.
- **Stronger:** A proven editor (CodeMirror, Monaco) when editing; syntax-highlighted static blocks with copy buttons when reading.
- **Keep convention when:** Editor conventions (keybindings) must be respected.
- **Decide:** Read or edit?
- **Content:** —. **Motion:** None. **Responsive:** Horizontal scroll in code blocks; no wrapping by default for code. **A11y:** The editor's a11y mode; a Tab-trapping escape (Esc then Tab).
- **States:** Errors and diagnostics.
- **Build:** Lazy-load the editor.
- **Test:** Keyboard escape from the editor. **Severity:** A. **Evidence:** —
- **Example:** —

### Visual workflow builders
- **Job:** Compose logic visually (nodes and edges).
- **Generic:** Drag-only canvases with no keyboard support; unreadable edges. **Why it fails:** Unresolved (WCAG 2.5.7).
- **Stronger:** Nodes addable via menu or keyboard; auto-layout; readable edge routing; minimap; an outline/list view of the same graph; validation inline.
- **Keep convention when:** —
- **Decide:** Provide a non-canvas representation.
- **Content:** —. **Motion:** Edges animate only to show data flow when running. **Responsive:** Read-only or list mode on mobile. **A11y:** A list or tree view equivalent; keyboard to connect nodes.
- **States:** Invalid connection, running, error node.
- **Build:** React Flow or similar; virtualise large graphs.
- **Test:** Build a flow with the keyboard. **Severity:** C if drag is the only path. **Evidence:** E3.
- **Example:** —

---

## 8.10 Experimental and custom interactions

Experimentation is welcome when it **expresses the concept, communicates something, or makes a task better.** Decorative novelty without purpose fails the interaction and removal tests.

### Cursor-following graphics
- **Job:** Add presence or reveal content near the pointer.
- **Generic:** A custom cursor circle that lags behind the pointer, plus a trail, on every site. **Why it fails:** Generic award-site default; hurts precision; no touch equivalent.
- **Stronger:** Cursor effects only where the pointer *is* the tool (a brush on a canvas, a lens on a map, a spotlight in a dark gallery), never replacing the system cursor for normal UI.
- **Keep convention when:** The system cursor for UI.
- **Decide:** Interaction test: what does the cursor effect reveal?
- **Content:** —. **Motion:** No lag on the actual pointer; effects may trail. **Responsive:** Disabled on `(pointer: coarse)`, with an alternative reveal. **A11y:** Keyboard equivalent for anything revealed; reduced motion = off.
- **States:** Over interactive elements (system cursor), idle.
- **Build:** rAF-throttled pointer tracking; transforms only.
- **Test:** `slop_scan` pointer-effects trigger. **Severity:** A. **Evidence:** B7, corpus §13.
- **Example:** A lagging cursor blob → in a ceramics gallery, the cursor becomes a raking light that shows glaze texture. On touch, a light slider does the same.

### Magnetic interaction
- **Job:** Make targets feel physical and easier to hit.
- **Generic:** Every button and link pulled towards the cursor. **Why it fails:** Generic. Moving targets are harder to read and hit.
- **Stronger:** Rarely; only on a few large targets where a physical metaphor matters (a dial, a toy); a small offset (≤ 6 px).
- **Keep convention when:** No magnetism on standard UI.
- **Decide:** Removal test.
- **Content:** —. **Motion:** Spring back on leave. **Responsive:** Off on touch. **A11y:** Off under reduced motion; the hit area doesn't move away from the pointer.
- **States:** —
- **Build:** GSAP `quickTo` or a CSS variable; contextSafe cleanup.
- **Test:** —. **Severity:** A. **Evidence:** B7.
- **Example:** Magnetic nav links → static nav; the only magnetic element is the "drop the coin" target in a savings game.

### Hover reveals
- **Job:** Show secondary content on intent.
- **Generic:** Project grids where titles appear only on hover; images swapping on hover. **Why it fails:** Unresolved (invisible on touch and keyboard).
- **Stronger:** Titles always visible; hover adds richness (motion preview, more detail); the same content on focus and tap.
- **Keep convention when:** —
- **Decide:** Can a touch user get the same information?
- **Content:** —. **Motion:** ≤ 200 ms. **Responsive:** `(hover: hover)` gating. **A11y:** Focus-visible triggers the same reveal.
- **States:** —
- **Build:** CSS `:hover, :focus-visible`.
- **Test:** Touch emulation contact sheet. **Severity:** C if essential info is hover-only. **Evidence:** E-section.
- **Example:** Hover-only titles → titles always set below; hover plays a 3-second clip.

### Drag interactions
- **Job:** Direct manipulation: reorder, scrub, move, compare.
- **Generic:** Draggable carousels and decorative drag-to-explore canvases with no alternative. **Why it fails:** Unresolved (WCAG 2.5.7).
- **Stronger:** Drag where manipulation is the point (reorder, before/after, timeline scrub), with buttons or keys as alternatives and visible affordances.
- **Keep convention when:** —
- **Decide:** Is drag faster than the alternative for this task?
- **Content:** —. **Motion:** Follows the pointer exactly; inertia only if physical; snap feedback. **Responsive:** Touch handles larger. **A11y:** Keyboard or button alternative; announcements on move.
- **States:** Dragging, over target, dropped, cancelled.
- **Build:** Pointer events with capture; `touch-action` set correctly.
- **Test:** Complete the task without dragging. **Severity:** C if drag-only. **Evidence:** E3.
- **Example:** A drag-to-explore gallery → a before/after reconciliation slider, also operable by arrow keys.

### Infinite canvases
- **Job:** Explore large spatial collections.
- **Generic:** A pannable grid of images with no orientation. **Why it fails:** Unresolved. Users get lost.
- **Stronger:** Minimap or index; zoom levels with semantic detail; search; "return to start"; deep links to positions.
- **Keep convention when:** —
- **Decide:** Does spatial arrangement mean something (time, category, location)?
- **Content:** Spatial axes labelled. **Motion:** Inertial panning that can be stopped instantly. **Responsive:** Pinch and pan; a list mode. **A11y:** List or grid equivalent; keyboard panning.
- **States:** Loading tiles, empty regions.
- **Build:** Virtualised rendering; canvas or WebGL for large counts.
- **Test:** Memory over long sessions. **Severity:** A (C without an accessible equivalent). **Evidence:** Corpus §14.
- **Example:** A random image wall → works laid out by year (x) and medium (y), with an index view.

### Spatial navigation
- **Job:** Navigate content as places.
- **Generic:** A 3D room you must walk through to find "About". **Why it fails:** Unresolved. High cost for basic tasks.
- **Stronger:** Spatial when place is the content (an exhibition, a venue, a map); always paired with a direct index.
- **Keep convention when:** —
- **Decide:** Is the space real or meaningful?
- **Content:** —. **Motion:** Camera moves short, eased and interruptible; reduced = cuts. **Responsive:** Simplified paths. **A11y:** An index or menu escape; keyboard controls; an HTML layer.
- **States:** Loading areas, no WebGL.
- **Build:** Preload adjacent spaces.
- **Test:** Reach any destination in ≤ 2 actions via the index. **Severity:** C if content is unreachable without spatial navigation. **Evidence:** G7, corpus §11, §13.
- **Example:** "Walk to the About room" → rooms mirror the real exhibition, and an "Index" lists all 18 installations.

### Interactive maps
- **Job:** Explore location-based information.
- **Generic:** A decorative map with pins and no list; scroll hijacked by the map. **Why it fails:** Unresolved.
- **Stronger:** Map plus list synced; clustering; filters; the map captures scroll only after interaction ("click to interact"); keyboard and screen-reader list.
- **Keep convention when:** —
- **Decide:** Does location matter to the user's task?
- **Content:** Addresses as text. **Motion:** Fly-to animations short; reduced = jump. **Responsive:** List-first on mobile with a map toggle. **A11y:** List equivalent; focusable markers.
- **States:** Loading tiles, no results in view, geolocation denied.
- **Build:** `data-lenis-prevent` if smooth scroll exists; lazy-load the map library.
- **Test:** Page scroll isn't trapped. **Severity:** A (C if scroll is trapped). **Evidence:** D5.
- **Example:** Decorative pins → a store list with distances, synced with the map.

### Scroll-driven scenes
- See motion-intelligence.md §5 for method and safeguards. **Job:** Explain mechanisms or tell stories in sequence. **Generic:** Pinned sections with unrelated parallax layers; fade-up everything. **Stronger:** Scrub that explains a mechanism (photo → digital twin); text leads; short pins; a static equivalent. **Severity:** A (C if content is unreachable or scroll is trapped). **Evidence:** corpus §6, §7.

### 3D object manipulation
- **Job:** Inspect a product or object from all sides.
- **Generic:** An auto-rotating model that ignores input, or orbit controls on a decorative blob. **Why it fails:** Generic.
- **Stronger:** Inspection with purpose: hotspots for real features, preset views, scale reference, AR quick-look where available; poster first.
- **Keep convention when:** Simple image galleries are better when 3D adds nothing.
- **Decide:** Does 3D reveal something photos can't?
- **Content:** Real specs on hotspots. **Motion:** No auto-rotate by default (or stop on interaction); reduced = static views. **Responsive:** Lower-poly model on mobile. **A11y:** Buttons for preset views; text equivalents.
- **States:** Loading (real progress), error, no WebGL.
- **Build:** Compressed glTF; dispose on unmount.
- **Test:** Memory stable on route changes. **Severity:** A. **Evidence:** D6.
- **Example:** A spinning hero cube → a coaster model with hotspots on the cork grain and the edge radius, plus front/side/top views.

### WebGL environments
- See project-modes.md §10 and motion-implementation.md §12. Requirements: a reason (concept needs space, light or material), poster-first loading, quality tiers, fallback, HTML layer, reduced-motion version, disposal. **Severity:** C if no fallback hides essential content. **Evidence:** G8.

### Audio-reactive visuals
- **Job:** Make sound visible or sound-led experiences expressive.
- **Generic:** Autoplaying audio with visualiser bars. **Why it fails:** Unresolved (WCAG 1.4.2) and generic.
- **Stronger:** Opt-in audio; visuals reflect musical structure; captions or transcripts for spoken content; a visible mute.
- **Keep convention when:** —
- **Decide:** Is sound the content?
- **Content:** —. **Motion:** No flashing over 3 per second. **Responsive:** —. **A11y:** Opt-in; mute; no flashing; reduced motion = gentle.
- **States:** Muted, playing, permission blocked.
- **Build:** Web Audio API; AnalyserNode; pause on hidden tab.
- **Test:** Flash frequency. **Severity:** C if audio autoplays or flashes. **Evidence:** E1.
- **Example:** —

### Generative patterns
- **Job:** Create unique, systematic visuals (per user, per item, per data point).
- **Generic:** Random noise blobs as a background "for interest". **Why it fails:** Generic decoration.
- **Stronger:** Generation driven by real data (each product's measurements → its pattern; each article's word count → its cover).
- **Keep convention when:** —
- **Decide:** What input drives the generation?
- **Content:** —. **Motion:** Optional slow evolution; pausable. **Responsive:** Deterministic at all sizes. **A11y:** Decorative = `aria-hidden`; if meaningful, describe it.
- **States:** —
- **Build:** Deterministic seeds; SVG or canvas.
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** Random gradient blobs → each ceramic piece's card shows a pattern drawn from its actual firing curve.

### Interactive storytelling
- **Job:** Let the audience participate in a narrative.
- **Generic:** Clickable chapters with fade-ins. **Why it fails:** Generic.
- **Stronger:** Choices or inputs that change what is shown (personalised data, branching), with a clear path back and a linear version.
- **Keep convention when:** —
- **Decide:** Does interaction change understanding?
- **Content:** —. **Motion:** Per motion spec. **Responsive:** —. **A11y:** Linear accessible version; keyboard choices.
- **States:** —
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** Corpus §18.
- **Example:** —

### Custom mobile widgets
- **Job:** Touch-native interactions specific to the product.
- **Generic:** Desktop widgets squeezed onto phones. **Why it fails:** Unresolved.
- **Stronger:** Thumb-zone placement, swipe with visible alternatives, haptics-like feedback through motion, generous targets.
- **Keep convention when:** Platform conventions (native pickers, share sheet).
- **Decide:** —
- **Content:** —. **Motion:** Responsive to touch with no delay. **Responsive:** —. **A11y:** Gesture alternatives; screen-reader actions.
- **States:** —
- **Build:** Pointer events; `touch-action`.
- **Test:** A real device. **Severity:** A. **Evidence:** —
- **Example:** —

### Unconventional menus
- **Job:** Navigation that expresses the concept.
- **Generic:** A circular radial menu or a giant scrolling word list. **Why it fails:** Generic novelty; hard to scan.
- **Stronger:** Menu form from the content (a film strip for a production house, a specimen mosaic for a design system) that remains scannable and keyboard-operable.
- **Keep convention when:** If the unconventional form costs speed, keep the convention.
- **Decide:** A first-time user finds any page in < 3 s.
- **Content:** —. **Motion:** Per identity. **Responsive:** Has a conventional mobile form. **A11y:** Navigation semantics; keyboard.
- **States:** —
- **Build:** —
- **Test:** Timed findability. **Severity:** A. **Evidence:** Corpus §4, §10.
- **Example:** —

### Signature navigation systems
- **Job:** Navigation that becomes the experience's identity.
- **Generic:** Copying an award site's nav. **Why it fails:** Fails the reference-distance test.
- **Stronger:** Derived from the content structure (Shopify Editions' product-area index; Dropbox Brand's specimen tiles).
- **Keep convention when:** —
- **Decide:** Reference-distance test.
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** Full keyboard and screen-reader support.
- **States:** —
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** Corpus §3, §4.
- **Example:** —

---

## 8.11 Mobile-specific components

### Touch-first navigation
- **Job:** Reach key destinations with a thumb.
- **Generic:** A top-left hamburger as the only navigation in an app-like product. **Why it fails:** Unresolved. Out of thumb reach; hidden.
- **Stronger:** Bottom tab bar for 3–5 frequent destinations; reachable primary actions; top navigation for content sites with a clear menu label.
- **Keep convention when:** Content sites with occasional navigation can keep a top menu.
- **Decide:** Usage frequency per destination.
- **Content:** Labels. **Motion:** Instant switches. **Responsive:** —. **A11y:** Targets ≥ 44 px; labels; `aria-current`.
- **States:** —
- **Build:** Safe-area insets.
- **Test:** One-handed reach test. **Severity:** A. **Evidence:** responsive §5.
- **Example:** —

### Mobile cards and lists
- **Job:** Scan items on small screens.
- **Generic:** Desktop cards stacked full-width with huge images and little information. **Why it fails:** Unresolved. Low information per screen.
- **Stronger:** A compact list layout with a thumbnail and the key fields; cards only where the image is the decision driver.
- **Keep convention when:** —
- **Decide:** How many items should fit per screen for comparison?
- **Content:** Truncation rules. **Motion:** —. **Responsive:** Container queries. **A11y:** One tap target per item.
- **States:** —
- **Build:** —
- **Test:** Contact sheet at 390 px. **Severity:** A. **Evidence:** —
- **Example:** —

### Swipe interactions
- **Job:** Fast actions and browsing by gesture.
- **Generic:** Swipe-to-delete with no visible affordance or undo; carousels conflicting with page scroll. **Why it fails:** Unresolved.
- **Stronger:** Swipe as a shortcut with visible button equivalents; undo; correct `touch-action` to avoid scroll conflicts; no horizontal swipes at screen edges (back gesture).
- **Keep convention when:** Platform-like list actions.
- **Decide:** Is there a visible alternative?
- **Content:** —. **Motion:** Follows the finger; snap with velocity. **Responsive:** —. **A11y:** Button alternatives; screen-reader actions.
- **States:** Swiping, revealed, committed, undone.
- **Build:** Pointer events; thresholds.
- **Test:** Real device. **Severity:** C if swipe is the only path. **Evidence:** E3 (2.5.1).
- **Example:** —

### Bottom sheets
- **Job:** Contextual panels on mobile (filters, options, details).
- **Generic:** Sheets that can't be dismissed by the back gesture or that trap scroll. **Why it fails:** Unresolved.
- **Stronger:** Snap points; a drag handle plus a close button; Escape and back dismissal; content scroll inside the sheet; focus management.
- **Keep convention when:** Conventional.
- **Decide:** Modal or non-modal?
- **Content:** Title. **Motion:** Spring only if it matches the identity; reduced = fade. **Responsive:** Becomes a side panel or popover on desktop. **A11y:** Dialog semantics when modal.
- **States:** Partial, full, dragging, closing.
- **Build:** `<dialog>` with custom styling or a proven library; `overscroll-behavior: contain`.
- **Test:** Keyboard and screen reader. **Severity:** A (C if it traps). **Evidence:** E4.
- **Example:** —

### Mobile filters
- **Job:** Refine results on small screens.
- **Generic:** Desktop sidebar filters stacked above results, pushing results off-screen. **Why it fails:** Unresolved.
- **Stronger:** A "Filters (3)" button opening a full-screen sheet with apply, reset and live result count; applied chips above results.
- **Keep convention when:** Conventional.
- **Decide:** —
- **Content:** "Show 42 results". **Motion:** —. **Responsive:** —. **A11y:** Sheet semantics; count announced.
- **States:** None selected, applied, zero results predicted.
- **Build:** URL state.
- **Test:** —. **Severity:** A. **Evidence:** responsive §5.
- **Example:** —

### Expandable details
- **Job:** Hide secondary information until needed on small screens.
- **Generic:** Everything collapsed, including essential info (price, delivery). **Why it fails:** Unresolved.
- **Stronger:** Essentials visible; details expandable with clear labels; state preserved.
- **Keep convention when:** —
- **Decide:** What decides the purchase or task? Keep it visible.
- **Content:** —. **Motion:** Height animation via the grid technique. **Responsive:** —. **A11y:** Disclosure pattern.
- **States:** —
- **Build:** `<details>`.
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** —

### Sticky mobile actions
- **Job:** Keep the primary action reachable (add to cart, book, apply).
- **Generic:** A sticky bar that covers content, the cookie banner and the keyboard. **Why it fails:** Unresolved (2.4.11 focus obscured).
- **Stronger:** Appears after the in-page action scrolls away; hides when the keyboard is open; space reserved at the bottom of content; safe-area aware.
- **Keep convention when:** E-commerce PDP, booking.
- **Decide:** —
- **Content:** Includes the key info (price, date). **Motion:** Slide ≤ 200 ms. **Responsive:** —. **A11y:** Focus not obscured; target sizes.
- **States:** Hidden, visible, disabled (out of stock with reason).
- **Build:** IntersectionObserver on the inline CTA.
- **Test:** Form focus on mobile with the bar present. **Severity:** C if it obscures focus. **Evidence:** E3.
- **Example:** —

### Responsive media
- **Job:** Images and video that fit and perform on small screens.
- **Generic:** Desktop images scaled down (subject lost, huge files). **Why it fails:** Unresolved.
- **Stronger:** Art-directed crops with `<picture>`; `srcset`/`sizes`; smaller video encodes; posters.
- **Keep convention when:** —
- **Decide:** Is the subject readable at 390 px?
- **Content:** —. **Motion:** Autoplay muted and inline only if light; reduced = poster. **Responsive:** —. **A11y:** Alt text; captions.
- **States:** Loading, error.
- **Build:** An image CDN or framework image component.
- **Test:** Transfer size at 390 px. **Severity:** A. **Evidence:** performance §6.
- **Example:** —

### Gesture alternatives
- **Job:** Make gesture-driven features usable by everyone.
- **Generic:** Pinch, swipe or drag with no alternative. **Why it fails:** C (WCAG 2.5.1, 2.5.7).
- **Stronger:** Visible buttons for every gesture; keyboard equivalents; instructions only when needed.
- **Keep convention when:** —
- **Decide:** List every gesture → its alternative.
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** Required.
- **States:** —
- **Build:** —
- **Test:** Complete the tasks with taps only. **Severity:** C. **Evidence:** E3.
- **Example:** —

### Touch-friendly data views
- **Job:** Read and act on data on phones.
- **Generic:** Wide tables squashed, or hidden behind horizontal scroll without a cue. **Why it fails:** Unresolved.
- **Stronger:** Priority columns plus "show more"; row → card transforms; sticky identifiers; summary first, detail on tap.
- **Keep convention when:** —
- **Decide:** What does a mobile user need from this data right now?
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** Table semantics retained or a meaningful list structure.
- **States:** —
- **Build:** —
- **Test:** Contact sheet at 360 px. **Severity:** A. **Evidence:** responsive §5.
- **Example:** —

### Reduced-motion behaviour (mobile)
- **Job:** Respect motion preferences on devices where vestibular effects are strongest (motion close to the eyes, while moving).
- **Generic:** Same parallax and scroll effects on phones; OS settings ignored. **Why it fails:** C if large motion has no reduced path.
- **Stronger:** Mobile defaults lighter than desktop; reduced = replacements (motion-intelligence.md §10); a visible motion toggle on motion-heavy sites.
- **Keep convention when:** —
- **Decide:** —
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** WCAG 2.3.3.
- **States:** —
- **Build:** `gsap.matchMedia`, CSS media queries, `MotionConfig reducedMotion="user"`.
- **Test:** `audit_page` reduced capture at 390 px viewport (`--viewports 390x844` plus a reduced pass). **Severity:** C. **Evidence:** G5.
- **Example:** —

### Mobile-specific content hierarchy
- **Job:** Put the most important thing first on small screens.
- **Generic:** The same order as desktop, so the key action is five screens down. **Why it fails:** Unresolved.
- **Stronger:** Re-sequence: the page's one job within the first screen; secondary content later or collapsed.
- **Keep convention when:** —
- **Decide:** What must happen within the first screen?
- **Content:** Possibly shorter copy variants. **Motion:** —. **Responsive:** DOM order should still make sense for screen readers (prefer reordering content, not CSS `order`).
- **States:** —
- **Build:** —
- **Test:** First-screen capture review. **Severity:** A. **Evidence:** corpus §12, §17.
- **Example:** —

---

## 8.12 Footer and secondary details

The level of polish must stay consistent beyond the homepage.

### Footers
- **Job:** Close the experience: next step, orientation, trust, legal.
- **Generic:** A four-column link dump, a newsletter box, social icons and "© 2026 All rights reserved". **Why it fails:** Generic.
- **Stronger:** An ending in the brand's voice (a final statement or call), a useful index, contact info, real social links only, a newsletter only with real content behind it.
- **Keep convention when:** Large sites need a sitemap-like footer; make it well organised.
- **Decide:** What would a user who reached the bottom want next?
- **Content:** Real links. **Motion:** Minimal; a big footer reveal effect is an award-site default. **Responsive:** Link groups collapse into disclosures. **A11y:** `footer` landmark; link group headings.
- **States:** —
- **Build:** —
- **Test:** Dead links. **Severity:** A (C if links are dead). **Evidence:** G (dead links).
- **Example:** A generic link dump → "Close your next month in three days. Start a trial ·" plus a compact index, address and status page link.

### Legal navigation
- **Job:** Access privacy, terms, imprint and accessibility statement.
- **Generic:** Tiny, low-contrast links; placeholder legal pages. **Why it fails:** Unresolved (C if placeholder).
- **Stronger:** Readable links; real pages (or clearly flagged for client legal review); an accessibility statement.
- **Keep convention when:** Conventional.
- **Decide:** —
- **Content:** Client-provided legal text only; flag what's missing. **Motion:** —. **Responsive:** —. **A11y:** Contrast.
- **States:** —
- **Build:** —
- **Test:** —. **Severity:** C if placeholder legal content ships. **Evidence:** security §8.
- **Example:** —

### Contact information
- **Job:** Let people reach the organisation.
- **Generic:** A contact form only, with no expectations set. **Why it fails:** Unresolved.
- **Stronger:** Multiple channels as appropriate; response time expectations; an address with a map link; clickable `tel:` and `mailto:`; structured data.
- **Keep convention when:** —
- **Decide:** What do people contact you about? Route them.
- **Content:** Real details. **Motion:** —. **Responsive:** Tap-to-call. **A11y:** Form rules.
- **States:** Form success and failure.
- **Build:** Spam protection without inaccessible CAPTCHAs.
- **Test:** Form submits somewhere real (or a labelled demo). **Severity:** C if the form is fake. **Evidence:** F8.
- **Example:** —

### Social links
- **Job:** Connect to active channels.
- **Generic:** A row of every network's icon, linking to the homepage or `#`. **Why it fails:** C (dead links) or generic.
- **Stronger:** Only active channels; labelled links; consider text labels.
- **Keep convention when:** —
- **Decide:** Active in the last 3 months?
- **Content:** —. **Motion:** —. **Responsive:** —. **A11y:** Accessible names ("Instagram (opens in new tab)" if new tab).
- **States:** —
- **Build:** —
- **Test:** `slop_scan` dead-link. **Severity:** C if dead. **Evidence:** —
- **Example:** —

### Back-to-top actions
- **Job:** Return to the top of long pages.
- **Generic:** A floating circle button on every page, covering content. **Why it fails:** Generic.
- **Stronger:** Only on very long pages; placed in the footer or appearing after deep scroll; it also moves focus to the top.
- **Keep convention when:** —
- **Decide:** Page length.
- **Content:** —. **Motion:** Smooth scroll respects reduced motion. **Responsive:** Doesn't overlap sticky actions. **A11y:** Moves focus to the skip target or `h1`.
- **States:** —
- **Build:** `href="#top"` plus `scroll-behavior` behind a reduced-motion check.
- **Test:** Focus moves to the top. **Severity:** A. **Evidence:** —
- **Example:** —

### Cookie preferences
- **Job:** Obtain lawful, informed consent without ruining the first impression.
- **Generic:** A full-screen consent modal from a third-party tool, unstyled, with a hidden reject option and trapped focus. **Why it fails:** Deceptive (C if reject is harder than accept) and unresolved. The corpus showed consent covering every viewport.
- **Stronger:** Styled as part of the design system; non-blocking where the law allows; reject as easy as accept; granular settings; a preferences link in the footer.
- **Keep convention when:** Legal requirements dominate. Flag them to the client.
- **Decide:** What does the applicable law require? (Flag for client legal review.)
- **Content:** Plain-language purposes. **Motion:** Minimal. **Responsive:** Doesn't cover the primary content on mobile if avoidable. **A11y:** Focus management sensible; keyboard reachable; not a trap.
- **States:** First visit, preferences open, saved, withdrawn.
- **Build:** The consent tool's styling APIs; no tracking before consent.
- **Test:** First-load contact sheet; keyboard walk. **Severity:** C for deceptive patterns. **Evidence:** G6.
- **Example:** A full-screen grey modal → a compact bottom panel in brand type with "Accept all", "Reject all" and "Choose", equally weighted.

### Error pages
- **Job:** Recover from 404 and 500 gracefully.
- **Generic:** "404: Page not found 🙃" with a home button. **Why it fails:** Generic.
- **Stronger:** Explain; offer search, popular destinations and the parent page; report broken links; the brand voice can be playful if it stays helpful (Shopify's 404 was a highlighted element).
- **Keep convention when:** —
- **Decide:** What were they likely looking for (from the URL)?
- **Content:** Helpful plus on-brand. **Motion:** Optional small moment. **Responsive:** —. **A11y:** `h1` states the error; correct HTTP status.
- **States:** 404, 410, 500, 503.
- **Build:** Real status codes.
- **Test:** Request a missing URL; check the status. **Severity:** A. **Evidence:** Corpus §3 (404 as a highlighted element).
- **Example:** —

### Maintenance pages
- **Job:** Communicate downtime.
- **Generic:** A generic "We'll be back soon". **Why it fails:** Unresolved.
- **Stronger:** Expected time, a status page link, what's affected, how to get urgent help; 503 status with `Retry-After`.
- **Keep convention when:** —
- **Decide:** —
- **Content:** Real ETA. **Motion:** —. **Responsive:** —. **A11y:** —
- **States:** —
- **Build:** Static, no dependencies on the down system.
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** —

### Search results
- **Job:** Present matches so users can choose quickly.
- **Generic:** Blue links with no context. **Why it fails:** Unresolved.
- **Stronger:** Result type, highlighted matches, key metadata, filters by type, count, sort; did-you-mean.
- **Keep convention when:** Conventional.
- **Decide:** What metadata decides a click?
- **Content:** Snippets. **Motion:** —. **Responsive:** —. **A11y:** Results as a list; count announced; headings per result.
- **States:** Loading, none, error, many.
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** —
- **Example:** —

### No-results states
- **Job:** Recover from searches or filters that return nothing.
- **Generic:** "No results found." **Why it fails:** Unresolved.
- **Stronger:** Echo the query; suggest spelling fixes, broader terms, filter removal; show popular items; offer contact.
- **Keep convention when:** —
- **Decide:** —
- **Content:** "No invoices match 'Harbr'. Did you mean Harbor & Co.?" **Motion:** —. **Responsive:** —. **A11y:** Announced.
- **States:** —
- **Build:** —
- **Test:** —. **Severity:** A. **Evidence:** experience-flow §5.
- **Example:** —

### Confirmation pages
- **Job:** Confirm completion and set expectations.
- **Generic:** "Thank you!" with nothing else. **Why it fails:** Unresolved.
- **Stronger:** What happened (order or reference number), what's next (email, delivery date), what the user can do now (track, add to calendar, return home), and the support path.
- **Keep convention when:** —
- **Decide:** —
- **Content:** Real details. **Motion:** A small, meaningful moment is allowed (a stamp, a fold). **Responsive:** —. **A11y:** Focus on the `h1`; key details as text.
- **States:** Email pending, payment pending.
- **Build:** Idempotent (refresh doesn't re-submit).
- **Test:** Refresh behaviour. **Severity:** A (C if refresh re-submits a payment). **Evidence:** —
- **Example:** "Thanks!" → "Order 4412 confirmed. Cup no. 14 ships Tuesday from Porto. Tracking link by email."
