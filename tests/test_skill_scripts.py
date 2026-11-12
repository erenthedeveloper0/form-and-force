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
        """export const Jump = ({ id }) => <a href={'#' + id}>jump</a>;""",
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
        'export const Five = () => <a href={""}>five</a>;',
        "export const Six = () => <a href={ '' }>six</a>;",
    ]
    # Vue and Alpine bind a JavaScript expression, so `:href="'#'"` is the string "#". The rule caught these
    # before #2 was fixed, and must still catch them.
    DEAD_BOUND = [
        """<a :href="'#'">one</a>""",
        """<a :href="''">two</a>""",
        """<a v-bind:href="'#'">three</a>""",
        """<a :href='"#"'>four</a>""",
        """<a :href="'javascript:void(0)'">five</a>""",
        """<a x-bind:href=" '#' ">six</a>""",
    ]
    # Bound strings that build a link. Before #2 was fixed, all but the last two were failures.
    BUILT_BOUND = [
        """<a :href="'#' + id">one</a>""",
        """<a :href="'#section'">two</a>""",
        """<a :href="'/posts/' + post.slug">three</a>""",
        """<a :href='"/tags/" + tag'>four</a>""",
        """<a :href="url">five</a>""",
        """<a :href="`/posts/${id}`">six</a>""",
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

    def test_bound_dead_links_are_still_found(self):
        name = os.path.join("src", "Nav.vue")
        for line in self.DEAD_BOUND:
            with self.subTest(line=line):
                found = self.finding(self.report(self.project({name: f"<template>\n{line}\n</template>\n"})), "dead-link")
                self.assertIsNotNone(found)
                self.assertEqual(self.lines(found), {f"{name}:2"})
        root = self.project({name: "\n".join(["<template>", *self.DEAD_BOUND, "</template>"]) + "\n"})
        found = self.finding(self.report(root), "dead-link")
        self.assertEqual((found["cat"], found["count"]), ("C", len(self.DEAD_BOUND)))
        self.assertEqual(self.scan(root, "--strict").returncode, 1)

    def test_bound_hrefs_that_build_a_link_are_not_dead_links(self):
        for line in self.BUILT_BOUND:
            with self.subTest(line=line):
                root = self.project({"src/Nav.vue": f"<template>\n{line}\n</template>\n"})
                report = self.report(root)
                self.assertIsNone(self.finding(report, "dead-link"))
                self.assertEqual(report["summary"]["C"], 0)
                self.assertEqual(self.scan(root, "--strict").returncode, 0)

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


# Four category C failures, one per line, in markup every template format shares.
BROKEN = """<meta name="viewport" content="width=device-width, user-scalable=no">
<a href="#">Read more</a>
<img src="/hero.jpg">
<p>Lorem ipsum dolor sit amet</p>
"""
BROKEN_RULES = {"zoom-blocked": 1, "dead-link": 2, "img-no-alt": 3, "placeholder-copy": 4}
# The seven extensions named in issue #3, then the same syntaxes under their other names.
REPORTED = (".blade.php", ".erb", ".twig", ".njk", ".hbs", ".liquid", ".j2")
SCANNED = {".blade.php": "blade", ".erb": "erb", ".twig": "jinja", ".njk": "jinja", ".hbs": "handlebars",
           ".liquid": "liquid", ".j2": "jinja", ".ejs": "erb", ".nunjucks": "jinja", ".jinja": "jinja",
           ".jinja2": "jinja", ".handlebars": "handlebars", ".mustache": "handlebars"}
UNREAD = (".pug", ".jade", ".haml", ".slim", ".cshtml", ".razor", ".jsp", ".phtml", ".heex", ".leex", ".html.eex",
          ".gohtml")
# How each syntax writes a comment, prints into a tag, branches inside a tag and fills an href; an opener
# left unclosed; then lines that are correct in that syntax and that a reader expecting plain HTML gets wrong.
SYNTAX = {
    "blade": {
        "comment": "{{-- TEXT --}}", "prints": "{{ $attributes }}", "branch": ("@if($lazy)", "@endif"),
        "href": "{{ route('home') }}", "stray": "{!!",
        "extra": ["""<img @class(['p-4', 'ring' => $active]) src="/c.png" alt="C">""",
                  """<img src="/d.png" @if($user->avatar) alt="{{ $user->name }}" @endif>""",
                  """<img src="{{ asset('e.png') }}" alt="{{ __("Hello") }}">""",
                  """<img {{ $attributes->merge(['class' => 'rounded']) }} src="{{ $src }}">""",
                  """@php $html = '<a href="' . $url . '">'; @endphp"""],
    },
    "erb": {
        "comment": "<%# TEXT %>", "prints": "<%= attrs %>", "branch": ("<% if lazy %>", "<% end %>"),
        "href": "<%= root_path %>", "stray": "<%",
        "extra": ["""<img <%= "hidden" if a > b %> src="/c.png" alt="C">""",
                  """<img src="/d.png" <%= tag.attributes(alt: t(".logo")) %>>""",
                  """<% # <a href="">a comment in the code</a> %>"""],
    },
    "jinja": {
        "comment": "{# TEXT #}", "prints": "{{ attrs }}", "branch": ("{% if lazy %}", "{% endif %}"),
        "href": "{{ url }}", "stray": "{#",
        "extra": ["""<img src="/c.png" alt="{{ a > b ? 'x' : "y" }}">""",
                  """<div {% if a > b %}class="wide"{% endif %}>text</div>"""],
    },
    "handlebars": {
        "comment": "{{!-- TEXT --}}", "prints": "{{{attrs}}}", "branch": ("{{#if lazy}}", "{{/if}}"),
        "href": "{{url}}", "stray": "{{!--",
        "extra": ["""{{! <img src="/short.png"> }}""", """<img src="/c.png" {{> imageAttributes}}>"""],
    },
    "liquid": {
        "comment": "{% comment %} TEXT {% endcomment %}", "prints": "{{ block.shopify_attributes }}",
        "branch": ("{% if lazy %}", "{% endif %}"), "href": "{{ product.url }}", "stray": "{% comment %}",
        "extra": ["""{%- comment -%} <a href="">trimmed</a> {%- endcomment -%}""", """{% # <img src="/inline.png"> %}""",
                  """<img src="/c.png" {% if image.alt != blank %}alt="{{ image.alt | escape }}"{% endif %}>"""],
    },
}


def correct_template(syntax):
    """A template with no failure in it, written with the constructs that are not HTML."""
    s = SYNTAX[syntax]
    note = lambda text: s["comment"].replace("TEXT", text)  # noqa: E731
    return "\n".join([
        note('<a href="#">old</a> <img src="/old.png">'),
        note('first line\n  <a href="">old</a>\n  <video autoplay></video>\n'),
        f'<a href="{s["href"]}">Home</a>',
        f'<img src="/a.png" {s["prints"]}>',
        f'<img src="/b.png" {s["branch"][0]}alt="B"{s["branch"][1]}>',
        f'<video autoplay {s["prints"]}></video>',
        *s["extra"],
    ]) + "\n"


@require(NODE, "node")
class Templates(ScanCase):
    """Issue #3: server-rendered templates are read, in their own syntax."""

    def test_the_reported_extensions_are_all_covered(self):
        self.assertEqual(set(REPORTED) - set(SCANNED), set())
        self.assertEqual(len(REPORTED), 7)

    def test_each_extension_is_found_and_read(self):
        for ext in SCANNED:
            with self.subTest(ext=ext):
                name = f"views/home{ext}"
                root = self.project({name: BROKEN})
                report = self.report(root)
                self.assertEqual(report["summary"]["filesScanned"], 1)
                self.assertEqual(report["coverage"]["templates"]["scanned"], 1)
                self.assertEqual(report["coverage"]["templates"]["scannedExtensions"], {ext: 1})
                self.assertEqual(report["coverage"]["templates"]["notScanned"], 0)
                self.assertEqual(report["summary"]["coverage"], "partial")
                for rule, line in BROKEN_RULES.items():
                    found = self.finding(report, rule)
                    self.assertIsNotNone(found, f"{rule} was not found in a {ext} file")
                    self.assertEqual(found["cat"], "C")
                    self.assertEqual(self.lines(found), {f"{os.path.normpath(name)}:{line}"})
                self.assertEqual(self.scan(root, "--strict").returncode, 1)

    def test_blade_is_a_compound_extension(self):
        root = self.project({
            "resources/views/home.blade.php": BROKEN,
            "resources/views/Shout.BLADE.PHP": BROKEN,
            "app/Http/HomeController.php": "<?php\n$link = '<a href=\"#\">dead</a>';\n",
            "routes/web.php": "<?php\n",
        })
        report = self.report(root)
        self.assertEqual(report["summary"]["filesScanned"], 2, "plain .php is code, and is neither read nor reported")
        self.assertEqual(report["coverage"]["templates"]["scannedExtensions"], {".blade.php": 2})
        self.assertEqual(report["coverage"]["templates"]["notScanned"], 0)
        self.assertEqual(self.finding(report, "dead-link")["count"], 2)

    def test_template_syntax_is_not_read_as_html(self):
        for ext, syntax in SCANNED.items():
            with self.subTest(ext=ext):
                root = self.project({f"views/page{ext}": correct_template(syntax)})
                report = self.report(root)
                c = [(f["id"], f["samples"]) for f in report["findings"] if f["cat"] == "C"]
                self.assertEqual(c, [], f"correct {syntax} was read as broken HTML")
                self.assertEqual(report["summary"]["coverage"], "partial")
                self.assertEqual(self.scan(root, "--strict").returncode, 0)

    def test_failures_beside_template_syntax_are_still_found(self):
        for ext, syntax in SCANNED.items():
            with self.subTest(ext=ext):
                s = SYNTAX[syntax]
                body = correct_template(syntax)
                first = body.count("\n") + 1
                body += f'<img src="/z.png" {s["branch"][0]}loading="lazy"{s["branch"][1]}>\n<a href="#">dead</a>\n'
                name = f"views/page{ext}"
                report = self.report(self.project({name: body}))
                rel = os.path.normpath(name)
                self.assertEqual(self.lines(self.finding(report, "img-no-alt")), {f"{rel}:{first}"},
                                 "a branch that adds another attribute does not supply the alt")
                self.assertEqual(self.lines(self.finding(report, "dead-link")), {f"{rel}:{first + 1}"})
                self.assertEqual(report["summary"]["C"], 2)

    def test_a_template_tag_that_never_closes_hides_nothing_after_it(self):
        for ext, syntax in SCANNED.items():
            with self.subTest(ext=ext):
                s = SYNTAX[syntax]
                body = [f"<p>A stray {s['stray']} that never closes</p>"]
                if syntax != "erb":  # every ERB tag closes with the same %>, so none can follow one that never closes
                    body.append(f'<img src="/a.png" {s["prints"]}>')
                body += ['<a href="#">dead</a>', '<img src="/hero.jpg">']
                name = f"views/page{ext}"
                report = self.report(self.project({name: "\n".join(body) + "\n"}))
                rel = os.path.normpath(name)
                self.assertEqual(self.lines(self.finding(report, "dead-link")), {f"{rel}:{len(body) - 1}"})
                self.assertEqual(self.lines(self.finding(report, "img-no-alt")), {f"{rel}:{len(body)}"},
                                 "the tags after it are still read, and the one that prints its attributes is still excused")

    def test_an_unfinished_template_does_not_stall_the_scan(self):
        """Thousands of template tags that never close must cost one pass, not one pass each."""
        unfinished = {".blade.php": "{{ a {!! b {{-- c <?php d\n", ".erb": "<% a <%= b <%# c\n", ".twig": "{{ a {% b {# c\n",
                      ".hbs": "{{#if a {{! b {{{ c {{!-- d\n", ".liquid": "{% comment %} {{ a {% b\n"}
        for ext, line in unfinished.items():
            with self.subTest(ext=ext):
                root = self.project({f"views/page{ext}": line * (700_000 // len(line))})
                out = run([NODE, os.path.join(SCRIPTS, "slop_scan.mjs"), root, "--json"], timeout=60)
                self.assertEqual(out.returncode, 0, out.stderr)
                self.assertEqual(json.loads(out.stdout)["summary"]["filesScanned"], 1)


@require(NODE, "node")
class Coverage(ScanCase):
    """Issue #3: a file that was not read is never counted as read, and never passes --strict."""

    PUG = 'a(href="#") dead\nimg(src="/hero.jpg")\n'
    CORRECT = '<a href="{{ url }}">Home</a>\n'

    def coverage(self, root):
        report = self.report(root)
        self.assertEqual(report["summary"]["coverage"], report["coverage"]["status"])
        return report, report["coverage"]

    def test_unsupported_templates_are_reported_not_passed(self):
        root = self.project({"index.html": CLEAN_PAGE, "views/a.pug": self.PUG, "views/b.pug": self.PUG,
                             "views/c.haml": "%a{href: '#'} dead\n", "views/d.slim": "a href='#' dead\n"})
        report, cov = self.coverage(root)
        self.assertEqual(cov["status"], "incomplete")
        self.assertEqual(report["summary"]["filesScanned"], 1)
        self.assertEqual((report["summary"]["C"], report["summary"]["B"], report["summary"]["A"]), (0, 0, 0))
        self.assertEqual(cov["templates"]["notScanned"], 4)
        self.assertEqual(cov["templates"]["notScannedExtensions"], {".pug": 2, ".haml": 1, ".slim": 1})
        self.assertEqual(list(cov["templates"]["notScannedExtensions"])[0], ".pug", "the commonest extension comes first")
        self.assertEqual(cov["templates"]["notScannedFiles"],
                         [{"file": os.path.join("views", n), "reason": "unsupported format"}
                          for n in ("a.pug", "b.pug", "c.haml", "d.slim")])

        text = self.scan(root)
        self.assertEqual(text.returncode, 0, "without --strict the exit code is 0, as before")
        for expected in ("Coverage: INCOMPLETE", "4 template files", ".pug ×2", ".haml ×1", ".slim ×1",
                         os.path.join("views", "a.pug"), "This is not a clean result: 4 template files were not scanned."):
            self.assertIn(expected, text.stdout)
        self.assertNotIn("No triggers found. Static scanning", text.stdout, "an unread project must not read as a clean pass")

        strict = self.scan(root, "--strict")
        self.assertEqual(strict.returncode, 2)
        self.assertIn("coverage is incomplete", strict.stderr)
        as_json = self.scan(root, "--strict", "--json")
        self.assertEqual(as_json.returncode, 2)
        self.assertEqual(json.loads(as_json.stdout)["coverage"]["status"], "incomplete", "stdout stays valid JSON")

    def test_every_unread_format_is_reported(self):
        for ext in UNREAD:
            with self.subTest(ext=ext):
                root = self.project({f"views/page{ext}": "<a href=\"#\">dead</a>\n"})
                report, cov = self.coverage(root)
                self.assertEqual(cov["status"], "incomplete")
                self.assertEqual(report["summary"]["filesScanned"], 0)
                self.assertEqual(cov["templates"]["notScannedExtensions"], {ext: 1})
                self.assertEqual(self.scan(root, "--strict").returncode, 2)

    def test_strict_exit_codes(self):
        cases = {
            "conventional and clean": ({"index.html": CLEAN_PAGE}, 0),
            "templates read and clean": ({"views/home.twig": self.CORRECT}, 0),
            "a failure": ({"index.html": BROKEN}, 1),
            "a failure in a template": ({"views/home.twig": BROKEN}, 1),
            "a failure and unread templates": ({"index.html": BROKEN, "views/a.pug": self.PUG}, 1),
            "unread templates and no failure": ({"index.html": CLEAN_PAGE, "views/a.pug": self.PUG}, 2),
            "nothing but unread templates": ({"views/a.pug": self.PUG}, 2),
        }
        for name, (files, code) in cases.items():
            with self.subTest(case=name):
                root = self.project(files)
                self.assertEqual(self.scan(root, "--strict").returncode, code)
                self.assertEqual(self.scan(root).returncode, 0)

    def test_mixed_project_counts_are_exact(self):
        root = self.project({
            "index.html": CLEAN_PAGE,
            "src/app.js": "export const ready = true;\n",
            "styles/site.css": "a:focus-visible { outline: 2px solid currentColor; }\n",
            "resources/views/home.blade.php": self.CORRECT,
            "resources/views/about.blade.php": self.CORRECT,
            "resources/views/layout.blade.php": self.CORRECT,
            "templates/list.twig": self.CORRECT,
            "templates/item.twig": self.CORRECT,
            "app/views/show.html.erb": '<a href="<%= root_path %>">Home</a>\n',
            "views/x.pug": self.PUG,
            "views/y.pug": self.PUG,
            "views/z.haml": "%p text\n",
            # Excluded directories and skipped names hold failures and unread formats: none of it may be counted.
            "node_modules/pkg/view.pug": self.PUG,
            "node_modules/pkg/card.twig": BROKEN,
            "vendor/laravel/mail.blade.php": BROKEN,
            "vendor/theme/page.slim": "p text\n",
            "dist/out.liquid": BROKEN,
            "build/page.j2": BROKEN,
            ".cache/card.hbs": BROKEN,
            ".hidden/page.pug": self.PUG,
            "assets/app.min.js": "el.innerHTML = '<a href=\"#\">dead</a>';\n",
            "README.md": BROKEN,
        })
        report, cov = self.coverage(root)
        self.assertEqual(report["summary"]["filesScanned"], 9)
        self.assertEqual(cov["templates"]["scanned"], 6)
        self.assertEqual(cov["templates"]["scannedExtensions"], {".blade.php": 3, ".twig": 2, ".erb": 1})
        self.assertEqual(list(cov["templates"]["scannedExtensions"]), [".blade.php", ".twig", ".erb"])
        self.assertEqual(cov["templates"]["notScanned"], 3)
        self.assertEqual(cov["templates"]["notScannedExtensions"], {".pug": 2, ".haml": 1})
        self.assertEqual([f["file"] for f in cov["templates"]["notScannedFiles"]],
                         [os.path.join("views", n) for n in ("x.pug", "y.pug", "z.haml")])
        self.assertEqual(cov["skipped"], [])
        self.assertEqual(cov["status"], "incomplete")
        self.assertEqual(report["summary"]["C"], 0, "nothing in an excluded directory was read")
        text = self.scan(root).stdout
        self.assertIn("slop_scan: 9 files under", text)
        self.assertIn("NOT scanned: 3 template files (.pug ×2, .haml ×1)", text)
        self.assertIn("Read as markup: 6 template files (.blade.php ×3, .twig ×2, .erb ×1)", text)

    def test_a_template_named_like_a_repository_document_is_not_passed_over(self):
        """README.md and its kin are left out by name. A template with one of those names is a page."""
        root = self.project({
            "resources/views/settings/security.blade.php": BROKEN,
            "app/views/pages/changelog.html.erb": BROKEN,
            "templates/license.twig": BROKEN,
            "sections/agents.liquid": BROKEN,
            "views/readme.pug": self.PUG,
            "README.md": BROKEN,
            "SECURITY.md": BROKEN,
            "docs/CHANGELOG.md": BROKEN,
        })
        report, cov = self.coverage(root)
        self.assertEqual(report["summary"]["filesScanned"], 4, "the templates are read, and the documents are not")
        self.assertEqual(cov["templates"]["scannedExtensions"], {".blade.php": 1, ".erb": 1, ".liquid": 1, ".twig": 1})
        self.assertEqual(cov["templates"]["notScannedFiles"],
                         [{"file": os.path.join("views", "readme.pug"), "reason": "unsupported format"}])
        self.assertEqual(cov["status"], "incomplete")
        self.assertEqual(self.lines(self.finding(report, "dead-link")),
                         {f"{os.path.join(*p.split('/'))}:2" for p in ("resources/views/settings/security.blade.php",
                                                                       "app/views/pages/changelog.html.erb",
                                                                       "templates/license.twig", "sections/agents.liquid")})
        self.assertEqual(self.scan(root, "--strict").returncode, 1)

    def test_templates_that_are_all_read_are_partial_coverage(self):
        root = self.project({"index.html": CLEAN_PAGE, "views/home.twig": self.CORRECT})
        report, cov = self.coverage(root)
        self.assertEqual(cov["status"], "partial")
        self.assertEqual((report["summary"]["filesScanned"], cov["templates"]["scanned"], cov["templates"]["notScanned"]), (2, 1, 0))
        text = self.scan(root).stdout
        self.assertIn("Coverage: PARTIAL", text)
        self.assertIn("Read as markup: 1 template file (.twig ×1)", text)
        self.assertIn("No triggers found. Static scanning", text)

    def test_conventional_projects_are_complete(self):
        for target in (FIXTURE, self.project({"index.html": CLEAN_PAGE, "src/app.jsx": "export const App = () => <main />;\n"})):
            with self.subTest(target=os.path.basename(target)):
                report, cov = self.coverage(target)
                self.assertEqual(cov, {"status": "complete", "skipped": [], "templates": {
                    "scanned": 0, "scannedExtensions": {}, "notScanned": 0, "notScannedExtensions": {}, "notScannedFiles": []}})
                self.assertEqual(self.scan(target).stdout.split("\n")[1], "Coverage: complete")
        self.assertEqual(self.report(FIXTURE)["summary"]["filesScanned"], 9)

    def test_empty_and_excluded_only_directories(self):
        cases = {
            "empty": {},
            "excluded directories only": {"node_modules/a/index.html": BROKEN, "vendor/b.twig": BROKEN, "dist/c.pug": self.PUG},
            "no file type the scanner reads": {"app/Controller.php": "<?php\n", "main.py": "print('x')\n"},
        }
        for name, files in cases.items():
            with self.subTest(case=name):
                root = self.project(files)
                report, cov = self.coverage(root)
                self.assertEqual(cov["status"], "empty")
                self.assertEqual(report["summary"]["filesScanned"], 0)
                self.assertEqual((cov["templates"]["scanned"], cov["templates"]["notScanned"]), (0, 0))
                self.assertEqual(report["findings"], [])
                text = self.scan(root)
                self.assertIn("Coverage: EMPTY", text.stdout)
                self.assertIn("Nothing was scanned", text.stdout)
                self.assertNotIn("No triggers found", text.stdout)
                self.assertEqual(self.scan(root, "--strict").returncode, 0, "there is nothing to fail, as before")

    def test_a_file_too_large_to_read_is_reported(self):
        huge = '<a href="#">dead</a>\n' * 45_000  # over the 800 kB limit
        root = self.project({"index.html": CLEAN_PAGE, "views/huge.twig": huge})
        report, cov = self.coverage(root)
        self.assertEqual(cov["status"], "incomplete")
        self.assertEqual(cov["templates"]["notScannedFiles"], [{"file": os.path.join("views", "huge.twig"), "reason": "over 800 kB"}])
        self.assertEqual(report["summary"]["filesScanned"], 1)
        self.assertEqual(self.scan(root, "--strict").returncode, 2)

        root = self.project({"index.html": CLEAN_PAGE, "export/huge.html": huge})
        report, cov = self.coverage(root)
        self.assertEqual(cov["status"], "partial", "a source file over the limit is named, and does not change the exit code")
        self.assertEqual(cov["skipped"], [{"file": os.path.join("export", "huge.html"), "reason": "over 800 kB"}])
        self.assertEqual(report["summary"]["filesScanned"], 1)
        text = self.scan(root, "--strict")
        self.assertEqual(text.returncode, 0)
        self.assertIn(f"Skipped: 1 other file: {os.path.join('export', 'huge.html')} (over 800 kB)", text.stdout)

    def test_a_file_that_cannot_be_opened_is_not_counted_as_read(self):
        root = self.project({"index.html": CLEAN_PAGE, "partials/card.html": CLEAN_PAGE})
        try:
            # One link points nowhere, so it cannot be measured. The other two point at a directory,
            # so they are measured and then fail to open.
            os.symlink(os.path.join(root, "nowhere"), os.path.join(root, "gone.twig"))
            os.symlink(os.path.join(root, "partials"), os.path.join(root, "folder.twig"), target_is_directory=True)
            os.symlink(os.path.join(root, "partials"), os.path.join(root, "folder.html"), target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("this platform cannot create a symbolic link here")
        report, cov = self.coverage(root)
        self.assertEqual(report["summary"]["filesScanned"], 2)
        self.assertEqual(cov["templates"]["scanned"], 0)
        self.assertEqual(cov["templates"]["notScannedFiles"], [{"file": "folder.twig", "reason": "unreadable"},
                                                               {"file": "gone.twig", "reason": "unreadable"}])
        self.assertEqual(cov["skipped"], [{"file": "folder.html", "reason": "unreadable"}])
        self.assertEqual(cov["status"], "incomplete")
        self.assertIn("slop_scan: 2 files under", self.scan(root).stdout)

    def test_line_numbers_survive_a_multi_line_template_comment(self):
        body = '{#\n  <a href="#">old</a>\n  <img src="/old.png">\n#}\n<a href="#">dead</a>\n<img src="/hero.jpg">\n'
        report = self.report(self.project({"page.twig": body}))
        self.assertEqual(self.lines(self.finding(report, "dead-link")), {"page.twig:5"})
        self.assertEqual(self.lines(self.finding(report, "img-no-alt")), {"page.twig:6"})
        self.assertEqual(self.finding(report, "img-no-alt")["samples"], ['page.twig:6  <img src="/hero.jpg">'])


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
