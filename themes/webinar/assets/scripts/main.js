/* ============================================
   Webinar Theme - Main JavaScript
   Based on Sagittarius Design
   ============================================ */

(function () {
  'use strict';

  // --- Theme Toggle (Dark / Light) ---
  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var iconSun = toggle.querySelector('.icon-sun');
    var iconMoon = toggle.querySelector('.icon-moon');

    function setTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (iconSun) iconSun.style.display = 'none';
        if (iconMoon) iconMoon.style.display = 'block';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if (iconSun) iconSun.style.display = 'block';
        if (iconMoon) iconMoon.style.display = 'none';
      }
      try {
        localStorage.setItem('webinar-theme', theme);
      } catch (e) {}
    }

    // Init icon state
    var currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      if (iconSun) iconSun.style.display = 'none';
      if (iconMoon) iconMoon.style.display = 'block';
    }

    toggle.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'light' : 'dark');
    });
  }

  // --- Mobile Navigation ---
  function initMobileNav() {
    var mobileToggle = document.getElementById('mobile-toggle');
    var mobileMenu = document.getElementById('mobile-menu');
    if (!mobileToggle || !mobileMenu) return;

    mobileToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    mobileMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });

    document.addEventListener('click', function (e) {
      if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  }

  // --- Search ---
  function initSearch() {
    var searchToggle = document.getElementById('search-toggle');
    var searchOverlay = document.getElementById('search-overlay');
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');
    var searchClose = document.getElementById('search-close');

    if (!searchOverlay || !searchInput) return;

    var searchData = [];
    var searchTimeout = null;

    // Load search index
    function loadSearchIndex() {
      var indexUrl = '/search.json';
      var xhr = new XMLHttpRequest();
      xhr.open('GET', indexUrl, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            searchData = JSON.parse(xhr.responseText);
          } catch (e) {
            searchData = [];
          }
        }
      };
      xhr.send();
    }

    function performSearch(query) {
      if (!query || query.length < 1 || searchData.length === 0) {
        searchResults.innerHTML = '<div class="search-modal__loading">输入关键词开始搜索</div>';
        return;
      }

      var q = query.toLowerCase();
      var results = searchData.filter(function (item) {
        return (item.title && item.title.toLowerCase().indexOf(q) !== -1) ||
               (item.content && item.content.toLowerCase().indexOf(q) !== -1);
      }).slice(0, 10);

      if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-modal__empty">没有找到相关结果</div>';
        return;
      }

      var html = '';
      results.forEach(function (item) {
        html += '<a href="' + (item.link || '#') + '" class="search-result-item">' +
                '<div class="search-result-item__title">' + escapeHtml(item.title) + '</div>' +
                '<div class="search-result-item__snippet">' + escapeHtml(item.content ? item.content.substring(0, 80) : '') + '</div>' +
                '</a>';
      });
      searchResults.innerHTML = html;
    }

    function escapeHtml(text) {
      if (!text) return '';
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function openSearch() {
      searchOverlay.classList.add('active');
      searchInput.value = '';
      searchResults.innerHTML = '<div class="search-modal__loading">输入关键词开始搜索</div>';
      setTimeout(function () {
        searchInput.focus();
      }, 100);
    }

    function closeSearch() {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '<div class="search-modal__loading">输入关键词开始搜索</div>';
    }

    if (searchToggle) {
      searchToggle.addEventListener('click', openSearch);
    }

    if (searchClose) {
      searchClose.addEventListener('click', closeSearch);
    }

    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSearch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });

    searchInput.addEventListener('input', function () {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () {
        performSearch(searchInput.value.trim());
      }, 200);
    });

    loadSearchIndex();
  }

  // --- Comments ---
  function initComments() {
    var form = document.getElementById('comment-form');
    if (!form) return;

    var replyState = { parentId: null, author: null };
    var tip = document.getElementById('comment-tip');
    var cancelBtn = document.getElementById('comment-cancel');

    // Reply
    document.addEventListener('click', function (e) {
      var replyBtn = e.target.closest('.comment__reply');
      if (replyBtn) {
        e.preventDefault();
        replyState.parentId = replyBtn.getAttribute('data-id');
        replyState.author = replyBtn.getAttribute('data-author');
        if (tip) tip.textContent = '正在回复 @' + replyState.author + ' 的评论';
        if (cancelBtn) cancelBtn.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (cancelBtn && e.target.closest('.comment__cancel')) {
        e.preventDefault();
        replyState.parentId = null;
        replyState.author = null;
        if (tip) tip.textContent = '';
        cancelBtn.style.display = 'none';
        return;
      }
    });

    // Submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(form);

      if (replyState.parentId) {
        formData.append('parent', replyState.parentId);
      }

      var submitBtn = form.querySelector('.comment__submit');
      if (submitBtn) {
        submitBtn.textContent = '提交中...';
        submitBtn.disabled = true;
      }

      var action = '/api/comment';
      var xhr = new XMLHttpRequest();
      xhr.open('POST', action, true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
          // Reload comments section
          var commentWrapper = document.querySelector('.comment__wrapper');
          if (commentWrapper) {
            var url = window.location.pathname;
            fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
              .then(function (res) { return res.text(); })
              .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var newComments = doc.querySelector('.comment__wrapper');
                if (newComments) {
                  commentWrapper.innerHTML = newComments.innerHTML;
                }
              })
              .catch(function () {
                window.location.reload();
              });
          }
        } else {
          alert('评论提交失败，请重试');
        }
        if (submitBtn) {
          submitBtn.textContent = '提交评论';
          submitBtn.disabled = false;
        }
      };
      xhr.onerror = function () {
        alert('网络错误，请重试');
        if (submitBtn) {
          submitBtn.textContent = '提交评论';
          submitBtn.disabled = false;
        }
      };
      xhr.send(formData);

      // Reset
      replyState.parentId = null;
      replyState.author = null;
      if (tip) tip.textContent = '';
      if (cancelBtn) cancelBtn.style.display = 'none';
      form.querySelector('textarea').value = '';
    });
  }

  // --- Auto-resize textarea ---
  function initTextarea() {
    document.querySelectorAll('.comment__textarea').forEach(function (textarea) {
      textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
    });
  }

  // --- Relative Time Formatting ---
  function formatTime(timestamp) {
    var now = Math.floor(Date.now() / 1000);
    var diff = now - timestamp;

    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
    if (diff < 2592000) return Math.floor(diff / 86400) + ' 天前';

    var d = new Date(timestamp * 1000);
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0');
  }

  // --- Post Date Formatting ---
  function formatPostDates() {
    document.querySelectorAll('.meta__date[datetime]').forEach(function (el) {
      var datetime = el.getAttribute('datetime');
      if (datetime) {
        var ts = new Date(datetime).getTime() / 1000;
        if (!isNaN(ts)) {
          el.textContent = formatTime(ts);
        }
      }
    });
  }

  // --- Initialization ---
  function init() {
    initThemeToggle();
    initMobileNav();
    initSearch();
    initComments();
    initTextarea();
    formatPostDates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* 侧边栏统计：文章数取自引擎生成的全站索引 */
(function () {
  var el = document.getElementById('stat-post-count');
  if (!el) return;
  fetch('/api/search.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (entries) { el.textContent = String((entries || []).length); })
    .catch(function () { el.textContent = '0'; });
})();
