# Brand

Every image in this repository is rendered from code by [`render.py`](render.py). No image generator, stock art or third-party imagery is involved.

| File | Size | Use |
|---|---|---|
| `assets/banner.webp` | 2560 × 800 | README header, shown at half size |
| `assets/social-preview.jpg` | 1280 × 640 | GitHub social preview (Settings → General) |
| `.claude-plugin/icon.png` | 1024 × 1024 | plugin listing icon |
| `assets/brand/mark.svg` | vector | the flat mark, for anywhere else |

## The idea

Each element has a reason. Keep the reasons when you change the look.

- **Mark: a form under force.** A disc is cut along its diameter, and the upper half is sheared to the right by 16 % of the diameter. The cut is 4.5 % of the diameter wide. Large renditions use a thinner cut (1.1 %) so it reads as a line, the way a typeface has optical sizes. The shear always moves the upper half to the right.
- **Light: the forge.** Forging is the oldest way of giving form by force, so light follows a blackbody ramp from about 1000 K (deep red) to 6500 K (white). Hotter is always brighter, as with heated metal. Light appears only where something emits it: around the rim and through the cut, where you see the source itself.
- **Type: two voices.** The words are set in Instrument Sans (weight 520, tracking −2.2 %). The ampersand is Instrument Serif Italic at 114 %, because the name joins making and engineering. On title cards the type shears with the disc: the wordmark centres on the upper half, and the line under it on the lower half.
- **Grain: dither, not texture.** Dark 8-bit gradients band into visible steps. Monochrome noise of about 1.6 levels, scaled down in the shadows, breaks them up.

## Colour

| Token | Value | Role |
|---|---|---|
| Ground | `#090807` | the room around the disc |
| Void | `#030202` | the disc, darker than the room |
| Ink | `#f6f1ea` | wordmark and flat mark |
| Muted | `#a69d93` | secondary type |
| Forge | blackbody 1000–6500 K | emitted light only, never fills or text |

Don't add the four-point sparkle, purple glows, glass panels or decorative gradients. They carry no meaning here, and the skill's own anti-slop policy flags them.

## Re-render

Python 3.11 or newer, plus three packages. Keep them in a virtual environment; the repository's own tooling stays standard-library only.

```bash
python3 -m venv .venv
.venv/bin/pip install numpy pillow uharfbuzz
.venv/bin/python assets/brand/render.py            # rewrites every file above
.venv/bin/python assets/brand/render.py banner     # or just one: icon, banner, social, mark
```

On Windows, use `py -m venv .venv` and `.venv\Scripts\python`.

The script downloads the two fonts from [google/fonts](https://github.com/google/fonts) at a pinned commit and checks their SHA-256 before using them. With the same package versions, output is byte-for-byte identical between runs.

## Licensing

The artwork and `render.py` are MIT-licensed with the rest of the repository. Instrument Sans and Instrument Serif are © The Instrument Sans and Instrument Serif Project Authors and licensed under the [SIL Open Font License 1.1](https://openfontlicense.org), which permits using the fonts to make images. The fonts themselves are not redistributed here.
