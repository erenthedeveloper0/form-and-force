# SPDX-License-Identifier: MIT
"""The standalone ZIP contains exactly the skill, is reproducible, and bad archives are rejected."""
import os
import tempfile
import unittest
import zipfile

from support import ROOT

import package_skill
import validate_repository
from pathlib import Path

SKILL_PREFIX = "skills/form-and-force/"


class Build(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        cls.zip_path, cls.expected = package_skill.build(ROOT, cls._tmp.name)

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def test_archive_verifies(self):
        errors, info = package_skill.verify(self.zip_path, self.expected)
        self.assertEqual(errors, [])
        self.assertEqual(os.path.basename(self.zip_path), "form-and-force-0.1.0.zip")
        self.assertEqual(info["files"], len(self.expected))

    def test_contains_exactly_the_skill_plus_license(self):
        files, _ = validate_repository.publication_files(ROOT)
        skill = {"form-and-force/" + f[len(SKILL_PREFIX):] for f in files if f.startswith(SKILL_PREFIX)}
        with zipfile.ZipFile(self.zip_path) as zf:
            names = set(zf.namelist())
        self.assertEqual(names, skill | {"form-and-force/LICENSE"})
        for required in ("form-and-force/SKILL.md", "form-and-force/scripts/slop_scan.mjs",
                         "form-and-force/references/quality-gates.md", "form-and-force/assets/report-template.md"):
            self.assertIn(required, names)
        self.assertFalse([n for n in names if n.split("/")[1] in {"research", "evals", "tests", "docs"}])

    def test_license_matches_repository(self):
        with zipfile.ZipFile(self.zip_path) as zf:
            self.assertEqual(zf.read("form-and-force/LICENSE"), Path(ROOT, "LICENSE").read_bytes())

    def test_reproducible_bytes(self):
        with tempfile.TemporaryDirectory() as other:
            again, _ = package_skill.build(ROOT, other)
            self.assertEqual(Path(again).read_bytes(), Path(self.zip_path).read_bytes())

    def test_fixed_metadata(self):
        with zipfile.ZipFile(self.zip_path) as zf:
            for info in zf.infolist():
                self.assertEqual(info.date_time, package_skill.FIXED_TIME)
                mode = info.external_attr >> 16
                executable = zf.read(info.filename).startswith(b"#!")
                self.assertEqual(mode, 0o100755 if executable else 0o100644, info.filename)


class VerifyRejects(unittest.TestCase):
    def archive(self, members):
        tmp = tempfile.NamedTemporaryFile(suffix=".zip", delete=False)
        tmp.close()
        self.addCleanup(os.unlink, tmp.name)
        with zipfile.ZipFile(tmp.name, "w") as zf:
            for name, data in members.items():
                zf.writestr(name, data)
        return tmp.name

    def base(self, **extra):
        members = {
            "form-and-force/SKILL.md": "---\nname: form-and-force\ndescription: d\n---\nSee [r](references/r.md).\n",
            "form-and-force/references/r.md": "# r\n",
            "form-and-force/LICENSE": "MIT License\n",
        }
        members.update(extra)
        return members

    def problems(self, members, expected=None):
        return package_skill.verify(self.archive(members), expected)[0]

    def test_minimal_archive_passes(self):
        self.assertEqual(self.problems(self.base()), [])

    def test_missing_reference(self):
        members = self.base()
        del members["form-and-force/references/r.md"]
        self.assertTrue(any("references/r.md is not in the package" in p for p in self.problems(members)))

    def test_missing_skill_md_and_license(self):
        members = self.base()
        del members["form-and-force/SKILL.md"]
        del members["form-and-force/LICENSE"]
        problems = self.problems(members)
        self.assertTrue(any("SKILL.md: missing" in p for p in problems))
        self.assertTrue(any("LICENSE: missing" in p for p in problems))

    def test_wrong_depth_and_traversal(self):
        problems = self.problems(self.base(**{"SKILL.md": "x", "form-and-force/../evil.sh": "x"}))
        self.assertTrue(any("outside the single top-level folder" in p for p in problems))
        self.assertTrue(any("unsafe path" in p for p in problems))

    def test_unwanted_files(self):
        problems = self.problems(self.base(**{"form-and-force/.DS_Store": "x", "form-and-force/research/notes.md": "x",
                                              "form-and-force/.env": "TOKEN=1"}))
        self.assertTrue(any(".DS_Store: unwanted" in p for p in problems))
        self.assertTrue(any("research/notes.md: repository development file" in p for p in problems))
        self.assertTrue(any(".env: unwanted" in p for p in problems))

    def test_script_dependencies(self):
        problems = self.problems(self.base(**{
            "form-and-force/scripts/a.mjs": "import { b } from './b.mjs';\nimport fs from 'node:fs';\nimport x from 'left-pad';\n"}))
        self.assertTrue(any("imports ./b.mjs" in p for p in problems))
        self.assertTrue(any("'left-pad'" in p for p in problems))
        self.assertFalse(any("node:fs" in p for p in problems))

    def test_expected_files_compared(self):
        members = self.base()
        expected = list(members) + ["form-and-force/references/extra.md"]
        self.assertTrue(any("extra.md: expected in the package" in p for p in self.problems(members, expected)))

    def test_not_a_zip(self):
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as fh:
            fh.write(b"not a zip")
        self.addCleanup(os.unlink, fh.name)
        self.assertTrue(package_skill.verify(fh.name)[0])


if __name__ == "__main__":
    unittest.main()
