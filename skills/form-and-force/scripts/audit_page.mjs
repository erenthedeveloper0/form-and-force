#!/usr/bin/env node
// Rendered-page audit: viewport screenshots, scroll sequences, and measurable
// checks (console errors, overflow, focus visibility, target size, landmarks,
// reduced-motion response, LCP/CLS, libraries). Heuristic checks are labelled
// as such; they flag candidates for manual review, they do not certify anything.
//
// Usage:
//   node audit_page.mjs <url|file> [more urls] [options]
// Options:
//   --out <dir>            Output directory (default: <tmp>/ff-audit/<slug>-<time>)
//   --viewports <list>     Comma list WxH (default 390x844,1440x900)
//   --scroll-shots <n>     Screenshots while wheel-scrolling per viewport (default 4)
//   --wait <ms>            Settle time after load (default 2500)
//   --focus-steps <n>      Tab presses to inspect on the widest viewport (default 30)
//   --full-page            Also capture a full-page screenshot per viewport
//   --no-reduced           Skip the prefers-reduced-motion comparison pass
//   --chromium <path>      Browser executable (or env FF_CHROMIUM_PATH)
//   --json                 Print the full JSON report to stdout instead of a summary
//
// Playwright is resolved from the current project first, then FF_PLAYWRIGHT_DIR.
// If missing: `npm i -D playwright && npx playwright install chromium`
// (or install into a scratch directory and point FF_PLAYWRIGHT_DIR at it).

import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { makeSheet } from './contact_sheet.mjs';

const args = process.argv.slice(2);
const opts = {
  urls: [],
  out: null,
  viewports: '390x844,1440x900',
  scrollShots: 4,
  wait: 2500,
  focusSteps: 30,
  fullPage: false,
  reduced: true,
  chromium: process.env.FF_CHROMIUM_PATH || null,
  json: false,
};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const next = () => args[++i];
  if (a === '--out') opts.out = next();
  else if (a === '--viewports') opts.viewports = next();
  else if (a === '--scroll-shots') opts.scrollShots = Number(next());
  else if (a === '--wait') opts.wait = Number(next());
  else if (a === '--focus-steps') opts.focusSteps = Number(next());
  else if (a === '--full-page') opts.fullPage = true;
  else if (a === '--no-reduced') opts.reduced = false;
  else if (a === '--chromium') opts.chromium = next();
  else if (a === '--json') opts.json = true;
  else if (a === '-h' || a === '--help') {
    const header = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1);
    console.log(header.slice(0, header.findIndex((l) => !l.startsWith('//'))).filter((l) => !l.includes('SPDX-License-Identifier')).join('\n'));
    process.exit(0);
  } else opts.urls.push(a);
}
if (!opts.urls.length) {
  console.error('audit_page: pass at least one URL or HTML file path. See --help.');
  process.exit(2);
}

function loadPlaywright() {
  const bases = [process.cwd()];
  if (process.env.FF_PLAYWRIGHT_DIR) bases.push(path.resolve(process.env.FF_PLAYWRIGHT_DIR));
  for (const base of bases) {
    const req = createRequire(path.join(base, 'noop.js'));
    for (const name of ['playwright', '@playwright/test', 'playwright-core']) {
      try { return req(name); } catch { /* try next */ }
    }
  }
  console.error([
    'audit_page: Playwright not found.',
    'Install it locally (not globally) in the project or a scratch directory:',
    '  npm i -D playwright && npx playwright install chromium',
    'or: mkdir -p /tmp/ffpw && cd /tmp/ffpw && npm i playwright && npx playwright install chromium',
    '    then run with FF_PLAYWRIGHT_DIR=/tmp/ffpw',
  ].join('\n'));
  process.exit(2);
}

