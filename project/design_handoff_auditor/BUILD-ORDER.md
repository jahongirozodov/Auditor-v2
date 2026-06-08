# BUILD-ORDER — bosqichma-bosqich reja

Auditor'ni Next.js'da qurish tartibi. Har bosqich oxirida `pnpm lint && pnpm typecheck && pnpm build` o'tishi shart. Har bosqich — alohida commit(lar).

## Bosqich 0 — Loyiha skeleti
- [ ] `create-next-app` (App Router, TS, ESLint). `pnpm` ishlat.
- [ ] Papka tuzilishi (`README.md` dagi daraxt): `app/`, `components/{ui,chrome,approval,search,topology}`, `lib/`, `styles/`, `prisma/`.
- [ ] `design-source/tokens/*.css`, `app.css`, `kit-extra.css`, `wow.css` ni `styles/` ga ko'chir. `globals.css` da import zanjirini sozla (`README.md`).
- [ ] `next/font` bilan 3 oilani ulash; `<html data-theme="dark">` `app/layout.tsx` da.
- [ ] `ThemeProvider` (client) — `data-theme` + `localStorage`, `.ds-no-transition` almashtirishda.
- **Tekshir:** bo'sh sahifa to'g'ri font/rang bilan, dark/light almashadi.

## Bosqich 1 — Ma'lumotlar qatlami
- [ ] `prisma/schema.prisma` — `03-DATA-MODEL.md` entity'lari (User, Role, Organization, Audit, Task, Finding, KpiRule, AuditToken, AuditLog, AiAnalysisResult, Report, Topology). Enumlar, FK, indekslar.
- [ ] RLS siyosatlari (multi-tenant izolyatsiya).
- [ ] `prisma/seed.ts` — `data.js` dagi mock'dan seed (USERS, ROLES, ORGS, AUDITS, TASKS, FINDINGS, KPI_RULES, ...).
- [ ] `lib/data/*` — server-side data access funksiyalari.
- [ ] `lib/rbac.ts` — `can(role, moduleId): "full"|"read"|"own"|"no"` (PERM_MODULES matritsasi).
- **Tekshir:** `prisma studio` da seed ko'rinadi.

## Bosqich 2 — App shell (chrome)
- [ ] `components/ui/*` — Button, Tag, Sev, Stat, Panel, Card, Avatar, Tabs, Input/Field, Drawer, Modal, Toast(provider), Donut, Sparkline. Har biri mavjud CSS klassiga ingichka wrapper.
- [ ] `components/chrome/Sidebar.tsx` (guruhlangan nav, rolga qarab filtr), `Topbar.tsx` (⌘K, tema, bell, user menu), `PageHeader.tsx`.
- [ ] `app/(app)/layout.tsx` — shell + auth guard.
- **Tekshir:** shell light/dark, sidebar collapse, responsive.

## Bosqich 3 — Auth + login
- [ ] Auth.js — domen hisobi (AD/LDAP) + sertifikat; Argon2id; TOTP.
- [ ] `app/(auth)/login/page.tsx` — **WOW login** (`02` ekran tafsiloti, `kit-extra.css` `.login__*`). Animatsiyalar reduced-motion bilan.
- [ ] Sessiya → rol; `(app)` guard.
- **Tekshir:** login → dashboard; noto'g'ri urinish audit logga yoziladi.

## Bosqich 4 — Asosiy ekranlar
Tartib (qiymat bo'yicha): Dashboard → Tashkilotlar (+detal) → Auditlar (+detal, tablar) → Mening vazifalarim → Vazifa detali → Findinglar (+drawer). Har biri `02-ROUTES-AND-SCREENS.md` bo'yicha.
- **Tekshir:** har ekran pixel-fidelity, ma'lumot Prisma'dan, RBAC gate.

## Bosqich 5 — Asosiy oqimlar
- [ ] `ApprovalFlow` (3-bosqich) — loyiha + finding (`04 §1`). Backend: `approval_events` append, bildirishnoma, RBAC.
- [ ] Vazifa workflow + taqsimlash (`04 §2`).
- **Tekshir:** tasdiqlash/qaytarish holatni o'zgartiradi va tarixga yozadi.

## Bosqich 6 — Tahlil va AI
- [ ] `/api/ai` — Ollama proxy (streaming) (`04 §3`).
- [ ] AI ekrani (chat + hisobot quruvchi, markdown, typing, presetlar).
- [ ] Tahlil quvuri (config/scanner/traffic) — upload → normalizatsiya → AI → finding (`04 §5`).
- [ ] **Tarmoq topologiyasi** — client force graf (`04 §6`).
- **Tekshir:** AI real javob (lokal Ollama), topologiya drag/zoom/jonli.

## Bosqich 7 — TIZIM + qo'shimcha
- [ ] KPI, Hisobotlar (DOCX/PDF), Audit tokenlar, Foydalanuvchilar, Rollar/ruxsatlar, Audit loglar, EXE agent, Sozlamalar (6 bo'lim), Profil.
- [ ] ⌘K Command palette (global) (`04 §7`).
- [ ] Bildirishnomalar (bell + SMTP), toast, confirm dialog.
- **Tekshir:** to'liq navigatsiya, barcha ekranlar ishlaydi.

## Bosqich 8 — Sayqal
- [ ] A11y audit (klaviatura, fokus, kontrast, ARIA).
- [ ] Reduced-motion, print/PDF.
- [ ] Performance (RSC, kesh, `revalidatePath`).
- [ ] E2E asosiy oqimlar (login, approval, task, AI).
- **Tekshir:** `pnpm build` toza, Lighthouse yaxshi.

> Har bosqichda noaniqlik bo'lsa — `01`–`04` hujjatlarni qayta o'qi yoki foydalanuvchidan so'ra. Taxmin qilib davom etma.
