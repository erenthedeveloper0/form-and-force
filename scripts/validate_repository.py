#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Validate the Form & Force repository: structure, metadata, links and hygiene.

Offline and standard-library only. Node is used when present to syntax-check
the skill's JavaScript, and bash to syntax-check shell scripts; without them
those checks are reported as NOT RUN rather than passed. Nothing here contacts
the network or calls a model.

Checks operate on the publication set: the files `git add -A` would publish
(tracked plus untracked files that the repository's .gitignore does not
exclude). Outside a git repository the same ignore rules are applied with a
temporary index, so local results match a fresh CI checkout.

Usage: python3 scripts/validate_repository.py [--root DIR]
Exit 0 when there are no errors, 1 otherwise.
"""
import argparse
import ast
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import tomllib
from pathlib import Path
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import validate_skill  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL = "skills/form-and-force"
PLUGIN_NAME = "form-and-force"
DISPLAY_NAME = "Form & Force"
PYTHON_FEATURE_VERSION = (3, 11)

REQUIRED_FILES = [
    "LICENSE", "README.md", "CONTRIBUTING.md", "SECURITY.md", "CHANGELOG.md", "pyproject.toml",
    ".gitignore", ".gitattributes", ".editorconfig",
    ".github/workflows/ci.yml", ".github/dependabot.yml",
    ".claude-plugin/plugin.json", ".claude-plugin/marketplace.json",
    f"{SKILL}/SKILL.md",
    "scripts/validate_repository.py", "scripts/validate_skill.py", "scripts/package_skill.py",
    "research/SOURCE_STATUS.md",
]
# Directories whose every file on disk must be published (catches over-broad ignore rules).
MUST_PUBLISH_DIRS = ["skills", "scripts", "tests", "docs", ".claude-plugin", ".github", "evals", "assets"]
# Generated locations: ignored by design, so references to them are not dead links.
GENERATED_PREFIXES = ("dist/", "evals/results/")
REPO_PATH_PREFIXES = ("skills/", "scripts/", "research/", "evals/", "tests/", "docs/", "assets/", ".claude-plugin/", ".github/")

PLUGIN_KEYS = {
    "$schema", "name", "displayName", "version", "description", "author", "homepage", "repository",
    "license", "keywords", "metadata", "icon", "documentationUrl", "supportUrl", "privacyPolicyUrl",
    "termsOfServiceUrl", "defaultEnabled", "dependencies", "settings", "userConfig", "types", "channels",
    "skills", "commands", "agents", "hooks", "mcpServers", "lspServers", "outputStyles", "workflows",
    "experimental",
}
MARKETPLACE_KEYS = {
    "$schema", "name", "owner", "plugins", "description", "version", "metadata",
    "forceRemoveDeletedPlugins", "allowCrossMarketplaceDependenciesOn", "renames",
}
ENTRY_KEYS = (PLUGIN_KEYS - {"icon", "documentationUrl", "supportUrl", "privacyPolicyUrl", "termsOfServiceUrl"}) | {
    "source", "category", "tags", "strict", "relevance", "headers", "headersHelper",
}
SEMVER = re.compile(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?")

MIT_BODY = """Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
COPYRIGHT_LINE = re.compile(r"Copyright \(c\) (\d{4})(?:-\d{4})? (\S.*)")
LICENSE_PLACEHOLDER = re.compile(r"<\s*(year|name|copyright holders?|owner)\s*>|\[(year|fullname|name)\]|YOUR NAME", re.I)
# Deliberate markers for values that only exist once the GitHub repository does.
OWNER_PLACEHOLDER = re.compile(r"\bOWNER/")

TEXT_EXTENSIONS = {
    ".md", ".py", ".mjs", ".js", ".ts", ".tsx", ".jsx", ".css", ".json", ".yml", ".yaml", ".toml",
    ".sh", ".txt", ".html", ".svg", ".cfg", ".ini",
}
TEXT_NAMES = {"LICENSE", ".gitignore", ".gitattributes", ".editorconfig"}
MEDIA_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp", ".ico", ".mp4", ".webm", ".mov",
    ".mp3", ".wav", ".woff", ".woff2", ".ttf", ".otf", ".pdf",
}
# Media files cleared for redistribution: path -> provenance. Add an entry only with a license basis.
_BRAND = ("original artwork rendered by assets/brand/render.py (MIT); type set in Instrument Sans and "
          "Instrument Serif (SIL OFL 1.1), which permits rendering text into images")