// "/pricing" after an http(s) URL is a route on that origin; other bare paths are local files.
const firstHttp = opts.urls.find((u) => /^https?:\/\//i.test(u));
const toUrl = (u) => {
  if (/^[a-z]+:\/\//i.test(u)) return u;
  if (firstHttp && u.startsWith('/') && !fs.existsSync(u)) return new URL(u, firstHttp).href;
  return pathToFileURL(path.resolve(u)).href;
};
const slug = (u) => u.replace(/^[a-z]+:\/\//i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60);
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Instrumentation injected before any page script runs.
const INIT_SCRIPT = () => {
  const ff = (window.__ff = { lcp: null, cls: 0, longTasks: 0, longTaskMs: 0, webgl: 0, mq: [] });
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const el = e.element;
        ff.lcp = { t: Math.round(e.startTime), size: e.size, el: el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') : null };
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) ff.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) { ff.longTasks++; ff.longTaskMs += e.duration; }
    }).observe({ type: 'longtask', buffered: true });
  } catch { /* observers unsupported */ }
  const gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (/webgl|webgpu/i.test(String(type))) ff.webgl++;
    return gc.call(this, type, ...rest);
  };
  const mm = window.matchMedia;
  window.matchMedia = function (q) { try { if (ff.mq.length < 200) ff.mq.push(String(q)); } catch {} return mm.call(window, q); };
};

