/**
 * Cactus Theme · main.js
 *
 * 模块概览：
 *  1. 主题切换（dark/light，localStorage 持久化）
 *  2. 移动端菜单展开
 *  3. Hero 打字机动画（轻量自实现，不依赖 typed.js）
 *  4. 社交链接渲染（textarea -> <li>）
 *  5. Projects 列表渲染
 *  6. 搜索（local JSON / Google / Bing）+ 浮层交互
 *  7. 文章页 TOC 自动生成 + 滚动高亮
 *  8. 文章页上一篇/下一篇（首页注入 posts.json，无则尝试 fetch /index.json）
 *  9. 闪念热力图（GitHub 风 53 周 × 7 天）
 * 10. 代码块复制按钮 / 返回顶部 / 分享
 */
(function () {
  'use strict';

  var CFG = window.__CACTUS__ || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------ 1. 主题切换 ------ */
  function initThemeToggle() {
    var btn = $('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('cactus-theme', next); } catch (e) {}
    });
  }

  /* ------ 2. 移动端菜单 ------ */
  function initNavToggle() {
    var t = $('#nav-toggle');
    var ul = t && t.closest('#nav') && t.closest('#nav').querySelector('ul');
    if (!t || !ul) return;
    t.addEventListener('click', function (e) {
      e.preventDefault();
      ul.classList.toggle('responsive');
    });
  }

  /* ------ 3. 打字机动画（轻量） ------ */
  function initTyped() {
    var el = $('#typed-target');
    if (!el) return;
    var raw = (el.dataset.phrases || '').replace(/\\n/g, '\n');
    var phrases = raw.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!phrases.length) { el.textContent = ''; return; }

    var idx = 0, charIdx = 0, deleting = false;
    var TYPE_MS = 55, DELETE_MS = 30, HOLD_MS = 1800;

    function tick() {
      var cur = phrases[idx];
      if (!deleting) {
        charIdx++;
        el.textContent = cur.substring(0, charIdx);
        if (charIdx >= cur.length) {
          deleting = true;
          return setTimeout(tick, HOLD_MS);
        }
        return setTimeout(tick, TYPE_MS);
      } else {
        charIdx--;
        el.textContent = cur.substring(0, charIdx);
        if (charIdx <= 0) {
          deleting = false;
          idx = (idx + 1) % phrases.length;
        }
        return setTimeout(tick, DELETE_MS);
      }
    }
    tick();
  }

  /* ------ 4. 社交图标渲染 ------ */
  function initSocial() {
    $$('#sociallinks, .hero-social-inline').forEach(function (ul) {
      if (!ul.dataset.source) return;
      var raw = ul.dataset.source.replace(/\\n/g, '\n');
      var lines = raw.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      var html = lines.map(function (line) {
        var parts = line.split('|');
        if (parts.length < 2) return '';
        var name = parts[0].trim().toLowerCase();
        var href = parts[1].trim();
        return '<li><a class="icon" href="' + escAttr(href) + '" target="_blank" rel="noopener" title="' + escAttr(name) + '" aria-label="' + escAttr(name) + '"><i class="ic ic-' + escAttr(name) + '"></i></a></li>';
      }).join('');
      ul.innerHTML = html;
    });
  }

  /* ------ 5. Projects 列表 ------ */
  function initProjects() {
    var ul = $('.project-list[data-source]');
    if (!ul) return;
    var raw = ul.dataset.source.replace(/\\n/g, '\n');
    var items = raw.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var html = items.map(function (line) {
      var parts = line.split('|');
      var name = (parts[0] || '').trim();
      var href = (parts[1] || '#').trim();
      var desc = (parts[2] || '').trim();
      if (!name) return '';
      return '<li class="project-item"><a href="' + escAttr(href) + '" target="_blank" rel="noopener noreferrer">' + escHtml(name) + '</a>' +
        (desc ? '<span class="desc">— ' + escHtml(desc) + '</span>' : '') + '</li>';
    }).join('');
    ul.innerHTML = html;
  }

  /* ------ 6. 搜索 ------ */
  var SEARCH = { idx: null, loading: false };

  function loadIndex() {
    if (SEARCH.idx || SEARCH.loading) return Promise.resolve(SEARCH.idx);
    SEARCH.loading = true;
    return fetch('/search.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        // 兼容多种格式：{ posts: [...] } 或 [...]
        if (data && data.posts) data = data.posts;
        if (!Array.isArray(data)) data = [];
        SEARCH.idx = data.map(function (p) {
          return {
            title: (p.title || '').toString(),
            link: p.link || p.url || '#',
            content: (p.content || p.body || p.description || '').toString().replace(/<[^>]+>/g, '')
          };
        });
        return SEARCH.idx;
      })
      .catch(function () { SEARCH.idx = []; return SEARCH.idx; })
      .finally(function () { SEARCH.loading = false; });
  }

  function renderResults(q) {
    var box = $('#search-results');
    var hint = $('#search-hint');
    if (!box) return;
    var query = (q || '').trim();
    if (!query) {
      box.innerHTML = '';
      if (hint) hint.textContent = '支持搜索标题与正文 · 按 ESC 关闭';
      return;
    }
    if (CFG.searchProvider !== 'local') return; // 非本地模式，输入后回车跳转
    if (!SEARCH.idx) {
      if (hint) hint.textContent = '索引加载中…';
      return;
    }
    var lc = query.toLowerCase();
    var hits = SEARCH.idx
      .map(function (p) {
        var ti = p.title.toLowerCase();
        var co = p.content.toLowerCase();
        var ts = ti.indexOf(lc), cs = co.indexOf(lc);
        if (ts < 0 && cs < 0) return null;
        return {
          post: p,
          score: (ts >= 0 ? 100 - ts : 0) + (cs >= 0 ? 10 : 0),
          ts: ts, cs: cs
        };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 12);

    if (!hits.length) {
      box.innerHTML = '<li class="empty"><a href="#">没有找到与「' + escHtml(query) + '」相关的内容</a></li>';
      if (hint) hint.textContent = '没有匹配 · 试试其他关键词';
      return;
    }
    box.innerHTML = hits.map(function (h) {
      var t = highlight(h.post.title, query);
      var s = '';
      if (h.cs >= 0) {
        var start = Math.max(0, h.cs - 30);
        var snippet = h.post.content.substring(start, start + 140);
        s = '<div class="search-result-snippet">' + (start > 0 ? '…' : '') + highlight(snippet, query) + '</div>';
      }
      return '<li><a href="' + escAttr(h.post.link) + '"><div class="search-result-title">' + t + '</div>' + s + '</a></li>';
    }).join('');
    if (hint) hint.textContent = '共 ' + hits.length + ' 条结果 · ↑↓ 选择 · Enter 打开';
  }

  function highlight(text, q) {
    if (!q) return escHtml(text);
    var safe = escHtml(text);
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return safe.replace(re, '<em>$1</em>');
  }

  function openSearch() {
    var box = $('#searchbox');
    if (!box) return;
    box.classList.add('show');
    box.setAttribute('aria-hidden', 'false');
    var input = $('#search-input');
    if (input) setTimeout(function () { input.focus(); }, 30);
    if (CFG.searchProvider === 'local') loadIndex().then(function () { renderResults(input ? input.value : ''); });
  }
  function closeSearch() {
    var box = $('#searchbox');
    if (!box) return;
    box.classList.remove('show');
    box.setAttribute('aria-hidden', 'true');
  }

  function initSearch() {
    if (!CFG.showSearch) return;
    $$('.search-trigger').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
    });
    $$('[data-role="search-close"]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); closeSearch(); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    });
    var input = $('#search-input');
    if (!input) return;
    var t;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { renderResults(input.value); }, 120);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var q = input.value.trim();
        if (!q) return;
        if (CFG.searchProvider === 'google') {
          window.open('https://www.google.com/search?q=' + encodeURIComponent(q + ' site:' + (location.host || '')), '_blank', 'noopener');
        } else if (CFG.searchProvider === 'bing') {
          window.open('https://cn.bing.com/search?q=' + encodeURIComponent(q + ' site:' + (location.host || '')), '_blank', 'noopener');
        } else {
          var first = $('#search-results li:not(.empty) a');
          if (first) location.href = first.getAttribute('href');
        }
      }
    });
  }

  /* ------ 7. 文章 TOC 生成 + 滚动激活 ------ */
  function initToc() {
    if (!CFG.showToc) return;
    var toc = $('#TableOfContents');
    var content = $('#post-content');
    if (!toc || !content) return;

    var heads = $$('h2, h3', content);
    if (!heads.length) { toc.parentNode.style.display = 'none'; return; }

    var html = '<ol>';
    heads.forEach(function (h, i) {
      if (!h.id) {
        h.id = 'h-' + (i + 1) + '-' + (h.textContent || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^一-龥a-z0-9-]/g, '').slice(0, 50);
      }
      var cls = h.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
      html += '<li class="' + cls + '"><a href="#' + h.id + '">' + escHtml(h.textContent || '') + '</a></li>';
    });
    html += '</ol>';
    toc.innerHTML = html;

    var links = $$('a', toc);
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      map[id] = a;
    });

    function onScroll() {
      var top = window.scrollY + 80;
      var active;
      heads.forEach(function (h) {
        if (h.offsetTop <= top) active = h;
      });
      links.forEach(function (a) { a.classList.remove('active'); });
      if (active && map[active.id]) map[active.id].classList.add('active');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------ 8. 上一篇 / 下一篇 ------ */
  function initPostNav() {
    if (!CFG.showPrevNext) return;
    var nav = $('.post-nav');
    if (!nav && !$('[data-role="post-prev"]')) return;
    var current = nav ? nav.dataset.current : (location.pathname || '');

    fetch('/index.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        var posts = (data && data.posts) ? data.posts : (Array.isArray(data) ? data : []);
        if (!posts.length) return;
        // posts 默认按时间倒序：[新, ..., 旧]
        var i = posts.findIndex(function (p) { return (p.link || p.url) === current; });
        if (i < 0) return;
        var newer = posts[i - 1];
        var older = posts[i + 1];
        applyNav(newer, older);
      })
      .catch(function () {});

    function applyNav(newer, older) {
      // .post-nav block
      if (nav) {
        var prevA = nav.querySelector('[data-role="prev-link"]');
        var prevE = nav.querySelector('[data-role="prev-empty"]');
        var nextA = nav.querySelector('[data-role="next-link"]');
        var nextE = nav.querySelector('[data-role="next-empty"]');
        if (older && prevA) {
          prevA.href = older.link || older.url;
          prevA.querySelector('.title').textContent = older.title;
          prevA.removeAttribute('hidden');
          if (prevE) prevE.setAttribute('hidden', '');
        }
        if (newer && nextA) {
          nextA.href = newer.link || newer.url;
          nextA.querySelector('.title').textContent = newer.title;
          nextA.removeAttribute('hidden');
          if (nextE) nextE.setAttribute('hidden', '');
        }
      }
      // 浮动菜单 + footer-post 中的 prev/next
      $$('[data-role="post-prev"]').forEach(function (el) {
        if (older) { el.setAttribute('href', older.link || older.url); el.removeAttribute('hidden'); }
      });
      $$('[data-role="post-next"]').forEach(function (el) {
        if (newer) { el.setAttribute('href', newer.link || newer.url); el.removeAttribute('hidden'); }
      });
    }
  }

  /* ------ 9. 闪念热力图 ------ */
  function initHeatmap() {
    if (!CFG.memosHeatmap) return;
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

  /* ------ 10. 杂项：返回顶部 / 分享 / 复制代码 ------ */
  function initBackTop() {
    var topIcon = $('#top-icon-tablet');
    function onScroll() {
      if (!topIcon) return;
      if (window.scrollY > 600) topIcon.removeAttribute('hidden');
      else topIcon.setAttribute('hidden', '');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $$('[data-role="back-top"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function initShare() {
    var trigger = $('[data-role="share-toggle"]');
    var box = $('#share');
    if (trigger && box) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        if (box.hasAttribute('hidden')) box.removeAttribute('hidden');
        else box.setAttribute('hidden', '');
      });
    }
    var ul = $('#share ul');
    if (!ul) return;
    var url = ul.dataset.shareUrl || location.href;
    var title = ul.dataset.shareTitle || document.title;
    $$('a[data-share]', ul).forEach(function (a) {
      var t = a.dataset.share;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (t === 'twitter') {
          window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title), '_blank', 'noopener');
        } else if (t === 'weibo') {
          window.open('http://service.weibo.com/share/share.php?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), '_blank', 'noopener');
        } else if (t === 'email') {
          location.href = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url);
        } else if (t === 'copy') {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
              a.classList.add('copied');
              setTimeout(function () { a.classList.remove('copied'); }, 1200);
            });
          }
        }
      });
    });
  }

  function initCodeCopy() {
    $$('pre').forEach(function (pre) {
      if (pre.querySelector('.code-copy-btn')) return;
      var wrap = document.createElement('div');
      wrap.className = 'code-block-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        var text = pre.innerText;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
          });
        }
      });
      wrap.appendChild(btn);
    });
  }

  /* ------ 工具 ------ */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escAttr(s) {
    return escHtml(s);
  }

  /* ------ 启动 ------ */
  function boot() {
    initThemeToggle();
    initNavToggle();
    initTyped();
    initSocial();
    initProjects();
    initSearch();
    initToc();
    initPostNav();
    initHeatmap();
    initBackTop();
    initShare();
    initCodeCopy();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
