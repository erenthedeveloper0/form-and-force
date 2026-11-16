#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Render every Form & Force brand asset from brand/source.
//
//   brand/source/tokens.json     colours, finishes, typefaces
//   brand/source/mark.json       the mark's geometry
//   brand/source/wordmark.json   the wordmark, outlined (brand/source/type.py)
//   brand/fonts/*.woff2          the typefaces, for type set inside compositions
//
// Vector files (logos, icons, the glint) are written directly. Raster files
// (banners, social preview, plugin icon, favicons, previews) are rendered in
// Chromium through the skill's own browser module, so the brand needs the same
// optional Playwright install as the rendered tools and nothing else. Every
// file written is recorded with its SHA-256 in brand/manifest.json, which the
// repository validator uses as the provenance record for brand media.
//
// Usage:
//   node brand/build.mjs              write every asset (needs Playwright, see docs/development/brand-and-site.md)
//   node brand/build.mjs --svg        write the vector files only (no browser)
//   node brand/build.mjs --check      exit 1 if any committed vector file differs from its source (no browser)
// Zero dependencies beyond Node 18 built-ins and, for rasters, Playwright.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const read = (rel) => JSON.parse(fs.readFileSync(path.join(HERE, rel), 'utf8'));
const TOKENS = read('source/tokens.json');
const MARK = read('source/mark.json');
const WORD = read('source/wordmark.json');
const C = Object.fromEntries(Object.entries(TOKENS.palette).map(([k, v]) => [k, v.value]));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (n) => (Math.round(n * 100) / 100).toString();
const NAME = 'Form & Force';

// ---------------------------------------------------------------- geometry

const [, , MW, MH] = MARK.viewBox;
const CAP = WORD.capHeight;                       // the unit every lockup is measured in

// The mark, scaled to a height, as SVG elements. `fill` is a finish name or a colour.
function markGroup({ height, x = 0, y = 0, fill, id }) {
  const s = height / MH;
  let defs = '';
  let paint = fill;
  if (TOKENS.finish[fill]) {
    const [x1, y1] = MARK.light.from;
    const [x2, y2] = MARK.light.to;
    const stops = TOKENS.finish[fill].stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
    defs = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
    paint = `url(#${id})`;
  }
  const body = `<g transform="translate(${num(x)} ${num(y)}) scale(${num(s * 1000) / 1000})" fill="${paint}">`
    + `<path d="${MARK.strokes.form}"/><path d="${MARK.strokes.force}"/></g>`;
  return { defs, body, width: MW * s, height };
}

function wordGroup({ variant, x = 0, baseline = 0, fill }) {
  const v = WORD.variants[variant];
  return { body: `<path transform="translate(${num(x)} ${num(baseline)})" fill="${fill}" d="${v.d}"/>`, width: v.width, lines: v.lines.length };
}

// Lockups are measured in cap heights of the wordmark. See brand/guidelines/logo.md.
const LOCKUPS = {
  horizontal: { mark: 2.7, gap: 1.7, rule: true, word: 'one-display' },
  stacked: { mark: 3.25, gap: 1.35, rule: true, word: 'two-display' },
  compact: { mark: 1.75, gap: 0.75, rule: false, word: 'one-small' },
  vertical: { mark: 3, gap: 1.1, rule: false, word: 'one-display', vertical: true },
};

const SCHEMES = {
  'on-dark': { mark: 'satin', rule: C.ash, word: C.paper },
  'on-light': { mark: 'graphite', rule: C.silver, word: C.ink },
  paper: { mark: C.paper, rule: C.paper, ruleOpacity: 0.4, word: C.paper },
  ink: { mark: C.ink, rule: C.ink, ruleOpacity: 0.35, word: C.ink },
  currentcolor: { mark: 'currentColor', rule: 'currentColor', ruleOpacity: 0.4, word: 'currentColor' },
};

function lockup(kind, scheme, idPrefix = 'ff') {
  const L = LOCKUPS[kind];
  const S = SCHEMES[scheme];
  const v = WORD.variants[L.word];
  const markH = L.mark * CAP;
  const lastBaseline = v.baselines[v.baselines.length - 1];
  const textTop = -CAP;
  const parts = [];
  let defs = '';
  let width;
  let top;
  let bottom;
  if (L.vertical) {
    const m = markGroup({ height: markH, fill: S.mark, id: `${idPrefix}-${scheme}-v` });
    const wordW = v.width;
    width = Math.max(wordW, m.width);
    const mx = (width - m.width) / 2;
    const baseline = markH + L.gap * CAP + CAP;
    const mg = markGroup({ height: markH, x: mx, y: 0, fill: S.mark, id: `${idPrefix}-${scheme}-v` });
    defs += mg.defs;
    parts.push(mg.body, wordGroup({ variant: L.word, x: (width - wordW) / 2, baseline, fill: S.word }).body);
    top = 0;
    bottom = baseline + 6;   // descender-free wordmark: the baseline is the bottom, plus overshoot
  } else {
    const blockMid = (textTop + lastBaseline) / 2;
    const my = blockMid - markH / 2;
    const mg = markGroup({ height: markH, x: 0, y: my, fill: S.mark, id: `${idPrefix}-${scheme}-${kind}` });
    defs += mg.defs;
    parts.push(mg.body);
    let x = mg.width + L.gap * CAP;
    if (L.rule) {
      const rw = Math.max(CAP * 0.04, 24);
      parts.push(`<rect x="${num(x)}" y="${num(my)}" width="${num(rw)}" height="${num(markH)}" fill="${S.rule}"${S.ruleOpacity ? ` fill-opacity="${S.ruleOpacity}"` : ''}/>`);
      x += rw + L.gap * CAP;
    }
    parts.push(wordGroup({ variant: L.word, x, baseline: 0, fill: S.word }).body);
    width = x + v.width;
    top = Math.min(my, textTop);
    bottom = Math.max(my + markH, lastBaseline + 6);
  }
  const h = bottom - top;
  return { viewBox: [0, top, width, h].map(num).join(' '), defs, body: parts.join(''), width, height: h };
}