// Collected inside the page after load and scrolling.
const COLLECT = ({ isMobile, deviceWidth }) => {
  const out = {};
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.01;
  };
  const sel = (el) => {
    if (!el || !el.tagName) return '';
    let s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    return s;
  };
  const accName = (el) => {
    const lab = el.getAttribute('aria-label');
    if (lab && lab.trim()) return lab.trim();
    const lb = el.getAttribute('aria-labelledby');
    if (lb) { const t = lb.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim(); if (t) return t; }
    if (el.labels && el.labels.length) { const t = [...el.labels].map((l) => l.textContent).join(' ').trim(); if (t) return t; }
    const txt = (el.innerText || el.textContent || '').trim();
    if (txt) return txt.slice(0, 60);
    const img = el.querySelector && el.querySelector('img[alt]:not([alt=""]), svg title');
    if (img) return (img.getAttribute('alt') || img.textContent || '').trim();
    if (el.title) return el.title;
    if (el.tagName === 'INPUT' && /submit|button|reset/.test(el.type) && el.value) return el.value;
    return '';
  };

  out.title = document.title;
  out.lang = document.documentElement.lang || null;
  out.metaDescription = document.querySelector('meta[name="description"]')?.content || null;
  out.viewportMeta = document.querySelector('meta[name="viewport"]')?.content || null;
  out.zoomBlocked = /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(out.viewportMeta || '');

  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  out.headings = hs.slice(0, 40).map((h) => `${h.tagName.toLowerCase()}: ${(h.innerText || h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)}`);
  out.h1Count = hs.filter((h) => h.tagName === 'H1').length;
  let prev = 0, skips = 0;
  for (const h of hs) { const lv = Number(h.tagName[1]); if (prev && lv > prev + 1) skips++; prev = lv; }
  out.headingLevelSkips = skips;
  out.landmarks = {
    main: document.querySelectorAll('main,[role=main]').length,
    nav: document.querySelectorAll('nav,[role=navigation]').length,
    header: document.querySelectorAll('header,[role=banner]').length,
    footer: document.querySelectorAll('footer,[role=contentinfo]').length,
  };
  const firstLink = document.querySelector('a[href],button');
  out.skipLink = !!(firstLink && firstLink.tagName === 'A' && /^#/.test(firstLink.getAttribute('href') || '') && /skip|content|main/i.test(firstLink.textContent || ''));

  const de = document.documentElement;
  // Mobile browsers zoom out to fit over-wide content (innerWidth grows), so compare with the device width.
  out.layoutViewportWidth = window.innerWidth;
  out.horizontalOverflowPx = Math.max(0, Math.max(de.scrollWidth, window.innerWidth) - deviceWidth);
  out.overflowOffenders = [];
  if (out.horizontalOverflowPx > 1) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right > deviceWidth + 2 && r.width > 0 && getComputedStyle(el).position !== 'fixed') {
        out.overflowOffenders.push(`${sel(el)} right=${Math.round(r.right)}`);
        if (out.overflowOffenders.length >= 6) break;
      }
    }
  }

  const imgs = [...document.images];
  out.images = {
    total: imgs.length,
    missingAlt: imgs.filter((i) => !i.hasAttribute('alt')).map((i) => sel(i) + ' ' + (i.currentSrc || i.src).split('/').pop().slice(0, 40)).slice(0, 8),
    missingDimensions: imgs.filter((i) => !i.getAttribute('width') && !i.getAttribute('height') && getComputedStyle(i).aspectRatio === 'auto').length,
    lazyAboveFold: imgs.filter((i) => i.loading === 'lazy' && i.getBoundingClientRect().top < window.innerHeight && i.getBoundingClientRect().top >= 0).length,
  };

  const controls = [...document.querySelectorAll('a[href],button,[role=button],[role=link],input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])')];
  out.controls = controls.length;
  out.unnamedControls = controls.filter((c) => vis(c) && !accName(c)).map(sel).slice(0, 10);
  out.clickableNonControls = [...document.querySelectorAll('div[onclick],span[onclick]')].filter((d) => !d.getAttribute('role')).length;
  out.positiveTabindex = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').length;
  out.deadLinks = [...document.querySelectorAll('a[href="#"],a[href=""],a[href^="javascript:"]')].filter(vis).length;

  if (isMobile) {
    const small = [];
    for (const c of controls) {
      if (!vis(c)) continue;
      const r = c.getBoundingClientRect();
      if (r.width <= 2 || r.height <= 2) continue; // visually hidden (skip links, sr-only)
      const inlineInText = c.tagName === 'A' && c.parentElement && /^(P|LI|SPAN|TD|DD)$/.test(c.parentElement.tagName) && (c.parentElement.textContent || '').trim().length > (c.textContent || '').trim().length + 15;
      if (!inlineInText && (r.width < 24 || r.height < 24)) small.push(`${sel(c)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    out.smallTargets = { count: small.length, samples: small.slice(0, 8) };
  }

  const fam = (q) => { const el = document.querySelector(q); return el ? getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim() : null; };
  out.fonts = {
    body: fam('body'), h1: fam('h1'), h2: fam('h2'), button: fam('button'), nav: fam('nav a'),
    loaded: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))].slice(0, 12),
  };

  // Palette and contrast sampling (heuristic: ignores background images, gradients, and overlap).
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = (el) => { let e = el; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c && c.a > 0.9) return c; e = e.parentElement; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const colorCount = {}, bgCount = {};
  let lowContrast = 0, contrastChecked = 0; const lowSamples = [];
  const textEls = [...document.body.querySelectorAll('p,span,a,li,h1,h2,h3,h4,h5,h6,button,label,td,th,small,figcaption,dd,dt')].slice(0, 1500);
  const srOnly = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return (r.width <= 2 && r.height <= 2) || /sr-only|visually-hidden|screen-reader/.test(typeof el.className === 'string' ? el.className : '') || cs.clipPath === 'inset(50%)' || /rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(cs.clip); };
  for (const el of textEls) {
    if (!vis(el) || srOnly(el)) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) continue;
    const cs = getComputedStyle(el);
    colorCount[cs.color] = (colorCount[cs.color] || 0) + 1;
    const fg = parse(cs.color); const bg = bgOf(el);
    if (!fg || !bg || fg.a < 0.9) continue;
    const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize); const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    contrastChecked++;
    if (ratio < (large ? 3 : 4.5)) { lowContrast++; if (lowSamples.length < 6) lowSamples.push(`${sel(el)} "${(el.textContent || '').trim().slice(0, 30)}" ${ratio.toFixed(2)}:1`); }
  }
  for (const el of [document.documentElement, document.body, ...document.body.querySelectorAll('section,header,footer,main,div')].slice(0, 800)) {
    const c = getComputedStyle(el).backgroundColor; const p = parse(c);
    if (p && p.a > 0.5) bgCount[c] = (bgCount[c] || 0) + 1;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ×${v}`);
  out.palette = { text: top(colorCount, 6), backgrounds: top(bgCount, 6) };
  out.contrast = { checked: contrastChecked, belowAA: lowContrast, samples: lowSamples, note: 'heuristic: solid backgrounds only' };

  const anims = document.getAnimations ? document.getAnimations() : [];
  out.motion = {
    runningAnimations: anims.filter((a) => a.playState === 'running').length,
    infiniteAnimations: anims.filter((a) => a.effect && a.effect.getTiming && a.effect.getTiming().iterations === Infinity).length,
    canvases: document.querySelectorAll('canvas').length,
    webglContexts: window.__ff ? window.__ff.webgl : null,
    videos: document.querySelectorAll('video').length,
    autoplayVideos: [...document.querySelectorAll('video')].filter((v) => v.autoplay || !v.paused).length,
    reducedMotionQueriesJS: window.__ff ? window.__ff.mq.filter((q) => /reduced-motion/.test(q)).length : null,
    willChangeElements: [...document.body.querySelectorAll('*')].slice(0, 4000).filter((e) => { const w = getComputedStyle(e).willChange; return w && w !== 'auto'; }).length,
  };
  let rmRules = 0, opaqueSheets = 0;
  const walk = (rules) => { for (const r of rules) { if (r.conditionText && /prefers-reduced-motion/.test(r.conditionText)) rmRules++; if (r.cssRules) walk(r.cssRules); } };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch { opaqueSheets++; } }
  out.motion.reducedMotionCssRules = rmRules;
  out.motion.unreadableStylesheets = opaqueSheets;

  const w = window;
  out.libraries = Object.entries({
    gsap: !!w.gsap, ScrollTrigger: !!(w.ScrollTrigger || (w.gsap && w.gsap.plugins && w.gsap.plugins.scrollTrigger)),
    three: !!(w.THREE || w.__THREE__), lenis: !!(w.lenis || w.Lenis || de.classList.contains('lenis')),
    locomotive: de.classList.contains('has-scroll-smooth') || !!document.querySelector('[data-scroll-container]'),
    barba: !!document.querySelector('[data-barba]'), swup: !!document.querySelector('#swup'),
    react: !!(document.querySelector('[data-reactroot]') || w.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size || [...document.querySelectorAll('body > div')].some((d) => Object.keys(d).some((k) => k.startsWith('__react')))),
    next: !!(w.__NEXT_DATA__ || w.__next_f), nuxt: !!(w.__NUXT__ || w.$nuxt), astro: !!document.querySelector('astro-island'),
    svelte: !!document.querySelector('[class*="svelte-"]'), vue: !!(w.__VUE__ || document.querySelector('[data-v-app]')),
    webflow: !!document.documentElement.getAttribute('data-wf-page'), framer: !!document.querySelector('[data-framer-name],#__framer-badge-container'),
    swiper: !!document.querySelector('.swiper'), lottie: !!(w.lottie || w.bodymovin || document.querySelector('lottie-player,dotlottie-player')),
    pixi: !!w.PIXI, spline: !!document.querySelector('spline-viewer'), rive: !!w.rive,
  }).filter(([, v]) => v).map(([k]) => k);

  const nav = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  const byType = {};
  for (const r of res) { const t = r.initiatorType; byType[t] = byType[t] || { n: 0, kb: 0 }; byType[t].n++; byType[t].kb += (r.transferSize || 0) / 1024; }
  for (const k in byType) byType[k].kb = Math.round(byType[k].kb);
  out.perf = {
    lcp: window.__ff?.lcp || null,
    cls: window.__ff ? Number(window.__ff.cls.toFixed(3)) : null,
    longTasks: window.__ff?.longTasks ?? null,
    longTaskMs: window.__ff ? Math.round(window.__ff.longTaskMs) : null,
    domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    loadMs: nav ? Math.round(nav.loadEventEnd) : null,
    requests: res.length,
    transferKBByType: byType,
    domNodes: document.getElementsByTagName('*').length,
    note: 'lab values from one headless run; cross-origin transfer sizes read 0 without Timing-Allow-Origin',
  };
  out.pageHeight = Math.max(de.scrollHeight, document.body.scrollHeight);
  return out;
};

