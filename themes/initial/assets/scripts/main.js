/* =========================================================================
   Initial — Gridea Pro 主题
   主交互脚本：暗色模式 / 顶栏 / 全屏搜索 / TOC / 代码复制 / 回到顶部
   /阅读进度 / 移动菜单 / memos 热力图 / 上下篇推断
   依赖：无（纯原生）
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- 0. 全局配置（由 base.html 注入） ---------- */
  var cfg = (window.__INITIAL_CFG__ || {});

  /* ---------- 1. 暗色模式 ---------- */
  var THEME_KEY = 'initial-theme';
  var html = document.documentElement;

  function applyTheme(value) {
    if (value === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  function resolveTheme() {
    var mode = cfg.themeMode || 'auto';
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    if (mode === 'user') {
      var saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
    }
    // auto
    var saved2 = null;
    try { saved2 = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved2 === 'dark' || saved2 === 'light') return saved2;
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  // 初始应用（防闪：base.html 内联脚本中已经先做了一次，这里兜底）
  applyTheme(resolveTheme());

  function bindThemeToggle() {
    var btn = document.getElementById('themetoggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  // 跟随系统变化（仅 auto 且未手动覆盖时）
  if (window.matchMedia && (cfg.themeMode === 'auto')) {
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var listener = function (e) {
      var saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (saved !== 'dark' && saved !== 'light') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    if (mql.addEventListener) mql.addEventListener('change', listener);
    else if (mql.addListener) mql.addListener(listener);
  }

  /* ---------- 2. 顶栏 / 移动菜单 / 站内搜索切换 ---------- */
  function bindNavToggle() {
    var btn = document.getElementById('nav-swith');
    var header = document.getElementById('header');
    if (!btn || !header) return;
    btn.addEventListener('click', function () {
      header.classList.toggle('on');
    });
    // 关闭：点击空白处
    document.addEventListener('click', function (e) {
      if (!header.classList.contains('on')) return;
      if (header.contains(e.target)) return;
      header.classList.remove('on');
    });
  }

  /* ---------- 3. 头部站内 search form 拦截 → 打开全屏搜索 ---------- */
  function bindHeaderSearch() {
    var form = document.getElementById('search');
    if (!form) return;
    var input = form.querySelector('input[type="text"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      openSearch(input ? input.value : '');
    });
    // 顶栏小按钮直接打开
    var trigger = document.querySelector('[data-search-open]');
    if (trigger) trigger.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
  }

  /* ---------- 4. 全屏搜索（fetch /api/search.json） ---------- */
  var searchIndex = null;
  var searchFetching = false;

  function loadSearchIndex(cb) {
    if (searchIndex) return cb(searchIndex);
    if (searchFetching) return setTimeout(function () { loadSearchIndex(cb); }, 80);
    searchFetching = true;
    fetch('/api/search.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { searchIndex = Array.isArray(data) ? data : []; cb(searchIndex); })
      .catch(function () { searchIndex = []; cb(searchIndex); });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function highlight(text, kw) {
    if (!kw) return escapeHtml(text);
    var safe = escapeHtml(text);
    try {
      var re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return safe.replace(re, '<mark>$1</mark>');
    } catch (e) { return safe; }
  }

  function search(kw) {
    if (!kw || !searchIndex) return [];
    var q = kw.toLowerCase();
    var hits = [];
    for (var i = 0; i < searchIndex.length; i++) {
      var item = searchIndex[i];
      var score = 0;
      if (item.title && item.title.toLowerCase().indexOf(q) !== -1) score += 5;
      if (item.tags && Array.isArray(item.tags)) {
        for (var j = 0; j < item.tags.length; j++) {
          if (String(item.tags[j]).toLowerCase().indexOf(q) !== -1) { score += 3; break; }
        }
      }
      if (item.content && item.content.toLowerCase().indexOf(q) !== -1) score += 1;
      if (score > 0) hits.push({ item: item, score: score });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, 20).map(function (x) { return x.item; });
  }

  function buildSnippet(content, kw, len) {
    if (!content) return '';
    if (!kw) return content.slice(0, len) + (content.length > len ? '…' : '');
    var idx = content.toLowerCase().indexOf(kw.toLowerCase());
    if (idx < 0) return content.slice(0, len) + (content.length > len ? '…' : '');
    var start = Math.max(0, idx - Math.floor(len / 4));
    var snippet = content.slice(start, start + len);
    return (start > 0 ? '…' : '') + snippet + (start + len < content.length ? '…' : '');
  }

  function openSearch(initialKw) {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.add('is-open');
    var input = modal.querySelector('input');
    var results = modal.querySelector('.search-modal__results');
    if (input) {
      if (initialKw) input.value = initialKw;
      setTimeout(function () { input.focus(); }, 30);
    }
    function render(kw) {
      kw = (kw || '').trim();
      if (!kw) {
        results.innerHTML = '<div class="empty">输入关键字开始搜索</div>';
        return;
      }
      loadSearchIndex(function () {
        var hits = search(kw);
        if (!hits.length) {
          results.innerHTML = '<div class="empty">没有匹配的内容</div>';
          return;
        }
        var html = '';
        for (var i = 0; i < hits.length; i++) {
          var h = hits[i];
          html += '<a class="search-modal__item" href="' + escapeHtml(h.link || '#') + '">'
            + '<div class="search-modal__item-title">' + highlight(h.title || '(无标题)', kw) + '</div>'
            + '<div class="search-modal__item-meta">' + escapeHtml(h.date || '') + '</div>'
            + '<div class="search-modal__item-snippet">' + highlight(buildSnippet(h.content || '', kw, 100), kw) + '</div>'
            + '</a>';
        }
        results.innerHTML = html;
      });
    }
    if (input) {
      input.oninput = function () { render(input.value); };
      render(input.value);
    }
  }

  function closeSearch() {
    var modal = document.getElementById('search-modal');
    if (modal) modal.classList.remove('is-open');
  }

  function bindSearchModal() {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    var closeBtn = modal.querySelector('.search-modal__close');
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeSearch();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')))) {
        var tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') closeSearch();
    });
  }

  /* ---------- 5. TOC（目录） ---------- */
  function bindCatalogToggle() {
    var btn = document.getElementById('catalog');
    var col = document.getElementById('catalog-col');
    if (!btn || !col) return;
    btn.addEventListener('click', function () {
      btn.classList.toggle('catalog');
      col.classList.toggle('catalog');
    });
  }

  function bindTocActiveScroll() {
    var col = document.getElementById('catalog-col');
    if (!col) return;
    var links = col.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    var targets = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var t = id ? document.getElementById(id) : null;
      if (t) targets.push({ a: a, el: t });
    });
    if (!targets.length) return;
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var top = window.scrollY + 80;
        var active = targets[0];
        for (var i = 0; i < targets.length; i++) {
          if (targets[i].el.offsetTop <= top) active = targets[i];
        }
        targets.forEach(function (t) { t.a.classList.remove('active'); });
        if (active) active.a.classList.add('active');
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 6. 代码块复制按钮 ---------- */
  function bindCodeCopy() {
    var pres = document.querySelectorAll('.post-content pre');
    pres.forEach(function (pre) {
      if (pre.querySelector('.code-copy')) return;
      var btn = document.createElement('button');
      btn.className = 'code-copy';
      btn.type = 'button';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        var text = code.innerText;
        var done = function () {
          btn.textContent = '已复制';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
        } else { fallback(text, done); }
      });
      pre.appendChild(btn);
    });
    function fallback(text, done) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done && done();
    }
  }

  /* ---------- 7. 回到顶部 + 阅读进度条 ---------- */
  function bindScrollUI() {
    var topBtn = document.getElementById('top');
    var bar = document.querySelector('.reading-progress');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var st = window.scrollY || document.documentElement.scrollTop;
        var ch = document.documentElement.scrollHeight - window.innerHeight;
        if (topBtn) {
          if (st > 200) topBtn.classList.remove('hidden');
          else topBtn.classList.add('hidden');
        }
        if (bar) {
          var pct = ch > 0 ? Math.min(100, st / ch * 100) : 0;
          bar.style.width = pct + '%';
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (topBtn) {
      topBtn.addEventListener('click', function () {
        var start = window.scrollY;
        var dur = 350;
        var t0 = performance.now();
        function step(t) {
          var p = Math.min(1, (t - t0) / dur);
          var ease = 1 - Math.pow(1 - p, 3);
          window.scrollTo(0, start * (1 - ease));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
  }

  /* ---------- 8. memos 热力图（53 周 × 7 天） ---------- */
  function buildHeatmap() {
    var root = document.getElementById('memos-heatmap');
    if (!root) return;
    var dataAttr = root.getAttribute('data-dates') || '';
    var dates = dataAttr.split('|').filter(Boolean);
    var counts = {};
    dates.forEach(function (d) { counts[d] = (counts[d] || 0) + 1; });

    var weeks = 53;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var end = new Date(today);
    var start = new Date(today);
    start.setDate(today.getDate() - (weeks * 7 - 1) - today.getDay());

    function levelOf(c) {
      if (!c) return 0;
      if (c >= 8) return 4;
      if (c >= 5) return 3;
      if (c >= 3) return 2;
      return 1;
    }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

    var html = '';
    for (var w = 0; w < weeks; w++) {
      html += '<div class="heatmap__col">';
      for (var dow = 0; dow < 7; dow++) {
        var d = new Date(start);
        d.setDate(start.getDate() + w * 7 + dow);
        if (d > end) {
          html += '<div class="heatmap__cell" style="visibility:hidden"></div>';
          continue;
        }
        var k = key(d);
        var c = counts[k] || 0;
        var lvl = levelOf(c);
        html += '<div class="heatmap__cell lvl-' + lvl + '" title="' + k + (c ? ' · ' + c + ' 条' : '') + '"></div>';
      }
      html += '</div>';
    }
    root.innerHTML = html;
  }

  /* ---------- 9. 启动 ---------- */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    bindThemeToggle();
    bindNavToggle();
    bindHeaderSearch();
    bindSearchModal();
    bindCatalogToggle();
    bindTocActiveScroll();
    bindCodeCopy();
    bindScrollUI();
    buildHeatmap();

    if (window.console && window.console.log) {
      console.log('%c Initial × Gridea Pro %c 简约而不简单 ',
        'color:#fff;background:#3354aa;padding:2px 0',
        'color:#3354aa;background:transparent;padding:2px 0');
    }
  });
})();
