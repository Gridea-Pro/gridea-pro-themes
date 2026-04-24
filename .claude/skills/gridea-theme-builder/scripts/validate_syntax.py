#!/usr/bin/env python3
"""
Gridea Pro 主题语法验证器

用法:
  python validate_syntax.py <theme-dir>

示例:
  python validate_syntax.py ./themes/my-blog

输出:
  ✅ PASS: templates/index.html
  ⚠️ WARN: templates/post.html:15 — 建议对 post.feature 做空值判断
  ❌ FAIL: templates/tag.html:8 — Filter 参数使用了括号语法: default("x")，应改为 default:"x"
"""

import argparse
import json
import os
import re
import sys
import textwrap
from pathlib import Path
from collections import defaultdict

# ---------------------------------------------------------------------------
# Severity levels
# ---------------------------------------------------------------------------

ERROR = "ERROR"
WARN = "WARN"
PASS = "PASS"

# ---------------------------------------------------------------------------
# Colour / symbol helpers (graceful fallback for non-TTY)
# ---------------------------------------------------------------------------

_IS_TTY = hasattr(sys.stdout, "isatty") and sys.stdout.isatty()

_COLOURS = {
    ERROR: "\033[91m" if _IS_TTY else "",
    WARN: "\033[93m" if _IS_TTY else "",
    PASS: "\033[92m" if _IS_TTY else "",
    "RESET": "\033[0m" if _IS_TTY else "",
    "BOLD": "\033[1m" if _IS_TTY else "",
    "DIM": "\033[2m" if _IS_TTY else "",
}

_SYMBOLS = {
    ERROR: "❌",
    WARN: "⚠️ ",
    PASS: "✅",
}


class Issue:
    """Represents a single validation issue."""

    def __init__(self, severity, filepath, line_no, message):
        self.severity = severity
        self.filepath = filepath
        self.line_no = line_no
        self.message = message

    def __str__(self):
        sym = _SYMBOLS[self.severity]
        colour = _COLOURS[self.severity]
        reset = _COLOURS["RESET"]
        loc = self.filepath
        if self.line_no is not None:
            loc += f":{self.line_no}"
        severity_label = {"ERROR": "FAIL", "WARN": "WARN", "PASS": "PASS"}[self.severity]
        return f"  {sym} {colour}{severity_label}{reset}: {loc} — {self.message}"


# ---------------------------------------------------------------------------
# Utility: extract template tag contents
# ---------------------------------------------------------------------------

def _extract_jinja2_tags(content):
    """Yield (line_no, tag_type, inner_text) for {{ }}, {% %}, {# #} tags."""
    patterns = [
        (r"\{\{(.*?)\}\}", "var"),
        (r"\{%(.*?)%\}", "block"),
        (r"\{#(.*?)#\}", "comment"),
    ]
    for pattern, tag_type in patterns:
        for m in re.finditer(pattern, content, re.DOTALL):
            start = m.start()
            line_no = content[:start].count("\n") + 1
            yield (line_no, tag_type, m.group(1), m.group(0))


def _extract_go_tags(content):
    """Yield (line_no, inner_text, full_match) for Go template tags {{ }}."""
    for m in re.finditer(r"\{\{(.*?)\}\}", content, re.DOTALL):
        start = m.start()
        line_no = content[:start].count("\n") + 1
        yield (line_no, m.group(1).strip(), m.group(0))


def _extract_ejs_tags(content):
    """Yield (line_no, tag_type, inner_text, full_match) for EJS tags."""
    # <%- %> raw, <%= %> escaped, <% %> scriptlet, <%# %> comment
    pattern = r"<%([-=#]?)(.*?)(-?)%>"
    for m in re.finditer(pattern, content, re.DOTALL):
        start = m.start()
        line_no = content[:start].count("\n") + 1
        prefix = m.group(1)
        tag_type = {"-": "raw", "=": "escaped", "#": "comment", "": "scriptlet"}.get(prefix, "scriptlet")
        yield (line_no, tag_type, m.group(2), m.group(0))


