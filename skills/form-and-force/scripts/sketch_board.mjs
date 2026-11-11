#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Put rendered key frames side by side so a direction is chosen by looking.
// Shoots each sketch (a local HTML file or a URL) at a wide and a narrow
// viewport, adds a blurred greyscale thumbnail of each (the squint test), and
// measures whether the frames really differ in structure or only in content.
//
// Usage:
//   node sketch_board.mjs <a.html> <b.html> [c.html ...] [options]
// Options:
//   --out <dir>          Output directory (default: <tmp>/ff-board/<time>)
//   --viewports <list>   Comma list WxH, widest first is not required (default 1440x900,390x844)
//   --labels <list>      Comma list of column labels (default A,B,C,D)
//   --wait <ms>          Settle time after load (default 900)
//   --scroll             Also shoot the second screen of each sketch
//   --json               Print measurements as JSON
//
// Also useful for before/after: pass the current page's URL first, then the sketches.
// Playwright is resolved as in audit_page.mjs (project first, then FF_PLAYWRIGHT_DIR).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SHEET_CSS, dataUri, esc, launch, parseViewports, renderHtml, sleep, stamp, toUrl } from './browser.mjs';
import { DOM_FACTS, PIXEL_FACTS, TEXT_COLLISIONS, describeDesign } from './design_facts.mjs';

