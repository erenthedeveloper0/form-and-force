#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Render the Form & Force brand images from code.

The mark is a disc cut along its diameter, with the upper half sheared to the
right: a form under force. Light follows a blackbody ramp, the colour of metal
at the forge, and appears only where something emits it. The grain is dither,
sized to stop dark 8-bit gradients from banding.

Needs numpy, Pillow and uharfbuzz (see assets/brand/README.md). The
fonts are downloaded from google/fonts at a pinned commit and checked by SHA-256.

    python3 assets/brand/render.py              # rewrite every image in place
    python3 assets/brand/render.py --out DIR    # write the images to DIR
"""
import argparse
import hashlib
import os
import sys
import tempfile
import urllib.request

import numpy as np
import uharfbuzz as hb
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT_COMMIT = "0b58fb370093f9a9f4ff785d94405710b79de67c"
FONTS = {
    "sans": ("ofl/instrumentsans/InstrumentSans%5Bwdth,wght%5D.ttf",
             "b24f1812584816958afcf22e22d08e44318c5e51651e25d2438efdde389b33b1"),
    "serif-italic": ("ofl/instrumentserif/InstrumentSerif-Italic.ttf",
                     "08939b8bdf534afec24ae0ef5e03f948940cd9a8fe08e7fecbad040e62327385"),
}

GROUND = "#090807"   # warm black: the room the forge stands in
VOID = "#030202"     # the disc itself, darker than the room
INK = "#f6f1ea"      # type and the flat mark
MUTED = "#a69d93"    # secondary type
SHEAR = 0.16         # horizontal offset between the halves, as a fraction of the diameter
GAP = 0.045          # cut width, as a fraction of the diameter


# Fonts

def fetch_fonts(cache):
    paths = {}
    for key, (rel, digest) in FONTS.items():
        path = os.path.join(cache, f"{FONT_COMMIT[:12]}-{os.path.basename(rel).replace('%5B', '[').replace('%5D', ']')}")
        if not os.path.isfile(path):
            url = f"https://raw.githubusercontent.com/google/fonts/{FONT_COMMIT}/{rel}"
            with urllib.request.urlopen(url, timeout=60) as response:
                data = response.read()
            with open(path, "wb") as fh:
                fh.write(data)
        with open(path, "rb") as fh:
            actual = hashlib.sha256(fh.read()).hexdigest()
        if actual != digest:
            sys.exit(f"{path}: SHA-256 {actual} does not match the pinned font; delete it and retry")
        paths[key] = path
    return paths


# Colour

def hex_rgb(value):
    value = value.lstrip("#")
    return np.array([int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def to_linear(c):
    c = np.asarray(c, dtype=float)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def blackbody(kelvin):
    """Linear RGB of a blackbody (Tanner Helland's fit, 1000-40000 K), peak channel 1."""
    t = np.asarray(kelvin, dtype=float) / 100
    r = np.where(t <= 66, 255, 329.698727446 * np.maximum(t - 60, 1e-6) ** -0.1332047592)
    g = np.where(t <= 66, 99.4708025861 * np.log(t) - 161.1195681661,
                 288.1221695283 * np.maximum(t - 60, 1e-6) ** -0.0755148492)
    b = np.where(t >= 66, 255, np.where(t <= 19, 0, 138.5177312231 * np.log(np.maximum(t - 10, 1e-6)) - 305.0447927307))
    return to_linear(np.clip(np.stack([r, g, b], axis=-1) / 255, 0, 1))


def forge(emission):
    """Emission to linear RGB: hotter is brighter and whiter, as with heated metal."""
    kelvin = 1000 + 5500 * (1 - np.exp(-emission / 4))
    return 1 - np.exp(-blackbody(kelvin) * emission[..., None])


# Geometry (signed distances in pixels, negative inside)

def half_disc(x, y, cx, cy, r, upper):
    px, py = x - cx, (cy - y) if upper else (y - cy)
    rr = np.hypot(px, py)
    outside = np.where(py < 0, np.hypot(np.maximum(np.abs(px) - r, 0), py), np.maximum(rr - r, 0))
    inside = (rr <= r) & (py >= 0)
    return np.where(inside, -np.minimum(r - rr, py), outside)


def mark(x, y, cx, cy, diameter, gap=GAP):
    r, s, g = diameter / 2, SHEAR * diameter / 2, gap * diameter / 2
    return np.minimum(half_disc(x, y, cx + s, cy - g, r, True), half_disc(x, y, cx - s, cy + g, r, False))


def rounded_rect(x, y, w, h, radius):
    qx = np.abs(x - w / 2) - (w / 2 - radius)
    qy = np.abs(y - h / 2) - (h / 2 - radius)
    return np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - radius


def coverage(d):
    return np.clip(0.5 - d, 0, 1)


def grid(w, h):
    return np.meshgrid(np.arange(w) + 0.5, np.arange(h) + 0.5)


# Light

def eclipse(x, y, cx, cy, diameter, gap=GAP, light=(0.8, -0.6), heat=1.0):
    """A dark sheared disc backlit by forge light. Returns linear RGB."""
    d = mark(x, y, cx, cy, diameter, gap)
    lx, ly = np.array(light) / np.hypot(*light)
    # The source sits behind the disc toward `light`, so the rim and the cut heat up on that side.
    toward = np.clip(((x - cx) * lx + (y - cy) * ly) / diameter + 0.5, 0, 1)
    strength = heat * (0.16 + 1.7 * toward ** 2)
    out = np.maximum(d, 0)
    # Through the cut you see the source itself, so the channel between the halves runs hottest.
    r, s, g = diameter / 2, SHEAR * diameter / 2, max(gap * diameter / 2, 1.5)
    channel = np.exp(-np.maximum(np.abs(x - cx) - (r - s), 0) / (0.035 * diameter))
    seam = channel * np.exp(-((y - cy) / (0.7 * g)) ** 2)
    emission = strength * (3.4 * np.exp(-out / max(0.0045 * diameter, 1.2))
                           + 0.5 * np.exp(-out / (0.04 * diameter))
                           + 0.02 * np.exp(-out / (0.38 * diameter))
                           + 2.6 * seam)
    limb = strength * 0.04 * np.exp(np.minimum(d, 0) / (0.03 * diameter))
    light_rgb = forge(np.where(d > 0, emission, limb))
    inside = coverage(d)[..., None]
    room = to_linear(hex_rgb(GROUND)) * (1 - inside) + to_linear(hex_rgb(VOID)) * inside
    return room + light_rgb


# Type

class Face:
    """A font shaped by HarfBuzz (for kerning) and rasterised by FreeType."""

    def __init__(self, path, **axes):
        self.path, self.axes = path, axes
        self.hb_face = hb.Face(hb.Blob.from_file_path(path))
        self.hb_font = hb.Font(self.hb_face)
        if axes:
            self.hb_font.set_variations(axes)

    def layout(self, text, size, tracking=0.0):
        """Pen position of each character in pixels, and the run's advance width."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb_font, buf, {"liga": False})
        scale = size / self.hb_face.upem
        pen, placed = 0.0, []
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            placed.append((text[info.cluster], pen + pos.x_offset * scale))
            pen += pos.x_advance * scale + tracking * size
        return placed, pen - tracking * size

    def raster(self, size):
        font = ImageFont.truetype(self.path, round(size))
        if self.axes:
            order = [axis["name"] for axis in font.get_variation_axes()]
            names = {b"Width": "wdth", b"Weight": "wght", "Width": "wdth", "Weight": "wght"}
            font.set_variation_by_axes([self.axes[names[n]] for n in order])
        return font


def wordmark(fonts, size):
    """'Form & Force': a grotesk for the words, the serif italic ampersand as the hinge."""
    sans = Face(fonts["sans"], wdth=100, wght=520)
    serif = Face(fonts["serif-italic"])
    parts = [(sans, "Form", size, -0.022), (serif, "&", size * 1.14, 0.0), (sans, "Force", size, -0.022)]
    spaces = [0.19 * size, 0.15 * size, 0]  # the italic leans right, so it needs less room after it
    runs, x = [], 0.0
    for (face, text, run_size, tracking), space in zip(parts, spaces):
        _, width = face.layout(text, run_size, tracking)
        runs.append((face, text, run_size, x, tracking))
        x += width + space
    return runs, x


def typeset(w, h, runs, origin, ss=4):
    """Coverage in [0, 1] for runs of (face, text, size, x, tracking) placed at origin=(x, baseline)."""
    canvas = Image.new("L", (w * ss, h * ss), 0)
    draw = ImageDraw.Draw(canvas)
    ox, baseline = origin
    for face, text, size, x, tracking in runs:
        font = face.raster(size * ss)
        placed, _ = face.layout(text, size, tracking)
        for ch, dx in placed:
            if ch.strip():
                draw.text(((ox + x + dx) * ss, baseline * ss), ch, font=font, fill=255, anchor="ls")
    return np.asarray(canvas.resize((w, h), Image.Resampling.BOX), dtype=float) / 255


# Finishing

def dither(srgb, seed, amount=1.6):
    """Monochrome grain scaled to luminance; it hides banding in dark gradients."""
    rng = np.random.default_rng(seed)
    luma = srgb @ np.array([0.2126, 0.7152, 0.0722])
    noise = rng.standard_normal(luma.shape) * (amount / 255) * (0.45 + 0.55 * np.sqrt(luma))
    return srgb + noise[..., None]


def over(base, color, alpha):
    a = alpha[..., None]
    return base * (1 - a) + hex_rgb(color) * a


def to_image(srgb, alpha=None):
    rgb = np.clip(np.round(srgb * 255), 0, 255).astype(np.uint8)
    if alpha is None:
        return Image.fromarray(rgb, "RGB")
    a = np.clip(np.round(alpha * 255), 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, a]), "RGBA")


# Images

def render_icon(fonts, size=1024):
    x, y = grid(size, size)
    lin = eclipse(x, y, size / 2, size / 2, 0.56 * size)
    return to_image(dither(to_srgb(lin), seed=1))


def title_card(fonts, w, h, diameter, cy, word_size, line_size, radius=0, seed=2):
    """The eclipse at title scale, with the wordmark above the cut and the line below it."""
    x, y = grid(w, h)
    s = SHEAR * diameter / 2
    srgb = dither(to_srgb(eclipse(x, y, w / 2, cy, diameter, gap=0.011)), seed=seed)
    runs, width = wordmark(fonts, word_size)
    # The type is sheared with the disc: the wordmark centres on the upper half, the line on the lower.
    srgb = over(srgb, INK, typeset(w, h, runs, (w / 2 + s - width / 2, cy - 0.4 * word_size)))
    sans = Face(fonts["sans"], wdth=100, wght=450)
    line = "Creative Engineering Intelligence"
    _, line_width = sans.layout(line, line_size, 0.01)
    srgb = over(srgb, MUTED, typeset(w, h, [(sans, line, line_size, 0, 0.01)],
                                     (w / 2 - s - line_width / 2, cy + 0.4 * word_size + 0.72 * line_size)))
    alpha = coverage(rounded_rect(x, y, w, h, radius)) if radius else None
    return to_image(srgb, alpha)


def render_banner(fonts):
    return title_card(fonts, 2560, 800, diameter=1200, cy=440, word_size=136, line_size=41, radius=32)


def render_social(fonts):
    return title_card(fonts, 1280, 640, diameter=800, cy=330, word_size=104, line_size=32, seed=3)


def mark_svg():
    d, s, g = 100, SHEAR * 50, GAP * 50
    w, h = d + 2 * s, d + 2 * g
    f = lambda v: f"{v:g}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" role="img" aria-label="Form &amp; Force">\n'
            f'  <title>Form &amp; Force</title>\n'
            f'  <style>path{{fill:{GROUND}}}@media (prefers-color-scheme:dark){{path{{fill:{INK}}}}}</style>\n'
            f'  <path d="M{f(2 * s)} {f(50)}A50 50 0 0 1 {f(w)} {f(50)}Z"/>\n'
            f'  <path d="M{f(d)} {f(50 + 2 * g)}A50 50 0 0 1 0 {f(50 + 2 * g)}Z"/>\n'
            f'</svg>\n')


# WebP keeps the grain at a twentieth of the PNG size; GitHub's social preview only takes PNG, JPEG or GIF.
ENCODING = {
    ".png": {"optimize": True},
    ".webp": {"quality": 95, "method": 6, "alpha_quality": 100},
    ".jpg": {"quality": 92, "subsampling": 0, "optimize": True},
}
TARGETS = {
    "icon": (".claude-plugin/icon.png", render_icon),
    "banner": ("assets/banner.webp", render_banner),
    "social": ("assets/social-preview.jpg", render_social),
}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--out", help="output directory (default: the repository's own paths)")
    parser.add_argument("--fonts", default=os.path.join(tempfile.gettempdir(), "form-and-force-fonts"),
                        help="font cache directory")
    parser.add_argument("only", nargs="*", choices=[*TARGETS, "mark"], help="render only these")
    args = parser.parse_args(argv)
    os.makedirs(args.fonts, exist_ok=True)
    fonts = fetch_fonts(args.fonts)
    place = lambda rel: os.path.join(args.out, os.path.basename(rel)) if args.out else os.path.join(ROOT, rel)
    for name, (rel, render) in TARGETS.items():
        if args.only and name not in args.only:
            continue
        path = place(rel)
        image = render(fonts)
        image.save(path, **ENCODING[os.path.splitext(path)[1]])
        print(f"{name}: {path} {image.size[0]}x{image.size[1]} {os.path.getsize(path) // 1024} KiB")
    if not args.only or "mark" in args.only:
        path = place("assets/brand/mark.svg")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(mark_svg())
        print(f"mark: {path}")


if __name__ == "__main__":
    main()
