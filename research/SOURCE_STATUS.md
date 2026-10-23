# Source status

This register records the sources that could not be fully verified, what was actually inspected, and when. It exists so that nobody reads an inference as an observation, or a dead link as a live reference.

Re-check external links with the on-demand audit (it is not part of CI, because third-party sites fail for reasons unrelated to this repository):

```bash
python3 scripts/check_external_links.py --report link-audit.md
```

## Status labels

| Label | Meaning |
|---|---|
| **Verified live and inspected** | The page loaded and its content was read or rendered by us on the stated date. |
| **Partially accessible** | Some official material loaded (for example a case study or gallery page), but the work itself did not. |
| **Historical or archived** | The work no longer runs at its original address. Evidence comes from archived copies or published stills. |
| **Inaccessible** | Nothing usable could be retrieved: no DNS, blocked, or no archive. |
| **Unverified** | Not yet checked. |
| **Inferred from secondary evidence** | Described only by other parties (press, credits, search summaries). No first-hand inspection. |

Observations from stills describe what a screenshot shows. They do not establish how anything behaves: no loading, scrolling, hover, drag, keyboard, audio or reduced-motion behaviour was observed for the three seed references below.

## Seed references

### Adobe Taking Shape (Dogstudio / DEPT for Adobe Substance 3D, 2022)

**Status: Historical or archived.** Not a current live reference. Do not recommend it as one.

