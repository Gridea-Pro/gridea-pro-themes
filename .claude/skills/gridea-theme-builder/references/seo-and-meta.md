# SEO 与 Meta 标签最佳实践

> 本文档提供博客主题中所有 SEO 相关标签的完整模板代码。
> 每个部分同时提供 Jinja2（主推）、Go Templates、EJS 三种引擎的写法。
> Gridea Pro 的 Go 模板基于 Pongo2，过滤器参数用冒号分隔，不用括号。

## 目录

1. [基础 Meta](#1-基础-meta)
2. [Open Graph（社交分享）](#2-open-graph)
3. [Twitter Card](#3-twitter-card)
4. [JSON-LD 结构化数据](#4-json-ld-结构化数据)
5. [RSS / Atom Feed](#5-rss--atom-feed)
6. [Sitemap](#6-sitemap)
7. [Robots](#7-robots)
8. [性能相关标签](#8-性能相关标签)

---

## 1. 基础 Meta

每个页面都必须包含的基础标签。

### Jinja2

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">

{# 页面标题 #}
<title>{% block title %}{{ site.title }}{% endblock %}</title>

{# 页面描述——文章页用摘要，其他页面用站点描述 #}
{% if post %}
  <meta name="description" content="{{ post.abstract | truncatechars:160 }}">
{% else %}
  <meta name="description" content="{{ site.description | truncatechars:160 }}">
{% endif %}

{# 作者 #}
<meta name="author" content="{{ site.author }}">

{# 规范链接——防止重复内容 #}
<link rel="canonical" href="{{ current_url }}">

{# 站点图标 #}
<link rel="icon" href="{{ site.favicon }}" type="image/x-icon">
<link rel="apple-touch-icon" href="{{ site.avatar }}">

{# 语言 #}
<meta http-equiv="content-language" content="zh-CN">

{# 关键词（可选，搜索引擎权重已低） #}
{% if post and post.tags %}
  <meta name="keywords" content="{% for tag in post.tags %}{{ tag.name }}{% if not loop.last %},{% endif %}{% endfor %}">
{% endif %}
```

### Go Templates (Pongo2)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

{% block title %}<title>{{ site.title }}</title>{% endblock %}

{% if post %}
  <meta name="description" content="{{ post.abstract|truncatechars:160 }}">
{% else %}
  <meta name="description" content="{{ site.description|truncatechars:160 }}">
{% endif %}

<meta name="author" content="{{ site.author }}">
<link rel="canonical" href="{{ current_url }}">
<link rel="icon" href="{{ site.favicon }}" type="image/x-icon">
```

### EJS

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title><%= typeof post !== 'undefined' ? post.title + ' - ' + site.title : site.title %></title>

<% if (typeof post !== 'undefined') { %>
  <meta name="description" content="<%= post.abstract.substring(0, 160) %>">
<% } else { %>
  <meta name="description" content="<%= site.description.substring(0, 160) %>">
<% } %>

<meta name="author" content="<%= site.author %>">
<link rel="canonical" href="<%= current_url %>">
<link rel="icon" href="<%= site.favicon %>" type="image/x-icon">
```

---

## 2. Open Graph

社交平台（微信、Facebook、LinkedIn 等）抓取分享卡片时使用 OG 标签。

### Jinja2

```html
{# ── 首页 ── #}
{% block og_tags %}
<meta property="og:type" content="website">
<meta property="og:site_name" content="{{ site.title }}">
<meta property="og:title" content="{{ site.title }}">
<meta property="og:description" content="{{ site.description | truncatechars:200 }}">
<meta property="og:url" content="{{ site.url }}">
{% if site.avatar %}
  <meta property="og:image" content="{{ site.avatar }}">
{% endif %}
<meta property="og:locale" content="zh_CN">
{% endblock %}
```

```html
{# ── 文章页 ── #}
{% block og_tags %}
<meta property="og:type" content="article">
<meta property="og:site_name" content="{{ site.title }}">
<meta property="og:title" content="{{ post.title }}">
<meta property="og:description" content="{{ post.abstract | truncatechars:200 }}">
<meta property="og:url" content="{{ post.url }}">
{% if post.cover %}
  <meta property="og:image" content="{{ post.cover }}">
{% else %}
  <meta property="og:image" content="{{ site.avatar }}">
{% endif %}
<meta property="og:locale" content="zh_CN">
<meta property="article:published_time" content="{{ post.date }}">
<meta property="article:author" content="{{ site.author }}">
{% for tag in post.tags %}
  <meta property="article:tag" content="{{ tag.name }}">
{% endfor %}
{% endblock %}
```

```html
{# ── 标签页 ── #}
{% block og_tags %}
<meta property="og:type" content="website">
<meta property="og:site_name" content="{{ site.title }}">
<meta property="og:title" content="标签: {{ tag.name }} - {{ site.title }}">
<meta property="og:description" content="包含「{{ tag.name }}」标签的所有文章">
<meta property="og:url" content="{{ tag.url }}">
<meta property="og:locale" content="zh_CN">
{% endblock %}
```

### Go Templates (Pongo2)

```html
{# 文章页 #}
<meta property="og:type" content="article">
<meta property="og:site_name" content="{{ site.title }}">
<meta property="og:title" content="{{ post.title }}">
<meta property="og:description" content="{{ post.abstract|truncatechars:200 }}">
<meta property="og:url" content="{{ post.url }}">
{% if post.cover %}
  <meta property="og:image" content="{{ post.cover }}">
{% else %}
  <meta property="og:image" content="{{ site.avatar }}">
{% endif %}
<meta property="og:locale" content="zh_CN">
<meta property="article:published_time" content="{{ post.date }}">
{% for tag in post.tags %}
  <meta property="article:tag" content="{{ tag.name }}">
{% endfor %}
```

### EJS

```html
<!-- 文章页 -->
<meta property="og:type" content="article">
<meta property="og:site_name" content="<%= site.title %>">
<meta property="og:title" content="<%= post.title %>">
<meta property="og:description" content="<%= post.abstract.substring(0, 200) %>">
<meta property="og:url" content="<%= post.url %>">
<% if (post.cover) { %>
  <meta property="og:image" content="<%= post.cover %>">
<% } else { %>
  <meta property="og:image" content="<%= site.avatar %>">
<% } %>
<meta property="og:locale" content="zh_CN">
<meta property="article:published_time" content="<%= post.date %>">
<% post.tags.forEach(function(tag) { %>
  <meta property="article:tag" content="<%= tag.name %>">
<% }); %>
```

---

## 3. Twitter Card

Twitter/X 分享卡片。`summary_large_image` 显示大图效果最佳。

### Jinja2

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ post.title if post else site.title }}">
<meta name="twitter:description" content="{{ (post.abstract if post else site.description) | truncatechars:200 }}">
{% if post and post.cover %}
  <meta name="twitter:image" content="{{ post.cover }}">
{% elif site.avatar %}
  <meta name="twitter:image" content="{{ site.avatar }}">
{% endif %}
```

### Go Templates (Pongo2)

```html
<meta name="twitter:card" content="summary_large_image">
{% if post %}
  <meta name="twitter:title" content="{{ post.title }}">
  <meta name="twitter:description" content="{{ post.abstract|truncatechars:200 }}">
  {% if post.cover %}
    <meta name="twitter:image" content="{{ post.cover }}">
  {% endif %}
{% else %}
  <meta name="twitter:title" content="{{ site.title }}">
  <meta name="twitter:description" content="{{ site.description|truncatechars:200 }}">
{% endif %}
```

### EJS

```html
<meta name="twitter:card" content="summary_large_image">
<% if (typeof post !== 'undefined') { %>
  <meta name="twitter:title" content="<%= post.title %>">
  <meta name="twitter:description" content="<%= post.abstract.substring(0, 200) %>">
  <% if (post.cover) { %>
    <meta name="twitter:image" content="<%= post.cover %>">
  <% } %>
<% } else { %>
  <meta name="twitter:title" content="<%= site.title %>">
  <meta name="twitter:description" content="<%= site.description.substring(0, 200) %>">
<% } %>
```

---

## 4. JSON-LD 结构化数据

帮助搜索引擎理解页面内容，可在搜索结果中展示富摘要（Rich Snippet）。

### 4.1 首页 —— WebSite 结构

#### Jinja2

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site.title }}",
  "url": "{{ site.url }}",
  "description": "{{ site.description }}",
  "author": {
    "@type": "Person",
    "name": "{{ site.author }}"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{{ site.url }}/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### 4.2 文章页 —— BlogPosting 结构

#### Jinja2

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ post.title }}",
  "description": "{{ post.abstract | truncatechars:200 }}",
  "url": "{{ post.url }}",
  "datePublished": "{{ post.date }}",
  "dateModified": "{{ post.date }}",
  "author": {
    "@type": "Person",
    "name": "{{ site.author }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ site.title }}",
    "logo": {
      "@type": "ImageObject",
      "url": "{{ site.avatar }}"
    }
  },
  {% if post.cover %}
  "image": "{{ post.cover }}",
  {% endif %}
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ post.url }}"
  },
  "keywords": "{% for tag in post.tags %}{{ tag.name }}{% if not loop.last %}, {% endif %}{% endfor %}"
}
</script>
```

#### Go Templates (Pongo2)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ post.title }}",
  "description": "{{ post.abstract|truncatechars:200 }}",
  "url": "{{ post.url }}",
  "datePublished": "{{ post.date }}",
  "dateModified": "{{ post.date }}",
  "author": {
    "@type": "Person",
    "name": "{{ site.author }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ site.title }}",
    "logo": {
      "@type": "ImageObject",
      "url": "{{ site.avatar }}"
    }
  },
  {% if post.cover %}
  "image": "{{ post.cover }}",
  {% endif %}
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ post.url }}"
  }
}
</script>
```

#### EJS

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "<%= post.title %>",
  "description": "<%= post.abstract.substring(0, 200) %>",
  "url": "<%= post.url %>",
  "datePublished": "<%= post.date %>",
  "dateModified": "<%= post.date %>",
  "author": {
    "@type": "Person",
    "name": "<%= site.author %>"
  },
  "publisher": {
    "@type": "Organization",
    "name": "<%= site.title %>",
    "logo": {
      "@type": "ImageObject",
      "url": "<%= site.avatar %>"
    }
  },
  <% if (post.cover) { %>
  "image": "<%= post.cover %>",
  <% } %>
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "<%= post.url %>"
  }
}
</script>
```

---

## 5. RSS / Atom Feed

在 `<head>` 中放置自动发现链接，RSS 阅读器可自动检测。

### Jinja2

```html
<link rel="alternate" type="application/rss+xml"
      title="{{ site.title }} - RSS"
      href="{{ site.url }}/rss.xml">
<link rel="alternate" type="application/atom+xml"
      title="{{ site.title }} - Atom"
      href="{{ site.url }}/atom.xml">
```

### Go Templates (Pongo2)

```html
<link rel="alternate" type="application/rss+xml"
      title="{{ site.title }} - RSS"
      href="{{ site.url }}/rss.xml">
<link rel="alternate" type="application/atom+xml"
      title="{{ site.title }} - Atom"
      href="{{ site.url }}/atom.xml">
```

### EJS

```html
<link rel="alternate" type="application/rss+xml"
      title="<%= site.title %> - RSS"
      href="<%= site.url %>/rss.xml">
<link rel="alternate" type="application/atom+xml"
      title="<%= site.title %> - Atom"
      href="<%= site.url %>/atom.xml">
```

---

## 6. Sitemap

帮助搜索引擎爬虫发现所有页面。Gridea 会自动生成 sitemap，只需在 `<head>` 中声明。

### Jinja2

```html
<link rel="sitemap" type="application/xml"
      title="Sitemap"
      href="{{ site.url }}/sitemap.xml">
```

### Go Templates (Pongo2)

```html
<link rel="sitemap" type="application/xml"
      title="Sitemap"
      href="{{ site.url }}/sitemap.xml">
```

### EJS

```html
<link rel="sitemap" type="application/xml"
      title="Sitemap"
      href="<%= site.url %>/sitemap.xml">
```

---

## 7. Robots

控制搜索引擎对当前页面的索引行为。

### 常见模式

```html
<!-- 允许索引和跟踪链接（默认行为，可不写） -->
<meta name="robots" content="index, follow">

<!-- 不索引当前页面（如标签页、分页第2页+） -->
<meta name="robots" content="noindex, follow">

<!-- 不索引、不跟踪（如搜索结果页） -->
<meta name="robots" content="noindex, nofollow">
```

### Jinja2 实用写法

```html
{# 分页第2页及之后不索引，防止重复内容 #}
{% if pagination and pagination.current > 1 %}
  <meta name="robots" content="noindex, follow">
{% else %}
  <meta name="robots" content="index, follow">
{% endif %}
```

### Go Templates (Pongo2)

```html
{% if pagination and pagination.current > 1 %}
  <meta name="robots" content="noindex, follow">
{% else %}
  <meta name="robots" content="index, follow">
{% endif %}
```

### EJS

```html
<% if (typeof pagination !== 'undefined' && pagination.current > 1) { %>
  <meta name="robots" content="noindex, follow">
<% } else { %>
  <meta name="robots" content="index, follow">
<% } %>
```

---

## 8. 性能相关标签

放置在 `<head>` 顶部，优化资源加载顺序。

### Jinja2

```html
{# DNS 预解析——提前解析外部域名 #}
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">

{# 预连接——建立完整连接（DNS + TCP + TLS） #}
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

{# 预加载关键资源 #}
<link rel="preload" href="{{ site.url }}/styles/main.css" as="style">
<link rel="preload" href="{{ site.url }}/fonts/subset.woff2" as="font" type="font/woff2" crossorigin>

{# 字体显示策略——防止字体加载期间文字不可见 #}
<style>
  @font-face {
    font-family: "CustomFont";
    src: url("/fonts/subset.woff2") format("woff2");
    font-display: swap;
  }
</style>

{# 非关键 CSS 延迟加载 #}
<link rel="preload" href="{{ site.url }}/styles/syntax.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="{{ site.url }}/styles/syntax.css">
</noscript>
```

### Go Templates (Pongo2)

```html
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="{{ site.url }}/styles/main.css" as="style">
<link rel="preload" href="{{ site.url }}/fonts/subset.woff2" as="font" type="font/woff2" crossorigin>
```

### EJS

```html
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="<%= site.url %>/styles/main.css" as="style">
<link rel="preload" href="<%= site.url %>/fonts/subset.woff2" as="font" type="font/woff2" crossorigin>
```

---

## 完整 `<head>` 模板汇总（Jinja2）

将以上所有标签整合在一个 `_head.html` partial 中：

```html
{# templates/includes/_head.html #}
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  {# 性能——尽早放置 #}
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="{{ site.url }}/styles/main.css" as="style">

  {# 标题 #}
  <title>{% block title %}{{ site.title }}{% endblock %}</title>

  {# 描述 #}
  {% if post %}
    <meta name="description" content="{{ post.abstract | truncatechars:160 }}">
  {% else %}
    <meta name="description" content="{{ site.description | truncatechars:160 }}">
  {% endif %}

  <meta name="author" content="{{ site.author }}">
  <link rel="canonical" href="{{ current_url }}">
  <link rel="icon" href="{{ site.favicon }}" type="image/x-icon">

  {# Robots #}
  {% if pagination and pagination.current > 1 %}
    <meta name="robots" content="noindex, follow">
  {% endif %}

  {# Open Graph #}
  {% block og_tags %}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{{ site.title }}">
  <meta property="og:title" content="{{ site.title }}">
  <meta property="og:description" content="{{ site.description | truncatechars:200 }}">
  <meta property="og:url" content="{{ site.url }}">
  <meta property="og:locale" content="zh_CN">
  {% endblock %}

  {# Twitter Card #}
  <meta name="twitter:card" content="summary_large_image">
  {% block twitter_tags %}{% endblock %}

  {# JSON-LD #}
  {% block jsonld %}{% endblock %}

  {# RSS #}
  <link rel="alternate" type="application/rss+xml"
        title="{{ site.title }}" href="{{ site.url }}/rss.xml">
  <link rel="sitemap" type="application/xml"
        title="Sitemap" href="{{ site.url }}/sitemap.xml">

  {# 样式表 #}
  <link rel="stylesheet" href="{{ site.url }}/styles/main.css">
</head>
```