# ---------------------------------------------------------------------------
# Comment stripping helpers (used before tag-pairing analysis)
# ---------------------------------------------------------------------------

def _strip_jinja2_comments(content):
    """Remove Jinja2 comments {# ... #} (can span multiple lines)."""
    return re.sub(r"\{#.*?#\}", "", content, flags=re.DOTALL)


def _strip_go_comments(content):
    """Remove Go template comments {{/* ... */}} (can span multiple lines)."""
    return re.sub(r"\{\{/\*.*?\*/\}\}", "", content, flags=re.DOTALL)


def _strip_ejs_comments(content):
    """Remove EJS comments <%/* ... */%> and <%# ... %> (can span multiple lines)."""
    content = re.sub(r"<%/\*.*?\*/%>", "", content, flags=re.DOTALL)
    content = re.sub(r"<%#.*?%>", "", content, flags=re.DOTALL)
    return content


# ---------------------------------------------------------------------------
# Per-engine validators
# ---------------------------------------------------------------------------

def _validate_jinja2(filepath, content, theme_dir):
    """Validate a Jinja2 (Pongo2) template file."""
    issues = []
    rel = os.path.relpath(filepath, theme_dir)

    # Check for filter params using parentheses inside template tags: |filter(arg)
    for line_no, tag_type, inner, full in _extract_jinja2_tags(content):
        if tag_type == "comment":
            continue

        # ERROR: filter params with parentheses  e.g. |default("foo")
        paren_filter = re.findall(r"\|\s*(\w+)\(([^)]*)\)", inner)
        for fname, fargs in paren_filter:
            # skip 'safe' which has no args in parens — but if it does, flag it
            issues.append(Issue(
                ERROR, rel, line_no,
                f"Filter 参数使用了括号语法: {fname}(\"{fargs}\")，应改为 {fname}:\"{fargs}\""
            ))

        # ERROR: macro/call usage (not supported by Pongo2)
        if re.search(r"\b(macro|call)\b", inner):
            issues.append(Issue(
                ERROR, rel, line_no,
                "Pongo2 不支持 macro/call 语句"
            ))

        # ERROR: ~ string concatenation
        if "~" in inner and tag_type in ("var", "block"):
            # Avoid matching ~ inside strings
            stripped = re.sub(r"(['\"])(.*?)\1", "", inner)
            if "~" in stripped:
                issues.append(Issue(
                    ERROR, rel, line_no,
                    "Pongo2 不支持 ~ 字符串连接操作符"
                ))

        # ERROR: 'is defined' test
        if re.search(r"\bis\s+defined\b", inner):
            issues.append(Issue(
                ERROR, rel, line_no,
                "Pongo2 不支持 'is defined' 测试"
            ))

        # ERROR: 'not in' operator — Pongo2 uses 'not x in y'
        if re.search(r"\bnot\s+in\b", inner):
            issues.append(Issue(
                ERROR, rel, line_no,
                "Pongo2 不支持 'not in'，请使用 'not x in y' 形式"
            ))

        # ERROR: inline ternary  'x if cond else y'
        if re.search(r"\bif\b.*\belse\b", inner) and tag_type == "var":
            issues.append(Issue(
                ERROR, rel, line_no,
                "Pongo2 不支持行内三元表达式 'x if cond else y'"
            ))

        # ERROR: && or || operators
        if re.search(r"&&|\|\|", inner):
            issues.append(Issue(
                ERROR, rel, line_no,
                "Pongo2 不支持 && 和 || 操作符，请使用 and/or"
            ))

        # WARN: .length property access — should use |length filter
        if re.search(r"\.\s*length\b", inner):
            issues.append(Issue(
                WARN, rel, line_no,
                "建议使用 |length 过滤器代替 .length 属性访问"
            ))

        # ERROR: typeof usage
        if re.search(r"\btypeof\b", inner):
            issues.append(Issue(
                ERROR, rel, line_no,
                "Pongo2 不支持 typeof 操作符"
            ))

        # WARN: strftime date format patterns
        if re.search(r"%[YymdHMSBbAaIpjUWwGgVuzZ]", inner):
            issues.append(Issue(
                WARN, rel, line_no,
                "检测到 strftime 格式字符，Pongo2 使用 Go 风格日期格式 (如 2006-01-02)"
            ))

        # WARN: newlines within template tags
        if "\n" in inner:
            issues.append(Issue(
                WARN, rel, line_no,
                "模板标签内包含换行符，可能导致 Pongo2 解析异常"
            ))

    # --- Block pairing checks (strip comments first to avoid false positives) ---
    stripped = _strip_jinja2_comments(content)
    lines = stripped.split("\n")

    block_pairs = [
        ("for", "endfor"),
        ("if", "endif"),
        ("block", "endblock"),
    ]
    for open_kw, close_kw in block_pairs:
        open_pattern = re.compile(r"\{%[-\s]*" + open_kw + r"\b")
        close_pattern = re.compile(r"\{%[-\s]*" + close_kw + r"\b")
        opens = len(open_pattern.findall(stripped))
        closes = len(close_pattern.findall(stripped))
        if opens != closes:
            issues.append(Issue(
                ERROR, rel, None,
                f"未配对的 {{% {open_kw} %}} / {{% {close_kw} %}}：打开 {opens} 次，关闭 {closes} 次"
            ))

    # --- Include / extends file existence ---
    include_pattern = re.compile(r'\{%[-\s]*include\s+["\']([^"\']+)["\']')
    extends_pattern = re.compile(r'\{%[-\s]*extends\s+["\']([^"\']+)["\']')

    templates_dir = os.path.join(theme_dir, "templates")

    for m in include_pattern.finditer(content):
        inc_file = m.group(1)
        inc_path = os.path.join(templates_dir, inc_file)
        line_no = content[:m.start()].count("\n") + 1
        if not os.path.isfile(inc_path):
            issues.append(Issue(
                ERROR, rel, line_no,
                f"include 文件不存在: {inc_file}"
            ))

    for m in extends_pattern.finditer(content):
        ext_file = m.group(1)
        ext_path = os.path.join(templates_dir, ext_file)
        line_no = content[:m.start()].count("\n") + 1
        if not os.path.isfile(ext_path):
            issues.append(Issue(
                ERROR, rel, line_no,
                f"extends 文件不存在: {ext_file}"
            ))

    # WARN: missing |safe on .content output
    for line_no, tag_type, inner, full in _extract_jinja2_tags(content):
        if tag_type == "var":
            if re.search(r"\.content\b", inner) and "safe" not in inner:
                issues.append(Issue(
                    WARN, rel, line_no,
                    "输出 .content 时建议使用 |safe 过滤器以渲染 HTML"
                ))

    return issues


