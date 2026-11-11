#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// See motion instead of imagining it. Plays one moment of a page in slow motion
// and lays the frames out as a filmstrip with timestamps, next to an inventory
// of what actually animated (target, properties, duration, delay, easing).
// Spacing between frames shows the easing; order and overlap show the
// choreography; frames after an interruption show whether motion retargets.
//
// Usage:
//   node motion_strip.mjs <url|file> --trigger <what> [options]
// Triggers:
//   load                      the page's entrance, from navigation
//   hover:<selector>          pointer enters the element
//   click:<selector>          a click (menus, tabs, dialogs, toggles)
//   focus:<selector>          keyboard focus lands on the element
//   key:<Key>                 a key press, e.g. key:Escape
//   scroll:<from>-<to>        scroll positions in px, sampled evenly (scrubbed and scroll-triggered motion)
// Options:
//   --before <trigger>        Run one action first, at normal speed (e.g. open the menu, then capture its hover)
//   --span <ms>               Animation time to cover (default 900; 1800 for load)
//   --frames <n>              Frames across the span (default 10)
//   --rate <n>                Slow-motion factor (default 0.1 = ten times slower)
//   --interrupt <ms>          Undo the trigger at this animation time (unhover, click again, blur, the key again):
//                             shows whether motion retargets from where it is, or jumps
//   --exit <trigger|undo>     After the span, play the way back and capture it too (undo, or e.g. key:Escape,
//                             click:#close): shows the reversal, and whether the exit is shorter than the entrance
//   --clip <selector|viewport>  What each frame shows (default: around the target; viewport for load and scroll)
//   --viewport <WxH>          Default 1440x900. Under 900 wide the page is emulated as a touch device,
//                             so hover styles behind (hover: hover) correctly do not apply
//   --reduced                 Add a second strip under prefers-reduced-motion: reduce
//   --wait <ms>               Settle time after load before the trigger (default 1200)
//   --out <dir>               Output directory (default: <tmp>/ff-motion/<slug>-<time>)
//   --json                    Print the inventory as JSON
//
// Also measured: layout shift during the moment (something being pushed), and
// each animation's declared delay (a response that starts late).
//
// How the slow motion works: CSS animations, transitions and the Web Animations
// API are slowed through the DevTools animation playback rate; JavaScript clocks
// (requestAnimationFrame timestamps, performance.now, Date.now, timers) are
// scaled by the same factor. Video and network time are not slowed.
// Playwright is resolved as in audit_page.mjs (project first, then FF_PLAYWRIGHT_DIR).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SHEET_CSS, dataUri, esc, launch, parseViewports, renderHtml, sleep, slug, stamp, toUrl } from './browser.mjs';

