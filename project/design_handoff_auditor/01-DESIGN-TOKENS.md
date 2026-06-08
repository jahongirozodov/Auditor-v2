# 01 — Design Tokens

Aniq qiymatlar. Komponentlar **faqat semantik aliaslar** orqali ranglanadi (`--bg-*`, `--text-*`, `--brand*`, `--status-*`, `--border-*`), shuning uchun light/dark avtomatik ishlaydi. Asl manba: `design-source/tokens/`.

## Ranglar — semantik aliaslar

### Light (`:root` / `[data-theme="light"]`)

| Token | Qiymat | Ishlatish |
|---|---|---|
| `--bg-page` | `#f8fafc` (slate-50) | sahifa foni |
| `--bg-surface` | `#ffffff` (slate-0) | karta/panel foni |
| `--bg-surface-2` | `#f1f5f9` (slate-100) | ichki/muted yuza |
| `--bg-surface-3` | `#e2e8f0` (slate-200) | progress trek, chiplar |
| `--bg-input` | `#ffffff` | input foni |
| `--bg-hover` | `rgba(15,23,42,.04)` | hover wash |
| `--border-color` | `#e2e8f0` | barcha hairline chegaralar |
| `--border-strong` | `#cbd5e1` | hover/urg'u chegara |
| `--text-primary` | `#0f172a` (slate-900) | asosiy matn |
| `--text-secondary` | `#475569` (slate-600) | ikkilamchi |
| `--text-tertiary` | `#64748b` (slate-500) | meta |
| `--text-muted` | `#94a3b8` (slate-400) | placeholder |
| `--brand` | `#1e40af` (blue-800) | primary, faol holat |
| `--brand-hover` | `#1d4ed8` (blue-700) | |
| `--brand-pressed` | `#1e3a8a` (blue-900) | |
| `--brand-soft` | `#eff6ff` (blue-50) | yumshoq brend fon |
| `--brand-foreground` | `#ffffff` | brend ustidagi matn |
| `--brand-ring` | `rgba(30,64,175,.28)` | focus halqa |

### Dark (`[data-theme="dark"]`) — **default mahsulot temasi**

| Token | Qiymat |
|---|---|
| `--bg-page` | `#0a1120` |
| `--bg-surface` | `#0f172a` |
| `--bg-surface-2` | `#142036` |
| `--bg-surface-3` | `#1c2942` |
| `--bg-input` | `#0f172a` |
| `--bg-hover` | `rgba(148,163,184,.08)` |
| `--border-color` | `#1e2c47` |
| `--border-strong` | `#2a3a5c` |
| `--text-primary` | `#f1f5f9` |
| `--text-secondary` | `#cbd5e1` |
| `--text-tertiary` | `#94a3b8` |
| `--text-muted` | `#64748b` |
| `--brand` | `#3b65f6` |
| `--brand-hover` | `#608bfa` |
| `--brand-pressed` | `#2549eb` |
| `--brand-soft` | `rgba(59,101,246,.14)` |
| `--brand-soft-hover` | `rgba(59,101,246,.22)` |
| `--brand-ring` | `rgba(96,139,250,.45)` |

Dark yuza pog'onasi: `#0a1120 → #0f172a → #142036 → #1c2942`.

## Status / severity ranglari (bg = yumshoq fill, fg = matn/ikonka)

| Maqsad | Light fg | Dark fg | Ishlatish |
|---|---|---|---|
| success / faol / done | `#15803d` | `#34d399` | yashil |
| warning / high | `#b45309` | `#fbbf24` | amber |
| danger / critical | `#b91c1c` | `#f87171` | qizil |
| info / medium | `#0369a1` | `#38bdf8` | sky |
| neutral / low | `#334155` | `#cbd5e1` | slate |

**Finding severity** (`.sev--critical/high/medium/low`) shu status ranglariga mos: critical=danger, high=warning, medium=info, low=neutral/success. Dark uchun maxsus sozlangan.

## Tipografiya

**Oilalar:**
- `--font-display`: **Plus Jakarta Sans** (sarlavhalar, KPI raqamlari, brend) — weight 800, tracking −0.02em.
- `--font-sans`: **Manrope** (body, UI, kontrollar).
- `--font-mono`: **JetBrains Mono** (kodlar, ID, log satrlari, tabular raqamlar).

