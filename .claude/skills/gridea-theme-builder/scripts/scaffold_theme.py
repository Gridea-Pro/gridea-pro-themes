#!/usr/bin/env python3
"""
Gridea Pro 主题脚手架生成器

用法:
  python scaffold_theme.py <theme-name> --engine jinja2|go|ejs [--output-dir ./themes] [--author "Your Name"]

示例:
  python scaffold_theme.py my-blog --engine jinja2
  python scaffold_theme.py my-blog --engine go --output-dir ./themes --author "张三"
"""

import argparse
import os
import json
import sys
import textwrap
from pathlib import Path
from datetime import datetime

SUPPORTED_ENGINES = ("jinja2", "go", "ejs")

TEMPLATE_FILES = [
    "base.html",
    "index.html",
    "post.html",
    "archives.html",
    "tag.html",
    "tags.html",
    "about.html",
    "links.html",
    "blog.html",
    "memos.html",
    "404.html",
]

PARTIAL_FILES = [
    "head.html",
    "header.html",
    "footer.html",
    "post-card.html",
]

# ---------------------------------------------------------------------------
# Jinja2 (Pongo2) templates
# ---------------------------------------------------------------------------

JINJA2_TEMPLATES = {}

JINJA2_TEMPLATES["base.html"] = textwrap.dedent("""\
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        {% include "partials/head.html" %}
    </head>
    <body class="{% block body_class %}page{% endblock %}">
        {% include "partials/header.html" %}

        <main class="site-main">
            {% block content %}{% endblock %}
        </main>

        {% include "partials/footer.html" %}

        {% block scripts %}{% endblock %}
    </body>
    </html>
""")

JINJA2_TEMPLATES["index.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}home{% endblock %}

    {% block content %}
    <div class="post-list">
        {% for post in posts %}
            {% if not post.hideInList %}
                {% include "partials/post-card.html" %}
            {% endif %}
        {% endfor %}
    </div>

    <nav class="pagination">
        {% if pagination.prev %}
            <a class="pagination-prev" href="{{ pagination.prev }}">← 上一页</a>
        {% endif %}
        {% if pagination.next %}
            <a class="pagination-next" href="{{ pagination.next }}">下一页 →</a>
        {% endif %}
    </nav>
    {% endblock %}
""")

JINJA2_TEMPLATES["post.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}post-detail{% endblock %}

    {% block content %}
    <article class="post">
        <header class="post-header">
            <h1 class="post-title">{{ post.title }}</h1>
            <time class="post-date" datetime="{{ post.date }}">{{ post.dateFormat }}</time>
            {% if post.tags %}
            <div class="post-tags">
                {% for tag in post.tags %}
                    <a href="{{ tag.link }}" class="tag">{{ tag.name }}</a>
                {% endfor %}
            </div>
            {% endif %}
        </header>

        {% if post.feature %}
        <div class="post-feature">
            <img src="{{ post.feature }}" alt="{{ post.title }}">
        </div>
        {% endif %}

        <div class="post-content">
            {{ post.content|safe }}
        </div>
    </article>
    {% endblock %}
""")

JINJA2_TEMPLATES["archives.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}archives{% endblock %}

    {% block content %}
    <div class="archives-page">
        <h1 class="page-title">归档</h1>
        <ul class="archive-list">
            {% for post in posts %}
            <li class="archive-item">
                <time datetime="{{ post.date }}">{{ post.dateFormat }}</time>
                <a href="{{ post.link }}">{{ post.title }}</a>
            </li>
            {% endfor %}
        </ul>
    </div>
    {% endblock %}
""")

JINJA2_TEMPLATES["tag.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}tag{% endblock %}

    {% block content %}
    <div class="tag-page">
        <h1 class="page-title">标签: {{ current_tag.name }}</h1>
        <div class="post-list">
            {% for post in posts %}
                {% include "partials/post-card.html" %}
            {% endfor %}
        </div>
    </div>
    {% endblock %}
""")

JINJA2_TEMPLATES["tags.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}tags{% endblock %}

    {% block content %}
    <div class="tags-page">
        <h1 class="page-title">标签</h1>
        <div class="tag-cloud">
            {% for tag in tags %}
                <a href="{{ tag.link }}" class="tag-item" title="{{ tag.count }} 篇文章">
                    {{ tag.name }} <span class="tag-count">({{ tag.count }})</span>
                </a>
            {% endfor %}
        </div>
    </div>
    {% endblock %}
""")

JINJA2_TEMPLATES["about.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}about{% endblock %}

    {% block content %}
    <div class="about-page">
        <h1 class="page-title">关于</h1>
        <div class="about-content">
            <img class="about-avatar" src="{{ config.avatar }}" alt="{{ config.siteName }}">
            <p>{{ config.siteDescription }}</p>
        </div>
    </div>
    {% endblock %}
""")