const args = process.argv.slice(2);
const opts = { targets: [], out: null, viewports: '1440x900,390x844', labels: null, wait: 900, scroll: false, json: false };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') opts.out = args[++i];
  else if (a === '--viewports') opts.viewports = args[++i];
  else if (a === '--labels') opts.labels = args[++i];
  else if (a === '--wait') opts.wait = Number(args[++i]);
  else if (a === '--scroll') opts.scroll = true;
  else if (a === '--json') opts.json = true;
  else if (a === '-h' || a === '--help') {
    const header = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(2);
    console.log(header.slice(0, header.findIndex((l) => !l.startsWith('//'))).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(0);
  } else if (a.startsWith('--')) { console.error(`sketch_board: unknown option ${a}. See --help.`); process.exit(2); }
  else opts.targets.push(a);
}
if (!opts.targets.length) { console.error('sketch_board: pass one or more HTML files or URLs. See --help.'); process.exit(2); }
if (opts.targets.length > 6) { console.error('sketch_board: at most 6 frames on one board.'); process.exit(2); }
for (const t of opts.targets) if (!/^[a-z]+:\/\//i.test(t) && !fs.existsSync(t)) { console.error(`sketch_board: no such file: ${t}`); process.exit(2); }

let vps;
try { vps = parseViewports(opts.viewports).sort((a, b) => b.width - a.width); } catch (e) { console.error('sketch_board: ' + e.message); process.exit(2); }
const labels = (opts.labels ? opts.labels.split(',') : 'ABCDEF'.split('')).map((s) => s.trim());
const dir = opts.out || path.join(os.tmpdir(), 'ff-board', stamp());
fs.mkdirSync(dir, { recursive: true });

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

const browser = await launch('sketch_board');
const frames = [];
for (let i = 0; i < opts.targets.length; i++) {
  const target = opts.targets[i];
  const frame = { label: labels[i] || String(i + 1), source: target, shots: {}, errors: [], collisions: {} };
  for (const vp of vps) {
    const narrow = vp.width < 900;
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: narrow, hasTouch: narrow });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => frame.errors.push(String(e.message || e).slice(0, 160)));
    try {
      await page.goto(toUrl(target), { waitUntil: 'load', timeout: 45000 });
      await sleep(opts.wait);
      const key = `${vp.width}x${vp.height}`;
      const file = path.join(dir, `${frame.label}-${vp.width}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 74 });
      frame.shots[key] = [file];
      if (vp === vps[0]) frame.dom = await page.evaluate(DOM_FACTS);
      const hits = await page.evaluate(TEXT_COLLISIONS).catch(() => []);
      if (hits.length) frame.collisions[key] = hits.slice(0, 3);
      if (opts.scroll) {
        await page.evaluate((h) => window.scrollTo(0, h), vp.height);
        await sleep(450);
        const second = path.join(dir, `${frame.label}-${vp.width}-2.jpg`);
        await page.screenshot({ path: second, type: 'jpeg', quality: 74 });
        frame.shots[key].push(second);
      }
    } catch (e) { frame.errors.push(String(e.message || e).split('\n')[0]); }
    await ctx.close();
  }
  frames.push(frame);
}

// Pixel facts for each frame's wide first screen, then pairwise structural similarity.
const wideKey = `${vps[0].width}x${vps[0].height}`;
const measured = frames.filter((f) => f.shots[wideKey] && f.dom);
if (measured.length) {
  const helper = await browser.newPage({ viewport: { width: 400, height: 300 } });
  const pixels = await helper.evaluate(PIXEL_FACTS, measured.map((f) => dataUri(f.shots[wideKey][0])));
  await helper.close();
  measured.forEach((f, i) => { f.grid = pixels[i].grid; const fold = { ...pixels[i] }; delete fold.grid; f.fold = fold; f.read = describeDesign(f.dom, fold, null); });
}
const pairs = [];
for (let i = 0; i < measured.length; i++) for (let j = i + 1; j < measured.length; j++) {
  const a = measured[i], b = measured[j];
  const similarity = Number(cosine(a.grid, b.grid).toFixed(2));
  const sameFaces = a.dom.type.families[0] && a.dom.type.families[0].split(' ')[0] === (b.dom.type.families[0] || '').split(' ')[0];
  const sameGround = a.fold.ground === b.fold.ground;
  const scaleGap = Math.abs((a.dom.type.foldScaleRatio || 0) - (b.dom.type.foldScaleRatio || 0));
  pairs.push({ pair: `${a.label}/${b.label}`, layoutSimilarity: similarity, sameLeadFace: !!sameFaces, sameGround, scaleGap: Number(scaleGap.toFixed(1)),
    tooClose: similarity >= 0.8 && scaleGap < 2 });
}

const column = (f) => {
  const img = (file, style) => (file ? `<img style="${style}" src="${dataUri(file)}">` : '<div style="color:#a66">not rendered</div>');
  const wide = f.shots[wideKey] || [];
  const narrowKey = vps.length > 1 ? `${vps[vps.length - 1].width}x${vps[vps.length - 1].height}` : null;
  const narrow = narrowKey ? f.shots[narrowKey] || [] : [];
  const facts = f.dom ? [
    `${f.dom.type.families.slice(0, 2).join(' · ')}`,
    `display ${f.dom.type.foldDisplay ? f.dom.type.foldDisplay.px + 'px' : '?'} = ${f.dom.type.foldScaleRatio ?? '?'}× body · ${f.dom.type.sizeCount} sizes`,
    f.fold ? `ink ${Math.round(f.fold.ink * 100)}% · colour ${Math.round(f.fold.chroma * 100)}% · L/R ${f.fold.halves.left}/${f.fold.halves.right} · edges ${f.fold.edgesTouched}/4` : '',
  ] : ['no measurements'];
  return `<div class="col"><div class="tag">${esc(f.label)}</div><div class="src">${esc(path.basename(f.source))}</div>
    ${wide.map((s) => img(s, 'width:560px')).join('')}
    <div class="pair">${narrow.map((s) => img(s, 'height:400px')).join('')}<div class="squint">${img(wide[0], 'width:200px')}<figcaption>squint, thumbnail size</figcaption></div></div>
    <div class="facts">${facts.map(esc).join('<br>')}</div>${f.errors.length ? `<div class="err">${esc(f.errors[0])}</div>` : ''}</div>`;
};
const html = `<!doctype html><meta charset="utf-8"><style>${SHEET_CSS}
  .cols{display:flex;gap:18px;align-items:flex-start}.col{display:flex;flex-direction:column;gap:8px}
  .tag{font-size:26px;font-weight:700;color:#fff}.src{color:#888}.pair{display:flex;gap:8px;align-items:flex-start}
  .facts{color:#bbb;max-width:560px}.err{color:#e88}</style>
  <h1>key frames · choose by looking · ${esc(new Date().toISOString().slice(0, 16).replace('T', ' '))}</h1><div class="cols">${frames.map(column).join('')}</div>`;
const board = await renderHtml(browser, html, path.join(dir, 'board.jpg'), { quality: 76 });
await browser.close();

const report = { board, dir, frames: frames.map((f) => ({ label: f.label, source: f.source, shots: f.shots, errors: f.errors, collisions: f.collisions, facts: f.dom ? { type: f.dom.type, layering: f.dom.layering, media: f.dom.media, firstScreen: f.fold } : null, questions: f.read ? f.read.questions : [] })), pairs };
fs.writeFileSync(path.join(dir, 'board.json'), JSON.stringify(report, null, 2));

if (opts.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`board: ${board}  (view this image; choose by looking)`);
  for (const f of frames) {
    console.log(`\n${f.label}  ${f.source}`);
    if (f.read) for (const line of f.read.lines.filter((x) => /^(type|scale|alignment|layering|media|first screen)/.test(x))) console.log('   ' + line);
    for (const [width, hits] of Object.entries(f.collisions)) console.log(`  ? text sits on text at ${width}: ${hits[0]}${hits.length > 1 ? ` (+${hits.length - 1} more)` : ''}. Composed, or a collision?`);
    for (const e of f.errors.slice(0, 2)) console.log('  ! ' + e);
  }
  if (pairs.length) {
    console.log('\nDo the frames differ in structure?');
    for (const p of pairs) console.log(`   ${p.pair}: layout similarity ${p.layoutSimilarity}${p.sameGround ? ' · same ground' : ''}${p.sameLeadFace ? ' · same lead typeface' : ''} · scale gap ${p.scaleGap}×${p.tooClose ? '   <- the same composition with different content: resketch one of them' : ''}`);
  }
  console.log('\nBefore choosing, answer for each frame from the image alone: what is the one thing it does that the others do not?');
}
