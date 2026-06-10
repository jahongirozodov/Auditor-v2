# 04 — Workflows

> Source: TZ §6–9 (translated). **Stack-independent requirement.** These are the heart of the system —
> implement faithfully. All approval timelines are **immutable / append-only**.

## Audit lifecycle (TZ §6)

Audit status (`AuditStatus`):

| Status | Description |
| --- | --- |
| `planned` | Created (by head), team being formed |
| `inprogress` | Active — project approved, tasks underway |
| `review` | Wrap-up — reports being prepared |
| `returned` | Returned by an approver |
| `approved` | Finally approved |
| `completed` | Completed (archived) |
| `cancelled` | Cancelled |

**Typical flow:** head creates audit (org, type, dates) → head forms the team (group_lead + auditors) →
group_lead creates and fills the project → project goes through the 3-step approval (below) →
group_lead creates and assigns tasks → auditors do tasks and file findings → each finding goes through
3-step approval → final report is created, approved, and exported.

## Audit project — 3-step approval (TZ §7)

Each transition is stored as an **immutable** record in `audit_project_approvals` (who, when, what).

| status | current_approval_stage | Description |
| --- | --- | --- |
| `draft` | – | Created, not yet submitted (editable) |
| `submitted` | `head` | group_lead submitted; division chief reviewing |
| `submitted` | `dept` | head approved; department head reviewing |
| `approved` | (null) | Finally approved (project formed) |
| `returned` | – | Returned by an approver, with a comment |
| `executing` / `completed` | – | Execution and completion (later states) |

**Operations**

| Action | Required permission | Transition |
| --- | --- | --- |
| Submit | `group_lead` duty or `audit.update` | draft\|returned → submitted (stage=head) |
| ApproveStage (head) | `audit.approve` (head/super) | stage=head → stage=dept |
| ApproveStage (dept) | `super` (wildcard `*`) | stage=dept → status=approved |
| RejectStage / Return | current-stage auth + **mandatory comment** | submitted → returned |

**UI:** a 3-step progress strip (group_lead → head → dept), a chronological timeline (who/when/what +
comment), stage-aware buttons (Submit / Approve / Return), and a current-stage chip.

Implementation mapping: project creation starts from the audit detail Project tab. A user has
`group_lead` duty for this workflow only when `audit.leaderId` matches the active session user; `super`
and `head` retain the documented administrative override. Project lifecycle transitions update
`AuditProject.status/currentApprovalStage` and mirror the parent `Audit` status to
`project_draft`, `project_pending`, or `assigning`.

## Tasks (TZ §8)

- Tasks are normally created inside an **approved** project.
- Creator: `task.assign` permission or `group_lead` duty.
- Auto code: `T-{audit_suffix}-{seq}`.
- `task_type`: config / netscan / webscan / traffic / manual / evidence / vuln / recomm / report / retest.
- `priority`: critical / high / medium / low.

**Status transitions (`AuditTaskStatus`)**

| From | To | Who |
| --- | --- | --- |
| new | assigned | group_lead assigns to a user |
| assigned | inprogress | assignee starts |
| inprogress | review | assignee submits for review |
| inprogress | done | assignee completes |
| review | approved | group_lead approves |
| review | returned | group_lead returns |
| returned | inprogress | auditor fixes and restarts |
| (any) | cancelled | task cancelled |

**Authorization** (checked in handler): assignee manages own task; `group_lead` duty manages any task
in the group; `super` administratively.

## Findings — 3-step approval (TZ §9)

**Purpose:** every weakness must pass 3 approval stages before entering the official report — quality
control that prevents unsubstantiated findings from piling up.

| status | current_approval_stage | Description |
| --- | --- | --- |
| `new` | – | Newly created, not yet submitted |
| `review` | `group_lead` | Auditor submitted; team lead reviewing |
| `review` | `head` | group_lead approved; division chief reviewing |
| `review` | `dept` | head approved; department head reviewing |
| `approved` | (null) | Finally approved finding |
| `returned` | – | Returned (with comment) |
| `fixing` / `fixed` / `retest` / `closed` | – | Remediation & retest lifecycle |

**Operations**

| Action | Required permission | Transition |
| --- | --- | --- |
| SubmitForReview | discoverer / group_lead / `finding.approve` | new\|returned → review (stage=group_lead) |
| ApproveStage (group_lead) | `group_lead` duty or `finding.approve` | stage=group_lead → stage=head |
| ApproveStage (head) | `finding.approve` | stage=head → stage=dept |
| ApproveStage (dept) | `super` (wildcard `*`) | stage=dept → status=approved |
| RejectStage | current-stage auth + **mandatory comment** | review → returned |

**Severity & CVSS:** severity critical/high/medium/low/info (auto-derived from CVSS); CVSS v3.1 vector +
score; CWE/CVE if available; description, impact, recommendation, evidence files.

**Idempotency:** findings created offline by the agent carry a unique `IdempotencyKey` so resubmission
never creates duplicates (enforced by a DB unique constraint).
