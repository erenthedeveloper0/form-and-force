#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Read-only inventory of a frontend repository before any design or code change:
// framework, package manager, styling, component and motion libraries, routes,
// tokens, fonts, assets, scripts, test tooling, git state.
// Never reads .env* or credential files (lists their presence only).
//
// Usage: node inspect_repo.mjs [dir] [--json]

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const root = path.resolve(argv.find((a) => !a.startsWith('--')) || '.');
const asJson = argv.includes('--json');
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => { try { return fs.readFileSync(path.join(root, p), 'utf8'); } catch { return null; } };
const SECRET = /^\.env(\..*)?$|\.pem$|\.key$|credentials|secrets?\.(json|ya?ml)$/i;
const TEMPLATE = /\.(example|sample|template|dist)$/i;
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', '.turbo', '.vercel', '.svelte-kit', '.nuxt', '.output', 'coverage', '.cache', '.astro']);

function walk(dir, depth, acc) {
  if (depth < 0) return acc;
  let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, depth - 1, acc); else acc.push(path.relative(root, p));
  }
  return acc;
}
const files = walk(root, 6, []);
const has = (re) => files.some((f) => re.test(f));
const count = (re) => files.filter((f) => re.test(f)).length;

const pkgText = read('package.json');
let pkg = {};
try { pkg = pkgText ? JSON.parse(pkgText) : {}; } catch { pkg = { _parseError: true }; }
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}), ...(pkg.peerDependencies || {}) };
const dep = (n) => deps[n];
const anyDep = (...names) => names.filter((n) => deps[n]).map((n) => `${n}@${deps[n]}`);

const report = { root };
report.packageManager = exists('pnpm-lock.yaml') ? 'pnpm' : exists('yarn.lock') ? 'yarn' : exists('bun.lockb') || exists('bun.lock') ? 'bun' : exists('package-lock.json') ? 'npm' : pkgText ? 'npm (no lockfile)' : 'none';
report.monorepo = [pkg.workspaces && 'workspaces', exists('pnpm-workspace.yaml') && 'pnpm-workspace', exists('turbo.json') && 'turbo', exists('nx.json') && 'nx', exists('lerna.json') && 'lerna'].filter(Boolean);
report.node = read('.nvmrc')?.trim() || read('.node-version')?.trim() || pkg.engines?.node || null;

report.framework = [
  dep('next') && `next@${dep('next')} (${exists('app') || exists('src/app') ? 'app router' : ''}${(exists('pages') || exists('src/pages')) ? ' pages router' : ''})`,
  dep('@remix-run/react') && 'remix', dep('react-router') && `react-router@${dep('react-router')}`, dep('react-router-dom') && `react-router-dom@${dep('react-router-dom')}`,
  dep('astro') && `astro@${dep('astro')}`, dep('nuxt') && `nuxt@${dep('nuxt')}`, dep('vue') && !dep('nuxt') && `vue@${dep('vue')}`,
  dep('@sveltejs/kit') && 'sveltekit', dep('svelte') && !dep('@sveltejs/kit') && 'svelte', dep('gatsby') && 'gatsby', dep('@angular/core') && 'angular',
  dep('solid-js') && 'solid', dep('vite') && `vite@${dep('vite')}`, dep('react') && `react@${dep('react')}`,
  !pkgText && has(/\.html$/) && 'static HTML',
].filter(Boolean);
report.typescript = !!(dep('typescript') || exists('tsconfig.json'));

