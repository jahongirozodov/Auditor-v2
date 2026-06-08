# CLAUDE.md

This repo's working guidance is shared across agents in [AGENTS.md](AGENTS.md) — read it first.

@AGENTS.md

## Claude-specific notes

- Start each task by reading [AGENTS.md](AGENTS.md) and [DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md);
  the app-specific build rules are in [web/AGENTS.md](web/AGENTS.md) (also imported by
  [web/CLAUDE.md](web/CLAUDE.md) when you work inside `web/`).
- `project/` is **read-only** design reference — never edit it. All code goes in `web/`.
- Next.js here is **v16** (newer than training data); consult `web/node_modules/next/dist/docs/`
  before using unfamiliar Next APIs.
- Prefer the dedicated file/search tools, keep changes scoped, and leave the build green
  (`npm run build && npm run lint && npm run typecheck`) before finishing.
