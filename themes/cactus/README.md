# Cactus

> 🌵 优雅简洁的暗色 Hacker 风 Gridea Pro 主题。等宽字体、仙人掌绿点缀、`#` 前缀标题。

复刻自 [Seevil/cactus](https://github.com/Seevil/cactus)（Typecho 主题），其原版又移植自 [probberechts/hexo-theme-cactus](https://github.com/probberechts/hexo-theme-cactus)（Hexo 主题）。

本仓库版本：1.0.0

## 信息

- **主题名称**：Cactus
- **模板引擎**：Jinja2 (Pongo2)
- **作者**：Seevil（Typecho 原作者）/ probberechts（Hexo 原作者）/ Gridea Pro 社区（Jinja2 移植）
- **许可证**：MIT（见 `LICENSE`）

## 特性

- ✅ 暗色（默认）/ 亮色双主题，CSS 变量驱动，本地持久化
- ✅ 全部 Gridea Pro 标准页面：index / blog / post / archives / tag / tags / memos / links / about / 404
- ✅ 文章页右上浮动菜单：搜索、上一篇/下一篇、TOC、分享、回顶部
- ✅ 移动端底部 fixed bar，触屏导航更顺手
- ✅ Hero 打字机动画（轻量自实现，无 typed.js 依赖）
- ✅ 闪念热力图（53 周 × 7 天，GitHub 风）
- ✅ 全局搜索：本地 JSON 索引（高亮匹配）/ Google / Bing 三选一
- ✅ 评论组件接入 Gridea Pro 标准挂载点 `#gridea-comments`，用户在应用里配 Disqus / Twikoo / Waline / Gitalk 即用
- ✅ 代码块自动复制按钮、图片懒加载、`#` 前缀 h2、链接的渐变下划线
- ✅ 不依赖 jQuery / FontAwesome / 任何外部字体，纯 vanilla JS + 内联 SVG 图标

## 使用

1. 在 Gridea Pro 应用进入「主题」页面
2. 选择 Cactus，根据「主题设置」面板调整：
    - **基础设置**：站点 Logo
    - **外观**：主题模式（暗/亮/跟随系统）、强调色
    - **首页**：Hero 介绍 / 打字机句子 / Writing 区 / Projects 列表
    - **社交**：每行 `图标名|链接`，支持 github / twitter / weibo / email / rss / linkedin / mastodon / bilibili / zhihu
    - **功能**：搜索开关、搜索提供方
    - **文章**：TOC / 分享 / 上下篇 / 阅读时间字数
    - **闪念**：闪念页标题、热力图开关
    - **页脚**：版权文字、备案号
    - **高级**：自定义 CSS / 统计代码

## 目录约定与限制

| 项目 | 说明 |
|---|---|
| 「分类」 | Gridea Pro 数据模型只有 tags，没有独立的 categories。本主题把 `/tags` 兼任「Tags & Categories」入口 |
| 搜索 JSON | 本地搜索默认请求 `/search.json`。若 Gridea Pro 未生成该文件，可在配置里改用 Google / Bing 兜底 |
| 上下篇 | 通过 fetch `/index.json` 注入，若该文件不存在则不显示，不报错 |
| 评论 | 仅提供 `#gridea-comments` 挂载点，具体服务在 Gridea Pro 全局评论设置里选 |

## 截图

预览图位于 `assets/media/preview.png`（待补）。

## 致谢

- [probberechts/hexo-theme-cactus](https://github.com/probberechts/hexo-theme-cactus) — Hexo 原版作者
- [Seevil/cactus](https://github.com/Seevil/cactus) — Typecho 移植作者
- Gridea Pro 社区贡献者
