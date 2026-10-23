# Reference corpus

This corpus covers 21 live sites inspected on 2026-10-22, plus 3 seed references that could not be inspected. The aim was range, not taste: immersive WebGL sits next to government services, hardware retail, brand guidelines, data journalism and a dense dashboard.

**Evidence basis for each entry.** Each live site has a rendered capture from `audit_page.mjs`: two viewports, a scroll sequence, a keyboard probe and a reduced-motion pass. Measured results are published in `research/captures/<slug>/report.json`. The contact sheets (`sheet.jpg`) are screenshots of third-party sites and are kept locally, not redistributed. Awwwards data (scores and highlighted elements) comes from the official SOTD pages. **Hover, drag, audio and multi-page navigation were not exercised.** Statements about them are marked *(inferred)* and rest on Awwwards element labels or scroll stills. Credits are given as shown on Awwwards.

The per-site fields are numbered 1–12 as in the brief: (1) creator, (2) URL, (3) category and purpose, (4) central idea, (5) art direction, (6) interaction and motion idea, (7) navigation and flow, (8) distinctive component, (9) small-screen adaptation, (10) trade-off, (11) what becomes derivative if copied, (12) transferable principle.

## Contents
1. Lando Norris (SOTY 2025)
2. Igloo Inc (SOTY 2024)
3. The Renaissance Edition / Shopify Editions Winter '26
4. Dropbox Brand
5. Anime.js
6. Terminal Industries
7. Oryzo AI
8. Why Zero
9. Floema
10. Siena Film Foundation
11. Bruno Simon portfolio
12. Son Daven
13. House of Dreamers
14. Half of Eight
15. Linear
16. Stripe
17. GOV.UK
18. The Pudding
19. Teenage Engineering
20. Pentagram
21. Grafana Play
22. Seed references that no longer run: Adobe Taking Shape, Vogue Talents 21, Deep Beauty
23. Cross-corpus synthesis

---

## 1. Lando Norris
1. OFF+BRAND. SOTD 2025-11-17; SOTY 2025. Design 8.12, Usability 7.9, Creativity 8.71, Content 8.18. Dev scores: Accessibility 7.0, Animations 8.6.
2. https://landonorris.com/
3. Athlete brand and merch funnel (sports, promotional).
4. The driver's own visual equity, his fluoro-lime livery and his signature, staged as an editorial poster that moves at race pace.
5. Acid lime `#D2FF00` against olive-black `#111112`. A heavy grotesk (Mona Sans) sits beside a high-contrast serif (Brier), swapped word by word ("REDEFINING LIMITS, FIGHTING FOR WINS"). Topographic contour lines sit in the background. Portrait photography is cut into a grid.
6. A preloader with a monogram. The handwritten signature SVG is drawn over the portrait on scroll. Marquee headlines and scroll-linked type reveals. *(inferred)* 3D helmet and gesture interactions, from the "3D, Gestures" tags and 20+ canvases.
7. Long single scroll with a persistent logo and a STORE pill. The commerce entry stays visible throughout.
8. The signature-over-portrait reveal: a personal mark used as a motion device.
9. Mobile kept the loader on screen for all ~10 s of capture, a heavy first paint on phones. Under reduced motion, desktop shows a static portrait immediately: the site queries `prefers-reduced-motion` and swaps the loader for a still.
10. A high-impact loader against mobile time-to-content. The lab pass also found 52/107 low-contrast text candidates, the sr-only heading false positive among them.
11. Lime on black with mixed serif/sans words. Without a real livery behind it, this is one of the most common "award-site" defaults (see Terminal and Why Zero).
12. **Mine the client's real-world equity (livery, signature, artefacts) before inventing a palette.** A default palette becomes a signature when it is the brand's own.