const args = process.argv.slice(2);
const opts = { target: null, trigger: null, before: null, span: null, frames: 10, rate: 0.1, interrupt: null, exit: null, clip: null, viewport: '1440x900', reduced: false, wait: 1200, out: null, json: false };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const next = () => args[++i];
  if (a === '--trigger') opts.trigger = next();
  else if (a === '--before') opts.before = next();
  else if (a === '--span') opts.span = Number(next());
  else if (a === '--frames') opts.frames = Number(next());
  else if (a === '--rate') opts.rate = Number(next());
  else if (a === '--interrupt') opts.interrupt = Number(next());
  else if (a === '--exit') opts.exit = next();
  else if (a === '--clip') opts.clip = next();
  else if (a === '--viewport') opts.viewport = next();
  else if (a === '--reduced') opts.reduced = true;
  else if (a === '--wait') opts.wait = Number(next());
  else if (a === '--out') opts.out = next();
  else if (a === '--json') opts.json = true;
  else if (a === '-h' || a === '--help') {
    const header = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(2);
    console.log(header.slice(0, header.findIndex((l) => !l.startsWith('//'))).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(0);
  } else if (a.startsWith('--')) { console.error(`motion_strip: unknown option ${a}. See --help.`); process.exit(2); }
  else opts.target = a;
}
const fail = (m) => { console.error('motion_strip: ' + m); process.exit(2); };
if (!opts.target) fail('pass a URL or an HTML file. See --help.');
if (!/^[a-z]+:\/\//i.test(opts.target) && !fs.existsSync(opts.target)) fail(`no such file: ${opts.target}`);
const parseTrigger = (text) => {
  const m = /^(load)$|^(hover|click|focus|key|scroll):(.+)$/.exec(text || '');
  if (!m) return null;
  return m[1] ? { kind: 'load' } : { kind: m[2], arg: m[3] };
};
const trigger = parseTrigger(opts.trigger);
if (!trigger) fail('--trigger takes load, hover:<selector>, click:<selector>, focus:<selector>, key:<Key> or scroll:<from>-<to>');
const before = opts.before ? parseTrigger(opts.before) : null;
if (opts.before && (!before || before.kind === 'load' || before.kind === 'scroll')) fail('--before takes hover:, click:, focus: or key:');
const interactive = ['hover', 'click', 'focus', 'key'].includes(trigger.kind);
const exitWith = opts.exit && opts.exit !== 'undo' ? parseTrigger(opts.exit) : null;
if (opts.exit && !interactive) fail('--exit needs a hover:, click:, focus: or key: trigger to come back from');
if (opts.exit && opts.exit !== 'undo' && (!exitWith || exitWith.kind === 'load' || exitWith.kind === 'scroll')) fail('--exit takes undo, hover:, click:, focus: or key:');
if (opts.interrupt !== null && !(opts.interrupt >= 0)) fail('--interrupt takes a time in ms');
if (trigger.kind === 'scroll' && !/^\d+-\d+$/.test(trigger.arg)) fail('scroll takes <from>-<to> in px, for example scroll:0-2400');
if (!(opts.rate > 0 && opts.rate <= 1)) fail('--rate takes a number above 0 and up to 1');
if (!(opts.frames >= 2 && opts.frames <= 40)) fail('--frames takes 2 to 40');
let vp;
try { [vp] = parseViewports(opts.viewport); } catch (e) { fail(e.message); }
const span = opts.span || (trigger.kind === 'load' ? 1800 : 900);
const narrow = vp.width < 900;
const url = toUrl(opts.target);
const dir = opts.out || path.join(os.tmpdir(), 'ff-motion', `${slug(url)}-${stamp()}`);
fs.mkdirSync(dir, { recursive: true });

// Scales the page's JavaScript clocks. Installed before any page script.
/* eslint-disable no-undef */
const CLOCK = (initialRate) => {
  const realNow = performance.now.bind(performance), realDate = Date.now.bind(Date);
  let rate = initialRate, baseReal = realNow(), baseVirt = baseReal, dateReal = realDate(), dateVirt = dateReal;
  const virt = (real) => baseVirt + (real - baseReal) * rate;
  performance.now = () => virt(realNow());
  Date.now = () => Math.round(dateVirt + (realDate() - dateReal) * rate);
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => cb(virt(ts)));
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
  window.setTimeout = (fn, t, ...rest) => st(fn, (t || 0) / rate, ...rest);
  window.setInterval = (fn, t, ...rest) => si(fn, (t || 0) / rate, ...rest);
  window.__ffSetRate = (next) => {
    const now = realNow(); baseVirt = virt(now); baseReal = now;
    const d = realDate(); dateVirt += (d - dateReal) * rate; dateReal = d; rate = next;
  };
  // Layout shifts, counted whether or not input was recent: during a designed moment any shift is a finding.
  const shift = { n: 0, v: 0 };
  const take = (list) => { for (const e of list) { shift.n++; shift.v += e.value; } };
  let po = null;
  try { po = new PerformanceObserver((l) => take(l.getEntries())); po.observe({ type: 'layout-shift', buffered: true }); } catch { /* unsupported */ }
  window.__ffShift = (reset) => { if (po) take(po.takeRecords()); const out = { count: shift.n, score: Number(shift.v.toFixed(4)) }; if (reset) { shift.n = 0; shift.v = 0; } return out; };
};