const twCfg = files.find((f) => /^tailwind\.config\.(js|ts|cjs|mjs)$/.test(path.basename(f)));
const cssFiles = files.filter((f) => /\.(css|scss|sass|less|pcss)$/.test(f));
const cssText = cssFiles.slice(0, 60).map((f) => read(f) || '').join('\n');
report.styling = [
  dep('tailwindcss') && `tailwind@${dep('tailwindcss')}${twCfg ? ' (config: ' + twCfg + ')' : /@import\s+["']tailwindcss["']/.test(cssText) ? ' (v4 CSS-first)' : ''}`,
  dep('styled-components') && 'styled-components', dep('@emotion/react') && 'emotion', dep('@vanilla-extract/css') && 'vanilla-extract',
  dep('sass') && 'sass', has(/\.module\.(css|scss)$/) && 'css-modules', dep('@pandacss/dev') && 'panda', dep('unocss') && 'unocss',
].filter(Boolean);
report.componentLibraries = [
  ...(exists('components.json') ? ['shadcn/ui (components.json)'] : []),
  ...anyDep('@radix-ui/react-dialog', '@base-ui-components/react', '@headlessui/react', '@mui/material', '@chakra-ui/react', '@mantine/core', 'react-aria-components', '@ark-ui/react', 'daisyui', 'antd'),
];
report.motion = anyDep('gsap', '@gsap/react', 'framer-motion', 'motion', 'lenis', '@studio-freight/lenis', 'locomotive-scroll', 'animejs', '@react-spring/web', 'three', '@react-three/fiber', '@react-three/drei', 'ogl', 'pixi.js', 'lottie-web', '@lottiefiles/dotlottie-react', '@rive-app/react-canvas', '@theatre/core', 'swiper', 'embla-carousel-react', 'barba', '@barba/core', 'split-type');
report.dataViz = anyDep('d3', 'recharts', 'visx', '@visx/visx', 'chart.js', 'echarts', '@nivo/core', 'victory', 'plotly.js', '@observablehq/plot');
report.state = anyDep('zustand', 'jotai', 'redux', '@reduxjs/toolkit', '@tanstack/react-query', 'swr', 'xstate', 'valtio');
report.forms = anyDep('react-hook-form', 'formik', 'zod', 'valibot', 'yup', '@conform-to/react');
report.testing = anyDep('vitest', 'jest', '@playwright/test', 'playwright', 'cypress', '@testing-library/react', '@axe-core/playwright', 'axe-core', 'jest-axe', 'storybook', '@storybook/react', 'lighthouse', '@lhci/cli');
report.lint = anyDep('eslint', 'eslint-plugin-jsx-a11y', 'prettier', '@biomejs/biome', 'oxlint', 'stylelint');
report.scripts = pkg.scripts || {};

