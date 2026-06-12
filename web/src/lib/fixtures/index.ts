/**
 * Typed fixtures — a faithful port of the prototype's data.js
 * (project/app/ui_kits/auditor/data.js). Differences from the prototype:
 *   • role codes normalized to canonical super/head/chief/lead/t1 (ADR-0006);
 *   • presentational status/severity maps carry a semantic `tone` + design class
 *     instead of hardcoded hex (so colors come from tokens).
 * These back the UI during Phases 2–5 and become the Prisma seed in Phase 1.
 */
import type {
  AiMessage,
  Audit,
  AuditToken,
  Finding,
  KpiRule,
  KpiUser,
  LogEntry,
  Organization,
  OrgDetail,
  ProjectApproval,
  Report,
  Task,
  TaskStatus,
  Topology,
  User,
  WorkflowStep,
} from "../types/entities";
import type { AuditStatus, FindingStatus, Severity } from "../types/entities";

/** Semantic tone → maps to design-system status tokens / tag classes. */
export type Tone = "neutral" | "info" | "warning" | "danger" | "success";

// ---------- Users ----------
export const USERS: User[] = [
  { id: "u1", name: "Akmal Yoʻldoshev", role: "super", title: "Departament rahbari", avatar: "AY", dept: "Markaziy apparat" },
  { id: "u2", name: "Dilshoda Rasulova", role: "head", title: "Boʻlim boshligʻi", avatar: "DR", dept: "Audit boʻlimi" },
  { id: "u3", name: "Bobur Mirzayev", role: "chief", title: "Bosh mutaxassis", avatar: "BM", dept: "Audit boʻlimi" },
  { id: "u4", name: "Sevara Karimova", role: "lead", title: "Yetakchi mutaxassis", avatar: "SK", dept: "Audit boʻlimi" },
  { id: "u5", name: "Otabek Joʻrayev", role: "lead", title: "Yetakchi mutaxassis", avatar: "OJ", dept: "Audit boʻlimi" },
  { id: "u6", name: "Madina Sodiqova", role: "t1", title: "Birinchi toifali mutaxassis", avatar: "MS", dept: "Audit boʻlimi" },
  { id: "u7", name: "Jasur Tursunov", role: "t1", title: "Birinchi toifali mutaxassis", avatar: "JT", dept: "Audit boʻlimi" },
  { id: "u8", name: "Nigora Ergasheva", role: "chief", title: "Bosh mutaxassis", avatar: "NE", dept: "Audit boʻlimi" },
  { id: "u9", name: "Sherzod Hamidov", role: "t1", title: "Birinchi toifali mutaxassis", avatar: "SH", dept: "Audit boʻlimi" },
  { id: "u10", name: "Lola Aliyeva", role: "lead", title: "Yetakchi mutaxassis", avatar: "LA", dept: "Audit boʻlimi" },
];

// ---------- Organizations ----------
export const ORGS: Organization[] = [
  { id: "o1", name: "Aloqa va kommunikatsiya vazirligi", stir: "207100123", sector: "Davlat", audits: 6, contact: "info@aloqa.gov.uz" },
  { id: "o2", name: "Soliq qoʻmitasi", stir: "201200456", sector: "Davlat", audits: 4, contact: "audit@soliq.uz" },
  { id: "o3", name: "Markaziy bank", stir: "200100789", sector: "Davlat", audits: 3, contact: "ciso@cbu.uz" },
  { id: "o4", name: "Davlat xizmatlari agentligi", stir: "207300111", sector: "Davlat", audits: 5, contact: "info@dxa.uz" },
  { id: "o5", name: "Energiya vazirligi", stir: "207400222", sector: "Davlat", audits: 2, contact: "sec@energy.uz" },
  { id: "o6", name: "Toshkent shahar hokimligi", stir: "207500333", sector: "Davlat", audits: 3, contact: "it@tashkent.uz" },
];

export const ORG_DETAIL: Record<string, OrgDetail> = {
  o1: {
    head: "Akmal Yoʻldoshev",
    contacts: [
      { name: "Rustam Qodirov", role: "CISO", email: "r.qodirov@aloqa.gov.uz", phone: "+998 71 207 10 01" },
      { name: "Gulnoza Ismoilova", role: "IT boʻlim boshligʻi", email: "g.ismoilova@aloqa.gov.uz", phone: "+998 71 207 10 14" },
    ],
    devices: [
      { name: "FW-CORE-01", kind: "Firewall", vendor: "Cisco ASA 5555-X", ip: "10.0.0.1", crit: "Kritik" },
      { name: "SW-CORE-02", kind: "Switch", vendor: "Cisco Catalyst 9300", ip: "10.0.0.2", crit: "Yuqori" },
      { name: "DC-01.gov.uz", kind: "Server", vendor: "Windows Server 2019", ip: "10.10.1.10", crit: "Kritik" },
      { name: "web-prod-03", kind: "Server", vendor: "Ubuntu 22.04 / Apache", ip: "10.20.3.3", crit: "Yuqori" },
      { name: "IPS-EDGE-01", kind: "IDS/IPS", vendor: "Suricata", ip: "10.0.0.5", crit: "Yuqori" },
      { name: "VPN-GW-01", kind: "VPN gateway", vendor: "FortiGate 100F", ip: "10.0.0.9", crit: "Oʻrta" },
    ],
  },
  o2: {
    head: "Dilshoda Rasulova",
    contacts: [{ name: "Sardor Aliyev", role: "CISO", email: "ciso@soliq.uz", phone: "+998 71 202 00 12" }],
    devices: [
      { name: "DB-PRD-01", kind: "Server", vendor: "PostgreSQL 16 / RHEL 9", ip: "10.30.1.4", crit: "Kritik" },
      { name: "APP-PRD-02", kind: "Server", vendor: "Windows Server 2022", ip: "10.30.1.6", crit: "Yuqori" },
    ],
  },
  o3: {
    head: "Bobur Mirzayev",
    contacts: [{ name: "Nodira Yusupova", role: "Axborot xavfsizligi", email: "ciso@cbu.uz", phone: "+998 71 212 60 00" }],
    devices: [{ name: "MOB-API-01", kind: "Server", vendor: "Kubernetes / Linux", ip: "10.40.2.2", crit: "Kritik" }],
  },
  o4: {
    head: "Sevara Karimova",
    contacts: [{ name: "Jamshid Toirov", role: "IT direktor", email: "info@dxa.uz", phone: "+998 71 207 30 11" }],
    devices: [{ name: "PREPROD-01", kind: "Server", vendor: "Ubuntu 22.04", ip: "10.50.1.1", crit: "Oʻrta" }],
  },
  o5: {
    head: "Lola Aliyeva",
    contacts: [{ name: "Akbar Saidov", role: "OT xavfsizligi", email: "sec@energy.uz", phone: "+998 71 207 40 22" }],
    devices: [{ name: "SCADA-HMI-01", kind: "OT/SCADA", vendor: "Siemens WinCC", ip: "172.16.5.10", crit: "Kritik" }],
  },
  o6: {
    head: "Otabek Joʻrayev",
    contacts: [{ name: "Dilnoza Rahimova", role: "Web admin", email: "it@tashkent.uz", phone: "+998 71 207 50 33" }],
    devices: [{ name: "WEB-PORTAL-01", kind: "Server", vendor: "Nginx / Debian 12", ip: "10.60.1.1", crit: "Oʻrta" }],
  },
};

// Kept for reference; no longer used after OrgDetail fields refactoring.
export const ORG_RISK: Record<"high" | "medium" | "low", { label: string; tag: string }> = {
  high: { label: "Yuqori xavf", tag: "tag--danger" },
  medium: { label: "Oʻrta xavf", tag: "tag--warning" },
  low: { label: "Past xavf", tag: "tag--success" },
};

