#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Static scan of a frontend codebase for default-pattern review triggers (A),
// combined-sameness escalations (B), and concrete failures (C).
// Findings are prompts for judgement, not verdicts: an A trigger is fine when
// the creative direction justifies it. C findings are defects to fix.
//
// Usage: node slop_scan.mjs [dir] [--json] [--max <n per rule>] [--strict]
//   --strict  exit 1 when any C finding exists (for CI / pre-handoff gates)
// Zero dependencies. Never prints matched secret values.

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const root = path.resolve(argv.find((a) => !a.startsWith('--') && !/^\d+$/.test(a)) || '.');
const asJson = argv.includes('--json');
const strict = argv.includes('--strict');
const maxIdx = argv.indexOf('--max');
const MAX = maxIdx >= 0 ? Number(argv[maxIdx + 1]) || 5 : 5;

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.turbo', '.vercel', '.netlify', '.svelte-kit', '.nuxt', '.output', '.astro', 'vendor', '.cache', 'storybook-static', '__snapshots__', '.ff-audit']);
const EXT = /\.(tsx?|jsx?|mjs|cjs|vue|svelte|astro|html?|css|scss|sass|less|mdx?)$/i;
const SKIP_FILE = /(\.min\.|\.d\.ts$|^(README|CHANGELOG|CONTRIBUTING|LICENSE|SECURITY|CODE_OF_CONDUCT|CLAUDE|AGENTS|SKILL)\b|package-lock|pnpm-lock|yarn\.lock)/i;
const UI_FILE = /\.(tsx|jsx|vue|svelte|astro|html?)$/i;
const TEST_FILE = /(\.test\.|\.spec\.|__tests__|\/tests?\/|\/e2e\/|\.stories\.)/i;

function walk(dir, files = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.storybook') { if (e.isDirectory()) continue; }
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, files); }
    else if (EXT.test(e.name) && !SKIP_FILE.test(e.name)) {
      try { if (fs.statSync(p).size < 800_000) files.push(p); } catch { /* unreadable */ }
    }
  }
  return files;
}

// ---- color helpers for purple/violet gradient detection ----
function hueSat(color) {
  let m;
  if ((m = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})\b/i))) {
    let h = m[1]; if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return rgbToHs(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16));
  }
  if ((m = color.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i))) return rgbToHs(+m[1], +m[2], +m[3]);
  if ((m = color.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%/i))) return { h: +m[1], s: +m[2] / 100 };
  if ((m = color.match(/^oklch\(\s*[\d.]+%?\s+([\d.]+)\s+([\d.]+)/i))) return { h: +m[2] - 20, s: Math.min(1, +m[1] * 4) }; // oklch hue ≈ hsl hue + ~20 in the violet range
  return null;
}
function rgbToHs(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return { h: 0, s: 0 };
  const l = (max + min) / 2; const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return { h, s };
}
const isVioletish = (c) => { const hs = hueSat(c); return !!hs && hs.s > 0.35 && hs.h >= 245 && hs.h <= 300; };

