# Auditor — UI kit

A full, interactive recreation of the Auditor product surface, built entirely on the design system (`../../styles.css`). Open `index.html`.

## What's here
- **Cinematic boot** → role-aware **dashboard** (hero command band, KPI stats, finding-severity donut, leaderboard podium, live ticker).
- **Screens:** Auditlar (audits), Findinglar, Vazifalar (tasks), Skaner/fayl tahlili, AI tahlil, KPI, Hisobotlar, Audit tokenlar, Foydalanuvchilar, Rollar, Audit loglar, EXE agent demo, Profil.
- **Live controls:** switch role (departament → 1-toifa), toggle light/dark theme, collapse the sidebar, open the Tweaks panel (primary color, background tone, density, **Demo/Presentation mode**).

## Files
- `index.html` — entry; loads React + Babel, data, icons, chrome, screens, app.
- `app.jsx` — shell, routing, tweaks, boot.
- `chrome.jsx` — sidebar, topbar, and shared primitives (Stat, Donut, Sparkline, Avatar, Tag, Sev, Modal, Drawer, Tabs, FilterButton, toasts…).
- `wow.jsx` / `wow.css` — cinematic layer (boot, gauge, radar, ticker, podium, spotlight, glow borders).
- `data.js` — realistic mock store (users, roles, orgs, audits, findings, tasks, KPIs).
- `icons.jsx` — the Lucide-style icon set.
- `screens-*.jsx` — one file per product area.

## Notes
This kit intentionally mirrors the real app rather than re-implementing primitives from `components/` — it predates them and is the source they were extracted from. Treat it as the canonical "what a real Auditor view looks like" reference; treat `components/` as the clean, prop-typed building blocks for new work.
