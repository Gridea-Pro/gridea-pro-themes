# Neptune — 沉浸深度阅读主题

窄栏大字号 · 专注排版 · 长文舒适度优先

## 设计理念

Neptune 专为长文阅读优化，采用窄版内容区域（720px）、18px 大字号、1.9 倍行高，配合衬线字体 Noto Serif SC，营造沉浸、宁静的深阅读体验。阅读进度条和预估阅读时间帮助读者掌握阅读节奏。灵感源自海王星的深邃海洋。

## 配色

| 模式 | 背景 | 强调色 | 文字 |
|------|------|--------|------|
| 亮色 | #f8fafc（冷白） | #0c2340（深海军蓝） | #334155 |
| 暗色 | #0b1121（深海蓝） | #3b82f6（海洋蓝） | #e2e8f0 |

## 自定义配置

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `accentColor` | input | 强调色 | `#0c2340` |
| `contentWidth` | select | 内容宽度 (narrow/medium) | `narrow` |
| `fontSize` | select | 正文字号 (normal/large/x-large) | `large` |
| `showReadingProgress` | toggle | 显示阅读进度条 | `true` |
| `showEstimatedReadingTime` | toggle | 显示预估阅读时间 | `true` |
| `showDarkModeToggle` | toggle | 显示暗色模式切换 | `true` |
| `showSidebar` | toggle | 显示侧边栏 | `false` |
| `showTagsInPost` | toggle | 文章底部显示标签 | `true` |
| `showPostNav` | toggle | 显示上下篇导航 | `true` |
| `socialGithub` | input | GitHub 用户名 | `""` |
| `socialTwitter` | input | Twitter 用户名 | `""` |
| `footerText` | input | 页脚自定义文字 | `""` |
| `customCSS` | textarea | 自定义 CSS | `""` |

## 安装

1. 将 `neptune` 文件夹复制到 Gridea Pro 的 `themes/` 目录
2. 在管理后台的「主题」中选择 Neptune
3. 按需设置外观选项

## 许可

CC BY-NC-SA 4.0
