# Accessibility

Accessibility shapes design decisions from the first sketch; it isn't something to check at the end. The research found that Accessibility was the lowest or tied-lowest developer sub-score on 14 of 15 recent award winners sampled. This skill aims to match those winners on craft and exceed them on access.

## Contents
1. Conformance target
2. Structure and semantics
3. Names, labels and descriptions
4. Keyboard and focus
5. Dialogs, menus and other overlays
6. Forms and errors
7. Colour, contrast and visual presentation
8. Motion, flashing and auto-moving content
9. Touch, pointer and gestures
10. Media
11. Experimental and WebGL experiences
12. Testing protocol (automated + manual)
13. Reporting accessibility honestly

---

## 1. Conformance target

The default target is **WCAG 2.2 Level AA**. On top of that, honour **2.3.3 Animation from Interactions (AAA)** for any large or spatial motion, because motion-heavy work is this skill's territory. If the project specifies a different target (a legal requirement, or AAA for a public sector body), use that instead.

New in 2.2 and easy to miss:
- 2.4.11 Focus Not Obscured: sticky headers, cookie bars and chat widgets cover focused elements.
- 2.5.7 Dragging Movements: every drag needs a single-pointer alternative.
- 2.5.8 Target Size Minimum: targets must be 24×24 CSS px or adequately spaced.
- 3.2.6 Consistent Help.
- 3.3.7 Redundant Entry.
- 3.3.8 Accessible Authentication: no cognitive puzzles without an alternative.

## 2. Structure and semantics

- Exactly one `h1` per page that names the page. Headings form an outline without skipped levels. Visual size and heading level are independent.
- Landmarks: `header`, `nav` (labelled if there are several), `main` (one), `footer`, and `aside`/`section` with accessible names where useful.
- Skip link as the first focusable element, visible on focus.
- `lang` on `<html>`, plus `lang` on passages in other languages.
- Lists are lists, tables are tables (with `th` and `scope`, or headers), and buttons are buttons. Links navigate; buttons act.
- In the corpus, 12 of 21 sites lacked a single h1 and 8 lacked `main`. Immersive sites still need structure: give the WebGL world an HTML layer.

## 3. Names, labels and descriptions

- Every interactive element has an accessible name that matches its visible label where one exists (2.5.3 Label in Name).
- Icon-only buttons: `aria-label`, or visually hidden text. Decorative SVGs get `aria-hidden="true"`.
- Images: meaningful `alt` in context; `alt=""` for decoration; complex images (charts, diagrams) get a text alternative or data table.
- Use `aria-describedby` for hints and errors. Don't put essential instructions in placeholders.
- Avoid ARIA when native semantics suffice; incorrect ARIA is worse than none.

## 4. Keyboard and focus

- Everything operable with a pointer is operable with a keyboard, in a logical order that follows the visual reading order.
- **Visible focus** on every focusable element. Use a two-tone ring that survives any background:
```css
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; box-shadow: 0 0 0 4px var(--color-ground); }
```
- Never `outline: none` without a replacement of equal visibility. The `slop_scan` and `audit_page` focus probes look for this.
- Focus must not be obscured by sticky or fixed UI (2.4.11). Use `scroll-padding-top` for sticky headers.
- No focus on invisible elements. Off-screen menus and closed panels must be `inert` or `hidden`. In the corpus, focus landed on hidden elements on four sites.
- No positive `tabindex`. Use `tabindex="-1"` only for programmatic focus targets.
- Custom widgets follow APG keyboard models: arrows within composites (tabs, menus, listboxes, grids), Tab between them, Escape closes, Home/End jump.

## 5. Dialogs, menus and other overlays

- Modal: native `<dialog>` with `showModal()`, or an APG-conformant dialog.
  - Focus moves in on open.
  - Focus is contained while open; the background is inert.
  - Escape closes.
  - Focus returns to the trigger on close.
  - The dialog has a name (`aria-labelledby`).
- Full-screen menus are modal: the same rules apply. A hamburger button exposes `aria-expanded` and controls the menu.
- Popovers and tooltips: tooltips are for supplementary text only, appear on hover *and* focus, can be dismissed with Escape, and stay hoverable (1.4.13). Interactive content belongs in a popover or dialog, never a tooltip.
- Consent banners are overlays too. They must not trap focus without purpose. They should be dismissible and keep the content readable.

## 6. Forms and errors