ALLOWED_MEDIA = {
    ".claude-plugin/icon.png": _BRAND,
    "assets/banner.webp": _BRAND,
    "assets/social-preview.jpg": _BRAND,
}
MAX_FILE_BYTES = 1024 * 1024

FORBIDDEN_PATHS = [
    (re.compile(r"(^|/)\.env(\.(?!example$)[^/]+)?$"), "environment file (may hold secrets)"),
    (re.compile(r"\.(pem|key|p12|pfx)$"), "private key or certificate"),
    (re.compile(r"(^|/)id_(rsa|ecdsa|ed25519)[^/]*$"), "SSH key"),
    (re.compile(r"(^|/)\.(npmrc|pypirc|netrc)$"), "package-registry credentials file"),
    (re.compile(r"(^|/)\.claude/settings\.local\.json$|(^|/)CLAUDE\.local\.md$"), "personal Claude Code settings"),
    (re.compile(r"(^|/)(\.DS_Store|Thumbs\.db|desktop\.ini)$"), "operating-system metadata"),
    (re.compile(r"(^|/)(node_modules|__pycache__|\.venv|venv|\.pytest_cache)/"), "dependency or cache directory"),
    (re.compile(r"\.py[cod]$"), "Python bytecode"),
    (re.compile(r"^(dist|build)/|\.zip$"), "build or packaging output"),
    (re.compile(r"^evals/results/"), "local evaluation output"),
]
# Built so this file does not itself match. Values are never printed.
SECRET_PATTERNS = [
    ("Anthropic API key", re.compile("sk-" + r"ant-[A-Za-z0-9_\-]{20,}")),
    ("OpenAI-style API key", re.compile("sk-" + r"(?:proj-)?[A-Za-z0-9]{32,}")),
    ("GitHub token", re.compile("gh" + r"[pousr]_[A-Za-z0-9]{36,}|github_" + r"pat_[A-Za-z0-9_]{22,}")),
    ("AWS access key id", re.compile("AK" + r"IA[0-9A-Z]{16}")),
    ("Google API key", re.compile("AI" + r"za[0-9A-Za-z_\-]{35}")),
    ("Slack token", re.compile("xo" + r"x[abprs]-[A-Za-z0-9-]{10,}")),
    ("private key block", re.compile("-----BEGIN " + r"[A-Z ]*PRIVATE KEY-----")),
    ("credential assignment", re.compile(
        r"(?i)\b(api[_-]?key|secret|token|passw(or)?d)\b\s*[:=]\s*[\"'][A-Za-z0-9_\-/+=]{16,}[\"']")),
]
LOCAL_PATH = re.compile(r"/Users/[A-Za-z0-9._-]+/|/home/(?!runner/)[A-Za-z0-9._-]+/|[A-Za-z]:\\Users\\")

GRADER_TYPES = {"regex", "tool_used", "tool_order", "file_exists", "llm", "baseline"}


class Finding:
    def __init__(self, level, where, message):
        self.level, self.where, self.message = level, where, message

    def __str__(self):
        return f"{self.level:<5} {self.where}: {self.message}" if self.where else f"{self.level:<5} {self.message}"


def err(where, message):
    return Finding("ERROR", where, message)


def warn(where, message):
    return Finding("WARN", where, message)


def note(where, message):
    return Finding("NOTE", where, message)


# ---------------------------------------------------------------- publication set

def _git(root, *args):
    git = shutil.which("git")
    return subprocess.run(
        [git, "-c", "core.excludesFile=", "-c", "core.fsmonitor=false", *args],
        cwd=root, capture_output=True,
    )


