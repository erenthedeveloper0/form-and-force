# Project modes

Different kinds of projects need different design intelligence. Pick the mode or modes that match, and let them set the priorities, motion budget, density, performance budget and what "excellent" means. A mixed project (marketing site plus app) uses each mode on its own routes.

## Contents
1. Mode selector
2. Brand / marketing site
3. Campaign / microsite / launch
4. Studio, agency and portfolio
5. E-commerce and product storytelling
6. SaaS marketing site
7. SaaS / web application
8. Dashboard, admin and data-heavy UI
9. Editorial, publication and immersive story
10. Experimental, installation, WebGL and generative
11. Design system and component library
12. Redesign / audit of an existing product
13. Prototype and interface exploration
14. Budgets at a glance

---

## 1. Mode selector

| Signal in the request or repo | Mode |
|---|---|
| "homepage", "brand", "rebrand", "about", company site | Brand / marketing |
| Time-boxed launch, event, campaign, single-purpose microsite | Campaign |
| Studio, agency, freelancer, personal site, "showcase my work" | Studio / portfolio |
| Products, cart, checkout, PDP, catalogue, Shopify, configurator | E-commerce |
| Pricing, features, signup funnel for software | SaaS marketing |
| Logged-in product, settings, onboarding, workflows | SaaS app |
| Tables, charts, filters, monitoring, admin, analytics | Dashboard / data |
| Articles, essays, reports, research, longform, "scrollytelling" | Editorial |
| "Immersive", "WebGL", "3D", "generative", "installation", "experimental" | Experimental |
| Tokens, components, Storybook, "design system", "UI kit" | Design system |
| Existing site or app to improve | Redesign / audit, plus the underlying mode |
| "Explore", "prototype", "concepts", "spec" | Prototype |

## 2. Brand / marketing site
- **Excellent means** that the visitor understands what this is, why it's different and what to do next, in a way only this brand could say.
- **Priorities:** concept clarity → content hierarchy → proof → conversion path → craft.
- **Structure:** derive section order from the visitor's questions (What is it? Is it for me? Can I trust it? What does it cost? What now?), not from the template stack.
- **Motion budget:** medium. One signature moment, purposeful section transitions, crisp micro-interactions.
- **Common slop:** the template stack, generic claims, fabricated logos, a gradient hero.
- **Keep convention:** clear primary navigation, a visible primary action, a findable contact, a legal footer.
- **Verify:** substitution test, 5-second recall of the value proposition, mobile LCP.

## 3. Campaign / microsite / launch
- **Excellent means** one memorable idea executed completely, fast enough to share on phones.
- **Priorities:** signature moment → shareability (OG images, deep links) → load speed → lifespan plan.
- **Motion budget:** high, with a strict mobile budget and a reduced-motion version that still tells the story.
- **Gate rule:** an "Enter" gate needs a reason (audio consent, asset streaming) plus a skip and keyboard access.
- **Lifespan:** campaign sites decay. Two of the five seed references were offline within 5 years. Plan an archive or static fallback (video capture plus a static page) and a sunset date.
- **Verify:** time-to-meaningful-content on a mid-range phone, share previews, audio defaults muted.

## 4. Studio, agency and portfolio
- **Excellent means** that the work is the hero and the site demonstrates *how this studio thinks*.
- **Priorities:** case-study depth (problem → approach → outcome) → curation → navigation between projects → contact.
- **Signature:** one authored interaction that proves the studio's craft. Never a borrowed format: a drivable world, a WebGL gallery, a cursor trail.
- **Common slop:** an "Enter" gate, a custom cursor, project grids with hover-video only, case studies without outcomes.
- **Keep convention:** a fast project index, filterable if large; direct deep links per project; readable text.
- **Verify:** can someone find a relevant case in 2 clicks on a phone? Does each case state the outcome?

