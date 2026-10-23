# Component spec: <Name>

| Field | Spec |
|---|---|
| Purpose (user need) | |
| Relationship to the concept / brand | |
| Anatomy (parts, slots) | |
| Content schema (fields, types, limits, required/optional) | |
| Props / input contract (TypeScript) | |
| Internal states and transitions | |
| Interaction model (pointer / touch / keyboard / AT) | |
| Motion per state (+ reduced-motion version) | |
| Responsive variants (container breakpoints, input modes) | |
| Accessibility semantics (native element or APG pattern; name, role, value; live regions) | |
| Error and empty states | |
| Integration points (data, routing, forms, analytics) | |
| Testing strategy (unit state, a11y, interaction, visual) | |

## State inventory
| State | Designed | Built | Tested | Notes |
|---|---|---|---|---|
| default | | | | |
| hover | | | | |
| focus-visible | | | | |
| active / pressed | | | | |
| loading / pending | | | | |
| success | | | | |
| error | | | | |
| empty | | | | |
| disabled (with reason) | | | | |
| long content / RTL | | | | |
| reduced motion | | | | |

## Contract
```ts
type <Name>Props = {
  // domain-typed fields; discriminated unions for status; no `any`
};
```