def publication_files(root):
    """Return (sorted relative paths, method) for the files a push would publish."""
    if shutil.which("git"):
        inside = _git(root, "rev-parse", "--is-inside-work-tree")
        if inside.returncode == 0 and inside.stdout.strip() == b"true":
            out = _git(root, "ls-files", "-z", "--cached", "--others", "--exclude-standard")
            files = [p for p in out.stdout.decode("utf-8").split("\0") if p and os.path.isfile(os.path.join(root, p))]
            return sorted(files), "git index plus untracked files not ignored"
        with tempfile.TemporaryDirectory() as tmp:
            subprocess.run([shutil.which("git"), "init", "-q", tmp], check=True, capture_output=True)
            out = _git(root, "--git-dir", os.path.join(tmp, ".git"), "--work-tree", root,
                       "ls-files", "-z", "--others", "--exclude-standard")
            if out.returncode == 0:
                files = [p for p in out.stdout.decode("utf-8").split("\0") if p]
                return sorted(files), "repository .gitignore rules (not yet a git repository)"
    files = []
    for dirpath, dirs, names in os.walk(root):
        dirs[:] = sorted(d for d in dirs if d not in {".git", "node_modules", "__pycache__", "dist", ".venv"})
        files += [os.path.relpath(os.path.join(dirpath, n), root).replace(os.sep, "/") for n in names]
    return sorted(files), "approximate: git not installed, .gitignore not applied"


def is_text(path):
    name = os.path.basename(path)
    return name in TEXT_NAMES or os.path.splitext(name)[1].lower() in TEXT_EXTENSIONS


def read_text(root, rel):
    with open(os.path.join(root, rel), encoding="utf-8") as fh:
        return fh.read()


# ---------------------------------------------------------------- Markdown helpers

def strip_code(markdown):
    """Blank out fenced code blocks and inline code, keeping line numbers."""
    out, fence = [], None
    for line in markdown.split("\n"):
        m = re.match(r"\s*(`{3,}|~{3,})", line)
        if fence:
            out.append("")
            if m and m.group(1)[0] == fence[0] and len(m.group(1)) >= len(fence):
                fence = None
            continue
        if m:
            fence = m.group(1)
            out.append("")
            continue
        out.append(re.sub(r"`[^`]*`", lambda c: " " * len(c.group(0)), line))
    return out


def github_slug(heading):
    text = re.sub(r"`([^`]*)`", r"\1", heading)
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text).strip().lower()
    text = re.sub(r"[^\w\- ]", "", text)
    return text.replace(" ", "-")


def anchors(markdown):
    found, seen = set(), {}
    for line in strip_code(markdown):
        m = re.match(r"#{1,6}\s+(.*?)\s*#*\s*$", line)
        if m:
            slug = github_slug(m.group(1))
            n = seen.get(slug, 0)
            seen[slug] = n + 1
            found.add(slug if n == 0 else f"{slug}-{n}")
        found.update(re.findall(r"<a\s+(?:id|name)=\"([^\"]+)\"", line))
    return found


LINK = re.compile(r"!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+[\"'][^\"']*[\"'])?\s*\)")
REF_DEF = re.compile(r"^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)")
HTML_REF = re.compile(r"""<(?:a|img|source)\b[^>]*?\s(?:href|src)\s*=\s*["']([^"'\s]+)["']""", re.I)


def markdown_links(markdown):
    """Yield (line number, target) for every link outside code."""
    for i, line in enumerate(strip_code(markdown), 1):
        for target in LINK.findall(line) + HTML_REF.findall(line):
            yield i, target
        m = REF_DEF.match(line)
        if m:
            yield i, m.group(1)


# ---------------------------------------------------------------- checks

def check_required(root, files):
    published = set(files)
    out = []
    for rel in REQUIRED_FILES:
        if not os.path.isfile(os.path.join(root, rel)):
            out.append(err(rel, "required file is missing"))
        elif rel not in published:
            out.append(err(rel, "required file exists but is excluded by .gitignore"))
    for top in MUST_PUBLISH_DIRS:
        for dirpath, dirs, names in os.walk(os.path.join(root, top)):
            dirs[:] = [d for d in dirs if d not in {"__pycache__", "node_modules", "results"}]
            for n in names:
                rel = os.path.relpath(os.path.join(dirpath, n), root).replace(os.sep, "/")
                if n in {".DS_Store", "Thumbs.db"} or n.endswith(".pyc"):
                    continue
                if rel not in published:
                    out.append(err(rel, "file is excluded by .gitignore but belongs to the published project"))
    return out


