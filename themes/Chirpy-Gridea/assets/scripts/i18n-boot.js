/*
 * Chirping Gridea Theme - i18n Boot
 * Runs synchronously (no DOMContentLoaded / no defer) when placed at the end of <body>,
 * so it executes BEFORE the deferred main.js. This eliminates the i18n FOUC
 * (Flash of Untranslated Content): static [data-i18n] nodes are translated
 * before the browser's first meaningful paint of the deferred main.js work.
 *
 * Dynamic labels (e.g. code-collapse buttons) are still handled by main.js,
 * which calls ChirpyI18n.applyLanguageStatic() + its own refreshDynamicLabels().
 */
(function () {
  var languageStorageKey = 'chirping-gridea-language';

  var messages = {
    zh: {
      'nav.home': '首页',
      'nav.posts': '文章',
      'nav.archives': '归档',
      'nav.tags': '标签',
      'nav.about': '关于',
      'nav.categories': '分类',
      'nav.notes': '闪念',
      'nav.friends': '友链',
      'panel.recent': '最近更新',
      'panel.tags': '热门标签',
      'panel.categories': '全部分类',
      'panel.noRecent': '暂无最近文章',
      'search.placeholder': '搜索站内内容',
      'search.input': '搜索站内内容...',
      'search.empty': '输入关键词开始搜索...',
      'search.noResults': '没有找到相关结果',
      'search.select': '选择',
      'search.navigate': '切换',
      'search.close': '关闭',
      'tags.countPrefix': '站点共有',
      'tags.countSuffix': '个标签',
      'tags.empty': '还没有标签。',
      'categories.countPrefix': '站点共有',
      'categories.countSuffix': '个分类',
      'categories.empty': '还没有分类。',
      'tag.countPrefix': '该标签下共有',
      'tag.countSuffix': '篇文章',
      'tag.empty': '该标签下还没有文章。',
      'category.countPrefix': '该分类下共有',
      'category.countSuffix': '篇文章',
      'category.empty': '该分类下还没有文章。',
      'archives.countPrefix': '站点共有',
      'archives.countSuffix': '篇文章',
      'blog.title': '文章',
      'blog.description': '全部文章列表',
      'blog.empty': '这里还没有内容。',
      'index.empty': '还没有文章，先写下第一篇吧。',
      'post.tags': '标签',
      'post.previous': '上一篇',
      'post.next': '下一篇',
      'post.comments': '评论',
      'post.updatedOn': '更新于',
      'post.readingTime': '分钟阅读',
      'post.codeExpand': '展开全部',
      'post.codeCollapse': '收起代码',
      'post.bilibiliTitle': '哔哩哔哩视频',
      'toc.title': '目录',
      'notes.title': '闪念',
      'notes.description': '记录灵感、片段和不想单独发成长文的小想法。',
      'notes.placeholderOne': '把今天突然想到的点子、碎片记录放在这里。',
      'notes.placeholderTwo': '适合放短更新、待办推进、阅读摘录或临时灵感。',
      'notes.placeholderThree': '如果你想自定义内容，可以在主题设置里填写“闪念页面 HTML”。',
      'notes.empty': '暂无闪念',
      'notes.emptyHint': '灵感尚未降临……',
      'notes.heatmapLess': '少',
      'notes.heatmapMore': '多',
      'notes.loadMore': '更多',
      'friends.title': '友链',
      'friends.description': '欢迎交换友链，常逛的网站也集中放在这里。',
      'friends.placeholderTitle': '你的站点名',
      'friends.placeholderDesc': '这里可以放站点简介、擅长领域或一句自我介绍。',
      'friends.placeholderMeta': '在主题设置里填写“友链页面 HTML”后可完全自定义此页。',
      'ui.skip': '跳到正文',
      'ui.closeSidebar': '关闭侧栏',
      'ui.backToTop': '返回顶部',
      'ui.search': '搜索',
      'ui.language': '语言',
      'pagination.page': '第',
      'pagination.pageSuffix': '页',
      'pagination.previous': '上一页',
      'pagination.next': '下一页',
      'footer.rights': '保留所有权利。',
      'footer.poweredBy': '由',
      'footer.theme': '主题',
      'error.notFound': '你访问的页面飞走了。',
      'error.backHome': '返回首页'
    },
    en: {
      'nav.home': 'Home',
      'nav.posts': 'Posts',
      'nav.archives': 'Archives',
      'nav.tags': 'Tags',
      'nav.about': 'About',
      'nav.categories': 'Categories',
      'nav.notes': 'Notes',
      'nav.friends': 'Friends',
      'panel.recent': 'RECENTLY UPDATED',
      'panel.tags': 'TRENDING TAGS',
      'panel.categories': 'CATEGORIES',
      'panel.noRecent': 'No recent posts',
      'search.placeholder': 'Search the site',
      'search.input': 'Search the site...',
      'search.empty': 'Type to start searching...',
      'search.noResults': 'No results found',
      'search.select': 'Select',
      'search.navigate': 'Navigate',
      'search.close': 'Close',
      'tags.countPrefix': 'There are',
      'tags.countSuffix': 'tags',
      'tags.empty': 'No tags yet.',
      'categories.countPrefix': 'There are',
      'categories.countSuffix': 'categories',
      'categories.empty': 'No categories yet.',
      'tag.countPrefix': 'There are',
      'tag.countSuffix': 'posts under this tag',
      'tag.empty': 'No posts under this tag yet.',
      'category.countPrefix': 'There are',
      'category.countSuffix': 'posts under this category',
      'category.empty': 'No posts under this category yet.',
      'archives.countPrefix': 'There are',
      'archives.countSuffix': 'posts',
      'blog.title': 'Posts',
      'blog.description': 'Browse all posts',
      'blog.empty': 'No content here yet.',
      'index.empty': 'No posts yet. Write the first one.',
      'post.tags': 'Tags',
      'post.previous': 'Previous',
      'post.next': 'Next',
      'post.comments': 'Comments',
      'post.updatedOn': 'Updated on',
      'post.readingTime': 'min read',
      'post.codeExpand': 'Expand code',
      'post.codeCollapse': 'Collapse code',
      'post.bilibiliTitle': 'Bilibili video',
      'toc.title': 'Table of Contents',
      'notes.title': 'Notes',
      'notes.description': 'A place for quick thoughts, fragments, and ideas that do not need a full post.',
      'notes.placeholderOne': 'Capture quick ideas, tiny updates, and writing fragments here.',
      'notes.placeholderTwo': 'Use this page for short logs, reading highlights, or work-in-progress notes.',
      'notes.placeholderThree': 'To fully customize this page, fill in "Notes Page HTML" in the theme settings.',
      'notes.empty': 'No memos yet',
      'notes.emptyHint': 'Ideas are still on the way...',
      'notes.heatmapLess': 'Less',
      'notes.heatmapMore': 'More',
      'notes.loadMore': 'More',
      'friends.title': 'Friends',
      'friends.description': 'A curated page for blogroll links and sites worth visiting often.',
      'friends.placeholderTitle': 'Your Site Name',
      'friends.placeholderDesc': 'Add a short site intro, focus area, or one-line description here.',
      'friends.placeholderMeta': 'Fill in "Friends Page HTML" in the theme settings to replace this default card.',
      'ui.skip': 'Skip to content',
      'ui.closeSidebar': 'Close sidebar',
      'ui.backToTop': 'Back to top',
      'ui.search': 'Search',
      'ui.language': 'Language',
      'pagination.page': 'Page',
      'pagination.pageSuffix': '',
      'pagination.previous': 'Previous page',
      'pagination.next': 'Next page',
      'footer.rights': 'All rights reserved.',
      'footer.poweredBy': 'Powered by',
      'footer.theme': 'Theme',
      'error.notFound': 'The page you requested has flown away.',
      'error.backHome': 'Back home'
    }
  };

  var getLanguage = function () {
    try {
      return localStorage.getItem(languageStorageKey) || 'zh';
    } catch (e) {
      return 'zh';
    }
  };

  var setLanguageLabel = function (lang) {
    var langButton = document.getElementById('header-lang-btn');
    if (langButton) {
      langButton.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
      langButton.setAttribute('title', lang === 'zh' ? 'English' : '中文');
    }
  };

  // Static translation only. Does NOT touch dynamic labels (code-collapse etc.),
  // which are owned by main.js's refreshDynamicLabels().
  var applyLanguageStatic = function (lang) {
    var dict = messages[lang] || messages.zh;

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      if (dict[key]) node.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-aria');
      if (dict[key]) node.setAttribute('aria-label', dict[key]);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-title');
      if (dict[key]) node.setAttribute('title', dict[key]);
    });

    var searchInputNode = document.getElementById('search-input');
    if (searchInputNode) {
      searchInputNode.placeholder = dict['search.input'];
      searchInputNode.setAttribute('aria-label', dict['ui.search']);
    }
    var headerSearchTrigger = document.getElementById('header-search-trigger');
    if (headerSearchTrigger) headerSearchTrigger.setAttribute('aria-label', dict['ui.search']);
    var searchEmptyNode = document.querySelector('.search-no-results');
    if (searchEmptyNode && !(searchInputNode && searchInputNode.value)) {
      searchEmptyNode.textContent = dict['search.empty'];
    }
    var searchHints = document.querySelectorAll('.search-hints span');
    if (searchHints[0]) searchHints[0].innerHTML = '<kbd>↵</kbd> ' + dict['search.select'];
    if (searchHints[1]) searchHints[1].innerHTML = '<kbd>↑↓</kbd> ' + dict['search.navigate'];
    if (searchHints[2]) searchHints[2].innerHTML = '<kbd>Esc</kbd> ' + dict['search.close'];

    setLanguageLabel(lang);
  };

  // Expose for main.js to reuse (single source of truth for the dictionary).
  window.ChirpyI18n = {
    messages: messages,
    getLanguage: getLanguage,
    setLanguageLabel: setLanguageLabel,
    applyLanguageStatic: applyLanguageStatic,
    storageKey: languageStorageKey
  };

  // Run immediately. This script is placed at the end of <body> without defer,
  // so all static [data-i18n] nodes above it are already parsed and available.
  applyLanguageStatic(getLanguage());

  // Reveal the now-translated nodes. The .i18n-pending class was added in <head>
  // (with CSS visibility:hidden) to suppress the untranslated-text flash.
  try {
    document.documentElement.classList.remove('i18n-pending');
  } catch (e) {}
})();
