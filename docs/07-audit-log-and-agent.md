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

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/agent/auth/login` | anonymous |
| POST | `/api/v1/agent/audit-token/validate` | anonymous |
| POST | `/api/v1/agent/audit-token/tasks` | anonymous |
| POST | `/api/v1/agent/audit-token/context` | anonymous |
| GET | `/api/v1/agent/audits/{auditId}/my-tasks` | auth |
| POST | `/api/v1/agent/findings/sync` | auth (batch) |
| GET | `/api/v1/agent/vulnerabilities` | auth |
| POST | `/api/v1/agent/evidences/upload` | auth (multipart) |
| GET | `/api/v1/agent/vulnerabilities/{id}/evidences` | auth |
| POST | `/api/v1/agent/sync/start` \| `/sync/complete` | auth |
| GET | `/api/v1/agent/sync/ping` | anonymous |
| POST | `/api/v1/agent/logs/upload` | auth |
| POST | `/api/v1/agent/token/revoke` \| `/token/refresh` | auth |
| GET | `/api/v1/agent/version` | anonymous |

**Admin:** `POST /api/v1/admin/audit-tokens` (issue token), `POST /api/v1/admin/users/{id}/reset-password`.
