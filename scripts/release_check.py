#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Release-readiness gate: run every free check and print the release checklist.

Statuses:
  PASS     checked and satisfied
  FAIL     checked and not satisfied; fix before releasing
  NOT RUN  not checked here: a tool or input is missing, or the check is manual
  BLOCKED  needs the owner: a value or setting that only the owner can provide

The release is ready only when nothing is FAIL or BLOCKED. No step calls a
model or needs an API key. With --online, pinned GitHub Action SHAs are
compared with their upstream tags through `git ls-remote` (read-only).

Usage: python3 scripts/release_check.py [--online] [--output FILE]
Exit 0 when ready, 1 when anything FAILs, 2 when something is BLOCKED.
"""
import argparse
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import package_skill  # noqa: E402
import validate_repository as vr  # noqa: E402

ROOT = vr.ROOT
SECRET_ENV = re.compile(r"^(ANTHROPIC_|CLAUDE_CODE_OAUTH|OPENAI_|AWS_|GOOGLE_|AZURE_|GITHUB_TOKEN$|GH_TOKEN$)")
README_SECTIONS = ["Install", "Quick start", "Validate", "Optional model evaluations", "Limitations",
                   "Contributing", "License"]
IGNORE_PROBES = [".env", ".env.local", "secrets.json", "key.pem", ".npmrc", ".DS_Store",
                 "__pycache__/x.pyc", ".venv/bin/python", "node_modules/x/index.js", "dist/form-and-force-0.1.0.zip",
                 "evals/results/run/report.html", ".claude/settings.local.json", "research/captures/site/sheet.jpg"]


class Gate:
    def __init__(self):
        self.rows = []

    def add(self, section, item, status, evidence=""):
        self.rows.append((section, item, status, evidence))


def by_check(results, name):
    return next(f for n, f in results if n == name)


def status(findings, pred=lambda f: True):
    errs = [f for f in findings if f.level == "ERROR" and pred(f)]
    return ("FAIL", "; ".join(str(e) for e in errs[:3]) + (f" (+{len(errs) - 3} more)" if len(errs) > 3 else "")) if errs else ("PASS", "")


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def read_optional(root, rel):
    path = Path(root, rel)
    return path.read_text(encoding="utf-8") if path.is_file() else ""


def scrubbed_env():
    return {k: v for k, v in os.environ.items() if not SECRET_ENV.match(k)}


def git_repo(root):
    return shutil.which("git") and run(["git", "rev-parse", "--is-inside-work-tree"], cwd=root).stdout.strip() == "true"


def ignored(root, paths):
    """Subset of paths that the repository's .gitignore excludes."""
    with tempfile.TemporaryDirectory() as tmp:
        if git_repo(root):
            base = ["git", "-c", "core.excludesFile="]
        else:
            run(["git", "init", "-q", tmp])
            base = ["git", "-c", "core.excludesFile=", "--git-dir", os.path.join(tmp, ".git"), "--work-tree", root]
        out = run(base + ["check-ignore", "--no-index", "--stdin"], cwd=root, input="\n".join(paths))
    return set(out.stdout.split())


def check_actions_online(root):
    """Compare each pinned action SHA with the commit its version-comment tag points to."""
    problems, checked = [], 0
    for rel in sorted(os.listdir(os.path.join(root, ".github", "workflows"))):
        for line in Path(root, ".github", "workflows", rel).read_text(encoding="utf-8").split("\n"):
            m = re.match(r"\s*-?\s*uses:\s*([\w.-]+/[\w.-]+)(?:/[\w./-]+)?@([0-9a-f]{40})\s*#\s*(v[\w.]+)", line)
            if not m:
                continue
            repo, sha, tag = m.groups()
            out = run(["git", "ls-remote", f"https://github.com/{repo}", f"refs/tags/{tag}", f"refs/tags/{tag}^{{}}"])
            refs = dict(reversed(l.split("\t")) for l in out.stdout.split("\n") if "\t" in l)
            commit = refs.get(f"refs/tags/{tag}^{{}}") or refs.get(f"refs/tags/{tag}")
            checked += 1
            if out.returncode or not commit:
                problems.append(f"{repo} {tag}: tag not found upstream")
            elif commit != sha:
                problems.append(f"{repo} {tag}: pinned {sha[:12]} but tag is {commit[:12]}")
    return problems, checked