JINJA2_TEMPLATES["links.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}links{% endblock %}

    {% block content %}
    <div class="links-page">
        <h1 class="page-title">友情链接</h1>
        <div class="links-list">
            {% if links|length > 0 %}
                {% for link in links %}
                    <a class="link-item" href="{{ link.url }}" target="_blank" rel="noopener">
                        {% if link.avatar %}<img src="{{ link.avatar }}" alt="{{ link.name }}" />{% endif %}
                        <div>
                            <div class="link-name">{{ link.name }}</div>
                            {% if link.description %}<div class="link-desc">{{ link.description }}</div>{% endif %}
                        </div>
                    </a>
                {% endfor %}
            {% else %}
                <p>暂无友情链接。</p>
            {% endif %}
        </div>
    </div>
    {% endblock %}
""")

JINJA2_TEMPLATES["blog.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}blog{% endblock %}

    {% block content %}
    <div class="blog-page">
        <h1 class="page-title">博客</h1>
        <div class="post-list">
            {% for post in posts %}
                {% if not post.hideInList %}
                    {% include "partials/post-card.html" %}
                {% endif %}
            {% endfor %}
        </div>

        <nav class="pagination">
            {% if pagination.prev %}
                <a class="pagination-prev" href="{{ pagination.prev }}">← 上一页</a>
            {% endif %}
            {% if pagination.next %}
                <a class="pagination-next" href="{{ pagination.next }}">下一页 →</a>
            {% endif %}
        </nav>
    </div>
    {% endblock %}
""")

JINJA2_TEMPLATES["memos.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}memos{% endblock %}

    {% block content %}
    <div class="memos-page">
        <h1 class="page-title">闪念</h1>
        <div class="memos-list">
            {% for memo in memos %}
            <div class="memo-item">
                <div class="memo-content">{{ memo.content|safe }}</div>
                <time class="memo-date" datetime="{{ memo.date }}">{{ memo.dateFormat }}</time>
            </div>
            {% endfor %}
        </div>
    </div>
    {% endblock %}
""")

JINJA2_TEMPLATES["404.html"] = textwrap.dedent("""\
    {% extends "base.html" %}

    {% block body_class %}error-page{% endblock %}

    {% block content %}
    <div class="error-404">
        <h1>404</h1>
        <p>页面未找到</p>
        <a href="/">返回首页</a>
    </div>
    {% endblock %}
""")

# Partials

JINJA2_TEMPLATES["partials/head.html"] = textwrap.dedent("""\
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}{{ config.siteName|default:"Gridea Blog" }}{% endblock %}</title>
    <meta name="description" content="{{ config.siteDescription|default:"" }}">
    {% if config.favicon %}
    <link rel="icon" href="{{ config.favicon }}">
    {% endif %}
    <link rel="stylesheet" href="/styles/main.css">
""")

JINJA2_TEMPLATES["partials/header.html"] = textwrap.dedent("""\
    <header class="site-header">
        <div class="header-inner">
            <a class="site-logo" href="/">
                {% if config.logo %}
                    <img src="{{ config.logo }}" alt="{{ config.siteName }}">
                {% else %}
                    <span>{{ config.siteName|default:"Blog" }}</span>
                {% endif %}
            </a>
            <nav class="site-nav">
                {% for menu in menus %}
                    <a class="nav-link" href="{{ menu.link }}">{{ menu.name }}</a>
                {% endfor %}
            </nav>
        </div>
    </header>
""")

JINJA2_TEMPLATES["partials/footer.html"] = textwrap.dedent("""\
    <footer class="site-footer">
        <div class="footer-inner">
            <p class="footer-copyright">
                &copy; {{ now|date:"2006" }} {{ config.siteName|default:"Blog" }}. All rights reserved.
            </p>
            {% if config.footerInfo %}
            <p class="footer-info">{{ config.footerInfo|safe }}</p>
            {% endif %}
        </div>
    </footer>
""")

JINJA2_TEMPLATES["partials/post-card.html"] = textwrap.dedent("""\
    <article class="post-card">
        {% if post.feature %}
        <div class="post-card-image">
            <a href="{{ post.link }}">
                <img src="{{ post.feature }}" alt="{{ post.title }}">
            </a>
        </div>
        {% endif %}
        <div class="post-card-body">
            {% if post.isTop %}
                <span class="post-pin">置顶</span>
            {% endif %}
            <h2 class="post-card-title">
                <a href="{{ post.link }}">{{ post.title }}</a>
            </h2>
            <time class="post-card-date" datetime="{{ post.date }}">{{ post.dateFormat }}</time>
            {% if post.tags %}
            <div class="post-card-tags">
                {% for tag in post.tags %}
                    <a href="{{ tag.link }}" class="tag">{{ tag.name }}</a>
                {% endfor %}
            </div>
            {% endif %}
        </div>
    </article>
""")

# ---------------------------------------------------------------------------
# Go Templates
# ---------------------------------------------------------------------------

GO_TEMPLATES = {}

GO_TEMPLATES["base.html"] = textwrap.dedent("""\
    {{ define "base" }}
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        {{ template "head" . }}
    </head>
    <body class="{{ block "body_class" . }}page{{ end }}">
        {{ template "header" . }}

        <main class="site-main">
            {{ block "content" . }}{{ end }}
        </main>

        {{ template "footer" . }}

        {{ block "scripts" . }}{{ end }}
    </body>
    </html>
    {{ end }}
