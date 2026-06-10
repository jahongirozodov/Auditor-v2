# 07 — Audit log & EXE desktop agent

> Source: TZ §15–16, §19.3 (translated). **Mixed:** the audit-log rules are a stack-independent
> requirement; the desktop agent is a separate **Windows WPF EXE** product (see
> [open decision](decisions/0002-desktop-agent-scope.md) on whether/when we build it).

## Audit log (TZ §15)

Every significant action is written automatically to `audit_logs` (via an EF Core interceptor in the
current system), working together with RLS.

**Stored fields**

- **Operation:** CREATE / UPDATE / DELETE / LOGIN / LOGOUT / ACCESS
- **Resource:** table name + resource ID
- **Actor:** user_id, username, role
- **Network:** IP address, User-Agent
- **Payload:** before/after diff (JSONB)
- **Timestamp:** exact time (timestamptz, UTC)

**Retention:** long by default (`auth.log_retention_years` setting); a background job purges old rows.
The log is **append-only / immutable** — never edited or deleted by application code.

## EXE Desktop Agent (TZ §16)

**Purpose:** a Windows WPF EXE (.NET 8) for auditors working in the field (server rooms, networks with
no internet) to store data offline and later sync with the server. Built as a self-contained single-file
EXE.

**Core functions**
- Username/password login → JWT audit-token entry/validation.
- View assigned tasks.
- Create findings offline (with `idempotency_key`).
- Upload evidence files (encrypted locally; direct when online).
- Auto-sync on reconnect (sync queue + sync session).
- Version check (`GET /api/v1/agent/version`) → update notice.

**Security**
- Token encrypted at the Windows credential level via **DPAPI**.
- Local SQLite data encrypted with **AES-GCM**.
- Every sync session and token use is logged server-side.
- A revoked token blocks the agent.

**UI screens:** Login → Token → Tasks (master-detail) → Findings → Evidence → Sync → Offline → AI →
Settings → Logs. Includes an audit-context card and a sync center (pending / in-progress / synced /
failed counters).

> The agent **sees only its assigned tasks** (isolation boundary). Server address is currently
> hard-coded (`http://localhost:5081`); real-time server re-check and full 2FA are in the known-limits
> list — see [09-testing-devops-constraints](09-testing-devops-constraints.md).

## Agent endpoints (TZ §19.3)

Status: **✅ implemented** (milestone 1, walking skeleton — see
[ADR-0002](decisions/0002-desktop-agent-scope.md)) · **▫ deferred** (stubbed, later milestone).
Implemented handlers live under `web/src/app/api/v1/agent/**`; agent-`auth` rows verify the HS256 agent
JWT (`web/src/lib/agent/auth.ts`) and re-check the backing token on every call.

| Method | Path | Auth | Status |
| --- | --- | --- | --- |
| POST | `/api/v1/agent/auth/login` | anonymous | ✅ |
| POST | `/api/v1/agent/audit-token/validate` | anonymous | ✅ (returns the audit context too) |
| POST | `/api/v1/agent/audit-token/tasks` | anonymous | ▫ (use `my-tasks` after validate) |
| POST | `/api/v1/agent/audit-token/context` | anonymous | ▫ (folded into `validate`) |
| GET | `/api/v1/agent/audits/{auditId}/my-tasks` | agent | ✅ |
| POST | `/api/v1/agent/findings/sync` | agent (batch) | ✅ idempotent (`idempotencyKey`) |
| POST | `/api/v1/agent/evidences/upload` | agent (multipart) | ✅ bytes → `FileStorage.bytes` (bytea) + `FindingEvidence` |
| GET | `/api/v1/agent/vulnerabilities` | agent | ✅ findings in the token's audit |
| GET | `/api/v1/agent/vulnerabilities/{id}/evidences` | agent | ✅ evidence file metadata |
| POST | `/api/v1/agent/tasks/{taskId}/status` | agent | ✅ two-way status (reuses the `tasks-machine` guard) |
| POST | `/api/v1/agent/sync/start` \| `/sync/complete` | agent | ✅ |
| GET | `/api/v1/agent/sync/ping` | anonymous | ✅ |
| POST | `/api/v1/agent/logs/upload` | agent | ✅ each line → append-only `AuditLog` (`agent.log`) |
| POST | `/api/v1/agent/token/revoke` \| `/token/refresh` | agent | ✅ revoke (Settings logout) + refresh (extend JWT on sync) |
| GET | `/api/v1/agent/version` | anonymous | ✅ |

**Admin:** `POST /api/v1/admin/audit-tokens` (issue token), `POST /api/v1/admin/users/{id}/reset-password`.

> **Auth model:** password login → a login-scoped agent JWT; `audit-token/validate` re-mints an
> **audit-scoped** JWT (carries `auditId` + `tokenId`). Scoped endpoints reject a JWT whose audit
> doesn't match the path, or whose backing `AuditToken` is revoked/expired. Every token use is written
> to `AuditTokenUsageLog`; each sync session to `AgentSyncSession`.
