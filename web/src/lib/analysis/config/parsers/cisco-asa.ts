import { firstMatch, scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

// Rules mirror the prototype's fw-core-01.cfg sample (gaps on lines 7/11/14/18).
const RULES: LineRule[] = [
  {
    match: /^\s*no security-level\b/,
    severity: "critical",
    title: "Interfeysda xavfsizlik darajasi belgilanmagan",
    description:
      "Interfeysda `no security-level` ishlatilgan — segmentatsiya buzilgan, ishonchsiz va ishonchli zonalar ajratilmagan.",
    cwe: "CWE-1188",
    recommendation:
      "Har bir interfeysga aniq `security-level` qiymatini belgilang (inside 100, outside 0).",
  },
  {
    match: /permit\s+(ip|tcp|udp)\s+any\s+any/,
    severity: "critical",
    title: "Juda keng ruxsat beruvchi ACL qoidasi (any any)",
    description:
      "ACL `permit ... any any` butun trafikka ruxsat beradi — minimal imtiyoz tamoyili buzilgan.",
    cwe: "CWE-284",
    recommendation: "ACL qoidalarini aniq manba/maqsad va portlar bilan cheklang.",
  },
  {
    match: /^\s*telnet\s+0\.0\.0\.0/,
    severity: "high",
    title: "Telnet barcha manzillarga ochiq",
    description:
      "`telnet 0.0.0.0` orqali boshqaruv barcha tarmoqlarga ochilgan; Telnet shifrlanmagan protokol.",
    cwe: "CWE-319",
    recommendation: "Telnetni o‘chiring va faqat SSHv2 hamda boshqaruv tarmog‘idan ruxsat bering.",
  },
  {
    match: /^\s*no logging trap\b/,
    severity: "medium",
    title: "Syslog (logging trap) o‘chirilgan",
    description:
      "`no logging trap` markaziy syslog yuborishni o‘chiradi — hodisalarni kuzatish imkonsiz.",
    cwe: "CWE-778",
    recommendation: "Markaziy syslog serverga `logging trap` darajasini yoqing.",
  },
];

export function parseCiscoAsa(content: string): ParseResult {
  return {
    vendor: "cisco_asa",
    hostname: firstMatch(content, /^hostname\s+(\S+)/m),
    model: "Cisco ASA",
    firmware: firstMatch(content, /ASA\s+(?:Version\s+)?([\d][\d.()]*)/),
    gaps: scanLineRules(content, RULES),
  };
}
