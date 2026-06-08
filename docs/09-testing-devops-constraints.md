# 09 — Testing, DevOps & constraints

> ⚠️ **REFERENCE — implementation stack differs.** Source: TZ §21–22, §24–25. The testing/DevOps stack
> below is the **existing .NET system's**; our equivalents (Vitest/Playwright, Next build, Docker) are
> in [../DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md). The **requirements and constraints** (§24) and
> the **known limits** (§25) carry over regardless.

## Testing strategy (TZ §22) — reference
.NET test projects (xUnit + FluentAssertions + NSubstitute + Bogus): Domain, Application (Testcontainers
PostgreSQL), Api (WebApplicationFactory), Web (bUnit), Agent (SQLite/DPAPI). Integration tests run
against real PostgreSQL: RBAC flow, notification handlers, password reset, 3-step approvals.

> **Our equivalent:** unit tests for `rbac.ts` and KPI scoring; E2E (Playwright) for login, 3-step
> approval, task lifecycle, AI. Every phase ends green on `build && lint && typecheck`.

## DevOps / deployment (TZ §21) — reference
- **Dev compose:** postgres 16, minio (S3 9000 / console 9001), rabbitmq (5672/15672), ollama (11434).
- **Monitoring:** Prometheus (9090) scraping `/metrics`, Grafana (3000).
- **Prod compose:** internal-only postgres, api, web, nginx (TLS, 80/443). Secrets via `.env.prod`
  (`POSTGRES_PASSWORD`, `JWT_SECRET`, `OLLAMA_URL`).
- Background jobs: Hangfire (PostgreSQL). Logging: Serilog. Health `/health`, metrics `/metrics`.

## Technical requirements & constraints (TZ §24) — carries over

**Server:** CPU 4+ cores (8+ for Ollama), RAM 16 GB+ (32 GB for large LLMs), Disk 100 GB+ SSD (PCAP/
evidence), OS Linux (Ubuntu 22.04+) or Windows Server.

**Client:** Chrome / Edge / Firefox (latest); WebSocket; desktop agent on Windows 10/11 (x64).

**Localization:** multilingual content via `LocalizedText` JSONB (**uz** primary, ru, en); default
neutral language `uz`; dates stored UTC, shown in local time. _(Matches our `next-intl` setup —
[../web/src/i18n/](../web/src/i18n/).)_

**Compliance:** OWASP Top 10 / ASVS (backend protection); NIST SP 800-115 (test methodology);
ISO 27001 / NIST CSF (report templates).

## Known limitations & future work (TZ §25) — carries over

These are acknowledged gaps in the current implementation; treat as backlog/risks:

**Desktop agent:** server status checked only at startup (no periodic re-check — stays "OFFLINE" if the
server comes back later); 2FA/TOTP fields exist in the UI but aren't wired to login; server address
hard-coded (`localhost:5081`); a version label mismatch (UI v3.2.0 vs actual 5.0.0); some buttons
(forgot-password, +Finding, AI assistant) lack handlers.

**Database / EF:** the `audit_tokens` `(audit_id, user_id)` unique index was made **partial**
(`WHERE revoked=false`) — one active token per (audit,user), but re-issue is allowed; some drift between
the model snapshot and the DB (e.g. `vulnerability_approvals` columns hand-edited) — recommend a clean
migration.

**Configuration:** API dev port 5080 but agent expects 5081 (align with `--urls`); in production, pass
JWT secret, DB password, SMTP, and Ollama URLs via environment variables.
