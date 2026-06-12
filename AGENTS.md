# AGENTS.md — Auditor

Guidance for any coding agent (Claude Code or otherwise) working in this repo. Read this first, then
[DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md). App-specific rules live in [web/AGENTS.md](web/AGENTS.md).

## What this is

**Auditor** — a closed-network (air-gapped) cybersecurity-audit management platform, UI in
**Uzbek (Latin)**. The production Next.js + TypeScript app has been built from a Claude-designed
HTML/CSS/JS prototype. The prototype and full spec remain the design truth for any new screens.

## Repo map

- `web/` — the production Next.js app. **Almost all new code goes here.** See [web/AGENTS.md](web/AGENTS.md).
- `agent/` — the **.NET 8 WPF desktop agent** (TZ §16). The **one** exception to "code lives in `web/`":
  a native Windows app can't live in the Next.js tree. Its server contract still lives in `web/` under
  `src/app/api/v1/agent/**`. See [ADR-0002](docs/decisions/0002-desktop-agent-scope.md).
  **Never commit `bin/`, `obj/`, or `publish/` directories** — they are excluded by `.gitignore`.
- `docs/` — **curated English specification** (the build-facing reference). Start at
  [docs/README.md](docs/README.md): requirements split by domain (overview, RBAC, domain model,
  workflows, analysis/AI, reporting/KPI, audit-log/agent, security) + an ADR layer in
  [docs/decisions/](docs/decisions/). **Read the relevant docs/ page before building a feature.**
- `project/` — design handoff bundle, **READ-ONLY** provenance:
  - `project/app/ui_kits/auditor/` — the prototype (`screens-*.jsx`, `chrome.jsx`, `data.js`, …).
  - `project/app/tokens/` — original design tokens (already vendored into `web/src/styles/`).
  - `project/design_handoff_auditor/` — handoff spec docs (routes, data model, flows, i18n, security).
  - `project/uploads/TZ_extracted.txt` — the formal technical spec (TEXNIK TOPSHIRIQ, Uzbek).
- `DEVELOPMENT-PLAN.md` — stack decision, status, and the phased build plan.

> `docs/` is the curated, English, build-facing spec; `project/` is the immutable source it was derived
> from. Prefer `docs/`; dip into `project/` for exact prototype markup or original wording.

## Golden rules

1. **Design is truth, code is fresh.** Match the prototype **≥90%** (visually faithful), but **never**
   copy its `React.createElement`/Babel structure. Write clean, typed `.tsx`. Check each screen against
   the prototype (`project/app/ui_kits/auditor/`) and the reference shots in `project/app/screenshots/`.
2. **Tokens only.** Color, spacing, typography, radius, shadow come from the vendored token layer
   (`web/src/styles/tokens/`). No raw hex or off-system fonts — ESLint warns on these. Don't invent
   token values; reuse existing component classes (`.btn`, `.panel`, `.stat`, `.tag`, `.sev`, …).
3. **Uzbek (Latin) UI, always via i18n.** All user-facing text through `next-intl` (`useTranslations`),
   never hardcoded. Sentence case; no emoji; no exclamation marks. Correct glyphs: `oʻ`, `gʻ`, `ʼ`.
   UPPERCASE only for small meta/stat labels and sidebar group headers.
4. **Security first.** Enforce RBAC on the **server** (Server Action / Route Handler + DB RLS) — a UI
   gate is not enough. The audit log is **append-only**. Secrets live in `.env.local`, never committed.
5. **Light + Dark.** `data-theme` on `<html>` (default `dark`). Style only via semantic aliases so both
   themes work automatically.
6. **Reduced motion.** Every animation gated behind `@media (prefers-reduced-motion: no-preference)`.
7. **Server-first.** Fetch in Server Components; mutate via Server Actions. Keep client state minimal;
   add `"use client"` only for interactivity/browser APIs.
8. **Tests ship with the feature.** Every feature gets, *written alongside the code*: unit +
   integration + E2E + frontend (component) tests. No feature is done until they pass. See
   **Definition of Done**.
9. **Small, green commits.** One screen or component each.

## Commands (run from `web/`)

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build — must pass before any handoff
npm run lint         # ESLint + design-token adherence
npm run typecheck    # tsc --noEmit
npm run test         # Vitest — unit + component (jsdom + Testing Library)
npm run test:e2e     # Playwright — E2E + visual regression
npm run format       # Prettier
```

## Development workflow

All feature work follows this skill sequence in Claude Code:

1. **`/grill-me`** — interview requirements until the design is fully understood
2. **`superpowers:writing-plans`** — produce a task-by-task implementation plan saved to
   `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`
3. **`superpowers:subagent-driven-development`** — execute the plan task-by-task; fresh subagent
   per task + two-stage review (spec compliance → code quality) after each
4. **`superpowers:finishing-a-development-branch`** — final review + push when all tasks complete

The superpowers plugin must be installed (`claude plugin install superpowers`).

## Definition of Done (every feature)

A feature is **not done** until all of these pass:

- [ ] **Unit** tests for logic (Vitest) — e.g. `rbac.ts`, KPI scoring.
- [ ] **Component** tests for UI (Vitest + Testing Library) — render, props, interaction, a11y role.
- [ ] **Integration** tests across modules / Server Actions / Route Handlers (with a test DB once
      Phase 1 lands).
- [ ] **E2E** test for the user flow (Playwright), plus a **visual snapshot** for design fidelity.
- [ ] **Design fidelity ≥90%** vs. the prototype (eyeball against `project/app/ui_kits/auditor/` +
      `project/app/screenshots/`; tokens only).
- [ ] `npm run build && lint && typecheck && test` all green.

Tests live next to the code (`*.test.ts[x]`); E2E specs in `web/e2e/`.

## Settled facts

- **Stack:** Next.js full-stack with a **new TypeScript backend** (greenfield from the spec; the .NET
  system in the TZ is reference only). [ADR-0001](docs/decisions/0001-frontend-stack.md).
- **Role codes (canonical):** `super / head / chief / lead / t1`. Normalize the prototype's codes
  (`departament/bolim/bosh/yetakchi/toifa1`) on import; "tahlilchi"/analyst is a **permission**, not a
  role. [ADR-0006](docs/decisions/0006-role-codes.md).
- **Database:** PostgreSQL — local server, database `auditor`. Credentials via `DATABASE_URL` /
  `DIRECT_URL` env vars. See `deploy/.env.production.example`.
- **Auth:** Auth.js (session-based, credentials provider). Secret in `AUTH_SECRET` env var.
- **AI/Ollama:** Local Ollama at `http://127.0.0.1:11434`, model `qwen/qwen3-coder-30b` (configured
  via `OLLAMA_URL` + `OLLAMA_MODEL`). Optional — the app degrades gracefully without it.
- **Deployment:** Linux server, app at `/opt/auditor/web/`. See `deploy/` scripts and
  `deploy/.env.production.example` for the full env var reference.

## Ask, don't assume

Still **open** — see the ADRs in [docs/decisions/](docs/decisions/):
- Report-export library ([ADR-0003](docs/decisions/0003-reporting-export.md)) — DOCX/PDF library not finalised.
- RLS scoping — row-level security per role not yet wired in Prisma.
- Legacy .NET data migration — whether historical audit data must be imported is unconfirmed.

Surface these rather than guessing.

> Package manager is **npm** here (the handoff docs mention pnpm — ignore that; we use npm).
