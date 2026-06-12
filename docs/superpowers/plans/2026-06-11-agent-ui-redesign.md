# Agent UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the desktop agent's web UI (wwwroot) with a "Tactical Intelligence" aesthetic — collapsible sidebar, full-screen hero login, animated transitions, dark/light theme toggle, self-hosted fonts, inline SVG icons, and severity color bars on findings/tasks rows.

**Architecture:** Vanilla JS SPA served by local Kestrel from `wwwroot/`. Three files: `index.html` (shell + theme init), `app.css` (design system with CSS custom properties for both themes, all animations), `app.js` (screen logic + theme/sidebar state). Fonts live in `wwwroot/fonts/`. No build step, no CDN.

**Tech Stack:** Vanilla JS ES2020, CSS custom properties, CSS animations, WOFF2 self-hosted fonts (Geist + JetBrains Mono subset), inline SVG icons.

---

## Design Decisions Reference

| Decision | Choice |
|---|---|
| Feel | Productivity + visual (fast AND beautiful) |
| Theme | System preference default + manual toggle, localStorage |
| Animations | Medium — slide-in screens, staggered lists, 200-300ms |
| Login | Full-screen animated mesh gradient + centered card |
| Sidebar | Collapsed (48px icons) by default, hover → expand (214px) + pill indicator |
| Lists | Hybrid rows: severity color bar left + hover quick actions |
| Fonts | Self-hosted Geist (body) + JetBrains Mono (data) |
| Online status | Animated dot + dismissible top banner on change |
| Finding form | Single page, grouped sections, severity colored pill selector |

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `wwwroot/index.html` | Modify | Theme init script (no-flash), font preload, shell HTML with sidebar/main/toast/banner |
| `wwwroot/app.css` | Rewrite | Full design system: CSS vars (dark+light), typography, layout, components, animations |
| `wwwroot/app.js` | Rewrite | All screens + theme toggle + sidebar collapse + online banner + screen transitions |
| `wwwroot/fonts/Geist-Regular.woff2` | Create | Self-hosted body font |
| `wwwroot/fonts/Geist-Medium.woff2` | Create | Self-hosted medium weight |
| `wwwroot/fonts/Geist-SemiBold.woff2` | Create | Self-hosted semibold weight |
| `wwwroot/fonts/JetBrainsMono-Regular.woff2` | Create | Self-hosted mono font |

---

## Task 1: Self-hosted fonts

**Files:**
- Create: `wwwroot/fonts/` (4 WOFF2 files downloaded from open source releases)

Download Geist from Vercel's open-source release and JetBrains Mono from JetBrains. Both are OFL-licensed.

- [ ] **Step 1: Download Geist font files**

Run in PowerShell (one-time, needs internet — do before air-gap deploy):
```powershell
$base = "D:\MY PROJECTS\Auditor v6\Auditor-v2\agent\src\Auditor.Agent.Desktop\wwwroot\fonts"
New-Item -ItemType Directory -Force $base | Out-Null

# Geist from Vercel GitHub releases
$geistBase = "https://github.com/vercel/geist-font/releases/download/1.3.0"
Invoke-WebRequest "$geistBase/GeistVF.woff2" -OutFile "$base\Geist.woff2"

# JetBrains Mono
$jbBase = "https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304"
Invoke-WebRequest "$jbBase/JetBrainsMono-2.304.zip" -OutFile "$env:TEMP\jbmono.zip"
Expand-Archive "$env:TEMP\jbmono.zip" -DestinationPath "$env:TEMP\jbmono" -Force
Copy-Item "$env:TEMP\jbmono\fonts\webfonts\JetBrainsMono-Regular.woff2" "$base\"
```

- [ ] **Step 2: Verify files exist**

```powershell
Get-ChildItem "D:\MY PROJECTS\Auditor v6\Auditor-v2\agent\src\Auditor.Agent.Desktop\wwwroot\fonts"
# Expected: Geist.woff2, JetBrainsMono-Regular.woff2
```

- [ ] **Step 3: Fallback CSS in app.css (add @font-face before Task 3)**

```css
@font-face {
  font-family: 'Geist';
  src: url('/fonts/Geist.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

- [ ] **Step 4: Commit**

```bash
git add agent/src/Auditor.Agent.Desktop/wwwroot/fonts/
git commit -m "feat(agent-ui): add self-hosted Geist + JetBrains Mono fonts"
```

---

## Task 2: index.html — no-flash theme init + shell structure

**Files:**
- Modify: `agent/src/Auditor.Agent.Desktop/wwwroot/index.html`

- [ ] **Step 1: Rewrite index.html**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Auditor Agent</title>
  <!-- No-flash theme: runs before CSS paint -->
  <script>
    (function() {
      var stored = localStorage.getItem('theme');
      var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', stored || sys);
    })();
  </script>
  <link rel="preload" href="/fonts/Geist.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/JetBrainsMono-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/app.css">
</head>
<body>
  <!-- Offline/online change banner (hidden by default) -->
  <div id="net-banner" class="net-banner hidden" role="alert"></div>

  <div id="shell" class="shell">
    <aside id="sidebar" class="sidebar collapsed hidden" aria-label="Navigatsiya">
      <div class="sidebar-inner">
        <div id="nav-token" class="token-card"></div>
        <nav id="nav-list" class="nav-list"></nav>
        <button id="theme-btn" class="nav-item theme-toggle" aria-label="Temani almashtirish">
          <span class="nav-icon" id="theme-icon">🌙</span>
          <span class="nav-label">Tema</span>
        </button>
      </div>
    </aside>

    <div class="main">
      <div id="content" class="content"></div>
      <footer id="statusbar" class="statusbar hidden"></footer>
    </div>
  </div>

  <div id="toast" class="toast hidden" role="status" aria-live="polite"></div>
  <script src="/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add agent/src/Auditor.Agent.Desktop/wwwroot/index.html
git commit -m "feat(agent-ui): no-flash theme init + semantic shell structure"
```

---

## Task 3: app.css — complete design system rewrite

**Files:**
- Rewrite: `agent/src/Auditor.Agent.Desktop/wwwroot/app.css`

Replace the entire file with the following. This defines all CSS variables for both themes, typography, layout, every component class, and all animations.

- [ ] **Step 1: Write app.css**

