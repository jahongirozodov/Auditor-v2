import { scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /^\s*Protocol\s+1\b/i,
    severity: "critical",
    title: "SSH Protocol 1 yoqilgan",
    description: "SSHv1 buzilgan protokol — MITM va shifr hujumlariga zaif.",
    cwe: "CWE-327",
    recommendation: "Faqat `Protocol 2` ishlating (zamonaviy OpenSSH’da standart).",
  },
  {
    match: /^\s*PermitEmptyPasswords\s+yes\b/i,
    severity: "critical",
    title: "Bo‘sh parol bilan kirishga ruxsat",
    description: "`PermitEmptyPasswords yes` parolsiz hisoblar bilan SSH kirishiga yo‘l qo‘yadi.",
    cwe: "CWE-258",
    recommendation: "`PermitEmptyPasswords no` qiling.",
  },
  {
    match: /^\s*PermitRootLogin\s+yes\b/i,
    severity: "high",
    title: "Root bilan to‘g‘ridan-to‘g‘ri SSH kirish",
    description:
      "`PermitRootLogin yes` root hisobiga to‘g‘ridan kirishga ruxsat beradi — brute-force xavfi.",
    cwe: "CWE-250",
    recommendation: "`PermitRootLogin no` yoki `prohibit-password` qiling; sudo orqali ishlang.",
  },
  {
    match: /^\s*PasswordAuthentication\s+yes\b/i,
    severity: "medium",
    title: "Parol asosidagi autentifikatsiya yoqilgan",
    description: "Parol autentifikatsiyasi brute-force va parol o‘g‘irlashga zaif.",
    cwe: "CWE-287",
    recommendation:
      "Kalit asosidagi autentifikatsiyaga o‘ting va `PasswordAuthentication no` qiling.",
  },
  {
    match: /^\s*X11Forwarding\s+yes\b/i,
    severity: "low",
    title: "X11 forwarding yoqilgan",
    description: "`X11Forwarding yes` keraksiz hujum yuzasini ochadi.",
    cwe: "CWE-16",
    recommendation: "Zaruriyat bo‘lmasa `X11Forwarding no` qiling.",
  },
];

export function parseLinuxSshd(content: string): ParseResult {
  return {
    vendor: "linux_sshd",
    hostname: null,
    model: "Linux OpenSSH",
    firmware: null,
    gaps: scanLineRules(content, RULES),
  };
}