def check_license(root, files):
    out = []
    try:
        text = read_text(root, "LICENSE")
    except OSError:
        return [err("LICENSE", "missing")]
    lines = text.split("\n")
    if lines[0].strip() != "MIT License":
        out.append(err("LICENSE:1", "first line must be 'MIT License'"))
    m = COPYRIGHT_LINE.fullmatch(lines[2].strip()) if len(lines) > 2 else None
    if not m:
        out.append(err("LICENSE:3", "expected 'Copyright (c) <year> <holder>'"))
    if LICENSE_PLACEHOLDER.search(text) or OWNER_PLACEHOLDER.search(text):
        out.append(err("LICENSE", "unresolved placeholder in license text"))
    body = "\n".join(lines[4:])
    if body.strip() != MIT_BODY.strip():
        out.append(err("LICENSE", "text differs from the standard MIT license body"))
    readme = read_text(root, "README.md") if os.path.isfile(os.path.join(root, "README.md")) else ""
    if not re.search(r"^## Licen[cs]e\s*$", readme, re.M) or "MIT" not in readme or "(LICENSE)" not in readme:
        out.append(err("README.md", "needs a '## License' section that names MIT and links to LICENSE"))
    for rel in files:
        if is_text(rel) and os.path.splitext(rel)[1] in {".py", ".mjs", ".js", ".sh", ".yml", ".yaml"}:
            for i, line in enumerate(read_text(root, rel).split("\n")[:5], 1):
                m = re.search(r"SPDX-License-Identifier:\s*(\S+)", line)
                if m and m.group(1) != "MIT":
                    out.append(err(f"{rel}:{i}", f"SPDX identifier {m.group(1)} conflicts with the MIT license"))
    return out


def _load_json(root, rel, out):
    try:
        return json.loads(read_text(root, rel))
    except FileNotFoundError:
        out.append(err(rel, "missing"))
    except json.JSONDecodeError as e:
        out.append(err(f"{rel}:{e.lineno}:{e.colno}", f"invalid JSON: {e.msg}"))
    return None


def _https_url(value):
    p = urllib.parse.urlparse(value) if isinstance(value, str) else None
    return bool(p and p.scheme == "https" and p.netloc)