// ---------- Audits ----------
export const AUDITS: Audit[] = [
  { id: "AUD-2026-014", code: "AUD-2026-014", title: "Aloqa va kommunikatsiya vazirligi — yillik kompleks audit", org: "o1", type: "Kompleks audit", status: "in_progress", stage: 7, startDate: "2026-04-12", endDate: "2026-05-31", progress: 64, leader: "u3", members: ["u3", "u4", "u6", "u7"], findings: { critical: 4, high: 9, medium: 14, low: 7 }, tasks: { total: 38, done: 22, in_progress: 11, blocked: 2, new: 3 }, lastSync: "12 daqiqa oldin", pinned: true, goal: "Aloqa va kommunikatsiya vazirligi axborot tizimlari xavfsizligini baholash, zaifliklarni aniqlash va remediatsiya boʻyicha tavsiyalar berish.", methodology: "OWASP ASVS · NIST 800-53 · ISO 27001", scope: ["Tashqi perimetr", "Ichki tarmoq (10.0.0.0/8)", "Web ilovalar (portal.gov.uz)", "Server infratuzilmasi", "Active Directory domeni", "VPN gateway", "Wi-Fi corporate"], tools: ["Nessus 10.5", "OpenVAS / GVM", "OWASP ZAP", "Burp Suite Pro", "Wireshark", "Nmap 7.94", "Suricata", "Hydra", "John the Ripper"] },
  { id: "AUD-2026-013", code: "AUD-2026-013", title: "Soliq qoʻmitasi — DBMS va loyiha auditi", org: "o2", type: "Texnik audit", status: "review", stage: 9, startDate: "2026-03-22", endDate: "2026-05-18", progress: 88, leader: "u4", members: ["u4", "u3", "u9"], findings: { critical: 2, high: 5, medium: 8, low: 4 }, tasks: { total: 26, done: 24, in_progress: 1, blocked: 0, new: 1 }, lastSync: "2 soat oldin", goal: "Soliq qoʻmitasi DBMS va loyiha infratuzilmasi xavfsizligini texnik baholash.", methodology: "NIST SP 800-115 · CIS Benchmarks", scope: ["DBMS klasteri", "Loyiha serverlari", "Backup tizimi"], tools: ["Nessus 10.5", "Nmap 7.94", "sqlmap", "Wireshark"] },
  { id: "AUD-2026-012", code: "AUD-2026-012", title: "Markaziy bank — mobil bank ilovasi penetration test", org: "o3", type: "Penetration test", status: "in_progress", stage: 7, startDate: "2026-05-01", endDate: "2026-06-12", progress: 42, leader: "u8", members: ["u8", "u5", "u6"], findings: { critical: 3, high: 7, medium: 11, low: 5 }, tasks: { total: 22, done: 9, in_progress: 8, blocked: 1, new: 4 }, lastSync: "31 daqiqa oldin", goal: "Markaziy bank mobil bank ilovasi uchun penetration test oʻtkazish.", methodology: "OWASP MASVS · PTES", scope: ["iOS ilova", "Android ilova", "Backend API"], tools: ["Burp Suite Pro", "MobSF", "Frida", "Nmap 7.94"] },
  { id: "AUD-2026-011", code: "AUD-2026-011", title: "Davlat xizmatlari agentligi — pre-prod muhit auditi", org: "o4", type: "Kompleks audit", status: "completed", stage: 10, startDate: "2026-02-15", endDate: "2026-04-30", progress: 100, leader: "u3", members: ["u3", "u4", "u7", "u10"], findings: { critical: 1, high: 4, medium: 12, low: 9 }, tasks: { total: 31, done: 31, in_progress: 0, blocked: 0, new: 0 }, lastSync: "1 hafta oldin", goal: "Davlat xizmatlari agentligi pre-prod muhitining kompleks auditi.", methodology: "OWASP ASVS · NIST 800-53", scope: ["Pre-prod tarmoq", "Ilova serverlari", "CI/CD quvuri"], tools: ["Nessus 10.5", "OWASP ZAP", "Nmap 7.94"] },
  { id: "AUD-2026-010", code: "AUD-2026-010", title: "Energiya vazirligi — OT/SCADA segmentatsiya auditi", org: "o5", type: "Maxsus audit", status: "planning", stage: 3, startDate: "2026-05-20", endDate: "2026-07-15", progress: 12, leader: "u10", members: ["u10", "u8", "u9"], findings: { critical: 0, high: 0, medium: 0, low: 0 }, tasks: { total: 14, done: 1, in_progress: 0, blocked: 0, new: 13 }, lastSync: "—", goal: "Energiya vazirligi OT/SCADA segmentatsiyasini baholash.", methodology: "IEC 62443 · NIST 800-82", scope: ["OT tarmogʻi", "SCADA HMI", "Segmentatsiya nuqtalari"], tools: ["Nmap 7.94", "Wireshark", "GRASSMARLIN"] },
  { id: "AUD-2026-009", code: "AUD-2026-009", title: "Toshkent shahar hokimligi — public web portfolio auditi", org: "o6", type: "Web audit", status: "returned", stage: 9, startDate: "2026-03-01", endDate: "2026-04-15", progress: 76, leader: "u5", members: ["u5", "u6", "u9"], findings: { critical: 1, high: 3, medium: 6, low: 11 }, tasks: { total: 18, done: 13, in_progress: 4, blocked: 1, new: 0 }, lastSync: "3 kun oldin", goal: "Toshkent shahar hokimligi public web portfeli xavfsizlik auditi.", methodology: "OWASP ASVS · OWASP Top 10", scope: ["Public web saytlar", "CMS platformasi", "DNS konfiguratsiya"], tools: ["OWASP ZAP", "Nikto", "Nmap 7.94", "sslscan"] },
  { id: "AUD-2026-015", code: "AUD-2026-015", title: "Markaziy bank — yangi toʻlov shlyuzi loyiha auditi", org: "o3", type: "Kompleks audit", status: "project_pending", stage: 4, startDate: "2026-06-01", endDate: "2026-07-20", progress: 8, leader: "u3", members: ["u3", "u6", "u7"], findings: { critical: 0, high: 0, medium: 0, low: 0 }, tasks: { total: 0, done: 0, in_progress: 0, blocked: 0, new: 0 }, lastSync: "5 daqiqa oldin", goal: "Markaziy bank yangi toʻlov shlyuzi loyiha auditi.", methodology: "PCI DSS · OWASP ASVS", scope: ["Toʻlov shlyuzi", "HSM integratsiya", "Tranzaksiya API"], tools: ["Burp Suite Pro", "Nessus 10.5", "Nmap 7.94"] },
];

export const STATUS_LABELS: Record<AuditStatus, { label: string; tag: string; tone: Tone }> = {
  planning: { label: "Rejalashtirilgan", tag: "tag--ghost", tone: "neutral" },
  group_forming: { label: "Guruh shakllanmoqda", tag: "tag--ghost", tone: "neutral" },
  project_draft: { label: "Loyiha ishlab chiqilmoqda", tag: "tag--info", tone: "info" },
  project_pending: { label: "Loyiha tasdiqlashda", tag: "tag--warning", tone: "warning" },
  head_approved: { label: "Qisman tasdiqlangan", tag: "tag--info", tone: "info" },
  assigning: { label: "Vazifalar taqsimlanmoqda", tag: "tag--info", tone: "info" },
  in_progress: { label: "Jarayonda", tag: "tag--info", tone: "info" },
  review: { label: "Tekshiruvda", tag: "tag--warning", tone: "warning" },
  returned: { label: "Qaytarilgan", tag: "tag--danger", tone: "danger" },
  approved: { label: "Tasdiqlangan", tag: "tag--success", tone: "success" },
  completed: { label: "Yakunlangan", tag: "tag--success", tone: "success" },
  cancelled: { label: "Bekor qilingan", tag: "tag--ghost", tone: "neutral" },
};

// Finding status pill labels (all 8 states). review/returned/approved deliberately match
// STATUS_LABELS so the seeded findings list renders pixel-identically; the remediation states
// (fixing/fixed/retest/closed) are new.
export const FINDING_STATUS_LABELS: Record<FindingStatus, { label: string; tone: Tone }> = {
  new: { label: "Yangi", tone: "neutral" },
  review: { label: "Tekshiruvda", tone: "warning" },
  returned: { label: "Qaytarilgan", tone: "danger" },
  approved: { label: "Tasdiqlangan", tone: "success" },
  fixing: { label: "Tuzilmoqda", tone: "info" },
  fixed: { label: "Tuzildi", tone: "info" },
  retest: { label: "Qayta test", tone: "warning" },
  closed: { label: "Yopilgan", tone: "success" },
};

export const WORKFLOW: WorkflowStep[] = [
  { n: 1, key: "create", title: "Audit yaratish", who: "Boʻlim boshligʻi", short: "Tashkilot tanlandi, audit kartasi yaratildi." },
  { n: 2, key: "group", title: "Audit guruhini shakllantirish", who: "Boʻlim boshligʻi", short: "Audit guruhi rahbari va auditorlar tanlandi." },
  { n: 3, key: "project", title: "Audit loyihasini ishlab chiqish", who: "Guruh rahbari", short: "Maqsad, doira, bosqichlar, metodologiya tuzildi." },
  { n: 4, key: "assign", title: "Vazifalarni taqsimlash", who: "Guruh rahbari", short: "38 ta vazifa 4 ta auditor oʻrtasida taqsimlandi." },
  { n: 5, key: "approve", title: "Loyihani tasdiqlash", who: "Boʻlim boshligʻi", short: "Audit loyihasi tasdiqlandi." },
  { n: 6, key: "token", title: "EXE agent va token", who: "Auditor", short: "4 ta audit token chiqarildi, qurilmalarga bogʻlandi." },
  { n: 7, key: "fieldwork", title: "Joyida audit", who: "Auditor", short: "22 vazifa bajarildi, 34 finding kiritildi.", current: true },
  { n: 8, key: "sync", title: "Sinxronlash", who: "EXE agent", short: "Oxirgi sinxronlash 12 daqiqa oldin (success)." },
  { n: 9, key: "review", title: "Koʻrib chiqish", who: "Guruh rahbari", short: "Tasdiqlash va qaytarish hali yakunlanmagan." },
  { n: 10, key: "report", title: "Tahlil va hisobot", who: "AI + Rahbar", short: "AI xulosa va yakuniy hisobot kutilmoqda." },
];

