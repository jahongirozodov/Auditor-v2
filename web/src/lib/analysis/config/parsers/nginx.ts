import { scanAbsenceRules, scanLineRules, type AbsenceRule, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const LINE_RULES: LineRule[] = [
  {
    match: /ssl_protocols[^;]*\b(SSLv2|SSLv3|TLSv1\.1|TLSv1(?![\d.]))\b/,
    severity: "high",
    title: "Zaif TLS/SSL protokollari yoqilgan",
    description: "`ssl_protocols` eskirgan SSLv3/TLSv1/TLSv1.1 protokollariga ruxsat beradi.",
    cwe: "CWE-327",
    recommendation: "Faqat `TLSv1.2 TLSv1.3` ni qoldiring.",
  },
  {
    match: /^\s*autoindex\s+on\s*;/,
    severity: "medium",
    title: "Katalog ro‘yxati (autoindex) yoqilgan",
    description: "`autoindex on` katalog mazmunini ochib qo‘yadi — ma‘lumot oshkor bo‘ladi.",
    cwe: "CWE-548",
    recommendation: "`autoindex off` qiling.",
  },
];

const ABSENCE_RULES: AbsenceRule[] = [
  {
    present: /server_tokens\s+off\s*;/,
    severity: "low",
    title: "`server_tokens off` o‘rnatilmagan",
    description:
      "Server javoblarida Nginx versiyasi ko‘rsatiladi — versiyaga asoslangan hujumlarni osonlashtiradi.",
    cwe: "CWE-200",
    recommendation: "`server_tokens off;` qo‘shing.",
  },
];

export function parseNginx(content: string): ParseResult {
  return {
    vendor: "nginx",
    hostname: null,
    model: "Nginx",
    firmware: null,
    gaps: [...scanLineRules(content, LINE_RULES), ...scanAbsenceRules(content, ABSENCE_RULES)],
  };
}
