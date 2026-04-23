# 5 分钟把你的主题发出去

假设你已经在本地用 Gridea Pro 写好了一个主题，现在想把它发布到社区。

---

## 1. 准备主题目录

你本地 Gridea Pro 的主题应该长这样（一般在 `<你的站点目录>/themes/<主题名>/`）：

```
your-theme/
├── config.json
├── templates/
└── assets/       (可能有)
```

---

## 2. 补齐两个必需文件

### 2.1 截图 `preview.png`

在应用里用你的主题预览站点，截一张首页图，处理成 **1200×800** PNG，压缩到 **500KB 以内**。

放到主题目录根：

```
your-theme/preview.png
```

### 2.2 主题说明 `README.md`

写一个简单的 README：

```markdown
# your-theme

一句话介绍。

![preview](./preview.png)

## 特色

- 功能点 1
- 功能点 2

## 自定义参数

在应用「主题 → 自定义」里可以配置：

- **强调色**: 默认 `#FF0066`
- **显示侧边栏**: 默认开启

## 作者

[@你的名字](https://github.com/你的名字)

## 授权

MIT
```

（如果授权不是 MIT，别忘了放一个 `LICENSE` 文件）

---

## 3. Fork & 提交

### 3.1 Fork

点 [gridea-pro-themes](https://github.com/Gridea-Pro/gridea-pro-themes) 右上角 Fork。

### 3.2 把你的主题丢进去

```bash
git clone https://github.com/<你的用户名>/gridea-pro-themes.git
cd gridea-pro-themes
git checkout -b add-theme-your-theme

# 把你本地主题目录拷过来
cp -r /path/to/your-theme themes/

git add themes/your-theme
git commit -m "新增主题: your-theme"
git push origin add-theme-your-theme
```

### 3.3 提 PR

回到 GitHub，点「Compare & pull request」。PR 模板会自动弹出，勾选 **新增主题**，填好表单，贴一张预览图。

---

## 4. 等 CI 绿灯

GitHub Actions 会自动跑 `validate-theme.yml`。通过后维护者会来 review，一般 1-3 天内给反馈。

如果 CI 红了，看日志：大多数是 `config.json` 字段缺失或 `preview.png` 忘记放。改完推个新 commit，CI 会自动重跑。

---

## 5. 合并之后

- 你的主题会出现在 [主题画廊](../README.md#主题画廊)
- 其他用户可以下载使用
- 收到的 bug 反馈会 `@你`
- 后续你自己随时可以提 PR 更新版本

---

## 遇到问题？

- 主题规范细节 → [docs/theme-spec.md](./theme-spec.md)
- 贡献流程问题 → [CONTRIBUTING.md](../CONTRIBUTING.md)
- 都没解决 → 提个 [Issue](https://github.com/Gridea-Pro/gridea-pro-themes/issues) 问我们

就这么简单。期待你的主题 🌱
