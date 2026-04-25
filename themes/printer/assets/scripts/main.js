/* ==========================================================================
   Printer · 主题脚本（Gridea Pro Jinja2 移植版）
   --------------------------------------------------------------------------
   保留原 Typecho 主题的全部交互行为：
     1. 主题切换（亮 / 暗）+ FOUC 配合 + theme-animating 250ms 过渡
     2. 顶栏搜索框展开 + ESC 收起
     3. 全屏搜索弹窗（Cmd/Ctrl+K，新增）
     4. 文章页阅读进度条（仅文章高度 ≥ 1.5 屏时显示）
     5. 文章页估读时长（200 字/分钟）
     6. 代码块复制按钮
     7. 回到顶部按钮（>300px 显示）
     8. 闪念热力图（GitHub 风格 365 天）
     9. 首页"随机阅读"链接（client-side 从 search-index 抽一篇）
   --------------------------------------------------------------------------
   约定：
     - localStorage key: 'printer-theme-mode'  ('light' / 'dark')
     - dark 标记：<html class="dark">
     - 字体偏好：<html class="printer-font-sans">（无衬线时挂载）
     - 页面 flag：window.__PRINTER_PAGE_FLAGS__ = { readingProgress, readingTime, codeCopy }
     - 搜索数据：<script id="printer-search-data" type="application/json">
   ========================================================================== */