const FOCUS_PROBE = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const pick = (cs) => [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderColor, cs.backgroundColor, cs.color, cs.textDecorationLine, cs.transform, cs.opacity, cs.clipPath, cs.clip, cs.top, cs.left, cs.width, cs.height, cs.visibility].join('|');
  const focused = pick(getComputedStyle(el));
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const inView = r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  const hit = inView ? document.elementFromPoint(Math.min(Math.max(cx, 0), innerWidth - 1), Math.min(Math.max(cy, 0), innerHeight - 1)) : null;
  const obscured = inView && hit && hit !== el && !el.contains(hit) && !hit.contains(el);
  const cs = getComputedStyle(el);
  const invisible = r.width < 1 || r.height < 1 || Number(cs.opacity) < 0.05 || cs.visibility === 'hidden' || !inView;
  el.blur();
  const blurred = pick(getComputedStyle(el));
  el.focus();
  const name = (el.getAttribute('aria-label') || el.innerText || el.textContent || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return { tag: el.tagName.toLowerCase(), name, indicator: focused !== blurred, obscured: !!obscured, invisible };
};

async function wheelScroll(page, vp, isMobile) {
  const steps = 4;
  for (let s = 0; s < steps; s++) {
    if (isMobile) await page.evaluate((dy) => window.scrollBy(0, dy), Math.round(vp.height * 0.2));
    else await page.mouse.wheel(0, Math.round(vp.height * 0.2));
    await sleep(110);
  }
  await sleep(750);
}

