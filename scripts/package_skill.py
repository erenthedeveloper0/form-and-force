#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Build and verify the standalone skill ZIP for claude.ai or the Skills API.

The archive holds one top-level folder, form-and-force/, containing SKILL.md,
references/, scripts/, assets/ and a copy of the repository LICENSE. Only the
skill is packaged: no research, evals, tests or repository tooling. Entries are
sorted, timestamped with a fixed date and given fixed permissions, so the same
sources always produce the same bytes.

Usage:
  python3 scripts/package_skill.py                build dist/form-and-force-<version>.zip, then verify it
  python3 scripts/package_skill.py --out DIR      write the ZIP into DIR instead of dist/
  python3 scripts/package_skill.py --verify ZIP   verify an existing ZIP without building
The skill is validated first; nothing is written if validation fails.
"""
import argparse
import hashlib
import io
import os
import posixpath
import re
import sys
import tempfile
import zipfile
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import validate_repository  # noqa: E402
import validate_skill  # noqa: E402

ROOT = validate_repository.ROOT
SKILL_NAME = "form-and-force"
FIXED_TIME = (1980, 1, 1, 0, 0, 0)
EXCLUDED_PARTS = {".DS_Store", "Thumbs.db", "__pycache__", "node_modules", ".git"}
FORBIDDEN_TOP = {"research", "evals", "tests", ".github", ".claude-plugin", "dist", "docs"}
IMPORT = re.compile(r"""^\s*(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]""", re.M)


def skill_sources(root):
    """(archive name, absolute path) pairs, from the publication set so local builds match CI."""
    files, _ = validate_repository.publication_files(root)
    prefix = f"skills/{SKILL_NAME}/"
    chosen = []
    for rel in files:
        if not rel.startswith(prefix):
            continue
        parts = rel.split("/")
        if EXCLUDED_PARTS.intersection(parts) or rel.endswith((".pyc", ".pyo")):
            continue
        path = os.path.join(root, rel)
        if os.path.islink(path):
            raise SystemExit(f"error: {rel} is a symlink; the skill must contain regular files only")
        chosen.append((f"{SKILL_NAME}/{rel[len(prefix):]}", path))
    if f"{SKILL_NAME}/LICENSE" not in {name for name, _ in chosen}:
        chosen.append((f"{SKILL_NAME}/LICENSE", os.path.join(root, "LICENSE")))
    return sorted(chosen)


def build(root, out_dir):
    rep = validate_skill.validate_skill(os.path.join(root, "skills", SKILL_NAME))
    if not rep.ok:
        for e in rep.errors:
            print(f"  ERROR {e}")
        raise SystemExit("error: skill validation failed; nothing was packaged")
    version = rep.info["version"]
    sources = skill_sources(root)
    os.makedirs(out_dir, exist_ok=True)
    target = os.path.join(out_dir, f"{SKILL_NAME}-{version}.zip")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for name, path in sources:
            data = Path(path).read_bytes()
            info = zipfile.ZipInfo(name, FIXED_TIME)
            info.create_system = 3
            info.external_attr = (0o100755 if data.startswith(b"#!") else 0o100644) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(info, data)
    fd, tmp = tempfile.mkstemp(dir=out_dir, suffix=".zip.tmp")
    with os.fdopen(fd, "wb") as fh:
        fh.write(buf.getvalue())
    os.replace(tmp, target)
    return target, [name for name, _ in sources]


def verify(zip_path, expected=None):
    """Return (errors, info) for an archive; errors name the member and problem."""
    errors = []
    try:
        zf = zipfile.ZipFile(zip_path)
    except (OSError, zipfile.BadZipFile) as e:
        return [f"{zip_path}: cannot open ZIP: {e}"], {}
    with zf:
        bad = zf.testzip()
        if bad:
            errors.append(f"{bad}: CRC check failed")
        names = [i.filename for i in zf.infolist()]
        members = set(names)
        if len(names) != len(members):
            errors.append("archive has duplicate entries")
        for n in names:
            if n.startswith("/") or "\\" in n or ".." in n.split("/"):
                errors.append(f"{n}: unsafe path (absolute, backslash or '..')")
            elif n.split("/")[0] != SKILL_NAME:
                errors.append(f"{n}: outside the single top-level folder '{SKILL_NAME}/'")
            parts = n.split("/")
            if EXCLUDED_PARTS.intersection(parts) or re.search(r"(^|/)\.env(\.|$)", n):
                errors.append(f"{n}: unwanted file in package")
            if len(parts) > 1 and parts[1] in FORBIDDEN_TOP:
                errors.append(f"{n}: repository development file does not belong in the skill package")
        skill_md = f"{SKILL_NAME}/SKILL.md"
        if skill_md not in members:
            errors.append(f"{skill_md}: missing (must sit directly inside the top-level folder)")
        else:
            fm, _ = validate_skill.parse_frontmatter(zf.read(skill_md).decode("utf-8"))
            if not fm or fm.get("name") != SKILL_NAME:
                errors.append(f"{skill_md}: frontmatter name must be '{SKILL_NAME}'")
        if f"{SKILL_NAME}/LICENSE" not in members:
            errors.append(f"{SKILL_NAME}/LICENSE: missing")
        for n in names:
            if n.endswith(".md"):
                text = zf.read(n).decode("utf-8")
                base = posixpath.dirname(n)
                for target in validate_skill.local_links(text):
                    resolved = posixpath.normpath(posixpath.join(base, target))
                    if resolved not in members and not any(m.startswith(resolved + "/") for m in members):
                        errors.append(f"{n}: link target {target} is not in the package")
                for ref in validate_skill.SKILL_DIR_REF.findall(text):
                    if f"{SKILL_NAME}/{ref.rstrip('.')}" not in members:
                        errors.append(f"{n}: ${{CLAUDE_SKILL_DIR}}/{ref} is not in the package")
            if n.endswith((".mjs", ".js")):
                text = zf.read(n).decode("utf-8")
                for spec in (a or b for a, b in IMPORT.findall(text)):
                    if spec.startswith("."):
                        if posixpath.normpath(posixpath.join(posixpath.dirname(n), spec)) not in members:
                            errors.append(f"{n}: imports {spec}, which is not in the package")
                    elif not spec.startswith("node:"):
                        errors.append(f"{n}: static import of '{spec}' needs an install the package cannot provide")
        if expected is not None:
            for m in sorted(set(expected) - members):
                errors.append(f"{m}: expected in the package but missing")
            for m in sorted(members - set(expected)):
                errors.append(f"{m}: unexpected file in the package")
    data = Path(zip_path).read_bytes()
    info = {"files": len(names), "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    return errors, info


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--root", default=ROOT, help=argparse.SUPPRESS)
    ap.add_argument("--out", default=None, help="output directory (default: dist/)")
    ap.add_argument("--verify", metavar="ZIP", help="verify an existing archive only")
    args = ap.parse_args(argv)
    root = os.path.abspath(args.root)
    if args.verify:
        path, expected = args.verify, None
    else:
        path, expected = build(root, os.path.abspath(args.out or os.path.join(root, "dist")))
    errors, info = verify(path, expected)
    print(f"package_skill: {os.path.relpath(path, root) if path.startswith(root) else path}")
    if info:
        print(f"  {info['files']} files, {info['bytes']} bytes, sha256 {info['sha256']}")
    for e in errors:
        print(f"  ERROR {e}")
    print("  RESULT:", "FAIL" if errors else "PASS")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