## 2. Igloo Inc
1. abeto + Bureaux. SOTD 2024-07-23; SOTY 2024. Animations 9.6 (corpus high); Accessibility 6.6, Markup 6.4.
2. https://www.igloo.inc/
3. Corporate parent of Pudgy Penguins (web3).
4. The company name made literal: an igloo assembles itself out of ice-crystal lattices.
5. Monochrome glacial greys; procedural ice; nearly no UI chrome.
6. On mobile the scroll sequence went from wireframe lattice to block igloo to snowy terrain. The 3D build is the narrative.
7. Infinite scroll through scenes *(inferred from tags)*. No headings or landmarks were found; the DOM held 27 nodes.
8. A procedural assembly scene in which construction is the content.
9. Mobile worked in the capture. Desktop headless stalled on the loader (a GPU/WebGL limit of the capture; see RESEARCH_GAPS).
10. Animation craft traded against semantics: there is almost no indexable or accessible text.
11. "3D object assembles from particles on scroll" is now a cliché of its own.
12. **Let the brand name or core noun generate the scene's construction logic**, then also provide an HTML layer that says the same thing.

## 3. The Renaissance Edition (Shopify Editions Winter '26)
1. Shopify Design and others. SOTD 2026-02-09. Dev 8.05 (Animations 9.4, WPO 8.4, Accessibility 7.0).
2. https://www.shopify.com/editions/winter2026
3. Product release notes: 150+ updates (e-commerce SaaS).
4. A "renaissance" of commerce. Classical paintings are remixed with modern commerce props (skateboards, shopping bags, a laptop, an eye mask).
5. Generative-painting imagery. Display serif with swash italics plus Neue Montreal. Warm ivory `#F7F7EE` paper with olive ink. Torn-paper edges where painting meets product UI.
6. A hero transition from a painting to a glowing orb to product; sections reveal on scroll; a "Hidden Layer" easter egg. *(inferred)* WebGL painting effects (6 contexts).
7. **A persistent index of product areas** (Sidekick, Agentic, Online, Retail, Marketing, Checkout…) keeps 150 updates navigable. Skip link present; one h1; main and nav landmarks.
8. The table-of-contents rail that doubles as orientation and progress.
9. Mobile collapses the rail into a menu and keeps painting-first storytelling; product cards stack.
10. 55,000 px pages and a heavy LCP (4.9–7.4 s lab). Reduced motion is handled well: running animations drop from 7 to 1, with 22 matchMedia queries.
11. "Old masters × modern props" collage is spreading fast; without the "renaissance" naming it is decoration.
12. **Turn an inherently boring list into a themed edition, while an index structure carries the real navigation load.**

## 4. Dropbox Brand
1. Daybreak Studio. SOTD 2025-02-12. Responsive 8.6, Markup 8.0, Accessibility 7.0.
2. https://brand.dropbox.com/
3. Brand-guidelines site (design system documentation).
4. The guidelines are made of the brand's own building blocks. The navigation is a mosaic of the system itself.
5. Dropbox Blue `#0061FE`, ink `#1A1918`, a full secondary palette. Sharp grotesk (Sharp Grotesk variable plus Atlas Grotesk); a blueprint grid.
6. Blocks assemble on scroll into a coloured mosaic, and each tile demonstrates its section (quote marks for Voice, "Aa" for Typography, a curve for Motion). Awwwards elements list typography widgets, a motion-easing demo and an iconography "slot machine" *(inferred)*.
7. Mosaic as index, then deep pages per topic.
8. Tiles that are both link and specimen.
9. The mosaic re-flows into two columns on mobile and keeps the specimen idea.
10. Lab CLS 0.11–0.19; no h1; the consent iframe captures Tab first.
11. Colourful bento grids are a 2024–2026 default.
12. **Documentation can be a live specimen of the thing it documents, so navigation demonstrates the content.**

## 5. Anime.js
1. Julian Garnier. SOTD 2025-05-06 (SOTM May 2025). Animations 9.0; Accessibility 7.4.
2. https://animejs.com
3. Open-source library homepage (developer tool).
4. The library as a precision instrument. An exploded mechanical object, like a lens or engine, is scrubbed by scroll, then redrawn as a technical blueprint.
5. Warm dark `#252423` and bone `#DAD5D0`; DIN plus mono; a rainbow radial dial; callout labels (timer, easings, draggable, scroll, svg).
6. A scroll scrubber with a pagination bar; a 3D object rotating and exploding; the switch to blueprint line art. The page is built with the product, so the site is the proof.
7. Long scroll with a scrubbable progress rail; direct links to Docs, Easings and Learn.
8. The scroll-scrubber pagination bar, which turns scroll position into a tool-like control.
9. Mobile keeps the same story in a column; the 25×12 px scroll buttons have no names.
10. 273 elements carry `will-change`, and no reduced-motion handling was detected on a motion-library site.
11. "Exploded product render with callouts" is generic if the product is not mechanical.
12. **For a tool, demonstrate the capability in the medium itself.** The site's motion is the product demo.