async function auditViewport(browser, url, vp, dir, label) {
  const isMobile = vp.width < 900;
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile, hasTouch: isMobile, reducedMotion: 'no-preference' });
  await ctx.addInitScript(INIT_SCRIPT);
  const page = await ctx.newPage();
  const log = { consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [] };
  page.on('console', (m) => { if (m.type() === 'error' && log.consoleErrors.length < 15) log.consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => { if (log.pageErrors.length < 15) log.pageErrors.push(String(e.message || e).slice(0, 200)); });
  page.on('requestfailed', (r) => { if (log.failedRequests.length < 15) log.failedRequests.push(`${r.failure()?.errorText} ${r.url().slice(0, 120)}`); });
  page.on('response', (r) => { if (r.status() >= 400 && log.httpErrors.length < 15) log.httpErrors.push(`${r.status()} ${r.url().slice(0, 120)}`); });
  const result = { viewport: `${vp.width}x${vp.height}`, shots: [], ...log };
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    if (resp && resp.status() >= 400) result.navigationError = `HTTP ${resp.status()}`;
  } catch (e) {
    const msg = String(e.message || e).split('\n')[0];
    // A load timeout still leaves a usable page; resolution/connection failures do not.
    if (/ERR_|NS_ERROR|Cannot navigate|net::/.test(msg) || !/Timeout/i.test(msg)) {
      result.navigationError = msg;
      await ctx.close();
      return result;
    }
    result.loadTimeout = true;
  }
  await sleep(opts.wait);
  const shot = async (name) => {
    const f = path.join(dir, `${label}-${name}.jpg`);
    try { await page.screenshot({ path: f, type: 'jpeg', quality: 72 }); result.shots.push(f); } catch (e) { result.shotError = String(e.message || e).split('\n')[0]; }
  };
  await shot('00-top');
  if (opts.fullPage) {
    const f = path.join(dir, `${label}-full.jpg`);
    try { await page.screenshot({ path: f, type: 'jpeg', quality: 60, fullPage: true }); result.shots.push(f); } catch { /* very tall pages can fail */ }
  }
  for (let i = 1; i <= opts.scrollShots; i++) {
    await wheelScroll(page, vp, isMobile);
    await shot(String(i).padStart(2, '0') + '-scroll');
  }
  result.scrollYAfter = await page.evaluate(() => Math.round(window.scrollY)).catch(() => null);
  try { Object.assign(result, await page.evaluate(COLLECT, { isMobile, deviceWidth: vp.width })); } catch (e) { result.collectError = String(e.message || e).split('\n')[0]; }
  result.consoleErrors = log.consoleErrors; result.pageErrors = log.pageErrors;
  await ctx.close();
  return result;
}

async function auditFocus(browser, url, vp) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const items = [];
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await sleep(opts.wait);
    for (let i = 0; i < opts.focusSteps; i++) {
      await page.keyboard.press('Tab');
      await sleep(60);
      const p = await page.evaluate(FOCUS_PROBE).catch(() => null);
      if (p) items.push(p);
    }
  } catch (e) {
    items.push({ error: String(e.message || e).split('\n')[0] });
  }
  await ctx.close();
  const real = items.filter((x) => !x.error);
  return {
    stops: real.length,
    noVisibleIndicator: real.filter((x) => !x.indicator && !x.invisible).map((x) => `${x.tag} "${x.name}"`).slice(0, 10),
    focusOnInvisible: real.filter((x) => x.invisible).map((x) => `${x.tag} "${x.name}"`).slice(0, 10),
    obscured: real.filter((x) => x.obscured && !x.invisible).map((x) => `${x.tag} "${x.name}"`).slice(0, 10),
    order: real.slice(0, 15).map((x) => `${x.tag}:${x.name}`),
    errors: items.filter((x) => x.error).map((x) => x.error),
  };
}

