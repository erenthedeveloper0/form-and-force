#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Deal a creative hand: for each key frame, one lens (a question that forces a
// position out of the subject), one composition archetype and one lead medium.
// Every frame in a hand comes from a different lens family and a different
// archetype family, so the frames differ in structure by construction.
//
// Why a script decides this: an agent asked to "pick something original" picks
// the most typical original thing, every time. Drawing at random, away from
// what recent projects used, removes that choice. The deck holds questions and
// structural principles only. It contains no palettes, fonts or layouts.
//
// Usage:
//   node deal.mjs hand --register quiet|composed|expressive|radical
//                      [--frames 3] [--has photo,ui,data,object,video] [--seed <text>] [--json]
//   node deal.mjs swap --frame <n> --part lens|archetype|medium --reason "<why it cannot apply>"
//   node deal.mjs record --device "<the formal idea in one line>" [--frame <n>]
//                      [--type "Family A, Family B"] [--palette "<words or hex>"] [--motion "<character>"]
//   node deal.mjs recent [--json]          what recent projects committed to
//   node deal.mjs deck [registers|lenses|archetypes|media] [--json]
//
// History: ~/.form-and-force/history.json (override with --history <file> or
// FF_HISTORY; disable with --no-history). It stores ids, typeface names and the
// one-line device you record, keyed by a hash of the project path. Nothing is
// sent anywhere. Zero dependencies; Node 18+.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DECK = JSON.parse(fs.readFileSync(path.join(HERE, 'deck.json'), 'utf8'));
const KEEP = 40;          // hands and commitments remembered
const AVOID_HANDS = 2;    // lenses and archetypes from this many recent hands stay out of the draw
const HAS = ['photo', 'ui', 'data', 'object', 'video'];

const argv = process.argv.slice(2);
const cmd = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'help';
const flag = (name) => argv.includes('--' + name);
const opt = (name, fallback = null) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const die = (msg, code = 2) => { console.error('deal: ' + msg); process.exit(code); };

// ---- history -----------------------------------------------------------
const historyFile = flag('no-history') ? null
  : path.resolve(opt('history') || process.env.FF_HISTORY || path.join(os.homedir(), '.form-and-force', 'history.json'));
const project = crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 8);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };   // the local date

function loadHistory() {
  const empty = { version: 1, hands: [], committed: [] };
  if (!historyFile) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    return { ...empty, ...data, hands: data.hands || [], committed: data.committed || [] };
  } catch { return empty; }
}
function saveHistory(h) {
  if (!historyFile) return null;
  h.hands = h.hands.slice(-KEEP); h.committed = h.committed.slice(-KEEP);
  try {
    fs.mkdirSync(path.dirname(historyFile), { recursive: true });
    fs.writeFileSync(historyFile, JSON.stringify(h, null, 1) + '\n');
    return null;
  } catch (e) { return `history not saved (${e.code || e.message}); the hand is still valid`; }
}

