# Typography for Gridea Pro

> Rediscover the beauty of typography. A minimal, typography-focused theme.

从 [hexo-theme-typography](https://github.com/SumiMakito/hexo-theme-typography) 迁移至 Gridea Pro 的 Jinja2 主题模板，保留了原版极简排版的设计精髓，并针对 Gridea Pro 的生态做了深度适配。

---

## 功能概览

| 功能 | 状态 | 说明 |
|------|:----:|------|
| 响应式布局 | ✅ | Bootstrap 3 栅格系统，桌面 / 平板 / 手机全适配 |
| 双配色方案 | ✅ | 浅色 / 暗色一键切换 |
| 文章列表与详情 | ✅ | 支持摘要展示、特色图片、标签与分类 |
| 归档页 | ✅ | 按时间线展示所有文章，显示文章总数 |
| 分类系统 | ✅ | 分类详情页按年份归档，列表中可开关分类显示 |
| 标签系统 | ✅ | 标签总览页 + 单标签详情页，列表中可开关标签显示 |
| 分页 | ✅ | 上一页 / 下一页导航，可配置页码指示器 |
| 友情链接 | ✅ | 独立页面，支持头像、站点名、描述 |
| 闪念 / Memos | ✅ | 独立页面，含 GitHub 风格热力图（纯 JS 实现） |
| 自定义页面 | ✅ | 关于页等任意自定义页面 |
| 社交链接 | ✅ | GitHub、Twitter、Instagram、微博，均可独立配置 |
| RSS / Atom | ✅ | 导航栏 RSS 图标 + Atom feed 声明，可配置开关 |
| 文章分享 | ✅ | Evernote 收藏、微博分享、Twitter 分享 |
| 文章上下篇导航 | ✅ | 详情页底部显示上一篇 / 下一篇 |
| 自定义版权名称 | ✅ | 可开关，开启后用自定义文字替换站点名称 |
| SEO 优化 | ✅ | Meta description / keywords、Open Graph、Twitter Card |
| KaTeX 数学公式 | ✅ | 文章详情页引入 KaTeX CSS |
| 入场动画 | ✅ | fadeInDown 动画 + jQuery Appear 滚动触发 |
| 评论系统 | ⚠️ | 通过 Gridea Pro 运行时注入，**尚未独立验证** |
| 自定义导航菜单 | ✅ | 支持自定义 menus，未配置时回退到默认导航 |
| Google Analytics | ✅ | 支持 Google Analytics 统计|
| Umami Analytics | ✅ | 支持自托管 Umami 统计 |
| 多语言 i18n | ❌ | 已移除（原 Hexo 版支持 4 种语言） |
| 代码语法高亮 | ❌ | 已移除（原 Hexo 版通过 hexo-prism-plugin 实现，Gridea Pro 自带） |
| SCSS 源码编译 | ❌ | 已移除（直接使用编译后的 CSS） |

---

## 与原版 Hexo 主题的差异

### 新增功能

| 功能 | 说明 |
|------|------|
| 友情链接页 | 原版无独立友链页，Gridea Pro 版新增 `links.html`，支持头像、站点名、描述 |
| 闪念 / Memos 页 | 原版无此功能，Gridea Pro 版新增 `memos.html`，含 GitHub 风格贡献热力图 |
| 自定义版权名称 | 可在主题设置中开关，开启后用自定义文字替换版权区域的站点名称 |
| 评论显示开关 | 新增 `showComments` 配置项，可控制文章列表中评论链接的显示 |
| 博客列表页 | 新增 `blog.html`，与首页结构类似但无特色图片展示 |
| 文章特色图片 | 首页列表支持 `post.feature` 特色图片展示（带 lazy loading） |
| KaTeX 支持 | 文章详情页引入 KaTeX 0.10.0 CSS |
| Mermaid 支持 | 文章详情页引入 Mermaid，支持流程图、时序图、甘特图等图表渲染 |

### 移除功能

| 功能 | 原因 |
|------|------|
| Disqus / LiveRe 评论 | Gridea Pro 自带评论系统，通过 `<div id="gridea-comments"></div>` 占位符注入 |
| Dove 信鸽彩蛋 | 依赖原版评论系统逻辑，已无实际意义 |
| Google Analytics | Gridea Pro 自带统计功能，无需主题层集成 |
| 多语言 i18n | Gridea Pro 不使用 Hexo 的 language 文件机制，UI 文案直接写在模板中 |
| SCSS 编译工具链 | 直接使用编译后的 CSS，无需 node-sass / autoprefixer 构建 |
| 代码语法高亮 | Gridea Pro 自带代码高亮，无需 hexo-prism-plugin |
| Vue.js | 原版引入但未实际使用，已清理 |
| 动态页面自动导航 | 原版通过 `site.pages` 自动生成导航链接，Gridea Pro 版改用 `menus` 变量 |

### 保留并适配的功能

| 功能 | 适配方式 |
|------|----------|
| 三级标题体系 | `title_primary` / `title_secondary` 迁移至 config.json 的 customConfig |
| 双配色方案 | `themeStyle` 配置项保留，light / dark 切换逻辑不变 |
| 分页指示器 | `showPageCount` 配置项保留 |
| 分类 / 标签显示控制 | `showCategories` / `showTags` 配置项保留 |
| 社交链接 | GitHub / Twitter / Instagram / 微博图标链接全部保留 |
| RSS | Atom feed 声明和导航栏图标保留，新增 `rssEnabled` 开关 |
| 文章分享 | Evernote / 微博 / Twitter 分享按钮保留 |
| SEO Meta | description / keywords / Open Graph / Twitter Card 全部保留 |
| 入场动画 | fadeInDown + jQuery Appear 保留 |
| 响应式布局 | Bootstrap 3 栅格 + 移动端页脚适配保留 |

---

## 配置项说明

主题提供 **19 个可配置项**，分为 4 组，均可在 Gridea Pro 主题设置面板中调整：

### 基础设置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| 主标题 (大) | 输入框 | `活版印字` | 侧边栏大标题 |
| 副标题 (小) | 输入框 | `Typography` | 侧边栏小标题 |
| 站点关键词 | 输入框 | (空) | SEO 关键词，逗号分隔 |
| 启用自定义版权名称 | 开关 | 关闭 | 开启后可自定义版权区域显示的名称 |
| 自定义版权名称 | 输入框 | (空) | 版权链接处显示的文字（需先开启上方开关） |

### 外观设置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| 配色方案 | 下拉选择 | 浅色 | 浅色 / 深色 |
| 显示页码计数 | 开关 | 开启 | 分页时显示 "Page X / Total Y" |
| 显示文章分类 | 开关 | 开启 | 文章列表中显示分类信息 |
| 显示文章标签 | 开关 | 开启 | 文章列表中显示标签信息 |
| 显示评论入口 | 开关 | 开启 | 文章列表中显示评论链接 |

### 社交链接

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| GitHub 账号 | 输入框 | (空) | 留空则不显示图标 |
| Twitter 账号 | 输入框 | (空) | 留空则不显示图标 |
| Instagram 账号 | 输入框 | (空) | 留空则不显示图标 |
| 微博 UID | 输入框 | (空) | 留空则不显示图标 |
| 启用 RSS | 开关 | 开启 | 导航栏显示 RSS 图标 |

### 统计与追踪

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| 统计工具 | 下拉选择 | 不启用 | 可选：不启用 / Google Analytics / Umami Analytics |
| Google Analytics 测量 ID | 输入框 | (空) | 格式如 G-XXXXXXXXXX，选择 Google Analytics 时必填 |
| Umami 脚本地址 | 输入框 | (空) | 如 https://umami.example.com/script.js，选择 Umami 时必填 |
| Umami 网站 ID | 输入框 | (空) | 选择 Umami 时必填 |

---

## 文件结构

```
gridea-typography-theme/
├── config.json                    # 主题配置定义
├── assets/
│   ├── fonts/                     # Font Awesome 字体文件
│   ├── media/
│   │   ├── images/                # favicon.png、pigeon.svg
│   │   └── preview.png            # 主题预览图
│   ├── scripts/                   # jQuery、Bootstrap、typography.js
│   └── styles/                    # 主题样式（light / dark）、动画
└── templates/
    ├── index.html                 # 首页
    ├── blog.html                  # 博客列表页
    ├── post.html                  # 文章详情页
    ├── page.html                  # 自定义页面
    ├── about.html                 # 关于页
    ├── archives.html              # 归档页
    ├── category.html              # 分类详情页
    ├── tag.html                   # 标签详情页
    ├── tags.html                  # 标签总览页
    ├── links.html                 # 友情链接页
    ├── memos.html                 # 闪念 / Memos 页
    └── partials/
        ├── head.html              # HTML 头部（meta、CSS、RSS）
        ├── header.html            # 导航栏 + 社交链接
        ├── sidebar.html           # 侧边栏标题
        ├── footer.html            # 页脚版权信息
        ├── pagination.html        # 分页组件
        ├── post-card.html         # 文章卡片（列表 / 详情复用）
        ├── post-nav.html          # 文章上下篇导航
        ├── share.html             # 分享按钮
        └── comments.html          # 评论区占位
```

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 模板引擎 | Jinja2 |
| CSS 框架 | Bootstrap 3 |
| 图标库 | Font Awesome |
| JS 库 | jQuery 3.1.0、Bootstrap JS、jQuery Appear |
| 数学公式 | KaTeX 0.10.0 (CDN) |

---

## 待验证事项

| 项目 | 说明 |
|------|------|
| 评论系统 | 模板中仅放置了 `<div id="gridea-comments"></div>` 占位符，依赖 Gridea Pro 运行时注入评论组件，尚未在真实环境中验证评论的加载与交互是否正常 |
| Memos 热力图 | 闪念页的 GitHub 风格热力图为纯 JS 实现，依赖 `memo.createdAtISO` 提供 ISO 格式日期，需确认 Gridea Pro 是否正确输出该字段 |
| 自定义导航菜单 | 导航栏支持 `menus` 变量自定义菜单项，需确认 Gridea Pro 的菜单数据结构与模板中的 `menu.name` / `menu.link` 是否匹配 |
| KaTeX 公式渲染 | 仅引入了 KaTeX CSS，JS 渲染引擎需 Gridea Pro 运行时提供，需确认公式页面是否正常渲染 |
| 文章特色图片 | 首页列表使用 `post.feature` 展示特色图片，需确认 Gridea Pro 是否支持该字段 |

---

## 致谢

- 原主题作者：[Makito](https://www.keep.moe)
- 原项目地址：[hexo-theme-typography](https://github.com/SumiMakito/hexo-theme-typography)
- 构建平台：[Gridea Pro](https://gridea.pro)