def evaluate(root, online):
    gate = Gate()
    files, method, results = vr.run_checks(root)
    lic = by_check(results, "license")
    req = by_check(results, "required files")
    pub = by_check(results, "publication safety")

    # Licensing
    gate.add("Licensing", "Complete MIT LICENSE at repository root", *status(lic, lambda f: f.where.startswith("LICENSE")))
    gate.add("Licensing", "README has correct license information", *status(lic, lambda f: f.where == "README.md"))
    gate.add("Licensing", "No unresolved copyright placeholder", *status(lic, lambda f: "placeholder" in f.message))
    gate.add("Licensing", "Third-party material excluded or licensed",
             *status(pub, lambda f: "provenance" in f.message))
    gate.add("Licensing", "No conflicting license statements", *status(lic, lambda f: "SPDX" in f.message))

    # Packaging
    gate.add("Packaging", "Plugin and marketplace manifests valid (stdlib checks)", *status(by_check(results, "plugin and marketplace manifests")))
    claude = shutil.which("claude")
    if claude:
        with tempfile.TemporaryDirectory() as cfg:
            env = dict(scrubbed_env(), CLAUDE_CONFIG_DIR=cfg)
            out = run([claude, "plugin", "validate", "--strict", "."], cwd=root, env=env)
        tail = " ".join((out.stdout + out.stderr).split("\n")[-2:]).strip()
        gate.add("Packaging", "Official `claude plugin validate --strict .`", "PASS" if out.returncode == 0 else "FAIL", tail)
    else:
        gate.add("Packaging", "Official `claude plugin validate --strict .`", "NOT RUN",
                 "claude CLI not on PATH; run the command on a machine with Claude Code installed")
    gate.add("Packaging", "Skill metadata valid", *status(by_check(results, "skill metadata and structure")))
    gate.add("Packaging", "Versions agree (plugin, skill, pyproject, changelog)", *status(by_check(results, "version consistency")))
    with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
        try:
            zip_a, expected = package_skill.build(root, a)
            zip_b, _ = package_skill.build(root, b)
            errors, info = package_skill.verify(zip_a, expected)
            same = Path(zip_a).read_bytes() == Path(zip_b).read_bytes()
            gate.add("Packaging", "Standalone skill package builds", "PASS", f"{info['files']} files, {info['bytes']} bytes")
            gate.add("Packaging", "Archive structure, packaged references and scripts verified",
                     "FAIL" if errors else "PASS", "; ".join(errors[:3]))
            gate.add("Packaging", "Package is byte-for-byte reproducible", "PASS" if same else "FAIL",
                     f"sha256 {info['sha256']}" if same else "two builds differ")
        except SystemExit as e:
            gate.add("Packaging", "Standalone skill package builds", "FAIL", str(e))
    gate.add("Packaging", "Install commands match current official docs", "NOT RUN",
             "manual: compare docs/installation.md with code.claude.com/docs plugin and skills pages")

    # GitHub readiness
    readme = read_optional(root, "README.md")
    headings = re.findall(r"^##\s+(.+?)\s*$", readme, re.M)
    missing = [s for s in README_SECTIONS if not any(h.lower().startswith(s.lower()) for h in headings)]
    gate.add("GitHub readiness", "Root README complete", "FAIL" if missing else "PASS",
             f"missing sections: {', '.join(missing)}" if missing else "")
    if shutil.which("git"):
        leaked = [p for p in IGNORE_PROBES if p not in ignored(root, IGNORE_PROBES)]
        gate.add("GitHub readiness", ".gitignore protects local and sensitive files", "FAIL" if leaked else "PASS",
                 f"not ignored: {', '.join(leaked)}" if leaked else f"{len(IGNORE_PROBES)} sensitive/generated paths probed")
    else:
        gate.add("GitHub readiness", ".gitignore protects local and sensitive files", "NOT RUN", "git not installed")
    gate.add("GitHub readiness", "Contribution and security guidance exist",
             *status(req, lambda f: f.where in ("CONTRIBUTING.md", "SECURITY.md")))
    gate.add("GitHub readiness", "No known secret in the publication set",
             *status(pub, lambda f: "possible" in f.message))
    gate.add("GitHub readiness", "No accidental generated artifacts or local paths",
             *status(pub, lambda f: "must not be published" in f.message or "absolute path" in f.message or "KiB" in f.message))
    gate.add("GitHub readiness", "Internal links resolve", *status(by_check(results, "internal links and paths")))
    gate.add("GitHub readiness", "Text hygiene (whitespace, line endings, conflict markers)", *status(by_check(results, "text hygiene")))
    if git_repo(root):
        dirty = run(["git", "status", "--porcelain"], cwd=root).stdout.strip()
        gate.add("GitHub readiness", "Working tree committed and reviewable", "FAIL" if dirty else "PASS",
                 f"{len(dirty.splitlines())} uncommitted change(s)" if dirty else "clean")
        log = run(["git", "log", "-p", "--all", "--no-color", "--no-ext-diff", "--no-textconv"], cwd=root).stdout
        hits = sorted({label for label, pat in vr.SECRET_PATTERNS for line in log.split("\n") if line.startswith("+") and pat.search(line)})
        gate.add("GitHub readiness", "No secret patterns in git history", "FAIL" if hits else "PASS",
                 f"possible {', '.join(hits)} in history: rotate the credential, removing the file is not enough" if hits
                 else "pattern scan of all commits; not exhaustive")
        branch = run(["git", "symbolic-ref", "--short", "HEAD"], cwd=root).stdout.strip()
        ci = read_optional(root, ".github/workflows/ci.yml")
        m = re.search(r"push:\s*\n\s*branches:\s*\[([^\]]*)\]", ci)
        branches = [b.strip(" '\"") for b in m.group(1).split(",")] if m else []
        gate.add("GitHub readiness", "CI push trigger matches the primary branch",
                 "PASS" if branch in branches else "FAIL", f"current branch '{branch}', ci.yml pushes on {branches}")
    else:
        for item in ("Working tree committed and reviewable", "No secret patterns in git history",
                     "CI push trigger matches the primary branch"):
            gate.add("GitHub readiness", item, "NOT RUN", "not a git repository yet")
    gate.add("GitHub readiness", "Private vulnerability reporting enabled", "NOT RUN",
             "manual: GitHub > Settings > Code security > Private vulnerability reporting")

    # CI and verification
    wf = by_check(results, "workflow security")
    gate.add("CI and verification", "GitHub Actions workflow exists", *status(req, lambda f: "workflows" in f.where))
    gate.add("CI and verification", "Workflow permissions minimal, no secrets, no pull_request_target",
             *status(wf, lambda f: "pin" not in f.message))
    pin_status = status(wf, lambda f: "pin" in f.message)
    if pin_status[0] == "FAIL":
        gate.add("CI and verification", "Action SHAs pinned and verified", *pin_status)
    elif online:
        problems, checked = check_actions_online(root)
        gate.add("CI and verification", "Action SHAs pinned and verified", "FAIL" if problems else "PASS",
                 "; ".join(problems) if problems else f"{checked} pinned reference(s) match upstream tags")
    else:
        gate.add("CI and verification", "Action SHAs pinned and verified", "NOT RUN",
                 "pin format checked offline; run with --online to compare against upstream tags")
    tests = run([sys.executable, "-m", "unittest", "discover", "-s", "tests"], cwd=root, env=scrubbed_env())
    summary = (tests.stderr.strip().split("\n") or [""])[-1]
    ran = re.search(r"Ran (\d+) tests?", tests.stderr)
    test_status = "PASS" if tests.returncode == 0 else "FAIL"
    evidence = f"{ran.group(0) if ran else 'no tests ran'}; {summary}"
    gate.add("CI and verification", "Free tests run without API keys (credentials removed from env)", test_status, evidence)
    gate.add("CI and verification", "Validator and packaging tests pass", test_status, evidence)
    gate.add("CI and verification", "Syntax of Python, JavaScript and shell scripts", *status(by_check(results, "script syntax")))
    docs = read_optional(root, "docs/testing.md")
    audit_ok = "check_external_links.py" in docs and os.path.isfile(os.path.join(root, ".github", "workflows", "link-audit.yml"))
    gate.add("CI and verification", "External-link audit documented and kept out of default CI",
             "PASS" if audit_ok else "FAIL", "" if audit_ok else "docs/testing.md or link-audit.yml missing")
    refused = run([sys.executable, os.path.join(root, "scripts", "evals.py"), "run"], cwd=root, env=scrubbed_env())
    paid_ok = refused.returncode == 2 and status(wf, lambda f: "paid" in f.message)[0] == "PASS"
    gate.add("CI and verification", "Paid model evaluations remain opt-in", "PASS" if paid_ok else "FAIL",
             "no workflow runs them; `evals.py run` refuses without --confirm-paid" if paid_ok else "opt-in guard failed")
    gate.add("CI and verification", "Eval suite structure valid (offline)", *status(by_check(results, "eval suite structure")))
    gate.add("CI and verification", "Behavioural model evaluations", "NOT RUN",
             "optional and billed; see docs/testing.md. Report the result only after running it")

    # Owner actions
    plugin = json.loads(read_optional(root, ".claude-plugin/plugin.json") or "{}")
    owner_marks = [f.where for f in pub if "OWNER placeholder" in f.message]
    if owner_marks or "repository" not in plugin:
        gate.add("Owner actions", "Repository URL recorded (plugin.json repository/homepage, README commands)", "BLOCKED",
                 f"after creating the GitHub repository, set plugin.json repository/homepage and replace OWNER in {len(owner_marks)} place(s)")
    else:
        gate.add("Owner actions", "Repository URL recorded (plugin.json repository/homepage, README commands)", "PASS")
    icon = plugin.get("icon") or any(os.path.isfile(os.path.join(root, p)) for p in (".claude-plugin/icon.png", "assets/icon.png"))
    gate.add("Owner actions", "Directory listing icon (only for Anthropic directory submission)", "PASS" if icon else "NOT RUN",
             "" if icon else "optional: a square 512-2048 px PNG; becomes the listing icon on first submission")
    return gate, len(files), method


