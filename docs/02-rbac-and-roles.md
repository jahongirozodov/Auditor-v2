# 02 — RBAC & roles

> Source: TZ §4 (translated). **Stack-independent requirement.** In our stack, enforce on the server
> (Server Action / Route Handler) + DB RLS — a UI gate is never sufficient. See [08-security](08-security.md).

## System role hierarchy

Five leveled system roles:

| Code | Level | Description |
| --- | --- | --- |
| `super` | 100 | Department head (super admin) — all permissions (wildcard `*`), final (dept) approval |
| `head` | 80 | Division chief — creates audits, forms teams, 2nd-stage (head) approval |
| `chief` | 60 | Senior specialist — usually `group_lead` duty, distributes tasks |
| `lead` | 40 | Lead specialist — works as an auditor |
| `t1` | 20 | First-grade specialist — auditor (mostly sees own tasks) |

### Canonical codes & prototype mapping

These TZ codes are **canonical** in docs and code ([ADR-0006](decisions/0006-role-codes.md)). The
prototype's `data.js` uses different codes — normalize them on import:

| Prototype (`data.js`) | Canonical | Uzbek title |
| --- | --- | --- |
| `departament` | `super` | Departament rahbari |
| `bolim` | `head` | Boʻlim boshligʻi |
| `bosh` | `chief` | Bosh mutaxassis |
| `yetakchi` | `lead` | Yetakchi mutaxassis |
| `toifa1` | `t1` | Birinchi toifali mutaxassis |

> **Analyst is not a role.** The handoff gates some screens to "tahlilchi+" (analyst); model that as the
> analysis **permissions** below (`config.upload`, `scanner.import`, `traffic.upload`, `ai.use`), not a
> sixth role. Display labels stay Uzbek via i18n; only the internal codes are standardized.

## Custom roles

`super` can create custom roles in system settings (`system_settings.custom_roles`, JSONB) with a
bespoke permission set. Permission resolution order: check `custom_roles` first; if not found, fall back
to the system-role defaults in the permission catalog. `super` always resolves to `['*']`.

## Duty — team-level role

An audit team member has one duty (`audit_group_members.primary_duty`):

- **`group_lead`** — team leader (exactly one per audit; submits the project, approves findings at
  stage 1).
- **`auditor`** — ordinary team member (does tasks, files findings).

Duty is **separate from system role** and drives the approval flows and task management.

## Permission catalog (45 permissions)

Defined as `module.action`:

| Permission group | Module | Actions |
| --- | --- | --- |
| `org.*` | Organization | create / update / delete / view_all / view_own / manage_contacts / manage_devices |
| `audit.*` | Audit | create / update / delete / approve / view_all / view_own |
| `group.*` | Group | form / edit |
| `task.*` | Task | assign / view_own / view_group / update_status |
| `finding.*` | Finding | create / approve / reject |
| `config.upload` | Analysis | Upload config files (Cisco / Linux / Nginx / Apache / MikroTik) |
| `scanner.import` | Analysis | Import scanner results (Nessus / Nmap / OpenVAS / Burp / ZAP) |
| `traffic.upload` | Analysis | Traffic analysis (PCAP / Suricata / Zeek / Wireshark) |
| `ai.use` | AI | Use the AI/Ollama assistant |
| `report.*` | Report | create / approve / export |
| `kpi.*` | KPI | view_own / view_all |
| `user.*` | User | create / update / disable |
| `role.manage` | Role | Manage custom roles |
| `system.*` | System | settings / audit_log |
| `agent.*` | Agent | token (issue) / revoke |

## Authorization pipeline

Every command/query passes through, in order:

1. **Validation** — validate inputs (FluentValidation in .NET; use **Zod** in our stack).
2. **Authorization** — required permissions are looked up per command; the user must hold **at least
   one** (OR logic) **or** `super` (`*`).
3. **Handler** — business logic, often with an additional **duty/ownership** check (defense-in-depth).

Example: updating task status isn't in the static permission map — the handler checks ownership
(`assignee` | `group_lead` duty | `super`). Combined with DB-level **RLS**, this yields multi-layered
protection.