def check_manifests(root, files):
    out = []
    pj = ".claude-plugin/plugin.json"
    plugin = _load_json(root, pj, out)
    if isinstance(plugin, dict):
        for k in sorted(set(plugin) - PLUGIN_KEYS):
            out.append(err(pj, f"unknown field '{k}' (Claude Code strips it; `claude plugin validate --strict` fails)"))
        if plugin.get("name") != PLUGIN_NAME:
            out.append(err(pj, f"name must be '{PLUGIN_NAME}' (the published identifier is permanent)"))
        if plugin.get("displayName") != DISPLAY_NAME:
            out.append(err(pj, f"displayName must be '{DISPLAY_NAME}'"))
        if not SEMVER.fullmatch(str(plugin.get("version", ""))):
            out.append(err(pj, "version must be a semantic version such as 0.1.0"))
        if not str(plugin.get("description", "")).strip():
            out.append(err(pj, "description is required"))
        author = plugin.get("author")
        if not (isinstance(author, dict) and str(author.get("name", "")).strip()):
            out.append(err(pj, "author.name is required"))
        if plugin.get("license") != "MIT":
            out.append(err(pj, "license must be 'MIT'"))
        for key in ("homepage", "repository", "documentationUrl", "supportUrl"):
            if key in plugin and not _https_url(plugin[key]):
                out.append(err(pj, f"{key} must be an https:// URL"))
        if "icon" in plugin and not os.path.isfile(os.path.join(root, plugin["icon"])):
            out.append(err(pj, f"icon path does not exist: {plugin['icon']}"))
        kw = plugin.get("keywords", [])
        if not (isinstance(kw, list) and all(isinstance(k, str) for k in kw)):
            out.append(err(pj, "keywords must be an array of strings"))
    mj = ".claude-plugin/marketplace.json"
    market = _load_json(root, mj, out)
    if isinstance(market, dict):
        for k in sorted(set(market) - MARKETPLACE_KEYS):
            out.append(err(mj, f"unknown field '{k}'"))
        name = str(market.get("name", ""))
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", name) or ".." in name:
            out.append(err(mj, "name must use letters, digits, '.', '_' or '-' and start with a letter or digit"))
        if re.match(r"(claude|anthropic)", name, re.I):
            out.append(err(mj, "name must not start with 'claude' or 'anthropic' (reserved)"))
        if not str((market.get("owner") or {}).get("name", "")).strip():
            out.append(err(mj, "owner.name is required"))
        if not str(market.get("description", "")).strip():
            out.append(err(mj, "description is missing (`claude plugin validate --strict` warns)"))
        entries = market.get("plugins")
        if not isinstance(entries, list) or not entries:
            out.append(err(mj, "plugins must list at least one plugin"))
            entries = []
        names = [e.get("name") for e in entries if isinstance(e, dict)]
        if len(names) != len(set(names)):
            out.append(err(mj, "duplicate plugin names"))
        for idx, entry in enumerate(entries):
            where = f"{mj} plugins[{idx}]"
            if not isinstance(entry, dict):
                out.append(err(where, "entry must be an object"))
                continue
            for k in sorted(set(entry) - ENTRY_KEYS):
                out.append(err(where, f"unknown field '{k}'"))
            src = entry.get("source")
            if not isinstance(src, str):
                out.append(err(where, "source must be a relative path for a plugin hosted in this repository"))
                continue
            if not (src in (".", "./") or src.startswith("./")) or ".." in src.split("/"):
                out.append(err(where, f"source '{src}' must start with './' and stay inside the repository"))
                continue
            target = os.path.normpath(os.path.join(root, src))
            if not os.path.isfile(os.path.join(target, ".claude-plugin", "plugin.json")):
                out.append(err(where, f"source '{src}' has no .claude-plugin/plugin.json"))
            elif isinstance(plugin, dict) and os.path.samefile(target, root) and entry.get("name") != plugin.get("name"):
                out.append(err(where, "entry name must equal the plugin.json name"))
            if isinstance(plugin, dict) and "version" in entry and entry["version"] != plugin.get("version"):
                out.append(warn(where, "entry version differs from plugin.json (plugin.json wins at install)"))
    return out


def check_versions(root, files):
    out, versions = [], {}
    try:
        versions[".claude-plugin/plugin.json"] = json.loads(read_text(root, ".claude-plugin/plugin.json")).get("version")
    except (OSError, json.JSONDecodeError):
        pass
    rep = validate_skill.validate_skill(os.path.join(root, SKILL))
    versions[f"{SKILL}/SKILL.md metadata.version"] = (rep.info or {}).get("version")
    try:
        with open(os.path.join(root, "pyproject.toml"), "rb") as fh:
            versions["pyproject.toml"] = tomllib.load(fh).get("project", {}).get("version")
    except (OSError, tomllib.TOMLDecodeError) as e:
        out.append(err("pyproject.toml", f"cannot read project version: {e}"))
    try:
        m = re.search(r"^## \[(\d+\.\d+\.\d+[^\]]*)\]", read_text(root, "CHANGELOG.md"), re.M)
        versions["CHANGELOG.md latest release"] = m.group(1) if m else None
    except OSError:
        pass
    distinct = {v for v in versions.values() if v}
    if len(distinct) > 1 or any(v is None for v in versions.values()):
        detail = ", ".join(f"{k}={v!r}" for k, v in versions.items())
        out.append(err("versions", f"must all be set and equal: {detail}"))
    return out


def check_skill(root, files):
    rep = validate_skill.validate_skill(os.path.join(root, SKILL))
    out = [err(SKILL, e) for e in rep.errors]
    out += [warn(SKILL, w) for w in rep.warnings] + [note(SKILL, n) for n in rep.notes]
    if rep.info.get("license") != "MIT":
        out.append(err(f"{SKILL}/SKILL.md", "frontmatter license must be MIT"))
    return out


def _published_dir(rel, published):
    prefix = rel.rstrip("/") + "/"
    return any(p.startswith(prefix) for p in published)