// ---- seeded randomness -------------------------------------------------
function rng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) { h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const shuffle = (list, rand) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Draw `n` items from distinct families, preferring anything not in `stale`.
function drawDistinct(items, n, stale, rand) {
  const families = shuffle([...new Set(items.map((x) => x.family))], rand);
  const freshFamilies = families.filter((f) => items.some((x) => x.family === f && !stale.has(x.id)));
  const order = [...freshFamilies, ...families.filter((f) => !freshFamilies.includes(f))];
  return order.slice(0, n).map((f) => {
    const pool = items.filter((x) => x.family === f);
    const fresh = pool.filter((x) => !stale.has(x.id));
    return shuffle(fresh.length ? fresh : pool, rand)[0];
  });
}
function pickVariant(lens, staleVariants, rand) {
  if (!lens.variants) return null;
  const fresh = lens.variants.filter((v) => !staleVariants.has(v));
  return shuffle(fresh.length ? fresh : lens.variants, rand)[0];
}

const registerOf = (id) => DECK.registers.find((r) => r.id === id);
const lensOf = (id) => DECK.lenses.find((l) => l.id === id);
const archetypeOf = (id) => DECK.archetypes.find((a) => a.id === id);
const mediumOf = (id) => DECK.media.find((m) => m.id === id);
const ask = (lens, variant) => lens.ask.replace('{variant}', variant || '');

function parseHas() {
  const raw = opt('has');
  if (!raw || raw === 'none') return [];
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const bad = list.filter((x) => !HAS.includes(x));
  if (bad.length) die(`--has takes ${HAS.join(', ')} or none (got ${bad.join(', ')}). List only material the project really has.`);
  return list;
}

// Lead media for n frames: material the project really has alternates with media
// made in code, so a hand explores both and never leans on assets that don't exist.
function dealMedia(reg, has, n, rand) {
  const usable = DECK.media.filter((m) => m.minRegister <= reg.level && m.needs.every((x) => has.includes(x)));
  const owned = shuffle(usable.filter((m) => m.needs.length), rand);
  const made = shuffle(usable.filter((m) => !m.needs.length), rand);
  const out = [];
  while (out.length < n && (owned.length || made.length)) {
    if (owned.length) out.push(owned.shift());
    if (out.length < n && made.length) out.push(made.shift());
  }
  return shuffle(out, rand);
}

function stale(history) {
  const recent = history.hands.slice(-AVOID_HANDS);
  const frames = recent.flatMap((h) => h.frames);
  return {
    lenses: new Set(frames.map((f) => f.lens)),
    archetypes: new Set(frames.map((f) => f.archetype)),
    variants: new Set(history.hands.slice(-8).flatMap((h) => h.frames.map((f) => f.variant)).filter(Boolean)),
  };
}

function dealHand() {
  const reg = registerOf(opt('register'));
  if (!reg) die(`--register is required: ${DECK.registers.map((r) => r.id).join(' | ')}.\nSet it from the brief before dealing (references/direction.md); the script will not choose it for you.`);
  const n = Number(opt('frames', 3));
  if (!Number.isInteger(n) || n < 1 || n > 4) die('--frames takes 1 to 4');
  const has = parseHas();
  const seed = opt('seed') || crypto.randomBytes(8).toString('hex');
  const rand = rng(seed);
  const history = loadHistory();
  const old = stale(history);

  const lenses = drawDistinct(DECK.lenses, n, old.lenses, rand);
  const allowed = DECK.archetypes.filter((a) => a.registers.includes(reg.level));
  const archetypes = drawDistinct(allowed, n, old.archetypes, rand);
  const media = dealMedia(reg, has, n, rand);
  const frames = lenses.map((lens, i) => ({
    lens: lens.id,
    variant: pickVariant(lens, old.variants, rand),
    archetype: archetypes[i % archetypes.length].id,
    medium: media[i % media.length].id,
  }));
  const hand = { at: today(), project, register: reg.id, has, seed, frames };
  history.hands.push(hand);
  const note = saveHistory(history);
  return { hand, note, taken: takenList(history) };
}

function takenList(history) {
  return history.committed.slice(-6).reverse().map((c) => ({
    at: c.at, sameProject: c.project === project, device: c.device, archetype: c.archetype, lens: c.lens,
    type: c.type || [], palette: c.palette || null, motion: c.motion || null,
  }));
}

function latestHand(history) {
  for (let i = history.hands.length - 1; i >= 0; i--) if (history.hands[i].project === project) return history.hands[i];
  return null;
}

function swap() {
  const history = loadHistory();
  const hand = latestHand(history);
  if (!hand) die('no hand has been dealt in this folder (run `deal.mjs hand` from the project root first, with the same --history)');
  const n = Number(opt('frame'));
  const part = opt('part');
  const reason = (opt('reason') || '').trim();
  if (!(n >= 1 && n <= hand.frames.length)) die(`--frame takes 1 to ${hand.frames.length}`);
  if (!['lens', 'archetype', 'medium'].includes(part)) die('--part takes lens, archetype or medium');
  if (reason.length < 12) die('--reason must say why the dealt card cannot apply to this project (12+ characters). "I prefer another" is not a reason.');
  if ((hand.swaps || []).some((s) => s.frame === n)) die(`frame ${n} has already had its one swap. Answer the cards you hold, or deal a new hand.`);
  const rand = rng(opt('seed') || crypto.randomBytes(8).toString('hex'));
  const frame = hand.frames[n - 1];
  const others = hand.frames.filter((_, i) => i !== n - 1);
  const reg = registerOf(hand.register);
  const was = frame[part];
  if (part === 'lens') {
    const taken = new Set(others.map((f) => lensOf(f.lens).family).concat(lensOf(frame.lens).family));
    const pool = DECK.lenses.filter((l) => !taken.has(l.family));
    const lens = shuffle(pool, rand)[0];
    frame.lens = lens.id; frame.variant = pickVariant(lens, new Set(), rand);
  } else if (part === 'archetype') {
    const taken = new Set(others.map((f) => archetypeOf(f.archetype).family).concat(archetypeOf(frame.archetype).family));
    const allowed = DECK.archetypes.filter((a) => a.registers.includes(reg.level));
    const pool = allowed.filter((a) => !taken.has(a.family));
    frame.archetype = shuffle(pool.length ? pool : allowed.filter((a) => a.id !== was), rand)[0].id;
  } else {
    const pool = DECK.media.filter((m) => m.minRegister <= reg.level && m.needs.every((x) => (hand.has || []).includes(x)) && m.id !== was);
    if (!pool.length) die('no other medium is available for this register and --has list');
    const unused = pool.filter((m) => !others.some((f) => f.medium === m.id));
    frame.medium = shuffle(unused.length ? unused : pool, rand)[0].id;
  }
  hand.swaps = [...(hand.swaps || []), { frame: n, part, was, reason, at: today() }];
  const note = saveHistory(history);
  return { hand, note, taken: takenList(history) };
}

function record() {
  const device = (opt('device') || '').trim();
  if (device.length < 12) die('--device is required: the formal idea in one line, as a rule someone could see in a screenshot');
  const history = loadHistory();
  const hand = latestHand(history);
  const n = Number(opt('frame'));
  const frame = hand && n >= 1 && n <= hand.frames.length ? hand.frames[n - 1] : null;
  const entry = {
    at: today(), project, register: hand ? hand.register : opt('register'), device,
    lens: frame ? frame.lens : opt('lens'), archetype: frame ? frame.archetype : opt('archetype'),
    type: (opt('type') || '').split(',').map((s) => s.trim()).filter(Boolean),
    palette: opt('palette'), motion: opt('motion'),
  };
  history.committed.push(entry);
  const note = saveHistory(history);
  return { entry, note };
}

// ---- output ------------------------------------------------------------
const wrap = (text, indent) => {
  const out = []; let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > 92 - indent.length) { out.push(indent + line.trim()); line = word; } else line += ' ' + word;
  }
  if (line.trim()) out.push(indent + line.trim());
  return out.join('\n');
};

