/* @xxd/icons — Lucide 图标集（https://lucide.dev，ISC License，v0.469.0）。
   3x-ui 主题把原来自绘的 xxd 图标换成了 Lucide：24×24 网格、1.25 描边、圆头圆角，
   是当下最主流的开源图标语言（shadcn / Vercel / GitHub 系产品大量使用）。
   对外接口与原 @xxd/icons 完全一致：ICON_NODES / ICON_ALIASES / ICON_NAMES /
   resolveIcon / iconSVG / hydrateIcons / warnUnknownIcon，xxd.js 无需改动。 */
var XxdIcons = (() => {
  var NODES = {
    Archive: '<rect width="20" height="5" x="2" y="3" rx="1"/> <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/> <path d="M10 12h4"/>',
    ArrowDown: '<path d="M12 5v14"/> <path d="m19 12-7 7-7-7"/>',
    ArrowLeft: '<path d="m12 19-7-7 7-7"/> <path d="M19 12H5"/>',
    ArrowRight: '<path d="M5 12h14"/> <path d="m12 5 7 7-7 7"/>',
    ArrowUp: '<path d="m5 12 7-7 7 7"/> <path d="M12 19V5"/>',
    ArrowUpRight: '<path d="M7 7h10v10"/> <path d="M7 17 17 7"/>',
    BookMarked: '<path d="M10 2v8l3-3 3 3V2"/> <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    BookOpen: '<path d="M12 7v14"/> <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    Calendar: '<path d="M8 2v4"/> <path d="M16 2v4"/> <rect width="18" height="18" x="3" y="4" rx="2"/> <path d="M3 10h18"/>',
    Check: '<path d="M20 6 9 17l-5-5"/>',
    ChevronDown: '<path d="m6 9 6 6 6-6"/>',
    ChevronRight: '<path d="m9 18 6-6-6-6"/>',
    ChevronUp: '<path d="m18 15-6-6-6 6"/>',
    Circle: '<circle cx="12" cy="12" r="10"/>',
    Clock: '<circle cx="12" cy="12" r="10"/> <polyline points="12 6 12 12 16 14"/>',
    Compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/> <circle cx="12" cy="12" r="10"/>',
    Contrast: '<circle cx="12" cy="12" r="10"/> <path d="M12 18a6 6 0 0 0 0-12v12z"/>',
    Copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/> <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    ExternalLink: '<path d="M15 3h6v6"/> <path d="M10 14 21 3"/> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/> <path d="M14 2v4a2 2 0 0 0 2 2h4"/> <path d="M10 9H8"/> <path d="M16 13H8"/> <path d="M16 17H8"/>',
    Folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    FolderTree: '<path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/> <path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/> <path d="M3 5a2 2 0 0 0 2 2h3"/> <path d="M3 3v13a2 2 0 0 0 2 2h3"/>',
    Folders: '<path d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.69-.9l-.81-1.2a2 2 0 0 0-1.67-.9H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"/> <path d="M2 8v11a2 2 0 0 0 2 2h14"/>',
    Globe: '<circle cx="12" cy="12" r="10"/> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/> <path d="M2 12h20"/>',
    Hash: '<line x1="4" x2="20" y1="9" y2="9"/> <line x1="4" x2="20" y1="15" y2="15"/> <line x1="10" x2="8" y1="3" y2="21"/> <line x1="16" x2="14" y1="3" y2="21"/>',
    House: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/> <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    Info: '<circle cx="12" cy="12" r="10"/> <path d="M12 16v-4"/> <path d="M12 8h.01"/>',
    Laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    Layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/> <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/> <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    Library: '<path d="m16 6 4 14"/> <path d="M12 6v14"/> <path d="M8 8v12"/> <path d="M4 4v16"/>',
    Lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/> <path d="M9 18h6"/> <path d="M10 22h4"/>',
    Link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    ListTree: '<path d="M21 12h-8"/> <path d="M21 6H8"/> <path d="M21 18h-8"/> <path d="M3 6v4c0 1.1.9 2 2 2h3"/> <path d="M3 10v6c0 1.1.9 2 2 2h3"/>',
    Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/> <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    Menu: '<line x1="4" x2="20" y1="12" y2="12"/> <line x1="4" x2="20" y1="6" y2="6"/> <line x1="4" x2="20" y1="18" y2="18"/>',
    MessageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    MessagesSquare: '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/> <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
    Moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    Newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/> <path d="M18 14h-8"/> <path d="M15 18h-5"/> <path d="M10 6h8v4h-8V6Z"/>',
    PanelLeft: '<rect width="18" height="18" x="3" y="3" rx="2"/> <path d="M9 3v18"/>',
    PencilLine: '<path d="M12 20h9"/> <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/> <path d="m15 5 3 3"/>',
    Pin: '<path d="M12 17v5"/> <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    Quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/> <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    Rss: '<path d="M4 11a9 9 0 0 1 9 9"/> <path d="M4 4a16 16 0 0 1 16 16"/> <circle cx="5" cy="19" r="1"/>',
    Search: '<circle cx="11" cy="11" r="8"/> <path d="m21 21-4.3-4.3"/>',
    Server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/> <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/> <line x1="6" x2="6.01" y1="6" y2="6"/> <line x1="6" x2="6.01" y1="18" y2="18"/>',
    Sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/> <path d="M20 3v4"/> <path d="M22 5h-4"/> <path d="M4 17v2"/> <path d="M5 18H3"/>',
    StickyNote: '<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/> <path d="M15 3v4a2 2 0 0 0 2 2h4"/>',
    Sun: '<circle cx="12" cy="12" r="4"/> <path d="M12 2v2"/> <path d="M12 20v2"/> <path d="m4.93 4.93 1.41 1.41"/> <path d="m17.66 17.66 1.41 1.41"/> <path d="M2 12h2"/> <path d="M20 12h2"/> <path d="m6.34 17.66-1.41 1.41"/> <path d="m19.07 4.93-1.41 1.41"/>',
    Tags: '<path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/> <path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/> <circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/>',
    UserRound: '<circle cx="12" cy="8" r="5"/> <path d="M20 21a8 8 0 0 0-16 0"/>',
    X: '<path d="M18 6 6 18"/> <path d="m6 6 12 12"/>',
  };
  var ALIASES = {
    "Home": "House",
    "Article": "FileText",
    "Page": "FileText",
    "Post": "Newspaper",
    "Blog": "Newspaper",
    "Tag": "Tags",
    "Comment": "MessageCircle",
    "Comments": "MessagesSquare",
    "Note": "StickyNote",
    "Memo": "StickyNote",
    "User": "UserRound",
    "About": "UserRound",
    "FolderOpen": "Folder",
    "Categories": "FolderTree",
    "Links": "Link",
    "Doc": "FileText",
    "Docs": "BookOpen",
    "Share": "Globe",
    "Pencil": "PencilLine",
    "Close": "X",
    "ArrowLeftRight": "ArrowRight",
    "Hit": "Sparkles"
  };
  var ATTRS = 'fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"';
  var NAMES = Object.keys(NODES);
  var LOW = {};
  for (var i = 0; i < NAMES.length; i++) LOW[NAMES[i].toLowerCase()] = NAMES[i];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /* 名称解析：支持 PascalCase、小写、kebab-case 和常用别名（Home → House） */
  function resolveIcon(name) {
    if (!name) return null;
    var n = String(name).trim();
    if (NODES[n]) return NODES[n];
    if (ALIASES[n] && NODES[ALIASES[n]]) return NODES[ALIASES[n]];
    var key = n.replace(/[-_\s]+(.)?/g, function (_, c) { return c ? c.toUpperCase() : ''; });
    key = key.charAt(0).toUpperCase() + key.slice(1);
    if (NODES[key]) return NODES[key];
    if (LOW[n.toLowerCase()]) return NODES[LOW[n.toLowerCase()]];
    if (ALIASES[key] && NODES[ALIASES[key]]) return NODES[ALIASES[key]];
    return null;
  }

  function iconSVG(name, opts) {
    opts = opts || {};
    var body = resolveIcon(name);
    if (!body) throw new Error('@xxd/icons: unknown icon "' + String(name) + '"');
    var size = Number(opts.size) || 16;
    var cls = ['ui-icon', opts.className || ''].filter(Boolean).join(' ');
    var a11y = opts.label ? 'role="img" aria-label="' + esc(opts.label) + '"' : 'aria-hidden="true" focusable="false"';
    return '<svg class="' + esc(cls) + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" ' + ATTRS + ' ' + a11y + '>' + body + '</svg>';
  }

  var warned = {};
  function warnUnknownIcon(name) {
    if (warned[name]) return;
    warned[name] = true;
    if (globalThis.process && globalThis.process.env && globalThis.process.env.NODE_ENV === 'production') return;
    if (globalThis.console) console.warn('@xxd/icons: unknown icon "' + String(name) + '", fallback to Circle');
  }

  function hydrateIcons(root) {
    root = root || globalThis.document;
    if (!root || !root.querySelectorAll) return 0;
    var list = root.querySelectorAll('[data-xxd-icon]');
    var done = 0;
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var name = el.getAttribute('data-xxd-icon');
      if (!resolveIcon(name)) { warnUnknownIcon(name); name = 'Circle'; }
      var size = Number(el.getAttribute('data-size')) || 16;
      var label = el.getAttribute('aria-label') || '';
      el.outerHTML = iconSVG(name, { size: size, className: el.className || '', label: label });
      done++;
    }
    return done;
  }

  return {
    ICON_NODES: NODES,
    ICON_ALIASES: ALIASES,
    ICON_NAMES: NAMES,
    resolveIcon: resolveIcon,
    iconSVG: iconSVG,
    hydrateIcons: hydrateIcons,
    warnUnknownIcon: warnUnknownIcon,
  };
})();