const INVENTORY = () => {
  const describe = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else { const c = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2); if (c.length) s += '.' + c.join('.'); }
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 16);
    return text ? `${s} "${text}"` : s;
  };
  const skip = new Set(['offset', 'easing', 'composite', 'computedOffset']);
  return (document.getAnimations ? document.getAnimations() : []).map((a) => {
    const e = a.effect;
    if (!e || !e.target || !e.target.getBoundingClientRect) return null;
    const t = e.getTiming();
    let props = [], first = {}, frameEase = null;
    try {
      const kf = e.getKeyframes();
      props = [...new Set(kf.flatMap((k) => Object.keys(k)))].filter((p) => !skip.has(p));
      if (kf[0]) { frameEase = kf[0].easing; for (const p of props) first[p] = String(kf[0][p]).slice(0, 70); }
    } catch { /* effect without keyframes */ }
    const el = e.target; const r = el.getBoundingClientRect();
    return {
      kind: a.constructor.name.replace('CSS', '').toLowerCase(), name: a.animationName || a.transitionProperty || a.id || '',
      target: describe(el), control: el.matches('a,button,[role=button],input,select,summary,label,[tabindex]'),
      props, first, duration: typeof t.duration === 'number' ? Math.round(t.duration) : 0, delay: Math.round(t.delay || 0),
      easing: t.easing && t.easing !== 'linear' ? t.easing : (frameEase || 'linear'), iterations: t.iterations === Infinity ? 'infinite' : t.iterations,
      start: typeof a.startTime === 'number' ? Math.round(a.startTime) : null,
      transitionAll: a.constructor.name === 'CSSTransition' && /(^|,\s*)all\b/.test(getComputedStyle(el).transitionProperty), area: Math.round(r.width * r.height),
    };
  }).filter(Boolean);
};
/* eslint-enable no-undef */

const EASE_NAMES = { 'cubic-bezier(0.25, 0.1, 0.25, 1)': 'ease', 'cubic-bezier(0.42, 0, 1, 1)': 'ease-in', 'cubic-bezier(0, 0, 0.58, 1)': 'ease-out', 'cubic-bezier(0.42, 0, 0.58, 1)': 'ease-in-out' };
const easeName = (e) => EASE_NAMES[e] || (e.startsWith('linear(') ? 'linear() curve' : e);
const LAYOUT = /^(width|height|top|left|right|bottom|inset|margin|padding|font-size|line-height|gap|grid-template)/i;

async function act(page, t, inverse = false) {
  if (t.kind === 'hover') return inverse ? page.mouse.move(1, vp.height - 1) : page.hover(t.arg, { timeout: 8000 });
  if (t.kind === 'click') return narrow ? page.tap(t.arg, { timeout: 8000 }) : page.click(t.arg, { timeout: 8000 });
  if (t.kind === 'focus') return page.locator(t.arg).first().evaluate((el, off) => (off ? el.blur() : el.focus()), inverse);
  if (t.kind === 'key') return page.keyboard.press(t.arg);
  return null;
}

async function clipFor(page) {
  if (opts.clip === 'viewport' || trigger.kind === 'load' || trigger.kind === 'scroll' || trigger.kind === 'key') {
    if (!opts.clip || opts.clip === 'viewport') return null;
  }
  const selector = opts.clip && opts.clip !== 'viewport' ? opts.clip : trigger.arg;
  const box = await page.locator(selector).first().boundingBox().catch(() => null);
  if (!box) return null;
  const pad = opts.clip ? 16 : 140;
  const x = Math.max(0, Math.floor(box.x - pad)), y = Math.max(0, Math.floor(box.y - pad));
  const width = Math.min(vp.width - x, Math.ceil(box.width + pad * 2)), height = Math.min(vp.height - y, Math.ceil(box.height + pad * 2));
  return width > 20 && height > 20 ? { x, y, width, height } : null;
}

