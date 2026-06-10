import type { ScannerFinding, ScannerParseResult, ScannerSeverity } from "../types";

/** Normalize a severity string to ScannerSeverity. */
function normalizeSeverity(raw: string): ScannerSeverity {
  switch (raw.trim().toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
    case "hight":
      return "high";
    case "medium":
    case "med":
    case "moderate":
    case "warning":
      return "medium";
    case "low":
    case "minor":
      return "low";
    default:
      return "info";
  }
}

/** Parse a minimal CSV: first line = header, rest = data rows. */
function parseCsv(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    // Simple CSV split: handles quoted fields.
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        row.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    row.push(current);
    return row;
  });
}

/** Column name aliases for auto-detection (lowercased). */
const TITLE_COLS = ["title", "name", "finding", "vulnerability", "vuln"];
const SEVERITY_COLS = ["severity", "risk", "threat", "criticality", "priority"];
const DESC_COLS = ["description", "desc", "details", "detail", "summary"];
const HOST_COLS = ["host", "ip", "address", "target", "ip address"];
const SOLUTION_COLS = ["solution", "remediation", "fix", "recommendation"];

function findColIndex(headers: string[], aliases: string[]): number {
  const lowerHeaders = headers.map((h) => h.trim().toLowerCase());
  for (const alias of aliases) {
    const idx = lowerHeaders.indexOf(alias);
    if (idx !== -1) return idx;
  }
  // Partial match fallback.
  for (const alias of aliases) {
    const idx = lowerHeaders.findIndex((h) => h.includes(alias));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseUniversal(content: string): ScannerParseResult {
  try {
    const rows = parseCsv(content);

    if (rows.length === 0) {
      return {
        scanner: "universal",
        findings: [
          {
            title: "Bo'sh fayl",
            description: "Fayldan 0 qator o'qildi",
            severity: "info",
          },
        ],
        hosts: 0,
      };
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const titleIdx = findColIndex(headers, TITLE_COLS);
    const severityIdx = findColIndex(headers, SEVERITY_COLS);
    const descIdx = findColIndex(headers, DESC_COLS);
    const hostIdx = findColIndex(headers, HOST_COLS);
    const solutionIdx = findColIndex(headers, SOLUTION_COLS);

    const hasRecognizedColumns = [titleIdx, severityIdx, descIdx, hostIdx, solutionIdx].some(
      (idx) => idx !== -1,
    );

    if (!hasRecognizedColumns) {
      return {
        scanner: "universal",
        findings: [
          {
            title: `Fayldan ${rows.length} qator o'qildi`,
            description: `Fayldan ${rows.length} qator o'qildi`,
            severity: "info",
          },
        ],
        hosts: 0,
      };
    }

    const findings: ScannerFinding[] = [];
    const hosts = new Set<string>();

    for (const row of dataRows) {
      if (row.every((cell) => !cell.trim())) continue;

      const title = titleIdx !== -1 ? row[titleIdx]?.trim() : `Row ${findings.length + 1}`;
      const rawSeverity = severityIdx !== -1 ? (row[severityIdx]?.trim() ?? "") : "";
      const severity = normalizeSeverity(rawSeverity);
      const description = descIdx !== -1 ? (row[descIdx]?.trim() ?? title ?? "") : (title ?? "");
      const host = hostIdx !== -1 ? row[hostIdx]?.trim() || undefined : undefined;
      const solution = solutionIdx !== -1 ? row[solutionIdx]?.trim() || undefined : undefined;

      if (host) hosts.add(host);

      findings.push({
        title: title || `Row ${findings.length + 1}`,
        description: description || title || "",
        severity,
        host,
        solution,
      });
    }

    if (findings.length === 0) {
      return {
        scanner: "universal",
        findings: [
          {
            title: `Fayldan ${rows.length} qator o'qildi`,
            description: `Fayldan ${rows.length} qator o'qildi`,
            severity: "info",
          },
        ],
        hosts: 0,
      };
    }

    return {
      scanner: "universal",
      findings,
      hosts: hosts.size,
    };
  } catch {
    return {
      scanner: "universal",
      findings: [
        {
          title: "Faylni o'qishda xato",
          description: "Faylni o'qishda xato yuz berdi",
          severity: "info",
        },
      ],
      hosts: 0,
    };
  }
}
