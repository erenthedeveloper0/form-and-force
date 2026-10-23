# SPDX-License-Identifier: MIT
"""Paid evaluations stay opt-in, and the release gate reports statuses honestly."""
import contextlib
import io
import unittest
from unittest import mock

from support import GIT, ROOT, require

import evals
import release_check


class EvalDiscovery(unittest.TestCase):
    def test_cases_and_plan(self):
        cases = evals.load_cases(ROOT)
        self.assertEqual(len(cases), 5)
        text = evals.plan(cases)
        self.assertIn("Total: 20 paid agent session(s)", text)
        self.assertIn("Total: 10 paid agent session(s)", evals.plan(cases, ablation="none"))

    def test_command_keeps_report_local_and_sets_ceiling(self):
        args = mock.Mock(max_cost_usd=5.0, runs=1, case=None, ablation="none", scaffold=True, publish=False)
        cmd = evals.command(".", args)
        self.assertEqual(cmd[:4], ["claude", "plugin", "eval", "."])
        for flag in ("--no-publish", "--max-cost-usd", "--scaffold", "--ablation"):
            self.assertIn(flag, cmd)

    def run_quiet(self, argv):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return evals.main(argv)

    def test_list_never_starts_a_process(self):
        with mock.patch("subprocess.call", side_effect=AssertionError("must not run")):
            self.assertEqual(self.run_quiet(["list"]), 0)

    def test_run_refused_without_explicit_opt_in(self):
        with mock.patch("subprocess.call", side_effect=AssertionError("must not run")):
            self.assertEqual(self.run_quiet(["run"]), 2)
            self.assertEqual(self.run_quiet(["run", "--confirm-paid"]), 2)
            self.assertEqual(self.run_quiet(["run", "--max-cost-usd", "5"]), 2)

    def test_run_blocked_without_cli(self):
        with mock.patch("shutil.which", return_value=None), \
                mock.patch("subprocess.call", side_effect=AssertionError("must not run")):
            self.assertEqual(self.run_quiet(["run", "--confirm-paid", "--max-cost-usd", "1"]), 3)


class ReleaseGate(unittest.TestCase):
    def test_verdict_requires_no_fail_and_no_blocked(self):
        gate = release_check.Gate()
        gate.add("S", "a", "PASS")
        gate.add("S", "b", "NOT RUN", "manual")
        report, counts = release_check.render(gate, 1, "test", False)
        self.assertIn("**Verdict: READY**", report)
        gate.add("S", "c", "BLOCKED", "owner")
        report, counts = release_check.render(gate, 1, "test", False)
        self.assertIn("**Verdict: NOT READY**", report)
        self.assertEqual(counts["BLOCKED"], 1)

    def test_scrubbed_env_removes_credentials(self):
        env = {"ANTHROPIC_API_KEY": "x", "CLAUDE_CODE_OAUTH_TOKEN": "x", "GH_TOKEN": "x", "PATH": "/bin"}
        with mock.patch.dict("os.environ", env, clear=True):
            self.assertEqual(release_check.scrubbed_env(), {"PATH": "/bin"})

    @require(GIT, "git")
    def test_gitignore_probes_are_ignored(self):
        ignored = release_check.ignored(ROOT, release_check.IGNORE_PROBES + ["skills/form-and-force/SKILL.md"])
        self.assertEqual(set(release_check.IGNORE_PROBES) - ignored, set())
        self.assertNotIn("skills/form-and-force/SKILL.md", ignored)


if __name__ == "__main__":
    unittest.main()
