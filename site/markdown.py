# SPDX-License-Identifier: MIT
"""A small Markdown renderer for the documentation site. Standard library only.

It covers the Markdown this repository writes, which is GitHub-flavoured:
ATX headings, paragraphs, fenced code, block quotes and GitHub alerts, nested
ordered, unordered and task lists, pipe tables with alignment, rules, raw HTML
blocks, and inline code, links, images, autolinks, emphasis, strikethrough and
backslash escapes. Anything outside that subset is rendered as text rather than
guessed at.

Links are passed to a resolver supplied by the caller, so the site builder can
map `references/direction.md#5-deal` to the right page and fail on a link that
goes nowhere.
"""
import html
import re

ESCAPABLE = "\\`*_{}[]()#+-.!|<>~\""
ALERTS = {"NOTE": "Note", "TIP": "Tip", "IMPORTANT": "Important", "WARNING": "Warning", "CAUTION": "Caution"}
BLOCK_HTML = re.compile(r"^\s{0,3}<(/?)(p|div|picture|table|details|summary|img|a|h[1-6]|br|hr|section|figure|source|kbd|sup|sub)\b", re.I)


def slugify(text, seen):
    """GitHub's heading anchors: lower case, punctuation dropped, spaces to hyphens, repeats numbered."""
    text = re.sub(r"<[^>]+>", "", text)
    slug = re.sub(r"[^\w\- ]", "", html.unescape(text).strip().lower()).replace(" ", "-")
    n = seen.get(slug, 0)
    seen[slug] = n + 1
    return slug if n == 0 else f"{slug}-{n}"


