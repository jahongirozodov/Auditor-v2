import { scanLineRules, type LineRule } from "../rules";
import type { ParseResult } from "../types";

const RULES: LineRule[] = [
  {
    match: /NOPASSWD:\s*ALL/,
    severity: "critical",
    title: "Parolsiz to‘liq sudo (NOPASSWD: ALL)",
    description:
      "`NOPASSWD: ALL` foydalanuvchiga parolsiz root buyruqlarini bajarishga ruxsat beradi.",
    cwe: "CWE-250",
    recommendation: "NOPASSWD ni olib tashlang yoki aniq buyruqlar bilan cheklang.",
  },
  {
    match: /^\s*%\w[\w-]*\s+ALL=\(ALL(:ALL)?\)\s+ALL\s*$/,
    severity: "medium",
    title: "Guruhga to‘liq sudo huquqi berilgan",
    description: "Butun guruhga `ALL=(ALL) ALL` huquqi minimal imtiyoz tamoyilini buzadi.",
    cwe: "CWE-269",
    recommendation: "Sudo huquqlarini aniq foydalanuvchi va buyruqlar bilan cheklang.",
  },
  {
    match: /^\s*Defaults\s+!requiretty\b/,
    severity: "low",
    title: "`!requiretty` o‘rnatilgan",
    description:
      "`Defaults !requiretty` skript orqali sudo’dan foydalanishni osonlashtiradi, audit izini kamaytiradi.",
    cwe: "CWE-16",
    recommendation: "Zaruriyat bo‘lmasa `requiretty` ni qoldiring.",
  },
];

export function parseLinuxSudoers(content: string): ParseResult {
  return {
    vendor: "linux_sudoers",
    hostname: null,
    model: "Linux sudoers",
    firmware: null,
    gaps: scanLineRules(content, RULES),
  };
}
