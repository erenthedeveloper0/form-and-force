# SPDX-License-Identifier: MIT
"""The skill validator enforces the Agent Skills rules it documents."""
import os
import tempfile
import unittest

from support import NODE, ROOT, require, write

import validate_skill

SKILL = os.path.join(ROOT, "skills", "form-and-force")
GOOD_FM = ("---\nname: {name}\ndescription: Checks things. Use when testing the validator.\n"
           "license: MIT\nmetadata:\n  version: \"0.1.0\"\n---\n")


class RealSkill(unittest.TestCase):
    def test_real_skill_passes(self):
        rep = validate_skill.validate_skill(SKILL)
        self.assertEqual(rep.errors, [])
        self.assertEqual(rep.info["name"], "form-and-force")
        self.assertEqual(rep.info["license"], "MIT")
        self.assertEqual(rep.info["references_linked"], 15)


class SyntheticSkills(unittest.TestCase):
    def make(self, name="demo-skill", body="# Demo\n\nSee [guide](references/guide.md).\n", fm=None):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        root = os.path.join(self._tmp.name, name)
        write(root, "SKILL.md", (fm if fm is not None else GOOD_FM.format(name=name)) + body)
        write(root, "references/guide.md", "# Guide\n")
        return root

    def errors_for(self, root):
        return validate_skill.validate_skill(root).errors

    def test_minimal_skill_passes(self):
        self.assertEqual(self.errors_for(self.make()), [])

    def test_name_must_match_directory(self):
        root = self.make(name="demo-skill", fm=GOOD_FM.format(name="other-name"))
        self.assertTrue(any("must match directory" in e for e in self.errors_for(root)))

    def test_name_rules(self):
        for bad in ("Demo", "demo--skill", "my-claude-skill"):
            root = self.make(name=bad, fm=GOOD_FM.format(name=bad))
            self.assertTrue(self.errors_for(root), bad)

    def test_description_limits(self):
        long_fm = GOOD_FM.format(name="demo-skill").replace("Checks things.", "x" * 1100)
        self.assertTrue(any("max 1024" in e for e in self.errors_for(self.make(fm=long_fm))))
        xml_fm = GOOD_FM.format(name="demo-skill").replace("Checks things.", "Checks <b>things</b>.")
        self.assertTrue(any("XML" in e for e in self.errors_for(self.make(fm=xml_fm))))

    def test_missing_frontmatter(self):
        self.assertTrue(any("frontmatter" in e for e in self.errors_for(self.make(fm=""))))

    def test_non_portable_key_warns(self):
        fm = GOOD_FM.format(name="demo-skill").replace("license: MIT\n", "license: MIT\nmodel: opus\n")
        rep = validate_skill.validate_skill(self.make(fm=fm))
        self.assertTrue(any("model" in w for w in rep.warnings))

    def test_unlinked_reference_and_missing_contents(self):
        root = self.make()
        write(root, "references/orphan.md", "# Orphan\n" + "line\n" * 120)
        errs = self.errors_for(root)
        self.assertTrue(any("orphan.md: not linked" in e for e in errs))
        self.assertTrue(any("orphan.md: over 100 lines" in e for e in errs))

    def test_broken_link_and_skill_dir_reference(self):
        body = "# Demo\n\nSee [guide](references/guide.md) and [x](references/nope.md).\n\n" \
               "```bash\nnode \"${CLAUDE_SKILL_DIR}/scripts/missing.mjs\"\n```\n"
        errs = self.errors_for(self.make(body=body))
        self.assertTrue(any("broken link: references/nope.md" in e for e in errs))
        self.assertTrue(any("scripts/missing.mjs does not exist" in e for e in errs))

    @require(NODE, "node")
    def test_javascript_syntax_error(self):
        root = self.make()
        write(root, "scripts/bad.mjs", "export const = 1;\n")
        self.assertTrue(any("scripts/bad.mjs: fails node --check" in e for e in self.errors_for(root)))


if __name__ == "__main__":
    unittest.main()
