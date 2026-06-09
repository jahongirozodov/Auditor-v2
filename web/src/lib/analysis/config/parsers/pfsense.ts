import { firstMatch, scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /<protocol>http<\/protocol>/i,
    severity: "medium",
    title: "Veb-interfeys HTTP (shifrlanmagan)",
    description:
      "pfSense boshqaruv interfeysi HTTP orqali ishlamoqda — hisob ma‘lumotlari ochiq uzatiladi.",
    cwe: "CWE-319",
    recommendation: "Veb-interfeysni HTTPS’ga o‘tkazing.",
  },
  {
    match: /<enablesshd>\s*<\/enablesshd>/i,
    severity: "low",
    title: "SSH konfiguratsiyasini tekshiring",
    description: "SSH yoqilgan — kalit asosidagi autentifikatsiya va manba cheklovini tasdiqlang.",
    cwe: "CWE-16",
    recommendation: "SSH’da parol o‘rniga kalitlardan foydalaning va kirishni cheklang.",
  },
];

export function parsePfsense(content: string): ParseResult {
  return {
    vendor: "pfsense",
    hostname: firstMatch(content, /<hostname>([^<]+)<\/hostname>/i),
    model: "pfSense",
    firmware: firstMatch(content, /<version>([^<]+)<\/version>/i),
    gaps: scanLineRules(content, RULES),
  };
}
