# Repository workflow

When the skill runs on an existing project, the first behaviour is investigation. Adapt these steps to the repository and the tools available.

## Contents
1. Inspect
2. Read the design-defining files
3. Protect existing work
4. Preserve architecture; choose tools by context
5. Dependency policy
6. Making changes
7. Running checks
8. Greenfield projects
9. Reporting

---

## 1. Inspect

```bash
git status --short && git log --oneline -5          # what's in flight; never discard it
node "${CLAUDE_SKILL_DIR}/scripts/inspect_repo.mjs" .  # stack, styling, motion, tokens, routes, scripts, assets
node "${CLAUDE_SKILL_DIR}/scripts/slop_scan.mjs" .     # baseline triggers (record the counts)
```
Cover at minimum:
1. Working directory and repository status.
2. Project structure.
3. Framework, runtime, package manager, dependencies.
4. Routes and pages.
5. Tokens and stylesheet architecture.
6. Component organisation.
7. Content and assets.
8. Existing animation code.
9. Build, lint, typecheck and test scripts.
10. Existing accessibility and performance practices.
11. Configuration and deployment constraints.
12. Uncommitted changes and files that must not be overwritten.

Also read any `CLAUDE.md`, `AGENTS.md`, `DESIGN.md`, `CONTRIBUTING.md` or README conventions, and follow them.

**Never print or expose secrets.** Don't `cat` `.env*`, key files or credential files. `inspect_repo.mjs` lists them by name only. If configuration values are needed, read `.env.example` or ask.

## 2. Read the design-defining files

Before proposing changes, read:
- Global styles and token sources (CSS variables, Tailwind theme, theme files).
- The root layout(s) and the main navigation.
- Two or three representative components, including the most complex one.
- Existing motion code (search for `gsap`, `motion`, `animate`, `@keyframes`, `transition`, `IntersectionObserver`, `requestAnimationFrame`).
- If the app can run, the current rendered pages: run `audit_page.mjs` on the dev server to get a baseline contact sheet.

## 3. Protect existing work

- Preserve uncommitted changes. Don't overwrite, reformat or revert files with pending edits unless asked.
- No destructive commands (`git reset --hard`, `git clean`, `rm -rf` on project files, force pushes).
- Avoid lockfile churn: use the project's package manager and don't switch it.
- No unreviewed dependency upgrades. If an upgrade is needed, say why and do it as a separate, explained step.
- Make changes in coherent, reviewable steps rather than wholesale rewrites.
- Commit or push only when the user asks.

## 4. Preserve architecture; choose tools by context

- Respect the stack (React, Next.js, Vue, Svelte, Astro, plain HTML). Don't migrate frameworks or routers without a documented reason and the user's agreement.
- Use the project's styling approach. In a Tailwind project, extend the theme. In a CSS Modules project, add modules. Don't introduce a second styling system.
- Use existing components and primitives before creating new ones. Extend variants rather than duplicating.
- Options are not mandates. TypeScript, React, the existing router, modern CSS, Tailwind (when present or clearly suitable), GSAP, Lenis, three.js, SVG, canvas, WAAPI and native transitions are each chosen by need.
  - A small editorial site may need only CSS transitions.
  - A spatial experience may genuinely need WebGL. Don't reject it just for its complexity; plan fallbacks and budgets.

## 5. Dependency policy

Before adding a dependency, write down:
1. The requirement it serves.
2. Native or existing alternatives and why they fall short.
3. Size or performance cost (bundle impact, runtime cost).
4. Compatibility (framework version, SSR, licence).
5. Ownership: which components use it, and the lifecycle and cleanup rules.

Never reinstall packages that are already present. Install locally (dev or prod dependency as appropriate), never globally. Pin to the version range style the project already uses.

## 6. Making changes

1. Tokens and global foundations first (they change everything downstream).
2. Then shared primitives and components.
3. Then pages and sections, one coherent slice at a time.
4. Then motion layered on the finished static composition.
5. After each slice, build or typecheck and fix before moving on.

Keep diffs focused. Don't reformat untouched code. Match surrounding code style, naming, comment density and idioms.

## 7. Running checks

Run what exists, then the bundled checks:

| Check | Command (adapt to package manager) | Pass condition |
|---|---|---|
| Typecheck | `npm run typecheck` / `npx tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 errors (warnings reviewed) |
| Tests | `npm test` / `npm run test:e2e` | all pass, or failures explained as pre-existing |
| Build | `npm run build` | succeeds |
| Static triggers | `node …/slop_scan.mjs . --strict` | 0 C findings; A/B triggers resolved or justified |
| Rendered audit | `node …/audit_page.mjs <dev-url> [routes…]` | no console errors from your code; no overflow; focus visible; reduced-motion path sane; view `sheet.jpg` |

If the dev server is needed, start it in the background, wait until it's ready, run the audit, then stop it. If a check can't run (missing env, external service), say so explicitly.

Pre-existing failures are not yours to hide or silently fix. Report them separately from failures your changes introduced.

## 8. Greenfield projects

With no existing project:
- Choose the lightest stack that fits the mode (project-modes.md). A static marketing page may be plain HTML/CSS/JS or Astro. An app with routing and state may be React with Vite or Next.js. Say why.
- Set up typecheck, lint, a build, and Playwright (for `audit_page.mjs` and future tests) from the start.
- Create tokens before components. Create an `.env.example`, not secrets.

## 9. Reporting

Use assets/report-template.md. Include:
- The concept in one sentence, and the hypothesis.
- Meaningful files changed (grouped by purpose), not a raw diff dump.
- Commands run with their **actual** outcomes (pass, fail, not run, and why).
- Evidence: audit summary lines, contact sheet path, scan counts before and after.
- What was not verified (for example screen readers, real devices, field performance).
- Known limitations and remaining blockers.
- Decisions that need the user (real proof assets, legal copy, brand approvals).

Never claim a command passed unless it ran and passed.
