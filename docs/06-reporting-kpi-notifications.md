# 06 — Reporting, KPI & notifications

> Source: TZ §12–14 (translated). **Requirement.** Export libraries are .NET today (QuestPDF/OpenXml/
> ClosedXML) — our export library is an [open decision](decisions/0003-reporting-export.md); the
> formats, templates, and workflow are the contract.

## Reports (TZ §12)

**Formats:** PDF (QuestPDF) · DOCX (OpenXml) · XLSX (ClosedXML) · HTML (Razor/template).

**Templates**

| Template | Contents |
| --- | --- |
| Executive Summary | Short summary for leadership (AI-enriched) |
| Technical Report | Full technical report (findings + evidence) |
| Vulnerabilities List | Vulnerabilities by severity |
| Compliance | Standards conformance (ISO 27001, NIST CSF) |
| Action Plan | Recommendations and deadlines |
| Audit Statement | Official audit act |

**Workflow:** auditor/group_lead creates a report (draft) → `ReportSection`s
(executive_summary, findings, recommendations) are edited → super or head approves (approved) → export
to the chosen format and upload to MinIO.

> Reports are built **print-first** in our stack (print stylesheet + isolated print route mirroring the
> existing "Auditor — Print" layout). See [../DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md) Phase 7.

## KPI engine (TZ §13)

**Seed rules**

| Rule code | Points | Description |
| --- | --- | --- |
| audit_participation | +5 | Participating in an audit |
| act_as_group_lead | +15 | Acting as team lead |
| develop_project | +15 | Developing & submitting the project |
| assign_tasks_correctly | +10 | Distributing tasks correctly |
| act_as_auditor | +10 | Participating as an auditor |
| task_completed | +5 | Each completed task |
| task_on_time | +5 | On-time completion |
| task_overdue | −5 | Task overdue (penalty) |
| vuln_approved | +3 | Approved vulnerability |
| vuln_critical_bonus | +10 | Critical vulnerability bonus |
| vuln_high_bonus | +7 | High vulnerability bonus |
| vuln_medium_bonus | +4 | Medium vulnerability bonus |
| vuln_low_bonus | +1 | Low vulnerability bonus |
| config_analysis | +5 | Configuration analysis |
| scanner_import | +5 | Scanner result import |
| traffic_analysis | +7 | Traffic analysis |
| report_section | +5 | Contributing a report section |
| vuln_returned | −2 | Vulnerability returned (penalty) |
| vuln_rejected | −3 | Vulnerability rejected (penalty) |

**Calculation:** event-driven. Relevant events (project submitted, task completed, vulnerability
approved, …) create a `KpiEvent` via handlers and aggregate into `KpiScore`. In addition, `group_lead`
(0..20) and `head` (0..30) can give a **manual appraisal** (`KpiAppraisal`). The `/kpi` page shows the
user's own rating; with `kpi.view_all`, others' too.

## Notifications (TZ §14)

**Bell (real-time):** push over the live UI channel; `Notification` entity (user, kind, title, severity,
link, audit_id, actor); unread dropdown; mark-as-read command; retention background job.

**Triggers:** project submitted → head/super · finding returned → discoverer · new task assigned →
assignee · task completed → group_lead · critical vulnerability → email + bell to approvers · report
ready → relevant users.

**Email:** MailKit/MimeKit + SMTP. Critical-severity finding → email; password-reset email; login alerts
(new IP/device).
