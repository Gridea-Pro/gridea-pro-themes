# bitcron-pro

Bitcron 风格的 Gridea Pro 博客主题，Jinja2 (Pongo2) 模板引擎。

## 功能

- 文章目录（TOC），宽屏自动展开
- 打赏（支付宝/微信）
- 手机和桌面自适应
- FontAwesome 图标
- 可调的布局、颜色、字体、社交链接等配置

## 页面模板

| 模板 | 说明 |
|---|---|
| `index.html` | 首页，文章列表 |
| `post.html` | 文章详情 |
| `blog.html` | 博客列表（分页） |
| `archives.html` | 归档 |
| `tag.html` / `tags.html` | 标签 |
| `memos.html` | 闪念 |
| `links.html` | 友链 |

## 配置项

以下选项在 Gridea Pro 主题设置里改。

### 布局

| 配置 | 默认值 |
|---|---|
| 内容区最大宽度（px / %） | `800px` |
| 正文字号（px / rem） | `16px` |
| 标题对齐（居中/左/右） | `center` |
| 字体（系统默认 / Georgia） | 系统默认 |
| 文章目录开关 | 开 |

### 颜色

| 配置 | 默认值 |
|---|---|
| 内容区背景 | `#ffffff` |
| 页面背景 | `#ffffff` |
| 正文 | `rgba(0,0,0,0.86)` |
| 链接 | `rgba(0,0,0,.98)` |
| 链接悬停 | `#006CFF` |

所有颜色填 CSS 合法值就行。

### 社交

Github、Twitter、微博、知乎、Facebook、Telegram。

### 其他

- 自定义 CSS
- Google Analytics 跟踪 ID
- Meta Description

## 安装

把 `bitcron-pro/` 拷到站点 `themes/` 目录下，在 Gridea Pro 里选它。

## 致谢

设计来自 [Bitcron](https://bitcron.com/)，文中君移植，ShinonomeShizuka 维护。
