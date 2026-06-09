import { sniffScanner } from "./sniff";
import { parseNessus } from "./parsers/nessus";
import { parseOpenVas } from "./parsers/openvas";
import { parseNmap } from "./parsers/nmap";
import { parseZap } from "./parsers/zap";
import { parseBurp } from "./parsers/burp";
import { parseUniversal } from "./parsers/universal";
import type { ScannerParseResult, ScannerType } from "./types";

export type { ScannerFinding, ScannerParseResult, ScannerSeverity, ScannerType } from "./types";
export { SCANNER_LABELS } from "./types";
export { scannerFindingToFindingInput, SCANNER_FINDING_TYPE } from "./to-finding";

const PARSERS: Record<ScannerType, (content: string) => ScannerParseResult> = {
  nessus: parseNessus,
  openvas: parseOpenVas,
  nmap: parseNmap,
  zap: parseZap,
  burp: parseBurp,
  universal: parseUniversal,
};

function baseName(filename: string): string {
  const file = filename.split(/[\\/]/).pop() ?? filename;
  return file.replace(/\.[^.]+$/, "") || file;
}

/**
 * Sniff the scanner type, run its parser. Falls back to universal on any error.
 * Never throws.
 */
export function analyzeScanner(filename: string, content: string): ScannerParseResult {
  const scanner = sniffScanner(filename, content);
  try {
    return PARSERS[scanner](content);
  } catch {
    return PARSERS.universal(content);
  }
}

export { baseName as scannerBaseName };