```css
/* ── Fonts ─────────────────────────────────────────────────────── */
@font-face {
  font-family: 'Geist';
  src: url('/fonts/Geist.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

/* ── Reset ──────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { height: 100%; }
body { height: 100%; overflow: hidden; }

/* ── Design tokens — Dark (default) ────────────────────────────── */
:root, [data-theme="dark"] {
  color-scheme: dark;

  --bg-page:       #080e1a;
  --bg-surface:    #0d1526;
  --bg-surface-2:  #111d33;
  --bg-surface-3:  #172240;
  --bg-input:      #0d1526;
  --bg-hover:      rgba(99,137,255,.08);
  --bg-overlay:    rgba(8,14,26,.85);

  --border:        rgba(99,137,255,.14);
  --border-strong: rgba(99,137,255,.28);
  --border-subtle: rgba(99,137,255,.07);

  --text-primary:   #e8edf5;
  --text-secondary: #8898b8;
  --text-muted:     #4a5a7a;
  --text-inverse:   #080e1a;

  --brand:          #4f7ef8;
  --brand-hover:    #6b96ff;
  --brand-pressed:  #3a66e0;
  --brand-soft:     rgba(79,126,248,.12);
  --brand-glow:     rgba(79,126,248,.35);

  --success:        #22d3a0;
  --success-bg:     rgba(34,211,160,.12);
  --success-border: rgba(34,211,160,.25);
  --warning:        #fbbf24;
  --warning-bg:     rgba(251,191,36,.12);
  --warning-border: rgba(251,191,36,.25);
  --danger:         #f87171;
  --danger-bg:      rgba(248,113,113,.12);
  --danger-border:  rgba(248,113,113,.25);
  --info:           #38bdf8;
  --info-bg:        rgba(56,189,248,.12);
  --info-border:    rgba(56,189,248,.25);
  --ghost-bg:       rgba(136,152,184,.10);

  --sev-critical-color: #f87171;
  --sev-critical-bg:    rgba(248,113,113,.15);
  --sev-high-color:     #fb923c;
  --sev-high-bg:        rgba(251,146,60,.15);
  --sev-medium-color:   #fbbf24;
  --sev-medium-bg:      rgba(251,191,36,.15);
  --sev-low-color:      #22d3a0;
  --sev-low-bg:         rgba(34,211,160,.15);

  /* Sidebar */
  --sidebar-bg:     #0a1220;
  --sidebar-border: rgba(99,137,255,.12);
  --sidebar-w-open: 214px;
  --sidebar-w-coll: 52px;

  /* Dot grid background */
  --dot-color: rgba(79,126,248,.08);

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,.4);
  --shadow-md: 0 4px 16px rgba(0,0,0,.5);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.6);
  --shadow-glow: 0 0 24px var(--brand-glow);
}

/* ── Design tokens — Light ──────────────────────────────────────── */
[data-theme="light"] {
  color-scheme: light;

  --bg-page:       #f4f6fb;
  --bg-surface:    #ffffff;
  --bg-surface-2:  #f0f3fa;
  --bg-surface-3:  #e8edf7;
  --bg-input:      #ffffff;
  --bg-hover:      rgba(79,126,248,.06);
  --bg-overlay:    rgba(15,23,60,.55);

  --border:        rgba(79,126,248,.14);
  --border-strong: rgba(79,126,248,.28);
  --border-subtle: rgba(79,126,248,.06);

  --text-primary:   #0f1830;
  --text-secondary: #4a5a80;
  --text-muted:     #8898b8;
  --text-inverse:   #ffffff;

  --brand:          #3a66e0;
  --brand-hover:    #2a55cc;
  --brand-pressed:  #1e44b8;
  --brand-soft:     rgba(58,102,224,.10);
  --brand-glow:     rgba(58,102,224,.25);

  --success:        #059669;
  --success-bg:     rgba(5,150,105,.10);
  --success-border: rgba(5,150,105,.22);
  --warning:        #d97706;
  --warning-bg:     rgba(217,119,6,.10);
  --warning-border: rgba(217,119,6,.22);
  --danger:         #dc2626;
  --danger-bg:      rgba(220,38,38,.10);
  --danger-border:  rgba(220,38,38,.22);
  --info:           #0284c7;
  --info-bg:        rgba(2,132,199,.10);
  --info-border:    rgba(2,132,199,.22);
  --ghost-bg:       rgba(74,90,128,.08);

  --sev-critical-color: #dc2626;
  --sev-critical-bg:    rgba(220,38,38,.12);
  --sev-high-color:     #c2410c;
  --sev-high-bg:        rgba(194,65,12,.12);
  --sev-medium-color:   #b45309;
  --sev-medium-bg:      rgba(180,83,9,.12);
  --sev-low-color:      #059669;
  --sev-low-bg:         rgba(5,150,105,.12);

  --sidebar-bg:     #ffffff;
  --sidebar-border: rgba(79,126,248,.12);

  --dot-color: rgba(79,126,248,.06);

  --shadow-sm: 0 1px 3px rgba(15,23,60,.08);
  --shadow-md: 0 4px 16px rgba(15,23,60,.10);
  --shadow-lg: 0 12px 40px rgba(15,23,60,.14);
  --shadow-glow: 0 0 24px var(--brand-glow);
}

/* ── Base ───────────────────────────────────────────────────────── */
body {
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: 'Geist', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

/* Dot-grid atmosphere */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(var(--dot-color) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  z-index: 0;
}

#shell, .main, .content, #content { position: relative; z-index: 1; }

/* ── Reduced motion ─────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}

/* ── Layout ─────────────────────────────────────────────────────── */
.shell { display: flex; height: 100vh; overflow: hidden; }
.main  { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.content { flex: 1; overflow-y: auto; padding: 22px 26px; scroll-behavior: smooth; }

/* ── Network banner ─────────────────────────────────────────────── */
.net-banner {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  padding: 9px 20px;
  font-size: 12.5px; font-weight: 500; text-align: center;
  transform: translateY(-100%);
  transition: transform .28s cubic-bezier(.16,1,.3,1);
}
.net-banner.show  { transform: translateY(0); }
.net-banner.hidden { display: none; }
.net-banner.offline { background: var(--warning-bg); color: var(--warning); border-bottom: 1px solid var(--warning-border); }
.net-banner.online  { background: var(--success-bg); color: var(--success); border-bottom: 1px solid var(--success-border); }

/* ── Sidebar ────────────────────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w-coll);
  flex-shrink: 0;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width .22s cubic-bezier(.16,1,.3,1);
  position: relative;
}
.sidebar.hidden { display: none; }
.sidebar:hover, .sidebar.pinned { width: var(--sidebar-w-open); }

.sidebar-inner {
  width: var(--sidebar-w-open);
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 8px;
  overflow: hidden;
}

/* Token card — hidden when collapsed, shown when hovered/pinned */
.token-card {
  background: var(--bg-surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity .18s, transform .18s;
  white-space: nowrap;
  overflow: hidden;
}
.sidebar:hover .token-card,
.sidebar.pinned .token-card { opacity: 1; transform: translateX(0); }

.token-code { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: var(--text-primary); margin: 4px 0 2px; overflow: hidden; text-overflow: ellipsis; }
.token-audit { font-size: 10.5px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; }

/* Nav list */
.nav-list { flex: 1; display: flex; flex-direction: column; gap: 2px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  position: relative;
  transition: background .14s, color .14s;
  white-space: nowrap;
  overflow: hidden;
}
.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active {
  background: var(--brand-soft);
  color: var(--brand-hover);
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 3px;
  background: var(--brand);
  border-radius: 0 3px 3px 0;
}
.nav-icon {
  width: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-icon svg { width: 16px; height: 16px; }
.nav-label { flex: 1; overflow: hidden; }
.badge {
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

/* Theme toggle at bottom */
.theme-toggle { margin-top: auto; }

/* ── Statusbar ──────────────────────────────────────────────────── */
.statusbar {
  background: var(--bg-surface);
  border-top: 1px solid var(--border);
  padding: 5px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.statusbar.hidden { display: none; }
.status-left, .status-right { display: flex; align-items: center; gap: 14px; }
.status-sep { color: var(--border-strong); }

/* Online dot */
.dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
.dot-online {
  background: var(--success);
  box-shadow: 0 0 0 2px var(--success-bg);
  animation: pulse-dot 2.4s ease-in-out infinite;
}
.dot-offline { background: var(--text-muted); }

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 2px var(--success-bg); }
  50%       { box-shadow: 0 0 0 5px transparent; }
}

/* ── Toast ──────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 52px;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  background: var(--bg-surface-3);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  color: var(--text-primary);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  white-space: nowrap;
  opacity: 0;
  transition: opacity .2s, transform .2s;
  pointer-events: none;
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.toast.hidden { display: none; }

/* ── Screen transitions ─────────────────────────────────────────── */
.screen-enter {
  animation: screen-in .22s cubic-bezier(.16,1,.3,1) both;
}
@keyframes screen-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Staggered list items */
.stagger > * {
  opacity: 0;
  animation: fade-up .2s cubic-bezier(.16,1,.3,1) both;
}
@media (prefers-reduced-motion: no-preference) {
  .stagger > *:nth-child(1)  { animation-delay: .03s; }
  .stagger > *:nth-child(2)  { animation-delay: .06s; }
  .stagger > *:nth-child(3)  { animation-delay: .09s; }
  .stagger > *:nth-child(4)  { animation-delay: .12s; }
  .stagger > *:nth-child(5)  { animation-delay: .15s; }
  .stagger > *:nth-child(6)  { animation-delay: .18s; }
  .stagger > *:nth-child(7)  { animation-delay: .21s; }
  .stagger > *:nth-child(8)  { animation-delay: .24s; }
  .stagger > *:nth-child(n+9){ animation-delay: .27s; }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Login hero ─────────────────────────────────────────────────── */
.login-hero {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  overflow: hidden;
}

/* Animated mesh gradient */
.login-hero::before {
  content: '';
  position: absolute;
  inset: -50%;
  background:
    conic-gradient(from 0deg at 30% 40%, transparent 0deg, rgba(79,126,248,.18) 60deg, transparent 120deg),
    conic-gradient(from 180deg at 70% 60%, transparent 0deg, rgba(34,211,160,.12) 60deg, transparent 120deg),
    conic-gradient(from 90deg at 50% 80%, transparent 0deg, rgba(251,191,36,.08) 40deg, transparent 80deg);
  animation: mesh-rotate 12s linear infinite;
}

@media (prefers-reduced-motion: no-preference) {
  .login-hero::before { animation: mesh-rotate 12s linear infinite; }
}
@keyframes mesh-rotate {
  to { transform: rotate(360deg); }
}

.login-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 50%, transparent 30%, var(--bg-page) 80%);
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 380px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg), 0 0 60px var(--brand-glow);
  animation: card-enter .5s cubic-bezier(.16,1,.3,1) both;
}
@keyframes card-enter {
  from { opacity: 0; transform: scale(.96) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.brand-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: var(--brand-soft);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.brand-icon svg { width: 26px; height: 26px; color: var(--brand); }

.auth-title {
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -.02em;
  margin-bottom: 4px;
}
.auth-sub {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 24px;
}

/* ── Form elements ──────────────────────────────────────────────── */
.field-label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .07em;
  color: var(--text-muted);
  margin-bottom: 5px;
  text-transform: uppercase;
}

.input {
  display: block;
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
}
.input.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
select.input { cursor: pointer; }
textarea.input { resize: vertical; min-height: 84px; }

.field-group { margin-top: 14px; }

.error-msg { font-size: 12px; color: var(--danger); margin-top: 8px; }
.error-msg.hidden { display: none; }

.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }

/* ── Buttons ────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background .14s, box-shadow .14s, opacity .14s, transform .1s;
  white-space: nowrap;
  user-select: none;
}
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn:active:not(:disabled) { transform: scale(.98); }

.btn-primary {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 0 0 0 var(--brand-soft);
}
.btn-primary:hover:not(:disabled) {
  background: var(--brand-hover);
  box-shadow: 0 2px 8px rgba(0,0,0,.3), 0 0 12px var(--brand-glow);
}
.btn-soft {
  background: var(--brand-soft);
  color: var(--brand-hover);
}
.btn-soft:hover:not(:disabled) { background: rgba(79,126,248,.2); }
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.btn-ghost:hover:not(:disabled) { background: var(--bg-hover); border-color: var(--border-strong); }
.btn-danger {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger-border);
}
.btn-danger:hover:not(:disabled) { background: rgba(248,113,113,.2); }

/* ── Page header ────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}
.h1 {
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -.02em;
  color: var(--text-primary);
}
.meta { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

/* ── Panel ──────────────────────────────────────────────────────── */
.panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.panel-header {
  padding: 12px 16px 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

/* ── List rows ──────────────────────────────────────────────────── */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
  transition: background .12s;
}
.list-item:last-child { border-bottom: none; }
.list-item:hover { background: var(--bg-hover); }

/* Severity color bar (left edge) */
.list-item[data-sev]::before {
  content: '';
  position: absolute;
  left: 0; top: 8px; bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
}
.list-item[data-sev="critical"]::before { background: var(--sev-critical-color); }
.list-item[data-sev="high"]::before     { background: var(--sev-high-color); }
.list-item[data-sev="medium"]::before   { background: var(--sev-medium-color); }
.list-item[data-sev="low"]::before      { background: var(--sev-low-color); }

/* Hover quick actions */
.list-item .quick-actions {
  opacity: 0;
  transform: translateX(4px);
  transition: opacity .14s, transform .14s;
  display: flex; gap: 6px; flex-shrink: 0;
}
.list-item:hover .quick-actions { opacity: 1; transform: translateX(0); }

.list-item-main { display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 0; }
.list-item-info { flex: 1; min-width: 0; }
.list-item-title { font-size: 13px; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Tags & severity pills ──────────────────────────────────────── */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
}
.tag-success { background: var(--success-bg); color: var(--success); border-color: var(--success-border); }
.tag-warning { background: var(--warning-bg); color: var(--warning); border-color: var(--warning-border); }
.tag-danger  { background: var(--danger-bg);  color: var(--danger);  border-color: var(--danger-border); }
.tag-info    { background: var(--info-bg);     color: var(--info);    border-color: var(--info-border);   }
.tag-ghost   { background: var(--ghost-bg);    color: var(--text-secondary); border-color: var(--border); }

/* Severity badge (compact, for list rows) */
.sev {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: .02em;
  flex-shrink: 0;
}
.sev-critical { background: var(--sev-critical-bg); color: var(--sev-critical-color); }
.sev-high     { background: var(--sev-high-bg);     color: var(--sev-high-color);     }
.sev-medium   { background: var(--sev-medium-bg);   color: var(--sev-medium-color);   }
.sev-low      { background: var(--sev-low-bg);      color: var(--sev-low-color);      }

/* Severity pill selector (for finding form) */
.sev-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.sev-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all .14s;
  font-family: inherit;
  background: transparent;
}
.sev-pill[data-sev="critical"] { color: var(--sev-critical-color); border-color: var(--sev-critical-bg); }
.sev-pill[data-sev="high"]     { color: var(--sev-high-color);     border-color: var(--sev-high-bg); }
.sev-pill[data-sev="medium"]   { color: var(--sev-medium-color);   border-color: var(--sev-medium-bg); }
.sev-pill[data-sev="low"]      { color: var(--sev-low-color);      border-color: var(--sev-low-bg); }
.sev-pill.selected[data-sev="critical"] { background: var(--sev-critical-bg); border-color: var(--sev-critical-color); }
.sev-pill.selected[data-sev="high"]     { background: var(--sev-high-bg);     border-color: var(--sev-high-color); }
.sev-pill.selected[data-sev="medium"]   { background: var(--sev-medium-bg);   border-color: var(--sev-medium-color); }
.sev-pill.selected[data-sev="low"]      { background: var(--sev-low-bg);      border-color: var(--sev-low-color); }

/* ── Filter bar ─────────────────────────────────────────────────── */
.filter-bar { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.filter-btn {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all .14s;
}
.filter-btn:hover { background: var(--bg-hover); border-color: var(--border-strong); }
.filter-btn.active { background: var(--brand-soft); color: var(--brand-hover); border-color: var(--brand); }

/* ── Drop zone ──────────────────────────────────────────────────── */
.drop-zone {
  border: 1.5px dashed var(--border-strong);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 28px 20px;
  text-align: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color .14s, background .14s;
}
.drop-zone:hover { border-color: var(--brand); background: var(--brand-soft); }
.drop-icon { font-size: 26px; display: block; margin-bottom: 8px; }
.drop-zone svg { width: 28px; height: 28px; margin-bottom: 8px; color: var(--text-muted); }

/* ── Chips ──────────────────────────────────────────────────────── */
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 12px;
}
.chip-size { color: var(--text-muted); font-size: 10.5px; }
.chip-remove {
  background: none; border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
  padding: 0 1px;
  transition: color .12s;
}
.chip-remove:hover { color: var(--danger); }

/* ── Files grid ─────────────────────────────────────────────────── */
.files-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(156px, 1fr)); gap: 10px; }
.file-tile {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  transition: border-color .14s, box-shadow .14s;
}
.file-tile:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
.file-icon { font-size: 28px; }
.file-name { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-secondary); word-break: break-all; }

/* ── Log ────────────────────────────────────────────────────────── */
.log-box {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  height: 400px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  line-height: 1.65;
}
.log-line { display: flex; gap: 10px; }
.log-ts    { color: var(--text-muted); flex-shrink: 0; }
.log-lvl   { width: 40px; flex-shrink: 0; font-weight: 700; color: var(--text-muted); }
.log-error .log-lvl { color: var(--danger); }
.log-warn  .log-lvl { color: var(--warning); }

/* ── Banner ─────────────────────────────────────────────────────── */
.banner { margin-bottom: 14px; }
.banner-success, .banner-warning {
  border-radius: 10px;
  padding: 11px 16px;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.banner-success { background: var(--success-bg); color: var(--success); border: 1px solid var(--success-border); }
.banner-warning { background: var(--warning-bg); color: var(--warning); border: 1px solid var(--warning-border); }

/* ── Settings ───────────────────────────────────────────────────── */
.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.settings-row:last-of-type { border-bottom: none; }

/* ── Section groups (finding form) ─────────────────────────────── */
.form-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 12px;
}
.form-section-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 14px;
}

/* ── Empty / loading ────────────────────────────────────────────── */
.empty-state, .loading {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
.empty-state svg { width: 36px; height: 36px; margin-bottom: 10px; opacity: .4; }

/* ── Utilities ──────────────────────────────────────────────────── */
.mono { font-family: 'JetBrains Mono', monospace; }
.form-page { max-width: 680px; }
.hidden { display: none !important; }
```

