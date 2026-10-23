# Component architecture

Build a component system that is reusable without making everything look like a component-library demo.

## Contents
1. Principles
2. Custom component specification
3. Token architecture
4. Variation at the right abstraction level
5. Building on existing libraries (shadcn/ui, Radix, Base UI, MUI…)
6. Behaviour primitives and state machines
7. TypeScript contracts
8. File organisation and size
9. Documentation and testing
10. Component quality checklist

---

## 1. Principles

- A component wraps a **meaningful visual or functional unit**. Don't build something only because an abstraction is convenient.
- Don't reuse one card layout for content with different meanings. A product, a quote, a metric and an article are different objects.
- Native first: `button`, `a`, `input`, `select`, `dialog`, `details`, `form`, `fieldset`, `table`. Reach for an ARIA pattern (APG) only when native elements can't express the interaction.
- Behaviour and appearance are separable. Accessible behaviour can come from a headless primitive; the look comes from the project's language.
- Each component has one responsibility, explicit states, and no hidden global side effects.

## 2. Custom component specification

Write one per bespoke widget (template: assets/component-spec.md):

```
Name:
Purpose (user need it serves):
Conceptual relationship to the brand / concept:
Visual structure (anatomy: parts and slots):
Content schema (fields, types, required/optional, limits):
Props / input contract:
Internal states (and transitions between them):
Interaction model (pointer, touch, keyboard, assistive tech):
Motion behaviour (per state; reduced-motion version):
Responsive variants (container-query breakpoints, input-mode changes):
Accessibility semantics (role, name, value, relationships, live regions):
Error and empty states:
Integration points (data, routing, analytics, forms):
Testing strategy (unit for state, a11y checks, visual, interaction):
```

## 3. Token architecture

Three tiers. Names carry meaning; values carry the concept.

```css
:root {
  /* 1. Primitive tokens: raw values derived from the concept (never used directly in components) */
  --ink-950: oklch(0.18 0.02 60);  --paper-50: oklch(0.97 0.01 85);  --signal-500: oklch(0.70 0.17 45);
  --space-1: 0.25rem; /* … a scale whose ratio is a decision, e.g. tied to the type scale */
  --radius-0: 0; --radius-tag: 2px; --radius-sheet: 14px;

  /* 2. Semantic tokens: roles */
  --color-ground: var(--paper-50); --color-ink: var(--ink-950); --color-ink-muted: color-mix(in oklch, var(--ink-950) 64%, var(--paper-50));
  --color-accent: var(--signal-500); --color-focus: var(--signal-500);
  --color-success: …; --color-warning: …; --color-danger: …; --color-info: …;
  --surface-raised: …; --surface-sunken: …; --border-hairline: 1px solid color-mix(in oklch, var(--ink-950) 14%, transparent);
  --font-display: …; --font-text: …; --font-data: …;
  --text-display: clamp(…); --text-h1: …; --text-body: …; --text-caption: …;
  --dur-quick: 160ms; --ease-enter: cubic-bezier(.2,.7,.1,1);
  --focus-ring: 0 0 0 2px var(--color-ground), 0 0 0 4px var(--color-focus);

  /* 3. Component tokens: only where a component needs a dial */
  --ledger-row-height: 2.75rem; --ledger-rule: var(--border-hairline);
}
```
(The values above are illustrative only. Derive the real ones from the art direction.)

Coverage checklist: primitive colour · semantic colour (incl. states, data series, focus) · typography roles (family, size, weight, leading, tracking, features) · spacing scale · layout (columns, gutters, max widths, container sizes) · radius *logic* (by semantic role, not one value) · borders and separators · elevation (what is raised and why) · motion tokens · breakpoints and container rules · focus styles · interaction states (hover/press/selected/disabled) · z-index layers · theme variants (dark, high contrast, `forced-colors`).

**Tokens must support the aesthetic.** Don't force every concept into the same roundness, shadow, spacing scale or palette structure. A broadsheet concept may need zero radius and hairlines. A soft-object concept may need large radii only on objects that are physically soft.

