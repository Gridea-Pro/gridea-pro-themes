# Gridea Pro 主题目录结构与架构

> 本文件描述 Gridea Pro 主题的文件组织规范、渲染生命周期和静态资源路径规则。创建或修改主题前必须阅读。

## 目录

1. [主题目录结构](#主题目录结构)
2. [必需与可选文件](#必需与可选文件)
3. [渲染生命周期](#渲染生命周期)
4. [静态资源路径规则](#静态资源路径规则)
5. [模板引擎声明](#模板引擎声明)
6. [模板文件命名规范](#模板文件命名规范)

---

## 主题目录结构

一个完整的 Gridea Pro 主题目录结构如下：

```
themes/my-theme/
├── config.json                    # 主题配置声明文件（必需）
├── assets/                        # 静态资源目录
│   ├── media/
│   │   └── images/                # 主题自带图片（背景、图标等）
│   │       ├── logo.png
│   │       └── default-cover.jpg
│   └── styles/
│       ├── main.less              # 主样式文件（支持 LESS）
│       ├── main.css               # 或直接使用 CSS
│       ├── normalize.css          # 重置样式
│       └── highlight.css          # 代码高亮样式
├── templates/                     # 模板文件目录（必需）
│   ├── base.html                  # 基础布局模板（强烈推荐）
│   ├── index.html                 # 首页（必需）
│   ├── post.html                  # 文章详情页（必需）
│   ├── archives.html              # 归档页
│   ├── tag.html                   # 单个标签页（该标签下的文章列表）
│   ├── tags.html                  # 标签汇总页（所有标签）
│   ├── about.html                 # 关于页
│   ├── links.html                 # 友链页
│   ├── blog.html                  # 博客列表页（分页）
│   ├── memos.html                 # 灵感/短想法页
│   ├── 404.html                   # 404 错误页
│   └── partials/                  # 局部模板目录
│       ├── header.html            # 页头
│       ├── footer.html            # 页脚
│       ├── sidebar.html           # 侧边栏
│       ├── post-card.html         # 文章卡片（列表中的单篇文章）
│       ├── pagination.html        # 分页组件
│       └── comments.html          # 评论区
└── screenshot.png                 # 主题预览截图（推荐，显示在主题选择界面）
```

### 目录说明

| 目录/文件 | 说明 |
|-----------|------|
| `config.json` | 主题元信息 + 自定义配置声明，Gridea Pro 根据此文件生成 GUI 设置面板 |
| `assets/` | 所有静态资源。构建时此目录的**内容**（不含 `assets/` 本身）会被复制到输出根目录 |
| `assets/styles/` | CSS / LESS 样式文件 |
| `assets/media/images/` | 主题自带图片资源 |
| `templates/` | 所有模板文件必须放在此目录下 |
| `templates/partials/` | 局部模板（可复用组件），通过 include/template 引入 |
| `screenshot.png` | 主题预览图，建议尺寸 1200×900 |

---

## 必需与可选文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `config.json` | **必需** | 无此文件则 Gridea Pro 无法识别为合法主题 |
| `templates/index.html` | **必需** | 首页模板，是博客的入口页面 |
| `templates/post.html` | **必需** | 文章详情页模板，每篇文章都由此模板渲染 |
| `templates/base.html` | 强烈推荐 | 基础布局模板，定义 HTML 骨架，其他页面通过继承复用 |
| `templates/archives.html` | 可选 | 若不提供，归档功能不可用 |
| `templates/tag.html` | 可选 | 若不提供，单个标签页不可用 |
| `templates/tags.html` | 可选 | 若不提供，标签汇总页不可用 |
| `templates/about.html` | 可选 | 若不提供，关于页不可用 |
| `templates/links.html` | 可选 | 若不提供，友链页不可用 |
| `templates/blog.html` | 可选 | 博客列表页，支持分页，与 index.html 类似但可有不同布局 |
| `templates/memos.html` | 可选 | 若不提供，灵感/Memo 功能不可用 |
| `templates/404.html` | 可选 | 若不提供，使用浏览器默认 404 页面 |
| `screenshot.png` | 推荐 | 在主题选择界面显示预览 |

### 最小可用主题

一个最小可运行的 Gridea Pro 主题只需 3 个文件：

```
themes/minimal/
├── config.json
└── templates/
    ├── index.html
    └── post.html
```

---

## 渲染生命周期

Gridea Pro 构建博客时，按以下 6 个步骤执行渲染：

### 第 1 步：加载主题配置

读取主题目录下的 `config.json`，解析主题元信息和用户自定义配置值。配置值将注入到模板的 `theme_config` 对象中。

### 第 2 步：准备模板数据

从站点数据（文章、标签、菜单等）和配置中组装模板变量。包括：
- 站点配置 → `config` 对象
- 主题配置 → `theme_config` 对象
- 导航菜单 → `menus` 列表
- 文章列表 → `posts` 列表（按日期排序，置顶文章优先）
- 标签列表 → `tags` 列表
- 当前时间 → `now`

### 第 3 步：初始化模板引擎

根据 config.json 中声明的 `templateEngine` 字段，初始化对应的模板引擎（Jinja2/Go/EJS）。加载 `templates/` 目录下的所有模板文件。

### 第 4 步：渲染页面

按以下顺序渲染各页面：

1. **index.html** → 输出 `index.html`（及分页文件 `page/2/index.html` 等）
2. **post.html** → 为每篇文章输出 `post/<slug>/index.html`
3. **archives.html** → 输出 `archives/index.html`
4. **tag.html** → 为每个标签输出 `tag/<tag-name>/index.html`
5. **tags.html** → 输出 `tags/index.html`
6. **about.html** → 输出 `about/index.html`
7. **links.html** → 输出 `links/index.html`
8. **blog.html** → 输出 `blog/index.html`（及分页）
9. **memos.html** → 输出 `memos/index.html`
10. **404.html** → 输出 `404.html`

每个页面只接收该页面对应的变量（参见 `template-variables.md` 中的各页面可用变量表）。

### 第 5 步：复制静态资源

将 `assets/` 目录下的所有文件复制到输出目录根部。**注意：`assets/` 前缀会被去除**。

### 第 6 步：输出完成

所有渲染后的 HTML 文件和静态资源组合成完整的静态站点，可部署到任意静态托管服务。

---

## 静态资源路径规则

这是最容易出错的环节之一。牢记以下规则：

### 核心规则：assets/ 前缀在输出中被去除

| 主题中的文件路径 | 输出后的 URL 路径 |
|-----------------|-------------------|
| `assets/styles/main.css` | `/styles/main.css` |
| `assets/styles/normalize.css` | `/styles/normalize.css` |
| `assets/media/images/logo.png` | `/media/images/logo.png` |
| `assets/scripts/app.js` | `/scripts/app.js` |

### 在模板中引用静态资源

```jinja2
{# 正确 — 不包含 assets/ 前缀 #}
<link rel="stylesheet" href="/styles/main.css" />
<img src="/media/images/logo.png" />
<script src="/scripts/app.js"></script>

{# 错误 — 不要在路径中包含 assets/ #}
<link rel="stylesheet" href="/assets/styles/main.css" />
```

### LESS 文件处理

Gridea Pro 支持 LESS 预处理。如果使用 `.less` 文件：
- 主题中写 `assets/styles/main.less`
- Gridea Pro 会自动编译为 CSS
- 在模板中引用编译后的 CSS：`<link rel="stylesheet" href="/styles/main.css" />`

### 用户上传的图片

用户上传的图片（文章特色图、头像等）由 Gridea Pro 管理，路径通过模板变量获取（如 `config.avatar`、`post.feature`），无需手动拼接路径。

---

## 模板引擎声明

在 config.json 中通过 `templateEngine` 字段声明使用的模板引擎：

```json
{
  "name": "my-theme",
  "templateEngine": "jinja2"
}
```

| 值 | 引擎 | 说明 |
|----|------|------|
| `"jinja2"` | Jinja2 (Pongo2) | 默认推荐。Go 实现的 Jinja2 兼容引擎，存在部分差异 |
| `"go"` | Go Templates | Go 标准库模板引擎 |
| `"ejs"` | EJS | JavaScript 模板引擎，主要用于旧版兼容 |

如果 config.json 中未声明 `templateEngine`，默认使用 `"ejs"`（为旧版主题兼容）。**新主题务必显式声明引擎类型。**

---

## 模板文件命名规范

### 页面模板

- 文件名**固定不可更改**，必须使用 Gridea Pro 约定的名称
- 文件扩展名统一使用 `.html`，不论使用何种模板引擎
- 必须放在 `templates/` 目录的根层级（不能在子目录中）

| 文件名 | 对应页面 | 不可使用的名称 |
|--------|----------|----------------|
| `index.html` | 首页 | `home.html`、`main.html` |
| `post.html` | 文章详情 | `article.html`、`single.html` |
| `archives.html` | 归档 | `archive.html`（注意是复数 archives） |
| `tag.html` | 单个标签 | `tag-page.html` |
| `tags.html` | 标签汇总 | `all-tags.html` |
| `about.html` | 关于 | `about-me.html` |
| `links.html` | 友链 | `friends.html`、`blogroll.html` |
| `blog.html` | 博客列表 | `posts.html`、`list.html` |
| `memos.html` | 灵感 | `notes.html`、`thoughts.html` |
| `404.html` | 错误页 | `not-found.html`、`error.html` |

### 局部模板

- 放在 `templates/partials/` 目录下
- 命名自由，建议使用短横线命名法（kebab-case）
- 示例：`header.html`、`footer.html`、`post-card.html`、`sidebar.html`

### base 模板

- `templates/base.html`——用于模板继承的基础布局
- 名称非强制但强烈建议使用 `base.html`
- Jinja2 中通过 `{% extends "base.html" %}` 引用
- Go Templates 中通过 `{{ template "base.html" . }}` 引用