- [ ] **Step 2: Commit**

```bash
git add agent/src/Auditor.Agent.Desktop/wwwroot/app.css
git commit -m "feat(agent-ui): complete design system - dark/light tokens, animations, all components"
```

---

## Task 4: Inline SVG icon library

**Files:**
- Create: `agent/src/Auditor.Agent.Desktop/wwwroot/icons.js`
- Modify: `agent/src/Auditor.Agent.Desktop/wwwroot/index.html` (add script tag before app.js)

Replace emoji/unicode icons with consistent Lucide-style SVGs, inline (no CDN).

- [ ] **Step 1: Create icons.js**

```javascript
// Minimal SVG icon library — Lucide-compatible paths, inlined for air-gap
const ICONS = {
  shield:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  tasks:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h4M9 17h2"/><path d="M3 9h2M3 13h2M3 17h2"/></svg>`,
  findings:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v3M11 14h.01"/></svg>`,
  files:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  sync:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`,
  log:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>`,
  settings:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  moon:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  sun:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  upload:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  check:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  plus:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  chevronLeft:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  wifi:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  wifiOff:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a11 11 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  refresh:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
};

function icon(name, cls = '') {
  return `<span class="icon ${cls}" aria-hidden="true">${ICONS[name] || ''}</span>`;
}
```

- [ ] **Step 2: Add script tag to index.html before app.js**

In `index.html`, replace:
```html
  <script src="/app.js"></script>
