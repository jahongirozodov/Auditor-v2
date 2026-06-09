import { firstMatch, scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /set allowaccess\b[^#\n]*\btelnet\b/,
    severity: "high",
    title: "Interfeysda Telnet boshqaruvi ochiq",
    description: "`set allowaccess ... telnet` shifrlanmagan boshqaruvga ruxsat beradi.",
    cwe: "CWE-319",
    recommendation: "allowaccess ro‘yxatidan telnet’ni olib tashlang; ssh/https’ni qoldiring.",
  },
  {
    match: /set strong-crypto disable\b/,
    severity: "medium",
    title: "Strong-crypto o‘chirilgan",
    description: "`set strong-crypto disable` zaif shifrlash to‘plamlariga ruxsat beradi.",
    cwe: "CWE-327",
    recommendation: "`set strong-crypto enable` qiling.",
  },
];

export function parseFortinet(content: string): ParseResult {
  return {
    vendor: "fortinet",
    hostname: firstMatch(content, /set hostname\s+"?([^"\s]+)"?/),
    model: "FortiGate",
    firmware: null,
    gaps: scanLineRules(content, RULES),
  };
}
