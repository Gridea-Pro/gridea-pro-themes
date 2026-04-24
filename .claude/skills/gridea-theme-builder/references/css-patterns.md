# 博客主题 CSS 设计模式库

> 本文档提供可直接复制使用的 CSS 代码片段，覆盖博客主题开发中最常见的样式需求。
> 所有代码已针对 Gridea Pro 静态博客场景优化。

## 目录

1. [CSS 变量体系](#1-css-变量体系)
2. [排版系统（中英文混排）](#2-排版系统)
3. [响应式布局](#3-响应式布局)
4. [暗色模式](#4-暗色模式)
5. [Markdown 内容样式（prose）](#5-markdown-内容样式-prose)
6. [代码高亮](#6-代码高亮)
7. [组件样式](#7-组件样式)
8. [动画与过渡](#8-动画与过渡)
9. [打印样式](#9-打印样式)

---

## 1. CSS 变量体系

统一管理颜色、字体、间距和过渡，方便全局换肤和暗色模式切换。

```css
:root {
  /* ── 颜色 ── */
  --color-bg: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;
  --color-border: #e5e7eb;
  --color-border-light: #f0f0f0;
  --color-code-bg: #f5f5f5;
  --color-code-text: #e83e8c;
  --color-blockquote-border: #2563eb;
  --color-blockquote-bg: #f8fafc;
  --color-shadow: rgba(0, 0, 0, 0.08);

  /* ── 字体 ── */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Noto Sans SC", "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  --font-serif: "Noto Serif SC", "Source Han Serif SC",
    Georgia, "Times New Roman", serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Source Code Pro",
    Menlo, Monaco, Consolas, monospace;
  --font-size-base: 16px;
  --font-size-sm: 14px;
  --font-size-xs: 12px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --line-height-base: 1.8;
  --line-height-tight: 1.4;

  /* ── 间距 ── */
  --content-width: 720px;
  --page-width: 1200px;
  --spacing-unit: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;

  /* ── 圆角 ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* ── 过渡 ── */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

---

## 2. 排版系统

### 2.1 中英文混排字体栈

中文博客必须在字体栈中正确放置中英文字体。英文字体在前，中文字体在后——浏览器遇到英文字符时优先匹配英文字体，遇到中文字符时回退到中文字体，从而获得最佳混排效果。

```css
/* 无衬线体（正文推荐） */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Noto Sans SC", "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
}

/* 衬线体（长文阅读） */
.post-content.serif {
  font-family: "Noto Serif SC", "Source Han Serif SC",
    Georgia, "Times New Roman", serif;
}

/* 等宽体（代码） */
code, pre, kbd, samp {
  font-family: "JetBrains Mono", "Fira Code", "Source Code Pro",
    Menlo, Monaco, Consolas, monospace;
}
```

### 2.2 基础排版

```css
html {
  font-size: var(--font-size-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-sans);
  line-height: var(--line-height-base);
  color: var(--color-text);
  background-color: var(--color-bg);
  word-break: break-word;          /* CJK 文本自动换行 */
  overflow-wrap: break-word;
}

/* 段落间距 */
p {
  margin: 0 0 1.25em;
}

/* 标题层级 */
h1 { font-size: 2em;    margin: 1.5em 0 0.6em; font-weight: 700; line-height: var(--line-height-tight); }
h2 { font-size: 1.5em;  margin: 1.4em 0 0.5em; font-weight: 700; line-height: var(--line-height-tight); }
h3 { font-size: 1.25em; margin: 1.3em 0 0.4em; font-weight: 600; line-height: var(--line-height-tight); }
h4 { font-size: 1.1em;  margin: 1.2em 0 0.4em; font-weight: 600; line-height: var(--line-height-tight); }
h5 { font-size: 1em;    margin: 1.1em 0 0.3em; font-weight: 600; }
h6 { font-size: 0.9em;  margin: 1em 0 0.3em;   font-weight: 600; color: var(--color-text-secondary); }
```

### 2.3 响应式字体大小

使用 `clamp()` 在不同视口自动缩放字号，无需手写媒体查询。

```css
html {
  font-size: clamp(15px, 0.9rem + 0.3vw, 18px);
}

h1 { font-size: clamp(1.6rem, 1.2rem + 1.5vw, 2.4rem); }
h2 { font-size: clamp(1.3rem, 1rem + 1vw, 1.8rem); }
h3 { font-size: clamp(1.1rem, 0.95rem + 0.5vw, 1.4rem); }
```

---

## 3. 响应式布局

### 3.1 断点定义

```css
/* 移动优先，从小屏幕向上覆盖 */
/* xs: < 640px  （默认） */
/* sm: ≥ 640px  （大手机/小平板） */
/* md: ≥ 768px  （平板） */
/* lg: ≥ 1024px （小桌面） */
/* xl: ≥ 1280px （大桌面） */
```

### 3.2 容器

```css
.container {
  width: 100%;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.content-wrapper {
  max-width: var(--content-width);
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--spacing-xl);
  }
}
```

### 3.3 常见布局模式

```css
/* ── 单栏居中（文章页） ── */
.layout-single {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

/* ── 双栏（列表+侧边栏） ── */
.layout-sidebar {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 1024px) {
  .layout-sidebar {
    grid-template-columns: 1fr 280px;
  }
}

/* ── 卡片网格 ── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 640px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 4. 暗色模式

### 4.1 方案 A：`data-theme` 属性 + CSS 变量（推荐）

用 JS 切换 `<html data-theme="dark">`，通过 CSS 变量覆盖实现主题切换。此方案灵活，支持用户手动选择。

```css
[data-theme="dark"] {
  --color-bg: #1a1a2e;
  --color-bg-secondary: #16213e;
  --color-bg-tertiary: #0f3460;
  --color-text: #e0e0e0;
  --color-text-secondary: #a0a0a0;
  --color-text-tertiary: #707070;
  --color-primary: #60a5fa;
  --color-primary-hover: #93bbfc;
  --color-primary-light: #1e3a5f;
  --color-border: #2d2d44;
  --color-border-light: #252540;
  --color-code-bg: #2d2d44;
  --color-code-text: #f472b6;
  --color-blockquote-border: #60a5fa;
  --color-blockquote-bg: #16213e;
  --color-shadow: rgba(0, 0, 0, 0.3);
}
```

### 4.2 方案 B：`prefers-color-scheme` 媒体查询

自动跟随系统偏好，无需 JS，但用户无法手动切换。

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a2e;
    --color-bg-secondary: #16213e;
    --color-text: #e0e0e0;
    --color-text-secondary: #a0a0a0;
    --color-primary: #60a5fa;
    --color-border: #2d2d44;
    --color-code-bg: #2d2d44;
    --color-shadow: rgba(0, 0, 0, 0.3);
  }
}
```

### 4.3 暗色模式 JS 切换逻辑

```js
(function () {
  var STORAGE_KEY = "theme-preference";
  var html = document.documentElement;

  function getPreference() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function apply(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
  }

  // 页面加载时立即应用，避免闪烁
  apply(getPreference());

  // 绑定切换按钮
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var current = html.getAttribute("data-theme");
      apply(current === "dark" ? "light" : "dark");
    });
  });

  // 监听系统偏好变化
  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        apply(e.matches ? "dark" : "light");
      }
    });
})();
```

### 4.4 暗色模式常见坑

```css
/* 图片过亮——降低亮度 */
[data-theme="dark"] img:not([src*=".svg"]) {
  filter: brightness(0.9);
}

/* 纯黑 #000 伤眼——用深灰 */
/* 错误: background: #000000; */
/* 正确: background: #1a1a2e;  */

/* 代码块需要单独的暗色主题 */
[data-theme="dark"] pre {
  background-color: #0d1117;
}

/* 阴影在暗色下需要加深 */
[data-theme="dark"] .card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* 边框颜色需要调暗 */
[data-theme="dark"] hr {
  border-color: var(--color-border);
}
```

---

## 5. Markdown 内容样式 (prose)

这是博客主题的核心样式。`.post-content` 必须覆盖 Markdown 渲染出的所有 HTML 元素。

```css
/* ── 容器 ── */
.post-content {
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
  word-break: break-word;
}

/* ── 标题 + 锚点 ── */
.post-content h1,
.post-content h2,
.post-content h3,
.post-content h4,
.post-content h5,
.post-content h6 {
  position: relative;
  font-weight: 700;
  line-height: var(--line-height-tight);
  margin-top: 1.6em;
  margin-bottom: 0.6em;
}

.post-content h1 { font-size: 1.8em; }
.post-content h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid var(--color-border); }
.post-content h3 { font-size: 1.25em; }
.post-content h4 { font-size: 1.1em; }
.post-content h5 { font-size: 1em; }
.post-content h6 { font-size: 0.9em; color: var(--color-text-secondary); }

.post-content h1 .anchor,
.post-content h2 .anchor,
.post-content h3 .anchor {
  position: absolute;
  left: -1.2em;
  color: var(--color-primary);
  text-decoration: none;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.post-content h1:hover .anchor,
.post-content h2:hover .anchor,
.post-content h3:hover .anchor {
  opacity: 1;
}

/* ── 段落 ── */
.post-content p {
  margin: 0 0 1.25em;
}

/* ── 链接 ── */
.post-content a {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.post-content a:hover {
  border-bottom-color: var(--color-primary);
}

/* ── 强调 ── */
.post-content strong { font-weight: 700; }
.post-content em { font-style: italic; }
.post-content del { text-decoration: line-through; color: var(--color-text-secondary); }

/* ── 引用块 ── */
.post-content blockquote {
  margin: 1.25em 0;
  padding: 0.8em 1.2em;
  border-left: 4px solid var(--color-blockquote-border);
  background-color: var(--color-blockquote-bg);
  color: var(--color-text-secondary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.post-content blockquote p:last-child {
  margin-bottom: 0;
}

/* ── 列表 ── */
.post-content ul,
.post-content ol {
  margin: 0 0 1.25em;
  padding-left: 1.8em;
}

.post-content li {
  margin-bottom: 0.4em;
}

.post-content li > ul,
.post-content li > ol {
  margin-top: 0.4em;
  margin-bottom: 0;
}

/* ── 任务列表 ── */
.post-content ul.task-list {
  list-style: none;
  padding-left: 0;
}

.post-content .task-list-item {
  position: relative;
  padding-left: 1.6em;
}

.post-content .task-list-item input[type="checkbox"] {
  position: absolute;
  left: 0;
  top: 0.35em;
  margin: 0;
  pointer-events: none;
}

/* ── 行内代码 ── */
.post-content code:not(pre code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
  padding: 0.15em 0.4em;
  background-color: var(--color-code-bg);
  color: var(--color-code-text);
  border-radius: var(--radius-sm);
  word-break: break-word;
}

/* ── 代码块 ── */
.post-content pre {
  margin: 1.25em 0;
  padding: 1em 1.2em;
  background-color: var(--color-code-bg);
  border-radius: var(--radius-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  line-height: 1.6;
}

.post-content pre code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  padding: 0;
  background: none;
  color: inherit;
  border-radius: 0;
}

/* ── 表格 ── */
.post-content table {
  width: 100%;
  margin: 1.25em 0;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  overflow-x: auto;
  display: block;
}

.post-content thead th {
  background-color: var(--color-bg-tertiary);
  font-weight: 600;
  text-align: left;
  padding: 0.6em 1em;
  border: 1px solid var(--color-border);
}

.post-content tbody td {
  padding: 0.6em 1em;
  border: 1px solid var(--color-border);
}

.post-content tbody tr:nth-child(even) {
  background-color: var(--color-bg-secondary);
}

/* ── 图片 ── */
.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: 1em 0;
  display: block;
}

.post-content figure {
  margin: 1.5em 0;
  text-align: center;
}

.post-content figcaption {
  margin-top: 0.5em;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* ── 分隔线 ── */
.post-content hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2em 0;
}

/* ── 脚注 ── */
.post-content .footnotes {
  margin-top: 2em;
  padding-top: 1em;
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.post-content .footnote-ref {
  font-size: 0.75em;
  vertical-align: super;
  text-decoration: none;
}
```

---

## 6. 代码高亮

### 6.1 代码块基础样式

```css
pre {
  position: relative;
  overflow-x: auto;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.6;
}

pre code {
  display: block;
  padding: 1em 1.2em;
  font-family: var(--font-mono);
}

/* 语言标签 */
pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 0.4em;
  right: 0.8em;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  pointer-events: none;
}
```

### 6.2 行号样式

```css
pre.line-numbers {
  padding-left: 3.5em;
  counter-reset: line;
}

pre.line-numbers code .line::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 2em;
  margin-left: -3.5em;
  margin-right: 1em;
  text-align: right;
  color: var(--color-text-tertiary);
  user-select: none;
}
```

### 6.3 语法高亮配色（浅色主题）

```css
/* 浅色高亮 —— 灵感来源于 GitHub Light */
.highlight .keyword    { color: #d73a49; font-weight: 600; }
.highlight .string     { color: #032f62; }
.highlight .number     { color: #005cc5; }
.highlight .comment    { color: #6a737d; font-style: italic; }
.highlight .function   { color: #6f42c1; }
.highlight .class-name { color: #22863a; }
.highlight .operator   { color: #d73a49; }
.highlight .punctuation { color: #24292e; }
.highlight .tag        { color: #22863a; }
.highlight .attr-name  { color: #6f42c1; }
.highlight .attr-value { color: #032f62; }
```

```css
/* 深色高亮 —— 灵感来源于 One Dark */
[data-theme="dark"] .highlight .keyword    { color: #c678dd; font-weight: 600; }
[data-theme="dark"] .highlight .string     { color: #98c379; }
[data-theme="dark"] .highlight .number     { color: #d19a66; }
[data-theme="dark"] .highlight .comment    { color: #5c6370; font-style: italic; }
[data-theme="dark"] .highlight .function   { color: #61afef; }
[data-theme="dark"] .highlight .class-name { color: #e5c07b; }
[data-theme="dark"] .highlight .operator   { color: #56b6c2; }
[data-theme="dark"] .highlight .punctuation { color: #abb2bf; }
[data-theme="dark"] .highlight .tag        { color: #e06c75; }
[data-theme="dark"] .highlight .attr-name  { color: #d19a66; }
[data-theme="dark"] .highlight .attr-value { color: #98c379; }
```

---

## 7. 组件样式

### 7.1 文章卡片

```css
.post-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.post-card:hover {
  box-shadow: 0 4px 16px var(--color-shadow);
  transform: translateY(-2px);
}

.post-card__cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.post-card__body {
  padding: var(--spacing-lg);
}

.post-card__title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.5em;
  line-height: var(--line-height-tight);
}

.post-card__title a {
  color: var(--color-text);
  text-decoration: none;
}

.post-card__title a:hover {
  color: var(--color-primary);
}

.post-card__excerpt {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card__meta {
  margin-top: 0.8em;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
```

### 7.2 标签 / 分类标签

```css
.tag {
  display: inline-block;
  padding: 0.15em 0.6em;
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.tag:hover {
  background-color: var(--color-primary);
  color: #ffffff;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
```

### 7.3 分页器

```css
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
  margin: var(--spacing-2xl) 0;
}

.pagination a,
.pagination span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.6em;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.pagination a:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.pagination .current {
  color: #ffffff;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.pagination .disabled {
  opacity: 0.4;
  pointer-events: none;
}
```

### 7.4 导航栏（含移动端汉堡菜单）

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.85);
}

[data-theme="dark"] .navbar {
  background-color: rgba(26, 26, 46, 0.85);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  height: 60px;
}

.navbar__logo {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}

.navbar__links {
  display: flex;
  gap: var(--spacing-lg);
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__links a {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.navbar__links a:hover,
.navbar__links a.active {
  color: var(--color-primary);
}

/* 汉堡按钮 */
.navbar__toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
}

.navbar__toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background-color: var(--color-text);
  margin: 4px 0;
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}

/* 移动端 */
@media (max-width: 767px) {
  .navbar__toggle {
    display: block;
  }

  .navbar__links {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .navbar__links.open {
    display: flex;
  }

  /* 汉堡菜单展开动画 */
  .navbar__toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(4px, 4px);
  }
  .navbar__toggle.active span:nth-child(2) {
    opacity: 0;
  }
  .navbar__toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(4px, -4px);
  }
}
```

### 7.5 页脚

```css
.footer {
  margin-top: var(--spacing-3xl);
  padding: var(--spacing-xl) var(--spacing-md);
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.footer a {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.footer a:hover {
  color: var(--color-primary);
}

.footer__powered {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
}
```

### 7.6 返回顶部按钮

```css
.back-to-top {
  position: fixed;
  right: var(--spacing-lg);
  bottom: var(--spacing-lg);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity var(--transition-normal), transform var(--transition-normal), visibility var(--transition-normal);
  box-shadow: 0 2px 8px var(--color-shadow);
  z-index: 50;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  background-color: var(--color-primary-hover);
}
```

### 7.7 搜索框

```css
.search-box {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-box__input {
  width: 100%;
  padding: 0.6em 1em 0.6em 2.6em;
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  color: var(--color-text);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-box__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-box__icon {
  position: absolute;
  left: 0.9em;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
  width: 16px;
  height: 16px;
}
```

---

## 8. 动画与过渡

### 8.1 页面入场动画

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: fadeInUp 0.5s ease forwards;
}

/* 列表项依次入场 */
.post-card {
  opacity: 0;
  animation: fadeInUp 0.4s ease forwards;
}

.post-card:nth-child(1) { animation-delay: 0.05s; }
.post-card:nth-child(2) { animation-delay: 0.10s; }
.post-card:nth-child(3) { animation-delay: 0.15s; }
.post-card:nth-child(4) { animation-delay: 0.20s; }
.post-card:nth-child(5) { animation-delay: 0.25s; }
.post-card:nth-child(6) { animation-delay: 0.30s; }
```

### 8.2 链接 / 按钮悬停效果

```css
/* 下划线从左到右展开 */
.link-underline {
  position: relative;
  text-decoration: none;
}

.link-underline::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: width var(--transition-normal);
}

.link-underline:hover::after {
  width: 100%;
}

/* 按钮缩放反馈 */
.btn:active {
  transform: scale(0.97);
}
```

### 8.3 滚动触发动画

```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

配合 JS 使用：

```js
(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".scroll-reveal").forEach(function (el) {
    observer.observe(el);
  });
})();
```

### 8.4 阅读进度条

```css
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background: var(--color-primary);
  z-index: 999;
  transition: width 100ms linear;
}
```

```js
(function () {
  var bar = document.querySelector(".reading-progress");
  if (!bar) return;
  window.addEventListener("scroll", function () {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + "%";
  });
})();
```

---

## 9. 打印样式

```css
@media print {
  /* 隐藏非内容元素 */
  .navbar,
  .footer,
  .sidebar,
  .back-to-top,
  .reading-progress,
  .theme-toggle,
  .pagination,
  .comment-section {
    display: none !important;
  }

  /* 重置背景和颜色 */
  body {
    background: #ffffff !important;
    color: #000000 !important;
    font-size: 12pt;
    line-height: 1.6;
  }

  /* 内容撑满页面 */
  .post-content,
  .layout-single {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* 展示链接地址 */
  .post-content a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    color: #666666;
    word-break: break-all;
  }

  /* 避免元素跨页断开 */
  img, pre, blockquote, table {
    page-break-inside: avoid;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }

  /* 代码块边框替代背景 */
  pre {
    border: 1px solid #cccccc;
    background: #ffffff !important;
    padding: 0.8em;
  }
}
```
