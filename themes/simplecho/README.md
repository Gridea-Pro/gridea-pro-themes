# Simplecho · Gridea Pro 主题

> Simple + Echo = 💖 ——把 Typecho 上招牌的极简卡片博客，搬到 Gridea Pro。

**Simplecho** 是 [yanranxiaoxi/Simplecho](https://github.com/yanranxiaoxi/Simplecho) （Typecho，作者 XiaoXi，GPL-3.0）的 Gridea Pro Jinja2 移植版。一比一保留原作的视觉基因——1000px 居中容器、左文右图卡片、`# 分类 # 标签` 元信息、居中页脚 **STAY VIBRANT**——同时按 Gridea Pro 静态站规范重写后端：去 PHP / jQuery / Bootstrap / Fancybox / PJAX，全部纯原生。

| 项 | 值 |
| - | - |
| 模板引擎 | Jinja2 (Pongo2) |
| 容器宽度 | 1000px（可改） |
| 配色 | 4 套招牌（银光灰 / 简约白 / 墨草绿 / 暗夜黑） |
| 字体 | PingFang SC + Optima（可改） |
| License | GPL-3.0（继承原作） |

## ✨ 特性

### 一比一保留
- 🎨 **4 套招牌配色**：银光灰（默认） / 简约白（粉色强调） / 墨草绿 / 暗夜黑
- 🌗 **自动跟随浏览器深色**：开关，默认开启 → 自动切到「暗夜黑」
- 🃏 **左文右图卡片**：1000px 居中，hover `scale(1.012)`
- `#` **风格元信息**：`# 分类 # 标签` 链式排布
- 🌟 **STAY VIBRANT** 居中页脚 + 12 种社交图标
- 🔝 **手动置顶**：用 `首页置顶 HTML` 字段自由放任意内容
- 📝 **文章末尾自定义区**：版权声明 / 推广 / 二维码

### Gridea Pro 全套补全
- 🔍 **顶栏搜索**：基于 `/api/search.json`，支持中英文模糊匹配
- 📄 **完整页面**：首页 / 博客 / 文章 / 归档 / 标签云 / 单标签 / 单分类 / 关于 / 友链 / 闪念 / 404
- 📈 **阅读进度条**：文章页顶部 2px 细线
- 🔼 **返回顶部**：右下角浮动按钮
- 📋 **代码复制**：`<pre>` 右上角复制按钮
- 🖼️ **图片懒加载**：`loading="lazy"` 兜底
- 📱 **响应式**：≤992px 切换九宫格菜单
- 🎛️ **配色切换器**：顶栏右上角圆点，读者可手动切换 4 套配色

### 剥离的依赖
| 原版依赖 | 替代 |
| - | - |
| jQuery 3.7 | 全原生 DOM API |
| Bootstrap 4.6 | 自写 navbar + grid |
| Fancybox 3.5 | （留待用户自行注入） |
| nprogress | 自写 reading-progress |
| jquery-pjax | Gridea 是静态站，无需 PJAX |
| Font Awesome 6 | 12 个内联 SVG `<symbol>` |
| OwO 表情 / NoticeJS / animate.css | 移除 |
| highlight.js + 主题 | 保留 Solarized Dark CSS，由 Gridea Pro 渲染时上色 |

## 📁 文件结构

```
themes/simplecho/
├── config.json                  # 36 项 customConfig（基础/外观/首页/文章/社交/页脚/增强/高级）
├── README.md
├── LICENSE                      # GPL-3.0
├── assets/
│   ├── styles/main.css          # ~600 行，4 配色 CSS 变量 + 23 节区
│   ├── scripts/main.js          # ~210 行，8 个模块
│   └── media/
└── templates/
    ├── base.html                # 防闪配色 + theme-config JSON + SVG icon lib
    ├── index.html               # 首页（带 sticky HTML）
    ├── post.html                # 文章详情
    ├── blog.html                # 博客列表
    ├── archives.html            # 年份归档
    ├── tag.html                 # 单标签下文章
    ├── tags.html                # 标签云
    ├── category.html            # 单分类下文章
    ├── about.html               # 关于
    ├── links.html               # 友链
    ├── memos.html               # 闪念
    ├── 404.html                 # 错误页
    └── partials/
        ├── icons.html           # SVG symbol library（12 个图标）
        ├── header.html          # 顶栏（头像 + 站名 + 菜单 + 配色切换 + 搜索）
        ├── footer.html          # 页脚（slogan + 12 社交 + 备案）
        ├── post-card.html       # 左文右图卡片
        ├── pagination.html      # 「当前/总页码」分页
        ├── post-nav.html        # 上下篇
        └── comments.html        # 评论挂载点（#gridea-comments）
```

## ⚙️ 安装与启用

将整个 `themes/simplecho` 文件夹放入 Gridea Pro 的 `themes/` 目录，到客户端「主题」页选用即可。

## 🎛️ 配置项要点

| 项 | 默认 | 说明 |
| - | - | - |
| `themePalette` | gray | 4 套配色：gray / white / green / black |
| `themeAutoDark` | true | 浏览器深色 → 自动切到 black |
| `themeUserToggle` | true | 顶栏显示读者可点的配色圆点 |
| `containerWidth` | 1000 | PC 端正文最大宽度 |
| `indexShowFeature` | true | 首页卡片右侧封面图 |
| `indexExcerptLength` | 180 | 首页摘要字符数 |
| `stickyHTML` | （空） | 首页第一页置顶展示的自定义 HTML |
| `underPostContent` | （空） | 文章正文末尾追加的 HTML |
| `footerSlogan` | STAY VIBRANT | 页脚最上方居中标语 |
| `socialXxx` | （空） | 12 个社交平台链接，一个个填即可 |

完整列表见 `config.json`。

## 🎨 配色一览

| 名称 | 背景 | 主文本 | 强调 | 适用场景 |
| - | - | - | - | - |
| **银光灰** | `#f9f9f9` | `#5e5e5e` | `#8b959f` | 默认，最克制 |
| **简约白** | `#ffffff` | `#5f6169` | `#f5bab2` 樱粉 | 暖色系小清新 |
| **墨草绿** | `#e6eceb` | `#727877` | `#65b687` 草绿 | 自然 / 笔记类 |
| **暗夜黑** | `#151617` | `#e0eaef` | `#64b587` | 夜读 / 深色模式 |

切换通过 `data-sc-palette` 属性，CSS 变量驱动，无 `!important` 覆盖，干净易扩展。

## 📜 License

本主题基于原作的 **GNU GPL-3.0** 协议开源。

```
Original: Simplecho (https://github.com/yanranxiaoxi/Simplecho) © XiaoXi
Port:     Simplecho · Gridea Pro © Eric, 2026
License:  GPL-3.0
```

## 🙏 致谢

- 原作者 [XiaoXi (yanranxiaoxi)](https://soraharu.com/) ——把 Typecho 上的极简博客调教得如此舒服
- 原作灵感来自更早的 [Gridea For Pure](https://github.com/xiamuguizhi/Gridea-Theme-Pure)（叶开）