```
With:
```html
  <script src="/icons.js"></script>
  <script src="/app.js"></script>
```

- [ ] **Step 3: Commit**

```bash
git add agent/src/Auditor.Agent.Desktop/wwwroot/icons.js agent/src/Auditor.Agent.Desktop/wwwroot/index.html
git commit -m "feat(agent-ui): inline SVG icon library, air-gap safe"
```

---

## Task 5: app.js complete rewrite — theme, sidebar, transitions, all screens

**Files:**
- Rewrite: `agent/src/Auditor.Agent.Desktop/wwwroot/app.js`

This is the largest task. Rewrite the entire `app.js` with:
1. Theme toggle (system + manual + localStorage)
2. Collapsible sidebar (collapsed by default, hover=expand, pin toggle)
3. Screen transition animation helper
4. Online/offline banner with auto-dismiss
5. All 9 screens using new CSS classes + SVG icons + severity pills + stagger animation
6. Separated `loadTasks()` and other helpers

- [ ] **Step 1: Rewrite app.js**

```javascript
'use strict';

// ── State ──────────────────────────────────────────────────────────────
const S = {
  screen:    'loading',
  online:    false,
  audited:   false,
  email:     '',
  tokenMasked: '',
  auditCode: '',
  version:   '',
  serverUrl: '',
  syncInterval: 5,
  drafts:    0,
  pending:   0,
};

let cachedTasks = [];
let prevOnline  = null; // for banner logic

// ── DOM helpers ────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── API ────────────────────────────────────────────────────────────────
const api = {
  async get(path) {
    try { return await (await fetch(path)).json(); } catch { return {}; }
  },
  async post(path, body) {
    try {
      return await (await fetch(path, {
        method: 'POST',
        headers: body ? {'Content-Type':'application/json'} : {},
        body:    body ? JSON.stringify(body) : undefined,
      })).json();
    } catch { return { ok: false, error: 'network' }; }
  },
  async put(path, body) {
    try {
      return await (await fetch(path, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body:    JSON.stringify(body),
      })).json();
    } catch { return { ok: false }; }
  },
  async upload(path, fd) {
    try { return await (await fetch(path, { method: 'POST', body: fd })).json(); }
    catch { return { ok: false }; }
  },
};

// ── Theme ──────────────────────────────────────────────────────────────
function getTheme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  const icon = $('theme-icon');
  if (icon) icon.innerHTML = t === 'dark' ? ICONS.moon : ICONS.sun;
}

function toggleTheme() { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); }

// ── Toast ──────────────────────────────────────────────────────────────
let _toastT;
function toast(msg, ms = 3200) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  // force reflow for transition
  t.offsetHeight;
  t.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 200); }, ms);
}

// ── Network banner ─────────────────────────────────────────────────────
let bannerTimer;
function showBanner(online) {
  const b = $('net-banner');
  if (!b) return;
  b.className = `net-banner ${online ? 'online' : 'offline'}`;
  b.textContent = online
    ? `${icon('wifi')} Server bilan aloqa tiklandi`
    : `${icon('wifiOff')} Server bilan aloqa uzildi — oflayn rejim`;
  b.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.remove('show'), 4000);
}

// ── State sync ─────────────────────────────────────────────────────────
async function syncState() {
  const d = await api.get('/api/state');
  Object.assign(S, {
    audited:      d.audited      ?? false,
    email:        d.email        ?? '',
    tokenMasked:  d.tokenMasked  ?? '',
    auditCode:    d.auditCode    ?? '',
    version:      d.version      ?? '',
    serverUrl:    d.serverUrl    ?? '',
    syncInterval: d.syncInterval ?? 5,
    drafts:       d.drafts       ?? 0,
    pending:      d.pending      ?? 0,
  });
  const ping = await api.get('/api/ping');
  const wasOnline = S.online;
  S.online = ping.ok ?? false;
  if (prevOnline !== null && prevOnline !== S.online) showBanner(S.online);
  prevOnline = S.online;
}

