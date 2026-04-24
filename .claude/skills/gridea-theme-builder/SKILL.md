---
name: gridea-theme-builder
description: >
  Gridea Pro 博客主题开发专家。支持 Jinja2 (Pongo2)、Go Templates、EJS 三种模板引擎。提供主题脚手架生成、语法验证、渲染测试、避坑指南和完整的模板变量参考。当用户要求创建 Gridea 主题、修改 Gridea 主题、修复主题渲染问题、学习 Gridea 主题开发、从 EJS/Hugo 迁移主题时触发。触发关键词：Gridea 主题、博客主题、theme 开发、模板语法、主题配置、theme config。
---

# Gridea Pro 主题开发专家

## 概述

本 Skill 将 AI Agent 变为 Gridea Pro 主题开发专家。Gridea Pro 是基于 Go + Wails + Vue 3 的桌面静态博客客户端，支持 Jinja2 (Pongo2)、Go Templates、EJS 三种模板引擎。本 Skill 覆盖主题脚手架生成、模板编写、语法验证、渲染测试的全流程，并内置三大引擎的避坑指南和完整变量参考，确保生成的主题能一次通过渲染。

## 工作流程

按以下 5 步执行主题开发任务：

### 第 1 步：确定模板引擎

阅读下方引擎选择表，根据用户场景选定引擎。若用户未明确指定，默认使用 Jinja2。

### 第 2 步：生成脚手架

运行 `scripts/scaffold_theme.py` 生成主题骨架目录和起始模板文件。

### 第 3 步：开发模板

在脚手架基础上修改模板文件。**必须先阅读 `references/template-variables.md`**，再阅读所选引擎的专属指南，然后开始编写模板代码。

### 第 4 步：语法验证

运行 `scripts/validate_syntax.py` 检查所有模板文件的语法错误、标签配对、变量名正确性和引擎特有陷阱。

### 第 5 步：渲染测试

运行 `scripts/render_test.py` 使用 mock 数据渲染全部页面，检查渲染错误和残留模板标签。

## 引擎选择表

| 场景 | 推荐引擎 | 原因 |
|------|----------|------|
| 新主题开发（默认推荐） | Jinja2 | 语法直觉、跨语言通用、模板继承优雅 |
| 从 Hugo 迁移 | Go Templates | 语法相似，迁移成本低 |
| 从旧版 Gridea 迁移 | EJS → Jinja2 转换 | 旧版用 EJS，推荐趁机迁移到 Jinja2 |
| 开发者熟悉 Go | Go Templates | 与 Gridea Pro 后端语言一致 |

## 参考文件导航

### 必读（开发任何主题前）

| 文件 | 说明 |
|------|------|
| `references/template-variables.md` | 所有模板变量完整参考。**最重要的文件**——渲染出错 80% 因为变量名写错 |
| `references/theme-architecture.md` | 主题目录结构、文件命名规范、渲染生命周期、静态资源路径规则 |
| `references/theme-config-schema.md` | config.json 配置声明规范，定义 GUI 设置面板的字段类型和格式 |

### 引擎专属（选定引擎后阅读对应文件）

| 文件 | 说明 |
|------|------|
| `references/jinja2-guide.md` | Jinja2 (Pongo2) 完整指南，含 14 个 Pongo2 与标准 Jinja2 的致命差异 |
| `references/go-templates-guide.md` | Go Templates 完整指南，含作用域陷阱、nil panic 防护、CustomConfig map 访问、safeHTML/safeCSS 安全输出、从 Jinja2 迁移速查表 |
| `references/ejs-guide.md` | EJS 兼容指南 + EJS → Jinja2 逐行迁移对照表 |

### 按需阅读

| 文件 | 说明 |
|------|------|
| `references/css-patterns.md` | 博客 CSS 设计模式：中文排版、暗色模式、响应式布局、代码高亮 |
| `references/seo-and-meta.md` | Open Graph、Twitter Card、JSON-LD、RSS 模板 |
| `references/quality-checklist.md` | 发布前质量检查清单 |

## 脚本使用说明

