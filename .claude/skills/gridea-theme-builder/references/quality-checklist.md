# 主题发布前质量检查清单

> 发布 Gridea Pro 博客主题之前，按照以下清单逐项检查。
> 分为三个等级：P0（必须通过）、P1（强烈建议）、P2（加分项）。

---

## 🔴 必须通过（P0 — 不通过不能发布）

### 结构完整性

- [ ] `config.json` 格式正确，JSON 可被解析且包含 `engine` 字段
- [ ] `templates/index.html` 存在且非空
- [ ] `templates/post.html` 存在且非空
- [ ] 所有 `include` / `extends` 引用的 partial 文件存在（如 `_header.html`、`_footer.html`）
- [ ] 静态资源文件路径正确，`styles/`、`scripts/`、`images/` 目录下文件可访问
- [ ] 模板引擎类型与 `config.json` 中 `engine` 声明一致（jinja2 / golang / ejs）

### 渲染正确性

- [ ] `validate_syntax.py` 零错误零警告
- [ ] `render_test.py` 所有页面渲染成功（index / post / tag / archive）
- [ ] 输出 HTML 中无未替换的模板标签残留（如 `{{ }}`、`<%= %>`、`{% %}`）
- [ ] 每个输出 HTML 包含完整的 `<!DOCTYPE html>`、`<html>`、`<head>`、`<body>` 结构
- [ ] `<title>` 标签非空
- [ ] CSS 文件被正确引用且可加载

### 边界情况

- [ ] 0 篇文章时首页不崩溃，显示友好的空状态提示
- [ ] 文章无封面图时不崩溃，无 `<img src="">` 空标签输出
- [ ] 文章无标签时不崩溃，标签列表区域不显示或显示空状态
- [ ] 文章无摘要时不崩溃，摘要区域优雅降级
- [ ] 标题含特殊字符（`<`、`>`、`&`、`"`、`'`）时正确转义
- [ ] 超长标题（100+ 字符）不破坏布局，文字截断或换行正常
- [ ] 单篇文章超长内容（10000+ 字）渲染正常，无性能问题
- [ ] 只有 1 篇文章时分页器不显示或显示正确

---

## 🟡 强烈建议（P1）

### 响应式设计

- [ ] 375px（iPhone SE）布局正常，文字可读，无水平滚动条
- [ ] 768px（iPad 竖屏）布局正常
- [ ] 1024px（小桌面 / iPad 横屏）布局正常
- [ ] 1440px+ 大屏幕内容不拉伸过宽，有合理的最大宽度限制
- [ ] 导航栏在移动端有汉堡菜单或其他收缩方案
- [ ] 图片在各断点下不超出容器

### 用户体验

- [ ] 支持暗色模式（手动切换或跟随系统）
- [ ] 暗色模式下所有元素可读——检查代码块、引用块、表格
- [ ] 代码块可横向滚动，不破坏页面布局
- [ ] 图片不超出内容容器，设置 `max-width: 100%`
- [ ] 外部链接有视觉标识或添加 `target="_blank"` 和 `rel="noopener noreferrer"`
- [ ] 页面加载时间 < 3 秒（本地文件系统访问）
- [ ] 导航栏在滚动时行为合理（固定或正常滚动）
- [ ] 文章页有清晰的日期和标签显示

### SEO

- [ ] 每个页面有唯一的 `<title>`（文章页包含文章标题）
- [ ] 每个页面有 `<meta name="description">` 且内容不为空
- [ ] Open Graph 标签至少包含 `og:title`、`og:description`、`og:url`
- [ ] 使用语义化 HTML 标签：`<header>`、`<main>`、`<article>`、`<footer>`、`<nav>`
- [ ] 文章页使用 `<article>` 标签包裹内容
- [ ] 标题层级正确——页面仅有一个 `<h1>`，层级不跳跃

---

## 🟢 加分项（P2）

### 功能增强

- [ ] 客户端搜索功能
- [ ] 文章目录（TOC）自动生成
- [ ] 阅读进度条
- [ ] 返回顶部按钮
- [ ] 预计阅读时间显示
- [ ] 评论系统预留（如 Gitalk、Valine、Disqus 容器）
- [ ] 文章上一篇 / 下一篇导航
- [ ] 标签云页面

### 性能优化

- [ ] Lighthouse Performance 评分 ≥ 90
- [ ] 图片懒加载（`loading="lazy"`）
- [ ] CSS 文件压缩（去除注释和空白）
- [ ] JS 文件压缩
- [ ] 字体优化——使用 `font-display: swap` + `preload`
- [ ] 关键 CSS 内联（首屏样式）
- [ ] 无未使用的 CSS 规则（或占比极低）

### 可访问性

- [ ] 所有 `<img>` 标签有 `alt` 属性
- [ ] 文字与背景颜色对比度 ≥ 4.5:1（WCAG AA 标准）
- [ ] 页面可通过键盘完整导航（Tab 键顺序合理）
- [ ] 交互元素有 `focus` 可见样式
- [ ] 打印样式——隐藏导航和装饰，保留正文内容
- [ ] 暗色模式切换按钮有 `aria-label`

### 代码质量

- [ ] CSS 使用变量体系，无硬编码颜色值
- [ ] 模板文件使用 partial 拆分，无大段重复代码
- [ ] 无浏览器控制台错误或警告
- [ ] HTML 通过 W3C 验证（无严重错误）

---

## 自动化检查命令

在主题根目录下执行以下命令进行自动化验证：

```bash
# 语法检查——检测模板语法错误和引用缺失
python scripts/validate_syntax.py ./themes/my-theme

# 渲染测试——用模拟数据渲染所有页面
python scripts/render_test.py ./themes/my-theme --output-dir ./test-output

# 批量检查——同时执行语法检查和渲染测试
python scripts/validate_syntax.py ./themes/my-theme && \
python scripts/render_test.py ./themes/my-theme --output-dir ./test-output

# 查看渲染结果
open ./test-output/index.html
```

---

## 快速通过技巧

1. **先跑自动化**：`validate_syntax.py` 能发现 80% 的 P0 问题
2. **用真实数据测试**：不要只用 1 篇文章，至少准备 5-10 篇包含各种 Markdown 元素的文章
3. **边界情况模板**：准备一篇空文章（无标签、无封面、无摘要）专门用于边界测试
4. **多设备预览**：使用浏览器 DevTools 的 Device Mode 检查响应式
5. **暗色模式逐页检查**：每个页面类型都要在暗色模式下看一遍
