import { sniffVendor } from "./sniff";
import { parseApache } from "./parsers/apache";
import { parseCiscoAsa } from "./parsers/cisco-asa";
import { parseCiscoIos } from "./parsers/cisco-ios";
import { parseFortinet } from "./parsers/fortinet";
import { parseJuniper } from "./parsers/juniper";
import { parseLinuxSshd } from "./parsers/linux-sshd";
import { parseLinuxSudoers } from "./parsers/linux-sudoers";
import { parseMikrotik } from "./parsers/mikrotik";
import { parseNginx } from "./parsers/nginx";
import { parsePfsense } from "./parsers/pfsense";
import type { ParseResult, VendorKey } from "./types";

export type { ConfigGap, GapSeverity, ParseResult, VendorKey } from "./types";
export { VENDOR_LABELS } from "./types";

const PARSERS: Record<Exclude<VendorKey, "unknown">, (content: string) => ParseResult> = {
  cisco_asa: parseCiscoAsa,
  cisco_ios: parseCiscoIos,
  linux_sshd: parseLinuxSshd,
  linux_sudoers: parseLinuxSudoers,
  nginx: parseNginx,
  apache: parseApache,
  mikrotik: parseMikrotik,
  juniper: parseJuniper,
  fortinet: parseFortinet,
  pfsense: parsePfsense,
};

/** Strip directory + extension → a usable device-name fallback. */
function baseName(filename: string): string {
  const file = filename.split(/[\\/]/).pop() ?? filename;
  return file.replace(/\.[^.]+$/, "") || file;
}

/**
 * Sniff the vendor, run its parser, and guarantee a hostname (falls back to the
 * filename). Unknown vendors yield a zero-gap result (graceful, never throws).
 */
export function analyzeConfig(filename: string, content: string): ParseResult {
  const vendor = sniffVendor(filename, content);
  const result: ParseResult =
    vendor === "unknown"
      ? { vendor, hostname: null, model: null, firmware: null, gaps: [] }
      : PARSERS[vendor](content);
  if (!result.hostname) result.hostname = baseName(filename);
  return result;
}
