# Gazette

> Editorial 编辑感博客主题。衬线体全局 + 暖奶油底 + 桑红重点 + 等宽数字 + 发丝分割线 + 开篇 drop cap。手写 CSS，无 Tailwind，无外部字体依赖，支持深浅模式。设计灵感参考 Hugo [Paper](https://github.com/nanxiaobei/hugo-paper) by [@nanxiaobei](https://github.com/nanxiaobei)。

![preview](./assets/media/preview.png)

## 特性

- ✒️ **Editorial 排版**：body 与 title 统一用 Iowan Old Style 衬线体，数字用 JetBrains Mono，层级靠字重和字距而非颜色堆砌
- 🌓 **暗色 / 亮色切换**：跟随系统、手动切换、偏好持久化，切换时平滑过渡
- 🎨 **4 种底纸**：linen（默认）/ wheat / gray / light
- 👤 **首页个人卡片**：头像 + 作者名 + Bio，仅第一页显示（theme_config → config 两级回退）
- ⭐ **Featured 徽章**：置顶文章显示桑红细描边徽章（不同于常见橙色背景）
- 🏷️ **标签系统**：斜体 `#` + 衬线名 + 等宽数字计数，pill 无背景靠边框撑形
- 📅 **归档页**：年份大字衬线分组，条目 `MM—DD` 短破折号 + 悬停横推
- 💭 **闪念**：日期列 DAY / MONTH / YEAR 三级纵向堆叠，像邮戳
- 🔗 **友链**：头像 + 名 + 描述 + ↗ 箭头三栏 grid，悬停箭头斜上位移
- 📝 **文章首段 drop cap**：首字符 3.4em 衬线浮动
- 💻 highlight.js 代码高亮 · KaTeX 数学公式 · Mermaid 图表（按需启用）
- 📱 **响应式**：移动端（<680px）汉堡抽屉导航
- ♿ 尊重 `prefers-reduced-motion`

## 信息

| 字段 | 值 |
|---|---|
| 目录名 | `gazette` |
| 版本 | `1.0.0` |
| 作者 | Eliauk |
| 灵感来源 | [nanxiaobei/hugo-paper](https://github.com/nanxiaobei/hugo-paper) |
| 模板引擎 | `jinja2` (Pongo2) |
| CSS | 纯手写 · 无 Tailwind · 无外部字体 · 约 1035 行 |
| 授权 | MIT |

## 页面结构

| 页面 | 说明 |
|---|---|
| `index.html` | 首页：第一页显示头像卡，往后翻页只显示文章列表 |
| `blog.html` | 纯文章列表（分页，不显示头像卡） |
| `archives.html` | 按年份分组的归档 |
| `post.html` | 文章详情（标题 / 日期 / 作者 / 内容 / 底部标签云） |
| `tag.html` | 单标签筛选，标题前缀 `#` |
| `tags.html` | 全部标签云 |
| `404.html` | 极简 404 |

## 自定义参数

在 Gridea Pro 应用「主题 → 自定义」里可以配置：

### 外观

- **背景色**：linen（亚麻白）/ wheat（浅麦黄）/ gray（淡灰）/ light（纯白）
- **默认暗色模式**：跟随系统 / 始终浅色 / 始终暗色
- **使用单色暗色切换图标**：关闭 = 原主题彩色 PNG 带动画；开启 = 单色 SVG

### 首页个人信息

- **作者名** / **作者 Bio** / **头像 URL**

### 社交链接（顶栏显示）

Twitter / GitHub / Instagram / LinkedIn / Mastodon / Threads / Bluesky / RSS

### 功能

- **启用代码高亮 (highlight.js)**（默认开启）
- **启用 KaTeX 数学公式**（默认关闭）
- **启用 Mermaid 图表**（默认关闭）
- **首页显示 Featured 标记**（默认开启）

### 站点图标

- **Favicon**

### 页脚

- **页脚版权文字**（留空则自动显示 © 年份 站点名）
- **页脚显示「Powered by」**

### 高级

- **自定义 CSS** / **自定义 JavaScript** / **分析代码（原样插入）**

## 跨引擎差异说明

本主题是 Hugo 原版的 **Jinja2 重写版**，核心外观 1:1 还原。主要差异：

- **模板引擎**：Go Template → Pongo2（Jinja2 的 Go 实现）
- **Tailwind CSS**：原版构建时用 PostCSS 编译；移植版直接内置已编译的 `main.css`（1841 行）
- **暗色切换**：图标（`theme.png` / `theme.svg`）、社交图标 SVG 等静态资源同步搬入 `assets/icons/`
- **移除的功能**：文章前后导航（`NextInSection` / `PrevInSection`，Gridea 无此字段）、Hugo i18n、Disqus / GraphComment / giscus（Gridea 有自己的评论系统）、多语言方向 rtl（中文场景暂不需要）
- **i18n**：原版支持多语言菜单；当前版本用中文硬编码（「上一页」「下一页」「归档」「标签」「暂无文章」等）

## 致谢

- 原版主题：[hugo-paper](https://github.com/nanxiaobei/hugo-paper) by [nanxiaobei (@南小北)](https://lee.so/)

## 授权

沿用原版的 **MIT** 授权。

## 问题反馈

在 [gridea-pro-themes](https://github.com/Gridea-Pro/gridea-pro-themes/issues) 提 Issue，选「主题 Bug」模板，主题名填 `paper`。
