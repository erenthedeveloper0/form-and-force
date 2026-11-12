#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Static scan of a frontend codebase for default-pattern review triggers (A),
// combined-sameness escalations (B), and concrete failures (C).
// Findings are prompts for judgement, not verdicts: an A trigger is fine when
// the creative direction justifies it. C findings are defects to fix.
//
// It reads source files and the server-rendered templates that are HTML with
// template tags in it (Blade, ERB, EJS, Twig, Nunjucks, Jinja, Handlebars,
// Mustache, Liquid). Templates it has no rules for (Pug, Haml, Slim, Razor,
// JSP and others) are counted and reported as not scanned. Every report states
// its coverage, so a zero never stands for a file that nobody read.
//
// Usage: node slop_scan.mjs [dir] [--json] [--max <n per rule>] [--strict]
//   --strict  for CI and pre-handoff gates: exit 1 when any C finding exists,
//             exit 2 when there is none but template files were not scanned
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
const MAX_BYTES = 800_000;

// Server-rendered templates: HTML with template tags in it. The rules can read
// them once the template's own syntax is set aside (TEMPLATE_SYNTAX below).
// Patterns match the end of the file name, so `page.blade.php` and
// `show.html.erb` are templates and a plain `.php` file is not.
const TEMPLATES = [
  [/\.blade\.php$/i, 'blade'],
  [/\.(?:erb|ejs)$/i, 'erb'],
  [/\.(?:twig|njk|nunjucks|j2|jinja2?)$/i, 'jinja'],
  [/\.(?:hbs|handlebars|mustache)$/i, 'handlebars'],
  [/\.liquid$/i, 'liquid'],
];
// Templates this scan recognises and cannot read: indentation syntaxes that hold
// no HTML tags for the rules to find, and HTML dialects whose template syntax is
// not handled here. They are counted and reported, never read.
const TEMPLATES_UNREAD = /\.(?:pug|jade|haml|slim|cshtml|razor|jsp|phtml|heex|leex|html\.eex|gohtml)$/i;

// What a file name says about a file: a template that is read ({ ext, syntax }),
// a template that is not ({ ext }), other source ({}), or nothing this scan knows (null).
function classify(name) {
  if (SKIP_FILE.test(name)) return null;
  for (const [re, syntax] of TEMPLATES) {
    const m = name.match(re);
    if (m) return { ext: m[0].toLowerCase(), syntax };
  }
  const unread = name.match(TEMPLATES_UNREAD);
  if (unread) return { ext: unread[0].toLowerCase() };
  return EXT.test(name) ? {} : null;
}

const templates = new Map(); // template file that is read → { ext, syntax }
const unscanned = [];        // template files that were not read: { file, ext, reason }
const skipped = [];          // other recognised files that were not read: { file, reason }
const leaveOut = (file, kind, reason) => (kind.ext ? unscanned : skipped).push({ file, ext: kind.ext, reason });

function walk(dir, files = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.storybook') { if (e.isDirectory()) continue; }
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, files); continue; }
    const kind = classify(e.name);
    if (!kind) continue;
    if (kind.ext && !kind.syntax) { leaveOut(p, kind, 'unsupported format'); continue; }
    let size;
    try { size = fs.statSync(p).size; } catch { leaveOut(p, kind, 'unreadable'); continue; }
    if (size >= MAX_BYTES) { leaveOut(p, kind, 'over 800 kB'); continue; }
    files.push(p);
    if (kind.syntax) templates.set(p, kind);
  }
  return files;
}

