# Fix AGENTS.md / CLAUDE.md / web/AGENTS.md + .gitignore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove stale guidance from the three agent-facing doc files, add confirmed stack facts + superpowers workflow section, and stop agent binary artifacts from being committed to git.

**Architecture:** Four independent file edits + one git housekeeping step. No code logic changes — all edits are documentation and git config. `.gitignore` blocks future binary commits; `git rm --cached` removes the already-indexed binaries so the next push can succeed.

**Tech Stack:** Markdown, `.gitignore`, Git (PowerShell or Bash)

---

## File Map

| File | Change |
|---|---|
| `.gitignore` | Add `agent/` binary/build artifact rules |
| `AGENTS.md` | Update "What this is", "Settled facts", "Ask, don't assume"; add "Development workflow" section |
| `CLAUDE.md` | Add missing confirmed-stack note; align with AGENTS.md |
| `web/AGENTS.md` | Remove "arrive in later phases", remove placeholder-page note, update Prototype→component bullet |

---

## Task 1: Fix `.gitignore` — exclude agent build artifacts

**Files:**
- Modify: `.gitignore` (repo root)

### Background

`agent/publish/Auditor.Agent.Desktop.exe` is 172 MB and just blocked a GitHub push. The root `.gitignore` has no rules for `.NET` build output. We need to exclude:
- `agent/publish/` — self-contained publish output
- `agent/publish_tmp/` — temp publish staging dir
- `agent/src/**/bin/` — per-project bin directories
- `agent/src/**/obj/` — per-project obj/cache directories
- `agent/Screenshot*.png` — stray screenshot files

We also need to remove the already-indexed copies from the git index (they will stay on disk but stop being tracked).

- [ ] **Step 1: Add rules to `.gitignore`**

Open `.gitignore` and append the following section after the `# Test / coverage` block:

```gitignore
# .NET agent — build output (never commit binaries or obj cache)
agent/publish/
agent/publish_tmp/
agent/src/**/bin/
agent/src/**/obj/
agent/Screenshot*.png
```

- [ ] **Step 2: Remove already-indexed binaries from git index**

Run from repo root (PowerShell or Git Bash):

```bash
git rm --cached -r agent/publish agent/publish_tmp
git rm --cached -r "agent/src/Auditor.Agent.Core/bin" "agent/src/Auditor.Agent.Core/obj"
git rm --cached -r "agent/src/Auditor.Agent.Desktop/bin" "agent/src/Auditor.Agent.Desktop/obj"
git rm --cached -r "agent/src/Auditor.Agent.Shared/bin" "agent/src/Auditor.Agent.Shared/obj" 2>/dev/null || true
```

Expected: many `rm 'agent/publish/...'` lines. Files stay on disk — only removed from git tracking.

- [ ] **Step 3: Verify**

```bash
git status --short | grep "^D " | head -5
git status --short | grep "agent/Screenshot" || echo "screenshot not staged"
```

Expected: staged deletions for `agent/publish/`, `agent/src/**/bin/`, `agent/src/**/obj/` entries. Working-tree files untouched.

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore(git): exclude agent build artifacts from tracking"
```

- [ ] **Step 5: Push and verify no large-file error**

```bash
git push origin main
```

Expected: push succeeds (no GH001 error). The 172 MB `.exe` is no longer in the HEAD tree.

---

## Task 2: Update `AGENTS.md`

**Files:**
- Modify: `AGENTS.md`

### Background

Three sections need updating:

1. **"What this is"** — "We are turning a prototype into production" is stale; the app is built.
2. **"Settled facts"** — missing confirmed: PostgreSQL, Auth.js, Ollama (`qwen3-coder-30b`), deploy target.
3. **"Ask, don't assume"** — DB/LDAP/Ollama/SMTP/MinIO were listed as unknowns; most are now confirmed.
4. **New section: "Development workflow"** — superpowers skill sequence is used on every feature but never documented.
5. **Agent binary rule** — add to "Repo map" / `agent/` entry.

- [ ] **Step 1: Rewrite "What this is" paragraph**

Find the paragraph starting `**Auditor** — a closed-network` and replace it:

```markdown
**Auditor** — a closed-network (air-gapped) cybersecurity-audit management platform, UI in
**Uzbek (Latin)**. The production Next.js + TypeScript app has been built from a Claude-designed
HTML/CSS/JS prototype. The prototype and full spec remain the design truth for any new screens.
```

- [ ] **Step 2: Update `agent/` bullet in "Repo map"**

Find the `agent/` bullet and append the binary rule:

```markdown
- `agent/` — the **.NET 8 WPF desktop agent** (TZ §16). The **one** exception to "code lives in `web/`":
  a native Windows app can't live in the Next.js tree. Its server contract still lives in `web/` under
  `src/app/api/v1/agent/**`. See [ADR-0002](docs/decisions/0002-desktop-agent-scope.md).
  **Never commit `bin/`, `obj/`, or `publish/` directories** — they are excluded by `.gitignore`.
```

- [ ] **Step 3: Add confirmed items to "Settled facts"**

Find `## Settled facts` and append after the existing two bullets:

```markdown
- **Database:** PostgreSQL — local server, database `auditor`. Credentials via `DATABASE_URL` /
  `DIRECT_URL` env vars. See `deploy/.env.production.example`.
- **Auth:** Auth.js (session-based, credentials provider). Secret in `AUTH_SECRET` env var.
- **AI/Ollama:** Local Ollama at `http://127.0.0.1:11434`, model `qwen/qwen3-coder-30b` (configured
  via `OLLAMA_URL` + `OLLAMA_MODEL`). Optional — the app degrades gracefully without it.
- **Deployment:** Linux server, app at `/opt/auditor/web/`. See `deploy/` scripts and
  `deploy/.env.production.example` for the full env var reference.
