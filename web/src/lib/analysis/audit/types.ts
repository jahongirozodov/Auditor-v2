/** AI analysis of a whole audit — the model's structured output, rendered as cards. */

export type AuditRisk = "critical" | "high" | "medium" | "low";

export interface AuditTopRisk {
  title: string;
  severity: AuditRisk;
  why: string;
  recommendation: string;
}

export interface AuditRemediationItem {
  priority: AuditRisk;
  action: string;
}

export interface AuditAnalysis {
  executiveSummary: string;
  overallRisk: AuditRisk;
  topRisks: AuditTopRisk[];
  remediationPlan: AuditRemediationItem[];
  kpiNote: string;
}
