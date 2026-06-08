# ADR-0002 — EXE desktop agent & analysis-parser scope

- **Status:** Open
- **Date:** 2026-06-08

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

## Open questions

1. Is the existing .NET WPF agent reused as-is (and we only build its server/web touchpoints), or is a
   new agent in scope?
2. Are the parsers reused from the existing .NET backend (path B), or must they be reimplemented?
3. Priority/timeline for agent + parsers relative to the core web screens.