def check_links(root, files):
    out, published = [], set(files)
    anchor_cache = {}
    skill_root = SKILL + "/"
    for rel in files:
        if not rel.endswith(".md"):
            continue
        text = read_text(root, rel)
        base = os.path.dirname(rel)
        for line_no, target in markdown_links(text):
            if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", target):
                continue
            path, _, frag = target.partition("#")
            path = urllib.parse.unquote(path)
            if "\\" in path:
                out.append(err(f"{rel}:{line_no}", f"use forward slashes in link: {target}"))
                continue
            resolved = os.path.normpath(os.path.join(base, path)).replace(os.sep, "/") if path else rel
            if resolved.startswith("../") or resolved == "..":
                out.append(err(f"{rel}:{line_no}", f"link leaves the repository: {target}"))
                continue
            if resolved.startswith(GENERATED_PREFIXES):
                continue
            if resolved not in published and not _published_dir(resolved, published):
                exists = os.path.exists(os.path.join(root, resolved))
                why = "target is not published (ignored by .gitignore)" if exists else "target does not exist"
                out.append(err(f"{rel}:{line_no}", f"broken link {target}: {why}"))
                continue
            if frag and resolved.endswith(".md") and resolved in published:
                if resolved not in anchor_cache:
                    anchor_cache[resolved] = anchors(read_text(root, resolved))
                if frag not in anchor_cache[resolved]:
                    out.append(err(f"{rel}:{line_no}", f"anchor #{frag} not found in {resolved}"))
        # Backtick path references such as `scripts/package_skill.py`.
        in_skill = rel.startswith(skill_root)
        for i, line in enumerate(text.split("\n"), 1):
            for token in re.findall(r"`([^`\s]+)`", line):
                token = token.rstrip(".,;:")
                if re.search(r"[<>*{}$|]", token) or "://" in token:
                    continue
                if in_skill and token.startswith(("references/", "scripts/", "assets/")):
                    candidate = skill_root + token
                elif not in_skill and token.startswith(REPO_PATH_PREFIXES):
                    # Inside the skill, other paths describe the user's project, not this repository.
                    candidate = token
                elif in_skill and re.fullmatch(r"[a-z0-9-]+\.md", token):
                    hits = [p for p in (f"{skill_root}references/{token}", f"{skill_root}assets/{token}") if p in published]
                    if not hits:
                        out.append(err(f"{rel}:{i}", f"`{token}` is not a file in references/ or assets/"))
                    continue
                else:
                    continue
                candidate = candidate.rstrip("/")
                if candidate.startswith(GENERATED_PREFIXES) or candidate + "/" in GENERATED_PREFIXES:
                    continue
                if candidate not in published and not _published_dir(candidate, published):
                    out.append(err(f"{rel}:{i}", f"path `{token}` does not exist in the published repository"))
    return out


def check_text_hygiene(root, files):
    out = []
    for rel in files:
        if not is_text(rel):
            continue
        raw = Path(root, rel).read_bytes()
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError as e:
            out.append(err(rel, f"not valid UTF-8 (byte {e.start})"))
            continue
        if not text:
            continue
        if "\r" in text:
            out.append(err(rel, "contains CR line endings; use LF"))
        if not text.endswith("\n"):
            out.append(err(rel, "missing final newline"))
        elif text.endswith("\n\n"):
            out.append(err(rel, "blank line at end of file"))
        bad = []
        for i, line in enumerate(text.split("\n"), 1):
            if line != line.rstrip(" \t"):
                bad.append(i)
            if re.match(r"(<{7}|>{7})( |$)", line):
                out.append(err(f"{rel}:{i}", "merge conflict marker"))
            if re.match(r" +\t", line):
                out.append(err(f"{rel}:{i}", "space before tab in indentation"))
            if rel.endswith((".yml", ".yaml")) and line.startswith("\t"):
                out.append(err(f"{rel}:{i}", "tab indentation is invalid in YAML"))
        if bad:
            shown = ", ".join(map(str, bad[:5])) + (f" (+{len(bad) - 5} more)" if len(bad) > 5 else "")
            out.append(err(rel, f"trailing whitespace on line(s) {shown}"))
    return out


