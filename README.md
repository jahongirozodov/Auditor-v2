# Auditor

Closed-network (air-gapped) cybersecurity-audit management platform, UI in **Uzbek (Latin)**. This repo
turns a Claude-designed prototype into a production **Next.js + TypeScript** application.

## Start here

- **[AGENTS.md](AGENTS.md)** — how to work in this repo (golden rules, settled facts, commands).
  Claude Code: see [CLAUDE.md](CLAUDE.md).
- **[DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md)** — stack decision, current status, phased build plan.
- **[docs/](docs/)** — curated English specification (requirements by domain + decision records).

## Layout

- **[web/](web/)** — the production Next.js app. **All new code goes here.** ([web/AGENTS.md](web/AGENTS.md))
- **[docs/](docs/)** — build-facing spec derived from the sources below.
- **[project/](project/)** — the original Claude Design handoff bundle, **READ-ONLY** (the prototype in
  `project/app/ui_kits/auditor/`, the design tokens, and the formal spec
  `project/uploads/TZ_extracted.txt`). Design source of truth — recreate it faithfully; don't edit it.

## Run

```bash
cd web
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # ESLint + design-token adherence
npm run typecheck  # tsc --noEmit
```

> Origin: a hi-fi HTML/CSS/JS design exported from Claude Design (claude.ai/design). The prototype is a
> visual reference, not production code — match its output, not its internal structure.
