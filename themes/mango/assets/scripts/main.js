/* ============================================================
   Mango theme · Gridea Pro Jinja2 移植版
   原始 main.js 由 jkjoy / 老孙 / HUiTHEME 编写
   本文件是 Gridea Pro 移植后的客户端 JS 全集，覆盖：
     · 主题切换（theme-switch / 顶栏按钮）
     · 自定义 offcanvas（移动菜单 / 全屏搜索）
     · 顶栏导航 hover 子菜单（jQuery）
     · 文章详情页：阅读进度条、客户端 TOC、代码块复制、上下篇 / 相关文章
     · 闪念页：53×7 热力图
     · 列表页：fancybox 多图、缩略图 fallback
     · 全站：站外链接打开新窗口、回到顶部、点赞（localStorage-only）
     · 搜索：本地 fetch /atom.xml，实时关键词过滤
   ============================================================ */
(function ($) {
  'use strict';

  /* ---------- 工具函数 ---------- */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /* ---------- 轻量提示条 ---------- */
  function mangoToast(message, type) {
    type = type || 'info';
    if (!message) return;
    if (!document.getElementById('mango-toast-style')) {
      var style = document.createElement('style');
      style.id = 'mango-toast-style';
      style.textContent =
        '.mango-toast-wrap{position:fixed;left:0;right:0;bottom:18px;z-index:99999;display:flex;justify-content:center;pointer-events:none;padding:0 12px}' +
        '.mango-toast{pointer-events:auto;max-width:520px;width:max-content;min-width:160px;padding:10px 14px;border-radius:12px;border:1px solid rgba(0,0,0,.10);background:#fff;color:#111827;box-shadow:0 10px 28px rgba(17,24,39,.12);font-size:14px;line-height:1.6;opacity:0;transform:translateY(6px);transition:opacity .18s ease,transform .18s ease}' +
        '.mango-toast.show{opacity:1;transform:translateY(0)}' +
        '.mango-toast.success{border-color:rgba(16,185,129,.25)}' +
        '.mango-toast.warning{border-color:rgba(245,158,11,.25)}' +
        '.mango-toast.error{border-color:rgba(239,68,68,.25)}' +
        '.dark .mango-toast{background:#111827;color:rgba(255,255,255,.9);border-color:rgba(255,255,255,.12);box-shadow:none}';
      document.head.appendChild(style);
    }
    var wrap = document.querySelector('.mango-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'mango-toast-wrap';
      document.body.appendChild(wrap);
    }
    var t = document.createElement('div');
    t.className = 'mango-toast ' + type;
    t.textContent = message;
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 220);
    }, 2200);
  }

  /* ---------- 自定义 offcanvas（替代 Bootstrap JS 依赖） ---------- */
  function mangoOffcanvasShow(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('show');
    el.setAttribute('aria-hidden', 'false');
    var backdrop = document.createElement('div');
    backdrop.className = 'mango-offcanvas-backdrop';
    backdrop.dataset.mangoBackdropFor = id;
    backdrop.addEventListener('click', function () { mangoOffcanvasHide(id); });
    document.body.appendChild(backdrop);
    document.body.classList.add('mango-offcanvas-open');
    setTimeout(function () { backdrop.classList.add('show'); }, 10);
    if (id === 'c_sousuo') {
      var input = document.getElementById('mango-search-input');
      if (input) setTimeout(function () { input.focus(); }, 80);
    }
  }
  function mangoOffcanvasHide(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
    var bd = document.querySelector('.mango-offcanvas-backdrop[data-mango-backdrop-for="' + id + '"]');
    if (bd) {
      bd.classList.remove('show');
      setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); }, 200);
    }
    if (!document.querySelector('.mango-offcanvas-backdrop')) {
      document.body.classList.remove('mango-offcanvas-open');
    }
  }

  ready(function () {
    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest('[data-mango-toggle]');
      if (openTrigger) {
        e.preventDefault();
        mangoOffcanvasShow(openTrigger.getAttribute('data-mango-toggle'));
        return;
      }
      var closeTrigger = e.target.closest('[data-mango-dismiss]');
      if (closeTrigger) {
        e.preventDefault();
        mangoOffcanvasHide(closeTrigger.getAttribute('data-mango-dismiss'));
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.offcanvas.show').forEach(function (el) {
          mangoOffcanvasHide(el.id);
        });
      }
    });
  });

  /* ---------- 顶栏导航子菜单 hover 展开 ---------- */
  function bindMainMenuHover() {
    if (!window.jQuery) return;
    $('.header-menu-ul .menu-item-has-children').hover(
      function () { $(this).children('ul.sub-menu').stop(true, true).fadeIn(120); },
      function () { $(this).children('ul.sub-menu').stop(true, true).fadeOut(120); }
    );
  }

  /* ---------- 移动菜单子菜单展开 ---------- */
  function bindMobileMenuToggle() {
    if (!window.jQuery) return;
    $('.menu-zk .menu-item-has-children').each(function () {
      if (!$(this).children('.czxjcdbs').length) {
        $(this).prepend('<span class="czxjcdbs"></span>');
      }
    });
    $(document).off('click.mango-mobile-sub').on('click.mango-mobile-sub', '.menu-zk li.menu-item-has-children .czxjcdbs', function () {
      $(this).toggleClass('kai');
      $(this).nextAll('.sub-menu').slideToggle('slow');
    });
  }

  /* ---------- 回到顶部 ---------- */
  function bindBackToTop() {
    var btn = document.querySelector('.scrollToTopBtn');
    if (!btn) return;
    var root = document.documentElement;
    function onScroll() {
      var total = root.scrollHeight - root.clientHeight;
      if (total > 0 && root.scrollTop / total > 0.2) btn.classList.add('showBtn');
      else btn.classList.remove('showBtn');
    }
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 阅读进度条（仅文章页 ≥ 1.5 屏） ---------- */
  function bindReadingProgress() {
    if (!window.MangoConfig || !window.MangoConfig.showReadingProgress) return;
    var bar = document.querySelector('#reading-progress span');
    var wznrys = document.querySelector('.wznrys');
    if (!bar || !wznrys) return;

    var enable = false;
    function recompute() {
      var minHeight = window.innerHeight * 1.5;
      enable = wznrys.offsetHeight >= minHeight;
      bar.parentNode.style.display = enable ? 'block' : 'none';
    }
    function tick() {
      if (!enable) return;
      var rect = wznrys.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      var total = wznrys.offsetHeight - window.innerHeight;
      var p = Math.max(0, Math.min(1, (window.scrollY - top + window.innerHeight * 0.3) / total));
      bar.style.width = (p * 100).toFixed(2) + '%';
    }
    recompute();
    window.addEventListener('resize', debounce(recompute, 120));
    document.addEventListener('scroll', tick, { passive: true });
  }

  /* ---------- 客户端 TOC（解析正文 h2/h3） ---------- */
  function buildToc() {
    if (!window.MangoConfig || !window.MangoConfig.showSidebarToc) return;
    var hostBox = document.querySelector('[data-mango-toc]');
    var content = document.querySelector('.wznrys');
    if (!hostBox || !content) return;
    var heads = content.querySelectorAll('h2, h3');
    if (!heads.length) return;

    var html = '<ul>';
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'mango-toc-' + i;
      var lvl = h.tagName.toLowerCase();
      html += '<li class="toc-' + lvl + '"><a href="#' + h.id + '">' + escapeHtml(h.textContent) + '</a></li>';
    });
    html += '</ul>';
    var holder = hostBox.querySelector('.toc-content');
    if (holder) holder.innerHTML = html;
    hostBox.style.display = 'block';

    // 当前激活项
    var links = hostBox.querySelectorAll('a');
    function activate() {
      var topY = window.scrollY + 120;
      var current = null;
      heads.forEach(function (h) {
        if (h.offsetTop <= topY) current = h;
      });
      links.forEach(function (a) {
        a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
      });
    }
    document.addEventListener('scroll', debounce(activate, 100), { passive: true });
    activate();
  }

  /* ---------- 代码块复制按钮 ---------- */
  function bindCodeCopy() {
    if (!window.MangoConfig || !window.MangoConfig.showCodeCopy) return;
    document.querySelectorAll('.wznrys pre').forEach(function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;

      // 提取语言
      var lang = '';
      var cls = code.className || '';
      var m = cls.match(/(?:^|\s)(?:lang|language)-([a-z0-9_+#-]+)/i);
      if (m) lang = m[1];

      if (lang && !pre.querySelector('.code-lang-label')) {
        var label = document.createElement('span');
        label.className = 'code-lang-label';
        label.textContent = lang.toUpperCase();
        pre.appendChild(label);
      }

      if (pre.querySelector('.copy-code-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-code-btn';
      btn.textContent = 'Copy';
      pre.appendChild(btn);

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var text = code.textContent;
        function ok() {
          btn.classList.add('copied'); btn.textContent = 'Copied!';
          setTimeout(function () { btn.classList.remove('copied'); btn.textContent = 'Copy'; }, 2000);
        }
        function fail() {
          btn.textContent = 'Failed';
          setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(ok).catch(fail);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy') ? ok() : fail(); } catch (err) { fail(); }
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------- 列表缩略图加载失败兜底 ---------- */
  function bindThumbnailFallback() {
    document.querySelectorAll('img.post-thumbnail').forEach(function (img) {
      if (img.dataset.fallbackBound === '1') return;
      img.dataset.fallbackBound = '1';
      img.addEventListener('error', function () {
        var fb = img.getAttribute('data-fallback');
        if (fb && img.src !== fb) img.src = fb;
      });
    });
  }

  /* ---------- 站外链接打开新窗口（noopener） ---------- */
  function bindExternalLinks() {
    document.querySelectorAll('.wznrys a[href], .comment-content a[href]').forEach(function (a) {
      if (a.dataset.mangoLinkBound === '1') return;
      a.dataset.mangoLinkBound = '1';
      if (a.hasAttribute('download')) return;
      var href = (a.getAttribute('href') || '').trim();
      if (!href || href.charAt(0) === '#') return;
      if (/^javascript:/i.test(href)) return;
      var url;
      try { url = new URL(href, window.location.href); } catch (e) { return; }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.host === window.location.host) return;
      a.setAttribute('target', '_blank');
      var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(function (v) {
        if (rel.indexOf(v) === -1) rel.push(v);
      });
      a.setAttribute('rel', rel.join(' '));
    });
  }

  /* ---------- 点赞（localStorage-only，无后端） ---------- */
  function loadLikes() {
    try { return JSON.parse(localStorage.getItem('mango-likes') || '{}'); } catch (e) { return {}; }
  }
  function saveLikes(map) {
    localStorage.setItem('mango-likes', JSON.stringify(map));
  }
  function bindLikes() {
    var likes = loadLikes();
    document.querySelectorAll('.specsZan[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id');
      var count = el.querySelector('.count');
      if (count) count.textContent = likes[id] ? likes[id].count : 0;
      if (likes[id] && likes[id].mine) el.classList.add('done');
    });
    document.addEventListener('click', function (e) {
      var el = e.target.closest('.specsZan[data-id]');
      if (!el) return;
      e.preventDefault();
      var id = el.getAttribute('data-id');
      var data = loadLikes();
      var rec = data[id] || { count: 0, mine: false };
      if (rec.mine) { mangoToast('已经点过赞啦', 'warning'); return; }
      rec.count = (rec.count || 0) + 1;
      rec.mine = true;
      data[id] = rec;
      saveLikes(data);
      document.querySelectorAll('.specsZan[data-id="' + id + '"]').forEach(function (e2) {
        e2.classList.add('done');
        var c = e2.querySelector('.count');
        if (c) c.textContent = rec.count;
      });
      mangoToast('感谢点赞！', 'success');
    });
  }

  /* ---------- 推荐位轮播 ---------- */
  function bindCarousel() {
    var root = document.querySelector('[data-mango-carousel]');
    if (!root) return;
    var items = root.querySelectorAll('.carousel-item');
    var indicators = root.querySelectorAll('.carousel-indicators button');
    if (items.length <= 1) return;
    var current = 0, timer = null, interval = 5000;

    function go(idx) {
      if (idx === current) return;
      items[current].classList.remove('active');
      items[idx].classList.add('active');
      if (indicators[current]) indicators[current].classList.remove('active');
      if (indicators[idx]) indicators[idx].classList.add('active');
      current = idx;
    }
    function next() { go((current + 1) % items.length); }
    function prev() { go((current - 1 + items.length) % items.length); }
    function play() { stop(); timer = setInterval(next, interval); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    root.querySelectorAll('[data-mango-slide="prev"]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); prev(); });
    });
    root.querySelectorAll('[data-mango-slide="next"]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); next(); });
    });
    indicators.forEach(function (ind, i) {
      ind.addEventListener('click', function () { go(i); });
    });

    // 触摸滑动
    var sx = 0, ex = 0;
    root.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchmove', function (e) { ex = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function () {
      var d = sx - ex;
      if (Math.abs(d) > 50) { d > 0 ? next() : prev(); }
      play();
    });

    play();
  }

  /* ---------- 闪念热力图（53 周 × 7 天） ---------- */
  function buildMemosHeatmap() {
    var box = document.querySelector('[data-mango-heatmap]');
    var dataEl = document.getElementById('mango-memos-data');
    if (!box || !dataEl) return;
    var raw = [];
    try { raw = JSON.parse(dataEl.textContent || '[]'); } catch (e) { raw = []; }

    // 统计每个日期发的条数
    var counts = {};
    raw.forEach(function (m) {
      if (!m || !m.date) return;
      var d = new Date(m.date);
      if (isNaN(d.getTime())) return;
      var key = d.toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    });

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = 53 * 7;
    var start = new Date(today);
    start.setDate(start.getDate() - days + 1);
    // 对齐到周日
    while (start.getDay() !== 0) { start.setDate(start.getDate() - 1); }

    var weeks = [];
    var d = new Date(start);
    while (d <= today) {
      var week = [];
      for (var i = 0; i < 7; i++) {
        var key = d.toISOString().slice(0, 10);
        var c = counts[key] || 0;
        var lvl = c === 0 ? 0 : c < 2 ? 1 : c < 4 ? 2 : c < 7 ? 3 : 4;
        week.push({ key: key, count: c, lvl: lvl });
        d.setDate(d.getDate() + 1);
      }
      weeks.push(week);
    }

    var html = '<div class="mango-heatmap-grid">';
    weeks.forEach(function (wk) {
      html += '<div class="mango-heatmap-week">';
      wk.forEach(function (cell) {
        html += '<i class="mango-heatmap-cell lvl' + cell.lvl + '" title="' + cell.key + ' · ' + cell.count + ' 条"></i>';
      });
      html += '</div>';
    });
    html += '</div>';
    box.innerHTML = html;
  }

  /* ---------- 搜索（fetch /atom.xml） ---------- */
  var searchIndex = null;
  var searchLoading = false;

  function loadSearchIndex() {
    if (searchIndex || searchLoading) return Promise.resolve(searchIndex);
    searchLoading = true;
    return fetch('/atom.xml').then(function (r) {
      if (!r.ok) throw new Error('atom.xml not found');
      return r.text();
    }).then(function (text) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(text, 'application/xml');
      var entries = doc.querySelectorAll('entry');
      var list = [];
      entries.forEach(function (e) {
        var title = (e.querySelector('title') || {}).textContent || '';
        var link = (e.querySelector('link') || {}).getAttribute && e.querySelector('link').getAttribute('href');
        var summary = (e.querySelector('summary') || e.querySelector('content') || {}).textContent || '';
        var date = (e.querySelector('updated') || e.querySelector('published') || {}).textContent || '';
        var tags = [];
        e.querySelectorAll('category').forEach(function (c) {
          var t = c.getAttribute && c.getAttribute('term');
          if (t) tags.push(t);
        });
        list.push({
          title: title,
          link: link,
          summary: (summary || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200),
          date: date,
          tags: tags
        });
      });
      searchIndex = list;
      searchLoading = false;
      return list;
    }).catch(function () {
      searchLoading = false;
      return [];
    });
  }

  function bindSearch() {
    if (!window.MangoConfig || !window.MangoConfig.searchEnabled) return;
    var input = document.getElementById('mango-search-input');
    var box = document.getElementById('mango-search-results');
    if (!input || !box) return;

    var doSearch = debounce(function () {
      var q = (input.value || '').trim().toLowerCase();
      if (!q) { box.innerHTML = ''; return; }
      loadSearchIndex().then(function (list) {
        var matches = list.filter(function (item) {
          return item.title.toLowerCase().indexOf(q) !== -1 ||
                 item.summary.toLowerCase().indexOf(q) !== -1 ||
                 item.tags.join(' ').toLowerCase().indexOf(q) !== -1;
        }).slice(0, 12);
        if (!matches.length) {
          box.innerHTML = '<p class="mango-search-empty">没有匹配 “' + escapeHtml(q) + '” 的文章</p>';
          return;
        }
        box.innerHTML = matches.map(function (m) {
          return '<a class="mango-search-result" href="' + m.link + '">' +
                   '<strong>' + highlight(m.title, q) + '</strong>' +
                   '<span class="mango-search-snippet">' + highlight(m.summary, q) + '</span>' +
                 '</a>';
        }).join('');
      });
    }, 200);

    function highlight(text, q) {
      if (!q) return escapeHtml(text);
      var safe = escapeHtml(text);
      var re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
      return safe.replace(re, function (m) { return '<mark>' + m + '</mark>'; });
    }

    input.addEventListener('input', doSearch);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var first = box.querySelector('.mango-search-result');
        if (first) first.click();
      }
    });
  }

  /* ---------- 上下篇 + 相关文章（fetch atom.xml） ---------- */
  function bindPostNav() {
    var holder = document.querySelector('[data-mango-prevnext]');
    if (!holder) return;
    var slug = holder.getAttribute('data-mango-prevnext');
    loadSearchIndex().then(function (list) {
      if (!list.length) return;
      // 假设 atom 的 link 末尾以 /post/<slug>/ 格式
      var idx = -1;
      for (var i = 0; i < list.length; i++) {
        if ((list[i].link || '').indexOf('/' + slug + '/') !== -1 ||
            (list[i].link || '').indexOf(slug) !== -1) {
          idx = i; break;
        }
      }
      if (idx === -1) return;
      var prev = list[idx - 1]; // 列表通常按时间倒序，prev = 更新的（=上一篇按发布时间是更早的，但展示上"上一篇"=更老）
      var next = list[idx + 1];
      // Mango 视觉里：上一篇=更老，下一篇=更新。atom 通常倒序，则 idx-1=更新，idx+1=更老
      // 我们按 atom 倒序的语义：更新=下一篇，更老=上一篇
      var newer = list[idx - 1], older = list[idx + 1];
      var prevBox = holder.querySelector('.nav_previous');
      var nextBox = holder.querySelector('.nav_next');
      if (older && prevBox) {
        prevBox.innerHTML = '<a href="' + older.link + '" rel="prev"><div class="prev_next_info"><small>上一篇</small><p>' + escapeHtml(older.title) + '</p></div></a>';
      } else if (prevBox) {
        prevBox.style.display = 'none';
      }
      if (newer && nextBox) {
        nextBox.innerHTML = '<a href="' + newer.link + '" rel="next"><div class="prev_next_info"><small>下一篇</small><p>' + escapeHtml(newer.title) + '</p></div></a>';
      } else if (nextBox) {
        nextBox.style.display = 'none';
      }
      if ((!older || !newer) && (older || newer)) {
        var only = holder.querySelector('.nav_previous a, .nav_next a');
        if (only) only.parentElement.style.width = '100%';
      }

      // 相关文章：取同 tag 的另外 5 篇（fetch atom 已有 tags）
      var current = list[idx];
      if (!current.tags.length) return;
      var related = list.filter(function (p) {
        if (p.link === current.link) return false;
        return p.tags.some(function (t) { return current.tags.indexOf(t) !== -1; });
      }).slice(0, 5);
      var relBox = document.querySelector('[data-mango-related]');
      if (relBox && related.length) {
        var listEl = relBox.querySelector('.post_related_list_wrap');
        if (listEl) {
          listEl.innerHTML = related.map(function (p) {
            return '<div class="post_related_list"><a href="' + p.link + '">' + escapeHtml(p.title) + '</a></div>';
          }).join('');
        }
        relBox.style.display = '';
      }
    });
  }

  /* ---------- fancybox 多图（如果有则启用） ---------- */
  function bindFancybox() {
    if (typeof window.Fancybox !== 'undefined') {
      try { window.Fancybox.bind('[data-fancybox]'); } catch (e) {}
    } else if (window.jQuery && $.fn.fancybox) {
      try { $('[data-fancybox]').fancybox({}); } catch (e) {}
    }
  }

  /* ---------- 表格响应式包装 ---------- */
  function wrapTables() {
    document.querySelectorAll('.wznrys table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('mango-table-wrap')) return;
      table.classList.add('table');
      var wrap = document.createElement('div');
      wrap.className = 'mango-table-wrap';
      table.parentElement.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /* ---------- 总入口 ---------- */
  ready(function () {
    bindMainMenuHover();
    bindMobileMenuToggle();
    bindBackToTop();
    bindReadingProgress();
    buildToc();
    bindCodeCopy();
    bindThumbnailFallback();
    bindExternalLinks();
    bindLikes();
    bindCarousel();
    buildMemosHeatmap();
    bindSearch();
    bindPostNav();
    bindFancybox();
    wrapTables();
  });

  // 暴露给外部使用
  window.mangoToast = mangoToast;
})(window.jQuery);