// ---- template syntax ----
// What a template engine takes out of the page before a browser sees it. Each
// entry is [role, opener, closer], and openers are tried in this order:
//   comment  is never rendered, so nothing inside it is a finding
//   output   prints at render time; inside a tag it can add attributes the scan cannot see
//   control  branches and loops; it prints nothing itself
// A Blade directive ends at its own closing bracket, so it has no closer.
const TEMPLATE_SYNTAX = {
  blade: [
    ['comment', /\{\{--/, '--}}'],
    ['output', /\{!!/, '!!}'],
    ['output', /\{\{/, '}}'],
    ['output', /<\?(?:php|=)/, '?>'],
    ['control', /(?<![\w@])@\w+\s*\((?:[^()]|\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))*\)/, null],
  ],
  erb: [ // and EJS
    ['comment', /<%\s*#/, '%>'],
    ['output', /<%[=-]/, '%>'],
    ['control', /<%/, '%>'],
  ],
  jinja: [ // and Twig, Nunjucks
    ['comment', /\{#/, '#}'],
    ['output', /\{\{/, '}}'],
    ['control', /\{%/, '%}'],
  ],
  handlebars: [ // and Mustache
    ['comment', /\{\{!--/, '--}}'],
    ['comment', /\{\{!/, '}}'],
    ['control', /\{\{~?\s*(?:[#\/^]|else\b)/, '}}'],
    ['output', /\{\{\{/, '}}}'],
    ['output', /\{\{/, '}}'],
  ],
  liquid: [
    ['comment', /\{%-?\s*comment\s*-?%\}/, /\{%-?\s*endcomment\s*-?%\}/g],
    ['comment', /\{%-?\s*#/, '%}'],
    ['output', /\{\{/, '}}'],
    ['control', /\{%/, '%}'],
  ],
};
const OPENERS = Object.fromEntries(Object.entries(TEMPLATE_SYNTAX).map(([name, parts]) => [name, new RegExp(parts.map(([, open]) => `(${open.source})`).join('|'), 'g')]));
const DYNAMIC = '\uFFFF'; // stands in for template output; a noncharacter, so no source file contains it
const hide = (s, ch) => s.replace(/[^\n]/g, ch); // same length and line breaks, so positions and line numbers hold

// Where the construct opened before `from` ends, or -1 when it never closes.
function endOf(src, closer, from) {
  if (typeof closer === 'string') { const i = src.indexOf(closer, from); return i < 0 ? -1 : i + closer.length; }
  closer.lastIndex = from;
  const hit = closer.exec(src);
  return hit ? hit.index + hit[0].length : -1;
}

// Two readings of one template. `text` has its comments blanked and is what the
// line rules read. `markup` also blanks control tags and replaces output with
// DYNAMIC, so a `>` or a quote inside a template tag cannot end an HTML tag
// early, and a tag whose attributes are printed at render time can be told from
// one that is written out in full. It is one pass over the file: a closer that
// is missing is looked for once, so an unfinished template costs no more to
// read than a finished one.
function readTemplate(src, syntax) {
  const parts = TEMPLATE_SYNTAX[syntax];
  const opener = OPENERS[syntax];
  const missing = new Set();
  const text = [], markup = [];
  let at = 0, m;
  opener.lastIndex = 0;
  while ((m = opener.exec(src))) {
    const [role, , closer] = parts[m.findIndex((g, i) => i > 0 && g !== undefined) - 1];
    let end = opener.lastIndex;
    if (closer) {
      if (missing.has(closer)) continue;
      end = endOf(src, closer, end);
      if (end < 0) { missing.add(closer); continue; }
    }
    const plain = src.slice(at, m.index), construct = src.slice(m.index, end);
    text.push(plain, role === 'comment' ? hide(construct, ' ') : construct);
    markup.push(plain, hide(construct, role === 'output' ? DYNAMIC : ' '));
    at = opener.lastIndex = end;
  }
  text.push(src.slice(at));
  markup.push(src.slice(at));
  return { text: text.join(''), markup: markup.join('') };
}
const printsAttributes = (attrs) => attrs.replace(/"[^"]*"|'[^']*'/g, '').includes(DYNAMIC);

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
  // An empty or "#" value, written as href="#", as a bound string (Vue, Alpine: :href="'#'") or in JSX (href={"#"}),
  // or a javascript: URL. The quotes around each value must be the same character (\1; \2 and \3; \4). Two different
  // quotes are where a string ends and a concatenation begins ('<a href="' + url + '">'), which builds a real link.
  { id: 'dead-link', cat: 'C', sev: 'high', title: 'Dead link or javascript: href', why: 'Controls that go nowhere are fake functionality.', re: /\bhref\s*=\s*(?:(["'])#?\1|(["'])\s*(["'])#?\3\s*\2|\{\s*(["'])#?\4\s*\}|["']\s*["']?javascript:)/ },
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

const scanned = [];
for (const file of files) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { leaveOut(file, templates.get(file) || {}, 'unreadable'); templates.delete(file); continue; }
  scanned.push(file);
  const template = templates.get(file);
  const raw = text;
  let markup = text;
  if (template) ({ text, markup } = readTemplate(raw, template.syntax));
  const isTest = TEST_FILE.test(file);
  const isUi = UI_FILE.test(file) || !!template;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.length > 2000) continue;
    const isComment = /^\s*(?:\/\/|\*|\/\*|<!--|#\s)/.test(ln);
    for (const r of LINE_RULES) {
      if (isComment && r.id !== 'client-secret') continue;
      if (r.uiOnly && !isUi) continue;
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
  if (!isTest && (template || /\.(tsx|jsx|vue|svelte|astro|html?|mdx)$/i.test(file))) {
    for (const m of markup.matchAll(TAG_RE)) {
      // These rules look for an attribute that is missing. A template that prints attributes into the tag may supply it.
      if (template && printsAttributes(m[2])) continue;
      for (const r of TAG_RULES) {
        if (r.tags.test(m[1]) && r.test(m[2])) add(r, file, markup.slice(0, m.index).split('\n').length, raw.slice(m.index, m.index + m[0].length));
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

// ---- coverage ----
// What the counts stand on:
//   complete    every recognised file was read, and none of them is a template
//   partial     every template was read, as markup only; or another file was skipped for its size or could not be opened
//   incomplete  template files were not read at all, so a zero says nothing about them
//   empty       no file was read
const rel = (f) => path.relative(root, f);
const tally = (items) => {
  const counts = {};
  for (const { ext } of items) counts[ext] = (counts[ext] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)));
};
const named = (items) => items.map(({ file, reason }) => ({ file: rel(file), reason })).sort((a, b) => (a.file < b.file ? -1 : 1));
const coverage = {
  status: unscanned.length ? 'incomplete' : !scanned.length ? 'empty' : templates.size || skipped.length ? 'partial' : 'complete',
  templates: {
    scanned: templates.size,
    scannedExtensions: tally([...templates.values()]),
    notScanned: unscanned.length,
    notScannedExtensions: tally(unscanned),
    notScannedFiles: named(unscanned),
  },
  skipped: named(skipped),
};
const summary = { root, filesScanned: scanned.length, coverage: coverage.status, C: all.filter((f) => f.cat === 'C').length, B: all.filter((f) => f.cat === 'B').length, A: all.filter((f) => f.cat === 'A').length };
const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;
const unread = `${count(unscanned.length, 'template file')} ${unscanned.length === 1 ? 'was' : 'were'} not scanned`;

if (asJson) {
  console.log(JSON.stringify({ summary, coverage, findings: all }, null, 2));
} else {
  const perExt = (o) => Object.entries(o).map(([ext, n]) => `${ext} ×${n}`).join(', ');
  const some = (items) => items.slice(0, MAX).map((i) => `${i.file} (${i.reason})`).join(', ') + (items.length > MAX ? `, and ${items.length - MAX} more` : '');
  const t = coverage.templates;
  console.log(`slop_scan: ${scanned.length} files under ${root}`);
  console.log(`Coverage: ${coverage.status === 'complete' ? 'complete' : coverage.status.toUpperCase()}`);
  if (t.notScanned) {
    console.log(`  · NOT scanned: ${count(t.notScanned, 'template file')} (${perExt(t.notScannedExtensions)}): ${some(t.notScannedFiles)}`);
    console.log('    The counts below say nothing about them. Read them by hand.');
  }
  if (t.scanned) console.log(`  · Read as markup: ${count(t.scanned, 'template file')} (${perExt(t.scannedExtensions)}). What helpers, components and includes print at render time was not seen.`);
  if (coverage.skipped.length) console.log(`  · Skipped: ${count(coverage.skipped.length, 'other file')}: ${some(coverage.skipped)}`);
  if (coverage.status === 'empty') console.log('  · No file was read, so nothing was checked.');
  console.log(`C failures: ${summary.C}   B combined-sameness: ${summary.B}   A review triggers: ${summary.A}\n`);
  const label = { C: 'C  FIX', B: 'B  JUSTIFY OR REPLACE', A: 'A  REVIEW' };
  let last = '';
  for (const f of all) {
    if (f.cat !== last) { console.log(`── ${label[f.cat]} ${'─'.repeat(40)}`); last = f.cat; }
    console.log(`[${f.sev}] ${f.title}  (${f.id}, ×${f.count})`);
    console.log(`      ${f.why}`);
    for (const s of f.samples) console.log(`      · ${s}`);
  }
  if (!all.length) {
    console.log(coverage.status === 'empty' ? 'Nothing was scanned, so there is no result. This is not a pass.'
      : coverage.status === 'incomplete' ? `No triggers found in what was scanned. This is not a clean result: ${unread}.`
        : 'No triggers found. Static scanning cannot judge originality; still run the critique protocol.');
  }
}

// --strict: a C finding is exit 1, as it always was. Unread templates with no C finding are exit 2, so a
// gate cannot take them for a pass and a caller can still tell the two apart.
const exitCode = !strict ? 0 : summary.C > 0 ? 1 : coverage.status === 'incomplete' ? 2 : 0;
if (exitCode === 2) console.error(`slop_scan --strict: no C finding, but coverage is incomplete: ${unread}. Exit 2.`);
process.exit(exitCode);