// ---------- Tasks ----------
export const TASKS: Task[] = [
  { id: "T-114", auditId: "AUD-2026-014", title: "Firewall qoidalari va segmentatsiyani tahlil qilish", type: "Konfiguratsiya", priority: "Yuqori", status: "in_progress", due: "2026-05-22", assignee: "u6", findings: 3, files: 2, kpi: 5 },
  { id: "T-115", auditId: "AUD-2026-014", title: "Active Directory parol siyosatini tekshirish", type: "Tizim audit", priority: "Yuqori", status: "in_progress", due: "2026-05-23", assignee: "u7", findings: 2, files: 1, kpi: 5 },
  { id: "T-116", auditId: "AUD-2026-014", title: "Nessus skaner natijalarini import qilish", type: "Skaner", priority: "Oʻrta", status: "done", due: "2026-05-18", assignee: "u4", findings: 8, files: 4, kpi: 10 },
  { id: "T-117", auditId: "AUD-2026-014", title: "PCAP fayli — DNS tunneling tahlili", type: "Trafik", priority: "Yuqori", status: "review", due: "2026-05-24", assignee: "u3", findings: 1, files: 1, kpi: 7 },
  { id: "T-118", auditId: "AUD-2026-014", title: "Wi-Fi controller konfiguratsiyasi auditi", type: "Konfiguratsiya", priority: "Oʻrta", status: "new", due: "2026-05-26", assignee: "u6", findings: 0, files: 0, kpi: 0 },
  { id: "T-119", auditId: "AUD-2026-014", title: "OpenVAS — internal subnet skanerlash", type: "Skaner", priority: "Yuqori", status: "in_progress", due: "2026-05-25", assignee: "u4", findings: 5, files: 1, kpi: 5 },
  { id: "T-120", auditId: "AUD-2026-014", title: "Backup va DR rejasi suhbati", type: "Hujjat", priority: "Oʻrta", status: "in_progress", due: "2026-05-27", assignee: "u3", findings: 0, files: 1, kpi: 0 },
  { id: "T-121", auditId: "AUD-2026-014", title: "VPN gateway konfiguratsiyasi", type: "Konfiguratsiya", priority: "Yuqori", status: "blocked", due: "2026-05-22", assignee: "u7", findings: 0, files: 0, kpi: 0 },
  { id: "T-122", auditId: "AUD-2026-014", title: "IDS/IPS log tahlili", type: "Log", priority: "Oʻrta", status: "done", due: "2026-05-17", assignee: "u6", findings: 4, files: 1, kpi: 8 },
  { id: "T-123", auditId: "AUD-2026-014", title: "Web ilova OWASP ZAP skaneri", type: "Skaner", priority: "Yuqori", status: "review", due: "2026-05-24", assignee: "u4", findings: 6, files: 2, kpi: 5 },
  { id: "T-124", auditId: "AUD-2026-014", title: "Hisobot boʻlimini tayyorlash (Sec-overview)", type: "Hisobot", priority: "Past", status: "new", due: "2026-05-28", assignee: "u3", findings: 0, files: 0, kpi: 0 },
  { id: "T-125", auditId: "AUD-2026-014", title: "Switch ACL roʻyxatini tekshirish", type: "Konfiguratsiya", priority: "Past", status: "in_progress", due: "2026-05-26", assignee: "u6", findings: 1, files: 1, kpi: 5 },

  // AUD-2026-013 — Soliq qoʻmitasi DBMS auditi (26 tasks: 24 done, 1 in_progress, 1 new)
  { id: "T-200", auditId: "AUD-2026-013", title: "DBMS versiyasi va patch holati tekshiruvi", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-04-01", assignee: "u4", findings: 2, files: 2, kpi: 8 },
  { id: "T-201", auditId: "AUD-2026-013", title: "Oracle DB foydalanuvchi imtiyozlari auditi", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-04-02", assignee: "u4", findings: 3, files: 1, kpi: 10 },
  { id: "T-202", auditId: "AUD-2026-013", title: "DB audit logging sozlamalari", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-04-03", assignee: "u3", findings: 1, files: 1, kpi: 5 },
  { id: "T-203", auditId: "AUD-2026-013", title: "Zaxira (backup) tizimini tekshirish", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-04-04", assignee: "u9", findings: 1, files: 1, kpi: 5 },
  { id: "T-204", auditId: "AUD-2026-013", title: "DB tarmoq portlari va firewall qoidalari", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-04-05", assignee: "u4", findings: 2, files: 2, kpi: 7 },
  { id: "T-205", auditId: "AUD-2026-013", title: "Shifrlash va TLS konfiguratsiyasi", type: "Konfiguratsiya", priority: "Oʻrta", status: "done", due: "2026-04-07", assignee: "u3", findings: 1, files: 1, kpi: 5 },
  { id: "T-206", auditId: "AUD-2026-013", title: "Loyiha serverlari OS hardening", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-04-08", assignee: "u9", findings: 2, files: 2, kpi: 7 },
  { id: "T-207", auditId: "AUD-2026-013", title: "SSH sozlamalari va kalitlar tekshiruvi", type: "Konfiguratsiya", priority: "Oʻrta", status: "done", due: "2026-04-09", assignee: "u4", findings: 1, files: 1, kpi: 5 },
  { id: "T-208", auditId: "AUD-2026-013", title: "Antivirus va endpoint xavfsizligi", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-04-10", assignee: "u3", findings: 0, files: 1, kpi: 3 },
  { id: "T-209", auditId: "AUD-2026-013", title: "DB slow query log tahlili", type: "Log", priority: "Past", status: "done", due: "2026-04-11", assignee: "u9", findings: 0, files: 1, kpi: 3 },
  { id: "T-210", auditId: "AUD-2026-013", title: "CI/CD quvur xavfsizligi tekshiruvi", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-04-14", assignee: "u4", findings: 2, files: 2, kpi: 8 },
  { id: "T-211", auditId: "AUD-2026-013", title: "Jenkins/GitLab maxfiy kalit boshqaruvi", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-04-15", assignee: "u3", findings: 3, files: 1, kpi: 10 },
  { id: "T-212", auditId: "AUD-2026-013", title: "Container image xavfsizlik skaneri", type: "Skaner", priority: "Oʻrta", status: "done", due: "2026-04-16", assignee: "u9", findings: 1, files: 1, kpi: 5 },
  { id: "T-213", auditId: "AUD-2026-013", title: "Kubernetes RBAC konfiguratsiyasi", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-04-17", assignee: "u4", findings: 2, files: 2, kpi: 7 },
  { id: "T-214", auditId: "AUD-2026-013", title: "Tarmoq segmentatsiyasi — DB izolyatsiyasi", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-04-18", assignee: "u3", findings: 1, files: 1, kpi: 5 },
  { id: "T-215", auditId: "AUD-2026-013", title: "Parol siyosati — barcha xizmat hisoblari", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-04-21", assignee: "u9", findings: 1, files: 1, kpi: 5 },
  { id: "T-216", auditId: "AUD-2026-013", title: "Nessus skaneri — loyiha infratuzilmasi", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-04-22", assignee: "u4", findings: 4, files: 3, kpi: 10 },
  { id: "T-217", auditId: "AUD-2026-013", title: "Web API autentifikatsiya tekshiruvi", type: "Web audit", priority: "Oʻrta", status: "done", due: "2026-04-23", assignee: "u3", findings: 1, files: 1, kpi: 5 },
  { id: "T-218", auditId: "AUD-2026-013", title: "Log monitoring va SIEM integratsiya", type: "Log", priority: "Oʻrta", status: "done", due: "2026-04-24", assignee: "u9", findings: 0, files: 1, kpi: 3 },
  { id: "T-219", auditId: "AUD-2026-013", title: "Incident response tartibini baholash", type: "Hujjat", priority: "Past", status: "done", due: "2026-04-25", assignee: "u4", findings: 0, files: 2, kpi: 3 },
  { id: "T-220", auditId: "AUD-2026-013", title: "Zararli dastur tahlili — sandboxda tekshirish", type: "Log", priority: "Oʻrta", status: "done", due: "2026-04-28", assignee: "u3", findings: 1, files: 2, kpi: 5 },
  { id: "T-221", auditId: "AUD-2026-013", title: "Xodimlar kirishini boshqarish (IAM) auditi", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-04-29", assignee: "u9", findings: 2, files: 1, kpi: 7 },
  { id: "T-222", auditId: "AUD-2026-013", title: "Fizik kirishni boshqarish tekshiruvi", type: "Hujjat", priority: "Past", status: "done", due: "2026-04-30", assignee: "u4", findings: 0, files: 1, kpi: 3 },
  { id: "T-223", auditId: "AUD-2026-013", title: "Maxfiy maʼlumotlar klassifikatsiyasi", type: "Hujjat", priority: "Oʻrta", status: "done", due: "2026-05-05", assignee: "u3", findings: 0, files: 2, kpi: 3 },
  { id: "T-224", auditId: "AUD-2026-013", title: "Yakuniy hisobot — texnik qism", type: "Hisobot", priority: "Yuqori", status: "in_progress", due: "2026-05-17", assignee: "u4", findings: 0, files: 1, kpi: 0 },
  { id: "T-225", auditId: "AUD-2026-013", title: "Remediation rejasi — tavsiyalar ro'yxati", type: "Hisobot", priority: "Oʻrta", status: "new", due: "2026-05-18", assignee: "u9", findings: 0, files: 0, kpi: 0 },

  // AUD-2026-012 — Markaziy bank mobil bank pentest (22 tasks: 9 done, 8 in_progress, 1 blocked, 4 new)
  { id: "T-226", auditId: "AUD-2026-012", title: "iOS ilovasi statik tahlil (MobSF)", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-05-08", assignee: "u8", findings: 3, files: 2, kpi: 10 },
  { id: "T-227", auditId: "AUD-2026-012", title: "Android ilovasi statik tahlil (MobSF)", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-05-08", assignee: "u5", findings: 2, files: 2, kpi: 8 },
  { id: "T-228", auditId: "AUD-2026-012", title: "Backend API autentifikatsiya testi", type: "Web audit", priority: "Yuqori", status: "done", due: "2026-05-10", assignee: "u6", findings: 2, files: 1, kpi: 8 },
  { id: "T-229", auditId: "AUD-2026-012", title: "JWT token xavfsizligi tekshiruvi", type: "Web audit", priority: "Yuqori", status: "done", due: "2026-05-12", assignee: "u8", findings: 1, files: 1, kpi: 5 },
  { id: "T-230", auditId: "AUD-2026-012", title: "SSL pinning bypass sinovi (iOS)", type: "Mobil ilova", priority: "Yuqori", status: "done", due: "2026-05-13", assignee: "u5", findings: 1, files: 1, kpi: 7 },
  { id: "T-231", auditId: "AUD-2026-012", title: "SSL pinning bypass sinovi (Android)", type: "Mobil ilova", priority: "Yuqori", status: "done", due: "2026-05-13", assignee: "u6", findings: 1, files: 1, kpi: 7 },
  { id: "T-232", auditId: "AUD-2026-012", title: "Lokal saqlash xavfsizligi (Keychain/SharedPrefs)", type: "Mobil ilova", priority: "Oʻrta", status: "done", due: "2026-05-14", assignee: "u8", findings: 2, files: 2, kpi: 7 },
  { id: "T-233", auditId: "AUD-2026-012", title: "API rate limiting va brute force himoyasi", type: "Web audit", priority: "Oʻrta", status: "done", due: "2026-05-15", assignee: "u5", findings: 1, files: 1, kpi: 5 },
  { id: "T-234", auditId: "AUD-2026-012", title: "Frida dinamik instrumentatsiya — iOS", type: "Mobil ilova", priority: "Yuqori", status: "done", due: "2026-05-15", assignee: "u6", findings: 2, files: 2, kpi: 8 },
  { id: "T-235", auditId: "AUD-2026-012", title: "API business logic zaifliklarini tekshirish", type: "Web audit", priority: "Yuqori", status: "in_progress", due: "2026-05-20", assignee: "u8", findings: 1, files: 1, kpi: 0 },
  { id: "T-236", auditId: "AUD-2026-012", title: "Frida dinamik instrumentatsiya — Android", type: "Mobil ilova", priority: "Yuqori", status: "in_progress", due: "2026-05-21", assignee: "u5", findings: 0, files: 1, kpi: 0 },
  { id: "T-237", auditId: "AUD-2026-012", title: "OTP mexanizmi xavfsizligi tekshiruvi", type: "Web audit", priority: "Yuqori", status: "in_progress", due: "2026-05-22", assignee: "u6", findings: 1, files: 0, kpi: 0 },
  { id: "T-238", auditId: "AUD-2026-012", title: "Toʻlov API — parametr manipulyatsiya testi", type: "Web audit", priority: "Yuqori", status: "in_progress", due: "2026-05-23", assignee: "u8", findings: 0, files: 0, kpi: 0 },
  { id: "T-239", auditId: "AUD-2026-012", title: "Deep link va intent injection tekshiruvi", type: "Mobil ilova", priority: "Oʻrta", status: "in_progress", due: "2026-05-24", assignee: "u5", findings: 0, files: 0, kpi: 0 },
  { id: "T-240", auditId: "AUD-2026-012", title: "Network trafik tahlili (Burp Suite)", type: "Trafik", priority: "Oʻrta", status: "in_progress", due: "2026-05-24", assignee: "u6", findings: 1, files: 1, kpi: 0 },
  { id: "T-241", auditId: "AUD-2026-012", title: "Android root detection bypass", type: "Mobil ilova", priority: "Oʻrta", status: "in_progress", due: "2026-05-25", assignee: "u8", findings: 0, files: 0, kpi: 0 },
  { id: "T-242", auditId: "AUD-2026-012", title: "Kriptografik algoritm tekshiruvi", type: "Konfiguratsiya", priority: "Oʻrta", status: "in_progress", due: "2026-05-26", assignee: "u5", findings: 0, files: 0, kpi: 0 },
  { id: "T-243", auditId: "AUD-2026-012", title: "iOS jailbreak detection bypass", type: "Mobil ilova", priority: "Yuqori", status: "blocked", due: "2026-05-22", assignee: "u6", findings: 0, files: 0, kpi: 0 },
  { id: "T-244", auditId: "AUD-2026-012", title: "Session management tekshiruvi", type: "Web audit", priority: "Oʻrta", status: "new", due: "2026-05-28", assignee: "u8", findings: 0, files: 0, kpi: 0 },
  { id: "T-245", auditId: "AUD-2026-012", title: "Zaif kriptografiya (MD5/SHA1) aniqlash", type: "Konfiguratsiya", priority: "Oʻrta", status: "new", due: "2026-05-29", assignee: "u5", findings: 0, files: 0, kpi: 0 },
  { id: "T-246", auditId: "AUD-2026-012", title: "Serverda debug mode va xato xabarlari", type: "Konfiguratsiya", priority: "Past", status: "new", due: "2026-05-30", assignee: "u6", findings: 0, files: 0, kpi: 0 },
  { id: "T-247", auditId: "AUD-2026-012", title: "Yakuniy hisobot — pentest natijalar", type: "Hisobot", priority: "Yuqori", status: "new", due: "2026-06-10", assignee: "u8", findings: 0, files: 0, kpi: 0 },

  // AUD-2026-011 — Davlat xizmatlari agentligi pre-prod (31 tasks: 31 done)
  { id: "T-248", auditId: "AUD-2026-011", title: "Pre-prod tarmoq diagrammasini tekshirish", type: "Hujjat", priority: "Oʻrta", status: "done", due: "2026-02-20", assignee: "u3", findings: 0, files: 1, kpi: 3 },
  { id: "T-249", auditId: "AUD-2026-011", title: "Firewall qoidalari — pre-prod perimeter", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-02-22", assignee: "u4", findings: 1, files: 2, kpi: 5 },
  { id: "T-250", auditId: "AUD-2026-011", title: "Ilova serverlari OS versiyasi", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-02-24", assignee: "u7", findings: 1, files: 1, kpi: 5 },
  { id: "T-251", auditId: "AUD-2026-011", title: "Nessus skaneri — pre-prod subnet", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-02-25", assignee: "u10", findings: 2, files: 3, kpi: 10 },
  { id: "T-252", auditId: "AUD-2026-011", title: "Web ilova OWASP ZAP skaneri", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-02-28", assignee: "u3", findings: 2, files: 2, kpi: 8 },
  { id: "T-253", auditId: "AUD-2026-011", title: "Autentifikatsiya va avtorizatsiya tekshiruvi", type: "Web audit", priority: "Yuqori", status: "done", due: "2026-03-01", assignee: "u4", findings: 1, files: 1, kpi: 5 },
  { id: "T-254", auditId: "AUD-2026-011", title: "Parol siyosati va 2FA tekshiruvi", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-03-03", assignee: "u7", findings: 1, files: 1, kpi: 5 },
  { id: "T-255", auditId: "AUD-2026-011", title: "SSH kalit boshqaruvi tekshiruvi", type: "Konfiguratsiya", priority: "Oʻrta", status: "done", due: "2026-03-04", assignee: "u10", findings: 0, files: 1, kpi: 3 },
  { id: "T-256", auditId: "AUD-2026-011", title: "CI/CD pipeline xavfsizligi", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-03-05", assignee: "u3", findings: 2, files: 2, kpi: 7 },
  { id: "T-257", auditId: "AUD-2026-011", title: "Docker image zaiflik skaneri", type: "Skaner", priority: "Oʻrta", status: "done", due: "2026-03-07", assignee: "u4", findings: 1, files: 1, kpi: 5 },
  { id: "T-258", auditId: "AUD-2026-011", title: "API gateway konfiguratsiyasi tekshiruvi", type: "Konfiguratsiya", priority: "Oʻrta", status: "done", due: "2026-03-08", assignee: "u7", findings: 0, files: 1, kpi: 3 },
  { id: "T-259", auditId: "AUD-2026-011", title: "Maxfiy kalitlar va env oʻzgaruvchilar auditi", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-03-10", assignee: "u10", findings: 2, files: 2, kpi: 8 },
  { id: "T-260", auditId: "AUD-2026-011", title: "DB xavfsizlik sozlamalari tekshiruvi", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-03-11", assignee: "u3", findings: 1, files: 1, kpi: 5 },
  { id: "T-261", auditId: "AUD-2026-011", title: "Log yozuv va monitoring tekshiruvi", type: "Log", priority: "Oʻrta", status: "done", due: "2026-03-12", assignee: "u4", findings: 0, files: 1, kpi: 3 },
  { id: "T-262", auditId: "AUD-2026-011", title: "CORS va CSP sozlamalari tekshiruvi", type: "Web audit", priority: "Oʻrta", status: "done", due: "2026-03-14", assignee: "u7", findings: 1, files: 1, kpi: 5 },
  { id: "T-263", auditId: "AUD-2026-011", title: "Zaxira tizimi ishonchliligi tekshiruvi", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-03-15", assignee: "u10", findings: 0, files: 1, kpi: 3 },
  { id: "T-264", auditId: "AUD-2026-011", title: "Tarmoq monitoring — NetFlow tahlili", type: "Trafik", priority: "Past", status: "done", due: "2026-03-17", assignee: "u3", findings: 0, files: 1, kpi: 3 },
  { id: "T-265", auditId: "AUD-2026-011", title: "Xodimlar kirishini boshqarish tekshiruvi", type: "Tizim audit", priority: "Oʻrta", status: "done", due: "2026-03-18", assignee: "u4", findings: 1, files: 1, kpi: 5 },
  { id: "T-266", auditId: "AUD-2026-011", title: "Shifrlash — tranzit va saqlash", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-03-19", assignee: "u7", findings: 1, files: 1, kpi: 5 },
  { id: "T-267", auditId: "AUD-2026-011", title: "Kubernetes pod xavfsizlik siyosati", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-03-21", assignee: "u10", findings: 1, files: 2, kpi: 7 },
  { id: "T-268", auditId: "AUD-2026-011", title: "Pentesting — ilova qatlami (manual)", type: "Web audit", priority: "Yuqori", status: "done", due: "2026-03-22", assignee: "u3", findings: 2, files: 2, kpi: 8 },
  { id: "T-269", auditId: "AUD-2026-011", title: "SQL injection tekshiruvi (sqlmap)", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-03-24", assignee: "u4", findings: 1, files: 1, kpi: 7 },
  { id: "T-270", auditId: "AUD-2026-011", title: "XSS zaifliklarini tekshirish", type: "Web audit", priority: "Oʻrta", status: "done", due: "2026-03-25", assignee: "u7", findings: 0, files: 1, kpi: 3 },
  { id: "T-271", auditId: "AUD-2026-011", title: "Nmapdagi portlar tahlili (to'liq)", type: "Skaner", priority: "Oʻrta", status: "done", due: "2026-03-26", assignee: "u10", findings: 0, files: 1, kpi: 3 },
  { id: "T-272", auditId: "AUD-2026-011", title: "Sosial muhandislik testini baholash", type: "Hujjat", priority: "Past", status: "done", due: "2026-03-28", assignee: "u3", findings: 0, files: 1, kpi: 3 },
  { id: "T-273", auditId: "AUD-2026-011", title: "DR (disaster recovery) test protokoli", type: "Hujjat", priority: "Oʻrta", status: "done", due: "2026-03-29", assignee: "u4", findings: 0, files: 2, kpi: 3 },
  { id: "T-274", auditId: "AUD-2026-011", title: "Xavfsizlik siyosati hujjatlarini tekshirish", type: "Hujjat", priority: "Past", status: "done", due: "2026-04-01", assignee: "u7", findings: 0, files: 3, kpi: 3 },
  { id: "T-275", auditId: "AUD-2026-011", title: "Remediation tekshiruvi — CVE patchlar", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-04-10", assignee: "u10", findings: 0, files: 1, kpi: 5 },
  { id: "T-276", auditId: "AUD-2026-011", title: "Finding'lar yopilganligini tasdiqlash", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-04-15", assignee: "u3", findings: 0, files: 2, kpi: 5 },
  { id: "T-277", auditId: "AUD-2026-011", title: "Yakuniy texnik hisobot yozish", type: "Hisobot", priority: "Yuqori", status: "done", due: "2026-04-22", assignee: "u4", findings: 0, files: 3, kpi: 8 },
  { id: "T-278", auditId: "AUD-2026-011", title: "Boshqaruv xulosasi (executive summary)", type: "Hisobot", priority: "Yuqori", status: "done", due: "2026-04-28", assignee: "u3", findings: 0, files: 2, kpi: 8 },

  // AUD-2026-010 — Energiya vazirligi OT/SCADA (14 tasks: 1 done, 13 new)
  { id: "T-279", auditId: "AUD-2026-010", title: "OT/SCADA tarmoq diagrammasini yigʻish", type: "Hujjat", priority: "Yuqori", status: "done", due: "2026-05-25", assignee: "u10", findings: 0, files: 1, kpi: 3 },
  { id: "T-280", auditId: "AUD-2026-010", title: "SCADA HMI versiyasi va patch holati", type: "Tizim audit", priority: "Yuqori", status: "new", due: "2026-05-28", assignee: "u8", findings: 0, files: 0, kpi: 0 },
  { id: "T-281", auditId: "AUD-2026-010", title: "OT va IT tarmoq segmentatsiya tekshiruvi", type: "Konfiguratsiya", priority: "Yuqori", status: "new", due: "2026-05-30", assignee: "u10", findings: 0, files: 0, kpi: 0 },
  { id: "T-282", auditId: "AUD-2026-010", title: "GRASSMARLIN bilan tarmoq topologiyasini aniqlash", type: "Skaner", priority: "Yuqori", status: "new", due: "2026-06-02", assignee: "u9", findings: 0, files: 0, kpi: 0 },
  { id: "T-283", auditId: "AUD-2026-010", title: "Firewall qoidalari — DMZ va OT segmenti", type: "Konfiguratsiya", priority: "Yuqori", status: "new", due: "2026-06-04", assignee: "u8", findings: 0, files: 0, kpi: 0 },
  { id: "T-284", auditId: "AUD-2026-010", title: "Masofaviy kirish (VPN/RDP) audit — SCADA", type: "Konfiguratsiya", priority: "Yuqori", status: "new", due: "2026-06-05", assignee: "u10", findings: 0, files: 0, kpi: 0 },
  { id: "T-285", auditId: "AUD-2026-010", title: "Parol siyosati — operator hisoblari", type: "Tizim audit", priority: "Oʻrta", status: "new", due: "2026-06-07", assignee: "u9", findings: 0, files: 0, kpi: 0 },
  { id: "T-286", auditId: "AUD-2026-010", title: "USB port boshqaruvini tekshirish (endpoint)", type: "Konfiguratsiya", priority: "Oʻrta", status: "new", due: "2026-06-09", assignee: "u8", findings: 0, files: 0, kpi: 0 },
  { id: "T-287", auditId: "AUD-2026-010", title: "Nmap passive scan — OT qurilmalar", type: "Skaner", priority: "Yuqori", status: "new", due: "2026-06-10", assignee: "u10", findings: 0, files: 0, kpi: 0 },
  { id: "T-288", auditId: "AUD-2026-010", title: "PLC/RTU firmware versiyalarini yigʻish", type: "Tizim audit", priority: "Oʻrta", status: "new", due: "2026-06-12", assignee: "u9", findings: 0, files: 0, kpi: 0 },
  { id: "T-289", auditId: "AUD-2026-010", title: "Wireshark — OT protokol tahlili (Modbus/DNP3)", type: "Trafik", priority: "Yuqori", status: "new", due: "2026-06-14", assignee: "u8", findings: 0, files: 0, kpi: 0 },
  { id: "T-290", auditId: "AUD-2026-010", title: "Antivirus — industrial PC va HMI", type: "Tizim audit", priority: "Oʻrta", status: "new", due: "2026-06-16", assignee: "u10", findings: 0, files: 0, kpi: 0 },
  { id: "T-291", auditId: "AUD-2026-010", title: "Zaxira va tiklanish rejasini tekshirish", type: "Hujjat", priority: "Oʻrta", status: "new", due: "2026-06-18", assignee: "u9", findings: 0, files: 0, kpi: 0 },
  { id: "T-292", auditId: "AUD-2026-010", title: "IEC 62443 talablari bo'yicha gap tahlili", type: "Hujjat", priority: "Yuqori", status: "new", due: "2026-07-01", assignee: "u8", findings: 0, files: 0, kpi: 0 },

  // AUD-2026-009 — Toshkent hokimligi web portfolio (18 tasks: 13 done, 4 in_progress, 1 blocked)
  { id: "T-293", auditId: "AUD-2026-009", title: "Public web saytlar reestri tuzish", type: "Hujjat", priority: "Oʻrta", status: "done", due: "2026-03-05", assignee: "u5", findings: 0, files: 1, kpi: 3 },
  { id: "T-294", auditId: "AUD-2026-009", title: "DNS konfiguratsiya tekshiruvi (SPF/DKIM/DMARC)", type: "Konfiguratsiya", priority: "Oʻrta", status: "done", due: "2026-03-06", assignee: "u6", findings: 1, files: 1, kpi: 5 },
  { id: "T-295", auditId: "AUD-2026-009", title: "SSL/TLS sertifikat va konfiguratsiya auditi", type: "Konfiguratsiya", priority: "Yuqori", status: "done", due: "2026-03-07", assignee: "u9", findings: 1, files: 1, kpi: 5 },
  { id: "T-296", auditId: "AUD-2026-009", title: "Nikto — web server zaiflik skaneri", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-03-10", assignee: "u5", findings: 2, files: 2, kpi: 7 },
  { id: "T-297", auditId: "AUD-2026-009", title: "OWASP ZAP — active scan barcha saytlar", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-03-12", assignee: "u6", findings: 3, files: 3, kpi: 10 },
  { id: "T-298", auditId: "AUD-2026-009", title: "CMS versiyasi va plugin zaifliklarini aniqlash", type: "Tizim audit", priority: "Yuqori", status: "done", due: "2026-03-14", assignee: "u9", findings: 2, files: 2, kpi: 8 },
  { id: "T-299", auditId: "AUD-2026-009", title: "Autentifikatsiya tekshiruvi (admin panel)", type: "Web audit", priority: "Yuqori", status: "done", due: "2026-03-15", assignee: "u5", findings: 1, files: 1, kpi: 5 },
  { id: "T-300", auditId: "AUD-2026-009", title: "SQL injection tekshiruvi (sqlmap)", type: "Skaner", priority: "Yuqori", status: "done", due: "2026-03-17", assignee: "u6", findings: 1, files: 1, kpi: 7 },
  { id: "T-301", auditId: "AUD-2026-009", title: "XSS va CSRF zaifliklarini tekshirish", type: "Web audit", priority: "Oʻrta", status: "done", due: "2026-03-18", assignee: "u9", findings: 2, files: 2, kpi: 7 },
  { id: "T-302", auditId: "AUD-2026-009", title: "HTTP xavfsizlik sarlavhalari tekshiruvi", type: "Konfiguratsiya", priority: "Oʻrta", status: "done", due: "2026-03-20", assignee: "u5", findings: 1, files: 1, kpi: 5 },
  { id: "T-303", auditId: "AUD-2026-009", title: "Ochiq portlar va xizmatlar inventari", type: "Skaner", priority: "Oʻrta", status: "done", due: "2026-03-21", assignee: "u6", findings: 1, files: 1, kpi: 5 },
  { id: "T-304", auditId: "AUD-2026-009", title: "Fayl yuklash zaifliklarini tekshirish", type: "Web audit", priority: "Oʻrta", status: "done", due: "2026-03-24", assignee: "u9", findings: 0, files: 1, kpi: 3 },
  { id: "T-305", auditId: "AUD-2026-009", title: "IDOR va avtorizatsiya zaifliklarini tekshirish", type: "Web audit", priority: "Yuqori", status: "done", due: "2026-03-25", assignee: "u5", findings: 1, files: 1, kpi: 5 },
  { id: "T-306", auditId: "AUD-2026-009", title: "Finding'larni tekshirish va tasdiqlash", type: "Tizim audit", priority: "Yuqori", status: "in_progress", due: "2026-04-10", assignee: "u6", findings: 0, files: 1, kpi: 0 },
  { id: "T-307", auditId: "AUD-2026-009", title: "Remediation tavsiyalar ro'yxati tuzish", type: "Hisobot", priority: "Yuqori", status: "in_progress", due: "2026-04-11", assignee: "u9", findings: 0, files: 0, kpi: 0 },
  { id: "T-308", auditId: "AUD-2026-009", title: "Yakuniy hisobotni tahrirlash", type: "Hisobot", priority: "Yuqori", status: "in_progress", due: "2026-04-12", assignee: "u5", findings: 0, files: 1, kpi: 0 },
  { id: "T-309", auditId: "AUD-2026-009", title: "CMS patch qilinganini tekshirish (retest)", type: "Tizim audit", priority: "Oʻrta", status: "in_progress", due: "2026-04-13", assignee: "u6", findings: 0, files: 0, kpi: 0 },
  { id: "T-310", auditId: "AUD-2026-009", title: "Server backup sozlamalari auditi", type: "Tizim audit", priority: "Oʻrta", status: "blocked", due: "2026-04-08", assignee: "u9", findings: 0, files: 0, kpi: 0 },
];

export const TASK_STATUS: Record<TaskStatus, { label: string; tone: Tone }> = {
  new: { label: "Yangi", tone: "neutral" },
  assigned: { label: "Tayinlangan", tone: "info" },
  in_progress: { label: "Jarayonda", tone: "info" },
  review: { label: "Guruh rahbari tekshiruvida", tone: "warning" },
  review_head: { label: "Rahbar tekshiruvida", tone: "warning" },
  returned: { label: "Qaytarilgan", tone: "danger" },
  done: { label: "Bajarilgan", tone: "success" },
  blocked: { label: "Blok", tone: "danger" },
};

// ---------- Findings ----------
export const FINDINGS: Finding[] = [
  { id: "F-2026-0341", auditId: "AUD-2026-014", taskId: "T-114", title: "Internal segment 10.0.0.0/8 ga toʻliq ruxsat berilgan", severity: "critical", cvss: 9.1, status: "approved", reportedBy: "u6", date: "2026-05-18", asset: "FW-CORE-01", type: "Konfiguratsiya kamchiligi", cwe: "CWE-284", description: "Asosiy firewall qoidalarida 10.0.0.0/8 manzilidan barcha portlarga TCP+UDP ruxsat berilgan. Bu segmentatsiya prinsiplariga zid keladi.", evidence: 3, ai: true },
  { id: "F-2026-0342", auditId: "AUD-2026-014", taskId: "T-115", title: "AD parol siyosati — minimum 6 belgi, history off", severity: "high", cvss: 7.4, status: "review", reportedBy: "u7", date: "2026-05-19", asset: "DC-01.gov.uz", type: "Tizim sozlamasi", cwe: "CWE-521", description: "Domen parol siyosati — minimum uzunlik 6 belgi, parol tarixi yoqilmagan, lockout = 0 (cheklov yoʻq). Brute force xavfi yuqori.", evidence: 2, ai: true },
  { id: "F-2026-0343", auditId: "AUD-2026-014", taskId: "T-116", title: "Apache 2.4.41 — CVE-2023-25690 (mod_proxy SSRF)", severity: "critical", cvss: 9.8, status: "approved", reportedBy: "u4", date: "2026-05-15", asset: "web-prod-03", type: "CVE / patch", cwe: "CWE-444", description: "Apache HTTP Server 2.4.41 versiyasida mod_proxy modulida HTTP request smuggling zaifligi mavjud. Patch chiqarilgan: 2.4.56.", evidence: 4, ai: true },
  { id: "F-2026-0344", auditId: "AUD-2026-014", taskId: "T-122", title: "Suricata IPS — 47 nomaʼlum imzo, oxirgi update 2025-12", severity: "high", cvss: 7.0, status: "approved", reportedBy: "u6", date: "2026-05-17", asset: "IPS-EDGE-01", type: "Operatsion kamchilik", cwe: "CWE-1053", description: "IDS/IPS qurilmasida imzolar oxirgi marta 2025-yil dekabrida yangilangan. Yangi C2 va exploitlar eʼtibordan chetda.", evidence: 2, ai: true },
  { id: "F-2026-0345", auditId: "AUD-2026-014", taskId: "T-117", title: "DNS tunneling — uzoq subdomain soʻrovlar (24 soatda 18,400)", severity: "high", cvss: 8.1, status: "review", reportedBy: "u3", date: "2026-05-20", asset: "10.10.42.16", type: "Trafik anomaliya", cwe: "CWE-200", description: "Bir endpoint 24 soat ichida 18,400 ta noyob, uzun (>50 belgi) subdomain soʻrovi yubordi. Klassik DNS tunneling/exfiltration belgisi.", evidence: 3, ai: true },
  { id: "F-2026-0346", auditId: "AUD-2026-014", taskId: "T-123", title: "Login forma — SQL injection (POST /api/v1/login)", severity: "critical", cvss: 9.4, status: "approved", reportedBy: "u4", date: "2026-05-16", asset: "portal.gov.uz", type: "Web zaiflik", cwe: "CWE-89", description: "Login endpoint username parametrida UNION-based SQL injection. Maʼlumotlar bazasini toʻliq dump qilish mumkin.", evidence: 5, ai: true },
  { id: "F-2026-0347", auditId: "AUD-2026-014", taskId: "T-114", title: "Telnet (port 23) ochiq — 12 ta network qurilmada", severity: "high", cvss: 7.5, status: "approved", reportedBy: "u6", date: "2026-05-19", asset: "Network range", type: "Konfiguratsiya kamchiligi", cwe: "CWE-319", description: "12 ta switch va router qurilmasida Telnet xizmati yoqilgan. SSH-only siyosati buzilgan.", evidence: 1, ai: true },
  { id: "F-2026-0348", auditId: "AUD-2026-014", taskId: "T-119", title: "SMBv1 yoqilgan — 4 ta server", severity: "medium", cvss: 5.3, status: "approved", reportedBy: "u4", date: "2026-05-18", asset: "Server farm", type: "Operatsion kamchilik", cwe: "CWE-326", description: "SMBv1 yoqilgan, EternalBlue/Wannacry kabi exploit vektorlariga ochiq.", evidence: 2, ai: false },
  { id: "F-2026-0349", auditId: "AUD-2026-014", taskId: "T-119", title: "RDP — 0.0.0.0 ga ochiq, NLA off (3 server)", severity: "medium", cvss: 5.8, status: "review", reportedBy: "u4", date: "2026-05-18", asset: "Server farm", type: "Tizim sozlamasi", cwe: "CWE-287", description: "RDP servisi internetga (yoki keng segmentga) ochiq, Network Level Authentication (NLA) oʻchiq.", evidence: 1, ai: false },
  { id: "F-2026-0350", auditId: "AUD-2026-014", taskId: "T-125", title: "Switch ACL — \"any any permit\" oxirgi qoida sifatida", severity: "low", cvss: 3.4, status: "review", reportedBy: "u6", date: "2026-05-20", asset: "SW-CORE-02", type: "Konfiguratsiya kamchiligi", cwe: "CWE-732", description: "Core switch ACL roʻyxatlarida default deny oʻrniga \"any any permit\" yakuniy qoida sifatida ishlatilgan.", evidence: 1, ai: false },
];

export const SEV_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

// ---------- KPI ----------
export const KPI_RULES: KpiRule[] = [
  { code: "act_as_group_lead",      label: "Audit guruhi rahbari sifatida",          points: 15 },
  { code: "develop_project",        label: "Audit loyihasini ishlab chiqish",         points: 15 },
  { code: "assign_tasks_correctly", label: "Vazifalarni toʻgʻri taqsimlash",         points: 10 },
  { code: "act_as_auditor",         label: "Auditor sifatida qatnashish",            points: 10 },
  { code: "vuln_critical_bonus",    label: "Critical zaiflik qoʻshimcha",            points: 10 },
  { code: "traffic_analysis",       label: "Trafik tahlilini bajarish",              points: 7 },
  { code: "vuln_high_bonus",        label: "High zaiflik qoʻshimcha",               points: 7 },
  { code: "audit_participation",    label: "Auditda ishtirok etish",                 points: 5 },
  { code: "task_completed",         label: "Har bir bajarilgan vazifa",              points: 5 },
  { code: "task_on_time",           label: "Vazifani muddatida bajarish",            points: 5 },
  { code: "config_analysis",        label: "Konfiguratsiya fayli tahlili",           points: 5 },
  { code: "scanner_import",         label: "Skaner natijasini import va tahlil",     points: 5 },
  { code: "report_section",         label: "Hisobotga texnik xulosa",               points: 5 },
  { code: "vuln_medium_bonus",      label: "Medium zaiflik qoʻshimcha",             points: 4 },
  { code: "vuln_approved",          label: "Tasdiqlangan zaiflik (har biri)",        points: 3 },
  { code: "vuln_low_bonus",         label: "Low zaiflik qoʻshimcha",                points: 1 },
  { code: "vuln_returned",          label: "Qayta ishlashga qaytarilgan zaiflik",   points: -2 },
  { code: "vuln_rejected",          label: "Notoʻgʻri kiritilgan zaiflik",          points: -3 },
  { code: "task_overdue",           label: "Vazifani kechiktirish",                 points: -5 },
];

export const KPI_USERS: KpiUser[] = [
  { user: "u3",  audits: 4, tasks: 31, findings: 14, total: 287, delta: 18,  sparkline: [120, 145, 180, 210, 255, 287] },
  { user: "u4",  audits: 5, tasks: 28, findings: 22, total: 264, delta: 21,  sparkline: [110, 130, 165, 195, 230, 264] },
  { user: "u8",  audits: 3, tasks: 22, findings: 16, total: 218, delta: 12,  sparkline: [98, 124, 152, 180, 200, 218] },
  { user: "u10", audits: 3, tasks: 19, findings: 11, total: 196, delta: 9,   sparkline: [85, 102, 128, 155, 180, 196] },
  { user: "u6",  audits: 4, tasks: 26, findings: 18, total: 188, delta: 14,  sparkline: [76, 99, 121, 148, 172, 188] },
  { user: "u7",  audits: 3, tasks: 21, findings: 9,  total: 162, delta: 6,   sparkline: [68, 86, 110, 134, 152, 162] },
  { user: "u5",  audits: 3, tasks: 17, findings: 7,  total: 138, delta: 3,   sparkline: [62, 78, 95, 110, 128, 138] },
  { user: "u9",  audits: 2, tasks: 12, findings: 6,  total: 96,  delta: -2,  sparkline: [42, 58, 72, 84, 98, 96] },
  { user: "u1",  audits: 0, tasks: 0,  findings: 0,  total: 0,   delta: 0,   sparkline: [] },
  { user: "u2",  audits: 0, tasks: 0,  findings: 0,  total: 0,   delta: 0,   sparkline: [] },
];

// ---------- AI ----------
export const AI_CONVO: AiMessage[] = [
  { role: "system", time: "10:24", text: "Ollama lokal (qwen2.5:14b-instruct) ulanish: OK. Yopiq tarmoq." },
  { role: "user", who: "u3", time: "10:25", text: "F-2026-0341 va F-2026-0347 findinglariga executive summary tayyorla. Texnik boʻlmagan rahbariyat uchun, 5–6 jumla." },
  { role: "ai", time: "10:25", text: "Audit davomida tarmoq segmentatsiyasiga oid ikkita jiddiy kamchilik aniqlandi. Birinchidan, 10.0.0.0/8 ichki tarmoq segmentlari oʻrtasida hech qanday cheklov mavjud emas — bu hujumchi bitta tugunni egallaganda butun tashkilot ichida erkin harakatlanishi imkonini beradi. Ikkinchidan, oʻn ikkita tarmoq qurilmasida zamonaviy SSH oʻrniga Telnet xizmati hali ham yoqilgan; bu trafikka kim ulanishi mumkinligi va sniffing yoʻli bilan akkauntlarni ushlash xavfini keskin oshiradi. Tavsiya etiladi: birinchi navbatda kritik segmentlarni ajratish (firewall qoidalari), soʻngra Telnetni butunlay oʻchirib, faqat SSHv2 + kalit asosida autentifikatsiyaga oʻtish." },
  { role: "user", who: "u3", time: "10:31", text: "Yaxshi. Endi yuqoridagi 2 ta finding uchun remediation plan (action items, owner, ETA) yarat." },
  { role: "ai", time: "10:31", text: "Remediation rejasi tayyor — 4 ta amal, jami muddati 14 ish kuni. Tafsilotlar pastdagi blokda.", attach: "plan" },
];

// ---------- Tokens ----------
export const TOKENS: AuditToken[] = [
  { id: "tk_a91x...c47e", audit: "AUD-2026-014", user: "u6", device: "DESKTOP-MS-NB14", hostname: "ms-laptop", os: "Windows 11 Pro 23H2", agent: "v1.2.4", ip: "10.20.4.142", issued: "2026-05-15 09:12", expires: "2026-05-31 18:00", status: "active", lastUsed: "12 min", tasks: 6 },
  { id: "tk_b27p...f10a", audit: "AUD-2026-014", user: "u7", device: "DESKTOP-JT-22", hostname: "jasur-pc", os: "Windows 10 LTSC", agent: "v1.2.4", ip: "10.20.4.156", issued: "2026-05-15 09:14", expires: "2026-05-31 18:00", status: "active", lastUsed: "1 soat", tasks: 4 },
  { id: "tk_c63m...d92b", audit: "AUD-2026-014", user: "u4", device: "WS-SK-AUDIT", hostname: "sevara-ws", os: "Windows 11 Enterprise", agent: "v1.2.4", ip: "10.20.4.171", issued: "2026-05-15 09:14", expires: "2026-05-31 18:00", status: "active", lastUsed: "31 min", tasks: 8 },
  { id: "tk_d04q...e83c", audit: "AUD-2026-014", user: "u3", device: "BOSH-NB-01", hostname: "bobur-nb", os: "Windows 11 Pro", agent: "v1.2.4", ip: "10.20.4.188", issued: "2026-05-15 09:13", expires: "2026-05-31 18:00", status: "active", lastUsed: "5 daqiqa", tasks: 5 },
  { id: "tk_e88r...a15d", audit: "AUD-2026-013", user: "u9", device: "DESKTOP-SH-09", hostname: "sherzod-pc", os: "Windows 10 Pro 22H2", agent: "v1.2.3", ip: "10.20.4.203", issued: "2026-03-25 10:02", expires: "2026-05-18 18:00", status: "expired", lastUsed: "3 kun", tasks: 3 },
  { id: "tk_f12s...c54e", audit: "AUD-2026-011", user: "u10", device: "WS-LA-PRO", hostname: "lola-ws", os: "Windows 11 Pro", agent: "v1.2.4", ip: "10.20.4.212", issued: "2026-02-20 14:30", expires: "2026-04-30 18:00", status: "revoked", lastUsed: "2 hafta", tasks: 7 },
];

// ---------- Audit log ----------
export const LOGS: LogEntry[] = [
  { time: "10:42:14", user: "u4", action: "finding.create", entity: "F-2026-0349", ip: "10.20.4.171", device: "WS-SK-AUDIT", level: "info" },
  { time: "10:39:02", user: "u3", action: "ai.prompt", entity: "AUD-2026-014", ip: "10.20.4.188", device: "BOSH-NB-01", level: "info" },
  { time: "10:35:48", user: "u4", action: "task.update", entity: "T-123", ip: "10.20.4.171", device: "WS-SK-AUDIT", level: "info" },
  { time: "10:28:11", user: "u6", action: "agent.sync", entity: "AUD-2026-014", ip: "10.20.4.142", device: "DESKTOP-MS-NB14", level: "info" },
  { time: "10:22:55", user: "u7", action: "auth.login", entity: "—", ip: "10.20.4.156", device: "DESKTOP-JT-22", level: "info" },
  { time: "10:11:09", user: "u9", action: "auth.login.fail", entity: "—", ip: "10.20.4.203", device: "DESKTOP-SH-09", level: "warn" },
  { time: "09:58:42", user: "u3", action: "finding.approve", entity: "F-2026-0341", ip: "10.20.4.188", device: "BOSH-NB-01", level: "info" },
  { time: "09:54:30", user: "u3", action: "report.generate", entity: "AUD-2026-013", ip: "10.20.4.188", device: "BOSH-NB-01", level: "info" },
  { time: "09:42:18", user: "u2", action: "audit.approve", entity: "AUD-2026-011", ip: "10.20.4.110", device: "DESKTOP-DR-01", level: "info" },
  { time: "09:35:01", user: "u4", action: "token.issue", entity: "tk_b27p…f10a", ip: "10.20.4.171", device: "WS-SK-AUDIT", level: "info" },
  { time: "09:11:24", user: "u1", action: "settings.update", entity: "kpi.rules", ip: "10.20.4.99", device: "AY-OFFICE-01", level: "warn" },
  { time: "08:48:09", user: "u6", action: "token.use", entity: "tk_a91x…c47e", ip: "10.20.4.142", device: "DESKTOP-MS-NB14", level: "info" },
];

export const PERM_VALUES: Record<string, { label: string; className: string }> = {
  full: { label: "Toʻliq", className: "perm--full" },
  read: { label: "Koʻrish", className: "perm--read" },
  own: { label: "Oʻziga tegishli", className: "perm--partial" },
  no: { label: "Yoʻq", className: "perm--no" },
};

// ---------- Reports ----------
export const REPORTS: Report[] = [
  {
    id: "R-201",
    title: "Aloqa va kommunikatsiya vazirligi — yakuniy audit hisoboti",
    audit: "AUD-2026-014",
    type: "Audit hisoboti",
    status: "draft",
    generated: "—",
    size: "—",
    format: ["DOCX", "PDF"],
    author: "u3",
    approvalStage: null,
    summary: null,
  },
  {
    id: "R-200",
    title: "Aloqa vazirligi — Executive Summary",
    audit: "AUD-2026-014",
    type: "Executive summary",
    status: "draft",
    generated: "—",
    size: "—",
    format: ["PDF"],
    author: "u3",
    approvalStage: null,
    summary: null,
  },
  {
    id: "R-199",
    title: "Soliq qoʻmitasi — yakuniy hisobot",
    audit: "AUD-2026-013",
    type: "Audit hisoboti",
    status: "approved",
    generated: "2026-05-18 14:21",
    size: "4.2 MB",
    format: ["DOCX", "PDF", "HTML"],
    author: "u4",
    approvalStage: null,
    summary: null,
  },
  {
    id: "R-198",
    title: "Soliq qoʻmitasi — Remediation plan",
    audit: "AUD-2026-013",
    type: "Remediation plan",
    status: "approved",
    generated: "2026-05-18 14:24",
    size: "1.1 MB",
    format: ["DOCX", "PDF"],
    author: "u4",
    approvalStage: null,
    summary: null,
  },
  {
    id: "R-197",
    title: "Davlat xizmatlari agentligi — yakuniy hisobot",
    audit: "AUD-2026-011",
    type: "Audit hisoboti",
    status: "approved",
    generated: "2026-04-30 17:02",
    size: "5.8 MB",
    format: ["DOCX", "PDF"],
    author: "u3",
    approvalStage: null,
    summary: null,
  },
  {
    id: "R-196",
    title: "Markaziy bank — pentest oraliq hisoboti",
    audit: "AUD-2026-012",
    type: "Pentest hisoboti",
    status: "review",
    generated: "2026-05-20 11:05",
    size: "2.4 MB",
    format: ["DOCX", "PDF"],
    author: "u8",
    approvalStage: "head",
    summary: null,
  },
];

// ---------- Topology (AUD-2026-014) ----------
export const TOPOLOGY: Topology = {
  audit: "AUD-2026-014",
  nodes: [
    { id: "internet", label: "Internet", ip: "0.0.0.0/0", kind: "cloud", segment: "Tashqi", sev: "info", findings: 0 },
    { id: "fw", label: "FW-CORE-01", ip: "10.0.0.1", kind: "firewall", segment: "Perimetr", sev: "critical", findings: 2 },
    { id: "ips", label: "IPS-EDGE-01", ip: "10.0.0.5", kind: "ips", segment: "Perimetr", sev: "high", findings: 1 },
    { id: "vpn", label: "VPN-GW-01", ip: "10.0.0.9", kind: "vpn", segment: "Perimetr", sev: "medium", findings: 0 },
    { id: "swcore", label: "SW-CORE-02", ip: "10.0.0.2", kind: "switch", segment: "Yadro", sev: "low", findings: 1 },
    { id: "dc", label: "DC-01.gov.uz", ip: "10.10.1.10", kind: "server", segment: "Ichki tarmoq", sev: "high", findings: 1 },
    { id: "dmzsw", label: "SW-DMZ-01", ip: "10.20.0.2", kind: "switch", segment: "DMZ", sev: "info", findings: 0 },
    { id: "web", label: "web-prod-03", ip: "10.20.3.3", kind: "web", segment: "DMZ", sev: "critical", findings: 1 },
    { id: "portal", label: "portal.gov.uz", ip: "10.20.3.8", kind: "web", segment: "DMZ", sev: "critical", findings: 1 },
    { id: "dbfarm", label: "DB-FARM", ip: "10.30.1.0/24", kind: "db", segment: "Server farm", sev: "medium", findings: 2 },
    { id: "appsrv", label: "APP-SRV-01", ip: "10.30.1.6", kind: "server", segment: "Server farm", sev: "medium", findings: 0 },
    { id: "wifi", label: "WLC-01", ip: "10.40.0.4", kind: "wifi", segment: "Ichki tarmoq", sev: "low", findings: 0 },
    { id: "ep1", label: "MS-NB14", ip: "10.20.4.142", kind: "endpoint", segment: "Endpoint", sev: "info", findings: 0 },
    { id: "ep2", label: "10.10.42.16", ip: "10.10.42.16", kind: "endpoint", segment: "Endpoint", sev: "high", findings: 1 },
    { id: "sw2", label: "SW-ACC-07", ip: "10.10.0.7", kind: "switch", segment: "Ichki tarmoq", sev: "high", findings: 1 },
  ],
  edges: [
    { s: "internet", t: "fw" }, { s: "fw", t: "ips" }, { s: "fw", t: "vpn" }, { s: "fw", t: "swcore" },
    { s: "swcore", t: "dc" }, { s: "swcore", t: "dmzsw" }, { s: "swcore", t: "wifi" }, { s: "swcore", t: "sw2" },
    { s: "dmzsw", t: "web" }, { s: "dmzsw", t: "portal" }, { s: "swcore", t: "dbfarm" }, { s: "dbfarm", t: "appsrv" },
    { s: "sw2", t: "ep1" }, { s: "sw2", t: "ep2" }, { s: "dc", t: "ep2", flag: true }, { s: "web", t: "dbfarm", flag: true },
  ],
};

// ---------- Project approval (3-stage) ----------
export const PROJECT_APPROVAL: ProjectApproval = {
  stages: [
    { key: "group_lead", title: "Guruh rahbari", who: "u3", role: "Yuborish" },
    { key: "head", title: "Boʻlim boshligʻi", who: "u2", role: "Tasdiqlash" },
    { key: "dept", title: "Departament rahbari", who: "u1", role: "Yakuniy tasdiq" },
  ],
  timeline: [
    { who: "u3", action: "Loyihani yaratdi", stage: "group_lead", t: "2026-04-12 14:30", state: "done" },
    { who: "u3", action: "Tasdiqlashga yubordi", stage: "group_lead", t: "2026-04-13 09:14", state: "done", comment: "Doira va metodologiya yakunlandi, tasdiqqa tayyor." },
    { who: "u2", action: "Tasdiqladi", stage: "head", t: "2026-04-13 16:48", state: "done", comment: "Doira toʻgʻri. Departament tasdigʻiga yuboraman." },
  ],
  current: "dept",
};

// ---------- Helpers ----------
export function userById(id: string): User {
  return USERS.find((u) => u.id === id) ?? { id, name: id, role: "t1", title: "", avatar: "?", dept: "" };
}
export function orgById(id: string): Organization | undefined {
  return ORGS.find((o) => o.id === id);
}
export function orgDetail(id: string): OrgDetail | undefined {
  return ORG_DETAIL[id];
}
export function auditById(id: string): Audit | undefined {
  return AUDITS.find((a) => a.id === id);
}
export function findingsByAudit(id: string): Finding[] {
  return FINDINGS.filter((f) => f.auditId === id);
}
export function tasksByAudit(id: string): Task[] {
  return TASKS.filter((t) => t.auditId === id);
}
