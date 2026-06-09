import { scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /SSLProtocol[^#\n]*\b(SSLv2|SSLv3|TLSv1\.1|TLSv1(?![\d.]))\b/,
    severity: "high",
    title: "Zaif TLS/SSL protokollari yoqilgan",
    description: "`SSLProtocol` eskirgan SSLv3/TLSv1/TLSv1.1 protokollariga ruxsat beradi.",
    cwe: "CWE-327",
    recommendation: "`SSLProtocol -all +TLSv1.2 +TLSv1.3` qiling.",
  },
  {
    match: /Options[^#\n]*\+?Indexes\b/,
    severity: "medium",
    title: "Katalog ro‘yxati (Indexes) yoqilgan",
    description: "`Options +Indexes` katalog mazmunini ochib qo‘yadi — ma‘lumot oshkor bo‘ladi.",
    cwe: "CWE-548",
    recommendation: "`Options -Indexes` qiling.",
  },
  {
    match: /^\s*ServerTokens\s+(Full|OS)\b/i,
    severity: "low",
    title: "ServerTokens ortiqcha ma‘lumot oshkor qiladi",
    description: "`ServerTokens Full/OS` javob sarlavhalarida server va OS versiyasini ko‘rsatadi.",
    cwe: "CWE-200",
    recommendation: "`ServerTokens Prod` qiling.",
  },
  {
    match: /^\s*AllowOverride\s+All\b/i,
    severity: "low",
    title: "`AllowOverride All` ishlatilgan",
    description:
      "`AllowOverride All` .htaccess orqali keng sozlamalarga ruxsat beradi — xavf yuzasini oshiradi.",
    cwe: "CWE-16",
    recommendation: "Zaruriyatga qarab `AllowOverride None` yoki aniq direktivalar bilan cheklang.",
  },
];

export function parseApache(content: string): ParseResult {
  return {
    vendor: "apache",
    hostname: null,
    model: "Apache HTTPD",
    firmware: null,
    gaps: scanLineRules(content, RULES),
  };
}