function printHand({ hand, note, taken }) {
  const reg = registerOf(hand.register);
  const L = [];
  L.push(`Hand for register ${reg.name.toUpperCase()}: ${reg.motto}`);
  L.push(wrap(`Bold here means: ${reg.bold}`, '  '));
  L.push(wrap(`The least it must do: ${reg.floor}`, '  '));
  L.push(wrap(`Timid looks like: ${reg.timid}`, '  '));
  L.push(wrap(`Overwrought looks like: ${reg.overwrought}`, '  '));
  hand.frames.forEach((f, i) => {
    const lens = lensOf(f.lens), arch = archetypeOf(f.archetype), med = mediumOf(f.medium);
    L.push('');
    L.push(`FRAME ${'ABCD'[i]}`);
    L.push(`  Lens: ${lens.name}  [${lens.family}]`);
    L.push(wrap(ask(lens, f.variant), '    '));
    L.push(wrap(`Answer with: ${lens.answer}`, '    '));
    if (reg.level <= 2) L.push(wrap(`In this register: ${lens.restraint}`, '    '));
    L.push(wrap(`Trap: ${lens.trap}`, '    '));
    L.push(`  Structure: ${arch.name}  [${arch.family}]`);
    L.push(wrap(arch.principle, '    '));
    L.push(wrap(`Decide: ${arch.decide}`, '    '));
    L.push(wrap(`Trap: ${arch.risk}`, '    '));
    L.push(`  Lead medium: ${med.name}`);
    L.push(wrap(med.note, '    '));
  });
  L.push('');
  L.push('How to play it');
  L.push(wrap('1. Answer each lens from a mined fact of this project, in the form the card asks for. One or two lines per frame. No fact, no answer.', '  '));
  L.push(wrap('2. Write each answer as a device: "<fact>, therefore <rule you could see in a screenshot>".', '  '));
  L.push(wrap('3. Sketch every frame before preferring one (sketch_board.mjs). Choose by looking, not by which one is easiest to defend.', '  '));
  L.push(wrap('4. A card that truly cannot apply may be swapped once per frame: deal.mjs swap --frame <n> --part lens|archetype|medium --reason "...".', '  '));
  L.push(wrap('5. When a direction is chosen: deal.mjs record --frame <n> --device "..." --type "..." --palette "..." --motion "...".', '  '));
  if (taken.length) {
    L.push('');
    L.push('Recently committed on your projects. Treat as taken unless this client owns them:');
    for (const t of taken) {
      const bits = [t.type.length ? `type ${t.type.join(' + ')}` : null, t.palette ? `palette ${t.palette}` : null, t.archetype ? `structure ${t.archetype}` : null, t.motion ? `motion ${t.motion}` : null].filter(Boolean);
      L.push(`  ${t.at}${t.sameProject ? ' (this project)' : ''}: ${bits.join(' · ') || t.device}`);
    }
  }
  if (hand.swaps && hand.swaps.length) {
    L.push('');
    for (const s of hand.swaps) L.push(`Swapped frame ${'ABCD'[s.frame - 1]} ${s.part} (was ${s.was}): ${s.reason}`);
  }
  L.push('');
  L.push(`seed ${hand.seed}${historyFile ? `  ·  history ${historyFile}` : '  ·  history off'}`);
  if (note) L.push('note: ' + note);
  console.log(L.join('\n'));
}

