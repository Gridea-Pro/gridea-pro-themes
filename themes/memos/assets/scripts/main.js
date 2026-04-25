/* ============================================================
 * memos · main.js
 * 移植自 jkjoy/Typecho-Theme-Once（删除：加载更多 JSON 接口 / Typecho 评论楼层回复 / 点赞 ding；
 * 新增：prev/next 客户端查找 / 相关文章 tag 交集 / memo 热力图绘制）
 * 依赖：jQuery 3 + Bootstrap 5 (Offcanvas/Carousel/Dropdown)
 * ============================================================ */
(function ($, window, document) {
  'use strict';

  /* ============================================================
   * 1. 主题切换：auto / light / dark 三档
   *    - localStorage key: 'isDarkMode' ('1' / '0')，与原主题一致
   *    - defaultTheme=auto 时按 6:00–18:00 切换并 setTimeout 调度下一次
   * ============================================================ */
  var ThemeSwitch = {
    autoTimer: null,

    isDaytime: function () {
      var h = new Date().getHours();
      return h >= 6 && h < 18;
    },

    apply: function (dark) {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    /** 用户点击切换按钮：在 light/dark 之间切换，写入 localStorage */
    toggle: function () {
      var nowDark = document.documentElement.classList.contains('dark');
      var next = !nowDark;
      this.apply(next);
      try { localStorage.setItem('isDarkMode', next ? '1' : '0'); } catch (e) {}
    },

    /** auto 模式调度：到下一个 6:00 / 18:00 时切换 */
    scheduleAuto: function () {
      if (this.autoTimer) clearTimeout(this.autoTimer);
      var saved;
      try { saved = localStorage.getItem('isDarkMode'); } catch (e) { saved = null; }
      if (saved === '1' || saved === '0') return; // 用户已手动设置，不调度

      var now = new Date();
      var next = new Date(now);
      var h = now.getHours();
      if (h >= 6 && h < 18) {
        next.setHours(18, 0, 0, 0);
      } else {
        next.setHours(h < 6 ? 6 : 30, 0, 0, 0); // h>=18 → 明早 6:00 (30 = 24+6)
      }
      var ms = next.getTime() - now.getTime();
      var self = this;
      this.autoTimer = setTimeout(function () {
        self.apply(!self.isDaytime());
        self.scheduleAuto();
      }, Math.max(60000, ms));
    },

    init: function () {
      var self = this;
      // FOUC 防护已在 base.html 内联完成，这里只绑定按钮 + 调度 auto
      $(document).on('click', '.theme-switch', function (e) {
        e.preventDefault();
        self.toggle();
      });
      this.scheduleAuto();
    }
  };

  /* ============================================================
   * 2. 回到顶部按钮：滚动 > 200 出现
   * ============================================================ */
  var ScrollTop = {
    init: function () {
      var $btn = $('.scrollToTopBtn');
      if (!$btn.length) return;

      var ticking = false;
      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(function () {
            $btn.toggleClass('is-visible', window.scrollY > 200);
            ticking = false;
          });
          ticking = true;
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      $btn.on('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  /* ============================================================
   * 3. 代码块复制按钮：给 .wznrys pre / .memo-card-body pre 注入
   * ============================================================ */
  var CodeCopy = {
    btnLabel: '复制',
    btnOk: '已复制',
    btnFail: '失败',

    init: function () {
      var self = this;
      $('.wznrys pre, .memo-card-body pre').each(function () {
        if ($(this).find('.once-copy-btn').length) return;
        var $btn = $('<button type="button" class="once-copy-btn" aria-label="复制代码">' + self.btnLabel + '</button>');
        $(this).append($btn);
      });
      $(document).on('click', '.once-copy-btn', function (e) {
        e.preventDefault();
        var $pre = $(this).closest('pre');
        var text = $pre.find('code').text() || $pre.text();
        text = text.replace(/复制$|已复制$|失败$/, '').trim();
        self.copy(text, $(this));
      });
    },

    copy: function (text, $btn) {
      var done = function (ok) {
        $btn.text(ok ? this.btnOk : this.btnFail).addClass('is-copied');
        var self2 = this;
        setTimeout(function () { $btn.text(self2.btnLabel).removeClass('is-copied'); }, 1500);
      }.bind(this);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { done(document.execCommand('copy')); } catch (err) { done(false); }
        document.body.removeChild(ta);
      }
    }
  };

  /* ============================================================
   * 4. 图片 lightbox：点击正文图片放大
   * ============================================================ */
  var Lightbox = {
    $overlay: null,

    ensure: function () {
      if (this.$overlay && this.$overlay.length) return;
      this.$overlay = $('<div class="once-lightbox-overlay" role="dialog" aria-modal="true"><img alt=""></div>');
      $('body').append(this.$overlay);
      var self = this;
      this.$overlay.on('click', function () { self.close(); });
      $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && self.$overlay.hasClass('is-open')) self.close();
      });
    },

    open: function (src, alt) {
      this.ensure();
      this.$overlay.find('img').attr({ src: src, alt: alt || '' });
      this.$overlay.addClass('is-open');
      document.body.style.overflow = 'hidden';
    },

    close: function () {
      if (!this.$overlay) return;
      this.$overlay.removeClass('is-open');
      document.body.style.overflow = '';
    },

    init: function () {
      var self = this;
      $(document).on('click', '.wznrys img, .memo-card-body img', function (e) {
        if ($(this).closest('a').length) return; // 已包了链接的图片不拦截
        e.preventDefault();
        self.open(this.src, this.alt);
      });
    }
  };

  /* ============================================================
   * 5. 表格响应式包裹
   * ============================================================ */
  var TableWrap = {
    init: function () {
      $('.wznrys table, .memo-card-body table').each(function () {
        if ($(this).parent('.table-responsive-wrap').length) return;
        $(this).wrap('<div class="table-responsive-wrap"></div>');
      });
    }
  };

  /* ============================================================
   * 6. Carousel：首项激活（防 Bootstrap Carousel 没 .active 不动）
   * ============================================================ */
  var CarouselInit = {
    init: function () {
      $('.carousel').each(function () {
        var $car = $(this);
        if ($car.find('.carousel-item.active').length === 0) {
          $car.find('.carousel-item').first().addClass('active');
        }
        if ($car.find('.carousel-indicators .active').length === 0) {
          $car.find('.carousel-indicators button, .carousel-indicators li').first().addClass('active');
        }
      });
    }
  };

  /* ============================================================
   * 7. 全站搜索（Cmd/Ctrl+K + 实时匹配 window.__searchIndex）
   * ============================================================ */
  var Search = {
    debounceTimer: null,

    init: function () {
      var $input = $('#searchInput');
      var $results = $('#searchResults');
      var $panel = $('#searchPanel');

      if (!$input.length || !$panel.length) return;

      // 全局快捷键
      $(document).on('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          var inst = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('searchPanel'));
          inst.toggle();
        }
        if (e.key === 'Escape' && $panel.hasClass('show')) {
          var inst2 = bootstrap.Offcanvas.getInstance(document.getElementById('searchPanel'));
          if (inst2) inst2.hide();
        }
      });

      // 打开后自动 focus
      document.getElementById('searchPanel').addEventListener('shown.bs.offcanvas', function () {
        $input.trigger('focus');
      });

      // 输入：debounced 300ms
      var self = this;
      $input.on('input', function () {
        var q = $(this).val();
        clearTimeout(self.debounceTimer);
        self.debounceTimer = setTimeout(function () { self.run(q, $results); }, 200);
      });
    },

    run: function (q, $results) {
      var query = (q || '').trim();
      if (!query) {
        $results.html(this.emptyHtml());
        return;
      }
      var data = window.__searchIndex || [];
      if (!data.length) {
        $results.html('<div class="search-empty"><p>没有可搜索的内容</p></div>');
        return;
      }
      var hits = this.match(data, query);
      if (!hits.length) {
        $results.html('<div class="search-empty"><i class="bi bi-emoji-frown search-empty-icon"></i><p>没有找到相关内容</p><p class="search-empty-hint">换个关键词试试</p></div>');
        return;
      }
      $results.html(this.renderList(hits, query));
    },

    match: function (data, q) {
      var lq = q.toLowerCase();
      var hits = [];
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var score = 0;
        var title = (item.title || '').toLowerCase();
        var excerpt = (item.excerpt || '').toLowerCase();
        var tags = (item.tags || []).join(' ').toLowerCase();
        if (title.indexOf(lq) !== -1) score += 10;
        if (tags.indexOf(lq) !== -1) score += 5;
        if (excerpt.indexOf(lq) !== -1) score += 2;
        if (score > 0) hits.push({ item: item, score: score });
      }
      hits.sort(function (a, b) { return b.score - a.score; });
      return hits.slice(0, 30);
    },

    renderList: function (hits, q) {
      var html = '<ul class="search-result-list">';
      for (var i = 0; i < hits.length; i++) {
        var it = hits[i].item;
        var memoBadge = it.isMemo ? '<span class="search-result-badge--memo">闪念</span>' : '';
        var tagsStr = it.tags && it.tags.length ? '<i class="bi bi-tags"></i> ' + this.escape(it.tags.slice(0, 3).join(' / ')) : '';
        html += '<li><a class="search-result-item" href="' + this.escape(it.link) + '">' +
                '<h4 class="search-result-title">' + this.highlight(this.escape(it.title), q) + '</h4>' +
                (it.excerpt ? '<p class="search-result-excerpt">' + this.highlight(this.escape(it.excerpt), q) + '</p>' : '') +
                '<div class="search-result-meta">' + memoBadge + (it.date ? '<span><i class="bi bi-calendar3"></i> ' + this.escape(it.date) + '</span>' : '') + (tagsStr ? '<span>' + tagsStr + '</span>' : '') + '</div>' +
                '</a></li>';
      }
      html += '</ul>';
      return html;
    },

    highlight: function (text, q) {
      if (!q) return text;
      try {
        var safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(safe, 'gi'), function (m) {
          return '<span class="search-result-highlight">' + m + '</span>';
        });
      } catch (e) { return text; }
    },

    escape: function (s) {
      if (s == null) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    emptyHtml: function () {
      return '<div class="search-empty">' +
             '<i class="bi bi-search search-empty-icon"></i>' +
             '<p>输入关键词开始搜索</p>' +
             '<p class="search-empty-hint">支持文章标题、摘要、标签、闪念内容</p>' +
             '</div>';
    }
  };

  /* ============================================================
   * 8. post 详情：上一篇 / 下一篇（在 search-index 里查邻居）
   * ============================================================ */
  var PostNeighbor = {
    init: function () {
      var $wrap = $('#postNavAround');
      if (!$wrap.length) return;
      var data = window.__searchIndex || [];
      if (!data.length) return;
      var current = $wrap.data('current-link');
      if (!current) return;

      // 过滤掉闪念，仅在普通文章里找邻居
      var posts = data.filter(function (x) { return !x.isMemo; });
      var idx = -1;
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].link === current) { idx = i; break; }
      }
      if (idx < 0) return;

      // search-index 是按发布时间倒序（与 posts 一致），所以：
      //   "上一篇" = 时间更早 = idx + 1
      //   "下一篇" = 时间更晚 = idx - 1
      var prev = posts[idx + 1];
      var next = posts[idx - 1];

      if (prev) {
        $('#postNavPrev').attr('href', prev.link)
          .find('.post-nav-side-title').text(prev.title);
        $('#postNavPrev').show().attr('hidden', null);
      }
      if (next) {
        $('#postNavNext').attr('href', next.link)
          .find('.post-nav-side-title').text(next.title);
        $('#postNavNext').show().attr('hidden', null);
      }
      if (prev || next) $wrap.show().attr('hidden', null);
    }
  };

  /* ============================================================
   * 9. post 详情：相关文章（按 tag 交集，最多 6 篇）
   * ============================================================ */
  var PostRelated = {
    MAX: 6,

    init: function () {
      var $wrap = $('#postRelated');
      var $list = $('#postRelatedList');
      if (!$wrap.length || !$list.length) return;

      var tagsEl = document.getElementById('post-tags-data');
      var current = $('#postNavAround').data('current-link');
      if (!tagsEl) return;
      var tags;
      try { tags = JSON.parse(tagsEl.textContent); } catch (e) { return; }
      if (!tags || !tags.length) return;

      var data = (window.__searchIndex || []).filter(function (x) {
        return !x.isMemo && x.link !== current;
      });

      var hits = [];
      for (var i = 0; i < data.length; i++) {
        var post = data[i];
        var inter = 0;
        for (var j = 0; j < (post.tags || []).length; j++) {
          if (tags.indexOf(post.tags[j]) !== -1) inter++;
        }
        if (inter > 0) hits.push({ post: post, score: inter });
      }
      if (!hits.length) return;
      hits.sort(function (a, b) { return b.score - a.score; });
      hits = hits.slice(0, this.MAX);

      var html = hits.map(function (h) {
        return '<li class="post-related-item"><a href="' + Search.escape(h.post.link) + '" title="' + Search.escape(h.post.title) + '">' + Search.escape(h.post.title) + '</a></li>';
      }).join('');
      $list.html(html);
      $wrap.show().attr('hidden', null);
    }
  };

  /* ============================================================
   * 10. memo 热力图绘制（读 window.__memoDates）
   * ============================================================ */
  var Heatmap = {
    DAYS: 364, // 52 周 * 7 天

    init: function () {
      var grid = document.getElementById('memoHeatmap');
      var counter = document.getElementById('memoHeatmapCount');
      if (!grid) return;

      var dates = window.__memoDates || [];
      var byDay = {}; // 'YYYY-MM-DD' -> count
      for (var i = 0; i < dates.length; i++) {
        var key = this.normalize(dates[i]);
        if (!key) continue;
        byDay[key] = (byDay[key] || 0) + 1;
      }
      if (counter) counter.textContent = dates.length + ' 条';

      // 重新生成 53 列 × 7 行（按周对齐到当前周）
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      // 找到最近的周日作为最右一列底部
      var endDow = today.getDay(); // 0=Sun
      var totalCells = (53 * 7);
      var startOffset = totalCells - 1 - endDow; // 从今天往前 startOffset 天

      grid.innerHTML = '';
      for (var col = 0; col < 53; col++) {
        var colEl = document.createElement('div');
        colEl.className = 'memo-heatmap-col';
        for (var row = 0; row < 7; row++) {
          var idx = col * 7 + row;
          var daysAgo = startOffset - idx;
          var d = new Date(today);
          d.setDate(today.getDate() - daysAgo);
          var key2 = this.fmt(d);
          var n = byDay[key2] || 0;
          var lvl = this.level(n);
          var cell = document.createElement('span');
          cell.className = 'memo-heatmap-cell memo-heatmap-cell--l' + lvl;
          cell.title = key2 + (n ? ' · ' + n + ' 条' : ' · 无');
          if (daysAgo < 0) cell.style.visibility = 'hidden';
          colEl.appendChild(cell);
        }
        grid.appendChild(colEl);
      }
    },

    /** 数据日期可能是 'YYYY-MM-DD HH:mm:ss' 或别的格式，归一化为 'YYYY-MM-DD' */
    normalize: function (s) {
      if (!s) return null;
      var m = String(s).match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
      if (!m) return null;
      return m[1] + '-' + this.pad(m[2]) + '-' + this.pad(m[3]);
    },

    fmt: function (d) {
      return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate());
    },

    pad: function (n) { return (n < 10 ? '0' : '') + n; },

    level: function (n) {
      if (n <= 0) return 0;
      if (n === 1) return 1;
      if (n <= 3) return 2;
      if (n <= 6) return 3;
      return 4;
    }
  };

  /* ============================================================
   * Boot
   * ============================================================ */
  $(function () {
    ThemeSwitch.init();
    ScrollTop.init();
    CodeCopy.init();
    Lightbox.init();
    TableWrap.init();
    CarouselInit.init();
    Search.init();
    PostNeighbor.init();
    PostRelated.init();
    Heatmap.init();
  });

}(window.jQuery, window, document));
