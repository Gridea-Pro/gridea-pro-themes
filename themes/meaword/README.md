# MeaWord — Gridea Pro 主题

> 💖 文字本身就已经很美了

**MeaWord** 是从 Typecho 主题 [Meayair/Typecho-Theme-MeaWord](https://github.com/Meayair/Typecho-Theme-MeaWord)（作者 [Meayair](https://github.com/Meayair)，演示站 [黑白阁](https://www.bawge.com/)）100% 视觉复刻、完全转译为 Jinja2 (Pongo2) 语法的 Gridea Pro 主题。

主题保留了原作所有标志性视觉元素：

- **暖陶色 + 米色亚麻底纹**（`#b95d40` + `#e6dece`），所有元素围绕这两个 CSS 变量展开
- **粘贴白纸卡片**：内容包裹在带纸纹理的白色 `post-box` 里，悬浮于条纹背景之上
- **巨型首字水印**：每张文章卡片左侧都有取自标题首字的巨大半透字符作为底纹（`post_beici`）
- **黏屁股 Header**：跟随滚动的 sticky 顶栏，主题色铺底
- **轮播 Banner**：首页顶部 3 张大型轮播
- **大日期闪念条**：闪念分类下的文章用「30 / Sep」大数字日期 + 灰色话泡条样式
- **macOS 红黄绿小圆点代码块**：每个 `<pre>` 顶部 3 个红黄绿小圆点
- **粘贴感引言**：`<blockquote>` 圆形引号气泡 + 5px 投影
- **带 Beici 大数字的上下篇**：上下篇导航也带巨型水印数字

## Gridea Pro 适配补全

原主题专注列表 + 详情页，本移植版补全了 Gridea Pro 的全套页面：

| 页面 | 文件 | 说明 |
|------|------|------|
| 首页 | `templates/index.html` | 轮播 Banner + 文章列表 + 分页 |
| 博客列表 | `templates/blog.html` | 同首页结构，但无 Banner |
| 文章详情 | `templates/post.html` | 标题首字水印 + 正文 + 标签 + 上下篇 + 评论 |
| 归档 | `templates/archives.html` | 标签云 + 分类云 + 按年分组的归档列表 |
| 闪念 | `templates/memos.html` | 大日期闪念条 + 53×7 热力图 |
| 标签列表 | `templates/tags.html` | 同时展示全部标签云和分类云 |
| 标签详情 | `templates/tag.html` | 单个标签下的文章列表 |
| 分类详情 | `templates/category.html` | 单个分类下的文章列表 |
| 友情链接 | `templates/links.html` | 卡片式友链布局 |
| 关于 | `templates/about.html` | 关于页 |
| 404 | `templates/404.html` | 错误页 + 搜索框 |

> 🛈 Gridea Pro 引擎不会自动渲染 `categories.html`（没有这个入口）。如果你的菜单想链接到「全站分类索引」，请把菜单链接指向 `/tags/`——`tags.html` 同时展示标签和分类。

## 组件

| 组件 | 文件 | 说明 |
|------|------|------|
| Header | `partials/header.html` | 顶部 sticky 导航，主题色背景 |
| 移动端侧栏 | `partials/sidebar.html` | 右侧 offcanvas 抽屉（分类 + 页面菜单） |
| Footer | `partials/footer.html` | 米色底纹 + 版权 + 备案号 |
| 文章卡片 | `partials/post-card.html` | 带首字水印 / cover 切换的列表项 |
| 闪念条 | `partials/memo-card.html` | 大日期 + 灰色话泡条 |
| 分页 | `partials/pagination.html` | 首页 / 博客 / 标签 / 分类页通用分页条 |
| 上下篇 | `partials/post-nav.html` | 文章详情页上下篇 |
| 评论挂载点 | `partials/comments.html` | `#gridea-comments` 标准挂载点（接 Gridea Pro 全局评论组件） |
| 全屏搜索 | `partials/search-modal.html` | 全屏蒙版搜索（fetch `/api/search.json`） |
| 热力图 | `partials/heatmap.html` | 53 周 × 7 天发布频率图 |

## 深浅模式

主题原生支持四种 `themeMode` 设置：

- `auto`：跟随系统 `prefers-color-scheme`
- `light`：始终浅色（暖纸）
- `dark`：始终深色（夜读墨色 #191919）
- `user`：由读者点击灯泡按钮切换，记住偏好

防闪暗色脚本在 CSS 加载前根据 localStorage / 系统偏好预设 `data-theme="dark"`，确保不会出现白闪。

## 全局搜索

顶栏搜索按钮 / 按 `/` 键唤起全屏搜索 modal，背后 fetch Gridea Pro 引擎自动产出的 `/api/search.json`，零依赖。

## 评论

主题保留原作的评论 UI 配色（陶色按钮 / 米色输入框 / 圆形头像），但底层逻辑接入 Gridea Pro 的标准评论挂载点 `#gridea-comments`。

启用方式：在 Gridea Pro「评论设置」里选择评论平台（Disqus / Gitalk / Waline / 等），保存即可。主题不需要任何额外改动。

## 自定义配置

在 Gridea Pro「主题」→「主题设置」中可调：

- 主题色（暖陶色 / 自定义）
- 背景米色（亚麻底色 / 自定义）
- 字体栈
- 是否显示首页 Banner、Banner 取最近 N 篇
- 闪念分类 slug、是否显示热力图
- 全局搜索 / 回顶按钮 / 阅读进度条 / 代码复制 / 文章 TOC 开关
- 页脚起始年份 / 备案号 / 自定义 HTML
- 自定义 CSS / head HTML / body 末尾 HTML

## 致谢

- 原作主题：[Meayair/Typecho-Theme-MeaWord](https://github.com/Meayair/Typecho-Theme-MeaWord)（[Meayair](https://github.com/Meayair)，2.0.1，MIT License）
- 演示站：[黑白阁](https://www.bawge.com/)
- Bootstrap Icons：图标系统沿用，但本移植版剥离了 Bootstrap CSS / JS 依赖，所有 UI 由原生 CSS / JS 实现

## License

MIT，沿用原作 License。详见 [LICENSE](./LICENSE)。

- Original Copyright (c) Meayair（Typecho-Theme-MeaWord）
- Port Copyright (c) Eric（Gridea Pro 移植版）