### scaffold_theme.py — 生成主题脚手架

```bash
python scripts/scaffold_theme.py <theme-name> --engine jinja2|go|ejs [--output-dir ./themes]
```

根据指定引擎生成完整的主题目录结构，包含 config.json、所有必需和可选模板文件、assets 目录和示例 CSS。默认输出到当前目录的 `themes/<theme-name>/`。

示例：

```bash
python scripts/scaffold_theme.py my-blog --engine jinja2
python scripts/scaffold_theme.py hugo-migrated --engine go --output-dir ./custom-themes
```

### validate_syntax.py — 语法验证

```bash
python scripts/validate_syntax.py <theme-dir>
```

扫描主题目录下所有模板文件，执行以下检查：
- 模板标签配对（未闭合的 block/for/if 等）
- 变量名拼写（与 template-variables.md 中的标准变量名对比）
- 引擎特有陷阱检测（如 Pongo2 的括号误用、Go Templates 的 nil 访问）
- 必需文件是否存在

示例：

```bash
python scripts/validate_syntax.py ./themes/my-blog
```

### render_test.py — 渲染测试

```bash
python scripts/render_test.py <theme-dir> [--output-dir ./test-output]
```

使用内置的 mock 数据渲染所有页面模板到静态 HTML 文件，检查：
- 渲染是否报错
- 输出中是否有残留的模板标签（`{{`、`{%`、`<%` 等）
- 链接路径是否正确

默认输出到 `./test-output/`。

示例：

```bash
python scripts/render_test.py ./themes/my-blog
python scripts/render_test.py ./themes/my-blog --output-dir ./preview
```

## 关键规则

以下规则**必须严格遵守**，违反任一条都可能导致主题渲染失败：

### 通用规则

1. **开发前必读变量参考**——在编写任何模板代码之前，必须先阅读 `references/template-variables.md`
2. **开发前必读引擎指南**——在编写模板之前，必须先阅读所选引擎的专属指南
3. **禁止猜测变量名**——必须使用变量参考中的精确名称，不可凭记忆或推测
4. **区分 config 和 theme_config**——`config` 用于访问站点级配置（domain、siteName 等），`theme_config` 用于访问 config.json 中 customConfig 定义的主题自定义配置项

### Jinja2 (Pongo2) 专属规则

5. **过滤器参数用冒号不用括号**——正确：`{{ value|default:"fallback" }}`，错误：`{{ value|default("fallback") }}`
6. **post.date 是字符串不是时间对象**——`post.date` 已经是格式化后的字符串，不要对其使用 `|date` 过滤器
7. **include 路径始终相对于 templates/ 根目录**——正确：`{% include "partials/header.html" %}`，不是相对于当前文件路径
8. **输出 HTML 内容必须用 safe 过滤器**——`{{ post.content|safe }}`，否则 HTML 会被转义

### Go Templates 专属规则

9. **访问嵌套字段前必须判空**——`{{ if .Post }}{{ .Post.Title }}{{ end }}`，否则 nil 时会 panic
10. **变量名必须 PascalCase**——`.Config.SiteName` 不是 `.config.siteName`，大小写错误会输出空值或 `<no value>`
11. **CustomConfig 是 map 类型，必须用 index 访问**——`{{ index .Site.CustomConfig "showSearch" }}`，不能用点号 `.Site.CustomConfig.showSearch`
12. **CustomConfig 中的 HTML/CSS 内容必须用 safeHTML/safeCSS**——否则被自动转义为纯文本
13. **template 调用末尾必须带 `.` 传递上下文**——`{{ template "header" . }}`，漏掉 `.` 会导致组件内所有变量为 nil
14. **没有模板继承**——不支持 extends/block，每个页面写完整骨架 + template 组件组装

### EJS 专属规则

15. **禁止使用 require()**——EJS 运行时不支持 Node.js 的 `require()`，JS 能力有限

### 静态资源规则

16. **assets/ 前缀会被去除**——`assets/styles/main.css` 在输出中变为 `/styles/main.css`，模板中引用时不加 `assets/` 前缀
