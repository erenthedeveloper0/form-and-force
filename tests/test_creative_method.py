# SPDX-License-Identifier: MIT
"""Offline regression tests for the creative method: the deck, the dealer, the
motion token generator, the design-facts thresholds, and the agreement between
the skill's documents and its tools.

None of these call a model or open a browser. They check that the mechanisms
the method relies on keep their promises, not that any design is good.
"""
import json
import os
import re
import tempfile
import unittest
from pathlib import Path

from support import NODE, ROOT, require, run

SKILL = Path(ROOT, "skills", "form-and-force")
SCRIPTS = SKILL / "scripts"
FACTS = Path(ROOT, "tests", "fixtures", "facts")
DECK = json.loads((SCRIPTS / "deck.json").read_text(encoding="utf-8"))
REGISTERS = ["quiet", "composed", "expressive", "radical"]
RETIRED = ["creative-process", "quality-gates", "anti-slop-constitution", "anti-slop-component-atlas",
           "motion-intelligence", "motion-implementation", "visual-implementation", "creative-brief.md",
           "motion-spec.md", "Context-to-Concept", "three territories", "scorecard", "eight originality tests"]


def skill_markdown():
    files = [SKILL / "SKILL.md", *sorted((SKILL / "references").glob("*.md")), *sorted((SKILL / "assets").glob("*.md"))]
    return {f.relative_to(SKILL).as_posix(): f.read_text(encoding="utf-8") for f in files}


def node(script, *args, **kw):
    return run([NODE, str(SCRIPTS / script), *args], **kw)


class Deck(unittest.TestCase):
    """The deck holds questions and structural principles. It must never hold a look."""

    def test_ids_are_unique_and_families_exist(self):
        for key, families in (("lenses", "lensFamilies"), ("archetypes", "archetypeFamilies")):
            ids = [x["id"] for x in DECK[key]]
            self.assertEqual(len(ids), len(set(ids)), key)
            self.assertEqual({x["family"] for x in DECK[key]}, set(DECK[families]), key)
        self.assertEqual(len(DECK["lensFamilies"]), 8)
        self.assertEqual(len(DECK["archetypeFamilies"]), 6)
        self.assertEqual([r["id"] for r in DECK["registers"]], REGISTERS)
        self.assertEqual([r["level"] for r in DECK["registers"]], [1, 2, 3, 4])

    def test_every_card_is_complete(self):
        for lens in DECK["lenses"]:
            for field in ("name", "ask", "answer", "restraint", "trap"):
                self.assertTrue(lens.get(field, "").strip(), f"{lens['id']}.{field}")
            self.assertEqual("{variant}" in lens["ask"], bool(lens.get("variants")), lens["id"])
        for arch in DECK["archetypes"]:
            for field in ("name", "principle", "decide", "risk"):
                self.assertTrue(arch.get(field, "").strip(), f"{arch['id']}.{field}")
            self.assertTrue(set(arch["registers"]) <= {1, 2, 3, 4} and arch["registers"], arch["id"])
        for reg in DECK["registers"]:
            for field in ("motto", "for", "bold", "floor", "timid", "overwrought"):
                self.assertTrue(reg.get(field, "").strip(), f"{reg['id']}.{field}")

    def test_every_register_can_be_dealt_four_distinct_structures(self):
        for reg in DECK["registers"]:
            families = {a["family"] for a in DECK["archetypes"] if reg["level"] in a["registers"]}
            self.assertGreaterEqual(len(families), 4, reg["id"])
            made = [m for m in DECK["media"] if not m["needs"] and m["minRegister"] <= reg["level"]]
            self.assertGreaterEqual(len(made), 2, f"{reg['id']}: a project with no assets still needs two media")

    def test_deck_prescribes_no_palette_typeface_or_measurement(self):
        text = json.dumps(DECK)
        self.assertIsNone(re.search(r"#[0-9a-fA-F]{3,8}\b|\b(rgb|hsl|oklch)\(", text), "a colour value is a look")
        self.assertIsNone(re.search(r"font-family|\b\d+(px|rem)\b", text), "a typeface or a size is a look")
        for face in ("Inter", "Helvetica", "Garamond", "Geist", "Fraunces", "Instrument Serif"):
            self.assertNotIn(face, text)

    def test_documents_name_the_same_structures_and_registers(self):
        md = skill_markdown()
        for arch in DECK["archetypes"]:
            self.assertIn(arch["name"], md["references/composition.md"], f"{arch['name']} has no build notes")
        for reg in DECK["registers"]:
            for doc in ("SKILL.md", "references/direction.md", "references/jury.md", "references/motion-direction.md"):
                self.assertIn(reg["name"], md[doc], f"{reg['name']} missing from {doc}")


