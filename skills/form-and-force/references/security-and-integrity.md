# Security and integrity

Creative frontend work touches secrets, third-party code, user input and public claims. Integrity (honest content and honest reporting) is part of quality.

## Contents
1. Secrets and configuration
2. Client-side code is public
3. Untrusted content and HTML sinks
4. Forms, input and data handling
5. Third-party scripts and embeds
6. Links, navigation and redirects
7. Dependencies
8. Content integrity (no fabrication)
9. Interaction integrity (no dark patterns)
10. Reporting integrity

---

## 1. Secrets and configuration
- Never print, copy, commit or paste the contents of `.env*`, key files or credentials. `inspect_repo.mjs` lists such files by name only.
- Add new required configuration to `.env.example` with placeholder values and a comment.
- If a task needs a secret value, ask the user to set it. Don't request it in chat unless they choose to share it.

## 2. Client-side code is public
- Anything bundled for the browser is readable by anyone. Never put secrets in `NEXT_PUBLIC_*`, `VITE_*`, `PUBLIC_*` or inline scripts.
- Call privileged APIs from the server (route handlers, server actions, edge functions), with the key kept server-side.
- `slop_scan.mjs` flags likely client-side secrets (it never prints the matched value).

## 3. Untrusted content and HTML sinks
- `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, `insertAdjacentHTML` and `document.write` need trusted or sanitised input (for example DOMPurify), configured for the expected tags.
- Markdown or CMS rich text is rendered with a sanitising renderer. Don't trust CMS editors with script injection.
- Never build URLs, CSS or HTML strings from user input without encoding. Validate `href` protocols (allow `http`, `https`, `mailto`, `tel`).
- JSON-LD and inline data: serialise with escaping of `<` to prevent breaking out of `<script>`.

## 4. Forms, input and data handling
- Validate on the server; client validation is for usability only.
- Collect the minimum personal data needed. Make consent explicit and non-pre-checked.
- Rate-limit or protect public forms (honeypot, server-side checks). CAPTCHAs must have accessible alternatives (WCAG 3.3.8).
- Don't log personal data to the console or analytics.

## 5. Third-party scripts and embeds
- Each script is a supply-chain and privacy risk and a performance cost. Add only with a purpose, load `async`/`defer`, and prefer facades for embeds.
- Use Subresource Integrity for static CDN scripts where versions are pinned. Use a Content-Security-Policy where the hosting allows; avoid `unsafe-inline` by using nonces or hashes.
- Sandbox iframes (`sandbox`, `allow` lists) where the embed permits.

## 6. Links, navigation and redirects
- `target="_blank"` implies `noopener` in all modern engines. Adding `rel="noopener noreferrer"` is harmless. Use `noreferrer` when referrer privacy matters.
- Validate redirect targets against an allow-list (no open redirects via `?next=` parameters).
- External links can be identified (icon or text) when leaving the site is significant.

## 7. Dependencies
- Install from the official registry with the project's package manager; keep the lockfile.
- Prefer well-maintained packages; check their weekly use, maintenance activity and licence.
- Don't add packages that duplicate existing capability. Run the project's audit tooling if present (`npm audit` and similar), and report findings without auto-upgrading majors.

## 8. Content integrity (no fabrication)
Category C failures, never acceptable in deliverables:
- Invented testimonials, reviews, quotes or ratings.
- Fabricated client or partner logos, press mentions or awards.
- Unsupported statistics ("10,000+ teams", "3× faster") without a source the client provided.
- Generated or stock faces presented as real customers or team members.
- Mock product screenshots presented as the real product.
- Fake scarcity or urgency ("Only 2 left!", countdowns that reset).

Do instead: designed, labelled slots for missing proof; illustrative sample data labelled as sample; a request to the user for real assets in the report.

## 9. Interaction integrity (no dark patterns)
- No pre-checked consent or upsells; no confirm-shaming copy; no disguised ads; no hidden costs revealed at the last step; no roach-motel cancellation flows.
- The consent UI offers "reject" as easily as "accept" (and must meet local law; flag this for the client).
- Visual hierarchy may emphasise the recommended action but must not hide or disguise alternatives.

## 10. Reporting integrity
- Report only checks that ran, with their real output.
- Separate what was verified, what was inferred and what was not tested.
- Disclose demo or mocked behaviour and any placeholder content left in place.
- Don't describe untested features as complete.