function svgDoc({ viewBox, defs = '', body, label = NAME, extra = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${esc(label)}"${extra}>`
    + `<title>${esc(label)}</title>${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>\n`;
}

// ---------------------------------------------------------------- vector files

const roundedTile = (size, r) => `M${r} 0H${size - r}C${size - r * 0.45} 0 ${size} ${r * 0.45} ${size} ${r}V${size - r}C${size} ${size - r * 0.45} ${size - r * 0.45} ${size} ${size - r} ${size}H${r}C${r * 0.45} ${size} 0 ${size - r * 0.45} 0 ${size - r}V${r}C0 ${r * 0.45} ${r * 0.45} 0 ${r} 0Z`;

// App-icon tiles. The mark sits slightly right of centre, because its weight
// leans that way; the tile is 1024 units with a 228-unit corner.
const TILES = {
  night: { ground: [[0, '#16151f'], [0.55, C.dusk], [1, C.void]], edge: C.lavender, edgeOpacity: 0.16, mark: 'satin' },
  silver: { ground: [[0, '#f4f3f6'], [0.5, C.frost], [1, '#a9a8b6']], edge: '#ffffff', edgeOpacity: 0.6, mark: 'graphite' },
  violet: { ground: [[0, C.amethyst], [0.45, '#3a2f74'], [1, C.ultramarine]], edge: C.lavender, edgeOpacity: 0.3, mark: 'satin', violet: true },
};

// `markHeight` is the tile's optical size: the favicon carries a larger mark,
// because at 16 px the app-icon proportion leaves it a few pixels tall.
function tile(kind, idPrefix = 'ff-tile', markHeight = 470) {
  const T = TILES[kind];
  const size = 1024;
  const id = `${idPrefix}-${kind}`;
  const stops = T.ground.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
  const width = MW * markHeight / MH;
  const mg = markGroup({ height: markHeight, x: (size - width) / 2 + markHeight * 0.03, y: (size - markHeight) / 2, fill: T.mark, id: `${id}-mark` });
  let light = '';
  if (T.violet) {
    light = `<radialGradient id="${id}-bloom" cx="0.28" cy="0.18" r="0.75"><stop offset="0" stop-color="${C.lavender}" stop-opacity="0.55"/><stop offset="0.5" stop-color="${C.violet}" stop-opacity="0.25"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>`;
  } else {
    light = `<radialGradient id="${id}-bloom" cx="0.3" cy="0.12" r="0.9"><stop offset="0" stop-color="#ffffff" stop-opacity="${kind === 'silver' ? 0.5 : 0.06}"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;
  }
  const defs = `<linearGradient id="${id}-ground" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient>${light}`
    + `<clipPath id="${id}-clip"><path d="${roundedTile(size, 228)}"/></clipPath>${mg.defs}`;
  const body = `<g clip-path="url(#${id}-clip)"><rect width="${size}" height="${size}" fill="url(#${id}-ground)"/>`
    + `<rect width="${size}" height="${size}" fill="url(#${id}-bloom)"/></g>`
    + `<path d="${roundedTile(size, 228)}" fill="none" stroke="${T.edge}" stroke-opacity="${T.edgeOpacity}" stroke-width="6" transform="translate(3 3) scale(${num((size - 6) / size)})"/>`
    + mg.body;
  return { viewBox: `0 0 ${size} ${size}`, defs, body };
}

// The glint: the specular point where a crest peaks. Four points, long on the
// axis of the crest, short across it.
const GLINT_D = 'M50 0C52 34 58 46 100 50C58 54 52 66 50 100C48 66 42 54 0 50C42 46 48 34 50 0Z';

function vectorFiles() {
  const files = {};
  const put = (rel, svg) => { files[rel] = svg; };
  const markDir = 'brand/identity/mark';
  for (const [name, fill] of [['satin', 'satin'], ['graphite', 'graphite'], ['paper', C.paper], ['ink', C.ink], ['currentcolor', 'currentColor']]) {
    const m = markGroup({ height: MH, fill, id: `ff-mark-${name}` });
    put(`${markDir}/form-and-force-mark-${name}.svg`, svgDoc({ viewBox: `0 0 ${MW} ${MH}`, defs: m.defs, body: m.body }));
  }
  for (const kind of Object.keys(LOCKUPS)) {
    const schemes = kind === 'compact' ? ['on-dark', 'on-light', 'currentcolor'] : ['on-dark', 'on-light', 'paper', 'ink'].concat(kind === 'horizontal' ? ['currentcolor'] : []);
    for (const scheme of schemes) {
      const l = lockup(kind, scheme);
      put(`brand/identity/lockup/form-and-force-${kind}-${scheme}.svg`, svgDoc(l));
    }
  }
  for (const [name, fill] of [['paper', C.paper], ['ink', C.ink], ['currentcolor', 'currentColor']]) {
    const v = WORD.variants['one-display'];
    put(`brand/identity/wordmark/form-and-force-wordmark-${name}.svg`,
      svgDoc({ viewBox: `0 ${-CAP} ${num(v.width)} ${CAP + 6}`, body: wordGroup({ variant: 'one-display', fill }).body }));
  }
  for (const kind of Object.keys(TILES)) put(`brand/identity/icon/form-and-force-tile-${kind}.svg`, svgDoc(tile(kind)));
  // Favicon: the night tile, which reads on light and dark browser chrome alike.
  put('brand/identity/icon/favicon.svg', svgDoc(tile('night', 'fav', 640)));
  put('brand/graphics/form-and-force-glint.svg', svgDoc({
    viewBox: '0 0 100 100', label: 'Glint',
    defs: `<radialGradient id="g"><stop offset="0" stop-color="${C.glint}"/><stop offset="0.6" stop-color="${C.lavender}"/><stop offset="1" stop-color="${C.periwinkle}"/></radialGradient>`,
    body: `<path d="${GLINT_D}" fill="url(#g)"/>`,
  }));
  return files;
}

// ---------------------------------------------------------------- compositions (raster)

// Folds: sheets whose edges catch a raking light. Each crest is a cubic path
// in fractions of the canvas, and each sheet is the region on one side of it.
// Light is drawn along the crest and clipped to its sheet, so it falls off into
// the fold the way it does on silk instead of glowing in the air. Only crests
// carry light; the one glint sits on a crest.
const P = (pts, w, h) => {
  const [m, ...cs] = pts;
  return `M${num(m[0] * w)} ${num(m[1] * h)}` + cs.map((c) => `C${c.map(([x, y]) => `${num(x * w)} ${num(y * h)}`).join(' ')}`).join('');
};
const stopsOf = (list) => list.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${C[c] || c}" stop-opacity="${a}"/>`).join('');
const GRAIN = (id, seed) => `<filter id="${id}" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45"/></filter>`;

function foldScene(scene, w, h, id = 'f') {
  const S = SCENES[scene];
  let defs = GRAIN(`${id}-grain`, S.seed ?? 7);
  defs += `<linearGradient id="${id}-ground" x1="${S.groundAxis?.[0] ?? 0}" y1="${S.groundAxis?.[1] ?? 0}" x2="${S.groundAxis?.[2] ?? 1}" y2="${S.groundAxis?.[3] ?? 1}">${stopsOf(S.ground || [[0, 'void'], [1, 'void']])}</linearGradient>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#${id}-ground)"/>`;
  S.layers.forEach((L, i) => {
    const sid = `${id}-s${i}`;
    const crest = P(L.crest, w, h);
    const region = crest + L.close.map(([x, y]) => `L${num(x * w)} ${num(y * h)}`).join('') + 'Z';
    const [ax, ay] = L.crest[0];
    const last = L.crest[L.crest.length - 1];
    const [bx, by] = last[last.length - 1];
    const spread = L.spread * w / 2560;
    defs += `<linearGradient id="${sid}-along" gradientUnits="userSpaceOnUse" x1="${num(ax * w)}" y1="${num(ay * h)}" x2="${num(bx * w)}" y2="${num(by * h)}">${stopsOf(L.along)}</linearGradient>`;
    defs += `<clipPath id="${sid}-clip"><path d="${region}"/></clipPath>`;
    for (const [k, sd] of [['a', spread], ['b', spread * 0.32], ['c', spread * 0.08], ['soft', L.soft ?? w / 1600]]) {
      defs += `<filter id="${sid}-${k}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${num(sd)}"/></filter>`;
    }
    if (L.body) {
      const b = L.body;
      let paint = C[b] || b;
      if (typeof b === 'object') {
        defs += `<linearGradient id="${sid}-body" x1="${b.axis[0]}" y1="${b.axis[1]}" x2="${b.axis[2]}" y2="${b.axis[3]}">${stopsOf(b.stops)}</linearGradient>`;
        paint = `url(#${sid}-body)`;
      }
      body += `<path d="${region}" fill="${paint}" filter="url(#${sid}-soft)"/>`;
    }
    body += `<g clip-path="url(#${sid}-clip)">`
      + `<path d="${crest}" fill="none" stroke="url(#${sid}-along)" stroke-width="${num(spread * 6)}" stroke-opacity="${L.depth ?? 0.5}" filter="url(#${sid}-a)"/>`
      + `<path d="${crest}" fill="none" stroke="url(#${sid}-along)" stroke-width="${num(spread * 1.6)}" stroke-opacity="${L.sheen ?? 0.7}" filter="url(#${sid}-b)"/>`
      + '</g>'
      + `<path d="${crest}" fill="none" stroke="url(#${sid}-along)" stroke-width="${num(Math.max(1.1, w / 1500))}" stroke-opacity="${L.edge ?? 0.85}" filter="url(#${sid}-c)"/>`;
  });
  if (S.glint) {
    const [gx, gy] = S.glint;
    const r = w / 44;
    defs += `<radialGradient id="${id}-halo"><stop offset="0" stop-color="${C.glint}" stop-opacity="0.95"/><stop offset="0.12" stop-color="${C.glint}" stop-opacity="0.55"/><stop offset="0.4" stop-color="${C.lavender}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/></radialGradient>`;
    body += `<circle cx="${num(gx * w)}" cy="${num(gy * h)}" r="${num(r)}" fill="url(#${id}-halo)"/>`
      + `<path transform="translate(${num(gx * w - r * 0.42)} ${num(gy * h - r * 0.42)}) scale(${num(r * 0.0084)})" d="${GLINT_D}" fill="${C.glint}" fill-opacity="0.9"/>`;
  }
  body += `<rect width="${w}" height="${h}" filter="url(#${id}-grain)" opacity="${S.grain ?? 0.07}" style="mix-blend-mode:soft-light"/>`;
  return { defs, body };
}

// Scenes, drawn from the storyboard's panels. Coordinates are fractions of the
// canvas; spreads are in pixels at 2560 wide and scale with the canvas.
const SCENES = {
  // The storyboard's hero: a long swell from the left that falls away before
  // the centre, a veil dropping from the top right to a peak, and a low fold
  // running out to the right. The centre stays dark for the lockup.
  hero: {
    layers: [
      { crest: [[-0.02, 0.6], [[0.12, 0.5], [0.24, 0.52], [0.31, 0.7]], [[0.35, 0.82], [0.37, 0.93], [0.38, 1.04]]], close: [[-0.02, 1.04]],
        along: [[0, 'periwinkle', 0.25], [0.35, 'periwinkle', 0.85], [0.7, 'lavender', 0.55], [1, 'periwinkle', 0]], spread: 36, depth: 0.42, body: 'void' },
      { crest: [[0.735, -0.04], [[0.75, 0.2], [0.79, 0.4], [0.766, 0.6]], [[0.745, 0.76], [0.68, 0.88], [0.6, 1.04]]], close: [[1.04, 1.04], [1.04, -0.04]],
        along: [[0, 'periwinkle', 0.1], [0.4, 'lavender', 0.9], [0.6, 'lavender', 1], [0.85, 'periwinkle', 0.4], [1, 'slate', 0]], spread: 50, depth: 0.55,
        body: { axis: [0, 0, 1, 0.4], stops: [[0, '#0b0b16'], [0.6, '#11122a'], [1, '#181a3a']] } },
      { crest: [[0.6, 1.04], [[0.7, 0.72], [0.86, 0.58], [1.04, 0.56]]], close: [[1.04, 1.04]],
        along: [[0, 'violet', 0], [0.3, 'periwinkle', 0.75], [0.7, 'violet', 0.6], [1, 'violet', 0.35]], spread: 40, depth: 0.32, sheen: 0.5,
        body: { axis: [0, 0, 1, 1], stops: [[0, '#07060e'], [1, '#0e0c22']] } },
    ],
    glint: [0.7662, 0.6],
  },
  // The hero without its left swell, for formats that carry text on the left.
  get veil() { return { layers: SCENES.hero.layers.slice(1), glint: SCENES.hero.glint }; },
  // A single ridge crossing the frame: the storyboard's release card.
  ridge: {
    layers: [
      { crest: [[0.1, -0.04], [[0.3, 0.12], [0.55, 0.2], [0.72, 0.42]], [[0.82, 0.55], [0.92, 0.62], [1.04, 0.7]]], close: [[1.04, 1.04], [-0.04, 1.04], [-0.04, -0.04]],
        along: [[0, 'periwinkle', 0], [0.35, 'lavender', 0.7], [0.5, 'lavender', 1], [1, 'violet', 0.35]], spread: 44, depth: 0.4,
        body: { axis: [0, 0, 1, 1], stops: [[0, '#06060c'], [1, '#0c0b1a']] } },
    ],
    glint: [0.5, 0.235],
  },
  // A fold rising from the foot of the frame: the storyboard's closing card.
  drift: {
    layers: [
      { crest: [[0.26, 1.04], [[0.32, 0.8], [0.38, 0.62], [0.5, 0.42]], [[0.56, 0.3], [0.6, 0.12], [0.62, -0.04]]], close: [[-0.04, -0.04], [-0.04, 1.04]],
        along: [[0, 'ultramarine', 1], [0.45, 'violet', 0.55], [1, 'periwinkle', 0]], spread: 46, depth: 0.62, body: '#05050b' },
    ],
  },
  // The silver ground: the storyboard's light panel. A dark fold stands at the
  // right with a cold rim, and violet folds rise in front of it from the foot.
  silver: {
    ground: [[0, 'pewter'], [0.45, '#9796a8'], [0.72, 'silver'], [0.88, '#d4d9ee'], [1, 'frost']], groundAxis: [0, 0, 1, 0.25], seed: 11, grain: 0.06,
    layers: [
      { crest: [[0.76, -0.04], [[0.81, 0.24], [0.79, 0.52], [0.86, 0.7]], [[0.9, 0.8], [0.97, 0.84], [1.04, 0.84]]], close: [[1.04, -0.04]],
        along: [[0, 'frost', 0.6], [0.5, '#ffffff', 0.95], [1, 'lavender', 0.4]], spread: 30, depth: 0.25, sheen: 0.45, soft: 3,
        body: { axis: [0, 0, 1, 1], stops: [[0, '#2c3360'], [0.6, '#1b1f3d'], [1, '#11121f']] } },
      { crest: [[0.34, 1.04], [[0.5, 0.82], [0.66, 0.74], [0.8, 0.72]], [[0.9, 0.7], [0.96, 0.62], [1.04, 0.5]]], close: [[1.04, 1.04]],
        along: [[0, 'lavender', 0.3], [0.6, 'lavender', 0.9], [1, 'frost', 0.6]], spread: 34, depth: 0.35, sheen: 0.55, soft: 3,
        body: { axis: [0, 1, 1, 0], stops: [[0, 'ultramarine'], [0.55, 'violet'], [1, '#9b99c9']] } },
      { crest: [[0.6, 1.04], [[0.72, 0.92], [0.84, 0.88], [1.04, 0.86]]], close: [[1.04, 1.04]],
        along: [[0, 'periwinkle', 0], [0.5, 'lavender', 0.6], [1, 'periwinkle', 0.3]], spread: 26, depth: 0.3, soft: 3,
        body: { axis: [0, 1, 1, 0], stops: [[0, '#1b1f3d'], [1, '#42447e']] } },
    ],
  },
};

const fontFaces = () => ['PlusJakartaSans', 'JetBrainsMono'].map((f) => {
  const data = fs.readFileSync(path.join(HERE, 'fonts', `${f}.woff2`)).toString('base64');
  const family = f === 'PlusJakartaSans' ? 'Plus Jakarta Sans' : 'JetBrains Mono';
  return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${data}) format('woff2');font-weight:100 900}`;
}).join('');

const page = (w, h, inner, bg = C.void) => `<!doctype html><meta charset="utf-8"><style>${fontFaces()}
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${bg}}
  .stage{position:relative;width:${w}px;height:${h}px;overflow:hidden;font-family:'Plus Jakarta Sans';-webkit-font-smoothing:antialiased}
  .stage>svg.bg{position:absolute;inset:0}
  .abs{position:absolute}
  .caps{text-transform:uppercase;letter-spacing:.32em;font-weight:500}
</style><div class="stage">${inner}</div>`;

const inlineSvg = (o, attrs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${o.viewBox}" ${attrs} aria-hidden="true"><defs>${o.defs || ''}</defs>${o.body}</svg>`;

function bg(scene, w, h, id) {
  const s = foldScene(scene, w, h, id);
  return `<svg class="bg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${s.defs}</defs>${s.body}</svg>`;
}

function placedLockup(kind, scheme, { height, cx, cy, left, top, id }) {
  const l = lockup(kind, scheme, id);
  const scale = height / l.height;
  const wpx = l.width * scale;
  const x = left ?? cx - wpx / 2;
  const y = top ?? cy - height / 2;
  return `<svg class="abs" style="left:${num(x)}px;top:${num(y)}px;width:${num(wpx)}px;height:${num(height)}px" viewBox="${l.viewBox}" aria-hidden="true"><defs>${l.defs}</defs>${l.body}</svg>`;
}

const COMPOSITIONS = {
  'brand/applications/github/form-and-force-banner-dark.webp': {
    size: [2560, 800], format: 'webp', use: 'README header in dark mode (shown at half size)',
    html: (w, h) => page(w, h, bg('hero', w, h, 'bd')
      + placedLockup('horizontal', 'on-dark', { height: 132, cx: w / 2, cy: h / 2, id: 'bd' })
      + `<div class="abs caps" style="left:96px;top:84px;font-size:19px;color:${C.mist};opacity:.85">Decide. Build. Judge.</div>`
      + `<div class="abs" style="right:96px;top:80px;font-size:21px;color:${C.mist};letter-spacing:.02em">Agent Skill · Claude Code plugin</div>`),
  },
  'brand/applications/github/form-and-force-banner-light.webp': {
    size: [2560, 800], format: 'webp', use: 'README header in light mode (shown at half size)',
    html: (w, h) => page(w, h, bg('silver', w, h, 'bl')
      + placedLockup('horizontal', 'on-light', { height: 120, left: 168, cy: h / 2 - 34, id: 'bl' })
      + `<div class="abs caps" style="left:172px;top:${h / 2 + 62}px;font-size:19px;color:#2a2a36">Creative direction · Interface design · Motion engineering</div>`, C.silver),
  },
  'brand/applications/github/form-and-force-social-preview.jpg': {
    size: [1280, 640], format: 'jpeg', use: 'GitHub social preview (Settings > General > Social preview) and the documentation\'s Open Graph image',
    html: (w, h) => page(w, h, bg('veil', w, h, 'sp')
      + placedLockup('horizontal', 'on-dark', { height: 92, left: 96, cy: h / 2 - 30, id: 'sp' })
      + `<div class="abs" style="left:100px;top:${h / 2 + 46}px;width:640px;font-size:27px;line-height:1.4;color:${C.mist};font-weight:400">Creative direction, interface design and motion engineering for coding agents.</div>`
      + `<div class="abs caps" style="left:100px;bottom:64px;font-size:14px;color:${C.mist};opacity:.75">Open source · MIT</div>`),
  },
  'brand/graphics/form-and-force-fold-dark.webp': {
    size: [1920, 1080], format: 'webp', use: 'background for dark documentation and presentation surfaces; the left side stays clear for text',
    html: (w, h) => page(w, h, bg('veil', w, h, 'fd')),
  },
  'brand/graphics/form-and-force-fold-ridge.webp': {
    size: [1920, 1080], format: 'webp', use: 'alternative dark background: a single ridge crossing the frame, for compositions with little text',
    html: (w, h) => page(w, h, bg('ridge', w, h, 'frg')),
  },
  'brand/graphics/form-and-force-fold-light.webp': {
    size: [1920, 1080], format: 'webp', use: 'background for light documentation and presentation surfaces',
    html: (w, h) => page(w, h, bg('silver', w, h, 'fl'), C.silver),
  },
  'brand/graphics/form-and-force-fold-drift.webp': {
    size: [1920, 1080], format: 'webp', use: 'alternative dark background: a single rising fold',
    html: (w, h) => page(w, h, bg('drift', w, h, 'fdr')),
  },
  '.claude-plugin/icon.png': {
    size: [1024, 1024], format: 'png', use: 'Claude Code plugin listing icon (opaque, full bleed: listings apply their own mask)',
    html: (w, h) => page(w, h, `<svg class="bg" viewBox="0 0 1024 1024"><defs><radialGradient id="pi" cx="0.32" cy="0.14" r="0.95"><stop offset="0" stop-color="#1d1b2c"/><stop offset="0.55" stop-color="${C.dusk}"/><stop offset="1" stop-color="${C.void}"/></radialGradient>${markGroup({ height: 480, fill: 'satin', id: 'pim' }).defs}</defs><rect width="1024" height="1024" fill="url(#pi)"/>${markGroup({ height: 480, x: (1024 - MW * 480 / MH) / 2 + 14, y: 272, fill: 'satin', id: 'pim' }).body}</svg>`),
  },
  'brand/identity/icon/apple-touch-icon.png': {
    size: [180, 180], format: 'png', use: 'iOS home-screen icon for the documentation site (opaque; iOS masks it)',
    html: (w, h) => page(w, h, `<svg class="bg" viewBox="0 0 1024 1024"><defs><radialGradient id="ai" cx="0.32" cy="0.14" r="0.95"><stop offset="0" stop-color="#1d1b2c"/><stop offset="0.55" stop-color="${C.dusk}"/><stop offset="1" stop-color="${C.void}"/></radialGradient>${markGroup({ height: 560, fill: 'satin', id: 'aim' }).defs}</defs><rect width="1024" height="1024" fill="url(#ai)"/>${markGroup({ height: 560, x: (1024 - MW * 560 / MH) / 2 + 14, y: 232, fill: 'satin', id: 'aim' }).body}</svg>`),
  },
};

for (const kind of Object.keys(TILES)) {
  COMPOSITIONS[`brand/identity/icon/form-and-force-tile-${kind}.png`] = {
    size: [1024, 1024], format: 'png', transparent: true, use: `the ${kind} app-icon tile as a raster, for tools that do not take SVG`,
    html: (w, h) => page(w, h, inlineSvg(tile(kind, `r-${kind}`), `width="${w}" height="${h}"`), 'transparent'),
  };
}
for (const scheme of ['on-dark', 'on-light']) {
  COMPOSITIONS[`brand/identity/lockup/form-and-force-horizontal-${scheme}.png`] = {
    size: [2400, 400], format: 'png', transparent: true, fit: true, use: `the primary lockup ${scheme.replace('-', ' ')} as a transparent raster`,
    html: (w, h) => page(w, h, placedLockup('horizontal', scheme, { height: 320, left: 40, top: 40, id: `p-${scheme}` }), 'transparent'),
  };
}

// ---------------------------------------------------------------- previews

function swatch(name, hex, role, dark) {
  return `<div style="display:flex;flex-direction:column;gap:8px;width:180px"><div style="height:84px;border-radius:10px;background:${hex};outline:1px solid ${dark ? '#ffffff14' : '#00000014'}"></div>`
    + `<div style="font-size:15px;color:${C.paper};font-weight:500">${esc(name)}</div><div style="font:13px 'JetBrains Mono';color:${C.mist}">${hex}</div>`
    + `<div style="font-size:12px;line-height:1.4;color:#76768a">${esc(role)}</div></div>`;
}

function boardHtml(images) {
  const img = (rel, style) => `<img src="${images[rel]}" style="display:block;${style}">`;
  const panel = (inner, style = '') => `<div style="border-radius:18px;overflow:hidden;outline:1px solid #ffffff12;position:relative;${style}">${inner}</div>`;
  const groups = ['ground', 'light', 'chroma', 'silver', 'type'];
  const sw = groups.map((g) => `<div style="display:flex;gap:18px;flex-wrap:wrap">${Object.entries(TOKENS.palette).filter(([, v]) => v.group === g).map(([k, v]) => swatch(k, v.value, v.role, true)).join('')}</div>`).join('');
  const lockups = (scheme, bgc) => `<div style="background:${bgc};border-radius:18px;padding:56px;display:flex;flex-direction:column;gap:56px;align-items:flex-start;outline:1px solid #ffffff12">`
    + ['horizontal', 'stacked', 'compact'].map((k) => {
      const l = lockup(k, scheme, `b-${scheme}-${k}`);
      const hpx = k === 'compact' ? 44 : k === 'stacked' ? 120 : 96;
      return `<svg style="height:${hpx}px;width:${num(l.width / l.height * hpx)}px" viewBox="${l.viewBox}"><defs>${l.defs}</defs>${l.body}</svg>`;
    }).join('') + '</div>';
  const specimen = `<div style="padding:56px;background:${C.night};border-radius:18px;outline:1px solid #ffffff12;color:${C.paper}">`
    + `<div class="caps" style="font-size:13px;color:${C.mist};margin-bottom:28px">Type</div>`
    + `<div style="font-size:84px;font-weight:300;letter-spacing:-0.01em;line-height:1">Decide. Build. Judge.</div>`
    + `<div style="font-size:30px;font-weight:400;margin-top:28px;color:${C.paper}">Plus Jakarta Sans, 200–800. Display at Light, text at Regular.</div>`
    + `<div style="font-size:19px;font-weight:400;margin-top:18px;max-width:900px;line-height:1.6;color:${C.mist}">A direction is dealt, drawn and chosen by looking. The built page is judged cold, from pictures, against the page anyone would have made.</div>`
    + `<div style="font:20px/1.6 'JetBrains Mono';margin-top:28px;color:${C.lavender}">node scripts/deal.mjs hand --register composed</div>`
    + `<div class="caps" style="font-size:13px;color:${C.mist};margin-top:28px">Captions · tracked capitals · 0.32 em</div></div>`;
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces()}body{margin:0;background:#000;font-family:'Plus Jakarta Sans';-webkit-font-smoothing:antialiased;color:${C.paper}}
  .caps{text-transform:uppercase;letter-spacing:.32em;font-weight:500}</style>
  <div style="width:2400px;padding:64px;box-sizing:border-box;display:flex;flex-direction:column;gap:28px">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><div class="caps" style="font-size:14px;color:${C.mist}">Form &amp; Force · brand board</div><div style="font-size:14px;color:#76768a">Rendered by brand/build.mjs from brand/source. Every value on this sheet comes from tokens.json.</div></div>
    ${panel(img('brand/applications/github/form-and-force-banner-dark.webp', 'width:2272px'))}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px">${panel(img('brand/applications/github/form-and-force-banner-light.webp', 'width:100%'))}${panel(img('brand/applications/github/form-and-force-social-preview.jpg', 'width:100%'))}</div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:28px;align-items:stretch">
      <div style="display:flex;gap:28px;padding:48px;background:#050509;border-radius:18px;outline:1px solid #ffffff12;align-items:center">${['night', 'silver', 'violet'].map((k) => img(`brand/identity/icon/form-and-force-tile-${k}.png`, 'width:190px;height:190px')).join('')}</div>
      ${lockups('on-dark', C.night)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px">${lockups('on-light', '#f3f2f7')}${specimen}</div>
    <div style="padding:56px;background:${C.night};border-radius:18px;outline:1px solid #ffffff12"><div class="caps" style="font-size:13px;color:${C.mist};margin-bottom:28px">Colour · sampled from the storyboard</div><div style="display:flex;flex-direction:column;gap:30px">${sw}</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px">${['form-and-force-fold-dark', 'form-and-force-fold-ridge', 'form-and-force-fold-light'].map((f) => panel(img(`brand/graphics/${f}.webp`, 'width:100%'))).join('')}</div>
  </div>`;
}

// Alternatives explored for each application, with the reason one was chosen.
const VARIATIONS = [
  { title: 'Social preview', items: [
    { label: 'A · the veil, lockup left, one line', note: 'Chosen. Reads at card size; the line says what it is.', html: (w, h) => COMPOSITIONS['brand/applications/github/form-and-force-social-preview.jpg'].html(w, h) },
    { label: 'B · centred lockup on the ridge', note: 'Kept. Calmer, but says nothing about the product.', html: (w, h) => page(w, h, bg('ridge', w, h, 'vb') + placedLockup('horizontal', 'on-dark', { height: 96, cx: w / 2, cy: h / 2, id: 'vb' })) },
    { label: 'C · silver, stacked lockup', note: 'Kept for light contexts. Loses contrast in dark feeds.', html: (w, h) => page(w, h, bg('silver', w, h, 'vc') + placedLockup('stacked', 'on-light', { height: 150, left: 110, cy: h / 2, id: 'vc' }), C.silver) },
    { label: 'D · drift fold, lockup right', note: 'Kept. Closest to the storyboard\'s closing card; too quiet at thumbnail size.', html: (w, h) => page(w, h, bg('drift', w, h, 'vd') + placedLockup('horizontal', 'on-dark', { height: 80, left: 640, cy: h / 2, id: 'vd' })) },
  ] },
  { title: 'Lockups', items: [
    { label: 'Horizontal, with rule', note: 'Primary. The storyboard\'s hero arrangement.', html: (w, h) => page(w, h, placedLockup('horizontal', 'on-dark', { height: 110, cx: w / 2, cy: h / 2, id: 'l1' }), C.night) },
    { label: 'Stacked, with rule', note: 'Secondary, for squarer spaces. The storyboard\'s second card.', html: (w, h) => page(w, h, placedLockup('stacked', 'on-dark', { height: 150, cx: w / 2, cy: h / 2, id: 'l2' }), C.night) },
    { label: 'Compact, no rule', note: 'For headers and small sizes; the wordmark is cut at 420.', html: (w, h) => page(w, h, placedLockup('compact', 'on-dark', { height: 64, cx: w / 2, cy: h / 2, id: 'l3' }), C.night) },
    { label: 'Vertical', note: 'For square formats only: avatars, slides, stickers.', html: (w, h) => page(w, h, placedLockup('vertical', 'on-dark', { height: 210, cx: w / 2, cy: h / 2, id: 'l4' }), C.night) },
  ] },
  { title: 'Grounds', items: [
    { label: 'Hero folds', note: 'The README banner. The veil (its right half) backs the social preview and the documentation.', html: (w, h) => page(w, h, bg('hero', w, h, 'g1')) },
    { label: 'Ridge', note: 'Alternative; for compositions with little text.', html: (w, h) => page(w, h, bg('ridge', w, h, 'g2')) },
    { label: 'Drift', note: 'Alternative; holds a lockup on the right.', html: (w, h) => page(w, h, bg('drift', w, h, 'g3')) },
    { label: 'Silver', note: 'Every light application.', html: (w, h) => page(w, h, bg('silver', w, h, 'g4'), C.silver) },
  ] },
];

// ---------------------------------------------------------------- output

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

function writeIfChanged(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  if (!fs.existsSync(abs) || !fs.readFileSync(abs).equals(buf)) fs.writeFileSync(abs, buf);
  return buf;
}

function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(([size, png], i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e); header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8); header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...pngs.map(([, p]) => p)]);
}

async function shoot(browser, html, [w, h], { format, transparent, quality = 92 }) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const png = await p.screenshot({ type: 'png', omitBackground: !!transparent });
  let out = png;
  if (format === 'jpeg') out = await p.screenshot({ type: 'jpeg', quality });
  if (format === 'webp') {
    const b64 = png.toString('base64');
    const data = await p.evaluate(async ([src, q]) => {
      const img = new Image(); img.src = src; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', q);
    }, [`data:image/png;base64,${b64}`, quality / 100]);
    out = Buffer.from(data.split(',')[1], 'base64');
  }
  await p.close();
  return out;
}

async function rasters(manifest) {
  const { launch } = await import(path.join(ROOT, 'skills/form-and-force/scripts/browser.mjs'));
  const browser = await launch('brand/build');
  manifest.renderer = `Chromium ${browser.version()}`;
  const images = {};
  for (const [rel, comp] of Object.entries(COMPOSITIONS)) {
    const buf = await shoot(browser, comp.html(...comp.size), comp.size, comp);
    writeIfChanged(rel, buf);
    images[rel] = `data:image/${comp.format === 'jpeg' ? 'jpeg' : comp.format};base64,${buf.toString('base64')}`;
    manifest.files[rel] = { use: comp.use, size: comp.size, sha256: sha256(buf) };
    console.log(rel);
  }
  const fav = vectorFiles()['brand/identity/icon/favicon.svg'];
  const sizes = [];
  for (const s of [16, 32, 48]) {
    sizes.push([s, await shoot(browser, page(s, s, fav.replace('<svg ', `<svg width="${s}" height="${s}" `), 'transparent'), [s, s], { format: 'png', transparent: true })]);
  }
  const icoBuf = writeIfChanged('brand/identity/icon/favicon.ico', ico(sizes));
  manifest.files['brand/identity/icon/favicon.ico'] = { use: 'favicon for browsers that do not take SVG (16, 32 and 48 px)', size: [48, 48], sha256: sha256(icoBuf) };
  console.log('brand/identity/icon/favicon.ico');

  for (const [rel, html, width] of [['brand/previews/form-and-force-brand-board.jpg', boardHtml(images), 2400], ['brand/previews/form-and-force-variations.jpg', variationsHtml(), 2400]]) {
    const p = await browser.newPage({ viewport: { width, height: 800 }, deviceScaleFactor: 1 });
    await p.setContent(html, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const buf = await p.screenshot({ type: 'jpeg', quality: 84, fullPage: true });
    await p.close();
    writeIfChanged(rel, buf);
    manifest.files[rel] = { use: rel.includes('board') ? 'the brand system on one sheet' : 'alternatives explored for each application, with the choice and the reason', sha256: sha256(buf) };
    console.log(rel);
  }
  await browser.close();
}

function variationsHtml() {
  const [w, h] = [1280, 640];
  const cell = (it) => `<figure style="margin:0;display:flex;flex-direction:column;gap:12px"><iframe srcdoc="${esc(it.html(w, h))}" style="width:${w}px;height:${h}px;border:0;transform:scale(.425);transform-origin:0 0;margin:0 -${num(w * 0.575)}px -${num(h * 0.575)}px 0;border-radius:24px"></iframe>`
    + `<figcaption style="font-size:15px;color:${C.paper}">${esc(it.label)}<div style="color:${C.mist};font-size:13px;margin-top:4px">${esc(it.note)}</div></figcaption></figure>`;
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces()}body{margin:0;background:#000;font-family:'Plus Jakarta Sans';-webkit-font-smoothing:antialiased;color:${C.paper}}</style>
  <div style="width:2400px;padding:64px;box-sizing:border-box">
  <div style="font-size:14px;letter-spacing:.32em;text-transform:uppercase;color:${C.mist};margin-bottom:40px">Form &amp; Force · variations explored</div>
  ${VARIATIONS.map((g) => `<div style="font-size:22px;margin:24px 0 18px">${esc(g.title)}</div><div style="display:grid;grid-template-columns:repeat(4,544px);gap:24px 32px">${g.items.map(cell).join('')}</div>`).join('')}
  </div>`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(2, 21).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    return 0;
  }
  const vectors = vectorFiles();
  if (args.includes('--check')) {
    const stale = Object.entries(vectors).filter(([rel, svg]) => {
      const abs = path.join(ROOT, rel);
      return !fs.existsSync(abs) || fs.readFileSync(abs, 'utf8') !== svg;
    }).map(([rel]) => rel);
    for (const rel of stale) console.error(`stale: ${rel} differs from brand/source (run node brand/build.mjs --svg)`);
    console.log(`brand/build --check: ${Object.keys(vectors).length} vector files, ${stale.length} stale`);
    return stale.length ? 1 : 0;
  }
  const manifestPath = path.join(HERE, 'manifest.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  manifest.$comment = 'Every brand file and its SHA-256, written by brand/build.mjs. The repository validator accepts a raster here as original artwork only when its hash matches.';
  manifest.generator = 'brand/build.mjs';
  manifest.files = manifest.files || {};
  for (const [rel, svg] of Object.entries(vectors)) {
    writeIfChanged(rel, svg);
    manifest.files[rel] = { sha256: sha256(Buffer.from(svg)) };
  }
  console.log(`${Object.keys(vectors).length} vector files written`);
  if (!args.includes('--svg')) await rasters(manifest);
  manifest.files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  return 0;
}

process.exitCode = await main();
