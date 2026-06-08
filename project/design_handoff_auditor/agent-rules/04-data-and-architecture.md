# agent-rules/04-data-and-architecture.md

## Next.js naqshlari
- **App Router**, RSC default. `"use client"` faqat: state, brauzer API, event handler, animatsiya (topologiya, login, ⌘K, charts).
- Ma'lumot fetch — Server Component'da (`lib/data/*` → Prisma). Mutatsiya — **Server Action** yoki Route Handler (`app/api/*`).
- Kesh: RSC + `revalidatePath`/`revalidateTag`. Mijoz keshlash kerak bo'lsa TanStack Query.
- Route'lar: `02-ROUTES-AND-SCREENS.md` xaritasiga amal qil. Tanlangan tab — `?tab=` searchParam yoki client state.

## Prisma / DB
- Sxema `03-DATA-MODEL.md` entity'laridan. Enumlar (audit/task/finding status, role) DB enum sifatida.
- RLS siyosatlari multi-tenant izolyatsiya uchun (`own` scope DB darajasida).
- Migratsiyalar versiyalanadi. Seed `prisma/seed.ts` — `data.js` mock'idan realistik ma'lumot.
- Hisoblanadigan maydonlar (audit.findings/tasks aggregat) — query'da yoki materialized view.

## State
- Server state — RSC/Prisma. UI state — minimal client (`useState`): tab, drawer/modal, palette, tema.
- Rol/auth — **sessiyadan** (Auth.js), prototipdagi `tweaks.role` EMAS. Tweaks panel production'da yo'q.
- URL — haqiqat manbai navigatsiya uchun (prototipdagi `route` state o'rniga App Router).

## Komponentlar
- `data.js` → Prisma + seed + `lib/data`. `h(...)` prototip → toza `.tsx`.
- UI primitivlari — mavjud CSS klass ustiga tiplangan wrapper (`01-ui-and-styling.md`).
- Umumiy: `ApprovalFlow` (loyiha+finding), `CommandPalette` (⌘K), `TopologyGraph` (client, rAF force sim), chart primitivlari (Donut/Sparkline — SVG).
- Ikonka: `lucide-react`. Prototip `icons.jsx` (`I.Xxx`) → mos lucide ikonka jadvali tuz; mos kelmasa eng yaqinini tanla va izohla.

## AI (Ollama)
- `/api/ai` route — lokal Ollama proxy, **streaming** (`stream: true`), RBAC + audit-kontekst.
- System prompt'ga audit kontekstini qo'sh (kod, tashkilot, findinglar soni, vazifalar). Javob o'zbekcha, markdown.
- Har so'rov `AiAnalysisResult` ga (input/output/model/token/latency). Yopiq kontur — tashqi chiqish yo'q.

## Testlar va sifat
- `pnpm lint && pnpm typecheck && pnpm build` har bosqichda toza.
- E2E (Playwright) asosiy oqimlar: login, 3-bosqich tasdiqlash, vazifa workflow, AI so'rov.
- Birlik test: `lib/rbac.ts` (`can()`), KPI hisoblash, approval holat mashinasi.

## Performance
- RSC bilan server'da render; client bundle kichik. Topologiya/charts — dynamic import (`ssr: false` kerak bo'lsa).
- Jadval/ro'yxat — server pagination. Rasm yo'q (data + ikonka UI), shuning uchun yengil.
