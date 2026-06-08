/* @ds-bundle: {"format":3,"namespace":"AuditorDesignSystem_d0bdbf","components":[{"name":"Sev","sourcePath":"components/badges/Sev.jsx"},{"name":"Tag","sourcePath":"components/badges/Tag.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Donut","sourcePath":"components/charts/Donut.jsx"},{"name":"Sparkline","sourcePath":"components/charts/Sparkline.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"AvatarStack","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Stat","sourcePath":"components/data-display/Stat.jsx"},{"name":"Field","sourcePath":"components/forms/Input.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"assets/icons.jsx":"39bc8cef8b39","components/badges/Sev.jsx":"a5af07f7b64d","components/badges/Tag.jsx":"179a4886c3d4","components/buttons/Button.jsx":"b6305a7cb168","components/charts/Donut.jsx":"d64c41c59da4","components/charts/Sparkline.jsx":"41233f5ffb45","components/data-display/Avatar.jsx":"b1d62bb4be7a","components/data-display/Stat.jsx":"3b815d9cf541","components/forms/Input.jsx":"274b81b5a23b","components/navigation/Tabs.jsx":"213736e5c407","ui_kits/auditor/app.jsx":"080a5c127dcf","ui_kits/auditor/chrome.jsx":"844d0e20408d","ui_kits/auditor/data.js":"475e3b226bf4","ui_kits/auditor/icons.jsx":"39bc8cef8b39","ui_kits/auditor/screens-admin.jsx":"a15688e3ea96","ui_kits/auditor/screens-agent.jsx":"c307d6bf7916","ui_kits/auditor/screens-audit.jsx":"7fe961bf6700","ui_kits/auditor/screens-overview.jsx":"86a7664f277a","ui_kits/auditor/screens-profile.jsx":"19af01e47950","ui_kits/auditor/screens-tools.jsx":"f7bc230afd8c","ui_kits/auditor/tweaks-panel.jsx":"22c052960f83","ui_kits/auditor/wow.jsx":"3af2fe93f6e3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AuditorDesignSystem_d0bdbf = window.AuditorDesignSystem_d0bdbf || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/icons.jsx
try { (() => {
/* Lucide-style icons inlined as React components.
   Each accepts size + className. Stroke 1.75, rounded caps. */
(function () {
  const {
    createElement: h
  } = React;
  const base = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };
  function Icon(paths) {
    return function I(props = {}) {
      const {
        size = 16,
        className,
        style,
        ...rest
      } = props;
      return h("svg", {
        ...base,
        width: size,
        height: size,
        className,
        style,
        ...rest
      }, paths.map((p, i) => h(p.tag || "path", {
        key: i,
        ...p
      })));
    };
  }
  window.Icons = {
    Shield: Icon([{
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    }]),
    ShieldCheck: Icon([{
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    }, {
      d: "m9 12 2 2 4-4"
    }]),
    ShieldAlert: Icon([{
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    }, {
      d: "M12 8v4"
    }, {
      d: "M12 16h.01"
    }]),
    LayoutDashboard: Icon([{
      d: "M3 3h7v9H3z"
    }, {
      d: "M14 3h7v5h-7z"
    }, {
      d: "M14 12h7v9h-7z"
    }, {
      d: "M3 16h7v5H3z"
    }]),
    FolderKanban: Icon([{
      d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9L8.84 3.46A2 2 0 0 0 7.18 2.5H4a2 2 0 0 0-2 2v13.5A2.5 2.5 0 0 0 4.5 20Z"
    }, {
      d: "M8 10v8"
    }, {
      d: "M12 10v4"
    }, {
      d: "M16 10v6"
    }]),
    CheckSquare: Icon([{
      d: "M9 11l3 3L22 4"
    }, {
      d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
    }]),
    AlertTriangle: Icon([{
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
    }, {
      d: "M12 9v4"
    }, {
      d: "M12 17h.01"
    }]),
    FileSearch: Icon([{
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }, {
      d: "M14 2v6h6"
    }, {
      tag: "circle",
      cx: 11.5,
      cy: 14.5,
      r: 2.5
    }, {
      d: "m13.27 16.27 1.73 1.73"
    }]),
    Sparkles: Icon([{
      d: "m12 3-1.9 5.8L4 11l5.8 1.9L12 19l1.9-5.8L20 11l-5.8-1.9z"
    }, {
      d: "M5 3v4"
    }, {
      d: "M19 17v4"
    }, {
      d: "M3 5h4"
    }, {
      d: "M17 19h4"
    }]),
    BarChart3: Icon([{
      d: "M3 3v18h18"
    }, {
      d: "M8 17V9"
    }, {
      d: "M13 17V5"
    }, {
      d: "M18 17v-7"
    }]),
    FileText: Icon([{
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }, {
      d: "M14 2v6h6"
    }, {
      d: "M16 13H8"
    }, {
      d: "M16 17H8"
    }, {
      d: "M10 9H8"
    }]),
    KeyRound: Icon([{
      tag: "circle",
      cx: 7.5,
      cy: 15.5,
      r: 5.5
    }, {
      d: "m21 2-9.6 9.6"
    }, {
      d: "m15.5 7.5 3 3L22 7l-3-3"
    }]),
    Users: Icon([{
      d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    }, {
      tag: "circle",
      cx: 9,
      cy: 7,
      r: 4
    }, {
      d: "M22 21v-2a4 4 0 0 0-3-3.87"
    }, {
      d: "M16 3.13a4 4 0 0 1 0 7.75"
    }]),
    History: Icon([{
      d: "M3 12a9 9 0 1 0 3-6.7L3 8"
    }, {
      d: "M3 3v5h5"
    }, {
      d: "M12 7v5l4 2"
    }]),
    Monitor: Icon([{
      tag: "rect",
      x: 2,
      y: 3,
      width: 20,
      height: 14,
      rx: 2
    }, {
      d: "M8 21h8"
    }, {
      d: "M12 17v4"
    }]),
    Settings: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 3
    }, {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    }]),
    Building2: Icon([{
      d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
    }, {
      d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"
    }, {
      d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"
    }, {
      d: "M10 6h4"
    }, {
      d: "M10 10h4"
    }, {
      d: "M10 14h4"
    }, {
      d: "M10 18h4"
    }]),
    Search: Icon([{
      tag: "circle",
      cx: 11,
      cy: 11,
      r: 8
    }, {
      d: "m21 21-4.3-4.3"
    }]),
    Bell: Icon([{
      d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
    }, {
      d: "M10.3 21a1.94 1.94 0 0 0 3.4 0"
    }]),
    Moon: Icon([{
      d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    }]),
    Sun: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 4
    }, {
      d: "M12 2v2"
    }, {
      d: "M12 20v2"
    }, {
      d: "m4.93 4.93 1.41 1.41"
    }, {
      d: "m17.66 17.66 1.41 1.41"
    }, {
      d: "M2 12h2"
    }, {
      d: "M20 12h2"
    }, {
      d: "m6.34 17.66-1.41 1.41"
    }, {
      d: "m19.07 4.93-1.41 1.41"
    }]),
    Plus: Icon([{
      d: "M12 5v14"
    }, {
      d: "M5 12h14"
    }]),
    ChevronRight: Icon([{
      d: "m9 18 6-6-6-6"
    }]),
    ChevronDown: Icon([{
      d: "m6 9 6 6 6-6"
    }]),
    ChevronLeft: Icon([{
      d: "m15 18-6-6 6-6"
    }]),
    ChevronUp: Icon([{
      d: "m18 15-6-6-6 6"
    }]),
    ChevronsUpDown: Icon([{
      d: "m7 15 5 5 5-5"
    }, {
      d: "m7 9 5-5 5 5"
    }]),
    Filter: Icon([{
      d: "M22 3H2l8 9.46V19l4 2v-8.54Z"
    }]),
    Download: Icon([{
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }, {
      d: "m7 10 5 5 5-5"
    }, {
      d: "M12 15V3"
    }]),
    Upload: Icon([{
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }, {
      d: "m17 8-5-5-5 5"
    }, {
      d: "M12 3v12"
    }]),
    X: Icon([{
      d: "M18 6 6 18"
    }, {
      d: "m6 6 12 12"
    }]),
    Check: Icon([{
      d: "M20 6 9 17l-5-5"
    }]),
    Edit3: Icon([{
      d: "M12 20h9"
    }, {
      d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
    }]),
    Eye: Icon([{
      d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"
    }, {
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 3
    }]),
    EyeOff: Icon([{
      d: "M9.88 9.88a3 3 0 1 0 4.24 4.24"
    }, {
      d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
    }, {
      d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
    }, {
      d: "m2 2 20 20"
    }]),
    Trash2: Icon([{
      d: "M3 6h18"
    }, {
      d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
    }, {
      d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
    }, {
      d: "M10 11v6"
    }, {
      d: "M14 11v6"
    }]),
    MoreHorizontal: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 1
    }, {
      tag: "circle",
      cx: 19,
      cy: 12,
      r: 1
    }, {
      tag: "circle",
      cx: 5,
      cy: 12,
      r: 1
    }]),
    MoreVertical: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 1
    }, {
      tag: "circle",
      cx: 12,
      cy: 5,
      r: 1
    }, {
      tag: "circle",
      cx: 12,
      cy: 19,
      r: 1
    }]),
    Calendar: Icon([{
      tag: "rect",
      x: 3,
      y: 4,
      width: 18,
      height: 18,
      rx: 2
    }, {
      d: "M16 2v4"
    }, {
      d: "M8 2v4"
    }, {
      d: "M3 10h18"
    }]),
    Clock: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      d: "M12 6v6l4 2"
    }]),
    Wifi: Icon([{
      d: "M5 13a10 10 0 0 1 14 0"
    }, {
      d: "M8.5 16.5a5 5 0 0 1 7 0"
    }, {
      d: "M2 8.82a15 15 0 0 1 20 0"
    }, {
      d: "M12 20h.01"
    }]),
    WifiOff: Icon([{
      d: "m2 2 20 20"
    }, {
      d: "M8.5 16.5a5 5 0 0 1 7 0"
    }, {
      d: "M12 20h.01"
    }, {
      d: "M2 8.82a15 15 0 0 1 20 0"
    }]),
    Network: Icon([{
      tag: "rect",
      x: 16,
      y: 16,
      width: 6,
      height: 6,
      rx: 1
    }, {
      tag: "rect",
      x: 2,
      y: 16,
      width: 6,
      height: 6,
      rx: 1
    }, {
      tag: "rect",
      x: 9,
      y: 2,
      width: 6,
      height: 6,
      rx: 1
    }, {
      d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"
    }, {
      d: "M12 12V8"
    }]),
    Server: Icon([{
      tag: "rect",
      x: 2,
      y: 2,
      width: 20,
      height: 8,
      rx: 2
    }, {
      tag: "rect",
      x: 2,
      y: 14,
      width: 20,
      height: 8,
      rx: 2
    }, {
      d: "M6 6h.01"
    }, {
      d: "M6 18h.01"
    }]),
    Cpu: Icon([{
      tag: "rect",
      x: 4,
      y: 4,
      width: 16,
      height: 16,
      rx: 2
    }, {
      tag: "rect",
      x: 9,
      y: 9,
      width: 6,
      height: 6
    }, {
      d: "M15 2v2"
    }, {
      d: "M15 20v2"
    }, {
      d: "M2 15h2"
    }, {
      d: "M20 15h2"
    }, {
      d: "M2 9h2"
    }, {
      d: "M20 9h2"
    }, {
      d: "M9 2v2"
    }, {
      d: "M9 20v2"
    }]),
    HardDrive: Icon([{
      d: "M22 12H2"
    }, {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"
    }, {
      d: "M6 16h.01"
    }, {
      d: "M10 16h.01"
    }]),
    Database: Icon([{
      tag: "ellipse",
      cx: 12,
      cy: 5,
      rx: 9,
      ry: 3
    }, {
      d: "M3 5v14a9 3 0 0 0 18 0V5"
    }, {
      d: "M3 12a9 3 0 0 0 18 0"
    }]),
    Bug: Icon([{
      d: "m8 2 1.88 1.88"
    }, {
      d: "M14.12 3.88 16 2"
    }, {
      d: "M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"
    }, {
      d: "M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z"
    }, {
      d: "M12 20v-9"
    }, {
      d: "M6.53 9 4 8"
    }, {
      d: "M6 13H2"
    }, {
      d: "M3 21l3.11-1.55"
    }, {
      d: "M20.47 9 22 8"
    }, {
      d: "M22 13h-4"
    }, {
      d: "m17.89 19.45 3.11 1.55"
    }]),
    Layers: Icon([{
      d: "m12 2 9 5-9 5-9-5z"
    }, {
      d: "m3 12 9 5 9-5"
    }, {
      d: "m3 17 9 5 9-5"
    }]),
    Activity: Icon([{
      d: "M22 12h-4l-3 9L9 3l-3 9H2"
    }]),
    Lock: Icon([{
      tag: "rect",
      x: 3,
      y: 11,
      width: 18,
      height: 11,
      rx: 2
    }, {
      d: "M7 11V7a5 5 0 0 1 10 0v4"
    }]),
    Unlock: Icon([{
      tag: "rect",
      x: 3,
      y: 11,
      width: 18,
      height: 11,
      rx: 2
    }, {
      d: "M7 11V7a5 5 0 0 1 9.9-1"
    }]),
    Mail: Icon([{
      tag: "rect",
      x: 2,
      y: 4,
      width: 20,
      height: 16,
      rx: 2
    }, {
      d: "m22 7-10 5L2 7"
    }]),
    Globe: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      d: "M2 12h20"
    }, {
      d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
    }]),
    Send: Icon([{
      d: "m22 2-7 20-4-9-9-4Z"
    }, {
      d: "M22 2 11 13"
    }]),
    LogOut: Icon([{
      d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
    }, {
      d: "m16 17 5-5-5-5"
    }, {
      d: "M21 12H9"
    }]),
    LogIn: Icon([{
      d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
    }, {
      d: "m10 17 5-5-5-5"
    }, {
      d: "M15 12H3"
    }]),
    Refresh: Icon([{
      d: "M3 12a9 9 0 0 1 15-6.7l3-2.3v8h-8l3-2.3"
    }, {
      d: "M21 12a9 9 0 0 1-15 6.7l-3 2.3v-8h8l-3 2.3"
    }]),
    Save: Icon([{
      d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
    }, {
      d: "M17 21v-8H7v8"
    }, {
      d: "M7 3v5h8"
    }]),
    Paperclip: Icon([{
      d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
    }]),
    Tag: Icon([{
      d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
    }, {
      d: "M7 7h.01"
    }]),
    Star: Icon([{
      d: "m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"
    }]),
    Trophy: Icon([{
      d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
    }, {
      d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
    }, {
      d: "M4 22h16"
    }, {
      d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
    }, {
      d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
    }, {
      d: "M18 2H6v7a6 6 0 0 0 12 0V2Z"
    }]),
    Target: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 6
    }, {
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 2
    }]),
    TrendingUp: Icon([{
      d: "m22 7-8.5 8.5-5-5L2 17"
    }, {
      d: "M16 7h6v6"
    }]),
    TrendingDown: Icon([{
      d: "m22 17-8.5-8.5-5 5L2 7"
    }, {
      d: "M16 17h6v-6"
    }]),
    Menu: Icon([{
      d: "M4 12h16"
    }, {
      d: "M4 6h16"
    }, {
      d: "M4 18h16"
    }]),
    Folder: Icon([{
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
    }]),
    File: Icon([{
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }, {
      d: "M14 2v6h6"
    }]),
    Image: Icon([{
      tag: "rect",
      x: 3,
      y: 3,
      width: 18,
      height: 18,
      rx: 2
    }, {
      tag: "circle",
      cx: 9,
      cy: 9,
      r: 2
    }, {
      d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
    }]),
    Code: Icon([{
      d: "m16 18 6-6-6-6"
    }, {
      d: "m8 6-6 6 6 6"
    }]),
    Play: Icon([{
      d: "M5 3v18l16-9z"
    }]),
    Pause: Icon([{
      tag: "rect",
      x: 6,
      y: 4,
      width: 4,
      height: 16
    }, {
      tag: "rect",
      x: 14,
      y: 4,
      width: 4,
      height: 16
    }]),
    Power: Icon([{
      d: "M18.36 6.64A9 9 0 1 1 5.64 6.64"
    }, {
      d: "M12 2v10"
    }]),
    Smartphone: Icon([{
      tag: "rect",
      x: 5,
      y: 2,
      width: 14,
      height: 20,
      rx: 2
    }, {
      d: "M12 18h.01"
    }]),
    Copy: Icon([{
      tag: "rect",
      x: 9,
      y: 9,
      width: 13,
      height: 13,
      rx: 2
    }, {
      d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
    }]),
    Link: Icon([{
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
    }, {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
    }]),
    GitBranch: Icon([{
      d: "M6 3v12"
    }, {
      tag: "circle",
      cx: 18,
      cy: 6,
      r: 3
    }, {
      tag: "circle",
      cx: 6,
      cy: 18,
      r: 3
    }, {
      d: "M18 9a9 9 0 0 1-9 9"
    }]),
    Zap: Icon([{
      d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z"
    }]),
    Building: Icon([{
      tag: "rect",
      x: 4,
      y: 2,
      width: 16,
      height: 20,
      rx: 2
    }, {
      d: "M9 22v-4h6v4"
    }, {
      d: "M8 6h.01"
    }, {
      d: "M16 6h.01"
    }, {
      d: "M12 6h.01"
    }, {
      d: "M12 10h.01"
    }, {
      d: "M12 14h.01"
    }, {
      d: "M16 10h.01"
    }, {
      d: "M16 14h.01"
    }, {
      d: "M8 10h.01"
    }, {
      d: "M8 14h.01"
    }]),
    UserCheck: Icon([{
      d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    }, {
      tag: "circle",
      cx: 9,
      cy: 7,
      r: 4
    }, {
      d: "m16 11 2 2 4-4"
    }]),
    User: Icon([{
      d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
    }, {
      tag: "circle",
      cx: 12,
      cy: 7,
      r: 4
    }]),
    Briefcase: Icon([{
      tag: "rect",
      x: 2,
      y: 7,
      width: 20,
      height: 14,
      rx: 2
    }, {
      d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
    }]),
    Flag: Icon([{
      d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
    }, {
      d: "M4 22V15"
    }]),
    Boxes: Icon([{
      d: "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42z"
    }, {
      d: "m7 16.5-4.74-2.85"
    }, {
      d: "m7 16.5 5-3"
    }, {
      d: "M7 16.5v5.17"
    }, {
      d: "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"
    }, {
      d: "m17 16.5-5-3"
    }, {
      d: "m17 16.5 4.74-2.85"
    }, {
      d: "M17 16.5v5.17"
    }, {
      d: "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0z"
    }, {
      d: "M12 8 7.26 5.15"
    }, {
      d: "m12 8 4.74-2.85"
    }, {
      d: "M12 13.5V8"
    }]),
    Maximize2: Icon([{
      d: "M15 3h6v6"
    }, {
      d: "M9 21H3v-6"
    }, {
      d: "m21 3-7 7"
    }, {
      d: "m3 21 7-7"
    }]),
    Map: Icon([{
      d: "M1 6v16l7-3 8 3 7-3V3l-7 3-8-3-7 3z"
    }, {
      d: "M8 3v16"
    }, {
      d: "M16 6v16"
    }]),
    Inbox: Icon([{
      d: "m22 12-4-4H6l-4 4v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z"
    }, {
      d: "M2 12h6.18a2 2 0 0 1 1.78 1.1l.04.08a2 2 0 0 0 1.78 1.1h2.46a2 2 0 0 0 1.78-1.1l.04-.08A2 2 0 0 1 15.82 12H22"
    }]),
    Pin: Icon([{
      d: "M12 17v5"
    }, {
      d: "M9 10.76V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5.76a2 2 0 0 0 .29 1.05L17 14H7l1.71-2.19A2 2 0 0 0 9 10.76Z"
    }]),
    PieChart: Icon([{
      d: "M21.21 15.89A10 10 0 1 1 8 2.83"
    }, {
      d: "M22 12A10 10 0 0 0 12 2v10z"
    }]),
    BarChart: Icon([{
      d: "M12 20V10"
    }, {
      d: "M18 20V4"
    }, {
      d: "M6 20v-6"
    }]),
    Hash: Icon([{
      d: "M4 9h16"
    }, {
      d: "M4 15h16"
    }, {
      d: "M10 3 8 21"
    }, {
      d: "M16 3l-2 18"
    }]),
    Brain: Icon([{
      d: "M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"
    }, {
      d: "M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"
    }, {
      d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"
    }, {
      d: "M17.599 6.5a3 3 0 0 0 .399-1.375"
    }, {
      d: "M6.003 5.125A3 3 0 0 0 6.401 6.5"
    }, {
      d: "M3.477 10.896a4 4 0 0 1 .585-.396"
    }, {
      d: "M19.938 10.5a4 4 0 0 1 .585.396"
    }, {
      d: "M6 18a4 4 0 0 1-1.967-.516"
    }, {
      d: "M19.967 17.484A4 4 0 0 1 18 18"
    }]),
    Key: Icon([{
      d: "m21 2-9.6 9.6"
    }, {
      tag: "circle",
      cx: 7.5,
      cy: 15.5,
      r: 5.5
    }, {
      d: "m15.5 7.5 3 3L22 7l-3-3"
    }, {
      d: "M16 8 14 6"
    }]),
    Fingerprint: Icon([{
      d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
    }, {
      d: "M14 13.12c0 2.38 0 6.38-1 8.88"
    }, {
      d: "M17.29 21.02c.12-.6.43-2.3.5-3.02"
    }, {
      d: "M2 12a10 10 0 0 1 18-6"
    }, {
      d: "M2 16h.01"
    }, {
      d: "M21.8 16c.2-2 .131-5.354 0-6"
    }, {
      d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
    }, {
      d: "M8.65 22c.21-.66.45-1.32.57-2"
    }, {
      d: "M9 6.8a6 6 0 0 1 9 5.2v2"
    }]),
    Info: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      d: "M12 16v-4"
    }, {
      d: "M12 8h.01"
    }])
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/icons.jsx", error: String((e && e.message) || e) }); }

// components/badges/Sev.jsx
try { (() => {
const LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info"
};

/**
 * Sev — severity badge for findings. Reads strongest on dark surfaces (the
 * SOC default). Square marker dot + uppercase weight-700 label.
 */
function Sev({
  level = "info",
  className = ""
}) {
  const lvl = String(level).toLowerCase();
  const cls = ["sev", "sev--" + lvl];
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("span", {
    className: cls.join(" ")
  }, LABELS[lvl] || level);
}
Object.assign(__ds_scope, { Sev });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/badges/Sev.jsx", error: String((e && e.message) || e) }); }

// components/badges/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — a small pill for status, type, and metadata labels.
 * Tone maps to the --status-* token pairs (soft bg + readable fg).
 */
function Tag({
  tone = "neutral",
  icon: Icon,
  className = "",
  children,
  ...rest
}) {
  const cls = ["tag"];
  if (tone && tone !== "neutral") cls.push("tag--" + tone);
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls.join(" ")
  }, rest), Icon ? /*#__PURE__*/React.createElement(Icon, {
    size: 11
  }) : null, /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/badges/Tag.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the primary action control for the Auditor system.
 * Renders a <button> styled by the .btn class layer. Variant + size are
 * pure class modifiers, so it inherits theming (light/dark) for free.
 */
function Button({
  variant = "default",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  iconOnly = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const cls = ["btn"];
  if (variant && variant !== "default") cls.push("btn--" + variant);
  if (size && size !== "md") cls.push("btn--" + size);
  if (iconOnly) cls.push("btn--icon");
  if (className) cls.push(className);
  const iconSize = size === "xs" ? 13 : size === "sm" ? 14 : 15;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls.join(" "),
    disabled: disabled
  }, rest), Icon ? /*#__PURE__*/React.createElement(Icon, {
    size: iconSize
  }) : null, iconOnly ? null : /*#__PURE__*/React.createElement("span", null, children), IconRight ? /*#__PURE__*/React.createElement(IconRight, {
    size: iconSize
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/charts/Donut.jsx
try { (() => {
/**
 * Donut — segmented ring chart with a center total. Items are drawn as
 * stroked arcs; segment colors come from the caller (severity/status hues).
 * Pass `total` to override the implicit sum.
 */
function Donut({
  items = [],
  size = 120,
  thickness = 18,
  total,
  centerLabel = "JAMI"
}) {
  const sum = total || items.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  let offset = 0;
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    className: "donut"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cx,
    r: r,
    fill: "none",
    stroke: "var(--bg-surface-3)",
    strokeWidth: thickness
  }), items.map((it, i) => {
    if (!it.value) return null;
    const len = it.value / sum * c;
    const dashOff = -offset;
    offset += len;
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      className: "donut-seg",
      cx: cx,
      cy: cx,
      r: r,
      fill: "none",
      stroke: it.color,
      strokeWidth: thickness,
      strokeDasharray: `${len} ${c - len}`,
      strokeDashoffset: dashOff,
      transform: `rotate(-90 ${cx} ${cx})`
    });
  }), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cx - 4,
    textAnchor: "middle",
    fontSize: "22",
    fontWeight: "800",
    fill: "var(--text-primary)",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em"
  }, sum), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cx + 14,
    textAnchor: "middle",
    fontSize: "10",
    fill: "var(--text-tertiary)",
    fontWeight: "600",
    letterSpacing: "0.08em"
  }, centerLabel));
}
Object.assign(__ds_scope, { Donut });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/charts/Donut.jsx", error: String((e && e.message) || e) }); }

// components/charts/Sparkline.jsx
try { (() => {
let __sparkSeq = 0;

/**
 * Sparkline — tiny trend line with an optional gradient area fill. Inline
 * trend indicator for stat rows and leaderboards.
 */
function Sparkline({
  data = [],
  w = 64,
  h = 28,
  color = "var(--brand)",
  fill = true
}) {
  if (!data.length) return null;
  const gid = "sg" + ++__sparkSeq;
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => [i * step, h - 4 - (d - min) / range * (h - 8)]);
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = path + ` L ${w},${h} L 0,${h} Z`;
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    viewBox: `0 0 ${w} ${h}`,
    className: "spark",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: 0.34
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: 0
  }))), fill ? /*#__PURE__*/React.createElement("path", {
    className: "spark-area",
    d: area,
    fill: `url(#${gid})`
  }) : null, /*#__PURE__*/React.createElement("path", {
    className: "spark-line",
    pathLength: 1,
    d: path,
    stroke: color,
    strokeWidth: 1.5,
    fill: "none",
    strokeLinecap: "round"
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/charts/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — initials chip for a user. The Auditor system uses initials (not
 * photos); background is a flat brand-soft tile. Sizes: sm(28) md(default
 * 28) lg(40) xl(64).
 */
function Avatar({
  initials,
  name,
  size = "md",
  className = "",
  style,
  ...rest
}) {
  const cls = ["avatar"];
  if (size === "lg") cls.push("avatar--lg");
  if (size === "xl") cls.push("avatar--xl");
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls.join(" "),
    title: name,
    style: style
  }, rest), initials);
}

/**
 * AvatarStack — overlapping avatars with a +N overflow chip.
 */
function AvatarStack({
  users = [],
  max = 4
}) {
  const shown = users.slice(0, max);
  const more = users.length - max;
  return /*#__PURE__*/React.createElement("div", {
    className: "av-stack"
  }, shown.map((u, i) => /*#__PURE__*/React.createElement(Avatar, {
    key: i,
    initials: u.initials || u.avatar,
    name: u.name
  })), more > 0 ? /*#__PURE__*/React.createElement("span", {
    className: "avatar",
    style: {
      background: "var(--bg-surface-3)",
      color: "var(--text-secondary)"
    }
  }, "+" + more) : null);
}
Object.assign(__ds_scope, { Avatar, AvatarStack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Stat.jsx
try { (() => {
/**
 * Stat — KPI tile. Big display numeral with an optional icon, delta, meta,
 * and progress bar. The dashboard stat-row building block.
 */
function Stat({
  icon: Icon,
  label,
  value,
  delta,
  deltaNeg,
  meta,
  bar
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat__label"
  }, label), Icon ? /*#__PURE__*/React.createElement("span", {
    className: "stat__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    size: 15
  })) : null), /*#__PURE__*/React.createElement("div", {
    className: "stat__value"
  }, value), delta != null || meta ? /*#__PURE__*/React.createElement("div", {
    className: "stat__row"
  }, meta ? /*#__PURE__*/React.createElement("span", {
    className: "stat__meta"
  }, meta) : /*#__PURE__*/React.createElement("span", null), delta != null ? /*#__PURE__*/React.createElement("span", {
    className: "stat__delta" + (deltaNeg ? " stat__delta--neg" : "")
  }, delta) : null) : null, bar != null ? /*#__PURE__*/React.createElement("div", {
    className: "stat__bar"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: Math.max(0, Math.min(100, bar)) + "%"
    }
  })) : null);
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Stat.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Field — labelled form row wrapping any control with an optional hint.
 */
function Field({
  label,
  hint,
  htmlFor,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "field__label",
    htmlFor: htmlFor
  }, label) : null, children, hint ? /*#__PURE__*/React.createElement("span", {
    className: "field__hint"
  }, hint) : null);
}

/**
 * Input — text control. Pass `iconLeft` to render a leading icon inside an
 * input-group. Variants for select/textarea share the same .input styling.
 */
function Input({
  iconLeft: IconLeft,
  className = "",
  as = "input",
  ...rest
}) {
  const Tag = as;
  const cls = [as === "textarea" ? "textarea" : as === "select" ? "select" : "input"];
  if (className) cls.push(className);
  const control = /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls.join(" ")
  }, rest));
  if (IconLeft) {
    return /*#__PURE__*/React.createElement("div", {
      className: "input-group"
    }, /*#__PURE__*/React.createElement(IconLeft, {
      className: "icon-l",
      size: 16
    }), control);
  }
  return control;
}
Object.assign(__ds_scope, { Field, Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * Tabs — underline-style tab switcher. Pure presentational: caller owns the
 * active id and handles `onChange`. Tabs may carry an icon and a count.
 */
function Tabs({
  active,
  onChange,
  tabs = []
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "tabs__btn" + (active === t.id ? " is-active" : ""),
    onClick: () => onChange && onChange(t.id)
  }, t.icon ? /*#__PURE__*/React.createElement(t.icon, {
    size: 15
  }) : null, /*#__PURE__*/React.createElement("span", null, t.label), t.count != null ? /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, t.count) : null)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/app.jsx
try { (() => {
/* Auditor — main app: hash routing + tweaks panel wiring. */
(function () {
  const {
    useState,
    useEffect,
    useMemo,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // ---------- Tweaks ----------
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark",
    "role": "departament",
    "density": "comfortable",
    "primary": "royal",
    "bg": "default",
    "showAI": true,
    "demoMode": false,
    "auditStatus": "in_progress"
  } /*EDITMODE-END*/;

  // Representative swatch per primary tone (shown in the color picker)
  const PRIMARY_SWATCH = {
    royal: "#2549EB",
    navy: "#4F60D1",
    teal: "#0F766E",
    forest: "#166534"
  };

  // ---------- Background (page) tones ----------
  // Each tone defines a light + dark page background so the chosen color
  // always stays legible regardless of the current theme. "default" mirrors
  // the token defaults from tokens.css.
  const BG_TONES = {
    default: {
      label: "Standart",
      light: "#F8FAFC",
      dark: "#0A1120"
    },
    slate: {
      label: "Salqin",
      light: "#EEF2F8",
      dark: "#0B1424"
    },
    warm: {
      label: "Iliq",
      light: "#F7F4EF",
      dark: "#14110B"
    },
    mint: {
      label: "Yashil",
      light: "#EFF6F1",
      dark: "#091410"
    },
    lavender: {
      label: "Lavanda",
      light: "#F2F0F9",
      dark: "#110E1C"
    },
    graphite: {
      label: "Grafit",
      light: "#F0F1F4",
      dark: "#101216"
    }
  };
  const PRIMARY_PALETTES = {
    royal: {
      label: "Royal blue",
      light: {
        brand: "#1E40AF",
        hover: "#1D3FD8",
        pressed: "#1E3A8A",
        soft: "#EFF5FF",
        softHover: "#E3EDFF",
        ring: "rgba(30,64,175,0.28)"
      },
      dark: {
        brand: "#3B65F6",
        hover: "#608BFA",
        pressed: "#2549EB",
        soft: "rgba(59,101,246,0.14)",
        softHover: "rgba(59,101,246,0.22)",
        ring: "rgba(96,139,250,0.45)"
      }
    },
    navy: {
      label: "Navy",
      light: {
        brand: "#1E3A8A",
        hover: "#1E40AF",
        pressed: "#172554",
        soft: "#E0E7FF",
        softHover: "#C7D2FE",
        ring: "rgba(30,58,138,0.28)"
      },
      dark: {
        brand: "#6B7FF1",
        hover: "#8B9EF7",
        pressed: "#4F60D1",
        soft: "rgba(107,127,241,0.14)",
        softHover: "rgba(107,127,241,0.22)",
        ring: "rgba(139,158,247,0.45)"
      }
    },
    teal: {
      label: "Cyber teal",
      light: {
        brand: "#0F766E",
        hover: "#0D9488",
        pressed: "#115E59",
        soft: "#E6FFFA",
        softHover: "#CCFBF1",
        ring: "rgba(15,118,110,0.28)"
      },
      dark: {
        brand: "#2DD4BF",
        hover: "#5EEAD4",
        pressed: "#14B8A6",
        soft: "rgba(45,212,191,0.14)",
        softHover: "rgba(45,212,191,0.22)",
        ring: "rgba(94,234,212,0.45)"
      }
    },
    forest: {
      label: "Forest",
      light: {
        brand: "#166534",
        hover: "#15803D",
        pressed: "#14532D",
        soft: "#F0FDF4",
        softHover: "#DCFCE7",
        ring: "rgba(22,101,52,0.28)"
      },
      dark: {
        brand: "#22C55E",
        hover: "#4ADE80",
        pressed: "#16A34A",
        soft: "rgba(34,197,94,0.14)",
        softHover: "rgba(34,197,94,0.22)",
        ring: "rgba(74,222,128,0.45)"
      }
    }
  };

  // ---------- Apply tweaks to :root ----------
  function applyTweaks(t) {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.theme);
    root.setAttribute("data-density", t.density);
    const pal = PRIMARY_PALETTES[t.primary] || PRIMARY_PALETTES.royal;
    const c = t.theme === "dark" ? pal.dark : pal.light;
    root.style.setProperty("--brand", c.brand);
    root.style.setProperty("--brand-hover", c.hover);
    root.style.setProperty("--brand-pressed", c.pressed);
    root.style.setProperty("--brand-soft", c.soft);
    root.style.setProperty("--brand-soft-hover", c.softHover);
    root.style.setProperty("--brand-ring", c.ring);
    root.style.setProperty("--focus-ring", "0 0 0 3px " + c.ring);
    root.style.setProperty("--text-link", c.brand);

    // Page background tone (theme-aware)
    const tone = BG_TONES[t.bg] || BG_TONES.default;
    root.style.setProperty("--bg-page", t.theme === "dark" ? tone.dark : tone.light);

    // Demo / presentation mode (amplifies cinematic effects)
    if (t.demoMode) root.setAttribute("data-demo", "on");else root.removeAttribute("data-demo");
  }

  // ---------- Boot skeleton (first-load shimmer) ----------
  function BootSkeleton() {
    return h("div", null, [h("div", {
      key: "hp",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 24
      }
    }, [h("div", {
      key: 1,
      className: "skeleton sk-line",
      style: {
        width: 260,
        height: 30
      }
    }), h("div", {
      key: 2,
      className: "skeleton sk-line",
      style: {
        width: 440,
        maxWidth: "60%"
      }
    })]), h("div", {
      key: "g",
      className: "boot-grid"
    }, [1, 2, 3, 4].map(i => h("div", {
      key: i,
      className: "skeleton sk-tile"
    }))), h("div", {
      key: "b",
      className: "boot-body"
    }, [h("div", {
      key: 1,
      className: "skeleton sk-panel"
    }), h("div", {
      key: 2,
      className: "skeleton sk-panel"
    })])]);
  }

  // ---------- Main App ----------
  function App() {
    const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : useFallbackTweaks();
    const [route, setRoute] = useState("dashboard");
    const [auditId, setAuditId] = useState(D.AUDITS[0].id);
    const [findingId, setFindingId] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [createAuditOpen, setCreateAuditOpen] = useState(false);
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [createFindingOpen, setCreateFindingOpen] = useState(false);
    const [createTokenOpen, setCreateTokenOpen] = useState(false);
    const [createUserOpen, setCreateUserOpen] = useState(false);
    const [createReportOpen, setCreateReportOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(true); // skip login by default for speed
    const [booting, setBooting] = useState(true);

    // Safety cap: never let the boot overlay get stuck (e.g. if rAF/timers
    // are throttled in a background tab) — guarantees the app reveals.
    useEffect(() => {
      const t = setTimeout(() => setBooting(false), 4200);
      return () => clearTimeout(t);
    }, []);

    // Material-style ripple on every .btn (skipped under reduced-motion)
    useEffect(() => {
      const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return undefined;
      function onClick(e) {
        const btn = e.target.closest && e.target.closest(".btn");
        if (!btn || btn.disabled) return;
        const rect = btn.getBoundingClientRect();
        const d = Math.max(rect.width, rect.height);
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = d + "px";
        span.style.left = e.clientX - rect.left + "px";
        span.style.top = e.clientY - rect.top + "px";
        span.style.margin = -d / 2 + "px 0 0 " + -d / 2 + "px";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 620);
      }
      document.addEventListener("click", onClick);
      return () => document.removeEventListener("click", onClick);
    }, []);

    // Cursor spotlight: track pointer position into CSS vars on cards
    useEffect(() => {
      function onMove(e) {
        const el = e.target.closest && e.target.closest(".stat, .panel, .hero-band");
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
      }
      document.addEventListener("pointermove", onMove, {
        passive: true
      });
      return () => document.removeEventListener("pointermove", onMove);
    }, []);

    // Expose task-modal opener globally so deep buttons can trigger it
    useEffect(() => {
      window.__openCreateTask = () => setCreateTaskOpen(true);
      window.__openCreateFinding = () => setCreateFindingOpen(true);
      window.__openCreateToken = () => setCreateTokenOpen(true);
      window.__openCreateUser = () => setCreateUserOpen(true);
      window.__openCreateReport = () => setCreateReportOpen(true);
    }, []);

    // Apply tweaks
    useEffect(() => {
      applyTweaks(tweaks);
    }, [tweaks.theme, tweaks.density, tweaks.primary, tweaks.bg, tweaks.demoMode]);

    // Mutate audit status (tweak-driven)
    const liveAudits = useMemo(() => {
      // override status of the first audit per tweak
      return D.AUDITS.map((a, i) => i === 0 ? {
        ...a,
        status: tweaks.auditStatus
      } : a);
    }, [tweaks.auditStatus]);
    // mutate the global so screens see it
    useEffect(() => {
      D.AUDITS[0].status = tweaks.auditStatus;
    }, [tweaks.auditStatus]);
    function openAudit(id) {
      setAuditId(id);
      setRoute("audit");
    }
    function openFinding(id) {
      setFindingId(id);
    }
    function openTask(_) {/* could open task drawer */}
    if (!loggedIn) return h(window.LoginScreen, {
      onLogin: () => setLoggedIn(true)
    });
    const shell = h("div", {
      className: "app",
      "data-collapsed": collapsed ? "true" : "false"
    }, [h(window.Topbar, {
      key: 1,
      collapsed,
      setCollapsed,
      theme: tweaks.theme,
      setTheme: v => setTweak("theme", v),
      role: tweaks.role,
      setRole: v => setTweak("role", v),
      setRoute,
      onLogout: () => setLoggedIn(false)
    }), h(window.Sidebar, {
      key: 2,
      route,
      setRoute,
      role: tweaks.role,
      collapsed
    }), h("main", {
      key: 3,
      className: "canvas"
    }, h("div", {
      className: "canvas__inner"
    }, booting ? null : h("div", {
      className: "route-anim",
      key: route
    }, route === "dashboard" ? h(window.DashboardScreen, {
      key: route,
      role: tweaks.role,
      setRoute,
      openAudit,
      showAI: tweaks.showAI,
      setCreateOpen: setCreateAuditOpen
    }) : route === "audits" ? h(window.AuditsListScreen, {
      key: route,
      role: tweaks.role,
      openAudit,
      setRoute,
      setCreateOpen: setCreateAuditOpen
    }) : route === "audit" ? h(window.AuditDetailScreen, {
      key: route + auditId,
      auditId,
      role: tweaks.role,
      setRoute,
      openFinding,
      openTask,
      showAI: tweaks.showAI
    }) : route === "tasks" ? h(window.MyTasksScreen, {
      key: route,
      role: tweaks.role,
      setRoute,
      openTask,
      setCreateTaskOpen
    }) : route === "findings" ? h(window.FindingsScreen, {
      key: route,
      openFinding,
      setRoute
    }) : route === "scanner" ? h(window.ScannerScreen, {
      key: route,
      setRoute,
      role: tweaks.role,
      showAI: tweaks.showAI
    }) : route === "ai" ? h(window.AIScreen, {
      key: route,
      setRoute,
      showAI: tweaks.showAI
    }) : route === "kpi" ? h(window.KpiScreen, {
      key: route,
      setRoute,
      role: tweaks.role
    }) : route === "reports" ? h(window.ReportsScreen, {
      key: route,
      setRoute
    }) : route === "tokens" ? h(window.TokensScreen, {
      key: route,
      setRoute,
      role: tweaks.role
    }) : route === "users" ? h(window.UsersScreen, {
      key: route,
      setRoute
    }) : route === "permissions" ? h(window.PermissionsScreen, {
      key: route,
      setRoute
    }) : route === "logs" ? h(window.LogsScreen, {
      key: route,
      setRoute
    }) : route === "agent" ? h(window.AgentScreen, {
      key: route,
      setRoute
    }) : route === "profile" ? h(window.ProfileScreen, {
      key: route,
      role: tweaks.role,
      setRoute
    }) : h(window.DashboardScreen, {
      role: tweaks.role,
      setRoute,
      openAudit,
      showAI: tweaks.showAI
    }))))]);
    return h(Fragment, null, [React.cloneElement(shell, {
      key: "shell"
    }),
    // Finding drawer
    findingId ? h(window.FindingDrawer, {
      key: "fd",
      findingId,
      onClose: () => setFindingId(null),
      role: tweaks.role
    }) : null,
    // Create audit modal
    createAuditOpen ? h(CreateAuditModal, {
      key: "cm",
      onClose: () => setCreateAuditOpen(false)
    }) : null,
    // Create task modal
    createTaskOpen ? h(CreateTaskModal, {
      key: "ct",
      onClose: () => setCreateTaskOpen(false)
    }) : null,
    // Create finding modal
    createFindingOpen ? h(CreateFindingModal, {
      key: "cf",
      onClose: () => setCreateFindingOpen(false)
    }) : null,
    // Create token modal
    createTokenOpen ? h(CreateTokenModal, {
      key: "ck",
      onClose: () => setCreateTokenOpen(false)
    }) : null,
    // Create user modal
    createUserOpen ? h(CreateUserModal, {
      key: "cu",
      onClose: () => setCreateUserOpen(false)
    }) : null,
    // Create report modal
    createReportOpen ? h(CreateReportModal, {
      key: "cr",
      onClose: () => setCreateReportOpen(false)
    }) : null,
    // Tweaks panel
    h(TweaksPanelEl, {
      key: "tw",
      tweaks,
      setTweak
    }),
    // Cinematic boot overlay
    booting ? h(window.BootSequence, {
      key: "boot",
      onDone: () => setBooting(false)
    }) : null]);
  }

  // ---------- Fallback if tweaks_panel starter didn't load ----------
  function useFallbackTweaks() {
    const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
    function setTweak(k, v) {
      if (typeof k === "object") setTweaks(t => ({
        ...t,
        ...k
      }));else setTweaks(t => ({
        ...t,
        [k]: v
      }));
    }
    return [tweaks, setTweak];
  }

  // ---------- Tweaks panel ----------
  function TweaksPanelEl({
    tweaks,
    setTweak
  }) {
    if (!window.TweaksPanel) return null;
    const TweaksPanel = window.TweaksPanel;
    const TweakSection = window.TweakSection;
    const TweakRadio = window.TweakRadio;
    const TweakSelect = window.TweakSelect;
    const TweakToggle = window.TweakToggle;
    const TweakColor = window.TweakColor;
    return h(TweaksPanel, {
      title: "Tweaks"
    }, [h(TweakSection, {
      label: "Ko‘rinish",
      key: 1
    }, [h(TweakRadio, {
      key: 1,
      label: "Theme",
      value: tweaks.theme,
      options: [{
        value: "dark",
        label: "Dark"
      }, {
        value: "light",
        label: "Light"
      }],
      onChange: v => setTweak("theme", v)
    }), h(TweakRadio, {
      key: 2,
      label: "Density",
      value: tweaks.density,
      options: [{
        value: "compact",
        label: "Compact"
      }, {
        value: "comfortable",
        label: "Cozy"
      }],
      onChange: v => setTweak("density", v)
    }), h(TweakColor, {
      key: 3,
      label: "Asosiy rang",
      value: PRIMARY_SWATCH[tweaks.primary] || PRIMARY_SWATCH.royal,
      options: ["royal", "navy", "teal", "forest"].map(k => PRIMARY_SWATCH[k]),
      onChange: hex => {
        const k = Object.keys(PRIMARY_SWATCH).find(key => PRIMARY_SWATCH[key].toLowerCase() === String(hex).toLowerCase());
        setTweak("primary", k || "royal");
      }
    }), function () {
      const variant = tweaks.theme === "dark" ? "dark" : "light";
      const keys = Object.keys(BG_TONES);
      return h(TweakColor, {
        key: 4,
        label: "Orqa fon rangi",
        value: (BG_TONES[tweaks.bg] || BG_TONES.default)[variant],
        options: keys.map(k => BG_TONES[k][variant]),
        onChange: hex => {
          const k = keys.find(key => BG_TONES[key][variant].toLowerCase() === String(hex).toLowerCase());
          setTweak("bg", k || "default");
        }
      });
    }()]), h(TweakSection, {
      label: "Rol almashtirish (demo)",
      key: 2
    }, [h(TweakSelect, {
      key: 1,
      label: "Foydalanuvchi roli",
      value: tweaks.role,
      options: D.ROLES.map(r => ({
        value: r.id,
        label: r.name
      })),
      onChange: v => setTweak("role", v)
    })]), h(TweakSection, {
      label: "Audit holati",
      key: 3
    }, [h(TweakSelect, {
      key: 1,
      label: "AUD-2026-014 holati",
      value: tweaks.auditStatus,
      options: Object.entries(D.STATUS_LABELS).map(([k, v]) => ({
        value: k,
        label: v.label
      })),
      onChange: v => setTweak("auditStatus", v)
    })]), h(TweakSection, {
      label: "AI",
      key: 4
    }, [h(TweakToggle, {
      key: 1,
      label: "AI tavsiyalarini ko‘rsatish",
      value: tweaks.showAI,
      onChange: v => setTweak("showAI", v)
    })]), h(TweakSection, {
      label: "Taqdimot rejimi",
      key: 5
    }, [h(TweakToggle, {
      key: 1,
      label: "Demo / Presentation rejimi",
      value: tweaks.demoMode,
      onChange: v => setTweak("demoMode", v)
    })])]);
  }

  // ---------- Create audit modal ----------
  function CreateAuditModal({
    onClose
  }) {
    return h(window.Modal, {
      open: true,
      onClose,
      wide: true,
      title: h("span", null, [h(I.Plus, {
        size: 16,
        style: {
          marginRight: 8
        }
      }), "Yangi audit yaratish"]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: onClose
      }, "Bekor"), h("button", {
        key: 2,
        className: "btn btn--soft btn--sm",
        onClick: () => {
          onClose();
          window.showToast("Audit qoralama sifatida saqlandi", "info");
        }
      }, [h(I.Save, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Qoralama saqlash")]), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: onClose
      }, [h(I.Check, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Yaratish va davom etish")])]
    }, [h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field span-2",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Audit nomi"), h("input", {
      className: "input",
      placeholder: "Masalan: Aloqa vazirligi — yillik kompleks audit"
    })]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Audit turi"), h("select", {
      className: "select"
    }, [h("option", {
      key: 1
    }, "Kompleks audit"), h("option", {
      key: 2
    }, "Texnik audit"), h("option", {
      key: 3
    }, "Penetration test"), h("option", {
      key: 4
    }, "Web audit"), h("option", {
      key: 5
    }, "Maxsus audit")])]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Tashkilot"), h("select", {
      className: "select"
    }, D.ORGS.map(o => h("option", {
      key: o.id
    }, o.name)))]), h("div", {
      className: "field",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Boshlanish"), h("input", {
      className: "input",
      type: "date",
      defaultValue: "2026-06-01"
    })]), h("div", {
      className: "field",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "Tugash"), h("input", {
      className: "input",
      type: "date",
      defaultValue: "2026-07-15"
    })]), h("div", {
      className: "field span-2",
      key: 6
    }, [h("label", {
      className: "field__label"
    }, "Audit guruhi rahbari"), h("select", {
      className: "select"
    }, D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u => h("option", {
      key: u.id
    }, u.name + " — " + u.title)))]), h("div", {
      className: "field span-2",
      key: 7
    }, [h("label", {
      className: "field__label"
    }, "Auditorlar (ko‘p tanlash)"), h("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: 10,
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        background: "var(--bg-input)"
      }
    }, D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map((u, i) => h("span", {
      key: u.id,
      className: "tag " + (i < 3 ? "tag--brand" : "tag--outline"),
      style: {
        cursor: "pointer",
        padding: "4px 8px"
      }
    }, [i < 3 ? h(I.Check, {
      size: 10,
      key: "i"
    }) : null, h("span", {
      key: "n"
    }, u.name)])))]), h("div", {
      className: "field span-2",
      key: 8
    }, [h("label", {
      className: "field__label"
    }, "Qisqacha izoh"), h("textarea", {
      className: "textarea",
      placeholder: "Audit doirasini qisqacha bayon qiling..."
    })])])]);
  }

  // ---------- Create task modal ----------
  function CreateTaskModal({
    onClose
  }) {
    return h(window.Modal, {
      open: true,
      onClose,
      wide: true,
      title: h("span", null, [h(I.Plus, {
        size: 16,
        style: {
          marginRight: 8
        }
      }), "Yangi vazifa"]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: onClose
      }, "Bekor"), h("button", {
        key: 2,
        className: "btn btn--soft btn--sm",
        onClick: () => {
          onClose();
          window.showToast("Vazifa qoralama sifatida saqlandi", "info");
        }
      }, [h(I.Save, {
        size: 14
      }), h("span", {
        key: "t"
      }, "Qoralama")]), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: onClose
      }, [h(I.Check, {
        size: 14
      }), h("span", {
        key: "t"
      }, "Yaratish va biriktirish")])]
    }, [h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field span-2",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Vazifa nomi"), h("input", {
      className: "input",
      placeholder: "Masalan: Firewall qoidalari va segmentatsiyani tahlil qilish"
    })]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Audit"), h("select", {
      className: "select"
    }, D.AUDITS.map(a => h("option", {
      key: a.id
    }, a.code + " — " + (a.title.length > 38 ? a.title.slice(0, 38) + "…" : a.title))))]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Turi"), h("select", {
      className: "select"
    }, [h("option", {
      key: 1
    }, "Konfiguratsiya"), h("option", {
      key: 2
    }, "Skaner"), h("option", {
      key: 3
    }, "Trafik"), h("option", {
      key: 4
    }, "Tizim audit"), h("option", {
      key: 5
    }, "Log"), h("option", {
      key: 6
    }, "Hujjat"), h("option", {
      key: 7
    }, "Hisobot")])]), h("div", {
      className: "field",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Ustuvorlik"), h("select", {
      className: "select",
      defaultValue: "O‘rta"
    }, [h("option", {
      key: 1
    }, "Yuqori"), h("option", {
      key: 2
    }, "O‘rta"), h("option", {
      key: 3
    }, "Past")])]), h("div", {
      className: "field",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "Muddat"), h("input", {
      className: "input",
      type: "date",
      defaultValue: "2026-05-30"
    })]), h("div", {
      className: "field span-2",
      key: 6
    }, [h("label", {
      className: "field__label"
    }, "Mas’ul (biriktirish)"), h("select", {
      className: "select"
    }, D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u => h("option", {
      key: u.id
    }, u.name + " — " + u.title)))]), h("div", {
      className: "field span-2",
      key: 7
    }, [h("label", {
      className: "field__label"
    }, "Tavsif"), h("textarea", {
      className: "textarea",
      placeholder: "Vazifa doirasi, kutilayotgan natijalar, foydalaniladigan vositalar..."
    })]), h("div", {
      className: "field span-2",
      key: 8
    }, [h("label", {
      className: "field__label"
    }, "Token kerakmi?"), h("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [h("label", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: "1px solid var(--brand)",
        borderRadius: 6,
        flex: 1,
        background: "var(--brand-soft)"
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      name: "tok",
      defaultChecked: true
    }), h("div", null, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "Mavjud tokenga qo‘shish"), h("div", {
      key: 2,
      className: "cell-sub"
    }, "Foydalanuvchining joriy audit tokeni ushbu vazifani ham ochadi")])]), h("label", {
      key: 2,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        flex: 1
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      name: "tok"
    }), h("div", null, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "Token shart emas"), h("div", {
      key: 2,
      className: "cell-sub"
    }, "Faqat web tizimda bajariladigan vazifa (masalan, hisobot)")])])])])])]);
  }

  // ---------- Create finding modal ----------
  function CreateFindingModal({
    onClose
  }) {
    const [sev, setSev] = useState("high");
    const [aiOn, setAiOn] = useState(true);
    return h(window.Modal, {
      open: true,
      onClose,
      wide: true,
      title: h("span", null, [h(I.AlertTriangle, {
        size: 16,
        style: {
          marginRight: 8,
          color: "var(--status-warning-fg)"
        }
      }), "Yangi finding / zaiflik"]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: onClose
      }, "Bekor"), h("button", {
        key: 2,
        className: "btn btn--soft btn--sm",
        onClick: () => {
          onClose();
          window.showToast("Finding qoralama sifatida saqlandi", "info");
        }
      }, [h(I.Save, {
        size: 14
      }), h("span", {
        key: "t"
      }, "Qoralama saqlash")]), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: onClose
      }, [h(I.Send, {
        size: 14
      }), h("span", {
        key: "t"
      }, "Yuborish")])]
    }, [h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field span-2",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Sarlavha"), h("input", {
      className: "input",
      placeholder: "Masalan: Internal segment 10.0.0.0/8 ga to‘liq ruxsat berilgan"
    })]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Audit"), h("select", {
      className: "select"
    }, D.AUDITS.map(a => h("option", {
      key: a.id
    }, a.code)))]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Bog‘lanadigan vazifa"), h("select", {
      className: "select"
    }, D.TASKS.slice(0, 6).map(t => h("option", {
      key: t.id
    }, t.id + " — " + (t.title.length > 38 ? t.title.slice(0, 38) + "…" : t.title))))]), h("div", {
      className: "field span-2",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Xavf darajasi"), h("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, ["critical", "high", "medium", "low", "info"].map(s => h("button", {
      key: s,
      type: "button",
      className: "btn btn--ghost btn--sm",
      onClick: () => setSev(s),
      style: {
        flex: 1,
        padding: 12,
        border: sev === s ? "1.5px solid var(--brand)" : "1px solid var(--border-color)",
        background: sev === s ? "var(--brand-soft)" : "var(--bg-surface)"
      }
    }, h(window.Sev, {
      level: s
    }))))]), h("div", {
      className: "field",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "CVSS 3.1 ball"), h("input", {
      className: "input tabular",
      defaultValue: sev === "critical" ? "9.1" : sev === "high" ? "7.4" : sev === "medium" ? "5.4" : "3.0"
    })]), h("div", {
      className: "field",
      key: 6
    }, [h("label", {
      className: "field__label"
    }, "CWE"), h("input", {
      className: "input font-mono",
      placeholder: "CWE-284",
      defaultValue: "CWE-284"
    })]), h("div", {
      className: "field",
      key: 7
    }, [h("label", {
      className: "field__label"
    }, "Asset"), h("input", {
      className: "input font-mono",
      placeholder: "FW-CORE-01 yoki 10.20.4.142",
      defaultValue: "FW-CORE-01"
    })]), h("div", {
      className: "field",
      key: 8
    }, [h("label", {
      className: "field__label"
    }, "Toifa"), h("select", {
      className: "select"
    }, [h("option", {
      key: 1
    }, "Konfiguratsiya kamchiligi"), h("option", {
      key: 2
    }, "Tizim sozlamasi"), h("option", {
      key: 3
    }, "CVE / patch"), h("option", {
      key: 4
    }, "Web zaiflik"), h("option", {
      key: 5
    }, "Trafik anomaliya"), h("option", {
      key: 6
    }, "Operatsion kamchilik")])]), h("div", {
      className: "field span-2",
      key: 9
    }, [h("label", {
      className: "field__label"
    }, "Tavsif"), h("textarea", {
      className: "textarea",
      style: {
        minHeight: 110
      },
      placeholder: "Kamchilik tavsifi, dalillar va kuzatish konteksti..."
    })]), h("div", {
      className: "field span-2",
      key: 10
    }, [h("label", {
      className: "field__label"
    }, "Dalillar"), h("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 14,
        border: "1.5px dashed var(--border-color)",
        borderRadius: 8,
        background: "var(--bg-surface-2)"
      }
    }, [h(I.Paperclip, {
      key: 0,
      size: 18,
      style: {
        color: "var(--brand)"
      }
    }), h("div", {
      key: 1,
      style: {
        flex: 1
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "Skrinshot, log, konfiguratsiya yoki PCAP biriktiring"), h("div", {
      key: 2,
      className: "cell-sub"
    }, "Drag & drop yoki tanlash. Har bir fayl checksum bilan saqlanadi.")]), h("button", {
      key: 2,
      type: "button",
      className: "btn btn--soft btn--sm",
      onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info")
    }, [h(I.Upload, {
      size: 13
    }), h("span", {
      key: "t"
    }, "Fayl tanlash")])])]), h("div", {
      className: "field span-2",
      key: 11
    }, [h("label", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 10,
        background: aiOn ? "var(--brand-soft)" : "var(--bg-surface-2)",
        border: "1px solid " + (aiOn ? "var(--brand-soft-hover)" : "var(--border-color)"),
        borderRadius: 8,
        cursor: "pointer",
        transition: "all var(--dur-fast) var(--ease-out)"
      }
    }, [h("input", {
      type: "checkbox",
      className: "checkbox",
      checked: aiOn,
      onChange: e => setAiOn(e.target.checked)
    }), h(I.Sparkles, {
      key: 1,
      size: 14,
      style: {
        color: "var(--brand)"
      }
    }), h("span", {
      key: 2,
      style: {
        flex: 1,
        fontSize: 13,
        color: "var(--text-primary)",
        fontWeight: 500
      }
    }, "Ollama AI orqali avtomatik remediation tavsiyasi yarat"), h("span", {
      key: 3,
      className: "tag tag--brand",
      style: {
        fontSize: 10
      }
    }, "qwen2.5:14b")])])])]);
  }

  // ---------- Create token modal ----------
  function CreateTokenModal({
    onClose
  }) {
    return h(window.Modal, {
      open: true,
      onClose,
      wide: true,
      title: h("span", null, [h(I.KeyRound, {
        size: 16,
        style: {
          marginRight: 8,
          color: "var(--brand)"
        }
      }), "Yangi audit token"]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: onClose
      }, "Bekor"), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: onClose
      }, [h(I.Check, {
        size: 14
      }), h("span", {
        key: "t"
      }, "Token chiqarish")])]
    }, [h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field span-2",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Audit"), h("select", {
      className: "select"
    }, D.AUDITS.map(a => h("option", {
      key: a.id
    }, a.code + " — " + (a.title.length > 50 ? a.title.slice(0, 50) + "…" : a.title))))]), h("div", {
      className: "field span-2",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Xodim (token egasi)"), h("select", {
      className: "select"
    }, D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u => h("option", {
      key: u.id
    }, u.name + " — " + u.title)))]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Boshlanish"), h("input", {
      className: "input",
      type: "datetime-local",
      defaultValue: "2026-05-20T09:00"
    })]), h("div", {
      className: "field",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Tugash"), h("input", {
      className: "input",
      type: "datetime-local",
      defaultValue: "2026-05-31T18:00"
    })]), h("div", {
      className: "field span-2",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "Token ochadigan vazifalar"), h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        maxHeight: 200,
        overflowY: "auto",
        padding: 8,
        border: "1px solid var(--border-color)",
        borderRadius: 6
      }
    }, D.TASKS.slice(0, 6).map((t, i) => h("label", {
      key: t.id,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: 6,
        borderRadius: 4
      }
    }, [h("input", {
      type: "checkbox",
      className: "checkbox",
      defaultChecked: i < 3
    }), h("span", {
      key: 1,
      className: "font-mono",
      style: {
        fontSize: 12,
        color: "var(--text-tertiary)"
      }
    }, t.id), h("span", {
      key: 2,
      style: {
        flex: 1,
        fontSize: 13
      }
    }, t.title)])))]), h("div", {
      className: "field span-2",
      key: 6
    }, [h("label", {
      className: "field__label"
    }, "Qurilma bog‘lash"), h("label", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: "1px solid var(--brand)",
        borderRadius: 6,
        background: "var(--brand-soft)"
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      defaultChecked: true,
      name: "tok-dev"
    }), h("div", {
      key: 1
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "Birinchi ulanishda qurilma bilan bog‘lash"), h("div", {
      key: 2,
      className: "cell-sub"
    }, "Agent token bilan kirgan birinchi qurilma (hostname + OS + IP) saqlanadi va keyingilari rad etiladi")])])])])]);
  }

  // ---------- Create user modal ----------
  function CreateUserModal({
    onClose
  }) {
    return h(window.Modal, {
      open: true,
      onClose,
      wide: true,
      title: h("span", null, [h(I.UserCheck, {
        size: 16,
        style: {
          marginRight: 8,
          color: "var(--brand)"
        }
      }), "Yangi foydalanuvchi"]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: onClose
      }, "Bekor"), h("button", {
        key: 2,
        className: "btn btn--soft btn--sm",
        onClick: () => {
          onClose();
          window.showToast("Email taklif yuborildi", "success");
        }
      }, [h(I.Mail, {
        size: 14
      }), h("span", {
        key: "t"
      }, "Email orqali taklif")]), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: onClose
      }, [h(I.Check, {
        size: 14
      }), h("span", {
        key: "t"
      }, "Yaratish")])]
    }, [h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Ism va familiya"), h("input", {
      className: "input",
      placeholder: "Masalan: Bobur Mirzayev"
    })]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Login (domen hisobi)"), h("input", {
      className: "input font-mono",
      placeholder: "b.mirzayev@gov.uz"
    })]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Lavozim"), h("input", {
      className: "input",
      placeholder: "Audit bo‘limi bosh mutaxassisi"
    })]), h("div", {
      className: "field",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Bo‘lim"), h("input", {
      className: "input",
      defaultValue: "Audit bo‘limi"
    })]), h("div", {
      className: "field span-2",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "Rol"), h("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, D.ROLES.map((r, i) => h("label", {
      key: r.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: "1px solid " + (i === 2 ? "var(--brand)" : "var(--border-color)"),
        background: i === 2 ? "var(--brand-soft)" : "var(--bg-surface)",
        borderRadius: 6,
        flex: "1 1 calc(33% - 6px)",
        minWidth: 0,
        cursor: "pointer"
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      name: "role",
      defaultChecked: i === 2
    }), h("div", {
      key: 1,
      style: {
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, r.short), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11
      }
    }, r.name)])])))]), h("div", {
      className: "field span-2",
      key: 6
    }, [h("label", {
      className: "field__label"
    }, "Boshlang‘ich parol"), h("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [h("input", {
      className: "input font-mono",
      defaultValue: "X9k!mP2nQ4vR7zL",
      style: {
        flex: 1
      }
    }), h("button", {
      type: "button",
      className: "btn btn--ghost btn--sm",
      onClick: e => {
        const input = e.target.closest('.field').querySelector('input.input');
        const newPass = Array.from({
          length: 14
        }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'.charAt(Math.floor(Math.random() * 60))).join('');
        input.value = newPass;
        window.showToast("Yangi parol yaratildi", "success");
      }
    }, [h(I.Refresh, {
      size: 13
    }), h("span", {
      key: "t"
    }, "Yangilash")]), h("button", {
      type: "button",
      className: "btn btn--ghost btn--sm",
      onClick: e => {
        const input = e.target.closest('.field').querySelector('input.input');
        try {
          navigator.clipboard.writeText(input.value);
        } catch (e) {}
        window.showToast("Parol buferga ko'chirildi", "success");
      }
    }, [h(I.Copy, {
      size: 13
    }), h("span", {
      key: "t"
    }, "Nusxa")])]), h("label", {
      className: "field__hint",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginTop: 6
      }
    }, [h("input", {
      type: "checkbox",
      className: "checkbox",
      defaultChecked: true
    }), h("span", null, "Birinchi kirishda parolni o‘zgartirishni majburlash")])])])]);
  }

  // ---------- Create report modal ----------
  function CreateReportModal({
    onClose
  }) {
    return h(window.Modal, {
      open: true,
      onClose,
      wide: true,
      title: h("span", null, [h(I.FileText, {
        size: 16,
        style: {
          marginRight: 8,
          color: "var(--brand)"
        }
      }), "Hisobot generatsiya qilish"]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: onClose
      }, "Bekor"), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: onClose
      }, [h(I.Sparkles, {
        size: 14
      }), h("span", {
        key: "t"
      }, "AI orqali yaratish")])]
    }, [h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field span-2",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Audit"), h("select", {
      className: "select"
    }, D.AUDITS.map(a => h("option", {
      key: a.id
    }, a.code + " — " + (a.title.length > 50 ? a.title.slice(0, 50) + "…" : a.title))))]), h("div", {
      className: "field span-2",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Hisobot turi"), h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      t: "Yakuniy audit hisoboti",
      d: "To‘liq texnik va boshqaruv hisoboti — 60–90 sahifa",
      i: I.FileText,
      def: true
    }, {
      t: "Executive summary",
      d: "Rahbariyat uchun 2 sahifalik qisqa xulosa",
      i: I.Star
    }, {
      t: "Remediation plan",
      d: "Texnik bartaraf etish rejasi (owner + ETA)",
      i: I.Target
    }, {
      t: "Penetration test hisoboti",
      d: "Faqat pentest auditlari uchun",
      i: I.Bug
    }, {
      t: "KPI hisoboti",
      d: "Auditda qatnashgan mutaxassislar reytingi",
      i: I.Trophy
    }].map((r, i) => h("label", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 10,
        border: "1px solid " + (r.def ? "var(--brand)" : "var(--border-color)"),
        background: r.def ? "var(--brand-soft)" : "var(--bg-surface)",
        borderRadius: 6,
        cursor: "pointer"
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      name: "rtype",
      defaultChecked: r.def
    }), h(r.i, {
      key: 1,
      size: 16,
      style: {
        color: "var(--brand)",
        flexShrink: 0
      }
    }), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, r.t), h("div", {
      key: 2,
      className: "cell-sub"
    }, r.d)])])))]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Til"), h("select", {
      className: "select"
    }, [h("option", {
      key: 1
    }, "O‘zbek (lotin)"), h("option", {
      key: 2
    }, "O‘zbek (kirill)"), h("option", {
      key: 3
    }, "Ingliz"), h("option", {
      key: 4
    }, "Rus")])]), h("div", {
      className: "field",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Formatlar"), h("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, ["DOCX", "PDF", "XLSX", "HTML"].map((f, i) => h("label", {
      key: f,
      className: "tag " + (i < 2 ? "tag--brand" : "tag--outline"),
      style: {
        cursor: "pointer",
        padding: "4px 10px"
      }
    }, [i < 2 ? h(I.Check, {
      size: 10,
      key: "i"
    }) : null, h("span", {
      key: "n"
    }, f)])))]), h("div", {
      className: "field span-2",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "Bo‘limlar"), h("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6
      }
    }, ["Tashkilot ma‘lumotlari", "Audit guruhi va vazifalar", "Aniqlangan findinglar (24)", "Konfiguratsiya tahlili", "Skaner natijalari", "Trafik tahlili", "AI executive summary", "Remediation plan", "KPI natijalari", "Ilovalar va dalillar"].map((s, i) => h("label", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "var(--text-secondary)"
      }
    }, [h("input", {
      type: "checkbox",
      className: "checkbox",
      defaultChecked: i !== 9
    }), h("span", null, s)])))])])]);
  }

  // ---------- Mount ----------
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(h(App));
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/chrome.jsx
try { (() => {
/* App chrome: Sidebar + Topbar + small UI primitives shared by screens. */
(function () {
  const {
    useState,
    useEffect,
    useMemo,
    useRef,
    useContext,
    createContext,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;

  // ---------- Motion helpers ----------
  const easeOutCubic = p => 1 - Math.pow(1 - p, 3);
  const easeOutExpo = p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
  function useReducedMotion() {
    const [reduce, setReduce] = useState(() => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
    useEffect(() => {
      if (typeof matchMedia === "undefined") return undefined;
      const m = matchMedia("(prefers-reduced-motion: reduce)");
      const fn = () => setReduce(m.matches);
      m.addEventListener ? m.addEventListener("change", fn) : m.addListener(fn);
      return () => {
        m.removeEventListener ? m.removeEventListener("change", fn) : m.removeListener(fn);
      };
    }, []);
    return reduce;
  }
  window.useReducedMotion = useReducedMotion;

  // Animates an integer 0 → target with an ease-out curve. Honors reduced-motion.
  function useCountValue(target, reduce, duration = 1000) {
    const [v, setV] = useState(reduce ? target : 0);
    useEffect(() => {
      if (reduce || typeof target !== "number" || !isFinite(target)) {
        setV(target);
        return undefined;
      }
      let raf;
      const start = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - start) / duration);
        setV(Math.round(target * easeOutExpo(p)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const safety = setTimeout(() => setV(target), duration + 400);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(safety);
      };
    }, [target, reduce]);
    return v;
  }

  // Renders a value (number OR string like "118/142", "89%") with every numeric
  // run counting up from zero. Non-numeric value passes straight through.
  function CountUp({
    value,
    duration = 1100,
    className
  }) {
    const reduce = useReducedMotion();
    const str = String(value);
    const tokens = useMemo(() => str.match(/(\d[\d,]*\.?\d*)|([^\d]+)/g) || [str], [str]);
    const targets = useMemo(() => tokens.map(t => /^\d/.test(t) ? parseFloat(t.replace(/,/g, "")) : null), [tokens]);
    const hasNum = targets.some(t => t !== null);
    const [t, setT] = useState(reduce || !hasNum ? 1 : 0);
    useEffect(() => {
      if (reduce || !hasNum) {
        setT(1);
        return undefined;
      }
      let raf;
      const start = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - start) / duration);
        setT(easeOutExpo(p));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setT(0);
      raf = requestAnimationFrame(tick);
      const safety = setTimeout(() => setT(1), duration + 400);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(safety);
      };
    }, [str, reduce]);
    const out = tokens.map((tok, i) => {
      if (targets[i] === null) return tok;
      const dec = (tok.split(".")[1] || "").length;
      const cur = targets[i] * t;
      const num = dec > 0 ? cur.toFixed(dec) : String(Math.round(cur));
      return tok.includes(",") ? Number(num).toLocaleString("en-US") : num;
    }).join("");
    return h("span", {
      className
    }, out);
  }
  window.CountUp = CountUp;

  // ---------- AppContext ----------
  const AppContext = createContext(null);
  window.AppContext = AppContext;

  // Returns label for a status key.
  function statusTag(key) {
    const s = window.AppData.STATUS_LABELS[key];
    if (!s) return null;
    return h("span", {
      key: "st-" + key,
      className: `tag ${s.tag}`
    }, s.label);
  }
  window.statusTag = statusTag;

  // ---------- Avatar ----------
  function Avatar({
    user,
    size = "md",
    className
  }) {
    if (typeof user === "string") user = window.AppData.userById(user);
    const cls = ["avatar"];
    if (size === "lg") cls.push("avatar--lg");
    if (size === "xl") cls.push("avatar--xl");
    if (className) cls.push(className);
    return h("span", {
      className: cls.join(" "),
      title: user.name
    }, user.avatar);
  }
  window.Avatar = Avatar;

  // ---------- Avatar stack ----------
  function AvatarStack({
    users,
    max = 4
  }) {
    const list = users.slice(0, max).map(u => typeof u === "string" ? window.AppData.userById(u) : u);
    const more = users.length - max;
    return h("div", {
      className: "av-stack"
    }, [...list.map((u, i) => h(Avatar, {
      key: u.id || i,
      user: u
    })), more > 0 ? h("span", {
      className: "avatar",
      key: "more",
      style: {
        background: "var(--bg-surface-3)",
        color: "var(--text-secondary)"
      }
    }, `+${more}`) : null]);
  }
  window.AvatarStack = AvatarStack;

  // ---------- Severity badge ----------
  function Sev({
    level
  }) {
    const lvl = level && level.toLowerCase();
    return h("span", {
      className: `sev sev--${lvl}`
    }, window.AppData.SEV_LABELS[lvl] || level);
  }
  window.Sev = Sev;

  // ---------- Sparkline ----------
  let __sparkSeq = 0;
  function Sparkline({
    data,
    w = 64,
    h: H = 28,
    color = "var(--brand)",
    fill = true
  }) {
    const gid = useMemo(() => "sg" + ++__sparkSeq, []);
    if (!data || !data.length) return null;
    const min = Math.min(...data),
      max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    const points = data.map((d, i) => [i * step, H - 4 - (d - min) / range * (H - 8)]);
    const path = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const area = path + ` L ${w},${H} L 0,${H} Z`;
    return h("svg", {
      width: w,
      height: H,
      viewBox: `0 0 ${w} ${H}`,
      className: "spark",
      "aria-hidden": "true"
    }, [h("defs", {
      key: "d"
    }, h("linearGradient", {
      id: gid,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, [h("stop", {
      key: 1,
      offset: "0%",
      stopColor: color,
      stopOpacity: 0.34
    }), h("stop", {
      key: 2,
      offset: "100%",
      stopColor: color,
      stopOpacity: 0
    })])), fill ? h("path", {
      key: "f",
      className: "spark-area",
      d: area,
      fill: `url(#${gid})`
    }) : null, h("path", {
      key: "l",
      className: "spark-line",
      pathLength: 1,
      d: path,
      stroke: color,
      strokeWidth: 1.5,
      fill: "none",
      strokeLinecap: "round"
    })]);
  }
  window.Sparkline = Sparkline;

  // ---------- Donut ----------
  function Donut({
    items,
    size = 120,
    thickness = 18,
    total: forceTotal
  }) {
    const reduce = useReducedMotion();
    const total = forceTotal || items.reduce((s, x) => s + x.value, 0);
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    const cx = size / 2;
    const [drawn, setDrawn] = useState(reduce);
    const count = useCountValue(total, reduce, 1000);
    useEffect(() => {
      if (reduce) {
        setDrawn(true);
        return undefined;
      }
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setDrawn(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }, [reduce]);
    return h("svg", {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      className: "donut"
    }, [h("circle", {
      key: "bg",
      cx,
      cy: cx,
      r,
      fill: "none",
      stroke: "var(--bg-surface-3)",
      strokeWidth: thickness
    }), ...items.map((it, i) => {
      if (!it.value) return null;
      const len = it.value / total * c;
      const dashOff = -offset;
      offset += len;
      return h("circle", {
        key: i,
        className: "donut-seg",
        cx,
        cy: cx,
        r,
        fill: "none",
        stroke: it.color,
        strokeWidth: thickness,
        strokeDasharray: drawn ? `${len} ${c - len}` : `0 ${c}`,
        strokeDashoffset: dashOff,
        transform: `rotate(-90 ${cx} ${cx})`,
        strokeLinecap: "butt",
        style: {
          transitionDelay: i * 140 + "ms"
        }
      });
    }), h("text", {
      key: "t",
      x: cx,
      y: cx - 4,
      textAnchor: "middle",
      fontSize: 22,
      fontWeight: 800,
      fill: "var(--text-primary)",
      fontFamily: "var(--font-display)",
      letterSpacing: "-0.02em"
    }, count), h("text", {
      key: "s",
      x: cx,
      y: cx + 14,
      textAnchor: "middle",
      fontSize: 10,
      fill: "var(--text-tertiary)",
      fontWeight: 600,
      letterSpacing: "0.08em"
    }, "JAMI")]);
  }
  window.Donut = Donut;

  // ---------- Bar chart ----------
  function BarChart({
    data,
    w = 240,
    h: H = 80,
    color = "var(--brand)"
  }) {
    if (!data || !data.length) return null;
    const max = Math.max(...data.map(d => d.value), 1);
    const bw = (w - (data.length - 1) * 6) / data.length;
    return h("svg", {
      width: w,
      height: H,
      viewBox: `0 0 ${w} ${H}`
    }, [...data.map((d, i) => {
      const bh = d.value / max * (H - 18);
      const x = i * (bw + 6);
      const y = H - 16 - bh;
      return h(Fragment, {
        key: i
      }, [h("rect", {
        x,
        y,
        width: bw,
        height: bh,
        rx: 2,
        className: "bar-grow",
        fill: d.color || color,
        opacity: d.muted ? 0.4 : 1
      }), h("text", {
        x: x + bw / 2,
        y: H - 4,
        textAnchor: "middle",
        fontSize: 10,
        fill: "var(--text-tertiary)"
      }, d.label)]);
    })]);
  }
  window.BarChart = BarChart;

  // ---------- Sidebar ----------
  function Sidebar({
    route,
    setRoute,
    role,
    collapsed
  }) {
    const items = [{
      group: "Asosiy",
      entries: [{
        id: "dashboard",
        label: "Boshqaruv paneli",
        icon: I.LayoutDashboard
      }, {
        id: "audits",
        label: "Auditlar",
        icon: I.FolderKanban,
        count: 6
      }, {
        id: "tasks",
        label: "Mening vazifalarim",
        icon: I.CheckSquare,
        count: 7
      }, {
        id: "findings",
        label: "Findinglar",
        icon: I.AlertTriangle,
        count: 34
      }]
    }, {
      group: "Tahlil",
      entries: [{
        id: "scanner",
        label: "Skaner / fayl tahlili",
        icon: I.FileSearch
      }, {
        id: "ai",
        label: "AI tahlil & hisobot",
        icon: I.Sparkles
      }, {
        id: "kpi",
        label: "KPI",
        icon: I.BarChart3
      }, {
        id: "reports",
        label: "Hisobotlar",
        icon: I.FileText
      }]
    }, {
      group: "Boshqaruv",
      entries: [{
        id: "tokens",
        label: "Audit tokenlar",
        icon: I.KeyRound,
        roles: ["departament", "bolim"]
      }, {
        id: "users",
        label: "Foydalanuvchilar",
        icon: I.Users,
        roles: ["departament", "bolim"]
      }, {
        id: "permissions",
        label: "Rollar va ruxsatlar",
        icon: I.ShieldCheck,
        roles: ["departament"]
      }, {
        id: "logs",
        label: "Audit loglar",
        icon: I.History
      }, {
        id: "agent",
        label: "EXE agent (demo)",
        icon: I.Monitor
      }]
    }];
    return h("aside", {
      className: "sidebar"
    }, [...items.map(group => h(Fragment, {
      key: group.group
    }, [h("div", {
      key: "l",
      className: "sidebar__label"
    }, group.group), h("div", {
      key: "s",
      className: "sidebar__section"
    }, group.entries.filter(e => !e.roles || e.roles.includes(role)).map(e => h("button", {
      key: e.id,
      className: "navitem" + (route === e.id ? " is-active" : ""),
      onClick: () => setRoute(e.id)
    }, [h(e.icon, {
      key: "i"
    }), h("span", {
      key: "l",
      className: "label"
    }, e.label), e.count != null ? h("span", {
      key: "c",
      className: "count"
    }, e.count) : null])))])), h("div", {
      key: "foot",
      className: "sidebar__foot"
    }, [h("strong", {
      key: 1
    }, "Yopiq kontur"), h("span", {
      key: 2
    }, "Lokal Ollama: qwen2.5:14b · sync OK")])]);
  }
  window.Sidebar = Sidebar;

  // ---------- Topbar ----------
  function Topbar({
    collapsed,
    setCollapsed,
    theme,
    setTheme,
    role,
    setRole,
    setRoute,
    onLogout
  }) {
    const user = window.AppData.USERS.find(u => u.role === role) || window.AppData.USERS[0];
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const menuRef = useRef(null);
    const notifRef = useRef(null);
    useEffect(() => {
      if (!menuOpen) return;
      function onDocClick(e) {
        if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      }
      function onKey(e) {
        if (e.key === "Escape") setMenuOpen(false);
      }
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [menuOpen]);
    useEffect(() => {
      if (!notifOpen) return;
      function onDocClick(e) {
        if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      }
      function onKey(e) {
        if (e.key === "Escape") setNotifOpen(false);
      }
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [notifOpen]);
    const notifications = [{
      id: 1,
      type: "finding",
      icon: I.AlertTriangle,
      tone: "danger",
      title: "Yangi critical finding biriktirildi",
      body: "AUD-2026-014 · FW-CORE-01 da to'liq ruxsat aniqlandi",
      time: "5 daq oldin",
      unread: true
    }, {
      id: 2,
      type: "task",
      icon: I.CheckSquare,
      tone: "info",
      title: "Vazifa muddati yaqinlashmoqda",
      body: "T-218 — Firewall qoidalarini tahlil qilish · 2 kun qoldi",
      time: "1 soat oldin",
      unread: true
    }, {
      id: 3,
      type: "approval",
      icon: I.UserCheck,
      tone: "success",
      title: "Audit loyihasi tasdiqlandi",
      body: "AUD-2026-013 — Soliq qo'mitasi DBMS auditi",
      time: "3 soat oldin",
      unread: true
    }, {
      id: 4,
      type: "sync",
      icon: I.Refresh,
      tone: "neutral",
      title: "EXE agent sinxronlandi",
      body: "AUD-2026-014 · 6 ta yangi log, 2 ta finding qoralama",
      time: "Bugun, 09:42",
      unread: false
    }, {
      id: 5,
      type: "report",
      icon: I.FileText,
      tone: "neutral",
      title: "Hisobot tayyor",
      body: "AUD-2026-012 — yakuniy hisobot DOCX + PDF",
      time: "Kecha",
      unread: false
    }];
    const unreadCount = notifications.filter(n => n.unread).length;
    return h("header", {
      className: "shell-top"
    }, [h("div", {
      key: "brand",
      className: "shell-top__brand"
    }, [h("div", {
      key: "m",
      className: "brand-mark"
    }, h(I.ShieldCheck, {
      key: "i-shieldcheck",
      size: 18
    })), h("div", {
      key: "t",
      className: "brand-text-wrap"
    }, [h("span", {
      key: "1",
      className: "brand-title"
    }, "Auditor"), h("span", {
      key: "2",
      className: "brand-sub"
    }, "Audit boshqaruvi")])]), h("button", {
      key: "tog",
      className: "iconbtn",
      onClick: () => setCollapsed(!collapsed),
      title: "Menyu"
    }, h(I.Menu, {
      key: "i-menu",
      size: 18
    })), h("div", {
      key: "s",
      className: "shell-top__search"
    }, [h(I.Search, {
      key: "i",
      className: "icon-search",
      size: 16
    }), h("input", {
      key: "in",
      type: "text",
      placeholder: "Audit, finding, foydalanuvchi yoki tashkilot bo‘yicha izlash..."
    }), h("span", {
      key: "k",
      className: "kbd-hint"
    }, "⌘K")]), h("div", {
      key: "a",
      className: "shell-top__actions"
    }, [h("button", {
      key: "th",
      className: "iconbtn",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
      title: "Mavzu"
    }, theme === "dark" ? h(I.Sun, {
      key: "i-sun",
      size: 18
    }) : h(I.Moon, {
      key: "i-moon",
      size: 18
    })), h("div", {
      key: "be",
      className: "notif-menu",
      ref: notifRef
    }, [h("button", {
      key: "btn",
      className: "iconbtn" + (notifOpen ? " is-active" : ""),
      title: "Bildirishnomalar",
      onClick: () => setNotifOpen(o => !o),
      "aria-haspopup": "menu",
      "aria-expanded": notifOpen ? "true" : "false"
    }, [h(I.Bell, {
      size: 18,
      key: "i"
    }), unreadCount > 0 ? h("span", {
      className: "dot",
      key: "d"
    }) : null]), notifOpen ? h("div", {
      key: "pop",
      className: "notif-menu__pop",
      role: "menu"
    }, [h("div", {
      key: "head",
      className: "notif-menu__head"
    }, [h("div", {
      key: "t",
      className: "notif-menu__title"
    }, [h("span", {
      key: 1
    }, "Bildirishnomalar"), unreadCount > 0 ? h("span", {
      key: 2,
      className: "notif-menu__badge"
    }, unreadCount + " yangi") : null]), h("button", {
      key: "a",
      className: "notif-menu__mark",
      onClick: () => setNotifOpen(false)
    }, "Hammasini o'qildi")]), h("div", {
      key: "list",
      className: "notif-menu__list"
    }, notifications.map(n => h("button", {
      key: n.id,
      className: "notif-item" + (n.unread ? " is-unread" : ""),
      role: "menuitem",
      onClick: () => setNotifOpen(false)
    }, [h("span", {
      key: "ic",
      className: "notif-item__icon notif-item__icon--" + n.tone
    }, h(n.icon, {
      size: 14
    })), h("div", {
      key: "tx",
      className: "notif-item__body"
    }, [h("div", {
      key: 1,
      className: "notif-item__title"
    }, n.title), h("div", {
      key: 2,
      className: "notif-item__sub"
    }, n.body), h("div", {
      key: 3,
      className: "notif-item__time"
    }, n.time)]), n.unread ? h("span", {
      key: "ud",
      className: "notif-item__dot"
    }) : null]))), h("div", {
      key: "foot",
      className: "notif-menu__foot"
    }, h("button", {
      className: "notif-menu__all",
      onClick: () => setNotifOpen(false)
    }, [h("span", {
      key: 1
    }, "Barcha bildirishnomalar"), h(I.ChevronRight, {
      key: 2,
      size: 13
    })]))]) : null]), h("button", {
      key: "ai",
      className: "iconbtn",
      onClick: () => setRoute("ai"),
      title: "AI yordamchi"
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 18
    })), h("div", {
      key: "div",
      className: "divider-v",
      style: {
        height: 24,
        margin: "0 4px"
      }
    }), h("div", {
      key: "u",
      className: "user-menu",
      ref: menuRef
    }, [h("button", {
      key: "btn",
      className: "user-pill" + (menuOpen ? " is-open" : ""),
      title: user.name,
      onClick: () => setMenuOpen(o => !o),
      "aria-haspopup": "menu",
      "aria-expanded": menuOpen ? "true" : "false"
    }, [h(Avatar, {
      key: "av",
      user
    }), h("div", {
      key: "tx",
      className: "user-pill__text"
    }, [h("span", {
      key: 1,
      className: "user-pill__name"
    }, user.name), h("span", {
      key: 2,
      className: "user-pill__role"
    }, user.title)]), h(I.ChevronDown, {
      key: "c",
      size: 14,
      className: "user-pill__chev",
      style: {
        color: "var(--text-tertiary)"
      }
    })]), menuOpen ? h("div", {
      key: "menu",
      className: "user-menu__pop",
      role: "menu"
    }, [h("div", {
      key: "head",
      className: "user-menu__head"
    }, [h(Avatar, {
      key: "av",
      user,
      size: "lg"
    }), h("div", {
      key: "tx",
      className: "user-menu__head-text"
    }, [h("div", {
      key: 1,
      className: "user-menu__name"
    }, user.name), h("div", {
      key: 2,
      className: "user-menu__sub"
    }, user.title), h("div", {
      key: 3,
      className: "user-menu__sub user-menu__sub--muted"
    }, user.dept)])]), h("div", {
      key: "g1",
      className: "user-menu__group"
    }, [h("button", {
      key: 1,
      className: "user-menu__item",
      role: "menuitem",
      onClick: () => {
        setRoute && setRoute("profile");
        setMenuOpen(false);
      }
    }, [h(I.User, {
      key: "i",
      size: 16
    }), h("span", {
      key: "l"
    }, "Mening profilim")]), h("button", {
      key: 2,
      className: "user-menu__item",
      role: "menuitem",
      onClick: () => {
        setRoute && setRoute("tasks");
        setMenuOpen(false);
      }
    }, [h(I.CheckSquare, {
      key: "i",
      size: 16
    }), h("span", {
      key: "l"
    }, "Mening vazifalarim"), h("span", {
      key: "c",
      className: "count"
    }, "7")]), h("button", {
      key: 3,
      className: "user-menu__item",
      role: "menuitem",
      onClick: () => {
        setRoute && setRoute("profile");
        setMenuOpen(false);
      }
    }, [h(I.Settings, {
      key: "i",
      size: 16
    }), h("span", {
      key: "l"
    }, "Sozlamalar")])]), h("div", {
      key: "sep1",
      className: "user-menu__sep"
    }), h("div", {
      key: "g2",
      className: "user-menu__group"
    }, [h("div", {
      key: "lbl",
      className: "user-menu__label"
    }, "Rolni almashtirish (demo)"), ...window.AppData.ROLES.map(r => h("button", {
      key: r.id,
      className: "user-menu__item user-menu__item--role" + (r.id === role ? " is-active" : ""),
      role: "menuitemradio",
      "aria-checked": r.id === role ? "true" : "false",
      onClick: () => {
        setRole && setRole(r.id);
        setMenuOpen(false);
      }
    }, [h(I.UserCheck, {
      key: "i",
      size: 16
    }), h("span", {
      key: "l"
    }, r.name), r.id === role ? h(I.Check, {
      key: "c",
      size: 14,
      className: "user-menu__check"
    }) : null]))]), h("div", {
      key: "sep2",
      className: "user-menu__sep"
    }), h("div", {
      key: "g3",
      className: "user-menu__group"
    }, [h("button", {
      key: 1,
      className: "user-menu__item user-menu__item--danger",
      role: "menuitem",
      onClick: () => {
        setMenuOpen(false);
        onLogout && onLogout();
      }
    }, [h(I.LogOut, {
      key: "i",
      size: 16
    }), h("span", {
      key: "l"
    }, "Tizimdan chiqish")])])]) : null])])]);
  }
  window.Topbar = Topbar;

  // ---------- Profile drawer ----------
  function ProfileDrawer({
    user,
    role,
    onClose,
    setRoute
  }) {
    if (!user) return null;
    const D = window.AppData;
    const myAudits = D.AUDITS.filter(a => a.members && a.members.includes(user.id));
    const myTasks = D.TASKS.filter(t => t.assignee === user.id);
    const openTasks = myTasks.filter(t => t.status !== "done").length;
    const doneTasks = myTasks.filter(t => t.status === "done").length;
    const kpi = D.KPI_USERS.find(k => k.user === user.id);
    const roleObj = D.ROLES.find(r => r.id === role);
    const initials = user.avatar;
    const recent = [{
      i: I.CheckSquare,
      tone: "success",
      t: "Vazifa bajarildi",
      s: "T-116 — Nessus skaner natijalarini import qildingiz",
      time: "2 soat oldin"
    }, {
      i: I.AlertTriangle,
      tone: "danger",
      t: "Critical finding qo'shildi",
      s: "AUD-2026-014 · FW-CORE-01",
      time: "Bugun, 09:18"
    }, {
      i: I.FileText,
      tone: "info",
      t: "Hisobot qoralamasini saqladingiz",
      s: "AUD-2026-013 yakuniy hisobot",
      time: "Kecha"
    }, {
      i: I.UserCheck,
      tone: "neutral",
      t: "Audit guruhiga qo'shildingiz",
      s: "AUD-2026-014 — Aloqa vazirligi",
      time: "3 kun oldin"
    }];
    return h(Drawer, {
      open: true,
      onClose,
      wide: true,
      title: h("span", {
        className: "panel__t"
      }, [h(I.User, {
        key: "i",
        size: 15
      }), h("span", {
        key: "t"
      }, "Mening profilim")]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: onClose
      }, "Yopish"), h("button", {
        key: 2,
        className: "btn btn--soft btn--sm",
        onClick: () => {
          onClose();
          window.showToast("Sozlamalar oynasi ochilmoqda...", "info");
        }
      }, [h(I.Settings, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Sozlamalar")]), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: () => {
          onClose();
          window.showToast("Profilni tahrirlash uchun Sozlamalar tabini oching", "info");
        }
      }, [h(I.Edit3, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Profilni tahrirlash")])]
    }, [
    // Header card
    h("div", {
      key: "head",
      className: "profile-head"
    }, [h("div", {
      key: "av",
      className: "avatar avatar--xl"
    }, initials), h("div", {
      key: "info",
      className: "profile-head__info"
    }, [h("div", {
      key: 1,
      className: "profile-head__name"
    }, user.name), h("div", {
      key: 2,
      className: "profile-head__title"
    }, user.title), h("div", {
      key: 3,
      className: "profile-head__meta"
    }, [h("span", {
      key: 1,
      className: "tag tag--brand"
    }, [h(I.UserCheck, {
      key: "i",
      size: 11
    }), h("span", {
      key: "t"
    }, roleObj ? roleObj.short : role)]), h("span", {
      key: 2,
      className: "profile-head__dept"
    }, [h(I.Building2, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, user.dept)])])])]),
    // Contact
    h("div", {
      key: "contact",
      className: "profile-contact"
    }, [h("div", {
      key: 1,
      className: "profile-contact__row"
    }, [h(I.Mail, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, user.name.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".") + "@gov.uz")]), h("div", {
      key: 2,
      className: "profile-contact__row"
    }, [h(I.Building, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Toshkent · Markaziy apparat, 4-bino")]), h("div", {
      key: 3,
      className: "profile-contact__row"
    }, [h(I.History, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Oxirgi faol: 4 daqiqa oldin")])]),
    // Stats
    h("div", {
      key: "stats",
      className: "profile-stats"
    }, [h("div", {
      key: 1,
      className: "profile-stat"
    }, [h("span", {
      key: "l",
      className: "profile-stat__label"
    }, "Faol auditlar"), h("span", {
      key: "v",
      className: "profile-stat__value tabular"
    }, myAudits.length)]), h("div", {
      key: 2,
      className: "profile-stat"
    }, [h("span", {
      key: "l",
      className: "profile-stat__label"
    }, "Ochiq vazifalar"), h("span", {
      key: "v",
      className: "profile-stat__value tabular"
    }, openTasks)]), h("div", {
      key: 3,
      className: "profile-stat"
    }, [h("span", {
      key: "l",
      className: "profile-stat__label"
    }, "Bajarilgan"), h("span", {
      key: "v",
      className: "profile-stat__value tabular"
    }, doneTasks)]), h("div", {
      key: 4,
      className: "profile-stat"
    }, [h("span", {
      key: "l",
      className: "profile-stat__label"
    }, "KPI ball"), h("span", {
      key: "v",
      className: "profile-stat__value tabular"
    }, kpi ? kpi.total : "—"), kpi ? h("span", {
      key: "d",
      className: "profile-stat__delta" + (kpi.delta < 0 ? " is-neg" : "")
    }, [kpi.delta < 0 ? h(I.TrendingDown, {
      key: "i",
      size: 11
    }) : h(I.TrendingUp, {
      key: "i",
      size: 11
    }), h("span", {
      key: "t"
    }, (kpi.delta > 0 ? "+" : "") + kpi.delta)]) : null])]),
    // My audits
    myAudits.length > 0 ? h("div", {
      key: "audits",
      className: "profile-section"
    }, [h("div", {
      key: "h",
      className: "profile-section__head"
    }, [h("span", {
      key: 1,
      className: "profile-section__title"
    }, "Mening auditlarim"), h("button", {
      key: 2,
      className: "profile-section__more",
      onClick: () => {
        setRoute && setRoute("audits");
        onClose();
      }
    }, [h("span", {
      key: 1
    }, "Hammasi"), h(I.ChevronRight, {
      key: 2,
      size: 12
    })])]), h("div", {
      key: "l",
      className: "profile-list"
    }, myAudits.slice(0, 3).map(a => h("div", {
      key: a.id,
      className: "profile-list__row"
    }, [h("div", {
      key: 1,
      className: "profile-list__main"
    }, [h("span", {
      key: 1,
      className: "font-mono profile-list__id"
    }, a.code), h("span", {
      key: 2,
      className: "profile-list__title"
    }, a.title)]), h("div", {
      key: 2,
      className: "profile-list__meta"
    }, [statusTag(a.status), h("span", {
      key: 2,
      className: "profile-list__progress"
    }, a.progress + "%")])])))]) : null,
    // Active tasks
    openTasks > 0 ? h("div", {
      key: "tasks",
      className: "profile-section"
    }, [h("div", {
      key: "h",
      className: "profile-section__head"
    }, [h("span", {
      key: 1,
      className: "profile-section__title"
    }, "Faol vazifalar"), h("button", {
      key: 2,
      className: "profile-section__more",
      onClick: () => {
        setRoute && setRoute("tasks");
        onClose();
      }
    }, [h("span", {
      key: 1
    }, "Hammasi"), h(I.ChevronRight, {
      key: 2,
      size: 12
    })])]), h("div", {
      key: "l",
      className: "profile-list"
    }, myTasks.filter(t => t.status !== "done").slice(0, 4).map(t => h("div", {
      key: t.id,
      className: "profile-list__row"
    }, [h("div", {
      key: 1,
      className: "profile-list__main"
    }, [h("span", {
      key: 1,
      className: "font-mono profile-list__id"
    }, t.id), h("span", {
      key: 2,
      className: "profile-list__title"
    }, t.title)]), h("div", {
      key: 2,
      className: "profile-list__meta"
    }, [h("span", {
      key: 1,
      className: "tag tag--outline",
      style: {
        fontSize: 10
      }
    }, t.priority), h("span", {
      key: 2,
      className: "profile-list__due"
    }, t.due)])])))]) : null,
    // Recent activity
    h("div", {
      key: "act",
      className: "profile-section"
    }, [h("div", {
      key: "h",
      className: "profile-section__head"
    }, [h("span", {
      key: 1,
      className: "profile-section__title"
    }, "So'nggi faoliyat")]), h("div", {
      key: "l",
      className: "profile-activity"
    }, recent.map((r, i) => h("div", {
      key: i,
      className: "profile-activity__row"
    }, [h("span", {
      key: 1,
      className: "profile-activity__icon notif-item__icon--" + r.tone
    }, h(r.i, {
      size: 13
    })), h("div", {
      key: 2,
      className: "profile-activity__body"
    }, [h("div", {
      key: 1,
      className: "profile-activity__title"
    }, r.t), h("div", {
      key: 2,
      className: "profile-activity__sub"
    }, r.s)]), h("span", {
      key: 3,
      className: "profile-activity__time"
    }, r.time)])))])]);
  }
  window.ProfileDrawer = ProfileDrawer;

  // ---------- Filter button + popover ----------
  // Reusable filter dropdown — pass `kind` to get sensible defaults:
  //   "audits"   → Status + sana oralig'i + tashkilot
  //   "findings" → Severity + Status + AI bor/yo'q
  //   "tasks"    → Status + Ustuvorlik + Mas'ul
  function FilterButton({
    kind = "audits",
    size = "sm",
    align = "right"
  }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState({}); // { key: Set<string> }
    const ref = useRef(null);
    useEffect(() => {
      if (!open) return;
      function onDoc(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      function onKey(e) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDoc);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);
    const PRESETS = {
      audits: [{
        key: "status",
        label: "Holat",
        options: [{
          value: "in_progress",
          label: "Jarayonda"
        }, {
          value: "review",
          label: "Tekshiruvda"
        }, {
          value: "returned",
          label: "Qaytarilgan"
        }, {
          value: "planning",
          label: "Rejalashtirilmoqda"
        }, {
          value: "approved",
          label: "Tasdiqlangan"
        }, {
          value: "completed",
          label: "Yakunlangan"
        }]
      }, {
        key: "type",
        label: "Audit turi",
        options: [{
          value: "kompleks",
          label: "Kompleks audit"
        }, {
          value: "texnik",
          label: "Texnik audit"
        }, {
          value: "pentest",
          label: "Penetration test"
        }, {
          value: "web",
          label: "Web audit"
        }, {
          value: "maxsus",
          label: "Maxsus audit"
        }]
      }, {
        key: "period",
        label: "Davr",
        kindType: "radio",
        options: [{
          value: "7d",
          label: "Oxirgi 7 kun"
        }, {
          value: "30d",
          label: "Oxirgi 30 kun"
        }, {
          value: "90d",
          label: "Oxirgi 90 kun"
        }, {
          value: "y",
          label: "Joriy yil"
        }, {
          value: "all",
          label: "Hammasi",
          default: true
        }]
      }],
      findings: [{
        key: "severity",
        label: "Xavf darajasi",
        options: [{
          value: "critical",
          label: "Critical"
        }, {
          value: "high",
          label: "High"
        }, {
          value: "medium",
          label: "Medium"
        }, {
          value: "low",
          label: "Low"
        }, {
          value: "info",
          label: "Info"
        }]
      }, {
        key: "status",
        label: "Holat",
        options: [{
          value: "open",
          label: "Ochiq"
        }, {
          value: "review",
          label: "Tekshiruvda"
        }, {
          value: "fixed",
          label: "Bartaraf etilgan"
        }, {
          value: "verified",
          label: "Tasdiqlangan"
        }]
      }, {
        key: "extra",
        label: "Qo'shimcha",
        options: [{
          value: "ai",
          label: "AI tavsiyali"
        }, {
          value: "no_owner",
          label: "Mas'ulsiz"
        }, {
          value: "with_cve",
          label: "CVE bog'langan"
        }]
      }],
      tasks: [{
        key: "status",
        label: "Holat",
        options: [{
          value: "new",
          label: "Yangi"
        }, {
          value: "in_progress",
          label: "Jarayonda"
        }, {
          value: "review",
          label: "Tekshiruvda"
        }, {
          value: "blocked",
          label: "Blok"
        }, {
          value: "done",
          label: "Bajarilgan"
        }]
      }, {
        key: "priority",
        label: "Ustuvorlik",
        options: [{
          value: "high",
          label: "Yuqori"
        }, {
          value: "medium",
          label: "O'rta"
        }, {
          value: "low",
          label: "Past"
        }]
      }, {
        key: "scope",
        label: "Doira",
        kindType: "radio",
        options: [{
          value: "mine",
          label: "Faqat meniki",
          default: true
        }, {
          value: "team",
          label: "Mening jamoam"
        }, {
          value: "all",
          label: "Hamma vazifalar"
        }]
      }],
      users: [{
        key: "role",
        label: "Rol",
        options: [{
          value: "departament",
          label: "Departament rahbari"
        }, {
          value: "bolim",
          label: "Bo'lim boshlig'i"
        }, {
          value: "bosh",
          label: "Bosh mutaxassis"
        }, {
          value: "yetakchi",
          label: "Yetakchi mutaxassis"
        }, {
          value: "toifa1",
          label: "1-toifa mutaxassis"
        }]
      }, {
        key: "status",
        label: "Hisob holati",
        options: [{
          value: "active",
          label: "Aktiv"
        }, {
          value: "inactive",
          label: "Nofaol"
        }, {
          value: "locked",
          label: "Bloklangan"
        }]
      }],
      logs: [{
        key: "action",
        label: "Action",
        options: [{
          value: "login",
          label: "Login"
        }, {
          value: "create",
          label: "Yaratish"
        }, {
          value: "update",
          label: "O'zgartirish"
        }, {
          value: "delete",
          label: "O'chirish"
        }, {
          value: "export",
          label: "Eksport"
        }, {
          value: "token",
          label: "Token operatsiyalari"
        }]
      }, {
        key: "severity",
        label: "Daraja",
        options: [{
          value: "info",
          label: "Info"
        }, {
          value: "warning",
          label: "Warning"
        }, {
          value: "error",
          label: "Error"
        }]
      }, {
        key: "period",
        label: "Davr",
        kindType: "radio",
        options: [{
          value: "1h",
          label: "Oxirgi 1 soat"
        }, {
          value: "24h",
          label: "Oxirgi 24 soat",
          default: true
        }, {
          value: "7d",
          label: "Oxirgi 7 kun"
        }, {
          value: "30d",
          label: "Oxirgi 30 kun"
        }, {
          value: "all",
          label: "Hammasi"
        }]
      }],
      reports: [{
        key: "type",
        label: "Hisobot turi",
        options: [{
          value: "final",
          label: "Yakuniy hisobot"
        }, {
          value: "exec",
          label: "Executive summary"
        }, {
          value: "remed",
          label: "Remediation plan"
        }, {
          value: "pentest",
          label: "Penetration test"
        }, {
          value: "kpi",
          label: "KPI hisoboti"
        }]
      }, {
        key: "format",
        label: "Format",
        options: [{
          value: "docx",
          label: "DOCX"
        }, {
          value: "pdf",
          label: "PDF"
        }, {
          value: "xlsx",
          label: "XLSX"
        }, {
          value: "html",
          label: "HTML"
        }]
      }, {
        key: "status",
        label: "Holat",
        options: [{
          value: "draft",
          label: "Qoralama"
        }, {
          value: "ready",
          label: "Tayyor"
        }, {
          value: "sent",
          label: "Yuborilgan"
        }]
      }]
    };
    const sections = PRESETS[kind] || PRESETS.audits;
    function toggle(secKey, val, isRadio) {
      setActive(a => {
        const next = {
          ...a
        };
        if (isRadio) {
          next[secKey] = new Set([val]);
        } else {
          const set = new Set(next[secKey] || []);
          if (set.has(val)) set.delete(val);else set.add(val);
          next[secKey] = set;
        }
        return next;
      });
    }
    const totalActive = Object.values(active).reduce((n, s) => n + (s ? s.size : 0), 0);
    return h("div", {
      className: "filter-btn",
      ref
    }, [h("button", {
      key: "b",
      className: "btn btn--ghost btn--" + size + (open ? " is-active" : ""),
      onClick: () => setOpen(o => !o)
    }, [h(I.Filter, {
      key: "i",
      size: size === "xs" ? 12 : 14
    }), h("span", {
      key: "t"
    }, "Filtr"), totalActive > 0 ? h("span", {
      key: "c",
      className: "filter-btn__count"
    }, totalActive) : null]), open ? h("div", {
      key: "p",
      className: "filter-pop filter-pop--" + align
    }, [h("div", {
      key: "h",
      className: "filter-pop__head"
    }, [h("span", {
      key: 1,
      className: "filter-pop__title"
    }, "Filtr"), totalActive > 0 ? h("button", {
      key: 2,
      className: "filter-pop__clear",
      onClick: () => setActive({})
    }, "Tozalash") : null]), h("div", {
      key: "body",
      className: "filter-pop__body"
    }, sections.map(sec => h("div", {
      key: sec.key,
      className: "filter-sec"
    }, [h("div", {
      key: "l",
      className: "filter-sec__label"
    }, sec.label), h("div", {
      key: "o",
      className: "filter-sec__opts"
    }, sec.options.map(opt => {
      const isRadio = sec.kindType === "radio";
      const set = active[sec.key];
      let checked;
      if (isRadio) {
        checked = set ? set.has(opt.value) : !!opt.default;
      } else {
        checked = set ? set.has(opt.value) : false;
      }
      return h("label", {
        key: opt.value,
        className: "filter-chip" + (checked ? " is-on" : "")
      }, [h("input", {
        key: "i",
        type: isRadio ? "radio" : "checkbox",
        name: isRadio ? "fr-" + sec.key : undefined,
        checked,
        onChange: () => toggle(sec.key, opt.value, isRadio)
      }), h("span", {
        key: "l"
      }, opt.label)]);
    }))]))), h("div", {
      key: "f",
      className: "filter-pop__foot"
    }, [h("button", {
      key: 1,
      className: "btn btn--ghost btn--xs",
      onClick: () => setActive({})
    }, "Bekor"), h("button", {
      key: 2,
      className: "btn btn--primary btn--xs",
      onClick: () => setOpen(false)
    }, [h(I.Check, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Qo'llash" + (totalActive > 0 ? " (" + totalActive + ")" : ""))])])]) : null]);
  }
  window.FilterButton = FilterButton;

  // ---------- Toast system ----------
  // Usage: window.showToast("message", "success" | "info" | "warning" | "danger")
  let toastContainer = null;
  let toastSeq = 0;
  function ensureToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-host";
    document.body.appendChild(toastContainer);
    return toastContainer;
  }
  window.showToast = function (message, tone = "info", opts = {}) {
    const host = ensureToastContainer();
    const id = ++toastSeq;
    const el = document.createElement("div");
    el.className = "toast toast--" + tone;
    el.dataset.toastId = id;
    const iconKey = tone === "success" ? "Check" : tone === "warning" ? "AlertTriangle" : tone === "danger" ? "X" : "Info";
    const path = window.Icons && window.Icons[iconKey] ? null : null; // we'll just inline svg below
    el.innerHTML = `
      <span class="toast__ic toast__ic--${tone}">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          ${tone === "success" ? '<path d="M20 6 9 17l-5-5"/>' : tone === "warning" ? '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>' : tone === "danger" ? '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' : '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'}
        </svg>
      </span>
      <span class="toast__msg"></span>
      <button class="toast__close" aria-label="Yopish">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    `;
    el.querySelector(".toast__msg").textContent = message;
    function dismiss() {
      el.classList.add("toast--out");
      setTimeout(() => el.remove(), 200);
    }
    el.querySelector(".toast__close").addEventListener("click", dismiss);
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast--in"));
    const duration = opts.duration || 3200;
    setTimeout(dismiss, duration);
    return id;
  };

  // ---------- MoreMenu (for "..." row actions) ----------
  // items: [{ label, icon?, onClick, danger? }] — separators with { sep: true }
  function MoreMenu({
    items = [],
    align = "right",
    size = "xs"
  }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      if (!open) return;
      function onDoc(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      function onKey(e) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDoc);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);
    return h("div", {
      className: "more-menu",
      ref
    }, [h("button", {
      key: "b",
      className: "btn btn--ghost btn--" + size + " btn--icon" + (open ? " is-active" : ""),
      onClick: e => {
        e.stopPropagation();
        setOpen(o => !o);
      },
      title: "Boshqa amallar"
    }, h(I.MoreHorizontal, {
      size: 13
    })), open ? h("div", {
      key: "p",
      className: "more-menu__pop more-menu__pop--" + align,
      onClick: e => e.stopPropagation()
    }, items.map((it, i) => {
      if (it.sep) return h("div", {
        key: "s" + i,
        className: "more-menu__sep"
      });
      return h("button", {
        key: i,
        className: "more-menu__item" + (it.danger ? " is-danger" : ""),
        onClick: e => {
          e.stopPropagation();
          setOpen(false);
          it.onClick && it.onClick();
        }
      }, [it.icon ? h(it.icon, {
        key: "i",
        size: 14
      }) : null, h("span", {
        key: "l"
      }, it.label)]);
    })) : null]);
  }
  window.MoreMenu = MoreMenu;

  // ---------- Confirm dialog ----------
  // Lightweight imperative confirm — returns Promise<boolean>
  window.confirmAction = function ({
    title,
    body,
    confirmLabel = "Tasdiqlash",
    cancelLabel = "Bekor",
    danger = false
  }) {
    return new Promise(resolve => {
      const bg = document.createElement("div");
      bg.className = "modal-bg";
      bg.innerHTML = `
        <div class="modal" style="max-width:420px;">
          <div class="modal__h">
            <div class="modal__t" style="display:flex; align-items:center; gap:10px;">
              <span class="confirm-ic ${danger ? 'confirm-ic--danger' : ''}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${danger ? '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>' : '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'}
                </svg>
              </span>
              <span></span>
            </div>
          </div>
          <div class="modal__body" style="font-size:13.5px; color:var(--text-secondary); line-height:1.5;"></div>
          <div class="modal__foot" style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn btn--ghost btn--sm" data-act="cancel"></button>
            <button class="btn btn--sm ${danger ? '' : 'btn--primary'}" data-act="ok" style="${danger ? 'background:var(--status-danger-fg); color:#fff; border-color:var(--status-danger-fg);' : ''}"></button>
          </div>
        </div>
      `;
      bg.querySelector(".modal__t > span:last-child").textContent = title;
      bg.querySelector(".modal__body").textContent = body || "";
      bg.querySelector('[data-act="cancel"]').textContent = cancelLabel;
      bg.querySelector('[data-act="ok"]').textContent = confirmLabel;
      function close(result) {
        bg.remove();
        document.removeEventListener("keydown", onKey);
        resolve(result);
      }
      function onKey(e) {
        if (e.key === "Escape") close(false);
        if (e.key === "Enter") close(true);
      }
      bg.addEventListener("click", e => {
        if (e.target === bg) close(false);
      });
      bg.querySelector('[data-act="cancel"]').addEventListener("click", () => close(false));
      bg.querySelector('[data-act="ok"]').addEventListener("click", () => close(true));
      document.addEventListener("keydown", onKey);
      document.body.appendChild(bg);
    });
  };

  // ---------- Page header ----------
  function PageHeader({
    crumbs,
    title,
    sub,
    actions
  }) {
    return h("div", {
      className: "pageh"
    }, [h("div", {
      key: "t",
      className: "pageh__title"
    }, [crumbs ? h("div", {
      key: "c",
      className: "pageh__crumbs"
    }, crumbs.flatMap((c, i) => [i > 0 ? h(I.ChevronRight, {
      key: "s" + i,
      size: 12
    }) : null, c.href ? h("a", {
      key: "l" + i,
      href: "#",
      onClick: e => {
        e.preventDefault();
        c.onClick && c.onClick();
      }
    }, c.label) : h("span", {
      key: "l" + i
    }, c.label)])) : null, h("h1", {
      key: "h"
    }, title), sub ? h("p", {
      key: "s",
      className: "pageh__sub"
    }, sub) : null]), actions ? h("div", {
      key: "a",
      className: "pageh__actions"
    }, actions) : null]);
  }
  window.PageHeader = PageHeader;

  // ---------- Tabs ----------
  function Tabs({
    active,
    onChange,
    tabs
  }) {
    return h("div", {
      className: "tabs"
    }, tabs.map(t => h("button", {
      key: t.id,
      className: "tabs__btn" + (active === t.id ? " is-active" : ""),
      onClick: () => onChange(t.id)
    }, [t.icon ? h(t.icon, {
      key: "i",
      size: 15
    }) : null, h("span", {
      key: "l"
    }, t.label), t.count != null ? h("span", {
      key: "c",
      className: "count"
    }, t.count) : null])));
  }
  window.Tabs = Tabs;

  // ---------- Modal ----------
  function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    wide,
    xl
  }) {
    if (!open) return null;
    const cls = ["modal"];
    if (wide) cls.push("modal--wide");
    if (xl) cls.push("modal--xl");
    return h("div", {
      className: "modal-bg",
      onClick: onClose
    }, [h("div", {
      key: "m",
      className: cls.join(" "),
      onClick: e => e.stopPropagation()
    }, [h("div", {
      key: "h",
      className: "modal__h"
    }, [h("div", {
      key: "t",
      className: "modal__t"
    }, title), h("button", {
      key: "c",
      className: "iconbtn",
      onClick: onClose
    }, h(I.X, {
      key: "i-x",
      size: 16
    }))]), h("div", {
      key: "b",
      className: "modal__body"
    }, children), footer ? h("div", {
      key: "f",
      className: "modal__foot"
    }, footer) : null])]);
  }
  window.Modal = Modal;

  // ---------- Drawer (right-side) ----------
  function Drawer({
    open,
    onClose,
    title,
    children,
    footer,
    wide
  }) {
    if (!open) return null;
    return h("div", {
      className: "drawer-bg",
      onClick: onClose
    }, [h("div", {
      key: "d",
      className: "drawer" + (wide ? " drawer--wide" : ""),
      onClick: e => e.stopPropagation()
    }, [h("div", {
      key: "h",
      className: "drawer__h"
    }, [h("div", {
      key: "t",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, [typeof title === "string" ? h("span", {
      className: "panel__t",
      key: "t"
    }, title) : title]), h("button", {
      key: "c",
      className: "iconbtn",
      onClick: onClose
    }, h(I.X, {
      key: "i-x",
      size: 16
    }))]), h("div", {
      key: "b",
      className: "drawer__body"
    }, children), footer ? h("div", {
      key: "f",
      className: "drawer__foot"
    }, footer) : null])]);
  }
  window.Drawer = Drawer;

  // ---------- Stat tile ----------
  function Stat({
    icon,
    label,
    value,
    delta,
    deltaNeg,
    meta,
    spark,
    bar
  }) {
    return h("div", {
      className: "stat"
    }, [h("div", {
      key: "r",
      className: "stat__row"
    }, [h("span", {
      key: "l",
      className: "stat__label"
    }, label), icon ? h("span", {
      key: "i",
      className: "stat__icon"
    }, h(icon, {
      size: 15
    })) : null]), h("div", {
      key: "v",
      className: "stat__row"
    }, [h("span", {
      key: "x",
      className: "stat__value tabular"
    }, h(CountUp, {
      value
    })), spark ? h("span", {
      key: "s"
    }, h(Sparkline, {
      data: spark
    })) : null]), delta != null || meta ? h("div", {
      key: "m",
      className: "stat__row"
    }, [meta ? h("span", {
      className: "stat__meta",
      key: "m"
    }, meta) : h("span", {
      key: "p"
    }), delta != null ? h("span", {
      key: "d",
      className: "stat__delta" + (deltaNeg ? " stat__delta--neg" : "")
    }, [deltaNeg ? h(I.TrendingDown, {
      key: "i",
      size: 12
    }) : h(I.TrendingUp, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, (delta > 0 ? "+" : "") + delta + (typeof delta === "number" && Math.abs(delta) < 100 ? "%" : ""))]) : null]) : null, bar != null ? h("div", {
      key: "b",
      className: "stat__bar"
    }, h("span", {
      style: {
        width: bar + "%"
      }
    })) : null]);
  }
  window.Stat = Stat;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/data.js
try { (() => {
/* Mock data store for the Auditor prototype.
   Realistic enough for screenshots and basic interactions. */

window.AppData = function () {
  // ---------- Users ----------
  const USERS = [{
    id: "u1",
    name: "Akmal Yo'ldoshev",
    role: "departament",
    title: "Departament rahbari",
    avatar: "AY",
    dept: "Markaziy apparat"
  }, {
    id: "u2",
    name: "Dilshoda Rasulova",
    role: "bolim",
    title: "Bo‘lim boshlig‘i",
    avatar: "DR",
    dept: "Audit bo‘limi"
  }, {
    id: "u3",
    name: "Bobur Mirzayev",
    role: "bosh",
    title: "Bosh mutaxassis",
    avatar: "BM",
    dept: "Audit bo‘limi"
  }, {
    id: "u4",
    name: "Sevara Karimova",
    role: "yetakchi",
    title: "Yetakchi mutaxassis",
    avatar: "SK",
    dept: "Audit bo‘limi"
  }, {
    id: "u5",
    name: "Otabek Jo‘rayev",
    role: "yetakchi",
    title: "Yetakchi mutaxassis",
    avatar: "OJ",
    dept: "Audit bo‘limi"
  }, {
    id: "u6",
    name: "Madina Sodiqova",
    role: "toifa1",
    title: "Birinchi toifali mutaxassis",
    avatar: "MS",
    dept: "Audit bo‘limi"
  }, {
    id: "u7",
    name: "Jasur Tursunov",
    role: "toifa1",
    title: "Birinchi toifali mutaxassis",
    avatar: "JT",
    dept: "Audit bo‘limi"
  }, {
    id: "u8",
    name: "Nigora Ergasheva",
    role: "bosh",
    title: "Bosh mutaxassis",
    avatar: "NE",
    dept: "Audit bo‘limi"
  }, {
    id: "u9",
    name: "Sherzod Hamidov",
    role: "toifa1",
    title: "Birinchi toifali mutaxassis",
    avatar: "SH",
    dept: "Audit bo‘limi"
  }, {
    id: "u10",
    name: "Lola Aliyeva",
    role: "yetakchi",
    title: "Yetakchi mutaxassis",
    avatar: "LA",
    dept: "Audit bo‘limi"
  }];
  const ROLES = [{
    id: "departament",
    name: "Departament rahbari",
    short: "Departament",
    order: 1
  }, {
    id: "bolim",
    name: "Bo‘lim boshlig‘i",
    short: "Bo‘lim boshlig‘i",
    order: 2
  }, {
    id: "bosh",
    name: "Bosh mutaxassis",
    short: "Bosh m-s",
    order: 3
  }, {
    id: "yetakchi",
    name: "Yetakchi mutaxassis",
    short: "Yetakchi m-s",
    order: 4
  }, {
    id: "toifa1",
    name: "Birinchi toifali mutaxassis",
    short: "1-toifa m-s",
    order: 5
  }];

  // ---------- Organizations ----------
  const ORGS = [{
    id: "o1",
    name: "Aloqa va kommunikatsiya vazirligi",
    stir: "207100123",
    sector: "Davlat",
    audits: 6,
    contact: "info@aloqa.gov.uz"
  }, {
    id: "o2",
    name: "Soliq qo‘mitasi",
    stir: "201200456",
    sector: "Davlat",
    audits: 4,
    contact: "audit@soliq.uz"
  }, {
    id: "o3",
    name: "Markaziy bank",
    stir: "200100789",
    sector: "Davlat",
    audits: 3,
    contact: "ciso@cbu.uz"
  }, {
    id: "o4",
    name: "Davlat xizmatlari agentligi",
    stir: "207300111",
    sector: "Davlat",
    audits: 5,
    contact: "info@dxa.uz"
  }, {
    id: "o5",
    name: "Energiya vazirligi",
    stir: "207400222",
    sector: "Davlat",
    audits: 2,
    contact: "sec@energy.uz"
  }, {
    id: "o6",
    name: "Toshkent shahar hokimligi",
    stir: "207500333",
    sector: "Davlat",
    audits: 3,
    contact: "it@tashkent.uz"
  }];

  // ---------- Audits ----------
  const AUDITS = [{
    id: "AUD-2026-014",
    code: "AUD-2026-014",
    title: "Aloqa va kommunikatsiya vazirligi — yillik kompleks audit",
    org: "o1",
    type: "Kompleks audit",
    status: "in_progress",
    // ←  shown as 'Jarayonda'
    stage: 7,
    // current workflow stage (1..10)
    startDate: "2026-04-12",
    endDate: "2026-05-31",
    progress: 64,
    leader: "u3",
    members: ["u3", "u4", "u6", "u7"],
    findings: {
      critical: 4,
      high: 9,
      medium: 14,
      low: 7
    },
    tasks: {
      total: 38,
      done: 22,
      in_progress: 11,
      blocked: 2,
      new: 3
    },
    lastSync: "12 daqiqa oldin",
    pinned: true
  }, {
    id: "AUD-2026-013",
    code: "AUD-2026-013",
    title: "Soliq qo‘mitasi — DBMS va loyiha auditi",
    org: "o2",
    type: "Texnik audit",
    status: "review",
    stage: 9,
    startDate: "2026-03-22",
    endDate: "2026-05-18",
    progress: 88,
    leader: "u4",
    members: ["u4", "u3", "u9"],
    findings: {
      critical: 2,
      high: 5,
      medium: 8,
      low: 4
    },
    tasks: {
      total: 26,
      done: 24,
      in_progress: 1,
      blocked: 0,
      new: 1
    },
    lastSync: "2 soat oldin"
  }, {
    id: "AUD-2026-012",
    code: "AUD-2026-012",
    title: "Markaziy bank — mobil bank ilovasi penetration test",
    org: "o3",
    type: "Penetration test",
    status: "in_progress",
    stage: 7,
    startDate: "2026-05-01",
    endDate: "2026-06-12",
    progress: 42,
    leader: "u8",
    members: ["u8", "u5", "u6"],
    findings: {
      critical: 3,
      high: 7,
      medium: 11,
      low: 5
    },
    tasks: {
      total: 22,
      done: 9,
      in_progress: 8,
      blocked: 1,
      new: 4
    },
    lastSync: "31 daqiqa oldin"
  }, {
    id: "AUD-2026-011",
    code: "AUD-2026-011",
    title: "Davlat xizmatlari agentligi — pre-prod muhit auditi",
    org: "o4",
    type: "Kompleks audit",
    status: "approved",
    stage: 10,
    startDate: "2026-02-15",
    endDate: "2026-04-30",
    progress: 100,
    leader: "u3",
    members: ["u3", "u4", "u7", "u10"],
    findings: {
      critical: 1,
      high: 4,
      medium: 12,
      low: 9
    },
    tasks: {
      total: 31,
      done: 31,
      in_progress: 0,
      blocked: 0,
      new: 0
    },
    lastSync: "1 hafta oldin"
  }, {
    id: "AUD-2026-010",
    code: "AUD-2026-010",
    title: "Energiya vazirligi — OT/SCADA segmentatsiya auditi",
    org: "o5",
    type: "Maxsus audit",
    status: "planning",
    stage: 3,
    startDate: "2026-05-20",
    endDate: "2026-07-15",
    progress: 12,
    leader: "u10",
    members: ["u10", "u8", "u9"],
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    tasks: {
      total: 14,
      done: 1,
      in_progress: 0,
      blocked: 0,
      new: 13
    },
    lastSync: "—"
  }, {
    id: "AUD-2026-009",
    code: "AUD-2026-009",
    title: "Toshkent shahar hokimligi — public web portfolio auditi",
    org: "o6",
    type: "Web audit",
    status: "returned",
    stage: 9,
    startDate: "2026-03-01",
    endDate: "2026-04-15",
    progress: 76,
    leader: "u5",
    members: ["u5", "u6", "u9"],
    findings: {
      critical: 1,
      high: 3,
      medium: 6,
      low: 11
    },
    tasks: {
      total: 18,
      done: 13,
      in_progress: 4,
      blocked: 1,
      new: 0
    },
    lastSync: "3 kun oldin"
  }];
  const STATUS_LABELS = {
    planning: {
      label: "Rejalashtirilgan",
      tag: "tag--ghost",
      dot: "#94a3b8"
    },
    group_forming: {
      label: "Guruh shakllanmoqda",
      tag: "tag--ghost",
      dot: "#94a3b8"
    },
    project_draft: {
      label: "Loyiha ishlab chiqilmoqda",
      tag: "tag--info",
      dot: "#0ea5e9"
    },
    project_pending: {
      label: "Loyiha tasdiqlashda",
      tag: "tag--warning",
      dot: "#f59e0b"
    },
    assigning: {
      label: "Vazifalar taqsimlanmoqda",
      tag: "tag--info",
      dot: "#0ea5e9"
    },
    in_progress: {
      label: "Jarayonda",
      tag: "tag--info",
      dot: "#3b65f6"
    },
    review: {
      label: "Tekshiruvda",
      tag: "tag--warning",
      dot: "#f59e0b"
    },
    returned: {
      label: "Qaytarilgan",
      tag: "tag--danger",
      dot: "#ef4444"
    },
    approved: {
      label: "Tasdiqlangan",
      tag: "tag--success",
      dot: "#10b981"
    },
    completed: {
      label: "Yakunlangan",
      tag: "tag--success",
      dot: "#10b981"
    },
    cancelled: {
      label: "Bekor qilingan",
      tag: "tag--ghost",
      dot: "#64748b"
    }
  };
  const WORKFLOW = [{
    n: 1,
    key: "create",
    title: "Audit yaratish",
    who: "Bo‘lim boshlig‘i",
    short: "Tashkilot tanlandi, audit kartasi yaratildi."
  }, {
    n: 2,
    key: "group",
    title: "Audit guruhini shakllantirish",
    who: "Bo‘lim boshlig‘i",
    short: "Audit guruhi rahbari va auditorlar tanlandi."
  }, {
    n: 3,
    key: "project",
    title: "Audit loyihasini ishlab chiqish",
    who: "Guruh rahbari",
    short: "Maqsad, doira, bosqichlar, metodologiya tuzildi."
  }, {
    n: 4,
    key: "assign",
    title: "Vazifalarni taqsimlash",
    who: "Guruh rahbari",
    short: "38 ta vazifa 4 ta auditor o‘rtasida taqsimlandi."
  }, {
    n: 5,
    key: "approve",
    title: "Loyihani tasdiqlash",
    who: "Bo‘lim boshlig‘i",
    short: "Audit loyihasi tasdiqlandi."
  }, {
    n: 6,
    key: "token",
    title: "EXE agent va token",
    who: "Auditor",
    short: "4 ta audit token chiqarildi, qurilmalarga bog‘landi."
  }, {
    n: 7,
    key: "fieldwork",
    title: "Joyida audit",
    who: "Auditor",
    short: "22 vazifa bajarildi, 34 finding kiritildi.",
    current: true
  }, {
    n: 8,
    key: "sync",
    title: "Sinxronlash",
    who: "EXE agent",
    short: "Oxirgi sinxronlash 12 daqiqa oldin (success)."
  }, {
    n: 9,
    key: "review",
    title: "Ko‘rib chiqish",
    who: "Guruh rahbari",
    short: "Tasdiqlash va qaytarish hali yakunlanmagan."
  }, {
    n: 10,
    key: "report",
    title: "Tahlil va hisobot",
    who: "AI + Rahbar",
    short: "AI xulosa va yakuniy hisobot kutilmoqda."
  }];

  // ---------- Tasks ----------
  const TASKS = [{
    id: "T-114",
    auditId: "AUD-2026-014",
    title: "Firewall qoidalari va segmentatsiyani tahlil qilish",
    type: "Konfiguratsiya",
    priority: "Yuqori",
    status: "in_progress",
    due: "2026-05-22",
    assignee: "u6",
    findings: 3,
    files: 2,
    kpi: 5
  }, {
    id: "T-115",
    auditId: "AUD-2026-014",
    title: "Active Directory parol siyosatini tekshirish",
    type: "Tizim audit",
    priority: "Yuqori",
    status: "in_progress",
    due: "2026-05-23",
    assignee: "u7",
    findings: 2,
    files: 1,
    kpi: 5
  }, {
    id: "T-116",
    auditId: "AUD-2026-014",
    title: "Nessus skaner natijalarini import qilish",
    type: "Skaner",
    priority: "O‘rta",
    status: "done",
    due: "2026-05-18",
    assignee: "u4",
    findings: 8,
    files: 4,
    kpi: 10
  }, {
    id: "T-117",
    auditId: "AUD-2026-014",
    title: "PCAP fayli — DNS tunneling tahlili",
    type: "Trafik",
    priority: "Yuqori",
    status: "review",
    due: "2026-05-24",
    assignee: "u3",
    findings: 1,
    files: 1,
    kpi: 7
  }, {
    id: "T-118",
    auditId: "AUD-2026-014",
    title: "Wi-Fi controller konfiguratsiyasi auditi",
    type: "Konfiguratsiya",
    priority: "O‘rta",
    status: "new",
    due: "2026-05-26",
    assignee: "u6",
    findings: 0,
    files: 0,
    kpi: 0
  }, {
    id: "T-119",
    auditId: "AUD-2026-014",
    title: "OpenVAS — internal subnet skanerlash",
    type: "Skaner",
    priority: "Yuqori",
    status: "in_progress",
    due: "2026-05-25",
    assignee: "u4",
    findings: 5,
    files: 1,
    kpi: 5
  }, {
    id: "T-120",
    auditId: "AUD-2026-014",
    title: "Backup va DR rejasi suhbati",
    type: "Hujjat",
    priority: "O‘rta",
    status: "in_progress",
    due: "2026-05-27",
    assignee: "u3",
    findings: 0,
    files: 1,
    kpi: 0
  }, {
    id: "T-121",
    auditId: "AUD-2026-014",
    title: "VPN gateway konfiguratsiyasi",
    type: "Konfiguratsiya",
    priority: "Yuqori",
    status: "blocked",
    due: "2026-05-22",
    assignee: "u7",
    findings: 0,
    files: 0,
    kpi: 0
  }, {
    id: "T-122",
    auditId: "AUD-2026-014",
    title: "IDS/IPS log tahlili",
    type: "Log",
    priority: "O‘rta",
    status: "done",
    due: "2026-05-17",
    assignee: "u6",
    findings: 4,
    files: 1,
    kpi: 8
  }, {
    id: "T-123",
    auditId: "AUD-2026-014",
    title: "Web ilova OWASP ZAP skaneri",
    type: "Skaner",
    priority: "Yuqori",
    status: "review",
    due: "2026-05-24",
    assignee: "u4",
    findings: 6,
    files: 2,
    kpi: 5
  }, {
    id: "T-124",
    auditId: "AUD-2026-014",
    title: "Hisobot bo‘limini tayyorlash (Sec-overview)",
    type: "Hisobot",
    priority: "Past",
    status: "new",
    due: "2026-05-28",
    assignee: "u3",
    findings: 0,
    files: 0,
    kpi: 0
  }, {
    id: "T-125",
    auditId: "AUD-2026-014",
    title: "Switch ACL ro‘yxatini tekshirish",
    type: "Konfiguratsiya",
    priority: "Past",
    status: "in_progress",
    due: "2026-05-26",
    assignee: "u6",
    findings: 1,
    files: 1,
    kpi: 5
  }];
  const TASK_STATUS = {
    new: {
      label: "Yangi",
      color: "#94a3b8"
    },
    in_progress: {
      label: "Jarayonda",
      color: "#3b65f6"
    },
    review: {
      label: "Tekshiruvda",
      color: "#f59e0b"
    },
    returned: {
      label: "Qaytarilgan",
      color: "#ef4444"
    },
    done: {
      label: "Bajarilgan",
      color: "#10b981"
    },
    blocked: {
      label: "Blok",
      color: "#ef4444"
    }
  };

  // ---------- Findings ----------
  const FINDINGS = [{
    id: "F-2026-0341",
    auditId: "AUD-2026-014",
    taskId: "T-114",
    title: "Internal segment 10.0.0.0/8 ga to‘liq ruxsat berilgan",
    severity: "critical",
    cvss: 9.1,
    status: "approved",
    reportedBy: "u6",
    date: "2026-05-18",
    asset: "FW-CORE-01",
    type: "Konfiguratsiya kamchiligi",
    cwe: "CWE-284",
    description: "Asosiy firewall qoidalarida 10.0.0.0/8 manzilidan barcha portlarga TCP+UDP ruxsat berilgan. Bu segmentatsiya prinsiplariga zid keladi.",
    evidence: 3,
    ai: true
  }, {
    id: "F-2026-0342",
    auditId: "AUD-2026-014",
    taskId: "T-115",
    title: "AD parol siyosati — minimum 6 belgi, history off",
    severity: "high",
    cvss: 7.4,
    status: "review",
    reportedBy: "u7",
    date: "2026-05-19",
    asset: "DC-01.gov.uz",
    type: "Tizim sozlamasi",
    cwe: "CWE-521",
    description: "Domen parol siyosati — minimum uzunlik 6 belgi, parol tarixi yoqilmagan, lockout = 0 (cheklov yo‘q). Brute force xavfi yuqori.",
    evidence: 2,
    ai: true
  }, {
    id: "F-2026-0343",
    auditId: "AUD-2026-014",
    taskId: "T-116",
    title: "Apache 2.4.41 — CVE-2023-25690 (mod_proxy SSRF)",
    severity: "critical",
    cvss: 9.8,
    status: "approved",
    reportedBy: "u4",
    date: "2026-05-15",
    asset: "web-prod-03",
    type: "CVE / patch",
    cwe: "CWE-444",
    description: "Apache HTTP Server 2.4.41 versiyasida mod_proxy modulida HTTP request smuggling zaifligi mavjud. Patch chiqarilgan: 2.4.56.",
    evidence: 4,
    ai: true
  }, {
    id: "F-2026-0344",
    auditId: "AUD-2026-014",
    taskId: "T-122",
    title: "Suricata IPS — 47 noma'lum imzo, oxirgi update 2025-12",
    severity: "high",
    cvss: 7.0,
    status: "approved",
    reportedBy: "u6",
    date: "2026-05-17",
    asset: "IPS-EDGE-01",
    type: "Operatsion kamchilik",
    cwe: "CWE-1053",
    description: "IDS/IPS qurilmasida imzolar oxirgi marta 2025-yil dekabrida yangilangan. Yangi C2 va exploitlar e'tibordan chetda.",
    evidence: 2,
    ai: true
  }, {
    id: "F-2026-0345",
    auditId: "AUD-2026-014",
    taskId: "T-117",
    title: "DNS tunneling — uzoq subdomain so‘rovlar (24 soatda 18,400)",
    severity: "high",
    cvss: 8.1,
    status: "review",
    reportedBy: "u3",
    date: "2026-05-20",
    asset: "10.10.42.16",
    type: "Trafik anomaliya",
    cwe: "CWE-200",
    description: "Bir endpoint 24 soat ichida 18,400 ta noyob, uzun (>50 belgi) subdomain so‘rovi yubordi. Klassik DNS tunneling/exfiltration belgisi.",
    evidence: 3,
    ai: true
  }, {
    id: "F-2026-0346",
    auditId: "AUD-2026-014",
    taskId: "T-123",
    title: "Login forma — SQL injection (POST /api/v1/login)",
    severity: "critical",
    cvss: 9.4,
    status: "approved",
    reportedBy: "u4",
    date: "2026-05-16",
    asset: "portal.gov.uz",
    type: "Web zaiflik",
    cwe: "CWE-89",
    description: "Login endpoint username parametrida UNION-based SQL injection. Ma'lumotlar bazasini to‘liq dump qilish mumkin.",
    evidence: 5,
    ai: true
  }, {
    id: "F-2026-0347",
    auditId: "AUD-2026-014",
    taskId: "T-114",
    title: "Telnet (port 23) ochiq — 12 ta network qurilmada",
    severity: "high",
    cvss: 7.5,
    status: "approved",
    reportedBy: "u6",
    date: "2026-05-19",
    asset: "Network range",
    type: "Konfiguratsiya kamchiligi",
    cwe: "CWE-319",
    description: "12 ta switch va router qurilmasida Telnet xizmati yoqilgan. SSH-only siyosati buzilgan.",
    evidence: 1,
    ai: true
  }, {
    id: "F-2026-0348",
    auditId: "AUD-2026-014",
    taskId: "T-119",
    title: "SMBv1 yoqilgan — 4 ta server",
    severity: "medium",
    cvss: 5.3,
    status: "approved",
    reportedBy: "u4",
    date: "2026-05-18",
    asset: "Server farm",
    type: "Operatsion kamchilik",
    cwe: "CWE-326",
    description: "SMBv1 yoqilgan, EternalBlue/Wannacry kabi exploit vektorlariga ochiq.",
    evidence: 2,
    ai: false
  }, {
    id: "F-2026-0349",
    auditId: "AUD-2026-014",
    taskId: "T-119",
    title: "RDP — 0.0.0.0 ga ochiq, NLA off (3 server)",
    severity: "medium",
    cvss: 5.8,
    status: "review",
    reportedBy: "u4",
    date: "2026-05-18",
    asset: "Server farm",
    type: "Tizim sozlamasi",
    cwe: "CWE-287",
    description: "RDP servisi internetga (yoki keng segmentga) ochiq, Network Level Authentication (NLA) o‘chiq.",
    evidence: 1,
    ai: false
  }, {
    id: "F-2026-0350",
    auditId: "AUD-2026-014",
    taskId: "T-125",
    title: "Switch ACL — \"any any permit\" oxirgi qoida sifatida",
    severity: "low",
    cvss: 3.4,
    status: "review",
    reportedBy: "u6",
    date: "2026-05-20",
    asset: "SW-CORE-02",
    type: "Konfiguratsiya kamchiligi",
    cwe: "CWE-732",
    description: "Core switch ACL ro‘yxatlarida default deny o‘rniga \"any any permit\" yakuniy qoida sifatida ishlatilgan.",
    evidence: 1,
    ai: false
  }];
  const SEV_LABELS = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info"
  };

  // ---------- KPI ----------
  const KPI_RULES = [{
    event: "Auditda ishtirok etish",
    points: 5
  }, {
    event: "Audit guruhi rahbari sifatida",
    points: 15
  }, {
    event: "Audit loyihasini ishlab chiqish",
    points: 15
  }, {
    event: "Vazifalarni to‘g‘ri taqsimlash",
    points: 10
  }, {
    event: "Auditor sifatida qatnashish",
    points: 10
  }, {
    event: "Har bir bajarilgan vazifa",
    points: 5
  }, {
    event: "Vazifani muddatida bajarish",
    points: 5
  }, {
    event: "Vazifani kechiktirish",
    points: -5
  }, {
    event: "Tasdiqlangan zaiflik (har biri)",
    points: 3
  }, {
    event: "Critical zaiflik qo‘shimcha",
    points: 10
  }, {
    event: "High zaiflik qo‘shimcha",
    points: 7
  }, {
    event: "Medium zaiflik qo‘shimcha",
    points: 4
  }, {
    event: "Low zaiflik qo‘shimcha",
    points: 1
  }, {
    event: "Konfiguratsiya fayli tahlili",
    points: 5
  }, {
    event: "Skaner natijasini import va tahlil",
    points: 5
  }, {
    event: "Trafik tahlilini bajarish",
    points: 7
  }, {
    event: "Hisobotga texnik xulosa",
    points: 5
  }, {
    event: "Qayta ishlashga qaytarilgan zaiflik",
    points: -2
  }, {
    event: "Noto‘g‘ri kiritilgan zaiflik",
    points: -3
  }];
  const KPI_USERS = [{
    user: "u3",
    audits: 4,
    tasks: 31,
    findings: 14,
    total: 287,
    delta: +18,
    sparkline: [120, 145, 180, 210, 255, 287]
  }, {
    user: "u4",
    audits: 5,
    tasks: 28,
    findings: 22,
    total: 264,
    delta: +21,
    sparkline: [110, 130, 165, 195, 230, 264]
  }, {
    user: "u8",
    audits: 3,
    tasks: 22,
    findings: 16,
    total: 218,
    delta: +12,
    sparkline: [98, 124, 152, 180, 200, 218]
  }, {
    user: "u10",
    audits: 3,
    tasks: 19,
    findings: 11,
    total: 196,
    delta: +9,
    sparkline: [85, 102, 128, 155, 180, 196]
  }, {
    user: "u6",
    audits: 4,
    tasks: 26,
    findings: 18,
    total: 188,
    delta: +14,
    sparkline: [76, 99, 121, 148, 172, 188]
  }, {
    user: "u7",
    audits: 3,
    tasks: 21,
    findings: 9,
    total: 162,
    delta: +6,
    sparkline: [68, 86, 110, 134, 152, 162]
  }, {
    user: "u5",
    audits: 3,
    tasks: 17,
    findings: 7,
    total: 138,
    delta: +3,
    sparkline: [62, 78, 95, 110, 128, 138]
  }, {
    user: "u9",
    audits: 2,
    tasks: 12,
    findings: 6,
    total: 96,
    delta: -2,
    sparkline: [42, 58, 72, 84, 98, 96]
  }];

  // ---------- AI prompts / history ----------
  const AI_CONVO = [{
    role: "system",
    time: "10:24",
    text: "Ollama lokal (qwen2.5:14b-instruct) ulanish: OK. Yopiq tarmoq."
  }, {
    role: "user",
    who: "u3",
    time: "10:25",
    text: "F-2026-0341 va F-2026-0347 findinglariga executive summary tayyorla. Texnik bo‘lmagan rahbariyat uchun, 5–6 jumla."
  }, {
    role: "ai",
    time: "10:25",
    text: "Audit davomida tarmoq segmentatsiyasiga oid ikkita jiddiy kamchilik aniqlandi. Birinchidan, 10.0.0.0/8 ichki tarmoq segmentlari o‘rtasida hech qanday cheklov mavjud emas — bu hujumchi bitta tugunni egallaganda butun tashkilot ichida erkin harakatlanishi imkonini beradi. Ikkinchidan, o‘n ikkita tarmoq qurilmasida zamonaviy SSH o‘rniga Telnet xizmati hali ham yoqilgan; bu trafikka kim ulanishi mumkinligi va sniffing yo‘li bilan akkauntlarni ushlash xavfini keskin oshiradi. Tavsiya etiladi: birinchi navbatda kritik segmentlarni ajratish (firewall qoidalari), so‘ngra Telnetni butunlay o‘chirib, faqat SSHv2 + kalit asosida autentifikatsiyaga o‘tish. Ushbu ikki choradan keyin aniqlangan kamchiliklarning amaliy xavfi sezilarli darajada pasayadi."
  }, {
    role: "user",
    who: "u3",
    time: "10:31",
    text: "Yaxshi. Endi yuqoridagi 2 ta finding uchun remediation plan (action items, owner, ETA) yarat."
  }, {
    role: "ai",
    time: "10:31",
    text: "Remediation rejasi tayyor — 4 ta amal, jami muddati 14 ish kuni. Tafsilotlar pastdagi blokda.",
    attach: "plan"
  }];

  // ---------- Tokens ----------
  const TOKENS = [{
    id: "tk_a91x...c47e",
    audit: "AUD-2026-014",
    user: "u6",
    device: "DESKTOP-MS-NB14",
    hostname: "ms-laptop",
    os: "Windows 11 Pro 23H2",
    agent: "v1.2.4",
    ip: "10.20.4.142",
    issued: "2026-05-15 09:12",
    expires: "2026-05-31 18:00",
    status: "active",
    lastUsed: "12 min",
    tasks: 6
  }, {
    id: "tk_b27p...f10a",
    audit: "AUD-2026-014",
    user: "u7",
    device: "DESKTOP-JT-22",
    hostname: "jasur-pc",
    os: "Windows 10 LTSC",
    agent: "v1.2.4",
    ip: "10.20.4.156",
    issued: "2026-05-15 09:14",
    expires: "2026-05-31 18:00",
    status: "active",
    lastUsed: "1 soat",
    tasks: 4
  }, {
    id: "tk_c63m...d92b",
    audit: "AUD-2026-014",
    user: "u4",
    device: "WS-SK-AUDIT",
    hostname: "sevara-ws",
    os: "Windows 11 Enterprise",
    agent: "v1.2.4",
    ip: "10.20.4.171",
    issued: "2026-05-15 09:14",
    expires: "2026-05-31 18:00",
    status: "active",
    lastUsed: "31 min",
    tasks: 8
  }, {
    id: "tk_d04q...e83c",
    audit: "AUD-2026-014",
    user: "u3",
    device: "BOSH-NB-01",
    hostname: "bobur-nb",
    os: "Windows 11 Pro",
    agent: "v1.2.4",
    ip: "10.20.4.188",
    issued: "2026-05-15 09:13",
    expires: "2026-05-31 18:00",
    status: "active",
    lastUsed: "5 daqiqa",
    tasks: 5
  }, {
    id: "tk_e88r...a15d",
    audit: "AUD-2026-013",
    user: "u9",
    device: "DESKTOP-SH-09",
    hostname: "sherzod-pc",
    os: "Windows 10 Pro 22H2",
    agent: "v1.2.3",
    ip: "10.20.4.203",
    issued: "2026-03-25 10:02",
    expires: "2026-05-18 18:00",
    status: "expired",
    lastUsed: "3 kun",
    tasks: 3
  }, {
    id: "tk_f12s...c54e",
    audit: "AUD-2026-011",
    user: "u10",
    device: "WS-LA-PRO",
    hostname: "lola-ws",
    os: "Windows 11 Pro",
    agent: "v1.2.4",
    ip: "10.20.4.212",
    issued: "2026-02-20 14:30",
    expires: "2026-04-30 18:00",
    status: "revoked",
    lastUsed: "2 hafta",
    tasks: 7
  }];

  // ---------- Audit log entries ----------
  const LOGS = [{
    time: "10:42:14",
    user: "u4",
    action: "finding.create",
    entity: "F-2026-0349",
    ip: "10.20.4.171",
    device: "WS-SK-AUDIT",
    level: "info"
  }, {
    time: "10:39:02",
    user: "u3",
    action: "ai.prompt",
    entity: "AUD-2026-014",
    ip: "10.20.4.188",
    device: "BOSH-NB-01",
    level: "info"
  }, {
    time: "10:35:48",
    user: "u4",
    action: "task.update",
    entity: "T-123",
    ip: "10.20.4.171",
    device: "WS-SK-AUDIT",
    level: "info"
  }, {
    time: "10:28:11",
    user: "u6",
    action: "agent.sync",
    entity: "AUD-2026-014",
    ip: "10.20.4.142",
    device: "DESKTOP-MS-NB14",
    level: "info"
  }, {
    time: "10:22:55",
    user: "u7",
    action: "auth.login",
    entity: "—",
    ip: "10.20.4.156",
    device: "DESKTOP-JT-22",
    level: "info"
  }, {
    time: "10:11:09",
    user: "u9",
    action: "auth.login.fail",
    entity: "—",
    ip: "10.20.4.203",
    device: "DESKTOP-SH-09",
    level: "warn"
  }, {
    time: "09:58:42",
    user: "u3",
    action: "finding.approve",
    entity: "F-2026-0341",
    ip: "10.20.4.188",
    device: "BOSH-NB-01",
    level: "info"
  }, {
    time: "09:54:30",
    user: "u3",
    action: "report.generate",
    entity: "AUD-2026-013",
    ip: "10.20.4.188",
    device: "BOSH-NB-01",
    level: "info"
  }, {
    time: "09:42:18",
    user: "u2",
    action: "audit.approve",
    entity: "AUD-2026-011",
    ip: "10.20.4.110",
    device: "DESKTOP-DR-01",
    level: "info"
  }, {
    time: "09:35:01",
    user: "u4",
    action: "token.issue",
    entity: "tk_b27p…f10a",
    ip: "10.20.4.171",
    device: "WS-SK-AUDIT",
    level: "info"
  }, {
    time: "09:11:24",
    user: "u1",
    action: "settings.update",
    entity: "kpi.rules",
    ip: "10.20.4.99",
    device: "AY-OFFICE-01",
    level: "warn"
  }, {
    time: "08:48:09",
    user: "u6",
    action: "token.use",
    entity: "tk_a91x…c47e",
    ip: "10.20.4.142",
    device: "DESKTOP-MS-NB14",
    level: "info"
  }];

  // ---------- Permission matrix ----------
  const PERM_MODULES = [{
    id: "users",
    name: "Foydalanuvchilar",
    d: "full",
    b: "read",
    bs: "no",
    y: "no",
    t1: "no"
  }, {
    id: "org",
    name: "Tashkilotlar kartasi",
    d: "full",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "audit",
    name: "Audit kartasi",
    d: "full",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "group",
    name: "Audit guruhini shaklllash",
    d: "read",
    b: "full",
    bs: "no",
    y: "no",
    t1: "no"
  }, {
    id: "leader",
    name: "Guruh rahbarini tanlash",
    d: "read",
    b: "full",
    bs: "no",
    y: "no",
    t1: "no"
  }, {
    id: "project",
    name: "Auditdan o‘tkazish loyihasi",
    d: "read",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "assign",
    name: "Vazifalarni biriktirish",
    d: "read",
    b: "read",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "mytasks",
    name: "O‘z vazifalarini ko‘rish",
    d: "full",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "finding",
    name: "Kamchilik/zaiflik",
    d: "full",
    b: "read",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "agent",
    name: "EXE agent",
    d: "no",
    b: "read",
    bs: "full",
    y: "full",
    t1: "full"
  }, {
    id: "token",
    name: "Audit token",
    d: "full",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "ai",
    name: "AI tahlil",
    d: "full",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "kpi",
    name: "KPI",
    d: "full",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "report",
    name: "Hisobotlar",
    d: "full",
    b: "full",
    bs: "own",
    y: "own",
    t1: "own"
  }, {
    id: "log",
    name: "Audit log",
    d: "full",
    b: "read",
    bs: "own",
    y: "own",
    t1: "own"
  }];
  const PERM_VALUES = {
    full: {
      label: "To‘liq",
      className: "perm--full"
    },
    full2: {
      label: "Boshqarish",
      className: "perm--full"
    },
    read: {
      label: "Ko‘rish",
      className: "perm--read"
    },
    own: {
      label: "O‘ziga tegishli",
      className: "perm--partial"
    },
    no: {
      label: "Yo‘q",
      className: "perm--no"
    }
  };

  // ---------- Reports ----------
  const REPORTS = [{
    id: "R-201",
    title: "Aloqa va kommunikatsiya vazirligi — yakuniy audit hisoboti",
    audit: "AUD-2026-014",
    type: "Audit hisoboti",
    status: "draft",
    generated: "—",
    size: "—",
    format: ["DOCX", "PDF"],
    author: "u3"
  }, {
    id: "R-200",
    title: "Aloqa vazirligi — Executive Summary",
    audit: "AUD-2026-014",
    type: "Executive summary",
    status: "draft",
    generated: "—",
    size: "—",
    format: ["PDF"],
    author: "u3"
  }, {
    id: "R-199",
    title: "Soliq qo‘mitasi — yakuniy hisobot",
    audit: "AUD-2026-013",
    type: "Audit hisoboti",
    status: "approved",
    generated: "2026-05-18 14:21",
    size: "4.2 MB",
    format: ["DOCX", "PDF", "HTML"],
    author: "u4"
  }, {
    id: "R-198",
    title: "Soliq qo‘mitasi — Remediation plan",
    audit: "AUD-2026-013",
    type: "Remediation plan",
    status: "approved",
    generated: "2026-05-18 14:24",
    size: "1.1 MB",
    format: ["DOCX", "PDF"],
    author: "u4"
  }, {
    id: "R-197",
    title: "Davlat xizmatlari agentligi — yakuniy hisobot",
    audit: "AUD-2026-011",
    type: "Audit hisoboti",
    status: "approved",
    generated: "2026-04-30 17:02",
    size: "5.8 MB",
    format: ["DOCX", "PDF"],
    author: "u3"
  }, {
    id: "R-196",
    title: "Markaziy bank — pentest oraliq hisoboti",
    audit: "AUD-2026-012",
    type: "Pentest hisoboti",
    status: "review",
    generated: "2026-05-20 11:05",
    size: "2.4 MB",
    format: ["DOCX", "PDF"],
    author: "u8"
  }];

  // ---------- Helpers ----------
  function userById(id) {
    return USERS.find(u => u.id === id) || {
      name: id,
      avatar: "?"
    };
  }
  function orgById(id) {
    return ORGS.find(o => o.id === id) || {
      name: id
    };
  }
  function auditById(id) {
    return AUDITS.find(a => a.id === id);
  }
  return {
    USERS,
    ROLES,
    ORGS,
    AUDITS,
    STATUS_LABELS,
    WORKFLOW,
    TASKS,
    TASK_STATUS,
    FINDINGS,
    SEV_LABELS,
    KPI_RULES,
    KPI_USERS,
    AI_CONVO,
    TOKENS,
    LOGS,
    PERM_MODULES,
    PERM_VALUES,
    REPORTS,
    userById,
    orgById,
    auditById
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/data.js", error: String((e && e.message) || e) }); }

// ui_kits/auditor/icons.jsx
try { (() => {
/* Lucide-style icons inlined as React components.
   Each accepts size + className. Stroke 1.75, rounded caps. */
(function () {
  const {
    createElement: h
  } = React;
  const base = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };
  function Icon(paths) {
    return function I(props = {}) {
      const {
        size = 16,
        className,
        style,
        ...rest
      } = props;
      return h("svg", {
        ...base,
        width: size,
        height: size,
        className,
        style,
        ...rest
      }, paths.map((p, i) => h(p.tag || "path", {
        key: i,
        ...p
      })));
    };
  }
  window.Icons = {
    Shield: Icon([{
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    }]),
    ShieldCheck: Icon([{
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    }, {
      d: "m9 12 2 2 4-4"
    }]),
    ShieldAlert: Icon([{
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    }, {
      d: "M12 8v4"
    }, {
      d: "M12 16h.01"
    }]),
    LayoutDashboard: Icon([{
      d: "M3 3h7v9H3z"
    }, {
      d: "M14 3h7v5h-7z"
    }, {
      d: "M14 12h7v9h-7z"
    }, {
      d: "M3 16h7v5H3z"
    }]),
    FolderKanban: Icon([{
      d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9L8.84 3.46A2 2 0 0 0 7.18 2.5H4a2 2 0 0 0-2 2v13.5A2.5 2.5 0 0 0 4.5 20Z"
    }, {
      d: "M8 10v8"
    }, {
      d: "M12 10v4"
    }, {
      d: "M16 10v6"
    }]),
    CheckSquare: Icon([{
      d: "M9 11l3 3L22 4"
    }, {
      d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
    }]),
    AlertTriangle: Icon([{
      d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
    }, {
      d: "M12 9v4"
    }, {
      d: "M12 17h.01"
    }]),
    FileSearch: Icon([{
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }, {
      d: "M14 2v6h6"
    }, {
      tag: "circle",
      cx: 11.5,
      cy: 14.5,
      r: 2.5
    }, {
      d: "m13.27 16.27 1.73 1.73"
    }]),
    Sparkles: Icon([{
      d: "m12 3-1.9 5.8L4 11l5.8 1.9L12 19l1.9-5.8L20 11l-5.8-1.9z"
    }, {
      d: "M5 3v4"
    }, {
      d: "M19 17v4"
    }, {
      d: "M3 5h4"
    }, {
      d: "M17 19h4"
    }]),
    BarChart3: Icon([{
      d: "M3 3v18h18"
    }, {
      d: "M8 17V9"
    }, {
      d: "M13 17V5"
    }, {
      d: "M18 17v-7"
    }]),
    FileText: Icon([{
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }, {
      d: "M14 2v6h6"
    }, {
      d: "M16 13H8"
    }, {
      d: "M16 17H8"
    }, {
      d: "M10 9H8"
    }]),
    KeyRound: Icon([{
      tag: "circle",
      cx: 7.5,
      cy: 15.5,
      r: 5.5
    }, {
      d: "m21 2-9.6 9.6"
    }, {
      d: "m15.5 7.5 3 3L22 7l-3-3"
    }]),
    Users: Icon([{
      d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    }, {
      tag: "circle",
      cx: 9,
      cy: 7,
      r: 4
    }, {
      d: "M22 21v-2a4 4 0 0 0-3-3.87"
    }, {
      d: "M16 3.13a4 4 0 0 1 0 7.75"
    }]),
    History: Icon([{
      d: "M3 12a9 9 0 1 0 3-6.7L3 8"
    }, {
      d: "M3 3v5h5"
    }, {
      d: "M12 7v5l4 2"
    }]),
    Monitor: Icon([{
      tag: "rect",
      x: 2,
      y: 3,
      width: 20,
      height: 14,
      rx: 2
    }, {
      d: "M8 21h8"
    }, {
      d: "M12 17v4"
    }]),
    Settings: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 3
    }, {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    }]),
    Building2: Icon([{
      d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
    }, {
      d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"
    }, {
      d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"
    }, {
      d: "M10 6h4"
    }, {
      d: "M10 10h4"
    }, {
      d: "M10 14h4"
    }, {
      d: "M10 18h4"
    }]),
    Search: Icon([{
      tag: "circle",
      cx: 11,
      cy: 11,
      r: 8
    }, {
      d: "m21 21-4.3-4.3"
    }]),
    Bell: Icon([{
      d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
    }, {
      d: "M10.3 21a1.94 1.94 0 0 0 3.4 0"
    }]),
    Moon: Icon([{
      d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    }]),
    Sun: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 4
    }, {
      d: "M12 2v2"
    }, {
      d: "M12 20v2"
    }, {
      d: "m4.93 4.93 1.41 1.41"
    }, {
      d: "m17.66 17.66 1.41 1.41"
    }, {
      d: "M2 12h2"
    }, {
      d: "M20 12h2"
    }, {
      d: "m6.34 17.66-1.41 1.41"
    }, {
      d: "m19.07 4.93-1.41 1.41"
    }]),
    Plus: Icon([{
      d: "M12 5v14"
    }, {
      d: "M5 12h14"
    }]),
    ChevronRight: Icon([{
      d: "m9 18 6-6-6-6"
    }]),
    ChevronDown: Icon([{
      d: "m6 9 6 6 6-6"
    }]),
    ChevronLeft: Icon([{
      d: "m15 18-6-6 6-6"
    }]),
    ChevronUp: Icon([{
      d: "m18 15-6-6-6 6"
    }]),
    ChevronsUpDown: Icon([{
      d: "m7 15 5 5 5-5"
    }, {
      d: "m7 9 5-5 5 5"
    }]),
    Filter: Icon([{
      d: "M22 3H2l8 9.46V19l4 2v-8.54Z"
    }]),
    Download: Icon([{
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }, {
      d: "m7 10 5 5 5-5"
    }, {
      d: "M12 15V3"
    }]),
    Upload: Icon([{
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }, {
      d: "m17 8-5-5-5 5"
    }, {
      d: "M12 3v12"
    }]),
    X: Icon([{
      d: "M18 6 6 18"
    }, {
      d: "m6 6 12 12"
    }]),
    Check: Icon([{
      d: "M20 6 9 17l-5-5"
    }]),
    Edit3: Icon([{
      d: "M12 20h9"
    }, {
      d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
    }]),
    Eye: Icon([{
      d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"
    }, {
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 3
    }]),
    EyeOff: Icon([{
      d: "M9.88 9.88a3 3 0 1 0 4.24 4.24"
    }, {
      d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
    }, {
      d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
    }, {
      d: "m2 2 20 20"
    }]),
    Trash2: Icon([{
      d: "M3 6h18"
    }, {
      d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
    }, {
      d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
    }, {
      d: "M10 11v6"
    }, {
      d: "M14 11v6"
    }]),
    MoreHorizontal: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 1
    }, {
      tag: "circle",
      cx: 19,
      cy: 12,
      r: 1
    }, {
      tag: "circle",
      cx: 5,
      cy: 12,
      r: 1
    }]),
    MoreVertical: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 1
    }, {
      tag: "circle",
      cx: 12,
      cy: 5,
      r: 1
    }, {
      tag: "circle",
      cx: 12,
      cy: 19,
      r: 1
    }]),
    Calendar: Icon([{
      tag: "rect",
      x: 3,
      y: 4,
      width: 18,
      height: 18,
      rx: 2
    }, {
      d: "M16 2v4"
    }, {
      d: "M8 2v4"
    }, {
      d: "M3 10h18"
    }]),
    Clock: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      d: "M12 6v6l4 2"
    }]),
    Wifi: Icon([{
      d: "M5 13a10 10 0 0 1 14 0"
    }, {
      d: "M8.5 16.5a5 5 0 0 1 7 0"
    }, {
      d: "M2 8.82a15 15 0 0 1 20 0"
    }, {
      d: "M12 20h.01"
    }]),
    WifiOff: Icon([{
      d: "m2 2 20 20"
    }, {
      d: "M8.5 16.5a5 5 0 0 1 7 0"
    }, {
      d: "M12 20h.01"
    }, {
      d: "M2 8.82a15 15 0 0 1 20 0"
    }]),
    Network: Icon([{
      tag: "rect",
      x: 16,
      y: 16,
      width: 6,
      height: 6,
      rx: 1
    }, {
      tag: "rect",
      x: 2,
      y: 16,
      width: 6,
      height: 6,
      rx: 1
    }, {
      tag: "rect",
      x: 9,
      y: 2,
      width: 6,
      height: 6,
      rx: 1
    }, {
      d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"
    }, {
      d: "M12 12V8"
    }]),
    Server: Icon([{
      tag: "rect",
      x: 2,
      y: 2,
      width: 20,
      height: 8,
      rx: 2
    }, {
      tag: "rect",
      x: 2,
      y: 14,
      width: 20,
      height: 8,
      rx: 2
    }, {
      d: "M6 6h.01"
    }, {
      d: "M6 18h.01"
    }]),
    Cpu: Icon([{
      tag: "rect",
      x: 4,
      y: 4,
      width: 16,
      height: 16,
      rx: 2
    }, {
      tag: "rect",
      x: 9,
      y: 9,
      width: 6,
      height: 6
    }, {
      d: "M15 2v2"
    }, {
      d: "M15 20v2"
    }, {
      d: "M2 15h2"
    }, {
      d: "M20 15h2"
    }, {
      d: "M2 9h2"
    }, {
      d: "M20 9h2"
    }, {
      d: "M9 2v2"
    }, {
      d: "M9 20v2"
    }]),
    HardDrive: Icon([{
      d: "M22 12H2"
    }, {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"
    }, {
      d: "M6 16h.01"
    }, {
      d: "M10 16h.01"
    }]),
    Database: Icon([{
      tag: "ellipse",
      cx: 12,
      cy: 5,
      rx: 9,
      ry: 3
    }, {
      d: "M3 5v14a9 3 0 0 0 18 0V5"
    }, {
      d: "M3 12a9 3 0 0 0 18 0"
    }]),
    Bug: Icon([{
      d: "m8 2 1.88 1.88"
    }, {
      d: "M14.12 3.88 16 2"
    }, {
      d: "M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"
    }, {
      d: "M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z"
    }, {
      d: "M12 20v-9"
    }, {
      d: "M6.53 9 4 8"
    }, {
      d: "M6 13H2"
    }, {
      d: "M3 21l3.11-1.55"
    }, {
      d: "M20.47 9 22 8"
    }, {
      d: "M22 13h-4"
    }, {
      d: "m17.89 19.45 3.11 1.55"
    }]),
    Layers: Icon([{
      d: "m12 2 9 5-9 5-9-5z"
    }, {
      d: "m3 12 9 5 9-5"
    }, {
      d: "m3 17 9 5 9-5"
    }]),
    Activity: Icon([{
      d: "M22 12h-4l-3 9L9 3l-3 9H2"
    }]),
    Lock: Icon([{
      tag: "rect",
      x: 3,
      y: 11,
      width: 18,
      height: 11,
      rx: 2
    }, {
      d: "M7 11V7a5 5 0 0 1 10 0v4"
    }]),
    Unlock: Icon([{
      tag: "rect",
      x: 3,
      y: 11,
      width: 18,
      height: 11,
      rx: 2
    }, {
      d: "M7 11V7a5 5 0 0 1 9.9-1"
    }]),
    Mail: Icon([{
      tag: "rect",
      x: 2,
      y: 4,
      width: 20,
      height: 16,
      rx: 2
    }, {
      d: "m22 7-10 5L2 7"
    }]),
    Globe: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      d: "M2 12h20"
    }, {
      d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
    }]),
    Send: Icon([{
      d: "m22 2-7 20-4-9-9-4Z"
    }, {
      d: "M22 2 11 13"
    }]),
    LogOut: Icon([{
      d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
    }, {
      d: "m16 17 5-5-5-5"
    }, {
      d: "M21 12H9"
    }]),
    LogIn: Icon([{
      d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
    }, {
      d: "m10 17 5-5-5-5"
    }, {
      d: "M15 12H3"
    }]),
    Refresh: Icon([{
      d: "M3 12a9 9 0 0 1 15-6.7l3-2.3v8h-8l3-2.3"
    }, {
      d: "M21 12a9 9 0 0 1-15 6.7l-3 2.3v-8h8l-3 2.3"
    }]),
    Save: Icon([{
      d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
    }, {
      d: "M17 21v-8H7v8"
    }, {
      d: "M7 3v5h8"
    }]),
    Paperclip: Icon([{
      d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
    }]),
    Tag: Icon([{
      d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
    }, {
      d: "M7 7h.01"
    }]),
    Star: Icon([{
      d: "m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"
    }]),
    Trophy: Icon([{
      d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
    }, {
      d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
    }, {
      d: "M4 22h16"
    }, {
      d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
    }, {
      d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
    }, {
      d: "M18 2H6v7a6 6 0 0 0 12 0V2Z"
    }]),
    Target: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 6
    }, {
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 2
    }]),
    TrendingUp: Icon([{
      d: "m22 7-8.5 8.5-5-5L2 17"
    }, {
      d: "M16 7h6v6"
    }]),
    TrendingDown: Icon([{
      d: "m22 17-8.5-8.5-5 5L2 7"
    }, {
      d: "M16 17h6v-6"
    }]),
    Menu: Icon([{
      d: "M4 12h16"
    }, {
      d: "M4 6h16"
    }, {
      d: "M4 18h16"
    }]),
    Folder: Icon([{
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
    }]),
    File: Icon([{
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }, {
      d: "M14 2v6h6"
    }]),
    Image: Icon([{
      tag: "rect",
      x: 3,
      y: 3,
      width: 18,
      height: 18,
      rx: 2
    }, {
      tag: "circle",
      cx: 9,
      cy: 9,
      r: 2
    }, {
      d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
    }]),
    Code: Icon([{
      d: "m16 18 6-6-6-6"
    }, {
      d: "m8 6-6 6 6 6"
    }]),
    Play: Icon([{
      d: "M5 3v18l16-9z"
    }]),
    Pause: Icon([{
      tag: "rect",
      x: 6,
      y: 4,
      width: 4,
      height: 16
    }, {
      tag: "rect",
      x: 14,
      y: 4,
      width: 4,
      height: 16
    }]),
    Power: Icon([{
      d: "M18.36 6.64A9 9 0 1 1 5.64 6.64"
    }, {
      d: "M12 2v10"
    }]),
    Smartphone: Icon([{
      tag: "rect",
      x: 5,
      y: 2,
      width: 14,
      height: 20,
      rx: 2
    }, {
      d: "M12 18h.01"
    }]),
    Copy: Icon([{
      tag: "rect",
      x: 9,
      y: 9,
      width: 13,
      height: 13,
      rx: 2
    }, {
      d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
    }]),
    Link: Icon([{
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
    }, {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
    }]),
    GitBranch: Icon([{
      d: "M6 3v12"
    }, {
      tag: "circle",
      cx: 18,
      cy: 6,
      r: 3
    }, {
      tag: "circle",
      cx: 6,
      cy: 18,
      r: 3
    }, {
      d: "M18 9a9 9 0 0 1-9 9"
    }]),
    Zap: Icon([{
      d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z"
    }]),
    Building: Icon([{
      tag: "rect",
      x: 4,
      y: 2,
      width: 16,
      height: 20,
      rx: 2
    }, {
      d: "M9 22v-4h6v4"
    }, {
      d: "M8 6h.01"
    }, {
      d: "M16 6h.01"
    }, {
      d: "M12 6h.01"
    }, {
      d: "M12 10h.01"
    }, {
      d: "M12 14h.01"
    }, {
      d: "M16 10h.01"
    }, {
      d: "M16 14h.01"
    }, {
      d: "M8 10h.01"
    }, {
      d: "M8 14h.01"
    }]),
    UserCheck: Icon([{
      d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    }, {
      tag: "circle",
      cx: 9,
      cy: 7,
      r: 4
    }, {
      d: "m16 11 2 2 4-4"
    }]),
    User: Icon([{
      d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
    }, {
      tag: "circle",
      cx: 12,
      cy: 7,
      r: 4
    }]),
    Briefcase: Icon([{
      tag: "rect",
      x: 2,
      y: 7,
      width: 20,
      height: 14,
      rx: 2
    }, {
      d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
    }]),
    Flag: Icon([{
      d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
    }, {
      d: "M4 22V15"
    }]),
    Boxes: Icon([{
      d: "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42z"
    }, {
      d: "m7 16.5-4.74-2.85"
    }, {
      d: "m7 16.5 5-3"
    }, {
      d: "M7 16.5v5.17"
    }, {
      d: "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"
    }, {
      d: "m17 16.5-5-3"
    }, {
      d: "m17 16.5 4.74-2.85"
    }, {
      d: "M17 16.5v5.17"
    }, {
      d: "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0z"
    }, {
      d: "M12 8 7.26 5.15"
    }, {
      d: "m12 8 4.74-2.85"
    }, {
      d: "M12 13.5V8"
    }]),
    Maximize2: Icon([{
      d: "M15 3h6v6"
    }, {
      d: "M9 21H3v-6"
    }, {
      d: "m21 3-7 7"
    }, {
      d: "m3 21 7-7"
    }]),
    Map: Icon([{
      d: "M1 6v16l7-3 8 3 7-3V3l-7 3-8-3-7 3z"
    }, {
      d: "M8 3v16"
    }, {
      d: "M16 6v16"
    }]),
    Inbox: Icon([{
      d: "m22 12-4-4H6l-4 4v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z"
    }, {
      d: "M2 12h6.18a2 2 0 0 1 1.78 1.1l.04.08a2 2 0 0 0 1.78 1.1h2.46a2 2 0 0 0 1.78-1.1l.04-.08A2 2 0 0 1 15.82 12H22"
    }]),
    Pin: Icon([{
      d: "M12 17v5"
    }, {
      d: "M9 10.76V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5.76a2 2 0 0 0 .29 1.05L17 14H7l1.71-2.19A2 2 0 0 0 9 10.76Z"
    }]),
    PieChart: Icon([{
      d: "M21.21 15.89A10 10 0 1 1 8 2.83"
    }, {
      d: "M22 12A10 10 0 0 0 12 2v10z"
    }]),
    BarChart: Icon([{
      d: "M12 20V10"
    }, {
      d: "M18 20V4"
    }, {
      d: "M6 20v-6"
    }]),
    Hash: Icon([{
      d: "M4 9h16"
    }, {
      d: "M4 15h16"
    }, {
      d: "M10 3 8 21"
    }, {
      d: "M16 3l-2 18"
    }]),
    Brain: Icon([{
      d: "M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"
    }, {
      d: "M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"
    }, {
      d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"
    }, {
      d: "M17.599 6.5a3 3 0 0 0 .399-1.375"
    }, {
      d: "M6.003 5.125A3 3 0 0 0 6.401 6.5"
    }, {
      d: "M3.477 10.896a4 4 0 0 1 .585-.396"
    }, {
      d: "M19.938 10.5a4 4 0 0 1 .585.396"
    }, {
      d: "M6 18a4 4 0 0 1-1.967-.516"
    }, {
      d: "M19.967 17.484A4 4 0 0 1 18 18"
    }]),
    Key: Icon([{
      d: "m21 2-9.6 9.6"
    }, {
      tag: "circle",
      cx: 7.5,
      cy: 15.5,
      r: 5.5
    }, {
      d: "m15.5 7.5 3 3L22 7l-3-3"
    }, {
      d: "M16 8 14 6"
    }]),
    Fingerprint: Icon([{
      d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
    }, {
      d: "M14 13.12c0 2.38 0 6.38-1 8.88"
    }, {
      d: "M17.29 21.02c.12-.6.43-2.3.5-3.02"
    }, {
      d: "M2 12a10 10 0 0 1 18-6"
    }, {
      d: "M2 16h.01"
    }, {
      d: "M21.8 16c.2-2 .131-5.354 0-6"
    }, {
      d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
    }, {
      d: "M8.65 22c.21-.66.45-1.32.57-2"
    }, {
      d: "M9 6.8a6 6 0 0 1 9 5.2v2"
    }]),
    Info: Icon([{
      tag: "circle",
      cx: 12,
      cy: 12,
      r: 10
    }, {
      d: "M12 16v-4"
    }, {
      d: "M12 8h.01"
    }])
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/screens-admin.jsx
try { (() => {
/* Admin screens: global Tokens, Users, Permissions matrix, Logs, Reports. */
(function () {
  const {
    useState,
    useMemo,
    useEffect,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // GLOBAL TOKENS SCREEN
  // =========================================================================
  function TokensScreen({
    setRoute,
    role
  }) {
    const [showCreate, setShowCreate] = useState(false);
    const [showInfo, setShowInfo] = useState(null);
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Audit tokenlar"
      }],
      title: "Audit tokenlar boshqaruvi",
      sub: D.TOKENS.filter(t => t.status === "active").length + " aktiv · " + D.TOKENS.filter(t => t.status === "expired").length + " muddati o‘tgan · " + D.TOKENS.filter(t => t.status === "revoked").length + " bekor qilingan",
      actions: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Tokenlar XLSX formatda eksport qilindi", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Eksport")]), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => setShowCreate(true)
      }, [h(I.Plus, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Token chiqarish")])]
    }),
    // Stats
    h("div", {
      key: "s",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 16
      }
    }, [h(Stat, {
      key: 1,
      icon: I.KeyRound,
      label: "Aktiv tokenlar",
      value: D.TOKENS.filter(t => t.status === "active").length,
      meta: "4 ta auditda"
    }), h(Stat, {
      key: 2,
      icon: I.Smartphone,
      label: "Bog‘langan qurilmalar",
      value: D.TOKENS.length,
      meta: "Windows 100%"
    }), h(Stat, {
      key: 3,
      icon: I.Activity,
      label: "24h sync",
      value: 142,
      delta: 8,
      meta: "Muvaffaqiyatli"
    }), h(Stat, {
      key: 4,
      icon: I.ShieldAlert,
      label: "Anomaliya",
      value: 0,
      meta: "Notanish qurilma yo‘q"
    })]), h(window.TokenManagement, {
      key: "t",
      tokens: D.TOKENS,
      scope: "global"
    }), h(window.Modal, {
      open: showCreate,
      onClose: () => setShowCreate(false),
      title: h("span", null, [h(I.KeyRound, {
        size: 16,
        style: {
          marginRight: 8
        }
      }), "Yangi audit token"]),
      wide: true,
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => setShowCreate(false)
      }, "Bekor"), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => setShowCreate(false)
      }, [h(I.Check, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Token chiqarish")])]
    }, [h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field span-2",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Audit"), h("select", {
      className: "select"
    }, D.AUDITS.map(a => h("option", {
      key: a.id,
      value: a.id
    }, a.code + " — " + a.title)))]), h("div", {
      className: "field span-2",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Xodim (token egasi)"), h("select", {
      className: "select"
    }, D.USERS.filter(u => ["bosh", "yetakchi", "toifa1"].includes(u.role)).map(u => h("option", {
      key: u.id
    }, u.name + " — " + u.title)))]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Boshlanish vaqti"), h("input", {
      className: "input",
      type: "datetime-local",
      defaultValue: "2026-05-20T09:00"
    })]), h("div", {
      className: "field",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Tugash vaqti"), h("input", {
      className: "input",
      type: "datetime-local",
      defaultValue: "2026-05-31T18:00"
    })]), h("div", {
      className: "field span-2",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "Token ochadigan vazifalar (xodimga biriktirilganlar ichidan)"), h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, D.TASKS.slice(0, 5).map((t, i) => h("label", {
      key: t.id,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: 8,
        background: "var(--bg-surface-2)",
        borderRadius: 6
      }
    }, [h("input", {
      type: "checkbox",
      className: "checkbox",
      defaultChecked: i < 3
    }), h("span", {
      key: 1,
      className: "font-mono",
      style: {
        fontSize: 12
      }
    }, t.id), h("span", {
      key: 2,
      style: {
        flex: 1,
        fontSize: 13
      }
    }, t.title)])))]), h("div", {
      className: "field span-2",
      key: 6
    }, [h("label", {
      className: "field__label"
    }, "Qurilma bog‘lash"), h("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [h("label", {
      className: "radio-row",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: "1px solid var(--brand)",
        borderRadius: 6,
        flex: 1,
        background: "var(--brand-soft)"
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      defaultChecked: true,
      name: "dev"
    }), h("div", {
      key: 1
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "Birinchi ulanishda bog‘lash"), h("div", {
      key: 2,
      className: "cell-sub"
    }, "Agent birinchi marta tokenni ishlatganda qurilma ID bog‘lanadi")])]), h("label", {
      className: "radio-row",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        flex: 1
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      name: "dev"
    }), h("div", {
      key: 1
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, "Aniq qurilmaga bog‘lash"), h("div", {
      key: 2,
      className: "cell-sub"
    }, "Mavjud qurilmani tanlang")])])])])])])]);
  }
  window.TokensScreen = TokensScreen;

  // =========================================================================
  // USERS SCREEN
  // =========================================================================
  function UsersScreen({
    setRoute
  }) {
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Foydalanuvchilar"
      }],
      title: "Foydalanuvchilar",
      sub: D.USERS.length + " ta foydalanuvchi · " + D.ROLES.length + " ta rol",
      actions: [h("div", {
        key: 0,
        className: "input-group",
        style: {
          width: 240
        }
      }, [h(I.Search, {
        className: "icon-l"
      }), h("input", {
        className: "input",
        placeholder: "Ism, lavozim..."
      })]), h(window.FilterButton, {
        key: 1,
        kind: "users"
      }), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => window.__openCreateUser && window.__openCreateUser()
      }, [h(I.Plus, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Yangi foydalanuvchi")])]
    }),
    // Stats
    h("div", {
      key: "s",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 12,
        marginBottom: 16
      }
    }, D.ROLES.map(r => {
      const count = D.USERS.filter(u => u.role === r.id).length;
      return h("div", {
        key: r.id,
        className: "card card__pad-sm",
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 4
        }
      }, [h("div", {
        key: 1,
        className: "cell-sub",
        style: {
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 700
        }
      }, r.short), h("div", {
        key: 2,
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 800,
          color: "var(--text-primary)"
        }
      }, count)]);
    })), h("div", {
      key: "t",
      className: "tbl-wrap"
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 0
    }, h("input", {
      className: "checkbox",
      type: "checkbox"
    })), h("th", {
      key: 1
    }, "Foydalanuvchi"), h("th", {
      key: 2
    }, "Rol"), h("th", {
      key: 3
    }, "Bo‘lim"), h("th", {
      key: 4
    }, "Faol auditlar"), h("th", {
      key: 5
    }, "KPI"), h("th", {
      key: 6
    }, "Oxirgi kirish"), h("th", {
      key: 7
    }, "Holat"), h("th", {
      key: 8,
      className: "cell-actions"
    }, "")])), h("tbody", {
      key: "b"
    }, D.USERS.map((u, i) => {
      const kpi = D.KPI_USERS.find(k => k.user === u.id);
      return h("tr", {
        key: u.id
      }, [h("td", {
        key: 0
      }, h("input", {
        className: "checkbox",
        type: "checkbox"
      })), h("td", {
        key: 1
      }, h("div", {
        className: "cell-title"
      }, [h(Avatar, {
        user: u,
        key: 1,
        size: "lg"
      }), h("div", null, [h("div", {
        key: 1
      }, u.name), h("div", {
        key: 2,
        className: "cell-sub"
      }, "@" + u.id + " · " + u.title)])])), h("td", {
        key: 2
      }, h("span", {
        className: "tag " + (u.role === "departament" ? "tag--brand" : u.role === "bolim" ? "tag--info" : "tag--outline")
      }, u.title)), h("td", {
        key: 3
      }, u.dept), h("td", {
        key: 4
      }, h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, [h("span", {
        key: 1,
        className: "tabular text-primary font-semi"
      }, kpi ? kpi.audits : 0), kpi && kpi.audits > 0 ? h(AvatarStack, {
        key: 2,
        users: ["o1", "o2", "o3"].slice(0, Math.min(kpi.audits, 3)).map(() => u.id)
      }) : null])), h("td", {
        key: 5,
        className: "tabular text-primary font-semi"
      }, kpi ? kpi.total : "—"), h("td", {
        key: 6,
        className: "tabular cell-sub"
      }, ["2 daqiqa", "10 daqiqa", "1 soat", "Bugun 09:42", "2 kun", "Kecha"][i % 6]), h("td", {
        key: 7
      }, h("span", {
        className: "tag tag--success"
      }, [h("span", {
        className: "dot",
        style: {
          width: 6,
          height: 6
        }
      }), "Faol"])), h("td", {
        key: 8,
        className: "cell-actions"
      }, h("div", {
        style: {
          display: "inline-flex",
          gap: 4,
          alignItems: "center"
        }
      }, [h("button", {
        key: 1,
        className: "btn btn--ghost btn--xs btn--icon",
        title: "Tahrirlash",
        onClick: () => window.__openCreateUser && window.__openCreateUser()
      }, h(I.Edit3, {
        key: "i-edit3",
        size: 13
      })), h("button", {
        key: 2,
        className: "btn btn--ghost btn--xs btn--icon",
        title: "Bloklash",
        onClick: async () => {
          const ok = await window.confirmAction({
            title: "Foydalanuvchini bloklash",
            body: u.name + " (" + u.title + ") hisobini bloklamoqchimisiz? U tizimga kira olmaydi, lekin barcha auditlar saqlanadi.",
            confirmLabel: "Bloklash",
            danger: true
          });
          if (ok) window.showToast(u.name + " bloklandi", "warning");
        }
      }, h(I.Lock, {
        key: "i-lock",
        size: 13
      })), h(window.MoreMenu, {
        key: 3,
        items: [{
          label: "Profilni ko'rish",
          icon: I.Eye,
          onClick: () => window.showToast("Profil ochilmoqda...", "info")
        }, {
          label: "Parolni qayta tiklash",
          icon: I.Key,
          onClick: () => window.showToast("Tiklash linki email'ga yuborildi", "success")
        }, {
          label: "Rolni o'zgartirish",
          icon: I.UserCheck,
          onClick: () => window.__openCreateUser && window.__openCreateUser()
        }, {
          label: "KPI hisoboti",
          icon: I.BarChart3,
          onClick: () => window.showToast("KPI hisoboti tayyorlanmoqda...", "info")
        }, {
          sep: true
        }, {
          label: "Hisobni o'chirish",
          icon: I.Trash2,
          danger: true,
          onClick: async () => {
            const ok = await window.confirmAction({
              title: "Hisobni o'chirish",
              body: u.name + " hisobini butunlay o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi.",
              confirmLabel: "O'chirish",
              danger: true
            });
            if (ok) window.showToast(u.name + " o'chirildi", "danger");
          }
        }]
      })]))]);
    }))])))]);
  }
  window.UsersScreen = UsersScreen;

  // =========================================================================
  // PERMISSIONS MATRIX
  // =========================================================================
  function PermissionsScreen({
    setRoute
  }) {
    const [editMode, setEditMode] = useState(false);
    const [overrides, setOverrides] = useState({}); // { "moduleId:col": value }
    const [dirty, setDirty] = useState(false);
    const cycle = ["no", "read", "own", "full"];
    function cellValue(m, col) {
      const key = m.id + ":" + col;
      return overrides[key] != null ? overrides[key] : m[col];
    }
    function cycleCell(m, col) {
      const key = m.id + ":" + col;
      const cur = cellValue(m, col);
      const idx = cycle.indexOf(cur);
      const next = cycle[(idx + 1) % cycle.length];
      setOverrides(o => ({
        ...o,
        [key]: next
      }));
      setDirty(true);
    }
    function discard() {
      setOverrides({});
      setDirty(false);
      setEditMode(false);
    }
    function save() {
      // In a real app, would POST to server. Here we just exit edit mode.
      setDirty(false);
      setEditMode(false);
    }
    const changedCount = Object.keys(overrides).filter(k => {
      const [mid, col] = k.split(":");
      const m = D.PERM_MODULES.find(x => x.id === mid);
      return m && overrides[k] !== m[col];
    }).length;
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Rollar va ruxsatlar"
      }],
      title: "Rollar va ruxsatlar matritsasi",
      sub: "5 ta tizim roli. Vaqtinchalik audit vazifalari (rahbar, auditor, tahlilchi) audit konteksti sifatida ishlaydi va alohida rol emas.",
      actions: editMode ? [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: discard
      }, [h(I.X, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Bekor qilish")]), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: save,
        disabled: !dirty,
        style: !dirty ? {
          opacity: 0.55,
          cursor: "not-allowed"
        } : {}
      }, [h(I.Check, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Saqlash" + (changedCount > 0 ? " (" + changedCount + ")" : ""))])] : [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Ruxsatlar matritsasi XLSX formatda eksport qilindi", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Eksport")]), h("button", {
        key: 2,
        className: "btn btn--secondary btn--sm",
        onClick: () => setEditMode(true)
      }, [h(I.Edit3, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tahrir rejimi")])]
    }),
    // Edit-mode banner
    editMode ? h("div", {
      key: "bn",
      className: "edit-banner"
    }, [h("span", {
      key: 0,
      className: "edit-banner__icon"
    }, h(I.Edit3, {
      size: 14
    })), h("div", {
      key: 1,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      className: "edit-banner__title"
    }, "Tahrir rejimi yoqilgan"), h("div", {
      key: 2,
      className: "edit-banner__sub"
    }, "Ruxsat yacheykasini bosing — qiymat ketma-ket aylanadi: Yo'q → Ko'rish → O'ziga tegishli → To'liq. O'zgarishlar saqlanguncha vaqtinchalik.")]), changedCount > 0 ? h("span", {
      key: 2,
      className: "tag tag--brand"
    }, changedCount + " o'zgarish") : null]) : null,
    // Legend
    h("div", {
      key: "lg",
      className: "card card__pad-sm",
      style: {
        marginBottom: 14,
        display: "flex",
        gap: 18,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, [h("span", {
      key: "l",
      className: "text-sm font-bold text-muted",
      style: {
        textTransform: "uppercase",
        letterSpacing: "0.08em"
      }
    }, "Ko‘rsatkichlar:"), ...[{
      v: "full",
      l: "To‘liq"
    }, {
      v: "read",
      l: "Ko‘rish"
    }, {
      v: "own",
      l: "O‘ziga tegishli"
    }, {
      v: "no",
      l: "Yo‘q"
    }].map(x => h("span", {
      key: x.v,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "var(--text-secondary)"
      }
    }, [h("span", {
      key: 1,
      className: "perm " + D.PERM_VALUES[x.v].className
    }, x.v === "full" ? h(I.Check, {
      key: "i-check",
      size: 14
    }) : x.v === "read" ? h(I.Eye, {
      key: "i-eye",
      size: 14
    }) : x.v === "own" ? h(I.User, {
      key: "i-user",
      size: 14
    }) : h(I.X, {
      key: "i-x",
      size: 14
    })), h("span", {
      key: 2
    }, x.l)]))]), h("div", {
      key: "m",
      className: "tbl-wrap" + (editMode ? " matrix-wrap--edit" : "")
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "matrix"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1,
      style: {
        textAlign: "left"
      }
    }, "Modul / Funksiya"), ...D.ROLES.map(r => h("th", {
      key: r.id
    }, h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center"
      }
    }, [h(r.id === "departament" ? I.ShieldCheck : r.id === "bolim" ? I.Briefcase : r.id === "bosh" ? I.Star : r.id === "yetakchi" ? I.User : I.UserCheck, {
      size: 16,
      key: 1,
      style: {
        color: "var(--brand)"
      }
    }), h("span", {
      key: 2
    }, r.short)])))])), h("tbody", {
      key: "b"
    }, D.PERM_MODULES.map(m => h("tr", {
      key: m.id
    }, [h("th", {
      key: 1
    }, m.name), ...["d", "b", "bs", "y", "t1"].map((col, i) => {
      const v = cellValue(m, col);
      const pv = D.PERM_VALUES[v];
      const icon = v === "full" ? I.Check : v === "read" ? I.Eye : v === "own" ? I.User : I.X;
      const origVal = m[col];
      const changed = editMode && v !== origVal;
      return h("td", {
        key: i
      }, h("span", {
        className: "perm " + pv.className + (editMode ? " perm--editable" : "") + (changed ? " perm--changed" : ""),
        title: editMode ? pv.label + " — bosing: keyingi qiymat" : pv.label,
        role: editMode ? "button" : undefined,
        tabIndex: editMode ? 0 : undefined,
        onClick: editMode ? () => cycleCell(m, col) : undefined,
        onKeyDown: editMode ? e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            cycleCell(m, col);
          }
        } : undefined
      }, h(icon, {
        size: 14
      })));
    })])))])))]);
  }
  window.PermissionsScreen = PermissionsScreen;

  // =========================================================================
  // LOGS SCREEN
  // =========================================================================
  function LogsScreen({
    setRoute,
    embedded
  }) {
    return h("div", null, [embedded ? null : h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Audit loglar"
      }],
      title: "Audit loglar",
      sub: D.LOGS.length + " ta hodisa · oxirgi 24 soat · login, finding, token, sync, AI, KPI",
      actions: [h("div", {
        key: 0,
        className: "input-group",
        style: {
          width: 240
        }
      }, [h(I.Search, {
        className: "icon-l"
      }), h("input", {
        className: "input",
        placeholder: "Action, IP, user..."
      })]), h(window.FilterButton, {
        key: 1,
        kind: "logs"
      }), h("button", {
        key: 2,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Audit loglari CSV formatda yuklab olindi (" + D.LOGS.length + " yozuv)", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Eksport")])]
    }), embedded ? null : h("div", {
      key: "qf",
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 16,
        flexWrap: "wrap"
      }
    }, [h("span", {
      key: 0,
      className: "tag tag--brand"
    }, "Hammasi · " + D.LOGS.length), h("span", {
      key: 1,
      className: "tag tag--outline"
    }, "Login · " + D.LOGS.filter(l => l.action.startsWith("auth")).length), h("span", {
      key: 2,
      className: "tag tag--outline"
    }, "Finding · " + D.LOGS.filter(l => l.action.startsWith("finding")).length), h("span", {
      key: 3,
      className: "tag tag--outline"
    }, "Token · " + D.LOGS.filter(l => l.action.startsWith("token")).length), h("span", {
      key: 4,
      className: "tag tag--outline"
    }, "Agent · " + D.LOGS.filter(l => l.action.startsWith("agent")).length), h("span", {
      key: 5,
      className: "tag tag--warning"
    }, "Xato · " + D.LOGS.filter(l => l.level === "warn").length)]), h("div", {
      key: "t",
      className: "tbl-wrap"
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Vaqt"), h("th", {
      key: 2
    }, "Daraja"), h("th", {
      key: 3
    }, "Foydalanuvchi"), h("th", {
      key: 4
    }, "Action"), h("th", {
      key: 5
    }, "Entity"), h("th", {
      key: 6
    }, "IP / qurilma")])), h("tbody", {
      key: "b"
    }, D.LOGS.map((l, i) => {
      const u = D.userById(l.user);
      return h("tr", {
        key: i
      }, [h("td", {
        key: 1,
        className: "tabular font-mono cell-sub"
      }, l.time), h("td", {
        key: 2
      }, l.level === "warn" ? h("span", {
        className: "tag tag--warning"
      }, "WARN") : h("span", {
        className: "tag tag--ghost"
      }, "INFO")), h("td", {
        key: 3
      }, h("div", {
        className: "cell-title"
      }, [h(Avatar, {
        user: u,
        key: 1
      }), h("div", null, [h("div", {
        key: 1,
        style: {
          fontSize: 13
        }
      }, u.name), h("div", {
        key: 2,
        className: "cell-sub"
      }, "@" + l.user)])])), h("td", {
        key: 4
      }, h("span", {
        className: "font-mono tag " + (l.action.includes("approve") || l.action.includes("create") ? "tag--success" : l.action.includes("fail") ? "tag--danger" : "tag--info")
      }, l.action)), h("td", {
        key: 5,
        className: "font-mono cell-sub"
      }, l.entity), h("td", {
        key: 6
      }, h("div", null, [h("div", {
        key: 1,
        className: "font-mono",
        style: {
          fontSize: 12.5,
          color: "var(--text-primary)"
        }
      }, l.ip), h("div", {
        key: 2,
        className: "cell-sub font-mono"
      }, l.device)]))]);
    }))])))]);
  }
  window.LogsScreen = LogsScreen;

  // =========================================================================
  // REPORTS SCREEN
  // =========================================================================
  function ReportsScreen({
    setRoute
  }) {
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Hisobotlar"
      }],
      title: "Hisobotlar",
      sub: D.REPORTS.length + " ta hisobot · " + D.REPORTS.filter(r => r.status === "draft").length + " qoralama · " + D.REPORTS.filter(r => r.status === "approved").length + " tasdiqlangan",
      actions: [h("div", {
        key: 0,
        className: "input-group",
        style: {
          width: 240
        }
      }, [h(I.Search, {
        className: "icon-l"
      }), h("input", {
        className: "input",
        placeholder: "Hisobot, audit..."
      })]), h(window.FilterButton, {
        key: 1,
        kind: "reports"
      }), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => window.__openCreateReport && window.__openCreateReport()
      }, [h(I.Plus, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Hisobot generatsiya")])]
    }), h("div", {
      key: "g",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 14
      }
    }, D.REPORTS.map(r => h("div", {
      key: r.id,
      className: "card card--hover"
    }, [h("div", {
      key: 1,
      style: {
        padding: "16px 18px 12px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }
    }, [h("div", {
      key: 1,
      style: {
        width: 48,
        height: 56,
        background: "linear-gradient(180deg, var(--bg-surface) 0%, var(--brand-soft) 100%)",
        border: "1px solid var(--border-color)",
        borderRadius: "6px 6px 6px 14px",
        display: "grid",
        placeItems: "center",
        color: "var(--brand)",
        position: "relative"
      }
    }, [h(I.FileText, {
      size: 20,
      key: 1
    }), h("span", {
      key: 2,
      className: "font-mono",
      style: {
        position: "absolute",
        bottom: 4,
        fontSize: 8,
        fontWeight: 700,
        color: "var(--brand)"
      }
    }, r.format[0])]), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: "var(--text-primary)",
        lineHeight: 1.4
      }
    }, r.title), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        marginTop: 4
      }
    }, r.type)]), h(window.MoreMenu, {
      key: 3,
      items: [{
        label: "Hisobotni tahrirlash",
        icon: I.Edit3,
        onClick: () => window.showToast("Hisobot tahrirlash oynasi ochilmoqda...", "info")
      }, {
        label: "PDF preview",
        icon: I.Eye,
        onClick: () => window.showToast("PDF preview ochilmoqda...", "info")
      }, {
        label: "Email orqali yuborish",
        icon: I.Send,
        onClick: () => window.showToast("Hisobot email orqali yuborildi", "success")
      }, {
        label: "AI orqali qayta yaratish",
        icon: I.Sparkles,
        onClick: () => window.showToast("AI orqali qayta yaratish boshlandi (qwen2.5:14b)", "info")
      }, {
        sep: true
      }, {
        label: "Hisobotni o'chirish",
        icon: I.Trash2,
        danger: true,
        onClick: async () => {
          const ok = await window.confirmAction({
            title: "Hisobotni o'chirish",
            body: r.title + " hisobotini o'chirmoqchimisiz?",
            confirmLabel: "O'chirish",
            danger: true
          });
          if (ok) window.showToast("Hisobot o'chirildi", "warning");
        }
      }]
    })]), h("div", {
      key: 2,
      style: {
        padding: "0 18px 12px",
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, [h("span", {
      key: 1,
      className: "font-mono cell-sub"
    }, r.audit), ...r.format.map(f => h("span", {
      key: f,
      className: "tag tag--outline"
    }, f))]), h("div", {
      key: 3,
      style: {
        padding: "12px 18px",
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-surface-2)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, [h(Avatar, {
      user: r.author,
      key: 1
    }), h("div", {
      key: 2
    }, [h("div", {
      key: 1,
      className: "cell-sub",
      style: {
        fontSize: 11
      }
    }, r.generated === "—" ? "Hali yaratilmagan" : r.generated), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11
      }
    }, r.size)])]), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 6,
        alignItems: "center"
      }
    }, [h("span", {
      key: 1,
      className: "tag " + (r.status === "draft" ? "tag--warning" : r.status === "approved" ? "tag--success" : "tag--info")
    }, r.status === "draft" ? "Qoralama" : r.status === "approved" ? "Tasdiqlangan" : "Tekshiruvda"), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs btn--icon",
      title: "Yuklash",
      onClick: () => window.showToast(r.title + " yuklab olinmoqda... (" + r.format[0] + ")", "success")
    }, h(I.Download, {
      key: "i-download",
      size: 13
    }))])])])))]);
  }
  window.ReportsScreen = ReportsScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/screens-admin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/screens-agent.jsx
try { (() => {
/* EXE desktop agent — Windows-style window with internal nav. */
(function () {
  const {
    useState,
    useEffect,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  function AgentScreen({
    setRoute
  }) {
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "EXE agent (demo)"
      }],
      title: "Windows EXE desktop agent",
      sub: "Xodim kompyuteriga o‘rnatiladigan ilova. Audit token bilan kiradi, vazifalarni ochadi, offline ishlaydi va serverga sinxronlanadi.",
      actions: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("AuditorAgent_v1.2.4.exe (28.4 MB) yuklab olinmoqda...", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "EXE yuklab olish")]), h("button", {
        key: 2,
        className: "btn btn--secondary btn--sm",
        onClick: () => window.showToast("Versiyalar tarixi oynasi ochilmoqda...", "info")
      }, [h(I.History, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Versiyalar")])]
    }),
    // Mock window with internal nav
    h("div", {
      key: "w",
      style: {
        display: "flex",
        justifyContent: "center",
        padding: "8px 0 32px"
      }
    }, h(AgentWindow)),
    // Info card
    h("div", {
      key: "i",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14,
        maxWidth: 920,
        margin: "0 auto"
      }
    }, [{
      i: I.KeyRound,
      t: "Token orqali kirish",
      d: "Login-parol + audit token kombinatsiyasi. Token faqat shu auditdagi vazifalarni ochadi."
    }, {
      i: I.WifiOff,
      t: "Offline rejim",
      d: "Lokal shifrlangan SQLite bazasi. Tarmoq bo‘lsa avtomatik sinxronlash, yo‘qolsa navbatga olinadi."
    }, {
      i: I.ShieldCheck,
      t: "Qurilma bog‘lanishi",
      d: "Birinchi ulanishda qurilma hostname + OS + agent versiyasi token bilan bog‘lanadi."
    }].map((c, i) => h("div", {
      key: i,
      className: "card card__pad-sm",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [h("div", {
      key: 1,
      className: "stat__icon",
      style: {
        width: 36,
        height: 36
      }
    }, h(c.i, {
      size: 16
    })), h("div", {
      key: 2,
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, c.t), h("div", {
      key: 3,
      className: "text-sm text-muted",
      style: {
        lineHeight: 1.55
      }
    }, c.d)])))]);
  }
  window.AgentScreen = AgentScreen;

  // ---------- Agent Window ----------
  function AgentWindow() {
    const [view, setView] = useState("tasks"); // login -> token -> tasks/findings/sync
    const [loggedIn, setLoggedIn] = useState(true);
    const [tokenEntered, setTokenEntered] = useState(true);
    const navItems = [{
      id: "tasks",
      label: "Mening vazifalarim",
      icon: I.CheckSquare,
      count: 6
    }, {
      id: "findings",
      label: "Findinglar (lokal)",
      icon: I.AlertTriangle,
      count: 9
    }, {
      id: "files",
      label: "Fayllar",
      icon: I.Folder
    }, {
      id: "sync",
      label: "Sinxronlash",
      icon: I.Refresh,
      count: 3
    }, {
      id: "log",
      label: "Lokal log",
      icon: I.History
    }, {
      id: "settings",
      label: "Sozlamalar",
      icon: I.Settings
    }];
    let body;
    if (!loggedIn) body = h(AgentLogin, {
      onNext: () => setLoggedIn(true)
    });else if (!tokenEntered) body = h(AgentToken, {
      onNext: () => setTokenEntered(true)
    });else if (view === "tasks") body = h(AgentTasks);else if (view === "findings") body = h(AgentFinding);else if (view === "files") body = h(AgentFiles);else if (view === "sync") body = h(AgentSync);else if (view === "log") body = h(AgentLog);else body = h(AgentSettings, {
      onLogout: () => {
        setLoggedIn(false);
        setTokenEntered(false);
      }
    });
    return h("div", {
      className: "win"
    }, [
    // Title bar
    h("div", {
      className: "win__title",
      key: 1
    }, [h(I.ShieldCheck, {
      size: 14,
      key: 1
    }), h("span", {
      className: "win__title-text",
      key: 2
    }, "Auditor Agent — v1.2.4 · Bobur Mirzayev · AUD-2026-014"), h("div", {
      className: "win__btns",
      key: 3
    }, [h("button", {
      key: 1,
      className: "win__btn"
    }, h("svg", {
      width: 12,
      height: 12,
      viewBox: "0 0 12 12"
    }, h("path", {
      d: "M2 6h8",
      stroke: "currentColor",
      strokeWidth: 1
    }))), h("button", {
      key: 2,
      className: "win__btn"
    }, h("svg", {
      width: 12,
      height: 12,
      viewBox: "0 0 12 12"
    }, h("path", {
      d: "M2 2h8v8H2z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1
    }))), h("button", {
      key: 3,
      className: "win__btn win__btn--close"
    }, h(I.X, {
      key: "i-x",
      size: 12
    }))])]),
    // Body
    h("div", {
      className: "win__body",
      key: 2
    }, [loggedIn && tokenEntered ? h("aside", {
      className: "win__nav",
      key: 1
    }, [h("div", {
      key: "tk",
      style: {
        padding: "10px",
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        background: "var(--bg-surface)",
        marginBottom: 10
      }
    }, [h("div", {
      key: 1,
      className: "cell-sub",
      style: {
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 700
      }
    }, "Audit token"), h("div", {
      key: 2,
      className: "font-mono",
      style: {
        fontSize: 11,
        color: "var(--text-primary)",
        fontWeight: 600,
        marginTop: 4
      }
    }, "tk_a91x…c47e"), h("div", {
      key: 3,
      className: "cell-sub",
      style: {
        fontSize: 10,
        marginTop: 2
      }
    }, "31.05.2026 18:00 gacha")]), ...navItems.map(n => h("button", {
      key: n.id,
      className: "navitem" + (view === n.id ? " is-active" : ""),
      onClick: () => setView(n.id)
    }, [h(n.icon, {
      key: 1,
      size: 14
    }), h("span", {
      className: "label",
      key: 2
    }, n.label), n.count ? h("span", {
      className: "count",
      key: 3
    }, n.count) : null]))]) : null, h("section", {
      className: "win__main",
      key: 2
    }, body)]),
    // Status bar
    h("div", {
      className: "win__status",
      key: 3
    }, [h("span", {
      key: 1,
      className: "seg"
    }, [h("span", {
      key: 1,
      className: "dot",
      style: {
        background: "var(--green-500)"
      }
    }), loggedIn && tokenEntered ? "Onlayn · server bilan aloqada" : "Avtorizatsiyada..."]), h("span", {
      key: 2,
      className: "seg"
    }, "Sync: 12 daqiqa oldin"), h("span", {
      key: 3,
      className: "seg"
    }, "Qoralama: 0"), h("span", {
      key: 4,
      className: "seg"
    }, "Yuborilmagan: 3"), h("span", {
      key: 5,
      className: "seg",
      style: {
        marginLeft: "auto"
      }
    }, "Bobur Mirzayev · 10.20.4.142"), h("span", {
      key: 6,
      className: "seg"
    }, "v1.2.4")])]);
  }
  function AgentLogin({
    onNext
  }) {
    return h("div", {
      style: {
        maxWidth: 360,
        margin: "20px auto"
      }
    }, [h("div", {
      key: 1,
      style: {
        textAlign: "center",
        marginBottom: 24
      }
    }, [h("div", {
      key: 1,
      className: "brand-mark",
      style: {
        width: 48,
        height: 48,
        margin: "0 auto 12px"
      }
    }, h(I.ShieldCheck, {
      key: "i-shieldcheck",
      size: 26
    })), h("h3", {
      key: 2,
      style: {
        fontSize: 18
      }
    }, "Auditor Agent"), h("p", {
      key: 3,
      className: "cell-sub",
      style: {
        fontSize: 12,
        marginTop: 4
      }
    }, "Lokal akkaunt bilan kiring")]), h("form", {
      key: 2,
      onSubmit: e => {
        e.preventDefault();
        onNext();
      },
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, [h("label", {
      key: 1,
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "Login"), h("input", {
      key: 2,
      className: "input",
      defaultValue: "b.mirzayev"
    }), h("label", {
      key: 3,
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "Parol"), h("input", {
      key: 4,
      className: "input",
      type: "password",
      defaultValue: "••••••••••"
    }), h("button", {
      key: 5,
      type: "submit",
      className: "btn btn--primary",
      style: {
        marginTop: 8
      }
    }, [h(I.LogIn, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Kirish")])])]);
  }
  function AgentToken({
    onNext
  }) {
    return h("div", {
      style: {
        maxWidth: 420,
        margin: "20px auto",
        textAlign: "center"
      }
    }, [h(I.KeyRound, {
      size: 36,
      key: 1,
      style: {
        color: "var(--brand)",
        margin: "0 auto 12px"
      }
    }), h("h3", {
      key: 2,
      style: {
        fontSize: 16
      }
    }, "Audit tokenni kiriting"), h("p", {
      key: 3,
      className: "text-sm text-muted",
      style: {
        marginTop: 6
      }
    }, "Token web tizimda audit kartasidan olinadi. Token faqat shu audit doirasidagi vazifalarni ochadi."), h("input", {
      key: 4,
      className: "input font-mono",
      style: {
        marginTop: 16,
        textAlign: "center",
        fontSize: 14,
        letterSpacing: "0.12em"
      },
      defaultValue: "tk_a91x...c47e"
    }), h("button", {
      key: 5,
      className: "btn btn--primary",
      style: {
        marginTop: 16,
        width: "100%"
      },
      onClick: onNext
    }, [h(I.Check, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Tasdiqlash va vazifalarni yuklash")])]);
  }
  function AgentTasks() {
    return h("div", null, [h("div", {
      key: "h",
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 14
      }
    }, [h("div", null, [h("h3", {
      key: 1,
      style: {
        fontSize: 17
      }
    }, "Mening vazifalarim"), h("p", {
      key: 2,
      className: "cell-sub",
      style: {
        marginTop: 4
      }
    }, "6 ta vazifa · 2 jarayonda · 3 yangi · oxirgi yangilash 12 daqiqa oldin")]), h("button", {
      className: "btn btn--soft btn--sm",
      onClick: () => window.showToast("Server bilan sinxronlash boshlandi...", "info")
    }, [h(I.Refresh, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Sync")])]), h("div", {
      key: "l",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, D.TASKS.filter(t => t.assignee === "u6" || t.assignee === "u3").slice(0, 6).map(t => h("div", {
      key: t.id,
      className: "lrow"
    }, [h("input", {
      key: 1,
      type: "checkbox",
      className: "checkbox",
      defaultChecked: t.status === "done"
    }), h("div", {
      key: 2,
      className: "lrow__body"
    }, [h("div", {
      key: 1,
      className: "lrow__title"
    }, t.title), h("div", {
      key: 2,
      className: "lrow__sub"
    }, [h("span", {
      key: 1,
      className: "font-mono"
    }, t.id), " · " + t.type + " · ", h("span", {
      key: 2,
      style: {
        color: t.priority === "Yuqori" ? "var(--status-danger-fg)" : "var(--text-tertiary)"
      }
    }, t.priority)])]), h("div", {
      key: 3,
      className: "lrow__meta"
    }, [h("span", {
      key: 1,
      className: "tag " + (t.status === "done" ? "tag--success" : t.status === "in_progress" ? "tag--info" : t.status === "blocked" ? "tag--danger" : "tag--ghost")
    }, D.TASK_STATUS[t.status].label), t.findings ? h("span", {
      key: 2,
      className: "cell-sub"
    }, [h(I.AlertTriangle, {
      size: 11,
      style: {
        marginRight: 3,
        verticalAlign: -1
      }
    }), t.findings]) : null, h(I.ChevronRight, {
      size: 14,
      key: 3,
      style: {
        color: "var(--text-tertiary)"
      }
    })])])))]);
  }
  function AgentFinding() {
    return h("div", null, [h("div", {
      key: "h",
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 14
      }
    }, [h("div", null, [h("h3", {
      key: 1,
      style: {
        fontSize: 17
      }
    }, "Yangi finding"), h("p", {
      key: 2,
      className: "cell-sub",
      style: {
        marginTop: 4
      }
    }, "T-114 · Firewall qoidalari va segmentatsiyani tahlil qilish")]), h("span", {
      className: "tag tag--warning"
    }, [h(I.WifiOff, {
      key: "i",
      size: 11
    }), "Lokal qoralama"])]), h("div", {
      key: "f",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, [h("div", {
      key: 1,
      className: "field"
    }, [h("label", {
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "Sarlavha"), h("input", {
      className: "input",
      defaultValue: "Internal segment 10.0.0.0/8 ga to‘liq ruxsat berilgan"
    })]), h("div", {
      key: 2,
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10
      }
    }, [h("div", {
      className: "field",
      key: 1
    }, [h("label", {
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "Xavf darajasi"), h("select", {
      className: "select"
    }, [h("option", {
      key: 1
    }, "Critical"), h("option", {
      key: 2
    }, "High"), h("option", {
      key: 3
    }, "Medium"), h("option", {
      key: 4
    }, "Low")])]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "CVSS 3.1"), h("input", {
      className: "input tabular",
      defaultValue: "9.1"
    })]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "CWE"), h("input", {
      className: "input font-mono",
      defaultValue: "CWE-284"
    })])]), h("div", {
      key: 3,
      className: "field"
    }, [h("label", {
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "Asset"), h("input", {
      className: "input font-mono",
      defaultValue: "FW-CORE-01"
    })]), h("div", {
      key: 4,
      className: "field"
    }, [h("label", {
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "Tavsif"), h("textarea", {
      className: "textarea",
      defaultValue: "Asosiy firewall qoidalarida 10.0.0.0/8 manzilidan barcha portlarga TCP+UDP ruxsat berilgan. Segmentatsiya prinsiplari buzilgan.",
      style: {
        minHeight: 70
      }
    })]), h("div", {
      key: 5,
      className: "field"
    }, [h("label", {
      className: "field__label",
      style: {
        fontSize: 12
      }
    }, "Dalillar (3)"), h("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, [h("span", {
      key: 1,
      className: "tag tag--ghost"
    }, [h(I.Image, {
      key: "i",
      size: 11
    }), "screenshot-1.png"]), h("span", {
      key: 2,
      className: "tag tag--ghost"
    }, [h(I.FileText, {
      key: "i",
      size: 11
    }), "fw-config.txt"]), h("span", {
      key: 3,
      className: "tag tag--ghost"
    }, [h(I.Activity, {
      key: "i",
      size: 11
    }), "tcpdump.pcap"]), h("button", {
      key: 4,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info")
    }, [h(I.Paperclip, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Biriktirish")])])]), h("div", {
      key: 6,
      style: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 4
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--ghost btn--sm",
      onClick: () => window.showToast("Finding qoralamasi bekor qilindi", "info")
    }, "Bekor"), h("button", {
      key: 2,
      className: "btn btn--soft btn--sm",
      onClick: () => window.showToast("Finding lokal saqlandi — sinxronlash kutilmoqda", "info")
    }, [h(I.Save, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Lokal saqlash")]), h("button", {
      key: 3,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("Finding serverga yuborildi (F-2026-0348)", "success")
    }, [h(I.Send, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Yuborish")])])])]);
  }
  function AgentFiles() {
    return h("div", null, [h("h3", {
      key: 1,
      style: {
        fontSize: 17,
        marginBottom: 14
      }
    }, "Lokal fayllar"), h("p", {
      key: 2,
      className: "cell-sub",
      style: {
        marginBottom: 14
      }
    }, "Lokal shifrlangan SQLite + fayl bazasida saqlanadi. Tarmoq tiklangach avtomatik yuboriladi."), h("div", {
      key: 3,
      className: "tile-grid",
      style: {
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))"
      }
    }, [{
      n: "fw-rule-perm.png",
      m: "1.2 MB · synced",
      ico: I.Image,
      color: "info"
    }, {
      n: "fw-core-01.cfg",
      m: "412 KB · synced",
      ico: I.Server,
      color: "brand"
    }, {
      n: "telnet-banners.png",
      m: "880 KB · pending",
      ico: I.Image,
      color: "warning"
    }, {
      n: "nessus-internal.csv",
      m: "1.4 MB · synced",
      ico: I.Bug,
      color: "warning"
    }, {
      n: "tcpdump-dns.pcap",
      m: "94 MB · uploading",
      ico: I.Activity,
      color: "info"
    }, {
      n: "ad-policy.txt",
      m: "2.1 KB · queued",
      ico: I.FileText,
      color: "ghost"
    }].map((f, i) => h("div", {
      key: i,
      className: "tile"
    }, [h("div", {
      key: 1,
      className: "tile__thumb"
    }, h(f.ico, {
      size: 24,
      style: {
        color: "var(--text-tertiary)"
      }
    })), h("div", {
      key: 2,
      className: "tile__body"
    }, [h("div", {
      key: 1,
      className: "tile__name font-mono"
    }, f.n), h("div", {
      key: 2,
      className: "tile__meta"
    }, f.m)])])))]);
  }
  function AgentSync() {
    return h("div", null, [h("div", {
      key: 1,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14
      }
    }, [h("div", null, [h("h3", {
      key: 1,
      style: {
        fontSize: 17
      }
    }, "Sinxronlash"), h("p", {
      key: 2,
      className: "cell-sub"
    }, "Server bilan ma‘lumotlarni almashtirish navbati")]), h("button", {
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("Sinxronlash boshlandi — 6 vazifa server bilan ulashilmoqda", "info")
    }, [h(I.Refresh, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Hozir sinxronla")])]),
    // Status banner
    h("div", {
      key: 2,
      className: "card card__pad-sm",
      style: {
        background: "var(--status-success-bg)",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, [h("div", {
      key: 1,
      style: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "var(--green-500)",
        display: "grid",
        placeItems: "center",
        color: "white"
      }
    }, h(I.Wifi, {
      key: "i-wifi",
      size: 14
    })), h("div", {
      key: 2,
      style: {
        flex: 1
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "var(--status-success-fg)"
      }
    }, "Onlayn · server bilan aloqada"), h("div", {
      key: 2,
      className: "cell-sub"
    }, "Oxirgi muvaffaqiyatli sinxronlash: 12 daqiqa oldin · 4 finding, 2 fayl yuborildi")])]),
    // Queue
    h("div", {
      key: 3,
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Upload, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Yuborish navbati (3)")]), h("span", {
      className: "cell-sub",
      key: 2
    }, "AUD-2026-014")]), h("div", {
      className: "panel__body panel__body--flush",
      key: 2
    }, [{
      item: "F-LOCAL-3a92 — RDP NLA off, 3 server",
      status: "uploading",
      progress: 64,
      size: "12 KB"
    }, {
      item: "screenshot-fw-rule.png",
      status: "queued",
      progress: 0,
      size: "1.2 MB"
    }, {
      item: "Vazifa T-118 — status: bajarilgan",
      status: "queued",
      progress: 0,
      size: "1 KB"
    }].map((q, i, arr) => h("div", {
      key: i,
      style: {
        padding: "10px 14px",
        borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none"
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8
      }
    }, [h("span", {
      key: 1,
      style: {
        fontSize: 13,
        color: "var(--text-primary)"
      }
    }, q.item), h("span", {
      key: 2,
      className: "tag " + (q.status === "uploading" ? "tag--info" : "tag--ghost"),
      style: {
        fontSize: 10
      }
    }, q.status === "uploading" ? "Yuborilmoqda " + q.progress + "%" : "Navbatda")]), h("div", {
      key: 2,
      style: {
        marginTop: 6,
        display: "flex",
        gap: 8,
        alignItems: "center"
      }
    }, [h("div", {
      key: 1,
      className: "progress",
      style: {
        flex: 1,
        height: 4
      }
    }, h("span", {
      style: {
        width: q.progress + "%"
      }
    })), h("span", {
      key: 2,
      className: "cell-sub tabular"
    }, q.size)])])))]), h("div", {
      key: 4,
      style: {
        marginTop: 14
      }
    }, h("h4", {
      style: {
        fontSize: 13,
        marginBottom: 6
      }
    }, "Oxirgi sinxronlash loglari")), h("pre", {
      key: 5,
      className: "code-block"
    }, ["[10:28:12] INFO  Sync session started", "[10:28:12] INFO  Server reachable (200ms)", "[10:28:13] INFO  Auth check — token tk_a91x...c47e OK", "[10:28:13] INFO  Pulling task updates (3 changed)", "[10:28:14] INFO  Uploading findings (4 new)", "[10:28:18] INFO  Uploading evidence files (2)", "[10:28:23] INFO  Sync session completed in 11.4s"].join("\n"))]);
  }
  function AgentLog() {
    return h("div", null, [h("h3", {
      key: 1,
      style: {
        fontSize: 17,
        marginBottom: 14
      }
    }, "Lokal log"), h("pre", {
      key: 2,
      className: "code-block"
    }, ["[10:42:14] INFO  Finding F-LOCAL-3a92 created (RDP NLA off)", "[10:39:01] INFO  Task T-118 status changed: new → in_progress", "[10:35:48] INFO  Evidence attached: screenshot-fw-rule.png", "[10:28:23] INFO  Sync session completed (success)", "[10:28:12] INFO  Sync session started", "[10:11:42] WARN  Network unreachable — entering offline mode", "[10:11:08] INFO  User authenticated locally", "[10:10:55] INFO  Audit token validated (tk_a91x...c47e)", "[10:10:42] INFO  Application started — v1.2.4", "[10:10:42] INFO  Local DB integrity check: OK (checksum match)"].join("\n"))]);
  }
  function AgentSettings({
    onLogout
  }) {
    return h("div", null, [h("h3", {
      key: 1,
      style: {
        fontSize: 17,
        marginBottom: 14
      }
    }, "Sozlamalar"), h("div", {
      key: 2,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h(SettingRow, {
      label: "Server manzili",
      value: "https://audit.gov.uz:8443"
    }), h(SettingRow, {
      label: "Sinxronlash davri",
      value: "Har 5 daqiqada"
    }), h(SettingRow, {
      label: "Lokal shifrlash",
      value: "AES-256-GCM (yoqilgan)",
      success: true
    }), h(SettingRow, {
      label: "Agent versiyasi",
      value: "v1.2.4 (eng so‘nggi)",
      success: true
    }), h(SettingRow, {
      label: "Avtomatik yangilanish",
      value: "Yoqilgan"
    })]), h("div", {
      key: 3,
      style: {
        marginTop: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        borderTop: "1px solid var(--border-color)"
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--danger btn--sm",
      onClick: onLogout
    }, [h(I.LogOut, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Logout & token bekor qilish")]), h("span", {
      className: "cell-sub",
      key: 2
    }, "© 2026 Audit boshqaruvi")])]);
  }
  function SettingRow({
    label,
    value,
    success
  }) {
    return h("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 10,
        borderBottom: "1px solid var(--border-color)"
      }
    }, [h("span", {
      key: 1,
      style: {
        fontSize: 13,
        color: "var(--text-secondary)"
      }
    }, label), h("span", {
      key: 2,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: success ? "var(--status-success-fg)" : "var(--text-primary)",
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }
    }, [success ? h(I.Check, {
      size: 13,
      key: "i"
    }) : null, h("span", {
      key: "v"
    }, value)])]);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/screens-agent.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/screens-audit.jsx
try { (() => {
/* Audit card detail (multi-tab) + Findings list + Findings drawer. */
(function () {
  const {
    useState,
    useMemo,
    useEffect,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // AUDIT DETAIL
  // =========================================================================
  function AuditDetailScreen({
    auditId,
    role,
    setRoute,
    openFinding,
    openTask,
    showAI
  }) {
    const a = D.auditById(auditId) || D.AUDITS[0];
    const [tab, setTab] = useState("overview");
    const tabs = [{
      id: "overview",
      label: "Umumiy",
      icon: I.LayoutDashboard
    }, {
      id: "project",
      label: "Audit loyihasi",
      icon: I.Map
    }, {
      id: "tasks",
      label: "Vazifalar",
      icon: I.CheckSquare,
      count: a.tasks.total
    }, {
      id: "findings",
      label: "Findinglar",
      icon: I.AlertTriangle,
      count: a.findings.critical + a.findings.high + a.findings.medium + a.findings.low
    }, {
      id: "files",
      label: "Fayllar & dalillar",
      icon: I.Folder
    }, {
      id: "tokens",
      label: "Tokenlar",
      icon: I.KeyRound
    }, {
      id: "ai",
      label: "AI tahlil",
      icon: I.Sparkles
    }, {
      id: "kpi",
      label: "KPI",
      icon: I.Trophy
    }, {
      id: "reports",
      label: "Hisobotlar",
      icon: I.FileText
    }, {
      id: "log",
      label: "Audit log",
      icon: I.History
    }];
    return h("div", null, [
    // Page header
    h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Auditlar",
        onClick: () => setRoute("audits")
      }, {
        label: a.code
      }],
      title: a.title,
      sub: h("div", {
        style: {
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap"
        }
      }, [h("span", {
        key: "c",
        className: "font-mono",
        style: {
          color: "var(--text-tertiary)"
        }
      }, a.code), h("span", {
        key: "s1"
      }, "·"), statusTag(a.status), h("span", {
        key: "s2"
      }, "·"), h("span", {
        key: "o"
      }, D.orgById(a.org).name), h("span", {
        key: "s3"
      }, "·"), h("span", {
        key: "d"
      }, a.startDate + " → " + a.endDate)]),
      actions: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast(a.code + " PDF + DOCX formatlarda yuklab olindi", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Eksport")]), h("button", {
        key: 2,
        className: "btn btn--secondary btn--sm",
        onClick: () => {
          setRoute && setRoute("ai");
        }
      }, [h(I.Sparkles, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "AI hisobot")]), (role === "departament" || role === "bolim") && a.status === "review" ? h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: async () => {
          const ok = await window.confirmAction({
            title: "Auditni tasdiqlash",
            body: a.code + " auditini yakuniy tasdiqlamoqchimisiz? Tasdiqlangach hisobot tashkilotga yuboriladi.",
            confirmLabel: "Tasdiqlash"
          });
          if (ok) window.showToast(a.code + " tasdiqlandi va tashkilotga yuborildi", "success");
        }
      }, [h(I.Check, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tasdiqlash")]) : h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: () => window.showToast("Audit tekshiruvga yuborildi — bo'lim boshlig'i e'tibor beradi", "info")
      }, [h(I.Send, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tekshiruvga")])]
    }),
    // Workflow stepper
    h("div", {
      key: "step",
      className: "card card__pad-sm",
      style: {
        marginBottom: 16
      }
    }, h("div", {
      className: "stepper"
    }, D.WORKFLOW.flatMap((s, i) => [i > 0 ? h("span", {
      key: "sep" + i,
      className: "stepper__sep"
    }) : null, h("div", {
      key: s.key,
      className: "stepper__node " + (s.n < a.stage ? "stepper__node--done" : s.n === a.stage ? "stepper__node--current" : ""),
      title: s.title
    }, [h("span", {
      key: 1,
      className: "stepper__num"
    }, s.n), h("span", {
      key: 2
    }, s.title)])]))),
    // Tabs
    h(Tabs, {
      key: "t",
      tabs,
      active: tab,
      onChange: setTab
    }),
    // Tab body
    tab === "overview" ? h(AuditOverview, {
      a,
      openFinding,
      openTask,
      setRoute,
      setTab,
      showAI
    }) : tab === "project" ? h(AuditProject, {
      a,
      role
    }) : tab === "tasks" ? h(AuditTasks, {
      a,
      openTask
    }) : tab === "findings" ? h(AuditFindings, {
      a,
      openFinding
    }) : tab === "files" ? h(AuditFiles, {
      a
    }) : tab === "tokens" ? h(AuditTokens, {
      a
    }) : tab === "ai" ? h(AuditAI, {
      a
    }) : tab === "kpi" ? h(AuditKPI, {
      a
    }) : tab === "reports" ? h(AuditReports, {
      a
    }) : h(AuditLog, {
      a
    })]);
  }
  window.AuditDetailScreen = AuditDetailScreen;

  // ------ Overview tab ------
  function AuditOverview({
    a,
    openFinding,
    openTask,
    setRoute,
    setTab,
    showAI
  }) {
    const totFindings = a.findings.critical + a.findings.high + a.findings.medium + a.findings.low;
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [
    // LEFT
    h("div", {
      key: "L",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Stats
    h("div", {
      key: "s",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12
      }
    }, [h(Stat, {
      key: 1,
      icon: I.CheckSquare,
      label: "Vazifalar",
      value: a.tasks.done + "/" + a.tasks.total,
      meta: a.tasks.in_progress + " jarayonda · " + a.tasks.blocked + " blok",
      bar: Math.round(a.tasks.done / a.tasks.total * 100)
    }), h(Stat, {
      key: 2,
      icon: I.AlertTriangle,
      label: "Findinglar",
      value: totFindings,
      meta: a.findings.critical + " critical · " + a.findings.high + " high"
    }), h(Stat, {
      key: 3,
      icon: I.Users,
      label: "Guruh",
      value: a.members.length,
      meta: "Rahbar: " + D.userById(a.leader).name
    }), h(Stat, {
      key: 4,
      icon: I.Activity,
      label: "Oxirgi sync",
      value: a.lastSync.split(" ")[0],
      meta: a.lastSync.split(" ").slice(1).join(" ") || "—"
    })]),
    // Workflow timeline (full)
    h("div", {
      key: "tl",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t",
      key: "t"
    }, [h(I.GitBranch, {
      key: "i",
      size: 15
    }), h("span", {
      key: "s"
    }, "Audit jarayoni — 10 bosqich")]), h("span", {
      key: "s",
      className: "tag tag--info"
    }, "Bosqich " + a.stage + "/10")]), h("div", {
      className: "panel__body",
      key: 2
    }, h("div", {
      className: "timeline"
    }, D.WORKFLOW.map(s => h("div", {
      key: s.key,
      className: "timeline__item " + (s.n < a.stage ? "timeline__item--done" : s.n === a.stage ? "timeline__item--current" : "")
    }, [h("div", {
      key: "d",
      className: "timeline__dot"
    }, s.n < a.stage ? h(I.Check, {
      key: "i-check",
      size: 14
    }) : s.n), h("div", {
      key: "b",
      className: "timeline__body"
    }, [h("div", {
      key: 1,
      className: "timeline__title"
    }, [h("span", {
      key: 1
    }, s.title), s.n === a.stage ? h("span", {
      key: 2,
      className: "tag tag--info"
    }, "Joriy bosqich") : null]), h("div", {
      key: 2,
      className: "timeline__meta"
    }, s.who), h("div", {
      key: 3,
      className: "timeline__desc"
    }, s.short)])]))))]),
    // Critical findings preview
    h("div", {
      key: "cf",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t",
      key: "t"
    }, [h(I.AlertTriangle, {
      key: "i",
      size: 15,
      style: {
        color: "var(--status-danger-fg)"
      }
    }), h("span", {
      key: "s"
    }, "Yuqori xavfli findinglar")]), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => setTab("findings")
    }, [h("span", {
      key: "t"
    }, "Hammasi"), h(I.ChevronRight, {
      key: "i-chevronright",
      size: 12
    })])]), h("div", {
      className: "panel__body panel__body--flush",
      key: 2
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Severity"), h("th", {
      key: 2
    }, "Finding"), h("th", {
      key: 3
    }, "Asset"), h("th", {
      key: 4
    }, "CVSS"), h("th", {
      key: 5
    }, "Status")])), h("tbody", {
      key: "b"
    }, D.FINDINGS.filter(f => f.auditId === a.id).filter(f => f.severity === "critical" || f.severity === "high").slice(0, 5).map(f => h("tr", {
      key: f.id,
      onClick: () => openFinding(f.id)
    }, [h("td", {
      key: 1
    }, h(Sev, {
      level: f.severity
    })), h("td", {
      key: 2
    }, h("div", null, [h("div", {
      key: 1,
      className: "text-primary font-semi"
    }, f.title), h("div", {
      key: 2,
      className: "cell-sub font-mono"
    }, f.id)])), h("td", {
      key: 3,
      className: "font-mono",
      style: {
        fontSize: 12
      }
    }, f.asset), h("td", {
      key: 4,
      className: "tabular font-bold text-primary"
    }, f.cvss), h("td", {
      key: 5
    }, statusTag(f.status === "approved" ? "approved" : "review"))])))])))])]),
    // RIGHT
    h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Severity donut
    h("div", {
      key: "sev",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t",
      key: "t"
    }, [h(I.PieChart, {
      key: "i",
      size: 15
    }), h("span", {
      key: "s"
    }, "Findinglar — xavf darajalari")])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 20
      }
    }, [h(Donut, {
      key: "d",
      items: [{
        value: a.findings.critical,
        color: "#f87171"
      }, {
        value: a.findings.high,
        color: "#fbbf24"
      }, {
        value: a.findings.medium,
        color: "#38bdf8"
      }, {
        value: a.findings.low,
        color: "#94a3b8"
      }]
    }), h("div", {
      key: "l",
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [["Critical", a.findings.critical, "#f87171"], ["High", a.findings.high, "#fbbf24"], ["Medium", a.findings.medium, "#38bdf8"], ["Low", a.findings.low, "#94a3b8"]].map(([l, v, c]) => h("div", {
      key: l,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, [h("span", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13
      }
    }, [h("span", {
      key: "d",
      style: {
        width: 10,
        height: 10,
        borderRadius: 3,
        background: c
      }
    }), h("span", {
      key: "l"
    }, l)]), h("span", {
      key: 2,
      className: "font-mono font-bold tabular"
    }, v)])))])]),
    // Group
    h("div", {
      key: "g",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t",
      key: "t"
    }, [h(I.Users, {
      key: "i",
      size: 15
    }), h("span", {
      key: "s"
    }, "Audit guruhi")]), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("Foydalanuvchi tanlash oynasi ochilmoqda...", "info")
    }, [h(I.Plus, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "A‘zo qo‘shish")])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, a.members.map((uid, i) => {
      const u = D.userById(uid);
      const duty = i === 0 ? "Guruh rahbari" : i === 1 ? "Auditor · Konfiguratsiya" : i === 2 ? "Auditor · Skaner" : "Auditor · Trafik";
      return h("div", {
        key: uid,
        style: {
          padding: "10px 14px",
          borderBottom: i < a.members.length - 1 ? "1px solid var(--border-color)" : "none",
          display: "flex",
          alignItems: "center",
          gap: 12
        }
      }, [h(Avatar, {
        key: 1,
        user: u,
        size: "lg"
      }), h("div", {
        key: 2,
        style: {
          flex: 1,
          minWidth: 0
        }
      }, [h("div", {
        key: 1,
        style: {
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)"
        }
      }, u.name), h("div", {
        key: 2,
        className: "cell-sub"
      }, u.title)]), h("div", {
        key: 3,
        style: {
          textAlign: "right"
        }
      }, [i === 0 ? h("span", {
        className: "tag tag--brand"
      }, "Rahbar") : h("span", {
        className: "tag tag--outline"
      }, "Auditor"), h("div", {
        key: 2,
        className: "cell-sub",
        style: {
          marginTop: 4
        }
      }, duty)])]);
    }))]), showAI ? h("div", {
      key: "ai",
      className: "ai-card"
    }, h("div", {
      className: "ai-card__inner"
    }, [h("div", {
      className: "ai-card__head",
      key: 1
    }, [h("div", {
      className: "ai-card__icon",
      key: "i"
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 15
    })), h("span", {
      className: "ai-card__title",
      key: "t"
    }, "AI xulosa (executive)")]), h("p", {
      className: "ai-card__body",
      key: 2
    }, "Audit obyekti perimetri va ichki segmentatsiyada bir nechta jiddiy kamchilik aniqlandi. Eng asosiy xavf — flat tarmoq strukturasi va SQL injection imkoniyati. Ushbu ikkita findingni birinchi navbatda yopib, qolganlarini rejali ravishda yopish tavsiya etiladi."), h("div", {
      key: 3,
      style: {
        display: "flex",
        gap: 8,
        marginTop: 12
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--soft btn--sm",
      onClick: () => setTab("ai")
    }, [h(I.Sparkles, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "To‘liq tahlil")]), h("button", {
      key: 2,
      className: "btn btn--ghost btn--sm",
      onClick: () => {
        try {
          navigator.clipboard && navigator.clipboard.writeText("Audit obyekti perimetri va ichki segmentatsiyada bir nechta jiddiy kamchilik aniqlandi...");
        } catch (e) {}
        window.showToast("AI matni buferga ko'chirildi", "success");
      }
    }, [h(I.Copy, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Nusxa olish")])])])) : null])]);
  }

  // ------ Project tab ------
  function AuditProject({
    a,
    role
  }) {
    const stages = [{
      n: 1,
      title: "Tayyorgarlik va doirani aniqlash",
      desc: "Tashkilot bilan kirish suhbati, qamrov hujjati, NDA va kirish ruxsatlari.",
      status: "done"
    }, {
      n: 2,
      title: "Tarmoq va perimetr inventarizatsiyasi",
      desc: "Aktivlar ro‘yxati, tashqi va ichki diapazonlar, kritik tizimlar xaritasi.",
      status: "done"
    }, {
      n: 3,
      title: "Konfiguratsiya tahlili",
      desc: "Firewall, switch, router, VPN gateway konfiguratsiya fayllarini tekshirish.",
      status: "in_progress"
    }, {
      n: 4,
      title: "Skaner: avtomatlashtirilgan zaiflik aniqlash",
      desc: "Nessus / OpenVAS / OWASP ZAP yordamida ichki va tashqi skanerlash.",
      status: "in_progress"
    }, {
      n: 5,
      title: "Trafik va log tahlili",
      desc: "PCAP / NetFlow va IDS/IPS loglar bo‘yicha shubhali harakatlar tahlili.",
      status: "new"
    }, {
      n: 6,
      title: "Hisobot va remediation plan",
      desc: "Yakuniy hisobot, executive summary va texnik remediation tavsiyalari.",
      status: "new"
    }];
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [h("div", {
      key: "L",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h("div", {
      key: "i",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Map, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Audit loyihasi")]), h("span", {
      className: "tag tag--success",
      key: 2
    }, [h(I.Check, {
      key: "i",
      size: 11
    }), "Tasdiqlangan"])]), h("div", {
      className: "panel__body",
      key: 2
    }, [h("div", {
      className: "form-grid",
      key: "f"
    }, [h("div", {
      key: 1,
      className: "field span-2"
    }, [h("span", {
      className: "field__label"
    }, "Audit maqsadi"), h("p", {
      style: {
        fontSize: 13.5,
        color: "var(--text-secondary)",
        lineHeight: 1.6
      }
    }, "Aloqa va kommunikatsiya vazirligi axborot tizimlarining xavfsizligi holatini baholash, ichki/tashqi perimetr, server infratuzilmasi, tarmoq qurilmalari va public web ilovalarda mavjud zaifliklarni aniqlash hamda bartaraf etish bo‘yicha tavsiyalarni shakllantirish.")]), h("div", {
      key: 2,
      className: "field"
    }, [h("span", {
      className: "field__label"
    }, "Audit turi"), h("span", {
      className: "tag tag--brand"
    }, "Kompleks audit")]), h("div", {
      key: 3,
      className: "field"
    }, [h("span", {
      className: "field__label"
    }, "Metodologiya"), h("span", {
      style: {
        fontSize: 13
      }
    }, "OWASP ASVS · NIST 800-53 · ISO 27001")]), h("div", {
      key: 4,
      className: "field"
    }, [h("span", {
      className: "field__label"
    }, "Boshlanishi"), h("span", {
      className: "tabular",
      style: {
        fontSize: 13
      }
    }, "12.04.2026")]), h("div", {
      key: 5,
      className: "field"
    }, [h("span", {
      className: "field__label"
    }, "Tugashi"), h("span", {
      className: "tabular",
      style: {
        fontSize: 13
      }
    }, "31.05.2026")]), h("div", {
      key: 6,
      className: "field span-2"
    }, [h("span", {
      className: "field__label"
    }, "Audit doirasi"), h("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, ["Tashqi perimetr", "Ichki tarmoq (10.0.0.0/8)", "Web ilovalar (portal.gov.uz)", "Server infratuzilmasi", "Active Directory domeni", "VPN gateway", "Wi-Fi corporate"].map(t => h("span", {
      key: t,
      className: "tag tag--outline"
    }, t)))])])])]), h("div", {
      key: "st",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Layers, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Bosqichlar")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, stages.map((s, i) => h("div", {
      key: s.n,
      style: {
        display: "flex",
        gap: 14,
        padding: 16,
        borderBottom: i < stages.length - 1 ? "1px solid var(--border-color)" : "none",
        alignItems: "flex-start"
      }
    }, [h("div", {
      key: 1,
      style: {
        width: 36,
        height: 36,
        borderRadius: 8,
        background: s.status === "done" ? "var(--brand-soft)" : s.status === "in_progress" ? "var(--status-warning-bg)" : "var(--bg-surface-2)",
        color: s.status === "done" ? "var(--brand)" : s.status === "in_progress" ? "var(--status-warning-fg)" : "var(--text-tertiary)",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 14,
        flexShrink: 0
      }
    }, s.status === "done" ? h(I.Check, {
      key: "i-check",
      size: 16
    }) : s.n), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, s.title), h("span", {
      key: 2,
      className: "tag " + (s.status === "done" ? "tag--success" : s.status === "in_progress" ? "tag--info" : "tag--ghost")
    }, s.status === "done" ? "Bajarilgan" : s.status === "in_progress" ? "Jarayonda" : "Yangi")]), h("p", {
      key: 2,
      style: {
        fontSize: 13,
        color: "var(--text-secondary)",
        marginTop: 4,
        lineHeight: 1.55
      }
    }, s.desc)])])))])]), h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h("div", {
      key: "ap",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.History, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Tasdiqlash tarixi")])), h("div", {
      className: "panel__body",
      key: 2
    }, h("div", {
      className: "timeline"
    }, [{
      who: "u3",
      action: "Loyiha yaratdi",
      t: "12.04.2026 14:30",
      state: "done"
    }, {
      who: "u3",
      action: "Tasdiqlashga yubordi",
      t: "13.04.2026 09:14",
      state: "done"
    }, {
      who: "u2",
      action: "Tasdiqladi",
      t: "13.04.2026 16:48",
      state: "current"
    }].map((e, i, arr) => h("div", {
      key: i,
      className: "timeline__item timeline__item--done"
    }, [h("div", {
      key: 1,
      className: "timeline__dot"
    }, h(I.Check, {
      key: "i-check",
      size: 14
    })), h("div", {
      key: 2,
      className: "timeline__body"
    }, [h("div", {
      key: 1,
      className: "timeline__title"
    }, [h(Avatar, {
      user: e.who,
      key: "a"
    }), h("span", {
      key: "n"
    }, D.userById(e.who).name)]), h("div", {
      key: 2,
      className: "timeline__meta"
    }, e.action + " · " + e.t)])]))))]), h("div", {
      key: "tools",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Boxes, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Foydalaniladigan vositalar")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, ["Nessus 10.5", "OpenVAS / GVM", "OWASP ZAP", "Burp Suite Pro", "Wireshark", "Nmap 7.94", "Suricata", "Hydra", "John the Ripper"].map((t, i, arr) => h("div", {
      key: t,
      className: "lrow",
      style: {
        border: "none",
        borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
        borderRadius: 0
      }
    }, [h("div", {
      key: 1,
      className: "icon-box" + " " + "stat__icon"
    }, h(I.Code, {
      key: "i-code",
      size: 14
    })), h("div", {
      key: 2,
      className: "lrow__body"
    }, [h("div", {
      key: 1,
      className: "lrow__title"
    }, t), h("div", {
      key: 2,
      className: "lrow__sub"
    }, "Open-source · Lokal ishga tushiriladi")])])))])])]);
  }

  // ------ Tasks tab ------
  function AuditTasks({
    a,
    openTask
  }) {
    return h("div", null, [h("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 14,
        flexWrap: "wrap"
      },
      key: "f"
    }, [h("span", {
      key: 0,
      className: "tag tag--brand"
    }, "Hammasi (" + a.tasks.total + ")"), h("span", {
      key: 1,
      className: "tag tag--outline"
    }, "Jarayonda (" + a.tasks.in_progress + ")"), h("span", {
      key: 2,
      className: "tag tag--outline"
    }, "Bajarilgan (" + a.tasks.done + ")"), h("span", {
      key: 3,
      className: "tag tag--outline"
    }, "Blok (" + a.tasks.blocked + ")"), h("div", {
      key: "s",
      style: {
        marginLeft: "auto",
        display: "flex",
        gap: 8
      }
    }, [h(window.FilterButton, {
      key: 1,
      kind: "tasks"
    }), h("button", {
      key: 2,
      className: "btn btn--primary btn--sm",
      onClick: () => window.__openCreateTask && window.__openCreateTask()
    }, [h(I.Plus, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Vazifa qo‘shish")])])]), h("div", {
      className: "tbl-wrap",
      key: "t"
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1,
      style: {
        width: 36
      }
    }, h("input", {
      className: "checkbox",
      type: "checkbox"
    })), h("th", {
      key: 2
    }, "ID"), h("th", {
      key: 3
    }, "Vazifa"), h("th", {
      key: 4
    }, "Turi"), h("th", {
      key: 5
    }, "Ustuvorlik"), h("th", {
      key: 6
    }, "Holat"), h("th", {
      key: 7
    }, "Mas’ul"), h("th", {
      key: 8
    }, "Muddat"), h("th", {
      key: 9
    }, "Findinglar"), h("th", {
      key: 10
    }, "Fayllar"), h("th", {
      key: 11
    }, "KPI")])), h("tbody", {
      key: "b"
    }, D.TASKS.map(t => h("tr", {
      key: t.id,
      onClick: () => openTask(t.id)
    }, [h("td", {
      key: 0
    }, h("input", {
      className: "checkbox",
      type: "checkbox",
      onClick: e => e.stopPropagation()
    })), h("td", {
      key: 1,
      className: "cell-mono"
    }, t.id), h("td", {
      key: 2
    }, h("div", {
      className: "text-primary font-semi"
    }, t.title)), h("td", {
      key: 3
    }, h("span", {
      className: "tag tag--outline"
    }, t.type)), h("td", {
      key: 4
    }, h("span", {
      className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost")
    }, t.priority)), h("td", {
      key: 5
    }, h("span", {
      className: "tag tag--info"
    }, D.TASK_STATUS[t.status].label)), h("td", {
      key: 6
    }, h("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, [h(Avatar, {
      key: 1,
      user: t.assignee
    }), h("span", {
      key: 2,
      className: "text-sm"
    }, D.userById(t.assignee).name)])), h("td", {
      key: 7,
      className: "tabular"
    }, t.due), h("td", {
      key: 8,
      className: "tabular text-primary font-semi"
    }, t.findings || "—"), h("td", {
      key: 9,
      className: "tabular"
    }, t.files || "—"), h("td", {
      key: 10,
      className: "tabular text-brand font-semi"
    }, t.kpi ? "+" + t.kpi : "—")])))])))]);
  }

  // ------ Findings tab ------
  function AuditFindings({
    a,
    openFinding
  }) {
    const finds = D.FINDINGS.filter(f => f.auditId === a.id);
    return h(FindingsList, {
      findings: finds,
      openFinding,
      compact: true
    });
  }

  // ------ Files tab ------
  function AuditFiles({
    a
  }) {
    const files = [{
      name: "fw-core-01.cfg",
      size: "412 KB",
      type: "config",
      ext: "cfg",
      by: "u6",
      at: "18.05 14:22",
      findings: 4
    }, {
      name: "ad-policy-export.xml",
      size: "128 KB",
      type: "config",
      ext: "xml",
      by: "u7",
      at: "19.05 09:11",
      findings: 1
    }, {
      name: "nessus-internal.csv",
      size: "1.4 MB",
      type: "scanner",
      ext: "csv",
      by: "u4",
      at: "15.05 16:30",
      findings: 8
    }, {
      name: "owasp-zap-report.json",
      size: "2.1 MB",
      type: "scanner",
      ext: "json",
      by: "u4",
      at: "16.05 11:45",
      findings: 6
    }, {
      name: "core-net.pcap",
      size: "94 MB",
      type: "traffic",
      ext: "pcap",
      by: "u3",
      at: "20.05 10:14",
      findings: 1
    }, {
      name: "ids-suricata.log",
      size: "8.3 MB",
      type: "log",
      ext: "log",
      by: "u6",
      at: "17.05 13:00",
      findings: 4
    }, {
      name: "wifi-controller.bin",
      size: "640 KB",
      type: "config",
      ext: "bin",
      by: "u6",
      at: "—",
      findings: 0
    }, {
      name: "openvas-results.xml",
      size: "3.2 MB",
      type: "scanner",
      ext: "xml",
      by: "u4",
      at: "18.05 11:32",
      findings: 5
    }];
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [h("div", {
      key: "L",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Folder, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Fayllar (" + files.length + ")")]), h("button", {
      key: 2,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info")
    }, [h(I.Upload, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Yuklash")])]), h("div", {
      className: "panel__body panel__body--flush",
      key: 2
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Fayl"), h("th", {
      key: 2
    }, "Turi"), h("th", {
      key: 3
    }, "Hajm"), h("th", {
      key: 4
    }, "Findinglar"), h("th", {
      key: 5
    }, "Yuklagan"), h("th", {
      key: 6
    }, "Vaqt")])), h("tbody", {
      key: "b"
    }, files.map(f => h("tr", {
      key: f.name
    }, [h("td", {
      key: 1
    }, h("div", {
      className: "cell-title"
    }, [h("span", {
      key: "i",
      className: "icon-box",
      style: {
        background: f.type === "scanner" ? "rgba(245,158,11,0.16)" : f.type === "traffic" ? "rgba(14,165,233,0.16)" : f.type === "log" ? "rgba(96,139,250,0.16)" : "var(--brand-soft)",
        color: f.type === "scanner" ? "var(--status-warning-fg)" : f.type === "traffic" ? "var(--status-info-fg)" : "var(--brand)"
      }
    }, h(f.type === "scanner" ? I.Bug : f.type === "traffic" ? I.Activity : f.type === "log" ? I.FileText : I.Server, {
      size: 14
    })), h("div", {
      key: "t"
    }, [h("div", {
      key: 1,
      className: "font-mono",
      style: {
        fontSize: 13
      }
    }, f.name), h("div", {
      key: 2,
      className: "cell-sub"
    }, "." + f.ext)])])), h("td", {
      key: 2
    }, h("span", {
      className: "tag tag--outline"
    }, f.type)), h("td", {
      key: 3,
      className: "tabular cell-sub"
    }, f.size), h("td", {
      key: 4
    }, f.findings ? h("span", {
      className: "tag tag--danger"
    }, f.findings) : h("span", {
      className: "cell-sub"
    }, "—")), h("td", {
      key: 5
    }, h(Avatar, {
      user: f.by
    })), h("td", {
      key: 6,
      className: "tabular cell-sub"
    }, f.at)])))])))]), h("div", {
      key: "R",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Image, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Skrinshot dalillari")])), h("div", {
      className: "panel__body",
      key: 2
    }, h("div", {
      className: "tile-grid"
    }, [{
      name: "fw-rule-perm.png",
      meta: "F-2026-0341 · 1280x720",
      code: false
    }, {
      name: "ad-policy.txt",
      meta: "F-2026-0342 · 2.1 KB",
      code: true,
      content: "MinimumPasswordLength: 6\nPasswordHistoryCount: 0\nLockoutThreshold: 0\nLockoutDuration: 0\nMaxPasswordAge: never"
    }, {
      name: "telnet-banners.png",
      meta: "F-2026-0347 · 12 hosts",
      code: false
    }, {
      name: "sql-error.png",
      meta: "F-2026-0346 · 980x540",
      code: false
    }, {
      name: "dns-tunnel-traffic.png",
      meta: "F-2026-0345 · timeline",
      code: false,
      graph: true
    }, {
      name: "nessus-output.txt",
      meta: "F-2026-0343 · CVE list",
      code: true,
      content: "CVE-2023-25690\nCVE-2023-43622\nCVE-2024-27316\nCVE-2024-38476"
    }].map((t, i) => h("div", {
      key: i,
      className: "tile"
    }, [h("div", {
      key: 1,
      className: "tile__thumb " + (t.code ? "tile__thumb--code" : t.graph ? "tile__thumb--graph" : "")
    }, t.code ? t.content : t.graph ? h("svg", {
      width: "100%",
      height: "100%",
      viewBox: "0 0 100 60",
      preserveAspectRatio: "none"
    }, [h("path", {
      d: "M0 50 L10 48 L20 30 L30 35 L40 12 L50 18 L60 8 L70 20 L80 6 L90 4 L100 10",
      stroke: "var(--brand)",
      strokeWidth: 1.5,
      fill: "none"
    })]) : h(I.Image, null)), h("div", {
      key: 2,
      className: "tile__body"
    }, [h("div", {
      key: 1,
      className: "tile__name"
    }, t.name), h("div", {
      key: 2,
      className: "tile__meta"
    }, t.meta)])]))))])]);
  }

  // ------ Tokens tab ------
  function AuditTokens({
    a
  }) {
    const tokens = D.TOKENS.filter(t => t.audit === a.id);
    return h(TokenManagement, {
      tokens,
      scope: "audit"
    });
  }

  // ------ AI tab (delegate) ------
  function AuditAI({
    a
  }) {
    return h(window.AIScreen, {
      audit: a,
      embedded: true
    });
  }

  // ------ KPI tab ------
  function AuditKPI({
    a
  }) {
    const auditKpi = D.KPI_USERS.filter(k => a.members.includes(k.user));
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [h("div", {
      key: "L",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Trophy, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Mutaxassislar bo‘yicha KPI")])), h("div", {
      className: "panel__body panel__body--flush",
      key: 2
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Mutaxassis"), h("th", {
      key: 2
    }, "Rol"), h("th", {
      key: 3
    }, "Vazifa"), h("th", {
      key: 4
    }, "Finding"), h("th", {
      key: 5
    }, "Critical"), h("th", {
      key: 6
    }, "Trend"), h("th", {
      key: 7
    }, "Ball")])), h("tbody", {
      key: "b"
    }, auditKpi.map((k, i) => {
      const u = D.userById(k.user);
      const isLeader = k.user === a.leader;
      return h("tr", {
        key: k.user
      }, [h("td", {
        key: 1
      }, h("div", {
        className: "cell-title"
      }, [h(Avatar, {
        user: u,
        key: "a"
      }), h("div", null, [h("div", {
        key: 1
      }, u.name), h("div", {
        key: 2,
        className: "cell-sub"
      }, u.title)])])), h("td", {
        key: 2
      }, isLeader ? h("span", {
        className: "tag tag--brand"
      }, "Rahbar") : h("span", {
        className: "tag tag--outline"
      }, "Auditor")), h("td", {
        key: 3,
        className: "tabular text-primary font-semi"
      }, Math.round(k.tasks / k.audits)), h("td", {
        key: 4,
        className: "tabular text-primary font-semi"
      }, Math.round(k.findings / k.audits)), h("td", {
        key: 5,
        className: "tabular"
      }, h("span", {
        className: "sev sev--critical"
      }, Math.max(0, Math.round(k.findings / k.audits / 4)))), h("td", {
        key: 6
      }, h(Sparkline, {
        data: k.sparkline,
        w: 80,
        h: 24
      })), h("td", {
        key: 7,
        className: "tabular",
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          color: "var(--text-primary)",
          fontSize: 15
        }
      }, Math.round(k.total / k.audits))]);
    }))])))]), h("div", {
      key: "R",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Activity, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "KPI hodisalari oqimi")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, [{
      t: "10:42",
      u: "u4",
      e: "Finding kiritildi",
      pts: 3,
      ent: "F-2026-0349"
    }, {
      t: "10:35",
      u: "u4",
      e: "Vazifa yangilandi",
      pts: 0,
      ent: "T-123"
    }, {
      t: "10:28",
      u: "u6",
      e: "Agent sinxronlash",
      pts: 0,
      ent: "AUD-2026-014"
    }, {
      t: "09:58",
      u: "u3",
      e: "Finding tasdiqlandi (critical)",
      pts: 13,
      ent: "F-2026-0341"
    }, {
      t: "09:42",
      u: "u3",
      e: "Auditor sifatida qatnashish",
      pts: 10,
      ent: "AUD-2026-014"
    }, {
      t: "09:15",
      u: "u4",
      e: "Skaner tahlili bajarildi",
      pts: 5,
      ent: "T-116"
    }, {
      t: "08:48",
      u: "u6",
      e: "Vazifa muddatida bajarildi",
      pts: 10,
      ent: "T-122"
    }, {
      t: "08:30",
      u: "u7",
      e: "Vazifa kechiktirildi",
      pts: -5,
      ent: "T-121"
    }].map((e, i, arr) => h("div", {
      key: i,
      style: {
        padding: "10px 14px",
        borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, [h("span", {
      key: 1,
      className: "cell-sub tabular",
      style: {
        width: 44
      }
    }, e.t), h(Avatar, {
      user: e.u,
      key: 2
    }), h("div", {
      key: 3,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 12.5,
        color: "var(--text-primary)"
      }
    }, e.e), h("div", {
      key: 2,
      className: "cell-sub font-mono"
    }, e.ent)]), h("span", {
      key: 4,
      className: "font-bold tabular",
      style: {
        color: e.pts > 0 ? "var(--status-success-fg)" : e.pts < 0 ? "var(--status-danger-fg)" : "var(--text-tertiary)",
        fontSize: 14
      }
    }, (e.pts > 0 ? "+" : "") + (e.pts || "—"))])))])]);
  }

  // ------ Reports tab ------
  function AuditReports({
    a
  }) {
    const reps = D.REPORTS.filter(r => r.audit === a.id);
    return h("div", null, [h("div", {
      key: "h",
      className: "card card__pad",
      style: {
        marginBottom: 14,
        display: "flex",
        gap: 16,
        alignItems: "center"
      }
    }, [h("div", {
      key: 1,
      className: "stat__icon",
      style: {
        width: 48,
        height: 48
      }
    }, h(I.FileText, {
      key: "i-filetext",
      size: 22
    })), h("div", {
      key: 2,
      style: {
        flex: 1
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Yakuniy hisobot tayyor"), h("div", {
      key: 2,
      className: "text-sm text-muted",
      style: {
        marginTop: 2
      }
    }, "Audit ma‘lumotlari, AI xulosalari va KPI natijalari asosida 4 ta hisobot avtomatik shakllantirildi. Tasdiqlashga yuborishingiz mumkin.")]), h("div", {
      key: 3,
      style: {
        display: "flex",
        gap: 8
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--secondary btn--sm",
      onClick: () => window.showToast("AI hisobot qoralamasi yaratilmoqda (qwen2.5:14b)", "info")
    }, [h(I.Sparkles, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "AI generatsiya")]), h("button", {
      key: 2,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("Hammasi yuklab olinmoqda (ZIP arxiv)...", "success")
    }, [h(I.Download, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Hammasini yuklash")])])]), h("div", {
      key: "g",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 14
      }
    }, [{
      id: "R-A",
      title: "Yakuniy audit hisoboti",
      desc: "Tashkilot, audit guruhi, vazifalar, tasdiqlangan findinglar va remediation reja.",
      icon: I.FileText,
      formats: ["DOCX", "PDF", "HTML"],
      pages: 84,
      status: "draft"
    }, {
      id: "R-B",
      title: "Executive summary",
      desc: "Rahbariyat uchun 2 sahifalik qisqa xulosa, asosiy xavflar va tavsiyalar.",
      icon: I.Star,
      formats: ["PDF"],
      pages: 2,
      status: "draft"
    }, {
      id: "R-C",
      title: "Remediation plan",
      desc: "Texnik mutaxassislar uchun batafsil bartaraf etish rejasi (owner + ETA).",
      icon: I.Target,
      formats: ["DOCX", "XLSX"],
      pages: 18,
      status: "draft"
    }, {
      id: "R-D",
      title: "KPI hisoboti",
      desc: "Auditda qatnashgan mutaxassislar bo‘yicha KPI natijalari va reyting.",
      icon: I.Trophy,
      formats: ["XLSX", "PDF"],
      pages: 6,
      status: "approved"
    }].map(r => h("div", {
      key: r.id,
      className: "card card--hover"
    }, [h("div", {
      key: 1,
      style: {
        padding: "18px 18px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }
    }, [h("div", {
      key: 1,
      className: "stat__icon",
      style: {
        width: 44,
        height: 44
      }
    }, h(r.icon, {
      size: 20
    })), h("div", {
      key: 2,
      style: {
        flex: 1
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, r.title), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        marginTop: 4,
        lineHeight: 1.5
      }
    }, r.desc)])]), h("div", {
      key: 2,
      style: {
        padding: "0 18px",
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, [...r.formats.map(f => h("span", {
      key: f,
      className: "tag tag--outline"
    }, f)), h("span", {
      key: "p",
      className: "tag tag--ghost"
    }, r.pages + " sahifa"), h("span", {
      key: "s",
      className: "tag " + (r.status === "draft" ? "tag--warning" : "tag--success")
    }, r.status === "draft" ? "Qoralama" : "Tasdiqlangan")]), h("div", {
      key: 3,
      style: {
        padding: 14,
        borderTop: "1px solid var(--border-color)",
        marginTop: 14,
        display: "flex",
        gap: 8
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--ghost btn--sm",
      style: {
        flex: 1
      },
      onClick: () => window.showToast(r.title + " preview ochilmoqda...", "info")
    }, [h(I.Eye, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Preview")]), h("button", {
      key: 2,
      className: "btn btn--primary btn--sm",
      style: {
        flex: 1
      },
      onClick: () => window.showToast(r.title + " yuklab olinmoqda...", "success")
    }, [h(I.Download, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Yuklash")])])])))]);
  }

  // ------ Log tab ------
  function AuditLog({
    a
  }) {
    return h(window.LogsScreen, {
      embedded: true
    });
  }

  // =========================================================================
  // FINDINGS LIST (also used as a tab inside audit detail)
  // =========================================================================
  function FindingsScreen({
    openFinding,
    setRoute
  }) {
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Findinglar"
      }],
      title: "Findinglar va zaifliklar",
      sub: D.FINDINGS.length + " ta yozuv · " + D.FINDINGS.filter(f => f.severity === "critical").length + " critical · " + D.FINDINGS.filter(f => f.status === "review").length + " tekshiruvda",
      actions: [h("div", {
        key: 0,
        className: "input-group",
        style: {
          width: 280
        }
      }, [h(I.Search, {
        className: "icon-l"
      }), h("input", {
        className: "input",
        placeholder: "Finding ID, asset, CVE..."
      })]), h(window.FilterButton, {
        key: 1,
        kind: "findings"
      }), h("button", {
        key: 2,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Findinglar XLSX formatda eksport qilindi", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Eksport")]), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: () => window.__openCreateFinding && window.__openCreateFinding()
      }, [h(I.Plus, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Finding qo‘shish")])]
    }), h("div", {
      key: "qf",
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 16,
        flexWrap: "wrap"
      }
    }, [["Hammasi", D.FINDINGS.length, "tag--brand"], ["Critical", D.FINDINGS.filter(f => f.severity === "critical").length, "tag--danger"], ["High", D.FINDINGS.filter(f => f.severity === "high").length, "tag--warning"], ["Tekshiruvda", D.FINDINGS.filter(f => f.status === "review").length, "tag--info"], ["AI tavsiyali", D.FINDINGS.filter(f => f.ai).length, "tag--outline"]].map(([l, c, cls]) => h("span", {
      key: l,
      className: "tag " + cls
    }, l + " · " + c))), h(FindingsList, {
      key: "L",
      findings: D.FINDINGS,
      openFinding
    })]);
  }
  window.FindingsScreen = FindingsScreen;
  function FindingsList({
    findings,
    openFinding,
    compact
  }) {
    return h("div", {
      className: "tbl-wrap"
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1,
      style: {
        width: 36
      }
    }, h("input", {
      className: "checkbox",
      type: "checkbox"
    })), h("th", {
      key: 2
    }, "Sev"), h("th", {
      key: 3
    }, "Finding"), h("th", {
      key: 4
    }, "Asset"), h("th", {
      key: 5
    }, "CVSS"), h("th", {
      key: 6
    }, "Status"), h("th", {
      key: 7
    }, "Dalil"), compact ? null : h("th", {
      key: 8
    }, "Audit"), h("th", {
      key: 9
    }, "Auditor"), h("th", {
      key: 10
    }, "Vaqt")])), h("tbody", {
      key: "b"
    }, findings.map(f => h("tr", {
      key: f.id,
      onClick: () => openFinding(f.id)
    }, [h("td", {
      key: 0
    }, h("input", {
      className: "checkbox",
      type: "checkbox",
      onClick: e => e.stopPropagation()
    })), h("td", {
      key: 1
    }, h(Sev, {
      level: f.severity
    })), h("td", {
      key: 2
    }, h("div", null, [h("div", {
      key: 1,
      className: "text-primary font-semi"
    }, f.title), h("div", {
      key: 2,
      className: "cell-sub"
    }, [h("span", {
      key: 1,
      className: "font-mono"
    }, f.id), " · ", h("span", {
      key: 2
    }, f.cwe), f.ai ? h("span", {
      key: 3,
      style: {
        marginLeft: 8,
        color: "var(--brand)",
        fontWeight: 600
      }
    }, "✦ AI") : null])])), h("td", {
      key: 3,
      className: "font-mono",
      style: {
        fontSize: 12
      }
    }, f.asset), h("td", {
      key: 4,
      className: "tabular font-bold text-primary"
    }, f.cvss), h("td", {
      key: 5
    }, statusTag(f.status === "approved" ? "approved" : f.status === "review" ? "review" : f.status === "returned" ? "returned" : "in_progress")), h("td", {
      key: 6
    }, h("span", {
      className: "cell-sub",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }
    }, [h(I.Paperclip, {
      size: 12,
      key: "i"
    }), h("span", {
      key: "n",
      className: "tabular"
    }, f.evidence)])), compact ? null : h("td", {
      key: 7,
      className: "cell-mono",
      style: {
        fontSize: 12
      }
    }, f.auditId), h("td", {
      key: 8
    }, h(Avatar, {
      user: f.reportedBy
    })), h("td", {
      key: 9,
      className: "tabular cell-sub"
    }, f.date)])))])));
  }
  window.FindingsList = FindingsList;

  // =========================================================================
  // FINDING DRAWER (detail view)
  // =========================================================================
  function FindingDrawer({
    findingId,
    onClose,
    role
  }) {
    const f = D.FINDINGS.find(x => x.id === findingId);
    if (!f) return null;
    return h(Drawer, {
      open: !!f,
      onClose,
      wide: true,
      title: h("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 4
        }
      }, [h("div", {
        key: 1,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, [h(Sev, {
        level: f.severity,
        key: 1
      }), h("span", {
        key: 2,
        className: "font-mono cell-sub"
      }, f.id), h("span", {
        key: 3,
        className: "cell-sub"
      }, "· CVSS"), h("span", {
        key: 4,
        className: "font-bold tabular"
      }, f.cvss), f.ai ? h("span", {
        key: 5,
        className: "tag tag--brand"
      }, [h(I.Sparkles, {
        key: "i",
        size: 11
      }), "AI"]) : null]), h("div", {
        key: 2,
        className: "panel__t",
        style: {
          fontSize: 16
        }
      }, f.title)]),
      footer: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Finding tahrirlash oynasi ochilmoqda...", "info")
      }, [h(I.Edit3, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tahrir")]), h("button", {
        key: 2,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Finding tekshiruvga yuborildi", "info")
      }, [h(I.Send, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tekshiruvga")]), h("button", {
        key: 3,
        className: "btn btn--danger btn--sm",
        onClick: async () => {
          const ok = await window.confirmAction({
            title: "Findingni qaytarish",
            body: "Finding auditorga qayta yuboriladi. Sabab kiritishni unutmang.",
            confirmLabel: "Qaytarish",
            danger: true
          });
          if (ok) window.showToast("Finding auditorga qaytarildi", "warning");
        }
      }, [h(I.X, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Qaytarish")]), h("button", {
        key: 4,
        className: "btn btn--primary btn--sm",
        onClick: () => window.showToast("Finding tasdiqlandi va hisobotga qo'shildi", "success")
      }, [h(I.Check, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tasdiqlash")])]
    }, [
    // Quick props
    h("div", {
      key: "p",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12
      }
    }, [["Asset", h("span", {
      className: "font-mono",
      style: {
        fontSize: 13
      }
    }, f.asset)], ["Turi", h("span", {
      className: "tag tag--outline"
    }, f.type)], ["Status", statusTag(f.status === "approved" ? "approved" : f.status === "review" ? "review" : "in_progress")], ["CWE", h("span", {
      className: "font-mono",
      style: {
        fontSize: 13
      }
    }, f.cwe)], ["Audit", h("span", {
      className: "font-mono",
      style: {
        fontSize: 13
      }
    }, f.auditId)], ["Vazifa", h("span", {
      className: "font-mono",
      style: {
        fontSize: 13
      }
    }, f.taskId)], ["Auditor", h("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, [h(Avatar, {
      user: f.reportedBy,
      key: 1
    }), h("span", {
      key: 2
    }, D.userById(f.reportedBy).name)])], ["Aniqlangan", h("span", {
      className: "tabular"
    }, f.date)], ["Dalillar", h("span", {
      className: "tag tag--ghost"
    }, [h(I.Paperclip, {
      key: "i-paperclip",
      size: 11
    }), f.evidence + " ta"])]].map(([l, v]) => h("div", {
      key: l,
      className: "field"
    }, [h("span", {
      key: 1,
      className: "field__label",
      style: {
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--text-tertiary)"
      }
    }, l), h("div", {
      key: 2
    }, v)]))),
    // Description
    h("div", {
      key: "desc",
      style: {
        marginTop: 20
      }
    }, [h("h4", {
      key: 1,
      style: {
        fontSize: 14,
        marginBottom: 8
      }
    }, "Tavsif"), h("p", {
      key: 2,
      style: {
        fontSize: 14,
        color: "var(--text-secondary)",
        lineHeight: 1.6
      }
    }, f.description)]),
    // AI section
    f.ai ? h("div", {
      key: "ai",
      className: "ai-card",
      style: {
        marginTop: 20
      }
    }, h("div", {
      className: "ai-card__inner"
    }, [h("div", {
      className: "ai-card__head",
      key: 1
    }, [h("div", {
      className: "ai-card__icon",
      key: 1
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 14
    })), h("span", {
      className: "ai-card__title",
      key: 2
    }, "Ollama tavsiyasi — remediation"), h("span", {
      key: 3,
      className: "tag tag--brand",
      style: {
        marginLeft: "auto"
      }
    }, "qwen2.5:14b")]), h("p", {
      key: 2,
      className: "ai-card__body"
    }, f.severity === "critical" ? "Ushbu zaiflik aniqlangan tizimni jamoatchilik kirishidan darhol ajratish tavsiya etiladi. WAF qoidalari yoki firewall darajasida bloklash hujum vektorini vaqtinchalik yopadi. Patch chiqarilgan versiyaga yangilash uchun changeman jarayonini tezlashtirish lozim. Yangilanish bajarilgach, ushbu konfiguratsiya boshqa shu turdagi tizimlarda ham tekshirilishi kerak." : "Tavsiya etiladi: tegishli xizmatni o‘chirib, eski protokolni zamonaviysiga (masalan, Telnet → SSHv2, SMBv1 → SMBv3, RDP NLA on) almashtirish. O‘zgartirishlar pilot bo‘limda sinab ko‘rilgach, qolgan tizimlarga rolloverka qilinishi kerak."), h("div", {
      key: 3,
      style: {
        display: "flex",
        gap: 8,
        marginTop: 12
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--soft btn--sm",
      onClick: () => {
        try {
          navigator.clipboard.writeText("AI tavsiya...");
        } catch (e) {}
        window.showToast("AI tavsiya buferga ko'chirildi", "success");
      }
    }, [h(I.Copy, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Nusxa")]), h("button", {
      key: 2,
      className: "btn btn--soft btn--sm",
      onClick: () => window.showToast("AI tahlil qaytadan ishga tushirildi...", "info")
    }, [h(I.Refresh, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Qayta tahlil")]), h("button", {
      key: 3,
      className: "btn btn--ghost btn--sm",
      onClick: () => window.showToast("AI tavsiyani tahrirlash oynasi ochilmoqda...", "info")
    }, [h(I.Edit3, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Tahrir")])])])) : null,
    // Evidence
    h("h4", {
      key: "et",
      style: {
        fontSize: 14,
        marginTop: 20,
        marginBottom: 10
      }
    }, "Dalillar (" + f.evidence + ")"), h("div", {
      key: "ev",
      className: "tile-grid"
    }, Array.from({
      length: f.evidence
    }).map((_, i) => h("div", {
      key: i,
      className: "tile"
    }, [h("div", {
      key: 1,
      className: "tile__thumb " + (i === 1 ? "tile__thumb--code" : "")
    }, i === 1 ? "interface GigabitEthernet0/0\n ip address 10.0.0.1 255.0.0.0\n no ip access-group in\n no logging\n!\nip access-list extended PERMIT_ALL\n permit ip any any" : h(i === 0 ? I.Image : i === 2 ? I.FileText : I.Activity)), h("div", {
      key: 2,
      className: "tile__body"
    }, [h("div", {
      key: 1,
      className: "tile__name"
    }, ["screenshot-1.png", "fw-config-excerpt.txt", "nessus-output.csv", "tcpdump.pcap"][i] || "evidence-" + (i + 1)), h("div", {
      key: 2,
      className: "tile__meta"
    }, ["1280x720 PNG", "4 KB", "12 satr", "3.4 MB"][i] || "—")])]))),
    // Comments
    h("h4", {
      key: "ct",
      style: {
        fontSize: 14,
        marginTop: 24,
        marginBottom: 10
      }
    }, "Sharhlar"), h("div", {
      key: "cm",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, [{
      u: "u3",
      t: "Critical findinglarni darhol tasdiqladim. Sevara, OWASP ZAP natijalarini ham loyihaga qo‘shing.",
      at: "10 daqiqa oldin"
    }, {
      u: "u4",
      t: "Bajaramiz. Sentral switch konfiguratsiyasini hozir tortib olayapman.",
      at: "8 daqiqa oldin"
    }].map((c, i) => h("div", {
      key: i,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start"
      }
    }, [h(Avatar, {
      user: c.u,
      key: 1
    }), h("div", {
      key: 2,
      style: {
        flex: 1
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, [h("strong", {
      key: 1,
      style: {
        fontSize: 13,
        color: "var(--text-primary)"
      }
    }, D.userById(c.u).name), h("span", {
      key: 2,
      className: "cell-sub"
    }, c.at)]), h("p", {
      key: 2,
      style: {
        fontSize: 13.5,
        color: "var(--text-secondary)",
        lineHeight: 1.55,
        marginTop: 2
      }
    }, c.t)])]))), h("div", {
      key: "ci",
      style: {
        marginTop: 14,
        display: "flex",
        gap: 10,
        alignItems: "flex-start"
      }
    }, [h(Avatar, {
      user: D.USERS.find(u => u.role === (role || "departament")) || D.USERS[0],
      key: 1
    }), h("div", {
      key: 2,
      style: {
        flex: 1,
        position: "relative"
      }
    }, [h("textarea", {
      className: "textarea",
      placeholder: "Sharh yozish — @bilan eslatish ham mumkin...",
      style: {
        minHeight: 56
      }
    })])])]);
  }
  window.FindingDrawer = FindingDrawer;

  // =========================================================================
  // TOKEN MANAGEMENT (reusable)
  // =========================================================================
  function TokenManagement({
    tokens,
    scope
  }) {
    const [reveal, setReveal] = useState({});
    return h("div", null, [h("div", {
      key: "info",
      className: "card card__pad-sm",
      style: {
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--bg-surface-2)"
      }
    }, [h("div", {
      key: 1,
      className: "stat__icon"
    }, h(I.KeyRound, {
      key: "i-keyround",
      size: 14
    })), h("div", {
      key: 2,
      style: {
        flex: 1,
        fontSize: 13,
        color: "var(--text-secondary)",
        lineHeight: 1.55
      }
    }, "Har bir audit va har bir xodim uchun alohida token generatsiya qilinadi. Token EXE agentda faqat shu xodimga biriktirilgan vazifalarni ochadi va qurilma identifikatori (hostname + OS) bilan bog‘lanadi."), h("button", {
      key: 3,
      className: "btn btn--primary btn--sm",
      onClick: () => window.__openCreateToken && window.__openCreateToken()
    }, [h(I.Plus, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Token chiqarish")])]), h("div", {
      key: "t",
      className: "tbl-wrap"
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Token"), scope === "audit" ? null : h("th", {
      key: 2
    }, "Audit"), h("th", {
      key: 3
    }, "Xodim"), h("th", {
      key: 4
    }, "Qurilma"), h("th", {
      key: 5
    }, "Berilgan"), h("th", {
      key: 6
    }, "Amal qiladi"), h("th", {
      key: 7
    }, "Status"), h("th", {
      key: 8
    }, "Oxirgi ishlatilgan"), h("th", {
      key: 9,
      className: "cell-actions"
    }, "Amallar")])), h("tbody", {
      key: "b"
    }, tokens.map(t => {
      const u = D.userById(t.user);
      return h("tr", {
        key: t.id
      }, [h("td", {
        key: 1
      }, h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, [h("code", {
        key: 1,
        className: "font-mono",
        style: {
          fontSize: 12,
          padding: "3px 8px",
          background: "var(--bg-page)",
          border: "1px solid var(--border-color)",
          borderRadius: 4,
          color: reveal[t.id] ? "var(--text-primary)" : "var(--text-tertiary)"
        }
      }, reveal[t.id] ? "tk_a91xd6f0c47e80b" : t.id), h("button", {
        key: 2,
        className: "iconbtn",
        style: {
          width: 24,
          height: 24
        },
        onClick: () => setReveal(r => ({
          ...r,
          [t.id]: !r[t.id]
        }))
      }, reveal[t.id] ? h(I.EyeOff, {
        key: "i-eyeoff",
        size: 12
      }) : h(I.Eye, {
        key: "i-eye",
        size: 12
      })), h("button", {
        key: 3,
        className: "iconbtn",
        style: {
          width: 24,
          height: 24
        }
      }, h(I.Copy, {
        key: "i-copy",
        size: 12
      }))])), scope === "audit" ? null : h("td", {
        key: 2,
        className: "cell-mono",
        style: {
          fontSize: 12
        }
      }, t.audit), h("td", {
        key: 3
      }, h("div", {
        className: "cell-title"
      }, [h(Avatar, {
        user: u,
        key: 1
      }), h("div", null, [h("div", {
        key: 1
      }, u.name), h("div", {
        key: 2,
        className: "cell-sub"
      }, u.title)])])), h("td", {
        key: 4
      }, h("div", null, [h("div", {
        key: 1,
        className: "font-mono",
        style: {
          fontSize: 12.5,
          color: "var(--text-primary)"
        }
      }, t.hostname), h("div", {
        key: 2,
        className: "cell-sub"
      }, t.os + " · " + t.agent + " · " + t.ip)])), h("td", {
        key: 5,
        className: "tabular cell-sub"
      }, t.issued), h("td", {
        key: 6,
        className: "tabular cell-sub"
      }, t.expires), h("td", {
        key: 7
      }, t.status === "active" ? h("span", {
        className: "tag tag--success"
      }, [h("span", {
        className: "dot dot--pulse",
        style: {
          width: 6,
          height: 6
        }
      }), "Aktiv"]) : t.status === "expired" ? h("span", {
        className: "tag tag--ghost"
      }, "Muddati o‘tgan") : h("span", {
        className: "tag tag--danger"
      }, "Bekor qilingan")), h("td", {
        key: 8,
        className: "tabular cell-sub"
      }, t.lastUsed), h("td", {
        key: 9,
        className: "cell-actions"
      }, h("div", {
        style: {
          display: "inline-flex",
          gap: 4,
          alignItems: "center"
        }
      }, [h("button", {
        key: 1,
        className: "btn btn--ghost btn--xs btn--icon",
        title: "Yangilash (rotate)",
        onClick: async () => {
          const ok = await window.confirmAction({
            title: "Tokenni yangilash",
            body: "Eski token darhol bekor qilinadi va yangi token chiqariladi. Agent qurilmasini qayta ulashish kerak bo'ladi.",
            confirmLabel: "Yangilash"
          });
          if (ok) window.showToast("Yangi token chiqarildi: tk_" + Math.random().toString(36).slice(2, 7) + "...", "success");
        }
      }, h(I.Refresh, {
        key: "i-refresh",
        size: 13
      })), h("button", {
        key: 2,
        className: "btn btn--ghost btn--xs btn--icon",
        title: "Bekor qilish",
        onClick: async () => {
          const ok = await window.confirmAction({
            title: "Tokenni bekor qilish",
            body: "Token " + t.id + " darhol o'chiriladi. Agent qurilmasi ulanmaydi.",
            confirmLabel: "Bekor qilish",
            danger: true
          });
          if (ok) window.showToast("Token bekor qilindi", "warning");
        }
      }, h(I.X, {
        key: "i-x",
        size: 13
      })), h(window.MoreMenu, {
        key: 3,
        items: [{
          label: "Token ma'lumotlari",
          icon: I.Eye,
          onClick: () => window.showToast("Ma'lumotlar oynasi ochilmoqda...", "info")
        }, {
          label: "Qurilma loglarini ko'rish",
          icon: I.History,
          onClick: () => window.showToast("Agent loglari yuklanmoqda...", "info")
        }, {
          label: "Nusxalash (token ID)",
          icon: I.Copy,
          onClick: () => {
            navigator.clipboard && navigator.clipboard.writeText(t.id);
            window.showToast("Token ID buferga ko'chirildi", "success");
          }
        }, {
          label: "Muddatni uzaytirish",
          icon: I.Clock,
          onClick: () => window.showToast("Muddat oynasi ochilmoqda...", "info")
        }]
      })]))]);
    }))])))]);
  }
  window.TokenManagement = TokenManagement;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/screens-audit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/screens-overview.jsx
try { (() => {
/* Login screen + Departament dashboard + Audits list + My tasks (kanban). */
(function () {
  const {
    useState,
    useMemo,
    useEffect,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // LOGIN
  // =========================================================================
  function LoginScreen({
    onLogin
  }) {
    const [showPass, setShowPass] = useState(false);
    return h("div", {
      className: "login"
    }, [h("div", {
      key: "s",
      className: "login__side"
    }, [h("div", {
      key: "top",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, [h("div", {
      key: "m",
      className: "brand-mark",
      style: {
        width: 40,
        height: 40
      }
    }, h(I.ShieldCheck, {
      key: "i-shieldcheck",
      size: 22
    })), h("div", {
      key: "t",
      className: "brand-text-wrap"
    }, [h("span", {
      key: 1,
      className: "brand-title",
      style: {
        fontSize: 16
      }
    }, "Auditor"), h("span", {
      key: 2,
      className: "brand-sub"
    }, "Axborot xavfsizligi auditi")])]), h("div", {
      key: "hero",
      className: "login__hero"
    }, [h("div", {
      key: "c",
      className: "login__chip"
    }, [h("span", {
      key: "d",
      className: "dot"
    }), h("span", {
      key: "t"
    }, "Yopiq kontur · internetsiz muhit")]), h("h1", {
      key: "h",
      style: {
        marginTop: 20
      }
    }, "Audit jarayonini boshidan oxirigacha — bitta tizimda."), h("p", {
      key: "p"
    }, "Auditlarni rejalashtirish, vazifalarni taqsimlash, joyida ma‘lumot yig‘ish va yakuniy hisobotlarni shakllantirish — barchasi tashkilot ichki tarmog‘ida."), h("div", {
      key: "f",
      className: "login__feats"
    }, [{
      i: I.KeyRound,
      t: "Audit token va EXE agent",
      s: "Har bir audit uchun alohida token. Xodim faqat o‘ziga biriktirilgan vazifalarni ko‘radi."
    }, {
      i: I.Brain,
      t: "Ollama lokal AI tahlil",
      s: "Findinglar, konfiguratsiya va trafik tahlili bo‘yicha xulosa va remediation tavsiyalari."
    }, {
      i: I.Trophy,
      t: "KPI hisoblash",
      s: "Mutaxassislar faoliyati har bir bajarilgan vazifa va tasdiqlangan zaiflik bo‘yicha avtomatik baholanadi."
    }].map((x, i) => h("div", {
      key: i,
      className: "login__feat"
    }, [h("div", {
      key: "i",
      className: "login__feat-icon"
    }, h(x.i, {
      size: 16
    })), h("div", {
      key: "t",
      className: "login__feat-text"
    }, [h("strong", {
      key: 1
    }, x.t), h("span", {
      key: 2
    }, x.s)])])))]), h("div", {
      key: "b",
      style: {
        fontSize: 11.5,
        color: "var(--text-tertiary)",
        display: "flex",
        gap: 16
      }
    }, [h("span", {
      key: 1
    }, "v1.2.4 · build 8a3f12c"), h("span", {
      key: 2
    }, "© 2026 Audit boshqaruvi")])]), h("div", {
      key: "m",
      className: "login__main"
    }, [h("form", {
      key: "f",
      className: "login__form",
      onSubmit: e => {
        e.preventDefault();
        onLogin && onLogin();
      }
    }, [h("div", {
      key: "h",
      style: {
        textAlign: "left"
      }
    }, [h("h2", {
      key: 1,
      style: {
        fontSize: 24,
        marginBottom: 6
      }
    }, "Tizimga kirish"), h("p", {
      key: 2,
      className: "text-sm text-muted"
    }, "Domen hisobi bilan kiring. Notanish urinishlar audit logga yoziladi.")]), h("div", {
      key: "u",
      className: "field"
    }, [h("label", {
      key: 1,
      className: "field__label"
    }, "Login (domen hisobi)"), h("div", {
      key: 2,
      className: "input-group"
    }, [h(I.User, {
      className: "icon-l"
    }), h("input", {
      className: "input",
      placeholder: "username@gov.uz",
      defaultValue: "a.yoldoshev@gov.uz"
    })])]), h("div", {
      key: "p",
      className: "field"
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, [h("label", {
      className: "field__label",
      key: "l"
    }, "Parol"), h("a", {
      key: "f",
      href: "#",
      style: {
        fontSize: 12,
        fontWeight: 600
      }
    }, "Parolni unutdingizmi?")]), h("div", {
      key: 2,
      className: "input-group"
    }, [h(I.Lock, {
      className: "icon-l"
    }), h("input", {
      className: "input",
      type: showPass ? "text" : "password",
      defaultValue: "••••••••••••",
      style: {
        paddingRight: 36
      }
    }), h("button", {
      key: "e",
      type: "button",
      className: "iconbtn",
      style: {
        position: "absolute",
        right: 2,
        top: 1,
        width: 32,
        height: 32
      },
      onClick: () => setShowPass(!showPass)
    }, showPass ? h(I.EyeOff, {
      key: "i-eyeoff",
      size: 16
    }) : h(I.Eye, {
      key: "i-eye",
      size: 16
    }))])]), h("label", {
      key: "c",
      className: "field__label",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 500,
        fontSize: 13
      }
    }, [h("input", {
      type: "checkbox",
      className: "checkbox",
      defaultChecked: true
    }), h("span", {
      key: "x"
    }, "Bu qurilmani 8 soatga eslab qol")]), h("button", {
      key: "b",
      type: "submit",
      className: "btn btn--primary btn--lg",
      style: {
        width: "100%"
      }
    }, [h(I.LogIn, {
      key: "i-login",
      size: 16
    }), h("span", {
      key: "t"
    }, "Kirish")]), h("div", {
      key: "or",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "var(--text-tertiary)",
        fontSize: 12
      }
    }, [h("span", {
      key: 1,
      style: {
        flex: 1,
        height: 1,
        background: "var(--border-color)"
      }
    }), h("span", {
      key: 2
    }, "yoki"), h("span", {
      key: 3,
      style: {
        flex: 1,
        height: 1,
        background: "var(--border-color)"
      }
    })]), h("button", {
      key: "ad",
      type: "button",
      className: "btn btn--secondary btn--lg",
      style: {
        width: "100%"
      }
    }, [h(I.Shield, {
      key: "i-shield",
      size: 16
    }), h("span", {
      key: "t"
    }, "Domen sertifikati bilan kirish (AD)")]), h("div", {
      key: "n",
      style: {
        marginTop: 16,
        padding: 12,
        background: "var(--bg-surface-2)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        fontSize: 12,
        color: "var(--text-tertiary)",
        display: "flex",
        gap: 10
      }
    }, [h(I.ShieldAlert, {
      key: "i",
      size: 16,
      style: {
        color: "var(--brand)",
        flexShrink: 0,
        marginTop: 1
      }
    }), h("span", {
      key: "t"
    }, "Demo rejim: o‘ng pastdagi Tweaks panelidan rolni almashtirib, xuddi shu interfeysni har xil foydalanuvchi nuqtai nazaridan ko‘rishingiz mumkin.")])])])]);
  }
  window.LoginScreen = LoginScreen;

  // =========================================================================
  // DASHBOARD (department head view)
  // =========================================================================
  function DashboardScreen({
    role,
    setRoute,
    openAudit,
    showAI,
    setCreateOpen
  }) {
    const myAudits = D.AUDITS.filter(a => a.status !== "approved" && a.status !== "cancelled");
    const totalFindings = D.AUDITS.reduce((s, a) => s + a.findings.critical + a.findings.high + a.findings.medium + a.findings.low, 0);
    const critical = D.AUDITS.reduce((s, a) => s + a.findings.critical, 0);
    const high = D.AUDITS.reduce((s, a) => s + a.findings.high, 0);
    const medium = D.AUDITS.reduce((s, a) => s + a.findings.medium, 0);
    const low = D.AUDITS.reduce((s, a) => s + a.findings.low, 0);
    const greeting = role === "departament" ? "Departament rahbari" : role === "bolim" ? "Bo‘lim boshlig‘i" : "Mutaxassis";
    const greetingTitle = role === "departament" ? "Yaxshi kun, Akmal." : role === "bolim" ? "Yaxshi kun, Dilshoda." : role === "bosh" ? "Yaxshi kun, Bobur." : role === "yetakchi" ? "Yaxshi kun, Sevara." : "Yaxshi kun, Madina.";
    return h("div", null, [h(PageHeader, {
      key: "h",
      title: greetingTitle,
      sub: role === "departament" ? "Bugun 4 ta audit jarayonda, 12 ta kritik finding ko‘rib chiqishni kutmoqda." : role === "bolim" ? "Bo‘limingizda 4 ta audit faol, 1 ta loyiha tasdiqlashda." : "Sizga 7 ta vazifa biriktirilgan. 2 tasi muddati bilan yopiladi.",
      actions: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Boshqaruv paneli CSV ko'rinishida eksport qilindi", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Eksport")]), role === "departament" || role === "bolim" ? h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => setCreateOpen && setCreateOpen(true)
      }, [h(I.Plus, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Yangi audit")]) : null]
    }), role === "departament" || role === "bolim" ? h(window.HeroBand, {
      key: "hero",
      score: Math.round(100 - critical * 1.5 - high * 0.4),
      metrics: [{
        label: "Faol audit",
        value: 4
      }, {
        label: "Critical",
        value: critical,
        tone: "danger"
      }, {
        label: "Bartaraf",
        value: "68%",
        tone: "good"
      }, {
        label: "O‘rtacha CVSS",
        value: "6.4"
      }],
      gauge: 89,
      gaugeCap: "Vazifa bajarildi",
      caption: role === "departament" ? "Departament bo‘yicha umumiy holat barqaror. 4 ta audit faol, kritik findinglar nazoratda." : "Bo‘limingiz holati barqaror — review jarayoni jadval bo‘yicha ketmoqda."
    }) : null,
    // --- Stats row ---
    h("div", {
      key: "s",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
        marginBottom: 20
      }
    }, [h(Stat, {
      key: 1,
      icon: I.FolderKanban,
      label: "Faol auditlar",
      value: 4,
      meta: "23 yakunlangan",
      delta: 12,
      spark: [2, 3, 3, 4, 4, 4]
    }), h(Stat, {
      key: 2,
      icon: I.AlertTriangle,
      label: "Critical findings",
      value: critical,
      meta: "Bu hafta + 5",
      delta: 25,
      deltaNeg: true,
      spark: [3, 4, 6, 7, 9, critical]
    }), h(Stat, {
      key: 3,
      icon: I.CheckSquare,
      label: "Vazifalar bajarildi",
      value: "118/142",
      meta: "Muddatida 89%",
      delta: 4,
      bar: 83
    }), h(Stat, {
      key: 4,
      icon: I.Trophy,
      label: "Komandaga KPI",
      value: 1483,
      meta: "May oyi, 8 mutaxassis",
      delta: 18,
      spark: [820, 940, 1080, 1190, 1320, 1483]
    })]),
    // --- Body grid ---
    h("div", {
      key: "g",
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [
    // LEFT COL: active audits + critical findings
    h("div", {
      key: "L",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h("div", {
      key: "act",
      className: "panel"
    }, [h("div", {
      key: "h",
      className: "panel__h"
    }, [h("div", {
      key: "t",
      className: "panel__t"
    }, [h(I.FolderKanban, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Faol auditlar")]), h("div", {
      key: "a",
      style: {
        display: "flex",
        gap: 6
      }
    }, [h(window.FilterButton, {
      key: 1,
      kind: "audits",
      size: "xs",
      align: "right"
    }), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => setRoute("audits")
    }, [h("span", {
      key: "t"
    }, "Barchasini ko‘rish"), h(I.ChevronRight, {
      key: "i-chevronright",
      size: 12
    })])])]), h("div", {
      key: "b",
      className: "panel__body panel__body--flush"
    }, [h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Audit"), h("th", {
      key: 2
    }, "Tashkilot"), h("th", {
      key: 3
    }, "Holat"), h("th", {
      key: 4
    }, "Guruh rahbari"), h("th", {
      key: 5,
      style: {
        width: 140
      }
    }, "Progres"), h("th", {
      key: 6
    }, "Findinglar")])), h("tbody", {
      key: "b"
    }, myAudits.slice(0, 5).map(a => h("tr", {
      key: a.id,
      onClick: () => openAudit(a.id)
    }, [h("td", {
      key: 1
    }, h("div", {
      className: "cell-title"
    }, [h("span", {
      key: "i",
      className: "icon-box"
    }, h(I.ShieldCheck, {
      key: "i-shieldcheck",
      size: 14
    })), h("div", {
      key: "t"
    }, [h("div", {
      key: "n"
    }, a.title), h("div", {
      key: 1,
      className: "cell-sub font-mono"
    }, a.code + " · " + a.type)])])), h("td", {
      key: 2,
      style: {
        whiteSpace: "nowrap"
      }
    }, D.orgById(a.org).name), h("td", {
      key: 3
    }, statusTag(a.status)), h("td", {
      key: 4
    }, h(Avatar, {
      user: a.leader
    })), h("td", {
      key: 5
    }, [h("div", {
      key: 1,
      className: "progress" + (a.progress > 90 ? " progress--success" : "")
    }, h("span", {
      style: {
        width: a.progress + "%"
      }
    })), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        marginTop: 4
      }
    }, a.progress + "% · " + a.tasks.done + "/" + a.tasks.total)]), h("td", {
      key: 6
    }, h("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, [a.findings.critical > 0 ? h("span", {
      key: 1,
      className: "sev sev--critical"
    }, a.findings.critical) : null, a.findings.high > 0 ? h("span", {
      key: 2,
      className: "sev sev--high"
    }, a.findings.high) : null, a.findings.medium > 0 ? h("span", {
      key: 3,
      className: "sev sev--medium"
    }, a.findings.medium) : null]))])))]))])]),
    // Critical findings panel
    h("div", {
      key: "cf",
      className: "panel"
    }, [h("div", {
      key: "h",
      className: "panel__h"
    }, [h("div", {
      key: "t",
      className: "panel__t"
    }, [h(I.AlertTriangle, {
      key: "i",
      size: 15,
      style: {
        color: "var(--status-danger-fg)"
      }
    }), h("span", {
      key: "t"
    }, "E’tibor talab qiluvchi findinglar")]), h("button", {
      key: "a",
      className: "btn btn--ghost btn--xs",
      onClick: () => setRoute("findings")
    }, [h("span", {
      key: "t"
    }, "Barchasi"), h(I.ChevronRight, {
      key: "i-chevronright",
      size: 12
    })])]), h("div", {
      key: "b",
      className: "panel__body",
      style: {
        padding: 0
      }
    }, D.FINDINGS.filter(f => f.severity === "critical" || f.severity === "high" && f.status === "review").slice(0, 4).map((f, i) => h("div", {
      key: f.id,
      style: {
        padding: "12px 16px",
        borderBottom: i < 3 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer"
      }
    }, [h(Sev, {
      key: 1,
      level: f.severity
    }), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, f.title), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        display: "flex",
        gap: 8,
        marginTop: 2
      }
    }, [h("span", {
      key: 1,
      className: "font-mono"
    }, f.id), h("span", {
      key: "d"
    }, "·"), h("span", {
      key: 2
    }, f.asset), h("span", {
      key: "d2"
    }, "·"), h("span", {
      key: 3
    }, "CVSS " + f.cvss)])]), h(Avatar, {
      key: 3,
      user: f.reportedBy
    }), statusTag(f.status === "approved" ? "approved" : f.status === "review" ? "review" : "in_progress"), h("button", {
      key: 5,
      className: "btn btn--ghost btn--xs btn--icon",
      onClick: () => openFinding(f.id)
    }, h(I.ChevronRight, {
      key: "i-chevronright",
      size: 14
    }))])))])]),
    // RIGHT COL: workflow + ai
    h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h("div", {
      key: "sev",
      className: "panel"
    }, [h("div", {
      key: "h",
      className: "panel__h"
    }, [h("div", {
      key: "t",
      className: "panel__t"
    }, [h(I.PieChart, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Xavf darajalari bo‘yicha")]), h("button", {
      key: "m",
      className: "iconbtn",
      onClick: () => window.showToast("Donut grafik ma'lumotlari yangilanmoqda...", "info")
    }, h(I.MoreHorizontal, {
      key: "i-morehorizontal",
      size: 16
    }))]), h("div", {
      key: "b",
      className: "panel__body",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 20
      }
    }, [h(Donut, {
      key: "d",
      items: [{
        value: critical,
        color: "#f87171"
      }, {
        value: high,
        color: "#fbbf24"
      }, {
        value: medium,
        color: "#38bdf8"
      }, {
        value: low,
        color: "#94a3b8"
      }]
    }), h("div", {
      key: "l",
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [["Critical", critical, "#f87171"], ["High", high, "#fbbf24"], ["Medium", medium, "#38bdf8"], ["Low", low, "#94a3b8"]].map(([l, v, c]) => h("div", {
      key: l,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, [h("span", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 500
      }
    }, [h("span", {
      key: "d",
      style: {
        width: 10,
        height: 10,
        borderRadius: 3,
        background: c
      }
    }), h("span", {
      key: "l"
    }, l)]), h("span", {
      key: 2,
      className: "font-mono font-bold",
      style: {
        fontVariant: "tabular-nums"
      }
    }, v)])))])]), showAI ? h("div", {
      key: "ai",
      className: "ai-card"
    }, h("div", {
      className: "ai-card__inner"
    }, [h("div", {
      key: "h",
      className: "ai-card__head"
    }, [h("div", {
      key: "i",
      className: "ai-card__icon"
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 15
    })), h("span", {
      key: "t",
      className: "ai-card__title"
    }, "Ollama AI tavsiyasi"), h("span", {
      key: "m",
      className: "tag tag--brand",
      style: {
        marginLeft: "auto"
      }
    }, "qwen2.5:14b")]), h("p", {
      key: "p",
      className: "ai-card__body"
    }, "Joriy haftada 5 ta yangi critical finding aniqlandi — 80% i bitta auditdan (AUD-2026-014). Bo‘lim boshlig‘iga ushbu audit bo‘yicha qo‘shimcha resurs ajratish va review jarayonini tezlashtirishni tavsiya etaman."), h("div", {
      key: "a",
      style: {
        display: "flex",
        gap: 8,
        marginTop: 12
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--primary btn--sm",
      onClick: () => setRoute("ai")
    }, [h(I.Sparkles, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "AI tahlilni ochish")]), h("button", {
      key: 2,
      className: "btn btn--soft btn--sm",
      onClick: e => {
        e.target.closest('.ai-card').style.display = 'none';
        window.showToast("AI tavsiya yashirildi", "info");
      }
    }, "Yashirish")])])) : null,
    // KPI top-3
    h("div", {
      key: "kpi",
      className: "panel"
    }, [h("div", {
      key: "h",
      className: "panel__h"
    }, [h("div", {
      key: "t",
      className: "panel__t"
    }, [h(I.Trophy, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Top mutaxassislar — KPI")]), h("button", {
      key: "a",
      className: "btn btn--ghost btn--xs",
      onClick: () => setRoute("kpi")
    }, [h("span", {
      key: "t"
    }, "Hammasi"), h(I.ChevronRight, {
      key: "i-chevronright",
      size: 12
    })])]), h("div", {
      key: "b",
      className: "panel__body",
      style: {
        padding: 0
      }
    }, [h(window.Podium, {
      key: "pod",
      users: D.KPI_USERS.slice(0, 3)
    }), h("div", {
      key: "rest",
      style: {
        borderTop: "1px solid var(--border-color)"
      }
    }, D.KPI_USERS.slice(3, 5).map((k, idx) => {
      const rank = idx + 4;
      return h("div", {
        key: k.user,
        style: {
          padding: "10px 14px",
          borderBottom: idx < 1 ? "1px solid var(--border-color)" : "none",
          display: "flex",
          alignItems: "center",
          gap: 12
        }
      }, [h("span", {
        key: 1,
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 14,
          width: 22,
          color: "var(--text-tertiary)"
        }
      }, "#" + rank), h(Avatar, {
        key: 2,
        user: k.user
      }), h("div", {
        key: 3,
        style: {
          flex: 1,
          minWidth: 0
        }
      }, [h("div", {
        key: 1,
        style: {
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)"
        }
      }, D.userById(k.user).name), h("div", {
        key: 2,
        className: "cell-sub"
      }, k.audits + " audit · " + k.findings + " finding")]), h(Sparkline, {
        key: 4,
        data: k.sparkline,
        w: 56,
        h: 22
      }), h("span", {
        key: 5,
        className: "font-bold tabular",
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 16,
          color: "var(--text-primary)",
          minWidth: 36,
          textAlign: "right"
        }
      }, k.total)]);
    }))])])])])]);
  }
  window.DashboardScreen = DashboardScreen;

  // =========================================================================
  // AUDITS LIST
  // =========================================================================
  function AuditsListScreen({
    role,
    openAudit,
    setRoute,
    setCreateOpen
  }) {
    const [filter, setFilter] = useState("all");
    const tabs = [{
      id: "all",
      label: "Hammasi",
      count: D.AUDITS.length
    }, {
      id: "active",
      label: "Faol",
      count: D.AUDITS.filter(a => ["in_progress", "review", "returned", "planning"].includes(a.status)).length
    }, {
      id: "review",
      label: "Tekshiruvda",
      count: D.AUDITS.filter(a => a.status === "review" || a.status === "returned").length
    }, {
      id: "done",
      label: "Yakunlangan",
      count: D.AUDITS.filter(a => a.status === "approved" || a.status === "completed").length
    }];
    let rows = D.AUDITS;
    if (filter === "active") rows = rows.filter(a => ["in_progress", "review", "returned", "planning"].includes(a.status));
    if (filter === "review") rows = rows.filter(a => ["review", "returned"].includes(a.status));
    if (filter === "done") rows = rows.filter(a => ["approved", "completed"].includes(a.status));
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Auditlar"
      }],
      title: "Auditlar",
      sub: D.AUDITS.length + " ta audit · " + D.AUDITS.filter(a => a.status === "in_progress").length + " jarayonda · " + D.AUDITS.filter(a => a.status === "review").length + " tekshiruvda",
      actions: [h("div", {
        key: 0,
        className: "input-group",
        style: {
          width: 280
        }
      }, [h(I.Search, {
        className: "icon-l"
      }), h("input", {
        className: "input",
        placeholder: "Audit, tashkilot..."
      })]), h(window.FilterButton, {
        key: 1,
        kind: "audits"
      }), role === "departament" || role === "bolim" ? h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => setCreateOpen(true)
      }, [h(I.Plus, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Yangi audit")]) : null]
    }), h(Tabs, {
      key: "t",
      tabs,
      active: filter,
      onChange: setFilter
    }), h("div", {
      key: "g",
      className: "tbl-wrap"
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, h("label", {
      className: "checkbox-row",
      style: {
        gap: 0
      }
    }, h("input", {
      type: "checkbox",
      className: "checkbox"
    }))), h("th", {
      key: 2
    }, h("span", {
      className: "col-sort"
    }, ["Audit", h(I.ChevronsUpDown, {
      size: 12,
      key: "c"
    })])), h("th", {
      key: 3
    }, "Tashkilot"), h("th", {
      key: 4
    }, "Turi"), h("th", {
      key: 5
    }, "Holat"), h("th", {
      key: 6
    }, "Guruh"), h("th", {
      key: 7
    }, "Boshlangan / yakun"), h("th", {
      key: 8
    }, "Progres"), h("th", {
      key: 9
    }, "Findinglar"), h("th", {
      key: 10,
      className: "cell-actions"
    }, "")])), h("tbody", {
      key: "b"
    }, rows.map(a => h("tr", {
      key: a.id,
      onClick: () => openAudit(a.id)
    }, [h("td", {
      key: 1
    }, h("input", {
      type: "checkbox",
      className: "checkbox",
      onClick: e => e.stopPropagation()
    })), h("td", {
      key: 2
    }, h("div", {
      className: "cell-title"
    }, [h("span", {
      key: "i",
      className: "icon-box"
    }, h(a.type.includes("Pentest") ? I.Bug : a.type.includes("Web") ? I.Globe : I.ShieldCheck, {
      size: 14
    })), h("div", {
      key: "t"
    }, [h("div", {
      key: "n"
    }, a.title), h("div", {
      key: 2,
      className: "cell-sub font-mono"
    }, a.code)])])), h("td", {
      key: 3
    }, D.orgById(a.org).name), h("td", {
      key: 4
    }, h("span", {
      className: "tag tag--outline"
    }, a.type)), h("td", {
      key: 5
    }, statusTag(a.status)), h("td", {
      key: 6
    }, h(AvatarStack, {
      users: a.members
    })), h("td", {
      key: 7,
      className: "tabular"
    }, h("div", {
      key: "n"
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 12.5
      }
    }, a.startDate), h("div", {
      key: 2,
      className: "cell-sub"
    }, "→ " + a.endDate)])), h("td", {
      key: 8
    }, [h("div", {
      key: 1,
      className: "progress" + (a.progress > 90 ? " progress--success" : ""),
      style: {
        width: 80
      }
    }, h("span", {
      style: {
        width: a.progress + "%"
      }
    })), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        marginTop: 4
      }
    }, a.progress + "%")]), h("td", {
      key: 9
    }, h("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, [a.findings.critical > 0 ? h("span", {
      key: 1,
      className: "sev sev--critical"
    }, a.findings.critical) : null, a.findings.high > 0 ? h("span", {
      key: 2,
      className: "sev sev--high"
    }, a.findings.high) : null, a.findings.medium > 0 ? h("span", {
      key: 3,
      className: "sev sev--medium"
    }, a.findings.medium) : null, a.findings.low > 0 ? h("span", {
      key: 4,
      className: "sev sev--low"
    }, a.findings.low) : null, a.findings.critical + a.findings.high + a.findings.medium + a.findings.low === 0 ? h("span", {
      key: "n",
      className: "cell-sub"
    }, "—") : null])), h("td", {
      key: 10,
      className: "cell-actions"
    }, h("button", {
      className: "btn btn--ghost btn--xs btn--icon",
      onClick: e => e.stopPropagation()
    }, h(I.MoreHorizontal, {
      key: "i-morehorizontal",
      size: 14
    })))])))])))]);
  }
  window.AuditsListScreen = AuditsListScreen;

  // =========================================================================
  // MY TASKS — Kanban + list
  // =========================================================================
  function MyTasksScreen({
    role,
    setRoute,
    openTask,
    setCreateTaskOpen
  }) {
    const [view, setView] = useState("kanban");
    const tasks = D.TASKS; // all tasks for demo; filterable by assignee in real life
    const cols = [{
      key: "new",
      title: "Yangi"
    }, {
      key: "in_progress",
      title: "Jarayonda"
    }, {
      key: "review",
      title: "Tekshiruvda"
    }, {
      key: "blocked",
      title: "Blok"
    }, {
      key: "done",
      title: "Bajarilgan"
    }];
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Mening vazifalarim"
      }],
      title: "Mening vazifalarim",
      sub: tasks.length + " ta vazifa · " + tasks.filter(t => t.status === "in_progress").length + " jarayonda · " + tasks.filter(t => t.priority === "Yuqori").length + " yuqori ustuvor",
      actions: [h("div", {
        key: "v",
        style: {
          display: "inline-flex",
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-color)",
          borderRadius: 6,
          padding: 3
        }
      }, [["kanban", "Kanban", I.Layers], ["table", "Jadval", I.LayoutDashboard]].map(([k, l, ic]) => h("button", {
        key: k,
        className: "btn btn--ghost btn--xs",
        onClick: () => setView(k),
        style: view === k ? {
          background: "var(--bg-surface)",
          color: "var(--brand)",
          boxShadow: "var(--shadow-xs)"
        } : {}
      }, [h(ic, {
        size: 13
      }), h("span", {
        key: "t"
      }, l)]))), h(window.FilterButton, {
        key: 2,
        kind: "tasks"
      }), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: () => setCreateTaskOpen && setCreateTaskOpen(true)
      }, [h(I.Plus, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Vazifa")])]
    }),
    // Quick filter row
    h("div", {
      key: "qf",
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 16,
        flexWrap: "wrap"
      }
    }, [h("span", {
      key: 0,
      className: "tag tag--brand"
    }, "Audit: AUD-2026-014"), h("span", {
      key: 1,
      className: "tag tag--outline"
    }, "Men uchun (8)"), h("span", {
      key: 2,
      className: "tag tag--outline"
    }, "Tugaydigan: 3 kun"), h("span", {
      key: 3,
      className: "tag tag--outline"
    }, "Yuqori ustuvor")]), view === "kanban" ? h(Kanban, {
      key: "k",
      cols,
      tasks,
      openTask
    }) : h(TaskTable, {
      key: "t",
      tasks,
      openTask
    })]);
  }
  window.MyTasksScreen = MyTasksScreen;
  function Kanban({
    cols,
    tasks,
    openTask
  }) {
    return h("div", {
      className: "kanban"
    }, cols.map(col => {
      const colTasks = tasks.filter(t => t.status === col.key);
      const colColor = D.TASK_STATUS[col.key].color;
      return h("div", {
        key: col.key,
        className: "kanban__col"
      }, [h("div", {
        key: "h",
        className: "kanban__head"
      }, [h("span", {
        className: "kanban__title",
        key: "t"
      }, [h("span", {
        key: "d",
        className: "dot-status",
        style: {
          background: colColor
        }
      }), h("span", {
        key: "n"
      }, col.title)]), h("span", {
        key: "c",
        className: "kanban__count"
      }, colTasks.length)]), h("div", {
        key: "l",
        className: "kanban__list"
      }, colTasks.map(t => h("div", {
        key: t.id,
        className: "k-card",
        onClick: () => openTask && openTask(t.id)
      }, [h("div", {
        key: "tp",
        className: "k-card__top"
      }, [h("span", {
        key: "i",
        className: "k-card__id"
      }, t.id), h("span", {
        key: "p",
        className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost")
      }, t.priority)]), h("div", {
        key: "t",
        className: "k-card__title"
      }, t.title), h("div", {
        key: "tag",
        style: {
          display: "flex",
          gap: 6,
          flexWrap: "wrap"
        }
      }, [h("span", {
        key: 1,
        className: "tag tag--outline"
      }, t.type), t.findings ? h("span", {
        key: 2,
        className: "tag tag--danger"
      }, [h(I.AlertTriangle, {
        size: 10,
        style: {
          marginRight: 2
        }
      }), t.findings + " finding"]) : null]), h("div", {
        key: "m",
        className: "k-card__meta"
      }, [h("span", {
        key: 1,
        className: "pill"
      }, [h(I.Calendar, {
        key: "i-calendar",
        size: 12
      }), t.due]), h(Avatar, {
        key: 2,
        user: t.assignee
      })])]))), h("button", {
        key: "add",
        className: "btn btn--ghost btn--sm",
        style: {
          margin: "0 10px 10px",
          justifyContent: "center"
        },
        onClick: () => window.__openCreateTask && window.__openCreateTask()
      }, [h(I.Plus, {
        key: "i",
        size: 13
      }), "Vazifa qo‘shish"])]);
    }));
  }
  function TaskTable({
    tasks,
    openTask
  }) {
    return h("div", {
      className: "tbl-wrap"
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "ID"), h("th", {
      key: 2
    }, "Vazifa"), h("th", {
      key: 3
    }, "Turi"), h("th", {
      key: 4
    }, "Ustuvorlik"), h("th", {
      key: 5
    }, "Holat"), h("th", {
      key: 6
    }, "Mas’ul"), h("th", {
      key: 7
    }, "Muddat"), h("th", {
      key: 8
    }, "Findinglar"), h("th", {
      key: 9
    }, "KPI")])), h("tbody", {
      key: "b"
    }, tasks.map(t => h("tr", {
      key: t.id,
      onClick: () => openTask && openTask(t.id)
    }, [h("td", {
      key: 1,
      className: "cell-mono"
    }, t.id), h("td", {
      key: 2,
      className: "text-primary font-semi"
    }, t.title), h("td", {
      key: 3
    }, h("span", {
      className: "tag tag--outline"
    }, t.type)), h("td", {
      key: 4
    }, h("span", {
      className: "tag " + (t.priority === "Yuqori" ? "tag--danger" : t.priority === "O‘rta" ? "tag--warning" : "tag--ghost")
    }, t.priority)), h("td", {
      key: 5
    }, h("span", {
      className: "tag tag--info"
    }, D.TASK_STATUS[t.status].label)), h("td", {
      key: 6
    }, h(Avatar, {
      user: t.assignee
    })), h("td", {
      key: 7,
      className: "tabular"
    }, t.due), h("td", {
      key: 8,
      className: "tabular text-primary font-semi"
    }, t.findings || "—"), h("td", {
      key: 9,
      className: "tabular text-brand font-semi"
    }, t.kpi ? "+" + t.kpi : "—")])))])));
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/screens-overview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/screens-profile.jsx
try { (() => {
/* Profile screen — current user's profile, KPI, sessions, settings */
(function () {
  const {
    useState,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  function ProfileScreen({
    role,
    setRoute
  }) {
    const user = D.USERS.find(u => u.role === role) || D.USERS[0];
    const kpi = D.KPI_USERS.find(k => k.user === user.id) || {
      audits: 0,
      tasks: 0,
      findings: 0,
      total: 0,
      delta: 0,
      sparkline: []
    };
    const myTokens = D.TOKENS.filter(t => t.user === user.id);
    const myFindings = D.FINDINGS.filter(f => f.reportedBy === user.id);
    const myTasks = D.TASKS.filter(t => t.assignee === user.id);
    const [tab, setTab] = useState("overview");
    const tabs = [{
      id: "overview",
      label: "Umumiy ma'lumot",
      icon: I.LayoutDashboard
    }, {
      id: "activity",
      label: "Faollik",
      icon: I.Activity,
      count: 18
    }, {
      id: "sessions",
      label: "Sessiyalar va qurilmalar",
      icon: I.Monitor
    }, {
      id: "security",
      label: "Xavfsizlik",
      icon: I.ShieldCheck
    }, {
      id: "settings",
      label: "Sozlamalar",
      icon: I.Settings
    }];
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Mening profilim"
      }],
      title: "Mening profilim",
      sub: user.title + " · " + user.dept,
      actions: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("KPI hisoboti XLSX formatda yuklab olindi", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "KPI eksport")]), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => window.showToast("Profilni tahrirlash uchun Sozlamalar tabiga o'ting", "info")
      }, [h(I.Edit3, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Profilni tahrirlash")])]
    }),
    // Hero card
    h("div", {
      key: "hero",
      className: "profile-hero"
    }, [h("div", {
      key: "av",
      className: "profile-hero__av"
    }, h(Avatar, {
      user,
      size: "xl"
    })), h("div", {
      key: "info",
      className: "profile-hero__info"
    }, [h("div", {
      key: 1,
      className: "profile-hero__name"
    }, [h("span", {
      key: "n"
    }, user.name), h("span", {
      key: "b",
      className: "tag tag--success"
    }, [h("span", {
      className: "dot",
      style: {
        width: 6,
        height: 6
      }
    }), "Onlayn"])]), h("div", {
      key: 2,
      className: "profile-hero__role"
    }, user.title), h("div", {
      key: 3,
      className: "profile-hero__meta"
    }, [h("span", {
      key: 1
    }, [h(I.Building2, {
      size: 13
    }), h("span", null, user.dept)]), h("span", {
      key: 2
    }, [h(I.Mail, {
      size: 13
    }), h("span", {
      className: "font-mono"
    }, user.id + "@gov.uz")]), h("span", {
      key: 3
    }, [h(I.Calendar, {
      size: 13
    }), h("span", null, "Tizimga qo'shilgan: 2023-08-14")]), h("span", {
      key: 4
    }, [h(I.History, {
      size: 13
    }), h("span", null, "Oxirgi kirish: bugun 09:42")])])]), h("div", {
      key: "kpi",
      className: "profile-hero__kpi"
    }, [h("div", {
      key: 1,
      className: "profile-kpi"
    }, [h("div", {
      className: "profile-kpi__v tabular"
    }, kpi.total), h("div", {
      className: "profile-kpi__l"
    }, "KPI ball"), kpi.delta != null ? h("div", {
      className: "profile-kpi__d" + (kpi.delta < 0 ? " is-neg" : "")
    }, [kpi.delta < 0 ? h(I.TrendingDown, {
      size: 11
    }) : h(I.TrendingUp, {
      size: 11
    }), h("span", null, (kpi.delta > 0 ? "+" : "") + kpi.delta + "%")]) : null]), h("div", {
      key: 2,
      className: "profile-kpi"
    }, [h("div", {
      className: "profile-kpi__v tabular"
    }, kpi.audits), h("div", {
      className: "profile-kpi__l"
    }, "Auditlar")]), h("div", {
      key: 3,
      className: "profile-kpi"
    }, [h("div", {
      className: "profile-kpi__v tabular"
    }, kpi.tasks), h("div", {
      className: "profile-kpi__l"
    }, "Vazifalar")]), h("div", {
      key: 4,
      className: "profile-kpi"
    }, [h("div", {
      className: "profile-kpi__v tabular"
    }, kpi.findings), h("div", {
      className: "profile-kpi__l"
    }, "Findinglar")])])]), h(Tabs, {
      key: "t",
      tabs,
      active: tab,
      onChange: setTab
    }), tab === "overview" ? h(OverviewTab, {
      key: "ov",
      user,
      kpi,
      myTasks,
      myFindings,
      setRoute
    }) : tab === "activity" ? h(ActivityTab, {
      key: "ac",
      user
    }) : tab === "sessions" ? h(SessionsTab, {
      key: "se",
      user,
      myTokens
    }) : tab === "security" ? h(SecurityTab, {
      key: "sc",
      user
    }) : tab === "settings" ? h(SettingsTab, {
      key: "st",
      user
    }) : null]);
  }
  window.ProfileScreen = ProfileScreen;

  // ---------- Overview tab ----------
  function OverviewTab({
    user,
    kpi,
    myTasks,
    myFindings,
    setRoute
  }) {
    const myAudits = D.AUDITS.filter(a => a.members && a.members.includes(user.id)).slice(0, 4);
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [h("div", {
      key: "L",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // KPI breakdown
    h("div", {
      key: "kpi",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.BarChart3, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "KPI dinamikasi")]), h("div", {
      key: 2,
      className: "tag tag--success"
    }, [h(I.TrendingUp, {
      size: 11
    }), "+" + (kpi.delta || 0) + "% (oxirgi oy)"])]), h("div", {
      className: "panel__body",
      key: 2
    }, [kpi.sparkline && kpi.sparkline.length ? h("div", {
      key: 0,
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        height: 140,
        padding: "12px 8px",
        marginBottom: 16,
        borderBottom: "1px dashed var(--border-color)"
      }
    }, kpi.sparkline.map((v, i) => {
      const max = Math.max(...kpi.sparkline);
      const hp = v / max * 100;
      const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun"];
      return h("div", {
        key: i,
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6
        }
      }, [h("div", {
        key: 1,
        className: "tabular",
        style: {
          fontSize: 11,
          color: "var(--text-tertiary)",
          fontWeight: 600
        }
      }, v), h("div", {
        key: 2,
        style: {
          width: "100%",
          height: hp + "%",
          background: i === kpi.sparkline.length - 1 ? "var(--brand)" : "var(--brand-soft-hover)",
          borderRadius: "4px 4px 0 0",
          minHeight: 8
        }
      }), h("div", {
        key: 3,
        style: {
          fontSize: 10,
          color: "var(--text-tertiary)",
          letterSpacing: "0.04em"
        }
      }, months[i] || "—")]);
    })) : null, h("div", {
      key: 1,
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16
      }
    }, [h(KpiBlock, {
      key: 1,
      label: "Bajarilgan auditlar",
      value: kpi.audits,
      target: 8,
      color: "var(--brand)"
    }), h(KpiBlock, {
      key: 2,
      label: "Vazifalar bajarilishi",
      value: kpi.tasks,
      target: 40,
      color: "var(--status-info-fg)"
    }), h(KpiBlock, {
      key: 3,
      label: "Aniqlangan findinglar",
      value: kpi.findings,
      target: 30,
      color: "var(--status-warning-fg)"
    })])])]),
    // My audits
    h("div", {
      key: "aud",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.FolderKanban, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Mening auditlarim"), h("span", {
      key: "c",
      className: "count"
    }, myAudits.length)]), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => setRoute("audits")
    }, [h("span", {
      key: "t"
    }, "Hammasi"), h(I.ChevronRight, {
      key: "i",
      size: 12
    })])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, myAudits.length === 0 ? h("div", {
      className: "empty-state"
    }, [h(I.FolderKanban, {
      size: 28,
      key: 0
    }), h("div", {
      key: 1
    }, "Hozircha biriktirilgan audit yo'q")]) : myAudits.map((a, i) => h("div", {
      key: a.id,
      style: {
        padding: "12px 16px",
        borderBottom: i < myAudits.length - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer"
      }
    }, [h("div", {
      key: 1,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      className: "cell-title",
      style: {
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 2
      }
    }, a.title), h("div", {
      key: 2,
      className: "cell-sub font-mono",
      style: {
        fontSize: 11
      }
    }, a.code + " · " + a.type)]), h("div", {
      key: 2,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, [statusTag(a.status), h("span", {
      key: 1,
      className: "tabular text-secondary",
      style: {
        fontSize: 12,
        fontWeight: 600,
        minWidth: 36,
        textAlign: "right"
      }
    }, a.progress + "%")])])))])]), h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Quick stats
    h("div", {
      key: "s",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.CheckSquare, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Mening vazifalarim")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: "10px 0"
      }
    }, Object.entries({
      new: "Yangi",
      in_progress: "Jarayonda",
      review: "Tekshiruvda",
      done: "Bajarilgan",
      blocked: "Blok"
    }).map(([k, lbl]) => {
      const n = myTasks.filter(t => t.status === k).length;
      const total = myTasks.length || 1;
      const w = n / total * 100;
      return h("div", {
        key: k,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 16px"
        }
      }, [h("span", {
        key: 1,
        style: {
          flex: "0 0 100px",
          fontSize: 12,
          color: "var(--text-secondary)"
        }
      }, lbl), h("div", {
        key: 2,
        style: {
          flex: 1,
          height: 6,
          background: "var(--bg-surface-3)",
          borderRadius: 3,
          overflow: "hidden"
        }
      }, h("div", {
        style: {
          width: w + "%",
          height: "100%",
          background: k === "done" ? "var(--status-success-fg)" : k === "blocked" ? "var(--status-danger-fg)" : "var(--brand)"
        }
      })), h("span", {
        key: 3,
        className: "tabular text-primary font-semi",
        style: {
          fontSize: 12,
          minWidth: 22,
          textAlign: "right"
        }
      }, n)]);
    }))]),
    // Badges / achievements
    h("div", {
      key: "b",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Trophy, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Yutuqlar va belgilar")])), h("div", {
      className: "panel__body",
      key: 2
    }, h("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 8
      }
    }, [{
      icon: I.Zap,
      title: "Tezkor auditor",
      sub: "5 ta auditni muddatidan oldin",
      tone: "warning"
    }, {
      icon: I.ShieldAlert,
      title: "Critical detector",
      sub: "3 ta kritik finding topdi",
      tone: "danger"
    }, {
      icon: I.Sparkles,
      title: "AI ustasi",
      sub: "AI tahlilidan 92% foydalanish",
      tone: "info"
    }, {
      icon: I.Star,
      title: "Top 3 KPI",
      sub: "Bo'lim ichida",
      tone: "success"
    }].map((b, i) => h("div", {
      key: i,
      className: "achievement achievement--" + b.tone
    }, [h(b.icon, {
      key: 1,
      size: 18
    }), h("div", {
      key: 2,
      style: {
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 11.5,
        fontWeight: 700,
        color: "var(--text-primary)",
        lineHeight: 1.3
      }
    }, b.title), h("div", {
      key: 2,
      style: {
        fontSize: 10.5,
        color: "var(--text-tertiary)",
        lineHeight: 1.3,
        marginTop: 2
      }
    }, b.sub)])]))))]),
    // Last findings
    myFindings.length > 0 ? h("div", {
      key: "f",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.AlertTriangle, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "So'nggi findinglarim"), h("span", {
      key: "c",
      className: "count"
    }, myFindings.length)])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, myFindings.slice(0, 4).map((f, i) => h("div", {
      key: f.id,
      style: {
        padding: "10px 16px",
        borderBottom: i < Math.min(myFindings.length, 4) - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer"
      }
    }, [h(window.Sev, {
      key: 1,
      level: f.severity
    }), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--text-primary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, f.title), h("div", {
      key: 2,
      className: "cell-sub font-mono",
      style: {
        fontSize: 10.5
      }
    }, f.id + " · " + f.date)])])))]) : null])]);
  }
  function KpiBlock({
    label,
    value,
    target,
    color
  }) {
    const pct = Math.min(100, Math.round(value / target * 100));
    return h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline"
      }
    }, [h("span", {
      key: 1,
      className: "cell-sub",
      style: {
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 700
      }
    }, label), h("span", {
      key: 2,
      className: "tabular",
      style: {
        fontSize: 11,
        color: "var(--text-tertiary)",
        fontWeight: 600
      }
    }, value + " / " + target)]), h("div", {
      key: 2,
      className: "tabular",
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 26,
        fontWeight: 800,
        color: "var(--text-primary)",
        letterSpacing: "-0.02em"
      }
    }, pct + "%"), h("div", {
      key: 3,
      style: {
        height: 6,
        background: "var(--bg-surface-3)",
        borderRadius: 3,
        overflow: "hidden"
      }
    }, h("div", {
      style: {
        width: pct + "%",
        height: "100%",
        background: color,
        borderRadius: 3
      }
    }))]);
  }

  // ---------- Activity tab ----------
  function ActivityTab({
    user
  }) {
    const items = [{
      time: "Bugun, 09:42",
      icon: I.LogIn,
      tone: "neutral",
      title: "Tizimga kirildi",
      sub: "IP 10.20.4.78 · Chrome 124 · Windows 11"
    }, {
      time: "Bugun, 09:48",
      icon: I.AlertTriangle,
      tone: "danger",
      title: "Yangi finding qo'shildi",
      sub: "F-2026-0347 — Telnet (port 23) ochiq"
    }, {
      time: "Bugun, 10:14",
      icon: I.CheckSquare,
      tone: "success",
      title: "Vazifa yakunlandi",
      sub: "T-115 — AD parol siyosatini tahlil qilish"
    }, {
      time: "Bugun, 11:02",
      icon: I.Sparkles,
      tone: "info",
      title: "AI tahlili so'raldi",
      sub: "F-2026-0341 uchun remediation tavsiyasi"
    }, {
      time: "Bugun, 12:36",
      icon: I.Upload,
      tone: "neutral",
      title: "Dalil fayllar yuklandi",
      sub: "3 ta skrinshot · 1 PCAP · 4.2 MB"
    }, {
      time: "Kecha, 17:21",
      icon: I.Send,
      tone: "info",
      title: "Hisobotni ko'rib chiqishga yubordi",
      sub: "AUD-2026-013 — Soliq qo'mitasi (Executive)"
    }, {
      time: "Kecha, 14:08",
      icon: I.FolderKanban,
      tone: "success",
      title: "Audit guruhiga qo'shildi",
      sub: "AUD-2026-014 — Aloqa va kommunikatsiya vazirligi"
    }, {
      time: "2 kun oldin",
      icon: I.KeyRound,
      tone: "warning",
      title: "Yangi token qabul qilindi",
      sub: "tk_a91x...c47e · Windows 11 · DESKTOP-MS-NB14"
    }, {
      time: "2 kun oldin",
      icon: I.Edit3,
      tone: "neutral",
      title: "Profil sozlamalari o'zgartirildi",
      sub: "Telefon raqami yangilandi"
    }, {
      time: "3 kun oldin",
      icon: I.LogIn,
      tone: "neutral",
      title: "Tizimga kirildi",
      sub: "IP 10.20.4.78 · Chrome 124 · Windows 11"
    }];
    return h("div", {
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Activity, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Faollik tarixi")]), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 6
      }
    }, [h(window.FilterButton, {
      key: 1,
      kind: "logs",
      size: "xs"
    }), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("Faollik tarixi CSV formatda yuklab olindi", "success")
    }, [h(I.Download, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Eksport")])])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: "8px 0"
      }
    }, h("div", {
      className: "profile-tl"
    }, items.map((it, i) => h("div", {
      key: i,
      className: "profile-tl__row"
    }, [h("span", {
      key: 0,
      className: "profile-tl__icon profile-tl__icon--" + it.tone
    }, h(it.icon, {
      size: 13
    })), h("div", {
      key: 1,
      className: "profile-tl__body"
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12
      }
    }, [h("span", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, it.title), h("span", {
      key: 2,
      className: "tabular",
      style: {
        fontSize: 11,
        color: "var(--text-tertiary)"
      }
    }, it.time)]), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11.5,
        marginTop: 2
      }
    }, it.sub)])]))))]);
  }

  // ---------- Sessions tab ----------
  function SessionsTab({
    user,
    myTokens
  }) {
    const sessions = [{
      id: 1,
      current: true,
      device: "Chrome 124 · Windows 11",
      location: "Toshkent, O'zbekiston",
      ip: "10.20.4.78",
      last: "Hozir faol",
      icon: I.Monitor
    }, {
      id: 2,
      current: false,
      device: "Safari 17 · macOS 14",
      location: "Toshkent, O'zbekiston",
      ip: "10.20.4.78",
      last: "Kecha, 22:14",
      icon: I.Monitor
    }, {
      id: 3,
      current: false,
      device: "Auditor iOS · iPhone 15",
      location: "Toshkent, O'zbekiston",
      ip: "10.20.4.142",
      last: "3 kun oldin",
      icon: I.Smartphone
    }, {
      id: 4,
      current: false,
      device: "Chrome 123 · Ubuntu 22.04",
      location: "Samarqand, O'zbekiston",
      ip: "10.30.1.18",
      last: "12 kun oldin",
      icon: I.Monitor
    }];
    return h("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Active sessions
    h("div", {
      key: "s",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Monitor, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Aktiv sessiyalar")]), h("button", {
      key: 2,
      className: "btn btn--soft btn--xs",
      onClick: async () => {
        const ok = await window.confirmAction({
          title: "Boshqa sessiyalardan chiqish",
          body: "Joriy sessiyani saqlab, qolgan barcha qurilmalardan chiqishni xohlaysizmi?",
          confirmLabel: "Chiqish",
          danger: true
        });
        if (ok) window.showToast("3 ta boshqa sessiyadan chiqildi", "warning");
      }
    }, [h(I.LogOut, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Boshqa qurilmalardan chiqish")])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, sessions.map((s, i) => h("div", {
      key: s.id,
      style: {
        padding: "14px 16px",
        borderBottom: i < sessions.length - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, [h("div", {
      key: 1,
      style: {
        width: 36,
        height: 36,
        borderRadius: 8,
        background: s.current ? "var(--brand-soft)" : "var(--bg-surface-2)",
        display: "grid",
        placeItems: "center",
        color: s.current ? "var(--brand)" : "var(--text-secondary)"
      }
    }, h(s.icon, {
      size: 18
    })), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, [h("span", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, s.device), s.current ? h("span", {
      key: 2,
      className: "tag tag--success"
    }, [h("span", {
      className: "dot",
      style: {
        width: 6,
        height: 6
      }
    }), "Joriy sessiya"]) : null]), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11.5,
        marginTop: 2
      }
    }, s.location + " · " + s.ip + " · " + s.last)]), !s.current ? h("button", {
      key: 3,
      className: "btn btn--ghost btn--xs btn--icon",
      title: "Sessiyani tugatish"
    }, h(I.X, {
      size: 14
    })) : null])))]),
    // My audit tokens
    h("div", {
      key: "t",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.KeyRound, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Mening audit tokenlarim"), h("span", {
      key: "c",
      className: "count"
    }, myTokens.length)])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, myTokens.length === 0 ? h("div", {
      className: "empty-state"
    }, [h(I.KeyRound, {
      size: 28,
      key: 0
    }), h("div", {
      key: 1
    }, "Sizga biriktirilgan audit tokenlari yo'q")]) : myTokens.map((t, i) => h("div", {
      key: t.id,
      style: {
        padding: "12px 16px",
        borderBottom: i < myTokens.length - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, [h("div", {
      key: 0,
      style: {
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--brand-soft)",
        display: "grid",
        placeItems: "center",
        color: "var(--brand)"
      }
    }, h(I.KeyRound, {
      size: 15
    })), h("div", {
      key: 1,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      className: "font-mono",
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, t.id), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11
      }
    }, t.audit + " · " + t.hostname + " · " + t.os)]), h("span", {
      key: 2,
      className: "tag " + (t.status === "active" ? "tag--success" : t.status === "expired" ? "tag--outline" : "tag--danger")
    }, t.status)])))])]);
  }

  // ---------- Security tab ----------
  function SecurityTab({
    user
  }) {
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [
    // Password
    h("div", {
      key: "p",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Lock, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Parol")])), h("div", {
      className: "panel__body",
      key: 2
    }, [h("div", {
      key: 1,
      className: "form-grid"
    }, [h("div", {
      className: "field span-2",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Joriy parol"), h("input", {
      className: "input",
      type: "password",
      placeholder: "••••••••••"
    })]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Yangi parol"), h("input", {
      className: "input",
      type: "password"
    })]), h("div", {
      className: "field",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Tasdiqlash"), h("input", {
      className: "input",
      type: "password"
    })])]), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11.5,
        marginTop: 12,
        marginBottom: 12
      }
    }, "Oxirgi marta o'zgartirilgan: 47 kun oldin · Kelgusi muddat: 43 kun"), h("button", {
      key: 3,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("Parol muvaffaqiyatli yangilandi", "success")
    }, [h(I.Check, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Parolni yangilash")])])]),
    // 2FA
    h("div", {
      key: "f",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.ShieldCheck, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Ikki bosqichli autentifikatsiya")]), h("span", {
      key: 2,
      className: "tag tag--success"
    }, [h(I.Check, {
      size: 11
    }), "Yoqilgan"])]), h("div", {
      className: "panel__body",
      key: 2
    }, [h(SecurityRow, {
      key: 1,
      icon: I.Smartphone,
      title: "Autentifikator ilovasi",
      sub: "Google Authenticator · ulangan",
      active: true
    }), h(SecurityRow, {
      key: 2,
      icon: I.Mail,
      title: "Email kodi",
      sub: user.id + "@gov.uz",
      active: true
    }), h(SecurityRow, {
      key: 3,
      icon: I.Key,
      title: "Zaxira kodlari",
      sub: "8 ta zaxira kod qoldi",
      active: true
    }), h(SecurityRow, {
      key: 4,
      icon: I.Fingerprint,
      title: "WebAuthn / qurilma kaliti",
      sub: "Yoqilmagan",
      active: false
    })])]),
    // Access logs warning
    h("div", {
      key: "a",
      className: "panel",
      style: {
        gridColumn: "span 2"
      }
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.ShieldAlert, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Xavfsizlik signal va alarmlar")])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, [h(AlertRow, {
      key: 1,
      tone: "warning",
      title: "Notanish IP'dan kirish urinishi",
      sub: "192.168.42.7 · 4 kun oldin · bloklandi"
    }), h(AlertRow, {
      key: 2,
      tone: "info",
      title: "Yangi qurilma ro'yxatdan o'tdi",
      sub: "Auditor iOS · iPhone 15 · 3 kun oldin · tasdiqlangan"
    }), h(AlertRow, {
      key: 3,
      tone: "success",
      title: "Parol siyosati talablariga javob beradi",
      sub: "16 belgi · raqam + maxsus belgi · majburiy yangilash 90 kun"
    })])])]);
  }
  function SecurityRow({
    icon,
    title,
    sub,
    active
  }) {
    return h("div", {
      className: "sec-row"
    }, [h("div", {
      key: 1,
      className: "sec-row__icon" + (active ? " is-on" : "")
    }, h(icon, {
      size: 16
    })), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, title), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11.5
      }
    }, sub)]), h("label", {
      key: 3,
      className: "switch"
    }, [h("input", {
      type: "checkbox",
      defaultChecked: active
    }), h("span", {
      className: "switch__track"
    }, h("span", {
      className: "switch__thumb"
    }))])]);
  }
  function AlertRow({
    tone,
    title,
    sub
  }) {
    return h("div", {
      style: {
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, [h("span", {
      key: 0,
      className: "notif-item__icon notif-item__icon--" + tone,
      style: {
        width: 26,
        height: 26,
        borderRadius: 8
      }
    }, h(tone === "warning" ? I.AlertTriangle : tone === "success" ? I.ShieldCheck : I.Info || I.Bell, {
      size: 13
    })), h("div", {
      key: 1,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, title), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11
      }
    }, sub)])]);
  }

  // ---------- Settings tab ----------
  function SettingsTab({
    user
  }) {
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [
    // Personal info
    h("div", {
      key: "p",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.User, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Shaxsiy ma'lumotlar")])), h("div", {
      className: "panel__body",
      key: 2
    }, h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Ism"), h("input", {
      className: "input",
      defaultValue: user.name.split(" ")[0]
    })]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Familiya"), h("input", {
      className: "input",
      defaultValue: user.name.split(" ")[1] || ""
    })]), h("div", {
      className: "field span-2",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Lavozim"), h("input", {
      className: "input",
      defaultValue: user.title,
      disabled: true
    }), h("label", {
      className: "field__hint"
    }, "Lavozimni faqat admin o'zgartira oladi")]), h("div", {
      className: "field",
      key: 4
    }, [h("label", {
      className: "field__label"
    }, "Telefon"), h("input", {
      className: "input",
      defaultValue: "+998 90 123-45-67"
    })]), h("div", {
      className: "field",
      key: 5
    }, [h("label", {
      className: "field__label"
    }, "Ish telefoni"), h("input", {
      className: "input",
      defaultValue: "+998 71 200-12-34 (1142)"
    })])]))]),
    // Notifications
    h("div", {
      key: "n",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Bell, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Bildirishnoma sozlamalari")])), h("div", {
      className: "panel__body",
      key: 2
    }, [h(SecurityRow, {
      key: 1,
      icon: I.AlertTriangle,
      title: "Yangi critical/high finding",
      sub: "Web + email + Telegram",
      active: true
    }), h(SecurityRow, {
      key: 2,
      icon: I.CheckSquare,
      title: "Vazifa muddati yaqinlashishi",
      sub: "Web + email (1 kun oldin)",
      active: true
    }), h(SecurityRow, {
      key: 3,
      icon: I.UserCheck,
      title: "Audit guruhiga qo'shilish",
      sub: "Faqat web",
      active: true
    }), h(SecurityRow, {
      key: 4,
      icon: I.FileText,
      title: "Hisobot tayyor",
      sub: "Email",
      active: false
    }), h(SecurityRow, {
      key: 5,
      icon: I.Refresh,
      title: "EXE agent sinxronlash",
      sub: "Faqat xato bo'lganda",
      active: true
    })])]),
    // Language + theme + appearance
    h("div", {
      key: "l",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Globe, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Til va hudud")])), h("div", {
      className: "panel__body",
      key: 2
    }, h("div", {
      className: "form-grid"
    }, [h("div", {
      className: "field",
      key: 1
    }, [h("label", {
      className: "field__label"
    }, "Interfeys tili"), h("select", {
      className: "select",
      defaultValue: "uz"
    }, [h("option", {
      key: 1,
      value: "uz"
    }, "O'zbek (lotin)"), h("option", {
      key: 2,
      value: "uz-cyrl"
    }, "O'zbek (kirill)"), h("option", {
      key: 3,
      value: "ru"
    }, "Rus"), h("option", {
      key: 4,
      value: "en"
    }, "English")])]), h("div", {
      className: "field",
      key: 2
    }, [h("label", {
      className: "field__label"
    }, "Vaqt zonasi"), h("select", {
      className: "select",
      defaultValue: "tashkent"
    }, [h("option", {
      key: 1,
      value: "tashkent"
    }, "Asia/Tashkent (UTC+5)"), h("option", {
      key: 2,
      value: "samarkand"
    }, "Asia/Samarkand (UTC+5)")])]), h("div", {
      className: "field span-2",
      key: 3
    }, [h("label", {
      className: "field__label"
    }, "Sana formati"), h("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, ["YYYY-MM-DD", "DD.MM.YYYY", "DD/MM/YYYY"].map((f, i) => h("label", {
      key: f,
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        border: "1px solid " + (i === 0 ? "var(--brand)" : "var(--border-color)"),
        background: i === 0 ? "var(--brand-soft)" : "var(--bg-surface)",
        borderRadius: 6,
        cursor: "pointer"
      }
    }, [h("input", {
      type: "radio",
      className: "radio",
      name: "df",
      defaultChecked: i === 0
    }), h("span", {
      className: "font-mono",
      style: {
        fontSize: 12
      }
    }, f)])))])]))]),
    // Danger zone
    h("div", {
      key: "d",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t",
      style: {
        color: "var(--status-danger-fg)"
      }
    }, [h(I.ShieldAlert, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Xavf zonasi")])), h("div", {
      className: "panel__body",
      key: 2
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: 12,
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        marginBottom: 10
      }
    }, [h("div", {
      key: 1
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "Barcha sessiyalardan chiqish"), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11.5
      }
    }, "Joriy sessiyani saqlab, qolgan barcha qurilmalardan chiqish")]), h("button", {
      key: 2,
      className: "btn btn--soft btn--sm",
      onClick: async () => {
        const ok = await window.confirmAction({
          title: "Boshqa sessiyalardan chiqish",
          body: "Joriy sessiyani saqlab, qolgan barcha qurilmalardan chiqishni xohlaysizmi?",
          confirmLabel: "Chiqish",
          danger: true
        });
        if (ok) window.showToast("3 ta boshqa sessiyadan chiqildi", "warning");
      }
    }, "Chiqish")]), h("div", {
      key: 2,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: 12,
        border: "1px solid color-mix(in srgb, var(--status-danger-fg) 30%, transparent)",
        borderRadius: 8,
        background: "color-mix(in srgb, var(--status-danger-fg) 6%, transparent)"
      }
    }, [h("div", {
      key: 1
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--status-danger-fg)"
      }
    }, "Hisobni o'chirishni so'rash"), h("div", {
      key: 2,
      className: "cell-sub",
      style: {
        fontSize: 11.5
      }
    }, "So'rov departament rahbariga yuboriladi")]), h("button", {
      key: 2,
      className: "btn btn--sm",
      style: {
        background: "var(--status-danger-bg)",
        color: "var(--status-danger-fg)",
        border: "1px solid color-mix(in srgb, var(--status-danger-fg) 30%, transparent)"
      }
    }, "So'rov yuborish")])])])]);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/screens-profile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/screens-tools.jsx
try { (() => {
/* Scanner/config/traffic import + AI tahlil/report builder + KPI dashboard. */
(function () {
  const {
    useState,
    useMemo,
    useEffect,
    useRef,
    Fragment
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;

  // =========================================================================
  // SCANNER / CONFIG / TRAFFIC import + analysis
  // =========================================================================
  function ScannerScreen({
    setRoute,
    role,
    showAI
  }) {
    const [tab, setTab] = useState("scanner");
    const tabs = [{
      id: "scanner",
      label: "Skaner natijalari",
      icon: I.Bug
    }, {
      id: "config",
      label: "Konfiguratsiya",
      icon: I.Server
    }, {
      id: "traffic",
      label: "Trafik tahlili",
      icon: I.Activity
    }];
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "Skaner / fayl tahlili"
      }],
      title: "Fayl import va tahlil",
      sub: "Skaner natijalari, qurilma konfiguratsiyalari va trafik fayllarini yagona finding modeliga normalizatsiya qiling.",
      actions: [h("button", {
        key: 1,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("Import tarixi oynasi ochilmoqda...", "info")
      }, [h(I.History, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tarix")]), h("button", {
        key: 2,
        className: "btn btn--primary btn--sm",
        onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info")
      }, [h(I.Upload, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Fayl yuklash")])]
    }), h(Tabs, {
      key: "t",
      tabs,
      active: tab,
      onChange: setTab
    }), tab === "scanner" ? h(ScannerImport, {
      showAI
    }) : tab === "config" ? h(ConfigAnalysis, {
      showAI
    }) : h(TrafficAnalysis, {
      showAI
    })]);
  }
  window.ScannerScreen = ScannerScreen;
  function ScannerImport({
    showAI
  }) {
    const formats = [{
      name: "Nessus",
      desc: ".nessus, .csv",
      count: 4,
      icon: I.Bug,
      color: "warning"
    }, {
      name: "OpenVAS",
      desc: ".xml, .csv",
      count: 2,
      icon: I.Bug,
      color: "warning"
    }, {
      name: "Nmap",
      desc: ".xml, .gnmap",
      count: 6,
      icon: I.Network,
      color: "info"
    }, {
      name: "OWASP ZAP",
      desc: ".json, .html",
      count: 3,
      icon: I.Globe,
      color: "info"
    }, {
      name: "Burp Suite",
      desc: ".xml, burp",
      count: 2,
      icon: I.Globe,
      color: "info"
    }, {
      name: "Universal",
      desc: ".csv, .xlsx, .json, .txt",
      count: 0,
      icon: I.Layers,
      color: "ghost"
    }];
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [
    // LEFT: drop zone + history
    h("div", {
      key: "L",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Drop zone
    h("div", {
      key: "drop",
      className: "card",
      style: {
        padding: 24,
        textAlign: "center",
        border: "1.5px dashed var(--border-strong)",
        background: "var(--bg-surface-2)"
      }
    }, [h("div", {
      key: 1,
      style: {
        width: 56,
        height: 56,
        margin: "0 auto 16px",
        display: "grid",
        placeItems: "center",
        background: "var(--brand-soft)",
        color: "var(--brand)",
        borderRadius: 12
      }
    }, h(I.Upload, {
      key: "i-upload",
      size: 24
    })), h("h3", {
      key: 2,
      style: {
        fontSize: 18,
        marginBottom: 4
      }
    }, "Skaner natijalarini yuklash"), h("p", {
      key: 3,
      className: "text-sm text-muted",
      style: {
        marginBottom: 14
      }
    }, "Drag & drop yoki tanlang. Qo‘llab-quvvatlanadigan formatlar: .nessus, .xml, .json, .csv, .txt, .xlsx (≤ 256 MB)."), h("div", {
      key: 4,
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "center",
        flexWrap: "wrap"
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("Fayl tanlash oynasi ochilmoqda...", "info")
    }, [h(I.Upload, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Faylni tanlash")]), h("button", {
      key: 2,
      className: "btn btn--secondary btn--sm",
      onClick: () => window.showToast("URL kiritish oynasi ochilmoqda...", "info")
    }, [h(I.Link, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "URL'dan yuklash")])]), h("div", {
      key: 5,
      style: {
        display: "flex",
        gap: 6,
        justifyContent: "center",
        marginTop: 14,
        flexWrap: "wrap"
      }
    }, ["Nessus", "OpenVAS", "Nmap", "OWASP ZAP", "Burp Suite", "Custom CSV"].map(t => h("span", {
      key: t,
      className: "tag tag--outline"
    }, t)))]),
    // Recent imports
    h("div", {
      key: "imp",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.History, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "So‘nggi importlar")]), h(window.FilterButton, {
      key: 2,
      kind: "logs",
      size: "xs"
    })]), h("div", {
      className: "panel__body panel__body--flush",
      key: 2
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Fayl"), h("th", {
      key: 2
    }, "Skaner"), h("th", {
      key: 3
    }, "Audit"), h("th", {
      key: 4
    }, "Topildi"), h("th", {
      key: 5
    }, "Holat"), h("th", {
      key: 6
    }, "Vaqt")])), h("tbody", {
      key: "b"
    }, [{
      f: "internal-network.nessus",
      s: "Nessus",
      sIcon: I.Bug,
      a: "AUD-2026-014",
      found: {
        c: 4,
        h: 5,
        m: 12,
        l: 8
      },
      st: "Tahlil qilindi",
      t: "1 soat",
      color: "warning"
    }, {
      f: "owasp-zap-portal.json",
      s: "OWASP ZAP",
      sIcon: I.Globe,
      a: "AUD-2026-014",
      found: {
        c: 2,
        h: 4,
        m: 6,
        l: 3
      },
      st: "Tahlil qilindi",
      t: "3 soat",
      color: "info"
    }, {
      f: "nmap-internal.xml",
      s: "Nmap",
      sIcon: I.Network,
      a: "AUD-2026-014",
      found: {
        c: 0,
        h: 2,
        m: 7,
        l: 14
      },
      st: "Tahlil qilindi",
      t: "5 soat",
      color: "info"
    }, {
      f: "openvas-dmz.xml",
      s: "OpenVAS",
      sIcon: I.Bug,
      a: "AUD-2026-013",
      found: {
        c: 1,
        h: 3,
        m: 9,
        l: 5
      },
      st: "Dublikat tekshirish",
      t: "1 kun",
      color: "warning"
    }, {
      f: "burp-spider.xml",
      s: "Burp Suite",
      sIcon: I.Globe,
      a: "AUD-2026-012",
      found: {
        c: 0,
        h: 1,
        m: 4,
        l: 11
      },
      st: "Tahlil qilindi",
      t: "2 kun",
      color: "info"
    }].map((r, i) => h("tr", {
      key: i
    }, [h("td", {
      key: 1
    }, h("div", {
      className: "cell-title"
    }, [h("span", {
      key: 1,
      className: "icon-box",
      style: {
        background: r.color === "warning" ? "rgba(245,158,11,0.16)" : "rgba(14,165,233,0.16)",
        color: r.color === "warning" ? "var(--status-warning-fg)" : "var(--status-info-fg)"
      }
    }, h(r.sIcon, {
      size: 14
    })), h("span", {
      key: 2,
      className: "font-mono",
      style: {
        fontSize: 13
      }
    }, r.f)])), h("td", {
      key: 2
    }, h("span", {
      className: "tag tag--outline"
    }, r.s)), h("td", {
      key: 3,
      className: "font-mono cell-sub"
    }, r.a), h("td", {
      key: 4
    }, h("div", {
      style: {
        display: "flex",
        gap: 4
      }
    }, [r.found.c ? h("span", {
      key: 1,
      className: "sev sev--critical"
    }, r.found.c) : null, r.found.h ? h("span", {
      key: 2,
      className: "sev sev--high"
    }, r.found.h) : null, r.found.m ? h("span", {
      key: 3,
      className: "sev sev--medium"
    }, r.found.m) : null, r.found.l ? h("span", {
      key: 4,
      className: "sev sev--low"
    }, r.found.l) : null])), h("td", {
      key: 5
    }, h("span", {
      className: "tag " + (r.st === "Tahlil qilindi" ? "tag--success" : "tag--warning")
    }, r.st)), h("td", {
      key: 6,
      className: "tabular cell-sub"
    }, r.t)])))])))])]),
    // RIGHT: supported formats + AI
    h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h("div", {
      key: "fmt",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Boxes, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Qo‘llab-quvvatlanadigan formatlar")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, formats.map((f, i, arr) => h("div", {
      key: f.name,
      style: {
        padding: "10px 14px",
        borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, [h("div", {
      key: 1,
      className: "stat__icon",
      style: {
        background: f.color === "warning" ? "rgba(245,158,11,0.16)" : f.color === "info" ? "rgba(14,165,233,0.16)" : "var(--bg-surface-3)",
        color: f.color === "warning" ? "var(--status-warning-fg)" : f.color === "info" ? "var(--status-info-fg)" : "var(--text-tertiary)"
      }
    }, h(f.icon, {
      size: 15
    })), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, f.name), h("div", {
      key: 2,
      className: "cell-sub font-mono"
    }, f.desc)]), f.count ? h("span", {
      key: 3,
      className: "tag tag--ghost"
    }, f.count) : null])))]), showAI ? h("div", {
      key: "ai",
      className: "ai-card"
    }, h("div", {
      className: "ai-card__inner"
    }, [h("div", {
      className: "ai-card__head",
      key: 1
    }, [h("div", {
      className: "ai-card__icon",
      key: 1
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 14
    })), h("span", {
      className: "ai-card__title",
      key: 2
    }, "AI normalizatsiya")]), h("p", {
      key: 2,
      className: "ai-card__body"
    }, "Yuklangan har bir skaner natijasi Ollama orqali tahlil qilinadi: oddiy texnik tilga aylantiriladi, takrorlanuvchi findinglar bitta yozuvga birlashtiriladi va remediation tavsiyasi tayyorlanadi. Kerakli auditga manual biriktirish mumkin.")])) : null])]);
  }
  function ConfigAnalysis({
    showAI
  }) {
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [h("div", {
      key: "L",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Drop
    h("div", {
      key: "d",
      className: "card",
      style: {
        padding: 20,
        textAlign: "center",
        border: "1.5px dashed var(--border-strong)",
        background: "var(--bg-surface-2)"
      }
    }, [h(I.Server, {
      size: 32,
      style: {
        margin: "0 auto 12px",
        color: "var(--brand)"
      },
      key: 1
    }), h("h3", {
      key: 2,
      style: {
        fontSize: 17
      }
    }, "Qurilma konfiguratsiyasini yuklash"), h("p", {
      key: 3,
      className: "text-sm text-muted",
      style: {
        margin: "6px 0 14px"
      }
    }, "Cisco IOS, Juniper, Fortinet, MikroTik, pfSense, Linux iptables, Wi-Fi controller — barchasi qo‘llab-quvvatlanadi."), h("button", {
      key: 4,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("Konfiguratsiya fayl tanlash oynasi ochilmoqda...", "info")
    }, [h(I.Upload, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Konfiguratsiya yuklash")])]),
    // Devices analyzed
    h("div", {
      key: "dev",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Server, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Tahlil qilingan qurilmalar")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, [{
      name: "FW-CORE-01",
      model: "Cisco ASA 5545-X",
      fw: "9.16(4)",
      findings: {
        c: 2,
        h: 3,
        m: 5
      },
      icon: I.Shield
    }, {
      name: "SW-DIST-02",
      model: "Cisco Catalyst 9300-48",
      fw: "17.06.04",
      findings: {
        c: 0,
        h: 1,
        m: 4
      },
      icon: I.Network
    }, {
      name: "VPN-GW-01",
      model: "FortiGate 100F",
      fw: "7.0.12",
      findings: {
        c: 1,
        h: 2,
        m: 3
      },
      icon: I.Lock
    }, {
      name: "WIFI-CTRL-01",
      model: "Aruba 7030 Controller",
      fw: "8.10.0.6",
      findings: {
        c: 0,
        h: 0,
        m: 7
      },
      icon: I.Wifi
    }, {
      name: "RTR-EDGE-01",
      model: "MikroTik CCR2004",
      fw: "RouterOS 7.13",
      findings: {
        c: 0,
        h: 2,
        m: 6
      },
      icon: I.Network
    }].map((d, i, arr) => h("div", {
      key: d.name,
      style: {
        padding: "12px 16px",
        borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, [h("div", {
      key: 1,
      className: "stat__icon"
    }, h(d.icon, {
      size: 14
    })), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      className: "font-mono",
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, d.name), h("div", {
      key: 2,
      className: "cell-sub"
    }, d.model + " · " + d.fw)]), h("div", {
      key: 3,
      style: {
        display: "flex",
        gap: 4
      }
    }, [d.findings.c ? h("span", {
      key: 1,
      className: "sev sev--critical"
    }, d.findings.c) : null, d.findings.h ? h("span", {
      key: 2,
      className: "sev sev--high"
    }, d.findings.h) : null, d.findings.m ? h("span", {
      key: 3,
      className: "sev sev--medium"
    }, d.findings.m) : null])])))])]), h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Config preview
    h("div", {
      key: "code",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Code, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "fw-core-01.cfg — qoidalar segmenti")]), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 6
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--ghost btn--xs",
      onClick: () => {
        try {
          navigator.clipboard.writeText("fw-core-01 config...");
        } catch (e) {}
        window.showToast("Konfiguratsiya nusxa olindi", "success");
      }
    }, [h(I.Copy, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Nusxa")]), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("fw-core-01.cfg yuklab olindi", "success")
    }, [h(I.Download, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Yuklash")])])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, h("pre", {
      className: "code-block",
      style: {
        borderRadius: 0,
        border: "none",
        padding: 16
      }
    }, [h("div", {
      key: 1
    }, [h("span", {
      className: "ln"
    }, "01"), "! ASA 9.16(4) — generated config"]), h("div", {
      key: 2
    }, [h("span", {
      className: "ln"
    }, "02"), "hostname FW-CORE-01"]), h("div", {
      key: 3
    }, [h("span", {
      className: "ln"
    }, "03"), "domain-name gov.uz"]), h("div", {
      key: 4
    }, [h("span", {
      className: "ln"
    }, "04"), "!"]), h("div", {
      key: 5
    }, [h("span", {
      className: "ln"
    }, "05"), "interface GigabitEthernet0/0"]), h("div", {
      key: 6
    }, [h("span", {
      className: "ln"
    }, "06"), " nameif inside"]), h("div", {
      key: 7,
      className: "hl"
    }, [h("span", {
      className: "ln"
    }, "07"), " no security-level"]), h("div", {
      key: 8
    }, [h("span", {
      className: "ln"
    }, "08"), " ip address 10.0.0.1 255.0.0.0"]), h("div", {
      key: 9
    }, [h("span", {
      className: "ln"
    }, "09"), "!"]), h("div", {
      key: 10
    }, [h("span", {
      className: "ln"
    }, "10"), "access-list INSIDE_IN extended permit ip 10.0.0.0 255.0.0.0 any"]), h("div", {
      key: 11,
      className: "hl"
    }, [h("span", {
      className: "ln"
    }, "11"), "access-list INSIDE_IN extended permit tcp any any"]), h("div", {
      key: 12
    }, [h("span", {
      className: "ln"
    }, "12"), "access-group INSIDE_IN in interface inside"]), h("div", {
      key: 13
    }, [h("span", {
      className: "ln"
    }, "13"), "!"]), h("div", {
      key: 14,
      className: "hl"
    }, [h("span", {
      className: "ln"
    }, "14"), "telnet 0.0.0.0 0.0.0.0 inside"]), h("div", {
      key: 15
    }, [h("span", {
      className: "ln"
    }, "15"), "ssh 10.20.4.0 255.255.255.0 inside"]), h("div", {
      key: 16
    }, [h("span", {
      className: "ln"
    }, "16"), "ssh version 2"]), h("div", {
      key: 17
    }, [h("span", {
      className: "ln"
    }, "17"), "logging buffered debugging"]), h("div", {
      key: 18,
      className: "hl"
    }, [h("span", {
      className: "ln"
    }, "18"), "no logging trap"])])), h("div", {
      className: "panel__foot",
      key: 3
    }, [h("span", {
      key: 1
    }, "Konfiguratsiyada 3 ta kamchilik aniqlandi"), h("button", {
      key: 2,
      className: "btn btn--soft btn--xs",
      onClick: () => window.showToast("Findinglar paneliga o'tilmoqda...", "info")
    }, [h(I.AlertTriangle, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Findinglarni ko‘rish")])])]), showAI ? h("div", {
      key: "ai",
      className: "ai-card"
    }, h("div", {
      className: "ai-card__inner"
    }, [h("div", {
      className: "ai-card__head",
      key: 1
    }, [h("div", {
      className: "ai-card__icon",
      key: 1
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 14
    })), h("span", {
      className: "ai-card__title",
      key: 2
    }, "AI tahlil natijasi")]), h("div", {
      key: 2,
      className: "ai-card__body",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start"
      }
    }, [h(Sev, {
      level: "critical",
      key: 1
    }), h("div", {
      key: 2
    }, [h("strong", {
      key: 1,
      style: {
        color: "var(--text-primary)"
      }
    }, "Satr 07, 11: \"no security-level\" + \"permit tcp any any\""), h("p", {
      key: 2,
      style: {
        marginTop: 4
      }
    }, "Inside interfeysida xavfsizlik darajasi belgilanmagan va keng ruxsat berilgan ACL ishlatilmoqda. Segmentatsiya buzilgan.")])]), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start"
      }
    }, [h(Sev, {
      level: "high",
      key: 1
    }), h("div", {
      key: 2
    }, [h("strong", {
      key: 1,
      style: {
        color: "var(--text-primary)"
      }
    }, "Satr 14: \"telnet 0.0.0.0\""), h("p", {
      key: 2,
      style: {
        marginTop: 4
      }
    }, "Telnet xizmati barcha manzillarga ochiq. Faqat SSHv2 ishlatilishi kerak.")])])]), h("div", {
      key: 3,
      style: {
        display: "flex",
        gap: 8,
        marginTop: 14
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("3 ta finding qoralama ko'rinishida yaratildi", "success")
    }, [h(I.Plus, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "3 ta finding yaratish")]), h("button", {
      key: 2,
      className: "btn btn--soft btn--sm",
      onClick: () => window.showToast("AI qayta tahlil boshlandi...", "info")
    }, [h(I.Refresh, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Qayta tahlil")])])])) : null])]);
  }
  function TrafficAnalysis({
    showAI
  }) {
    return h("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [h("div", {
      key: "L",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // Drop
    h("div", {
      key: "d",
      className: "card card__pad-sm",
      style: {
        display: "flex",
        gap: 16,
        alignItems: "center"
      }
    }, [h("div", {
      key: 1,
      className: "stat__icon",
      style: {
        width: 56,
        height: 56,
        fontSize: 0,
        background: "rgba(14,165,233,0.16)",
        color: "var(--status-info-fg)"
      }
    }, h(I.Activity, {
      key: "i-activity",
      size: 24
    })), h("div", {
      key: 2,
      style: {
        flex: 1
      }
    }, [h("div", {
      key: 1,
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "PCAP / NetFlow / log yuklash"), h("div", {
      key: 2,
      className: "text-sm text-muted",
      style: {
        marginTop: 2
      }
    }, "Port scanning, brute force, C2, DNS tunneling, data exfiltration va shubhali IP harakatlarini avtomatik aniqlash.")]), h("button", {
      key: 3,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("PCAP fayl tanlash oynasi ochilmoqda...", "info")
    }, [h(I.Upload, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Fayl yuklash")])]),
    // Anomaly chart
    h("div", {
      key: "ch",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Activity, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "DNS so‘rovlar — 24 soat (core-net.pcap)")]), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 6
      }
    }, [h("span", {
      key: 1,
      className: "tag tag--outline"
    }, "All"), h("span", {
      key: 2,
      className: "tag tag--danger"
    }, "Anomaly 18,402")])]), h("div", {
      className: "panel__body",
      key: 2
    }, h("svg", {
      width: "100%",
      height: 180,
      viewBox: "0 0 600 180",
      preserveAspectRatio: "none"
    }, [
    // grid
    ...Array.from({
      length: 5
    }).map((_, i) => h("line", {
      key: "g" + i,
      x1: 0,
      y1: i * 36 + 18,
      x2: 600,
      y2: i * 36 + 18,
      stroke: "var(--border-color)",
      strokeWidth: 1
    })),
    // baseline (normal)
    h("path", {
      key: "b1",
      d: "M0 130 C 40 128, 80 120, 120 122 C 160 124, 200 118, 240 124 C 280 130, 320 122, 360 126 C 400 130, 440 122, 480 128 C 520 132, 560 126, 600 130 L 600 180 L 0 180 Z",
      fill: "var(--brand)",
      opacity: 0.18
    }), h("path", {
      key: "b2",
      d: "M0 130 C 40 128, 80 120, 120 122 C 160 124, 200 118, 240 124 C 280 130, 320 122, 360 126 C 400 130, 440 122, 480 128 C 520 132, 560 126, 600 130",
      fill: "none",
      stroke: "var(--brand)",
      strokeWidth: 1.5
    }),
    // anomaly spike
    h("path", {
      key: "s1",
      d: "M280 130 C 285 130, 290 60, 320 30 C 340 20, 360 22, 380 50 C 400 80, 420 95, 440 120 C 460 130, 470 130, 480 130 L 480 180 L 280 180 Z",
      fill: "#f87171",
      opacity: 0.22
    }), h("path", {
      key: "s2",
      d: "M280 130 C 285 130, 290 60, 320 30 C 340 20, 360 22, 380 50 C 400 80, 420 95, 440 120 C 460 130, 470 130, 480 130",
      fill: "none",
      stroke: "#f87171",
      strokeWidth: 1.8
    }),
    // labels
    h("text", {
      key: "l1",
      x: 360,
      y: 14,
      textAnchor: "middle",
      fontSize: 11,
      fill: "var(--status-danger-fg)",
      fontWeight: 700
    }, "▼ Anomaly — 14:00 – 17:00"), ...["00:00", "06:00", "12:00", "18:00", "23:59"].map((t, i) => h("text", {
      key: "x" + i,
      x: i * 150,
      y: 174,
      textAnchor: i === 0 ? "start" : i === 4 ? "end" : "middle",
      fontSize: 10,
      fill: "var(--text-tertiary)"
    }, t))]))]),
    // Anomalies table
    h("div", {
      key: "an",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.AlertTriangle, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Aniqlangan anomaliyalar")])), h("div", {
      className: "panel__body panel__body--flush",
      key: 2
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "Severity"), h("th", {
      key: 2
    }, "Anomaliya"), h("th", {
      key: 3
    }, "Manba IP"), h("th", {
      key: 4
    }, "Maqsad / port"), h("th", {
      key: 5
    }, "Vaqt"), h("th", {
      key: 6
    }, "Hodisalar")])), h("tbody", {
      key: "b"
    }, [{
      s: "critical",
      t: "DNS tunneling — uzun subdomainlar",
      src: "10.10.42.16",
      dst: "8.8.8.8:53",
      time: "14:02 – 16:48",
      c: 18402
    }, {
      s: "high",
      t: "Port scanning — TCP SYN sweep",
      src: "10.10.42.16",
      dst: "10.0.0.0/24",
      time: "13:55 – 14:01",
      c: 256
    }, {
      s: "high",
      t: "Brute force — SSH login attempts",
      src: "203.0.113.42",
      dst: "10.20.4.142:22",
      time: "08:22 – 08:30",
      c: 4112
    }, {
      s: "medium",
      t: "Shubhali IP — known C2",
      src: "10.10.42.16",
      dst: "185.62.190.78:443",
      time: "16:14",
      c: 24
    }, {
      s: "medium",
      t: "Plaintext FTP transfer",
      src: "10.10.42.18",
      dst: "10.0.0.42:21",
      time: "09:30 – 09:35",
      c: 8
    }].map((r, i) => h("tr", {
      key: i
    }, [h("td", {
      key: 1
    }, h(Sev, {
      level: r.s
    })), h("td", {
      key: 2,
      className: "text-primary font-semi"
    }, r.t), h("td", {
      key: 3,
      className: "font-mono",
      style: {
        fontSize: 12
      }
    }, r.src), h("td", {
      key: 4,
      className: "font-mono",
      style: {
        fontSize: 12
      }
    }, r.dst), h("td", {
      key: 5,
      className: "tabular cell-sub"
    }, r.time), h("td", {
      key: 6,
      className: "tabular text-primary font-semi"
    }, r.c.toLocaleString())])))])))])]),
    // RIGHT
    h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h("div", {
      key: "st",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.PieChart, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Trafik profili")])), h("div", {
      className: "panel__body",
      key: 2
    }, [h("div", {
      key: 1,
      className: "grid",
      style: {
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginBottom: 14
      }
    }, [h(Stat, {
      key: 1,
      label: "Paketlar",
      value: "12.4M",
      meta: "94 MB"
    }), h(Stat, {
      key: 2,
      label: "Anomaliya",
      value: 5,
      meta: "1 critical · 2 high"
    }), h(Stat, {
      key: 3,
      label: "Yagona IP",
      value: 1247,
      meta: "Internal 89%"
    }), h(Stat, {
      key: 4,
      label: "Davomiyligi",
      value: "24h",
      meta: "01:00 – 24:59"
    })]), h(BarChart, {
      key: 2,
      w: 280,
      h: 100,
      data: [{
        label: "HTTP",
        value: 38,
        color: "var(--brand)"
      }, {
        label: "HTTPS",
        value: 86,
        color: "var(--brand)"
      }, {
        label: "DNS",
        value: 64,
        color: "#f87171"
      }, {
        label: "SSH",
        value: 28,
        color: "var(--brand)"
      }, {
        label: "FTP",
        value: 9,
        color: "#fbbf24"
      }, {
        label: "SMB",
        value: 22,
        color: "var(--brand)"
      }, {
        label: "Other",
        value: 41,
        color: "var(--brand)"
      }]
    })])]), showAI ? h("div", {
      key: "ai",
      className: "ai-card"
    }, h("div", {
      className: "ai-card__inner"
    }, [h("div", {
      className: "ai-card__head",
      key: 1
    }, [h("div", {
      className: "ai-card__icon",
      key: 1
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 14
    })), h("span", {
      className: "ai-card__title",
      key: 2
    }, "AI xulosa — trafik")]), h("p", {
      key: 2,
      className: "ai-card__body"
    }, "10.10.42.16 endpoint juda kuchli DNS tunneling belgilarini namoyish etmoqda — 18,400 ga yaqin uzun subdomain so‘rovlari (uzunligi 50+ belgi, base64 ko‘rinishida) bir necha soat davomida yuborilgan. Endpoint shu vaqt oralig‘ida known C2 (185.62.190.78) bilan ham aloqaga kirgan. Yuqori ehtimollikda — ma'lumot exfiltratsiyasi. Tavsiya: endpoint darhol tarmoqdan ajratilsin va EDR snapshoti olinsin.")])) : null])]);
  }

  // =========================================================================
  // AI SCREEN — chat-style report builder with Ollama
  // =========================================================================
  function AIScreen({
    audit,
    embedded,
    setRoute,
    showAI
  }) {
    const a = audit || D.AUDITS[0];
    const [input, setInput] = useState("");
    const [convo, setConvo] = useState(D.AI_CONVO);
    const [model, setModel] = useState("qwen2.5:14b-instruct");
    const presets = [{
      t: "Executive summary tayyorla",
      i: I.Star
    }, {
      t: "Remediation plan yarat",
      i: I.Target
    }, {
      t: "Critical findinglarni guruhlash",
      i: I.AlertTriangle
    }, {
      t: "Configuration tahlilini izohlash",
      i: I.Server
    }, {
      t: "KPI hisobotini umumlashtirish",
      i: I.Trophy
    }];
    function send(text) {
      if (!text) return;
      const now = new Date().toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit"
      });
      setConvo(c => [...c, {
        role: "user",
        who: "u3",
        time: now,
        text
      }, {
        role: "ai",
        time: now,
        text: "Tahlil qilinmoqda... (demo rejimda)"
      }]);
      setInput("");
    }
    return h("div", null, [embedded ? null : h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "AI tahlil & hisobot"
      }],
      title: "AI tahlil va hisobot quruvchi",
      sub: h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, [h("span", {
        key: "d",
        className: "dot dot--pulse",
        style: {
          color: "var(--green-500)",
          width: 8,
          height: 8
        }
      }), h("span", {
        key: 1,
        className: "text-sm"
      }, "Ollama lokal · " + model + " · " + a.code)]),
      actions: [h("select", {
        key: 1,
        className: "select",
        value: model,
        onChange: e => setModel(e.target.value),
        style: {
          width: 220
        }
      }, [h("option", {
        key: 1
      }, "qwen2.5:14b-instruct"), h("option", {
        key: 2
      }, "llama3.1:8b-instruct"), h("option", {
        key: 3
      }, "mistral:7b-instruct")]), h("button", {
        key: 2,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("AI suhbat tarixi oynasi ochilmoqda...", "info")
      }, [h(I.History, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Tarix")]), h("button", {
        key: 3,
        className: "btn btn--primary btn--sm",
        onClick: () => window.showToast("AI tahlil tanlangan hisobotga qo'shildi", "success")
      }, [h(I.Save, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Hisobotga eksport")])]
    }), h("div", {
      key: "g",
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [
    // CHAT
    h("div", {
      key: "C",
      className: "panel",
      style: {
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 240px)",
        minHeight: 540
      }
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Sparkles, {
      size: 15,
      key: 1
    }), h("span", {
      key: 2
    }, "Suhbat — " + a.code)]), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 6,
        alignItems: "center"
      }
    }, [h("span", {
      key: 1,
      className: "tag tag--brand"
    }, [h(I.Cpu, {
      key: "i-cpu",
      size: 11
    }), model.split(":")[0]]), h("button", {
      key: 2,
      className: "iconbtn",
      onClick: () => window.showToast("Model qayta yuklanmoqda...", "info")
    }, h(I.Refresh, {
      key: "i-refresh",
      size: 14
    })), h("button", {
      key: 3,
      className: "iconbtn",
      onClick: () => window.showToast("Model sozlamalari oynasi ochilmoqda...", "info")
    }, h(I.MoreHorizontal, {
      key: "i-morehorizontal",
      size: 14
    }))])]), h("div", {
      key: 2,
      style: {
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [...convo.map((m, i) => h(ChatMessage, {
      key: i,
      m
    }))]), h("div", {
      key: 3,
      style: {
        padding: 12,
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-surface-2)"
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        gap: 6,
        marginBottom: 10,
        flexWrap: "wrap"
      }
    }, presets.map((p, i) => h("button", {
      key: i,
      className: "btn btn--soft btn--xs",
      onClick: () => send(p.t)
    }, [h(p.i, {
      size: 12
    }), h("span", {
      key: "t"
    }, p.t)]))), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "flex-end"
      }
    }, [h("button", {
      key: 1,
      className: "iconbtn",
      title: "Fayl biriktirish"
    }, h(I.Paperclip, {
      key: "i-paperclip",
      size: 16
    })), h("textarea", {
      key: 2,
      className: "textarea",
      placeholder: "AI ga so‘rov yozing — masalan 'Yangi finding F-2026-0349 uchun remediation plan tayyorla'...",
      value: input,
      onChange: e => setInput(e.target.value),
      style: {
        minHeight: 44,
        resize: "none",
        flex: 1
      }
    }), h("button", {
      key: 3,
      className: "btn btn--primary",
      style: {
        padding: "10px 16px"
      },
      onClick: () => send(input)
    }, [h(I.Send, {
      key: "i",
      size: 14
    }), h("span", {
      key: "t"
    }, "Yuborish")])]), h("div", {
      key: 3,
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: 6,
        fontSize: 11,
        color: "var(--text-tertiary)"
      }
    }, [h("span", {
      key: 1
    }, "Audit konteksti yuklangan: " + a.tasks.total + " vazifa, " + (a.findings.critical + a.findings.high + a.findings.medium + a.findings.low) + " finding"), h("span", {
      key: 2
    }, "Yopiq tarmoq · so‘rovlar tashqi servisga yuborilmaydi")])])]),
    // SIDE: report builder
    h("div", {
      key: "S",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [h("div", {
      key: "r",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.FileText, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Hisobot quruvchi")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, [{
      t: "Audit umumiy ma'lumotlari",
      done: true,
      required: true
    }, {
      t: "Audit guruhi va vazifalar",
      done: true,
      required: true
    }, {
      t: "Tasdiqlangan findinglar (24)",
      done: true,
      required: true
    }, {
      t: "Executive summary",
      done: true,
      required: false,
      ai: true
    }, {
      t: "Remediation plan",
      done: true,
      required: false,
      ai: true
    }, {
      t: "Tarmoq xaritasi va diagrammalar",
      done: false,
      required: false
    }, {
      t: "KPI hisoboti",
      done: true,
      required: false
    }, {
      t: "Ilovalar (dalillar)",
      done: false,
      required: false
    }].map((s, i) => h("label", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        cursor: "pointer"
      }
    }, [h("input", {
      type: "checkbox",
      className: "checkbox",
      defaultChecked: s.done,
      key: 1
    }), h("span", {
      key: 2,
      style: {
        flex: 1,
        fontSize: 13.5,
        color: "var(--text-primary)"
      }
    }, s.t), s.ai ? h("span", {
      key: 3,
      className: "tag tag--brand",
      style: {
        fontSize: 10
      }
    }, "AI") : null, s.required ? h("span", {
      key: 4,
      className: "tag tag--ghost",
      style: {
        fontSize: 10
      }
    }, "Majburiy") : null]))), h("div", {
      className: "panel__foot",
      key: 3,
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "flex-end"
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--soft btn--sm",
      onClick: () => window.showToast("Hisobot qayta yaratilmoqda (qwen2.5:14b)...", "info")
    }, [h(I.Refresh, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "Qayta yaratish")]), h("button", {
      key: 2,
      className: "btn btn--primary btn--sm",
      onClick: () => window.showToast("DOCX hisobot yuklab olindi (~4.2 MB)", "success")
    }, [h(I.Download, {
      key: "i",
      size: 13
    }), h("span", {
      key: "t"
    }, "DOCX yuklash")])])]), h("div", {
      key: "p",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.Layers, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Prompt shablonlari")])), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0
      }
    }, ["Executive summary (5 jumla)", "Texnik remediation plan", "Critical findinglarni xulosa qilish", "Audit kirish bo‘limi (boshlanish)", "KPI tahlili (tavsifiy)", "Compliance mapping — ISO 27001"].map((t, i, arr) => h("button", {
      key: i,
      className: "navitem",
      style: {
        padding: "10px 14px",
        borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
        borderRadius: 0
      }
    }, [h(I.Sparkles, {
      size: 14,
      key: 1,
      style: {
        color: "var(--brand)"
      }
    }), h("span", {
      className: "label",
      key: 2
    }, t), h(I.ChevronRight, {
      size: 12,
      key: 3,
      style: {
        marginLeft: "auto",
        color: "var(--text-tertiary)"
      }
    })])))])])])]);
  }
  window.AIScreen = AIScreen;
  function ChatMessage({
    m
  }) {
    const isAi = m.role === "ai";
    const isSys = m.role === "system";
    if (isSys) {
      return h("div", {
        style: {
          textAlign: "center",
          color: "var(--text-tertiary)",
          fontSize: 11.5,
          padding: "4px 0"
        }
      }, [h("span", {
        className: "tag tag--ghost"
      }, [h(I.Cpu, {
        key: "i-cpu",
        size: 11
      }), m.text + " · " + m.time])]);
    }
    return h("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start"
      }
    }, [isAi ? h("div", {
      key: 1,
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--brand) 0%, #93b4fd 100%)",
        color: "white",
        display: "grid",
        placeItems: "center",
        flexShrink: 0
      }
    }, h(I.Sparkles, {
      key: "i-sparkles",
      size: 14
    })) : h(Avatar, {
      key: 1,
      user: m.who || "u3"
    }), h("div", {
      key: 2,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, [h("strong", {
      key: 1,
      style: {
        fontSize: 13,
        color: "var(--text-primary)"
      }
    }, isAi ? "Ollama AI" : D.userById(m.who || "u3").name), h("span", {
      key: 2,
      className: "cell-sub"
    }, m.time), isAi ? h("span", {
      key: 3,
      className: "tag tag--brand",
      style: {
        fontSize: 10
      }
    }, "qwen2.5:14b") : null]), h("div", {
      key: 2,
      style: isAi ? {
        padding: 14,
        background: "var(--brand-soft)",
        border: "1px solid var(--brand-soft-hover)",
        borderRadius: "4px 12px 12px 12px",
        fontSize: 13.5,
        color: "var(--text-primary)",
        lineHeight: 1.65
      } : {
        fontSize: 13.5,
        color: "var(--text-secondary)",
        lineHeight: 1.6,
        padding: "0 0"
      }
    }, m.text), m.attach === "plan" ? h(RemediationPlan, {
      key: 3
    }) : null, isAi ? h("div", {
      key: 4,
      style: {
        display: "flex",
        gap: 6,
        marginTop: 8
      }
    }, [h("button", {
      key: 1,
      className: "btn btn--ghost btn--xs",
      onClick: () => {
        try {
          navigator.clipboard.writeText("AI javob...");
        } catch (e) {}
        window.showToast("AI javob buferga ko'chirildi", "success");
      }
    }, [h(I.Copy, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Nusxa")]), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("Javob tahrirlash oynasi ochilmoqda...", "info")
    }, [h(I.Edit3, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Tahrir")]), h("button", {
      key: 3,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("AI javob qayta generatsiya qilinmoqda...", "info")
    }, [h(I.Refresh, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Qayta")]), h("button", {
      key: 4,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("AI javob hisobotga qo'shildi", "success")
    }, [h(I.Save, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Hisobotga qo‘shish")])]) : null])]);
  }
  function RemediationPlan() {
    const items = [{
      task: "Critical segmentlarni fizik/logik ajratish (VLAN + ACL)",
      owner: "u7",
      eta: "3 ish kuni",
      risk: "critical"
    }, {
      task: "Telnet xizmatini barcha tarmoq qurilmalarida o‘chirish",
      owner: "u6",
      eta: "1 ish kuni",
      risk: "high"
    }, {
      task: "SSHv2 + kalit asosida autentifikatsiyani konfiguratsiya qilish",
      owner: "u6",
      eta: "2 ish kuni",
      risk: "high"
    }, {
      task: "Yangi konfiguratsiyani pilot bo‘limda sinash va rolloverka",
      owner: "u3",
      eta: "8 ish kuni",
      risk: "medium"
    }];
    return h("div", {
      className: "tbl-wrap",
      style: {
        marginTop: 10,
        background: "var(--bg-surface)"
      }
    }, h("table", {
      className: "tbl",
      style: {
        fontSize: 12.5
      }
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "#"), h("th", {
      key: 2
    }, "Vazifa"), h("th", {
      key: 3
    }, "Mas’ul"), h("th", {
      key: 4
    }, "ETA"), h("th", {
      key: 5
    }, "Xavf")])), h("tbody", {
      key: "b"
    }, items.map((it, i) => h("tr", {
      key: i
    }, [h("td", {
      key: 1,
      className: "font-bold tabular"
    }, i + 1), h("td", {
      key: 2,
      className: "text-primary"
    }, it.task), h("td", {
      key: 3
    }, h("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, [h(Avatar, {
      user: it.owner,
      key: 1
    }), h("span", {
      key: 2,
      className: "text-sm"
    }, D.userById(it.owner).name)])), h("td", {
      key: 4,
      className: "tabular cell-sub"
    }, it.eta), h("td", {
      key: 5
    }, h(Sev, {
      level: it.risk
    }))])))]));
  }

  // =========================================================================
  // KPI SCREEN
  // =========================================================================
  function KpiScreen({
    setRoute,
    role
  }) {
    const [period, setPeriod] = useState("month");
    return h("div", null, [h(PageHeader, {
      key: "h",
      crumbs: [{
        label: "Boshqaruv paneli",
        onClick: () => setRoute("dashboard")
      }, {
        label: "KPI"
      }],
      title: "KPI va mutaxassislar reytingi",
      sub: "May 2026 · 8 mutaxassis · jami " + D.KPI_USERS.reduce((s, k) => s + k.total, 0) + " ball",
      actions: [h("div", {
        key: "p",
        style: {
          display: "inline-flex",
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-color)",
          borderRadius: 6,
          padding: 3
        }
      }, [["week", "Hafta"], ["month", "Oy"], ["quarter", "Chorak"], ["year", "Yil"]].map(([k, l]) => h("button", {
        key: k,
        className: "btn btn--ghost btn--xs",
        onClick: () => setPeriod(k),
        style: period === k ? {
          background: "var(--bg-surface)",
          color: "var(--brand)",
          boxShadow: "var(--shadow-xs)"
        } : {}
      }, l))), h("button", {
        key: 2,
        className: "btn btn--ghost btn--sm",
        onClick: () => window.showToast("KPI XLSX formatda eksport qilindi", "success")
      }, [h(I.Download, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "XLSX")]), h("button", {
        key: 3,
        className: "btn btn--secondary btn--sm",
        onClick: () => window.showToast("KPI qoidalari tahrirlash oynasi ochilmoqda...", "info")
      }, [h(I.Settings, {
        key: "i",
        size: 14
      }), h("span", {
        key: "t"
      }, "Qoidalarni tahrirlash")])]
    }),
    // Stat row
    h("div", {
      key: "s",
      className: "grid",
      style: {
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 16
      }
    }, [h(Stat, {
      key: 1,
      icon: I.Trophy,
      label: "Jami ball",
      value: D.KPI_USERS.reduce((s, k) => s + k.total, 0),
      delta: 14,
      spark: [820, 940, 1080, 1190, 1320, 1483]
    }), h(Stat, {
      key: 2,
      icon: I.Users,
      label: "Faol mutaxassis",
      value: D.KPI_USERS.length,
      meta: "May oyida"
    }), h(Stat, {
      key: 3,
      icon: I.CheckSquare,
      label: "Muddatida bajarilgan",
      value: "89%",
      delta: 4
    }), h(Stat, {
      key: 4,
      icon: I.TrendingDown,
      label: "Qaytarilgan vazifa",
      value: "6.2%",
      delta: 2,
      deltaNeg: true
    })]), h("div", {
      key: "g",
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
        gap: 16
      }
    }, [
    // Leaderboard
    h("div", {
      key: "L",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Trophy, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Mutaxassislar reytingi")]), h("div", {
      key: 2,
      style: {
        display: "flex",
        gap: 6
      }
    }, [h(window.FilterButton, {
      key: 1,
      kind: "users",
      size: "xs"
    }), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("Reyting tartiblandi: KPI ball bo'yicha", "info")
    }, [h(I.ChevronsUpDown, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Tartiblash")])])]), h("div", {
      className: "panel__body panel__body--flush",
      key: 2
    }, h("div", {
      className: "tbl-scroll"
    }, h("table", {
      className: "tbl"
    }, [h("thead", {
      key: "h"
    }, h("tr", null, [h("th", {
      key: 1
    }, "#"), h("th", {
      key: 2
    }, "Mutaxassis"), h("th", {
      key: 3
    }, "Auditlar"), h("th", {
      key: 4
    }, "Vazifa"), h("th", {
      key: 5
    }, "Findinglar"), h("th", {
      key: 6
    }, "Trend"), h("th", {
      key: 7
    }, "Δ"), h("th", {
      key: 8
    }, "Jami ball")])), h("tbody", {
      key: "b"
    }, D.KPI_USERS.map((k, i) => {
      const u = D.userById(k.user);
      const max = D.KPI_USERS[0].total;
      return h("tr", {
        key: k.user
      }, [h("td", {
        key: 1,
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 16,
          color: i === 0 ? "#fbbf24" : i === 1 ? "#cbd5e1" : i === 2 ? "#b45309" : "var(--text-tertiary)"
        }
      }, "#" + (i + 1)), h("td", {
        key: 2
      }, h("div", {
        className: "cell-title"
      }, [h(Avatar, {
        user: u,
        key: 1,
        size: "lg"
      }), h("div", {
        key: 2
      }, [h("div", {
        key: 1
      }, u.name), h("div", {
        key: 2,
        className: "cell-sub"
      }, u.title)])])), h("td", {
        key: 3,
        className: "tabular"
      }, k.audits), h("td", {
        key: 4,
        className: "tabular"
      }, k.tasks), h("td", {
        key: 5,
        className: "tabular"
      }, k.findings), h("td", {
        key: 6
      }, h(Sparkline, {
        data: k.sparkline,
        w: 100,
        h: 28
      })), h("td", {
        key: 7
      }, h("span", {
        className: "tag " + (k.delta >= 0 ? "tag--success" : "tag--danger")
      }, (k.delta > 0 ? "+" : "") + k.delta)), h("td", {
        key: 8
      }, h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, [h("div", {
        key: 1,
        style: {
          width: 80,
          height: 4,
          background: "var(--bg-surface-3)",
          borderRadius: 2
        }
      }, h("div", {
        style: {
          width: k.total / max * 100 + "%",
          height: "100%",
          background: "var(--brand)",
          borderRadius: 2
        }
      })), h("span", {
        key: 2,
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 16,
          color: "var(--text-primary)",
          minWidth: 40,
          textAlign: "right"
        }
      }, k.total)]))]);
    }))])))]), h("div", {
      key: "R",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, [
    // KPI rules card
    h("div", {
      key: "r",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, [h("div", {
      className: "panel__t"
    }, [h(I.Settings, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "KPI qoidalari")]), h("button", {
      key: 2,
      className: "btn btn--ghost btn--xs",
      onClick: () => window.showToast("KPI qoidalari tahrirlash oynasi ochilmoqda...", "info")
    }, [h(I.Edit3, {
      key: "i",
      size: 12
    }), h("span", {
      key: "t"
    }, "Tahrir")])]), h("div", {
      className: "panel__body",
      key: 2,
      style: {
        padding: 0,
        maxHeight: 300,
        overflowY: "auto"
      }
    }, D.KPI_RULES.map((r, i, arr) => h("div", {
      key: i,
      style: {
        padding: "8px 14px",
        borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, [h("span", {
      key: 1,
      style: {
        flex: 1,
        fontSize: 12.5,
        color: "var(--text-secondary)"
      }
    }, r.event), h("span", {
      key: 2,
      className: "font-bold tabular",
      style: {
        color: r.points > 0 ? "var(--status-success-fg)" : "var(--status-danger-fg)",
        fontFamily: "var(--font-display)",
        fontSize: 13,
        minWidth: 32,
        textAlign: "right"
      }
    }, (r.points > 0 ? "+" : "") + r.points)])))]),
    // Top breakdown
    h("div", {
      key: "b",
      className: "panel"
    }, [h("div", {
      className: "panel__h",
      key: 1
    }, h("div", {
      className: "panel__t"
    }, [h(I.PieChart, {
      key: "i",
      size: 15
    }), h("span", {
      key: "t"
    }, "Bobur Mirzayev — ball tarkibi")])), h("div", {
      className: "panel__body",
      key: 2
    }, [h("div", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16
      }
    }, [h(Donut, {
      key: 1,
      items: [{
        value: 60,
        color: "#3b65f6"
      },
      // Audit ishtirok
      {
        value: 75,
        color: "#10b981"
      },
      // Findinglar
      {
        value: 95,
        color: "#0ea5e9"
      },
      // Vazifalar
      {
        value: 45,
        color: "#fbbf24"
      },
      // Rahbarlik
      {
        value: 12,
        color: "#f87171"
      } // Penalty
      ],
      total: 287,
      size: 100
    }), h("div", {
      key: 2,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [["Vazifalar (bajarilgan)", 95, "#0ea5e9"], ["Findinglar (tasdiq.)", 75, "#10b981"], ["Audit ishtiroki", 60, "#3b65f6"], ["Rahbarlik bonusi", 45, "#fbbf24"], ["Penalty (qaytarish)", -12, "#f87171"]].map(([l, v, c]) => h("div", {
      key: l,
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12
      }
    }, [h("span", {
      key: 1,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, [h("span", {
      key: 1,
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: c
      }
    }), h("span", {
      key: 2
    }, l)]), h("span", {
      key: 2,
      className: "font-bold tabular"
    }, (v >= 0 ? "+" : "") + v)])))])])])])])]);
  }
  window.KpiScreen = KpiScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/screens-tools.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/tweaks-panel.jsx
try { (() => {
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  noDeckControls = false,
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(() => typeof document !== 'undefined' && !!document.querySelector('deck-stage'), []);
  // deck-stage enables its rail in connectedCallback, but this panel can
  // mount before that element has upgraded. The initial read catches the
  // common case; the listener covers mounting first. (Older deck-stage.js
  // copies still wait for the host's __omelette_rail_enabled postMessage —
  // same listener handles those.)
  const [railEnabled, setRailEnabled] = React.useState(() => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled);
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = e => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem('deck-stage.railVisible') !== '0';
    } catch (e) {
      return true;
    }
  });
  const toggleRail = on => {
    setRailVisible(on);
    window.postMessage({
      type: '__deck_rail_visible',
      on
    }, '*');
  };
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children, hasDeckStage && railEnabled && !noDeckControls && /*#__PURE__*/React.createElement(TweakSection, {
    label: "Deck"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Thumbnail rail",
    value: railVisible,
    onChange: toggleRail
  })))));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/wow.jsx
try { (() => {
/* WOW / cinematic components — boot sequence, hero command band,
   radial gauge, threat radar, live ticker, leaderboard podium. */
(function () {
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const h = React.createElement;
  const I = window.Icons;
  const D = window.AppData;
  const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =========================================================================
  // CINEMATIC BOOT SEQUENCE
  // =========================================================================
  function BootSequence({
    onDone
  }) {
    const reduce = reducedMotion();
    const lines = [{
      l: "Yopiq kontur muhiti ishga tushirilmoqda",
      v: "secure"
    }, {
      l: "Ollama AI yadrosi yuklanmoqda",
      v: "qwen2.5:14b"
    }, {
      l: "Audit ma'lumotlar bazasi ulanmoqda",
      v: "342 yozuv"
    }, {
      l: "EXE agentlar sinxronizatsiyasi",
      v: "6 online"
    }, {
      l: "Xavfsizlik telemetriyasi faollashtirildi",
      v: "live"
    }];
    const [shown, setShown] = useState(reduce ? lines.length : 0);
    const [prog, setProg] = useState(reduce ? 100 : 0);
    const [out, setOut] = useState(false);
    useEffect(() => {
      if (reduce) {
        const t = setTimeout(onDone, 60);
        return () => clearTimeout(t);
      }
      let i = 0;
      const li = setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= lines.length) clearInterval(li);
      }, 300);
      let p = 0;
      const pi = setInterval(() => {
        p += 4;
        setProg(Math.min(100, p));
        if (p >= 100) {
          clearInterval(pi);
          setOut(true);
          setTimeout(onDone, 560);
        }
      }, 90);
      return () => {
        clearInterval(li);
        clearInterval(pi);
      };
    }, []);
    return h("div", {
      className: "boot2" + (out ? " is-out" : "")
    }, h("div", {
      className: "boot2__inner"
    }, [h("div", {
      key: "m",
      className: "boot2__mark"
    }, h("svg", {
      viewBox: "0 0 48 52",
      fill: "none",
      stroke: "#fff",
      strokeWidth: 2.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, [h("path", {
      key: 1,
      pathLength: 1,
      d: "M24 3 L43 10 V25 C43 37 35 45 24 49 C13 45 5 37 5 25 V10 Z"
    }), h("path", {
      key: 2,
      pathLength: 1,
      d: "M15 25 l6 6 l12 -14"
    })])), h("div", {
      key: "t",
      className: "boot2__title"
    }, ["Audit", h("span", {
      key: "a",
      className: "accent"
    }, "or")]), h("div", {
      key: "s",
      className: "boot2__sub"
    }, "Axborot xavfsizligi auditi"), h("div", {
      key: "log",
      className: "boot2__log"
    }, lines.map((ln, i) => h("div", {
      key: i,
      className: "boot2__line" + (i < shown ? " show" : "")
    }, [h("span", {
      key: "ok",
      className: "ok"
    }, i < shown ? "✓" : "·"), h("span", {
      key: "l"
    }, ln.l), h("span", {
      key: "v",
      className: "val"
    }, i < shown ? ln.v : "")]))), h("div", {
      key: "bar",
      className: "boot2__bar"
    }, h("i", {
      style: {
        width: prog + "%"
      }
    }))]));
  }
  window.BootSequence = BootSequence;

  // =========================================================================
  // RADIAL GAUGE  (270° arc, gradient fill, count-up center)
  // =========================================================================
  function Gauge({
    value = 0,
    max = 100,
    size = 132,
    stroke = 12,
    cap = "Posture"
  }) {
    const reduce = reducedMotion();
    const r = (size - stroke) / 2;
    const cx = size / 2;
    const C = 2 * Math.PI * r;
    const arc = 0.75 * C;
    const [drawn, setDrawn] = useState(reduce);
    useEffect(() => {
      if (reduce) {
        setDrawn(true);
        return undefined;
      }
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setDrawn(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }, []);
    const offset = drawn ? arc * (1 - Math.min(1, value / max)) : arc;
    return h("div", {
      className: "gauge",
      style: {
        width: size,
        height: size
      }
    }, [h("svg", {
      key: "svg",
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`
    }, [h("defs", {
      key: "d"
    }, h("linearGradient", {
      id: "gaugeGrad",
      x1: "0",
      y1: "0",
      x2: "1",
      y2: "1"
    }, [h("stop", {
      key: 1,
      offset: "0%",
      stopColor: "var(--brand)"
    }), h("stop", {
      key: 2,
      offset: "100%",
      stopColor: "#38bdf8"
    })])), h("circle", {
      key: "tr",
      className: "gauge__track",
      cx,
      cy: cx,
      r,
      fill: "none",
      strokeWidth: stroke,
      strokeDasharray: `${arc} ${C - arc}`,
      strokeLinecap: "round",
      transform: `rotate(135 ${cx} ${cx})`
    }), h("circle", {
      key: "fi",
      className: "gauge__fill",
      cx,
      cy: cx,
      r,
      fill: "none",
      strokeWidth: stroke,
      strokeDasharray: `${arc} ${C - arc}`,
      strokeDashoffset: offset,
      transform: `rotate(135 ${cx} ${cx})`
    })]), h("div", {
      key: "lab",
      className: "gauge__label"
    }, [h("span", {
      key: "n",
      className: "gauge__num"
    }, h(window.CountUp, {
      value
    })), h("span", {
      key: "c",
      className: "gauge__cap"
    }, cap)])]);
  }
  window.Gauge = Gauge;

  // =========================================================================
  // THREAT RADAR
  // =========================================================================
  function ThreatRadar() {
    const blips = [{
      x: 64,
      y: 30,
      c: "crit",
      d: "0s"
    }, {
      x: 78,
      y: 62,
      c: "high",
      d: "0.6s"
    }, {
      x: 38,
      y: 70,
      c: "med",
      d: "1.1s"
    }, {
      x: 30,
      y: 42,
      c: "high",
      d: "1.5s"
    }, {
      x: 70,
      y: 80,
      c: "med",
      d: "0.3s"
    }];
    return h("div", {
      className: "radar"
    }, [h("div", {
      key: "g",
      className: "radar__grid"
    }, [h("div", {
      key: 1,
      className: "radar__ring"
    }), h("div", {
      key: 2,
      className: "radar__ring r2"
    }), h("div", {
      key: 3,
      className: "radar__ring r3"
    }), h("div", {
      key: 4,
      className: "radar__ring r4"
    }), h("div", {
      key: 5,
      className: "radar__cross h"
    }), h("div", {
      key: 6,
      className: "radar__cross v"
    })]), h("div", {
      key: "sw",
      className: "radar__sweep"
    }), ...blips.map((b, i) => h("span", {
      key: "b" + i,
      className: "radar__blip " + b.c,
      style: {
        left: b.x + "%",
        top: b.y + "%",
        color: b.c === "crit" ? "#f87171" : b.c === "high" ? "#fbbf24" : "#38bdf8",
        animationDelay: b.d
      }
    }))]);
  }
  window.ThreatRadar = ThreatRadar;

  // =========================================================================
  // LIVE EVENT TICKER
  // =========================================================================
  function LiveTicker({
    items
  }) {
    const list = items || [{
      c: "#f87171",
      t: "Critical finding",
      b: "FW-CORE-01 · 10.0.0.0/8 to'liq ruxsat"
    }, {
      c: "#34d399",
      t: "Vazifa bajarildi",
      b: "T-116 · Nessus skaner import"
    }, {
      c: "#38bdf8",
      t: "EXE agent sync",
      b: "AUD-2026-014 · 6 ta yangi log"
    }, {
      c: "#fbbf24",
      t: "Review kutilmoqda",
      b: "T-117 · DNS tunneling tahlili"
    }, {
      c: "#34d399",
      t: "Audit tasdiqlandi",
      b: "AUD-2026-013 · Soliq qo'mitasi"
    }];
    const seq = [...list, ...list];
    return h("div", {
      className: "ticker"
    }, [h("span", {
      key: "tag",
      className: "ticker__tag"
    }, [h("span", {
      key: "d",
      className: "live-dot"
    }), h("span", {
      key: "t"
    }, "Jonli")]), h("div", {
      key: "win",
      className: "ticker__win"
    }, h("div", {
      className: "ticker__track"
    }, seq.map((e, i) => h("span", {
      key: i,
      className: "ticker__item"
    }, [h("span", {
      key: "d",
      className: "ticker__dot",
      style: {
        background: e.c
      }
    }), h("b", {
      key: "t"
    }, e.t), h("span", {
      key: "b"
    }, "— " + e.b)]))))]);
  }
  window.LiveTicker = LiveTicker;

  // =========================================================================
  // HERO COMMAND BAND
  // =========================================================================
  function HeroBand({
    score = 74,
    scoreTrend = 6,
    caption,
    metrics = [],
    gauge = 89,
    gaugeCap = "Bajarildi"
  }) {
    return h("div", {
      className: "hero-band glow-border"
    }, [h("div", {
      key: "main",
      className: "hero-band__main"
    }, [h("div", {
      key: "eb",
      className: "hero-eyebrow"
    }, [h("span", {
      key: "d",
      className: "live-dot"
    }), h("span", {
      key: "t"
    }, "Live · Xavfsizlik holati markazi")]), h("div", {
      key: "hl",
      className: "hero-band__headline"
    }, [h("div", {
      key: "sc",
      className: "hero-score"
    }, [h(window.CountUp, {
      key: "n",
      value: score
    }), h("sup", {
      key: "s"
    }, "/100")]), h("div", {
      key: "cap",
      className: "hero-band__caption"
    }, [h("h2", {
      key: 1
    }, "Tashkilot xavfsizlik ko'rsatkichi"), h("p", {
      key: 2
    }, caption || "Joriy chorakda umumiy holat barqaror. 4 ta audit faol, kritik findinglar kamaymoqda.")])]), h("div", {
      key: "mx",
      className: "hero-metrics"
    }, metrics.map((m, i) => h("div", {
      key: i,
      className: "hero-metric" + (m.tone ? " hero-metric--" + m.tone : "")
    }, [h("span", {
      key: "v",
      className: "hero-metric__v"
    }, h(window.CountUp, {
      value: m.value
    })), h("span", {
      key: "l",
      className: "hero-metric__l"
    }, m.label)])))]), h("div", {
      key: "side",
      className: "hero-band__side"
    }, [h(Gauge, {
      key: "g",
      value: gauge,
      cap: gaugeCap
    }), h(ThreatRadar, {
      key: "r"
    })]), h(LiveTicker, {
      key: "tk"
    })]);
  }
  window.HeroBand = HeroBand;

  // =========================================================================
  // LEADERBOARD PODIUM (top 3)
  // =========================================================================
  function Podium({
    users
  }) {
    const top = (users || D.KPI_USERS).slice(0, 3);
    // visual order: 2nd, 1st, 3rd
    const order = [top[1], top[0], top[2]].filter(Boolean);
    const heights = {
      0: 56,
      1: 84,
      2: 44
    }; // by visual column
    const maxTotal = Math.max(...top.map(t => t.total), 1);
    return h("div", {
      className: "podium"
    }, order.map((k, col) => {
      const rank = k === top[0] ? 1 : k === top[1] ? 2 : 3;
      const u = D.userById(k.user);
      const barH = 30 + k.total / maxTotal * 64;
      return h("div", {
        key: k.user,
        className: "podium__col podium__col--" + rank
      }, [h("div", {
        key: "m",
        className: "podium__medal podium__medal--" + rank
      }, rank), h(window.Avatar, {
        key: "av",
        user: u,
        size: rank === 1 ? "lg" : "md"
      }), h("div", {
        key: "nm",
        className: "podium__name"
      }, u.name), h("div", {
        key: "sb",
        className: "podium__sub"
      }, k.audits + " audit · " + k.findings + " finding"), h("div", {
        key: "sc",
        className: "podium__score"
      }, h(window.CountUp, {
        value: k.total
      })), h("div", {
        key: "bar",
        className: "podium__bar",
        style: {
          height: barH
        }
      })]);
    }));
  }
  window.Podium = Podium;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/wow.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Sev = __ds_scope.Sev;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Donut = __ds_scope.Donut;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarStack = __ds_scope.AvatarStack;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
