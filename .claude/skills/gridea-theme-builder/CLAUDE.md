# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is **not** a Gridea theme or a software project to build/test. It is a **Claude Skill package** (`gridea-theme-builder`) that teaches Claude how to author Gridea Pro blog themes. The deliverable is `SKILL.md` + `references/` + `scripts/` + `assets/`, consumed as a skill — there is no build system, no package manager, no test suite for the repo itself.

When a user asks you to create/modify a Gridea theme, follow the workflow in `SKILL.md`. When the user asks you to edit this skill (improve docs, fix a script, add a reference), treat it as a content/script edit task.

## Repository layout

- `SKILL.md` — entry point and workflow contract. The 5-step workflow and "关键规则" section at the bottom are load-bearing; don't paraphrase them away when editing.
- `references/` — documentation Claude reads on demand while authoring a theme. `template-variables.md` is the single most important file (per SKILL.md, ~80% of render errors come from wrong variable names). Engine-specific guides: `jinja2-guide.md`, `go-templates-guide.md`, `ejs-guide.md`.
- `scripts/` — Python tools invoked during theme authoring:
  - `scaffold_theme.py <name> --engine jinja2|go|ejs [--output-dir ./themes]` — generate starter theme from `assets/starters/<engine>/`.
  - `validate_syntax.py <theme-dir>` — static checks for tag pairing, variable names, engine-specific traps, required files.
  - `render_test.py <theme-dir> [--output-dir ./test-output]` — render all pages with mock data from `assets/mock-data.json`, flag render errors and leftover template tags (`{{`, `{%`, `<%`).
- `assets/starters/{jinja2,go-templates,ejs}/` — scaffold source templates copied by `scaffold_theme.py`.
- `assets/mock-data.json`, `mock-data-empty.json` — fixture data for `render_test.py` (empty variant tests edge cases like zero posts).

## Three template engines, three rule sets

Gridea Pro supports Jinja2 (Pongo2), Go Templates, and EJS. These are not interchangeable — each has a distinct set of footguns enumerated in SKILL.md "关键规则". When editing a reference or script, keep these engine-specific invariants consistent across `SKILL.md`, the engine guide under `references/`, and the corresponding starter under `assets/starters/`:

- **Jinja2/Pongo2**: filter args use colon not parens (`|default:"x"`), `post.date` is already a string, `include` paths are relative to `templates/` root, HTML output needs `|safe`.
- **Go Templates**: PascalCase field names, nil-guard before nested access, `CustomConfig` is a map requiring `index`, `safeHTML`/`safeCSS` for raw content, `template "name" .` must pass context, no template inheritance.
- **EJS**: no `require()`, limited JS runtime. Generally migrate to Jinja2 where possible.
- **Static assets**: the `assets/` prefix is stripped at build time — templates reference `/styles/main.css`, not `assets/styles/main.css`.

## Editing guidelines specific to this skill

- When adding a new variable, trap, or rule, update **all three** of: `SKILL.md` 关键规则 (if it's a must-not-violate rule), the relevant `references/*-guide.md`, and the starter under `assets/starters/` so validation and render tests stay in sync.
- `validate_syntax.py` compares variable names against `references/template-variables.md` — if you rename or add a canonical variable, update that reference file *and* the validator's variable list together.
- The skill is written in Chinese. Keep new content in Chinese to match voice unless the user asks otherwise.