// ── Shell ──────────────────────────────────────────────────────────────
function renderShell() {
  const sidebar   = $('sidebar');
  const statusbar = $('statusbar');

  if (!S.audited) {
    sidebar?.classList.add('hidden');
    statusbar?.classList.add('hidden');
    return;
  }

  sidebar?.classList.remove('hidden');
  statusbar?.classList.remove('hidden');

  // Token card
  const tc = $('nav-token');
  if (tc) {
    tc.innerHTML = `
      <div class="field-label" style="font-size:9.5px">AUDIT TOKEN</div>
      <div class="token-code">${esc(S.tokenMasked || S.auditCode)}</div>
      <div class="token-audit">${esc(S.auditCode)}</div>
    `;
  }

  // Nav
  const nl = $('nav-list');
  if (nl) {
    nl.innerHTML = [
      ni('tasks',    'tasks',    'Mening vazifalarim'),
      ni('findings', 'findings', 'Findinglar (lokal)', S.drafts),
      ni('files',    'files',    'Fayllar'),
      ni('sync',     'sync',     'Sinxronlash', S.pending),
      ni('log',      'log',      'Lokal log'),
      ni('settings', 'settings', 'Sozlamalar'),
    ].join('');
    nl.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => nav(el.dataset.screen));
    });
  }

  // Theme toggle icon
  const ti = $('theme-icon');
  if (ti) ti.innerHTML = getTheme() === 'dark' ? ICONS.moon : ICONS.sun;

  // Status bar
  const sb = $('statusbar');
  if (sb) {
    const dot = S.online
      ? '<span class="dot dot-online"></span>'
      : '<span class="dot dot-offline"></span>';
    sb.innerHTML = `
      <div class="status-left">
        ${dot}
        <span>${S.online ? 'Onlayn' : 'Oflayn'}</span>
        <span class="status-sep">·</span>
        <span>Qoralama: ${S.drafts}</span>
        <span>Yuborilmagan: ${S.pending}</span>
      </div>
      <div class="status-right">
        <span>${esc(S.email)}</span>
        <span>v${esc(S.version)}</span>
      </div>
    `;
  }
}

function ni(screen, iconName, label, badge) {
  const active = S.screen === screen ? 'active' : '';
  const b = (badge ?? 0) > 0 ? `<span class="badge">${badge}</span>` : '';
  return `<button class="nav-item ${active}" data-screen="${screen}" aria-current="${active ? 'page' : 'false'}">
    <span class="nav-icon">${icon(iconName)}</span>
    <span class="nav-label">${label}</span>${b}
  </button>`;
}

// ── Router ─────────────────────────────────────────────────────────────
async function nav(screen, params = {}) {
  S.screen = screen;
  renderShell();
  const c = $('content');
  if (c) {
    c.innerHTML = '';
    c.classList.remove('screen-enter');
    c.offsetHeight; // reflow
    c.classList.add('screen-enter');
  }
  const fn = SCREENS[screen];
  if (fn) await fn(params);
}

// ── Helpers ────────────────────────────────────────────────────────────
function humanSize(b) {
  b = Number(b) || 0;
  if (b >= 1048576) return (b/1048576).toFixed(1)+' MB';
  if (b >= 1024)    return (b/1024).toFixed(1)+' KB';
  return b+' B';
}

function statusOf(s) {
  const m = {
    done:       ['Bajarilgan', 'success'],
    in_progress:['Jarayonda',  'info'],
    blocked:    ['Bloklangan', 'danger'],
    review:     ['Tekshiruvda','info'],
    returned:   ['Qaytarilgan','ghost'],
  };
  const [label, kind] = m[s] ?? ['Yangi', 'ghost'];
  return { label, kind };
}

function stateKind(s) {
  return { synced:'success', syncing:'info', failed:'danger' }[String(s).toLowerCase()] ?? 'ghost';
}
function stateLabel(s) {
  return { synced:'Yuborildi', syncing:'Yuborilmoqda', failed:'Xato', pending:'Navbatda' }[String(s).toLowerCase()] ?? 'Navbatda';
}
function filterBtn(key, label, active) {
  return `<button class="filter-btn${active===key?' active':''}" data-filter="${key}">${label}</button>`;
}

// ── Severity pill selector ─────────────────────────────────────────────
function sevPicker(selected = 'high') {
  return `<div class="sev-picker" id="sev-picker">
    ${['critical','high','medium','low'].map(s =>
      `<button class="sev-pill${s===selected?' selected':''}" data-sev="${s}" type="button">${s.charAt(0).toUpperCase()+s.slice(1)}</button>`
    ).join('')}
  </div>`;
}
function bindSevPicker(onchange) {
  $('sev-picker')?.querySelectorAll('.sev-pill').forEach(b => {
    b.addEventListener('click', () => {
      $('sev-picker').querySelectorAll('.sev-pill').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      if (onchange) onchange(b.dataset.sev);
    });
  });
}