@require(NODE, "node")
class Dealer(unittest.TestCase):
    def hand(self, *args, history=None):
        hist = ["--history", history] if history else ["--no-history"]
        out = node("deal.mjs", "hand", *args, *hist, "--json")
        self.assertEqual(out.returncode, 0, out.stderr)
        return json.loads(out.stdout)

    def test_frames_never_share_a_family_and_respect_the_project(self):
        for reg in REGISTERS:
            level = REGISTERS.index(reg) + 1
            for has in ("none", "photo", "ui,data"):
                for seed in range(6):
                    hand = self.hand("--register", reg, "--has", has, "--frames", "4", "--seed", f"t{seed}")
                    frames = hand["frames"]
                    self.assertEqual(len(frames), 4)
                    for part in ("lens", "archetype"):
                        families = [f[part]["family"] for f in frames]
                        self.assertEqual(len(set(families)), 4, f"{reg} {has} {seed}: {part} families {families}")
                    owned = [] if has == "none" else has.split(",")
                    for f in frames:
                        self.assertIn(level, f["archetype"]["registers"])
                        self.assertLessEqual(f["medium"]["minRegister"], level)
                        self.assertTrue(set(f["medium"]["needs"]) <= set(owned), "dealt a medium the project does not have")
                        self.assertNotIn("{variant}", f["lens"]["ask"])

    def test_same_seed_same_hand(self):
        a = self.hand("--register", "composed", "--has", "ui", "--seed", "fixed")
        b = self.hand("--register", "composed", "--has", "ui", "--seed", "fixed")
        self.assertEqual(a["frames"], b["frames"])

    def test_history_steers_the_next_hand_away(self):
        with tempfile.TemporaryDirectory() as tmp:
            hist = os.path.join(tmp, "h.json")
            used = {"lens": set(), "archetype": set()}
            for i in range(3):
                hand = self.hand("--register", "expressive", "--has", "photo", "--seed", f"h{i}", history=hist)
                for part in used:
                    ids = {f[part]["id"] for f in hand["frames"]}
                    if i < 2:   # the dealer avoids the two most recent hands
                        self.assertFalse(ids & used[part], f"hand {i + 1} repeats a recent {part}")
                    used[part] |= ids

    def test_swap_needs_a_reason_and_is_once_per_frame(self):
        with tempfile.TemporaryDirectory() as tmp:
            hist = os.path.join(tmp, "h.json")
            before = self.hand("--register", "composed", "--has", "ui", "--seed", "s", history=hist)
            weak = node("deal.mjs", "swap", "--frame", "1", "--part", "lens", "--reason", "hard", "--history", hist, cwd=ROOT)
            self.assertEqual(weak.returncode, 2)
            ok = node("deal.mjs", "swap", "--frame", "1", "--part", "lens", "--reason", "the project has no measurable quantity",
                      "--history", hist, "--json")
            self.assertEqual(ok.returncode, 0, ok.stderr)
            after = json.loads(ok.stdout)
            self.assertNotEqual(after["frames"][0]["lens"]["id"], before["frames"][0]["lens"]["id"])
            families = [f["lens"]["family"] for f in after["frames"]]
            self.assertEqual(len(set(families)), len(families), "a swap must keep the lens families distinct")
            again = node("deal.mjs", "swap", "--frame", "1", "--part", "archetype", "--reason", "a second swap on one frame",
                         "--history", hist)
            self.assertEqual(again.returncode, 2)
            self.assertIn("already had its one swap", again.stderr)

    def test_record_and_recent_round_trip_without_storing_the_project_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            hist = os.path.join(tmp, "h.json")
            self.hand("--register", "quiet", "--seed", "r", history=hist)
            device = "Every price is one size; the only large thing is the wait in minutes"
            rec = node("deal.mjs", "record", "--frame", "2", "--device", device, "--type", "Archivo, Literata",
                       "--palette", "signal", "--motion", "dab, bound", "--history", hist)
            self.assertEqual(rec.returncode, 0, rec.stderr)
            recent = json.loads(node("deal.mjs", "recent", "--history", hist, "--json").stdout)
            self.assertEqual(recent["taken"][0]["device"], device)
            self.assertEqual(recent["taken"][0]["type"], ["Archivo", "Literata"])
            stored = Path(hist).read_text(encoding="utf-8")
            self.assertNotIn(os.getcwd(), stored)
            self.assertNotIn(os.path.expanduser("~"), stored)

    def test_refusals(self):
        self.assertEqual(node("deal.mjs", "hand", "--no-history").returncode, 2)                       # no register: the script will not choose it
        self.assertEqual(node("deal.mjs", "hand", "--register", "loud", "--no-history").returncode, 2)
        self.assertEqual(node("deal.mjs", "hand", "--register", "quiet", "--has", "photos", "--no-history").returncode, 2)
        self.assertEqual(node("deal.mjs", "record", "--no-history").returncode, 2)
        self.assertEqual(node("deal.mjs", "nonsense").returncode, 2)
        self.assertEqual(node("deal.mjs").returncode, 0)                                                # bare call prints the usage

    def test_no_history_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = node("deal.mjs", "hand", "--register", "quiet", "--no-history", env={**os.environ, "HOME": tmp, "USERPROFILE": tmp})
            self.assertEqual(out.returncode, 0, out.stderr)
            self.assertEqual(os.listdir(tmp), [])