async function capture(browser, reduced) {
  const tag = reduced ? 'reduced' : 'full';
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: narrow, hasTouch: narrow, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const slowFromStart = trigger.kind === 'load';
  await ctx.addInitScript(CLOCK, slowFromStart ? opts.rate : 1);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e).slice(0, 160)));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Animation.enable').catch(() => {});
  const setRate = async (rate) => {
    await cdp.send('Animation.setPlaybackRate', { playbackRate: rate }).catch(() => {});
    await page.evaluate((r) => window.__ffSetRate && window.__ffSetRate(r), rate).catch(() => {});
  };
  const frames = []; const seen = new Map(); const baseline = new Set(); const instances = new Set();
  let phase = 'in', shift = null;
  const shoot = async (label, clip) => {
    const file = path.join(dir, `${tag}-${String(frames.length).padStart(2, '0')}.jpg`);
    for (let attempt = 0; ; attempt++) {                           // right after navigation there may be nothing painted yet
      try { await page.screenshot({ path: file, type: 'jpeg', quality: 70, ...(clip ? { clip } : {}) }); break; }
      catch (e) { if (attempt >= 5) throw e; await sleep(90); }
    }
    frames.push({ file, label });
    for (const a of await page.evaluate(INVENTORY).catch(() => [])) {
      const key = [a.target, a.kind, a.name, a.props.join(','), a.duration, a.delay].join('|');
      const instance = key + '|' + a.start;
      if (phase === 'out' && instances.has(instance)) continue;      // still held from the way in (a finished animation with fill)
      if (phase === 'in') instances.add(instance);
      if (!seen.has(phase + '|' + key)) seen.set(phase + '|' + key, { ...a, phase, key });
    }
  };

  if (trigger.kind === 'scroll') {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await sleep(opts.wait);
    const m = /^(\d+)-(\d+)$/.exec(trigger.arg);
    const from = Number(m[1]), to = Number(m[2]);
    await page.evaluate(() => window.__ffShift && window.__ffShift(true)).catch(() => {});
    for (let k = 0; k < opts.frames; k++) {
      const y = Math.round(from + ((to - from) * k) / (opts.frames - 1));
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await sleep(260);
      await shoot(`y=${y}`, null);
    }
  } else {
    const step = span / (opts.frames - 1);
    let clip = null, t0;
    if (trigger.kind === 'load') {
      await cdp.send('Animation.setPlaybackRate', { playbackRate: opts.rate }).catch(() => {});
      await page.goto(url, { waitUntil: 'commit', timeout: 45000 });
      t0 = Date.now();
    } else {
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      await sleep(opts.wait);
      if (before) { await act(page, before); await sleep(700); }
      clip = await clipFor(page);
      await setRate(opts.rate);
      await shoot('before', clip);
      for (const a of seen.values()) baseline.add(a.key);   // whatever already ran belongs to the page, not to this trigger
      await page.evaluate(() => window.__ffShift && window.__ffShift(true)).catch(() => {});
      await act(page, trigger);
      t0 = Date.now();
    }
    let reversed = false;
    for (let k = trigger.kind === 'load' ? 0 : 1; k < opts.frames; k++) {
      const due = t0 + (k * step) / opts.rate;
      const waitMs = due - Date.now();
      if (waitMs > 0) await sleep(waitMs);
      const at = Math.round((Date.now() - t0) * opts.rate);
      if (opts.interrupt !== null && !reversed && at >= opts.interrupt) { await act(page, trigger, true); reversed = true; }
      await shoot(`${reversed ? '↩ ' : ''}${at} ms`, clip);
    }
    if (opts.exit) {
      await sleep(160 / opts.rate);                                // let the way in come to rest first
      await shoot('at rest', clip);
      phase = 'out';
      await (exitWith ? act(page, exitWith) : act(page, trigger, true));
      const t1 = Date.now();
      for (let k = 1; k < opts.frames; k++) {
        const waitMs = t1 + (k * step) / opts.rate - Date.now();
        if (waitMs > 0) await sleep(waitMs);
        await shoot(`← ${Math.round((Date.now() - t1) * opts.rate)} ms`, clip);
      }
    }
  }
  shift = await page.evaluate(() => (window.__ffShift ? window.__ffShift(false) : null)).catch(() => null);
  await ctx.close();
  const mine = [...seen.values()].filter((a) => !baseline.has(a.key));
  return { tag, frames, animations: mine.filter((a) => a.phase === 'in'), exitAnimations: mine.filter((a) => a.phase === 'out'), layoutShift: shift, errors };
}

