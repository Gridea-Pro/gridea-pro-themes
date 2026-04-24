# Gridea Pro Go Templates 主题开发指南

> 本指南面向使用 Go Templates 引擎开发 Gridea Pro 博客主题的开发者和 AI 助手。
> 涵盖完整语法、踩坑清单、常用模式和完整示例。

---

## 目录

1. [基础语法速查](#1-基础语法速查)
2. [Go Templates 核心概念](#2-go-templates-核心概念)
3. [踩坑清单](#3-踩坑清单)
4. [常用模式代码](#4-常用模式代码)
5. [内置函数参考](#5-内置函数参考)
6. [Gridea Pro 自定义函数/Filter](#6-gridea-pro-自定义函数filter)
7. [完整主题模板示例](#7-完整主题模板示例)
8. [从 Jinja2/EJS 迁移速查表](#8-从-jinja2ejs-迁移速查表)

---

## 1. 基础语法速查

### 1.1 变量输出

Go Templates 使用双花括号 `{{ }}` 包裹表达式。Gridea Pro 底层使用 Go 的 `html/template` 包，
默认对输出进行 HTML 转义。

```go-template
{{/* 基本变量输出（自动 HTML 转义） */}}
<h1>{{ .Config.SiteName }}</h1>
<p>{{ .Config.SiteDescription }}</p>
<img src="{{ .Config.Avatar }}" alt="头像">
<a href="{{ .Config.Domain }}">首页</a>
```

**关于 HTML 内容输出：**

Gridea Pro 中 `.Post.Content` 已被标记为 `template.HTML` 类型，不会被二次转义，
可以直接输出：

```go-template
{{/* 文章内容：已标记为安全 HTML，不会被转义 */}}
<article>{{ .Post.Content }}</article>
```

**重要提示：** Go Templates 中变量访问统一使用 **PascalCase**（大驼峰），例如：

| 变量路径 | 说明 |
|---|---|
| `.Config.Domain` | 站点域名 |
| `.Config.SiteName` | 站点名称 |
| `.Config.SiteDescription` | 站点描述 |
| `.Config.Avatar` | 头像地址 |
| `.Config.Logo` | Logo 地址 |
| `.ThemeConfig` | 主题自定义配置 |
| `.Posts` | 文章列表 |
| `.Post` | 当前文章（文章页） |
| `.Tags` | 所有标签 |
| `.Tag` / `.CurrentTag` | 当前标签（标签页） |
| `.Menus` | 导航菜单 |
| `.Memos` | 备忘录列表 |
| `.Pagination` | 分页信息 |
| `.Now` | 当前时间（Go time.Time） |

### 1.2 Actions 和 Pipelines

Go Templates 的核心是 **action**（`{{ }}` 内的指令）和 **pipeline**（管道串联）。

```go-template
{{/* 基本 action */}}
{{ .Config.SiteName }}

{{/* pipeline：用 | 将值传入函数 */}}
{{ .Post.Title | printf "文章: %s" }}

{{/* 多级管道 */}}
{{ .Post.Content | stripHTML | printf "摘要: %s" }}
```

### 1.3 条件判断 (if / else if / else)

Go Templates **支持** `else if` 语法。条件表达式中比较运算符是**函数形式**。

```go-template
{{/* 基本 if */}}
{{ if .Post.Feature }}
  <img src="{{ .Post.Feature }}" alt="特色图片">
{{ end }}

{{/* if-else */}}
{{ if .Posts }}
  <p>共有 {{ len .Posts }} 篇文章</p>
{{ else }}
  <p>暂无文章</p>
{{ end }}

{{/* if - else if - else */}}
{{ if eq .Post.Status "published" }}
  <span class="badge">已发布</span>
{{ else if eq .Post.Status "draft" }}
  <span class="badge badge-gray">草稿</span>
{{ else }}
  <span class="badge badge-yellow">未知状态</span>
{{ end }}

{{/* 比较运算符都是函数 */}}
{{ if gt (len .Posts) 0 }}有文章{{ end }}
{{ if ne .Tag.Name "" }}标签非空{{ end }}
{{ if le .Post.WordCount 100 }}短文{{ end }}
```

### 1.4 Range（循环）

`range` 用于遍历切片（slice）或映射（map）。**进入 range 后，`.` 变为当前元素。**

```go-template
{{/* 遍历文章列表 */}}
{{ range .Posts }}
  <article>
    <h2><a href="{{ .Link }}">{{ .Title }}</a></h2>
    <time>{{ .DateFormat }}</time>
    {{ if .Tags }}
      <div class="tags">
        {{ range .Tags }}
          <a href="{{ .Link }}">{{ .Name }}</a>
        {{ end }}
      </div>
    {{ end }}
  </article>
{{ end }}

{{/* 带 index 的遍历 */}}
{{ range $index, $post := .Posts }}
  <div class="post-item post-{{ $index }}">
    <h2>{{ $post.Title }}</h2>
  </div>
{{ end }}

{{/* range-else：空切片时的 fallback */}}
{{ range .Posts }}
  <article>{{ .Title }}</article>
{{ else }}
  <p>暂无文章</p>
{{ end }}
```

### 1.5 With（作用域切换）

`with` 将 `.` 重新绑定到指定值。如果值为空（零值），则不执行内部块。

```go-template
{{/* 缩短长路径 */}}
{{ with .Config }}
  <header>
    <h1>{{ .SiteName }}</h1>
    <p>{{ .SiteDescription }}</p>
    <img src="{{ .Logo }}" alt="Logo">
  </header>
{{ end }}

{{/* with-else：值为空时的 fallback */}}
{{ with .Post.Feature }}
  <img src="{{ . }}" alt="特色图片">
{{ else }}
  <img src="/images/default.jpg" alt="默认图片">
{{ end }}
```

### 1.6 Define 和 Template（组件包裹器模式）

🔴 **Go Templates 原生拒绝继承（Inheritance）**——没有 `extends`、没有 `block`、没有 `super()`。
从 Jinja2/EJS 迁移时必须彻底重构思维：每个页面文件（如 post.html）必须是一份**完整的 HTML 骨架片段组合**，
通过 `define` + `template` 实现「组件包裹器模式」：

```go-template
{{/* 每个页面都是完整骨架，不依赖继承 */}}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  {{ template "head" . }}  {{/* 🔴 末尾务必带 '.' 传递全局上下文 */}}
</head>
<body>
  {{ template "header" . }}
  <!-- 本页面独有内容 -->
  {{ template "footer" . }}
</body>
</html>
```

**组件定义（在 partials 文件中）：**

```go-template
{{/* 定义一个可复用的模板片段 */}}
{{ define "post-card" }}
<article class="post-card">
  <h2><a href="{{ .Link }}">{{ .Title }}</a></h2>
  <time>{{ .DateFormat }}</time>
  <p>{{ .Content | excerpt }}</p>
</article>
{{ end }}

{{/* 调用模板片段，必须传递上下文 */}}
{{ range .Posts }}
  {{ template "post-card" . }}
{{ end }}
```

### 1.7 变量 ($)

`$` 始终指向模板的顶层上下文（根数据）。自定义变量用 `:=` 声明。

```go-template
{{/* $ 访问顶层数据 */}}
{{ range .Posts }}
  {{/* 此处 . 是当前 post，用 $ 访问全局 */}}
  <p>{{ .Title }} — 来自 {{ $.Config.SiteName }}</p>
{{ end }}

{{/* 声明局部变量 */}}
{{ $title := .Config.SiteName }}
<title>{{ $title }}</title>

{{/* 在 range 中声明变量 */}}
{{ range $i, $tag := .Tags }}
  <span>{{ $i }}: {{ $tag.Name }} ({{ $tag.Count }})</span>
{{ end }}
```

### 1.8 函数与管道

函数调用语法为 `函数名 参数1 参数2 ...`，管道则将前一个值作为最后一个参数传入。

```go-template
{{/* 函数调用 */}}
{{ len .Posts }}
{{ printf "共 %d 篇文章" (len .Posts) }}

{{/* 管道：值作为最后一个参数 */}}
{{ .Post.Title | printf "标题: %s" }}
{{/* 等价于 */}}
{{ printf "标题: %s" .Post.Title }}

{{/* 多级管道 */}}
{{ .Post.Content | stripHTML | printf "%.100s..." }}
```

---

## 2. Go Templates 核心概念

### 2.1 Dot (.) 上下文

`.`（dot）是 Go Templates 最核心的概念。它代表**当前上下文对象**，随作用域而变化。

```go-template
{{/* 顶层：. 是整个数据对象 */}}
{{ .Config.SiteName }}

{{/* range 内部：. 变为当前遍历元素 */}}
{{ range .Posts }}
  {{ .Title }}        {{/* . 是当前 post */}}
  {{ $.Config.Domain }} {{/* $ 回到顶层 */}}
{{ end }}

{{/* with 内部：. 变为 with 的参数 */}}
{{ with .Post }}
  {{ .Title }}  {{/* . 是 .Post */}}
{{ end }}

{{/* template 调用：. 是你传入的参数 */}}
{{ template "header" . }}  {{/* 将当前 . 传给 header */}}
```

### 2.2 $ 全局变量

`$` 在任何嵌套层级中始终指向**模板接收到的原始数据**。这是避免作用域问题的关键。

```go-template
{{ range .Posts }}
  {{ range .Tags }}
    {{/* 此处 . 是 tag 对象 */}}
    {{/* 需要访问 config 只能用 $ */}}
    <a href="{{ $.Config.Domain }}{{ .Link }}">{{ .Name }}</a>
  {{ end }}
{{ end }}
```

### 2.3 管道 (Pipeline)

管道是 Go Templates 的函数式编程机制。管道将前一个命令的输出作为下一个命令的**最后一个参数**。

```go-template
{{/* 单级管道 */}}
{{ .Post.Date | date "2006-01-02" }}

{{/* 多级管道 */}}
{{ .Post.Content | stripHTML | wordCount }}

{{/* 管道结合条件 */}}
{{ if .Post.Content | wordCount | gt 1000 }}
  <span>长文</span>
{{ end }}
```

**注意管道的参数顺序：** 被管道传入的值是函数的**最后一个**参数。

```go-template
{{/* "hello" 会作为 printf 的最后一个参数 */}}
{{ "hello" | printf "说: %s" }}
{{/* 输出: 说: hello */}}
```

### 2.4 空白控制 ({{- -}})

在 `{{` 后加 `-` 或在 `}}` 前加 `-`，可以去除相邻的空白字符（包括换行符）。

```go-template
{{/* 不控制空白 — 输出会保留换行和缩进 */}}
{{ range .Posts }}
  <li>{{ .Title }}</li>
{{ end }}

{{/* 控制空白 — 去除标签周围多余空白 */}}
{{- range .Posts }}
  <li>{{- .Title -}}</li>
{{- end }}

{{/* 只去除左侧空白 */}}
<div>
  {{- .Config.SiteName }}
</div>
{{/* 输出: <div>站点名称\n</div> */}}
```

**警告：** 过度使用 `{{- -}}` 会导致 HTML 标签被挤压到一起，可能破坏页面布局。建议只在需要精确控制输出格式的地方使用。

---

## 3. 踩坑清单

### 🔴 致命错误（渲染直接失败 / panic）

#### 1. 变量作用域陷阱：range 内部 `.` 变化

进入 `range` 后，`.` 变为当前遍历元素，不再是顶层数据。要访问顶层数据必须使用 `$`。

```go-template
{{/* ❌ 错误：range 内 .Config 不存在，因为 . 已经是 post */}}
{{ range .Posts }}
  <h1>{{ .Config.SiteName }}</h1>
  <h2>{{ .Title }}</h2>
{{ end }}

{{/* ✅ 正确：使用 $ 访问顶层 */}}
{{ range .Posts }}
  <h1>{{ $.Config.SiteName }}</h1>
  <h2>{{ .Title }}</h2>
{{ end }}
```

#### 2. nil 值访问导致 panic

访问 nil 对象的属性会直接导致模板 panic 崩溃。对任何可能为空的变量都要先做判断。

```go-template
{{/* ❌ 危险：如果 .Post 为 nil，访问 .Post.Feature 会 panic */}}
<img src="{{ .Post.Feature }}">

{{/* ✅ 安全：先判断再访问 */}}
{{ if .Post }}
  {{ if .Post.Feature }}
    <img src="{{ .Post.Feature }}" alt="特色图片">
  {{ end }}
{{ end }}
```

#### 3. and/or 不短路求值

Go Templates 的 `and` 和 `or` 函数**不进行短路求值**。所有参数都会被求值，即使第一个条件已经为假。

```go-template
{{/* ❌ 危险：即使 .Post 是 nil，.Post.Feature 仍然会被求值 → panic */}}
{{ if and .Post .Post.Feature }}
  <img src="{{ .Post.Feature }}">
{{ end }}

{{/* ✅ 安全：使用嵌套 if */}}
{{ if .Post }}
  {{ if .Post.Feature }}
    <img src="{{ .Post.Feature }}">
  {{ end }}
{{ end }}
```

#### 4. 比较运算符是函数，不能用 == / != / < / >

Go Templates 不支持中缀运算符，所有比较必须使用函数形式。

```go-template
{{/* ❌ 语法错误：不支持 == 运算符 */}}
{{ if .Count == 0 }}
{{ if .Tag.Name != "" }}
{{ if .Post.WordCount > 500 }}

{{/* ✅ 正确：使用比较函数 */}}
{{ if eq .Count 0 }}
{{ if ne .Tag.Name "" }}
{{ if gt .Post.WordCount 500 }}
```

#### 5. template 调用忘记传递上下文

`{{ template "name" }}` 不传入任何数据，模板内部的 `.` 为 nil。

```go-template
{{/* ❌ 错误：header 模板内 . 为 nil，访问任何字段都会 panic */}}
{{ template "header" }}

{{/* ✅ 正确：传入当前上下文 */}}
{{ template "header" . }}

{{/* ✅ 也可以传入部分数据 */}}
{{ template "header" .Config }}
```

#### 6. define 必须在顶层

`define` 块不能嵌套在 `if`、`range` 等其他 action 内部。

```go-template
{{/* ❌ 错误：define 不能放在 if 里 */}}
{{ if .Config }}
  {{ define "header" }}
    <h1>{{ .SiteName }}</h1>
  {{ end }}
{{ end }}

{{/* ✅ 正确：define 放在顶层 */}}
{{ define "header" }}
  {{ if . }}
    <h1>{{ .SiteName }}</h1>
  {{ end }}
{{ end }}
```

#### 7. 对 map[string]interface{} 类型用点号访问

Gridea Pro 的 CustomConfig 底层是 `map[string]interface{}`，不是结构体。用点号访问会报错或返回空。

```go-template
{{/* ❌ 错误：点号只能访问结构体的导出字段，不能访问 map 键 */}}
{{ .Site.CustomConfig.showSearch }}
{{ .ThemeConfig.primaryColor }}

{{/* ✅ 正确：用 index 函数读取 map 键值 */}}
{{ index .Site.CustomConfig "showSearch" }}
{{ index .Site.CustomConfig "primaryColor" }}

{{/* ✅ 结合条件判断 */}}
{{ if notEmpty (index .Site.CustomConfig "showSearch") }}
  {{ template "search" . }}
{{ end }}
```

🔴 **Go Templates 引擎下，自定义配置的访问路径是 `.Site.CustomConfig`，需用 `index` 函数按键名取值。** 这与 Jinja2 引擎的 `theme_config.xxx` 点号访问方式完全不同。

#### 8. CustomConfig 中的 HTML/CSS 内容被自动转义

Go 的 `html/template` 安全机制极其严厉——所有字符串默认 HTML 转义。后台填写的富文本、自定义 CSS 会被转成文本。

```go-template
{{/* ❌ 错误：HTML 标签被转义成 &lt;p&gt; 等文本 */}}
{{ index .Site.CustomConfig "aboutContent" }}
{{ index .Site.CustomConfig "customCss" }}

{{/* ✅ 正确：用对应的 safe 函数解除转义 */}}
{{ safeHTML (index .Site.CustomConfig "aboutContent") }}
{{ safeCSS (index .Site.CustomConfig "customCss") }}

{{/* 注意：系统级字段如 .Post.Content 已标记为 template.HTML，无需额外处理 */}}
{{ .Post.Content }}  {{/* 直接输出即可，已是安全类型 */}}
```

### 🟡 常见错误（不会崩溃但结果不符合预期）

#### 9. range 空切片不渲染且无提示

如果 `.Posts` 是空切片，`range` 内部不会执行，也不会有任何输出。需要显式处理空状态。

```go-template
{{/* ❌ 问题：Posts 为空时页面空白，无任何提示 */}}
<div class="post-list">
  {{ range .Posts }}
    <article>{{ .Title }}</article>
  {{ end }}
</div>

{{/* ✅ 方案一：range-else */}}
<div class="post-list">
  {{ range .Posts }}
    <article>{{ .Title }}</article>
  {{ else }}
    <p class="empty">暂无文章，敬请期待</p>
  {{ end }}
</div>

{{/* ✅ 方案二：if + range */}}
{{ if .Posts }}
  <p>共 {{ len .Posts }} 篇文章</p>
  {{ range .Posts }}
    <article>{{ .Title }}</article>
  {{ end }}
{{ else }}
  <p class="empty">暂无文章</p>
{{ end }}
```

#### 10. 管道参数顺序反直觉

管道传入的值是函数的**最后一个参数**，不是第一个。

```go-template
{{/* "world" 作为 printf 的最后一个参数 */}}
{{ "world" | printf "hello %s" }}
{{/* 输出: hello world ✅ */}}

{{/* 注意区分：直接调用 vs 管道 */}}
{{ printf "hello %s" "world" }}  {{/* 直接调用 ✅ */}}
{{ "world" | printf "hello %s" }} {{/* 管道调用 ✅ 等价 */}}
```

#### 11. 字符串比较必须用 eq 函数

与其他语言不同，不能使用 `==` 进行字符串比较。

```go-template
{{/* ❌ 语法错误 */}}
{{ if .Tag.Name == "tech" }}

{{/* ✅ 正确 */}}
{{ if eq .Tag.Name "tech" }}
```

#### 12. 空白控制过度使用破坏布局

`{{- -}}` 会吞掉**所有**相邻空白字符，包括有意义的换行和缩进。

```go-template
{{/* ❌ 过度使用：所有内容挤成一行 */}}
<ul>
  {{- range .Menus -}}
    <li>{{- .Name -}}</li>
  {{- end -}}
</ul>
{{/* 输出: <ul><li>首页</li><li>归档</li><li>关于</li></ul> */}}

{{/* ✅ 适度使用：只在需要的地方控制 */}}
<ul>
  {{ range .Menus }}
    <li>{{ .Name }}</li>
  {{- end }}
</ul>
```

#### 13. 布尔值判断的零值问题

Go 的零值（空字符串 `""`、数字 `0`、nil、false、空切片）在 if 中都判定为 false。

```go-template
{{/* 数字 0 是假值 */}}
{{ if .Tag.Count }}
  {{/* Count 为 0 时不会进入这里 */}}
  标签文章数: {{ .Tag.Count }}
{{ end }}

{{/* 如果需要区分 0 和不存在 */}}
{{ if ge .Tag.Count 0 }}
  标签文章数: {{ .Tag.Count }}
{{ end }}
```

### 🟢 最佳实践

#### 14. 始终用 $ 访问全局数据（在 range 内部）

```go-template
{{ range .Posts }}
  {{/* 养成习惯：全局数据一律用 $ */}}
  <a href="{{ $.Config.Domain }}{{ .Link }}">{{ .Title }}</a>
{{ end }}
```

#### 15. 对可能为空的变量先 if 判断

```go-template
{{ if .Post.Feature }}
  <div class="hero" style="background-image: url('{{ .Post.Feature }}')"></div>
{{ end }}

{{ if .Post.Tags }}
  <div class="tags">
    {{ range .Post.Tags }}
      <a href="{{ .Link }}">#{{ .Name }}</a>
    {{ end }}
  </div>
{{ end }}
```

#### 16. 善用 with 缩短长路径

```go-template
{{/* ❌ 冗长 */}}
<h1>{{ .Config.SiteName }}</h1>
<p>{{ .Config.SiteDescription }}</p>
<img src="{{ .Config.Avatar }}">

{{/* ✅ 简洁 */}}
{{ with .Config }}
  <h1>{{ .SiteName }}</h1>
  <p>{{ .SiteDescription }}</p>
  <img src="{{ .Avatar }}">
{{ end }}
```

#### 17. 适度使用空白控制

只在需要精确控制的场景（如内联元素间距）使用 `{{- -}}`，不要全局滥用。

#### 18. IDE 内联模板变量导致 \<style\>/\<script\> 误报（碎尸打散法）

在 `<style>` 或 `<script>` 内使用模板变量注入时，VSCode/Monaco 的静态解析器会将 `{{` 当作非法 CSS/JS 语法报错。

```go-template
{{/* ❌ 功能正常但 IDE 疯狂报错："应为 @ 规则或选择器" */}}
<style>{{ safeCSS (index .Site.CustomConfig "customCss") }}</style>

{{/* ✅ 碎尸打散法：截断标签关键词，骗过 IDE 静态解析器 */}}
{{ safeHTML "<" }}style{{ safeHTML ">" }}
  {{ safeCSS (index .Site.CustomConfig "customCss") }}
{{ safeHTML "</" }}style{{ safeHTML ">" }}
```

原理：HTML 扫描器无法识别被打散的标签文本而放行，真实引擎编译时会完整拼接还原。适用于所有需要在 `<style>` 或 `<script>` 中注入模板变量的场景。

---

## 4. 常用模式代码

### 4.1 文章列表（带空状态和置顶）

```go-template
<main class="post-list">
  {{ range .Posts }}
    <article class="post-card{{ if .IsTop }} post-top{{ end }}{{ if .HideInList }} post-hidden{{ end }}">
      {{ if .IsTop }}
        <span class="pin-badge">置顶</span>
      {{ end }}
      {{ if .Feature }}
        <div class="post-cover">
          <a href="{{ .Link }}">
            <img src="{{ .Feature }}" alt="{{ .Title }}" loading="lazy">
          </a>
        </div>
      {{ end }}
      <div class="post-info">
        <h2 class="post-title">
          <a href="{{ .Link }}">{{ .Title }}</a>
        </h2>
        <div class="post-meta">
          <time datetime="{{ .Date }}">{{ .DateFormat }}</time>
          {{ if .Tags }}
            <span class="post-tags">
              {{ range .Tags }}
                <a href="{{ .Link }}" class="tag">#{{ .Name }}</a>
              {{ end }}
            </span>
          {{ end }}
        </div>
        {{ if .Content }}
          <p class="post-excerpt">{{ .Content | excerpt }}</p>
        {{ end }}
      </div>
    </article>
  {{ else }}
    <div class="empty-state">
      <p>暂无文章，敬请期待。</p>
    </div>
  {{ end }}
</main>
```

### 4.2 分页导航

```go-template
{{ if or .Pagination.Prev .Pagination.Next }}
  <nav class="pagination" role="navigation" aria-label="分页导航">
    {{ if .Pagination.Prev }}
      <a class="pagination-prev" href="{{ .Pagination.Prev }}" rel="prev">
        &larr; 上一页
      </a>
    {{ else }}
      <span class="pagination-prev disabled">&larr; 上一页</span>
    {{ end }}

    {{ if .Pagination.Next }}
      <a class="pagination-next" href="{{ .Pagination.Next }}" rel="next">
        下一页 &rarr;
      </a>
    {{ else }}
      <span class="pagination-next disabled">下一页 &rarr;</span>
    {{ end }}
  </nav>
{{ end }}
```

### 4.3 标签云

```go-template
{{ if .Tags }}
  <div class="tag-cloud">
    <h3>标签</h3>
    <div class="tag-list">
      {{ range .Tags }}
        <a href="{{ .Link }}" class="tag-item" title="{{ .Name }} ({{ .Count }} 篇)">
          {{ .Name }}
          <span class="tag-count">({{ .Count }})</span>
        </a>
      {{ end }}
    </div>
  </div>
{{ end }}
```

### 4.4 文章详情（完整）

```go-template
{{ if .Post }}
  <article class="post-detail">
    <header class="post-header">
      <h1 class="post-title">{{ .Post.Title }}</h1>
      <div class="post-meta">
        <time datetime="{{ .Post.Date }}">{{ .Post.DateFormat }}</time>
        {{ if .Post.Content }}
          <span class="reading-time">
            约 {{ .Post.Content | readingTime }} 分钟阅读
          </span>
          <span class="word-count">
            {{ .Post.Content | wordCount }} 字
          </span>
        {{ end }}
      </div>
      {{ if .Post.Tags }}
        <div class="post-tags">
          {{ range .Post.Tags }}
            <a href="{{ .Link }}" class="tag">#{{ .Name }}</a>
          {{ end }}
        </div>
      {{ end }}
    </header>

    {{ if .Post.Feature }}
      <div class="post-feature">
        <img src="{{ .Post.Feature }}" alt="{{ .Post.Title }}">
      </div>
    {{ end }}

    <div class="post-content markdown-body">
      {{ .Post.Content }}
    </div>

    <footer class="post-footer">
      <nav class="post-nav">
        {{ if .Pagination.Prev }}
          <a class="nav-prev" href="{{ .Pagination.Prev }}">
            &larr; 上一篇
          </a>
        {{ end }}
        {{ if .Pagination.Next }}
          <a class="nav-next" href="{{ .Pagination.Next }}">
            下一篇 &rarr;
          </a>
        {{ end }}
      </nav>
    </footer>
  </article>
{{ end }}
```

### 4.5 导航菜单（当前页高亮）

```go-template
<nav class="site-nav" role="navigation">
  <div class="nav-brand">
    {{ with .Config.Logo }}
      <a href="/">
        <img src="{{ . }}" alt="{{ $.Config.SiteName }}" class="nav-logo">
      </a>
    {{ else }}
      <a href="/" class="nav-title">{{ .Config.SiteName }}</a>
    {{ end }}
  </div>
  {{ if .Menus }}
    <ul class="nav-links">
      {{ range .Menus }}
        <li class="nav-item">
          <a href="{{ .Link }}" class="nav-link">
            {{ .Name }}
          </a>
        </li>
      {{ end }}
    </ul>
  {{ end }}
</nav>
```

### 4.6 条件加载（根据主题配置）

```go-template
{{/* 根据主题配置决定是否显示侧边栏 */}}
{{ with .ThemeConfig }}
  {{ if .ShowSidebar }}
    <aside class="sidebar">
      {{ if .SidebarBio }}
        <div class="sidebar-bio">
          {{ if $.Config.Avatar }}
            <img src="{{ $.Config.Avatar }}" alt="头像" class="sidebar-avatar">
          {{ end }}
          <p>{{ .SidebarBio }}</p>
        </div>
      {{ end }}
      {{ if .ShowTagCloud }}
        {{ if $.Tags }}
          <div class="sidebar-tags">
            <h4>标签</h4>
            {{ range $.Tags }}
              <a href="{{ .Link }}">{{ .Name }}</a>
            {{ end }}
          </div>
        {{ end }}
      {{ end }}
    </aside>
  {{ end }}
{{ end }}

{{/* 根据配置加载自定义 CSS */}}
{{ with .ThemeConfig.CustomCSS }}
  <style>{{ . }}</style>
{{ end }}

{{/* 根据配置加载 Google Analytics */}}
{{ with .ThemeConfig.GATrackingID }}
  <script async src="https://www.googletagmanager.com/gtag/js?id={{ . }}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{{ . }}');
  </script>
{{ end }}
```

---

## 5. 内置函数参考

Go Templates 提供以下内置函数：

| 函数 | 说明 | 示例 |
|---|---|---|
| `and` | 逻辑与（不短路） | `{{ if and .A .B }}` |
| `or` | 逻辑或（不短路） | `{{ if or .A .B }}` |
| `not` | 逻辑非 | `{{ if not .IsTop }}` |
| `len` | 长度 | `{{ len .Posts }}` |
| `index` | 索引访问 | `{{ index .Posts 0 }}` |
| `slice` | 切片 | `{{ slice .Posts 0 3 }}` |
| `print` | 等同 fmt.Sprint | `{{ print .A .B }}` |
| `printf` | 等同 fmt.Sprintf | `{{ printf "%d篇" (len .Posts) }}` |
| `println` | 等同 fmt.Sprintln | `{{ println .Title }}` |
| `html` | HTML 转义 | `{{ html .RawString }}` |
| `urlquery` | URL 编码 | `{{ urlquery .Tag.Name }}` |
| `js` | JS 字符串转义 | `{{ js .Title }}` |
| `call` | 调用函数值 | `{{ call .FuncField .Arg }}` |
| `eq` | 等于 | `{{ if eq .A "value" }}` |
| `ne` | 不等于 | `{{ if ne .Count 0 }}` |
| `lt` | 小于 | `{{ if lt .Count 10 }}` |
| `le` | 小于等于 | `{{ if le .Count 10 }}` |
| `gt` | 大于 | `{{ if gt .Count 0 }}` |
| `ge` | 大于等于 | `{{ if ge .Count 5 }}` |

**eq 的多值比较：** `eq` 可以接受多个参数，等价于 OR 比较：

```go-template
{{/* 等价于 .Status == "a" || .Status == "b" || .Status == "c" */}}
{{ if eq .Status "a" "b" "c" }}
  匹配到了其中一个值
{{ end }}
```

**index 访问嵌套结构：**

```go-template
{{/* 获取第一篇文章 */}}
{{ $first := index .Posts 0 }}
<h1>{{ $first.Title }}</h1>

{{/* 访问 map 类型的配置 */}}
{{ index .ThemeConfig "customField" }}
```

---

## 6. Gridea Pro 自定义函数/Filter

Gridea Pro 在内置函数基础上扩展了以下实用函数，以管道方式使用：

| 函数 | 说明 | 示例 |
|---|---|---|
| `readingTime` | 估算阅读时间（分钟） | `{{ .Post.Content \| readingTime }}` |
| `excerpt` | 提取文章摘要 | `{{ .Post.Content \| excerpt }}` |
| `wordCount` | 统计字数 | `{{ .Post.Content \| wordCount }}` |
| `stripHTML` | 去除 HTML 标签 | `{{ .Post.Content \| stripHTML }}` |
| `date` | 格式化时间 | `{{ .Now \| date "2006-01-02" }}` |
| `safeHTML` | 标记字符串为安全 HTML，不转义 | `{{ safeHTML (index .Site.CustomConfig "aboutContent") }}` |
| `safeCSS` | 标记字符串为安全 CSS | `{{ safeCSS (index .Site.CustomConfig "customCss") }}` |
| `safeJS` | 标记字符串为安全 JS | `{{ safeJS .SomeScript }}` |
| `empty` | 判断值是否为空（零值） | `{{ if empty (index .Site.CustomConfig "hero") }}` |
| `notEmpty` | 判断值是否非空 | `{{ if notEmpty (index .Site.CustomConfig "showSearch") }}` |
| `truncate` | 截断字符串到指定长度 | `{{ truncate 200 .Post.Excerpt }}` |

### date 函数详解

Go 语言使用特殊的参考时间 `2006-01-02 15:04:05` 作为格式模板（而非 `YYYY-MM-DD`）：

```go-template
{{/* Go 时间格式参考值: Mon Jan 2 15:04:05 MST 2006 */}}
{{ .Now | date "2006-01-02" }}           {{/* 输出: 2026-02-27 */}}
{{ .Now | date "2006年01月02日" }}        {{/* 输出: 2026年02月27日 */}}
{{ .Now | date "01/02/2006" }}           {{/* 输出: 02/27/2026 */}}
{{ .Now | date "2006-01-02 15:04:05" }}  {{/* 输出: 2026-02-27 14:30:00 */}}
{{ .Now | date "Jan 2, 2006" }}          {{/* 输出: Feb 27, 2026 */}}

{{/* 文章日期格式化 */}}
{{ .Post.Date | date "2006-01-02" }}
```

### 自定义函数使用示例

```go-template
{{/* 文章摘要卡片 */}}
<div class="post-summary">
  <h2>{{ .Post.Title }}</h2>
  <p class="excerpt">{{ .Post.Content | excerpt }}</p>
  <div class="meta">
    <span>{{ .Post.Content | wordCount }} 字</span>
    <span>约 {{ .Post.Content | readingTime }} 分钟阅读</span>
  </div>
</div>

{{/* 纯文本摘要用于 meta description */}}
<meta name="description" content="{{ .Post.Content | stripHTML | printf "%.150s" }}">
```

---

## 7. 完整主题模板示例

以下是一个最小但完整的 Go Templates 主题结构。由于 Go Templates 没有 `extends/block`
继承机制，我们使用 `define` + `template` 组合实现类似效果。

### 目录结构

```
my-theme/
├── config.json
├── templates/
│   ├── includes/
│   │   ├── header.html
│   │   └── footer.html
│   ├── index.html
│   ├── post.html
│   └── tag.html
└── assets/
    └── styles/
        └── main.css
```

### config.json

```json
{
  "name": "My Go Theme",
  "version": "1.0.0",
  "engine": "go",
  "author": "Your Name",
  "customConfig": [
    {
      "name": "ShowSidebar",
      "label": "显示侧边栏",
      "type": "toggle",
      "value": true
    },
    {
      "name": "FooterText",
      "label": "页脚文字",
      "type": "input",
      "value": "Powered by Gridea Pro"
    },
    {
      "name": "GATrackingID",
      "label": "Google Analytics ID",
      "type": "input",
      "value": ""
    }
  ]
}
```

### includes/header.html

```go-template
{{ define "header" }}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ template "title" . }}</title>
  <meta name="description" content="{{ .Config.SiteDescription }}">
  <link rel="stylesheet" href="/assets/styles/main.css">
  {{ with .ThemeConfig.GATrackingID }}
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ . }}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '{{ . }}');
    </script>
  {{ end }}
</head>
<body>
  <header class="site-header">
    <div class="container">
      <div class="header-inner">
        {{ if .Config.Logo }}
          <a href="/" class="site-logo">
            <img src="{{ .Config.Logo }}" alt="{{ .Config.SiteName }}">
          </a>
        {{ else }}
          <a href="/" class="site-title">{{ .Config.SiteName }}</a>
        {{ end }}
        {{ if .Menus }}
          <nav class="site-nav">
            <ul>
              {{ range .Menus }}
                <li><a href="{{ .Link }}">{{ .Name }}</a></li>
              {{ end }}
            </ul>
          </nav>
        {{ end }}
      </div>
    </div>
  </header>
  <main class="site-main">
    <div class="container">
{{ end }}
```

### includes/footer.html

```go-template
{{ define "footer" }}
    </div>
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>{{ .ThemeConfig.FooterText }}</p>
      <p>&copy; {{ .Now | date "2006" }} {{ .Config.SiteName }}</p>
    </div>
  </footer>
</body>
</html>
{{ end }}
```

### index.html（首页 / 文章列表页）

```go-template
{{ define "title" }}{{ .Config.SiteName }} - {{ .Config.SiteDescription }}{{ end }}

{{ template "header" . }}

<section class="post-list">
  {{ range .Posts }}
    {{ if not .HideInList }}
      <article class="post-card{{ if .IsTop }} is-top{{ end }}">
        {{ if .IsTop }}
          <span class="top-badge">置顶</span>
        {{ end }}
        {{ if .Feature }}
          <a href="{{ .Link }}" class="post-cover">
            <img src="{{ .Feature }}" alt="{{ .Title }}" loading="lazy">
          </a>
        {{ end }}
        <div class="post-body">
          <h2 class="post-title">
            <a href="{{ .Link }}">{{ .Title }}</a>
          </h2>
          <div class="post-meta">
            <time datetime="{{ .Date }}">{{ .DateFormat }}</time>
            {{ if .Tags }}
              {{ range .Tags }}
                <a href="{{ .Link }}" class="tag">#{{ .Name }}</a>
              {{ end }}
            {{ end }}
          </div>
          {{ if .Content }}
            <p class="post-excerpt">{{ .Content | excerpt }}</p>
          {{ end }}
        </div>
      </article>
    {{ end }}
  {{ else }}
    <div class="empty-state">
      <h2>暂无文章</h2>
      <p>博主还没有发布任何文章，请稍后再来。</p>
    </div>
  {{ end }}
</section>

{{ if or .Pagination.Prev .Pagination.Next }}
  <nav class="pagination">
    {{ if .Pagination.Prev }}
      <a href="{{ .Pagination.Prev }}" class="page-prev">&larr; 上一页</a>
    {{ end }}
    {{ if .Pagination.Next }}
      <a href="{{ .Pagination.Next }}" class="page-next">下一页 &rarr;</a>
    {{ end }}
  </nav>
{{ end }}

{{ template "footer" . }}
```

### post.html（文章详情页）

```go-template
{{ define "title" }}{{ .Post.Title }} - {{ .Config.SiteName }}{{ end }}

{{ template "header" . }}

{{ if .Post }}
  <article class="post-detail">
    <header class="post-header">
      <h1>{{ .Post.Title }}</h1>
      <div class="post-meta">
        <time datetime="{{ .Post.Date }}">{{ .Post.DateFormat }}</time>
        {{ if .Post.Content }}
          <span class="word-count">{{ .Post.Content | wordCount }} 字</span>
          <span class="read-time">约 {{ .Post.Content | readingTime }} 分钟</span>
        {{ end }}
      </div>
      {{ if .Post.Tags }}
        <div class="post-tags">
          {{ range .Post.Tags }}
            <a href="{{ .Link }}" class="tag">#{{ .Name }}</a>
          {{ end }}
        </div>
      {{ end }}
    </header>

    {{ if .Post.Feature }}
      <figure class="post-feature">
        <img src="{{ .Post.Feature }}" alt="{{ .Post.Title }}">
      </figure>
    {{ end }}

    <div class="post-content markdown-body">
      {{ .Post.Content }}
    </div>

    <footer class="post-footer">
      <nav class="post-nav">
        {{ if .Pagination.Prev }}
          <a href="{{ .Pagination.Prev }}" class="nav-prev">&larr; 上一篇</a>
        {{ end }}
        {{ if .Pagination.Next }}
          <a href="{{ .Pagination.Next }}" class="nav-next">下一篇 &rarr;</a>
        {{ end }}
      </nav>
    </footer>
  </article>
{{ end }}

{{ template "footer" . }}
```

### tag.html（标签页）

```go-template
{{ define "title" }}
  {{- if .CurrentTag -}}
    标签: {{ .CurrentTag.Name }} - {{ .Config.SiteName }}
  {{- else -}}
    所有标签 - {{ .Config.SiteName }}
  {{- end -}}
{{ end }}

{{ template "header" . }}

{{ if .CurrentTag }}
  <section class="tag-page">
    <h1 class="tag-heading">
      标签: <span class="tag-name">{{ .CurrentTag.Name }}</span>
      <span class="tag-count">({{ .CurrentTag.Count }} 篇)</span>
    </h1>
    {{ range .Posts }}
      <article class="post-card">
        <h2 class="post-title">
          <a href="{{ .Link }}">{{ .Title }}</a>
        </h2>
        <time datetime="{{ .Date }}">{{ .DateFormat }}</time>
      </article>
    {{ else }}
      <p>该标签下暂无文章。</p>
    {{ end }}
  </section>
{{ else }}
  <section class="all-tags">
    <h1>所有标签</h1>
    {{ range .Tags }}
      <a href="{{ .Link }}" class="tag-item">
        {{ .Name }} <span>({{ .Count }})</span>
      </a>
    {{ else }}
      <p>暂无标签。</p>
    {{ end }}
  </section>
{{ end }}

{{ if or .Pagination.Prev .Pagination.Next }}
  <nav class="pagination">
    {{ if .Pagination.Prev }}
      <a href="{{ .Pagination.Prev }}">&larr; 上一页</a>
    {{ end }}
    {{ if .Pagination.Next }}
      <a href="{{ .Pagination.Next }}">下一页 &rarr;</a>
    {{ end }}
  </nav>
{{ end }}

{{ template "footer" . }}
```

---

## 8. 从 Jinja2/EJS 迁移速查表

从其他引擎迁移到 Go Templates 时，以下对照表覆盖最常见的语法转换：

### 模板结构

| 操作 | Jinja2 / EJS | Go Templates |
|------|-------------|--------------|
| 模板继承 | `{% extends "base.html" %}` | 🔴 不支持。每页写完整骨架 + `{{ template "head" . }}` |
| 内容块 | `{% block content %}...{% endblock %}` | 🔴 不支持。用 `{{ define "xxx" }}...{{ end }}` 代替 |
| 包含组件 | `{% include "partials/header.html" %}` | `{{ template "header" . }}` 🔴 末尾必须带 `.` |
| 变量输出 | `{{ post.title }}` | `{{ .Post.Title }}` 🔴 PascalCase |
| 配置访问 | `{{ theme_config.primaryColor }}` | `{{ index .Site.CustomConfig "primaryColor" }}` 🔴 用 index |

### 循环与条件

| 操作 | Jinja2 / EJS | Go Templates |
|------|-------------|--------------|
| 循环 | `{% for post in posts %}` | `{{ range .Posts }}` 🔴 `.` 变为当前元素 |
| 循环+索引 | `{{ forloop.Counter0 }}` | `{{ range $i, $post := .Posts }}` 用 `$i` |
| 空判断 | `{% if not posts %}` | `{{ if not .Posts }}` 或 `{{ if empty ... }}` |
| 管道过滤 | `{{ post.excerpt\|truncatechars:200 }}` | `{{ truncate 200 .Post.Excerpt }}` 🔴 函数前置 |
| HTML 输出 | `{{ post.content\|safe }}` | `{{ .Post.Content }}` (已标记安全) 或 `{{ safeHTML .Var }}` |
| 字符串比较 | `{% if tag.name == "tech" %}` | `{{ if eq .Tag.Name "tech" }}` 🔴 函数式比较 |
| 长度 | `{{ posts\|length }}` | `{{ len .Posts }}` |

### 数据安全

| 场景 | 处理方式 |
|------|---------|
| 系统字段（.Post.Content） | 直接输出，已标记 `template.HTML` |
| CustomConfig 中的 HTML | `{{ safeHTML (index .Site.CustomConfig "xxx") }}` |
| CustomConfig 中的 CSS | `{{ safeCSS (index .Site.CustomConfig "customCss") }}` |
| 普通字符串 | 自动转义，无需处理 |

---

> **提示：** Go Templates 语法严格，任何拼写错误（如字段名大小写不对）都会导致渲染失败。
> 开发时务必结合 Gridea Pro 的预览功能实时调试。
