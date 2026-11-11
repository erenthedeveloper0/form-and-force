// SPDX-License-Identifier: MIT
// Design facts: measurable properties of a rendered page that a jury senses
// before it can name them. Scale contrast, type economy, alignment, pacing,
// repetition, balance, colour commitment, layering, media and motion inventory.
//
// These are facts, never verdicts. The same number is a strength in one
// register and a weakness in another (references/jury.md says how to read
// them). They measure whether decisions are present, not which style was used.
//
// Every question below was checked against reference sites and stock templates.
// Measures that flagged strong work as often as weak work were narrowed or lost
// their question; the record is research/INSTRUMENT_CALIBRATION.md in the
// source repository. The instrument is blind to a great deal (a stock photograph
// reads as an image, a template with a picture in it reads as composed), so an
// empty list of questions is not a compliment.
//
// DOM_FACTS, TEXT_COLLISIONS and PIXEL_FACTS are serialised into the page by
// Playwright, so each must be self-contained. Imported by audit_page.mjs and
// sketch_board.mjs.

/* eslint-disable no-undef */
export const DOM_FACTS = () => {
  const vw = innerWidth, vh = innerHeight;
  const de = document.documentElement;
  const docH = Math.max(de.scrollHeight, document.body.scrollHeight);
  const sy = scrollY;
  const round = (n, p = 2) => Number(n.toFixed(p));
  const top = (map, n) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
  const shown = (el, cs, r) => r.width > 2 && r.height > 2 && cs.display !== 'none' && cs.visibility !== 'hidden';
  const tag = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return cls.length ? s + '.' + cls.join('.') : s;
  };
  const all = [...document.body.querySelectorAll('*')].slice(0, 7000);

  // ---- type ----
  const runs = [];
  for (const el of all) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName) || el.closest('svg')) continue;
    let own = '';
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.textContent;
    own = own.replace(/\s+/g, ' ').trim();
    if (own.length < 1) continue;
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (!shown(el, cs, r)) continue;
    const size = parseFloat(cs.fontSize);
    if (!(size > 0)) continue;
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / size;
    const lh = cs.lineHeight === 'normal' ? null : parseFloat(cs.lineHeight) / size;
    const upper = cs.textTransform === 'uppercase' || (own.length >= 3 && own === own.toUpperCase() && /[A-Z]/.test(own));
    runs.push({ el, chars: own.length, text: own.slice(0, 28), size, weight: Number(cs.fontWeight) || 400,
      family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), ls, lh, align: cs.textAlign, upper,
      left: r.left, right: r.right, width: r.width, topPage: r.top + sy, height: r.height });
  }
  const totalChars = runs.reduce((a, r) => a + r.chars, 0) || 1;
  const famChars = {}, sizeChars = {}, weightChars = {};
  for (const r of runs) {
    famChars[r.family] = (famChars[r.family] || 0) + r.chars;
    const s = Math.round(r.size); sizeChars[s] = (sizeChars[s] || 0) + r.chars;
    weightChars[r.weight] = (weightChars[r.weight] || 0) + r.chars;
  }
  const longRuns = runs.filter((r) => r.chars >= 60);
  const longChars = longRuns.reduce((a, r) => a + r.chars, 0);
  const bodyRuns = longChars >= Math.max(200, totalChars * 0.1) ? longRuns : runs;   // running text where there is enough of it, otherwise all text
  const bodyPool = {}; for (const r of bodyRuns) { const s = Math.round(r.size); bodyPool[s] = (bodyPool[s] || 0) + r.chars; }
  const bodySize = Number((top(bodyPool, 1)[0] || [16])[0]);
  const lettered = (r) => /[\p{L}\p{N}]/u.test(r.text);
  const display = runs.filter(lettered).sort((a, b) => b.size - a.size)[0] || null;
  const foldRuns = runs.filter((r) => r.topPage < vh && r.topPage + r.height > 0);
  const foldDisplay = foldRuns.filter(lettered).sort((a, b) => b.size - a.size)[0] || null;
  const describe = (r) => r && { px: round(r.size, 1), vw: round((r.size / vw) * 100, 1), text: r.text, family: r.family, weight: r.weight,
    tracking: round(r.ls, 3), leading: r.lh ? round(r.lh, 2) : null, widthShare: round(Math.min(r.width, vw * 3) / vw, 2),
    crossesFrame: r.left < -4 || r.right > vw + 4 };
  const centredChars = runs.filter((r) => r.align === 'center').reduce((a, r) => a + r.chars, 0);
  const upperChars = runs.filter((r) => r.upper).reduce((a, r) => a + r.chars, 0);
  const eyebrows = runs.filter((r) => r.size <= 13.5 && r.upper && r.ls > 0.04 && r.chars <= 40).length;
  const para = runs.filter((r) => r.chars >= 140).map((r) => r.width / (r.size * 0.5)).sort((a, b) => a - b);
  const lineBins = {};
  for (const r of runs.filter((x) => x.chars >= 12 && x.align !== 'center')) { const k = Math.round((r.left / vw) * 50) * 2; lineBins[k] = (lineBins[k] || 0) + r.chars; }
  const lineTotal = Object.values(lineBins).reduce((a, b) => a + b, 0) || 1;
  const lines = top(lineBins, 8).filter(([, c]) => c / lineTotal >= 0.05).map(([k, c]) => `${k}% (${Math.round((c / lineTotal) * 100)}%)`);
  const type = {
    families: top(famChars, 5).map(([f, c]) => `${f} ${Math.round((c / totalChars) * 100)}%`),
    familyCount: Object.values(famChars).filter((c) => c / totalChars >= 0.01).length,
    sizeCount: Object.values(sizeChars).filter((c) => c >= 2).length,
    workingSizes: Object.values(sizeChars).filter((c) => c / totalChars >= 0.03).length,
    sizes: top(sizeChars, 8).map(([s, c]) => `${s}px ${Math.round((c / totalChars) * 100)}%`),
    weights: top(weightChars, 5).map(([w, c]) => `${w} ${Math.round((c / totalChars) * 100)}%`),
    bodyPx: bodySize, display: describe(display), foldDisplay: describe(foldDisplay),
    scaleRatio: display ? round(display.size / bodySize, 1) : null,
    foldScaleRatio: foldDisplay ? round(foldDisplay.size / bodySize, 1) : null,
    centredShare: round(centredChars / totalChars), uppercaseShare: round(upperChars / totalChars),
    trackedCapsLabels: eyebrows, measureChars: para.length ? Math.round(para[Math.floor(para.length / 2)]) : null,
    textStartLines: lines, textChars: totalChars, charsPerScreen: Math.round(totalChars / Math.max(1, docH / vh)),
  };

  // ---- blocks: the page's scenes, in order ----
  const ground = (el) => { let e = el; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') return 'image'; const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); if ((p.length < 4 || p[3] > 0.5)) return `rgb(${p[0]},${p[1]},${p[2]})`; } e = e.parentElement; } return 'rgb(255,255,255)'; };
  let host = document.querySelector('main') || document.body;
  const kids = (el) => [...el.children].filter((c) => { if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK)$/.test(c.tagName)) return false; const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); return r.height >= 80 && r.width >= vw * 0.5 && cs.display !== 'none' && cs.position !== 'fixed'; });
  for (let depth = 0; depth < 6; depth++) { const k = kids(host); if (k.length === 1 && k[0].getBoundingClientRect().height > host.getBoundingClientRect().height * 0.85) host = k[0]; else break; }
  const blockEls = kids(host).slice(0, 40);
  const mediaSel = 'img,picture,video,canvas,svg,iframe';
  const blocks = blockEls.map((b) => {
    const r = b.getBoundingClientRect();
    const inside = runs.filter((x) => b.contains(x.el));
    const chars = inside.reduce((a, x) => a + x.chars, 0);
    const boxes = [...inside.filter((x) => x.chars >= 8).map((x) => x.el), ...b.querySelectorAll(mediaSel)]
      .map((e) => e.getBoundingClientRect()).filter((q) => q.width * q.height >= r.width * r.height * 0.004);
    const cols = [...new Set(boxes.map((q) => Math.max(0, Math.min(11, Math.round(((q.left - r.left) / Math.max(1, r.width)) * 12)))))].sort((a, c) => a - c);
    const centred = inside.filter((x) => x.align === 'center').reduce((a, x) => a + x.chars, 0) > chars * 0.5;
    return { el: tag(b), heightVh: round(r.height / vh), chars, ground: ground(b), signature: cols.join('|') + (centred ? ' c' : ''),
      media: b.querySelectorAll(mediaSel).length, density: Math.round(chars / Math.max(1, (r.width * r.height) / 100000)) };
  });
  const hs = blocks.map((b) => b.heightVh);
  const mean = hs.reduce((a, b) => a + b, 0) / (hs.length || 1);
  const cv = hs.length > 1 ? Math.sqrt(hs.reduce((a, b) => a + (b - mean) ** 2, 0) / hs.length) / (mean || 1) : 0;
  let run = 1, longestRun = hs.length ? 1 : 0;
  for (let i = 1; i < blocks.length; i++) { run = blocks[i].signature === blocks[i - 1].signature ? run + 1 : 1; longestRun = Math.max(longestRun, run); }
  const structure = {
    blockCount: blocks.length, heightsVh: hs, heightCv: round(cv),
    heightRange: hs.length ? `${Math.min(...hs)}–${Math.max(...hs)}` : null,
    layoutSignatures: new Set(blocks.map((b) => b.signature)).size, longestSameLayoutRun: longestRun,
    groundChanges: blocks.reduce((a, b, i) => a + (i && b.ground !== blocks[i - 1].ground ? 1 : 0), 0),
    grounds: new Set(blocks.map((b) => b.ground)).size, blocks: blocks.slice(0, 24), pageScreens: round(docH / vh, 1),
  };

  // ---- repetition: sibling groups that share one mould ----
  const groups = [];
  for (const parent of all) {
    if (parent.children.length < 3 || parent.children.length > 60) continue;
    if (/^(TABLE|THEAD|TBODY|TFOOT|TR|DL|SELECT)$/.test(parent.tagName)) continue;      // rows and cells are data
    const chrome = !!parent.closest('nav,footer,header,[role=navigation],[role=contentinfo],[role=banner]');
    const by = {};
    for (const c of parent.children) {
      const r = c.getBoundingClientRect();
      if (r.width * r.height < 9000 || !c.textContent.trim()) continue;
      const key = `${c.tagName}.${(typeof c.className === 'string' ? c.className : '').trim().split(/\s+/).sort().join('.')}|${Math.round(r.width / 8)}`;
      const media = [...c.querySelectorAll('img,video,canvas,picture,svg')].some((m) => { const q = m.getBoundingClientRect(); return q.width >= 96 && q.height >= 96; });
      (by[key] = by[key] || []).push({ r, media, chars: c.textContent.replace(/\s+/g, ' ').trim().length });
    }
    for (const list of Object.values(by)) {
      if (list.length < 3) continue;
      const h = list.map((x) => x.r.height).sort((a, b) => a - b);
      if (h[h.length - 1] / Math.max(1, h[0]) > 1.35) continue;
      const w = list[0].r.width, aspect = w / Math.max(1, h[0]);
      const perRow = list.filter((x) => Math.abs(x.r.top - list[0].r.top) < 8).length;
      // A card is a box: roughly as wide as it is tall, three or more to a row, holding a heading's worth of words and a sentence.
      // Full-width rows of a list are an index, which is a structure in its own right.
      const boxy = aspect >= 0.45 && aspect <= 3.2 && h[0] >= 90 && w * h[0] >= vw * vh * 0.02;
      groups.push({ where: tag(parent), count: list.length, size: `${Math.round(w)}x${Math.round(h[0])}`, perRow, chrome,
        card: boxy && perRow >= 3 && !chrome && list.every((x) => x.chars >= 40 && x.chars <= 700), textOnly: list.every((x) => !x.media) });
    }
  }
  const textCards = groups.filter((g) => g.card && g.textOnly);
  const repetition = { groups: groups.length, largest: groups.reduce((a, g) => Math.max(a, g.count), 0),
    textCardGroups: textCards.length, textCards: textCards.reduce((a, g) => a + g.count, 0),
    samples: groups.sort((a, b) => (b.card && b.textOnly) - (a.card && a.textOnly) || b.count - a.count).slice(0, 5) };

  // ---- surfaces, layering, media ----
  const radii = {}; let shadows = 0, blurs = 0, gradients = 0;
  const visuals = [];
  const pageGround = ground(document.body);
  const bleeds = [];
  for (const el of all) {
    const r = el.getBoundingClientRect(); const area = r.width * r.height;
    if (area < 1500) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    if (rad > 0) { const k = rad >= Math.min(r.width, r.height) / 2 - 1 ? 'pill' : Math.round(rad) + 'px'; radii[k] = (radii[k] || 0) + 1; }
    if (cs.boxShadow && cs.boxShadow !== 'none') shadows++;
    if ((cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.filter && /blur/.test(cs.filter))) blurs++;
    const bgImg = cs.backgroundImage && cs.backgroundImage !== 'none';
    if (bgImg && /gradient/.test(cs.backgroundImage)) gradients++;
    const isMedia = /^(IMG|VIDEO|CANVAS|SVG|PICTURE|IFRAME)$/i.test(el.tagName);
    const bg = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const bgP = bg ? bg[1].split(/[\s,/]+/).filter(Boolean).map(Number) : null;
    const filled = bgImg || (bgP && (bgP.length < 4 || bgP[3] > 0.5) && `rgb(${bgP[0]},${bgP[1]},${bgP[2]})` !== pageGround);
    if (!(isMedia || filled)) continue;
    if (r.width >= vw * 0.98 && r.height >= 120) bleeds.push(el);
    if (area >= vw * vh * 0.03 && cs.position !== 'fixed' && cs.position !== 'sticky') visuals.push({ el, r, area });
  }
  visuals.sort((a, b) => b.area - a.area);
  const big = visuals.slice(0, 120); let overlapPairs = 0;
  for (let i = 0; i < big.length; i++) for (let j = i + 1; j < big.length; j++) {
    const a = big[i], b = big[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (w > 0 && h > 0 && w * h >= Math.min(a.area, b.area) * 0.12) overlapPairs++;
  }
  const typeOverMedia = runs.filter((x) => x.size >= 28 && big.some((v) => !v.el.contains(x.el) && /^(IMG|VIDEO|CANVAS|SVG|PICTURE)$/i.test(v.el.tagName) && x.left < v.r.right && x.right > v.r.left && x.topPage - sy < v.r.bottom && x.topPage - sy + x.height > v.r.top)).length;
  const hasXScroll = Math.max(de.scrollWidth, document.body.scrollWidth) > vw + 2;
  const crossing = [...runs.filter((x) => x.size >= 28).map((x) => ({ left: x.left, right: x.right })), ...visuals.map((v) => v.r)].filter((r) => r.left < -6 || r.right > vw + 6).length;
  const count = (sel, min) => [...document.querySelectorAll(sel)].filter((e) => { const r = e.getBoundingClientRect(); return r.width >= min && r.height >= min; });
  const mediaEls = { img: count('img', 48), svg: count('svg', 64), canvas: count('canvas', 48), video: count('video', 48) };
  const mediaArea = Object.values(mediaEls).flat().reduce((a, e) => { const r = e.getBoundingClientRect(); return a + r.width * r.height; }, 0);
  const surfaces = { radii: top(radii, 5).map(([k, c]) => `${k} ×${c}`), distinctRadii: Object.keys(radii).length, shadows, blurs, gradients };
  const layering = { overlapPairs, typeOverMedia, fullBleed: bleeds.length, crossingFrame: hasXScroll ? null : crossing };
  const foldMedia = Object.values(mediaEls).flat().reduce((a, e) => {
    const r = e.getBoundingClientRect(); const top = r.top + sy;
    const w = Math.min(r.right, vw) - Math.max(r.left, 0), h = Math.min(top + r.height, vh) - Math.max(top, 0);
    return a + (w > 0 && h > 0 ? w * h : 0);
  }, 0);
  const media = { img: mediaEls.img.length, svg: mediaEls.svg.length, canvas: mediaEls.canvas.length, video: mediaEls.video.length,
    areaShare: round(Math.min(1, mediaArea / Math.max(1, vw * docH))), firstScreenShare: round(Math.min(1, foldMedia / (vw * vh))) };

  // ---- motion inventory (declared; see motion_strip.mjs for what actually plays) ----
  const ms = (s) => (/ms$/.test(s) ? parseFloat(s) : parseFloat(s) * 1000) || 0;
  const easeName = (e) => ({ 'cubic-bezier(0.25, 0.1, 0.25, 1)': 'ease', 'cubic-bezier(0.42, 0, 1, 1)': 'ease-in', 'cubic-bezier(0, 0, 0.58, 1)': 'ease-out', 'cubic-bezier(0.42, 0, 0.58, 1)': 'ease-in-out' }[e] || (e.startsWith('linear(') ? 'linear() curve' : e));
  const durs = {}, eases = {}; let transitioned = 0, transitionAll = 0, slowControls = 0, controlsWithMotion = 0;
  for (const el of all.slice(0, 4000)) {
    const cs = getComputedStyle(el);
    const d = Math.max(...cs.transitionDuration.split(',').map((s) => ms(s.trim())));
    if (!(d > 0)) continue;
    transitioned++;
    durs[Math.round(d)] = (durs[Math.round(d)] || 0) + 1;
    const e = easeName(cs.transitionTimingFunction.split(/,(?![^(]*\))/)[0].trim()); eases[e] = (eases[e] || 0) + 1;
    if (/\ball\b/.test(cs.transitionProperty)) transitionAll++;
    if (el.matches('a,button,[role=button],input,select,summary,label')) { controlsWithMotion++; if (d > 300) slowControls++; }
  }
  const anims = document.getAnimations ? document.getAnimations() : [];
  const layoutProps = new Set(); const animEases = {};
  for (const a of anims.slice(0, 300)) {
    try {
      const t = a.effect.getTiming(); animEases[easeName(t.easing)] = (animEases[easeName(t.easing)] || 0) + 1;
      for (const k of a.effect.getKeyframes()) for (const p of Object.keys(k)) if (/^(width|height|top|left|right|bottom|margin|padding)/.test(p)) layoutProps.add(p);
    } catch { /* detached effect */ }
  }
  const controls = document.querySelectorAll('a[href],button,[role=button]').length;
  const motion = {
    elementsWithTransition: transitioned, durationsMs: top(durs, 6).map(([d, c]) => `${d} ×${c}`), distinctDurations: Object.keys(durs).length,
    easings: top(eases, 5).map(([e, c]) => `${e} ×${c}`), transitionAll, controls, controlsWithTransition: controlsWithMotion, controlsOver300ms: slowControls,
    runningAnimations: anims.filter((a) => a.playState === 'running').length, animationEasings: top(animEases, 4).map(([e, c]) => `${e} ×${c}`),
    layoutPropertiesAnimated: [...layoutProps],
  };
  return { viewport: `${vw}x${vh}`, type, structure, repetition, surfaces, layering, media, motion };
};

