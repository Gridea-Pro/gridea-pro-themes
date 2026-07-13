/* ============================================================
 * Simplecho — main.js
 * 全部功能纯原生实现，零依赖：
 *   - 4 套配色切换（gray / white / green / black）+ 跟随浏览器深色
 *   - 阅读进度条 / 返回顶部
 *   - 代码块复制
 *   - 图片懒加载（IntersectionObserver 兜底）
 *   - 移动端导航栏折叠
 *   - 全文搜索（基于 /api/search.json）
 *   - 当前菜单项高亮
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 读取主题运行时配置 ---------- */
  var SC_CONFIG = (function () {
    try {
      var node = document.getElementById('simplecho-config');
      return node ? JSON.parse(node.textContent || node.innerText) : {};
    } catch (e) { return {}; }
  })();
  var STORAGE_KEY = 'simplecho-palette';
  var VALID = ['gray', 'white', 'green', 'black'];

  /* ---------- 工具函数 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- 配色切换 ---------- */
  function applyPalette(palette) {
    if (VALID.indexOf(palette) === -1) return;
    document.documentElement.setAttribute('data-sc-palette', palette);
    $$('[data-sc-set-palette]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-sc-set-palette') === palette ? 'true' : 'false');
    });
  }
  function initPaletteSwitcher() {
    // 当前激活态高亮
    applyPalette(document.documentElement.getAttribute('data-sc-palette') || SC_CONFIG.themePalette || 'gray');

    $$('[data-sc-set-palette]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var palette = btn.getAttribute('data-sc-set-palette');
        try { localStorage.setItem(STORAGE_KEY, palette); } catch (e) { /* ignore */ }
        applyPalette(palette);
      });
    });

    // 跟随浏览器深色：如果用户没有手动设置过，且 themeAutoDark 开启
    if (SC_CONFIG.themeAutoDark && window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var listener = function (e) {
        try {
          if (localStorage.getItem(STORAGE_KEY)) return; // 用户手动选过，则不再跟随
        } catch (err) { /* ignore */ }
        applyPalette(e.matches ? 'black' : (SC_CONFIG.themePalette || 'gray'));
      };
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', listener);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(listener);
      }
    }
  }

  /* ---------- 阅读进度条 ---------- */
  function initReadingProgress() {
    if (!SC_CONFIG.showReadingProgress) return;
    var bar = $('#sc-reading-progress');
    var content = $('#sc-post-content');
    if (!bar || !content) return;

    var update = function () {
      var rect = content.getBoundingClientRect();
      var top = window.scrollY || window.pageYOffset;
      var contentTop = top + rect.top;
      var contentHeight = content.offsetHeight;
      var viewport = window.innerHeight;
      var scrolled = top - contentTop + viewport;
      var ratio = Math.max(0, Math.min(1, scrolled / contentHeight));
      bar.style.width = (ratio * 100).toFixed(2) + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- 返回顶部 ---------- */
  function initBackToTop() {
    if (!SC_CONFIG.showBackToTop) return;
    var btn = $('#sc-back-to-top');
    if (!btn) return;

    var toggle = function () {
      if ((window.scrollY || window.pageYOffset) > 400) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 代码块复制按钮 ---------- */
  function initCodeCopy() {
    if (!SC_CONFIG.showCodeCopy) return;
    var blocks = $$('#sc-post-content pre');
    blocks.forEach(function (pre) {
      if (pre.querySelector('.sc-code-copy')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sc-code-copy';
      btn.textContent = '复制';
      btn.setAttribute('aria-label', '复制代码');
      pre.appendChild(btn);

      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        var text = code.innerText;
        var done = function () {
          btn.textContent = '已复制';
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('is-copied');
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
        } else {
          fallback(text, done);
        }
      });
    });

    function fallback(text, done) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  /* ---------- 图片懒加载（IntersectionObserver 兜底） ---------- */
  function initLazyLoad() {
    if (!SC_CONFIG.showLazyLoad) return;
    if (!('IntersectionObserver' in window)) return;
    var imgs = $$('#sc-post-content img');
    imgs.forEach(function (img) {
      // 已有 native loading="lazy" 由浏览器接管，这里仅给没有 src 但有 data-src 的图做兜底
      if (img.hasAttribute('loading')) return;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  }

  /* ---------- 移动端导航栏折叠 ---------- */
  function initNavbarToggler() {
    var toggler = $('#sc-navbar-toggler');
    var collapse = $('#sc-navbar-collapse');
    if (!toggler || !collapse) return;
    toggler.addEventListener('click', function () {
      var open = collapse.classList.toggle('is-open');
      toggler.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- 当前菜单项高亮 ---------- */
  function initActiveMenu() {
    var current = location.pathname.replace(/\/$/, '') || '/';
    $$('.sc-nav-item a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (href === current) a.style.background = 'linear-gradient(180deg, transparent 75%, var(--sc-accent-hl) 0)';
    });
  }

  /* ---------- 全文搜索 ---------- */
  function initSearch() {
    if (!SC_CONFIG.showSearch) return;
    var input = $('#sc-search-input');
    var results = $('#sc-search-results');
    if (!input || !results) return;

    var indexCache = null;
    var fetchIndex = function () {
      if (indexCache) return Promise.resolve(indexCache);
      return fetch('/api/search.json').then(function (r) {
        if (!r.ok) throw new Error('search.json ' + r.status);
        return r.json();
      }).then(function (data) {
        // 兼容 Array 或 { posts: [...] }
        indexCache = Array.isArray(data) ? data : (data.posts || []);
        return indexCache;
      }).catch(function (err) {
        console.warn('[simplecho] 搜索索引加载失败：', err);
        indexCache = [];
        return [];
      });
    };

    var render = function (matches) {
      if (!matches.length) {
        results.innerHTML = '<div class="sc-search-result-item" style="color:var(--sc-text-2)">没有找到匹配文章</div>';
        results.classList.add('is-open');
        return;
      }
      results.innerHTML = matches.slice(0, 8).map(function (p) {
        var title = (p.title || '无标题').replace(/[<>&"']/g, function (c) {
          return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c];
        });
        var link = p.link || p.url || '#';
        return '<a class="sc-search-result-item" href="' + link + '">' + title + '</a>';
      }).join('');
      results.classList.add('is-open');
    };

    var doSearch = function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { results.classList.remove('is-open'); return; }
      fetchIndex().then(function (list) {
        var matches = list.filter(function (p) {
          var hay = ((p.title || '') + ' ' + (p.content || '') + ' ' + (p.description || '')).toLowerCase();
          return hay.indexOf(q) > -1;
        });
        render(matches);
      });
    };

    var debounce = function (fn, wait) {
      var t;
      return function () {
        clearTimeout(t);
        var args = arguments, ctx = this;
        t = setTimeout(function () { fn.apply(ctx, args); }, wait);
      };
    };

    input.addEventListener('input', debounce(doSearch, 180));
    input.addEventListener('focus', function () { if (input.value.trim()) doSearch(); });
    document.addEventListener('click', function (e) {
      if (!results.contains(e.target) && e.target !== input) results.classList.remove('is-open');
    });
  }

  /* ---------- 启动 ---------- */
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  ready(function () {
    initPaletteSwitcher();
    initReadingProgress();
    initBackToTop();
    initCodeCopy();
    initLazyLoad();
    initNavbarToggler();
    initActiveMenu();
    initSearch();
  });
})();