async function auditReduced(browser, url, vp, dir) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(INIT_SCRIPT);
  const page = await ctx.newPage();
  const res = {};
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await sleep(opts.wait);
    const f = path.join(dir, 'reduced-motion-00-top.jpg');
    await page.screenshot({ path: f, type: 'jpeg', quality: 72 });
    res.shot = f;
    await wheelScroll(page, vp, false);
    Object.assign(res, await page.evaluate(() => {
      const a = document.getAnimations ? document.getAnimations() : [];
      return { runningAnimations: a.filter((x) => x.playState === 'running').length, reducedMotionQueriesJS: window.__ff ? window.__ff.mq.filter((q) => /reduced-motion/.test(q)).length : null };
    }));
  } catch (e) {
    res.error = String(e.message || e).split('\n')[0];
  }
  await ctx.close();
  return res;
}

function summarize(r) {
  const L = [];
  const flag = (cond, text) => { if (cond) L.push('  ! ' + text); };
  L.push(`\n== ${r.url}`);
  L.push(`   out: ${r.dir}${r.sheet ? '\n   sheet: ' + r.sheet + '  (view this image first)' : ''}`);
  if (r.unreachable) {
    L.push(`  ! UNREACHABLE: ${r.viewports[0].navigationError} (nothing was audited)`);
    return L.join('\n');
  }
  for (const v of r.viewports) {
    if (v.navigationError) { L.push(`-- ${v.viewport}\n  ! navigation failed: ${v.navigationError}`); continue; }
    L.push(`-- ${v.viewport}  "${(v.title || '').slice(0, 60)}"  height=${v.pageHeight}px  scrollY(after)=${v.scrollYAfter}${v.loadTimeout ? '  (load event timed out; audited anyway)' : ''}`);
    L.push(`   fonts: body=${v.fonts?.body} h1=${v.fonts?.h1} | loaded: ${(v.fonts?.loaded || []).join(', ')}`);
    L.push(`   libs: ${(v.libraries || []).join(', ') || 'none detected'} | canvas=${v.motion?.canvases} webgl=${v.motion?.webglContexts} anims=${v.motion?.runningAnimations} (infinite ${v.motion?.infiniteAnimations}) will-change=${v.motion?.willChangeElements}`);
    L.push(`   perf: LCP=${v.perf?.lcp?.t ?? '?'}ms (${v.perf?.lcp?.el ?? '?'}) CLS=${v.perf?.cls} longTasks=${v.perf?.longTasks}/${v.perf?.longTaskMs}ms requests=${v.perf?.requests} DOM=${v.perf?.domNodes}`);
    L.push(`   palette text: ${(v.palette?.text || []).slice(0, 3).join(' · ')}`);
    L.push(`   palette bg:   ${(v.palette?.backgrounds || []).slice(0, 3).join(' · ')}`);
    L.push(`   structure: h1=${v.h1Count} skips=${v.headingLevelSkips} landmarks=${JSON.stringify(v.landmarks)} skipLink=${v.skipLink} lang=${v.lang}`);
    flag(v.pageErrors?.length, `uncaught errors: ${v.pageErrors.slice(0, 3).join(' | ')}`);
    flag(v.consoleErrors?.length, `console errors (${v.consoleErrors.length}): ${v.consoleErrors.slice(0, 2).join(' | ')}`);
    flag(v.httpErrors?.length, `HTTP errors: ${v.httpErrors.slice(0, 3).join(' | ')}`);
    flag(v.horizontalOverflowPx > 1, `horizontal overflow ${v.horizontalOverflowPx}px${v.layoutViewportWidth > parseInt(v.viewport) ? ' (mobile browser zoomed out to ' + v.layoutViewportWidth + 'px)' : ''}: ${(v.overflowOffenders || []).slice(0, 3).join('; ')}`);
    flag(v.h1Count !== 1, `h1 count = ${v.h1Count}`);
    flag(v.unnamedControls?.length, `controls without accessible name: ${v.unnamedControls.slice(0, 5).join(', ')}`);
    flag(v.images?.missingAlt?.length, `images missing alt: ${v.images.missingAlt.length}`);
    flag(v.images?.lazyAboveFold, `lazy-loaded images above the fold: ${v.images.lazyAboveFold}`);
    flag(v.smallTargets?.count, `targets < 24px (WCAG 2.5.8 candidates): ${v.smallTargets?.count} e.g. ${(v.smallTargets?.samples || []).slice(0, 3).join(', ')}`);
    flag(v.contrast?.belowAA, `text below AA contrast (heuristic): ${v.contrast?.belowAA}/${v.contrast?.checked} e.g. ${(v.contrast?.samples || []).slice(0, 2).join('; ')}`);
    flag(v.zoomBlocked, 'viewport meta blocks zoom');
    flag(v.deadLinks, `dead links (href="#"/javascript:): ${v.deadLinks}`);
    flag(v.perf?.cls > 0.1, `CLS ${v.perf?.cls} > 0.1`);
    flag(v.perf?.lcp?.t > 2500, `LCP ${v.perf?.lcp?.t}ms > 2500ms (lab, unthrottled)`);
  }
  if (r.focus) {
    L.push(`-- keyboard: ${r.focus.stops} tab stops; first: ${r.focus.order.slice(0, 6).join(' → ')}`);
    flag(r.focus.noVisibleIndicator.length, `no visible focus change: ${r.focus.noVisibleIndicator.slice(0, 5).join(', ')}`);
    flag(r.focus.focusOnInvisible.length, `focus lands on invisible/off-screen elements: ${r.focus.focusOnInvisible.slice(0, 5).join(', ')}`);
    flag(r.focus.obscured.length, `focused element covered by other content: ${r.focus.obscured.slice(0, 5).join(', ')}`);
    flag(r.focus.stops === 0, 'no focusable elements reached with Tab');
  }
  if (r.reduced) {
    const d = r.viewports[r.viewports.length - 1]?.motion || {};
    L.push(`-- reduced motion: running anims ${d.runningAnimations} → ${r.reduced.runningAnimations ?? '?'}; CSS rules=${d.reducedMotionCssRules} (unreadable sheets ${d.unreadableStylesheets}); JS queries=${r.reduced.reducedMotionQueriesJS}`);
    flag(!d.reducedMotionCssRules && !r.reduced.reducedMotionQueriesJS, 'no prefers-reduced-motion handling detected in readable CSS or matchMedia calls');
  }
  return L.join('\n');
}

