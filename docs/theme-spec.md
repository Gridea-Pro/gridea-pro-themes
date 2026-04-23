# 主题目录规范

> 本文定义了 Gridea Pro 主题的目录结构与元信息格式。规则以**最小必需**为准，其余都是建议。

---

## 目录结构

```
themes/<theme-name>/
├── config.json                     ✅ 必需 · 主题元信息 + 自定义参数
├── README.md                       ✅ 必需 · 主题自己的说明
├── templates/                      ✅ 必需 · 模板文件目录
│   ├── index.*         (ejs / html)
│   ├── post.*
│   ├── tag.*
│   ├── category.*
│   ├── archives.*
│   ├── 404.*
│   └── includes/                   · 模板片段（可选）
├── assets/                         ✅ 静态资源
│   ├── media/
│   │   └── preview.png             ✅ 必需 · 画廊与应用内预览图
│   ├── styles/                     💡 推荐
│   ├── scripts/                    💡 推荐
│   └── media/                      💡 图片等其它媒体
├── LICENSE                         💡 推荐 · 作者自选授权（未放默认 MIT）
├── CHANGELOG.md                    💡 可选 · 版本变更记录
└── <theme-name>-preview.html       💡 可选 · 本地开发预览页
```

> 目录名约束：`kebab-case`，小写字母 / 数字 / 连字符，首字符必须是字母或数字，不超过 30 字符。正则 `^[a-z0-9][a-z0-9-]{0,29}$`。

---

## `config.json` 字段

### 顶层字段

| 字段 | 类型 | 必需 | 说明 |
|---|---|---|---|
| `name` | string | ✅ | 主题展示名（可以是 `My Theme`、中文名等，**无需**与目录名一致） |
| `version` | string | ✅ | 语义化版本，如 `1.0.0` |
| `author` | string | ✅ | 作者名或 GitHub 用户名 |
| `description` | string | ✅ | 一句话描述。中英文皆可，建议不超过 100 字符 |
| `engine` | string | ✅ | 模板引擎，见下方「引擎白名单」 |
| `templateEngine` | string | ✅ | 通常与 `engine` 相同，保留给将来分层指定的可能 |
| `customConfig` | array | ✅ | 自定义参数列表，可为 `[]`，见下方「customConfig 项」 |

> **关于 `name` 与目录名**：目录名是 Gridea Pro 应用加载主题的 ID，必须合规（kebab-case）；`name` 是展示名，允许空格、大小写、中文。两者无需一致（例如目录名 `amore-jinja2`，`name` 可以写 `Amore Jinja2`）。

### 引擎白名单

| `engine` 值 | 别名 | 模板后缀 |
|---|---|---|
| `jinja2` | `jinja`、`j2` | `.html` |
| `ejs` | —— | `.ejs` |
| `go` | `gotemplate`、`gotemplates` | `.html` |

> 不在白名单内的值 CI 会报警告但不阻塞。应用本身只认白名单内的字符串。

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
| `group` | | 分组，相同 `group` 的控件会聚合到同一分组 |
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
  "name": "Minimal Dark",
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

## 预览图规范

- **路径**：`themes/<theme-name>/assets/media/preview.<ext>`
- **扩展名**：`.png` / `.jpg` / `.jpeg` / `.webp`（按此顺序优先查找）
- **推荐尺寸**：1200×800（3:2）
- **大小**：< 500KB（建议用 [TinyPNG](https://tinypng.com) 压缩）
- **内容**：真实的主题首页截图，能一眼看出风格

> **一处放、两处用**：Gridea Pro 应用内「主题选择器」和本仓库的主题画廊都从这个路径读取。作者只需要维护这一份。

---

## 授权声明

推荐在主题目录内放一个 `LICENSE` 文件：

```
themes/<theme-name>/LICENSE
```

未放时默认视为 **MIT**。更多说明见 [CONTRIBUTING.md — 关于授权](../CONTRIBUTING.md#关于授权)。

---

## CI 校验的边界

自动校验**只检查**：

- 目录名是否合规（kebab-case）
- 必需文件是否齐全（`config.json` / `README.md` / `templates/` / `assets/media/preview.*`）
- `config.json` 是否为合法 JSON
- `config.json` 是否包含必需顶层字段且非空
- `engine` 是否在白名单内（不在只警告）

**不会检查**：

- `config.json` 的 `name` 是否与目录名一致（两者语义不同）
- 模板语法是否正确
- CSS / JS 是否有 bug
- 审美 / 代码风格

这些留给人工 review 和用户反馈。
