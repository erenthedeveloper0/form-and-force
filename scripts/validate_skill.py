#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Validate an Agent Skill directory against the published rules.

Checks (sources: platform.claude.com Agent Skills overview + best practices,
agentskills.io specification, code.claude.com skills docs):
  - SKILL.md exists, frontmatter starts on line 1
  - name: 1-64 chars, [a-z0-9-], no leading/trailing/double hyphen,
    no "anthropic"/"claude", no XML, equals the directory name
  - description: 1-1024 chars, no XML tags, third person (heuristic)
  - compatibility <= 500 chars; metadata values are strings
  - only portable top-level keys (others hard-fail on claude.ai / API upload)
  - body < 500 lines; estimated tokens < 5000 (warning)
  - every local markdown link in SKILL.md resolves; forward slashes only
  - every file in references/ is linked directly from SKILL.md (one level deep)
  - reference files over 100 lines have a "## Contents" section
  - every ${CLAUDE_SKILL_DIR}/... path in the skill's Markdown resolves
  - no time-bound phrasing ("before August 2025") in skill files (warning)
  - scripts: .mjs/.js pass `node --check` (reported as not run without node)

Usage: python3 scripts/validate_skill.py [skill-dir]
Default skill-dir: skills/form-and-force. Exit 1 on errors; warnings do not fail.
"""
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

PORTABLE_KEYS = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
DEFAULT_SKILL = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "skills", "form-and-force")
SKILL_DIR_REF = re.compile(r"\$\{CLAUDE_SKILL_DIR\}/([A-Za-z0-9_./-]+)")
TIME_BOUND = re.compile(
    r"\b(before|after|until|as of)\s+(January|February|March|April|May|June|July|August|"
    r"September|October|November|December)\s+20\d\d",
    re.I,
)


class Report:
    """Errors fail validation; warnings and notes are informational."""

    def __init__(self):
        self.errors, self.warnings, self.notes = [], [], []
        self.info = {}

    @property
    def ok(self):
        return not self.errors


def parse_frontmatter(text):
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---", 4)
    if end < 0:
        return None, text
    raw = text[4:end]
    body = text[end + 4:].lstrip("\n")
    data, current = {}, None
    for line in raw.splitlines():
        if not line.strip():
            continue
        if line.startswith((" ", "\t")) and current:
            k, _, v = line.strip().partition(":")
            data.setdefault(current, {})
            if isinstance(data[current], dict):
                data[current][k.strip()] = v.strip()
            continue
        k, _, v = line.partition(":")
        current = k.strip()
        data[current] = v.strip() if v.strip() else {}
    return data, body


def unquote(value):
    if isinstance(value, str) and len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def local_links(markdown):
    """Relative link targets in a Markdown document, without anchors."""
    return [l for l in re.findall(r"\]\(([^)#\s]+)(?:#[^)]*)?\)", markdown) if not re.match(r"[a-z]+:", l)]


def validate_skill(root):
    root = os.path.abspath(root)
    rep = Report()
    skill_md = os.path.join(root, "SKILL.md")
    if not os.path.isfile(skill_md):
        rep.errors.append(f"{skill_md}: SKILL.md not found")
        return rep
    text = Path(skill_md).read_text(encoding="utf-8")
    fm, body = parse_frontmatter(text)
    if fm is None:
        rep.errors.append("SKILL.md: frontmatter must start on line 1 with '---' and close with '---'")
        fm, body = {}, text

    name = fm.get("name", "")
    desc = fm.get("description", "")
    if not name:
        rep.errors.append("SKILL.md: name is required")
    else:
        if len(name) > 64:
            rep.errors.append(f"SKILL.md: name is {len(name)} chars (max 64)")
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name):
            rep.errors.append("SKILL.md: name must be lowercase letters/digits/single hyphens, no leading/trailing hyphen")
        if re.search(r"anthropic|claude", name):
            rep.errors.append("SKILL.md: name must not contain 'anthropic' or 'claude'")
        if name != os.path.basename(root):
            rep.errors.append(f"SKILL.md: name '{name}' must match directory '{os.path.basename(root)}'")
    if not desc:
        rep.errors.append("SKILL.md: description is required")
    else:
        if len(desc) > 1024:
            rep.errors.append(f"SKILL.md: description is {len(desc)} chars (max 1024)")
        if re.search(r"<[A-Za-z/][^>]*>", desc):
            rep.errors.append("SKILL.md: description must not contain XML tags")
        if re.match(r"(I|I'm|You|We)\b", desc):
            rep.warnings.append("SKILL.md: description should be third person (avoid starting with I/You/We)")
        if not re.search(r"\b[Uu]se (when|for|this)\b", desc):
            rep.warnings.append("SKILL.md: description should say when to use the skill ('Use when …')")
    comp = fm.get("compatibility")
    if isinstance(comp, str) and len(comp) > 500:
        rep.errors.append(f"SKILL.md: compatibility is {len(comp)} chars (max 500)")
    meta = fm.get("metadata")
    if isinstance(meta, dict):
        for k, v in meta.items():
            if not (v.startswith('"') and v.endswith('"')) and not re.fullmatch(r"[A-Za-z][\w .-]*", v):
                rep.warnings.append(f"SKILL.md: metadata.{k} should be a quoted string")
    for k in fm:
        if k not in PORTABLE_KEYS:
            rep.warnings.append(f"SKILL.md: frontmatter key '{k}' is Claude Code-only; uploads to claude.ai/API reject it")

    lines = body.splitlines()
    if len(lines) >= 500:
        rep.errors.append(f"SKILL.md: body has {len(lines)} lines (keep under 500)")
    est_tokens = len(body) // 4
    if est_tokens > 5000:
        rep.warnings.append(f"SKILL.md: body ≈ {est_tokens} tokens (recommended < 5000)")

    linked = set()
    for link in local_links(body):
        if "\\" in link:
            rep.errors.append(f"SKILL.md: backslash in path: {link}")
        target = os.path.normpath(os.path.join(root, link))
        if not os.path.exists(target):
            rep.errors.append(f"SKILL.md: broken link: {link}")
        linked.add(os.path.relpath(target, root).replace(os.sep, "/"))

    ref_dir = os.path.join(root, "references")
    if os.path.isdir(ref_dir):
        for f in sorted(os.listdir(ref_dir)):
            if not f.endswith(".md"):
                continue
            rel = f"references/{f}"
            if rel not in linked:
                rep.errors.append(f"{rel}: not linked directly from SKILL.md (keep references one level deep)")
            content = Path(ref_dir, f).read_text(encoding="utf-8")
            if content.count("\n") > 100 and not re.search(r"^## Contents", content, re.M):
                rep.errors.append(f"{rel}: over 100 lines and has no '## Contents' section")

    for dirpath, dirs, files in os.walk(root):
        dirs.sort()
        for f in sorted(files):
            if not f.endswith(".md"):
                continue
            p = os.path.join(dirpath, f)
            rel = os.path.relpath(p, root).replace(os.sep, "/")
            for i, ln in enumerate(Path(p).read_text(encoding="utf-8").split("\n"), 1):
                if TIME_BOUND.search(ln):
                    rep.warnings.append(f"{rel}:{i}: time-bound phrasing")
                for ref in SKILL_DIR_REF.findall(ln):
                    if not os.path.exists(os.path.join(root, ref.rstrip("."))):
                        rep.errors.append(f"{rel}:{i}: ${{CLAUDE_SKILL_DIR}}/{ref} does not exist in the skill")

    scripts = os.path.join(root, "scripts")
    js = sorted(f for f in os.listdir(scripts) if f.endswith((".mjs", ".js"))) if os.path.isdir(scripts) else []
    node = shutil.which("node")
    if js and not node:
        rep.notes.append(f"node not found: JavaScript syntax of {len(js)} script(s) NOT checked")
    for f in js if node else []:
        r = subprocess.run([node, "--check", os.path.join(scripts, f)], capture_output=True, text=True)
        if r.returncode:
            detail = r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "unknown error"
            rep.errors.append(f"scripts/{f}: fails node --check: {detail}")

    rep.info = {
        "name": name,
        "version": unquote(meta.get("version")) if isinstance(meta, dict) else None,
        "license": fm.get("license"),
        "description_chars": len(desc),
        "body_lines": len(lines),
        "est_tokens": est_tokens,
        "references_linked": len([l for l in linked if l.startswith("references/")]),
        "js_checked": len(js) if node else 0,
    }
    return rep


def main(argv):
    if len(argv) > 2 or (len(argv) == 2 and argv[1] in ("-h", "--help")):
        print(__doc__)
        return 2
    root = os.path.abspath(argv[1] if len(argv) == 2 else DEFAULT_SKILL)
    rep = validate_skill(root)
    i = rep.info
    print(f"validate_skill: {root}")
    if i:
        print(f"  name={i['name']!r}  description={i['description_chars']} chars  "
              f"body={i['body_lines']} lines (~{i['est_tokens']} tokens)")
        print(f"  references linked: {i['references_linked']}  scripts syntax-checked: {i['js_checked']}")
    for n in rep.notes:
        print(f"  NOTE  {n}")
    for w in rep.warnings:
        print(f"  WARN  {w}")
    for e in rep.errors:
        print(f"  ERROR {e}")
    print("  RESULT:", "PASS" if rep.ok else "FAIL")
    return 0 if rep.ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