function questions(run) {
  const Q = []; const anims = run.animations.filter((a) => a.iterations !== 'infinite');
  const ask = (id, text) => Q.push({ id, text });
  const moving = [...new Set(anims.map((a) => a.target))];
  const easeIn = anims.filter((a) => easeName(a.easing) === 'ease-in');
  if (easeIn.length) ask('ease-in', `${easeIn.length} animation(s) use ease-in (${easeIn[0].target}). It delays the first frames, which is when the eye is watching. Is a slow start meant?`);
  const linear = anims.filter((a) => a.easing === 'linear' && a.duration >= 120 && a.props.some((p) => p !== 'opacity'));
  if (linear.length) ask('linear', `${linear.length} movement(s) run at constant speed (${linear[0].target}). Nothing physical moves like that unless it is a mechanism.`);
  const defaults = anims.filter((a) => ['ease', 'ease-in-out'].includes(easeName(a.easing)));
  if (anims.length >= 3 && defaults.length === anims.length) ask('default-curves', 'Every animation uses a browser-default curve. Which curve belongs to this project\'s motion character (motion_tokens.mjs)?');
  const layout = anims.filter((a) => a.props.some((p) => LAYOUT.test(p)));
  if (layout.length) ask('layout-props', `${layout.length} animation(s) change layout properties (${[...new Set(layout.flatMap((a) => a.props.filter((p) => LAYOUT.test(p))))].slice(0, 4).join(', ')}). Can transform, opacity or clip-path do it?`);
  const zero = anims.filter((a) => /scale\(0(?:[,)]|\.0+\))|matrix\(0, 0, 0, 0/.test(a.first.transform || '') || a.first.scale === '0');
  if (zero.length) ask('from-nothing', `${zero.length} element(s) grow from scale 0 (${zero[0].target}). Nothing appears from nothing; start near 0.9 to 0.97 with opacity.`);
  const all = anims.filter((a) => a.transitionAll);
  if (all.length) ask('transition-all', `${[...new Set(all.map((a) => a.target))].length} element(s) use transition: all. Name the properties that are meant to move.`);
  const longest = Math.max(0, ...anims.map((a) => a.duration));
  if (interactive && longest > 300) ask('slow-response', `The longest response to this ${trigger.kind} is ${longest} ms. How many times a day will someone trigger it?`);
  const soonest = anims.length ? Math.min(...anims.map((a) => a.delay)) : 0;
  if (interactive && soonest >= 100) ask('late-response', `Nothing starts until ${soonest} ms after the ${trigger.kind}: every animation declares a delay. What tells the person they were heard in the first 100 ms?`);
  const keyframed = anims.filter((a) => a.kind !== 'transition');
  if (interactive && keyframed.length) ask('keyframes-on-trigger', `${keyframed.length} keyframe animation(s) answer this ${trigger.kind} (${keyframed[0].target}). Keyframes restart from their first frame when triggered again mid-flight; a transition continues from where it is. Run with --interrupt and look.`);
  const out = (run.exitAnimations || []).filter((a) => a.iterations !== 'infinite');
  const longestOut = Math.max(0, ...out.map((a) => a.duration));
  if (anims.length && out.length && longestOut > longest + 20) ask('slow-exit', `The way back takes ${longestOut} ms and the way in took ${longest} ms. The person has already decided to leave: exits are shorter.`);
  const sh = run.layoutShift;
  if (sh && sh.score > 0.01) ask('layout-shift', `The layout shifted during this moment (score ${sh.score} over ${sh.count} shift(s)). Something is being pushed or resized: which element moved that was not meant to?`);
  if (anims.length) {
    const starts = anims.map((a) => (a.start ?? 0) + a.delay);
    const total = Math.round(Math.max(...anims.map((a, i) => starts[i] + a.duration)) - Math.min(...starts));
    if (trigger.kind === 'load' && total > 1400) ask('long-entrance', `The entrance takes about ${total} ms to come to rest. Can a visitor read and act before it ends?`);
    if (interactive && total > 600) ask('long-sequence', `The whole response lasts about ${total} ms. Does the interface wait for its own performance?`);
  }
  const groups = new Map();
  for (const a of anims) { const k = `${a.duration}|${a.props.join(',')}`; (groups.get(k) || groups.set(k, []).get(k)).push((a.start ?? 0) + a.delay); }
  for (const [k, list] of groups) {
    const s = [...new Set(list)].sort((x, y) => x - y);
    if (s.length < 4) continue;
    const gaps = s.slice(1).map((v, i) => v - s[i]);
    if (Math.max(...gaps) - Math.min(...gaps) <= 3 && gaps[0] >= 15) ask('uniform-stagger', `${s.length} elements enter at an identical ${gaps[0]} ms step (${k.split('|')[1]}), ${gaps[0] * (s.length - 1)} ms in all. A wave has a lead and shrinking gaps; a metronome does not.`);
  }
  if (moving.length > 14 && trigger.kind !== 'scroll') ask('too-many-movers', `${moving.length} elements move. Which one is the lead, and which could simply be there?`);
  if (!anims.length && trigger.kind !== 'scroll') ask('nothing-moved', run.tag === 'reduced' ? 'Nothing animates under reduced motion. Check the frames: is every piece of content and every control still present?' : 'No CSS or Web Animations ran. Either the motion is driven from JavaScript (read the frames), or this moment has no motion: is that the decision?');
  return Q;
}