(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function throttle(fn, wait) {
    var t = null, ctx, args;
    return function () {
      ctx = this; args = arguments;
      if (t) return;
      t = setTimeout(function () { t = null; fn.apply(ctx, args); }, wait);
    };
  }

  // ==========================================================================
  // 1. 主题切换（保留原主题的过渡动画 + localStorage 行为）
  // ==========================================================================
  function initThemeToggle() {
    var root = document.documentElement;
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var sync = function () {
      var isDark = root.classList.contains('dark');
      toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      var t = isDark ? toggle.getAttribute('data-title-light') : toggle.getAttribute('data-title-dark');
      toggle.setAttribute('title', t || (isDark ? '切换到日间模式' : '切换到夜间模式'));
    };

    sync();

    toggle.addEventListener('click', function () {
      root.classList.add('theme-animating');
      var nextDark = !root.classList.contains('dark');
      root.classList.toggle('dark', nextDark);
      try {
        localStorage.setItem('printer-theme-mode', nextDark ? 'dark' : 'light');
      } catch (e) {}
      sync();
      // 250ms CSS 过渡 + 50ms 缓冲
      setTimeout(function () { root.classList.remove('theme-animating'); }, 300);
    });

    // 跟随系统：用户没手动选过时实时跟随
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var listener = function (e) {
        var saved = null;
        try { saved = localStorage.getItem('printer-theme-mode'); } catch (err) {}
        if (saved !== 'dark' && saved !== 'light') {
          root.classList.toggle('dark', e.matches);
          sync();
        }
      };
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', listener);
      else if (typeof mq.addListener === 'function') mq.addListener(listener);
    }
  }

  // ==========================================================================
  // 2. 顶栏搜索框展开 + ESC 收起
  // ==========================================================================
  function initHeaderSearch() {
    var form = document.querySelector('.header-search');
    var input = document.getElementById('header-search-input');
    var btn = document.getElementById('header-search-btn');
    if (!form || !input || !btn) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // 总是打开全屏搜索弹窗（更好的搜索体验）
      var modal = document.getElementById('search-modal');
      if (modal) {
        openSearchModal();
      } else {
        // 没有 modal 时退化为展开式
        if (!form.classList.contains('open')) {
          form.classList.add('open');
          requestAnimationFrame(function () { input.focus(); });
        }
      }
    });

    // 在顶栏 input 中按回车 → 跳到全屏搜索弹窗 + 带入关键词
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var q = input.value;
        openSearchModal();
        var modalInput = document.getElementById('search-input');
        if (modalInput) {
          modalInput.value = q;
          modalInput.dispatchEvent(new Event('input'));
        }
      } else if (e.key === 'Escape') {
        form.classList.remove('open');
        btn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) {
        form.classList.remove('open');
      }
    });
  }

  // ==========================================================================
  // 3. 全屏搜索弹窗
  // ==========================================================================
  var searchState = {
    modal: null,
    input: null,
    resultsEl: null,
    dataset: { posts: [], tags: [] },
    currentResults: [],
    activeIndex: -1
  };

  function openSearchModal() {
    if (!searchState.modal) return;
    searchState.modal.classList.add('active');
    document.body.classList.add('search-open');
    setTimeout(function () { if (searchState.input) searchState.input.focus(); }, 50);
  }

  function closeSearchModal() {
    if (!searchState.modal) return;
    searchState.modal.classList.remove('active');
    document.body.classList.remove('search-open');
    if (searchState.input) searchState.input.value = '';
    searchState.currentResults = [];
    searchState.activeIndex = -1;
    if (searchState.resultsEl) {
      searchState.resultsEl.innerHTML = '<p class="search-empty">输入关键词开始搜索</p>';
    }
  }

  function highlight(text, q) {
    if (!text) return '';
    if (!q) return escapeHtml(text);
    var safe = escapeHtml(text);
    var safeQ = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      var re = new RegExp('(' + safeQ + ')', 'ig');
      return safe.replace(re, '<mark>$1</mark>');
    } catch (e) { return safe; }
  }

  function scorePost(p, q) {
    var qq = q.toLowerCase();
    var s = 0;
    if (p.title && p.title.toLowerCase().indexOf(qq) !== -1) s += 10;
    if (p.excerpt && p.excerpt.toLowerCase().indexOf(qq) !== -1) s += 4;
    if (Array.isArray(p.tags)) {
      for (var i = 0; i < p.tags.length; i++) {
        if (p.tags[i] && p.tags[i].toLowerCase().indexOf(qq) !== -1) s += 6;
      }
    }
    return s;
  }

  function renderSearchResults(q) {
    if (!searchState.resultsEl) return;
    if (!searchState.currentResults.length) {
      searchState.resultsEl.innerHTML = '<p class="search-empty">没有找到相关结果</p>';
      return;
    }
    var html = '<ul class="search-result-list" role="listbox">';
    for (var i = 0; i < searchState.currentResults.length; i++) {
      var p = searchState.currentResults[i].post;
      var active = i === searchState.activeIndex ? ' active' : '';
      html += '<li class="search-result-item' + active + '" role="option" data-index="' + i + '">' +
        '<a href="' + escapeHtml(p.link || '#') + '" class="search-result-link">' +
          '<div class="search-result-title">' + highlight(p.title || '', q) + '</div>' +
          '<div class="search-result-meta">' +
            (p.date ? '<time>' + escapeHtml(p.date) + '</time>' : '') +
            (Array.isArray(p.tags) && p.tags.length ? ' · ' + p.tags.map(escapeHtml).join(' · ') : '') +
          '</div>' +
          (p.excerpt ? '<p class="search-result-excerpt">' + highlight(p.excerpt, q) + '</p>' : '') +
        '</a></li>';
    }
    html += '</ul>';
    searchState.resultsEl.innerHTML = html;
  }

  function doSearch(q) {
    q = (q || '').trim();
    if (!q) {
      searchState.currentResults = [];
      searchState.activeIndex = -1;
      if (searchState.resultsEl) {
        searchState.resultsEl.innerHTML = '<p class="search-empty">输入关键词开始搜索</p>';
      }
      return;
    }
    var hits = [];
    for (var i = 0; i < searchState.dataset.posts.length; i++) {
      var s = scorePost(searchState.dataset.posts[i], q);
      if (s > 0) hits.push({ post: searchState.dataset.posts[i], score: s });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    searchState.currentResults = hits.slice(0, 12);
    searchState.activeIndex = searchState.currentResults.length ? 0 : -1;
    renderSearchResults(q);
  }

  function moveActive(delta) {
    if (!searchState.currentResults.length) return;
    var n = searchState.currentResults.length;
    searchState.activeIndex = (searchState.activeIndex + delta + n) % n;
    var items = searchState.resultsEl.querySelectorAll('.search-result-item');
    items.forEach(function (el, idx) {
      el.classList.toggle('active', idx === searchState.activeIndex);
      if (idx === searchState.activeIndex && el.scrollIntoView) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function activateActive() {
    if (searchState.activeIndex < 0) return;
    var hit = searchState.currentResults[searchState.activeIndex];
    if (hit && hit.post && hit.post.link) {
      window.location.href = hit.post.link;
    }
  }

  function initSearch() {
    var modal = document.getElementById('search-modal');
    var dataNode = document.getElementById('printer-search-data');
    if (!modal || !dataNode) return;

    searchState.modal = modal;
    searchState.input = document.getElementById('search-input');
    searchState.resultsEl = document.getElementById('search-results');

    try {
      searchState.dataset = JSON.parse(dataNode.textContent || dataNode.innerText || '{}');
    } catch (err) {
      console.warn('[printer] 搜索数据解析失败：', err);
      searchState.dataset = { posts: [], tags: [] };
    }
    if (!Array.isArray(searchState.dataset.posts)) searchState.dataset.posts = [];
    if (!Array.isArray(searchState.dataset.tags)) searchState.dataset.tags = [];

    var closeBtn = document.getElementById('search-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSearchModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeSearchModal();
    });

    if (searchState.input) {
      searchState.input.addEventListener('input', function (e) { doSearch(e.target.value); });
    }

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('active')) closeSearchModal();
        else openSearchModal();
        return;
      }
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeSearchModal(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Enter' && document.activeElement === searchState.input && searchState.currentResults.length) {
        e.preventDefault();
        activateActive();
      }
    });

    // 404 页搜索框：点提交按钮 → 唤出全屏搜索 + 关键词
    var nfBtn = document.getElementById('not-found-search-submit');
    var nfInput = document.getElementById('not-found-search-input');
    if (nfBtn && nfInput) {
      var fire = function () {
        var q = nfInput.value;
        openSearchModal();
        if (searchState.input) {
          searchState.input.value = q;
          doSearch(q);
        }
      };
      nfBtn.addEventListener('click', fire);
      nfInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fire(); } });
    }
  }

  // ==========================================================================
  // 4. 阅读进度条（保留原行为：文章高度 ≥ 1.5 屏才显示）
  // ==========================================================================
  function initReadingProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar) return;
    var article = document.querySelector('article');
    if (!article) return;

    var MIN = window.innerHeight * 1.5;
    var check = function () {
      if (article.offsetHeight < MIN) {
        bar.style.display = 'none';
        return false;
      }
      bar.style.display = '';
      return true;
    };

    var update = function () {
      if (bar.style.display === 'none') return;
      var total = article.offsetTop + article.offsetHeight - window.innerHeight;
      var p = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 100;
      bar.style.width = p + '%';
      bar.setAttribute('aria-valuenow', Math.round(p));
    };

    if (!check()) return;
    update();
    window.addEventListener('scroll', throttle(update, 30), { passive: true });
    window.addEventListener('resize', throttle(function () { check(); update(); }, 100));
  }

  // ==========================================================================
  // 5. 文章估读时长（200 字/分钟，与原主题一致）
  // ==========================================================================
  function initReadingTime() {
    var el = document.getElementById('post-reading-time');
    if (!el) return;
    var content = document.querySelector('article .post-content') || document.querySelector('article .post-excerpt');
    if (!content) return;
    var chars = content.innerText.replace(/\s+/g, '').length;
    var minutes = Math.max(1, Math.ceil(chars / 200));
    el.textContent = '约 ' + minutes + ' 分钟读完';
  }

  // ==========================================================================
  // 6. 代码块复制按钮
  // ==========================================================================
  function initCodeCopy() {
    var flags = window.__PRINTER_PAGE_FLAGS__ || {};
    if (!flags.codeCopy) return;
    var blocks = document.querySelectorAll('.post-content pre');
    if (!blocks.length) return;

    blocks.forEach(function (pre) {
      if (pre.querySelector('.code-copy-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.textContent = '复制';
      btn.setAttribute('aria-label', '复制代码');

      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.innerText : pre.innerText;
        var done = function () {
          btn.textContent = '已复制';
          btn.classList.add('is-copied');
          setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('is-copied'); }, 1600);
        };
        var fail = function () {
          btn.textContent = '失败';
          setTimeout(function () { btn.textContent = '复制'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fail);
        } else {
          try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            done();
          } catch (e) { fail(); }
        }
      });

      var cs = window.getComputedStyle(pre);
      if (cs && cs.position === 'static') pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  // ==========================================================================
  // 7. 回到顶部
  // ==========================================================================
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    var update = function () {
      btn.classList.toggle('visible', window.scrollY > 300);
    };
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
    window.addEventListener('scroll', throttle(update, 80), { passive: true });
  }

  // ==========================================================================
  // 8. 闪念热力图
  // ==========================================================================
  function initMemoHeatmap() {
    var el = document.getElementById('memo-heatmap');
    if (!el) return;
    var raw = el.getAttribute('data-memos') || '';
    var dates = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    function toDay(s) {
      if (!s) return '';
      var m = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (!m) return '';
      return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
    }

    var counts = {};
    dates.forEach(function (d) {
      var k = toDay(d);
      if (!k) return;
      counts[k] = (counts[k] || 0) + 1;
    });

    function lvl(n) { if (!n) return 0; if (n === 1) return 1; if (n <= 3) return 2; if (n <= 6) return 3; return 4; }
    function fmt(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    function readable(s) { var p = s.split('-'); return p[0] + '年' + parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日'; }

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var end = new Date(today);
    var start = new Date(today); start.setDate(start.getDate() - 364);
    var pad = start.getDay();
    start.setDate(start.getDate() - pad);

    var html = '';
    var cursor = new Date(start);
    var minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 364);
    while (cursor <= end) {
      for (var d = 0; d < 7; d++) {
        if (cursor > end) break;
        var inRange = cursor >= minDate && cursor <= end;
        if (!inRange) {
          html += '<span class="memo-heatmap-cell" data-level="0" aria-hidden="true"></span>';
        } else {
          var key = fmt(cursor);
          var c = counts[key] || 0;
          html += '<span class="memo-heatmap-cell" data-level="' + lvl(c) + '" title="' + readable(key) + ' · ' + c + ' 条"></span>';
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    el.innerHTML = html;
  }

  // ==========================================================================
  // 9. "随机阅读"链接（client-side）
  // ==========================================================================
  function initRandomRead() {
    var link = document.getElementById('random-read-link');
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var data = searchState.dataset.posts;
      if (!data || !data.length) return;
      var picked = data[Math.floor(Math.random() * data.length)];
      if (picked && picked.link) window.location.href = picked.link;
    });
  }

  onReady(function () {
    initThemeToggle();
    initSearch();         // 必须在 initHeaderSearch / initRandomRead 之前，因为它填充 searchState.dataset
    initHeaderSearch();
    initReadingProgress();
    initReadingTime();
    initCodeCopy();
    initBackToTop();
    initMemoHeatmap();
    initRandomRead();
  });
})();
