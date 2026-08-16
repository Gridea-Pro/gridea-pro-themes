# Fluid — Gridea Pro 主题

> Material Design 风的 Gridea Pro 移植版

**Fluid** 是从 Hexo 主题 [fluid-dev/hexo-theme-fluid](https://github.com/fluid-dev/hexo-theme-fluid)（演示站 [hexo.fluid-dev.com](https://hexo.fluid-dev.com)）100% 视觉复刻、完全转译为 Jinja2 (Pongo2) 语法的 Gridea Pro 主题。

## 视觉签名

主题保留了原 Fluid 所有标志性视觉元素：

- **全屏 hero banner** + 黑色蒙版（透明度可调），默认占满 100vh
- **typed.js 风格副标题打字机**：副标题 / 多句循环，可关
- **底部向下滚动箭头**：banner 底部居中，bouncing 动画
- **透明转白固定顶栏**：navbar 在 banner 之上时透明，滚动后浮起为深蓝灰底
- **"汉堡 → X"开合三杠**：移动端 navbar-toggler 三条横线动画切换
- **移动端九宫格菜单**：替代桌面端折叠菜单的全屏九宫格 overlay
- **圆角白色卡片 (.board)**：所有页面内容包裹在白色圆角阴影卡片内，悬浮于 banner 下方
- **Index 行卡片**：左图 + 右文（带 description）的 list-item，hover 升起
- **Jellybean 彩色标签**：post 详情页底部和侧栏的 `#tag-name` 文字标签
- **Iconfont 图标**：日历、分类、标签、搜索、月亮、向上箭头、向下箭头
- **回顶按钮**：白底圆角小按钮，悬浮右下，hover 时图标 bounce
- **暗色模式**：全套深蓝灰配色（body `#181c27` / board `#252d38` / 文字 `#c4c6c9`）+ 月亮 / 太阳图标切换

## Gridea Pro 适配补全

原 Fluid 是 Hexo 主题，本移植版补全了 Gridea Pro 的全套页面：

| 页面 | 文件 | 说明 |
|------|------|------|
| 首页 | `templates/index.html` | Hero banner + Index 行卡片 + 分页 |
| 博客列表 | `templates/blog.html` | 内页 banner + 行卡片列表 + 分页 |
| 文章详情 | `templates/post.html` | 文章 banner（标题作 hero）+ meta-top + 正文 + meta-bottom + 上下篇 + 评论 |
| 归档 | `templates/archives.html` | 内页 banner + 按年分组的时间线归档 |
| 闪念 | `templates/memos.html` | 53×7 热力图 + 闪念条 |
| 标签列表 | `templates/tags.html` | 全部标签 cloud + 全部分类 cloud |
| 标签详情 | `templates/tag.html` | 该标签下的文章列表 |
| 分类详情 | `templates/category.html` | 该分类下的文章列表 |
| 友情链接 | `templates/links.html` | 圆角卡片网格友链 |
| 关于 | `templates/about.html` | 圆形头像 + 个人介绍 |
| 404 | `templates/404.html` | 错误页 + 搜索框 |

> 🛈 Gridea Pro 引擎不会自动渲染 `categories.html`。需要「全站分类索引」时把菜单链接指向 `/tags/`，`tags.html` 同时展示标签和分类（fetch /atom.xml 客户端聚合）。

## 组件

| 组件 | 文件 | 说明 |
|------|------|------|
| Header（导航栏） | `partials/header.html` | fixed-top 透明 navbar + brand + 主导航 + 搜索 / 主题切换图标 |
| Hero Banner | `partials/banner.html` | 全屏背景图 + 黑色蒙版 + 居中标题 / 副标题 + 向下箭头 |
| 移动端九宫格 | `partials/mobile-grid.html` | 移动端打开 navbar 后展开的九宫格菜单 |
| Footer | `partials/footer.html` | 简约版权 + 备案号 + busuanzi |
| 文章卡片 | `partials/post-card.html` | Index 风行式卡片（左图右文） |
| 闪念条 | （内联在 memos.html）| 大日期 + 灰色卡片 |
| 分页 | `partials/pagination.html` | 圆角胶囊上一页 / 下一页 |
| 上下篇 | `partials/post-nav.html` | 文章详情页上下篇导航 |
| 评论挂载点 | `partials/comments.html` | `#gridea-comments` 标准挂载点（接 Gridea Pro 全局评论组件） |
| 全屏搜索 | `partials/search-modal.html` | 全屏蒙版搜索（fetch `/api/search.json`） |
| 热力图 | `partials/heatmap.html` | 53 周 × 7 天发布频率图 |

## 深浅模式

- `auto` — 跟随系统 `prefers-color-scheme`
- `light` — 始终浅色
- `dark` — 始终深色（深蓝灰 #181c27 / 卡片 #252d38）
- `user` — 由读者点击月亮 / 太阳按钮切换，记住偏好（`localStorage`）

防闪暗色脚本在 CSS 加载前根据 `localStorage` / 系统偏好预设 `data-user-color-scheme="dark"`，确保不会出现白闪。

## 全局搜索

顶栏搜索按钮 / 按 `/` 键 / `Cmd+K` 唤起全屏搜索 modal，背后 fetch Gridea Pro 引擎自动产出的 `/api/search.json`，零依赖。

## 评论

主题保留 Fluid 原版评论 UI 配色（白底圆角卡片 + 简洁 input），但底层逻辑接入 Gridea Pro 标准评论挂载点 `#gridea-comments`。

启用方式：在 Gridea Pro「评论设置」里选择评论平台（Disqus / Gitalk / Waline / 等），保存即可。主题不需要任何额外改动。

## 自定义配置

在 Gridea Pro「主题」→「主题设置」可调：

- 主题色（链接 hover、激活态）/ navbar 底色 / 卡片底色（浅 / 深）/ 字体栈
- Hero banner 默认图、随机图列表（每行一个 URL）、高度（vh）、蒙版透明度
- typed.js 副标题打字机开关、循环句子（每行一句）
- 内页 banner 图、内页 banner 高度
- 闪念分类 slug、热力图开关
- 全局搜索 / 回顶 / 进度条 / 代码复制 / TOC / 元信息开关
- 页脚起始年份 / 备案号 / 自定义 HTML / 不蒜子统计
- 自定义 CSS / head HTML / body 末尾 HTML

## 致谢

- 原作主题：[fluid-dev/hexo-theme-fluid](https://github.com/fluid-dev/hexo-theme-fluid)（[fluid-dev](https://github.com/fluid-dev) 团队，MIT License）
- 演示站：[hexo.fluid-dev.com](https://hexo.fluid-dev.com)
- 本移植版**剥离了**原版的 jQuery / Bootstrap / Animate.css / typed.js / nprogress 等 5 个依赖库，全部 UI 和动效由原生 CSS / JS 实现，**零运行时依赖**

## License

MIT，沿用原作 License。详见 [LICENSE](./LICENSE)。

- Original Copyright (c) fluid-dev (Hexo Theme Fluid)
- Port Copyright (c) Eric (Gridea Pro Jinja2 port)
