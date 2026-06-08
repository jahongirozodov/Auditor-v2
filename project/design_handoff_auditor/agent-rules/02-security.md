# agent-rules/02-security.md

> Bu davlat axborot xavfsizligi tizimi. Xavfsizlik — birinchi o'rinda, qulaylikdan ustun.

## Autentifikatsiya
- Domen hisobi (AD/LDAP) + domen sertifikati (AD) bilan kirish. Auth.js.
- Parol: **Argon2id** (m=65536, t=3, p=4). Minimal 12 belgi, tarix (oxirgi 5), muddat 90 kun.
- **TOTP 2FA** (sozlamada majburiy qilinadi). Failed-login lockout (5 urinish → 15 daqiqa). Yangi IP/qurilmadan kirishda ogohlantirish.
- Sessiya muddati 8 soat ("Bu qurilmani 8 soatga eslab qol").

## Avtorizatsiya (RBAC)
- 5 rol (`03-DATA-MODEL.md`). `lib/rbac.ts` → `can(role, moduleId)`.
- **UI gate yetarli EMAS.** Har server action / route handler boshida ruxsatni qayta tekshir.
- **PostgreSQL RLS** — multi-tenant izolyatsiya DB darajasida (`own` scope shu orqali).
- Duty (group_lead/auditor) — RBAC'dan alohida, audit ichidagi rol; tasdiqlash/biriktirish huquqini belgilaydi.

## Audit jurnali (immutable)
- Har muhim amal `AuditLog` ga append: `login, finding.create, finding.approve, finding.return, task.assign, ai.prompt, token.issue, report.export, ...`. Vaqt, foydalanuvchi, entity, IP, qurilma, natija.
- O'chirish/tahrir YO'Q. Saqlash muddati default 7 yil.

## Yopiq kontur (air-gapped)
- `CLOSED_NETWORK=true` da tashqi tarmoq chaqiruvlari bloklanadi.
- AI faqat **lokal Ollama** (`/api/ai` proxy). Hech qachon tashqi LLM / bulut servisi emas.
- Fontlar/asoslarni self-host qilish imkoniyatini qoldir (Google Fonts CDN o'rniga).

## Ma'lumot bilan ishlash
- Sirlar faqat `.env.local` (`.env.example` namuna). Hech qachon commit qilinmaydi, logga yozilmaydi.
- Server-only ma'lumot client'ga oqib chiqmasin (RSC chegaralariga e'tibor).
- Input validatsiya (zod) har server action'da. SQL — faqat Prisma (parametrlangan).
- Fayl yuklash (config/scan/pcap): turi/hajm tekshiruvi, sandbox parsing.

## Tahdidlarga e'tibor
- Tizim findinglarni saqlaydi (SQLi, RCE va h.k.) — ularni **ma'lumot sifatida** ko'rsat, hech qachon ishlatma/eval qilma.
- AI javoblarini sanitize qil (markdown render xavfsiz, `dangerouslySetInnerHTML` faqat escape qilingan + cheklangan markdown'da).