**O'lcham shkalasi (16px asos):**

| Token | rem | px | Rol |
|---|---|---|---|
| `--fs-12` | 0.75 | 12 | meta, caption |
| `--fs-13` | 0.8125 | 13 | zich jadval |
| `--fs-14` | 0.875 | 14 | kichik body, tugmalar |
| `--fs-15` | 0.9375 | 15 | body |
| `--fs-16` | 1 | 16 | katta body |
| `--fs-18` | 1.125 | 18 | lead |
| `--fs-20` | 1.25 | 20 | h5 |
| `--fs-24` | 1.5 | 24 | h4 |
| `--fs-30` | 1.875 | 30 | h3 |
| `--fs-36` | 2.25 | 36 | h2 |
| `--fs-48` | 3 | 48 | h1 / hero |
| `--fs-60` | 3.75 | 60 | display (KPI count-up) |

**Line-height:** tight 1.15 · snug 1.3 · normal 1.55 · relaxed 1.7
**Tracking:** tight −0.02em · snug −0.01em · normal 0 · wide 0.02em · caps 0.08em (faqat kichik UPPERCASE meta/stat label)
**Weights:** 400 / 500 / 600 / 700 / 800

**Semantik rollar:** display 60/800/tight · h1 48/800/tight · h2 36/700/tight · h3 24/700/snug · h4 20/600/snug · body 15/400/normal · label 14/600 · caption 12/500/caps.

> **Casing qoidasi:** sentence case hamma joyda. UPPERCASE faqat kichik meta/stat label va sidebar guruh sarlavhalari (`tracking-caps`).

## Spacing & radii

- **4px asos grid.** Spacing tokenlari `--space-*` (`tokens/spacing.css`).
- **Radii:** 6px kontrollar (tugma/input) · 12px karta/stat · 16–20px hero/katta panel · 999px pill va avatar.
- **Konteyner:** 1240px max. **Topbar:** 68px. **Sidebar:** ~248px (collapsed ~64px).

## Shadowlar (PrimeNG uslubidagi yumshoq, past tarqalish)

| Token | Light |
|---|---|
| `--shadow-xs` | `0 1px 2px rgba(15,23,42,.04)` |
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)` |
| `--shadow-md` | `0 2px 4px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.06)` |
| `--shadow-lg` | `0 8px 16px rgba(15,23,42,.08), 0 4px 6px rgba(15,23,42,.04)` |
| `--shadow-xl` | `0 24px 48px -12px rgba(15,23,42,.18)` |

Dark'da soyalar quyuqroq (`rgba(0,0,0,.25–.6)`). Kartalar **chegara + faint shadow-sm** ga tayanadi; hover 1px ko'taradi va `--shadow-md` + `--border-strong`.

## Motion

- Easing: `--ease-out: cubic-bezier(.2,.7,.2,1)`. Davomiylik: 120 / 200 / 320ms.
- Patternlar: route cross-fade, staggered kirish, raqam count-up (ease-out-expo), chart draw-in, tugma press 1px down-nudge, focus brend halqa.
- **Barcha animatsiyalar `prefers-reduced-motion` bilan gate qilingan.**

## Komponent CSS klasslari (tayyor, qayta ishlatish mumkin)

`app.css` + `kit-extra.css` quyidagilarni beradi (asl maket shularni ishlatadi):

`.btn` (`.btn--primary/secondary/ghost/soft/danger`, `.btn--sm/lg/xs`) · `.iconbtn` · `.tag` (`.tag--brand/info/success/warning/danger/ghost/outline`) · `.sev` (`.sev--critical/high/medium/low`) · `.stat` (+`.stat__icon/row/label`) · `.panel` (+`.panel__h/body/foot/t`) · `.card` · `.avatar` · `.tabs` · `.input`/`.select`/`.textarea`/`.field`/`.input-group`/`.checkbox` · `.tbl` (+`.tbl-wrap/scroll`, `.cell-sub/mono/actions`) · `.drawer` · `.modal` · toast (`window.showToast`) · `.lrow` (list row) · `.code-block`. Yangi qo'shilganlar: `.apf__*` (approval), `.topo-*` (topology), `.cmdk*` (command palette), `.login__*` (WOW login), `.aimd/.ai-typing` (AI chat), `.set-*`/`.tflow*` (settings/task flow).