@require(NODE, "node")
class MotionTokens(unittest.TestCase):
    ACTIONS = ["dab", "flick", "glide", "float", "punch", "slash", "press", "wring"]
    # The bands printed in references/motion-craft.md §1.
    BANDS = {"press": (80, 160), "quick": (120, 240), "move": (150, 350), "scene": (300, 1100)}

    def tokens(self, *args):
        out = node("motion_tokens.mjs", *args, "--json")
        self.assertEqual(out.returncode, 0, out.stderr)
        return json.loads(out.stdout)

    def test_every_character_stays_inside_the_documented_bands(self):
        seen = set()
        for action in self.ACTIONS:
            for flow in ("bound", "free"):
                t = self.tokens("--action", action, "--flow", flow)
                d = t["durations"]
                for job, (lo, hi) in self.BANDS.items():
                    self.assertTrue(lo <= d[job] <= hi, f"{action} {flow}: {job} = {d[job]} ms")
                self.assertTrue(d["press"] < d["quick"] < d["move"] < d["scene"])
                self.assertLess(d["moveOut"], d["move"], "exits are shorter than entrances")
                if flow == "bound":
                    self.assertLessEqual(t["spring"]["overshoot"], 0.001, f"{action}: a bound character never passes its mark")
                else:
                    self.assertGreater(t["spring"]["overshoot"], 0.005, f"{action}: a free character has follow-through")
                seen.add(json.dumps({k: t[k] for k in ("durations", "easings", "spring", "distance", "stagger")}, sort_keys=True))
        self.assertEqual(len(seen), 16, "two characters produced identical tokens: there would be a house curve")

    def test_extremes_of_custom_factors_stay_in_band(self):
        for w in ("0", "1"):
            for t in ("0", "1"):
                for f in ("0", "1"):
                    d = self.tokens("--weight", w, "--time", t, "--space", "0.5", "--flow", f)["durations"]
                    for job, (lo, hi) in self.BANDS.items():
                        self.assertTrue(lo <= d[job] <= hi, f"w{w} t{t} f{f}: {job} = {d[job]}")

    def test_css_output_carries_a_reduced_motion_block(self):
        out = node("motion_tokens.mjs", "--action", "slash", "--flow", "free")
        self.assertEqual(out.returncode, 0, out.stderr)
        reduced = out.stdout.split("prefers-reduced-motion: reduce", 1)[1]
        for zeroed in ("--travel: 0px", "--travel-lg: 0px", "--turn: 0deg", "--blur: 0px", "--stagger-step: 0ms"):
            self.assertIn(zeroed, reduced)
        self.assertIn("Out of character:", out.stdout)

    def test_recipes_only_use_tokens_the_generator_emits(self):
        emitted = set(re.findall(r"(--[a-z-]+):", node("motion_tokens.mjs", "--action", "dab").stdout))
        motion = re.compile(r"var\((--(?:dur|ease|spring|travel|scale-from|press-scale|stagger|turn|blur|drift)[a-z-]*)")
        for name, text in skill_markdown().items():
            for token in set(motion.findall(text)):
                self.assertIn(token, emitted, f"{name} uses {token}, which motion_tokens.mjs does not generate")

    def test_refusals(self):
        self.assertEqual(node("motion_tokens.mjs").returncode, 2)
        self.assertEqual(node("motion_tokens.mjs", "--action", "jump").returncode, 2)
        self.assertEqual(node("motion_tokens.mjs", "--weight", "2", "--time", "0", "--space", "0", "--flow", "0").returncode, 2)
        self.assertEqual(node("motion_tokens.mjs", "--action", "dab", "--flow", "wobbly").returncode, 2)
        self.assertEqual(len(node("motion_tokens.mjs", "list").stdout.strip().split("\n")[:8]), 8)