## 6. Terminal Industries
1. REJOUICE® + PROPAGANDE. SOTD 2025-09-03 (SOTM Sep 2025). Dev 7.89 (Vue, Vercel).
2. https://terminal-industries.com
3. B2B logistics: a yard operating system (business and corporate).
4. A freight yard turning into software. Photoreal trucks get a wireframe digital-twin overlay and resolve into "one connected, automated system".
5. Dusk photography, then near-black, then paper white. Suisse Intl with Geist Mono labels; lime accent.
6. Typed-on headline fragments with the last letters in accent; a notched panel transition like a loading-bay door; Lenis smoothing.
7. Floating pill nav (System, Markets, Featured, Resources, About) with demo CTAs; deep pages.
8. The photo-to-wireframe overlay: the product (a digital twin) shown as an image transformation.
9. Mobile tightens to a hamburger pill and preserves the sequence.
10. Lab CLS ≈ 1.0 during wheel-scrolling, which needs field data to confirm. Lazy images above the fold. Reduced-motion CSS rules exist, but animations did not reduce.
11. Lime on black with a floating pill nav reads as award-template if the subject isn't present.
12. **B2B can win when the core visual transformation is the product's actual mechanism.** Here that mechanism is the digital twin.

## 7. Oryzo AI
1. Lusion. SOTD 2026-04-13 (SOTM Apr 2026). WPO 8.6; Accessibility 7.0.
2. https://oryzo.ai
3. Self-promotional parody product (studio showcase).
4. Deadpan satire: a cork coaster marketed with AI-launch hyperbole ("Isn't just a coaster").
5. Maker's desk: cutting mat, pencil, knife. Cork orange `#FF8539` on espresso `#100904`. Halyard display, Literata, DM Mono.
6. Scroll-linked rotation of a photoreal cork coaster; text that brightens word by word; 3D→2D→3D transitions; footer particles.
7. Linear story with a short nav (Intro, Features, Product, Contact).
8. The scroll-scrubbed product turntable.
9. Mobile adapts copy blocks and keeps the 3D at full width.
10. Viewport blocks zoom; 8 images lack alt; no reduced-motion handling despite heavy motion.
11. The "ISN'T JUST A ___" scroll reveal plus a rotating hero object is a template.
12. **Tone is a concept.** Parody of a category's clichés can carry an entire art direction when the execution is sincere.

## 8. Why Zero
1. Sindhur Dutta + Zero. SOTD 2026-09-07 (SOTM Sep 2026). Accessibility 6.6, Semantics 6.6.
2. https://why.zero.university/
3. Education startup waitlist.
4. "Zero" as a ritual: the visitor draws a zero to unlock a floating island world.
5. Glacial teal marble, a stylised diorama island, a hand-drawn "zero" logotype. Supply Sans and Supply Mono; green `#01C654`.
6. Gesture gate (draw or hold to proceed) with a progress ring; narrative scroll; a game-controlled map; a waitlist form that produces personalised origami *(inferred from elements)*.
7. Staged: buttons for "Go to stage -100 BZ … 0 BZ" exist as a keyboard path.
8. The draw-to-unlock gate.
9. Mobile is identical to desktop at the gate.
10. A memorable ritual against a hard gate: no h1, no landmarks, zoom blocked.
11. Gesture gates without a skip are hostile. Copying the gate without the "zero" meaning is pure friction.
12. **If you gate, the gate must be the brand's idea in miniature, and it must have an obvious skip and a keyboard path.**

