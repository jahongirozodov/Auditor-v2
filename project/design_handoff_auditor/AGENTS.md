# AGENTS.md

> Tool-agnostik agent konvensiyalari (Claude Code, Cursor, Codex, Copilot Workspace va h.k.). Claude Code uchun asosiy fayl — `CLAUDE.md`; bu fayl uni takrorlaydi va kengaytiradi.

## Loyiha bir qatorda
Auditor — davlat IS-audit platformasi, **Next.js 14 App Router + TypeScript + Prisma/Postgres**, yopiq tarmoq, lokal Ollama AI, O'zbek (lotin) UI, dark-first. `design_handoff_auditor/` dagi hi-fi dizaynni qayta quramiz.

## Avval o'qi
1. `CLAUDE.md` — operatsion qoidalar
2. `README.md` — arxitektura + setup
3. `01-DESIGN-TOKENS.md` · `02-ROUTES-AND-SCREENS.md` · `03-DATA-MODEL.md` · `04-FLOWS-AND-INTEGRATIONS.md`
4. `BUILD-ORDER.md` — bosqichma-bosqich
5. `agent-rules/` — fokuslangan qoidalar (UI, xavfsizlik, i18n, ma'lumot)

## Qattiq cheklovlar (buzma)
- **Dizayn tokenlaridan tashqarida rang/spacing o'ylab topma.** `01` dagi `var(--*)` ishlat.
- **Prototip kodini ko'chirma** — `h(...)` ni toza `.tsx` JSX ga aylantir.
- **UI matni — O'zbek (lotin), sentence case, emoji yo'q.**
- **RBAC backend'da majburiy** + RLS. Audit log o'zgarmas.
- **AI faqat lokal Ollama** (`/api/ai`), tashqi LLM yo'q.
- **Sirlar `.env` da** (`.env.example` ga qarang), commit qilinmaydi.

## Ishlash uslubi
- Kichik fokuslangan o'zgarishlar; har biridan keyin `pnpm lint && pnpm typecheck`.
- Build buzilsa to'xta va tuzat.
- Noaniqlikda taxmin qilma — hujjatni qayta o'qi yoki so'ra.
- Yangi pattern kiritsang, mavjud konvensiyaga mos qil.

## Done ta'rifi (har ekran/komponent)
- [ ] Dizaynga pixel-fidelity (light + dark)
- [ ] Faqat semantik tokenlar
- [ ] O'zbek matni, to'g'ri apostroflar, sentence case
- [ ] RBAC gate (UI) + backend tekshiruv
- [ ] Reduced-motion gated animatsiya
- [ ] A11y (klaviatura, fokus, ARIA, kontrast)
- [ ] `lint` + `typecheck` + `build` toza
