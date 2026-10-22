# 3x-ui — Gridea Pro 主题

> 黑 / 白 / 灰，秩序，内容优先。

**3x-ui** 视觉复刻自 3x-ui / Xray 部署教程站 [小小东 VPS 教程](https://vps.xiaoxiaodong.ai)（源码 [nevertoday/xiaoxiaodong-vps](https://github.com/nevertoday/xiaoxiaodong-vps)，MIT），完全转译为 Gridea Pro 的 Jinja2 (Pongo2) 主题。原站是文档站，本主题把它的设计语言搬到博客上：

- **xxd 设计系统原样沿用**（`assets/xxd/`，MIT）：暖白纸 `#fdfcfb` / 暖黑 `#171612`、墨色强调、默认直角、只用系统字体
- **三栏文档站布局**：56px 毛玻璃顶栏 + 左侧目录 + 780px 正文 + 右侧「目录」，整体居中（宽屏不再左边挤、右边空）
- **首页**：大标题 + 引言 + 主次按钮、**可配置的「推荐阅读」卡片**（封面 / 标题 / 摘要 / 发布时间）、编号文章路线（置顶用「置顶」文字标签）
- **⌘K 命令面板搜索**：全文搜索文章，也能跳页面、分类、标签；命中关键词用亮黄色高亮
- **Lucide 图标**：全站图标换成 Lucide（24×24 网格、1.25 描边、圆头圆角，ISC License）
- **浅色 / 深色 / 跟随系统** 三态分段切换，首帧前写入，无闪屏

## 页面

| 页面 | 模板 | 说明 |
|------|------|------|
| 首页 | `index.html` | 大标题、推荐阅读卡片、文章路线（编号 + 置顶标签 + 日期）、分页 |
| 文章列表 | `blog.html` | Wiki 式列表行：标题 / 摘要 / 日期 · 分类 · 阅读时长；右栏按分类 |
| 文章详情 | `post.html` | 步骤式页头（分类 · 日期 · 阅读时长 + 阅读进度条 + 徽标）、正文、反馈条、上下篇、评论、右侧目录（窄屏折叠到正文上方） |
| 归档 | `archives.html` | 按年分组，月-日等宽编号；右栏年份目录 |
| 闪念 | `memos.html` | 一年热力图 + 闪念卡片；右栏按月份 |
| 标签列表 | `tags.html` | 标签方格 + 篇数 |
| 标签详情 | `tag.html` | 当前标签下的文章 + 分页；右栏其他标签 |
| 分类列表 | `categories.html` | 分类卡片（支持 Gridea Pro 分类封面） |
| 分类详情 | `category.html` | 分类封面 + 描述 + 文章 + 分页 |
| 友链 | `links.html` | 双列友链卡片 + 申请说明 + 评论 |
| 关于 | `about.html` | 渲染文件名为 `about` 的文章，头像 + 正文 + 评论 |
| 404 | `404.html` | 回首页 / 搜索全站 |

## 组件

| 组件 | 文件 | 说明 |
|------|------|------|
| 顶栏 | `partials/header.html` | 站名、搜索框、外观切换、附加链接、GitHub |
| 左侧目录 | `partials/sidebar.html` | 菜单（Lucide 图标 + 外链标记，行高更宽松）、分类（编号 + 篇数）、标签（默认展开、`#` 前缀 + 篇数）；当前页自动高亮，窄屏变抽屉 |
| 搜索 | `partials/search.html` + `site.js` | ⌘K / Ctrl K / `/` 唤起，数据来自引擎自动生成的 `/api/search.json` |
| 分页 | `partials/pagination.html` | 上一页 / 第 x / y 页 / 下一页 |
| 文章列表 | `partials/post-list.html` | 博客 / 标签 / 分类页共用；整行可点，悬停给底色 |
| 上下篇 | `partials/post-nav.html` | 左「上一篇 · 更早」右「下一篇 · 更新」 |
| 闪念热力图 | `partials/heatmap.html` | 53 周 × 7 天，格子随宽度自适应，悬停显示当天条数 |
| 评论 | `partials/comments.html` + `comment-*.html` | 见下 |
| 页脚 | `partials/footer.html` | 自定义文字 → 站点页脚信息 → 默认版权行 |

## 评论

直接读取 Gridea Pro「评论设置」，支持全部 7 个平台：**Valine、Waline、Twikoo、Gitalk、Giscus、Disqus、Cusdis**。

- 七个平台共用一个外壳，`assets/styles/comments.css` 把输入框、按钮、评论卡片统一到主题令牌（直角、细线、墨色主按钮），深浅模式都适配
- Giscus / Cusdis / Disqus 切换外观时同步主题；Waline 用原生暗色选择器
- 评论脚本在评论区接近视口时才加载，不拖慢正文
- 评论区出现在文章页、关于页、友链页（友链页可关）

## 自定义参数

| 分组 | 参数 | 说明 |
|------|------|------|
| 基础 | 顶栏站名 / Logo / Favicon / GitHub / 附加链接 / 左侧菜单标题 / 页脚文字 | 留空均有合理默认；页脚默认居中显示「© 年份 站名 · 保留所有权利 · 由 Gridea Pro 驱动」 |
| 外观 | 默认外观、圆角、强调色 | 强调色留空即原站墨色；填色后深色模式自动换算对比度 |
| 首页 | 大标题、引言、主次按钮、**推荐阅读**（开关 / 标题 / 说明 / 数量 3·4·6·8 / 每行 `文章标题\|文章链接`，可选第三段 `封面地址`）、文章列表标题 | 数量决定卡片总数与每行个数：3、6 一行 3 个，4、8 一行 4 个 |
| 文章 | 右侧目录、阅读进度条、代码复制按钮、文末反馈条 | |
| 闪念 / 友链 / 关于 | 说明文字、热力图、申请友链说明、友链页评论、关于页默认内容 | |
| 高级 | 头部注入、自定义 CSS、底部注入 | |

> 外观类参数用 `xui` 前缀命名（`xuiAccentColor`、`xuiAppearance`、`xuiCorners`、`xuiCustomCss`）：Gridea Pro 的主题参数是全站共用一张表，换主题时同名参数会被沿用，加前缀可避免继承其他主题的配色。

## 实现说明

- 文章目录：Gridea Pro 当前不生成 `post.toc`，主题在前端从正文 h1~h4 生成，按最浅一级归一成 4 层缩进；不足两个小标题时整列让给正文；窄屏同一份数据折叠到正文上方
- 推荐阅读：设置里的标题 / 链接由服务端渲染；封面、摘要、发布时间、分类、阅读时长先在本页文章里匹配，匹配不到时由前端读取 `/archives/` 上每篇文章的 `data-post-*` 补全，所以推荐任意一篇文章都能显示完整卡片
- 字体与字号：全站使用系统字体栈（SF / 苹方 / Segoe UI / 微软雅黑 / 思源黑体），正文 16px / 1.9、字距 0.01em，标题 24 / 20 / 17px 递减；正文加粗（600）永远小于三级标题
- 图标：`assets/xxd/icons.js` 换成 Lucide 图标集，对外接口与原 `@xxd/icons` 一致（`data-xxd-icon` 用法不变）
- 代码块：前端包装为原站的代码卡片（语言名 + 复制按钮），常见语言用 xxd 自带高亮
- 搜索高亮：命令面板每次重绘后用 `MutationObserver` 把命中的关键词包进 `<mark class="search-hit">`（亮黄色，深浅模式都保持墨色字）
- 分类总览页依赖 Gridea Pro 新版（提供 `categories` 变量与 `/categories/` 页面）

## 致谢

- 设计与 xxd 设计系统：[小小东](https://xiaoxiaodong.ai)（MIT）
- 参考：[MHSanaei/3x-ui](https://github.com/MHSanaei/3x-ui)、[nevertoday/xiaoxiaodong-vps](https://github.com/nevertoday/xiaoxiaodong-vps)

MIT License
