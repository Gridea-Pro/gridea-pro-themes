# Gridea Pro Jinja2 (Pongo2) 主题开发指南

> **适用版本**：Gridea Pro（Go 后端，Pongo2 模板引擎）
> **引擎说明**：Pongo2 是 Jinja2 的 Go 实现，与 Python Jinja2 约 90% 兼容，但剩余 10% 的差异会导致 90% 的错误。
> **本文档目标**：覆盖全部差异与陷阱，让开发者写出零错误的 Pongo2 模板。

---

## 目录

- [1. 基础语法速查](#1-基础语法速查)
  - [1.1 变量输出](#11-变量输出)
  - [1.2 注释](#12-注释)
  - [1.3 模板继承 (extends + block)](#13-模板继承-extends--block)
  - [1.4 Include 组件](#14-include-组件)
  - [1.5 条件判断 (if/elif/else)](#15-条件判断-ifelifelse)
  - [1.6 循环 (for)](#16-循环-for)
  - [1.7 Set 变量](#17-set-变量)
  - [1.8 Filter 管道](#18-filter-管道)
- [2. Pongo2 vs 标准 Jinja2：12 个致命差异](#2-pongo2-vs-标准-jinja212-个致命差异)
- [3. 踩坑清单](#3-踩坑清单)
- [4. 常用模式代码](#4-常用模式代码)
  - [4.1 文章列表（带空状态处理）](#41-文章列表带空状态处理)
  - [4.2 分页导航](#42-分页导航)
  - [4.3 标签云](#43-标签云)
  - [4.4 文章详情页（完整）](#44-文章详情页完整)
  - [4.5 侧边栏 / 最新文章](#45-侧边栏--最新文章)
  - [4.6 面包屑导航](#46-面包屑导航)
  - [4.7 暗色模式切换（JS + 模板配合）](#47-暗色模式切换js--模板配合)
  - [4.8 条件加载资源（根据 theme_config）](#48-条件加载资源根据-theme_config)
- [5. 从 EJS 迁移检查清单](#5-从-ejs-迁移检查清单)
- [6. 完整 Filter 参考](#6-完整-filter-参考)
  - [6.1 Pongo2 内置 Filter](#61-pongo2-内置-filter)
  - [6.2 Gridea Pro 自定义 Filter](#62-gridea-pro-自定义-filter)

---

## 1. 基础语法速查

### 1.1 变量输出

```jinja2
{# 自动转义 HTML，安全输出纯文本 #}
{{ post.title }}

{# 输出原始 HTML（不转义），用于富文本内容 #}
{{ post.content|safe }}

{# 带默认值的输出 —— 注意冒号语法 #}
{{ post.description|default:"暂无描述" }}
```

**关键规则**：
- `{{ }}` 内的内容会被自动 HTML 转义
- 要输出 HTML 原文必须使用 `|safe` filter
- 所有 `{{ }}` 和 `{% %}` 标签内容必须写在同一行（不可换行）

### 1.2 注释

```jinja2
{# 这是单行注释，不会出现在渲染输出中 #}

{# 
  Pongo2 的注释可以跨越多行，
  但注意 {% %} 和 {{ }} 不可以。
#}
```

### 1.3 模板继承 (extends + block)

**基础布局文件** `templates/base.html`：

```jinja2
<!DOCTYPE html>
<html lang="{{ config.language|default:"zh-CN" }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ config.siteName }}{% endblock %}</title>
  {% block head %}{% endblock %}
  <link rel="stylesheet" href="{{ config.themeBasePath }}/style.css">
</head>
<body>
  {% include "partials/header.html" %}
  <main>
    {% block content %}{% endblock %}
  </main>
  {% include "partials/footer.html" %}
  {% block scripts %}{% endblock %}
</body>
</html>
```

**子模板继承**：

```jinja2
{% extends "base.html" %}

{% block title %}{{ post.title }} | {{ config.siteName }}{% endblock %}

{% block content %}
<article>
  <h1>{{ post.title }}</h1>
  {{ post.content|safe }}
</article>
{% endblock %}
```

**关键规则**：
- `{% extends %}` 必须是模板中的第一个标签
- 子模板只能定义 `{% block %}` 内容，block 之外的内容会被忽略
- block 可以嵌套，子 block 可以通过 `{{ block.super }}` 引用父级内容（Pongo2 支持 `block.super`）

### 1.4 Include 组件

```jinja2
{# 路径始终相对于 templates/ 根目录 #}
{% include "partials/header.html" %}
{% include "partials/sidebar.html" %}
{% include "partials/comment.html" %}
```

**关键规则**：
- 路径始终相对于 `templates/` 根目录，不论当前模板文件在哪个子目录
- 即使你在 `templates/partials/head.html` 中，引用同目录文件仍写为：
  - ✅ `{% include "partials/global-seo.html" %}`
  - ❌ `{% include "global-seo.html" %}`
  - ❌ `{% include "./global-seo.html" %}`
- Include 的模板可以访问当前上下文的所有变量
- Pongo2 **不支持** `{% include "x.html" with foo=bar %}`，但被 include 的模板自动继承父级变量上下文

### 1.5 条件判断 (if/elif/else)

```jinja2
{# 基础用法 #}
{% if posts|length > 0 %}
  <div class="post-list">...</div>
{% else %}
  <p>暂无文章</p>
{% endif %}

{# 多条件 #}
{% if post.isTop %}
  <span class="badge">置顶</span>
{% elif post.isHot %}
  <span class="badge">热门</span>
{% else %}
  <span class="badge">普通</span>
{% endif %}

{# 逻辑运算符 —— 必须用 and / or / not #}
{% if post.tags|length > 0 and post.showTags %}
  <div class="tags">...</div>
{% endif %}

{% if not post.hideComments %}
  {% include "partials/comment.html" %}
{% endif %}

{# 真值判断 —— 直接用变量名判断是否存在 / 非空 #}
{% if commentSetting %}
  {# commentSetting 存在且非空 #}
{% endif %}

{# 包含判断 #}
{% if "about" in post.link %}
  <div>关于页面</div>
{% endif %}

{# 否定包含 —— 注意语序 #}
{% if not "about" in post.link %}
  <div>不是关于页面</div>
{% endif %}
```

**关键规则**：
- 使用 `and`、`or`、`not`，不可使用 `&&`、`||`、`!`
- 不支持 `is defined` 测试，直接用变量名判断真假即可
- 否定包含写 `not x in y`，不可写 `x not in y`
- 不支持 Python 三元表达式 `a if cond else b`

### 1.6 循环 (for)

```jinja2
{# 基础循环 #}
{% for post in posts %}
  <article>
    <h2>{{ post.title }}</h2>
    <time>{{ post.date }}</time>
  </article>
{% endfor %}

{# 带空判断的循环 —— 先判断再循环更安全 #}
{% if posts|length > 0 %}
  {% for post in posts %}
    <div>{{ post.title }}</div>
  {% endfor %}
{% else %}
  <p>暂无文章</p>
{% endif %}

{# 循环变量 #}
{% for tag in tags %}
  {{ loop.index }}    {# 1-based 序号：1, 2, 3, ... #}
  {{ loop.index0 }}   {# 0-based 序号：0, 1, 2, ... #}
  {{ loop.first }}    {# 是否是第一个：true / false #}
  {{ loop.last }}     {# 是否是最后一个：true / false #}
{% endfor %}

{# 循环中加条件 #}
{% for post in posts %}
  {% if post.isPublished %}
    <div>{{ post.title }}</div>
  {% endif %}
{% endfor %}
```

**关键规则**：
- `{% for post in posts %}` 中的循环变量 `post` 必须显式命名
- 循环变量通过 `loop.index`（1-based）和 `loop.index0`（0-based）访问
- Pongo2 的 `{% for %}` 不支持 `{% else %}` 分支（与 Python Jinja2 不同），需手动用 `{% if %}` 处理空列表

### 1.7 Set 变量

```jinja2
{# 设置简单变量 #}
{% set pageTitle = "归档页面" %}
{% set showSidebar = true %}
{% set maxItems = 10 %}

{# 在模板中使用 #}
<h1>{{ pageTitle }}</h1>
{% if showSidebar %}
  {% include "partials/sidebar.html" %}
{% endif %}
```

**关键规则**：
- Pongo2 不支持用 `~` 拼接字符串，如 `{% set title = a ~ " | " ~ b %}` 会报错
- 需要拼接输出时直接在 `{{ }}` 中相邻输出：`{{ post.title }} | {{ config.siteName }}`
- `{% set %}` 的作用域是当前模板及其 include 的子模板

### 1.8 Filter 管道

```jinja2
{# 单个 filter #}
{{ post.title|upper }}

{# filter 链式调用 #}
{{ post.content|striptags|truncatechars:200 }}

{# filter 带参数 —— 用冒号，不用括号 #}
{{ post.content|truncatechars:100 }}
{{ post.content|default:"暂无内容" }}
{{ post.date|date:"2006-01-02" }}     {# 仅当 post.date 是 time.Time 类型时可用 #}

{# 多参数 filter（极少数 filter 支持）#}
{{ value|yesno:"是,否,未知" }}
```

**关键规则**：
- Filter 参数一律使用冒号 `:`，不可使用括号 `()`
  - ✅ `{{ value|default:"fallback" }}`
  - ❌ `{{ value|default("fallback") }}`
- Filter 可以链式调用，从左到右依次处理
- `|safe` 必须放在 filter 链最后，否则后续 filter 可能重新转义

---

## 2. Pongo2 vs 标准 Jinja2：12 个致命差异

以下是 Pongo2 与标准 Python Jinja2（以及 EJS、Nunjucks 等）的全部已知差异。每一条都配有错误写法和正确写法，**务必逐条检查**。

| # | 差异描述 | ❌ 错误写法 | ✅ 正确写法 |
|---|---------|-----------|-----------|
| 1 | **Filter 参数用冒号，不用括号** | `{{ value\|default("x") }}` | `{{ value\|default:"x" }}` |
| 2 | **不支持 Python 三元表达式** | `{{ post.title if post else '默认' }}` | `{% if post %}{{ post.title }}{% else %}默认{% endif %}` |
| 3 | **逻辑运算符用英文单词** | `{% if a && b %}` | `{% if a and b %}` |
| 4 | **不支持字符串拼接 ~** | `{% set t = a ~ " \| " ~ b %}` | 直接输出 `{{ a }} \| {{ b }}` |
| 5 | **长度用 \|length filter** | `{% if tags.length > 0 %}` | `{% if tags\|length > 0 %}` |
| 6 | **没有 is defined 测试** | `{% if x is defined %}` | `{% if x %}` |
| 7 | **否定包含的语序不同** | `{% if 'a' not in b %}` | `{% if not "a" in b %}` |
| 8 | **date filter 要求 time.Time 输入** | `{{ post.date\|date:"2006-01-02" }}` | `{{ post.date }}`（已是字符串时直接输出） |
| 9 | **不支持 macro / call** | `{% macro icon(name) %}...{% endmacro %}` | 用 `{% include "partials/icon.html" %}` 代替 |
| 10 | **标签内不可换行** | 见下方详细示例 | 所有 `{% %}` 和 `{{ }}` 保持单行 |
| 11 | **include 路径始终相对于 templates/ 根** | `{% include "header.html" %}` | `{% include "partials/header.html" %}` |
| 12 | **循环变量必须显式命名** | `{% for None in posts %}` | `{% for post in posts %}` |

### 差异详解

#### 差异 1：Filter 参数语法

Pongo2 的 filter 参数使用冒号 `:` 分隔，不使用括号。

```jinja2
{# ❌ 错误 —— 标准 Jinja2 语法，Pongo2 解析报错 #}
{{ value|default("fallback") }}
{{ value|truncate(100) }}
{{ items|join(", ") }}

{# ✅ 正确 —— Pongo2 语法 #}
{{ value|default:"fallback" }}
{{ value|truncatechars:100 }}
{{ items|join:", " }}
```

#### 差异 2：不支持三元表达式

Python Jinja2 支持 `a if condition else b` 行内表达式，Pongo2 不支持。

```jinja2
{# ❌ 错误 #}
<title>{{ post.title if post else config.siteName }}</title>

{# ✅ 正确 #}
<title>{% if post %}{{ post.title }}{% else %}{{ config.siteName }}{% endif %}</title>
```

#### 差异 3：逻辑运算符

```jinja2
{# ❌ 错误 —— JavaScript 风格 #}
{% if a && b %}
{% if a || b %}
{% if !a %}
{% if typeof x !== 'undefined' %}

{# ✅ 正确 —— Python 风格 #}
{% if a and b %}
{% if a or b %}
{% if not a %}
{% if x %}
```

#### 差异 4：字符串拼接

Pongo2 不支持 Jinja2 的 `~` 字符串拼接运算符。

```jinja2
{# ❌ 错误 #}
{% set fullTitle = post.title ~ " | " ~ config.siteName %}

{# ✅ 正确 —— 在输出时直接相邻排列 #}
<title>{{ post.title }} | {{ config.siteName }}</title>

{# ✅ 如果需要在 set 中组合，考虑分开处理 #}
{% set titlePart = post.title %}
{# 然后在需要的地方直接输出两个变量 #}
```

#### 差异 5：获取长度

```jinja2
{# ❌ 错误 —— JavaScript 风格属性访问 #}
{% if tags.length > 0 %}
{% if posts.length == 0 %}

{# ✅ 正确 —— 使用 filter #}
{% if tags|length > 0 %}
{% if posts|length == 0 %}
```

#### 差异 6：存在性检查

Pongo2 没有 `is defined` / `is undefined` 测试。直接使用变量名做真值判断。

```jinja2
{# ❌ 错误 #}
{% if commentSetting is defined %}
{% if post.cover is not none %}

{# ✅ 正确 #}
{% if commentSetting %}
{% if post.cover %}
```

#### 差异 7：否定包含

```jinja2
{# ❌ 错误 —— 标准 Python/Jinja2 语法 #}
{% if "about" not in post.link %}

{# ✅ 正确 —— Pongo2 要求 not 前置 #}
{% if not "about" in post.link %}
```

#### 差异 8：date filter 与 Go 时间格式

Pongo2 的 `date` filter 要求输入值必须是 Go 的 `time.Time` 类型。如果变量已经是格式化后的日期字符串，直接输出即可。

Go 的参考时间常量为 `Mon Jan 2 15:04:05 MST 2006`，即 `2006-01-02 15:04:05`。

```jinja2
{# ❌ 错误 —— post.date 已经是字符串，不能再用 date filter #}
{{ post.date|date:"2006-01-02" }}

{# ✅ 正确 —— 直接输出已格式化的字符串 #}
{{ post.date }}

{# ✅ 正确 —— now 是 time.Time 类型，可以用 date filter #}
{{ now|date:"2006" }}
{{ now|date:"2006-01-02" }}
{{ now|date:"01/02/2006" }}
{{ now|date:"15:04" }}
{{ now|date:"2006-01-02 15:04:05" }}
```

**Go 日期格式参照表**（与 strftime 完全不同！）：

| 含义 | Go 格式 | strftime 等价 | 示例 |
|------|---------|-------------|------|
| 四位年 | `2006` | `%Y` | 2025 |
| 两位月 | `01` | `%m` | 03 |
| 两位日 | `02` | `%d` | 09 |
| 24 小时 | `15` | `%H` | 14 |
| 分钟 | `04` | `%M` | 05 |
| 秒 | `05` | `%S` | 07 |
| 星期缩写 | `Mon` | `%a` | Tue |
| 星期全称 | `Monday` | `%A` | Tuesday |
| 月份缩写 | `Jan` | `%b` | Mar |
| 月份全称 | `January` | `%B` | March |

#### 差异 9：不支持 macro

Pongo2 不支持 `{% macro %}` 和 `{% call %}`。使用 `{% include %}` 配合上下文变量代替。

```jinja2
{# ❌ 错误 —— macro 语法不被支持 #}
{% macro renderCard(post) %}
  <div class="card">
    <h3>{{ post.title }}</h3>
  </div>
{% endmacro %}

{{ renderCard(post) }}

{# ✅ 正确 —— 使用 include 代替 #}
{# 在 partials/card.html 中编写卡片模板，直接使用上下文中的 post 变量 #}
{% for post in posts %}
  {% include "partials/card.html" %}
{% endfor %}
```

#### 差异 10：标签内不可换行

Pongo2 的词法解析器不允许在 `{% %}` 和 `{{ }}` 标签内部包含换行符。

```jinja2
{# ❌ 错误 —— 标签内换行 #}
{% if post.title
   and post.date
   and post.content %}

{# ✅ 正确 —— 保持单行 #}
{% if post.title and post.date and post.content %}
```

> **注意**：Gridea Pro 内置了 SanitizingLoader，会自动清理标签内的换行，但最佳实践仍然是保持单行，避免不必要的问题。

#### 差异 11：Include 路径规则

```jinja2
{# 假设当前文件位于 templates/partials/head.html #}

{# ❌ 错误 —— 相对于当前文件的路径 #}
{% include "global-seo.html" %}
{% include "./global-seo.html" %}
{% include "../partials/global-seo.html" %}

{# ✅ 正确 —— 始终相对于 templates/ 根目录 #}
{% include "partials/global-seo.html" %}
```

#### 差异 12：循环变量必须命名

```jinja2
{# ❌ 错误 —— 缺少循环变量名 #}
{% for in posts %}

{# ✅ 正确 #}
{% for post in posts %}
{% for tag in tags %}
{% for item in menuItems %}
```

---

## 3. 踩坑清单

### 🔴 致命错误（渲染直接失败，页面报错或空白）

#### 1. Filter 参数用了括号

```jinja2
{# ❌ 致命 —— Pongo2 解析直接报错 #}
{{ title|default("未命名") }}
{{ content|truncatechars(200) }}

{# ✅ 修复 #}
{{ title|default:"未命名" }}
{{ content|truncatechars:200 }}
```

#### 2. 在标签内换行

```jinja2
{# ❌ 致命 —— 词法解析失败 #}
{{
  post.title
}}
{% if condition1
   and condition2 %}

{# ✅ 修复 —— 单行书写 #}
{{ post.title }}
{% if condition1 and condition2 %}
```

#### 3. 使用了 macro / call

```jinja2
{# ❌ 致命 —— Pongo2 完全不支持 #}
{% macro badge(text, color) %}
  <span style="color:{{ color }}">{{ text }}</span>
{% endmacro %}

{# ✅ 修复 —— 改为 include 或直接内联 #}
{# partials/badge.html: #}
<span class="badge">{{ badgeText }}</span>

{# 使用时在循环或父模板中确保 badgeText 变量存在 #}
{% set badgeText = "置顶" %}
{% include "partials/badge.html" %}
```

#### 4. 对字符串使用 date filter

```jinja2
{# ❌ 致命 —— post.date 是字符串，date filter 需要 time.Time #}
{{ post.date|date:"2006-01-02" }}

{# ✅ 修复 —— 直接输出 #}
{{ post.date }}

{# ✅ 如果需要格式化，且变量确实是 time.Time 类型 #}
{{ now|date:"2006-01-02" }}
```

#### 5. include 路径错误

```jinja2
{# ❌ 致命 —— 文件找不到，渲染失败 #}
{% include "header.html" %}
{% include "./partials/header.html" %}

{# ✅ 修复 —— 相对于 templates/ 根 #}
{% include "partials/header.html" %}
```

#### 6. 循环变量未命名

```jinja2
{# ❌ 致命 —— 语法错误 #}
{% for in posts %}
{% for None in posts %}

{# ✅ 修复 #}
{% for post in posts %}
```

### 🟡 常见错误（渲染不报错，但输出不符合预期）

#### 7. 忘记 |safe 输出 HTML

```jinja2
{# ❌ 问题 —— HTML 标签被转义为文本显示 #}
<div class="content">{{ post.content }}</div>
{# 输出: &lt;p&gt;Hello&lt;/p&gt; #}

{# ✅ 修复 —— 富文本内容加 |safe #}
<div class="content">{{ post.content|safe }}</div>
{# 输出: <p>Hello</p> #}
```

#### 8. 日期格式写错（用了 strftime 而非 Go 格式）

```jinja2
{# ❌ 问题 —— strftime 格式在 Go 中无效 #}
{{ now|date:"%Y-%m-%d" }}
{{ now|date:"YYYY-MM-DD" }}

{# ✅ 修复 —— Go 参考时间格式 #}
{{ now|date:"2006-01-02" }}
```

#### 9. 使用 .length 而非 |length

```jinja2
{# ❌ 问题 —— .length 不是有效属性，返回空值 #}
{% if posts.length > 0 %}

{# ✅ 修复 #}
{% if posts|length > 0 %}
```

#### 10. 使用 && || 而非 and or

```jinja2
{# ❌ 问题 —— 可能解析错误或逻辑不正确 #}
{% if a && b %}
{% if a || b %}

{# ✅ 修复 #}
{% if a and b %}
{% if a or b %}
```

#### 11. 使用 not in 而非 not x in y

```jinja2
{# ❌ 问题 —— Pongo2 不识别 not in 复合运算符 #}
{% if "draft" not in post.status %}

{# ✅ 修复 #}
{% if not "draft" in post.status %}
```

#### 12. 使用 is defined 而非直接判断

```jinja2
{# ❌ 问题 —— is defined 不被支持 #}
{% if pagination is defined %}
{% if post.cover is not none %}

{# ✅ 修复 #}
{% if pagination %}
{% if post.cover %}
```

### 🟢 最佳实践

#### 13. 模板继承优于 include 嵌套

```jinja2
{# ✅ 推荐 —— 使用 extends + block 构建页面层级 #}
{# base.html 定义整体结构 #}
{# index.html extends base.html，覆写 content block #}
{# post.html extends base.html，覆写 content + title block #}

{# ❌ 避免 —— 纯 include 拼装导致结构混乱 #}
{% include "partials/html-head.html" %}
{% include "partials/header.html" %}
<main>...</main>
{% include "partials/footer.html" %}
{% include "partials/html-foot.html" %}
```

#### 14. 善用 Gridea Pro 自定义 Filter

```jinja2
{# 阅读时间 —— 自动支持中日韩文字 #}
<span>{{ post.content|reading_time }} 分钟阅读</span>

{# 摘要提取 #}
<p>{{ post.content|excerpt:150 }}</p>

{# 字数统计 #}
<span>{{ post.content|word_count }} 字</span>

{# 相对时间 #}
<time>{{ post.date|relative }}</time>

{# 分组 —— 按年份归档 #}
{% for group in posts|group_by:"year" %}
  <h2>{{ group.key }}</h2>
  {% for post in group.items %}
    <div>{{ post.title }}</div>
  {% endfor %}
{% endfor %}
```

#### 15. 变量空值防御

```jinja2
{# 对可能为空的变量添加 default filter #}
{{ post.description|default:"" }}
{{ post.cover|default:config.defaultCover }}
{{ config.customCSS|default:"" }}

{# 在条件判断中也要考虑空值 #}
{% if post.tags and post.tags|length > 0 %}
  {% for tag in post.tags %}
    <a href="{{ tag.link }}">{{ tag.name }}</a>
  {% endfor %}
{% endif %}
```

#### 16. 保持标签内容单行

```jinja2
{# ✅ 推荐 —— 即使条件很长也写在一行 #}
{% if post.title and post.date and post.content and not post.isDraft %}
  <article>...</article>
{% endif %}

{# ✅ 如果确实很长，考虑拆分为嵌套条件 #}
{% if post.title and post.date %}
  {% if post.content and not post.isDraft %}
    <article>...</article>
  {% endif %}
{% endif %}
```

#### 17. 有意义的 block 命名

```jinja2
{# ✅ 推荐 —— 语义化命名 #}
{% block page_title %}{% endblock %}
{% block meta_description %}{% endblock %}
{% block main_content %}{% endblock %}
{% block sidebar %}{% endblock %}
{% block page_scripts %}{% endblock %}

{# ❌ 避免 —— 无意义命名 #}
{% block a %}{% endblock %}
{% block content1 %}{% endblock %}
{% block stuff %}{% endblock %}
```

---

## 4. 常用模式代码

### 4.1 文章列表（带空状态处理）

```jinja2
<div class="post-list">
  {% if posts|length > 0 %}
    {% for post in posts %}
      <article class="post-item{% if loop.first %} post-item--first{% endif %}">
        {% if post.cover %}
          <div class="post-cover">
            <img src="{{ post.cover }}" alt="{{ post.title }}" loading="lazy">
          </div>
        {% endif %}
        <div class="post-info">
          <h2 class="post-title">
            <a href="{{ post.link }}">{{ post.title }}</a>
          </h2>
          <div class="post-meta">
            <time datetime="{{ post.date }}">{{ post.date }}</time>
            {% if post.tags|length > 0 %}
              <span class="post-tags">
                {% for tag in post.tags %}
                  <a href="{{ tag.link }}" class="tag">{{ tag.name }}</a>
                  {% if not loop.last %}<span class="sep">/</span>{% endif %}
                {% endfor %}
              </span>
            {% endif %}
          </div>
          <p class="post-excerpt">{{ post.content|excerpt:200 }}</p>
          <div class="post-footer">
            <span class="reading-time">{{ post.content|reading_time }} 分钟阅读</span>
          </div>
        </div>
      </article>
    {% endfor %}
  {% else %}
    <div class="empty-state">
      <p>暂无文章，请稍后再来！</p>
    </div>
  {% endif %}
</div>
```

### 4.2 分页导航

```jinja2
{% if pagination %}
  <nav class="pagination" aria-label="分页导航">
    {% if pagination.prev %}
      <a href="{{ pagination.prev }}" class="pagination-prev" rel="prev">
        &laquo; 上一页
      </a>
    {% else %}
      <span class="pagination-prev pagination-disabled">&laquo; 上一页</span>
    {% endif %}

    <span class="pagination-info">
      第 {{ pagination.current }} / {{ pagination.total }} 页
    </span>

    {% if pagination.next %}
      <a href="{{ pagination.next }}" class="pagination-next" rel="next">
        下一页 &raquo;
      </a>
    {% else %}
      <span class="pagination-next pagination-disabled">下一页 &raquo;</span>
    {% endif %}
  </nav>
{% endif %}
```

### 4.3 标签云

```jinja2
<div class="tag-cloud">
  <h3 class="tag-cloud-title">标签</h3>
  {% if tags|length > 0 %}
    <div class="tag-cloud-list">
      {% for tag in tags %}
        <a href="{{ tag.link }}" class="tag-cloud-item" title="{{ tag.name }} ({{ tag.count }} 篇)">
          {{ tag.name }}
          <span class="tag-count">({{ tag.count }})</span>
        </a>
      {% endfor %}
    </div>
  {% else %}
    <p class="tag-cloud-empty">暂无标签</p>
  {% endif %}
</div>
```

### 4.4 文章详情页（完整）

```jinja2
{% extends "base.html" %}

{% block title %}{{ post.title }} | {{ config.siteName }}{% endblock %}

{% block head %}
<meta name="description" content="{{ post.content|excerpt:160|striptags }}">
<meta property="og:title" content="{{ post.title }}">
<meta property="og:description" content="{{ post.content|excerpt:160|striptags }}">
{% if post.cover %}
<meta property="og:image" content="{{ post.cover }}">
{% endif %}
{% endblock %}

{% block content %}
<article class="post-detail">
  <header class="post-header">
    <h1 class="post-title">{{ post.title }}</h1>
    <div class="post-meta">
      <time datetime="{{ post.date }}">{{ post.date }}</time>
      <span class="word-count">{{ post.content|word_count }} 字</span>
      <span class="reading-time">约 {{ post.content|reading_time }} 分钟</span>
    </div>
    {% if post.tags|length > 0 %}
      <div class="post-tags">
        {% for tag in post.tags %}
          <a href="{{ tag.link }}" class="tag">{{ tag.name }}</a>
        {% endfor %}
      </div>
    {% endif %}
  </header>

  {% if post.cover %}
    <div class="post-cover">
      <img src="{{ post.cover }}" alt="{{ post.title }}">
    </div>
  {% endif %}

  <div class="post-content">
    {{ post.content|safe }}
  </div>

  <footer class="post-footer">
    <div class="post-nav">
      {% if post.prev %}
        <a href="{{ post.prev.link }}" class="post-nav-prev">
          &laquo; {{ post.prev.title }}
        </a>
      {% endif %}
      {% if post.next %}
        <a href="{{ post.next.link }}" class="post-nav-next">
          {{ post.next.title }} &raquo;
        </a>
      {% endif %}
    </div>
  </footer>

  {% if commentSetting %}
    <section class="post-comments">
      {% include "partials/comment.html" %}
    </section>
  {% endif %}
</article>
{% endblock %}
```

### 4.5 侧边栏 / 最新文章

```jinja2
<aside class="sidebar">
  {# 最新文章 #}
  {% if recentPosts|length > 0 %}
    <div class="widget widget-recent">
      <h3 class="widget-title">最新文章</h3>
      <ul class="recent-list">
        {% for post in recentPosts %}
          <li class="recent-item">
            <a href="{{ post.link }}">{{ post.title }}</a>
            <time>{{ post.date }}</time>
          </li>
        {% endfor %}
      </ul>
    </div>
  {% endif %}

  {# 标签 #}
  {% if tags|length > 0 %}
    <div class="widget widget-tags">
      <h3 class="widget-title">标签</h3>
      <div class="widget-tags-list">
        {% for tag in tags %}
          <a href="{{ tag.link }}" class="widget-tag">{{ tag.name }}</a>
        {% endfor %}
      </div>
    </div>
  {% endif %}

  {# 社交链接 #}
  {% if config.socialLinks %}
    <div class="widget widget-social">
      <h3 class="widget-title">关注我</h3>
      <div class="social-links">
        {% for link in config.socialLinks %}
          <a href="{{ link.url }}" target="_blank" rel="noopener noreferrer" title="{{ link.name }}">
            {{ link.name }}
          </a>
        {% endfor %}
      </div>
    </div>
  {% endif %}
</aside>
```

### 4.6 面包屑导航

```jinja2
<nav class="breadcrumb" aria-label="面包屑导航">
  <ol class="breadcrumb-list">
    <li class="breadcrumb-item">
      <a href="{{ config.siteUrl }}">首页</a>
    </li>
    {% if tag %}
      <li class="breadcrumb-item">
        <a href="{{ config.siteUrl }}/tags">标签</a>
      </li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">
        {{ tag.name }}
      </li>
    {% elif post %}
      <li class="breadcrumb-item">
        <a href="{{ config.siteUrl }}/archives">归档</a>
      </li>
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">
        {{ post.title|truncatechars:30 }}
      </li>
    {% elif pageTitle %}
      <li class="breadcrumb-item breadcrumb-current" aria-current="page">
        {{ pageTitle }}
      </li>
    {% endif %}
  </ol>
</nav>
```

### 4.7 暗色模式切换（JS + 模板配合）

```jinja2
{# partials/theme-toggle.html #}
<button id="theme-toggle" class="theme-toggle" aria-label="切换暗色模式">
  <span class="theme-toggle-icon" id="theme-icon">🌙</span>
</button>

<script>
(function() {
  var toggle = document.getElementById('theme-toggle');
  var icon = document.getElementById('theme-icon');
  var html = document.documentElement;

  // 读取用户偏好
  var saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.setAttribute('data-theme', 'dark');
    icon.textContent = '☀️';
  }

  toggle.addEventListener('click', function() {
    var isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      icon.textContent = '🌙';
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      icon.textContent = '☀️';
    }
  });
})();
</script>
```

对应的 CSS 变量方案（放在主题 CSS 中）：

```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --link-color: #0066cc;
}

[data-theme="dark"] {
  --bg-color: #1a1a2e;
  --text-color: #e0e0e0;
  --link-color: #64b5f6;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

### 4.8 条件加载资源（根据 theme_config）

```jinja2
{# 根据主题配置决定加载哪些资源 #}

{# 自定义字体 #}
{% if theme_config.customFont %}
  <link href="https://fonts.googleapis.com/css2?family={{ theme_config.customFont|urlencode }}&display=swap" rel="stylesheet">
{% endif %}

{# 代码高亮 #}
{% if theme_config.enableCodeHighlight %}
  <link rel="stylesheet" href="{{ config.themeBasePath }}/assets/prism.css">
{% endif %}

{# 自定义 CSS #}
{% if theme_config.customCSS %}
  <style>{{ theme_config.customCSS|safe }}</style>
{% endif %}

{# 图片灯箱 #}
{% if theme_config.enableLightbox %}
  <link rel="stylesheet" href="{{ config.themeBasePath }}/assets/lightbox.css">
  <script src="{{ config.themeBasePath }}/assets/lightbox.js" defer></script>
{% endif %}

{# 统计代码 #}
{% if theme_config.analyticsCode %}
  {{ theme_config.analyticsCode|safe }}
{% endif %}

{# 页脚自定义内容 #}
{% if config.footerInfo %}
  <div class="custom-footer">{{ config.footerInfo|safe }}</div>
{% endif %}
```

---

## 5. 从 EJS 迁移检查清单

将 EJS（或 Nunjucks）主题迁移到 Pongo2 时，逐行对照以下转换规则。

### 完整转换对照表

| EJS / Nunjucks 语法 | Pongo2 语法 | 说明 |
|---------------------|-------------|------|
| `<% code %>` | `{% code %}` | 执行语句 |
| `<%= value %>` | `{{ value }}` | 转义输出 |
| `<%- value %>` | `{{ value\|safe }}` | 原始 HTML 输出 |
| `include('./partials/x')` | `{% include "partials/x.html" %}` | 路径相对于 templates/ 根 |
| `a && b` | `a and b` | 逻辑与 |
| `a \|\| b` | `a or b` | 逻辑或 |
| `!a` | `not a` | 逻辑非 |
| `arr.length` | `arr\|length` | 数组长度 |
| `default("x")` | `default:"x"` | 默认值 filter 参数 |
| `truncate(100)` | `truncatechars:100` | 截断 filter 参数 |
| `a ? b : c` | `{% if a %}b{% else %}c{% endif %}` | 三元表达式 |
| `typeof x !== 'undefined'` | `{% if x %}` | 存在性检查 |
| `x not in y` | `not x in y` | 否定包含 |
| `arr.forEach(function(item){...})` | `{% for item in arr %}...{% endfor %}` | 遍历 |
| `for(var i=0; i<n; i++)` | `{% for i in range(n) %}` | 计数循环（Pongo2 需验证支持） |
| `str1 + ' ' + str2` | `{{ str1 }} {{ str2 }}` | 字符串拼接 |
| `JSON.stringify(data)` | `{{ data\|to_json }}` | JSON 序列化 |
| `item[0]`, `item[i]` | `{{ item.0 }}`（Pongo2 用点号索引） | 数组索引 |

### 逐步迁移流程

1. **文件重命名**：`.ejs` → `.html`
2. **替换定界符**：`<% %>` → `{% %}`，`<%= %>` → `{{ }}`，`<%- %>` → `{{ |safe }}`
3. **修改 include 路径**：统一为 `{% include "partials/xxx.html" %}` 格式
4. **修改逻辑运算符**：`&&` → `and`，`||` → `or`，`!` → `not`
5. **修改属性访问**：`.length` → `|length`
6. **修改 filter 参数**：`filter(arg)` → `filter:arg`
7. **消除三元表达式**：`a ? b : c` → `{% if a %}b{% else %}c{% endif %}`
8. **消除 typeof 检查**：`typeof x !== 'undefined'` → `{% if x %}`
9. **修改 not in**：`'a' not in b` → `not "a" in b`
10. **检查 date 使用**：确认输入类型，字符串直接输出
11. **消除 macro**：转为 include 组件
12. **检查换行**：确保所有 `{% %}` 和 `{{ }}` 内容在同一行
13. **逐页测试**：首页 → 文章页 → 归档页 → 标签页 → 自定义页

---

## 6. 完整 Filter 参考

### 6.1 Pongo2 内置 Filter

| Filter | 用法 | 描述 |
|--------|------|------|
| `safe` | `{{ html\|safe }}` | 标记为安全 HTML，不转义 |
| `default` | `{{ val\|default:"备选" }}` | 值为空时使用默认值 |
| `length` | `{{ arr\|length }}` | 返回数组/字符串长度 |
| `lower` | `{{ str\|lower }}` | 转为小写 |
| `upper` | `{{ str\|upper }}` | 转为大写 |
| `capfirst` | `{{ str\|capfirst }}` | 首字母大写 |
| `title` | `{{ str\|title }}` | 每个单词首字母大写 |
| `striptags` | `{{ html\|striptags }}` | 删除所有 HTML 标签 |
| `date` | `{{ time\|date:"2006-01-02" }}` | 格式化 time.Time（Go 格式） |
| `truncatechars` | `{{ str\|truncatechars:100 }}` | 按字符数截断 |
| `truncatewords` | `{{ str\|truncatewords:20 }}` | 按单词数截断 |
| `join` | `{{ arr\|join:", " }}` | 用分隔符连接数组 |
| `first` | `{{ arr\|first }}` | 取第一个元素 |
| `last` | `{{ arr\|last }}` | 取最后一个元素 |
| `random` | `{{ arr\|random }}` | 随机取一个元素 |
| `add` | `{{ num\|add:5 }}` | 加法运算 |
| `divisibleby` | `{{ num\|divisibleby:3 }}` | 是否能被整除 |
| `yesno` | `{{ val\|yesno:"是,否,未知" }}` | 布尔三值映射 |
| `floatformat` | `{{ num\|floatformat:2 }}` | 浮点数格式化 |
| `urlencode` | `{{ str\|urlencode }}` | URL 编码 |
| `linebreaks` | `{{ text\|linebreaks }}` | 换行转 `<p>` 和 `<br>` |
| `linebreaksbr` | `{{ text\|linebreaksbr }}` | 换行转 `<br>` |
| `escapejs` | `{{ str\|escapejs }}` | 转义 JavaScript 字符串 |
| `wordcount` | `{{ text\|wordcount }}` | 英文单词数 |
| `wordwrap` | `{{ text\|wordwrap:72 }}` | 按宽度自动换行 |
| `center` | `{{ str\|center:20 }}` | 居中对齐（补空格） |
| `ljust` | `{{ str\|ljust:20 }}` | 左对齐（补空格） |
| `rjust` | `{{ str\|rjust:20 }}` | 右对齐（补空格） |
| `cut` | `{{ str\|cut:" " }}` | 删除指定字符 |
| `pluralize` | `{{ count\|pluralize:"item,items" }}` | 英文复数形式 |
| `removetags` | `{{ html\|removetags:"script,style" }}` | 删除指定 HTML 标签 |
| `split` | `{{ str\|split:"," }}` | 按分隔符拆分为数组 |

**重要提醒**：
- 所有 filter 参数均使用冒号 `:` 传递
- `date` filter 只能用于 `time.Time` 类型，使用 Go 参考时间格式 `2006-01-02 15:04:05`
- `striptags` 和 `removetags` 功能不同：前者删除所有标签，后者仅删除指定标签
- `safe` 应放在 filter 链末尾

### 6.2 Gridea Pro 自定义 Filter

| Filter | 用法 | 描述 |
|--------|------|------|
| `reading_time` | `{{ post.content\|reading_time }}` | 估算阅读时间（分钟），自动识别中日韩文字，使用 CJK 阅读速度计算 |
| `excerpt` | `{{ post.content\|excerpt }}` | 提取文章摘要，默认长度 |
| `excerpt` | `{{ post.content\|excerpt:200 }}` | 提取文章摘要，指定字符数上限 |
| `word_count` | `{{ post.content\|word_count }}` | 统计字数，CJK 字符逐字计数，英文按单词计数 |
| `strip_html` | `{{ content\|strip_html }}` | 删除所有 HTML 标签，类似内置 striptags 但可能有细微差异 |
| `relative` | `{{ post.date\|relative }}` | 将日期转为相对时间描述，如"3天前"、"2小时前"、"刚刚" |
| `timeago` | `{{ post.date\|timeago }}` | 同 `relative`，别名 |
| `to_json` | `{{ data\|to_json }}` | 将数据序列化为 JSON 字符串，适用于传递数据给 JavaScript |
| `group_by` | `{{ posts\|group_by:"year" }}` | 按指定字段分组，返回 `[{key: "2025", items: [...]}]` 结构 |

#### 自定义 Filter 使用示例

**阅读时间与字数统计**：

```jinja2
<div class="post-meta">
  <span class="word-count">{{ post.content|word_count }} 字</span>
  <span class="sep">·</span>
  <span class="reading-time">约 {{ post.content|reading_time }} 分钟阅读</span>
</div>
```

**文章摘要提取**：

```jinja2
{# 默认长度摘要 #}
<p class="excerpt">{{ post.content|excerpt }}</p>

{# 指定长度摘要 #}
<p class="excerpt">{{ post.content|excerpt:150 }}</p>

{# 摘要 + 去除 HTML 标签（纯文本） #}
<meta name="description" content="{{ post.content|excerpt:160|strip_html }}">
```

**相对时间**：

```jinja2
{# 输出如"3天前"、"1小时前"、"刚刚" #}
<time>{{ post.date|relative }}</time>

{# timeago 是 relative 的别名，效果相同 #}
<time>{{ post.date|timeago }}</time>
```

**JSON 序列化（传数据给 JS）**：

```jinja2
<script>
  var siteConfig = {{ config|to_json|safe }};
  var postData = {{ post|to_json|safe }};
</script>
```

> **注意**：`to_json` 输出的是字符串，在 `<script>` 中使用时必须配合 `|safe`，否则引号会被转义。

**按年份分组归档**：

```jinja2
{% for group in posts|group_by:"year" %}
  <section class="archive-year">
    <h2 class="archive-year-title">{{ group.key }}</h2>
    <ul class="archive-list">
      {% for post in group.items %}
        <li class="archive-item">
          <time>{{ post.date }}</time>
          <a href="{{ post.link }}">{{ post.title }}</a>
        </li>
      {% endfor %}
    </ul>
  </section>
{% endfor %}
```

---

## 附录：快速排错指南

当模板渲染出错时，按以下顺序检查：

1. **页面完全空白 / 500 错误**
   - 检查 `{% extends %}` 是否是第一个标签
   - 检查所有 `{% include %}` 路径是否正确（相对于 templates/ 根）
   - 检查是否使用了 `{% macro %}`
   - 检查 `{% %}` 或 `{{ }}` 内是否有换行

2. **模板语法错误提示**
   - 检查 filter 参数是否用了括号而非冒号
   - 检查是否用了 `&&`、`||`、`!` 而非 `and`、`or`、`not`
   - 检查是否用了三元表达式 `a if cond else b`
   - 检查是否用了 `~` 字符串拼接
   - 检查是否用了 `is defined`

3. **内容显示异常**
   - HTML 被转义显示 → 缺少 `|safe`
   - 日期显示为空或报错 → 对字符串使用了 `|date` filter
   - 条件判断失效 → `.length` 应改为 `|length`
   - "not in" 判断不生效 → 应改为 `not x in y`

4. **通用调试技巧**
   - 逐步注释模板代码，二分法定位错误位置
   - 先确保基础 `base.html` 能正常渲染
   - 逐个添加 `{% include %}`，确认每个组件无误
   - 使用 `{{ variable|to_json|safe }}` 在页面上输出变量内容进行调试
