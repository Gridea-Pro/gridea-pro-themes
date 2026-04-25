/* =========================================================================
   Weibo — Gridea Pro 主题
   主交互脚本：暗色 / 顶栏 / 全屏搜索 / 回顶 / 代码复制 / 阅读进度 / memos 热力图
   依赖：无
   ========================================================================= */
(function () {
  'use strict';

  var cfg = (window.__WEIBO_CFG__ || {});

  /* ---------- 1. 暗色模式 ---------- */
  var THEME_KEY = 'weibo-theme';
  var html = document.documentElement;

  function applyTheme(value) {
    if (value === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
  }
  function resolveTheme() {
    var mode = cfg.themeMode || 'auto';
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    if (mode === 'user') {
      var s = null;
      try { s = localStorage.getItem(THEME_KEY); } catch (e) {}
      return (s === 'dark' || s === 'light') ? s : 'light';
    }
    var s2 = null;
    try { s2 = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (s2 === 'dark' || s2 === 'light') return s2;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  applyTheme(resolveTheme());

  function bindThemeToggle() {
    var triggers = document.querySelectorAll('[data-theme-toggle]');
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    });
  }
  if (window.matchMedia && cfg.themeMode === 'auto') {
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var listener = function (e) {
      var s = null;
      try { s = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (s !== 'dark' && s !== 'light') applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mql.addEventListener) mql.addEventListener('change', listener);
    else if (mql.addListener) mql.addListener(listener);
  }

  /* ---------- 2. 顶栏 search form 拦截 → 打开全屏搜索 ---------- */
  function bindHeaderSearch() {
    var form = document.getElementById('search');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="text"]');
        openSearch(input ? input.value : '');
      });
    }
    document.querySelectorAll('[data-search-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
    });
  }

  /* ---------- 3. 全屏搜索（fetch /api/search.json） ---------- */
  var searchIndex = null, searchFetching = false;
  function loadSearchIndex(cb) {
    if (searchIndex) return cb(searchIndex);
    if (searchFetching) return setTimeout(function () { loadSearchIndex(cb); }, 80);
    searchFetching = true;
    fetch('/api/search.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (d) { searchIndex = Array.isArray(d) ? d : []; cb(searchIndex); })
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
      var it = searchIndex[i], score = 0;
      if (it.title && it.title.toLowerCase().indexOf(q) !== -1) score += 5;
      if (Array.isArray(it.tags)) {
        for (var j = 0; j < it.tags.length; j++) {
          if (String(it.tags[j]).toLowerCase().indexOf(q) !== -1) { score += 3; break; }
        }
      }
      if (it.content && it.content.toLowerCase().indexOf(q) !== -1) score += 1;
      if (score > 0) hits.push({ item: it, score: score });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, 20).map(function (x) { return x.item; });
  }
  function snippet(content, kw, len) {
    if (!content) return '';
    if (!kw) return content.slice(0, len) + (content.length > len ? '…' : '');
    var idx = content.toLowerCase().indexOf(kw.toLowerCase());
    if (idx < 0) return content.slice(0, len) + (content.length > len ? '…' : '');
    var s = Math.max(0, idx - Math.floor(len / 4));
    var t = content.slice(s, s + len);
    return (s > 0 ? '…' : '') + t + (s + len < content.length ? '…' : '');
  }
  function openSearch(initial) {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.add('is-open');
    var input = modal.querySelector('input');
    var results = modal.querySelector('.search-modal__results');
    if (input) {
      if (initial) input.value = initial;
      setTimeout(function () { input.focus(); }, 30);
    }
    function render(kw) {
      kw = (kw || '').trim();
      if (!kw) { results.innerHTML = '<div class="empty">输入关键字开始搜索（也支持 / 或 Ctrl+K 快捷键）</div>'; return; }
      loadSearchIndex(function () {
        var hits = search(kw);
        if (!hits.length) { results.innerHTML = '<div class="empty">没有匹配的内容</div>'; return; }
        var h = '';
        for (var i = 0; i < hits.length; i++) {
          var x = hits[i];
          h += '<a class="search-modal__item" href="' + escapeHtml(x.link || '#') + '">'
            + '<div class="search-modal__item-title">' + highlight(x.title || '(无标题)', kw) + '</div>'
            + '<div class="search-modal__item-meta">' + escapeHtml(x.date || '') + '</div>'
            + '<div class="search-modal__item-snippet">' + highlight(snippet(x.content || '', kw, 100), kw) + '</div>'
            + '</a>';
        }
        results.innerHTML = h;
      });
    }
    if (input) { input.oninput = function () { render(input.value); }; render(input.value); }
  }
  function closeSearch() {
    var m = document.getElementById('search-modal');
    if (m) m.classList.remove('is-open');
  }
  function bindSearchModal() {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    var closeBtn = modal.querySelector('.search-modal__close');
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'))) {
        var t = (document.activeElement && document.activeElement.tagName) || '';
        if (t === 'INPUT' || t === 'TEXTAREA') return;
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') closeSearch();
    });
  }

  /* ---------- 4. 回到顶部 + 阅读进度条 ---------- */
  function bindScrollUI() {
    var topBtn = document.querySelector('.gotop');
    var bar = document.querySelector('.reading-progress');
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var st = window.scrollY || document.documentElement.scrollTop;
        var ch = document.documentElement.scrollHeight - window.innerHeight;
        if (topBtn) topBtn.classList.toggle('show', st > 400);
        if (bar) bar.style.width = (ch > 0 ? Math.min(100, st / ch * 100) : 0) + '%';
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (topBtn) {
      topBtn.addEventListener('click', function () {
        var start = window.scrollY, dur = 400, t0 = performance.now();
        function step(t) {
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          window.scrollTo(0, start * (1 - e));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
  }

  /* ---------- 5. 锚点平滑滚动 ---------- */
  function bindAnchors() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        var t = document.querySelector(hash);
        if (!t) return;
        e.preventDefault();
        var offset = (document.querySelector('.topbar') ? 80 : 20);
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      });
    });
  }

  /* ---------- 6. 代码块复制按钮 ---------- */
  function bindCodeCopy() {
    document.querySelectorAll('.entry-content pre, .content pre').forEach(function (pre) {
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
          }, 1400);
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

  /* ---------- 7. memos 热力图 ---------- */
  function buildHeatmap() {
    var root = document.getElementById('memos-heatmap');
    if (!root) return;
    var dates = (root.getAttribute('data-dates') || '').split('|').filter(Boolean);
    var counts = {};
    dates.forEach(function (d) { counts[d] = (counts[d] || 0) + 1; });

    var weeks = 53;
    var today = new Date(); today.setHours(0,0,0,0);
    var start = new Date(today);
    start.setDate(today.getDate() - (weeks * 7 - 1) - today.getDay());

    function lvl(c) { return !c ? 0 : c >= 8 ? 4 : c >= 5 ? 3 : c >= 3 ? 2 : 1; }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function key(d) { return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }

    var html = '';
    for (var w = 0; w < weeks; w++) {
      html += '<div class="heatmap__col">';
      for (var dow = 0; dow < 7; dow++) {
        var d = new Date(start);
        d.setDate(start.getDate() + w * 7 + dow);
        if (d > today) {
          html += '<div class="heatmap__cell" style="visibility:hidden"></div>';
          continue;
        }
        var k = key(d), c = counts[k] || 0;
        html += '<div class="heatmap__cell lvl-' + lvl(c) + '" title="' + k + (c ? ' · ' + c + ' 条' : '') + '"></div>';
      }
      html += '</div>';
    }
    root.innerHTML = html;
  }

  /* ---------- 8. 客户端注入侧栏 widget 数据 ---------- */
  function fillSidebarStats() {
    var box = document.getElementById('widget-stats-bar');
    if (!box) return;
    fetch('/api/search.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (entries) {
        var posts = entries.length;
        var catSet = {}, tagSet = {};
        entries.forEach(function (e) {
          (e.categories || []).forEach(function (c) {
            var name = (typeof c === 'string') ? c : (c.name || '');
            if (name) catSet[name] = true;
          });
          (e.tags || []).forEach(function (t) {
            var name = (typeof t === 'string') ? t : (t.name || '');
            if (name) tagSet[name] = true;
          });
        });
        var statPosts = box.querySelector('[data-stat="posts"]');
        var statCats = box.querySelector('[data-stat="categories"]');
        var statTags = box.querySelector('[data-stat="tags"]');
        if (statPosts) statPosts.textContent = posts;
        if (statCats) statCats.textContent = Object.keys(catSet).length;
        if (statTags) statTags.textContent = Object.keys(tagSet).length;
      })
      .catch(function () {});
  }

  /* ---------- 9. 启动 ---------- */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    bindThemeToggle();
    bindHeaderSearch();
    bindSearchModal();
    bindScrollUI();
    bindAnchors();
    bindCodeCopy();
    buildHeatmap();
    fillSidebarStats();
    if (window.console && console.log) {
      console.log('%c Weibo × Gridea Pro %c 微言大艺 ',
        'color:#fff;background:#f76d24;padding:3px 0',
        'color:#f76d24;background:transparent;padding:3px 0');
    }
  });
})();
