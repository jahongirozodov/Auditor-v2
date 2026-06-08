# 02 — Routes & Screens

Prototip URL'siz, `route` state bilan ishlaydi. Quyida har bir `route` qiymati → tavsiya etilgan **App Router** yo'liga moslangan, so'ng har bir ekran tafsiloti.

## Route xaritasi

| Prototip `route` | App Router yo'li | Ekran komponenti | Roli (ko'rish) |
|---|---|---|---|
| `dashboard` | `/dashboard` | DashboardScreen | barchasi |
| `orgs` | `/organizations` | OrgsScreen | barchasi |
| `org` | `/organizations/[id]` | OrgDetailScreen | barchasi |
| `audits` | `/audits` | AuditsListScreen | barchasi |
| `audit` | `/audits/[id]` | AuditDetailScreen | a'zolar |
| `tasks` | `/tasks` | MyTasksScreen | barchasi |
| `assign` | `/tasks/assign` | AssignScreen | departament/bo'lim/bosh |
| `task` | `/tasks/[id]` | TaskDetailScreen | a'zolar |
| `findings` | `/findings` | FindingsScreen | barchasi |
| `config` | `/analysis/config` | ScannerScreen (tab=config) | tahlilchi+ |
| `scanner` | `/analysis/scanner` | ScannerScreen (tab=scanner) | tahlilchi+ |
| `topology` | `/analysis/topology` | TopologyScreen | tahlilchi+ |
| `traffic` | `/analysis/traffic` | ScannerScreen (tab=traffic) | tahlilchi+ |
| `ai` | `/ai` | AIScreen | barchasi |
| `kpi` | `/kpi` | KpiScreen | barchasi |
| `reports` | `/reports` | ReportsScreen | barchasi |
| `tokens` | `/tokens` | TokensScreen | bosh+ |
| `users` | `/users` | UsersScreen | bo'lim+ |
| `permissions` | `/permissions` | PermissionsScreen | departament |
| `logs` | `/logs` | LogsScreen | bo'lim+ |
| `agent` | `/agent` | AgentScreen | barchasi |
| `settings` | `/settings` | SettingsScreen | departament/bo'lim |
| `profile` | `/profile` | ProfileScreen | barchasi |

**App shell:** har bir `(app)` sahifa — `Sidebar` (chap, 248px, guruhlangan nav: ASOSIY / TAHLIL / TIZIM) + `Topbar` (68px: brand, ⌘K qidiruv, tema, bildirishnomalar, foydalanuvchi menyu) + scroll qiluvchi `main`. Sidebar elementlari rolga qarab filtrlanadi.

---

## Navigatsiya (Sidebar)

**ASOSIY:** Boshqaruv paneli · Tashkilotlar · Auditlar (count) · Mening vazifalarim (count) · Vazifalarni taqsimlash · Findinglar (count)
**TAHLIL:** Konfiguratsiya · Skaner importi · Tarmoq topologiyasi · Trafik tahlili · AI tahlil & hisobot · KPI · Hisobotlar
**TIZIM:** Audit tokenlar · Foydalanuvchilar · Rollar va ruxsatlar · Audit loglar · EXE agent · Sozlamalar
Sidebar footer: "Yopiq kontur · Lokal Ollama: qwen2.5:14b · sync OK".

---

## Ekranlar

