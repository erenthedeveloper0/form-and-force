#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Derive a project's motion tokens from its motion character, so that timing,
// easing, travel, stagger and spring values come from one decision and differ
// from project to project. There is no house curve.
//
// Character is described with four effort factors borrowed from Laban movement
// analysis, as a working vocabulary (not a faithful account of it):
//   weight  light ... strong      how much force a movement carries
//   time    sudden ... sustained  how quickly it happens
//   space   direct ... indirect   whether it goes straight to its target
//   flow    bound ... free        contained and exact, or released with follow-through
//
// Usage:
//   node motion_tokens.mjs --action dab|flick|glide|float|punch|slash|press|wring [--flow bound|free]
//   node motion_tokens.mjs --weight 0.2 --time 0.8 --space 0.1 --flow 0.2     (each 0 to 1)
//   node motion_tokens.mjs list
// Options: --json, --prefix <name> (custom property prefix, default none)
// Zero dependencies; Node 18+.

const argv = process.argv.slice(2);
const flag = (n) => argv.includes('--' + n);
const opt = (n, d = null) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };

const LIGHT = 0.18, STRONG = 0.86, SUDDEN = 0.14, SUSTAINED = 0.82, DIRECT = 0.1, INDIRECT = 0.82;
export const ACTIONS = {
  dab: { weight: LIGHT, time: SUDDEN, space: DIRECT, feel: 'light, quick and exact: a tap that lands precisely' },
  flick: { weight: LIGHT, time: SUDDEN, space: INDIRECT, feel: 'light and quick with a loose path: a flick of the wrist' },
  glide: { weight: LIGHT, time: SUSTAINED, space: DIRECT, feel: 'light and unhurried on a straight path: sliding on ice' },
  float: { weight: LIGHT, time: SUSTAINED, space: INDIRECT, feel: 'light, slow and drifting: something carried by air or water' },
  punch: { weight: STRONG, time: SUDDEN, space: DIRECT, feel: 'forceful, fast and straight: a stamp, a cut, a slammed door' },
  slash: { weight: STRONG, time: SUDDEN, space: INDIRECT, feel: 'forceful and fast along a sweeping path: a brush stroke, a whip' },
  press: { weight: STRONG, time: SUSTAINED, space: DIRECT, feel: 'heavy, slow and direct: a vault door, a hydraulic press' },
  wring: { weight: STRONG, time: SUSTAINED, space: INDIRECT, feel: 'heavy and slow with torsion: something twisted under load' },
};

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const r3 = (v) => Number(v.toFixed(3));
const ms = (v) => Math.round(v / 10) * 10;

// Ease-out and ease-in-out presets from gentle to sharp (quad, cubic, quart, quint, expo).
const OUT = [[0.5, 1, 0.89, 1], [0.33, 1, 0.68, 1], [0.25, 1, 0.5, 1], [0.22, 1, 0.36, 1], [0.16, 1, 0.3, 1]];
const INOUT = [[0.45, 0, 0.55, 1], [0.65, 0, 0.35, 1], [0.76, 0, 0.24, 1], [0.83, 0, 0.17, 1], [0.87, 0, 0.13, 1]];
function along(presets, s) {
  const x = clamp(s) * (presets.length - 1); const i = Math.min(presets.length - 2, Math.floor(x)); const t = x - i;
  return presets[i].map((v, k) => r3(lerp(v, presets[i + 1][k], t)));
}
const bezier = (p) => `cubic-bezier(${p.join(', ')})`;
const mirrored = ([x1, y1, x2, y2]) => [r3(1 - x2), r3(1 - y2), r3(1 - x1), r3(1 - y1)];