// Text set on top of other text, in the current viewport. Returns the distinct
// pairs. Each line of text is reduced to the middle half of its height (so tight
// leading is not a collision), clipped to whatever its ancestors clip, and
// ignored when it is invisible, when it belongs to fixed or sticky chrome (which
// overlays the page by design), or when both lines say the same thing (a layered
// effect). Layered type can be deliberate, so this is a question like the others.
export const TEXT_COLLISIONS = () => {
  const vw = innerWidth, vh = innerHeight; const boxes = [];
  const style = new Map(); const cs = (el) => style.get(el) || (style.set(el, getComputedStyle(el)), style.get(el));
  const tag = (el) => { let s = el.tagName.toLowerCase(); if (el.id) return s + '#' + el.id; const c = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).filter(Boolean)[0]; return c ? s + '.' + c : s; };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node, seen = 0;
  while ((node = walker.nextNode()) && seen < 2500) {
    const text = node.textContent.replace(/\s+/g, ' ').trim();
    const el = node.parentElement;
    if (text.length < 2 || !el || el.closest('svg,script,style,noscript,template,select,option')) continue;
    seen++;
    let clip = { l: 0, t: 0, r: vw, b: vh }, visible = true;
    for (let e = el; e && e.nodeType === 1 && visible; e = e.parentElement) {
      const c = cs(e);
      if (c.display === 'none' || c.visibility === 'hidden' || Number(c.opacity) < 0.2 || c.position === 'fixed' || c.position === 'sticky') visible = false;
      else if (e !== el && (c.overflowX !== 'visible' || c.overflowY !== 'visible') && e !== document.body && e !== document.documentElement) {
        const q = e.getBoundingClientRect();
        clip = { l: Math.max(clip.l, q.left), t: Math.max(clip.t, q.top), r: Math.min(clip.r, q.right), b: Math.min(clip.b, q.bottom) };
      }
    }
    if (!visible) continue;
    const own = cs(el); if (own.overflowX !== 'visible' || own.overflowY !== 'visible') { const q = el.getBoundingClientRect(); clip = { l: Math.max(clip.l, q.left), t: Math.max(clip.t, q.top), r: Math.min(clip.r, q.right), b: Math.min(clip.b, q.bottom) }; }
    const range = document.createRange(); range.selectNodeContents(node);
    for (const q of range.getClientRects()) {
      const trim = q.height * 0.25;
      const b = { l: Math.max(q.left, clip.l), t: Math.max(q.top + trim, clip.t), r: Math.min(q.right, clip.r), b: Math.min(q.bottom - trim, clip.b) };
      if (b.r - b.l >= 8 && b.b - b.t >= 3) boxes.push({ el, b, text: text.slice(0, 24), area: (b.r - b.l) * (b.b - b.t) });
    }
  }
  const pairs = new Map();
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], c = boxes[j];
    if (a.el === c.el || a.el.contains(c.el) || c.el.contains(a.el)) continue;
    if (a.text === c.text) continue;                               // the same words stacked on themselves: a layered effect or a hidden duplicate
    const w = Math.min(a.b.r, c.b.r) - Math.max(a.b.l, c.b.l), h = Math.min(a.b.b, c.b.b) - Math.max(a.b.t, c.b.t);
    if (w <= 0 || h <= 0 || w * h < Math.min(a.area, c.area) * 0.3) continue;
    const key = [`${tag(a.el)} "${a.text}"`, `${tag(c.el)} "${c.text}"`].sort().join(' over ');
    if (!pairs.has(key)) pairs.set(key, key);
  }
  return [...pairs.values()].slice(0, 12);
};

