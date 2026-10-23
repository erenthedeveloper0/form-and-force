# SPDX-License-Identifier: MIT
"""The repository validator passes on this repository and catches real defects."""
import json
import os
import tempfile
import unittest

from support import GIT, ROOT, copy_repo, errors, read, require, run, write

import validate_repository as vr


class RealRepository(unittest.TestCase):
    def test_repository_has_no_errors(self):
        found = errors(ROOT)
        self.assertEqual(found, [], "\n".join(found))

    def test_publication_set_excludes_local_artifacts(self):
        files, _ = vr.publication_files(ROOT)
        self.assertIn("skills/form-and-force/SKILL.md", files)
        self.assertIn("LICENSE", files)
        self.assertFalse([f for f in files if f.startswith(("dist/", "evals/results/", "research/captures/")) and f.endswith((".jpg", ".zip"))])
        self.assertTrue(set(vr.ALLOWED_MEDIA) <= set(files), "every cleared media file is published")


class Mutations(unittest.TestCase):
    """Each test breaks one thing in a copy of the repository and expects a precise error."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = copy_repo(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def assertError(self, check, *fragments):
        found = errors(self.root, check)
        hits = [e for e in found if all(f in e for f in fragments)]
        self.assertTrue(hits, f"expected an error containing {fragments} from {check!r}; got {found}")
        return hits

    def test_copy_is_clean(self):
        self.assertEqual(errors(self.root), [])

    def test_license_body_altered(self):
        write(self.root, "LICENSE", read(self.root, "LICENSE").replace("NONINFRINGEMENT", "INFRINGEMENT"))
        self.assertError("license", "LICENSE", "standard MIT")

    def test_license_placeholder(self):
        write(self.root, "LICENSE", read(self.root, "LICENSE").replace("2026 Form & Force contributors", "[year] [fullname]"))
        self.assertError("license", "placeholder")

    def test_readme_without_license_section(self):
        write(self.root, "README.md", read(self.root, "README.md").replace("## License", "## Legal"))
        self.assertError("license", "README.md", "License")

    def test_conflicting_spdx_header(self):
        path = "scripts/validate_skill.py"
        write(self.root, path, read(self.root, path).replace("SPDX-License-Identifier: MIT", "SPDX-License-Identifier: GPL-3.0"))
        self.assertError("license", path, "GPL-3.0")

    def test_plugin_unknown_field(self):
        data = json.loads(read(self.root, ".claude-plugin/plugin.json"))
        data["colour"] = "red"
        write(self.root, ".claude-plugin/plugin.json", json.dumps(data, indent=2) + "\n")
        self.assertError("plugin and marketplace manifests", "plugin.json", "colour")

    def test_plugin_invalid_json(self):
        write(self.root, ".claude-plugin/plugin.json", '{\n  "name": "form-and-force",\n}\n')
        hits = self.assertError("plugin and marketplace manifests", "plugin.json:", "invalid JSON")
        self.assertRegex(hits[0], r"plugin\.json:\d+:\d+: invalid JSON")  # exact position varies by Python version

    def test_plugin_renamed(self):
        data = json.loads(read(self.root, ".claude-plugin/plugin.json"))
        data["name"] = "form-force"
        write(self.root, ".claude-plugin/plugin.json", json.dumps(data, indent=2) + "\n")
        self.assertError("plugin and marketplace manifests", "permanent")

    def test_marketplace_source_escapes_repository(self):
        data = json.loads(read(self.root, ".claude-plugin/marketplace.json"))
        data["plugins"][0]["source"] = "../elsewhere"
        write(self.root, ".claude-plugin/marketplace.json", json.dumps(data, indent=2) + "\n")
        self.assertError("plugin and marketplace manifests", "plugins[0]", "inside the repository")

    def test_version_mismatch(self):
        write(self.root, "CHANGELOG.md", read(self.root, "CHANGELOG.md").replace("## [0.1.0]", "## [0.2.0]", 1))
        self.assertError("version consistency", "CHANGELOG.md latest release='0.2.0'")

    def test_broken_relative_link(self):
        write(self.root, "docs/testing.md", read(self.root, "docs/testing.md") + "\nSee [gone](missing-page.md).\n")
        self.assertError("internal links and paths", "docs/testing.md:", "missing-page.md", "does not exist")

    def test_broken_html_image(self):
        write(self.root, "README.md", read(self.root, "README.md") + '\n<p align="center"><img src="assets/missing.webp" alt=""></p>\n')
        self.assertError("internal links and paths", "README.md:", "assets/missing.webp", "does not exist")

    def test_broken_anchor(self):
        write(self.root, "docs/testing.md", read(self.root, "docs/testing.md") + "\nSee [x](../README.md#no-such-heading).\n")
        self.assertError("internal links and paths", "anchor #no-such-heading")

    def test_link_to_ignored_file(self):
        write(self.root, "research/captures/demo/sheet.jpg", "not really a jpeg")
        write(self.root, "research/README.md", read(self.root, "research/README.md") + "\n![sheet](captures/demo/sheet.jpg)\n")
        self.assertError("internal links and paths", "not published")

    def test_links_inside_code_blocks_are_ignored(self):
        write(self.root, "docs/testing.md", read(self.root, "docs/testing.md") + "\n```\n[not a link](nowhere.md)\n```\n")
        self.assertEqual(errors(self.root, "internal links and paths"), [])

    def test_backtick_path_to_missing_script(self):
        write(self.root, "CONTRIBUTING.md", read(self.root, "CONTRIBUTING.md") + "\nRun `scripts/no_such_tool.py`.\n")
        self.assertError("internal links and paths", "CONTRIBUTING.md:", "scripts/no_such_tool.py")

    def test_skill_mentions_missing_reference(self):
        path = "skills/form-and-force/references/quality-gates.md"
        write(self.root, path, read(self.root, path) + "\nSee `imaginary-guide.md`.\n")
        self.assertError("internal links and paths", "imaginary-guide.md")

    def test_trailing_whitespace_and_crlf(self):
        write(self.root, "docs/testing.md", read(self.root, "docs/testing.md") + "trailing   \n")
        write(self.root, "CHANGELOG.md", read(self.root, "CHANGELOG.md").replace("\n", "\r\n"))
        self.assertError("text hygiene", "docs/testing.md", "trailing whitespace")
        self.assertError("text hygiene", "CHANGELOG.md", "CR line endings")

    def test_conflict_marker(self):
        write(self.root, "SECURITY.md", read(self.root, "SECURITY.md") + "<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> branch\n")
        self.assertError("text hygiene", "SECURITY.md:", "merge conflict marker")

    def test_python_syntax_error(self):
        write(self.root, "scripts/broken.py", "def f(:\n    pass\n")
        self.assertError("script syntax", "scripts/broken.py:1")

    def test_unpinned_action(self):
        path = ".github/workflows/ci.yml"
        text = read(self.root, path)
        write(self.root, path, text.replace("actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1", "actions/checkout@v7"))
        self.assertError("workflow security", "ci.yml", "full 40-character commit SHA")

    def test_privileged_workflow_patterns(self):
        path = ".github/workflows/ci.yml"
        text = read(self.root, path).replace("  pull_request:\n", "  pull_request_target:\n")
        text = text.replace("contents: read", "contents: write")
        text += "      - run: echo ${{ secrets.ANTHROPIC_API_KEY }}\n      - run: claude plugin eval .\n"
        write(self.root, path, text)
        self.assertError("workflow security", "pull_request_target")
        self.assertError("workflow security", "write permission")
        self.assertError("workflow security", "references secrets")
        self.assertError("workflow security", "paid model evaluations")

    def test_secret_detected_but_not_printed(self):
        fake = "sk-" + "ant-" + "api03-" + "A1b2C3d4E5f6G7h8I9j0K1l2"
        write(self.root, "docs/notes.md", f"key: {fake}\n")
        hits = self.assertError("publication safety", "docs/notes.md:1", "Anthropic API key")
        self.assertNotIn(fake, "\n".join(hits))

    def test_env_file_is_flagged_but_example_is_allowed(self):
        os.makedirs(os.path.join(self.root, "tests", "fixtures"), exist_ok=True)
        write(self.root, "tests/fixtures/.env.example", "API_KEY=replace-me\n")
        self.assertEqual(errors(self.root, "publication safety"), [])
        # .gitignore keeps .env out of the publication set, so add it as a tracked file in git.
        if GIT:
            run(["git", "init", "-q"], cwd=self.root)
            write(self.root, "config/.env", "SECRET=1\n")
            run(["git", "add", "-f", "config/.env"], cwd=self.root)
            self.assertError("publication safety", "config/.env", "environment file")

    def test_media_without_provenance(self):
        write(self.root, "docs/screenshot.png", "fake image")
        self.assertError("publication safety", "docs/screenshot.png", "provenance")

    def test_machine_specific_path(self):
        write(self.root, "docs/notes.md", "Saved to /" + "Users/someone/Desktop/out.txt\n")
        self.assertError("publication safety", "docs/notes.md:1", "absolute path")

    def test_overbroad_gitignore(self):
        write(self.root, ".gitignore", read(self.root, ".gitignore") + "skills/\n")
        self.assertError("required files", "excluded by .gitignore")

    def test_bad_grader_type(self):
        path = "evals/ceramics-landing-from-vague-brief/graders/page-exists.md"
        write(self.root, path, read(self.root, path).replace("type: file_exists", "type: vibes"))
        self.assertError("eval suite structure", path, "grader type")


@require(GIT, "git")
class TrackedFiles(unittest.TestCase):
    def test_tracked_ignored_file_is_still_published_and_flagged(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = copy_repo(tmp)
            run(["git", "init", "-q"], cwd=root)
            write(root, "skills/form-and-force/.DS_Store", "x")
            run(["git", "add", "-f", "skills/form-and-force/.DS_Store"], cwd=root)
            files, method = vr.publication_files(root)
            self.assertIn("skills/form-and-force/.DS_Store", files)
            self.assertIn("git index", method)
            self.assertTrue([e for e in errors(root, "publication safety") if ".DS_Store" in e])


class MarkdownHelpers(unittest.TestCase):
    def test_github_slugs(self):
        self.assertEqual(vr.github_slug("Form & Force"), "form--force")
        self.assertEqual(vr.github_slug("Step 0: Inspect before deciding"), "step-0-inspect-before-deciding")
        self.assertEqual(vr.github_slug("Run `scripts/evals.py`"), "run-scriptsevalspy")
        self.assertEqual(vr.anchors("# A\n## A\n```\n# not a heading\n```\n"), {"a", "a-1"})

    def test_links_ignore_inline_code(self):
        links = list(vr.markdown_links("Use `[x](y.md)` and [real](z.md)\n[ref]: other.md\n"))
        self.assertEqual(links, [(1, "z.md"), (2, "other.md")])


if __name__ == "__main__":
    unittest.main()