def _validate_go(filepath, content, theme_dir):
    """Validate a Go Templates file."""
    issues = []
    rel = os.path.relpath(filepath, theme_dir)

    # --- Strip comments before pairing analysis ---
    stripped = _strip_go_comments(content)

    # --- Bracket pairing ---
    open_count = len(re.findall(r"\{\{", stripped))
    close_count = len(re.findall(r"\}\}", stripped))
    if open_count != close_count:
        issues.append(Issue(
            ERROR, rel, None,
            f"{{ }} 括号不配对：{{ 出现 {open_count} 次，}} 出现 {close_count} 次"
        ))

    # --- Block pairing: range/end, if/end, with/end, define/end ---
    # In Go templates, all blocks close with {{end}}
    block_openers = ["range", "if", "with", "define", "block"]
    total_opens = 0
    for kw in block_openers:
        pattern = re.compile(r"\{\{[-\s]*" + kw + r"\b")
        total_opens += len(pattern.findall(stripped))

    end_pattern = re.compile(r"\{\{[-\s]*end\b")
    total_ends = len(end_pattern.findall(stripped))

    if total_opens != total_ends:
        issues.append(Issue(
            ERROR, rel, None,
            f"块语句不配对：打开 ({'/'.join(block_openers)}) {total_opens} 次，"
            f"{{{{ end }}}} {total_ends} 次"
        ))

    # --- WARN: == instead of eq ---
    for line_no, inner, full in _extract_go_tags(content):
        if "==" in inner:
            issues.append(Issue(
                WARN, rel, line_no,
                "Go 模板建议使用 eq 函数进行比较而非 =="
            ))

    # --- WARN: template references existence ---
    templates_dir = os.path.join(theme_dir, "templates")
    tmpl_ref_pattern = re.compile(r'\{\{[-\s]*template\s+"([^"]+)"')
    # Collect all defined templates
    define_pattern = re.compile(r'\{\{[-\s]*define\s+"([^"]+)"')
    all_defined = set()
    for root, _dirs, files in os.walk(templates_dir):
        for fname in files:
            if not fname.endswith(".html"):
                continue
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    fc = f.read()
                for dm in define_pattern.finditer(fc):
                    all_defined.add(dm.group(1))
            except Exception:
                pass

    for m in tmpl_ref_pattern.finditer(content):
        ref_name = m.group(1)
        line_no = content[:m.start()].count("\n") + 1
        if ref_name not in all_defined:
            issues.append(Issue(
                WARN, rel, line_no,
                f"引用的模板 \"{ref_name}\" 未在任何文件中定义 ({{{{ define \"{ref_name}\" }}}})"
            ))

    # --- WARN: missing nil checks on optional fields ---
    # Heuristic: accessing .Feature, .Tags, .Logo etc. without prior {{ if }}
    optional_fields = [".Feature", ".Tags", ".Logo", ".Avatar", ".FooterInfo", ".Prev", ".Next"]
    for line_no, inner, full in _extract_go_tags(content):
        for field in optional_fields:
            if field in inner and "if" not in inner and "range" not in inner:
                # Check if the previous tag on same or prior line is an if check
                # This is a heuristic — just warn
                pass  # Too many false positives; skip for now

    return issues