### Login (`/login`) — WOW
2 ustun. **Chap (brand panel, ≤960px da yashirin):** animatsiyali atmosfera (drifting bloblar, radar sweep, panning grid, scan beam, ko'tariluvchi zarralar), qalqonda pulsing radar halqalar, brand, "YOPIQ KONTUR · INTERNETSIZ MUHIT" chip, hero sarlavha, 3 ta xususiyat (Audit token va EXE agent / Ollama lokal AI tahlil / KPI hisoblash), staggered kirish. **O'ng (forma):** "Tizimga kirish", login (domen hisobi) + parol (ko'rsatish toggle) + "Parolni unutdingizmi?", "Bu qurilmani 8 soatga eslab qol" checkbox, **Kirish** (primary, sheen animatsiya), "yoki", "Domen sertifikati bilan kirish (AD)" (secondary), demo eslatma. Oqim: **boot → login → app**.

### Dashboard (`/dashboard`)
Hero "xavfsizlik holati markazi" banneri: katta KPI raqam (masalan `72/100`, count-up), "LIVE" pulsing nuqta, tavsif. Stat grid (4→2→1): faol auditlar, critical findinglar, bartaraf %, o'rtacha CVSS. Quyida: so'nggi auditlar paneli, top findinglar (severity bo'yicha), vazifa progressi, KPI mini-reyting, (ixtiyoriy) AI insight kartasi. Raqamlar count-up, kartalar staggered kirish.

### Tashkilotlar (`/organizations`)
Stat tiles (tashkilotlar soni, jami auditlar, yuqori xavfli, qurilmalar). Jadval: tashkilot (logo+nom+kontakt), STIR, soha, hudud, xavf darajasi (tag), qurilmalar soni, auditlar soni. Qatorni bosish → `/organizations/[id]`.

### Tashkilot tafsiloti (`/organizations/[id]`)
Breadcrumb + logo + STIR + soha + hudud + xavf tag. 4 stat (jami auditlar, faol auditlar, qurilmalar, topilmalar). Chap: tashkilot ma'lumotlari (grid), **tashkilot auditlari** jadvali (kod/audit/turi/holat/progress/critical — qatorni bosish → audit), **qurilma inventari** jadvali. O'ng: **topilmalar profili** (jami + stacked severity bar + qatorma-qator), **kontaktlar** ro'yxati.

### Auditlar ro'yxati (`/audits`)
Filtrlar + "Yangi audit". Jadval: kod, nom, tashkilot, turi, holat (workflow tag), progress bar, guruh (avatar stack), findinglar (severity badge'lar), muddat. Qatorni bosish → audit tafsiloti.

### Audit tafsiloti (`/audits/[id]`)
Sarlavha (kod, nom, holat, tashkilot). **Tablar:** Umumiy · **Audit guruhi** · **Audit loyihasi** (3-bosqichli tasdiqlash) · Vazifalar · Findinglar · Fayllar · Tokenlar · AI · KPI.
- *Umumiy:* tavsif, metrikalar, doira, metodologiya, jadval.
- *Audit guruhi:* a'zolar roster (avatar, rol, duty badge: **Guruh rahbari** / Auditor), har a'zoning vazifa+finding soni; promote (★)/remove (gated); eligible-users qo'shish; duty izohi.
- *Audit loyihasi:* `ApprovalFlow` (group_lead → head → dept), progress strip, holat chip, o'zgarmas timeline, rolga mos Tasdiqlash/Qaytarish/Qayta yuborish. Yon: doira/metodologiya, vositalar.
- *Findinglar:* shu auditga tegishli findinglar jadvali → finding drawer.

### Mening vazifalarim (`/tasks`)
Holat bo'yicha guruhlangan vazifa kartalari/jadval (Yangi/Jarayonda/Tekshiruvda/Bajarilgan). Qatorni bosish → vazifa tafsiloti. "Yangi vazifa" modal.

### Vazifalarni taqsimlash (`/tasks/assign`) — group_lead
Audit selektori. Jadval: ID, vazifa, turi, ustuvorlik, **mas'ul (inline biriktirish dropdown)**, holat, muddat. Yon: **ish yuki taqsimoti** (har a'zo uchun vazifa soni bar; rahbar belgilangan), izoh. Gated: departament/bo'lim/bosh.

### Vazifa tafsiloti (`/tasks/[id]`)
Sarlavha (ID, holat tag, ustuvorlik, audit kodi linki). **Status workflow strip** (Yangi→Biriktirilgan→Jarayonda→Tekshiruvda→Bajarilgan) + holatga mos amallar (Ishni boshlash/Tekshiruvga yuborish/Ma'qullash/Qaytarish/Qayta boshlash) — holatni real o'zgartiradi va tarixga yozadi. Chap: tavsif (turi/muddat/KPI), **Topilmalar** (+"Topilma qo'shish" modal, linked findings → drawer), fayllar va dalillar. O'ng: mas'ul + qayta biriktirish dropdown, tafsilotlar, holatlar tarixi timeline.

### Findinglar (`/findings`)
Severity/holat/audit bo'yicha filtr. Jadval: severity badge, sarlavha, ID, asset, CVSS, CWE, audit, holat, mas'ul. Qatorni bosish → **finding drawer**: tafsilot, **3-bosqichli tasdiqlash** (`ApprovalFlow`, kind=finding), CVSS/CWE/asset, tavsif, dalillar, remediation (AI), tarix.

### Tahlil: Konfiguratsiya / Skaner / Trafik (`/analysis/*`)
Bitta `ScannerScreen`, tab orqali (`initialTab`). Har biri o'z sarlavha+breadcrumb'i. Chap: drag-drop yuklash zonasi + tahlil qilingan obyektlar ro'yxati (qurilma/scan natija + severity hisob), kod/log preview (`.code-block`, satr raqami, highlight). O'ng: **AI tahlil natijasi** kartasi (severity bo'yicha topilmalar + "N ta finding yaratish"/"Qayta tahlil"). Skaner: Nessus/Nmap/OpenVAS/Burp/ZAP normalizatsiya. Konfig: Cisco/Linux/Nginx/Apache/MikroTik. Trafik: PCAP/Wireshark/Suricata/Zeek.

### Tarmoq topologiyasi (`/analysis/topology`)
**Force-directed graf** (o'z simulyatsiyasi, CDN'siz). Tugunlar — aktivlar (firewall/switch/server/web/db/vpn/ips/wifi/endpoint/cloud), severity bo'yicha rang, finding badge. Edge'lar — bog'lanishlar; **shubhali oqim** edge'lari uzuq-qizil. **Jonli:** oqim paketlari edge bo'ylab, critical/high tugunlarda pulsing alert halqa. **Interaksiya:** tugunni sudrash, scroll-zoom (kursorga), pan, zoom in/out/fit/reset tugmalari, zoom % yorlig'i, severity filtr chiplari, shubhali oqim toggle. Yon: tugun inspektori (IP/segment/severity/findinglar) + bog'liq findinglar + izoh. → `04` da data sxemasi.

### AI tahlil & hisobot (`/ai`)
Chat + hisobot quruvchi. **Chap (chat):** xabarlar (foydalanuvchi/AI), AI bubble markdown bilan, **typing indikator**, preset chiplar (Executive summary/Remediation plan/...), textarea (Enter=yuborish, Shift+Enter=yangi qator), model selektori. **Real ishlaydi** — `04` dagi Ollama integratsiyasiga qarang. **O'ng:** hisobot quruvchi (bo'limlar checklist, AI/Majburiy tag, DOCX yuklash), prompt shablonlari. Sarlavhada "Ollama lokal · qwen2.5:14b · AUD-kod" + pulsing nuqta.

### KPI (`/kpi`)
Davr selektori. Reyting/podium (top mutaxassislar, ballar), KPI qoidalari asosida hisoblangan ko'rsatkichlar, trend. → qoidalar `03` da.

### Hisobotlar (`/reports`)
Hisobotlar jadvali (audit, turi, holat, sana, format), yaratish/yuklash. DOCX/PDF eksport.

### Audit tokenlar (`/tokens`)
Har audit uchun alohida token jadvali (token, audit, mas'ul, amal qilish muddati, holat). Yaratish/bekor qilish. EXE agent shu tokenni ishlatadi.

### Foydalanuvchilar (`/users`)
Foydalanuvchilar jadvali (ism, rol, bo'lim, holat, oxirgi faollik). Qo'shish/tahrir/o'chirish.

### Rollar va ruxsatlar (`/permissions`)
**Ruxsatlar matritsasi** — modul × rol grid (✓/✗). → `03` da to'liq RBAC.

### Audit loglar (`/logs`)
O'zgarmas audit jurnali jadvali (vaqt, foydalanuvchi, amal, modul, IP, natija). Filtr + qidiruv.

### EXE agent (`/agent`)
Desktop agent demo: token bilan ulanish, sinxronizatsiya holati, yig'ilgan ma'lumotlar, "faqat o'ziga biriktirilgan vazifalar" tamoyili.

### Sozlamalar (`/settings`)
Yon sub-nav (sticky): **Umumiy** (departament nomi, til, vaqt zonasi, audit kodi formati) · **Custom rollar** (system rollari + custom_roles JSONB) · **KPI qoidalari** (KpiRule jadvali, live tahrir, Reset/Saqlash) · **AI / Ollama** (URL, model, context/temperature, test ulanish, yopiq kontur toggle) · **Bildirishnomalar** (bell triggerlar + SMTP) · **Xavfsizlik & saqlash** (2FA, lockout, RLS, Argon2id parol siyosati, log saqlash muddati). Gated: departament/bo'lim.

### Profil (`/profile`)
Foydalanuvchi profili: ma'lumotlar, rol, faollik, sozlamalar.
