# SPDX-License-Identifier: MIT
"""Offline regression tests for the skill's bundled scripts and the eval fixture.

These run the real scanners on the bundled fixture project: they check the
skill's tooling, not a model, so they are free and deterministic.
"""
import filecmp
import json
import os
import tempfile
import unittest

from support import BASH, NODE, ROOT, require, run, write

SCRIPTS = os.path.join(ROOT, "skills", "form-and-force", "scripts")
FIXTURE = os.path.join(ROOT, "evals", "fixtures", "generic-saas-landing")
CLEAN_PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kiln firing log</title>
<style>a:focus-visible { outline: 2px solid currentColor; }</style>
</head>
<body><main><h1>Firing 14 log</h1><p>Cone 10 reached after 31 hours.</p>
<a href="/firings/14">Read the full log</a></main></body>
</html>
"""


@require(NODE, "node")
class SlopScan(unittest.TestCase):
    def scan(self, target, *flags):
        return run([NODE, os.path.join(SCRIPTS, "slop_scan.mjs"), target, *flags])

    def test_fixture_failures_are_found(self):
        out = self.scan(FIXTURE, "--json")
        self.assertEqual(out.returncode, 0, out.stderr)
        report = json.loads(out.stdout)
        c_ids = {f["id"] for f in report["findings"] if f["cat"] == "C"}
        for expected in ("zoom-blocked", "dead-link", "placeholder-media", "img-no-alt", "no-reduced-motion",
                         "scrolltrigger-unregistered", "gsap-no-cleanup"):
            self.assertIn(expected, c_ids)
        self.assertGreaterEqual(report["summary"]["A"], 10)

    def test_strict_mode_fails_on_category_c(self):
        self.assertEqual(self.scan(FIXTURE, "--strict").returncode, 1)

    def test_client_secret_reported_without_its_value(self):
        fake = "sk_" + "live_" + "Zx81Qw7Lm2Pa9Rt4"
        with tempfile.TemporaryDirectory() as tmp:
            write(tmp, "src/pay.js", f"export const key = '{fake}';\n")
            out = self.scan(tmp, "--json")
            ids = {f["id"] for f in json.loads(out.stdout)["findings"]}
            self.assertIn("client-secret", ids)
            self.assertNotIn(fake, out.stdout + out.stderr)

    def test_clean_page_has_no_findings(self):
        with tempfile.TemporaryDirectory() as tmp:
            write(tmp, "index.html", CLEAN_PAGE)
            summary = json.loads(self.scan(tmp, "--json").stdout)["summary"]
            self.assertEqual((summary["A"], summary["B"], summary["C"]), (0, 0, 0))
            self.assertEqual(self.scan(tmp, "--strict").returncode, 0)


@require(NODE, "node")
class InspectRepo(unittest.TestCase):
    def test_fixture_inventory(self):
        out = run([NODE, os.path.join(SCRIPTS, "inspect_repo.mjs"), FIXTURE, "--json"])
        self.assertEqual(out.returncode, 0, out.stderr)
        report = json.loads(out.stdout)
        self.assertTrue(any(f.startswith("next@") for f in report["framework"]))
        self.assertTrue(any(m.startswith("gsap@") for m in report["motion"]))

    def test_secret_files_are_listed_but_never_read(self):
        sentinel = "ff-sentinel-" + "7d41c2"
        with tempfile.TemporaryDirectory() as tmp:
            write(tmp, ".env", f"SECRET_TOKEN={sentinel}\n")
            write(tmp, "package.json", '{"name": "x", "dependencies": {"react": "19.0.0"}}\n')
            out = run([NODE, os.path.join(SCRIPTS, "inspect_repo.mjs"), tmp, "--json"])
            self.assertEqual(out.returncode, 0, out.stderr)
            self.assertNotIn(sentinel, out.stdout + out.stderr)
            self.assertIn(".env", json.loads(out.stdout)["secretsPresent"])


@require(NODE, "node")
class AuditPageHelp(unittest.TestCase):
    def test_help_prints_only_the_header(self):
        out = run([NODE, os.path.join(SCRIPTS, "audit_page.mjs"), "--help"])
        self.assertEqual(out.returncode, 0)
        self.assertIn("Usage:", out.stdout)
        self.assertNotIn("import ", out.stdout)
        self.assertNotIn("SPDX", out.stdout)


@require(BASH, "bash")
class Scaffold(unittest.TestCase):
    def test_scaffold_recreates_the_fixture_exactly(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = run([BASH, os.path.join(ROOT, "evals", "audit-generic-saas-landing", "scaffold.sh")], cwd=tmp)
            self.assertEqual(out.returncode, 0, out.stderr)
            cmp = filecmp.dircmp(tmp, FIXTURE)
            self.assertEqual(self._diff(cmp), [])

    def _diff(self, cmp, prefix=""):
        problems = [f"{prefix}{n}: only in scaffold output" for n in cmp.left_only]
        problems += [f"{prefix}{n}: only in fixture" for n in cmp.right_only]
        _, mismatch, errors = filecmp.cmpfiles(cmp.left, cmp.right, cmp.common_files, shallow=False)
        problems += [f"{prefix}{n}: content differs" for n in mismatch + errors]
        for name, sub in cmp.subdirs.items():
            problems += self._diff(sub, f"{prefix}{name}/")
        return problems


if __name__ == "__main__":
    unittest.main()
