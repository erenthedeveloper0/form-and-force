#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Optional, paid model evaluations: offline discovery and an explicit opt-in run.

`list` (the default) is free and offline. It reads evals/ and shows every case,
its graders, which steps call a model, and the exact command `run` would start.

`run` wraps `claude plugin eval`, which starts real Claude sessions with your
Claude Code login or ANTHROPIC_API_KEY. Every agent run and every llm/baseline
grader is a model call counted against your plan's usage or your API bill.
`run` refuses to start unless you pass --confirm-paid and a --max-cost-usd
ceiling, and it keeps the HTML report local (--no-publish) unless you add --publish.

Usage:
  python3 scripts/evals.py [list] [--runs N] [--ablation none] [--case GLOB]
  python3 scripts/evals.py run --confirm-paid --max-cost-usd 5 [--runs 1] [--case GLOB]
                               [--ablation none] [--scaffold] [--publish]
"""
import argparse
import fnmatch
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import validate_repository  # noqa: E402

ROOT = validate_repository.ROOT
DEFAULT_RUNS = 3  # `claude plugin eval` default when a case sets no `runs`
PAID_GRADERS = {"llm", "baseline"}


def load_cases(root):
    evals = os.path.join(root, "evals")
    cases = []
    for name in sorted(os.listdir(evals)):
        base = os.path.join(evals, name)
        prompt = os.path.join(base, "prompt.md")
        if not os.path.isfile(prompt):
            continue
        fm = validate_repository.parse_case_frontmatter(Path(prompt).read_text(encoding="utf-8")) or {}
        graders = []
        gdir = os.path.join(base, "graders")
        for g in sorted(os.listdir(gdir)) if os.path.isdir(gdir) else []:
            if g.endswith(".md"):
                gfm = validate_repository.parse_case_frontmatter(Path(gdir, g).read_text(encoding="utf-8")) or {}
                graders.append({"name": g[:-3], "type": gfm.get("type", "?"), "arm": gfm.get("arm", "")})
        scaffold = None
        case_yaml = os.path.join(base, "case.yaml")
        if os.path.isfile(case_yaml):
            m = re.search(r"scaffold_script:\s*(\S+)", Path(case_yaml).read_text(encoding="utf-8"))
            scaffold = f"evals/{name}/{m.group(1)}" if m else None
        cases.append({
            "name": name,
            "description": fm.get("description", ""),
            "runs": int(fm.get("runs", DEFAULT_RUNS)),
            "max_turns": fm.get("max_turns", "10 (CLI default)"),
            "tools": fm.get("allowed_tools", "read-only defaults"),
            "graders": graders,
            "scaffold": scaffold,
        })
    return cases


def plan(cases, runs=None, ablation="with-without"):
    arms = 1 if ablation == "none" else 2
    total_sessions = total_judges = 0
    lines = []
    for c in cases:
        n = runs or c["runs"]
        sessions = n * arms
        judges = sum(n * (1 if g["arm"] == "with" else arms) for g in c["graders"] if g["type"] in PAID_GRADERS)
        total_sessions += sessions
        total_judges += judges
        free = [g["name"] for g in c["graders"] if g["type"] not in PAID_GRADERS]
        paid = [g["name"] for g in c["graders"] if g["type"] in PAID_GRADERS]
        lines += [
            f"- {c['name']}: {c['description']}",
            f"    agent sessions (paid): {n} run(s) x {arms} arm(s) = {sessions}; max_turns {c['max_turns']}; tools {c['tools']}",
            f"    judge-graded (paid, up to {judges} calls): {', '.join(paid) or 'none'}",
            f"    free graders (no model call): {', '.join(free) or 'none'}",
        ]
        if c["scaffold"]:
            lines.append(f"    scaffold: {c['scaffold']} (runs only with --scaffold; it writes fixture files)")
    lines += [
        "",
        f"Total: {total_sessions} paid agent session(s) and up to {total_judges} paid judge call(s).",
        "Cost depends on the model and on how long each session runs. `claude plugin eval` prints a",
        "list-price estimate when it finishes; --max-cost-usd stops new runs once the estimate passes it.",
        "Services contacted: Anthropic's model API, through your Claude Code login or ANTHROPIC_API_KEY.",
    ]
    return "\n".join(lines)


def command(root, args):
    cmd = ["claude", "plugin", "eval", root, "--allow-tools", "Write", "Edit", "Bash",
           "--max-cost-usd", str(args.max_cost_usd)]
    if args.runs:
        cmd += ["--runs", str(args.runs)]
    if args.case:
        cmd += ["--case", args.case]
    if args.ablation == "none":
        cmd += ["--ablation", "none"]
    if args.scaffold:
        cmd.append("--scaffold")
    if not args.publish:
        cmd.append("--no-publish")
    return cmd


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("action", nargs="?", choices=["list", "run"], default="list")
    ap.add_argument("--runs", type=int, help="runs per case (default: each case's own setting)")
    ap.add_argument("--case", help="only cases whose name matches this glob")
    ap.add_argument("--ablation", choices=["with-without", "none"], default="with-without",
                    help="'none' skips the no-plugin baseline arm and halves the sessions")
    ap.add_argument("--scaffold", action="store_true", help="let cases run their scaffold scripts")
    ap.add_argument("--publish", action="store_true", help="allow the CLI to publish the report to claude.ai")
    ap.add_argument("--max-cost-usd", type=float, help="required for run: stop starting runs past this estimate")
    ap.add_argument("--confirm-paid", action="store_true", help="required for run: acknowledge the model calls are billed")
    args = ap.parse_args(argv)
    cases = load_cases(ROOT)
    if args.case:
        cases = [c for c in cases if fnmatch.fnmatch(c["name"], args.case)]
    if not cases:
        print("no eval cases match", file=sys.stderr)
        return 2
    print(f"Eval suite: {len(cases)} case(s) in evals/\n")
    print(plan(cases, args.runs, args.ablation))
    if args.max_cost_usd is None:
        args.max_cost_usd = "<USD>"
    print("\nCommand `run` would start:\n  " + " ".join(command(".", args)), flush=True)
    if args.action == "list":
        print("\nNothing was run. This listing made no network or model calls.")
        return 0
    if not args.confirm_paid or args.max_cost_usd == "<USD>":
        print("\nRefusing to run: pass --confirm-paid and --max-cost-usd <amount> to start billed model calls.",
              file=sys.stderr)
        return 2
    claude = shutil.which("claude")
    if not claude:
        print("\nBLOCKED: the `claude` CLI is not on PATH. Install Claude Code and sign in first.", file=sys.stderr)
        return 3
    cmd = command(ROOT, args)
    cmd[0] = claude
    print("\nStarting paid evaluation. Results are written under evals/results/ (ignored by git).\n", flush=True)
    return subprocess.call(cmd, cwd=ROOT)


if __name__ == "__main__":
    sys.exit(main())
