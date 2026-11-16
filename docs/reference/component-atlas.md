# Component atlas

The [component atlas](../../skills/form-and-force/references/component-atlas.md) is a build-time reference for individual components: what each is really for, the states and edge cases it needs, how it should behave, and how to test it. It is consulted once a direction is set. It is not a source of designs: a component's form comes from the project's device, and the atlas makes sure the result is complete and correct.

## How it is organised

180 components in 12 sections:

| § | Section | Examples |
|---|---|---|
| 1 | Global layout and composition | Page templates, section sequencing, grids, editorial layouts |
| 2 | Navigation | Main navigation, mega menus, breadcrumbs, scroll-aware navigation |
| 3 | Heroes and opening experiences | Typography-led heroes, product demonstrations, data-driven openings |
| 4 | Typography and content | Display headings, numeric displays, kinetic typography, microcopy |
| 5 | Action and form controls | Buttons, comboboxes, sliders, file upload, multi-step forms |
| 6 | Repeated content structures | Cards, accordions, carousels, pricing tables, testimonials |
| 7 | Complex data interfaces | Data grids, charts, filters, command menus, dashboard panels |
| 8 | Feedback and system states | Skeletons, empty states, errors, toasts, dialogs |
| 9 | Product-specific experiences | Onboarding, sign-in, checkout, product configuration |
| 10 | Experimental and custom interactions | Drag, infinite canvases, scroll-driven scenes, WebGL environments |
| 11 | Mobile-specific components | Bottom sheets, swipe, sticky mobile actions, mobile filters |
| 12 | Footer and secondary details | Footers, cookie preferences, error and maintenance pages |

## The entry format

Every entry answers the same fields in the same order, so a search returns a whole entry:

| Field | Meaning |
|---|---|
| **Job** | What the component is really for |
| **Generic** | The common default, and **Why it fails** (generic, timid, unresolved, incoherent or unverified) |
| **Stronger** | Ways out, to be re-derived from this project's content and device. Never designs to adopt |
| **Keep convention when** | Contexts where the familiar pattern is right |
| **Decide** | How to choose |
| **Content · Motion · Responsive · A11y** | Requirements |
| **States** | States and edge cases to build |
| **Build** | Implementation notes |
| **Test · Severity · Evidence** | How to verify; **A** is a review trigger and **C** a failure if violated; research ledger IDs |
| **Example** | A generic version and a context-specific replacement |

A few entries are **cross-references**: one line pointing to the entry or reference that covers the component, with its own severity and evidence. [`tests/test_library.py`](../../tests/test_library.py) checks that every entry is complete or a cross-reference, that fields are in order, that severities are A or C, that cross-references point at real entries, and that the index at the top of the atlas lists every entry.

## Searching it

The atlas is searched, never read whole:

```bash
grep -n "^### " skills/form-and-force/references/component-atlas.md                  # every component
grep -n "^### " skills/form-and-force/references/component-atlas.md | grep -i pricing
grep -n -A 16 "^### Pricing tables" skills/form-and-force/references/component-atlas.md
```

On the documentation site, the search box finds components by name and by the text of their entries.

## Index

Generated from the atlas by `tooling/sync_docs.py`; do not edit by hand.

<!-- generated:atlas-index -->
180 components.

