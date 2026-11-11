# SPDX-License-Identifier: MIT
"""Regression tests for the tools that open a browser: the page audit, the
sketch board and the motion strip, run on the fixture pages in
tests/fixtures/pages.

They need Playwright with Chromium, which this repository never installs. Set
FF_PLAYWRIGHT_DIR to a directory that has it (see docs/testing.md) and they
run; otherwise every test here is reported as skipped, never as passed.

FF_UPDATE_FACTS=1 also rewrites tests/fixtures/facts/*.json from this run, for
the browser-free threshold tests in test_creative_method.py.
"""
import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path

from support import NODE, ROOT, playwright_dir, run

SCRIPTS = Path(ROOT, "skills", "form-and-force", "scripts")
PAGES = Path(ROOT, "tests", "fixtures", "pages")
FACTS = Path(ROOT, "tests", "fixtures", "facts")
PW = playwright_dir()
needs_browser = unittest.skipUnless(PW, "set FF_PLAYWRIGHT_DIR to a Playwright install to run the rendered-tool tests")


def tool(script, *args):
    return run([NODE, str(SCRIPTS / script), *map(str, args)], env={**os.environ, "FF_PLAYWRIGHT_DIR": PW or ""}, cwd=tempfile.gettempdir())


class Rendered(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp(prefix="ff-test-")

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def json(self, out):
        self.assertEqual(out.returncode, 0, out.stderr[-600:])
        return json.loads(out.stdout)


@needs_browser
class AuditPage(Rendered):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.reports = {}
        for name in ("generic", "directed", "collision"):
            out = tool("audit_page.mjs", PAGES / f"{name}.html", "--out", Path(cls.tmp, name), "--wait", "300",
                       "--scroll-shots", "1", "--focus-steps", "5", "--plan-tiles", "8", "--json")
            assert out.returncode == 0, out.stderr[-600:]
            cls.reports[name] = json.loads(out.stdout)[0]
        if os.environ.get("FF_UPDATE_FACTS") == "1":
            FACTS.mkdir(parents=True, exist_ok=True)
            for name in ("generic", "directed"):
                design = dict(cls.view(name, "1440x900")["design"])
                design.pop("read", None)
                (FACTS / f"{name}.json").write_text(json.dumps(design, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    @classmethod
    def view(cls, name, viewport):
        return next(v for v in cls.reports[name]["viewports"] if v["viewport"] == viewport)

    def questions(self, name, viewport="1440x900"):
        return {q["id"] for q in self.view(name, viewport)["design"]["read"]["questions"]}

    def test_evidence_files_are_written(self):
        for name in ("generic", "directed"):
            for image in ("first.jpg", "flatplan.jpg", "sheet.jpg", "report.json"):
                path = Path(self.tmp, name, image)
                self.assertTrue(path.is_file() and path.stat().st_size > 2000, f"{name}/{image}")

    def test_default_page_raises_the_questions_a_jury_would_ask(self):
        asked = self.questions("generic")
        for expected in ("scale-contrast", "centred", "caps-labels", "even-pacing", "moulds", "one-surface",
                         "transition-all", "one-duration", "default-easing"):
            self.assertIn(expected, asked)

    def test_directed_page_raises_none_and_clears_the_measurable_floor(self):
        for viewport in ("1440x900", "390x844"):
            self.assertEqual(self.questions("directed", viewport), set(), viewport)
            v = self.view("directed", viewport)
            self.assertLessEqual(v["horizontalOverflowPx"], 1, "the oversized numerals must not cause overflow")
            self.assertEqual((v["h1Count"], v["deadLinks"], v["unnamedControls"]), (1, 0, []))
        self.assertGreater(self.view("directed", "1440x900")["design"]["type"]["foldScaleRatio"], 8)
        self.assertGreaterEqual(self.reports["directed"]["viewports"][-1]["motion"]["reducedMotionCssRules"], 1)

    def test_facts_are_reported_as_facts(self):
        design = self.view("generic", "1440x900")["design"]
        self.assertGreater(design["type"]["centredShare"], 0.9)
        self.assertGreaterEqual(design["repetition"]["textCardGroups"], 3)
        self.assertEqual(design["surfaces"]["distinctRadii"], 1)
        self.assertEqual(design["type"]["bodyPx"], 16)
        self.assertEqual(self.view("directed", "1440x900")["design"]["type"]["bodyPx"], 17)
        self.assertEqual(self.view("directed", "1440x900")["design"]["repetition"]["textCardGroups"], 0, "table rows are not cards")

    def test_text_collision_is_seen_only_where_it_happens(self):
        self.assertIn("text-collision", self.questions("collision", "390x844"))
        self.assertNotIn("text-collision", self.questions("collision", "1440x900"))
        self.assertEqual(self.view("directed", "390x844")["design"]["layering"]["textCollisions"], 0)


@needs_browser
class SketchBoard(Rendered):
    def test_same_composition_with_new_words_is_caught(self):
        reworded = Path(self.tmp, "reworded.html")
        text = (PAGES / "generic.html").read_text(encoding="utf-8")
        reworded.write_text(text.replace("Unlock seamless teamwork", "Payroll without the paperwork").replace("#6366f1", "#0f766e"), encoding="utf-8")
        report = self.json(tool("sketch_board.mjs", PAGES / "directed.html", PAGES / "generic.html", reworded,
                                "--out", Path(self.tmp, "board"), "--wait", "300", "--json"))
        pairs = {p["pair"]: p for p in report["pairs"]}
        self.assertTrue(pairs["B/C"]["tooClose"], "a reworded copy is the same composition")
        self.assertFalse(pairs["A/B"]["tooClose"])
        self.assertLess(pairs["A/B"]["layoutSimilarity"], 0.5)
        self.assertTrue(Path(report["board"]).is_file())
        self.assertEqual([f["label"] for f in report["frames"]], ["A", "B", "C"])

    def test_refusals_need_no_browser_time(self):
        self.assertEqual(tool("sketch_board.mjs").returncode, 2)
        self.assertEqual(tool("sketch_board.mjs", "no-such-frame.html").returncode, 2)
        self.assertEqual(tool("sketch_board.mjs", PAGES / "directed.html", "--viewports", "1440").returncode, 2)


@needs_browser
class MotionStrip(Rendered):
    FAULTS = {"from-nothing", "keyframes-on-trigger", "late-response", "slow-exit", "layout-shift", "linear",
              "transition-all", "layout-props", "ease-in", "uniform-stagger", "default-curves", "reduced-still-moves"}

    def strip(self, page, *args):
        out = tool("motion_strip.mjs", PAGES / page, *args, "--rate", "0.25", "--frames", "6", "--wait", "500",
                   "--out", Path(self.tmp, f"{page}-{len(os.listdir(self.tmp))}"), "--json")
        report = self.json(out)
        self.assertTrue(Path(report["strip"]).is_file())
        return report

    @staticmethod
    def ids(run_report):
        return {q["id"] for q in run_report["questions"]}

    def test_habitual_motion_is_questioned(self):
        click = self.strip("motion-default.html", "--trigger", "click:#open", "--exit", "undo", "--span", "800", "--clip", "viewport")["runs"][0]
        for expected in ("from-nothing", "keyframes-on-trigger", "late-response", "slow-exit", "layout-shift", "linear"):
            self.assertIn(expected, self.ids(click))
        self.assertGreater(click["layoutShift"]["score"], 0.01)
        hover = self.strip("motion-default.html", "--trigger", "hover:#go", "--span", "600")["runs"][0]
        for expected in ("ease-in", "layout-props", "transition-all", "slow-response"):
            self.assertIn(expected, self.ids(hover))

    def test_entrance_stagger_and_reduced_motion(self):
        runs = self.strip("motion-default.html", "--trigger", "load", "--reduced", "--span", "1200")["runs"]
        self.assertEqual([r["mode"] for r in runs], ["full", "reduced"])
        self.assertIn("uniform-stagger", self.ids(runs[0]))
        self.assertIn("reduced-still-moves", self.ids(runs[1]))
        crafted = self.strip("motion-crafted.html", "--trigger", "load", "--reduced", "--span", "700")["runs"]
        self.assertFalse(self.ids(crafted[0]) & self.FAULTS)
        starts = sorted(a["start"] + a["delay"] for a in crafted[0]["animations"] if "translate" in a["props"])
        gaps = [b - a for a, b in zip(starts, starts[1:])]
        self.assertEqual(len(gaps), 2)
        self.assertGreater(gaps[0], gaps[1], "the stagger's gaps shrink")
        self.assertEqual(crafted[1]["animations"], [], "nothing travels under reduced motion")
        self.assertNotIn("reduced-still-moves", self.ids(crafted[1]))

    def test_engineered_interaction_raises_nothing_and_exits_faster(self):
        run_report = self.strip("motion-crafted.html", "--trigger", "click:#open", "--exit", "key:Escape", "--span", "400")["runs"][0]
        self.assertFalse(self.ids(run_report) & self.FAULTS, self.ids(run_report))
        way_in = max(a["duration"] for a in run_report["animations"])
        way_out = max(a["duration"] for a in run_report["exitAnimations"])
        self.assertLess(way_out, way_in)
        self.assertEqual(run_report["layoutShift"]["score"], 0)
        self.assertTrue(all(a["kind"] == "transition" for a in run_report["animations"]), "transitions retarget; keyframes restart")

    def test_touch_viewport_does_not_apply_hover(self):
        report = self.strip("motion-crafted.html", "--trigger", "hover:#go", "--viewport", "390x844", "--span", "300")
        self.assertTrue(report["touch"])
        self.assertEqual(report["runs"][0]["animations"], [])

    def test_failures_are_reported_plainly(self):
        self.assertEqual(tool("motion_strip.mjs", "no-such-page.html", "--trigger", "load").returncode, 2)
        self.assertEqual(tool("motion_strip.mjs", PAGES / "motion-crafted.html", "--trigger", "wiggle").returncode, 2)
        self.assertEqual(tool("motion_strip.mjs", PAGES / "motion-crafted.html", "--trigger", "load", "--exit", "undo").returncode, 2)
        self.assertEqual(tool("motion_strip.mjs", PAGES / "motion-crafted.html", "--trigger", "load", "--bogus").returncode, 2)


class WithoutABrowser(unittest.TestCase):
    """What the rendered tools do when Playwright is absent: say so, install nothing, exit 2."""

    @unittest.skipUnless(NODE, "node not installed")
    def test_missing_playwright_is_an_instruction_not_a_crash(self):
        with tempfile.TemporaryDirectory() as empty:
            env = {k: v for k, v in os.environ.items() if k != "FF_PLAYWRIGHT_DIR"}
            for script, args in (("audit_page.mjs", [PAGES / "directed.html"]), ("sketch_board.mjs", [PAGES / "directed.html"]),
                                 ("motion_strip.mjs", [PAGES / "directed.html", "--trigger", "load"]), ("contact_sheet.mjs", [empty])):
                out = run([NODE, str(SCRIPTS / script), *map(str, args)], env=env, cwd=empty)
                self.assertEqual(out.returncode, 2, script)
                self.assertIn("Playwright not found", out.stderr, script)
                self.assertIn("not globally", out.stderr, script)
                self.assertNotIn("    at ", out.stderr, f"{script} printed a stack trace")
            self.assertEqual(os.listdir(empty), [], "nothing may be written or installed")


if __name__ == "__main__":
    unittest.main()
