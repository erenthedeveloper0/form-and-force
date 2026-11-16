#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Prepare the brand's type: web fonts for the documentation and outlines for the wordmark.

A maintainer step, run only when the typefaces or the wordmark change. It
downloads Plus Jakarta Sans and JetBrains Mono from google/fonts at a pinned
commit, checks every file against its SHA-256, and writes:

  brand/fonts/PlusJakartaSans.woff2      variable (200-800), Latin subset
  brand/fonts/JetBrainsMono.woff2        variable (100-800), Latin subset
  brand/fonts/*-OFL.txt                  the SIL Open Font License for each family
  brand/source/wordmark.json             "Form and Force" outlined in Plus Jakarta Sans, one line
                                         and two, at a display weight (300) and a small-size
                                         weight (420), shaped with the font's own kerning

The outlines are committed, so rebuilding the logos (brand/build.mjs) needs no
font tooling. This script needs fontTools, brotli and uharfbuzz; keep them in a
virtual environment, as the repository's own tooling is standard-library only:

    python3 -m venv .venv
    .venv/bin/pip install fonttools brotli uharfbuzz
    .venv/bin/python brand/source/type.py
"""
import argparse
import hashlib
import io
import json
import os
import sys
import tempfile
import urllib.request

try:
    import uharfbuzz as hb
    from fontTools import subset
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
except ImportError as e:  # pragma: no cover - depends on the maintainer's environment
    sys.exit(f"{e.name} is missing: pip install fonttools brotli uharfbuzz (see the docstring)")

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
COMMIT = "0b58fb370093f9a9f4ff785d94405710b79de67c"
SOURCES = {
    "PlusJakartaSans": ("ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf",
                        "89b3fb38aa0d275d7a731d0d817a4f1622b316b4d7fbdedcf02ee9099ff68bc8"),
    "JetBrainsMono": ("ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf",
                      "48715a42ec242c21e9f02692891e147d022299a52e48d5e413e1a942193ffeda"),
}
LICENSES = {
    "PlusJakartaSans": "ofl/plusjakartasans/OFL.txt",
    "JetBrainsMono": "ofl/jetbrainsmono/OFL.txt",
}
# Google Fonts' "latin" range, plus arrows used in the documentation.
LATIN = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,"
         "U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+2713,U+2717,U+FEFF,U+FFFD")

# The wordmark has two optical sizes, the way a typeface does: Light for display,
# a heavier cut for small sizes, where Light thins out on screen.
WORDMARK = {"weights": {"display": 300, "small": 420}, "tracking": 10, "leading": 1.08,
            "lines": {"one": ["Form and Force"], "two": ["Form and", "Force"]}}


def fetch(rel, cache):
    path = os.path.join(cache, COMMIT[:12] + "-" + rel.replace("/", "_").replace("%5B", "[").replace("%5D", "]"))
    if not os.path.isfile(path):
        url = f"https://raw.githubusercontent.com/google/fonts/{COMMIT}/{rel}"
        with urllib.request.urlopen(url, timeout=60) as response:
            data = response.read()
        with open(path, "wb") as fh:
            fh.write(data)
    with open(path, "rb") as fh:
        return fh.read()


def checked(rel, digest, cache):
    data = fetch(rel, cache)
    actual = hashlib.sha256(data).hexdigest()
    if actual != digest:
        sys.exit(f"{rel}: SHA-256 {actual} does not match the pinned font; delete the cache and retry")
    return data


def woff2(data):
    font = TTFont(io.BytesIO(data))
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    sub = subset.Subsetter(options)
    sub.populate(unicodes=subset.parse_unicodes(LATIN))
    sub.subset(font)
    out = io.BytesIO()
    font.flavor = "woff2"
    font.save(out)
    return out.getvalue()


def outline_line(text, hb_font, glyph_set, upem, tracking, y):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb_font, buf, {"kern": True, "liga": False})
    x, parts = 0, []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = hb_font.glyph_to_string(info.codepoint)
        pen = SVGPathPen(glyph_set, lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
        # Font units are y-up; SVG is y-down, with the baseline at y.
        glyph_set[name].draw(TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, y - pos.y_offset)))
        if pen.getCommands():
            parts.append(pen.getCommands())
        x += pos.x_advance + tracking
    return " ".join(parts), x - tracking


def wordmark(data):
    out = {
        "source": f"Plus Jakarta Sans (SIL OFL 1.1), google/fonts@{COMMIT[:12]}",
        "generator": "brand/source/type.py",
        "tracking": WORDMARK["tracking"],
        "leading": WORDMARK["leading"],
        "weights": WORDMARK["weights"],
        "variants": {},
    }
    for size, weight in WORDMARK["weights"].items():
        font = instancer.instantiateVariableFont(TTFont(io.BytesIO(data)), {"wght": weight})
        raw = io.BytesIO()
        font.save(raw)
        hb_font = hb.Font(hb.Face(raw.getvalue()))
        glyph_set = font.getGlyphSet()
        upem = font["head"].unitsPerEm
        out.update(unitsPerEm=upem, capHeight=font["OS/2"].sCapHeight, xHeight=font["OS/2"].sxHeight)
        for key, lines in WORDMARK["lines"].items():
            paths, widths = [], []
            baselines = [round(i * upem * WORDMARK["leading"]) for i in range(len(lines))]
            for text, baseline in zip(lines, baselines):
                d, width = outline_line(text, hb_font, glyph_set, upem, WORDMARK["tracking"], baseline)
                paths.append(d)
                widths.append(width)
            out["variants"][f"{key}-{size}"] = {"weight": weight, "lines": lines, "d": " ".join(paths),
                                                "width": max(widths), "baselines": baselines}
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--cache", default=os.path.join(tempfile.gettempdir(), "ff-brand-fonts"))
    args = ap.parse_args(argv)
    os.makedirs(args.cache, exist_ok=True)
    fonts_dir = os.path.join(BRAND, "fonts")
    os.makedirs(fonts_dir, exist_ok=True)
    sources = {}
    for family, (rel, digest) in SOURCES.items():
        sources[family] = checked(rel, digest, args.cache)
        with open(os.path.join(fonts_dir, f"{family}.woff2"), "wb") as fh:
            fh.write(woff2(sources[family]))
        with open(os.path.join(fonts_dir, f"{family}-OFL.txt"), "wb") as fh:
            text = fetch(LICENSES[family], args.cache).decode("utf-8").replace("\r\n", "\n")
            # Whitespace only: trailing spaces are stripped so the file passes the repository's hygiene check.
            fh.write(("\n".join(line.rstrip() for line in text.rstrip("\n").split("\n")) + "\n").encode("utf-8"))
        print(f"brand/fonts/{family}.woff2")
    with open(os.path.join(HERE, "wordmark.json"), "w", encoding="utf-8") as fh:
        json.dump(wordmark(sources["PlusJakartaSans"]), fh, indent=2)
        fh.write("\n")
    print("brand/source/wordmark.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
