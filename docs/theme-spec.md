# 主题目录规范

> 本文定义了 Gridea Pro 主题的目录结构与元信息格式。规则以**最小必需**为准，其余都是建议。

---

## 目录结构

```
themes/<theme-name>/
├── config.json               ✅ 必需 · 主题元信息 + 自定义参数
├── preview.png               ✅ 必需 · 画廊展示图（1200×800，< 500KB）
├── README.md                 ✅ 必需 · 主题自己的说明
├── templates/                ✅ 必需 · 模板文件目录
│   ├── index.html
│   ├── post.html
│   ├── tag.html
│   ├── category.html
│   ├── archives.html
│   ├── 404.html
│   └── includes/             · 模板片段（可选）
├── assets/                   💡 推荐 · 静态资源
│   ├── styles/
│   ├── scripts/
│   └── media/
├── LICENSE                   💡 推荐 · 作者自选授权（未放默认 MIT）
├── CHANGELOG.md              💡 可选 · 版本变更记录
└── <theme-name>-preview.html 💡 可选 · 本地开发预览页
```

> 目录名约束：`kebab-case`，小写字母/数字/连字符，首字符必须是字母或数字，不超过 30 字符。正则 `^[a-z0-9][a-z0-9-]{0,29}$`。

---

## `config.json` 字段

### 顶层字段

| 字段 | 类型 | 必需 | 说明 |
|---|---|---|---|
| `name` | string | ✅ | 主题名，必须与目录名一致 |
| `version` | string | ✅ | 语义化版本，如 `1.0.0` |
| `author` | string | ✅ | 作者名或 GitHub 用户名 |
| `description` | string | ✅ | 一句话描述。中英文皆可，建议不超过 100 字符 |
| `engine` | string | ✅ | 模板引擎，见下方「引擎白名单」 |
| `templateEngine` | string | ✅ | 通常与 `engine` 相同，保留给将来不同层分别指定的可能 |
| `customConfig` | array | ✅ | 自定义参数列表，可为 `[]`，见下方「customConfig 项」 |

### 引擎白名单

| 值 | 语法 |
|---|---|
| `jinja2` | Jinja2（Python 风格） |
| `pongo2` | Pongo2（Go 的 Jinja2 实现） |
| `ejs` | EJS |
| `go-template` | Go `html/template` |

> 不在白名单内的 `engine` 值，CI 会给警告但不阻塞合并。

### `customConfig` 项

每一项对应主题「自定义参数」界面上的一个控件，由用户在应用里填写，运行时注入模板上下文。

```json
{
  "name": "accentColor",
  "label": "主题强调色",
  "group": "外观设置",
  "type": "input",
  "value": "#FFFF00",
  "note": "默认亮黄色"
}
```

| 字段 | 必需 | 说明 |
|---|---|---|
| `name` | ✅ | 参数标识，英文，在模板里用这个名字读取 |
| `label` | ✅ | 界面显示名 |
| `group` | | 分组，相同 `group` 的控件会聚合到同一分组下 |
| `type` | ✅ | 控件类型，见下表 |
| `value` | ✅ | 默认值（首次使用时填入） |
| `note` | | 控件下方的辅助说明 |
| `options` | | `type=select` 时的选项列表 |

### `type` 取值

| 类型 | 说明 |
|---|---|
| `input` | 单行文本 |
| `textarea` | 多行文本 |
| `toggle` | 布尔开关 |
| `select` | 下拉选择（需要配合 `options`） |
| `picture-upload` | 图片上传 |

`options` 格式：

```json
"options": [
  { "label": "深色", "value": "dark" },
  { "label": "浅色", "value": "light" }
]
```

---

## 完整示例

```json
{
  "name": "minimal-dark",
  "version": "1.0.0",
  "author": "alice",
  "description": "A minimal dark theme focused on reading experience.",
  "engine": "jinja2",
  "templateEngine": "jinja2",
  "customConfig": [
    {
      "name": "accentColor",
      "label": "强调色",
      "group": "外观",
      "type": "input",
      "value": "#00ffcc"
    },
    {
      "name": "defaultTheme",
      "label": "默认配色",
      "group": "外观",
      "type": "select",
      "value": "dark",
      "options": [
        { "label": "深色", "value": "dark" },
        { "label": "浅色", "value": "light" }
      ]
    },
    {
      "name": "showSidebar",
      "label": "显示侧边栏",
      "group": "布局",
      "type": "toggle",
      "value": true
    }
  ]
}
```

---

## `preview.png` 规范

- **尺寸**：1200×800（3:2）
- **格式**：PNG
- **大小**：< 500KB（建议用 [TinyPNG](https://tinypng.com) 压缩）
- **内容**：真实的主题首页截图，能一眼看出风格

> 画廊会直接引用 `preview.png`，放错尺寸或过大会影响整体观感。

---

## 授权声明

推荐在主题目录内放一个 `LICENSE` 文件：

```
themes/minimal-dark/LICENSE
```

未放时默认视为 **MIT**。更多说明见 [CONTRIBUTING.md — 关于授权](../CONTRIBUTING.md#关于授权)。

---

## CI 校验的边界

自动校验**只检查**：

- 目录名是否合规
- 必需文件是否齐全
- `config.json` 是否为合法 JSON
- `config.json` 是否包含必需顶层字段
- `config.json` 的 `name` 是否与目录名一致
- `preview.png` 是否存在且不过大

**不会检查**：

- 模板语法是否正确
- CSS / JS 是否有 bug
- 审美 / 代码风格

这些留给人工 review 和用户反馈。