function printDeck(section) {
  const show = (title, rows) => { console.log(`\n${title}`); for (const r of rows) console.log(r); };
  if (!section || section === 'registers') show('REGISTERS', DECK.registers.map((r) => `  ${r.id.padEnd(11)} ${r.motto}  For: ${r.for}`));
  if (!section || section === 'lenses') show('LENSES', DECK.lenses.map((l) => `  ${l.id.padEnd(18)} [${l.family}]  ${l.name}${l.variants ? ` (${l.variants.length} variants)` : ''}`));
  if (!section || section === 'archetypes') show('ARCHETYPES', DECK.archetypes.map((a) => `  ${a.id.padEnd(14)} [${a.family}]  registers ${a.registers.join(',')}  ${a.principle}`));
  if (!section || section === 'media') show('LEAD MEDIA', DECK.media.map((m) => `  ${m.id.padEnd(11)} needs ${m.needs.join(',') || 'nothing'}  ${m.note}`));
}

const asJson = flag('json');
if (cmd === 'hand' || cmd === 'swap') {
  const result = cmd === 'hand' ? dealHand() : swap();
  if (asJson) {
    const reg = registerOf(result.hand.register);
    console.log(JSON.stringify({
      register: reg, seed: result.hand.seed, historyFile, note: result.note, taken: result.taken, swaps: result.hand.swaps || [],
      frames: result.hand.frames.map((f) => ({ lens: { ...lensOf(f.lens), ask: ask(lensOf(f.lens), f.variant), variant: f.variant, variants: undefined }, archetype: archetypeOf(f.archetype), medium: mediumOf(f.medium) })),
    }, null, 2));
  } else printHand(result);
} else if (cmd === 'record') {
  const { entry, note } = record();
  if (asJson) console.log(JSON.stringify({ recorded: entry, historyFile, note }, null, 2));
  else console.log(`Recorded: ${entry.device}\n  ${[entry.archetype && `structure ${entry.archetype}`, entry.type.length && `type ${entry.type.join(' + ')}`, entry.palette && `palette ${entry.palette}`, entry.motion && `motion ${entry.motion}`].filter(Boolean).join(' · ') || '(no details given)'}${note ? '\nnote: ' + note : ''}`);
} else if (cmd === 'recent') {
  const taken = takenList(loadHistory());
  if (asJson) console.log(JSON.stringify({ historyFile, taken }, null, 2));
  else if (!taken.length) console.log('No commitments recorded yet.');
  else for (const t of taken) console.log(`${t.at}${t.sameProject ? ' (this project)' : ''}: ${t.device}\n  ${[t.archetype && `structure ${t.archetype}`, t.type.length && `type ${t.type.join(' + ')}`, t.palette && `palette ${t.palette}`, t.motion && `motion ${t.motion}`].filter(Boolean).join(' · ')}`);
} else if (cmd === 'deck') {
  const section = argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
  if (asJson) console.log(JSON.stringify(section ? DECK[section] : DECK, null, 2));
  else printDeck(section);
} else {
  const header = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(2);
  console.log(header.slice(0, header.findIndex((l) => !l.startsWith('//'))).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(cmd === 'help' || flag('help') ? 0 : 2);
}
