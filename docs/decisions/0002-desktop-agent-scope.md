# ADR-0002 — EXE desktop agent & analysis-parser scope

- **Status:** Accepted (agent build) — parser scope still open
- **Date:** 2026-06-08 · updated 2026-06-10

## Context

The TZ specifies a **Windows WPF EXE desktop agent** (.NET 8, offline SQLite + DPAPI/AES-GCM, token
sync) — see [../07-audit-log-and-agent.md](../07-audit-log-and-agent.md) — and a set of
**analysis parsers** (config/scanner/traffic) built on .NET libraries (SharpPcap, HtmlAgilityPack, …) —
see [../05-analysis-and-ai.md](../05-analysis-and-ai.md). Both are substantial, separate workstreams from
the web UI.

In the Next.js rebuild, the agent is **not a web concern** (it's a native Windows app), and the parsers
are backend processing that depend on [ADR-0001](0001-frontend-stack.md)'s backend path.

## Decision

**Deferred / open.** For the initial milestone we build the **web UI screens** for tokens, agent status,
and analysis (upload + results), backed by typed fixtures, and **stub** the actual agent binary and
parser engines until scope is confirmed.

## Consequences

- The web app shows the agent/analysis UI without a working agent or parsers — clearly marked as not yet
  wired.
- Keeps the first milestone focused on faithfully reproducing the interface.

## Resolution (2026-06-10) — agent

Q1 answered: **build a new .NET 8 WPF agent from scratch** (no prior code reused), **endpoints-first**.
The Next.js server now owns the agent contract under `/api/v1/agent/*`, and the .NET solution lives in
a new top-level **`agent/`** folder (sibling to `web/` — the one place code lives outside `web/`; noted
in the root [AGENTS.md](../../AGENTS.md)).

**Milestone 1 (this change) — walking skeleton:** `Login → Token → Tasks → create Finding offline →
Sync`, end-to-end, with encrypted local SQLite. Implemented server-side:

- Schema: `Finding.idempotencyKey` (unique), `AgentSyncSession`, `AuditTokenUsageLog`,
  `DesktopAgentVersion`.
- Auth: HS256 agent JWT (`AGENT_JWT_SECRET`) via `web/src/lib/agent/{jwt,auth}.ts`; reuses the web
  login path's Argon2id verify + lockout. A revoked/expired token blocks the agent on every call.
- Endpoints: `sync/ping`, `version`, `auth/login`, `audit-token/validate`,
  `audits/{auditId}/my-tasks`, `sync/start`, `findings/sync` (idempotent), `sync/complete`.
- Idempotent sync reuses `materializeFindings(..., "agent")`; re-syncing the same offline finding
  creates zero duplicates (TZ §9.5).

**Deferred to later agent milestones (still stubbed):** `evidences/upload`, `vulnerabilities`,
`audit-token/context` (folded into `validate`), `logs/upload`, `token/refresh|revoke`, and the
Evidence / Offline-browser / AI / Settings / Logs screens.

## Still open — parsers

2. Are the parsers reused from the existing .NET backend (path B), or must they be reimplemented?
   (Today they exist only in TypeScript in `web/src/lib/analysis/*`; the agent works offline via manual
   finding entry, so this does not block milestone 1.)
3. Priority/timeline for parsers relative to the remaining agent screens and core web screens.
