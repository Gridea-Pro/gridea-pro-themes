# Mango · Gridea Pro 主题

> 芒果主题，移植自 Typecho 主题 [jkjoy/Typecho-Theme-Mango](https://github.com/jkjoy/Typecho-Theme-Mango)（原作者 老孙 / HUiTHEME）。
> Demo: <https://mango.imsun.org>

双栏布局，明亮干净，自带推荐位轮播 / 多图卡片 / 闪念热力图 / 全屏搜索 / 暗色模式 / 霞鹜文楷可选，全方位适配 PC + 移动端。

## 截图

![preview](./assets/media/preview.png)

## 特性

- **完整页面**：首页 / 博客列表 / 文章详情 / 归档 / 闪念 / 标签 / 单标签 / 友链 / 关于 / 404
- **暗色模式**：跟随系统时间自动切换（6:00–18:00 浅色，其余深色），用户手动覆盖后持久化
- **全屏搜索**：基于本地 `/atom.xml` 的实时关键词匹配，支持标题 / 标签 / 摘要全文搜索
- **推荐位轮播**：首页顶部按指定标签筛选文章作为轮播图
- **闪念热力图**：仿 GitHub 风格的 53 周 × 7 天发文热力图
- **客户端 TOC**：文章详情页自动从正文 h2 / h3 解析目录，含 sticky scroll-spy
- **阅读进度条**：仅长文（≥ 1.5 屏）启用
- **代码块复制**：自动注入 Copy 按钮 + 语言标签
- **多图卡片**：列表卡片支持单图缩略图，集成 fancybox 灯箱
- **响应式**：全面适配 PC 和移动端，PC 1230 容器，992 切换汉堡菜单，768 卡片紧凑
- **自定义评论**：UI 完整保留，挂载点为 Gridea Pro 标准的 `#gridea-comments` 容器，可自由接 Disqus / Waline / Twikoo / Giscus / Artalk

## 配置项一览

主题设置面板分 7 个分组，共 27 个配置项：

| 分组 | 配置项 | 说明 |
|------|--------|------|
| 基础设置 | subTitle / footerCopyright / icpBeian | 副标题 / 页脚版权 / 备案号 |
| 外观设置 | primaryColor / accentColor / defaultTheme / useLxgwFont | 主色 / 辅色 / 默认主题模式 / 霞鹜文楷开关 |
| 首页设置 | featuredTag / featuredCount / showFooterLinks | 推荐位标签 / 推荐位数量 / 友链条 |
| 侧栏设置 | showSidebarRecent / showSidebarHot / showSidebarToc / showSidebarTags / sidebarRecentCount / sidebarHotCount / sidebarTagsCount | 各个侧栏 widget 开关与数量 |
| 增强功能 | showCodeCopy / showReadingProgress / showBackToTop / enableSearch | 增强组件开关 |
| 闪念页 | memosTagName / memosShowHeatmap | 闪念页 tag 名 / 热力图开关 |
| 高级注入 | viewsScript / headInjection / footerInjection / customCss | 浏览数代码 / head 注入 / body 末尾注入 / 自定义 CSS |

## 安装

1. 把 `themes/mango/` 整个目录放到 Gridea Pro 的主题文件夹下
2. 在 Gridea Pro 中切换到 Mango 主题
3. 进入「主题设置」配置上述参数（默认值已可用，无需额外配置）

## 评论系统接入

主题不内置评论后端，挂载点为 `<div id="gridea-comments">`。
在「主题设置 → 高级注入 → `<body>` 末尾注入代码」中加载评论组件即可，例如 Waline：

```html
<script type="module">
  import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';
  init({
    el: '#gridea-comments',
    serverURL: 'https://your-waline-server.example',
  });
</script>
<link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css">
```

或 Giscus / Twikoo / Artalk 同理，把 `el` 指到 `#gridea-comments` 即可。

## 浏览数

默认接入了不蒜子（busuanzi），用 `#busuanzi_value_page_pv` 占位。如要换成 Umami / Plausible，在「浏览数统计代码」里替换为对应代码即可，并相应调整 selector。

## 闪念页

闪念页（`/memos/`）默认从带 `memo` 标签的文章里取条目。可在「主题设置 → 闪念页 → memosTagName」修改 tag 名。

## 视觉来源

- 整体布局、组件 class 名、CSS 设计 token：与原 Typecho 主题 100% 一致
- `style.css` 直接全量复制原主题（保证 100% 视觉复刻），仅追加少量 Gridea Pro 专有组件样式
- `main.js` 重写：去除 ajax 加载更多 / 后端点赞 / 数据库查询，改为静态站友好的实现

## 致谢

- 原作者：[老孙](https://www.imsun.org) & [HUiTHEME](https://huitheme.com)
- 原仓库：<https://github.com/jkjoy/Typecho-Theme-Mango>

## License

MIT — 见 [LICENSE](./LICENSE) 文件。