// Runs in a blank helper page. Each image is drawn small and read back as pixels.
export const PIXEL_FACTS = async (uris) => {
  const W = 96; const out = [];
  for (const uri of uris) {
    const img = new Image(); img.src = uri; await img.decode();
    const H = Math.max(8, Math.round((img.naturalHeight / img.naturalWidth) * W));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data; const n = W * H;
    const bins = new Map();
    for (let i = 0; i < n; i++) { const k = ((d[i * 4] >> 4) << 8) | ((d[i * 4 + 1] >> 4) << 4) | (d[i * 4 + 2] >> 4); const b = bins.get(k) || [0, 0, 0, 0]; b[0]++; b[1] += d[i * 4]; b[2] += d[i * 4 + 1]; b[3] += d[i * 4 + 2]; bins.set(k, b); }
    const g0 = [...bins.values()].sort((a, b) => b[0] - a[0])[0];
    const gr = [g0[1] / g0[0], g0[2] / g0[0], g0[3] / g0[0]];
    const mask = new Uint8Array(n); let ink = 0, chroma = 0, sx = 0, sy = 0; const hue = new Array(12).fill(0); const lum = [];
    for (let i = 0; i < n; i++) {
      const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2];
      lum.push(0.2126 * r + 0.7152 * gg + 0.0722 * b);
      if (Math.max(Math.abs(r - gr[0]), Math.abs(gg - gr[1]), Math.abs(b - gr[2])) > 30) { mask[i] = 1; ink++; sx += i % W; sy += Math.floor(i / W); }
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), df = mx - mn;
      if (df >= 40 && df / mx >= 0.3) { chroma++; let h = mx === r ? ((gg - b) / df) % 6 : mx === gg ? (b - r) / df + 2 : (r - gg) / df + 4; h = (h * 60 + 360) % 360; hue[Math.floor(h / 30)]++; }
    }
    lum.sort((a, b) => a - b);
    const band = Math.max(1, Math.round(W * 0.03)), bandY = Math.max(1, Math.round(H * 0.04));
    const share = (x0, x1, y0, y1) => { let s = 0, t = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += mask[y * W + x]; t++; } return t ? s / t : 0; };
    const edges = { top: share(0, W, 0, bandY), right: share(W - band, W, 0, H), bottom: share(0, W, H - bandY, H), left: share(0, band, 0, H) };
    // Coarse density grid (16 x 10): the layout as masses, used for mirror balance and screen-to-screen similarity.
    const grid = []; const GX = 16, GY = 10;
    for (let y = 0; y < GY; y++) for (let x = 0; x < GX; x++) grid.push(Math.round(share(Math.floor((x * W) / GX), Math.floor(((x + 1) * W) / GX), Math.floor((y * H) / GY), Math.floor(((y + 1) * H) / GY)) * 100));
    let both = 0, either = 0;
    for (let y = 0; y < GY; y++) for (let x = 0; x < GX / 2; x++) { const a = grid[y * GX + x], b = grid[y * GX + (GX - 1 - x)]; both += Math.min(a, b); either += Math.max(a, b); }
    const names = ['red', 'orange', 'yellow', 'lime', 'green', 'spring', 'cyan', 'azure', 'blue', 'violet', 'magenta', 'rose'];
    const r2 = (v) => Number(v.toFixed(2));
    out.push({
      ground: `rgb(${gr.map((v) => Math.round(v)).join(',')})`, groundShare: r2(g0[0] / n), ink: r2(ink / n),
      chroma: r2(chroma / n), hues: hue.map((v, i) => [names[i], v]).filter(([, v]) => v / n >= 0.01 && v / Math.max(1, chroma) >= 0.08).map(([k]) => k),
      luminance: Math.round(lum[Math.floor(n / 2)]), contrast: Math.round(lum[Math.floor(n * 0.95)] - lum[Math.floor(n * 0.05)]),
      centroid: ink ? [r2(sx / ink / W), r2(sy / ink / H)] : null,
      offCentre: ink ? r2(Math.hypot(sx / ink / W - 0.5, sy / ink / H - 0.5)) : 0,
      symmetry: either ? r2(both / either) : 1,
      edges: Object.fromEntries(Object.entries(edges).map(([k, v]) => [k, r2(v)])),
      edgesTouched: Object.values(edges).filter((v) => v >= 0.15).length,
      halves: { left: r2(share(0, W / 2, 0, H)), right: r2(share(W / 2, W, 0, H)), top: r2(share(0, W, 0, H / 2)), bottom: r2(share(0, W, H / 2, H)) },
      grid,
    });
  }
  return out;
};
/* eslint-enable no-undef */