## 9. Floema
1. Bürocratik. SOTD 2026-05-13 (SOTM May 2026). Nuxt, GSAP, WebGL.
2. https://www.floema.com/en
3. Manufacturer of urban furniture and signage (B2B and e-commerce catalogue).
4. Objects floating in white space become full-bleed public places: products seen first as artefacts, then in their city.
5. Warm off-white with a lime-yellow `#E9E778` highlight; Zimula display; architectural photography.
6. Scroll video zoom; a 3D sustainability material on mouse movement *(inferred)*; a menu and search interaction.
7. Products, About, Sustainability and Journal, plus a downloadable catalogue.
8. The product catalogue as a floating "specimen field".
9. **A Cookiebot modal covered every mobile frame.** On a phone, a visitor's whole first impression is consent UI.
10. Reduced motion is handled (3→1 running animations), but the consent modal and focus on hidden inputs (10 invisible focus stops) undercut the experience.
11. Floating product cut-outs on white are common.
12. **Design the consent layer as part of the system.** It is the first screen many visitors see.

## 10. Siena Film Foundation
1. Niccolò Miranda, Federico, G-NS Studio. SOTD 2025-03-18 (SOTM Mar 2025). Accessibility 6.6.
2. https://siena.film
3. Boutique film production house.
4. The site behaves like a film: a title card, an "ENTER", then a film-strip slider and procedural re-arrangement.
5. Black and cream `#FAF7EF`; condensed display (Neue Brücke) with P22 Parrish Roman; credits-style lettering.
6. Brand intro animation; procedural slider re-arrangement; contact type lettering *(elements, inferred)*.
7. Gate, then the slider-based index.
8. The film-strip slider: navigation in the medium's own form.
9. Mobile shows the title card with an ENTER button; desktop headless stayed on a blank cream intro.
10. Lab CLS 0.65 on desktop; 38–65 lazy images above the fold; focus lands on hidden CLOSE buttons.
11. "Enter" gates in front of portfolios are mostly ceremony.
12. **Borrow the client's medium's grammar** (title card, reel, credits) for structure, not just for decoration.

## 11. Bruno Simon portfolio
1. Bruno Simon. SOTD 2026-01-21 (SOTM Jan 2026). Creativity 8.62.
2. https://bruno-simon.com
3. Creative-developer portfolio (game-like).
4. A portfolio you drive: projects are places in a toy world.
5. Neon violet-blue night grid, glowing portal ring, low-poly island. Nunito and Amatic SC.
6. "Click to start", then drive a car around an island *(inferred; not driven)*.
7. Spatial: you navigate by moving through the world. Menu and map buttons exist but are unlabeled.
8. The drivable world.
9. Mobile stayed on the portal ring for the whole headless capture.
10. Pure delight traded against access: unlabeled buttons, no visible focus, no h1 or landmarks, no reduced-motion handling.
11. The "drive around my portfolio" format has been cloned widely since the first version; copying it signals imitation.
12. **A signature interaction must belong to the author.** This one works because building it is the portfolio's proof of skill.

## 12. Son Daven
1. The First The Last + others. SOTD 2026-06-05 (SOTM Jun 2026). Dev 8.09: Semantics 8.2, Responsive 8.4.
2. https://sondaven.com/en
3. Resort-hotel development in the Carpathians (hospitality, real estate).
4. Hutsul heritage made material. The custom "Blueline" type and the line-engraved sheep share the hatching of traditional wool weaving.
5. Umber `#2C2824` and wool-sand `#A89474`. KTF Metro Blueline (hatched) with KTF Metro Roman; engraving illustrations; mountain renders.
6. A sheep walks across the opening; hatch-line reveals; scroll-linked reveals; Barba page transitions; GSAP and ScrollTrigger.
7. Menu, "Aerotour", consultation and investment CTAs.
8. The hatched wordmark and illustrations: one texture shared by type and image.
9. Mobile re-orders into a vertical story (herd, quote, About) instead of shrinking desktop.
10. 8 h1s; 38–44 dead `href="#"` links; Vimeo 401s on load.
11. Engraving textures without a source tradition become mere "texture".
12. **Derive the material from a specific cultural or physical source and apply it to type and image alike.**

