/* ==========================================================
   Jasmine Theme — main.js
   原主题 changeBsTheme / generateToc / commentRemember 沿用思路，
   但客户端化：暗色切换 / 全屏搜索 / 客户端 TOC / 上下篇 / 热力图 /
   阅读进度 / 代码复制 / 回到顶部 / 表格美化 / 移动 offcanvas 已由 Bootstrap 提供
   ========================================================== */
(function () {
  'use strict';

  var CFG = window.JASMINE_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var body = document.body;

  /* ------ 1. 暗色切换（沿用原主题 localStorage key data-bs-theme） ------ */
  var THEME_KEY = 'data-bs-theme';

  function applyTheme(mode) {
    body.setAttribute('data-bs-theme', mode);
    html.setAttribute('data-bs-theme', mode);
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  }
  function changeBsTheme() {
    var current = body.getAttribute('data-bs-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }
  // 暴露给行内 onclick="changeBsTheme()" 的兼容
  window.changeBsTheme = changeBsTheme;
  $$('[data-action="toggle-theme"]').forEach(function (b) { b.addEventListener('click', changeBsTheme); });

  /* ------ 2. 客户端 TOC（沿用原主题 generateToc 思路） ------ */
  function generateToc() {
    if (!CFG.tocEnable) return;
    var toc = $('#toc');
    var content = $('#post-content');
    var holder = $('#toc-content');
    if (!toc || !content || !holder) return;
    var heads = $$('h1, h2, h3, h4, h5, h6', content);
    if (!heads.length) return;

    var lastLevel = 0; var lastMargin = 0;
    var ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';

    heads.forEach(function (h, i) {
      var id = h.id || 'toc-h-' + i;
      h.id = id;
      var level = parseInt(h.tagName.charAt(1), 10);
      if (lastLevel === 0) lastLevel = level;
      if (level <= lastLevel) {
        lastMargin = Math.max(0, lastMargin - (lastLevel - level) * 16);
      } else {
        lastMargin = lastMargin + (level - lastLevel) * 16;
      }

      var li = document.createElement('li');
      li.className = 'list-group-item toc-item';
      li.dataset.level = level;
      li.dataset.target = id;
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent;
      a.style.display = 'block';
      a.style.marginLeft = lastMargin + 'px';
      li.appendChild(a);
      ul.appendChild(li);

      lastLevel = level;
    });
    holder.innerHTML = '';
    holder.appendChild(ul);
    toc.removeAttribute('hidden');

    window._jasmineTocHeads = heads.map(function (h) { return { id: h.id, top: 0 }; });
    refreshTocOffsets();
  }
  function refreshTocOffsets() {
    if (!window._jasmineTocHeads) return;
    window._jasmineTocHeads.forEach(function (it) {
      var el = document.getElementById(it.id);
      it.top = el ? el.getBoundingClientRect().top + window.pageYOffset : 0;
    });
  }
  function updateTocActive(y) {
    var heads = window._jasmineTocHeads;
    if (!heads || !heads.length) return;
    var current = null;
    for (var i = 0; i < heads.length; i++) {
      if (y + 130 >= heads[i].top) current = heads[i]; else break;
    }
    $$('#toc-content .toc-item').forEach(function (li) { li.classList.remove('toc-active'); });
    if (current) {
      var li = $('#toc-content .toc-item[data-target="' + current.id + '"]');
      if (li) li.classList.add('toc-active');
    }
  }

  /* ------ 3. 表格美化（沿用原 main.js） ------ */
  function beautifyTables() {
    $$('#post-content table').forEach(function (t) {
      t.classList.add('table', 'table-bordered', 'table-striped');
    });
    $$('#post-content tbody').forEach(function (b) { b.classList.add('table-group-divider'); });
  }

  /* ------ 4. 代码块复制 ------ */
  function initCodeCopy() {
    if (!CFG.codeCopy) return;
    $$('#post-content pre').forEach(function (pre) {
      if (pre.querySelector('.code-copy')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = '复制';
      pre.appendChild(btn);
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.innerText : pre.innerText;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '已复制';
            setTimeout(function () { btn.textContent = '复制'; }, 1500);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); btn.textContent = '已复制'; setTimeout(function () { btn.textContent = '复制'; }, 1500); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ------ 5. 回到顶部 + 阅读进度 ------ */
  var progressBar = $('#reading-progress > span');
  var topBtn = $('#scroll-to-top');
  function onScroll() {
    var y = window.pageYOffset;
    if (progressBar) {
      var max = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
      progressBar.style.width = Math.min(100, Math.max(0, (y / max) * 100)) + '%';
    }
    if (topBtn) {
      if (y > 240) topBtn.removeAttribute('hidden'); else topBtn.setAttribute('hidden', '');
    }
    if (window._jasmineTocHeads) updateTocActive(y);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', refreshTocOffsets);
  if (topBtn) {
    topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  $$('[data-action="scroll-to-top-anchor"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ------ 6. 全屏搜索 ------ */
  var searchModal = $('#search-modal');
  var searchInput = $('#search-input');
  var searchResults = $('#search-results');
  var searchEmpty = $('#search-empty');
  var searchTip = $('#search-tip');
  var searchData = (function () {
    return $$('#search-index-data article').map(function (a) {
      return {
        link: a.dataset.link || '',
        title: a.dataset.title || '',
        date: a.dataset.date || '',
        feature: a.dataset.feature || '',
        tags: (a.dataset.tags || '').split('|').filter(Boolean),
        excerpt: a.dataset.excerpt || ''
      };
    });
  })();
  var activeIdx = -1;

  function openSearch() {
    if (!searchModal) return;
    searchModal.removeAttribute('hidden');
    body.style.overflow = 'hidden';
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 50);
  }
  function closeSearch() {
    if (!searchModal) return;
    searchModal.setAttribute('hidden', '');
    body.style.overflow = '';
  }
  $$('[data-action="open-search"]').forEach(function (b) { b.addEventListener('click', openSearch); });
  $$('[data-action="close-search"]').forEach(function (b) { b.addEventListener('click', closeSearch); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
    if (e.key === 'Escape') { closeSearch(); return; }
    if (searchModal && !searchModal.hasAttribute('hidden')) {
      var items = $$('.search-results .search-item');
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(items.length - 1, activeIdx + 1); refreshActive(items); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); refreshActive(items); }
      if (e.key === 'Enter' && activeIdx >= 0 && items[activeIdx]) { location.href = items[activeIdx].dataset.link; }
    }
  });
  function refreshActive(items) {
    items.forEach(function (it, i) { it.classList.toggle('active', i === activeIdx); if (i === activeIdx) it.scrollIntoView({ block: 'nearest' }); });
  }
  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    var safe = escapeHtml(text);
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return safe.replace(re, '<em>$1</em>');
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim();
      activeIdx = -1;
      if (!q) {
        searchResults.innerHTML = '';
        if (searchEmpty) searchEmpty.setAttribute('hidden', '');
        if (searchTip) searchTip.removeAttribute('hidden');
        return;
      }
      var qL = q.toLowerCase();
      var hits = searchData.map(function (p) {
        var sc = 0;
        if (p.title.toLowerCase().indexOf(qL) !== -1) sc += 5;
        if ((p.tags || []).join(' ').toLowerCase().indexOf(qL) !== -1) sc += 3;
        if ((p.excerpt || '').toLowerCase().indexOf(qL) !== -1) sc += 1;
        return { p: p, sc: sc };
      }).filter(function (x) { return x.sc > 0; })
        .sort(function (a, b) { return b.sc - a.sc; })
        .slice(0, 18);

      if (!hits.length) {
        searchResults.innerHTML = '';
        if (searchTip) searchTip.setAttribute('hidden', '');
        if (searchEmpty) searchEmpty.removeAttribute('hidden');
        return;
      }
      if (searchEmpty) searchEmpty.setAttribute('hidden', '');
      if (searchTip) searchTip.setAttribute('hidden', '');
      searchResults.innerHTML = hits.map(function (h) {
        return '<li><a class="search-item" data-link="' + escapeHtml(h.p.link) + '" href="' + escapeHtml(h.p.link) + '">'
          + '<div class="search-item-title">' + highlight(h.p.title, q) + '</div>'
          + '<div class="search-item-excerpt">' + highlight(h.p.excerpt || '', q) + '</div>'
          + '</a></li>';
      }).join('');
    });
  }

  /* ------ 7. 文章上下篇推断（从 search-index） ------ */
  function initPostNav() {
    var nav = $('#post-nav');
    if (!nav) return;
    var current = nav.dataset.current;
    if (!current || !searchData.length) return;
    var idx = -1;
    for (var i = 0; i < searchData.length; i++) {
      if (searchData[i].link === current) { idx = i; break; }
    }
    if (idx < 0) return;
    var newer = idx > 0 ? searchData[idx - 1] : null;
    var older = idx < searchData.length - 1 ? searchData[idx + 1] : null;

    var prevLink = nav.querySelector('[data-role="prev"]');
    var prevEmpty = nav.querySelector('[data-role="prev-empty"]');
    var nextLink = nav.querySelector('[data-role="next"]');
    var nextEmpty = nav.querySelector('[data-role="next-empty"]');

    if (newer && prevLink) {
      prevLink.href = newer.link;
      prevLink.textContent = newer.title;
      prevLink.removeAttribute('hidden');
      if (prevEmpty) prevEmpty.setAttribute('hidden', '');
    }
    if (older && nextLink) {
      nextLink.href = older.link;
      nextLink.textContent = older.title;
      nextLink.removeAttribute('hidden');
      if (nextEmpty) nextEmpty.setAttribute('hidden', '');
    }
  }

  /* ------ 8. 闪念热力图 ------ */
  function initHeatmap() {
    if (!CFG.heatmapEnable) return;
    var grid = $('#heatmap-grid');
    var monthsBar = $('#heatmap-months');
    if (!grid) return;

    var counts = {};
    $$('.memo-item').forEach(function (m) {
      var d = m.dataset.date || '';
      if (d) {
        var key = d.substring(0, 10);
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    var today = new Date();
    var startDay = new Date(today);
    startDay.setDate(today.getDate() - 7 * 53);
    while (startDay.getDay() !== 1) startDay.setDate(startDay.getDate() - 1);

    var frag = document.createDocumentFragment();
    var d = new Date(startDay);
    var monthLabels = [];
    var lastMonth = -1;
    var weekIdx = 0;

    while (d <= today) {
      var key = d.toISOString().substring(0, 10);
      var n = counts[key] || 0;
      var lvl = n >= 5 ? 4 : n >= 3 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0;
      var cell = document.createElement('span');
      cell.className = 'heatmap-cell level-' + lvl;
      cell.title = key + ' · ' + n + ' 条闪念';
      frag.appendChild(cell);
      if (d.getDay() === 1) {
        if (d.getMonth() !== lastMonth) {
          monthLabels.push({ idx: weekIdx, label: (d.getMonth() + 1) + '月' });
          lastMonth = d.getMonth();
        }
        weekIdx++;
      }
      d.setDate(d.getDate() + 1);
    }
    grid.appendChild(frag);
    if (monthsBar) {
      monthsBar.innerHTML = monthLabels.map(function (m) {
        return '<span style="grid-column:' + (m.idx + 1) + '">' + m.label + '</span>';
      }).join('');
    }
  }

  /* ------ 9. 启动 ------ */
  window.addEventListener('DOMContentLoaded', function () {
    generateToc();
    beautifyTables();
    initCodeCopy();
    initPostNav();
    initHeatmap();
    onScroll();
  });

})();