def _validate_ejs(filepath, content, theme_dir):
    """Validate an EJS template file."""
    issues = []
    rel = os.path.relpath(filepath, theme_dir)

    # --- Tag pairing (strip comments first to avoid false positives) ---
    stripped = _strip_ejs_comments(content)
    open_count = len(re.findall(r"<%", stripped))
    close_count = len(re.findall(r"%>", stripped))
    if open_count != close_count:
        issues.append(Issue(
            ERROR, rel, None,
            f"<% %> 标签不配对：<% 出现 {open_count} 次，%> 出现 {close_count} 次"
        ))

    # --- ERROR: require() usage ---
    for line_no, tag_type, inner, full in _extract_ejs_tags(content):
        if tag_type == "comment":
            continue

        if re.search(r"\brequire\s*\(", inner):
            issues.append(Issue(
                ERROR, rel, line_no,
                "EJS 模板中不应使用 require()，这在浏览器端不可用"
            ))

        if re.search(r"\bimport\s+", inner):
            issues.append(Issue(
                ERROR, rel, line_no,
                "EJS 模板中不应使用 import 语句"
            ))

    # --- WARN: forEach / if / for bracket pairing ---
    # Count opening and closing braces within scriptlet tags
    brace_opens = 0
    brace_closes = 0
    for _line_no, tag_type, inner, full in _extract_ejs_tags(content):
        if tag_type in ("scriptlet",):
            brace_opens += inner.count("{")
            brace_closes += inner.count("}")

    if brace_opens != brace_closes:
        issues.append(Issue(
            WARN, rel, None,
            f"EJS 脚本块中花括号不配对：{{ 出现 {brace_opens} 次，}} 出现 {brace_closes} 次"
        ))

    # --- WARN: using <%= for .content (should use <%- for raw HTML) ---
    for line_no, tag_type, inner, full in _extract_ejs_tags(content):
        if tag_type == "escaped":
            if re.search(r"\.content\b", inner):
                issues.append(Issue(
                    WARN, rel, line_no,
                    "输出 .content 时建议使用 <%- %> (raw) 而非 <%= %> (escaped) 以渲染 HTML"
                ))

    # --- Include existence check ---
    include_pattern = re.compile(r"include\s*\(\s*['\"]([^'\"]+)['\"]")
    templates_dir = os.path.join(theme_dir, "templates")
    for m in include_pattern.finditer(content):
        inc_file = m.group(1)
        # EJS includes are resolved relative to templates dir, often without .html
        candidates = [
            os.path.join(templates_dir, inc_file),
            os.path.join(templates_dir, inc_file + ".html"),
            os.path.join(templates_dir, inc_file + ".ejs"),
        ]
        line_no = content[:m.start()].count("\n") + 1
        if not any(os.path.isfile(c) for c in candidates):
            issues.append(Issue(
                ERROR, rel, line_no,
                f"include 文件不存在: {inc_file}"
            ))

    return issues