const rgb = (s) => (s.match(/\d+/g) || [0, 0, 0]).map(Number);
const colourGap = (a, b) => Math.max(...rgb(a).map((v, i) => Math.abs(v - rgb(b)[i])));
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : (na === nb ? 1 : 0);
}

// Pacing across the page: how much the screens differ from one another.
export function pacing(tiles) {
  if (!tiles || tiles.length < 2) return null;
  const ink = tiles.map((t) => t.ink);
  let changes = 0; const grounds = [];
  tiles.forEach((t, i) => {
    if (i && colourGap(t.ground, tiles[i - 1].ground) > 26) changes++;
    if (!grounds.some((g) => colourGap(g, t.ground) <= 26)) grounds.push(t.ground);
  });
  let sum = 0, pairs = 0, twins = 0;
  for (let i = 0; i < tiles.length; i++) for (let j = i + 1; j < tiles.length; j++) { const s = cosine(tiles[i].grid, tiles[j].grid); sum += s; pairs++; if (s >= 0.92) twins++; }
  const r2 = (v) => Number(v.toFixed(2));
  return {
    screens: tiles.length, inkPerScreen: ink, inkRange: r2(Math.max(...ink) - Math.min(...ink)),
    groundChanges: changes, grounds: grounds.length, chromaPerScreen: tiles.map((t) => t.chroma),
    meanSymmetry: r2(tiles.reduce((a, t) => a + t.symmetry, 0) / tiles.length),
    symmetricScreens: tiles.filter((t) => t.symmetry >= 0.75).length,
    selfSimilarity: r2(sum / pairs), twinScreens: twins,
  };
}