With Tailwind, map semantic tokens into the theme (v4: `@theme` in CSS; v3: `theme.extend` with CSS variables) so utilities use `bg-ground text-ink`, not raw palette classes.

## 4. Variation at the right abstraction level

Reuse should keep meaningful consistency without erasing individuality:
- **Share** tokens, behaviour primitives (disclosure, popover, listbox), interaction feedback, focus styles and motion tokens.
- **Vary** composition, anatomy and material per content type. A product card, a case-study panel, a technical data inspector and an editorial image spread can all come from the same system and still look different.
- Use **variants** for systematic differences (size, emphasis, tone). Use **separate components** for different meanings.
- Avoid boolean-prop explosions (`isLarge isGhost isRounded isDark`). Prefer `variant`, `size` and `tone` unions, or composition.

## 5. Building on existing libraries

- If the project uses shadcn/ui, Radix, Base UI, React Aria, MUI, Mantine or similar, **keep the accessible behaviour and restyle through tokens and variants.** Don't fork every primitive.
- Replace default theme tokens (`slop_scan` flags unchanged shadcn defaults) with the concept's tokens.
- Wrap library primitives in project components with project naming and constrained props, so the library's whole API surface doesn't leak into product code.
- Don't add a second component library to a project that already has one.

## 6. Behaviour primitives and state machines

- Model non-trivial widgets as explicit states and events (a reducer or a small state machine): idle → open → selecting → committing → error. This prevents impossible states (loading and error at once) and makes testing easy.
- Keep server state (fetching, caching) separate from UI state (open, highlighted). Use the project's data library if present.
- Derive, don't duplicate: compute filtered lists from the source and the filters; don't store both in state.
- Compound components (`<Tabs><Tabs.List/><Tabs.Panel/></Tabs>`) for multi-part widgets with shared state via context.

## 7. TypeScript contracts

```ts
type Tone = "neutral" | "accent" | "danger";
type LedgerRowProps = {
  entry: { id: string; date: string; payee: string; amountMinor: number; currency: string; status: "matched" | "unmatched" | "flagged" };
  onMatch?: (id: string) => Promise<void>;   // async result → pending/success/error states
  density?: "comfortable" | "compact";
};
```
- Model domain data explicitly (money in minor units plus currency; dates as ISO strings parsed at the edge).
- Avoid `any`, giant optional prop bags and `[key: string]: unknown` passthroughs. Forward `className` and `ref` deliberately.
- Make invalid states unrepresentable (discriminated unions for status).

## 8. File organisation and size

- Follow the project's conventions. If none exist: `components/<domain>/<Component>/` with the component, its styles, its spec and tests side by side.
- Split files over about 300 lines by responsibility (view, state, motion hook).
- Put motion in hooks (`useLedgerReveal`) or in the component with `useGSAP`. Don't scatter global scripts.
- No fragile DOM manipulation outside refs. No unbounded global listeners.

## 9. Documentation and testing

- A spec (or Storybook story) per bespoke component, showing **every state**, including empty, error, long text, RTL, dark and reduced motion.
- Unit-test state transitions and ARIA attributes. Interaction-test keyboard paths. Visual-regression-test key states where the project has tooling.
- Design-system docs should demonstrate the system (live specimens) rather than list swatches only.

## 10. Component quality checklist

- [ ] Native element or APG pattern used; name, role and value correct.
- [ ] All states designed and built: hover, focus-visible, active, disabled (with reason), loading, error, empty, selected.
- [ ] Keyboard operable; focus visible and not obscured; Escape/Enter/Space/arrow keys per pattern.
- [ ] Touch targets ≥ 24×24 px (44×44 preferred for primary touch actions).
- [ ] Responsive via container queries or props; no hover-only meaning.
- [ ] Motion uses tokens; reduced-motion variant; cleanup on unmount.
- [ ] Typed contract; no `any`; invalid states unrepresentable.
- [ ] Looks like *this project*, not like the library demo.
