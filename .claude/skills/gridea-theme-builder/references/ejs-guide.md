# Gridea Pro EJS 主题开发指南（兼容模式）

---

## 重要声明

> **EJS 引擎主要用于兼容旧版 Gridea 主题。新主题强烈推荐使用 Jinja2（Pongo2）引擎。**
>
> Jinja2 拥有更强大的模板继承（extends/block）、更丰富的过滤器系统、更安全的沙箱环境。
> 如果你正在维护旧版 EJS 主题，建议尽快参照本文第 4-5 节完成迁移。

---

## 目录

1. [EJS 基础语法速查](#1-ejs-基础语法速查)
2. [Gridea Pro 中 EJS 的限制](#2-gridea-pro-中-ejs-的限制)
3. [踩坑清单](#3-踩坑清单)
4. [EJS → Jinja2 迁移对照表](#4-ejs--jinja2-迁移对照表)
5. [迁移步骤](#5-迁移步骤)
6. [EJS 完整主题示例](#6-ejs-完整主题示例)

---

## 1. EJS 基础语法速查

### 1.1 输出标签

EJS 有四种核心标签，区别在于输出方式：

```ejs
<%# 这是注释，不会出现在输出中 %>

<% /* 执行 JavaScript 代码，不输出 */ %>
<% var title = config.siteName; %>

<%= value %>   <%# 转义输出：HTML 特殊字符会被转义 %>
<%- value %>   <%# 原始输出：直接输出 HTML，不转义 %>
```

**关键区别示例：**

```ejs
<% var html = '<strong>加粗</strong>'; %>

<%# 转义输出 — 显示原始标签文本 %>
<%= html %>
<%# 输出: &lt;strong&gt;加粗&lt;/strong&gt; %>

<%# 原始输出 — 渲染为 HTML %>
<%- html %>
<%# 输出: <strong>加粗</strong> %>
```

### 1.2 变量访问

Gridea 的 EJS 模板中，变量使用 **camelCase**（小驼峰）命名：

```ejs
<%# 站点配置 %>
<h1><%= config.siteName %></h1>
<p><%= config.siteDescription %></p>
<img src="<%= config.avatar %>" alt="头像">
<img src="<%= config.logo %>" alt="Logo">
<a href="<%= config.domain %>">首页</a>

<%# 主题自定义配置 %>
<%= theme_config.footerText %>

<%# 当前文章 %>
<h1><%= post.title %></h1>
<%- post.content %>
<time><%= post.dateFormat %></time>
<a href="<%= post.link %>">永久链接</a>

<%# 文章特色图片 %>
<% if (post.feature) { %>
  <img src="<%= post.feature %>">
<% } %>

<%# 标签 %>
<% post.tags.forEach(function(tag) { %>
  <a href="<%= tag.link %>"><%= tag.name %></a>
<% }); %>
```

**完整变量参考表：**

| 变量 | 类型 | 说明 |
|---|---|---|
| `config.domain` | String | 站点域名 |
| `config.siteName` | String | 站点名称 |
| `config.siteDescription` | String | 站点描述 |
| `config.avatar` | String | 头像地址 |
| `config.logo` | String | Logo 地址 |
| `theme_config` | Object | 主题 config.json 中 customConfig 的值 |
| `menus` | Array | 导航菜单列表 |
| `menus[i].name` | String | 菜单项名称 |
| `menus[i].link` | String | 菜单项链接 |
| `posts` | Array | 文章列表 |
| `posts[i].title` | String | 文章标题 |
| `posts[i].content` | String | 文章内容（HTML） |
| `posts[i].date` | String | 文章日期 |
| `posts[i].dateFormat` | String | 格式化后的日期 |
| `posts[i].link` | String | 文章链接 |
| `posts[i].tags` | Array | 文章标签列表 |
| `posts[i].feature` | String | 特色图片 URL |
| `posts[i].isTop` | Boolean | 是否置顶 |
| `posts[i].hideInList` | Boolean | 是否在列表中隐藏 |
| `post` | Object | 当前文章（文章详情页） |
| `tags` | Array | 所有标签列表 |
| `tags[i].name` | String | 标签名 |
| `tags[i].link` | String | 标签链接 |
| `tags[i].count` | Number | 标签下文章数 |
| `tag` / `current_tag` | Object | 当前标签（标签页） |
| `memos` | Array | 备忘录列表 |
| `pagination.prev` | String | 上一页 URL |
| `pagination.next` | String | 下一页 URL |

### 1.3 条件判断

```ejs
<%# 基本 if %>
<% if (post.feature) { %>
  <img src="<%= post.feature %>" alt="<%= post.title %>">
<% } %>

<%# if-else %>
<% if (posts.length > 0) { %>
  <p>共 <%= posts.length %> 篇文章</p>
<% } else { %>
  <p>暂无文章</p>
<% } %>

<%# if - else if - else %>
<% if (post.isTop) { %>
  <span class="badge">置顶</span>
<% } else if (post.feature) { %>
  <span class="badge">图文</span>
<% } else { %>
  <span class="badge">普通</span>
<% } %>

<%# 三元表达式 %>
<div class="post <%= post.isTop ? 'is-top' : '' %>">
  <%= post.title %>
</div>

<%# 存在性检查 %>
<% if (typeof theme_config !== 'undefined' && theme_config.showSidebar) { %>
  <aside>侧边栏内容</aside>
<% } %>
```

### 1.4 循环

```ejs
<%# forEach 循环（推荐） %>
<div class="post-list">
  <% posts.forEach(function(post) { %>
    <article class="post-card">
      <h2><a href="<%= post.link %>"><%= post.title %></a></h2>
      <time><%= post.dateFormat %></time>
    </article>
  <% }); %>
</div>

<%# 带索引的 forEach %>
<ul>
  <% posts.forEach(function(post, index) { %>
    <li class="post-item-<%= index %>">
      <%= post.title %>
    </li>
  <% }); %>
</ul>

<%# 传统 for 循环 %>
<% for (var i = 0; i < posts.length; i++) { %>
  <div class="post">
    <h2><%= posts[i].title %></h2>
  </div>
<% } %>

<%# 嵌套循环 %>
<% posts.forEach(function(post) { %>
  <article>
    <h2><%= post.title %></h2>
    <% if (post.tags && post.tags.length > 0) { %>
      <div class="tags">
        <% post.tags.forEach(function(tag) { %>
          <a href="<%= tag.link %>">#<%= tag.name %></a>
        <% }); %>
      </div>
    <% } %>
  </article>
<% }); %>

<%# 导航菜单 %>
<nav>
  <ul>
    <% menus.forEach(function(menu) { %>
      <li><a href="<%= menu.link %>"><%= menu.name %></a></li>
    <% }); %>
  </ul>
</nav>
```

### 1.5 Include（引入）

```ejs
<%# 引入子模板，并传递数据 %>
<%- include('./partials/header', { config: config, menus: menus }) %>

<%# 引入时可以传递所有需要的变量 %>
<%- include('./partials/post-card', { post: post }) %>

<%# 页脚 %>
<%- include('./partials/footer', { config: config, theme_config: theme_config }) %>
```

**注意：** 必须使用 `<%-`（原始输出）而不是 `<%=`（转义输出），否则 include 返回的 HTML 会被转义。

---

## 2. Gridea Pro 中 EJS 的限制

Gridea Pro 中的 EJS 引擎运行在**受限的 JavaScript 环境**中，以下功能均**不可用**：

### 2.1 不支持 require()

```ejs
<%# ❌ 致命错误 %>
<% var fs = require('fs'); %>
<% var path = require('path'); %>
<% var moment = require('moment'); %>
```

### 2.2 不支持 Node.js 特有 API

```ejs
<%# ❌ 以下全部不可用 %>
<% var data = fs.readFileSync('data.json'); %>
<% var fullPath = path.join(__dirname, 'file.txt'); %>
<% var buf = Buffer.from('hello'); %>
<% console.log('debug'); %>  <%# console 可能可用但无意义 %>
<% process.env.NODE_ENV %>   <%# process 不可用 %>
```

### 2.3 不支持 ES6+ 模块语法

```ejs
<%# ❌ 不支持 %>
<% import moment from 'moment'; %>
<% export default function() {} %>
```

### 2.4 不支持 async/await

```ejs
<%# ❌ 不支持 %>
<% var data = await fetchData(); %>
<% async function getData() { } %>
```

### 2.5 可用的 JavaScript 特性

```ejs
<%# ✅ 基本变量和运算 %>
<% var x = 1 + 2; %>
<% var title = post.title.toUpperCase(); %>

<%# ✅ 字符串方法 %>
<%= post.title.trim() %>
<%= post.title.substring(0, 50) %>

<%# ✅ 数组方法 %>
<% var topPosts = posts.filter(function(p) { return p.isTop; }); %>
<% var titles = posts.map(function(p) { return p.title; }); %>

<%# ✅ 条件运算 %>
<%= post.feature ? post.feature : '/images/default.jpg' %>

<%# ✅ JSON 操作 %>
<% var str = JSON.stringify(config); %>
```

---

## 3. 踩坑清单

### 🔴 致命错误（渲染直接失败）

#### 1. 使用了 require()

```ejs
<%# ❌ ReferenceError: require is not defined %>
<% var _ = require('lodash'); %>

<%# ✅ 直接使用原生 JavaScript 方法 %>
<% var sorted = posts.sort(function(a, b) {
  return new Date(b.date) - new Date(a.date);
}); %>
```

#### 2. 使用了 Node.js 特有 API

```ejs
<%# ❌ ReferenceError: fs/path/Buffer is not defined %>
<% var content = fs.readFileSync('data.json', 'utf8'); %>

<%# ✅ 所有数据都通过模板变量获取，无需文件操作 %>
<%= config.siteName %>
```

#### 3. include 路径错误

```ejs
<%# ❌ 路径不存在或后缀错误，渲染失败 %>
<%- include('partials/header') %>       <%# 缺少 ./ %>
<%- include('./partial/header') %>      <%# 目录名拼错 %>
<%- include('./partials/header.ejs') %> <%# 可能需要也可能不需要后缀，取决于配置 %>

<%# ✅ 使用正确的相对路径 %>
<%- include('./partials/header', { config: config }) %>
```

#### 4. 访问 undefined 变量的属性

```ejs
<%# ❌ TypeError: Cannot read property 'title' of undefined %>
<%= post.title %>   <%# 如果当前不是文章页，post 可能是 undefined %>

<%# ✅ 先检查变量是否存在 %>
<% if (typeof post !== 'undefined' && post) { %>
  <h1><%= post.title %></h1>
<% } %>
```

### 🟡 常见错误（不崩溃但结果不符合预期）

#### 5. 忘记用 <%- %> 输出 HTML

```ejs
<%# ❌ HTML 被转义，页面显示标签源码 %>
<div class="content">
  <%= post.content %>
</div>
<%# 输出: &lt;p&gt;文章内容&lt;/p&gt; %>

<%# ✅ 使用原始输出 %>
<div class="content">
  <%- post.content %>
</div>
<%# 输出: <p>文章内容</p> %>
```

#### 6. forEach 回调函数写法错误

```ejs
<%# ❌ 箭头函数在某些受限环境中可能不被支持 %>
<% posts.forEach(post => { %>
  <h2><%= post.title %></h2>
<% }); %>

<%# ✅ 使用传统函数写法，兼容性更好 %>
<% posts.forEach(function(post) { %>
  <h2><%= post.title %></h2>
<% }); %>
```

#### 7. 变量作用域问题

```ejs
<%# ❌ var 的函数作用域可能导致意外 %>
<% for (var i = 0; i < posts.length; i++) { %>
  <div onclick="alert(<%= i %>)">
    <%# 这里 i 始终是最终值，因为 var 没有块作用域 %>
  </div>
<% } %>

<%# ✅ 在受限环境中，使用 forEach 避免作用域问题 %>
<% posts.forEach(function(post, index) { %>
  <div data-index="<%= index %>">
    <h2><%= post.title %></h2>
  </div>
<% }); %>
```

#### 8. include 使用了 <%= 而不是 <%-

```ejs
<%# ❌ include 返回的 HTML 被转义 %>
<%= include('./partials/header', { config: config }) %>

<%# ✅ 用 <%- 原始输出 %>
<%- include('./partials/header', { config: config }) %>
```

#### 9. 循环空数组时无提示

```ejs
<%# ❌ posts 为空时页面空白 %>
<% posts.forEach(function(post) { %>
  <article><%= post.title %></article>
<% }); %>

<%# ✅ 先判断数组长度 %>
<% if (posts.length > 0) { %>
  <% posts.forEach(function(post) { %>
    <article><%= post.title %></article>
  <% }); %>
<% } else { %>
  <p>暂无文章</p>
<% } %>
```

---

## 4. EJS → Jinja2 迁移对照表

以下是完整的语法对照表，覆盖所有常见模式：

### 4.1 标签语法

| EJS | Jinja2 (Pongo2) | 说明 |
|---|---|---|
| `<% code %>` | `{% code %}` | 执行代码 |
| `<%= value %>` | `{{ value }}` | 转义输出 |
| `<%- value %>` | `{{ value\|safe }}` | 原始 HTML 输出 |
| `<%# comment %>` | `{# comment #}` | 注释 |

### 4.2 条件判断

| EJS | Jinja2 (Pongo2) | 说明 |
|---|---|---|
| `<% if (x) { %>` | `{% if x %}` | 开始条件 |
| `<% } else if (y) { %>` | `{% elif y %}` | else if 分支 |
| `<% } else { %>` | `{% else %}` | else 分支 |
| `<% } %>` | `{% endif %}` | 结束条件 |
| `x && y` | `x and y` | 逻辑与 |
| `x \|\| y` | `x or y` | 逻辑或 |
| `!x` | `not x` | 逻辑非 |
| `x === y` | `x == y` | 相等判断 |
| `x !== y` | `x != y` | 不等判断 |
| `typeof x !== 'undefined'` | `{% if x %}` | 存在性检查 |
| `x ? a : b` | `{% if x %}a{% else %}b{% endif %}` | 三元表达式 |

### 4.3 循环

| EJS | Jinja2 (Pongo2) | 说明 |
|---|---|---|
| `<% posts.forEach(function(p) { %>` | `{% for p in posts %}` | 开始循环 |
| `<% }); %>` | `{% endfor %}` | 结束循环 |
| `<% for (var i=0; i<a.length; i++) { %>` | `{% for item in a %}` | for 循环 |
| `<% } %>` | `{% endfor %}` | 结束 for |
| 手动计数 | `{{ forloop.Counter }}` | 循环计数（从1开始） |
| 手动计数 | `{{ forloop.Counter0 }}` | 循环计数（从0开始） |
| 手动判断 | `{{ forloop.First }}` | 是否第一个 |
| 手动判断 | `{{ forloop.Last }}` | 是否最后一个 |
| N/A | `{% for p in posts %}...{% empty %}无数据{% endfor %}` | 空循环处理 |

### 4.4 模板组织

| EJS | Jinja2 (Pongo2) | 说明 |
|---|---|---|
| `<%- include('./partials/x') %>` | `{% include "partials/x.html" %}` | 引入子模板 |
| N/A | `{% extends "base.html" %}` | 模板继承（EJS 无此概念） |
| N/A | `{% block content %}{% endblock %}` | 块定义（EJS 无此概念） |

### 4.5 变量与过滤器

| EJS | Jinja2 (Pongo2) | 说明 |
|---|---|---|
| `x.length` | `x\|length` | 获取长度 |
| `x.toUpperCase()` | `x\|upper` | 转大写 |
| `x.toLowerCase()` | `x\|lower` | 转小写 |
| `x.trim()` | `x\|trim` | 去除空白 |
| `x.substring(0, 100)` | `x\|truncate:100` | 截断字符串 |
| `x.replace('a', 'b')` | `x\|replace:"a","b"` | 字符串替换 |
| `JSON.stringify(x)` | `x\|json` | 转 JSON |
| `encodeURIComponent(x)` | `x\|urlencode` | URL 编码 |
| `new Date(x).toLocaleDateString()` | `x\|date:"2006-01-02"` | 日期格式化 |

### 4.6 完整代码对照

**EJS 版本：**

```ejs
<%- include('./partials/header', { config: config }) %>
<main>
  <% if (posts.length > 0) { %>
    <% posts.forEach(function(post) { %>
      <article class="<%= post.isTop ? 'is-top' : '' %>">
        <h2><a href="<%= post.link %>"><%= post.title %></a></h2>
        <time><%= post.dateFormat %></time>
        <% if (post.tags && post.tags.length > 0) { %>
          <div class="tags">
            <% post.tags.forEach(function(tag) { %>
              <a href="<%= tag.link %>">#<%= tag.name %></a>
            <% }); %>
          </div>
        <% } %>
        <% if (post.feature) { %>
          <img src="<%= post.feature %>" alt="<%= post.title %>">
        <% } %>
      </article>
    <% }); %>
  <% } else { %>
    <p>暂无文章</p>
  <% } %>
</main>
<%- include('./partials/footer', { config: config }) %>
```

**对应 Jinja2 版本：**

```jinja2
{% extends "base.html" %}
{% block content %}
<main>
  {% for post in posts %}
    <article class="{% if post.isTop %}is-top{% endif %}">
      <h2><a href="{{ post.link }}">{{ post.title }}</a></h2>
      <time>{{ post.dateFormat }}</time>
      {% if post.tags and post.tags|length > 0 %}
        <div class="tags">
          {% for tag in post.tags %}
            <a href="{{ tag.link }}">#{{ tag.name }}</a>
          {% endfor %}
        </div>
      {% endif %}
      {% if post.feature %}
        <img src="{{ post.feature }}" alt="{{ post.title }}">
      {% endif %}
    </article>
  {% empty %}
    <p>暂无文章</p>
  {% endfor %}
</main>
{% endblock %}
```

---

## 5. 迁移步骤

### 第一步：复制主题目录

```bash
# 复制原 EJS 主题为新主题
cp -r themes/my-ejs-theme themes/my-jinja2-theme
cd themes/my-jinja2-theme
```

### 第二步：修改 config.json 引擎声明

```json
{
  "name": "My Jinja2 Theme",
  "version": "2.0.0",
  "engine": "jinja2",
  "author": "Your Name",
  "customConfig": []
}
```

将 `"engine"` 从 `"ejs"` 改为 `"jinja2"`。

### 第三步：转换所有模板文件

按照第 4 节对照表逐文件转换。建议按以下顺序进行：

1. **先转换 partials（子模板）**：header、footer 等
2. **再转换主模板**：index、post、tag 等
3. **添加 base.html**：利用 Jinja2 的模板继承替代 EJS 的 include

**base.html 模板示例：**

```jinja2
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ config.siteName }}{% endblock %}</title>
  <meta name="description" content="{{ config.siteDescription }}">
  <link rel="stylesheet" href="/assets/styles/main.css">
  {% block head %}{% endblock %}
</head>
<body>
  <header class="site-header">
    <div class="container">
      {% if config.logo %}
        <a href="/"><img src="{{ config.logo }}" alt="{{ config.siteName }}"></a>
      {% else %}
        <a href="/" class="site-title">{{ config.siteName }}</a>
      {% endif %}
      {% if menus %}
        <nav>
          <ul>
            {% for menu in menus %}
              <li><a href="{{ menu.link }}">{{ menu.name }}</a></li>
            {% endfor %}
          </ul>
        </nav>
      {% endif %}
    </div>
  </header>
  <main class="site-main">
    <div class="container">
      {% block content %}{% endblock %}
    </div>
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>{{ theme_config.footerText }}</p>
    </div>
  </footer>
  {% block scripts %}{% endblock %}
</body>
</html>
```

**转换 index 页面：**

```jinja2
{# 从 index.ejs 转换为 index.html #}
{% extends "base.html" %}

{% block title %}{{ config.siteName }} - {{ config.siteDescription }}{% endblock %}

{% block content %}
<section class="post-list">
  {% for post in posts %}
    {% if not post.hideInList %}
      <article class="post-card {% if post.isTop %}is-top{% endif %}">
        {% if post.isTop %}
          <span class="top-badge">置顶</span>
        {% endif %}
        {% if post.feature %}
          <a href="{{ post.link }}">
            <img src="{{ post.feature }}" alt="{{ post.title }}" loading="lazy">
          </a>
        {% endif %}
        <h2><a href="{{ post.link }}">{{ post.title }}</a></h2>
        <time>{{ post.dateFormat }}</time>
        {% if post.tags %}
          <div class="tags">
            {% for tag in post.tags %}
              <a href="{{ tag.link }}">#{{ tag.name }}</a>
            {% endfor %}
          </div>
        {% endif %}
      </article>
    {% endif %}
  {% empty %}
    <p>暂无文章</p>
  {% endfor %}
</section>

{% if pagination.prev or pagination.next %}
  <nav class="pagination">
    {% if pagination.prev %}
      <a href="{{ pagination.prev }}">&larr; 上一页</a>
    {% endif %}
    {% if pagination.next %}
      <a href="{{ pagination.next }}">下一页 &rarr;</a>
    {% endif %}
  </nav>
{% endif %}
{% endblock %}
```

### 第四步：重命名模板文件

```bash
# 将 .ejs 后缀改为 .html
find templates/ -name "*.ejs" -exec bash -c 'mv "$1" "${1%.ejs}.html"' _ {} \;
```

### 第五步：验证语法

使用 Gridea Pro 的主题预览功能逐页检查：

1. 首页列表是否正确渲染
2. 文章详情页内容是否正常
3. 标签页和标签列表页
4. 分页导航是否工作
5. 特色图片、置顶标记等条件渲染
6. 导航菜单
7. 页脚信息

### 第六步：常见转换错误排查

| 现象 | 可能原因 | 解决方案 |
|---|---|---|
| 页面空白 | 模板文件未被识别 | 检查 config.json 的 engine 字段，检查文件后缀 |
| 显示 HTML 源码 | 需要 `\|safe` 过滤器 | `{{ post.content\|safe }}` |
| 变量不输出 | 变量名大小写不对 | 检查变量名是否与引擎匹配 |
| 循环不执行 | for 语法不对 | 确保用 `{% for x in list %}` |
| 模板继承不生效 | extends 路径错误 | 检查 base.html 路径和 block 名称 |
| 页面报错 | Jinja2 语法错误 | 检查是否还有残留的 EJS 语法 |

### 第七步：视觉对比

将新旧主题同时启用，逐页对比视觉效果，确认一致后完成迁移。

---

## 6. EJS 完整主题示例

以下是一个最小但完整的 EJS 主题，供维护旧主题时参考。

### 目录结构

```
my-ejs-theme/
├── config.json
├── templates/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs
│   ├── post.ejs
│   └── tag.ejs
└── assets/
    └── styles/
        └── main.css
```

### config.json

```json
{
  "name": "My EJS Theme",
  "version": "1.0.0",
  "engine": "ejs",
  "author": "Your Name",
  "customConfig": [
    {
      "name": "showSidebar",
      "label": "显示侧边栏",
      "type": "toggle",
      "value": true
    },
    {
      "name": "footerText",
      "label": "页脚文字",
      "type": "input",
      "value": "Powered by Gridea"
    }
  ]
}
```

### partials/header.ejs

```ejs
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof pageTitle !== 'undefined' ? pageTitle + ' - ' : '' %><%= config.siteName %></title>
  <meta name="description" content="<%= config.siteDescription %>">
  <link rel="stylesheet" href="/assets/styles/main.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <div class="header-inner">
        <% if (config.logo) { %>
          <a href="/" class="site-logo">
            <img src="<%= config.logo %>" alt="<%= config.siteName %>">
          </a>
        <% } else { %>
          <a href="/" class="site-title"><%= config.siteName %></a>
        <% } %>
        <% if (menus && menus.length > 0) { %>
          <nav class="site-nav">
            <ul>
              <% menus.forEach(function(menu) { %>
                <li><a href="<%= menu.link %>"><%= menu.name %></a></li>
              <% }); %>
            </ul>
          </nav>
        <% } %>
      </div>
    </div>
  </header>
  <main class="site-main">
    <div class="container">
```

### partials/footer.ejs

```ejs
    </div>
  </main>
  <footer class="site-footer">
    <div class="container">
      <% if (typeof theme_config !== 'undefined' && theme_config.footerText) { %>
        <p><%= theme_config.footerText %></p>
      <% } %>
      <p>&copy; <%= new Date().getFullYear() %> <%= config.siteName %></p>
    </div>
  </footer>
</body>
</html>
```

### index.ejs（首页 / 文章列表页）

```ejs
<%- include('./partials/header', {
  config: config,
  menus: menus,
  theme_config: theme_config
}) %>

<section class="post-list">
  <% if (posts.length > 0) { %>
    <% posts.forEach(function(post) { %>
      <% if (!post.hideInList) { %>
        <article class="post-card <%= post.isTop ? 'is-top' : '' %>">
          <% if (post.isTop) { %>
            <span class="top-badge">置顶</span>
          <% } %>
          <% if (post.feature) { %>
            <a href="<%= post.link %>" class="post-cover">
              <img src="<%= post.feature %>" alt="<%= post.title %>" loading="lazy">
            </a>
          <% } %>
          <div class="post-body">
            <h2 class="post-title">
              <a href="<%= post.link %>"><%= post.title %></a>
            </h2>
            <div class="post-meta">
              <time><%= post.dateFormat %></time>
              <% if (post.tags && post.tags.length > 0) { %>
                <span class="post-tags">
                  <% post.tags.forEach(function(tag) { %>
                    <a href="<%= tag.link %>" class="tag">#<%= tag.name %></a>
                  <% }); %>
                </span>
              <% } %>
            </div>
          </div>
        </article>
      <% } %>
    <% }); %>
  <% } else { %>
    <div class="empty-state">
      <h2>暂无文章</h2>
      <p>博主还没有发布任何文章，请稍后再来。</p>
    </div>
  <% } %>
</section>

<% if ((pagination.prev) || (pagination.next)) { %>
  <nav class="pagination">
    <% if (pagination.prev) { %>
      <a href="<%= pagination.prev %>" class="page-prev">&larr; 上一页</a>
    <% } %>
    <% if (pagination.next) { %>
      <a href="<%= pagination.next %>" class="page-next">下一页 &rarr;</a>
    <% } %>
  </nav>
<% } %>

<%- include('./partials/footer', {
  config: config,
  theme_config: theme_config
}) %>
```

### post.ejs（文章详情页）

```ejs
<%- include('./partials/header', {
  config: config,
  menus: menus,
  theme_config: theme_config,
  pageTitle: post.title
}) %>

<% if (typeof post !== 'undefined' && post) { %>
  <article class="post-detail">
    <header class="post-header">
      <h1><%= post.title %></h1>
      <div class="post-meta">
        <time><%= post.dateFormat %></time>
      </div>
      <% if (post.tags && post.tags.length > 0) { %>
        <div class="post-tags">
          <% post.tags.forEach(function(tag) { %>
            <a href="<%= tag.link %>" class="tag">#<%= tag.name %></a>
          <% }); %>
        </div>
      <% } %>
    </header>

    <% if (post.feature) { %>
      <figure class="post-feature">
        <img src="<%= post.feature %>" alt="<%= post.title %>">
      </figure>
    <% } %>

    <div class="post-content markdown-body">
      <%- post.content %>
    </div>

    <footer class="post-footer">
      <nav class="post-nav">
        <% if (pagination.prev) { %>
          <a href="<%= pagination.prev %>" class="nav-prev">&larr; 上一篇</a>
        <% } %>
        <% if (pagination.next) { %>
          <a href="<%= pagination.next %>" class="nav-next">下一篇 &rarr;</a>
        <% } %>
      </nav>
    </footer>
  </article>
<% } %>

<%- include('./partials/footer', {
  config: config,
  theme_config: theme_config
}) %>
```

### tag.ejs（标签页）

```ejs
<%- include('./partials/header', {
  config: config,
  menus: menus,
  theme_config: theme_config,
  pageTitle: typeof current_tag !== 'undefined' ? '标签: ' + current_tag.name : '所有标签'
}) %>

<% if (typeof current_tag !== 'undefined' && current_tag) { %>
  <section class="tag-page">
    <h1 class="tag-heading">
      标签: <span class="tag-name"><%= current_tag.name %></span>
      <span class="tag-count">(<%= current_tag.count %> 篇)</span>
    </h1>
    <% if (posts.length > 0) { %>
      <% posts.forEach(function(post) { %>
        <article class="post-card">
          <h2 class="post-title">
            <a href="<%= post.link %>"><%= post.title %></a>
          </h2>
          <time><%= post.dateFormat %></time>
        </article>
      <% }); %>
    <% } else { %>
      <p>该标签下暂无文章。</p>
    <% } %>
  </section>
<% } else { %>
  <section class="all-tags">
    <h1>所有标签</h1>
    <% if (tags.length > 0) { %>
      <div class="tag-cloud">
        <% tags.forEach(function(tag) { %>
          <a href="<%= tag.link %>" class="tag-item">
            <%= tag.name %> <span>(<%= tag.count %>)</span>
          </a>
        <% }); %>
      </div>
    <% } else { %>
      <p>暂无标签。</p>
    <% } %>
  </section>
<% } %>

<% if ((pagination.prev) || (pagination.next)) { %>
  <nav class="pagination">
    <% if (pagination.prev) { %>
      <a href="<%= pagination.prev %>">&larr; 上一页</a>
    <% } %>
    <% if (pagination.next) { %>
      <a href="<%= pagination.next %>">下一页 &rarr;</a>
    <% } %>
  </nav>
<% } %>

<%- include('./partials/footer', {
  config: config,
  theme_config: theme_config
}) %>
```

---

> **再次提醒：** EJS 引擎仅建议用于维护旧版主题。新项目请直接使用 Jinja2 引擎，
> 可获得模板继承、宏定义、丰富的过滤器等现代模板引擎特性。