// A damped spring as a CSS linear() easing. response is the undamped period in
// seconds; damping 1 is critically damped (no overshoot).
export function spring(response, damping) {
  const w0 = (2 * Math.PI) / response;
  const x = (t) => {
    if (damping >= 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    const wd = w0 * Math.sqrt(1 - damping * damping);
    return 1 - Math.exp(-damping * w0 * t) * (Math.cos(wd * t) + ((damping * w0) / wd) * Math.sin(wd * t));
  };
  let end = 0.05;
  const settled = (t) => (damping >= 1 ? Math.exp(-w0 * t) * (1 + w0 * t) : Math.exp(-damping * w0 * t)) < 0.0025;
  while (!settled(end) && end < 6) end += 0.005;
  const N = 120; const pts = [];
  for (let i = 0; i <= N; i++) pts.push([i / N, x((i / N) * end)]);
  pts[N][1] = 1;
  // Ramer-Douglas-Peucker: keep only the points a straight line would miss.
  const keep = new Set([0, N]);
  const simplify = (a, b) => {
    let worst = 0, at = -1;
    for (let i = a + 1; i < b; i++) {
      const t = (pts[i][0] - pts[a][0]) / (pts[b][0] - pts[a][0]);
      const gap = Math.abs(pts[i][1] - lerp(pts[a][1], pts[b][1], t));
      if (gap > worst) { worst = gap; at = i; }
    }
    if (worst > 0.004) { keep.add(at); simplify(a, at); simplify(at, b); }
  };
  simplify(0, N);
  const stops = [...keep].sort((a, b) => a - b).map((i) => (i === 0 || i === N ? `${r3(pts[i][1])}` : `${r3(pts[i][1])} ${Number((pts[i][0] * 100).toFixed(1))}%`));
  return { css: `linear(${stops.join(', ')})`, durationMs: ms(end * 1000), overshoot: r3(Math.max(...pts.map((p) => p[1])) - 1) };
}

export function derive({ weight, time, space, flow }) {
  const sharp = clamp(0.15 + 0.45 * weight + 0.4 * (1 - time));
  const enter = along(OUT, sharp), move = along(INOUT, sharp), exit = along(OUT, Math.max(0, sharp - 0.25));
  // Character stretches scene-level motion a long way and interface motion only a
  // little: a menu must stay quick whatever the character is. The bands are the
  // ones in references/motion-craft.md §1 (press 80-160, quick 120-240, move 150-350, scene 300-1100).
  const dur = {
    press: ms(lerp(80, 150, time)), quick: ms(lerp(120, 240, time)),
    move: ms(Math.min(350, lerp(170, 320, time) + weight * 30)), scene: ms(Math.min(1100, lerp(380, 1000, time) + weight * 100)),
  };
  dur.moveOut = ms(dur.move * 0.7);
  const damping = flow < 0.35 ? 1 : r3(1 - ((flow - 0.35) / 0.65) * (0.5 - 0.2 * weight));
  const response = r3(clamp((dur.move / 1000) * 1.1, 0.2, 0.7));
  const sp = spring(response, damping);
  const step = Math.round(lerp(28, 90, time));
  const decay = r3(lerp(0.92, 0.7, flow));
  const delays = Array.from({ length: 8 }, (_, i) => Math.round((step * (1 - decay ** i)) / (1 - decay)));
  const travel = Math.round(lerp(6, 48, weight)), travelLg = Math.round(lerp(16, 120, weight));
  const gsap = ['power1', 'power2', 'power3', 'power4', 'expo'][Math.min(4, Math.round(sharp * 4))];
  const bound = flow < 0.35, direct = space < 0.45, light = weight < 0.5, sudden = time < 0.5;
  const guidance = {
    entrance: bound
      ? (direct ? 'Contained reveals: a clip-path or mask opens along one axis and content arrives already in place.' : 'Contained but oblique: masked reveals on a diagonal, or a clip that opens from a corner.')
      : (direct ? 'Released arrivals: elements travel on one axis and settle with a little follow-through.' : 'Drifting arrivals: travel on two axes with a slight turn and a blur that clears as the element settles.'),
    feedback: `Press scales to ${r3(lerp(0.985, 0.955, weight))} in ${dur.press} ms and releases ${bound ? 'on the enter curve' : 'on the spring'}. Hover changes one property in ${dur.quick} ms.`,
    exits: `Exits run ${dur.moveOut} ms, about 70% of the entrance, on a gentler curve, and all at once. Use the leave curve only for things that exit the frame for good.`,
    stagger: `Start at ${step} ms and shrink each gap by ${Math.round((1 - decay) * 100)}% (delays ${delays.slice(0, 6).join(', ')} ms). Lead element first; decoration fades in place.`,
    scroll: sudden ? 'Scroll-linked motion should snap between states quickly, with short ranges. Avoid long scrubs.' : 'Scroll-linked motion can scrub over long ranges; let position follow scroll and ease only secondary properties.',
    never: [bound ? 'overshoot or bounce' : 'hard, unsettled stops', direct ? 'rotation and arcs for their own sake' : 'rigid single-axis slides on signature moments', light ? 'large travel distances' : 'tiny, fussy movements', sudden ? 'slow fades on frequent actions' : 'abrupt cuts inside a sequence'].join('; '),
  };
  return {
    factors: { weight: r3(weight), time: r3(time), space: r3(space), flow: r3(flow) },
    durations: dur,
    easings: { enter: bezier(enter), exit: bezier(exit), move: bezier(move), leave: bezier(mirrored(enter)) },
    spring: { ...sp, response, damping, motion: `{ type: "spring", duration: ${response}, bounce: ${r3(1 - damping)} }` },
    distance: { travel, travelLg, scaleFrom: r3(lerp(0.985, 0.92, weight)), pressScale: r3(lerp(0.985, 0.955, weight)),
      turnDeg: direct ? 0 : r3(lerp(0, 6, space) * (bound ? 0.5 : 1)), blurPx: direct ? 0 : r3(lerp(0, 8, space) * (bound ? 0.4 : 1)), driftPx: direct ? 0 : Math.round(travel * 0.6 * space) },
    stagger: { stepMs: step, decay, delaysMs: delays },
    gsap: { enter: `${gsap}.out`, move: `${gsap}.inOut` },
    guidance,
  };
}

export function toCss(t, label, prefix = '') {
  const p = prefix ? `--${prefix}-` : '--';
  const d = t.durations, e = t.easings, x = t.distance;
  return [
    `/* Motion character: ${label}`,
    `   weight ${t.factors.weight} · time ${t.factors.time} · space ${t.factors.space} · flow ${t.factors.flow}`,
    `   Generated by motion_tokens.mjs. Tune by changing the character, not single values. */`,
    ':root {',
    `  ${p}dur-press: ${d.press}ms; ${p}dur-quick: ${d.quick}ms; ${p}dur-move: ${d.move}ms; ${p}dur-move-out: ${d.moveOut}ms; ${p}dur-scene: ${d.scene}ms;`,
    `  ${p}ease-enter: ${e.enter};`,
    `  ${p}ease-exit: ${e.exit};`,
    `  ${p}ease-move: ${e.move};`,
    `  ${p}ease-leave: ${e.leave};   /* only for elements leaving the frame for good */`,
    `  ${p}spring: ${t.spring.css};`,
    `  ${p}spring-dur: ${t.spring.durationMs}ms;   /* damping ${t.spring.damping}, overshoot ${Math.round(t.spring.overshoot * 100)}% */`,
    `  ${p}travel: ${x.travel}px; ${p}travel-lg: ${x.travelLg}px; ${p}scale-from: ${x.scaleFrom}; ${p}press-scale: ${x.pressScale};`,
    `  ${p}turn: ${x.turnDeg}deg; ${p}blur: ${x.blurPx}px; ${p}drift: ${x.driftPx}px;`,
    `  ${p}stagger-step: ${t.stagger.stepMs}ms; ${p}stagger-decay: ${t.stagger.decay};`,
    `  /* delay for item i: calc(var(${p}stagger-step) * (1 - pow(var(${p}stagger-decay), var(--i))) / (1 - var(${p}stagger-decay))) */`,
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    `  :root { ${p}travel: 0px; ${p}travel-lg: 0px; ${p}drift: 0px; ${p}turn: 0deg; ${p}blur: 0px; ${p}scale-from: 1; ${p}spring: ease; ${p}spring-dur: ${d.quick}ms; ${p}dur-move: ${d.quick}ms; ${p}dur-scene: ${d.quick}ms; ${p}stagger-step: 0ms; }`,
    '}',
  ].join('\n');
}

function main() {
  if (argv[0] === 'list') {
    for (const [name, a] of Object.entries(ACTIONS)) console.log(`${name.padEnd(6)} ${a.weight < 0.5 ? 'light ' : 'strong'} · ${a.time < 0.5 ? 'sudden   ' : 'sustained'} · ${a.space < 0.5 ? 'direct  ' : 'indirect'}  ${a.feel}`);
    console.log('\nAdd --flow bound (contained, exact, no overshoot) or --flow free (released, with follow-through).');
    return 0;
  }
  if (flag('help') || argv.includes('-h') || !argv.length) {
    console.log('motion_tokens: derive motion tokens from a motion character.\n  --action dab|flick|glide|float|punch|slash|press|wring [--flow bound|free]\n  --weight n --time n --space n --flow n   (0 to 1 each)\n  list   show the eight actions\n  --json, --prefix <name>');
    return argv.length ? 0 : 2;
  }
  const action = opt('action');
  let factors, label;
  if (action) {
    if (!ACTIONS[action]) { console.error(`motion_tokens: unknown action "${action}". Run \`motion_tokens.mjs list\`.`); return 2; }
    const f = opt('flow', 'bound');
    const flow = f === 'bound' ? 0.15 : f === 'free' ? 0.8 : Number(f);
    if (!(flow >= 0 && flow <= 1)) { console.error('motion_tokens: --flow takes bound, free or a number from 0 to 1'); return 2; }
    factors = { ...ACTIONS[action], flow };
    label = `${action} (${ACTIONS[action].feel}), ${flow < 0.35 ? 'bound' : 'free'} flow`;
  } else {
    factors = {};
    for (const k of ['weight', 'time', 'space', 'flow']) {
      const v = Number(opt(k));
      if (!(v >= 0 && v <= 1)) { console.error(`motion_tokens: --${k} is required as a number from 0 to 1 (or use --action)`); return 2; }
      factors[k] = v;
    }
    label = 'custom';
  }
  const tokens = derive(factors);
  if (flag('json')) { console.log(JSON.stringify({ character: label, ...tokens }, null, 2)); return 0; }
  console.log(toCss(tokens, label, opt('prefix', '')));
  console.log(`\nMotion (JS):  ${tokens.spring.motion}    GSAP: ease "${tokens.gsap.enter}" for arrivals, "${tokens.gsap.move}" for travel`);
  console.log(`Entrances:    ${tokens.guidance.entrance}`);
  console.log(`Feedback:     ${tokens.guidance.feedback}`);
  console.log(`Exits:        ${tokens.guidance.exits}`);
  console.log(`Stagger:      ${tokens.guidance.stagger}`);
  console.log(`Scroll:       ${tokens.guidance.scroll}`);
  console.log(`Out of character: ${tokens.guidance.never}.`);
  return 0;
}

import { fileURLToPath } from 'node:url';
import path from 'node:path';
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) process.exit(main());