## 13. House of Dreamers
1. Mirror + Andrea Giuffrida. SOTD 2024-11-09. Accessibility 6.4 (low).
2. https://www.houseofdreamers.fr (captured 2026-10-22; on 2026-10-23 this address redirected to houseofdreamers.com)
3. Immersive exhibition in London (entertainment).
4. Passing through a dream's architecture: pastel arches open onto clouds.
5. Lilac and pink `#E381A8` haze, "Desire" display serif, Gill Sans.
6. Unicorn loader, then a cloud-and-arch WebGL scene, "Are you ready to dream?" and an Enter gate. Fluid mouse effect and page transitions *(elements, inferred)*.
7. Gate, then 18 installations as rooms *(inferred)*.
8. The arch portal as the transition device between rooms.
9. Mobile reframes the scene vertically with the same gate.
10. LCP 9.3 s lab on mobile; no h1 or main; the consent iframe traps Tab; no reduced-motion handling.
11. Pastel cloud dreamscapes are a stock "dreamy" aesthetic.
12. **The transition device should come from the venue's real architecture.** Here that is portals and rooms.

## 14. Half of Eight
1. Pixeljam + Anton. SOTD 2023-12-21. Semantics 8.0; Accessibility 7.0.
2. https://halfof8.com/
3. Personal art journal and portfolio.
4. A Tokyo-based maker's notebook: CGI vignettes and sound pieces presented as collectible posters.
5. Black field, Inter Display, gold enamel-pin badges, Japanese typography inside the artworks.
6. Infinite image grid, poster-like overlays on hover, stacking articles *(elements, inferred)*; 42 infinite CSS animations.
7. A first-person intro ("Hi, I'm Anton…"), then project cards.
8. Collectible badges as metadata: provenance shown as pins.
9. Cards stack cleanly; the intro text stays first.
10. Inter is a "default" font here and nobody notices, because the content is unmistakable.
11. Badge-heavy cards without real provenance become template chrome.
12. **When the content is singular, the frame can be quiet.** Typography defaults matter less than specific content.

## 15. Linear (contrast reference: product SaaS)
1. Linear (in-house). Not an Awwwards reference here; included as the source of the "dark SaaS" look that AI imitates.
2. https://linear.app
3. Product-development SaaS marketing site.
4. The product is the hero. Real, dense UI states stand in for illustration.
5. Near-black, Inter Variable, Berkeley Mono. Two-tone headline sentences (white plus grey continuation). Restrained isometric line icons.
6. Subtle; 82 infinite animations, mostly inside UI demos. The reduced-motion pass cut them (82→76), with 46 CSS rules and 12 JS queries.
7. Product, Resources, Customers, Pricing; skip link present.
8. A live-looking product canvas with realistic issues, agents and statuses.
9. Mobile crops the UI rather than inventing a fake simplified one.
10. Mobile LCP 10 s (lab) from a heavy hero image; 28 sub-24 px targets in the embedded UI.
11. **This is the template's origin.** Hero, logo strip and three columns look identical in imitations, and imitations put fake dashboards where Linear puts its product.
12. **A familiar structure is acceptable when every slot is filled with truth** (real UI, real customers, specific claims).

## 16. Stripe (contrast reference: fintech)
1. Stripe (in-house).
2. https://stripe.com
3. Payments infrastructure marketing.
4. Financial infrastructure shown as real product surfaces: terminal, checkout, billing, issuing, Connect.
5. The animated gradient ribbon, a brand asset for years and the origin of countless copies, on white; Söhne; two-tone headline.
6. Ribbon WebGL (5 contexts); product micro-demos; motion reduced 18→1 under reduced motion.
7. Mega-menu nav; product-specific deep pages.
8. Product fragment cards: each card holds an actual UI artefact, not an icon.
9. Mobile stacks the fragments and keeps them legible.
10. 104 small-target candidates on mobile; 2 h1s.
11. **The gradient without the product truth is the most-copied slop on the web.**
12. **Decoration can be a brand asset when it is owned, consistent for years, and always paired with substance.**