@require(NODE, "node")
class DesignFacts(unittest.TestCase):
    """Thresholds, replayed on facts recorded from the fixture pages.

    tests/fixtures/facts/*.json hold the `design` object that audit_page.mjs
    measured for tests/fixtures/pages/{generic,directed}.html at 1440x900. To
    refresh them after changing what DOM_FACTS collects, run the rendered tests
    with FF_UPDATE_FACTS=1 (see tests/test_rendered_tools.py).
    """

    REPLAY = """
      import fs from 'node:fs';
      import { describeDesign, pacing } from './design_facts.mjs';
      const d = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
      const read = describeDesign(d, d.firstScreen, d.pacing);
      const tile = (ink, ground, grid) => ({ ink, ground, grid, chroma: 0, symmetry: 0.5 });
      const flat = pacing([0, 1, 2, 3, 4].map(() => tile(0.1, 'rgb(255,255,255)', [5, 5, 0, 0])));
      const shaped = pacing([tile(0.4, 'rgb(20,20,20)', [9, 0, 0, 0]), tile(0.05, 'rgb(250,250,250)', [0, 0, 0, 7]), tile(0.2, 'rgb(250,250,250)', [0, 6, 0, 0])]);
      console.log(JSON.stringify({ ids: read.questions.map((q) => q.id), lines: read.lines.length, flat, shaped, one: pacing([tile(0.1, 'rgb(0,0,0)', [1])]) }));
    """

    def replay(self, name):
        out = run([NODE, "--input-type=module", "-e", self.REPLAY, str(FACTS / name)], cwd=str(SCRIPTS))
        self.assertEqual(out.returncode, 0, out.stderr)
        return json.loads(out.stdout)

    def test_default_page_is_questioned_and_directed_page_is_not(self):
        generic, directed = self.replay("generic.json"), self.replay("directed.json")
        for expected in ("scale-contrast", "centred", "caps-labels", "even-pacing", "moulds", "one-surface",
                         "transition-all", "one-duration", "default-easing"):
            self.assertIn(expected, generic["ids"])
        self.assertEqual(directed["ids"], [], "a page with decisions in it should raise no question")
        self.assertGreaterEqual(generic["lines"], 9)

    def test_pacing_separates_a_flat_sequence_from_a_shaped_one(self):
        r = self.replay("generic.json")
        self.assertIsNone(r["one"], "one screen has no pacing")
        self.assertEqual((r["flat"]["groundChanges"], r["flat"]["inkRange"], r["flat"]["twinScreens"]), (0, 0, 10))
        self.assertEqual(r["shaped"]["groundChanges"], 1)
        self.assertGreater(r["shaped"]["inkRange"], 0.3)
        self.assertEqual(r["shaped"]["twinScreens"], 0)

    def test_every_question_a_tool_can_raise_is_explained_in_a_reference(self):
        md = skill_markdown()
        facts = set(re.findall(r"ask\('([a-z-]+)'", (SCRIPTS / "design_facts.mjs").read_text(encoding="utf-8")))
        self.assertGreaterEqual(len(facts), 15)
        for qid in sorted(facts):
            self.assertIn(f"`{qid}`", md["references/jury.md"], f"design question {qid} is not in jury.md §8")
        strip_src = (SCRIPTS / "motion_strip.mjs").read_text(encoding="utf-8")
        strip = set(re.findall(r"ask\('([a-z-]+)'", strip_src)) | set(re.findall(r"id: '([a-z-]+)'", strip_src))
        self.assertGreaterEqual(len(strip), 15)
        for qid in sorted(strip):
            self.assertIn(f"`{qid}`", md["references/motion-craft.md"], f"strip question {qid} is not in motion-craft.md")

    def test_questions_are_questions(self):
        """The instrument asks; it never rules. No question text may read as a verdict."""
        src = (SCRIPTS / "design_facts.mjs").read_text(encoding="utf-8")
        texts = re.findall(r"ask\('[a-z-]+', [`'\"](.+?)[`'\"]\);", src)
        self.assertGreaterEqual(len(texts), 15)
        for text in texts:
            self.assertTrue(text.rstrip().endswith("?"), text[:70])
            self.assertIsNone(re.search(r"\b(fail|bad|wrong|must|slop|generic)\b", text, re.I), text[:70])


