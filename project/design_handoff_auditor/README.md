# Handoff: Auditor — Axborot xavfsizligi auditi platformasi (Next.js)

> **Maqsad:** Ushbu paketdagi HTML/JSX fayllar — **dizayn referenslari** (interaktiv prototip). Vazifa — shu dizaynni **Next.js** loyihasida, real ma'lumotlar bazasi va backend bilan **ishlab chiqarishga tayyor** ko'rinishda qayta qurish. Fayllarni to'g'ridan-to'g'ri ko'chirmang — ularni Next.js komponentlariga aylantiring va o'rnatilgan pattern/kutubxonalardan foydalaning.

Bu README o'zi yetarli: suhbatda qatnashmagan dasturchi ham faqat shu hujjat asosida ilovani qura oladi. Hujjat bo'limlarga bo'lingan — quyidagi fayllarni ham o'qing:

| Fayl | Mazmuni |
|---|---|
| `CLAUDE.md` | **Claude Code agent qoidalari** (har sessiyada o'qiladi) |
| `AGENTS.md` | Tool-agnostik agent konvensiyalari |
| `BUILD-ORDER.md` | Bosqichma-bosqich qurish rejasi (0–8) |
| `.env.example` | Muhit o'zgaruvchilari namunasi |
| `agent-rules/` | Fokuslangan qoidalar: UI, xavfsizlik, i18n, ma'lumot/arxitektura |
| `01-DESIGN-TOKENS.md` | Ranglar, tipografiya, spacing, radius, shadow — aniq qiymatlar |
| `02-ROUTES-AND-SCREENS.md` | Barcha sahifalar: route xaritasi, har bir ekran tafsiloti |
| `03-DATA-MODEL.md` | Entity'lar, RBAC (5 rol + ruxsatlar), KPI qoidalari |
| `04-FLOWS-AND-INTEGRATIONS.md` | 3-bosqichli tasdiqlash, vazifa workflow, AI/Ollama, EXE agent, topologiya |
| `design-source/` | Asl HTML/JSX prototip fayllari (referens sifatida) |

> **Claude Code'da boshlash:** repo ildiziga `CLAUDE.md` ni qo'ying (yoki shu papkani ildiz qiling), so'ng "CLAUDE.md, README va 01–04 hujjatlarni o'qib, BUILD-ORDER bo'yicha 0-bosqichdan boshla" deng.

---

## Overview

**Auditor** — davlat raqamli xizmatlar vazirligi uchun **axborot xavfsizligi auditini boshqarish platformasi** (SOC uslubidagi ichki tizim). Audit guruhlari auditlarni rejalashtiradi, fayl/skaner tahlilini o'tkazadi, topilmalarni (findings) jiddiylik bo'yicha tartiblaydi, vazifalarni taqsimlaydi, KPI'ni kuzatadi va hisobotlar yaratadi. On-prem AI yordamchisi (lokal Ollama, `qwen2.5:14b`) **yopiq tarmoqda** ("Yopiq kontur") ishlaydi.

- **Til:** O'zbek (lotin). Ohang — rasmiy, institutsional, aniq. Emoji yo'q.
- **Mavzu:** Dark default + Light. SOC / command-center estetikasi.
- **Foydalanuvchilar:** 5 rolli RBAC (departament → bo'lim → bosh → yetakchi → toifa).

## About the design files

`design-source/` ichidagi fayllar — **brauzerda ishlaydigan dizayn prototipi**:
- `design-source/auditor/*.jsx` — React komponentlari, lekin **`React.createElement` (qisqartmasi `h(...)`)** bilan yozilgan (JSX emas), CDN React + in-browser Babel orqali. Bu prototip uchun; **production'da bularni to'g'ri `.tsx` JSX komponentlarga aylantiring.**
- `design-source/*.css` + `tokens/*.css` — to'liq dizayn-token va komponent CSS qatlami. **Bularni deyarli o'zgarishsiz ishlatish mumkin** (CSS o'zgaruvchilari + utility klasslar).
- State route URL'da emas, `useState` da saqlangan (`route`, `auditId` va h.k.). Production'da bu **Next.js App Router** sahifalariga aylanadi.

## Fidelity: **High-fidelity (hifi)**

Bu piksel-darajadagi maket — yakuniy ranglar, tipografiya, spacing, animatsiyalar va interaksiyalar bilan. UI'ni shu ko'rinishda aniq qayta yarating; tokenlar va CSS qatlamini ishlating.

---

## Tavsiya etilgan Next.js arxitekturasi

**Stack:** Next.js 14+ (App Router) · TypeScript · CSS qatlam (tokens) yoki Tailwind (ixtiyoriy, pastga qarang) · Server Actions / Route Handlers · Prisma + PostgreSQL (RLS bilan) · `next/font`.

### Fayl daraxti

```
app/
  layout.tsx                 # <html data-theme>, fontlar, global CSS, ThemeProvider
  globals.css                # tokens/*.css + app.css (import) — pastga qarang
  (auth)/
    login/page.tsx           # WOW login ekrani (boot → login → app)
  (app)/
    layout.tsx               # AppShell: Sidebar + Topbar + main (auth guard)
    dashboard/page.tsx
    organizations/page.tsx
    organizations/[id]/page.tsx
    audits/page.tsx
    audits/[id]/page.tsx     # tabs: overview | group | project | tasks | findings | files | tokens | ai | kpi
    tasks/page.tsx           # "Mening vazifalarim"
    tasks/assign/page.tsx    # Vazifalarni taqsimlash (group_lead)
    tasks/[id]/page.tsx      # vazifa tafsiloti
    findings/page.tsx
    analysis/config/page.tsx
    analysis/scanner/page.tsx
    analysis/topology/page.tsx
    analysis/traffic/page.tsx
    ai/page.tsx              # AI tahlil & hisobot quruvchi
    kpi/page.tsx
    reports/page.tsx
    tokens/page.tsx          # audit tokenlar
    users/page.tsx
    permissions/page.tsx     # rollar matritsasi
    logs/page.tsx            # audit jurnali
    agent/page.tsx           # EXE agent (demo)
    settings/page.tsx
    profile/page.tsx
  api/
    ai/route.ts              # Ollama proxy (window.claude.complete o'rnига)
components/
  ui/                        # Button, Tag, Sev, Stat, Panel, Card, Avatar, Tabs, Input, Field, Donut, Sparkline, Drawer, Modal, Toast
  chrome/                    # Sidebar, Topbar, PageHeader, CommandPalette
  approval/ApprovalFlow.tsx  # 3-bosqichli tasdiqlash (umumiy)
  topology/TopologyGraph.tsx # force-directed graf
lib/
  rbac.ts                    # rollar + ruxsatlar
  data/                      # server-side data access (Prisma)
styles/
  tokens/                    # fonts/colors/themes/typography/spacing/motion.css
  app.css
  kit-extra.css              # qo'shimcha komponent CSS (approval, topology, cmdk, login, AI)
```

> **Route map:** prototipdagi `route` qiymatlari → App Router yo'llari to'liq jadval bilan `02-ROUTES-AND-SCREENS.md` da.

### Global CSS / tokenlar

`design-source/styles.css` → `app.css` → `tokens.css` → `tokens/*.css` zanjirini import qiladi. Next.js'da `app/globals.css` ichida shu tartibni saqlang:

```css
/* globals.css */
@import "../styles/tokens/fonts.css";     /* yoki next/font — pastga qarang */
@import "../styles/tokens/colors.css";
@import "../styles/tokens/themes.css";
@import "../styles/tokens/typography.css";
@import "../styles/tokens/spacing.css";
@import "../styles/tokens/motion.css";
@import "../styles/tokens.css";
@import "../styles/app.css";
@import "../styles/kit-extra.css";
```

Komponentlar **faqat semantik aliaslar** (`--bg-*`, `--text-*`, `--brand*`, `--status-*`, `--border-*`) orqali ranglanadi — light/dark avtomatik ishlaydi. Aniq qiymatlar `01-DESIGN-TOKENS.md` da.

### Theming (light/dark)

`<html data-theme="dark">` (default) yoki `"light"`. `ThemeProvider` (client) `localStorage` ga saqlaydi va `document.documentElement.dataset.theme` ni o'zgartiradi. Tema almashtirishda tranzitsiyalarni vaqtincha o'chiring (`.ds-no-transition`).

### Fontlar (`next/font` bilan)

3 oila — display, sans, mono:

```ts
import { Plus_Jakarta_Sans, Manrope, JetBrains_Mono } from "next/font/google";
export const display = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-display-next" });
export const sans    = Manrope({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-sans-next" });
export const mono    = JetBrains_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono-next" });
```

`<html>` ga `${display.variable} ${sans.variable} ${mono.variable}` qo'shing, so'ng `tokens/fonts.css` dagi `--font-display/--font-sans/--font-mono` ni shu `*-next` o'zgaruvchilarga ulang (yoki Google Fonts `@import` ni qoldiring — air-gapped muhitda self-host qiling).

### Tailwind (ixtiyoriy)

Loyiha Tailwind ishlatsa, tokenlarni `tailwind.config` ga `colors: { brand: "var(--brand)", … }` ko'rinishida ulang. Lekin tayyor `app.css` + `kit-extra.css` qatlami allaqachon to'liq — eng tez yo'l shu CSS'ni import qilib, komponent klasslarini (`.btn`, `.panel`, `.stat`, `.tag`, `.sev`, `.input`, `.tbl`) ishlatish.

---

## State management

Prototip lokal `useState` ishlatadi. Production'da:

- **Server state (ma'lumotlar):** Server Components + Prisma orqali fetch; mutatsiyalar — Server Actions yoki Route Handlers. Mijoz keshlash uchun **TanStack Query** yoki Next.js `revalidatePath`.
- **UI state:** route (App Router), tanlangan tab (`useState` yoki `?tab=` searchParam), drawer/modal ochiqligi, tema, rol (auth sessiyasidan), command palette ochiqligi (`⌘K`).
- **Auth/rol:** prototipdagi `tweaks.role` — production'da **sessiya** (NextAuth/Auth.js + AD/LDAP yoki domen sertifikati). RBAC `lib/rbac.ts` da; UI elementlari `can(role, "modul.amal")` bilan gate qilinadi (`03-DATA-MODEL.md`).

## Animatsiyalar / WOW qatlami

Barcha animatsiyalar **`@media (prefers-reduced-motion: no-preference)`** bilan o'ralgan:
- Boot ketma-ketligi (sessiyada bir marta), route cross-fade, staggered card/row kirish, raqam count-up.
- Login: drifting bloblar, radar sweep, scan beam, ko'tariluvchi zarralar, qalqondagi pulsing radar, staggered kirish.
- Topologiya: oqim paketlari (edge bo'ylab), critical/high tugunlarda pulsing alert halqalar.
- Kartalarda kursor spotlight (`--mx/--my` mousemove orqali).

Detallar `04-FLOWS-AND-INTEGRATIONS.md` va `kit-extra.css` da.

## Assets

Rasm/foto yo'q — UI butunlay data + ikonografiya. Ikonkalar: **Lucide uslubidagi** maxsus to'plam (`design-source/auditor/icons.jsx`, ~70 glyph; `viewBox 0 0 24 24`, `stroke-width 1.75`). Production'da **`lucide-react`** ishlating (deyarli bir xil geometriya) — har bir `I.Xxx` ni mos `lucide-react` ikonkaga moslang. Brand mark — `ShieldCheck` brend-gradient plitkada. Avatarlar — bosh harflar (initsiallar).

## Files (referens)

`design-source/auditor/` ichida:
- `app.jsx` — root: route switch, holat, boot/login gate, tweaks. **→ App Router'ga bo'linadi.**
- `chrome.jsx` — Sidebar, Topbar, PageHeader, umumiy primitivlar (`Button`, `Tag`, `Sev`, `Stat`, `Panel`, `Avatar`, `Drawer`, `statusTag`, `confirmAction`, `showToast`).
- `data.js` — barcha mock ma'lumot (USERS, ROLES, ORGS, AUDITS, TASKS, FINDINGS, KPI_RULES, TOKENS, LOGS, PERM_MODULES, REPORTS, TOPOLOGY, PROJECT_APPROVAL, ORG_DETAIL). **→ Prisma sxemasi uchun asos (`03-DATA-MODEL.md`).**
- `icons.jsx` — ikonka to'plami.
- `components-approval.jsx` — `ApprovalFlow` (3-bosqichli tasdiqlash).
- `components-search.jsx` — `CommandPalette` (⌘K).
- `screens-overview.jsx` — LoginScreen, DashboardScreen.
- `screens-audit.jsx` — AuditsListScreen, AuditDetailScreen (+ tabs), AuditGroup, AuditProject, FindingsScreen, finding drawer.
- `screens-tasks.jsx` — MyTasksScreen, AssignScreen, TaskDetailScreen.
- `screens-tools.jsx` — ScannerScreen (config/scanner/traffic), AIScreen, KpiScreen, ReportsScreen.
- `screens-topology.jsx` — TopologyScreen (force graf).
- `screens-orgs.jsx` — OrgsScreen, OrgDetailScreen.
- `screens-admin.jsx` — UsersScreen, PermissionsScreen, LogsScreen, TokensScreen, ProfileScreen.
- `screens-agent.jsx` — AgentScreen (EXE agent demo).
- `screens-settings.jsx` — SettingsScreen.
- `app.css`, `kit-extra.css`, `wow.css` — komponent + qo'shimcha CSS.
- `index.html` — barcha skriptlarni yuklash tartibi (referens).
