import { firstMatch, scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /^\s*set system services telnet\b/,
    severity: "high",
    title: "Telnet xizmati yoqilgan",
    description: "`set system services telnet` shifrlanmagan boshqaruvga ruxsat beradi.",
    cwe: "CWE-319",
    recommendation:
      "Telnetni olib tashlang (`delete system services telnet`), faqat SSH’ni qoldiring.",
  },
  {
    match: /^\s*set system root-authentication plain-text-password\b/,
    severity: "high",
    title: "Root paroli ochiq matnda",
    description: "Root autentifikatsiyasi ochiq matnli parol bilan o‘rnatilmoqda.",
    cwe: "CWE-256",
    recommendation: "Shifrlangan parol (`encrypted-password`) yoki SSH kalitidan foydalaning.",
  },
];

export function parseJuniper(content: string): ParseResult {
  return {
    vendor: "juniper",
    hostname: firstMatch(content, /set system host-name\s+(\S+)/),
    model: "Juniper JunOS",
    firmware: null,
    gaps: scanLineRules(content, RULES),
  };
}
