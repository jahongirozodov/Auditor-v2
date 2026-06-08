# Auditor — Development Plan

## Context

**Auditor** is a closed-network (air-gapped) cybersecurity-audit management platform for
government/enterprise use. A hi-fi interface was designed in Claude (HTML/CSS/JS prototype, React
via CDN + Babel) and shipped as a handoff bundle under [project/](project/). This repository turns
that prototype into a **production system**.

UI language is **Uzbek (Latin)**. The system manages organizations, audit lifecycles, audit teams,
tasks, findings (vulnerabilities), multi-stage approvals, specialist KPI, local-AI analysis, network
topology, and compliance reporting — with an immutable audit trail throughout.

This document is the single source of truth for **how we build it** and the **current status**.

---

## Stack decision

**Next.js full-stack (TypeScript end-to-end)** — confirmed by the owner, including a **new TypeScript
backend** ([ADR-0001](docs/decisions/0001-frontend-stack.md), path A). The existing .NET system the TZ
documents is **reference only** — this repo has no .NET source and we do not call it; its API contracts
just inform our own endpoint shapes.

| Layer        | Choice                                                                 |
| ------------ | --------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, RSC) + React 19 + TypeScript (strict)         |
| Styling      | Vendored design-system **CSS tokens + component classes** (no Tailwind) |
| Fonts        | `next/font` self-hosted (Plus Jakarta Sans, Manrope, JetBrains Mono)  |
| i18n         | `next-intl` (Uzbek default; ru/en reserved)                           |
| Data         | Prisma + PostgreSQL 16 (Row-Level Security) — _Phase 1_               |
| Auth         | Auth.js (NextAuth v5): AD/LDAP + cert, Argon2id, TOTP — _Phase 3_     |
| AI           | Local Ollama proxy via `/api/ai` (qwen2.5) — _Phase 6_                |
| Storage      | MinIO / S3-compatible (evidence, PCAP, reports) — _Phase 6/7_         |
| Icons        | `lucide-react` (map the prototype's custom set) — _Phase 2_           |

### What already exists vs. what we build

The TZ is a reverse-engineering of an **already-built .NET 8 / Blazor system**. We are **not** reusing
or integrating it — we build a **fresh Next.js + TypeScript implementation from the spec** in
[docs/](docs/). Treat the .NET stack, API routes, and DB schema in the spec as **requirements and
reference contracts**, not as code to call. (Open follow-up: whether the old system runs in parallel and
whether any real data must be migrated — see [Decisions log](#decisions-log).)

---

## Repository layout

```
auditor-v6/
├─ web/                     # ← the production Next.js app (all new code lives here)
│  ├─ src/app/              # App Router routes, layout, fonts
│  ├─ src/components/       # UI primitives, chrome, feature components
│  ├─ src/i18n/             # next-intl config + request resolver
│  ├─ src/styles/           # vendored design-system CSS (tokens + components) — DO NOT restyle
│  ├─ messages/             # i18n catalogs (uz.json)
│  └─ .env.example          # environment template (copy to .env.local)
├─ docs/                    # curated English spec (build-facing): 00–09 by domain + decisions/ (ADRs)
├─ project/                 # design handoff bundle — READ-ONLY provenance (source of truth for design)
│  ├─ app/ui_kits/auditor/  # the React/Babel prototype (screens-*.jsx, chrome.jsx, data.js …)
│  ├─ app/tokens/           # original token CSS (already vendored into web/src/styles)
│  ├─ design_handoff_auditor/  # handoff spec docs: routes, data model, flows, i18n, security
│  └─ uploads/TZ_extracted.txt # the formal technical spec (TEXNIK TOPSHIRIQ)
├─ AGENTS.md                # how agents should work in this repo (canonical)
├─ CLAUDE.md                # Claude Code entry (imports AGENTS.md)
└─ DEVELOPMENT-PLAN.md      # this file
```

**Golden rule:** `project/` is the design **truth**; never edit it. All production code goes in `web/`.
Recreate the prototype **pixel-faithfully** as clean `.tsx` — never copy its `React.createElement`
structure.

---

## Environment — DONE ✅ (Phase 0)

Already set up and verified (`npm run build && npm run lint && npm run typecheck` all green):

- Next.js 16 + TS app scaffolded in `web/` (App Router, `src/`, no Tailwind, `@/*` path alias).
- Design-system CSS vendored into `web/src/styles/` (`tokens/*`, `app.css`, `kit-extra.css`, `wow.css`)
  and imported once via `src/app/globals.css`.
- Fonts self-hosted via `next/font` (`src/app/fonts.ts`) — no Google CDN at runtime (closed-network
  friendly). Token aliases wired in `src/styles/tokens/fonts.css`.
- Dark-first theming: `<html data-theme="dark">` + no-flash bootstrap script + `ThemeToggle`
  (`useSyncExternalStore`). Light/dark both work via semantic tokens.
- i18n: `next-intl` (no-routing mode), locale from `NEXT_LOCALE` cookie, default `uz`,
  catalog at `messages/uz.json`, plugin wired in `next.config.ts`.
- Tooling: ESLint (Next config + **design-token adherence** warnings for raw hex / non-system fonts),
  Prettier, `typecheck`/`format` scripts, `.editorconfig`, root `.gitignore`, `.env.example`.

### Prerequisites for later phases (not yet installed)

- **PostgreSQL 16** — via Docker (`docker run` or compose) for local dev.
- **Ollama** + `qwen2.5:14b-instruct` pulled locally (Phase 6).
- **MinIO** (or any S3-compatible) for object storage (Phase 6/7).

### Commands

```bash
cd web
npm run dev          # dev server (Turbopack) — http://localhost:3000
npm run build        # production build — must pass before any handoff
npm run lint         # ESLint (+ token adherence)
npm run typecheck    # tsc --noEmit
npm run format       # Prettier write
```

---

## Testing & quality (continuous, not a final phase)

Per the standing rule, **every feature ships with its tests** (written alongside the code) and must
match the prototype **≥90%**. See the **Definition of Done** in [AGENTS.md](AGENTS.md).

| Layer | Tool | Scope |
| --- | --- | --- |
| Unit | Vitest | Pure logic (`rbac.ts`, KPI scoring, formatters) |
| Component (frontend) | Vitest + Testing Library (jsdom) | Render, props, interaction, a11y roles |
| Integration | Vitest (+ test DB from Phase 1) | Server Actions / Route Handlers / multi-module |
| E2E | Playwright | User flows (login, approvals, task lifecycle, AI) |
| Visual / fidelity | Playwright `toHaveScreenshot` | ≥90% match vs. prototype + `project/app/screenshots/` |

Harness already wired (`web/`): `npm run test` (unit + component), `npm run test:e2e` (E2E + visual);
specs in `web/e2e/`, setup in `web/src/test/`. Phase 8 is a final hardening **sweep**, not where tests
first appear.

## Phased build plan

Each phase ends with **green `npm run build && lint && typecheck && test`** (+ `test:e2e` for flows) and
a fidelity check against the prototype. Keep commits small (one screen/component each), each with tests.

### Phase 0.5 — Domain types & fixtures (do before UI work)
- Define TypeScript domain types in `lib/types/*` from [docs/03-domain-model](docs/03-domain-model.md)
  (entities, enums, the canonical role codes `super/head/chief/lead/t1`, statuses, severities, codes).
- Port [project/app/ui_kits/auditor/data.js](project/app/ui_kits/auditor/data.js) into **typed
  fixtures** under `lib/fixtures/*`, normalizing the prototype's role codes to the canonical set (see the
  mapping in [docs/02-rbac-and-roles](docs/02-rbac-and-roles.md)).
- `lib/rbac.ts` → `can(role, permission)` driven by the 45-permission catalog; model **analyst access as
  permissions** (`config.upload`/`scanner.import`/`traffic.upload`/`ai.use`), not a separate role.
- These types are the single contract the UI builds against now and Prisma generates toward in Phase 1.
- **Check:** screens can import typed fixtures; `rbac.ts` unit-tested against the role matrix.

### Phase 1 — Data layer
- Prisma schema for: User, Role, Organization (+Contact, +Device), Audit (+Workflow stages),
  Task (+StatusHistory), Finding (+Evidence, +Approval), KpiRule/KpiEvent, AuditToken, AuditLog,
  AiAnalysisResult, Report. Reuse the Phase 0.5 enums/codes; model from
  [docs/03-domain-model](docs/03-domain-model.md). Enums, FKs, indexes, UUID PKs, `timestamptz`,
  check constraints (status/severity/duty/stage).
- PostgreSQL **RLS** policies for multi-tenant isolation; wire `lib/rbac.ts` server-side.
- `lib/data/*` server-side accessors; `prisma/seed.ts` from the Phase 0.5 fixtures.
- **Check:** `prisma studio` shows seeded data; RLS verified with two tenants.

### Phase 2 — App shell + UI primitives
- `components/ui/*`: Button, Tag, Sev, Stat, Panel, Card, Avatar, Tabs, Input/Field, Drawer, Modal,
  Toast, Donut, Sparkline — thin typed wrappers over the existing CSS classes (`.btn`, `.panel`, …).
- `components/chrome/*`: Sidebar (role-filtered groups ASOSIY/TAHLIL/TIZIM), Topbar (⌘K, theme, bell,
  user menu), PageHeader. `app/(app)/layout.tsx` = AppShell.
- Map `icons.jsx` glyphs → `lucide-react` (build a mapping table).
- **Check:** shell renders, sidebar collapses, responsive, light/dark correct.

### Phase 3 — Auth + login
- Auth.js: AD/LDAP + domain cert, Argon2id, TOTP, 8h session, 5-try lockout.
- Cinematic **WOW login** screen (animations gated by `prefers-reduced-motion`).
- `(app)` route guard; session → role. The prototype's role/theme "tweaks panel" is **not** ported.
- **Check:** login → dashboard; failed attempt → audit log entry.

### Phase 4 — Core screens
Dashboard, Organizations (+detail), Audits (+tabbed detail), My Tasks, Task detail, Findings (+drawer).
Pixel-accurate, data from Prisma, RBAC enforced on **both** UI and server.
- **Check:** all screens render with real data; permissions gate correctly.

### Phase 5 — Core flows
- `ApprovalFlow` (3-step group_lead → head → dept; immutable `approval_events`; mandatory return reason).
- Task workflow state machine (new → assigned → in_progress → review → done, +returned/blocked).
- Assignment screen with live workload distribution. Notifications (in-app bell + SMTP).
- **Check:** approve/return/resubmit cycle works; history is append-only.

### Phase 6 — Analysis & AI
- `/api/ai` → local Ollama proxy (streaming); AI screen (chat, preset chips, markdown, typing).
  Store every call in `AiAnalysisResult`. Sanitize output (no `dangerouslySetInnerHTML`).
- Analysis pipeline: upload → parse (Nessus/Nmap/OpenVAS/Burp/ZAP; Cisco/Linux/Nginx/…; PCAP/Suricata/Zeek)
  → normalize → AI → draft findings.
- **Network topology**: force-directed graph (port the prototype's custom sim; client component;
  drag/zoom/pan, severity filter, live flows gated by reduced-motion).
- **Check:** AI responds from local Ollama; topology interactive; a parsed file yields findings.

### Phase 7 — System + reporting
- KPI, Reports (PDF/DOCX export — see [Decisions log](#decisions-log) for library), Audit tokens,
  Users, Permissions matrix, Logs, EXE-agent screen (web side), Settings (6 sections), Profile.
- ⌘K command palette (global search across pages/audits/findings/tasks/orgs/users).
- **Print/PDF strategy:** dedicated `@media print` stylesheet + a server route that renders a
  print-optimized React view (chrome hidden, `page-break-inside: avoid`); mirrors the existing
  "Auditor — Print" layout. Generation library TBD (react-pdf vs. headless-Chromium vs. server lib).
- **Check:** full navigation; reports export; print layout paginates cleanly.

### Phase 8 — Polish & hardening
- A11y audit (keyboard, focus rings, contrast AA, ARIA), reduced-motion pass.
- Performance (RSC boundaries, `revalidatePath`/`revalidateTag`).
- E2E tests for critical flows (login, 3-step approval, task lifecycle, AI). Unit tests for
  `rbac.ts` and KPI scoring.
- **Check:** clean build, Lighthouse green, tests pass.

---

## i18n & reporting (planned in advance, per requirements)

- **i18n:** All user-facing strings go through `next-intl` (`useTranslations`) — no hardcoded UI text.
  Uzbek-Latin copy rules: sentence case, no emoji/exclamations, correct glyphs (`oʻ`, `gʻ`, `ʼ`),
  ISO dates, Uzbek relative time. Catalog grows under `messages/`. ru/en can be enabled later by
  adding catalogs + listing locales in `src/i18n/config.ts` (cookie switch today; locale-prefixed
  routing if/when needed — no component changes required).
- **Reporting/PDF:** report screens are built print-first; a print stylesheet + isolated print route
  exist from Phase 7. The export-generation library is the one open reporting decision below.

---

## Decisions log

**Resolved**

- ✅ **Frontend & backend stack** — Next.js full-stack, **new TypeScript backend** (greenfield from
  spec; .NET is reference only). [ADR-0001](docs/decisions/0001-frontend-stack.md).
- ✅ **Canonical role codes** — `super / head / chief / lead / t1` (prototype codes mapped). See the
  table in [docs/02-rbac-and-roles.md](docs/02-rbac-and-roles.md) and
  [ADR-0006](docs/decisions/0006-role-codes.md).
- ✅ **Styling / i18n** — vendored CSS tokens (no Tailwind); next-intl, Uzbek default.
  [ADR-0004](docs/decisions/0004-styling-css-tokens.md), [ADR-0005](docs/decisions/0005-i18n-next-intl.md).

**Still open (do not assume)**

1. **Desktop EXE agent + analysis parsers** — build now or stub the UI and defer.
   [ADR-0002](docs/decisions/0002-desktop-agent-scope.md).
2. **Report export library** — react-pdf vs. headless Chromium vs. server lib.
   [ADR-0003](docs/decisions/0003-reporting-export.md).
3. **Deployment target** — air-gapped Linux/Windows server? Docker? (affects fonts → `next/font/local`,
   secrets management, Ollama/MinIO endpoints).
4. **AD/LDAP, SMTP, Ollama, MinIO** connection details and whether test instances exist.
5. **RLS scoping** — isolate by organization, by audit team, or both? `own` permission semantics.
6. **Seed scale** — target counts for users/orgs/audits/findings for realistic dev data.
7. **Legacy .NET system** — does it run in parallel, and is there real data to migrate?

---

## References (in this repo)

**Primary — curated English spec:** [docs/README.md](docs/README.md) (requirements split by domain) and
the decision records in [docs/decisions/](docs/decisions/) (incl. the open backend/agent/export items).

Provenance (read-only sources the curated spec was derived from):

- Routes & screens: [project/design_handoff_auditor/02-ROUTES-AND-SCREENS.md](project/design_handoff_auditor/02-ROUTES-AND-SCREENS.md)
- Data model: [project/design_handoff_auditor/03-DATA-MODEL.md](project/design_handoff_auditor/03-DATA-MODEL.md)
- Flows & integrations: [project/design_handoff_auditor/04-FLOWS-AND-INTEGRATIONS.md](project/design_handoff_auditor/04-FLOWS-AND-INTEGRATIONS.md)
- Design tokens: [project/design_handoff_auditor/01-DESIGN-TOKENS.md](project/design_handoff_auditor/01-DESIGN-TOKENS.md)
- Agent rules: [project/design_handoff_auditor/agent-rules/](project/design_handoff_auditor/agent-rules/)
- Formal spec (Uzbek): [project/uploads/TZ_extracted.txt](project/uploads/TZ_extracted.txt)