def render(gate, n_files, method, online):
    when = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = ["# Release readiness: Form & Force", "", f"Generated {when}. Publication set: {n_files} files; {method}.",
             f"Online checks: {'on' if online else 'off'}."]
    section = None
    for sec, item, st, ev in gate.rows:
        if sec != section:
            lines += ["", f"## {sec}", ""]
            section = sec
        lines.append(f"- **{st}**: {item}" + (f" ({ev})" if ev else ""))
    counts = {s: sum(r[2] == s for r in gate.rows) for s in ("PASS", "FAIL", "NOT RUN", "BLOCKED")}
    verdict = "READY" if not counts["FAIL"] and not counts["BLOCKED"] else "NOT READY"
    lines += ["", f"**Verdict: {verdict}** ({', '.join(f'{k} {v}' for k, v in counts.items())})", ""]
    return "\n".join(lines), counts


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--online", action="store_true", help="verify action SHAs against upstream tags")
    ap.add_argument("--output", help="also write the report to this Markdown file")
    args = ap.parse_args(argv)
    gate, n_files, method = evaluate(ROOT, args.online)
    report, counts = render(gate, n_files, method, args.online)
    print(report)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(report)
    return 1 if counts["FAIL"] else 2 if counts["BLOCKED"] else 0


if __name__ == "__main__":
    sys.exit(main())
