# Experience flow

Treat the experience as a connected system, not a stack of polished screens. Map the journey first, then design each step to move the user forward.

## Contents
1. Journey archetypes (don't force a funnel)
2. Experience map (per route or step)
3. Section-to-section continuity
4. Functional interaction design (every control is real)
5. State inventories
6. Cognitive load and discoverability
7. Orientation and wayfinding
8. Content truth and placeholders
9. Flow review checklist

---

## 1. Journey archetypes

Choose the archetype that matches the mode. A marketing funnel is wrong for a product, and a product flow is wrong for a story.

| Archetype | Stages | Typical modes |
|---|---|---|
| **Persuasion** | first impression → understanding → exploration → proof → decision → action | Brand, SaaS marketing, campaign |
| **Task** | arrive → find → act → confirm → recover if needed | Public services, account, settings, support |
| **Product** | initial state → discovery → configuration → execution → feedback → error recovery → completion | SaaS app, tools, configurators |
| **Purchase** | browse → compare → choose variant → add → review cart → pay → confirmation → after-purchase | E-commerce |
| **Narrative** | hook → context → rising evidence → turn → resolution → next story or share | Editorial, immersive story |
| **Exploration** | orient → wander → discover → collect → return | Portfolios, galleries, experimental worlds |
| **Monitoring** | glance → detect anomaly → drill down → diagnose → act → verify | Dashboards, admin |

## 2. Experience map

Fill this for each major route or step. Template: assets/creative-brief.md §5.

| Field | Prompt |
|---|---|
| User intent | What did the user come here to do or learn *at this step*? |
| Information required | What must they know to proceed? What can wait? |
| Prior knowledge | What do they already know from earlier steps or from outside the site? |
| Primary action | One clear next action (label names the object or consequence). |
| Secondary action | Alternatives that don't compete visually. |
| Context | Device, attention, emotional state, time pressure. |
| Expected next state | Where they land and what they see immediately. |
| Failure / abandonment points | Where they might get stuck, doubt, or leave, and the design response. |
| Orientation cues | How they know where they are and how far they've come. |
| Motion / transition | What carries continuity into the next state (motion-intelligence.md §6). |
| Success criteria | Observable signal that this step worked. |

## 3. Section-to-section continuity

For multi-section pages, write one line per section:

```
Section: <name>
Exists because: <the question it answers>
Follows from: <what the previous section raised>
Introduces: <the new information>
Prepares: <the question the next section answers>
Emphasis: <the one thing that must be seen>
Bridge: <transition or visual link to the next, if any>
Without animation: <how the connection still reads>
```

If a section can't fill "Exists because" with a user question, cut it. If two sections answer the same question, merge them. The order comes from the user's questions, not from the template stack.

## 4. Functional interaction design

Every visible control must have an understandable function and a real result. For each control, specify:

| Purpose | State model | Input | Feedback | Semantics | Result |
|---|---|---|---|---|---|
| What it does for the user | idle / hover / focus / pressed / pending / success / error / disabled (with reason) | pointer, touch, keyboard, assistive tech | visual + text + (if async) live region | native element or APG pattern; name, role, value | what changes (data, route, view), and how undo works |

Not allowed: buttons that do nothing; dead links; decorative toggles; fake search; fake authentication; empty modal shells; filters that don't change the data; progress indicators that don't measure progress.

**When the back end doesn't exist:** build a clearly bounded local demo (in-memory or mock service) that behaves realistically, including latency and failure. Label it visibly or in the README as a demo, and say so in the report. Never imply production behaviour.

## 5. State inventories

Every complex component gets an explicit inventory before it is styled. Mark each state as designed (D), built (B) or tested (T).

**Async search / combobox:**
initial (with recent or suggested) · focused · typing (debounced) · loading · results · no results (with recovery: spelling, broaden, browse) · error (retry) · keyboard-highlighted option · selected · cleared · offline · very long result labels · many results (virtualised or paginated) · RTL.

**Form:** pristine · focused · filled · valid · invalid (inline, on blur or submit, with a specific fix) · server error (mapped to fields + summary) · submitting (button pending, double-submit blocked) · success (what happens next) · partially saved / draft · session expired (preserve input) · autofill · paste of formatted values.

**Data table / grid:** loading (skeleton matching column widths) · empty (first use: explain and offer an action) · empty (filtered: show filters, offer a clear) · populated · sorting · filtered · selected (single/bulk) · bulk action pending · row error · pagination or virtual scroll edge · very wide content · permission-limited columns · stale data indicator.

**Dashboard panel:** loading with reserved geometry · no data for range · partial data · error with retry · stale/live indicator · zero vs. null distinguished · threshold breach · drill-down transition.

**Checkout:** cart empty · item unavailable · price changed · address validation · shipping options loading/none · payment pending, failed (specific reason), 3-D Secure challenge · success with order number · duplicate submission blocked · session timeout.

**Media / 3D viewer:** poster · loading (real progress) · ready · interacting · error / no WebGL (fallback image + text) · reduced motion · offline.

**Navigation:** default · current page · open (mobile) · nested open · focus trapped where modal · scrolled (condensed) · hidden on scroll (must reappear on focus or scroll up).

**Global:** offline · slow network · authentication expired · permission denied · not found (404) · server error (500) · maintenance · unsaved changes on leave · partial failure (some items saved).

## 6. Cognitive load and discoverability

- Experimental interfaces must teach themselves in the first few seconds through labels, visible affordances, a first-frame hint or a short demonstration that is interruptible.
- Every unconventional interaction has a learning cost. Write down the benefit that pays for it. If you can't, use the convention.
- Never hide critical actions behind unexplained gestures, hover reveals or decorative interactions.
- Keep one primary action per view. Group related secondary actions. Disclose advanced options progressively.
- Use the user's words (from support tickets, reviews, the domain), not internal jargon.

## 7. Orientation and wayfinding

- Current location is visible: active nav state, breadcrumbs in deep hierarchies, page titles that match link labels.
- Progress is visible in multi-step flows and long narratives (step indicator, progress rail, table of contents).
- Spatial or unconventional navigation needs a conventional escape: an index, a menu, a search, a "skip the experience" link.
- Deep links restore the exact state. Back and forward behave as expected. Scroll position is restored on return.
- Consent banners and gates are part of the flow. Design them so the content stays visible and keyboard focus lands sensibly.

## 8. Content truth and placeholders

- Use real content wherever it exists. Where it doesn't:
  - Copy: write a draft that is specific to the product, using facts you know, and mark it for review.
  - Proof (testimonials, logos, metrics): **leave a designed, labelled slot** ("Customer quote: awaiting approval"). Never invent one.
  - Imagery: use the project's assets, procedural or diagrammatic art that is honestly illustrative, or clearly labelled placeholders. Never stock faces posing as customers.
  - Product UI: real screenshots, or a live demo with sample data labelled as such.
- Stress-test with long names, translated strings (+30–40% length), zero/one/many items and missing optional fields.

## 9. Flow review checklist

- [ ] Journey archetype chosen; experience map written for each major step.
- [ ] Every section passes "Exists because"; order follows user questions.
- [ ] Every control specified (purpose, states, semantics, result); none are fake.
- [ ] State inventories written for complex components, and states built.
- [ ] Primary action clear per view; labels name the object or consequence.
- [ ] Orientation and escape hatches present; deep links and back button work.
- [ ] Proof is real or clearly labelled as missing.
- [ ] Flow works without animation and with keyboard only.
