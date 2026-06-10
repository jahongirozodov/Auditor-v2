export const REPORT_TYPES = [
  "Audit hisoboti",
  "Executive summary",
  "Remediation plan",
  "Pentest hisoboti",
] as const;

export const REPORT_FORMATS = ["PDF", "DOCX", "HTML"] as const;

export interface GenerateReportInput {
  title: string;
  auditId: string;
  type: string;
  formats: string[];
}