const pw = loadPlaywright();
let browser;
try {
  browser = await pw.chromium.launch({ headless: true, ...(opts.chromium ? { executablePath: opts.chromium } : {}) });
} catch (e) {
  console.error('audit_page: could not launch Chromium. Run `npx playwright install chromium` or pass --chromium <path>.\n' + String(e.message || e).split('\n')[0]);
  process.exit(2);
}
const vps = opts.viewports.split(',').map((s) => { const [w, h] = s.toLowerCase().split('x').map(Number); return { width: w, height: h }; }).sort((a, b) => a.width - b.width);
const reports = [];
for (const raw of opts.urls) {
  const url = toUrl(raw);
  const dir = opts.out ? (opts.urls.length > 1 ? path.join(opts.out, slug(url)) : opts.out) : path.join(os.tmpdir(), 'ff-audit', `${slug(url)}-${stamp()}`);
  fs.mkdirSync(dir, { recursive: true });
  const report = { url, dir, at: new Date().toISOString(), viewports: [] };
  for (const vp of vps) report.viewports.push(await auditViewport(browser, url, vp, dir, `${vp.width}`));
  report.unreachable = report.viewports.every((v) => v.navigationError);
  if (!report.unreachable) {
    report.focus = await auditFocus(browser, url, vps[vps.length - 1]);
    if (opts.reduced) report.reduced = await auditReduced(browser, url, vps[vps.length - 1], dir);
  }
  try {
    const shots = fs.readdirSync(dir).filter((f) => /\.jpg$/.test(f) && !/full|sheet/.test(f)).map((f) => path.join(dir, f));
    if (shots.length) report.sheet = await makeSheet(browser, shots, path.join(dir, 'sheet.jpg'), url);
  } catch (e) { report.sheetError = String(e.message || e).split('\n')[0]; }
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
  reports.push(report);
  if (!opts.json) console.log(summarize(report));
}
await browser.close();
if (opts.json) console.log(JSON.stringify(reports, null, 2));
