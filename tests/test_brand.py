# SPDX-License-Identifier: MIT
"""The brand's sources of truth stay consistent with what is published.

Free and offline: no browser. The rendered files are checked against the
hashes brand/build.mjs recorded, the vector files are regenerated in memory
and compared, and the interface colours are checked for contrast.
"""
import hashlib
import json
import os
import re
import tempfile
import unittest
from pathlib import Path

from support import NODE, ROOT, copy_repo, errors, require, run

BRAND = Path(ROOT, "brand")
TOKENS = json.loads((BRAND / "source" / "tokens.json").read_text(encoding="utf-8"))
THEMES = {k: v for k, v in TOKENS["theme"].items() if not k.startswith("$")}
MANIFEST = json.loads((BRAND / "manifest.json").read_text(encoding="utf-8"))


def luminance(hex_colour):
    c = [int(hex_colour.lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


class Tokens(unittest.TestCase):
    def test_every_interface_text_pair_meets_aa(self):
        for name, theme in THEMES.items():
            for fg in ("text", "muted", "faint", "accent"):
                for bg in ("canvas", "surface", "sunken"):
                    ratio = contrast(theme[fg], theme[bg])
                    self.assertGreaterEqual(ratio, 4.5, f"{name}: {fg} on {bg} is {ratio:.2f}:1")
            self.assertGreaterEqual(contrast(theme["text"], theme["canvas"]), 7, f"{name}: body text below AAA")

    def test_palette_entries_are_complete(self):
        for name, entry in TOKENS["palette"].items():
            self.assertRegex(entry["value"], r"^#[0-9a-f]{6}$", name)
            self.assertTrue(entry["role"].strip(), f"{name} has no role")
            self.assertIn(entry["group"], {"ground", "light", "chroma", "silver", "type"}, name)

    def test_the_documentation_states_the_same_values(self):
        doc = (BRAND / "guidelines" / "colour.md").read_text(encoding="utf-8")
        for name, entry in TOKENS["palette"].items():
            self.assertIn(f"`{entry['value']}`", doc, f"colour.md does not list {name} {entry['value']}")
        for name, theme in THEMES.items():
            for token, value in theme.items():
                self.assertIn(f"`{value}`", doc, f"colour.md does not list {name}.{token} {value}")

    def test_typefaces_are_present_with_their_licences(self):
        for spec in TOKENS["type"].values():
            font = Path(ROOT, spec["file"])
            self.assertTrue(font.is_file(), spec["file"])
            self.assertEqual(font.read_bytes()[:4], b"wOF2", f"{spec['file']} is not WOFF2")
            licence = font.with_name(font.stem + "-OFL.txt")
            self.assertIn("SIL Open Font License", licence.read_text(encoding="utf-8"))


class Manifest(unittest.TestCase):
    def test_every_recorded_file_matches_its_hash(self):
        for rel, entry in MANIFEST["files"].items():
            path = Path(ROOT, rel)
            self.assertTrue(path.is_file(), f"manifest lists {rel}, which does not exist")
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), entry["sha256"], f"{rel} was changed by hand")

    def test_every_brand_image_is_recorded(self):
        images = {p.relative_to(ROOT).as_posix() for p in BRAND.rglob("*")
                  if p.suffix in {".png", ".jpg", ".webp", ".ico", ".svg"} and "source" not in p.parts}
        self.assertFalse(images - set(MANIFEST["files"]), "brand images missing from brand/manifest.json")
        self.assertIn(".claude-plugin/icon.png", MANIFEST["files"])

    def test_a_retouched_image_is_rejected_by_the_validator(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = copy_repo(tmp)
            with open(os.path.join(root, ".claude-plugin", "icon.png"), "ab") as fh:
                fh.write(b"\0")
            found = errors(root, "publication safety")
            self.assertTrue(any(".claude-plugin/icon.png" in e and "re-render" in e for e in found), found)

    def test_an_unrecorded_image_is_still_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = copy_repo(tmp)
            Path(root, "brand", "graphics", "stock.jpg").write_bytes(b"\xff\xd8 not ours")
            found = errors(root, "publication safety")
            self.assertTrue(any("brand/graphics/stock.jpg" in e and "provenance" in e for e in found), found)


class Vectors(unittest.TestCase):
    @require(NODE, "node")
    def test_committed_svgs_match_their_sources(self):
        out = run([NODE, str(BRAND / "build.mjs"), "--check"], cwd=ROOT)
        self.assertEqual(out.returncode, 0, out.stdout + out.stderr)
        self.assertIn("0 stale", out.stdout)

    def test_mark_geometry_is_two_closed_strokes_inside_its_box(self):
        mark = json.loads((BRAND / "source" / "mark.json").read_text(encoding="utf-8"))
        _, _, w, h = mark["viewBox"]
        self.assertEqual(set(mark["strokes"]), {"form", "force"})
        for name, d in mark["strokes"].items():
            self.assertTrue(d.startswith("M") and d.endswith("Z"), name)
            nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
            xs, ys = nums[0::2], nums[1::2]
            self.assertTrue(0 <= min(xs) and max(xs) <= w and 0 <= min(ys) and max(ys) <= h, f"{name} leaves the box")

    def test_svgs_are_self_contained(self):
        for svg in BRAND.rglob("*.svg"):
            text = svg.read_text(encoding="utf-8")
            self.assertTrue(text.startswith("<svg xmlns=\"http://www.w3.org/2000/svg\""), svg.name)
            self.assertIn("<title>", text, f"{svg.name} has no accessible title")
            self.assertNotRegex(text, r"(href|src)=\"(https?:|file:)", f"{svg.name} loads something external")
            self.assertNotIn("<text", text, f"{svg.name} depends on a font; outline the type")


class Separation(unittest.TestCase):
    def test_the_skill_carries_no_brand(self):
        """The product's identity must never become a style the skill imposes on users' projects."""
        skill = Path(ROOT, "skills", "form-and-force")
        values = {e["value"].lower() for e in TOKENS["palette"].values()}
        for f in skill.rglob("*"):
            if f.suffix in {".md", ".mjs", ".json"}:
                text = f.read_text(encoding="utf-8").lower()
                self.assertFalse([v for v in values if v in text], f"{f.name} contains a brand colour")
                self.assertNotIn("plus jakarta", text, f"{f.name} names the brand typeface")


if __name__ == "__main__":
    unittest.main()
