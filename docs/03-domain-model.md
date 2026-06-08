# 03 — Domain model & database

> Source: TZ §5, §18 (translated). **Stack-independent requirement** (entities/relationships). The DB
> section reflects the existing PostgreSQL schema; we target the same PostgreSQL 16 + RLS via Prisma.
> A more UI-oriented model also exists in
> [../project/design_handoff_auditor/03-DATA-MODEL.md](../project/design_handoff_auditor/03-DATA-MODEL.md).

The current DbContext has ~38 tables. Entities grouped by aggregate:

## Identity
- **User** — username, email, full_name, role, department, position, 2FA, lockout state.
- **Role** — system role (5 seeded: super/head/chief/lead/t1, with level).
- **Permission** — permission catalog (`module.action`).
- **PasswordResetToken** — password-reset tokens.
- **LoginAttempt** — login attempts (success/fail, IP, User-Agent).

## Organizations
- **Organization** — code, localized name, TIN (STIR), address, sector, risk level.
- **OrganizationContact** — organization contacts.
- **OrganizationDevice** — device inventory.

## Audits
- **Audit** — code, name, organization, audit_type, start/end dates, status, progress.
- **AuditGroup** — audit team (1:1 with audit).
- **AuditGroupMember** — member (user, role_snapshot, primary_duty).
- **AuditProject** — goal, scope, methodology, targets, tools, approval stage.
- **AuditProjectApproval** — project approval timeline (immutable).

## Tasks
- **AuditTask** — code, name, task_type, priority, due_date, assignee, status, progress.
- **TaskAssignment** — assignment history.
- **TaskStatusHistory** — status-change log.

## Vulnerabilities / Findings
- **Vulnerability** — code, title, severity, CVSS, CWE, CVE, status, current_approval_stage,
  idempotency_key.
- **VulnerabilityEvidence** — evidence files (screenshot, log, config, scan, traffic, document).
- **VulnerabilityApproval** — approval timeline (immutable: stage, action, actor, comment).
- **CvssScore** — CVSS v3.1 metrics (vector + score → severity).

## Analysis
- **ConfigAnalysisFile** — device config (Cisco / Linux SSH / sudoers / Nginx / Apache / MikroTik).
- **ScannerImport** — scanner results (Nessus / Nmap / OpenVAS / Burp / ZAP / IP-scanner).
- **TrafficAnalysisFile** — traffic (PCAP / Wireshark CSV / Suricata EVE / Zeek conn).
- **AiAnalysisResult** — AI sessions (input, output, model, token, latency).

## Reports
- **Report** — 1:N with audit, status draft/approved, version, classification.
- **ReportSection** — sections (code, title, AI-generated flag, order).
- **ReportExport** — export history (pdf/docx/xlsx/html).

## KPI
- **KpiRule** — rule (code, points, trigger event, active).
- **KpiEvent** — emitted events (user, points, audit).
- **KpiScore** — aggregated score (period: month/quarter/year/audit).
- **KpiAppraisal** — manual appraisal (group_lead 0..20, head 0..30).

## Agent (12 tables)
- **DesktopAgentVersion** — EXE release metadata (version, sha256, signature).
- **AgentInstallation / AgentDeviceBinding** — device install & binding.
- **AgentUserSession** — agent login session.
- **AuditToken / AuditTokenTask / AuditTokenUsageLog** — agent JWT token, visible tasks, usage log.
- **AgentSyncSession / AgentSyncQueue / AgentSyncLog** — sync session, queue, log.
- **AgentUploadedFile / AgentOfflineStorage** — uploaded files & offline-storage metadata.

## Others
- **Notification** — bell notifications (user, kind, title, severity, link, audit, actor).
- **AuditLogEntry** — all CRUD/auth actions (before/after JSONB).
- **FileAccessLog** — file-access log.
- **SystemSetting** — system settings (incl. `custom_roles` JSONB).
- **FileStorage** — MinIO file metadata.

## Database characteristics (TZ §18)
- PostgreSQL 16 (Docker or dedicated), schema `auditor`.
- **Row-Level Security (RLS)** for multi-tenant isolation.
- **JSONB** columns (LocalizedText, custom_roles, audit_log payload).
- **UUID** primary keys (`gen_random_uuid()`).
- Timestamps in UTC (`timestamptz`).
- **Check constraints** enforce business rules (status, severity, duty, stage).

Migration history (chronological): InitialCreate → SeedInitialData → AddNotificationsTable →
AddPasswordResetTokensTable → AddVulnerabilityIdempotencyKey → AddVulnerabilityApprovals →
AddAuditProjectApprovals.

> Codes: audit `AUD-YYYY-NNN`, task `T-{audit_suffix}-{seq}`, finding `F-YYYY-NNNN`.