// Facts as readable lines, plus questions for the jury. A question is raised
// when a measure sits where unexamined defaults usually sit; it is never a
// failure on its own. See references/jury.md for reading them by register.
export function describeDesign(dom, fold, pace) {
  const L = [], Q = [];
  const t = dom.type, s = dom.structure, m = dom.motion;
  const d = t.foldDisplay || t.display;
  L.push(`type: ${t.familyCount} famil${t.familyCount === 1 ? 'y' : 'ies'} (${t.families.slice(0, 3).join(', ')}) · ${t.workingSizes} working sizes (${t.sizeCount} in all) · body ${t.bodyPx}px`);
  if (d) L.push(`scale: largest live text on the first screen ${d.px}px (${d.vw}vw) "${d.text}" = ${t.foldScaleRatio}× body · tracking ${d.tracking}em · leading ${d.leading ?? 'normal'} · spans ${Math.round(d.widthShare * 100)}% of the width${d.crossesFrame ? ' · crosses the frame' : ''}`);
  L.push(`alignment: ${Math.round(t.centredShare * 100)}% of text centred · text starts on ${t.textStartLines.length} line(s): ${t.textStartLines.slice(0, 4).join(', ') || 'n/a'} · measure ≈ ${t.measureChars ?? '?'} chars`);
  L.push(`structure: ${s.blockCount} blocks over ${s.pageScreens} screens · heights ${s.heightRange}vh (variation ${s.heightCv}) · ${s.layoutSignatures} distinct layouts, longest identical run ${s.longestSameLayoutRun} · ${s.grounds} ground(s)`);
  L.push(`repetition: ${dom.repetition.textCardGroups} row(s) of text-only cards (${dom.repetition.textCards} cards) · ${dom.repetition.groups} repeated group(s) of any kind, largest ${dom.repetition.largest}`);
  L.push(`surface: radii ${dom.surfaces.radii.join(', ') || 'none'} · shadows ${dom.surfaces.shadows} · gradients ${dom.surfaces.gradients} · blur ${dom.surfaces.blurs}`);
  L.push(`layering: ${dom.layering.overlapPairs > 40 ? '40+' : dom.layering.overlapPairs} overlap(s) · ${dom.layering.typeOverMedia} display line(s) over media · ${dom.layering.fullBleed} full-bleed · ${dom.layering.crossingFrame ?? 'n/a'} crossing the frame${dom.layering.textCollisions ? ` · text over text in ${dom.layering.textCollisions} place(s)` : ''}`);
  L.push(`media: img ${dom.media.img} · svg ${dom.media.svg} · canvas ${dom.media.canvas} · video ${dom.media.video} · ${Math.round(dom.media.areaShare * 100)}% of page area, ${Math.round(dom.media.firstScreenShare * 100)}% of the first screen · ${t.charsPerScreen} chars per screen`);
  if (fold) L.push(`first screen: ground ${fold.ground} (${Math.round(fold.groundShare * 100)}%) · ink ${Math.round(fold.ink * 100)}% · colour ${Math.round(fold.chroma * 100)}%${fold.hues.length ? ' ' + fold.hues.join('/') : ''} · balance left/right ${fold.halves.left}/${fold.halves.right} · symmetry ${fold.symmetry} · edges touched ${fold.edgesTouched}/4`);
  if (pace) L.push(`pacing: ink per screen ${pace.inkPerScreen.join(' ')} (range ${pace.inkRange}) · ${pace.groundChanges} ground change(s) · ${pace.symmetricScreens}/${pace.screens} symmetric screens · self-similarity ${pace.selfSimilarity} · ${pace.twinScreens} near-identical pair(s)`);
  L.push(`motion declared: ${m.elementsWithTransition} element(s) with transitions · durations ${m.durationsMs.slice(0, 4).join(', ') || 'none'} · easings ${m.easings.slice(0, 3).join(', ') || 'none'} · ${m.runningAnimations} running animation(s)`);

  const ask = (id, text) => Q.push({ id, text });
  const typeLed = dom.media.firstScreenShare < 0.2;     // images, canvases and film can carry a first screen; live text is then not the measure
  const wide = parseInt(dom.viewport, 10) >= 900;       // a phone stacks everything into one column, so sameness between its screens means little
  if (typeLed && t.foldScaleRatio !== null && t.foldScaleRatio < 3) ask('scale-contrast', `The first screen is carried by live text, and its largest type is ${t.foldScaleRatio}× the body size. Is type composing the frame, or only labelling it?`);
  if (t.centredShare >= 0.55) ask('centred', `${Math.round(t.centredShare * 100)}% of the text is centred. Is the central axis the idea, or the absence of one?`);
  if (t.trackedCapsLabels >= 4) ask('caps-labels', `${t.trackedCapsLabels} small tracked-caps labels. Does each carry information the heading does not?`);
  if (t.measureChars && (t.measureChars > 95 || t.measureChars < 28)) ask('measure', `Body lines run to about ${t.measureChars} characters. Is that measure chosen?`);
  if (s.blockCount >= 4 && s.heightCv < 0.22) ask('even-pacing', `${s.blockCount} blocks are within a narrow height band (variation ${s.heightCv}). Where is the peak, and where does the page rest?`);
  if (s.blockCount >= 4 && s.longestSameLayoutRun >= 3) ask('layout-run', `${s.longestSameLayoutRun} consecutive blocks share one layout. Is that a deliberate series or one mould reused?`);
  if (dom.repetition.textCardGroups >= 2) ask('moulds', `${dom.repetition.textCardGroups} rows of identical text-only cards (${dom.repetition.textCards} cards). Do the items differ in what they hold, or only in their words?`);
  if (dom.layering.textCollisions) ask('text-collision', `Text sits on top of other text in ${dom.layering.textCollisions} place(s) at this width (${(dom.layering.collisionSamples || [])[0] || 'see the frames'}). Is the overlap composed, or is it a collision?`);
  if (dom.surfaces.distinctRadii === 1 && dom.surfaces.shadows >= 6) ask('one-surface', 'One radius and a shadow on nearly every surface. What does a surface mean here, and why do they all mean the same?');
  if (dom.media.areaShare < 0.02 && dom.media.canvas === 0 && t.foldScaleRatio !== null && t.foldScaleRatio < 4 && (!fold || fold.chroma < 0.15)) ask('nothing-to-look-at', 'There is almost no image, drawing or field on the page and the type is modest. What is there to look at?');
  if (fold && fold.symmetry >= 0.8 && fold.offCentre < 0.06 && t.centredShare >= 0.4) ask('symmetric-fold', 'The first screen is close to mirror-symmetric around its centre. Is symmetry the statement?');
  if (fold && fold.ink < 0.06 && typeLed && (t.foldScaleRatio ?? 0) < 5) ask('thin-fold', `Only ${Math.round(fold.ink * 100)}% of the first screen differs from its ground. Is the emptiness composed (one thing, exactly placed) or simply unfilled?`);
  if (wide && pace && pace.screens >= 5 && pace.groundChanges === 0 && pace.inkRange < 0.12) ask('flat-sequence', 'The ground never changes and density barely varies down the page. Does the sequence have any shape?');
  if (m.transitionAll >= 3) ask('transition-all', `${m.transitionAll} elements transition every property. Which properties are meant to move?`);
  if (m.controlsOver300ms >= 2) ask('slow-controls', `${m.controlsOver300ms} controls take over 300 ms to respond. How often is each one used?`);
  if (m.elementsWithTransition >= 8 && m.distinctDurations === 1) ask('one-duration', 'Every transition shares one duration. Do a press, a panel and a scene really take the same time?');
  if (m.easings.length && m.easings.every((e) => /^(ease|ease-in-out|linear) ×/.test(e))) ask('default-easing', 'Only browser-default easing curves are in use. What is this project\'s motion character, and which curve expresses it?');
  if (m.layoutPropertiesAnimated.length) ask('layout-animation', `Animations change ${m.layoutPropertiesAnimated.slice(0, 4).join(', ')}. Can transform, opacity or clip-path do the same job?`);
  if (m.controls >= 6 && m.controlsWithTransition === 0 && m.runningAnimations === 0) ask('no-feedback', 'No control declares a transition. Instant state changes are a legitimate decision: are hover, focus, pressed and disabled states all designed?');
  return { lines: L, questions: Q };
}
