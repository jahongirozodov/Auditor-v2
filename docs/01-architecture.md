# 01 — Architecture & technology

> ⚠️ **REFERENCE — implementation stack differs.** The TZ documents an **existing .NET 8 / ASP.NET Core
> / Blazor Server** implementation (reverse-engineered). Our chosen stack is **Next.js full-stack
> (TypeScript)** — see [ADR-0001](decisions/0001-frontend-stack.md) and
> [../DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md). Treat this document as the **requirements and
> contracts** (what the system does, its API surface, its navigation) — not as build instructions for
> the backend. The **backend technology is an open decision** (full-TS vs. reuse the existing .NET API).

> Source: TZ §3, §19, §20, §23.

## Architectural principles (TZ §3)

The existing system uses **Clean Architecture** with these layers:

| Layer (.NET project) | Responsibility |
| --- | --- |
| `Auditor.Domain` | Entities, value objects, business rules, domain events |
| `Auditor.Application` | CQRS (MediatR), command/query handlers, FluentValidation, pipeline behaviors, permission catalog |
| `Auditor.Infrastructure` | EF Core DbContext, migrations, parsers, JWT, Argon2, AI/Ollama, MinIO, email, Hangfire jobs |
| `Auditor.Agent.Shared` | Shared DTOs/contracts between agent and server |
| `Auditor.Api` | REST API (ASP.NET Core 8 Minimal APIs) — JWT + audit token |
| `Auditor.Web` | Blazor Server UI (cookie auth) |
| `Auditor.Agent.Desktop` | WPF EXE client (Windows) — offline + DPAPI/AES-GCM-encrypted SQLite |

Principles worth preserving regardless of stack:

- **CQRS** — each operation is a distinct command or query.
- **Pipeline:** validation → authorization → handler.
- **Result\<T\> pattern** — explicit success/error instead of exceptions.
- **Event-driven side effects** — KPI and bell notifications fire off domain events/notifications.
- **Defense-in-depth:** UI guard → authorization layer → handler (ownership/duty) → DB (RLS + check
  constraints). _This layering is mandatory in our stack too — see [08-security](08-security.md)._

## API surface (TZ §19)

The API splits into two segments (full list ≈ 69 endpoints):

- `/api/v1/web/*` — for the web UI (cookie or JWT auth)
- `/api/v1/agent/*` — for the desktop agent (audit token)

> In our Next.js build these become Route Handlers / Server Actions (or a thin client over the
> existing .NET API if that backend is kept — open decision). The **shapes below are the contract.**

**Auth**

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Login (username + password) |
| POST | `/api/auth/login/2fa` | 2FA confirm |
| POST | `/api/auth/refresh` | Token refresh |
| POST | `/api/auth/2fa/setup` | 2FA setup |

**Web resources (representative)**

| Method | Path | Purpose |
| --- | --- | --- |
| CRUD | `/api/v1/web/organizations` | Organizations |
| CRUD | `/api/v1/web/audits` (+ `/{id}/status`) | Audits |
| GET/POST | `/api/v1/web/audits/{id}/group/members` (+ `eligible-users`) | Team members |
| CRUD | `/api/v1/web/projects` | Projects |
| POST | `/api/v1/web/projects/{id}/submit\|approve\|return` | Project approval actions |
| GET | `/api/v1/web/projects/{id}/approvals` | Project approval timeline |
| GET/POST | `/api/v1/web/tasks` (+ `/{id}/assign`, `/{id}/status`) | Tasks |
| GET | `/api/v1/web/my/tasks` | My tasks |
| GET/POST | `/api/v1/web/vulnerabilities` | Findings |
| POST | `/api/v1/web/vulnerabilities/{id}/submit-review` | Submit for review |
| POST | `/api/v1/web/vulnerabilities/{id}/approve-stage\|reject-stage` | Stage approve / return |
| GET | `/api/v1/web/vulnerabilities/{id}/approvals` | Finding timeline |
| GET/POST | `/api/v1/web/reports` | Reports |
| GET | `/api/v1/web/users` | Users |
| GET | `/api/v1/web/audit-logs` | Audit log |

**Agent endpoints** and admin endpoints (audit-token issue, password reset) are detailed in
[07-audit-log-and-agent](07-audit-log-and-agent.md).

## Navigation structure (TZ §20)

The Blazor UI nav groups map directly onto our app shell (sidebar groups ASOSIY / TAHLIL / TIZIM in the
prototype). See [../project/design_handoff_auditor/02-ROUTES-AND-SCREENS.md](../project/design_handoff_auditor/02-ROUTES-AND-SCREENS.md)
for the Next.js route mapping.

| Group | Pages |
| --- | --- |
| NAZORAT (control) | Dashboard, Organizations |
| AUDIT | Audit cards, Audit group, Audit project, Tasks, My tasks |
| TAHLIL (analysis) | Findings, Configuration, Scanner import, Network topology, Traffic analysis, AI/Ollama |
| HISOBOT (reporting) | KPI rating, Reports |
| TIZIM (system) | Profile, Users, Roles matrix, Audit log, Desktop agent, Settings |

## Full technology list as built (TZ §23) — reference only

.NET 8 LTS (C# 12) · ASP.NET Core 8 + Blazor Server · Minimal APIs + Swashbuckle · EF Core 8 + Npgsql ·
PostgreSQL 16 (RLS) · MediatR 12 · FluentValidation 11 · Mapster · JWT · Konscious Argon2 · Otp.NET +
QRCoder · MinIO 6 · MassTransit + RabbitMQ · StackExchange.Redis (optional) · Hangfire (PostgreSQL) ·
MailKit/MimeKit · QuestPDF / OpenXml / ClosedXML · SharpPcap + PacketDotNet · HtmlAgilityPack · Polly ·
Serilog · prometheus-net + Grafana · WPF agent (DPAPI + AES-GCM + SQLite) · xUnit/FluentAssertions/
NSubstitute/Bogus/Testcontainers/bUnit · StyleCop + SonarAnalyzer · Docker + nginx.

> **Our stack** (see [../DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md)): Next.js 16 + React 19 + TS;
> vendored CSS tokens; `next-intl`; Prisma + PostgreSQL (planned); Auth.js; local Ollama proxy; MinIO/S3.