class Documents(unittest.TestCase):
    def setUp(self):
        self.md = skill_markdown()

    def test_section_pointers_resolve(self):
        sections = {Path(n).stem: {int(x) for x in re.findall(r"^## (\d+)\. ", t, re.M)} for n, t in self.md.items()}
        pointer = re.compile(r"\b([a-z][a-z-]+)(?:\.md)?(?:\]\([^)]*\))?((?:[ ,·]*(?:and )?§\s?\d+(?:[–-]\d+)?)+)")
        checked = 0
        for name, text in self.md.items():
            for i, line in enumerate(text.split("\n"), 1):
                for m in pointer.finditer(line):
                    if m.group(1) not in sections:
                        continue
                    for a, b in re.findall(r"§\s?(\d+)(?:[–-](\d+))?", m.group(2)):
                        for n in range(int(a), int(b or a) + 1):
                            checked += 1
                            self.assertIn(n, sections[m.group(1)], f"{name}:{i} points at {m.group(1)} §{n}, which does not exist")
        self.assertGreater(checked, 50)

    def test_every_script_named_in_the_skill_exists_and_every_tool_is_routed(self):
        on_disk = {p.name for p in SCRIPTS.glob("*.mjs")}
        for name, text in self.md.items():
            for script in set(re.findall(r"\b([a-z_]+\.mjs)\b", text)):
                self.assertIn(script, on_disk, f"{name} names {script}")
        tools = {p.name for p in SCRIPTS.glob("*.mjs") if p.read_text(encoding="utf-8").startswith("#!")}
        for tool in sorted(tools):
            self.assertIn(f"scripts/{tool}", self.md["SKILL.md"], f"{tool} is not in the SKILL.md script table")

    def test_retired_method_does_not_return(self):
        for name, text in self.md.items():
            for term in RETIRED:
                self.assertNotIn(term.lower(), text.lower(), f"{name} still mentions the retired '{term}'")

    def test_skill_stays_an_operating_manual(self):
        body = self.md["SKILL.md"].split("\n---\n", 1)[1]
        self.assertLess(len(body) // 4, 4500, "SKILL.md is growing into an encyclopedia; move detail into a reference")
        for stage in ("## 1. Size the job", "## 2. Read", "## 3. Direct", "## 4. Derive the language", "## 5. Build",
                      "## 6. Clear the floor", "## 7. Sit the jury", "## 8. Report", "## Load only what the task needs"):
            self.assertIn(stage, body)
        for asset in ("direction-brief.md", "jury-brief.md", "motion-score.md", "component-spec.md", "report-template.md"):
            self.assertIn(f"(assets/{asset})", body)

    def test_jury_is_separate_from_the_floor_and_can_reject_the_idea(self):
        jury, floor = self.md["references/jury.md"], self.md["references/floor.md"]
        for verdict in ("Ship", "Refine", "Rework", "Redirect"):
            self.assertIn(f"**{verdict}**", jury)
            self.assertIn(verdict, self.md["assets/jury-brief.md"])
        for dim in ("Identity", "Concept", "Composition", "Typography", "Coherence", "Interaction", "Motion", "Craft",
                    "Usability", "Technical"):
            self.assertIn(dim, jury)
            self.assertIn(dim, self.md["assets/jury-brief.md"])
            self.assertIn(dim, self.md["assets/report-template.md"])
        self.assertEqual(len(re.findall(r"^\| G\d+ \|", floor, re.M)), 10, "ten hard gates")
        self.assertIsNone(re.search(r"\b\d{1,3}\s?(/|out of)\s?(10|100)\b", jury), "the jury marks in words, never a numeric score")
        self.assertIn("This skill's own attractor", floor)


if __name__ == "__main__":
    unittest.main()
