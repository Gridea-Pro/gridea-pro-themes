/*
 * Chirping Gridea Theme - Main JS
 * Handles Sidebar toggle, Theme Switching, Search Modal, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  const html = document.documentElement;
  const body = document.body;
  const storageKey = 'chirping-gridea-theme';
  const configuredMode = body ? body.getAttribute('data-theme-mode') || 'auto' : 'auto';
  const langButton = document.getElementById('header-lang-btn');

  // i18n dictionary & helpers live in i18n-boot.js (loaded synchronously before
  // this deferred script) to eliminate FOUC. Reuse them here as the single source.
  const i18n = window.ChirpyI18n || { messages: { zh: {}, en: {} }, getLanguage: () => 'zh', setLanguageLabel: () => {}, applyLanguageStatic: () => {} };
  const messages = i18n.messages;
  const languageStorageKey = i18n.storageKey || 'chirping-gridea-language';
  const getLanguage = i18n.getLanguage;
  const setLanguageLabel = i18n.setLanguageLabel;

  let refreshDynamicLabels = () => {};

  // applyLanguage delegates the static translation to i18n-boot.js (already run
  // once at load), then refreshes dynamic labels (code-collapse buttons, etc.)
  // which are owned by this script. Safe to call repeatedly (idempotent).
  const applyLanguage = (lang) => {
    i18n.applyLanguageStatic(lang);
    refreshDynamicLabels();
  };

  // Static labels were already translated by i18n-boot.js before this deferred
  // script ran, so no early applyLanguage() call is needed here. Dynamic labels
  // are initialised later (see updateCodeCollapseButtonText / refreshDynamicLabels).

  const handleImageLoad = (img) => {

    const markDone = () => {
       img.classList.remove('is-loading');
       const wrap = img.closest('.post-card-image-wrap') || img.closest('.post-hero') || img.closest('.avatar-wrap') || img.closest('.friend-card-avatar-wrap');
       if (wrap) wrap.classList.remove('is-loading');
     };

    if (img.complete && img.naturalWidth > 0) {
      markDone();
    } else {
      img.addEventListener('load', markDone, { once: true });
      img.addEventListener('error', markDone, { once: true });
      // Fallback: force remove after 5s
      setTimeout(markDone, 5000);
    }
  };

  document.querySelectorAll('.post-card-image, .post-hero img, .post-content img, .prose img, .avatar-img, .friend-card-avatar').forEach(handleImageLoad);



  // renderRecentUpdates(); // Removed to let Jinja2 handle it directly

  // --- Theme Toggle Logic ---
  const updateTheme = (newTheme) => {
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  // Circular theme reveal via View Transitions API, ported from the Astro
  // reference site. Directional polish:
  //   to-dark  → new (dark) image revealed on top (circle expands)
  //   to-light → old (dark) image concealed on top (circle shrinks)
  // Origin is fixed at the bottom-left corner so the sweep always goes
  // diagonally toward the top-right, matching user preference.
  // Browsers without startViewTransition fall back to an instant toggle.
  const supportsViewTransition = typeof document.startViewTransition === 'function';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toggleThemeAnimated = () => {
    const currentTheme = html.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (!supportsViewTransition || prefersReducedMotion) {
      updateTheme(nextTheme);
      return;
    }

    // Fixed origin: bottom-left corner → sweep toward top-right.
    const x = 0;
    const y = window.innerHeight;
    // Radius to cover the farthest corner (top-right) from bottom-left.
    const radius = Math.hypot(window.innerWidth, window.innerHeight);

    html.style.setProperty('--theme-x', x + 'px');
    html.style.setProperty('--theme-y', y + 'px');
    html.style.setProperty('--theme-radius', radius + 'px');
    html.dataset.themeAnim = nextTheme === 'dark' ? 'to-dark' : 'to-light';

    const transition = document.startViewTransition(function () {
      updateTheme(nextTheme);
    });
    transition.finished.finally(function () {
      delete html.dataset.themeAnim;
    });
  };

  const initThemeToggle = (btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', toggleThemeAnimated);
    }
  };

  initThemeToggle('theme-toggle'); // Header toggle
  initThemeToggle('sidebar-theme-toggle'); // Sidebar toggle

  if (langButton) {
    langButton.addEventListener('click', () => {
      const current = getLanguage();
      const next = current === 'zh' ? 'en' : 'zh';
      try {
        localStorage.setItem(languageStorageKey, next);
      } catch (e) {}
      applyLanguage(next);
    });
  }

  // --- Sidebar Toggle ---
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarMask = document.getElementById('sidebar-mask');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      if (sidebarMask) sidebarMask.classList.toggle('is-visible');
    });
  }

  if (sidebarMask) {
    sidebarMask.addEventListener('click', () => {
      sidebar.classList.remove('is-open');
      sidebarMask.classList.remove('is-visible');
    });
  }

  // --- Search Modal ---
  const searchModal = document.getElementById('search-modal');
  const searchTriggers = [
    document.getElementById('search-trigger'), // Panel pill
    document.getElementById('header-search-trigger') // Header icon
  ];
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const recentList = document.querySelector('[data-recent-list]');

  let siteIndexPromise = null;
  const loadSiteIndex = async () => {
    if (!siteIndexPromise) {
      siteIndexPromise = fetch('/api/search.json', { credentials: 'same-origin' })
        .then((response) => (response.ok ? response.json() : []))
        .then(async (json) => {
          if (Array.isArray(json) && json.length > 0) return json;
          const feedResponse = await fetch('/feed.xml', { credentials: 'same-origin' });
          if (!feedResponse.ok) return [];
          const feedText = await feedResponse.text();
          const xml = new DOMParser().parseFromString(feedText, 'application/xml');
          const entries = Array.from(xml.getElementsByTagName('entry'));
          const items = entries.length > 0 ? entries : Array.from(xml.getElementsByTagName('item'));
          return items.map((entry) => {
            const titleNode = entry.getElementsByTagName('title')[0];
            const linkNode = entry.getElementsByTagName('link')[0];
            const updatedNode = entry.getElementsByTagName('updated')[0]
              || entry.getElementsByTagName('published')[0]
              || entry.getElementsByTagName('pubDate')[0];
            return {
              title: titleNode ? titleNode.textContent || '' : '',
              link: linkNode ? (linkNode.getAttribute('href') || linkNode.textContent || '#') : '#',
              updated: updatedNode ? updatedNode.textContent || '' : ''
            };
          }).filter((post) => post.title && post.link);
        })
        .catch(() => []);
    }
    return siteIndexPromise;
  };

  const parsePostTime = (post) => {
    const source = post.updated || post.updatedAt || post.date || post.dateFormat || '';
    const timestamp = Date.parse(source);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const renderRecentUpdates = async () => {
    if (!recentList) return;

    const currentLang = getLanguage();
    const posts = await loadSiteIndex();

    if (!Array.isArray(posts) || posts.length === 0) {
      recentList.innerHTML = '<div class="aside-empty">' + messages[currentLang]['panel.noRecent'] + '</div>';
      return;
    }

    const recent = posts
      .slice()
      .sort((a, b) => parsePostTime(b) - parsePostTime(a))
      .slice(0, 5);

    if (recent.length === 0) {
      recentList.innerHTML = '<div class="aside-empty">' + messages[currentLang]['panel.noRecent'] + '</div>';
      return;
    }

    recentList.innerHTML = recent.map((post) => {
      const link = escapeHtml(post.link || '#');
      const title = escapeHtml(post.title || '');
      return '<a class="aside-item" href="' + link + '"><span class="aside-item-text">' + title + '</span></a>';
    }).join('');
  };

  const openSearch = () => {
    if (searchModal) {
      searchModal.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput.focus(), 50);
    }
  };

  const closeSearch = () => {
    if (searchModal) {
      searchModal.classList.remove('is-visible');
      document.body.style.overflow = '';
    }
  };

  searchTriggers.forEach(trigger => {
    if (trigger) trigger.addEventListener('click', openSearch);
  });

  if (searchClose) searchClose.addEventListener('click', closeSearch);
  
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !searchModal.classList.contains('is-visible') && 
        e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && searchModal.classList.contains('is-visible')) {
      closeSearch();
    }
  });

  // Search Logic
  const searchSourceItems = Array.from(document.querySelectorAll('.search-source-item'));
  const searchPosts = searchSourceItems.map((item) => ({
    title: (item.querySelector('.search-source-title') || {}).textContent || '',
    link: item.getAttribute('data-link') || '',
    date: item.getAttribute('data-date') || '',
    abstract: (item.querySelector('.search-source-abstract') || {}).textContent || ''
  }));

  renderRecentUpdates();

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        const currentLang = getLanguage();
        searchResults.innerHTML = '<div class="search-no-results">' + messages[currentLang]['search.empty'] + '</div>';
        return;
      }

      const filtered = searchPosts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.abstract.toLowerCase().includes(query)
      );

      if (filtered.length > 0) {
        searchResults.innerHTML = filtered.map(post => `
          <a href="${post.link}" class="search-result-item">
            <div class="search-result-title">${post.title}</div>
            <div class="search-result-meta">${post.date}</div>
            <div class="search-result-abstract">${post.abstract}</div>
          </a>
        `).join('');
      } else {
        const currentLang = getLanguage();
        const noResultsText = currentLang === 'zh'
          ? `没有找到与 "${query}" 相关的结果`
          : `No results found for "${query}"`;
        searchResults.innerHTML = `<div class="search-no-results">${noResultsText}</div>`;
      }
    });
  }

  // --- Back to Top ---
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }

  document.querySelectorAll('[data-decode-entities="true"]').forEach((node) => {
    const text = node.textContent;
    if (!text || text.indexOf('&') === -1) return;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    node.textContent = textarea.value;
  });

  const decodeHtmlText = (value) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = String(value || '');
    return textarea.value;
  };

  const normalizeCompareText = (value) => {
    return decodeHtmlText(value)
      .replace(/<!--\s*more\s*-->/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractBilibiliEmbedInfo = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return null;

    let page = 1;
    let bvid = '';
    let aid = '';

    if (/^https?:\/\//i.test(raw)) {
      try {
        const url = new URL(raw);
        const pathMatch = url.pathname.match(/\/video\/((?:BV[\w]+)|(?:av\d+))/i);
        const pageValue = Number(url.searchParams.get('p') || url.searchParams.get('page') || '1');
        if (Number.isFinite(pageValue) && pageValue > 0) page = pageValue;
        if (pathMatch && pathMatch[1]) {
          if (/^BV/i.test(pathMatch[1])) {
            bvid = pathMatch[1];
          } else if (/^av/i.test(pathMatch[1])) {
            aid = pathMatch[1].replace(/^av/i, '');
          }
        }
      } catch (e) {
        return null;
      }
    } else {
      const rawMatch = raw.match(/^((?:BV[\w]+)|(?:av\d+))(?:[?&](?:p|page)=(\d+))?$/i);
      if (!rawMatch) return null;
      if (/^BV/i.test(rawMatch[1])) {
        bvid = rawMatch[1];
      } else {
        aid = rawMatch[1].replace(/^av/i, '');
      }
      if (rawMatch[2]) {
        const pageValue = Number(rawMatch[2]);
        if (Number.isFinite(pageValue) && pageValue > 0) page = pageValue;
      }
    }

    if (!bvid && !aid) return null;

    return { bvid, aid, page };
  };

  const isMoreMarkerOnly = (value) => {
    return /^(&lt;!--\s*more\s*--&gt;|<!--\s*more\s*-->)$/i.test(String(value || '').trim());
  };

  const postContent = document.getElementById('post-content');
  const postSummary = document.querySelector('.post-summary');

  if (postContent) {
    postContent.querySelectorAll('p, div, span').forEach((node) => {
      if (isMoreMarkerOnly(node.innerHTML) || isMoreMarkerOnly(node.textContent)) {
        node.remove();
      }
    });

    Array.from(postContent.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && isMoreMarkerOnly(node.textContent)) {
        node.remove();
      }
    });
  }

  if (postContent && postSummary) {
    const summaryText = normalizeCompareText(postSummary.textContent);
    if (summaryText) {
      const introNodes = [];
      let combinedText = '';

      for (const node of Array.from(postContent.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!node.textContent.trim()) continue;
          break;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const tagName = node.tagName;
        const nodeText = normalizeCompareText(node.textContent);

        if (!nodeText) {
          if (isMoreMarkerOnly(node.innerHTML)) {
            introNodes.push(node);
            continue;
          }
          continue;
        }

        if (!['P', 'DIV', 'BLOCKQUOTE'].includes(tagName)) break;

        introNodes.push(node);
        combinedText = normalizeCompareText(combinedText + ' ' + nodeText);

        if (combinedText === summaryText) {
          introNodes.forEach((entry) => entry.remove());
          break;
        }

        if (!summaryText.startsWith(combinedText)) {
          break;
        }
      }
    }
  }

  if (postContent) {
    const currentDict = messages[getLanguage()] || messages.zh;
    postContent.querySelectorAll('p').forEach((node) => {
      let embedSource = '';
      const rawText = node.textContent ? node.textContent.trim() : '';
      const rawMatch = rawText.match(/^@\[bilibili\]\((.+?)\)$/i);

      if (rawMatch && rawMatch[1]) {
        embedSource = rawMatch[1];
      } else {
        const meaningfulChildren = Array.from(node.childNodes).filter((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            return child.textContent && child.textContent.trim();
          }
          return true;
        });

        if (
          meaningfulChildren.length === 1 &&
          meaningfulChildren[0].nodeType === Node.ELEMENT_NODE &&
          meaningfulChildren[0].tagName === 'A'
        ) {
          const link = meaningfulChildren[0];
          const linkText = link.textContent ? link.textContent.trim() : '';
          const linkHref = link.getAttribute('href') || '';
          if (/^@bilibili$/i.test(linkText) && linkHref) {
            embedSource = linkHref.trim();
          }
        } else if (
          meaningfulChildren.length === 2 &&
          meaningfulChildren[0].nodeType === Node.TEXT_NODE &&
          meaningfulChildren[1].nodeType === Node.ELEMENT_NODE &&
          meaningfulChildren[1].tagName === 'A'
        ) {
          const prefixText = meaningfulChildren[0].textContent ? meaningfulChildren[0].textContent.trim() : '';
          const link = meaningfulChildren[1];
          const linkText = link.textContent ? link.textContent.trim() : '';
          const linkHref = link.getAttribute('href') || '';
          if (prefixText === '@' && /^bilibili$/i.test(linkText) && linkHref) {
            embedSource = linkHref.trim();
          }
        }
      }

      if (!embedSource) return;

      const embedInfo = extractBilibiliEmbedInfo(embedSource);
      if (!embedInfo) return;

      const params = new URLSearchParams({
        page: String(embedInfo.page || 1),
        autoplay: '0',
        high_quality: '1',
        danmaku: '0'
      });

      if (embedInfo.bvid) {
        params.set('bvid', embedInfo.bvid);
      } else if (embedInfo.aid) {
        params.set('aid', embedInfo.aid);
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'bilibili-embed';
      wrapper.innerHTML =
        '<iframe src="https://player.bilibili.com/player.html?' + params.toString() + '"' +
        ' title="' + currentDict['post.bilibiliTitle'] + '"' +
        ' loading="lazy" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>';
      node.replaceWith(wrapper);
    });
  }

  const normalizeCodeLanguage = (value) => {
    if (!value) return 'TEXT';
    const match = String(value).match(/(?:lang|language)-([a-z0-9#+-]+)/i);
    if (!match || !match[1]) return 'TEXT';
    return match[1]
      .replace('plaintext', 'text')
      .replace('text', 'text')
      .toUpperCase();
  };

  const defaultCollapsedCodeLines = 8;
  const getHighlightLanguage = (value) => {
    const normalized = String(value || '').toLowerCase();
    const aliasMap = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      sh: 'bash',
      shell: 'bash',
      yml: 'yaml',
      md: 'markdown',
      plaintext: 'plaintext',
      text: 'plaintext'
    };
    return aliasMap[normalized] || normalized || 'plaintext';
  };

  const updateCodeCollapseButtonText = () => {
    const dict = messages[getLanguage()] || messages.zh;
    document.querySelectorAll('.code-collapse-btn').forEach((button) => {
      const shell = button.closest('.code-block-shell');
      const expanded = shell ? shell.classList.contains('is-expanded') : false;
      const label = expanded ? dict['post.codeCollapse'] : dict['post.codeExpand'];
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      button.innerHTML = '<span class="code-collapse-arrow" aria-hidden="true"></span><span>' + label + '</span>';
    });
  };

  refreshDynamicLabels = updateCodeCollapseButtonText;

  document.querySelectorAll('.post-content pre').forEach((pre) => {
    const code = pre.querySelector('code');
    const classSource = [
      pre.getAttribute('data-language'),
      pre.className,
      code ? code.className : ''
    ].join(' ');
    const codeLanguage = normalizeCodeLanguage(classSource);

    let shell = pre.parentElement && pre.parentElement.classList.contains('code-block-shell')
      ? pre.parentElement
      : null;

    if (!shell && pre.parentNode) {
      shell = document.createElement('div');
      shell.className = 'code-block-shell';
      pre.parentNode.insertBefore(shell, pre);
      shell.appendChild(pre);
    }

    if (shell) {
      shell.setAttribute('data-code-lang', codeLanguage);
    }

    if (!code || !shell) return;

    if (window.hljs && !code.classList.contains('hljs')) {
      const highlightLanguage = getHighlightLanguage(codeLanguage);
      if (highlightLanguage && window.hljs.getLanguage(highlightLanguage)) {
        code.classList.add('language-' + highlightLanguage);
      }
      window.hljs.highlightElement(code);
    }

    if (!shell.querySelector('.code-copy-btn')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy-btn';
    button.textContent = 'COPY';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        button.textContent = 'COPIED';
        button.classList.add('is-copied');
        window.setTimeout(() => {
          button.textContent = 'COPY';
          button.classList.remove('is-copied');
        }, 1400);
      } catch (e) {
        button.textContent = 'FAILED';
        window.setTimeout(() => {
          button.textContent = 'COPY';
        }, 1400);
      }
    });
      shell.appendChild(button);
    }

    const preStyles = window.getComputedStyle(pre);
    const codeStyles = window.getComputedStyle(code);
    const paddingTop = parseFloat(preStyles.paddingTop || '0');
    const paddingBottom = parseFloat(preStyles.paddingBottom || '0');
    const lineHeight = parseFloat(codeStyles.lineHeight || '0') || 26;
    const collapsedHeight = Math.ceil(paddingTop + paddingBottom + lineHeight * defaultCollapsedCodeLines);

    shell.style.setProperty('--code-collapsed-height', collapsedHeight + 'px');

    if (pre.scrollHeight <= collapsedHeight + lineHeight) return;

    shell.classList.add('is-collapsible', 'is-collapsed');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'code-collapse-btn';
    toggle.addEventListener('click', () => {
      const expanded = shell.classList.toggle('is-expanded');
      shell.classList.toggle('is-collapsed', !expanded);
      updateCodeCollapseButtonText();
    });
    shell.appendChild(toggle);
  });

  updateCodeCollapseButtonText();

  document.querySelectorAll('.pagination[data-current-page]').forEach((pagination) => {
    const pagesRoot = pagination.querySelector('[data-pagination-pages]');
    const currentValue = Number(pagination.getAttribute('data-current-page') || '0');
    if (!pagesRoot || !currentValue) return;

    const prevLink = pagination.querySelector('.pagination-link-prev[href]');
    const nextLink = pagination.querySelector('.pagination-link-next[href]');
    let html = '';

    if (prevLink) {
      html += '<a class="pagination-page" href="' + prevLink.getAttribute('href') + '">' + String(currentValue - 1) + '</a>';
    }

    html += '<span class="pagination-page is-current">' + String(currentValue) + '</span>';

    if (nextLink) {
      html += '<a class="pagination-page" href="' + nextLink.getAttribute('href') + '">' + String(currentValue + 1) + '</a>';
    }

    pagesRoot.innerHTML = html;
  });

  // --- Active Nav Highlighting ---
  const normalizePath = (value) => {
    if (!value) return '/';
    let path = String(value).replace(/^https?:\/\/[^/]+/i, '');
    path = path.split('#')[0].split('?')[0];
    path = path.replace(/index\.html$/i, '');
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path || '/';
  };

  const currentPath = normalizePath(window.location.pathname);
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = normalizePath(link.getAttribute('href'));
    const isHome = href === '/';
    
    // Exact match or sub-path match (for archives/tags etc)
    const isMatch = isHome 
      ? currentPath === '/' 
      : (currentPath === href || currentPath.startsWith(href + '/'));

    if (isMatch) {
      link.classList.add('active');
    }
  });
});
