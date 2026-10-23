# SPDX-License-Identifier: MIT
"""Shared helpers for the test suite. Standard library only; no network."""
import os
import shutil
import subprocess
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "scripts")
sys.path.insert(0, SCRIPTS)

import validate_repository  # noqa: E402

NODE = shutil.which("node")
BASH = shutil.which("bash")
GIT = shutil.which("git")


def require(tool, name):
    """Skip when a tool is missing, unless CI demands it with FF_REQUIRE_NODE=1."""
    if tool:
        return lambda f: f
    if name == "node" and os.environ.get("FF_REQUIRE_NODE") == "1":
        raise RuntimeError("FF_REQUIRE_NODE=1 but node is not installed")
    return unittest.skip(f"{name} not installed")


def copy_repo(dst):
    """Copy the publication set into dst so tests can break it safely."""
    files, _ = validate_repository.publication_files(ROOT)
    for rel in files:
        target = os.path.join(dst, rel)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copy2(os.path.join(ROOT, rel), target)
    return dst


def write(root, rel, text, mode="w"):
    path = os.path.join(root, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, mode, encoding="utf-8", newline="") as fh:
        fh.write(text)
    return path


def read(root, rel):
    with open(os.path.join(root, rel), encoding="utf-8") as fh:
        return fh.read()


def errors(root, check_name=None):
    """ERROR findings as strings, optionally from one named check."""
    _, _, results = validate_repository.run_checks(root)
    return [str(f) for name, findings in results if check_name in (None, name)
            for f in findings if f.level == "ERROR"]


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)
