# Liushen — Gridea Pro 主题

> 100% 视觉复刻自 [willow-god/hexo-theme-liushen](https://github.com/willow-god/hexo-theme-liushen) ，由 [@willow-god](https://github.com/willow-god) 创作。本主题为 Gridea Pro 移植版本，保持原版"清羽飞扬"的粉蓝渐变 + 半透明卡片视觉，并按 Gridea Pro 的能力做了合理裁剪。

演示站参考：<https://blog.liushen.fun>

## 视觉特征

- **首页全屏 banner**：标题 + 打字机副标题 + 社交图标 + SVG 波浪过渡
- **粉蓝渐变侧栏 widget**：半透明卡片 + 12px 圆角
- **多级 dropdown 顶栏菜单**：支持二级菜单分组（通过 `navMenuJson` 配置）
- **暗色模式**：支持 `auto / light / dark` 三档，`auto` 模式 6:00-18:00 自动切换
- **完整响应式**：≥1200 / ≥992 / ≥768 / 移动端四档断点

## 包含页面

| 页面 | 模板 |
| --- | --- |
| 首页 | `index.html`（含全屏 banner） |
| 博客列表 | `blog.html` |
| 文章详情 | `post.html`（顶图 + meta + 上下篇 + 评论） |
| 时光卷轴（归档） | `archives.html` |
| 标签 / 标签云 | `tag.html` / `tags.html` |
| 分类 / 分类列表 | `category.html` / `categories.html` |
| 关于（站长资料） | `about.html` |
| 友链 | `links.html` |
| 日常说说（闪念 + 热力图） | `memos.html` |
| 404 | `404.html` |

## 内置组件

- 全屏搜索（fuse.js 客户端，无依赖第三方搜索服务）
- 文章详情上下篇（客户端 `atom.xml` 索引推断）
- 客户端 TOC（解析正文 h2/h3）
- 阅读进度条（顶部）
- 代码块复制按钮
- 回到顶部
- 闪念热力图（仿 GitHub）
- 评论挂载点 `<div id="gridea-comments">`，由 Gridea Pro 标准评论服务接管

## 自定义配置

打开 Gridea Pro 主题设置面板，按分组配置：

- **基础**：站点大标题、打字机副标题、滚动箭头
- **外观**：主色 / 强调色 / 字体 / 圆角 / 渐变 / 背景图 / 默认顶图 / 默认配色模式
- **首页**：全屏 banner / 卡片布局 / 摘要长度
- **侧栏**：作者卡 / 公告 / 欢迎卡 / 最新文章 / 分类 / 标签云 / 归档 / 网站统计 / 建站时间
- **增强**：顶栏菜单 JSON / SVG 波浪 / 搜索 / TOC / 阅读进度 / 代码复制 / 回到顶部 / 友链接力 / 访问统计
- **闪念**：顶图 / 热力图开关
- **社交**：邮箱 / QQ / GitHub / 微博 / B 站 / RSS
- **页脚**：版权 / 备案 / 附加 HTML
- **高级**：FontAwesome CDN / 注入 head / 注入 body / 自定义 CSS / JS

## 致谢

- 视觉原型：[willow-god/hexo-theme-liushen](https://github.com/willow-god/hexo-theme-liushen)（Apache-2.0）
- 上游灵感：[Butterfly](https://butterfly.js.org/)

## 许可

Apache License 2.0，沿用上游许可。
