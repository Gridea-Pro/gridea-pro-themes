/* =====================================================================
 * Writecho — 听见笔尖回声
 * Theme JS: dark mode / search / progress / back-to-top / TOC / heatmap / code-copy
 * ===================================================================== */
(function () {
  'use strict';

  /* ---------- 0. 读取主题配置（base.html 注入到 data 属性） ---------- */
  var rootEl = document.documentElement;
  var dataEl = document.getElementById('writecho-config');
  var cfg = {
    themeMode: 'auto',
    showReadingProgress: true,
    showBackToTop: true,
    showCodeCopy: true,
    showToc: true,
    showSearch: true,
    memosShowHeatmap: true
  };
  if (dataEl) {
    try {
      Object.assign(cfg, JSON.parse(dataEl.textContent || '{}'));
    } catch (e) { /* keep defaults */ }
  }

  /* ---------- 1. 主题模式：auto / light / dark / user ---------- */
  var STORAGE_KEY = 'writecho-theme';
  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStoredTheme(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) { /* ignore */ }
  }
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function applyTheme(mode) {
    if (mode === 'dark') {
      rootEl.setAttribute('data-theme', 'dark');
    } else {
      rootEl.removeAttribute('data-theme');
    }
  }
  function resolveAndApply() {
    var stored = getStoredTheme();
    var defaultMode = cfg.themeMode || 'auto';
    var mode;
    if (stored === 'dark' || stored === 'light') {
      mode = stored;
    } else if (defaultMode === 'dark') {
      mode = 'dark';
    } else if (defaultMode === 'light') {
      mode = 'light';
    } else {
      // auto / user
      mode = systemPrefersDark() ? 'dark' : 'light';
    }
    applyTheme(mode);
    return mode;
  }
  resolveAndApply();
  // 跟随系统切换（仅当用户没主动选过时生效）
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var handler = function () {
      if (!getStoredTheme()) resolveAndApply();
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
  // 顶栏按钮
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action="toggle-theme"]');
    if (!btn) return;
    e.preventDefault();
    var current = rootEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredTheme(next);
  });

  /* ---------- 2. 阅读进度条（仅文章页 + ≥1.5 屏才显示） ---------- */
  function initReadingProgress() {
    if (!cfg.showReadingProgress) return;
    var bar = document.getElementById('reading-progress');
    if (!bar) return;
    var article = document.querySelector('.post-content');
    if (!article) return;
    function update() {
      var rect = article.getBoundingClientRect();
      var total = article.offsetHeight - window.innerHeight;
      if (total <= 0) { bar.style.width = '0'; return; }
      var scrolled = -rect.top;
      var percent = Math.max(0, Math.min(100, (scrolled / total) * 100));
      bar.style.width = percent + '%';
    }
    if (article.offsetHeight < window.innerHeight * 1.5) return;
    bar.style.display = 'block';
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- 3. 回顶按钮 ---------- */
  function initBackToTop() {
    if (!cfg.showBackToTop) return;
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    function check() {
      if (window.pageYOffset > 300) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    }
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ---------- 4. 代码复制 ---------- */
  function initCodeCopy() {
    if (!cfg.showCodeCopy) return;
    var pres = document.querySelectorAll('.post-content pre');
    pres.forEach(function (pre) {
      if (pre.querySelector('.code-copy')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        var text = code.innerText || code.textContent || '';
        var done = function () {
          btn.classList.add('is-copied');
          btn.textContent = '已复制';
          setTimeout(function () {
            btn.classList.remove('is-copied');
            btn.textContent = '复制';
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            // 降级
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed'; ta.style.left = '-9999px';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); done(); } catch (e) {}
            document.body.removeChild(ta);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
      pre.appendChild(btn);
    });
  }

  /* ---------- 5. TOC 折叠 + 滚动激活 ---------- */
  function initToc() {
    if (!cfg.showToc) return;
    var toc = document.querySelector('.post-toc');
    if (!toc) return;
    var titleEl = toc.querySelector('.post-toc-title');
    if (titleEl) {
      titleEl.addEventListener('click', function () {
        toc.classList.toggle('is-collapsed');
      });
    }
    // active 高亮
    var article = document.querySelector('.post-content');
    var links = toc.querySelectorAll('a[href^="#"]');
    if (!article || !links.length) return;
    var headings = Array.from(links).map(function (a) {
      var id = decodeURIComponent(a.getAttribute('href').slice(1));
      var h = id ? document.getElementById(id) : null;
      return { a: a, h: h };
    }).filter(function (x) { return x.h; });
    if (!headings.length) return;
    function onScroll() {
      var pos = window.scrollY + 100;
      var active = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].h.offsetTop <= pos) active = headings[i];
        else break;
      }
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (active) active.a.classList.add('is-active');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 6. Memos 闪念热力图 ---------- */
  function initHeatmap() {
    if (!cfg.memosShowHeatmap) return;
    var grid = document.getElementById('heatmap-grid');
    if (!grid) return;
    var memos = document.querySelectorAll('.memo[data-date]');
    var counts = {};
    memos.forEach(function (m) {
      var d = m.getAttribute('data-date');
      if (!d) return;
      counts[d] = (counts[d] || 0) + 1;
    });
    // 53 周 × 7 天，从今天往前推
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // grid-auto-flow: column；逐列填，每列 7 天（周日→周六），从最早一周开始
    var totalDays = 53 * 7;
    // 找到 (今天 - 53 周) 那个周日
    var endSunday = new Date(today);
    endSunday.setDate(today.getDate() - today.getDay() + 6); // 本周六
    var startSunday = new Date(endSunday);
    startSunday.setDate(endSunday.getDate() - totalDays + 1);
    var fragments = document.createDocumentFragment();
    var cur = new Date(startSunday);
    for (var i = 0; i < totalDays; i++) {
      var iso = cur.toISOString().slice(0, 10);
      var n = counts[iso] || 0;
      var level = n === 0 ? 0 : (n === 1 ? 1 : (n === 2 ? 2 : (n <= 4 ? 3 : 4)));
      var cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      if (level > 0) cell.setAttribute('data-level', String(level));
      cell.title = iso + (n > 0 ? '·' + n + ' 条' : '');
      fragments.appendChild(cell);
      cur.setDate(cur.getDate() + 1);
    }
    grid.innerHTML = '';
    grid.appendChild(fragments);
  }

  /* ---------- 7. 全屏搜索 ---------- */
  function initSearch() {
    if (!cfg.showSearch) return;
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    var input = modal.querySelector('.search-modal-input');
    var resultsEl = modal.querySelector('.search-modal-results');
    var emptyEl = modal.querySelector('.search-modal-empty');
    var index = null;
    var loading = false;
    var activeIndex = -1;

    function open() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { input && input.focus(); }, 30);
      ensureIndex();
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      input.value = '';
      activeIndex = -1;
      render([]);
    }

    function ensureIndex() {
      if (index || loading) return;
      loading = true;
      fetch('/api/search.json', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (data) {
          index = Array.isArray(data) ? data : [];
          loading = false;
          if (input.value) doSearch(input.value);
        })
        .catch(function () { index = []; loading = false; });
    }

    function escape(html) {
      return String(html || '').replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function highlight(text, q) {
      if (!q) return escape(text);
      var safe = escape(text);
      var safeQ = escape(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        return safe.replace(new RegExp(safeQ, 'gi'), '<mark>$&</mark>');
      } catch (e) { return safe; }
    }
    function snippet(content, q) {
      var c = String(content || '').replace(/\s+/g, ' ').trim();
      if (!c) return '';
      var i = q ? c.toLowerCase().indexOf(q.toLowerCase()) : -1;
      if (i < 0) return c.slice(0, 120);
      var start = Math.max(0, i - 40);
      var end = Math.min(c.length, i + q.length + 80);
      return (start > 0 ? '…' : '') + c.slice(start, end) + (end < c.length ? '…' : '');
    }
    function score(entry, q) {
      var ql = q.toLowerCase();
      var s = 0;
      if (entry.title && entry.title.toLowerCase().indexOf(ql) >= 0) s += 5;
      if (entry.tags && entry.tags.some(function (t) { return String(t).toLowerCase().indexOf(ql) >= 0; })) s += 3;
      if (entry.content && entry.content.toLowerCase().indexOf(ql) >= 0) s += 1;
      return s;
    }
    function doSearch(q) {
      activeIndex = -1;
      if (!q || !q.trim()) return render([]);
      if (!index) return render([], '索引加载中…');
      var ql = q.trim();
      var hits = index.map(function (e) { return { entry: e, s: score(e, ql) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 30)
        .map(function (x) { return x.entry; });
      render(hits, hits.length ? '' : '没有找到「' + escape(ql) + '」相关内容', ql);
    }
    function render(hits, emptyMsg, q) {
      resultsEl.innerHTML = '';
      if (!hits.length) {
        emptyEl.textContent = emptyMsg || '';
        emptyEl.style.display = emptyMsg ? 'block' : 'none';
        return;
      }
      emptyEl.style.display = 'none';
      hits.forEach(function (h, i) {
        var a = document.createElement('a');
        a.className = 'search-result';
        a.href = h.link || '#';
        a.setAttribute('data-index', String(i));
        a.innerHTML =
          '<h3 class="search-result-title">' + highlight(h.title || '(无标题)', q) + '</h3>' +
          '<p class="search-result-snippet">' + highlight(snippet(h.content, q), q) + '</p>';
        resultsEl.appendChild(a);
      });
    }
    function moveActive(delta) {
      var items = resultsEl.querySelectorAll('.search-result');
      if (!items.length) return;
      activeIndex = (activeIndex + delta + items.length) % items.length;
      items.forEach(function (el, i) {
        if (i === activeIndex) {
          el.classList.add('is-active');
          el.scrollIntoView({ block: 'nearest' });
        } else {
          el.classList.remove('is-active');
        }
      });
    }

    if (input) {
      var t;
      input.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { doSearch(input.value); }, 80);
      });
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-action="open-search"]');
      if (trigger) { e.preventDefault(); open(); return; }
      if (e.target === modal) { close(); return; }
      var dismiss = e.target.closest('[data-action="close-search"]');
      if (dismiss) { e.preventDefault(); close(); return; }
    });
    document.addEventListener('keydown', function (e) {
      if (modal.classList.contains('is-open')) {
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); return; }
        if (e.key === 'Enter') {
          var items = resultsEl.querySelectorAll('.search-result');
          if (activeIndex >= 0 && items[activeIndex]) {
            window.location.href = items[activeIndex].href;
            e.preventDefault();
          }
          return;
        }
        return;
      }
      // 全局快捷键：/ 或 Cmd/Ctrl+K
      var tag = (e.target && e.target.tagName) || '';
      var inForm = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable);
      if (!inForm && (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault(); open();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault(); open();
      }
    });
  }

  /* ---------- 8. 当前菜单高亮 ---------- */
  function initActiveNav() {
    var path = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '/');
    document.querySelectorAll('.site-nav a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var hp;
      try { hp = new URL(href, window.location.origin).pathname; } catch (e) { return; }
      hp = hp.replace(/\/index\.html$/, '/').replace(/\/+$/, '/');
      if ((hp === '/' && path === '/') || (hp !== '/' && path.indexOf(hp) === 0)) {
        a.classList.add('is-active');
      }
    });
  }

  /* ---------- 启动 ---------- */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }
  ready(function () {
    initReadingProgress();
    initBackToTop();
    initCodeCopy();
    initToc();
    initHeatmap();
    initSearch();
    initActiveNav();
  });
})();
