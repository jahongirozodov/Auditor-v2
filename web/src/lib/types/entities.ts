/**
 * Domain entity types, shaped to the prototype's data (data.js) so screens render
 * faithfully. Where the prototype carries Uzbek display strings (priority, device
 * criticality), the type is the literal label union — the backend (Phase 1) will
 * normalize these to the canonical enums in docs/04-workflows.
 */
import type { RoleCode } from "./roles";

export interface User {
  id: string;
  name: string;
  role: RoleCode;
  customRoleCode?: string | null;
  title: string;
  /** Initials shown in the avatar. */
  avatar: string;
  dept: string;
}

// ---------- Organizations ----------
export type RiskLevel = "high" | "medium" | "low";

export interface Organization {
  id: string;
  name: string;
  /** 9-digit taxpayer id. */
  stir: string;
  sector: string;
  audits: number;
  contact: string;
}

export interface OrgContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface OrgDevice {
  name: string;
  kind: string;
  vendor: string;
  ip: string;
  /** Uzbek criticality label: "Kritik" | "Yuqori" | "Oʻrta" | … */
  crit: string;
}

export interface OrgDetail {
  region: string;
  address: string;
  risk: RiskLevel;
  head: string;
  since: string;
  contacts: OrgContact[];
  devices: OrgDevice[];
}

// ---------- Audits ----------
export type AuditStatus =
  | "planning"
  | "group_forming"
  | "project_draft"
  | "project_pending"
  | "assigning"
  | "in_progress"
  | "review"
  | "returned"
  | "approved"
  | "completed"
  | "cancelled";

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TaskCounts {
  total: number;
  done: number;
  in_progress: number;
  blocked: number;
  new: number;
}

export interface Audit {
  id: string;
  code: string;
  title: string;
  /** Organization id (FK). */
  org: string;
  type: string;
  status: AuditStatus;
  /** Current workflow stage 1..10. */
  stage: number;
  startDate: string;
  endDate: string;
  progress: number;
  /** User id of the audit leader. */
  leader: string;
  /** User ids. */
  members: string[];
  findings: SeverityCounts;
  tasks: TaskCounts;
  lastSync: string;
  pinned?: boolean;
  /** Editable project content (Project tab). */
  goal?: string;
  methodology?: string;
  scope: string[];
  tools: string[];
}

export type AuditProjectStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "returned"
  | "executing"
  | "completed";

export interface AuditProject {
  id: string;
  auditId: string;
  status: AuditProjectStatus;
  currentApprovalStage: ApprovalStageKey | null;
  goal: string | null;
  methodology: string | null;
  scope: string[];
  tools: string[];
}

export interface WorkflowStep {
  n: number;
  key: string;
  title: string;
  who: string;
  short: string;
  current?: boolean;
}

// ---------- Tasks ----------
export type TaskStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "review"
  | "returned"
  | "done"
  | "blocked";
/** Prototype priority labels (Uzbek). Backend canonical: critical/high/medium/low. */
export type TaskPriority = "Yuqori" | "Oʻrta" | "Past";

export interface Task {
  id: string;
  auditId: string;
  title: string;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  due: string;
  /** User id of the assignee. */
  assignee: string;
  findings: number;
  files: number;
  kpi: number;
}

// ---------- Findings ----------
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type FindingStatus =
  | "new"
  | "review"
  | "returned"
  | "approved"
  | "fixing"
  | "fixed"
  | "retest"
  | "closed";

export interface Finding {
  id: string;
  auditId: string;
  taskId: string;
  title: string;
  severity: Severity;
  /** CVSS v3.1 score 0..10. */
  cvss: number;
  status: FindingStatus;
  /** User id of the discoverer. */
  reportedBy: string;
  date: string;
  asset: string;
  type: string;
  /** CWE id, e.g. "CWE-284". */
  cwe: string;
  description: string;
  /** Number of evidence files. */
  evidence: number;
  /** Whether AI enriched the recommendation. */
  ai: boolean;
}

export interface FindingEvidenceView {
  id: string;
  findingId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  kind: string;
  createdAt: string;
}

// ---------- Configuration analysis ----------
/** A device whose config was parsed (drives the "analyzed devices" panel). */
export interface AnalyzedDeviceView {
  id: string;
  uploadId: string;
  hostname: string;
  vendor: string;
  model: string | null;
  firmware: string | null;
  /** Severity counts shown as sev pills. */
  findings: { critical: number; high: number; medium: number };
}

/** A stored config upload — raw text is re-parsed for the preview + gaps. */
export interface ConfigUploadView {
  id: string;
  filename: string;
  vendor: string;
  content: string;
  auditId: string;
  taskId: string;
  createdAt: string;
}

// ---------- Scanner import ----------
export interface ScannerUploadView {
  id: string;
  filename: string;
  scanner: string;
  content: string;
  auditId: string;
  taskId: string;
  status: string;
  findingCount: number;
  aiOk: boolean;
  createdAt: string;
}

