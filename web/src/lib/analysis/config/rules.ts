import type { ConfigGap, GapSeverity } from "./types";

/** A per-line detection rule: if `match` tests true on a line, emit a gap there. */
export interface LineRule {
  match: RegExp;
  severity: GapSeverity;
  title: string;
  description: string;
  cwe: string;
  recommendation: string;
}

/** A whole-file rule: if `present` is NOT found anywhere, emit a gap (line 0). */
export interface AbsenceRule {
  present: RegExp;
  severity: GapSeverity;
  title: string;
  description: string;
  cwe: string;
  recommendation: string;
}

/**
 * Apply per-line rules. At most one gap per line — rules earlier in the array
 * win (treat the array as priority-ordered). Use non-global regexes (stateless
 * `.test`). Comment lines are skipped by the individual rules' patterns.
 */
export function scanLineRules(content: string, rules: LineRule[]): ConfigGap[] {
  const gaps: ConfigGap[] = [];
  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const r of rules) {
      if (r.match.test(line)) {
        gaps.push({
          line: i + 1,
          severity: r.severity,
          title: r.title,
          description: r.description,
          cwe: r.cwe,
          recommendation: r.recommendation,
          evidenceLine: line.trim(),
        });
        break;
      }
    }
  });
  return gaps;
}

/** Apply whole-file absence rules — a gap for each `present` pattern not found. */
export function scanAbsenceRules(content: string, rules: AbsenceRule[]): ConfigGap[] {
  return rules
    .filter((r) => !r.present.test(content))
    .map((r) => ({
      line: 0,
      severity: r.severity,
      title: r.title,
      description: r.description,
      cwe: r.cwe,
      recommendation: r.recommendation,
      evidenceLine: "",
    }));
}

/** First capture group of `re` against `content`, or null. */
export function firstMatch(content: string, re: RegExp): string | null {
  const m = content.match(re);
  return m && m[1] ? m[1] : null;
}