# ---------------------------------------------------------------------------
# Cross-engine validators
# ---------------------------------------------------------------------------

REQUIRED_TEMPLATES = ["index.html", "post.html"]


def _validate_cross_engine(theme_dir, engine):
    """Run engine-agnostic checks."""
    issues = []

    # --- config.json validity ---
    config_path = os.path.join(theme_dir, "config.json")
    if not os.path.isfile(config_path):
        issues.append(Issue(ERROR, "config.json", None, "config.json 文件不存在"))
        return issues  # Can't continue without config

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        issues.append(Issue(ERROR, "config.json", None, f"config.json 不是有效的 JSON: {e}"))
        return issues

    if "engine" not in config:
        issues.append(Issue(ERROR, "config.json", None, "config.json 缺少 'engine' 字段"))
    elif config["engine"] not in ("jinja2", "go", "ejs"):
        issues.append(Issue(
            ERROR, "config.json", None,
            f"config.json 中 engine 值无效: '{config['engine']}'，应为 jinja2/go/ejs"
        ))

    # --- Required templates ---
    templates_dir = os.path.join(theme_dir, "templates")
    if not os.path.isdir(templates_dir):
        issues.append(Issue(ERROR, "templates/", None, "templates/ 目录不存在"))
        return issues

    for req in REQUIRED_TEMPLATES:
        req_path = os.path.join(templates_dir, req)
        if not os.path.isfile(req_path):
            issues.append(Issue(ERROR, f"templates/{req}", None, f"必需的模板文件不存在: {req}"))

    return issues


# ---------------------------------------------------------------------------
# Main validation orchestrator
# ---------------------------------------------------------------------------

