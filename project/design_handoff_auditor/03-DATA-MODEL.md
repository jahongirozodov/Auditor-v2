# 03 — Data Model & RBAC

Prototip mock'i `design-source/auditor/data.js` da. Quyida entity'lar Prisma/Postgres sxemasi uchun moslangan. Davlat tizimi — **multi-tenant izolyatsiya RLS bilan**, parollar **Argon2id**, audit jurnali **o'zgarmas**.

## Entitylar

### User (foydalanuvchi)
`id, name, role (enum), title, dept, avatar(initsiallar), email, status (faol/nofaol), lastActive, passwordHash(argon2id), totpSecret`
Rollar: `departament | bolim | bosh | yetakchi | toifa1` (pastga qarang).

### Role (5 ta, o'zgarmas tizim rollari)
| id | name | order |
|---|---|---|
| `departament` | Departament rahbari | 1 (eng yuqori) |
| `bolim` | Bo‘lim boshlig‘i | 2 |
| `bosh` | Bosh mutaxassis | 3 |
| `yetakchi` | Yetakchi mutaxassis | 4 |
| `toifa1` | Birinchi toifali mutaxassis | 5 |
Custom rollar — `system_settings.custom_roles` (JSONB). Ruxsat tekshiruvi: avval custom_roles, so'ng standart matritsa.

### Organization (tashkilot — audit obyekti)
`id, name, stir(9 raqam, unique), sector, region, address, riskLevel (high/medium/low), head(mas'ul), since, contacts[] ({name,role,email,phone}), devices[] ({name,kind,vendor,ip,crit})`

### Audit
`id/code (AUD-YYYY-NNN), title, orgId(FK), type (Kompleks/Texnik/Penetration test/Maxsus), status (enum), stage (1..10), startDate, endDate, progress(0-100), leaderId(FK User), members(FK[]), pinned`
Hisoblanadigan: `findings {critical,high,medium,low}`, `tasks {total,done,in_progress,blocked,new}`, `lastSync`.
**Status enum:** `planning(Rejalashtirilgan) · group_forming(Guruh shakllanmoqda) · in_progress(Jarayonda) · review(Tekshiruvda) · returned(Qaytarilgan) · approved(Tasdiqlangan)` (+ workflow stage 1..10).

### AuditWorkflow (10 bosqich, referens)
1 Audit yaratish (bo'lim boshlig'i) · 2 Guruh shakllantirish · 3 Loyiha ishlab chiqish (group_lead) · 4 Loyiha tasdiqlash (3-bosqich) · 5 Vazifa taqsimlash · 6 Ma'lumot yig'ish (EXE agent/token) · 7 Tahlil (config/scanner/traffic/topology) · 8 Findinglarni tasdiqlash (3-bosqich) · 9 Hisobot · 10 Yakunlash. *(aniq matn `data.js` WORKFLOW da)*

### Task (vazifa)
`id (T-NNN), auditId(FK), title, type (Konfiguratsiya/Tizim audit/...), priority (Yuqori/O‘rta/Past), status, due, assigneeId(FK), kpi(points), files(count)`
**Status enum:** `new(Yangi) · assigned(Biriktirilgan) · in_progress(Jarayonda) · review(Tekshiruvda) · returned · blocked · done(Bajarilgan)`.

### Finding (topilma)
`id (F-YYYY-NNNN), auditId(FK), taskId(FK), title, severity (critical/high/medium/low), cvss (0-10), status (approved/review/returned), reportedBy(FK), date, asset, type, cwe (CWE-NNN), description, evidence(count)`
**Tasdiqlash:** 3-bosqichli (group_lead → head → dept) — `04` ga qarang.