## 5. E-commerce and product storytelling
- **Excellent means** the product feels unmistakable *and* buying is effortless.
- **Split the experience:** storytelling routes (launch, collection, editorial) may be expressive. Transactional routes (PLP filters, PDP buy box, cart, checkout, account) must be conventional, fast and robust.
- **PDP essentials:** price, variants, stock, delivery and returns, size help, real imagery at full fidelity, sticky add-to-cart on mobile, reviews only if real.
- **Motion budget:** high on story pages; low on the buy box and checkout (feedback only).
- **Common slop:** fake scarcity counters, invented reviews, carousels hiding key images, a hover-only second image.
- **Verify:** add-to-cart and checkout flows end to end (local mock if needed, clearly bounded), error and out-of-stock states, INP on variant switching.

## 6. SaaS marketing site
- **Excellent means** showing the product's real mechanism with real UI, and letting the buyer self-qualify.
- **Hero:** the product in action (real UI, real or clearly sample data) beats a slogan with a gradient. Linear's and Stripe's familiar structures work because every slot contains truth.
- **Proof:** named customers with permission, specific outcomes with sources, security and compliance facts.
- **Pricing:** comparison by job-to-be-done; honest limits; enterprise path; FAQs from real objections.
- **Common slop:** fake dashboards, "AI-powered" pills, sparkle icons, three generic feature cards, "Trusted by 10,000+ teams".
- **Verify:** substitution test with a direct competitor's name; every number traced to a source.

## 7. SaaS / web application
- **Excellent means** the user reaches value quickly and every state is handled. Delight lives in feedback and flow, not spectacle.
- **Priorities:** information architecture → task flows → states (empty, loading, error, partial, permission) → keyboard efficiency → consistency → personality in micro-moments.
- **Motion budget:** low to medium. 100–250 ms feedback, spatial continuity for panels and route changes, no decorative loops. Motion explains cause and effect.
- **Density:** user-appropriate. Professional tools can be dense; consumer apps calmer.
- **Common slop:** happy-path only, modal shells without logic, toggles that change nothing, inconsistent buttons across screens.
- **Verify:** state inventories complete, keyboard-only task completion, second-screen consistency, INP under realistic data sizes.

## 8. Dashboard, admin and data-heavy UI
- **Excellent means** the right number is findable, trustworthy and actionable at a glance and on drill-down.
- **Priorities:**
  - Data relationships and comparisons over decoration.
  - Legible labels and units; time context always visible.
  - Filters that actually filter.
  - Stable geometry: reserve panel sizes, because panels resizing as data arrives caused lab CLS near 1.0 in the corpus.
- **Motion budget:** low. Use transitions that preserve object constancy (bars morph, rows reorder), never decorative chart entrances on every load.
- **Charts:** choose by task (compare, trend, distribution, composition, relationship). Label directly. Use accessible colour with redundant encoding. Offer a table fallback.
- **Common slop:** decorative KPIs with meaningless numbers, neon charts on black, sparklines with no scale, fake "live" pulses.
- **Verify:** realistic data volumes (1k–100k rows, virtualisation), empty and error panels, keyboard grid navigation, number formatting and locale.

## 9. Editorial, publication and immersive story
- **Excellent means** that reading is a pleasure, the argument is clear, and visuals carry evidence.
- **Priorities:** measure, leading and hierarchy → pacing → visuals synced to text → navigation within long pieces (progress, contents, anchors) → shareable deep links.
- **Scrollytelling rules:** text drives; graphics respond. Every step is reachable by keyboard and deep link. A static or reduced version tells the same story. Never trap scroll.
- **Motion budget:** medium to high inside story graphics; low in reading chrome.
- **Common slop:** parallax hero photos, fade-up paragraphs, giant drop caps on everything.
- **Verify:** 45–75 character measure, reading on a phone in one hand, reduced-motion narrative intact, print or reader mode acceptable.

