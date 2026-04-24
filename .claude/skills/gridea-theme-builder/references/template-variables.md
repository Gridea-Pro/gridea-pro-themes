# Gridea Pro 模板变量完整参考

> **这是主题开发中最重要的文件。** 渲染出错 80% 的原因是变量名拼写错误。编写任何模板代码之前，必须先查阅本文件。

## 目录

1. [全局变量](#全局变量)
2. [Post 对象](#post-对象)
3. [Tag 对象](#tag-对象)
4. [Menu 对象](#menu-对象)
5. [Pagination 对象](#pagination-对象)
6. [Memo 对象](#memo-对象)
7. [各页面可用变量表](#各页面可用变量表)
8. [三引擎语法对照表](#三引擎语法对照表)

---

## 全局变量

以下变量在**所有页面**中均可使用：

| 变量 | 类型 | 说明 |
|------|------|------|
| `config` | Object | 站点级配置对象 |
| `config.domain` | string | 站点域名，含协议头，无尾部斜杠。示例：`"https://myblog.com"` |
| `config.siteName` | string | 站点名称 |
| `config.siteDescription` | string | 站点描述 |
| `config.avatar` | string | 头像图片路径 |
| `config.logo` | string | Logo 图片路径 |
| `theme_config` | Object | 主题自定义配置对象（来自 config.json 中 `customConfig` 的定义） |
| `theme_config.xxx` | 视定义而定 | 通过 customConfig 中各项的 `name` 字段访问，如 `theme_config.primaryColor` |
| `menus` | []Menu | 导航菜单列表 |
| `tags` | []Tag | 所有标签列表 |
| `now` | time.Time | 当前时间（Go 的 `time.Time` 对象，可使用 `|date` 过滤器格式化） |

### config 与 theme_config 的区别

- **`config`**：站点级配置，由 Gridea Pro 核心定义，包含 domain、siteName、siteDescription、avatar、logo 等
- **`theme_config`**：主题自定义配置，由主题开发者在 config.json 的 `customConfig` 数组中声明，用户通过 GUI 面板设置值

**切勿混淆！** 在模板中访问自定义配置项时，必须使用 `theme_config.xxx`，不能用 `config.xxx`。

---

## Post 对象

文章对象，在列表页通过循环 `posts` 获取，在文章详情页通过 `post` 直接访问。

| 字段 | 类型 | 说明 |
|------|------|------|
| `post.title` | string | 文章标题 |
| `post.content` | string | 渲染后的 HTML 内容。**Jinja2 中必须用 `\|safe` 过滤器输出**，否则 HTML 标签会被转义 |
| `post.date` | string | 发布日期。**已经是格式化后的字符串，不是 time.Time 对象**——不要对其使用 `\|date` 过滤器 |
| `post.dateFormat` | string | 格式化后的日期显示字符串 |
| `post.link` | string | 文章 URL 路径（相对路径） |
| `post.tags` | []Tag | 文章的标签列表 |
| `post.feature` | string | 特色图片 URL。无特色图片时为空字符串 `""` |
| `post.isTop` | bool | 是否置顶 |
| `post.hideInList` | bool | 是否在列表中隐藏 |
| `post.fileName` | string | 源文件名 |

### 关键注意事项

- **`post.content` 是 HTML**：已经由 Markdown 渲染为 HTML，在 Jinja2 中必须使用 `{{ post.content|safe }}` 输出，在 Go Templates 中使用 `{{ .Post.Content }}`（默认不转义），在 EJS 中使用 `<%- post.content %>`（注意是 `<%-` 不是 `<%=`）
- **`post.date` 是字符串**：这是最常见的错误来源。不要写 `{{ post.date|date:"2006-01-02" }}`，直接写 `{{ post.date }}` 即可
- **`post.feature` 可能为空**：展示特色图片前必须判断是否为空字符串

---

## Tag 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `tag.name` | string | 标签名称 |
| `tag.link` | string | 标签页 URL |
| `tag.count` | int | 使用该标签的文章数量 |

---

## Menu 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `menu.name` | string | 菜单显示名称 |
| `menu.link` | string | 菜单链接 URL |

---

## Pagination 对象

分页对象，仅在支持分页的页面中可用（index.html、blog.html）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `pagination.prev` | string | 上一页 URL。已是第一页时为空字符串 `""` |
| `pagination.next` | string | 下一页 URL。已是最后一页时为空字符串 `""` |

### 分页使用示例（Jinja2）

```jinja2
<nav class="pagination">
  {% if pagination.prev %}
    <a href="{{ pagination.prev }}">上一页</a>
  {% endif %}
  {% if pagination.next %}
    <a href="{{ pagination.next }}">下一页</a>
  {% endif %}
</nav>
```

---

## Memo 对象

短想法/灵感记录对象，仅在 memos.html 中通过 `memos` 列表访问。

| 字段 | 类型 | 说明 |
|------|------|------|
| `memo.content` | string | Memo 内容（HTML） |
| `memo.date` | string | 发布日期 |

---

## 各页面可用变量表

每个模板文件可访问的变量不同，在模板中使用变量前务必确认该页面是否有权访问：

| 页面模板 | 可用变量 |
|----------|----------|
| `index.html` | config, theme_config, menus, posts, tags, pagination, now |
| `post.html` | config, theme_config, menus, post, tags, now |
| `archives.html` | config, theme_config, menus, posts, tags, now |
| `tag.html` | config, theme_config, menus, posts, tag, current_tag, tags, now |
| `tags.html` | config, theme_config, menus, tags, now |
| `about.html` | config, theme_config, menus, tags, now |
| `links.html` | config, theme_config, menus, tags, links, now |
| `memos.html` | config, theme_config, menus, memos, tags, now |
| `blog.html` | config, theme_config, menus, posts, tags, pagination, now |
| `404.html` | config, theme_config, menus, now |

### 关键区别

- **index.html vs post.html**：index 页有 `posts`（列表）和 `pagination`；post 页有 `post`（单个对象），无 pagination
- **tag.html**：同时有 `tag`（当前标签对象）、`current_tag` 和 `posts`（该标签下的文章列表），也有 `tags`（全部标签）
- **tags.html**：只有 `tags`（全部标签列表），没有 `posts`
- **404.html**：变量最少，仅有 config、theme_config、menus、now

---

## 三引擎语法对照表

以下对照表展示同一操作在 Jinja2 (Pongo2)、Go Templates、EJS 中的写法。**注意 Pongo2 与标准 Jinja2 存在差异，此处以 Pongo2 实际语法为准。**

### 输出文本变量

```jinja2
{# Jinja2 (Pongo2) #}
{{ config.siteName }}
```

```go
{{/* Go Templates */}}
{{ .Config.SiteName }}
```

```ejs
<!-- EJS -->
<%= config.siteName %>
```

### 输出原始 HTML（不转义）

```jinja2
{# Jinja2 (Pongo2) #}
{{ post.content|safe }}
```

```go
{{/* Go Templates — 默认不转义 */}}
{{ .Post.Content }}
```

```ejs
<!-- EJS — 使用 <%- 而非 <%= -->
<%- post.content %>
```

### 循环遍历文章列表

```jinja2
{# Jinja2 (Pongo2) #}
{% for post in posts %}
  <h2>{{ post.title }}</h2>
{% endfor %}
```

```go
{{/* Go Templates */}}
{{ range .Posts }}
  <h2>{{ .Title }}</h2>
{{ end }}
```

```ejs
<!-- EJS -->
<% posts.forEach(function(post) { %>
  <h2><%= post.title %></h2>
<% }); %>
```

### 条件判断

```jinja2
{# Jinja2 (Pongo2) #}
{% if post.isTop %}
  <span>置顶</span>
{% endif %}
```

```go
{{/* Go Templates */}}
{{ if .Post.IsTop }}
  <span>置顶</span>
{{ end }}
```

```ejs
<!-- EJS -->
<% if (post.isTop) { %>
  <span>置顶</span>
<% } %>
```

### 判断变量是否存在或有值

```jinja2
{# Jinja2 (Pongo2) #}
{% if post.feature %}
  <img src="{{ post.feature }}" />
{% endif %}
```

```go
{{/* Go Templates — 必须判空防 nil panic */}}
{{ if .Post.Feature }}
  <img src="{{ .Post.Feature }}" />
{{ end }}
```

```ejs
<!-- EJS -->
<% if (post.feature) { %>
  <img src="<%= post.feature %>" />
<% } %>
```

### 访问嵌套字段

```jinja2
{# Jinja2 (Pongo2) #}
{{ config.siteName }}
{{ theme_config.primaryColor }}
```

```go
{{/* Go Templates */}}
{{ .Config.SiteName }}
{{ .ThemeConfig.primaryColor }}
```

```ejs
<!-- EJS -->
<%= config.siteName %>
<%= theme_config.primaryColor %>
```

### 带索引的循环

```jinja2
{# Jinja2 (Pongo2) — 使用 forloop 内置对象 #}
{% for post in posts %}
  <span>{{ forloop.Counter }}. {{ post.title }}</span>
{% endfor %}
```

```go
{{/* Go Templates */}}
{{ range $index, $post := .Posts }}
  <span>{{ $index }}. {{ $post.Title }}</span>
{{ end }}
```

```ejs
<!-- EJS -->
<% posts.forEach(function(post, index) { %>
  <span><%= index + 1 %>. <%= post.title %></span>
<% }); %>
```

### 引入局部模板

```jinja2
{# Jinja2 (Pongo2) — 路径相对于 templates/ 根目录 #}
{% include "partials/header.html" %}
```

```go
{{/* Go Templates */}}
{{ template "partials/header.html" . }}
```

```ejs
<!-- EJS -->
<%- include('partials/header') %>
```

### 模板继承

```jinja2
{# Jinja2 (Pongo2) — base.html #}
<!DOCTYPE html>
<html>
<head><title>{% block title %}{% endblock %}</title></head>
<body>{% block content %}{% endblock %}</body>
</html>

{# index.html #}
{% extends "base.html" %}
{% block title %}{{ config.siteName }}{% endblock %}
{% block content %}
  <h1>文章列表</h1>
{% endblock %}
```

```go
{{/* Go Templates — 使用 define/template，无原生继承 */}}
{{/* base.html */}}
<!DOCTYPE html>
<html>
<head><title>{{ template "title" . }}</title></head>
<body>{{ template "content" . }}</body>
</html>

{{/* index.html */}}
{{ define "title" }}{{ .Config.SiteName }}{{ end }}
{{ define "content" }}
  <h1>文章列表</h1>
{{ end }}
```

```ejs
<!-- EJS — 无原生继承，用 include 模拟 -->
<!-- partials/head.ejs -->
<!DOCTYPE html>
<html>
<head><title><%= title %></title></head>
<body>

<!-- index.ejs -->
<%- include('partials/head', { title: config.siteName }) %>
  <h1>文章列表</h1>
<%- include('partials/footer') %>
```

### 访问站点配置与主题配置

```jinja2
{# Jinja2 (Pongo2) #}
站点名称：{{ config.siteName }}
主题自定义色：{{ theme_config.primaryColor }}
```

```go
{{/* Go Templates */}}
站点名称：{{ .Config.SiteName }}
主题自定义色：{{ .ThemeConfig.primaryColor }}
```

```ejs
<!-- EJS -->
站点名称：<%= config.siteName %>
主题自定义色：<%= theme_config.primaryColor %>
```

### 日期格式化

```jinja2
{# Jinja2 (Pongo2) #}
{# now 是 time.Time，可用 date 过滤器 #}
{{ now|date:"2006-01-02" }}

{# post.date 已经是字符串，直接输出 #}
{{ post.date }}
```

```go
{{/* Go Templates */}}
{{ .Now.Format "2006-01-02" }}
{{ .Post.Date }}
```

```ejs
<!-- EJS -->
<%= now.Format("2006-01-02") %>
<%= post.date %>
```

### 字符串长度

```jinja2
{# Jinja2 (Pongo2) #}
{{ post.title|length }}
```

```go
{{/* Go Templates — 内置 len 函数 */}}
{{ len .Post.Title }}
```

```ejs
<!-- EJS -->
<%= post.title.length %>
```

### 默认值

```jinja2
{# Jinja2 (Pongo2) — 参数用冒号，不用括号！ #}
{{ post.feature|default:"/images/default-cover.jpg" }}
```

```go
{{/* Go Templates — 使用 if-else */}}
{{ if .Post.Feature }}{{ .Post.Feature }}{{ else }}/images/default-cover.jpg{{ end }}
```

```ejs
<!-- EJS -->
<%= post.feature || '/images/default-cover.jpg' %>
```

---

## 易错变量速查

| 错误写法 | 正确写法 | 原因 |
|----------|----------|------|
| `post.url` | `post.link` | Gridea 用 `link` 不用 `url` |
| `post.description` | `post.content` | 无 description 字段，内容在 content 中 |
| `post.image` | `post.feature` | 特色图片字段名为 `feature` |
| `post.pinned` | `post.isTop` | 置顶字段名为 `isTop` |
| `post.created_at` | `post.date` | 日期字段名为 `date` |
| `config.title` | `config.siteName` | 站点名称字段为 `siteName` |
| `config.url` | `config.domain` | 域名字段为 `domain` |
| `tag.slug` | `tag.link` | 标签链接字段为 `link` |
| `tag.posts_count` | `tag.count` | 标签文章数字段为 `count` |
| `theme_config` 写成 `themeConfig` | `theme_config` | 模板中使用下划线命名 |
| `pagination.previous` | `pagination.prev` | 上一页字段简写为 `prev` |
| `{{ value\|default("x") }}` | `{{ value\|default:"x" }}` | Pongo2 过滤器参数用冒号 |
