# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 规范,版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0] - 2026-04-14

### Added

- 首个版本发布
- `SKILL.md`:Gridea Pro 主题开发专家 Skill 入口,包含 5 步工作流和 16 条关键规则
- 三种模板引擎支持:Jinja2 (Pongo2)、Go Templates、EJS
- `scripts/scaffold_theme.py`:主题脚手架生成器
- `scripts/validate_syntax.py`:模板语法与变量名静态校验
- `scripts/render_test.py`:基于 mock 数据的渲染测试
- `references/`:完整参考文档(变量清单、三大引擎指南、架构、config schema、CSS 模式、SEO、质量清单)
- `assets/starters/`:三种引擎的起始模板
- `assets/mock-data.json` / `mock-data-empty.json`:渲染测试 fixture
- 中文 README,含与 `frontend-design` 等前端设计 Skill 的组合使用方式和 5 个 Prompt 模板
