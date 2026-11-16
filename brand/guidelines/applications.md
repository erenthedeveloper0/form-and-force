# Applications

Which file to use where. Paths are relative to the repository root.

## GitHub

| Where | File | Notes |
|---|---|---|
| README header | `brand/applications/github/form-and-force-banner-dark.webp` and `-banner-light.webp` | 2560 × 800, shown at half size. Use a `<picture>` element so it follows the reader's colour scheme (snippet below) |
| Social preview | `brand/applications/github/form-and-force-social-preview.jpg` | 1280 × 640. Upload it under **Settings → General → Social preview**; GitHub has no API for it |
| Organisation or profile avatar, if one is ever needed | `brand/identity/icon/form-and-force-tile-night.png` | 1024 px |

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/applications/github/form-and-force-banner-dark.webp">
  <img alt="Form & Force: Decide. Build. Judge." src="brand/applications/github/form-and-force-banner-light.webp" width="100%">
</picture>
```

## The Claude Code plugin

| Where | File | Notes |
|---|---|---|
| Plugin listing icon | `.claude-plugin/icon.png` | 1024 px, opaque, full bleed. A listing applies its own mask. Change it before a first directory submission, not after (see [releasing](../../docs/development/releasing.md)) |

## Documentation

The documentation site ([`site/`](../../site/)) copies what it needs from `brand/` when it is built. Nothing is duplicated in the repository.

| Where | File |
|---|---|
| Header logo | `brand/identity/lockup/form-and-force-compact-currentcolor.svg`, inlined so it follows the theme |
| Favicon | `brand/identity/icon/favicon.svg`, with `favicon.ico` as the fallback |
| iOS home screen | `brand/identity/icon/apple-touch-icon.png` |
| Home page background | `brand/graphics/form-and-force-fold-dark.webp` and `-fold-light.webp` |
| Open Graph and Twitter card | `brand/applications/github/form-and-force-social-preview.jpg` |
| Fonts | `brand/fonts/*.woff2` |
| Colours | `brand/source/tokens.json` (`theme.dark`, `theme.light`) |

## Slides, documents and anything else

- On dark: the horizontal lockup `on-dark` on void or night, with a fold background from `brand/graphics/`.
- On light: the horizontal lockup `on-light` on frost or white; the silver background for title slides.
- In one colour (print, embroidery, a stamp): the `paper` or `ink` lockups and marks.
- In a tool that does not take SVG: the PNG lockups in `brand/identity/lockup/` and the tiles in `brand/identity/icon/`.

## Never

- Use Form & Force's colours, folds or typefaces in a design the skill produces for a user. The skill has no house style, and its brand is not one.
- Stretch a banner to another aspect ratio. Render a new size from `build.mjs` instead.
- Put screenshots or third-party images into brand compositions.
