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


class ScanCase(unittest.TestCase):
    """Builds a throwaway project and runs the scanner on it."""

    def project(self, files):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        for rel, text in files.items():
            write(tmp.name, rel, text)
        return tmp.name

    def scan(self, target, *flags):
        return run([NODE, os.path.join(SCRIPTS, "slop_scan.mjs"), target, *flags])

    def report(self, target):
        out = self.scan(target, "--json", "--max", "99")
        self.assertEqual(out.returncode, 0, out.stderr)
        return json.loads(out.stdout)

    def finding(self, report, rule):
        return next((f for f in report["findings"] if f["id"] == rule), None)

    def lines(self, finding):
        """The `file:line` each sample points at."""
        return {s.split("  ", 1)[0] for s in finding["samples"]}


@require(NODE, "node")
class DeadLink(ScanCase):
    """Issue #2: the quotes on either side of a string concatenation are not an empty href."""

    BUILT = [
        """el.outerHTML = '<a href="' + url + '">';""",
        """html += "<a href='" + url + "'>";""",
        """el.outerHTML = '<a href = "' + url + '">';""",
        """html += "<a href= '" + url + "'>";""",
        """html += "<a href ='" + url + "'>";""",
        """el.outerHTML = '<a href="#' + id + '">';""",
        """html += "<a href='#" + id + "'>";""",
        """el.outerHTML = '<a class="more" href="' + url + '" rel="next">' + label + '</a>';""",
        """const link = `<a href="${url}">`;""",
        """const anchor = `<a href='#${id}'>`;""",
    ]
    DEAD_HTML = [
        '<a href="#">one</a>',
        '<a href="">two</a>',
        "<a href=''>three</a>",
        "<a href='#'>four</a>",
        '<a href="javascript:alert(1)">five</a>',
        "<a href='javascript:void(0)'>six</a>",
        '<a href = "#">seven</a>',
        '<a href= "">eight</a>',
        "<a href ='#'>nine</a>",
        '<a href\t=\t"#">ten</a>',
        '<a href = "javascript:void(0)">eleven</a>',
    ]
    DEAD_JSX = [
        'export const One = () => <a href={"#"}>one</a>;',
        "export const Two = () => <a href={'#'}>two</a>;",
        'export const Three = () => <a href={ "#" }>three</a>;',
        'export const Four = () => <a href = {"#"}>four</a>;',
    ]

    def test_concatenated_hrefs_are_not_dead_links(self):
        for line in self.BUILT:
            with self.subTest(line=line):
                root = self.project({"src/links.js": line + "\n"})
                report = self.report(root)
                self.assertIsNone(self.finding(report, "dead-link"))
                self.assertEqual(report["summary"]["C"], 0)
                self.assertEqual(self.scan(root, "--strict").returncode, 0)

    def test_the_two_reported_lines_pass_strict_together(self):
        root = self.project({"src/links.js": "\n".join(self.BUILT[:2]) + "\n"})
        out = self.scan(root, "--strict")
        self.assertEqual(out.returncode, 0, out.stdout)
        self.assertNotIn("dead-link", out.stdout)

    def test_real_dead_links_are_each_still_found(self):
        root = self.project({"index.html": "\n".join(self.DEAD_HTML) + "\n", "src/Nav.jsx": "\n".join(self.DEAD_JSX) + "\n"})
        found = self.finding(self.report(root), "dead-link")
        self.assertIsNotNone(found)
        self.assertEqual((found["cat"], found["sev"]), ("C", "high"), "the rule keeps its category and severity")
        expected = {f"index.html:{n}" for n in range(1, len(self.DEAD_HTML) + 1)}
        expected |= {f"{os.path.join('src', 'Nav.jsx')}:{n}" for n in range(1, len(self.DEAD_JSX) + 1)}
        self.assertEqual(self.lines(found), expected)
        self.assertEqual(found["count"], len(expected))
        self.assertEqual(self.scan(root, "--strict").returncode, 1)

    def test_each_dead_form_is_found_alone(self):
        for line in self.DEAD_HTML:
            with self.subTest(line=line):
                found = self.finding(self.report(self.project({"index.html": line + "\n"})), "dead-link")
                self.assertIsNotNone(found)
                self.assertEqual(found["count"], 1)

    def test_a_dead_link_written_inside_a_string_is_still_found(self):
        dead = [
            """el.innerHTML = '<a href="#">' + label + '</a>';""",
            """el.innerHTML = "<a href=''>" + label + "</a>";""",
            """el.innerHTML = '<a href="' + url + '">' + label + '</a><a href="#">top</a>';""",
        ]
        root = self.project({"src/links.js": "\n".join(dead) + "\n"})
        found = self.finding(self.report(root), "dead-link")
        self.assertIsNotNone(found)
        self.assertEqual(self.lines(found), {f"{os.path.join('src', 'links.js')}:{n}" for n in (1, 2, 3)})
        self.assertEqual(self.scan(root, "--strict").returncode, 1)


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
    PAIRS = {"audit-generic-saas-landing": "generic-saas-landing", "jury-rejects-the-twin": "twin-landing",
             "menu-microinteraction-craft": "sluggish-menu"}

    def test_scaffold_recreates_the_fixture_exactly(self):
        for case, fixture in self.PAIRS.items():
            with tempfile.TemporaryDirectory() as tmp:
                out = run([BASH, os.path.join(ROOT, "evals", case, "scaffold.sh")], cwd=tmp)
                self.assertEqual(out.returncode, 0, out.stderr)
                cmp = filecmp.dircmp(tmp, os.path.join(ROOT, "evals", "fixtures", fixture))
                self.assertEqual(self._diff(cmp), [], case)

    @require(NODE, "node")
    def test_review_fixture_clears_the_static_floor(self):
        """The twin fixture has to be clean, or the jury case would be a defect hunt instead of a judgement of the idea."""
        out = run([NODE, os.path.join(SCRIPTS, "slop_scan.mjs"), os.path.join(ROOT, "evals", "fixtures", "twin-landing"), "--json"])
        self.assertEqual(json.loads(out.stdout)["summary"]["C"], 0)

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