// ── SCREENS ────────────────────────────────────────────────────────────
const SCREENS = {

  // LOGIN
  async login() {
    $('content').innerHTML = `
      <div class="login-hero">
        <div class="auth-card">
          <div class="brand-icon">${icon('shield')}</div>
          <h1 class="auth-title">Auditor Agent</h1>
          <p class="auth-sub">Lokal akkaunt bilan kiring</p>

          <div class="field-group">
            <label class="field-label" for="l-email">LOGIN</label>
            <input id="l-email" class="input" type="email" value="${esc(S.email)}" placeholder="email@domain.uz" autocomplete="username">
          </div>
          <div class="field-group">
            <label class="field-label" for="l-pass">PAROL</label>
            <input id="l-pass" class="input" type="password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <div id="l-err" class="error-msg hidden"></div>
          <button id="l-btn" class="btn btn-primary" style="margin-top:20px;width:100%">Kirish</button>
        </div>
      </div>
    `;

    const btn = $('l-btn'), emailIn = $('l-email'), passIn = $('l-pass'), errEl = $('l-err');

    async function doLogin() {
      const e = emailIn.value.trim(), p = passIn.value;
      if (!e || !p) { errEl.textContent = 'Login va parolni kiriting'; errEl.classList.remove('hidden'); return; }
      btn.disabled = true; btn.textContent = 'Kirilmoqda…';
      const res = await api.post('/api/login', { email: e, password: p });
      btn.disabled = false; btn.textContent = 'Kirish';
      if (res.ok) {
        S.email = e;
        await syncState(); renderShell();
        await nav(S.audited ? 'tasks' : 'token');
      } else {
        const msgs = {
          invalid_credentials: 'Login yoki parol notoʻgʻri',
          locked:              'Hisob vaqtincha bloklangan',
          offline_no_credential: 'Serverga ulanib boʻlmadi — sozlamalardagi manzilni tekshiring',
        };
        errEl.textContent = msgs[res.error] ?? 'Kirishda xatolik';
        errEl.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', doLogin);
    passIn.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    emailIn.focus();
  },

  // TOKEN
  async token() {
    $('content').innerHTML = `
      <div class="login-hero">
        <div class="auth-card">
          <button id="t-back" class="btn btn-ghost" style="align-self:flex-start;margin-bottom:16px">
            ${icon('chevronLeft')} Orqaga
          </button>
          <h2 class="auth-title" style="font-size:20px">Audit tokenini kiriting</h2>
          <p class="auth-sub">Server tomonidan berilgan bir martalik token</p>
          <div class="field-group">
            <label class="field-label" for="t-tok">AUDIT TOKENI</label>
            <input id="t-tok" class="input mono" placeholder="tok-xxxxxxxxxxxxxxxx">
          </div>
          <div id="t-err" class="error-msg hidden"></div>
          <button id="t-btn" class="btn btn-primary" style="margin-top:20px;width:100%">Tasdiqlash</button>
        </div>
      </div>
    `;

    $('t-back').addEventListener('click', () => nav('login'));
    const btn = $('t-btn'), tokIn = $('t-tok'), errEl = $('t-err');

    async function doValidate() {
      const t = tokIn.value.trim();
      if (!t) { errEl.textContent = 'Tokenni kiriting'; errEl.classList.remove('hidden'); return; }
      btn.disabled = true; btn.textContent = 'Tekshirilmoqda…';
      const res = await api.post('/api/token/validate', { token: t });
      btn.disabled = false; btn.textContent = 'Tasdiqlash';
      if (res.ok) { await syncState(); renderShell(); await nav('tasks'); }
      else {
        const msgs = { not_found:'Token topilmadi', expired:'Token muddati tugagan', token_inactive:'Token faol emas' };
        errEl.textContent = msgs[res.error] ?? 'Token tekshirilmadi';
        errEl.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', doValidate);
    tokIn.addEventListener('keydown', e => { if (e.key === 'Enter') doValidate(); });
    tokIn.focus();
  },

  // TASKS
  async tasks() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Mening vazifalarim</h1><p class="meta" id="t-sum"></p></div>
        <button id="t-sync" class="btn btn-soft">${icon('refresh')} Sinxronlash</button>
      </div>
      <div class="panel stagger" id="t-list"><div class="loading">Yuklanmoqda…</div></div>
    `;
    $('t-sync').addEventListener('click', async () => {
      $('t-sync').disabled = true;
      const r = await api.post('/api/sync');
      $('t-sync').disabled = false;
      if (r.requiresReauth) { toast('Audit tokeni yaroqsiz. Qayta kiriting.'); await nav('token'); return; }
      toast(r.online ? `Sync: ${r.created} yuborildi` : 'Server oflayn');
      await syncState(); renderShell(); await loadTasks();
    });
    await loadTasks();
  },

  // FINDINGS
  async findings() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Findinglar (lokal)</h1><p class="meta" id="f-sum"></p></div>
        <button id="f-new" class="btn btn-primary">${icon('plus')} Yangi finding</button>
      </div>
      <div class="filter-bar" id="f-bar"></div>
      <div class="panel stagger" id="f-list"><div class="loading">Yuklanmoqda…</div></div>
    `;
    $('f-new').addEventListener('click', async () => {
      if (!cachedTasks.length) cachedTasks = await api.get('/api/tasks');
      const t = cachedTasks[0];
      if (t) await nav('new-finding', { taskId: t.id, taskTitle: t.title });
      else toast('Avval vazifalar yuklanishi kerak');
    });
    let active = 'all';
    await loadFindings();

    async function loadFindings() {
      const list = await api.get('/api/findings');
      const counts = {
        all:     list.length,
        draft:   list.filter(f => f.state === 'draft').length,
        syncing: list.filter(f => f.state === 'syncing').length,
        sent:    list.filter(f => f.state === 'sent').length,
        error:   list.filter(f => f.state === 'error').length,
      };
      const sumEl = $('f-sum'); if (sumEl) sumEl.textContent = `${counts.all} ta finding`;
      const bar = $('f-bar');
      if (bar) {
        bar.innerHTML = [
          filterBtn('all',     `Hammasi (${counts.all})`,       active),
          filterBtn('draft',   `Qoralama (${counts.draft})`,    active),
          filterBtn('syncing', `Sinxronda (${counts.syncing})`, active),
          filterBtn('sent',    `Yuborilgan (${counts.sent})`,   active),
          filterBtn('error',   `Xato (${counts.error})`,        active),
        ].join('');
        bar.querySelectorAll('.filter-btn').forEach(b => {
          b.addEventListener('click', () => { active = b.dataset.filter; loadFindings(); });
        });
      }
      const visible = active === 'all' ? list : list.filter(f => f.state === active);
      const fl = $('f-list'); if (!fl) return;
      if (!visible.length) { fl.innerHTML = `<div class="empty-state">Finding topilmadi</div>`; return; }
      fl.innerHTML = visible.map(f => `
        <div class="list-item" data-sev="${esc(f.severity)}">
          <div class="list-item-main">
            <span class="sev sev-${esc(f.severity)}">${esc(f.severity.toUpperCase())}</span>
            <div class="list-item-info">
              <div class="list-item-title">${esc(f.title)}</div>
              <div class="meta">CVSS ${esc(String((f.cvss||0).toFixed(1)))}${f.cwe?' · '+esc(f.cwe):''}${f.asset?' · '+esc(f.asset):''} · ${esc(f.taskId)}${f.evidenceCount?` · ${f.evidenceCount} dalil`:''}</div>
            </div>
          </div>
          <span class="tag tag-${esc(f.stateKind)}">${esc(f.stateLabel)}</span>
        </div>
      `).join('');
    }
  },

  // NEW FINDING
  async 'new-finding'({ taskId = '', taskTitle = '' } = {}) {
    if (!cachedTasks.length) cachedTasks = await api.get('/api/tasks');
    const opts = cachedTasks.map(t =>
      `<option value="${esc(t.id)}" ${t.id === taskId ? 'selected' : ''}>${esc(t.title)}</option>`
    ).join('');

    $('content').innerHTML = `
      <div class="form-page">
        <div class="page-header">
          <div><h1 class="h1">Yangi finding</h1><p class="meta">${esc(taskId)}${taskTitle?' · '+esc(taskTitle):''}</p></div>
          <span class="tag tag-warning">Lokal qoralama</span>
        </div>

        <div class="form-section">
          <div class="form-section-title">Asosiy ma'lumot</div>
          <label class="field-label" for="nf-task">VAZIFA *</label>
          <select id="nf-task" class="input">${opts}</select>
          <div class="field-group">
            <label class="field-label" for="nf-title">SARLAVHA *</label>
            <input id="nf-title" class="input" placeholder="Topilma nomini yozing">
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Texnik tafsilotlar</div>
          <label class="field-label">XAVf DARAJASI</label>
          ${sevPicker('high')}
          <div class="form-row" style="margin-top:14px">
            <div>
              <label class="field-label" for="nf-cvss">CVSS 3.1</label>
              <input id="nf-cvss" class="input mono" type="number" min="0" max="10" step="0.1" value="5.0">
            </div>
            <div>
              <label class="field-label" for="nf-cwe">CWE</label>
              <input id="nf-cwe" class="input mono" placeholder="CWE-284">
            </div>
            <div>
              <label class="field-label" for="nf-asset">ASSET</label>
              <input id="nf-asset" class="input mono" placeholder="FW-CORE-01">
            </div>
          </div>
          <div class="field-group">
            <label class="field-label" for="nf-desc">TAVSIF</label>
            <textarea id="nf-desc" class="input" rows="4" placeholder="Topilma tavsifi, taʼsiri va tekshirish qadamlari"></textarea>
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Dalillar</div>
          <div class="drop-zone" id="nf-dropzone">
            ${icon('upload')}
            <p style="margin-bottom:8px">Fayllarni bu yerga tashlang yoki tanlang</p>
            <input id="nf-ev" type="file" multiple style="display:none">
            <button class="btn btn-soft" type="button" onclick="event.stopPropagation();$('nf-ev').click()">Biriktirish</button>
          </div>
          <div id="nf-chips" class="chips" style="margin-top:8px"></div>
        </div>

        <div id="nf-err" class="error-msg hidden"></div>
        <div class="form-actions">
          <button id="nf-cancel" class="btn btn-ghost">Bekor</button>
          <button id="nf-save"   class="btn btn-soft">Lokal saqlash</button>
          <button id="nf-send"   class="btn btn-primary">Yuborish</button>
        </div>
      </div>
    `;

    let selSev = 'high';
    bindSevPicker(s => { selSev = s; });

    const ev = [];
    $('nf-ev').addEventListener('change', e => {
      Array.from(e.target.files).forEach(f => { if (!ev.find(x => x.name === f.name)) ev.push(f); });
      renderChips();
    });
    $('nf-dropzone').addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON') $('nf-ev').click();
    });
    // Drag & drop
    $('nf-dropzone').addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--brand)'; });
    $('nf-dropzone').addEventListener('dragleave', e => { e.currentTarget.style.borderColor = ''; });
    $('nf-dropzone').addEventListener('drop', e => {
      e.preventDefault(); e.currentTarget.style.borderColor = '';
      Array.from(e.dataTransfer.files).forEach(f => { if (!ev.find(x => x.name === f.name)) ev.push(f); });
      renderChips();
    });

    function renderChips() {
      $('nf-chips').innerHTML = ev.map((f, i) => `
        <div class="chip">
          <span>${esc(f.name)}</span>
          <span class="chip-size">${humanSize(f.size)}</span>
          <button class="chip-remove" data-i="${i}" type="button">×</button>
        </div>
      `).join('');
      $('nf-chips').querySelectorAll('.chip-remove').forEach(b => {
        b.addEventListener('click', () => { ev.splice(+b.dataset.i, 1); renderChips(); });
      });
    }

    function validate() {
      const t = $('nf-title').value.trim();
      const c = parseFloat($('nf-cvss').value);
      const e = $('nf-err');
      if (t.length < 3) { e.textContent = 'Sarlavha kamida 3 ta belgi'; e.classList.remove('hidden'); return false; }
      if (isNaN(c)||c<0||c>10) { e.textContent = 'CVSS 0–10 oraligʻida'; e.classList.remove('hidden'); return false; }
      e.classList.add('hidden'); return true;
    }

    async function persist() {
      const body = {
        taskId:      $('nf-task').value,
        title:       $('nf-title').value.trim(),
        severity:    selSev,
        cvss:        parseFloat($('nf-cvss').value) || 5.0,
        cwe:         $('nf-cwe').value.trim() || 'CWE-284',
        asset:       $('nf-asset').value.trim(),
        description: $('nf-desc').value.trim(),
      };
      const res = await api.post('/api/findings', body);
      if (res.ok) {
        for (const file of ev) {
          const fd = new FormData(); fd.append('file', file); fd.append('findingKey', res.key);
          await api.upload('/api/evidence', fd);
        }
      }
      return res;
    }

    $('nf-cancel').addEventListener('click', () => nav('findings'));
    $('nf-save').addEventListener('click', async () => {
      if (!validate()) return;
      $('nf-save').disabled = true;
      const res = await persist();
      $('nf-save').disabled = false;
      if (res.ok) { toast('Finding lokal saqlandi'); await syncState(); await nav('findings'); }
    });
    $('nf-send').addEventListener('click', async () => {
      if (!validate()) return;
      $('nf-send').disabled = true; $('nf-send').textContent = 'Yuborilmoqda…';
      const res = await persist();
      if (res.ok) {
        const sync = await api.post('/api/sync');
        toast(sync.online ? `Finding yuborildi (${sync.created})` : 'Lokal saqlandi — server oflayn');
        await syncState(); await nav('findings');
      }
      if ($('nf-send')) { $('nf-send').disabled = false; $('nf-send').textContent = 'Yuborish'; }
    });
  },

  // FILES
  async files() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Lokal dalillar</h1><p class="meta">Barcha biriktirma fayllar</p></div>
        <label class="btn btn-soft" style="cursor:pointer">
          ${icon('upload')} Fayl biriktirish
          <input id="g-ev" type="file" multiple style="display:none">
        </label>
      </div>
      <div id="files-grid" class="files-grid stagger"><div class="loading">Yuklanmoqda…</div></div>
    `;
    $('g-ev').addEventListener('change', async e => {
      for (const f of e.target.files) {
        const fd = new FormData(); fd.append('file', f);
        await api.upload('/api/evidence', fd);
      }
      toast(`${e.target.files.length} fayl biriktiridi`);
      await loadFiles();
    });
    async function loadFiles() {
      const list = await api.get('/api/evidence');
      const grid = $('files-grid'); if (!grid) return;
      if (!list.length) { grid.innerHTML = `<div class="empty-state">Fayl topilmadi</div>`; return; }
      const fileIcon = ext => /png|jpg|jpeg|gif/.test(ext)?'🖼':/pcap/.test(ext)?'📡':/csv/.test(ext)?'📊':'📄';
      grid.innerHTML = list.map(f => {
        const ext = (f.filename||'').split('.').pop()?.toLowerCase()||'';
        return `
          <div class="file-tile">
            <div class="file-icon">${fileIcon(ext)}</div>
            <div class="file-name">${esc(f.filename)}</div>
            <div class="meta">${humanSize(f.sizeBytes)}</div>
            <span class="tag tag-${esc(stateKind(f.state))}">${esc(stateLabel(f.state))}</span>
          </div>
        `;
      }).join('');
    }
    await loadFiles();
  },

  // SYNC
  async sync() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Sinxronlash</h1><p class="meta">Server bilan maʼlumotlarni almashtirish navbati</p></div>
        <button id="s-now" class="btn btn-primary">${icon('refresh')} Hozir sinxronla</button>
      </div>
      <div id="s-banner" class="banner"></div>
      <div class="panel" style="margin-bottom:14px">
        <div class="panel-header">Yuborish navbati</div>
        <div id="s-queue" class="stagger"></div>
      </div>
      <div class="field-label" style="margin-bottom:6px">Oxirgi sinxronlash loglari</div>
      <textarea id="s-logs" class="input mono" rows="8" readonly style="resize:none"></textarea>
    `;
    async function loadSync() {
      const [ping, findings, evidence, logs] = await Promise.all([
        api.get('/api/ping'), api.get('/api/findings'),
        api.get('/api/evidence'), api.get('/api/logs'),
      ]);
      const online = ping.ok ?? false;
      const banner = $('s-banner');
      if (banner) banner.innerHTML = online
        ? `<div class="banner-success">${icon('check')} Onlayn · server bilan aloqada</div>`
        : `<div class="banner-warning">${icon('wifiOff')} Oflayn · server bilan aloqa yoʻq</div>`;
      const queue = [
        ...findings.filter(f=>f.state==='draft').map(f=>({ item:`Finding — ${f.title}`, size:'—' })),
        ...evidence.filter(e=>String(e.state).toLowerCase()==='pending').map(e=>({ item:e.filename, size:humanSize(e.sizeBytes) })),
      ];
      const sq = $('s-queue');
      if (sq) sq.innerHTML = queue.length
        ? queue.map(q=>`<div class="list-item"><span>${esc(q.item)}</span><div><span class="meta">${esc(q.size)}</span> <span class="tag tag-ghost" style="margin-left:6px">Navbatda</span></div></div>`).join('')
        : `<div class="empty-state" style="padding:14px">Navbat boʻsh</div>`;
      const sl = $('s-logs');
      if (sl) { sl.value = logs.slice(-40).map(l=>`[${l.ts}] ${String(l.level).padEnd(5)} ${l.message}`).join('\n'); sl.scrollTop=sl.scrollHeight; }
    }
    $('s-now').addEventListener('click', async () => {
      $('s-now').disabled=true; $('s-now').innerHTML=`${icon('refresh')} Sinxronlanmoqda…`;
      const r = await api.post('/api/sync');
      $('s-now').disabled=false; $('s-now').innerHTML=`${icon('refresh')} Hozir sinxronla`;
      if (r.requiresReauth) { toast('Audit tokeni yaroqsiz.'); await nav('token'); return; }
      toast(r.online?`${r.created} finding, ${r.evidenceSent} fayl yuborildi`:'Server oflayn — keyinroq');
      await syncState(); renderShell(); await loadSync();
    });
    await loadSync();
  },

  // LOG
  async log() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Lokal log</h1><p class="meta">Soʻnggi 200 ta yozuv</p></div>
        <button id="lg-ref" class="btn btn-ghost">${icon('refresh')} Yangilash</button>
      </div>
      <div id="lg-box" class="log-box">Yuklanmoqda…</div>
    `;
    async function load() {
      const logs = await api.get('/api/logs');
      const box = $('lg-box'); if (!box) return;
      box.innerHTML = logs.map(l => {
        const cls = l.level==='ERROR'?'log-error':l.level==='WARN'?'log-warn':'';
        return `<div class="log-line ${cls}"><span class="log-ts">${esc(l.ts)}</span><span class="log-lvl">${esc(l.level)}</span><span>${esc(l.message)}</span></div>`;
      }).join('');
      box.scrollTop = box.scrollHeight;
    }
    $('lg-ref').addEventListener('click', load);
    await load();
  },

  // SETTINGS
  async settings() {
    const cfg = await api.get('/api/settings');
    $('content').innerHTML = `
      <div style="max-width:560px">
        <div class="page-header"><div><h1 class="h1">Sozlamalar</h1></div></div>

        <div class="panel" style="margin-bottom:12px">
          <div class="panel-header">Server ulanishi</div>
          <div style="padding:16px">
            <label class="field-label" for="cfg-url">SERVER MANZILI</label>
            <input id="cfg-url" class="input mono" value="${esc(cfg.serverUrl??'')}" placeholder="https://auditor.example.com">
            <div class="field-group">
              <label class="field-label" for="cfg-int">AUTO-SYNC INTERVALI (DAQIQA)</label>
              <input id="cfg-int" class="input" type="number" min="1" max="60" value="${esc(String(cfg.syncInterval??5))}">
            </div>
            <button id="cfg-save" class="btn btn-primary" style="margin-top:16px">Saqlash</button>
          </div>
        </div>

        <div class="panel" style="margin-bottom:12px">
          <div class="panel-header">Tizim ma'lumotlari</div>
          <div class="settings-row"><span class="meta">Shifrlash</span><span class="mono" style="color:var(--text-secondary);font-size:11px">${esc(cfg.encryption??'')}</span></div>
          <div class="settings-row"><span class="meta">Versiya</span><span class="mono" style="color:var(--text-secondary)">v${esc(cfg.version??'')}</span></div>
          <div style="padding:12px 16px">
            <button id="cfg-upd" class="btn btn-ghost">Yangilanishni tekshirish</button>
            <p id="cfg-upd-msg" class="meta" style="margin-top:8px"></p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">Sessiya</div>
          <div style="padding:16px">
            <p class="meta" style="margin-bottom:12px">Chiqishda lokal sessiya oʻchadi.</p>
            <button id="cfg-logout" class="btn btn-danger">Chiqish</button>
          </div>
        </div>
      </div>
    `;
    $('cfg-save').addEventListener('click', async () => {
      $('cfg-save').disabled=true;
      await api.put('/api/settings', { serverUrl:$('cfg-url').value.trim(), syncInterval:parseInt($('cfg-int').value)||5 });
      $('cfg-save').disabled=false; toast('Sozlamalar saqlandi');
    });
    $('cfg-upd').addEventListener('click', async () => {
      $('cfg-upd').disabled=true;
      const r = await api.post('/api/update-check');
      $('cfg-upd').disabled=false;
      $('cfg-upd-msg').textContent = r.available?`Yangi versiya mavjud: v${r.latest}`:'Eng soʻnggi versiya oʻrnatilgan';
    });
    $('cfg-logout').addEventListener('click', async () => {
      await api.post('/api/logout'); S.audited=false; S.email=''; await nav('login');
    });
  },
};

// ── Tasks loader (shared) ──────────────────────────────────────────────
async function loadTasks() {
  const tasks = await api.get('/api/tasks');
  cachedTasks = tasks;
  const sumEl = $('t-sum');
  if (sumEl) {
    const ip = tasks.filter(t=>t.status==='in_progress').length;
    const fr = tasks.filter(t=>t.status==='new').length;
    sumEl.textContent = `${tasks.length} ta vazifa · ${ip} jarayonda · ${fr} yangi`;
  }
  const list = $('t-list'); if (!list) return;
  if (!tasks.length) { list.innerHTML=`<div class="empty-state">Vazifalar topilmadi</div>`; return; }
  list.innerHTML = tasks.map(t => {
    const st = statusOf(t.status);
    return `
      <div class="list-item" data-sev="${t.findings>0?'high':''}">
        <div class="list-item-main">
          <div class="list-item-info">
            <div class="list-item-title">${esc(t.title)}</div>
            <div class="meta">${esc(t.type)} · ${esc(t.priority)} · ${esc(t.due)}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          ${t.findings>0?`<span class="meta">${t.findings} finding</span>`:''}
          <span class="tag tag-${esc(st.kind)}">${esc(st.label)}</span>
          <div class="quick-actions">
            <button class="btn btn-soft" style="font-size:11px;padding:4px 10px" data-tid="${esc(t.id)}" data-ttitle="${esc(t.title)}">
              ${icon('plus')} Finding
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  list.querySelectorAll('[data-tid]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      nav('new-finding', { taskId:btn.dataset.tid, taskTitle:btn.dataset.ttitle });
    });
  });
}