""")

GO_TEMPLATES["index.html"] = textwrap.dedent("""\
    {{ define "body_class" }}home{{ end }}

    {{ define "content" }}
    <div class="post-list">
        {{ range .Posts }}
            {{ if not .HideInList }}
                {{ template "post-card" . }}
            {{ end }}
        {{ end }}
    </div>

    <nav class="pagination">
        {{ if .Pagination.Prev }}
            <a class="pagination-prev" href="{{ .Pagination.Prev }}">\\u2190 上一页</a>
        {{ end }}
        {{ if .Pagination.Next }}
            <a class="pagination-next" href="{{ .Pagination.Next }}">下一页 \\u2192</a>
        {{ end }}
    </nav>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["post.html"] = textwrap.dedent("""\
    {{ define "body_class" }}post-detail{{ end }}

    {{ define "content" }}
    <article class="post">
        <header class="post-header">
            <h1 class="post-title">{{ .Post.Title }}</h1>
            <time class="post-date" datetime="{{ .Post.Date }}">{{ .Post.DateFormat }}</time>
            {{ if .Post.Tags }}
            <div class="post-tags">
                {{ range .Post.Tags }}
                    <a href="{{ .Link }}" class="tag">{{ .Name }}</a>
                {{ end }}
            </div>
            {{ end }}
        </header>

        {{ if .Post.Feature }}
        <div class="post-feature">
            <img src="{{ .Post.Feature }}" alt="{{ .Post.Title }}">
        </div>
        {{ end }}

        <div class="post-content">
            {{ .Post.Content }}
        </div>
    </article>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["archives.html"] = textwrap.dedent("""\
    {{ define "body_class" }}archives{{ end }}

    {{ define "content" }}
    <div class="archives-page">
        <h1 class="page-title">归档</h1>
        <ul class="archive-list">
            {{ range .Posts }}
            <li class="archive-item">
                <time datetime="{{ .Date }}">{{ .DateFormat }}</time>
                <a href="{{ .Link }}">{{ .Title }}</a>
            </li>
            {{ end }}
        </ul>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["tag.html"] = textwrap.dedent("""\
    {{ define "body_class" }}tag{{ end }}

    {{ define "content" }}
    <div class="tag-page">
        <h1 class="page-title">标签: {{ .CurrentTag.Name }}</h1>
        <div class="post-list">
            {{ range .Posts }}
                {{ template "post-card" . }}
            {{ end }}
        </div>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["tags.html"] = textwrap.dedent("""\
    {{ define "body_class" }}tags{{ end }}

    {{ define "content" }}
    <div class="tags-page">
        <h1 class="page-title">标签</h1>
        <div class="tag-cloud">
            {{ range .Tags }}
                <a href="{{ .Link }}" class="tag-item" title="{{ .Count }} 篇文章">
                    {{ .Name }} <span class="tag-count">({{ .Count }})</span>
                </a>
            {{ end }}
        </div>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["about.html"] = textwrap.dedent("""\
    {{ define "body_class" }}about{{ end }}

    {{ define "content" }}
    <div class="about-page">
        <h1 class="page-title">关于</h1>
        <div class="about-content">
            <img class="about-avatar" src="{{ .Config.Avatar }}" alt="{{ .Config.SiteName }}">
            <p>{{ .Config.SiteDescription }}</p>
        </div>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["links.html"] = textwrap.dedent("""\
    {{ define "body_class" }}links{{ end }}

    {{ define "content" }}
    <div class="links-page">
        <h1 class="page-title">友情链接</h1>
        <div class="links-list">
            {{ if .Links }}
                {{ range .Links }}
                <a class="link-item" href="{{ .URL }}" target="_blank" rel="noopener">
                    {{ if .Avatar }}<img src="{{ .Avatar }}" alt="{{ .Name }}" />{{ end }}
                    <div>
                        <div class="link-name">{{ .Name }}</div>
                        {{ if .Description }}<div class="link-desc">{{ .Description }}</div>{{ end }}
                    </div>
                </a>
                {{ end }}
            {{ else }}
                <p>暂无友情链接。</p>
            {{ end }}
        </div>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["blog.html"] = textwrap.dedent("""\
    {{ define "body_class" }}blog{{ end }}

    {{ define "content" }}
    <div class="blog-page">
        <h1 class="page-title">博客</h1>
        <div class="post-list">
            {{ range .Posts }}
                {{ if not .HideInList }}
                    {{ template "post-card" . }}
                {{ end }}
            {{ end }}
        </div>

        <nav class="pagination">
            {{ if .Pagination.Prev }}
                <a class="pagination-prev" href="{{ .Pagination.Prev }}">\\u2190 上一页</a>
            {{ end }}
            {{ if .Pagination.Next }}
                <a class="pagination-next" href="{{ .Pagination.Next }}">下一页 \\u2192</a>
            {{ end }}
        </nav>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["memos.html"] = textwrap.dedent("""\
    {{ define "body_class" }}memos{{ end }}

    {{ define "content" }}
    <div class="memos-page">
        <h1 class="page-title">闪念</h1>
        <div class="memos-list">
            {{ range .Memos }}
            <div class="memo-item">
                <div class="memo-content">{{ .Content }}</div>
                <time class="memo-date" datetime="{{ .Date }}">{{ .DateFormat }}</time>
            </div>
            {{ end }}
        </div>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["404.html"] = textwrap.dedent("""\
    {{ define "body_class" }}error-page{{ end }}

    {{ define "content" }}
    <div class="error-404">
        <h1>404</h1>
        <p>页面未找到</p>
        <a href="/">返回首页</a>
    </div>
    {{ end }}

    {{ template "base" . }}
""")

GO_TEMPLATES["partials/head.html"] = textwrap.dedent("""\
    {{ define "head" }}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ block "title" . }}{{ .Config.SiteName }}{{ end }}</title>
    <meta name="description" content="{{ .Config.SiteDescription }}">
    {{ if .Config.Favicon }}
    <link rel="icon" href="{{ .Config.Favicon }}">
    {{ end }}
    <link rel="stylesheet" href="/styles/main.css">
    {{ end }}
""")

GO_TEMPLATES["partials/header.html"] = textwrap.dedent("""\
    {{ define "header" }}
    <header class="site-header">
        <div class="header-inner">
            <a class="site-logo" href="/">
                {{ if .Config.Logo }}
                    <img src="{{ .Config.Logo }}" alt="{{ .Config.SiteName }}">
                {{ else }}
                    <span>{{ .Config.SiteName }}</span>
                {{ end }}
            </a>
            <nav class="site-nav">
                {{ range .Menus }}
                    <a class="nav-link" href="{{ .Link }}">{{ .Name }}</a>
                {{ end }}
            </nav>
        </div>
    </header>
    {{ end }}
""")

GO_TEMPLATES["partials/footer.html"] = textwrap.dedent("""\
    {{ define "footer" }}
    <footer class="site-footer">
        <div class="footer-inner">
            <p class="footer-copyright">
                &copy; {{ .Config.SiteName }}. All rights reserved.
            </p>
            {{ if .Config.FooterInfo }}
            <p class="footer-info">{{ .Config.FooterInfo }}</p>
            {{ end }}
        </div>
    </footer>
    {{ end }}
""")

GO_TEMPLATES["partials/post-card.html"] = textwrap.dedent("""\
    {{ define "post-card" }}
    <article class="post-card">
        {{ if .Feature }}
        <div class="post-card-image">
            <a href="{{ .Link }}">
                <img src="{{ .Feature }}" alt="{{ .Title }}">
            </a>
        </div>
        {{ end }}
        <div class="post-card-body">
            {{ if .IsTop }}
                <span class="post-pin">置顶</span>
            {{ end }}
            <h2 class="post-card-title">
                <a href="{{ .Link }}">{{ .Title }}</a>
            </h2>
            <time class="post-card-date" datetime="{{ .Date }}">{{ .DateFormat }}</time>
            {{ if .Tags }}
            <div class="post-card-tags">
                {{ range .Tags }}
                    <a href="{{ .Link }}" class="tag">{{ .Name }}</a>
                {{ end }}
            </div>
            {{ end }}
        </div>
    </article>
    {{ end }}
""")

# ---------------------------------------------------------------------------
# EJS Templates
# ---------------------------------------------------------------------------

EJS_TEMPLATES = {}

EJS_TEMPLATES["base.html"] = textwrap.dedent("""\
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <%- include('partials/head') %>
    </head>
    <body class="<%= typeof bodyClass !== 'undefined' ? bodyClass : 'page' %>">
        <%- include('partials/header') %>

        <main class="site-main">
            <%- body %>
        </main>

        <%- include('partials/footer') %>
    </body>
    </html>
""")

EJS_TEMPLATES["index.html"] = textwrap.dedent("""\
    <% var bodyClass = 'home'; %>
    <div class="post-list">
        <% posts.forEach(function(post) { %>
            <% if (!post.hideInList) { %>
                <%- include('partials/post-card', { post: post }) %>
            <% } %>
        <% }); %>
    </div>

    <nav class="pagination">
        <% if (pagination.prev) { %>
            <a class="pagination-prev" href="<%= pagination.prev %>">&larr; 上一页</a>
        <% } %>
        <% if (pagination.next) { %>
            <a class="pagination-next" href="<%= pagination.next %>">下一页 &rarr;</a>
        <% } %>
    </nav>
""")

EJS_TEMPLATES["post.html"] = textwrap.dedent("""\
    <% var bodyClass = 'post-detail'; %>
    <article class="post">
        <header class="post-header">
            <h1 class="post-title"><%= post.title %></h1>
            <time class="post-date" datetime="<%= post.date %>"><%= post.dateFormat %></time>
            <% if (post.tags && post.tags.length > 0) { %>
            <div class="post-tags">
                <% post.tags.forEach(function(tag) { %>
                    <a href="<%= tag.link %>" class="tag"><%= tag.name %></a>
                <% }); %>
            </div>
            <% } %>
        </header>

        <% if (post.feature) { %>
        <div class="post-feature">
            <img src="<%= post.feature %>" alt="<%= post.title %>">
        </div>
        <% } %>

        <div class="post-content">
            <%- post.content %>
        </div>
    </article>
""")

EJS_TEMPLATES["archives.html"] = textwrap.dedent("""\
    <% var bodyClass = 'archives'; %>
    <div class="archives-page">
        <h1 class="page-title">归档</h1>
        <ul class="archive-list">
            <% posts.forEach(function(post) { %>
            <li class="archive-item">
                <time datetime="<%= post.date %>"><%= post.dateFormat %></time>
                <a href="<%= post.link %>"><%= post.title %></a>
            </li>
            <% }); %>
        </ul>
    </div>
""")

EJS_TEMPLATES["tag.html"] = textwrap.dedent("""\
    <% var bodyClass = 'tag'; %>
    <div class="tag-page">
        <h1 class="page-title">标签: <%= current_tag.name %></h1>
        <div class="post-list">
            <% posts.forEach(function(post) { %>
                <%- include('partials/post-card', { post: post }) %>
            <% }); %>
        </div>
    </div>
""")

EJS_TEMPLATES["tags.html"] = textwrap.dedent("""\
    <% var bodyClass = 'tags'; %>
    <div class="tags-page">
        <h1 class="page-title">标签</h1>
        <div class="tag-cloud">
            <% tags.forEach(function(tag) { %>
                <a href="<%= tag.link %>" class="tag-item" title="<%= tag.count %> 篇文章">
                    <%= tag.name %> <span class="tag-count">(<%= tag.count %>)</span>
                </a>
            <% }); %>
        </div>
    </div>
""")

EJS_TEMPLATES["about.html"] = textwrap.dedent("""\
    <% var bodyClass = 'about'; %>
    <div class="about-page">
        <h1 class="page-title">关于</h1>
        <div class="about-content">
            <img class="about-avatar" src="<%= config.avatar %>" alt="<%= config.siteName %>">
            <p><%= config.siteDescription %></p>
        </div>
    </div>
""")

EJS_TEMPLATES["links.html"] = textwrap.dedent("""\
    <% var bodyClass = 'links'; %>
    <div class="links-page">
        <h1 class="page-title">友情链接</h1>
        <div class="links-list">
            <% if (locals.links && links.length > 0) { %>
                <% links.forEach(function(link) { %>
                    <a class="link-item" href="<%= link.url %>" target="_blank" rel="noopener">
                        <% if (link.avatar) { %><img src="<%= link.avatar %>" alt="<%= link.name %>" /><% } %>
                        <div>
                            <div class="link-name"><%= link.name %></div>
                            <% if (link.description) { %><div class="link-desc"><%= link.description %></div><% } %>
                        </div>
                    </a>
                <% }); %>
            <% } else { %>
                <p>暂无友情链接。</p>
            <% } %>
        </div>
    </div>
""")

EJS_TEMPLATES["blog.html"] = textwrap.dedent("""\
    <% var bodyClass = 'blog'; %>
    <div class="blog-page">
        <h1 class="page-title">博客</h1>
        <div class="post-list">
            <% posts.forEach(function(post) { %>
                <% if (!post.hideInList) { %>
                    <%- include('partials/post-card', { post: post }) %>
                <% } %>
            <% }); %>
        </div>

        <nav class="pagination">
            <% if (pagination.prev) { %>
                <a class="pagination-prev" href="<%= pagination.prev %>">&larr; 上一页</a>
            <% } %>
            <% if (pagination.next) { %>
                <a class="pagination-next" href="<%= pagination.next %>">下一页 &rarr;</a>
            <% } %>
        </nav>
    </div>
""")

EJS_TEMPLATES["memos.html"] = textwrap.dedent("""\
    <% var bodyClass = 'memos'; %>
    <div class="memos-page">
        <h1 class="page-title">闪念</h1>
        <div class="memos-list">
            <% memos.forEach(function(memo) { %>
            <div class="memo-item">
                <div class="memo-content"><%- memo.content %></div>
                <time class="memo-date" datetime="<%= memo.date %>"><%= memo.dateFormat %></time>
            </div>
            <% }); %>
        </div>
    </div>
""")

EJS_TEMPLATES["404.html"] = textwrap.dedent("""\
    <% var bodyClass = 'error-page'; %>
    <div class="error-404">
        <h1>404</h1>
        <p>页面未找到</p>
        <a href="/">返回首页</a>
    </div>
""")

EJS_TEMPLATES["partials/head.html"] = textwrap.dedent("""\
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= config.siteName || 'Gridea Blog' %></title>
    <meta name="description" content="<%= config.siteDescription || '' %>">
    <% if (config.favicon) { %>
    <link rel="icon" href="<%= config.favicon %>">
    <% } %>
    <link rel="stylesheet" href="/styles/main.css">
""")

EJS_TEMPLATES["partials/header.html"] = textwrap.dedent("""\
    <header class="site-header">
        <div class="header-inner">
            <a class="site-logo" href="/">
                <% if (config.logo) { %>
                    <img src="<%= config.logo %>" alt="<%= config.siteName %>">
                <% } else { %>
                    <span><%= config.siteName || 'Blog' %></span>
                <% } %>
            </a>
            <nav class="site-nav">
                <% menus.forEach(function(menu) { %>
                    <a class="nav-link" href="<%= menu.link %>"><%= menu.name %></a>
                <% }); %>
            </nav>
        </div>
    </header>
""")

EJS_TEMPLATES["partials/footer.html"] = textwrap.dedent("""\
    <footer class="site-footer">
        <div class="footer-inner">
            <p class="footer-copyright">
                &copy; <%= new Date().getFullYear() %> <%= config.siteName || 'Blog' %>. All rights reserved.
            </p>
            <% if (config.footerInfo) { %>
            <p class="footer-info"><%- config.footerInfo %></p>
            <% } %>
        </div>
    </footer>
""")

EJS_TEMPLATES["partials/post-card.html"] = textwrap.dedent("""\
    <article class="post-card">
        <% if (post.feature) { %>
        <div class="post-card-image">
            <a href="<%= post.link %>">
                <img src="<%= post.feature %>" alt="<%= post.title %>">
            </a>
        </div>
        <% } %>
        <div class="post-card-body">
            <% if (post.isTop) { %>
                <span class="post-pin">置顶</span>
            <% } %>
            <h2 class="post-card-title">
                <a href="<%= post.link %>"><%= post.title %></a>
            </h2>
            <time class="post-card-date" datetime="<%= post.date %>"><%= post.dateFormat %></time>
            <% if (post.tags && post.tags.length > 0) { %>
            <div class="post-card-tags">
                <% post.tags.forEach(function(tag) { %>
                    <a href="<%= tag.link %>" class="tag"><%= tag.name %></a>
                <% }); %>
            </div>
            <% } %>
        </div>
    </article>
""")

# ---------------------------------------------------------------------------
# Starter CSS
# ---------------------------------------------------------------------------

STARTER_CSS = textwrap.dedent("""\
    /* ============================================
       Gridea Theme — 基础样式
       ============================================ */

    /* --- Reset & Base --- */
    *, *::before, *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :root {
        --color-primary: #2563eb;
        --color-text: #1f2937;
        --color-text-secondary: #6b7280;
        --color-bg: #ffffff;
        --color-bg-secondary: #f9fafb;
        --color-border: #e5e7eb;
        --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                     'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif;
        --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        --max-width: 720px;
        --header-height: 64px;
    }

    html {
        font-size: 16px;
        line-height: 1.75;
        -webkit-font-smoothing: antialiased;
    }

    body {
        font-family: var(--font-sans);
        color: var(--color-text);
        background-color: var(--color-bg);
    }

    a {
        color: var(--color-primary);
        text-decoration: none;
        transition: color 0.2s;
    }

    a:hover {
        text-decoration: underline;
    }

    img {
        max-width: 100%;
        height: auto;
    }

    /* --- Layout --- */
    .site-header {
        position: sticky;
        top: 0;
        z-index: 100;
        height: var(--header-height);
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
    }

    .header-inner {
        max-width: var(--max-width);
        margin: 0 auto;
        padding: 0 1.5rem;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .site-logo img {
        height: 32px;
    }

    .site-logo span {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text);
    }

    .site-nav {
        display: flex;
        gap: 1.25rem;
    }

    .nav-link {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
    }

    .nav-link:hover {
        color: var(--color-primary);
        text-decoration: none;
    }

    .site-main {
        max-width: var(--max-width);
        margin: 2rem auto;
        padding: 0 1.5rem;
        min-height: calc(100vh - var(--header-height) - 200px);
    }

    .site-footer {
        border-top: 1px solid var(--color-border);
        padding: 2rem 1.5rem;
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
    }

    .footer-inner {
        max-width: var(--max-width);
        margin: 0 auto;
    }

    /* --- Page Titles --- */
    .page-title {
        font-size: 1.75rem;
        margin-bottom: 2rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid var(--color-border);
    }

    /* --- Post Card --- */
    .post-card {
        margin-bottom: 2.5rem;
        padding-bottom: 2.5rem;
        border-bottom: 1px solid var(--color-border);
    }

    .post-card:last-child {
        border-bottom: none;
    }

    .post-card-image img {
        width: 100%;
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .post-pin {
        display: inline-block;
        font-size: 0.75rem;
        background: var(--color-primary);
        color: #fff;
        padding: 0.1rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }

    .post-card-title {
        font-size: 1.35rem;
        line-height: 1.4;
        margin-bottom: 0.5rem;
    }

    .post-card-title a {
        color: var(--color-text);
    }

    .post-card-title a:hover {
        color: var(--color-primary);
        text-decoration: none;
    }

    .post-card-date {
        display: block;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.5rem;
    }

    .post-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    /* --- Tags --- */
    .tag {
        display: inline-block;
        font-size: 0.8rem;
        padding: 0.15rem 0.6rem;
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        color: var(--color-text-secondary);
    }

    .tag:hover {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
        text-decoration: none;
    }

    .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .tag-item {
        font-size: 0.95rem;
        padding: 0.3rem 0.8rem;
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        color: var(--color-text);
    }

    .tag-item:hover {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
        text-decoration: none;
    }

    .tag-count {
        color: var(--color-text-secondary);
        font-size: 0.8rem;
    }

    /* --- Post Detail --- */
    .post-header {
        margin-bottom: 2rem;
    }

    .post-title {
        font-size: 2rem;
        line-height: 1.3;
        margin-bottom: 0.75rem;
    }

    .post-date {
        display: block;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.75rem;
    }

    .post-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .post-feature {
        margin-bottom: 2rem;
    }

    .post-feature img {
        width: 100%;
        border-radius: 8px;
    }

    .post-content {
        line-height: 1.8;
    }

    .post-content h2 {
        font-size: 1.5rem;
        margin: 2rem 0 1rem;
    }

    .post-content h3 {
        font-size: 1.25rem;
        margin: 1.5rem 0 0.75rem;
    }

    .post-content p {
        margin-bottom: 1rem;
    }

    .post-content ul, .post-content ol {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }

    .post-content li {
        margin-bottom: 0.25rem;
    }

    .post-content blockquote {
        margin: 1rem 0;
        padding: 0.75rem 1.25rem;
        border-left: 4px solid var(--color-primary);
        background: var(--color-bg-secondary);
        color: var(--color-text-secondary);
    }

    .post-content pre {
        margin: 1rem 0;
        padding: 1rem;
        background: #1e293b;
        color: #e2e8f0;
        border-radius: 8px;
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.875rem;
        line-height: 1.6;
    }

    .post-content code {
        font-family: var(--font-mono);
        font-size: 0.875em;
        background: var(--color-bg-secondary);
        padding: 0.15em 0.35em;
        border-radius: 4px;
    }

    .post-content pre code {
        background: none;
        padding: 0;
    }

    .post-content table {
        width: 100%;
        margin: 1rem 0;
        border-collapse: collapse;
    }

    .post-content th, .post-content td {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--color-border);
        text-align: left;
    }

    .post-content th {
        background: var(--color-bg-secondary);
        font-weight: 600;
    }

    .post-content img {
        border-radius: 8px;
        margin: 1rem 0;
    }

    .post-content hr {
        margin: 2rem 0;
        border: none;
        border-top: 1px solid var(--color-border);
    }

    .post-content a {
        text-decoration: underline;
    }

    /* --- Pagination --- */
    .pagination {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--color-border);
    }

    .pagination a {
        font-size: 0.9rem;
    }

    /* --- Archives --- */
    .archive-list {
        list-style: none;
    }

    .archive-item {
        display: flex;
        gap: 1rem;
        padding: 0.5rem 0;
        border-bottom: 1px dashed var(--color-border);
    }

    .archive-item time {
        flex-shrink: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        font-family: var(--font-mono);
    }

    /* --- Memos --- */
    .memo-item {
        padding: 1.25rem;
        margin-bottom: 1rem;
        background: var(--color-bg-secondary);
        border-radius: 8px;
        border: 1px solid var(--color-border);
    }

    .memo-content {
        white-space: pre-wrap;
        margin-bottom: 0.75rem;
        line-height: 1.6;
    }

    .memo-date {
        display: block;
        font-size: 0.8rem;
        color: var(--color-text-secondary);
    }

    /* --- About --- */
    .about-avatar {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        margin-bottom: 1rem;
    }

    .about-content {
        text-align: center;
    }

    /* --- 404 --- */
    .error-404 {
        text-align: center;
        padding: 5rem 0;
    }

    .error-404 h1 {
        font-size: 6rem;
        color: var(--color-border);
        line-height: 1;
        margin-bottom: 1rem;
    }

    .error-404 p {
        font-size: 1.25rem;
        color: var(--color-text-secondary);
        margin-bottom: 2rem;
    }

    /* --- Responsive --- */
    @media (max-width: 640px) {
        :root {
            --max-width: 100%;
        }

        .site-nav {
            gap: 0.75rem;
        }

        .nav-link {
            font-size: 0.8rem;
        }

        .post-title {
            font-size: 1.5rem;
        }

        .page-title {
            font-size: 1.5rem;
        }
    }
""")


# ---------------------------------------------------------------------------
# Config generator
# ---------------------------------------------------------------------------

def build_config(theme_name, engine, author):
    """Build the config.json content for a theme."""
    config = {
        "name": theme_name,
        "version": "1.0.0",
        "engine": engine,
        "author": author or "Anonymous",
        "description": f"A Gridea Pro theme using {engine} engine.",
        "repository": "",
        "customConfig": [
            {
                "name": "primaryColor",
                "label": "主色调",
                "group": "样式",
                "type": "color",
                "value": "#2563eb",
                "note": "主题的主要颜色"
            },
            {
                "name": "showFeatureImage",
                "label": "显示封面图",
                "group": "样式",
                "type": "toggle",
                "value": True,
                "note": "是否在文章列表中显示封面图"
            },
            {
                "name": "postsPerPage",
                "label": "每页文章数",
                "group": "基础",
                "type": "input",
                "value": "10",
                "note": "首页和博客页每页显示的文章数量"
            },
            {
                "name": "enableDarkMode",
                "label": "暗色模式",
                "group": "样式",
                "type": "toggle",
                "value": False,
                "note": "启用暗色模式切换按钮"
            },
            {
                "name": "socialGithub",
                "label": "GitHub",
                "group": "社交",
                "type": "input",
                "value": "",
                "note": "GitHub 链接"
            },
            {
                "name": "socialTwitter",
                "label": "Twitter",
                "group": "社交",
                "type": "input",
                "value": "",
                "note": "Twitter 链接"
            },
            {
                "name": "footerSlogan",
                "label": "页脚标语",
                "group": "基础",
                "type": "input",
                "value": "",
                "note": "显示在页脚的一句话"
            },
            {
                "name": "customCSS",
                "label": "自定义 CSS",
                "group": "高级",
                "type": "textarea",
                "value": "",
                "note": "自定义 CSS 样式代码"
            },
            {
                "name": "customJS",
                "label": "自定义 JS",
                "group": "高级",
                "type": "textarea",
                "value": "",
                "note": "自定义 JavaScript 代码"
            }
        ]
    }
    return config


# ---------------------------------------------------------------------------
# Main scaffolding logic
# ---------------------------------------------------------------------------

def select_templates(engine):
    """Return the template dict for the given engine."""
    if engine == "jinja2":
        return JINJA2_TEMPLATES
    elif engine == "go":
        return GO_TEMPLATES
    elif engine == "ejs":
        return EJS_TEMPLATES
    else:
        raise ValueError(f"不支持的引擎类型: {engine}")


def create_theme(theme_name, engine, output_dir, author):
    """Create the full theme directory structure and files."""
    templates = select_templates(engine)
    theme_dir = Path(output_dir) / theme_name

    if theme_dir.exists():
        print(f"❌ 错误: 目录 '{theme_dir}' 已存在，请删除后重试或使用其他名称。")
        sys.exit(1)

    # Create directories
    dirs = [
        theme_dir / "assets" / "media" / "images",
        theme_dir / "assets" / "styles",
        theme_dir / "templates" / "partials",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)

    # Write config.json
    config = build_config(theme_name, engine, author)
    config_path = theme_dir / "config.json"
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    # Write template files
    for filename, content in templates.items():
        filepath = theme_dir / "templates" / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

    # Write CSS
    css_path = theme_dir / "assets" / "styles" / "main.css"
    with open(css_path, "w", encoding="utf-8") as f:
        f.write(STARTER_CSS)

    # Write a placeholder image README
    readme_path = theme_dir / "assets" / "media" / "images" / ".gitkeep"
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("")

    return theme_dir


def print_success(theme_dir, engine, theme_name):
    """Print a success message with next steps."""
    engine_label = {"jinja2": "Jinja2 (Pongo2)", "go": "Go Templates", "ejs": "EJS"}
    label = engine_label.get(engine, engine)

    tree_lines = []
    for root, dirs, files in os.walk(theme_dir):
        # Sort for consistent output
        dirs.sort()
        files.sort()
        level = len(Path(root).relative_to(theme_dir).parts)
        indent = "│   " * level
        basename = os.path.basename(root)
        if level == 0:
            tree_lines.append(f"{theme_name}/")
        else:
            tree_lines.append(f"{indent[:-4]}├── {basename}/")
        for i, fname in enumerate(files):
            connector = "└── " if i == len(files) - 1 and not dirs else "├── "
            tree_lines.append(f"{indent}{connector}{fname}")

    tree_str = "\n".join(tree_lines)

    file_count = sum(len(files) for _, _, files in os.walk(theme_dir))

    print(f"""
╔═══════════════════════════════════════════════════════╗
║          Gridea Theme Scaffold — 创建成功             ║
╚═══════════════════════════════════════════════════════╝

  主题名称: {theme_name}
  模板引擎: {label}
  输出路径: {theme_dir.resolve()}
  文件数量: {file_count}

  目录结构:
  {tree_str}

  下一步操作:
  ─────────────────────────────────────
  1. 编辑 config.json 中的 customConfig 配置项
  2. 修改 templates/ 中的模板文件
  3. 自定义 assets/styles/main.css 样式
  4. 运行语法验证:
     python validate_syntax.py {theme_dir}
  5. 运行渲染测试:
     python render_test.py {theme_dir}
  6. 将主题目录复制到 Gridea Pro 的 themes 目录中预览
""")


def main():
    parser = argparse.ArgumentParser(
        description="Gridea Pro 主题脚手架生成器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            支持的模板引擎:
              jinja2  — Jinja2 (Pongo2 兼容) 模板
              go      — Go Templates 模板
              ejs     — EJS 模板

            示例:
              python scaffold_theme.py my-blog --engine jinja2
              python scaffold_theme.py my-blog --engine go --output-dir ./themes --author "张三"
        """),
    )
    parser.add_argument(
        "theme_name",
        help="主题名称 (将作为目录名)",
    )
    parser.add_argument(
        "--engine",
        required=True,
        choices=SUPPORTED_ENGINES,
        help="模板引擎类型: jinja2, go, ejs",
    )
    parser.add_argument(
        "--output-dir",
        default=".",
        help="输出目录 (默认: 当前目录)",
    )
    parser.add_argument(
        "--author",
        default="",
        help="主题作者名称",
    )

    args = parser.parse_args()

    # Validate theme name
    if not args.theme_name.replace("-", "").replace("_", "").isalnum():
        print("❌ 错误: 主题名称只能包含字母、数字、短横线和下划线。")
        sys.exit(1)

    # Create the theme
    print(f"\n🔧 正在创建主题 '{args.theme_name}' (引擎: {args.engine})...\n")

    try:
        theme_dir = create_theme(
            args.theme_name,
            args.engine,
            args.output_dir,
            args.author,
        )
    except Exception as e:
        print(f"❌ 创建主题时发生错误: {e}")
        sys.exit(1)

    print_success(theme_dir, args.engine, args.theme_name)


if __name__ == "__main__":
    main()