| Section | Component | Severity | Job |
|---|---|---|---|
| 1. Global layout and composition | Page templates | A | Give each page type a predictable skeleton so users learn the site, while leaving room for content-specific composition. |
| 1. Global layout and composition | Header and footer composition | A (C if focus is obscured) | Brand presence, orientation and access to primary routes (header); completion, secondary routes, trust and legal (footer). |
| 1. Global layout and composition | Section sequencing | A | Order sections so each answers the question the previous one raised. |
| 1. Global layout and composition | Grids and asymmetric layouts | A | Create a recognisable spatial logic that organises content and gives the brand a structure. |
| 1. Global layout and composition | Whitespace and information density | A | Control attention and scanning speed; fit density to the task. |
| 1. Global layout and composition | Editorial layouts | A | Make long reading pleasurable and let images and annotations argue alongside the text. |
| 1. Global layout and composition | Full-bleed content | A | Give the most important visual its full frame; create pacing breaks. |
| 1. Global layout and composition | Overlapping and layered compositions | A | Express relationships (annotation on object, caption on image, depth in a scene). |
| 1. Global layout and composition | Background graphics | A | Atmosphere and identity behind content, carrying the concept's material. |
| 1. Global layout and composition | Responsive composition | C if broken (overflow, lost content); A otherwise | Keep the composition's idea intact as space changes. |
| 1. Global layout and composition | Long-form page flow | A | Keep users oriented and moving through long pages. |
| 2. Navigation | Utility bars | A | Secondary, task-oriented links (locale, account, support, store finder) above the main nav. |
| 2. Navigation | Main navigation | C if not keyboard-operable | Show what the site contains and where the user is; let them move between top-level areas. |
| 2. Navigation | Transparent and sticky headers | C for obscured focus | Keep navigation reachable without stealing content space; let hero imagery breathe. |
| 2. Navigation | Minimal navigation | A | Reduce chrome for immersive or single-purpose experiences. |
| 2. Navigation | Full-screen menus | C if focus escapes or hides behind | Present navigation as an event: a large index, often with previews. |
| 2. Navigation | Mega menus | A (C if hover-only) | Expose a large IA (dozens of destinations) in one view. |
| 2. Navigation | Sidebars | A | Persistent navigation for apps, docs and dashboards. |
| 2. Navigation | Breadcrumbs | A | Show location in a deep hierarchy and allow quick ascent. |
| 2. Navigation | Navigation drawers | C (focus on hidden links) | Off-canvas navigation on small screens or secondary panels. |
| 2. Navigation | Tab bars | A | Primary destinations in app-like mobile experiences. |
| 2. Navigation | Floating navigation | A | Keep navigation available as a compact, persistent element. |
| 2. Navigation | Mobile navigation | C if inaccessible | Fast access to destinations on small, touch screens. |
| 2. Navigation | Scroll-aware navigation | A | Adapt navigation to reading context (condense, hide, show progress). |
| 2. Navigation | Active states and orientation cues | C if location is invisible to assistive tech | Tell users where they are and what's selected. |
| 3. Heroes and opening experiences | Standard heroes | A | State what this is and for whom, and offer the next step, within the first screen. |
| 3. Heroes and opening experiences | Split-screen compositions | A | Pair two things that belong together (text and object, before and after, two audiences). |
| 3. Heroes and opening experiences | Asymmetric heroes | A | Create tension and focus through imbalance. |
| 3. Heroes and opening experiences | Typography-led heroes | A | Let words carry identity when the message is the product (editorial, studios, manifestos). |
| 3. Heroes and opening experiences | Image-led heroes | A (C if fabricated imagery is presented as real) | Let a real image establish place, product or mood immediately. |
| 3. Heroes and opening experiences | Product demonstrations | C if fake | Show the product doing its job in seconds. |
| 3. Heroes and opening experiences | Interactive canvases | A (C if it gates content without an alternative) | Invite manipulation as the first act (configure, draw, explore). |
| 3. Heroes and opening experiences | Data-driven openings | C if unsourced or invented | Open with a real number or visualisation that frames the story. |
| 3. Heroes and opening experiences | Editorial introductions | A | Open a story with voice, context and an invitation to read. |
| 3. Heroes and opening experiences | Full-screen experiences | C if content is unreachable without the experience | Immerse the visitor in a world from the first frame. |
| 3. Heroes and opening experiences | Preloaders and entry transitions | C (fake percentages); A otherwise | Bridge real loading time, or mark a deliberate threshold. |
| 4. Typography and content | Display headings | A | Establish voice and hierarchy at the largest scale. |
| 4. Typography and content | Body text | C if contrast fails | Comfortable, sustained reading. |
| 4. Typography and content | Captions and metadata | A (C if contrast fails) | Context (source, date, author, credit) without competing with content. |
| 4. Typography and content | Labels | A | Name UI elements and categories precisely. |
| 4. Typography and content | Technical annotations | C if specs are wrong | Explain parts, measurements or behaviour directly on a visual. |
| 4. Typography and content | Numeric displays | A | Present numbers so they can be read and compared. |
| 4. Typography and content | Variable fonts | A | Fine typographic control and expressive behaviour from one file. |
| 4. Typography and content | Kinetic typography | A (C if text becomes unreadable to assistive tech) | Make words move when their movement *is* the message. |
| 4. Typography and content | Text wrapping and measure | C if overflow; A otherwise | Keep lines readable and headlines well-shaped. |
| 4. Typography and content | Editorial hierarchy | A | Guide readers through levels (kicker, title, deck, subheads, body, notes). |
| 4. Typography and content | Rich text | C for unsanitised input | Render CMS or markdown content consistently and safely. |
| 4. Typography and content | Microcopy | A | Make actions, errors and states unambiguous. |
| 4. Typography and content | Empty or missing copy | C | Handle content that doesn't exist yet without breaking the layout or lying. |
| 4. Typography and content | Content placeholders | C | Stand in for real assets during design without misleading anyone. |
| 4. Typography and content | Multilingual and localisation | A (C if a supported locale breaks) | Work in every supported language and script. |
| 5. Action and form controls | Buttons | C if non-functional or not keyboard-operable | Trigger an action with a clear consequence. |
| 5. Action and form controls | Button groups | A | Offer related actions or exclusive options together. |
| 5. Action and form controls | Icon buttons | C if unnamed | Compact, frequent actions (close, edit, more). |
| 5. Action and form controls | Links | C for dead links | Navigate to a resource. |
| 5. Action and form controls | Input fields | C if unlabelled | Capture text accurately and quickly. |
| 5. Action and form controls | Search fields | C if fake | Find content or items fast. |
| 5. Action and form controls | Select menus | C if inaccessible | Choose one option from a list. |
| 5. Action and form controls | Comboboxes | C if not operable | Choose from a large or searchable set; allow free entry where appropriate. |
| 5. Action and form controls | Checkboxes | C for pre-checked consent | Toggle independent options; agree to terms. |
| 5. Action and form controls | Radio groups | C if inaccessible | Choose exactly one of a few options. |
| 5. Action and form controls | Switches | A (C if decorative) | An immediate on/off setting. |
| 5. Action and form controls | Sliders | C if not operable | Choose a value in a range where approximate selection is fine. |
| 5. Action and form controls | File upload controls | C if drag-only | Add files reliably. |
| 5. Action and form controls | Validation messages | C if errors aren't perceivable | Help users fix errors. |
| 5. Action and form controls | Multi-step forms | C if data loss | Break long tasks into manageable steps. |
| 5. Action and form controls | Submit states | C if double submission is possible on payments | Confirm that an action is in progress and then done. |
| 5. Action and form controls | Confirmation flows | A | Prevent costly mistakes without nagging. |
| 5. Action and form controls | Destructive actions | C if no safeguard on irreversible data | Remove or irreversibly change data safely. |
| 5. Action and form controls | Disabled states | A | Show that an action isn't available. |
| 6. Repeated content structures | Feature grids | A | Communicate what the product does. |
| 6. Repeated content structures | Cards | A | Package one item for scanning and selection. |
| 6. Repeated content structures | List rows | A | Dense scanning of many items. |
| 6. Repeated content structures | Accordions | A | Let users reveal details on demand. |
| 6. Repeated content structures | Tabs | C if inaccessible | Switch between peer views of the same context. |
| 6. Repeated content structures | Carousels | C if auto-moving without pause | Browse a set where only some items fit. |
| 6. Repeated content structures | Galleries | A (C if the lightbox traps or fails keyboard) | Present visual work at quality. |
| 6. Repeated content structures | Content feeds | A | Continuous discovery of new items. |
| 6. Repeated content structures | Timeline layouts | A | Show events in temporal order and their relationships. |
| 6. Repeated content structures | Pricing tables | C if the claim is fabricated | Help buyers choose a plan with confidence. |
| 6. Repeated content structures | Testimonials | C if invented | Borrow credibility from real customers. |
| 6. Repeated content structures | Client logo displays | C if fabricated | Signal adoption by recognisable organisations. |
| 6. Repeated content structures | Metrics and statistics | C if unsourced | Quantify impact credibly. |
| 6. Repeated content structures | Case-study showcases | A | Demonstrate thinking and outcomes. |
| 6. Repeated content structures | Product comparisons | C if false claims | Help choose between options. |
| 6. Repeated content structures | Related content | A | Continue the journey. |
| 7. Complex data interfaces | Tables | A (C if inaccessible) | Compare records across attributes. |
| 7. Complex data interfaces | Data grids | C if broken keyboard | Edit and manipulate tabular data (spreadsheet-like). |
| 7. Complex data interfaces | Charts | C if the data is fake and presented as real | Reveal patterns in data for a specific question. |
| 7. Complex data interfaces | KPIs | A (C if fake) | Surface the few numbers that indicate health, with context. |
| 7. Complex data interfaces | Filters | C if they don't filter | Narrow a set to relevant items. |
| 7. Complex data interfaces | Sort controls | A | Reorder results by a chosen attribute. |
| 7. Complex data interfaces | Search and query builders | A | Express complex queries. |
| 7. Complex data interfaces | Pagination | A | Navigate large result sets. |
| 7. Complex data interfaces | Activity feeds | C if fake | Show what happened, by whom, when. |
| 7. Complex data interfaces | Command menus | A | Fast keyboard access to actions and navigation. |
| 7. Complex data interfaces | Dashboard panels | A (C if fake data presented as real) | Group related metrics or views on one screen. |
| 7. Complex data interfaces | Side-detail inspectors | A | View and edit an item's details without losing list context. |
| 7. Complex data interfaces | Monitoring interfaces | A | Detect anomalies and respond. |
| 7. Complex data interfaces | Multi-step configuration | A | Set up complex objects (integrations, products, plans). |
| 7. Complex data interfaces | Bulk actions | A | Act on many items at once. |
| 7. Complex data interfaces | Saved views | A | Return to a configured perspective quickly. |
| 7. Complex data interfaces | Data export | C if fake | Get data out in useful formats. |
| 7. Complex data interfaces | Notification systems | A | Inform users about events that need attention. |
| 8. Feedback and system states | Loading states | A | Communicate that work is happening and roughly how long it'll take. |
| 8. Feedback and system states | Skeletons | A | Preview layout while content loads to reduce perceived wait and CLS. |
| 8. Feedback and system states | Progress indicators | C if fake | Show completion of a known-length task. |
| 8. Feedback and system states | Empty states | A | Explain why there's nothing and what to do. |
| 8. Feedback and system states | Errors | C if errors are silent | Explain failures and how to recover. |
| 8. Feedback and system states | Success messages | A | Confirm an outcome and point to what's next. |
| 8. Feedback and system states | Warnings | A | Alert users before a problem happens. |
| 8. Feedback and system states | Toast notifications | A | Transient, non-blocking confirmation. |
| 8. Feedback and system states | Dialogs | C if focus escapes | Focused tasks or information that require attention. |
| 8. Feedback and system states | Confirmation modals | A | See the entry |
| 8. Feedback and system states | Tooltips | C if essential info is hover-only | Brief supplementary hints. |
| 8. Feedback and system states | Popovers | A | Small interactive panels anchored to a trigger (menus, pickers). |
| 8. Feedback and system states | Offline states | A (C for data loss) | Keep users informed and productive without a network. |
| 8. Feedback and system states | Retry flows | A | Recover from transient failures. |
| 8. Feedback and system states | Permission failures | A | Explain why access is denied and how to get it. |
| 8. Feedback and system states | Authentication expiry | C if work is lost | Re-authenticate without losing work. |
| 8. Feedback and system states | Unsaved changes | A (C if silent data loss) | Prevent accidental loss of edits. |
| 8. Feedback and system states | Partial failures | C if misreported | Report mixed results honestly. |
| 9. Product-specific experiences | Onboarding | A | Get new users to first value fast. |
| 9. Product-specific experiences | Sign-up and sign-in | C if inaccessible authentication | Create or access an account with minimum friction and maximum trust. |
| 9. Product-specific experiences | First-run guidance | A | Orient users in an empty product. |
| 9. Product-specific experiences | Settings | C if settings do nothing | Let users configure the product confidently. |
| 9. Product-specific experiences | Preferences | A | Personalise the experience (theme, density, motion, language). |
| 9. Product-specific experiences | User profiles | A | Represent a person and let them manage their identity. |
| 9. Product-specific experiences | Permissions | C if the UI misrepresents real permissions | Control who can do what. |
| 9. Product-specific experiences | Billing | C for roach-motel cancellation | Make cost, usage and payment transparent. |
| 9. Product-specific experiences | Checkout | C for broken or deceptive steps | Complete a purchase quickly and safely. |
| 9. Product-specific experiences | Shopping carts | C for fake urgency | Review and adjust before buying. |
| 9. Product-specific experiences | Product configuration | A (C if the preview misrepresents the product) | Let buyers build the right variant and see it. |
| 9. Product-specific experiences | Search and discovery | A | Help users find what they want, or discover what they didn't know. |
| 9. Product-specific experiences | Filters and sorting | C if non-functional | See the entry |
| 9. Product-specific experiences | Saved items | A | Let users bookmark for later. |
| 9. Product-specific experiences | Account management | A | Manage email, password, sessions, data and deletion. |
| 9. Product-specific experiences | AI-assisted interfaces | A (C if outputs are presented as verified fact) | Help users accomplish tasks with AI while keeping them in control. |
| 9. Product-specific experiences | Conversational interfaces | A | Complete tasks through dialogue. |
| 9. Product-specific experiences | Code editors | A | Write and read code comfortably. |
| 9. Product-specific experiences | Visual workflow builders | C if drag is the only path | Compose logic visually (nodes and edges). |
| 10. Experimental and custom interactions | Cursor-following graphics | A | Add presence or reveal content near the pointer. |
| 10. Experimental and custom interactions | Magnetic interaction | A | Make targets feel physical and easier to hit. |
| 10. Experimental and custom interactions | Hover reveals | C if essential info is hover-only | Show secondary content on intent. |
| 10. Experimental and custom interactions | Drag interactions | C if drag-only | Direct manipulation: reorder, scrub, move, compare. |
| 10. Experimental and custom interactions | Infinite canvases | A (C without an accessible equivalent) | Explore large spatial collections. |
| 10. Experimental and custom interactions | Spatial navigation | C if content is unreachable without spatial navigation | Navigate content as places. |
| 10. Experimental and custom interactions | Interactive maps | A (C if scroll is trapped) | Explore location-based information. |
| 10. Experimental and custom interactions | Scroll-driven scenes | A (C if content is unreachable or scroll is trapped) | Explain mechanisms or tell stories in sequence. **Generic:** Pinned sections with unrelated parallax layers; fade-up everything. **Stronger:** Scrub that explains a mechanism (photo → digital twin); text leads; short pins; a static equivalent. **Severity:** A (C if content is unreachable or scroll is trapped). **Evidence:** corpus §6, §7. |
| 10. Experimental and custom interactions | 3D object manipulation | A | Inspect a product or object from all sides. |
| 10. Experimental and custom interactions | WebGL environments | C if no fallback hides essential content | See the entry |
| 10. Experimental and custom interactions | Audio-reactive visuals | C if audio autoplays or flashes | Make sound visible or sound-led experiences expressive. |
| 10. Experimental and custom interactions | Generative patterns | A | Create unique, systematic visuals (per user, per item, per data point). |
| 10. Experimental and custom interactions | Interactive storytelling | A | Let the audience participate in a narrative. |
| 10. Experimental and custom interactions | Custom mobile widgets | A | Touch-native interactions specific to the product. |
| 10. Experimental and custom interactions | Unconventional menus | A | Navigation that expresses the concept. |
| 10. Experimental and custom interactions | Signature navigation systems | A | Navigation that becomes the experience's identity. |
| 11. Mobile-specific components | Touch-first navigation | A | Reach key destinations with a thumb. |
| 11. Mobile-specific components | Mobile cards and lists | A | Scan items on small screens. |
| 11. Mobile-specific components | Swipe interactions | C if swipe is the only path | Fast actions and browsing by gesture. |
| 11. Mobile-specific components | Bottom sheets | A (C if it traps) | Contextual panels on mobile (filters, options, details). |
| 11. Mobile-specific components | Mobile filters | A | Refine results on small screens. |
| 11. Mobile-specific components | Expandable details | A | Hide secondary information until needed on small screens. |
| 11. Mobile-specific components | Sticky mobile actions | C if it obscures focus | Keep the primary action reachable (add to cart, book, apply). |
| 11. Mobile-specific components | Responsive media | A | Images and video that fit and perform on small screens. |
| 11. Mobile-specific components | Gesture alternatives | C | Make gesture-driven features usable by everyone. |
| 11. Mobile-specific components | Touch-friendly data views | A | Read and act on data on phones. |
| 11. Mobile-specific components | Reduced-motion behaviour (mobile) | C | Respect motion preferences on devices where vestibular effects are strongest (motion close to the eyes, while moving). |
| 11. Mobile-specific components | Mobile-specific content hierarchy | A | Put the most important thing first on small screens. |
| 12. Footer and secondary details | Footers | A (C if links are dead) | Close the experience: next step, orientation, trust, legal. |
| 12. Footer and secondary details | Legal navigation | C if placeholder legal content ships | Access privacy, terms, imprint and accessibility statement. |
| 12. Footer and secondary details | Contact information | C if the form is fake | Let people reach the organisation. |
| 12. Footer and secondary details | Social links | C if dead | Connect to active channels. |
| 12. Footer and secondary details | Back-to-top actions | A | Return to the top of long pages. |
| 12. Footer and secondary details | Cookie preferences | C for deceptive patterns | Obtain lawful, informed consent without ruining the first impression. |
| 12. Footer and secondary details | Error pages | A | Recover from 404 and 500 gracefully. |
| 12. Footer and secondary details | Maintenance pages | A | Communicate downtime. |
| 12. Footer and secondary details | Search results | A | Present matches so users can choose quickly. |
| 12. Footer and secondary details | No-results states | A | Recover from searches or filters that return nothing. |
| 12. Footer and secondary details | Confirmation pages | A (C if refresh re-submits a payment) | Confirm completion and set expectations. |
<!-- /generated -->