| Evidence | Checked | Result |
|---|---|---|
| `takingshape.adobe.com` | 2026-10-22 and 2026-10-23 | No DNS record; the host does not resolve. |
| Wayback Machine snapshots of the original URL | 2026-10-23 | Snapshots from 2022-10 to 2026-02-01 exist, but the archived HTML is only the JavaScript app shell: a title ("Taking Shape \| Presented by Adobe Substance 3D") and a meta description. No content renders from the archive. |
| [Dogstudio case study](https://dogstudio.co/cases/adobe-taking-shape/) | 2026-10-23 | **Verified live and inspected.** Text read, and four published stills viewed. |
| [Awwwards SOTD page](https://www.awwwards.com/sites/adobe-taking-shape) | 2026-10-23 | **Verified live.** SOTD 2023-01-14; developer sub-scores match the ledger (Animations 9.00, Accessibility 6.80). |

What the case study states (the studio's own account, not independently verified): a virtual 3D gallery in which a hallway leads to three rooms, Photorealism, Surreality and X-topia, also reachable from a map. Each room holds one episode of Adobe's web series. Three hidden "MAT" figures unlock a reward. The studio reports 13K visitors in the first month and notes that the bonus feature left limited time for mobile testing. Those figures are the studio's claims.

What the four stills show:
- A circular "Pick a room" hub: a rotunda with an oculus and a floating cluster of 3D objects, with the three room names set around it.
- Mobile frames: an arched-colonnade intro titled "Taking Shape", an artwork view with the artist's name and previous/next arrow buttons, and a "Surreality" title over an artwork with a play button. The logo sits top left and a menu button top right throughout.
- A "Collection" overlay that fans artwork cards over a pink dune landscape.
- An easter-egg dialog, "You found Robot MAT!", with a "1 out of 3" counter, a "Keep exploring" button, a close button and a "Collected MATs 0/3" pill.

### The World of Vogue Talents 21 (MONOGRID for Vogue Italia, 2021)

**Status: Historical or archived.** Not a current live reference.

| Evidence | Checked | Result |
|---|---|---|
| `vogue-talents-sept2021.monogrid.io` | 2026-10-22 and 2026-10-23 | No DNS record. |
| Wayback Machine snapshots | 2026-10-23 | Two snapshots from 2022. The archived HTML renders only a "browser not supported / enable JavaScript" message. |
| MONOGRID's site ([homepage](https://monogrid.com/), works index) | 2026-10-23 | No Vogue Talents project page found. The works index is rendered by JavaScript, so its absence is not conclusive. |
| [Awwwards Honorable Mention page](https://www.awwwards.com/sites/the-world-of-vogue-talents-21) | 2026-10-23 | **Partially accessible.** HM 2021-11-02. Description: "For Vogue Italia, we've created a digital platform where the user can discover photogrammetry dresses and immersive contents." Tags include WebGL, 3D and GraphQL. Three studio-uploaded stills (cover, desktop, mobile) viewed. |

What the three stills show:
- A pastel desert landscape at dusk. Arch-shaped portals stand on raised plateaus, labelled in the 3D scene with the section names (Spotlight on Talents, Capsule Collection, Tailored Creativity, Awareness, Head Hunters). The cover shows planted paths connecting them.
- An onboarding card, "1/2 · Clicca e trascina per muoverti all'interno dell'esperienza" ("click and drag to move inside the experience").
- A persistent text navigation that repeats the same sections (about, Spotlight on Talents, Tailored Creativity, Awareness, Iniziative Speciali, Head Hunters, Capsule Collection), with an it/en switch. On mobile it collapses to About / Menu / Lang, with arrow controls at the sides.

### Deep Beauty (AQuest for KIKO Milano, 2025)

**Status: Inferred from secondary evidence.** Not analysed and not a reference for design claims.

| Evidence | Checked | Result |
|---|---|---|
| AQuest case page `aquest.it/works/kiko-deep-beauty` | 2026-10-22 and 2026-10-23 | HTTP 403 to automated clients on both dates; no Wayback snapshot. **Needs a manual check in a normal browser.** |
| MUDEC exhibition page (`mudec.it/en/?p=24123`) | 2026-10-22 (read), 2026-10-23 (HTTP 403 to curl) | Exhibition at MUDEC, Milan, 5 April to 25 May 2025. |
| [Ogilvy work page](https://www.ogilvy.com/it/work/deep-beauty) | 2026-10-23 | **Verified live.** Confirms the exhibition was conceived by Ogilvy Italia for KIKO Milano, and states that a partnership with AQuest let people visit it online through an immersive digital experience. No link to that experience. |
| Live experience URL | 2026-10-23 | Not found. |

Search-engine summaries of the AQuest page mention free navigation through the rooms and 60+ artworks by infinite scroll, a brush-like cursor, scroll animations and sound. Those come from summaries, not from the page or the experience, and stay unverified.

## Corpus captures (21 sites)

Each of the 21 sites in [REFERENCE_CORPUS.md](REFERENCE_CORPUS.md) was rendered once on 2026-10-22 with `skills/form-and-force/scripts/audit_page.mjs`: load, wheel or scroll, Tab, and a reduced-motion pass. **Hover, drag, gesture, audio, multi-page navigation and form submission were not exercised.** Statements about those behaviours are marked *(inferred)* in the corpus.

The measured data is published as `research/captures/<site>/report.json`. The contact sheets (`sheet.jpg`) are screenshots of third-party websites, so they are kept on the maintainer's machine and not redistributed (see [README.md](README.md#third-party-material)). The `shots` paths inside each report name files that were not retained.

## External link audit, 2026-10-23

A single run of `scripts/check_external_links.py` over the published Markdown found 53 unique external URLs: 49 responded at their address, 3 redirected and 1 refused the automated client.

| URL | Result | Action taken |
|---|---|---|
| `www.anthropic.com/engineering/equipping-agents-…` | Redirected to `/research/…` | Ledger link updated to the new address. |
| `www.floema.com/en` | Redirected to `floema.com/en` | Kept: it is the address that was captured. |
| `www.houseofdreamers.fr` | Redirected to `houseofdreamers.com` | Kept as the captured address, with a note in the corpus. |
| `www.mudec.it/en/?p=24123` | HTTP 403 (automated client refused) | Kept: read on 2026-10-22; needs a browser check. |

This is a snapshot. Re-run the audit rather than relying on it.

## Open items

| Item | Status | Next step |
|---|---|---|
| Deep Beauty experience | Inferred from secondary evidence | Open the AQuest page in a browser; record the experience URL if one exists, or an archive. |
| MONOGRID case page for Vogue Talents | Unverified | Search MONOGRID's works index in a browser. |
| External links in the research documents | Re-run on demand | `python3 scripts/check_external_links.py` |
