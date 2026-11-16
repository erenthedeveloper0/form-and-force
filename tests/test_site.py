# SPDX-License-Identifier: MIT
"""The documentation site: its Markdown renderer, and a full build with link checks.

Free and offline. The build runs into a temporary directory; nothing under the
repository is written.
"""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

from support import ROOT, copy_repo, run

sys.path.insert(0, os.path.join(ROOT, "site"))
from markdown import Renderer, slugify  # noqa: E402


def render(md, resolve=lambda url, image: url):
    r = Renderer(resolve)
    return r.render(md), r.headings


class Markdown(unittest.TestCase):
    def test_headings_get_github_anchors(self):
        html, heads = render("# Title\n\n## 2. Read the subject\n\n## Run `scripts/evals.py`\n\n## Repeat\n\n## Repeat\n")
        self.assertIn('id="2-read-the-subject"', html)
        self.assertIn('id="run-scriptsevalspy"', html)
        self.assertEqual([h[1] for h in heads][-2:], ["repeat", "repeat-1"])

    def test_slugs_match_the_validator(self):
        sys.path.insert(0, os.path.join(ROOT, "tooling"))
        import validate_repository as vr
        for heading in ("1. Conformance target", "Tier B: optional paid model evaluations", "The dealer's history",
                        "Kinetic typography", "Colour, material & imagery"):
            self.assertEqual(slugify(heading, {}), vr.github_slug(heading), heading)

    def test_inline_formatting(self):
        html, _ = render("A **b**, *c*, `d|e`, ~~f~~, snake_case_word, 2 * 3, [g](h.md \"t\") and <https://x.org>.\n")
        for part in ("<strong>b</strong>", "<em>c</em>", "<code>d|e</code>", "<del>f</del>", "snake_case_word",
                     "2 * 3", '<a href="h.md" title="t">g</a>', '<a href="https://x.org" rel="noopener">'):
            self.assertIn(part, html)

    def test_code_is_escaped_and_never_formatted(self):
        html, _ = render("```html\n<a href=\"#\">**x**</a>\n```\n")
        self.assertIn("&lt;a href=&quot;#&quot;&gt;**x**&lt;/a&gt;", html)
        self.assertNotIn("<strong>", html)

    def test_tables_with_alignment_and_escaped_pipes(self):
        html, _ = render("| A | B |\n|---|:-:|\n| `x \\| y` | b |\n")
        self.assertIn("<table>", html)
        self.assertIn('<th style="text-align:center">B</th>', html)
        self.assertIn("<code>x | y</code>", html)

    def test_nested_and_task_lists(self):
        html, _ = render("- one\n  - two\n- [x] done\n- [ ] open\n\n3. c\n4. d\n")
        self.assertIn("<ul><li>one<ul><li>two</li></ul></li>", html)
        self.assertIn('<input type="checkbox" disabled checked> done', html)
        self.assertIn('<ol start="3">', html)

    def test_alerts_and_quotes(self):
        html, _ = render("> [!NOTE]\n> Read this.\n\n> A quote.\n")
        self.assertIn('<aside class="alert alert-note">', html)
        self.assertIn("<blockquote><p>A quote.</p></blockquote>", html)

    def test_every_link_goes_through_the_resolver(self):
        seen = []
        render("[a](x.md#y) ![b](c.png)\n<picture><source srcset=\"d.webp\"><img src=\"e.webp\" alt=\"\"></picture>\n",
               lambda url, image: seen.append((url, image)) or url)
        self.assertEqual(seen, [("x.md#y", False), ("c.png", True), ("d.webp", True), ("e.webp", True)])


class Build(unittest.TestCase):
    def test_the_site_builds_and_every_link_resolves(self):
        with tempfile.TemporaryDirectory() as out:
            result = run([sys.executable, os.path.join(ROOT, "site", "build.py"), "--out", out])
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("RESULT: PASS", result.stdout)
            nav = json.loads(Path(ROOT, "site", "nav.json").read_text(encoding="utf-8"))
            for section in nav["sections"]:
                for page in section["pages"]:
                    self.assertTrue(Path(out, page["url"]).is_file(), page["url"])
            index = json.loads(Path(out, "assets", "search-index.json").read_text(encoding="utf-8"))
            self.assertTrue(any(r["s"] == "Pricing tables" for r in index), "atlas entries must be searchable")
            css = Path(out, "assets", "site.css").read_text(encoding="utf-8")
            self.assertNotIn("/* TOKENS */", css)
            self.assertIn("--accent:", css)
            home = Path(out, "index.html").read_text(encoding="utf-8")
            self.assertNotIn("{{", home, "an unfilled template slot")
            self.assertNotRegex(home, r'(href|src)="https?://(?!github\.com)[^"]*\.(css|js|woff2?)"', "the site loads nothing from other hosts")

    def test_a_broken_link_or_an_unlisted_page_fails_the_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = copy_repo(tmp)
            page = Path(root, "docs", "quick-start.md")
            page.write_text(page.read_text(encoding="utf-8") + "\nSee [nowhere](no-such-page.md) and [x](how-it-works.md#no-such-anchor).\n", encoding="utf-8")
            Path(root, "docs", "orphan.md").write_text("# Orphan\n", encoding="utf-8")
            result = run([sys.executable, os.path.join(root, "site", "build.py"), "--check"])
            self.assertEqual(result.returncode, 1)
            self.assertIn("docs/orphan.md: not listed in site/nav.json", result.stdout)
            Path(root, "docs", "orphan.md").unlink()
            result = run([sys.executable, os.path.join(root, "site", "build.py"), "--check"])
            self.assertIn("no-such-page.md does not resolve", result.stdout)
            self.assertIn("no element with id 'no-such-anchor'", result.stdout)

    def test_the_builder_will_not_empty_a_directory_it_did_not_make(self):
        with tempfile.TemporaryDirectory() as out:
            Path(out, "keep.txt").write_text("someone's file", encoding="utf-8")
            result = run([sys.executable, os.path.join(ROOT, "site", "build.py"), "--out", out])
            self.assertNotEqual(result.returncode, 0)
            self.assertTrue(Path(out, "keep.txt").is_file())


class DocsSync(unittest.TestCase):
    def test_generated_tables_are_current(self):
        result = run([sys.executable, os.path.join(ROOT, "tooling", "sync_docs.py"), "--check"])
        self.assertEqual(result.returncode, 0, result.stdout)


if __name__ == "__main__":
    unittest.main()
