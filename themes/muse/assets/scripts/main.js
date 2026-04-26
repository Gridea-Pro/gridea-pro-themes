/* ============================================================
 * Muse Theme — main.js
 * Gridea Pro Jinja2 主题（移植自 Typecho Xc-Three）
 * 纯原生 JS，无 jQuery 依赖
 * ============================================================ */
(function () {
  'use strict';

  // ---------- 主题配置桥（base.html 注入） ----------
  var CFG = (window.MUSE_CONFIG || {});

  // ============================================================
  // 1. 深浅模式（data-night 属性 + localStorage）
  // ============================================================
  function initThemeMode() {
    var root = document.documentElement;
    var KEY = 'data-night'; // 沿用原 Xc-Three 的 localStorage key

    function apply(isDark) {
      if (isDark) root.setAttribute('data-night', 'night');
      else root.removeAttribute('data-night');
    }

    function getCurrentDark() {
      return root.getAttribute('data-night') === 'night';
    }

    // 初始化
    var saved = localStorage.getItem(KEY);
    var mode = CFG.themeMode || 'auto';
    if (saved === 'night') apply(true);
    else if (saved === 'day') apply(false);
    else if (mode === 'dark') apply(true);
    else if (mode === 'light') apply(false);
    else if (mode === 'auto' && window.matchMedia &&
             window.matchMedia('(prefers-color-scheme: dark)').matches) apply(true);

    // 监听切换按钮
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.Xc_action_item.mode');
      if (!t) return;
      var nextDark = !getCurrentDark();
      apply(nextDark);
      localStorage.setItem(KEY, nextDark ? 'night' : 'day');
    });

    // 监听系统主题变化（仅 auto 模式）
    if (mode === 'auto' && window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      try {
        mq.addEventListener('change', function (e) {
          if (!localStorage.getItem(KEY)) apply(e.matches);
        });
      } catch (_) {}
    }
  }

  // ============================================================
  // 2. Splash 全屏开场（点击 / 滚动收起）
  // ============================================================
  function initSplash() {
    var splash = document.getElementById('splashContainer');
    if (!splash) return;
    var SESSION_KEY = 'muse-splash-shown';
    if (CFG.splashOnce && sessionStorage.getItem(SESSION_KEY)) {
      splash.style.display = 'none';
      return;
    }
    var scrollDown = document.getElementById('splash_scroll');
    function close() {
      splash.classList.add('scroll_up');
      sessionStorage.setItem(SESSION_KEY, '1');
      setTimeout(function () { splash.style.display = 'none'; }, 1300);
    }
    splash.addEventListener('click', function (e) {
      if (e.target !== scrollDown && (!scrollDown || !scrollDown.contains(e.target))) close();
    });
    if (scrollDown) scrollDown.addEventListener('click', close);
    // 鼠标滚轮也关闭
    splash.addEventListener('wheel', close, { passive: true });
  }

  // ============================================================
  // 3. 雪花飘浮 canvas 特效
  // ============================================================
  function initSnowflake() {
    if (!CFG.enableSnowflake) return;
    var canvas = document.getElementById('www_xccx_cc');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H;
    var flakes = [];
    var COUNT = parseInt(CFG.snowflakeCount, 10) || 60;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function makeFlake() {
      return {
        x: rand(0, W),
        y: rand(0, H),
        r: rand(1, 3.5),
        d: rand(0.4, 1.2),
        op: rand(0.4, 0.95)
      };
    }

    for (var i = 0; i < COUNT; i++) flakes.push(makeFlake());

    function isDark() {
      return document.documentElement.getAttribute('data-night') === 'night';
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      var color = isDark() ? (CFG.snowflakeColor || '#ffffff') : (CFG.primaryColor || '#306fff');
      // 颜色支持 #rrggbb；统一加 alpha
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(color, f.op * 0.6);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        f.y += f.d;
        f.x += Math.sin(f.y * 0.005) * 0.4;
        if (f.y > H + 5) {
          f.y = -5;
          f.x = rand(0, W);
        }
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  function hexToRgba(hex, alpha) {
    if (!hex) return 'rgba(255,255,255,' + alpha + ')';
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ============================================================
  // 4. 左侧栏移动端抽屉
  // ============================================================
  function initAsideDrawer() {
    var aside = document.querySelector('.aside-lefe');
    var mask = document.querySelector('.aside-lefea-masks');
    var hamburger = document.querySelector('.web-nav .wap_active');

    if (!aside || !hamburger) return;

    function open() {
      aside.classList.add('active');
      if (mask) mask.classList.add('active');
    }
    function close() {
      aside.classList.remove('active');
      if (mask) mask.classList.remove('active');
    }

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      aside.classList.contains('active') ? close() : open();
    });
    if (mask) mask.addEventListener('click', close);

    // 子菜单展开（panel）
    aside.addEventListener('click', function (e) {
      var trigger = e.target.closest('.link.panel');
      if (!trigger) return;
      e.preventDefault();
      var sub = trigger.parentElement.querySelector('.panel-body');
      if (sub) sub.style.display = (sub.style.display === 'block') ? 'none' : 'block';
    });
  }

  // ============================================================
  // 5. 顶部下拉搜索面板 + 搜索逻辑（fetch /api/search.json）
  // ============================================================
  function initSearch() {
    var panel = document.querySelector('.header_search');
    var trigger = document.querySelector('.header_internal-searchicon');
    if (!panel || !trigger) return;

    function show() { panel.style.display = 'block'; }
    function hide() { panel.style.display = 'none'; }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.style.display === 'block' ? hide() : show();
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && !trigger.contains(e.target)) hide();
    });
    // ESC / 快捷键
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hide();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        panel.style.display === 'block' ? hide() : show();
        var input = panel.querySelector('input[name="s"]');
        if (input) input.focus();
      }
    });

    // 搜索逻辑
    var form = panel.querySelector('form.search');
    var input = panel.querySelector('input[name="s"]');
    var resultsBox = panel.querySelector('.muse-search-results');
    if (!form || !input || !resultsBox) return;

    var INDEX = null;

    function loadIndex() {
      if (INDEX) return Promise.resolve(INDEX);
      return fetch('/api/search.json').then(function (r) {
        return r.ok ? r.json() : [];
      }).then(function (data) {
        INDEX = data || [];
        return INDEX;
      }).catch(function () { INDEX = []; return INDEX; });
    }

    function highlight(text, q) {
      if (!q) return text;
      var safe = String(text).replace(/</g, '&lt;');
      var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return safe.replace(re, '<mark>$1</mark>');
    }

    function search(q) {
      if (!q || q.length < 1) {
        resultsBox.innerHTML = '<p class="empty">输入关键字开始搜索</p>';
        return;
      }
      loadIndex().then(function (idx) {
        var qLower = q.toLowerCase();
        var hits = [];
        idx.forEach(function (e) {
          var score = 0;
          var title = (e.title || '').toLowerCase();
          var content = (e.content || '').toLowerCase();
          var tags = (e.tags || []).join(' ').toLowerCase();
          if (title.indexOf(qLower) !== -1) score += 5;
          if (tags.indexOf(qLower) !== -1) score += 3;
          if (content.indexOf(qLower) !== -1) score += 1;
          if (score > 0) hits.push({ e: e, score: score });
        });
        hits.sort(function (a, b) { return b.score - a.score; });
        if (!hits.length) {
          resultsBox.innerHTML = '<p class="empty">未找到匹配的文章</p>';
          return;
        }
        var html = hits.slice(0, 10).map(function (h) {
          var e = h.e;
          var tags = (e.tags || []).map(function (t) {
            return '<span class="item-tag">' + String(t).replace(/</g, '&lt;') + '</span>';
          }).join('');
          return '<a class="item" href="' + e.link + '">'
            + '<div class="item-title">' + highlight(e.title, q) + '</div>'
            + '<div class="item-meta">' + tags + (e.date || '') + '</div>'
            + '</a>';
        }).join('');
        resultsBox.innerHTML = html;
      });
    }

    var t;
    input.addEventListener('input', function () {
      clearTimeout(t);
      var q = input.value.trim();
      t = setTimeout(function () { search(q); }, 200);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      search(input.value.trim());
    });
  }

  // ============================================================
  // 6. 阅读进度条（仅 article 页）
  // ============================================================
  function initReadingProgress() {
    if (!CFG.showReadingProgress) return;
    var post = document.querySelector('.muse-post-body');
    if (!post) return;
    var bar = document.getElementById('muse-reading-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'muse-reading-progress';
      document.body.appendChild(bar);
    }
    function update() {
      var rect = post.getBoundingClientRect();
      var total = rect.height + rect.top - window.innerHeight;
      var scrolled = -rect.top;
      var ratio = Math.max(0, Math.min(1, scrolled / total));
      bar.style.width = (ratio * 100) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ============================================================
  // 7. 回到顶部
  // ============================================================
  function initBackToTop() {
    if (!CFG.showBackToTop) return;
    var btn = document.querySelector('.muse-back-to-top');
    if (!btn) return;
    function check() {
      btn.classList.toggle('visible', window.scrollY > 320);
    }
    window.addEventListener('scroll', check, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    check();
  }

  // ============================================================
  // 8. 代码复制
  // ============================================================
  function initCodeCopy() {
    if (!CFG.showCodeCopy) return;
    document.querySelectorAll('.muse-post-body pre').forEach(function (pre) {
      var btn = document.createElement('button');
      btn.className = 'muse-code-copy';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        var text = code.innerText;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = '已复制';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 1500);
        }).catch(function () {});
      });
      pre.appendChild(btn);
    });
  }

  // ============================================================
  // 9. 闪念热力图（动态填色）
  // ============================================================
  function initHeatmap() {
    var grid = document.querySelector('.muse-heatmap-grid');
    if (!grid) return;
    var memos = JSON.parse(grid.getAttribute('data-memos') || '[]');
    var counts = {};
    memos.forEach(function (d) {
      counts[d] = (counts[d] || 0) + 1;
    });

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var start = new Date(today);
    start.setDate(start.getDate() - 53 * 7 + (6 - today.getDay()));

    grid.innerHTML = '';
    for (var col = 0; col < 53; col++) {
      for (var row = 0; row < 7; row++) {
        var d = new Date(start);
        d.setDate(d.getDate() + col * 7 + row);
        var key = d.toISOString().slice(0, 10);
        var c = counts[key] || 0;
        var lvl = c === 0 ? 0 : c <= 1 ? 1 : c <= 3 ? 2 : c <= 6 ? 3 : 4;
        var cell = document.createElement('div');
        cell.className = 'muse-heat-cell' + (lvl ? ' lvl-' + lvl : '');
        cell.title = key + ': ' + c + ' 条';
        cell.style.gridColumn = (col + 1);
        cell.style.gridRow = (row + 1);
        grid.appendChild(cell);
      }
    }
  }

  // ============================================================
  // 10. 首页 Swiper（如果 Swiper 库可用），否则降级为简易轮播
  // ============================================================
  function initSwiper() {
    var el = document.querySelector('.swiper-container');
    if (!el) return;
    if (typeof Swiper !== 'undefined') {
      try {
        new Swiper('.swiper-container', {
          loop: true,
          autoplay: { delay: 3500, disableOnInteraction: false },
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
        });
        return;
      } catch (_) {}
    }
    // 降级：纯 CSS 轮播 + 自动切换
    var slides = el.querySelectorAll('.swiper-slide');
    if (slides.length <= 1) return;
    var idx = 0;
    slides.forEach(function (s, i) { s.style.display = (i === 0 ? 'block' : 'none'); });
    setInterval(function () {
      slides[idx].style.display = 'none';
      idx = (idx + 1) % slides.length;
      slides[idx].style.display = 'block';
    }, 4000);
  }

  // ============================================================
  // 11. 顶栏 hover 效果（导航 tip 显示）
  // ============================================================
  function initHeaderHover() {
    document.querySelectorAll('.Xc_heaer_nav').forEach(function (item) {
      item.addEventListener('mouseenter', function () { this.classList.add('active'); });
      item.addEventListener('mouseleave', function () { this.classList.remove('active'); });
    });
  }

  // ============================================================
  // 12. 文章 TOC 滚动高亮 active
  // ============================================================
  function initTocScrollSpy() {
    var toc = document.querySelector('.muse-toc');
    if (!toc) return;
    var links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    var headings = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var h = document.getElementById(id);
      if (h) headings.push({ link: a, target: h });
    });
    function update() {
      var top = window.scrollY + 80;
      var current = null;
      headings.forEach(function (item) {
        if (item.target.offsetTop <= top) current = item;
      });
      links.forEach(function (a) { a.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ============================================================
  // 启动
  // ============================================================
  function boot() {
    initThemeMode();
    initSplash();
    initSnowflake();
    initAsideDrawer();
    initSearch();
    initReadingProgress();
    initBackToTop();
    initCodeCopy();
    initHeatmap();
    initSwiper();
    initHeaderHover();
    initTocScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