// ── Sidebar collapse + theme toggle wire-up ────────────────────────────
function wireSidebarAndTheme() {
  $('theme-btn')?.addEventListener('click', () => {
    toggleTheme();
    const ti = $('theme-icon');
    if (ti) ti.innerHTML = getTheme()==='dark' ? ICONS.moon : ICONS.sun;
  });
}

// ── Background ping ────────────────────────────────────────────────────
setInterval(async () => {
  const was = S.online;
  const r = await api.get('/api/ping');
  S.online = r.ok ?? false;
  if (S.online !== was) {
    if (prevOnline !== null) showBanner(S.online);
    prevOnline = S.online;
    if (S.audited) renderShell();
  }
}, 12000);

// ── Init ───────────────────────────────────────────────────────────────
(async () => {
  wireSidebarAndTheme();
  await syncState();
  if (S.audited) await nav('tasks');
  else await nav('login');
})();
```

- [ ] **Step 2: Build and test**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\agent\src\Auditor.Agent.Desktop"
dotnet build -c Release 2>&1 | Select-Object -Last 5
# Expected: Build succeeded. 0 Warning(s), 0 Error(s)
```

- [ ] **Step 3: Publish**

```powershell
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true `
  -p:EnableCompressionInSingleFile=true -o "..\..\publish"
