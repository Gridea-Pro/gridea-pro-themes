/* 3x-ui 主题脚本。依赖 /xxd/boot.js（XxdTheme）、/xxd/icons.js（XxdIcons，Lucide）、/xxd/xxd.js（Xxd）。
   外观切换、窄屏目录抽屉沿用原站 vps.xiaoxiaodong.ai 的写法（MIT）。 */
(() => {
  const T = window.XxdTheme, X = window.Xxd;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ---------- 外观：亮色 / 暗色 / 跟随系统 ---------- */
  const seg = $("#site-theme");
  const syncTheme = () => {
    if (!T || !seg) return;
    const s = { ...T.DEFAULT_SETTINGS, ...T.read() };
    for (const b of seg.querySelectorAll('[role="radio"]')) {
      const on = b.dataset.value === String(s.theme);
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    }
  };
  if (seg && T) {
    seg.addEventListener("xxd:change", (e) => { T.set({ theme: e.detail.value }); syncTheme(); });
    // 兜底：xxd 未接管时也能点
    seg.addEventListener("click", (e) => {
      const b = e.target.closest('[role="radio"]');
      if (b && b.getAttribute("aria-checked") !== "true") { T.set({ theme: b.dataset.value }); syncTheme(); }
    });
  }

  /* ---------- 快捷键文字：非 Mac 显示 Ctrl K ---------- */
  if (!isMac) for (const k of $$("[data-kbd-mod]")) k.textContent = "Ctrl K";

  /* ---------- 路径归一化（左目录高亮、推荐阅读匹配都用它） ---------- */
  const norm = (p) => {
    try { p = decodeURI(new URL(p, location.href).pathname); } catch { return ""; }
    return p.replace(/index\.html$/, "").replace(/\/+$/, "") || "/";
  };
  const here = norm(location.href);

  /* ---------- 左目录：标记当前页 ---------- */
  const navLinks = $$(".site-nav a[href]");
  let current = navLinks.find((a) => norm(a.getAttribute("href")) === here);
  // 首页分页（/page/2/）也算在「首页」下
  if (!current && /^\/page\/\d+$/.test(here)) current = navLinks.find((a) => norm(a.getAttribute("href")) === "/");
  // 博客分页（/blog/page/2/ 等）归到对应入口
  if (!current) {
    const base = here.replace(/\/page\/\d+$/, "");
    if (base !== here) current = navLinks.find((a) => norm(a.getAttribute("href")) === base);
  }
  // 文章页：高亮它所属的第一个分类
  if (!current) {
    const cat = $(".step-head__eyebrow a[href]");
    if (cat) current = navLinks.find((a) => norm(a.getAttribute("href")) === norm(cat.getAttribute("href")));
  }
  if (current) {
    current.setAttribute("aria-current", "page");
    const more = current.closest("details");
    if (more) more.open = true;
  }

  /* ---------- 窄屏目录抽屉 ---------- */
  const nav = $("#site-nav"), scrim = $("#site-nav-scrim"), menu = $("#site-menu");
  if (nav && scrim && menu) {
    const toggle = (on) => {
      nav.toggleAttribute("data-open", on); scrim.toggleAttribute("data-open", on);
      menu.setAttribute("aria-expanded", String(on));
      document.documentElement.classList.toggle("nav-open", on);
      if (on) (nav.querySelector('[aria-current="page"]') || nav.querySelector("a"))?.focus();
      else if (nav.contains(document.activeElement)) menu.focus();
    };
    menu.addEventListener("click", () => toggle(!nav.hasAttribute("data-open")));
    scrim.addEventListener("click", () => toggle(false));
    // 点目录里的链接后自动收起，避免挡住刚打开的页面
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a") && nav.hasAttribute("data-open")) toggle(false);
    });
    nav.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.hasAttribute("data-open")) { e.preventDefault(); toggle(false); } });
    addEventListener("resize", () => { if (innerWidth > 900 && nav.hasAttribute("data-open")) toggle(false); });
  }

  /* ---------- 正文：代码块包装 + 复制 + 高亮；表格横向滚动 ---------- */
  const LANG = {
    js: "js", javascript: "js", jsx: "js", ts: "js", typescript: "js", tsx: "js", json: "js", go: "js", golang: "js",
    python: "js", py: "js", java: "js", kotlin: "js", swift: "js", c: "js", cpp: "js", "c++": "js", cs: "js", csharp: "js",
    rust: "js", rs: "js", php: "js", ruby: "js", rb: "js", dart: "js", lua: "js", sql: "js", scala: "js",
    bash: "bash", sh: "bash", shell: "bash", zsh: "bash", console: "bash", powershell: "bash", ps1: "bash", dockerfile: "bash",
    html: "html", xml: "html", vue: "html", svg: "html", svelte: "html",
    css: "css", scss: "css", less: "css", sass: "css",
  };
  let codeSeq = 0;
  for (const body of $$(".post-body")) {
    const withCopy = body.hasAttribute("data-copy-code");
    for (const pre of $$("pre", body)) {
      if (pre.closest(".xxd-code-block") || pre.closest(".comments")) continue;
      const code = pre.querySelector("code") || pre;
      const m = (code.className || "").match(/(?:^|\s)(?:language|lang)-([\w+#-]+)/i);
      const lang = m ? m[1].toLowerCase() : "";
      const id = "code-" + (++codeSeq);
      pre.id = pre.id || id;
      pre.classList.add("xxd-code");
      pre.tabIndex = 0;
      if (withCopy) {
        const block = document.createElement("div");
        block.className = "xxd-code-block copy-block";
        const head = document.createElement("div");
        head.className = "xxd-code__head";
        head.textContent = lang || "代码";
        const btn = document.createElement("button");
        btn.className = "xxd-btn"; btn.type = "button";
        btn.dataset.variant = "ghost"; btn.dataset.size = "xs";
        btn.setAttribute("data-copy-target", "#" + pre.id + (code === pre ? "" : " code"));
        btn.setAttribute("aria-label", "复制");
        btn.innerHTML = '<i data-xxd-icon="Copy" data-size="14"></i>复制';
        head.append(btn);
        pre.replaceWith(block);
        block.append(head, pre);
      }
      if (X && X.highlight && LANG[lang] && code !== pre) {
        try { X.highlight(code, LANG[lang]); } catch {}
      }
    }
    for (const table of $$("table", body)) {
      if (table.parentElement.classList.contains("table-scroll")) continue;
      const wrap = document.createElement("div");
      wrap.className = "table-scroll";
      table.replaceWith(wrap); wrap.append(table);
    }
    for (const img of $$("img", body)) { img.loading = img.loading || "lazy"; img.decoding = "async"; }
  }

  /* ---------- 阅读进度（标题上方的进度条） ---------- */
  const article = $("#post-body");
  const bar = $("[data-reading-progress]");
  if (bar && article) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = article.getBoundingClientRect();
      const total = article.offsetHeight - innerHeight * 0.6;
      const done = Math.min(Math.max(-r.top + innerHeight * 0.25, 0), Math.max(total, 1));
      bar.value = Math.round((done / Math.max(total, 1)) * 100);
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- 右侧目录：由正文的 h2 / h3 / h4 生成，1~4 级带层级；窄屏克隆一份到正文上方 ---------- */
  const autoToc = $("[data-auto-toc]");
  const tocBox = autoToc && autoToc.querySelector("[data-toc]");
  if (autoToc && tocBox && article) {
    const seen = new Set();
    const heads = $$("h1, h2, h3, h4", article).filter((h) => !h.closest(".xxd-code-block, .comments, .post-toc-inline"));
    for (const h of heads) {
      let id = h.id;
      if (!id || seen.has(id)) id = (h.textContent.trim().replace(/[\s#?&/\\]+/g, "-").slice(0, 48) || "section") + (seen.has(id) ? "-" + seen.size : "");
      while (seen.has(id)) id += "-" + seen.size;
      h.id = id; seen.add(id);
    }
    if (heads.length >= 2) {
      const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      // 取正文里最浅的一级作为第 1 级，避免只有 h3 时整列都被缩进
      const ranks = heads.map((h) => Number(h.tagName.slice(1)));
      const top = Math.min(...ranks);
      const html = '<ul>' + heads.map((h) => {
        const lv = Math.min(4, Math.max(1, Number(h.tagName.slice(1)) - top + 1));
        return `<li data-level="${lv}"><a href="#${encodeURIComponent(h.id)}" title="${esc(h.textContent.trim())}">${esc(h.textContent.trim())}</a></li>`;
      }).join("") + "</ul>";
      tocBox.innerHTML = html;

      const mobWrap = $("[data-mobile-toc-wrap]"), mobBox = $("[data-mobile-toc]");
      if (mobWrap && mobBox) {
        mobBox.innerHTML = html;
        mobWrap.removeAttribute("hidden");
        if (X && X.spyToc) X.spyToc(mobBox);
      }
    } else {
      // 只有一两个小标题的短文章：目录没有意义，整列让出来给正文
      autoToc.remove();
    }
  }
  const toc = $("[data-toc]");
  if (toc && X && X.spyToc) X.spyToc(toc);

  /* ---------- 闪念：热力图 + 按月目录 ---------- */
  const memos = $$(".memo[data-date]");
  const heat = $("[data-heatmap]");
  if (heat && memos.length) {
    const counts = {};
    for (const m of memos) { const d = m.dataset.date; if (d) counts[d] = (counts[d] || 0) + 1; }
    const pad = (n) => String(n).padStart(2, "0");
    const key = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - 52 * 7 - today.getDay()); // 从 53 周前的周日开始
    const grid = heat.querySelector("[data-heatmap-grid]"), months = heat.querySelector("[data-heatmap-months]");
    const max = Math.max(1, ...Object.values(counts));
    const level = (n) => (n <= 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
    const cells = [], monthCells = [];
    let total = 0, days = 0, streak = 0, best = 0, lastMonth = -1;
    for (let d = new Date(start), i = 0; d <= today || d.getDay() !== 0; d.setDate(d.getDate() + 1), i++) {
      const out = d > today;
      const k = key(d), n = out ? 0 : counts[k] || 0;
      if (!out) {
        total += n; if (n) days++;
        streak = n ? streak + 1 : 0; best = Math.max(best, streak);
      }
      cells.push(`<i data-level="${level(n)}"${out ? " data-out" : ""} data-tooltip="${k}：${n ? n + " 条闪念" : "没有闪念"}"></i>`);
      if (d.getDay() === 0) {
        const mo = d.getMonth();
        // 只在某月第一周的那一列标月份；第一列若不是月初就跳过，避免被截断
        const label = mo !== lastMonth && (i > 0 || d.getDate() <= 7) ? mo + 1 + "月" : "";
        monthCells.push(`<span>${label}</span>`);
        lastMonth = mo;
      }
    }
    grid.innerHTML = cells.join("");
    months.innerHTML = monthCells.join("");
    const stats = heat.querySelector("[data-heatmap-stats]");
    if (stats) stats.textContent = `过去一年 ${total} 条 · ${days} 天有记录 · 最长连续 ${best} 天`;
    // 格子尺寸按可用宽度自适应（8–14px），桌面端一屏放下一整年；放不下（窄屏）时滚到最近一周
    const scroller = heat.querySelector(".heatmap__scroll");
    const cols = monthCells.length;
    const fit = () => {
      const w = scroller.clientWidth - 21; // 左侧星期列 18px + 间隔 3px
      const cell = Math.max(8, Math.min(14, Math.floor(w / cols) - 3));
      heat.style.setProperty("--cell", cell + "px");
      scroller.scrollLeft = scroller.scrollWidth;
    };
    if (scroller) { fit(); addEventListener("resize", fit); }
  }
  const memoToc = $("[data-memo-toc]");
  if (memoToc && memos.length) {
    const byMonth = new Map();
    for (const m of memos) {
      const ym = (m.dataset.date || "").slice(0, 7);
      if (!ym) continue;
      if (!byMonth.has(ym)) byMonth.set(ym, { id: m.id, n: 0 });
      byMonth.get(ym).n++;
    }
    if (byMonth.size) {
      memoToc.innerHTML = '<h2 class="site-toc__title">按月份</h2><ul>' + [...byMonth].map(([ym, v]) =>
        `<li><a href="#${v.id}">${ym.replace("-", " 年 ")} 月<span class="site-toc__n">${v.n}</span></a></li>`).join("") + "</ul>";
    }
  }

  /* ---------- 搜索：⌘K / Ctrl K，用 xxd 命令面板，数据来自 /api/search.json ---------- */
  const cfgEl = $("#site-search-config");
  const cfg = (() => { try { return JSON.parse(cfgEl.textContent); } catch { return {}; } })();
  const go = (href) => () => { location.href = href; };
  const staticItems = () => {
    const out = [];
    for (const a of $$(".site-nav a[href]")) {
      const label = a.querySelector(".site-nav__label")?.textContent.trim() || a.textContent.trim();
      const group = a.closest("details") ? "标签" : (a.querySelector(".site-nav__num") ? "分类" : "页面");
      out.push({ label: group === "标签" ? "#" + label : label, hint: group, group, keywords: label, run: go(a.href) });
    }
    return out;
  };
  let items = null, loading = null, searchPosts = null;
  const load = () => {
    if (loading) return loading;
    loading = fetch(cfg.index || "/api/search.json")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((list) => {
        searchPosts = Array.isArray(list) ? list : [];
        const posts = searchPosts.map((p) => ({
          label: p.title || "（无标题）",
          hint: p.date ? String(p.date).slice(0, 10).replace(/(\d{4})\D(\d{2})\D(\d{2}).*/, "$1-$2-$3") : "",
          group: "文章",
          keywords: [Array.isArray(p.tags) ? p.tags.map((t) => t.name || t).join(" ") : "", p.content || ""].join(" "),
          run: go(p.link || "/"),
        }));
        items = [...posts, ...staticItems()];
        return items;
      });
    return loading;
  };

  /* 命中关键词高亮：面板每次重绘后，把选项标题里命中的词包进 <mark> */
  const markPalette = (dialog) => {
    const list = dialog.querySelector(".xxd-palette__list");
    const input = dialog.querySelector(".xxd-palette__search input");
    if (!list || !input) return;
    const paint = () => {
      const raw = input.value.trim();
      if (!raw) return;
      const terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
      for (const li of list.querySelectorAll("li.xxd-option")) {
        if (li.dataset.hl === raw) continue;
        li.dataset.hl = raw;
        const node = li.firstChild;
        if (!node || node.nodeType !== 3) continue;
        const text = node.nodeValue, lower = text.toLowerCase();
        const ranges = [];
        for (const t of terms) {
          let i = lower.indexOf(t);
          while (i !== -1) { ranges.push([i, i + t.length]); i = lower.indexOf(t, i + t.length); }
        }
        if (!ranges.length) continue;
        ranges.sort((a, b) => a[0] - b[0]);
        const merged = [];
        for (const r of ranges) {
          const last = merged[merged.length - 1];
          if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
          else merged.push([r[0], r[1]]);
        }
        const frag = document.createDocumentFragment();
        let pos = 0;
        for (const [s, e] of merged) {
          if (s > pos) frag.append(text.slice(pos, s));
          const mark = document.createElement("mark");
          mark.className = "search-hit";
          mark.textContent = text.slice(s, e);
          frag.append(mark);
          pos = e;
        }
        if (pos < text.length) frag.append(text.slice(pos));
        li.replaceChild(frag, node);
      }
    };
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; paint(); });
    };
    const obs = new MutationObserver(schedule);
    obs.observe(list, { childList: true, subtree: true });
    input.addEventListener("input", schedule);
    dialog.addEventListener("close", () => {
      obs.disconnect();
      input.removeEventListener("input", schedule);
    }, { once: true });
  };

  const openSearch = () => {
    if (!X || !X.openCommandPalette) return;
    const opts = { placeholder: cfg.placeholder, empty: cfg.empty, recentKey: "gridea-3x-ui:recent" };
    const open = (list) => {
      const dialog = X.openCommandPalette({ items: list, ...opts });
      if (dialog && dialog.querySelector) markPalette(dialog);
      return dialog;
    };
    if (items) return open(items);
    load().then(open);
  };
  $("#site-search")?.addEventListener("click", openSearch);
  for (const b of $$("[data-open-search]")) b.addEventListener("click", openSearch);
  $("#site-search")?.addEventListener("pointerenter", load, { once: true });
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    else if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "") && !document.activeElement?.isContentEditable) { e.preventDefault(); openSearch(); }
  });
  (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(load);

  /* ---------- 首页推荐阅读：服务端没匹配到的卡片，从 /archives/ 的 data-post-* 补全 ---------- */
  const recPending = $$(".rec-card__pending");
  if (recPending.length) {
    const archiveMap = new Map();
    let archivePromise = null;
    const loadArchives = () => {
      if (archivePromise) return archivePromise;
      archivePromise = fetch("/archives/", { credentials: "same-origin" })
        .then((r) => (r.ok ? r.text() : ""))
        .then((html) => {
          if (!html) return archiveMap;
          const doc = new DOMParser().parseFromString(html, "text/html");
          for (const el of doc.querySelectorAll("[data-post-link]")) {
            const d = el.dataset;
            archiveMap.set(norm(d.postLink), {
              title: d.postTitle || "", date: d.postDate || "", cover: d.postCover || "",
              cat: d.postCat || "", desc: d.postDesc || "", min: d.postMin || "",
            });
          }
          return archiveMap;
        })
        .catch(() => archiveMap);
      return archivePromise;
    };

    const paint = (card, data) => {
      const slot = card.querySelector(".rec-card__cover");
      if (data.cover && slot && !slot.querySelector("img")) {
        const img = document.createElement("img");
        img.src = data.cover; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
        img.onerror = () => img.remove();
        slot.prepend(img);
        const ph = slot.querySelector(".rec-card__ph");
        if (ph) ph.remove();
      }
      const desc = card.querySelector("[data-rec-desc]");
      if (desc && data.desc && !desc.textContent.trim()) desc.textContent = data.desc;
      const meta = card.querySelector("[data-rec-meta]");
      if (meta && !meta.childElementCount) {
        const bits = [];
        if (data.date) bits.push(`<time datetime="${data.date.replace(/[^\d-]/g, "")}">${data.date}</time>`);
        if (data.cat) bits.push(data.cat);
        if (data.min && data.min !== "0") bits.push(`约 ${data.min} 分钟`);
        if (bits.length) {
          meta.innerHTML = bits.join('<span class="dot" aria-hidden="true">·</span>');
          meta.removeAttribute("hidden");
        }
      }
    };

    loadArchives().then((map) => {
      const left = [];
      for (const card of recPending) {
        const key = norm(card.dataset.recLink || "");
        const data = map.get(key);
        if (data) paint(card, data);
        else left.push(card);
      }
      if (!left.length) return null;
      // 归档页没收录（或没渲染）时，退回搜索索引：至少有日期和摘要
      return load().then(() => {
        for (const card of left) {
          const key = norm(card.dataset.recLink || "");
          const p = (searchPosts || []).find((x) => norm(x.link) === key);
          if (!p) continue;
          paint(card, {
            date: String(p.date || "").slice(0, 10),
            desc: String(p.content || "").replace(/\s+/g, " ").trim().slice(0, 80),
            cat: "", min: "", cover: "",
          });
        }
      });
    }).catch(() => {});
  }

  /* ---------- 交给 xxd：图标、分段控件、提示、复制按钮 ---------- */
  if (X && X.init) X.init(document);
  syncTheme();
})();
