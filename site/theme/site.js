// SPDX-License-Identifier: MIT
// The documentation site's behaviour: theme switching, the mobile menu, copy
// buttons, the table of contents' current section, and search. No dependencies;
// every feature degrades to a working static page without JavaScript.
(() => {
  const root = document.body.dataset.root || './';
  const doc = document.documentElement;

  // ------------------------------------------------------------ theme: system → light → dark
  const themeButton = document.querySelector('.theme-button');
  const store = { get() { try { return localStorage.getItem('ff-theme'); } catch { return null; } },
    set(v) { try { v ? localStorage.setItem('ff-theme', v) : localStorage.removeItem('ff-theme'); } catch { /* private mode */ } } };
  const labelTheme = () => {
    const t = doc.dataset.theme;
    themeButton?.setAttribute('aria-label', `Colour theme: ${t ? t : 'follows the system'}`);
  };
  themeButton?.addEventListener('click', () => {
    const next = { undefined: 'light', light: 'dark', dark: undefined }[doc.dataset.theme];
    if (next) doc.dataset.theme = next; else delete doc.dataset.theme;
    store.set(next);
    labelTheme();
  });
  labelTheme();

  // ------------------------------------------------------------ mobile menu
  const menu = document.querySelector('.menu-button');
  const sidebar = document.getElementById('sidebar');
  const setMenu = (open) => {
    sidebar.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    if (open) sidebar.querySelector('[aria-current="page"], a')?.focus();
  };
  menu?.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sidebar.classList.contains('open')) { setMenu(false); menu.focus(); } });
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menu.contains(e.target)) setMenu(false);
  });
  sidebar?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'center' });

  // ------------------------------------------------------------ copy buttons
  for (const pre of document.querySelectorAll('.prose pre')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy';
    button.textContent = 'Copy';
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code').cloneNode(true);
      code.querySelectorAll('.p').forEach((n) => n.remove());
      try { await navigator.clipboard.writeText(code.textContent); button.textContent = 'Copied'; } catch { button.textContent = 'Select and copy'; }
      setTimeout(() => { button.textContent = 'Copy'; }, 1600);
    });
    pre.append(button);
  }

  // ------------------------------------------------------------ table of contents: the section in view
  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
      const first = [...byId.keys()].find((id) => visible.has(id));
      if (first) tocLinks.forEach((a) => a.classList.toggle('active', a === byId.get(first)));
    }, { rootMargin: '-60px 0px -65% 0px' });
    byId.forEach((_, id) => { const h = document.getElementById(id); if (h) observer.observe(h); });
  }

  // ------------------------------------------------------------ search
  const dialog = document.querySelector('dialog.search');
  const input = dialog?.querySelector('input');
  const list = dialog?.querySelector('.search-results');
  const status = dialog?.querySelector('.search-status');
  let index = null;
  let selected = 0;

  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mark = (text, terms) => {
    let out = escapeHtml(text);
    for (const t of terms) out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
    return out;
  };
  const snippet = (text, terms) => {
    const lower = text.toLowerCase();
    const at = Math.max(0, Math.min(...terms.map((t) => { const i = lower.indexOf(t); return i < 0 ? Infinity : i; })) - 60);
    const cut = Number.isFinite(at) ? at : 0;
    return (cut > 0 ? '…' : '') + text.slice(cut, cut + 180) + (text.length > cut + 180 ? '…' : '');
  };

  async function load() {
    if (index) return index;
    status.textContent = 'Loading the index…';
    const res = await fetch(`${root}assets/search-index.json`);
    index = await res.json();
    return index;
  }

  function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) { list.innerHTML = ''; status.textContent = 'Type at least two letters.'; return; }
    const scored = [];
    for (const r of index) {
      const h = r.s.toLowerCase(); const p = r.p.toLowerCase(); const t = r.t.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const inHead = h.includes(term); const inPage = p.includes(term); const inText = t.includes(term);
        if (!inHead && !inPage && !inText) { score = 0; break; }
        score += (inHead ? (h.startsWith(term) ? 14 : 9) : 0) + (inPage ? 4 : 0) + (inText ? 1 + Math.min(3, t.split(term).length - 1) * 0.3 : 0);
      }
      if (score) scored.push([score + (r.s === r.p ? 2 : 0), r]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    const top = scored.slice(0, 30);
    selected = 0;
    status.textContent = top.length ? `${scored.length} result${scored.length === 1 ? '' : 's'}` : `Nothing found for “${q}”.`;
    list.innerHTML = top.map(([, r], i) => `<li><a href="${escapeHtml(root + r.u)}" aria-selected="${i === 0}"><span class="where">${escapeHtml(r.p)}</span><span class="what">${mark(r.s, terms)}</span>${r.t ? `<span class="text">${mark(snippet(r.t, terms), terms)}</span>` : ''}</a></li>`).join('');
  }

  const move = (d) => {
    const links = [...list.querySelectorAll('a')];
    if (!links.length) return;
    links[selected]?.setAttribute('aria-selected', 'false');
    selected = (selected + d + links.length) % links.length;
    links[selected].setAttribute('aria-selected', 'true');
    links[selected].scrollIntoView({ block: 'nearest' });
  };

  async function open() {
    dialog.showModal();
    input.select();
    try { await load(); search(input.value); } catch { status.textContent = 'The search index could not be loaded. Serve the site over http (python3 site/build.py --serve).'; }
  }
  document.querySelector('.search-button')?.addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (!dialog.open && ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)))) { e.preventDefault(); open(); }
  });
  input?.addEventListener('input', () => index && search(input.value));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const link = list.querySelectorAll('a')[selected];
      if (link) window.location.href = link.href;
    }
  });
  dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
})();
