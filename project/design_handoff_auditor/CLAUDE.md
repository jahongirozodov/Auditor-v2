# CLAUDE.md — Auditor (Next.js)

> Bu fayl Claude Code uchun **doimiy ko'rsatma**. Har sessiyada avtomatik o'qiladi. Ishni boshlashdan oldin `README.md` va `01`–`04` hujjatlarni o'qing.

## Loyiha haqida

**Auditor** — davlat axborot xavfsizligi auditini boshqarish platformasi (SOC uslubidagi ichki tizim). Yopiq tarmoqda ishlaydi (internetsiz / air-gapped), lokal Ollama AI bilan. Til: **O'zbek (lotin)**. Bu repo — `design_handoff_auditor/` dagi hi-fi HTML dizaynni **Next.js'da production'ga qayta qurish**.

## Texnologiya stacki (majburiy)

- **Next.js 14+ App Router** + **TypeScript** (strict).
- **React Server Components** default; `"use client"` faqat kerak bo'lganda (interaktiv, brauzer API, state).
- **Prisma + PostgreSQL** (Row Level Security bilan multi-tenant izolyatsiya).
- **Auth.js (NextAuth)** — domen hisobi (AD/LDAP) + domen sertifikati; parol **Argon2id**; TOTP 2FA.
- **CSS:** `design-source/` dagi token + komponent CSS qatlamini ishlat (`globals.css` orqali import). Tailwind ixtiyoriy, lekin tokenlar ustiga.
- **next/font** — Plus Jakarta Sans, Manrope, JetBrains Mono.
- **lucide-react** ikonkalar (dizayndagi maxsus to'plamga eng yaqin).
- AI: **lokal Ollama** proxy (`/api/ai`), hech qachon tashqi LLM emas.

## Oltin qoidalar

1. **Dizaynga sodiq qol.** `design-source/` — haqiqat manbai. Ranglar, spacing, tipografiya, radius — `01-DESIGN-TOKENS.md` dagi tokenlardan foydalan; qiymat o'ylab topma. Token nomi ro'yxatda bo'lmasa — qo'shma, mavjudini ishlat.
2. **Hech qachon HTML/JSX prototipni to'g'ridan-to'g'ri ko'chirma.** U `React.createElement` (`h(...)`) bilan, CDN React + Babel uchun yozilgan. Uni **toza `.tsx` JSX komponentga** aylantir.
3. **O'zbek (lotin) UI.** Barcha foydalanuvchi matni o'zbekcha, **sentence case**, emoji yo'q, undov belgisi yo'q. Apostrof glyphlari to'g'ri: `o'`, `g'`, `'`. UPPERCASE faqat kichik meta/stat label.
4. **Xavfsizlik birinchi.** RBAC'ni **backend'da** majburiy tekshir (server action / route handler + RLS), UI gate yetarli emas. Audit jurnali **o'zgarmas** (append-only). Sirlar `.env` da, hech qachon commit qilinmaydi.
5. **Light + Dark.** `data-theme` (default `dark`). Faqat semantik aliaslar orqali rangla — ikkalasi avtomatik ishlasin.
6. **Reduced motion.** Har animatsiya `@media (prefers-reduced-motion: no-preference)` bilan gate qilinadi.
7. **Server-first.** Ma'lumotni Server Component'da fetch qil; mutatsiya — Server Action. Mijoz state'ni minimal saqla.
8. **Kichik, fokuslangan commitlar.** Har biri bir ekran yoki bir komponent. Lint + typecheck o'tishi shart.

## Komponent → fayl moslamasi

Prototip globallari (`window.Xxx`) → toza komponentlar:
- `chrome.jsx`: Sidebar, Topbar, PageHeader → `components/chrome/*`
- UI primitivlari (Button, Tag, Sev, Stat, Panel, Card, Avatar, Tabs, Input, Field, Drawer, Donut, Sparkline) → `components/ui/*`
- `components-approval.jsx` → `components/approval/ApprovalFlow.tsx`
- `components-search.jsx` → `components/search/CommandPalette.tsx`
- `screens-*.jsx` → mos `app/.../page.tsx` (+ ajratilgan client komponentlar)
- `data.js` → `prisma/schema.prisma` + seed (`prisma/seed.ts`) + `lib/data/*`
- `icons.jsx` → `lucide-react` (har `I.Xxx` ni mos ikonkaga moslash jadvali yarat)

## Buyruqlar (loyiha sozlangach)

```bash
pnpm dev            # rivojlantirish serveri
pnpm build          # production build (deploydan oldin o'tishi shart)
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm prisma migrate dev
pnpm prisma db seed
pnpm test           # birlik testlar (kerak bo'lsa)
```

> Har o'zgarishdan keyin `pnpm lint && pnpm typecheck` ni ishga tushir. Build buzilsa — tuzatmaguningcha davom etma.

## Maxsus tartib-qoidalar

- **A11y:** semantik HTML, fokus halqalari (`--brand-ring`), klaviatura nav (⌘K, drawer/modal Esc), kontrast AA.
- **Tabular raqamlar** — `--font-mono`, count-up faqat birinchi paint.
- **Sana** `YYYY-MM-DD`; nisbiy vaqt o'zbekcha ("12 daqiqa oldin").
- **Audit kodi** `AUD-YYYY-NNN`, vazifa `T-NNN`, finding `F-YYYY-NNNN`.
- **AI** har doim Ollama proxy orqali; system prompt'ga audit kontekstini qo'sh; natijani `AiAnalysisResult` ga yoz.
- **Tweaks panel** (prototipdagi rol/tema almashtirgich) — **production'ga ko'chirilmaydi**; rol sessiyadan keladi.

## Build tartibi
`BUILD-ORDER.md` ga qarang — bosqichma-bosqich reja (setup → tokenlar → shell → auth → ekranlar → integratsiyalar).

## Nimalarni so'rash kerak (taxmin qilma)
- Ma'lumotlar bazasi ulanishi / hosting muhiti (air-gapped?).
- AD/LDAP yoki sertifikat autentifikatsiya tafsilotlari.
- Ollama endpoint va model versiyasi.
- SMTP/bildirishnoma sozlamalari.
- Mavjud dizayn-tizim kutubxonasi bormi yoki shu CSS qatlamidan foydalanamizmi.
