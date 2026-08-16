/* ============================================================
   chatgpt theme — app.js
   文案随机 / 主题切换 / 侧栏收起与抽屉 / 用户菜单 /
   最近文章 / 代码块增强 / 文章操作
   ============================================================ */
(function () {
  'use strict';

  var html = document.documentElement;

  /* ══════════ 0. 对话文案随机引擎 ══════════
     优先用站长在主题设置里配置的候选（data-ask / data-reply，每行一条）；
     未配置时使用内置默认候选（与 config.json 默认值一致）。
     每次访问随机挑一条，支持 {name} / {count} 占位符。 */

  var TEXT_DEFAULTS = {
    askIndex: ['推开这扇门，会遇见什么？', '在无边的互联网里，这里是谁的角落？', '你好呀，带我逛逛这里吧？'],
    askBlog: ['那些写下的字，都还在吗？', '从第一篇到最新一篇，你都写了些什么？', '把你的文章都拿给我看看吧？'],
    askArchives: ['时间都去哪儿了？', '帮我把时光按年份叠好，可以吗？', '回头看看，这些年留下了什么足迹？'],
    askMemos: ['那些一闪而过的念头，你都抓住了吗？', '夜深人静的时候，你在想些什么？', '灵感来敲门的时候，你在家吗？'],
    askTags: ['如果给你的文字贴上标签，会有哪些？', '这些文字，都围绕着什么打转？'],
    askTag: ['「{name}」——关于它，你写过什么？', '聊聊「{name}」吧，我想听。'],
    askCategory: ['「{name}」这个抽屉里，收着什么？', '打开「{name}」，让我看看里面。'],
    askLinks: ['在互联网的茫茫人海里，你和谁相遇过？', '介绍几个你的朋友给我认识吧？'],
    askAbout: ['屏幕背后的你，是个怎样的人？', '说说你自己吧，我想认识你。'],
    askHomeMemos: ['最近在想些什么？', '除了长文，还有什么碎碎念？', '此刻脑子里飘过什么念头？'],
    ask404: ['咦，这条路好像走不通了？', '我是不是迷路了？'],
    replyBlog: ['都在这里了——{count} 篇，每一篇都是某个时刻的我。', '一共 {count} 篇。字会记得写下它们的人。'],
    replyArchives: ['我把 {count} 篇文字按年份叠好了，沿着时间往回走吧。', '好的，{count} 篇，从此刻一路向过去铺展。'],
    replyMemos: ['抓住了一些，像把萤火虫装进玻璃瓶——{count} 个还亮着。', '都在这儿了，{count} 条碎碎念，未经打磨，恰好真实。'],
    replyTags: ['大概是这 {count} 个词，圈住了我反复思考的事：', '数了数，{count} 个话题，深浅不一，都是真心：'],
    replyTag: ['关于「{name}」，我留下过 {count} 篇思考：', '「{name}」啊——写过 {count} 篇，每篇都认真：'],
    replyCategory: ['「{name}」这个抽屉里收着 {count} 篇：', '打开「{name}」，里面是 {count} 篇文字：'],
    replyLinks: ['这些是散落在网络各处的朋友们，每一个都值得专程拜访：', '互联网很大，能相遇是缘分。这是我的朋友们：'],
    replyHomeMemos: ['几条新鲜的闪念，未经打磨，恰好真实：', '刚抓住的几只萤火虫，拿给你看看：'],
    reply404: ['抱歉，这个页面像一封寄丢的信。不过没关系，我们可以回到起点重新出发。', '这里什么都没有——也许它搬家了，也许它从未存在过。回首页看看吧。']
  };

  function pickVariant(el, attr) {
    var raw = el.getAttribute(attr) || '';
    var variants = raw.split('\n').map(function (s) {
      return s.trim();
    }).filter(Boolean);
    if (!variants.length) {
      variants = TEXT_DEFAULTS[el.getAttribute('data-scene')] || [];
    }
    if (!variants.length) return; // 无候选：保留服务端渲染的默认文案
    var text = variants[Math.floor(Math.random() * variants.length)];
    text = text.replace(/\{name\}/g, el.getAttribute('data-name') || '');
    text = text.replace(/\{count\}/g, el.getAttribute('data-count') || '');
    el.textContent = text;
  }

  document.querySelectorAll('[data-ask]').forEach(function (el) {
    pickVariant(el, 'data-ask');
  });
  document.querySelectorAll('[data-reply]').forEach(function (el) {
    pickVariant(el, 'data-reply');
  });

  /* ══════════ 0.5 开场回答打字机 ══════════
     只打每页开场那条回复（.chat-thread 直接子级的第一个 intro）；
     递归重建 DOM 逐字打，保留 <strong> 等内联标签。 */

  function typewrite(el) {
    var SPEED = 26;
    var src = el.cloneNode(true);
    el.innerHTML = '';
    el.classList.add('is-typing');

    function typeInto(srcNode, dstParent, done) {
      if (srcNode.nodeType === Node.TEXT_NODE) {
        var text = srcNode.textContent;
        var tn = document.createTextNode('');
        dstParent.appendChild(tn);
        var i = 0;
        (function step() {
          if (i < text.length) {
            tn.textContent += text.charAt(i++);
            setTimeout(step, SPEED);
          } else {
            done();
          }
        })();
      } else {
        var clone = srcNode.cloneNode(false);
        dstParent.appendChild(clone);
        var kids = Array.prototype.slice.call(srcNode.childNodes);
        var idx = 0;
        (function next() {
          if (idx < kids.length) {
            typeInto(kids[idx++], clone, next);
          } else {
            done();
          }
        })();
      }
    }

    var top = Array.prototype.slice.call(src.childNodes);
    var t = 0;
    (function next() {
      if (t < top.length) {
        typeInto(top[t++], el, next);
      } else {
        el.classList.remove('is-typing');
      }
    })();
  }

  var typewriterOn =
    // pongo2 输出布尔为 "True"/"False"（大写），统一小写后判断
    (document.body.getAttribute('data-typewriter') || '').toLowerCase() !== 'false' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typewriterOn) {
    var introEl = document.querySelector('.chat-thread > .msg--assistant .msg__intro');
    // 超长文案不打（等待成本高），直接显示
    if (introEl && introEl.textContent.trim() && introEl.textContent.length <= 160) {
      typewrite(introEl);
    }
  }

  /* ══════════ 0.6 首页闪念动态 ══════════
     从侧边栏导航找到闪念页链接，fetch 该页 HTML 解析 .memo-card，
     取最新 3 条填充；无闪念菜单或抓取失败则整组保持隐藏。 */

  var homeMemos = document.getElementById('home-memos');
  if (homeMemos) {
    var memoLink = '';
    document.querySelectorAll('.sidebar__nav-item').forEach(function (item) {
      var link = item.getAttribute('data-link') || '';
      if (!memoLink && link.indexOf('memo') !== -1) memoLink = link;
    });

    if (memoLink) {
      fetch(memoLink)
        .then(function (r) {
          return r.ok ? r.text() : Promise.reject(new Error(String(r.status)));
        })
        .then(function (htmlText) {
          var doc = new DOMParser().parseFromString(htmlText, 'text/html');
          var cards = doc.querySelectorAll('.memo-card');
          if (!cards.length) return;
          var list = document.getElementById('home-memos-list');
          Array.prototype.slice.call(cards, 0, 3).forEach(function (card) {
            var content = card.querySelector('.memo-card__content');
            var time = card.querySelector('.memo-card__time');
            var item = document.createElement('div');
            item.className = 'home-memo';
            var body = document.createElement('div');
            body.className = 'home-memo__content';
            // 闪念正文是站长自己发布的同源内容
            body.innerHTML = content ? content.innerHTML : '';
            item.appendChild(body);
            if (time) {
              var timeEl = document.createElement('time');
              timeEl.className = 'home-memo__time';
              timeEl.textContent = time.textContent;
              item.appendChild(timeEl);
            }
            list.appendChild(item);
          });
          var more = document.getElementById('home-memos-more');
          if (more) more.href = memoLink;
          homeMemos.hidden = false;
        })
        .catch(function () {});
    }
  }

  /* ══════════ 1. 深浅模式切换 ══════════ */

  function currentTheme() {
    return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncHljsTheme() {
    var light = document.getElementById('hljs-theme-light');
    var dark = document.getElementById('hljs-theme-dark');
    if (!light || !dark) return;
    var isDark = currentTheme() === 'dark';
    light.disabled = isDark;
    dark.disabled = !isDark;
  }

  function syncGiscusTheme() {
    var frame = document.querySelector('iframe.giscus-frame');
    if (!frame) return;
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: currentTheme() } } },
      'https://giscus.app'
    );
  }

  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try {
      localStorage.setItem('chatgpt-theme', next);
    } catch (e) {}
    syncHljsTheme();
    syncGiscusTheme();
  }

  syncHljsTheme();

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  var menuTheme = document.getElementById('user-menu-theme');
  if (menuTheme) menuTheme.addEventListener('click', toggleTheme);

  /* ══════════ 2. 侧边栏：移动端抽屉 + 桌面端收起 ══════════ */

  var isMobile = function () {
    return window.matchMedia('(max-width: 920px)').matches;
  };

  function openDrawer() {
    document.body.classList.add('sidebar-open', 'no-scroll');
  }
  function closeDrawer() {
    document.body.classList.remove('sidebar-open', 'no-scroll');
  }

  var btnOpen = document.getElementById('sidebar-open');
  var btnCollapse = document.getElementById('sidebar-collapse');
  var overlay = document.getElementById('sidebar-overlay');

  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      if (isMobile()) {
        openDrawer();
      } else {
        html.classList.remove('sidebar-collapsed');
        try {
          localStorage.setItem('chatgpt-sidebar', 'open');
        } catch (e) {}
      }
    });
  }
  if (btnCollapse) {
    btnCollapse.addEventListener('click', function () {
      if (isMobile()) {
        closeDrawer();
      } else {
        html.classList.add('sidebar-collapsed');
        try {
          localStorage.setItem('chatgpt-sidebar', 'collapsed');
        } catch (e) {}
      }
    });
  }
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ══════════ 3. 用户菜单 ══════════ */

  var userToggle = document.getElementById('user-menu-toggle');
  var userMenu = document.getElementById('user-menu');
  if (userToggle && userMenu) {
    userToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !userMenu.hidden;
      userMenu.hidden = open;
      userToggle.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', function (e) {
      if (!userMenu.hidden && !userMenu.contains(e.target) && e.target !== userToggle) {
        userMenu.hidden = true;
        userToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ══════════ 4. 导航当前页高亮 ══════════ */

  var path = location.pathname;
  document.querySelectorAll('.sidebar__nav-item').forEach(function (item) {
    var link = item.getAttribute('data-link') || '';
    if (link === '/') {
      if (path === '/' || path.indexOf('/page/') === 0) item.classList.add('is-active');
    } else if (link && path.indexOf(link.replace(/\/$/, '')) === 0) {
      item.classList.add('is-active');
    }
  });

  /* ══════════ 5. 侧边栏「最近」：fetch 全站索引 ══════════ */

  window.__searchIndexPromise =
    window.__searchIndexPromise ||
    fetch('/api/search.json')
      .then(function (r) {
        return r.ok ? r.json() : [];
      })
      .catch(function () {
        return [];
      });

  var recentList = document.getElementById('sidebar-recent');
  if (recentList) {
    var recentMax = parseInt(recentList.getAttribute('data-count'), 10) || 20;
    window.__searchIndexPromise.then(function (entries) {
      if (!entries || !entries.length) {
        var parent = recentList.closest('.sidebar__recent');
        if (parent) parent.style.display = 'none';
        return;
      }
      var sorted = entries.slice();
      var parseable = sorted.every(function (e) {
        return !isNaN(Date.parse(e.date));
      });
      if (parseable) {
        sorted.sort(function (a, b) {
          return Date.parse(b.date) - Date.parse(a.date);
        });
      }
      var frag = document.createDocumentFragment();
      sorted.slice(0, recentMax).forEach(function (e) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = e.link;
        a.textContent = e.title;
        a.title = e.title;
        if (e.link === path) a.classList.add('is-active');
        li.appendChild(a);
        frag.appendChild(li);
      });
      recentList.appendChild(frag);
    });
  }

  /* ══════════ 6. 代码块增强：语言标签 + 复制按钮 + 高亮 ══════════ */

  var COPY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      resolve();
    });
  }

  document.querySelectorAll('.article-content pre').forEach(function (pre) {
    if (pre.dataset.enhanced) return;
    pre.dataset.enhanced = '1';

    var code = pre.querySelector('code');
    var lang = '';
    if (code) {
      var m = (code.className || '').match(/language-(\w+)/);
      if (m) lang = m[1];
    }

    var langEl = document.createElement('span');
    langEl.className = 'codeblock-lang';
    langEl.textContent = lang || 'code';
    pre.appendChild(langEl);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'codeblock-copy';
    btn.innerHTML = COPY_ICON + '<span>复制</span>';
    btn.addEventListener('click', function () {
      var text = code ? code.innerText : pre.innerText;
      copyText(text).then(function () {
        btn.querySelector('span').textContent = '已复制';
        setTimeout(function () {
          btn.querySelector('span').textContent = '复制';
        }, 1600);
      });
    });
    pre.appendChild(btn);
  });

  function highlightAll() {
    if (window.hljs) {
      document.querySelectorAll('.article-content pre code').forEach(function (block) {
        window.hljs.highlightElement(block);
      });
    }
  }
  if (window.hljs) {
    highlightAll();
  } else {
    window.addEventListener('load', highlightAll);
  }

  /* ══════════ 7. 文章操作按钮 ══════════ */

  function flashDone(btn) {
    btn.classList.add('is-done');
    setTimeout(function () {
      btn.classList.remove('is-done');
    }, 1600);
  }

  var copyLinkBtn = document.getElementById('copy-link');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function () {
      copyText(copyLinkBtn.getAttribute('data-link') || location.href).then(function () {
        flashDone(copyLinkBtn);
      });
    });
  }

  var copyTextBtn = document.getElementById('copy-text');
  if (copyTextBtn) {
    copyTextBtn.addEventListener('click', function () {
      var article = document.getElementById('article-content');
      if (article) {
        copyText(article.innerText).then(function () {
          flashDone(copyTextBtn);
        });
      }
    });
  }

  var backTopBtn = document.getElementById('back-top');
  if (backTopBtn) {
    backTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
