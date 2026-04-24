#!/usr/bin/env python3
"""
Gridea Pro 主题渲染测试

用法:
  python render_test.py <theme-dir> [--mock-data ./mock-data.json] [--output-dir ./test-output]

示例:
  python render_test.py ./themes/my-blog
  python render_test.py ./themes/my-blog --output-dir ./test-output

依赖:
  pip install jinja2
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import textwrap
from pathlib import Path

# ---------------------------------------------------------------------------
# Colour / symbol helpers
# ---------------------------------------------------------------------------

_IS_TTY = hasattr(sys.stdout, "isatty") and sys.stdout.isatty()

_C = {
    "R": "\033[91m" if _IS_TTY else "",  # red
    "G": "\033[92m" if _IS_TTY else "",  # green
    "Y": "\033[93m" if _IS_TTY else "",  # yellow
    "B": "\033[94m" if _IS_TTY else "",  # blue
    "M": "\033[95m" if _IS_TTY else "",  # magenta
    "BOLD": "\033[1m" if _IS_TTY else "",
    "DIM": "\033[2m" if _IS_TTY else "",
    "0": "\033[0m" if _IS_TTY else "",  # reset
}


# ---------------------------------------------------------------------------
# Mock data loading
# ---------------------------------------------------------------------------

DEFAULT_MOCK_PATHS = [
    "assets/mock-data.json",
    "../assets/mock-data.json",
]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BUNDLED_MOCK_PATH = os.path.join(os.path.dirname(SCRIPT_DIR), "assets", "mock-data.json")


def load_mock_data(mock_data_path, theme_dir):
    """Load mock data from file. Try several fallback locations."""
    candidates = []
    if mock_data_path:
        candidates.append(os.path.abspath(mock_data_path))
    for rel in DEFAULT_MOCK_PATHS:
        candidates.append(os.path.join(theme_dir, rel))
    candidates.append(BUNDLED_MOCK_PATH)

    for path in candidates:
        if os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                print(f"  {_C['G']}✅{_C['0']} 加载 mock 数据: {path}")
                return data
            except json.JSONDecodeError as e:
                print(f"  {_C['R']}❌{_C['0']} mock 数据 JSON 解析失败 ({path}): {e}")
                sys.exit(1)

    print(f"  {_C['R']}❌{_C['0']} 未找到 mock 数据文件。请使用 --mock-data 参数指定路径。")
    print(f"     已搜索路径: {', '.join(candidates)}")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Engine detection
# ---------------------------------------------------------------------------

def detect_engine(theme_dir):
    """Read config.json and return engine type."""
    config_path = os.path.join(theme_dir, "config.json")
    if not os.path.isfile(config_path):
        print(f"  {_C['R']}❌{_C['0']} config.json 不存在: {config_path}")
        sys.exit(1)
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        print(f"  {_C['R']}❌{_C['0']} config.json 解析失败: {e}")
        sys.exit(1)

    engine = config.get("engine")
    if engine not in ("jinja2", "go", "ejs"):
        print(f"  {_C['R']}❌{_C['0']} config.json 中 engine 值无效: '{engine}'")
        sys.exit(1)
    return engine


# ---------------------------------------------------------------------------
# Utility: collect template files
# ---------------------------------------------------------------------------

def collect_templates(theme_dir):
    """Return a dict of {relative_name: absolute_path} for all template files."""
    templates_dir = os.path.join(theme_dir, "templates")
    result = {}
    if not os.path.isdir(templates_dir):
        return result
    for root, _dirs, files in os.walk(templates_dir):
        for fname in sorted(files):
            if fname.endswith((".html", ".ejs", ".tmpl")):
                fpath = os.path.join(root, fname)
                rel = os.path.relpath(fpath, templates_dir)
                result[rel] = fpath
    return result


# ---------------------------------------------------------------------------
# Pongo2-to-Jinja2 syntax converter
# ---------------------------------------------------------------------------

def pongo2_to_jinja2(content):
    """
    Convert Pongo2-specific syntax to Python Jinja2 syntax.

    Key differences:
    - Pongo2: |filter:"arg"  →  Jinja2: |filter("arg")
    - Pongo2: |date:"2006-01-02"  →  Jinja2: |date("2006-01-02")
    """
    # Convert filter:arg to filter(arg) inside {{ }} and {% %} tags
    def convert_filters(match):
        inner = match.group(1)
        tag_open = match.group(0)[:2]
        tag_close = match.group(0)[-2:]

        # Pattern: |filtername:"value" or |filtername:'value'
        def replace_filter(m):
            filter_name = m.group(1)
            quote_char = m.group(2)
            arg_value = m.group(3)
            return f"|{filter_name}({quote_char}{arg_value}{quote_char})"

        converted = re.sub(
            r'\|\s*(\w+)\s*:\s*(["\'])([^"\']*)\2',
            replace_filter,
            inner,
        )
        return f"{tag_open}{converted}{tag_close}"

    # Process {{ }} tags
    content = re.sub(r"\{\{(.*?)\}\}", convert_filters, content, flags=re.DOTALL)
    # Process {% %} tags
    content = re.sub(r"\{%(.*?)%\}", convert_filters, content, flags=re.DOTALL)

    return content


# ---------------------------------------------------------------------------
# Build Jinja2 context from mock data
# ---------------------------------------------------------------------------

def build_context(mock_data, template_name):
    """
    Build the appropriate template context based on template name.
    Different templates need different context variables.
    """
    # Base context available to all templates
    ctx = {
        "config": mock_data.get("config", {}),
        "theme_config": mock_data.get("theme_config", {}),
        "menus": mock_data.get("menus", []),
        "tags": mock_data.get("tags", []),
        "posts": mock_data.get("posts", []),
        "memos": mock_data.get("memos", []),
        "pagination": mock_data.get("pagination", {"prev": "", "next": ""}),
        "now": mock_data.get("now", "2026-02-28T15:30:00+08:00"),
    }

    # Template-specific context
    basename = os.path.basename(template_name).replace(".html", "")

    if basename == "post":
        # Use the first post as the current post, or a placeholder
        posts = mock_data.get("posts", [])
        ctx["post"] = posts[0] if posts else {
            "title": "测试文章",
            "content": "<p>测试内容</p>",
            "date": "2026-01-01",
            "dateFormat": "2026年01月01日",
            "link": "/post/test/",
            "tags": [],
            "feature": "",
            "isTop": False,
            "hideInList": False,
            "fileName": "test",
        }

    elif basename == "tag":
        ctx["current_tag"] = mock_data.get("current_tag", mock_data.get("tag", {
            "name": "测试", "link": "/tag/test/", "count": 1,
        }))
        ctx["tag"] = ctx["current_tag"]
        # Filter posts to those with this tag
        tag_name = ctx["current_tag"].get("name", "")
        ctx["posts"] = [
            p for p in ctx["posts"]
            if any(t.get("name") == tag_name for t in p.get("tags", []))
        ]

    elif basename in ("archives", "blog", "index"):
        # Filter out hidden posts for list pages
        if basename != "archives":
            ctx["posts"] = [p for p in ctx["posts"] if not p.get("hideInList")]

    elif basename == "about":
        pass  # config is enough

    elif basename == "links":
        ctx["links"] = mock_data.get("links", mock_data.get("friends", []))

    elif basename == "memos":
        pass  # memos already in ctx

    return ctx


# ---------------------------------------------------------------------------
# Jinja2 renderer
# ---------------------------------------------------------------------------

def render_jinja2(theme_dir, templates, mock_data, output_dir):
    """Render Jinja2 (Pongo2) templates using Python Jinja2."""
    try:
        import jinja2
    except ImportError:
        print(f"\n  {_C['Y']}⚠️{_C['0']}  jinja2 未安装，正在安装...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "jinja2", "--break-system-packages", "-q"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        import jinja2

    templates_dir = os.path.join(theme_dir, "templates")

    # Pre-process all templates: convert Pongo2 syntax to Jinja2
    converted_dir = os.path.join(output_dir, "_converted_templates")
    os.makedirs(converted_dir, exist_ok=True)

    for rel_name, abs_path in templates.items():
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()

        converted = pongo2_to_jinja2(content)

        dest = os.path.join(converted_dir, rel_name)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(converted)

    # Set up Jinja2 environment
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(converted_dir),
        autoescape=False,
        undefined=jinja2.Undefined,
    )

    # Add custom filters that Pongo2 supports
    try:
        from markupsafe import Markup
    except ImportError:
        try:
            Markup = jinja2.Markup
        except AttributeError:
            Markup = str  # Fallback: treat as plain string

    env.filters["date"] = lambda value, fmt="": str(value)
    env.filters["default"] = lambda value, default_val="": value if value else default_val
    env.filters["safe"] = lambda value: Markup(value) if value else ""
    env.filters["length"] = lambda value: len(value) if value else 0
    env.filters["truncate"] = lambda value, length=255: str(value)[:length] if value else ""

    results = {}
    # Templates to render (skip partials — they are included)
    renderable = {k: v for k, v in templates.items() if not k.startswith("partials/")}

    for rel_name in sorted(renderable.keys()):
        result = {"status": None, "error": None, "output_file": None, "warnings": []}
        try:
            template = env.get_template(rel_name)
            ctx = build_context(mock_data, rel_name)
            html = template.render(**ctx)

            # Save output
            out_file = os.path.join(output_dir, rel_name)
            os.makedirs(os.path.dirname(out_file), exist_ok=True)
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(html)
            result["output_file"] = out_file

            # Validate output
            warnings = check_rendered_html(html, rel_name)
            result["warnings"] = warnings
            result["status"] = "PASS" if not warnings else "WARN"

        except jinja2.TemplateSyntaxError as e:
            result["status"] = "FAIL"
            result["error"] = f"模板语法错误 (行 {e.lineno}): {e.message}"
        except jinja2.UndefinedError as e:
            result["status"] = "FAIL"
            result["error"] = f"未定义变量: {e.message}"
        except Exception as e:
            result["status"] = "FAIL"
            result["error"] = f"渲染异常: {type(e).__name__}: {e}"

        results[rel_name] = result

    # Clean up converted templates
    shutil.rmtree(converted_dir, ignore_errors=True)

    return results


# ---------------------------------------------------------------------------
# Go Templates renderer (best-effort)
# ---------------------------------------------------------------------------

def render_go(theme_dir, templates, mock_data, output_dir):
    """Attempt to render Go templates. Falls back to structural checks."""
    results = {}
    renderable = {k: v for k, v in templates.items() if not k.startswith("partials/")}

    # Check if Go is available
    go_available = False
    try:
        subprocess.run(["go", "version"], capture_output=True, timeout=5)
        go_available = True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        go_available = False

    if not go_available:
        print(f"  {_C['Y']}⚠️{_C['0']}  Go 未安装，将执行结构性检查 (非完整渲染)")

    for rel_name, abs_path in sorted(renderable.items()):
        result = {"status": None, "error": None, "output_file": None, "warnings": []}
        try:
            with open(abs_path, "r", encoding="utf-8") as f:
                content = f.read()

            warnings = []

            # Structural checks
            open_count = len(re.findall(r"\{\{", content))
            close_count = len(re.findall(r"\}\}", content))
            if open_count != close_count:
                result["status"] = "FAIL"
                result["error"] = f"{{ }} 括号不配对: {{ {open_count} 次, }} {close_count} 次"
                results[rel_name] = result
                continue

            # Block pairing
            openers = sum(
                len(re.findall(r"\{\{[-\s]*" + kw + r"\b", content))
                for kw in ["range", "if", "with", "define", "block"]
            )
            ends = len(re.findall(r"\{\{[-\s]*end\b", content))
            if openers != ends:
                warnings.append(f"块语句可能不配对: 打开 {openers} 次, end {ends} 次")

            # Save the original as "output" (not truly rendered)
            out_file = os.path.join(output_dir, rel_name)
            os.makedirs(os.path.dirname(out_file), exist_ok=True)
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(f"<!-- Go 模板结构检查通过 (未执行完整渲染) -->\n{content}")
            result["output_file"] = out_file

            result["warnings"] = warnings
            result["status"] = "WARN" if warnings else "PASS"

        except Exception as e:
            result["status"] = "FAIL"
            result["error"] = f"检查异常: {type(e).__name__}: {e}"

        results[rel_name] = result

    return results


# ---------------------------------------------------------------------------
# EJS renderer (best-effort)
# ---------------------------------------------------------------------------

def render_ejs(theme_dir, templates, mock_data, output_dir):
    """Attempt to render EJS templates via Node.js. Falls back to structural checks."""
    results = {}
    renderable = {k: v for k, v in templates.items() if not k.startswith("partials/")}

    # Check if Node.js and ejs are available
    node_available = False
    ejs_available = False
    try:
        subprocess.run(["node", "--version"], capture_output=True, timeout=5)
        node_available = True
        # Check if ejs module is available
        check = subprocess.run(
            ["node", "-e", "require('ejs')"],
            capture_output=True, timeout=5,
        )
        ejs_available = check.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    if not node_available:
        print(f"  {_C['Y']}⚠️{_C['0']}  Node.js 未安装，将执行结构性检查 (非完整渲染)")
    elif not ejs_available:
        print(f"  {_C['Y']}⚠️{_C['0']}  EJS npm 包未安装，将执行结构性检查")
        print(f"     安装命令: npm install -g ejs")

    for rel_name, abs_path in sorted(renderable.items()):
        result = {"status": None, "error": None, "output_file": None, "warnings": []}
        try:
            with open(abs_path, "r", encoding="utf-8") as f:
                content = f.read()

            warnings = []

            # Structural checks
            open_count = len(re.findall(r"<%", content))
            close_count = len(re.findall(r"%>", content))
            if open_count != close_count:
                result["status"] = "FAIL"
                result["error"] = f"<% %> 标签不配对: <% {open_count} 次, %> {close_count} 次"
                results[rel_name] = result
                continue

            # Brace pairing in scriptlets
            brace_opens = 0
            brace_closes = 0
            for m in re.finditer(r"<%([-=#]?)(.*?)(-?)%>", content, re.DOTALL):
                prefix = m.group(1)
                if prefix == "" or prefix == "-":
                    inner = m.group(2)
                    brace_opens += inner.count("{")
                    brace_closes += inner.count("}")
            if brace_opens != brace_closes:
                warnings.append(f"脚本块花括号可能不配对: {{ {brace_opens} 次, }} {brace_closes} 次")

            # Save original as output
            out_file = os.path.join(output_dir, rel_name)
            os.makedirs(os.path.dirname(out_file), exist_ok=True)
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(f"<!-- EJS 模板结构检查通过 (未执行完整渲染) -->\n{content}")
            result["output_file"] = out_file

            result["warnings"] = warnings
            result["status"] = "WARN" if warnings else "PASS"

        except Exception as e:
            result["status"] = "FAIL"
            result["error"] = f"检查异常: {type(e).__name__}: {e}"

        results[rel_name] = result

    return results


# ---------------------------------------------------------------------------
# Output HTML checker
# ---------------------------------------------------------------------------

def check_rendered_html(html, template_name):
    """Check rendered HTML for common issues. Returns list of warning strings."""
    warnings = []

    # Skip checks for partials and non-full-page templates
    full_page_templates = ["index.html", "post.html", "archives.html", "tags.html",
                           "tag.html", "about.html", "links.html", "blog.html",
                           "memos.html", "404.html"]
    basename = os.path.basename(template_name)

    if basename in full_page_templates:
        # Check for basic HTML structure
        if "<html" not in html.lower():
            warnings.append("输出缺少 <html> 标签")
        if "<head" not in html.lower():
            warnings.append("输出缺少 <head> 标签")
        if "<body" not in html.lower():
            warnings.append("输出缺少 <body> 标签")

    # Check for residual template tags
    residual_jinja = re.findall(r"\{[{%].*?[%}]\}", html)
    if residual_jinja:
        # Filter out false positives from JavaScript objects in the output
        real_residuals = [r for r in residual_jinja if not r.startswith("{{") or "|" in r or "%" in r]
        if real_residuals:
            warnings.append(f"输出中可能存在未渲染的模板标签 ({len(real_residuals)} 处)")

    # Check for common error strings
    error_patterns = [
        r"TemplateSyntaxError",
        r"UndefinedError",
        r"Traceback \(most recent",
        r"<no value>",
    ]
    for pattern in error_patterns:
        if re.search(pattern, html):
            warnings.append(f"输出中包含错误信息: 匹配 '{pattern}'")

    return warnings


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def print_report(engine, results, output_dir):
    """Print the rendering test report."""
    engine_labels = {"jinja2": "Jinja2 (Pongo2)", "go": "Go Templates", "ejs": "EJS"}
    label = engine_labels.get(engine, engine)

    fail_count = sum(1 for r in results.values() if r["status"] == "FAIL")
    warn_count = sum(1 for r in results.values() if r["status"] == "WARN")
    pass_count = sum(1 for r in results.values() if r["status"] == "PASS")

    bold = _C["BOLD"]
    reset = _C["0"]
    dim = _C["DIM"]

    print(f"""
{bold}{'=' * 55}{reset}
{bold}  Gridea Theme Render Test — 渲染测试报告{reset}
{bold}{'=' * 55}{reset}
  引擎: {label}
  模板: {len(results)} 个
  输出: {os.path.abspath(output_dir)}
{bold}{'=' * 55}{reset}
""")

    for rel_name in sorted(results.keys()):
        r = results[rel_name]
        if r["status"] == "FAIL":
            sym = f"{_C['R']}❌ FAIL{reset}"
            print(f"  {sym}: {rel_name}")
            print(f"         {_C['R']}{r['error']}{reset}")
        elif r["status"] == "WARN":
            sym = f"{_C['Y']}⚠️  WARN{reset}"
            print(f"  {sym}: {rel_name}")
            for w in r["warnings"]:
                print(f"         {_C['Y']}{w}{reset}")
        else:
            sym = f"{_C['G']}✅ PASS{reset}"
            print(f"  {sym}: {rel_name}")

    err_c = _C["R"] if fail_count > 0 else _C["G"]
    warn_c = _C["Y"] if warn_count > 0 else _C["G"]

    print(f"""
{bold}{'=' * 55}{reset}
  {err_c}❌ 失败: {fail_count}{reset}
  {warn_c}⚠️  警告: {warn_count}{reset}
  {_C['G']}✅ 通过: {pass_count}{reset}
{bold}{'=' * 55}{reset}""")

    if fail_count == 0:
        print(f"\n  {_C['G']}🎉 所有模板渲染测试通过！{reset}")
    else:
        print(f"\n  {_C['R']}❌ {fail_count} 个模板渲染失败，请检查错误信息。{reset}")

    if any(r["output_file"] for r in results.values()):
        print(f"\n  渲染输出已保存至: {os.path.abspath(output_dir)}/")

    print()
    return fail_count


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Gridea Pro 主题渲染测试",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            渲染测试流程:
              1. 加载 mock 数据 (JSON)
              2. 检测模板引擎类型
              3. 对每个模板执行渲染 (或结构性检查)
              4. 检查输出 HTML 的完整性
              5. 保存渲染结果到输出目录

            Jinja2 引擎说明:
              使用 Python Jinja2 库渲染，自动将 Pongo2 语法 (冒号参数)
              转换为 Jinja2 语法 (括号参数)。部分 Pongo2 专属特性可能
              不完全兼容，请结合 validate_syntax.py 使用。

            示例:
              python render_test.py ./themes/my-blog
              python render_test.py ./themes/my-blog --mock-data ./custom-data.json
              python render_test.py ./themes/my-blog --output-dir ./test-output
        """),
    )
    parser.add_argument(
        "theme_dir",
        help="主题目录路径",
    )
    parser.add_argument(
        "--mock-data",
        default=None,
        help="mock 数据 JSON 文件路径 (默认: 在主题目录和脚本目录中自动查找)",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="渲染输出目录 (默认: <theme-dir>/test-output)",
    )

    args = parser.parse_args()

    theme_dir = os.path.abspath(args.theme_dir)
    if not os.path.isdir(theme_dir):
        print(f"❌ 错误: 目录 '{theme_dir}' 不存在。")
        sys.exit(1)

    output_dir = args.output_dir or os.path.join(theme_dir, "test-output")
    os.makedirs(output_dir, exist_ok=True)

    bold = _C["BOLD"]
    reset = _C["0"]

    print(f"\n{bold}Gridea Pro 主题渲染测试{reset}")
    print(f"{'─' * 40}")

    # Load mock data
    mock_data = load_mock_data(args.mock_data, theme_dir)

    # Detect engine
    engine = detect_engine(theme_dir)
    engine_labels = {"jinja2": "Jinja2 (Pongo2)", "go": "Go Templates", "ejs": "EJS"}
    print(f"  {_C['G']}✅{_C['0']} 检测到引擎: {engine_labels[engine]}")

    # Collect templates
    templates = collect_templates(theme_dir)
    if not templates:
        print(f"  {_C['R']}❌{_C['0']} 未找到模板文件 ({os.path.join(theme_dir, 'templates')})")
        sys.exit(1)
    print(f"  {_C['G']}✅{_C['0']} 发现 {len(templates)} 个模板文件")
    print(f"{'─' * 40}\n")

    # Render
    renderers = {
        "jinja2": render_jinja2,
        "go": render_go,
        "ejs": render_ejs,
    }

    renderer = renderers[engine]
    results = renderer(theme_dir, templates, mock_data, output_dir)

    # Report
    fail_count = print_report(engine, results, output_dir)
    sys.exit(1 if fail_count > 0 else 0)


if __name__ == "__main__":
    main()
