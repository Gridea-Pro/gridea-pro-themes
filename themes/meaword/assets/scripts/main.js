/* ============================================================================
   MeaWord — Theme JS
   Native JS, zero dependencies. Replicates the original main.js + ajax-scroll
   behaviour where applicable, then adds Gridea-Pro-only features:
   theme toggle / search modal / heatmap / code copy / reading progress.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Read theme config ---------- */
  var cfg = {
    themeMode: 'auto',
    showReadingProgress: true,
    showBackToTop: true,
    showCodeCopy: true,
    showSearch: true,
    memosShowHeatmap: true,
    openExternalInNewTab: true
  };
  try {
    var cfgEl = document.getElementById('meaword-config');
    if (cfgEl && cfgEl.textContent) {
      var parsed = JSON.parse(cfgEl.textContent);
      Object.keys(parsed).forEach(function (k) { cfg[k] = parsed[k]; });
    }
  } catch (e) { /* keep defaults */ }

  var STORAGE_THEME = 'meaword-theme';

  /* ============================================================================
     1. Theme toggle (light / dark)
     - "auto" follows system; user click flips and persists
     - "light" / "dark" are forced; click is a no-op (button hidden)
     - "user" is purely user-controlled
     ========================================================================== */
  function applyTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    // Update bulb icons (filled = on / dark active)
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(function (btn) {
      btn.classList.toggle('icon-bulb-on', mode === 'dark');
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
    // Sync icons on load
    applyTheme(currentMode());
  }

  /* ============================================================================
     2. Header sticky offset
     - Original behaviour: scroll past 900px → headbox.classList.add('fixednav')
       which raises top from 0 to -30 (collapsing the 30px padding-top)
     ========================================================================== */
  function bindHeaderScroll() {
    var head = document.querySelector('.headbox');
    if (!head) return;
    var ticking = false;
    function update() {
      head.classList.toggle('fixednav', window.scrollY > 900);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ============================================================================
     3. Back to top
     ========================================================================== */
  function bindBackToTop() {
    var btn = document.querySelector('.scrollToTopBtn');
    if (!btn) return;
    var ticking = false;
    function update() {
      var oneScreen = document.documentElement.clientHeight;
      if (document.documentElement.scrollTop > oneScreen) {
        btn.classList.add('showBtn');
      } else {
        btn.classList.remove('showBtn');
      }
      ticking = false;
    }
    document.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }

  /* ============================================================================
     4. Reading progress bar (article page only)
     ========================================================================== */
  function bindReadingProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar) return;
    var article = document.querySelector('.meapost');
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
     5. Off-canvas sidebar (mobile menu)
     ========================================================================== */
  function bindOffcanvas() {
    var canvas = document.getElementById('right-canvas');
    var backdrop = document.getElementById('offcanvas-backdrop');
    if (!canvas) return;
    function open() {
      canvas.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      canvas.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('[data-action="open-canvas"]').forEach(function (btn) {
      btn.addEventListener('click', open);
    });
    document.querySelectorAll('[data-action="close-canvas"]').forEach(function (btn) {
      btn.addEventListener('click', close);
    });
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && canvas.classList.contains('is-open')) close();
    });
  }

  /* ============================================================================
     6. Search modal
     - Trigger: any [data-action="open-search"] / "/" key / Cmd+K / Ctrl+K
     - Source: /api/search.json (Gridea Pro auto-generated)
     ========================================================================== */
  var searchIndex = null;
  var searchPromise = null;
  function loadSearch() {
    if (searchIndex) return Promise.resolve(searchIndex);
    if (searchPromise) return searchPromise;
    searchPromise = fetch('/api/search.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        searchIndex = Array.isArray(data) ? data : [];
        return searchIndex;
      })
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
    if (!q || q.length < 1) {
      container.innerHTML = '';
      if (empty) empty.style.display = 'none';
      return;
    }
    loadSearch().then(function (entries) {
      var ql = q.toLowerCase();
      var hits = entries.filter(function (e) {
        var t = (e.title || '').toLowerCase();
        var c = (e.content || '').toLowerCase();
        var tags = (e.tags || []).join(' ').toLowerCase();
        return t.indexOf(ql) >= 0 || c.indexOf(ql) >= 0 || tags.indexOf(ql) >= 0;
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
    var collapseSearch = document.getElementById('collapse-search');
    var collapseInput = document.getElementById('collapse-search-input');

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

    document.querySelectorAll('[data-action="open-search"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // On desktop, the original used a collapse — we reuse it as a "filter strip"
        // but the deep search experience is the modal.
        if (collapseSearch && window.innerWidth > 768) {
          collapseSearch.classList.toggle('is-open');
          if (collapseSearch.classList.contains('is-open') && collapseInput) {
            setTimeout(function () { collapseInput.focus(); }, 50);
          }
        } else {
          open();
        }
      });
    });
    document.querySelectorAll('[data-action="open-search-modal"]').forEach(function (btn) {
      btn.addEventListener('click', open);
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

    if (collapseInput) {
      collapseInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var q = collapseInput.value.trim();
          if (q) {
            // Open the full modal with this query
            if (input) input.value = q;
            open();
            renderSearchResults(q);
            collapseSearch && collapseSearch.classList.remove('is-open');
          }
        }
      });
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    document.querySelectorAll('[data-action="close-search"]').forEach(function (btn) {
      btn.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
      if (e.key === '/' && document.activeElement && document.activeElement.tagName !== 'INPUT'
          && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        open();
      }
    });
  }

  /* ============================================================================
     7. Memos heatmap (53×7 grid)
     - Reads .memo[data-date] elements; data-date format YYYY-MM-DD
     ========================================================================== */
  function bindHeatmap() {
    if (!cfg.memosShowHeatmap) return;
    var grid = document.getElementById('heatmap-grid');
    if (!grid) return;

    var counts = {};
    document.querySelectorAll('.memo[data-date]').forEach(function (el) {
      var d = el.getAttribute('data-date');
      if (!d) return;
      counts[d] = (counts[d] || 0) + 1;
    });

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // Walk back to the previous Sunday (so columns = full weeks)
    var dayOfWeek = today.getDay(); // 0=Sun
    // We render 53 weeks back from this Sunday
    var start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek - 52 * 7);

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
      // Skip future cells (after today)
      if (d > today) cell.style.visibility = 'hidden';
      frag.appendChild(cell);
      d.setDate(d.getDate() + 1);
    }
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  /* ============================================================================
     8. Code copy buttons
     ========================================================================== */
  function bindCodeCopy() {
    if (!cfg.showCodeCopy) return;
    var pres = document.querySelectorAll('.meapost pre');
    pres.forEach(function (pre) {
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
     9. Banner / Carousel (replaces Bootstrap carousel)
     ========================================================================== */
  function bindBanner() {
    var banner = document.querySelector('.banner');
    if (!banner) return;
    var track = banner.querySelector('.banner-track');
    var slides = banner.querySelectorAll('.banner-slide');
    var indicators = banner.querySelectorAll('.banner-indicators button');
    var prevBtn = banner.querySelector('.banner-control-prev');
    var nextBtn = banner.querySelector('.banner-control-next');
    if (!track || slides.length <= 1) return;

    var current = 0;
    var timer = null;
    var interval = 5000;

    function go(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      indicators.forEach(function (btn, idx) {
        btn.classList.toggle('is-active', idx === current);
      });
    }
    function next() { go(current + 1); }
    function prev() { go(current - 1); }
    function play() { stop(); timer = setInterval(next, interval); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    indicators.forEach(function (btn, idx) { btn.addEventListener('click', function () { go(idx); play(); }); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); play(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); play(); });
    banner.addEventListener('mouseenter', stop);
    banner.addEventListener('mouseleave', play);

    play();
  }

  /* ============================================================================
     10. External links in article body open in new tab
     ========================================================================== */
  function bindExternalLinks() {
    if (!cfg.openExternalInNewTab) return;
    var post = document.querySelector('.meapost');
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
     11. Smooth scroll for in-page anchors
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
     Init
     ========================================================================== */
  function init() {
    bindThemeToggle();
    bindHeaderScroll();
    bindBackToTop();
    bindReadingProgress();
    bindOffcanvas();
    bindSearch();
    bindHeatmap();
    bindCodeCopy();
    bindBanner();
    bindExternalLinks();
    bindAnchorScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