## 10. Experimental, installation, WebGL and generative
- **Excellent means** a world with its own rules that people understand within seconds, built with production discipline.
- **Priorities:** concept → the first 5 seconds (orientation and affordance) → the signature mechanic → performance on target devices → an accessible parallel layer (an HTML narrative with the same content) → a reduced-motion version.
- **Engineering:** device-tier detection and quality scaling; pause on hidden tab; dispose resources; an audio opt-in; a poster frame; graceful no-WebGL fallback.
- **Common slop:** particles forming a logo; exploded product renders unrelated to the product; neon grids; cursor-reactive blobs.
- **Verify:** headed browser and a real mid-range phone (headless GPU can stall); memory stable across navigation (`renderer.info`); frame time; fallback path.

## 11. Design system and component library
- **Excellent means** the system makes the right thing easy and allows character without forking.
- **Priorities:**
  - Token architecture: primitive → semantic → component.
  - Accessible primitives with documented states.
  - Composition patterns, motion tokens and theming.
  - Documentation that demonstrates. Dropbox Brand's navigation is itself a specimen of the system.
- **Common slop:** renamed library defaults; one radius and shadow for everything; docs pages of static swatches only.
- **Verify:** every component has every state, keyboard support, RTL and long-text handling, dark mode, reduced motion, visual regression baseline.

## 12. Redesign / audit of an existing product
- **Excellent means** measurable improvement while respecting what works. Never wipe out working architecture, URLs or content.
- **Process:**
  1. Run `inspect_repo.mjs`, `slop_scan.mjs` and `audit_page.mjs` on the current site to get a baseline.
  2. Diagnose against the four failure classes.
  3. Separate quick fixes (C failures) from concept-level changes.
  4. Propose territories that keep the brand's real equity.
  5. Migrate incrementally.
- **Keep:** URLs (or add redirects), SEO metadata, analytics events, content models, accessible behaviours that already work.
- **Verify:** before/after contact sheets, before/after metrics, no lost routes, no regressions in existing tests.

## 13. Prototype and interface exploration
- **Excellent means** answering a design question quickly and honestly.
- **Rules:** label the prototype as such; use clearly marked sample data; build only the paths needed to answer the question; record the question and the answer.
- **Allowed:** stubbed back ends behind an explicit "demo" label. **Not allowed:** passing a prototype off as finished, or leaving placeholder media in anything shipped.

## 14. Budgets at a glance

Starting points. Adjust to the concept and audience, and write the chosen budget into the design language.

| Mode | Motion budget | Signature moments | JS budget (compressed, initial route) | LCP target (p75 mobile) | Density |
|---|---|---|---|---|---|
| Brand / marketing | medium | 1 | ≤ 200 KB | ≤ 2.5 s | balanced |
| Campaign | high (with RM path) | 1–2 | ≤ 350 KB + lazy 3D | ≤ 2.5 s to first meaningful frame | sparse |
| Studio / portfolio | medium–high | 1 | ≤ 250 KB + lazy media | ≤ 2.5 s | sparse–balanced |
| E-commerce story | high | 1–2 | ≤ 250 KB | ≤ 2.5 s | balanced |
| E-commerce transactional | low | 0 | ≤ 170 KB | ≤ 2.0 s | balanced |
| SaaS marketing | medium | 1 | ≤ 200 KB | ≤ 2.5 s | balanced |
| SaaS app | low–medium | 0–1 (onboarding) | route-split | interaction INP ≤ 200 ms | user-dependent |
| Dashboard / data | low | 0 | route-split, virtualised | INP ≤ 200 ms, CLS ≤ 0.05 | dense |
| Editorial | medium in graphics | 1 per story | ≤ 200 KB + per-graphic | ≤ 2.5 s | reading-first |
| Experimental / WebGL | high | 1 world | lazy after poster | poster ≤ 2.5 s | sparse |
| Design system | tokens only | n/a | per component | n/a | n/a |
