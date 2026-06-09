import type { ScannerType } from "./types";

/** Lowercased basename of a path (handles both `/` and `\` separators). */
function baseNameLower(filename: string): string {
  return filename.split(/[\\/]/).pop()?.toLowerCase() ?? "";
}

/**
 * Detect the scanner type from filename (primary) with content fallback.
 * Order matters: more specific markers are checked before generic ones.
 */
export function sniffScanner(filename: string, content: string): ScannerType {
  const name = baseNameLower(filename);

  // Filename-driven detection (highest confidence).
  if (name.endsWith(".nessus")) return "nessus";
  if (name.endsWith(".gnmap")) return "nmap";
  if (name.endsWith(".burp")) return "burp";

  // ZAP JSON by filename + content marker.
  if (name.endsWith(".json") && (content.includes('"alerts"') || content.includes('"site"')))
    return "zap";

  // Content-based detection.
  if (content.includes("<NessusClientData")) return "nessus";

  if (/<nmaprun/i.test(content) || /<nmap/i.test(content)) return "nmap";

  if (content.includes("<report") && content.includes("<results")) return "openvas";

  if (content.includes("<issues") && content.includes("<issue")) return "burp";

  if (content.includes("NESSUS_") || content.includes("Plugin ID")) return "nessus";

  return "universal";
}