- A visible label for every field; groups use `fieldset` and `legend`. Required fields are marked in text, not only with colour or an asterisk without explanation.
- Correct `type`, `inputmode` and `autocomplete` tokens (enables autofill, satisfies 1.3.5).
- Validate on submit, then on change once a field has an error. Don't scream at users while they're typing.
- Error messages name the field, the problem and the fix. Link from an error summary to the fields. Announce the summary (focus it, or use a live region).
- Preserve input on error and on session expiry. Don't ask for the same information twice (3.3.7).
- Submit buttons show a pending state and block double submission. Success states say what happens next.

## 7. Colour, contrast and visual presentation

- Text contrast is 4.5:1 (normal) and 3:1 (≥ 24 px, or ≥ 18.66 px bold). UI component boundaries and focus indicators need 3:1.
- Check text over images, video and gradients at the *worst* point. Add a scrim or move the text if necessary.
- Never convey meaning by colour alone. Add text, icons, patterns or position.
- Content reflows at 320 CSS px width and at 400% zoom without two-dimensional scrolling (1.4.10). Text spacing overrides don't break the layout (1.4.12).
- **Never block zoom** (`maximum-scale=1` or `user-scalable=no`). Three corpus sites did this.
- Respect `forced-colors`. Use system colours for focus and borders where custom ones vanish.

## 8. Motion, flashing and auto-moving content

- `prefers-reduced-motion: reduce` gets a complete, designed alternative that **replaces** motion (dissolve, cut, static key frames) and never removes content or controls. See motion-intelligence.md §10.
- Provide a visible motion toggle on motion-heavy experiences.
- Auto-moving, blinking or scrolling content longer than 5 s gets pause, stop or hide controls (2.2.2). Carousels don't auto-advance by default; if they do, they pause on hover and focus and have a pause button.
- Nothing flashes more than three times per second (2.3.1).
- Scroll-jacking, if used at all, must keep keyboard scrolling, anchors and assistive tech working.

## 9. Touch, pointer and gestures

- Targets are at least 24×24 px (aim for 44×44 for primary touch actions), with spacing between adjacent targets.
- Every path-based or multi-point gesture has a single-pointer alternative (2.5.1). Every drag has a click or tap alternative (2.5.7).
- Actions fire on pointer up, so they can be cancelled (2.5.2).
- Hover-only content has a tap or focus equivalent. Gate hover effects with `@media (hover: hover) and (pointer: fine)`.
- Don't disable pinch-zoom or override native scrolling on touch.

## 10. Media

- Captions for pre-recorded speech; transcripts for audio; audio descriptions or a descriptive transcript where visuals carry meaning.
- No autoplaying audio. Autoplaying video is muted, has controls or a pause button, and respects reduced motion (poster instead).
- Sound-reactive or audio-led experiences are opt-in, with a visible mute.

## 11. Experimental and WebGL experiences

- Provide an **HTML layer** that carries the same content and navigation as the canvas: headings, text, links and controls positioned or listed accessibly.
- Every in-world control is reachable by keyboard and named. A conventional index or menu offers an escape from spatial navigation.
- Entry gates ("Enter", "draw a zero") have a keyboard path and a skip.
- Provide a no-WebGL fallback and a reduced-motion version (static scenes, a guided sequence instead of free camera).
- Pause rendering when the tab is hidden; audio is opt-in.

## 12. Testing protocol

**Automated** (finds candidates, not conformance):
- `audit_page.mjs`: landmarks, h1, unnamed controls, images without alt, small targets, contrast candidates, zoom blocking, focus walk (no visible change, invisible focus, obscured focus), reduced-motion capture.
- axe-core (`@axe-core/playwright`) if the project has it, or add it to e2e tests with the user's agreement.
- `slop_scan.mjs`: static a11y hazards (missing alt, clickable divs, focus removal, positive tabindex, zoom blocking).

**Manual** (required before claiming accessibility):
1. Keyboard-only: complete every primary task; watch focus order, visibility and traps.
2. Screen reader spot check: VoiceOver (macOS/iOS) or NVDA (Windows). Check headings list, landmarks, form labels and errors, dialog announcements, dynamic updates.
3. Zoom to 200% and 400%, plus 320 px width: no loss of content or function.
4. Reduced motion on: review the whole experience.
5. Touch device or emulation: targets, gestures, no hover dependence.
6. Forced colours / high contrast: focus and borders visible.

## 13. Reporting accessibility honestly

Say which checks ran (automated and manual), on which pages, with which tools, and what wasn't tested (for example "no screen-reader testing was done"). Never claim WCAG conformance from automated tools alone. Use phrases like "no automated violations found on X pages; keyboard pass complete; screen-reader testing pending."
