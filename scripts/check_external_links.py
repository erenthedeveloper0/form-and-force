#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""On-demand audit of external links in the repository's Markdown.

Not part of default CI. Third-party sites go down for a while, block automated
clients, restrict regions and rate-limit, so a failed check here is a prompt
for manual review, never proof that a page is gone. Requests run one at a time,
with a pause between requests to the same host and a timeout on each.

Usage:
  python3 scripts/check_external_links.py [--report FILE] [--timeout 15]
                                          [--delay 1.0] [--fail-on-broken] [PATH ...]
PATH limits the audit to some Markdown files or directories (default: all
published Markdown). Exit 0 unless --fail-on-broken is given and a link returns
404/410 or its host does not resolve.
"""
import argparse
import datetime
import os
import re
import socket
import sys
import time
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import validate_repository  # noqa: E402

ROOT = validate_repository.ROOT
USER_AGENT = "form-and-force-link-audit/0.1 (+manual research maintenance)"
URL = re.compile(r"https?://[^\s<>()\"'`\]]+")
SKIP_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "example.com", "www.example.com"}
ORDER = ["NOT_FOUND", "DNS_FAILURE", "SERVER_ERROR", "TIMEOUT", "ERROR", "BLOCKED", "REDIRECTED", "OK"]
MEANING = {
    "OK": "Responded with 2xx at the same address.",
    "REDIRECTED": "Responded after a redirect. Update the link if the new address is the canonical one.",
    "BLOCKED": "401/403/429: the site refused an automated client. Check it in a browser before acting.",
    "NOT_FOUND": "404/410: the page is missing now. Re-check later and look for a successor or archive before removing provenance.",
    "SERVER_ERROR": "5xx: usually temporary. Re-check later.",
    "DNS_FAILURE": "The host name did not resolve. The site may be retired; look for an official successor or archive.",
    "TIMEOUT": "No response within the timeout. Often temporary or bot protection.",
    "ERROR": "Another failure (TLS, connection reset, malformed response).",
}


def extract_urls(root, rels):
    """Map each external URL to the places it appears; code blocks and placeholders excluded."""
    found = {}
    for rel in rels:
        text = Path(root, rel).read_text(encoding="utf-8")
        for i, line in enumerate(validate_repository.strip_code(text), 1):
            for url in URL.findall(line):
                url = url.rstrip(".,;:*_")
                host = urllib.parse.urlparse(url).hostname or ""
                if host in SKIP_HOSTS or "OWNER" in url:
                    continue
                found.setdefault(url, []).append(f"{rel}:{i}")
    return found


def classify(url, opener, timeout):
    """Return (status, http code or None, final URL or detail)."""
    code = reason = None
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=method, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
        try:
            with opener(req, timeout=timeout) as resp:
                final = resp.geturl()
                code = resp.status
                if final.rstrip("/") != url.rstrip("/"):
                    return "REDIRECTED", code, final
                return "OK", code, ""
        except urllib.error.HTTPError as e:
            code, reason = e.code, e.reason
            e.close()  # an HTTPError holds the open response body
            if method == "HEAD" and code in (400, 403, 405, 406, 429, 501):
                continue  # many servers reject HEAD; retry with GET
            break
        except urllib.error.URLError as e:
            reason = e.reason
            if isinstance(reason, socket.gaierror):
                return "DNS_FAILURE", None, str(reason)
            if isinstance(reason, (socket.timeout, TimeoutError)):
                return "TIMEOUT", None, f"no response in {timeout}s"
            return "ERROR", None, str(reason)
        except (socket.timeout, TimeoutError):
            return "TIMEOUT", None, f"no response in {timeout}s"
        except OSError as e:
            return "ERROR", None, str(e)
    if code in (404, 410):
        return "NOT_FOUND", code, ""
    if code in (401, 403, 429, 999):
        return "BLOCKED", code, ""
    if code >= 500:
        return "SERVER_ERROR", code, ""
    return "ERROR", code, str(reason)


def audit(urls, opener=urllib.request.urlopen, timeout=15.0, delay=1.0, sleep=time.sleep):
    results, last_host = [], None
    for url in sorted(urls, key=lambda u: (urllib.parse.urlparse(u).hostname or "", u)):
        host = urllib.parse.urlparse(url).hostname
        if host == last_host and delay:
            sleep(delay)
        last_host = host
        status, code, detail = classify(url, opener, timeout)
        results.append({"url": url, "status": status, "code": code, "detail": detail, "where": urls[url]})
    return results


def render(results, checked_at):
    lines = [
        "# External link audit",
        "",
        f"Checked {checked_at} (UTC), {len(results)} unique URLs, one request at a time.",
        "A failure is a prompt for manual review, not proof that a page has gone.",
        "",
    ]
    for status in ORDER:
        rows = [r for r in results if r["status"] == status]
        if not rows:
            continue
        lines += [f"## {status} ({len(rows)})", "", MEANING[status], "", "| URL | Code | Detail | Referenced in |", "|---|---|---|---|"]
        for r in rows:
            where = ", ".join(r["where"][:3]) + (f" +{len(r['where']) - 3}" if len(r["where"]) > 3 else "")
            detail = r["detail"].replace("|", "\\|")
            lines.append(f"| {r['url']} | {r['code'] or ''} | {detail} | {where} |")
        lines.append("")
    return "\n".join(lines)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("paths", nargs="*", help="Markdown files or directories to audit")
    ap.add_argument("--report", help="write the Markdown report to this file (appended when it is $GITHUB_STEP_SUMMARY)")
    ap.add_argument("--timeout", type=float, default=15.0)
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between requests to the same host")
    ap.add_argument("--fail-on-broken", action="store_true")
    args = ap.parse_args(argv)
    files, _ = validate_repository.publication_files(ROOT)
    md = [f for f in files if f.endswith(".md")]
    if args.paths:
        wanted = [os.path.relpath(os.path.abspath(p), ROOT).replace(os.sep, "/") for p in args.paths]
        md = [f for f in md if any(f == w or f.startswith(w.rstrip("/") + "/") for w in wanted)]
    urls = extract_urls(ROOT, md)
    print(f"check_external_links: {len(urls)} unique URLs in {len(md)} Markdown files", file=sys.stderr)
    results = audit(urls, timeout=args.timeout, delay=args.delay)
    report = render(results, datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M"))
    if args.report:
        mode = "a" if args.report == os.environ.get("GITHUB_STEP_SUMMARY") else "w"
        with open(args.report, mode, encoding="utf-8") as fh:
            fh.write(report + "\n")
    else:
        print(report)
    counts = {s: sum(r["status"] == s for r in results) for s in ORDER}
    print("summary: " + ", ".join(f"{s}={n}" for s, n in counts.items() if n), file=sys.stderr)
    broken = counts["NOT_FOUND"] + counts["DNS_FAILURE"]
    return 1 if args.fail_on_broken and broken else 0


if __name__ == "__main__":
    sys.exit(main())
