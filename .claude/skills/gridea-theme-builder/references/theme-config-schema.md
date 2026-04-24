# Gridea Pro 主题配置声明规范 (config.json)

> 本文件描述主题 config.json 的完整格式、字段类型和最佳实践。Gridea Pro 根据此文件自动生成 GUI 设置面板，用户无需编写代码即可配置主题。

## 目录

1. [为什么 config.json 重要](#为什么-configjson-重要)
2. [config.json 完整格式](#configjson-完整格式)
3. [字段详解](#字段详解)
4. [支持的配置类型](#支持的配置类型)
5. [分组 (group) 机制](#分组-group-机制)
6. [在模板中访问配置值](#在模板中访问配置值)
7. [完整示例](#完整示例)
8. [最佳实践](#最佳实践)

---

## 为什么 config.json 重要

config.json 是主题与 Gridea Pro 之间的契约：

1. **主题识别**：Gridea Pro 通过此文件识别有效主题，无此文件则不加载
2. **GUI 面板生成**：`customConfig` 数组中的每一项自动渲染为设置面板中的表单控件（输入框、颜色选择器、开关等）
3. **模板变量注入**：用户在 GUI 中设置的值通过 `theme_config.xxx` 注入到模板中
4. **引擎声明**：`templateEngine` 字段决定使用哪个模板引擎渲染

---

## config.json 完整格式

```json
{
  "name": "主题英文名",
  "version": "1.0.0",
  "author": "作者名",
  "description": "主题简短描述",
  "templateEngine": "jinja2",
  "customConfig": [
    {
      "name": "字段标识符",
      "label": "GUI 中显示的标签",
      "group": "所属分组名",
      "type": "字段类型",
      "value": "默认值",
      "note": "帮助说明文字（可选）",
      "options": []
    }
  ]
}
```

---

## 字段详解

### 顶层字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 主题唯一标识符，使用英文短横线命名（如 `"my-theme"`） |
| `version` | string | 推荐 | 语义化版本号（如 `"1.0.0"`） |
| `author` | string | 推荐 | 作者名称 |
| `description` | string | 推荐 | 主题简短描述，显示在主题选择界面 |
| `templateEngine` | string | 推荐 | 模板引擎标识：`"jinja2"`、`"go"`、`"ejs"`。未声明时默认 `"ejs"` |
| `customConfig` | array | 否 | 自定义配置项数组，每项生成一个 GUI 控件 |

### customConfig 子项字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 字段标识符。在模板中通过 `theme_config.<name>` 访问。**必须唯一，使用 camelCase** |
| `label` | string | 是 | GUI 面板中显示的标签文字 |
| `group` | string | 否 | 分组名称，相同 group 的配置项在 GUI 中归入同一折叠面板 |
| `type` | string | 是 | 配置类型（决定渲染什么 GUI 控件），见下方类型表 |
| `value` | varies | 是 | 默认值，类型随 `type` 变化 |
| `note` | string | 否 | 帮助文字，显示在控件下方，引导用户填写 |
| `options` | array | 条件 | 仅 `select` 类型必需。下拉选项列表 |

---

## 支持的配置类型

| type 值 | 渲染的 GUI 控件 | 值类型 | 额外字段 | 说明 |
|---------|-----------------|--------|----------|------|
| `input` | 单行文本输入框 | string | — | 适用于短文本：标题、链接、名称等 |
| `textarea` | 多行文本域 | string | — | 适用于长文本：自定义 CSS、JS 代码片段、描述等 |
| `color` | 颜色选择器 | string | — | 值为十六进制颜色码，如 `"#3366ff"` |
| `boolean` | 开关（Switch） | boolean | — | 值为 `true` 或 `false` |
| `number` | 数字输入框 | number | — | 值为数字 |
| `select` | 下拉选择框 | string | `options` 必需 | `options` 为 `[{"label":"显示名","value":"实际值"}]` 数组 |
| `image` | 图片上传控件 | string | — | 值为图片路径字符串 |
| `code` | 代码编辑器 | string | — | 适用于自定义 CSS/JS/HTML 代码注入 |
| `array` | 可增删的列表 | array | — | 值为数组，适用于社交链接等重复项 |

### 各类型详细示例

#### input — 单行文本

```json
{
  "name": "subtitle",
  "label": "副标题",
  "group": "基础设置",
  "type": "input",
  "value": "",
  "note": "显示在站点名称下方的一句话"
}
```

#### textarea — 多行文本

```json
{
  "name": "customCss",
  "label": "自定义 CSS",
  "group": "高级设置",
  "type": "textarea",
  "value": "",
  "note": "在此处添加自定义 CSS 样式代码"
}
```

#### color — 颜色选择器

```json
{
  "name": "primaryColor",
  "label": "主题色",
  "group": "外观设置",
  "type": "color",
  "value": "#3366ff",
  "note": "链接、按钮等元素的主要颜色"
}
```

#### boolean — 开关

```json
{
  "name": "showSidebar",
  "label": "显示侧边栏",
  "group": "布局设置",
  "type": "boolean",
  "value": true,
  "note": "关闭后首页将采用全宽布局"
}
```

#### number — 数字

```json
{
  "name": "postsPerPage",
  "label": "每页文章数",
  "group": "基础设置",
  "type": "number",
  "value": 10,
  "note": "首页和博客列表页每页显示的文章数量"
}
```

#### select — 下拉选择

```json
{
  "name": "headerStyle",
  "label": "顶栏样式",
  "group": "布局设置",
  "type": "select",
  "value": "fixed",
  "options": [
    { "label": "固定顶部", "value": "fixed" },
    { "label": "跟随滚动", "value": "static" },
    { "label": "隐藏", "value": "hidden" }
  ],
  "note": "选择页面顶栏的显示方式"
}
```

#### image — 图片上传

```json
{
  "name": "bannerImage",
  "label": "首页横幅图",
  "group": "外观设置",
  "type": "image",
  "value": "",
  "note": "推荐尺寸 1920×600"
}
```

#### code — 代码编辑器

```json
{
  "name": "headerScript",
  "label": "头部注入代码",
  "group": "高级设置",
  "type": "code",
  "value": "",
  "note": "将在 </head> 标签前注入，可用于添加统计代码、自定义 meta 标签等"
}
```

#### array — 列表

```json
{
  "name": "socialLinks",
  "label": "社交链接",
  "group": "社交设置",
  "type": "array",
  "value": [],
  "note": "添加社交媒体链接，每项包含平台名称和链接地址"
}
```

---

## 分组 (group) 机制

`group` 字段将配置项归入同一折叠面板，让 GUI 设置界面更有组织性。

### 工作原理

- 相同 `group` 值的配置项自动归入同一面板
- 面板标题即 `group` 值
- 面板按配置项出现的先后顺序排列
- 未设置 `group` 的配置项归入默认分组

### 推荐分组方案

| 分组名 | 包含内容 |
|--------|----------|
| 基础设置 | 副标题、每页文章数、日期格式 |
| 外观设置 | 主题色、强调色、背景色、字体、横幅图 |
| 布局设置 | 侧边栏开关、顶栏样式、列表布局、内容宽度 |
| 社交设置 | 社交链接、GitHub 用户名 |
| 高级设置 | 自定义 CSS、头部注入代码、底部注入代码 |

---

## 在模板中访问配置值

customConfig 中定义的配置项通过 `theme_config` 对象访问，`name` 字段即为键名。

### Jinja2 (Pongo2)

```jinja2
{# 访问主题色 #}
<style>
  :root {
    --primary-color: {{ theme_config.primaryColor }};
  }
</style>

{# 条件判断布尔值 #}
{% if theme_config.showSidebar %}
  {% include "partials/sidebar.html" %}
{% endif %}

{# 输出代码注入 #}
{{ theme_config.headerScript|safe }}

{# 带默认值 #}
{{ theme_config.subtitle|default:"" }}
```

### Go Templates

```go
{{/* 访问主题色 */}}
<style>
  :root {
    --primary-color: {{ .ThemeConfig.primaryColor }};
  }
</style>

{{/* 条件判断布尔值 */}}
{{ if .ThemeConfig.showSidebar }}
  {{ template "partials/sidebar.html" . }}
{{ end }}

{{/* 输出代码注入 */}}
{{ .ThemeConfig.headerScript }}
```

### EJS

```ejs
<!-- 访问主题色 -->
<style>
  :root {
    --primary-color: <%= theme_config.primaryColor %>;
  }
</style>

<!-- 条件判断布尔值 -->
<% if (theme_config.showSidebar) { %>
  <%- include('partials/sidebar') %>
<% } %>

<!-- 输出代码注入 -->
<%- theme_config.headerScript %>
```

### 重要区分

| 访问对象 | Jinja2 | Go Templates | EJS |
|----------|--------|--------------|-----|
| 站点名称 | `config.siteName` | `.Config.SiteName` | `config.siteName` |
| 站点域名 | `config.domain` | `.Config.Domain` | `config.domain` |
| 主题色（自定义） | `theme_config.primaryColor` | `.ThemeConfig.primaryColor` | `theme_config.primaryColor` |
| 侧边栏开关（自定义） | `theme_config.showSidebar` | `.ThemeConfig.showSidebar` | `theme_config.showSidebar` |

**核心规则**：`config` 是 Gridea Pro 内置的站点级配置，`theme_config` 是主题开发者通过 customConfig 自定义的配置。两者是不同的对象，切勿混用。

---

## 完整示例

以下是一个功能较完整的主题 config.json 示例：

```json
{
  "name": "aurora-theme",
  "version": "2.1.0",
  "author": "Theme Dev",
  "description": "极光主题 —— 简约优雅的 Gridea Pro 博客主题",
  "templateEngine": "jinja2",
  "customConfig": [
    {
      "name": "subtitle",
      "label": "副标题",
      "group": "基础设置",
      "type": "input",
      "value": "一个热爱技术的博客",
      "note": "显示在站点名称下方"
    },
    {
      "name": "postsPerPage",
      "label": "每页文章数",
      "group": "基础设置",
      "type": "number",
      "value": 10,
      "note": "建议 5-20 之间"
    },
    {
      "name": "dateFormat",
      "label": "日期显示格式",
      "group": "基础设置",
      "type": "select",
      "value": "YYYY-MM-DD",
      "options": [
        { "label": "2026-02-27", "value": "YYYY-MM-DD" },
        { "label": "02/27/2026", "value": "MM/DD/YYYY" },
        { "label": "2026年2月27日", "value": "YYYY年M月D日" }
      ]
    },
    {
      "name": "primaryColor",
      "label": "主题色",
      "group": "外观设置",
      "type": "color",
      "value": "#6366f1",
      "note": "链接、按钮、选中态等元素的颜色"
    },
    {
      "name": "accentColor",
      "label": "强调色",
      "group": "外观设置",
      "type": "color",
      "value": "#f59e0b",
      "note": "标签、徽标等醒目元素的颜色"
    },
    {
      "name": "bannerImage",
      "label": "首页横幅图",
      "group": "外观设置",
      "type": "image",
      "value": "",
      "note": "留空则不显示横幅。推荐尺寸 1920×600"
    },
    {
      "name": "showSidebar",
      "label": "显示侧边栏",
      "group": "布局设置",
      "type": "boolean",
      "value": true,
      "note": "关闭后页面采用单栏全宽布局"
    },
    {
      "name": "headerStyle",
      "label": "顶栏样式",
      "group": "布局设置",
      "type": "select",
      "value": "fixed",
      "options": [
        { "label": "固定顶部", "value": "fixed" },
        { "label": "跟随滚动", "value": "static" },
        { "label": "透明悬浮", "value": "transparent" }
      ]
    },
    {
      "name": "contentWidth",
      "label": "内容区最大宽度",
      "group": "布局设置",
      "type": "select",
      "value": "800",
      "options": [
        { "label": "窄 (680px)", "value": "680" },
        { "label": "标准 (800px)", "value": "800" },
        { "label": "宽 (960px)", "value": "960" }
      ]
    },
    {
      "name": "githubUsername",
      "label": "GitHub 用户名",
      "group": "社交设置",
      "type": "input",
      "value": "",
      "note": "填写后在页脚显示 GitHub 图标链接"
    },
    {
      "name": "twitterUsername",
      "label": "Twitter / X 用户名",
      "group": "社交设置",
      "type": "input",
      "value": "",
      "note": "不含 @ 符号"
    },
    {
      "name": "customCss",
      "label": "自定义 CSS",
      "group": "高级设置",
      "type": "textarea",
      "value": "",
      "note": "此处的 CSS 会追加到主题样式末尾，可覆盖默认样式"
    },
    {
      "name": "headerScript",
      "label": "头部注入代码",
      "group": "高级设置",
      "type": "code",
      "value": "",
      "note": "在 </head> 前注入。可添加统计代码（Google Analytics、百度统计等）"
    },
    {
      "name": "footerScript",
      "label": "底部注入代码",
      "group": "高级设置",
      "type": "code",
      "value": "",
      "note": "在 </body> 前注入。可添加评论系统、客服组件等"
    }
  ]
}
```

---

## 最佳实践

### 1. 为每个配置项提供合理默认值

用户安装主题后应该开箱即用。所有 `value` 字段设置好默认值，确保即使用户不做任何修改，主题也能正常显示。

### 2. 使用有意义的 name

`name` 字段是程序标识符，在模板中通过 `theme_config.<name>` 引用：
- 使用 camelCase 命名：`primaryColor`、`showSidebar`
- 含义明确：`postsPerPage` 优于 `num`
- 避免与内置变量冲突：不要使用 `siteName`、`domain` 等已被 `config` 占用的名称

### 3. 编写清晰的 label 和 note

`label` 是用户在 GUI 中看到的名称，必须简洁明了。`note` 提供补充说明：
- label：`"主题色"`
- note：`"链接、按钮等元素的主要颜色"`

### 4. 合理使用分组

- 配置项超过 5 个时务必分组
- 分组名称简短（2-4 个字）
- 高频配置放在前面的分组
- "高级设置"放在最后

### 5. select 类型提供 3-5 个选项

选项太少不如用 boolean，太多用户难以选择。每个 option 的 `label` 要有直觉性：
- 好：`{ "label": "窄 (680px)", "value": "680" }`
- 差：`{ "label": "680", "value": "680" }`

### 6. 敏感默认值

- `boolean` 类型默认 `true`（开启功能）——用户更倾向于关掉不需要的，而非发现功能没开
- `color` 类型提供视觉协调的默认色值
- `number` 类型设置合理范围的中间值

### 7. 注入代码使用 safe 过滤器

`code` 和 `textarea` 类型的值如果包含 HTML/JS，在 Jinja2 中输出时必须加 `|safe`：

```jinja2
{# 正确 #}
{{ theme_config.headerScript|safe }}
{{ theme_config.customCss|safe }}

{# 错误 — HTML/JS 会被转义为纯文本 #}
{{ theme_config.headerScript }}
```
