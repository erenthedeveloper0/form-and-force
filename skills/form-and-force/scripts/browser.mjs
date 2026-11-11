// SPDX-License-Identifier: MIT
// Shared browser plumbing for the rendered tools (audit_page, sketch_board,
// motion_strip, contact_sheet). Playwright is resolved from the current project
// first, then FF_PLAYWRIGHT_DIR. Nothing here installs anything.

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const slug = (u) => u.replace(/^[a-z]+:\/\//i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60);
export const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

export function loadPlaywright(tool) {
  const bases = [process.cwd()];
  if (process.env.FF_PLAYWRIGHT_DIR) bases.push(path.resolve(process.env.FF_PLAYWRIGHT_DIR));
  for (const base of bases) {
    const req = createRequire(path.join(base, 'noop.js'));
    for (const name of ['playwright', '@playwright/test', 'playwright-core']) {
      try { return req(name); } catch { /* try next */ }
    }
  }
  console.error([
    `${tool}: Playwright not found.`,
    'Install it locally (not globally) in the project or a scratch directory:',
    '  npm i -D playwright && npx playwright install chromium',
    'or: mkdir -p ~/.cache/ffpw && cd ~/.cache/ffpw && npm i playwright && npx playwright install chromium',
    '    then run with FF_PLAYWRIGHT_DIR=~/.cache/ffpw',
  ].join('\n'));
  process.exit(2);
}

export async function launch(tool, executablePath = process.env.FF_CHROMIUM_PATH || null) {
  const pw = loadPlaywright(tool);
  try {
    return await pw.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  } catch (e) {
    console.error(`${tool}: could not launch Chromium. Run \`npx playwright install chromium\` or set FF_CHROMIUM_PATH.\n` + String(e.message || e).split('\n')[0]);
    process.exit(2);
  }
}

// A bare path is a local file; anything with a scheme is used as given.
export function toUrl(target, origin = null) {
  if (/^[a-z]+:\/\//i.test(target)) return target;
  if (origin && target.startsWith('/') && !fs.existsSync(target)) return new URL(target, origin).href;
  return pathToFileURL(path.resolve(target)).href;
}

export function parseViewports(list) {
  return list.split(',').map((s) => {
    const [width, height] = s.toLowerCase().split('x').map(Number);
    if (!(width > 0 && height > 0)) throw new Error(`bad viewport "${s}" (use WIDTHxHEIGHT)`);
    return { width, height };
  });
}

export const dataUri = (file) => `data:${/png$/i.test(file) ? 'image/png' : 'image/jpeg'};base64,${fs.readFileSync(file).toString('base64')}`;

// Render an HTML string to one JPEG sized to its content (used for boards and sheets).
export async function renderHtml(browser, html, outFile, { quality = 72, maxSide = 6000 } = {}) {
  const page = await browser.newPage({ viewport: { width: 3200, height: 800 }, deviceScaleFactor: 1 });   // wide, so rows shrink-wrap instead of wrapping early
  await page.setContent(html, { waitUntil: 'load' });
  const box = await page.evaluate(() => {
    const r = document.body.getBoundingClientRect();
    return { w: Math.ceil(r.width), h: Math.ceil(r.height) };
  });
  await page.setViewportSize({ width: Math.max(320, Math.min(box.w, maxSide)), height: Math.max(200, Math.min(box.h, maxSide)) });
  await page.screenshot({ path: outFile, type: 'jpeg', quality, fullPage: true });
  await page.close();
  return outFile;
}

export const SHEET_CSS = `
  body{margin:0;background:#1b1b1b;color:#ddd;font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;padding:12px;display:inline-block}
  h1{font-size:13px;margin:0 0 10px;font-weight:600}
  h2{font-size:12px;margin:14px 0 6px;font-weight:600;color:#aaa}
  .row{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px}
  .lab{writing-mode:vertical-rl;transform:rotate(180deg);color:#999;padding:4px}
  figure{margin:0} img{display:block;outline:1px solid #333}
  figcaption{color:#8a8a8a;margin-top:3px;max-width:100%}
  .squint img{filter:blur(5px) grayscale(1) contrast(1.15)}`;
