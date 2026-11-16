# SPDX-License-Identifier: MIT
"""The skill's reference library keeps the shape agents and tests rely on.

The component atlas is searched, not read: every entry has to answer the same
fields in the same order, so `grep -A 16 "^### Name"` returns a whole entry.
The other references are pointed at by section number, so their Contents
lists must match their numbered sections.
"""
import re
import unittest
from pathlib import Path

from support import ROOT

REFS = Path(ROOT, "skills", "form-and-force", "references")
ATLAS = (REFS / "component-atlas.md").read_text(encoding="utf-8")
FIELDS = ["Job", "Generic", "Why it fails", "Stronger", "Keep convention when", "Decide", "Content", "Motion",
          "Responsive", "A11y", "States", "Build", "Test", "Severity", "Evidence", "Example"]


def atlas_sections():
    parts = re.split(r"^## (\d+)\. (.+)$", ATLAS, flags=re.M)
    return [(int(parts[k]), parts[k + 1], parts[k + 2]) for k in range(1, len(parts), 3)]


def entries():
    for number, section, body in atlas_sections():
        for chunk in re.split(r"^(?=### )", body, flags=re.M)[1:]:
            name, _, text = chunk.partition("\n")
            yield number, name[4:].strip(), text.split("\n---")[0]


class ComponentAtlas(unittest.TestCase):
    def test_every_entry_is_complete_or_a_cross_reference(self):
        for number, name, text in entries():
            with self.subTest(component=name):
                if text.lstrip().startswith("- See "):
                    self.assertIn("**Severity:**", text)
                    self.assertIn("**Evidence:**", text)
                    continue
                positions = [text.find(f"**{f}:**") for f in FIELDS]
                missing = [f for f, at in zip(FIELDS, positions) if at < 0]
                self.assertFalse(missing, f"§{number} {name} lacks {', '.join(missing)}")
                self.assertEqual(positions, sorted(positions), f"§{number} {name}: fields out of order")

    def test_severity_is_a_review_trigger_or_a_failure(self):
        for _, name, text in entries():
            m = re.search(r"\*\*Severity:\*\*\s*(\S)", text)
            self.assertTrue(m and m.group(1) in "AC", f"{name}: severity must start with A or C")

    def test_cross_references_point_at_real_entries(self):
        names = {name for _, name, _ in entries()}
        sections = {number for number, _, _ in atlas_sections()}
        for _, name, text in entries():
            if not text.lstrip().startswith("- See "):
                continue
            for target in re.findall(r'"([^"]+)"', text.split("**Severity:**")[0]):
                self.assertIn(target, names, f"{name} points at \"{target}\", which is not an entry")
        for ref in re.findall(r"\(§(\d+)\)", ATLAS):
            self.assertIn(int(ref), sections, f"(§{ref}) is not a section of the atlas")

    def test_the_index_lists_every_entry_under_its_section(self):
        contents = ATLAS.split("## Contents", 1)[1].split("\n---", 1)[0]
        total = 0
        for number, section, body in atlas_sections():
            listed = re.search(rf"^{number}\. \*\*{re.escape(section)}\*\* \((\d+)\): (.+)$", contents, re.M)
            self.assertTrue(listed, f"§{number} {section} is missing from Contents")
            names = re.findall(r"^### (.+)$", body, re.M)
            self.assertEqual(listed.group(2).split(" · "), names, f"§{number}: the index does not match the entries")
            self.assertEqual(int(listed.group(1)), len(names))
            total += len(names)
        self.assertIn(f"{total} components in {len(atlas_sections())} sections", contents)
        self.assertGreaterEqual(total, 180, "the atlas lost components")

    def test_names_are_unique(self):
        names = [name for _, name, _ in entries()]
        self.assertEqual(len(names), len(set(names)), "two entries share a name, so a search returns both")


class References(unittest.TestCase):
    def test_contents_match_numbered_sections(self):
        for ref in sorted(REFS.glob("*.md")):
            text = ref.read_text(encoding="utf-8")
            heads = re.findall(r"^## (\d+)\. ", text, re.M)
            if not heads:
                continue
            contents = text.split("## Contents", 1)[1]
            contents = contents[:re.search(r"\n## |\n---", contents).start()]
            with self.subTest(reference=ref.name):
                self.assertEqual(re.findall(r"^(\d+)\. ", contents, re.M), heads)
                self.assertEqual(heads, [str(i) for i in range(1, len(heads) + 1)], "sections must be numbered 1..n")


if __name__ == "__main__":
    unittest.main()
