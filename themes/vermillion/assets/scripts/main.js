(function () {
  'use strict';

  /* =====================================================
     1. THEME — paper / ink mode toggle
     ===================================================== */
  function initThemeMode() {
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('vermillion-theme'); } catch (e) {}

    var defaultMode = (root.getAttribute('data-default-mode') || 'auto');
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    function applyMode(mode) {
      if (mode === 'dark') root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
    }

    var initial;
    if (saved === 'dark' || saved === 'light') {
      initial = saved;
    } else if (defaultMode === 'dark') {
      initial = 'dark';
    } else if (defaultMode === 'light') {
      initial = 'light';
    } else {
      initial = systemDark ? 'dark' : 'light';
    }
    applyMode(initial);

    var toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        applyMode(next);
        try { localStorage.setItem('vermillion-theme', next); } catch (e) {}
        btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
      });
      btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
    });
  }

  /* =====================================================
     2. MOBILE RAIL DRAWER
     ===================================================== */
  function initRailToggle() {
    var toggle = document.querySelector('.rail-toggle');
    var rail = document.querySelector('.rail');
    var backdrop = document.querySelector('.rail-backdrop');
    if (!toggle || !rail) return;

    function open() {
      rail.classList.add('is-open');
      toggle.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      rail.classList.remove('is-open');
      toggle.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function () {
      if (rail.classList.contains('is-open')) close(); else open();
    });
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && rail.classList.contains('is-open')) close();
    });
  }

  /* =====================================================
     3. SEARCH OVERLAY (/api/search.json)
     ===================================================== */
  var searchIndex = null;
  var searchIndexPromise = null;
  function loadSearchIndex() {
    if (searchIndexPromise) return searchIndexPromise;
    searchIndexPromise = fetch('/api/search.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { searchIndex = data || []; return searchIndex; })
      .catch(function () { searchIndex = []; return searchIndex; });
    return searchIndexPromise;
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    var safe = escapeHtml(text);
    var safeQ = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return safe.replace(new RegExp('(' + safeQ + ')', 'ig'), '<mark>$1</mark>');
  }
  function snippetFor(content, q) {
    if (!content) return '';
    var text = String(content);
    if (!q) return text.slice(0, 120) + (text.length > 120 ? '…' : '');
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text.slice(0, 120) + '…';
    var start = Math.max(0, idx - 40);
    var end = Math.min(text.length, idx + q.length + 80);
    var snip = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    return highlight(snip, q);
  }
  function initSearch() {
    var overlay = document.querySelector('.search-overlay');
    var input = document.querySelector('.search-input');
    var results = document.querySelector('.search-results');
    var meta = document.querySelector('.search-meta-count');
    if (!overlay || !input || !results) return;

    function open() {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      loadSearchIndex().then(function () {
        setTimeout(function () { input.focus(); }, 60);
      });
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      input.value = '';
      results.innerHTML = '';
      if (meta) meta.textContent = '';
    }

    function render(q) {
      if (!searchIndex) { results.innerHTML = '<div class="search-empty">索引加载中…</div>'; return; }
      var trimmed = (q || '').trim();
      if (!trimmed) {
        results.innerHTML = '';
        if (meta) meta.textContent = searchIndex.length + ' 篇待索';
        return;
      }
      var lower = trimmed.toLowerCase();
      var hits = searchIndex.filter(function (e) {
        return (e.title && e.title.toLowerCase().indexOf(lower) >= 0)
          || (e.content && e.content.toLowerCase().indexOf(lower) >= 0)
          || (e.tags && String(e.tags).toLowerCase().indexOf(lower) >= 0);
      }).slice(0, 30);
      if (meta) meta.textContent = hits.length + ' / ' + searchIndex.length;
      if (!hits.length) {
        results.innerHTML = '<div class="search-empty">无匹配 — 试试别的字眼。</div>';
        return;
      }
      results.innerHTML = hits.map(function (h) {
        var tags = h.tags ? String(h.tags) : '';
        return '<a class="search-result" href="' + escapeHtml(h.link || '#') + '">'
          + '<div class="search-result-title">' + highlight(h.title || '无题', trimmed) + '</div>'
          + '<div class="search-result-meta">' + escapeHtml(h.date || '') + (tags ? ' · ' + escapeHtml(tags) : '') + '</div>'
          + '<div class="search-result-snippet">' + snippetFor(h.content || '', trimmed) + '</div>'
          + '</a>';
      }).join('');
    }

    document.querySelectorAll('[data-search-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('is-open')) close(); else open();
      }
    });
    var debounce;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      var v = input.value;
      debounce = setTimeout(function () { render(v); }, 120);
    });
  }

  /* =====================================================
     4. POST TOC — auto-generate + scroll-spy
     ===================================================== */
  function initTOC() {
    var content = document.querySelector('.post-content[data-toc]');
    var hostEl = document.querySelector('.post-toc');
    if (!content || !hostEl) return;
    var heads = content.querySelectorAll('h2, h3');
    if (!heads.length) { hostEl.style.display = 'none'; return; }
    var items = [];
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'h-' + i + '-' + (h.textContent || '').trim().replace(/\s+/g, '-').replace(/[^\w\-一-龥]/g, '').slice(0, 60);
      items.push({ id: h.id, text: h.textContent || '', level: h.tagName === 'H2' ? 2 : 3 });
    });
    var listEl = document.createElement('ul');
    items.forEach(function (it) {
      var li = document.createElement('li');
      if (it.level === 3) li.style.paddingLeft = '14px';
      var a = document.createElement('a');
      a.href = '#' + it.id;
      a.textContent = it.text;
      a.setAttribute('data-toc-link', it.id);
      li.appendChild(a);
      listEl.appendChild(li);
    });
    var listHost = hostEl.querySelector('.post-toc-list');
    if (listHost) listHost.appendChild(listEl);

    var links = hostEl.querySelectorAll('[data-toc-link]');
    var headEls = items.map(function (it) { return document.getElementById(it.id); });
    function spy() {
      var top = window.scrollY + 120;
      var active = -1;
      for (var i = 0; i < headEls.length; i++) {
        if (headEls[i] && headEls[i].offsetTop <= top) active = i; else break;
      }
      links.forEach(function (l, i) {
        if (i === active) l.classList.add('is-active'); else l.classList.remove('is-active');
      });
    }
    spy();
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { spy(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  /* =====================================================
     5. MEMOS HEATMAP
     ===================================================== */
  function initHeatmap() {
    var host = document.querySelector('[data-heatmap]');
    if (!host) return;
    var raw = host.getAttribute('data-dates') || '';
    var dates = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var counts = {};
    dates.forEach(function (d) { counts[d] = (counts[d] || 0) + 1; });

    var weeks = 52;
    var today = new Date();
    var dow = today.getDay();
    var endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - dow));
    var totalDays = weeks * 7;

    var grid = host.querySelector('.memo-heatmap-grid');
    if (!grid) return;
    var total = 0;
    var max = 0;
    Object.keys(counts).forEach(function (k) { if (counts[k] > max) max = counts[k]; total += counts[k]; });
    var levelFor = function (n) {
      if (!n) return 0;
      if (max <= 1) return n ? 4 : 0;
      var ratio = n / max;
      if (ratio < 0.25) return 1;
      if (ratio < 0.5) return 2;
      if (ratio < 0.75) return 3;
      return 4;
    };

    for (var i = totalDays - 1; i >= 0; i--) {
      var d = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() - i);
      var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var cell = document.createElement('div');
      cell.className = 'memo-heatmap-cell';
      var n = counts[iso] || 0;
      var lv = levelFor(n);
      if (lv) cell.setAttribute('data-level', String(lv));
      cell.title = iso + (n ? ' · ' + n + ' 条' : '');
      grid.appendChild(cell);
    }
    var totalEl = document.querySelector('[data-heatmap-total]');
    if (totalEl) totalEl.textContent = String(total);
    var activeDays = Object.keys(counts).length;
    var activeEl = document.querySelector('[data-heatmap-active]');
    if (activeEl) activeEl.textContent = String(activeDays);
  }

  /* =====================================================
     6. CARD HOVER LIFT (only on devices that hover)
     ===================================================== */
  function initCardLift() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('.card').forEach(function (c) { c.style.cursor = 'default'; });
    }
  }

  /* =====================================================
     7. COMPOSER — preset spark insert
     ===================================================== */
  function initComposer() {
    var input = document.querySelector('.composer-input');
    var sparks = document.querySelectorAll('.composer .spark');
    if (!input || !sparks.length) return;
    sparks.forEach(function (s) {
      s.addEventListener('click', function () {
        var raw = (s.textContent || '').trim();
        input.value = raw;
        input.focus();
      });
    });
    var send = document.querySelector('.composer .send');
    if (send) {
      send.addEventListener('click', function () {
        var v = (input.value || '').trim();
        if (!v) { input.focus(); return; }
        send.style.background = 'var(--vermillion-deep)';
        send.textContent = '已寄出 ✓';
        setTimeout(function () {
          send.textContent = '寄出 →';
          send.style.background = '';
          input.value = '';
        }, 1500);
      });
    }
  }

  /* =====================================================
     8a. READING PROGRESS BAR
     ===================================================== */
  function initReadingProgress() {
    var host = document.querySelector('[data-reading-progress]');
    var bar = host ? host.querySelector('.reading-progress-bar') : null;
    var article = document.querySelector('.post-content');
    if (!host || !bar || !article) return;
    function update() {
      var rect = article.getBoundingClientRect();
      var top = window.scrollY + rect.top;
      var height = article.offsetHeight;
      var winH = window.innerHeight;
      var scrolled = window.scrollY + winH - top;
      var pct = Math.max(0, Math.min(100, (scrolled / (height + winH * 0.2)) * 100));
      bar.style.width = pct.toFixed(2) + '%';
    }
    update();
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { update(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update);
  }

  /* =====================================================
     8b. BACK TO TOP
     ===================================================== */
  function initBackToTop() {
    var btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    function check() {
      if (window.scrollY > 320) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =====================================================
     8c. CODE COPY BUTTONS
     ===================================================== */
  function initCodeCopy() {
    var host = document.querySelector('[data-code-copy]');
    if (!host) return;
    var pres = host.querySelectorAll('pre');
    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
    pres.forEach(function (pre) {
      if (pre.querySelector('.code-copy-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var code = pre.querySelector('code') || pre;
        var text = code.innerText || code.textContent || '';
        var done = function () {
          btn.textContent = 'Copied ✓';
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('is-copied');
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {
            fallbackCopy(text); done();
          });
        } else {
          fallbackCopy(text); done();
        }
      });
      pre.appendChild(btn);
    });
  }

  /* =====================================================
     9. NAV ACTIVE HIGHLIGHT
     ===================================================== */
  function initNavActive() {
    var path = window.location.pathname.replace(/\/+$/, '/') || '/';
    var links = document.querySelectorAll('[data-nav-link]');
    var best = null;
    var bestLen = -1;
    links.forEach(function (l) {
      var target = l.getAttribute('data-nav-link') || '';
      if (target === '/' && path === '/') {
        if (1 > bestLen) { best = l; bestLen = 1; }
        return;
      }
      if (target !== '/' && path.indexOf(target) === 0) {
        if (target.length > bestLen) { best = l; bestLen = target.length; }
      }
    });
    if (best) best.classList.add('active');
  }

  /* =====================================================
     BOOT
     ===================================================== */
  function boot() {
    initThemeMode();
    initRailToggle();
    initSearch();
    initTOC();
    initReadingProgress();
    initBackToTop();
    initCodeCopy();
    initHeatmap();
    initCardLift();
    initComposer();
    initNavActive();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
