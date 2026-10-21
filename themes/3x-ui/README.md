# 3x-ui — Gridea Pro 主题

> 黑 / 白 / 灰，秩序，内容优先。

**3x-ui** 视觉复刻自 3x-ui / Xray 部署教程站 [小小东 VPS 教程](https://vps.xiaoxiaodong.ai)（源码 [nevertoday/xiaoxiaodong-vps](https://github.com/nevertoday/xiaoxiaodong-vps)，MIT），完全转译为 Gridea Pro 的 Jinja2 (Pongo2) 主题。原站是文档站，本主题把它的设计语言搬到博客上：

- **xxd 设计系统原样沿用**（`assets/xxd/`，MIT）：暖白纸 `#fdfcfb` / 暖黑 `#171612`、墨色强调、默认直角、只用系统字体
- **三栏文档站布局**：56px 毛玻璃顶栏 + 248px 左侧目录 + 760px 正文 + 200px「本页」目录
- **首页**：大标题 + 引言 + 主次按钮、招牌「一张图看懂」三格流程图、编号文章路线、分类双列卡片
- **⌘K 命令面板搜索**：全文搜索文章，也能跳页面、分类、标签
- **浅色 / 深色 / 跟随系统** 三态分段切换，首帧前写入，无闪屏

## 页面

| 页面 | 模板 | 说明 |
|------|------|------|
| 首页 | `index.html` | 大标题、流程图、文章路线（编号 + 日期）、分页、分类卡片 |
| 文章列表 | `blog.html` | Wiki 式列表行：标题 / 摘要 / 日期 · 分类 · 阅读时长；右栏按分类 |
| 文章详情 | `post.html` | 步骤式页头（分类 · 日期 · 阅读时长 + 阅读进度条 + 徽标）、正文、反馈条、上下篇、评论、右侧目录 |
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
| 左侧目录 | `partials/sidebar.html` | 导航菜单（含子菜单 / 外链）、分类（编号 + 篇数）、可折叠标签；当前页自动高亮，窄屏变抽屉 |
| 搜索 | `partials/search.html` + `site.js` | ⌘K / Ctrl K / `/` 唤起，数据来自引擎自动生成的 `/api/search.json` |
| 分页 | `partials/pagination.html` | 上一页 / 第 x / y 页 / 下一页 |
| 文章列表 | `partials/post-list.html` | 博客 / 标签 / 分类页共用 |
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
| 基础 | 顶栏站名 / Logo / Favicon / GitHub / 附加链接 / 页脚文字 | 留空均有合理默认 |
| 外观 | 默认外观、圆角、强调色 | 强调色留空即原站墨色；填色后深色模式自动换算对比度 |
| 首页 | 大标题、引言、主次按钮、流程图（每行 `图标\|标题\|描述\|箭头文字`）、文章列表标题、分类卡片 | |
| 文章 | 右侧目录、阅读进度条、代码复制按钮、文末反馈条 | |
| 闪念 / 友链 / 关于 | 说明文字、热力图、申请友链说明、友链页评论、关于页默认内容 | |
| 高级 | 头部注入、自定义 CSS、底部注入 | |

> 外观类参数用 `xui` 前缀命名（`xuiAccentColor`、`xuiAppearance`、`xuiCorners`、`xuiCustomCss`）：Gridea Pro 的主题参数是全站共用一张表，换主题时同名参数会被沿用，加前缀可避免继承其他主题的配色。

## 实现说明

- 文章目录：Gridea Pro 当前不生成 `post.toc`，主题在前端从正文 h2 / h3 生成；引擎以后提供时自动优先使用
- 代码块：前端包装为原站的代码卡片（语言名 + 复制按钮），常见语言用 xxd 自带高亮
- 分类总览页依赖 Gridea Pro 新版（提供 `categories` 变量与 `/categories/` 页面）

## 致谢

- 设计与 xxd 设计系统：[小小东](https://xiaoxiaodong.ai)（MIT）
- 参考：[MHSanaei/3x-ui](https://github.com/MHSanaei/3x-ui)、[nevertoday/xiaoxiaodong-vps](https://github.com/nevertoday/xiaoxiaodong-vps)

MIT License