class Renderer:
    def __init__(self, resolve_link=lambda url, image: url, highlight=None):
        self.resolve_link = resolve_link
        self.highlight = highlight or (lambda code, lang: html.escape(code))
        self.headings = []
        self._seen = {}

    # ------------------------------------------------------------ inline

    def inline(self, text):
        out, i, n = [], 0, len(text)
        while i < n:
            c = text[i]
            if c == "\\" and i + 1 < n and text[i + 1] in ESCAPABLE:
                out.append(html.escape(text[i + 1]))
                i += 2
                continue
            if c == "`":
                m = re.match(r"(`+)(.+?)(?<!`)\1(?!`)", text[i:], re.S)
                if m:
                    code = m.group(2)
                    if code.startswith(" ") and code.endswith(" ") and code.strip():
                        code = code[1:-1]
                    out.append(f"<code>{html.escape(code)}</code>")
                    i += m.end()
                    continue
            if c == "!" and text.startswith("![", i):
                m = self._link_at(text, i + 1)
                if m:
                    label, url, title, end = m
                    src = html.escape(self.resolve_link(url, True), quote=True)
                    t = f' title="{html.escape(title, quote=True)}"' if title else ""
                    out.append(f'<img src="{src}" alt="{html.escape(self._plain(label), quote=True)}"{t} loading="lazy">')
                    i = end
                    continue
            if c == "[":
                m = self._link_at(text, i)
                if m:
                    label, url, title, end = m
                    href = html.escape(self.resolve_link(url, False), quote=True)
                    t = f' title="{html.escape(title, quote=True)}"' if title else ""
                    ext = ' rel="noopener"' if re.match(r"https?://", href) else ""
                    out.append(f'<a href="{href}"{t}{ext}>{self.inline(label)}</a>')
                    i = end
                    continue
            if c == "<":
                m = re.match(r"<(https?://[^>\s]+)>", text[i:])
                if m:
                    url = html.escape(m.group(1), quote=True)
                    out.append(f'<a href="{url}" rel="noopener">{url}</a>')
                    i += m.end()
                    continue
                m = re.match(r"</?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*)?/?>", text[i:])
                if m:
                    out.append(self._raw_html(m.group(0)))
                    i += m.end()
                    continue
            if c == "&":
                m = re.match(r"&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);", text[i:])
                if m:
                    out.append(m.group(0))
                    i += m.end()
                    continue
            if c in "*_~":
                m = self._emphasis_at(text, i)
                if m:
                    tag, inner, end = m
                    out.append(f"<{tag}>{self.inline(inner)}</{tag}>")
                    i = end
                    continue
            out.append(html.escape(c))
            i += 1
        return "".join(out)

    def _emphasis_at(self, text, i):
        for delim, tag in (("**", "strong"), ("__", "strong"), ("~~", "del"), ("*", "em"), ("_", "em")):
            if not text.startswith(delim, i):
                continue
            if delim[0] == "_" and i > 0 and text[i - 1].isalnum():
                continue
            start = i + len(delim)
            if start >= len(text) or text[start].isspace():
                continue
            j = start
            while True:
                j = text.find(delim, j)
                if j < 0:
                    break
                if text[j - 1].isspace() or (delim == "*" and text.startswith("**", j) and not text.startswith("***", j)):
                    j += len(delim)
                    continue
                if delim[0] == "_" and j + len(delim) < len(text) and text[j + len(delim)].isalnum():
                    j += len(delim)
                    continue
                if "`" in text[start:j] and text[start:j].count("`") % 2:
                    j += len(delim)
                    continue
                return tag, text[start:j], j + len(delim)
        return None

    def _link_at(self, text, i):
        """Parse [label](url "title") at text[i] == '['. Returns (label, url, title, end) or None."""
        depth, j = 0, i
        while j < len(text):
            ch = text[j]
            if ch == "\\":
                j += 2
                continue
            if ch == "`":
                k = text.find("`", j + 1)
                j = k + 1 if k > 0 else j + 1
                continue
            if ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        else:
            return None
        if j + 1 >= len(text) or text[j + 1] != "(":
            return None
        m = re.match(r"\(\s*<?([^)\s>]*)>?(?:\s+\"([^\"]*)\")?\s*\)", text[j + 1:])
        if not m:
            return None
        return text[i + 1:j], m.group(1), m.group(2), j + 1 + m.end()

    def _raw_html(self, tag):
        def fix(m):
            attr, quote, value = m.group(1), m.group(2), m.group(3)
            return f'{attr}={quote}{html.escape(self.resolve_link(value, attr.lower() in ("src", "srcset")), quote=True)}{quote}'
        return re.sub(r"\b(href|src|srcset)=([\"'])([^\"']*)\2", fix, tag)

    @staticmethod
    def _plain(text):
        text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)
        return re.sub(r"[`*_~]", "", text)

    # ------------------------------------------------------------ blocks

    def render(self, markdown):
        lines = markdown.replace("\r\n", "\n").replace("\t", "    ").split("\n")
        return self._blocks(lines)

    def _blocks(self, lines):
        out, i = [], 0
        while i < len(lines):
            line = lines[i]
            if not line.strip():
                i += 1
                continue
            fence = re.match(r"^(\s{0,3})(`{3,}|~{3,})\s*([\w+-]*)", line)
            if fence:
                indent, marker, lang = len(fence.group(1)), fence.group(2), fence.group(3).lower()
                body, i = [], i + 1
                while i < len(lines) and not re.match(rf"^\s{{0,3}}{re.escape(marker[0])}{{{len(marker)},}}\s*$", lines[i]):
                    body.append(lines[i][indent:] if lines[i][:indent].strip() == "" else lines[i])
                    i += 1
                i += 1
                code = "\n".join(body)
                cls = f' class="language-{lang}"' if lang else ""
                out.append(f'<pre data-lang="{html.escape(lang or "text")}"><code{cls}>{self.highlight(code, lang)}</code></pre>')
                continue
            heading = re.match(r"^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$", line)
            if heading:
                level, text = len(heading.group(1)), heading.group(2)
                anchor = slugify(self.inline(text), self._seen)
                rendered = self.inline(text)
                self.headings.append((level, anchor, re.sub(r"<[^>]+>", "", rendered)))
                out.append(f'<h{level} id="{anchor}"><a class="anchor" href="#{anchor}" aria-hidden="true" tabindex="-1">#</a>{rendered}</h{level}>')
                i += 1
                continue
            if re.match(r"^\s{0,3}([-*_])(\s*\1){2,}\s*$", line):
                out.append("<hr>")
                i += 1
                continue
            if line.lstrip().startswith(">"):
                quoted = []
                while i < len(lines) and lines[i].lstrip().startswith(">"):
                    quoted.append(re.sub(r"^\s*>\s?", "", lines[i]))
                    i += 1
                alert = re.match(r"^\[!(\w+)\]\s*$", quoted[0]) if quoted else None
                if alert and alert.group(1).upper() in ALERTS:
                    kind = alert.group(1).upper()
                    out.append(f'<aside class="alert alert-{kind.lower()}"><p class="alert-title">{ALERTS[kind]}</p>{self._blocks(quoted[1:])}</aside>')
                else:
                    out.append(f"<blockquote>{self._blocks(quoted)}</blockquote>")
                continue
            if self._is_table(lines, i):
                i = self._table(lines, i, out)
                continue
            if re.match(r"^\s{0,3}([-*+]|\d{1,9}[.)])\s+", line):
                i = self._list(lines, i, out)
                continue
            if BLOCK_HTML.match(line):
                block = []
                while i < len(lines) and lines[i].strip():
                    block.append(lines[i])
                    i += 1
                out.append(self._raw_html_block("\n".join(block)))
                continue
            para = []
            while i < len(lines) and lines[i].strip() and not self._starts_block(lines, i):
                para.append(lines[i].strip())
                i += 1
            text = "\n".join(para)
            text = re.sub(r"(\\|  )\n", "<br>\n", text)
            out.append(f"<p>{self.inline(text)}</p>")
        return "\n".join(out)

    def _raw_html_block(self, block):
        # Inline Markdown inside simple HTML blocks (as GitHub does for <p align=center> lines) is rendered.
        return re.sub(r"<[^>]+>|[^<]+", lambda m: self._raw_html(m.group(0)) if m.group(0).startswith("<") else self.inline(m.group(0)), block)

    def _starts_block(self, lines, i):
        line = lines[i]
        return bool(re.match(r"^\s{0,3}(#{1,6}\s|>|```|~~~|([-*+]|\d{1,9}[.)])\s+)", line)
                    or re.match(r"^\s{0,3}([-*_])(\s*\1){2,}\s*$", line) or self._is_table(lines, i))

    @staticmethod
    def _is_table(lines, i):
        return ("|" in lines[i] and i + 1 < len(lines)
                and re.match(r"^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$", lines[i + 1]) is not None)

    @staticmethod
    def _cells(row):
        row = row.strip()
        if row.startswith("|"):
            row = row[1:]
        if row.endswith("|") and not row.endswith("\\|"):
            row = row[:-1]
        cells, cur, code = [], "", False
        k = 0
        while k < len(row):
            ch = row[k]
            if ch == "\\" and k + 1 < len(row) and row[k + 1] == "|":
                cur += "|"
                k += 2
                continue
            if ch == "`":
                code = not code
            if ch == "|" and not code:
                cells.append(cur.strip())
                cur = ""
            else:
                cur += ch
            k += 1
        cells.append(cur.strip())
        return cells

    def _table(self, lines, i, out):
        head = self._cells(lines[i])
        aligns = []
        for spec in self._cells(lines[i + 1]):
            spec = spec.strip()
            aligns.append("center" if spec.startswith(":") and spec.endswith(":") else "right" if spec.endswith(":") else "left" if spec.startswith(":") else "")
        i += 2
        rows = []
        while i < len(lines) and "|" in lines[i] and lines[i].strip():
            rows.append(self._cells(lines[i]))
            i += 1
        def cell(tag, text, k):
            a = aligns[k] if k < len(aligns) else ""
            style = f' style="text-align:{a}"' if a else ""
            return f"<{tag}{style}>{self.inline(text)}</{tag}>"
        thead = "".join(cell("th", t, k) for k, t in enumerate(head))
        tbody = "".join("<tr>" + "".join(cell("td", r[k] if k < len(r) else "", k) for k in range(len(head))) + "</tr>" for r in rows)
        # A table whose header cells are all empty is a list of pairs: no header row.
        thead = f"<thead><tr>{thead}</tr></thead>" if any(t.strip() for t in head) else ""
        out.append(f'<div class="table"><table>{thead}<tbody>{tbody}</tbody></table></div>')
        return i

    def _list(self, lines, i, out):
        first = re.match(r"^(\s*)([-*+]|(\d{1,9})[.)])\s+", lines[i])
        base = len(first.group(1))
        ordered = first.group(3) is not None
        start = int(first.group(3)) if ordered and first.group(3) != "1" else None
        items = []
        while i < len(lines):
            m = re.match(r"^(\s*)([-*+]|(\d{1,9})[.)])\s+(.*)$", lines[i])
            if not m or len(m.group(1)) != base or (m.group(3) is not None) != ordered:
                break
            content_indent = len(lines[i]) - len(m.group(4)) if m.group(4) else len(m.group(1)) + len(m.group(2)) + 1
            body = [m.group(4)]
            i += 1
            while i < len(lines):
                nxt = lines[i]
                if not nxt.strip():
                    if i + 1 < len(lines) and lines[i + 1].strip() and (len(lines[i + 1]) - len(lines[i + 1].lstrip())) > base:
                        body.append("")
                        i += 1
                        continue
                    break
                indent = len(nxt) - len(nxt.lstrip())
                if indent <= base and re.match(r"^\s*([-*+]|\d{1,9}[.)])\s+", nxt):
                    break
                if indent <= base and self._starts_block(lines, i):
                    break
                body.append(nxt[min(indent, content_indent):] if indent >= content_indent else nxt.strip())
                i += 1
            items.append(body)
        tag = "ol" if ordered else "ul"
        attr = f' start="{start}"' if start else ""
        parts = []
        for body in items:
            task = re.match(r"^\[( |x|X)\]\s+(.*)", body[0])
            prefix = ""
            if task:
                checked = " checked" if task.group(1).lower() == "x" else ""
                prefix = f'<input type="checkbox" disabled{checked}> '
                body = [task.group(2)] + body[1:]
            loose = "" in body
            if not loose and not any(self._starts_block(body, k) for k in range(1, len(body))):
                parts.append(f"<li>{prefix}{self.inline(' '.join(b.strip() for b in body))}</li>")
                continue
            first_par, rest = [], body
            k = 0
            while k < len(body) and body[k].strip() and (k == 0 or not self._starts_block(body, k)):
                first_par.append(body[k].strip())
                k += 1
            rest = body[k:]
            inner = f"<p>{self.inline(' '.join(first_par))}</p>" if loose else self.inline(" ".join(first_par))
            parts.append(f"<li>{prefix}{inner}{self._blocks(rest)}</li>")
        out.append(f"<{tag}{attr}>{''.join(parts)}</{tag}>")
        return i
