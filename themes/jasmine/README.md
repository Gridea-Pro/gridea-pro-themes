# Jasmine — Gridea Pro 主题

> 100% 视觉复刻自 [liaocp666/Jasmine](https://github.com/liaocp666/Jasmine)（Typecho 主题，作者 Kent Liao），由 Gridea Pro 主题团队移植到 Jinja2 模板引擎。原作官网 <https://www.sanji.one>。

Bootstrap 5 + Tabler Icons + MiSans VF + 三栏极简布局，蓝色主色 + 链接下划线高亮条是它的标志性视觉。

## 视觉特征

- **三栏布局**：左 `col-1` 图标导航 + 中 `col-8` 内容（含 sticky navbar）+ 右 `col-3` widgets
- **圆角阴影中央容器**：`.container.bg-body.rounded.shadow-sm`
- **主色 / 暗色双套**：基于 `[data-bs-theme]` 切换，沿用原主题的 localStorage key
- **链接 hover 高亮条**：`box-shadow: 0 -6px 0 0 rgba(主色, .2) inset` —— 标志性细节
- **MiSans VF**：通过 CDN 加载，可在 customConfig 关闭

## 包含页面

| 页面 | 模板 |
| --- | --- |
| 首页 | `index.html` |
| 博客列表 | `blog.html` |
| 文章详情 | `post.html`（顶部 TOC、底部上下篇 + 评论） |
| 归档 | `archives.html`（按年份分组时间线） |
| 标签 / 标签云 | `tag.html` / `tags.html` |
| 分类 / 分类列表 | `category.html` / `categories.html` |
| 友情链接 | `links.html` |
| 关于 | `about.html` |
| 闪念（含热力图） | `memos.html` |
| 404 | `404.html` |

## 内置组件

- 全屏搜索（点顶栏图标 / `Cmd/Ctrl+K`，客户端索引）
- 客户端 TOC（解析正文 h1-h6，仿原主题 `generateToc`）
- 文章上下篇（客户端从 search-index 推断）
- 代码块复制按钮 + Prism 风格暗色高亮
- 移动端 offcanvas 抽屉菜单
- 评论挂载 `<div id="gridea-comments">`，由 Gridea Pro 标准评论服务接管
- 闪念热力图（仿 GitHub）

## 自定义配置

在 Gridea Pro 主题设置面板按分组配置：

- **基础**：站点 Logo
- **外观**：主色 / 主色透明度 / 浅色背景 / 深色背景 / 字体 / MiSans CDN / 默认配色
- **首页**：文章布局（标准 / 闪念风）/ 卡片缩略图开关
- **顶栏**：左竖栏开关 / 全局搜索
- **侧栏**：站点描述 / 最近文章 / 热门标签 / 友链 / 网站链接（RSS / Sitemap）—— 每项独立开关
- **增强**：TOC / 阅读进度 / 代码复制 / 回到顶部 / 访问统计
- **闪念**：顶图 / 热力图开关
- **页脚**：附加 HTML / 备案
- **高级**：注入 head / body / 自定义 CSS / JS

## 致谢

- 视觉原型：[liaocp666/Jasmine](https://github.com/liaocp666/Jasmine)（GPL-3.0）
- 视觉栈：[Bootstrap 5](https://getbootstrap.com/) + [Tabler Icons](https://tabler.io/icons) + [MiSans](https://hyperos.mi.com/font)

## 许可

GPL-3.0，沿用上游许可。