export interface ScanImportRowView {
  id: string;
  filename: string;
  scanner: string;
  auditCode: string;
  severityAgg: { critical: number; high: number; medium: number; low: number; info: number };
  status: string;
  createdAt: string;
}

// ---------- Users admin ----------
export interface AdminUserView {
  id: string;
  name: string;
  role: import("./roles").RoleCode;
  customRoleCode: string | null;
  title: string;
  avatar: string;
  dept: string;
  email: string;
  disabled: boolean;
  lastLogin: string | null;
}
// ---------- Traffic analysis ----------
export interface TrafficUploadView {
  id: string;
  filename: string;
  format: string;
  content: string;
  /** Pre-parsed TrafficParseResult JSON for binary formats (pcap); null for text. */
  parsed: string | null;
  auditId: string;
  taskId: string;
  anomalyCount: number;
  totalPackets: number;
  uniqueIps: number;
  createdAt: string;
}
// ---------- KPI ----------
export interface KpiRule {
  code: string;
  label: string;
  points: number;
}

export interface KpiUser {
  /** User id. */
  user: string;
  audits: number;
  tasks: number;
  findings: number;
  total: number;
  delta: number;
  sparkline: number[];
}

// ---------- AI ----------
export interface AiMessage {
  role: "system" | "user" | "ai";
  time: string;
  text: string;
  /** User id (for role === "user"). */
  who?: string;
  /** Optional attachment key, e.g. "plan". */
  attach?: string;
}

// ---------- Tokens ----------
export type TokenStatus = "active" | "expired" | "revoked";

export interface AuditToken {
  id: string;
  /** Audit id. */
  audit: string;
  /** User id. */
  user: string;
  device: string;
  hostname: string;
  os: string;
  agent: string;
  ip: string;
  issued: string;
  expires: string;
  status: TokenStatus;
  lastUsed: string;
  tasks: number;
}

// ---------- Audit evidence (Fayllar & dalillar) ----------
export interface AuditEvidenceView {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  comment: string;
  /** User id of the uploader. */
  uploadedBy: string;
  uploadedByName: string;
  uploadedByAvatar: string;
  createdAt: string;
}

// ---------- Audit log ----------
export type LogLevel = "info" | "warn" | "danger";

export interface LogEntry {
  time: string;
  /** User id. */
  user: string;
  action: string;
  entity: string;
  ip: string;
  device: string;
  level: LogLevel;
}

/** A row from the append-only AuditLog table (joined with the actor). */
export interface AuditLogView {
  id: string;
  /** ISO timestamp (createdAt). */
  time: string;
  userId: string | null;
  userName: string | null;
  avatar: string | null;
  action: string;
  entity: string;
  ip: string;
  device: string;
  /** "info" | "warn" | "danger". */
  level: string;
  /** Mutation context (before/after, comment, …) — only loaded for the detail drawer. */
  payload?: unknown;
}

export type LogCategory = "all" | "auth" | "finding" | "task" | "config" | "error";

export interface AuditLogFilters {
  from?: string;
  to?: string;
  level?: "info" | "warn" | "danger";
  category?: LogCategory;
  actorId?: string;
  q?: string;
}

export interface AuditLogPage {
  rows: AuditLogView[];
  nextCursor: string | null;
  total: number;
  counts: Record<LogCategory, number>;
}

// ---------- Reports ----------
export type ReportStatus = "draft" | "review" | "approved" | "returned";

export interface Report {
  id: string;
  title: string;
  /** Audit id. */
  audit: string;
  type: string;
  status: ReportStatus;
  generated: string;
  size: string;
  format: string[];
  /** User id of the author. */
  author: string;
  /** Approval stage when status is "review" (group_lead | head | dept), else null. */
  approvalStage: string | null;
  /** AI-enriched executive summary, rendered in the print view. */
  summary: string | null;
}

// ---------- Topology ----------
export type NodeKind =
  | "cloud"
  | "firewall"
  | "ips"
  | "vpn"
  | "switch"
  | "server"
  | "web"
  | "db"
  | "wifi"
  | "endpoint";

export interface TopologyNode {
  id: string;
  label: string;
  ip: string;
  kind: NodeKind;
  segment: string;
  sev: Severity;
  findings: number;
}

export interface TopologyEdge {
  s: string;
  t: string;
  /** Suspicious flow. */
  flag?: boolean;
}

export interface Topology {
  /** Audit id. */
  audit: string;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

// ---------- Approvals (3-stage) ----------
export type ApprovalStageKey = "group_lead" | "head" | "dept";
export type ApprovalState = "done" | "current" | "pending" | "returned";

export interface ApprovalStage {
  key: ApprovalStageKey;
  title: string;
  /** User id. */
  who: string;
  role: string;
}

export interface ApprovalEvent {
  /** User id. */
  who: string;
  action: string;
  stage: ApprovalStageKey;
  t: string;
  state: ApprovalState;
  comment?: string;
}

export interface ProjectApproval {
  stages: ApprovalStage[];
  timeline: ApprovalEvent[];
  current: ApprovalStageKey;
}
