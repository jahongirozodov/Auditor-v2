# Auditor Design System

A design system extracted from **Auditor** — an information-security **audit-management platform** for a government Ministry of Digital Services (interface language: Uzbek, `*.gov.uz`). Auditor is a SOC-style internal tool where audit teams plan audits, run file/scanner analysis, triage findings by severity, manage tasks, track KPIs, and generate reports — with an on-prem AI assistant (local Ollama, `qwen2.5:14b`) running inside a closed network ("Yopiq kontur").

This project is the **reusable design system** behind that product: tokens, fonts, the component CSS layer, React component primitives, foundation specimens, and a full interactive UI kit.

> **Source:** extracted from the Auditor prototype in this same workspace (`app.jsx`, `chrome.jsx`, `data.js`, `icons.jsx`, `screens-*.jsx`, `app.css`). The live app is preserved under `ui_kits/auditor/`.

---

## How to consume

Link the single global entry — it ships every token, the webfonts, and the full component CSS layer:

```html
<link rel="stylesheet" href="styles.css" />
```

`styles.css → app.css → tokens.css → tokens/*.css`. Set the theme on `<html>`:

```html
<html data-theme="dark">   <!-- or "light" (default) -->
```

React primitives live under `components/<group>/` as ES modules (`export function …`). Use the CSS classes directly if you're not in React — every component is a thin wrapper over a documented class (`.btn`, `.tag`, `.sev`, `.stat`, `.panel`, `.card`, `.avatar`, `.tabs`, `.input`).

---

## CONTENT FUNDAMENTALS

**Language & voice.** All UI copy is in **Uzbek (Latin)**. Tone is **formal, institutional, and precise** — this is a government security tool, not a consumer app. No slang, no exclamation marks, no marketing fluff. Diacritics/apostrophes matter: *bo‘lim, qo‘mita, mas’ul* (use the proper ‘ʻ’/‘’’ glyphs).

**Casing.** Sentence case for everything — labels, buttons, headings (*"Yangi audit"*, *"Mening vazifalarim"*, *"Topilgan findinglar"*). Uppercase is reserved for small meta/caption labels and stat labels via letter-spacing (`--tracking-caps`, 0.08em), never for headlines.

**Person.** Addresses the user in **first person possessive** for their own scope — *"Mening auditlarim"*, *"Mening vazifalarim"* ("My audits / tasks"). System messages are impersonal and factual — *"Audit loyihasi tasdiqlandi"*, *"EXE agent sinxronlandi"*.