# Expected: publish succeeds, agent/publish/wwwroot/ has index.html, app.css, app.js, icons.js
```

- [ ] **Step 4: Verify publish output**

```powershell
Get-ChildItem "D:\MY PROJECTS\Auditor v6\Auditor-v2\agent\publish" -Recurse | Select-Object Name
# Must include: wwwroot/index.html, wwwroot/app.css, wwwroot/app.js, wwwroot/icons.js
# If fonts downloaded: wwwroot/fonts/Geist.woff2, wwwroot/fonts/JetBrainsMono-Regular.woff2
```

- [ ] **Step 5: Commit**

```bash
git add agent/src/Auditor.Agent.Desktop/wwwroot/
git commit -m "feat(agent-ui): redesign - dark/light, animated sidebar, hero login, severity bars, SVG icons"
```

---

## Self-review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| Dark/light theme (system + manual) | Task 3 (CSS vars), Task 5 (toggleTheme + localStorage + no-flash) |
| Medium animations (slide-in, stagger 200-300ms) | Task 3 (.screen-enter, .stagger, @keyframes) |
| Full-screen hero login | Task 3 (.login-hero, animated mesh) + Task 5 (login screen) |
| Collapsible sidebar (icon→hover expand) | Task 3 (.sidebar CSS) + Task 5 (renderShell) |
| Hybrid list rows + severity color bar | Task 3 ([data-sev]::before) + Task 5 (findings, tasks) |
| Self-hosted fonts (air-gap) | Task 1 (WOFF2 download) + Task 3 (@font-face) |
| Inline SVG icons | Task 4 (icons.js) |
| Online/offline banner | Task 3 (.net-banner CSS) + Task 5 (showBanner) |
| Severity pill selector for finding form | Task 3 (.sev-pill CSS) + Task 5 (sevPicker/bindSevPicker) |
| Staggered list animations | Task 3 (.stagger CSS) + Task 5 (.stagger class on panels) |
| Drag & drop evidence | Task 5 (dragover/drop handlers on nf-dropzone) |

**No gaps found.**

**Placeholder scan:** No TBD/TODO in plan. All code blocks complete. Method names consistent across tasks (`icon()`, `sevPicker()`, `bindSevPicker()`, `nav()`, `loadTasks()`, `stateKind()`, `stateLabel()`).

**Type consistency:** `ICONS` used in `icons.js` as global var, referenced in `app.js` via `icon(name)` helper. `SCREENS` object keys match `nav(screen)` call strings including `'new-finding'`. All consistent.
