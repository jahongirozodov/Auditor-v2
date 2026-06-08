# 00 — Overview

> Source: TZ §1–2 (translated). Stack-independent requirement.

## What Auditor is

**Auditor** is a corporate web platform for **planning, conducting, documenting, and reporting
information-security audits** of organizations. It centralizes, in one place:

- audit subjects (organizations, contacts, device inventories),
- auditor teams,
- the audit process itself,
- findings (vulnerabilities),
- specialist performance scoring (KPI),
- and the multi-stage approval flow for every finding and project.

It runs in a **closed network (air-gapped)** with a **local LLM (Ollama)** so confidential audit data
never leaves the perimeter. Primary UI language is **Uzbek (Latin)**.

## Goal

Conduct cybersecurity audits through a single, uniform process — managing all auditors on one platform
and guaranteeing the completeness, quality, and **traceability** of audit data.

## Core objectives

1. Centrally manage audit subjects (organizations, contacts, device inventory).
2. Form auditor teams and distribute tasks.
3. Formalize the audit **project** through a 3-step approval flow.
4. Promote discovered vulnerabilities to official status through a 3-step approval flow.
5. Import analysis results via automated parsers (config / scanner / traffic).
6. Enrich recommendations and reports with a local AI (LLM).
7. Export final reports as **PDF / DOCX / XLSX / HTML**.
8. Score specialist performance via a **KPI** point system.
9. Guarantee traceability of every action through the **audit_logs** trail.
10. Support offline fieldwork and server sync via the **EXE Desktop Agent**.

## Users

Five hierarchical system roles plus team-level duties — see [02-rbac-and-roles](02-rbac-and-roles.md):

| Role | Level | In short |
| --- | --- | --- |
| `super` | 100 | Department head / super admin — all permissions, final (dept) approval |
| `head` | 80 | Division chief — creates audits, forms teams, 2nd-stage (head) approval |
| `chief` | 60 | Senior specialist — usually the team's `group_lead`, distributes tasks |
| `lead` | 40 | Lead specialist — works as an auditor |
| `t1` | 20 | First-grade specialist — auditor (mostly sees their own tasks) |

Team duties (independent of role): **group_lead** (one per audit) and **auditor**.

## Problem it solves

Organizations need consistent, repeatable security audits with managed teams, peer-reviewed finding
quality, and compliance-grade reports. Auditor enforces a uniform process, validates findings through
multi-stage review, and keeps an immutable record of who did what, when.

## Glossary

- **Audit** — an engagement against one organization (`AUD-YYYY-NNN`).
- **Audit project** — the formalized goal/scope/methodology of an audit, itself approved in 3 steps.
- **Task** — a unit of audit work (`T-…`) assigned to an auditor.
- **Finding / Vulnerability** — a discovered weakness (`F-YYYY-NNNN`), approved in 3 steps before it
  enters the official report.
- **Duty** — a team-level role (`group_lead` / `auditor`), separate from the system role.
- **KPI** — point-based specialist performance score.
- **EXE Agent** — Windows desktop client for offline fieldwork that syncs to the server via a token.

> Document references in this set: routes/screens and data model also exist in the design handoff —
> see [../project/design_handoff_auditor/02-ROUTES-AND-SCREENS.md](../project/design_handoff_auditor/02-ROUTES-AND-SCREENS.md)
> and [../project/design_handoff_auditor/03-DATA-MODEL.md](../project/design_handoff_auditor/03-DATA-MODEL.md).