**Domain vocabulary** (kept in English where it's the security term of art, mixed into Uzbek sentences): *audit, finding, critical/high/medium/low, penetration test, CVSS, CVE, pentest, KPI, EXE agent, sync, token*. Audit codes follow `AUD-YYYY-NNN`; tasks `T-NNN`; assets like `FW-CORE-01`.

**Numbers.** Tabular, count-up on first paint. Scores as `72/100`, percentages as `89%`, deltas as `+6` / `−18%`. Dates `YYYY-MM-DD`; relative times in Uzbek — *"12 daqiqa oldin", "3 soat oldin", "Kecha"*.

**Emoji:** never. Iconography carries all glyph meaning.

---

## VISUAL FOUNDATIONS

**Overall vibe.** Enterprise **SOC / command-center**: dark-first, dense, calm, trustworthy. PrimeNG-inspired token discipline. Information-rich but never cluttered — generous internal padding, clear hierarchy, restrained color used only to encode meaning (severity, status, trend).

**Color.** Royal-blue brand (`--brand` = `#1e40af` light / `#3b65f6` dark) on a slate neutral spine. Color is **semantic, not decorative**: red = critical/danger, amber = high/warning, sky = medium/info, green = success/done, slate = low/neutral. Soft `*-bg` fills carry `*-fg` text in tags and badges. Everything routes through theme aliases (`--bg-*`, `--text-*`, `--border-*`, `--status-*`, `--brand*`) so light/dark "just works".

**Theme.** Ships **light and dark**, dark is the product default (`data-theme="dark"`). Dark surfaces step `#0a1120 → #0f172a → #142036 → #1c2942`. Severity badges are tuned to read best on dark.

**Type.** Three families: **Plus Jakarta Sans** (display — headings, KPI numerals, brand, weight 800, tight tracking −0.02em), **Manrope** (sans — body & UI), **JetBrains Mono** (codes, IDs, log lines, tabular figures). Scale runs 12 → 60px; display numerals are tabular and animate up from 0.

**Spacing & radii.** 4px base grid. Radii: 6px controls, 12px cards/stats, 16–20px hero/large panels, 999px pills & avatars. Container 1240px; topbar 68px.

**Surfaces / depth.** Cards and panels are `1px` bordered on `--bg-surface` with **soft, low-spread shadows** (`--shadow-sm/md`), not heavy drop shadows. Hover lifts a card 1px and strengthens the border + `--shadow-md`. Panels have a bordered header (`.panel__h`) and an optional muted footer.

**Borders.** Hairline `--border-color` (slate-200 / `#1e2c47` dark); `--border-strong` on hover/emphasis; `--border-subtle` for inner dividers.

**Motion.** Calm enterprise easing — `--ease-out: cubic-bezier(0.2,0.7,0.2,1)`, durations 120/200/320ms. Patterns: route cross-fades, staggered card/row entrances, number count-ups (ease-out-expo), chart draw-in (ring sweep, line draw), button press nudge (`translateY(1px)`), and a soft brand focus ring. The optional **cinematic "WOW" layer** (`wow.css`/`wow.jsx`) adds a boot sequence, animated gradient mesh, cursor spotlight on cards, glowing borders, threat radar, gauge, live ticker and a Demo/Presentation mode. **Every animation is gated behind `prefers-reduced-motion`.**

**Hover / press.** Hover: subtle `--bg-hover` wash or border strengthen; never a color inversion. Press: 1px down-nudge. Focus: `--focus-ring` (3px brand-blue halo).

**Imagery.** None — the product is data + iconography. No photos; users are shown as **initials avatars** on flat brand-soft tiles. The only "imagery" is data viz (donut, sparkline, bar, gauge, radar) and atmospheric gradients in the WOW layer.

---

## ICONOGRAPHY

**Custom Lucide-style line set**, hand-inlined as React components in `assets/icons.jsx` (≈70 glyphs). All share one base: `viewBox 0 0 24 24`, `fill none`, `stroke currentColor`, **stroke-width 1.75**, round caps & joins. They take a `size` prop (default 16; 13–18 in practice) and inherit color from text.

- **Not** an icon font and **not** a CDN dependency — copy `assets/icons.jsx` (or lift individual paths) when you need them.
- Brand mark is `ShieldCheck` (a shield + check) in a brand-gradient tile; see `guidelines/brand-mark.html`.
- Closest external match if you must substitute: **lucide.dev** (same geometry & 1.75 stroke) — flag any substitution.
- No emoji, ever. Unicode is used only for the apostrophe glyphs in Uzbek text.

---

## Index / manifest

**Root**
- `styles.css` — global entry (link this). → `app.css` → `tokens.css` → `tokens/*`.
- `app.css` — component + app-shell CSS layer (buttons, tags, stats, panels, tables, sidebar, topbar, modals, toasts…).
- `tokens.css` — token barrel (`@import`s `tokens/*`).
- `wow.css` / `wow.jsx` — optional cinematic layer.
- `SKILL.md` — Agent-Skill manifest for downloading into Claude Code.

**tokens/** — `fonts.css`, `colors.css` (raw scales), `themes.css` (light/dark semantic aliases), `typography.css`, `spacing.css`, `motion.css`.

**components/** — React primitives (`.jsx` + `.d.ts` + `.prompt.md` + a `*.card.html`):
- `buttons/` — **Button**
- `badges/` — **Tag**, **Sev** (severity)
- `data-display/` — **Avatar**, **AvatarStack**, **Stat**
- `charts/` — **Donut**, **Sparkline**
- `forms/` — **Input**, **Field**
- `navigation/` — **Tabs**

**guidelines/** — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.

**assets/** — `icons.jsx` (the icon set).

**ui_kits/auditor/** — the full interactive product recreation (`index.html` + screens). Boots into the cinematic intro, then the dashboard; switch roles, themes, and screens live. Also registered as a Starting Point.

---

## Caveats
- **Fonts** load from Google Fonts CDN (`tokens/fonts.css`). Self-host for offline / air-gapped (`gov.uz`) deployments by swapping the `@import` for local `@font-face` rules.
- The icon set is a **Lucide-style original**, not the Lucide package — keep them in sync manually if you adopt Lucide upstream.
- The UI kit uses in-browser Babel for portability; for production, precompile the JSX.
