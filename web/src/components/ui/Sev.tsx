import type { Severity } from "@/lib/types/entities";

const LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

/** Severity badge over the `.sev` classes. Labels are security terms (kept English). */
export function Sev({ level, className }: { level: Severity; className?: string }) {
  const classes = ["sev", `sev--${level}`, className].filter(Boolean).join(" ");
  return <span className={classes}>{LABELS[level]}</span>;
}
