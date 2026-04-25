/* ==========================================================================
   Kehua · 留白主题 — 主题脚本
   --------------------------------------------------------------------------
   覆盖功能：
     1. 主题切换（亮 / 暗 / 跟随系统）+ 与 <head> 内的 FOUC 防护脚本配合
     2. 移动端汉堡菜单
     3. 全站搜索弹窗（Cmd/Ctrl+K 唤出、模糊匹配、↑↓ 导航、↵ 打开、ESC 关闭）
     4. 文章页阅读进度条（按页面 flag 启用）
     5. 代码块复制按钮（按页面 flag 启用）
     6. 回到顶部按钮
     7. 闪念热力图（GitHub 风格 365 天 / 7×53 网格）
   --------------------------------------------------------------------------
   主题约定：
     - localStorage key: 'kehua-theme' （'light' / 'dark' / 未设定 = 跟随系统）
     - data-theme="dark" 挂在 <html> 上
     - 页面 flag: window.__KEHUA_PAGE_FLAGS__ = { readingProgress, codeCopy }
     - 搜索数据: <script id="kehua-search-data" type="application/json">
   ========================================================================== */

(function () {
  'use strict';

  // 工具：DOM ready
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  // 工具：HTML 转义（搜索结果高亮使用）
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 工具：节流（用于 scroll handler）
  function throttle(fn, wait) {
    var timeout = null;
    var lastArgs = null;
    var lastCtx = null;
    return function () {
      lastCtx = this;
      lastArgs = arguments;
      if (timeout) return;
      timeout = setTimeout(function () {
        timeout = null;
        fn.apply(lastCtx, lastArgs);
      }, wait);
    };
  }

  // ==========================================================================
  // 1. 主题切换
  // ==========================================================================
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    function getCurrent() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    btn.addEventListener('click', function () {
      var next = getCurrent() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem('kehua-theme', next);
      } catch (e) {
        /* 无痕 / 隐私模式可能拒绝 localStorage，静默忽略 */
      }
    });

    // Cmd/Ctrl+D 快捷键（避免与浏览器收藏冲突时仅在按下 Shift 一起触发）
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        btn.click();
      }
    });

    // 跟随系统：用户没有手动设置过时，跟随 prefers-color-scheme 实时变化
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var listener = function (e) {
        var saved = null;
        try {
          saved = localStorage.getItem('kehua-theme');
        } catch (err) { /* ignore */ }
        if (saved !== 'dark' && saved !== 'light') {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      };
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', listener);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(listener); // Safari 13 及以下
      }
    }
  }

  // ==========================================================================
  // 2. 移动端汉堡菜单
  // ==========================================================================
  function initMobileMenu() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-nav-open');
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('mobile-nav-open', isOpen);
    });

    // 点击导航项后自动收起
    nav.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('a')) {
        close();
      }
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        close();
      }
    });

    // 视口放大到桌面尺寸时自动关闭
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 768px)');
      var handler = function (e) { if (e.matches) close(); };
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', handler);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(handler);
      }
    }
  }

  // ==========================================================================
  // 3. 全站搜索
  // ==========================================================================
  function initSearch() {
    var modal = document.getElementById('search-modal');
    var dataNode = document.getElementById('kehua-search-data');
    if (!modal || !dataNode) return; // 主题配置关闭搜索时不会渲染

    var input = document.getElementById('search-input');
    var resultsEl = document.getElementById('search-results');
    var openBtn = document.getElementById('search-toggle');
    var closeBtn = document.getElementById('search-close');

    var dataset = { posts: [], tags: [] };
    try {
      dataset = JSON.parse(dataNode.textContent || dataNode.innerText || '{}');
    } catch (err) {
      console.warn('[kehua] 搜索数据解析失败：', err);
    }
    if (!Array.isArray(dataset.posts)) dataset.posts = [];
    if (!Array.isArray(dataset.tags)) dataset.tags = [];

    var activeIndex = -1;
    var currentResults = [];

    function open() {
      modal.classList.add('active');
      document.body.classList.add('search-open');
      // 等待动画后再 focus，移动端键盘体验更稳
      setTimeout(function () { if (input) input.focus(); }, 50);
    }

    function close() {
      modal.classList.remove('active');
      document.body.classList.remove('search-open');
      if (input) input.value = '';
      currentResults = [];
      activeIndex = -1;
      if (resultsEl) {
        resultsEl.innerHTML = '<p class="search-empty">输入关键词开始搜索 · 支持标题 / 摘要 / 标签 / 闪念</p>';
      }
    }

    function highlight(text, query) {
      if (!text) return '';
      if (!query) return escapeHtml(text);
      var safeText = escapeHtml(text);
      var safeQuery = escapeHtml(query);
      // 不区分大小写匹配（中文不区分大小写但安全）
      var re;
      try {
        re = new RegExp('(' + safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      } catch (err) {
        return safeText;
      }
      return safeText.replace(re, '<mark>$1</mark>');
    }

    function score(post, query) {
      var q = query.toLowerCase();
      var hit = 0;
      if (post.title && post.title.toLowerCase().indexOf(q) !== -1) hit += 10;
      if (post.excerpt && post.excerpt.toLowerCase().indexOf(q) !== -1) hit += 4;
      if (Array.isArray(post.tags)) {
        for (var i = 0; i < post.tags.length; i++) {
          if (post.tags[i] && post.tags[i].toLowerCase().indexOf(q) !== -1) hit += 6;
        }
      }
      return hit;
    }

    function search(query) {
      var q = (query || '').trim();
      if (!q) {
        currentResults = [];
        activeIndex = -1;
        if (resultsEl) {
          resultsEl.innerHTML = '<p class="search-empty">输入关键词开始搜索 · 支持标题 / 摘要 / 标签 / 闪念</p>';
        }
        return;
      }

      var hits = [];
      for (var i = 0; i < dataset.posts.length; i++) {
        var s = score(dataset.posts[i], q);
        if (s > 0) hits.push({ post: dataset.posts[i], score: s });
      }
      hits.sort(function (a, b) { return b.score - a.score; });

      currentResults = hits.slice(0, 12);
      activeIndex = currentResults.length > 0 ? 0 : -1;
      render(q);
    }

    function render(query) {
      if (!resultsEl) return;
      if (!currentResults.length) {
        resultsEl.innerHTML = '<p class="search-empty">没有找到相关结果</p>';
        return;
      }
      var html = '<ul class="search-result-list" role="listbox">';
      for (var i = 0; i < currentResults.length; i++) {
        var p = currentResults[i].post;
        var active = i === activeIndex ? ' active' : '';
        html += '<li class="search-result-item' + active + '" role="option" data-index="' + i + '" data-link="' + escapeHtml(p.link || '') + '">' +
          '<a href="' + escapeHtml(p.link || '#') + '" class="search-result-link">' +
            '<div class="search-result-title">' + highlight(p.title || '', query) + '</div>' +
            '<div class="search-result-meta">' +
              (p.date ? '<time>' + escapeHtml(p.date) + '</time>' : '') +
              (Array.isArray(p.tags) && p.tags.length > 0
                ? ' · <span class="search-result-tags">' + p.tags.map(escapeHtml).join(' · ') + '</span>'
                : ''
              ) +
            '</div>' +
            (p.excerpt ? '<p class="search-result-excerpt">' + highlight(p.excerpt, query) + '</p>' : '') +
          '</a>' +
        '</li>';
      }
      html += '</ul>';
      resultsEl.innerHTML = html;
    }

    function move(delta) {
      if (!currentResults.length) return;
      activeIndex = (activeIndex + delta + currentResults.length) % currentResults.length;
      var items = resultsEl.querySelectorAll('.search-result-item');
      items.forEach(function (el, idx) {
        el.classList.toggle('active', idx === activeIndex);
        if (idx === activeIndex && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    function activate() {
      if (activeIndex < 0 || !currentResults[activeIndex]) return;
      var link = currentResults[activeIndex].post.link;
      if (link) {
        window.location.href = link;
      }
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);

    // 点击遮罩关闭（modal 自身是遮罩 + content 居中）
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    if (input) {
      input.addEventListener('input', function (e) { search(e.target.value); });
    }

    // 全局快捷键：Cmd/Ctrl+K 唤出、ESC 关闭、↑↓↵
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('active')) {
          close();
        } else {
          open();
        }
        return;
      }
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'Enter') {
        // 仅当焦点在输入框且有结果时才拦截
        if (document.activeElement === input && currentResults.length) {
          e.preventDefault();
          activate();
        }
      }
    });
  }

  // ==========================================================================
  // 4. 阅读进度条
  // ==========================================================================
  function initReadingProgress() {
    var flags = window.__KEHUA_PAGE_FLAGS__ || {};
    if (!flags.readingProgress) return;

    var article = document.querySelector('.article-content') ||
                  document.querySelector('article.article-detail');
    if (!article) return;

    // CSS 中 .reading-progress 自身就是那条进度条（width 渐变），不需要子元素
    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    function update() {
      var rect = article.getBoundingClientRect();
      var winH = window.innerHeight || document.documentElement.clientHeight;
      // 以文章顶部为 0，文章底部接近视口顶部为 100
      var scrolled = Math.max(0, -rect.top + winH * 0.1);
      var percent = Math.min(100, Math.max(0, (scrolled / Math.max(rect.height - winH * 0.4, 1)) * 100));
      bar.style.width = percent + '%';
    }

    update();
    window.addEventListener('scroll', throttle(update, 30), { passive: true });
    window.addEventListener('resize', throttle(update, 80));
  }

  // ==========================================================================
  // 5. 代码块复制按钮
  // ==========================================================================
  function initCodeCopy() {
    var flags = window.__KEHUA_PAGE_FLAGS__ || {};
    if (!flags.codeCopy) return;

    var blocks = document.querySelectorAll('.article-content pre');
    if (!blocks.length) return;

    blocks.forEach(function (pre) {
      if (pre.querySelector('.code-copy-btn')) return; // 防重复
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.setAttribute('aria-label', '复制代码');
      btn.textContent = '复制';

      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.innerText : pre.innerText;
        var done = function () {
          btn.textContent = '已复制';
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('is-copied');
          }, 1600);
        };
        var fail = function () {
          btn.textContent = '复制失败';
          setTimeout(function () { btn.textContent = '复制'; }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fail);
        } else {
          // Fallback：临时 textarea
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
          } catch (err) {
            fail();
          }
        }
      });

      // 让 pre 成为相对定位容器，方便绝对定位按钮
      var cs = window.getComputedStyle(pre);
      if (cs && cs.position === 'static') {
        pre.style.position = 'relative';
      }
      pre.appendChild(btn);
    });
  }

  // ==========================================================================
  // 6. 回到顶部按钮
  // ==========================================================================
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      btn.classList.toggle('visible', y > 400);
    }

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
    window.addEventListener('scroll', throttle(update, 80), { passive: true });
  }

  // ==========================================================================
  // 7. 闪念热力图
  // ==========================================================================
  function initMemoHeatmap() {
    var el = document.getElementById('memo-heatmap');
    if (!el) return;

    var raw = el.getAttribute('data-memos') || '';
    var dates = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    // 把日期归一化到 YYYY-MM-DD（兼容 ISO 时间戳和 'YYYY-MM-DD HH:mm:ss'）
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

    function levelOf(n) {
      if (!n) return 0;
      if (n === 1) return 1;
      if (n <= 3) return 2;
      if (n <= 6) return 3;
      return 4;
    }

    function fmt(d) {
      var y = d.getFullYear();
      var m = ('0' + (d.getMonth() + 1)).slice(-2);
      var day = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + day;
    }

    function readableDate(s) {
      var p = s.split('-');
      return p[0] + '年' + parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日';
    }

    // 终点：今天；起点：今天往前 364 天，再回退到周日（让网格对齐）
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var end = new Date(today);
    var start = new Date(today);
    start.setDate(start.getDate() - 364);
    // 回退到周日（getDay 0=Sunday），方便 CSS grid 7 行对齐
    var pad = start.getDay();
    start.setDate(start.getDate() - pad);

    // CSS 中 .memo-heatmap 已经设了 grid-template-rows: repeat(7, 1fr) + grid-auto-flow: column
    // 所以这里直接按"先列后行"的顺序塞 cell，CSS 会自动布成 7×N 网格
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
          var title = readableDate(key) + ' · ' + c + ' 条';
          html += '<span class="memo-heatmap-cell" data-level="' + levelOf(c) + '" title="' + title + '"></span>';
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    el.innerHTML = html;
  }

  // ==========================================================================
  // 启动
  // ==========================================================================
  onReady(function () {
    initThemeToggle();
    initMobileMenu();
    initSearch();
    initReadingProgress();
    initCodeCopy();
    initBackToTop();
    initMemoHeatmap();
  });
})();
