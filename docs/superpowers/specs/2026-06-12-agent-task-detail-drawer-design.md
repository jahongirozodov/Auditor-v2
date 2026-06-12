# Agent Task Detail Drawer

**Date:** 2026-06-12  
**Scope:** `agent/src/Auditor.Agent.Desktop/wwwroot/app.js` + `app.css`

## What we're building

A slide-in drawer that opens when the user clicks any task card in the agent's task list. Shows task details, related local findings, and quick actions — without leaving the task list view.

## Decisions

| Question | Decision |
|---|---|
| Navigation pattern | Slide-in drawer from right |
| Width | 420px fixed (`min(420px, 100vw)` on small windows) |
| Backdrop | Semi-transparent (`rgba(0,0,0,0.4)`), click to close |
| Trigger | Full card click except Finding/status quick-action buttons |
| Empty findings | Empty state message + inline "Yangi finding qo'shish" button |
| After status change | Drawer stays open, status badge updates in-place + toast |

## Layout

```
[backdrop]              [drawer 420px]
                        ┌──────────────────────┐
                        │  T-023 · [×]          │  ← header row: id + close
                        ├──────────────────────┤
                        │  Network segmentation │  ← title (h2)
                        │  [IN_PROGRESS] HIGH   │  ← status badge + priority
                        │  pentesting · 2026-06-30 │  ← type · due
                        ├──────────────────────┤
                        │  FINDINGLAR (2)       │  ← section heading
                        │  [CRIT] SQL Injection │
                        │  [HIGH] XSS …        │
                        │  ── or ──             │
                        │  (bo'sh empty state)  │
                        │  [+ Yangi finding]    │
                        ├──────────────────────┤
                        │  [+ Finding qo'shish] │  ← always shown
                        │  [Tekshiruvga →]      │  ← status action (if applicable)
                        └──────────────────────┘
```

## Data sources

- **Task fields:** from `cachedTasks` — `Id, Title, Type, Priority, Status, Due, Findings, Files`
- **Findings:** filter findings by `f.taskId === task.id`; call `api.get('/api/findings')` on drawer open (cheap, cached on second call) to avoid dependency on whether the findings page was visited
- No new backend API endpoint required

## Behaviour

### Opening
- Click on task card (anywhere except `[data-tid]` and `[data-sid]` buttons)
- Render drawer HTML into a `<div id="task-drawer">` overlay appended to `<body>`
- CSS: `transform: translateX(100%)` → `translateX(0)` transition 220ms ease-out
- Backdrop: separate `<div id="drawer-backdrop">` inserted before drawer

### Closing
- Click `[×]` close button
- Click backdrop
- CSS reverse transition before DOM removal

### Status change inside drawer
1. User clicks status action button
2. POST `/api/tasks/{id}/status`
3. On success: update `cachedTasks` entry in-place → re-render drawer header status badge → toast
4. Re-render quick-actions panel (new next-step button or hide if terminal)
5. Drawer stays open

### New finding from drawer
1. Click "Yangi finding qo'shish" or empty-state button
2. Close drawer (no animation needed — immediate)
3. `nav('new-finding', { taskId: t.id, taskTitle: t.title })`

## CSS additions (`app.css`)

New classes needed:
- `.drawer-backdrop` — fixed overlay, z-index 200
- `.task-drawer` — fixed right panel, z-index 201, slide animation
- `.drawer-header` — flex row with close button
- `.drawer-section` — labelled section with divider
- `.drawer-finding-row` — compact finding item inside drawer

All colors via existing CSS variables (`--bg-surface`, `--border`, `--text-1`, etc.).  
Animation gated behind `@media (prefers-reduced-motion: no-preference)`.

## Files changed

| File | Change |
|---|---|
| `agent/src/Auditor.Agent.Desktop/wwwroot/app.js` | Add `openTaskDrawer(task)` function + card click handler |
| `agent/src/Auditor.Agent.Desktop/wwwroot/app.css` | Add drawer + backdrop CSS classes |
| `agent/publish/wwwroot/app.js` | Mirror source changes |
| `agent/publish/wwwroot/app.css` | Mirror source changes |

## Out of scope

- Evidence files list in drawer (no per-task evidence API)
- Offline finding sync from drawer (existing sync button handles this)
- Editing task fields (read-only from agent)
