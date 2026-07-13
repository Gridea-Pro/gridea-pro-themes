/* ============================================================================
   Fluid — Theme JS
   Native JS, zero dependencies. Replicates Hexo Fluid's typed.js / scroll-arrow
   / navbar collapse / mobile grid menu / dark-mode / search / heatmap / code copy.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Read theme config ---------- */
  var cfg = {
    themeMode: 'auto',
    enableTyped: true,
    typedStrings: [],
    showReadingProgress: true,
    showBackToTop: true,
    showCodeCopy: true,
    showSearch: true,
    memosShowHeatmap: true,
    openExternalInNewTab: true
  };
  try {
    var cfgEl = document.getElementById('fluid-config');
    if (cfgEl && cfgEl.textContent) {
      var parsed = JSON.parse(cfgEl.textContent);
      Object.keys(parsed).forEach(function (k) { cfg[k] = parsed[k]; });
    }
    var tsEl = document.getElementById('fluid-typed-strings');
    if (tsEl && tsEl.textContent) {
      cfg.typedStrings = tsEl.textContent.split(/\n+/).map(function (s) {
        return s.trim();
      }).filter(Boolean);
    }
  } catch (e) {}

  var STORAGE_THEME = 'fluid-theme';

  /* ============================================================================
     1. Theme toggle (light / dark)
     ========================================================================== */
  function applyTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-user-color-scheme', 'dark');
    } else if (mode === 'light') {
      document.documentElement.setAttribute('data-user-color-scheme', 'light');
    } else {
      document.documentElement.removeAttribute('data-user-color-scheme');
    }
    var icons = document.querySelectorAll('[data-action="toggle-theme"] .icon-theme');
    icons.forEach(function (icon) {
      icon.innerHTML = (mode === 'dark')
        ? '<use xlink:href="#icon-sun"/>'
        : '<use xlink:href="#icon-moon"/>';
    });
  }

  function currentMode() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_THEME); } catch (e) {}
    if (stored === 'dark' || stored === 'light') return stored;
    if (cfg.themeMode === 'dark' || cfg.themeMode === 'light') return cfg.themeMode;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  function bindThemeToggle() {
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = (currentMode() === 'dark') ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_THEME, next); } catch (e) {}
        applyTheme(next);
      });
    });
    applyTheme(currentMode());
  }

  /* ============================================================================
     2. Navbar collapse on scroll (transparent → solid background)
     ========================================================================== */
  function bindNavbarScroll() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;
    // If page has no banner (height-inner), navbar starts collapsed
    var hasBanner = !!document.querySelector('.header-inner');
    if (!hasBanner) {
      navbar.classList.add('top-nav-collapse');
      return;
    }
    function update() {
      var scrolled = window.scrollY > 50;
      navbar.classList.toggle('top-nav-collapse', scrolled);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================================================
     3. Mobile grid menu (toggle navbar hamburger)
     ========================================================================== */
  function bindMobileMenu() {
    var btn = document.getElementById('navbar-toggler-btn');
    var grid = document.getElementById('mobile-grid-menu');
    if (!btn || !grid) return;
    var icon = btn.querySelector('.animated-icon');
    btn.addEventListener('click', function () {
      var open = grid.classList.toggle('show');
      if (icon) icon.classList.toggle('open', open);
      document.body.classList.toggle('mobile-menu-open', open);
    });
    // Close on resize > 992
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992 && grid.classList.contains('show')) {
        grid.classList.remove('show');
        if (icon) icon.classList.remove('open');
        document.body.classList.remove('mobile-menu-open');
      }
    });
  }

  /* ============================================================================
     4. Scroll-down arrow → smooth scroll past banner
     ========================================================================== */
  function bindScrollDown() {
    var arrow = document.querySelector('.scroll-down-bar');
    if (!arrow) return;
    arrow.addEventListener('click', function () {
      var hi = document.querySelector('.header-inner');
      var top = hi ? hi.offsetHeight : window.innerHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ============================================================================
     5. typed.js-style title typing animation
     ========================================================================== */
  function bindTyped() {
    if (!cfg.enableTyped) return;
    var subtitle = document.getElementById('subtitle');
    if (!subtitle) return;
    var text = subtitle.getAttribute('data-typed-text') || subtitle.textContent || '';
    var loopStrings = (cfg.typedStrings && cfg.typedStrings.length > 0)
      ? cfg.typedStrings : [text];
    if (!loopStrings.length || (loopStrings.length === 1 && !loopStrings[0])) return;

    subtitle.textContent = '';
    // Append cursor span
    var cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    cursor.textContent = '|';
    subtitle.parentNode.insertBefore(cursor, subtitle.nextSibling);

    var stringIdx = 0;
    var charIdx = 0;
    var deleting = false;

    function tick() {
      var current = loopStrings[stringIdx];
      if (!deleting) {
        subtitle.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx >= current.length) {
          if (loopStrings.length > 1) {
            deleting = true;
            setTimeout(tick, 1800);
            return;
          } else {
            return; // single string, stop
          }
        }
        setTimeout(tick, 100 + Math.random() * 50);
      } else {
        subtitle.textContent = current.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx <= 0) {
          deleting = false;
          stringIdx = (stringIdx + 1) % loopStrings.length;
        }
        setTimeout(tick, 50);
      }
    }
    setTimeout(tick, 600);
  }

  /* ============================================================================
     6. Random banner
     ========================================================================== */
  function bindRandomBanner() {
    var banner = document.getElementById('banner');
    if (!banner) return;
    var raw = banner.getAttribute('data-random-banner');
    if (!raw) return;
    var list = raw.split(/[\n,]/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (list.length === 0) return;
    var pick = list[Math.floor(Math.random() * list.length)];
    banner.style.backgroundImage = "url('" + pick + "')";
  }

  /* ============================================================================
     7. Back to top
     ========================================================================== */
  function bindBackToTop() {
    var btn = document.getElementById('scroll-top-button');
    if (!btn) return;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > window.innerHeight);
    }
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }

  /* ============================================================================
     8. Reading progress
     ========================================================================== */
  function bindReadingProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar) return;
    var article = document.querySelector('.post');
    if (!article) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    function update() {
      var rect = article.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      var height = rect.height;
      var scrolled = window.scrollY - top + window.innerHeight;
      var pct = Math.max(0, Math.min(100, (scrolled / height) * 100));
      bar.style.width = pct + '%';
    }
    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ============================================================================
     9. Search modal (Cmd+K / / / search button)
     ========================================================================== */
  var searchIndex = null, searchPromise = null;
  function loadSearch() {
    if (searchIndex) return Promise.resolve(searchIndex);
    if (searchPromise) return searchPromise;
    searchPromise = fetch('/api/search.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { searchIndex = Array.isArray(data) ? data : []; return searchIndex; })
      .catch(function () { searchIndex = []; return searchIndex; });
    return searchPromise;
  }
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    var parts = String(text).split(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'));
    return parts.map(function (p) {
      return p.toLowerCase() === q.toLowerCase()
        ? '<mark>' + escapeHtml(p) + '</mark>'
        : escapeHtml(p);
    }).join('');
  }
  function renderSearchResults(q) {
    var container = document.getElementById('search-modal-results');
    var empty = document.querySelector('.search-modal-empty');
    if (!container) return;
    if (!q) { container.innerHTML = ''; if (empty) empty.style.display = 'none'; return; }
    loadSearch().then(function (entries) {
      var ql = q.toLowerCase();
      var hits = entries.filter(function (e) {
        return (e.title || '').toLowerCase().indexOf(ql) >= 0 ||
               (e.content || '').toLowerCase().indexOf(ql) >= 0 ||
               (e.tags || []).join(' ').toLowerCase().indexOf(ql) >= 0;
      }).slice(0, 50);
      if (hits.length === 0) {
        container.innerHTML = '';
        if (empty) { empty.textContent = '没有找到与「' + q + '」相关的内容'; empty.style.display = 'block'; }
        return;
      }
      if (empty) empty.style.display = 'none';
      container.innerHTML = hits.map(function (e) {
        var snippet = (e.content || '').slice(0, 200);
        return '<a class="search-result-item" href="' + escapeHtml(e.link) + '">'
          + '<h4>' + highlight(e.title || '(无标题)', q) + '</h4>'
          + '<p>' + highlight(snippet, q) + '</p>'
          + '</a>';
      }).join('');
    });
  }
  function bindSearch() {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    var input = document.getElementById('search-modal-input');
    function open() {
      modal.classList.add('is-open');
      setTimeout(function () { input && input.focus(); }, 50);
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (input) input.value = '';
      renderSearchResults('');
    }
    document.querySelectorAll('[data-action="open-search"]').forEach(function (b) {
      b.addEventListener('click', open);
    });
    document.querySelectorAll('[data-action="close-search"]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    if (input) {
      var t = null;
      input.addEventListener('input', function () {
        clearTimeout(t);
        var q = input.value.trim();
        t = setTimeout(function () { renderSearchResults(q); }, 100);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var first = document.querySelector('#search-modal-results .search-result-item');
          if (first) window.location.href = first.getAttribute('href');
        }
      });
    }
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
      if (e.key === '/' && document.activeElement &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        open();
      }
    });
  }

  /* ============================================================================
     10. Memos heatmap
     ========================================================================== */
  function bindHeatmap() {
    if (!cfg.memosShowHeatmap) return;
    var grid = document.getElementById('heatmap-grid');
    if (!grid) return;
    var counts = {};
    document.querySelectorAll('.memo-item[data-date]').forEach(function (el) {
      var d = el.getAttribute('data-date');
      if (!d) return;
      counts[d] = (counts[d] || 0) + 1;
    });
    var today = new Date(); today.setHours(0,0,0,0);
    var dayOfWeek = today.getDay();
    var start = new Date(today); start.setDate(today.getDate() - dayOfWeek - 52 * 7);
    var frag = document.createDocumentFragment();
    var d = new Date(start);
    var totalDays = 53 * 7;
    for (var i = 0; i < totalDays; i++) {
      var iso = d.toISOString().slice(0, 10);
      var n = counts[iso] || 0;
      var level = 0;
      if (n >= 1) level = 1;
      if (n >= 2) level = 2;
      if (n >= 4) level = 3;
      if (n >= 7) level = 4;
      var cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      if (level > 0) cell.setAttribute('data-level', String(level));
      cell.setAttribute('title', iso + (n ? '：' + n + ' 条' : ''));
      if (d > today) cell.style.visibility = 'hidden';
      frag.appendChild(cell);
      d.setDate(d.getDate() + 1);
    }
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  /* ============================================================================
     11. Code copy buttons
     ========================================================================== */
  function bindCodeCopy() {
    if (!cfg.showCodeCopy) return;
    document.querySelectorAll('.post pre').forEach(function (pre) {
      if (pre.querySelector('.code-copy-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '已复制';
            setTimeout(function () { btn.textContent = '复制'; }, 1500);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); btn.textContent = '已复制'; setTimeout(function () { btn.textContent = '复制'; }, 1500); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  /* ============================================================================
     12. External links open in new tab (post body only)
     ========================================================================== */
  function bindExternalLinks() {
    if (!cfg.openExternalInNewTab) return;
    var post = document.querySelector('.post');
    if (!post) return;
    post.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.startsWith('http://') || href.startsWith('https://')) {
        if (!a.hasAttribute('target')) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  }

  /* ============================================================================
     13. Smooth scroll for in-page anchors
     ========================================================================== */
  function bindAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================================
     14. Memo date split (YYYY-MM-DD → DD + MMM)
     ========================================================================== */
  function bindMemoDates() {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    document.querySelectorAll('.memo-item .memo-date[data-iso]').forEach(function (el) {
      var iso = el.getAttribute('data-iso') || '';
      var parts = iso.split('-');
      if (parts.length < 3) return;
      var dayEl = el.querySelector('.memo-date-day');
      var monthEl = el.querySelector('.memo-date-month');
      if (dayEl) dayEl.textContent = parts[2];
      var idx = parseInt(parts[1], 10) - 1;
      if (monthEl && idx >= 0 && idx < 12) monthEl.textContent = months[idx];
    });
  }

  /* ---------- Init ---------- */
  function init() {
    bindThemeToggle();
    bindNavbarScroll();
    bindMobileMenu();
    bindScrollDown();
    bindTyped();
    bindRandomBanner();
    bindBackToTop();
    bindReadingProgress();
    bindSearch();
    bindHeatmap();
    bindCodeCopy();
    bindExternalLinks();
    bindAnchorScroll();
    bindMemoDates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