// ---- rules ----
// cat: A = review trigger, C = failure. sev: info | review | high
const COPY_CLICHES = /\b(unlock (?:your|the|new)|unleash|supercharg\w*|revolutioni[sz]\w*|game[- ]chang\w*|cutting[- ]edge|next[- ]gen(?:eration)?\b|seamless(?:ly)?|effortless(?:ly)?|elevate your|empower(?:s|ing)? (?:you|your|teams)|transform (?:your|the way)|take (?:\w+ )?to the next level|redefin\w+ (?:the|how)|harness the power|in today'?s (?:fast[- ]paced|digital)|world[- ]class|best[- ]in[- ]class|all[- ]in[- ]one (?:platform|solution)|everything you need|built for the future|the future of \w+|lightning[- ]fast|blazing(?:ly)?[- ]fast|reimagin\w+|unparalleled|state[- ]of[- ]the[- ]art|one[- ]stop[- ]shop|streamline your)\b/i;

const LINE_RULES = [
  // C — failures
  { id: 'placeholder-copy', cat: 'C', sev: 'high', title: 'Placeholder or filler content', why: 'Lorem ipsum / dummy names / "Your Company" ship as broken content.', re: /\blorem ipsum\b|\bdolor sit amet\b|\b(?:John|Jane) (?:Doe|Smith)\b|\bAcme (?:Inc|Corp|Co)\b|\bYour (?:Company|Brand|Name|Logo) Here\b|\bCompany Name\b|\bTODO:? (?:copy|text|content)\b/i },
  { id: 'placeholder-media', cat: 'C', sev: 'high', title: 'Placeholder / random media service', why: 'Random stock or generated faces imply people and products that do not exist.', re: /(?:via\.placeholder\.com|placehold\.co|placekitten|picsum\.photos|source\.unsplash\.com|loremflickr|dummyimage\.com|i\.pravatar\.cc|randomuser\.me|robohash\.org|thispersondoesnotexist)/i },
  { id: 'dead-link', cat: 'C', sev: 'high', title: 'Dead link or javascript: href', why: 'Controls that go nowhere are fake functionality.', re: /\bhref\s*=\s*(?:["']#["']|\{\s*["']#["']\s*\}|["']["']|["']javascript:)/ },
  { id: 'noop-handler', cat: 'C', sev: 'high', title: 'No-op or console-only event handler', why: 'A visible control must do something real (or be clearly bounded).', re: /\bon(?:Click|Submit|Change)\s*=\s*\{\s*\(\s*\w*\s*\)\s*=>\s*(?:\{\s*\}|console\.log|alert\()/ },
  { id: 'focus-removed', cat: 'A', sev: 'high', title: 'Focus outline removed: verify a visible replacement', why: 'Hidden focus fails WCAG 2.4.7. Static scan cannot see container rings or carets; confirm with audit_page.mjs keyboard probe.', re: /\b(?:focus:)?outline-none\b|:focus\s*\{[^}]*outline\s*:\s*(?:none|0)\b/, unless: /focus-visible|focus:ring|focus-within:ring|ring-\d|focus:border|focus:shadow|focus:underline|outline-offset|focus:outline-\d/ },
  { id: 'zoom-blocked', cat: 'C', sev: 'high', title: 'Viewport blocks zoom', why: 'user-scalable=no / maximum-scale=1 blocks low-vision users (WCAG 1.4.4).', re: /user-scalable\s*=\s*(?:no|0)|maximum-scale\s*=\s*1(?:\.0)?\b/i },
  { id: 'positive-tabindex', cat: 'C', sev: 'high', title: 'Positive tabindex', why: 'Breaks natural focus order (WCAG 2.4.3).', re: /tab[iI]ndex\s*=\s*(?:\{\s*[1-9]|["'][1-9])/ },
  { id: 'client-secret', cat: 'C', sev: 'high', title: 'Possible secret in client-side code', why: 'Anything bundled for the browser is public.', re: /(?:NEXT_PUBLIC_|VITE_|PUBLIC_)\w*(?:SECRET|PRIVATE|PASSWORD)\w*|\bsk_live_[0-9a-zA-Z]{10,}|\bAKIA[0-9A-Z]{16}\b|-----BEGIN (?:RSA )?PRIVATE KEY/, secret: true },

  // A — review triggers (justify or replace)
  { id: 'copy-cliche', cat: 'A', sev: 'review', title: 'Generic marketing phrase', why: 'Untestable claims that fit any company; name the user, task, object and result instead.', re: COPY_CLICHES },
  { id: 'unverified-claim', cat: 'A', sev: 'review', title: 'Quantified claim / social proof to verify', why: 'Numbers, ratings and "trusted by" must come from the client, with a source.', re: /\b\d[\d,.]*\s*[kKmM]?\+?\s*(?:users|customers|teams|companies|businesses|developers|downloads|reviews)\b|\btrusted by\b|\b\d+(?:\.\d+)?x (?:faster|more|better)\b|\b(?:4\.\d|5\.0)\s*(?:\/\s*5|stars?|rating)\b|★★★★/i },
  { id: 'violet-gradient-tw', cat: 'A', sev: 'review', title: 'Purple/violet/indigo gradient (utility classes)', why: 'The most common unexamined AI default; keep only if the brand demands it.', re: /\b(?:from|via|to)-(?:purple|violet|indigo|fuchsia)-\d{2,3}\b/ },
  { id: 'gradient-text', cat: 'A', sev: 'review', title: 'Gradient-filled text', why: 'Decoration standing in for hierarchy; often hurts contrast.', re: /bg-clip-text[^"'`]*text-transparent|text-transparent[^"'`]*bg-clip-text|background-clip\s*:\s*text/ },
  { id: 'glass', cat: 'A', sev: 'review', title: 'Backdrop blur / glassmorphism', why: 'Universal glass panels read as template chrome and cost paint time.', re: /\bbackdrop-blur(?:-\w+)?\b|backdrop-filter\s*:\s*blur/, unless: /fixed\s+inset-0|overlay|backdrop\b(?!-)/i },
  { id: 'glow', cat: 'A', sev: 'review', title: 'Glow shadow', why: 'Neon glows as default decoration.', re: /shadow-\[0_0_\d+px|box-shadow\s*:\s*0\s+0\s+\d{2,}px|drop-shadow-\[0_0_|\bshadow-(?:purple|violet|indigo|fuchsia|cyan|blue|emerald)-\d{3}(?:\/\d+)?\b/ },
  { id: 'orb', cat: 'A', sev: 'review', title: 'Blurred orb / blob background', why: 'Floating gradient orbs are a stock "premium" signal with no meaning.', re: /(?=[^"'`\n]*\brounded-full\b)(?=[^"'`\n]*\bblur-(?:2xl|3xl|\[\d{2,}px\]))|\b(?:orb|blob)s?\b(?=[^\n]*(?:class|className|style|absolute))/ },
  { id: 'grain', cat: 'A', sev: 'info', title: 'Grain / noise texture', why: 'Texture added "to look expensive" must have a compositional role.', re: /feTurbulence|\bnoise\.(?:png|svg|webp)|\bgrain\b(?=[^\n]*(?:class|url|opacity|background))/i },
  { id: 'emoji-icon', cat: 'A', sev: 'review', uiOnly: true, title: 'Emoji used as UI icon', why: 'Emoji as feature icons is a strong generic-AI tell.', re: /[\u{1F680}\u{2728}\u{26A1}\u{1F525}\u{1F4A1}\u{1F3AF}\u{1F31F}\u{1F48E}\u{1F916}\u{1F9E0}\u{1F4C8}\u{1F6E1}\u{2705}]/u },
  { id: 'stock-ai-icons', cat: 'A', sev: 'review', title: 'Stock "magic" icons (Sparkles, Rocket, Zap, Wand…)', why: 'Generic icons that say "AI/fast/magic" without information.', re: /import\s*\{[^}]*\b(?:Sparkles?|Rocket|Zap|Wand2?|WandSparkles|Stars|BrainCircuit|Bot)\b[^}]*\}\s*from\s*['"](?:lucide-react|@heroicons|react-icons|@tabler)/ },
  { id: 'eyebrow', cat: 'A', sev: 'info', title: 'Tracked uppercase eyebrow label', why: 'A label above every heading is template chrome unless it encodes information.', re: /\b(?:text-(?:xs|\[1[01]px\]|sm)[^"'`]*uppercase[^"'`]*tracking-(?:wide|wider|widest|\[)|uppercase[^"'`]*tracking-(?:wider|widest|\[0?\.[1-4])[^"'`]*text-(?:xs|sm))/ },
  { id: 'pill-badge', cat: 'A', sev: 'info', title: 'Pill badge', why: 'Pill labels ("New", "Beta", "AI-powered") that carry no information.', re: /\brounded-full\b(?=[^"'`]*\bborder\b)(?=[^"'`]*\bpx-[23]\b)(?=[^"'`]*\btext-(?:xs|sm)\b)/ },
  { id: 'arrow-suffix', cat: 'A', sev: 'info', title: 'Arrow appended to link/button text', why: '"Learn more →" on every action is template chrome.', re: />\s*[^<>{}\n]{2,40}\s(?:→|->|&rarr;)\s*</ },
  { id: 'transition-all', cat: 'A', sev: 'review', title: 'transition: all', why: 'Animates unintended properties (layout/paint); name the properties.', re: /transition\s*:\s*all\b|\btransition-all\b/ },
  { id: 'layout-anim', cat: 'A', sev: 'review', title: 'Animating layout properties', why: 'width/height/top/left/margin animations trigger layout every frame; prefer transform/opacity.', re: /gsap\.(?:to|from|fromTo)\([^)]*\b(?:width|height|top|left|right|bottom|margin\w*|padding\w*)\s*:|@keyframes[^{]*\{[^}]*\b(?:width|height|top|left|margin)\s*:/ },
  { id: 'scroll-listener', cat: 'A', sev: 'review', title: 'Scroll listener without passive option', why: 'Non-passive scroll/touch/wheel listeners can block scrolling.', re: /addEventListener\(\s*['"](?:scroll|wheel|touchmove|touchstart)['"]\s*,\s*[^,)]+\)/ },
  { id: 'html-injection', cat: 'A', sev: 'review', title: 'Raw HTML injection', why: 'dangerouslySetInnerHTML / v-html / innerHTML need trusted or sanitised input.', re: /dangerouslySetInnerHTML|\bv-html\b|\.innerHTML\s*=/ },
];

// Tag-aware rules: attributes may span lines; `=>` and braces inside attributes are handled.
const TAG_RE = /<(img|Image|div|span|li|section|article|figure|video|svg)\b((?:[^>"'{]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)>/g;
const TAG_RULES = [
  { id: 'img-no-alt', cat: 'C', sev: 'high', title: '<img>/<Image> without alt', why: 'Missing alt fails WCAG 1.1.1; decorative images need alt="".', tags: /^(img|Image)$/, test: (a) => !/\balt\s*=|\{\s*\.\.\./.test(a) },
  { id: 'clickable-nonsemantic', cat: 'C', sev: 'high', title: 'onClick on non-interactive element without role/tabIndex', why: 'Not keyboard-operable or announced; use <button>/<a>.', tags: /^(div|span|li|img|section|article|figure|svg)$/, test: (a) => /\bonClick\s*=/.test(a) && !/\brole\s*=/.test(a) && !/\btab[iI]ndex\s*=/.test(a) },
  { id: 'autoplay-unmuted', cat: 'C', sev: 'high', title: 'Autoplay video without muted', why: 'Browsers block it; unexpected audio harms users (WCAG 1.4.2).', tags: /^video$/, test: (a) => /\bauto[pP]lay\b/.test(a) && !/\bmuted\b/.test(a) },
];

// Per-file conditions
const FILE_RULES = [
  { id: 'gsap-no-cleanup', cat: 'C', sev: 'high', title: 'GSAP in React effect without context/revert', why: 'Leaks tweens/ScrollTriggers on unmount and double-runs under Strict Mode. Use useGSAP() or gsap.context().revert().', test: (t) => /from\s+['"]gsap['"]/.test(t) && /\buse(?:Layout)?Effect\b/.test(t) && !/useGSAP|gsap\.context|\.revert\(\)|\.kill\(\)/.test(t) },
  { id: 'three-no-dispose', cat: 'A', sev: 'high', title: 'WebGLRenderer without any dispose()', why: 'three.js never frees GPU memory automatically; dispose geometries, materials, textures, render targets and the renderer.', test: (t) => /new\s+(?:THREE\.)?WebGLRenderer\b/.test(t) && !/\.dispose\(\)/.test(t) },
  { id: 'raf-no-cancel', cat: 'A', sev: 'review', title: 'requestAnimationFrame without cancelAnimationFrame', why: 'Loops that survive unmount waste CPU/GPU and leak.', test: (t) => /requestAnimationFrame\(/.test(t) && !/cancelAnimationFrame/.test(t) && !/gsap\.ticker|useFrame|autoRaf/.test(t) },
  { id: 'fake-progress', cat: 'C', sev: 'high', title: 'Timer-driven loading percentage', why: 'A progress number that does not measure real loading is a fake signal.', test: (t) => /setInterval\(/.test(t) && /(?:progress|percent|loaded)\w*\s*(?:\+\+|\+=\s*\d|\(\s*\w+\s*=>\s*\w+\s*\+\s*\d)/i.test(t) && /preload|loader|loading/i.test(t) },
];

const files = walk(root);
const findings = new Map();
const add = (rule, file, line, text) => {
  if (!findings.has(rule.id)) findings.set(rule.id, { ...rule, re: undefined, test: undefined, count: 0, samples: [] });
  const f = findings.get(rule.id); f.count++;
  if (f.samples.length < MAX) f.samples.push(`${path.relative(root, file)}:${line}${rule.secret ? '' : '  ' + text.trim().replace(/\s+/g, ' ').slice(0, 110)}`);
};

const agg = { bigMotion: false, entrance: 0, entranceFiles: new Set(), parallax: 0, cursor: 0, smooth: 0, motion: false, reduced: 0, sections: new Set(), radius: {}, fonts: new Set(), scrollTriggerUse: false, scrollTriggerReg: false, violetCss: 0 };
const SECTION_NAMES = ['Hero', 'Features', 'FeatureGrid', 'Testimonials', 'Pricing', 'FAQ', 'Faq', 'CTA', 'Cta', 'LogoCloud', 'Logos', 'Stats', 'HowItWorks', 'Newsletter'];

for (const file of files) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  const isTest = TEST_FILE.test(file);
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.length > 2000) continue;
    const isComment = /^\s*(?:\/\/|\*|\/\*|<!--|#\s)/.test(ln);
    for (const r of LINE_RULES) {
      if (isComment && r.id !== 'client-secret') continue;
      if (r.uiOnly && !UI_FILE.test(file)) continue;
      if (isTest && r.cat === 'C' && r.id !== 'client-secret') continue;
      if (r.re.test(ln) && !(r.unless && r.unless.test(ln))) add(r, file, i + 1, ln);
    }
    // CSS gradients with violet stops
    const g = ln.match(/(?:linear|radial|conic)-gradient\(([^;]+)/);
    if (g) {
      const colors = g[1].match(/#[0-9a-f]{3,6}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)/gi) || [];
      if (colors.some(isVioletish)) { agg.violetCss++; add({ id: 'violet-gradient-css', cat: 'A', sev: 'review', title: 'Purple/violet gradient (CSS)', why: 'The most common unexamined AI default; keep only if the brand demands it.' }, file, i + 1, ln); }
    }
  }
  for (const r of FILE_RULES) if (!isTest && r.test(text)) add(r, file, 1, '(file-level)');
  if (!isTest && /\.(tsx|jsx|vue|svelte|astro|html?|mdx)$/i.test(file)) {
    for (const m of text.matchAll(TAG_RE)) {
      for (const r of TAG_RULES) {
        if (r.tags.test(m[1]) && r.test(m[2])) add(r, file, text.slice(0, m.index).split('\n').length, m[0]);
      }
    }
  }

  agg.entrance += (text.match(/whileInView|initial=\{\{\s*opacity:\s*0,\s*[xy]:|data-aos\b|\bfade-?(?:in-?)?up\b|fadeInUp|reveal-up|gsap\.from\([^)]*opacity\s*:\s*0|animate-fade-in/g) || []).length;
  if (/whileInView|data-aos|fadeInUp|fade-up|gsap\.from\([^)]*opacity\s*:\s*0/.test(text)) agg.entranceFiles.add(path.relative(root, file));
  agg.parallax += (text.match(/parallax|data-(?:scroll-)?speed|useParallax/gi) || []).length;
  agg.cursor += (text.match(/custom-?cursor|cursor-?follow|magnetic|['"]mousemove['"]/gi) || []).length;
  agg.smooth += (text.match(/from\s+['"](?:lenis|@studio-freight\/lenis|locomotive-scroll)['"]|ScrollSmoother/g) || []).length;
  if (/from\s+['"](?:gsap|framer-motion|motion(?:\/react)?|animejs|@react-spring\/\w+|lenis|three|@react-three\/fiber)['"]|@keyframes[^{]*\{[^}]*transform/.test(text)) agg.bigMotion = true;
  else if (/@keyframes|\banimate-\w+|transition\s*:|\btransition-\w+/.test(text)) agg.motion = true;
  agg.reduced += (text.match(/prefers-reduced-motion|useReducedMotion|reducedMotion|motion-reduce:|motion-safe:|MotionConfig[^>]*reducedMotion/g) || []).length;
  if (/import[^;]*\bScrollTrigger\b[^;]*from\s*['"]gsap(?:\/(?:all|ScrollTrigger|dist\/ScrollTrigger))?['"]/.test(text)) agg.scrollTriggerUse = true;
  if (/registerPlugin\([^)]*ScrollTrigger/.test(text)) agg.scrollTriggerReg = true;
  const base = path.basename(file).replace(/\.\w+$/, '');
  for (const n of SECTION_NAMES) if (base === n || base === n + 'Section' || new RegExp(`(?:function|const)\\s+${n}(?:Section)?\\b`).test(text)) agg.sections.add(n.toLowerCase().replace('featuregrid', 'features'));
  for (const m of text.matchAll(/\brounded-(sm|md|lg|xl|2xl|3xl|full|none|\[[^\]]+\])/g)) agg.radius[m[1]] = (agg.radius[m[1]] || 0) + 1;
  for (const m of text.matchAll(/(?:font-family\s*:\s*['"]?|from\s+['"]next\/font\/google['"][^\n]*|import\s*\{\s*)(Inter|Roboto|Open_Sans|Open Sans|Lato|Arial|Poppins|Montserrat|Space_Grotesk|Space Grotesk|Geist|DM_Sans|DM Sans|Playfair_Display|Playfair Display|Instrument_Serif|Instrument Serif)\b/g)) agg.fonts.add(m[1].replace('_', ' '));
}

const projectFindings = [];
const P = (id, cat, sev, title, why, detail) => projectFindings.push({ id, cat, sev, title, why, count: 1, samples: [detail] });
if (agg.bigMotion && agg.reduced === 0) P('no-reduced-motion', 'C', 'high', 'Animation libraries / transform keyframes with no reduced-motion handling', 'WCAG 2.3.3 / vestibular safety: provide reduced or replaced motion via prefers-reduced-motion.', 'motion library or transform keyframes detected; 0 prefers-reduced-motion / useReducedMotion / motion-reduce references');
else if (agg.motion && agg.reduced === 0) P('no-reduced-motion-minor', 'A', 'review', 'Transitions/animations with no reduced-motion handling', 'Small transitions are usually fine; check any that move, scale or pan large areas.', 'CSS transitions/animations only; 0 reduced-motion references');
if (agg.scrollTriggerUse && !agg.scrollTriggerReg) P('scrolltrigger-unregistered', 'C', 'high', 'ScrollTrigger used but never registered', 'Tree-shaking drops unregistered plugins in production builds.', 'add gsap.registerPlugin(ScrollTrigger)');
if (agg.entrance >= 8) P('entrance-everywhere', 'A', 'review', 'Scroll-entrance animation on many elements', 'Fade/slide-up on every section is the generic default; reserve entrances for hierarchy or narrative.', `${agg.entrance} entrance patterns across ${agg.entranceFiles.size} files`);
const sec = [...agg.sections];
if (sec.length >= 4) P('template-stack', 'A', 'review', 'Template section stack', 'Hero → features → testimonials → pricing → FAQ → CTA is the default page recipe; derive the sequence from the user journey.', `sections found: ${sec.join(', ')}`);
const rTotal = Object.values(agg.radius).reduce((a, b) => a + b, 0);
const rTop = Object.entries(agg.radius).sort((a, b) => b[1] - a[1])[0];
if (rTotal >= 25 && rTop && rTop[1] / rTotal > 0.6 && /xl|2xl|3xl|lg/.test(rTop[0])) P('uniform-radius', 'A', 'info', 'One large radius on most surfaces', 'Same rounded card for every content type erases hierarchy.', `rounded-${rTop[0]} is ${Math.round((rTop[1] / rTotal) * 100)}% of ${rTotal} radius uses`);
if (agg.fonts.size) P('default-typefaces', 'A', 'info', 'High-frequency typefaces in use', 'Not wrong, but statistically default; confirm each was chosen for this brief.', [...agg.fonts].join(', '));
if (agg.cursor) P('pointer-effects', 'A', 'review', 'Custom cursor / magnetic / mousemove effects', 'Need a function, a touch equivalent, and a reduced-motion path.', `${agg.cursor} references`);
if (agg.parallax) P('parallax', 'A', 'review', 'Parallax', 'Depth must express hierarchy or narrative; provide reduced-motion fallback.', `${agg.parallax} references`);
if (agg.smooth) P('smooth-scroll', 'A', 'review', 'Smooth-scroll library', 'Justify; respect reduced motion; prevent on nested scrollers, modals and maps.', `${agg.smooth} imports`);
const shadcnCfg = fs.existsSync(path.join(root, 'components.json'));
if (shadcnCfg) {
  const css = files.filter((f) => /globals?\.css$|index\.css$|app\.css$/.test(f)).map((f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } }).join('\n');
  if (/--primary:\s*(?:oklch\(0\.205 0 0\)|222\.2 47\.4% 11\.2%)/.test(css) || /--radius:\s*(?:0\.625rem|0\.5rem)/.test(css)) P('default-theme-tokens', 'A', 'review', 'Component-library theme tokens appear unchanged', 'Default tokens make the product look like the library demo; derive tokens from the art direction.', 'components.json present with stock --primary/--radius values');
}

const all = [...findings.values(), ...projectFindings];
const violetKinds = ['violet-gradient-tw', 'violet-gradient-css', 'gradient-text', 'glass', 'glow', 'orb', 'emoji-icon', 'stock-ai-icons', 'pill-badge', 'template-stack', 'entrance-everywhere', 'uniform-radius', 'default-theme-tokens', 'eyebrow', 'arrow-suffix'];
const sameness = all.filter((f) => violetKinds.includes(f.id));
if (sameness.length >= 3) all.push({ id: 'combined-sameness', cat: 'B', sev: 'high', title: 'Several high-sameness defaults combined', why: 'Each may be defensible alone; together they produce the generic look. Write a justification per pattern or replace them (see references/anti-slop-constitution.md).', count: sameness.length, samples: [sameness.map((s) => s.id).join(', ')] });

const order = { C: 0, B: 1, A: 2 }; const sevOrder = { high: 0, review: 1, info: 2 };
all.sort((a, b) => order[a.cat] - order[b.cat] || sevOrder[a.sev] - sevOrder[b.sev] || b.count - a.count);
const summary = { root, filesScanned: files.length, C: all.filter((f) => f.cat === 'C').length, B: all.filter((f) => f.cat === 'B').length, A: all.filter((f) => f.cat === 'A').length };

if (asJson) {
  console.log(JSON.stringify({ summary, findings: all }, null, 2));
} else {
  console.log(`slop_scan: ${files.length} files under ${root}`);
  console.log(`C failures: ${summary.C}   B combined-sameness: ${summary.B}   A review triggers: ${summary.A}\n`);
  const label = { C: 'C  FIX', B: 'B  JUSTIFY OR REPLACE', A: 'A  REVIEW' };
  let last = '';
  for (const f of all) {
    if (f.cat !== last) { console.log(`── ${label[f.cat]} ${'─'.repeat(40)}`); last = f.cat; }
    console.log(`[${f.sev}] ${f.title}  (${f.id}, ×${f.count})`);
    console.log(`      ${f.why}`);
    for (const s of f.samples) console.log(`      · ${s}`);
  }
  if (!all.length) console.log('No triggers found. Static scanning cannot judge originality; still run the critique protocol.');
}
process.exit(strict && summary.C > 0 ? 1 : 0);