report.routes = files.filter((f) => /(^|\/)(app|src\/app)\/.*\/?page\.(t|j)sx?$|(^|\/)(pages|src\/pages)\/.*\.(t|j)sx?$|(^|\/)src\/routes\/.*\+page\.svelte$|(^|\/)(src\/)?pages\/.*\.(astro|vue|md|mdx)$/.test(f) && !/\/api\//.test(f) && !/_app|_document/.test(f)).slice(0, 40);
report.componentDirs = [...new Set(files.filter((f) => /components?\//.test(f)).map((f) => f.split('/').slice(0, f.split('/').indexOf(f.split('/').find((s) => /components?$/.test(s))) + 1).join('/')))].slice(0, 8);
report.componentCount = count(/components?\/.*\.(t|j)sx|\.vue$|\.svelte$|\.astro$/);

const customProps = (cssText.match(/--[a-z0-9-]+\s*:/gi) || []).length;
report.tokens = {
  cssCustomProperties: customProps,
  tokenFiles: files.filter((f) => /tokens?\.(json|ts|js|css|scss)$|theme\.(ts|js|css)$|design-tokens/i.test(f)).slice(0, 10),
  reducedMotionRefs: (cssText.match(/prefers-reduced-motion/g) || []).length,
  darkMode: /prefers-color-scheme|\.dark\b|data-theme/.test(cssText),
};
const fontHints = [];
for (const f of files.filter((x) => /layout\.(t|j)sx?$|_app\.(t|j)sx?$|_document|index\.html$|app\.html$|nuxt\.config|astro\.config|\.css$/.test(x)).slice(0, 40)) {
  const t = read(f) || '';
  for (const m of t.matchAll(/next\/font\/(?:google|local)['"][^;]*|import\s*\{\s*([A-Z][A-Za-z_]+)[^}]*\}\s*from\s*['"]next\/font\/google['"]|fonts\.googleapis\.com\/css2?\?family=([^&"']+)|@font-face\s*\{[^}]*font-family\s*:\s*['"]?([^;'"]+)/g)) {
    const name = (m[1] || m[2] || m[3] || '').replace(/\+/g, ' ').trim();
    if (name) fontHints.push(`${name} (${f})`);
  }
}
report.fonts = [...new Set(fontHints)].slice(0, 12);
report.assets = {
  images: count(/\.(png|jpe?g|webp|avif|gif|svg)$/i), video: count(/\.(mp4|webm|mov)$/i), models3d: count(/\.(glb|gltf|fbx|obj|usdz)$/i),
  fontsFiles: count(/\.(woff2?|ttf|otf)$/i), lottie: count(/\.lottie$|lottie.*\.json$/i), audio: count(/\.(mp3|wav|ogg)$/i),
};
report.config = ['next.config.js', 'next.config.mjs', 'next.config.ts', 'vite.config.ts', 'vite.config.js', 'astro.config.mjs', 'nuxt.config.ts', 'svelte.config.js', 'vercel.json', 'netlify.toml', 'Dockerfile', '.github/workflows', 'playwright.config.ts', 'vitest.config.ts', 'jest.config.js', '.storybook', 'CLAUDE.md', 'AGENTS.md', 'DESIGN.md', 'README.md'].filter(exists);
report.secretsPresent = fs.readdirSync(root).filter((f) => SECRET.test(f) && !TEMPLATE.test(f)); // names only, contents never read
report.envTemplates = fs.readdirSync(root).filter((f) => SECRET.test(f) && TEMPLATE.test(f));

try {
  const inside = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() === 'true';
  if (inside) {
    const st = execFileSync('git', ['status', '--porcelain'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n').filter(Boolean);
    const br = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    report.git = { branch: br, uncommitted: st.length, sample: st.slice(0, 12) };
  }
} catch { report.git = null; }

// Signals that steer the workflow
const notes = [];
if (!pkgText) notes.push('No package.json: static or non-JS project. Do not introduce a build step without a reason.');
if (report.git?.uncommitted) notes.push(`${report.git.uncommitted} uncommitted change(s): preserve them; do not overwrite or reformat those files without asking.`);
if (report.motion.length > 2) notes.push('Several motion libraries present: define which one owns which elements before adding animation.');
if ((dep('framer-motion') || dep('motion')) && dep('gsap')) notes.push('Both Motion and GSAP installed: pick an owner per component; never animate the same property from both.');
if (report.motion.length && !report.tokens.reducedMotionRefs) notes.push('Motion libraries but no prefers-reduced-motion in CSS: check JS hooks (useReducedMotion, gsap.matchMedia) before assuming none.');
if (exists('components.json')) notes.push('shadcn/ui present: restyle through tokens and variants; do not fork every primitive.');
if (!report.testing.length) notes.push('No test tooling detected: verification will rely on build/typecheck plus audit_page.mjs; say so in the report.');
if (report.secretsPresent.length) notes.push(`Secret-bearing files present (${report.secretsPresent.join(', ')}): never print or copy their contents.`);
for (const s of ['build', 'lint', 'typecheck', 'test']) if (!report.scripts[s] && !(s === 'typecheck' && report.scripts['type-check'])) notes.push(`No "${s}" script.`);
report.notes = notes;

if (asJson) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }
const line = (k, v) => console.log(`${k.padEnd(18)} ${Array.isArray(v) ? (v.length ? v.join(', ') : '—') : v ?? '—'}`);
console.log(`inspect_repo: ${root}\n`);
line('package manager', report.packageManager + (report.monorepo.length ? ` [${report.monorepo.join(', ')}]` : ''));
line('node', report.node);
line('framework', report.framework);
line('typescript', String(report.typescript));
line('styling', report.styling);
line('component libs', report.componentLibraries);
line('motion / 3D', report.motion);
line('data viz', report.dataViz);
line('state / data', report.state);
line('forms', report.forms);
line('testing', report.testing);
line('lint / format', report.lint);
const KEY_SCRIPTS = /^(dev|build|start|preview|lint|typecheck|type-check|tsc|test|test:e2e|e2e|format|check|storybook|analyze|lighthouse)$/;
line('scripts', Object.entries(report.scripts).filter(([k]) => KEY_SCRIPTS.test(k)).map(([k, v]) => `${k}: ${String(v).slice(0, 48)}`));
const otherScripts = Object.keys(report.scripts).filter((k) => !KEY_SCRIPTS.test(k));
if (otherScripts.length) line('other scripts', otherScripts.slice(0, 25).join(' ') + (otherScripts.length > 25 ? ' …' : ''));
line('routes', report.routes.length ? `${report.routes.length} → ${report.routes.slice(0, 10).join(', ')}` : '—');
line('components', `${report.componentCount} files in ${report.componentDirs.join(', ') || '—'}`);
line('tokens', `${report.tokens.cssCustomProperties} CSS custom props; files: ${report.tokens.tokenFiles.join(', ') || '—'}; reduced-motion refs: ${report.tokens.reducedMotionRefs}; dark mode: ${report.tokens.darkMode}`);
line('fonts', report.fonts);
line('assets', Object.entries(report.assets).map(([k, v]) => `${k} ${v}`));
line('config', report.config);
if (report.envTemplates.length) line('env templates', report.envTemplates.join(', ') + ' (safe to read for variable names)');
line('git', report.git ? `${report.git.branch}, ${report.git.uncommitted} uncommitted` : 'not a git repo');
if (notes.length) { console.log('\nnotes:'); for (const n of notes) console.log('  - ' + n); }