const browser = await launch('motion_strip');
const runs = [];
try {
  runs.push(await capture(browser, false));
  if (opts.reduced) runs.push(await capture(browser, true));
} catch (e) {
  await browser.close().catch(() => {});
  const line = String(e.message || e).split('\n')[0];
  console.error('motion_strip: ' + (/Timeout/i.test(line) ? `could not reach the trigger's element within 8 s (${line.slice(0, 120)}). Check the selector, and use --before if something has to be opened first.` : line));
  process.exit(1);
}
for (const r of runs) r.questions = questions(r);
if (opts.reduced) {
  const moves = runs[1].animations.filter((a) => a.props.some((p) => /transform|translate|scale|rotate/.test(p)) && a.duration > 200 && a.area > 12000);
  if (moves.length) runs[1].questions.push({ id: 'reduced-still-moves', text: `${moves.length} large movement(s) still run under reduced motion (${moves[0].target}). Replace travel with a short cross-fade.` });
}

// When the motion is much shorter or longer than the strip, say which --span would show it properly.
function spanHint(run) {
  const timed = run.animations.filter((a) => a.iterations !== 'infinite');
  if (!timed.length || trigger.kind === 'scroll') return null;
  const first = Math.min(...timed.map((a) => a.start ?? 0));
  const end = Math.round(Math.max(...timed.map((a) => (a.start ?? 0) - first + a.delay + a.duration)));
  const round50 = (v) => Math.ceil(v / 50) * 50;
  if (end < span * 0.5) return `the motion is over by about ${end} ms and the strip covers ${span} ms: re-run with --span ${Math.max(200, round50(end * 1.3))} to read its easing across more frames`;
  if (end > span * 1.05) return `the motion runs to about ${end} ms and the strip stops at ${span} ms: re-run with --span ${round50(end * 1.15)} to see it come to rest`;
  return null;
}
const hint = spanHint(runs[0]);

const strip = (r) => `<h2>${r.tag === 'reduced' ? 'prefers-reduced-motion: reduce' : 'full motion'} · ${esc(opts.trigger)}${trigger.kind === 'scroll' ? '' : ` · slowed ×${opts.rate}`}</h2><div class="strip">${r.frames.map((f) => `<figure><img src="${dataUri(f.file)}"><figcaption>${esc(f.label)}</figcaption></figure>`).join('')}</div>`;
const perRow = runs[0].frames.length <= 8 ? runs[0].frames.length : Math.ceil(runs[0].frames.length / Math.ceil(runs[0].frames.length / 8));
const html = `<!doctype html><meta charset="utf-8"><style>${SHEET_CSS} .strip{display:grid;grid-template-columns:repeat(${perRow},max-content);gap:6px} .strip img{height:${perRow > 6 ? 200 : 260}px}</style><h1>motion strip · ${esc(url)}</h1>${runs.map(strip).join('')}`;
const sheet = await renderHtml(browser, html, path.join(dir, 'strip.jpg'), { quality: 74 });
await browser.close();

