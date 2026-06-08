# Auditor — Specification (docs)

Curated, English specification for **Auditor**, derived from the formal technical spec
(`TEXNIK TOPSHIRIQ`) and the Claude design handoff. This is the **repo-owned, build-facing** reference;
the raw sources stay immutable under [../project/](../project/).

## How to read this

- Start with [00-overview](00-overview.md), then jump to the area you're working on.
- **Stack-independent docs** (domain, RBAC, workflows, KPI, security rules) are the durable
  requirements — true regardless of implementation technology.
- **Reference docs** are marked with a ⚠️ banner. They capture *requirements and contracts* from the
  TZ, which documents an **existing .NET 8 / Blazor implementation**. Our implementation stack is
  **Next.js full-stack** — see [ADR-0001](decisions/0001-frontend-stack.md) and
  [../DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md). Read these for *what* the system must do, not *how*
  to wire the backend.

## Provenance (do not edit)

- Formal spec (Uzbek, 25 sections): [../project/uploads/TZ_extracted.txt](../project/uploads/TZ_extracted.txt)
  — a reverse-engineering analysis of the current .NET codebase (v1.1, 2026-06).
- Design handoff (Next.js-oriented split docs): [../project/design_handoff_auditor/](../project/design_handoff_auditor/)
- Prototype (React/Babel): [../project/app/ui_kits/auditor/](../project/app/ui_kits/auditor/)

## Index

| Doc | Covers | TZ § | Type |
| --- | --- | --- | --- |
| [00-overview](00-overview.md) | Purpose, users, glossary | 1–2 | requirement |
| [01-architecture](01-architecture.md) | Layers, CQRS, API, navigation, full stack | 3, 19, 20, 23 | ⚠️ reference |
| [02-rbac-and-roles](02-rbac-and-roles.md) | Roles, duties, 45 permissions, authz pipeline | 4 | requirement |
| [03-domain-model](03-domain-model.md) | Entities, relationships, DB / RLS | 5, 18 | requirement |
| [04-workflows](04-workflows.md) | Audit lifecycle, 3-step approvals, task state machine | 6–9 | requirement |
| [05-analysis-and-ai](05-analysis-and-ai.md) | Config/scanner/traffic parsers, topology, Ollama | 10–11 | requirement |
| [06-reporting-kpi-notifications](06-reporting-kpi-notifications.md) | Reports, KPI scoring, notifications | 12–14 | requirement |
| [07-audit-log-and-agent](07-audit-log-and-agent.md) | Audit log, EXE desktop agent | 15–16 | mixed |
| [08-security](08-security.md) | Auth, authz, audit trail, hardening | 17 | requirement |
| [09-testing-devops-constraints](09-testing-devops-constraints.md) | Tests, deploy, requirements, known limits | 21–22, 24–25 | ⚠️ reference |
| [decisions/](decisions/) | Architecture Decision Records | — | decision |

> Keep these docs in sync as decisions land. When a requirement changes, update the relevant doc and,
> if it reflects a choice, add or update an ADR under [decisions/](decisions/).