## 17. GOV.UK (contrast reference: public service)
1. Government Digital Service.
2. https://www.gov.uk
3. Government services portal.
4. Get people to the task: search first, then popular tasks, then topics.
5. GDS Transport, a blue masthead, underlined links, no imagery beyond functional icons.
6. None. 0 animations, yet 14 reduced-motion CSS rules exist in the design system.
7. Search-led, with category lists and clear link text.
8. The "Popular on GOV.UK" action list.
9. A real mobile layout, not a shrunk one: the same order, larger targets.
10. Deliberately no spectacle. 16 requests; LCP 0.57–0.97 s.
11. Copying GOV.UK's look for a brand that is not a service reads as institutional.
12. **Restraint is a creative decision.** When the job is "do the task", the craft is in clarity, speed and inclusiveness.

## 18. The Pudding (contrast reference: data journalism)
1. The Pudding.
2. https://pudding.cool
3. Visual-essay publication (editorial, data).
4. Every story is a different visual argument; the index is a gallery of covers.
5. Gooper SemiCondensed (warm, quirky serif) with Atlas Grotesk and Typewriter; saturated frames per story; hand-drawn nav icons.
6. Index-level motion is minimal; the motion lives inside the essays (not exercised).
7. Search, category filter, issue numbers and dates.
8. Story cards framed in a story-specific colour, with the issue number as real metadata.
9. Single-column covers; filter becomes a select.
10. No h1 on the index; unlabeled inputs.
11. Uniform card grids, usually a sameness trigger, work here because each card is a unique artefact.
12. **Uniformity in the container, singularity in the content.** Judge "identical cards" by what's inside them.

## 19. Teenage Engineering (contrast reference: hardware e-commerce)
1. Teenage Engineering (in-house).
2. https://teenage.engineering
3. Hardware maker and store.
4. Product as theatre with a sense of humour. Scrolling travels down the product's absurdly long shadow while the copy argues with the shopper ("THIS SHADOW IS UNREALISTICALLY LONG. ARE YOU HIDING SOMETHING?").
5. Spotlight on black; the brand's own pictogram navigation; its own typefaces (te-20, TechnoType).
6. Scroll as a camera move down a shadow, then a "HOLD ON…" beat, then the purchase CTA ("LIFE IS FANTASTIC! 399 USD AGREE!").
7. Iconographic nav (products, store, latest, finder); the store is one tap away.
8. The shadow scroll: empty space becomes the narrative.
9. Mobile keeps the joke and the price; the footer becomes a list.
10. Zoom blocked; no h1.
11. Absurdist copy without a confident product reads as smug.
12. **Voice can carry the interaction.** One sustained camera move plus a witty script beats a dozen effects.

## 20. Pentagram (contrast reference: studio portfolio)
1. Pentagram (in-house).
2. https://www.pentagram.com
3. Design consultancy portfolio.
4. The work is the identity: large images, a feature ("The Secret Life of Things"), and a rotating "We design: …" capability chip.
5. "Plain" typeface; white and black; image-led.
6. Minimal. GSAP present; no motion spectacle.
7. Work, About, News, Contact, Archive.
8. The "We design: Packaging for Fashion & Beauty" chip, a capability statement that changes with the project shown.
9. Single column with large imagery.
10. 2 h1s; overlay links without names; cookie bar over imagery.
11. Minimal white portfolio grids are the most common studio template.
12. **Let one small, data-driven component (the capability chip) carry the positioning**, so the rest can stay quiet.

## 21. Grafana Play (contrast reference: dense application UI)
1. Grafana Labs.
2. https://play.grafana.org
3. Observability dashboard sandbox (data-heavy app).
4. Utility at density: panels, queries, time ranges.
5. Dark UI, Inter, dense sidebar; brand gradient only on the welcome banner.
6. Data loading drives the experience: "Loading plugin panel…" placeholders.
7. Sidebar IA (Starred, Dashboards, Explore, Drilldown, Alerts…), breadcrumbs, a time-range control; skip link present.
8. Panel containers with headers, time range and states.
9. Mobile collapses the sidebar; panels stack.
10. Lab CLS 0.85–1.06 as panels hydrated; mobile LCP 9 s; many 403s for unauthorised plugin settings (expected in a sandbox).
11. Dashboard aesthetics (dark, neon charts) without data relationships become fake dashboards.
12. **In data UIs the craft is state design and geometric stability.** Reserve panel sizes, design the loading, empty and error states, and keep the time context visible.