```

- [ ] **Step 4: Trim "Ask, don't assume" to only truly-open items**

Replace the entire `## Ask, don't assume` section with:

```markdown
## Ask, don't assume

Still **open** — see the ADRs in [docs/decisions/](docs/decisions/):
- Report-export library ([ADR-0003](docs/decisions/0003-reporting-export.md)) — DOCX/PDF library not finalised.
- RLS scoping — row-level security per role not yet wired in Prisma.
- Legacy .NET data migration — whether historical audit data must be imported is unconfirmed.

Surface these rather than guessing.

> Package manager is **npm** here (the handoff docs mention pnpm — ignore that; we use npm).
```

- [ ] **Step 5: Add "Development workflow" section**

Insert this new section after `## Commands (run from \`web/\`)` and before `## Definition of Done`:

```markdown
## Development workflow

All feature work follows this skill sequence in Claude Code:

1. **`/grill-me`** — interview requirements until the design is fully understood
2. **`superpowers:writing-plans`** — produce a task-by-task implementation plan saved to
   `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`
3. **`superpowers:subagent-driven-development`** — execute the plan task-by-task; fresh subagent
   per task + two-stage review (spec compliance → code quality) after each
4. **`superpowers:finishing-a-development-branch`** — final review + push when all tasks complete

The superpowers plugin must be installed (`claude plugin install superpowers`).
```

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md
git commit -m "docs(agents): update settled facts, trim open questions, add workflow section"
```

---

## Task 3: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

### Background

`CLAUDE.md` currently just imports `AGENTS.md` and adds two Claude-specific bullets. The second bullet ("Next.js here is v16...") is still accurate. The first bullet list can get a note about the superpowers workflow since Claude Code is the primary consumer.

- [ ] **Step 1: Replace the Claude-specific notes section**

Replace the entire `## Claude-specific notes` section with:

```markdown
## Claude-specific notes

- Start each task by reading [AGENTS.md](AGENTS.md) and [DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md);
  the app-specific build rules are in [web/AGENTS.md](web/AGENTS.md) (also imported by
  [web/CLAUDE.md](web/CLAUDE.md) when you work inside `web/`).
- `project/` is **read-only** design reference — never edit it. All code goes in `web/`.
- Next.js here is **v16** (newer than training data); consult `web/node_modules/next/dist/docs/`
  before using unfamiliar Next APIs.
- Prefer the dedicated file/search tools, keep changes scoped, and leave the build green
  (`npm run build && npm run lint && npm run typecheck`) before finishing.
- Follow the **Development workflow** in `AGENTS.md` — `/grill-me` → `writing-plans` →
  `subagent-driven-development` → `finishing-a-development-branch` for every feature.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): add workflow reminder to Claude-specific notes"
```

---

## Task 4: Update `web/AGENTS.md`

**Files:**
- Modify: `web/AGENTS.md`

### Background

Three stale statements:

1. Stack line says "Data/Auth/AI arrive in later phases (Prisma+Postgres, Auth.js, Ollama proxy)" — all three are live.
2. "Prototype → component" bullet says "Port `data.js` into typed fixtures now and Prisma seed later" — both are done.
3. Last paragraph mentions a "placeholder home page" and "Phases 2–3" — already replaced.

- [ ] **Step 1: Fix the Stack line**

Find:
```
system (no Tailwind) · `next/font` (self-hosted). Data/Auth/AI arrive in later phases (Prisma+Postgres,
Auth.js, Ollama proxy) — see the plan.
```

Replace with:
```
system (no Tailwind) · `next/font` (self-hosted) · Prisma 5 + PostgreSQL · Auth.js · Ollama proxy
(local, optional).
```

- [ ] **Step 2: Update "Prototype → component" convention bullet**

Find:
```
- **Prototype → component:** translate `screens-*.jsx`/`chrome.jsx` (which use `h(...)`/`React.createElement`)
  into clean JSX. Port `data.js` into typed fixtures now and Prisma seed later. Map `icons.jsx` →
  `lucide-react`.
```

Replace with:
```
- **Prototype → component:** translate `screens-*.jsx`/`chrome.jsx` (which use `h(...)`/`React.createElement`)
  into clean JSX. Fixtures live in `src/lib/fixtures/`; Prisma seed is in `prisma/seed.ts`. Map
  `icons.jsx` → `lucide-react`.
```

- [ ] **Step 3: Remove stale placeholder-page paragraph**

Find and delete the entire final paragraph:
```
The current placeholder home page (`src/app/page.tsx`) and `ThemeToggle` are scaffolding to validate
tokens/fonts/i18n/theming — they get replaced by the real app shell + login in Phases 2–3.
```

- [ ] **Step 4: Commit**

```bash
git add web/AGENTS.md
git commit -m "docs(web/agents): remove stale 'later phases' and placeholder notes"
```

---

## Self-Review

**Spec coverage:**
- ✅ `.gitignore` agent binary rules (Task 1)
- ✅ `git rm --cached` to unblock push (Task 1)
- ✅ "have built" language in AGENTS.md (Task 2)
- ✅ PostgreSQL / Auth.js / Ollama in Settled facts (Task 2)
- ✅ "Ask, don't assume" trimmed to truly open items (Task 2)
- ✅ Superpowers workflow section in AGENTS.md (Task 2)
- ✅ Agent binary rule in Repo map (Task 2)
- ✅ Workflow reminder in CLAUDE.md (Task 3)
- ✅ Stack line updated in web/AGENTS.md (Task 4)
- ✅ Prototype→component bullet updated (Task 4)
- ✅ Placeholder paragraph removed (Task 4)

**Placeholder scan:** No TBD, no vague steps, all content fully specified.

**Consistency:** No type/method names involved — pure documentation edits.
