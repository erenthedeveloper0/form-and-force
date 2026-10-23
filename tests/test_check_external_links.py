# SPDX-License-Identifier: MIT
"""External link audit logic, tested with a fake network: these tests never go online."""
import io
import socket
import tempfile
import unittest
import urllib.error

from support import write

import check_external_links as cel


class FakeResponse:
    def __init__(self, url, status=200):
        self._url, self.status = url, status

    def geturl(self):
        return self._url

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


def opener_for(*outcomes):
    """Return an opener that yields each outcome in turn (a response or an exception)."""
    calls = list(outcomes)
    seen = []

    def opener(req, timeout):
        seen.append(req.get_method())
        outcome = calls.pop(0)
        if isinstance(outcome, BaseException):
            raise outcome
        return outcome

    opener.seen = seen
    return opener


def http_error(url, code):
    return urllib.error.HTTPError(url, code, "status", {}, io.BytesIO())


class Extraction(unittest.TestCase):
    def test_extracts_and_skips(self):
        with tempfile.TemporaryDirectory() as root:
            write(root, "a.md", "See [x](https://example.org/page). Also https://example.net/a.\n"
                                "```\nhttps://in-code.example.org/\n```\n"
                                "`https://inline.example.org/`\nLocal http://localhost:3000 and "
                                "https://github.com/OWNER/form-and-force\nAgain https://example.org/page\n")
            urls = cel.extract_urls(root, ["a.md"])
        self.assertEqual(sorted(urls), ["https://example.net/a", "https://example.org/page"])
        self.assertEqual(urls["https://example.org/page"], ["a.md:1", "a.md:7"])


class Classification(unittest.TestCase):
    url = "https://example.org/page"

    def classify(self, *outcomes):
        return cel.classify(self.url, opener_for(*outcomes), timeout=5)[0]

    def test_ok(self):
        self.assertEqual(self.classify(FakeResponse(self.url)), "OK")

    def test_redirect(self):
        self.assertEqual(cel.classify(self.url, opener_for(FakeResponse("https://example.org/new")), 5)[:3:2],
                         ("REDIRECTED", "https://example.org/new"))

    def test_head_rejected_then_get_ok(self):
        opener = opener_for(http_error(self.url, 405), FakeResponse(self.url))
        self.assertEqual(cel.classify(self.url, opener, 5)[0], "OK")
        self.assertEqual(opener.seen, ["HEAD", "GET"])

    def test_status_classes(self):
        self.assertEqual(self.classify(http_error(self.url, 404)), "NOT_FOUND")
        self.assertEqual(self.classify(http_error(self.url, 403), http_error(self.url, 403)), "BLOCKED")
        self.assertEqual(self.classify(http_error(self.url, 503)), "SERVER_ERROR")

    def test_network_failures(self):
        self.assertEqual(self.classify(urllib.error.URLError(socket.gaierror(8, "nodename nor servname"))), "DNS_FAILURE")
        self.assertEqual(self.classify(urllib.error.URLError(socket.timeout("timed out"))), "TIMEOUT")
        self.assertEqual(self.classify(ConnectionResetError("reset")), "ERROR")


class AuditAndReport(unittest.TestCase):
    def test_delay_only_between_same_host(self):
        urls = {"https://a.example.org/1": ["x.md:1"], "https://a.example.org/2": ["x.md:2"],
                "https://b.example.org/": ["x.md:3"]}
        sleeps = []
        opener = lambda req, timeout: FakeResponse(req.full_url)  # noqa: E731
        results = cel.audit(urls, opener=opener, delay=1.5, sleep=sleeps.append)
        self.assertEqual(sleeps, [1.5])
        self.assertEqual({r["status"] for r in results}, {"OK"})

    def test_report_explains_failures_are_not_proof(self):
        results = [{"url": "https://gone.example.org/", "status": "NOT_FOUND", "code": 404, "detail": "",
                    "where": ["research/X.md:4"]}]
        report = cel.render(results, "2026-10-23 00:00")
        self.assertIn("not proof", report)
        self.assertIn("## NOT_FOUND (1)", report)
        self.assertIn("research/X.md:4", report)


if __name__ == "__main__":
    unittest.main()