const report = { url, trigger: opts.trigger, before: opts.before, rate: opts.rate, spanMs: span, viewport: opts.viewport, strip: sheet, dir,
  touch: narrow, exit: opts.exit, hint,
  runs: runs.map((r) => ({ mode: r.tag, frames: r.frames.map((f) => f.label), layoutShift: r.layoutShift,
    animations: r.animations.map((a) => ({ ...a, easing: easeName(a.easing) })), exitAnimations: r.exitAnimations.map((a) => ({ ...a, easing: easeName(a.easing) })),
    questions: r.questions, errors: r.errors })) };
fs.writeFileSync(path.join(dir, 'motion.json'), JSON.stringify(report, null, 2));

if (opts.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`strip: ${sheet}  (view this image: spacing shows easing, order shows choreography)`);
  for (const r of runs) {
    const list = r.animations.filter((a) => a.iterations !== 'infinite').sort((a, b) => ((a.start ?? 0) + a.delay) - ((b.start ?? 0) + b.delay));
    const origin = list.length ? Math.min(...list.map((a) => (a.start ?? 0) + a.delay)) : 0;
    console.log(`\n-- ${r.tag === 'reduced' ? 'reduced motion' : 'full motion'}: ${list.length} animation(s) on ${new Set(list.map((a) => a.target)).size} element(s)${r.animations.length - list.length ? `, ${r.animations.length - list.length} infinite loop(s)` : ''}`);
    for (const a of list.slice(0, 16)) console.log(`   +${String(Math.round((a.start ?? 0) + a.delay - origin)).padStart(4)} ms  ${String(a.duration).padStart(4)} ms  ${easeName(a.easing).padEnd(34)} ${a.props.join(',').padEnd(18)} ${a.target}`);
    if (list.length > 16) console.log(`   ... ${list.length - 16} more in motion.json`);
    const back = r.exitAnimations.filter((a) => a.iterations !== 'infinite').sort((a, b) => ((a.start ?? 0) + a.delay) - ((b.start ?? 0) + b.delay));
    if (opts.exit) {
      const o2 = back.length ? Math.min(...back.map((a) => (a.start ?? 0) + a.delay)) : 0;
      console.log(`   the way back (${opts.exit}): ${back.length} animation(s)${back.length ? '' : ': it is instant, or driven from JavaScript (read the frames)'}`);
      for (const a of back.slice(0, 10)) console.log(`   ←${String(Math.round((a.start ?? 0) + a.delay - o2)).padStart(4)} ms  ${String(a.duration).padStart(4)} ms  ${easeName(a.easing).padEnd(34)} ${a.props.join(',').padEnd(18)} ${a.target}`);
    }
    if (r.layoutShift) console.log(`   layout shift during the moment: ${r.layoutShift.score} (${r.layoutShift.count} shift(s))`);
    for (const q of r.questions) console.log(`  ? [${q.id}] ${q.text}`);
    for (const e of r.errors.slice(0, 2)) console.log(`  ! ${e}`);
  }
  if (hint) console.log(`\nnote: ${hint}.`);
  if (narrow && trigger.kind === 'hover') console.log('\nnote: this is a touch viewport. Hover styles behind (hover: hover) do not apply here, which is correct; check that nothing depends on them.');
  console.log('\nJudge from the frames, not from the code:');
  console.log('  - What changed in the first frame after the trigger? Something has to answer at once.');
  console.log('  - Where does the movement come from, and is that the thing the person acted on?');
  console.log('  - Could a stranger tell from the frames alone what was triggered and what it did?');
  console.log('A strip cannot tell you how it feels at speed, on a real device, or the fiftieth time. Say so in the report.');
}
