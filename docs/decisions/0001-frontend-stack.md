# ADR-0001 — Frontend & overall stack

- **Status:** Accepted (frontend **and** backend)
- **Date:** 2026-06-08

## Context

The bundle carries two sources that disagree on technology:

1. The **formal TZ** ([../../project/uploads/TZ_extracted.txt](../../project/uploads/TZ_extracted.txt))
   documents an **existing, already-built .NET 8 / ASP.NET Core / Blazor Server / EF Core / CQRS
   (MediatR) / PostgreSQL 16** system, plus a **WPF Windows EXE agent**. It is a reverse-engineering
   analysis of the current codebase (v1.1).
2. The **Claude design handoff** ([../../project/design_handoff_auditor/](../../project/design_handoff_auditor/))
   assumes a **Next.js + Prisma + Auth.js** TypeScript full-stack.

Crucially, **this repo contains only the design + spec — no .NET source.** The owner chose Next.js +
TypeScript for the production build.

## Decision

- **Frontend:** Next.js (App Router) + React + TypeScript, recreating the prototype faithfully as clean
  `.tsx`.
- **Styling / fonts / i18n:** vendored CSS tokens (no Tailwind), `next/font`, `next-intl` —
  [ADR-0004](0004-styling-css-tokens.md), [ADR-0005](0005-i18n-next-intl.md).
- **Backend: new TypeScript backend (path A).** Prisma + PostgreSQL (RLS) + Auth.js + Route Handlers /
  Server Actions — built **greenfield from the spec**. The existing .NET system is **reference only**:
  we neither call it nor reuse its code; its API/DB contracts merely inform our own shapes.

> The rejected alternative (path B — Next.js UI over the existing .NET API) was declined: the .NET
> source/runtime isn't part of this project, and the owner wants a single-language TS system.

## Consequences

- Business logic is rebuilt in TypeScript from [../](../) (the curated spec) — RBAC, the two 3-step
  approval flows, task state machine, KPI engine, audit log, etc.
- The Prisma schema is modeled from [../03-domain-model.md](../03-domain-model.md); the
  `/api/v1/*` endpoints in [../01-architecture.md](../01-architecture.md) are **reference contracts** for
  shaping our Route Handlers, not an integration target.
- Plan Phases 1/3/6/7 proceed as full-stack (no integration shim). See
  [../../DEVELOPMENT-PLAN.md](../../DEVELOPMENT-PLAN.md).

## Open questions

1. Does the legacy .NET system run in parallel during/after the rebuild, and is there **real data to
   migrate**? (We have no DB access today, so we model from the spec.)
