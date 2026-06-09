import { firstMatch, scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /^\s*enable password\b/,
    severity: "high",
    title: "`enable password` shifrlanmagan saqlanadi",
    description: "`enable password` zaif (Type 7) shifrlashda saqlanadi; oson tiklanadi.",
    cwe: "CWE-256",
    recommendation:
      "`enable secret` (scrypt/SHA-256) ishlating va `enable password`ni olib tashlang.",
  },
  {
    match: /transport input\b.*\btelnet\b/,
    severity: "high",
    title: "VTY liniyalarida Telnet yoqilgan",
    description: "`transport input telnet` shifrlanmagan boshqaruvga ruxsat beradi.",
    cwe: "CWE-319",
    recommendation: "`transport input ssh` bilan cheklang.",
  },
  {
    match: /snmp-server community\s+(public|private)\b/,
    severity: "high",
    title: "Standart SNMP community satri",
    description:
      "`public`/`private` standart community satrlari ma‘lum — qurilma ma‘lumotlari oshkor bo‘ladi.",
    cwe: "CWE-1188",
    recommendation:
      "SNMPv3 (autentifikatsiya + shifrlash) ga o‘ting yoki murakkab community satri qo‘ying.",
  },
  {
    match: /^\s*no service password-encryption\b/,
    severity: "medium",
    title: "Parol shifrlash o‘chirilgan",
    description:
      "`no service password-encryption` parollarni konfiguratsiyada ochiq matnda saqlaydi.",
    cwe: "CWE-261",
    recommendation: "`service password-encryption` ni yoqing.",
  },
];

export function parseCiscoIos(content: string): ParseResult {
  return {
    vendor: "cisco_ios",
    hostname: firstMatch(content, /^hostname\s+(\S+)/m),
    model: "Cisco IOS",
    firmware: firstMatch(content, /(?:IOS|Version)\s+([\d][\d.()A-Za-z]*)/),
    gaps: scanLineRules(content, RULES),
  };
}