### KpiRule (KPI ball qoidalari — sozlanadigan)
| Hodisa | Ball |
|---|---|
| Auditda ishtirok etish | +5 |
| Audit guruhi rahbari sifatida | +15 |
| Audit loyihasini ishlab chiqish | +15 |
| Vazifalarni to‘g‘ri taqsimlash | +10 |
| Auditor sifatida qatnashish | +10 |
| Har bir bajarilgan vazifa | +5 |
| Vazifani muddatida bajarish | +5 |
| Vazifani kechiktirish | −5 |
| Tasdiqlangan zaiflik (har biri) | +3 |
| Critical zaiflik qo‘shimcha | +10 |
| High zaiflik qo‘shimcha | +7 |
| Medium zaiflik qo‘shimcha | +4 |
| Low zaiflik qo‘shimcha | +1 |
| Konfiguratsiya fayli tahlili | +5 |
| Skaner natijasini import va tahlil | +5 |
| Trafik tahlilini bajarish | +7 |
| Hisobotga texnik xulosa | +5 |
| Qayta ishlashga qaytarilgan zaiflik | −2 |
| Noto‘g‘ri kiritilgan zaiflik | −3 |

KPI = foydalanuvchining barcha hodisalari yig'indisi (davr bo'yicha). Sozlamalar → KPI qoidalari ekranida tahrirlanadi.

### AuditToken (EXE agent uchun)
`id(token), auditId(FK), userId(FK), device, hostname, os, agentVersion, expiresAt, status, lastSync`
Har audit uchun alohida; xodim **faqat o'ziga biriktirilgan vazifalarni** ko'radi.

### AuditLog (o'zgarmas jurnal)
`time, userId, action (masalan finding.create, ai.prompt, login, token.issue), entity, ip, device, level (info/warn/danger)`. Faqat append; saqlash muddati Sozlamalarda (default 7 yil).

### AiAnalysisResult
`id, auditId, userId, input, output, model, tokens, latency, createdAt`. Yopiq kontur rejimida saqlanadi.

### Topology (AUD bo'yicha)
`nodes[] {id, label, ip, kind (cloud/firewall/ips/vpn/switch/server/web/db/wifi/endpoint), segment, sev, findings(count)}`, `edges[] {s, t, flag?(shubhali oqim)}`. PCAP/skaner aktivlar grafidan quriladi. → `04`.

### Report
`id, auditId, type, status, date, format (DOCX/PDF), sections[]`. AI executive summary + remediation bo'limlarini generatsiya qiladi.

---

## RBAC — ruxsatlar matritsasi

Qiymatlar: **full** (To‘liq) · **read** (Ko‘rish) · **own** (Faqat o‘ziniki) · **no** (Yo‘q). Ustunlar: d=departament, b=bo‘lim, bs=bosh, y=yetakchi, t1=toifa1.

| Modul | departament | bo‘lim | bosh | yetakchi | toifa1 |
|---|---|---|---|---|---|
| Foydalanuvchilar | full | read | no | no | no |
| Tashkilotlar kartasi | full | full | own | own | own |
| Auditlar | full | full | own | own | own |
| Audit guruhi (a'zo/duty) | full | full | own | no | no |
| Vazifalar taqsimlash | full | full | own | no | no |
| Findinglar | full | full | own | own | own |
| Findinglarni tasdiqlash | full | full | own(1-bosqich) | no | no |
| Tahlil (config/scanner/traffic/topology) | full | full | full | full | full |
| AI tahlil | full | full | full | full | full |
| KPI | full | full | read | read | read(own) |
| Hisobotlar | full | full | own | own | own |
| Audit tokenlar | full | full | own | no | no |
| Audit loglar | full | read | no | no | no |
| Rollar/ruxsatlar | full | no | no | no | no |
| Sozlamalar | full | full | no | no | no |

> Aniq qiymatlar `data.js` `PERM_MODULES` / `PERM_VALUES` da (`d/b/bs/y/t1` maydonlari). UI'da: `lib/rbac.ts` → `can(role, moduleId): "full"|"read"|"own"|"no"` va elementlarni shunga qarab ko'rsating/yashiring. Sidebar elementlari va sahifa amallari shu bilan gate qilinadi. **Backend'da ham majburiy tekshiring** (RLS + server-side guard) — UI gate yetarli emas.

## Duty (audit guruhi ichidagi rol — RBAC dan alohida)
- **Guruh rahbari (group_lead):** bir auditda yagona. Loyihani yuboradi, vazifalarni taqsimlaydi, topilmalarni 1-bosqich tasdiqlaydi.
- **Auditor:** guruhning oddiy a'zosi; vazifa bajaradi, finding kiritadi.
Bir foydalanuvchi turli auditlarda turli duty'ga ega bo'lishi mumkin.