def validate_theme(theme_dir):
    """Validate an entire theme directory. Returns (engine, issues_list)."""
    theme_dir = os.path.abspath(theme_dir)

    if not os.path.isdir(theme_dir):
        print(f"❌ 错误: 目录 '{theme_dir}' 不存在。")
        sys.exit(1)

    # Detect engine
    config_path = os.path.join(theme_dir, "config.json")
    engine = None
    if os.path.isfile(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
            engine = config.get("engine")
        except Exception:
            engine = None

    # Cross-engine checks
    all_issues = _validate_cross_engine(theme_dir, engine)

    # Engine-specific checks on each template
    templates_dir = os.path.join(theme_dir, "templates")
    template_files = []
    if os.path.isdir(templates_dir):
        for root, _dirs, files in os.walk(templates_dir):
            for fname in sorted(files):
                if fname.endswith((".html", ".ejs", ".tmpl")):
                    template_files.append(os.path.join(root, fname))

    engine_validators = {
        "jinja2": _validate_jinja2,
        "go": _validate_go,
        "ejs": _validate_ejs,
    }

    validator = engine_validators.get(engine)

    files_with_issues = set()

    for fpath in template_files:
        if validator:
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                file_issues = validator(fpath, content, theme_dir)
                all_issues.extend(file_issues)
                if file_issues:
                    files_with_issues.add(fpath)
            except Exception as e:
                rel = os.path.relpath(fpath, theme_dir)
                all_issues.append(Issue(ERROR, rel, None, f"读取文件失败: {e}"))
                files_with_issues.add(fpath)

    return engine, template_files, all_issues, files_with_issues


def print_report(theme_dir, engine, template_files, all_issues, files_with_issues):
    """Print the validation report."""
    theme_name = os.path.basename(os.path.abspath(theme_dir))
    engine_labels = {
        "jinja2": "Jinja2 (Pongo2)",
        "go": "Go Templates",
        "ejs": "EJS",
        None: "未检测到",
    }
    engine_label = engine_labels.get(engine, str(engine))

    error_count = sum(1 for i in all_issues if i.severity == ERROR)
    warn_count = sum(1 for i in all_issues if i.severity == WARN)
    pass_count = len(template_files) - len(files_with_issues)

    bold = _COLOURS["BOLD"]
    reset = _COLOURS["RESET"]
    dim = _COLOURS["DIM"]

    # Header
    print(f"""
{bold}{'=' * 55}{reset}
{bold}  Gridea Theme Validator — 验证报告{reset}
{bold}{'=' * 55}{reset}
  引擎: {engine_label}
  主题: {theme_name}
  文件: {len(template_files)} 个模板
{bold}{'=' * 55}{reset}""")

    # Group issues by file
    if all_issues:
        issues_by_file = defaultdict(list)
        for issue in all_issues:
            issues_by_file[issue.filepath].append(issue)

        for filepath in sorted(issues_by_file.keys()):
            file_issues = issues_by_file[filepath]
            print(f"\n  {dim}── {filepath} ──{reset}")
            for issue in file_issues:
                print(str(issue))

    # Print passed files
    if pass_count > 0:
        passed_files = [
            os.path.relpath(f, os.path.abspath(theme_dir))
            for f in template_files
            if f not in files_with_issues
        ]
        if passed_files:
            print(f"\n  {dim}── 通过的文件 ──{reset}")
            for pf in sorted(passed_files):
                print(f"  {_SYMBOLS[PASS]} {_COLOURS[PASS]}PASS{reset}: {pf}")

    # Summary
    err_colour = _COLOURS[ERROR] if error_count > 0 else _COLOURS[PASS]
    warn_colour = _COLOURS[WARN] if warn_count > 0 else _COLOURS[PASS]
    pass_colour = _COLOURS[PASS]

    print(f"""
{bold}{'=' * 55}{reset}
  {err_colour}{_SYMBOLS[ERROR]} 错误: {error_count}{reset}
  {warn_colour}{_SYMBOLS[WARN]}警告: {warn_count}{reset}
  {pass_colour}{_SYMBOLS[PASS]} 通过: {pass_count}{reset}
{bold}{'=' * 55}{reset}""")

    if error_count == 0 and warn_count == 0:
        print(f"\n  {_COLOURS[PASS]}🎉 主题验证全部通过！{reset}\n")
    elif error_count == 0:
        print(f"\n  {_COLOURS[WARN]}⚠️  主题有 {warn_count} 个警告，建议修复后再发布。{reset}\n")
    else:
        print(f"\n  {_COLOURS[ERROR]}❌ 主题有 {error_count} 个错误，请修复后重新验证。{reset}\n")

    return error_count


def main():
    parser = argparse.ArgumentParser(
        description="Gridea Pro 主题语法验证器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            验证规则包括:
              - config.json 格式与必要字段
              - 模板文件是否完整
              - 引擎专属语法检查 (Jinja2/Go/EJS)
              - Include/Extends 文件存在性
              - 块语句配对检查

            示例:
              python validate_syntax.py ./themes/my-blog
        """),
    )
    parser.add_argument(
        "theme_dir",
        help="主题目录路径",
    )

    args = parser.parse_args()

    engine, template_files, all_issues, files_with_issues = validate_theme(args.theme_dir)
    error_count = print_report(args.theme_dir, engine, template_files, all_issues, files_with_issues)

    sys.exit(1 if error_count > 0 else 0)


if __name__ == "__main__":
    main()
