#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Compose screenshots into one labelled contact sheet so a whole responsive /
// scroll sequence can be critiqued in a single image.
//
// Usage: node contact_sheet.mjs <dir-with-jpg-or-png> [--out sheet.jpg] [--height 300]
// Groups files by their leading viewport label (e.g. "390-01-scroll.jpg" → row "390").
// Uses Playwright the same way audit_page.mjs does (FF_PLAYWRIGHT_DIR / FF_CHROMIUM_PATH).

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function makeSheet(browser, files, outFile, title = '', rowHeight = 300) {
  const rows = new Map();
  for (const f of files.filter((x) => /\.(jpe?g|png)$/i.test(x) && !/sheet\.jpg$/.test(x)).sort()) {
    const key = path.basename(f).split('-')[0];
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(f);
  }
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cells = [...rows.entries()].map(([key, list]) => `
    <div class="row"><div class="lab">${esc(key)}</div>${list.map((f) => {
      const b64 = fs.readFileSync(f).toString('base64');
      const mime = /png$/i.test(f) ? 'image/png' : 'image/jpeg';
      return `<figure><img src="data:${mime};base64,${b64}"><figcaption>${esc(path.basename(f).replace(/\.\w+$/, ''))}</figcaption></figure>`;
    }).join('')}</div>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#1b1b1b;color:#ddd;font:12px/1.3 ui-monospace,Menlo,monospace;padding:10px;display:inline-block}
    h1{font-size:13px;margin:0 0 8px;font-weight:600}
    .row{display:flex;gap:8px;align-items:flex-start;margin-bottom:10px}
    .lab{writing-mode:vertical-rl;transform:rotate(180deg);color:#999;padding:4px}
    figure{margin:0} img{height:${rowHeight}px;display:block;outline:1px solid #333}
    figcaption{color:#888;margin-top:3px}</style><h1>${esc(title)}</h1>${cells}`;
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  const box = await page.evaluate(() => ({ w: Math.ceil(document.body.getBoundingClientRect().width), h: Math.ceil(document.body.getBoundingClientRect().height) }));
  await page.setViewportSize({ width: Math.min(box.w, 4000), height: Math.min(box.h, 4000) });
  await page.screenshot({ path: outFile, type: 'jpeg', quality: 70, fullPage: true });
  await page.close();
  return outFile;
}

// CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const dir = argv.find((a) => !a.startsWith('--'));
  if (!dir) { console.error('usage: contact_sheet.mjs <dir> [--out file] [--height px]'); process.exit(2); }
  const oi = argv.indexOf('--out'); const hi = argv.indexOf('--height');
  const out = oi >= 0 ? argv[oi + 1] : path.join(dir, 'sheet.jpg');
  const h = hi >= 0 ? Number(argv[hi + 1]) : 300;
  let pw;
  for (const base of [process.cwd(), process.env.FF_PLAYWRIGHT_DIR].filter(Boolean)) {
    try { pw = createRequire(path.join(path.resolve(base), 'noop.js'))('playwright'); break; } catch { /* next */ }
  }
  if (!pw) { console.error('contact_sheet: Playwright not found (see audit_page.mjs header for install).'); process.exit(2); }
  const browser = await pw.chromium.launch({ headless: true, ...(process.env.FF_CHROMIUM_PATH ? { executablePath: process.env.FF_CHROMIUM_PATH } : {}) });
  const files = fs.readdirSync(dir).map((f) => path.join(dir, f));
  console.log(await makeSheet(browser, files, out, path.basename(path.resolve(dir)), h));
  await browser.close();
}