def check_syntax(root, files):
    out = []
    for rel in files:
        if rel.endswith(".py"):
            try:
                ast.parse(read_text(root, rel), rel, feature_version=PYTHON_FEATURE_VERSION)
            except SyntaxError as e:
                out.append(err(f"{rel}:{e.lineno}", f"Python {'.'.join(map(str, PYTHON_FEATURE_VERSION))} syntax error: {e.msg}"))
    shell = [rel for rel in files if rel.endswith(".sh")]
    bash = shutil.which("bash")
    if shell and not bash:
        out.append(note("", f"bash not found: {len(shell)} shell script(s) NOT syntax-checked"))
    for rel in shell if bash else []:
        r = subprocess.run([bash, "-n", os.path.join(root, rel)], capture_output=True, text=True)
        if r.returncode:
            out.append(err(rel, f"bash -n failed: {r.stderr.strip()}"))
    return out


def check_workflows(root, files):
    out = []
    flows = [rel for rel in files if rel.startswith(".github/workflows/") and rel.endswith((".yml", ".yaml"))]
    for rel in flows:
        text = read_text(root, rel)
        lines = text.split("\n")
        if "pull_request_target" in text:
            out.append(err(rel, "pull_request_target must not be used (runs untrusted code with privileges)"))
        if not re.search(r"^permissions:", text, re.M):
            out.append(err(rel, "declare top-level 'permissions:' (least privilege)"))
        for i, line in enumerate(lines, 1):
            code = line.split("#", 1)[0]
            if re.search(r":\s*write\b|write-all", code):
                out.append(err(f"{rel}:{i}", "write permission granted; this repository's workflows need read only"))
            if "secrets." in code:
                out.append(err(f"{rel}:{i}", "workflow references secrets; free CI must not need any"))
            if re.search(r"plugin\s+eval|evals\.py\s+run", code):
                out.append(err(f"{rel}:{i}", "paid model evaluations must stay opt-in and out of workflows"))
            m = re.match(r"\s*-?\s*uses:\s*([^\s#]+)\s*(#.*)?$", line)
            if m and not m.group(1).startswith(("./", "docker://")):
                ref = m.group(1)
                if not re.fullmatch(r"[\w.-]+/[\w./-]+@[0-9a-f]{40}", ref):
                    out.append(err(f"{rel}:{i}", f"action '{ref}' must be pinned to a full 40-character commit SHA"))
                elif not (m.group(2) and re.search(r"v\d", m.group(2))):
                    out.append(err(f"{rel}:{i}", f"pinned action '{ref.split('@')[0]}' needs a '# vX.Y.Z' version comment"))
        if text.count("runs-on:") != text.count("timeout-minutes:"):
            out.append(err(rel, "every job needs timeout-minutes"))
        if "actions/checkout@" in text and "persist-credentials: false" not in text:
            out.append(warn(rel, "set persist-credentials: false on actions/checkout"))
    ci = ".github/workflows/ci.yml"
    if ci in files:
        text = read_text(root, ci)
        for trigger in ("pull_request:", "push:", "workflow_dispatch:"):
            if not re.search(rf"^\s+{trigger}", text, re.M):
                out.append(err(ci, f"missing trigger {trigger.rstrip(':')}"))
    dep = ".github/dependabot.yml"
    if dep in files and not re.search(r"package-ecosystem:\s*\"?github-actions\"?", read_text(root, dep)):
        out.append(err(dep, "must update github-actions"))
    return out


def parse_case_frontmatter(text):
    if not text.startswith("---\n") or text.find("\n---", 4) < 0:
        return None
    data = {}
    for line in text[4:text.find("\n---", 4)].splitlines():
        k, sep, v = line.partition(":")
        if sep and not line.startswith((" ", "\t")):
            data[k.strip()] = v.strip()
    return data


