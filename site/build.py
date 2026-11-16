#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Build the Form & Force documentation site from the repository's Markdown.

Every page is a Markdown file that is also read on GitHub: docs/, the skill's
own SKILL.md, references and templates, the brand guidelines, the research and
the project documents. site/nav.json orders them. Links between Markdown files
become links between pages; links to other repository files go to GitHub. The
theme's colours and fonts come from brand/. Standard library only.

Usage:
  python3 site/build.py                 build into dist/site/
  python3 site/build.py --out DIR       build into DIR (it must be empty or a previous build)
  python3 site/build.py --check         build into a temporary directory and only report problems
  python3 site/build.py --serve [PORT]  build, then serve it at http://localhost:PORT/ (default 8000)

The build fails (exit 1) on a missing source, a Markdown file under docs/ that
no page lists, a link or anchor that does not resolve, a duplicate id, or a
reference to anything outside the site.
"""
import argparse
import html
import json
import os
import posixpath
import re
import shutil
import sys
import tempfile
import urllib.parse
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from markdown import Renderer  # noqa: E402

MARKER = ".form-and-force-site"
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico"}
COMMENT_LANGS = {"bash": "#", "sh": "#", "shell": "#", "console": "#", "powershell": "#", "python": "#", "py": "#",
                 "yaml": "#", "yml": "#", "toml": "#", "ini": "#", "js": "//", "mjs": "//", "javascript": "//", "ts": "//"}
ASSETS = {
    "brand/fonts/PlusJakartaSans.woff2": "assets/fonts/PlusJakartaSans.woff2",
    "brand/fonts/JetBrainsMono.woff2": "assets/fonts/JetBrainsMono.woff2",
    "brand/identity/icon/favicon.svg": "assets/favicon.svg",
    "brand/identity/icon/favicon.ico": "assets/favicon.ico",
    "brand/identity/icon/apple-touch-icon.png": "assets/apple-touch-icon.png",
    "brand/applications/github/form-and-force-social-preview.jpg": "assets/social-preview.jpg",
    "brand/graphics/form-and-force-fold-dark.webp": "assets/fold-dark.webp",
    "brand/graphics/form-and-force-fold-light.webp": "assets/fold-light.webp",
}


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def rel_url(from_page, to):
    """A relative URL from one site path (a file) to another."""
    base = posixpath.dirname(from_page)
    return posixpath.relpath(to, base or ".") if to else ""


def highlight(code, lang):
    """Escape code, setting comments and prompts apart. Nothing more: no colour scheme to maintain."""
    marker = COMMENT_LANGS.get(lang)
    lines = []
    for line in code.split("\n"):
        if not marker:
            lines.append(html.escape(line))
            continue
        quote, cut = None, None
        for k, ch in enumerate(line):
            if quote:
                quote = None if ch == quote else quote
            elif ch in "\"'`":
                quote = ch
            elif line.startswith(marker, k) and (k == 0 or line[k - 1].isspace()):
                cut = k
                break
        head, tail = (line, "") if cut is None else (line[:cut], line[cut:])
        head = html.escape(head)
        if lang in ("console",) and head.startswith("$ "):
            head = '<span class="p">$ </span>' + head[2:]
        lines.append(head + (f'<span class="c">{html.escape(tail)}</span>' if tail else ""))
    return "\n".join(lines)


def tokens_css():
    tokens = json.loads(read("brand/source/tokens.json"))
    def block(theme):
        return "".join(f"--{k}:{v};" for k, v in tokens["theme"][theme].items())
    pal = tokens["palette"]
    hero_dark = f"--hero-ground:{pal['void']['value']};--hero-image:url(fold-dark.webp);--hero-text:{pal['paper']['value']};--hero-muted:{pal['mist']['value']};--hero-line:rgb(255 255 255/.14);"
    hero_light = f"--hero-ground:{pal['silver']['value']};--hero-image:url(fold-light.webp);--hero-text:{pal['ink']['value']};--hero-muted:#2a2a36;--hero-line:rgb(7 6 10/.18);"
    return (f":root{{color-scheme:light;{block('light')}{hero_light}}}\n"
            f"@media (prefers-color-scheme: dark){{:root:not([data-theme=\"light\"]){{color-scheme:dark;{block('dark')}{hero_dark}}}}}\n"
            f":root[data-theme=\"dark\"]{{color-scheme:dark;{block('dark')}{hero_dark}}}\n"
            f":root[data-theme=\"light\"]{{color-scheme:light;{block('light')}{hero_light}}}\n")


class Site:
    def __init__(self):
        self.nav = json.loads(read("site/nav.json"))
        self.repo = self.nav["repository"].rstrip("/")
        self.branch = self.nav["branch"]
        self.version = json.loads(read(".claude-plugin/plugin.json"))["version"]
        self.sections = [(s, [dict(p, section=s["title"]) for p in s["pages"]]) for s in self.nav["sections"]]
        self.pages = [p for _, pages in self.sections for p in pages]
        self.by_source = {p["source"]: p for p in self.pages}
        self.errors = []
        self.files = {}         # site path -> repository path, for images a page uses
        self.search = []

    # ------------------------------------------------------------ checks before building

    def check_sources(self):
        urls = [p["url"] for p in self.pages]
        for dup in sorted({u for u in urls if urls.count(u) > 1}):
            self.errors.append(f"site/nav.json: url {dup} is used twice")
        for p in self.pages:
            if not os.path.isfile(os.path.join(ROOT, p["source"])):
                self.errors.append(f"site/nav.json: {p['source']} does not exist")
        for dirpath, _, names in os.walk(os.path.join(ROOT, "docs")):
            for n in names:
                rel = os.path.relpath(os.path.join(dirpath, n), ROOT).replace(os.sep, "/")
                if n.endswith(".md") and rel not in self.by_source:
                    self.errors.append(f"{rel}: not listed in site/nav.json, so the site would leave it out")

    # ------------------------------------------------------------ links

    def resolver(self, page):
        def resolve(url, image):
            if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", url) or url.startswith("//"):
                return url
            if url.startswith("#") or not url:
                return url
            path, _, frag = url.partition("#")
            path = urllib.parse.unquote(path)
            target = posixpath.normpath(posixpath.join(posixpath.dirname(page["source"]), path))
            if target.startswith("../") or target == "..":
                self.errors.append(f"{page['source']}: link {url} leaves the repository")
                return url
            if target in self.by_source:
                to = self.by_source[target]["url"]
                return rel_url(page["url"], to) + (f"#{frag}" if frag else "")
            abs_target = os.path.join(ROOT, target)
            if os.path.isfile(abs_target):
                if image or os.path.splitext(target)[1].lower() in IMAGE_EXT:
                    site_path = f"files/{target}"
                    self.files[site_path] = target
                    return rel_url(page["url"], site_path)
                return f"{self.repo}/blob/{self.branch}/{urllib.parse.quote(target)}" + (f"#{frag}" if frag else "")
            if os.path.isdir(abs_target):
                return f"{self.repo}/tree/{self.branch}/{urllib.parse.quote(target)}"
            if target.startswith(("dist/", "evals/results/")):
                return f"{self.repo}/tree/{self.branch}/{posixpath.dirname(target)}"
            self.errors.append(f"{page['source']}: link {url} does not resolve ({target} does not exist)")
            return url
        return resolve

    # ------------------------------------------------------------ pages

    def sidebar(self, current):
        out = []
        for s, pages in self.sections:
            here = any(p["url"] == current["url"] for p in pages)
            is_open = "" if s.get("collapsed") and not here else " open"
            items = []
            for p in pages:
                cur = ' aria-current="page"' if p["url"] == current["url"] else ""
                items.append(f'<li><a href="{rel_url(current["url"], p["url"])}"{cur}>{html.escape(p["title"])}</a></li>')
            note = f'<p class="section-note">{html.escape(s["description"])}</p>' if s.get("description") else ""
            out.append(f'<details{is_open}><summary class="section-title">{html.escape(s["title"])}</summary>{note}<ul>{"".join(items)}</ul></details>')
        return "".join(out)

    def toc(self, headings):
        h3 = [h for h in headings if h[0] == 3]
        levels = (2, 3) if len(h3) <= 40 else (2,)
        rows = [h for h in headings if h[0] in levels]
        if len(rows) < 2:
            return ""
        items = "".join(f'<li class="depth-{lvl}"><a href="#{anchor}">{html.escape(text)}</a></li>' for lvl, anchor, text in rows)
        return f'<nav class="toc" aria-label="On this page"><p>On this page</p><ol>{items}</ol></nav>'

    def pager(self, i):
        out = []
        if i > 0:
            p = self.pages[i - 1]
            out.append(f'<a class="prev" href="{rel_url(self.pages[i]["url"], p["url"])}"><span>Previous</span>{html.escape(p["title"])}</a>')
        if i + 1 < len(self.pages):
            p = self.pages[i + 1]
            out.append(f'<a class="next" href="{rel_url(self.pages[i]["url"], p["url"])}"><span>Next</span>{html.escape(p["title"])}</a>')
        return f'<nav class="pager" aria-label="Pages">{"".join(out)}</nav>'

    def hero(self, page):
        if page.get("layout") != "home":
            return ""
        install = ("claude plugin marketplace add erenthedeveloper0/form-and-force\n"
                   "claude plugin install form-and-force@form-and-force")
        return (f'<section class="hero"><div class="hero-inner"><p class="eyebrow">Decide. Build. Judge.</p>'
                f'<h1>Creative direction, interface design and motion engineering for coding agents.</h1>'
                f'<p>Form &amp; Force is an open-source Agent Skill and Claude Code plugin. It gives an agent a method for web work: '
                f'directions dealt from the subject and chosen by looking, a design language derived from the chosen frame, '
                f'and a jury that judges the rendered page above hard accessibility and engineering gates.</p>'
                f'<div class="actions"><a class="button primary" href="installation.html">Install</a>'
                f'<a class="button" href="how-it-works.html">How it works</a><a class="button" href="quick-start.html">Quick start</a></div>'
                f'<pre><code>{html.escape(install)}</code></pre></div></section>')

    def render_page(self, i, template, logo):
        page = self.pages[i]
        text = read(page["source"])
        r = Renderer(self.resolver(page), highlight)
        body = r.render(text)
        h1 = next((h for h in r.headings if h[0] == 1), None)
        page.setdefault("title", h1[2] if h1 else page["url"])
        first = re.search(r"<p>(.*?)</p>", body, re.S)
        desc = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", first.group(1)))).strip() if first else ""
        desc = desc if len(desc) <= 180 else desc[:177].rsplit(" ", 1)[0] + "…"
        root = "../" * page["url"].count("/")
        crumb = f'<p class="breadcrumb">{html.escape(page["section"])}</p>' if page.get("layout") != "home" else ""
        title = "Form & Force documentation" if page.get("layout") == "home" else f'{page["title"]} · Form & Force'
        values = {
            "title": html.escape(title), "description": html.escape(desc or "Form & Force documentation"),
            "root": root, "layout": page.get("layout", "doc"), "logo": logo, "version": self.version,
            "repository": self.repo, "sidebar": self.sidebar(page), "hero": self.hero(page), "breadcrumb": crumb,
            "content": body, "toc": self.toc(r.headings), "pager": self.pager(i),
            "edit": f"{self.repo}/edit/{self.branch}/{page['source']}",
        }
        out = template
        for k, v in values.items():
            out = out.replace("{{" + k + "}}", v)
        self.index_page(page, body)
        return out

    def index_page(self, page, body):
        parts = re.split(r'<h([1-3]) id="([^"]+)">(.*?)</h\1>', body, flags=re.S)
        def clean(s):
            s = re.sub(r'<a class="anchor"[^>]*>#</a>', "", s)
            return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()
        intro = clean(parts[0])
        if intro:
            self.search.append({"p": page["title"], "s": page["title"], "u": page["url"], "t": intro[:600]})
        for k in range(1, len(parts), 4):
            level, anchor, heading, text = parts[k], parts[k + 1], parts[k + 2], parts[k + 3]
            heading = clean(heading)
            url = page["url"] if level == "1" else f'{page["url"]}#{anchor}'
            self.search.append({"p": page["title"], "s": heading, "u": url, "t": clean(text)[:600]})

    # ------------------------------------------------------------ build

    def build(self, out):
        self.check_sources()
        if self.errors:
            return
        template = read("site/theme/page.html")
        logo = read("brand/identity/lockup/form-and-force-compact-currentcolor.svg").strip()
        logo = re.sub(r"<title>.*?</title>", "", logo).replace('role="img" aria-label="Form &amp; Force"', 'aria-hidden="true"')
        _, _, vw, vh = (float(v) for v in re.search(r'viewBox="([^"]+)"', logo).group(1).split())
        logo = logo.replace("<svg ", f'<svg width="{round(22 * vw / vh, 1)}" height="22" ', 1)
        # First pass resolves every title, so navigation can name pages that come later.
        for p in self.pages:
            if "title" not in p:
                m = re.search(r"^#\s+(.+?)\s*$", read(p["source"]), re.M)
                p["title"] = re.sub(r"[`*_]", "", m.group(1)) if m else p["url"]
        for i, page in enumerate(self.pages):
            write(out, page["url"], self.render_page(i, template, logo))
        css = read("site/theme/site.css").replace("/* TOKENS */", tokens_css())
        write(out, "assets/site.css", css)
        write(out, "assets/site.js", read("site/theme/site.js"))
        write(out, "assets/search-index.json", json.dumps(self.search, ensure_ascii=False, separators=(",", ":")))
        for src, dst in {**ASSETS, **{k: v for k, v in ((s, d) for d, s in self.files.items())}}.items():
            target = os.path.join(out, dst)
            os.makedirs(os.path.dirname(target), exist_ok=True)
            shutil.copyfile(os.path.join(ROOT, src), target)
        base = self.nav.get("base", "/")
        not_found = template
        for k, v in {"title": "Not found · Form &amp; Force", "description": "This page does not exist.", "root": base,
                     "layout": "doc", "logo": logo, "version": self.version, "repository": self.repo,
                     "sidebar": "", "hero": "", "breadcrumb": "", "toc": "", "pager": "",
                     "content": f'<h1>Not found</h1><p>There is no page at this address. Try the <a href="{base}index.html">documentation home</a> or search.</p>',
                     "edit": self.repo}.items():
            not_found = not_found.replace("{{" + k + "}}", v)
        write(out, "404.html", not_found)
        write(out, ".nojekyll", "")
        write(out, MARKER, "built by site/build.py\n")
        self.check_output(out)

    # ------------------------------------------------------------ checks after building

    def check_output(self, out):
        ids, refs = {}, []
        for dirpath, _, names in os.walk(out):
            for n in names:
                if not n.endswith(".html") or n == "404.html":
                    continue
                path = os.path.relpath(os.path.join(dirpath, n), out).replace(os.sep, "/")
                parser = Collector()
                with open(os.path.join(dirpath, n), encoding="utf-8") as fh:
                    parser.feed(fh.read())
                dupes = sorted({i for i in parser.ids if parser.ids.count(i) > 1})
                if dupes:
                    self.errors.append(f"{path}: duplicate id {', '.join(dupes[:5])}")
                ids[path] = set(parser.ids)
                refs += [(path, r) for r in parser.refs]
        for page, ref in refs:
            if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", ref) or ref.startswith("//"):
                continue    # external: checked on demand by tooling/check_external_links.py, never in a build
            path, _, frag = ref.partition("#")
            target = posixpath.normpath(posixpath.join(posixpath.dirname(page), urllib.parse.unquote(path))) if path else page
            if target.startswith(".."):
                self.errors.append(f"{page}: {ref} points outside the site")
                continue
            if not os.path.isfile(os.path.join(out, target)):
                self.errors.append(f"{page}: {ref} does not exist in the site")
            elif frag and target.endswith(".html") and urllib.parse.unquote(frag) not in ids.get(target, set()):
                self.errors.append(f"{page}: {ref}: no element with id '{frag}' in {target}")


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs = [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        for key in ("href", "src"):
            if a.get(key) is not None:
                self.refs.append(a[key])
        if a.get("srcset"):
            self.refs.append(a["srcset"].split()[0])


def write(out, rel, text):
    path = os.path.join(out, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def prepare(out):
    """Empty the output directory, but only one this script made or an empty one."""
    if os.path.isdir(out) and os.listdir(out):
        if not os.path.isfile(os.path.join(out, MARKER)):
            raise SystemExit(f"error: {out} is not empty and was not made by site/build.py; choose another --out")
        shutil.rmtree(out)
    os.makedirs(out, exist_ok=True)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", default=os.path.join(ROOT, "dist", "site"))
    ap.add_argument("--check", action="store_true", help="build into a temporary directory and report problems only")
    ap.add_argument("--serve", nargs="?", const=8000, type=int, metavar="PORT", help="serve the built site")
    args = ap.parse_args(argv)
    site = Site()
    with tempfile.TemporaryDirectory() as tmp:
        out = tmp if args.check else os.path.abspath(args.out)
        if not args.check:
            prepare(out)
        site.build(out)
        pages = len(site.pages)
        print(f"site/build: {pages} pages, {len(site.search)} search entries, {len(site.files)} images"
              + ("" if args.check else f" -> {os.path.relpath(out, ROOT) if out.startswith(ROOT) else out}"))
    for e in site.errors:
        print(f"  ERROR {e}")
    print("  RESULT:", "FAIL" if site.errors else "PASS")
    if site.errors:
        return 1
    if args.serve:
        import functools
        import http.server
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=out)
        print(f"Serving {out} at http://localhost:{args.serve}/ (Ctrl+C to stop)")
        with http.server.ThreadingHTTPServer(("127.0.0.1", args.serve), handler) as server:
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
