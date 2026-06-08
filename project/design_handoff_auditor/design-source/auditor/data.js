/* Mock data store for the Auditor prototype.
   Realistic enough for screenshots and basic interactions. */

window.AppData = (function () {

  // ---------- Users ----------
  const USERS = [
    { id: "u1",  name: "Akmal Yo'ldoshev",     role: "departament", title: "Departament rahbari",        avatar: "AY", dept: "Markaziy apparat" },
    { id: "u2",  name: "Dilshoda Rasulova",     role: "bolim",       title: "Bo‘lim boshlig‘i",            avatar: "DR", dept: "Audit bo‘limi" },
    { id: "u3",  name: "Bobur Mirzayev",        role: "bosh",        title: "Bosh mutaxassis",             avatar: "BM", dept: "Audit bo‘limi" },
    { id: "u4",  name: "Sevara Karimova",       role: "yetakchi",    title: "Yetakchi mutaxassis",         avatar: "SK", dept: "Audit bo‘limi" },
    { id: "u5",  name: "Otabek Jo‘rayev",       role: "yetakchi",    title: "Yetakchi mutaxassis",         avatar: "OJ", dept: "Audit bo‘limi" },
    { id: "u6",  name: "Madina Sodiqova",       role: "toifa1",      title: "Birinchi toifali mutaxassis", avatar: "MS", dept: "Audit bo‘limi" },
    { id: "u7",  name: "Jasur Tursunov",        role: "toifa1",      title: "Birinchi toifali mutaxassis", avatar: "JT", dept: "Audit bo‘limi" },
    { id: "u8",  name: "Nigora Ergasheva",      role: "bosh",        title: "Bosh mutaxassis",             avatar: "NE", dept: "Audit bo‘limi" },
    { id: "u9",  name: "Sherzod Hamidov",       role: "toifa1",      title: "Birinchi toifali mutaxassis", avatar: "SH", dept: "Audit bo‘limi" },
    { id: "u10", name: "Lola Aliyeva",          role: "yetakchi",    title: "Yetakchi mutaxassis",         avatar: "LA", dept: "Audit bo‘limi" },
  ];

  const ROLES = [
    { id: "departament", name: "Departament rahbari",        short: "Departament",       order: 1 },
    { id: "bolim",       name: "Bo‘lim boshlig‘i",            short: "Bo‘lim boshlig‘i",   order: 2 },
    { id: "bosh",        name: "Bosh mutaxassis",             short: "Bosh m-s",          order: 3 },
    { id: "yetakchi",    name: "Yetakchi mutaxassis",         short: "Yetakchi m-s",      order: 4 },
    { id: "toifa1",      name: "Birinchi toifali mutaxassis", short: "1-toifa m-s",       order: 5 },
  ];

  // ---------- Organizations ----------
  const ORGS = [
    { id: "o1", name: "Aloqa va kommunikatsiya vazirligi",   stir: "207100123", sector: "Davlat",   audits: 6, contact: "info@aloqa.gov.uz" },
    { id: "o2", name: "Soliq qo‘mitasi",                     stir: "201200456", sector: "Davlat",   audits: 4, contact: "audit@soliq.uz" },
    { id: "o3", name: "Markaziy bank",                       stir: "200100789", sector: "Davlat",   audits: 3, contact: "ciso@cbu.uz" },
    { id: "o4", name: "Davlat xizmatlari agentligi",         stir: "207300111", sector: "Davlat",   audits: 5, contact: "info@dxa.uz" },
    { id: "o5", name: "Energiya vazirligi",                  stir: "207400222", sector: "Davlat",   audits: 2, contact: "sec@energy.uz" },
    { id: "o6", name: "Toshkent shahar hokimligi",           stir: "207500333", sector: "Davlat",   audits: 3, contact: "it@tashkent.uz" },
  ];

  // ---------- Audits ----------
  const AUDITS = [
    {
      id: "AUD-2026-014", code: "AUD-2026-014",
      title: "Aloqa va kommunikatsiya vazirligi — yillik kompleks audit",
      org: "o1",
      type: "Kompleks audit",
      status: "in_progress",            // ←  shown as 'Jarayonda'
      stage: 7,                          // current workflow stage (1..10)
      startDate: "2026-04-12",
      endDate: "2026-05-31",
      progress: 64,
      leader: "u3",
      members: ["u3", "u4", "u6", "u7"],
      findings: { critical: 4, high: 9, medium: 14, low: 7 },
      tasks: { total: 38, done: 22, in_progress: 11, blocked: 2, new: 3 },
      lastSync: "12 daqiqa oldin",
      pinned: true,
    },
    {
      id: "AUD-2026-013", code: "AUD-2026-013",
      title: "Soliq qo‘mitasi — DBMS va loyiha auditi",
      org: "o2",
      type: "Texnik audit",
      status: "review",
      stage: 9,
      startDate: "2026-03-22",
      endDate: "2026-05-18",
      progress: 88,
      leader: "u4",
      members: ["u4", "u3", "u9"],
      findings: { critical: 2, high: 5, medium: 8, low: 4 },
      tasks: { total: 26, done: 24, in_progress: 1, blocked: 0, new: 1 },
      lastSync: "2 soat oldin",
    },
    {
      id: "AUD-2026-012", code: "AUD-2026-012",
      title: "Markaziy bank — mobil bank ilovasi penetration test",
      org: "o3",
      type: "Penetration test",
      status: "in_progress",
      stage: 7,
      startDate: "2026-05-01",
      endDate: "2026-06-12",
      progress: 42,
      leader: "u8",
      members: ["u8", "u5", "u6"],
      findings: { critical: 3, high: 7, medium: 11, low: 5 },
      tasks: { total: 22, done: 9, in_progress: 8, blocked: 1, new: 4 },
      lastSync: "31 daqiqa oldin",
    },
    {
      id: "AUD-2026-011", code: "AUD-2026-011",
      title: "Davlat xizmatlari agentligi — pre-prod muhit auditi",
      org: "o4",
      type: "Kompleks audit",
      status: "approved",
      stage: 10,
      startDate: "2026-02-15",
      endDate: "2026-04-30",
      progress: 100,
      leader: "u3",
      members: ["u3", "u4", "u7", "u10"],
      findings: { critical: 1, high: 4, medium: 12, low: 9 },
      tasks: { total: 31, done: 31, in_progress: 0, blocked: 0, new: 0 },
      lastSync: "1 hafta oldin",
    },
    {
      id: "AUD-2026-010", code: "AUD-2026-010",
      title: "Energiya vazirligi — OT/SCADA segmentatsiya auditi",
      org: "o5",
      type: "Maxsus audit",
      status: "planning",
      stage: 3,
      startDate: "2026-05-20",
      endDate: "2026-07-15",
      progress: 12,
      leader: "u10",
      members: ["u10", "u8", "u9"],
      findings: { critical: 0, high: 0, medium: 0, low: 0 },
      tasks: { total: 14, done: 1, in_progress: 0, blocked: 0, new: 13 },
      lastSync: "—",
    },
    {
      id: "AUD-2026-009", code: "AUD-2026-009",
      title: "Toshkent shahar hokimligi — public web portfolio auditi",
      org: "o6",
      type: "Web audit",
      status: "returned",
      stage: 9,
      startDate: "2026-03-01",
      endDate: "2026-04-15",
      progress: 76,
      leader: "u5",
      members: ["u5", "u6", "u9"],
      findings: { critical: 1, high: 3, medium: 6, low: 11 },
      tasks: { total: 18, done: 13, in_progress: 4, blocked: 1, new: 0 },
      lastSync: "3 kun oldin",
    },
  ];

  const STATUS_LABELS = {
    planning:     { label: "Rejalashtirilgan",         tag: "tag--ghost",   dot: "#94a3b8" },
    group_forming:{ label: "Guruh shakllanmoqda",      tag: "tag--ghost",   dot: "#94a3b8" },
    project_draft:{ label: "Loyiha ishlab chiqilmoqda", tag: "tag--info",    dot: "#0ea5e9" },
    project_pending:{ label: "Loyiha tasdiqlashda",    tag: "tag--warning", dot: "#f59e0b" },
    assigning:    { label: "Vazifalar taqsimlanmoqda", tag: "tag--info",    dot: "#0ea5e9" },
    in_progress:  { label: "Jarayonda",                tag: "tag--info",    dot: "#3b65f6" },
    review:       { label: "Tekshiruvda",              tag: "tag--warning", dot: "#f59e0b" },
    returned:     { label: "Qaytarilgan",              tag: "tag--danger",  dot: "#ef4444" },
    approved:     { label: "Tasdiqlangan",             tag: "tag--success", dot: "#10b981" },
    completed:    { label: "Yakunlangan",              tag: "tag--success", dot: "#10b981" },
    cancelled:    { label: "Bekor qilingan",           tag: "tag--ghost",   dot: "#64748b" },
  };

  const WORKFLOW = [
    { n: 1, key: "create",      title: "Audit yaratish",                    who: "Bo‘lim boshlig‘i", short: "Tashkilot tanlandi, audit kartasi yaratildi." },
    { n: 2, key: "group",       title: "Audit guruhini shakllantirish",     who: "Bo‘lim boshlig‘i", short: "Audit guruhi rahbari va auditorlar tanlandi." },
    { n: 3, key: "project",     title: "Audit loyihasini ishlab chiqish",   who: "Guruh rahbari",    short: "Maqsad, doira, bosqichlar, metodologiya tuzildi." },
    { n: 4, key: "assign",      title: "Vazifalarni taqsimlash",            who: "Guruh rahbari",    short: "38 ta vazifa 4 ta auditor o‘rtasida taqsimlandi." },
    { n: 5, key: "approve",     title: "Loyihani tasdiqlash",               who: "Bo‘lim boshlig‘i", short: "Audit loyihasi tasdiqlandi." },
    { n: 6, key: "token",       title: "EXE agent va token",                who: "Auditor",          short: "4 ta audit token chiqarildi, qurilmalarga bog‘landi." },
    { n: 7, key: "fieldwork",   title: "Joyida audit",                      who: "Auditor",          short: "22 vazifa bajarildi, 34 finding kiritildi.", current: true },
    { n: 8, key: "sync",        title: "Sinxronlash",                       who: "EXE agent",        short: "Oxirgi sinxronlash 12 daqiqa oldin (success)." },
    { n: 9, key: "review",      title: "Ko‘rib chiqish",                    who: "Guruh rahbari",    short: "Tasdiqlash va qaytarish hali yakunlanmagan." },
    { n: 10, key: "report",     title: "Tahlil va hisobot",                 who: "AI + Rahbar",      short: "AI xulosa va yakuniy hisobot kutilmoqda." },
  ];

  // ---------- Tasks ----------
  const TASKS = [
    { id: "T-114", auditId: "AUD-2026-014", title: "Firewall qoidalari va segmentatsiyani tahlil qilish",   type: "Konfiguratsiya", priority: "Yuqori",  status: "in_progress", due: "2026-05-22", assignee: "u6", findings: 3, files: 2, kpi: 5 },
    { id: "T-115", auditId: "AUD-2026-014", title: "Active Directory parol siyosatini tekshirish",          type: "Tizim audit",   priority: "Yuqori",  status: "in_progress", due: "2026-05-23", assignee: "u7", findings: 2, files: 1, kpi: 5 },
    { id: "T-116", auditId: "AUD-2026-014", title: "Nessus skaner natijalarini import qilish",              type: "Skaner",        priority: "O‘rta",   status: "done",        due: "2026-05-18", assignee: "u4", findings: 8, files: 4, kpi: 10 },
    { id: "T-117", auditId: "AUD-2026-014", title: "PCAP fayli — DNS tunneling tahlili",                    type: "Trafik",        priority: "Yuqori",  status: "review",      due: "2026-05-24", assignee: "u3", findings: 1, files: 1, kpi: 7 },
    { id: "T-118", auditId: "AUD-2026-014", title: "Wi-Fi controller konfiguratsiyasi auditi",              type: "Konfiguratsiya", priority: "O‘rta",  status: "new",         due: "2026-05-26", assignee: "u6", findings: 0, files: 0, kpi: 0 },
    { id: "T-119", auditId: "AUD-2026-014", title: "OpenVAS — internal subnet skanerlash",                  type: "Skaner",        priority: "Yuqori",  status: "in_progress", due: "2026-05-25", assignee: "u4", findings: 5, files: 1, kpi: 5 },
    { id: "T-120", auditId: "AUD-2026-014", title: "Backup va DR rejasi suhbati",                           type: "Hujjat",        priority: "O‘rta",   status: "in_progress", due: "2026-05-27", assignee: "u3", findings: 0, files: 1, kpi: 0 },
    { id: "T-121", auditId: "AUD-2026-014", title: "VPN gateway konfiguratsiyasi",                          type: "Konfiguratsiya", priority: "Yuqori", status: "blocked",     due: "2026-05-22", assignee: "u7", findings: 0, files: 0, kpi: 0 },
    { id: "T-122", auditId: "AUD-2026-014", title: "IDS/IPS log tahlili",                                   type: "Log",           priority: "O‘rta",   status: "done",        due: "2026-05-17", assignee: "u6", findings: 4, files: 1, kpi: 8 },
    { id: "T-123", auditId: "AUD-2026-014", title: "Web ilova OWASP ZAP skaneri",                           type: "Skaner",        priority: "Yuqori",  status: "review",      due: "2026-05-24", assignee: "u4", findings: 6, files: 2, kpi: 5 },
    { id: "T-124", auditId: "AUD-2026-014", title: "Hisobot bo‘limini tayyorlash (Sec-overview)",          type: "Hisobot",       priority: "Past",    status: "new",         due: "2026-05-28", assignee: "u3", findings: 0, files: 0, kpi: 0 },
    { id: "T-125", auditId: "AUD-2026-014", title: "Switch ACL ro‘yxatini tekshirish",                    type: "Konfiguratsiya", priority: "Past",    status: "in_progress", due: "2026-05-26", assignee: "u6", findings: 1, files: 1, kpi: 5 },
  ];

  const TASK_STATUS = {
    new:         { label: "Yangi",            color: "#94a3b8" },
    in_progress: { label: "Jarayonda",        color: "#3b65f6" },
    review:      { label: "Tekshiruvda",      color: "#f59e0b" },
    returned:    { label: "Qaytarilgan",      color: "#ef4444" },
    done:        { label: "Bajarilgan",       color: "#10b981" },
    blocked:     { label: "Blok",             color: "#ef4444" },
  };

  // ---------- Findings ----------
  const FINDINGS = [
    { id: "F-2026-0341", auditId: "AUD-2026-014", taskId: "T-114",
      title: "Internal segment 10.0.0.0/8 ga to‘liq ruxsat berilgan",
      severity: "critical", cvss: 9.1, status: "approved",
      reportedBy: "u6", date: "2026-05-18",
      asset: "FW-CORE-01",
      type: "Konfiguratsiya kamchiligi",
      cwe: "CWE-284",
      description: "Asosiy firewall qoidalarida 10.0.0.0/8 manzilidan barcha portlarga TCP+UDP ruxsat berilgan. Bu segmentatsiya prinsiplariga zid keladi.",
      evidence: 3,
      ai: true,
    },
    { id: "F-2026-0342", auditId: "AUD-2026-014", taskId: "T-115",
      title: "AD parol siyosati — minimum 6 belgi, history off",
      severity: "high", cvss: 7.4, status: "review",
      reportedBy: "u7", date: "2026-05-19",
      asset: "DC-01.gov.uz",
      type: "Tizim sozlamasi",
      cwe: "CWE-521",
      description: "Domen parol siyosati — minimum uzunlik 6 belgi, parol tarixi yoqilmagan, lockout = 0 (cheklov yo‘q). Brute force xavfi yuqori.",
      evidence: 2,
      ai: true,
    },
    { id: "F-2026-0343", auditId: "AUD-2026-014", taskId: "T-116",
      title: "Apache 2.4.41 — CVE-2023-25690 (mod_proxy SSRF)",
      severity: "critical", cvss: 9.8, status: "approved",
      reportedBy: "u4", date: "2026-05-15",
      asset: "web-prod-03",
      type: "CVE / patch",
      cwe: "CWE-444",
      description: "Apache HTTP Server 2.4.41 versiyasida mod_proxy modulida HTTP request smuggling zaifligi mavjud. Patch chiqarilgan: 2.4.56.",
      evidence: 4,
      ai: true,
    },
    { id: "F-2026-0344", auditId: "AUD-2026-014", taskId: "T-122",
      title: "Suricata IPS — 47 noma'lum imzo, oxirgi update 2025-12",
      severity: "high", cvss: 7.0, status: "approved",
      reportedBy: "u6", date: "2026-05-17",
      asset: "IPS-EDGE-01",
      type: "Operatsion kamchilik",
      cwe: "CWE-1053",
      description: "IDS/IPS qurilmasida imzolar oxirgi marta 2025-yil dekabrida yangilangan. Yangi C2 va exploitlar e'tibordan chetda.",
      evidence: 2,
      ai: true,
    },
    { id: "F-2026-0345", auditId: "AUD-2026-014", taskId: "T-117",
      title: "DNS tunneling — uzoq subdomain so‘rovlar (24 soatda 18,400)",
      severity: "high", cvss: 8.1, status: "review",
      reportedBy: "u3", date: "2026-05-20",
      asset: "10.10.42.16",
      type: "Trafik anomaliya",
      cwe: "CWE-200",
      description: "Bir endpoint 24 soat ichida 18,400 ta noyob, uzun (>50 belgi) subdomain so‘rovi yubordi. Klassik DNS tunneling/exfiltration belgisi.",
      evidence: 3,
      ai: true,
    },
    { id: "F-2026-0346", auditId: "AUD-2026-014", taskId: "T-123",
      title: "Login forma — SQL injection (POST /api/v1/login)",
      severity: "critical", cvss: 9.4, status: "approved",
      reportedBy: "u4", date: "2026-05-16",
      asset: "portal.gov.uz",
      type: "Web zaiflik",
      cwe: "CWE-89",
      description: "Login endpoint username parametrida UNION-based SQL injection. Ma'lumotlar bazasini to‘liq dump qilish mumkin.",
      evidence: 5,
      ai: true,
    },
    { id: "F-2026-0347", auditId: "AUD-2026-014", taskId: "T-114",
      title: "Telnet (port 23) ochiq — 12 ta network qurilmada",
      severity: "high", cvss: 7.5, status: "approved",
      reportedBy: "u6", date: "2026-05-19",
      asset: "Network range",
      type: "Konfiguratsiya kamchiligi",
      cwe: "CWE-319",
      description: "12 ta switch va router qurilmasida Telnet xizmati yoqilgan. SSH-only siyosati buzilgan.",
      evidence: 1,
      ai: true,
    },
    { id: "F-2026-0348", auditId: "AUD-2026-014", taskId: "T-119",
      title: "SMBv1 yoqilgan — 4 ta server",
      severity: "medium", cvss: 5.3, status: "approved",
      reportedBy: "u4", date: "2026-05-18",
      asset: "Server farm",
      type: "Operatsion kamchilik",
      cwe: "CWE-326",
      description: "SMBv1 yoqilgan, EternalBlue/Wannacry kabi exploit vektorlariga ochiq.",
      evidence: 2,
      ai: false,
    },
    { id: "F-2026-0349", auditId: "AUD-2026-014", taskId: "T-119",
      title: "RDP — 0.0.0.0 ga ochiq, NLA off (3 server)",
      severity: "medium", cvss: 5.8, status: "review",
      reportedBy: "u4", date: "2026-05-18",
      asset: "Server farm",
      type: "Tizim sozlamasi",
      cwe: "CWE-287",
      description: "RDP servisi internetga (yoki keng segmentga) ochiq, Network Level Authentication (NLA) o‘chiq.",
      evidence: 1,
      ai: false,
    },
    { id: "F-2026-0350", auditId: "AUD-2026-014", taskId: "T-125",
      title: "Switch ACL — \"any any permit\" oxirgi qoida sifatida",
      severity: "low", cvss: 3.4, status: "review",
      reportedBy: "u6", date: "2026-05-20",
      asset: "SW-CORE-02",
      type: "Konfiguratsiya kamchiligi",
      cwe: "CWE-732",
      description: "Core switch ACL ro‘yxatlarida default deny o‘rniga \"any any permit\" yakuniy qoida sifatida ishlatilgan.",
      evidence: 1,
      ai: false,
    },
  ];

  const SEV_LABELS = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info",
  };

  // ---------- KPI ----------
  const KPI_RULES = [
    { event: "Auditda ishtirok etish",              points: 5 },
    { event: "Audit guruhi rahbari sifatida",       points: 15 },
    { event: "Audit loyihasini ishlab chiqish",     points: 15 },
    { event: "Vazifalarni to‘g‘ri taqsimlash",      points: 10 },
    { event: "Auditor sifatida qatnashish",         points: 10 },
    { event: "Har bir bajarilgan vazifa",           points: 5 },
    { event: "Vazifani muddatida bajarish",         points: 5 },
    { event: "Vazifani kechiktirish",               points: -5 },
    { event: "Tasdiqlangan zaiflik (har biri)",     points: 3 },
    { event: "Critical zaiflik qo‘shimcha",         points: 10 },
    { event: "High zaiflik qo‘shimcha",             points: 7 },
    { event: "Medium zaiflik qo‘shimcha",           points: 4 },
    { event: "Low zaiflik qo‘shimcha",              points: 1 },
    { event: "Konfiguratsiya fayli tahlili",        points: 5 },
    { event: "Skaner natijasini import va tahlil",  points: 5 },
    { event: "Trafik tahlilini bajarish",           points: 7 },
    { event: "Hisobotga texnik xulosa",             points: 5 },
    { event: "Qayta ishlashga qaytarilgan zaiflik", points: -2 },
    { event: "Noto‘g‘ri kiritilgan zaiflik",        points: -3 },
  ];

  const KPI_USERS = [
    { user: "u3", audits: 4, tasks: 31, findings: 14, total: 287, delta: +18, sparkline: [120, 145, 180, 210, 255, 287] },
    { user: "u4", audits: 5, tasks: 28, findings: 22, total: 264, delta: +21, sparkline: [110, 130, 165, 195, 230, 264] },
    { user: "u8", audits: 3, tasks: 22, findings: 16, total: 218, delta: +12, sparkline: [98, 124, 152, 180, 200, 218] },
    { user: "u10", audits: 3, tasks: 19, findings: 11, total: 196, delta: +9,  sparkline: [85, 102, 128, 155, 180, 196] },
    { user: "u6", audits: 4, tasks: 26, findings: 18, total: 188, delta: +14, sparkline: [76, 99, 121, 148, 172, 188] },
    { user: "u7", audits: 3, tasks: 21, findings: 9,  total: 162, delta: +6,  sparkline: [68, 86, 110, 134, 152, 162] },
    { user: "u5", audits: 3, tasks: 17, findings: 7,  total: 138, delta: +3,  sparkline: [62, 78, 95, 110, 128, 138] },
    { user: "u9", audits: 2, tasks: 12, findings: 6,  total: 96,  delta: -2,  sparkline: [42, 58, 72, 84, 98, 96] },
  ];

  // ---------- AI prompts / history ----------
  const AI_CONVO = [
    {
      role: "system",
      time: "10:24",
      text: "Ollama lokal (qwen2.5:14b-instruct) ulanish: OK. Yopiq tarmoq.",
    },
    {
      role: "user", who: "u3",
      time: "10:25",
      text: "F-2026-0341 va F-2026-0347 findinglariga executive summary tayyorla. Texnik bo‘lmagan rahbariyat uchun, 5–6 jumla.",
    },
    {
      role: "ai",
      time: "10:25",
      text: "Audit davomida tarmoq segmentatsiyasiga oid ikkita jiddiy kamchilik aniqlandi. Birinchidan, 10.0.0.0/8 ichki tarmoq segmentlari o‘rtasida hech qanday cheklov mavjud emas — bu hujumchi bitta tugunni egallaganda butun tashkilot ichida erkin harakatlanishi imkonini beradi. Ikkinchidan, o‘n ikkita tarmoq qurilmasida zamonaviy SSH o‘rniga Telnet xizmati hali ham yoqilgan; bu trafikka kim ulanishi mumkinligi va sniffing yo‘li bilan akkauntlarni ushlash xavfini keskin oshiradi. Tavsiya etiladi: birinchi navbatda kritik segmentlarni ajratish (firewall qoidalari), so‘ngra Telnetni butunlay o‘chirib, faqat SSHv2 + kalit asosida autentifikatsiyaga o‘tish. Ushbu ikki choradan keyin aniqlangan kamchiliklarning amaliy xavfi sezilarli darajada pasayadi.",
    },
    {
      role: "user", who: "u3",
      time: "10:31",
      text: "Yaxshi. Endi yuqoridagi 2 ta finding uchun remediation plan (action items, owner, ETA) yarat.",
    },
    {
      role: "ai",
      time: "10:31",
      text: "Remediation rejasi tayyor — 4 ta amal, jami muddati 14 ish kuni. Tafsilotlar pastdagi blokda.",
      attach: "plan",
    },
  ];

  // ---------- Tokens ----------
  const TOKENS = [
    { id: "tk_a91x...c47e", audit: "AUD-2026-014", user: "u6", device: "DESKTOP-MS-NB14",
      hostname: "ms-laptop", os: "Windows 11 Pro 23H2", agent: "v1.2.4",
      ip: "10.20.4.142", issued: "2026-05-15 09:12", expires: "2026-05-31 18:00",
      status: "active", lastUsed: "12 min", tasks: 6 },
    { id: "tk_b27p...f10a", audit: "AUD-2026-014", user: "u7", device: "DESKTOP-JT-22",
      hostname: "jasur-pc", os: "Windows 10 LTSC", agent: "v1.2.4",
      ip: "10.20.4.156", issued: "2026-05-15 09:14", expires: "2026-05-31 18:00",
      status: "active", lastUsed: "1 soat", tasks: 4 },
    { id: "tk_c63m...d92b", audit: "AUD-2026-014", user: "u4", device: "WS-SK-AUDIT",
      hostname: "sevara-ws", os: "Windows 11 Enterprise", agent: "v1.2.4",
      ip: "10.20.4.171", issued: "2026-05-15 09:14", expires: "2026-05-31 18:00",
      status: "active", lastUsed: "31 min", tasks: 8 },
    { id: "tk_d04q...e83c", audit: "AUD-2026-014", user: "u3", device: "BOSH-NB-01",
      hostname: "bobur-nb", os: "Windows 11 Pro", agent: "v1.2.4",
      ip: "10.20.4.188", issued: "2026-05-15 09:13", expires: "2026-05-31 18:00",
      status: "active", lastUsed: "5 daqiqa", tasks: 5 },
    { id: "tk_e88r...a15d", audit: "AUD-2026-013", user: "u9", device: "DESKTOP-SH-09",
      hostname: "sherzod-pc", os: "Windows 10 Pro 22H2", agent: "v1.2.3",
      ip: "10.20.4.203", issued: "2026-03-25 10:02", expires: "2026-05-18 18:00",
      status: "expired", lastUsed: "3 kun", tasks: 3 },
    { id: "tk_f12s...c54e", audit: "AUD-2026-011", user: "u10", device: "WS-LA-PRO",
      hostname: "lola-ws", os: "Windows 11 Pro", agent: "v1.2.4",
      ip: "10.20.4.212", issued: "2026-02-20 14:30", expires: "2026-04-30 18:00",
      status: "revoked", lastUsed: "2 hafta", tasks: 7 },
  ];

  // ---------- Audit log entries ----------
  const LOGS = [
    { time: "10:42:14", user: "u4", action: "finding.create", entity: "F-2026-0349", ip: "10.20.4.171", device: "WS-SK-AUDIT", level: "info" },
    { time: "10:39:02", user: "u3", action: "ai.prompt",      entity: "AUD-2026-014", ip: "10.20.4.188", device: "BOSH-NB-01",    level: "info" },
    { time: "10:35:48", user: "u4", action: "task.update",    entity: "T-123",        ip: "10.20.4.171", device: "WS-SK-AUDIT", level: "info" },
    { time: "10:28:11", user: "u6", action: "agent.sync",     entity: "AUD-2026-014", ip: "10.20.4.142", device: "DESKTOP-MS-NB14", level: "info" },
    { time: "10:22:55", user: "u7", action: "auth.login",     entity: "—",            ip: "10.20.4.156", device: "DESKTOP-JT-22", level: "info" },
    { time: "10:11:09", user: "u9", action: "auth.login.fail", entity: "—",           ip: "10.20.4.203", device: "DESKTOP-SH-09", level: "warn" },
    { time: "09:58:42", user: "u3", action: "finding.approve", entity: "F-2026-0341", ip: "10.20.4.188", device: "BOSH-NB-01",   level: "info" },
    { time: "09:54:30", user: "u3", action: "report.generate", entity: "AUD-2026-013", ip: "10.20.4.188", device: "BOSH-NB-01",   level: "info" },
    { time: "09:42:18", user: "u2", action: "audit.approve",  entity: "AUD-2026-011", ip: "10.20.4.110", device: "DESKTOP-DR-01", level: "info" },
    { time: "09:35:01", user: "u4", action: "token.issue",    entity: "tk_b27p…f10a", ip: "10.20.4.171", device: "WS-SK-AUDIT",  level: "info" },
    { time: "09:11:24", user: "u1", action: "settings.update", entity: "kpi.rules",   ip: "10.20.4.99",  device: "AY-OFFICE-01",  level: "warn" },
    { time: "08:48:09", user: "u6", action: "token.use",      entity: "tk_a91x…c47e", ip: "10.20.4.142", device: "DESKTOP-MS-NB14", level: "info" },
  ];

  // ---------- Permission matrix ----------
  const PERM_MODULES = [
    { id: "users",     name: "Foydalanuvchilar",         d: "full", b: "read",   bs: "no",    y: "no",    t1: "no" },
    { id: "org",       name: "Tashkilotlar kartasi",     d: "full", b: "full",   bs: "own",   y: "own",   t1: "own" },
    { id: "audit",     name: "Audit kartasi",            d: "full", b: "full",   bs: "own",   y: "own",   t1: "own" },
    { id: "group",     name: "Audit guruhini shaklllash", d: "read", b: "full",   bs: "no",    y: "no",    t1: "no" },
    { id: "leader",    name: "Guruh rahbarini tanlash",  d: "read", b: "full",   bs: "no",    y: "no",    t1: "no" },
    { id: "project",   name: "Auditdan o‘tkazish loyihasi", d: "read", b: "full", bs: "own",   y: "own",   t1: "own" },
    { id: "assign",    name: "Vazifalarni biriktirish",  d: "read", b: "read",   bs: "own",   y: "own",   t1: "own" },
    { id: "mytasks",   name: "O‘z vazifalarini ko‘rish", d: "full", b: "full",   bs: "own",   y: "own",   t1: "own" },
    { id: "finding",   name: "Kamchilik/zaiflik",        d: "full", b: "read",   bs: "own",   y: "own",   t1: "own" },
    { id: "agent",     name: "EXE agent",                d: "no",   b: "read",   bs: "full",  y: "full",  t1: "full" },
    { id: "token",     name: "Audit token",              d: "full", b: "full",   bs: "own",   y: "own",   t1: "own" },
    { id: "ai",        name: "AI tahlil",                d: "full", b: "full",   bs: "own",   y: "own",   t1: "own" },
    { id: "kpi",       name: "KPI",                      d: "full", b: "full",   bs: "own",   y: "own",   t1: "own" },
    { id: "report",    name: "Hisobotlar",               d: "full", b: "full",   bs: "own",   y: "own",   t1: "own" },
    { id: "log",       name: "Audit log",                d: "full", b: "read",   bs: "own",   y: "own",   t1: "own" },
  ];

  const PERM_VALUES = {
    full:    { label: "To‘liq",         className: "perm--full" },
    full2:   { label: "Boshqarish",      className: "perm--full" },
    read:    { label: "Ko‘rish",         className: "perm--read" },
    own:     { label: "O‘ziga tegishli", className: "perm--partial" },
    no:      { label: "Yo‘q",            className: "perm--no" },
  };

  // ---------- Reports ----------
  const REPORTS = [
    { id: "R-201", title: "Aloqa va kommunikatsiya vazirligi — yakuniy audit hisoboti", audit: "AUD-2026-014", type: "Audit hisoboti",      status: "draft",     generated: "—",                 size: "—", format: ["DOCX", "PDF"], author: "u3" },
    { id: "R-200", title: "Aloqa vazirligi — Executive Summary",                       audit: "AUD-2026-014", type: "Executive summary",   status: "draft",     generated: "—",                 size: "—", format: ["PDF"],         author: "u3" },
    { id: "R-199", title: "Soliq qo‘mitasi — yakuniy hisobot",                         audit: "AUD-2026-013", type: "Audit hisoboti",      status: "approved",  generated: "2026-05-18 14:21",  size: "4.2 MB", format: ["DOCX", "PDF", "HTML"], author: "u4" },
    { id: "R-198", title: "Soliq qo‘mitasi — Remediation plan",                        audit: "AUD-2026-013", type: "Remediation plan",    status: "approved",  generated: "2026-05-18 14:24",  size: "1.1 MB", format: ["DOCX", "PDF"],         author: "u4" },
    { id: "R-197", title: "Davlat xizmatlari agentligi — yakuniy hisobot",             audit: "AUD-2026-011", type: "Audit hisoboti",      status: "approved",  generated: "2026-04-30 17:02",  size: "5.8 MB", format: ["DOCX", "PDF"],         author: "u3" },
    { id: "R-196", title: "Markaziy bank — pentest oraliq hisoboti",                   audit: "AUD-2026-012", type: "Pentest hisoboti",    status: "review",    generated: "2026-05-20 11:05",  size: "2.4 MB", format: ["DOCX", "PDF"],         author: "u8" },
  ];

  // ---------- Organization detail (contacts + device inventory + risk) ----------
  // Keyed by org id. Used by the Organizations screen + detail drawer.
  const ORG_DETAIL = {
    o1: {
      region: "Toshkent sh.", address: "Amir Temur ko‘chasi 107A", risk: "high",
      head: "Akmal Yo‘ldoshev", since: "2023",
      contacts: [
        { name: "Rustam Qodirov",   role: "CISO",            email: "r.qodirov@aloqa.gov.uz", phone: "+998 71 207 10 01" },
        { name: "Gulnoza Ismoilova", role: "IT bo‘lim boshlig‘i", email: "g.ismoilova@aloqa.gov.uz", phone: "+998 71 207 10 14" },
      ],
      devices: [
        { name: "FW-CORE-01",   kind: "Firewall",  vendor: "Cisco ASA 5555-X", ip: "10.0.0.1",    crit: "Kritik" },
        { name: "SW-CORE-02",   kind: "Switch",    vendor: "Cisco Catalyst 9300", ip: "10.0.0.2", crit: "Yuqori" },
        { name: "DC-01.gov.uz", kind: "Server",    vendor: "Windows Server 2019", ip: "10.10.1.10", crit: "Kritik" },
        { name: "web-prod-03",  kind: "Server",    vendor: "Ubuntu 22.04 / Apache", ip: "10.20.3.3", crit: "Yuqori" },
        { name: "IPS-EDGE-01",  kind: "IDS/IPS",   vendor: "Suricata", ip: "10.0.0.5",   crit: "Yuqori" },
        { name: "VPN-GW-01",    kind: "VPN gateway", vendor: "FortiGate 100F", ip: "10.0.0.9", crit: "O‘rta" },
      ],
    },
    o2: { region: "Toshkent sh.", address: "Bunyodkor shoh ko‘chasi 1", risk: "high", head: "Dilshoda Rasulova", since: "2022",
      contacts: [{ name: "Sardor Aliyev", role: "CISO", email: "ciso@soliq.uz", phone: "+998 71 202 00 12" }],
      devices: [
        { name: "DB-PRD-01", kind: "Server", vendor: "PostgreSQL 16 / RHEL 9", ip: "10.30.1.4", crit: "Kritik" },
        { name: "APP-PRD-02", kind: "Server", vendor: "Windows Server 2022", ip: "10.30.1.6", crit: "Yuqori" },
      ] },
    o3: { region: "Toshkent sh.", address: "Mustaqillik ko‘chasi 5", risk: "high", head: "Bobur Mirzayev", since: "2021",
      contacts: [{ name: "Nodira Yusupova", role: "Axborot xavfsizligi", email: "ciso@cbu.uz", phone: "+998 71 212 60 00" }],
      devices: [{ name: "MOB-API-01", kind: "Server", vendor: "Kubernetes / Linux", ip: "10.40.2.2", crit: "Kritik" }] },
    o4: { region: "Toshkent sh.", address: "Islom Karimov ko‘chasi 49", risk: "medium", head: "Sevara Karimova", since: "2024",
      contacts: [{ name: "Jamshid Toirov", role: "IT direktor", email: "info@dxa.uz", phone: "+998 71 207 30 11" }],
      devices: [{ name: "PREPROD-01", kind: "Server", vendor: "Ubuntu 22.04", ip: "10.50.1.1", crit: "O‘rta" }] },
    o5: { region: "Toshkent sh.", address: "Istiqbol ko‘chasi 21", risk: "medium", head: "Lola Aliyeva", since: "2025",
      contacts: [{ name: "Akbar Saidov", role: "OT xavfsizligi", email: "sec@energy.uz", phone: "+998 71 207 40 22" }],
      devices: [{ name: "SCADA-HMI-01", kind: "OT/SCADA", vendor: "Siemens WinCC", ip: "172.16.5.10", crit: "Kritik" }] },
    o6: { region: "Toshkent sh.", address: "Navoiy ko‘chasi 14", risk: "low", head: "Otabek Jo‘rayev", since: "2024",
      contacts: [{ name: "Dilnoza Rahimova", role: "Web admin", email: "it@tashkent.uz", phone: "+998 71 207 50 33" }],
      devices: [{ name: "WEB-PORTAL-01", kind: "Server", vendor: "Nginx / Debian 12", ip: "10.60.1.1", crit: "O‘rta" }] },
  };

  const ORG_RISK = {
    high:   { label: "Yuqori xavf",  tag: "tag--danger" },
    medium: { label: "O‘rta xavf",   tag: "tag--warning" },
    low:    { label: "Past xavf",    tag: "tag--success" },
  };

  // ---------- Network topology (AUD-2026-014) ----------
  // Force-directed graph built from PCAP / scanner asset relationships.
  // kind drives the node glyph; sev = worst finding severity on the asset.
  const TOPOLOGY = {
    audit: "AUD-2026-014",
    nodes: [
      { id: "internet", label: "Internet",      ip: "0.0.0.0/0",   kind: "cloud",    segment: "Tashqi",      sev: "info",     findings: 0 },
      { id: "fw",       label: "FW-CORE-01",     ip: "10.0.0.1",    kind: "firewall", segment: "Perimetr",    sev: "critical", findings: 2 },
      { id: "ips",      label: "IPS-EDGE-01",    ip: "10.0.0.5",    kind: "ips",      segment: "Perimetr",    sev: "high",     findings: 1 },
      { id: "vpn",      label: "VPN-GW-01",      ip: "10.0.0.9",    kind: "vpn",      segment: "Perimetr",    sev: "medium",   findings: 0 },
      { id: "swcore",   label: "SW-CORE-02",     ip: "10.0.0.2",    kind: "switch",   segment: "Yadro",       sev: "low",      findings: 1 },
      { id: "dc",       label: "DC-01.gov.uz",   ip: "10.10.1.10",  kind: "server",   segment: "Ichki tarmoq", sev: "high",    findings: 1 },
      { id: "dmzsw",    label: "SW-DMZ-01",      ip: "10.20.0.2",   kind: "switch",   segment: "DMZ",         sev: "info",     findings: 0 },
      { id: "web",      label: "web-prod-03",    ip: "10.20.3.3",   kind: "web",      segment: "DMZ",         sev: "critical", findings: 1 },
      { id: "portal",   label: "portal.gov.uz",  ip: "10.20.3.8",   kind: "web",      segment: "DMZ",         sev: "critical", findings: 1 },
      { id: "dbfarm",   label: "DB-FARM",        ip: "10.30.1.0/24", kind: "db",      segment: "Server farm", sev: "medium",   findings: 2 },
      { id: "appsrv",   label: "APP-SRV-01",     ip: "10.30.1.6",   kind: "server",   segment: "Server farm", sev: "medium",   findings: 0 },
      { id: "wifi",     label: "WLC-01",         ip: "10.40.0.4",   kind: "wifi",     segment: "Ichki tarmoq", sev: "low",     findings: 0 },
      { id: "ep1",      label: "MS-NB14",        ip: "10.20.4.142", kind: "endpoint", segment: "Endpoint",    sev: "info",     findings: 0 },
      { id: "ep2",      label: "10.10.42.16",    ip: "10.10.42.16", kind: "endpoint", segment: "Endpoint",    sev: "high",     findings: 1 },
      { id: "sw2",      label: "SW-ACC-07",      ip: "10.10.0.7",   kind: "switch",   segment: "Ichki tarmoq", sev: "high",    findings: 1 },
    ],
    edges: [
      { s: "internet", t: "fw" }, { s: "fw", t: "ips" }, { s: "fw", t: "vpn" }, { s: "fw", t: "swcore" },
      { s: "swcore", t: "dc" }, { s: "swcore", t: "dmzsw" }, { s: "swcore", t: "wifi" }, { s: "swcore", t: "sw2" },
      { s: "dmzsw", t: "web" }, { s: "dmzsw", t: "portal" }, { s: "swcore", t: "dbfarm" }, { s: "dbfarm", t: "appsrv" },
      { s: "sw2", t: "ep1" }, { s: "sw2", t: "ep2" }, { s: "dc", t: "ep2", flag: true }, { s: "web", t: "dbfarm", flag: true },
    ],
  };

  // ---------- Approval flows (3-stage) ----------
  // Project approval: group_lead → head → dept (per TZ §7)
  const PROJECT_APPROVAL = {
    stages: [
      { key: "group_lead", title: "Guruh rahbari", who: "u3", role: "Yuborish" },
      { key: "head",       title: "Bo‘lim boshlig‘i", who: "u2", role: "Tasdiqlash" },
      { key: "dept",       title: "Departament rahbari", who: "u1", role: "Yakuniy tasdiq" },
    ],
    timeline: [
      { who: "u3", action: "Loyihani yaratdi",        stage: "group_lead", t: "2026-04-12 14:30", state: "done" },
      { who: "u3", action: "Tasdiqlashga yubordi",    stage: "group_lead", t: "2026-04-13 09:14", state: "done", comment: "Doira va metodologiya yakunlandi, tasdiqqa tayyor." },
      { who: "u2", action: "Tasdiqladi",              stage: "head",       t: "2026-04-13 16:48", state: "done", comment: "Doira to‘g‘ri. Departament tasdig‘iga yuboraman." },
    ],
    current: "dept", // awaiting dept approval
  };

  // ---------- Helpers ----------
  function userById(id) { return USERS.find(u => u.id === id) || { name: id, avatar: "?" }; }
  function orgById(id) { return ORGS.find(o => o.id === id) || { name: id }; }
  function orgDetail(id) { return ORG_DETAIL[id] || { contacts: [], devices: [] }; }
  function auditById(id) { return AUDITS.find(a => a.id === id); }
  function findingsByAudit(id) { return FINDINGS.filter(f => f.auditId === id); }

  return {
    USERS, ROLES, ORGS, ORG_DETAIL, ORG_RISK, AUDITS, STATUS_LABELS, WORKFLOW, TASKS, TASK_STATUS,
    FINDINGS, SEV_LABELS, KPI_RULES, KPI_USERS, AI_CONVO, TOKENS, LOGS,
    PERM_MODULES, PERM_VALUES, REPORTS, TOPOLOGY, PROJECT_APPROVAL,
    userById, orgById, orgDetail, auditById, findingsByAudit,
  };
})();
