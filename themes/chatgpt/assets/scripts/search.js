/* ============================================================
   chatgpt theme — search.js
   双搜索：
   1) 弹窗搜索（侧栏「搜索」/ ⌘K 打开，实时过滤）
   2) 对话式搜索（底部输入框，结果以 AI 回复出现）
   数据源均为引擎生成的 /api/search.json
   ============================================================ */
(function () {
  'use strict';

  window.__searchIndexPromise =
    window.__searchIndexPromise ||
    fetch('/api/search.json')
      .then(function (r) {
        return r.ok ? r.json() : [];
      })
      .catch(function () {
        return [];
      });

  /* ── 公共工具 ── */

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function escapeReg(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function markTerms(safeText, terms) {
    terms.forEach(function (t) {
      safeText = safeText.replace(new RegExp(escapeReg(escapeHtml(t)), 'gi'), function (m) {
        return '<mark>' + m + '</mark>';
      });
    });
    return safeText;
  }

  /* 分词 AND 匹配；标题 > 标签 > 内容 */
  function search(entries, query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var scored = [];
    entries.forEach(function (e) {
      var title = (e.title || '').toLowerCase();
      var content = (e.content || '').toLowerCase();
      var tags = (e.tags || []).join(' ').toLowerCase();
      var score = 0;
      var ok = terms.every(function (t) {
        var inTitle = title.indexOf(t) !== -1;
        var inTags = tags.indexOf(t) !== -1;
        var inContent = content.indexOf(t) !== -1;
        if (inTitle) score += 10;
        if (inTags) score += 5;
        if (inContent) score += 1;
        return inTitle || inTags || inContent;
      });
      if (ok) scored.push({ entry: e, score: score });
    });
    scored.sort(function (a, b) {
      return b.score - a.score;
    });
    return scored.map(function (s) {
      return s.entry;
    });
  }

  function snippet(content, terms) {
    if (!content) return '';
    var lower = content.toLowerCase();
    var pos = -1;
    for (var i = 0; i < terms.length; i++) {
      pos = lower.indexOf(terms[i]);
      if (pos !== -1) break;
    }
    var start = Math.max(0, pos - 30);
    var text = (start > 0 ? '…' : '') + content.substring(start, start + 110) + '…';
    return markTerms(escapeHtml(text), terms);
  }

  /* ══════════ 1. 弹窗搜索 ══════════ */

  var overlay = document.getElementById('search-overlay');
  var modalInput = document.getElementById('search-modal-input');
  var modalResults = document.getElementById('search-modal-results');
  var modalClose = document.getElementById('search-modal-close');
  var sidebarSearch = document.getElementById('sidebar-search');
  var debounceId = null;

  function openModal() {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    modalInput.value = '';
    showRecommendations();
    requestAnimationFrame(function () {
      modalInput.focus();
    });
  }

  function closeModal() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  function showMsg(text) {
    modalResults.innerHTML = '<div class="search-modal__msg">' + escapeHtml(text) + '</div>';
  }

  /* 空查询时展示最近文章作为推荐 */
  function showRecommendations() {
    window.__searchIndexPromise.then(function (entries) {
      if (!entries || !entries.length) {
        showMsg('暂无可搜索的内容');
        return;
      }
      var sorted = entries.slice();
      if (sorted.every(function (e) { return !isNaN(Date.parse(e.date)); })) {
        sorted.sort(function (a, b) {
          return Date.parse(b.date) - Date.parse(a.date);
        });
      }
      var html = '<div class="search-modal__section">最近发布</div>';
      sorted.slice(0, 6).forEach(function (e) {
        html +=
          '<a class="search-modal-hit" href="' + escapeHtml(e.link) + '">' +
          '<span class="search-modal-hit__title">' + escapeHtml(e.title || '无标题') + '</span>' +
          (e.date ? '<span class="search-modal-hit__date">' + escapeHtml(e.date) + '</span>' : '') +
          '</a>';
      });
      modalResults.innerHTML = html;
    });
  }

  function renderModalResults(query) {
    window.__searchIndexPromise.then(function (entries) {
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      var hits = search(entries || [], query);
      if (!hits.length) {
        showMsg('没有找到与「' + query + '」相关的内容');
        return;
      }
      var html = '<div class="search-modal__section">' + hits.length + ' 条结果</div>';
      hits.slice(0, 20).forEach(function (h) {
        html +=
          '<a class="search-modal-hit" href="' + escapeHtml(h.link) + '">' +
          '<span class="search-modal-hit__title">' + markTerms(escapeHtml(h.title || '无标题'), terms) + '</span>' +
          '<span class="search-modal-hit__snippet">' + snippet(h.content || '', terms) + '</span>' +
          '</a>';
      });
      modalResults.innerHTML = html;
    });
  }

  if (overlay) {
    if (sidebarSearch) sidebarSearch.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        overlay.hidden ? openModal() : closeModal();
      }
      if (e.key === 'Escape' && !overlay.hidden) closeModal();
    });
    modalInput.addEventListener('input', function () {
      clearTimeout(debounceId);
      var q = modalInput.value.trim();
      debounceId = setTimeout(function () {
        q ? renderModalResults(q) : showRecommendations();
      }, 150);
    });
  }

  /* ══════════ 2. 对话式搜索（composer） ══════════ */

  var form = document.getElementById('composer');
  var input = document.getElementById('composer-input');
  var thread = document.getElementById('chat-thread');

  if (form && input && thread) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var query = input.value.trim();
      if (!query) return;
      input.value = '';

      /* 用户气泡 */
      var userMsg = document.createElement('div');
      userMsg.className = 'msg msg--user search-result';
      userMsg.innerHTML = '<div class="msg__bubble"></div>';
      userMsg.querySelector('.msg__bubble').textContent = query;
      thread.appendChild(userMsg);

      /* AI 回复（先打字指示） */
      var aiMsg = document.createElement('div');
      aiMsg.className = 'msg msg--assistant search-result';
      aiMsg.innerHTML =
        '<div class="msg__body"><div class="typing" aria-label="正在搜索"><i></i><i></i><i></i></div></div>';
      thread.appendChild(aiMsg);
      requestAnimationFrame(function () {
        userMsg.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });

      window.__searchIndexPromise.then(function (entries) {
        setTimeout(function () {
          var body = aiMsg.querySelector('.msg__body');
          var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
          var hits = search(entries || [], query);

          var html = '';
          if (!entries || !entries.length) {
            html = '<div class="msg__text"><p>搜索索引暂时不可用，请稍后再试。</p></div>';
          } else if (!hits.length) {
            html =
              '<div class="msg__text"><p>翻遍了记忆，也没找到与「' +
              escapeHtml(query) +
              '」有关的片段。换个关键词再试试？</p></div>';
          } else {
            html =
              '<div class="msg__text"><p>为你找到 <strong>' +
              hits.length +
              '</strong> 篇与「' +
              escapeHtml(query) +
              '」相关的内容：</p></div><div class="search-result__hits">';
            hits.slice(0, 10).forEach(function (h) {
              html +=
                '<a class="search-hit" href="' +
                escapeHtml(h.link) +
                '"><span class="search-hit__title">' +
                markTerms(escapeHtml(h.title || '无标题'), terms) +
                '</span><span class="search-hit__snippet">' +
                snippet(h.content || '', terms) +
                '</span>' +
                (h.date ? '<time class="search-hit__date">' + escapeHtml(h.date) + '</time>' : '') +
                '</a>';
            });
            html += '</div>';
            if (hits.length > 10) {
              html += '<p class="search-hit__date">仅展示前 10 条结果</p>';
            }
          }
          html += '<button class="search-clear" type="button">清除搜索记录</button>';
          body.innerHTML = html;

          body.querySelector('.search-clear').addEventListener('click', function () {
            document.querySelectorAll('.search-result').forEach(function (el) {
              el.remove();
            });
          });

          requestAnimationFrame(function () {
            userMsg.scrollIntoView({ block: 'start', behavior: 'smooth' });
          });
        }, 450);
      });
    });
  }
})();
