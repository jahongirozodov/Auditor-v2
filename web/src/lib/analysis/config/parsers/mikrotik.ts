import { firstMatch, scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /password=""/,
    severity: "critical",
    title: "Bo‘sh parolli foydalanuvchi",
    description: '`password=""` parolsiz hisobni bildiradi — qurilma to‘liq egallanishi mumkin.',
    cwe: "CWE-258",
    recommendation: "Barcha hisoblarga murakkab parol o‘rnating.",
  },
  {
    match: /^\s*set\s+telnet[^#\n]*disabled=no/,
    severity: "high",
    title: "Telnet xizmati yoqilgan",
    description: "`telnet disabled=no` shifrlanmagan boshqaruvga ruxsat beradi.",
    cwe: "CWE-319",
    recommendation:
      "Telnetni o‘chiring (`set telnet disabled=yes`), faqat SSH va Winbox’ni qoldiring.",
  },
  {
    match: /^\s*set\s+api[^#\n]*disabled=no/,
    severity: "medium",
    title: "API xizmati ochiq",
    description: "Ochiq `api` xizmati boshqaruv tarmog‘i tashqarisidan zaiflikni oshiradi.",
    cwe: "CWE-284",
    recommendation: "API xizmatini o‘chiring yoki `address` bilan boshqaruv tarmog‘iga cheklang.",
  },
];

export function parseMikrotik(content: string): ParseResult {
  return {
    vendor: "mikrotik",
    hostname: firstMatch(content, /\/system identity[\s\S]*?name=([^\s]+)/),
    model: "MikroTik RouterOS",
    firmware: firstMatch(content, /RouterOS\s+([\d.]+)/),
    gaps: scanLineRules(content, RULES),
  };
}
