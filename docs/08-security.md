# 08 — Security

> Source: TZ §17 (translated). **Stack-independent requirement** — these controls are mandatory in our
> stack. See also the handoff's [agent-rules/02-security.md](../project/design_handoff_auditor/agent-rules/02-security.md).

## Authentication (TZ §17.1)
- Username/password login.
- JWT (HMAC-SHA256) access + refresh tokens.
- **Argon2id** password hashing (m=65536 / t=3 / p=4).
- **TOTP 2FA** + QR code.
- Failed-login protection (lockout — 5 attempts → 15 min in the design handoff).
- Password reset (`PasswordResetToken` + email).
- Session max 8 hours ("remember this device for 8 hours").

## Authorization (TZ §17.2)
- **Cookie auth** for the web UI.
- **JWT Bearer** for the REST API.
- **Audit token** (HS256) for the desktop agent.
- **Permission-based RBAC** in the authorization pipeline — see [02-rbac-and-roles](02-rbac-and-roles.md).
- **RLS (PostgreSQL Row-Level Security)** — DB-level protection / multi-tenant isolation.

> **Mandatory in our stack:** re-check RBAC on the **server** for every Server Action / Route Handler;
> a UI gate is not enough. Combine with DB RLS (defense-in-depth).

## Audit trail (TZ §17.3)
- All CRUD/auth actions → `audit_logs` (append-only) — see [07-audit-log-and-agent](07-audit-log-and-agent.md).
- `LoginAttempt` — every login attempt.
- `AuditTokenUsageLog` — every agent-token use.
- `FileAccessLog` — file access.

## Other hardening (TZ §17.4)
- HTTPS in production (nginx TLS termination).
- Anti-CSRF.
- Security HTTP headers.
- Input validation (FluentValidation in .NET; **Zod** in our stack).
- Resilience (retry / circuit-breaker — Polly in .NET) for external services.

## Threat-model notes (from the design handoff)
- The system stores vulnerability findings (SQLi, RCE, …) — treat them as **data only; never execute**.
- Sanitize AI responses: safe markdown render; `dangerouslySetInnerHTML` is forbidden (escape-only).
- Secrets live in `.env.local`, never committed (see [../web/.env.example](../web/.env.example)).
- Closed-network posture: `CLOSED_NETWORK=true` blocks external calls; self-host fonts.
