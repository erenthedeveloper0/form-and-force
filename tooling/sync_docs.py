#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Regenerate the documentation tables that are copies of a source of truth.

Some reference pages list what a data file or the skill already defines: the
deck's registers, lenses, structures and media (scripts/deck.json), and the
component atlas's index (references/component-atlas.md). Those tables sit
between markers in the Markdown, so the prose around them stays hand-written:

    <!-- generated:deck-lenses -->  ...  <!-- /generated -->

Usage:
  python3 tooling/sync_docs.py           rewrite every generated block
  python3 tooling/sync_docs.py --check   exit 1 if any block differs from its source (CI)
Standard library only.
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL = os.path.join(ROOT, "skills", "form-and-force")
BLOCK = re.compile(r"(<!-- generated:([a-z-]+) -->\n)(.*?)(<!-- /generated -->)", re.S)


def cell(text):
    return str(text).replace("|", "\\|").replace("\n", " ")


def table(head, rows):
    out = ["| " + " | ".join(head) + " |", "|" + "---|" * len(head)]
    out += ["| " + " | ".join(cell(c) for c in r) + " |" for r in rows]
    return "\n".join(out) + "\n"


def deck():
    with open(os.path.join(SKILL, "scripts", "deck.json"), encoding="utf-8") as fh:
        return json.load(fh)


def atlas():
    with open(os.path.join(SKILL, "references", "component-atlas.md"), encoding="utf-8") as fh:
        text = fh.read()
    parts = re.split(r"^## (\d+)\. (.+)$", text, flags=re.M)
    for k in range(1, len(parts), 3):
        for chunk in re.split(r"^(?=### )", parts[k + 2], flags=re.M)[1:]:
            name, _, body = chunk.partition("\n")
            sev = re.search(r"\*\*Severity:\*\*\s*(.+?)\.\s*\*\*Evidence", body)
            job = re.search(r"\*\*Job:\*\*\s*(.+)", body)
            yield int(parts[k]), parts[k + 1], name[4:].strip(), sev.group(1).strip() if sev else "", job.group(1).strip() if job else "See the entry"


def generate(name):
    d = deck()
    levels = {r["level"]: r["name"] for r in d["registers"]}
    if name == "deck-registers":
        return table(["Register", "Motto", "For", "Timid looks like", "Overwrought looks like"],
                     [[f"**{r['name']}** (`{r['id']}`)", r["motto"], r["for"], r["timid"], r["overwrought"]] for r in d["registers"]])
    if name == "deck-lens-families":
        return table(["Family", "What its lenses do"], [[f"`{k}`", v] for k, v in d["lensFamilies"].items()])
    if name == "deck-lenses":
        return table(["Lens", "Family", "The question"],
                     [[f"**{l['name']}** (`{l['id']}`)" + (f", {len(l['variants'])} variants" if l.get("variants") else ""),
                       f"`{l['family']}`", l["ask"]] for l in d["lenses"]])
    if name == "deck-structure-families":
        return table(["Family", "What its structures do"], [[f"`{k}`", v] for k, v in d["archetypeFamilies"].items()])
    if name == "deck-structures":
        return table(["Structure", "Family", "Registers", "Principle"],
                     [[f"**{a['name']}** (`{a['id']}`)", f"`{a['family']}`", ", ".join(levels[n] for n in a["registers"]), a["principle"]]
                      for a in d["archetypes"]])
    if name == "deck-media":
        return table(["Lead medium", "Needs", "From register", "What carries the frame"],
                     [[f"**{m['name']}** (`{m['id']}`)", ", ".join(f"`{n}`" for n in m["needs"]) or "nothing", levels[m["minRegister"]], m["note"]]
                      for m in d["media"]])
    if name == "atlas-index":
        rows = [[f"{n}. {section}", name_, sev, job] for n, section, name_, sev, job in atlas()]
        return f"{len(rows)} components.\n\n" + table(["Section", "Component", "Severity", "Job"], rows)
    raise KeyError(name)


def sync(path, check):
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    stale = []

    def replace(m):
        fresh = generate(m.group(2))
        if m.group(3) != fresh:
            stale.append(m.group(2))
        return m.group(1) + fresh + m.group(4)

    new = BLOCK.sub(replace, text)
    if stale and not check:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(new)
    return stale


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--check", action="store_true", help="report stale blocks without writing")
    args = ap.parse_args(argv)
    problems = 0
    for dirpath, _, names in os.walk(os.path.join(ROOT, "docs")):
        for n in sorted(names):
            if not n.endswith(".md"):
                continue
            path = os.path.join(dirpath, n)
            rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
            try:
                stale = sync(path, args.check)
            except KeyError as e:
                print(f"  ERROR {rel}: unknown generated block {e}")
                problems += 1
                continue
            for block in stale:
                print(f"  {'STALE' if args.check else 'UPDATED'} {rel}: {block}")
            problems += len(stale) if args.check else 0
    print("sync_docs:", "FAIL (run python3 tooling/sync_docs.py)" if problems else "PASS")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