## 22. Seed references that no longer run
None of these three can be inspected as a working experience, so none is a current live reference. Their verification trail, with dates and what was viewed, is in [SOURCE_STATUS.md](SOURCE_STATUS.md). The observations below come from published stills and describe what a screenshot shows, not how the work behaved.

- **Adobe Taking Shape** (Dogstudio / DEPT for Adobe Substance 3D; SOTD 2023-01-14; Animations 9.0). **Historical or archived.** The host no longer resolves, and archived copies hold only the app shell. Evidence: the [Dogstudio case study](https://dogstudio.co/cases/adobe-taking-shape/) and four of its stills. A "Pick a room" rotunda leads to three themed rooms (Photorealism, Surreality, X-topia), each built around one episode of a web series. Hidden collectible figures carry a visible "1 out of 3" progress counter. On mobile, the artworks are paged with explicit previous/next buttons.
  - *Transferable principle:* when a 3D world carries a content series, give it a hub that names every destination, and pair spatial exploration with explicit controls. *Derivative if copied:* pastel gallery rooms with floating objects.
- **The World of Vogue Talents 21** (MONOGRID for Vogue Italia; HM 2021-11-02). **Historical or archived.** The host no longer resolves, archived copies show only a "browser not supported" message, and no studio case page was found. Evidence: the [Awwwards entry](https://www.awwwards.com/sites/the-world-of-vogue-talents-21) and its three studio-uploaded stills. A dusk desert holds arch portals labelled with the platform's sections. A first-run card teaches "click and drag to move". A persistent text navigation repeats every section, with an it/en switch.
  - *Transferable principle:* a spatial world needs a parallel, always-visible route to every destination, so the 3D scene enriches navigation instead of replacing it. *Derivative if copied:* arches in a pastel desert.
- **Deep Beauty / KIKO Milano** (AQuest; exhibition by Ogilvy Italia at MUDEC, April–May 2025). **Inferred from secondary evidence.** No experience URL was found, the AQuest case page blocks automated access, and no visual material was inspected. The [Ogilvy work page](https://www.ogilvy.com/it/work/deep-beauty) confirms the online experience existed. Descriptions of rooms, infinite scroll, a brush cursor and sound come from secondary summaries only. *Not analysed.*

**Lesson for the skill:** campaign microsites decay within a few years, and an archive rarely preserves a WebGL experience. `skills/form-and-force/references/project-modes.md` therefore asks for an archiving and sunset plan on campaign work.

## 23. Cross-corpus synthesis

**What the strongest pieces share**
1. **The central image is the product's mechanism or the client's real equity.** Examples: Terminal's digital twin, Son Daven's weaving, Lando's livery, Anime.js's instrument, Shopify's "renaissance", Teenage Engineering's shadow.
2. **A concept generates both the visual and the structural system.** Dropbox's tiles are specimens and navigation; Shopify's index is orientation and progress; Siena's reel is navigation.
3. **One signature moment, many quiet ones.** The best sites have a single unforgettable device, such as the signature, the shadow scroll or the photo-to-wireframe, rather than a dozen competing effects.
4. **Mobile is re-sequenced, not shrunk** (Son Daven, Shopify, GOV.UK).

**Where award winners are weak (the opportunity)**
- Semantics and accessibility are routinely sacrificed: no h1 or main, unlabeled controls, focus on hidden elements, zoom blocked, gates without skips.
- Reduced motion is often missing or nominal. Of 21 sites, 16 had reduced-motion code but only 5 visibly changed behaviour.
- Consent UI is unconsidered and dominates the first impression.
- Heavy first loads on mobile (LCP 4–10 s lab on several).

**Second-order convergence inside award culture**
Acid-lime or neon accents on near-black, floating pill navs, Lenis on everything, preloaders and "Enter" gates, oversized grotesk caps, "ISN'T JUST A ___" scroll reveals, rotating hero objects, and bento mosaics. These are award-site defaults. The skill treats them exactly like AI defaults: they are allowed only with a project-specific reason.