def check_evals(root, files):
    out = []
    evals = os.path.join(root, "evals")
    if not os.path.isdir(evals):
        return [err("evals", "eval suite directory is missing")]
    cases = [d for d in sorted(os.listdir(evals)) if os.path.isdir(os.path.join(evals, d)) and d not in {"fixtures", "results", "mocks"}]
    if len(cases) < 3:
        out.append(err("evals", f"{len(cases)} case(s); the skill authoring guidance asks for at least 3"))
    for case in cases:
        base = f"evals/{case}"
        prompt = f"{base}/prompt.md"
        if prompt not in files:
            out.append(err(base, "missing prompt.md"))
            continue
        fm = parse_case_frontmatter(read_text(root, prompt))
        if fm is None or not fm.get("description"):
            out.append(err(prompt, "frontmatter with a description is required"))
        graders = [f for f in files if f.startswith(f"{base}/graders/") and f.endswith(".md")]
        if not graders:
            out.append(err(base, "no graders/*.md"))
        for g in graders:
            gfm = parse_case_frontmatter(read_text(root, g)) or {}
            if gfm.get("type") not in GRADER_TYPES:
                out.append(err(g, f"grader type must be one of {', '.join(sorted(GRADER_TYPES))}"))
        case_yaml = f"{base}/case.yaml"
        if case_yaml in files:
            text = read_text(root, case_yaml)
            m = re.search(r"^name:\s*(\S+)", text, re.M)
            if not m or m.group(1) != case:
                out.append(err(case_yaml, f"name must equal the directory name '{case}'"))
            s = re.search(r"scaffold_script:\s*(\S+)", text)
            if s and f"{base}/{s.group(1)}" not in files:
                out.append(err(case_yaml, f"scaffold_script {s.group(1)} does not exist"))
    return out


def check_publication(root, files):
    out = []
    for rel in files:
        for pattern, why in FORBIDDEN_PATHS:
            if pattern.search(rel):
                out.append(err(rel, f"{why} must not be published; add it to .gitignore"))
                break
        ext = os.path.splitext(rel)[1].lower()
        if ext in MEDIA_EXTENSIONS and rel not in ALLOWED_MEDIA:
            reason = "third-party website screenshot" if rel.startswith("research/captures/") else "media file"
            out.append(err(rel, f"{reason} without recorded license provenance (see CONTRIBUTING.md)"))
        size = os.path.getsize(os.path.join(root, rel))
        if size > MAX_FILE_BYTES:
            out.append(err(rel, f"{size // 1024} KiB exceeds the {MAX_FILE_BYTES // 1024} KiB limit for committed files"))
        if not is_text(rel):
            continue
        try:
            text = read_text(root, rel)
        except UnicodeDecodeError:
            continue
        for i, line in enumerate(text.split("\n"), 1):
            for label, pattern in SECRET_PATTERNS:
                if pattern.search(line):
                    out.append(err(f"{rel}:{i}", f"possible {label} (value not shown); remove it and rotate the credential"))
            if LOCAL_PATH.search(line):
                out.append(err(f"{rel}:{i}", "machine-specific absolute path"))
            if OWNER_PLACEHOLDER.search(line) and not rel.startswith(("scripts/", "tests/")):
                out.append(warn(f"{rel}:{i}", "OWNER placeholder: replace with the GitHub owner once the repository exists"))
    return out


CHECKS = [
    ("required files", check_required),
    ("license", check_license),
    ("plugin and marketplace manifests", check_manifests),
    ("version consistency", check_versions),
    ("skill metadata and structure", check_skill),
    ("internal links and paths", check_links),
    ("text hygiene", check_text_hygiene),
    ("script syntax", check_syntax),
    ("workflow security", check_workflows),
    ("eval suite structure", check_evals),
    ("publication safety", check_publication),
]


def run_checks(root=ROOT):
    files, method = publication_files(root)
    results = []
    for name, fn in CHECKS:
        try:
            findings = fn(root, files)
        except Exception as e:  # report, don't hide, a crashing check
            findings = [err(name, f"check crashed: {type(e).__name__}: {e}")]
        results.append((name, findings))
    return files, method, results


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--root", default=ROOT)
    args = ap.parse_args(argv)
    root = os.path.abspath(args.root)
    files, method, results = run_checks(root)
    print(f"validate_repository: {root}")
    print(f"  publication set: {len(files)} files ({method})")
    errors = 0
    for name, findings in results:
        n_err = sum(f.level == "ERROR" for f in findings)
        errors += n_err
        print(f"  {'FAIL' if n_err else 'PASS'}  {name}")
        for f in findings:
            print(f"        {f}")
    print(f"  RESULT: {'FAIL' if errors else 'PASS'} ({errors} error(s))")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
